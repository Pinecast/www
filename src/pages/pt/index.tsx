import {localeStaticProps} from '@/i18n-static';

// The home page in Portuguese, at /pt/: the English page, with the Portuguese
// catalog (src/i18n-static.ts). scripts/finish-export.mjs moves it from
// out/pt.html to out/pt/index.html.
export {default} from '../index';

export const getStaticProps = localeStaticProps('pt', '/');
