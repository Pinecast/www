import {useCSS} from '@/hooks/useCSS';
import {PrimaryButton} from './PrimaryButton';
import {SecondaryButton} from './SecondaryButton';
import {MOBILE_MEDIA_QUERY} from '@/constants';
import Link from 'next/link';
import {SignIn} from '@/icons/SignIn';
import {MainHeaderLink} from './MainHeaderLink';
import {Hamburger} from '@/icons/Hamburger';

export const MainHeader = () => {
  const css = useCSS();

  return (
    <header
      className={css({
        background: 'var(--color-primary-light)',
        display: 'flex',
        border: '1px solid var(--color-line)',
        borderRadius: '20px',
        height: '80px',
        justifyContent: 'space-between',
        padding: '20px',
        transition: 'background-color 0.2s, border-color 0.2s',

        position: 'fixed',
        top: '20px',
        left: '20px',
        right: '20px',
        zIndex: 95,

        [MOBILE_MEDIA_QUERY]: {
          height: '60px',
          top: '10px',
          left: '10px',
          right: '10px',
        },
      })}
    >
      <div
        className={css({
          display: 'none',
          alignItems: 'center',
          [MOBILE_MEDIA_QUERY]: {display: 'flex'},
        })}
      >
        <Hamburger size={24} color="var(--color-primary-dark)" />
      </div>
      <div
        className={css({
          display: 'flex',
          gap: '0 1px',
          alignItems: 'center',
          marginLeft: '-15px',
          [MOBILE_MEDIA_QUERY]: {display: 'none'},
        })}
      >
        <MainHeaderLink href="/features">Features</MainHeaderLink>
        <MainHeaderLink href="/learn">Learn</MainHeaderLink>
      </div>
      <div
        className={css({
          display: 'flex',
          gap: '20px',
          [MOBILE_MEDIA_QUERY]: {display: 'none'},
        })}
      >
        <SecondaryButton href="https://pinecast.com/login">
          Sign in
        </SecondaryButton>
        <PrimaryButton href="https://pinecast.com/signup">
          Sign up
        </PrimaryButton>
      </div>
      <div
        className={css({
          alignItems: 'center',
          display: 'none',
          [MOBILE_MEDIA_QUERY]: {display: 'flex'},
        })}
      >
        <Link
          href="https://pinecast.com/login"
          style={{display: 'block', height: '24px'}}
        >
          <SignIn size={24} color="var(--color-primary-dark)" />
        </Link>
      </div>
    </header>
  );
};
