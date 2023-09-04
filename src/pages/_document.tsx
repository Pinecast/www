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

Document.getInitialProps = async (context: DocumentContext) => {
  const renderPage = () =>
    context.renderPage({
      enhanceApp: App => props => (
        <StyletronProvider value={styletron}>
          <App {...props} />
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
        <link rel="icon" href="/favicon.ico" />
        <style>
          {`
          :root {
            --color-line: #090909;
            --color-primary-dark: #090909;
            --color-primary-light: #f8f4eb;
            --color-theme-mode: #f8f4eb;
            --color-core-accent: #888888;
          }
          *, *:before, *:after {
            box-sizing: border-box;
          }
          html, body, #__next {
            margin: 0;
            padding: 0;
          }
          body {
            background: var(--color-theme-mode);
          }
          body.darkSection {
            --color-line: #f8f4eb;
            --color-primary-dark: #f8f4eb;
            --color-primary-light: #090909;
            --color-theme-mode: #090909;
            --color-core-accent: #888888;
          }
        `
            .replace(/\n/g, '')
            .replace(/\s\s+/g, ' ')}
        </style>
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
