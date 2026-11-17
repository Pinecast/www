import {localeStaticProps} from '@/i18n-static';

// The home page in Spanish, at /es/: the English page, with the Spanish
// catalog (src/i18n-static.ts). scripts/finish-export.mjs moves it from
// out/es.html to out/es/index.html.
export {default} from '../index';

export const getStaticProps = localeStaticProps('es', '/');
