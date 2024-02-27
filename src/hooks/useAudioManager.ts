import * as React from 'react';
import {AudioManager, Context} from '@/components/AudioManagerContext';

export enum SoundEffect {
  CLICK_DROP = '/sounds/click-drop.mp3',
}

export const useAudioManager = <T extends AudioManager>() => {
  const context = React.useContext(Context);
  return context as T;
};
