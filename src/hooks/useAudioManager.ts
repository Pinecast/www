import * as React from 'react';
import {AudioManager, Context} from '@/components/AudioManagerContext';

export const useAudioManager = <T extends AudioManager>() => {
  const context = React.useContext(Context);
  return context as T;
};
