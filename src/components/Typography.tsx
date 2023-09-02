import {MOBILE_MEDIA_QUERY} from '@/constants';
import {GintoNordCondensed, MonumentGroteskBold, MonumentGroteskRegular, MonumentGroteskSemiMono} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import {ReactNode} from 'react';
import {StyleObject} from 'styletron-react';

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
        fontSize: '160px',
        letterSpacing: '-0.04em',
        lineHeight: '144px',
        textTransform: 'uppercase',
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          fontSize: '62px',
          lineHeight: '56px',
          ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
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
        fontSize: '80px',
        letterSpacing: '-0.04em',
        lineHeight: '72px',
        textTransform: 'uppercase',
        margin: 0,
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          fontSize: '48px',
          lineHeight: '43px',
          ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </h2>
  );
};


export const Body1 = ({
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
        fontSize: '28px',
        letterSpacing: '-0.03em',
        lineHeight: '28px',
        margin: 0,
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          fontSize: '24px',
          lineHeight: '24px',
          ...(style as Record<string, any>)?.[MOBILE_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </p>
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
        margin: 0,
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
        margin: 0,
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

export const Caption = ({
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
        fontSize: '12px',
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
    </small>
  );
};

