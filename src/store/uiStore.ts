'use client';

import { create } from 'zustand';

interface UiState {
  isGlitching: boolean;
  triggerGlitch: (duration?: number) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isGlitching: false,
  triggerGlitch: (duration = 600) => {
    set({ isGlitching: true });
    setTimeout(() => {
      set({ isGlitching: false });
    }, duration);
  },
}));
