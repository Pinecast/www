import {localeStaticProps} from '@/i18n-static';

// The Learn page in Danish, at /da/learn: the English page, with the Danish
// catalog (src/i18n-static.ts).
export {default} from '../../learn';

export const getStaticProps = localeStaticProps('da', '/learn');
