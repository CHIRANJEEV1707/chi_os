'use client';

import Wallpaper from './Wallpaper';
import Icon from './Icon';
import { DESKTOP_ICONS } from '@/lib/data';
import { useWindowManager } from '@/hooks/useWindowManager';
import { getPageComponent } from '../pages';

const Desktop = () => {
  const { openWindow } = useWindowManager();

  const handleIconDoubleClick = (id: string, label: string) => {
    const PageComponent = getPageComponent(id);
    if(PageComponent) {
        openWindow(id, label, <PageComponent />);
    } else {
        console.warn(`No page component found for ${id}`);
    }
  };

  return (
    <div className="flex-grow w-full relative bg-desktop-bg overflow-hidden">
      <Wallpaper />
      <div className="absolute top-0 left-0 p-4 grid grid-cols-2 md:grid-cols-2 gap-x-5 gap-y-2">
        {DESKTOP_ICONS.map(icon => (
          <Icon
            key={icon.id}
            id={icon.id}
            label={icon.label}
            icon={icon.icon}
            onDoubleClick={() => handleIconDoubleClick(icon.id, icon.label)}
          />
        ))}
      </div>
    </div>
  );
};

export default Desktop;
