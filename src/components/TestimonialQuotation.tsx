import * as React from 'react';
import {useCSS} from '@/hooks/useCSS';

export type Script = {
  text: string;
  words: Array<{text: string; start: number; end: number}>;
};

export const TestimonialQuotation = ({
  script,
  audio,
  quotation,
  quotationStartIdx,
}: {
  script: Script;
  audio: React.RefObject<HTMLAudioElement>;
  quotation: string;
  quotationStartIdx: number;
}) => {
  const css = useCSS();
  const [quoteWordIdx, setQuoteWordIdx] = React.useState(-1);
  const length = quotation.split(' ').length;
  React.useEffect(() => {
    const audioEl = audio.current!;
    const timeUpdate = () => {
      const currentTime = audioEl.currentTime * 1000;
      const word = script.words.findIndex(
        word => word.start <= currentTime && currentTime <= word.end,
      );
      if (word === -1) return;
      setQuoteWordIdx(word);
    };
    const interval = setInterval(timeUpdate, 100);
    return () => {
      clearInterval(interval);
    };
  }, [audio, script]);
  return (
    <>
      {script.words.map((word, i) => {
        if (i < quotationStartIdx || i >= length + quotationStartIdx)
          return null;
        return (
          <span
            key={i}
            className={css({
              color:
                quoteWordIdx >= i
                  ? 'var(--color-lime)'
                  : 'var(--color-core-accent)',
            })}
          >
            {word.text.replace(/'/g, '’') + ' '}
          </span>
        );
      })}
    </>
  );
};
