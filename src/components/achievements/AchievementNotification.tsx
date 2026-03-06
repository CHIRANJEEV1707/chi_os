
'use client';
import { useEffect, useState } from 'react';
import { useAchievementStore } from '@/store/achievementStore';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export default function AchievementNotification() {
  const { pendingNotification, dismissNotification } = useAchievementStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pendingNotification) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 3700); // Start fade out before dismissal

      return () => clearTimeout(timer);
    }
  }, [pendingNotification]);

  if (!pendingNotification) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-12 right-4 z-[9998] w-72 transform transition-all duration-300 ease-out',
        show ? 'translate-x-0' : 'translate-x-[120%]'
      )}
    >
      <div className="bg-[#001a00] border-2 border-amber-400 p-3 text-primary relative shadow-[0_0_15px_hsl(var(--primary))]">
        <h2 className="font-headline text-[7px] text-amber-400 flex items-center gap-2">
            🏆 ACHIEVEMENT UNLOCKED!
        </h2>
        <div className="h-px bg-amber-400/50 my-2"></div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{pendingNotification.icon}</span>
          <div className="flex-grow">
            <h3 className="font-headline text-[8px] text-primary">{pendingNotification.title}</h3>
            <p className="font-body text-sm text-primary/80">{pendingNotification.desc}</p>
          </div>
        </div>
        <button
          onClick={dismissNotification}
          className="absolute top-1 right-1 text-amber-400/50 hover:text-amber-400"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
