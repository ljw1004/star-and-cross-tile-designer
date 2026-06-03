import type { AppState, Corner, Manufacturer, Side } from "./types";

export const DEFAULT_ROOM_INCHES = { width: 60, height: 96 };
export const DEFAULT_TILE_INCHES = 8;
export const TILE_SIZE_OPTIONS = [3, 4, 5, 6, 7, 8];
export const MIN_ROOM_WIDTH_INCHES = 24;
export const MIN_ROOM_HEIGHT_INCHES = 24;
export const MAX_ROOM_WIDTH_INCHES = 180;
export const MAX_ROOM_HEIGHT_INCHES = 240;
export const BORDER_HANDLE_PX = 8;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;
export const ZOOM_FACTOR = 1.12;
export const SCALE = 8;
export const GROUT_PX = 3;
export const HALF_GROUT_PX = GROUT_PX / 2;
export const URL_VERSION = "1";
export const SIDES: Side[] = ["n", "e", "s", "w"];
export const CORNERS: Corner[] = ["nw", "ne", "se", "sw"];

export const MANUFACTURERS: Manufacturer[] = [
  {
    id: "dummy",
    name: "Dummy Tile Co",
    colors: [
      { id: "bone", name: "Bone", value: "#e7dcc8" },
      { id: "smoke", name: "Smoke", value: "#85817a" },
      { id: "terracotta", name: "Terracotta", value: "#ad5539" },
      { id: "verd", name: "Verd", value: "#536f56" },
      { id: "night", name: "Blue Night", value: "#24384d" },
      { id: "black", name: "Black", value: "#161616" },
      { id: "white", name: "White", value: "#f1eee5" },
      { id: "orchard", name: "Orchard Pink", value: "#d9a6a0" },
      { id: "amber", name: "Amber Grey", value: "#9b9787" },
      { id: "grass", name: "Blue Grass", value: "#536f84" },
    ],
  },
];

export const DEFAULT_STATE: AppState = {
  mode: "straight",
  showGrid: false,
  roomWidthInches: DEFAULT_ROOM_INCHES.width,
  roomHeightInches: DEFAULT_ROOM_INCHES.height,
  tileInches: DEFAULT_TILE_INCHES,
  offsetXInches: 0,
  offsetYInches: 0,
  zoom: 1,
  brush: "orthogonalCross",
  manufacturerId: "dummy",
  colorId: "bone",
  cells: new Map(),
  edgeInsets: new Map(),
  cornerInsets: new Map(),
};
