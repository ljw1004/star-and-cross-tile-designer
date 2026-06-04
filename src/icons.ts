import type { Mode, PaintShape } from "./types";

export const ERASER_CURSOR = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="white" stroke="black" stroke-linejoin="round" stroke-width="2" d="M6 21 19 8l8 8-10 10H11z"/><path fill="black" d="M11 26h17v3H11z"/><path fill="white" stroke="black" stroke-linejoin="round" stroke-width="2" d="M6 21 11 26h6l4-4-8-8z"/></svg>`,
  6,
  21,
  "crosshair",
);

export const PAINT_ROLLER_CURSOR = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="black" d="M16 1 19 5h-6z"/><rect x="4" y="5" width="20" height="7" rx="2" fill="white" stroke="black" stroke-width="2"/><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M24 8.5h4v7.5H17v4"/><path fill="white" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 20h6v9h-6z"/></svg>`,
  16,
  1,
  "crosshair",
);

export const DROPPER_CURSOR = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g transform="rotate(45 16 16)"><path fill="black" d="M11 7c0-4 5-7 5-7s5 3 5 7c0 3-2 6-5 6s-5-3-5-6z"/><rect x="14" y="12" width="4" height="16" rx="1" fill="white" stroke="black" stroke-width="2"/><path fill="white" stroke="black" stroke-linejoin="round" stroke-width="2" d="M14 28h4l-2 3z"/></g></svg>`,
  24,
  28,
  "copy",
);

export function traceToolIconPath(ctx: CanvasRenderingContext2D, shape: PaintShape, mode: Mode): void {
  ctx.beginPath();
  if (shape === "orthogonalCross") {
    tracePolygon(ctx, [
      [50, 0],
      [66.3, 16.3],
      [66.3, 33.8],
      [83.8, 33.8],
      [100, 50],
      [83.8, 66.3],
      [66.3, 66.3],
      [66.3, 83.8],
      [50, 100],
      [33.8, 83.8],
      [33.8, 66.3],
      [16.3, 66.3],
      [0, 50],
      [16.3, 33.8],
      [33.8, 33.8],
      [33.8, 16.3],
    ]);
  } else if (shape === "diagonalCross") {
    tracePolygon(ctx, [
      [10, 10],
      [36, 10],
      [50, 24],
      [64, 10],
      [90, 10],
      [90, 36],
      [76, 50],
      [90, 64],
      [90, 90],
      [64, 90],
      [50, 76],
      [36, 90],
      [10, 90],
      [10, 64],
      [24, 50],
      [10, 36],
    ]);
  } else if (shape === "star") {
    tracePolygon(ctx, [
      [16, 16],
      [36, 16],
      [50, 0],
      [64, 16],
      [84, 16],
      [84, 36],
      [100, 50],
      [84, 64],
      [84, 84],
      [64, 84],
      [50, 100],
      [36, 84],
      [16, 84],
      [16, 64],
      [0, 50],
      [16, 36],
    ]);
  } else if (mode === "diagonal") {
    tracePolygon(ctx, [
      [28, 28],
      [72, 28],
      [72, 72],
      [28, 72],
    ]);
  } else {
    tracePolygon(ctx, [
      [50, 14],
      [86, 50],
      [50, 86],
      [14, 50],
    ]);
  }
}

function svgCursor(svg: string, hotspotX: number, hotspotY: number, fallback: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspotX} ${hotspotY}, ${fallback}`;
}

function tracePolygon(ctx: CanvasRenderingContext2D, points: Array<[number, number]>): void {
  const [first, ...rest] = points;
  ctx.moveTo(first[0], first[1]);
  for (const point of rest) {
    ctx.lineTo(point[0], point[1]);
  }
  ctx.closePath();
}
