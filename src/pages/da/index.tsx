import {localeStaticProps} from '@/i18n-static';

// The home page in Danish, at /da/: the English page, with the Danish
// catalog (src/i18n-static.ts). scripts/finish-export.mjs moves it from
// out/da.html to out/da/index.html.
export {default} from '../index';

export const getStaticProps = localeStaticProps('da', '/');
