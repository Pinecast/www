import Lottie from 'lottie-react';
import * as React from 'react';

import {TABLET_MEDIA_QUERY} from '@/constants';
import {Logo} from '@/icons/Logo';
import * as logoLoad from '@/animations/logo-load.json';
import * as logoLoadDark from '@/animations/logo-load-dark.json';
import Link from 'next/link';
import {useCSS} from '@/hooks/useCSS';

const baseStyles: any = {
  position: 'fixed',
  top: '35px',
  left: 0,
  right: 0,
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '50px',
  height: '50px',
  zIndex: 140,
  [TABLET_MEDIA_QUERY]: {
    height: '40px',
    width: '40px',
    top: '20px',
  },
};

export const MainLogo = ({startDark = false}: {startDark?: boolean} = {}) => {
  const css = useCSS();
  const [animated, setAnimated] = React.useState(false);
  return (
    <Link
      href="/"
      aria-label="Return home"
      className={css({
        ':not(:active) svg': {
          transform: 'scale(1, 1)',
          transition: 'transform 0.2s',
        },
        ':active svg': {transform: 'scale(0.9, 0.9)'},
      })}
    >
      <Lottie
        animationData={startDark ? logoLoadDark : logoLoad}
        className={css({
          ...baseStyles,
          visibility: !animated ? 'visible' : 'hidden',
        })}
        loop={false}
        aria-hidden="true"
        onComplete={React.useCallback(() => {
          setAnimated(true);
        }, [])}
        height={global.document?.body.offsetWidth < 1180 ? 40 : 50}
        width={global.document?.body.offsetWidth < 1180 ? 40 : 50}
      />
      <Logo
        size={50}
        color="var(--color-primary-dark)"
        style={{
          ...baseStyles,
          visibility: animated ? 'visible' : 'hidden',
        }}
      />
    </Link>
  );
};
