
'use client';
import { useState } from 'react';
import { useAchievementStore } from '@/store/achievementStore';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useQuestStore } from '@/store/questStore';

export default function Guestbook() {
    const { unlock } = useAchievementStore();
    const { completeTask } = useQuestStore();
    const { play } = useSoundEffect();
    const [name, setName] = useState('');
    const [message, setMessage] =useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim()) {
            play('error');
            return;
        }
        play('success');
        unlock('signed');
        completeTask('sign_guestbook');
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="p-4 font-body h-full flex flex-col items-center justify-center text-center">
                <h1 className="font-headline text-lg text-primary">THANK YOU!</h1>
                <p className="mt-2 text-primary/80">Your signature has been recorded in the annals of CHIRU-OS.</p>
            </div>
        );
    }

    return (
        <div className="p-4 font-body h-full">
            <h1 className="font-headline text-lg text-primary">GUESTBOOK.log</h1>
            <p className="mt-2 text-sm text-primary/80">Leave your mark. Let the system know you were here.</p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label htmlFor="guest-name" className="font-headline text-[8px] text-primary/70">NAME:</label>
                    <input id="guest-name" value={name} onChange={e => setName(e.target.value)} className="bg-input border border-primary/50 p-2 text-primary outline-none focus:border-accent" />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="guest-message" className="font-headline text-[8px] text-primary/70">MESSAGE:</label>
                    <textarea id="guest-message" value={message} onChange={e => setMessage(e.target.value)} rows={4} className="bg-input border border-primary/50 p-2 text-primary outline-none resize-none focus:border-accent" />
                </div>
                <button type="submit" className="font-headline text-[8px] p-2 border-2 border-primary bg-black/30 text-primary hover:bg-accent hover:text-accent-foreground">
                    [ SIGN GUESTBOOK ]
                </button>
            </form>
        </div>
    );
}
