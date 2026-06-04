import { GROUT_COLORS, MANUFACTURERS, SCALE, ZOOM_FACTOR } from "./constants";
import {
  canvasPoint,
  cellFromPoint,
  clamp,
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
const modeInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='mode']"));
const gridLayerInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='grid-layer']"));
const tileSizeInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='tile-size']"));
const roomSpec = requiredElement(document.querySelector<HTMLElement>("#room-spec"), "room spec");
const paintShapeInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='paint-shape']"));
const toolInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='tool']"));
const colorPickerTool = requiredElement(document.querySelector<HTMLButtonElement>("#color-picker-tool"), "color picker tool");
const tooltipControls = Array.from(document.querySelectorAll<HTMLElement>(".tool-button, .icon-button, #color-picker-tool"));
const materialToolIcons = Array.from(document.querySelectorAll<HTMLCanvasElement>(".material-tool-icon"));
const palette = requiredElement(document.querySelector<HTMLDivElement>("#palette"), "palette");
const groutPalette = requiredElement(document.querySelector<HTMLDivElement>("#grout-palette"), "grout palette");
const groutJointInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='grout-joint']"));
const layoutErrors = requiredElement(document.querySelector<HTMLDivElement>("#layout-errors"), "layout error panel");
const ctx = requiredElement(canvas.getContext("2d"), "canvas 2D context");
const swatchTooltip = document.createElement("div");
swatchTooltip.className = "swatch-tooltip";
document.body.append(swatchTooltip);

let state!: AppState;
let dragInteraction: DragInteraction | undefined;
let lastPaintKey = "";
let lastConflictSignature = "";
let renderReadyFrame = 0;
const materialSwatchCache = new Map<string, string>();

void start();

async function start(): Promise<void> {
  state = await loadState(workspace);
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
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(deviceRatio, deviceRatio);
  updateCanvasCursor();
}

function requiredElement<T>(element: T | null, label: string): T {
  if (!element) {
    throw new Error(`Missing required ${label}.`);
  }
  return element;
}

function setupControls(): void {
  tooltipControls.forEach(attachSwatchTooltip);

  modeInputs.forEach((input) => {
    input.addEventListener("click", () => {
      if (input.checked) {
        switchLayoutMode(input.value as Mode);
        updateUrl(state);
        render();
      }
    });
  });

  gridLayerInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.showGrid = input.value === "top";
        updateUrl(state);
        render();
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
      }
    });
  });

  paintShapeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.tool = "paint";
        state.paintShape = input.value as PaintShape;
        syncInteractionControls();
        updateUrl(state);
        updateCanvasCursor();
        syncPaletteState();
      }
    });
  });

  toolInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.tool = input.value as Tool;
        state.paintShape = undefined;
        syncInteractionControls();
        updateUrl(state);
        updateCanvasCursor();
        syncPaletteState();
      }
    });
  });

  colorPickerTool.addEventListener("click", () => {
    state.tool = "colorPicker";
    state.paintShape = undefined;
    syncInteractionControls();
    syncPaletteState();
    updateUrl(state);
    updateCanvasCursor();
  });

  groutJointInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.groutJointSixteenths = validGroutJoint(input.value) ?? state.groutJointSixteenths;
        updateUrl(state);
        render();
      }
    });
  });

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerCancel);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  window.addEventListener("wheel", handleWheel, { passive: false });
}

function switchLayoutMode(nextMode: Mode): void {
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

  state.tool = "grab";
  state.paintShape = undefined;
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
}

function syncInteractionControls(): void {
  paintShapeInputs.forEach((input) => {
    input.checked = state.tool === "paint" && input.value === state.paintShape;
  });
  toolInputs.forEach((input) => {
    input.checked = input.value === state.tool;
  });
}

function syncSpecs(): void {
  roomSpec.textContent = `${state.roomWidthInches}" x ${state.roomHeightInches}"`;
}

function syncModeClass(): void {
  document.body.classList.toggle("mode-diagonal", state.mode === "diagonal");
}

function renderPalette(): void {
  palette.innerHTML = "";
  palette.classList.toggle("is-picking", state.tool === "colorPicker");
  colorPickerTool.setAttribute("aria-pressed", String(state.tool === "colorPicker"));

  for (const manufacturer of MANUFACTURERS) {
    const marker = document.createElement("div");
    marker.className = "palette-manufacturer";
    marker.dataset.tooltip = manufacturer.name;
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
        if (clickedCurrentPaintColor || state.tool !== "paint" || !state.paintShape) {
          switchToPaintColorOnly();
        }
        syncInteractionControls();
        syncPaletteState();
        updateUrl(state);
        updateCanvasCursor();
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
      updateUrl(state);
      render();
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
}

function handlePointerDown(event: PointerEvent): void {
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
  lastPaintKey = "";
  if (dragInteraction?.pointerId === event.pointerId) {
    dragInteraction = undefined;
    updateUrl(state);
    updateCanvasCursor(canvasPoint(state, canvas, event));
  }
  canvas.releasePointerCapture(event.pointerId);
}

function handlePointerCancel(event: PointerEvent): void {
  lastPaintKey = "";
  if (dragInteraction?.pointerId === event.pointerId) {
    dragInteraction = undefined;
    updateCanvasCursor();
  }
  hideSwatchTooltip();
}

function handlePointerLeave(event: PointerEvent): void {
  if (!dragInteraction) {
    updateCanvasCursor(canvasPoint(state, canvas, event));
  }
  hideSwatchTooltip();
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
