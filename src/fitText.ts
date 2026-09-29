import * as React from 'react';
import {StyleObject} from 'styletron-react';

// A display heading breaks a word in the middle when the word is wider than
// its line. Chrome and Firefox do not hyphenate English words that start with a
// capital letter, so `hyphens: auto` does not add a hyphen there either. These
// helpers make a heading smaller only when its widest word would not fit on
// its line. A heading whose words fit keeps its size.
//
// The size comes from the page width, and zoom makes the page narrower in CSS
// pixels. Thus, at 200% zoom a heading with a long word grows less than 200%:
// in a 700px window, "Collaborators" grows to about 123%. This is the pattern
// of WCAG failure F94. CSS cannot tell zoom from a narrow window, and the owner
// prefers headings that fit to headings that break a word. Thus this is a
// known gap (finding www-title-fit-zoom).

// The advance widths of Ginto Nord Condensed, in em: the `hmtx` advances of
// public/fonts/ginto-nord-condensed.woff2 over its 1000 units per em. The
// headings are in capitals. Kerning only moves these capitals closer, so the
// sum of the advances is never narrower than the word on screen.
const GINTO_NORD_CONDENSED_ADVANCES: Record<string, number> = {
  A: 0.68,
  B: 0.674,
  C: 0.607,
  D: 0.696,
  E: 0.601,
  F: 0.582,
  G: 0.695,
  H: 0.701,
  I: 0.341,
  J: 0.453,
  K: 0.675,
  L: 0.567,
  M: 0.906,
  N: 0.703,
  O: 0.697,
  P: 0.663,
  Q: 0.697,
  R: 0.682,
  S: 0.616,
  T: 0.63,
  U: 0.697,
  V: 0.716,
  W: 0.989,
  X: 0.691,
  Y: 0.708,
  Z: 0.612,
  0: 0.656,
  1: 0.486,
  2: 0.584,
  3: 0.602,
  4: 0.655,
  5: 0.59,
  6: 0.65,
  7: 0.567,
  8: 0.649,
  9: 0.65,
  '&': 0.856,
  '-': 0.406,
  '’': 0.28,
  "'": 0.274,
  '.': 0.325,
  ',': 0.326,
  ':': 0.342,
  ';': 0.345,
  '!': 0.333,
  '?': 0.542,
  '(': 0.398,
  ')': 0.398,
  '/': 0.53,
  '+': 0.549,
};
// A character that is not in the table counts as the widest letter (W).
const DEFAULT_ADVANCE = 0.989;
// The display headings use `letterSpacing: '-0.04em'`.
const LETTER_SPACING = -0.04;
// Chrome on Linux rounds each advance and the letter spacing to whole pixels.
// That makes a word up to about 0.7px wider for each letter at all sizes
// (1.4px for a word of one repeated letter). These give space for it.
const ROUNDING_PER_LETTER = 1;
const ROUNDING_FACTOR = 1.01;

// The width of the page without its vertical scroll bar. useScrollLock sets
// `--scrollbar-width` on the body.
export const PAGE_WIDTH = '100vw - var(--scrollbar-width, 0px)';

type WidestWord = {em: number; letters: number};

// The width of the widest word of `text` in capitals, in em, and the number of
// letters in the longest word. A line can break after a hyphen, so each part
// of a hyphenated word counts as a word.
export function widestWord(text: string): WidestWord {
  let em = 0;
  let letters = 0;
  for (const word of text.toUpperCase().replace(/-/g, '- ').split(/\s+/)) {
    let width = 0;
    for (const char of word) {
      width +=
        (GINTO_NORD_CONDENSED_ADVANCES[char] ?? DEFAULT_ADVANCE) +
        LETTER_SPACING;
    }
    em = Math.max(em, width);
    letters = Math.max(letters, [...word].length);
  }
  return {em: em * ROUNDING_FACTOR, letters};
}

// `fontSize` and `lineHeight` (in pixels) for a heading of `text`, made
// smaller in proportion when its widest word is wider than `lineWidth` (a CSS
// length expression).
export function fitText(
  text: string,
  fontSize: number,
  lineHeight: number,
  lineWidth: string,
): StyleObject {
  const {em, letters} = widestWord(text);
  if (em === 0) {
    return {fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px`};
  }
  const width = `(${lineWidth} - ${letters * ROUNDING_PER_LETTER}px)`;
  const lineHeightEm = (em * fontSize) / lineHeight;
  return {
    fontSize: `min(${fontSize}px, calc(${width} / ${em.toFixed(4)}))`,
    lineHeight: `min(${lineHeight}px, calc(${width} / ${lineHeightEm.toFixed(4)}))`,
  };
}

// The text of a React node.
export function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textOf).join('');
  }
  if (React.isValidElement<{children?: React.ReactNode}>(node)) {
    return textOf(node.props.children);
  }
  return '';
}
