'use client';

import { useContext } from 'react';
import { IconManagerContext } from '@/context/IconManagerContext';

export const useIconManager = () => {
  const context = useContext(IconManagerContext);
  if (context === undefined) {
    throw new Error('useIconManager must be used within a IconManagerProvider');
  }
  return context;
};
