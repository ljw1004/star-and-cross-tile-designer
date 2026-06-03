import { colorValue, outlineColor } from "./color";
import { SIDES } from "./constants";
import { analyzeLayoutConflicts } from "./conflicts";
import {
  baseDrawPx,
  cellLocalToScreen,
  cornerInsetCenter,
  crossNotchDepth,
  crossNotchMouth,
  edgeMidpoint,
  gridLocalRoomWindow,
  gridLocalToScreen,
  layoutRotation,
  roomPx,
  tacoHalfDiagonalPx,
  tacoSidePx,
  tilePx,
  visibleCell,
} from "./geometry";
import { parseCellKey, parseCornerKey, parseEdgeKey } from "./keys";
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

    const color = colorValue(tile.colorId);
    if (tile.kind === "orthogonalCross" || tile.kind === "diagonalCross") {
      if (pass !== "cross") {
        continue;
      }
      drawCross(state, ctx, col, row, tile.kind, color);
    } else {
      if (pass !== "star") {
        continue;
      }
      drawStar(state, ctx, col, row, color);
    }
  }
}

function drawCross(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number, kind: CrossKind, color: string): void {
  const size = baseDrawPx(state);

  ctx.save();
  applyCellTransform(state, ctx, col, row);
  if (kind === "orthogonalCross") {
    ctx.rotate(Math.PI / 4);
  }
  ctx.fillStyle = color;
  ctx.strokeStyle = outlineColor(color);
  ctx.lineWidth = 1;
  traceDiagonalCrossPath(state, ctx, size);
  ctx.fill();
  ctx.stroke();
  drawTileHighlight(ctx, size);
  ctx.restore();
}

function traceDiagonalCrossPath(state: AppState, ctx: CanvasRenderingContext2D, size: number): void {
  const half = size / 2;
  const x = (value: number) => value * size - half;
  const y = (value: number) => value * size - half;
  const mouthStart = 0.5 - crossNotchMouth(state);
  const mouthEnd = 0.5 + crossNotchMouth(state);
  const inward = crossNotchDepth(state);
  const outward = 1 - crossNotchDepth(state);

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

function drawStar(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number, color: string): void {
  const body = baseDrawPx(state) / 2;
  const point = body + tacoHalfDiagonalPx(state);
  const pointBase = tacoHalfDiagonalPx(state);

  ctx.save();
  applyCellTransform(state, ctx, col, row);
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

function drawInsets(state: AppState, ctx: CanvasRenderingContext2D): void {
  for (const [key, inset] of state.edgeInsets) {
    const edge = parseEdgeKey(key);
    drawEdgeInset(state, ctx, edge.col, edge.row, edge.side, colorValue(inset.colorId));
  }

  for (const [key, inset] of state.cornerInsets) {
    const corner = parseCornerKey(key);
    drawCornerInset(state, ctx, corner.col, corner.row, corner.corner, colorValue(inset.colorId));
  }
}

function drawEdgeInset(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number, side: Side, color: string): void {
  const point = edgeMidpoint(state, col, row, side);
  const size = tacoSidePx(state);

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(layoutRotation(state) + Math.PI / 4);
  ctx.fillStyle = color;
  ctx.strokeStyle = outlineColor(color);
  ctx.lineWidth = 1;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.strokeRect(-size / 2, -size / 2, size, size);
  ctx.restore();
}

function drawCornerInset(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number, corner: Corner, color: string): void {
  const size = tacoSidePx(state);
  const center = cornerInsetCenter(state, col, row, corner);

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(layoutRotation(state));
  ctx.fillStyle = color;
  ctx.strokeStyle = outlineColor(color);
  ctx.lineWidth = 1;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.strokeRect(-size / 2, -size / 2, size, size);
  ctx.restore();
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

function drawTileHighlight(ctx: CanvasRenderingContext2D, size: number): void {
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

function applyCellTransform(state: AppState, ctx: CanvasRenderingContext2D, col: number, row: number): void {
  const center = cellLocalToScreen(state, col, row, 0, 0);
  ctx.translate(center.x, center.y);
  ctx.rotate(layoutRotation(state));
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
