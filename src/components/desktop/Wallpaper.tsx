'use client';

import { useRef, useEffect } from 'react';
import { WallpaperType } from '../ChiruOS';

const MatrixWallpaper = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
    
        const handleResize = () => {
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
          // Re-initialize drops on resize
          drops = Array(Math.floor(width / fontSize)).fill(1).map((_, i) => i * fontSize);
        };
    
        window.addEventListener('resize', handleResize);
    
        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const characters = katakana + latin + nums;
    
        const fontSize = 16;
        let drops = Array(Math.floor(width / fontSize)).fill(1).map((_, i) => i * fontSize);
    
        const draw = () => {
          ctx.fillStyle = 'rgba(13, 26, 13, 0.05)';
          ctx.fillRect(0, 0, width, height);
          
          ctx.fillStyle = '#00ff41'; // Terminal green
          ctx.font = `${fontSize}px VT323`;
    
          for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    
            if (drops[i] * fontSize > height && Math.random() > 0.975) {
              drops[i] = 0;
            }
            drops[i]++;
          }
        };
    
        const intervalId = setInterval(draw, 50);
    
        return () => {
          clearInterval(intervalId);
          window.removeEventListener('resize', handleResize);
        };
      }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-30" />;
}

const PixelGridWallpaper = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);
      const gridSize = 32;
  
      const drawGrid = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = 'hsla(var(--primary), 0.1)';
        ctx.lineWidth = 1;
  
        for (let x = 0; x <= width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
  
        for (let y = 0; y <= height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      };
  
      const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        drawGrid();
      };
  
      window.addEventListener('resize', handleResize);
      drawGrid();
  
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
  
    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};


const Wallpaper = ({ type }: { type: WallpaperType }) => {
    switch (type) {
        case 'matrix':
            return <MatrixWallpaper />;
        case 'grid':
            return <PixelGridWallpaper />;
        case 'plain':
            return null; // The background color is already set on the parent
        default:
            return <MatrixWallpaper />;
    }
};

export default Wallpaper;
