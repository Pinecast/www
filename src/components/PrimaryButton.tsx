import {MOBILE_MEDIA_QUERY} from '@/constants';
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
        display: 'inline-flex',
        fontSize: '16px',
        height: '40px',
        justifyContent: 'center',
        lineHeight: '40px',
        minWidth: '120px',
        paddingLeft: '30px',
        paddingRight: '30px',
        textAlign: 'center',
        textDecoration: 'none',
        ...style,
        [MOBILE_MEDIA_QUERY]: {
          ...(style?.[MOBILE_MEDIA_QUERY] as any),
          paddingLeft: '20px',
          paddingRight: '20px',
        },
      })}
      href={href}
    >
      {children}
    </Link>
  );
};
