
'use client';
import { useAchievementStore } from '@/store/achievementStore';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import React from 'react';

const AchievementCard = ({ ach, isUnlocked }: { ach: typeof ACHIEVEMENTS[0], isUnlocked: boolean }) => {
    const content = (
         <div className={cn(
            'w-full h-24 p-2 border-2 flex flex-col items-center justify-center text-center gap-1 transition-all duration-300',
            isUnlocked 
                ? 'bg-[#001a00] border-primary hover:bg-green-900/50' 
                : 'bg-[#000a00] border-primary/20',
            ach.secret && !isUnlocked && 'cursor-default'
         )}>
            <span className={cn("text-3xl", !isUnlocked && 'opacity-30')}>
                {ach.secret && !isUnlocked ? <Lock className="w-8 h-8"/> : ach.icon}
            </span>
            <p className={cn("font-headline text-[6px] truncate", isUnlocked ? 'text-primary' : 'text-primary/40')}>
                {ach.secret && !isUnlocked ? 'SECRET ACHIEVEMENT' : ach.title}
            </p>
         </div>
    );
    
    if (!isUnlocked && ach.secret) {
        return content;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent>
                <p className="font-headline text-base">{ach.title}</p>
                <p className="text-sm">{ach.desc}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export default function Achievements() {
    const { unlocked, getProgress } = useAchievementStore();
    const { total, unlocked: unlockedCount } = getProgress();

    const unlockedAchievements = ACHIEVEMENTS.filter(a => unlocked[a.id]);
    const lockedAchievements = ACHIEVEMENTS.filter(a => !unlocked[a.id]);
    
    const progressPercent = total > 0 ? (unlockedCount / total) * 100 : 0;

    return (
        <div className="p-4 font-body h-full overflow-y-auto">
            <div className="font-headline text-[8px] md:text-[10px] text-muted-foreground">
                <p>&gt; cat /var/log/achievements.log</p>
            </div>

            <div className="my-4">
                 <p className="font-body text-base md:text-lg text-primary text-center mb-2">
                    {unlockedCount} / {total} BADGES UNLOCKED
                </p>
                <div className="h-4 w-full border-2 border-primary p-0.5">
                    <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercent}%`}} />
                </div>
            </div>

            <TooltipProvider>
                {unlockedAchievements.length > 0 && (
                    <div className="mb-6">
                        <h2 className="font-headline text-sm text-green-400 mb-2">[ UNLOCKED ]</h2>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {unlockedAchievements.map(ach => (
                                <AchievementCard key={ach.id} ach={ach} isUnlocked={true} />
                            ))}
                        </div>
                    </div>
                )}
                {lockedAchievements.length > 0 && (
                     <div className="mb-6">
                        <h2 className="font-headline text-sm text-primary/50 mb-2">[ LOCKED ]</h2>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {lockedAchievements.map(ach => (
                                <AchievementCard key={ach.id} ach={ach} isUnlocked={false} />
                            ))}
                        </div>
                    </div>
                )}
            </TooltipProvider>
        </div>
    );
}
