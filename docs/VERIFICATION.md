# Checked in the darkroom

Verified on **22 October 2026**, Linux, Node **24.14.0**, npm **11.21.0**, Next **16.4.2**, React **19.3.1**, Playwright Chromium **1.64.1**.

## Completed checks

| Check                        | Result                                                                      |
| ---------------------------- | --------------------------------------------------------------------------- |
| `npm install` / lockfile     | Successful; normal local dependencies only                                  |
| `npm run format:check`       | Passed                                                                      |
| `npm test`                   | 11 passed                                                                   |
| `npm run typecheck`          | Passed, including generated Next route types                                |
| `npm run build`              | Passed using the default Turbopack build                                    |
| `npm run test:e2e`           | 23 passed in production Chromium                                            |
| Full `npm audit`             | 0 vulnerabilities at verification time                                      |
| `npm audit --omit=dev`       | 0 vulnerabilities at verification time                                      |
| `npm run dev` without `.env` | Started normally; real worker processing, PNG card HTTP 200, no page errors |
| Social card utility          | Wrote a real 1200 × 630 local PNG                                           |
| Preview utility              | Captured eight page/card images                                             |

Audit results are a dated snapshot, not a promise about future advisories. Lint is not configured or claimed as run.

## What the browser tests actually prove

- The bundled native Web Worker runs in production. Developed bytes differ from the original; zero strength and grain are byte-identical; full Pearl is monochrome.
- Fast settings changes finish at the latest recipe. Reveal changes do not change pixel output.
- The downloaded image has a PNG signature, 1440 px source width and decoded pixels matching the developed canvas. A 2400 × 1800 local upload is processed at 1600 × 1200.
- Local upload sends no POST or other write request. The selected photo survives look changes, enhanced GET URL updates and reset. Unsupported, corrupt and oversized files retain the last valid source.
- Missing Worker support and an asynchronous worker failure both recover through the same local processor.
- Invalid or repeated recipe values show a reset explanation. Copy denial exposes an exact selectable URL. Browser back restores controls from the recipe URL.
- With JavaScript disabled, the native GET form updates the selected recipe and both JSON and actual card PNG downloads still work.
- The JSON endpoint returns a versioned settings-only attachment and rejects malformed requests. ImageResponse returns actual 1200 × 630 PNGs that change with recipe settings.
- Arbitrary missing pages and unknown story slugs return branded HTTP 404 responses.
- Canonical and Open Graph metadata, an actual raster social image, robots and five editorial sitemap URLs resolve correctly.
- Twenty route/viewport combinations have no horizontal overflow: home, collection, story, lab and 404 at 320, 390, 768 and 1440 px.
- Seven representative states pass the automated axe WCAG 2 A/AA and 2.1 AA checks, including an invalid recipe and 404. Automated scans do not replace assistive-technology testing.
- Preview and summary boxes retain the same bounds through all look choices and reset. Delaying local fonts/scripts by 250 ms keeps observed no-input layout shifts below 0.05 on home and lab.

A separate dev-mode smoke check confirmed `data-preview-mode="worker"`, enabled export, a valid card response and no browser page errors with `.env` absent.

## Captured artefacts

`docs/previews/`: `home.png`, `looks.png`, `story.png`, `darkroom.png`, `pearl.png`, `recipe-card.png`, `404.png`, `mobile.png`. Home, darkroom, Pearl and mobile captures include the full document. Focus is cleared and scroll returns to the top before capture so the keyboard-only skip link does not appear accidentally.

The template was not deployed, pushed or connected to an external service. Browser checks were run in Chromium only; other browsers and Vercel's hosted header injection were not claimed as verified.
