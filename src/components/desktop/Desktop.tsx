'use client';

import Wallpaper from './Wallpaper';
import Icon from './Icon';
import { useWindowManager } from '@/hooks/useWindowManager';
import { getPageComponent } from '../pages';
import { useIconManager } from '@/hooks/useIconManager';
import { useRef, useState, useEffect } from 'react';

const Desktop = () => {
  const { openWindow } = useWindowManager();
  const { icons } = useIconManager();
  const desktopRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const measureDesktop = () => {
      if (desktopRef.current) {
        const { width, height } = desktopRef.current.getBoundingClientRect();
        setBounds({ width, height });
      }
    };
    measureDesktop();
    window.addEventListener('resize', measureDesktop);
    return () => window.removeEventListener('resize', measureDesktop);
  }, []);

  const handleIconDoubleClick = (id: string, label: string) => {
    const PageComponent = getPageComponent(id);
    if (PageComponent) {
      openWindow(id, label, <PageComponent />);
    } else {
      console.warn(`No page component found for ${id}`);
    }
  };

  return (
    <div ref={desktopRef} className="flex-grow w-full relative bg-desktop-bg overflow-hidden">
      <Wallpaper />
      <div className="absolute top-0 left-0 w-full h-full">
        {icons.map(icon => (
          <Icon
            key={icon.id}
            icon={icon}
            bounds={bounds}
            onDoubleClick={() => handleIconDoubleClick(icon.id, icon.label)}
          />
        ))}
      </div>
    </div>
  );
};

export default Desktop;
