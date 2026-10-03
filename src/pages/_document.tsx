import * as React from 'react';
import {
  default as NextDocument,
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document';
import {Provider as StyletronProvider} from 'styletron-react';

import {styletron} from '../styletron';
import {
  MUTE_BUTTON_ATTRIBUTE,
  MUTE_BUTTON_SCROLL_PADDING_BOTTOM,
  NOT_MIN_TABLET_MEDIA_QUERY,
  SCROLL_PADDING_BOTTOM,
  SCROLL_PADDING_TOP,
  TABLET_BREAKPOINT,
  UNDER_MUTE_BUTTON_SCROLL_PADDING_BOTTOM,
  UNDER_MUTE_BUTTON_SELECTOR,
} from '../constants';
import StyletronServer from 'styletron-engine-atomic/lib/server/server';
import {Provider as UserAgentContextProvider} from '../components/UserAgentContext';
import {MOTION_ATTRIBUTE, MOTION_INIT_SCRIPT} from '../hooks/useMotion';
import {FONT_URLS} from '../fonts';
import {HERO_STILLS, stillMedia} from '../heroStills';

Document.getInitialProps = async (context: DocumentContext) => {
  const renderPage = () =>
    context.renderPage({
      enhanceApp: App => props => (
        <StyletronProvider value={styletron}>
          <UserAgentContextProvider
            value={context.req?.headers['user-agent'] ?? '-'}
          >
            <App {...props} />
          </UserAgentContextProvider>
        </StyletronProvider>
      ),
    });

  const initialProps = await NextDocument.getInitialProps({
    ...context,
    renderPage,
  });
  const stylesheets = (styletron as StyletronServer).getStylesheets() || [];
  // The error page of Next.js has no text in the faces.
  const preloadFonts = !['/404', '/_error'].includes(context.pathname);
  // Next.js renders `styles` at the end of the <head>, after its scripts.
  const styles = [...React.Children.toArray(initialProps.styles)];
  if (context.pathname === '/') {
    // The stills of the home hero are the first files to load after the page
    // itself: the tiles of the hero show a flat color until they are in. Each
    // one has the `media` of the layouts that draw it, so a phone loads one
    // still, and not seven. The sounds, the videos and the globe wait for the
    // stills (useLoadOrder), so nothing else takes the bandwidth.
    //
    // The stills must not slow the page script, which the hero needs to take
    // over from its CSS layout. Two things keep them behind it, and
    // tests/hero-loading.spec.ts checks both:
    // - `fetchpriority="low"`. At the normal or the high priority, they got
    //   the connections first, and the script was seconds late.
    // - Their place in the page, after the scripts. A browser with six
    //   connections to the server (HTTP/1.1) asks in the order of the page,
    //   and links ahead of the scripts fill the connections. React moves a
    //   <link> to the start of the <head>, unless it has an event handler, as
    //   one that a script loads has: so these have a handler that does
    //   nothing. (It is not in the HTML.)
    styles.push(
      ...Object.values(HERO_STILLS).map(still => (
        <link
          key={still.src}
          rel="preload"
          as="image"
          href={still.src}
          media={stillMedia(still)}
          fetchPriority="low"
          onError={() => {}}
        />
      )),
    );
  }
  return {...initialProps, preloadFonts, stylesheets, styles};
};

export default function Document({
  preloadFonts,
  stylesheets,
}: typeof Document.getInitialProps extends (
  context: DocumentContext,
) => Promise<infer T>
  ? T
  : never) {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.png" />
        {preloadFonts &&
          FONT_URLS.map(url => (
            <link
              key={url}
              rel="preload"
              href={url}
              as="font"
              type="font/woff2"
              crossOrigin="anonymous"
            />
          ))}
        <script dangerouslySetInnerHTML={{__html: MOTION_INIT_SCRIPT}} />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --color-space: #090909;
            --color-space-50: #25272F;
            --color-sand: #f8f4eb;
            --color-white: #fff;
            --color-orchid: #dbaeff;
            --color-lime: #c4ff7e;

            --color-grape: #9f16d6;
            --color-grape-50: #cf8aea;
            --color-grape-25: #e7c5f5;
            --color-sky: #c7ecfa;
            --color-sky-50: #e3f5fc;
            --color-sky-25: #f1fafe;
            --color-forest: #0b6426;
            --color-forest-50: #85b192;
            --color-forest-25: #c2d8c9;
            --color-sunrise: #f9f199;
            --color-sunrise-50: #fcf8cc;
            --color-sunrise-25: #fdfbe5;
            --color-sunset: #ff6f17;
            --color-sunset-50: #ffb78b;
            --color-sunset-25: #ffdbc5;
            --color-rose: #ff2644;
            --color-rose-50: #ff92a1;
            --color-rose-25: #ffc9d0;

            --color-line: var(--color-space);
            --color-primary-dark: var(--color-space);
            --color-primary-light: var(--color-sand);
            --color-theme-mode: var(--color-sand);
            --color-core-accent: #888;
            /* Stone is under 4.5:1 on sand, lime and sky, so gray text on
               those sections uses this darker gray (4.53:1 on sky). */
            --color-core-accent-text: #676767;

            /* The keyboard focus ring. It is primary-dark on light
               sections. A dark surface sets it to white (DARK_SURFACE in
               constants.ts), and the header, whose colors follow the dark
               sections, sets it to its own primary-dark. */
            --color-focus-ring: var(--color-primary-dark);
          }
          *, *:before, *:after {
            box-sizing: border-box;
          }
          @media (prefers-reduced-motion: no-preference) {
            html {
              scroll-behavior: smooth;
            }
          }
          /* The "Pause animations" toggle (useMotion) freezes the looping
             CSS animations where they are. */
          html[${MOTION_ATTRIBUTE}="paused"] [data-looping],
          html[${MOTION_ATTRIBUTE}="paused"] [data-looping]::before,
          html[${MOTION_ATTRIBUTE}="paused"] [data-looping]::after {
            animation-play-state: paused !important;
          }
          /* It shows the animations that play as the page loads at their
             end (introAnimationProps). */
          html[${MOTION_ATTRIBUTE}="paused"] [data-intro] {
            animation-duration: 0s !important;
          }
          @media (prefers-reduced-motion: reduce) {
            /* The looping animations start paused, also before the script
               in the head has run. */
            html:not([${MOTION_ATTRIBUTE}]) [data-looping],
            html:not([${MOTION_ATTRIBUTE}]) [data-looping]::before,
            html:not([${MOTION_ATTRIBUTE}]) [data-looping]::after {
              animation-play-state: paused !important;
            }
            /* Other animations and transitions jump to their end. */
            *:not([data-looping]),
            *:not([data-looping])::before,
            *:not([data-looping])::after {
              animation-duration: 0s !important;
              transition-duration: 0s !important;
            }
          }
          /* Only for the keyboard: a mouse click shows no ring. */
          :focus-visible {
            outline: 2px solid var(--color-focus-ring);
            outline-offset: 2px;
          }
          html {
            /* Keep a focused element clear of the fixed header and logo
               and, up to ${TABLET_BREAKPOINT}px, of the mute button at the
               bottom. The browser scrolls the element into view, but not
               its ring, which is outside it: leave room for that too. */
            scroll-padding-top: ${SCROLL_PADDING_TOP}px;
            scroll-padding-bottom: ${SCROLL_PADDING_BOTTOM}px;
          }
          /* Wherever the mute button shows: MainHeader hides it with
             MIN_TABLET_MEDIA_QUERY. (max-width: ${TABLET_BREAKPOINT}px) did not
             match at a zoomed width between ${TABLET_BREAKPOINT} and
             ${TABLET_BREAKPOINT + 1}px. */
          ${NOT_MIN_TABLET_MEDIA_QUERY} {
            html {
              scroll-padding-bottom: ${MUTE_BUTTON_SCROLL_PADDING_BOTTOM}px;
            }
          }
          /* A sticky part of the page cannot scroll clear of the mute
             button. While an element there has keyboard focus, the button
             hides, and the page needs no room for it. */
          body:has(${UNDER_MUTE_BUTTON_SELECTOR}:focus-visible)
            [${MUTE_BUTTON_ATTRIBUTE}] {
            opacity: 0;
            visibility: hidden;
          }
          html:has(${UNDER_MUTE_BUTTON_SELECTOR}:focus-visible) {
            scroll-padding-bottom: ${UNDER_MUTE_BUTTON_SCROLL_PADDING_BOTTOM}px;
          }
          html, body, #__next {
            margin: 0;
            padding: 0;
          }
          body {
            background: var(--color-theme-mode);
            /* Break a word that is wider than its line (a display heading
               at 320px, a long URL) instead of scrolling the page sideways.
               It only applies where the word would overflow, so it does not
               change text that fits. */
            overflow-wrap: break-word;
          }
          body.darkSection, body.darkSection [data-theme-adaptive] {
            --color-line: #888;
            --color-primary-dark: var(--color-white);
            --color-primary-light: #090909;
            --color-theme-mode: #090909;
            --color-core-accent: #888;
          }
          /* Only the theme-adaptive menu goes dark with the page. Other text
             that uses the variable sits on its own light background, which
             can still be on screen while a dark section sets the class. */
          body.darkSection [data-theme-adaptive] {
            --color-core-accent-text: #888;
          }
          body.dimmed {
            position: relative;
          }
          body.dimmed::before {
            background: var(--color-space);
            bottom: 0;
            content: '';
            display: block;
            left: 0;
            opacity: 0.8;
            position: absolute;
            right: 0;
            top: 0;
            z-index: 120;
          }
        `
              .replace(/\n/g, '')
              .replace(/\s\s+/g, ' '),
          }}
        />
        {stylesheets.map((sheet, i) => (
          <style
            className="_styletron_hydrate_"
            dangerouslySetInnerHTML={{__html: sheet.css}}
            media={sheet.attrs.media}
            data-hydrate={sheet.attrs['data-hydrate']}
            key={i}
          />
        ))}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
