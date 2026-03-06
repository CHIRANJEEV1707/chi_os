
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useWindowStore } from '@/store/windowStore';
import { getPageComponent } from '.';
import { ArrowLeft, ArrowRight, Play, Pause, Maximize, Minimize } from 'lucide-react';
import { useSoundEffect } from '@/hooks/useSoundEffect';

// --- SLIDE COMPONENTS ---

const Slide1 = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center bg-black relative p-4">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <h1 className="font-headline text-lg md:text-xl text-amber-400">SERIES A</h1>
        <p className="font-headline text-sm md:text-base mt-2">HIRING: CHIRANJEEV AGARWAL</p>
        <p className="font-body text-xl md:text-2xl mt-4">Full Stack Developer & 2x Founder</p>
        <p className="font-body text-base md:text-lg text-primary/70 mt-1">New Delhi, India • 2025</p>
        <div className="absolute bottom-4 right-4 font-headline text-2xl text-primary" style={{ filter: 'grayscale(1) brightness(1.5) sepia(1) hue-rotate(60deg) saturate(7)'}}>&gt;_</div>
    </div>
);

const Slide2 = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 md:p-8">
        <h2 className="font-headline text-base md:text-lg text-destructive">THE PROBLEM</h2>
        <div className="mt-6 font-body text-lg md:text-xl space-y-4 max-w-lg">
            <p>Most developers can code.</p>
            <p>Most MBAs can strategize.</p>
            <p>Very few can do both <span className="text-amber-400">AND</span> have shipped real products.</p>
        </div>
        <div className="mt-8 font-body text-base md:text-lg text-amber-400/80 space-y-2 text-left">
            <p>&gt; Most portfolios are just a list of skills.</p>
            <p>&gt; This one is an operating system.</p>
        </div>
    </div>
);

const Slide3 = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
        <h2 className="font-headline text-base md:text-lg text-primary">THE SOLUTION</h2>
        <div className="w-20 h-20 border-2 border-primary bg-black/50 flex items-center justify-center my-4">
            <span className="font-headline text-2xl text-primary" style={{ filter: 'grayscale(1) brightness(1.5) sepia(1) hue-rotate(60deg) saturate(7)'}}>&gt;_</span>
        </div>
        <p className="font-headline text-sm md:text-base">CHIRANJEEV AGARWAL</p>
        <ul className="mt-4 font-body text-base md:text-lg text-left space-y-2">
            <li>✓ Builds products end-to-end</li>
            <li>✓ 2x founder with real market experience</li>
            <li>✓ Thinks in systems, ships in sprints</li>
            <li>✓ Made this entire OS to say hello</li>
        </ul>
    </div>
);

const TractionCard = ({ value, label }: { value: string, label: string}) => (
    <div className="p-4 border-2 border-primary/50 bg-black/30 text-center">
        <p className="font-headline text-2xl md:text-3xl text-amber-400">{value}</p>
        <p className="font-body text-sm md:text-base">{label}</p>
    </div>
)

const Slide4 = () => (
     <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
        <h2 className="font-headline text-base md:text-lg text-amber-400">TRACTION</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-md">
            <TractionCard value="2" label="STARTUPS FOUNDED"/>
            <TractionCard value="10+" label="PROJECTS SHIPPED"/>
            <TractionCard value="250+" label="GITHUB CONTRIBUTIONS"/>
            <TractionCard value="4" label="YEARS BUILDING"/>
        </div>
    </div>
);

const Slide5 = () => (
     <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
        <h2 className="font-headline text-sm md:text-base">PRODUCT THINKING</h2>
        <div className="mt-6 flex items-center justify-center gap-4 md:gap-8 font-headline text-center text-sm md:text-base">
            <div><p>IDENTIFY</p><p className="font-body text-sm text-primary/70">The Problem</p></div>
            <ArrowRight className="w-6 h-6 text-primary/50" />
            <div><p>BUILD</p><p className="font-body text-sm text-primary/70">The Solution</p></div>
            <ArrowRight className="w-6 h-6 text-primary/50" />
            <div><p>MEASURE</p><p className="font-body text-sm text-primary/70">The Impact</p></div>
        </div>
        <p className="font-body text-lg md:text-xl text-amber-400 mt-8 text-center max-w-lg">"I don't just build features. I build solutions to problems."</p>
    </div>
);

const TechLogo = ({ label }: {label: string}) => (
    <div className="w-16 h-12 flex items-center justify-center border border-primary/50 bg-black/30 font-body text-sm">{label}</div>
)

const Slide6 = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
        <h2 className="font-headline text-sm md:text-base">THE TECH STACK</h2>
        <div className="mt-4 space-y-2">
            <div className="flex justify-center gap-2">
                <TechLogo label="JS" />
                <TechLogo label="TS" />
                <TechLogo label="Python" />
            </div>
            <div className="flex justify-center gap-2">
                <TechLogo label="React" />
                <TechLogo label="Next" />
                <TechLogo label="Node" />
            </div>
             <div className="flex justify-center gap-2">
                <TechLogo label="Git" />
                <TechLogo label="Firebase" />
                <TechLogo label="Figma" />
            </div>
        </div>
        <p className="font-body text-base md:text-lg text-amber-400 mt-4 text-center">But honestly — I'll learn whatever the job needs.</p>
    </div>
);

const Slide7 = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
        <h2 className="font-headline text-sm md:text-base">FOUNDER MODE</h2>
        <div className="mt-4 flex gap-4">
            <div className="p-3 border-2 border-primary/50 bg-black/30 w-48">
                <p className="font-headline text-[8px] text-primary">VENTURE ALPHA</p>
                <p className="text-xs mt-1">Decentralized Asset Management</p>
                <p className="font-headline text-[6px] text-amber-400 mt-2">MVP</p>
            </div>
            <div className="p-3 border-2 border-primary/50 bg-black/30 w-48">
                <p className="font-headline text-[8px] text-primary">VENTURE BETA</p>
                <p className="text-xs mt-1">AI-Powered Life Coach</p>
                <p className="font-headline text-[6px] text-amber-400 mt-2">IDEATION</p>
            </div>
        </div>
        <p className="font-body text-base md:text-lg text-primary/80 mt-6 max-w-lg text-center">Running startups taught me more about product, users, and prioritization than any course ever could.</p>
    </div>
);

const Slide8 = () => (
     <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
        <div className="font-body text-base md:text-lg text-left max-w-lg space-y-2">
            <p className="font-headline text-base md:text-lg text-primary">WHY PRODUCT?</p>
            <p className="text-primary/70">&gt; Why not stay purely technical?</p>
            <p className="pl-4">Because I care more about <span className="text-amber-400">WHY</span> we build than <span className="text-amber-400">HOW</span> we build it.</p>
            <br/>
            <p className="text-primary/70">&gt; What do you bring to a PM role?</p>
            <p className="pl-4">Founder empathy. Technical depth.</p>
            <p className="pl-4">Bias for action. Comfort with ambiguity.</p>
        </div>
    </div>
);

const Slide9 = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 md:p-8">
        <h2 className="font-headline text-base md:text-lg text-amber-400">THE ASK</h2>
        <div className="mt-6 font-headline text-sm md:text-base space-y-2">
            <p>PRODUCT MANAGEMENT INTERNSHIP</p>
            <p className="text-primary/70">or</p>
            <p>GROWTH / PRODUCT GROWTH ROLE</p>
        </div>
        <p className="font-body text-lg md:text-xl text-primary/80 mt-6 max-w-md">6 months to show you what a founder-turned-PM can do for your product.</p>
    </div>
);

const Slide10 = ({ openContact }: {openContact: () => void}) => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 md:p-8 relative">
        <h2 className="font-headline text-base md:text-lg text-primary">LET'S TALK</h2>
        <div className="w-16 h-16 border-2 border-primary bg-black/50 flex items-center justify-center my-3">
            <span className="font-headline text-xl text-primary" style={{ filter: 'grayscale(1) brightness(1.5) sepia(1) hue-rotate(60deg) saturate(7)'}}>&gt;_</span>
        </div>
        <div className="font-body text-base text-left space-y-1">
            <p><span className="text-primary/70">&gt; email:</span> chiranjeev.agarwal@gmail.com</p>
            <p><span className="text-primary/70">&gt; linkedin:</span> /in/chiranjeev-agarwal</p>
            <p><span className="text-primary/70">&gt; github:</span> /chiranjeev-agarwal</p>
        </div>
        <button onClick={openContact} className="font-headline text-[8px] mt-4 px-4 py-2 border-2 border-primary bg-black/30 text-primary hover:bg-accent hover:text-accent-foreground">
            [ OPEN CONTACT FORM ]
        </button>
        <p className="absolute bottom-4 font-body text-sm text-primary/60 max-w-lg italic">P.S. You just sat through a pitch deck built inside a retro OS. Imagine what I'll do with your product roadmap.</p>
    </div>
);

const slides = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9, Slide10];

export default function PitchDeck() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isWiping, setIsWiping] = useState(false);
    const [progress, setProgress] = useState(0);
    const deckRef = useRef<HTMLDivElement>(null);
    const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    const { openWindow } = useWindowStore();
    const { play } = useSoundEffect();

    const totalSlides = slides.length;
    
    const handleNavigation = useCallback((direction: 'next' | 'prev' | number) => {
        setIsWiping(true);
        play('click');
        
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setProgress(0);

        setTimeout(() => {
            setCurrentSlide(prev => {
                if (typeof direction === 'number') return direction;
                if (direction === 'next') return (prev + 1) % totalSlides;
                return (prev - 1 + totalSlides) % totalSlides;
            });
            setIsWiping(false);
        }, 200);
    }, [play, totalSlides]);
    
    const startAutoPlay = useCallback(() => {
        setIsPlaying(true);
        setProgress(0);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = setInterval(() => {
            setProgress(p => p + (100 / 400)); // 100% over 4s
        }, 10);
        
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = setTimeout(() => {
            handleNavigation('next');
        }, 4000);
    }, [handleNavigation]);
    
    useEffect(() => {
        if(isPlaying) {
            startAutoPlay();
        }
        return () => {
            if(autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
            if(progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
    }, [isPlaying, currentSlide, startAutoPlay]);
    
    const togglePlay = () => {
        play('click');
        setIsPlaying(!isPlaying);
    }
    
    const toggleFullscreen = () => {
        if (!deckRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            deckRef.current.requestFullscreen();
        }
    }
    
    const openContactForm = () => {
        const ContactComponent = getPageComponent('contact');
        if (ContactComponent) {
            openWindow('contact', 'CONTACT.sh', <ContactComponent />);
        }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if(e.key === 'ArrowRight' || e.key === ' ') handleNavigation('next');
            else if (e.key === 'ArrowLeft') handleNavigation('prev');
            else if (e.key.toLowerCase() === 'f') toggleFullscreen();
            else if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
        }
        
        const currentRef = deckRef.current;
        currentRef?.addEventListener('keydown', handleKeyDown);
        return () => currentRef?.removeEventListener('keydown', handleKeyDown);
    }, [handleNavigation]);
    
    const ActiveSlide = slides[currentSlide];

    return (
        <div ref={deckRef} className="h-full w-full flex flex-col bg-black text-primary p-2 focus:outline-none" tabIndex={0}>
            {/* Toolbar */}
            <div className="flex-shrink-0 flex justify-between items-center px-2 py-1 font-headline text-[7px]">
                <p>SLIDE {String(currentSlide + 1).padStart(2, '0')}/{totalSlides}</p>
                <p>SERIES A: HIRE CHIRANJEEV</p>
                <div className="flex gap-2">
                    <button onClick={toggleFullscreen} className="border border-primary/50 px-1 hover:bg-accent hover:text-black">⛶ FULLSCREEN</button>
                    <button onClick={togglePlay} className="border border-primary/50 px-1 w-16 hover:bg-accent hover:text-black">
                        {isPlaying ? '⏸ PAUSE' : '▶ AUTO'}
                    </button>
                </div>
            </div>
            
            {/* Main content */}
            <div className="flex-grow flex items-center justify-center" onClick={() => handleNavigation('next')}>
                <div className="w-full aspect-video bg-[#000a00] border-2 border-primary relative">
                    {isPlaying && (
                        <div className="absolute top-0 left-0 h-1 bg-primary/30 w-full">
                             <div className="h-full bg-primary" style={{width: `${progress}%`}}/>
                        </div>
                    )}
                    {isWiping && (
                        <div className="absolute inset-0 bg-primary z-20" style={{ animation: 'slide-wipe 0.2s ease-in-out' }} />
                    )}
                    <ActiveSlide openContact={openContactForm} />
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2 mt-2">
                <div className="flex items-center gap-4">
                     <button onClick={() => handleNavigation('prev')} className="font-headline text-[7px] px-2 py-1 border border-primary/50 hover:bg-accent hover:text-black">◀ PREV</button>
                     <button onClick={() => handleNavigation('next')} className="font-headline text-[7px] px-2 py-1 border border-primary/50 hover:bg-accent hover:text-black">NEXT ▶</button>
                </div>
                 <div className="flex items-center gap-2">
                    {slides.map((_, i) => (
                        <button key={i} onClick={() => handleNavigation(i)}>
                            <div className={cn("w-2 h-2 rounded-full", i === currentSlide ? 'bg-primary' : 'border border-primary/50')}/>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
