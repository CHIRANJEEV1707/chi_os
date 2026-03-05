
'use client';

import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

const roles = [
  "Full Stack Developer",
  "Problem Solver",
  "Pixel Art Enthusiast",
  "Open Source Contributor",
];

const TypingAnimation = () => {
  const [text, setText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex];
    const typeSpeed = isDeleting ? 40 : 80;

    const handleTyping = () => {
      if (isDeleting) {
        setText(currentRole.substring(0, text.length - 1));
      } else {
        setText(currentRole.substring(0, text.length + 1));
      }

      if (!isDeleting && text === currentRole) {
        // Pause at end of word
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setRoleIndex((prevIndex) => (prevIndex + 1) % roles.length);
      }
    };

    const timer = setTimeout(handleTyping, typeSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, roleIndex]);

  return (
    <div className="h-6 mt-2 text-center font-body text-base">
      <span className="text-primary">{text}</span>
      <span className="animate-pulse">▊</span>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <div className="border-2 border-primary/50 bg-black/30 p-2">
    <div className="font-headline text-[6px] md:text-[8px] text-primary/70 mb-1 flex items-center gap-1">
      <span>{icon}</span> {label}
    </div>
    <div className="font-body text-sm md:text-base text-primary">{value}</div>
  </div>
);

export default function About() {
  return (
    <div className="p-1 font-body h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row gap-4 p-2">
        {/* Left Panel */}
        <div className="w-full md:w-[30%] flex-shrink-0 flex flex-col items-center p-4 border-2 border-primary/20 bg-black/20">
          <div className="w-32 h-32 border-2 border-primary bg-black/50 flex items-center justify-center mb-4">
            <span className="font-headline text-2xl text-primary" style={{ filter: 'grayscale(1) brightness(1.5) sepia(1) hue-rotate(60deg) saturate(7)'}}>&gt;_</span>
          </div>
          <h1 className="font-headline text-[10px] md:text-xs text-primary text-center">
            CHIRANJEEV AGARWAL
          </h1>
          <TypingAnimation />
        </div>

        {/* Right Panel */}
        <div className="w-full">
          <h2 className="font-headline text-[8px] md:text-[10px] text-muted-foreground mb-2">
            &gt; ABOUT_ME.txt
          </h2>
          <p className="font-body text-base md:text-lg text-primary/90 mb-4">
            Hi! I'm Chiranjeev, a passionate Full Stack Developer based in 
            New Delhi, India. I love building clean, performant web applications 
            and occasionally breaking things to understand how they work.
            When I'm not coding, you'll find me exploring pixel art, gaming, 
            or contributing to open source projects.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <StatCard icon="📍" label="LOCATION" value="New Delhi, India" />
            <StatCard icon="🔨" label="BUILDING" value="Something awesome" />
            <StatCard icon="💼" label="OPEN TO" value="All Opportunities" />
            <StatCard icon="🎓"label="EDUCATION" value="B.Tech CompSci" />
            <StatCard icon="⚡" label="EXPERIENCE" value="2+ Years" />
            <StatCard icon="🎮" label="FUN FACT" value="I made this OS" />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-4 p-2">
        <div className="h-px bg-primary/30 w-full" />
        <div className="flex justify-center items-center gap-6 mt-4">
            <a href="https://github.com/chiranjeev" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent p-2 border-2 border-transparent hover:border-accent">
                <Github size={20} />
            </a>
            <a href="https://linkedin.com/in/chiranjeev" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent p-2 border-2 border-transparent hover:border-accent">
                <Linkedin size={20} />
            </a>
            <a href="mailto:chiranjeev.agarwal@gmail.com" className="text-primary hover:text-accent p-2 border-2 border-transparent hover:border-accent">
                <Mail size={20} />
            </a>
        </div>
      </div>
    </div>
  );
}
