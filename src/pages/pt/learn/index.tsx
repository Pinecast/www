import {localeStaticProps} from '@/i18n-static';

// The Learn page in Portuguese, at /pt/learn: the English page, with the
// Portuguese catalog (src/i18n-static.ts).
export {default} from '../../learn';

export const getStaticProps = localeStaticProps('pt', '/learn');
