import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(new URL("..", import.meta.url).pathname);
const testsPath = resolve(root, "TESTS.md");
const constantsPath = resolve(root, "src/constants.ts");

const MAGIC = 0x53;
const FORMAT_VERSION = 1;
const BLANK_KEY = "0|0|0|0|0|0";

const materialIids = readMaterialIids();
const groutIids = readGroutIids();

function main() {
  const markdown = readFileSync(testsPath, "utf8");
  let converted = 0;

  const nextMarkdown = markdown.replace(/URL: `(file:\/\/\/Users\/ljw\/code\/tiles\/index\.html\?[^`]+)`/g, (_match, url) => {
    const parsed = new URL(url);
    if (parsed.searchParams.has("s")) {
      return `URL: \`${url}\``;
    }
    converted += 1;
    return `URL: \`file:///Users/ljw/code/tiles/index.html?s=${serializeOldUrl(parsed)}\``;
  });

  writeFileSync(testsPath, nextMarkdown);
  console.log(`Converted ${converted} TESTS.md URL${converted === 1 ? "" : "s"}.`);
}

function readMaterialIids() {
  const constants = readFileSync(constantsPath, "utf8");
  return new Map([...constants.matchAll(/tileColor\("([^"]+)",\s*(\d+)/g)].map((match) => [match[1], Number(match[2])]));
}

function readGroutIids() {
  const constants = readFileSync(constantsPath, "utf8");
  const block = constants.match(/export const GROUT_COLORS:[\s\S]*?\n];/)?.[0];
  if (!block) {
    throw new Error("Could not find GROUT_COLORS in src/constants.ts.");
  }
  return new Map([...block.matchAll(/\{\s*id:\s*"([^"]+)",\s*gid:\s*(\d+)/g)].map((match) => [match[1], Number(match[2])]));
}

function serializeOldUrl(url) {
  const state = oldUrlToState(url);
  const raw = serializeRaw(state);
  return gzipSync(raw).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function oldUrlToState(url) {
  const params = url.searchParams;
  const state = {
    mode: params.get("m") === "diagonal" ? "diagonal" : "straight",
    showGrid: params.get("g") === "1",
    roomWidthInches: numberParam(params, "rw", 60),
    roomHeightInches: numberParam(params, "rh", 96),
    tileInches: numberParam(params, "ts", 8),
    offsetXInches: numberParam(params, "ox", 0),
    offsetYInches: numberParam(params, "oy", 0),
    groutColorId: params.get("gc") ?? "warm-white",
    groutJointSixteenths: numberParam(params, "gj", 2),
    cells: new Map(),
    edgeInsets: new Map(),
    cornerInsets: new Map(),
  };

  const layout = params.get("l");
  if (!layout) {
    return state;
  }

  for (const record of layout.split(";")) {
    const [kind, rawCol, rawRow, rawShape, rawColorId] = record.split(",");
    const col = Number(rawCol);
    const row = Number(rawRow);
    if (!Number.isFinite(col) || !Number.isFinite(row)) {
      throw new Error(`Invalid layout record: ${record}`);
    }
    if (kind === "t") {
      state.cells.set(cellKey(col, row), { kind: rawShape, colorId: rawColorId });
    } else if (kind === "e") {
      state.edgeInsets.set(canonicalEdgeKey(col, row, rawShape), { colorId: rawColorId });
    } else if (kind === "k") {
      state.cornerInsets.set(cornerKey(col, row, rawShape), { colorId: rawColorId });
    } else {
      throw new Error(`Unknown layout record: ${record}`);
    }
  }

  return state;
}

function numberParam(params, key, fallback) {
  const value = params.get(key);
  return value === null ? fallback : Number(value);
}

function serializeRaw(state) {
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
  writer.writeByte(groutIid(state.groutColorId));
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

function buildGrid(state) {
  const touched = [];

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
  const outputRows = [];

  for (let row = originRow; row <= maxRow; row += 1) {
    const outputRow = [];
    for (let col = originCol; col <= maxCol; col += 1) {
      outputRow.push(encodeStateKey(cellStateAt(state, col, row)));
    }
    outputRows.push(outputRow);
  }

  return { originCol, originRow, width: maxCol - originCol + 1, height: maxRow - originRow + 1, rows: outputRows };
}

function cellStateAt(state, col, row) {
  const tile = state.cells.get(cellKey(col, row));
  if (!tile) {
    const edgeTacos = [
      edgeInsetIid(state, col, row, "n"),
      edgeInsetIid(state, col, row, "e"),
      edgeInsetIid(state, col, row, "s"),
      edgeInsetIid(state, col, row, "w"),
    ];
    const cornerTacos = [
      cornerInsetIid(state, col, row, "nw"),
      cornerInsetIid(state, col, row, "ne"),
      cornerInsetIid(state, col, row, "se"),
      cornerInsetIid(state, col, row, "sw"),
    ];
    const hasEdgeTaco = edgeTacos.some((taco) => taco !== 0);
    const hasCornerTaco = cornerTacos.some((taco) => taco !== 0);
    if (hasEdgeTaco) {
      return { shape: 2, main: 0, tacos: edgeTacos };
    }
    if (hasCornerTaco) {
      return { shape: 1, main: 0, tacos: cornerTacos };
    }
    return decodeStateKey(BLANK_KEY);
  }

  const cell = { shape: shapeCode(tile.kind), main: materialIid(tile.colorId), tacos: [0, 0, 0, 0] };
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

function buildDictionary(rows) {
  const counts = new Map();
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

function writeDictionary(writer, entries) {
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

function materialIid(colorId) {
  const iid = materialIids.get(colorId);
  if (iid === undefined) {
    throw new Error(`Unknown tile material ${colorId}.`);
  }
  return iid;
}

function groutIid(colorId) {
  const iid = groutIids.get(colorId);
  if (iid === undefined) {
    throw new Error(`Unknown grout color ${colorId}.`);
  }
  return iid;
}

function edgeInsetIid(state, col, row, side) {
  const inset = state.edgeInsets.get(canonicalEdgeKey(col, row, side));
  return inset ? materialIid(inset.colorId) : 0;
}

function cornerInsetIid(state, col, row, corner) {
  const inset = state.cornerInsets.get(cornerKey(col, row, corner));
  return inset ? materialIid(inset.colorId) : 0;
}

function shapeCode(kind) {
  if (kind === "orthogonalCross") return 1;
  if (kind === "diagonalCross") return 2;
  if (kind === "star") return 3;
  throw new Error(`Unknown tile kind ${kind}.`);
}

function encodeStateKey(state) {
  return [state.shape, state.main, ...state.tacos].join("|");
}

function decodeStateKey(key) {
  const [shape, main, a, b, c, d] = key.split("|").map(Number);
  return { shape, main, tacos: [a, b, c, d] };
}

function cellKey(col, row) {
  return `${col}:${row}`;
}

function parseCellKey(key) {
  const [col, row] = key.split(":").map(Number);
  return { col, row };
}

function edgeKey(col, row, side) {
  return `${col}:${row}:${side}`;
}

function parseEdgeKey(key) {
  const [col, row, side] = key.split(":");
  return { col: Number(col), row: Number(row), side };
}

function canonicalEdgeKey(col, row, side) {
  if (side === "n") return edgeKey(col, row - 1, "s");
  if (side === "w") return edgeKey(col - 1, row, "e");
  return edgeKey(col, row, side);
}

function cornerKey(col, row, corner) {
  return `${col}:${row}:${corner}`;
}

function parseCornerKey(key) {
  const [col, row, corner] = key.split(":");
  return { col: Number(col), row: Number(row), corner };
}

function halfInchUnits(value) {
  const scaled = value * 2;
  const rounded = Math.round(scaled);
  if (Math.abs(scaled - rounded) > 1e-9) {
    throw new Error(`Offset is not representable in half-inch units: ${value}`);
  }
  return rounded;
}

class ByteWriter {
  output = [];

  writeByte(value) {
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new Error(`Byte value out of range: ${value}`);
    }
    this.output.push(value);
  }

  writeUnsigned16(value) {
    if (!Number.isInteger(value) || value < 0 || value > 0xffff) {
      throw new Error(`Unsigned 16-bit value out of range: ${value}`);
    }
    this.writeByte((value >> 8) & 0xff);
    this.writeByte(value & 0xff);
  }

  writeSigned16(value) {
    if (!Number.isInteger(value) || value < -0x8000 || value > 0x7fff) {
      throw new Error(`Signed 16-bit value out of range: ${value}`);
    }
    this.writeUnsigned16(value & 0xffff);
  }

  writeIndex(value) {
    if (value < 255) {
      this.writeByte(value);
    } else {
      this.writeByte(255);
      this.writeUnsigned16(value);
    }
  }

  bytes() {
    return Buffer.from(this.output);
  }
}

main();
