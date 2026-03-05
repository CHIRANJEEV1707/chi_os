'use client';

import { useWindowStore } from '@/store/windowStore';
import Window from './Window';
import { useState, useEffect } from 'react';

export function WindowRenderer() {
  const { windows } = useWindowStore();
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const measureDesktop = () => {
        setBounds({ width: window.innerWidth, height: window.innerHeight });
    };
    measureDesktop();
    window.addEventListener('resize', measureDesktop);
    return () => window.removeEventListener('resize', measureDesktop);
  }, []);

  return (
    <>
      {windows.map(windowState => (
        <Window key={windowState.id} windowState={windowState} desktopBounds={bounds} />
      ))}
    </>
  );
}
