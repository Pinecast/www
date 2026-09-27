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
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        {links.map(([href, title]) => (
          <li key={href}>
            <Link
              href={href}
              className={css({
                color: 'var(--color-core-accent)',
                // Fill the row, as the link did when it was the flex item.
                display: 'block',
                textDecoration: 'none',
                transition: 'color 0.2s',
                textUnderlineOffset: '0.2em',
                ':hover': {
                  [CAN_HOVER_MEDIA_QUERY]: {
                    color: '#fff',
                    textDecoration: 'underline',
                  },
                },
              })}
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
