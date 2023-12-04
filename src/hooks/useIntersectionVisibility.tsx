import * as React from 'react';

const elementMap = new Map<HTMLElement, (isIntersecting: boolean) => void>();

const observer =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(entries => {
        entries.forEach(({target, isIntersecting}) => {
          elementMap.get(target as HTMLElement)?.(isIntersecting);
        });
      })
    : undefined;

export const useIntersectionVisibility = (
  ref: React.RefObject<HTMLElement>,
  callback: (isIntersecting: boolean) => void,
) => {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    if (elementMap.has(element)) {
      throw new Error('Cannot observe the same element twice');
    }
    elementMap.set(element, callback);
    observer?.observe(element);
    return () => {
      elementMap.delete(element);
      observer?.unobserve(element);
    };
  }, [ref, callback]);
};
