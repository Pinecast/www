import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import Link from 'next/link';
import {ReactNode} from 'react';

export const MainHeaderLink = ({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) => {
  const css = useCSS();
  return (
    <Link
      className={css({
        ...MonumentGroteskBold,
        color: 'var(--color-primary-dark)',
        textDecoration: 'none',
        ':hover': {
          textDecoration: 'underline',
        },
      })}
      href={href}
    >
      {children}
    </Link>
  );
};
