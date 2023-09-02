import {Provider as StyletronProvider} from 'styletron-react';
import type {AppProps} from 'next/app';

import {styletron} from '../styletron';
import Head from 'next/head';

export default function App({Component, pageProps}: AppProps) {
  return (
    <StyletronProvider value={styletron}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </StyletronProvider>
  );
}
