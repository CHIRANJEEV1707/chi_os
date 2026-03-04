'use client';

import React, { createContext, useState, ReactNode, useContext } from 'react';
import { IconState } from '@/lib/types';
import { INITIAL_ICON_POSITIONS } from '@/lib/data';

interface IconManagerContextType {
  icons: IconState[];
  updateIconPosition: (id: string, position: { x: number; y: number }) => void;
  focusIcon: (id:string) => void;
}

export const IconManagerContext = createContext<IconManagerContextType | undefined>(undefined);

const BASE_Z_INDEX = 1;

export const IconManagerProvider = ({ children }: { children: ReactNode }) => {
  const [icons, setIcons] = useState<IconState[]>(
    INITIAL_ICON_POSITIONS.map((icon) => ({ ...icon, zIndex: BASE_Z_INDEX }))
  );

  const updateIconPosition = (id: string, position: { x: number; y: number }) => {
    setIcons(prevIcons =>
      prevIcons.map(icon =>
        icon.id === id ? { ...icon, position } : icon
      )
    );
  };

  const focusIcon = (id: string) => {
    setIcons(prev => {
        const iconToFocus = prev.find(i => i.id === id);
        if (!iconToFocus) return prev;

        const highestZIndex = Math.max(...prev.map(i => i.zIndex));

        if (iconToFocus.zIndex <= highestZIndex) {
            return prev.map(i => {
                if(i.id === id) {
                    return {...i, zIndex: highestZIndex + 1};
                }
                return i;
            })
        }
        return prev;
    });
  };


  return (
    <IconManagerContext.Provider value={{ icons, updateIconPosition, focusIcon }}>
      {children}
    </IconManagerContext.Provider>
  );
};
