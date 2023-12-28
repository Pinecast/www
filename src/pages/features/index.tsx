import Head from 'next/head';
import * as React from 'react';

import {Footer} from '@/components/Footer';
import {MainHeader} from '@/components/MainHeader';
import {MainLogo} from '@/components/MainLogo';
import {useCSS} from '@/hooks/useCSS';
import {H1, Link, PillButton} from '@/components/Typography';
import {StandardMarqueeDivider} from '@/components/MarqueeDivider';
import {useDarkSection} from '@/hooks/useDarkSection';
import {
  MIN_DESKTOP_MEDIA_QUERY,
  MIN_TABLET_MEDIA_QUERY,
  MOBILE_MEDIA_QUERY,
} from '@/constants';
import {InfoPageFooterUpsell} from '@/components/InfoPageFooterUpsell';
import {
  GintoNordCondensed,
  MonumentGroteskBold,
  MonumentGroteskRegular,
} from '@/fonts';
import {Collapse} from '@/icons/Collapse';
import {Expand} from '@/icons/Expand';
import {Expandable} from '@/components/Expandable';

export default function Features() {
  return (
    <>
      <Head>
        <title>Features – Pinecast</title>
        <meta
          name="description"
          content="All the features you could want from a podcast hosting service"
        />
      </Head>
      <MainLogo />
      <MainHeader />
      <Header />
      <StandardMarqueeDivider
        marqueeColor="var(--color-sand)"
        textColor="var(--color-space)"
        topBackgroundColor="var(--color-space)"
        bottomBackgroundColor="var(--color-sand)"
      />
      <FeatureAccordion />
      <StandardMarqueeDivider
        topBackgroundColor="var(--color-sand)"
        bottomBackgroundColor="var(--color-space)"
      />
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
        paddingTop: '200px',
        paddingBottom: '40px',
        textAlign: 'center',
        [MOBILE_MEDIA_QUERY]: {
          paddingTop: '120px',
          paddingBottom: '0',
        },
      })}
    >
      <PillButton style={{textTransform: 'uppercase', marginBottom: '30px'}}>
        Features Index
      </PillButton>
      <H1
        style={{
          padding: '0 5%',
          [MIN_TABLET_MEDIA_QUERY]: {marginBottom: '50px'},
        }}
      >
        Tuned-in to
        <br />
        your needs
      </H1>
    </div>
  );
};

type Feature = {
  name: string;
  url?: string;
  description: string;
};

export const FEATURES: Array<Feature> = [
  {
    name: 'Analytics',
    url: '/features/analytics',
    description:
      "See where your listeners are coming from and how they're listening.",
  },
  {
    name: 'Art Optimization',
    description:
      "If you upload an image that doesn't meet the requirements for podcast or episode artwork, we'll fix it for you with a single click.",
  },
  {
    name: 'Collaborators',
    url: '/features/collaborators',
    description:
      'Invite your co-hosts and producers to help you manage your show.',
  },
  {
    name: 'Distribution',
    url: '/features/distribution',
    description:
      'Get your show on all the major podcast platforms with a single click.',
  },
  {
    name: 'Embeddable App Links',
    description:
      'Embed HTML code for your podcast that lets your website visitors open your show in their favorite podcast app.',
  },
  {
    name: 'Embeddable Players',
    url: '/features/embeddable-players',
    description:
      'Embed a player on your website that lets your visitors listen to individual episodes or your whole podcast.',
  },
  {
    name: 'Episode Metadata',
    description:
      "If your episode's MP3 doesn't include all of the metadata tags that podcast apps expect, we'll fill in the blanks for you with a single click—without overwriting custom metadata.",
  },
  {
    name: 'Feedback',
    url: '/features/feedback',
    description:
      'Get feedback from your listeners collected to a single dashboard with a simple, customizable form. Moderation features protect against spam and abuse.',
  },
  {
    name: 'JSON Feed',
    description:
      "We don't just provide RSS, we offer an easy-to-parse JSON Feed-compliant feed for every podcast as well.",
  },
  {
    name: 'Monetization',
    url: '/features/monetization',
    description:
      "Earn money from your podcast with listener support. Mark episodes as paid-only and we'll handle subscriptions and payments processing.",
  },
  {
    name: 'Networks',
    description:
      "Create a group for all the podcasters and shows in your network. We'll provide a single dashboard for managing your network's shows and analytics.",
  },
  {
    name: 'Notifications',
    description:
      'Get notifications via email, Slack, Discord, or webhooks when episodes are published, hit analytics milestones, when your podcast receives tips, and more.',
  },
  {
    name: 'Password Protection',
    description:
      'Protect your podcast feed and website with a password that you can share with your listeners.',
  },
  {
    name: 'Referrals',
    description:
      "Earn account credit for referring other podcasters to Pinecast. For every referral that stays a customer, we'll give you two months of our Starter plan.",
  },
  {
    name: 'Podcast Websites',
    description:
      'Set up a website for your show with a single click—no coding required. Customize the layout and appearance of your site and know that it will work great on any device. SEO included.',
  },
  {
    name: 'Review Monitoring',
    url: '/features/review-monitoring',
    description:
      "Let us take care of keeping track of your reviews. We'll crawl reviews left on Podchaser and Apple Podcasts in every region and send you an email when a new one is found.",
  },
  {
    name: 'Seasons & Episodes',
    description:
      "Add season and episode numbers to your episode automatically. For apps that don't use Apple's official numbering tags, we'll tastefully add the numbers to episode titles.",
  },
  {
    name: 'Short Links',
    url: '/features/short-links',
    description:
      'Create short links for your podcast and episodes that are perfectly optimized for social media. Track clicks and see where your listeners are coming from.',
  },
  {
    name: 'Transcripts',
    description:
      "Pinecast will transcribe up to four hours of audio per month at no extra cost. We'll recognize and remember your speakers, and you can edit the transcript right in your browser.",
  },
].sort((a, b) => a.name.localeCompare(b.name));

const FeatureAccordion = React.memo(function FeatureAccordion() {
  const css = useCSS();

  const [selectedName, setSelectedName] = React.useState<string | null>(null);

  return (
    <ul
      className={css({
        backgroundColor: 'var(--color-sand)',
        listStyle: 'none',
        margin: 0,
        padding: '80px 0 120px',
      })}
    >
      {FEATURES.map(feature => {
        return (
          <FeatureAccordionItem
            key={feature.name}
            feature={feature}
            onSelectName={setSelectedName}
            selected={selectedName === feature.name}
          />
        );
      })}
    </ul>
  );
});

const BACKGROUND_TICK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg viewBox="0 0 11 16" width="11" height="16" xmlns="http://www.w3.org/2000/svg"><line x1="3" x2="8" y1="0" y2="0" stroke="#090909" opacity="0.5" /></svg>`.trim(),
  );

const FeatureAccordionItem = React.memo(function FeatureAccordionItem({
  feature,
  onSelectName,
  selected,
}: {
  feature: Feature;
  onSelectName: (name: string | null) => void;
  selected: boolean;
}) {
  const css = useCSS();
  return (
    <li
      className={css({
        borderBottom: '1px solid var(--color-space)',
        backgroundColor: selected
          ? 'var(--color-grape-50)'
          : 'var(--color-sand)',
        backgroundImage: `url("${BACKGROUND_TICK}"), url("${BACKGROUND_TICK}")`,
        backgroundPosition: 'left 14px, right 14px',
        backgroundRepeat: 'repeat-y, repeat-y',
        transition: 'background-color 0.2s',
      })}
    >
      <button
        onClick={() => onSelectName(selected ? null : feature.name)}
        type="button"
        className={css({
          backgroundColor: selected
            ? 'var(--color-grape-50)'
            : 'var(--color-sand)',
          backgroundImage: `url("${BACKGROUND_TICK}"), url("${BACKGROUND_TICK}")`,
          backgroundPosition: 'left 14px, right 14px',
          backgroundRepeat: 'repeat-y, repeat-y',
          border: 0,
          color: selected ? 'var(--color-space)' : 'var(--color-sand)',
          display: 'block',
          fontSize: '18px',
          fontWeight: 700,
          overflow: 'hidden',
          padding: '0',
          position: 'relative',
          transition: 'background-color 0.2s, color 0.2s, height 0.2s',
          width: '100%',
          willChange: 'height',

          '::before': {
            display: 'block',
            content: '""',
            height: '1px',
            width: '100%',
            position: 'absolute',
            top: '30px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-space)',
            opacity: selected ? 1 : 0,
            transition: 'opacity 0.2s',
            zIndex: 2,
          },

          [MIN_TABLET_MEDIA_QUERY]: {
            height: selected ? '80px' : '60px',
          },
        })}
      >
        <div
          className={css({
            ...MonumentGroteskBold,
            color: 'var(--color-space)',
            position: 'absolute',
            display: 'none',
            left: '43px',
            backgroundColor: selected
              ? 'var(--color-grape-50)'
              : 'var(--color-sand)',
            top: '0',
            transition: 'background-color 0.2s, color 0.2s',
            width: '60px',
            height: '60px',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            [MIN_TABLET_MEDIA_QUERY]: {display: 'flex'},
          })}
          role="presentation"
        >
          {feature.name.charAt(0)}
        </div>
        <span
          className={css({
            ...GintoNordCondensed,
            backgroundColor: selected
              ? 'var(--color-grape-50)'
              : 'var(--color-sand)',
            transition: 'background-color 0.2s, -webkit-text-stroke 0.2s',
            color: 'currentColor',
            WebkitTextStroke: selected
              ? '1px transparent'
              : '1px var(--color-space)',
            textTransform: 'uppercase',
            fontSize: '28px',
            lineHeight: '60px',
            padding: '0 20px',
            position: 'relative',
            textDecoration: 'none',
            zIndex: 3,
            [MIN_TABLET_MEDIA_QUERY]: {
              fontSize: '36px',
              top: '10px',
            },
            [MIN_DESKTOP_MEDIA_QUERY]: {fontSize: '80px'},
          })}
        >
          {feature.name}
        </span>
        <span
          role="presentation"
          className={css({
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selected
              ? 'var(--color-grape-50)'
              : 'var(--color-sand)',
            transition: 'background-color 0.2s',
            position: 'absolute',
            top: 0,
            right: '43px',
            height: '60px',
            width: '60px',
            zIndex: 3,
            display: 'none',
            [MIN_TABLET_MEDIA_QUERY]: {display: 'flex'},
          })}
        >
          {selected ? (
            <Collapse
              size={24}
              color="var(--color-space)"
              plusColor="var(--color-grape-50)"
            />
          ) : (
            <Expand
              size={24}
              color="var(--color-space)"
              plusColor="var(--color-sand)"
            />
          )}
        </span>
      </button>
      <Expandable
        open={selected}
        innerStyle={{
          textAlign: 'center',
          padding: '8px 10px 20px 10px',
        }}
      >
        <p className={css({...MonumentGroteskRegular})}>
          {feature.description}
        </p>
        {feature.url && (
          <div
            className={css({
              backgroundColor: 'var(--color-space)',
              borderRadius: '32px',
              display: 'inline-block',
              padding: '4px 12px',
            })}
          >
            <Link href={feature.url}>Learn more</Link>
          </div>
        )}
      </Expandable>
    </li>
  );
});
