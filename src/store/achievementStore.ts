
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ACHIEVEMENTS, type Achievement } from '@/lib/achievements';
import { playSound } from '@/lib/sounds';
import { useSoundStore } from './soundStore';

interface AchievementState {
  unlocked: Record<string, { unlockedAt: number }>;
  pendingNotification: Achievement | null;
  unlock: (id: string) => void;
  dismissNotification: () => void;
  isUnlocked: (id: string) => boolean;
  getProgress: () => { total: number; unlocked: number };
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked: {},
      pendingNotification: null,
      unlock: (id: string) => {
        const state = get();
        if (state.unlocked[id]) {
          return; // Already unlocked
        }
        
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (!achievement) {
          console.warn(`Achievement with id "${id}" not found.`);
          return;
        }

        // Avoid showing a new notification if one is already pending
        if (state.pendingNotification) {
            setTimeout(() => state.unlock(id), 2000);
            return;
        }

        set({
          unlocked: {
            ...state.unlocked,
            [id]: { unlockedAt: Date.now() },
          },
          pendingNotification: achievement,
        });

        // Check global sound state before playing
        if (useSoundStore.getState().isSoundEnabled) {
          playSound('success');
        }

        setTimeout(() => {
          get().dismissNotification();
        }, 4000);
      },
      dismissNotification: () => {
        set({ pendingNotification: null });
      },
      isUnlocked: (id: string) => {
        return !!get().unlocked[id];
      },
      getProgress: () => {
        return {
          total: ACHIEVEMENTS.length,
          unlocked: Object.keys(get().unlocked).length,
        };
      },
    }),
    {
      name: 'chiru-os-achievements',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ unlocked: state.unlocked }), // only persist 'unlocked'
    }
  )
);
