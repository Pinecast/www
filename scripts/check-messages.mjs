// Fails when lang/en.json is not what `npm run i18n:extract` makes of the
// source: a message was added, changed or removed, and the catalog was not
// extracted again. The catalog is made by a script, but it is committed: the
// translations are made from it.
//
//   npm run check:messages
//
// It runs the `i18n:extract` script of package.json as it is, with the output
// in a temporary file, so the glob and the id pattern are not written twice.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CATALOG = 'lang/en.json';
const MAX_EXAMPLES = 5;

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const {scripts} = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
);
const extract = scripts['i18n:extract'];
const outFile = `--out-file ${CATALOG}`;
if (!extract?.includes(outFile)) {
  console.error(
    `The i18n:extract script of package.json must end with "${outFile}".`,
  );
  process.exit(1);
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-messages-'));
const fresh = path.join(dir, 'en.json');
try {
  const result = spawnSync(
    extract.replace(outFile, `--out-file ${JSON.stringify(fresh)}`),
    {
      cwd: root,
      shell: true,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${path.join(root, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH}`,
      },
    },
  );
  if (result.status !== 0) {
    console.error('Extracting the messages failed.\n');
    console.error((result.stderr || result.stdout || '').trimEnd());
    process.exit(1);
  }

  const committedPath = path.join(root, CATALOG);
  const committed = fs.existsSync(committedPath)
    ? fs.readFileSync(committedPath, 'utf8')
    : '{}';
  const actual = fs.readFileSync(fresh, 'utf8');
  if (committed === actual) {
    console.log(`${CATALOG} is up to date.`);
    process.exit(0);
  }

  const before = JSON.parse(committed);
  const after = JSON.parse(actual);
  const quote = value => {
    const text = String(value).replace(/\s+/g, ' ');
    return text.length > 60 ? `"${text.slice(0, 59)}…"` : `"${text}"`;
  };
  const lines = [];
  const list = (label, ids, render) => {
    if (!ids.length) return;
    lines.push('', `  ${label} (${ids.length}):`);
    for (const id of ids.slice(0, MAX_EXAMPLES)) lines.push(`    ${render(id)}`);
    if (ids.length > MAX_EXAMPLES) {
      lines.push(`    …and ${ids.length - MAX_EXAMPLES} more`);
    }
  };
  list(
    'not in the catalog',
    Object.keys(after).filter(id => !(id in before)),
    id => `+ ${id}  ${quote(after[id].defaultMessage)}`,
  );
  list(
    'no longer in the source',
    Object.keys(before).filter(id => !(id in after)),
    id => `- ${id}  ${quote(before[id].defaultMessage)}`,
  );
  list(
    'changed',
    Object.keys(before).filter(
      id =>
        id in after && JSON.stringify(before[id]) !== JSON.stringify(after[id]),
    ),
    id => `~ ${id}  ${quote(after[id].defaultMessage)}`,
  );
  console.error(
    [
      `${CATALOG} is out of date: the messages in the source are different.`,
      ...lines,
      '',
      '  Fix it with:',
      '    npm run i18n:extract',
      `  and commit ${CATALOG}.`,
    ].join('\n'),
  );
  process.exit(1);
} finally {
  fs.rmSync(dir, {recursive: true, force: true});
}
