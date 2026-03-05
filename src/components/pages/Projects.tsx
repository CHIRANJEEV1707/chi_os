'use client';

import { useState } from 'react';
import { Folder, Github, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Data ---
const projectsData = [
  {
    name: 'RetroPortfolio OS',
    category: 'WEB',
    status: 'LIVE',
    description: "A pixel-art retro OS themed personal portfolio built with Next.js and Tailwind CSS. Features draggable windows, boot sequence, and easter eggs.",
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'Zustand', 'Howler.js'],
    github: 'https://github.com/chiranjeev-agarwal/chiru-os',
    live: '#',
  },
  {
    name: 'PixelChat App',
    category: 'WEB',
    status: 'WIP',
    description: "Real-time chat application with pixel art UI. Supports rooms, direct messages, file sharing and custom pixel avatars.",
    stack: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Express'],
    github: '#',
    live: null,
  },
  {
    name: 'CodeQuest',
    category: 'AI/ML',
    status: 'ARCHIVED',
    description: "AI-powered coding challenge platform that generates personalized problems based on skill level using GPT-4 API.",
    stack: ['Python', 'FastAPI', 'OpenAI', 'PostgreSQL', 'React'],
    github: '#',
    live: null,
  },
  {
    name: 'Open Source Contribution',
    category: 'OPEN SOURCE',
    status: 'LIVE',
    description: "Contributed to various open-source projects, focusing on documentation, bug fixes, and feature enhancements.",
    stack: ['Git', 'Markdown', 'Various'],
    github: '#',
    live: null,
  }
];

type Category = 'ALL' | 'WEB' | 'MOBILE' | 'AI/ML' | 'OPEN SOURCE';
const categories: Category[] = ['ALL', 'WEB', 'MOBILE', 'AI/ML', 'OPEN SOURCE'];

// --- Sub-components ---

const StatusBadge = ({ status }: { status: string }) => (
  <div className="flex items-center gap-1.5">
    <span className={cn(
      "h-2 w-2 rounded-full",
      status === 'LIVE' && "bg-green-500 animate-pulse",
      status === 'WIP' && "bg-yellow-500",
      status === 'ARCHIVED' && "bg-muted-foreground/50"
    )} />
    <span className="font-headline text-[6px] text-muted-foreground">{status}</span>
  </div>
);

const StackBadge = ({ label }: { label: string }) => (
  <span className="font-headline text-[6px] border border-primary/50 bg-black/30 text-primary px-2 py-1">
    {label}
  </span>
);

const ProjectCard = ({ project }: { project: typeof projectsData[0] }) => (
  <div className="border-2 border-primary/30 bg-black/20 p-4 flex flex-col gap-3 hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary))] transition-all duration-300">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Folder className="w-4 h-4 text-primary" />
        <h3 className="font-headline text-[9px] text-primary">{project.name}</h3>
      </div>
      <StatusBadge status={project.status} />
    </div>

    {/* Body */}
    <div>
      <p className="font-body text-base text-primary/80 mb-3">{project.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {project.stack.map(tech => <StackBadge key={tech} label={tech} />)}
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center gap-2 mt-auto pt-3">
      {project.github && (
        <a href={project.github} target="_blank" rel="noopener noreferrer" className="font-headline text-[7px] flex items-center gap-1 border-2 border-primary/50 px-2 py-1 text-primary hover:bg-accent hover:text-accent-foreground">
          <Github size={10} /> GITHUB
        </a>
      )}
      {project.live && (
         <a href={project.live} target="_blank" rel="noopener noreferrer" className="font-headline text-[7px] flex items-center gap-1 border-2 border-primary/50 px-2 py-1 text-primary hover:bg-accent hover:text-accent-foreground">
          <LinkIcon size={10} /> LIVE DEMO
        </a>
      )}
    </div>
  </div>
);

// --- Main Component ---
export default function Projects() {
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');

  const filteredProjects = projectsData.filter(project => 
    activeCategory === 'ALL' || project.category === activeCategory
  );

  return (
    <div className="p-1 font-body h-full overflow-hidden flex gap-4">
      {/* Left Sidebar */}
      <div className="w-1/4 flex-shrink-0 border-r-2 border-primary/20 pr-4">
        <h2 className="font-headline text-[7px] text-muted-foreground p-2">CATEGORIES</h2>
        <div className="flex flex-col gap-1">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "w-full text-left font-headline text-[7px] p-2 border-2 border-primary/30",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "text-primary hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Right Content */}
      <div className="w-3/4 h-full overflow-y-auto pr-2">
        <div className="flex flex-col gap-3">
          {filteredProjects.map(project => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
         <div className="mt-4 font-headline text-[8px] text-muted-foreground">
            &gt; {filteredProjects.length} ITEMS DISPLAYED.
        </div>
      </div>
    </div>
  );
}
