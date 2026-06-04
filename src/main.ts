import { GROUT_COLORS, MANUFACTURERS, SCALE, ZOOM_FACTOR } from "./constants";
import {
  canvasPoint,
  cellFromPoint,
  clamp,
  normalizeZoom,
  pointInRoom,
  resizeHandleAtPoint,
  roomPx,
  roundToHalfInch,
} from "./geometry";
import { colorIdAt, colorOnlyAt, eraseAt, paintKey, placeCross, placeInset, placeStar } from "./model";
import { fillMaterialPath } from "./material";
import { draw, markRenderReady, renderConflictReport } from "./render";
import { loadState, updateUrl, validGroutJoint, validTileInches } from "./state";
import type { AppState, DragInteraction, PaintShape, Point, ResizeHandle, Tool } from "./types";

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
const clearButton = requiredElement(document.querySelector<HTMLButtonElement>("#clear"), "clear button");
const layoutErrors = requiredElement(document.querySelector<HTMLDivElement>("#layout-errors"), "layout error panel");
const ctx = requiredElement(canvas.getContext("2d"), "canvas 2D context");
const swatchTooltip = document.createElement("div");
swatchTooltip.className = "swatch-tooltip";
document.body.append(swatchTooltip);

let state: AppState = loadState(workspace);
let dragInteraction: DragInteraction | undefined;
let lastPaintKey = "";
let lastConflictSignature = "";
let renderReadyFrame = 0;
const materialSwatchCache = new Map<string, string>();
const ERASER_CURSOR = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="white" stroke="black" stroke-linejoin="round" stroke-width="2" d="M6 21 19 8l8 8-10 10H11z"/><path fill="black" d="M11 26h17v3H11z"/><path fill="white" stroke="black" stroke-linejoin="round" stroke-width="2" d="M6 21 11 26h6l4-4-8-8z"/></svg>`,
  6,
  21,
  "crosshair",
);
const PAINT_ROLLER_CURSOR = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="black" d="M16 1 19 5h-6z"/><rect x="4" y="5" width="20" height="7" rx="2" fill="white" stroke="black" stroke-width="2"/><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M24 8.5h4v7.5H17v4"/><path fill="white" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 20h6v9h-6z"/></svg>`,
  16,
  1,
  "crosshair",
);
const DROPPER_CURSOR = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g transform="rotate(45 16 16)"><path fill="black" d="M11 7c0-4 5-7 5-7s5 3 5 7c0 3-2 6-5 6s-5-3-5-6z"/><rect x="14" y="12" width="4" height="16" rx="1" fill="white" stroke="black" stroke-width="2"/><path fill="white" stroke="black" stroke-linejoin="round" stroke-width="2" d="M14 28h4l-2 3z"/></g></svg>`,
  24,
  28,
  "copy",
);

setupCanvas();
setupControls();
syncControls();
render();

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

function svgCursor(svg: string, hotspotX: number, hotspotY: number, fallback: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspotX} ${hotspotY}, ${fallback}`;
}

function setupControls(): void {
  tooltipControls.forEach(attachSwatchTooltip);

  modeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.mode = input.value as AppState["mode"];
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

  clearButton.addEventListener("click", () => {
    state.cells.clear();
    state.edgeInsets.clear();
    state.cornerInsets.clear();
    updateUrl(state);
    render();
  });

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerCancel);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  window.addEventListener("wheel", handleWheel, { passive: false });
}

function syncControls(): void {
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
        selectColor(manufacturer.id, color.id);
        if (state.tool !== "paint" || !state.paintShape) {
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
    traceToolIconPath(iconCtx, shape);
    fillMaterialPath(iconCtx, state.colorId, `tool-icon:${shape}:${state.colorId}`, { x: 0, y: 0, width: icon.width, height: icon.height });
    traceToolIconPath(iconCtx, shape);
    iconCtx.lineWidth = 2;
    iconCtx.strokeStyle = "#050505";
    iconCtx.stroke();
  }
}

function traceToolIconPath(ctx: CanvasRenderingContext2D, shape: PaintShape): void {
  ctx.beginPath();
  if (shape === "orthogonalCross") {
    tracePolygon(ctx, [
      [50, 0],
      [66.3, 16.3],
      [66.3, 33.8],
      [83.8, 33.8],
      [100, 50],
      [83.8, 66.3],
      [66.3, 66.3],
      [66.3, 83.8],
      [50, 100],
      [33.8, 83.8],
      [33.8, 66.3],
      [16.3, 66.3],
      [0, 50],
      [16.3, 33.8],
      [33.8, 33.8],
      [33.8, 16.3],
    ]);
  } else if (shape === "diagonalCross") {
    tracePolygon(ctx, [
      [10, 10],
      [36, 10],
      [50, 24],
      [64, 10],
      [90, 10],
      [90, 36],
      [76, 50],
      [90, 64],
      [90, 90],
      [64, 90],
      [50, 76],
      [36, 90],
      [10, 90],
      [10, 64],
      [24, 50],
      [10, 36],
    ]);
  } else if (shape === "star") {
    tracePolygon(ctx, [
      [16, 16],
      [36, 16],
      [50, 0],
      [64, 16],
      [84, 16],
      [84, 36],
      [100, 50],
      [84, 64],
      [84, 84],
      [64, 84],
      [50, 100],
      [36, 84],
      [16, 84],
      [16, 64],
      [0, 50],
      [16, 36],
    ]);
  } else {
    tracePolygon(ctx, [
      [50, 14],
      [86, 50],
      [50, 86],
      [14, 50],
    ]);
  }
}

function tracePolygon(ctx: CanvasRenderingContext2D, points: Array<[number, number]>): void {
  const [first, ...rest] = points;
  ctx.moveTo(first[0], first[1]);
  for (const point of rest) {
    ctx.lineTo(point[0], point[1]);
  }
  ctx.closePath();
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
    placeCross(state, cell.col, cell.row, state.paintShape, state.colorId);
  } else if (state.paintShape === "star") {
    placeStar(state, cell.col, cell.row, state.colorId);
  } else {
    placeInset(state, point, cell.col, cell.row, state.colorId);
  }

  updateUrl(state);
  render();
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
