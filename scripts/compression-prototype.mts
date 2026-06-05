import { readFileSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";

type ShapeCode = "_" | "o" | "d" | "s";
type Side = "n" | "e" | "s" | "w";
type Corner = "nw" | "ne" | "se" | "sw";

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

type CellState = {
  shape: ShapeCode;
  main: number;
  tacos: [number, number, number, number];
};

type MaterialMode = "localJson" | "localGlobalIds" | "directGlobalIds";
type SettingsMode = "json" | "binary";

type DictionaryEntry = {
  sequence: string[];
  current: string;
  prefixIndex: number | undefined;
};

type CompressionOptions = {
  maxSequenceLength: number;
  maxSequenceEntries: number;
  candidateLimit: number;
};

const BLANK_STATE = "_|0|0|0|0|0";
const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSequenceLength: 8,
  maxSequenceEntries: 160,
  candidateLimit: 800,
};
const SINGLE_CELL_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSequenceLength: 1,
  maxSequenceEntries: 0,
  candidateLimit: 0,
};
const TILE_MATERIAL_IDS = buildTileMaterialIds();
const GROUT_COLOR_IDS = buildGroutColorIds();

class BitWriter {
  private pendingByte = 0;
  private pendingBitCount = 0;
  private output: number[] = [];
  bitLength = 0;

  writeBits(value: number, count: number): void {
    for (let bit = count - 1; bit >= 0; bit -= 1) {
      this.writeBit((value >> bit) & 1);
    }
  }

  writeBit(value: number): void {
    this.pendingByte = (this.pendingByte << 1) | (value & 1);
    this.pendingBitCount += 1;
    this.bitLength += 1;
    if (this.pendingBitCount === 8) {
      this.output.push(this.pendingByte);
      this.pendingByte = 0;
      this.pendingBitCount = 0;
    }
  }

  writeUnsigned16(value: number): void {
    this.writeBits(value & 0xffff, 16);
  }

  writeSigned16(value: number): void {
    this.writeUnsigned16(value);
  }

  writeVarIndex(value: number): void {
    if (value < 15) {
      this.writeBits(value, 4);
    } else if (value < 255) {
      this.writeBits(15, 4);
      this.writeBits(value, 8);
    } else {
      this.writeBits(15, 4);
      this.writeBits(255, 8);
      this.writeBits(value, 16);
    }
  }

  writeByteString(value: string): void {
    const bytes = Buffer.from(value, "utf8");
    this.writeUnsigned16(bytes.length);
    for (const byte of bytes) {
      this.writeBits(byte, 8);
    }
  }

  bytes(): Buffer {
    const bytes = [...this.output];
    if (this.pendingBitCount > 0) {
      bytes.push(this.pendingByte << (8 - this.pendingBitCount));
    }
    return Buffer.from(bytes);
  }
}

class ByteWriter {
  private output: number[] = [];

  get byteLength(): number {
    return this.output.length;
  }

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

  writeByteString(value: string): void {
    const bytes = Buffer.from(value, "utf8");
    this.writeUnsigned16(bytes.length);
    for (const byte of bytes) {
      this.writeByte(byte);
    }
  }

  bytes(): Buffer {
    return Buffer.from(this.output);
  }
}

const markdown = readFileSync("COMPRESSION.md", "utf8");
const urlMatch = markdown.match(/https?:\/\/\S+/);
if (!urlMatch) {
  throw new Error("COMPRESSION.md does not contain a URL.");
}

const url = new URL(urlMatch[0]);
const encoded = url.searchParams.get("s");
if (!encoded) {
  throw new Error("The URL does not contain an s= parameter.");
}

const expandedJson = decodeStateParam(encoded);
const compact = JSON.parse(expandedJson) as CompactState;
const grid = buildGrid(compact);
const result = buildCompressedModel(grid.rows, SINGLE_CELL_COMPRESSION_OPTIONS);
const directGlobalGrid = buildGrid(compact, "directGlobalIds");
const directGlobalResult = buildCompressedModel(directGlobalGrid.rows, SINGLE_CELL_COMPRESSION_OPTIONS);
const oldGzipBytes = encoded[0] === "z" ? base64UrlToBytes(encoded.slice(1)).length : gzipSync(Buffer.from(expandedJson)).length;
const packed = packPrototype(compact, grid, result);
const packedStream = packStreamOnly(result.stream);
const packedByteStream = packByteStreamOnly(result.stream);
const streamAnalysis = analyzeStream(grid.rows, result);
const experiments = runExperiments(compact, grid);
const materialExperiments = {
  globalTileMaterials: TILE_MATERIAL_IDS.size,
  compactCs: compact.cs?.map((material) => ({
    material,
    globalId: requireTileMaterialId(material),
  })),
  localJsonCs: summarizePacked(packPrototypeWithColumnarDictionary(compact, grid, result, "localJson")),
  localGlobalIdCs: summarizePacked(packPrototypeWithColumnarDictionary(compact, grid, result, "localGlobalIds")),
  directGlobalIds: summarizePacked(packPrototypeWithColumnarDictionary(compact, directGlobalGrid, directGlobalResult, "directGlobalIds")),
  directGlobalIdsAndBinarySettings: summarizePacked(
    packPrototypeWithColumnarDictionary(compact, directGlobalGrid, directGlobalResult, "directGlobalIds", "binary"),
  ),
};

console.log(
  JSON.stringify(
    {
      old: {
        urlChars: urlMatch[0].length,
        queryChars: encoded.length,
        gzipBytes: oldGzipBytes,
        expandedJsonBytes: Buffer.byteLength(expandedJson),
      },
      grid: {
        originCol: grid.originCol,
        originRow: grid.originRow,
        width: grid.width,
        height: grid.height,
        cells: grid.width * grid.height,
        nonBlankCells: grid.nonBlankCells,
        ignoredInsets: grid.ignoredInsets,
      },
      dictionary: {
        entriesIncludingBlank: result.entries.length,
        singleEntries: result.singleEntryCount,
        sequenceEntries: result.entries.length - result.singleEntryCount,
        lowIndexEntries: describeEntriesByIndex(result, result.entries.length),
        mostUsedEntries: describeEntriesByUse(result, result.entries.length),
      },
      stream: {
        tokens: result.stream.length,
        rawCellTokens: grid.width * grid.height,
        streamBits: result.streamBits,
        dictionaryBits: result.dictionaryBits,
        analysis: streamAnalysis,
      },
      actualPacked: {
        bytes: packed.bytes.length,
        bits: packed.bitLength,
        base64UrlChars: bytesToBase64Url(packed.bytes).length,
        gzipBytes: gzipSync(packed.bytes).length,
        gzipBase64UrlChars: bytesToBase64Url(gzipSync(packed.bytes)).length,
        fixedDictionary: summarizePacked(packPrototypeWithFixedDictionary(compact, grid, result)),
        columnarDictionary: summarizePacked(packPrototypeWithColumnarDictionary(compact, grid, result)),
        materialExperiments,
        streamOnly: {
          bytes: packedStream.length,
          base64UrlChars: bytesToBase64Url(packedStream).length,
          gzipBytes: gzipSync(packedStream).length,
          gzipBase64UrlChars: bytesToBase64Url(gzipSync(packedStream)).length,
        },
        byteStreamOnly: {
          bytes: packedByteStream.length,
          base64UrlChars: bytesToBase64Url(packedByteStream).length,
          gzipBytes: gzipSync(packedByteStream).length,
          gzipBase64UrlChars: bytesToBase64Url(gzipSync(packedByteStream)).length,
        },
        sections: packed.sections,
      },
      experiments,
    },
    null,
    2,
  ),
);

function describeEntriesByIndex(result: ReturnType<typeof buildCompressedModel>, count: number): Array<{
  index: number;
  length: number;
  uses: number;
  sequence: string[];
}> {
  return result.entries.slice(0, count).map((entry, index) => describeEntry(result, entry, index));
}

function describeEntriesByUse(result: ReturnType<typeof buildCompressedModel>, count: number): Array<{
  index: number;
  length: number;
  uses: number;
  sequence: string[];
}> {
  return result.entries
    .map((entry, index) => describeEntry(result, entry, index))
    .sort((a, b) => b.uses - a.uses || b.length - a.length || a.index - b.index)
    .slice(0, count);
}

function describeEntry(
  result: ReturnType<typeof buildCompressedModel>,
  entry: DictionaryEntry,
  index: number,
): { index: number; length: number; uses: number; sequence: string[] } {
  return {
    index,
    length: entry.sequence.length,
    uses: result.tokenUseCounts.get(index) ?? 0,
    sequence: entry.sequence.map(describeState),
  };
}

function decodeStateParam(value: string): string {
  const prefix = value[0];
  if (prefix === "z") {
    return gunzipSync(base64UrlToBytes(value.slice(1))).toString("utf8");
  }
  if (prefix === "j") {
    return base64UrlToBytes(value.slice(1)).toString("utf8");
  }
  return base64UrlToBytes(value).toString("utf8");
}

function base64UrlToBytes(value: string): Buffer {
  let base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  base64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Buffer.from(base64, "base64");
}

function bytesToBase64Url(bytes: Buffer): string {
  return bytes.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function buildGrid(compact: CompactState, materialMode: MaterialMode = "localJson"): {
  originCol: number;
  originRow: number;
  width: number;
  height: number;
  rows: string[][];
  nonBlankCells: number;
  ignoredInsets: number;
} {
  const materialForColorIndex = (colorIndex: number): number => materialIndex(compact, materialMode, colorIndex);
  const cells = new Map<string, { shape: Exclude<ShapeCode, "_">; main: number }>();
  const edges = new Map<string, number>();
  const corners = new Map<string, number>();
  const touched: Array<[number, number]> = [];

  for (const [col, row, shape, colorIndex] of compact.a ?? []) {
    cells.set(cellKey(col, row), { shape, main: materialForColorIndex(colorIndex) });
    touched.push([col, row]);
  }

  for (const [col, row, side, colorIndex] of compact.e ?? []) {
    const key = canonicalEdgeKey(col, row, side);
    edges.set(key, materialForColorIndex(colorIndex));
    const edge = parseEdgeKey(key);
    touched.push([edge.col, edge.row]);
    if (edge.side === "e") touched.push([edge.col + 1, edge.row]);
    if (edge.side === "s") touched.push([edge.col, edge.row + 1]);
  }

  for (const [col, row, corner, colorIndex] of compact.k ?? []) {
    corners.set(cornerKey(col, row, corner), materialForColorIndex(colorIndex));
    touched.push([col, row]);
  }

  if (touched.length === 0) {
    return { originCol: 0, originRow: 0, width: 0, height: 0, rows: [], nonBlankCells: 0, ignoredInsets: 0 };
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
  let nonBlankCells = 0;
  let ignoredInsets = 0;

  for (let row = originRow; row <= maxRow; row += 1) {
    const outputRow: string[] = [];
    for (let col = originCol; col <= maxCol; col += 1) {
      const tile = cells.get(cellKey(col, row));
      const state: CellState = tile
        ? { shape: tile.shape, main: tile.main, tacos: [0, 0, 0, 0] }
        : { shape: "_", main: 0, tacos: [0, 0, 0, 0] };

      if (state.shape === "d") {
        state.tacos = [
          edges.get(canonicalEdgeKey(col, row, "n")) ?? 0,
          edges.get(canonicalEdgeKey(col, row, "e")) ?? 0,
          edges.get(canonicalEdgeKey(col, row, "s")) ?? 0,
          edges.get(canonicalEdgeKey(col, row, "w")) ?? 0,
        ];
      } else if (state.shape === "o") {
        state.tacos = [
          corners.get(cornerKey(col, row, "nw")) ?? 0,
          corners.get(cornerKey(col, row, "ne")) ?? 0,
          corners.get(cornerKey(col, row, "se")) ?? 0,
          corners.get(cornerKey(col, row, "sw")) ?? 0,
        ];
      }

      const key = encodeStateKey(state);
      if (key !== BLANK_STATE) {
        nonBlankCells += 1;
      }
      outputRow.push(key);
    }
    outputRows.push(outputRow);
  }

  for (const [key] of edges) {
    const edge = parseEdgeKey(key);
    const first = cells.get(cellKey(edge.col, edge.row));
    const second = edge.side === "e" ? cells.get(cellKey(edge.col + 1, edge.row)) : cells.get(cellKey(edge.col, edge.row + 1));
    if (first?.shape !== "d" && second?.shape !== "d") {
      ignoredInsets += 1;
    }
  }
  for (const [key] of corners) {
    const corner = parseCornerKey(key);
    if (cells.get(cellKey(corner.col, corner.row))?.shape !== "o") {
      ignoredInsets += 1;
    }
  }

  return { originCol, originRow, width, height, rows: outputRows, nonBlankCells, ignoredInsets };
}

function buildCompressedModel(rows: string[][], options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS): {
  entries: DictionaryEntry[];
  singleEntryCount: number;
  stream: number[];
  streamBits: number;
  dictionaryBits: number;
  tokenUseCounts: Map<number, number>;
} {
  const entries: DictionaryEntry[] = [{ sequence: [BLANK_STATE], current: BLANK_STATE, prefixIndex: undefined }];
  const indexBySequence = new Map<string, number>([[sequenceKey([BLANK_STATE]), 0]]);
  const stateFrequency = new Map<string, number>();

  for (const row of rows) {
    for (const state of row) {
      if (state !== BLANK_STATE) {
        increment(stateFrequency, state);
      }
    }
  }

  for (const [state] of [...stateFrequency.entries()].sort((a, b) => b[1] - a[1])) {
    addEntry(entries, indexBySequence, [state]);
  }

  const singleEntryCount = entries.length;
  let encoded = encodeRows(rows, entries, indexBySequence);

  for (let iteration = 0; iteration < options.maxSequenceEntries; iteration += 1) {
    const currentBits = dictionaryBits(entries) + encoded.bits;
    let best:
      | {
          sequence: string[];
          entries: DictionaryEntry[];
          indexBySequence: Map<string, number>;
          encoded: ReturnType<typeof encodeRows>;
          savings: number;
        }
      | undefined;

    for (const sequence of candidateSequences(rows, options)) {
      if (indexBySequence.has(sequenceKey(sequence))) {
        continue;
      }
      const trialEntries = cloneEntries(entries);
      const trialIndex = new Map(indexBySequence);
      addSequenceChain(trialEntries, trialIndex, sequence);
      const trialEncoded = encodeRows(rows, trialEntries, trialIndex);
      const trialBits = dictionaryBits(trialEntries) + trialEncoded.bits;
      const savings = currentBits - trialBits;
      if (savings > (best?.savings ?? 0)) {
        best = { sequence, entries: trialEntries, indexBySequence: trialIndex, encoded: trialEncoded, savings };
      }
    }

    if (!best || best.savings <= 0) {
      break;
    }

    entries.splice(0, entries.length, ...best.entries);
    indexBySequence.clear();
    for (const [key, value] of best.indexBySequence) {
      indexBySequence.set(key, value);
    }
    encoded = best.encoded;
  }

  const reordered = reorderDictionary(entries, encoded.useCounts);
  const reorderedIndex = indexMapForEntries(reordered);
  const reorderedEncoded = encodeRows(rows, reordered, reorderedIndex);

  return {
    entries: reordered,
    singleEntryCount,
    stream: reorderedEncoded.tokens,
    streamBits: reorderedEncoded.bits,
    dictionaryBits: dictionaryBits(reordered),
    tokenUseCounts: reorderedEncoded.useCounts,
  };
}

function candidateSequences(rows: string[][], options: CompressionOptions): string[][] {
  const counts = new Map<string, { sequence: string[]; count: number }>();
  for (const row of rows) {
    for (let start = 0; start < row.length; start += 1) {
      for (let length = 2; length <= options.maxSequenceLength && start + length <= row.length; length += 1) {
        const sequence = row.slice(start, start + length);
        const key = sequenceKey(sequence);
        const existing = counts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          counts.set(key, { sequence, count: 1 });
        }
      }
    }
  }
  return [...counts.values()]
    .filter((candidate) => candidate.count >= 2)
    .sort((a, b) => b.count * b.sequence.length - a.count * a.sequence.length)
    .slice(0, options.candidateLimit)
    .map((candidate) => candidate.sequence);
}

function encodeRows(
  rows: string[][],
  entries: DictionaryEntry[],
  indexBySequence: Map<string, number>,
): { tokens: number[]; bits: number; useCounts: Map<number, number> } {
  const sequenceByIndex = entries.map((entry) => entry.sequence);
  const tokens: number[] = [];
  const useCounts = new Map<number, number>();

  for (const row of rows) {
    let position = 0;
    while (position < row.length) {
      let bestIndex = -1;
      let bestLength = 0;
      let bestCost = Number.POSITIVE_INFINITY;
      for (let index = 0; index < sequenceByIndex.length; index += 1) {
        const sequence = sequenceByIndex[index];
        if (!sequenceMatchesRow(sequence, row, position)) {
          continue;
        }
        const consumed = Math.min(sequence.length, row.length - position);
        const cost = indexBits(index);
        if (consumed > bestLength || (consumed === bestLength && cost < bestCost)) {
          bestIndex = index;
          bestLength = consumed;
          bestCost = cost;
        }
      }
      if (bestIndex < 0) {
        throw new Error(`No dictionary entry matched row position ${position}.`);
      }
      tokens.push(bestIndex);
      increment(useCounts, bestIndex);
      position += bestLength;
    }
  }

  return {
    tokens,
    bits: tokens.reduce((sum, token) => sum + indexBits(token), 0),
    useCounts,
  };
}

function analyzeStream(
  rows: string[][],
  result: ReturnType<typeof buildCompressedModel>,
): {
  tokenCategories: Record<string, { tokens: number; bits: number; cells: number }>;
  rowSummary: {
    emptyRows: number;
    nonEmptyRows: number;
    currentBits: number;
    currentTokens: number;
    occupiedSpanBits: number;
    occupiedSpanTokens: number;
    occupiedSpanSavingsBeforeRowOverhead: number;
    leadingOrTrailingBlankBits: number;
    leadingOrTrailingBlankTokens: number;
  };
  worstRows: Array<{
    rowIndex: number;
    gridRowWidth: number;
    firstNonBlank: number | null;
    lastNonBlank: number | null;
    nonBlankCells: number;
    currentTokens: number;
    currentBits: number;
    occupiedSpanTokens: number;
    occupiedSpanBits: number;
    leadingBlankCells: number;
    trailingBlankCells: number;
  }>;
} {
  const categories = new Map<string, { tokens: number; bits: number; cells: number }>();
  const indexBySequence = indexMapForEntries(result.entries);
  let streamPosition = 0;
  let currentBits = 0;
  let currentTokens = 0;
  let occupiedSpanBits = 0;
  let occupiedSpanTokens = 0;
  let leadingOrTrailingBlankBits = 0;
  let leadingOrTrailingBlankTokens = 0;
  let emptyRows = 0;
  let nonEmptyRows = 0;
  const rowDetails: Array<{
    rowIndex: number;
    gridRowWidth: number;
    firstNonBlank: number | null;
    lastNonBlank: number | null;
    nonBlankCells: number;
    currentTokens: number;
    currentBits: number;
    occupiedSpanTokens: number;
    occupiedSpanBits: number;
    leadingBlankCells: number;
    trailingBlankCells: number;
  }> = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const firstNonBlank = row.findIndex((state) => state !== BLANK_STATE);
    const lastNonBlank = findLastIndex(row, (state) => state !== BLANK_STATE);
    const nonBlankCells = row.filter((state) => state !== BLANK_STATE).length;
    const rowStartStreamPosition = streamPosition;
    let rowBits = 0;
    let rowTokens = 0;
    let rowCellPosition = 0;
    let rowEdgeBlankBits = 0;
    let rowEdgeBlankTokens = 0;

    while (rowCellPosition < row.length) {
      const token = result.stream[streamPosition];
      const sequence = result.entries[token].sequence;
      const consumed = Math.min(sequence.length, row.length - rowCellPosition);
      const bits = indexBits(token);
      const tokenFirstCell = rowCellPosition;
      const tokenLastCell = rowCellPosition + consumed - 1;
      const touchesOnlyLeadingOrTrailingBlanks =
        firstNonBlank < 0 ||
        tokenLastCell < firstNonBlank ||
        tokenFirstCell > lastNonBlank;

      incrementCategory(categories, tokenCategory(sequence), bits, consumed);
      if (touchesOnlyLeadingOrTrailingBlanks) {
        rowEdgeBlankBits += bits;
        rowEdgeBlankTokens += 1;
      }
      rowBits += bits;
      rowTokens += 1;
      rowCellPosition += consumed;
      streamPosition += 1;
    }

    let spanBits = 0;
    let spanTokens = 0;
    if (firstNonBlank >= 0 && lastNonBlank >= 0) {
      nonEmptyRows += 1;
      const span = row.slice(firstNonBlank, lastNonBlank + 1);
      const encodedSpan = encodeRows([span], result.entries, indexBySequence);
      spanBits = encodedSpan.bits;
      spanTokens = encodedSpan.tokens.length;
    } else {
      emptyRows += 1;
    }

    currentBits += rowBits;
    currentTokens += rowTokens;
    occupiedSpanBits += spanBits;
    occupiedSpanTokens += spanTokens;
    leadingOrTrailingBlankBits += rowEdgeBlankBits;
    leadingOrTrailingBlankTokens += rowEdgeBlankTokens;
    rowDetails.push({
      rowIndex,
      gridRowWidth: row.length,
      firstNonBlank: firstNonBlank < 0 ? null : firstNonBlank,
      lastNonBlank: lastNonBlank < 0 ? null : lastNonBlank,
      nonBlankCells,
      currentTokens: rowTokens,
      currentBits: rowBits,
      occupiedSpanTokens: spanTokens,
      occupiedSpanBits: spanBits,
      leadingBlankCells: firstNonBlank < 0 ? row.length : firstNonBlank,
      trailingBlankCells: lastNonBlank < 0 ? row.length : row.length - lastNonBlank - 1,
    });

    if (streamPosition - rowStartStreamPosition !== rowTokens) {
      throw new Error("Internal stream analysis row token mismatch.");
    }
  }

  return {
    tokenCategories: Object.fromEntries([...categories.entries()].sort((a, b) => b[1].bits - a[1].bits)),
    rowSummary: {
      emptyRows,
      nonEmptyRows,
      currentBits,
      currentTokens,
      occupiedSpanBits,
      occupiedSpanTokens,
      occupiedSpanSavingsBeforeRowOverhead: currentBits - occupiedSpanBits,
      leadingOrTrailingBlankBits,
      leadingOrTrailingBlankTokens,
    },
    worstRows: rowDetails
      .sort((a, b) => b.currentBits - b.occupiedSpanBits - (a.currentBits - a.occupiedSpanBits))
      .slice(0, 12),
  };
}

function tokenCategory(sequence: string[]): string {
  if (sequence.every((state) => state === BLANK_STATE)) {
    return sequence.length === 1 ? "single blank" : `blank run len ${sequence.length}`;
  }
  if (sequence.length === 1) {
    return "single nonblank";
  }
  if (sequence.some((state) => state === BLANK_STATE)) {
    return "mixed sequence";
  }
  return "nonblank sequence";
}

function incrementCategory(
  categories: Map<string, { tokens: number; bits: number; cells: number }>,
  key: string,
  bits: number,
  cells: number,
): void {
  const existing = categories.get(key) ?? { tokens: 0, bits: 0, cells: 0 };
  existing.tokens += 1;
  existing.bits += bits;
  existing.cells += cells;
  categories.set(key, existing);
}

function findLastIndex<T>(values: T[], predicate: (value: T) => boolean): number {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (predicate(values[index])) {
      return index;
    }
  }
  return -1;
}

function sequenceMatchesRow(sequence: string[], row: string[], position: number): boolean {
  for (let i = 0; i < sequence.length; i += 1) {
    const rowIndex = position + i;
    if (rowIndex >= row.length) {
      return sequence.slice(i).every((state) => state === BLANK_STATE);
    }
    if (sequence[i] !== row[rowIndex]) {
      return false;
    }
  }
  return true;
}

function addSequenceChain(entries: DictionaryEntry[], indexBySequence: Map<string, number>, sequence: string[]): void {
  for (let length = 1; length <= sequence.length; length += 1) {
    addEntry(entries, indexBySequence, sequence.slice(0, length));
  }
}

function addEntry(entries: DictionaryEntry[], indexBySequence: Map<string, number>, sequence: string[]): number {
  const key = sequenceKey(sequence);
  const existing = indexBySequence.get(key);
  if (existing !== undefined) {
    return existing;
  }
  const prefix = sequence.length > 1 ? sequence.slice(0, -1) : undefined;
  const prefixIndex = prefix ? indexBySequence.get(sequenceKey(prefix)) : undefined;
  if (prefix && prefixIndex === undefined) {
    throw new Error(`Missing prefix for ${key}.`);
  }
  const entry: DictionaryEntry = {
    sequence,
    current: sequence[sequence.length - 1],
    prefixIndex,
  };
  const index = entries.length;
  entries.push(entry);
  indexBySequence.set(key, index);
  return index;
}

function reorderDictionary(entries: DictionaryEntry[], useCounts: Map<number, number>): DictionaryEntry[] {
  const directUseBySequence = new Map<string, number>();
  for (let index = 0; index < entries.length; index += 1) {
    directUseBySequence.set(sequenceKey(entries[index].sequence), useCounts.get(index) ?? 0);
  }

  const scoreBySequence = new Map<string, number>();
  for (const entry of entries) {
    const use = directUseBySequence.get(sequenceKey(entry.sequence)) ?? 0;
    for (let length = 1; length <= entry.sequence.length; length += 1) {
      const prefix = sequenceKey(entry.sequence.slice(0, length));
      scoreBySequence.set(prefix, (scoreBySequence.get(prefix) ?? 0) + use);
    }
  }

  const remaining = new Map<string, DictionaryEntry>();
  for (const entry of entries.slice(1)) {
    remaining.set(sequenceKey(entry.sequence), entry);
  }

  const reordered: DictionaryEntry[] = [{ sequence: [BLANK_STATE], current: BLANK_STATE, prefixIndex: undefined }];
  const newIndex = new Map<string, number>([[sequenceKey([BLANK_STATE]), 0]]);

  while (remaining.size > 0) {
    const available = [...remaining.values()].filter((entry) => {
      const prefix = entry.sequence.length > 1 ? sequenceKey(entry.sequence.slice(0, -1)) : undefined;
      return prefix === undefined || newIndex.has(prefix);
    });
    if (available.length === 0) {
      throw new Error("Dictionary reorder found a prefix cycle.");
    }

    available.sort((a, b) => {
      const score = (scoreBySequence.get(sequenceKey(b.sequence)) ?? 0) - (scoreBySequence.get(sequenceKey(a.sequence)) ?? 0);
      if (score !== 0) return score;
      return b.sequence.length - a.sequence.length;
    });

    const entry = available[0];
    const key = sequenceKey(entry.sequence);
    const prefix = entry.sequence.length > 1 ? sequenceKey(entry.sequence.slice(0, -1)) : undefined;
    const next: DictionaryEntry = {
      sequence: [...entry.sequence],
      current: entry.current,
      prefixIndex: prefix === undefined ? undefined : newIndex.get(prefix),
    };
    newIndex.set(key, reordered.length);
    reordered.push(next);
    remaining.delete(key);
  }

  return reordered;
}

function indexMapForEntries(entries: DictionaryEntry[]): Map<string, number> {
  return new Map(entries.map((entry, index) => [sequenceKey(entry.sequence), index]));
}

function cloneEntries(entries: DictionaryEntry[]): DictionaryEntry[] {
  return entries.map((entry) => ({ sequence: [...entry.sequence], current: entry.current, prefixIndex: entry.prefixIndex }));
}

function dictionaryBits(entries: DictionaryEntry[]): number {
  let bits = 0;
  for (let index = 1; index < entries.length; index += 1) {
    const entry = entries[index];
    bits += prefixBits(entry.prefixIndex);
    bits += cellStateBits(entry.current);
  }
  return bits;
}

function packPrototype(
  compact: CompactState,
  grid: ReturnType<typeof buildGrid>,
  result: ReturnType<typeof buildCompressedModel>,
): { bytes: Buffer; bitLength: number; sections: Record<string, { bits: number; bytes: number }> } {
  const writer = new ByteWriter();
  const sections: Record<string, { bits: number; bytes: number }> = {};
  const section = (name: string, write: () => void): void => {
    const start = writer.byteLength;
    write();
    const bytes = writer.byteLength - start;
    sections[name] = { bits: bytes * 8, bytes };
  };

  section("header", () => {
    writer.writeByte(0x53); // "S"
    writer.writeByte(1);
  });

  section("settingsJson", () => {
    writer.writeByteString(JSON.stringify(settingsPayload(compact)));
  });

  section("materialsJson", () => {
    writer.writeByteString(JSON.stringify(compact.cs ?? []));
  });

  section("gridWindow", () => {
    writer.writeSigned16(grid.originCol);
    writer.writeSigned16(grid.originRow);
    writer.writeUnsigned16(grid.width);
    writer.writeUnsigned16(grid.height);
  });

  section("dictionary", () => {
    writer.writeIndex(result.entries.length - 1);
    for (const entry of result.entries.slice(1)) {
      writeDictionaryCellState(writer, entry.current);
    }
  });

  section("stream", () => {
    writer.writeUnsigned16(result.stream.length);
    for (const token of result.stream) {
      writer.writeIndex(token);
    }
  });

  const bytes = writer.bytes();
  return { bytes, bitLength: bytes.length * 8, sections };
}

function packBitPrototype(
  compact: CompactState,
  grid: ReturnType<typeof buildGrid>,
  result: ReturnType<typeof buildCompressedModel>,
): { bytes: Buffer; bitLength: number; sections: Record<string, { bits: number; bytes: number }> } {
  const writer = new BitWriter();
  const sections: Record<string, { bits: number; bytes: number }> = {};
  const section = (name: string, write: () => void): void => {
    const start = writer.bitLength;
    write();
    const bits = writer.bitLength - start;
    sections[name] = { bits, bytes: Math.ceil(bits / 8) };
  };

  section("header", () => {
    writer.writeBits(0x53, 8); // "S"
    writer.writeBits(1, 4);
  });

  section("settingsJson", () => {
    writer.writeByteString(JSON.stringify(settingsPayload(compact)));
  });

  section("materialsJson", () => {
    writer.writeByteString(JSON.stringify(compact.cs ?? []));
  });

  section("gridWindow", () => {
    writer.writeSigned16(grid.originCol);
    writer.writeSigned16(grid.originRow);
    writer.writeUnsigned16(grid.width);
    writer.writeUnsigned16(grid.height);
  });

  section("dictionary", () => {
    writer.writeVarIndex(result.entries.length - 1);
    for (const entry of result.entries.slice(1)) {
      writer.writeVarIndex(entry.prefixIndex === undefined ? 0 : entry.prefixIndex + 1);
      writeCellState(writer, entry.current);
    }
  });

  section("stream", () => {
    writer.writeVarIndex(result.stream.length);
    for (const token of result.stream) {
      writer.writeVarIndex(token);
    }
  });

  return { bytes: writer.bytes(), bitLength: writer.bitLength, sections };
}

function packPrototypeWithFixedDictionary(
  compact: CompactState,
  grid: ReturnType<typeof buildGrid>,
  result: ReturnType<typeof buildCompressedModel>,
): { bytes: Buffer; bitLength: number; sections: Record<string, { bits: number; bytes: number }> } {
  const writer = new ByteWriter();
  const sections: Record<string, { bits: number; bytes: number }> = {};
  const section = (name: string, write: () => void): void => {
    const start = writer.byteLength;
    write();
    const bytes = writer.byteLength - start;
    sections[name] = { bits: bytes * 8, bytes };
  };

  section("header", () => {
    writer.writeByte(0x53);
    writer.writeByte(1);
  });

  section("settingsJson", () => {
    writer.writeByteString(JSON.stringify(settingsPayload(compact)));
  });

  section("materialsJson", () => {
    writer.writeByteString(JSON.stringify(compact.cs ?? []));
  });

  section("gridWindow", () => {
    writer.writeSigned16(grid.originCol);
    writer.writeSigned16(grid.originRow);
    writer.writeUnsigned16(grid.width);
    writer.writeUnsigned16(grid.height);
  });

  section("dictionary", () => {
    writer.writeIndex(result.entries.length - 1);
    for (const entry of result.entries.slice(1)) {
      writeByteCellState(writer, entry.current);
    }
  });

  section("stream", () => {
    writer.writeUnsigned16(result.stream.length);
    for (const token of result.stream) {
      writer.writeIndex(token);
    }
  });

  const bytes = writer.bytes();
  return { bytes, bitLength: bytes.length * 8, sections };
}

function packPrototypeWithColumnarDictionary(
  compact: CompactState,
  grid: ReturnType<typeof buildGrid>,
  result: ReturnType<typeof buildCompressedModel>,
  materialMode: MaterialMode = "localJson",
  settingsMode: SettingsMode = "json",
): { bytes: Buffer; bitLength: number; sections: Record<string, { bits: number; bytes: number }> } {
  const writer = new ByteWriter();
  const sections: Record<string, { bits: number; bytes: number }> = {};
  const section = (name: string, write: () => void): void => {
    const start = writer.byteLength;
    write();
    const bytes = writer.byteLength - start;
    sections[name] = { bits: bytes * 8, bytes };
  };

  section("header", () => {
    writer.writeByte(0x53);
    writer.writeByte(1);
  });

  if (settingsMode === "json") {
    section("settingsJson", () => {
      writer.writeByteString(JSON.stringify(settingsPayload(compact)));
    });
  } else {
    section("settingsBinary", () => {
      writeBinarySettings(writer, compact);
    });
  }

  if (materialMode === "localJson") {
    section("materialsJson", () => {
      writer.writeByteString(JSON.stringify(compact.cs ?? []));
    });
  } else if (materialMode === "localGlobalIds") {
    section("materialsGlobalIds", () => {
      const ids = compactGlobalMaterialIds(compact);
      writer.writeIndex(ids.length);
      for (const id of ids) {
        writer.writeIndex(id);
      }
    });
  }

  section("gridWindow", () => {
    writer.writeSigned16(grid.originCol);
    writer.writeSigned16(grid.originRow);
    writer.writeUnsigned16(grid.width);
    writer.writeUnsigned16(grid.height);
  });

  section("dictionary", () => {
    const states = result.entries.slice(1).map((entry) => decodeStateKey(entry.current));
    const tacoStates = states.filter((state) => state.shape !== "s");
    writer.writeIndex(states.length);
    for (const state of states) {
      writer.writeByte(shapeIndex(state.shape));
    }
    for (const state of states) {
      writer.writeIndex(state.main);
    }
    for (let tacoIndex = 0; tacoIndex < 4; tacoIndex += 1) {
      for (const state of tacoStates) {
        writer.writeIndex(state.tacos[tacoIndex]);
      }
    }
  });

  section("stream", () => {
    writer.writeUnsigned16(result.stream.length);
    for (const token of result.stream) {
      writer.writeIndex(token);
    }
  });

  const bytes = writer.bytes();
  return { bytes, bitLength: bytes.length * 8, sections };
}

function summarizePacked(packed: { bytes: Buffer; bitLength: number; sections: Record<string, { bits: number; bytes: number }> }): {
  bytes: number;
  base64UrlChars: number;
  gzipBytes: number;
  gzipBase64UrlChars: number;
  sections: Record<string, { bits: number; bytes: number }>;
} {
  const gzipped = gzipSync(packed.bytes);
  return {
    bytes: packed.bytes.length,
    base64UrlChars: bytesToBase64Url(packed.bytes).length,
    gzipBytes: gzipped.length,
    gzipBase64UrlChars: bytesToBase64Url(gzipped).length,
    sections: packed.sections,
  };
}

function settingsPayload(compact: CompactState): {
  m: CompactState["m"];
  q: CompactState["q"];
  rw: number;
  rh: number;
  ts: number;
  ox: number;
  oy: number;
  gc: string;
  gj: number;
  tl: CompactState["tl"];
  ps: CompactState["ps"];
  mf: string;
  c: string;
} {
  return {
    m: compact.m,
    q: compact.q,
    rw: compact.rw,
    rh: compact.rh,
    ts: compact.ts,
    ox: compact.ox,
    oy: compact.oy,
    gc: compact.gc,
    gj: compact.gj,
    tl: compact.tl,
    ps: compact.ps,
    mf: compact.mf,
    c: compact.c,
  };
}

function writeBinarySettings(writer: ByteWriter, compact: CompactState): void {
  writer.writeByte(viewIndex(compact.m));
  writer.writeByte(compact.q === 1 ? 1 : 0);
  writer.writeUnsigned16(compact.rw);
  writer.writeUnsigned16(compact.rh);
  writer.writeByte(compact.ts);
  writer.writeSigned16(halfInchUnits(compact.ox));
  writer.writeSigned16(halfInchUnits(compact.oy));
  writer.writeByte(requireGroutColorId(compact.gc));
  writer.writeByte(compact.gj);
}

function viewIndex(mode: CompactState["m"]): number {
  if (mode === "s") return 0;
  if (mode === "d") return 1;
  throw new Error(`Unknown view mode: ${mode}`);
}

function halfInchUnits(value: number): number {
  const scaled = value * 2;
  const rounded = Math.round(scaled);
  if (Math.abs(scaled - rounded) > 1e-9) {
    throw new Error(`Offset is not representable in half-inch units: ${value}`);
  }
  return rounded;
}

function packStreamOnly(stream: number[]): Buffer {
  const writer = new BitWriter();
  writer.writeVarIndex(stream.length);
  for (const token of stream) {
    writer.writeVarIndex(token);
  }
  return writer.bytes();
}

function packByteStreamOnly(stream: number[]): Buffer {
  if (stream.some((token) => token > 255)) {
    throw new Error("Byte stream cannot store token indexes above 255.");
  }
  const bytes = Buffer.alloc(2 + stream.length);
  bytes.writeUInt16BE(stream.length, 0);
  for (let index = 0; index < stream.length; index += 1) {
    bytes[index + 2] = stream[index];
  }
  return bytes;
}

function writeByteCellState(writer: ByteWriter, key: string): void {
  const state = decodeStateKey(key);
  writer.writeByte(shapeIndex(state.shape));
  writer.writeIndex(state.main);
  for (const taco of state.tacos) {
    writer.writeIndex(taco);
  }
}

function writeDictionaryCellState(writer: ByteWriter, key: string): void {
  const state = decodeStateKey(key);
  if (state.shape === "s") {
    writer.writeByte(0);
    writer.writeIndex(state.main);
    return;
  }

  const allTacosMatchMain = state.main !== 0 && state.tacos.every((taco) => taco === state.main);
  if (state.shape === "d" && allTacosMatchMain) {
    writer.writeByte(1);
    writer.writeIndex(state.main);
    return;
  }
  if (state.shape === "o" && allTacosMatchMain) {
    writer.writeByte(2);
    writer.writeIndex(state.main);
    return;
  }

  if (state.shape === "d") {
    writer.writeByte(3);
  } else if (state.shape === "o") {
    writer.writeByte(4);
  } else {
    throw new Error(`Unexpected explicit dictionary shape ${state.shape}.`);
  }
  writer.writeIndex(state.main);
  for (const taco of state.tacos) {
    writer.writeIndex(taco);
  }
}

function runExperiments(
  compact: CompactState,
  grid: ReturnType<typeof buildGrid>,
): Array<{
  name: string;
  maxSequenceLength: number;
  maxSequenceEntries: number;
  entries: number;
  sequenceEntries: number;
  streamTokens: number;
  streamBits: number;
  dictionaryBits: number;
  packedBytes: number;
  base64UrlChars: number;
  gzipBytes: number;
  gzipBase64UrlChars: number;
  bitPackedBytes: number;
  bitPackedGzipBytes: number;
  bitPackedGzipBase64UrlChars: number;
  bitStreamBytes: number;
  bitStreamGzipBytes: number;
  byteStreamBytes: number;
  byteStreamGzipBytes: number;
}> {
  const variants: Array<{ name: string; options: CompressionOptions }> = [
    {
      name: "singles only",
      options: { maxSequenceLength: 1, maxSequenceEntries: 0, candidateLimit: 0 },
    },
  ];

  return variants.map(({ name, options }) => {
    const variantResult = buildCompressedModel(grid.rows, options);
    const variantPacked = packPrototype(compact, grid, variantResult);
    const variantBitPacked = packBitPrototype(compact, grid, variantResult);
    const bitStream = packStreamOnly(variantResult.stream);
    const byteStream = packByteStreamOnly(variantResult.stream);
    const variantGzip = gzipSync(variantPacked.bytes);
    const variantBitGzip = gzipSync(variantBitPacked.bytes);
    return {
      name,
      maxSequenceLength: options.maxSequenceLength,
      maxSequenceEntries: options.maxSequenceEntries,
      entries: variantResult.entries.length,
      sequenceEntries: variantResult.entries.length - variantResult.singleEntryCount,
      streamTokens: variantResult.stream.length,
      streamBits: variantResult.streamBits,
      dictionaryBits: variantResult.dictionaryBits,
      packedBytes: variantPacked.bytes.length,
      base64UrlChars: bytesToBase64Url(variantPacked.bytes).length,
      gzipBytes: variantGzip.length,
      gzipBase64UrlChars: bytesToBase64Url(variantGzip).length,
      bitPackedBytes: variantBitPacked.bytes.length,
      bitPackedGzipBytes: variantBitGzip.length,
      bitPackedGzipBase64UrlChars: bytesToBase64Url(variantBitGzip).length,
      bitStreamBytes: bitStream.length,
      bitStreamGzipBytes: gzipSync(bitStream).length,
      byteStreamBytes: byteStream.length,
      byteStreamGzipBytes: gzipSync(byteStream).length,
    };
  });
}

function writeCellState(writer: BitWriter, key: string): void {
  const state = decodeStateKey(key);
  writer.writeBits(shapeIndex(state.shape), 2);
  writer.writeVarIndex(state.main);
  for (const taco of state.tacos) {
    writer.writeVarIndex(taco);
  }
}

function shapeIndex(shape: ShapeCode): number {
  if (shape === "o") return 1;
  if (shape === "d") return 2;
  if (shape === "s") return 3;
  return 0;
}

function prefixBits(prefixIndex: number | undefined): number {
  return indexBits(prefixIndex === undefined ? 0 : prefixIndex + 1);
}

function cellStateBits(key: string): number {
  const state = decodeStateKey(key);
  return 2 + indexBits(state.main) + state.tacos.reduce((sum, material) => sum + indexBits(material), 0);
}

function indexBits(index: number): number {
  if (index < 15) return 4;
  if (index < 255) return 12;
  return 28;
}

function buildTileMaterialIds(): Map<string, number> {
  const source = readFileSync("src/constants.ts", "utf8");
  const colors = [...source.matchAll(/tileColor\(\s*"([^"]+)"\s*,\s*(\d+)/g)].map((match) => ({
    id: match[1],
    iid: Number(match[2]),
  }));
  const materialIds = new Map<string, number>();
  const seenIids = new Map<number, string>();
  for (const color of colors) {
    if (materialIds.has(color.id)) {
      throw new Error(`Duplicate tile material id in constants.ts: ${color.id}`);
    }
    const existingColor = seenIids.get(color.iid);
    if (existingColor) {
      throw new Error(`Duplicate tile material iid ${color.iid} for ${existingColor} and ${color.id}`);
    }
    materialIds.set(color.id, color.iid);
    seenIids.set(color.iid, color.id);
  }
  return materialIds;
}

function buildGroutColorIds(): Map<string, number> {
  const source = readFileSync("src/constants.ts", "utf8");
  const groutColorsMatch = source.match(/export const GROUT_COLORS:[\s\S]*?\n];/);
  if (!groutColorsMatch) {
    throw new Error("Could not find GROUT_COLORS in constants.ts");
  }
  const ids = [...groutColorsMatch[0].matchAll(/\{\s*id:\s*"([^"]+)"/g)].map((match) => match[1]);
  const groutIds = new Map<string, number>();
  for (const id of ids) {
    if (groutIds.has(id)) {
      throw new Error(`Duplicate grout color id in constants.ts: ${id}`);
    }
    groutIds.set(id, groutIds.size + 1);
  }
  return groutIds;
}

function compactGlobalMaterialIds(compact: CompactState): number[] {
  return (compact.cs ?? []).map((material) => requireTileMaterialId(material));
}

function requireTileMaterialId(material: string): number {
  const id = TILE_MATERIAL_IDS.get(material);
  if (id === undefined) {
    throw new Error(`Unknown tile material: ${material}`);
  }
  return id;
}

function requireGroutColorId(groutColor: string): number {
  const id = GROUT_COLOR_IDS.get(groutColor);
  if (id === undefined) {
    throw new Error(`Unknown grout color: ${groutColor}`);
  }
  return id;
}

function materialIndex(compact: CompactState, mode: MaterialMode, colorIndex: number): number {
  if (mode !== "directGlobalIds") {
    return colorIndex + 1;
  }
  const material = compact.cs?.[colorIndex];
  if (!material) {
    throw new Error(`Missing compact cs material at index ${colorIndex}`);
  }
  return requireTileMaterialId(material);
}

function encodeStateKey(state: CellState): string {
  return [state.shape, state.main, ...state.tacos].join("|");
}

function decodeStateKey(key: string): CellState {
  const [shape, main, a, b, c, d] = key.split("|");
  return {
    shape: shape as ShapeCode,
    main: Number(main),
    tacos: [Number(a), Number(b), Number(c), Number(d)],
  };
}

function describeState(key: string): string {
  if (key === BLANK_STATE) {
    return "blank";
  }
  const state = decodeStateKey(key);
  const filledTacos = state.tacos.map((value, index) => (value === 0 ? "" : `${index}:${value}`)).filter(Boolean);
  return `${state.shape}${state.main}${filledTacos.length ? `[${filledTacos.join(",")}]` : ""}`;
}

function sequenceKey(sequence: string[]): string {
  return sequence.join(";");
}

function cellKey(col: number, row: number): string {
  return `${col}:${row}`;
}

function edgeKey(col: number, row: number, side: Side): string {
  return `${col}:${row}:${side}`;
}

function canonicalEdgeKey(col: number, row: number, side: Side): string {
  if (side === "n") return edgeKey(col, row - 1, "s");
  if (side === "w") return edgeKey(col - 1, row, "e");
  return edgeKey(col, row, side);
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

function increment<K>(map: Map<K, number>, key: K): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}
