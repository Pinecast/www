import Lottie from 'lottie-react';
import * as React from 'react';
import * as splash from '@/animations/splash.json';
import {useCSS} from '@/hooks/useCSS';

export const SplashIntro = ({onComplete}: {onComplete: () => void}) => {
  const css = useCSS();
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
