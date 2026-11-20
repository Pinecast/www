import {localeStaticProps} from '@/i18n-static';

// The Learn page in French, at /fr/learn: the English page, with the French
// catalog (src/i18n-static.ts).
export {default} from '../../learn';

export const getStaticProps = localeStaticProps('fr', '/learn');
