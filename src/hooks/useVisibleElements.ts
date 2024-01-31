import * as React from 'react';

type CustomIntersectionObserverInit = {
  root?: React.RefObject<HTMLElement> | null;
  rootMargin?: string;
  threshold?: number | number[];
};

export function useVisibleElements(
  elementsRef: React.MutableRefObject<Element[]>,
  observerOptions: CustomIntersectionObserverInit = {},
) {
  const [visibleElements, setVisibleElements] = React.useState<Array<Element>>(
    [],
  );
  const {root, rootMargin, threshold} = observerOptions;

  React.useEffect(() => {
    if (typeof window.IntersectionObserver === 'undefined') {
      return;
    }

    const isElementVisible = new Map<Element, boolean>();

    const observerOptions: IntersectionObserverInit = {
      root: root?.current ?? document,
      rootMargin,
      threshold,
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(({target, isIntersecting}) =>
        isElementVisible.set(target, isIntersecting),
      );
      setVisibleElements(
        [...isElementVisible.entries()]
          .filter(([, isVisible]) => isVisible)
          .map(([element]) => element),
      );
    }, observerOptions);

    elementsRef.current.forEach(element => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [JSON.stringify(threshold), rootMargin]); // eslint-disable-line react-hooks/exhaustive-deps

  return visibleElements;
}
