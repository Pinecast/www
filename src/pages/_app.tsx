import {Provider as StyletronProvider} from 'styletron-react';
import type {AppProps} from 'next/app';
import {IntlProvider} from 'react-intl';

import {styletron} from '../styletron';
import {AudioManagerProvider} from '@/components/AudioManagerContext';
import {DEFAULT_LOCALE, localeOf, type LocaleProps} from '@/i18n';
import Head from 'next/head';

export default function App({Component, pageProps}: AppProps<LocaleProps>) {
  return (
    <IntlProvider
      locale={localeOf(pageProps)}
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
