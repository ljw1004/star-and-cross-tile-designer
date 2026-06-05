import type { AppState, Corner, GroutColor, Manufacturer, PaletteColor, Side, SwatchVisibility, TileTexture } from "./types";

export const DEFAULT_ROOM_INCHES = { width: 48, height: 42 };
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
      tileColor("bone", 1, "Bone", "#e5e4df", "kasbah_matte_porcelain", 2, "compact"),
      tileColor("smoke", 2, "Smoke", "#bdbab3", "kasbah_matte_porcelain", 2, "full"),
      tileColor("mud", 3, "Mud", "#625d58", "kasbah_matte_porcelain", 2, "compact"),
      tileColor("fawn", 4, "Fawn", "#c7ad7b", "kasbah_matte_porcelain", 2, "full"),
      tileColor("terracotta", 5, "Terracotta", "#c48768", "kasbah_matte_porcelain", 3, "compact"),
      tileColor("canvas", 6, "Canvas Dot Matt", "#d9ceb3", "kasbah_matte_porcelain", 2, "compact"),
      tileColor("orchard", 7, "Orchard Pink Dot Matt", "#d1a891", "kasbah_matte_porcelain", 2, "compact"),
      tileColor("verd", 8, "Verd Dot Matt", "#656745", "kasbah_matte_porcelain", 2, "compact"),
      tileColor("grass", 9, "Blue Grass Dot Matt", "#9dafb5", "kasbah_matte_porcelain", 2, "compact"),
      tileColor("white", 10, "White Dot Matt", "#e5e4de", "kasbah_matte_porcelain", 1, "full"),
      tileColor("amber", 11, "Amber Grey Dot Matt", "#b5b3ab", "kasbah_matte_porcelain", 2, "compact"),
      tileColor("black", 12, "Black Hat Dot Matt", "#403d37", "kasbah_matte_porcelain", 2, "compact"),
      tileColor("night", 13, "Blue Night Dot Matt", "#3f4e63", "kasbah_matte_porcelain", 2, "compact"),
      tileColor("orchard-gloss", 53, "Orchard Pink Taco Gloss", "#cf9a84", "kasbah_gloss_porcelain", 3, "compact"),
      tileColor("canvas-gloss", 54, "Canvas Taco Gloss", "#d8c9a9", "kasbah_gloss_porcelain", 3, "full"),
      tileColor("verd-gloss", 55, "Verd Taco Gloss", "#7b823d", "kasbah_gloss_porcelain", 3, "compact"),
      tileColor("grass-gloss", 56, "Blue Grass Taco Gloss", "#9ab2b9", "kasbah_gloss_porcelain", 3, "full"),
      tileColor("night-gloss", 57, "Blue Night Taco Gloss", "#2f4054", "kasbah_gloss_porcelain", 3, "compact"),
      tileColor("white-gloss", 58, "White Taco Gloss", "#e2e1da", "kasbah_gloss_porcelain", 2, "full"),
      tileColor("amber-gloss", 59, "Amber Grey Taco Gloss", "#b9b7af", "kasbah_gloss_porcelain", 3, "full"),
      tileColor("black-gloss", 60, "Black Hat Taco Gloss", "#332f2b", "kasbah_gloss_porcelain", 3, "full"),
    ],
  },
  {
    id: "fireclay-original",
    name: "Fireclay Original Ceramic",
    defaultGroutJointSixteenths: 3,
    colors: [
      tileColor("calcite", 83, "Calcite Matte", "#eeeeec", "handmade_ceramic_matte", 1, "hidden"),
      tileColor("frost", 90, "Frost Matte", "#e8e8e4", "handmade_ceramic_matte", 1, "full"),
      tileColor("ivory", 24, "Ivory Matte", "#ddd5c5", "handmade_ceramic_matte", 2, "compact"),
      tileColor("dolomite", 22, "Dolomite Matte", "#d3cfbd", "handmade_ceramic_matte", 2, "hidden"),
      tileColor("feldspar", 82, "Feldspar Matte", "#e5e0d5", "handmade_ceramic_matte", 1, "hidden"),
      tileColor("tumbleweed", 69, "Tumbleweed Matte", "#ead6bd", "handmade_ceramic_matte", 2, "full"),
      tileColor("sweet-pea", 71, "Sweet Pea Matte", "#cbbca7", "handmade_ceramic_matte", 2, "hidden"),
      tileColor("sand-dune", 28, "Sand Dune Matte", "#d2c6ae", "handmade_ceramic_matte", 2, "compact"),
      tileColor("cardamom", 21, "Cardamom Matte", "#91836f", "handmade_ceramic_matte", 3, "full"),
      tileColor("sandstone", 72, "Sandstone Matte", "#8a806e", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("carbon", 20, "Carbon Matte", "#55504b", "handmade_ceramic_matte", 2, "compact"),
      tileColor("dust-storm", 23, "Dust Storm Matte", "#b4adb0", "handmade_ceramic_matte", 2, "hidden"),
      tileColor("thistle", 70, "Thistle Matte", "#aaa8ad", "handmade_ceramic_matte", 2, "hidden"),
      tileColor("raven", 26, "Raven Matte", "#151717", "handmade_ceramic_matte", 2, "compact"),
      tileColor("slate-blue", 29, "Slate Blue Matte", "#3f4c57", "handmade_ceramic_matte", 3, "compact"),
      tileColor("flagstone", 79, "Flagstone Matte", "#71868a", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("nautical", 87, "Nautical Matte", "#748894", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("crater-lake", 88, "Crater Lake Matte", "#c8d3d9", "handmade_ceramic_matte", 2, "hidden"),
      tileColor("navy-blue-matte", 85, "Navy Blue Matte", "#202b35", "handmade_ceramic_matte", 3, "full"),
      tileColor("lake-tahoe", 104, "Lake Tahoe Matte", "#263251", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("azul-matte", 84, "Azul Matte", "#152880", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("aegean-sea-matte", 93, "Aegean Sea Matte", "#4a86b9", "handmade_ceramic_matte", 3, "compact"),
      tileColor("adriatic-sea-matte", 99, "Adriatic Sea Matte", "#244e64", "handmade_ceramic_matte", 3, "full"),
      tileColor("caribbean-sea", 86, "Caribbean Sea Matte", "#647fa2", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("caspian-sea", 96, "Caspian Sea Matte", "#123341", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("rosemary", 27, "Rosemary Matte", "#9ca694", "handmade_ceramic_matte", 3, "compact"),
      tileColor("sea-green", 62, "Sea Green Matte", "#829a82", "handmade_ceramic_matte", 3, "full"),
      tileColor("amalfi-coast", 67, "Amalfi Coast Matte", "#a3c4bb", "handmade_ceramic_matte", 3, "full"),
      tileColor("overcast", 94, "Overcast Matte", "#dce1d8", "handmade_ceramic_matte", 2, "hidden"),
      tileColor("salton-sea", 95, "Salton Sea Matte", "#bfc5b6", "handmade_ceramic_matte", 2, "hidden"),
      tileColor("kelp", 89, "Kelp Matte", "#849764", "handmade_ceramic_matte", 3, "full"),
      tileColor("peabody-matte", 91, "Peabody Matte", "#7a8862", "handmade_ceramic_matte", 3, "full"),
      tileColor("evergreen-matte", 148, "Evergreen Matte", "#173d2f", "handmade_ceramic_matte", 3, "compact"),
      tileColor("hunter-green", 77, "Hunter Green Matte", "#2e3f26", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("lone-pine", 74, "Lone Pine Matte", "#3e441c", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("bonsai", 81, "Bonsai Matte", "#4b4d21", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("chaparral", 80, "Chaparral Matte", "#987f4a", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("palm-tree", 101, "Palm Tree Matte", "#c6bc54", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("mustard-seed", 25, "Mustard Seed Matte", "#c2a13d", "handmade_ceramic_matte", 4, "compact"),
      tileColor("haystack", 100, "Haystack Matte", "#ecd18d", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("koi", 102, "Koi Matte", "#efad64", "handmade_ceramic_matte", 3, "full"),
      tileColor("mauve", 73, "Mauve Matte", "#9a6f63", "handmade_ceramic_matte", 3, "full"),
      tileColor("painted-sky", 103, "Painted Sky Matte", "#b9a5a8", "handmade_ceramic_matte", 2, "hidden"),
      tileColor("evening-glow", 92, "Evening Glow Matte", "#ded4d7", "handmade_ceramic_matte", 2, "hidden"),
      tileColor("vintage-leather", 68, "Vintage Leather Matte", "#64291e", "handmade_ceramic_matte", 3, "compact"),
      tileColor("garnet", 78, "Garnet Matte", "#45231d", "handmade_ceramic_matte", 3, "full"),
      tileColor("tempest", 97, "Tempest Matte", "#505d55", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("bora-bora", 98, "Bora Bora Matte", "#398980", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("kalamata", 76, "Kalamata Matte", "#615b5c", "handmade_ceramic_matte", 2, "hidden"),
      tileColor("antique", 61, "Antique", "#8e5b43", "handmade_ceramic_matte", 4, "hidden"),
      tileColor("redwood", 64, "Redwood", "#3b2019", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("graphite", 65, "Graphite", "#5b5a51", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("burnt-umber", 66, "Burnt Umber", "#2d211a", "handmade_ceramic_matte", 3, "hidden"),
      tileColor("calcite-gloss", 123, "Calcite Gloss", "#f0f0ef", "handmade_ceramic_gloss", 1, "hidden"),
      tileColor("frost-gloss", 131, "Frost Gloss", "#f0f0ed", "handmade_ceramic_gloss", 1, "full"),
      tileColor("ivory-gloss", 127, "Ivory Gloss", "#e5d8c4", "handmade_ceramic_gloss", 3, "full"),
      tileColor("dolomite-gloss", 147, "Dolomite Gloss", "#d2c7ad", "handmade_ceramic_gloss", 3, "hidden"),
      tileColor("feldspar-gloss", 122, "Feldspar Gloss", "#e6e4de", "handmade_ceramic_gloss", 1, "hidden"),
      tileColor("tumbleweed-gloss", 107, "Tumbleweed Gloss", "#dbc5b1", "handmade_ceramic_gloss", 3, "full"),
      tileColor("sweet-pea-gloss", 109, "Sweet Pea Gloss", "#d4c5ae", "handmade_ceramic_gloss", 3, "hidden"),
      tileColor("sand-dune-gloss", 124, "Sand Dune Gloss", "#d0c3ab", "handmade_ceramic_gloss", 3, "full"),
      tileColor("cardamom-gloss", 133, "Cardamom Gloss", "#a49382", "handmade_ceramic_gloss", 4, "full"),
      tileColor("sandstone-gloss", 110, "Sandstone Gloss", "#958875", "handmade_ceramic_gloss", 3, "hidden"),
      tileColor("carbon-gloss", 120, "Carbon Gloss", "#4b4747", "handmade_ceramic_gloss", 3, "full"),
      tileColor("dust-storm-gloss", 144, "Dust Storm Gloss", "#bebcc1", "handmade_ceramic_gloss", 2, "hidden"),
      tileColor("thistle-gloss", 108, "Thistle Gloss", "#c7c7c8", "handmade_ceramic_gloss", 2, "hidden"),
      tileColor("raven-gloss", 142, "Raven Gloss", "#050606", "handmade_ceramic_gloss", 2, "full"),
      tileColor("slate-blue-gloss", 146, "Slate Blue Gloss", "#3f4e63", "handmade_ceramic_gloss", 4, "full"),
      tileColor("flagstone-gloss", 118, "Flagstone Gloss", "#829690", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("nautical-gloss", 128, "Nautical Gloss", "#4b5d6a", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("crater-lake-gloss", 129, "Crater Lake Gloss", "#c4dce7", "handmade_ceramic_gloss", 3, "hidden"),
      tileColor("navy-blue", 18, "Navy Blue Gloss", "#06172d", "handmade_ceramic_gloss", 4, "compact"),
      tileColor("lake-tahoe-gloss", 145, "Lake Tahoe Gloss", "#0b4b7d", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("azul", 16, "Azul Gloss", "#102a8a", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("aegean-sea", 15, "Aegean Sea Gloss", "#3a82bd", "handmade_ceramic_gloss", 4, "compact"),
      tileColor("adriatic-sea", 14, "Adriatic Sea Gloss", "#2f7897", "handmade_ceramic_gloss", 4, "full"),
      tileColor("caribbean-sea-gloss", 125, "Caribbean Sea Gloss", "#8bb8d3", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("caspian-sea-gloss", 136, "Caspian Sea Gloss", "#073643", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("rosemary-gloss", 63, "Rosemary Gloss", "#b7bfb1", "handmade_ceramic_gloss", 3, "full"),
      tileColor("sea-green-gloss", 126, "Sea Green Gloss", "#68a36f", "handmade_ceramic_gloss", 4, "full"),
      tileColor("amalfi-coast-gloss", 105, "Amalfi Coast Gloss", "#7eb4a9", "handmade_ceramic_gloss", 4, "compact"),
      tileColor("overcast-gloss", 134, "Overcast Gloss", "#cbd7ce", "handmade_ceramic_gloss", 3, "hidden"),
      tileColor("salton-sea-gloss", 135, "Salton Sea Gloss", "#d9e3dc", "handmade_ceramic_gloss", 3, "hidden"),
      tileColor("kelp-gloss", 130, "Kelp Gloss", "#6c8d4f", "handmade_ceramic_gloss", 4, "full"),
      tileColor("peabody", 19, "Peabody Gloss", "#6f7c5a", "handmade_ceramic_gloss", 4, "full"),
      tileColor("evergreen", 17, "Evergreen Gloss", "#0c3f34", "handmade_ceramic_gloss", 4, "compact"),
      tileColor("hunter-green-gloss", 116, "Hunter Green Gloss", "#102b1d", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("lone-pine-gloss", 113, "Lone Pine Gloss", "#3f491c", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("bonsai-gloss", 121, "Bonsai Gloss", "#50541f", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("chaparral-gloss", 119, "Chaparral Gloss", "#807431", "handmade_ceramic_gloss", 3, "hidden"),
      tileColor("palm-tree-gloss", 140, "Palm Tree Gloss", "#c8c04e", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("mustard-seed-gloss", 111, "Mustard Seed Gloss", "#ad912d", "handmade_ceramic_gloss", 4, "full"),
      tileColor("haystack-gloss", 139, "Haystack Gloss", "#e4c76e", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("koi-gloss", 141, "Koi Gloss", "#edae62", "handmade_ceramic_gloss", 4, "full"),
      tileColor("mauve-gloss", 112, "Mauve Gloss", "#9d7164", "handmade_ceramic_gloss", 3, "full"),
      tileColor("painted-sky-gloss", 143, "Painted Sky Gloss", "#c5b8bd", "handmade_ceramic_gloss", 3, "hidden"),
      tileColor("evening-glow-gloss", 132, "Evening Glow Gloss", "#dfd6d9", "handmade_ceramic_gloss", 2, "hidden"),
      tileColor("vintage-leather-gloss", 106, "Vintage Leather Gloss", "#682d22", "handmade_ceramic_gloss", 4, "full"),
      tileColor("garnet-gloss", 117, "Garnet Gloss", "#3e1c13", "handmade_ceramic_gloss", 4, "compact"),
      tileColor("tempest-gloss", 137, "Tempest Gloss", "#3e4a41", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("bora-bora-gloss", 138, "Bora Bora Gloss", "#2c9a90", "handmade_ceramic_gloss", 4, "hidden"),
      tileColor("kalamata-gloss", 115, "Kalamata Gloss", "#5d5758", "handmade_ceramic_gloss", 3, "hidden"),
    ],
  },
  {
    id: "cle-pavimenti",
    name: "clé Pavimenti Cement",
    defaultGroutJointSixteenths: 1,
    colors: [
      tileColor("cle-charcoal", 30, "Charcoal", "#343434", "encaustic_cement", 3, "compact"),
      tileColor("cle-flowerpot", 31, "Flowerpot", "#a94f36", "encaustic_cement", 3, "compact"),
      tileColor("cle-white", 32, "White", "#ebe5d8", "encaustic_cement", 2, "compact"),
    ],
  },
  {
    id: "zia",
    name: "Zia Stars & Cross",
    defaultGroutJointSixteenths: 1,
    colors: [
      tileColor("zia-white", 33, "White Cement", "#e9e2d4", "encaustic_cement", 2, "compact"),
      tileColor("zia-ash", 34, "Ash Cement", "#4f4d48", "encaustic_cement", 3, "compact"),
      tileColor("zia-midnight", 35, "Midnight Cement", "#0f5360", "encaustic_cement", 3, "compact"),
      tileColor("zia-zeppelin", 36, "Zeppelin Cement", "#6f8067", "encaustic_cement", 3, "compact"),
      tileColor("zia-bone", 37, "Bone Cement", "#d8c8ad", "encaustic_cement", 2, "compact"),
      tileColor("zia-blanco", 38, "Blanco Cotto", "#c7b398", "rustic_cotto", 3, "compact"),
      tileColor("zia-madera", 39, "Madera Cotto", "#5a372a", "rustic_cotto", 4, "compact"),
      tileColor("zia-red-clay", 40, "Red Clay Cotto", "#9e422f", "rustic_cotto", 4, "compact"),
    ],
  },
  {
    id: "apollo",
    name: "Apollo Star and Cross",
    defaultGroutJointSixteenths: 2,
    colors: [
      tileColor("apollo-black-gloss", 41, "Black Gloss", "#111111", "gloss_ceramic", 1, "compact"),
      tileColor("apollo-cornflower", 42, "Cornflower Blue Gloss", "#5f83b8", "gloss_ceramic", 2, "compact"),
      tileColor("apollo-white", 43, "White Gloss", "#f0eee8", "gloss_ceramic", 1, "full"),
      tileColor("apollo-black-matte", 44, "Black Matte", "#111111", "matte_ceramic", 1, "full"),
      tileColor("apollo-pistachio", 45, "Pistachio Green Matte", "#91a879", "matte_ceramic", 2, "compact"),
      tileColor("apollo-light-gray", 46, "Light Gray Matte", "#bebebb", "matte_ceramic", 1, "full"),
      tileColor("apollo-beige", 47, "Beige Porcelain", "#cdbb9d", "dimensional_porcelain", 2, "compact"),
    ],
  },
  {
    id: "rustico-saltillo",
    name: "Rustico Saltillo",
    defaultGroutJointSixteenths: 4,
    colors: [
      tileColor("rustico-spanish-red", 48, "Spanish Mission Red", "#a64b2f", "saltillo_terracotta", 4, "compact"),
      tileColor("rustico-manganese", 49, "Manganese", "#6b4235", "saltillo_terracotta", 4, "compact"),
      tileColor("rustico-antique", 50, "Antique", "#bd7546", "saltillo_terracotta", 4, "compact"),
      tileColor("rustico-traditional", 51, "Traditional", "#c1683a", "saltillo_terracotta", 4, "compact"),
      tileColor("rustico-unsealed", 52, "Unsealed Saltillo", "#d48b55", "saltillo_terracotta", 4, "full"),
    ],
  },
];

export const GROUT_COLORS: GroutColor[] = [
  { id: "white", gid: 1, name: "White", value: "#f2f0e8", swatchVisibility: "compact" },
  { id: "warm-white", gid: 2, name: "Warm White", value: "#e4dccd", swatchVisibility: "compact" },
  { id: "alabaster", gid: 3, name: "Alabaster", value: "#d8d1c2", swatchVisibility: "compact" },
  { id: "biscuit", gid: 4, name: "Biscuit", value: "#cbbfae", swatchVisibility: "compact" },
  { id: "warm-gray", gid: 5, name: "Warm Gray", value: "#aaa59b", swatchVisibility: "compact" },
  { id: "timberwolf", gid: 6, name: "Timberwolf", value: "#8f8c84", swatchVisibility: "compact" },
  { id: "silver", gid: 7, name: "Silver", value: "#c0c0bc", swatchVisibility: "hidden" },
  { id: "sand-tan", gid: 13, name: "Sand Tan", value: "#C5AE91", swatchVisibility: "compact" },
  { id: "mushroom", gid: 8, name: "Mushroom", value: "#6f675d", swatchVisibility: "compact" },
  { id: "clay-brown", gid: 9, name: "Clay Brown", value: "#5f4b3f", swatchVisibility: "compact" },
  { id: "slate-blue", gid: 10, name: "Slate Blue", value: "#344653", swatchVisibility: "compact" },
  { id: "charcoal", gid: 11, name: "Charcoal", value: "#404040", swatchVisibility: "compact" },
  { id: "black", gid: 12, name: "Black", value: "#151515", swatchVisibility: "compact" },
];

const TILE_COLOR_TABLES = buildTileColorTables(MANUFACTURERS);
const GROUT_COLOR_TABLES = buildGroutColorTables(GROUT_COLORS);

export const TILE_COLORS_BY_IID: ReadonlyMap<number, PaletteColor> = TILE_COLOR_TABLES.byIid;
export const TILE_COLOR_IIDS_BY_ID: ReadonlyMap<string, number> = TILE_COLOR_TABLES.iidsById;
export const GROUT_COLORS_BY_GID: ReadonlyMap<number, GroutColor> = GROUT_COLOR_TABLES.byGid;
export const GROUT_COLOR_GIDS_BY_ID: ReadonlyMap<string, number> = GROUT_COLOR_TABLES.gidsById;

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
  swatchVisibility: SwatchVisibility,
): PaletteColor {
  const params = textureDefaults(texture);
  return { id, iid, name, value, texture, shadeVariation, swatchVisibility, ...params };
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

function buildGroutColorTables(groutColors: GroutColor[]): {
  byGid: ReadonlyMap<number, GroutColor>;
  gidsById: ReadonlyMap<string, number>;
} {
  const byGid = new Map<number, GroutColor>();
  const gidsById = new Map<string, number>();

  for (const color of groutColors) {
    if (!Number.isInteger(color.gid) || color.gid <= 0 || color.gid > 255) {
      throw new Error(`Grout color ${color.id} has invalid grout id ${color.gid}.`);
    }
    const existingColor = byGid.get(color.gid);
    if (existingColor) {
      throw new Error(`Grout color id ${color.gid} is used by both ${existingColor.id} and ${color.id}.`);
    }
    const existingGid = gidsById.get(color.id);
    if (existingGid !== undefined) {
      throw new Error(`Grout color string id ${color.id} is used by both grout ids ${existingGid} and ${color.gid}.`);
    }
    byGid.set(color.gid, color);
    gidsById.set(color.id, color.gid);
  }

  return { byGid, gidsById };
}

function textureDefaults(
  texture: TileTexture,
): Omit<PaletteColor, "id" | "iid" | "name" | "value" | "texture" | "shadeVariation" | "swatchVisibility"> {
  switch (texture) {
    case "kasbah_matte_porcelain":
      return { sheen: 0, grain: 0.16, clouding: 0.24, chipRate: 0 };
    case "kasbah_gloss_porcelain":
      return { sheen: 0.62, grain: 0.12, clouding: 0.3, chipRate: 0 };
    case "gloss_ceramic":
      return { sheen: 0.72, grain: 0.08, clouding: 0.08, chipRate: 0 };
    case "handmade_ceramic_matte":
      return { sheen: 0.1, grain: 0.18, clouding: 0.3, chipRate: 0.015 };
    case "handmade_ceramic_gloss":
      return { sheen: 0.86, grain: 0.1, clouding: 0.3, chipRate: 0.01 };
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
