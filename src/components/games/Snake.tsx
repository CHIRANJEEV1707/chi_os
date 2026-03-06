
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { cn } from '@/lib/utils';
import { GAME_SETTINGS } from '@/lib/constants';
import { useAchievementStore } from '@/store/achievementStore';
import { useQuestStore } from '@/store/questStore';

const {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRID_SIZE,
  INITIAL_SPEED,
  SPEED_INCREMENT,
  MIN_SPEED,
  POINTS_PER_FOOD,
} = GAME_SETTINGS;

const CELL_SIZE = CANVAS_WIDTH / GRID_SIZE;

type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';
type Snake = { x: number; y: number }[];
type Food = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { play } = useSoundEffect();
  const { unlock } = useAchievementStore();
  const { completeTask } = useQuestStore();

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('IDLE');
  
  // Using refs for game objects to avoid re-renders on every tick
  const snakeRef = useRef<Snake>([]);
  const foodRef = useRef<Food>({ x: 0, y: 0 });
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction | null>(null);
  const speedRef = useRef<number>(INITIAL_SPEED);
  const gameLoopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isFoodBlinking, setIsFoodBlinking] = useState(true);

  // --- Game Setup and Reset ---
  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = null;
    speedRef.current = INITIAL_SPEED;
    setScore(0);
    generateFood();
  }, []);

  const generateFood = useCallback(() => {
    let newFoodPosition: Food;
    do {
      newFoodPosition = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (isPositionOnSnake(newFoodPosition, snakeRef.current));
    foodRef.current = newFoodPosition;
  }, []);

  const isPositionOnSnake = (pos: Food, snake: Snake) => {
    return snake.some(segment => segment.x === pos.x && segment.y === pos.y);
  };
  
  // --- Game State Changers ---
  const startGame = useCallback(() => {
    resetGame();
    setGameState('PLAYING');
    play('success');
  }, [resetGame, play]);

  const pauseGame = () => {
    setGameState('PAUSED');
    play('click');
  };

  const resumeGame = () => {
    setGameState('PLAYING');
    play('click');
  };

  const gameOver = useCallback(() => {
    setGameState('GAMEOVER');
    play('error');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('chiru-os-snake-high', score.toString());
    }
  }, [score, highScore, play]);

  // --- Effects ---
  useEffect(() => {
    setHighScore(Number(localStorage.getItem('chiru-os-snake-high')) || 0);
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (score >= 100) {
      unlock('snake_master');
    }
    if (score >= 50) {
        completeTask('get_score');
    }
  }, [score, unlock, completeTask]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            if (gameState === 'IDLE' || gameState === 'GAMEOVER') startGame();
            else if (gameState === 'PLAYING') pauseGame();
            else if (gameState === 'PAUSED') resumeGame();
        } else if (e.key.toLowerCase() === 'r') {
            e.preventDefault();
            startGame();
        }

        if (gameState !== 'PLAYING') return;

        let newDirection: Direction | null = null;
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                if (directionRef.current !== 'DOWN') newDirection = 'UP';
                break;
            case 'ArrowDown':
            case 's':
                if (directionRef.current !== 'UP') newDirection = 'DOWN';
                break;
            case 'ArrowLeft':
            case 'a':
                if (directionRef.current !== 'RIGHT') newDirection = 'LEFT';
                break;
            case 'ArrowRight':
            case 'd':
                if (directionRef.current !== 'LEFT') newDirection = 'RIGHT';
                break;
        }

        if (newDirection && !nextDirectionRef.current) {
            nextDirectionRef.current = newDirection;
            play('click');
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startGame, play]);
  
  useEffect(() => {
    const foodBlinkInterval = setInterval(() => {
        setIsFoodBlinking(prev => !prev);
    }, 500);

    return () => clearInterval(foodBlinkInterval);
  }, []);

  // --- Game Loop ---
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (gameLoopTimeoutRef.current) clearTimeout(gameLoopTimeoutRef.current);
      return;
    }

    const gameTick = () => {
      // Update direction
      if (nextDirectionRef.current) {
        directionRef.current = nextDirectionRef.current;
        nextDirectionRef.current = null;
      }

      const snake = [...snakeRef.current];
      const head = { ...snake[0] };

      switch (directionRef.current) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }
      
      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver();
        return;
      }
      
      // Self collision
      if (isPositionOnSnake(head, snake)) {
        gameOver();
        return;
      }

      snake.unshift(head);
      
      // Food collision
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
          play('click');
          const newScore = score + POINTS_PER_FOOD;
          setScore(newScore);

          if (newScore > 0 && newScore % 50 === 0) {
              speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_INCREMENT);
          }
          generateFood();
      } else {
          snake.pop();
      }

      snakeRef.current = snake;
      
      if (gameLoopTimeoutRef.current) clearTimeout(gameLoopTimeoutRef.current);
      gameLoopTimeoutRef.current = setTimeout(gameTick, speedRef.current);
    };

    gameLoopTimeoutRef.current = setTimeout(gameTick, speedRef.current);

    return () => {
      if (gameLoopTimeoutRef.current) clearTimeout(gameLoopTimeoutRef.current);
    };
  }, [gameState, score, generateFood, gameOver, play]);
  
  // --- Render Loop ---
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    let flashCount = 0;
    let isBorderRed = false;
    let flashInterval: NodeJS.Timeout | null = null;
    if (gameState === 'GAMEOVER' && canvasRef.current) {
        flashInterval = setInterval(() => {
            isBorderRed = !isBorderRed;
            canvasRef.current!.style.borderColor = isBorderRed ? '#ff4141' : '#00ff41';
            flashCount++;
            if (flashCount >= 6) {
                clearInterval(flashInterval!);
                canvasRef.current!.style.borderColor = '#00ff41';
            }
        }, 100);
    }
    
    const draw = () => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Grid
        ctx.strokeStyle = '#001a00';
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
            ctx.stroke();
        }

        if (gameState === 'IDLE') {
            drawIdleScreen(ctx);
        } else if (gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'GAMEOVER') {
            // Food
            if (isFoodBlinking) {
                ctx.fillStyle = '#ff4141';
                ctx.fillRect(foodRef.current.x * CELL_SIZE + 3, foodRef.current.y * CELL_SIZE + 3, 10, 10);
            }
            // Snake
            snakeRef.current.forEach((segment, index) => {
                ctx.fillStyle = index === 0 ? '#39ff14' : '#00ff41';
                ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            });
            // Eyes
            const head = snakeRef.current[0];
            ctx.fillStyle = 'white';
            switch(directionRef.current) {
                case 'UP':
                    ctx.fillRect(head.x * CELL_SIZE + 3, head.y * CELL_SIZE + 3, 2, 2);
                    ctx.fillRect(head.x * CELL_SIZE + 11, head.y * CELL_SIZE + 3, 2, 2);
                    break;
                case 'DOWN':
                    ctx.fillRect(head.x * CELL_SIZE + 3, head.y * CELL_SIZE + 11, 2, 2);
                    ctx.fillRect(head.x * CELL_SIZE + 11, head.y * CELL_SIZE + 11, 2, 2);
                    break;
                case 'LEFT':
                    ctx.fillRect(head.x * CELL_SIZE + 3, head.y * CELL_SIZE + 3, 2, 2);
                    ctx.fillRect(head.x * CELL_SIZE + 3, head.y * CELL_SIZE + 11, 2, 2);
                    break;
                case 'RIGHT':
                    ctx.fillRect(head.x * CELL_SIZE + 11, head.y * CELL_SIZE + 3, 2, 2);
                    ctx.fillRect(head.x * CELL_SIZE + 11, head.y * CELL_SIZE + 11, 2, 2);
                    break;
            }
            
            if(gameState === 'PAUSED') drawPausedScreen(ctx);
            if(gameState === 'GAMEOVER') drawGameOverScreen(ctx, score > highScore);
        }
        animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
        if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if(flashInterval) clearInterval(flashInterval);
    };
  }, [gameState, score, highScore, isFoodBlinking]);

  function drawIdleScreen(ctx: CanvasRenderingContext2D) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ff41';
      ctx.font = '16px "Press Start 2P"';
      ctx.fillText('> SNAKE.exe', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
      ctx.font = '12px "VT323"';
      ctx.fillText('PRESS START OR SPACEBAR', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
  }

  function drawPausedScreen(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ff41';
      ctx.font = '20px "Press Start 2P"';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }
  
  function drawGameOverScreen(ctx: CanvasRenderingContext2D, isNewHigh: boolean) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.textAlign = 'center';
    
    if (isNewHigh) {
        ctx.fillStyle = '#ffb300';
        ctx.font = '12px "Press Start 2P"';
        ctx.fillText('NEW HIGH SCORE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
    }
    
    ctx.fillStyle = '#ff4141';
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    
    ctx.fillStyle = '#00ff41';
    ctx.font = '20px "VT323"';
    ctx.fillText(`SCORE: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    ctx.fillStyle = '#00ff41';
    ctx.font = '12px "VT323"';
    ctx.fillText('PRESS R TO RESTART', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 h-full bg-black/50">
        <p className="font-headline text-[8px] text-primary mb-2">SNAKE.exe</p>
        <div className="w-[324px] flex justify-between font-headline text-[7px] text-primary px-1 mb-1">
            <span>SCORE: {score}</span>
            <span>HIGH: {highScore}</span>
        </div>
        <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="bg-black border-2 border-primary"
        />
        <p className="font-body text-sm text-primary/50 mt-2">WASD OR ARROW KEYS TO MOVE</p>
        <div className="flex gap-4 mt-2">
             <button
              onClick={startGame}
              className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground"
            >
              ▶ START
            </button>
             <button
              onClick={startGame}
              className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground"
            >
              ↺ RESTART
            </button>
        </div>
    </div>
  );
}
