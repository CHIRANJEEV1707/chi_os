'use client';

import React, { useEffect, useRef } from 'react';

const Screensaver = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const squareSize = 32;
    const fontSize = 16;
    let x = Math.random() * (width - squareSize);
    let y = Math.random() * (height - squareSize);
    let dx = 2;
    let dy = 2;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      x += dx;
      y += dy;

      if (x + squareSize >= width || x <= 0) {
        dx = -dx;
      }
      if (y + squareSize >= height || y <= 0) {
        dy = -dy;
      }
      
      x = Math.max(0, Math.min(x, width - squareSize));
      y = Math.max(0, Math.min(y, height - squareSize));

      ctx.fillStyle = '#00ff41';
      ctx.fillRect(x, y, squareSize, squareSize);

      ctx.font = `${fontSize}px "Press Start 2P"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#0A0F0A'; // A dark green from the theme
      ctx.fillText('>_', x + squareSize / 2, y + squareSize / 2 + 1); // +1 for better vertical font centering

      animationFrameId = requestAnimationFrame(draw);
    };
    
    // Wait for fonts to be ready to avoid flicker/default font rendering
    document.fonts.ready.then(() => {
        draw();
    });

    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        // Re-set font on resize as context can be reset
        ctx.font = `${fontSize}px "Press Start 2P"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className={'fixed inset-0 z-[9999] bg-black/95'}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-primary font-headline animate-pulse">
        PRESS ANY KEY TO CONTINUE...
      </div>
    </div>
  );
};

export default Screensaver;
