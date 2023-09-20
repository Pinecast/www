import Head from 'next/head';
import * as React from 'react';

import {Footer} from '@/components/Footer';
import {Globe} from '@/components/Globe';
import {Hero} from '@/components/Hero';
import {MainHeader} from '@/components/MainHeader';
import {MainLogo} from '@/components/MainLogo';
import {SplashIntro} from '@/components/SplashIntro';

export default function Home() {
  const [splashEnded, setSplashEnded] = React.useState(false);

  return (
    <>
      <Head>
        <title>Pinecast</title>
        <meta
          name="description"
          content="Kick-ass podcast hosting for the 21st century"
        />
      </Head>
      {!splashEnded && <SplashIntro onComplete={() => setSplashEnded(true)} />}
      <MainLogo />
      <MainHeader />
      <Hero />
      <Globe />
      <Footer />
    </>
  );
}
