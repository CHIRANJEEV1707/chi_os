import {
    User,
    Folder,
    Cpu,
    Briefcase,
    Gamepad2,
    Terminal,
    LucideIcon,
    Settings,
    RefreshCw,
    Power,
    Cat,
    Copy,
    Info,
  } from 'lucide-react';
  
  const iconMap: { [key: string]: LucideIcon } = {
    folder: Folder,
    projects: Folder,
    chip: Cpu,
    skills: Cpu,
    briefcase: Briefcase,
    experience: Briefcase,
    gamepad: Gamepad2,
    games: Gamepad2,
    prompt: Terminal,
    terminal: Terminal,
    user: User,
    about: User,
    gear: Settings,
    settings: Settings,
    refresh: RefreshCw,
    power: Power,
    logo: Cat, // Placeholder for CHIRU-OS logo
    copy: Copy,
    'about-os': Info,
    default: Cat
  };
  
  export const getLucideIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || iconMap.default;
  };
  
