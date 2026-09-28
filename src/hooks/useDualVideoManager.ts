import {clear, time} from 'console';
import {on} from 'events';
import * as React from 'react';
import {isMotionPaused, useMotion} from './useMotion';

export const useDualVideoManager = (
  drawable1: [HTMLVideoElement, boolean],
  drawable2: [HTMLVideoElement, boolean],
  segmentStart: number,
  segmentEnd: number,
  firstSegmentStart: number,
): React.RefObject<[HTMLVideoElement, boolean]> => {
  // While the "Pause animations" toggle is on, the active video stops on the
  // frame it shows, and a change of segment only seeks to its start.
  const {paused} = useMotion();
  const activeVideoIndex = React.useRef(0);
  const activeVideo = React.useRef<[HTMLVideoElement, boolean]>(drawable1);
  const state = React.useRef({
    firstSegmentStart,
    currentStart: segmentStart,
    currentEnd: segmentEnd,
    running: false,
  });

  const timeUpdateTimer = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // The videos can load after the first render (the globe waits until the
  // animations play). Point the active video at the loaded one.
  React.useEffect(() => {
    activeVideo.current =
      activeVideoIndex.current === 0 ? drawable1 : drawable2;
  }, [drawable1, drawable2]);

  const onTimeUpdate = React.useCallback(() => {
    if (isMotionPaused()) {
      return;
    }
    const [activeDrawableVideo] =
      activeVideoIndex.current === 0 ? drawable1 : drawable2;
    const [secondaryDrawableVideo] =
      activeVideoIndex.current === 0 ? drawable2 : drawable1;

    const {currentStart, currentEnd} = state.current;
    if (activeDrawableVideo.currentTime < currentEnd) {
      console.log('Video update scheduled too soon; rescheduling');
      timeUpdateTimer.current = setTimeout(
        onTimeUpdate,
        (currentEnd - activeDrawableVideo.currentTime) * 1000,
      );
      return;
    }
    console.log(
      `Active video at ${activeDrawableVideo.currentTime} swapping to secondary at ${currentStart}`,
    );

    // Set the secondary video to play
    if (secondaryDrawableVideo.currentTime !== currentStart) {
      secondaryDrawableVideo.currentTime = currentStart;
    }
    const playPromise = secondaryDrawableVideo.play();
    playPromise?.catch?.((err: DOMException) => {
      if (err.name === 'NotAllowedError') {
        console.warn('[DualVideo] Secondary autoplay blocked:', err.message);
      } else if (err.name !== 'AbortError') {
        console.warn('[DualVideo] Secondary playback error:', err);
      }
    });

    // Set the active video to the reset point
    activeDrawableVideo.pause();
    activeDrawableVideo.currentTime = currentStart;
    // Swap the active and secondary videos
    activeVideoIndex.current = activeVideoIndex.current === 0 ? 1 : 0;
    activeVideo.current =
      activeVideoIndex.current === 0 ? drawable1 : drawable2;
  }, [drawable1, drawable2]);

  React.useEffect(() => {
    if (!drawable1[0] || !drawable2[0]) {
      return;
    }
    // When the start segment changes, update the secondary video so we're ready to play it
    if (segmentStart !== state.current.currentStart) {
      console.log(
        `Updating video segment start from ${state.current.currentStart} to ${segmentStart}`,
      );
      const [secondaryDrawableVideo] =
        activeVideoIndex.current === 0 ? drawable2 : drawable1;
      secondaryDrawableVideo.currentTime = segmentStart;
    }
    // Store the new state
    const oldEnd = state.current.currentEnd;
    const oldStart = state.current.currentStart;
    state.current.currentStart = segmentStart;
    state.current.currentEnd = segmentEnd;
    if (isMotionPaused()) {
      if (activeVideo.current[0] && oldStart !== segmentStart) {
        activeVideo.current[0].currentTime = segmentStart;
      }
      return;
    }
    // If we rewound, trigger a video update immediately so we don't wait
    if (activeVideo.current[0]?.currentTime > segmentEnd) {
      console.log('Video rewind detected; resetting');
      clearTimeout(timeUpdateTimer.current!);
      onTimeUpdate();
    } else if (activeVideo.current[0] && oldEnd < segmentStart) {
      // If we jumped forward, there's going to be a gap after the current segment range
      // ends. Immediately jump to the end of the current segment so we can start playing
      // the transition, leading into the next segment.
      console.log('Video jump forward detected; resetting');
      activeVideo.current[0].currentTime = oldEnd;
      clearTimeout(timeUpdateTimer.current!);
      timeUpdateTimer.current = setTimeout(
        onTimeUpdate,
        (segmentEnd - oldEnd) * 1000,
      );
    }
  }, [segmentStart, segmentEnd, drawable1, drawable2, onTimeUpdate]);

  React.useEffect(() => {
    const [video] = drawable1;
    if (!video) {
      return;
    }

    const onPause = () => {
      if (activeVideoIndex.current !== 0) {
        return;
      }
      console.log('Video paused');
      clearTimeout(timeUpdateTimer.current!);
    };
    const onResume = () => {
      const {currentEnd} = state.current;
      const now = video.currentTime;
      clearTimeout(timeUpdateTimer.current!);
      console.log(`Scheduling video 1 update in ${currentEnd - now} seconds`);
      timeUpdateTimer.current = setTimeout(
        onTimeUpdate,
        (currentEnd - now) * 1000,
      );
    };

    const onCanPlayThrough = () => {
      const {firstSegmentStart, currentStart, currentEnd, running} =
        state.current;
      if (!running) {
        const now = drawable1[0].currentTime;
        if (firstSegmentStart < currentStart) {
          drawable1[0].currentTime = currentStart;
          drawable2[0].currentTime = currentStart;
        }
        state.current.running = true;
        if (isMotionPaused()) {
          // The effect below plays it when the toggle turns off.
          return;
        }
        const playPromise = drawable1[0].play();
        playPromise?.catch?.((err: DOMException) => {
          if (err.name === 'NotAllowedError') {
            console.warn('[DualVideo] Initial autoplay blocked:', err.message);
          } else if (err.name !== 'AbortError') {
            console.warn('[DualVideo] Initial playback error:', err);
          }
        });
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
  }, [drawable1, drawable2, onTimeUpdate]);

  React.useEffect(() => {
    const [video] = drawable2;
    if (!video) {
      return;
    }

    const onPause = () => {
      if (activeVideoIndex.current !== 1) {
        return;
      }
      console.log('Video paused');
      clearTimeout(timeUpdateTimer.current!);
    };
    const onResume = () => {
      const {currentEnd} = state.current;
      const now = video.currentTime;
      clearTimeout(timeUpdateTimer.current!);
      console.log(`Scheduling video 0 update in ${currentEnd - now} seconds`);
      timeUpdateTimer.current = setTimeout(
        onTimeUpdate,
        (currentEnd - now) * 1000,
      );
    };

    video.addEventListener('pause', onPause);
    video.addEventListener('play', onResume);
    return () => {
      video.removeEventListener('pause', onPause);
      video.removeEventListener('play', onResume);
    };
  }, [drawable1, drawable2, onTimeUpdate]);

  React.useEffect(() => {
    const [video] = activeVideo.current;
    if (isMotionPaused()) {
      clearTimeout(timeUpdateTimer.current!);
      // Both, in case a swap has just started the other one.
      drawable1[0]?.pause();
      drawable2[0]?.pause();
    } else if (video && state.current.running) {
      // Its `play` event schedules the next swap.
      video.play()?.catch?.((err: DOMException) => {
        if (err.name !== 'AbortError') {
          console.warn('[DualVideo] Playback error:', err);
        }
      });
    }
  }, [paused, drawable1, drawable2]);

  return activeVideo;
};

// const state = React.useRef({
//   firstSegmentStart,
//   currentStart: segmentStart,
//   currentEnd: segmentEnd,
//   running: false,
// });
// state.current.currentStart = segmentStart;
// state.current.currentEnd = segmentEnd;

// const timeUpdateTimer = React.useRef<NodeJS.Timeout | undefined>(undefined);
// const onTimeUpdate = React.useCallback(() => {
//   const [video] = drawable;
//   const {currentStart, currentEnd} = state.current;
//   if (video.currentTime < currentEnd) {
//     timeUpdateTimer.current = setTimeout(
//       onTimeUpdate,
//       (currentEnd - video.currentTime) * 1000,
//     );
//     return;
//   }
//   console.log(
//     `Resetting video time from ${video.currentTime} to ${currentStart}`,
//   );
//   video.currentTime = currentStart;
//   // video.fastSeek(currentStart);
//   timeUpdateTimer.current = setTimeout(
//     onTimeUpdate,
//     (currentEnd - currentStart) * 1000,
//   );
// }, [drawable]);

// const triggerVideoUpdate = React.useCallback(() => {
//   const {firstSegmentStart, currentStart, currentEnd, running} =
//     state.current;
//   if (!running) {
//     const now = drawable[0].currentTime;
//     if (firstSegmentStart < currentStart) {
//       drawable[0].currentTime = currentStart;
//     }
//     drawable[0].play();
//     state.current.running = true;
//     console.log(`Scheduling video update in ${currentEnd - now} seconds`);
//     timeUpdateTimer.current = setTimeout(
//       onTimeUpdate,
//       (currentEnd - now) * 1000,
//     );
//     return;
//   }
// }, [drawable, onTimeUpdate]);

// React.useEffect(() => {
//   const video = drawable1[0];
//   if (!video) {
//     return;
//   }

//   const onPause = () => {
//     console.log('Video paused');
//     clearTimeout(timeUpdateTimer.current!);
//   };
//   const onResume = () => {
//     const {currentEnd} = state.current;
//     const now = video.currentTime;
//     clearTimeout(timeUpdateTimer.current!);
//     console.log(
//       `Video resumed, scheduling video update in ${currentEnd - now} seconds`,
//     );
//     timeUpdateTimer.current = setTimeout(
//       onTimeUpdate,
//       (currentEnd - now) * 1000,
//     );
//   };

//   const onCanPlayThrough = () => {
//     triggerVideoUpdate();
//   };
//   if (video.readyState === 4) {
//     onCanPlayThrough();
//   }
//   video.addEventListener('canplaythrough', onCanPlayThrough);
//   video.addEventListener('pause', onPause);
//   video.addEventListener('play', onResume);
//   return () => {
//     video.removeEventListener('canplaythrough', onCanPlayThrough);
//     video.removeEventListener('pause', onPause);
//     video.removeEventListener('play', onResume);
//   };
// }, [drawable, triggerVideoUpdate, onTimeUpdate]);
