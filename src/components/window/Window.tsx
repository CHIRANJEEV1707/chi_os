'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import TitleBar from './TitleBar';
import { WindowState } from '@/lib/types';
import { useWindowManager } from '@/hooks/useWindowManager';

type WindowProps = {
  window: WindowState;
};

// Simplified Window without react-draggable/resizable
export default function Window({ window }: WindowProps) {
  const { closeWindow, focusWindow } = useWindowManager();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeWindow(window.id);
    }, 300); // Match animation duration
  };

  return (
    <div
      className={cn(
        "absolute top-1/4 left-1/4 w-1/2 min-w-[320px] min-h-[200px] flex flex-col",
        "bg-window-bg border-2 border-border text-primary shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        isClosing && "animate-dissolve-out"
      )}
      style={{
        zIndex: window.zIndex,
        top: window.position.y,
        left: window.position.x,
        width: window.size.width,
        height: window.size.height,
      }}
      onMouseDown={() => focusWindow(window.id)}
    >
      <TitleBar title={window.title} icon={window.id} onClose={handleClose} />
      <div className="flex-grow overflow-auto p-1 bg-black/30">
        {window.content}
      </div>
    </div>
  );
}
