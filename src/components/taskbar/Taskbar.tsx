'use client';

import { useState } from 'react';
import { Github, Linkedin, Mail, FileText, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Clock from './Clock';
import StartMenu from './StartMenu';
import { getLucideIcon } from '@/lib/icons';

const Taskbar = () => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const StartIcon = getLucideIcon('logo');

  return (
    <footer className="h-10 w-full bg-taskbar-bg border-t-2 border-border flex items-center justify-between px-2 z-50">
      <div className="relative">
        <button
          onClick={() => setStartMenuOpen(prev => !prev)}
          className={cn(
            'h-8 px-3 flex items-center gap-2 font-headline text-sm border-2',
            startMenuOpen
              ? 'bg-accent text-accent-foreground border-accent'
              : 'border-border hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <StartIcon className="w-4 h-4" />
          START
        </button>
        {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} />}
      </div>
      
      {/* Open window tabs would go here */}

      <div className="flex items-center gap-3">
        <a href="https://github.com/chiranjeev" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent"><Github size={16} /></a>
        <a href="https://linkedin.com/in/chiranjeev" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent"><Linkedin size={16} /></a>
        <button className="text-primary hover:text-accent"><Mail size={16} /></button>
        <button className="text-primary hover:text-accent"><FileText size={16} /></button>
        <button className="text-primary hover:text-accent"><Volume2 size={16} /></button>
        <div className="w-px h-6 bg-border/50 mx-1" />
        <Clock />
      </div>
    </footer>
  );
};

export default Taskbar;
