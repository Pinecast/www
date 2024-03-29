import * as React from 'react';

const sections = new Set<HTMLElement>();
const handler = () => {
  const scrollY = window.scrollY;
  const height = window.innerHeight;
  for (const section of sections) {
    if (
      section.offsetTop >= 0 &&
      section.offsetTop <= scrollY &&
      section.offsetTop + section.offsetHeight > scrollY
    ) {
      document.body.setAttribute('style', '');
      document.body.classList.add('darkSection');
      return;
    }
  }
  document.body.classList.remove('darkSection');
};
if (typeof window !== 'undefined') {
  document.addEventListener('scroll', handler, {passive: true});
}

export const useDarkSection = (sectionRef: React.RefObject<HTMLElement>) => {
  React.useEffect(() => {
    const section = sectionRef.current!;
    sections.add(section);
    handler();

    return () => {
      sections.delete(section);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
