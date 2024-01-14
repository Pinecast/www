import * as React from 'react';

export const useVideoManager = (
  drawable: [HTMLVideoElement, boolean],
  segmentStart: number,
  segmentEnd: number,
  firstSegmentStart: number,
) => {
  const state = React.useRef({
    firstSegmentStart,
    currentStart: segmentStart,
    currentEnd: segmentEnd,
    running: false,
  });
  state.current.currentStart = segmentStart;
  state.current.currentEnd = segmentEnd;

  const timeUpdateTimer = React.useRef<NodeJS.Timeout>();
  const onTimeUpdate = React.useCallback(() => {
    const [video] = drawable;
    const {currentStart, currentEnd} = state.current;
    if (video.currentTime < currentEnd) {
      timeUpdateTimer.current = setTimeout(
        onTimeUpdate,
        (currentEnd - video.currentTime) * 1000,
      );
      return;
    }
    console.log(
      `Resetting video time from ${video.currentTime} to ${currentStart}`,
    );
    video.currentTime = currentStart;
    // video.fastSeek(currentStart);
    timeUpdateTimer.current = setTimeout(
      onTimeUpdate,
      (currentEnd - currentStart) * 1000,
    );
  }, [drawable]);

  React.useEffect(() => {
    const video = drawable[0];
    if (!video) {
      return;
    }

    const onPause = () => {
      console.log('Video paused');
      clearTimeout(timeUpdateTimer.current!);
    };
    const onResume = () => {
      const {currentEnd} = state.current;
      const now = video.currentTime;
      clearTimeout(timeUpdateTimer.current!);
      console.log(
        `Video resumed, scheduling video update in ${currentEnd - now} seconds`,
      );
      timeUpdateTimer.current = setTimeout(
        onTimeUpdate,
        (currentEnd - now) * 1000,
      );
    };

    const onCanPlayThrough = () => {
      const {firstSegmentStart, currentStart, currentEnd, running} =
        state.current;
      if (!running) {
        const now = drawable[0].currentTime;
        if (firstSegmentStart < currentStart) {
          drawable[0].currentTime = currentStart;
        }
        drawable[0].play();
        state.current.running = true;
        console.log(`Scheduling video update in ${currentEnd - now} seconds`);
        timeUpdateTimer.current = setTimeout(
          onTimeUpdate,
          (currentEnd - now) * 1000,
        );
        return;
      }
    };
    if (video.readyState === 4) {
      onCanPlayThrough();
    }
    video.addEventListener('canplaythrough', onCanPlayThrough);
    video.addEventListener('pause', onPause);
    video.addEventListener('play', onResume);
    return () => {
      video.removeEventListener('canplaythrough', onCanPlayThrough);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('play', onResume);
    };
  }, [drawable, onTimeUpdate]);
};
