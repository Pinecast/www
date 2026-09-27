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
