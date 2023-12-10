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
      if (evt.key === 'Escape') {
        evt.preventDefault();
        evt.stopPropagation();
        handleCallback();
      }
    };

    const handleMouseEvent = (evt: MouseEvent) => {
      if (evt.defaultPrevented) {
        return;
      }
      if (
        !element?.contains(evt.target as Node) ||
        evt.target === document.body
      ) {
        evt.preventDefault();
        evt.stopPropagation();
        handleCallback();
      }
    };

    let window: Document | null = null;

    let timoutID: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      timoutID = null;
      document.addEventListener('keydown', handleKeyboardEvent);
      // if (dismissOnClickOutside) {
        window?.addEventListener('click', handleMouseEvent, true);
      // }
    }, 0);

    return () => {
      if (timoutID) {
        clearTimeout(timoutID);
      }
      document.removeEventListener('keydown', handleKeyboardEvent);
      window?.removeEventListener('click', handleMouseEvent, true);
      window?.removeEventListener('contextmenu', handleMouseEvent, true);
      window?.removeEventListener('mousedown', handleMouseEvent, true);
      window?.removeEventListener('scroll', handleCallback, true);
    };
  }, [activeElementRef, callback, dismissOnClickOutside]);
};
