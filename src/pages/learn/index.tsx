import Head from 'next/head';
import * as React from 'react';

import {Footer} from '@/components/Footer';
import {MainHeader} from '@/components/MainHeader';
import {MainLogo} from '@/components/MainLogo';
import {useCSS} from '@/hooks/useCSS';
import {Body4, H1} from '@/components/Typography';
import {useDarkSection} from '@/hooks/useDarkSection';
import {MIN_TABLET_MEDIA_QUERY, MOBILE_MEDIA_QUERY} from '@/constants';
import {InfoPageFooterUpsell} from '@/components/InfoPageFooterUpsell';
import {TunedInPanels} from '@/components/TunedIn';
import {StickyLine} from '@/components/StickyLine';

export default function Features() {
  return (
    <>
      <Head>
        <title>Learn – Pinecast</title>
        <meta
          name="description"
          content="Get started on your podcast journey"
        />
      </Head>
      <MainLogo startDark />
      <MainHeader />
      <div>
        <Header />
        <StickyLine
          color="var(--color-white)"
          invertColor
          size={1.5}
          zIndex={2}
        />
      </div>
      <TunedInPanels />
      <InfoPageFooterUpsell />
      <Footer />
    </>
  );
}

const Header = () => {
  const css = useCSS();
  const ref = React.useRef<HTMLDivElement>(null);
  useDarkSection(ref);
  return (
    <div
      ref={ref}
      className={css({
        backgroundColor: 'var(--color-space)',
        color: 'var(--color-white)',
        paddingTop: '120px',
        paddingBottom: '60px',
        textAlign: 'center',
        [MIN_TABLET_MEDIA_QUERY]: {paddingBottom: '200px'},
      })}
    >
      <H1
        style={{
          marginBottom: '20px',
          padding: '0 5%',
          [MIN_TABLET_MEDIA_QUERY]: {marginBottom: '50px'},
        }}
      >
        Hit the
        <br />
        ground
        <br />
        running
      </H1>
      <Body4
        style={{maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto'}}
      >
        Pinecast has tools for podcasters of all experience levels. Whether you
        are just getting started or running a podcast for a business, we have
        your back.
      </Body4>
    </div>
  );
};
