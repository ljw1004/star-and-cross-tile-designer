import type { AppState, Corner, GroutColor, Manufacturer, PaletteColor, Side, TileTexture } from "./types";

export const DEFAULT_ROOM_INCHES = { width: 60, height: 96 };
export const DEFAULT_TILE_INCHES = 5;
export const TILE_SIZE_OPTIONS = [3, 4, 5, 6, 7, 8];
export const MIN_ROOM_WIDTH_INCHES = 24;
export const MIN_ROOM_HEIGHT_INCHES = 24;
export const MAX_ROOM_WIDTH_INCHES = 180;
export const MAX_ROOM_HEIGHT_INCHES = 240;
export const BORDER_HANDLE_PX = 8;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 8;
export const ZOOM_FACTOR = 1.12;
export const SCALE = 8;
export const SIDES: Side[] = ["n", "e", "s", "w"];
export const CORNERS: Corner[] = ["nw", "ne", "se", "sw"];
export const DEFAULT_GROUT_COLOR_ID = "warm-gray";
export const DEFAULT_GROUT_JOINT_SIXTEENTHS = 3;
export const GROUT_JOINT_OPTIONS = [1, 2, 3, 4, 6, 8];

export const MANUFACTURERS: Manufacturer[] = [
  {
    id: "equipe-kasbah",
    name: "Equipe Kasbah",
    defaultGroutJointSixteenths: 2,
    colors: [
      tileColor("bone", 1, "Bone", "#e5d8c2", "matte_porcelain", 1),
      tileColor("smoke", 2, "Smoke", "#85817a", "matte_porcelain", 1),
      tileColor("mud", 3, "Mud", "#79685a", "matte_porcelain", 2),
      tileColor("fawn", 4, "Fawn", "#b9936c", "matte_porcelain", 2),
      tileColor("terracotta", 5, "Terracotta", "#b05a3c", "matte_porcelain", 2),
      tileColor("canvas", 6, "Canvas Dot Matt", "#d8c7ae", "matte_porcelain", 1),
      tileColor("orchard", 7, "Orchard Pink Dot Matt", "#d9a6a0", "matte_porcelain", 1),
      tileColor("verd", 8, "Verd Dot Matt", "#536f56", "matte_porcelain", 2),
      tileColor("grass", 9, "Blue Grass Dot Matt", "#536f84", "matte_porcelain", 2),
      tileColor("white", 10, "White Dot Matt", "#ece8dd", "matte_porcelain", 1),
      tileColor("amber", 11, "Amber Grey Dot Matt", "#9b9787", "matte_porcelain", 2),
      tileColor("black", 12, "Black Dot Matt", "#171717", "matte_porcelain", 1),
      tileColor("night", 13, "Blue Night Dot Matt", "#26394d", "matte_porcelain", 2),
    ],
  },
  {
    id: "fireclay-original",
    name: "Fireclay Original Ceramic",
    defaultGroutJointSixteenths: 3,
    colors: [
      tileColor("adriatic-sea", 14, "Adriatic Sea Gloss", "#1f6d78", "handmade_ceramic_gloss", 3),
      tileColor("aegean-sea", 15, "Aegean Sea Gloss", "#3a8fa0", "handmade_ceramic_gloss", 3),
      tileColor("azul", 16, "Azul Gloss", "#245f94", "handmade_ceramic_gloss", 3),
      tileColor("evergreen", 17, "Evergreen Gloss", "#245745", "handmade_ceramic_gloss", 3),
      tileColor("navy-blue", 18, "Navy Blue Gloss", "#1d3550", "handmade_ceramic_gloss", 3),
      tileColor("peabody", 19, "Peabody Gloss", "#b05842", "handmade_ceramic_gloss", 3),
      tileColor("carbon", 20, "Carbon Matte", "#353535", "handmade_ceramic_matte", 2),
      tileColor("cardamom", 21, "Cardamom Matte", "#758164", "handmade_ceramic_matte", 3),
      tileColor("dolomite", 22, "Dolomite Matte", "#dfd8c9", "handmade_ceramic_matte", 2),
      tileColor("dust-storm", 23, "Dust Storm Matte", "#b9a289", "handmade_ceramic_matte", 3),
      tileColor("ivory", 24, "Ivory Matte", "#eee3cf", "handmade_ceramic_matte", 1),
      tileColor("mustard-seed", 25, "Mustard Seed Matte", "#b78a31", "handmade_ceramic_matte", 3),
      tileColor("raven", 26, "Raven Matte", "#181a1b", "handmade_ceramic_matte", 2),
      tileColor("rosemary", 27, "Rosemary Matte", "#64735f", "handmade_ceramic_matte", 3),
      tileColor("sand-dune", 28, "Sand Dune Matte", "#d7c3a6", "handmade_ceramic_matte", 2),
      tileColor("slate-blue", 29, "Slate Blue Matte", "#627b8c", "handmade_ceramic_matte", 3),
    ],
  },
  {
    id: "cle-pavimenti",
    name: "clé Pavimenti Cement",
    defaultGroutJointSixteenths: 1,
    colors: [
      tileColor("cle-charcoal", 30, "Charcoal", "#343434", "encaustic_cement", 3),
      tileColor("cle-flowerpot", 31, "Flowerpot", "#a94f36", "encaustic_cement", 3),
      tileColor("cle-white", 32, "White", "#ebe5d8", "encaustic_cement", 2),
    ],
  },
  {
    id: "zia",
    name: "Zia Stars & Cross",
    defaultGroutJointSixteenths: 1,
    colors: [
      tileColor("zia-white", 33, "White Cement", "#e9e2d4", "encaustic_cement", 2),
      tileColor("zia-ash", 34, "Ash Cement", "#4f4d48", "encaustic_cement", 3),
      tileColor("zia-midnight", 35, "Midnight Cement", "#0f5360", "encaustic_cement", 3),
      tileColor("zia-zeppelin", 36, "Zeppelin Cement", "#6f8067", "encaustic_cement", 3),
      tileColor("zia-bone", 37, "Bone Cement", "#d8c8ad", "encaustic_cement", 2),
      tileColor("zia-blanco", 38, "Blanco Cotto", "#c7b398", "rustic_cotto", 3),
      tileColor("zia-madera", 39, "Madera Cotto", "#5a372a", "rustic_cotto", 4),
      tileColor("zia-red-clay", 40, "Red Clay Cotto", "#9e422f", "rustic_cotto", 4),
    ],
  },
  {
    id: "apollo",
    name: "Apollo Star and Cross",
    defaultGroutJointSixteenths: 2,
    colors: [
      tileColor("apollo-black-gloss", 41, "Black Gloss", "#111111", "gloss_ceramic", 1),
      tileColor("apollo-cornflower", 42, "Cornflower Blue Gloss", "#5f83b8", "gloss_ceramic", 2),
      tileColor("apollo-white", 43, "White Gloss", "#f0eee8", "gloss_ceramic", 1),
      tileColor("apollo-black-matte", 44, "Black Matte", "#111111", "matte_ceramic", 1),
      tileColor("apollo-pistachio", 45, "Pistachio Green Matte", "#91a879", "matte_ceramic", 2),
      tileColor("apollo-light-gray", 46, "Light Gray Matte", "#bebebb", "matte_ceramic", 1),
      tileColor("apollo-beige", 47, "Beige Porcelain", "#cdbb9d", "dimensional_porcelain", 2),
    ],
  },
  {
    id: "rustico-saltillo",
    name: "Rustico Saltillo",
    defaultGroutJointSixteenths: 4,
    colors: [
      tileColor("rustico-spanish-red", 48, "Spanish Mission Red", "#a64b2f", "saltillo_terracotta", 4),
      tileColor("rustico-manganese", 49, "Manganese", "#6b4235", "saltillo_terracotta", 4),
      tileColor("rustico-antique", 50, "Antique", "#bd7546", "saltillo_terracotta", 4),
      tileColor("rustico-traditional", 51, "Traditional", "#c1683a", "saltillo_terracotta", 4),
      tileColor("rustico-unsealed", 52, "Unsealed Saltillo", "#d48b55", "saltillo_terracotta", 4),
    ],
  },
];

export const GROUT_COLORS: GroutColor[] = [
  { id: "white", name: "White", value: "#f2f0e8" },
  { id: "warm-white", name: "Warm White", value: "#e4dccd" },
  { id: "alabaster", name: "Alabaster", value: "#d8d1c2" },
  { id: "biscuit", name: "Biscuit", value: "#cbbfae" },
  { id: "warm-gray", name: "Warm Gray", value: "#aaa59b" },
  { id: "timberwolf", name: "Timberwolf", value: "#8f8c84" },
  { id: "silver", name: "Silver", value: "#c0c0bc" },
  { id: "charcoal", name: "Charcoal", value: "#404040" },
  { id: "black", name: "Black", value: "#151515" },
];

const TILE_COLOR_TABLES = buildTileColorTables(MANUFACTURERS);

export const TILE_COLORS_BY_IID: ReadonlyMap<number, PaletteColor> = TILE_COLOR_TABLES.byIid;
export const TILE_COLOR_IIDS_BY_ID: ReadonlyMap<string, number> = TILE_COLOR_TABLES.iidsById;

export const DEFAULT_STATE: AppState = {
  mode: "straight",
  showGrid: false,
  roomWidthInches: DEFAULT_ROOM_INCHES.width,
  roomHeightInches: DEFAULT_ROOM_INCHES.height,
  tileInches: DEFAULT_TILE_INCHES,
  offsetXInches: 0,
  offsetYInches: 0,
  zoom: 1,
  groutColorId: DEFAULT_GROUT_COLOR_ID,
  groutJointSixteenths: DEFAULT_GROUT_JOINT_SIXTEENTHS,
  tool: "paint",
  paintShape: "diagonalCross",
  manufacturerId: MANUFACTURERS[0].id,
  colorId: MANUFACTURERS[0].colors[0].id,
  cells: new Map(),
  edgeInsets: new Map(),
  cornerInsets: new Map(),
};

function tileColor(
  id: string,
  iid: number,
  name: string,
  value: string,
  texture: TileTexture,
  shadeVariation: 0 | 1 | 2 | 3 | 4,
): PaletteColor {
  const params = textureDefaults(texture);
  return { id, iid, name, value, texture, shadeVariation, ...params };
}

function buildTileColorTables(manufacturers: Manufacturer[]): {
  byIid: ReadonlyMap<number, PaletteColor>;
  iidsById: ReadonlyMap<string, number>;
} {
  const byIid = new Map<number, PaletteColor>();
  const iidsById = new Map<string, number>();

  for (const manufacturer of manufacturers) {
    for (const color of manufacturer.colors) {
      if (!Number.isInteger(color.iid) || color.iid <= 0 || color.iid > 255) {
        throw new Error(`Tile color ${color.id} has invalid integer id ${color.iid}.`);
      }
      const existingColor = byIid.get(color.iid);
      if (existingColor) {
        throw new Error(`Tile color integer id ${color.iid} is used by both ${existingColor.id} and ${color.id}.`);
      }
      const existingIid = iidsById.get(color.id);
      if (existingIid !== undefined) {
        throw new Error(`Tile color string id ${color.id} is used by both integer ids ${existingIid} and ${color.iid}.`);
      }
      byIid.set(color.iid, color);
      iidsById.set(color.id, color.iid);
    }
  }

  return { byIid, iidsById };
}

function textureDefaults(
  texture: TileTexture,
): Omit<PaletteColor, "id" | "iid" | "name" | "value" | "texture" | "shadeVariation"> {
  switch (texture) {
    case "gloss_ceramic":
      return { sheen: 0.72, grain: 0.08, clouding: 0.08, chipRate: 0 };
    case "handmade_ceramic_matte":
      return { sheen: 0.12, grain: 0.16, clouding: 0.26, chipRate: 0.03 };
    case "handmade_ceramic_gloss":
      return { sheen: 0.82, grain: 0.12, clouding: 0.24, chipRate: 0.02 };
    case "encaustic_cement":
      return { sheen: 0.02, grain: 0.38, clouding: 0.44, chipRate: 0.07 };
    case "rustic_cotto":
      return { sheen: 0.06, grain: 0.42, clouding: 0.48, chipRate: 0.1 };
    case "saltillo_terracotta":
      return { sheen: 0.08, grain: 0.52, clouding: 0.62, chipRate: 0.16 };
    case "dimensional_porcelain":
      return { sheen: 0.24, grain: 0.1, clouding: 0.08, chipRate: 0 };
    case "matte_ceramic":
      return { sheen: 0.08, grain: 0.1, clouding: 0.1, chipRate: 0.01 };
    case "matte_porcelain":
    default:
      return { sheen: 0.04, grain: 0.08, clouding: 0.08, chipRate: 0 };
  }
}
