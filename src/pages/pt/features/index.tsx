import {localeStaticProps} from '@/i18n-static';

// The Features page in Portuguese, at /pt/features: the English page, with the
// Portuguese catalog (src/i18n-static.ts).
export {default} from '../../features';

export const getStaticProps = localeStaticProps('pt', '/features');
