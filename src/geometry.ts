import {
  BORDER_HANDLE_PX,
  MAX_ZOOM,
  MIN_ZOOM,
  SCALE,
} from "./constants";
import { canonicalEdgeKey, cornerKey } from "./keys";
import type { AppState, Corner, Point, ResizeHandle, Side, TacoTarget } from "./types";

const IDEAL_TACO_TO_HALF_BASE = 2 - Math.SQRT2;

export function initialZoomForRoom(workspace: HTMLElement, roomWidthInches: number, roomHeightInches: number): number {
  const style = getComputedStyle(workspace);
  const horizontalPadding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
  const verticalPadding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
  const availableWidth = Math.max(1, workspace.clientWidth - horizontalPadding);
  const availableHeight = Math.max(1, workspace.clientHeight - verticalPadding);
  const roomWidth = roomWidthInches * SCALE;
  const roomHeight = roomHeightInches * SCALE;
  return normalizeZoom(Math.min(availableWidth / roomWidth, availableHeight / roomHeight));
}

export function roomPx(state: AppState): { width: number; height: number } {
  return {
    width: state.roomWidthInches * SCALE,
    height: state.roomHeightInches * SCALE,
  };
}

export function roomCenter(state: AppState): Point {
  const room = roomPx(state);
  return { x: room.width / 2, y: room.height / 2 };
}

export function tilePx(state: AppState): number {
  return state.tileInches * SCALE;
}

export function baseDrawPx(state: AppState): number {
  return Math.max(1, tilePx(state) - groutPx(state));
}

export function groutPx(state: AppState): number {
  return Math.max(1, (state.groutJointSixteenths / 16) * SCALE);
}

export function tacoSidePx(state: AppState): number {
  return Math.max(1, idealTacoSidePx(state) - groutPx(state));
}

export function cornerTacoSidePx(state: AppState): number {
  return tacoSidePx(state);
}

export function idealTacoSidePx(state: AppState): number {
  return (tilePx(state) / 2) * IDEAL_TACO_TO_HALF_BASE;
}

export function tacoHalfDiagonalPx(state: AppState): number {
  return tacoSidePx(state) / Math.SQRT2;
}

export function idealTacoHalfDiagonalPx(state: AppState): number {
  return idealTacoSidePx(state) / Math.SQRT2;
}

export function pointInRoom(state: AppState, point: Point): boolean {
  const room = roomPx(state);
  return point.x >= 0 && point.y >= 0 && point.x <= room.width && point.y <= room.height;
}

export function resizeHandleAtPoint(state: AppState, point: Point): ResizeHandle | undefined {
  const room = roomPx(state);
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

export function layoutRotation(state: AppState): number {
  return state.mode === "diagonal" ? Math.PI / 4 : 0;
}

export function gridOrigin(state: AppState): Point {
  const center = roomCenter(state);
  return {
    x: center.x + state.offsetXInches * SCALE,
    y: center.y + state.offsetYInches * SCALE,
  };
}

export function cellLocalToScreen(state: AppState, col: number, row: number, localX: number, localY: number): Point {
  const tile = tilePx(state);
  const x = col * tile + localX;
  const y = row * tile + localY;
  return gridLocalToScreen(state, { x, y });
}

export function gridLocalRoomWindow(state: AppState): { minX: number; maxX: number; minY: number; maxY: number } {
  const room = roomPx(state);
  const points = [
    screenToGridLocal(state, { x: 0, y: 0 }),
    screenToGridLocal(state, { x: room.width, y: 0 }),
    screenToGridLocal(state, { x: room.width, y: room.height }),
    screenToGridLocal(state, { x: 0, y: room.height }),
  ];
  return {
    minX: Math.min(...points.map((point) => point.x)),
    maxX: Math.max(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxY: Math.max(...points.map((point) => point.y)),
  };
}

export function gridLocalToScreen(state: AppState, point: Point): Point {
  const origin = gridOrigin(state);
  if (state.mode !== "diagonal") {
    return { x: origin.x + point.x, y: origin.y + point.y };
  }

  const angle = layoutRotation(state);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: origin.x + point.x * cos - point.y * sin,
    y: origin.y + point.x * sin + point.y * cos,
  };
}

export function screenToGridLocal(state: AppState, point: Point): Point {
  const origin = gridOrigin(state);
  const x = point.x - origin.x;
  const y = point.y - origin.y;
  if (state.mode !== "diagonal") {
    return { x, y };
  }

  const angle = -layoutRotation(state);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

export function cellFromPoint(state: AppState, point: Point): { col: number; row: number } {
  const tile = tilePx(state);
  const local = screenToGridLocal(state, point);
  return {
    col: Math.floor(local.x / tile + 0.5),
    row: Math.floor(local.y / tile + 0.5),
  };
}

export function canvasPoint(state: AppState, canvas: HTMLCanvasElement, event: PointerEvent): Point | undefined {
  const rect = canvas.getBoundingClientRect();
  const room = roomPx(state);
  return {
    x: ((event.clientX - rect.left) / rect.width) * room.width,
    y: ((event.clientY - rect.top) / rect.height) * room.height,
  };
}

export function nearestEdge(state: AppState, point: Point, col: number, row: number): { col: number; row: number; side: Side; key: string } {
  const sides: Side[] = ["n", "e", "s", "w"];
  let nearest = sides[0];
  let nearestDistance = Infinity;

  for (const side of sides) {
    const midpoint = edgeMidpoint(state, col, row, side);
    const distance = Math.hypot(point.x - midpoint.x, point.y - midpoint.y);
    if (distance < nearestDistance) {
      nearest = side;
      nearestDistance = distance;
    }
  }

  return { col, row, side: nearest, key: canonicalEdgeKey(col, row, nearest) };
}

export function nearestCorner(state: AppState, point: Point, col: number, row: number): { col: number; row: number; corner: Corner; key: string } {
  const halfTile = tilePx(state) / 2;
  const corners = [
    { corner: "nw" as const, point: cellLocalToScreen(state, col, row, -halfTile, -halfTile) },
    { corner: "ne" as const, point: cellLocalToScreen(state, col, row, halfTile, -halfTile) },
    { corner: "se" as const, point: cellLocalToScreen(state, col, row, halfTile, halfTile) },
    { corner: "sw" as const, point: cellLocalToScreen(state, col, row, -halfTile, halfTile) },
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

export function nearestTacoTarget(state: AppState, point: Point, col: number, row: number): TacoTarget {
  const edge = nearestEdge(state, point, col, row);
  const corner = nearestCorner(state, point, col, row);
  const edgeDistance = distance(point, edgeMidpoint(state, edge.col, edge.row, edge.side));
  const cornerDistance = distance(point, cornerInsetCenter(state, corner.col, corner.row, corner.corner));

  if (edgeDistance <= cornerDistance) {
    return { type: "edge", ...edge };
  }

  return { type: "corner", ...corner };
}

export function edgeMidpoint(state: AppState, col: number, row: number, side: Side): Point {
  const halfTile = tilePx(state) / 2;
  if (side === "n") {
    return cellLocalToScreen(state, col, row, 0, -halfTile);
  }
  if (side === "e") {
    return cellLocalToScreen(state, col, row, halfTile, 0);
  }
  if (side === "s") {
    return cellLocalToScreen(state, col, row, 0, halfTile);
  }
  return cellLocalToScreen(state, col, row, -halfTile, 0);
}

export function cornerInsetCenter(state: AppState, col: number, row: number, corner: Corner): Point {
  const halfTile = tilePx(state) / 2;
  const centerOffset = groutPx(state) / 2 + cornerTacoSidePx(state) / 2;
  const x = corner === "nw" || corner === "sw" ? -halfTile + centerOffset : halfTile - centerOffset;
  const y = corner === "nw" || corner === "ne" ? -halfTile + centerOffset : halfTile - centerOffset;
  return cellLocalToScreen(state, col, row, x, y);
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function visibleCell(state: AppState, col: number, row: number): boolean {
  const room = roomPx(state);
  const margin = tilePx(state);
  const halfTile = tilePx(state) / 2;
  const points = [
    cellLocalToScreen(state, col, row, -halfTile, -halfTile),
    cellLocalToScreen(state, col, row, halfTile, -halfTile),
    cellLocalToScreen(state, col, row, halfTile, halfTile),
    cellLocalToScreen(state, col, row, -halfTile, halfTile),
    cellLocalToScreen(state, col, row, 0, 0),
  ];
  return points.some(
    (point) => point.x >= -margin && point.y >= -margin && point.x <= room.width + margin && point.y <= room.height + margin,
  );
}

export function roundToHalfInch(value: number): number {
  return Math.round(value * 2) / 2;
}

export function normalizeZoom(value: number): number {
  return Math.round(clamp(value, MIN_ZOOM, MAX_ZOOM) * 100) / 100;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
