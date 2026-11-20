import {localeStaticProps} from '@/i18n-static';

// The Features page in French, at /fr/features: the English page, with the
// French catalog (src/i18n-static.ts).
export {default} from '../../features';

export const getStaticProps = localeStaticProps('fr', '/features');
