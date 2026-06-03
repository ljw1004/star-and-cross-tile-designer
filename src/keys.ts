import type { Corner, Side } from "./types";

export function cellKey(col: number, row: number): string {
  return `${col}:${row}`;
}

export function parseCellKey(key: string): { col: number; row: number } {
  const [col, row] = key.split(":").map(Number);
  return { col, row };
}

export function edgeKey(col: number, row: number, side: Side): string {
  return `${col}:${row}:${side}`;
}

export function parseEdgeKey(key: string): { col: number; row: number; side: Side } {
  const [col, row, side] = key.split(":");
  return { col: Number(col), row: Number(row), side: side as Side };
}

export function cornerKey(col: number, row: number, corner: Corner): string {
  return `${col}:${row}:${corner}`;
}

export function parseCornerKey(key: string): { col: number; row: number; corner: Corner } {
  const [col, row, corner] = key.split(":");
  return { col: Number(col), row: Number(row), corner: corner as Corner };
}

export function cellLabel(col: number, row: number): string {
  return `(${col}, ${row})`;
}

export function neighborForSide(col: number, row: number, side: Side): { col: number; row: number } {
  if (side === "n") {
    return { col, row: row - 1 };
  }
  if (side === "e") {
    return { col: col + 1, row };
  }
  if (side === "s") {
    return { col, row: row + 1 };
  }
  return { col: col - 1, row };
}

export function oppositeSide(side: Side): Side {
  if (side === "n") {
    return "s";
  }
  if (side === "e") {
    return "w";
  }
  if (side === "s") {
    return "n";
  }
  return "e";
}

export function neighbors(col: number, row: number): Array<{ col: number; row: number }> {
  return [
    { col, row: row - 1 },
    { col: col + 1, row },
    { col, row: row + 1 },
    { col: col - 1, row },
  ];
}

export function cellsForEdge(col: number, row: number, side: Side): Array<{ col: number; row: number }> {
  const cells = [{ col, row }];
  if (side === "n") {
    cells.push({ col, row: row - 1 });
  } else if (side === "e") {
    cells.push({ col: col + 1, row });
  } else if (side === "s") {
    cells.push({ col, row: row + 1 });
  } else {
    cells.push({ col: col - 1, row });
  }
  return cells;
}

export function canonicalEdgeKey(col: number, row: number, side: Side): string {
  if (side === "n") {
    return edgeKey(col, row - 1, "s");
  }
  if (side === "w") {
    return edgeKey(col - 1, row, "e");
  }
  return edgeKey(col, row, side);
}
