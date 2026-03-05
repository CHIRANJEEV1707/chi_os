'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';

// --- Constants ---
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 360;
const PLAYER_WIDTH = 24;
const PLAYER_HEIGHT = 16;
const PLAYER_SPEED = 3;
const BULLET_SPEED = 7;
const ENEMY_BULLET_SPEED = 4;
const GROUND_Y = 340;

const INVADER_GRID_ROWS = 5;
const INVADER_GRID_COLS = 11;
const INVADER_SPACING = { x: 32, y: 24 };

// --- Types ---
type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'PLAYER_HIT' | 'WAVE_COMPLETE' | 'GAMEOVER';
type Player = { x: number; y: number; width: number; height: number };
type Bullet = { x: number; y: number; width: number; height: number; active: boolean };
type Invader = { x: number; y: number; width: number; height: number; type: 'A' | 'B' | 'C'; alive: boolean; points: number };
type ShieldCell = { x: number; y: number; alive: boolean };
type Shield = ShieldCell[];
type UFO = { x: number; y: number; width: number; height: number; active: boolean; direction: 'left' | 'right' };
type Explosion = { x: number, y: number, frame: number, active: boolean };
type FloatingScore = { x: number, y: number, value: number, life: number };


// --- Shape Definitions (1 = filled) ---
const PLAYER_SHAPE = [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,1,1,1,1]
];

const INVADER_SHAPES = {
    A: [[[0,1,0,1,0],[1,1,1,1,1],[0,1,0,1,0]], [[1,0,1,0,1],[0,1,1,1,0],[1,0,1,0,1]]],
    B: [[[1,0,1,0,1],[0,1,1,1,0],[1,0,0,0,1]], [[0,1,0,1,0],[1,0,0,0,1],[0,1,1,1,0]]],
    C: [[[0,1,1,1,0],[1,1,1,1,1],[1,0,1,0,1]], [[0,1,1,1,0],[1,0,1,0,1],[1,1,1,1,1]]],
};

const UFO_SHAPE = [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
];

const SHIELD_CELL_SIZE = 4;
const SHIELD_BASE_SHAPE = [
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,1,1],
    [1,0,0,0,0,0,0,1],
];

const EXPLOSION_FRAMES = 8;

export default function Invaders() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { play } = useSoundEffect();

    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [wave, setWave] = useState(1);
    
    // Refs for game objects to prevent re-renders
    const playerRef = useRef<Player>({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: GROUND_Y - PLAYER_HEIGHT - 4, width: PLAYER_WIDTH, height: PLAYER_HEIGHT });
    const playerBulletRef = useRef<Bullet>({ x: 0, y: 0, width: 2, height: 8, active: false });
    const invadersRef = useRef<Invader[]>([]);
    const enemyBulletsRef = useRef<Bullet[]>([]);
    const shieldsRef = useRef<Shield[]>([]);
    const ufoRef = useRef<UFO>({ x: 0, y: 30, width: 32, height: 16, active: false, direction: 'right' });
    const explosionRef = useRef<Explosion>({x:0, y:0, frame: 0, active: false});
    const floatingScoresRef = useRef<FloatingScore[]>([]);

    const keysPressedRef = useRef<{ [key: string]: boolean }>({});
    const invaderDirection = useRef<'left' | 'right'>('right');
    const invaderAnimationFrame = useRef(0);
    const invaderMoveTimer = useRef(0);
    const ufoSpawnTimer = useRef<NodeJS.Timeout | null>(null);
    const enemyShootTimer = useRef<NodeJS.Timeout | null>(null);
    const starfieldRef = useRef<{x:number, y:number, r:number}[]>([]);


    const createInvaders = useCallback((currentWave: number) => {
        const newInvaders: Invader[] = [];
        const startX = (CANVAS_WIDTH - (INVADER_GRID_COLS * INVADER_SPACING.x)) / 2 + 10;
        const startY = 60;
        for (let r = 0; r < INVADER_GRID_ROWS; r++) {
            for (let c = 0; c < INVADER_GRID_COLS; c++) {
                let type: 'A' | 'B' | 'C' = 'C';
                let points = 10;
                if (r === 0) { type = 'A'; points = 30; }
                else if (r <= 2) { type = 'B'; points = 20; }
                
                newInvaders.push({
                    x: startX + c * INVADER_SPACING.x,
                    y: startY + r * INVADER_SPACING.y,
                    width: type === 'A' ? 24 : 32, // Simplified width for collision
                    height: 16,
                    type,
                    alive: true,
                    points,
                });
            }
        }
        invadersRef.current = newInvaders;
    }, []);

    const createShields = useCallback(() => {
        const newShields: Shield[] = [];
        const shieldCount = 4;
        const shieldWidthPixels = SHIELD_BASE_SHAPE[0].length * SHIELD_CELL_SIZE;
        const totalShieldsWidth = shieldCount * shieldWidthPixels;
        const totalSpacing = CANVAS_WIDTH - totalShieldsWidth;
        const spacing = totalSpacing / (shieldCount + 1);

        for(let i=0; i<shieldCount; i++) {
            const shield: Shield = [];
            const startX = spacing + i * (shieldWidthPixels + spacing);
            const startY = GROUND_Y - 60;
            SHIELD_BASE_SHAPE.forEach((row, r) => {
                row.forEach((cell, c) => {
                    if (cell === 1) {
                        shield.push({
                            x: startX + c * SHIELD_CELL_SIZE,
                            y: startY + r * SHIELD_CELL_SIZE,
                            alive: true
                        });
                    }
                });
            });
            newShields.push(shield);
        }
        shieldsRef.current = newShields;
    }, []);

    const resetGame = useCallback(() => {
        setScore(0);
        setLives(3);
        setWave(1);
        playerRef.current.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
        invaderDirection.current = 'right';
        createInvaders(1);
        createShields();
        playerBulletRef.current.active = false;
        enemyBulletsRef.current = [];
        ufoRef.current.active = false;
    }, [createInvaders, createShields]);

    const startGame = useCallback(() => {
        resetGame();
        setGameState('PLAYING');
    }, [resetGame]);
    
    // --- Timed Logic ---
    useEffect(() => {
        if(gameState === 'PLAYING') {
            enemyShootTimer.current = setInterval(() => {
                if (enemyBulletsRef.current.length >= 3) return;

                const aliveInvaders = invadersRef.current.filter(inv => inv.alive);
                if (aliveInvaders.length === 0) return;

                // Find bottom-most invaders in each column
                const bottomInvaders: { [key: number]: Invader } = {};
                aliveInvaders.forEach(inv => {
                    const col = Math.floor(inv.x / INVADER_SPACING.x);
                    if (!bottomInvaders[col] || inv.y > bottomInvaders[col].y) {
                        bottomInvaders[col] = inv;
                    }
                });

                const shooters = Object.values(bottomInvaders);
                const randomShooter = shooters[Math.floor(Math.random() * shooters.length)];
                
                enemyBulletsRef.current.push({
                    x: randomShooter.x + randomShooter.width / 2,
                    y: randomShooter.y + randomShooter.height,
                    width: 2, height: 8, active: true
                });

            }, 1200);

            ufoSpawnTimer.current = setInterval(() => {
                if (ufoRef.current.active) return;
                ufoRef.current.active = true;
                ufoRef.current.direction = Math.random() > 0.5 ? 'left' : 'right';
                ufoRef.current.x = ufoRef.current.direction === 'right' ? -ufoRef.current.width : CANVAS_WIDTH;
            }, Math.random() * 15000 + 15000);

        } else {
            if (enemyShootTimer.current) clearInterval(enemyShootTimer.current);
            if (ufoSpawnTimer.current) clearInterval(ufoSpawnTimer.current);
        }

        return () => {
            if (enemyShootTimer.current) clearInterval(enemyShootTimer.current);
            if (ufoSpawnTimer.current) clearInterval(ufoSpawnTimer.current);
        };
    }, [gameState]);


    // --- Game Loop ---
    const gameLoop = useCallback((timestamp) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || gameState === 'IDLE' || gameState === 'PAUSED') return;

        // --- UPDATE LOGIC ---
        if (gameState === 'PLAYING') {
            // Player movement
            if (keysPressedRef.current['ArrowLeft'] || keysPressedRef.current['a']) {
                playerRef.current.x = Math.max(10, playerRef.current.x - PLAYER_SPEED);
            }
            if (keysPressedRef.current['ArrowRight'] || keysPressedRef.current['d']) {
                playerRef.current.x = Math.min(CANVAS_WIDTH - PLAYER_WIDTH - 10, playerRef.current.x + PLAYER_SPEED);
            }
            
            // Player shoot
            if (keysPressedRef.current[' '] && !playerBulletRef.current.active) {
                playerBulletRef.current.active = true;
                playerBulletRef.current.x = playerRef.current.x + PLAYER_WIDTH / 2 - playerBulletRef.current.width / 2;
                playerBulletRef.current.y = playerRef.current.y;
                play('click');
            }

            // Update player bullet
            if (playerBulletRef.current.active) {
                playerBulletRef.current.y -= BULLET_SPEED;
                if (playerBulletRef.current.y < 0) {
                    playerBulletRef.current.active = false;
                }
            }
            
            // Update enemy bullets
            enemyBulletsRef.current.forEach(bullet => {
                if(bullet.active) {
                    bullet.y += ENEMY_BULLET_SPEED;
                    if (bullet.y > CANVAS_HEIGHT) bullet.active = false;
                }
            });

            // Update Invaders
            const aliveInvaders = invadersRef.current.filter(i => i.alive);
            const remainingCount = aliveInvaders.length;
            const speed = 0.5 + (55 - remainingCount) * 0.04;
            let wallHit = false;
            let moveDown = false;

            if (invaderDirection.current === 'right') {
                invadersRef.current.forEach(inv => inv.x += speed);
                const rightmostInvader = Math.max(...aliveInvaders.map(i => i.x + i.width));
                if (rightmostInvader > CANVAS_WIDTH - 20) {
                    wallHit = true;
                    invaderDirection.current = 'left';
                    moveDown = true;
                }
            } else { // moving left
                invadersRef.current.forEach(inv => inv.x -= speed);
                const leftmostInvader = Math.min(...aliveInvaders.map(i => i.x));
                if (leftmostInvader < 20) {
                    wallHit = true;
                    invaderDirection.current = 'right';
                    moveDown = true;
                }
            }

            if(moveDown) {
                invadersRef.current.forEach(inv => inv.y += 16);
            }
            
            invaderMoveTimer.current += 1;
            if(invaderMoveTimer.current > (30 - remainingCount * 0.4)) {
                invaderAnimationFrame.current = 1 - invaderAnimationFrame.current;
                invaderMoveTimer.current = 0;
            }
            
            // Check if invaders reached player
            const lowestInvader = Math.max(...aliveInvaders.map(i => i.y + i.height));
            if (lowestInvader >= playerRef.current.y) {
                setGameState('GAMEOVER');
                play('error');
            }
            
            // Update UFO
            if (ufoRef.current.active) {
                const ufoSpeed = 2;
                if(ufoRef.current.direction === 'right') {
                    ufoRef.current.x += ufoSpeed;
                    if(ufoRef.current.x > CANVAS_WIDTH) ufoRef.current.active = false;
                } else {
                    ufoRef.current.x -= ufoSpeed;
                     if(ufoRef.current.x < -ufoRef.current.width) ufoRef.current.active = false;
                }
            }

            // Update floating scores
            floatingScoresRef.current = floatingScoresRef.current.filter(fs => fs.life > 0);
            floatingScoresRef.current.forEach(fs => {
                fs.y -= 1;
                fs.life -= 1;
            });


            // --- COLLISION DETECTION ---
            const checkRectCollision = (r1: any, r2: any) => 
                r1.x < r2.x + r2.width &&
                r1.x + r1.width > r2.x &&
                r1.y < r2.y + r2.height &&
                r1.y + r1.height > r2.y;

            // Player bullet vs invaders
            if(playerBulletRef.current.active) {
                for (const invader of invadersRef.current) {
                    if (invader.alive && checkRectCollision(playerBulletRef.current, invader)) {
                        invader.alive = false;
                        playerBulletRef.current.active = false;
                        setScore(s => s + invader.points);
                        play('click');
                        break;
                    }
                }
            }
            // Player bullet vs ufo
             if(playerBulletRef.current.active && ufoRef.current.active) {
                if (checkRectCollision(playerBulletRef.current, ufoRef.current)) {
                    ufoRef.current.active = false;
                    playerBulletRef.current.active = false;
                    const ufoScores = [50, 100, 150, 300];
                    const ufoScore = ufoScores[Math.floor(Math.random() * ufoScores.length)];
                    setScore(s => s + ufoScore);
                    floatingScoresRef.current.push({x: ufoRef.current.x, y: ufoRef.current.y, value: ufoScore, life: 60});
                    play('success');
                }
            }
            // Player bullet vs shields
            if(playerBulletRef.current.active) {
                for(const shield of shieldsRef.current) {
                    for(const cell of shield) {
                        if(cell.alive && checkRectCollision(playerBulletRef.current, {x: cell.x, y: cell.y, width: SHIELD_CELL_SIZE, height: SHIELD_CELL_SIZE})) {
                            cell.alive = false;
                            playerBulletRef.current.active = false;
                            play('click');
                            break;
                        }
                    }
                     if(!playerBulletRef.current.active) break;
                }
            }
            
            // Enemy bullets vs player
            for(const bullet of enemyBulletsRef.current) {
                if(bullet.active && checkRectCollision(bullet, playerRef.current)) {
                    bullet.active = false;
                    setLives(l => l - 1);
                    setGameState('PLAYER_HIT');
                    explosionRef.current = {x: playerRef.current.x, y: playerRef.current.y, frame: 0, active: true};
                    play('error');
                    break;
                }
            }
            // Enemy bullets vs shields
            for(const bullet of enemyBulletsRef.current) {
                 if(bullet.active) {
                    for(const shield of shieldsRef.current) {
                        for(const cell of shield) {
                            if(cell.alive && checkRectCollision(bullet, {x: cell.x, y: cell.y, width: SHIELD_CELL_SIZE, height: SHIELD_CELL_SIZE})) {
                                cell.alive = false;
                                bullet.active = false;
                                break;
                            }
                        }
                         if(!bullet.active) break;
                    }
                 }
            }
            
            // Check wave complete
            if (aliveInvaders.length === 0) {
                setGameState('WAVE_COMPLETE');
                setWave(w => w + 1);
                setTimeout(() => {
                    createInvaders(wave + 1);
                    invaderDirection.current = 'right';
                    enemyBulletsRef.current = [];
                    setGameState('PLAYING');
                }, 2000);
            }

        } else if (gameState === 'PLAYER_HIT') {
             explosionRef.current.frame++;
             if(explosionRef.current.frame >= EXPLOSION_FRAMES * 4) {
                 explosionRef.current.active = false;
                 if(lives -1 <= 0) {
                     setGameState('GAMEOVER');
                 } else {
                    playerRef.current.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
                    setGameState('PLAYING');
                 }
             }
        }
        
        // --- DRAW LOGIC ---
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw starfield
        starfieldRef.current.forEach(star => {
            ctx.fillStyle = 'rgba(0, 255, 65, 0.4)';
            ctx.fillRect(star.x, star.y, star.r, star.r);
        });

        // Draw ground line
        ctx.fillStyle = '#00ff41';
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 2);

        // Draw shields
        ctx.fillStyle = '#00b32c';
        shieldsRef.current.forEach(shield => {
            shield.forEach(cell => {
                if (cell.alive) {
                    ctx.fillRect(cell.x, cell.y, SHIELD_CELL_SIZE, SHIELD_CELL_SIZE);
                }
            });
        });
        
        // Draw player bullet
        if (playerBulletRef.current.active) {
            ctx.fillStyle = '#00ff41';
            ctx.fillRect(playerBulletRef.current.x, playerBulletRef.current.y, playerBulletRef.current.width, playerBulletRef.current.height);
        }

        // Draw enemy bullets
        ctx.fillStyle = '#ff4141';
        enemyBulletsRef.current.forEach(bullet => {
             if (bullet.active) {
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            }
        });

        // Draw player
        if (gameState === 'PLAYING') {
            drawPixelArt(ctx, PLAYER_SHAPE, playerRef.current.x, playerRef.current.y, 4, '#00ff41');
        }
        
        // Draw explosion
        if (explosionRef.current.active) {
             const frame = Math.floor(explosionRef.current.frame / 4);
             const size = (frame + 1) * 4;
             const alpha = 1 - (frame / EXPLOSION_FRAMES);
             ctx.fillStyle = `rgba(255, 65, 65, ${alpha})`;
             for(let i=0; i< (frame+1) * 5; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.random() * size;
                ctx.fillRect(explosionRef.current.x + PLAYER_WIDTH/2 + Math.cos(angle) * radius, explosionRef.current.y + PLAYER_HEIGHT/2 + Math.sin(angle) * radius, 2, 2);
             }
        }
        
        // Draw invaders
        invadersRef.current.forEach(inv => {
            if (inv.alive) {
                const shape = INVADER_SHAPES[inv.type][invaderAnimationFrame.current];
                const color = inv.type === 'A' ? '#00ff41' : inv.type === 'B' ? '#00dd38' : '#00bb30';
                drawPixelArt(ctx, shape, inv.x, inv.y, 4, color);
            }
        });
        
        // Draw UFO
        if (ufoRef.current.active) {
            drawPixelArt(ctx, UFO_SHAPE, ufoRef.current.x, ufoRef.current.y, 4, '#ff4141');
        }
        
        // Draw floating scores
        floatingScoresRef.current.forEach(fs => {
            ctx.fillStyle = `rgba(255, 179, 0, ${fs.life / 60})`;
            ctx.font = '10px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(fs.value.toString(), fs.x + 16, fs.y);
        });

        // --- OVERLAYS ---
        if (gameState === 'WAVE_COMPLETE') {
            ctx.fillStyle = '#00ff41';
            ctx.font = '12px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(`WAVE ${wave} COMPLETE!`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        } else if (gameState === 'PAUSED') {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#00ff41';
            ctx.font = '12px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        } else if (gameState === 'GAMEOVER') {
             ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#ff4141';
            ctx.font = '12px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 20);
            ctx.fillStyle = '#00ff41';
            ctx.font = '20px "VT323"';
            ctx.fillText(`SCORE: ${score}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 10);
            if (score > 0 && score === highScore) {
                 ctx.fillStyle = '#ffb300';
                 ctx.font = '10px "Press Start 2P"';
                 ctx.fillText('NEW HI-SCORE!', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 40);
            }
        }
        
        requestAnimationFrame(gameLoop);
    }, [gameState, wave, score, highScore, lives, play]);
    
    // Draw pixel art helper
    const drawPixelArt = (ctx: CanvasRenderingContext2D, shape: number[][], x: number, y: number, pixelSize: number, color: string) => {
        ctx.fillStyle = color;
        shape.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell === 1) {
                    ctx.fillRect(x + c * pixelSize, y + r * pixelSize, pixelSize, pixelSize);
                }
            });
        });
    }
    
    // Initial setup effect
    useEffect(() => {
        setHighScore(Number(localStorage.getItem('chiru-os-invaders-high')) || 0);
        // Create starfield
        for (let i = 0; i < 50; i++) {
            starfieldRef.current.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                r: Math.random() * 1.5 + 0.5
            });
        }
    }, []);

    // Game state effect
    useEffect(() => {
        if (gameState === 'PLAYING') {
            requestAnimationFrame(gameLoop);
        }
        
        if (gameState === 'GAMEOVER') {
            if(score > highScore) {
                setHighScore(score);
                localStorage.setItem('chiru-os-invaders-high', score.toString());
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            keysPressedRef.current[e.key] = true;
             if (e.key === ' ' || e.code === 'Space') e.preventDefault();

            if (gameState === 'IDLE' && e.key === ' ') startGame();
            if (gameState === 'GAMEOVER' && e.key === ' ') startGame();
            if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
                if(gameState === 'PLAYING') setGameState('PAUSED');
                else if (gameState === 'PAUSED') setGameState('PLAYING');
            }
            if (e.key.toLowerCase() === 'r') startGame();
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressedRef.current[e.key] = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };

    }, [gameState, gameLoop, startGame, score, highScore]);

    return (
        <div className="flex flex-col items-center justify-center p-2 h-full bg-black/50">
            <p className="font-headline text-[8px] text-primary mb-2">INVADERS.exe</p>
            <div className="w-[484px] font-headline text-[7px] px-1 mb-1 flex justify-between">
                <span className="text-primary">SCORE: {score.toString().padStart(6, '0')}</span>
                <span className="text-[#ffb300]">HI: {highScore.toString().padStart(6, '0')}</span>
                <span className="text-destructive">LIVES: {'♥'.repeat(lives)}</span>
            </div>
            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-black border-2 border-primary">
                {gameState === 'IDLE' && (
                    // This will be drawn on canvas instead
                    <div />
                )}
            </canvas>
             <p className="font-body text-sm text-primary/50 mt-2 text-center">
                ←→ MOVE    SPACE SHOOT
            </p>
        </div>
    )
}
