import {CAN_HOVER_MEDIA_QUERY} from '@/constants';
import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import Link from 'next/link';
import {ReactNode} from 'react';

export const FooterNavLinks = ({
  title,
  links,
}: {
  title: ReactNode;
  links: Array<[href: string, title: string]>;
}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        ...MonumentGroteskBold,
        display: 'flex',
        flexDirection: 'column',
        lineHeight: '28px',
        maxWidth: '145px',
      })}
    >
      <h3 className={css({fontSize: 'inherit', margin: 0, fontWeight: 500, whiteSpace: 'nowrap'})}>{title}</h3>
      <ul
        className={css({
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'contents',
        })}
      >
        {links.map(([href, title]) => (
          <Link
            href={href}
            key={href}
            className={css({
              color: 'var(--color-core-accent)',
              textDecoration: 'none',
              transition: 'color 0.2s',
              textUnderlineOffset: '0.2em',
              ':hover': {
                [CAN_HOVER_MEDIA_QUERY]: {
                  color: '#fff',
                  textDecoration: 'underline',
                }
              },
            })}
          >
            {title}
          </Link>
        ))}
      </ul>
    </div>
  );
};
