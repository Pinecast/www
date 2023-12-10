import {MOBILE_MEDIA_QUERY} from '@/constants';
import {Logo} from '@/icons/Logo';
import Link from 'next/link';

export const MainLogo = () => {
  return (
    <Link href="/" aria-label="Return home">
      <Logo
        size={50}
        color="var(--color-primary-dark)"
        style={{
          position: 'fixed',
          top: '35px',
          left: 0,
          right: 0,
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '50px',
          height: '50px',
          zIndex: 140,

          [MOBILE_MEDIA_QUERY]: {
            height: '40px',
            width: '40px',
            top: '20px',
          },
        }}
      />
    </Link>
  );
};
