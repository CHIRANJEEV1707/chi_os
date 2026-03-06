
'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { FileText, ArrowUp, ArrowDown, TrendingUp, Search } from 'lucide-react';
import { useSoundEffect } from '@/hooks/useSoundEffect';

const MetricCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <div className="border-2 border-primary/30 bg-black/20 p-2 text-center h-[80px] flex flex-col justify-center items-center">
        <div className="flex items-center gap-1">
            {icon}
            <span className="font-headline text-lg text-primary">{value}</span>
        </div>
        <p className="font-headline text-[6px] text-primary/70 mt-1">{label}</p>
    </div>
);

const caseStudiesData = [
    {
        id: 'notion',
        name: 'notion_teardown.log',
        productName: 'Notion',
        logo: '🧩',
        date: 'July 2024',
        readTime: 5,
        subtitle: 'Why the most powerful tool feels overwhelming to new users',
        sections: [
            {
                title: 'OVERVIEW',
                content: <p>Notion is a powerful all-in-one workspace that combines notes, docs, wikis, and project management. Its key strength—flexibility—is also a significant hurdle for user activation.</p>
            },
            {
                title: 'THE PROBLEM I NOTICED',
                content: <p>New users are often paralyzed by the "blank canvas" problem. They sign up with a specific need but are presented with infinite possibilities, leading to confusion and churn before they experience the "aha!" moment.</p>
            },
            {
                title: 'USER JOURNEY ANALYSIS',
                content: <ol className="list-decimal list-inside space-y-2">
                    <li>User signs up to "get organized".</li>
                    <li>Lands on a blank page with a blinking cursor.</li>
                    <li>Tries a template, but it's too complex or not quite right.</li>
                    <li>Spends 15 minutes trying to format a simple to-do list.</li>
                    <li>Closes tab, feeling less organized than before.</li>
                </ol>
            },
            {
                title: 'ROOT CAUSE',
                content: <div className="p-3 border-l-4 border-amber-400 bg-amber-900/20 text-amber-400">
                    Notion onboards for possibility, not for purpose. It sells the "what you could build" instead of solving the user's immediate pain point.
                </div>
            },
            {
                title: 'MY PROPOSED SOLUTION',
                content: <p>Implement a "Goal-Oriented Onboarding" wizard. On first login, ask the user: "What's the main thing you want to do today?" (e.g., "Take meeting notes", "Track a project", "Create a personal CRM"). Based on their answer, generate a pre-configured, minimal page that solves that one job, with guided tours pointing to 2-3 key features only.</p>
            },
            {
                title: 'EXPECTED IMPACT',
                content: <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <MetricCard label="USER ACTIVATION" value="+15%" icon={<TrendingUp className="text-green-400"/>} />
                    <MetricCard label="DAY-7 RETENTION" value="+10%" icon={<TrendingUp className="text-green-400"/>} />
                    <MetricCard label="SUPPORT TICKETS" value="-20%" icon={<ArrowDown className="text-green-400"/>} />
                </div>
            },
            {
                title: 'TRADEOFFS',
                content: <p>This approach might slightly limit the initial discovery of Notion's vast feature set for a small segment of power users, but this is an acceptable tradeoff for drastically improving the new user experience for the majority.</p>
            },
             {
                title: 'WHAT I\'D MEASURE',
                content: <ul className="list-disc list-inside space-y-1">
                    <li>Completion rate of the onboarding wizard.</li>
                    <li>Time-to-first-meaningful-action (e.g., creating 3 tasks).</li>
                    <li>Cohort analysis of Day-1, Day-7, and Day-30 retention for users who went through the new onboarding vs. the old one.</li>
                </ul>
            }
        ]
    },
    {
        id: 'duolingo',
        name: 'duolingo_teardown.log',
        productName: 'Duolingo',
        logo: '🦉',
        date: 'July 2024',
        readTime: 4,
        subtitle: 'Streak anxiety is killing long-term retention',
        sections: [
             {
                title: 'OVERVIEW',
                content: <p>Duolingo is the world's most popular language-learning app, gamifying the process with points, leaderboards, and its famous "streak" feature.</p>
            },
            {
                title: 'THE PROBLEM I NOTICED',
                content: <p>The streak, while a powerful motivator, becomes a source of anxiety. Once a long streak is broken, users often feel demoralized and churn, as the primary reward mechanism has vanished.</p>
            },
            {
                title: 'PROPOSED SOLUTION',
                content: <p>Introduce "Streak Seasons." Instead of an infinite streak, have 3-month seasons. Users aim to maintain their streak for the season to earn a unique badge. At the end of the season, streaks reset for everyone, giving churned users a clear re-entry point and reducing the "all or nothing" pressure.</p>
            },
        ]
    },
    {
        id: 'linear',
        name: 'linear_teardown.log',
        productName: 'Linear',
        logo: '⚫',
        date: 'July 2024',
        readTime: 6,
        subtitle: 'Why the best PM tool isn\'t used by more PMs',
        sections: [
             {
                title: 'OVERVIEW',
                content: <p>Linear is a beautifully designed issue tracker for high-performance teams, beloved by engineers for its speed and keyboard-first interface.</p>
            },
            {
                title: 'THE PROBLEM I NOTICED',
                content: <p>While engineers love Linear, many Product Managers still live in other tools (Jira, Notion, etc.) because Linear is optimized for the "build" phase, not the "plan" phase of product development.</p>
            },
            {
                title: 'PROPOSED SOLUTION',
                content: <p>Create a new top-level object called "Specs." A Spec would be a lightweight document for product requirements that lives alongside Projects and Issues. It would support rich text, embeds, and status tracking (e.g., Draft, In Review, Approved), linking directly to the Projects that will implement it. This makes Linear a viable tool for the entire product lifecycle.</p>
            },
        ]
    },
];

const CaseStudyContent = ({ caseStudy }: { caseStudy: typeof caseStudiesData[0] }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [currentSection, setCurrentSection] = useState(0);

    useEffect(() => {
        setCurrentSection(0);
        contentRef.current?.scrollTo(0, 0);
    }, [caseStudy]);

    const scrollToSection = (index: number) => {
        sectionRefs.current[index]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
        setCurrentSection(index);
    };

    const handleNav = (dir: 'prev' | 'next') => {
        const newIndex = dir === 'next'
            ? Math.min(currentSection + 1, caseStudy.sections.length - 1)
            : Math.max(currentSection - 1, 0);
        scrollToSection(newIndex);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-2 border-b-2 border-primary/30 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center border border-primary/50 bg-black/30 text-lg">{caseStudy.logo}</div>
                    <div>
                        <h2 className="font-headline text-[9px] text-primary">{caseStudy.productName}</h2>
                        <p className="font-body text-sm text-primary/70">Analysis by Chiranjeev Agarwal</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="font-headline text-[7px] text-muted-foreground">{caseStudy.date}</p>
                        <p className="font-headline text-[6px] border border-primary/50 bg-black/30 text-primary px-2 py-1 mt-1 inline-block">{caseStudy.readTime} MIN READ</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div ref={contentRef} className="flex-grow overflow-y-auto p-3 space-y-6">
                <blockquote className="font-body text-lg italic text-primary/80 border-l-4 border-primary/50 pl-4">
                    {/* UPDATE WITH REAL CONTENT */}
                    "{caseStudy.subtitle}"
                </blockquote>
                {caseStudy.sections.map((section, index) => (
                    <div key={section.title} ref={el => sectionRefs.current[index] = el} className="scroll-mt-4">
                        <h3 className="font-headline text-[7px] text-green-400 mb-2">&gt; {section.title}</h3>
                        <div className="font-body text-base text-primary/90 pl-4 border-l-2 border-dotted border-primary/20">
                            {/* UPDATE WITH REAL CONTENT */}
                            {section.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Nav */}
            <div className="flex-shrink-0 p-2 border-t-2 border-primary/30 flex justify-between">
                <button
                    onClick={() => handleNav('prev')}
                    disabled={currentSection === 0}
                    className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                    [ ← PREV SECTION ]
                </button>
                <button
                    onClick={() => handleNav('next')}
                    disabled={currentSection === caseStudy.sections.length - 1}
                    className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                    [ NEXT SECTION → ]
                </button>
            </div>
        </div>
    );
};


export default function CaseStudies() {
    const [activeId, setActiveId] = useState(caseStudiesData[0].id);
    const { play } = useSoundEffect();

    const activeCaseStudy = caseStudiesData.find(cs => cs.id === activeId)!;

    const handleSelect = (id: string) => {
        play('click');
        setActiveId(id);
    };

    return (
        <div className="p-1 font-body h-full overflow-hidden flex gap-4">
            {/* Left Sidebar */}
            <div className="w-1/3 max-w-48 flex-shrink-0 border-r-2 border-primary/20 pr-2">
                <h2 className="font-headline text-[7px] text-muted-foreground p-2">&gt; SELECT_CASE/</h2>
                <div className="flex flex-col gap-1">
                    {caseStudiesData.map(cs => (
                        <button
                            key={cs.id}
                            onClick={() => handleSelect(cs.id)}
                            className={cn(
                                "w-full text-left p-2 border-2 flex flex-col",
                                activeId === cs.id
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-primary/30 text-primary hover:bg-accent/20"
                            )}
                        >
                                <span className="font-headline text-[7px] flex items-center gap-1.5">
                                    <FileText size={10} /> {cs.name}
                                </span>
                                <span className={cn("font-headline text-[6px] ml-auto mt-1 px-1 border",
                                 activeId === cs.id ? 'border-primary-foreground text-primary-foreground' : 'border-primary/50 text-primary/70'
                                )}>
                                    [READ]
                                </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Content */}
            <div className="w-2/3 flex-grow h-full bg-black/30">
                {activeCaseStudy && <CaseStudyContent caseStudy={activeCaseStudy} />}
            </div>
        </div>
    );
}
