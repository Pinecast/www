import * as React from 'react';

// Marks an element that stays usable while a modal is open. The header menu
// puts this on the elements that show above its dim overlay, because a mouse
// user can still click them there.
const ABOVE_OVERLAY_ATTRIBUTE = 'data-above-overlay';
export const aboveOverlayProps = {[ABOVE_OVERLAY_ATTRIBUTE]: true};

// Elements that are not page content, or that must keep announcing.
const SKIPPED_TAGS = new Set([
  'link',
  'next-route-announcer',
  'script',
  'style',
  'template',
]);

// Makes everything on the page inert except the marked elements and their
// ancestors. Returns a function that undoes it.
const makeOthersInert = (keep: Array<Element>) => {
  const changed: Array<Element> = [];
  const visit = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (keep.includes(child)) {
        continue;
      }
      if (keep.some(element => child.contains(element))) {
        visit(child);
        continue;
      }
      if (SKIPPED_TAGS.has(child.localName) || child.hasAttribute('inert')) {
        continue;
      }
      child.setAttribute('inert', '');
      changed.push(child);
    }
  };
  visit(document.body);
  return () => {
    for (const element of changed) {
      element.removeAttribute('inert');
    }
  };
};

// While `active`, the page behind a modal is inert: the keyboard, the mouse and
// assistive technology cannot reach it.
export const useInertOutside = (active: boolean) => {
  React.useEffect(() => {
    if (!active) {
      return;
    }
    return makeOthersInert(
      Array.from(document.querySelectorAll(`[${ABOVE_OVERLAY_ATTRIBUTE}]`)),
    );
  }, [active]);
};
