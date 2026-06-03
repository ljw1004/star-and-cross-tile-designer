import { SIDES } from "./constants";
import { canonicalEdgeKey, cellKey, cellLabel, cellsForEdge, edgeKey, neighborForSide, oppositeSide, parseCellKey, parseCornerKey, parseEdgeKey } from "./keys";
import type { AppState, Conflict, Side } from "./types";

export function analyzeLayoutConflicts(state: AppState): Conflict[] {
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
          `Orthogonal cross at ${cellLabel(col, row)} collides with orthogonal cross at ${cellLabel(adjacent.col, adjacent.row)}.`,
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
