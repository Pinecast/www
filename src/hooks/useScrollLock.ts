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
  const lock = React.useCallback(() => {
    const scrollbarWidth = getScrollbarWidth();
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';
  }, []);

  const unlock = React.useCallback(() => {
    document.body.style.overflow = 'unset';
    document.body.style.paddingRight = '0';
  }, []);

  return [lock, unlock];
}
