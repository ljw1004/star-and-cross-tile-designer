export type Mode = "straight" | "diagonal";
export type Tool = "paint" | "grab" | "erase" | "colorPicker";
export type PaintShape = "orthogonalCross" | "diagonalCross" | "star" | "inset";
export type CrossKind = "orthogonalCross" | "diagonalCross";
export type TileKind = CrossKind | "star";
export type Side = "n" | "e" | "s" | "w";
export type Corner = "nw" | "ne" | "se" | "sw";
export type ResizeHandle = "right" | "bottom" | "corner";

export type PaletteColor = {
  id: string;
  name: string;
  value: string;
  texture: TileTexture;
  shadeVariation: 0 | 1 | 2 | 3 | 4;
  sheen: number;
  grain: number;
  clouding: number;
  chipRate: number;
};

export type Manufacturer = {
  id: string;
  name: string;
  defaultGroutJointSixteenths: number;
  colors: PaletteColor[];
};

export type Tile = {
  kind: TileKind;
  colorId: string;
};

export type Inset = {
  colorId: string;
};

export type AppState = {
  mode: Mode;
  showGrid: boolean;
  roomWidthInches: number;
  roomHeightInches: number;
  tileInches: number;
  offsetXInches: number;
  offsetYInches: number;
  zoom: number;
  groutColorId: string;
  groutJointSixteenths: number;
  tool: Tool;
  paintShape: PaintShape | undefined;
  manufacturerId: string;
  colorId: string;
  cells: Map<string, Tile>;
  edgeInsets: Map<string, Inset>;
  cornerInsets: Map<string, Inset>;
};

export type GroutColor = {
  id: string;
  name: string;
  value: string;
};

export type TileTexture =
  | "matte_porcelain"
  | "matte_ceramic"
  | "gloss_ceramic"
  | "handmade_ceramic_matte"
  | "handmade_ceramic_gloss"
  | "handmade_clay_matte"
  | "encaustic_cement"
  | "encaustic_cement_mini"
  | "natural_terracotta"
  | "glazed_terracotta"
  | "rustic_cotto"
  | "saltillo_terracotta"
  | "zellige"
  | "dimensional_porcelain";

export type Point = {
  x: number;
  y: number;
};

export type Conflict = {
  code: string;
  message: string;
};

export type TacoTarget =
  | { type: "edge"; col: number; row: number; side: Side; key: string }
  | { type: "corner"; col: number; row: number; corner: Corner; key: string };

export type TacoEraseCandidate = {
  key: string;
  type: "edge" | "corner";
  distance: number;
  hit: boolean;
};

export type DragInteraction =
  | { type: "paint"; pointerId: number }
  | { type: "grab"; pointerId: number; startPoint: Point; startOffsetXInches: number; startOffsetYInches: number }
  | {
      type: "resizeRoom";
      pointerId: number;
      handle: ResizeHandle;
      startClientPoint: Point;
      startWidthInches: number;
      startHeightInches: number;
    };
