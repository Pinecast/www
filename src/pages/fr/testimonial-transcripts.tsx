import {localeStaticProps} from '@/i18n-static';

// The testimonial transcripts in French, at /fr/testimonial-transcripts: the
// English page, with the French catalog (src/i18n-static.ts). The transcripts
// stay in English: they are what the customers say in their recordings.
export {default} from '../testimonial-transcripts';

export const getStaticProps = localeStaticProps(
  'fr',
  '/testimonial-transcripts',
);
