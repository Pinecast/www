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
import {ReactNode} from 'react';
import {StyleObject} from 'styletron-react';
import NextLink, {LinkProps} from 'next/link';

export const H1 = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <h1
      className={css({
        ...GintoNordCondensed,
        hyphens: 'auto',
        letterSpacing: '-0.04em',
        // overflowWrap: 'break-word',
        marginTop: '0',
        marginBottom: '0',
        textTransform: 'uppercase',

        fontSize: '54px',
        lineHeight: '56px',

        ...style,
        [MIN_TABLET_MEDIA_QUERY]: {
          fontSize: '112px',
          lineHeight: '100px',
          ...(style as Record<string, any>)?.[MIN_TABLET_MEDIA_QUERY],
        },
        [MIN_DESKTOP_MEDIA_QUERY]: {
          fontSize: '160px',
          lineHeight: '144px',
          ...(style as Record<string, any>)?.[MIN_DESKTOP_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </h1>
  );
};

export const H2 = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <h2
      className={css({
        ...GintoNordCondensed,
        letterSpacing: '-0.04em',
        textTransform: 'uppercase',
        marginTop: '0',
        marginBottom: '0',

        fontSize: '48px',
        lineHeight: '43px',

        ...style,
        [MIN_DESKTOP_MEDIA_QUERY]: {
          fontSize: '80px',
          lineHeight: '72px',
          ...(style as Record<string, any>)?.[MIN_DESKTOP_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </h2>
  );
};

export const H3 = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <h3
      className={css({
        ...GintoNordCondensed,
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
    </h3>
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
        fontSize: '28px',
        fontWeight: 500,
        letterSpacing: '-0.03em',
        lineHeight: '28px',
        marginTop: '0',
        marginBottom: '0',
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          fontSize: '24px',
          lineHeight: '24px',
          ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
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

export const Subhead = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <h3
      className={css({
        ...MonumentGroteskBold,
        display: 'block',
        fontWeight: 700,
        letterSpacing: '-0.025em',
        marginTop: '0',
        marginBottom: '0',
        fontSize: '28px',
        lineHeight: '28px',
        ...style,
        [MIN_TABLET_MEDIA_QUERY]: {
          fontSize: '42px',
          lineHeight: '42px',
          ...(style as Record<string, any>)?.[MIN_TABLET_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </h3>
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
        fontWeight: 700,
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
  children,
  style,
  ...rest
}: Omit<LinkProps, 'children' | 'style'> & {
  children: ReactNode;
  style?: StyleObject;
  target?: '_blank';
}) => {
  const css = useCSS();
  return (
    <NextLink
      {...rest}
      className={css({
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
      })}
    >
      <span
        className={css({
          verticalAlign: 'middle',
        })}
      >
        {children}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        className={css({
          marginLeft: '8px',
          verticalAlign: 'middle',
        })}
      >
        <path fill="currentColor" d="M4 11h15v2H4z" />
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M16 7a4 4 0 0 0 4 4v2a6 6 0 0 1-6-6h2Z"
          clipRule="evenodd"
        />
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M16 17a4 4 0 0 1 4-4v-2a6 6 0 0 0-6 6h2Z"
          clipRule="evenodd"
        />
      </svg>
    </NextLink>
  );
};
