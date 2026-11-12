import Head from 'next/head';
import * as React from 'react';
import {
  defineMessage,
  FormattedMessage,
  type MessageDescriptor,
  useIntl,
} from 'react-intl';

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
  PREFERS_REDUCED_MOTION_QUERY,
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
import {MAIN_CONTENT_ID, SkipLink} from '@/components/SkipLink';

export default function Features() {
  const intl = useIntl();
  return (
    <>
      <Head>
        <title>
          {intl.formatMessage({
            description: 'Title of the Features page, in the browser tab',
            defaultMessage: 'Features – Pinecast',
          })}
        </title>
        <meta
          name="description"
          content={intl.formatMessage({
            description:
              'Description of the Features page, for search engines and link previews',
            defaultMessage:
              'All the features you could want from a podcast hosting service',
          })}
        />
      </Head>
      <SkipLink />
      <MainLogo startDark />
      <MainHeader />
      <main id={MAIN_CONTENT_ID}>
        <Header />
        <StandardMarqueeDivider
          marqueeColor="var(--color-sand)"
          textColor="var(--color-space)"
          topBackgroundColor="var(--color-space)"
          bottomBackgroundColor="var(--color-sand)"
        />
        <FeatureAccordion />
      </main>
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
        <FormattedMessage
          description="Label above the heading of the Features page, in a pill. Shown in capital letters"
          defaultMessage="Features Index"
        />
      </PillButton>
      <H1
        style={{
          padding: '0 5%',
          [MIN_TABLET_MEDIA_QUERY]: {marginBottom: '50px'},
        }}
      >
        <FormattedMessage
          description="Big heading of the Features page. {br} is a line break: the words are big, and the lines are short"
          defaultMessage="Tuned-in to{br}your needs"
          values={{br: <br />}}
        />
      </H1>
    </div>
  );
};

type Feature = {
  // Stable, not shown: the React key, and which row is open.
  key: string;
  name: MessageDescriptor;
  url?: string;
  description: MessageDescriptor;
};

// FeatureAccordion sorts the list by the names, as they are shown.
export const FEATURES: Array<Feature> = [
  {
    key: 'accessibility',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Accessibility',
    }),
    url: '/features/accessibility',
    description: defineMessage({
      description:
        'What the Accessibility feature does, shown when its row on the Features page is open',
      defaultMessage:
        'We treat accessibility like a feature, not an afterthought. We are obsessive over making Pinecast the most accessible hosting platform in the world for users who need many different kinds of affordances.',
    }),
  },
  {
    key: 'analytics',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Analytics',
    }),
    url: '/features/analytics',
    description: defineMessage({
      description:
        'What the Analytics feature does, shown when its row on the Features page is open',
      defaultMessage:
        'See where your listeners are coming from and how they’re listening.',
    }),
  },
  {
    key: 'art-optimization',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Art Optimization',
    }),
    description: defineMessage({
      description:
        'What the Art Optimization feature does, shown when its row on the Features page is open',
      defaultMessage:
        'If you upload an image that doesn’t meet the requirements for podcast or episode artwork, we’ll fix it for you with a single click.',
    }),
  },
  {
    key: 'clip-insertion',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Clip Insertion',
    }),
    url: '/features/clip-insertion',
    description: defineMessage({
      description:
        'What the Clip Insertion feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Keep your back catalog fresh with clip insertion. Automatically insert audio clips into your episodes, no matter how recently the episodes were published.',
    }),
  },
  {
    key: 'collaborators',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Collaborators',
    }),
    url: '/features/collaborators',
    description: defineMessage({
      description:
        'What the Collaborators feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Invite your co-hosts and producers to help you manage your show.',
    }),
  },
  {
    key: 'distribution',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Distribution',
    }),
    url: '/features/distribution',
    description: defineMessage({
      description:
        'What the Distribution feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Get your show on all the major podcast platforms with a single click.',
    }),
  },
  {
    key: 'email-privacy',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Email Privacy',
    }),
    url: '/features/email-privacy',
    description: defineMessage({
      description:
        'What the Email Privacy feature does, shown when its row on the Features page is open',
      defaultMessage: 'Keep your personal email private.',
    }),
  },
  {
    key: 'embeddable-app-links',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Embeddable App Links',
    }),
    description: defineMessage({
      description:
        'What the Embeddable App Links feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Embed HTML code for your podcast that lets your website visitors open your show in their favorite podcast app.',
    }),
  },
  {
    key: 'embeddable-players',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Embeddable Players',
    }),
    url: '/features/embeddable-players',
    description: defineMessage({
      description:
        'What the Embeddable Players feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Embed a player on your website that lets your visitors listen to individual episodes or your whole podcast.',
    }),
  },
  {
    key: 'episode-metadata',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Episode Metadata',
    }),
    description: defineMessage({
      description:
        'What the Episode Metadata feature does, shown when its row on the Features page is open',
      defaultMessage:
        'If your episode’s MP3 doesn’t include all of the metadata tags that podcast apps expect, we’ll fill in the blanks for you with a single click—without overwriting custom metadata.',
    }),
  },
  {
    key: 'feedback',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Feedback',
    }),
    url: '/features/feedback',
    description: defineMessage({
      description:
        'What the Feedback feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Get feedback from your listeners collected to a single dashboard with a simple, customizable form. Moderation features protect against spam and abuse.',
    }),
  },
  {
    key: 'icebox',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Icebox',
    }),
    url: '/features/icebox',
    description: defineMessage({
      description:
        'What the Icebox feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Sometimes you need to take a break from podcasting for a while. If your account has been inactive for a while, you can switch to our Icebox plan and keep your show online for a low monthly rate.',
    }),
  },
  {
    key: 'json-feed',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'JSON Feed',
    }),
    description: defineMessage({
      description:
        'What the JSON Feed feature does, shown when its row on the Features page is open',
      defaultMessage:
        'We don’t just provide RSS, we offer an easy-to-parse JSON Feed-compliant feed for every podcast as well.',
    }),
  },
  {
    key: 'monetization',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Monetization',
    }),
    url: '/features/monetization',
    description: defineMessage({
      description:
        'What the Monetization feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Earn money from your podcast with listener support. Mark episodes as paid-only and we’ll handle subscriptions and payments processing.',
    }),
  },
  {
    key: 'networks',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Networks',
    }),
    description: defineMessage({
      description:
        'What the Networks feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Create a group for all the podcasters and shows in your network. We’ll provide a single dashboard for managing your network’s shows and analytics.',
    }),
  },
  {
    key: 'notifications',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Notifications',
    }),
    description: defineMessage({
      description:
        'What the Notifications feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Get notifications via email, Slack, Discord, or webhooks when episodes are published, hit analytics milestones, when your podcast receives tips, and more.',
    }),
  },
  {
    key: 'password-protection',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Password Protection',
    }),
    description: defineMessage({
      description:
        'What the Password Protection feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Protect your podcast feed and website with a password that you can share with your listeners.',
    }),
  },
  {
    key: 'podcast-chapters',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Podcast Chapters',
    }),
    url: '/features/podcast-chapters',
    description: defineMessage({
      description:
        'What the Podcast Chapters feature does, shown when its row on the Features page is open',
      defaultMessage:
        "Link your listeners to specific timecodes within your episode. This helps folks find the exact segment they're looking for within a larger episode.",
    }),
  },
  {
    key: 'referrals',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Referrals',
    }),
    description: defineMessage({
      description:
        'What the Referrals feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Earn account credit for referring other podcasters to Pinecast. For every referral that stays a customer, we’ll give you two months of our Starter plan.',
    }),
  },
  {
    key: 'podcast-websites',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Podcast Websites',
    }),
    description: defineMessage({
      description:
        'What the Podcast Websites feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Set up a website for your show with a single click—no coding required. Customize the layout and appearance of your site and know that it will work great on any device. SEO included.',
    }),
  },
  {
    key: 'review-monitoring',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Review Monitoring',
    }),
    url: '/features/review-monitoring',
    description: defineMessage({
      description:
        'What the Review Monitoring feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Let us take care of keeping track of your reviews. We’ll crawl reviews left on Podchaser and Apple Podcasts in every region and send you an email when a new one is found.',
    }),
  },
  {
    key: 'seasons-and-episodes',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Seasons & Episodes',
    }),
    description: defineMessage({
      description:
        'What the Seasons & Episodes feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Add season and episode numbers to your episode automatically. For apps that don’t use Apple’s official numbering tags, we’ll tastefully add the numbers to episode titles.',
    }),
  },
  {
    key: 'short-links',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Short Links',
    }),
    url: '/features/short-links',
    description: defineMessage({
      description:
        'What the Short Links feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Create short links for your podcast and episodes that are perfectly optimized for social media. Track clicks and see where your listeners are coming from.',
    }),
  },
  {
    key: 'transcripts',
    name: defineMessage({
      description:
        'Name of a feature, in the list on the Features page: a row in big capital letters that opens to show what the feature does. On a tablet or a computer the row is one line high and cuts off a second line',
      defaultMessage: 'Transcripts',
    }),
    url: '/features/transcripts',
    description: defineMessage({
      description:
        'What the Transcripts feature does, shown when its row on the Features page is open',
      defaultMessage:
        'Pinecast will transcribe up to four hours of audio per month at no extra cost. We’ll recognize and remember your speakers, and you can edit the transcript right in your browser.',
    }),
  },
];

const FeatureAccordion = React.memo(function FeatureAccordion() {
  const css = useCSS();
  const intl = useIntl();

  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  // In the alphabetical order of the names in the language of the page.
  const features = React.useMemo(
    () =>
      FEATURES.map(feature => ({
        feature,
        name: intl.formatMessage(feature.name),
      })).sort((a, b) => a.name.localeCompare(b.name, intl.locale)),
    [intl],
  );

  return (
    <ul
      className={css({
        backgroundColor: 'var(--color-sand)',
        listStyle: 'none',
        margin: 0,
        padding: '80px 0 120px',
      })}
    >
      {features.map(({feature, name}) => {
        return (
          <FeatureAccordionItem
            key={feature.key}
            feature={feature}
            name={name}
            onSelectName={setSelectedKey}
            selected={selectedKey === feature.key}
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

const TITLE_LINE_HEIGHT = '44px';

// The sizes of a feature row from 1181px wide. See FeatureAccordionItem.
// `titleTop` moves the title from where the row centers it. Set it so that the
// bottom of the capital letters is 1px below the bottom of the row. A different
// title size needs a different value.
const DESKTOP_ROW = {
  height: '70px',
  heightSelected: '80px',
  titleSize: '80px',
  titleTop: '15px',
};
const TABLET_ROW = {
  height: '52px',
  heightSelected: '60px',
  titleSize: '60px',
  titleTop: '10px',
};

const FeatureAccordionItem = React.memo(function FeatureAccordionItem({
  feature,
  name,
  onSelectName,
  selected,
}: {
  feature: Feature;
  // The name of the feature, formatted.
  name: string;
  // Takes the key of the feature, not its name.
  onSelectName: (key: string | null) => void;
  selected: boolean;
}) {
  const css = useCSS();
  const panelId = React.useId();
  return (
    <li
      className={css({
        borderBottom: '1px solid var(--color-space-50)',
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
        onClick={() => onSelectName(selected ? null : feature.key)}
        type="button"
        aria-expanded={selected}
        aria-controls={panelId}
        className={css({
          ...MonumentGroteskBold,
          backgroundColor: selected
            ? 'var(--color-grape-50)'
            : 'var(--color-sand)',
          backgroundImage: `url("${BACKGROUND_TICK}"), url("${BACKGROUND_TICK}")`,
          backgroundPosition: 'left 14px, right 14px',
          backgroundRepeat: 'repeat-y, repeat-y',
          border: 0,
          color: selected ? 'var(--color-space)' : 'var(--color-sand)',
          cursor: selected ? 'unset' : 'pointer',
          display: 'block',
          fontSize: '18px',
          fontWeight: 400,
          overflow: 'hidden',
          padding: '0',
          position: 'relative',
          transition: 'background-color 0.2s, color 0.2s, height 0.2s',
          // The row does not change its height with reduced motion.
          [PREFERS_REDUCED_MOTION_QUERY]: {
            transition: 'background-color 0.2s, color 0.2s',
          },
          width: '100%',
          // The rows touch each other and the edges of the page, and the
          // letter and the name paint over the button's own outline. Draw
          // the ring inside the button, above them.
          ':focus-visible': {outline: 'none'},
          '::after': {
            borderColor: 'var(--color-focus-ring)',
            borderRadius: '2px',
            borderStyle: 'solid',
            borderWidth: '2px',
            content: '""',
            display: 'none',
            // Closer at the bottom, where the name comes down to the line.
            inset: '4px 4px 2px',
            pointerEvents: 'none',
            position: 'absolute',
            zIndex: 4,
          },
          ':focus-visible::after': {display: 'block'},

          '::before': {
            display: 'block',
            content: '""',
            height: '1px',
            width: '100%',
            position: 'absolute',
            top: '34px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-space-50)',
            opacity: selected ? 1 : 0,
            transition: 'opacity 0.2s',
            zIndex: 2,
            // The line goes through the middle of the row.
            [MIN_TABLET_MEDIA_QUERY]: {
              top: 'calc(var(--row-height) / 2 - 1px)',
            },
          },

          // From here the row has a fixed height, and the title is cropped by
          // the bottom of it. The title and the row get their sizes from the
          // variables, so that the crop is the same at all widths: at 1281px
          // and up this is the design (an 80px title in a 70px row). A
          // narrower row, with a smaller title, has the same proportions.
          [MIN_TABLET_MEDIA_QUERY]: {
            '--row-height': TABLET_ROW.height,
            '--row-height-selected': TABLET_ROW.heightSelected,
            '--title-size': TABLET_ROW.titleSize,
            '--title-top': TABLET_ROW.titleTop,
            height: selected
              ? 'var(--row-height-selected)'
              : 'var(--row-height)',
            willChange: 'height',
          },
          [MIN_DESKTOP_MEDIA_QUERY]: {
            '--row-height': DESKTOP_ROW.height,
            '--row-height-selected': DESKTOP_ROW.heightSelected,
            '--title-size': DESKTOP_ROW.titleSize,
            '--title-top': DESKTOP_ROW.titleTop,
          },
        })}
      >
        {/* The letter repeats the first letter of the name. */}
        <span
          aria-hidden="true"
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            [MIN_TABLET_MEDIA_QUERY]: {
              display: 'flex',
              height: 'var(--row-height)',
            },
          })}
        >
          {name.charAt(0)}
        </span>
        <span
          className={css({
            ...GintoNordCondensed,
            backgroundColor: selected
              ? 'var(--color-grape-50)'
              : 'var(--color-sand)',
            transition: 'background-color 0.2s, -webkit-text-stroke 0.2s',
            color: 'currentColor',
            fontWeight: '400',
            WebkitTextStroke: selected
              ? '1px transparent'
              : '1px var(--color-space)',
            textTransform: 'uppercase',
            fontSize: '28px',
            lineHeight: TITLE_LINE_HEIGHT,
            padding: '0 20px',
            position: 'relative',
            textDecoration: 'none',
            zIndex: 3,
            [MIN_TABLET_MEDIA_QUERY]: {
              fontSize: 'var(--title-size)',
              top: 'var(--title-top)',
              // The row has a fixed height and crops the title. When the
              // line height grows (larger text spacing), move the title up by
              // the extra half-leading, so the same part of it shows. At the
              // default line height this is 0. `translate` needs a box, so
              // this is an inline-block (with the same line box as the inline).
              display: 'inline-block',
              translate: `0 calc((${TITLE_LINE_HEIGHT} - 1lh) / 2)`,
            },
          })}
        >
          {name}
        </span>
        <span
          aria-hidden="true"
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
            width: '60px',
            zIndex: 3,
            display: 'none',
            [MIN_TABLET_MEDIA_QUERY]: {
              display: 'flex',
              height: 'var(--row-height)',
            },
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
        id={panelId}
        open={selected}
        innerStyle={{
          textAlign: 'center',
          padding: '8px 10px 20px 10px',
        }}
      >
        <p className={css({...MonumentGroteskRegular})}>
          <FormattedMessage {...feature.description} />
        </p>
        {feature.url && (
          // The link is the dark pill, so that its focus ring goes around
          // the pill, on the light panel. A ring on the pill had its color.
          <Link
            href={feature.url}
            style={{
              backgroundColor: 'var(--color-space)',
              borderRadius: '32px',
              display: 'inline-block',
              padding: '4px 12px',
            }}
          >
            <FormattedMessage
              description="Link in the open row of a feature on the Features page, to the page about the feature"
              defaultMessage="Learn more"
            />
          </Link>
        )}
      </Expandable>
    </li>
  );
});
