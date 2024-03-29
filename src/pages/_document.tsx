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
import StyletronServer from 'styletron-engine-atomic/lib/server/server';
import {Provider as UserAgentContextProvider} from '../components/UserAgentContext';

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
  return {...initialProps, stylesheets};
};

export default function Document({
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
          }
          *, *:before, *:after {
            box-sizing: border-box;
          }
          html {
            scroll-behavior: smooth;
          }
          html, body, #__next {
            margin: 0;
            padding: 0;
          }
          body {
            background: var(--color-theme-mode);
          }
          body.darkSection, body.darkSection [data-theme-adaptive] {
            --color-line: #888;
            --color-primary-dark: var(--color-white);
            --color-primary-light: #090909;
            --color-theme-mode: #090909;
            --color-core-accent: #888;
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
