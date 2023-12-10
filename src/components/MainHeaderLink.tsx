import {CAN_HOVER_MEDIA_QUERY} from '@/constants';
import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import Link from 'next/link';
import {ReactNode} from 'react';

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
    <Link
      className={css({
        ...MonumentGroteskBold,
        borderRadius: '14px',
        color: 'var(--color-primary-dark)',
        padding: '24px 15px',
        textDecoration: 'none',
        textUnderlineOffset: '0.2em',
        ':hover': {
          [CAN_HOVER_MEDIA_QUERY]: {
            textDecoration: 'underline',
          },
        },
      })}
      href={href}
      onClick={
        onClick
          ? (evt: React.MouseEvent) => {
              evt.preventDefault();
              onClick(evt);
            }
          : undefined
      }
    >
      {children}
    </Link>
  );
};
