'use client';

import { useState, useEffect } from 'react';

const lines = [
  'CPU: Chiranjeev Agarwal v1.0',
  'RAM: 64MB Creative Thinking',
  'DISK: Infinite Ideas Detected',
  'GPU: Pixel Renderer 3000',
];

const TypingLine = ({ text, onFinished }: { text: string; onFinished: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        onFinished();
      }
    }, 40);
    return () => clearInterval(interval);
  }, [text, onFinished]);

  return <p>{'> '}{displayedText}<span className="animate-ping">_</span></p>;
};

const POSTScreen = () => {
  const [currentLine, setCurrentLine] = useState(0);

  return (
    <div className="w-full max-w-2xl p-4 text-sm md:text-base">
      <p className="mb-4">CHIRU-OS BIOS v1.0</p>
      {lines.map((line, index) => 
        index <= currentLine ? (
          <TypingLine 
            key={index} 
            text={line} 
            onFinished={() => setCurrentLine(i => i + 1)} 
          />
        ) : null
      )}
    </div>
  );
};

export default POSTScreen;
