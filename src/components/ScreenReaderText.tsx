import {MonumentGroteskBold} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import {StyleObject} from 'styletron-react';

// Hides content on screen and keeps it for screen readers.
export const VISUALLY_HIDDEN: StyleObject = {
  borderWidth: '0',
  clip: 'rect(0, 0, 0, 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: '0',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
};

// A button that shows only while it has focus, like the skip link: a white
// bubble with a dark border, on any section. Until then it is visually
// hidden, and screen readers still find it. Give it a place (it is absolute).
export const FOCUS_ONLY_BUBBLE: StyleObject = {
  ...MonumentGroteskBold,
  backgroundColor: 'var(--color-white)',
  borderColor: 'var(--color-space)',
  borderRadius: '22px',
  borderStyle: 'solid',
  borderWidth: '2px',
  boxShadow: '3px 4px 0 rgba(9, 9, 9, 0.18)',
  color: 'var(--color-space)',
  cursor: 'pointer',
  fontSize: '16px',
  lineHeight: '20px',
  padding: '10px 18px',
  position: 'absolute',
  whiteSpace: 'nowrap',
  ':not(:focus)': VISUALLY_HIDDEN,
};

export const ScreenReaderText = ({
  as: Tag = 'span',
  children,
}: {
  as?: React.ElementType;
  children: React.ReactNode;
}) => {
  const css = useCSS();
  return <Tag className={css(VISUALLY_HIDDEN)}>{children}</Tag>;
};
