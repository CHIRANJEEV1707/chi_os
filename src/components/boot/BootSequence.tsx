'use client';

import { useState, useEffect } from 'react';
import POSTScreen from './POSTScreen';
import ProgressBar from './ProgressBar';
import OSLogo from './OSLogo';

type BootSequenceProps = {
  onComplete: () => void;
  onSkip: () => void;
};

export default function BootSequence({ onComplete, onSkip }: BootSequenceProps) {
  const [phase, setPhase] = useState(1);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const sequenceTimers: NodeJS.Timeout[] = [];

    const handleKeyPress = (e: KeyboardEvent) => {
      onSkip();
    };

    sequenceTimers.push(setTimeout(() => setShowSkip(true), 1500));
    sequenceTimers.push(setTimeout(() => setPhase(2), 2200)); // POSTScreen (1200) + delay
    sequenceTimers.push(setTimeout(() => setPhase(3), 4700)); // ProgressBar (2000) + delay
    sequenceTimers.push(setTimeout(() => setPhase(4), 6000)); // OSLogo (800) + delay
    sequenceTimers.push(setTimeout(() => onComplete(), 7500)); // Desktop Reveal (1500)
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      sequenceTimers.forEach(clearTimeout);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onComplete, onSkip]);

  return (
    <div className="bg-black text-primary font-headline h-full w-full flex items-center justify-center flex-col">
      {phase === 1 && <POSTScreen />}
      {phase === 2 && <ProgressBar />}
      {phase === 3 && <OSLogo />}
      {phase === 4 && <div className="animate-pulse">Loading Desktop...</div>}
      {showSkip && phase < 4 && (
        <div className="absolute bottom-5 right-5 text-muted-foreground text-xs animate-pulse">
          Press any key to skip
        </div>
      )}
    </div>
  );
}
