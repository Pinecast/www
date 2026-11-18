import {CAN_HOVER_MEDIA_QUERY} from '@/constants';
import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import Link from '@/components/SiteLink';
import {AnchorHTMLAttributes, ReactNode} from 'react';

// What a link may say besides its address: the language links say the
// language of their name and of the page they open, and which is the page's.
type LinkAttributes = Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'lang' | 'hrefLang' | 'aria-current' | 'onClick'
>;

export const FooterNavLinks = ({
  title,
  links,
}: {
  title: ReactNode;
  links: Array<[href: string, title: ReactNode, attributes?: LinkAttributes]>;
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
      {/* The footer isn't part of the page's last section, so its column
          titles are top-level sections too. */}
      <h2
        className={css({
          fontSize: 'inherit',
          margin: 0,
          fontWeight: 500,
          whiteSpace: 'nowrap',
        })}
      >
        {title}
      </h2>
      <ul
        className={css({
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        {links.map(([href, title, attributes]) => (
          <li key={href}>
            <Link
              {...attributes}
              href={href}
              className={css({
                color: 'var(--color-core-accent)',
                // Fill the row, as the link did when it was the flex item.
                display: 'block',
                textDecoration: 'none',
                // The link to the page itself, as the language of the page in
                // the language links: white and underlined, not only white.
                ...(attributes?.['aria-current'] && {
                  color: 'var(--color-primary-dark)',
                  textDecoration: 'underline',
                }),
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
