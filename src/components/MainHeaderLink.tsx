import {CAN_HOVER_MEDIA_QUERY} from '@/constants';
import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import Link from 'next/link';
import {ReactNode} from 'react';
import {StyleObject} from 'styletron-react';

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
