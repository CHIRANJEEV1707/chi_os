
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useQuestStore } from '@/store/questStore';
import { useAchievementStore } from '@/store/achievementStore';
import { QUESTS, Quest, Task } from '@/lib/quests';
import { cn } from '@/lib/utils';
import { Check, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useWindowStore } from '@/store/windowStore';
import { getPageComponent } from '.';

const QuestCompleteModal = ({ quest, onClose }: { quest: Quest, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center animate-in fade-in-0 duration-300">
            <div className="w-full max-w-sm bg-window-bg border-2 border-amber-400 p-6 text-center flex flex-col items-center gap-4">
                <h2 className="font-headline text-lg text-amber-400">QUEST COMPLETE!</h2>
                <span className="text-6xl">{quest.icon}</span>
                <h3 className="font-body text-xl text-primary">{quest.title}</h3>
                <p className="text-base text-primary/80">{quest.reward.message}</p>
                <button onClick={onClose} className="font-headline text-[8px] mt-4 px-4 py-2 border-2 border-primary bg-black/30 text-primary hover:bg-accent hover:text-accent-foreground">
                    [ CONTINUE ]
                </button>
            </div>
        </div>
    );
};


const QuestCard = ({ quest }: { quest: Quest }) => {
    const { isTaskComplete, getQuestProgress, isQuestComplete } = useQuestStore();
    const isLocked = quest.locked ? quest.locked(isQuestComplete) : false;
    const isComplete = isQuestComplete(quest.id);
    const { total, completed } = getQuestProgress(quest.id);

    if (isLocked) {
        return (
            <div className="p-3 border-2 border-dashed border-primary/20 bg-black/20 text-primary/50">
                <header className="flex justify-between items-center">
                    <h3 className="font-headline text-sm flex items-center gap-2">{quest.icon} {quest.title}</h3>
                    <span className="font-headline text-[7px] border border-primary/30 px-2 py-0.5">LOCKED</span>
                </header>
                <p className="text-sm mt-2 pl-8 text-primary/40">Complete previous quests to unlock.</p>
            </div>
        );
    }
    
    return (
        <div className={cn("p-3 border-2", isComplete ? 'bg-green-900/20 border-amber-400' : 'bg-[#001a00] border-primary/50')}>
            <header className="flex justify-between items-center">
                <h3 className="font-headline text-sm flex items-center gap-2">{quest.icon} {quest.title}</h3>
                {isComplete ? (
                    <span className="font-headline text-[7px] border border-amber-400 bg-amber-900/50 text-amber-400 px-2 py-0.5 flex items-center gap-1"><Check size={10} /> COMPLETE</span>
                ) : (
                    <span className="font-headline text-[7px] border border-primary/50 bg-black/50 text-primary px-2 py-0.5">{completed}/{total} TASKS</span>
                )}
            </header>
            <div className="mt-3 pl-8 flex flex-col gap-2">
                {quest.tasks.map(task => (
                    <TaskItem key={task.id} task={task} isComplete={isTaskComplete(task.id)} />
                ))}
            </div>
            {isComplete && <p className="mt-3 pl-8 text-amber-400 text-sm italic">{quest.reward.message}</p>}
        </div>
    );
};

const TaskItem = ({ task, isComplete }: { task: Task, isComplete: boolean}) => (
    <div className="flex items-center gap-2 text-primary/80">
        {isComplete ? (
            <Check size={16} className="text-green-400 flex-shrink-0" />
        ) : (
            <div className="w-4 h-4 border-2 border-primary/50 flex-shrink-0" />
        )}
        <span className={cn("font-body text-base", isComplete && "line-through text-primary/50")}>{task.label}</span>
        <Tooltip>
            <TooltipTrigger asChild>
                <button className="ml-auto text-primary/40 hover:text-primary"><Info size={14} /></button>
            </TooltipTrigger>
            <TooltipContent><p>{task.hint}</p></TooltipContent>
        </Tooltip>
    </div>
);


export default function Quests() {
    const { completedTasks, getOverallProgress, isQuestComplete } = useQuestStore();
    const { unlock } = useAchievementStore();
    const { openWindow } = useWindowStore();
    const { play } = useSoundEffect();
    const [completedQuest, setCompletedQuest] = useState<Quest | null>(null);

    const prevCompletedQuests = useMemo(() => {
        const completed: Record<string, boolean> = {};
        QUESTS.forEach(q => {
            completed[q.id] = isQuestComplete(q.id);
        });
        return completed;
    }, []); // Runs only on mount

    useEffect(() => {
        QUESTS.forEach(quest => {
            const wasComplete = prevCompletedQuests[quest.id];
            const isNowComplete = isQuestComplete(quest.id);

            if (isNowComplete && !wasComplete) {
                setCompletedQuest(quest);
                play('success');
                if (quest.reward.achievement) {
                    unlock(quest.reward.achievement);
                }
            }
        });
    }, [completedTasks, isQuestComplete, prevCompletedQuests, play, unlock]);

    const handleModalClose = () => {
        if (!completedQuest) return;

        const allQuestsComplete = QUESTS.every(q => isQuestComplete(q.id));
        if (allQuestsComplete && completedQuest.reward.special === 'unlocks_secret_message') {
            const SecretMessageComponent = getPageComponent('secret-message');
            if (SecretMessageComponent) {
                openWindow('secret-message', 'A SECRET.msg', <SecretMessageComponent />);
            }
        }
        setCompletedQuest(null);
    };

    const { total, completed } = getOverallProgress();
    const progressPercent = total > 0 ? (completed / total) * 100 : 0;

    return (
        <TooltipProvider>
            <div className="p-4 font-body h-full overflow-y-auto">
                {completedQuest && <QuestCompleteModal quest={completedQuest} onClose={handleModalClose} />}
                <div className="font-headline text-[8px] text-muted-foreground">
                    <p>&gt; cat /etc/missions.conf</p>
                </div>

                <div className="my-4">
                    <p className="font-body text-base text-primary text-center mb-2">
                        OVERALL PROGRESS: {completed} / {total} TASKS
                    </p>
                    <div className="h-4 w-full border-2 border-primary p-0.5">
                        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercent}%`}} />
                    </div>
                </div>

                <div className="space-y-4">
                    {QUESTS.map(quest => (
                        <QuestCard key={quest.id} quest={quest} />
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}
