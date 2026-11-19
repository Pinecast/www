import {localeStaticProps} from '@/i18n-static';

// The testimonial transcripts in Portuguese, at /pt/testimonial-transcripts:
// the English page, with the Portuguese catalog (src/i18n-static.ts). The
// transcripts stay in English: they are what the customers say in their
// recordings.
export {default} from '../testimonial-transcripts';

export const getStaticProps = localeStaticProps(
  'pt',
  '/testimonial-transcripts',
);
