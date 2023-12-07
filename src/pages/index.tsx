import Head from 'next/head';
import * as React from 'react';

import {Footer} from '@/components/Footer';
import {Globe} from '@/components/Globe';
import {Hero} from '@/components/Hero';
import {MainHeader} from '@/components/MainHeader';
import {MainLogo} from '@/components/MainLogo';
import {SplashIntro} from '@/components/SplashIntro';
import {MarqueeDivider} from '@/components/MarqueeDivider';
import {Pricing} from '@/components/Pricing';

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
      {/* {!splashEnded && <SplashIntro onComplete={() => setSplashEnded(true)} />} */}
      <MainLogo />
      <MainHeader />
      <Hero />
      <Globe />
      <MarqueeDivider
        topBackgroundColor="#090909"
        bottomBackgroundColor="#F8F4EB"
      >
        {MarqueeDivider.MarqueeDividerBullet('Kick-ass customer support')}
        {MarqueeDivider.MarqueeDividerBullet('Fair, no-nonsense pricing')}
        {MarqueeDivider.MarqueeDividerBullet(
          'Everything you need to be successful',
        )}
        {MarqueeDivider.MarqueeDividerBullet(
          'Built by podcasters, for podcasters',
        )}
        {MarqueeDivider.MarqueeDividerBullet(
          'Billions of listens served since 2015',
        )}
        {MarqueeDivider.MarqueeDividerBullet('Get paid for your content')}
        {MarqueeDivider.MarqueeDividerBullet(
          "You're the customer, not the product",
        )}
        {MarqueeDivider.MarqueeDividerBullet(
          'Worry about your next episode, not your host',
        )}
        {MarqueeDivider.MarqueeDividerBullet(
          '$0 advertising budget, 100% focus on great software',
        )}
        {MarqueeDivider.MarqueeDividerBullet(
          'Your batteries-included podcast host',
        )}
        {MarqueeDivider.MarqueeDividerBullet(
          'Crafted with care in Raleigh, NC',
        )}
      </MarqueeDivider>
      <Pricing />
      <Footer />
    </>
  );
}
