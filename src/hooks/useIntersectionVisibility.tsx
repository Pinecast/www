import * as React from 'react';

export const useIntersectionVisibility = (
  ref: React.RefObject<HTMLElement>,
  callback: (isIntersecting: boolean) => void,
) => {
  const elementMapRef = React.useRef(new Map<HTMLElement, (isIntersecting: boolean) => void>());
  React.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const elementMap = elementMapRef.current;
    if (elementMap.has(element)) {
      throw new Error('Cannot observe the same element twice');
    }
    elementMap.set(element, callback);
    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(entries => {
            entries.forEach(({target, isIntersecting}) => {
              elementMap.get(target as HTMLElement)?.(isIntersecting);
            });
          })
        : undefined;
    observer?.observe(element);
    return () => {
      elementMap.delete(element);
      observer?.unobserve(element);
      observer?.disconnect();
    };
  }, [ref, callback]);
};
