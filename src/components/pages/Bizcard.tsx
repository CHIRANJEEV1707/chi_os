
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useAchievementStore } from '@/store/achievementStore';
import { useQuestStore } from '@/store/questStore';
import { Download, Link as LinkIcon, Check, PartyPopper } from 'lucide-react';

type CardStyle = 'TERMINAL' | 'MATRIX' | 'MINIMAL';

// --- Card Style Components ---

const TerminalCard = () => (
    <div id="bizcard-preview" className="w-[340px] h-[190px] bg-[#000a00] border-2 border-primary p-3 flex flex-col justify-between relative overflow-hidden text-primary">
        <div className="absolute inset-0 scanlines opacity-30 pointer-events-none"></div>
        <header className="flex justify-between items-start">
            <span className="font-headline text-lg" style={{ filter: 'grayscale(1) brightness(1.5) sepia(1) hue-rotate(60deg) saturate(7)'}}>&gt;_</span>
            <div className="w-12 h-12 bg-[#001a00] border-2 border-primary/50 flex items-center justify-center font-headline text-[8px] text-primary/50">QR</div>
        </header>
        <main>
            <h1 className="font-headline text-[10px]">CHIRANJEEV AGARWAL</h1>
            <p className="font-body text-sm">Full Stack Developer & 2x Founder</p>
            <div className="w-full h-px bg-primary/50 my-1"></div>
            <div className="font-body text-[11px] grid grid-cols-2 gap-x-2">
                <span>📍 New Delhi, India</span>
                <span>✉️ chiranjeev.agarwal@gmail.com</span>
                <span>🐙 github.com/chiranjeev-agarwal</span>
                <span>💼 linkedin.com/in/chiranjeev-agarwal</span>
            </div>
        </main>
        <footer className="text-center font-body text-xs italic text-primary/80">
            "Building products people love"
        </footer>
    </div>
);

const MatrixCard = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const characters = katakana + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const fontSize = 10;
        const columns = width / fontSize;
        const drops = Array.from({ length: columns }).map(() => 1);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#00b32c';
            ctx.font = `${fontSize}px VT323`;
            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        const intervalId = setInterval(draw, 50);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div id="bizcard-preview" className="w-[340px] h-[190px] bg-black border-2 border-[#39ff14] p-3 flex flex-col justify-between relative overflow-hidden text-primary">
            <canvas ref={canvasRef} width={336} height={186} className="absolute top-0 left-0" />
            <div className="relative z-10 flex flex-col justify-between h-full">
                <header className="flex justify-between items-start">
                    <span className="font-headline text-lg text-[#39ff14]" style={{ filter: 'drop-shadow(0 0 4px #39ff14)'}}>&gt;_</span>
                    <div className="w-12 h-12 bg-black/50 border-2 border-[#39ff14]/50 flex items-center justify-center font-headline text-[8px] text-[#39ff14]/50">QR</div>
                </header>
                <main>
                    <h1 className="font-headline text-[10px] text-[#39ff14]" style={{ filter: 'drop-shadow(0 0 3px #39ff14)'}}>CHIRANJEEV AGARWAL</h1>
                    <p className="font-body text-sm text-[#00b32c]">Full Stack Developer & 2x Founder</p>
                    <div className="w-full h-px bg-[#39ff14]/50 my-1"></div>
                    <div className="font-body text-[11px] grid grid-cols-2 gap-x-2 text-[#00b32c]">
                         <span>📍 New Delhi, India</span>
                         <span>✉️ chiranjeev.agarwal@gmail.com</span>
                         <span>🐙 github.com/chiranjeev-agarwal</span>
                         <span>💼 linkedin.com/in/chiranjeev-agarwal</span>
                    </div>
                </main>
                <footer className="text-center font-body text-xs italic text-[#00b32c]/80">
                    "Building products people love"
                </footer>
            </div>
        </div>
    );
}

const MinimalCard = () => (
    <div id="bizcard-preview" className="w-[340px] h-[190px] bg-[#0a0a0a] border-2 border-primary/30 p-3 flex flex-col justify-between relative overflow-hidden">
         <header className="flex justify-between items-start">
            <span className="font-headline text-lg text-primary/70">&gt;_</span>
            <div className="w-12 h-12 bg-black/50 border-2 border-primary/20 flex items-center justify-center font-headline text-[8px] text-primary/30">QR</div>
        </header>
         <main>
            <h1 className="font-headline text-lg text-primary">CHIRANJEEV AGARWAL</h1>
            <div className="w-1/2 h-px bg-primary my-1"></div>
            <p className="font-body text-base text-primary/80">Full Stack Developer & 2x Founder</p>
            <div className="font-body text-[10px] grid grid-cols-2 gap-x-2 mt-2 text-primary/60">
                <span>📍 New Delhi, India</span>
                <span>✉️ chiranjeev.agarwal@gmail.com</span>
                <span>🐙 github.com/chiranjeev-agarwal</span>
                <span>💼 linkedin.com/in/chiranjeev-agarwal</span>
            </div>
        </main>
        <footer className="text-center font-body text-xs text-primary/50">
            "Building products people love"
        </footer>
    </div>
);


export default function Bizcard() {
    const { play } = useSoundEffect();
    const { unlock } = useAchievementStore();
    const { completeTask } = useQuestStore();
    const [style, setStyle] = useState<CardStyle>('TERMINAL');
    const [downloadStatus, setDownloadStatus] = useState<'idle' | 'generating' | 'done'>('idle');
    const [copyStatus, setCopyStatus] = useState(false);
    
    const changeStyle = (newStyle: CardStyle) => {
        play('click');
        setStyle(newStyle);
    }

    const downloadCard = async () => {
        play('click');
        setDownloadStatus('generating');
        await new Promise(r => setTimeout(r, 800));

        const cardEl = document.getElementById('bizcard-preview');
        if (!cardEl) return;
        
        try {
            const canvas = await html2canvas(cardEl, { scale: 2, backgroundColor: null, useCORS: true });
            const link = document.createElement('a');
            link.download = 'chiranjeev-agarwal-bizcard.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            play('success');
            setDownloadStatus('done');
            unlock('business_card');
            completeTask('generate_card');

        } catch (error) {
            console.error("Error generating canvas:", error);
            play('error');
            setDownloadStatus('idle');
        } finally {
            setTimeout(() => setDownloadStatus('idle'), 1500);
        }
    };
    
    const copyLink = () => {
        play('click');
        navigator.clipboard.writeText('https://chiruos.vercel.app');
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    };
    
    const renderCard = () => {
        switch (style) {
            case 'MATRIX': return <MatrixCard />;
            case 'MINIMAL': return <MinimalCard />;
            case 'TERMINAL':
            default:
                return <TerminalCard />;
        }
    }
    
    const downloadButtonText = {
        idle: <> <Download size={10} /> DOWNLOAD CARD.png </>,
        generating: 'GENERATING...',
        done: <> <PartyPopper size={10} /> DOWNLOADED! </>
    }

    return (
        <div className="p-4 font-body h-full flex flex-col items-center justify-center gap-4 text-center">
            <header className="text-center">
                <p className="font-headline text-[7px] text-muted-foreground">&gt; BIZCARD GENERATOR v1.0</p>
                <p className="font-body text-sm text-primary/80">&gt; SELECT STYLE AND GENERATE</p>
            </header>

            <div className={cn("transition-opacity duration-200")}>
                {renderCard()}
            </div>

            <div className="flex gap-2">
                {(['TERMINAL', 'MATRIX', 'MINIMAL'] as CardStyle[]).map(s => (
                    <button 
                        key={s} 
                        onClick={() => changeStyle(s)}
                        className={cn("font-headline text-[7px] p-2 border-2", 
                            style === s 
                                ? 'bg-primary text-black border-primary' 
                                : 'border-primary/50 text-primary hover:bg-accent hover:text-black'
                        )}
                    >
                        [{s}]
                    </button>
                ))}
            </div>

            <div className="w-[340px] flex flex-col gap-2 mt-2">
                <button
                    onClick={downloadCard}
                    disabled={downloadStatus !== 'idle'}
                    className="w-full font-headline text-[7px] p-2 border-2 border-primary bg-black/30 text-primary hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                   {downloadButtonText[downloadStatus]}
                </button>
                <button onClick={copyLink} className="w-full font-headline text-[7px] p-2 border-2 border-primary/50 bg-black/30 text-primary/70 hover:bg-accent hover:text-accent-foreground flex items-center justify-center gap-2">
                     {copyStatus ? <><Check size={10}/> LINK COPIED!</> : <><LinkIcon size={10}/> COPY SHARE LINK</>}
                </button>
            </div>
        </div>
    );
}
