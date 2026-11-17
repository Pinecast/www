import Router from 'next/router';
import * as React from 'react';

// Set on <html> once a page has loaded. _document turns on
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
//
// A visit to another page in the browser (a <Link> to `/terms#spotify`) is
// the same case: Next.js scrolls to the section as the new page renders, and
// the page grows after that. So the attribute goes off when the visit starts,
// and comes back when the new page has settled.
export const SMOOTH_SCROLL_ATTRIBUTE = 'data-smooth-scroll';

// Turns smooth scrolling on after the load event and the fonts, and off for
// the length of each client-side visit. Put it in _app.
export function useSmoothScroll() {
  React.useEffect(() => {
    const root = document.documentElement;
    let cancelled = false;
    // Each call that waits for the page to settle replaces the one before it:
    // a visit that starts while the last one waits keeps smooth scrolling off.
    let pending = 0;
    const settle = () => {
      const token = ++pending;
      const enable = () => {
        // The headings that fit their words measure after the fonts, in a
        // frame (tests/helpers.ts: headingsFitted). A second frame lets that
        // settle before a scroll can be smooth.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (!cancelled && token === pending) {
              root.setAttribute(SMOOTH_SCROLL_ATTRIBUTE, '');
            }
          }),
        );
      };
      (document.fonts?.ready ?? Promise.resolve()).then(enable, enable);
    };
    const suspend = () => {
      pending++;
      root.removeAttribute(SMOOTH_SCROLL_ATTRIBUTE);
    };

    Router.events.on('routeChangeStart', suspend);
    Router.events.on('routeChangeComplete', settle);
    Router.events.on('routeChangeError', settle);

    const onLoad = () => settle();
    if (document.readyState === 'complete') {
      settle();
    } else {
      window.addEventListener('load', onLoad, {once: true});
    }
    return () => {
      cancelled = true;
      window.removeEventListener('load', onLoad);
      Router.events.off('routeChangeStart', suspend);
      Router.events.off('routeChangeComplete', settle);
      Router.events.off('routeChangeError', settle);
    };
  }, []);
}
