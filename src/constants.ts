import type { AppState, Corner, GroutColor, Manufacturer, PaletteColor, Side, TileTexture } from "./types";

export const DEFAULT_ROOM_INCHES = { width: 60, height: 96 };
export const DEFAULT_TILE_INCHES = 8;
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
export const DEFAULT_GROUT_COLOR_ID = "warm-white";
export const GROUT_JOINT_OPTIONS = [1, 2, 3, 4, 6, 8];

export const MANUFACTURERS: Manufacturer[] = [
  {
    id: "equipe-kasbah",
    name: "Equipe Kasbah",
    defaultGroutJointSixteenths: 2,
    colors: [
      tileColor("bone", "Bone", "#e5d8c2", "matte_porcelain", 1),
      tileColor("smoke", "Smoke", "#85817a", "matte_porcelain", 1),
      tileColor("mud", "Mud", "#79685a", "matte_porcelain", 2),
      tileColor("fawn", "Fawn", "#b9936c", "matte_porcelain", 2),
      tileColor("terracotta", "Terracotta", "#b05a3c", "matte_porcelain", 2),
      tileColor("canvas", "Canvas Dot Matt", "#d8c7ae", "matte_porcelain", 1),
      tileColor("orchard", "Orchard Pink Dot Matt", "#d9a6a0", "matte_porcelain", 1),
      tileColor("verd", "Verd Dot Matt", "#536f56", "matte_porcelain", 2),
      tileColor("grass", "Blue Grass Dot Matt", "#536f84", "matte_porcelain", 2),
      tileColor("white", "White Dot Matt", "#ece8dd", "matte_porcelain", 1),
      tileColor("amber", "Amber Grey Dot Matt", "#9b9787", "matte_porcelain", 2),
      tileColor("black", "Black Dot Matt", "#171717", "matte_porcelain", 1),
      tileColor("night", "Blue Night Dot Matt", "#26394d", "matte_porcelain", 2),
    ],
  },
  {
    id: "fireclay-original",
    name: "Fireclay Original Ceramic",
    defaultGroutJointSixteenths: 3,
    colors: [
      tileColor("adriatic-sea", "Adriatic Sea Gloss", "#1f6d78", "handmade_ceramic_gloss", 3),
      tileColor("aegean-sea", "Aegean Sea Gloss", "#3a8fa0", "handmade_ceramic_gloss", 3),
      tileColor("azul", "Azul Gloss", "#245f94", "handmade_ceramic_gloss", 3),
      tileColor("evergreen", "Evergreen Gloss", "#245745", "handmade_ceramic_gloss", 3),
      tileColor("navy-blue", "Navy Blue Gloss", "#1d3550", "handmade_ceramic_gloss", 3),
      tileColor("peabody", "Peabody Gloss", "#b05842", "handmade_ceramic_gloss", 3),
      tileColor("carbon", "Carbon Matte", "#353535", "handmade_ceramic_matte", 2),
      tileColor("cardamom", "Cardamom Matte", "#758164", "handmade_ceramic_matte", 3),
      tileColor("dolomite", "Dolomite Matte", "#dfd8c9", "handmade_ceramic_matte", 2),
      tileColor("dust-storm", "Dust Storm Matte", "#b9a289", "handmade_ceramic_matte", 3),
      tileColor("ivory", "Ivory Matte", "#eee3cf", "handmade_ceramic_matte", 1),
      tileColor("mustard-seed", "Mustard Seed Matte", "#b78a31", "handmade_ceramic_matte", 3),
      tileColor("raven", "Raven Matte", "#181a1b", "handmade_ceramic_matte", 2),
      tileColor("rosemary", "Rosemary Matte", "#64735f", "handmade_ceramic_matte", 3),
      tileColor("sand-dune", "Sand Dune Matte", "#d7c3a6", "handmade_ceramic_matte", 2),
      tileColor("slate-blue", "Slate Blue Matte", "#627b8c", "handmade_ceramic_matte", 3),
    ],
  },
  {
    id: "cle-pavimenti",
    name: "clé Pavimenti Cement",
    defaultGroutJointSixteenths: 1,
    colors: [
      tileColor("cle-charcoal", "Charcoal", "#343434", "encaustic_cement", 3),
      tileColor("cle-flowerpot", "Flowerpot", "#a94f36", "encaustic_cement", 3),
      tileColor("cle-white", "White", "#ebe5d8", "encaustic_cement", 2),
    ],
  },
  {
    id: "zia",
    name: "Zia Stars & Cross",
    defaultGroutJointSixteenths: 1,
    colors: [
      tileColor("zia-white", "White Cement", "#e9e2d4", "encaustic_cement", 2),
      tileColor("zia-ash", "Ash Cement", "#4f4d48", "encaustic_cement", 3),
      tileColor("zia-midnight", "Midnight Cement", "#0f5360", "encaustic_cement", 3),
      tileColor("zia-zeppelin", "Zeppelin Cement", "#6f8067", "encaustic_cement", 3),
      tileColor("zia-bone", "Bone Cement", "#d8c8ad", "encaustic_cement", 2),
      tileColor("zia-blanco", "Blanco Cotto", "#c7b398", "rustic_cotto", 3),
      tileColor("zia-madera", "Madera Cotto", "#5a372a", "rustic_cotto", 4),
      tileColor("zia-red-clay", "Red Clay Cotto", "#9e422f", "rustic_cotto", 4),
    ],
  },
  {
    id: "apollo",
    name: "Apollo Star and Cross",
    defaultGroutJointSixteenths: 2,
    colors: [
      tileColor("apollo-black-gloss", "Black Gloss", "#111111", "gloss_ceramic", 1),
      tileColor("apollo-cornflower", "Cornflower Blue Gloss", "#5f83b8", "gloss_ceramic", 2),
      tileColor("apollo-white", "White Gloss", "#f0eee8", "gloss_ceramic", 1),
      tileColor("apollo-black-matte", "Black Matte", "#111111", "matte_ceramic", 1),
      tileColor("apollo-pistachio", "Pistachio Green Matte", "#91a879", "matte_ceramic", 2),
      tileColor("apollo-light-gray", "Light Gray Matte", "#bebebb", "matte_ceramic", 1),
      tileColor("apollo-beige", "Beige Porcelain", "#cdbb9d", "dimensional_porcelain", 2),
    ],
  },
  {
    id: "rustico-saltillo",
    name: "Rustico Saltillo",
    defaultGroutJointSixteenths: 4,
    colors: [
      tileColor("rustico-spanish-red", "Spanish Mission Red", "#a64b2f", "saltillo_terracotta", 4),
      tileColor("rustico-manganese", "Manganese", "#6b4235", "saltillo_terracotta", 4),
      tileColor("rustico-antique", "Antique", "#bd7546", "saltillo_terracotta", 4),
      tileColor("rustico-traditional", "Traditional", "#c1683a", "saltillo_terracotta", 4),
      tileColor("rustico-unsealed", "Unsealed Saltillo", "#d48b55", "saltillo_terracotta", 4),
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
  groutJointSixteenths: MANUFACTURERS[0].defaultGroutJointSixteenths,
  tool: "paint",
  paintShape: "orthogonalCross",
  manufacturerId: MANUFACTURERS[0].id,
  colorId: MANUFACTURERS[0].colors[0].id,
  cells: new Map(),
  edgeInsets: new Map(),
  cornerInsets: new Map(),
};

function tileColor(
  id: string,
  name: string,
  value: string,
  texture: TileTexture,
  shadeVariation: 0 | 1 | 2 | 3 | 4,
): PaletteColor {
  const params = textureDefaults(texture);
  return { id, name, value, texture, shadeVariation, ...params };
}

function textureDefaults(texture: TileTexture): Omit<PaletteColor, "id" | "name" | "value" | "texture" | "shadeVariation"> {
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
