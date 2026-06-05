# Rendering Tests

`TESTS.md` is the source of truth for rendering screenshots.

Run the full suite after code changes with:

```sh
npm run render-tests
```

The suite runner deletes existing `screenshots/*.png` files first, then regenerates exactly the screenshots listed below. Do not create or keep extra rendering screenshots outside this list.

## Reference Model 1: one base plus two tacos

Screenshot: `screenshots/reference-model-1-base-two-tacos.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGRksGFI4GAAAiam__9BFAMTMxMTEwMDKwMPEAIBDwixMDIzMAEA5alKeTAAAAA`

## Centered origin: straight

Screenshot: `screenshots/centered-origin-straight.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFI4GAAAiYmEAkUYAQCCJMRAAdOJV0hAAAA`

## Centered origin: diagonal

Screenshot: `screenshots/centered-origin-diagonal.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGRksGFI4GAAAiYmEMnAyMAIEgUzGQHWpsJTIQAAAA`

## Milestone 2: smaller tile size

Screenshot: `screenshots/m2-smaller-tile-size.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFIYGUAAiYmBjDFwMgEhGAhiAAjEwC_aLV8KAAAAA`

## Milestone 2: grabbed tile offset

Screenshot: `screenshots/m2-grabbed-tile-offset.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFI4GDg_P-LiYkBBIBCQABhMgIAUqr2ZSEAAAA`

## Milestone 2: resized room

Screenshot: `screenshots/m2-resized-room.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGRk8GAI4WAAAiYmEMnAyMAIEgUzGQGFGpkaIQAAAA`

## Reference Model 2: two bases plus four inside-corner tacos

Screenshot: `screenshots/reference-model-2-two-bases-four-tacos.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFI4GAAAiYmBhAXSDIxMrGy8jBAIFCcEQDVty8dKAAAAA`

## Reference Model 3: one base plus one star

Screenshot: `screenshots/reference-model-3-base-star.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGRksGFI4GAAAiYmBkYgBJJMTMysXAxgMUYmAJad_cgkAAAA`

## Straight mode: edge taco between diagonal crosses

Screenshot: `screenshots/straight-edge-taco-between-diagonal-crosses.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFI4GAAAiYmBghkZGJiYmQFivCCEZADAOYEpz4oAAAA`

## Taco in empty placeholder near star is valid

Screenshot: `screenshots/taco-empty-placeholder-near-star-valid.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFI4GAAAiYmBmYGJqAAExMjMwMHAzdYjBEA1pH8liQAAAA`

## Edge taco before diagonal cross is valid

Screenshot: `screenshots/edge-taco-before-diagonal-cross-valid.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFI4GAAAiYmIIcJCBmZgEwQ4AIjJiZGANqi_Z8oAAAA`

## Star downgraded by adjoining orthogonal cross

Screenshot: `screenshots/star-downgraded-by-orthogonal-cross.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEzWKwQkAIAwDr60B3cktXMD9p7B5eBBIjpwg2NxJk4lnUYps1E5yhH61Y5E-MXgJrHqyQQAAAA`

## Orthogonal cross converted by edge taco

Screenshot: `screenshots/orthogonal-cross-converted-by-edge-taco.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEyWKCQ0AIAwDrxsk4AkXGMC_ClZo0vTdQizOoBCBY5I9DHcyxRv0bekk6iQaF7qvIQtBAAAA`

## Star removes shared edge taco

Screenshot: `screenshots/star-removes-shared-edge-taco.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFI4GAAAiYmBhCXmYGZlQkImIFCjKxADBKEIiDmBGImFlagMgAUFVO0PQAAAA`

## Overwrite star: tacos keep displaced color

Screenshot: `screenshots/overwrite-star-tacos-keep-displaced-color.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFI4GAAAlbm_0DAwMzAzMoEAiAxfpA4KxCDIZgJpDkZmICKGBlYGAC3A-kTQQAAAA`

## Overwrite orthogonal cross: tacos keep displaced color

Screenshot: `screenshots/overwrite-orthogonal-cross-tacos-keep-displaced-color.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFI4GAAAlbm_0DAwMzAzMoEAiAxfiBmZARiMAQzgTQnAxNQESMDCwMAtyoKq0EAAAA`

## Milestone 3: textured material and grout underlay

Screenshot: `screenshots/m3-texture-selective-grout.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFI4GAAAjYWEMnAxMDEwgQEDAxGxmABEwZDOMXCwszECACKh3UdNgAAAA`

## Milestone 3: maximum grout around star contacts

Screenshot: `screenshots/m3-max-grout-star-contacts.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBksGFI4GAAAkaO_0DAwMzAzMTEzMgKEmLgBMozMoFUAQAAn0YwKwAAAA`

## Milestone 3: reduced star cross grout contact

Screenshot: `screenshots/m3-reduced-star-cross-grout-contact.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBk0GIwZP3_9_8fRo7___7_ZWBiYGRiYmZkZAABJkYmACb4BiskAAAA`

## Milestone 3: thin black star cross grout contact

Screenshot: `screenshots/m3-thin-black-star-cross-grout-contact.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBkkGCQYGUQYVDgZPz_7_9fBiYGRiYmZkZGBhBgYmQCAAnFE7wkAAAA`

## Milestone 3: max white star cross grout fill

Screenshot: `screenshots/m3-max-white-star-cross-grout-fill.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBkkGCQ4AAShowc___9_8vAxMDIxMTMysoAAkyMTABgdfjNJAAAAA`

## Milestone 3: four tile center grout fill

Screenshot: `screenshots/m3-four-tile-center-grout-fill.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEwtmZGBkkGCQ4AAShqxs___-_83AwsDCzswEBtoMQKANIrWBEEZAaBAlwMDMAFTNyMDAyMbEwMDKAABO9i-IUAAAAA`

## Milestone 3: taco underlay grout cluster

Screenshot: `screenshots/m3-taco-underlay-grout-cluster.png`

URL: `file:///Users/ljw/code/tiles/index.html?s=H4sIAAAAAAAAEx2GwQ3AIAwDL5BIPPtkh7w6S_efBCGIe5bP_gxjMkfpjXH2WTgeTSSFlKlV_gsPveNmTSWCCwkRVMpIAAAA`
