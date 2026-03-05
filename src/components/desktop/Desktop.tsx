'use client';

import Wallpaper from './Wallpaper';
import Icon from './Icon';
import { useWindowStore } from '@/store/windowStore';
import { getPageComponent } from '../pages';
import { useIconManager } from '@/hooks/useIconManager';
import { useRef, useState, useEffect } from 'react';
import { WallpaperType } from '../ChiruOS';
import { ContextMenu } from './ContextMenu';
import { useSoundEffect } from '@/hooks/useSoundEffect';

type DesktopProps = {
    wallpaper: WallpaperType;
    cycleWallpaper: () => void;
}

const Desktop = ({ wallpaper, cycleWallpaper }: DesktopProps) => {
  const { openWindow } = useWindowStore();
  const { icons } = useIconManager();
  const desktopRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [iconRenderKey, setIconRenderKey] = useState(0);
  const { play } = useSoundEffect();


  useEffect(() => {
    const measureDesktop = () => {
      if (desktopRef.current) {
        const { width, height } = desktopRef.current.getBoundingClientRect();
        setBounds({ width, height });
      }
    };
    measureDesktop();
    window.addEventListener('resize', measureDesktop);

    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('resize', measureDesktop);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  const handleIconDoubleClick = (id: string, label: string) => {
    play('windowOpen');
    const PageComponent = getPageComponent(id);
    if (PageComponent) {
      openWindow(id, label, <PageComponent />);
    } else {
      console.warn(`No page component found for ${id}`);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };
  
  const handleRefreshDesktop = () => {
      setIconRenderKey(prev => prev + 1);
  }

  return (
    <div ref={desktopRef} onContextMenu={handleContextMenu} className="flex-grow w-full relative bg-desktop-bg overflow-hidden">
      <Wallpaper type={wallpaper} />
      <div key={iconRenderKey} className="absolute top-0 left-0 w-full h-full">
        {icons.map(icon => (
          <Icon
            key={icon.id}
            icon={icon}
            bounds={bounds}
            onDoubleClick={() => handleIconDoubleClick(icon.id, icon.label)}
          />
        ))}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCycleWallpaper={cycleWallpaper}
          onRefreshDesktop={handleRefreshDesktop}
        />
      )}
    </div>
  );
};

export default Desktop;
