
'use client';

import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { IconState } from '@/lib/types';
import { DESKTOP_ICONS, INITIAL_ICON_POSITIONS } from '@/lib/data';

interface IconManagerContextType {
  icons: IconState[];
  updateIconPosition: (id: string, position: { x: number; y: number }) => void;
  focusIcon: (id:string) => void;
}

export const IconManagerContext = createContext<IconManagerContextType | undefined>(undefined);

const BASE_Z_INDEX = 1;

export const IconManagerProvider = ({ children }: { children: ReactNode }) => {
  const [icons, setIcons] = useState<IconState[]>([]);

  useEffect(() => {
    const calculatePositions = () => {
        const calculatedIcons = INITIAL_ICON_POSITIONS.map(config => {
            const definition = DESKTOP_ICONS.find(d => d.id === config.id);
            if (!definition) return null;

            let { x, y } = config.position;

            // Negative values are flags for right/bottom alignment
            if (x < 0) x = window.innerWidth + x;
            if (y < 0) y = window.innerHeight + y;

            return {
                ...definition,
                position: { x, y },
                zIndex: BASE_Z_INDEX,
            };
        }).filter((icon): icon is IconState => icon !== null);

        setIcons(calculatedIcons);
    }
    
    calculatePositions();
    window.addEventListener('resize', calculatePositions);
    return () => window.removeEventListener('resize', calculatePositions);

  }, []);

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
