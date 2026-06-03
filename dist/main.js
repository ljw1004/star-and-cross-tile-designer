"use strict";
const ROOM_INCHES = { width: 60, height: 96 };
const TILE_INCHES = 8;
const SCALE = 8;
const ROOM_PX = {
    width: ROOM_INCHES.width * SCALE,
    height: ROOM_INCHES.height * SCALE,
};
const ROOM_CENTER = { x: ROOM_PX.width / 2, y: ROOM_PX.height / 2 };
const TILE_PX = TILE_INCHES * SCALE;
const GROUT_PX = 3;
const HALF_GROUT_PX = GROUT_PX / 2;
const BASE_DRAW_PX = TILE_PX - GROUT_PX;
const TACO_SIDE_PX = BASE_DRAW_PX / 4;
const TACO_HALF_DIAGONAL_PX = TACO_SIDE_PX / Math.SQRT2;
const CROSS_NOTCH_MOUTH = TACO_HALF_DIAGONAL_PX / BASE_DRAW_PX;
const CROSS_NOTCH_DEPTH = TACO_HALF_DIAGONAL_PX / BASE_DRAW_PX;
const URL_VERSION = "1";
const SIDES = ["n", "e", "s", "w"];
const CORNERS = ["nw", "ne", "se", "sw"];
const MANUFACTURERS = [
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
const DEFAULT_STATE = {
    mode: "straight",
    showGrid: false,
    brush: "orthogonalCross",
    manufacturerId: "dummy",
    colorId: "bone",
    cells: new Map(),
    edgeInsets: new Map(),
    cornerInsets: new Map(),
};
const canvas = requiredElement(document.querySelector("#room"), "room canvas");
const modeInputs = Array.from(document.querySelectorAll("input[name='mode']"));
const showGridInput = requiredElement(document.querySelector("#show-grid"), "show grid checkbox");
const brushInputs = Array.from(document.querySelectorAll("input[name='brush']"));
const manufacturerSelect = requiredElement(document.querySelector("#manufacturer"), "manufacturer select");
const palette = requiredElement(document.querySelector("#palette"), "palette");
const clearButton = requiredElement(document.querySelector("#clear"), "clear button");
const layoutErrors = requiredElement(document.querySelector("#layout-errors"), "layout error panel");
const ctx = requiredElement(canvas.getContext("2d"), "canvas 2D context");
let state = loadState();
let isPainting = false;
let lastPaintKey = "";
let lastConflictSignature = "";
setupCanvas();
setupControls();
syncControls();
draw();
function setupCanvas() {
    const deviceRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(ROOM_PX.width * deviceRatio);
    canvas.height = Math.round(ROOM_PX.height * deviceRatio);
    canvas.style.width = `${ROOM_PX.width}px`;
    canvas.style.height = `${ROOM_PX.height}px`;
    ctx.scale(deviceRatio, deviceRatio);
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
                updateUrl();
                draw();
            }
        });
    });
    showGridInput.addEventListener("change", () => {
        state.showGrid = showGridInput.checked;
        updateUrl();
        draw();
    });
    brushInputs.forEach((input) => {
        input.addEventListener("change", () => {
            if (input.checked) {
                state.brush = input.value;
                updateUrl();
            }
        });
    });
    manufacturerSelect.addEventListener("change", () => {
        state.manufacturerId = manufacturerSelect.value;
        state.colorId = currentManufacturer().colors[0]?.id ?? "bone";
        renderPalette();
        updateUrl();
    });
    clearButton.addEventListener("click", () => {
        state.cells.clear();
        state.edgeInsets.clear();
        state.cornerInsets.clear();
        updateUrl();
        draw();
    });
    canvas.addEventListener("pointerdown", (event) => {
        isPainting = true;
        lastPaintKey = "";
        canvas.setPointerCapture(event.pointerId);
        paintFromPointer(event);
    });
    canvas.addEventListener("pointermove", (event) => {
        if (isPainting) {
            paintFromPointer(event);
        }
    });
    canvas.addEventListener("pointerup", (event) => {
        isPainting = false;
        lastPaintKey = "";
        canvas.releasePointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointerleave", () => {
        isPainting = false;
        lastPaintKey = "";
    });
}
function syncControls() {
    modeInputs.forEach((input) => {
        input.checked = input.value === state.mode;
    });
    showGridInput.checked = state.showGrid;
    brushInputs.forEach((input) => {
        input.checked = input.value === state.brush;
    });
    manufacturerSelect.value = state.manufacturerId;
    renderPalette();
}
function renderPalette() {
    palette.innerHTML = "";
    for (const color of currentManufacturer().colors) {
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
            updateUrl();
        });
        palette.append(swatch);
    }
}
function paintFromPointer(event) {
    const point = canvasPoint(event);
    if (!point || point.x < 0 || point.y < 0 || point.x >= ROOM_PX.width || point.y >= ROOM_PX.height) {
        return;
    }
    const cell = cellFromPoint(point);
    const key = paintKey(point, cell.col, cell.row);
    if (key === lastPaintKey) {
        return;
    }
    lastPaintKey = key;
    if (state.brush === "erase") {
        eraseAt(point, cell.col, cell.row);
    }
    else if (state.brush === "colorOnly") {
        colorOnlyAt(point, cell.col, cell.row, state.colorId);
    }
    else if (state.brush === "orthogonalCross" || state.brush === "diagonalCross") {
        placeCross(cell.col, cell.row, state.brush, state.colorId);
    }
    else if (state.brush === "star") {
        placeStar(cell.col, cell.row, state.colorId);
    }
    else {
        placeInset(point, cell.col, cell.row, state.colorId);
    }
    updateUrl();
    draw();
}
function paintKey(point, col, row) {
    if (state.brush === "erase") {
        return `erase:${elementKeyAtPoint(point, col, row)}`;
    }
    if (state.brush === "colorOnly") {
        return `color:${elementKeyAtPoint(point, col, row)}`;
    }
    if (state.brush !== "inset") {
        return `${state.brush}:${col},${row}`;
    }
    const target = nearestTacoTarget(point, col, row);
    return `${target.type}:${target.key}`;
}
function placeCross(col, row, kind, colorId) {
    state.cells.set(cellKey(col, row), { kind, colorId });
    fixCrossConflicts(col, row, kind);
    placeCompatibleTacosForCross(col, row, kind, colorId);
}
function fixCrossConflicts(col, row, kind) {
    if (kind === "diagonalCross") {
        removeCornerInsets(col, row);
        return;
    }
    for (const side of SIDES) {
        removeEdgeInset(col, row, side);
    }
    for (const neighbor of neighbors(col, row)) {
        const tile = state.cells.get(cellKey(neighbor.col, neighbor.row));
        if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
            replaceWithDiagonalCross(neighbor.col, neighbor.row);
        }
    }
}
function placeCompatibleTacosForCross(col, row, kind, colorId) {
    if (kind === "diagonalCross") {
        for (const side of SIDES) {
            setEdgeInsetIfNoNewConflict(col, row, side, colorId);
        }
        return;
    }
    for (const corner of CORNERS) {
        setCornerInsetIfNoNewConflict(col, row, corner, colorId);
    }
}
function setEdgeInsetIfNoNewConflict(col, row, side, colorId) {
    const key = canonicalEdgeKey(col, row, side);
    const previous = state.edgeInsets.get(key);
    const before = conflictSignatureSet();
    state.edgeInsets.set(key, { colorId });
    if (hasNewConflicts(before)) {
        restoreMapEntry(state.edgeInsets, key, previous);
    }
}
function setCornerInsetIfNoNewConflict(col, row, corner, colorId) {
    const key = cornerKey(col, row, corner);
    const previous = state.cornerInsets.get(key);
    const before = conflictSignatureSet();
    state.cornerInsets.set(key, { colorId });
    if (hasNewConflicts(before)) {
        restoreMapEntry(state.cornerInsets, key, previous);
    }
}
function conflictSignatureSet() {
    return new Set(analyzeLayoutConflicts().map((conflict) => `${conflict.code}:${conflict.message}`));
}
function hasNewConflicts(before) {
    return analyzeLayoutConflicts().some((conflict) => !before.has(`${conflict.code}:${conflict.message}`));
}
function restoreMapEntry(map, key, value) {
    if (value) {
        map.set(key, value);
    }
    else {
        map.delete(key);
    }
}
function replaceWithDiagonalCross(col, row) {
    const key = cellKey(col, row);
    const tile = state.cells.get(key);
    if (!tile) {
        return;
    }
    state.cells.set(key, { kind: "diagonalCross", colorId: tile.colorId });
    removeCornerInsets(col, row);
    placeCompatibleTacosForCross(col, row, "diagonalCross", tile.colorId);
}
function eraseAt(point, col, row) {
    const taco = nearestTacoHit(point, col, row);
    if (taco) {
        deleteTaco(taco);
        return;
    }
    const key = cellKey(col, row);
    const tile = state.cells.get(key);
    state.cells.delete(key);
    if (tile?.kind === "diagonalCross") {
        pruneEdgeInsetsWithoutAdjacentDiagonalCross();
    }
    else if (tile?.kind === "orthogonalCross") {
        removeCornerInsets(col, row);
    }
}
function colorOnlyAt(point, col, row, colorId) {
    const taco = nearestTacoHit(point, col, row);
    if (taco) {
        colorTaco(taco, colorId);
        return;
    }
    const key = cellKey(col, row);
    const tile = state.cells.get(key);
    if (tile) {
        state.cells.set(key, { ...tile, colorId });
    }
}
function elementKeyAtPoint(point, col, row) {
    const taco = nearestTacoHit(point, col, row);
    if (taco) {
        return `${taco.type}:${taco.key}`;
    }
    return `tile:${col},${row}`;
}
function nearestTacoHit(point, col, row) {
    const candidates = [];
    for (const side of SIDES) {
        const key = canonicalEdgeKey(col, row, side);
        if (state.edgeInsets.has(key)) {
            candidates.push(edgeEraseCandidate(point, key, col, row, side));
        }
        const adjacent = neighborForSide(col, row, side);
        if (adjacent) {
            const adjacentSide = oppositeSide(side);
            const adjacentKey = canonicalEdgeKey(adjacent.col, adjacent.row, adjacentSide);
            if (state.edgeInsets.has(adjacentKey)) {
                candidates.push(edgeEraseCandidate(point, adjacentKey, adjacent.col, adjacent.row, adjacentSide));
            }
        }
    }
    for (const corner of CORNERS) {
        const key = cornerKey(col, row, corner);
        if (state.cornerInsets.has(key)) {
            candidates.push(cornerEraseCandidate(point, key, col, row, corner));
        }
    }
    return candidates.filter((candidate) => candidate.hit).sort((a, b) => a.distance - b.distance)[0];
}
function deleteTaco(taco) {
    if (taco.type === "edge") {
        state.edgeInsets.delete(taco.key);
    }
    else {
        state.cornerInsets.delete(taco.key);
    }
}
function colorTaco(taco, colorId) {
    if (taco.type === "edge") {
        state.edgeInsets.set(taco.key, { colorId });
    }
    else {
        state.cornerInsets.set(taco.key, { colorId });
    }
}
function pruneEdgeInsetsWithoutAdjacentDiagonalCross() {
    for (const key of Array.from(state.edgeInsets.keys())) {
        const edge = parseEdgeKey(key);
        const hasAdjacentDiagonalCross = cellsForEdge(edge.col, edge.row, edge.side).some((cell) => state.cells.get(cellKey(cell.col, cell.row))?.kind === "diagonalCross");
        if (!hasAdjacentDiagonalCross) {
            state.edgeInsets.delete(key);
        }
    }
}
function edgeEraseCandidate(point, key, col, row, side) {
    const midpoint = edgeMidpoint(col, row, side);
    const candidateDistance = distance(point, midpoint);
    return {
        key,
        type: "edge",
        distance: candidateDistance,
        hit: candidateDistance <= TACO_HALF_DIAGONAL_PX + 2,
    };
}
function cornerEraseCandidate(point, key, col, row, corner) {
    const center = cornerInsetCenter(col, row, corner);
    const dx = Math.abs(point.x - center.x);
    const dy = Math.abs(point.y - center.y);
    const halfSize = TACO_SIDE_PX / 2;
    const margin = 3;
    return {
        key,
        type: "corner",
        distance: distance(point, center),
        hit: dx <= halfSize + margin && dy <= halfSize + margin,
    };
}
function placeStar(col, row, colorId) {
    state.cells.set(cellKey(col, row), { kind: "star", colorId });
    for (const neighbor of neighbors(col, row)) {
        const tile = state.cells.get(cellKey(neighbor.col, neighbor.row));
        if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
            replaceWithDiagonalCross(neighbor.col, neighbor.row);
        }
    }
    for (const side of SIDES) {
        removeEdgeInset(col, row, side);
    }
    removeCornerInsets(col, row);
}
function removeCornerInsets(col, row) {
    state.cornerInsets.delete(cornerKey(col, row, "nw"));
    state.cornerInsets.delete(cornerKey(col, row, "ne"));
    state.cornerInsets.delete(cornerKey(col, row, "se"));
    state.cornerInsets.delete(cornerKey(col, row, "sw"));
}
function removeEdgeInset(col, row, side) {
    state.edgeInsets.delete(canonicalEdgeKey(col, row, side));
}
function placeInset(point, col, row, colorId) {
    const target = nearestTacoTarget(point, col, row);
    if (target.type === "edge") {
        for (const adjacent of cellsForEdge(target.col, target.row, target.side)) {
            replaceTileWithDiagonalCrossIfNeeded(adjacent.col, adjacent.row);
        }
        state.edgeInsets.set(target.key, { colorId });
        return;
    }
    const tile = state.cells.get(cellKey(target.col, target.row));
    if (tile?.kind !== "orthogonalCross") {
        return;
    }
    state.cornerInsets.set(target.key, { colorId });
}
function replaceTileWithDiagonalCrossIfNeeded(col, row) {
    const tile = state.cells.get(cellKey(col, row));
    if (tile?.kind === "star" || tile?.kind === "orthogonalCross") {
        replaceWithDiagonalCross(col, row);
    }
}
function draw() {
    updateConflictReport();
    ctx.clearRect(0, 0, ROOM_PX.width, ROOM_PX.height);
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, ROOM_PX.width, ROOM_PX.height);
    if (!state.showGrid) {
        drawPlaceholderGrid();
    }
    drawPlacedTiles();
    drawInsets();
    if (state.showGrid) {
        drawPlaceholderGrid();
    }
    drawRoomOutline();
}
function updateConflictReport() {
    const conflicts = analyzeLayoutConflicts();
    const signature = conflicts.map((conflict) => `${conflict.code}:${conflict.message}`).join("|");
    if (conflicts.length === 0) {
        layoutErrors.classList.remove("is-visible");
        layoutErrors.textContent = "";
        lastConflictSignature = "";
        return;
    }
    layoutErrors.classList.add("is-visible");
    layoutErrors.innerHTML = [
        "!!! TILE LAYOUT CONFLICTS DETECTED !!!",
        "<ul>",
        ...conflicts.slice(0, 6).map((conflict) => `<li>${escapeHtml(conflict.message)}</li>`),
        conflicts.length > 6 ? `<li>${conflicts.length - 6} more conflict(s)</li>` : "",
        "</ul>",
    ].join("");
    if (signature !== lastConflictSignature) {
        console.error("!!! TILE LAYOUT CONFLICTS DETECTED !!!", conflicts);
        lastConflictSignature = signature;
    }
}
function analyzeLayoutConflicts() {
    const conflicts = [];
    const seen = new Set();
    const add = (code, message) => {
        const key = `${code}:${message}`;
        if (!seen.has(key)) {
            seen.add(key);
            conflicts.push({ code, message });
        }
    };
    for (const [key, tile] of state.cells) {
        if (tile.kind !== "star") {
            continue;
        }
        const { col, row } = parseCellKey(key);
        for (const side of SIDES) {
            const adjacent = neighborForSide(col, row, side);
            const neighbor = state.cells.get(cellKey(adjacent.col, adjacent.row));
            if (neighbor?.kind === "star") {
                add("adjacent-stars", `Star at ${cellLabel(col, row)} touches another star at ${cellLabel(adjacent.col, adjacent.row)}.`);
            }
            else if (neighbor?.kind === "orthogonalCross") {
                add("star-orthogonal-cross", `Star at ${cellLabel(col, row)} collides with orthogonal cross at ${cellLabel(adjacent.col, adjacent.row)}.`);
            }
            if (state.edgeInsets.has(edgeKey(col, row, side)) || state.edgeInsets.has(edgeKey(adjacent.col, adjacent.row, oppositeSide(side)))) {
                add("star-edge-inset", `Star at ${cellLabel(col, row)} shares its ${side} side with a diagonal taco.`);
            }
        }
    }
    for (const [key, tile] of state.cells) {
        if (tile.kind !== "orthogonalCross") {
            continue;
        }
        const { col, row } = parseCellKey(key);
        for (const side of ["e", "s"]) {
            const adjacent = neighborForSide(col, row, side);
            const neighbor = state.cells.get(cellKey(adjacent.col, adjacent.row));
            if (neighbor?.kind === "orthogonalCross") {
                add("adjacent-orthogonal-crosses", `Orthogonal cross at ${cellLabel(col, row)} collides with orthogonal cross at ${cellLabel(adjacent.col, adjacent.row)}.`);
            }
        }
    }
    const canonicalEdges = new Map();
    for (const key of state.edgeInsets.keys()) {
        const edge = parseEdgeKey(key);
        const canonical = canonicalEdgeKey(edge.col, edge.row, edge.side);
        const previous = canonicalEdges.get(canonical);
        if (previous) {
            add("duplicate-edge-inset", `Two diagonal tacos occupy the same edge: ${previous} and ${key}.`);
        }
        else {
            canonicalEdges.set(canonical, key);
        }
        const adjacent = cellsForEdge(edge.col, edge.row, edge.side);
        for (const cell of adjacent) {
            const tile = state.cells.get(cellKey(cell.col, cell.row));
            if (tile?.kind === "star") {
                add("edge-inset-star", `Diagonal taco ${key} collides with star at ${cellLabel(cell.col, cell.row)}.`);
            }
            else if (tile?.kind === "orthogonalCross") {
                add("edge-inset-orthogonal-cross", `Diagonal taco ${key} does not fit orthogonal cross at ${cellLabel(cell.col, cell.row)}.`);
            }
        }
    }
    for (const key of state.cornerInsets.keys()) {
        const corner = parseCornerKey(key);
        const tile = state.cells.get(cellKey(corner.col, corner.row));
        if (tile?.kind === "star" || tile?.kind === "diagonalCross") {
            add("corner-inset-tile-collision", `Orthogonal taco ${key} collides with ${tile.kind} at ${cellLabel(corner.col, corner.row)}.`);
        }
    }
    return conflicts;
}
function drawPlacedTiles() {
    drawTilesByKind("cross");
    drawTilesByKind("star");
}
function drawTilesByKind(pass) {
    for (const [key, tile] of state.cells) {
        const { col, row } = parseCellKey(key);
        if (!visibleCell(col, row)) {
            continue;
        }
        const color = colorValue(tile.colorId);
        if (tile.kind === "orthogonalCross" || tile.kind === "diagonalCross") {
            if (pass !== "cross") {
                continue;
            }
            drawCross(col, row, tile.kind, color);
        }
        else {
            if (pass !== "star") {
                continue;
            }
            drawStar(col, row, color);
        }
    }
}
function drawCross(col, row, kind, color) {
    const size = BASE_DRAW_PX;
    ctx.save();
    applyCellTransform(col, row);
    if (kind === "orthogonalCross") {
        ctx.rotate(Math.PI / 4);
    }
    ctx.fillStyle = color;
    ctx.strokeStyle = outlineColor(color);
    ctx.lineWidth = 1;
    traceDiagonalCrossPath(size);
    ctx.fill();
    ctx.stroke();
    drawTileHighlight(size);
    ctx.restore();
}
function traceDiagonalCrossPath(size) {
    const half = size / 2;
    const x = (value) => value * size - half;
    const y = (value) => value * size - half;
    const mouthStart = 0.5 - CROSS_NOTCH_MOUTH;
    const mouthEnd = 0.5 + CROSS_NOTCH_MOUTH;
    const inward = CROSS_NOTCH_DEPTH;
    const outward = 1 - CROSS_NOTCH_DEPTH;
    ctx.beginPath();
    ctx.moveTo(x(0), y(0));
    ctx.lineTo(x(mouthStart), y(0));
    ctx.lineTo(x(0.5), y(inward));
    ctx.lineTo(x(mouthEnd), y(0));
    ctx.lineTo(x(1), y(0));
    ctx.lineTo(x(1), y(mouthStart));
    ctx.lineTo(x(outward), y(0.5));
    ctx.lineTo(x(1), y(mouthEnd));
    ctx.lineTo(x(1), y(1));
    ctx.lineTo(x(mouthEnd), y(1));
    ctx.lineTo(x(0.5), y(outward));
    ctx.lineTo(x(mouthStart), y(1));
    ctx.lineTo(x(0), y(1));
    ctx.lineTo(x(0), y(mouthEnd));
    ctx.lineTo(x(inward), y(0.5));
    ctx.lineTo(x(0), y(mouthStart));
    ctx.closePath();
}
function drawStar(col, row, color) {
    const body = BASE_DRAW_PX / 2;
    const point = body + TACO_HALF_DIAGONAL_PX;
    const pointBase = TACO_HALF_DIAGONAL_PX;
    ctx.save();
    applyCellTransform(col, row);
    ctx.fillStyle = color;
    ctx.strokeStyle = outlineColor(color);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-body, -body);
    ctx.lineTo(-pointBase, -body);
    ctx.lineTo(0, -point);
    ctx.lineTo(pointBase, -body);
    ctx.lineTo(body, -body);
    ctx.lineTo(body, -pointBase);
    ctx.lineTo(point, 0);
    ctx.lineTo(body, pointBase);
    ctx.lineTo(body, body);
    ctx.lineTo(pointBase, body);
    ctx.lineTo(0, point);
    ctx.lineTo(-pointBase, body);
    ctx.lineTo(-body, body);
    ctx.lineTo(-body, pointBase);
    ctx.lineTo(-point, 0);
    ctx.lineTo(-body, -pointBase);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
function drawInsets() {
    for (const [key, inset] of state.edgeInsets) {
        const edge = parseEdgeKey(key);
        drawEdgeInset(edge.col, edge.row, edge.side, colorValue(inset.colorId));
    }
    for (const [key, inset] of state.cornerInsets) {
        const corner = parseCornerKey(key);
        drawCornerInset(corner.col, corner.row, corner.corner, colorValue(inset.colorId));
    }
}
function drawEdgeInset(col, row, side, color) {
    const point = edgeMidpoint(col, row, side);
    const size = TACO_SIDE_PX;
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(layoutRotation() + Math.PI / 4);
    ctx.fillStyle = color;
    ctx.strokeStyle = outlineColor(color);
    ctx.lineWidth = 1;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.restore();
}
function drawCornerInset(col, row, corner, color) {
    const size = TACO_SIDE_PX;
    const center = cornerInsetCenter(col, row, corner);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(layoutRotation());
    ctx.fillStyle = color;
    ctx.strokeStyle = outlineColor(color);
    ctx.lineWidth = 1;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.restore();
}
function drawPlaceholderGrid() {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 5]);
    const window = gridLocalRoomWindow();
    const startX = Math.floor(window.minX / TILE_PX - 0.5) - 1;
    const endX = Math.ceil(window.maxX / TILE_PX - 0.5) + 1;
    const startY = Math.floor(window.minY / TILE_PX - 0.5) - 1;
    const endY = Math.ceil(window.maxY / TILE_PX - 0.5) + 1;
    for (let i = startX; i <= endX; i += 1) {
        const x = (i + 0.5) * TILE_PX;
        const a = gridLocalToScreen({ x, y: window.minY - TILE_PX });
        const b = gridLocalToScreen({ x, y: window.maxY + TILE_PX });
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }
    for (let i = startY; i <= endY; i += 1) {
        const y = (i + 0.5) * TILE_PX;
        const a = gridLocalToScreen({ x: window.minX - TILE_PX, y });
        const b = gridLocalToScreen({ x: window.maxX + TILE_PX, y });
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }
    ctx.restore();
}
function drawRoomOutline() {
    ctx.save();
    ctx.strokeStyle = "#1c1c1c";
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.strokeRect(2, 2, ROOM_PX.width - 4, ROOM_PX.height - 4);
    ctx.restore();
}
function drawTileHighlight(size) {
    const half = size / 2;
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-half + size * 0.18, -half + size * 0.16);
    ctx.lineTo(-half + size * 0.72, -half + size * 0.16);
    ctx.stroke();
    ctx.restore();
}
function loadState() {
    const params = new URLSearchParams(window.location.search);
    const next = cloneDefaultState();
    if (params.get("v") !== URL_VERSION && !params.has("m")) {
        return next;
    }
    next.mode = validMode(params.get("m")) ?? next.mode;
    next.showGrid = params.get("g") === "1";
    next.brush = validBrush(params.get("b")) ?? next.brush;
    next.manufacturerId = validManufacturer(params.get("mf")) ?? next.manufacturerId;
    next.colorId = validColor(next.manufacturerId, params.get("c")) ?? next.colorId;
    const layout = params.get("l");
    if (layout) {
        parseLayout(layout, next);
    }
    return next;
}
function cloneDefaultState() {
    return {
        mode: DEFAULT_STATE.mode,
        showGrid: DEFAULT_STATE.showGrid,
        brush: DEFAULT_STATE.brush,
        manufacturerId: DEFAULT_STATE.manufacturerId,
        colorId: DEFAULT_STATE.colorId,
        cells: new Map(),
        edgeInsets: new Map(),
        cornerInsets: new Map(),
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
            const kind = parseTileKind(parts[3], next.mode);
            const colorId = parts[4];
            if (Number.isInteger(col) && Number.isInteger(row) && kind) {
                next.cells.set(cellKey(col, row), { kind, colorId });
            }
        }
        else if (parts[0] === "e" && parts.length === 5) {
            const col = Number(parts[1]);
            const row = Number(parts[2]);
            const side = parts[3];
            const colorId = parts[4];
            if (Number.isInteger(col) && Number.isInteger(row) && validSide(side)) {
                next.edgeInsets.set(canonicalEdgeKey(col, row, side), { colorId });
            }
        }
        else if (parts[0] === "k" && parts.length === 5) {
            const col = Number(parts[1]);
            const row = Number(parts[2]);
            const corner = parts[3];
            const colorId = parts[4];
            if (Number.isInteger(col) && Number.isInteger(row) && validCorner(corner)) {
                next.cornerInsets.set(cornerKey(col, row, corner), { colorId });
            }
        }
        else if (parts[0] === "k" && parts.length === 4) {
            const col = Number(parts[1]);
            const row = Number(parts[2]);
            const colorId = parts[3];
            if (Number.isInteger(col) && Number.isInteger(row)) {
                next.cornerInsets.set(cornerKey(col, row, "nw"), { colorId });
            }
        }
    }
}
function updateUrl() {
    const params = new URLSearchParams();
    params.set("v", URL_VERSION);
    params.set("m", state.mode);
    if (state.showGrid) {
        params.set("g", "1");
    }
    params.set("b", state.brush);
    params.set("mf", state.manufacturerId);
    params.set("c", state.colorId);
    const layout = serializeLayout();
    if (layout) {
        params.set("l", layout);
    }
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
}
function serializeLayout() {
    const items = [];
    for (const [key, tile] of state.cells) {
        const { col, row } = parseCellKey(key);
        items.push(["t", col, row, tile.kind, tile.colorId].join(","));
    }
    for (const [key, inset] of state.edgeInsets) {
        const edge = parseEdgeKey(key);
        items.push(["e", edge.col, edge.row, edge.side, inset.colorId].join(","));
    }
    for (const [key, inset] of state.cornerInsets) {
        const corner = parseCornerKey(key);
        items.push(["k", corner.col, corner.row, corner.corner, inset.colorId].join(","));
    }
    return items.join(";");
}
function currentManufacturer() {
    return MANUFACTURERS.find((manufacturer) => manufacturer.id === state.manufacturerId) ?? MANUFACTURERS[0];
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
function validManufacturer(id) {
    return MANUFACTURERS.some((manufacturer) => manufacturer.id === id) ? id ?? undefined : undefined;
}
function validColor(manufacturerId, id) {
    const manufacturer = MANUFACTURERS.find((candidate) => candidate.id === manufacturerId);
    return manufacturer?.colors.some((color) => color.id === id) ? id ?? undefined : undefined;
}
function validMode(value) {
    return value === "straight" || value === "diagonal" ? value : undefined;
}
function validBrush(value) {
    if (value === "base") {
        return "orthogonalCross";
    }
    return value === "orthogonalCross" ||
        value === "diagonalCross" ||
        value === "star" ||
        value === "inset" ||
        value === "colorOnly" ||
        value === "erase"
        ? value
        : undefined;
}
function parseTileKind(value, mode) {
    if (value === "base") {
        return mode === "diagonal" ? "diagonalCross" : "orthogonalCross";
    }
    if (value === "orthogonalCross" || value === "diagonalCross" || value === "star") {
        return value;
    }
    return undefined;
}
function validSide(value) {
    return value === "n" || value === "e" || value === "s" || value === "w";
}
function validCorner(value) {
    return value === "nw" || value === "ne" || value === "se" || value === "sw";
}
function layoutRotation() {
    return state.mode === "diagonal" ? Math.PI / 4 : 0;
}
function gridOrigin() {
    return ROOM_CENTER;
}
function applyCellTransform(col, row) {
    const center = cellLocalToScreen(col, row, 0, 0);
    ctx.translate(center.x, center.y);
    ctx.rotate(layoutRotation());
}
function cellLocalToScreen(col, row, localX, localY) {
    const x = col * TILE_PX + localX;
    const y = row * TILE_PX + localY;
    return gridLocalToScreen({ x, y });
}
function gridLocalRoomWindow() {
    const points = [
        screenToGridLocal({ x: 0, y: 0 }),
        screenToGridLocal({ x: ROOM_PX.width, y: 0 }),
        screenToGridLocal({ x: ROOM_PX.width, y: ROOM_PX.height }),
        screenToGridLocal({ x: 0, y: ROOM_PX.height }),
    ];
    return {
        minX: Math.min(...points.map((point) => point.x)),
        maxX: Math.max(...points.map((point) => point.x)),
        minY: Math.min(...points.map((point) => point.y)),
        maxY: Math.max(...points.map((point) => point.y)),
    };
}
function gridLocalToScreen(point) {
    const origin = gridOrigin();
    if (state.mode !== "diagonal") {
        return { x: origin.x + point.x, y: origin.y + point.y };
    }
    const angle = layoutRotation();
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: origin.x + point.x * cos - point.y * sin,
        y: origin.y + point.x * sin + point.y * cos,
    };
}
function screenToGridLocal(point) {
    const origin = gridOrigin();
    const x = point.x - origin.x;
    const y = point.y - origin.y;
    if (state.mode !== "diagonal") {
        return { x, y };
    }
    const angle = -layoutRotation();
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos,
    };
}
function cellFromPoint(point) {
    const local = screenToGridLocal(point);
    return {
        col: Math.floor(local.x / TILE_PX + 0.5),
        row: Math.floor(local.y / TILE_PX + 0.5),
    };
}
function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
}
function nearestEdge(point, col, row) {
    const sides = ["n", "e", "s", "w"];
    let nearest = sides[0];
    let nearestDistance = Infinity;
    for (const side of sides) {
        const midpoint = edgeMidpoint(col, row, side);
        const distance = Math.hypot(point.x - midpoint.x, point.y - midpoint.y);
        if (distance < nearestDistance) {
            nearest = side;
            nearestDistance = distance;
        }
    }
    return { col, row, side: nearest, key: canonicalEdgeKey(col, row, nearest) };
}
function nearestCorner(point, col, row) {
    const corners = [
        { corner: "nw", x: col * TILE_PX, y: row * TILE_PX },
        { corner: "ne", x: (col + 1) * TILE_PX, y: row * TILE_PX },
        { corner: "se", x: (col + 1) * TILE_PX, y: (row + 1) * TILE_PX },
        { corner: "sw", x: col * TILE_PX, y: (row + 1) * TILE_PX },
    ];
    let nearest = corners[0];
    let nearestDistance = Infinity;
    for (const corner of corners) {
        const distance = Math.hypot(point.x - corner.x, point.y - corner.y);
        if (distance < nearestDistance) {
            nearest = corner;
            nearestDistance = distance;
        }
    }
    return { col, row, corner: nearest.corner, key: cornerKey(col, row, nearest.corner) };
}
function nearestTacoTarget(point, col, row) {
    const edge = nearestEdge(point, col, row);
    const corner = nearestCorner(point, col, row);
    const edgeDistance = distance(point, edgeMidpoint(edge.col, edge.row, edge.side));
    const cornerDistance = distance(point, cornerInsetCenter(corner.col, corner.row, corner.corner));
    if (edgeDistance <= cornerDistance) {
        return { type: "edge", ...edge };
    }
    return { type: "corner", ...corner };
}
function edgeMidpoint(col, row, side) {
    if (side === "n") {
        return cellLocalToScreen(col, row, 0, -TILE_PX / 2);
    }
    if (side === "e") {
        return cellLocalToScreen(col, row, TILE_PX / 2, 0);
    }
    if (side === "s") {
        return cellLocalToScreen(col, row, 0, TILE_PX / 2);
    }
    return cellLocalToScreen(col, row, -TILE_PX / 2, 0);
}
function cornerInsetCenter(col, row, corner) {
    const centerOffset = HALF_GROUT_PX + TACO_SIDE_PX / 2;
    const x = corner === "nw" || corner === "sw" ? -TILE_PX / 2 + centerOffset : TILE_PX / 2 - centerOffset;
    const y = corner === "nw" || corner === "ne" ? -TILE_PX / 2 + centerOffset : TILE_PX / 2 - centerOffset;
    return cellLocalToScreen(col, row, x, y);
}
function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
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
        { col: col - 1, row },
    ];
}
function cellsForEdge(col, row, side) {
    const cells = [{ col, row }];
    if (side === "n") {
        cells.push({ col, row: row - 1 });
    }
    else if (side === "e") {
        cells.push({ col: col + 1, row });
    }
    else if (side === "s") {
        cells.push({ col, row: row + 1 });
    }
    else {
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
function visibleCell(col, row) {
    const margin = TILE_PX;
    const points = [
        cellLocalToScreen(col, row, -TILE_PX / 2, -TILE_PX / 2),
        cellLocalToScreen(col, row, TILE_PX / 2, -TILE_PX / 2),
        cellLocalToScreen(col, row, TILE_PX / 2, TILE_PX / 2),
        cellLocalToScreen(col, row, -TILE_PX / 2, TILE_PX / 2),
        cellLocalToScreen(col, row, 0, 0),
    ];
    return points.some((point) => point.x >= -margin && point.y >= -margin && point.x <= ROOM_PX.width + margin && point.y <= ROOM_PX.height + margin);
}
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
    return { col: Number(col), row: Number(row), side: side };
}
function cornerKey(col, row, corner) {
    return `${col}:${row}:${corner}`;
}
function parseCornerKey(key) {
    const [col, row, corner] = key.split(":");
    return { col: Number(col), row: Number(row), corner: corner };
}
function cellLabel(col, row) {
    return `(${col}, ${row})`;
}
function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function darken(hex, amount) {
    const normalized = hex.replace("#", "");
    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);
    return `rgb(${Math.round(red * (1 - amount))}, ${Math.round(green * (1 - amount))}, ${Math.round(blue * (1 - amount))})`;
}
function outlineColor(hex) {
    const normalized = hex.replace("#", "");
    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);
    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
    if (luminance < 0.18) {
        return "rgba(245, 239, 226, 0.9)";
    }
    return darken(hex, 0.24);
}
