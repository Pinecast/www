import * as React from 'react';

const getMatches = (query: string) => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia === 'undefined'
  ) {
    return false;
  }
  return Boolean(window.matchMedia(query).matches);
};

function useMatchMedia(mediaQuery: string) {
  // Strip any `@media ` prefix (if a `CSSMediaRule` is passed instead of a `CSSOMString`).
  const query = `${mediaQuery}`.replace(/^@media\s*/, '');
  const [matches, setMatches] = React.useState<boolean>(() => getMatches(query));
  React.useEffect(() => {
    if (typeof window.matchMedia === 'undefined') {
      return;
    }
    const mq = window.matchMedia(query);
    const handler = (evt: MediaQueryListEvent) => setMatches(evt.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export default useMatchMedia;
