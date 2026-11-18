import {defaultLocaleStaticProps} from '@/i18n-static';

// The text of the page is in content/en/features/collaborators.mdx, which
// Lingo.dev translates into content/<language>/ (README.md, "Translations").
// The page is only the address and the props: a translation must not carry
// them.
export {default} from '../../../content/en/features/collaborators.mdx';

// The page is in Spanish too: the language suggestion needs its messages in
// Spanish (src/i18n-static.ts).
export const getStaticProps = defaultLocaleStaticProps(
  '/features/collaborators',
);
