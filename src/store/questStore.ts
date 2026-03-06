
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { QUESTS } from '@/lib/quests';

interface QuestState {
  completedTasks: Record<string, boolean>;
  completeTask: (taskId: string) => void;
  isTaskComplete: (taskId: string) => boolean;
  isQuestComplete: (questId: string) => boolean;
  getOverallProgress: () => { total: number; completed: number };
  getQuestProgress: (questId: string) => { total: number; completed: number };
  getPlayedGames: () => Set<string>;
  addPlayedGame: (gameId: string) => void;
  getGamesPlayedCount: () => number;
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      completedTasks: {},
      completeTask: (taskId: string) => {
        const state = get();
        if (state.completedTasks[taskId]) {
          return; // Already completed
        }
        set({
          completedTasks: {
            ...state.completedTasks,
            [taskId]: true,
          },
        });
      },
      isTaskComplete: (taskId: string) => !!get().completedTasks[taskId],
      isQuestComplete: (questId: string) => {
        const quest = QUESTS.find(q => q.id === questId);
        if (!quest) return false;
        return quest.tasks.every(task => get().isTaskComplete(task.id));
      },
      getOverallProgress: () => {
        const total = QUESTS.reduce((acc, q) => acc + q.tasks.length, 0);
        const completed = Object.keys(get().completedTasks).length;
        return { total, completed };
      },
      getQuestProgress: (questId: string) => {
          const quest = QUESTS.find(q => q.id === questId);
          if (!quest) return { total: 0, completed: 0 };
          const completed = quest.tasks.filter(t => get().isTaskComplete(t.id)).length;
          return { total: quest.tasks.length, completed };
      },
      // Specific logic for 'arcade' quest
      getPlayedGames: () => {
        const tasks = get().completedTasks;
        const games = new Set<string>();
        Object.keys(tasks).forEach(key => {
          if (key.startsWith('played_')) {
            games.add(key.replace('played_', ''));
          }
        });
        return games;
      },
      addPlayedGame: (gameId: string) => {
        get().completeTask(`played_${gameId}`);
      },
      getGamesPlayedCount: () => get().getPlayedGames().size,
    }),
    {
      name: 'chiru-os-quests',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
