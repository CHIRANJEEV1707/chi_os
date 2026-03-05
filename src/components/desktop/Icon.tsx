'use client';

import React, { useState, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { cn } from '@/lib/utils';
import { IconState } from '@/lib/types';
import { useIconManager } from '@/hooks/useIconManager';

type IconProps = {
  icon: IconState;
  bounds: { width: number; height: number };
  onDoubleClick: () => void;
};

const ICON_WIDTH = 96;
const ICON_HEIGHT = 96;
const TASKBAR_HEIGHT = 40;

const Icon = ({ icon, bounds, onDoubleClick }: IconProps) => {
  const [selected, setSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { updateIconPosition, focusIcon } = useIconManager();
  const nodeRef = useRef(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(true);
    focusIcon(icon.id);
  };
  
  const handleBlur = () => {
    setSelected(false);
  };

  const onDragStop = (e: DraggableEvent, data: DraggableData) => {
    updateIconPosition(icon.id, { x: data.x, y: data.y });
    setIsDragging(false);
    // This is to re-focus the button after drag, so it can be blurred
    if (e.target instanceof HTMLElement) {
      const parentButton = e.target.closest('button');
      parentButton?.focus();
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={icon.position}
      onStart={() => setIsDragging(true)}
      onStop={onDragStop}
      grid={[8, 8]}
      bounds={{
        top: 0,
        left: 0,
        right: bounds.width > 0 ? bounds.width - ICON_WIDTH : 0,
        bottom: bounds.height > 0 ? bounds.height - ICON_HEIGHT - TASKBAR_HEIGHT : 0,
      }}
    >
      <div
        ref={nodeRef}
        className="absolute"
        style={{ zIndex: isDragging ? 50 : icon.zIndex }}
      >
        <button
          onDoubleClick={onDoubleClick}
          onClick={handleClick}
          onBlur={handleBlur}
          className={cn(
            'flex flex-col items-center gap-1 p-2 w-24 h-24 text-center rounded-md focus:outline-none',
            'animate-in fade-in-0 zoom-in-90 duration-300', // Entrance animation
            isDragging && 'opacity-70',
            selected ? 'bg-primary/30' : 'hover:bg-primary/10',
            // No focus ring when dragging, but apply when selected.
            selected && !isDragging && 'ring-2 ring-offset-2 ring-ring ring-offset-desktop-bg'
          )}
        >
          <div 
            className="w-12 h-12 flex items-center justify-center border-2 border-primary/50 bg-black/30"
            style={{ imageRendering: 'pixelated' }}
          >
            <span 
              className="text-[32px] leading-none"
              style={{ filter: 'grayscale(1) brightness(1.5) sepia(1) hue-rotate(60deg) saturate(7)'}}
            >
              {icon.icon}
            </span>
          </div>
          <span className={cn('text-xs font-headline text-primary', selected ? 'bg-selection-bg text-selection-text p-1' : 'p-1')}>
            {icon.label}
          </span>
        </button>
      </div>
    </Draggable>
  );
};

export default Icon;
