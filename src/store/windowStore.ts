'use client';

import { create } from 'zustand';
import { WindowState } from '@/lib/types';
import React, { ReactNode } from 'react';

const BASE_Z_INDEX = 100;
const TASKBAR_HEIGHT = 40;

interface WindowStore {
  windows: WindowState[];
  contactOpenKey: number;
  openWindow: (id: string, title: string, content: ReactNode) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  updateWindow: (id: string, updates: { x: number; y: number; width: number; height: number; }) => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  contactOpenKey: 0,
  openWindow: (id, title, content) => {
    set(state => {
      let newContactOpenKey = state.contactOpenKey;
      let finalContent = content;

      if (id === 'contact') {
        newContactOpenKey++;
        if (React.isValidElement(content)) {
            finalContent = React.cloneElement(content, { key: newContactOpenKey });
        }
      }

      const existingWindow = state.windows.find(w => w.id === id);
      const highestZIndex = Math.max(BASE_Z_INDEX, ...state.windows.map(w => w.zIndex));
      
      if (existingWindow) {
        return {
          contactOpenKey: newContactOpenKey,
          windows: state.windows.map(w =>
            w.id === id ? { ...w, content: finalContent, isMinimized: false, zIndex: highestZIndex + 1 } : w
          )
        };
      }

      const newWindow: WindowState = {
        id,
        title,
        content: finalContent,
        zIndex: highestZIndex + 1,
        position: { x: 150 + state.windows.length * 20, y: 100 + state.windows.length * 20 },
        size: { width: 640, height: 420 },
        isMinimized: false,
        isMaximized: false,
      };
      
      return { 
          windows: [...state.windows, newWindow],
          contactOpenKey: newContactOpenKey
      };
    });
  },
  closeWindow: (id) => set(state => ({ windows: state.windows.filter(w => w.id !== id) })),
  focusWindow: (id) => {
    set(state => {
      const windowToFocus = state.windows.find(w => w.id === id);
      if (!windowToFocus) return state;

      const highestZIndex = Math.max(BASE_Z_INDEX, ...state.windows.map(w => w.zIndex));

      if (windowToFocus.zIndex <= highestZIndex) {
        return {
          windows: state.windows.map(w =>
            w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w
          )
        };
      }
      return state;
    });
  },
  toggleMinimize: (id) => {
    set(state => {
        const win = state.windows.find(w => w.id === id);
        if (!win) return state;

        if(win.isMinimized) {
            const highestZIndex = Math.max(BASE_Z_INDEX, ...state.windows.map(w => w.zIndex));
            return {
                windows: state.windows.map(w =>
                    w.id === id ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w
                )
            };
        } else {
            return {
                windows: state.windows.map(w =>
                    w.id === id ? { ...w, isMinimized: true } : w
                )
            };
        }
    });
  },
  toggleMaximize: (id) => {
    set(state => {
        const windowToMaximize = state.windows.find(w => w.id === id);
        if (!windowToMaximize) return state;
        const highestZIndex = Math.max(BASE_Z_INDEX, ...state.windows.map(w => w.zIndex));

        if (windowToMaximize.isMaximized) {
            return {
                windows: state.windows.map(w =>
                    w.id === id ? {
                        ...w,
                        isMaximized: false,
                        position: { x: w.preMaximizedState!.x, y: w.preMaximizedState!.y },
                        size: { width: w.preMaximizedState!.width, height: w.preMaximizedState!.height },
                        preMaximizedState: undefined,
                     } : w
                )
            };
        } else {
            return {
                windows: state.windows.map(w =>
                    w.id === id ? {
                        ...w,
                        isMaximized: true,
                        isMinimized: false,
                        zIndex: highestZIndex + 1,
                        preMaximizedState: {
                            x: w.position.x,
                            y: w.position.y,
                            width: w.size.width,
                            height: w.size.height,
                        },
                     } : w
                )
            };
        }
    });
  },
  updateWindowPosition: (id, position) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, position } : w
      )
    }));
  },
  updateWindowSize: (id, size) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, size: { width: size.width, height: size.height } } : w
      )
    }));
  },
  updateWindow: (id, updates) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, position: { x: updates.x, y: updates.y }, size: { width: updates.width, height: updates.height } } : w
      )
    }));
  },
}));
