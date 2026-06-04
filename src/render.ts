import { groutColorValue } from "./color";
import { analyzeLayoutConflicts } from "./conflicts";
import {
  cellLocalToScreen,
  cornerTacoSidePx,
  gridLocalRoomWindow,
  gridLocalToScreen,
  groutPx,
  idealTacoHalfDiagonalPx,
  idealTacoSidePx,
  roomPx,
  tacoSidePx,
  tilePx,
  visibleCell,
} from "./geometry";
import { parseCellKey, parseCornerKey, parseEdgeKey } from "./keys";
import { fillMaterialPath } from "./material";
import type { AppState, Corner, CrossKind, Side } from "./types";

export function draw(state: AppState, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  canvas.dataset.renderReady = "false";
  const room = roomPx(state);
  ctx.clearRect(0, 0, room.width, room.height);
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, room.width, room.height);

  if (!state.showGrid) {
    drawPlaceholderGrid(state, ctx);
  }
  drawGroutUnderlays(state, ctx);
  drawPlacedTiles(state, ctx);
  drawInsets(state, ctx);
  if (state.showGrid) {
    drawPlaceholderGrid(state, ctx);
  }
  drawRoomOutline(state, ctx);
}

export function markRenderReady(canvas: HTMLCanvasElement, frame: number, currentFrame: () => number): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (frame === currentFrame()) {
        canvas.dataset.renderReady = "true";
      }
    });
  });
}

export function renderConflictReport(
  state: AppState,
  layoutErrors: HTMLDivElement,
  lastConflictSignature: string,
): string {
  const conflicts = analyzeLayoutConflicts(state);
  const signature = conflicts.map((conflict) => `${conflict.code}:${conflict.message}`).join("|");

  if (conflicts.length === 0) {
    layoutErrors.classList.remove("is-visible");
    layoutErrors.textContent = "";
    return "";
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
  }

  return signature;
}

function drawGroutUnderlays(state: AppState, ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = groutColorValue(state.groutColorId);
  drawCellGroutUnderlays(state, ctx);
  drawInsetGroutUnderlays(state, ctx);
  ctx.restore();
}

function drawCellGroutUnderlays(state: AppState, ctx: CanvasRenderingContext2D): void {
  for (const [key, tile] of state.cells) {
    const { col, row } = parseCellKey(key);
    if (!visibleCell(state, col, row)) {
      continue;
    }

    if (tile.kind === "star") {
      drawStarSilhouette(state, ctx, col, row, tilePx(state), idealTacoHalfDiagonalPx(state));
    } else {
      drawCrossGroutFootprint(state, ctx, col, row, tile.kind);
    }
  }
}

function drawInsetGroutUnderlays(state: AppState, ctx: CanvasRenderingContext2D): void {
  for (const [key] of state.edgeInsets) {
    const edge = parseEdgeKey(key);
    drawEdgeInsetSilhouette(state, ctx, edge.col, edge.row, edge.side, insetGroutFootprintSize(state));
  }

  for (const [key] of state.cornerInsets) {
    const corner = parseCornerKey(key);
    drawCornerInsetSilhouette(state, ctx, corner.col, corner.row, corner.corner, insetGroutFootprintSize(state));
  }
}

function drawPlacedTiles(state: AppState, ctx: CanvasRenderingContext2D): void {
  drawTilesByKind(state, ctx, "cross");
  drawTilesByKind(state, ctx, "star");
}

function drawTilesByKind(state: AppState, ctx: CanvasRenderingContext2D, pass: "cross" | "star"): void {
  for (const [key, tile] of state.cells) {
    const { col, row } = parseCellKey(key);
    if (!visibleCell(state, col, row)) {
      continue;
    }

    if (tile.kind === "orthogonalCross" || tile.kind === "diagonalCross") {
      if (pass !== "cross") {
        continue;
      }
      drawCross(state, ctx, col, row, tile.kind, tile.colorId);
    } else {
      if (pass !== "star") {
        continue;
      }
      drawStar(state, ctx, col, row, tile.colorId);
    }
  }
}

function drawCross(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number, kind: CrossKind, colorId: string): void {
  const polygon =
    kind === "diagonalCross"
      ? insetPolygon(diagonalBasePolygon(tilePx(state), idealTacoHalfDiagonalPx(state), idealTacoSidePx(state)), groutInsetPx(state))
      : insetPolygon(orthogonalBasePolygon(tilePx(state), idealTacoHalfDiagonalPx(state), idealTacoSidePx(state)), groutInsetPx(state));
  const screenPolygon = cellPolygonToScreen(state, col, row, polygon);

  drawMaterialPolygon(ctx, screenPolygon, colorId, `cross:${kind}:${col}:${row}:${colorId}`);
}

function drawCrossGroutFootprint(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number, kind: CrossKind): void {
  const zeroPolygon =
    kind === "diagonalCross"
      ? diagonalBasePolygon(tilePx(state), idealTacoHalfDiagonalPx(state), idealTacoSidePx(state))
      : orthogonalBasePolygon(tilePx(state), idealTacoHalfDiagonalPx(state), idealTacoSidePx(state));
  const polygon = outsetPolygon(zeroPolygon, groutInsetPx(state));

  fillScreenPolygon(ctx, cellPolygonToScreen(state, col, row, polygon));
}

function insetGroutFootprintSize(state: AppState): number {
  return idealTacoSidePx(state) + groutPx(state);
}

function drawStar(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number, colorId: string): void {
  const polygon = insetPolygon(starPolygon(tilePx(state), idealTacoHalfDiagonalPx(state)), groutInsetPx(state));
  const screenPolygon = cellPolygonToScreen(state, col, row, polygon);

  drawMaterialPolygon(ctx, screenPolygon, colorId, `star:${col}:${row}:${colorId}`);
}

function drawStarSilhouette(
  state: AppState,
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  size: number,
  pointHalfDiagonal: number,
): void {
  fillScreenPolygon(ctx, cellPolygonToScreen(state, col, row, outsetPolygon(starPolygon(size, pointHalfDiagonal), groutInsetPx(state))));
}

function traceStarPath(ctx: CanvasRenderingContext2D, body: number, point: number, pointBase: number): void {
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
}

type PolygonPoint = [number, number];

function groutInsetPx(state: AppState): number {
  return groutPx(state) / 2;
}

function orthogonalBasePolygon(size: number, tacoHalfDiagonal: number, tacoSide: number): PolygonPoint[] {
  const half = size / 2;
  const point = half + tacoHalfDiagonal;
  const cut = half - tacoSide;
  return [
    [0, -point],
    [cut, -half],
    [cut, -cut],
    [half, -cut],
    [point, 0],
    [half, cut],
    [cut, cut],
    [cut, half],
    [0, point],
    [-cut, half],
    [-cut, cut],
    [-half, cut],
    [-point, 0],
    [-half, -cut],
    [-cut, -cut],
    [-cut, -half],
  ];
}

function diagonalBasePolygon(size: number, tacoHalfDiagonal: number, tacoSide: number): PolygonPoint[] {
  const half = size / 2;
  const notchDepth = tacoSide;
  return [
    [-half, -half],
    [-tacoHalfDiagonal, -half],
    [0, -notchDepth],
    [tacoHalfDiagonal, -half],
    [half, -half],
    [half, -tacoHalfDiagonal],
    [notchDepth, 0],
    [half, tacoHalfDiagonal],
    [half, half],
    [tacoHalfDiagonal, half],
    [0, notchDepth],
    [-tacoHalfDiagonal, half],
    [-half, half],
    [-half, tacoHalfDiagonal],
    [-notchDepth, 0],
    [-half, -tacoHalfDiagonal],
  ];
}

function starPolygon(size: number, pointHalfDiagonal: number): PolygonPoint[] {
  const body = size / 2;
  const point = body + pointHalfDiagonal;
  return [
    [-body, -body],
    [-pointHalfDiagonal, -body],
    [0, -point],
    [pointHalfDiagonal, -body],
    [body, -body],
    [body, -pointHalfDiagonal],
    [point, 0],
    [body, pointHalfDiagonal],
    [body, body],
    [pointHalfDiagonal, body],
    [0, point],
    [-pointHalfDiagonal, body],
    [-body, body],
    [-body, pointHalfDiagonal],
    [-point, 0],
    [-body, -pointHalfDiagonal],
  ];
}

function squarePolygon(size: number): PolygonPoint[] {
  const half = size / 2;
  return [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];
}

function edgeMidpointLocal(state: AppState, side: Side): PolygonPoint {
  const halfTile = tilePx(state) / 2;
  if (side === "n") {
    return [0, -halfTile];
  }
  if (side === "e") {
    return [halfTile, 0];
  }
  if (side === "s") {
    return [0, halfTile];
  }
  return [-halfTile, 0];
}

function edgeInsetPolygonLocal(state: AppState, side: Side, size: number): PolygonPoint[] {
  const center = edgeMidpointLocal(state, side);
  const halfDiagonal = size / Math.SQRT2;
  return [
    [center[0], center[1] - halfDiagonal],
    [center[0] + halfDiagonal, center[1]],
    [center[0], center[1] + halfDiagonal],
    [center[0] - halfDiagonal, center[1]],
  ];
}

function cornerInsetCenterLocal(state: AppState, corner: Corner): PolygonPoint {
  const halfTile = tilePx(state) / 2;
  const centerOffset = groutPx(state) / 2 + cornerTacoSidePx(state) / 2;
  const x = corner === "nw" || corner === "sw" ? -halfTile + centerOffset : halfTile - centerOffset;
  const y = corner === "nw" || corner === "ne" ? -halfTile + centerOffset : halfTile - centerOffset;
  return [x, y];
}

function translatePolygon(points: PolygonPoint[], offset: PolygonPoint): PolygonPoint[] {
  return points.map((point) => addPoint(point, offset));
}

function cellPolygonToScreen(state: AppState, col: number, row: number, points: PolygonPoint[]): PolygonPoint[] {
  return points.map(([x, y]) => {
    const point = cellLocalToScreen(state, col, row, x, y);
    return [point.x, point.y];
  });
}

function drawMaterialPolygon(ctx: CanvasRenderingContext2D, points: PolygonPoint[], colorId: string, seed: string): void {
  tracePolygonPath(ctx, points);
  fillMaterialPath(ctx, colorId, seed, polygonBounds(points));
}

function fillScreenPolygon(ctx: CanvasRenderingContext2D, points: PolygonPoint[]): void {
  tracePolygonPath(ctx, points);
  ctx.fill();
}

function insetPolygon(points: PolygonPoint[], distance: number): PolygonPoint[] {
  const center = polygonCentroid(points);
  const shiftedLines = points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    const dx = next[0] - point[0];
    const dy = next[1] - point[1];
    const length = Math.hypot(dx, dy) || 1;
    const normalA: PolygonPoint = [-dy / length, dx / length];
    const normalB: PolygonPoint = [dy / length, -dx / length];
    const midpoint: PolygonPoint = [(point[0] + next[0]) / 2, (point[1] + next[1]) / 2];
    const normal = distanceBetween(addPoint(midpoint, normalA), center) < distanceBetween(addPoint(midpoint, normalB), center) ? normalA : normalB;
    const offset: PolygonPoint = [normal[0] * distance, normal[1] * distance];
    return {
      start: addPoint(point, offset),
      end: addPoint(next, offset),
    };
  });

  return points.map((point, index) => {
    const previous = shiftedLines[(index - 1 + shiftedLines.length) % shiftedLines.length];
    const current = shiftedLines[index];
    return lineIntersection(previous.start, previous.end, current.start, current.end) ?? point;
  });
}

function outsetPolygon(points: PolygonPoint[], distance: number): PolygonPoint[] {
  return insetPolygon(points, -distance);
}

function polygonCentroid(points: PolygonPoint[]): PolygonPoint {
  const total = points.reduce<PolygonPoint>((sum, point) => [sum[0] + point[0], sum[1] + point[1]], [0, 0]);
  return [total[0] / points.length, total[1] / points.length];
}

function addPoint(a: PolygonPoint, b: PolygonPoint): PolygonPoint {
  return [a[0] + b[0], a[1] + b[1]];
}

function distanceBetween(a: PolygonPoint, b: PolygonPoint): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function lineIntersection(a1: PolygonPoint, a2: PolygonPoint, b1: PolygonPoint, b2: PolygonPoint): PolygonPoint | undefined {
  const dax = a2[0] - a1[0];
  const day = a2[1] - a1[1];
  const dbx = b2[0] - b1[0];
  const dby = b2[1] - b1[1];
  const denominator = dax * dby - day * dbx;
  if (Math.abs(denominator) < 0.000001) {
    return undefined;
  }

  const t = ((b1[0] - a1[0]) * dby - (b1[1] - a1[1]) * dbx) / denominator;
  return [a1[0] + t * dax, a1[1] + t * day];
}

function tracePolygonPath(ctx: CanvasRenderingContext2D, points: PolygonPoint[]): void {
  const [first, ...rest] = points;
  ctx.beginPath();
  ctx.moveTo(first[0], first[1]);
  for (const point of rest) {
    ctx.lineTo(point[0], point[1]);
  }
  ctx.closePath();
}

function polygonBounds(points: PolygonPoint[]): { x: number; y: number; width: number; height: number } {
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function drawInsets(state: AppState, ctx: CanvasRenderingContext2D): void {
  for (const [key, inset] of state.edgeInsets) {
    const edge = parseEdgeKey(key);
    drawEdgeInset(state, ctx, edge.col, edge.row, edge.side, inset.colorId);
  }

  for (const [key, inset] of state.cornerInsets) {
    const corner = parseCornerKey(key);
    drawCornerInset(state, ctx, corner.col, corner.row, corner.corner, inset.colorId);
  }
}

function drawEdgeInset(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number, side: Side, colorId: string): void {
  const size = tacoSidePx(state);
  const polygon = edgeInsetPolygonLocal(state, side, size);
  const screenPolygon = cellPolygonToScreen(state, col, row, polygon);

  drawMaterialPolygon(ctx, screenPolygon, colorId, `edge:${col}:${row}:${side}:${colorId}`);
}

function drawEdgeInsetSilhouette(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number, side: Side, size: number): void {
  fillScreenPolygon(ctx, cellPolygonToScreen(state, col, row, edgeInsetPolygonLocal(state, side, size)));
}

function drawCornerInset(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number, corner: Corner, colorId: string): void {
  const size = cornerTacoSidePx(state);
  const center = cornerInsetCenterLocal(state, corner);
  const polygon = translatePolygon(squarePolygon(size), center);
  const screenPolygon = cellPolygonToScreen(state, col, row, polygon);

  drawMaterialPolygon(ctx, screenPolygon, colorId, `corner:${col}:${row}:${corner}:${colorId}`);
}

function drawCornerInsetSilhouette(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number, corner: Corner, size: number): void {
  const center = cornerInsetCenterLocal(state, corner);
  fillScreenPolygon(ctx, cellPolygonToScreen(state, col, row, translatePolygon(squarePolygon(size), center)));
}

function drawPlaceholderGrid(state: AppState, ctx: CanvasRenderingContext2D): void {
  const tile = tilePx(state);
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 5]);

  const window = gridLocalRoomWindow(state);
  const startX = Math.floor(window.minX / tile - 0.5) - 1;
  const endX = Math.ceil(window.maxX / tile - 0.5) + 1;
  const startY = Math.floor(window.minY / tile - 0.5) - 1;
  const endY = Math.ceil(window.maxY / tile - 0.5) + 1;

  for (let i = startX; i <= endX; i += 1) {
    const x = (i + 0.5) * tile;
    const a = gridLocalToScreen(state, { x, y: window.minY - tile });
    const b = gridLocalToScreen(state, { x, y: window.maxY + tile });
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  for (let i = startY; i <= endY; i += 1) {
    const y = (i + 0.5) * tile;
    const a = gridLocalToScreen(state, { x: window.minX - tile, y });
    const b = gridLocalToScreen(state, { x: window.maxX + tile, y });
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawRoomOutline(state: AppState, ctx: CanvasRenderingContext2D): void {
  const room = roomPx(state);
  ctx.save();
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  ctx.strokeRect(2, 2, room.width - 4, room.height - 4);
  ctx.restore();
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#039;";
  });
}
