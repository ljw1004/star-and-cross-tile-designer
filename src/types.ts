export type Mode = "straight" | "diagonal";
export type Brush = "orthogonalCross" | "diagonalCross" | "star" | "inset" | "colorOnly" | "grab" | "erase";
export type CrossKind = "orthogonalCross" | "diagonalCross";
export type TileKind = CrossKind | "star";
export type Side = "n" | "e" | "s" | "w";
export type Corner = "nw" | "ne" | "se" | "sw";
export type ResizeHandle = "right" | "bottom" | "corner";

export type PaletteColor = {
  id: string;
  name: string;
  value: string;
};

export type Manufacturer = {
  id: string;
  name: string;
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
  brush: Brush;
  manufacturerId: string;
  colorId: string;
  cells: Map<string, Tile>;
  edgeInsets: Map<string, Inset>;
  cornerInsets: Map<string, Inset>;
};

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
