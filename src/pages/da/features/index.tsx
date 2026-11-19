import {localeStaticProps} from '@/i18n-static';

// The Features page in Danish, at /da/features: the English page, with the
// Danish catalog (src/i18n-static.ts).
export {default} from '../../features';

export const getStaticProps = localeStaticProps('da', '/features');
