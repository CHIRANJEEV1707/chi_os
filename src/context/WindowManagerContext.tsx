'use client';

import React, { createContext, useState, ReactNode } from 'react';
import { WindowState } from '@/lib/types';

interface WindowManagerContextType {
  windows: WindowState[];
  openWindow: (id: string, title: string, content: ReactNode) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
}

export const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

const BASE_Z_INDEX = 100;

export const WindowManagerProvider = ({ children }: { children: ReactNode }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [idCounter, setIdCounter] = useState(0);

  const openWindow = (id: string, title: string, content: ReactNode) => {
    setWindows(prevWindows => {
      const existingWindowIndex = prevWindows.findIndex(w => w.id === id);
      
      // If window already exists, just focus it
      if (existingWindowIndex !== -1) {
        const windowToFocus = prevWindows[existingWindowIndex];
        const otherWindows = prevWindows.filter(w => w.id !== id);
        return [...otherWindows, { ...windowToFocus, zIndex: BASE_Z_INDEX + prevWindows.length -1 }];
      }
      
      const newWindow: WindowState = {
        id,
        title,
        content,
        zIndex: BASE_Z_INDEX + prevWindows.length,
        position: { x: 100 + prevWindows.length * 20, y: 100 + prevWindows.length * 20 },
        size: { width: 640, height: 420 },
      };
      
      return [...prevWindows, newWindow];
    });
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const focusWindow = (id: string) => {
    setWindows(prev => {
        const windowToFocus = prev.find(w => w.id === id);
        if (!windowToFocus) return prev;

        const highestZIndex = Math.max(...prev.map(w => w.zIndex));

        // Only bring to front if it's not already the top window
        if (windowToFocus.zIndex <= highestZIndex) {
            return prev.map(w => {
                if(w.id === id) {
                    return {...w, zIndex: highestZIndex + 1};
                }
                return w;
            })
        }
        return prev;
    });
  };

  return (
    <WindowManagerContext.Provider value={{ windows, openWindow, closeWindow, focusWindow }}>
      {children}
    </WindowManagerContext.Provider>
  );
};
