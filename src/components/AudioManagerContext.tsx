import * as React from 'react';
import useStorage from '@/hooks/useStorage';

type AudioManagerSettings = {loading: boolean; muted: boolean};

type AudioManagerApi = {
  setMuted: (value: boolean) => void;
  toggleMuted: () => void;
};

export type AudioManager = AudioManagerSettings & AudioManagerApi;

const DEFAULT_AUDIO_SETTINGS = {loading: true, muted: true};

export const Context = React.createContext<AudioManager>({
  ...DEFAULT_AUDIO_SETTINGS,
  setMuted: () => {},
  toggleMuted: () => {},
});

type AudioManagerProviderProps = {children: React.ReactNode};

export function AudioManagerProvider({children}: AudioManagerProviderProps) {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [settings, setSettings] = useStorage<AudioManagerSettings>(
    'audioManagerSettings',
    DEFAULT_AUDIO_SETTINGS,
    'audioManagerChannel',
  );
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

  // Since the API is an object, when the parent re-renders, this
  // provider will re-render every consumer unless memoized.
  const api = React.useMemo(
    () => ({loading, muted, setMuted, toggleMuted}),
    [loading, muted, setMuted, toggleMuted],
  );

  return <Context.Provider value={api}>{children}</Context.Provider>;
}
