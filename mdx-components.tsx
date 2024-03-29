import {ContentSection, Subtitle, Title} from '@/components/TextBlocks';
import {H2} from '@/components/Typography';
import {MIN_TABLET_MEDIA_QUERY} from '@/constants';
import {useCSS} from '@/hooks/useCSS';
import type {MDXComponents} from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';
import {MonumentGroteskSemiMono, MonumentGroteskBold} from '@/fonts';

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // All of the headings are bumped up (H1 # -> <H2>, H2 ## -> <Title> which is a H3, etc.)
    // This is so that the top level heading can be defined externally as H1
    // and the rest of the headings will be bumped up accordingly.
    h1: ({children}) => <Title>{children}</Title>,
    h2: ({children}) => <Subtitle>{children}</Subtitle>,
    h3: ({children}) => <ContentSection>{children}</ContentSection>,

    p: ({children}) => {
      const css = useCSS(); // eslint-disable-line react-hooks/rules-of-hooks
      return (
        <p
          className={css({
            marginTop: 0,
            marginRight: 'var(--text-gutter)',
            marginLeft: 'var(--text-gutter)',
            [MIN_TABLET_MEDIA_QUERY]: {
              maxWidth: '805px',
              marginRight: 'auto',
              marginLeft: 'auto',
              marginBottom: '20px',
            },
          })}
        >
          {children}
        </p>
      );
    },

    strong: ({children}) => {
      const css = useCSS(); // eslint-disable-line react-hooks/rules-of-hooks
      return (
        <strong
          className={css({
            ...MonumentGroteskBold,
            fontWeight: 400,
          })}
        >
          {children}
        </strong>
      );
    },

    a: ((props: {href: string}) => {
      const css = useCSS(); // eslint-disable-line react-hooks/rules-of-hooks
      return (
        <Link
          target={props.href.startsWith('http') ? '_blank' : undefined}
          {...props}
          className={css({
            ...MonumentGroteskSemiMono,
            color: 'inherit',
            letterSpacing: '-1px',
          })}
        />
      );
    }) as any,

    ul: ({children}) => {
      const css = useCSS(); // eslint-disable-line react-hooks/rules-of-hooks
      return (
        <ul
          className={css({
            marginTop: 0,
            marginRight: 'var(--text-gutter)',
            marginLeft: '10px',
            [MIN_TABLET_MEDIA_QUERY]: {
              maxWidth: '805px',
              marginRight: 'auto',
              marginLeft: 'auto',
              marginBottom: '20px',
            },
          })}
        >
          {children}
        </ul>
      );
    },
    ol: ({children}) => {
      const css = useCSS(); // eslint-disable-line react-hooks/rules-of-hooks
      return (
        <ol
          className={css({
            marginTop: 0,
            marginRight: 'var(--text-gutter)',
            marginLeft: '10px',
            paddingLeft: '60px',
            [MIN_TABLET_MEDIA_QUERY]: {
              maxWidth: '805px',
              marginRight: 'auto',
              marginLeft: 'auto',
              marginBottom: '20px',
            },
          })}
        >
          {children}
        </ol>
      );
    },
    li: ({children}) => {
      const css = useCSS(); // eslint-disable-line react-hooks/rules-of-hooks
      return (
        <li
          className={css({
            '--text-gutter': '0px',
            marginBottom: '10px',
          })}
        >
          {children}
        </li>
      );
    },

    img: ((props: {
      src: string;
      alt: string;
      height: number;
      width: number;
    }) => {
      const css = useCSS(); // eslint-disable-line react-hooks/rules-of-hooks
      return (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image
          {...props}
          className={css({
            width: '100%',
            height: 'auto',
            borderRadius: '20px',
            marginTop: '20px',
            marginBottom: '20px',
            [MIN_TABLET_MEDIA_QUERY]: {
              marginTop: '130px',
              marginBottom: '20px',
            },
            ':is(img) + p': {
              [MIN_TABLET_MEDIA_QUERY]: {
                marginTop: '130px',
              },
            },
          })}
        />
      );
    }) as any,

    ...components,
  };
}
