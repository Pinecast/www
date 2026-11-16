import * as React from 'react';

// Makes a display heading smaller where its widest word is wider than the
// heading, so that no word breaks in the middle or runs off the page (WCAG
// 1.4.10), also with the text spacing of 1.4.12. A heading whose words fit
// keeps its size, so English stays as it is. It is for a heading whose words
// can be long, such as a translation of a short English heading. fitText does
// the same in CSS for a heading whose line width is a formula of the page
// width, but it cannot see text spacing, and the headings of the home page sit
// in parents that shrink to their content.
//
// The heading sets its sizes as `calc(<size> * var(--fit, 1))`, and this sets
// `--fit`. It measures each word with a Range, at full size and with no break
// inside a word, against the room that the heading has (availableWidth). It
// measures again when the heading or its parent changes size (the page width,
// a font that loads, text spacing that changes the line height), and when its
// text changes, as in a visit from one language to the other that keeps the
// element.
//
// The room is in CSS pixels, and zoom makes the page narrower in CSS pixels.
// Thus, at 200% zoom a heading with a long word grows less than 200%, as a
// title of fitText does (see the note there: finding www-title-fit-zoom, a
// known gap). Below 320 CSS pixels this reaches English headings too.
//
// The heading renders with `data-fit="pending"`, and this sets it to "done"
// after each measure, so that a test can wait for it (tests/helpers.ts).
// Until the script runs, `overflow-wrap: break-word` on the heading keeps a
// long word on the page. After it, the heading has `overflow-wrap: normal`:
// a word made to fit its line exactly could still break there by a fraction
// of a pixel.
export function useFitWords<T extends HTMLElement>(enabled: boolean) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || typeof ResizeObserver === 'undefined') {
      return;
    }
    let frame = 0;
    const fit = () => {
      frame = 0;
      element.style.removeProperty('--fit');
      element.style.overflowWrap = 'normal';
      // A pixel to spare, for the rounding of the line breaker.
      const width = availableWidth(element) - 1;
      // Glyphs are rounded to pixels at each size, so a word made smaller in
      // proportion can still be a little too wide: measure again.
      let scale = 1;
      for (let pass = 0; pass < 4 && width > 0; pass++) {
        const widest = widestWord(element);
        if (widest <= width) {
          break;
        }
        scale = Math.floor(scale * (width / widest) * 1000) / 1000;
        element.style.setProperty('--fit', String(scale));
      }
      element.dataset.fit = 'done';
    };
    const measure = () => {
      element.dataset.fit = 'pending';
      if (!frame) {
        frame = requestAnimationFrame(fit);
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.parentElement) {
      observer.observe(element.parentElement);
    }
    // New words can keep the size of the box. This one watches the text only:
    // the measure itself changes the heading's attributes.
    const textObserver = new MutationObserver(measure);
    textObserver.observe(element, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    document.fonts?.addEventListener('loadingdone', measure);
    measure();
    return () => {
      observer.disconnect();
      textObserver.disconnect();
      document.fonts?.removeEventListener('loadingdone', measure);
      cancelAnimationFrame(frame);
      element.style.overflowWrap = '';
    };
  }, [enabled]);
  return ref;
}

// The widest that the content box of `element` can be: the content box of each
// ancestor, and each `max-width` on the way, less the padding, borders and
// margins between it and `element`. The width of the heading itself says
// nothing when a parent shrinks to its content: in a flex column that centers
// its items, an item is never narrower than its longest word, so a word that
// does not fit widens the heading and its parent past the page. A negative
// margin, as in the Tuned-in section, gives room back.
function availableWidth(element: HTMLElement): number {
  let available = Infinity;
  // The space between the content box of `node` and that of `element`.
  let between = 0;
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.parentElement
  ) {
    const style = getComputedStyle(node);
    if (style.display === 'contents' || style.display === 'inline') {
      continue;
    }
    const padding = pixels(style.paddingLeft) + pixels(style.paddingRight);
    const border =
      pixels(style.borderLeftWidth) + pixels(style.borderRightWidth);
    if (node !== element) {
      available = Math.min(available, node.clientWidth - padding - between);
    }
    if (style.maxWidth.endsWith('px')) {
      const maxContent =
        pixels(style.maxWidth) -
        (style.boxSizing === 'border-box' ? padding + border : 0);
      available = Math.min(available, maxContent - between);
    }
    between +=
      padding + border + pixels(style.marginLeft) + pixels(style.marginRight);
  }
  return available;
}

function pixels(value: string): number {
  return parseFloat(value) || 0;
}

// The width in pixels of the widest word of `element`. A line can break after
// a hyphen, so each part of a hyphenated word counts as a word, as in
// splitWords (tests/helpers.ts).
function widestWord(element: HTMLElement): number {
  let widest = 0;
  const range = document.createRange();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    for (const match of node.textContent!.matchAll(/[^\s-]+-?/g)) {
      range.setStart(node, match.index!);
      range.setEnd(node, match.index! + match[0].length);
      widest = Math.max(widest, range.getBoundingClientRect().width);
    }
  }
  return widest;
}
