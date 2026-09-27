// Checks the structure of the static export in out/ for accessibility
// regressions that a screenshot can't show. Run it after `npm run build`:
//
//   npm run build && npm run check:structure
//
// To check another export, pass its folder: node scripts/check-structure.mjs dir
//
// Each page must have:
// - exactly one <h1>, and no heading more than one level below the heading
//   before it (headings inside aria-hidden or visibility-hidden markup are
//   left out, as screen readers leave them out);
// - only <li> elements as children of <ul> and <ol>;
// - a title on each <iframe> and an alt attribute on each <img>;
// - no `level` attribute: vendor/rehype-heading-levels.mjs passes it to
//   mdx-components.tsx, and it must not reach the page.
// Across the site, two different screenshots (the images in
// public/images/content/) must not share the same alt text.
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

const ROOT = process.argv[2] ?? new URL('../out/', import.meta.url).pathname;
const VOID = new Set(
  'area base br col embed hr img input link meta param source track wbr'.split(
    ' ',
  ),
);
const RAW_TEXT = new Set(['script', 'style']);

function* pages(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== '_next') yield* pages(path);
    } else if (name.endsWith('.html')) {
      yield path;
    }
  }
}

function attributes(source) {
  const attrs = new Map();
  for (const m of source.matchAll(
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g,
  )) {
    attrs.set(m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? '');
  }
  return attrs;
}

// A small tokenizer for the well-formed markup that React renders.
function* elements(html) {
  const stack = [];
  const tag = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = tag.exec(html))) {
    if (!m[2]) continue; // comment
    const name = m[2].toLowerCase();
    if (m[1]) {
      const i = stack.findLastIndex(e => e.name === name);
      if (i > -1) stack.length = i;
      continue;
    }
    const attrs = attributes(m[3]);
    const parent = stack[stack.length - 1];
    const hidden =
      parent?.hidden ||
      attrs.get('aria-hidden') === 'true' ||
      /visibility:\s*hidden/.test(attrs.get('style') ?? '');
    const element = {name, attrs, parent, hidden, start: tag.lastIndex};
    yield element;
    if (RAW_TEXT.has(name)) {
      const end = html.indexOf(`</${name}`, tag.lastIndex);
      tag.lastIndex = end < 0 ? html.length : end;
    } else if (!m[4] && !VOID.has(name)) {
      stack.push(element);
    }
  }
}

const errors = new Map();
const altSources = new Map();
for (const file of pages(ROOT)) {
  const page = '/' + relative(ROOT, file);
  const html = readFileSync(file, 'utf8');
  const fail = message => {
    const key = `${page}: ${message}`;
    errors.set(key, (errors.get(key) ?? 0) + 1);
  };
  let h1s = 0;
  let previous = 0;
  for (const el of elements(html)) {
    const heading = /^h([1-6])$/.exec(el.name);
    if (heading && !el.hidden) {
      const level = Number(heading[1]);
      if (level === 1) h1s++;
      if (previous && level > previous + 1) {
        fail(`<${el.name}> follows <h${previous}>`);
      }
      previous = level;
    }
    if (el.attrs.has('level')) fail(`<${el.name}> has a level attribute`);
    if (
      (el.parent?.name === 'ul' || el.parent?.name === 'ol') &&
      el.name !== 'li'
    ) {
      fail(`<${el.name}> is a child of <${el.parent.name}>`);
    }
    if (el.name === 'iframe' && !el.attrs.get('title')?.trim()) {
      fail(`<iframe src="${el.attrs.get('src')}"> has no title`);
    }
    if (el.name === 'img') {
      if (!el.attrs.has('alt')) {
        fail(`<img src="${el.attrs.get('src')}"> has no alt`);
      } else if (el.attrs.get('src')?.startsWith('/images/content/')) {
        const alt = el.attrs.get('alt');
        const sources = altSources.get(alt) ?? new Map();
        sources.set(el.attrs.get('src'), page);
        altSources.set(alt, sources);
      }
    }
  }
  if (h1s !== 1) fail(`has ${h1s} <h1> elements`);
}
for (const [alt, sources] of altSources) {
  if (sources.size > 1) {
    const images = [...sources].map(([src, page]) => `${src} (${page})`);
    errors.set(`alt "${alt}" is on different images: ${images.join(', ')}`, 1);
  }
}

if (errors.size) {
  for (const [message, count] of errors) {
    console.error(count > 1 ? `${message} (${count} times)` : message);
  }
  process.exit(1);
}
console.log('Structure checks passed.');
