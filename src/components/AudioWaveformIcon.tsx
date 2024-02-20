import * as React from 'react';
import {KeyframesObject} from 'styletron-standard';
import {useCSS} from '@/hooks/useCSS';

const ANIMATION: KeyframesObject = {
  '10%': {transform: 'scaleY(0.3)'},
  '30%': {transform: 'scaleY(1)'},
  '60%': {transform: 'scaleY(0.5)'},
  '80%': {transform: 'scaleY(0.75)'},
  '100%': {transform: 'scaleY(0.6)'},
};

const Waveform = ({
  color = 'var(--color-primary-dark)',
  height,
  muted,
  animationDelay,
}: {
  color: string;
  height: number;
  muted: boolean;
  animationDelay?: string;
}) => {
  const css = useCSS();
  const ref = React.useRef<HTMLSpanElement>(null);
  if (muted) {
    return (
      <span
        ref={ref}
        className={css({
          backgroundColor: color,
          borderRadius: '30px',
          height: `${height}px`,
          transformOrigin: 'bottom',
          width: '2px',
        })}
      />
    );
  }
  return (
    <span
      ref={ref}
      className={css({
        animationDuration: '2.2s',
        animationFillMode: 'alternate',
        animationIterationCount: 'infinite',
        animationName: ANIMATION,
        animationDelay,
        animationTimingFunction: 'ease',
        backgroundColor: color,
        borderRadius: '30px',
        height: `${height}px`,
        transformOrigin: 'bottom',
        width: '2px',
      })}
    />
  );
};

export const AudioWaveformIcon = ({
  color = 'var(--color-primary-dark)',
  muted = false,
}: {
  color: string;
  muted: boolean;
}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        alignItems: 'flex-end',
        display: 'inline-flex',
        height: '12px',
        justifyContent: 'space-between',
        position: 'relative',
        width: '14px',
      })}
    >
      <Waveform muted={muted} color={color} height={8} />
      <Waveform
        muted={muted}
        color={color}
        height={11}
        animationDelay="-5.2s"
      />
      <Waveform muted={muted} color={color} height={7} animationDelay="-3.7s" />
      <Waveform
        muted={muted}
        color={color}
        height={12}
        animationDelay="-2.2s"
      />
    </div>
  );
};
