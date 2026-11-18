import {localeStaticProps} from '@/i18n-static';

// The Collaborators page in Spanish, at /es/features/collaborators: the text
// that Lingo.dev translated from content/en/ (do not edit it: change the
// English), with the Spanish catalog for the rest of the page.
export {default} from '../../../../content/es-419/features/collaborators.mdx';

export const getStaticProps = localeStaticProps(
  'es',
  '/features/collaborators',
);
