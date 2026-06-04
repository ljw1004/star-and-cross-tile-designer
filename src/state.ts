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
} from "./constants";
import { recordDebugUrlSync, recordDebugUrlWrite } from "./debug";
import { clamp, initialZoomForRoom, normalizeZoom, roundToHalfInch } from "./geometry";
import { canonicalEdgeKey, cellKey, cornerKey, parseCellKey, parseCornerKey, parseEdgeKey } from "./keys";
import type { AppState, Corner, PaintShape, Side, TileKind, Tool } from "./types";

type CompactState = {
  v: 2;
  m: "s" | "d";
  q?: 1;
  rw: number;
  rh: number;
  ts: number;
  ox: number;
  oy: number;
  gc: string;
  gj: number;
  tl: "p" | "g" | "e" | "c";
  ps?: "o" | "d" | "s" | "i";
  mf: string;
  c: string;
  cs?: string[];
  a?: Array<[number, number, "o" | "d" | "s", number]>;
  e?: Array<[number, number, Side, number]>;
  k?: Array<[number, number, Corner, number]>;
};

let pendingSnapshot = "";
let lastWrittenSnapshot = "";
let isWritingUrl = false;
let debounceTimer: number | undefined;

export async function loadState(workspace: HTMLElement): Promise<AppState> {
  const params = new URLSearchParams(window.location.search);
  const next = cloneDefaultState();
  const encoded = params.get("s");
  if (encoded) {
    try {
      const compact = JSON.parse(await decodeStateParam(encoded)) as CompactState;
      console.log("Expanded URL tile state", compact);
      applyCompactState(compact, next);
    } catch (error) {
      console.warn("Unable to decode tile state URL; using defaults.", error);
    }
  }

  next.zoom = initialZoomForRoom(workspace, next.roomWidthInches, next.roomHeightInches);
  lastWrittenSnapshot = JSON.stringify(compactState(next));

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

export function updateUrl(state: AppState): void {
  const start = performance.now();
  pendingSnapshot = JSON.stringify(compactState(state));
  recordDebugUrlSync(performance.now() - start, pendingSnapshot.length);
  if (debounceTimer !== undefined) {
    window.clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(() => {
    debounceTimer = undefined;
    void processUrlWriteQueue();
  }, 10);
}

function applyCompactState(compact: CompactState, next: AppState): void {
  if (compact.v !== 2) {
    throw new Error(`Unsupported compressed state version ${String(compact.v)}.`);
  }

  next.mode = compact.m === "d" ? "diagonal" : "straight";
  next.showGrid = compact.q === 1;
  next.roomWidthInches = validRoomWidth(String(compact.rw)) ?? next.roomWidthInches;
  next.roomHeightInches = validRoomHeight(String(compact.rh)) ?? next.roomHeightInches;
  next.tileInches = validTileInches(String(compact.ts)) ?? next.tileInches;
  next.offsetXInches = validHalfInch(String(compact.ox)) ?? next.offsetXInches;
  next.offsetYInches = validHalfInch(String(compact.oy)) ?? next.offsetYInches;
  next.groutColorId = validGroutColor(compact.gc) ?? next.groutColorId;
  next.groutJointSixteenths = validGroutJoint(String(compact.gj)) ?? next.groutJointSixteenths;
  next.tool = toolFromCode(compact.tl) ?? next.tool;
  next.paintShape = next.tool === "paint" ? paintShapeFromCode(compact.ps) : undefined;
  next.manufacturerId = validManufacturer(compact.mf) ?? next.manufacturerId;
  next.colorId = validColor(next.manufacturerId, compact.c) ?? next.colorId;

  const colors = compact.cs ?? [];
  next.cells.clear();
  next.edgeInsets.clear();
  next.cornerInsets.clear();

  for (const record of compact.a ?? []) {
    const [col, row, kindCode, colorIndex] = record;
    const kind = tileKindFromCode(kindCode);
    const colorId = colors[colorIndex];
    if (Number.isInteger(col) && Number.isInteger(row) && kind && colorId) {
      next.cells.set(cellKey(col, row), { kind, colorId });
    }
  }

  for (const record of compact.e ?? []) {
    const [col, row, side, colorIndex] = record;
    const colorId = colors[colorIndex];
    if (Number.isInteger(col) && Number.isInteger(row) && validSide(side) && colorId) {
      next.edgeInsets.set(canonicalEdgeKey(col, row, side), { colorId });
    }
  }

  for (const record of compact.k ?? []) {
    const [col, row, corner, colorIndex] = record;
    const colorId = colors[colorIndex];
    if (Number.isInteger(col) && Number.isInteger(row) && validCorner(corner) && colorId) {
      next.cornerInsets.set(cornerKey(col, row, corner), { colorId });
    }
  }
}

function compactState(state: AppState): CompactState {
  const colorIndexes = new Map<string, number>();
  const colors: string[] = [];
  const colorIndex = (colorId: string): number => {
    const existing = colorIndexes.get(colorId);
    if (existing !== undefined) {
      return existing;
    }
    const next = colors.length;
    colors.push(colorId);
    colorIndexes.set(colorId, next);
    return next;
  };

  const compact: CompactState = {
    v: 2,
    m: state.mode === "diagonal" ? "d" : "s",
    rw: state.roomWidthInches,
    rh: state.roomHeightInches,
    ts: state.tileInches,
    ox: state.offsetXInches,
    oy: state.offsetYInches,
    gc: state.groutColorId,
    gj: state.groutJointSixteenths,
    tl: toolCode(state.tool),
    mf: state.manufacturerId,
    c: state.colorId,
  };

  if (state.showGrid) {
    compact.q = 1;
  }
  if (state.tool === "paint" && state.paintShape) {
    compact.ps = paintShapeCode(state.paintShape);
  }

  const cells: CompactState["a"] = [];
  for (const [key, tile] of state.cells) {
    const { col, row } = parseCellKey(key);
    cells.push([col, row, tileKindCode(tile.kind), colorIndex(tile.colorId)]);
  }
  if (cells.length > 0) {
    compact.a = cells;
  }

  const edgeInsets: CompactState["e"] = [];
  for (const [key, inset] of state.edgeInsets) {
    const edge = parseEdgeKey(key);
    edgeInsets.push([edge.col, edge.row, edge.side, colorIndex(inset.colorId)]);
  }
  if (edgeInsets.length > 0) {
    compact.e = edgeInsets;
  }

  const cornerInsets: CompactState["k"] = [];
  for (const [key, inset] of state.cornerInsets) {
    const corner = parseCornerKey(key);
    cornerInsets.push([corner.col, corner.row, corner.corner, colorIndex(inset.colorId)]);
  }
  if (cornerInsets.length > 0) {
    compact.k = cornerInsets;
  }

  if (colors.length > 0) {
    compact.cs = colors;
  }

  return compact;
}

async function processUrlWriteQueue(): Promise<void> {
  if (isWritingUrl || pendingSnapshot === "" || pendingSnapshot === lastWrittenSnapshot) {
    return;
  }

  isWritingUrl = true;
  const snapshot = pendingSnapshot;
  const start = performance.now();
  try {
    const encoded = await encodeStateParam(snapshot);
    if (pendingSnapshot === snapshot) {
      const nextUrl = `${window.location.pathname}?s=${encoded}`;
      window.history.replaceState(null, "", nextUrl);
      lastWrittenSnapshot = snapshot;
    }
  } catch (error) {
    console.warn("Unable to compress tile state URL.", error);
  } finally {
    recordDebugUrlWrite(performance.now() - start);
    isWritingUrl = false;
    if (pendingSnapshot !== lastWrittenSnapshot) {
      void processUrlWriteQueue();
    }
  }
}

async function encodeStateParam(snapshot: string): Promise<string> {
  const input = new TextEncoder().encode(snapshot);
  if ("CompressionStream" in window) {
    const stream = new Blob([bytesToArrayBuffer(input)]).stream().pipeThrough(new CompressionStream("gzip"));
    const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
    return `z${bytesToBase64Url(compressed)}`;
  }
  return `j${bytesToBase64Url(input)}`;
}

async function decodeStateParam(encoded: string): Promise<string> {
  const prefix = encoded[0];
  if (prefix === "z") {
    if (!("DecompressionStream" in window)) {
      throw new Error("This browser does not support compressed URLs.");
    }
    const bytes = base64UrlToBytes(encoded.slice(1));
    const stream = new Blob([bytesToArrayBuffer(bytes)]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new TextDecoder().decode(await new Response(stream).arrayBuffer());
  }
  if (prefix === "j") {
    const bytes = base64UrlToBytes(encoded.slice(1));
    return new TextDecoder().decode(bytes);
  }

  return new TextDecoder().decode(base64UrlToBytes(encoded));
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(index, index + 0x8000));
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toolCode(tool: Tool): CompactState["tl"] {
  if (tool === "grab") return "g";
  if (tool === "erase") return "e";
  if (tool === "colorPicker") return "c";
  return "p";
}

function toolFromCode(code: CompactState["tl"]): Tool | undefined {
  if (code === "g") return "grab";
  if (code === "e") return "erase";
  if (code === "c") return "colorPicker";
  if (code === "p") return "paint";
  return undefined;
}

function paintShapeCode(shape: PaintShape): NonNullable<CompactState["ps"]> {
  if (shape === "orthogonalCross") return "o";
  if (shape === "diagonalCross") return "d";
  if (shape === "star") return "s";
  return "i";
}

function paintShapeFromCode(code: CompactState["ps"]): PaintShape | undefined {
  if (code === "o") return "orthogonalCross";
  if (code === "d") return "diagonalCross";
  if (code === "s") return "star";
  if (code === "i") return "inset";
  return undefined;
}

function tileKindCode(kind: TileKind): "o" | "d" | "s" {
  if (kind === "orthogonalCross") return "o";
  if (kind === "diagonalCross") return "d";
  return "s";
}

function tileKindFromCode(code: "o" | "d" | "s"): TileKind | undefined {
  if (code === "o") return "orthogonalCross";
  if (code === "d") return "diagonalCross";
  if (code === "s") return "star";
  return undefined;
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
