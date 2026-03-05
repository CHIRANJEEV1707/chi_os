'use client';

import { useSoundStore } from '@/store/soundStore';
import { playSound } from '@/lib/sounds';
import type { SoundName } from '@/lib/sounds';

export const useSoundEffect = () => {
  const { isSoundEnabled } = useSoundStore();

  const play = (name: SoundName) => {
    if (isSoundEnabled) {
      playSound(name);
    }
  };

  return { play };
};
