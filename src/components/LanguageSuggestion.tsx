import Link from 'next/link';
import * as React from 'react';
import {IntlProvider, useIntl} from 'react-intl';

import {
  NO_MOTION_PREFERENCE_QUERY,
  SCROLL_PADDING_BOTTOM,
  SCROLL_PADDING_TOP,
} from '@/constants';
import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import {Close} from '@/icons/Close';
import {DEFAULT_LOCALE, SuggestionCatalogsContext, usePageRoute} from '@/i18n';
import {
  DISMISSED,
  preferredLocale,
  readLanguageChoice,
  saveLanguageChoice,
} from '@/languageChoice';
import {SUGGESTION_MESSAGES} from '@/languageSuggestionMessages';
import {hasPage, languageTag, localePath} from '@/locales.mjs';

// The room at the bottom of the window that the card covers, with room for a
// focus ring. _document.tsx adds it to `scroll-padding-bottom`, so that the
// page scrolls a focused element clear of the card (WCAG 2.4.11), and the
// footer keeps that much room under its card, so that the end of the page can
// scroll clear of it too (Footer.tsx).
export const SUGGESTION_ROOM_PROPERTY = '--language-suggestion-room';

// The card has this attribute. _document.tsx hides it while an element that
// stays in place at the bottom of the screen has focus (`underMuteButtonProps`):
// the page cannot scroll that element clear of the card.
export const SUGGESTION_ATTRIBUTE = 'data-language-suggestion';

// The band of the window, between the fixed header and the card, that must be
// left for the page: room for a focused element and its ring. In a shorter
// window (a phone held sideways, 400% zoom, large text spacing), the card
// hides, and gives its room back. The footer still lists the languages.
const MIN_CLEAR_HEIGHT = 200;

// Below this width, the card does not fit beside the floating mute button
// (MainHeader: 120px wide, 24px from the bottom left, and 96px high until the
// page scrolls), so it spans the window above the button.
const NARROW_MEDIA_QUERY = '@media (max-width: 503px)';
const ABOVE_MUTE_BUTTON = 24 + 96 + 12;

// Elements that take keyboard focus, for the focus after the card closes.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Offers the reader this page in their language: a small card at the bottom of
// the window, written in that language (Matt, 2026-11-16). It shows when the
// reader's first language that the site has (navigator.languages) is not the
// page's, and the page is in it. It does not show again once the reader has
// made a choice (src/languageChoice.ts): closed it, followed it, or picked a
// language in the footer. Nothing redirects by itself.
//
// It renders nothing on the server, so it is in no exported page: it appears
// once the page runs. Put it right after the SkipLink, so that it is early in
// the order of the page for a keyboard and a screen reader.
export const LanguageSuggestion = () => {
  const {locale, route} = usePageRoute();
  const catalogs = React.useContext(SuggestionCatalogsContext);
  const [suggested, setSuggested] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSuggested(null);
    if (readLanguageChoice() !== null) {
      return;
    }
    const preferred = preferredLocale(
      navigator.languages?.length ? navigator.languages : [navigator.language],
    );
    if (!preferred || preferred === locale || !hasPage(route, preferred)) {
      return;
    }
    // Without its messages in that language (a page with no `getStaticProps`
    // from src/i18n-static.ts), the card would speak English.
    if (preferred !== DEFAULT_LOCALE && !catalogs?.[preferred]) {
      return;
    }
    setSuggested(preferred);
  }, [locale, route, catalogs]);

  if (!suggested) {
    return null;
  }
  return (
    <IntlProvider
      locale={languageTag(suggested)}
      defaultLocale={DEFAULT_LOCALE}
      messages={catalogs?.[suggested]}
    >
      <SuggestionCard
        locale={suggested}
        route={route}
        onDone={() => setSuggested(null)}
      />
    </IntlProvider>
  );
};

const SuggestionCard = ({
  locale,
  route,
  onDone,
}: {
  locale: string;
  route: string;
  onDone: () => void;
}) => {
  const css = useCSS();
  const intl = useIntl();
  const ref = React.useRef<HTMLElement>(null);

  // It slides up from below the window on the frame after it first shows, so
  // that the slide has a start. With reduced motion, it is in place at once.
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // The room it covers, from its box in place: its height and its distance
  // from the bottom, which the slide does not change. Where that leaves less
  // than MIN_CLEAR_HEIGHT under the header, the card hides (`visibility`
  // keeps its size, so that it can be measured again).
  const [fits, setFits] = React.useState(true);
  React.useEffect(() => {
    const card = ref.current;
    if (!card) {
      return;
    }
    const root = document.documentElement;
    const update = () => {
      const bottom = parseFloat(getComputedStyle(card).bottom) || 0;
      const room = Math.ceil(
        card.offsetHeight + bottom + SCROLL_PADDING_BOTTOM,
      );
      const roomFits =
        window.innerHeight - SCROLL_PADDING_TOP - room >= MIN_CLEAR_HEIGHT;
      setFits(roomFits);
      if (roomFits) {
        root.style.setProperty(SUGGESTION_ROOM_PROPERTY, `${room}px`);
      } else {
        root.style.removeProperty(SUGGESTION_ROOM_PROPERTY);
      }
    };
    const observer = new ResizeObserver(update);
    observer.observe(card);
    window.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      root.style.removeProperty(SUGGESTION_ROOM_PROPERTY);
    };
  }, []);

  // The scroll padding keeps a focused element clear of the card where the
  // page can scroll it. Some parts of the page stay in place while it scrolls
  // (the hero at the top, the testimonials), so a focused element there can
  // still be under the card: then the card gets out of the way until focus
  // moves on. It checks after the page has scrolled to the element, and again
  // as a smooth scroll goes on.
  const [yielding, setYielding] = React.useState(false);
  React.useEffect(() => {
    const card = ref.current;
    if (!card) {
      return;
    }
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const element = document.activeElement;
        if (!element || element === document.body || card.contains(element)) {
          setYielding(false);
          return;
        }
        const focused = element.getBoundingClientRect();
        const box = card.getBoundingClientRect();
        setYielding(
          focused.left < box.right &&
            focused.right > box.left &&
            focused.top < box.bottom &&
            focused.bottom > box.top,
        );
      });
    };
    document.addEventListener('focusin', check);
    document.addEventListener('focusout', check);
    window.addEventListener('scroll', check, {passive: true});
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('focusin', check);
      document.removeEventListener('focusout', check);
      window.removeEventListener('scroll', check);
    };
  }, []);

  const close = () => {
    saveLanguageChoice(DISMISSED);
    // The button goes away with the card. Focus goes on to what follows it,
    // as if the reader had tabbed past the card.
    const card = ref.current;
    if (card?.contains(document.activeElement)) {
      for (const element of document.querySelectorAll<HTMLElement>(FOCUSABLE)) {
        if (
          card.compareDocumentPosition(element) &
            Node.DOCUMENT_POSITION_FOLLOWING &&
          !card.contains(element) &&
          element.getClientRects().length > 0
        ) {
          element.focus();
          break;
        }
      }
    }
    onDone();
  };

  return (
    <section
      ref={ref}
      {...{[SUGGESTION_ATTRIBUTE]: true}}
      lang={languageTag(locale)}
      aria-label={intl.formatMessage(SUGGESTION_MESSAGES.label)}
      className={css({
        ...MonumentGroteskBold,
        alignItems: 'center',
        backgroundColor: 'var(--color-white)',
        borderColor: 'var(--color-space)',
        // The tight corner points at the corner of the screen, like the
        // tail of a speech bubble, as the skip link's does.
        borderRadius: '22px 22px 3px 22px',
        borderStyle: 'solid',
        borderWidth: '2px',
        bottom: '24px',
        boxShadow: '3px 4px 0 rgba(9, 9, 9, 0.18)',
        boxSizing: 'border-box',
        color: 'var(--color-space)',
        columnGap: '12px',
        display: 'grid',
        fontSize: '16px',
        gridTemplateColumns: '1fr auto',
        lineHeight: '20px',
        maxWidth: '340px',
        padding: '14px 10px 16px 22px',
        position: 'fixed',
        right: '24px',
        rowGap: '6px',
        translate: shown ? '0 0' : '0 calc(100% + 48px)',
        visibility: fits && !yielding ? 'visible' : 'hidden',
        // Over the page and the closed header (95), under the dim overlay of
        // the open menu (120), the mute button and the skip link.
        zIndex: 110,
        [NO_MOTION_PREFERENCE_QUERY]: {
          transition: 'translate 0.28s cubic-bezier(0.2, 0.9, 0.3, 1)',
        },
        [NARROW_MEDIA_QUERY]: {
          bottom: `${ABOVE_MUTE_BUTTON}px`,
          left: '16px',
          maxWidth: 'none',
          right: '16px',
        },
      })}
    >
      <p className={css({margin: 0})}>
        {intl.formatMessage(SUGGESTION_MESSAGES.text)}
      </p>
      <Link
        href={localePath(route, locale)}
        hrefLang={locale}
        onClick={() => {
          saveLanguageChoice(locale);
          onDone();
        }}
        className={css({
          color: 'inherit',
          gridColumn: 1,
          gridRow: 2,
          justifySelf: 'start',
          textUnderlineOffset: '0.2em',
        })}
      >
        {intl.formatMessage(SUGGESTION_MESSAGES.link)}
      </Link>
      <button
        type="button"
        aria-label={intl.formatMessage(SUGGESTION_MESSAGES.close)}
        onClick={close}
        className={css({
          alignItems: 'center',
          background: 'none',
          border: 0,
          borderRadius: '50%',
          color: 'inherit',
          cursor: 'pointer',
          display: 'flex',
          // Beside the sentence and the link. After the link in the order
          // of the page: the link is what the card is for.
          gridColumn: 2,
          gridRow: '1 / 3',
          height: '44px',
          justifyContent: 'center',
          padding: 0,
          width: '44px',
        })}
      >
        <Close size={20} />
      </button>
    </section>
  );
};
