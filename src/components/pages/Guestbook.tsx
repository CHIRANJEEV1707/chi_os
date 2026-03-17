'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useAchievementStore } from '@/store/achievementStore';
import { useQuestStore } from '@/store/questStore';
import { useGuestbook, GuestbookEntry } from '@/lib/hooks/useGuestbook';
import { formatDistanceToNowStrict } from 'date-fns';
import { X } from 'lucide-react';

const guestbookSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  message: z.string().min(1, 'Message is required').max(200),
  location: z.string().max(50).optional(),
  handle: z.string().max(50).optional(),
});
type GuestbookFormData = z.infer<typeof guestbookSchema>;

const generatePixelatedHash = (name: string): number[] => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const grid: number[] = [];
    for (let i = 0; i < 32; i++) {
        grid.push((hash >> i) & 1);
    }
    return grid;
};

const PixelAvatar = ({ name, size = 32 }: { name: string, size?: number }) => {
    const grid = generatePixelatedHash(name);
    const pixelSize = size / 8;
    return (
        <div className="flex flex-wrap" style={{ width: size, height: size }}>
            {Array.from({ length: 8 }).map((_, r) =>
                Array.from({ length: 8 }).map((_, c) => {
                    const idx = r * 4 + (c < 4 ? c : 3 - (c % 4));
                    const isFilled = grid[idx] === 1;
                    return <div key={`${r}-${c}`} style={{ width: pixelSize, height: pixelSize }} className={isFilled ? 'bg-primary' : 'bg-transparent'} />;
                })
            )}
        </div>
    );
};

const BadgeModal = ({ badgeData, onClose }: { badgeData: any; onClose: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<'generating' | 'done'>('generating');

    useEffect(() => {
        const timer = setTimeout(() => setStatus('done'), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (status !== 'done' || !canvasRef.current) return;
        const { name, message, location, visitorNum } = badgeData;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = '#000a00';
        ctx.fillRect(0, 0, 400, 200);
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 398, 198);
        ctx.fillStyle = '#00ff41';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('CHIRU-OS', 16, 24);
        ctx.fillStyle = '#ffb300';
        ctx.fillText(`VISITOR #${String(visitorNum).padStart(3,'0')}`, 290, 24);
        
        ctx.strokeStyle = '#002800';
        ctx.beginPath();
        ctx.moveTo(16, 32);
        ctx.lineTo(384, 32);
        ctx.stroke();

        const avatarGrid = generatePixelatedHash(name);
        for(let r=0; r<8; r++) for(let c=0; c<8; c++){
            const idx = r * 4 + (c < 4 ? c : 3 - (c % 4));
            if(avatarGrid[idx] === 1) {
                ctx.fillStyle = '#00ff41';
                ctx.fillRect(16 + c * 4, 48 + r * 4, 4, 4);
            }
        }
        
        ctx.fillStyle = '#00ff41';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(name.toUpperCase(), 64, 68);
        ctx.fillStyle = '#00b32c';
        ctx.font = '10px monospace';
        const truncated = message.length > 60 ? message.slice(0, 60) + '...' : message;
        ctx.fillText(`"${truncated}"`, 64, 88);
        if (location) {
            ctx.fillStyle = '#007700';
            ctx.font = '9px monospace';
            ctx.fillText(location, 64, 108);
        }

        ctx.strokeStyle = '#002800';
        ctx.beginPath();
        ctx.moveTo(16, 162);
        ctx.lineTo(384, 162);
        ctx.stroke();
        ctx.fillStyle = '#004400';
        ctx.font = '9px monospace';
        ctx.fillText('Visited chiruos.vercel.app', 16, 180);
        ctx.fillText(new Date().toLocaleDateString(), 310, 180);
    }, [status, badgeData]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `chiru-os-visitor-${badgeData.name.replace(/\s+/g, '_')}-${badgeData.visitorNum}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleShare = () => {
        const text = `I just signed the CHIRU-OS Guestbook as Visitor #${String(badgeData.visitorNum).padStart(3,'0')}! 🖥️\n\nCheck it out: https://chiruos.vercel.app`;
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-window-bg border-2 border-amber-400 p-4 text-center flex flex-col items-center relative">
                {status === 'generating' ? (
                    <>
                        <p className="font-headline text-[8px] text-green-400">&gt; TRANSMISSION RECEIVED!</p>
                        <p className="font-body text-lg my-4 text-primary">GENERATING YOUR VISITOR BADGE...</p>
                        <div className="w-full h-4 bg-black border border-primary/50"><div className="h-full bg-primary animate-pulse w-1/2"></div></div>
                    </>
                ) : (
                    <>
                        <canvas ref={canvasRef} width={400} height={200} className="border-2 border-primary" style={{boxShadow: '0 0 15px hsl(var(--primary))'}} />
                        <div className="mt-4 flex gap-2">
                             <button onClick={handleDownload} className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">[ ⬇ DOWNLOAD BADGE ]</button>
                             <button onClick={handleShare} className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">[ 🔗 SHARE ]</button>
                        </div>
                    </>
                )}
                 <button onClick={onClose} className="absolute top-2 right-2 text-primary/50 hover:text-primary"><X size={16} /></button>
            </div>
        </div>
    );
};


export default function Guestbook() {
    const { unlock } = useAchievementStore();
    const { completeTask } = useQuestStore();
    const { play } = useSoundEffect();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<GuestbookFormData>({
        resolver: zodResolver(guestbookSchema)
    });
    const { entries, loading, addEntry } = useGuestbook();
    const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
    const [badgeData, setBadgeData] = useState<any | null>(null);

    const onSubmit: SubmitHandler<GuestbookFormData> = async (data) => {
        setStatus('submitting');
        play('success');
        try {
            const result = await addEntry({
                name: data.name,
                message: data.message,
                location: data.location || undefined,
            });
            unlock('signed');
            completeTask('sign_guestbook');
            setBadgeData({ ...data, visitorNum: result.visitorNum || result.visitor_num });
            reset();
        } catch (error) {
            console.error("Error signing guestbook:", error);
            play('error');
        } finally {
            setStatus('idle');
        }
    };
    
    const handleFormError = () => play('error');

    if (loading) {
        return (
            <div className="p-4 font-body h-full flex items-center justify-center">
                <p className="text-primary text-lg animate-pulse">&gt; LOADING GUESTBOOK...<span className="ml-1">█</span></p>
            </div>
        );
    }

    return (
        <div className="p-4 font-body h-full flex flex-col">
            {badgeData && <BadgeModal badgeData={badgeData} onClose={() => setBadgeData(null)} />}
            <header className="flex-shrink-0">
                <h1 className="font-headline text-lg text-primary">GUESTBOOK.log</h1>
                <p className="mt-2 text-sm text-primary/80">&gt; {entries.length} SIGNATURES LOGGED. LEAVE YOUR MARK.</p>
            </header>
            <form onSubmit={handleSubmit(onSubmit, handleFormError)} className="my-4 flex flex-col gap-2 flex-shrink-0">
                <input {...register('name')} placeholder="Your Name" className="bg-input border border-primary/50 p-2 text-primary outline-none focus:border-accent" />
                {errors.name && <p className="text-destructive text-sm">&gt; {errors.name.message}</p>}
                <input {...register('location')} placeholder="Location (e.g., City, Country)" className="bg-input border border-primary/50 p-2 text-primary outline-none focus:border-accent" />
                <textarea {...register('message')} placeholder="Your message... (max 200 chars)" rows={3} className="bg-input border border-primary/50 p-2 text-primary outline-none resize-none focus:border-accent" />
                {errors.message && <p className="text-destructive text-sm">&gt; {errors.message.message}</p>}
                <button type="submit" disabled={status === 'submitting'} className="font-headline text-[8px] p-2 border-2 border-primary bg-black/30 text-primary hover:bg-accent hover:text-accent-foreground disabled:opacity-50">
                    {status === 'submitting' ? 'TRANSMITTING...' : '[ SIGN GUESTBOOK ]'}
                </button>
            </form>

            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                {entries.map((entry: GuestbookEntry) => (
                    <div key={entry.id} className="p-3 bg-[#000a00] border border-[#002200] border-l-4 border-primary/70">
                         <div className="flex justify-between items-center text-primary/70 mb-1">
                            <p className="font-headline text-[8px]">
                                <span className="text-amber-400">#{String(entry.visitor_num || 0).padStart(3, '0')}</span> {entry.name}
                                {entry.location && <span className="text-primary/50"> from {entry.location}</span>}
                            </p>
                            <p className="text-xs">{entry.created_at ? formatDistanceToNowStrict(new Date(entry.created_at), { addSuffix: true }) : 'just now'}</p>
                         </div>
                         <p className="font-body text-base text-primary/90 ml-4">"{entry.message}"</p>
                         <div className="flex items-center gap-2 mt-2 ml-4">
                            <div className="w-8 h-8 bg-black border border-primary/30 p-0.5"><PixelAvatar name={entry.name} size={28} /></div>
                            <button className="font-headline text-[7px] text-amber-400/70 hover:text-amber-400">[🏅 VIEW BADGE]</button>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
