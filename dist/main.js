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
  var URL_VERSION = "1";
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
  function baseDrawPx(state2) {
    return Math.max(1, tilePx(state2) - groutPx(state2));
  }
  function groutPx(state2) {
    return Math.max(1, state2.groutJointSixteenths / 16 * SCALE);
  }
  function tacoSidePx(state2) {
    return Math.max(1, idealTacoSidePx(state2) - groutPx(state2));
  }
  function idealTacoSidePx(state2) {
    return tilePx(state2) / 4;
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
      const midpoint = edgeMidpoint(state2, col, row, side);
      const distance2 = Math.hypot(point.x - midpoint.x, point.y - midpoint.y);
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
    const centerOffset = groutPx(state2) / 2 + tacoSidePx(state2) / 2;
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
    const previous = state2.edgeInsets.get(key);
    const before = conflictSignatureSet(state2);
    state2.edgeInsets.set(key, { colorId });
    if (hasNewConflicts(state2, before)) {
      restoreMapEntry(state2.edgeInsets, key, previous);
    }
  }
  function setCornerInsetIfNoNewConflict(state2, col, row, corner, colorId) {
    const key = cornerKey(col, row, corner);
    const previous = state2.cornerInsets.get(key);
    const before = conflictSignatureSet(state2);
    state2.cornerInsets.set(key, { colorId });
    if (hasNewConflicts(state2, before)) {
      restoreMapEntry(state2.cornerInsets, key, previous);
    }
  }
  function conflictSignatureSet(state2) {
    return new Set(analyzeLayoutConflicts(state2).map((conflict) => `${conflict.code}:${conflict.message}`));
  }
  function hasNewConflicts(state2, before) {
    return analyzeLayoutConflicts(state2).some((conflict) => !before.has(`${conflict.code}:${conflict.message}`));
  }
  function restoreMapEntry(map, key, value) {
    if (value) {
      map.set(key, value);
    } else {
      map.delete(key);
    }
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
    const midpoint = edgeMidpoint(state2, col, row, side);
    const candidateDistance = distance(point, midpoint);
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
    const halfSize = tacoSidePx(state2) / 2;
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
    ctx2.fillStyle = base;
    ctx2.fill();
    ctx2.save();
    ctx2.clip();
    drawClouding(ctx2, color, random, bounds);
    drawGrain(ctx2, color, random, bounds);
    drawStripes(ctx2, color, random, bounds);
    drawChips(ctx2, color, random, bounds);
    drawSheen(ctx2, color, bounds);
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
    const gradient = ctx2.createLinearGradient(bounds.x, bounds.y, bounds.x + bounds.width, bounds.y + bounds.height);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.34, `rgba(255,255,255,${0.04 + color.sheen * 0.12})`);
    gradient.addColorStop(0.47, `rgba(255,255,255,${0.13 + color.sheen * 0.28})`);
    gradient.addColorStop(0.6, `rgba(255,255,255,${0.03 + color.sheen * 0.08})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx2.fillStyle = gradient;
    ctx2.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
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
        drawCrossSilhouette(state2, ctx2, col, row, tile.kind, tilePx(state2), idealTacoHalfDiagonalPx(state2));
      }
    }
  }
  function drawInsetGroutUnderlays(state2, ctx2) {
    for (const [key] of state2.edgeInsets) {
      const edge = parseEdgeKey(key);
      drawEdgeInsetSilhouette(state2, ctx2, edge.col, edge.row, edge.side, idealTacoSidePx(state2));
    }
    for (const [key] of state2.cornerInsets) {
      const corner = parseCornerKey(key);
      drawCornerInsetSilhouette(state2, ctx2, corner.col, corner.row, corner.corner, idealTacoSidePx(state2));
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
    const size = baseDrawPx(state2);
    ctx2.save();
    applyCellTransform(state2, ctx2, col, row);
    if (kind === "orthogonalCross") {
      ctx2.rotate(Math.PI / 4);
    }
    traceDiagonalCrossPath(ctx2, size, tacoHalfDiagonalPx(state2));
    fillMaterialPath(ctx2, colorId, `cross:${kind}:${col}:${row}:${colorId}`, { x: -size / 2, y: -size / 2, width: size, height: size });
    ctx2.restore();
  }
  function drawCrossSilhouette(state2, ctx2, col, row, kind, size, notchHalfDiagonal) {
    ctx2.save();
    applyCellTransform(state2, ctx2, col, row);
    if (kind === "orthogonalCross") {
      ctx2.rotate(Math.PI / 4);
    }
    traceDiagonalCrossPath(ctx2, size, notchHalfDiagonal);
    ctx2.fill();
    ctx2.restore();
  }
  function traceDiagonalCrossPath(ctx2, size, notchHalfDiagonal) {
    const half = size / 2;
    const x = (value) => value * size - half;
    const y = (value) => value * size - half;
    const notch = notchHalfDiagonal / size;
    const mouthStart = 0.5 - notch;
    const mouthEnd = 0.5 + notch;
    const inward = notch;
    const outward = 1 - notch;
    ctx2.beginPath();
    ctx2.moveTo(x(0), y(0));
    ctx2.lineTo(x(mouthStart), y(0));
    ctx2.lineTo(x(0.5), y(inward));
    ctx2.lineTo(x(mouthEnd), y(0));
    ctx2.lineTo(x(1), y(0));
    ctx2.lineTo(x(1), y(mouthStart));
    ctx2.lineTo(x(outward), y(0.5));
    ctx2.lineTo(x(1), y(mouthEnd));
    ctx2.lineTo(x(1), y(1));
    ctx2.lineTo(x(mouthEnd), y(1));
    ctx2.lineTo(x(0.5), y(outward));
    ctx2.lineTo(x(mouthStart), y(1));
    ctx2.lineTo(x(0), y(1));
    ctx2.lineTo(x(0), y(mouthEnd));
    ctx2.lineTo(x(inward), y(0.5));
    ctx2.lineTo(x(0), y(mouthStart));
    ctx2.closePath();
  }
  function drawStar(state2, ctx2, col, row, colorId) {
    const body = baseDrawPx(state2) / 2;
    const point = body + tacoHalfDiagonalPx(state2);
    const pointBase = tacoHalfDiagonalPx(state2);
    ctx2.save();
    applyCellTransform(state2, ctx2, col, row);
    traceStarPath(ctx2, body, point, pointBase);
    fillMaterialPath(ctx2, colorId, `star:${col}:${row}:${colorId}`, { x: -point, y: -point, width: point * 2, height: point * 2 });
    ctx2.restore();
  }
  function drawStarSilhouette(state2, ctx2, col, row, size, pointHalfDiagonal) {
    const body = size / 2;
    const point = body + pointHalfDiagonal;
    ctx2.save();
    applyCellTransform(state2, ctx2, col, row);
    traceStarPath(ctx2, body, point, pointHalfDiagonal);
    ctx2.fill();
    ctx2.restore();
  }
  function traceStarPath(ctx2, body, point, pointBase) {
    ctx2.beginPath();
    ctx2.moveTo(-body, -body);
    ctx2.lineTo(-pointBase, -body);
    ctx2.lineTo(0, -point);
    ctx2.lineTo(pointBase, -body);
    ctx2.lineTo(body, -body);
    ctx2.lineTo(body, -pointBase);
    ctx2.lineTo(point, 0);
    ctx2.lineTo(body, pointBase);
    ctx2.lineTo(body, body);
    ctx2.lineTo(pointBase, body);
    ctx2.lineTo(0, point);
    ctx2.lineTo(-pointBase, body);
    ctx2.lineTo(-body, body);
    ctx2.lineTo(-body, pointBase);
    ctx2.lineTo(-point, 0);
    ctx2.lineTo(-body, -pointBase);
    ctx2.closePath();
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
    const point = edgeMidpoint(state2, col, row, side);
    const size = tacoSidePx(state2);
    ctx2.save();
    ctx2.translate(point.x, point.y);
    ctx2.rotate(layoutRotation(state2) + Math.PI / 4);
    ctx2.beginPath();
    ctx2.rect(-size / 2, -size / 2, size, size);
    fillMaterialPath(ctx2, colorId, `edge:${col}:${row}:${side}:${colorId}`, { x: -size / 2, y: -size / 2, width: size, height: size });
    ctx2.restore();
  }
  function drawEdgeInsetSilhouette(state2, ctx2, col, row, side, size) {
    const point = edgeMidpoint(state2, col, row, side);
    ctx2.save();
    ctx2.translate(point.x, point.y);
    ctx2.rotate(layoutRotation(state2) + Math.PI / 4);
    ctx2.fillRect(-size / 2, -size / 2, size, size);
    ctx2.restore();
  }
  function drawCornerInset(state2, ctx2, col, row, corner, colorId) {
    const size = tacoSidePx(state2);
    const center = cornerInsetCenter(state2, col, row, corner);
    ctx2.save();
    ctx2.translate(center.x, center.y);
    ctx2.rotate(layoutRotation(state2));
    ctx2.beginPath();
    ctx2.rect(-size / 2, -size / 2, size, size);
    fillMaterialPath(ctx2, colorId, `corner:${col}:${row}:${corner}:${colorId}`, { x: -size / 2, y: -size / 2, width: size, height: size });
    ctx2.restore();
  }
  function drawCornerInsetSilhouette(state2, ctx2, col, row, corner, size) {
    const center = cornerInsetCenter(state2, col, row, corner);
    ctx2.save();
    ctx2.translate(center.x, center.y);
    ctx2.rotate(layoutRotation(state2));
    ctx2.fillRect(-size / 2, -size / 2, size, size);
    ctx2.restore();
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
  function applyCellTransform(state2, ctx2, col, row) {
    const center = cellLocalToScreen(state2, col, row, 0, 0);
    ctx2.translate(center.x, center.y);
    ctx2.rotate(layoutRotation(state2));
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
  function loadState(workspace2) {
    const params = new URLSearchParams(window.location.search);
    const next = cloneDefaultState();
    next.mode = validMode(params.get("m")) ?? next.mode;
    next.showGrid = params.get("g") === "1";
    next.roomWidthInches = validRoomWidth(params.get("rw")) ?? next.roomWidthInches;
    next.roomHeightInches = validRoomHeight(params.get("rh")) ?? next.roomHeightInches;
    next.tileInches = validTileInches(params.get("ts")) ?? next.tileInches;
    next.offsetXInches = validHalfInch(params.get("ox")) ?? next.offsetXInches;
    next.offsetYInches = validHalfInch(params.get("oy")) ?? next.offsetYInches;
    next.groutColorId = validGroutColor(params.get("gc")) ?? next.groutColorId;
    next.groutJointSixteenths = validGroutJoint(params.get("gj")) ?? next.groutJointSixteenths;
    const parsedTool = validTool(params.get("tl"));
    if (parsedTool) {
      next.tool = parsedTool;
      next.paintShape = parsedTool === "paint" && !params.has("ps") ? void 0 : next.paintShape;
    }
    next.paintShape = validPaintShape(params.get("ps")) ?? next.paintShape;
    if (next.tool !== "paint") {
      next.paintShape = void 0;
    }
    next.manufacturerId = validManufacturer(params.get("mf")) ?? next.manufacturerId;
    next.colorId = validColor(next.manufacturerId, params.get("c")) ?? next.colorId;
    const layout = params.get("l");
    if (layout) {
      parseLayout(layout, next);
    }
    next.zoom = initialZoomForRoom(workspace2, next.roomWidthInches, next.roomHeightInches);
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
  function parseLayout(layout, next) {
    const decoded = decodeURIComponent(layout);
    if (!decoded) {
      return;
    }
    for (const item of decoded.split(";")) {
      const parts = item.split(",");
      if (parts[0] === "t" && parts.length === 5) {
        const col = Number(parts[1]);
        const row = Number(parts[2]);
        const kind = parseTileKind(parts[3]);
        const colorId = parts[4];
        if (Number.isInteger(col) && Number.isInteger(row) && kind) {
          next.cells.set(cellKey(col, row), { kind, colorId });
        }
      } else if (parts[0] === "e" && parts.length === 5) {
        const col = Number(parts[1]);
        const row = Number(parts[2]);
        const side = parts[3];
        const colorId = parts[4];
        if (Number.isInteger(col) && Number.isInteger(row) && validSide(side)) {
          next.edgeInsets.set(canonicalEdgeKey(col, row, side), { colorId });
        }
      } else if (parts[0] === "k" && parts.length === 5) {
        const col = Number(parts[1]);
        const row = Number(parts[2]);
        const corner = parts[3];
        const colorId = parts[4];
        if (Number.isInteger(col) && Number.isInteger(row) && validCorner(corner)) {
          next.cornerInsets.set(cornerKey(col, row, corner), { colorId });
        }
      }
    }
  }
  function updateUrl(state2) {
    const params = new URLSearchParams();
    params.set("v", URL_VERSION);
    params.set("m", state2.mode);
    if (state2.showGrid) {
      params.set("g", "1");
    }
    params.set("rw", String(state2.roomWidthInches));
    params.set("rh", String(state2.roomHeightInches));
    params.set("ts", String(state2.tileInches));
    params.set("ox", String(state2.offsetXInches));
    params.set("oy", String(state2.offsetYInches));
    params.set("gc", state2.groutColorId);
    params.set("gj", String(state2.groutJointSixteenths));
    params.set("tl", state2.tool);
    if (state2.tool === "paint" && state2.paintShape) {
      params.set("ps", state2.paintShape);
    }
    params.set("mf", state2.manufacturerId);
    params.set("c", state2.colorId);
    const layout = serializeLayout(state2);
    if (layout) {
      params.set("l", layout);
    }
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  }
  function serializeLayout(state2) {
    const items = [];
    for (const [key, tile] of state2.cells) {
      const { col, row } = parseCellKey(key);
      items.push(["t", col, row, tile.kind, tile.colorId].join(","));
    }
    for (const [key, inset] of state2.edgeInsets) {
      const edge = parseEdgeKey(key);
      items.push(["e", edge.col, edge.row, edge.side, inset.colorId].join(","));
    }
    for (const [key, inset] of state2.cornerInsets) {
      const corner = parseCornerKey(key);
      items.push(["k", corner.col, corner.row, corner.corner, inset.colorId].join(","));
    }
    return items.join(";");
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
  function validMode(value) {
    return value === "straight" || value === "diagonal" ? value : void 0;
  }
  function validTool(value) {
    return value === "paint" || value === "grab" || value === "erase" || value === "colorPicker" ? value : void 0;
  }
  function validPaintShape(value) {
    return value === "orthogonalCross" || value === "diagonalCross" || value === "star" || value === "inset" ? value : void 0;
  }
  function parseTileKind(value) {
    if (value === "orthogonalCross" || value === "diagonalCross" || value === "star") {
      return value;
    }
    return void 0;
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
  var modeInputs = Array.from(document.querySelectorAll("input[name='mode']"));
  var gridLayerInputs = Array.from(document.querySelectorAll("input[name='grid-layer']"));
  var tileSizeInputs = Array.from(document.querySelectorAll("input[name='tile-size']"));
  var roomSpec = requiredElement(document.querySelector("#room-spec"), "room spec");
  var paintShapeInputs = Array.from(document.querySelectorAll("input[name='paint-shape']"));
  var toolInputs = Array.from(document.querySelectorAll("input[name='tool']"));
  var colorPickerTool = requiredElement(document.querySelector("#color-picker-tool"), "color picker tool");
  var tooltipControls = Array.from(document.querySelectorAll(".tool-button, .icon-button, #color-picker-tool"));
  var materialToolIcons = Array.from(document.querySelectorAll(".material-tool-icon"));
  var palette = requiredElement(document.querySelector("#palette"), "palette");
  var groutPalette = requiredElement(document.querySelector("#grout-palette"), "grout palette");
  var groutJointInputs = Array.from(document.querySelectorAll("input[name='grout-joint']"));
  var clearButton = requiredElement(document.querySelector("#clear"), "clear button");
  var layoutErrors = requiredElement(document.querySelector("#layout-errors"), "layout error panel");
  var ctx = requiredElement(canvas.getContext("2d"), "canvas 2D context");
  var swatchTooltip = document.createElement("div");
  swatchTooltip.className = "swatch-tooltip";
  document.body.append(swatchTooltip);
  var state = loadState(workspace);
  var dragInteraction;
  var lastPaintKey = "";
  var lastConflictSignature = "";
  var renderReadyFrame = 0;
  var materialSwatchCache = /* @__PURE__ */ new Map();
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
  setupCanvas();
  setupControls();
  syncControls();
  render();
  function setupCanvas() {
    const deviceRatio = window.devicePixelRatio || 1;
    const room = roomPx(state);
    canvas.width = Math.round(room.width * deviceRatio);
    canvas.height = Math.round(room.height * deviceRatio);
    canvas.style.width = `${room.width * state.zoom}px`;
    canvas.style.height = `${room.height * state.zoom}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(deviceRatio, deviceRatio);
    updateCanvasCursor();
  }
  function requiredElement(element, label) {
    if (!element) {
      throw new Error(`Missing required ${label}.`);
    }
    return element;
  }
  function svgCursor(svg, hotspotX, hotspotY, fallback) {
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspotX} ${hotspotY}, ${fallback}`;
  }
  function setupControls() {
    tooltipControls.forEach(attachSwatchTooltip);
    modeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          state.mode = input.value;
          updateUrl(state);
          render();
        }
      });
    });
    gridLayerInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          state.showGrid = input.value === "top";
          updateUrl(state);
          render();
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
        }
      });
    });
    paintShapeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          state.tool = "paint";
          state.paintShape = input.value;
          syncInteractionControls();
          updateUrl(state);
          updateCanvasCursor();
          syncPaletteState();
        }
      });
    });
    toolInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          state.tool = input.value;
          state.paintShape = void 0;
          syncInteractionControls();
          updateUrl(state);
          updateCanvasCursor();
          syncPaletteState();
        }
      });
    });
    colorPickerTool.addEventListener("click", () => {
      state.tool = "colorPicker";
      state.paintShape = void 0;
      syncInteractionControls();
      syncPaletteState();
      updateUrl(state);
      updateCanvasCursor();
    });
    groutJointInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          state.groutJointSixteenths = validGroutJoint(input.value) ?? state.groutJointSixteenths;
          updateUrl(state);
          render();
        }
      });
    });
    clearButton.addEventListener("click", () => {
      state.cells.clear();
      state.edgeInsets.clear();
      state.cornerInsets.clear();
      updateUrl(state);
      render();
    });
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerCancel);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("wheel", handleWheel, { passive: false });
  }
  function syncControls() {
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
  }
  function syncInteractionControls() {
    paintShapeInputs.forEach((input) => {
      input.checked = state.tool === "paint" && input.value === state.paintShape;
    });
    toolInputs.forEach((input) => {
      input.checked = input.value === state.tool;
    });
  }
  function syncSpecs() {
    roomSpec.textContent = `${state.roomWidthInches}" x ${state.roomHeightInches}"`;
  }
  function renderPalette() {
    palette.innerHTML = "";
    palette.classList.toggle("is-picking", state.tool === "colorPicker");
    colorPickerTool.setAttribute("aria-pressed", String(state.tool === "colorPicker"));
    for (const manufacturer of MANUFACTURERS) {
      const marker = document.createElement("div");
      marker.className = "palette-manufacturer";
      marker.dataset.tooltip = manufacturer.name;
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
          selectColor(manufacturer.id, color.id);
          if (state.tool !== "paint" || !state.paintShape) {
            switchToPaintColorOnly();
          }
          syncInteractionControls();
          syncPaletteState();
          updateUrl(state);
          updateCanvasCursor();
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
  }
  function renderToolIcons() {
    for (const icon of materialToolIcons) {
      const shape = icon.dataset.toolShape;
      if (!shape) {
        continue;
      }
      const iconCtx = requiredElement(icon.getContext("2d"), "tool icon canvas context");
      iconCtx.clearRect(0, 0, icon.width, icon.height);
      traceToolIconPath(iconCtx, shape);
      fillMaterialPath(iconCtx, state.colorId, `tool-icon:${shape}:${state.colorId}`, { x: 0, y: 0, width: icon.width, height: icon.height });
      traceToolIconPath(iconCtx, shape);
      iconCtx.lineWidth = 2;
      iconCtx.strokeStyle = "#050505";
      iconCtx.stroke();
    }
  }
  function traceToolIconPath(ctx2, shape) {
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
    } else {
      tracePolygon(ctx2, [
        [50, 14],
        [86, 50],
        [50, 86],
        [14, 50]
      ]);
    }
  }
  function tracePolygon(ctx2, points) {
    const [first, ...rest] = points;
    ctx2.moveTo(first[0], first[1]);
    for (const point of rest) {
      ctx2.lineTo(point[0], point[1]);
    }
    ctx2.closePath();
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
        updateUrl(state);
        render();
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
  }
  function handlePointerDown(event) {
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
    lastPaintKey = "";
    if (dragInteraction?.pointerId === event.pointerId) {
      dragInteraction = void 0;
      updateUrl(state);
      updateCanvasCursor(canvasPoint(state, canvas, event));
    }
    canvas.releasePointerCapture(event.pointerId);
  }
  function handlePointerCancel(event) {
    lastPaintKey = "";
    if (dragInteraction?.pointerId === event.pointerId) {
      dragInteraction = void 0;
      updateCanvasCursor();
    }
    hideSwatchTooltip();
  }
  function handlePointerLeave(event) {
    if (!dragInteraction) {
      updateCanvasCursor(canvasPoint(state, canvas, event));
    }
    hideSwatchTooltip();
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
      placeCross(state, cell.col, cell.row, state.paintShape, state.colorId);
    } else if (state.paintShape === "star") {
      placeStar(state, cell.col, cell.row, state.colorId);
    } else {
      placeInset(state, point, cell.col, cell.row, state.colorId);
    }
    updateUrl(state);
    render();
  }
  function pickColorFromPointer(point) {
    const cell = cellFromPoint(state, point);
    const colorId = colorIdAt(state, point, cell.col, cell.row);
    if (!colorId) {
      return;
    }
    selectColor(manufacturerIdForColor(colorId), colorId);
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
