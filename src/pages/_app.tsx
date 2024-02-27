import {Provider as StyletronProvider} from 'styletron-react';
import type {AppProps} from 'next/app';

import {styletron} from '../styletron';
import {
  AudioManagerProvider,
  SoundEffectSource,
} from '@/components/AudioManagerContext';
import Head from 'next/head';
import {AudioMimeType, useAsyncAudio} from '@/hooks/useAsyncResource';
import {SoundEffect} from '@/hooks/useAudioManager';

const {MP3} = AudioMimeType;
const SHOULD_LOAD = true;

export default function App({Component, pageProps}: AppProps) {
  const clickDrop = useAsyncAudio({[MP3]: SoundEffect.CLICK_DROP}, SHOULD_LOAD);

  const soundEffects: SoundEffectSource[] = [
    [SoundEffect.CLICK_DROP, ...clickDrop],
  ];

  return (
    <StyletronProvider value={styletron}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AudioManagerProvider soundEffects={soundEffects}>
        <Component {...pageProps} />
      </AudioManagerProvider>
    </StyletronProvider>
  );
}
