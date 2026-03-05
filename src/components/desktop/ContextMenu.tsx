'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useWindowStore } from '@/store/windowStore';
import { getPageComponent } from '../pages';

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onCycleWallpaper: () => void;
  onRefreshDesktop: () => void;
};

export function ContextMenu({ x, y, onClose, onCycleWallpaper, onRefreshDesktop }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { openWindow } = useWindowStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleOpenTerminal = () => {
    const TerminalComponent = getPageComponent('terminal');
    if (TerminalComponent) {
      openWindow('terminal', 'TERMINAL.exe', <TerminalComponent />);
    }
    onClose();
  };

  const handleAboutOS = () => {
    const AboutOSComponent = getPageComponent('about-os');
    if (AboutOSComponent) {
      openWindow('about-os', 'About CHIRU-OS', <AboutOSComponent />);
    }
    onClose();
  };
  
  const handleCycleWallpaper = () => {
    onCycleWallpaper();
    onClose();
  }
  
  const handleRefreshDesktop = () => {
    onRefreshDesktop();
    onClose();
  }

  const handleSecret = () => {
    console.log("🤫 You found a secret! More to come...");
    onClose();
  };


  return (
    <div
      ref={menuRef}
      className="absolute w-48 bg-window-titlebar border-2 border-primary text-primary flex flex-col p-1 z-[1000] font-headline text-sm"
      style={{ top: y, left: x }}
    >
      <button onClick={handleOpenTerminal} className="w-full text-left p-2 hover:bg-accent hover:text-accent-foreground">Open Terminal</button>
      <button onClick={handleRefreshDesktop} className="w-full text-left p-2 hover:bg-accent hover:text-accent-foreground">Refresh Desktop</button>
      <div className="h-px bg-border/50 my-1" />
      <button onClick={handleAboutOS} className="w-full text-left p-2 hover:bg-accent hover:text-accent-foreground">About CHIRU-OS</button>
      <button onClick={handleCycleWallpaper} className="w-full text-left p-2 hover:bg-accent hover:text-accent-foreground">Change Wallpaper</button>
      <div className="h-px bg-border/50 my-1" />
      <button onClick={handleSecret} className="w-full text-left p-2 hover:bg-accent hover:text-accent-foreground">Secret...</button>
    </div>
  );
}
