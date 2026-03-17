'use client';

import { useState } from 'react';
import { Folder, Github, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjects, Project } from '@/lib/hooks/useProjects';

type Category = 'ALL' | 'WEB' | 'MOBILE' | 'AI/ML' | 'OPEN SOURCE';
const categories: Category[] = ['ALL', 'WEB', 'MOBILE', 'AI/ML', 'OPEN SOURCE'];

// Map display category to DB category
const categoryMap: Record<string, string> = {
  'ALL': 'ALL',
  'WEB': 'web',
  'MOBILE': 'mobile',
  'AI/ML': 'ai-ml',
  'OPEN SOURCE': 'open-source',
};

// --- Sub-components ---

const StatusBadge = ({ status }: { status: string }) => (
  <div className="flex items-center gap-1.5">
    <span className={cn(
      "h-2 w-2 rounded-full",
      status === 'live' && "bg-green-500 animate-pulse",
      status === 'wip' && "bg-yellow-500",
      status === 'archived' && "bg-muted-foreground/50"
    )} />
    <span className="font-headline text-[6px] text-muted-foreground">{status.toUpperCase()}</span>
  </div>
);

const StackBadge = ({ label }: { label: string }) => (
  <span className="font-headline text-[6px] border border-primary/50 bg-black/30 text-primary px-2 py-1">
    {label}
  </span>
);

const ProjectCard = ({ project }: { project: Project }) => (
  <div className="border-2 border-primary/30 bg-black/20 p-4 flex flex-col gap-3 hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary))] transition-all duration-300">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Folder className="w-4 h-4 text-primary" />
        <h3 className="font-headline text-[9px] text-primary">{project.title}</h3>
      </div>
      <StatusBadge status={project.status} />
    </div>

    {/* Body */}
    <div>
      <p className="font-body text-base text-primary/80 mb-3">{project.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {(project.tech_stack || []).map(tech => <StackBadge key={tech} label={tech} />)}
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center gap-2 mt-auto pt-3">
      {project.github_url && (
        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="font-headline text-[7px] flex items-center gap-1 border-2 border-primary/50 px-2 py-1 text-primary hover:bg-accent hover:text-accent-foreground">
          <Github size={10} /> GITHUB
        </a>
      )}
      {project.live_url && (
         <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="font-headline text-[7px] flex items-center gap-1 border-2 border-primary/50 px-2 py-1 text-primary hover:bg-accent hover:text-accent-foreground">
          <LinkIcon size={10} /> LIVE DEMO
        </a>
      )}
    </div>
  </div>
);

const LoadingState = () => (
  <div className="p-4 font-body h-full flex items-center justify-center">
    <p className="text-primary text-lg animate-pulse">&gt; LOADING PROJECTS...<span className="ml-1">█</span></p>
  </div>
);

// --- Main Component ---
export default function Projects() {
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');
  const { projects, loading } = useProjects(categoryMap[activeCategory]);

  if (loading) return <LoadingState />;

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
        {projects.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-primary/70 text-lg">&gt; NO PROJECTS FOUND.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
        <div className="mt-4 font-headline text-[8px] text-muted-foreground">
            &gt; {projects.length} ITEMS DISPLAYED.
        </div>
      </div>
    </div>
  );
}
