# Localized sticker and stamp artwork

`copy.json` holds the complete localized lettering for all 30 app languages.
`designs.cjs` contains editable vector redraws for the 18 stickers and 20 stamps
that contain text. Pure illustrations, brand logos and the blank wax seal keep
their existing artwork. English also uses the redraws for a consistent collection.

`generate.cjs` uses Chromium's text shaping and font fallback to render transparent
640 × 640 PNGs. It measures actual glyph bounds, fits long wording without
stretching letters, preserves combining marks and shapes Arabic/Hebrew text in
the correct direction. All ancillary seal wording is translated too.

The app bundles the PNGs in `src/assets/localized/` through explicit Metro
`require()` calls in `src/constants/localizedArtwork.ts`. Picker selection uses
the same current-language hook as UI translations. Added elements retain their
selected image URI, including after a language change or project reopen.

## Regeneration

Use Node 20+ with `playwright` and `sharp` installed. These are authoring tools;
neither is required to run or build the app. Install Chromium for Playwright or
set `MARQO_ASSET_BROWSER` to a locally installed Chrome/Chromium executable.
Ensure the renderer has fonts covering every supported script.
After generating the full set, pass language codes to rerender only those sets
(for example, `node scripts/localized-assets/generate.cjs ja tr`).

```sh
NODE_PATH=/path/to/authoring/node_modules \
MARQO_ASSET_BROWSER='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
node scripts/localized-assets/generate.cjs
NODE_PATH=/path/to/authoring/node_modules node scripts/localized-assets/validate.cjs
```

Generation checks that its language set exactly matches `src/localization/index.ts`
and fails on missing copy or text overflowing its design box. It writes 1,140
PNGs, the generated TypeScript registry, and contact sheets plus the measured
layout report in `output/localized-assets-review/`.
Validation decodes every PNG, checks dimensions, alpha transparency, visible
artwork and clear image edges, and records file hashes in `validation.json`.

```sh
npm test -- --runInBand __tests__/LocalizedAssets.test.tsx
```

The tests check complete language/asset coverage, locale-specific bundled paths,
preservation of neutral illustrations, live language changes in both pickers,
category filtering and insertion of the displayed PNG.
