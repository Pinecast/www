// Puts the home page of each language other than English where the site
// serves it. It runs after `next build` in `npm run build`, before the sitemap.
//
// Next.js exports `src/pages/es/index.tsx` as `out/es.html`, as it does
// `features/index.tsx` as `out/features.html`. That file would be served at
// `/es`, and the home page of a language is `/es/` (src/locales.mjs), the
// index of its folder: `out/es/index.html`.
//
// To run it on another export, pass its folder: node scripts/finish-export.mjs dir
import {existsSync, mkdirSync, renameSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {DEFAULT_LOCALE, LOCALES} from '../src/locales.mjs';

const OUT =
  process.argv[2] ?? fileURLToPath(new URL('../out/', import.meta.url));

for (const locale of LOCALES) {
  if (locale === DEFAULT_LOCALE) continue;
  const exported = join(OUT, `${locale}.html`);
  const served = join(OUT, locale, 'index.html');
  if (!existsSync(exported)) {
    // Already moved (the script ran twice), or the language has no home page.
    // The sitemap step stops the build if a page is in the wrong place.
    continue;
  }
  mkdirSync(join(OUT, locale), {recursive: true});
  renameSync(exported, served);
  console.log(`Moved ${locale}.html to ${locale}/index.html.`);
}
