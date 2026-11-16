// Compiles the catalog of each language other than English, for the pages of
// that language (src/i18n-static.ts reads it). `npm run build` and
// `npm run dev` run it first:
//
//   npm run i18n:compile
//
// The bundle has no ICU parser (formatjs.options.js), so each message is
// parsed here, with `--ast`. The output, in .compiled-lang/, is not committed:
// lang/<tag>.json is, and this makes the rest. A message that is not valid ICU
// stops the build.
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {DEFAULT_LOCALE, LOCALES, languageTag} from '../src/locales.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const COMPILED_DIR = join(ROOT, '.compiled-lang');

mkdirSync(COMPILED_DIR, {recursive: true});
for (const locale of LOCALES) {
  if (locale === DEFAULT_LOCALE) continue;
  const tag = languageTag(locale);
  const source = join(ROOT, 'lang', `${tag}.json`);
  if (!existsSync(source)) {
    console.error(
      `lang/${tag}.json does not exist. Lingo.dev writes it (README.md, ` +
        '"Lingo.dev"); a language goes into LOCALES after its catalog.',
    );
    process.exit(1);
  }
  const result = spawnSync(
    'npx',
    [
      'formatjs',
      'compile',
      source,
      '--ast',
      '--out-file',
      join(COMPILED_DIR, `${tag}.json`),
    ],
    {cwd: ROOT, stdio: 'inherit'},
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
