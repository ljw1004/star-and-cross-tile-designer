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

## Deployment

Deploy the static app to `unto.me` with `rsync` after building:

```sh
npm run build
rsync -az --delete index.html styles.css main.js preview.jpg lu@unto.me:/mnt/disks/pod7disk/www/untome/tiles/
```

The deployed page should then be available at `https://unto.me/tiles/`.


## Architecture

HTML+CSS+Canvas+Typescript, opened directly in the browser. No frameworks. `npm run build` uses `tsc --noEmit` for type checking and esbuild to bundle `src/main.ts` into the single browser file `main.js`.

Source file index:

- `src/main.ts`: Wires DOM controls, pointer/wheel interactions, app state updates, URL updates, and render calls.
- `src/types.ts`: Defines shared TypeScript types for tiles, app state, geometry, interactions, and conflicts.
- `src/constants.ts`: Holds defaults, layout limits, scale constants, side/corner lists, real manufacturer palettes, material categories, and grout options.
- `src/state.ts`: Loads state from the compact URL payload, validates values, serializes layout data, and writes queued URL updates.
- `src/geometry.ts`: Converts between room, grid, cell, edge, and screen coordinates, including zoom, resize hit-testing, and tile geometry dimensions.
- `src/keys.ts`: Creates and parses stable map keys for cells, edge tacos, corner tacos, neighbors, and canonical shared edges.
- `src/model.ts`: Applies painting operations to state, including conflict-fixing tile placement, erase, color-only, taco placement, and automatic taco pruning.
- `src/icons.ts`: Defines custom cursor SVG data URLs and traces the material-filled tile tool icon paths.
- `src/conflicts.ts`: Analyzes the current layout for impossible tile/taco conflicts and produces user-facing conflict messages.
- `src/render.ts`: Draws the room, placeholder grid, grout underlay silhouettes, tiles, tacos, and conflict banner into the canvas/DOM.
- `src/material.ts`: Renders clipped material fills for tile paths using deterministic texture, variation, grain, clouding, chips, and sheen.
- `src/color.ts`: Resolves tile/grout color IDs and computes tile outline colors.

## How tiles fit together

Some reference diagrams
- reference/geometry.png -- this is the mathematics of how the pieces fit together
- reference/cross-and-star.png -- this is Kasbah's reference diagram of how they fit together

The image uses three physical pieces:

- The 4.75"x4.75" "Base" tile is the cross tile. In diagonal mode it looks like an X: four broad corner lobes, with a V-shaped concave notch centered on each edge.
- The 6.5"x6.5" "Star" tile is the complementary piece. It has convex points centered on its four edges; each point fits into the edge notch of an adjoining Base tile.
- The 1.25"x1.25" "Taco" tile is the small square inset. In diagonal mode it is rotated 45 degrees and fits into an edge notch where there is no Star. In straight mode the same idea is rotated with the pattern, so the inset is axis-aligned and sits at a corner.

For rendering, treat the Base size as the single governing measurement. Model 2 in `cross-and-star.png` is the authoritative fitting reference. The ideal zero-grout geometry comes from the interlock between one axis-aligned Base square and the same Base square rotated 45 degrees. Let `A` be half of the rendered Base side, after grout has been allocated. Then:

- `B = sqrt(2) - 1`.
- `C = 2 - sqrt(2)`.
- `B + C = 1`.
- The Taco side length is `C * A`.
- The Taco half-diagonal is `B * A`.
- Each Base notch is the inward half of that same Taco square, so both the notch depth and notch half-mouth are `B * A`.
- Each Star point is the outward half of that same Taco geometry, so Star point geometry is identical to Base notch and Taco geometry.
- The orthogonal cross and diagonal cross are the same Base polygon; only their orientation changes. Do not tune their sizes independently.
- Grout width is the full joint width. Let `g` be half of that width. For visible tile fill, every physical edge moves inward by `g` measured perpendicular to that edge. Axis-aligned edges shift by `g` in x/y; diagonal-edge vertices therefore shift by `g * sqrt(2)` in axis coordinates where the two shifted diagonal lines meet.
- Grout underlays use the same zero-grout polygon expanded outward by `g`, not just the zero-grout polygon. This deliberately overlaps adjacent grout underlays and prevents one-pixel seams, especially on diagonals.
- Compute tile, taco, star, and grout geometry as explicit point lists. Do not rely on Canvas rotation, stroke width, or other drawing-side conveniences to create tile geometry; Canvas should only fill already-computed polygons.

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
4. UX: change UX model to "paint-with-tile" vs "paint-color-only" vs "grab/erase/pick". Use icons for everything. Use icons for all the things you can select in the left. (straight vs diagonal, brushes). Adjust cursors as best we can: dropper, erase, paint
5. Diagonal: Diagonal/straight should switch tool to grabber. Also rotate around current center, not 0x0. Also lots of icons should change. Also the ortho/diag cross icons shouldn't change icon, but should change meaning when you click. And the reflective highlights shouldn't rotate.
6. Polish: compact URL. Metadata: keywords like "star and cross designer", "mosaic", "tile", "arabesque", "spanish square".
7. Touch: make it touch-friendly for use on an ipad or iphone. (1) Viewport pan+zoom and touch gesture handling. (2) Tap-vs-pan threshold and touch paint-on-release. (3) Offset badge for touch Grabber drags. (4) Editable Area row. (5) For portrait, add responsive bottom bar and popups.

## Touch

- On portrait view, show a bar at the bottom with buttons (1) layout (2) tile, (3) grout. Like Outlook for iPhone it will show a text label underneath the button.
   - Layout: if current tool is grabber, it will show that, else it will show view (orth/diag). When you pop it up, it shows the standard layout options (row1: view orth/diag, grabber, grid; row2: tile size). Each of these icons will need text under it to explain what it does. The popup will use selection outlines like we have at the moment.
   - Tiles: if current tool is grabber then this will show the last active paint-shape or paint-color; paint-color will be represented by a color swatch square. But all other tools are tile tools (paint-shape, erase, dropper, paint-color) which will show in the bar. When popped up, it will show the tool row at the bottom (no need for labels) and all the colors above. I think we'll need to show full text name headings for each chunk of colors, not use the "Initialism" that we do in normal view.
   - Grout: This will show the icon for the current grout size. When you click it, it will show the grout options. The grout widths will need text labels. We'll have grout widths at the bottom, for similarity with the tiles popup.
   - We won't have an affordance for share. That will be done in the normal iPhone safari way, by sharing a webpage.
   - I'm hoping that when a user navigates to this page, then Safari's browser bar will sort of fade away. Not sure if we can trigger that. (We would be able to turn this into an app, but I think that's over the top. Who wants to install an app on their homescreen just for tile design?)
   - We'll have to make sure that all hitzones are touch friendly.
- On touch, we'll switch to a zoomable+pannable surface.
   - Press+drag will pan, like normal. Unless you're in Grabber mode in which case it will do the normal grab, and a banner will appear horizontally centered near the top of the screen 'moved -1" right, 3" up', showing how much has moved in the current grab. This will distinguish grab-dragging from view-panning. (even though both are visually indistinguishable if you're zoomed in far enough that you can't see room boundaries!)
   - Two-finger zoom will zoom in and out, like normal. Zoom and pan will not update the URL.
   - Tap (or press+drag+release with only a small drag under a threshold) will paint with the current tool if not grabber (paint-shape, erase, dropper, paint-color).
   - The hitzones for painting tacos will have to be larger than the taco actually is. Still, users will always be able to zoom if they need more precision.
   - The layout area (be it in left sidebar for landscape, or popup for portrait) will have a third row: `Area: [6'8" x 4'0"] ✓×`. The square brackets is an `<input type="text">`. That way when the user taps, a normal keyboard will pop up, and they can edit it. Area display uses feet and inches. When parsing, plain numbers such as `96 x 48` or `96 48` are inches; dimensions with a foot marker such as `6'4` or `6'4"` are feet and inches. If it's parsable then the blue tick button will be enabled. If a resize is accepted and the whole new room isn't currently in view, then we'll zoom out to see it all. In touch mode, we'll no longer display the size under the bottom right.
   
