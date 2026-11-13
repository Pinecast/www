import {Provider as StyletronProvider} from 'styletron-react';
import type {AppProps} from 'next/app';
import {IntlProvider} from 'react-intl';

import {styletron} from '../styletron';
import {AudioManagerProvider} from '@/components/AudioManagerContext';
import {DEFAULT_LOCALE, languageTagOf, type LocaleProps} from '@/i18n';
import Head from 'next/head';
import * as React from 'react';

export default function App({Component, pageProps}: AppProps<LocaleProps>) {
  // _document sets `<html lang>` in the exported HTML. A client-side visit to
  // a page in another language (a <Link> from /es/ to /features) keeps that
  // document, so the language has to follow the page here too (WCAG 3.1.1).
  const lang = languageTagOf(pageProps);
  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return (
    <IntlProvider
      locale={lang}
      defaultLocale={DEFAULT_LOCALE}
      messages={pageProps.messages}
    >
      <StyletronProvider value={styletron}>
        <AudioManagerProvider>
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          <Component {...pageProps} />
        </AudioManagerProvider>
      </StyletronProvider>
    </IntlProvider>
  );
}
