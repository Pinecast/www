import {useCSS} from '@/hooks/useCSS';
import {useDarkSection} from '@/hooks/useDarkSection';
import * as React from 'react';
import {FormattedMessage} from 'react-intl';
import {Body3, Body4, H1, H2, Link, Overline, Subhead} from './Typography';
import {GintoNordCondensed} from '@/fonts';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {Check} from '@/icons/Check';
import {Expandable} from './Expandable';
import {Collapse} from '@/icons/Collapse';
import {Expand} from '@/icons/Expand';
import {
  ADAPTIVE_SURFACE,
  BUTTON_RESET,
  DARK_SURFACE,
  MIN_TABLET_MEDIA_QUERY,
  MOBILE_MEDIA_QUERY,
} from '@/constants';
import {useAudioManager} from '@/hooks/useAudioManager';
import {SoundEffect} from '@/hooks/useSoundEffects';

const BUTTON_STYLE = {
  fontSize: '14px',
  lineHeight: '40px',
  paddingLeft: '0px',
  paddingRight: '0px',
  minWidth: '150px',
  [MIN_TABLET_MEDIA_QUERY]: {
    fontSize: '16px',
    height: 'auto',
    paddingTop: '4px',
    paddingBottom: '4px',
  },
};
const MAX_WIDTH = 1300;
// Centered on the dashed line, which is 30px above the buttons.
const MOBILE_NOTCH = {
  backgroundColor: 'var(--color-space)',
  borderRadius: '40px',
  content: '""',
  display: 'block',
  height: '40px',
  position: 'absolute',
  top: '-50px',
  width: '40px',
} as const;

export const Pricing = () => {
  const css = useCSS();

  const sectionRef = React.useRef<HTMLElement>(null);
  useDarkSection(sectionRef);

  return (
    <section
      ref={sectionRef}
      className={css({
        ...DARK_SURFACE,
        backgroundColor: 'var(--color-space)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingBottom: '116px',
        position: 'relative',
        // transform: 'translate3d(0,0,0)',
        zIndex: 1,
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '200px',
          maxWidth: '946px',
          padding: '200px 30px 0',

          '--color-line': '#888',
          '--color-primary-dark': '#fff',
          '--color-primary-light': 'var(--color-space)',
          '--color-theme-mode': 'var(--color-space)',
          '--color-core-accent': '#888',
          color: 'var(--color-primary-dark)',
        })}
      >
        <H1 level={2} style={{textWrap: 'balance'}}>
          <FormattedMessage
            description="Big heading of the pricing section of the home page"
            defaultMessage="Grab your ticket"
          />
        </H1>
        <Body4 style={{maxWidth: '32rem'}}>
          <FormattedMessage
            description="Text under the heading of the pricing section of the home page"
            defaultMessage="Try Pinecast for free. No credit card required, no time limits, upgrade whenever. We think you’ll love it."
          />
        </Body4>
      </div>
      <PricingTicket
        color="var(--color-sand)"
        col1={
          <>
            <Subhead style={{marginBottom: '16px'}}>
              <FormattedMessage
                description="Name of the free plan, on its ticket in the pricing section"
                defaultMessage="Free plan"
              />
            </Subhead>
            <Price
              amount={
                <FormattedMessage
                  description="A price in US dollars, in big numbers before “/ Month” or “/ Year”"
                  defaultMessage="$0"
                />
              }
              perUnit="month"
              color="var(--color-sand)"
            />
          </>
        }
        col2={
          <FeatureList
            features={[
              <FormattedMessage
                key="No time limit"
                description="A feature of the free plan, in the list on its ticket in the pricing section"
                defaultMessage="No time limit"
              />,
              <FormattedMessage
                key="Up to two shows"
                description="A feature of the free plan, in the list on its ticket in the pricing section"
                defaultMessage="Up to two shows"
              />,
              <FormattedMessage
                key="Ten episodes limit"
                description="A feature of the free plan, in the list on its ticket in the pricing section"
                defaultMessage="Ten episodes limit"
              />,
              <FormattedMessage
                key="48MB file sizes"
                description="A feature of the free plan, in the list on its ticket in the pricing section"
                defaultMessage="48MB file sizes"
              />,
              <FormattedMessage
                key="Basic analytics"
                description="A feature of the free plan, in the list on its ticket in the pricing section"
                defaultMessage="Basic analytics"
              />,
            ]}
          />
        }
        col3={
          <>
            <PrimaryButton
              style={BUTTON_STYLE}
              href="https://pinecast.com/signup"
            >
              <FormattedMessage
                description="Button on the ticket of a plan in the pricing section, to the sign-up form"
                defaultMessage="Sign up"
              />
            </PrimaryButton>
            <SecondaryButton
              style={BUTTON_STYLE}
              href="https://help.pinecast.com/article/135-whats-included-with-the-free-plan"
            >
              <FormattedMessage
                description="Button on the ticket of a plan in the pricing section, to the help center article about what the plan includes"
                defaultMessage="See what’s included"
              />
            </SecondaryButton>
          </>
        }
      />
      <PricingTicket
        color="var(--color-orchid)"
        col1={
          <>
            <Subhead style={{marginBottom: '16px'}}>
              <FormattedMessage
                description="Name of the Starter plan, on its ticket in the pricing section"
                defaultMessage="Starter plan"
              />
            </Subhead>
            <div
              className={css({
                [MOBILE_MEDIA_QUERY]: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                },
              })}
            >
              <Price
                amount={
                  <FormattedMessage
                    description="A price in US dollars, in big numbers before “/ Month” or “/ Year”"
                    defaultMessage="$10"
                  />
                }
                perUnit="month"
                color="var(--color-white)"
              />
              <Overline style={{margin: '8px 0 4px'}}>
                <FormattedMessage
                  description="Between the monthly price and the yearly price of a plan or an add-on in the pricing section"
                  defaultMessage="or"
                />
              </Overline>
              <Price
                amount={
                  <FormattedMessage
                    description="A price in US dollars, in big numbers before “/ Month” or “/ Year”"
                    defaultMessage="$110"
                  />
                }
                perUnit="year"
                color="var(--color-white)"
              />
            </div>
          </>
        }
        col2={
          <FeatureList
            features={[
              <FormattedMessage
                key="Unlimited shows"
                description="A feature of the Starter plan, in the list on its ticket in the pricing section"
                defaultMessage="Unlimited shows"
              />,
              <FormattedMessage
                key="No episode limit"
                description="A feature of the Starter plan, in the list on its ticket in the pricing section"
                defaultMessage="No episode limit"
              />,
              <FormattedMessage
                key="80MB file sizes + bonus"
                description="A feature of the Starter plan, in the list on its ticket in the pricing section"
                defaultMessage="80MB file sizes + bonus"
              />,
              <FormattedMessage
                key="Premium analytics"
                description="A feature of the Starter plan, in the list on its ticket in the pricing section"
                defaultMessage="Premium analytics"
              />,
              <FormattedMessage
                key="Free transcripts"
                description="A feature of the Starter plan, in the list on its ticket in the pricing section"
                defaultMessage="Free transcripts"
              />,
              <FormattedMessage
                key="Podcast website"
                description="A feature of the Starter plan, in the list on its ticket in the pricing section"
                defaultMessage="Podcast website"
              />,
              <FormattedMessage
                key="Tip jar"
                description="A feature of the Starter plan, in the list on its ticket in the pricing section"
                defaultMessage="Tip jar"
              />,
            ]}
          />
        }
        col3={
          <>
            <PrimaryButton
              style={BUTTON_STYLE}
              href="https://pinecast.com/signup"
            >
              <FormattedMessage
                description="Button on the ticket of a plan in the pricing section, to the sign-up form"
                defaultMessage="Sign up"
              />
            </PrimaryButton>
            <SecondaryButton
              style={BUTTON_STYLE}
              href="https://help.pinecast.com/article/130-whats-included-in-the-starter-plan"
            >
              <FormattedMessage
                description="Button on the ticket of a plan in the pricing section, to the help center article about what the plan includes"
                defaultMessage="See what’s included"
              />
            </SecondaryButton>
          </>
        }
      />
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          alignItems: 'center',
          textAlign: 'center',
          margin: '0 auto 150px',
          maxWidth: '946px',
          paddingTop: '140px',

          '--color-line': '#888',
          '--color-primary-dark': '#fff',
          '--color-primary-light': 'var(--color-space)',
          '--color-theme-mode': 'var(--color-space)',
          '--color-core-accent': '#888',
          color: 'var(--color-primary-dark)',
        })}
      >
        <H2>
          <FormattedMessage
            description="Big heading above the add-ons in the pricing section. {br} is a line break"
            defaultMessage="Get more{br}with add-ons"
            values={{br: <br />}}
          />
        </H2>
        <Body4 style={{maxWidth: '32rem'}}>
          <FormattedMessage
            description="Text under the heading of the add-ons in the pricing section"
            defaultMessage="Add features when you need them and remove them when you don’t. There are no confusing tiers or lock-in pricing. You pay for what you use."
          />
        </Body4>
      </div>
      <AddonAccordion>
        <AddonAccordionItem
          name={
            <FormattedMessage
              description="Name of an add-on, the button that opens its row in the add-ons list of the pricing section"
              defaultMessage="Pro Analytics add-on"
            />
          }
          monthlyPrice={
            <FormattedMessage
              description="A price in US dollars, in big numbers before “/ Month” or “/ Year”"
              defaultMessage="$10"
            />
          }
          yearlyPrice={
            <FormattedMessage
              description="A price in US dollars, in big numbers before “/ Month” or “/ Year”"
              defaultMessage="$110"
            />
          }
          description={
            <FormattedMessage
              description="What the Pro Analytics add-on does, in its open row in the add-ons list of the pricing section"
              defaultMessage="Gain additional insights about your listeners with geographic data, listen growth analytics, sparklines, and more."
            />
          }
          link="https://help.pinecast.com/article/71-add-on-packages#pro-analytics-add-on"
        />
        <AddonAccordionItem
          name={
            <FormattedMessage
              description="Name of an add-on, the button that opens its row in the add-ons list of the pricing section"
              defaultMessage="Crew add-on"
            />
          }
          monthlyPrice={
            <FormattedMessage
              description="A price in US dollars, in big numbers before “/ Month” or “/ Year”"
              defaultMessage="$10"
            />
          }
          yearlyPrice={
            <FormattedMessage
              description="A price in US dollars, in big numbers before “/ Month” or “/ Year”"
              defaultMessage="$110"
            />
          }
          description={
            <FormattedMessage
              description="What the Crew add-on does, in its open row in the add-ons list of the pricing section"
              defaultMessage="Create a network for all of your shows, with a combined analytics dashboard. Share access to collaborators with configurable options."
            />
          }
          link="https://help.pinecast.com/article/71-add-on-packages#crew-add-on"
        />
        <AddonAccordionItem
          name={
            <FormattedMessage
              description="Name of an add-on, the button that opens its row in the add-ons list of the pricing section"
              defaultMessage="Growth add-on"
            />
          }
          monthlyPrice={
            <FormattedMessage
              description="A price in US dollars, in big numbers before “/ Month” or “/ Year”"
              defaultMessage="$10"
            />
          }
          yearlyPrice={
            <FormattedMessage
              description="A price in US dollars, in big numbers before “/ Month” or “/ Year”"
              defaultMessage="$110"
            />
          }
          description={
            <FormattedMessage
              description="What the Growth add-on does, in its open row in the add-ons list of the pricing section"
              defaultMessage="Grow your podcast with more options and features. Customize your tip jar, gather reviews from directories, solicit feedback from listeners, and more."
            />
          }
          link="https://help.pinecast.com/article/71-add-on-packages#growth-add-on"
        />
        <AddonAccordionItem
          name={
            <FormattedMessage
              description="Name of an add-on, the button that opens its row in the add-ons list of the pricing section"
              defaultMessage="Hi-Fi add-on"
            />
          }
          monthlyPrice={
            <FormattedMessage
              description="A price in US dollars, in big numbers before “/ Month” or “/ Year”"
              defaultMessage="$15"
            />
          }
          yearlyPrice={
            <FormattedMessage
              description="A price in US dollars, in big numbers before “/ Month” or “/ Year”"
              defaultMessage="$165"
            />
          }
          description={
            <FormattedMessage
              description="What the Hi-Fi add-on does, in its open row in the add-ons list of the pricing section"
              defaultMessage="Upload audio files up to 256MB, with an extra 256MB buffer every thirty days. RSS feeds update 66% faster."
            />
          }
          link="https://help.pinecast.com/article/71-add-on-packages#hi-fi-add-on"
        />
      </AddonAccordion>
    </section>
  );
};

const PricingTicket = ({
  color,
  col1,
  col2,
  col3,
}: {
  color: string;
  col1: React.ReactNode;
  col2: React.ReactNode;
  col3: React.ReactNode;
}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        '--color-primary-dark': 'var(--color-space)',
        '--color-primary-light': '#fff',
        ...ADAPTIVE_SURFACE,
        backgroundColor: color,
        borderRadius: '20px',
        padding: '0',
        position: 'relative',
        maxWidth: `${MAX_WIDTH}px`,
        marginBottom: '20px',
        overflow: 'hidden',
        width: '100%',

        [MOBILE_MEDIA_QUERY]: {
          gridTemplateColumns: 'unset',
          gridTemplateRows: '1fr',
        },

        '::before': {
          backgroundColor: 'var(--color-space)',
          content: '""',
          display: 'block',
          position: 'absolute',
          top: '-40px',
          right: `calc((350/${MAX_WIDTH}) * 100% - 29px)`,
          height: '60px',
          width: '60px',
          borderRadius: '60px',

          // On narrow screens the notches go with the buttons (below).
          [MOBILE_MEDIA_QUERY]: {display: 'none'},
        },
        '::after': {
          backgroundColor: 'var(--color-space)',
          content: '""',
          display: 'block',
          position: 'absolute',
          bottom: '-40px',
          right: `calc((350/${MAX_WIDTH}) * 100% - 29px)`,
          height: '60px',
          width: '60px',
          borderRadius: '60px',

          // On narrow screens the notches go with the buttons (below).
          [MOBILE_MEDIA_QUERY]: {display: 'none'},
        },

        display: 'grid',
        gridTemplateColumns: '350fr 600fr 350fr',
      })}
    >
      <div
        className={css({
          padding: '30px',
          [MOBILE_MEDIA_QUERY]: {padding: '20px'},
        })}
      >
        {col1}
      </div>
      <div
        className={css({
          borderStyle: 'dashed',
          borderColor: 'var(--color-space)',
          borderLeftWidth: '2px',
          borderRightWidth: '2px',
          borderTopWidth: '0',
          borderBottomWidth: '0',
          padding: '18px 80px',
          [MOBILE_MEDIA_QUERY]: {
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: '1px',
            padding: '0 20px 30px',
            marginBottom: '30px',
          },
        })}
      >
        {col2}
      </div>
      <div
        className={css({
          alignContent: 'center',
          alignItems: 'center',
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: 'max-content',
          gridTemplateRows: 'min-content min-content',
          justifyContent: 'center',
          justifyItems: 'stretch',
          padding: '30px',
          position: 'relative',
          [MOBILE_MEDIA_QUERY]: {
            gap: '8px',
            gridTemplateRows: 'unset',
            // Two columns when both buttons fit, else one. Two fixed columns
            // made the ticket wider than a 320px screen, and the ticket cut
            // off its right side.
            gridTemplateColumns: `repeat(auto-fit, minmax(min(${BUTTON_STYLE.minWidth}, 100%), 1fr))`,
            padding: '20px',
            // The notches of the ticket, on the dashed line above the
            // buttons, also when the buttons are in one column.
            '::before': {...MOBILE_NOTCH, right: '-25px'},
            '::after': {...MOBILE_NOTCH, left: '-25px'},
          },
        })}
      >
        {col3}
      </div>
    </div>
  );
};

const Price = ({
  amount,
  perUnit,
  color,
  strokeColor = 'var(--color-space)',
}: {
  amount: React.ReactNode;
  color: string;
  strokeColor?: string;
  perUnit: 'month' | 'year';
}) => {
  const css = useCSS();
  return (
    <div className={css({display: 'inline-block'})}>
      <strong
        className={css({
          ...GintoNordCondensed,
          color: color ?? 'inherit',
          fontSize: '42px',
          fontWeight: '400',
          lineHeight: '1.2',
          // textShadow:
          //   '-0.5px -1px 0 var(--color-space), 0.5px -1px 0 var(--color-space), -0.5px 1.5px 0 var(--color-space), 0.5px 1.5px 0 var(--color-space)',
          // Against all odds, this guy is supported in all browsers
          WebkitTextStroke: `1px ${strokeColor}`,
          verticalAlign: 'baseline',
          [MOBILE_MEDIA_QUERY]: {
            fontSize: '32px',
          },
        })}
      >
        {amount}
      </strong>
      <Body3
        style={{
          display: 'inline-block',
          padding: '0 0.15em',
          verticalAlign: 'baseline',
        }}
      >
        {perUnit === 'month' ? (
          <FormattedMessage
            description="After a price in the pricing section: the price is for one month"
            defaultMessage="/ Month"
          />
        ) : (
          <FormattedMessage
            description="After a price in the pricing section: the price is for one year"
            defaultMessage="/ Year"
          />
        )}
      </Body3>
    </div>
  );
};

const FeatureList = ({features}: {features: Array<React.ReactNode>}) => {
  const css = useCSS();
  return (
    <ul
      className={css({
        margin: 0,
        padding: 0,
        listStyle: 'none',
        borderTop: '1px solid var(--color-line)',
      })}
    >
      {features.map((name, i) => (
        <li
          key={i}
          className={css({
            alignItems: 'center',
            display: 'flex',
            borderBottom: '1px solid var(--color-line)',
            padding: '9.5px 0',
            justifyContent: 'space-between',
          })}
        >
          <Body3>{name}</Body3>
          <Check size={24} color="var(--color-primary-dark)" />
        </li>
      ))}
    </ul>
  );
};

const AddonAccordion = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 0,
        maxWidth: `${MAX_WIDTH}px`,
        borderBottom: '1px solid var(--color-primary-dark)',
        color: 'var(--color-primary-dark)',
        WebkitTapHighlightColor: 'transparent',
        width: '100%',
      })}
    >
      {children}
    </div>
  );
};

const AddonAccordionItem = ({
  name,
  monthlyPrice,
  yearlyPrice,
  description,
  link,
}: {
  name: React.ReactNode;
  monthlyPrice: React.ReactNode;
  yearlyPrice: React.ReactNode;
  description: React.ReactNode;
  link: string;
}) => {
  const css = useCSS();
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const {
    soundEffects: {play: playSoundEffect},
  } = useAudioManager();
  return (
    // A click anywhere on the row opens or closes it. The button in the
    // heading is the control for the keyboard and for assistive technology.
    // Its clicks, from Enter and Space too, come up to this handler.
    <div
      role="presentation"
      onClick={() => {
        // Undo any text sections that were accidentally highlighted when the user
        // tapped the accordion open/close. For accessibility purposes, as opposed
        // to preventing text selection with `user-select: none` or setting a transparent
        // `::selection` background, we clear the highlights using JS.
        document.getSelection()?.removeAllRanges?.();
        setOpen(!open);
        playSoundEffect(SoundEffect.CLICK_DROP);
      }}
      className={css({
        ...(!open ? {userSelect: 'none'} : {}),
        borderTop: '1px solid var(--color-primary-dark)',
        cursor: 'pointer',
        position: 'relative',
        minHeight: '70px',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        width: '100%',
        // The name and the details share one grid cell, so they overlap as
        // before, but a name that wraps (a narrow screen, larger text
        // spacing) makes the row taller instead of covering the next row.
        display: 'grid',
        gridTemplateAreas: '"stack"',
      })}
    >
      <Subhead
        style={{
          gridArea: 'stack',
          lineHeight: '70px',
          // The 70px minimum height of the row includes its 1px border, so
          // the name overlaps the bottom edge by 1px.
          marginBottom: '-1px',
          // Keep a wrapped name clear of the expand icon.
          paddingRight: '24px',
          [MIN_TABLET_MEDIA_QUERY]: {lineHeight: '70px'},
        }}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          className={css({
            ...BUTTON_RESET,
            position: 'relative',
            // The name is as tall as the row, so an outline would sit on
            // the lines between the rows. Put the ring around the name,
            // inside the row.
            ':focus-visible': {outline: 'none'},
            ':focus-visible::after': {
              borderColor: 'var(--color-focus-ring)',
              borderRadius: '6px',
              borderStyle: 'solid',
              borderWidth: '2px',
              content: '""',
              inset: '10px -8px',
              pointerEvents: 'none',
              position: 'absolute',
            },
            [MIN_TABLET_MEDIA_QUERY]: {
              ':focus-visible::after': {inset: '8px -8px'},
            },
          })}
        >
          {name}
        </button>
      </Subhead>
      <Expandable
        open={open}
        id={id}
        style={{gridArea: 'stack'}}
        innerStyle={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 24px',
          [MOBILE_MEDIA_QUERY]: {
            gridTemplateColumns: 'unset',
            gridTemplateRows: '1fr',
          },
        }}
      >
        <div
          className={css({
            paddingTop: '80px',
            opacity: open ? 1 : 0,
            transition: 'opacity 0.2s ease',
            [MOBILE_MEDIA_QUERY]: {
              paddingTop: '60px',
            },
          })}
        >
          <Price
            amount={monthlyPrice}
            perUnit="month"
            color="var(--color-space)"
            strokeColor="var(--color-white)"
          />
          <Overline style={{display: 'inline-block', margin: '0 12px 0 9px'}}>
            <FormattedMessage
              description="Between the monthly price and the yearly price of a plan or an add-on in the pricing section"
              defaultMessage="or"
            />
          </Overline>
          <Price
            amount={yearlyPrice}
            perUnit="year"
            color="var(--color-space)"
            strokeColor="var(--color-white)"
          />
        </div>
        <div
          className={css({
            padding: '20px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            opacity: open ? 1 : 0,
            transition: 'opacity 0.2s ease',
          })}
        >
          <Body3 style={{maxWidth: '310px'}}>{description}</Body3>
          <Link href={link} target="_blank">
            <FormattedMessage
              description="Link in the open row of an add-on in the pricing section, to the help center article about the add-on. Opens in a new tab"
              defaultMessage="Learn more"
            />
          </Link>
        </div>
      </Expandable>
      {open ? (
        <Collapse
          size={24}
          style={{position: 'absolute', top: '20px', right: 0}}
        />
      ) : (
        <Expand
          size={24}
          style={{position: 'absolute', top: '20px', right: 0}}
        />
      )}
    </div>
  );
};
