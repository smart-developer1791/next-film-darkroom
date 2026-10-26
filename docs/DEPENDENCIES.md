# A small workbench

Versions are pinned in `package-lock.json`. Use `npm ci` to reproduce the checked installation.

| Package                                           | Why it is installed                                                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `next`                                            | App Router, static story pages, image optimisation, local fonts, enhanced GET form, Route Handlers and ImageResponse |
| `react`, `react-dom`                              | Stateful browser controls, canvas and worker lifetime, server rendering                                              |
| `@fontsource-variable/bricolage-grotesque`        | Self-hosted display font asset                                                                                       |
| `@fontsource-variable/dm-sans`                    | Self-hosted body font asset                                                                                          |
| `typescript`                                      | Type checks; Node 24 runs pure TypeScript tests through native type stripping                                        |
| `@types/node`, `@types/react`, `@types/react-dom` | Type declarations only                                                                                               |
| `tailwindcss`, `@tailwindcss/turbopack`           | Tailwind 4 compiler and official scaffold's Turbopack CSS loader                                                     |
| `@playwright/test`                                | Real Chromium interaction, exports and responsive checks; optional preview utilities                                 |
| `@axe-core/playwright`                            | Automated WCAG browser checks                                                                                        |
| `prettier`                                        | Consistent source and documentation formatting                                                                       |

No image-processing package is required: the project owns a small tested pixel transform and uses native Canvas, ImageBitmap and Web Worker APIs. There is no worker plugin, upload SDK, state manager, icon library, analytics or database dependency. The unused scaffold ESLint packages were removed; validation uses type checks, native unit tests and browser tests.

`scripts/` contains optional asset utilities only. Ordinary development uses the scaffold's `next dev` directly, without environment wrappers or secret files. `AGENTS.md` is the Next-generated guide for coding tools, not an application runtime dependency.
