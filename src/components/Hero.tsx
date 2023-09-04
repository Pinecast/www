import {useCSS} from '@/hooks/useCSS';
import {Body4, Caption, H2} from './Typography';
import {
  MOBILE_BREAKPOINT,
  MOBILE_MEDIA_QUERY,
  TABLET_BREAKPOINT,
  TABLET_MEDIA_QUERY,
} from '@/constants';
import {SecondaryButton} from './SecondaryButton';
import {StyleObject} from 'styletron-react';
import React from 'react';
import {useCalculateResizableValue} from '@/hooks/useCalculateResizableValue';

const PlaceholderImage = ({style}: {style: StyleObject}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        background: 'red',
        borderRadius: '20px',
        position: 'relative',
        ...style,
      })}
    ></div>
  );
};
const HeroImage = ({src, style}: {src: string; style: StyleObject}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        backgroundImage: `url(${src})`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        borderRadius: '20px',
        position: 'relative',
        ...style,
      })}
    />
  );
};

const RADIUS_OFFSET = 60;
const RADIUS_OFFSET_TABLET = 60;
const RADIUS_OFFSET_MOBILE = 40;

const Radius = React.forwardRef<
  HTMLDivElement,
  {
    zIndex: number;
    hideOnTablet?: boolean;
    hideOnMobile?: boolean;
    transitionDelay?: number;
  }
>(function Radius(
  {hideOnTablet, hideOnMobile, transitionDelay = 0, zIndex},
  ref,
) {
  const css = useCSS();
  return (
    <div
      className={css({
        '--radius-width': 0,
        background: 'var(--color-primary-light)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        borderRadius: '100%',
        position: 'absolute',
        left: '-100%',
        right: '-100%',
        margin: '0 auto',
        top: `calc(-1 * (var(--radius-width) / 2) + ${RADIUS_OFFSET}px)`,
        height: 'var(--radius-width)',
        width: 'var(--radius-width)',
        transition: `height 1.2s ease-out ${transitionDelay}s, width 1.2s ease-out ${transitionDelay}s, top 0.5s`,
        zIndex,
        [TABLET_MEDIA_QUERY]: {display: hideOnTablet ? 'none' : 'grid'},
        [MOBILE_MEDIA_QUERY]: {display: hideOnMobile ? 'none' : 'grid'},
      })}
      ref={ref}
    />
  );
});

export const Hero = () => {
  const css = useCSS();

  const wrapper = React.useRef<HTMLElement>(null);
  const wrapperSize = React.useRef<{width: number; height: number}>({
    width: 0,
    height: 0,
  });

  const textArea = React.useRef<HTMLDivElement>(null);
  const radiusRefOuter = React.useRef<HTMLDivElement>(null);
  const radiusRefMiddle = React.useRef<HTMLDivElement>(null);
  const radiusRefInner = React.useRef<HTMLDivElement>(null);

  const updateSize = React.useCallback(() => {
    const {width, height} = wrapperSize.current;

    const isMobile = width < MOBILE_BREAKPOINT;
    const isTablet = width < TABLET_BREAKPOINT && !isMobile;

    const radiusOffset = isMobile
      ? RADIUS_OFFSET_MOBILE
      : isTablet
      ? RADIUS_OFFSET_TABLET
      : RADIUS_OFFSET;

    radiusRefInner.current?.style.setProperty(
      '--radius-width',
      `${
        Math.sqrt(
          ((textArea.current!.parentNode as HTMLElement).offsetWidth / 2) ** 2 +
            (textArea.current!.offsetHeight + radiusOffset + 20) ** 2,
        ) * 2
      }px`,
    );
    radiusRefMiddle.current?.style.setProperty(
      '--radius-width',
      `${
        Math.sqrt(
          ((width / 2) * (2.5 / 4) + 20) ** 2 +
            (height * (24 / 78) + radiusOffset) ** 2,
        ) * 2
      }px`,
    );
    radiusRefOuter.current?.style.setProperty(
      '--radius-width',
      `${
        Math.sqrt(
          ((width / 2) * (2.5 / 4) + 20) ** 2 +
            (height * (48 / 78) + radiusOffset) ** 2,
        ) * 2
      }px`,
    );
  }, []);

  useCalculateResizableValue(
    React.useCallback(() => {
      wrapperSize.current = wrapper.current!.getBoundingClientRect();
      updateSize();
    }, [updateSize]),
  );

  return (
    <section
      ref={wrapper}
      className={css({
        display: 'grid',
        height: '100vh',
        minHeight: '800px',
        paddingTop: '120px',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingBottom: '20px',
        position: 'relative',
        gap: '20px',
        gridTemplateColumns: '1.1fr 5fr 1.1fr',
        gridTemplateRows: '46fr 32fr',

        overflow: 'hidden',

        [TABLET_MEDIA_QUERY]: {
          gridTemplateColumns: '1fr',
          gridTemplateRows: '1fr 1fr',
        },
        [MOBILE_MEDIA_QUERY]: {
          gridTemplateColumns: '1fr',
          paddingTop: '106px',
          paddingLeft: '10px',
          paddingRight: '10px',
          paddingBottom: '10px',
        },

        zIndex: 50,
      })}
    >
      <HeroImage
        src="/images/hero/t-l.png"
        style={{
          gridArea: '1 / 1 / 2 / 2',
          zIndex: 3,
          [TABLET_MEDIA_QUERY]: {display: 'none'},
        }}
      />
      <HeroImage
        src="/images/hero/b-l.png"
        style={{
          gridArea: '2 / 1 / 3 / 2',
          zIndex: 1,
          [TABLET_MEDIA_QUERY]: {display: 'none'},
        }}
      />

      <div
        className={css({
          gridArea: '1 / 2 / 3 / 3',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          gridTemplateRows: '24fr 54fr',
          gap: '20px',

          [TABLET_MEDIA_QUERY]: {
            gridArea: '1 / 1 / 3 / 2',
          },
          [MOBILE_MEDIA_QUERY]: {
            gridTemplateColumns: '1fr',
          },
        })}
      >
        <PlaceholderImage
          style={{
            gridArea: '1 / 1 / 2 / 2',
            zIndex: 5,
            [TABLET_MEDIA_QUERY]: {display: 'none'},
          }}
        />
        <PlaceholderImage
          style={{
            gridArea: '2 / 1 / 3 / 2',
            zIndex: 5,
            [TABLET_MEDIA_QUERY]: {gridArea: '2 / 1 / 3 / 2'},
            [MOBILE_MEDIA_QUERY]: {display: 'none'},
          }}
        />

        <div
          className={css({
            gridArea: '1 / 2 / 3 / 3',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: 'min-content 1fr',
            gap: '20px',
            [MOBILE_MEDIA_QUERY]: {
              gridArea: '1 / 1 / 3 / 2',
            },
          })}
        >
          <Radius zIndex={6} ref={radiusRefInner} />
          <div
            ref={textArea}
            className={css({
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
              maxWidth: '570px',
              margin: '0 auto',
              textAlign: 'center',
              gridArea: '1 / 1 / 2 / 2',
              paddingTop: '56px',
              position: 'relative',
              zIndex: 10,
              [MOBILE_MEDIA_QUERY]: {
                gap: '15px',
                maxWidth: '340px',
              },
            })}
          >
            <H2>
              Hi! I&rsquo;m
              <br />
              your host
            </H2>
            <Body4>
              Welcome to Pinecast, a batteries-included
              <br />
              podcast hosting platform
            </Body4>
            <SecondaryButton
              href="https://pinecast.com/signup"
              style={{
                paddingLeft: '40px',
                paddingRight: '40px',
                [MOBILE_MEDIA_QUERY]: {
                  paddingLeft: '30px',
                  paddingRight: '30px',
                },
              }}
            >
              Start for free
            </SecondaryButton>
            <Caption style={{color: 'var(--color-core-accent)'}}>
              No credit card required
            </Caption>
          </div>
          <HeroImage
            src="/images/hero/central.png"
            style={{
              gridArea: '2 / 1 / 3 / 2',
              zIndex: 5,
              [MOBILE_MEDIA_QUERY]: {
                gridArea: '2 / 1 / 3 / 2',
              },
            }}
          />
        </div>

        <PlaceholderImage
          style={{
            gridArea: '1 / 3 / 2 / 4',
            zIndex: 5,
            [TABLET_MEDIA_QUERY]: {display: 'none'},
          }}
        />
        <PlaceholderImage
          style={{
            gridArea: '2 / 3 / 3 / 4',
            zIndex: 5,
            [TABLET_MEDIA_QUERY]: {gridArea: '2 / 3 / 3 / 4'},
            [MOBILE_MEDIA_QUERY]: {display: 'none'},
          }}
        />
      </div>

      <HeroImage
        src="/images/hero/t-r.png"
        style={{
          gridArea: '1 / 3 / 2 / 4',
          zIndex: 3,
          [TABLET_MEDIA_QUERY]: {display: 'none'},
        }}
      />
      <HeroImage
        src="/images/hero/b-r.png"
        style={{
          gridArea: '2 / 3 / 3 / 4',
          zIndex: 1,
          [TABLET_MEDIA_QUERY]: {display: 'none'},
        }}
      />

      <Radius
        zIndex={4}
        ref={radiusRefMiddle}
        hideOnTablet
        hideOnMobile
        transitionDelay={0.15}
      />
      <Radius
        zIndex={2}
        ref={radiusRefOuter}
        hideOnTablet
        hideOnMobile
        transitionDelay={0.3}
      />
    </section>
  );
};
