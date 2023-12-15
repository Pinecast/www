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

function useMatchMedia(query: string) {
  const [matches, setMatches] = React.useState<boolean>(() => getMatches(query));
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = ({matches}: MediaQueryListEvent) => setMatches(matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export default useMatchMedia;
