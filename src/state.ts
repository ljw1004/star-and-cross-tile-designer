import {
  DEFAULT_STATE,
  GROUT_COLORS,
  GROUT_JOINT_OPTIONS,
  MANUFACTURERS,
  MAX_ROOM_HEIGHT_INCHES,
  MAX_ROOM_WIDTH_INCHES,
  MIN_ROOM_HEIGHT_INCHES,
  MIN_ROOM_WIDTH_INCHES,
  TILE_SIZE_OPTIONS,
  URL_VERSION,
} from "./constants";
import { clamp, initialZoomForRoom, normalizeZoom, roundToHalfInch } from "./geometry";
import { canonicalEdgeKey, cellKey, cornerKey, parseCellKey, parseCornerKey, parseEdgeKey } from "./keys";
import type { AppState, Corner, Mode, PaintShape, Side, TileKind, Tool } from "./types";

export function loadState(workspace: HTMLElement): AppState {
  const params = new URLSearchParams(window.location.search);
  const next = cloneDefaultState();

  next.mode = validMode(params.get("m")) ?? next.mode;
  next.showGrid = params.get("g") === "1";
  next.roomWidthInches = validRoomWidth(params.get("rw")) ?? next.roomWidthInches;
  next.roomHeightInches = validRoomHeight(params.get("rh")) ?? next.roomHeightInches;
  next.tileInches = validTileInches(params.get("ts")) ?? next.tileInches;
  next.offsetXInches = validHalfInch(params.get("ox")) ?? next.offsetXInches;
  next.offsetYInches = validHalfInch(params.get("oy")) ?? next.offsetYInches;
  next.groutColorId = validGroutColor(params.get("gc")) ?? next.groutColorId;
  next.groutJointSixteenths = validGroutJoint(params.get("gj")) ?? next.groutJointSixteenths;
  const parsedTool = validTool(params.get("tl"));
  if (parsedTool) {
    next.tool = parsedTool;
    next.paintShape = parsedTool === "paint" && !params.has("ps") ? undefined : next.paintShape;
  }
  next.paintShape = validPaintShape(params.get("ps")) ?? next.paintShape;
  if (next.tool !== "paint") {
    next.paintShape = undefined;
  }
  next.manufacturerId = validManufacturer(params.get("mf")) ?? next.manufacturerId;
  next.colorId = validColor(next.manufacturerId, params.get("c")) ?? next.colorId;

  const layout = params.get("l");
  if (layout) {
    parseLayout(layout, next);
  }

  next.zoom = initialZoomForRoom(workspace, next.roomWidthInches, next.roomHeightInches);

  return next;
}

export function cloneDefaultState(): AppState {
  return {
    mode: DEFAULT_STATE.mode,
    showGrid: DEFAULT_STATE.showGrid,
    roomWidthInches: DEFAULT_STATE.roomWidthInches,
    roomHeightInches: DEFAULT_STATE.roomHeightInches,
    tileInches: DEFAULT_STATE.tileInches,
    offsetXInches: DEFAULT_STATE.offsetXInches,
    offsetYInches: DEFAULT_STATE.offsetYInches,
    zoom: DEFAULT_STATE.zoom,
    groutColorId: DEFAULT_STATE.groutColorId,
    groutJointSixteenths: DEFAULT_STATE.groutJointSixteenths,
    tool: DEFAULT_STATE.tool,
    paintShape: DEFAULT_STATE.paintShape,
    manufacturerId: DEFAULT_STATE.manufacturerId,
    colorId: DEFAULT_STATE.colorId,
    cells: new Map(),
    edgeInsets: new Map(),
    cornerInsets: new Map(),
  };
}

export function parseLayout(layout: string, next: AppState): void {
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

export function updateUrl(state: AppState): void {
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
  params.set("gc", state.groutColorId);
  params.set("gj", String(state.groutJointSixteenths));
  params.set("tl", state.tool);
  if (state.tool === "paint" && state.paintShape) {
    params.set("ps", state.paintShape);
  }
  params.set("mf", state.manufacturerId);
  params.set("c", state.colorId);

  const layout = serializeLayout(state);
  if (layout) {
    params.set("l", layout);
  }

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", nextUrl);
}

export function serializeLayout(state: AppState): string {
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

export function validManufacturer(id: string | null): string | undefined {
  return MANUFACTURERS.some((manufacturer) => manufacturer.id === id) ? id ?? undefined : undefined;
}

export function validColor(manufacturerId: string, id: string | null): string | undefined {
  const manufacturer = MANUFACTURERS.find((candidate) => candidate.id === manufacturerId);
  return manufacturer?.colors.some((color) => color.id === id) ? id ?? undefined : undefined;
}

export function validGroutColor(id: string | null): string | undefined {
  return GROUT_COLORS.some((color) => color.id === id) ? id ?? undefined : undefined;
}

export function validGroutJoint(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const next = Number(value);
  return Number.isInteger(next) && GROUT_JOINT_OPTIONS.includes(next) ? next : undefined;
}

export function validMode(value: string | null): Mode | undefined {
  return value === "straight" || value === "diagonal" ? value : undefined;
}

export function validTool(value: string | null): Tool | undefined {
  return value === "paint" || value === "grab" || value === "erase" || value === "colorPicker" ? value : undefined;
}

export function validPaintShape(value: string | null): PaintShape | undefined {
  return value === "orthogonalCross" || value === "diagonalCross" || value === "star" || value === "inset" ? value : undefined;
}

export function parseTileKind(value: string): TileKind | undefined {
  if (value === "orthogonalCross" || value === "diagonalCross" || value === "star") {
    return value;
  }
  return undefined;
}

export function validTileInches(value: string | null): number | undefined {
  const next = Number(value);
  return TILE_SIZE_OPTIONS.includes(next) ? next : undefined;
}

export function validRoomWidth(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const next = Number(value);
  return Number.isInteger(next) ? clamp(next, MIN_ROOM_WIDTH_INCHES, MAX_ROOM_WIDTH_INCHES) : undefined;
}

export function validRoomHeight(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const next = Number(value);
  return Number.isInteger(next) ? clamp(next, MIN_ROOM_HEIGHT_INCHES, MAX_ROOM_HEIGHT_INCHES) : undefined;
}

export function validHalfInch(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return undefined;
  }
  return roundToHalfInch(next);
}

export function validSide(value: string): value is Side {
  return value === "n" || value === "e" || value === "s" || value === "w";
}

export function validCorner(value: string): value is Corner {
  return value === "nw" || value === "ne" || value === "se" || value === "sw";
}

export function normalizeStateZoom(state: AppState): void {
  state.zoom = normalizeZoom(state.zoom);
}
