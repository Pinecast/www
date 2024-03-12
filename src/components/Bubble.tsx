import * as React from 'react';
import {KeyframesObject} from 'styletron-standard';
import {useCSS} from '@/hooks/useCSS';
import {CAN_HOVER_MEDIA_QUERY, PREFERS_REDUCED_MOTION_QUERY} from '@/constants';
import {useRouter} from 'next/router';

const DRIFT_ANIMATION: KeyframesObject = {
  '0%, 100%': {translate: '0 -5%'},
  '50%': {translate: '0 5%'},
};

const WIGGLE_ANIMATION: KeyframesObject = {
  '0%': {scale: '1 1'},
  '20%': {scale: '1.05 0.95'},
  '48%': {scale: '0.9 1.075'},
  '68%': {scale: '1.02 0.98'},
  '80%': {scale: '0.98 1.02'},
  '97%, 100%': {scale: '1 1'},
};

type BubbleProps = {
  color?: string;
  children: React.ReactNode;
  offsetX?: number;
  offsetY?: number;
  size?: number;
};

const Bubble1 = ({
  color = 'var(--color-primary-light)',
  children,
  offsetX = 28,
  offsetY = 14,
  size = 96,
}: BubbleProps) => {
  const css = useCSS();
  return (
    <div
      className={css({
        '--bubble-bg-color': color,
        '--bubble-border-color': 'rgba(0, 0, 0, 0.05)',
        '--bubble-drop-shadow-color': 'rgba(0, 0, 0, 0.25)',
        '--bubble-drop-shadow': '0 2px 2px var(--bubble-drop-shadow-color)',
        '--bubble-inset-color-first': '#555',
        '--bubble-inset-color-last': '#fff',
        '--bubble-size': `${size}px`,
        '--bubble-inset-transition': 'all 1s linear',
        '--bubble-text-color': 'var(--color-primary-light)',
        animationDuration: '6s',
        animationIterationCount: 'infinite',
        animationName: DRIFT_ANIMATION,
        animationDelay: '0.2s',
        animationTimingFunction: 'linear',
        backgroundColor: 'var(--bubble-bg-color)',
        borderColor: 'var(--bubble-border-color)',
        borderRadius: '50%',
        borderStyle: 'solid',
        borderWidth: '2px',
        boxShadow:
          'inset 0 0 calc(var(--bubble-size) / 8) rgba(255, 255, 255, 0.25)',
        display: 'grid',
        cursor: 'pointer',
        filter: 'drop-shadow(var(--bubble-drop-shadow))',
        height: 'var(--bubble-size)',
        left: `${offsetX}px`,
        position: 'absolute',
        placeSelf: 'center',
        placeItems: 'center',
        top: `${offsetY}px`,
        transition: 'all 0.2s ease-in-out',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        width: 'var(--bubble-size)',
        [PREFERS_REDUCED_MOTION_QUERY]: {
          animationDuration: '0.01ms',
          animationIterationCount: '1',
          transitionDuration: '0.01ms',
        },
        ':hover': {
          animationPlayState: 'paused',
          [CAN_HOVER_MEDIA_QUERY]: {
            '--bubble-border-color': 'rgba(255, 255, 255, 0.25)',
            '--bubble-drop-shadow-color': 'rgba(0, 0, 0, 0.75)',
          },
        },

        ['::before']: {
          borderLeft:
            'calc(var(--bubble-size) / 12) solid var(--bubble-inset-color-first)',
          borderRadius: '50%',
          content: '""',
          filter: 'blur(calc(var(--bubble-size) / 15))',
          inset: 'calc(var(--bubble-size) / 24)',
          position: 'absolute',
          transition: 'var(--bubble-inset-transition)',
          [PREFERS_REDUCED_MOTION_QUERY]: {
            transitionDuration: '0.01ms',
          },
        },

        ['::after']: {
          borderBottom: 'calc(var(--bubble-size) / 24) solid purple',
          borderRadius: '50%',
          content: '""',
          filter: 'blur(calc(var(--bubble-size) / 15))',
          inset: 'calc(var(--bubble-size) / 24)',
          position: 'absolute',
          transform: 'rotate(-30deg)',
          transition: 'var(--bubble-inset-transition)',
          [PREFERS_REDUCED_MOTION_QUERY]: {
            transitionDuration: '0.01ms',
          },
        },
      })}
    >
      {children}
    </div>
  );
};

const Bubble2 = ({
  color = 'var(--color-primary-light)',
  children,
  offsetX = 28,
  offsetY = 14,
  size = 96,
}: BubbleProps) => {
  const css = useCSS();
  return (
    <div
      className={css({
        '--bubble-bg-color': color,
        '--bubble-border-color': 'rgba(0, 0, 0, 0.05)',
        '--bubble-drop-shadow-color': 'rgba(0, 0, 0, 0.25)',
        '--bubble-drop-shadow': '0 2px 2px var(--bubble-drop-shadow-color)',
        '--bubble-inset-color-first': '#555',
        '--bubble-inset-color-last': '#fff',
        '--bubble-size': `${size}px`,
        '--bubble-inset-transition': 'all 1s linear',
        '--bubble-text-color': 'var(--color-space)',
        animationDuration: '2s',
        animationIterationCount: 'infinite',
        animationName: WIGGLE_ANIMATION,
        animationDelay: '0.2s',
        animationTimingFunction: 'ease-out',
        backgroundColor: 'var(--bubble-bg-color)',

        borderRadius: '50%',
        position: 'relative',
        background:
          'radial-gradient(circle at 50% 55%, rgba(240, 245, 255, 0.9), rgba(240, 245, 255, 0.9) 40%, rgba(225, 238, 255, 0.8) 60%, rgba(43, 130, 255, 0.4))',

        '::after': {
          content: '""',
          position: 'absolute',
          top: '5%',
          left: '10%',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          filter: 'blur(1px)',
          zIndex: 2,
          transform: 'rotateZ(-30deg)',
          display: 'block',
          background:
            'radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0) 74%, white 80%, white 84%, rgba(255, 255, 255, 0) 100%)',
        },

        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        height: 'var(--bubble-size)',
        width: 'var(--bubble-size)',

        display: 'grid',
        placeSelf: 'center',
        placeItems: 'center',
        left: `${offsetX}px`,
        top: `${offsetY}px`,

        [PREFERS_REDUCED_MOTION_QUERY]: {
          animationDuration: '0.01ms',
          animationIterationCount: '1',
          transitionDuration: '0.01ms',
        },
        ':hover': {
          animationPlayState: 'paused',
          [CAN_HOVER_MEDIA_QUERY]: {
            '--bubble-border-color': 'rgba(255, 255, 255, 0.25)',
            '--bubble-drop-shadow-color': 'rgba(0, 0, 0, 0.75)',
          },
        },
      })}
    >
      {children}
    </div>
  );
};

const Bubble3 = ({
  color = 'var(--color-primary-light)',
  children,
  offsetX = 28,
  offsetY = 14,
  size = 96,
}: BubbleProps) => {
  const css = useCSS();
  return (
    <div
      className={css({
        '--bubble-bg-color': color,
        '--bubble-border-color': 'rgba(0, 0, 0, 0.05)',
        '--bubble-drop-shadow-color': 'rgba(0, 0, 0, 0.25)',
        '--bubble-drop-shadow': '0 2px 2px var(--bubble-drop-shadow-color)',
        '--bubble-inset-color-first': '#555',
        '--bubble-inset-color-last': '#fff',
        '--bubble-size': `${size}px`,
        '--bubble-inset-transition': 'all 1s linear',
        '--bubble-text-color': 'var(--color-primary-dark)',
        animationDuration: '2s',
        animationIterationCount: 'infinite',
        animationName: WIGGLE_ANIMATION,
        animationDelay: '0.2s',
        animationTimingFunction: 'ease-out',
        backgroundColor: 'var(--color-primary-light)',
        borderRadius: '50%',
        position: 'relative',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        height: 'var(--bubble-size)',
        width: 'var(--bubble-size)',
        display: 'grid',
        placeSelf: 'center',
        placeItems: 'center',
        left: `${offsetX}px`,
        top: `${offsetY}px`,

        border: "solid 1px rgba(50,50,50,.5)",
        boxShadow: "0 -3px 3px 1px rgba(50,50,50,.5) inset",
        overflow: "hidden",
        "::before": {
          borderTop: "solid 5px var(--color-primary-dark)",
          borderRadius: "50%",
          opacity: 0.15,
          boxSizing: "border-box",
          content: '""',
          inset: "5px 5px 10px 10px",
          position: "absolute",
          transform: "rotate(45deg)"
        },

        [PREFERS_REDUCED_MOTION_QUERY]: {
          animationDuration: '0.01ms',
          animationIterationCount: '1',
          transitionDuration: '0.01ms',
        },
        ':hover': {
          animationPlayState: 'paused',
        },
      })}
    >
      {children}
    </div>
  );
};

const AVAILABLE_BUBBLES = [Bubble1, Bubble2, Bubble3];

// TEMP: Quick debugging tool to view alternate treatments.
export const Bubble = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & BubbleProps) => {
  const router = useRouter();

  const [currentBubble, setCurrentBubble] = React.useState(0);

  React.useEffect(() => {
    if (router.isReady) {
      const {bubble = '1'} = router.query;
      const bubbleNum = parseInt(Array.isArray(bubble) ? bubble[0] : bubble, 10);
      setCurrentBubble(bubbleNum - 1);
    }
  }, [router.isReady, router.query]);

  React.useEffect(() => {
    const onClick = (evt: MouseEvent) => {
      const dblClicked = evt.detail >= 2;
      if (dblClicked) {
        setCurrentBubble(current =>
          current === AVAILABLE_BUBBLES.length - 1 ? 0 : current + 1,
        );
      }
    };
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
    };
  }, []);

  switch (currentBubble) {
    case 0:
      return <Bubble1 {...props}>{children}</Bubble1>;
    case 1:
      return <Bubble2 {...props}>{children}</Bubble2>;
    case 2:
      return <Bubble3 {...props}>{children}</Bubble3>;
  }
};
