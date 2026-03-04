'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

type IconProps = {
  id: string;
  label: string;
  icon: string;
  onDoubleClick: () => void;
};

const Icon = ({ label, icon, onDoubleClick }: IconProps) => {
  const [selected, setSelected] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(true);
  };
  
  const handleBlur = () => {
    setSelected(false);
  }

  return (
    <button
      onDoubleClick={onDoubleClick}
      onClick={handleClick}
      onBlur={handleBlur}
      className={cn(
        'flex flex-col items-center gap-1 p-2 w-24 h-24 text-center rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-desktop-bg',
        selected ? 'bg-primary/30' : 'hover:bg-primary/10'
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
          {icon}
        </span>
      </div>
      <span className={cn('text-xs font-headline text-primary', selected ? 'bg-selection-bg text-selection-text p-1' : 'p-1')}>
        {label}
      </span>
    </button>
  );
};

export default Icon;
