'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SoundState {
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      isSoundEnabled: true,
      toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
    }),
    {
      name: 'chiru-os-sound',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
