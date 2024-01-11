import * as React from 'react';

let cachedScrollbarWidth: number | null = null;

const calculateScrollbarWidth = (): number => {
  if (cachedScrollbarWidth !== null) {
    return cachedScrollbarWidth;
  }
  let scrollbarWidth = window.innerWidth - document.body.offsetWidth;
  if (scrollbarWidth === 0) {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText =
      'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
  }
  return scrollbarWidth;
};

const getScrollbarWidth = (): number => {
  if (cachedScrollbarWidth === null) {
    cachedScrollbarWidth = calculateScrollbarWidth();
  }
  return cachedScrollbarWidth!;
};

export function useScrollLock() {
  const initialPaddingRightRef = React.useRef(new Map<HTMLElement, number>());

  const lock = React.useCallback(() => {
    const scrollbarWidth = getScrollbarWidth();
    const originalPaddingRight = parseFloat(
      window.getComputedStyle(document.body).paddingRight ?? 0,
    );
    initialPaddingRightRef.current.set(document.body, originalPaddingRight);
    document.body.style.paddingRight = `${
      originalPaddingRight + scrollbarWidth
    }px`;
    document.body.style.overflow = 'hidden';
  }, []);

  const unlock = React.useCallback(() => {
    document.body.style.overflow = 'unset';
    const originalPaddingRight = initialPaddingRightRef.current.get(
      document.body,
    );
    document.body.style.paddingRight = `${originalPaddingRight}px`;
  }, []);

  return [lock, unlock];
}
