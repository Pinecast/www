import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import Link from 'next/link';
import {ReactNode} from 'react';
import {StyleObject} from 'styletron-react';

export const PrimaryButton = ({
  href,
  children,
  style,
}: {
  href: string;
  children: ReactNode;
  style?: StyleObject;
}) => {
  const css = useCSS();
  return (
    <Link
      className={css({
        ...MonumentGroteskBold,
        backgroundColor: 'var(--color-primary-dark)',
        borderRadius: '10px',
        color: 'var(--color-primary-light)',
        fontSize: '16px',
        height: '40px',
        lineHeight: '40px',
        minWidth: '120px',
        textAlign: 'center',
        textDecoration: 'none',
        ...style,
      })}
      href={href}
    >
      {children}
    </Link>
  );
};
