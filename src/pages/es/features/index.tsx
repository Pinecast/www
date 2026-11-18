import {localeStaticProps} from '@/i18n-static';

// The Features page in Spanish, at /es/features: the English page, with the
// Spanish catalog (src/i18n-static.ts).
export {default} from '../../features';

export const getStaticProps = localeStaticProps('es', '/features');
