import * as React from 'react';
import {
  FormattedMessage,
  IntlProvider,
  type MessageDescriptor,
  useIntl,
} from 'react-intl';

import {MIN_TABLET_MEDIA_QUERY} from '@/constants';
import {ENGLISH_ONLY_MESSAGES, SUPPORT_EMAIL} from '@/englishOnlyMessages';
import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import {DEFAULT_LOCALE, EnglishOnlyCatalogsContext} from '@/i18n';
import {DISMISSED, preferredLocale, readLanguageChoice} from '@/languageChoice';
import {LOCALES, languageTag} from '@/locales.mjs';

// The policies stay in English (Matt, 2026-11-12). On each of them, a reader
// of another language that the site has gets a note above the text, in their
// language: the document is in English only, and where to write with a
// question (Matt, 2026-11-16). Their language is the one that they chose on
// the site (src/languageChoice.ts), or else their browser's first one that
// the site has. A choice of English means no note.
//
// It renders nothing on the server: it appears once the page runs. Put it at
// the top of the policy's text, and give the page `englishOnlyStaticProps`
// (src/i18n-static.ts), which brings its messages in each language.
export const EnglishOnlyNotice = () => {
  const catalogs = React.useContext(EnglishOnlyCatalogsContext);
  const [language, setLanguage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const choice = readLanguageChoice();
    const reader =
      choice && choice !== DISMISSED && LOCALES.includes(choice)
        ? choice
        : preferredLocale(
            navigator.languages?.length
              ? navigator.languages
              : [navigator.language],
          );
    // Without its messages in that language, there is no note: English
    // words marked as another language would be worse.
    setLanguage(
      reader && reader !== DEFAULT_LOCALE && catalogs?.[reader] ? reader : null,
    );
  }, [catalogs]);

  if (!language) {
    return null;
  }
  return (
    <IntlProvider
      locale={languageTag(language)}
      defaultLocale={DEFAULT_LOCALE}
      messages={catalogs?.[language]}
    >
      <Note language={language} />
    </IntlProvider>
  );
};

const Note = ({language}: {language: string}) => {
  const css = useCSS();
  const intl = useIntl();
  return (
    <div
      role="note"
      lang={languageTag(language)}
      className={css({
        ...MonumentGroteskBold,
        border: '2px solid var(--color-space)',
        borderRadius: '22px',
        boxSizing: 'border-box',
        color: 'var(--color-space)',
        fontSize: '18px',
        lineHeight: '24px',
        marginBottom: '60px',
        marginLeft: 'var(--text-gutter)',
        marginRight: 'var(--text-gutter)',
        marginTop: 0,
        maxWidth: '40em',
        padding: '16px 22px',
        textAlign: 'left',
        [MIN_TABLET_MEDIA_QUERY]: {
          fontSize: '22px',
          lineHeight: '30px',
          marginBottom: '100px',
        },
      })}
    >
      <p className={css({margin: 0})}>
        {intl.formatMessage(ENGLISH_ONLY_MESSAGES.text)}
      </p>
      <p className={css({margin: 0})}>
        <FormattedMessage
          // defineMessages types it as taking no values.
          {...(ENGLISH_ONLY_MESSAGES.contact as MessageDescriptor)}
          values={{
            email: SUPPORT_EMAIL,
            link: (chunks: React.ReactNode) => (
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className={css({
                  color: 'inherit',
                  textUnderlineOffset: '0.2em',
                })}
              >
                {chunks}
              </a>
            ),
          }}
        />
      </p>
    </div>
  );
};
