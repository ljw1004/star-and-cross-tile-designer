import {
  DEFAULT_STATE,
  GROUT_COLORS,
  GROUT_JOINT_OPTIONS,
  MANUFACTURERS,
  MAX_ROOM_HEIGHT_INCHES,
  MAX_ROOM_WIDTH_INCHES,
  MIN_ROOM_HEIGHT_INCHES,
  MIN_ROOM_WIDTH_INCHES,
  TILE_SIZE_OPTIONS,
} from "./constants";
import { recordDebugUrlSync, recordDebugUrlWrite } from "./debug";
import { clamp, initialZoomForRoom, normalizeZoom, roundToHalfInch } from "./geometry";
import { deserialize, serialize, snapshotState } from "./serialization";
import type { AppState, Corner, Side } from "./types";

let pendingSnapshot = "";
let lastWrittenSnapshot = "";
let pendingState: AppState | undefined;
let isWritingUrl = false;
let debounceTimer: number | undefined;

export async function loadState(workspace: HTMLElement): Promise<AppState> {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("s");
  let next = cloneDefaultState();

  if (encoded) {
    try {
      next = await deserialize(encoded);
      console.log("Expanded URL tile state", next);
    } catch (error) {
      console.warn("Unable to decode tile state URL; using defaults.", error);
    }
  }

  next.zoom = initialZoomForRoom(workspace, next.roomWidthInches, next.roomHeightInches);
  lastWrittenSnapshot = snapshotState(next);

  return next;
}

export function cloneDefaultState(): AppState {
  return {
    mode: DEFAULT_STATE.mode,
    showGrid: DEFAULT_STATE.showGrid,
    roomWidthInches: DEFAULT_STATE.roomWidthInches,
    roomHeightInches: DEFAULT_STATE.roomHeightInches,
    tileInches: DEFAULT_STATE.tileInches,
    offsetXInches: DEFAULT_STATE.offsetXInches,
    offsetYInches: DEFAULT_STATE.offsetYInches,
    zoom: DEFAULT_STATE.zoom,
    groutColorId: DEFAULT_STATE.groutColorId,
    groutJointSixteenths: DEFAULT_STATE.groutJointSixteenths,
    tool: DEFAULT_STATE.tool,
    paintShape: DEFAULT_STATE.paintShape,
    manufacturerId: DEFAULT_STATE.manufacturerId,
    colorId: DEFAULT_STATE.colorId,
    cells: new Map(),
    edgeInsets: new Map(),
    cornerInsets: new Map(),
  };
}

export function updateUrl(state: AppState): void {
  const start = performance.now();
  pendingSnapshot = snapshotState(state);
  pendingState = state;
  recordDebugUrlSync(performance.now() - start, pendingSnapshot.length);
  if (debounceTimer !== undefined) {
    window.clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(() => {
    debounceTimer = undefined;
    void processUrlWriteQueue();
  }, 10);
}

async function processUrlWriteQueue(): Promise<void> {
  if (isWritingUrl || pendingSnapshot === "" || pendingSnapshot === lastWrittenSnapshot || !pendingState) {
    return;
  }

  isWritingUrl = true;
  const snapshot = pendingSnapshot;
  const state = pendingState;
  const start = performance.now();
  try {
    const encoded = await serialize(state);
    if (pendingSnapshot === snapshot) {
      const nextUrl = `${window.location.pathname}?s=${encoded}`;
      window.history.replaceState(null, "", nextUrl);
      lastWrittenSnapshot = snapshot;
    }
  } catch (error) {
    console.warn("Unable to compress tile state URL.", error);
  } finally {
    recordDebugUrlWrite(performance.now() - start);
    isWritingUrl = false;
    if (pendingSnapshot !== lastWrittenSnapshot) {
      void processUrlWriteQueue();
    }
  }
}

export function validManufacturer(id: string | null): string | undefined {
  return MANUFACTURERS.some((manufacturer) => manufacturer.id === id) ? id ?? undefined : undefined;
}

export function validColor(manufacturerId: string, id: string | null): string | undefined {
  const manufacturer = MANUFACTURERS.find((candidate) => candidate.id === manufacturerId);
  return manufacturer?.colors.some((color) => color.id === id) ? id ?? undefined : undefined;
}

export function validGroutColor(id: string | null): string | undefined {
  return GROUT_COLORS.some((color) => color.id === id) ? id ?? undefined : undefined;
}

export function validGroutJoint(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const next = Number(value);
  return Number.isInteger(next) && GROUT_JOINT_OPTIONS.includes(next) ? next : undefined;
}

export function validTileInches(value: string | null): number | undefined {
  const next = Number(value);
  return TILE_SIZE_OPTIONS.includes(next) ? next : undefined;
}

export function validRoomWidth(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const next = Number(value);
  return Number.isInteger(next) ? clamp(next, MIN_ROOM_WIDTH_INCHES, MAX_ROOM_WIDTH_INCHES) : undefined;
}

export function validRoomHeight(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const next = Number(value);
  return Number.isInteger(next) ? clamp(next, MIN_ROOM_HEIGHT_INCHES, MAX_ROOM_HEIGHT_INCHES) : undefined;
}

export function validHalfInch(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return undefined;
  }
  return roundToHalfInch(next);
}

export function validSide(value: string): value is Side {
  return value === "n" || value === "e" || value === "s" || value === "w";
}

export function validCorner(value: string): value is Corner {
  return value === "nw" || value === "ne" || value === "se" || value === "sw";
}

export function normalizeStateZoom(state: AppState): void {
  state.zoom = normalizeZoom(state.zoom);
}
