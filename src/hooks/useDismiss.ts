import * as React from 'react';

// While `active`, Escape, a click outside the element or a right-click calls
// `callback`. While not active, the hook listens to nothing, so that it does
// not take Escape from the rest of the page.
export const useDismiss = (
  activeElementRef: React.RefObject<HTMLElement | null>,
  callback?: () => void,
  active: boolean = true,
) => {
  React.useEffect(() => {
    const element = activeElementRef.current;
    if (!element || !active) {
      return;
    }

    const handleCallback = () => {
      callback?.();
    };

    const handleKeyboardEvent = (evt: KeyboardEvent) => {
      if (evt.key !== 'Escape') {
        return;
      }
      evt.preventDefault();
      evt.stopPropagation();
      handleCallback();
    };

    const handleMouseEvent = (evt: MouseEvent) => {
      if (evt.defaultPrevented || element?.contains(evt.target as Node)) {
        return;
      }
      evt.preventDefault();
      evt.stopPropagation();
      handleCallback();
    };

    document.addEventListener('keydown', handleKeyboardEvent);
    document.addEventListener('click', handleMouseEvent);
    document?.addEventListener('contextmenu', handleCallback);

    return () => {
      document.removeEventListener('keydown', handleKeyboardEvent);
      document.removeEventListener('click', handleMouseEvent);
      document.removeEventListener('contextmenu', handleCallback);
    };
  }, [activeElementRef, callback, active]);
};
