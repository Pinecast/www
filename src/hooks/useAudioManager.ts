import * as React from 'react';
import {AudioManager, Context} from '@/components/AudioManagerContext';

export const useAudioManager = <T extends AudioManager>() => {
  const context = React.useContext(Context);
  if (typeof context === 'undefined') {
    throw new Error(
      'useAudioManager must be used within a AudioManagerProvider',
    );
  }
  return context as T;
};
