import React from 'react';

export const useCalculateResizableValue = (effect: () => void) => {
  React.useEffect(() => {
    const handler = () => {
      effect();
    };
    window.addEventListener('resize', handler);
    effect();
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, [effect]);
};
