import NextLink from 'next/link';
import * as React from 'react';

import {usePageLocale} from '@/i18n';
import {linkTarget} from '@/locales.mjs';

// next/link, for every link of the site (eslint.config.mjs stops an import of
// next/link anywhere else). A link names a page by its English route
// (`/features`). On a page in another language, it goes to that page in the
// same language where there is one, and to the English page otherwise, marked
// `hreflang="en"` (`linkTarget` in src/locales.mjs). So a page added to
// TRANSLATED_ROUTES gets its links with no change to them.
//
// A link that sets `hrefLang` has chosen its language, as the language links
// of the footer and of the language suggestion have: it goes where it says.
export default function Link({
  href,
  hrefLang,
  ...rest
}: React.ComponentProps<typeof NextLink>) {
  const locale = usePageLocale();
  const target =
    typeof href === 'string' && hrefLang === undefined
      ? linkTarget(href, locale)
      : {href, hrefLang};
  return <NextLink {...rest} href={target.href} hrefLang={target.hrefLang} />;
}
