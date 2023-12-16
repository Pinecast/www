import * as React from 'react';

export const useDismiss = (
  activeElementRef: React.RefObject<HTMLElement>,
  callback?: () => void,
  dismissOnClickOutside: boolean = true,
) => {
  React.useEffect(() => {
    const element = activeElementRef.current;
    if (!element) {
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
      if (
        evt.defaultPrevented ||
        !dismissOnClickOutside ||
        element?.contains(evt.target as Node)
      ) {
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
  }, [activeElementRef, callback, dismissOnClickOutside]);
};
