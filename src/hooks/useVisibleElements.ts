import * as React from 'react';

export function useVisibleElements(
  // elements: Element[],
  elementsRef: React.MutableRefObject<Element[]>,
  observerOptions?: IntersectionObserverInit,
) {
  const observerOptionsRef = React.useRef(observerOptions);

  const [visibleElements, setVisibleElements] = React.useState<Array<Element>>(
    [],
  );

  React.useEffect(() => {
    if (typeof window.IntersectionObserver === 'undefined') {
      return;
    }

    const isElementVisible = new Map<Element, boolean>();

    const observer = new IntersectionObserver(entries => {
      entries.forEach(({target, isIntersecting}) =>
        isElementVisible.set(target, isIntersecting),
      );
      setVisibleElements(
        [...isElementVisible.entries()]
          .filter(([, isVisible]) => isVisible)
          .map(([element]) => element),
      );
    }, observerOptionsRef.current);

    (elementsRef.current).forEach(element => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [elementsRef]);

  return visibleElements;
}
