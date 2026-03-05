'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const skillsData = [
  {
    category: 'LANGUAGES',
    skills: [
      { name: 'JavaScript', level: 85 },
      { name: 'TypeScript', level: 75 },
      { name: 'Python', level: 70 },
      { name: 'Java', level: 65 },
    ],
  },
  {
    category: 'FRAMEWORKS',
    skills: [
      { name: 'React', level: 90 },
      { name: 'Next.js', level: 85 },
      { name: 'Node.js', level: 80 },
      { name: 'Express', level: 75 },
      { name: 'Tailwind CSS', level: 90 },
    ],
  },
  {
    category: 'TOOLS',
    skills: [
      { name: 'Git & GitHub', level: 85 },
      { name: 'Docker', level: 65 },
      { name: 'Figma', level: 70 },
      { name: 'VS Code', level: 95 },
    ],
  },
  {
    category: 'DATABASES',
    skills: [
      { name: 'MongoDB', level: 75 },
      { name: 'PostgreSQL', level: 70 },
      { name: 'Firebase', level: 80 },
    ],
  },
  {
    category: 'CLOUD',
    skills: [
      { name: 'Vercel', level: 85 },
      { name: 'AWS', level: 60 },
      { name: 'GCP', level: 55 },
    ],
  },
];

const totalSkills = skillsData.reduce((acc, curr) => acc + curr.skills.length, 0);

const AnimatedProgressSkill = ({ name, level, delay }: { name: string; level: number; delay: number }) => {
  const [displayLevel, setDisplayLevel] = useState(0);

  useEffect(() => {
    const animTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayLevel(prev => {
          if (prev < level) {
            return prev + 1;
          }
          clearInterval(interval);
          return level;
        });
      }, 8); // 8ms * 100 steps ~= 800ms
    }, delay);

    return () => clearTimeout(animTimer);
  }, [level, delay]);

  const filledSegments = Math.ceil(displayLevel / 10);

  return (
    <div className="flex items-center gap-x-2 text-primary font-body text-base whitespace-nowrap">
      <span className="flex-shrink-0">&gt; {name}</span>
      <span
        className="w-full border-b-2 border-dotted border-primary/30"
        style={{ transform: 'translateY(-3px)' }}
      ></span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-mono">[</span>
        <div className="flex gap-[2px]">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={cn('w-2 h-4', i < filledSegments ? 'bg-primary' : 'bg-muted/20')}
            />
          ))}
        </div>
        <span className="font-mono">]</span>
      </div>
      <span className="font-mono w-12 text-right flex-shrink-0">{displayLevel}%</span>
    </div>
  );
};

const TypingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i > text.length) {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return <p>&gt; {displayedText}<span className="animate-pulse">_</span></p>;
};

export default function Skills() {
  const [scanComplete, setScanComplete] = useState(false);
  let skillCounter = 0;

  useEffect(() => {
    const totalAnimationTime = totalSkills * 100 + 800; // Stagger + last animation duration
    const timer = setTimeout(() => {
      setScanComplete(true);
    }, totalAnimationTime);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 font-body h-full overflow-y-auto">
      <div className="font-headline text-[8px] md:text-[10px]">
        <p>&gt; RUNNING SYSTEM DIAGNOSTICS...</p>
        <p>&gt; SCANNING INSTALLED MODULES...<span className="animate-pulse">▊</span></p>
      </div>

      <p className="font-headline text-[8px] md:text-[10px] mt-4 mb-2">SCAN RESULTS:</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
        {skillsData.map((category) => (
          <div key={category.category} className="flex flex-col gap-2">
            <h2 className="font-headline text-[8px] md:text-[10px] text-primary">
              [ {category.category} ]
            </h2>
            <div className="flex flex-col gap-1">
              {category.skills.map((skill) => {
                const currentSkillIndex = skillCounter++;
                return (
                  <AnimatedProgressSkill
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    delay={currentSkillIndex * 100}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 font-headline text-[8px] md:text-[10px]">
        {scanComplete && <TypingText text="SCAN COMPLETE. ALL SYSTEMS OPERATIONAL." />}
      </div>
    </div>
  );
}