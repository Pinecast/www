import * as React from 'react';
import {useCSS} from '@/hooks/useCSS';
import {
  GintoNordCondensed,
  MonumentGroteskBold,
  MonumentGroteskSemiMono,
} from '@/fonts';
import {
  MIN_TABLET_MEDIA_QUERY,
  MOBILE_BREAKPOINT,
  MOBILE_MEDIA_QUERY,
} from '@/constants';
import {Link, PillButton} from './Typography';
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
    <h2
      className={css({
        ...GintoNordCondensed,
        fontSize: '48px',
        fontWeight: '400',
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
    </h2>
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
      <PillButton aria-hidden={true} style={{textTransform: 'uppercase'}}>
        {tag}
      </PillButton>
      <Title
        style={{
          marginTop: '40px',
          [MIN_TABLET_MEDIA_QUERY]: {marginTop: '40px'},
        }}
      >
        <span
          className={css({
            position: 'absolute',
            userSelect: 'none',
            opacity: 0,
          })}
        >
          {tag}
          {' - '}
        </span>
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
    <h3
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
    </h3>
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

export const ChecksList = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  return (
    <ul
      className={css({
        listStyle: 'none',
        marginBottom: '40px',
        marginTop: '20px',
        marginRight: 'var(--text-gutter)',
        marginLeft: 'var(--text-gutter)',
        padding: 0,

        display: 'grid',
        gridTemplateColumns: '1fr',
        columnGap: '20px',

        ':not(:empty) > li': {
          borderBottom: '1px solid var(--color-core-accent)',
          paddingBottom: '10px',
          paddingRight: '30px',
          marginLeft: 0,
          marginBottom: '10px',
          position: 'relative',

          fontSize: '14px',
          lineHeight: '20px',
        },
        ':not(:empty) > li::before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          right: '4px',
          height: '20px',
          bottom: '10px',
          width: '20px',
          backgroundColor: 'var(--color-space)',
          borderRadius: '50%',
        },
        ':not(:empty) > li::after': {
          content: '""',
          display: 'block',
          height: '10px',
          width: '5px',
          transform: 'rotate(45deg)',
          borderColor: 'var(--color-sand)',
          borderStyle: 'solid',
          borderTopWidth: 0,
          borderLeftWidth: 0,
          borderRightWidth: '2px',
          borderBottomWidth: '2px',
          position: 'absolute',
          right: '11px',
          bottom: '16px',
        },

        [MIN_TABLET_MEDIA_QUERY]: {
          marginBottom: '80px',
          marginTop: '40px',
          maxWidth: '805px',
          marginRight: 'auto',
          marginLeft: 'auto',
          gridTemplateColumns: '1fr 1fr',
          ':not(:empty) > li': {
            fontSize: '22px',
            lineHeight: '25px',
            marginBottom: '30px',
          },
          ':not(:empty) > li::before': {bottom: '12px'},
          ':not(:empty) > li::after': {bottom: '18px'},
        },

        ':last-child': {
          marginBottom: 0,
        },
      })}
    >
      {children}
    </ul>
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
          ...MonumentGroteskBold,
          borderTop: '1px solid var(--color-core-accent)',
          paddingTop: '10px',
          paddingRight: '20px',
          marginBottom: '20px',

          fontSize: '16px',
          fontWeight: 400,
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
        ':not(:empty) > dd > p': {
          marginLeft: 0,
          marginRight: 0,
        },

        [MIN_TABLET_MEDIA_QUERY]: {
          marginBottom: '150px',
          marginTop: '20px',
          maxWidth: '805px',
          marginRight: 'auto',
          marginLeft: 'auto',
          ':last-child': {
            marginBottom: 0,
          },

          gridTemplateColumns: '1fr 1fr',
          rowGap: '20px',

          ':not(:empty) > dt': {
            paddingTop: '10px',
            paddingRight: '20px',

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

        ':last-child': {
          marginBottom: 0,
        },
      })}
    >
      {children}
    </dl>
  );
};

type Product = {
  name: string;
  imageUrl: string;
  price: string;
  description: string;
  url: string;
};

export const ProductFeature = ({
  name,
  imageUrl,
  price,
  description,
  url,
  accessories,
}: Product & {
  accessories?: Array<Product>;
}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        background: 'var(--color-space)',
        color: 'var(--color-sand)',
        width: '100%',
        borderRadius: '20px',
        marginTop: '20px',
        marginBottom: '20px',
        padding: '20px',

        display: 'grid',
        gap: '5px 20px',
        gridTemplateAreas:
          '"image name" "image price" "image description" "image url" "accessories accessories"',
        gridTemplateColumns: '150px 1fr',
        gridTemplateRows: 'min-content',
        [MOBILE_MEDIA_QUERY]: {
          gridTemplateColumns: '20% 1fr',
        },
      })}
    >
      <div
        className={css({
          backgroundColor: '#fff',
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          borderRadius: '10px',
          gridArea: 'image',
          height: 0,
          paddingBottom: '100%',
        })}
      />
      <div
        className={css({
          ...MonumentGroteskBold,
          color: 'var(--color-grape-25)',
          fontSize: '28px',
          fontWeight: 400,
          gridArea: 'name',
        })}
      >
        {name}
      </div>
      <div
        className={css({
          ...MonumentGroteskSemiMono,
          color: 'var(--color-lime)',
          fontSize: '16px',
          gridArea: 'price',
        })}
      >
        {price}
      </div>
      <div
        className={css({
          fontSize: '20px',
          gridArea: 'description',
        })}
      >
        {description}
      </div>
      <div
        className={css({
          gridArea: 'url',
        })}
      >
        <Link target="_blank" href={url}>
          See it on Amazon
        </Link>
      </div>
      {accessories && (
        <div
          className={css({
            gridArea: 'accessories',
            marginTop: '24px',
            position: 'relative',
            ':after': {
              display: 'block',
              content: '""',
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '40px',
              background:
                'linear-gradient(to left, var(--color-space), transparent)',
            },
          })}
        >
          <div
            className={css({
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              overflowX: 'scroll',
              paddingRight: '40px',
            })}
          >
            {accessories.map(accessory => (
              <ProductFeatureAccessory key={accessory.url} {...accessory} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProductFeatureAccessory = ({
  name,
  imageUrl,
  price,
  description,
  url,
}: Product) => {
  const css = useCSS();
  return (
    <a
      href={url}
      target="_blank"
      className={css({
        backgroundColor: 'var(--color-space-50)',
        color: 'var(--color-sand)',
        borderRadius: '10px',
        fontSize: '14px',
        padding: '10px',

        display: 'grid',
        gap: '2px 10px',
        gridTemplateAreas: '"image name" "image price" "image description"',
        gridTemplateColumns: '20% 1fr',
        gridTemplateRows: 'min-content',

        flex: '0 0 300px',
        width: '300px',

        textDecoration: 'none',
        ':hover .ProductFeatureAccessory-Title': {
          textDecoration: 'underline',
        },
      })}
    >
      <div
        className={css({
          backgroundColor: '#fff',
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          borderRadius: '10px',
          overflow: 'hidden',
          gridArea: 'image',
          height: 0,
          paddingBottom: '100%',
        })}
      />
      <div
        className={
          css({
            ...MonumentGroteskBold,
            color: 'var(--color-grape-25)',
            fontWeight: 400,
            gridArea: 'name',
          }) + ' ProductFeatureAccessory-Title'
        }
      >
        {name}
      </div>
      <div
        className={css({
          ...MonumentGroteskSemiMono,
          color: 'var(--color-lime)',
          fontSize: '12px',
          gridArea: 'price',
        })}
      >
        {price}
      </div>
      <div
        className={css({
          gridArea: 'description',
        })}
      >
        {description}
      </div>
    </a>
  );
};
