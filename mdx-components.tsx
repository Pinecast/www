import {ContentSection, Subtitle, Title} from '@/components/TextBlocks';
import {HeadingLevel} from '@/components/Typography';
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

type MarkdownHeadingProps = {
  children?: React.ReactNode;
  id?: string;
  level?: number | string;
};

// `level` comes from vendor/rehype-heading-levels.mjs.
const toLevel = (level: number | string | undefined, fallback: HeadingLevel) =>
  (Number(level) || fallback) as HeadingLevel;

// The browser's own look for h4 to h6, kept when the element changes.
const MARKDOWN_HEADING_LOOK = {
  4: {fontSize: '1em', marginTop: '1.33em', marginBottom: '1.33em'},
  5: {fontSize: '0.83em', marginTop: '1.67em', marginBottom: '1.67em'},
  6: {fontSize: '0.67em', marginTop: '2.33em', marginBottom: '2.33em'},
};

const MarkdownHeading = ({
  children,
  depth,
  id,
  level,
}: MarkdownHeadingProps & {depth: 4 | 5 | 6}) => {
  const css = useCSS();
  const outlineLevel = toLevel(level, depth);
  const Tag = `h${outlineLevel}` as const;
  return (
    <Tag
      id={id}
      className={
        outlineLevel === depth
          ? undefined
          : css({
              ...MARKDOWN_HEADING_LOOK[depth],
              display: 'block',
              fontWeight: 'bold',
              marginLeft: 0,
              marginRight: 0,
            })
      }
    >
      {children}
    </Tag>
  );
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // The page title is the only <h1>, and the layout renders it. The markdown
    // depth picks the look (`#` is a <Title>, `##` is a <Subtitle>, and so
    // on), and `level` from vendor/rehype-heading-levels.mjs picks the
    // element, so that the outline has no gaps.
    // `id` comes from vendor/rehype-heading-ids.mjs and makes each heading
    // linkable as a URL fragment.
    h1: ({children, id, level}: MarkdownHeadingProps) => (
      <Title id={id} level={toLevel(level, 2)}>
        {children}
      </Title>
    ),
    h2: ({children, id, level}: MarkdownHeadingProps) => (
      <Subtitle id={id} level={toLevel(level, 3)}>
        {children}
      </Subtitle>
    ),
    h3: ({children, id, level}: MarkdownHeadingProps) => (
      <ContentSection id={id} level={toLevel(level, 4)}>
        {children}
      </ContentSection>
    ),
    h4: (props: MarkdownHeadingProps) => (
      <MarkdownHeading {...props} depth={4} />
    ),
    h5: (props: MarkdownHeadingProps) => (
      <MarkdownHeading {...props} depth={5} />
    ),
    h6: (props: MarkdownHeadingProps) => (
      <MarkdownHeading {...props} depth={6} />
    ),

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
