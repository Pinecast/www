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

    return () => {
      handlers.delete(handler);
    };
  }, [handler]);
};

const clamp = (input: number, min: number, max: number) =>
  Math.max(min, Math.min(input, max));

export const useScrollProgress = (
  containerRef: React.RefObject<HTMLElement>,
) => {
  const [scrollRatio, setScrollRatio] = React.useState<number>(0);

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
      // Calculate a value, `percentagePosition`, which indicates the percentage of the
      // way through the element `containerRef.current` is through the viewport. 0% should
      // represent when the top of the element appears on-screen (from the bottom of the
      // viewport or if the element is at the top of the page), and 100% should represent
      // when the bottom of the element disappears off the top of the screen (or if the
      // viewport reaches the bottom of the page).
      const minScrollPosition =
        containerTop < windowHeight ? 0 : containerTop - windowHeight;
      const percentagePosition = clamp(
        (scrollY - minScrollPosition) / containerHeight,
        0,
        1,
      );

      setScrollRatio(percentagePosition);
    },
    [containerRef],
  );

  useScrollListener(handler);

  return scrollRatio;
};
