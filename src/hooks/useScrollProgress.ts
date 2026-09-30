import * as React from 'react';

const handlers = new Set<(scrollY: number, windowHeight: number) => void>();
const handler = () => {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  for (const handler of handlers) {
    handler(scrollY, windowHeight);
  }
};
if (typeof window !== 'undefined') {
  document.addEventListener('scroll', handler, {passive: true});
}

export const useScrollListener = (
  handler: (scrollY: number, windowHeight: number) => void,
) => {
  React.useEffect(() => {
    handlers.add(handler);
    handler(window.scrollY, window.innerHeight);

    return () => {
      handlers.delete(handler);
    };
  }, [handler]);
};

const clamp = (input: number, min: number, max: number) =>
  Math.max(min, Math.min(input, max));

// The scroll progress of a container is a number from 0 to 1. It is 0 when the
// top of the container appears on the screen (from the bottom of the window,
// or at the top of the page), and 1 when the bottom of the container goes off
// the top of the screen (or when the window reaches the end of the page).
const getScrollStart = (container: HTMLElement, windowHeight: number) =>
  container.offsetTop < windowHeight ? 0 : container.offsetTop - windowHeight;

export const getScrollProgress = (
  container: HTMLElement,
  scrollY: number,
  windowHeight: number,
) =>
  clamp(
    (scrollY - getScrollStart(container, windowHeight)) /
      container.offsetHeight,
    0,
    1,
  );

// The scroll position at which the container has this progress: the inverse of
// `getScrollProgress`. Scroll to it to show what the progress picks.
export const getScrollForProgress = (
  container: HTMLElement,
  progress: number,
  windowHeight: number,
) =>
  getScrollStart(container, windowHeight) + progress * container.offsetHeight;

export const useScrollProgressEffect = (
  containerRef: React.RefObject<HTMLElement | null>,
  callback: (scrollRatio: number) => void,
) => {
  const handler = React.useCallback(
    (scrollY: number, windowHeight: number) => {
      if (!containerRef.current) return;

      const {offsetTop: containerTop, offsetHeight: containerHeight} =
        containerRef.current;
      if (
        containerTop - windowHeight > scrollY ||
        containerTop + containerHeight < scrollY
      ) {
        // console.log('Ignoring off-screen section');
        return;
      }
      callback(getScrollProgress(containerRef.current, scrollY, windowHeight));
    },
    [containerRef, callback],
  );

  useScrollListener(handler);
};

export const useScrollProgress = (
  containerRef: React.RefObject<HTMLElement | null>,
) => {
  const [scrollRatio, setScrollRatio] = React.useState<number>(0);
  useScrollProgressEffect(containerRef, setScrollRatio);
  return scrollRatio;
};
