import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';

// The id of the <main> element on each page, which the skip link goes to.
export const MAIN_CONTENT_ID = 'main-content';

// The first focusable element on each page. It is visually hidden until it
// has keyboard focus, and then it shows above the header.
export const SkipLink = () => {
  const css = useCSS();
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className={css({
        ...MonumentGroteskBold,
        backgroundColor: 'var(--color-sand)',
        borderColor: 'var(--color-space)',
        borderRadius: '20px',
        borderStyle: 'solid',
        borderWidth: '1px',
        color: 'var(--color-space)',
        fontSize: '16px',
        left: '10px',
        lineHeight: '20px',
        padding: '19px 24px',
        position: 'fixed',
        textDecoration: 'none',
        top: '10px',
        zIndex: 200,
        ':not(:focus)': {
          borderWidth: '0',
          clipPath: 'inset(50%)',
          height: '1px',
          overflow: 'hidden',
          padding: '0',
          whiteSpace: 'nowrap',
          width: '1px',
        },
      })}
    >
      Skip to main content
    </a>
  );
};
