import * as React from 'react';
import {useCSS} from '@/hooks/useCSS';
import {GintoNordCondensed, MonumentGroteskBold} from '@/fonts';
import {MIN_TABLET_MEDIA_QUERY} from '@/constants';
import {PillButton} from './Typography';
import {StyleObject} from 'styletron-react';

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

export const Title = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleObject;
}) => {
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
        ...style,

        [MIN_TABLET_MEDIA_QUERY]: {
          fontSize: '80px',
          lineHeight: '72px',
          marginBottom: '150px',
          marginTop: '130px',
          ...(style as any)?.[MIN_TABLET_MEDIA_QUERY],
        },
      })}
    >
      {children}
    </h3>
  );
};

export const TaggedTitle = ({
  children,
  tag,
  style,
}: {
  children: React.ReactNode;
  tag: string;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <div className={css({textAlign: 'center', ...style})}>
      <PillButton style={{textTransform: 'uppercase'}}>{tag}</PillButton>
      <Title
        style={{
          marginTop: '40px',
          [MIN_TABLET_MEDIA_QUERY]: {marginTop: '40px'},
        }}
      >
        {children}
      </Title>
    </div>
  );
};

export const Step = ({
  children,
  stepNumber,
  title,
}: {
  children: React.ReactNode;
  stepNumber: number;
  title: string;
}) => {
  const css = useCSS();
  return (
    <section className={css({':not(:last-child)': {marginBottom: '150px'}})}>
      <TaggedTitle
        tag={`Step ${stepNumber.toString().padStart(2, '0')}`}
        style={{marginTop: '0px'}}
      >
        {title}
      </TaggedTitle>
      {children}
    </section>
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

export const DefinitionList = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  return (
    <dl
      className={css({
        marginBottom: '80px',
        marginTop: '20px',
        marginRight: 'var(--text-gutter)',
        marginLeft: 'var(--text-gutter)',

        display: 'grid',
        gridTemplateColumns: 'min-content 1fr',

        ':not(:empty) > dt': {
          borderTop: '1px solid var(--color-core-accent)',
          paddingTop: '10px',
          paddingRight: '20px',
          marginBottom: '20px',

          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '18px',
        },
        ':not(:empty) > dd': {
          borderTop: '1px solid var(--color-core-accent)',
          paddingTop: '10px',
          marginLeft: 0,
          marginBottom: '6px',

          fontSize: '14px',
          lineHeight: '17px',
        },

        [MIN_TABLET_MEDIA_QUERY]: {
          marginBottom: '150px',
          marginTop: '20px',
          maxWidth: '805px',
          marginRight: 'auto',
          marginLeft: 'auto',

          gridTemplateColumns: '1fr 1fr',
          rowGap: '20px',

          ':not(:empty) > dt': {
            paddingTop: '10px',
            paddingRight: '20px',

            fontWeight: 700,
            fontSize: '22px',
            lineHeight: '24px',
          },
          ':not(:empty) > dd': {
            paddingTop: '10px',
            marginLeft: 0,

            fontSize: '18px',
            lineHeight: '22px',
          },
        },
      })}
    >
      {children}
    </dl>
  );
};
