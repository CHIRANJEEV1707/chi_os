
'use client';

import { create } from 'zustand';
import { SEED_VISITORS, type Visitor } from '@/lib/visitorsData';

interface VisitorState {
  visitors: Visitor[];
  currentVisitor: Visitor | null;
  addVisitor: (visitor: Visitor) => void;
  setCurrentVisitor: (visitor: Visitor | null) => void;
  initialize: (initialVisitors: Visitor[], current: Visitor | null) => void;
}

export const useVisitorStore = create<VisitorState>((set) => ({
  visitors: [],
  currentVisitor: null,
  initialize: (initialVisitors, current) => {
    const combined = current ? [current, ...initialVisitors] : initialVisitors;
    set({ visitors: combined, currentVisitor: current });
  },
  addVisitor: (visitor) =>
    set((state) => ({
      visitors: [visitor, ...state.visitors].slice(0, 50),
    })),
  setCurrentVisitor: (visitor) => set({ currentVisitor: visitor }),
}));
