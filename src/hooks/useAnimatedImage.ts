import * as React from 'react';

// A browser plays an animated image by itself, and no API can pause it. So,
// where the browser has ImageDecoder (WebCodecs), decode the frames and play
// them on a canvas: then a pause keeps the frame on screen, where it is.
// Elsewhere, `canPause` is false, and the caller shows the animated image while
// it plays and the still image while it is paused.

const hasImageDecoder = () =>
  typeof window !== 'undefined' && typeof window.ImageDecoder !== 'undefined';

const noSubscription = () => () => {};

export const useAnimatedImage = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  src: string,
  type: string,
  playing: boolean,
) => {
  const supported = React.useSyncExternalStore(
    noSubscription,
    hasImageDecoder,
    () => false,
  );
  const [failed, setFailed] = React.useState(false);
  const player = React.useRef<{
    decoder?: Promise<{decoder: ImageDecoder; frameCount: number}>;
    frame: number;
  }>({frame: 0});

  React.useEffect(() => {
    const canvas = canvasRef.current;
    // Decode only the image that shows (not the one for the other width).
    if (
      !playing ||
      !canvas ||
      !hasImageDecoder() ||
      !canvas.getClientRects().length
    ) {
      return;
    }
    const state = player.current;
    state.decoder ??= fetch(src)
      .then(response => response.arrayBuffer())
      .then(async data => {
        const decoder = new ImageDecoder({data, type});
        await decoder.tracks.ready;
        return {decoder, frameCount: decoder.tracks.selectedTrack!.frameCount};
      });

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const showNextFrame = async () => {
      const {decoder, frameCount} = await state.decoder!;
      if (stopped) {
        return;
      }
      const {image} = await decoder.decode({frameIndex: state.frame});
      if (stopped) {
        image.close();
        return;
      }
      if (canvas.width !== image.displayWidth) {
        canvas.width = image.displayWidth;
        canvas.height = image.displayHeight;
      }
      canvas.getContext('2d')!.drawImage(image, 0, 0);
      // The duration is in microseconds.
      const duration = (image.duration ?? 100_000) / 1000;
      image.close();
      state.frame = (state.frame + 1) % frameCount;
      timer = setTimeout(showNextFrame, duration);
    };
    showNextFrame().catch(() => {
      if (!stopped) {
        setFailed(true);
      }
    });
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [canvasRef, playing, src, type]);

  return {canPause: supported && !failed};
};
