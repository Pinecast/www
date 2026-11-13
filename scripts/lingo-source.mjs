// Writes lang/en.jsonc, the copy of lang/en.json that Lingo.dev translates.
//
// Lingo.dev reads the context of a message from a comment above its key in a
// .jsonc source (https://lingo.dev/en/docs/cli/translator-notes), and from
// nothing else in a file. The `description` of a message in lang/en.json is a
// plain field: the push marks it ignored, so it is not translated, and Lingo.dev
// does not say that it is read. So this copy puts each description in a `//`
// comment above its `defaultMessage`, and leaves the field out. The target
// catalogs have the shape of lang/en.json without descriptions, so their keys
// line up with this copy's.
//
//   node scripts/lingo-source.mjs
//
// `npm run i18n:extract` runs it after each extraction, and
// `npm run check:messages` fails when lang/en.jsonc is out of date.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const LINGO_SOURCE = 'lang/en.jsonc';

// A JSON string with each `/` written `\/`, which parses to the same text. A
// parser that finds comments line by line can take the `//` of a URL in a
// message for a comment, and the message's context would end with the rest of
// the URL.
const quote = text => JSON.stringify(text).replaceAll('/', '\\/');

// A `//` comment holds one line.
const oneLine = text => text.replace(/\s*\n\s*/g, ' ').trim();

export function lingoSource(catalog) {
  const ids = Object.keys(catalog);
  const lines = ['{'];
  ids.forEach((id, index) => {
    const {defaultMessage, description = ''} = catalog[id];
    if (typeof description !== 'string') {
      throw new Error(
        `The description of message ${id} is not text, so it cannot be a comment.`,
      );
    }
    lines.push(`  ${JSON.stringify(id)}: {`);
    if (oneLine(description)) lines.push(`    // ${oneLine(description)}`);
    lines.push(`    "defaultMessage": ${quote(defaultMessage)}`);
    lines.push(index === ids.length - 1 ? '  }' : '  },');
  });
  lines.push('}', '');
  return lines.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const catalog = JSON.parse(
    fs.readFileSync(path.join(root, 'lang/en.json'), 'utf8'),
  );
  fs.writeFileSync(path.join(root, LINGO_SOURCE), lingoSource(catalog));
}
