import * as React from 'react';
import {AudioManager, Context} from '@/components/AudioManagerContext';
import {useAsyncAudio, AudioMimeType} from './useAsyncResource';

const {MP3} = AudioMimeType;
const SHOULD_LOAD = true;

type AudioControls = {
  play: () => Promise<void> | void;
  pause: () => void;
  mute: () => void;
  unmute: () => void;
};

export const useAudioControls = (
  sound: [HTMLAudioElement, boolean],
): AudioControls => {
  const {muted: globalMuted} = useAudioManager();
  const activeAudio = React.useRef<[HTMLAudioElement, boolean]>(sound);
  // Some browsers return `Promise` on `.play()` and may throw errors
  // if one tries to execute another `.play()` or `.pause()` while that
  // promise is resolving. So we prevent that with this lock.
  // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
  const lockPlayRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (!activeAudio.current?.length) {
      return;
    }
    activeAudio.current[0].muted = globalMuted;
  }, [globalMuted]);

  const controls: AudioControls = {
    play: () => {
      const [audio, loaded] = activeAudio.current;
      const playLock = lockPlayRef.current;
      if (!audio || playLock) {
        return;
      }
      audio.currentTime = 0;
      audio.muted = globalMuted;
      if (!loaded) {
        audio.load();
      }
      const promise = audio.play();
      const isPromise = typeof promise === 'object';
      if (!isPromise) {
        return promise;
      }
      lockPlayRef.current = true;
      const resetLock = () => {
        lockPlayRef.current = false;
      };
      promise.then(resetLock, resetLock);
    },
    pause: () => {
      const audio = activeAudio.current[0];
      const playLock = lockPlayRef.current;
      if (!audio || !playLock) {
        return;
      }
      audio.pause();
    },
    mute: () => {
      const audio = activeAudio.current[0];
      const playLock = lockPlayRef.current;
      if (!audio || !playLock) {
        return;
      }
      audio.muted = true;
    },
    unmute: () => {
      const audio = activeAudio.current[0];
      const playLock = lockPlayRef.current;
      if (!audio || !playLock) {
        return;
      }
      audio.muted = false;
    },
  };

  return controls;
};

// For layerable (background) sound effects that can play whilst a foreground sound plays.
export const useSoundEffectManager = () => {
  const clickDropAudio = useAsyncAudio(
    {[MP3]: '/sounds/click-drop.mp3'},
    SHOULD_LOAD,
  );

  const clickDrop = useAudioControls(clickDropAudio);

  return {
    play: (slug: string) => {
      switch (slug) {
        case 'clickDrop':
          return clickDrop.play();
      }
    },
  };
};

export const useAudioManager = <T extends AudioManager>() => {
  const context = React.useContext(Context);
  return context as T;
};
