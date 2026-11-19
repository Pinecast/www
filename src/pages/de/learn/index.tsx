import {localeStaticProps} from '@/i18n-static';

// The Learn page in German, at /de/learn: the English page, with the German
// catalog (src/i18n-static.ts).
export {default} from '../../learn';

export const getStaticProps = localeStaticProps('de', '/learn');
