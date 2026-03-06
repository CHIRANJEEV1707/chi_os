'use client';

import { useState } from 'react';
import { Github, Linkedin, Mail, FileText, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import Clock from './Clock';
import StartMenu from './StartMenu';
import { useWindowStore } from '@/store/windowStore';
import { getLucideIcon } from '@/lib/icons';
import { useSoundStore } from '@/store/soundStore';
import { getPageComponent } from '../pages';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSoundEffect } from '@/hooks/useSoundEffect';

const Taskbar = () => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const StartIcon = getLucideIcon('logo');
  const { windows, focusWindow, toggleMinimize, openWindow } = useWindowStore();
  const { isSoundEnabled, toggleSound } = useSoundStore();
  const { play } = useSoundEffect();
  const ContactPageComponent = getPageComponent('contact');
  const ChiruBotPageComponent = getPageComponent('chiru-bot');


  const handleTabClick = (id: string, isMinimized: boolean) => {
      play('click');
      if (isMinimized) {
        toggleMinimize(id); // This will also focus it.
      } else {
        const nonMinimizedWindows = windows.filter(w => !w.isMinimized);
        const highestZIndex = Math.max(0, ...nonMinimizedWindows.map(w => w.zIndex));
        const currentWindowZIndex = windows.find(w => w.id === id)?.zIndex ?? 0;
        
        // If it's not the top window, focus it. If it is, minimize it.
        if (currentWindowZIndex < highestZIndex) {
            focusWindow(id);
        } else {
            toggleMinimize(id);
        }
      }
  }
  
  const handleContactClick = () => {
    if (ContactPageComponent) {
      play('windowOpen');
      openWindow('contact', 'CONTACT.sh', <ContactPageComponent />);
    }
  }
  
  const handleChiruBotClick = () => {
    if (ChiruBotPageComponent) {
      play('windowOpen');
      openWindow('chiru-bot', 'CHIRU-BOT.ai — Interview Me', <ChiruBotPageComponent />);
    }
  }

  const handleResumeDownload = () => {
    play('click');
    window.open('/resume/chiranjeev-agarwal-resume.pdf', '_blank');
  }

  const handleToggleSound = () => {
    play('click');
    toggleSound();
  }

  return (
    <footer className="h-10 w-full bg-taskbar-bg border-t-2 border-border flex items-center justify-between px-2 z-[200]">
      <div className="relative">
        <button
          onClick={() => {
            play('click');
            setStartMenuOpen(prev => !prev);
          }}
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
      
      <div className="flex-1 px-2 flex items-center gap-1 overflow-x-auto">
        {windows.map(win => {
            const Icon = getLucideIcon(win.id);
            const nonMinimizedWindows = windows.filter(w => !w.isMinimized);
            const highestZIndex = Math.max(0, ...nonMinimizedWindows.map(w => w.zIndex));
            const isFocused = !win.isMinimized && win.zIndex === highestZIndex;
            return (
                <button
                    key={win.id}
                    onClick={() => handleTabClick(win.id, win.isMinimized)}
                    className={cn(
                        'h-7 px-2 flex items-center gap-1 max-w-36 text-xs border-2 truncate',
                        isFocused ? 'bg-accent text-accent-foreground border-accent' : 
                        win.isMinimized ? 'bg-muted/50 border-border opacity-70' : 'bg-secondary border-border hover:bg-accent/50'
                    )}
                >
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{win.title}</span>
                </button>
            )
        })}
      </div>

      <TooltipProvider>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleChiruBotClick} className="text-primary hover:text-accent"><Bot size={16} /></button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>CHIRU-BOT.ai</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <a href="https://github.com/chiranjeev-agarwal" target="_blank" rel="noopener noreferrer" onClick={() => play('click')} className="text-primary hover:text-accent"><Github size={16} /></a>
            </TooltipTrigger>
            <TooltipContent side="top"><p>GitHub</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <a href="https://linkedin.com/in/chiranjeev-agarwal" target="_blank" rel="noopener noreferrer" onClick={() => play('click')} className="text-primary hover:text-accent"><Linkedin size={16} /></a>
            </TooltipTrigger>
            <TooltipContent side="top"><p>LinkedIn</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleContactClick} className="text-primary hover:text-accent"><Mail size={16} /></button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Contact Me</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleResumeDownload} className="text-primary hover:text-accent">
                <FileText size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Download Resume</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleToggleSound} className="text-primary hover:text-accent text-base" style={{fontFamily: 'monospace'}}>
                {isSoundEnabled ? '🔊' : '🔇'}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Toggle Sound</p></TooltipContent>
          </Tooltip>
          <div className="w-px h-6 bg-border/50 mx-1" />
          <Clock />
        </div>
      </TooltipProvider>
    </footer>
  );
};

export default Taskbar;
