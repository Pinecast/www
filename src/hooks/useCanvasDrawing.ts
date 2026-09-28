import * as React from 'react';
import {useIntersectionVisibility} from './useIntersectionVisibility';
import {isMotionPaused, useMotion} from './useMotion';

// Paints the canvas on each animation frame while it is on screen.
//
// While the "Pause animations" toggle is on, the loop stops and the canvas
// keeps the frame it shows. It paints again only when something else changes:
// the page scrolls or resizes, or the owner renders again. `renderCallback` can
// return true to ask for one more frame, to finish a transition that the user
// started (by a scroll, for example).
export const useCanvasDrawing = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  renderCallback: (ctx: CanvasRenderingContext2D) => boolean | void,
) => {
  const raf = React.useRef<number | undefined>(undefined);
  const visible = React.useRef(false);
  const callbackRef = React.useRef(renderCallback);
  callbackRef.current = renderCallback;
  const {paused} = useMotion();

  const paint = React.useCallback(() => {
    raf.current = undefined;
    if (!canvasRef.current || !visible.current) return;

    const ctx = canvasRef.current.getContext('2d', {
      desynchronized: true,
    })!;
    const settling = callbackRef.current(ctx);
    if (!isMotionPaused() || settling) {
      raf.current = requestAnimationFrame(paint);
    }
  }, [canvasRef]);

  const requestPaint = React.useCallback(() => {
    if (raf.current === undefined && visible.current) {
      raf.current = requestAnimationFrame(paint);
    }
  }, [paint]);

  const stop = React.useCallback(() => {
    cancelAnimationFrame(raf.current!);
    raf.current = undefined;
  }, []);

  useIntersectionVisibility(
    canvasRef,
    React.useCallback(
      isIntersecting => {
        visible.current = isIntersecting;
        if (isIntersecting) {
          requestPaint();
        } else {
          stop();
        }
      },
      [requestPaint, stop],
    ),
    stop,
  );

  // Paint with the new callback after each render. This also starts the loop
  // again when the toggle turns off.
  React.useEffect(() => {
    requestPaint();
  });

  React.useEffect(() => {
    if (!paused) {
      return;
    }
    window.addEventListener('scroll', requestPaint, {passive: true});
    window.addEventListener('resize', requestPaint);
    return () => {
      window.removeEventListener('scroll', requestPaint);
      window.removeEventListener('resize', requestPaint);
    };
  }, [paused, requestPaint]);
};
