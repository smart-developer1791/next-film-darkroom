# Light, paper and type

## Original sample photography

Three images were generated with the built-in **imagegen** tool for this project. Exact generation prompts are preserved in [image-prompts.json](image-prompts.json). They depict fictional scenes and are not commissioned photographs of an identified place.

| Project asset                      | Subject                                               |
| ---------------------------------- | ----------------------------------------------------- |
| `public/samples/corner-light.webp` | Warm ochre street, green shutters and afternoon light |
| `public/samples/coast-road.webp`   | Empty coastal road, pale grasses and blue-green sea   |
| `public/samples/citrus-table.webp` | Oranges, cream ceramic bowl and pale blue tabletop    |

The selected generated originals were resized to 1440 × 960 and encoded as WebP, quality 86. Runtime code uses these committed files; it does not depend on an image-generation cache or API. All collection and story samples are unprocessed originals. Real colour processing happens locally in the editor.

## Type

- Bricolage Grotesque: local variable Latin display font via `@fontsource-variable/bricolage-grotesque`.
- DM Sans: local variable Latin body font via `@fontsource-variable/dm-sans`.

Both use the SIL Open Font License. Copies are in `docs/licenses/`. `next/font/local` bundles WOFF2 files from installed packages and emits preload hints with adjusted fallbacks. `display: optional` avoids a late font swap when a font misses the first-render window. The recipe card uses ImageResponse's bundled font independently.

## Code graphics and derived assets

The favicon is an original SVG aperture mark. Film-edge perforations, palette strips and comparison line are CSS. `public/og.png` is composed locally from the generated street photo and display font. Page previews are actual Playwright screenshots; `docs/previews/recipe-card.png` is an actual server-generated card. There are no external icon, photograph or font requests.
