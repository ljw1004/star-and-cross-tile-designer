export type DebugPhase =
  | "clearMs"
  | "gridUnderMs"
  | "groutMs"
  | "tilesMs"
  | "insetsMs"
  | "gridTopMs"
  | "outlineMs"
  | "conflictsMs";

export type DebugFrameStats = Record<DebugPhase, number> & {
  totalMs: number;
  materialMs: number;
  materialCalls: number;
  materialCacheHits: number;
  materialCacheMisses: number;
  materialCacheCreateMs: number;
  visibleCells: number;
  visibleCrosses: number;
  visibleStars: number;
  visibleEdgeInsets: number;
  visibleCornerInsets: number;
  gridLines: number;
  urlSyncMs: number;
  urlWriteMs: number;
  urlChars: number;
  canvasPixels: string;
  canvasCss: string;
  zoom: number;
};

let activeStats: DebugFrameStats | undefined;
let frameStart = 0;
let overlay: HTMLPreElement | undefined;
let lastUrlSyncMs = 0;
let lastUrlWriteMs = 0;
let lastUrlChars = 0;
const SHOW_DEBUG_OVERLAY = false;

export function beginDebugFrame(meta: Pick<DebugFrameStats, "canvasPixels" | "canvasCss" | "zoom">): void {
  frameStart = performance.now();
  activeStats = {
    totalMs: 0,
    clearMs: 0,
    gridUnderMs: 0,
    groutMs: 0,
    tilesMs: 0,
    insetsMs: 0,
    gridTopMs: 0,
    outlineMs: 0,
    conflictsMs: 0,
    materialMs: 0,
    materialCalls: 0,
    materialCacheHits: 0,
    materialCacheMisses: 0,
    materialCacheCreateMs: 0,
    visibleCells: 0,
    visibleCrosses: 0,
    visibleStars: 0,
    visibleEdgeInsets: 0,
    visibleCornerInsets: 0,
    gridLines: 0,
    urlSyncMs: lastUrlSyncMs,
    urlWriteMs: lastUrlWriteMs,
    urlChars: lastUrlChars,
    ...meta,
  };
}

export function finishDebugFrame(): DebugFrameStats | undefined {
  if (!activeStats) {
    return undefined;
  }

  activeStats.totalMs = performance.now() - frameStart;
  const stats = activeStats;
  activeStats = undefined;
  return stats;
}

export function timeDebugPhase<T>(phase: DebugPhase, fn: () => T): T {
  if (!activeStats) {
    return fn();
  }

  const start = performance.now();
  try {
    return fn();
  } finally {
    activeStats[phase] += performance.now() - start;
  }
}

export function recordDebugMaterialDraw(ms: number): void {
  if (!activeStats) {
    return;
  }
  activeStats.materialCalls += 1;
  activeStats.materialMs += ms;
}

export function recordDebugMaterialCacheHit(): void {
  if (activeStats) {
    activeStats.materialCacheHits += 1;
  }
}

export function recordDebugMaterialCacheMiss(createMs: number): void {
  if (!activeStats) {
    return;
  }
  activeStats.materialCacheMisses += 1;
  activeStats.materialCacheCreateMs += createMs;
}

export function recordDebugCell(kind: "orthogonalCross" | "diagonalCross" | "star"): void {
  if (!activeStats) {
    return;
  }
  activeStats.visibleCells += 1;
  if (kind === "star") {
    activeStats.visibleStars += 1;
  } else {
    activeStats.visibleCrosses += 1;
  }
}

export function recordDebugInset(kind: "edge" | "corner"): void {
  if (!activeStats) {
    return;
  }
  if (kind === "edge") {
    activeStats.visibleEdgeInsets += 1;
  } else {
    activeStats.visibleCornerInsets += 1;
  }
}

export function recordDebugGridLines(count: number): void {
  if (activeStats) {
    activeStats.gridLines += count;
  }
}

export function recordDebugUrlSync(ms: number, chars: number): void {
  lastUrlSyncMs = ms;
  lastUrlChars = chars;
}

export function recordDebugUrlWrite(ms: number): void {
  lastUrlWriteMs = ms;
}

export function renderDebugOverlay(stats: DebugFrameStats | undefined): void {
  if (!SHOW_DEBUG_OVERLAY || !stats) {
    return;
  }

  if (!overlay) {
    overlay = document.createElement("pre");
    overlay.className = "debug-overlay";
    document.body.append(overlay);
  }

  overlay.textContent = [
    `render ${formatMs(stats.totalMs)}  zoom ${stats.zoom.toFixed(2)}`,
    `canvas ${stats.canvasCss} css / ${stats.canvasPixels} px`,
    `clear ${formatMs(stats.clearMs)}  grid ${formatMs(stats.gridUnderMs + stats.gridTopMs)} (${stats.gridLines})`,
    `grout ${formatMs(stats.groutMs)}  tiles ${formatMs(stats.tilesMs)}  tacos ${formatMs(stats.insetsMs)}`,
    `outline ${formatMs(stats.outlineMs)}  conflicts ${formatMs(stats.conflictsMs)}`,
    `material ${formatMs(stats.materialMs)} / ${stats.materialCalls} calls`,
    `cache hit ${stats.materialCacheHits}  miss ${stats.materialCacheMisses} (${formatMs(stats.materialCacheCreateMs)})`,
    `url sync ${formatMs(stats.urlSyncMs)}  write ${formatMs(stats.urlWriteMs)}  chars ${stats.urlChars}`,
    `visible ${stats.visibleCells} cells (${stats.visibleCrosses} cross, ${stats.visibleStars} star)`,
    `tacos ${stats.visibleEdgeInsets} edge, ${stats.visibleCornerInsets} corner`,
  ].join("\n");
}

function formatMs(value: number): string {
  return `${value.toFixed(value >= 10 ? 1 : 2)}ms`;
}
