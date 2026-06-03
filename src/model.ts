import { CORNERS, SIDES } from "./constants";
import { analyzeLayoutConflicts } from "./conflicts";
import { cornerInsetCenter, distance, edgeMidpoint, nearestTacoTarget, tacoHalfDiagonalPx, tacoSidePx } from "./geometry";
import { canonicalEdgeKey, cellKey, cellsForEdge, cornerKey, neighborForSide, neighbors, oppositeSide, parseEdgeKey } from "./keys";
import type { AppState, Corner, CrossKind, Point, Side, TacoEraseCandidate } from "./types";

export function paintKey(state: AppState, point: Point, col: number, row: number): string {
  if (state.brush === "erase") {
    return `erase:${elementKeyAtPoint(state, point, col, row)}`;
  }

  if (state.brush === "colorOnly") {
    return `color:${elementKeyAtPoint(state, point, col, row)}`;
  }

  if (state.brush !== "inset") {
    return `${state.brush}:${col},${row}`;
  }

  const target = nearestTacoTarget(state, point, col, row);
  return `${target.type}:${target.key}`;
}

export function placeCross(state: AppState, col: number, row: number, kind: CrossKind, colorId: string): void {
  state.cells.set(cellKey(col, row), { kind, colorId });
  fixCrossConflicts(state, col, row, kind);
  placeCompatibleTacosForCross(state, col, row, kind, colorId);
}

function fixCrossConflicts(state: AppState, col: number, row: number, kind: CrossKind): void {
  if (kind === "diagonalCross") {
    removeCornerInsets(state, col, row);
    return;
  }

  for (const side of SIDES) {
    removeEdgeInset(state, col, row, side);
  }

  for (const neighbor of neighbors(col, row)) {
    const tile = state.cells.get(cellKey(neighbor.col, neighbor.row));
    if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
      replaceWithDiagonalCross(state, neighbor.col, neighbor.row);
    }
  }
}

function placeCompatibleTacosForCross(state: AppState, col: number, row: number, kind: CrossKind, colorId: string): void {
  if (kind === "diagonalCross") {
    for (const side of SIDES) {
      setEdgeInsetIfNoNewConflict(state, col, row, side, colorId);
    }
    return;
  }

  for (const corner of CORNERS) {
    setCornerInsetIfNoNewConflict(state, col, row, corner, colorId);
  }
}

function setEdgeInsetIfNoNewConflict(state: AppState, col: number, row: number, side: Side, colorId: string): void {
  const key = canonicalEdgeKey(col, row, side);
  const previous = state.edgeInsets.get(key);
  const before = conflictSignatureSet(state);

  state.edgeInsets.set(key, { colorId });
  if (hasNewConflicts(state, before)) {
    restoreMapEntry(state.edgeInsets, key, previous);
  }
}

function setCornerInsetIfNoNewConflict(state: AppState, col: number, row: number, corner: Corner, colorId: string): void {
  const key = cornerKey(col, row, corner);
  const previous = state.cornerInsets.get(key);
  const before = conflictSignatureSet(state);

  state.cornerInsets.set(key, { colorId });
  if (hasNewConflicts(state, before)) {
    restoreMapEntry(state.cornerInsets, key, previous);
  }
}

function conflictSignatureSet(state: AppState): Set<string> {
  return new Set(analyzeLayoutConflicts(state).map((conflict) => `${conflict.code}:${conflict.message}`));
}

function hasNewConflicts(state: AppState, before: Set<string>): boolean {
  return analyzeLayoutConflicts(state).some((conflict) => !before.has(`${conflict.code}:${conflict.message}`));
}

function restoreMapEntry<K, V>(map: Map<K, V>, key: K, value: V | undefined): void {
  if (value) {
    map.set(key, value);
  } else {
    map.delete(key);
  }
}

function replaceWithDiagonalCross(state: AppState, col: number, row: number): void {
  const key = cellKey(col, row);
  const tile = state.cells.get(key);
  if (!tile) {
    return;
  }

  state.cells.set(key, { kind: "diagonalCross", colorId: tile.colorId });
  removeCornerInsets(state, col, row);
  placeCompatibleTacosForCross(state, col, row, "diagonalCross", tile.colorId);
}

export function eraseAt(state: AppState, point: Point, col: number, row: number): void {
  const taco = nearestTacoHit(state, point, col, row);
  if (taco) {
    deleteTaco(state, taco);
    return;
  }

  const key = cellKey(col, row);
  const tile = state.cells.get(key);
  state.cells.delete(key);

  if (tile?.kind === "diagonalCross") {
    pruneEdgeInsetsWithoutAdjacentDiagonalCross(state);
  } else if (tile?.kind === "orthogonalCross") {
    removeCornerInsets(state, col, row);
  }
}

export function colorOnlyAt(state: AppState, point: Point, col: number, row: number, colorId: string): void {
  const taco = nearestTacoHit(state, point, col, row);
  if (taco) {
    colorTaco(state, taco, colorId);
    return;
  }

  const key = cellKey(col, row);
  const tile = state.cells.get(key);
  if (tile) {
    state.cells.set(key, { ...tile, colorId });
  }
}

function elementKeyAtPoint(state: AppState, point: Point, col: number, row: number): string {
  const taco = nearestTacoHit(state, point, col, row);
  if (taco) {
    return `${taco.type}:${taco.key}`;
  }

  return `tile:${col},${row}`;
}

function nearestTacoHit(state: AppState, point: Point, col: number, row: number): TacoEraseCandidate | undefined {
  const candidates: TacoEraseCandidate[] = [];

  for (const side of SIDES) {
    const key = canonicalEdgeKey(col, row, side);
    if (state.edgeInsets.has(key)) {
      candidates.push(edgeEraseCandidate(state, point, key, col, row, side));
    }

    const adjacent = neighborForSide(col, row, side);
    const adjacentSide = oppositeSide(side);
    const adjacentKey = canonicalEdgeKey(adjacent.col, adjacent.row, adjacentSide);
    if (state.edgeInsets.has(adjacentKey)) {
      candidates.push(edgeEraseCandidate(state, point, adjacentKey, adjacent.col, adjacent.row, adjacentSide));
    }
  }

  for (const corner of CORNERS) {
    const key = cornerKey(col, row, corner);
    if (state.cornerInsets.has(key)) {
      candidates.push(cornerEraseCandidate(state, point, key, col, row, corner));
    }
  }

  return candidates.filter((candidate) => candidate.hit).sort((a, b) => a.distance - b.distance)[0];
}

function deleteTaco(state: AppState, taco: TacoEraseCandidate): void {
  if (taco.type === "edge") {
    state.edgeInsets.delete(taco.key);
  } else {
    state.cornerInsets.delete(taco.key);
  }
}

function colorTaco(state: AppState, taco: TacoEraseCandidate, colorId: string): void {
  if (taco.type === "edge") {
    state.edgeInsets.set(taco.key, { colorId });
  } else {
    state.cornerInsets.set(taco.key, { colorId });
  }
}

function pruneEdgeInsetsWithoutAdjacentDiagonalCross(state: AppState): void {
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

function edgeEraseCandidate(state: AppState, point: Point, key: string, col: number, row: number, side: Side): TacoEraseCandidate {
  const midpoint = edgeMidpoint(state, col, row, side);
  const candidateDistance = distance(point, midpoint);
  return {
    key,
    type: "edge",
    distance: candidateDistance,
    hit: candidateDistance <= tacoHalfDiagonalPx(state) + 2,
  };
}

function cornerEraseCandidate(state: AppState, point: Point, key: string, col: number, row: number, corner: Corner): TacoEraseCandidate {
  const center = cornerInsetCenter(state, col, row, corner);
  const dx = Math.abs(point.x - center.x);
  const dy = Math.abs(point.y - center.y);
  const halfSize = tacoSidePx(state) / 2;
  const margin = 3;
  return {
    key,
    type: "corner",
    distance: distance(point, center),
    hit: dx <= halfSize + margin && dy <= halfSize + margin,
  };
}

export function placeStar(state: AppState, col: number, row: number, colorId: string): void {
  state.cells.set(cellKey(col, row), { kind: "star", colorId });

  for (const neighbor of neighbors(col, row)) {
    const tile = state.cells.get(cellKey(neighbor.col, neighbor.row));
    if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
      replaceWithDiagonalCross(state, neighbor.col, neighbor.row);
    }
  }

  for (const side of SIDES) {
    removeEdgeInset(state, col, row, side);
  }
  removeCornerInsets(state, col, row);
}

function removeCornerInsets(state: AppState, col: number, row: number): void {
  state.cornerInsets.delete(cornerKey(col, row, "nw"));
  state.cornerInsets.delete(cornerKey(col, row, "ne"));
  state.cornerInsets.delete(cornerKey(col, row, "se"));
  state.cornerInsets.delete(cornerKey(col, row, "sw"));
}

function removeEdgeInset(state: AppState, col: number, row: number, side: Side): void {
  state.edgeInsets.delete(canonicalEdgeKey(col, row, side));
}

export function placeInset(state: AppState, point: Point, col: number, row: number, colorId: string): void {
  const target = nearestTacoTarget(state, point, col, row);

  if (target.type === "edge") {
    for (const adjacent of cellsForEdge(target.col, target.row, target.side)) {
      replaceTileWithDiagonalCrossIfNeeded(state, adjacent.col, adjacent.row);
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

function replaceTileWithDiagonalCrossIfNeeded(state: AppState, col: number, row: number): void {
  const tile = state.cells.get(cellKey(col, row));
  if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
    replaceWithDiagonalCross(state, col, row);
  }
}
