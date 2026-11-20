import {localeStaticProps} from '@/i18n-static';

// The Features page in German, at /de/features: the English page, with the
// German catalog (src/i18n-static.ts).
export {default} from '../../features';

export const getStaticProps = localeStaticProps('de', '/features');
