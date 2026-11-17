import {defineMessages} from 'react-intl';

// The messages of the English-only notice (src/components/EnglishOnlyNotice.tsx).
// The notice speaks the reader's language on an English page, so a policy page
// carries these messages in each language of the site (`englishOnlyStaticProps`
// in src/i18n-static.ts). They are in a module of their own so that the build
// can read their ids without the component.
export const ENGLISH_ONLY_MESSAGES = defineMessages({
  text: {
    description:
      'In a box at the top of a legal document of the website (the privacy policy, the terms of use, the list of subprocessors, the use of AI). It is shown only to a reader of this language, in this language, on the English page, which is not translated: it says that the document is in English only. "English" is the language of the document',
    defaultMessage: 'This document is only in English.',
  },
  contact: {
    description:
      'Second sentence of the box that says a legal document is only in English. {email} is the support email address of Pinecast, which <link> makes a link. It promises nothing about the language of the reply',
    defaultMessage: 'Questions? Write to <link>{email}</link>.',
  },
});

// The address that the notice gives, as the terms of use do.
export const SUPPORT_EMAIL = 'support@pinecast.com';
