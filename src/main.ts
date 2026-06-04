import {
  GROUT_COLORS,
  MANUFACTURERS,
  MAX_ROOM_HEIGHT_INCHES,
  MAX_ROOM_WIDTH_INCHES,
  MIN_ROOM_HEIGHT_INCHES,
  MIN_ROOM_WIDTH_INCHES,
  SCALE,
  ZOOM_FACTOR,
} from "./constants";
import {
  canvasPoint,
  cellFromPoint,
  clamp,
  initialZoomForRoom,
  layoutRotation,
  normalizeZoom,
  pointInRoom,
  resizeHandleAtPoint,
  roomCenter,
  roomPx,
  roundToHalfInch,
  screenToGridLocal,
} from "./geometry";
import { DROPPER_CURSOR, ERASER_CURSOR, PAINT_ROLLER_CURSOR, traceToolIconPath } from "./icons";
import { colorIdAt, colorOnlyAt, eraseAt, paintKey, placeCross, placeInset, placeStar } from "./model";
import { fillMaterialPath } from "./material";
import { draw, markRenderReady, renderConflictReport } from "./render";
import { loadState, updateUrl, validGroutJoint, validTileInches } from "./state";
import type { AppState, CrossKind, DragInteraction, Mode, PaintShape, Point, ResizeHandle, Tool } from "./types";

const canvas = requiredElement(document.querySelector<HTMLCanvasElement>("#room"), "room canvas");
const workspace = requiredElement(document.querySelector<HTMLElement>(".workspace"), "workspace");
const roomFrame = requiredElement(document.querySelector<HTMLElement>(".room-frame"), "room frame");
const controlPanel = requiredElement(document.querySelector<HTMLElement>("#control-panel"), "control panel");
const modeInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='mode']"));
const gridLayerInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='grid-layer']"));
const tileSizeInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='tile-size']"));
const roomSpec = requiredElement(document.querySelector<HTMLElement>("#room-spec"), "room spec");
const areaEditor = requiredElement(document.querySelector<HTMLDivElement>("#area-editor"), "area editor");
const areaInput = requiredElement(document.querySelector<HTMLInputElement>("#area-input"), "area input");
const areaAcceptButton = requiredElement(document.querySelector<HTMLButtonElement>("#area-accept"), "area accept button");
const areaCancelButton = requiredElement(document.querySelector<HTMLButtonElement>("#area-cancel"), "area cancel button");
const paintShapeInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='paint-shape']"));
const toolInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='tool']"));
const colorPickerTool = requiredElement(document.querySelector<HTMLButtonElement>("#color-picker-tool"), "color picker tool");
const tooltipControls = Array.from(document.querySelectorAll<HTMLElement>(".tool-button, .icon-button, #color-picker-tool"));
const materialToolIcons = Array.from(document.querySelectorAll<HTMLCanvasElement>(".material-tool-icon"));
const mobilePanelButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-mobile-panel-button]"));
const mobileBottomBar = requiredElement(document.querySelector<HTMLElement>(".mobile-bottom-bar"), "mobile bottom bar");
const mobileLayoutIcon = requiredElement(document.querySelector<SVGSVGElement>("#mobile-layout-icon"), "mobile layout icon");
const mobileTileIcon = requiredElement(document.querySelector<HTMLCanvasElement>("#mobile-tile-icon"), "mobile tile icon");
const mobileTileIconCtx = requiredElement(mobileTileIcon.getContext("2d"), "mobile tile icon context");
const mobileGroutIcon = requiredElement(document.querySelector<SVGSVGElement>("#mobile-grout-icon"), "mobile grout icon");
const palette = requiredElement(document.querySelector<HTMLDivElement>("#palette"), "palette");
const groutPalette = requiredElement(document.querySelector<HTMLDivElement>("#grout-palette"), "grout palette");
const groutJointInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='grout-joint']"));
const layoutErrors = requiredElement(document.querySelector<HTMLDivElement>("#layout-errors"), "layout error panel");
const ctx = requiredElement(canvas.getContext("2d"), "canvas 2D context");
const swatchTooltip = document.createElement("div");
swatchTooltip.className = "swatch-tooltip";
document.body.append(swatchTooltip);
const colorToast = document.createElement("div");
colorToast.className = "color-toast";
document.body.append(colorToast);
const gestureBadge = document.createElement("div");
gestureBadge.className = "gesture-badge";
document.body.append(gestureBadge);

type TouchGesture =
  | { type: "pending"; pointerId: number; startClientPoint: Point }
  | { type: "pan"; pointerId: number; startClientPoint: Point; startPan: Point }
  | {
      type: "grab";
      pointerId: number;
      startClientPoint: Point;
      startOffsetXInches: number;
      startOffsetYInches: number;
    }
  | {
      type: "pinch";
      pointerIds: [number, number];
      startDistance: number;
      startZoom: number;
      currentZoom: number;
      baseCanvasLeft: number;
      baseCanvasTop: number;
      anchorRoomPoint: Point;
    };

type MobilePanel = "layout" | "tiles" | "grout";
type NonGrabMode = { tool: Exclude<Tool, "grab">; paintShape: PaintShape | undefined };

let state!: AppState;
let dragInteraction: DragInteraction | undefined;
let touchGesture: TouchGesture | undefined;
let activeMobilePanel: MobilePanel | undefined;
let lastMobilePaintShape: PaintShape | undefined;
let lastMobilePaintColorOnly = false;
let previousNonGrabMode: NonGrabMode | undefined;
let colorToastTimer: number | undefined;
let visualViewportBottomReserve = 0;
let lastDocumentTap:
  | {
      time: number;
      x: number;
      y: number;
    }
  | undefined;
let lastPaintKey = "";
let lastConflictSignature = "";
let renderReadyFrame = 0;
const materialSwatchCache = new Map<string, string>();
const touchPointers = new Map<number, Point>();
const viewportPan: Point = { x: 0, y: 0 };
const TOUCH_DRAG_THRESHOLD_PX = 10;

void start();

async function start(): Promise<void> {
  syncVisualViewportVars();
  state = await loadState(workspace);
  rememberNonGrabMode();
  rememberMobilePaintMode();
  setupCanvas();
  setupControls();
  syncControls();
  render();
}

function setupCanvas(): void {
  const deviceRatio = window.devicePixelRatio || 1;
  const room = roomPx(state);
  canvas.width = Math.round(room.width * deviceRatio);
  canvas.height = Math.round(room.height * deviceRatio);
  canvas.style.width = `${room.width * state.zoom}px`;
  canvas.style.height = `${room.height * state.zoom}px`;
  updateViewportTransform();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(deviceRatio, deviceRatio);
  updateCanvasCursor();
}

function updateViewportTransform(): void {
  roomFrame.style.transform = `translate3d(${viewportPan.x}px, ${viewportPan.y}px, 0)`;
}

function requiredElement<T>(element: T | null, label: string): T {
  if (!element) {
    throw new Error(`Missing required ${label}.`);
  }
  return element;
}

function setupControls(): void {
  tooltipControls.forEach(attachSwatchTooltip);
  setupMobilePanelControls();

  modeInputs.forEach((input) => {
    input.addEventListener("click", () => {
      if (input.checked) {
        switchLayoutMode(input.value as Mode, { autoGrab: !isTouchInterface() });
        updateUrl(state);
        render();
        dismissMobilePanelAfterAction();
      }
    });
  });

  gridLayerInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.showGrid = input.value === "top";
        updateUrl(state);
        render();
        dismissMobilePanelAfterAction();
      }
    });
  });

  tileSizeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.tileInches = validTileInches(input.value) ?? state.tileInches;
        syncSpecs();
        updateUrl(state);
        render();
        dismissMobilePanelAfterAction();
      }
    });
  });

  areaInput.addEventListener("focus", beginAreaEdit);
  areaInput.addEventListener("beforeinput", queueAreaValidation);
  areaInput.addEventListener("input", validateAreaInput);
  areaInput.addEventListener("keyup", validateAreaInput);
  areaInput.addEventListener("change", validateAreaInput);
  areaInput.addEventListener("paste", queueAreaValidation);
  areaInput.addEventListener("compositionend", validateAreaInput);
  areaInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      acceptAreaEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelAreaEdit();
    }
  });
  areaAcceptButton.addEventListener("click", acceptAreaEdit);
  areaCancelButton.addEventListener("click", cancelAreaEdit);

  paintShapeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.tool = "paint";
        state.paintShape = input.value as PaintShape;
        rememberNonGrabMode();
        rememberMobilePaintMode();
        syncInteractionControls();
        updateUrl(state);
        updateCanvasCursor();
        syncPaletteState();
        dismissMobilePanelAfterAction();
      }
    });
  });

  toolInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        if (input.value === "grab") {
          rememberNonGrabMode();
        }
        state.tool = input.value as Tool;
        state.paintShape = undefined;
        rememberNonGrabMode();
        syncInteractionControls();
        updateUrl(state);
        updateCanvasCursor();
        syncPaletteState();
        dismissMobilePanelAfterAction();
      }
    });
  });

  colorPickerTool.addEventListener("click", () => {
    state.tool = "colorPicker";
    state.paintShape = undefined;
    rememberNonGrabMode();
    syncInteractionControls();
    syncPaletteState();
    updateUrl(state);
    updateCanvasCursor();
    dismissMobilePanelAfterAction();
  });

  groutJointInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.groutJointSixteenths = validGroutJoint(input.value) ?? state.groutJointSixteenths;
        renderMobileTabIcons();
        updateUrl(state);
        render();
        dismissMobilePanelAfterAction();
      }
    });
  });

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerCancel);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  workspace.addEventListener("pointerdown", handleWorkspacePointerDown);
  workspace.addEventListener("pointermove", handleWorkspacePointerMove);
  workspace.addEventListener("pointerup", handleWorkspacePointerUp);
  workspace.addEventListener("pointercancel", handleWorkspacePointerCancel);
  document.addEventListener("touchend", preventDoubleTapZoom, { capture: true, passive: false });
  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("resize", scheduleVisualViewportSync);
  window.addEventListener("orientationchange", resetVisualViewportReserve);
  window.addEventListener("focus", resetVisualViewportReserve);
  document.addEventListener("visibilitychange", resetVisualViewportReserve);
  window.addEventListener("focusin", scheduleVisualViewportSync);
  window.addEventListener("focusout", scheduleVisualViewportSync);
  window.addEventListener("pointerdown", scheduleVisualViewportSync, { passive: true });
  window.addEventListener("pointerup", scheduleVisualViewportSync, { passive: true });
  window.addEventListener("touchstart", scheduleVisualViewportSync, { passive: true });
  window.addEventListener("touchend", scheduleVisualViewportSync, { passive: true });
  controlPanel.addEventListener("touchstart", preventControlPinch, { passive: false });
  controlPanel.addEventListener("touchmove", preventControlPinch, { passive: false });
  mobileBottomBar.addEventListener("touchstart", preventControlPinch, { passive: false });
  mobileBottomBar.addEventListener("touchmove", preventControlPinch, { passive: false });
  window.visualViewport?.addEventListener("resize", scheduleVisualViewportSync);
  window.visualViewport?.addEventListener("scroll", scheduleVisualViewportSync);
}

function syncVisualViewportVars(): void {
  if (!document.hasFocus()) {
    return;
  }

  const viewport = window.visualViewport;
  const top = viewport?.offsetTop ?? 0;
  const height = viewport?.height ?? window.innerHeight;
  const layoutHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  const measuredBottom = Math.max(0, layoutHeight - (top + height));
  const isEditingArea = document.activeElement === areaInput;
  const canReserveBottomChrome = measuredBottom > 0 && measuredBottom <= 120;
  if (top > 20) {
    visualViewportBottomReserve = measuredBottom;
  } else if (canReserveBottomChrome && measuredBottom > visualViewportBottomReserve) {
    visualViewportBottomReserve = measuredBottom;
  } else if (measuredBottom === 0 && !isEditingArea) {
    visualViewportBottomReserve = 0;
  }
  const usableMeasuredBottom = measuredBottom <= 120 || isEditingArea ? measuredBottom : 0;
  const bottom = top > 20 ? usableMeasuredBottom : Math.max(usableMeasuredBottom, visualViewportBottomReserve);

  document.documentElement.style.setProperty("--vv-top", `${top}px`);
  document.documentElement.style.setProperty("--vv-bottom", `${bottom}px`);
  document.documentElement.style.setProperty("--vv-height", `${height}px`);
}

function scheduleVisualViewportSync(): void {
  syncVisualViewportVars();
  window.requestAnimationFrame(syncVisualViewportVars);
  window.setTimeout(syncVisualViewportVars, 80);
  window.setTimeout(syncVisualViewportVars, 300);
}

function resetVisualViewportReserve(): void {
  visualViewportBottomReserve = 0;
  scheduleVisualViewportSync();
}

function preventControlPinch(event: TouchEvent): void {
  if (event.touches.length >= 2) {
    event.preventDefault();
  }
}

function preventDoubleTapZoom(event: TouchEvent): void {
  if (event.changedTouches.length !== 1) {
    return;
  }

  const touch = event.changedTouches[0];
  const now = window.performance.now();
  const previous = lastDocumentTap;
  lastDocumentTap = { time: now, x: touch.clientX, y: touch.clientY };

  if (!previous) {
    return;
  }

  const elapsed = now - previous.time;
  const distance = Math.hypot(touch.clientX - previous.x, touch.clientY - previous.y);
  if (elapsed < 350 && distance < 32) {
    event.preventDefault();
  }
}

function setupMobilePanelControls(): void {
  mobilePanelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const panel = mobilePanelFromValue(button.dataset.mobilePanelButton);
      if (!panel) {
        return;
      }
      setActiveMobilePanel(activeMobilePanel === panel ? undefined : panel);
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeMobilePanel) {
      setActiveMobilePanel(undefined);
    }
  });
}

function mobilePanelFromValue(value: string | undefined): MobilePanel | undefined {
  return value === "layout" || value === "tiles" || value === "grout" ? value : undefined;
}

function setActiveMobilePanel(panel: MobilePanel | undefined): void {
  activeMobilePanel = panel;
  controlPanel.dataset.mobileActivePanel = panel ?? "";
  document.body.classList.toggle("mobile-panel-open", panel !== undefined);
  mobilePanelButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.mobilePanelButton === panel));
  });
  scrollMobilePanelAfterOpen(panel);
  hideSwatchTooltip();
}

function scrollMobilePanelAfterOpen(panel: MobilePanel | undefined): void {
  window.requestAnimationFrame(() => {
    if (activeMobilePanel !== panel) {
      return;
    }
    if (panel === "tiles") {
      controlPanel.scrollTop = controlPanel.scrollHeight;
    } else {
      controlPanel.scrollTop = 0;
    }
  });
}

function dismissMobilePanelAfterAction(): void {
  if (activeMobilePanel) {
    setActiveMobilePanel(undefined);
  }
}

function switchLayoutMode(nextMode: Mode, options: { autoGrab: boolean } = { autoGrab: true }): void {
  if (state.mode !== nextMode) {
    const center = roomCenter(state);
    const localCenterBefore = screenToGridLocal(state, center);
    state.mode = nextMode;
    const angle = layoutRotation(state);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotatedCenter = {
      x: localCenterBefore.x * cos - localCenterBefore.y * sin,
      y: localCenterBefore.x * sin + localCenterBefore.y * cos,
    };
    state.offsetXInches = roundToHalfInch(-rotatedCenter.x / SCALE);
    state.offsetYInches = roundToHalfInch(-rotatedCenter.y / SCALE);
  }

  if (options.autoGrab) {
    rememberNonGrabMode();
    state.tool = "grab";
    state.paintShape = undefined;
  }
  syncModeClass();
  syncInteractionControls();
  renderToolIcons();
  syncPaletteState();
  updateCanvasCursor();
}

function syncControls(): void {
  syncModeClass();
  modeInputs.forEach((input) => {
    input.checked = input.value === state.mode;
  });
  gridLayerInputs.forEach((input) => {
    input.checked = input.value === (state.showGrid ? "top" : "under");
  });
  tileSizeInputs.forEach((input) => {
    input.checked = Number(input.value) === state.tileInches;
  });
  syncInteractionControls();
  renderToolIcons();
  renderPalette();
  renderGroutPalette();
  syncGroutControls();
  syncSpecs();
  updateCanvasCursor();
  renderMobileTabIcons();
}

function syncInteractionControls(): void {
  paintShapeInputs.forEach((input) => {
    input.checked = state.tool === "paint" && input.value === state.paintShape;
  });
  toolInputs.forEach((input) => {
    input.checked = input.value === state.tool;
  });
  renderMobileTabIcons();
}

function isTouchInterface(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

function syncSpecs(): void {
  const text = areaText(state.roomWidthInches, state.roomHeightInches);
  roomSpec.textContent = text;
  if (!areaEditor.classList.contains("is-editing")) {
    areaInput.value = text;
  }
  validateAreaInput();
}

function syncModeClass(): void {
  document.body.classList.toggle("mode-diagonal", state.mode === "diagonal");
}

function beginAreaEdit(): void {
  areaEditor.classList.add("is-editing");
  validateAreaInput();
  areaInput.select();
}

function acceptAreaEdit(): void {
  const parsed = parseAreaInput(areaInput.value);
  if (!parsed) {
    validateAreaInput();
    return;
  }

  state.roomWidthInches = parsed.width;
  state.roomHeightInches = parsed.height;
  areaEditor.classList.remove("is-editing");
  syncSpecs();
  areaInput.blur();
  zoomOutToFitRoomIfNeeded();
  setupCanvas();
  updateUrl(state);
  render();
  dismissMobilePanelAfterAction();
}

function cancelAreaEdit(): void {
  areaEditor.classList.remove("is-editing");
  areaInput.value = areaText(state.roomWidthInches, state.roomHeightInches);
  validateAreaInput();
  areaInput.blur();
  dismissMobilePanelAfterAction();
}

function validateAreaInput(): void {
  const isValid = parseAreaInput(areaInput.value) !== undefined;
  areaAcceptButton.disabled = !isValid;
  areaAcceptButton.setAttribute("aria-disabled", String(!isValid));
}

function parseAreaInput(value: string): { width: number; height: number } | undefined {
  const dimensions = parseAreaDimensions(value);
  if (!dimensions) {
    return undefined;
  }

  const [width, height] = dimensions;
  if (
    width < MIN_ROOM_WIDTH_INCHES ||
    width > MAX_ROOM_WIDTH_INCHES ||
    height < MIN_ROOM_HEIGHT_INCHES ||
    height > MAX_ROOM_HEIGHT_INCHES
  ) {
    return undefined;
  }

  return { width, height };
}

function parseAreaDimensions(value: string): [number, number] | undefined {
  const normalized = value
    .trim()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[′]/g, "'")
    .replace(/[″]/g, '"')
    .replace(/[×]/g, "x");

  const xParts = normalized.split(/\s*x\s*/i).filter((part) => part.trim() !== "");
  if (xParts.length === 2) {
    return parseDimensionPair(xParts[0], xParts[1]);
  }

  const footMatches = normalized.match(/\d+\s*(?:'|ft\b)\s*\d*\s*(?:"|in\b)?/gi);
  if (footMatches?.length === 2) {
    return parseDimensionPair(footMatches[0], footMatches[1]);
  }

  const inchMatches = normalized.match(/\d+/g);
  if (inchMatches?.length === 2) {
    return parseDimensionPair(inchMatches[0], inchMatches[1]);
  }

  return undefined;
}

function parseDimensionPair(first: string, second: string): [number, number] | undefined {
  const width = parseAreaDimension(first);
  const height = parseAreaDimension(second);
  return width !== undefined && height !== undefined ? [width, height] : undefined;
}

function parseAreaDimension(value: string): number | undefined {
  const trimmed = value.trim();
  const feetMatch = trimmed.match(/^(\d+)\s*(?:'|ft\b)\s*(\d*)\s*(?:"|in\b)?$/i);
  if (feetMatch) {
    const feet = Number(feetMatch[1]);
    const inches = feetMatch[2] === "" ? 0 : Number(feetMatch[2]);
    if (!Number.isInteger(feet) || !Number.isInteger(inches) || inches < 0 || inches >= 12) {
      return undefined;
    }
    return feet * 12 + inches;
  }

  const inchesMatch = trimmed.match(/^(\d+)\s*(?:"|in\b)?$/i);
  if (!inchesMatch) {
    return undefined;
  }

  const inches = Number(inchesMatch[1]);
  return Number.isInteger(inches) ? inches : undefined;
}

function queueAreaValidation(): void {
  window.requestAnimationFrame(validateAreaInput);
}

function areaText(width: number, height: number): string {
  return `${dimensionText(width)} x ${dimensionText(height)}`;
}

function dimensionText(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainder = inches % 12;
  return `${feet}'${remainder}"`;
}

function zoomOutToFitRoomIfNeeded(): void {
  const room = roomPx(state);
  const displayWidth = room.width * state.zoom;
  const displayHeight = room.height * state.zoom;
  const availableWidth = Math.max(1, workspace.clientWidth - workspacePadding("left") - workspacePadding("right"));
  const availableHeight = Math.max(1, workspace.clientHeight - workspacePadding("top") - workspacePadding("bottom"));
  if (displayWidth <= availableWidth && displayHeight <= availableHeight) {
    return;
  }

  state.zoom = Math.min(state.zoom, initialZoomForRoom(workspace, state.roomWidthInches, state.roomHeightInches));
  viewportPan.x = 0;
  viewportPan.y = 0;
  workspace.scrollLeft = 0;
  workspace.scrollTop = 0;
  updateViewportTransform();
}

function workspacePadding(side: "left" | "right" | "top" | "bottom"): number {
  const style = getComputedStyle(workspace);
  if (side === "left") return Number.parseFloat(style.paddingLeft);
  if (side === "right") return Number.parseFloat(style.paddingRight);
  if (side === "top") return Number.parseFloat(style.paddingTop);
  return Number.parseFloat(style.paddingBottom);
}

function renderPalette(): void {
  palette.innerHTML = "";
  palette.classList.toggle("is-picking", state.tool === "colorPicker");
  colorPickerTool.setAttribute("aria-pressed", String(state.tool === "colorPicker"));

  for (const manufacturer of MANUFACTURERS) {
    const marker = document.createElement("div");
    marker.className = "palette-manufacturer";
    marker.dataset.tooltip = manufacturer.name;
    marker.dataset.mobileLabel = manufacturer.name;
    marker.textContent = manufacturer.name.slice(0, 1);
    attachSwatchTooltip(marker);
    palette.append(marker);

    for (const color of manufacturer.colors) {
      const swatch = document.createElement("button");
      swatch.className = "swatch";
      swatch.type = "button";
      swatch.style.backgroundColor = color.value;
      swatch.style.backgroundImage = materialSwatchBackground(color.id);
      swatch.dataset.colorId = color.id;
      const label = materialTooltipText(manufacturer.id, color.id) ?? color.name;
      swatch.dataset.tooltip = label;
      swatch.setAttribute("aria-label", label);
      swatch.addEventListener("click", () => {
        const clickedCurrentPaintColor = state.tool === "paint" && state.paintShape !== undefined && state.colorId === color.id;
        selectColor(manufacturer.id, color.id);
        showColorToast(label);
        if (clickedCurrentPaintColor || state.tool !== "paint" || !state.paintShape) {
          switchToPaintColorOnly();
        } else {
          rememberMobilePaintMode();
        }
        syncInteractionControls();
        syncPaletteState();
        updateUrl(state);
        updateCanvasCursor();
        dismissMobilePanelAfterAction();
      });
      attachSwatchTooltip(swatch);
      palette.append(swatch);
    }
  }
  syncPaletteState();
}

function syncPaletteState(): void {
  palette.classList.toggle("is-picking", state.tool === "colorPicker");
  colorPickerTool.setAttribute("aria-pressed", String(state.tool === "colorPicker"));

  for (const swatch of Array.from(palette.querySelectorAll<HTMLButtonElement>(".swatch"))) {
    swatch.setAttribute("aria-pressed", String(state.tool === "paint" && swatch.dataset.colorId === state.colorId));
    swatch.style.cursor = state.tool === "colorPicker" ? DROPPER_CURSOR : "";
  }
}

function selectColor(manufacturerId: string, colorId: string): void {
  state.manufacturerId = manufacturerId;
  state.colorId = colorId;
  renderToolIcons();
  renderMobileTabIcons();
}

function renderToolIcons(): void {
  for (const icon of materialToolIcons) {
    const shape = icon.dataset.toolShape as PaintShape | undefined;
    if (!shape) {
      continue;
    }

    const iconCtx = requiredElement(icon.getContext("2d"), "tool icon canvas context");
    iconCtx.clearRect(0, 0, icon.width, icon.height);
    traceToolIconPath(iconCtx, shape, state.mode);
    fillMaterialPath(iconCtx, state.colorId, `tool-icon:${shape}:${state.colorId}`, { x: 0, y: 0, width: icon.width, height: icon.height });
    traceToolIconPath(iconCtx, shape, state.mode);
    iconCtx.lineWidth = 2;
    iconCtx.strokeStyle = "#050505";
    iconCtx.stroke();
  }
  renderMobileTabIcons();
}

function rememberMobilePaintMode(): void {
  if (state.tool !== "paint") {
    return;
  }
  if (state.paintShape) {
    lastMobilePaintShape = state.paintShape;
    lastMobilePaintColorOnly = false;
  } else {
    lastMobilePaintColorOnly = true;
  }
}

function rememberNonGrabMode(): void {
  if (!state || state.tool === "grab") {
    return;
  }
  previousNonGrabMode = {
    tool: state.tool,
    paintShape: state.tool === "paint" ? state.paintShape : undefined,
  };
}

function restoreNonGrabModeAfterTouchGrab(): void {
  const mode = previousNonGrabMode ?? { tool: "paint" as const, paintShape: undefined };
  state.tool = mode.tool;
  state.paintShape = mode.tool === "paint" ? mode.paintShape : undefined;
  rememberMobilePaintMode();
  syncInteractionControls();
  syncPaletteState();
  updateCanvasCursor();
  updateUrl(state);
}

function renderMobileTabIcons(): void {
  renderMobileLayoutIcon();
  renderMobileTilePreview();
  renderMobileGroutIcon();
}

function renderMobileLayoutIcon(): void {
  if (state.tool === "grab") {
    mobileLayoutIcon.innerHTML = `<path d="M15 25V14a4 4 0 0 1 8 0v10-13a4 4 0 0 1 8 0v13-9a4 4 0 0 1 8 0v16c0 8-6 13-14 13h-3c-6 0-10-3-13-8l-4-7a4 4 0 0 1 7-4l3 5z"/>`;
    return;
  }

  mobileLayoutIcon.innerHTML =
    state.mode === "diagonal"
      ? `<path d="M42 9 9 42M30 6 6 30M42 21 21 42M18 6 6 18M42 33 33 42M9 9l33 33M21 6l21 21M6 21l21 21M33 6l9 9M6 33l9 9"/>`
      : `<path d="M13 7v34M24 7v34M35 7v34M7 13h34M7 24h34M7 35h34"/>`;
}

function renderMobileTilePreview(): void {
  mobileTileIconCtx.clearRect(0, 0, mobileTileIcon.width, mobileTileIcon.height);

  if (state.tool === "erase") {
    traceMobileEraserIcon(mobileTileIconCtx);
  } else if (state.tool === "colorPicker") {
    traceMobileDropperIcon(mobileTileIconCtx);
  } else if (state.tool === "paint") {
    if (state.paintShape) {
      traceMobileMaterialShape(mobileTileIconCtx, state.paintShape, "mobile-tab");
    } else {
      traceMobileMaterialSquare(mobileTileIconCtx, "mobile-tab:color-only");
    }
  } else if (lastMobilePaintColorOnly || !lastMobilePaintShape) {
    traceMobileMaterialSquare(mobileTileIconCtx, "mobile-tab:last-color-only");
  } else {
    traceMobileMaterialShape(mobileTileIconCtx, lastMobilePaintShape, "mobile-tab:last-shape");
  }
}

function renderMobileGroutIcon(): void {
  const strokeWidth = Math.max(1, Math.min(8, state.groutJointSixteenths));
  const path = state.mode === "diagonal" ? "M12 12 36 36M36 12 12 36" : "M24 8v32M8 24h32";
  mobileGroutIcon.innerHTML = `<path d="${path}" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke"/>`;
}

function traceMobileMaterialShape(ctx: CanvasRenderingContext2D, shape: PaintShape, seed: string): void {
  ctx.save();
  traceToolIconPath(ctx, shape, state.mode);
  fillMaterialPath(ctx, state.colorId, `${seed}:${shape}:${state.colorId}`, { x: 0, y: 0, width: 100, height: 100 });
  traceToolIconPath(ctx, shape, state.mode);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#050505";
  ctx.stroke();
  ctx.restore();
}

function traceMobileMaterialSquare(ctx: CanvasRenderingContext2D, seed: string): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(18, 18, 64, 64);
  fillMaterialPath(ctx, state.colorId, `${seed}:${state.colorId}`, { x: 18, y: 18, width: 64, height: 64 });
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#050505";
  ctx.strokeRect(18, 18, 64, 64);
  ctx.restore();
}

function traceMobileEraserIcon(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = "#34302b";
  ctx.strokeStyle = "#34302b";
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(14, 63);
  ctx.lineTo(55, 22);
  ctx.lineTo(79, 46);
  ctx.lineTo(48, 77);
  ctx.lineTo(28, 77);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(29, 78);
  ctx.lineTo(78, 78);
  ctx.stroke();
  ctx.restore();
}

function traceMobileDropperIcon(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.translate(50, 50);
  ctx.rotate(Math.PI / 4);
  ctx.translate(-50, -50);
  ctx.fillStyle = "#34302b";
  ctx.strokeStyle = "#34302b";
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(38, 18);
  ctx.bezierCurveTo(38, 7, 50, 0, 50, 0);
  ctx.bezierCurveTo(50, 0, 62, 7, 62, 18);
  ctx.bezierCurveTo(62, 27, 57, 34, 50, 34);
  ctx.bezierCurveTo(43, 34, 38, 27, 38, 18);
  ctx.fill();
  ctx.strokeRect(44, 33, 12, 42);
  ctx.beginPath();
  ctx.moveTo(44, 75);
  ctx.lineTo(56, 75);
  ctx.lineTo(50, 92);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function materialTooltipText(manufacturerId: string, colorId: string): string | undefined {
  const manufacturer = MANUFACTURERS.find((candidate) => candidate.id === manufacturerId);
  const color = manufacturer?.colors.find((candidate) => candidate.id === colorId);
  if (!manufacturer || !color) {
    return undefined;
  }

  return `${color.name}\n(${color.texture.replaceAll("_", " ")})\nby ${manufacturer.name}`;
}

function materialTooltipTextForColor(colorId: string): string | undefined {
  const manufacturer = MANUFACTURERS.find((candidate) => candidate.colors.some((color) => color.id === colorId));
  return manufacturer ? materialTooltipText(manufacturer.id, colorId) : undefined;
}

function switchToPaintColorOnly(): void {
  state.tool = "paint";
  state.paintShape = undefined;
  rememberNonGrabMode();
  rememberMobilePaintMode();
  syncInteractionControls();
  updateCanvasCursor();
}

function materialSwatchBackground(colorId: string): string {
  const cached = materialSwatchCache.get(colorId);
  if (cached) {
    return cached;
  }

  const size = 64;
  const swatchCanvas = document.createElement("canvas");
  swatchCanvas.width = size;
  swatchCanvas.height = size;
  const swatchCtx = requiredElement(swatchCanvas.getContext("2d"), "swatch canvas context");
  swatchCtx.beginPath();
  swatchCtx.rect(0, 0, size, size);
  fillMaterialPath(swatchCtx, colorId, `swatch:${colorId}`, { x: 0, y: 0, width: size, height: size });
  const image = `url(${swatchCanvas.toDataURL("image/png")})`;
  materialSwatchCache.set(colorId, image);
  return image;
}

function renderGroutPalette(): void {
  groutPalette.innerHTML = "";
  for (const groutColor of GROUT_COLORS) {
    const swatch = document.createElement("button");
    swatch.className = "swatch";
    swatch.type = "button";
    swatch.style.background = groutColor.value;
    swatch.dataset.tooltip = groutColor.name;
    swatch.setAttribute("aria-label", groutColor.name);
    swatch.setAttribute("aria-pressed", String(groutColor.id === state.groutColorId));
    swatch.addEventListener("click", () => {
      state.groutColorId = groutColor.id;
      renderGroutPalette();
      renderMobileTabIcons();
      updateUrl(state);
      render();
      dismissMobilePanelAfterAction();
    });
    attachSwatchTooltip(swatch);
    groutPalette.append(swatch);
  }
}

function attachSwatchTooltip(swatch: HTMLElement): void {
  swatch.addEventListener("mouseenter", () => showSwatchTooltip(swatch));
  swatch.addEventListener("mouseleave", hideSwatchTooltip);
  swatch.addEventListener("focus", () => showSwatchTooltip(swatch));
  swatch.addEventListener("blur", hideSwatchTooltip);
}

function showSwatchTooltip(swatch: HTMLElement): void {
  const text = swatch.dataset.tooltip;
  if (!text) {
    return;
  }

  const rect = swatch.getBoundingClientRect();
  swatchTooltip.textContent = text;
  swatchTooltip.style.left = `${rect.right - 4}px`;
  swatchTooltip.style.top = `${rect.top + 4}px`;
  swatchTooltip.classList.add("is-visible");
}

function hideSwatchTooltip(): void {
  swatchTooltip.classList.remove("is-visible");
}

function showColorToast(text: string): void {
  const workspaceRect = workspace.getBoundingClientRect();
  colorToast.textContent = text;
  colorToast.style.left = `${workspaceRect.left + workspaceRect.width / 2}px`;
  colorToast.style.top = `${Math.max(12, visualViewportTop() + 18)}px`;
  colorToast.classList.remove("is-visible");
  void colorToast.offsetWidth;
  colorToast.classList.add("is-visible");

  if (colorToastTimer !== undefined) {
    window.clearTimeout(colorToastTimer);
  }
  colorToastTimer = window.setTimeout(() => {
    colorToast.classList.remove("is-visible");
    colorToastTimer = undefined;
  }, 2000);
}

function showCanvasPickTooltip(event: PointerEvent): void {
  if (state.tool !== "colorPicker") {
    hideSwatchTooltip();
    return;
  }

  const point = canvasPoint(state, canvas, event);
  if (!point || !pointInRoom(state, point)) {
    hideSwatchTooltip();
    return;
  }

  const cell = cellFromPoint(state, point);
  const colorId = colorIdAt(state, point, cell.col, cell.row);
  const label = colorId ? materialTooltipTextForColor(colorId) : undefined;
  if (!label) {
    hideSwatchTooltip();
    return;
  }

  swatchTooltip.textContent = label;
  swatchTooltip.style.left = `${event.clientX + 12}px`;
  swatchTooltip.style.top = `${event.clientY - 2}px`;
  swatchTooltip.classList.add("is-visible");
}

function syncGroutControls(): void {
  groutJointInputs.forEach((input) => {
    input.checked = Number(input.value) === state.groutJointSixteenths;
  });
  renderMobileTabIcons();
}

function handlePointerDown(event: PointerEvent): void {
  if (event.pointerType === "touch") {
    return;
  }

  lastPaintKey = "";
  canvas.setPointerCapture(event.pointerId);
  const point = canvasPoint(state, canvas, event);
  if (!point || !pointInRoom(state, point)) {
    return;
  }

  const resizeHandle = resizeHandleAtPoint(state, point);
  if (resizeHandle) {
    dragInteraction = {
      type: "resizeRoom",
      pointerId: event.pointerId,
      handle: resizeHandle,
      startClientPoint: { x: event.clientX, y: event.clientY },
      startWidthInches: state.roomWidthInches,
      startHeightInches: state.roomHeightInches,
    };
    updateCanvasCursor(point);
    return;
  }

  if (state.tool === "grab") {
    dragInteraction = {
      type: "grab",
      pointerId: event.pointerId,
      startPoint: { x: event.clientX, y: event.clientY },
      startOffsetXInches: state.offsetXInches,
      startOffsetYInches: state.offsetYInches,
    };
    updateCanvasCursor(point);
    return;
  }

  if (state.tool === "colorPicker") {
    pickColorFromPointer(point);
    hideSwatchTooltip();
    return;
  }

  dragInteraction = { type: "paint", pointerId: event.pointerId };
  paintFromPointer(event);
}

function handlePointerMove(event: PointerEvent): void {
  if (event.pointerType === "touch") {
    return;
  }

  if (!dragInteraction) {
    showCanvasPickTooltip(event);
    updateCanvasCursor(canvasPoint(state, canvas, event));
    return;
  }

  if (dragInteraction.pointerId !== event.pointerId) {
    return;
  }

  if (dragInteraction.type === "paint") {
    paintFromPointer(event);
  } else if (dragInteraction.type === "grab") {
    moveGridFromPointer(event, dragInteraction);
  } else {
    resizeRoomFromPointer(event, dragInteraction);
  }
}

function handlePointerUp(event: PointerEvent): void {
  if (event.pointerType === "touch") {
    return;
  }

  lastPaintKey = "";
  if (dragInteraction?.pointerId === event.pointerId) {
    dragInteraction = undefined;
    updateUrl(state);
    updateCanvasCursor(canvasPoint(state, canvas, event));
  }
  canvas.releasePointerCapture(event.pointerId);
}

function handlePointerCancel(event: PointerEvent): void {
  if (event.pointerType === "touch") {
    return;
  }

  lastPaintKey = "";
  if (dragInteraction?.pointerId === event.pointerId) {
    dragInteraction = undefined;
    updateCanvasCursor();
  }
  hideSwatchTooltip();
}

function handlePointerLeave(event: PointerEvent): void {
  if (event.pointerType === "touch") {
    return;
  }

  if (!dragInteraction) {
    updateCanvasCursor(canvasPoint(state, canvas, event));
  }
  hideSwatchTooltip();
}

function handleWorkspacePointerDown(event: PointerEvent): void {
  if (event.pointerType === "touch") {
    handleTouchPointerDown(event);
  }
}

function handleWorkspacePointerMove(event: PointerEvent): void {
  if (event.pointerType === "touch") {
    handleTouchPointerMove(event);
  }
}

function handleWorkspacePointerUp(event: PointerEvent): void {
  if (event.pointerType === "touch") {
    handleTouchPointerUp(event);
  }
}

function handleWorkspacePointerCancel(event: PointerEvent): void {
  if (event.pointerType === "touch") {
    handleTouchPointerCancel(event);
  }
}

function handleTouchPointerDown(event: PointerEvent): void {
  event.preventDefault();
  hideSwatchTooltip();
  lastPaintKey = "";
  workspace.setPointerCapture(event.pointerId);
  touchPointers.set(event.pointerId, clientPoint(event));

  if (touchPointers.size >= 2) {
    beginPinchGesture();
    return;
  }

  touchGesture = { type: "pending", pointerId: event.pointerId, startClientPoint: clientPoint(event) };
}

function handleTouchPointerMove(event: PointerEvent): void {
  event.preventDefault();
  touchPointers.set(event.pointerId, clientPoint(event));

  if (touchGesture?.type === "pinch") {
    updatePinchGesture();
    return;
  }

  if (touchPointers.size >= 2) {
    beginPinchGesture();
    return;
  }

  if (!touchGesture || touchGesture.pointerId !== event.pointerId) {
    return;
  }

  const currentPoint = clientPoint(event);
  const movement = distanceBetween(currentPoint, touchGesture.startClientPoint);

  if (touchGesture.type === "pending") {
    if (movement < TOUCH_DRAG_THRESHOLD_PX) {
      return;
    }

    if (state.tool === "grab") {
      touchGesture = {
        type: "grab",
        pointerId: event.pointerId,
        startClientPoint: touchGesture.startClientPoint,
        startOffsetXInches: state.offsetXInches,
        startOffsetYInches: state.offsetYInches,
      };
      moveGridFromTouch(currentPoint, touchGesture);
    } else {
      touchGesture = {
        type: "pan",
        pointerId: event.pointerId,
        startClientPoint: touchGesture.startClientPoint,
        startPan: { ...viewportPan },
      };
      panViewportFromTouch(currentPoint, touchGesture);
    }
    return;
  }

  if (touchGesture.type === "pan") {
    panViewportFromTouch(currentPoint, touchGesture);
  } else if (touchGesture.type === "grab") {
    moveGridFromTouch(currentPoint, touchGesture);
  }
}

function handleTouchPointerUp(event: PointerEvent): void {
  event.preventDefault();
  const finalClientPoint = clientPoint(event);
  const activeGesture = touchGesture;

  touchPointers.delete(event.pointerId);
  workspace.releasePointerCapture(event.pointerId);

  if (activeGesture?.type === "pending" && activeGesture.pointerId === event.pointerId) {
    const point = canvasPoint(state, canvas, event);
    if (point && pointInRoom(state, point) && state.tool !== "grab") {
      if (state.tool === "colorPicker") {
        pickColorFromPointer(point);
      } else {
        paintAtPoint(point);
      }
    }
  } else if (activeGesture?.type === "grab" && activeGesture.pointerId === event.pointerId) {
    moveGridFromTouch(finalClientPoint, activeGesture);
    updateUrl(state);
    hideGestureBadge();
    restoreNonGrabModeAfterTouchGrab();
  }

  if (activeGesture?.type === "pinch") {
    finalizePinchGesture(activeGesture);
    touchGesture = undefined;
  } else if (touchPointers.size === 0 || activeGesture?.pointerId === event.pointerId) {
    touchGesture = undefined;
  }
}

function handleTouchPointerCancel(event: PointerEvent): void {
  event.preventDefault();
  const activeGesture = touchGesture;
  touchPointers.delete(event.pointerId);
  if (activeGesture?.type === "pinch") {
    finalizePinchGesture(activeGesture);
    touchGesture = undefined;
    hideGestureBadge();
  } else if (activeGesture?.pointerId === event.pointerId || touchPointers.size === 0) {
    touchGesture = undefined;
    hideGestureBadge();
  }
  hideSwatchTooltip();
}

function beginPinchGesture(): void {
  const pointers = Array.from(touchPointers.entries()).slice(0, 2);
  if (pointers.length < 2) {
    return;
  }

  hideGestureBadge();
  const first = pointers[0];
  const second = pointers[1];
  const center = midpoint(first[1], second[1]);
  const rect = canvas.getBoundingClientRect();
  const room = roomPx(state);
  touchGesture = {
    type: "pinch",
    pointerIds: [first[0], second[0]],
    startDistance: Math.max(1, distanceBetween(first[1], second[1])),
    startZoom: state.zoom,
    currentZoom: state.zoom,
    baseCanvasLeft: rect.left - viewportPan.x,
    baseCanvasTop: rect.top - viewportPan.y,
    anchorRoomPoint: {
      x: ((center.x - rect.left) / rect.width) * room.width,
      y: ((center.y - rect.top) / rect.height) * room.height,
    },
  };
}

function updatePinchGesture(): void {
  if (touchGesture?.type !== "pinch") {
    return;
  }

  const first = touchPointers.get(touchGesture.pointerIds[0]);
  const second = touchPointers.get(touchGesture.pointerIds[1]);
  if (!first || !second) {
    return;
  }

  const center = midpoint(first, second);
  const nextZoom = normalizeZoom((touchGesture.startZoom * distanceBetween(first, second)) / touchGesture.startDistance);
  const room = roomPx(state);
  touchGesture.currentZoom = nextZoom;
  canvas.style.width = `${room.width * nextZoom}px`;
  canvas.style.height = `${room.height * nextZoom}px`;

  viewportPan.x = center.x - touchGesture.baseCanvasLeft - touchGesture.anchorRoomPoint.x * nextZoom;
  viewportPan.y = center.y - touchGesture.baseCanvasTop - touchGesture.anchorRoomPoint.y * nextZoom;
  updateViewportTransform();
}

function finalizePinchGesture(gesture: Extract<TouchGesture, { type: "pinch" }>): void {
  state.zoom = gesture.currentZoom;
  setupCanvas();
  render();
}

function panViewportFromTouch(currentPoint: Point, gesture: Extract<TouchGesture, { type: "pan" }>): void {
  viewportPan.x = gesture.startPan.x + currentPoint.x - gesture.startClientPoint.x;
  viewportPan.y = gesture.startPan.y + currentPoint.y - gesture.startClientPoint.y;
  updateViewportTransform();
}

function moveGridFromTouch(currentPoint: Point, gesture: Extract<TouchGesture, { type: "grab" }>): void {
  state.offsetXInches = roundToHalfInch(gesture.startOffsetXInches + (currentPoint.x - gesture.startClientPoint.x) / (SCALE * state.zoom));
  state.offsetYInches = roundToHalfInch(gesture.startOffsetYInches + (currentPoint.y - gesture.startClientPoint.y) / (SCALE * state.zoom));
  showGestureBadge(grabDeltaText(state.offsetXInches - gesture.startOffsetXInches, state.offsetYInches - gesture.startOffsetYInches));
  updateUrl(state);
  render();
}

function clientPoint(event: PointerEvent): Point {
  return { x: event.clientX, y: event.clientY };
}

function midpoint(first: Point, second: Point): Point {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}

function distanceBetween(first: Point, second: Point): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function handleWheel(event: WheelEvent): void {
  event.preventDefault();
  const canvasRect = canvas.getBoundingClientRect();
  const workspaceRect = workspace.getBoundingClientRect();
  const anchorX = workspaceRect.left + workspace.clientWidth / 2 - canvasRect.left;
  const anchorY = workspaceRect.top + workspace.clientHeight / 2 - canvasRect.top;
  const previousZoom = state.zoom;
  const nextZoom = normalizeZoom(previousZoom * (event.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR));

  if (nextZoom === previousZoom) {
    return;
  }

  state.zoom = nextZoom;
  setupCanvas();
  render();

  const scale = nextZoom / previousZoom;
  workspace.scrollLeft += anchorX * (scale - 1);
  workspace.scrollTop += anchorY * (scale - 1);
  updateUrl(state);
}

function paintFromPointer(event: PointerEvent): void {
  const point = canvasPoint(state, canvas, event);
  if (!point || !pointInRoom(state, point)) {
    return;
  }

  paintAtPoint(point);
}

function paintAtPoint(point: Point): void {
  if (!pointInRoom(state, point)) {
    return;
  }

  const cell = cellFromPoint(state, point);
  const key = paintKey(state, point, cell.col, cell.row);
  if (key === lastPaintKey) {
    return;
  }
  lastPaintKey = key;

  if (state.tool === "erase") {
    eraseAt(state, point, cell.col, cell.row);
  } else if (state.tool === "paint" && !state.paintShape) {
    colorOnlyAt(state, point, cell.col, cell.row, state.colorId);
  } else if (state.tool !== "paint" || !state.paintShape) {
    return;
  } else if (state.paintShape === "orthogonalCross" || state.paintShape === "diagonalCross") {
    placeCross(state, cell.col, cell.row, crossKindForPaintShape(state.paintShape), state.colorId);
  } else if (state.paintShape === "star") {
    placeStar(state, cell.col, cell.row, state.colorId);
  } else {
    placeInset(state, point, cell.col, cell.row, state.colorId);
  }

  updateUrl(state);
  render();
}

function crossKindForPaintShape(shape: Extract<PaintShape, CrossKind>): CrossKind {
  if (state.mode !== "diagonal") {
    return shape;
  }
  return shape === "orthogonalCross" ? "diagonalCross" : "orthogonalCross";
}

function pickColorFromPointer(point: Point): void {
  const cell = cellFromPoint(state, point);
  const colorId = colorIdAt(state, point, cell.col, cell.row);
  if (!colorId) {
    return;
  }

  selectColor(manufacturerIdForColor(colorId), colorId);
  const label = materialTooltipTextForColor(colorId);
  if (label) {
    showColorToast(label);
  }
  switchToPaintColorOnly();
  syncPaletteState();
  updateUrl(state);
}

function manufacturerIdForColor(colorId: string): string {
  return MANUFACTURERS.find((manufacturer) => manufacturer.colors.some((color) => color.id === colorId))?.id ?? state.manufacturerId;
}

function updateCanvasCursor(point?: Point): void {
  if (dragInteraction?.type === "grab") {
    canvas.style.cursor = "grabbing";
    return;
  }
  if (dragInteraction?.type === "resizeRoom") {
    canvas.style.cursor = resizeCursor(dragInteraction.handle);
    return;
  }

  const handle = point && pointInRoom(state, point) ? resizeHandleAtPoint(state, point) : undefined;
  if (handle) {
    canvas.style.cursor = resizeCursor(handle);
  } else if (state.tool === "grab") {
    canvas.style.cursor = "grab";
  } else if (state.tool === "colorPicker") {
    canvas.style.cursor = DROPPER_CURSOR;
  } else if (state.tool === "erase") {
    canvas.style.cursor = ERASER_CURSOR;
  } else if (state.tool === "paint" && !state.paintShape) {
    canvas.style.cursor = PAINT_ROLLER_CURSOR;
  } else {
    canvas.style.cursor = "crosshair";
  }
}

function resizeCursor(handle: ResizeHandle): string {
  if (handle === "right") {
    return "ew-resize";
  }
  if (handle === "bottom") {
    return "ns-resize";
  }
  return "nwse-resize";
}

function showGestureBadge(text: string): void {
  const workspaceRect = workspace.getBoundingClientRect();
  gestureBadge.textContent = text;
  gestureBadge.style.left = `${workspaceRect.left + workspaceRect.width / 2}px`;
  gestureBadge.style.top = `${visualViewportTop() + 14}px`;
  gestureBadge.classList.add("is-visible");
}

function hideGestureBadge(): void {
  gestureBadge.classList.remove("is-visible");
}

function grabDeltaText(deltaX: number, deltaY: number): string {
  const parts: string[] = [];
  if (deltaX !== 0) {
    parts.push(`${formatInches(Math.abs(deltaX))} ${deltaX > 0 ? "right" : "left"}`);
  }
  if (deltaY !== 0) {
    parts.push(`${formatInches(Math.abs(deltaY))} ${deltaY > 0 ? "down" : "up"}`);
  }
  return parts.length > 0 ? `Moved ${parts.join(", ")}` : 'Moved 0"';
}

function formatInches(value: number): string {
  return Number.isInteger(value) ? `${value}"` : `${value.toFixed(1).replace(/\\.0$/, "")}"`;
}

function visualViewportTop(): number {
  return window.visualViewport?.offsetTop ?? 0;
}

function moveGridFromPointer(event: PointerEvent, interaction: Extract<DragInteraction, { type: "grab" }>): void {
  state.offsetXInches = roundToHalfInch(interaction.startOffsetXInches + (event.clientX - interaction.startPoint.x) / (SCALE * state.zoom));
  state.offsetYInches = roundToHalfInch(interaction.startOffsetYInches + (event.clientY - interaction.startPoint.y) / (SCALE * state.zoom));
  updateUrl(state);
  render();
}

function resizeRoomFromPointer(event: PointerEvent, interaction: Extract<DragInteraction, { type: "resizeRoom" }>): void {
  if (interaction.handle === "right" || interaction.handle === "corner") {
    state.roomWidthInches = clamp(
      Math.round(interaction.startWidthInches + (event.clientX - interaction.startClientPoint.x) / (SCALE * state.zoom)),
      24,
      180,
    );
  }
  if (interaction.handle === "bottom" || interaction.handle === "corner") {
    state.roomHeightInches = clamp(
      Math.round(interaction.startHeightInches + (event.clientY - interaction.startClientPoint.y) / (SCALE * state.zoom)),
      24,
      240,
    );
  }

  syncSpecs();
  setupCanvas();
  updateUrl(state);
  render();
}

function render(): void {
  renderReadyFrame += 1;
  const frame = renderReadyFrame;
  lastConflictSignature = renderConflictReport(state, layoutErrors, lastConflictSignature);
  draw(state, ctx, canvas);
  markRenderReady(canvas, frame, () => renderReadyFrame);
}
