'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { getLucideIcon } from '@/lib/icons';

type IconProps = {
  id: string;
  label: string;
  icon: string;
  onDoubleClick: () => void;
};

const Icon = ({ label, icon, onDoubleClick }: IconProps) => {
  const [selected, setSelected] = useState(false);
  const LucideIcon = getLucideIcon(icon);

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
      <LucideIcon size={48} className="text-primary drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]" />
      <span className={cn('text-xs font-headline text-primary', selected ? 'bg-selection-bg text-selection-text p-1' : 'p-1')}>
        {label}
      </span>
    </button>
  );
};

export default Icon;
