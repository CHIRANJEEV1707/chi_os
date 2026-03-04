import {
    User,
    Folder,
    Cpu,
    Briefcase,
    FileText,
    Book,
    TerminalSquare,
    BookUser,
    Gamepad2,
    Terminal,
    Trash2,
    LucideIcon,
    Settings,
    RefreshCw,
    Power,
    Cat
  } from 'lucide-react';
  
  const iconMap: { [key: string]: LucideIcon } = {
    user_avatar: User,
    folder: Folder,
    chip: Cpu,
    briefcase: Briefcase,
    document: FileText,
    notepad: Book,
    terminal_square: TerminalSquare,
    book: BookUser,
    gamepad: Gamepad2,
    prompt: Terminal,
    trash: Trash2,
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
  