'use client';

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
    if (isIdle && !renderScreensaver) {
      setIsExiting(false);
      setRenderScreensaver(true);
    } else if (!isIdle && renderScreensaver) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setRenderScreensaver(false);
        setIsExiting(false);
      }, 500); // This must match the fade-out animation duration
      return () => clearTimeout(timer);
    }
  }, [isIdle, renderScreensaver]);

  return (
    <IconManagerProvider>
      <main className="h-full w-full flex flex-col font-body">
        <Desktop />
        <WindowRenderer />
        <Taskbar />
        {renderScreensaver && (
          <div
            className={cn(
              'fixed inset-0 z-[9998] animate-in fade-in-0 duration-500',
              isExiting && 'animate-out fade-out-0 duration-500'
            )}
          >
            <Screensaver />
          </div>
        )}
      </main>
    </IconManagerProvider>
  );
}
