
'use client';

import Desktop from '@/components/desktop/Desktop';
import Taskbar from '@/components/taskbar/Taskbar';
import { WindowRenderer } from '@/components/window/WindowRenderer';
import { useIdle } from '@/hooks/useIdle';
import Screensaver from './screensaver/Screensaver';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { IconManagerProvider } from '@/context/IconManagerContext';
import { initSoundSystem } from '@/lib/sounds';
import { useAchievementStore } from '@/store/achievementStore';
import { useQuestStore } from '@/store/questStore';
import { addVisitor } from '@/lib/firestore';

export type WallpaperType = 'matrix' | 'grid' | 'plain';

export default function ChiruOS() {
  const isIdle = useIdle(60000);
  const [renderScreensaver, setRenderScreensaver] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [wallpaper, setWallpaper] = useState<WallpaperType>('matrix');
  const { unlock } = useAchievementStore();
  const { completeTask } = useQuestStore();
  
  useEffect(() => {
    // Initialize sound system on the first user interaction
    initSoundSystem();
  }, []);

  useEffect(() => {
    const logVisitor = async () => {
        try {
            const hasVisited = localStorage.getItem('chiru-os-visited');
            if (hasVisited) {
                return;
            }

            const res = await fetch('https://ipapi.co/json/');
            if (!res.ok) return;
            const data = await res.json();

            const visitorData = {
                city: data.city || 'Unknown',
                country: data.country_name || 'Unknown',
                country_code: data.country_code || 'UN',
                lat: data.latitude || null,
                lng: data.longitude || null,
                userAgent: navigator.userAgent.substring(0, 100),
            };
            
            await addVisitor(visitorData);
            
            localStorage.setItem('chiru-os-visited', new Date().toISOString());

        } catch (error) {
            console.error("Visitor logging failed:", error);
        }
    };
    
    logVisitor();
  }, []);

  useEffect(() => {
    if (isIdle && !renderScreensaver) {
      setIsExiting(false);
      setRenderScreensaver(true);
      unlock('insomniac');
      completeTask('trigger_screensaver');
    } else if (!isIdle && renderScreensaver) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setRenderScreensaver(false);
        setIsExiting(false);
      }, 500); // This must match the fade-out animation duration
      return () => clearTimeout(timer);
    }
  }, [isIdle, renderScreensaver, unlock, completeTask]);

  const cycleWallpaper = () => {
    setWallpaper(current => {
      if (current === 'matrix') return 'grid';
      if (current === 'grid') return 'plain';
      return 'matrix';
    });
  };

  return (
    <IconManagerProvider>
      <main className="h-full w-full flex flex-col font-body">
        <Desktop wallpaper={wallpaper} cycleWallpaper={cycleWallpaper} />
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
