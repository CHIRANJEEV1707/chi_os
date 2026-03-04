'use client';

import { useState, useEffect } from 'react';
import BootSequence from '@/components/boot/BootSequence';
import ChiruOS from '@/components/ChiruOS';

export default function Home() {
  const [booting, setBooting] = useState(true);
  const [showBootSequence, setShowBootSequence] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasBooted = sessionStorage.getItem('chiru-os-booted');
      if (hasBooted) {
        setBooting(false);
      } else {
        setShowBootSequence(true);
      }
    }
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem('chiru-os-booted', 'true');
    setBooting(false);
  };
  
  const handleSkipBoot = () => {
    sessionStorage.setItem('chiru-os-booted', 'true');
    setBooting(false);
    setShowBootSequence(false);
  }

  if (booting) {
    if (showBootSequence) {
      return <BootSequence onComplete={handleBootComplete} onSkip={handleSkipBoot} />;
    }
    return <div className="bg-black w-full h-full" />; // Prevent flash of content
  }

  return <ChiruOS />;
}
