import * as React from 'react';
import {SoundEffectsApi, useSoundEffects} from '@/hooks/useSoundEffects';
import {useMatchMedia} from '@/hooks/useMatchMedia';
import {useSyncTabStore} from '@/hooks/useSyncTabStore';
import {MIN_TABLET_MEDIA_QUERY} from '@/constants';

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
  const [settings, setSettings] = useSyncTabStore<AudioManagerSettings>(
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
  const canMute = useMatchMedia(MIN_TABLET_MEDIA_QUERY);

  const {muted} = settings;

  // On mobile, there is no nav button to (un)mute. Use `muted`
  // as the global setting (e.g., for playing Testimonials),
  // whilst muting the sound effects.
  const soundsMuted = React.useMemo(
    () => (canMute ? muted : true),
    [canMute, muted],
  );

  const soundEffects = useSoundEffects({muted: soundsMuted});

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
      sound.muted = soundsMuted;
    });
  }, [soundsMuted, soundEffects.sounds]);

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
