import { MANUFACTURERS, SCALE, ZOOM_FACTOR } from "./constants";
import { currentManufacturer } from "./color";
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
import { colorOnlyAt, eraseAt, paintKey, placeCross, placeInset, placeStar } from "./model";
import { draw, markRenderReady, renderConflictReport } from "./render";
import { loadState, updateUrl, validTileInches } from "./state";
import type { AppState, Brush, DragInteraction, Point, ResizeHandle } from "./types";

const canvas = requiredElement(document.querySelector<HTMLCanvasElement>("#room"), "room canvas");
const workspace = requiredElement(document.querySelector<HTMLElement>(".workspace"), "workspace");
const modeInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='mode']"));
const showGridInput = requiredElement(document.querySelector<HTMLInputElement>("#show-grid"), "show grid checkbox");
const tileSizeSelect = requiredElement(document.querySelector<HTMLSelectElement>("#tile-size"), "tile size select");
const roomSpec = requiredElement(document.querySelector<HTMLElement>("#room-spec"), "room spec");
const brushInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='brush']"));
const manufacturerSelect = requiredElement(document.querySelector<HTMLSelectElement>("#manufacturer"), "manufacturer select");
const palette = requiredElement(document.querySelector<HTMLDivElement>("#palette"), "palette");
const clearButton = requiredElement(document.querySelector<HTMLButtonElement>("#clear"), "clear button");
const layoutErrors = requiredElement(document.querySelector<HTMLDivElement>("#layout-errors"), "layout error panel");
const ctx = requiredElement(canvas.getContext("2d"), "canvas 2D context");

let state: AppState = loadState(workspace);
let dragInteraction: DragInteraction | undefined;
let lastPaintKey = "";
let lastConflictSignature = "";
let renderReadyFrame = 0;

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

function setupControls(): void {
  for (const manufacturer of MANUFACTURERS) {
    const option = document.createElement("option");
    option.value = manufacturer.id;
    option.textContent = manufacturer.name;
    manufacturerSelect.append(option);
  }

  modeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.mode = input.value as AppState["mode"];
        updateUrl(state);
        render();
      }
    });
  });

  showGridInput.addEventListener("change", () => {
    state.showGrid = showGridInput.checked;
    updateUrl(state);
    render();
  });

  tileSizeSelect.addEventListener("change", () => {
    state.tileInches = validTileInches(tileSizeSelect.value) ?? state.tileInches;
    syncSpecs();
    updateUrl(state);
    render();
  });

  brushInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.brush = input.value as Brush;
        updateUrl(state);
        updateCanvasCursor();
      }
    });
  });

  manufacturerSelect.addEventListener("change", () => {
    state.manufacturerId = manufacturerSelect.value;
    state.colorId = currentManufacturer(state).colors[0]?.id ?? "bone";
    renderPalette();
    updateUrl(state);
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
  showGridInput.checked = state.showGrid;
  tileSizeSelect.value = String(state.tileInches);
  brushInputs.forEach((input) => {
    input.checked = input.value === state.brush;
  });
  manufacturerSelect.value = state.manufacturerId;
  renderPalette();
  syncSpecs();
  updateCanvasCursor();
}

function syncSpecs(): void {
  roomSpec.textContent = `${state.roomWidthInches}" x ${state.roomHeightInches}"`;
}

function renderPalette(): void {
  palette.innerHTML = "";
  for (const color of currentManufacturer(state).colors) {
    const swatch = document.createElement("button");
    swatch.className = "swatch";
    swatch.type = "button";
    swatch.style.background = color.value;
    swatch.title = color.name;
    swatch.setAttribute("aria-label", color.name);
    swatch.setAttribute("aria-pressed", String(color.id === state.colorId));
    swatch.addEventListener("click", () => {
      state.colorId = color.id;
      renderPalette();
      updateUrl(state);
    });
    palette.append(swatch);
  }
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

  if (state.brush === "grab") {
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

  dragInteraction = { type: "paint", pointerId: event.pointerId };
  paintFromPointer(event);
}

function handlePointerMove(event: PointerEvent): void {
  if (!dragInteraction) {
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
}

function handlePointerLeave(event: PointerEvent): void {
  if (!dragInteraction) {
    updateCanvasCursor(canvasPoint(state, canvas, event));
  }
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

  if (state.brush === "erase") {
    eraseAt(state, point, cell.col, cell.row);
  } else if (state.brush === "colorOnly") {
    colorOnlyAt(state, point, cell.col, cell.row, state.colorId);
  } else if (state.brush === "orthogonalCross" || state.brush === "diagonalCross") {
    placeCross(state, cell.col, cell.row, state.brush, state.colorId);
  } else if (state.brush === "star") {
    placeStar(state, cell.col, cell.row, state.colorId);
  } else {
    placeInset(state, point, cell.col, cell.row, state.colorId);
  }

  updateUrl(state);
  render();
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
  } else if (state.brush === "grab") {
    canvas.style.cursor = "grab";
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
