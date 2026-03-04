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
    Cat
  } from 'lucide-react';
  
  const iconMap: { [key: string]: LucideIcon } = {
    folder: Folder,
    chip: Cpu,
    briefcase: Briefcase,
    gamepad: Gamepad2,
    prompt: Terminal,
    user: User,
    gear: Settings,
    refresh: RefreshCw,
    power: Power,
    logo: Cat, // Placeholder for CHIRU-OS logo
    default: Cat
  };
  
  export const getLucideIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || iconMap.default;
  };
  
