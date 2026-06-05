/**
 * URL serialization format for the tile layout.
 *
 * The app stores its shareable state in a single query parameter:
 *
 *   ?s=<base64url(gzip(rawPayload))>
 *
 * There is deliberately no uncompressed/raw URL form. The page has not shipped
 * with backward-compatibility requirements, but once a format version is in use,
 * keep its reader stable and add a new `FORMAT_VERSION` for incompatible changes.
 *
 * Scope
 * -----
 * The serialized payload stores persistent layout state only:
 *
 * - layout mode
 * - grid visibility/layer
 * - room dimensions
 * - tile placeholder size
 * - grid offset
 * - grout color and grout width
 * - placed main tiles
 * - placed edge and corner tacos
 *
 * It intentionally does not store transient UI state such as zoom, current tool,
 * current paint shape, selected manufacturer, or selected color. Those reset to
 * app defaults when a URL is opened.
 *
 * Envelope
 * --------
 * The raw payload is gzipped as one byte sequence, then base64url encoded:
 *
 * - `+` becomes `-`
 * - `/` becomes `_`
 * - trailing `=` padding is omitted
 *
 * The reader restores padding, decodes base64url, gunzips, then parses the raw
 * payload.
 *
 * Primitive binary types
 * ----------------------
 * All multi-byte integers are big-endian.
 *
 *   uint8      1 byte, unsigned
 *   uint16     2 bytes, unsigned
 *   int16      2 bytes, signed two's-complement
 *   index      if value < 255: uint8 value
 *              otherwise:      uint8 255, then uint16 value
 *
 * Raw payload layout, format version 1
 * ------------------------------------
 *
 *   Header
 *     uint8  magic                // 0x53, ASCII "S"
 *     uint8  formatVersion        // 1
 *
 *   Settings
 *     uint8  view                 // 0=straight, 1=diagonal
 *     uint8  grid                 // 0=underneath, 1=on top
 *     uint16 roomAreaWidth        // inches
 *     uint16 roomAreaHeight       // inches
 *     uint8  placeholderSize      // inches
 *     int16  gridOffsetXTimes2    // half-inch units
 *     int16  gridOffsetYTimes2    // half-inch units
 *     uint8  groutColorId         // 1-based index in GROUT_COLORS
 *     uint8  groutWidth           // sixteenths of an inch
 *
 *   Grid window
 *     int16  originCol
 *     int16  originRow
 *     uint16 width                // grid cells
 *     uint16 height               // grid cells
 *
 *   Dictionary
 *     index  entryCount           // excludes implicit blank entry 0
 *     uint8  shape[entryCount]
 *     index  mainMaterial[entryCount]
 *     index  taco0Material[nonStarEntryCount]
 *     index  taco1Material[nonStarEntryCount]
 *     index  taco2Material[nonStarEntryCount]
 *     index  taco3Material[nonStarEntryCount]
 *
 *   Stream
 *     uint16 tokenCount
 *     index  token[tokenCount]
 *
 * Grid window and stream
 * ----------------------
 * The serializer finds the smallest rectangular grid window that contains every
 * placed main tile and every placed taco. Edge tacos touch two placeholders, so
 * both adjacent placeholders are included in the window. Empty layouts serialize
 * as a zero-sized grid window with an empty stream.
 *
 * The stream scans that rectangle row-major: left-to-right within each row,
 * top-to-bottom across rows. Each stream token is a dictionary entry index.
 *
 * Dictionary entries
 * ------------------
 * Dictionary entry 0 is always implicit blank and is never serialized. The
 * serialized entries are numbered `1..entryCount`.
 *
 *   shape:
 *     0 = blank              // only used by implicit entry 0
 *     1 = orthogonal cross
 *     2 = diagonal cross
 *     3 = star
 *
 *   material:
 *     0     = absent taco/material
 *     1..n  = locked tile material integer id from PaletteColor.iid
 *
 * For normal tile entries, `mainMaterial` is nonzero. Taco-only placeholders can
 * be represented as shape 1 or 2 with `mainMaterial = 0`; on read, no main tile
 * is created, but any taco columns are applied.
 *
 * Taco column order depends on the entry shape:
 *
 *   diagonal cross:   taco0=n,  taco1=e,  taco2=s,  taco3=w
 *   orthogonal cross: taco0=nw, taco1=ne, taco2=se, taco3=sw
 *   star:             omitted from all taco columns
 *
 * Stars never carry tacos. If an encoded star has taco data in a future format,
 * the version-1 reader has no place to read it.
 *
 * Shared edge taco conflicts
 * --------------------------
 * Edge tacos are canonicalized to one edge key. If two decoded placeholders
 * write the same canonical edge taco with different materials, the later
 * row-major value wins and a console error is reported. This preserves a
 * deterministic state while making corrupt/conflicting URLs visible during
 * debugging.
 *
 * Dictionary ordering
 * -------------------
 * The writer orders dictionary entries by descending frequency, then by lexical
 * state key. This gives common cells low indexes and keeps serialization
 * deterministic. The reader must not depend on this ordering; it consumes the
 * explicit dictionary in the payload.
 */
import {
  DEFAULT_STATE,
  GROUT_COLORS,
  GROUT_JOINT_OPTIONS,
  TILE_COLOR_IIDS_BY_ID,
  TILE_COLORS_BY_IID,
  TILE_SIZE_OPTIONS,
} from "./constants";
import { canonicalEdgeKey, cellKey, cornerKey, parseCellKey, parseCornerKey, parseEdgeKey } from "./keys";
import type { AppState, Corner, CrossKind, Side, TileKind } from "./types";

type ShapeCode = 0 | 1 | 2 | 3;

type CellState = {
  shape: ShapeCode;
  main: number;
  tacos: [number, number, number, number];
};

const MAGIC = 0x53;
const FORMAT_VERSION = 1;
const BLANK_KEY = "0|0|0|0|0|0";

export function snapshotState(state: AppState): string {
  return JSON.stringify({
    mode: state.mode,
    showGrid: state.showGrid,
    roomWidthInches: state.roomWidthInches,
    roomHeightInches: state.roomHeightInches,
    tileInches: state.tileInches,
    offsetXInches: state.offsetXInches,
    offsetYInches: state.offsetYInches,
    groutColorId: state.groutColorId,
    groutJointSixteenths: state.groutJointSixteenths,
    cells: sortedEntries(state.cells),
    edgeInsets: sortedEntries(state.edgeInsets),
    cornerInsets: sortedEntries(state.cornerInsets),
  });
}

export async function serialize(state: AppState): Promise<string> {
  return bytesToBase64Url(await gzip(serializeRaw(state)));
}

export async function deserialize(encoded: string): Promise<AppState> {
  return deserializeRaw(await gunzip(base64UrlToBytes(encoded)));
}

function serializeRaw(state: AppState): Uint8Array {
  const grid = buildGrid(state);
  const dictionary = buildDictionary(grid.rows);
  const writer = new ByteWriter();

  writer.writeByte(MAGIC);
  writer.writeByte(FORMAT_VERSION);

  writer.writeByte(state.mode === "diagonal" ? 1 : 0);
  writer.writeByte(state.showGrid ? 1 : 0);
  writer.writeUnsigned16(state.roomWidthInches);
  writer.writeUnsigned16(state.roomHeightInches);
  writer.writeByte(state.tileInches);
  writer.writeSigned16(halfInchUnits(state.offsetXInches));
  writer.writeSigned16(halfInchUnits(state.offsetYInches));
  writer.writeByte(groutColorIid(state.groutColorId));
  writer.writeByte(state.groutJointSixteenths);

  writer.writeSigned16(grid.originCol);
  writer.writeSigned16(grid.originRow);
  writer.writeUnsigned16(grid.width);
  writer.writeUnsigned16(grid.height);

  writeDictionary(writer, dictionary.entries);

  writer.writeUnsigned16(dictionary.stream.length);
  for (const token of dictionary.stream) {
    writer.writeIndex(token);
  }

  return writer.bytes();
}

function deserializeRaw(bytes: Uint8Array): AppState {
  const reader = new ByteReader(bytes);
  const magic = reader.readByte();
  const version = reader.readByte();
  if (magic !== MAGIC || version !== FORMAT_VERSION) {
    throw new Error(`Unsupported serialized state format ${magic}:${version}.`);
  }

  const state = cloneDefaultState();
  state.mode = reader.readByte() === 1 ? "diagonal" : "straight";
  state.showGrid = reader.readByte() === 1;
  state.roomWidthInches = reader.readUnsigned16();
  state.roomHeightInches = reader.readUnsigned16();
  state.tileInches = reader.readByte();
  state.offsetXInches = reader.readSigned16() / 2;
  state.offsetYInches = reader.readSigned16() / 2;
  state.groutColorId = groutColorIdFromIid(reader.readByte());
  state.groutJointSixteenths = reader.readByte();

  if (!TILE_SIZE_OPTIONS.includes(state.tileInches)) {
    throw new Error(`Unsupported tile size ${state.tileInches}.`);
  }
  if (!GROUT_JOINT_OPTIONS.includes(state.groutJointSixteenths)) {
    throw new Error(`Unsupported grout joint ${state.groutJointSixteenths}.`);
  }

  const originCol = reader.readSigned16();
  const originRow = reader.readSigned16();
  const width = reader.readUnsigned16();
  const height = reader.readUnsigned16();
  const entries = readDictionary(reader);
  const tokenCount = reader.readUnsigned16();

  state.cells.clear();
  state.edgeInsets.clear();
  state.cornerInsets.clear();

  for (let tokenIndex = 0; tokenIndex < tokenCount; tokenIndex += 1) {
    const token = reader.readIndex();
    const stateKey = entries[token];
    if (stateKey === undefined) {
      throw new Error(`Serialized stream referenced missing dictionary entry ${token}.`);
    }

    const rowOffset = Math.floor(tokenIndex / width);
    const colOffset = tokenIndex % width;
    if (rowOffset >= height) {
      continue;
    }
    applyCellState(state, originCol + colOffset, originRow + rowOffset, decodeStateKey(stateKey));
  }

  return state;
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

function buildGrid(state: AppState): { originCol: number; originRow: number; width: number; height: number; rows: string[][] } {
  const touched: Array<[number, number]> = [];

  for (const key of state.cells.keys()) {
    const cell = parseCellKey(key);
    touched.push([cell.col, cell.row]);
  }

  for (const key of state.edgeInsets.keys()) {
    const edge = parseEdgeKey(key);
    touched.push([edge.col, edge.row]);
    if (edge.side === "e") {
      touched.push([edge.col + 1, edge.row]);
    } else {
      touched.push([edge.col, edge.row + 1]);
    }
  }

  for (const key of state.cornerInsets.keys()) {
    const corner = parseCornerKey(key);
    touched.push([corner.col, corner.row]);
  }

  if (touched.length === 0) {
    return { originCol: 0, originRow: 0, width: 0, height: 0, rows: [] };
  }

  const cols = touched.map(([col]) => col);
  const rows = touched.map(([, row]) => row);
  const originCol = Math.min(...cols);
  const originRow = Math.min(...rows);
  const maxCol = Math.max(...cols);
  const maxRow = Math.max(...rows);
  const width = maxCol - originCol + 1;
  const height = maxRow - originRow + 1;
  const outputRows: string[][] = [];

  for (let row = originRow; row <= maxRow; row += 1) {
    const outputRow: string[] = [];
    for (let col = originCol; col <= maxCol; col += 1) {
      outputRow.push(encodeStateKey(cellStateAt(state, col, row)));
    }
    outputRows.push(outputRow);
  }

  return { originCol, originRow, width, height, rows: outputRows };
}

function cellStateAt(state: AppState, col: number, row: number): CellState {
  const tile = state.cells.get(cellKey(col, row));
  if (!tile) {
    const edgeTacos: [number, number, number, number] = [
      edgeInsetIid(state, col, row, "n"),
      edgeInsetIid(state, col, row, "e"),
      edgeInsetIid(state, col, row, "s"),
      edgeInsetIid(state, col, row, "w"),
    ];
    const cornerTacos: [number, number, number, number] = [
      cornerInsetIid(state, col, row, "nw"),
      cornerInsetIid(state, col, row, "ne"),
      cornerInsetIid(state, col, row, "se"),
      cornerInsetIid(state, col, row, "sw"),
    ];
    const hasEdgeTaco = edgeTacos.some((taco) => taco !== 0);
    const hasCornerTaco = cornerTacos.some((taco) => taco !== 0);
    if (hasEdgeTaco && hasCornerTaco) {
      console.error(`Cannot fully serialize both edge and corner tacos in empty placeholder ${col},${row}; edge tacos win.`);
    }
    if (hasEdgeTaco) {
      return { shape: 2, main: 0, tacos: edgeTacos };
    }
    if (hasCornerTaco) {
      return { shape: 1, main: 0, tacos: cornerTacos };
    }
    return decodeStateKey(BLANK_KEY);
  }

  const cell: CellState = { shape: shapeCode(tile.kind), main: materialIid(tile.colorId), tacos: [0, 0, 0, 0] };
  if (tile.kind === "diagonalCross") {
    cell.tacos = [
      edgeInsetIid(state, col, row, "n"),
      edgeInsetIid(state, col, row, "e"),
      edgeInsetIid(state, col, row, "s"),
      edgeInsetIid(state, col, row, "w"),
    ];
  } else if (tile.kind === "orthogonalCross") {
    cell.tacos = [
      cornerInsetIid(state, col, row, "nw"),
      cornerInsetIid(state, col, row, "ne"),
      cornerInsetIid(state, col, row, "se"),
      cornerInsetIid(state, col, row, "sw"),
    ];
  }
  return cell;
}

function buildDictionary(rows: string[][]): { entries: string[]; stream: number[] } {
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const state of row) {
      if (state !== BLANK_KEY) {
        counts.set(state, (counts.get(state) ?? 0) + 1);
      }
    }
  }

  const entries = [
    BLANK_KEY,
    ...[...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([state]) => state),
  ];
  const indexes = new Map(entries.map((entry, index) => [entry, index]));
  const stream = rows.flatMap((row) =>
    row.map((state) => {
      const index = indexes.get(state);
      if (index === undefined) {
        throw new Error(`Missing dictionary entry for ${state}.`);
      }
      return index;
    }),
  );
  return { entries, stream };
}

function writeDictionary(writer: ByteWriter, entries: string[]): void {
  const states = entries.slice(1).map(decodeStateKey);
  const tacoStates = states.filter((state) => state.shape !== 3);
  writer.writeIndex(states.length);
  for (const state of states) {
    writer.writeByte(state.shape);
  }
  for (const state of states) {
    writer.writeIndex(state.main);
  }
  for (let tacoIndex = 0; tacoIndex < 4; tacoIndex += 1) {
    for (const state of tacoStates) {
      writer.writeIndex(state.tacos[tacoIndex]);
    }
  }
}

function readDictionary(reader: ByteReader): string[] {
  const entryCount = reader.readIndex();
  const states: CellState[] = Array.from({ length: entryCount }, () => ({ shape: 0, main: 0, tacos: [0, 0, 0, 0] }));
  for (const state of states) {
    state.shape = reader.readByte() as ShapeCode;
    if (state.shape < 1 || state.shape > 3) {
      throw new Error(`Invalid serialized dictionary shape ${state.shape}.`);
    }
  }
  for (const state of states) {
    state.main = reader.readIndex();
  }

  const tacoStates = states.filter((state) => state.shape !== 3);
  for (let tacoIndex = 0; tacoIndex < 4; tacoIndex += 1) {
    for (const state of tacoStates) {
      state.tacos[tacoIndex] = reader.readIndex();
    }
  }

  return [BLANK_KEY, ...states.map(encodeStateKey)];
}

function applyCellState(appState: AppState, col: number, row: number, state: CellState): void {
  if (state.shape === 0) {
    return;
  }

  const kind = tileKindForShape(state.shape);
  if (state.main !== 0) {
    appState.cells.set(cellKey(col, row), { kind, colorId: colorIdForIid(state.main) });
  }

  if (kind === "diagonalCross") {
    const sides: Side[] = ["n", "e", "s", "w"];
    for (let index = 0; index < sides.length; index += 1) {
      const taco = state.tacos[index];
      if (taco !== 0) {
        setEdgeInset(appState, canonicalEdgeKey(col, row, sides[index]), colorIdForIid(taco));
      }
    }
  } else if (kind === "orthogonalCross") {
    const corners: Corner[] = ["nw", "ne", "se", "sw"];
    for (let index = 0; index < corners.length; index += 1) {
      const taco = state.tacos[index];
      if (taco !== 0) {
        appState.cornerInsets.set(cornerKey(col, row, corners[index]), { colorId: colorIdForIid(taco) });
      }
    }
  }
}

function setEdgeInset(state: AppState, key: string, colorId: string): void {
  const existing = state.edgeInsets.get(key);
  if (existing && existing.colorId !== colorId) {
    console.error(`Conflicting serialized edge taco ${key}: ${existing.colorId} vs ${colorId}. Last value wins.`);
  }
  state.edgeInsets.set(key, { colorId });
}

function edgeInsetIid(state: AppState, col: number, row: number, side: Side): number {
  const inset = state.edgeInsets.get(canonicalEdgeKey(col, row, side));
  return inset ? materialIid(inset.colorId) : 0;
}

function cornerInsetIid(state: AppState, col: number, row: number, corner: Corner): number {
  const inset = state.cornerInsets.get(cornerKey(col, row, corner));
  return inset ? materialIid(inset.colorId) : 0;
}

function shapeCode(kind: TileKind): ShapeCode {
  if (kind === "orthogonalCross") return 1;
  if (kind === "diagonalCross") return 2;
  return 3;
}

function tileKindForShape(shape: ShapeCode): TileKind {
  if (shape === 1) return "orthogonalCross";
  if (shape === 2) return "diagonalCross";
  if (shape === 3) return "star";
  throw new Error(`Invalid serialized tile shape ${shape}.`);
}

function materialIid(colorId: string): number {
  const iid = TILE_COLOR_IIDS_BY_ID.get(colorId);
  if (iid === undefined) {
    throw new Error(`Unknown tile material ${colorId}.`);
  }
  return iid;
}

function colorIdForIid(iid: number): string {
  const color = TILE_COLORS_BY_IID.get(iid);
  if (!color) {
    throw new Error(`Unknown tile material integer id ${iid}.`);
  }
  return color.id;
}

function groutColorIid(colorId: string): number {
  const index = GROUT_COLORS.findIndex((color) => color.id === colorId);
  if (index < 0) {
    throw new Error(`Unknown grout color ${colorId}.`);
  }
  return index + 1;
}

function groutColorIdFromIid(iid: number): string {
  const color = GROUT_COLORS[iid - 1];
  if (!color) {
    throw new Error(`Unknown grout color integer id ${iid}.`);
  }
  return color.id;
}

function halfInchUnits(value: number): number {
  const scaled = value * 2;
  const rounded = Math.round(scaled);
  if (Math.abs(scaled - rounded) > 1e-9) {
    throw new Error(`Offset is not representable in half-inch units: ${value}`);
  }
  return rounded;
}

function encodeStateKey(state: CellState): string {
  return [state.shape, state.main, ...state.tacos].join("|");
}

function decodeStateKey(key: string): CellState {
  const [shape, main, a, b, c, d] = key.split("|").map(Number);
  return {
    shape: shape as ShapeCode,
    main,
    tacos: [a, b, c, d],
  };
}

function sortedEntries<T>(entries: Map<string, T>): Array<[string, T]> {
  return [...entries.entries()].sort(([a], [b]) => a.localeCompare(b));
}

async function gzip(bytes: Uint8Array): Promise<Uint8Array> {
  if (!("CompressionStream" in window)) {
    throw new Error("This browser does not support compressed URLs.");
  }
  const stream = new Blob([bytesToArrayBuffer(bytes)]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  if (!("DecompressionStream" in window)) {
    throw new Error("This browser does not support compressed URLs.");
  }
  const stream = new Blob([bytesToArrayBuffer(bytes)]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
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

class ByteWriter {
  private output: number[] = [];

  writeByte(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new Error(`Byte value out of range: ${value}`);
    }
    this.output.push(value);
  }

  writeUnsigned16(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > 0xffff) {
      throw new Error(`Unsigned 16-bit value out of range: ${value}`);
    }
    this.writeByte((value >> 8) & 0xff);
    this.writeByte(value & 0xff);
  }

  writeSigned16(value: number): void {
    if (!Number.isInteger(value) || value < -0x8000 || value > 0x7fff) {
      throw new Error(`Signed 16-bit value out of range: ${value}`);
    }
    this.writeUnsigned16(value & 0xffff);
  }

  writeIndex(value: number): void {
    if (value < 255) {
      this.writeByte(value);
    } else {
      this.writeByte(255);
      this.writeUnsigned16(value);
    }
  }

  bytes(): Uint8Array {
    return Uint8Array.from(this.output);
  }
}

class ByteReader {
  private offset = 0;

  constructor(private readonly bytes: Uint8Array) {}

  readByte(): number {
    if (this.offset >= this.bytes.length) {
      throw new Error("Unexpected end of serialized state.");
    }
    const value = this.bytes[this.offset];
    this.offset += 1;
    return value;
  }

  readUnsigned16(): number {
    return (this.readByte() << 8) | this.readByte();
  }

  readSigned16(): number {
    const value = this.readUnsigned16();
    return value & 0x8000 ? value - 0x10000 : value;
  }

  readIndex(): number {
    const value = this.readByte();
    return value < 255 ? value : this.readUnsigned16();
  }
}
