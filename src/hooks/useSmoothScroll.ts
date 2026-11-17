import * as React from 'react';

// Set on <html> once the first load is over. _document turns on
// `scroll-behavior: smooth` from it, and only under no-preference motion.
//
// Why not smooth from the start: a link to a section (`/terms#spotify`) makes
// the browser scroll to the section while the page is still loading. With a
// smooth scroll it picks where the scroll ends at that moment, and does not
// follow the target when the height above it changes later: an element that
// shows after hydration, a font that loads, a heading that fits its words
// (useFitWords). The target ends too low, or off screen at 400% zoom. An
// instant scroll lets the browser keep the target in place until the load is
// over. After the load, links in the page and the skip link scroll smoothly.
export const SMOOTH_SCROLL_ATTRIBUTE = 'data-smooth-scroll';

// Turns on smooth scrolling for the rest of the visit, after the load event
// and the fonts. Put it in _app: the attribute stays through client-side
// navigation, which is a scroll that the visitor started.
export function useSmoothScroll() {
  React.useEffect(() => {
    const root = document.documentElement;
    let cancelled = false;
    const enable = () => {
      // The headings that fit their words measure after the fonts, in a
      // frame (tests/helpers.ts: headingsFitted). A second frame lets that
      // settle before a scroll can be smooth.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) {
            root.setAttribute(SMOOTH_SCROLL_ATTRIBUTE, '');
          }
        }),
      );
    };
    const afterFonts = () => {
      (document.fonts?.ready ?? Promise.resolve()).then(enable, enable);
    };
    if (document.readyState === 'complete') {
      afterFonts();
      return () => {
        cancelled = true;
      };
    }
    window.addEventListener('load', afterFonts, {once: true});
    return () => {
      cancelled = true;
      window.removeEventListener('load', afterFonts);
    };
  }, []);
}
