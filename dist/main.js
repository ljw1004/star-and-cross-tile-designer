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
  var MAX_ZOOM = 3;
  var ZOOM_FACTOR = 1.12;
  var SCALE = 8;
  var GROUT_PX = 3;
  var HALF_GROUT_PX = GROUT_PX / 2;
  var URL_VERSION = "1";
  var SIDES = ["n", "e", "s", "w"];
  var CORNERS = ["nw", "ne", "se", "sw"];
  var MANUFACTURERS = [
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
        { id: "grass", name: "Blue Grass", value: "#536f84" }
      ]
    }
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
    brush: "orthogonalCross",
    manufacturerId: "dummy",
    colorId: "bone",
    cells: /* @__PURE__ */ new Map(),
    edgeInsets: /* @__PURE__ */ new Map(),
    cornerInsets: /* @__PURE__ */ new Map()
  };

  // src/color.ts
  function currentManufacturer(state2) {
    return MANUFACTURERS.find((manufacturer) => manufacturer.id === state2.manufacturerId) ?? MANUFACTURERS[0];
  }
  function colorValue(colorId) {
    for (const manufacturer of MANUFACTURERS) {
      const color = manufacturer.colors.find((candidate) => candidate.id === colorId);
      if (color) {
        return color.value;
      }
    }
    return MANUFACTURERS[0].colors[0].value;
  }
  function darken(hex, amount) {
    const normalized = hex.replace("#", "");
    const value = Number.parseInt(normalized, 16);
    const r = Math.max(0, (value >> 16 & 255) - amount);
    const g = Math.max(0, (value >> 8 & 255) - amount);
    const b = Math.max(0, (value & 255) - amount);
    return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  }
  function outlineColor(hex) {
    return darken(hex, 34);
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
    return Math.max(1, tilePx(state2) - GROUT_PX);
  }
  function tacoSidePx(state2) {
    return baseDrawPx(state2) / 4;
  }
  function tacoHalfDiagonalPx(state2) {
    return tacoSidePx(state2) / Math.SQRT2;
  }
  function crossNotchMouth(state2) {
    return tacoHalfDiagonalPx(state2) / baseDrawPx(state2);
  }
  function crossNotchDepth(state2) {
    return tacoHalfDiagonalPx(state2) / baseDrawPx(state2);
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
    const centerOffset = HALF_GROUT_PX + tacoSidePx(state2) / 2;
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
    if (state2.brush === "erase") {
      return `erase:${elementKeyAtPoint(state2, point, col, row)}`;
    }
    if (state2.brush === "colorOnly") {
      return `color:${elementKeyAtPoint(state2, point, col, row)}`;
    }
    if (state2.brush !== "inset") {
      return `${state2.brush}:${col},${row}`;
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
      const color = colorValue(tile.colorId);
      if (tile.kind === "orthogonalCross" || tile.kind === "diagonalCross") {
        if (pass !== "cross") {
          continue;
        }
        drawCross(state2, ctx2, col, row, tile.kind, color);
      } else {
        if (pass !== "star") {
          continue;
        }
        drawStar(state2, ctx2, col, row, color);
      }
    }
  }
  function drawCross(state2, ctx2, col, row, kind, color) {
    const size = baseDrawPx(state2);
    ctx2.save();
    applyCellTransform(state2, ctx2, col, row);
    if (kind === "orthogonalCross") {
      ctx2.rotate(Math.PI / 4);
    }
    ctx2.fillStyle = color;
    ctx2.strokeStyle = outlineColor(color);
    ctx2.lineWidth = 1;
    traceDiagonalCrossPath(state2, ctx2, size);
    ctx2.fill();
    ctx2.stroke();
    drawTileHighlight(ctx2, size);
    ctx2.restore();
  }
  function traceDiagonalCrossPath(state2, ctx2, size) {
    const half = size / 2;
    const x = (value) => value * size - half;
    const y = (value) => value * size - half;
    const mouthStart = 0.5 - crossNotchMouth(state2);
    const mouthEnd = 0.5 + crossNotchMouth(state2);
    const inward = crossNotchDepth(state2);
    const outward = 1 - crossNotchDepth(state2);
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
  function drawStar(state2, ctx2, col, row, color) {
    const body = baseDrawPx(state2) / 2;
    const point = body + tacoHalfDiagonalPx(state2);
    const pointBase = tacoHalfDiagonalPx(state2);
    ctx2.save();
    applyCellTransform(state2, ctx2, col, row);
    ctx2.fillStyle = color;
    ctx2.strokeStyle = outlineColor(color);
    ctx2.lineWidth = 1.2;
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
    ctx2.fill();
    ctx2.stroke();
    ctx2.restore();
  }
  function drawInsets(state2, ctx2) {
    for (const [key, inset] of state2.edgeInsets) {
      const edge = parseEdgeKey(key);
      drawEdgeInset(state2, ctx2, edge.col, edge.row, edge.side, colorValue(inset.colorId));
    }
    for (const [key, inset] of state2.cornerInsets) {
      const corner = parseCornerKey(key);
      drawCornerInset(state2, ctx2, corner.col, corner.row, corner.corner, colorValue(inset.colorId));
    }
  }
  function drawEdgeInset(state2, ctx2, col, row, side, color) {
    const point = edgeMidpoint(state2, col, row, side);
    const size = tacoSidePx(state2);
    ctx2.save();
    ctx2.translate(point.x, point.y);
    ctx2.rotate(layoutRotation(state2) + Math.PI / 4);
    ctx2.fillStyle = color;
    ctx2.strokeStyle = outlineColor(color);
    ctx2.lineWidth = 1;
    ctx2.fillRect(-size / 2, -size / 2, size, size);
    ctx2.strokeRect(-size / 2, -size / 2, size, size);
    ctx2.restore();
  }
  function drawCornerInset(state2, ctx2, col, row, corner, color) {
    const size = tacoSidePx(state2);
    const center = cornerInsetCenter(state2, col, row, corner);
    ctx2.save();
    ctx2.translate(center.x, center.y);
    ctx2.rotate(layoutRotation(state2));
    ctx2.fillStyle = color;
    ctx2.strokeStyle = outlineColor(color);
    ctx2.lineWidth = 1;
    ctx2.fillRect(-size / 2, -size / 2, size, size);
    ctx2.strokeRect(-size / 2, -size / 2, size, size);
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
  function drawTileHighlight(ctx2, size) {
    const half = size / 2;
    ctx2.save();
    ctx2.globalAlpha = 0.18;
    ctx2.strokeStyle = "#ffffff";
    ctx2.lineWidth = 1;
    ctx2.beginPath();
    ctx2.moveTo(-half + size * 0.18, -half + size * 0.16);
    ctx2.lineTo(-half + size * 0.72, -half + size * 0.16);
    ctx2.stroke();
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
    next.brush = validBrush(params.get("b")) ?? next.brush;
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
      brush: DEFAULT_STATE.brush,
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
    params.set("b", state2.brush);
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
  function validMode(value) {
    return value === "straight" || value === "diagonal" ? value : void 0;
  }
  function validBrush(value) {
    return value === "orthogonalCross" || value === "diagonalCross" || value === "star" || value === "inset" || value === "colorOnly" || value === "grab" || value === "erase" ? value : void 0;
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
  var showGridInput = requiredElement(document.querySelector("#show-grid"), "show grid checkbox");
  var tileSizeSelect = requiredElement(document.querySelector("#tile-size"), "tile size select");
  var roomSpec = requiredElement(document.querySelector("#room-spec"), "room spec");
  var brushInputs = Array.from(document.querySelectorAll("input[name='brush']"));
  var manufacturerSelect = requiredElement(document.querySelector("#manufacturer"), "manufacturer select");
  var palette = requiredElement(document.querySelector("#palette"), "palette");
  var clearButton = requiredElement(document.querySelector("#clear"), "clear button");
  var layoutErrors = requiredElement(document.querySelector("#layout-errors"), "layout error panel");
  var ctx = requiredElement(canvas.getContext("2d"), "canvas 2D context");
  var state = loadState(workspace);
  var dragInteraction;
  var lastPaintKey = "";
  var lastConflictSignature = "";
  var renderReadyFrame = 0;
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
  function setupControls() {
    for (const manufacturer of MANUFACTURERS) {
      const option = document.createElement("option");
      option.value = manufacturer.id;
      option.textContent = manufacturer.name;
      manufacturerSelect.append(option);
    }
    modeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          state.mode = input.value;
          updateUrl(state);
          render();
        }
      });
    });
    showGridInput.addEventListener("change", () => {
      state.showGrid = showGridInput.checked;
      updateUrl(state);
      render();
    });
    tileSizeSelect.addEventListener("change", () => {
      state.tileInches = validTileInches(tileSizeSelect.value) ?? state.tileInches;
      syncSpecs();
      updateUrl(state);
      render();
    });
    brushInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          state.brush = input.value;
          updateUrl(state);
          updateCanvasCursor();
        }
      });
    });
    manufacturerSelect.addEventListener("change", () => {
      state.manufacturerId = manufacturerSelect.value;
      state.colorId = currentManufacturer(state).colors[0]?.id ?? "bone";
      renderPalette();
      updateUrl(state);
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
    showGridInput.checked = state.showGrid;
    tileSizeSelect.value = String(state.tileInches);
    brushInputs.forEach((input) => {
      input.checked = input.value === state.brush;
    });
    manufacturerSelect.value = state.manufacturerId;
    renderPalette();
    syncSpecs();
    updateCanvasCursor();
  }
  function syncSpecs() {
    roomSpec.textContent = `${state.roomWidthInches}" x ${state.roomHeightInches}"`;
  }
  function renderPalette() {
    palette.innerHTML = "";
    for (const color of currentManufacturer(state).colors) {
      const swatch = document.createElement("button");
      swatch.className = "swatch";
      swatch.type = "button";
      swatch.style.background = color.value;
      swatch.title = color.name;
      swatch.setAttribute("aria-label", color.name);
      swatch.setAttribute("aria-pressed", String(color.id === state.colorId));
      swatch.addEventListener("click", () => {
        state.colorId = color.id;
        renderPalette();
        updateUrl(state);
      });
      palette.append(swatch);
    }
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
    if (state.brush === "grab") {
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
    dragInteraction = { type: "paint", pointerId: event.pointerId };
    paintFromPointer(event);
  }
  function handlePointerMove(event) {
    if (!dragInteraction) {
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
  }
  function handlePointerLeave(event) {
    if (!dragInteraction) {
      updateCanvasCursor(canvasPoint(state, canvas, event));
    }
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
    if (state.brush === "erase") {
      eraseAt(state, point, cell.col, cell.row);
    } else if (state.brush === "colorOnly") {
      colorOnlyAt(state, point, cell.col, cell.row, state.colorId);
    } else if (state.brush === "orthogonalCross" || state.brush === "diagonalCross") {
      placeCross(state, cell.col, cell.row, state.brush, state.colorId);
    } else if (state.brush === "star") {
      placeStar(state, cell.col, cell.row, state.colorId);
    } else {
      placeInset(state, point, cell.col, cell.row, state.colorId);
    }
    updateUrl(state);
    render();
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
    } else if (state.brush === "grab") {
      canvas.style.cursor = "grab";
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
