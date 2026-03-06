
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
import { useVisitorStore } from '@/store/visitorStore';
import { SEED_VISITORS, Visitor } from '@/lib/visitorsData';

export type WallpaperType = 'matrix' | 'grid' | 'plain';

export default function ChiruOS() {
  const isIdle = useIdle(60000);
  const [renderScreensaver, setRenderScreensaver] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [wallpaper, setWallpaper] = useState<WallpaperType>('matrix');
  const { unlock } = useAchievementStore();
  const { completeTask } = useQuestStore();
  const { initialize, addVisitor, setCurrentVisitor } = useVisitorStore();
  
  useEffect(() => {
    // Initialize sound system on the first user interaction
    initSoundSystem();
  }, []);

  useEffect(() => {
    const fetchVisitor = async () => {
        try {
            // Check if we already fetched for this session
            const storedVisitor = sessionStorage.getItem('chiru-current-visitor');
            if (storedVisitor) {
                const parsed = JSON.parse(storedVisitor);
                const visitorWithDate = { ...parsed, timestamp: new Date(parsed.timestamp) };
                initialize(SEED_VISITORS, visitorWithDate);
                return;
            }

            // Fetch new visitor data
            const res = await fetch('https://ipapi.co/json/');
            if (!res.ok) throw new Error('Failed to fetch geo IP');
            const data = await res.json();
            
            const currentVisitor: Visitor = {
                id: `user-${Date.now()}`,
                city: data.city || 'Unknown',
                country: data.country_name || 'Unknown',
                country_code: data.country_code || 'UN',
                lat: data.latitude,
                lng: data.longitude,
                timestamp: new Date(),
            };

            // TODO: Replace with database write when Supabase is ready
            
            initialize(SEED_VISITORS, currentVisitor);

            sessionStorage.setItem('chiru-current-visitor', JSON.stringify(currentVisitor));

        } catch (error) {
            console.error("Visitor fetch failed:", error);
            // Initialize with seed data only
            initialize(SEED_VISITORS, null);
        }
    };
    
    fetchVisitor();
    
    // The initialize function is stable and won't cause re-renders
  }, [initialize]);

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
