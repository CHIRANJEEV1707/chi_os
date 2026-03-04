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

    const squareSize = 64;
    const fontSize = 24;
    let x = width / 2 - squareSize / 2;
    let y = height / 2 - squareSize / 2;
    let dx = 2.5;
    let dy = 2.5;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      x += dx;
      y += dy;

      if (x <= 0 || x + squareSize >= width) {
        dx = -dx;
      }
      if (y <= 0 || y + squareSize >= height) {
        dy = -dy;
      }

      x = Math.max(0, Math.min(x, width - squareSize));
      y = Math.max(0, Math.min(y, height - squareSize));

      ctx.fillStyle = '#00ff41';
      ctx.fillRect(x, y, squareSize, squareSize);

      ctx.font = `${fontSize}px "Press Start 2P"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000000';
      ctx.fillText('>_', x + squareSize / 2, y + squareSize / 2 + 2);

      animationFrameId = requestAnimationFrame(draw);
    };

    document.fonts.ready.then(() => {
      draw();
    });

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      x = width / 2 - squareSize / 2;
      y = height / 2 - squareSize / 2;
      if (ctx) {
        ctx.font = `${fontSize}px "Press Start 2P"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-primary font-headline animate-pulse">
        PRESS ANY KEY OR MOVE MOUSE TO CONTINUE...
      </div>
    </div>
  );
};

export default Screensaver;
