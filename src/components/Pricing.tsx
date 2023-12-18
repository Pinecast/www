import {useCSS} from '@/hooks/useCSS';
import {useDarkSection} from '@/hooks/useDarkSection';
import * as React from 'react';
import {Body3, Body4, H1, H2, Link, Overline, Subhead} from './Typography';
import {GintoNordCondensed} from '@/fonts';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {Check} from '@/icons/Check';
import {Expandable} from './Expandable';
import {Collapse} from '@/icons/Collapse';
import {Expand} from '@/icons/Expand';

const BUTTON_STYLE = {height: 'auto', paddingTop: '4px', paddingBottom: '4px'};
const MAX_WIDTH = 1300;

export const Pricing = () => {
  const css = useCSS();

  const sectionRef = React.useRef<HTMLElement>(null);
  useDarkSection(sectionRef);

  return (
    <section
      ref={sectionRef}
      className={css({
        backgroundColor: 'var(--color-space)',
        paddingBottom: '116px',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          alignItems: 'center',
          textAlign: 'center',
          margin: '0 auto 200px',
          maxWidth: '946px',
          padding: '100px 30px 0',

          '--color-line': '#888',
          '--color-primary-dark': '#fff',
          '--color-primary-light': 'var(--color-space)',
          '--color-theme-mode': 'var(--color-space)',
          '--color-core-accent': '#888',
          color: 'var(--color-primary-dark)',
        })}
      >
        <H1>
          Grab
          <br />
          your ticket
        </H1>
        <Body4 style={{maxWidth: '32rem'}}>
          Try Pinecast for free. No credit card required, no time limits,
          upgrade whenever. We think you&rsquo;ll love it.
        </Body4>
      </div>
      <PricingTicket
        color="var(--color-white)"
        col1={
          <>
            <Subhead style={{marginBottom: '16px'}}>Free plan</Subhead>
            <Price amount="$0" perUnit="Month" color="var(--color-white)" />
          </>
        }
        col2={
          <FeatureList
            features={[
              'No time limit',
              'Up to two shows',
              'Ten episodes limit',
              '48MB file sizes',
              'Basic analytics',
              'Tip jar',
            ]}
          />
        }
        col3={
          <>
            <PrimaryButton
              style={BUTTON_STYLE}
              href="https://pinecast.com/signup"
            >
              Sign up
            </PrimaryButton>
            <SecondaryButton
              style={BUTTON_STYLE}
              href="https://help.pinecast.com/article/135-whats-included-with-the-free-plan"
            >
              See what&rsquo;s included
            </SecondaryButton>
          </>
        }
      />
      <PricingTicket
        color="var(--color-orchid)"
        col1={
          <>
            <Subhead style={{marginBottom: '16px'}}>Starter plan</Subhead>
            <div>
              <Price amount="$10" perUnit="Month" color="var(--color-white)" />
              <Overline style={{margin: '8px 0 4px'}}>or</Overline>
              <Price amount="$110" perUnit="Year" color="var(--color-white)" />
            </div>
          </>
        }
        col2={
          <FeatureList
            features={[
              'Unlimited shows',
              'No episode limit',
              '80MB file sizes + bonus',
              'Premium analytics',
              'Free transcripts',
              'Podcast website',
            ]}
          />
        }
        col3={
          <>
            <PrimaryButton
              style={BUTTON_STYLE}
              href="https://pinecast.com/signup"
            >
              Sign up
            </PrimaryButton>
            <SecondaryButton
              style={BUTTON_STYLE}
              href="https://help.pinecast.com/article/130-whats-included-in-the-starter-plan"
            >
              See what&rsquo;s included
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
          Get more
          <br />
          with add-ons
        </H2>
        <Body4 style={{maxWidth: '32rem'}}>
          Add features when you need them and remove them when you don&rsquo;t.
          There are no confusing tiers or lock-in pricing. You pay for what you
          use.
        </Body4>
      </div>
      <AddonAccordion>
        <AddonAccordionItem
          name="Pro Analytics add-on"
          monthlyPrice="$10"
          yearlyPrice="$110"
          description="Gain additional insights about your listeners with geographic data, listen growth analytics, sparklines, and more."
          link=""
        />
        <AddonAccordionItem
          name="Crew add-on"
          monthlyPrice="$10"
          yearlyPrice="$110"
          description="Create a network for all of your shows, with a combined analytics dashboard. Share access to collaborators with configurable options."
          link=""
        />
        <AddonAccordionItem
          name="Growth add-on"
          monthlyPrice="$10"
          yearlyPrice="$110"
          description="Grow your podcast with more options and features. Customize your tip jar, gather reviews from directories, solicit feedback from listeners, and more."
          link=""
        />
        <AddonAccordionItem
          name="Hi-Fi add-on"
          monthlyPrice="$15"
          yearlyPrice="$165"
          description="Upload audio files up to 256MB, with an extra 256MB buffer every thirty days. RSS feeds update 66% faster."
          link=""
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
        backgroundColor: color,
        borderRadius: '20px',
        padding: '0',
        position: 'relative',
        maxWidth: `${MAX_WIDTH}px`,
        margin: '0 auto 20px',
        overflow: 'hidden',

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
        },

        display: 'grid',
        gridTemplateColumns: '350fr 600fr 350fr',
      })}
    >
      <div className={css({padding: '30px'})}>{col1}</div>
      <div
        className={css({
          borderStyle: 'dashed',
          borderColor: 'var(--color-space)',
          borderLeftWidth: '2px',
          borderRightWidth: '2px',
          borderTopWidth: '0',
          borderBottomWidth: '0',
          padding: '18px 80px',
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
}: {
  amount: React.ReactNode;
  color?: string;
  perUnit: React.ReactNode;
}) => {
  const css = useCSS();
  return (
    <div className={css({display: 'inline-block'})}>
      <strong
        className={css({
          ...GintoNordCondensed,
          color: color ?? 'inherit',
          fontSize: '42px',
          fontWeight: '500',
          lineHeight: '1.2',
          textShadow:
            '-0.5px -1px 0 var(--color-space), 0.5px -1px 0 var(--color-space), -0.5px 1.5px 0 var(--color-space), 0.5px 1.5px 0 var(--color-space)',
          verticalAlign: 'baseline',
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
        / {perUnit}
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
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  description: React.ReactNode;
  link: string;
}) => {
  const css = useCSS();
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  return (
    <div
      role="button"
      aria-label={`Toggle details about ${name}`}
      aria-expanded={open ? 'true' : 'false'}
      aria-controls={id}
      onClick={() => {
        // Undo any text sections that were accidentally highlighted when the user
        // tapped the accordion open/close. For accessibility purposes, as opposed
        // to preventing text selection with `user-select: none` or setting a transparent
        // `::selection` background, we clear the highlights using JS.
        document.getSelection()?.removeAllRanges?.();

        setOpen(!open);
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
      })}
    >
      <Subhead
        style={{position: 'absolute', top: 0, left: 0, lineHeight: '70px'}}
      >
        {name}
      </Subhead>
      <Expandable
        open={open}
        id={id}
        innerStyle={{display: 'grid', gridTemplateColumns: '1fr 1fr 24px'}}
      >
        <div
          className={css({
            paddingTop: '80px',
            opacity: open ? 1 : 0,
            transition: 'opacity 0.2s ease',
          })}
        >
          <Price amount={monthlyPrice} perUnit="Month" />
          <Overline style={{display: 'inline-block', margin: '0 12px 0 9px'}}>
            or
          </Overline>
          <Price amount={yearlyPrice} perUnit="Year" />
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
          <Link href={link}>Learn more</Link>
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
