import {localeStaticProps} from '@/i18n-static';

// The home page in German, at /de/: the English page, with the German
// catalog (src/i18n-static.ts). scripts/finish-export.mjs moves it from
// out/de.html to out/de/index.html.
export {default} from '../index';

export const getStaticProps = localeStaticProps('de', '/');
