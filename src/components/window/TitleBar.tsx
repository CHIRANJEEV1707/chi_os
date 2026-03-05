import { X, Square, Minus, Copy } from 'lucide-react';
import { getLucideIcon } from '@/lib/icons';

type TitleBarProps = {
  title: string;
  icon: string;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  isMaximized: boolean;
};

const TitleBar = ({ title, icon, onClose, onMinimize, onMaximize, isMaximized }: TitleBarProps) => {
    const Icon = getLucideIcon(icon);
  return (
    <div className="window-titlebar h-7 bg-window-titlebar border-b-2 border-border flex items-center justify-between px-2 font-headline text-sm select-none cursor-move">
      <div className="flex items-center gap-2 truncate">
        <Icon className="w-4 h-4" />
        <span className="truncate">{title}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onMinimize} className="w-5 h-5 flex items-center justify-center border-2 border-border hover:bg-yellow-500/50">
          <Minus size={12} />
        </button>
        <button onClick={onMaximize} className="w-5 h-5 flex items-center justify-center border-2 border-border hover:bg-green-500/50">
          {isMaximized ? <Copy size={10} /> : <Square size={10} />}
        </button>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center border-2 border-border hover:bg-red-500/50"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
