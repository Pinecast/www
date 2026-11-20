import {localeStaticProps} from '@/i18n-static';

// The testimonial transcripts in Danish, at /da/testimonial-transcripts: the
// English page, with the Danish catalog (src/i18n-static.ts). The transcripts
// stay in English: they are what the customers say in their recordings.
export {default} from '../testimonial-transcripts';

export const getStaticProps = localeStaticProps(
  'da',
  '/testimonial-transcripts',
);
