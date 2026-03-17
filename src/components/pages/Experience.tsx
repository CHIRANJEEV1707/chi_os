'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExperience, ExperienceEntry } from '@/lib/hooks/useExperience';

const StackBadge = ({ label }: { label: string }) => (
  <span className="font-headline text-[6px] border border-primary/50 bg-black/30 text-primary px-2 py-1">
    {label}
  </span>
);

const ExperienceEntryComponent = ({ entry }: { entry: ExperienceEntry }) => {
  const [isOpen, setIsOpen] = useState(true);

  const dateDisplay = entry.end_date 
    ? `${entry.start_date} → ${entry.end_date}` 
    : `${entry.start_date} → Present`;

  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-2 transform -translate-x-1/2">
        <span className="text-primary">◆</span>
      </div>
      
      <button className="w-full text-left" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
            <ChevronRight className={cn("w-3 h-3 text-primary transition-transform", isOpen && "rotate-90")} />
            <div className="font-body text-base md:text-lg">
                <span className="text-muted-foreground">{dateDisplay}</span>
            </div>
        </div>
         <div className="pl-5 font-body text-base md:text-lg">
            <span className="text-primary">{entry.company}</span>
            <span className="text-muted-foreground mx-2">-</span>
            <span className="text-primary/80">{entry.role}</span>
        </div>
      </button>

      {isOpen && (
        <div className="pl-5 mt-3 flex flex-col gap-4">
          <ul className="flex flex-col gap-1 font-body text-base text-primary/90">
            {(entry.description_bullets || []).map((item, index) => (
              <li key={index} className="pl-4">
                <span className="text-primary/50 mr-2">&gt;</span>{item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {(entry.tech_stack || []).map(tech => <StackBadge key={tech} label={tech} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const LoadingState = () => (
  <div className="p-4 font-body h-full flex items-center justify-center">
    <p className="text-primary text-lg animate-pulse">&gt; LOADING WORK HISTORY...<span className="ml-1">█</span></p>
  </div>
);

export default function Experience() {
  const { experience, loading } = useExperience();

  if (loading) return <LoadingState />;

  return (
    <div className="p-4 font-body h-full overflow-y-auto">
      <div className="font-headline text-[8px] md:text-[10px] text-muted-foreground">
        <p>&gt; CAT work_history.log</p>
        <p>&gt; DISPLAYING {experience.length} ENTRIES...</p>
      </div>

      <div className="mt-6 pl-2 border-l-2 border-dashed border-primary/30 flex flex-col gap-8">
        {experience.map(entry => (
          <ExperienceEntryComponent key={entry.id} entry={entry} />
        ))}
      </div>

      <div className="mt-8 font-headline text-[8px] md:text-[10px] text-muted-foreground">
        &gt; END OF LOG. {experience.length} ENTRIES DISPLAYED.
      </div>
    </div>
  );
}
