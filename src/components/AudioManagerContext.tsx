import * as React from 'react';
import {useStorage} from '@/hooks/useStorage';
import {SoundEffect} from '@/hooks/useAudioManager';

export type SoundEffectSource = [SoundEffect, HTMLAudioElement, boolean];

type AudioManagerSettings = {
  muted: boolean;
};

type AudioManagerApi = {
  loading: boolean;
  soundEffects?: SoundEffectSource[];
  setMuted: (value: boolean) => void;
  toggleMuted: () => void;
  playSoundEffect: (src: SoundEffect) => Promise<void> | void;
};

export type AudioManager = AudioManagerSettings & AudioManagerApi;

const DEFAULT_AUDIO_SETTINGS = {
  muted: true,
};

export const Context = React.createContext<AudioManager>({
  ...DEFAULT_AUDIO_SETTINGS,
  loading: true,
  soundEffects: [],
  setMuted: () => {},
  toggleMuted: () => {},
  playSoundEffect: () => {},
});

type AudioManagerProviderProps = {
  soundEffects?: SoundEffectSource[];
  children: React.ReactNode;
};

export function AudioManagerProvider({
  soundEffects = [],
  children,
}: AudioManagerProviderProps) {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [settings, setSettings] = useStorage<AudioManagerSettings>(
    'audioManagerSettings',
    DEFAULT_AUDIO_SETTINGS,
    handleBroadcastMessage,
  );
  function handleBroadcastMessage(data: AudioManagerSettings) {
    // Mute background tabs when this current tab becomes unmuted.
    if (!data.muted) {
      setMuted(true);
    }
  }

  // Some browsers return `Promise` on `.play()` and may throw errors
  // if one tries to execute another `.play()` or `.pause()` while that
  // promise is resolving. So we prevent that with this lock.
  // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
  const playLockMapRef = React.useRef(new Map<HTMLAudioElement, boolean>());

  const soundEffectsMap = React.useMemo(() => {
    const map = new Map<SoundEffect, [HTMLAudioElement | null, boolean]>(null);
    soundEffects.map?.(([src, audioEl, loaded]) =>
      map.set(src, [audioEl, loaded]),
    );
    return map;
  }, [soundEffects]);

  const {muted} = settings;

  React.useEffect(() => {
    setLoading(false);
  }, [settings]);

  const updateSetting = React.useCallback(
    <K extends keyof AudioManagerSettings>(
      setting: K,
      value: AudioManagerSettings[K],
    ) => {
      setSettings(prev => ({...prev, [setting]: value}));
    },
    [setSettings],
  );
  const toggleSetting = React.useCallback(
    (setting: keyof AudioManagerSettings) => {
      setSettings(prev => ({...prev, [setting]: !prev[setting]}));
    },
    [setSettings],
  );

  const setMuted = React.useCallback(
    (value: boolean) => updateSetting('muted', value),
    [updateSetting],
  );
  const toggleMuted = React.useCallback(
    () => toggleSetting('muted'),
    [toggleSetting],
  );

  // Enforce global mute for all sound effects.
  React.useEffect(() => {
    for (const [audio] of soundEffectsMap.values()) {
      if (audio) {
        audio.muted = muted;
      }
    }
  }, [muted, soundEffectsMap]);

  const playSoundEffect = React.useCallback(
    (src: SoundEffect) => {
      const activeAudio = soundEffectsMap.get(src);
      if (!activeAudio || activeAudio[0] === null) {
        return;
      }
      const [audio, loaded] = activeAudio;
      const playLock = playLockMapRef.current.get(audio);
      if (playLock) {
        return;
      }
      audio.currentTime = 0;
      audio.muted = muted;
      if (!loaded) {
        audio.load();
      }
      const promise = audio.play();
      const isPromise = typeof promise === 'object';
      if (!isPromise) {
        return;
      }
      const lock = () => playLockMapRef.current.set(audio, true);
      const unlock = () => playLockMapRef.current.set(audio, false);
      lock();
      promise.then(unlock, unlock);
    },
    [muted, soundEffectsMap],
  );

  // Since the API is an object, when the parent re-renders, this
  // provider will re-render every consumer unless memoized.
  const api: AudioManager = React.useMemo(
    () => ({
      loading,
      soundEffects,
      muted,
      setMuted,
      toggleMuted,
      playSoundEffect,
    }),
    [loading, soundEffects, muted, setMuted, toggleMuted, playSoundEffect],
  );

  return <Context.Provider value={api}>{children}</Context.Provider>;
}
