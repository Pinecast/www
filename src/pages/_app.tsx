import {Provider as StyletronProvider} from 'styletron-react';
import type {AppProps} from 'next/app';

import {styletron} from '../styletron';
import {AudioManagerProvider} from '@/components/AudioManagerContext';
import Head from 'next/head';

export default function App({Component, pageProps}: AppProps) {
  return (
    <StyletronProvider value={styletron}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AudioManagerProvider>
        <Component {...pageProps} />
      </AudioManagerProvider>
    </StyletronProvider>
  );
}
