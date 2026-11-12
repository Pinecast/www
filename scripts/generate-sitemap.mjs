// Writes out/sitemap.xml and out/robots.txt. It is the last step of
// `npm run build`, so Netlify publishes both with the pages:
//
//   npm run build
//
// To write them into another export, pass its folder:
//   node scripts/generate-sitemap.mjs dir
//
// The languages are in src/locales.mjs; scripts/sitemap.mjs says how the pages
// are found and how the files are written.
import {existsSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {renderRobots, renderSitemap, findPages} from './sitemap.mjs';

const OUT =
  process.argv[2] ?? fileURLToPath(new URL('../out/', import.meta.url));

if (!existsSync(OUT)) {
  console.error(`${OUT} does not exist. Run \`next build\` first.`);
  process.exit(1);
}

const pages = findPages(OUT);
if (!pages.size) {
  console.error(`${OUT} has no pages to list.`);
  process.exit(1);
}

writeFileSync(join(OUT, 'sitemap.xml'), renderSitemap(pages));
writeFileSync(join(OUT, 'robots.txt'), renderRobots());
console.log(`Wrote sitemap.xml (${pages.size} pages) and robots.txt.`);
