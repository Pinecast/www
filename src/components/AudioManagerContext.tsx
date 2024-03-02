import * as React from 'react';
import {useStorage} from '@/hooks/useStorage';
import {SoundEffectsApi, useSoundEffects} from '@/hooks/useSoundEffects';

type AudioManagerSettings = {
  muted: boolean;
};

type AudioManagerApi = {
  loading: boolean;
  soundEffects: SoundEffectsApi;
  setMuted: (value: boolean) => void;
  toggleMuted: () => void;
};

export type AudioManager = AudioManagerSettings & AudioManagerApi;

const DEFAULT_AUDIO_SETTINGS = {
  muted: true,
};

export const Context = React.createContext<AudioManager>({
  ...DEFAULT_AUDIO_SETTINGS,
  loading: true,
  soundEffects: {
    sounds: [],
    play: () => {},
  },
  setMuted: () => {},
  toggleMuted: () => {},
});

type AudioManagerProviderProps = {
  soundEffects?: SoundEffectsApi;
  children: React.ReactNode;
};

export function AudioManagerProvider({children}: AudioManagerProviderProps) {
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

  const {muted} = settings;

  const soundEffects = useSoundEffects({muted});

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

  // Enforce global mute on all sound effects.
  React.useEffect(() => {
    soundEffects.sounds.forEach(sound => {
      sound.muted = muted;
    });
  }, [muted, soundEffects.sounds]);

  // Since the API is an object, when the parent re-renders, this
  // provider will re-render every consumer unless memoized.
  const api: AudioManager = React.useMemo(
    () => ({
      loading,
      soundEffects: {
        sounds: soundEffects.sounds,
        play: soundEffects.play,
      },
      muted,
      setMuted,
      toggleMuted,
    }),
    [
      loading,
      soundEffects.sounds,
      soundEffects.play,
      muted,
      setMuted,
      toggleMuted,
    ],
  );

  return <Context.Provider value={api}>{children}</Context.Provider>;
}
