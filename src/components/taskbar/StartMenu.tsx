'use client';

import { cn } from '@/lib/utils';
import { START_MENU_ITEMS } from '@/lib/data';
import { getLucideIcon } from '@/lib/icons';
import { useWindowStore } from '@/store/windowStore';
import { getPageComponent } from '../pages';
import { useSoundEffect } from '@/hooks/useSoundEffect';

type StartMenuProps = {
  onClose: () => void;
};

const StartMenuItem = ({ item, onClick }: { item: typeof START_MENU_ITEMS[0], onClick: () => void }) => {
    const Icon = getLucideIcon(item.icon);
    
    if (item.divider) {
        return <div className="h-px bg-border/50 my-1" />;
    }

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-2 p-2 text-left text-sm font-headline hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
        >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
        </button>
    );
};

export default function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow } = useWindowStore();
  const { play } = useSoundEffect();

  const handleItemClick = (item: typeof START_MENU_ITEMS[0]) => {
    if (item.action === 'open_window') {
      play('windowOpen');
      const PageComponent = getPageComponent(item.id);
      if (PageComponent) {
        openWindow(item.id, item.label, <PageComponent />);
      }
    } else {
      play('click');
      // Other actions like reboot/shutdown can be handled here
    }
    onClose();
  };

  return (
    <div
      className={cn(
        'absolute bottom-full left-0 mb-1 w-56',
        'bg-taskbar-bg border-2 border-border text-primary',
        'flex flex-col p-1'
      )}
    >
      <div className='flex items-center gap-2 p-2 border-b-2 border-border'>
        <span className='font-headline text-lg'>CHIRU-OS</span>
      </div>
      <div className='py-1'>
      {START_MENU_ITEMS.map((item, index) => (
        <StartMenuItem key={index} item={item} onClick={() => handleItemClick(item)} />
      ))}
      </div>
    </div>
  );
}
