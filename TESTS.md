# Rendering Tests

`TESTS.md` is the source of truth for rendering screenshots.

Run the full suite after code changes with:

```sh
npm run render-tests
```

The suite runner deletes existing `screenshots/*.png` files first, then regenerates exactly the screenshots listed below. Do not create or keep extra rendering screenshots outside this list.

## Reference Model 1: one base plus two tacos

Screenshot: `screenshots/reference-model-1-base-two-tacos.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=diagonal&g=1&tl=paint&ps=inset&mf=equipe-kasbah&c=black&l=t%2C1%2C1%2CdiagonalCross%2Cterracotta%3Be%2C1%2C1%2Cw%2Cblack%3Be%2C1%2C1%2Cs%2Cblack`

## Centered origin: straight

Screenshot: `screenshots/centered-origin-straight.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&tl=paint&ps=orthogonalCross&mf=equipe-kasbah&c=bone&l=t%2C0%2C0%2CorthogonalCross%2Cbone`

## Centered origin: diagonal

Screenshot: `screenshots/centered-origin-diagonal.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=diagonal&g=1&tl=paint&ps=orthogonalCross&mf=equipe-kasbah&c=bone&l=t%2C0%2C0%2CorthogonalCross%2Cbone`

## Milestone 2: smaller tile size

Screenshot: `screenshots/m2-smaller-tile-size.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&rw=60&rh=96&ts=5&ox=0&oy=0&tl=paint&ps=orthogonalCross&mf=equipe-kasbah&c=bone&l=t%2C0%2C0%2CorthogonalCross%2Cbone%3Bt%2C1%2C0%2CdiagonalCross%2Cterracotta`

## Milestone 2: grabbed tile offset

Screenshot: `screenshots/m2-grabbed-tile-offset.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&rw=60&rh=96&ts=8&ox=4.5&oy=-3&tl=grab&mf=equipe-kasbah&c=bone&l=t%2C0%2C0%2CorthogonalCross%2Cbone`

## Milestone 2: resized room

Screenshot: `screenshots/m2-resized-room.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=diagonal&g=1&rw=72&rh=84&ts=8&ox=0&oy=0&tl=grab&mf=equipe-kasbah&c=bone&l=t%2C0%2C0%2CorthogonalCross%2Cbone`

## Reference Model 2: two bases plus four inside-corner tacos

Screenshot: `screenshots/reference-model-2-two-bases-four-tacos.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&tl=paint&ps=inset&mf=equipe-kasbah&c=black&l=t%2C1%2C1%2CdiagonalCross%2Cterracotta%3Bt%2C2%2C1%2CorthogonalCross%2Cterracotta%3Bk%2C2%2C1%2Cnw%2Cblack%3Bk%2C2%2C1%2Cne%2Cblack%3Bk%2C2%2C1%2Csw%2Cblack%3Bk%2C2%2C1%2Cse%2Cblack`

## Reference Model 3: one base plus one star

Screenshot: `screenshots/reference-model-3-base-star.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=diagonal&g=1&tl=paint&ps=star&mf=equipe-kasbah&c=white&l=t%2C1%2C1%2CdiagonalCross%2Cterracotta%3Bt%2C2%2C1%2Cstar%2Cwhite`

## Straight mode: edge taco between diagonal crosses

Screenshot: `screenshots/straight-edge-taco-between-diagonal-crosses.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&tl=paint&ps=inset&mf=equipe-kasbah&c=night&l=t%2C2%2C2%2CdiagonalCross%2Cterracotta%3Bt%2C3%2C2%2CdiagonalCross%2Cbone%3Be%2C2%2C2%2Ce%2Cnight`

## Taco in empty placeholder near star is valid

Screenshot: `screenshots/taco-empty-placeholder-near-star-valid.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&tl=erase&mf=equipe-kasbah&c=amber&l=t%2C3%2C2%2Cstar%2Cverd%3Bk%2C3%2C3%2Cne%2Camber`

## Edge taco before diagonal cross is valid

Screenshot: `screenshots/edge-taco-before-diagonal-cross-valid.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&tl=paint&ps=inset&mf=equipe-kasbah&c=white&l=e%2C1%2C2%2Ce%2Cwhite%3Be%2C2%2C2%2Cw%2Cwhite`

## Star downgraded by adjoining orthogonal cross

Screenshot: `screenshots/star-downgraded-by-orthogonal-cross.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&tl=paint&ps=orthogonalCross&mf=equipe-kasbah&c=terracotta&l=t%2C2%2C2%2CdiagonalCross%2Cterracotta%3Bt%2C3%2C2%2CorthogonalCross%2Cterracotta%3Be%2C2%2C1%2Cs%2Cterracotta%3Be%2C2%2C2%2Cs%2Cterracotta%3Be%2C1%2C2%2Ce%2Cterracotta%3Bk%2C3%2C2%2Cnw%2Cterracotta%3Bk%2C3%2C2%2Cne%2Cterracotta%3Bk%2C3%2C2%2Cse%2Cterracotta%3Bk%2C3%2C2%2Csw%2Cterracotta`

## Orthogonal cross converted by edge taco

Screenshot: `screenshots/orthogonal-cross-converted-by-edge-taco.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&tl=paint&ps=inset&mf=equipe-kasbah&c=bone&l=t%2C2%2C2%2CdiagonalCross%2Cbone%3Be%2C2%2C1%2Cs%2Cbone%3Be%2C2%2C2%2Ce%2Cbone%3Be%2C2%2C2%2Cs%2Cbone%3Be%2C1%2C2%2Ce%2Cbone`

## Star removes shared edge taco

Screenshot: `screenshots/star-removes-shared-edge-taco.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&tl=paint&ps=star&mf=equipe-kasbah&c=terracotta&l=t%2C2%2C2%2CdiagonalCross%2Cbone%3Bt%2C3%2C2%2Cstar%2Cterracotta%3Be%2C2%2C1%2Cs%2Cbone%3Be%2C2%2C2%2Cs%2Cbone%3Be%2C1%2C2%2Ce%2Cbone`

## Milestone 3: textured material and grout underlay

Screenshot: `screenshots/m3-texture-selective-grout.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&rw=60&rh=96&ts=8&ox=0&oy=0&gc=timberwolf&gj=4&tl=paint&ps=inset&mf=rustico-saltillo&c=rustico-traditional&l=t%2C0%2C0%2CdiagonalCross%2Crustico-traditional%3Bt%2C1%2C0%2CdiagonalCross%2Crustico-antique%3Be%2C0%2C0%2Ce%2Crustico-manganese%3Be%2C0%2C1%2Ce%2Crustico-unsealed`

## Milestone 3: maximum grout around star contacts

Screenshot: `screenshots/m3-max-grout-star-contacts.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&rw=60&rh=96&ts=8&ox=0&oy=0&gc=white&gj=8&tl=paint&ps=star&mf=equipe-kasbah&c=terracotta&l=t%2C0%2C0%2Cstar%2Cterracotta%3Bt%2C0%2C-1%2CdiagonalCross%2Cbone%3Bt%2C1%2C0%2CdiagonalCross%2Cbone%3Bt%2C0%2C1%2CdiagonalCross%2Cbone%3Bt%2C-1%2C0%2CdiagonalCross%2Cbone`

## Milestone 3: reduced star cross grout contact

Screenshot: `screenshots/m3-reduced-star-cross-grout-contact.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&rw=42&rh=49&ts=5&ox=-1.5&oy=-2&gc=white&gj=8&tl=erase&mf=equipe-kasbah&c=bone&l=t%2C-2%2C-3%2CdiagonalCross%2Cbone%3Bt%2C-1%2C-3%2Cstar%2Cbone`

## Milestone 3: thin black star cross grout contact

Screenshot: `screenshots/m3-thin-black-star-cross-grout-contact.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&rw=24&rh=24&ts=5&ox=10&oy=16&gc=black&gj=1&tl=grab&mf=equipe-kasbah&c=bone&l=t%2C-2%2C-3%2CdiagonalCross%2Cbone%3Bt%2C-1%2C-3%2Cstar%2Cbone`

## Milestone 3: max white star cross grout fill

Screenshot: `screenshots/m3-max-white-star-cross-grout-fill.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&rw=24&rh=24&ts=8&ox=12&oy=24.5&gc=white&gj=8&tl=paint&mf=equipe-kasbah&c=terracotta&l=t%2C-2%2C-3%2CdiagonalCross%2Cterracotta%3Bt%2C-1%2C-3%2Cstar%2Cterracotta`

## Milestone 3: four tile center grout fill

Screenshot: `screenshots/m3-four-tile-center-grout-fill.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&rw=24&rh=24&ts=8&ox=12&oy=24.5&gc=warm-gray&gj=6&tl=paint&ps=star&mf=apollo&c=apollo-white&l=t%2C-2%2C-4%2CdiagonalCross%2Capollo-white%3Bt%2C-1%2C-3%2CdiagonalCross%2Capollo-white%3Bt%2C-1%2C-4%2Cstar%2Capollo-white%3Bt%2C-2%2C-3%2Cstar%2Capollo-white%3Be%2C-1%2C-3%2Ce%2Capollo-white%3Be%2C-1%2C-3%2Cs%2Capollo-white%3Be%2C-2%2C-5%2Cs%2Capollo-white%3Be%2C-3%2C-4%2Ce%2Capollo-white`

## Milestone 3: taco underlay grout cluster

Screenshot: `screenshots/m3-taco-underlay-grout-cluster.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&rw=24&rh=24&ts=8&ox=12&oy=24.5&gc=warm-gray&gj=8&tl=paint&ps=diagonalCross&mf=apollo&c=apollo-white&l=t%2C-2%2C-4%2CdiagonalCross%2Capollo-white%3Bt%2C-1%2C-4%2CdiagonalCross%2Capollo-white%3Bt%2C-1%2C-3%2CdiagonalCross%2Capollo-white%3Bt%2C-2%2C-3%2CdiagonalCross%2Capollo-white%3Be%2C-2%2C-5%2Cs%2Capollo-white%3Be%2C-2%2C-4%2Ce%2Capollo-white%3Be%2C-2%2C-4%2Cs%2Capollo-white%3Be%2C-3%2C-4%2Ce%2Capollo-white%3Be%2C-1%2C-5%2Cs%2Capollo-white%3Be%2C-1%2C-4%2Ce%2Capollo-white%3Be%2C-1%2C-4%2Cs%2Capollo-white%3Be%2C-1%2C-3%2Ce%2Capollo-white%3Be%2C-1%2C-3%2Cs%2Capollo-white%3Be%2C-2%2C-3%2Ce%2Capollo-white%3Be%2C-2%2C-3%2Cs%2Capollo-white%3Be%2C-3%2C-3%2Ce%2Capollo-white`
