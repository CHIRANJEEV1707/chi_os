'use client';

import { useContext } from 'react';
import { WindowManagerContext } from '@/context/WindowManagerContext';

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (context === undefined) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  return context;
};
