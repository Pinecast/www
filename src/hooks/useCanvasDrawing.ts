import * as React from 'react';
import {useIntersectionVisibility} from './useIntersectionVisibility';

export const useCanvasDrawing = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  renderCallback: (ctx: CanvasRenderingContext2D) => void,
) => {
  const raf = React.useRef<number>();
  useIntersectionVisibility(
    canvasRef,
    React.useCallback(
      isIntersecting => {
        if (!isIntersecting) {
          cancelAnimationFrame(raf.current!);
          return;
        }
        const paint = () => {
          if (!canvasRef.current) return;

          const ctx = canvasRef.current.getContext('2d', {
            desynchronized: true,
          })!;
          renderCallback(ctx);
          raf.current = requestAnimationFrame(paint);
        };
        raf.current = requestAnimationFrame(paint);
      },
      [renderCallback],
    ),
    () => {
      cancelAnimationFrame(raf.current!);
    },
  );
};
