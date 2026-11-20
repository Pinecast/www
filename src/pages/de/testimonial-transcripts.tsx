import {localeStaticProps} from '@/i18n-static';

// The testimonial transcripts in German, at /de/testimonial-transcripts: the
// English page, with the German catalog (src/i18n-static.ts). The transcripts
// stay in English: they are what the customers say in their recordings.
export {default} from '../testimonial-transcripts';

export const getStaticProps = localeStaticProps(
  'de',
  '/testimonial-transcripts',
);
