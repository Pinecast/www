import Lottie from 'lottie-react';
import * as splash from '@/animations/splash.json';

export const SplashIntro = ({onComplete}: {onComplete: () => void}) => {
  return (
    <Lottie
      animationData={splash}
      loop={false}
      onComplete={onComplete}
      aria-hidden="true"
      className="splash-wrapper"
      rendererSettings={{preserveAspectRatio: 'xMidYMid slice'}}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: 110,
      }}
    />
  );
};
