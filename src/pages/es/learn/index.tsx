import {localeStaticProps} from '@/i18n-static';

// The Learn page in Spanish, at /es/learn: the English page, with the Spanish
// catalog (src/i18n-static.ts).
export {default} from '../../learn';

export const getStaticProps = localeStaticProps('es', '/learn');
