import {defineMessages} from 'react-intl';

// The messages of the language suggestion (src/components/LanguageSuggestion.tsx).
// The card speaks the language that it suggests, not the language of the page,
// so a page carries these messages in each of its other languages
// (`suggestionCatalogs` in src/i18n-static.ts). They are in a module of their
// own so that the build can read their ids without the component.
export const SUGGESTION_MESSAGES = defineMessages({
  label: {
    description:
      'Screen reader name of a small box at the bottom of a page. It is shown to a reader whose browser prefers this language, on a version of the page in another language, and offers the page in this language. It is written in this language, whatever the language of the page',
    defaultMessage: 'Language',
  },
  text: {
    description:
      'Sentence in a small box at the bottom of a page, shown to a reader whose browser prefers this language, on a version of the page in another language. "English" is the language this sentence is written in: a translation names its own language instead (in Spanish, "español"), because the reader sees it in their language',
    defaultMessage: 'This page is in English too.',
  },
  link: {
    description:
      'Link under the sentence "This page is in English too.", in the same small box. It opens this page in the language of the link. "English" is the language this link is written in: a translation names its own language instead (in Spanish, "español")',
    defaultMessage: 'Read it in English',
  },
  close: {
    description:
      'Screen reader name of the button with an × that closes the small box that offers this page in this language. The box does not come back after it is closed',
    defaultMessage: 'Close',
  },
});
