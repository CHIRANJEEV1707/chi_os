'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { cn } from '@/lib/utils';

// --- Constants & Types ---
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;
const PADDLE_WIDTH = 8;
const PADDLE_HEIGHT = 64;
const BALL_SIZE = 8;
const PADDLE_SPEED = 4;
const AI_SPEED = 3;
const WINNING_SCORE = 7;

type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'POINT' | 'GAMEOVER';
type GameMode = 'VS AI' | '2 PLAYER';

const DIGIT_MAP: { [key: number]: number[][] } = {
    0: [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
    1: [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
    2: [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
    3: [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
    4: [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
    5: [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
    6: [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
    7: [[1,1,1],[0,0,1],[0,1,0],[0,1,0],[0,1,0]],
    8: [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
    9: [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
};
const DIGIT_PIXEL_SIZE = 4;


// --- Component ---
export default function Pong() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { play } = useSoundEffect();

    // Game State
    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [gameMode, setGameMode] = useState<GameMode>('VS AI');
    const [score, setScore] = useState({ p1: 0, p2: 0 });
    const [lastScorer, setLastScorer] = useState<'p1' | 'p2' | null>(null);

    // Game Object Refs
    const paddlesRef = useRef({
        p1: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
        p2: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    });
    const ballRef = useRef({
        x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
        y: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
        dx: 3,
        dy: 3,
    });
    const keysPressedRef = useRef({ w: false, s: false, up: false, down: false });
    const animationFrameId = useRef<number>();

    // --- Game Logic ---
    const resetBall = useCallback((serveLeft = true) => {
        ballRef.current = {
            x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
            y: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
            dx: serveLeft ? -3 : 3,
            dy: Math.random() > 0.5 ? 3 : -3,
        };
    }, []);

    const resetGame = useCallback(() => {
        setScore({ p1: 0, p2: 0 });
        paddlesRef.current.p1.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        paddlesRef.current.p2.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        resetBall();
        setGameState('IDLE');
    }, [resetBall]);

    const startGame = useCallback(() => {
        setScore({ p1: 0, p2: 0 });
        resetBall();
        setGameState('PLAYING');
        play('success');
    }, [resetBall, play]);

    // --- Game Loop ---
    const gameLoop = useCallback(() => {
        if (gameState !== 'PLAYING') {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            return;
        }

        // Update Paddles
        const p1 = paddlesRef.current.p1;
        const p2 = paddlesRef.current.p2;

        if (keysPressedRef.current.w) p1.y = Math.max(0, p1.y - PADDLE_SPEED);
        if (keysPressedRef.current.s) p1.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, p1.y + PADDLE_SPEED);

        if (gameMode === '2 PLAYER') {
            if (keysPressedRef.current.up) p2.y = Math.max(0, p2.y - PADDLE_SPEED);
            if (keysPressedRef.current.down) p2.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, p2.y + PADDLE_SPEED);
        } else { // VS AI
            const ballCenterY = ballRef.current.y + BALL_SIZE / 2;
            const paddleCenterY = p2.y + PADDLE_HEIGHT / 2;
            const dy = ballCenterY - paddleCenterY;
            p2.y += Math.max(-AI_SPEED, Math.min(AI_SPEED, dy * 0.08));
            p2.y = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, p2.y));
        }

        // Update Ball
        const ball = ballRef.current;
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collision (top/bottom)
        if (ball.y <= 0 || ball.y + BALL_SIZE >= CANVAS_HEIGHT) {
            ball.dy *= -1;
            play('click');
        }

        // Paddle collision
        const ballRect = { x: ball.x, y: ball.y, width: BALL_SIZE, height: BALL_SIZE };
        const p1Rect = { x: 0, y: p1.y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
        const p2Rect = { x: CANVAS_WIDTH - PADDLE_WIDTH, y: p2.y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };

        const checkCollision = (rect1: any, rect2: any) => 
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
        

        if (checkCollision(ballRect, p1Rect)) {
            const hitPos = (ball.y + BALL_SIZE/2 - p1.y) / PADDLE_HEIGHT;
            if(hitPos < 1/3) ball.dy = -3;
            else if(hitPos > 2/3) ball.dy = 3;
            else ball.dy = Math.random() > 0.5 ? 0.5 : -0.5;

            ball.dx = Math.min(8, Math.abs(ball.dx) * 1.05);
            ball.x = p1Rect.x + p1Rect.width; // prevent sticking
            play('click');
        }

        if (checkCollision(ballRect, p2Rect)) {
            const hitPos = (ball.y + BALL_SIZE/2 - p2.y) / PADDLE_HEIGHT;
            if(hitPos < 1/3) ball.dy = -3;
            else if(hitPos > 2/3) ball.dy = 3;
            else ball.dy = Math.random() > 0.5 ? 0.5 : -0.5;
            
            ball.dx = Math.max(-8, -Math.abs(ball.dx) * 1.05);
            ball.x = p2Rect.x - ballRect.width; // prevent sticking
            play('click');
        }

        // Scoring
        if (ball.x + BALL_SIZE < 0) { // P2 scores
            setScore(s => ({ ...s, p2: s.p2 + 1 }));
            setLastScorer('p2');
            resetBall(true);
            setGameState('POINT');
        } else if (ball.x > CANVAS_WIDTH) { // P1 scores
            setScore(s => ({ ...s, p1: s.p1 + 1 }));
            setLastScorer('p1');
            resetBall(false);
            setGameState('POINT');
        }

        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [gameState, gameMode, play, resetBall]);

    // --- Drawing ---
    const draw = useCallback((ctx: CanvasRenderingContext2D, flash: boolean) => {
        // Clear
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Center line
        ctx.fillStyle = '#003300';
        for (let i = 4; i < CANVAS_HEIGHT; i += 8) {
            ctx.fillRect(CANVAS_WIDTH / 2 - 2, i, 4, 4);
        }

        // Draw Scores
        const drawDigit = (digit: number, x: number, y: number, isFlashing: boolean) => {
            const map = DIGIT_MAP[digit] || DIGIT_MAP[0];
            ctx.fillStyle = isFlashing && flash ? '#ffb300' : '#003300';
            map.forEach((row, r) => {
                row.forEach((col, c) => {
                    if (col === 1) {
                        ctx.fillRect(
                            x + c * DIGIT_PIXEL_SIZE,
                            y + r * DIGIT_PIXEL_SIZE,
                            DIGIT_PIXEL_SIZE,
                            DIGIT_PIXEL_SIZE
                        );
                    }
                });
            });
        }
        drawDigit(score.p1, CANVAS_WIDTH / 4, 20, lastScorer === 'p1');
        drawDigit(score.p2, CANVAS_WIDTH * 3/4 - (3 * DIGIT_PIXEL_SIZE), 20, lastScorer === 'p2');


        if (gameState === 'IDLE') {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#00ff41';
            ctx.font = '16px "Press Start 2P"';
            ctx.fillText('PONG.exe', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
            ctx.font = '12px "VT323"';
            ctx.fillText('PRESS SPACE TO START', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
        }

        // Paddles and Ball
        if (gameState !== 'IDLE') {
            ctx.fillStyle = '#00ff41';
            ctx.fillRect(PADDLE_WIDTH, paddlesRef.current.p1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
            ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH * 2, paddlesRef.current.p2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
            if (gameState !== 'POINT') {
                ctx.fillRect(ballRef.current.x, ballRef.current.y, BALL_SIZE, BALL_SIZE);
            }
        }
        
        if (gameState === 'PAUSED') {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#00ff41';
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
            ctx.font = '10px "VT323"';
            ctx.fillText('PRESS SPACE TO RESUME', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
        }
        
        if (gameState === 'GAMEOVER') {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffb300';
            ctx.font = '10px "Press Start 2P"';
            const winner = score.p1 > score.p2 
                ? gameMode === 'VS AI' ? 'YOU WIN!' : 'PLAYER 1 WINS!'
                : gameMode === 'VS AI' ? 'CPU WINS!' : 'PLAYER 2 WINS!';
            ctx.fillText(winner, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
            ctx.fillStyle = '#00ff41';
            ctx.font = '16px "VT323"';
            ctx.fillText('PRESS R TO PLAY AGAIN', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
        }

    }, [gameState, gameMode, score, lastScorer]);

    // --- Effects ---
    useEffect(() => {
        resetGame();
    }, [gameMode, resetGame]);

    useEffect(() => {
        if (gameState === 'POINT') {
            if ((score.p1 >= WINNING_SCORE || score.p2 >= WINNING_SCORE)) {
                setGameState('GAMEOVER');
                play('success');
            } else {
                play('error');
                const timer = setTimeout(() => {
                    setGameState('PLAYING');
                    setLastScorer(null);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [score, gameState, play]);


    useEffect(() => {
        let renderLoopId: number;

        if (gameState === 'PLAYING') {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let flash = false;
        const flashInterval = setInterval(() => {
            flash = !flash;
        }, 250);

        const renderLoop = () => {
            draw(ctx, flash);
            renderLoopId = requestAnimationFrame(renderLoop);
        };
        renderLoopId = requestAnimationFrame(renderLoop);

        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            cancelAnimationFrame(renderLoopId);
            clearInterval(flashInterval);
        };
    }, [gameState, gameLoop, draw]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key.toLowerCase()) {
                case 'w': keysPressedRef.current.w = true; break;
                case 's': keysPressedRef.current.s = true; break;
                case 'arrowup': e.preventDefault(); keysPressedRef.current.up = true; break;
                case 'arrowdown': e.preventDefault(); keysPressedRef.current.down = true; break;
                case ' ':
                    e.preventDefault();
                    if (gameState === 'IDLE' || gameState === 'GAMEOVER') startGame();
                    else if (gameState === 'PLAYING') setGameState('PAUSED');
                    else if (gameState === 'PAUSED') setGameState('PLAYING');
                    break;
                case 'r':
                    e.preventDefault();
                    resetGame();
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
             switch (e.key.toLowerCase()) {
                case 'w': keysPressedRef.current.w = false; break;
                case 's': keysPressedRef.current.s = false; break;
                case 'arrowup': keysPressedRef.current.up = false; break;
                case 'arrowdown': keysPressedRef.current.down = false; break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState, resetGame, startGame]);
    
    const p1Label = gameMode === 'VS AI' ? 'YOU' : 'PLAYER 1';
    const p2Label = gameMode === 'VS AI' ? 'CPU' : 'PLAYER 2';

    return (
        <div className="flex flex-col items-center justify-center p-2 h-full bg-black/50">
            <p className="font-headline text-[8px] text-primary mb-2">PONG.exe</p>
            {gameState === 'IDLE' && (
                <div className="flex gap-2 mb-2">
                    <button onClick={() => setGameMode('VS AI')} className={cn("font-headline text-[7px] px-3 py-1 border-2 border-primary/50", gameMode === 'VS AI' ? "bg-primary text-primary-foreground" : "text-primary hover:bg-accent hover:text-accent-foreground")}>VS AI</button>
                    <button onClick={() => setGameMode('2 PLAYER')} className={cn("font-headline text-[7px] px-3 py-1 border-2 border-primary/50", gameMode === '2 PLAYER' ? "bg-primary text-primary-foreground" : "text-primary hover:bg-accent hover:text-accent-foreground")}>2 PLAYER</button>
                </div>
            )}
             <div className="w-[484px] font-headline text-[8px] text-primary px-1 mb-1 flex justify-between">
                <span>{p1Label} {score.p1}</span>
                <span>{score.p2} {p2Label}</span>
            </div>
            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-black border-2 border-primary" />
            <p className="font-body text-sm text-primary/50 mt-2">
                {gameMode === 'VS AI' ? "W/S — MOVE | SPACE — PAUSE" : "W/S — P1 | ↑/↓ — P2 | SPACE — PAUSE"}
            </p>
        </div>
    );
}
