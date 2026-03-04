'use client';
import { useState, useEffect } from 'react';

const messages = [
  'Initializing creativity modules...',
  'Mounting portfolio filesystem...',
  'Calibrating pixel renderer...',
  'Loading easter eggs... [DONE]',
  'Brewing coffee... [DONE]',
  'Summoning Chiranjeev...',
];

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(p => (p < 100 ? p + 1 : 100));
    }, 20);

    const messageInterval = setInterval(() => {
      setMessageIndex(i => (i + 1) % messages.length);
    }, 300);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-lg p-4 text-center">
      <p className="mb-2">Loading CHIRU-OS...</p>
      <div className="h-6 w-full border-2 border-primary p-1">
        <div
          className="h-full bg-primary transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 h-6 text-sm">{messages[messageIndex]}</p>
    </div>
  );
};

export default ProgressBar;
