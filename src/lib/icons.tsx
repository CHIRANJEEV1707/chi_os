
import {
    User,
    Folder,
    Cpu,
    Briefcase,
    FileText,
    Gamepad2,
    Terminal,
    LucideIcon,
    Settings,
    RefreshCw,
    Power,
    Cat,
    Copy,
    Info,
    Bot,
    Trophy,
    Scroll,
    CreditCard,
    Trash2,
    Mail,
    PenSquare,
  } from 'lucide-react';
  
  const iconMap: { [key: string]: LucideIcon } = {
    folder: Folder,
    projects: Folder,
    chip: Cpu,
    skills: Cpu,
    briefcase: Briefcase,
    experience: Briefcase,
    file: FileText,
    resume: FileText,
    contact: Mail,
    guestbook: PenSquare,
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
    bot: Bot,
    'chiru-bot': Bot,
    trophy: Trophy,
    achievements: Trophy,
    scroll: Scroll,
    quests: Scroll,
    'credit-card': CreditCard,
    bizcard: CreditCard,
    trash: Trash2,
    logo: Cat, // Placeholder for CHIRU-OS logo
    copy: Copy,
    'about-os': Info,
    default: Cat
  };
  
  export const getLucideIcon = (iconName: string): LucideIcon => {
    const iconKey = iconName.replace('.exe', '').replace('/', '').replace('.pdf', '').replace('.sh', '').replace('.sys', '').replace('.log', '').replace('.ai', '');
    return iconMap[iconKey] || iconMap.default;
  };
  
