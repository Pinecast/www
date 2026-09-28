import * as React from 'react';
import dynamic from 'next/dynamic';

import {TABLET_MEDIA_QUERY} from '@/constants';
import {Logo} from '@/icons/Logo';
import * as logoLoad from '@/animations/logo-load.json';
import * as logoLoadDark from '@/animations/logo-load-dark.json';
import Link from 'next/link';
import {useCSS} from '@/hooks/useCSS';
import {useAudioManager} from '@/hooks/useAudioManager';
import {SoundEffect} from '@/hooks/useSoundEffects';
import {aboveOverlayProps} from '@/hooks/useInertOutside';
import {useMotion} from '@/hooks/useMotion';

const Lottie = dynamic(() => import('lottie-react'), {ssr: false});

const baseStyles: any = {
  position: 'fixed',
  top: '35px',
  left: 0,
  right: 0,
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '50px',
  height: '50px',
  zIndex: 150,
  [TABLET_MEDIA_QUERY]: {
    height: '40px',
    width: '40px',
    top: '20px',
  },
};

export const MainLogo = ({
  autoplayAnimation = true,
  startDark = false,
}: {
  autoplayAnimation?: boolean;
  startDark?: boolean;
}) => {
  const css = useCSS();
  const [animated, setAnimated] = React.useState(false);
  const {
    soundEffects: {play: playSoundEffect},
  } = useAudioManager();
  const onCompleteAnimation = React.useCallback(() => {
    setAnimated(true);
  }, []);
  // With reduced motion, or while the animations are paused, show the logo as
  // it is at the end of the animation.
  const {paused, reducedMotion} = useMotion();
  const playAnimation = autoplayAnimation && !paused && !reducedMotion;
  const showLogo = animated || (autoplayAnimation && !playAnimation);
  return (
    <Link
      href="/"
      aria-label="Return home"
      // The logo shows above the dim overlay of the open header menu.
      {...aboveOverlayProps}
      className={css({
        ':not(:active) svg': {
          transform: 'scale(1, 1)',
          transition: 'transform 0.2s',
        },
        ':active svg': {transform: 'scale(0.9, 0.9)'},
      })}
      onClick={() => playSoundEffect(SoundEffect.LOGO_ROLLOVER_1)}
    >
      {playAnimation && !animated && (
        <Lottie
          animationData={startDark ? logoLoadDark : logoLoad}
          className={css({
            ...baseStyles,
            visibility: !animated ? 'visible' : 'hidden',
          })}
          loop={false}
          aria-hidden="true"
          onComplete={onCompleteAnimation}
        />
      )}
      <Logo
        size={50}
        color="var(--color-primary-dark)"
        style={{
          ...baseStyles,
          visibility: showLogo ? 'visible' : 'hidden',
        }}
      />
    </Link>
  );
};
