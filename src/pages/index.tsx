import Head from 'next/head';
import * as React from 'react';

import {Footer} from '@/components/Footer';
import {Globe} from '@/components/Globe';
import {Hero} from '@/components/Hero';
import {MainHeader} from '@/components/MainHeader';
import {MainLogo} from '@/components/MainLogo';
import {SplashIntro} from '@/components/SplashIntro';
import {
  MARQUEE_HEIGHT,
  StandardMarqueeDivider,
} from '@/components/MarqueeDivider';
import {Pricing} from '@/components/Pricing';
import {Testimonials} from '@/components/Testimonials';
import {StickyLine} from '@/components/StickyLine';
import {useCSS} from '@/hooks/useCSS';
import {TunedIn} from '@/components/TunedIn';

export default function Home() {
  const css = useCSS();
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
      {/* {!splashEnded && <SplashIntro onComplete={() => setSplashEnded(true)} />} */}
      <MainLogo />
      <MainHeader />
      <Hero />
      <Globe />
      <div
        // Contain the bounds of the sticky horizontal line down the page center
        className={css({
          position: 'relative',
          zIndex: 1,
        })}
      >
        <StickyLine color="var(--color-space)" zIndex={2} />
        <StandardMarqueeDivider
          topBackgroundColor="var(--color-space)"
          bottomBackgroundColor="transparent"
        />
        <Testimonials topPosition={-1 * MARQUEE_HEIGHT} />
      </div>
      <TunedIn />
      <Pricing />
      <Footer />
    </>
  );
}
