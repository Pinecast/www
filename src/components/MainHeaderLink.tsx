import {BUTTON_RESET, CAN_HOVER_MEDIA_QUERY} from '@/constants';
import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import Link from 'next/link';
import {ReactNode} from 'react';
import {StyleObject} from 'styletron-react';

const HEADER_LINK_STYLE: StyleObject = {
  ...MonumentGroteskBold,
  borderRadius: '18px',
  color: 'var(--color-primary-dark)',
  padding: '27px 20px',
  textDecoration: 'none',
  textUnderlineOffset: '0.2em',
  ':hover': {
    [CAN_HOVER_MEDIA_QUERY]: {
      textDecoration: 'underline',
    },
  },
};

export const MainHeaderLink = ({
  children,
  href,
  onClick,
}: {
  children: ReactNode;
  href: string;
  onClick?: (evt: React.MouseEvent) => void;
}) => {
  const css = useCSS();
  return (
    <Link className={css(HEADER_LINK_STYLE)} href={href} onClick={onClick}>
      {children}
    </Link>
  );
};

// Looks the same as MainHeaderLink, for a header item that opens something on
// this page instead of going to another page.
export const MainHeaderButton = ({
  children,
  onClick,
  ...rest
}: {
  children: ReactNode;
  onClick: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  'aria-controls'?: string;
  'aria-expanded'?: boolean;
}) => {
  const css = useCSS();
  return (
    <button
      {...rest}
      type="button"
      className={css({...BUTTON_RESET, ...HEADER_LINK_STYLE})}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
