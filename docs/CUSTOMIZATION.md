# Make the lab yours

## Brand and editorial pages

Change the name, footer and local font configuration in `src/app/layout.tsx`. Set the home copy in `src/app/page.tsx`. Shared colour and typography tokens live in the Tailwind `@theme inline` block in `src/app/globals.css`; utility classes do the layout. The few shared component classes cover buttons, fields, the wrapper and keyboard skip link.

Keep reserved photo aspect ratios, summary height, live-feedback space and tabular control numerals when changing content. Look changes should update the existing editor, not remount it with a changing React `key`.

## Colour recipes

Edit `src/data/looks.ts`: story, mood, palette, RGB matrix, contrast and channel offsets. The numbers in the names are fictional brand names, not ISO sensitivity. All three looks use the shared transform in `src/domain/pixels.ts`.

A new look needs a unique slug, story and original sample. Update the sample ID union, `samples`, `src/lib/sample-images.ts` static imports and the actual `public/samples` file. Both static paths and server recipe validation derive from the collection. Add a meaningful pixel invariant when introducing a different transform.

## Photos

Replace the three local WebP assets and their alt text. Static imports let Next determine dimensions and optimise collection images. The worker fetches local original WebP samples, not Next's resized thumbnail. Those samples are explicitly labelled original; they are processed only in the darkroom.

Do not add a remote upload action unless you intentionally change the privacy promise throughout the UI and documentation. Existing user files never become server props, query parameters or form fields.

## Controls and links

`src/domain/recipe.ts` owns defaults, accepted values, canonical query strings and export documents. Strength is 0–100 in steps of five; grain is 0–20 in whole steps. Change domain limits, form controls, tests, export text and documentation together.

The GET form's “Update recipe link” action commits settings to browser history. Slider movement changes the local preview immediately without creating a history entry for every step. Reset changes the controls, keeping the current photo. A reload, a native full-page navigation or leaving the editor clears the photo.

## Card and social identity

`src/lib/recipe-card.tsx` defines the server `ImageResponse` composition. It uses flex layouts and the bundled font; WOFF2 local page fonts are not passed into Satori. The card contains bounded recipe values only.

`npm run assets:social` rebuilds `public/og.png` from the local street photo and local display font. It requires Playwright Chromium, not an image service. Change the script's fixed-size composition when changing the brand. `npm run preview:images` captures actual pages from `PREVIEW_URL` (default `http://127.0.0.1:4218`).

## URL and hosting

Origin precedence: `NEXT_PUBLIC_SITE_URL`, then `https://${VERCEL_PROJECT_PRODUCTION_URL}`, then `https://next-film-darkroom.vercel.app`. Set a full public URL for a custom domain and rebuild. Keep API and editor paths out of the editorial sitemap; the editor has `noindex` but still provides a useful settings-only Open Graph card.

Use the normal Next server on Vercel or another Node host. This project includes runtime Route Handlers and a search-parameter page; it is not configured as a static-only export.
