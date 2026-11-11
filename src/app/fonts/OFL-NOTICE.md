# Vendored fonts

These files are vendored so `next build` never depends on `fonts.googleapis.com`.
A failed Google Fonts fetch during a Vercel build errored the production
deployment of `c8ea1405` (TypeError inside `@next/font/dist/google/loader.js`)
and left production on an older commit for ~14 hours.

| File | Family | Source package | Version |
|---|---|---|---|
| `inter-latin-wght-normal.woff2` | Inter (variable, wght 100–900) | `@fontsource-variable/inter` | 5.3.0 |
| `outfit-latin-wght-normal.woff2` | Outfit (variable, wght 100–900) | `@fontsource-variable/outfit` | 5.3.0 |
| `playfair-latin-wght-normal.woff2` | Playfair Display (variable, normal) | `@fontsource-variable/playfair-display` | 5.3.0 |
| `playfair-latin-wght-italic.woff2` | Playfair Display (variable, italic) | `@fontsource-variable/playfair-display` | 5.3.0 |

All four families are licensed under the **SIL Open Font License 1.1**
(https://openfontlicense.org). Latin subset only, matching the previous
`subsets: ['latin']` configuration. To refresh: `npm pack @fontsource-variable/<family>`
and copy `package/files/<family>-latin-wght-*.woff2`.
