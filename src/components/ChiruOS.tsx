'use client';

import { WindowManagerProvider } from '@/context/WindowManagerContext';
import Desktop from '@/components/desktop/Desktop';
import Taskbar from '@/components/taskbar/Taskbar';
import { WindowRenderer } from '@/components/window/WindowRenderer';
import { useIdle } from '@/hooks/useIdle';
import Screensaver from './screensaver/Screensaver';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { IconManagerProvider } from '@/context/IconManagerContext';

export default function ChiruOS() {
  const isIdle = useIdle(60000);
  const [renderScreensaver, setRenderScreensaver] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isIdle) {
      setIsExiting(false);
      setRenderScreensaver(true);
    } else if (renderScreensaver) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setRenderScreensaver(false);
        setIsExiting(false);
      }, 500); // Must match fade-out duration
      return () => clearTimeout(timer);
    }
  }, [isIdle, renderScreensaver]);

  return (
    <WindowManagerProvider>
      <IconManagerProvider>
        <main className="h-full w-full flex flex-col font-body">
          <Desktop />
          <WindowRenderer />
          <Taskbar />
          {renderScreensaver && (
            <div
              className={cn(
                'animate-in fade-in duration-500',
                isExiting && 'animate-out fade-out duration-500'
              )}
            >
              <Screensaver />
            </div>
          )}
        </main>
      </IconManagerProvider>
    </WindowManagerProvider>
  );
}
