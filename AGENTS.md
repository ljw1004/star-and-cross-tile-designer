# TILE EXPERIMENTER

Goal: a single-page app, entirely client-side, for users to experiment with bathroom floor tile layouts. This is not a polished site. It is purely a functional convenience, a quick throwaway site, as we work on our home remodel. It will be limited to "star and cross" styles, illustrated in cross-and-star.png

1. There'll be a fixed-width panel to the left, and the rest of the page will be tiles
2. The panel at the left has a simple title "Star and Cross Tiles" and then options
3. The rest of the page is a grid of square tile placeholders inside a room.
   - By default it will be orthogonal. There'll be a radio button at the left for "straight" or "diagonal"
   - By default tile placeholders will be 5"x5". There'll be options for 3"x3" up to 8"x8" in one inch increments
   - By default the room will be 60"x96". You can drag the room borders in 1" increments.
4. The primary function of this app is to let the user "paint" tiles. Similar to a pixel painting program.
   - At the left you can choose what tile you will paint with (diagonal cross, straight cross, star, or small square inset)
   - At the left you can chose what color you paint with. There will be a dropdown to pick which manufacturer you want, and then a color palette of their offerings.
   - When you've selected a cross/star, and you click on a tile placeholder, it will put the tile of your choice in that placeholder
   - When you've selected a small inset, you can either click on the middle of an edge (for diagonal square insets on diagonal crosses) or at a corner (for orthogonal square insets on orthogonal crosses)
   - In case of conflict, the item you just placed will always "make room for itself". For example if you click a star on a placeholder, but any adjoining tile was a star or any bordering edge had a square inset, then it will replace adjoining tiles with a diagonall cross and remove the inset. Or if you click a small square inset and either side had a star, it will replace the star with a cross
   - We will render the placeholders in black with dotted outlines at the edge of the placeholders. When tiles are in place, we'll render a bit of grout between tiles.
   - I wonder if some manufacturers have tiles that look "rustic"? Or some have tiles that are plain concrete/ceramic, vs highly polished ceramic? Can we render these differently?
   - There'll be a choice of grout color to the left. We'll have to research standard grout thickness for the various tiles and manufacturers.
   - Just like pixel painting programs, you can click+drag to paint over several tiles. (Given the auto-replace, this will be an interesting effect!)
   - Justs like pixel plainting programs, there'll be a "dropper" tool which lets you read a tile. It will read both shape (diagonal cross, orthogonal cross, star, taco) and texture/color and switch to those. Then it will straight away change into painting mode.
5. As well as painting, there'll be a "grab" tool. This will let you move the tiles within the room with granularity of 0.5". This is so users can experiment with different offsets.
6. Everything (current choice of options, current layout of tiles, offset, ...) will be encoded compactly in the URL query params, which gets live-updated. There's no provision for "project management". If a user wants to bookmark, then they can copy+paste the URL with query parameters. They can have multiple tabs with different settings.

## Architecture

HTML+CSS+Canvas+Typescript, opened directly in the browser. No frameworks. `npm run build` uses `tsc --noEmit` for type checking and esbuild to bundle `src/main.ts` into the single browser file `dist/main.js`.

Source file index:

- `src/main.ts`: Wires DOM controls, pointer/wheel interactions, app state updates, URL updates, and render calls.
- `src/types.ts`: Defines shared TypeScript types for tiles, app state, geometry, interactions, and conflicts.
- `src/constants.ts`: Holds defaults, layout limits, scale constants, side/corner lists, real manufacturer palettes, material categories, and grout options.
- `src/state.ts`: Loads state from URL parameters, validates query values, parses/serializes tile layout data, and writes the URL.
- `src/geometry.ts`: Converts between room, grid, cell, edge, and screen coordinates, including zoom, resize hit-testing, and tile geometry dimensions.
- `src/keys.ts`: Creates and parses stable map keys for cells, edge tacos, corner tacos, neighbors, and canonical shared edges.
- `src/model.ts`: Applies painting operations to state, including conflict-fixing tile placement, erase, color-only, taco placement, and automatic taco pruning.
- `src/conflicts.ts`: Analyzes the current layout for impossible tile/taco conflicts and produces user-facing conflict messages.
- `src/render.ts`: Draws the room, placeholder grid, grout underlay silhouettes, tiles, tacos, and conflict banner into the canvas/DOM.
- `src/material.ts`: Renders clipped material fills for tile paths using deterministic texture, variation, grain, clouding, chips, and sheen.
- `src/color.ts`: Resolves tile/grout color IDs and computes tile outline colors.

## How tiles fit together

The image uses three physical pieces:

- The 4.75"x4.75" "Base" tile is the cross tile. In diagonal mode it looks like an X: four broad corner lobes, with a V-shaped concave notch centered on each edge.
- The 6.5"x6.5" "Star" tile is the complementary piece. It has convex points centered on its four edges; each point fits into the edge notch of an adjoining Base tile.
- The 1.25"x1.25" "Taco" tile is the small square inset. In diagonal mode it is rotated 45 degrees and fits into an edge notch where there is no Star. In straight mode the same idea is rotated with the pattern, so the inset is axis-aligned and sits at a corner.

For rendering, treat the Base size as the single governing measurement. Let `B` be the rendered Base square after grout has been allocated equally on each side. Then:

- The Taco side length is `B / 4`.
- The Taco half-diagonal is `(B / 4) / sqrt(2)`.
- Each Base notch is the inward half of that same rotated Taco square, so both the notch depth and notch half-mouth are the Taco half-diagonal.
- Each Star point is the outward half of that same rotated Taco square, so the Star point geometry is identical to the Taco notch geometry.
- The Star's corner shoulders and side points must be constructed from the same Base-derived units; do not tune Star, Base, and Taco geometry independently.

The useful fitting rules for the app:

- A Base/cross can sit next to another Base/cross, a Star, or an inset.
- A Star must be surrounded by Base/cross tiles on its adjoining sides; the Star's side points occupy the same notch locations that would otherwise hold insets.
- Two Stars cannot touch on an adjoining side because their convex points would collide.
- An inset can only occupy an open Base/cross notch. If an inset is placed beside a Star, the Star must be replaced by a Base/cross. If a Star is placed beside an inset, the inset must be removed.
- The example labeled "Model 1" is one Base plus two Taco insets. "Model 2" is two Bases plus four Taco insets. "Model 3" is one Base plus one Star.

Note that tiles can overlap placeholders. For instance the star overlaps all adjoining placeholders. Diagonal tacos overlap two adjoining placeholders.

## Milestones

1. MVP: A fixed room, fixed tile size, a toggle for diagonal/straight, basic URL encoding, and lets you paint from a dummy manufacturer palette.
2. Sizes: You can alter room size by dragging its edges, and drag the tile offset by using the grabber, and alter tile size
3. Rendering: we put in real manufacturers, with palette+texture, and real grout.  Add a material-picker in the color dropdown, which picks up a material and switches the manufacturer dropdown to that one. We'll use the user-facing name "color" even though it truly refers to color+texture. See RENDER.md
4. UX: change UX model to "paint-with-tile" vs "paint-color-only" vs "grab/erase/pick".
5. Polish: compact URL. Metadata. Keywords like "star and cross designer", "mosaic", "tile", "arabesque", "spanish square". Use icons for all the things you can select in the left. (straight vs diagonal, brushes). Adjust cursors as best we can.
6. Touch: make it touch-friendly for use on an ipad or iphone.
