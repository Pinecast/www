import Head from 'next/head';
import * as React from 'react';

import {Footer} from '@/components/Footer';
import {Globe} from '@/components/Globe';
import {HeroV2} from '@/components/HeroV2';
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
import {TunedInHeader, TunedInPanels} from '@/components/TunedIn';

const STICKY_LINE_SIZE = 1.5;

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
        <link rel="prefetch" href="/videos/hero/central.av1.mp4" />
        <link rel="prefetch" href="/images/globe-full.jpg" />
        <link rel="prefetch" href="/videos/Footer2x.mp4" />
      </Head>
      {/* {!splashEnded && <SplashIntro onComplete={() => setSplashEnded(true)} />} */}
      <MainLogo />
      <MainHeader />
      <HeroV2 />
      <Globe />
      {/* Boundary for the sticky horizontal line to move through. */}
      <div>
        {/* The line moves above the sibling background wrappers and behind the section's elements. */}
        <StickyLine
          color="var(--color-white)"
          invertColor
          size={STICKY_LINE_SIZE}
          zIndex={2}
        />

        <div
          className={css({
            // The Testimonials section is sand beige by default and dynamically changes on scroll.
            backgroundColor: 'var(--page-bg, var(--color-sand))',
            marginTop: `${-1 * STICKY_LINE_SIZE}px`,
            transition: 'background-color 0.2s ease-in-out',
          })}
        >
          <StandardMarqueeDivider
            topBackgroundColor="var(--color-space)"
            bottomBackgroundColor="transparent"
          />
          <Testimonials topPosition={-1 * MARQUEE_HEIGHT} zIndex={2} />
        </div>

        <div
          className={css({
            // When this section is scrolled into the viewport, the <body>'s bg color still uses the light theme
            // (sand beige). When this section is scrolled to the top of the viewport, the <body>'s bg color becomes space black.
            // This wrapper forces a persistent space-black bg behind this section and the sticky line.
            backgroundColor: 'var(--color-space)',
          })}
        >
          {/* The Tuned-In section is split into two components because the sticky line stops before the panels are fully scrolled to. */}
          <TunedInHeader zIndex={2} />
        </div>
      </div>
      <TunedInPanels />
      <Pricing />
      <Footer />
    </>
  );
}
