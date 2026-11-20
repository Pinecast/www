import {
  MOBILE_MEDIA_QUERY,
  CAN_HOVER_MEDIA_QUERY,
  TABLET_MEDIA_QUERY,
  MIN_TABLET_MEDIA_QUERY,
  MIN_DESKTOP_MEDIA_QUERY,
} from '@/constants';
import {
  GintoNordCondensed,
  MonumentGroteskBold,
  MonumentGroteskRegular,
  MonumentGroteskSemiMono,
} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import {useFitWords} from '@/hooks/useFitWords';
import {FocusEventHandler, ReactNode} from 'react';
import {StyleObject} from 'styletron-react';
import type {LinkProps} from 'next/link';
import NextLink from '@/components/SiteLink';
import {RightArrow} from '@/icons/RightArrow';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// The heading components pick their look from their name and their element
// from `level`, so a heading can move in the page outline without changing
// how it looks.
type HeadingProps = {
  children: ReactNode;
  level?: HeadingLevel;
  style?: StyleObject;
  // Make the heading smaller where its widest word is wider than the heading
  // (see useFitWords). For a heading whose words can be long, such as a
  // translation of a short English heading. A heading whose words fit keeps
  // its size.
  fit?: boolean;
};

// The sizes of a display heading, in pixels: [fontSize, lineHeight].
type HeadingSizes = {
  base: [number, number];
  tablet?: [number, number];
  desktop: [number, number];
};

// With `fit`, each size is a multiple of `--fit`, which useFitWords sets. A
// word that fits needs no hyphen, and a browser that hyphenates a word with a
// capital (in Spanish, not in English) would break one that fits: thus
// `hyphens: manual`. `overflow-wrap` keeps a long word on the page until the
// script has measured.
function useHeading(
  {children, level, style, fit = false}: HeadingProps & {level: HeadingLevel},
  look: StyleObject,
  {base, tablet, desktop}: HeadingSizes,
) {
  const css = useCSS();
  const ref = useFitWords<HTMLHeadingElement>(fit);
  const Tag = `h${level}` as const;
  const media = style as Record<string, any> | undefined;
  const size = ([fontSize, lineHeight]: [number, number]) =>
    fit
      ? {
          fontSize: `calc(${fontSize}px * var(--fit, 1))`,
          lineHeight: `calc(${lineHeight}px * var(--fit, 1))`,
        }
      : {fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px`};
  return (
    <Tag
      ref={ref}
      data-fit={fit ? 'pending' : undefined}
      className={css({
        ...look,
        letterSpacing: '-0.04em',
        ...size(base),
        ...(fit && {hyphens: 'manual', overflowWrap: 'break-word'}),
        ...style,
        ...(tablet && {
          [MIN_TABLET_MEDIA_QUERY]: {
            ...size(tablet),
            ...media?.[MIN_TABLET_MEDIA_QUERY],
          },
        }),
        [MIN_DESKTOP_MEDIA_QUERY]: {
          ...size(desktop),
          ...media?.[MIN_DESKTOP_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </Tag>
  );
}

export const H1 = ({level = 1, ...props}: HeadingProps) =>
  useHeading(
    {...props, level},
    {
      ...GintoNordCondensed,
      fontWeight: '400',
      hyphens: 'auto',
      marginTop: '0',
      marginBottom: '0',
      textTransform: 'uppercase',
    },
    {base: [54, 56], tablet: [112, 100], desktop: [160, 144]},
  );

export const H2 = ({level = 2, ...props}: HeadingProps) =>
  useHeading(
    {...props, level},
    {
      ...GintoNordCondensed,
      fontWeight: '400',
      textTransform: 'uppercase',
      marginTop: '0',
      marginBottom: '0',
    },
    {base: [48, 43], desktop: [80, 72]},
  );

export const H3 = ({children, level = 3, style}: HeadingProps) => {
  const css = useCSS();
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={css({
        ...GintoNordCondensed,
        fontWeight: '400',
        fontSize: '42px',
        letterSpacing: 0,
        lineHeight: '42px',
        textTransform: 'uppercase',
        marginTop: '0',
        marginBottom: '0',
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          fontSize: '32px',
          lineHeight: '32px',
          ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </Tag>
  );
};

export const Body1 = ({
  as,
  children,
  style,
}: {
  as?: React.ElementType;
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  const Tag = as ?? 'div';
  return (
    <Tag
      className={css({
        ...MonumentGroteskBold,
        fontWeight: 400,
        letterSpacing: '-0.03em',
        marginTop: '0',
        marginBottom: '0',

        fontSize: '24px',
        lineHeight: '24px',

        ...style,

        [MIN_TABLET_MEDIA_QUERY]: {
          fontSize: '28px',
          lineHeight: '28px',
          ...(style as Record<string, any>)?.[MIN_TABLET_MEDIA_QUERY],
        },
        [MIN_DESKTOP_MEDIA_QUERY]: {
          fontSize: '28px',
          lineHeight: '28px',
          ...(style as Record<string, any>)?.[MIN_DESKTOP_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </Tag>
  );
};

export const Body2 = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <p
      className={css({
        ...MonumentGroteskRegular,
        fontSize: '28px',
        fontWeight: 400,
        lineHeight: '39px',
        marginTop: '0',
        marginBottom: '0',
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          fontSize: '18px',
          lineHeight: '25px',
          ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </p>
  );
};

export const Body3 = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <p
      className={css({
        ...MonumentGroteskBold,
        fontSize: '22px',
        fontWeight: 400,
        letterSpacing: '-0.015em',
        lineHeight: '24px',
        marginTop: '0',
        marginBottom: '0',
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          fontSize: '16px',
          lineHeight: '18px',
          ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
        },
        [TABLET_MEDIA_QUERY]: {
          fontSize: '18px',
          lineHeight: '20px',
          ...(style as Record<string, any>)?.[TABLET_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </p>
  );
};

export const Body4 = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <p
      className={css({
        ...MonumentGroteskRegular,
        fontSize: '18px',
        fontWeight: 400,
        lineHeight: '22px',
        marginTop: '0',
        marginBottom: '0',
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          fontSize: '14px',
          lineHeight: '17px',
          ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </p>
  );
};

// With `fit`, as a display heading (useHeading): smaller where its widest word
// would not fit its line.
export const Subhead = ({
  children,
  level = 3,
  style,
  fit = false,
}: HeadingProps) => {
  const css = useCSS();
  const ref = useFitWords<HTMLHeadingElement>(fit);
  const Tag = `h${level}` as const;
  const size = (px: number) =>
    fit ? `calc(${px}px * var(--fit, 1))` : `${px}px`;
  return (
    <Tag
      ref={ref}
      data-fit={fit ? 'pending' : undefined}
      className={css({
        ...MonumentGroteskBold,
        display: 'block',
        fontWeight: 400,
        letterSpacing: '-0.025em',
        marginTop: '0',
        marginBottom: '0',
        fontSize: size(28),
        lineHeight: size(28),
        ...(fit && {hyphens: 'manual', overflowWrap: 'break-word'}),
        ...style,
        [MIN_TABLET_MEDIA_QUERY]: {
          fontSize: size(42),
          lineHeight: size(42),
          ...(style as Record<string, any>)?.[MIN_TABLET_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </Tag>
  );
};

export const Caption = ({
  as,
  children,
  style,
}: {
  as?: React.ElementType;
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  const Tag = as ?? 'small';
  return (
    <Tag
      className={css({
        ...MonumentGroteskSemiMono,
        display: 'block',
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '12px',
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          fontSize: '10px',
          lineHeight: '10px',
          ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </Tag>
  );
};

export const Overline = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <small
      className={css({
        ...MonumentGroteskSemiMono,
        display: 'block',
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: '16px',
        textTransform: 'uppercase',
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          fontSize: '14px',
          lineHeight: '14px',
          ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </small>
  );
};

export const PillButton = ({
  as,
  children,
  style,
  ...rest
}: {
  as?: React.ElementType;
  children: ReactNode;
  style?: StyleObject;
  [prop: string]: unknown;
}) => {
  const css = useCSS();
  const Tag = as ?? 'div';
  return (
    <Tag
      {...rest}
      className={css({
        ...MonumentGroteskRegular,
        border: '1px solid currentColor',
        borderRadius: '32px',
        display: 'inline-block',
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: '28px',
        padding: '0 1em',
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          fontSize: '14px',
          lineHeight: '20px',
          ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
        },
        [TABLET_MEDIA_QUERY]: {
          ...(style as Record<string, any>)?.[TABLET_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </Tag>
  );
};

export const GhostButton = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        ...MonumentGroteskBold,
        color: 'var(--color-white)',
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: '1',
        ...style,
        // [MOBILE_MEDIA_QUERY]: {
        //   fontSize: '14px',
        //   lineHeight: '14px',
        //   ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
        // },
      })}
    >
      {children}
    </div>
  );
};

export const Link = ({
  href,
  children,
  style,
  ...rest
}: Omit<LinkProps, 'children' | 'style' | 'href'> & {
  'aria-label'?: string;
  href?: string | URL;
  children: ReactNode;
  onFocus?: FocusEventHandler<HTMLAnchorElement>;
  style?: StyleObject;
  target?: '_blank';
}) => {
  const css = useCSS();
  const className = css({
    ...MonumentGroteskSemiMono,
    color: '#C7F182',
    display: 'block',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '16px',
    textDecoration: 'none',
    textUnderlineOffset: '0.3em',
    ...style,
    ':hover': {
      [CAN_HOVER_MEDIA_QUERY]: {
        textDecoration: 'underline',
        ...(style as Record<string, any>)?.[':hover'],
      },
    },
    [MOBILE_MEDIA_QUERY]: {
      fontSize: '14px',
      lineHeight: '14px',
      ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
    },
  });
  const content = (
    <>
      <span className={css({verticalAlign: 'middle'})}>{children}</span>
      <RightArrow size={24} />
    </>
  );
  if (href) {
    return (
      <NextLink {...rest} href={href} className={className}>
        {content}
      </NextLink>
    );
  }
  return (
    <span {...rest} className={className}>
      {content}
    </span>
  );
};
