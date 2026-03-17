'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Link as LinkIcon, Check } from 'lucide-react';
import { useThoughts, ThoughtEntry } from '@/lib/hooks/useThoughts';
import { formatDistanceToNow } from 'date-fns';
import { useSoundEffect } from '@/hooks/useSoundEffect';

type ThoughtCategory = 'PRODUCT' | 'STARTUPS' | 'TECH' | 'RANDOM';
type Filter = ThoughtCategory | 'ALL';

const categoryStyles: Record<string, { color: string, border: string }> = {
    product: { color: 'hsl(var(--primary))', border: 'border-primary' },
    startups: { color: 'hsl(var(--accent))', border: 'border-accent' },
    tech: { color: 'hsl(180 100% 50%)', border: 'border-cyan-400' },
    random: { color: 'hsl(var(--destructive))', border: 'border-destructive' },
    PRODUCT: { color: 'hsl(var(--primary))', border: 'border-primary' },
    STARTUPS: { color: 'hsl(var(--accent))', border: 'border-accent' },
    TECH: { color: 'hsl(180 100% 50%)', border: 'border-cyan-400' },
    RANDOM: { color: 'hsl(var(--destructive))', border: 'border-destructive' },
}

const useLikes = () => {
    const [likes, setLikes] = useState<Record<string, number>>({});
    const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});

    useEffect(() => {
        try {
            const storedLikes = localStorage.getItem('chiru-thoughts-likes');
            const likedMap = storedLikes ? JSON.parse(storedLikes) : {};
            setUserLiked(likedMap);
        } catch (e) {
            console.error('Failed to parse likes from localStorage', e);
        }
    }, []);

    const initLikes = (thoughtIds: string[]) => {
        setLikes(prev => {
            const newLikes = { ...prev };
            thoughtIds.forEach(id => {
                if (!(id in newLikes)) {
                    newLikes[id] = Math.floor(id.length + Math.random() * 5);
                }
            });
            return newLikes;
        });
    };

    const toggleLike = (thoughtId: string) => {
        if (userLiked[thoughtId]) return;

        setUserLiked(prev => {
            const newLiked = { ...prev, [thoughtId]: true };
            try {
                localStorage.setItem('chiru-thoughts-likes', JSON.stringify(newLiked));
            } catch (e) {
                 console.error('Failed to save likes to localStorage', e);
            }
            return newLiked;
        });

        setLikes(prev => ({
            ...prev,
            [thoughtId]: (prev[thoughtId] || 0) + 1
        }));
    };

    return { likes, userLiked, toggleLike, initLikes };
}

const ThoughtCard = ({ thought, onLike, onShare, likeCount, isLiked, isNew }: { 
    thought: ThoughtEntry, 
    onLike: () => void, 
    onShare: () => void, 
    likeCount: number, 
    isLiked: boolean,
    isNew: boolean
}) => {
    const [showCopied, setShowCopied] = useState(false);
    const { play } = useSoundEffect();
    const style = categoryStyles[thought.category] || categoryStyles['random'];
    
    const handleShare = () => {
        play('click');
        onShare();
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    }
    
    const handleLike = () => {
        if (!isLiked) {
            play('click');
            onLike();
        }
    }

    return (
        <div className={cn(
            "p-3 bg-[#000a00] border border-[#002200] border-l-4",
            style.border,
            isNew && 'animate-in fade-in-0 slide-in-from-top-5 duration-500'
        )}>
            {isNew && <p className="font-headline text-[6px] text-green-400 mb-1 animate-pulse">&gt; NEW ENTRY</p>}
            <div className="flex justify-between items-center mb-2">
                <span className="font-headline text-[7px] border px-1.5 py-0.5" style={{ color: style.color, borderColor: style.color }}>{thought.category.toUpperCase()}</span>
                <span className="font-body text-xs text-primary/50">{formatDistanceToNow(new Date(thought.created_at), { addSuffix: true })}</span>
            </div>
            <p className="font-body text-lg text-primary/90 leading-relaxed">{thought.content}</p>
            <div className="mt-3 pt-2 border-t border-dashed border-[#002200] flex items-center justify-between text-xs font-headline">
                <button 
                    onClick={handleLike} 
                    className={cn(
                        "flex items-center gap-1.5 text-primary/60",
                        !isLiked && "hover:text-red-400",
                        isLiked && "text-red-400 cursor-default"
                    )}
                >
                    <Heart size={14} className={cn(isLiked && "fill-current")} /> {likeCount}
                </button>
                <button onClick={handleShare} className="flex items-center gap-1.5 text-primary/60 hover:text-cyan-400">
                    {showCopied ? <><Check size={14}/> COPIED</> : <><LinkIcon size={14}/> SHARE</>}
                </button>
            </div>
        </div>
    );
};


export default function Thoughts() {
    const { thoughts: fetchedThoughts, loading } = useThoughts();
    const [displayedThoughts, setDisplayedThoughts] = useState<ThoughtEntry[]>([]);
    const [filter, setFilter] = useState<Filter>('ALL');
    const { likes, userLiked, toggleLike, initLikes } = useLikes();
    const thoughtQueue = useRef<ThoughtEntry[]>([]);
    const initialized = useRef(false);

    // Initialize display once fetched
    useEffect(() => {
        if (fetchedThoughts.length > 0 && !initialized.current) {
            initialized.current = true;
            const initial = fetchedThoughts.slice(0, 4);
            setDisplayedThoughts(initial);
            thoughtQueue.current = fetchedThoughts.slice(4);
            initLikes(fetchedThoughts.map(t => t.id));
        }
    }, [fetchedThoughts, initLikes]);

    // Rotating "live feed" interval
    useEffect(() => {
        const interval = setInterval(() => {
            if (thoughtQueue.current.length > 0) {
                const nextThought = thoughtQueue.current.shift()!;
                setDisplayedThoughts(prev => [nextThought, ...prev]);
                thoughtQueue.current.push(nextThought);
            }
        }, 45000);

        return () => clearInterval(interval);
    }, []);

    const filteredThoughts = useMemo(() => {
        if (filter === 'ALL') return displayedThoughts;
        return displayedThoughts.filter(t => t.category.toUpperCase() === filter);
    }, [displayedThoughts, filter]);

    const handleShare = (thought: ThoughtEntry) => {
        const text = `"${thought.content}"\n\n— Chiranjeev Agarwal\nRead more: https://chiruos.vercel.app`;
        navigator.clipboard.writeText(text);
    };

    if (loading) {
        return (
            <div className="p-4 font-body h-full flex items-center justify-center">
                <p className="text-primary text-lg animate-pulse">&gt; LOADING THOUGHTS...<span className="ml-1">█</span></p>
            </div>
        );
    }

    return (
        <div className="p-2 font-body h-full flex flex-col">
            <header className="flex-shrink-0">
                <p className="font-headline text-[7px] text-muted-foreground">&gt; tail -f thoughts.log <span className="animate-pulse">█</span></p>
                <p className="font-body text-sm text-primary/80">&gt; LIVE FEED — CHIRANJEEV'S BRAIN</p>
                <div className="mt-2 border-b-2 border-primary/30 flex items-center">
                    {(['ALL', 'PRODUCT', 'STARTUPS', 'TECH', 'RANDOM'] as Filter[]).map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)}
                            className={cn('px-3 py-1 font-headline text-[7px] border-b-2 transition-colors',
                                filter === f ? 'bg-black/30 border-primary text-primary' : 'border-transparent text-primary/70 hover:bg-black/20'
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-grow overflow-y-auto space-y-3 py-3 pr-1">
                {filteredThoughts.map((thought, index) => (
                    <ThoughtCard 
                        key={`${thought.id}-${displayedThoughts.length}`} 
                        thought={thought}
                        onLike={() => toggleLike(thought.id)}
                        onShare={() => handleShare(thought)}
                        likeCount={likes[thought.id] || 0}
                        isLiked={!!userLiked[thought.id]}
                        isNew={index === 0 && displayedThoughts.length > 4}
                    />
                ))}
            </main>

            <footer className="flex-shrink-0 text-center border-t-2 border-primary/30 pt-2 font-body text-sm text-primary/70">
                <p>&gt; {displayedThoughts.length} THOUGHTS LOGGED SO FAR</p>
                <p>Want to discuss any of these? → <span className="underline">CONTACT.sh</span></p>
            </footer>
        </div>
    );
}
