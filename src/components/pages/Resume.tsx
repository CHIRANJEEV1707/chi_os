'use client';

import { Download, Printer, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSoundEffect } from '@/hooks/useSoundEffect';

// --- Reusable Data (from Experience.tsx) ---
const experienceData = [
  {
    id: 'exp1',
    date: '2023-06 → 2023-08',
    company: 'TechCorp Solutions',
    role: 'Frontend Developer Intern',
    description: [
      'Built responsive React components serving 10k+ users',
      'Reduced page load time by 40% through lazy loading',
    ],
  },
  {
    id: 'exp2',
    date: '2022-12 → 2023-02',
    company: 'StartupXYZ',
    role: 'Full Stack Developer Intern',
    description: [
      'Developed RESTful APIs using Node.js and Express',
      'Integrated Firebase authentication and Firestore database',
    ],
  },
  {
    id: 'exp3',
    date: '2022-06 → 2022-08',
    company: 'FreelanceProject',
    role: 'Web Developer',
    description: [
      'Designed and developed 4 client websites from scratch',
      'Implemented SEO best practices increasing organic traffic by 60%',
    ],
  },
];

const projectsData = [
    { name: 'RetroPortfolio OS', description: 'A pixel-art retro OS themed personal portfolio.' },
    { name: 'PixelChat App', description: 'Real-time chat application with pixel art UI.' },
    { name: 'CodeQuest', description: 'AI-powered coding challenge platform.' },
];

const skills = [
    'JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js',
    'Tailwind CSS', 'Firebase', 'MongoDB', 'PostgreSQL', 'Docker', 'Git'
];


const ResumeSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
            <h2 className="font-headline text-[8px] text-primary whitespace-nowrap">[ {title} ]</h2>
            <div className="w-full border-t-2 border-dotted border-primary/50"></div>
        </div>
        {children}
    </div>
);


const PrintModal = ({ onClose }: { onClose: () => void }) => {
    const [typing, setTyping] = useState(true);
    const [showCard, setShowCard] = useState(false);
    const { play } = useSoundEffect();

    useEffect(() => {
        play('success');
        const timer1 = setTimeout(() => setTyping(false), 1400);
        const timer2 = setTimeout(() => setShowCard(true), 1500);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [play]);

    const handlePrint = () => {
        play('click');
        window.print();
    }
    
    const handleClose = () => {
        play('windowClose');
        onClose();
    }

    return (
        <div className="print-modal-overlay fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center p-4">
            <div className="text-center text-primary font-headline">
                {typing && <p className="type-in text-lg">&gt; INITIATING PRINT PROTOCOL...</p>}
                {!typing && !showCard && <div className="h-7"></div>}

                <div className={cn(
                    "printable-card-container opacity-0 transition-opacity duration-500",
                    showCard && "opacity-100"
                )}>
                    <div className="printable-card-wrapper">
                        {/* The Cube Layout */}
                        <div className="printable-card-grid">
                            <div className="card-panel panel-1">
                                <h3 className='font-headline text-lg'>CHIRU-OS</h3>
                                <p>C. Agarwal</p>
                            </div>
                            <div className="card-panel panel-2">
                                <h3 className="text-base">Skills</h3>
                                <p className='text-xs'>React, Next.js, Node.js, Python, TypeScript, Firebase, Tailwind, MongoDB</p>
                            </div>
                            <div className="card-panel panel-3">
                                <div className="w-20 h-20 border-2 border-primary bg-black/50 flex items-center justify-center mb-2">
                                    <span className="font-headline text-2xl text-primary" style={{ filter: 'grayscale(1) brightness(1.5) sepia(1) hue-rotate(60deg) saturate(7)'}}>&gt;_</span>
                                </div>
                                <h3 className='text-lg'>Chiranjeev A.</h3>
                                <p>Full Stack Dev</p>
                            </div>
                            <div className="card-panel panel-4">
                                <h3 className="text-base">Projects</h3>
                                <ul className='text-xs list-disc list-inside text-left'>
                                    <li>RetroPortfolio OS</li>
                                    <li>PixelChat App</li>
                                    <li>CodeQuest AI</li>
                                </ul>
                            </div>
                             <div className="card-panel panel-5">
                                <h3 className="text-base">Contact</h3>
                                <p className='text-[10px]'>chiranjeev.agarwal @gmail.com</p>
                                <div className='w-16 h-16 bg-primary/20 mt-2 border border-primary flex items-center justify-center text-primary/50 text-xs'>QR</div>
                            </div>
                            <div className="card-panel panel-6">
                                <h3 className="text-base">Secret</h3>
                                <p className='text-xs'>You found the secret foldable resume!</p>
                            </div>
                        </div>
                    </div>

                    <div className="print-modal-controls mt-8 flex items-center justify-center gap-4">
                         <button onClick={handlePrint} className="font-headline text-[7px] flex items-center gap-1 border-2 border-primary/50 px-2 py-1 text-primary hover:bg-accent hover:text-accent-foreground">
                            <Printer size={10} /> PRINT THIS
                        </button>
                        <button onClick={handleClose} className="font-headline text-[7px] flex items-center gap-1 border-2 border-primary/50 px-2 py-1 text-primary hover:bg-accent hover:text-accent-foreground">
                            <X size={10} /> CANCEL
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function Resume() {
    const { play } = useSoundEffect();
    const [showPrintModal, setShowPrintModal] = useState(false);

    const handleDownload = () => {
        play('click');
        window.open('/resume/chiranjeev-agarwal-resume.pdf', '_blank');
    };

    const handlePrint = () => {
        play('click');
        window.print();
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.ctrlKey && event.key.toLowerCase() === 'p') {
            event.preventDefault();
            play('success');
            setShowPrintModal(true);
          }
          if (event.key === 'Escape' && showPrintModal) {
            setShowPrintModal(false);
          }
        };
    
        window.addEventListener('keydown', handleKeyDown);
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showPrintModal, play]);


    return (
      <div className="p-1 font-body h-full flex flex-col overflow-hidden">
        {showPrintModal && <PrintModal onClose={() => setShowPrintModal(false)} />}
        
        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between bg-black/30 border-b-2 border-primary px-2 py-1">
            <p className="font-headline text-[7px] text-primary">&gt; RESUME.pdf</p>
            <div className="flex items-center gap-2">
                 <button onClick={handleDownload} className="font-headline text-[7px] flex items-center gap-1 border-2 border-primary/50 px-2 py-1 text-primary hover:bg-accent hover:text-accent-foreground">
                    <Download size={10} /> DOWNLOAD.exe
                </button>
                 <button onClick={handlePrint} className="font-headline text-[7px] flex items-center gap-1 border-2 border-primary/50 px-2 py-1 text-primary hover:bg-accent hover:text-accent-foreground">
                    <Printer size={10} /> PRINT.exe
                </button>
            </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-grow overflow-y-auto bg-background/50">
            <div className="mx-auto max-w-3xl p-4 md:p-8 bg-black/50 text-primary">
                {/* Header */}
                <header className="text-center mb-6">
                    <h1 className="font-headline text-sm md:text-base text-primary mb-1">CHIRANJEEV AGARWAL</h1>
                    <p className="font-body text-base md:text-lg text-primary/80 mb-2">Full Stack Developer | New Delhi, India</p>
                    <p className="font-body text-sm text-primary/70 flex flex-wrap items-center justify-center gap-x-4">
                        <a href="https://github.com/chiranjeev-agarwal" target="_blank" rel="noopener noreferrer" className="hover:text-accent">github.com/chiranjeev-agarwal</a>
                        <span className="hidden md:inline">|</span>
                        <a href="https://linkedin.com/in/chiranjeev-agarwal" target="_blank" rel="noopener noreferrer" className="hover:text-accent">linkedin.com/in/chiranjeev-agarwal</a>
                         <span className="hidden md:inline">|</span>
                        <a href="mailto:chiranjeev.agarwal@gmail.com" className="hover:text-accent">chiranjeev.agarwal@gmail.com</a>
                    </p>
                </header>

                {/* Experience */}
                <ResumeSection title="EXPERIENCE">
                    <div className="flex flex-col gap-4">
                        {experienceData.map(exp => (
                            <div key={exp.id}>
                                <h3 className="font-headline text-[8px] text-primary/90">{exp.company} - <span className='text-primary/70'>{exp.role}</span></h3>
                                <p className="text-xs text-muted-foreground mb-1">{exp.date}</p>
                                <ul className="list-disc list-inside pl-2 text-sm text-primary/80">
                                    {exp.description.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </ResumeSection>
                
                {/* Education */}
                <ResumeSection title="EDUCATION">
                    <p className='text-sm'>B.Tech in Computer Science, XYZ University, 2020-2024</p>
                </ResumeSection>

                {/* Skills */}
                <ResumeSection title="SKILLS">
                    <p className='text-sm leading-relaxed'>{skills.join(', ')}</p>
                </ResumeSection>

                {/* Projects */}
                 <ResumeSection title="PROJECTS">
                    <div className="flex flex-col gap-2">
                        {projectsData.map(proj => (
                            <div key={proj.name} className='text-sm'>
                                <span className='font-headline text-primary/90 text-[7px]'>{proj.name}: </span>
                                <span className='text-primary/80'>{proj.description}</span>
                            </div>
                        ))}
                    </div>
                </ResumeSection>
            </div>
        </div>
      </div>
    );
  }
