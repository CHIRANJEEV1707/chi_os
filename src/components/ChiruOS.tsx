'use client';

import { WindowManagerProvider } from '@/context/WindowManagerContext';
import Desktop from '@/components/desktop/Desktop';
import Taskbar from '@/components/taskbar/Taskbar';
import { WindowRenderer } from '@/components/window/WindowRenderer';

export default function ChiruOS() {
  return (
    <WindowManagerProvider>
      <main className="h-full w-full flex flex-col font-body">
        <Desktop />
        <WindowRenderer />
        <Taskbar />
      </main>
    </WindowManagerProvider>
  );
}
