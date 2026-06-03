type Mode = "straight" | "diagonal";
type Brush = "orthogonalCross" | "diagonalCross" | "star" | "inset" | "colorOnly" | "grab" | "erase";
type CrossKind = "orthogonalCross" | "diagonalCross";
type TileKind = CrossKind | "star";
type Side = "n" | "e" | "s" | "w";
type Corner = "nw" | "ne" | "se" | "sw";

type PaletteColor = {
  id: string;
  name: string;
  value: string;
};

type Manufacturer = {
  id: string;
  name: string;
  colors: PaletteColor[];
};

type Tile = {
  kind: TileKind;
  colorId: string;
};

type Inset = {
  colorId: string;
};

type AppState = {
  mode: Mode;
  showGrid: boolean;
  roomWidthInches: number;
  roomHeightInches: number;
  tileInches: number;
  offsetXInches: number;
  offsetYInches: number;
  zoom: number;
  brush: Brush;
  manufacturerId: string;
  colorId: string;
  cells: Map<string, Tile>;
  edgeInsets: Map<string, Inset>;
  cornerInsets: Map<string, Inset>;
};

type Point = {
  x: number;
  y: number;
};

type Conflict = {
  code: string;
  message: string;
};

type TacoTarget =
  | { type: "edge"; col: number; row: number; side: Side; key: string }
  | { type: "corner"; col: number; row: number; corner: Corner; key: string };

type TacoEraseCandidate = {
  key: string;
  type: "edge" | "corner";
  distance: number;
  hit: boolean;
};

type DragInteraction =
  | { type: "paint"; pointerId: number }
  | { type: "grab"; pointerId: number; startPoint: Point; startOffsetXInches: number; startOffsetYInches: number }
  | {
      type: "resizeRoom";
      pointerId: number;
      handle: ResizeHandle;
      startClientPoint: Point;
      startWidthInches: number;
      startHeightInches: number;
    };

type ResizeHandle = "right" | "bottom" | "corner";

const DEFAULT_ROOM_INCHES = { width: 60, height: 96 };
const DEFAULT_TILE_INCHES = 8;
const TILE_SIZE_OPTIONS = [3, 4, 5, 6, 7, 8];
const MIN_ROOM_WIDTH_INCHES = 24;
const MIN_ROOM_HEIGHT_INCHES = 24;
const MAX_ROOM_WIDTH_INCHES = 180;
const MAX_ROOM_HEIGHT_INCHES = 240;
const BORDER_HANDLE_PX = 8;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_FACTOR = 1.12;
const SCALE = 8;
const GROUT_PX = 3;
const HALF_GROUT_PX = GROUT_PX / 2;
const URL_VERSION = "1";
const SIDES: Side[] = ["n", "e", "s", "w"];
const CORNERS: Corner[] = ["nw", "ne", "se", "sw"];

const MANUFACTURERS: Manufacturer[] = [
  {
    id: "dummy",
    name: "Dummy Tile Co",
    colors: [
      { id: "bone", name: "Bone", value: "#e7dcc8" },
      { id: "smoke", name: "Smoke", value: "#85817a" },
      { id: "terracotta", name: "Terracotta", value: "#ad5539" },
      { id: "verd", name: "Verd", value: "#536f56" },
      { id: "night", name: "Blue Night", value: "#24384d" },
      { id: "black", name: "Black", value: "#161616" },
      { id: "white", name: "White", value: "#f1eee5" },
      { id: "orchard", name: "Orchard Pink", value: "#d9a6a0" },
      { id: "amber", name: "Amber Grey", value: "#9b9787" },
      { id: "grass", name: "Blue Grass", value: "#536f84" },
    ],
  },
];

const DEFAULT_STATE: AppState = {
  mode: "straight",
  showGrid: false,
  roomWidthInches: DEFAULT_ROOM_INCHES.width,
  roomHeightInches: DEFAULT_ROOM_INCHES.height,
  tileInches: DEFAULT_TILE_INCHES,
  offsetXInches: 0,
  offsetYInches: 0,
  zoom: 1,
  brush: "orthogonalCross",
  manufacturerId: "dummy",
  colorId: "bone",
  cells: new Map(),
  edgeInsets: new Map(),
  cornerInsets: new Map(),
};

const canvas = requiredElement(document.querySelector<HTMLCanvasElement>("#room"), "room canvas");
const workspace = requiredElement(document.querySelector<HTMLElement>(".workspace"), "workspace");
const modeInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='mode']"));
const showGridInput = requiredElement(document.querySelector<HTMLInputElement>("#show-grid"), "show grid checkbox");
const tileSizeSelect = requiredElement(document.querySelector<HTMLSelectElement>("#tile-size"), "tile size select");
const roomSpec = requiredElement(document.querySelector<HTMLElement>("#room-spec"), "room spec");
const brushInputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[name='brush']"));
const manufacturerSelect = requiredElement(
  document.querySelector<HTMLSelectElement>("#manufacturer"),
  "manufacturer select",
);
const palette = requiredElement(document.querySelector<HTMLDivElement>("#palette"), "palette");
const clearButton = requiredElement(document.querySelector<HTMLButtonElement>("#clear"), "clear button");
const layoutErrors = requiredElement(document.querySelector<HTMLDivElement>("#layout-errors"), "layout error panel");
const ctx = requiredElement(canvas.getContext("2d"), "canvas 2D context");

let state = loadState();
let dragInteraction: DragInteraction | undefined;
let lastPaintKey = "";
let lastConflictSignature = "";
let renderReadyFrame = 0;

setupCanvas();
setupControls();
syncControls();
draw();

function setupCanvas(): void {
  const deviceRatio = window.devicePixelRatio || 1;
  const room = roomPx();
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
        state.mode = input.value as Mode;
        updateUrl();
        draw();
      }
    });
  });

  showGridInput.addEventListener("change", () => {
    state.showGrid = showGridInput.checked;
    updateUrl();
    draw();
  });

  tileSizeSelect.addEventListener("change", () => {
    const tileInches = validTileInches(tileSizeSelect.value) ?? state.tileInches;
    state.tileInches = tileInches;
    syncSpecs();
    updateUrl();
    draw();
  });

  brushInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.brush = input.value as Brush;
        updateUrl();
        updateCanvasCursor();
      }
    });
  });

  manufacturerSelect.addEventListener("change", () => {
    state.manufacturerId = manufacturerSelect.value;
    state.colorId = currentManufacturer().colors[0]?.id ?? "bone";
    renderPalette();
    updateUrl();
  });

  clearButton.addEventListener("click", () => {
    state.cells.clear();
    state.edgeInsets.clear();
    state.cornerInsets.clear();
    updateUrl();
    draw();
  });

  canvas.addEventListener("pointerdown", (event) => {
    lastPaintKey = "";
    canvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    if (!point || !pointInRoom(point)) {
      return;
    }

    const resizeHandle = resizeHandleAtPoint(point);
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
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragInteraction) {
      updateCanvasCursor(canvasPoint(event));
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
  });

  canvas.addEventListener("pointerup", (event) => {
    lastPaintKey = "";
    if (dragInteraction?.pointerId === event.pointerId) {
      dragInteraction = undefined;
      updateUrl();
      updateCanvasCursor(canvasPoint(event));
    }
    canvas.releasePointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointercancel", (event) => {
    lastPaintKey = "";
    if (dragInteraction?.pointerId === event.pointerId) {
      dragInteraction = undefined;
      updateCanvasCursor();
    }
  });

  canvas.addEventListener("pointerleave", (event) => {
    if (!dragInteraction) {
      updateCanvasCursor(canvasPoint(event));
    }
  });

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
  draw();

  const scale = nextZoom / previousZoom;
  workspace.scrollLeft += anchorX * (scale - 1);
  workspace.scrollTop += anchorY * (scale - 1);
  updateUrl();
}

function renderPalette(): void {
  palette.innerHTML = "";
  for (const color of currentManufacturer().colors) {
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
      updateUrl();
    });
    palette.append(swatch);
  }
}

function paintFromPointer(event: PointerEvent): void {
  const point = canvasPoint(event);
  if (!point || !pointInRoom(point)) {
    return;
  }

  const cell = cellFromPoint(point);
  const key = paintKey(point, cell.col, cell.row);
  if (key === lastPaintKey) {
    return;
  }
  lastPaintKey = key;

  if (state.brush === "erase") {
    eraseAt(point, cell.col, cell.row);
  } else if (state.brush === "colorOnly") {
    colorOnlyAt(point, cell.col, cell.row, state.colorId);
  } else if (state.brush === "orthogonalCross" || state.brush === "diagonalCross") {
    placeCross(cell.col, cell.row, state.brush, state.colorId);
  } else if (state.brush === "star") {
    placeStar(cell.col, cell.row, state.colorId);
  } else {
    placeInset(point, cell.col, cell.row, state.colorId);
  }

  updateUrl();
  draw();
}

function paintKey(point: Point, col: number, row: number): string {
  if (state.brush === "erase") {
    return `erase:${elementKeyAtPoint(point, col, row)}`;
  }

  if (state.brush === "colorOnly") {
    return `color:${elementKeyAtPoint(point, col, row)}`;
  }

  if (state.brush !== "inset") {
    return `${state.brush}:${col},${row}`;
  }

  const target = nearestTacoTarget(point, col, row);
  return `${target.type}:${target.key}`;
}

function placeCross(col: number, row: number, kind: CrossKind, colorId: string): void {
  state.cells.set(cellKey(col, row), { kind, colorId });
  fixCrossConflicts(col, row, kind);
  placeCompatibleTacosForCross(col, row, kind, colorId);
}

function fixCrossConflicts(col: number, row: number, kind: CrossKind): void {
  if (kind === "diagonalCross") {
    removeCornerInsets(col, row);
    return;
  }

  for (const side of SIDES) {
    removeEdgeInset(col, row, side);
  }

  for (const neighbor of neighbors(col, row)) {
    const tile = state.cells.get(cellKey(neighbor.col, neighbor.row));
    if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
      replaceWithDiagonalCross(neighbor.col, neighbor.row);
    }
  }
}

function placeCompatibleTacosForCross(col: number, row: number, kind: CrossKind, colorId: string): void {
  if (kind === "diagonalCross") {
    for (const side of SIDES) {
      setEdgeInsetIfNoNewConflict(col, row, side, colorId);
    }
    return;
  }

  for (const corner of CORNERS) {
    setCornerInsetIfNoNewConflict(col, row, corner, colorId);
  }
}

function setEdgeInsetIfNoNewConflict(col: number, row: number, side: Side, colorId: string): void {
  const key = canonicalEdgeKey(col, row, side);
  const previous = state.edgeInsets.get(key);
  const before = conflictSignatureSet();

  state.edgeInsets.set(key, { colorId });
  if (hasNewConflicts(before)) {
    restoreMapEntry(state.edgeInsets, key, previous);
  }
}

function setCornerInsetIfNoNewConflict(col: number, row: number, corner: Corner, colorId: string): void {
  const key = cornerKey(col, row, corner);
  const previous = state.cornerInsets.get(key);
  const before = conflictSignatureSet();

  state.cornerInsets.set(key, { colorId });
  if (hasNewConflicts(before)) {
    restoreMapEntry(state.cornerInsets, key, previous);
  }
}

function conflictSignatureSet(): Set<string> {
  return new Set(analyzeLayoutConflicts().map((conflict) => `${conflict.code}:${conflict.message}`));
}

function hasNewConflicts(before: Set<string>): boolean {
  return analyzeLayoutConflicts().some((conflict) => !before.has(`${conflict.code}:${conflict.message}`));
}

function restoreMapEntry<K, V>(map: Map<K, V>, key: K, value: V | undefined): void {
  if (value) {
    map.set(key, value);
  } else {
    map.delete(key);
  }
}

function replaceWithDiagonalCross(col: number, row: number): void {
  const key = cellKey(col, row);
  const tile = state.cells.get(key);
  if (!tile) {
    return;
  }

  state.cells.set(key, { kind: "diagonalCross", colorId: tile.colorId });
  removeCornerInsets(col, row);
  placeCompatibleTacosForCross(col, row, "diagonalCross", tile.colorId);
}

function eraseAt(point: Point, col: number, row: number): void {
  const taco = nearestTacoHit(point, col, row);
  if (taco) {
    deleteTaco(taco);
    return;
  }

  const key = cellKey(col, row);
  const tile = state.cells.get(key);
  state.cells.delete(key);

  if (tile?.kind === "diagonalCross") {
    pruneEdgeInsetsWithoutAdjacentDiagonalCross();
  } else if (tile?.kind === "orthogonalCross") {
    removeCornerInsets(col, row);
  }
}

function colorOnlyAt(point: Point, col: number, row: number, colorId: string): void {
  const taco = nearestTacoHit(point, col, row);
  if (taco) {
    colorTaco(taco, colorId);
    return;
  }

  const key = cellKey(col, row);
  const tile = state.cells.get(key);
  if (tile) {
    state.cells.set(key, { ...tile, colorId });
  }
}

function elementKeyAtPoint(point: Point, col: number, row: number): string {
  const taco = nearestTacoHit(point, col, row);
  if (taco) {
    return `${taco.type}:${taco.key}`;
  }

  return `tile:${col},${row}`;
}

function nearestTacoHit(point: Point, col: number, row: number): TacoEraseCandidate | undefined {
  const candidates: TacoEraseCandidate[] = [];

  for (const side of SIDES) {
    const key = canonicalEdgeKey(col, row, side);
    if (state.edgeInsets.has(key)) {
      candidates.push(edgeEraseCandidate(point, key, col, row, side));
    }

    const adjacent = neighborForSide(col, row, side);
    if (adjacent) {
      const adjacentSide = oppositeSide(side);
      const adjacentKey = canonicalEdgeKey(adjacent.col, adjacent.row, adjacentSide);
      if (state.edgeInsets.has(adjacentKey)) {
        candidates.push(edgeEraseCandidate(point, adjacentKey, adjacent.col, adjacent.row, adjacentSide));
      }
    }
  }

  for (const corner of CORNERS) {
    const key = cornerKey(col, row, corner);
    if (state.cornerInsets.has(key)) {
      candidates.push(cornerEraseCandidate(point, key, col, row, corner));
    }
  }

  return candidates.filter((candidate) => candidate.hit).sort((a, b) => a.distance - b.distance)[0];
}

function deleteTaco(taco: TacoEraseCandidate): void {
  if (taco.type === "edge") {
    state.edgeInsets.delete(taco.key);
  } else {
    state.cornerInsets.delete(taco.key);
  }
}

function colorTaco(taco: TacoEraseCandidate, colorId: string): void {
  if (taco.type === "edge") {
    state.edgeInsets.set(taco.key, { colorId });
  } else {
    state.cornerInsets.set(taco.key, { colorId });
  }
}

function pruneEdgeInsetsWithoutAdjacentDiagonalCross(): void {
  for (const key of Array.from(state.edgeInsets.keys())) {
    const edge = parseEdgeKey(key);
    const hasAdjacentDiagonalCross = cellsForEdge(edge.col, edge.row, edge.side).some(
      (cell) => state.cells.get(cellKey(cell.col, cell.row))?.kind === "diagonalCross",
    );
    if (!hasAdjacentDiagonalCross) {
      state.edgeInsets.delete(key);
    }
  }
}

function edgeEraseCandidate(point: Point, key: string, col: number, row: number, side: Side): TacoEraseCandidate {
  const midpoint = edgeMidpoint(col, row, side);
  const candidateDistance = distance(point, midpoint);
  return {
    key,
    type: "edge",
    distance: candidateDistance,
    hit: candidateDistance <= tacoHalfDiagonalPx() + 2,
  };
}

function cornerEraseCandidate(point: Point, key: string, col: number, row: number, corner: Corner): TacoEraseCandidate {
  const center = cornerInsetCenter(col, row, corner);
  const dx = Math.abs(point.x - center.x);
  const dy = Math.abs(point.y - center.y);
  const halfSize = tacoSidePx() / 2;
  const margin = 3;
  return {
    key,
    type: "corner",
    distance: distance(point, center),
    hit: dx <= halfSize + margin && dy <= halfSize + margin,
  };
}

function placeStar(col: number, row: number, colorId: string): void {
  state.cells.set(cellKey(col, row), { kind: "star", colorId });

  for (const neighbor of neighbors(col, row)) {
    const tile = state.cells.get(cellKey(neighbor.col, neighbor.row));
    if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
      replaceWithDiagonalCross(neighbor.col, neighbor.row);
    }
  }

  for (const side of SIDES) {
    removeEdgeInset(col, row, side);
  }
  removeCornerInsets(col, row);
}

function removeCornerInsets(col: number, row: number): void {
  state.cornerInsets.delete(cornerKey(col, row, "nw"));
  state.cornerInsets.delete(cornerKey(col, row, "ne"));
  state.cornerInsets.delete(cornerKey(col, row, "se"));
  state.cornerInsets.delete(cornerKey(col, row, "sw"));
}

function removeEdgeInset(col: number, row: number, side: Side): void {
  state.edgeInsets.delete(canonicalEdgeKey(col, row, side));
}

function placeInset(point: Point, col: number, row: number, colorId: string): void {
  const target = nearestTacoTarget(point, col, row);

  if (target.type === "edge") {
    for (const adjacent of cellsForEdge(target.col, target.row, target.side)) {
      replaceTileWithDiagonalCrossIfNeeded(adjacent.col, adjacent.row);
    }
    state.edgeInsets.set(target.key, { colorId });
    return;
  }

  const tile = state.cells.get(cellKey(target.col, target.row));
  if (tile?.kind !== "orthogonalCross") {
    return;
  }

  state.cornerInsets.set(target.key, { colorId });
}

function replaceTileWithDiagonalCrossIfNeeded(col: number, row: number): void {
  const tile = state.cells.get(cellKey(col, row));
  if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
    replaceWithDiagonalCross(col, row);
  }
}

function draw(): void {
  renderReadyFrame += 1;
  const frame = renderReadyFrame;
  canvas.dataset.renderReady = "false";
  updateConflictReport();
  const room = roomPx();
  ctx.clearRect(0, 0, room.width, room.height);
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, room.width, room.height);

  if (!state.showGrid) {
    drawPlaceholderGrid();
  }
  drawPlacedTiles();
  drawInsets();
  if (state.showGrid) {
    drawPlaceholderGrid();
  }
  drawRoomOutline();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (frame === renderReadyFrame) {
        canvas.dataset.renderReady = "true";
      }
    });
  });
}

function updateConflictReport(): void {
  const conflicts = analyzeLayoutConflicts();
  const signature = conflicts.map((conflict) => `${conflict.code}:${conflict.message}`).join("|");

  if (conflicts.length === 0) {
    layoutErrors.classList.remove("is-visible");
    layoutErrors.textContent = "";
    lastConflictSignature = "";
    return;
  }

  layoutErrors.classList.add("is-visible");
  layoutErrors.innerHTML = [
    "!!! TILE LAYOUT CONFLICTS DETECTED !!!",
    "<ul>",
    ...conflicts.slice(0, 6).map((conflict) => `<li>${escapeHtml(conflict.message)}</li>`),
    conflicts.length > 6 ? `<li>${conflicts.length - 6} more conflict(s)</li>` : "",
    "</ul>",
  ].join("");

  if (signature !== lastConflictSignature) {
    console.error("!!! TILE LAYOUT CONFLICTS DETECTED !!!", conflicts);
    lastConflictSignature = signature;
  }
}

function analyzeLayoutConflicts(): Conflict[] {
  const conflicts: Conflict[] = [];
  const seen = new Set<string>();

  const add = (code: string, message: string): void => {
    const key = `${code}:${message}`;
    if (!seen.has(key)) {
      seen.add(key);
      conflicts.push({ code, message });
    }
  };

  for (const [key, tile] of state.cells) {
    if (tile.kind !== "star") {
      continue;
    }

    const { col, row } = parseCellKey(key);
    for (const side of SIDES) {
      const adjacent = neighborForSide(col, row, side);
      const neighbor = state.cells.get(cellKey(adjacent.col, adjacent.row));
      if (neighbor?.kind === "star") {
        add("adjacent-stars", `Star at ${cellLabel(col, row)} touches another star at ${cellLabel(adjacent.col, adjacent.row)}.`);
      } else if (neighbor?.kind === "orthogonalCross") {
        add(
          "star-orthogonal-cross",
          `Star at ${cellLabel(col, row)} collides with orthogonal cross at ${cellLabel(adjacent.col, adjacent.row)}.`,
        );
      }

      if (state.edgeInsets.has(edgeKey(col, row, side)) || state.edgeInsets.has(edgeKey(adjacent.col, adjacent.row, oppositeSide(side)))) {
        add("star-edge-inset", `Star at ${cellLabel(col, row)} shares its ${side} side with a diagonal taco.`);
      }
    }
  }

  for (const [key, tile] of state.cells) {
    if (tile.kind !== "orthogonalCross") {
      continue;
    }

    const { col, row } = parseCellKey(key);
    for (const side of ["e", "s"] as Side[]) {
      const adjacent = neighborForSide(col, row, side);
      const neighbor = state.cells.get(cellKey(adjacent.col, adjacent.row));
      if (neighbor?.kind === "orthogonalCross") {
        add(
          "adjacent-orthogonal-crosses",
          `Orthogonal cross at ${cellLabel(col, row)} collides with orthogonal cross at ${cellLabel(
            adjacent.col,
            adjacent.row,
          )}.`,
        );
      }
    }
  }

  const canonicalEdges = new Map<string, string>();
  for (const key of state.edgeInsets.keys()) {
    const edge = parseEdgeKey(key);
    const canonical = canonicalEdgeKey(edge.col, edge.row, edge.side);
    const previous = canonicalEdges.get(canonical);
    if (previous) {
      add("duplicate-edge-inset", `Two diagonal tacos occupy the same edge: ${previous} and ${key}.`);
    } else {
      canonicalEdges.set(canonical, key);
    }

    const adjacent = cellsForEdge(edge.col, edge.row, edge.side);
    for (const cell of adjacent) {
      const tile = state.cells.get(cellKey(cell.col, cell.row));
      if (tile?.kind === "star") {
        add("edge-inset-star", `Diagonal taco ${key} collides with star at ${cellLabel(cell.col, cell.row)}.`);
      } else if (tile?.kind === "orthogonalCross") {
        add("edge-inset-orthogonal-cross", `Diagonal taco ${key} does not fit orthogonal cross at ${cellLabel(cell.col, cell.row)}.`);
      }
    }
  }

  for (const key of state.cornerInsets.keys()) {
    const corner = parseCornerKey(key);
    const tile = state.cells.get(cellKey(corner.col, corner.row));
    if (tile?.kind === "star" || tile?.kind === "diagonalCross") {
      add(
        "corner-inset-tile-collision",
        `Orthogonal taco ${key} collides with ${tile.kind} at ${cellLabel(corner.col, corner.row)}.`,
      );
    }
  }

  return conflicts;
}

function drawPlacedTiles(): void {
  drawTilesByKind("cross");
  drawTilesByKind("star");
}

function drawTilesByKind(pass: "cross" | "star"): void {
  for (const [key, tile] of state.cells) {
    const { col, row } = parseCellKey(key);
    if (!visibleCell(col, row)) {
      continue;
    }

    const color = colorValue(tile.colorId);
    if (tile.kind === "orthogonalCross" || tile.kind === "diagonalCross") {
      if (pass !== "cross") {
        continue;
      }
      drawCross(col, row, tile.kind, color);
    } else {
      if (pass !== "star") {
        continue;
      }
      drawStar(col, row, color);
    }
  }
}

function drawCross(col: number, row: number, kind: CrossKind, color: string): void {
  const size = baseDrawPx();

  ctx.save();
  applyCellTransform(col, row);
  if (kind === "orthogonalCross") {
    ctx.rotate(Math.PI / 4);
  }
  ctx.fillStyle = color;
  ctx.strokeStyle = outlineColor(color);
  ctx.lineWidth = 1;
  traceDiagonalCrossPath(size);
  ctx.fill();
  ctx.stroke();
  drawTileHighlight(size);
  ctx.restore();
}

function traceDiagonalCrossPath(size: number): void {
  const half = size / 2;
  const x = (value: number) => value * size - half;
  const y = (value: number) => value * size - half;
  const mouthStart = 0.5 - crossNotchMouth();
  const mouthEnd = 0.5 + crossNotchMouth();
  const inward = crossNotchDepth();
  const outward = 1 - crossNotchDepth();

  ctx.beginPath();
  ctx.moveTo(x(0), y(0));
  ctx.lineTo(x(mouthStart), y(0));
  ctx.lineTo(x(0.5), y(inward));
  ctx.lineTo(x(mouthEnd), y(0));
  ctx.lineTo(x(1), y(0));
  ctx.lineTo(x(1), y(mouthStart));
  ctx.lineTo(x(outward), y(0.5));
  ctx.lineTo(x(1), y(mouthEnd));
  ctx.lineTo(x(1), y(1));
  ctx.lineTo(x(mouthEnd), y(1));
  ctx.lineTo(x(0.5), y(outward));
  ctx.lineTo(x(mouthStart), y(1));
  ctx.lineTo(x(0), y(1));
  ctx.lineTo(x(0), y(mouthEnd));
  ctx.lineTo(x(inward), y(0.5));
  ctx.lineTo(x(0), y(mouthStart));
  ctx.closePath();
}

function drawStar(col: number, row: number, color: string): void {
  const body = baseDrawPx() / 2;
  const point = body + tacoHalfDiagonalPx();
  const pointBase = tacoHalfDiagonalPx();

  ctx.save();
  applyCellTransform(col, row);
  ctx.fillStyle = color;
  ctx.strokeStyle = outlineColor(color);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-body, -body);
  ctx.lineTo(-pointBase, -body);
  ctx.lineTo(0, -point);
  ctx.lineTo(pointBase, -body);
  ctx.lineTo(body, -body);
  ctx.lineTo(body, -pointBase);
  ctx.lineTo(point, 0);
  ctx.lineTo(body, pointBase);
  ctx.lineTo(body, body);
  ctx.lineTo(pointBase, body);
  ctx.lineTo(0, point);
  ctx.lineTo(-pointBase, body);
  ctx.lineTo(-body, body);
  ctx.lineTo(-body, pointBase);
  ctx.lineTo(-point, 0);
  ctx.lineTo(-body, -pointBase);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawInsets(): void {
  for (const [key, inset] of state.edgeInsets) {
    const edge = parseEdgeKey(key);
    drawEdgeInset(edge.col, edge.row, edge.side, colorValue(inset.colorId));
  }

  for (const [key, inset] of state.cornerInsets) {
    const corner = parseCornerKey(key);
    drawCornerInset(corner.col, corner.row, corner.corner, colorValue(inset.colorId));
  }
}

function drawEdgeInset(col: number, row: number, side: Side, color: string): void {
  const point = edgeMidpoint(col, row, side);
  const size = tacoSidePx();

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(layoutRotation() + Math.PI / 4);
  ctx.fillStyle = color;
  ctx.strokeStyle = outlineColor(color);
  ctx.lineWidth = 1;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.strokeRect(-size / 2, -size / 2, size, size);
  ctx.restore();
}

function drawCornerInset(col: number, row: number, corner: Corner, color: string): void {
  const size = tacoSidePx();
  const center = cornerInsetCenter(col, row, corner);

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(layoutRotation());
  ctx.fillStyle = color;
  ctx.strokeStyle = outlineColor(color);
  ctx.lineWidth = 1;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.strokeRect(-size / 2, -size / 2, size, size);
  ctx.restore();
}

function drawPlaceholderGrid(): void {
  const tile = tilePx();
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 5]);

  const window = gridLocalRoomWindow();
  const startX = Math.floor(window.minX / tile - 0.5) - 1;
  const endX = Math.ceil(window.maxX / tile - 0.5) + 1;
  const startY = Math.floor(window.minY / tile - 0.5) - 1;
  const endY = Math.ceil(window.maxY / tile - 0.5) + 1;

  for (let i = startX; i <= endX; i += 1) {
    const x = (i + 0.5) * tile;
    const a = gridLocalToScreen({ x, y: window.minY - tile });
    const b = gridLocalToScreen({ x, y: window.maxY + tile });
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  for (let i = startY; i <= endY; i += 1) {
    const y = (i + 0.5) * tile;
    const a = gridLocalToScreen({ x: window.minX - tile, y });
    const b = gridLocalToScreen({ x: window.maxX + tile, y });
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawRoomOutline(): void {
  const room = roomPx();
  ctx.save();
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  ctx.strokeRect(2, 2, room.width - 4, room.height - 4);
  ctx.restore();
}

function drawTileHighlight(size: number): void {
  const half = size / 2;

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-half + size * 0.18, -half + size * 0.16);
  ctx.lineTo(-half + size * 0.72, -half + size * 0.16);
  ctx.stroke();
  ctx.restore();
}

function loadState(): AppState {
  const params = new URLSearchParams(window.location.search);
  const next = cloneDefaultState();

  next.mode = validMode(params.get("m")) ?? next.mode;
  next.showGrid = params.get("g") === "1";
  next.roomWidthInches = validRoomWidth(params.get("rw")) ?? next.roomWidthInches;
  next.roomHeightInches = validRoomHeight(params.get("rh")) ?? next.roomHeightInches;
  next.tileInches = validTileInches(params.get("ts")) ?? next.tileInches;
  next.offsetXInches = validHalfInch(params.get("ox")) ?? next.offsetXInches;
  next.offsetYInches = validHalfInch(params.get("oy")) ?? next.offsetYInches;
  next.brush = validBrush(params.get("b")) ?? next.brush;
  next.manufacturerId = validManufacturer(params.get("mf")) ?? next.manufacturerId;
  next.colorId = validColor(next.manufacturerId, params.get("c")) ?? next.colorId;

  const layout = params.get("l");
  if (layout) {
    parseLayout(layout, next);
  }

  next.zoom = initialZoomForRoom(next.roomWidthInches, next.roomHeightInches);

  return next;
}

function cloneDefaultState(): AppState {
  return {
    mode: DEFAULT_STATE.mode,
    showGrid: DEFAULT_STATE.showGrid,
    roomWidthInches: DEFAULT_STATE.roomWidthInches,
    roomHeightInches: DEFAULT_STATE.roomHeightInches,
    tileInches: DEFAULT_STATE.tileInches,
    offsetXInches: DEFAULT_STATE.offsetXInches,
    offsetYInches: DEFAULT_STATE.offsetYInches,
    zoom: DEFAULT_STATE.zoom,
    brush: DEFAULT_STATE.brush,
    manufacturerId: DEFAULT_STATE.manufacturerId,
    colorId: DEFAULT_STATE.colorId,
    cells: new Map(),
    edgeInsets: new Map(),
    cornerInsets: new Map(),
  };
}

function parseLayout(layout: string, next: AppState): void {
  const decoded = decodeURIComponent(layout);
  if (!decoded) {
    return;
  }

  for (const item of decoded.split(";")) {
    const parts = item.split(",");
    if (parts[0] === "t" && parts.length === 5) {
      const col = Number(parts[1]);
      const row = Number(parts[2]);
      const kind = parseTileKind(parts[3]);
      const colorId = parts[4];
      if (Number.isInteger(col) && Number.isInteger(row) && kind) {
        next.cells.set(cellKey(col, row), { kind, colorId });
      }
    } else if (parts[0] === "e" && parts.length === 5) {
      const col = Number(parts[1]);
      const row = Number(parts[2]);
      const side = parts[3] as Side;
      const colorId = parts[4];
      if (Number.isInteger(col) && Number.isInteger(row) && validSide(side)) {
        next.edgeInsets.set(canonicalEdgeKey(col, row, side), { colorId });
      }
    } else if (parts[0] === "k" && parts.length === 5) {
      const col = Number(parts[1]);
      const row = Number(parts[2]);
      const corner = parts[3] as Corner;
      const colorId = parts[4];
      if (Number.isInteger(col) && Number.isInteger(row) && validCorner(corner)) {
        next.cornerInsets.set(cornerKey(col, row, corner), { colorId });
      }
    }
  }
}

function updateUrl(): void {
  const params = new URLSearchParams();
  params.set("v", URL_VERSION);
  params.set("m", state.mode);
  if (state.showGrid) {
    params.set("g", "1");
  }
  params.set("rw", String(state.roomWidthInches));
  params.set("rh", String(state.roomHeightInches));
  params.set("ts", String(state.tileInches));
  params.set("ox", String(state.offsetXInches));
  params.set("oy", String(state.offsetYInches));
  params.set("b", state.brush);
  params.set("mf", state.manufacturerId);
  params.set("c", state.colorId);

  const layout = serializeLayout();
  if (layout) {
    params.set("l", layout);
  }

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", nextUrl);
}

function serializeLayout(): string {
  const items: string[] = [];

  for (const [key, tile] of state.cells) {
    const { col, row } = parseCellKey(key);
    items.push(["t", col, row, tile.kind, tile.colorId].join(","));
  }

  for (const [key, inset] of state.edgeInsets) {
    const edge = parseEdgeKey(key);
    items.push(["e", edge.col, edge.row, edge.side, inset.colorId].join(","));
  }

  for (const [key, inset] of state.cornerInsets) {
    const corner = parseCornerKey(key);
    items.push(["k", corner.col, corner.row, corner.corner, inset.colorId].join(","));
  }

  return items.join(";");
}

function currentManufacturer(): Manufacturer {
  return MANUFACTURERS.find((manufacturer) => manufacturer.id === state.manufacturerId) ?? MANUFACTURERS[0];
}

function colorValue(colorId: string): string {
  for (const manufacturer of MANUFACTURERS) {
    const color = manufacturer.colors.find((candidate) => candidate.id === colorId);
    if (color) {
      return color.value;
    }
  }
  return MANUFACTURERS[0].colors[0].value;
}

function validManufacturer(id: string | null): string | undefined {
  return MANUFACTURERS.some((manufacturer) => manufacturer.id === id) ? id ?? undefined : undefined;
}

function validColor(manufacturerId: string, id: string | null): string | undefined {
  const manufacturer = MANUFACTURERS.find((candidate) => candidate.id === manufacturerId);
  return manufacturer?.colors.some((color) => color.id === id) ? id ?? undefined : undefined;
}

function validMode(value: string | null): Mode | undefined {
  return value === "straight" || value === "diagonal" ? value : undefined;
}

function validBrush(value: string | null): Brush | undefined {
  return value === "orthogonalCross" ||
    value === "diagonalCross" ||
    value === "star" ||
    value === "inset" ||
    value === "colorOnly" ||
    value === "grab" ||
    value === "erase"
    ? value
    : undefined;
}

function parseTileKind(value: string): TileKind | undefined {
  if (value === "orthogonalCross" || value === "diagonalCross" || value === "star") {
    return value;
  }
  return undefined;
}

function validTileInches(value: string | null): number | undefined {
  const next = Number(value);
  return TILE_SIZE_OPTIONS.includes(next) ? next : undefined;
}

function validRoomWidth(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const next = Number(value);
  return Number.isInteger(next) ? clamp(next, MIN_ROOM_WIDTH_INCHES, MAX_ROOM_WIDTH_INCHES) : undefined;
}

function validRoomHeight(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const next = Number(value);
  return Number.isInteger(next) ? clamp(next, MIN_ROOM_HEIGHT_INCHES, MAX_ROOM_HEIGHT_INCHES) : undefined;
}

function validHalfInch(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return undefined;
  }
  return roundToHalfInch(next);
}

function validSide(value: string): value is Side {
  return value === "n" || value === "e" || value === "s" || value === "w";
}

function validCorner(value: string): value is Corner {
  return value === "nw" || value === "ne" || value === "se" || value === "sw";
}

function initialZoomForRoom(roomWidthInches: number, roomHeightInches: number): number {
  const style = getComputedStyle(workspace);
  const horizontalPadding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
  const verticalPadding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
  const availableWidth = Math.max(1, workspace.clientWidth - horizontalPadding);
  const availableHeight = Math.max(1, workspace.clientHeight - verticalPadding);
  const roomWidth = roomWidthInches * SCALE;
  const roomHeight = roomHeightInches * SCALE;
  return normalizeZoom(Math.min(availableWidth / roomWidth, availableHeight / roomHeight));
}

function roomPx(): { width: number; height: number } {
  return {
    width: state.roomWidthInches * SCALE,
    height: state.roomHeightInches * SCALE,
  };
}

function roomCenter(): Point {
  const room = roomPx();
  return { x: room.width / 2, y: room.height / 2 };
}

function tilePx(): number {
  return state.tileInches * SCALE;
}

function baseDrawPx(): number {
  return Math.max(1, tilePx() - GROUT_PX);
}

function tacoSidePx(): number {
  return baseDrawPx() / 4;
}

function tacoHalfDiagonalPx(): number {
  return tacoSidePx() / Math.SQRT2;
}

function crossNotchMouth(): number {
  return tacoHalfDiagonalPx() / baseDrawPx();
}

function crossNotchDepth(): number {
  return tacoHalfDiagonalPx() / baseDrawPx();
}

function pointInRoom(point: Point): boolean {
  const room = roomPx();
  return point.x >= 0 && point.y >= 0 && point.x <= room.width && point.y <= room.height;
}

function resizeHandleAtPoint(point: Point): ResizeHandle | undefined {
  const room = roomPx();
  const nearRight = Math.abs(point.x - room.width) <= BORDER_HANDLE_PX;
  const nearBottom = Math.abs(point.y - room.height) <= BORDER_HANDLE_PX;

  if (nearRight && nearBottom) {
    return "corner";
  }
  if (nearRight) {
    return "right";
  }
  if (nearBottom) {
    return "bottom";
  }
  return undefined;
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

  const handle = point && pointInRoom(point) ? resizeHandleAtPoint(point) : undefined;
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
  updateUrl();
  draw();
}

function resizeRoomFromPointer(
  event: PointerEvent,
  interaction: Extract<DragInteraction, { type: "resizeRoom" }>,
): void {
  if (interaction.handle === "right" || interaction.handle === "corner") {
    state.roomWidthInches = clamp(
      Math.round(interaction.startWidthInches + (event.clientX - interaction.startClientPoint.x) / (SCALE * state.zoom)),
      MIN_ROOM_WIDTH_INCHES,
      MAX_ROOM_WIDTH_INCHES,
    );
  }
  if (interaction.handle === "bottom" || interaction.handle === "corner") {
    state.roomHeightInches = clamp(
      Math.round(interaction.startHeightInches + (event.clientY - interaction.startClientPoint.y) / (SCALE * state.zoom)),
      MIN_ROOM_HEIGHT_INCHES,
      MAX_ROOM_HEIGHT_INCHES,
    );
  }

  syncSpecs();
  setupCanvas();
  updateUrl();
  draw();
}

function roundToHalfInch(value: number): number {
  return Math.round(value * 2) / 2;
}

function normalizeZoom(value: number): number {
  return Math.round(clamp(value, MIN_ZOOM, MAX_ZOOM) * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function layoutRotation(): number {
  return state.mode === "diagonal" ? Math.PI / 4 : 0;
}

function gridOrigin(): Point {
  const center = roomCenter();
  return {
    x: center.x + state.offsetXInches * SCALE,
    y: center.y + state.offsetYInches * SCALE,
  };
}

function applyCellTransform(col: number, row: number): void {
  const center = cellLocalToScreen(col, row, 0, 0);
  ctx.translate(center.x, center.y);
  ctx.rotate(layoutRotation());
}

function cellLocalToScreen(col: number, row: number, localX: number, localY: number): Point {
  const tile = tilePx();
  const x = col * tile + localX;
  const y = row * tile + localY;
  return gridLocalToScreen({ x, y });
}

function gridLocalRoomWindow(): { minX: number; maxX: number; minY: number; maxY: number } {
  const room = roomPx();
  const points = [
    screenToGridLocal({ x: 0, y: 0 }),
    screenToGridLocal({ x: room.width, y: 0 }),
    screenToGridLocal({ x: room.width, y: room.height }),
    screenToGridLocal({ x: 0, y: room.height }),
  ];
  return {
    minX: Math.min(...points.map((point) => point.x)),
    maxX: Math.max(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxY: Math.max(...points.map((point) => point.y)),
  };
}

function gridLocalToScreen(point: Point): Point {
  const origin = gridOrigin();
  if (state.mode !== "diagonal") {
    return { x: origin.x + point.x, y: origin.y + point.y };
  }

  const angle = layoutRotation();
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: origin.x + point.x * cos - point.y * sin,
    y: origin.y + point.x * sin + point.y * cos,
  };
}

function screenToGridLocal(point: Point): Point {
  const origin = gridOrigin();
  const x = point.x - origin.x;
  const y = point.y - origin.y;
  if (state.mode !== "diagonal") {
    return { x, y };
  }

  const angle = -layoutRotation();
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

function cellFromPoint(point: Point): { col: number; row: number } {
  const tile = tilePx();
  const local = screenToGridLocal(point);
  return {
    col: Math.floor(local.x / tile + 0.5),
    row: Math.floor(local.y / tile + 0.5),
  };
}

function canvasPoint(event: PointerEvent): Point | undefined {
  const rect = canvas.getBoundingClientRect();
  const room = roomPx();
  return {
    x: ((event.clientX - rect.left) / rect.width) * room.width,
    y: ((event.clientY - rect.top) / rect.height) * room.height,
  };
}

function nearestEdge(point: Point, col: number, row: number): { col: number; row: number; side: Side; key: string } {
  const sides: Side[] = ["n", "e", "s", "w"];
  let nearest = sides[0];
  let nearestDistance = Infinity;

  for (const side of sides) {
    const midpoint = edgeMidpoint(col, row, side);
    const distance = Math.hypot(point.x - midpoint.x, point.y - midpoint.y);
    if (distance < nearestDistance) {
      nearest = side;
      nearestDistance = distance;
    }
  }

  return { col, row, side: nearest, key: canonicalEdgeKey(col, row, nearest) };
}

function nearestCorner(point: Point, col: number, row: number): { col: number; row: number; corner: Corner; key: string } {
  const corners = [
    { corner: "nw" as const, point: cellLocalToScreen(col, row, -tilePx() / 2, -tilePx() / 2) },
    { corner: "ne" as const, point: cellLocalToScreen(col, row, tilePx() / 2, -tilePx() / 2) },
    { corner: "se" as const, point: cellLocalToScreen(col, row, tilePx() / 2, tilePx() / 2) },
    { corner: "sw" as const, point: cellLocalToScreen(col, row, -tilePx() / 2, tilePx() / 2) },
  ];
  let nearest = corners[0];
  let nearestDistance = Infinity;

  for (const corner of corners) {
    const distance = Math.hypot(point.x - corner.point.x, point.y - corner.point.y);
    if (distance < nearestDistance) {
      nearest = corner;
      nearestDistance = distance;
    }
  }

  return { col, row, corner: nearest.corner, key: cornerKey(col, row, nearest.corner) };
}

function nearestTacoTarget(point: Point, col: number, row: number): TacoTarget {
  const edge = nearestEdge(point, col, row);
  const corner = nearestCorner(point, col, row);
  const edgeDistance = distance(point, edgeMidpoint(edge.col, edge.row, edge.side));
  const cornerDistance = distance(point, cornerInsetCenter(corner.col, corner.row, corner.corner));

  if (edgeDistance <= cornerDistance) {
    return { type: "edge", ...edge };
  }

  return { type: "corner", ...corner };
}

function edgeMidpoint(col: number, row: number, side: Side): Point {
  const halfTile = tilePx() / 2;
  if (side === "n") {
    return cellLocalToScreen(col, row, 0, -halfTile);
  }
  if (side === "e") {
    return cellLocalToScreen(col, row, halfTile, 0);
  }
  if (side === "s") {
    return cellLocalToScreen(col, row, 0, halfTile);
  }
  return cellLocalToScreen(col, row, -halfTile, 0);
}

function cornerInsetCenter(col: number, row: number, corner: Corner): Point {
  const halfTile = tilePx() / 2;
  const centerOffset = HALF_GROUT_PX + tacoSidePx() / 2;
  const x = corner === "nw" || corner === "sw" ? -halfTile + centerOffset : halfTile - centerOffset;
  const y = corner === "nw" || corner === "ne" ? -halfTile + centerOffset : halfTile - centerOffset;
  return cellLocalToScreen(col, row, x, y);
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function neighborForSide(col: number, row: number, side: Side): { col: number; row: number } {
  if (side === "n") {
    return { col, row: row - 1 };
  }
  if (side === "e") {
    return { col: col + 1, row };
  }
  if (side === "s") {
    return { col, row: row + 1 };
  }
  return { col: col - 1, row };
}

function oppositeSide(side: Side): Side {
  if (side === "n") {
    return "s";
  }
  if (side === "e") {
    return "w";
  }
  if (side === "s") {
    return "n";
  }
  return "e";
}

function neighbors(col: number, row: number): Array<{ col: number; row: number }> {
  return [
    { col, row: row - 1 },
    { col: col + 1, row },
    { col, row: row + 1 },
    { col: col - 1, row },
  ];
}

function cellsForEdge(col: number, row: number, side: Side): Array<{ col: number; row: number }> {
  const cells = [{ col, row }];
  if (side === "n") {
    cells.push({ col, row: row - 1 });
  } else if (side === "e") {
    cells.push({ col: col + 1, row });
  } else if (side === "s") {
    cells.push({ col, row: row + 1 });
  } else {
    cells.push({ col: col - 1, row });
  }
  return cells;
}

function canonicalEdgeKey(col: number, row: number, side: Side): string {
  if (side === "n") {
    return edgeKey(col, row - 1, "s");
  }
  if (side === "w") {
    return edgeKey(col - 1, row, "e");
  }
  return edgeKey(col, row, side);
}

function visibleCell(col: number, row: number): boolean {
  const room = roomPx();
  const margin = tilePx();
  const halfTile = tilePx() / 2;
  const points = [
    cellLocalToScreen(col, row, -halfTile, -halfTile),
    cellLocalToScreen(col, row, halfTile, -halfTile),
    cellLocalToScreen(col, row, halfTile, halfTile),
    cellLocalToScreen(col, row, -halfTile, halfTile),
    cellLocalToScreen(col, row, 0, 0),
  ];
  return points.some(
    (point) =>
      point.x >= -margin && point.y >= -margin && point.x <= room.width + margin && point.y <= room.height + margin,
  );
}

function cellKey(col: number, row: number): string {
  return `${col}:${row}`;
}

function parseCellKey(key: string): { col: number; row: number } {
  const [col, row] = key.split(":").map(Number);
  return { col, row };
}

function edgeKey(col: number, row: number, side: Side): string {
  return `${col}:${row}:${side}`;
}

function parseEdgeKey(key: string): { col: number; row: number; side: Side } {
  const [col, row, side] = key.split(":");
  return { col: Number(col), row: Number(row), side: side as Side };
}

function cornerKey(col: number, row: number, corner: Corner): string {
  return `${col}:${row}:${corner}`;
}

function parseCornerKey(key: string): { col: number; row: number; corner: Corner } {
  const [col, row, corner] = key.split(":");
  return { col: Number(col), row: Number(row), corner: corner as Corner };
}

function cellLabel(col: number, row: number): string {
  return `(${col}, ${row})`;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function darken(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgb(${Math.round(red * (1 - amount))}, ${Math.round(green * (1 - amount))}, ${Math.round(
    blue * (1 - amount),
  )})`;
}

function outlineColor(hex: string): string {
  const normalized = hex.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  if (luminance < 0.18) {
    return "rgba(245, 239, 226, 0.9)";
  }

  return darken(hex, 0.24);
}
