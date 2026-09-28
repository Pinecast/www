import * as React from 'react';
import dynamic from 'next/dynamic';
import * as splash from '@/animations/splash.json';
import {useCSS} from '@/hooks/useCSS';
import {useMotion} from '@/hooks/useMotion';

const Lottie = dynamic(() => import('lottie-react'), {ssr: false});

export const SplashIntro = ({onComplete}: {onComplete: () => void}) => {
  const css = useCSS();
  // With reduced motion, or while the animations are paused, skip the intro.
  const {paused, reducedMotion} = useMotion();
  const skip = paused || reducedMotion;
  React.useEffect(() => {
    if (skip) {
      onComplete();
    }
  }, [onComplete, skip]);
  if (skip) {
    return null;
  }
  return (
    <div
      className={css({
        backgroundColor: '#000',
        position: 'fixed',
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        zIndex: 160,
      })}
    >
      <Lottie
        animationData={splash}
        loop={false}
        onComplete={onComplete}
        aria-hidden="true"
        className="splash-wrapper"
        rendererSettings={{preserveAspectRatio: 'xMidYMid slice'}}
        style={{
          position: 'absolute',
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        }}
      />
    </div>
  );
};
