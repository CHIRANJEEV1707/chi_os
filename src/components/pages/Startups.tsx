'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Github, Link as LinkIcon, BarChart2 } from 'lucide-react';

// Data
const startupsData = [
  {
    id: 'alpha',
    name: 'VENTURE ALPHA',
    logoInitial: 'VA',
    tagline: 'Decentralizing the future, one block at a time.',
    stage: 'MVP',
    industry: ['SaaS', 'B2B', 'Web3'],
    founded: '2023',
    teamSize: 3,
    market: 'Decentralized Finance',
    story: "Two founders, one mission, zero sleep. We started Venture Alpha because we noticed the immense friction and centralization in cross-chain asset management. Our solution is a non-custodial protocol that simplifies portfolio management for the decentralized world. It's been a ride.",
    journey: [
      { date: 'Q2 2023', title: 'IDEA BORN', desc: 'Identified the problem space during a hackathon.' },
      { date: 'Q3 2023', title: 'FIRST LINE OF CODE', desc: 'Started building the MVP on Ethereum.' },
      { date: 'Q4 2023', title: 'FIRST USER (A FRIEND)', desc: 'Someone actually used it without breaking it!' },
      { date: 'Q1 2024', title: 'KEY LEARNING: PIVOT', desc: 'Realized L2s were the future, began rewrite.' },
      { date: 'CURRENT', title: 'TESTNET LAUNCH', desc: 'Live on Sepolia, gathering feedback.' },
    ],
    lessons: [
      "Move faster and break things (but not on mainnet).",
      "User feedback is more valuable than any whitepaper.",
      "The best tech doesn't win if the UX is terrible.",
    ],
    metrics: [
      { month: 'Jan', value: 10 },
      { month: 'Feb', value: 25 },
      { month: 'Mar', value: 45 },
      { month: 'Apr', value: 60 },
      { month: 'May', value: 80 },
      { month: 'Jun', value: 95 },
    ],
    honestTake: "It's harder than it looks. Building in Web3 is like building on quicksand, but the potential is too massive to ignore. We're probably underfunded and over-caffeinated, but we believe in the mission.",
    links: {
        website: '#',
        github: '#',
        deck: '#'
    }
  },
  {
    id: 'beta',
    name: 'VENTURE BETA',
    logoInitial: 'VB',
    tagline: 'Your personal AI-powered life coach.',
    stage: 'IDEATION',
    industry: ['Consumer', 'Mobile', 'AI'],
    founded: '2024',
    teamSize: 2,
    market: 'Self-Improvement',
    story: "In a world of constant distraction, true self-reflection is rare. Venture Beta is an AI companion designed to provide personalized guidance and accountability, helping you become the person you want to be. We're still in the early days, shaping the core experience.",
    journey: [
      { date: 'Q1 2024', title: 'PROBLEM DISCOVERY', desc: 'Realized our own productivity tools were failing us.' },
      { date: 'Q2 2024', title: 'USER RESEARCH', desc: 'Conducted 50+ interviews to validate the pain point.' },
      { date: 'CURRENT', title: 'PROTOTYPING', desc: 'Designing the initial user flow in Figma.' },
    ],
    lessons: [
      "Fall in love with the problem, not your solution.",
      "Talk to users before you write a single line of code.",
      "A strong co-founder relationship is everything.",
    ],
    metrics: [
      { month: 'Apr', value: 0 },
      { month: 'May', value: 5 },
      { month: 'Jun', value: 12 },
      { month: 'Jul', value: 18 },
    ],
    honestTake: "This is just an idea right now, but it's one we're obsessed with. Are we qualified? Maybe. Is it a massive, crowded market? Absolutely. But we think we have a unique angle. Ask us again in six months.",
    links: {
        website: null,
        github: null,
        deck: '#'
    }
  },
];

// Sub-components
const TabButton = ({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={cn(
            'px-4 py-2 font-headline text-[8px] border-b-2 transition-colors',
            isActive
                ? 'bg-black/30 border-primary text-primary'
                : 'border-transparent text-primary/70 hover:bg-black/20 hover:border-primary/50'
        )}
    >
        {children}
    </button>
);

const StageBadge = ({ stage }: { stage: string }) => (
    <span className="font-headline text-[6px] border border-primary/50 bg-black/30 text-primary px-2 py-1">
        {stage}
    </span>
);

const IndustryTag = ({ tag }: { tag: string }) => (
    <span className="font-headline text-[6px] border border-muted/50 bg-muted/20 text-muted-foreground px-2 py-1">
        {tag}
    </span>
);

const LinkButton = ({ href, icon, label }: { href: string | null, icon: React.ReactNode, label: string }) => (
    <a
        href={href || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
            "font-headline text-[7px] flex items-center gap-1 border-2 border-primary/50 px-2 py-1 text-primary",
            href ? "hover:bg-accent hover:text-accent-foreground" : "opacity-50 cursor-not-allowed"
        )}
    >
        {icon} {label}
    </a>
);

const MetricBar = ({ label, value, maxValue }: { label: string, value: number, maxValue: number }) => {
    const percentage = (value / maxValue) * 100;
    return (
        <div className="grid grid-cols-[40px,1fr,30px] items-center gap-2">
            <span className="font-body text-xs text-right">{label}</span>
            <div className="w-full h-4 bg-muted/20 border border-primary/20 p-0.5">
                <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
            </div>
            <span className="font-body text-xs text-left">{value}</span>
        </div>
    )
};


const StartupContent = ({ startup }: { startup: typeof startupsData[0] }) => (
    <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* Left Column */}
        <div className="w-full md:w-2/5 flex-shrink-0 flex flex-col gap-4">
            {/* Identity Card */}
            <div className="border-2 border-primary/30 bg-black/20 p-3">
                <div className="flex items-start gap-3">
                    <div className="w-16 h-16 flex-shrink-0 border-2 border-primary bg-black/50 flex items-center justify-center">
                        <span className="font-headline text-2xl text-primary">{startup.logoInitial}</span>
                    </div>
                    <div className="flex-grow">
                        <h2 className="font-headline text-[10px] text-primary">{startup.name}</h2>
                        <p className="font-body text-lg text-primary/80 leading-tight">{startup.tagline}</p>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StageBadge stage={startup.stage} />
                    {startup.industry.map(tag => <IndustryTag key={tag} tag={tag} />)}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="font-body text-base text-primary/90 flex flex-col gap-1">
                <p><span className="text-primary/60">&gt; FOUNDED:</span> {startup.founded}</p>
                <p><span className="text-primary/60">&gt; TEAM SIZE:</span> {startup.teamSize} people</p>
                <p><span className="text-primary/60">&gt; STAGE:</span> {startup.stage}</p>
                <p><span className="text-primary/60">&gt; MARKET:</span> {startup.market}</p>
                <p><span className="text-primary/60">&gt; MY ROLE:</span> <span className="font-headline text-[7px] text-amber-400">FOUNDER & CEO</span></p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-2 mt-auto">
                <LinkButton href={startup.links.website} icon={<LinkIcon size={10} />} label="WEBSITE" />
                <LinkButton href={startup.links.github} icon={<Github size={10} />} label="GITHUB" />
                <LinkButton href={startup.links.deck} icon={<BarChart2 size={10} />} label="DECK" />
            </div>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-3/5 h-full overflow-y-auto pr-2 space-y-4">
            <div>
                <h3 className="font-headline text-[7px] text-muted-foreground mb-1">&gt; cat story.txt</h3>
                <p className="font-body text-base text-primary/80">{startup.story}</p>
            </div>
            
            <div>
                 <h3 className="font-headline text-[7px] text-muted-foreground mb-2">&gt; JOURNEY.log</h3>
                 <div className="pl-2 border-l-2 border-dashed border-primary/30 flex flex-col gap-3">
                     {startup.journey.map(milestone => (
                         <div key={milestone.title} className="relative pl-4">
                            <span className="absolute left-[-9px] top-1 text-primary">◆</span>
                            <p className="font-body text-base"><span className="text-muted-foreground">{milestone.date}</span> — {milestone.title}</p>
                            <p className="font-body text-sm text-primary/70">{milestone.desc}</p>
                         </div>
                     ))}
                 </div>
            </div>

            <div>
                <h3 className="font-headline text-[7px] text-muted-foreground mb-1">&gt; lessons_learned.log</h3>
                <ul className="font-body text-base text-primary/80 space-y-1">
                    {startup.lessons.map((lesson, i) => (
                        <li key={i}><span className="text-primary/50 mr-2">&gt;</span>{lesson}</li>
                    ))}
                </ul>
            </div>
            
             <div>
                <h3 className="font-headline text-[7px] text-muted-foreground mb-2">&gt; metrics.csv</h3>
                <div className="space-y-1">
                    {startup.metrics.map(metric => (
                        <MetricBar key={metric.month} label={metric.month} value={metric.value} maxValue={100} />
                    ))}
                </div>
                <p className="text-xs text-muted-foreground italic mt-2 text-center">User metrics anonymized for confidentiality.</p>
            </div>
        </div>
    </div>
);


export default function Startups() {
    const [activeTab, setActiveTab] = useState<'alpha' | 'beta'>('alpha');
    const activeStartup = startupsData.find(s => s.id === activeTab)!;

    return (
        <div className="p-2 font-body h-full flex flex-col">
            <header className="flex-shrink-0">
                <p className="font-headline text-[8px] text-muted-foreground">&gt; STARTUPS/</p>
                <p className="font-body text-base md:text-lg text-primary/80">&gt; 2 COMPANIES FOUNDED. STILL STANDING.</p>
                <div className="w-full border-t-2 border-dotted border-primary/30 my-2"></div>
            </header>

            <div className="flex-shrink-0 border-b-2 border-primary/30">
                <TabButton isActive={activeTab === 'alpha'} onClick={() => setActiveTab('alpha')}>VENTURE ALPHA</TabButton>
                <TabButton isActive={activeTab === 'beta'} onClick={() => setActiveTab('beta')}>VENTURE BETA</TabButton>
            </div>
            
            <main className="flex-grow bg-black/30 p-2 overflow-hidden relative">
                {activeStartup && <StartupContent startup={activeStartup} />}
            </main>
            
            <footer className="flex-shrink-0 bg-[#1a1200] border-t-2 border-amber-400 p-2 mt-2">
                 <p className="font-headline text-[7px] text-amber-400">&gt; HONEST TAKE:</p>
                 <p className="font-body text-base text-amber-400/90">{activeStartup.honestTake}</p>
            </footer>
        </div>
    );
}
