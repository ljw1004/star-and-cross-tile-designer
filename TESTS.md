# Rendering Tests

`TESTS.md` is the source of truth for rendering screenshots.

Run the full suite after code changes with:

```sh
npm run render-tests
```

The suite runner deletes existing `screenshots/*.png` files first, then regenerates exactly the screenshots listed below. Do not create or keep extra rendering screenshots outside this list.

## Reference Model 1: one base plus two tacos

Screenshot: `screenshots/reference-model-1-base-two-tacos.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=diagonal&g=1&b=inset&mf=dummy&c=black&l=t%2C1%2C1%2CdiagonalCross%2Cterracotta%3Be%2C1%2C1%2Cw%2Cblack%3Be%2C1%2C1%2Cs%2Cblack`

## Centered origin: straight

Screenshot: `screenshots/centered-origin-straight.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&b=orthogonalCross&mf=dummy&c=bone&l=t%2C0%2C0%2CorthogonalCross%2Cbone`

## Centered origin: diagonal

Screenshot: `screenshots/centered-origin-diagonal.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=diagonal&g=1&b=orthogonalCross&mf=dummy&c=bone&l=t%2C0%2C0%2CorthogonalCross%2Cbone`

## Reference Model 2: two bases plus four inside-corner tacos

Screenshot: `screenshots/reference-model-2-two-bases-four-tacos.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&b=inset&mf=dummy&c=black&l=t%2C1%2C1%2CdiagonalCross%2Cterracotta%3Bt%2C2%2C1%2CorthogonalCross%2Cterracotta%3Bk%2C2%2C1%2Cnw%2Cblack%3Bk%2C2%2C1%2Cne%2Cblack%3Bk%2C2%2C1%2Csw%2Cblack%3Bk%2C2%2C1%2Cse%2Cblack`

## Reference Model 3: one base plus one star

Screenshot: `screenshots/reference-model-3-base-star.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=diagonal&g=1&b=star&mf=dummy&c=white&l=t%2C1%2C1%2CdiagonalCross%2Cterracotta%3Bt%2C2%2C1%2Cstar%2Cwhite`

## Straight mode: edge taco between diagonal crosses

Screenshot: `screenshots/straight-edge-taco-between-diagonal-crosses.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&b=inset&mf=dummy&c=night&l=t%2C2%2C2%2CdiagonalCross%2Cterracotta%3Bt%2C3%2C2%2CdiagonalCross%2Cbone%3Be%2C2%2C2%2Ce%2Cnight`

## Taco in empty placeholder near star is valid

Screenshot: `screenshots/taco-empty-placeholder-near-star-valid.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&b=erase&mf=dummy&c=amber&l=t%2C3%2C2%2Cstar%2Cverd%3Bk%2C3%2C3%2Cne%2Camber`

## Edge taco before diagonal cross is valid

Screenshot: `screenshots/edge-taco-before-diagonal-cross-valid.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&b=inset&mf=dummy&c=white&l=e%2C1%2C2%2Ce%2Cwhite%3Be%2C2%2C2%2Cw%2Cwhite`

## Star downgraded by adjoining orthogonal cross

Screenshot: `screenshots/star-downgraded-by-orthogonal-cross.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&b=orthogonalCross&mf=dummy&c=terracotta&l=t%2C2%2C2%2CdiagonalCross%2Cterracotta%3Bt%2C3%2C2%2CorthogonalCross%2Cterracotta%3Be%2C2%2C1%2Cs%2Cterracotta%3Be%2C2%2C2%2Cs%2Cterracotta%3Be%2C1%2C2%2Ce%2Cterracotta%3Bk%2C3%2C2%2Cnw%2Cterracotta%3Bk%2C3%2C2%2Cne%2Cterracotta%3Bk%2C3%2C2%2Cse%2Cterracotta%3Bk%2C3%2C2%2Csw%2Cterracotta`

## Orthogonal cross converted by edge taco

Screenshot: `screenshots/orthogonal-cross-converted-by-edge-taco.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&b=inset&mf=dummy&c=bone&l=t%2C2%2C2%2CdiagonalCross%2Cbone%3Be%2C2%2C1%2Cs%2Cbone%3Be%2C2%2C2%2Ce%2Cbone%3Be%2C2%2C2%2Cs%2Cbone%3Be%2C1%2C2%2Ce%2Cbone`

## Star removes shared edge taco

Screenshot: `screenshots/star-removes-shared-edge-taco.png`

URL: `file:///Users/ljw/code/tiles/index.html?v=1&m=straight&g=1&b=star&mf=dummy&c=terracotta&l=t%2C2%2C2%2CdiagonalCross%2Cbone%3Bt%2C3%2C2%2Cstar%2Cterracotta%3Be%2C2%2C1%2Cs%2Cbone%3Be%2C2%2C2%2Cs%2Cbone%3Be%2C1%2C2%2Ce%2Cbone`
