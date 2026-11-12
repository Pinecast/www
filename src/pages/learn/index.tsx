import Head from 'next/head';
import * as React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

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
import {MAIN_CONTENT_ID, SkipLink} from '@/components/SkipLink';

export default function Features() {
  const intl = useIntl();
  return (
    <>
      <Head>
        <title>
          {intl.formatMessage({
            description: 'Title of the Learn page, in the browser tab',
            defaultMessage: 'Learn – Pinecast',
          })}
        </title>
        <meta
          name="description"
          content={intl.formatMessage({
            description:
              'Description of the Learn page, for search engines and link previews',
            defaultMessage: 'Get started on your podcast journey',
          })}
        />
      </Head>
      <SkipLink />
      <MainLogo startDark />
      <MainHeader />
      <main id={MAIN_CONTENT_ID}>
        <div>
          <Header />
          <StickyLine
            color="var(--color-white)"
            invertColor
            size={1.5}
            zIndex={2}
          />
        </div>
        <TunedInPanels headingLevel={2} />
      </main>
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
        <FormattedMessage
          description="Heading of the Learn page. Each {br} is a line break: the words are big, and the lines are short"
          defaultMessage="Hit the{br}ground{br}running"
          values={{br: <br />}}
        />
      </H1>
      <Body4
        style={{maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto'}}
      >
        <FormattedMessage
          description="Introduction under the heading of the Learn page"
          defaultMessage="Pinecast has tools for podcasters of all experience levels. Whether you are just getting started or running a podcast for a business, we have your back."
        />
      </Body4>
    </div>
  );
};
