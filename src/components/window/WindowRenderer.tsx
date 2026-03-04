'use client';

import { useWindowManager } from '@/hooks/useWindowManager';
import Window from './Window';

export function WindowRenderer() {
  const { windows } = useWindowManager();

  return (
    <>
      {windows.map(window => (
        <Window key={window.id} window={window} />
      ))}
    </>
  );
}
