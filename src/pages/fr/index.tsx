import {localeStaticProps} from '@/i18n-static';

// The home page in French, at /fr/: the English page, with the French
// catalog (src/i18n-static.ts). scripts/finish-export.mjs moves it from
// out/fr.html to out/fr/index.html.
export {default} from '../index';

export const getStaticProps = localeStaticProps('fr', '/');
