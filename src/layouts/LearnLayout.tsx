import {MainHeader} from '@/components/MainHeader';
import {MainLogo} from '@/components/MainLogo';
import {H1, PillButton} from '@/components/Typography';
import {MOBILE_MEDIA_QUERY} from '@/constants';
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

export const LearnLayout = ({
  children,
  heroImage,
  title,
  description,
}: {
  children: React.ReactNode;
  heroImage: string;
  title: string;
  description: string;
}) => {
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
            backgroundColor: 'var(--color-lime)',
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
            <PillButton
              style={{textTransform: 'uppercase', marginBottom: '30px'}}
            >
              Learn with Pinecast
            </PillButton>
            <H1 style={{padding: '0 10%', marginBottom: '50px'}}>{title}</H1>
            <LearnHero heroImage={heroImage} ref={heroRef} />
          </div>
        </div>
      </div>
      <section
        className={css({
          maxWidth: '1375px',
          margin: '0 auto',
          padding: '0 10px',
        })}
      >
        {children}
      </section>
    </>
  );
};

const LearnHero = React.forwardRef<HTMLDivElement, {heroImage: string}>(
  function LearnHero({heroImage}: {heroImage: string}, ref) {
    const css = useCSS();
    return (
      <div
        ref={ref}
        className={css({
          backgroundImage: `url(${heroImage})`,
          borderRadius: '32px',
          width: 'var(--max-width)',
          height: '700px',
          backgroundSize: 'cover',
          margin: '0 auto',

          position: 'relative',

          [MOBILE_MEDIA_QUERY]: {
            width: 'calc(100vw - var(--mobile-border) * 2)',
            height: 'calc((100vw - var(--mobile-border) * 2) * 1.2727272727)',
          },
        })}
      >
        <div
          className={css({
            background: 'var(--color-lime)',
            clipPath:
              'circle(var(--circle-radius) at 50% var(--circle-offset))',
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
  },
);
