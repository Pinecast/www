import {Footer} from '@/components/Footer';
import {InfoPageFooterUpsell} from '@/components/InfoPageFooterUpsell';
import {MainHeader} from '@/components/MainHeader';
import {MainLogo} from '@/components/MainLogo';
import {
  MarqueeDivider,
  StandardMarqueeDivider,
} from '@/components/MarqueeDivider';
import {
  MIN_TABLET_MEDIA_QUERY,
  MOBILE_MEDIA_QUERY,
  TABLET_MEDIA_QUERY,
} from '@/constants';
import {MonumentGroteskRegular} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import {
  ElementOutput,
  Timeline,
  useScrollTimeline,
} from '@/hooks/useScrollTimeline';
import Head from 'next/head';
import * as React from 'react';

const CURVE_DEPTH = 100;

const timeline: Timeline = {
  width: {
    property: '--max-width',
    unit: '',
    keyframes: [
      {target: 0, ease: 'linear'},
      {target: 1, ease: 'linear'},
      {target: 1, ease: 'linear'},
    ],
  },
  mobileBorder: {
    property: '--mobile-border',
    unit: 'px',
    keyframes: [
      {target: 20, ease: 'linear'},
      {target: 10, ease: 'linear'},
      {target: 0, ease: 'linear'},
    ],
  },
};

type Props = {
  color?: string;
  children: React.ReactNode;
  heroImage: string;
  title: string;
  description: string;
};

export const BaseLayout = (
  content: (props: Omit<Props, 'children'>) => React.ReactNode,
  {defaultColor = 'var(--color-lime)'}: {defaultColor?: string} = {},
) =>
  function BaseLayout(props: Props) {
    const {
      children,
      heroImage,
      title,
      description,
      color = defaultColor,
    } = props;

    const css = useCSS();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const heroRef = React.useRef<HTMLDivElement>(null);

    const scrollHandler = React.useCallback((props: ElementOutput) => {
      const windowWidth = window.innerWidth;
      const maxWidthPercent = Number(props.width[1]);
      const maxWidth = (windowWidth - 550) * maxWidthPercent + 550;
      heroRef.current!.style.setProperty(
        props.width[0],
        maxWidth.toFixed(1) + 'px',
      );

      // const circleRadius = (windowWidth - 550) * maxWidthPercent + 550;

      const circleRadius =
        (4 * CURVE_DEPTH ** 2 + maxWidth ** 2) / (8 * CURVE_DEPTH);
      const circleOffset =
        -1 * Math.sqrt(circleRadius ** 2 - (maxWidth / 2) ** 2);
      heroRef.current!.style.setProperty(
        '--circle-radius',
        circleRadius.toFixed(1) + 'px',
      );
      heroRef.current!.style.setProperty(
        '--circle-offset',
        circleOffset.toFixed(3) + 'px',
      );
      heroRef.current!.style.setProperty(
        props.mobileBorder[0],
        props.mobileBorder[1],
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useScrollTimeline(containerRef, timeline, scrollHandler);

    return (
      <>
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
        </Head>
        <div ref={containerRef}>
          <MainLogo />
          <MainHeader />
          <div
            className={css({
              backgroundColor: color,
              minHeight: '175vh',
              textAlign: 'center',
            })}
          >
            <div
              className={css({
                position: 'sticky',
                paddingTop: '200px',
                top: 0,
              })}
            >
              {content(props)}
              <BaseHero color={color} heroImage={heroImage} ref={heroRef} />
            </div>
          </div>
        </div>
        <section
          className={css({
            maxWidth: '1375px',
            marginBottom: 0,
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 0,
            padding: '80px 10px',
            '--text-gutter': '30px',

            // Base MDX styles
            ...MonumentGroteskRegular,
            fontSize: '18px',

            [MIN_TABLET_MEDIA_QUERY]: {
              padding: '150px 150px',
              '--text-gutter': '0px',

              // Base MDX styles
              fontSize: '28px',
            },
          })}
        >
          {children}
        </section>
        <StandardMarqueeDivider
          topBackgroundColor="var(--color-sand)"
          bottomBackgroundColor="var(--color-space)"
        />
        <InfoPageFooterUpsell />
        <Footer />
      </>
    );
  };

const BaseHero = React.forwardRef<
  HTMLDivElement,
  {heroImage: string; color: string}
>(function BaseHero(
  {color, heroImage}: {color: string; heroImage: string},
  ref,
) {
  const css = useCSS();
  return (
    <div
      ref={ref}
      className={css({
        backgroundImage: `url(${heroImage})`,
        backgroundPosition: 'center',
        borderRadius: '32px',
        width: 'var(--max-width)',
        height: '700px',
        backgroundSize: 'cover',
        marginBottom: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 0,

        position: 'relative',

        [MOBILE_MEDIA_QUERY]: {
          width: 'calc(100vw - var(--mobile-border) * 2)',
          height: 'calc((100vw - var(--mobile-border) * 2) * 1.2727272727)',
        },
      })}
    >
      <div
        className={css({
          background: color,
          clipPath: 'circle(var(--circle-radius) at 50% var(--circle-offset))',
          position: 'absolute',
          width: 'var(--max-width)',
          height: '100%',
          top: 0,
          [MOBILE_MEDIA_QUERY]: {
            clipPath: 'circle(100% at 50% -79%)',
            width: '100%',
          },
        })}
      />
    </div>
  );
});
