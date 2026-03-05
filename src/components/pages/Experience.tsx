'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const experienceData = [
  {
    id: 'exp1',
    date: '2023-06 → 2023-08',
    company: 'TechCorp Solutions',
    role: 'Frontend Developer Intern',
    description: [
      'Built responsive React components serving 10k+ users',
      'Reduced page load time by 40% through lazy loading',
      'Collaborated with design team to implement pixel-perfect UIs',
    ],
    stack: ['React', 'TypeScript', 'Tailwind', 'Git'],
  },
  {
    id: 'exp2',
    date: '2022-12 → 2023-02',
    company: 'StartupXYZ',
    role: 'Full Stack Developer Intern',
    description: [
      'Developed RESTful APIs using Node.js and Express',
      'Integrated Firebase authentication and Firestore database',
      'Shipped 3 major features in 8-week sprint cycle',
    ],
    stack: ['Node.js', 'Express', 'Firebase', 'MongoDB'],
  },
  {
    id: 'exp3',
    date: '2022-06 → 2022-08',
    company: 'FreelanceProject',
    role: 'Web Developer',
    description: [
      'Designed and developed 4 client websites from scratch',
      'Implemented SEO best practices increasing organic traffic by 60%',
      'Delivered all projects on time and within budget',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'WordPress'],
  },
];

const StackBadge = ({ label }: { label: string }) => (
  <span className="font-headline text-[6px] border border-primary/50 bg-black/30 text-primary px-2 py-1">
    {label}
  </span>
);

const ExperienceEntry = ({ entry }: { entry: typeof experienceData[0] }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-2 transform -translate-x-1/2">
        <span className="text-primary">◆</span>
      </div>
      
      <button className="w-full text-left" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
            <ChevronRight className={cn("w-3 h-3 text-primary transition-transform", isOpen && "rotate-90")} />
            <div className="font-body text-base md:text-lg">
                <span className="text-muted-foreground">{entry.date}</span>
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
            {entry.description.map((item, index) => (
              <li key={index} className="pl-4">
                <span className="text-primary/50 mr-2">&gt;</span>{item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {entry.stack.map(tech => <StackBadge key={tech} label={tech} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Experience() {
  return (
    <div className="p-4 font-body h-full overflow-y-auto">
      <div className="font-headline text-[8px] md:text-[10px] text-muted-foreground">
        <p>&gt; CAT work_history.log</p>
        <p>&gt; DISPLAYING {experienceData.length} ENTRIES...</p>
      </div>

      <div className="mt-6 pl-2 border-l-2 border-dashed border-primary/30 flex flex-col gap-8">
        {experienceData.map(entry => (
          <ExperienceEntry key={entry.id} entry={entry} />
        ))}
      </div>

      <div className="mt-8 font-headline text-[8px] md:text-[10px] text-muted-foreground">
        &gt; END OF LOG. {experienceData.length} ENTRIES DISPLAYED.
      </div>
    </div>
  );
}
