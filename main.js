"use strict";
(() => {
  // src/constants.ts
  var DEFAULT_ROOM_INCHES = { width: 60, height: 96 };
  var DEFAULT_TILE_INCHES = 8;
  var TILE_SIZE_OPTIONS = [3, 4, 5, 6, 7, 8];
  var MIN_ROOM_WIDTH_INCHES = 24;
  var MIN_ROOM_HEIGHT_INCHES = 24;
  var MAX_ROOM_WIDTH_INCHES = 180;
  var MAX_ROOM_HEIGHT_INCHES = 240;
  var BORDER_HANDLE_PX = 8;
  var MIN_ZOOM = 0.5;
  var MAX_ZOOM = 8;
  var ZOOM_FACTOR = 1.12;
  var SCALE = 8;
  var SIDES = ["n", "e", "s", "w"];
  var CORNERS = ["nw", "ne", "se", "sw"];
  var DEFAULT_GROUT_COLOR_ID = "warm-white";
  var GROUT_JOINT_OPTIONS = [1, 2, 3, 4, 6, 8];
  var MANUFACTURERS = [
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
        tileColor("night", "Blue Night Dot Matt", "#26394d", "matte_porcelain", 2)
      ]
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
        tileColor("slate-blue", "Slate Blue Matte", "#627b8c", "handmade_ceramic_matte", 3)
      ]
    },
    {
      id: "cle-pavimenti",
      name: "cl\xE9 Pavimenti Cement",
      defaultGroutJointSixteenths: 1,
      colors: [
        tileColor("cle-charcoal", "Charcoal", "#343434", "encaustic_cement", 3),
        tileColor("cle-flowerpot", "Flowerpot", "#a94f36", "encaustic_cement", 3),
        tileColor("cle-white", "White", "#ebe5d8", "encaustic_cement", 2)
      ]
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
        tileColor("zia-red-clay", "Red Clay Cotto", "#9e422f", "rustic_cotto", 4)
      ]
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
        tileColor("apollo-beige", "Beige Porcelain", "#cdbb9d", "dimensional_porcelain", 2)
      ]
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
        tileColor("rustico-unsealed", "Unsealed Saltillo", "#d48b55", "saltillo_terracotta", 4)
      ]
    }
  ];
  var GROUT_COLORS = [
    { id: "white", name: "White", value: "#f2f0e8" },
    { id: "warm-white", name: "Warm White", value: "#e4dccd" },
    { id: "alabaster", name: "Alabaster", value: "#d8d1c2" },
    { id: "biscuit", name: "Biscuit", value: "#cbbfae" },
    { id: "warm-gray", name: "Warm Gray", value: "#aaa59b" },
    { id: "timberwolf", name: "Timberwolf", value: "#8f8c84" },
    { id: "silver", name: "Silver", value: "#c0c0bc" },
    { id: "charcoal", name: "Charcoal", value: "#404040" },
    { id: "black", name: "Black", value: "#151515" }
  ];
  var DEFAULT_STATE = {
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
    cells: /* @__PURE__ */ new Map(),
    edgeInsets: /* @__PURE__ */ new Map(),
    cornerInsets: /* @__PURE__ */ new Map()
  };
  function tileColor(id, name, value, texture, shadeVariation) {
    const params = textureDefaults(texture);
    return { id, name, value, texture, shadeVariation, ...params };
  }
  function textureDefaults(texture) {
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

  // src/keys.ts
  function cellKey(col, row) {
    return `${col}:${row}`;
  }
  function parseCellKey(key) {
    const [col, row] = key.split(":").map(Number);
    return { col, row };
  }
  function edgeKey(col, row, side) {
    return `${col}:${row}:${side}`;
  }
  function parseEdgeKey(key) {
    const [col, row, side] = key.split(":");
    return { col: Number(col), row: Number(row), side };
  }
  function cornerKey(col, row, corner) {
    return `${col}:${row}:${corner}`;
  }
  function parseCornerKey(key) {
    const [col, row, corner] = key.split(":");
    return { col: Number(col), row: Number(row), corner };
  }
  function cellLabel(col, row) {
    return `(${col}, ${row})`;
  }
  function neighborForSide(col, row, side) {
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
  function oppositeSide(side) {
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
  function neighbors(col, row) {
    return [
      { col, row: row - 1 },
      { col: col + 1, row },
      { col, row: row + 1 },
      { col: col - 1, row }
    ];
  }
  function cellsForEdge(col, row, side) {
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
  function canonicalEdgeKey(col, row, side) {
    if (side === "n") {
      return edgeKey(col, row - 1, "s");
    }
    if (side === "w") {
      return edgeKey(col - 1, row, "e");
    }
    return edgeKey(col, row, side);
  }

  // src/geometry.ts
  var IDEAL_TACO_TO_HALF_BASE = 2 - Math.SQRT2;
  function initialZoomForRoom(workspace2, roomWidthInches, roomHeightInches) {
    const style = getComputedStyle(workspace2);
    const horizontalPadding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
    const verticalPadding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    const availableWidth = Math.max(1, workspace2.clientWidth - horizontalPadding);
    const availableHeight = Math.max(1, workspace2.clientHeight - verticalPadding);
    const roomWidth = roomWidthInches * SCALE;
    const roomHeight = roomHeightInches * SCALE;
    return normalizeZoom(Math.min(availableWidth / roomWidth, availableHeight / roomHeight));
  }
  function roomPx(state2) {
    return {
      width: state2.roomWidthInches * SCALE,
      height: state2.roomHeightInches * SCALE
    };
  }
  function roomCenter(state2) {
    const room = roomPx(state2);
    return { x: room.width / 2, y: room.height / 2 };
  }
  function tilePx(state2) {
    return state2.tileInches * SCALE;
  }
  function groutPx(state2) {
    return Math.max(1, state2.groutJointSixteenths / 16 * SCALE);
  }
  function tacoSidePx(state2) {
    return Math.max(1, idealTacoSidePx(state2) - groutPx(state2));
  }
  function cornerTacoSidePx(state2) {
    return tacoSidePx(state2);
  }
  function idealTacoSidePx(state2) {
    return tilePx(state2) / 2 * IDEAL_TACO_TO_HALF_BASE;
  }
  function tacoHalfDiagonalPx(state2) {
    return tacoSidePx(state2) / Math.SQRT2;
  }
  function idealTacoHalfDiagonalPx(state2) {
    return idealTacoSidePx(state2) / Math.SQRT2;
  }
  function pointInRoom(state2, point) {
    const room = roomPx(state2);
    return point.x >= 0 && point.y >= 0 && point.x <= room.width && point.y <= room.height;
  }
  function resizeHandleAtPoint(state2, point) {
    const room = roomPx(state2);
    const nearRight = Math.abs(point.x - room.width) <= BORDER_HANDLE_PX;
    const nearBottom = Math.abs(point.y - room.height) <= BORDER_HANDLE_PX;
    if (nearRight && nearBottom) {
      return "corner";
    }
    if (nearRight) {
      return "right";
    }
    if (nearBottom) {
      return "bottom";
    }
    return void 0;
  }
  function layoutRotation(state2) {
    return state2.mode === "diagonal" ? Math.PI / 4 : 0;
  }
  function gridOrigin(state2) {
    const center = roomCenter(state2);
    return {
      x: center.x + state2.offsetXInches * SCALE,
      y: center.y + state2.offsetYInches * SCALE
    };
  }
  function cellLocalToScreen(state2, col, row, localX, localY) {
    const tile = tilePx(state2);
    const x = col * tile + localX;
    const y = row * tile + localY;
    return gridLocalToScreen(state2, { x, y });
  }
  function gridLocalRoomWindow(state2) {
    const room = roomPx(state2);
    const points = [
      screenToGridLocal(state2, { x: 0, y: 0 }),
      screenToGridLocal(state2, { x: room.width, y: 0 }),
      screenToGridLocal(state2, { x: room.width, y: room.height }),
      screenToGridLocal(state2, { x: 0, y: room.height })
    ];
    return {
      minX: Math.min(...points.map((point) => point.x)),
      maxX: Math.max(...points.map((point) => point.x)),
      minY: Math.min(...points.map((point) => point.y)),
      maxY: Math.max(...points.map((point) => point.y))
    };
  }
  function gridLocalToScreen(state2, point) {
    const origin = gridOrigin(state2);
    if (state2.mode !== "diagonal") {
      return { x: origin.x + point.x, y: origin.y + point.y };
    }
    const angle = layoutRotation(state2);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: origin.x + point.x * cos - point.y * sin,
      y: origin.y + point.x * sin + point.y * cos
    };
  }
  function screenToGridLocal(state2, point) {
    const origin = gridOrigin(state2);
    const x = point.x - origin.x;
    const y = point.y - origin.y;
    if (state2.mode !== "diagonal") {
      return { x, y };
    }
    const angle = -layoutRotation(state2);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos
    };
  }
  function cellFromPoint(state2, point) {
    const tile = tilePx(state2);
    const local = screenToGridLocal(state2, point);
    return {
      col: Math.floor(local.x / tile + 0.5),
      row: Math.floor(local.y / tile + 0.5)
    };
  }
  function canvasPoint(state2, canvas2, event) {
    const rect = canvas2.getBoundingClientRect();
    const room = roomPx(state2);
    return {
      x: (event.clientX - rect.left) / rect.width * room.width,
      y: (event.clientY - rect.top) / rect.height * room.height
    };
  }
  function nearestEdge(state2, point, col, row) {
    const sides = ["n", "e", "s", "w"];
    let nearest = sides[0];
    let nearestDistance = Infinity;
    for (const side of sides) {
      const midpoint2 = edgeMidpoint(state2, col, row, side);
      const distance2 = Math.hypot(point.x - midpoint2.x, point.y - midpoint2.y);
      if (distance2 < nearestDistance) {
        nearest = side;
        nearestDistance = distance2;
      }
    }
    return { col, row, side: nearest, key: canonicalEdgeKey(col, row, nearest) };
  }
  function nearestCorner(state2, point, col, row) {
    const halfTile = tilePx(state2) / 2;
    const corners = [
      { corner: "nw", point: cellLocalToScreen(state2, col, row, -halfTile, -halfTile) },
      { corner: "ne", point: cellLocalToScreen(state2, col, row, halfTile, -halfTile) },
      { corner: "se", point: cellLocalToScreen(state2, col, row, halfTile, halfTile) },
      { corner: "sw", point: cellLocalToScreen(state2, col, row, -halfTile, halfTile) }
    ];
    let nearest = corners[0];
    let nearestDistance = Infinity;
    for (const corner of corners) {
      const distance2 = Math.hypot(point.x - corner.point.x, point.y - corner.point.y);
      if (distance2 < nearestDistance) {
        nearest = corner;
        nearestDistance = distance2;
      }
    }
    return { col, row, corner: nearest.corner, key: cornerKey(col, row, nearest.corner) };
  }
  function nearestTacoTarget(state2, point, col, row) {
    const edge = nearestEdge(state2, point, col, row);
    const corner = nearestCorner(state2, point, col, row);
    const edgeDistance = distance(point, edgeMidpoint(state2, edge.col, edge.row, edge.side));
    const cornerDistance = distance(point, cornerInsetCenter(state2, corner.col, corner.row, corner.corner));
    if (edgeDistance <= cornerDistance) {
      return { type: "edge", ...edge };
    }
    return { type: "corner", ...corner };
  }
  function edgeMidpoint(state2, col, row, side) {
    const halfTile = tilePx(state2) / 2;
    if (side === "n") {
      return cellLocalToScreen(state2, col, row, 0, -halfTile);
    }
    if (side === "e") {
      return cellLocalToScreen(state2, col, row, halfTile, 0);
    }
    if (side === "s") {
      return cellLocalToScreen(state2, col, row, 0, halfTile);
    }
    return cellLocalToScreen(state2, col, row, -halfTile, 0);
  }
  function cornerInsetCenter(state2, col, row, corner) {
    const halfTile = tilePx(state2) / 2;
    const centerOffset = groutPx(state2) / 2 + cornerTacoSidePx(state2) / 2;
    const x = corner === "nw" || corner === "sw" ? -halfTile + centerOffset : halfTile - centerOffset;
    const y = corner === "nw" || corner === "ne" ? -halfTile + centerOffset : halfTile - centerOffset;
    return cellLocalToScreen(state2, col, row, x, y);
  }
  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  function visibleCell(state2, col, row) {
    const room = roomPx(state2);
    const margin = tilePx(state2);
    const halfTile = tilePx(state2) / 2;
    const points = [
      cellLocalToScreen(state2, col, row, -halfTile, -halfTile),
      cellLocalToScreen(state2, col, row, halfTile, -halfTile),
      cellLocalToScreen(state2, col, row, halfTile, halfTile),
      cellLocalToScreen(state2, col, row, -halfTile, halfTile),
      cellLocalToScreen(state2, col, row, 0, 0)
    ];
    return points.some(
      (point) => point.x >= -margin && point.y >= -margin && point.x <= room.width + margin && point.y <= room.height + margin
    );
  }
  function roundToHalfInch(value) {
    return Math.round(value * 2) / 2;
  }
  function normalizeZoom(value) {
    return Math.round(clamp(value, MIN_ZOOM, MAX_ZOOM) * 100) / 100;
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  // src/icons.ts
  var ERASER_CURSOR = svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="white" stroke="black" stroke-linejoin="round" stroke-width="2" d="M6 21 19 8l8 8-10 10H11z"/><path fill="black" d="M11 26h17v3H11z"/><path fill="white" stroke="black" stroke-linejoin="round" stroke-width="2" d="M6 21 11 26h6l4-4-8-8z"/></svg>`,
    6,
    21,
    "crosshair"
  );
  var PAINT_ROLLER_CURSOR = svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="black" d="M16 1 19 5h-6z"/><rect x="4" y="5" width="20" height="7" rx="2" fill="white" stroke="black" stroke-width="2"/><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M24 8.5h4v7.5H17v4"/><path fill="white" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 20h6v9h-6z"/></svg>`,
    16,
    1,
    "crosshair"
  );
  var DROPPER_CURSOR = svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g transform="rotate(45 16 16)"><path fill="black" d="M11 7c0-4 5-7 5-7s5 3 5 7c0 3-2 6-5 6s-5-3-5-6z"/><rect x="14" y="12" width="4" height="16" rx="1" fill="white" stroke="black" stroke-width="2"/><path fill="white" stroke="black" stroke-linejoin="round" stroke-width="2" d="M14 28h4l-2 3z"/></g></svg>`,
    24,
    28,
    "copy"
  );
  function traceToolIconPath(ctx2, shape, mode) {
    ctx2.beginPath();
    if (shape === "orthogonalCross") {
      tracePolygon(ctx2, [
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
        [33.8, 16.3]
      ]);
    } else if (shape === "diagonalCross") {
      tracePolygon(ctx2, [
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
        [10, 36]
      ]);
    } else if (shape === "star") {
      tracePolygon(ctx2, [
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
        [16, 36]
      ]);
    } else if (mode === "diagonal") {
      tracePolygon(ctx2, [
        [28, 28],
        [72, 28],
        [72, 72],
        [28, 72]
      ]);
    } else {
      tracePolygon(ctx2, [
        [50, 14],
        [86, 50],
        [50, 86],
        [14, 50]
      ]);
    }
  }
  function svgCursor(svg, hotspotX, hotspotY, fallback) {
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspotX} ${hotspotY}, ${fallback}`;
  }
  function tracePolygon(ctx2, points) {
    const [first, ...rest] = points;
    ctx2.moveTo(first[0], first[1]);
    for (const point of rest) {
      ctx2.lineTo(point[0], point[1]);
    }
    ctx2.closePath();
  }

  // src/conflicts.ts
  function analyzeLayoutConflicts(state2) {
    const conflicts = [];
    const seen = /* @__PURE__ */ new Set();
    const add = (code, message) => {
      const key = `${code}:${message}`;
      if (!seen.has(key)) {
        seen.add(key);
        conflicts.push({ code, message });
      }
    };
    for (const [key, tile] of state2.cells) {
      if (tile.kind !== "star") {
        continue;
      }
      const { col, row } = parseCellKey(key);
      for (const side of SIDES) {
        const adjacent = neighborForSide(col, row, side);
        const neighbor = state2.cells.get(cellKey(adjacent.col, adjacent.row));
        if (neighbor?.kind === "star") {
          add("adjacent-stars", `Star at ${cellLabel(col, row)} touches another star at ${cellLabel(adjacent.col, adjacent.row)}.`);
        } else if (neighbor?.kind === "orthogonalCross") {
          add(
            "star-orthogonal-cross",
            `Star at ${cellLabel(col, row)} collides with orthogonal cross at ${cellLabel(adjacent.col, adjacent.row)}.`
          );
        }
        if (state2.edgeInsets.has(edgeKey(col, row, side)) || state2.edgeInsets.has(edgeKey(adjacent.col, adjacent.row, oppositeSide(side)))) {
          add("star-edge-inset", `Star at ${cellLabel(col, row)} shares its ${side} side with a diagonal taco.`);
        }
      }
    }
    for (const [key, tile] of state2.cells) {
      if (tile.kind !== "orthogonalCross") {
        continue;
      }
      const { col, row } = parseCellKey(key);
      for (const side of ["e", "s"]) {
        const adjacent = neighborForSide(col, row, side);
        const neighbor = state2.cells.get(cellKey(adjacent.col, adjacent.row));
        if (neighbor?.kind === "orthogonalCross") {
          add(
            "adjacent-orthogonal-crosses",
            `Orthogonal cross at ${cellLabel(col, row)} collides with orthogonal cross at ${cellLabel(adjacent.col, adjacent.row)}.`
          );
        }
      }
    }
    const canonicalEdges = /* @__PURE__ */ new Map();
    for (const key of state2.edgeInsets.keys()) {
      const edge = parseEdgeKey(key);
      const canonical = canonicalEdgeKey(edge.col, edge.row, edge.side);
      const previous = canonicalEdges.get(canonical);
      if (previous) {
        add("duplicate-edge-inset", `Two diagonal tacos occupy the same edge: ${previous} and ${key}.`);
      } else {
        canonicalEdges.set(canonical, key);
      }
      const adjacent = cellsForEdge(edge.col, edge.row, edge.side);
      for (const cell of adjacent) {
        const tile = state2.cells.get(cellKey(cell.col, cell.row));
        if (tile?.kind === "star") {
          add("edge-inset-star", `Diagonal taco ${key} collides with star at ${cellLabel(cell.col, cell.row)}.`);
        } else if (tile?.kind === "orthogonalCross") {
          add("edge-inset-orthogonal-cross", `Diagonal taco ${key} does not fit orthogonal cross at ${cellLabel(cell.col, cell.row)}.`);
        }
      }
    }
    for (const key of state2.cornerInsets.keys()) {
      const corner = parseCornerKey(key);
      const tile = state2.cells.get(cellKey(corner.col, corner.row));
      if (tile?.kind === "star" || tile?.kind === "diagonalCross") {
        add(
          "corner-inset-tile-collision",
          `Orthogonal taco ${key} collides with ${tile.kind} at ${cellLabel(corner.col, corner.row)}.`
        );
      }
    }
    return conflicts;
  }

  // src/model.ts
  function paintKey(state2, point, col, row) {
    if (state2.tool === "erase") {
      return `erase:${elementKeyAtPoint(state2, point, col, row)}`;
    }
    if (state2.tool === "paint" && !state2.paintShape) {
      return `color:${elementKeyAtPoint(state2, point, col, row)}`;
    }
    if (state2.tool !== "paint" || !state2.paintShape) {
      return `${state2.tool}:${col},${row}`;
    }
    if (state2.paintShape !== "inset") {
      return `${state2.paintShape}:${col},${row}`;
    }
    const target = nearestTacoTarget(state2, point, col, row);
    return `${target.type}:${target.key}`;
  }
  function placeCross(state2, col, row, kind, colorId) {
    state2.cells.set(cellKey(col, row), { kind, colorId });
    fixCrossConflicts(state2, col, row, kind);
    placeCompatibleTacosForCross(state2, col, row, kind, colorId);
  }
  function fixCrossConflicts(state2, col, row, kind) {
    if (kind === "diagonalCross") {
      removeCornerInsets(state2, col, row);
      return;
    }
    for (const side of SIDES) {
      removeEdgeInset(state2, col, row, side);
    }
    for (const neighbor of neighbors(col, row)) {
      const tile = state2.cells.get(cellKey(neighbor.col, neighbor.row));
      if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
        replaceWithDiagonalCross(state2, neighbor.col, neighbor.row);
      }
    }
  }
  function placeCompatibleTacosForCross(state2, col, row, kind, colorId) {
    if (kind === "diagonalCross") {
      for (const side of SIDES) {
        setEdgeInsetIfNoNewConflict(state2, col, row, side, colorId);
      }
      return;
    }
    for (const corner of CORNERS) {
      setCornerInsetIfNoNewConflict(state2, col, row, corner, colorId);
    }
  }
  function setEdgeInsetIfNoNewConflict(state2, col, row, side, colorId) {
    const key = canonicalEdgeKey(col, row, side);
    if (state2.edgeInsets.has(key)) {
      return;
    }
    const before = conflictSignatureSet(state2);
    state2.edgeInsets.set(key, { colorId });
    if (hasNewConflicts(state2, before)) {
      state2.edgeInsets.delete(key);
    }
  }
  function setCornerInsetIfNoNewConflict(state2, col, row, corner, colorId) {
    const key = cornerKey(col, row, corner);
    if (state2.cornerInsets.has(key)) {
      return;
    }
    const before = conflictSignatureSet(state2);
    state2.cornerInsets.set(key, { colorId });
    if (hasNewConflicts(state2, before)) {
      state2.cornerInsets.delete(key);
    }
  }
  function conflictSignatureSet(state2) {
    return new Set(analyzeLayoutConflicts(state2).map((conflict) => `${conflict.code}:${conflict.message}`));
  }
  function hasNewConflicts(state2, before) {
    return analyzeLayoutConflicts(state2).some((conflict) => !before.has(`${conflict.code}:${conflict.message}`));
  }
  function replaceWithDiagonalCross(state2, col, row) {
    const key = cellKey(col, row);
    const tile = state2.cells.get(key);
    if (!tile) {
      return;
    }
    state2.cells.set(key, { kind: "diagonalCross", colorId: tile.colorId });
    removeCornerInsets(state2, col, row);
    placeCompatibleTacosForCross(state2, col, row, "diagonalCross", tile.colorId);
  }
  function eraseAt(state2, point, col, row) {
    const taco = nearestTacoHit(state2, point, col, row);
    if (taco) {
      deleteTaco(state2, taco);
      return;
    }
    const key = cellKey(col, row);
    const tile = state2.cells.get(key);
    state2.cells.delete(key);
    if (tile?.kind === "diagonalCross") {
      pruneEdgeInsetsWithoutAdjacentDiagonalCross(state2);
    } else if (tile?.kind === "orthogonalCross") {
      removeCornerInsets(state2, col, row);
    }
  }
  function colorOnlyAt(state2, point, col, row, colorId) {
    const taco = nearestTacoHit(state2, point, col, row);
    if (taco) {
      colorTaco(state2, taco, colorId);
      return;
    }
    const key = cellKey(col, row);
    const tile = state2.cells.get(key);
    if (tile) {
      state2.cells.set(key, { ...tile, colorId });
    }
  }
  function colorIdAt(state2, point, col, row) {
    const taco = nearestTacoHit(state2, point, col, row);
    if (taco?.type === "edge") {
      return state2.edgeInsets.get(taco.key)?.colorId;
    }
    if (taco?.type === "corner") {
      return state2.cornerInsets.get(taco.key)?.colorId;
    }
    return state2.cells.get(cellKey(col, row))?.colorId;
  }
  function elementKeyAtPoint(state2, point, col, row) {
    const taco = nearestTacoHit(state2, point, col, row);
    if (taco) {
      return `${taco.type}:${taco.key}`;
    }
    return `tile:${col},${row}`;
  }
  function nearestTacoHit(state2, point, col, row) {
    const candidates = [];
    for (const side of SIDES) {
      const key = canonicalEdgeKey(col, row, side);
      if (state2.edgeInsets.has(key)) {
        candidates.push(edgeEraseCandidate(state2, point, key, col, row, side));
      }
      const adjacent = neighborForSide(col, row, side);
      const adjacentSide = oppositeSide(side);
      const adjacentKey = canonicalEdgeKey(adjacent.col, adjacent.row, adjacentSide);
      if (state2.edgeInsets.has(adjacentKey)) {
        candidates.push(edgeEraseCandidate(state2, point, adjacentKey, adjacent.col, adjacent.row, adjacentSide));
      }
    }
    for (const corner of CORNERS) {
      const key = cornerKey(col, row, corner);
      if (state2.cornerInsets.has(key)) {
        candidates.push(cornerEraseCandidate(state2, point, key, col, row, corner));
      }
    }
    return candidates.filter((candidate) => candidate.hit).sort((a, b) => a.distance - b.distance)[0];
  }
  function deleteTaco(state2, taco) {
    if (taco.type === "edge") {
      state2.edgeInsets.delete(taco.key);
    } else {
      state2.cornerInsets.delete(taco.key);
    }
  }
  function colorTaco(state2, taco, colorId) {
    if (taco.type === "edge") {
      state2.edgeInsets.set(taco.key, { colorId });
    } else {
      state2.cornerInsets.set(taco.key, { colorId });
    }
  }
  function pruneEdgeInsetsWithoutAdjacentDiagonalCross(state2) {
    for (const key of Array.from(state2.edgeInsets.keys())) {
      const edge = parseEdgeKey(key);
      const hasAdjacentDiagonalCross = cellsForEdge(edge.col, edge.row, edge.side).some(
        (cell) => state2.cells.get(cellKey(cell.col, cell.row))?.kind === "diagonalCross"
      );
      if (!hasAdjacentDiagonalCross) {
        state2.edgeInsets.delete(key);
      }
    }
  }
  function edgeEraseCandidate(state2, point, key, col, row, side) {
    const midpoint2 = edgeMidpoint(state2, col, row, side);
    const candidateDistance = distance(point, midpoint2);
    return {
      key,
      type: "edge",
      distance: candidateDistance,
      hit: candidateDistance <= tacoHalfDiagonalPx(state2) + 2
    };
  }
  function cornerEraseCandidate(state2, point, key, col, row, corner) {
    const center = cornerInsetCenter(state2, col, row, corner);
    const dx = Math.abs(point.x - center.x);
    const dy = Math.abs(point.y - center.y);
    const halfSize = cornerTacoSidePx(state2) / 2;
    const margin = 3;
    return {
      key,
      type: "corner",
      distance: distance(point, center),
      hit: dx <= halfSize + margin && dy <= halfSize + margin
    };
  }
  function placeStar(state2, col, row, colorId) {
    state2.cells.set(cellKey(col, row), { kind: "star", colorId });
    for (const neighbor of neighbors(col, row)) {
      const tile = state2.cells.get(cellKey(neighbor.col, neighbor.row));
      if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
        replaceWithDiagonalCross(state2, neighbor.col, neighbor.row);
      }
    }
    for (const side of SIDES) {
      removeEdgeInset(state2, col, row, side);
    }
    removeCornerInsets(state2, col, row);
  }
  function removeCornerInsets(state2, col, row) {
    state2.cornerInsets.delete(cornerKey(col, row, "nw"));
    state2.cornerInsets.delete(cornerKey(col, row, "ne"));
    state2.cornerInsets.delete(cornerKey(col, row, "se"));
    state2.cornerInsets.delete(cornerKey(col, row, "sw"));
  }
  function removeEdgeInset(state2, col, row, side) {
    state2.edgeInsets.delete(canonicalEdgeKey(col, row, side));
  }
  function placeInset(state2, point, col, row, colorId) {
    const target = nearestTacoTarget(state2, point, col, row);
    if (target.type === "edge") {
      for (const adjacent of cellsForEdge(target.col, target.row, target.side)) {
        replaceTileWithDiagonalCrossIfNeeded(state2, adjacent.col, adjacent.row);
      }
      state2.edgeInsets.set(target.key, { colorId });
      return;
    }
    const tile = state2.cells.get(cellKey(target.col, target.row));
    if (tile?.kind !== "orthogonalCross") {
      return;
    }
    state2.cornerInsets.set(target.key, { colorId });
  }
  function replaceTileWithDiagonalCrossIfNeeded(state2, col, row) {
    const tile = state2.cells.get(cellKey(col, row));
    if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
      replaceWithDiagonalCross(state2, col, row);
    }
  }

  // src/color.ts
  function paletteColor(colorId) {
    for (const manufacturer of MANUFACTURERS) {
      const color = manufacturer.colors.find((candidate) => candidate.id === colorId);
      if (color) {
        return color;
      }
    }
    return MANUFACTURERS[0].colors[0];
  }
  function groutColorValue(colorId) {
    return groutColor(colorId).value;
  }
  function groutColor(colorId) {
    return GROUT_COLORS.find((candidate) => candidate.id === colorId) ?? GROUT_COLORS[0];
  }
  function darken(hex, amount) {
    const normalized = hex.replace("#", "");
    const value = Number.parseInt(normalized, 16);
    const r = Math.max(0, (value >> 16 & 255) - amount);
    const g = Math.max(0, (value >> 8 & 255) - amount);
    const b = Math.max(0, (value & 255) - amount);
    return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  }

  // src/material.ts
  function fillMaterialPath(ctx2, colorId, seed, bounds) {
    const color = paletteColor(colorId);
    const random = seededRandom(seed);
    const variation = color.shadeVariation * 5;
    const base = adjustLightness(color.value, (random() - 0.5) * variation);
    const screenBounds = transformedBounds(ctx2, bounds);
    ctx2.fillStyle = base;
    ctx2.fill();
    ctx2.save();
    ctx2.clip();
    drawClouding(ctx2, color, random, bounds);
    drawGrain(ctx2, color, random, bounds);
    drawStripes(ctx2, color, random, bounds);
    drawChips(ctx2, color, random, bounds);
    drawSheen(ctx2, color, screenBounds);
    ctx2.restore();
  }
  function drawClouding(ctx2, color, random, bounds) {
    if (color.clouding <= 0.01) {
      return;
    }
    const count = Math.max(2, Math.round(2 + color.clouding * 8));
    for (let i = 0; i < count; i += 1) {
      const x = bounds.x + random() * bounds.width;
      const y = bounds.y + random() * bounds.height;
      const radius = Math.max(bounds.width, bounds.height) * (0.15 + random() * 0.35);
      const gradient = ctx2.createRadialGradient(x, y, 0, x, y, radius);
      const lighten = random() > 0.5;
      const cloudColor = lighten ? "#ffffff" : darken(color.value, 42);
      gradient.addColorStop(0, hexToRgba(cloudColor, 0.05 + color.clouding * 0.08));
      gradient.addColorStop(1, hexToRgba(cloudColor, 0));
      ctx2.fillStyle = gradient;
      ctx2.fillRect(bounds.x - radius, bounds.y - radius, bounds.width + radius * 2, bounds.height + radius * 2);
    }
  }
  function drawGrain(ctx2, color, random, bounds) {
    if (color.grain <= 0.01) {
      return;
    }
    const area = bounds.width * bounds.height;
    const count = Math.min(180, Math.round(area / 90 * color.grain));
    ctx2.fillStyle = hexToRgba(darken(color.value, 55), 0.08 + color.grain * 0.18);
    for (let i = 0; i < count; i += 1) {
      const size = 0.6 + random() * (1 + color.grain * 2);
      ctx2.fillRect(bounds.x + random() * bounds.width, bounds.y + random() * bounds.height, size, size);
    }
  }
  function drawStripes(ctx2, color, random, bounds) {
    if (color.texture !== "saltillo_terracotta" && color.texture !== "rustic_cotto" && color.texture !== "natural_terracotta") {
      return;
    }
    ctx2.save();
    ctx2.globalAlpha = 0.07;
    ctx2.strokeStyle = darken(color.value, 48);
    ctx2.lineWidth = 2 + color.clouding * 3;
    ctx2.translate(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    ctx2.rotate(-0.45 + random() * 0.25);
    const span = bounds.width + bounds.height;
    for (let y = -span; y <= span; y += 10 + random() * 9) {
      ctx2.beginPath();
      ctx2.moveTo(-span, y);
      ctx2.lineTo(span, y + random() * 10 - 5);
      ctx2.stroke();
    }
    ctx2.restore();
  }
  function drawChips(ctx2, color, random, bounds) {
    if (color.chipRate <= 0.01) {
      return;
    }
    const count = Math.round(color.chipRate * 18);
    ctx2.fillStyle = hexToRgba(darken(color.value, 70), 0.18);
    for (let i = 0; i < count; i += 1) {
      const edge = Math.floor(random() * 4);
      const x = edge === 1 ? bounds.x + bounds.width : edge === 3 ? bounds.x : bounds.x + random() * bounds.width;
      const y = edge === 0 ? bounds.y : edge === 2 ? bounds.y + bounds.height : bounds.y + random() * bounds.height;
      const radius = 1.5 + random() * (3 + color.chipRate * 8);
      ctx2.beginPath();
      ctx2.arc(x, y, radius, 0, Math.PI * 2);
      ctx2.fill();
    }
  }
  function drawSheen(ctx2, color, bounds) {
    if (color.sheen <= 0.01) {
      return;
    }
    ctx2.save();
    ctx2.setTransform(1, 0, 0, 1, 0, 0);
    const gradient = ctx2.createLinearGradient(bounds.x, bounds.y, bounds.x + bounds.width, bounds.y + bounds.height);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.34, `rgba(255,255,255,${0.04 + color.sheen * 0.12})`);
    gradient.addColorStop(0.47, `rgba(255,255,255,${0.13 + color.sheen * 0.28})`);
    gradient.addColorStop(0.6, `rgba(255,255,255,${0.03 + color.sheen * 0.08})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx2.fillStyle = gradient;
    ctx2.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx2.restore();
  }
  function transformedBounds(ctx2, bounds) {
    const transform = ctx2.getTransform();
    const points = [
      transformPoint(transform, bounds.x, bounds.y),
      transformPoint(transform, bounds.x + bounds.width, bounds.y),
      transformPoint(transform, bounds.x + bounds.width, bounds.y + bounds.height),
      transformPoint(transform, bounds.x, bounds.y + bounds.height)
    ];
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  function transformPoint(transform, x, y) {
    return {
      x: transform.a * x + transform.c * y + transform.e,
      y: transform.b * x + transform.d * y + transform.f
    };
  }
  function seededRandom(seed) {
    let value = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
      value ^= seed.charCodeAt(i);
      value = Math.imul(value, 16777619);
    }
    return () => {
      value += 1831565813;
      let next = value;
      next = Math.imul(next ^ next >>> 15, next | 1);
      next ^= next + Math.imul(next ^ next >>> 7, next | 61);
      return ((next ^ next >>> 14) >>> 0) / 4294967296;
    };
  }
  function adjustLightness(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(clampColor(r + amount), clampColor(g + amount), clampColor(b + amount));
  }
  function hexToRgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  function hexToRgb(hex) {
    const normalized = hex.replace("#", "");
    const value = Number.parseInt(normalized, 16);
    return {
      r: value >> 16 & 255,
      g: value >> 8 & 255,
      b: value & 255
    };
  }
  function rgbToHex(r, g, b) {
    return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  }
  function clampColor(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
  }

  // src/render.ts
  function draw(state2, ctx2, canvas2) {
    canvas2.dataset.renderReady = "false";
    const room = roomPx(state2);
    ctx2.clearRect(0, 0, room.width, room.height);
    ctx2.fillStyle = "#050505";
    ctx2.fillRect(0, 0, room.width, room.height);
    if (!state2.showGrid) {
      drawPlaceholderGrid(state2, ctx2);
    }
    drawGroutUnderlays(state2, ctx2);
    drawPlacedTiles(state2, ctx2);
    drawInsets(state2, ctx2);
    if (state2.showGrid) {
      drawPlaceholderGrid(state2, ctx2);
    }
    drawRoomOutline(state2, ctx2);
  }
  function markRenderReady(canvas2, frame, currentFrame) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (frame === currentFrame()) {
          canvas2.dataset.renderReady = "true";
        }
      });
    });
  }
  function renderConflictReport(state2, layoutErrors2, lastConflictSignature2) {
    const conflicts = analyzeLayoutConflicts(state2);
    const signature = conflicts.map((conflict) => `${conflict.code}:${conflict.message}`).join("|");
    if (conflicts.length === 0) {
      layoutErrors2.classList.remove("is-visible");
      layoutErrors2.textContent = "";
      return "";
    }
    layoutErrors2.classList.add("is-visible");
    layoutErrors2.innerHTML = [
      "!!! TILE LAYOUT CONFLICTS DETECTED !!!",
      "<ul>",
      ...conflicts.slice(0, 6).map((conflict) => `<li>${escapeHtml(conflict.message)}</li>`),
      conflicts.length > 6 ? `<li>${conflicts.length - 6} more conflict(s)</li>` : "",
      "</ul>"
    ].join("");
    if (signature !== lastConflictSignature2) {
      console.error("!!! TILE LAYOUT CONFLICTS DETECTED !!!", conflicts);
    }
    return signature;
  }
  function drawGroutUnderlays(state2, ctx2) {
    ctx2.save();
    ctx2.fillStyle = groutColorValue(state2.groutColorId);
    drawCellGroutUnderlays(state2, ctx2);
    drawInsetGroutUnderlays(state2, ctx2);
    ctx2.restore();
  }
  function drawCellGroutUnderlays(state2, ctx2) {
    for (const [key, tile] of state2.cells) {
      const { col, row } = parseCellKey(key);
      if (!visibleCell(state2, col, row)) {
        continue;
      }
      if (tile.kind === "star") {
        drawStarSilhouette(state2, ctx2, col, row, tilePx(state2), idealTacoHalfDiagonalPx(state2));
      } else {
        drawCrossGroutFootprint(state2, ctx2, col, row, tile.kind);
      }
    }
  }
  function drawInsetGroutUnderlays(state2, ctx2) {
    for (const [key] of state2.edgeInsets) {
      const edge = parseEdgeKey(key);
      drawEdgeInsetSilhouette(state2, ctx2, edge.col, edge.row, edge.side, insetGroutFootprintSize(state2));
    }
    for (const [key] of state2.cornerInsets) {
      const corner = parseCornerKey(key);
      drawCornerInsetSilhouette(state2, ctx2, corner.col, corner.row, corner.corner, insetGroutFootprintSize(state2));
    }
  }
  function drawPlacedTiles(state2, ctx2) {
    drawTilesByKind(state2, ctx2, "cross");
    drawTilesByKind(state2, ctx2, "star");
  }
  function drawTilesByKind(state2, ctx2, pass) {
    for (const [key, tile] of state2.cells) {
      const { col, row } = parseCellKey(key);
      if (!visibleCell(state2, col, row)) {
        continue;
      }
      if (tile.kind === "orthogonalCross" || tile.kind === "diagonalCross") {
        if (pass !== "cross") {
          continue;
        }
        drawCross(state2, ctx2, col, row, tile.kind, tile.colorId);
      } else {
        if (pass !== "star") {
          continue;
        }
        drawStar(state2, ctx2, col, row, tile.colorId);
      }
    }
  }
  function drawCross(state2, ctx2, col, row, kind, colorId) {
    const polygon = kind === "diagonalCross" ? insetPolygon(diagonalBasePolygon(tilePx(state2), idealTacoHalfDiagonalPx(state2), idealTacoSidePx(state2)), groutInsetPx(state2)) : insetPolygon(orthogonalBasePolygon(tilePx(state2), idealTacoHalfDiagonalPx(state2), idealTacoSidePx(state2)), groutInsetPx(state2));
    const screenPolygon = cellPolygonToScreen(state2, col, row, polygon);
    drawMaterialPolygon(ctx2, screenPolygon, colorId, `cross:${kind}:${col}:${row}:${colorId}`);
  }
  function drawCrossGroutFootprint(state2, ctx2, col, row, kind) {
    const zeroPolygon = kind === "diagonalCross" ? diagonalBasePolygon(tilePx(state2), idealTacoHalfDiagonalPx(state2), idealTacoSidePx(state2)) : orthogonalBasePolygon(tilePx(state2), idealTacoHalfDiagonalPx(state2), idealTacoSidePx(state2));
    const polygon = outsetPolygon(zeroPolygon, groutInsetPx(state2));
    fillScreenPolygon(ctx2, cellPolygonToScreen(state2, col, row, polygon));
  }
  function insetGroutFootprintSize(state2) {
    return idealTacoSidePx(state2) + groutPx(state2);
  }
  function drawStar(state2, ctx2, col, row, colorId) {
    const polygon = insetPolygon(starPolygon(tilePx(state2), idealTacoHalfDiagonalPx(state2)), groutInsetPx(state2));
    const screenPolygon = cellPolygonToScreen(state2, col, row, polygon);
    drawMaterialPolygon(ctx2, screenPolygon, colorId, `star:${col}:${row}:${colorId}`);
  }
  function drawStarSilhouette(state2, ctx2, col, row, size, pointHalfDiagonal) {
    fillScreenPolygon(ctx2, cellPolygonToScreen(state2, col, row, outsetPolygon(starPolygon(size, pointHalfDiagonal), groutInsetPx(state2))));
  }
  function groutInsetPx(state2) {
    return groutPx(state2) / 2;
  }
  function orthogonalBasePolygon(size, tacoHalfDiagonal, tacoSide) {
    const half = size / 2;
    const point = half + tacoHalfDiagonal;
    const cut = half - tacoSide;
    return [
      [0, -point],
      [cut, -half],
      [cut, -cut],
      [half, -cut],
      [point, 0],
      [half, cut],
      [cut, cut],
      [cut, half],
      [0, point],
      [-cut, half],
      [-cut, cut],
      [-half, cut],
      [-point, 0],
      [-half, -cut],
      [-cut, -cut],
      [-cut, -half]
    ];
  }
  function diagonalBasePolygon(size, tacoHalfDiagonal, tacoSide) {
    const half = size / 2;
    const notchDepth = tacoSide;
    return [
      [-half, -half],
      [-tacoHalfDiagonal, -half],
      [0, -notchDepth],
      [tacoHalfDiagonal, -half],
      [half, -half],
      [half, -tacoHalfDiagonal],
      [notchDepth, 0],
      [half, tacoHalfDiagonal],
      [half, half],
      [tacoHalfDiagonal, half],
      [0, notchDepth],
      [-tacoHalfDiagonal, half],
      [-half, half],
      [-half, tacoHalfDiagonal],
      [-notchDepth, 0],
      [-half, -tacoHalfDiagonal]
    ];
  }
  function starPolygon(size, pointHalfDiagonal) {
    const body = size / 2;
    const point = body + pointHalfDiagonal;
    return [
      [-body, -body],
      [-pointHalfDiagonal, -body],
      [0, -point],
      [pointHalfDiagonal, -body],
      [body, -body],
      [body, -pointHalfDiagonal],
      [point, 0],
      [body, pointHalfDiagonal],
      [body, body],
      [pointHalfDiagonal, body],
      [0, point],
      [-pointHalfDiagonal, body],
      [-body, body],
      [-body, pointHalfDiagonal],
      [-point, 0],
      [-body, -pointHalfDiagonal]
    ];
  }
  function squarePolygon(size) {
    const half = size / 2;
    return [
      [-half, -half],
      [half, -half],
      [half, half],
      [-half, half]
    ];
  }
  function edgeMidpointLocal(state2, side) {
    const halfTile = tilePx(state2) / 2;
    if (side === "n") {
      return [0, -halfTile];
    }
    if (side === "e") {
      return [halfTile, 0];
    }
    if (side === "s") {
      return [0, halfTile];
    }
    return [-halfTile, 0];
  }
  function edgeInsetPolygonLocal(state2, side, size) {
    const center = edgeMidpointLocal(state2, side);
    const halfDiagonal = size / Math.SQRT2;
    return [
      [center[0], center[1] - halfDiagonal],
      [center[0] + halfDiagonal, center[1]],
      [center[0], center[1] + halfDiagonal],
      [center[0] - halfDiagonal, center[1]]
    ];
  }
  function cornerInsetCenterLocal(state2, corner) {
    const halfTile = tilePx(state2) / 2;
    const centerOffset = groutPx(state2) / 2 + cornerTacoSidePx(state2) / 2;
    const x = corner === "nw" || corner === "sw" ? -halfTile + centerOffset : halfTile - centerOffset;
    const y = corner === "nw" || corner === "ne" ? -halfTile + centerOffset : halfTile - centerOffset;
    return [x, y];
  }
  function translatePolygon(points, offset) {
    return points.map((point) => addPoint(point, offset));
  }
  function cellPolygonToScreen(state2, col, row, points) {
    return points.map(([x, y]) => {
      const point = cellLocalToScreen(state2, col, row, x, y);
      return [point.x, point.y];
    });
  }
  function drawMaterialPolygon(ctx2, points, colorId, seed) {
    tracePolygonPath(ctx2, points);
    fillMaterialPath(ctx2, colorId, seed, polygonBounds(points));
  }
  function fillScreenPolygon(ctx2, points) {
    tracePolygonPath(ctx2, points);
    ctx2.fill();
  }
  function insetPolygon(points, distance2) {
    const center = polygonCentroid(points);
    const shiftedLines = points.map((point, index) => {
      const next = points[(index + 1) % points.length];
      const dx = next[0] - point[0];
      const dy = next[1] - point[1];
      const length = Math.hypot(dx, dy) || 1;
      const normalA = [-dy / length, dx / length];
      const normalB = [dy / length, -dx / length];
      const midpoint2 = [(point[0] + next[0]) / 2, (point[1] + next[1]) / 2];
      const normal = distanceBetween(addPoint(midpoint2, normalA), center) < distanceBetween(addPoint(midpoint2, normalB), center) ? normalA : normalB;
      const offset = [normal[0] * distance2, normal[1] * distance2];
      return {
        start: addPoint(point, offset),
        end: addPoint(next, offset)
      };
    });
    return points.map((point, index) => {
      const previous = shiftedLines[(index - 1 + shiftedLines.length) % shiftedLines.length];
      const current = shiftedLines[index];
      return lineIntersection(previous.start, previous.end, current.start, current.end) ?? point;
    });
  }
  function outsetPolygon(points, distance2) {
    return insetPolygon(points, -distance2);
  }
  function polygonCentroid(points) {
    const total = points.reduce((sum, point) => [sum[0] + point[0], sum[1] + point[1]], [0, 0]);
    return [total[0] / points.length, total[1] / points.length];
  }
  function addPoint(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
  }
  function distanceBetween(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }
  function lineIntersection(a1, a2, b1, b2) {
    const dax = a2[0] - a1[0];
    const day = a2[1] - a1[1];
    const dbx = b2[0] - b1[0];
    const dby = b2[1] - b1[1];
    const denominator = dax * dby - day * dbx;
    if (Math.abs(denominator) < 1e-6) {
      return void 0;
    }
    const t = ((b1[0] - a1[0]) * dby - (b1[1] - a1[1]) * dbx) / denominator;
    return [a1[0] + t * dax, a1[1] + t * day];
  }
  function tracePolygonPath(ctx2, points) {
    const [first, ...rest] = points;
    ctx2.beginPath();
    ctx2.moveTo(first[0], first[1]);
    for (const point of rest) {
      ctx2.lineTo(point[0], point[1]);
    }
    ctx2.closePath();
  }
  function polygonBounds(points) {
    const xs = points.map((point) => point[0]);
    const ys = points.map((point) => point[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  function drawInsets(state2, ctx2) {
    for (const [key, inset] of state2.edgeInsets) {
      const edge = parseEdgeKey(key);
      drawEdgeInset(state2, ctx2, edge.col, edge.row, edge.side, inset.colorId);
    }
    for (const [key, inset] of state2.cornerInsets) {
      const corner = parseCornerKey(key);
      drawCornerInset(state2, ctx2, corner.col, corner.row, corner.corner, inset.colorId);
    }
  }
  function drawEdgeInset(state2, ctx2, col, row, side, colorId) {
    const size = tacoSidePx(state2);
    const polygon = edgeInsetPolygonLocal(state2, side, size);
    const screenPolygon = cellPolygonToScreen(state2, col, row, polygon);
    drawMaterialPolygon(ctx2, screenPolygon, colorId, `edge:${col}:${row}:${side}:${colorId}`);
  }
  function drawEdgeInsetSilhouette(state2, ctx2, col, row, side, size) {
    fillScreenPolygon(ctx2, cellPolygonToScreen(state2, col, row, edgeInsetPolygonLocal(state2, side, size)));
  }
  function drawCornerInset(state2, ctx2, col, row, corner, colorId) {
    const size = cornerTacoSidePx(state2);
    const center = cornerInsetCenterLocal(state2, corner);
    const polygon = translatePolygon(squarePolygon(size), center);
    const screenPolygon = cellPolygonToScreen(state2, col, row, polygon);
    drawMaterialPolygon(ctx2, screenPolygon, colorId, `corner:${col}:${row}:${corner}:${colorId}`);
  }
  function drawCornerInsetSilhouette(state2, ctx2, col, row, corner, size) {
    const center = cornerInsetCenterLocal(state2, corner);
    fillScreenPolygon(ctx2, cellPolygonToScreen(state2, col, row, translatePolygon(squarePolygon(size), center)));
  }
  function drawPlaceholderGrid(state2, ctx2) {
    const tile = tilePx(state2);
    ctx2.save();
    ctx2.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx2.lineWidth = 1;
    ctx2.setLineDash([2, 5]);
    const window2 = gridLocalRoomWindow(state2);
    const startX = Math.floor(window2.minX / tile - 0.5) - 1;
    const endX = Math.ceil(window2.maxX / tile - 0.5) + 1;
    const startY = Math.floor(window2.minY / tile - 0.5) - 1;
    const endY = Math.ceil(window2.maxY / tile - 0.5) + 1;
    for (let i = startX; i <= endX; i += 1) {
      const x = (i + 0.5) * tile;
      const a = gridLocalToScreen(state2, { x, y: window2.minY - tile });
      const b = gridLocalToScreen(state2, { x, y: window2.maxY + tile });
      ctx2.beginPath();
      ctx2.moveTo(a.x, a.y);
      ctx2.lineTo(b.x, b.y);
      ctx2.stroke();
    }
    for (let i = startY; i <= endY; i += 1) {
      const y = (i + 0.5) * tile;
      const a = gridLocalToScreen(state2, { x: window2.minX - tile, y });
      const b = gridLocalToScreen(state2, { x: window2.maxX + tile, y });
      ctx2.beginPath();
      ctx2.moveTo(a.x, a.y);
      ctx2.lineTo(b.x, b.y);
      ctx2.stroke();
    }
    ctx2.restore();
  }
  function drawRoomOutline(state2, ctx2) {
    const room = roomPx(state2);
    ctx2.save();
    ctx2.strokeStyle = "#1c1c1c";
    ctx2.lineWidth = 4;
    ctx2.setLineDash([]);
    ctx2.strokeRect(2, 2, room.width - 4, room.height - 4);
    ctx2.restore();
  }
  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (char) => {
      if (char === "&") return "&amp;";
      if (char === "<") return "&lt;";
      if (char === ">") return "&gt;";
      if (char === '"') return "&quot;";
      return "&#039;";
    });
  }

  // src/state.ts
  var pendingSnapshot = "";
  var lastWrittenSnapshot = "";
  var isWritingUrl = false;
  var debounceTimer;
  async function loadState(workspace2) {
    const params = new URLSearchParams(window.location.search);
    const next = cloneDefaultState();
    const encoded = params.get("s");
    if (encoded) {
      try {
        const compact = JSON.parse(await decodeStateParam(encoded));
        console.log("Expanded URL tile state", compact);
        applyCompactState(compact, next);
      } catch (error) {
        console.warn("Unable to decode tile state URL; using defaults.", error);
      }
    }
    next.zoom = initialZoomForRoom(workspace2, next.roomWidthInches, next.roomHeightInches);
    lastWrittenSnapshot = JSON.stringify(compactState(next));
    return next;
  }
  function cloneDefaultState() {
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
      cells: /* @__PURE__ */ new Map(),
      edgeInsets: /* @__PURE__ */ new Map(),
      cornerInsets: /* @__PURE__ */ new Map()
    };
  }
  function updateUrl(state2) {
    pendingSnapshot = JSON.stringify(compactState(state2));
    if (debounceTimer !== void 0) {
      window.clearTimeout(debounceTimer);
    }
    debounceTimer = window.setTimeout(() => {
      debounceTimer = void 0;
      void processUrlWriteQueue();
    }, 10);
  }
  function applyCompactState(compact, next) {
    if (compact.v !== 2) {
      throw new Error(`Unsupported compressed state version ${String(compact.v)}.`);
    }
    next.mode = compact.m === "d" ? "diagonal" : "straight";
    next.showGrid = compact.q === 1;
    next.roomWidthInches = validRoomWidth(String(compact.rw)) ?? next.roomWidthInches;
    next.roomHeightInches = validRoomHeight(String(compact.rh)) ?? next.roomHeightInches;
    next.tileInches = validTileInches(String(compact.ts)) ?? next.tileInches;
    next.offsetXInches = validHalfInch(String(compact.ox)) ?? next.offsetXInches;
    next.offsetYInches = validHalfInch(String(compact.oy)) ?? next.offsetYInches;
    next.groutColorId = validGroutColor(compact.gc) ?? next.groutColorId;
    next.groutJointSixteenths = validGroutJoint(String(compact.gj)) ?? next.groutJointSixteenths;
    next.tool = toolFromCode(compact.tl) ?? next.tool;
    next.paintShape = next.tool === "paint" ? paintShapeFromCode(compact.ps) : void 0;
    next.manufacturerId = validManufacturer(compact.mf) ?? next.manufacturerId;
    next.colorId = validColor(next.manufacturerId, compact.c) ?? next.colorId;
    const colors = compact.cs ?? [];
    next.cells.clear();
    next.edgeInsets.clear();
    next.cornerInsets.clear();
    for (const record of compact.a ?? []) {
      const [col, row, kindCode, colorIndex] = record;
      const kind = tileKindFromCode(kindCode);
      const colorId = colors[colorIndex];
      if (Number.isInteger(col) && Number.isInteger(row) && kind && colorId) {
        next.cells.set(cellKey(col, row), { kind, colorId });
      }
    }
    for (const record of compact.e ?? []) {
      const [col, row, side, colorIndex] = record;
      const colorId = colors[colorIndex];
      if (Number.isInteger(col) && Number.isInteger(row) && validSide(side) && colorId) {
        next.edgeInsets.set(canonicalEdgeKey(col, row, side), { colorId });
      }
    }
    for (const record of compact.k ?? []) {
      const [col, row, corner, colorIndex] = record;
      const colorId = colors[colorIndex];
      if (Number.isInteger(col) && Number.isInteger(row) && validCorner(corner) && colorId) {
        next.cornerInsets.set(cornerKey(col, row, corner), { colorId });
      }
    }
  }
  function compactState(state2) {
    const colorIndexes = /* @__PURE__ */ new Map();
    const colors = [];
    const colorIndex = (colorId) => {
      const existing = colorIndexes.get(colorId);
      if (existing !== void 0) {
        return existing;
      }
      const next = colors.length;
      colors.push(colorId);
      colorIndexes.set(colorId, next);
      return next;
    };
    const compact = {
      v: 2,
      m: state2.mode === "diagonal" ? "d" : "s",
      rw: state2.roomWidthInches,
      rh: state2.roomHeightInches,
      ts: state2.tileInches,
      ox: state2.offsetXInches,
      oy: state2.offsetYInches,
      gc: state2.groutColorId,
      gj: state2.groutJointSixteenths,
      tl: toolCode(state2.tool),
      mf: state2.manufacturerId,
      c: state2.colorId
    };
    if (state2.showGrid) {
      compact.q = 1;
    }
    if (state2.tool === "paint" && state2.paintShape) {
      compact.ps = paintShapeCode(state2.paintShape);
    }
    const cells = [];
    for (const [key, tile] of state2.cells) {
      const { col, row } = parseCellKey(key);
      cells.push([col, row, tileKindCode(tile.kind), colorIndex(tile.colorId)]);
    }
    if (cells.length > 0) {
      compact.a = cells;
    }
    const edgeInsets = [];
    for (const [key, inset] of state2.edgeInsets) {
      const edge = parseEdgeKey(key);
      edgeInsets.push([edge.col, edge.row, edge.side, colorIndex(inset.colorId)]);
    }
    if (edgeInsets.length > 0) {
      compact.e = edgeInsets;
    }
    const cornerInsets = [];
    for (const [key, inset] of state2.cornerInsets) {
      const corner = parseCornerKey(key);
      cornerInsets.push([corner.col, corner.row, corner.corner, colorIndex(inset.colorId)]);
    }
    if (cornerInsets.length > 0) {
      compact.k = cornerInsets;
    }
    if (colors.length > 0) {
      compact.cs = colors;
    }
    return compact;
  }
  async function processUrlWriteQueue() {
    if (isWritingUrl || pendingSnapshot === "" || pendingSnapshot === lastWrittenSnapshot) {
      return;
    }
    isWritingUrl = true;
    const snapshot = pendingSnapshot;
    try {
      const encoded = await encodeStateParam(snapshot);
      if (pendingSnapshot === snapshot) {
        const nextUrl = `${window.location.pathname}?s=${encoded}`;
        window.history.replaceState(null, "", nextUrl);
        lastWrittenSnapshot = snapshot;
      }
    } catch (error) {
      console.warn("Unable to compress tile state URL.", error);
    } finally {
      isWritingUrl = false;
      if (pendingSnapshot !== lastWrittenSnapshot) {
        void processUrlWriteQueue();
      }
    }
  }
  async function encodeStateParam(snapshot) {
    const input = new TextEncoder().encode(snapshot);
    if ("CompressionStream" in window) {
      const stream = new Blob([bytesToArrayBuffer(input)]).stream().pipeThrough(new CompressionStream("gzip"));
      const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
      return `z${bytesToBase64Url(compressed)}`;
    }
    return `j${bytesToBase64Url(input)}`;
  }
  async function decodeStateParam(encoded) {
    const prefix = encoded[0];
    if (prefix === "z") {
      if (!("DecompressionStream" in window)) {
        throw new Error("This browser does not support compressed URLs.");
      }
      const bytes = base64UrlToBytes(encoded.slice(1));
      const stream = new Blob([bytesToArrayBuffer(bytes)]).stream().pipeThrough(new DecompressionStream("gzip"));
      return new TextDecoder().decode(await new Response(stream).arrayBuffer());
    }
    if (prefix === "j") {
      const bytes = base64UrlToBytes(encoded.slice(1));
      return new TextDecoder().decode(bytes);
    }
    return new TextDecoder().decode(base64UrlToBytes(encoded));
  }
  function bytesToArrayBuffer(bytes) {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return copy.buffer;
  }
  function bytesToBase64Url(bytes) {
    let binary = "";
    for (let index = 0; index < bytes.length; index += 32768) {
      binary += String.fromCharCode(...bytes.slice(index, index + 32768));
    }
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  }
  function base64UrlToBytes(value) {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }
  function toolCode(tool) {
    if (tool === "grab") return "g";
    if (tool === "erase") return "e";
    if (tool === "colorPicker") return "c";
    return "p";
  }
  function toolFromCode(code) {
    if (code === "g") return "grab";
    if (code === "e") return "erase";
    if (code === "c") return "colorPicker";
    if (code === "p") return "paint";
    return void 0;
  }
  function paintShapeCode(shape) {
    if (shape === "orthogonalCross") return "o";
    if (shape === "diagonalCross") return "d";
    if (shape === "star") return "s";
    return "i";
  }
  function paintShapeFromCode(code) {
    if (code === "o") return "orthogonalCross";
    if (code === "d") return "diagonalCross";
    if (code === "s") return "star";
    if (code === "i") return "inset";
    return void 0;
  }
  function tileKindCode(kind) {
    if (kind === "orthogonalCross") return "o";
    if (kind === "diagonalCross") return "d";
    return "s";
  }
  function tileKindFromCode(code) {
    if (code === "o") return "orthogonalCross";
    if (code === "d") return "diagonalCross";
    if (code === "s") return "star";
    return void 0;
  }
  function validManufacturer(id) {
    return MANUFACTURERS.some((manufacturer) => manufacturer.id === id) ? id ?? void 0 : void 0;
  }
  function validColor(manufacturerId, id) {
    const manufacturer = MANUFACTURERS.find((candidate) => candidate.id === manufacturerId);
    return manufacturer?.colors.some((color) => color.id === id) ? id ?? void 0 : void 0;
  }
  function validGroutColor(id) {
    return GROUT_COLORS.some((color) => color.id === id) ? id ?? void 0 : void 0;
  }
  function validGroutJoint(value) {
    if (value === null) {
      return void 0;
    }
    const next = Number(value);
    return Number.isInteger(next) && GROUT_JOINT_OPTIONS.includes(next) ? next : void 0;
  }
  function validTileInches(value) {
    const next = Number(value);
    return TILE_SIZE_OPTIONS.includes(next) ? next : void 0;
  }
  function validRoomWidth(value) {
    if (value === null) {
      return void 0;
    }
    const next = Number(value);
    return Number.isInteger(next) ? clamp(next, MIN_ROOM_WIDTH_INCHES, MAX_ROOM_WIDTH_INCHES) : void 0;
  }
  function validRoomHeight(value) {
    if (value === null) {
      return void 0;
    }
    const next = Number(value);
    return Number.isInteger(next) ? clamp(next, MIN_ROOM_HEIGHT_INCHES, MAX_ROOM_HEIGHT_INCHES) : void 0;
  }
  function validHalfInch(value) {
    if (value === null) {
      return void 0;
    }
    const next = Number(value);
    if (!Number.isFinite(next)) {
      return void 0;
    }
    return roundToHalfInch(next);
  }
  function validSide(value) {
    return value === "n" || value === "e" || value === "s" || value === "w";
  }
  function validCorner(value) {
    return value === "nw" || value === "ne" || value === "se" || value === "sw";
  }

  // src/main.ts
  var canvas = requiredElement(document.querySelector("#room"), "room canvas");
  var workspace = requiredElement(document.querySelector(".workspace"), "workspace");
  var roomFrame = requiredElement(document.querySelector(".room-frame"), "room frame");
  var controlPanel = requiredElement(document.querySelector("#control-panel"), "control panel");
  var modeInputs = Array.from(document.querySelectorAll("input[name='mode']"));
  var gridLayerInputs = Array.from(document.querySelectorAll("input[name='grid-layer']"));
  var tileSizeInputs = Array.from(document.querySelectorAll("input[name='tile-size']"));
  var roomSpec = requiredElement(document.querySelector("#room-spec"), "room spec");
  var areaEditor = requiredElement(document.querySelector("#area-editor"), "area editor");
  var areaInput = requiredElement(document.querySelector("#area-input"), "area input");
  var areaAcceptButton = requiredElement(document.querySelector("#area-accept"), "area accept button");
  var areaCancelButton = requiredElement(document.querySelector("#area-cancel"), "area cancel button");
  var paintShapeInputs = Array.from(document.querySelectorAll("input[name='paint-shape']"));
  var toolInputs = Array.from(document.querySelectorAll("input[name='tool']"));
  var colorPickerTool = requiredElement(document.querySelector("#color-picker-tool"), "color picker tool");
  var tooltipControls = Array.from(document.querySelectorAll(".tool-button, .icon-button, #color-picker-tool"));
  var materialToolIcons = Array.from(document.querySelectorAll(".material-tool-icon"));
  var mobilePanelButtons = Array.from(document.querySelectorAll("[data-mobile-panel-button]"));
  var mobileBottomBar = requiredElement(document.querySelector(".mobile-bottom-bar"), "mobile bottom bar");
  var mobileLayoutIcon = requiredElement(document.querySelector("#mobile-layout-icon"), "mobile layout icon");
  var mobileTileIcon = requiredElement(document.querySelector("#mobile-tile-icon"), "mobile tile icon");
  var mobileTileIconCtx = requiredElement(mobileTileIcon.getContext("2d"), "mobile tile icon context");
  var mobileGroutIcon = requiredElement(document.querySelector("#mobile-grout-icon"), "mobile grout icon");
  var palette = requiredElement(document.querySelector("#palette"), "palette");
  var groutPalette = requiredElement(document.querySelector("#grout-palette"), "grout palette");
  var groutJointInputs = Array.from(document.querySelectorAll("input[name='grout-joint']"));
  var layoutErrors = requiredElement(document.querySelector("#layout-errors"), "layout error panel");
  var ctx = requiredElement(canvas.getContext("2d"), "canvas 2D context");
  var swatchTooltip = document.createElement("div");
  swatchTooltip.className = "swatch-tooltip";
  document.body.append(swatchTooltip);
  var colorToast = document.createElement("div");
  colorToast.className = "color-toast";
  document.body.append(colorToast);
  var gestureBadge = document.createElement("div");
  gestureBadge.className = "gesture-badge";
  document.body.append(gestureBadge);
  var state;
  var dragInteraction;
  var touchGesture;
  var activeMobilePanel;
  var lastMobilePaintShape;
  var lastMobilePaintColorOnly = false;
  var previousNonGrabMode;
  var colorToastTimer;
  var visualViewportBottomReserve = 0;
  var lastWorkspaceTap;
  var lastPaintKey = "";
  var lastConflictSignature = "";
  var renderReadyFrame = 0;
  var materialSwatchCache = /* @__PURE__ */ new Map();
  var touchPointers = /* @__PURE__ */ new Map();
  var viewportPan = { x: 0, y: 0 };
  var TOUCH_DRAG_THRESHOLD_PX = 10;
  void start();
  async function start() {
    syncVisualViewportVars();
    state = await loadState(workspace);
    rememberNonGrabMode();
    rememberMobilePaintMode();
    setupCanvas();
    setupControls();
    syncControls();
    render();
  }
  function setupCanvas() {
    const deviceRatio = window.devicePixelRatio || 1;
    const room = roomPx(state);
    canvas.width = Math.round(room.width * deviceRatio);
    canvas.height = Math.round(room.height * deviceRatio);
    canvas.style.width = `${room.width * state.zoom}px`;
    canvas.style.height = `${room.height * state.zoom}px`;
    updateViewportTransform();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(deviceRatio, deviceRatio);
    updateCanvasCursor();
  }
  function updateViewportTransform() {
    roomFrame.style.transform = `translate3d(${viewportPan.x}px, ${viewportPan.y}px, 0)`;
  }
  function requiredElement(element, label) {
    if (!element) {
      throw new Error(`Missing required ${label}.`);
    }
    return element;
  }
  function setupControls() {
    tooltipControls.forEach(attachSwatchTooltip);
    setupMobilePanelControls();
    modeInputs.forEach((input) => {
      input.addEventListener("click", () => {
        if (input.checked) {
          switchLayoutMode(input.value, { autoGrab: !isTouchInterface() });
          updateUrl(state);
          render();
          dismissMobilePanelAfterAction();
        }
      });
    });
    gridLayerInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          state.showGrid = input.value === "top";
          updateUrl(state);
          render();
          dismissMobilePanelAfterAction();
        }
      });
    });
    tileSizeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          state.tileInches = validTileInches(input.value) ?? state.tileInches;
          syncSpecs();
          updateUrl(state);
          render();
          dismissMobilePanelAfterAction();
        }
      });
    });
    areaInput.addEventListener("focus", beginAreaEdit);
    areaInput.addEventListener("beforeinput", queueAreaValidation);
    areaInput.addEventListener("input", validateAreaInput);
    areaInput.addEventListener("keyup", validateAreaInput);
    areaInput.addEventListener("change", validateAreaInput);
    areaInput.addEventListener("paste", queueAreaValidation);
    areaInput.addEventListener("compositionend", validateAreaInput);
    areaInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        acceptAreaEdit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        cancelAreaEdit();
      }
    });
    areaAcceptButton.addEventListener("click", acceptAreaEdit);
    areaCancelButton.addEventListener("click", cancelAreaEdit);
    paintShapeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          state.tool = "paint";
          state.paintShape = input.value;
          rememberNonGrabMode();
          rememberMobilePaintMode();
          syncInteractionControls();
          updateUrl(state);
          updateCanvasCursor();
          syncPaletteState();
          dismissMobilePanelAfterAction();
        }
      });
    });
    toolInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          if (input.value === "grab") {
            rememberNonGrabMode();
          }
          state.tool = input.value;
          state.paintShape = void 0;
          rememberNonGrabMode();
          syncInteractionControls();
          updateUrl(state);
          updateCanvasCursor();
          syncPaletteState();
          dismissMobilePanelAfterAction();
        }
      });
    });
    colorPickerTool.addEventListener("click", () => {
      state.tool = "colorPicker";
      state.paintShape = void 0;
      rememberNonGrabMode();
      syncInteractionControls();
      syncPaletteState();
      updateUrl(state);
      updateCanvasCursor();
      dismissMobilePanelAfterAction();
    });
    groutJointInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          state.groutJointSixteenths = validGroutJoint(input.value) ?? state.groutJointSixteenths;
          renderMobileTabIcons();
          updateUrl(state);
          render();
          dismissMobilePanelAfterAction();
        }
      });
    });
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerCancel);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    workspace.addEventListener("pointerdown", handleWorkspacePointerDown);
    workspace.addEventListener("pointermove", handleWorkspacePointerMove);
    workspace.addEventListener("pointerup", handleWorkspacePointerUp);
    workspace.addEventListener("pointercancel", handleWorkspacePointerCancel);
    workspace.addEventListener("touchend", preventWorkspaceDoubleTapZoom, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", scheduleVisualViewportSync);
    window.addEventListener("orientationchange", resetVisualViewportReserve);
    window.addEventListener("focus", resetVisualViewportReserve);
    document.addEventListener("visibilitychange", resetVisualViewportReserve);
    window.addEventListener("focusin", scheduleVisualViewportSync);
    window.addEventListener("focusout", scheduleVisualViewportSync);
    window.addEventListener("pointerdown", scheduleVisualViewportSync, { passive: true });
    window.addEventListener("pointerup", scheduleVisualViewportSync, { passive: true });
    window.addEventListener("touchstart", scheduleVisualViewportSync, { passive: true });
    window.addEventListener("touchend", scheduleVisualViewportSync, { passive: true });
    controlPanel.addEventListener("touchstart", preventControlPinch, { passive: false });
    controlPanel.addEventListener("touchmove", preventControlPinch, { passive: false });
    mobileBottomBar.addEventListener("touchstart", preventControlPinch, { passive: false });
    mobileBottomBar.addEventListener("touchmove", preventControlPinch, { passive: false });
    window.visualViewport?.addEventListener("resize", scheduleVisualViewportSync);
    window.visualViewport?.addEventListener("scroll", scheduleVisualViewportSync);
  }
  function syncVisualViewportVars() {
    if (!document.hasFocus()) {
      return;
    }
    const viewport = window.visualViewport;
    const top = viewport?.offsetTop ?? 0;
    const height = viewport?.height ?? window.innerHeight;
    const layoutHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    const measuredBottom = Math.max(0, layoutHeight - (top + height));
    const isEditingArea = document.activeElement === areaInput;
    const canReserveBottomChrome = measuredBottom > 0 && measuredBottom <= 120;
    if (top > 20) {
      visualViewportBottomReserve = measuredBottom;
    } else if (canReserveBottomChrome && measuredBottom > visualViewportBottomReserve) {
      visualViewportBottomReserve = measuredBottom;
    } else if (measuredBottom === 0 && !isEditingArea) {
      visualViewportBottomReserve = 0;
    }
    const usableMeasuredBottom = measuredBottom <= 120 || isEditingArea ? measuredBottom : 0;
    const bottom = top > 20 ? usableMeasuredBottom : Math.max(usableMeasuredBottom, visualViewportBottomReserve);
    document.documentElement.style.setProperty("--vv-top", `${top}px`);
    document.documentElement.style.setProperty("--vv-bottom", `${bottom}px`);
    document.documentElement.style.setProperty("--vv-height", `${height}px`);
  }
  function scheduleVisualViewportSync() {
    syncVisualViewportVars();
    window.requestAnimationFrame(syncVisualViewportVars);
    window.setTimeout(syncVisualViewportVars, 80);
    window.setTimeout(syncVisualViewportVars, 300);
  }
  function resetVisualViewportReserve() {
    visualViewportBottomReserve = 0;
    scheduleVisualViewportSync();
  }
  function preventControlPinch(event) {
    if (event.touches.length >= 2) {
      event.preventDefault();
    }
  }
  function preventWorkspaceDoubleTapZoom(event) {
    if (event.changedTouches.length !== 1 || touchPointers.size > 0) {
      return;
    }
    const touch = event.changedTouches[0];
    const now = window.performance.now();
    const previous = lastWorkspaceTap;
    lastWorkspaceTap = { time: now, x: touch.clientX, y: touch.clientY };
    if (!previous) {
      return;
    }
    const elapsed = now - previous.time;
    const distance2 = Math.hypot(touch.clientX - previous.x, touch.clientY - previous.y);
    if (elapsed < 350 && distance2 < 32) {
      event.preventDefault();
    }
  }
  function setupMobilePanelControls() {
    mobilePanelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const panel = mobilePanelFromValue(button.dataset.mobilePanelButton);
        if (!panel) {
          return;
        }
        setActiveMobilePanel(activeMobilePanel === panel ? void 0 : panel);
      });
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeMobilePanel) {
        setActiveMobilePanel(void 0);
      }
    });
  }
  function mobilePanelFromValue(value) {
    return value === "layout" || value === "tiles" || value === "grout" ? value : void 0;
  }
  function setActiveMobilePanel(panel) {
    activeMobilePanel = panel;
    controlPanel.dataset.mobileActivePanel = panel ?? "";
    document.body.classList.toggle("mobile-panel-open", panel !== void 0);
    mobilePanelButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.mobilePanelButton === panel));
    });
    scrollMobilePanelAfterOpen(panel);
    hideSwatchTooltip();
  }
  function scrollMobilePanelAfterOpen(panel) {
    window.requestAnimationFrame(() => {
      if (activeMobilePanel !== panel) {
        return;
      }
      if (panel === "tiles") {
        controlPanel.scrollTop = controlPanel.scrollHeight;
      } else {
        controlPanel.scrollTop = 0;
      }
    });
  }
  function dismissMobilePanelAfterAction() {
    if (activeMobilePanel) {
      setActiveMobilePanel(void 0);
    }
  }
  function switchLayoutMode(nextMode, options = { autoGrab: true }) {
    if (state.mode !== nextMode) {
      const center = roomCenter(state);
      const localCenterBefore = screenToGridLocal(state, center);
      state.mode = nextMode;
      const angle = layoutRotation(state);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rotatedCenter = {
        x: localCenterBefore.x * cos - localCenterBefore.y * sin,
        y: localCenterBefore.x * sin + localCenterBefore.y * cos
      };
      state.offsetXInches = roundToHalfInch(-rotatedCenter.x / SCALE);
      state.offsetYInches = roundToHalfInch(-rotatedCenter.y / SCALE);
    }
    if (options.autoGrab) {
      rememberNonGrabMode();
      state.tool = "grab";
      state.paintShape = void 0;
    }
    syncModeClass();
    syncInteractionControls();
    renderToolIcons();
    syncPaletteState();
    updateCanvasCursor();
  }
  function syncControls() {
    syncModeClass();
    modeInputs.forEach((input) => {
      input.checked = input.value === state.mode;
    });
    gridLayerInputs.forEach((input) => {
      input.checked = input.value === (state.showGrid ? "top" : "under");
    });
    tileSizeInputs.forEach((input) => {
      input.checked = Number(input.value) === state.tileInches;
    });
    syncInteractionControls();
    renderToolIcons();
    renderPalette();
    renderGroutPalette();
    syncGroutControls();
    syncSpecs();
    updateCanvasCursor();
    renderMobileTabIcons();
  }
  function syncInteractionControls() {
    paintShapeInputs.forEach((input) => {
      input.checked = state.tool === "paint" && input.value === state.paintShape;
    });
    toolInputs.forEach((input) => {
      input.checked = input.value === state.tool;
    });
    renderMobileTabIcons();
  }
  function isTouchInterface() {
    return window.matchMedia("(pointer: coarse)").matches;
  }
  function syncSpecs() {
    const text = areaText(state.roomWidthInches, state.roomHeightInches);
    roomSpec.textContent = text;
    if (!areaEditor.classList.contains("is-editing")) {
      areaInput.value = text;
    }
    validateAreaInput();
  }
  function syncModeClass() {
    document.body.classList.toggle("mode-diagonal", state.mode === "diagonal");
  }
  function beginAreaEdit() {
    areaEditor.classList.add("is-editing");
    validateAreaInput();
    areaInput.select();
  }
  function acceptAreaEdit() {
    const parsed = parseAreaInput(areaInput.value);
    if (!parsed) {
      validateAreaInput();
      return;
    }
    state.roomWidthInches = parsed.width;
    state.roomHeightInches = parsed.height;
    areaEditor.classList.remove("is-editing");
    syncSpecs();
    areaInput.blur();
    zoomOutToFitRoomIfNeeded();
    setupCanvas();
    updateUrl(state);
    render();
    dismissMobilePanelAfterAction();
  }
  function cancelAreaEdit() {
    areaEditor.classList.remove("is-editing");
    areaInput.value = areaText(state.roomWidthInches, state.roomHeightInches);
    validateAreaInput();
    areaInput.blur();
    dismissMobilePanelAfterAction();
  }
  function validateAreaInput() {
    const isValid = parseAreaInput(areaInput.value) !== void 0;
    areaAcceptButton.disabled = !isValid;
    areaAcceptButton.setAttribute("aria-disabled", String(!isValid));
  }
  function parseAreaInput(value) {
    const dimensions = parseAreaDimensions(value);
    if (!dimensions) {
      return void 0;
    }
    const [width, height] = dimensions;
    if (width < MIN_ROOM_WIDTH_INCHES || width > MAX_ROOM_WIDTH_INCHES || height < MIN_ROOM_HEIGHT_INCHES || height > MAX_ROOM_HEIGHT_INCHES) {
      return void 0;
    }
    return { width, height };
  }
  function parseAreaDimensions(value) {
    const normalized = value.trim().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[′]/g, "'").replace(/[″]/g, '"').replace(/[×]/g, "x");
    const xParts = normalized.split(/\s*x\s*/i).filter((part) => part.trim() !== "");
    if (xParts.length === 2) {
      return parseDimensionPair(xParts[0], xParts[1]);
    }
    const footMatches = normalized.match(/\d+\s*(?:'|ft\b)\s*\d*\s*(?:"|in\b)?/gi);
    if (footMatches?.length === 2) {
      return parseDimensionPair(footMatches[0], footMatches[1]);
    }
    const inchMatches = normalized.match(/\d+/g);
    if (inchMatches?.length === 2) {
      return parseDimensionPair(inchMatches[0], inchMatches[1]);
    }
    return void 0;
  }
  function parseDimensionPair(first, second) {
    const width = parseAreaDimension(first);
    const height = parseAreaDimension(second);
    return width !== void 0 && height !== void 0 ? [width, height] : void 0;
  }
  function parseAreaDimension(value) {
    const trimmed = value.trim();
    const feetMatch = trimmed.match(/^(\d+)\s*(?:'|ft\b)\s*(\d*)\s*(?:"|in\b)?$/i);
    if (feetMatch) {
      const feet = Number(feetMatch[1]);
      const inches2 = feetMatch[2] === "" ? 0 : Number(feetMatch[2]);
      if (!Number.isInteger(feet) || !Number.isInteger(inches2) || inches2 < 0 || inches2 >= 12) {
        return void 0;
      }
      return feet * 12 + inches2;
    }
    const inchesMatch = trimmed.match(/^(\d+)\s*(?:"|in\b)?$/i);
    if (!inchesMatch) {
      return void 0;
    }
    const inches = Number(inchesMatch[1]);
    return Number.isInteger(inches) ? inches : void 0;
  }
  function queueAreaValidation() {
    window.requestAnimationFrame(validateAreaInput);
  }
  function areaText(width, height) {
    return `${dimensionText(width)} x ${dimensionText(height)}`;
  }
  function dimensionText(inches) {
    const feet = Math.floor(inches / 12);
    const remainder = inches % 12;
    return `${feet}'${remainder}"`;
  }
  function zoomOutToFitRoomIfNeeded() {
    const room = roomPx(state);
    const displayWidth = room.width * state.zoom;
    const displayHeight = room.height * state.zoom;
    const availableWidth = Math.max(1, workspace.clientWidth - workspacePadding("left") - workspacePadding("right"));
    const availableHeight = Math.max(1, workspace.clientHeight - workspacePadding("top") - workspacePadding("bottom"));
    if (displayWidth <= availableWidth && displayHeight <= availableHeight) {
      return;
    }
    state.zoom = Math.min(state.zoom, initialZoomForRoom(workspace, state.roomWidthInches, state.roomHeightInches));
    viewportPan.x = 0;
    viewportPan.y = 0;
    workspace.scrollLeft = 0;
    workspace.scrollTop = 0;
    updateViewportTransform();
  }
  function workspacePadding(side) {
    const style = getComputedStyle(workspace);
    if (side === "left") return Number.parseFloat(style.paddingLeft);
    if (side === "right") return Number.parseFloat(style.paddingRight);
    if (side === "top") return Number.parseFloat(style.paddingTop);
    return Number.parseFloat(style.paddingBottom);
  }
  function renderPalette() {
    palette.innerHTML = "";
    palette.classList.toggle("is-picking", state.tool === "colorPicker");
    colorPickerTool.setAttribute("aria-pressed", String(state.tool === "colorPicker"));
    for (const manufacturer of MANUFACTURERS) {
      const marker = document.createElement("div");
      marker.className = "palette-manufacturer";
      marker.dataset.tooltip = manufacturer.name;
      marker.dataset.mobileLabel = manufacturer.name;
      marker.textContent = manufacturer.name.slice(0, 1);
      attachSwatchTooltip(marker);
      palette.append(marker);
      for (const color of manufacturer.colors) {
        const swatch = document.createElement("button");
        swatch.className = "swatch";
        swatch.type = "button";
        swatch.style.backgroundColor = color.value;
        swatch.style.backgroundImage = materialSwatchBackground(color.id);
        swatch.dataset.colorId = color.id;
        const label = materialTooltipText(manufacturer.id, color.id) ?? color.name;
        swatch.dataset.tooltip = label;
        swatch.setAttribute("aria-label", label);
        swatch.addEventListener("click", () => {
          const clickedCurrentPaintColor = state.tool === "paint" && state.paintShape !== void 0 && state.colorId === color.id;
          selectColor(manufacturer.id, color.id);
          showColorToast(label);
          if (clickedCurrentPaintColor || state.tool !== "paint" || !state.paintShape) {
            switchToPaintColorOnly();
          } else {
            rememberMobilePaintMode();
          }
          syncInteractionControls();
          syncPaletteState();
          updateUrl(state);
          updateCanvasCursor();
          dismissMobilePanelAfterAction();
        });
        attachSwatchTooltip(swatch);
        palette.append(swatch);
      }
    }
    syncPaletteState();
  }
  function syncPaletteState() {
    palette.classList.toggle("is-picking", state.tool === "colorPicker");
    colorPickerTool.setAttribute("aria-pressed", String(state.tool === "colorPicker"));
    for (const swatch of Array.from(palette.querySelectorAll(".swatch"))) {
      swatch.setAttribute("aria-pressed", String(state.tool === "paint" && swatch.dataset.colorId === state.colorId));
      swatch.style.cursor = state.tool === "colorPicker" ? DROPPER_CURSOR : "";
    }
  }
  function selectColor(manufacturerId, colorId) {
    state.manufacturerId = manufacturerId;
    state.colorId = colorId;
    renderToolIcons();
    renderMobileTabIcons();
  }
  function renderToolIcons() {
    for (const icon of materialToolIcons) {
      const shape = icon.dataset.toolShape;
      if (!shape) {
        continue;
      }
      const iconCtx = requiredElement(icon.getContext("2d"), "tool icon canvas context");
      iconCtx.clearRect(0, 0, icon.width, icon.height);
      traceToolIconPath(iconCtx, shape, state.mode);
      fillMaterialPath(iconCtx, state.colorId, `tool-icon:${shape}:${state.colorId}`, { x: 0, y: 0, width: icon.width, height: icon.height });
      traceToolIconPath(iconCtx, shape, state.mode);
      iconCtx.lineWidth = 2;
      iconCtx.strokeStyle = "#050505";
      iconCtx.stroke();
    }
    renderMobileTabIcons();
  }
  function rememberMobilePaintMode() {
    if (state.tool !== "paint") {
      return;
    }
    if (state.paintShape) {
      lastMobilePaintShape = state.paintShape;
      lastMobilePaintColorOnly = false;
    } else {
      lastMobilePaintColorOnly = true;
    }
  }
  function rememberNonGrabMode() {
    if (!state || state.tool === "grab") {
      return;
    }
    previousNonGrabMode = {
      tool: state.tool,
      paintShape: state.tool === "paint" ? state.paintShape : void 0
    };
  }
  function restoreNonGrabModeAfterTouchGrab() {
    const mode = previousNonGrabMode ?? { tool: "paint", paintShape: void 0 };
    state.tool = mode.tool;
    state.paintShape = mode.tool === "paint" ? mode.paintShape : void 0;
    rememberMobilePaintMode();
    syncInteractionControls();
    syncPaletteState();
    updateCanvasCursor();
    updateUrl(state);
  }
  function renderMobileTabIcons() {
    renderMobileLayoutIcon();
    renderMobileTilePreview();
    renderMobileGroutIcon();
  }
  function renderMobileLayoutIcon() {
    if (state.tool === "grab") {
      mobileLayoutIcon.innerHTML = `<path d="M15 25V14a4 4 0 0 1 8 0v10-13a4 4 0 0 1 8 0v13-9a4 4 0 0 1 8 0v16c0 8-6 13-14 13h-3c-6 0-10-3-13-8l-4-7a4 4 0 0 1 7-4l3 5z"/>`;
      return;
    }
    mobileLayoutIcon.innerHTML = state.mode === "diagonal" ? `<path d="M42 9 9 42M30 6 6 30M42 21 21 42M18 6 6 18M42 33 33 42M9 9l33 33M21 6l21 21M6 21l21 21M33 6l9 9M6 33l9 9"/>` : `<path d="M13 7v34M24 7v34M35 7v34M7 13h34M7 24h34M7 35h34"/>`;
  }
  function renderMobileTilePreview() {
    mobileTileIconCtx.clearRect(0, 0, mobileTileIcon.width, mobileTileIcon.height);
    if (state.tool === "erase") {
      traceMobileEraserIcon(mobileTileIconCtx);
    } else if (state.tool === "colorPicker") {
      traceMobileDropperIcon(mobileTileIconCtx);
    } else if (state.tool === "paint") {
      if (state.paintShape) {
        traceMobileMaterialShape(mobileTileIconCtx, state.paintShape, "mobile-tab");
      } else {
        traceMobileMaterialSquare(mobileTileIconCtx, "mobile-tab:color-only");
      }
    } else if (lastMobilePaintColorOnly || !lastMobilePaintShape) {
      traceMobileMaterialSquare(mobileTileIconCtx, "mobile-tab:last-color-only");
    } else {
      traceMobileMaterialShape(mobileTileIconCtx, lastMobilePaintShape, "mobile-tab:last-shape");
    }
  }
  function renderMobileGroutIcon() {
    const strokeWidth = Math.max(1, Math.min(8, state.groutJointSixteenths));
    const path = state.mode === "diagonal" ? "M12 12 36 36M36 12 12 36" : "M24 8v32M8 24h32";
    mobileGroutIcon.innerHTML = `<path d="${path}" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke"/>`;
  }
  function traceMobileMaterialShape(ctx2, shape, seed) {
    ctx2.save();
    traceToolIconPath(ctx2, shape, state.mode);
    fillMaterialPath(ctx2, state.colorId, `${seed}:${shape}:${state.colorId}`, { x: 0, y: 0, width: 100, height: 100 });
    traceToolIconPath(ctx2, shape, state.mode);
    ctx2.lineWidth = 4;
    ctx2.strokeStyle = "#050505";
    ctx2.stroke();
    ctx2.restore();
  }
  function traceMobileMaterialSquare(ctx2, seed) {
    ctx2.save();
    ctx2.beginPath();
    ctx2.rect(18, 18, 64, 64);
    fillMaterialPath(ctx2, state.colorId, `${seed}:${state.colorId}`, { x: 18, y: 18, width: 64, height: 64 });
    ctx2.lineWidth = 4;
    ctx2.strokeStyle = "#050505";
    ctx2.strokeRect(18, 18, 64, 64);
    ctx2.restore();
  }
  function traceMobileEraserIcon(ctx2) {
    ctx2.save();
    ctx2.fillStyle = "#34302b";
    ctx2.strokeStyle = "#34302b";
    ctx2.lineWidth = 6;
    ctx2.lineJoin = "round";
    ctx2.beginPath();
    ctx2.moveTo(14, 63);
    ctx2.lineTo(55, 22);
    ctx2.lineTo(79, 46);
    ctx2.lineTo(48, 77);
    ctx2.lineTo(28, 77);
    ctx2.closePath();
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.moveTo(29, 78);
    ctx2.lineTo(78, 78);
    ctx2.stroke();
    ctx2.restore();
  }
  function traceMobileDropperIcon(ctx2) {
    ctx2.save();
    ctx2.translate(50, 50);
    ctx2.rotate(Math.PI / 4);
    ctx2.translate(-50, -50);
    ctx2.fillStyle = "#34302b";
    ctx2.strokeStyle = "#34302b";
    ctx2.lineWidth = 6;
    ctx2.lineJoin = "round";
    ctx2.beginPath();
    ctx2.moveTo(38, 18);
    ctx2.bezierCurveTo(38, 7, 50, 0, 50, 0);
    ctx2.bezierCurveTo(50, 0, 62, 7, 62, 18);
    ctx2.bezierCurveTo(62, 27, 57, 34, 50, 34);
    ctx2.bezierCurveTo(43, 34, 38, 27, 38, 18);
    ctx2.fill();
    ctx2.strokeRect(44, 33, 12, 42);
    ctx2.beginPath();
    ctx2.moveTo(44, 75);
    ctx2.lineTo(56, 75);
    ctx2.lineTo(50, 92);
    ctx2.closePath();
    ctx2.stroke();
    ctx2.restore();
  }
  function materialTooltipText(manufacturerId, colorId) {
    const manufacturer = MANUFACTURERS.find((candidate) => candidate.id === manufacturerId);
    const color = manufacturer?.colors.find((candidate) => candidate.id === colorId);
    if (!manufacturer || !color) {
      return void 0;
    }
    return `${color.name}
(${color.texture.replaceAll("_", " ")})
by ${manufacturer.name}`;
  }
  function materialTooltipTextForColor(colorId) {
    const manufacturer = MANUFACTURERS.find((candidate) => candidate.colors.some((color) => color.id === colorId));
    return manufacturer ? materialTooltipText(manufacturer.id, colorId) : void 0;
  }
  function switchToPaintColorOnly() {
    state.tool = "paint";
    state.paintShape = void 0;
    rememberNonGrabMode();
    rememberMobilePaintMode();
    syncInteractionControls();
    updateCanvasCursor();
  }
  function materialSwatchBackground(colorId) {
    const cached = materialSwatchCache.get(colorId);
    if (cached) {
      return cached;
    }
    const size = 64;
    const swatchCanvas = document.createElement("canvas");
    swatchCanvas.width = size;
    swatchCanvas.height = size;
    const swatchCtx = requiredElement(swatchCanvas.getContext("2d"), "swatch canvas context");
    swatchCtx.beginPath();
    swatchCtx.rect(0, 0, size, size);
    fillMaterialPath(swatchCtx, colorId, `swatch:${colorId}`, { x: 0, y: 0, width: size, height: size });
    const image = `url(${swatchCanvas.toDataURL("image/png")})`;
    materialSwatchCache.set(colorId, image);
    return image;
  }
  function renderGroutPalette() {
    groutPalette.innerHTML = "";
    for (const groutColor2 of GROUT_COLORS) {
      const swatch = document.createElement("button");
      swatch.className = "swatch";
      swatch.type = "button";
      swatch.style.background = groutColor2.value;
      swatch.dataset.tooltip = groutColor2.name;
      swatch.setAttribute("aria-label", groutColor2.name);
      swatch.setAttribute("aria-pressed", String(groutColor2.id === state.groutColorId));
      swatch.addEventListener("click", () => {
        state.groutColorId = groutColor2.id;
        renderGroutPalette();
        renderMobileTabIcons();
        updateUrl(state);
        render();
        dismissMobilePanelAfterAction();
      });
      attachSwatchTooltip(swatch);
      groutPalette.append(swatch);
    }
  }
  function attachSwatchTooltip(swatch) {
    swatch.addEventListener("mouseenter", () => showSwatchTooltip(swatch));
    swatch.addEventListener("mouseleave", hideSwatchTooltip);
    swatch.addEventListener("focus", () => showSwatchTooltip(swatch));
    swatch.addEventListener("blur", hideSwatchTooltip);
  }
  function showSwatchTooltip(swatch) {
    const text = swatch.dataset.tooltip;
    if (!text) {
      return;
    }
    const rect = swatch.getBoundingClientRect();
    swatchTooltip.textContent = text;
    swatchTooltip.style.left = `${rect.right - 4}px`;
    swatchTooltip.style.top = `${rect.top + 4}px`;
    swatchTooltip.classList.add("is-visible");
  }
  function hideSwatchTooltip() {
    swatchTooltip.classList.remove("is-visible");
  }
  function showColorToast(text) {
    const workspaceRect = workspace.getBoundingClientRect();
    colorToast.textContent = text;
    colorToast.style.left = `${workspaceRect.left + workspaceRect.width / 2}px`;
    colorToast.style.top = `${Math.max(12, visualViewportTop() + 18)}px`;
    colorToast.classList.remove("is-visible");
    void colorToast.offsetWidth;
    colorToast.classList.add("is-visible");
    if (colorToastTimer !== void 0) {
      window.clearTimeout(colorToastTimer);
    }
    colorToastTimer = window.setTimeout(() => {
      colorToast.classList.remove("is-visible");
      colorToastTimer = void 0;
    }, 2e3);
  }
  function showCanvasPickTooltip(event) {
    if (state.tool !== "colorPicker") {
      hideSwatchTooltip();
      return;
    }
    const point = canvasPoint(state, canvas, event);
    if (!point || !pointInRoom(state, point)) {
      hideSwatchTooltip();
      return;
    }
    const cell = cellFromPoint(state, point);
    const colorId = colorIdAt(state, point, cell.col, cell.row);
    const label = colorId ? materialTooltipTextForColor(colorId) : void 0;
    if (!label) {
      hideSwatchTooltip();
      return;
    }
    swatchTooltip.textContent = label;
    swatchTooltip.style.left = `${event.clientX + 12}px`;
    swatchTooltip.style.top = `${event.clientY - 2}px`;
    swatchTooltip.classList.add("is-visible");
  }
  function syncGroutControls() {
    groutJointInputs.forEach((input) => {
      input.checked = Number(input.value) === state.groutJointSixteenths;
    });
    renderMobileTabIcons();
  }
  function handlePointerDown(event) {
    if (event.pointerType === "touch") {
      return;
    }
    lastPaintKey = "";
    canvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(state, canvas, event);
    if (!point || !pointInRoom(state, point)) {
      return;
    }
    const resizeHandle = resizeHandleAtPoint(state, point);
    if (resizeHandle) {
      dragInteraction = {
        type: "resizeRoom",
        pointerId: event.pointerId,
        handle: resizeHandle,
        startClientPoint: { x: event.clientX, y: event.clientY },
        startWidthInches: state.roomWidthInches,
        startHeightInches: state.roomHeightInches
      };
      updateCanvasCursor(point);
      return;
    }
    if (state.tool === "grab") {
      dragInteraction = {
        type: "grab",
        pointerId: event.pointerId,
        startPoint: { x: event.clientX, y: event.clientY },
        startOffsetXInches: state.offsetXInches,
        startOffsetYInches: state.offsetYInches
      };
      updateCanvasCursor(point);
      return;
    }
    if (state.tool === "colorPicker") {
      pickColorFromPointer(point);
      hideSwatchTooltip();
      return;
    }
    dragInteraction = { type: "paint", pointerId: event.pointerId };
    paintFromPointer(event);
  }
  function handlePointerMove(event) {
    if (event.pointerType === "touch") {
      return;
    }
    if (!dragInteraction) {
      showCanvasPickTooltip(event);
      updateCanvasCursor(canvasPoint(state, canvas, event));
      return;
    }
    if (dragInteraction.pointerId !== event.pointerId) {
      return;
    }
    if (dragInteraction.type === "paint") {
      paintFromPointer(event);
    } else if (dragInteraction.type === "grab") {
      moveGridFromPointer(event, dragInteraction);
    } else {
      resizeRoomFromPointer(event, dragInteraction);
    }
  }
  function handlePointerUp(event) {
    if (event.pointerType === "touch") {
      return;
    }
    lastPaintKey = "";
    if (dragInteraction?.pointerId === event.pointerId) {
      dragInteraction = void 0;
      updateUrl(state);
      updateCanvasCursor(canvasPoint(state, canvas, event));
    }
    canvas.releasePointerCapture(event.pointerId);
  }
  function handlePointerCancel(event) {
    if (event.pointerType === "touch") {
      return;
    }
    lastPaintKey = "";
    if (dragInteraction?.pointerId === event.pointerId) {
      dragInteraction = void 0;
      updateCanvasCursor();
    }
    hideSwatchTooltip();
  }
  function handlePointerLeave(event) {
    if (event.pointerType === "touch") {
      return;
    }
    if (!dragInteraction) {
      updateCanvasCursor(canvasPoint(state, canvas, event));
    }
    hideSwatchTooltip();
  }
  function handleWorkspacePointerDown(event) {
    if (event.pointerType === "touch") {
      handleTouchPointerDown(event);
    }
  }
  function handleWorkspacePointerMove(event) {
    if (event.pointerType === "touch") {
      handleTouchPointerMove(event);
    }
  }
  function handleWorkspacePointerUp(event) {
    if (event.pointerType === "touch") {
      handleTouchPointerUp(event);
    }
  }
  function handleWorkspacePointerCancel(event) {
    if (event.pointerType === "touch") {
      handleTouchPointerCancel(event);
    }
  }
  function handleTouchPointerDown(event) {
    event.preventDefault();
    hideSwatchTooltip();
    lastPaintKey = "";
    workspace.setPointerCapture(event.pointerId);
    touchPointers.set(event.pointerId, clientPoint(event));
    if (touchPointers.size >= 2) {
      beginPinchGesture();
      return;
    }
    touchGesture = { type: "pending", pointerId: event.pointerId, startClientPoint: clientPoint(event) };
  }
  function handleTouchPointerMove(event) {
    event.preventDefault();
    touchPointers.set(event.pointerId, clientPoint(event));
    if (touchGesture?.type === "pinch") {
      updatePinchGesture();
      return;
    }
    if (touchPointers.size >= 2) {
      beginPinchGesture();
      return;
    }
    if (!touchGesture || touchGesture.pointerId !== event.pointerId) {
      return;
    }
    const currentPoint = clientPoint(event);
    const movement = distanceBetween2(currentPoint, touchGesture.startClientPoint);
    if (touchGesture.type === "pending") {
      if (movement < TOUCH_DRAG_THRESHOLD_PX) {
        return;
      }
      if (state.tool === "grab") {
        touchGesture = {
          type: "grab",
          pointerId: event.pointerId,
          startClientPoint: touchGesture.startClientPoint,
          startOffsetXInches: state.offsetXInches,
          startOffsetYInches: state.offsetYInches
        };
        moveGridFromTouch(currentPoint, touchGesture);
      } else {
        touchGesture = {
          type: "pan",
          pointerId: event.pointerId,
          startClientPoint: touchGesture.startClientPoint,
          startPan: { ...viewportPan }
        };
        panViewportFromTouch(currentPoint, touchGesture);
      }
      return;
    }
    if (touchGesture.type === "pan") {
      panViewportFromTouch(currentPoint, touchGesture);
    } else if (touchGesture.type === "grab") {
      moveGridFromTouch(currentPoint, touchGesture);
    }
  }
  function handleTouchPointerUp(event) {
    event.preventDefault();
    const finalClientPoint = clientPoint(event);
    const activeGesture = touchGesture;
    touchPointers.delete(event.pointerId);
    workspace.releasePointerCapture(event.pointerId);
    if (activeGesture?.type === "pending" && activeGesture.pointerId === event.pointerId) {
      const point = canvasPoint(state, canvas, event);
      if (point && pointInRoom(state, point) && state.tool !== "grab") {
        if (state.tool === "colorPicker") {
          pickColorFromPointer(point);
        } else {
          paintAtPoint(point);
        }
      }
    } else if (activeGesture?.type === "grab" && activeGesture.pointerId === event.pointerId) {
      moveGridFromTouch(finalClientPoint, activeGesture);
      updateUrl(state);
      hideGestureBadge();
      restoreNonGrabModeAfterTouchGrab();
    }
    if (activeGesture?.type === "pinch") {
      finalizePinchGesture(activeGesture);
      touchGesture = void 0;
    } else if (touchPointers.size === 0 || activeGesture?.pointerId === event.pointerId) {
      touchGesture = void 0;
    }
  }
  function handleTouchPointerCancel(event) {
    event.preventDefault();
    const activeGesture = touchGesture;
    touchPointers.delete(event.pointerId);
    if (activeGesture?.type === "pinch") {
      finalizePinchGesture(activeGesture);
      touchGesture = void 0;
      hideGestureBadge();
    } else if (activeGesture?.pointerId === event.pointerId || touchPointers.size === 0) {
      touchGesture = void 0;
      hideGestureBadge();
    }
    hideSwatchTooltip();
  }
  function beginPinchGesture() {
    const pointers = Array.from(touchPointers.entries()).slice(0, 2);
    if (pointers.length < 2) {
      return;
    }
    hideGestureBadge();
    const first = pointers[0];
    const second = pointers[1];
    const center = midpoint(first[1], second[1]);
    const rect = canvas.getBoundingClientRect();
    const room = roomPx(state);
    touchGesture = {
      type: "pinch",
      pointerIds: [first[0], second[0]],
      startDistance: Math.max(1, distanceBetween2(first[1], second[1])),
      startZoom: state.zoom,
      currentZoom: state.zoom,
      baseCanvasLeft: rect.left - viewportPan.x,
      baseCanvasTop: rect.top - viewportPan.y,
      anchorRoomPoint: {
        x: (center.x - rect.left) / rect.width * room.width,
        y: (center.y - rect.top) / rect.height * room.height
      }
    };
  }
  function updatePinchGesture() {
    if (touchGesture?.type !== "pinch") {
      return;
    }
    const first = touchPointers.get(touchGesture.pointerIds[0]);
    const second = touchPointers.get(touchGesture.pointerIds[1]);
    if (!first || !second) {
      return;
    }
    const center = midpoint(first, second);
    const nextZoom = normalizeZoom(touchGesture.startZoom * distanceBetween2(first, second) / touchGesture.startDistance);
    const room = roomPx(state);
    touchGesture.currentZoom = nextZoom;
    canvas.style.width = `${room.width * nextZoom}px`;
    canvas.style.height = `${room.height * nextZoom}px`;
    viewportPan.x = center.x - touchGesture.baseCanvasLeft - touchGesture.anchorRoomPoint.x * nextZoom;
    viewportPan.y = center.y - touchGesture.baseCanvasTop - touchGesture.anchorRoomPoint.y * nextZoom;
    updateViewportTransform();
  }
  function finalizePinchGesture(gesture) {
    state.zoom = gesture.currentZoom;
    setupCanvas();
    render();
  }
  function panViewportFromTouch(currentPoint, gesture) {
    viewportPan.x = gesture.startPan.x + currentPoint.x - gesture.startClientPoint.x;
    viewportPan.y = gesture.startPan.y + currentPoint.y - gesture.startClientPoint.y;
    updateViewportTransform();
  }
  function moveGridFromTouch(currentPoint, gesture) {
    state.offsetXInches = roundToHalfInch(gesture.startOffsetXInches + (currentPoint.x - gesture.startClientPoint.x) / (SCALE * state.zoom));
    state.offsetYInches = roundToHalfInch(gesture.startOffsetYInches + (currentPoint.y - gesture.startClientPoint.y) / (SCALE * state.zoom));
    showGestureBadge(grabDeltaText(state.offsetXInches - gesture.startOffsetXInches, state.offsetYInches - gesture.startOffsetYInches));
    updateUrl(state);
    render();
  }
  function clientPoint(event) {
    return { x: event.clientX, y: event.clientY };
  }
  function midpoint(first, second) {
    return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
  }
  function distanceBetween2(first, second) {
    return Math.hypot(first.x - second.x, first.y - second.y);
  }
  function handleWheel(event) {
    event.preventDefault();
    const canvasRect = canvas.getBoundingClientRect();
    const workspaceRect = workspace.getBoundingClientRect();
    const anchorX = workspaceRect.left + workspace.clientWidth / 2 - canvasRect.left;
    const anchorY = workspaceRect.top + workspace.clientHeight / 2 - canvasRect.top;
    const previousZoom = state.zoom;
    const nextZoom = normalizeZoom(previousZoom * (event.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR));
    if (nextZoom === previousZoom) {
      return;
    }
    state.zoom = nextZoom;
    setupCanvas();
    render();
    const scale = nextZoom / previousZoom;
    workspace.scrollLeft += anchorX * (scale - 1);
    workspace.scrollTop += anchorY * (scale - 1);
    updateUrl(state);
  }
  function paintFromPointer(event) {
    const point = canvasPoint(state, canvas, event);
    if (!point || !pointInRoom(state, point)) {
      return;
    }
    paintAtPoint(point);
  }
  function paintAtPoint(point) {
    if (!pointInRoom(state, point)) {
      return;
    }
    const cell = cellFromPoint(state, point);
    const key = paintKey(state, point, cell.col, cell.row);
    if (key === lastPaintKey) {
      return;
    }
    lastPaintKey = key;
    if (state.tool === "erase") {
      eraseAt(state, point, cell.col, cell.row);
    } else if (state.tool === "paint" && !state.paintShape) {
      colorOnlyAt(state, point, cell.col, cell.row, state.colorId);
    } else if (state.tool !== "paint" || !state.paintShape) {
      return;
    } else if (state.paintShape === "orthogonalCross" || state.paintShape === "diagonalCross") {
      placeCross(state, cell.col, cell.row, crossKindForPaintShape(state.paintShape), state.colorId);
    } else if (state.paintShape === "star") {
      placeStar(state, cell.col, cell.row, state.colorId);
    } else {
      placeInset(state, point, cell.col, cell.row, state.colorId);
    }
    updateUrl(state);
    render();
  }
  function crossKindForPaintShape(shape) {
    if (state.mode !== "diagonal") {
      return shape;
    }
    return shape === "orthogonalCross" ? "diagonalCross" : "orthogonalCross";
  }
  function pickColorFromPointer(point) {
    const cell = cellFromPoint(state, point);
    const colorId = colorIdAt(state, point, cell.col, cell.row);
    if (!colorId) {
      return;
    }
    selectColor(manufacturerIdForColor(colorId), colorId);
    const label = materialTooltipTextForColor(colorId);
    if (label) {
      showColorToast(label);
    }
    switchToPaintColorOnly();
    syncPaletteState();
    updateUrl(state);
  }
  function manufacturerIdForColor(colorId) {
    return MANUFACTURERS.find((manufacturer) => manufacturer.colors.some((color) => color.id === colorId))?.id ?? state.manufacturerId;
  }
  function updateCanvasCursor(point) {
    if (dragInteraction?.type === "grab") {
      canvas.style.cursor = "grabbing";
      return;
    }
    if (dragInteraction?.type === "resizeRoom") {
      canvas.style.cursor = resizeCursor(dragInteraction.handle);
      return;
    }
    const handle = point && pointInRoom(state, point) ? resizeHandleAtPoint(state, point) : void 0;
    if (handle) {
      canvas.style.cursor = resizeCursor(handle);
    } else if (state.tool === "grab") {
      canvas.style.cursor = "grab";
    } else if (state.tool === "colorPicker") {
      canvas.style.cursor = DROPPER_CURSOR;
    } else if (state.tool === "erase") {
      canvas.style.cursor = ERASER_CURSOR;
    } else if (state.tool === "paint" && !state.paintShape) {
      canvas.style.cursor = PAINT_ROLLER_CURSOR;
    } else {
      canvas.style.cursor = "crosshair";
    }
  }
  function resizeCursor(handle) {
    if (handle === "right") {
      return "ew-resize";
    }
    if (handle === "bottom") {
      return "ns-resize";
    }
    return "nwse-resize";
  }
  function showGestureBadge(text) {
    const workspaceRect = workspace.getBoundingClientRect();
    gestureBadge.textContent = text;
    gestureBadge.style.left = `${workspaceRect.left + workspaceRect.width / 2}px`;
    gestureBadge.style.top = `${visualViewportTop() + 14}px`;
    gestureBadge.classList.add("is-visible");
  }
  function hideGestureBadge() {
    gestureBadge.classList.remove("is-visible");
  }
  function grabDeltaText(deltaX, deltaY) {
    const parts = [];
    if (deltaX !== 0) {
      parts.push(`${formatInches(Math.abs(deltaX))} ${deltaX > 0 ? "right" : "left"}`);
    }
    if (deltaY !== 0) {
      parts.push(`${formatInches(Math.abs(deltaY))} ${deltaY > 0 ? "down" : "up"}`);
    }
    return parts.length > 0 ? `Moved ${parts.join(", ")}` : 'Moved 0"';
  }
  function formatInches(value) {
    return Number.isInteger(value) ? `${value}"` : `${value.toFixed(1).replace(/\\.0$/, "")}"`;
  }
  function visualViewportTop() {
    return window.visualViewport?.offsetTop ?? 0;
  }
  function moveGridFromPointer(event, interaction) {
    state.offsetXInches = roundToHalfInch(interaction.startOffsetXInches + (event.clientX - interaction.startPoint.x) / (SCALE * state.zoom));
    state.offsetYInches = roundToHalfInch(interaction.startOffsetYInches + (event.clientY - interaction.startPoint.y) / (SCALE * state.zoom));
    updateUrl(state);
    render();
  }
  function resizeRoomFromPointer(event, interaction) {
    if (interaction.handle === "right" || interaction.handle === "corner") {
      state.roomWidthInches = clamp(
        Math.round(interaction.startWidthInches + (event.clientX - interaction.startClientPoint.x) / (SCALE * state.zoom)),
        24,
        180
      );
    }
    if (interaction.handle === "bottom" || interaction.handle === "corner") {
      state.roomHeightInches = clamp(
        Math.round(interaction.startHeightInches + (event.clientY - interaction.startClientPoint.y) / (SCALE * state.zoom)),
        24,
        240
      );
    }
    syncSpecs();
    setupCanvas();
    updateUrl(state);
    render();
  }
  function render() {
    renderReadyFrame += 1;
    const frame = renderReadyFrame;
    lastConflictSignature = renderConflictReport(state, layoutErrors, lastConflictSignature);
    draw(state, ctx, canvas);
    markRenderReady(canvas, frame, () => renderReadyFrame);
  }
})();
