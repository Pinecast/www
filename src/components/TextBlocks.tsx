import * as React from 'react';
import {useCSS} from '@/hooks/useCSS';
import {GintoNordCondensed, MonumentGroteskBold} from '@/fonts';
import {MIN_TABLET_MEDIA_QUERY} from '@/constants';

export const Intro = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        // Cheeky hack to apply the style to the nested paragraph from MDX
        ':not(:empty) > p': {
          ...MonumentGroteskBold,
          fontSize: '28px',
          letterSpacing: '-1px',
          lineHeight: '28px',
          marginLeft: 0,
          [MIN_TABLET_MEDIA_QUERY]: {
            fontSize: '42px',
            lineHeight: '42px',
            maxWidth: '70%',
          },
        },
        marginBottom: '80px',
        paddingLeft: '30px',
        paddingRight: '30px',
        [MIN_TABLET_MEDIA_QUERY]: {
          marginBottom: '150px',
        },
      })}
    >
      {children}
    </div>
  );
};

export const Title = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  return (
    <h3
      className={css({
        ...GintoNordCondensed,
        fontSize: '48px',
        letterSpacing: '-0.04em',
        lineHeight: '43px',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: '80px',
        marginTop: '60px',

        [MIN_TABLET_MEDIA_QUERY]: {
          fontSize: '80px',
          lineHeight: '72px',
          marginBottom: '150px',
          marginTop: '130px',
        },
      })}
    >
      {children}
    </h3>
  );
};

export const Subtitle = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  return (
    <h4
      className={css({
        ...MonumentGroteskBold,
        fontSize: '28px',
        lineHeight: '28px',
        marginBottom: '40px',
        marginTop: '60px',
        marginRight: 'var(--text-gutter)',
        marginLeft: 'var(--text-gutter)',

        [MIN_TABLET_MEDIA_QUERY]: {
          fontSize: '42px',
          lineHeight: '42px',
          marginBottom: '40px',
          marginTop: '130px',
          maxWidth: '805px',
          marginRight: 'auto',
          marginLeft: 'auto',
        },
      })}
    >
      {children}
    </h4>
  );
};

export const ContentSection = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  return (
    <h5
      className={css({
        ...MonumentGroteskBold,
        fontSize: '1em',
        lineHeight: 'inherit',
        marginBottom: '1em',
        marginTop: '10px',
        marginRight: 'var(--text-gutter)',
        marginLeft: 'var(--text-gutter)',

        [MIN_TABLET_MEDIA_QUERY]: {
          // fontSize: '42px',
          // lineHeight: '42px',
          marginBottom: '20px',
          marginTop: '50px',
          maxWidth: '805px',
          marginRight: 'auto',
          marginLeft: 'auto',
        },
      })}
    >
      {children}
    </h5>
  );
};

