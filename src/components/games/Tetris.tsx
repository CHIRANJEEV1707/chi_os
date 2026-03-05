'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { cn } from '@/lib/utils';

// --- Constants ---
const CANVAS_WIDTH = 240;
const CANVAS_HEIGHT = 480;
const GRID_COLS = 10;
const GRID_ROWS = 20;
const CELL_SIZE = CANVAS_WIDTH / GRID_COLS;

const PIECE_COLORS = {
  I: '#00ff41',
  O: '#00dd38',
  T: '#00bb30',
  S: '#009928',
  Z: '#007720',
  J: '#005518',
  L: '#003310',
};

const PIECE_SHAPES: { [key: string]: number[][][] } = {
  I: [[[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]],
  O: [[[1,1],[1,1]]],
  T: [[[0,1,0],[1,1,1],[0,0,0]], [[0,1,0],[0,1,1],[0,1,0]], [[0,0,0],[1,1,1],[0,1,0]], [[0,1,0],[1,1,0],[0,1,0]]],
  S: [[[0,1,1],[1,1,0],[0,0,0]], [[0,1,0],[0,1,1],[0,0,1]]],
  Z: [[[1,1,0],[0,1,1],[0,0,0]], [[0,0,1],[0,1,1],[0,1,0]]],
  J: [[[1,0,0],[1,1,1],[0,0,0]], [[0,1,1],[0,1,0],[0,1,0]], [[0,0,0],[1,1,1],[0,0,1]], [[0,1,0],[0,1,0],[1,1,0]]],
  L: [[[0,0,1],[1,1,1],[0,0,0]], [[0,1,0],[0,1,0],[0,1,1]], [[0,0,0],[1,1,1],[1,0,0]], [[1,1,0],[0,1,0],[0,1,0]]],
};

const LINE_CLEAR_SCORES = [0, 100, 300, 500, 800];
const LOCK_DELAY = 500;
const LINES_PER_LEVEL = 10;
const NEXT_PIECE_CANVAS_SIZE = 80;

type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'LINE_CLEAR';
type Board = (string | number)[][];
type Piece = {
    type: keyof typeof PIECE_SHAPES;
    shape: number[][];
    color: string;
    pos: { x: number; y: number };
    rotation: number;
}

// --- Helper Functions ---
const createEmptyBoard = (): Board => Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0));

// --- Main Component ---
export default function Tetris() {
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const nextCanvasRef = useRef<HTMLCanvasElement>(null);
    const { play } = useSoundEffect();

    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [lines, setLines] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const boardRef = useRef<Board>(createEmptyBoard());
    const playerRef = useRef<Piece | null>(null);
    const nextPieceRef = useRef<Piece | null>(null);
    const bagRef = useRef<string[]>([]);
    const gameLoopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lockDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const animationFrameRef = useRef<number>();

    // --- Game Logic Callbacks ---
    const resetBag = useCallback(() => {
        const pieces = Object.keys(PIECE_SHAPES);
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        bagRef.current = pieces;
    }, []);

    const getNextPiece = useCallback(() => {
        if (bagRef.current.length === 0) resetBag();
        const type = bagRef.current.pop() as keyof typeof PIECE_SHAPES;
        const piece: Piece = {
            type,
            shape: PIECE_SHAPES[type][0],
            color: PIECE_COLORS[type],
            pos: { x: Math.floor(GRID_COLS / 2) - 1, y: 0 },
            rotation: 0,
        };
        return piece;
    }, [resetBag]);

    const resetPlayer = useCallback(() => {
        playerRef.current = nextPieceRef.current;
        nextPieceRef.current = getNextPiece();

        if (playerRef.current) {
            playerRef.current.pos = {
                x: Math.floor(GRID_COLS / 2) - Math.floor(playerRef.current.shape[0].length / 2),
                y: 0,
            };

            if (checkCollision(playerRef.current, boardRef.current)) {
                setGameState('GAMEOVER');
                if (score > highScore) {
                    localStorage.setItem('chiru-os-tetris-high', score.toString());
                    setHighScore(score);
                }
                play('error');
            }
        }
    }, [getNextPiece, score, highScore, play]);

    const startGame = useCallback(() => {
        boardRef.current = createEmptyBoard();
        resetBag();
        nextPieceRef.current = getNextPiece();
        resetPlayer();
        setScore(0);
        setLevel(1);
        setLines(0);
        setGameState('PLAYING');
        play('success');
    }, [resetBag, getNextPiece, resetPlayer, play]);

    const checkCollision = (piece: Piece, board: Board, offset = { x: 0, y: 0 }): boolean => {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const newY = y + piece.pos.y + offset.y;
                    const newX = x + piece.pos.x + offset.x;
                    if (newY >= GRID_ROWS || newX < 0 || newX >= GRID_COLS || (board[newY] && board[newY][newX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const lockPiece = useCallback(() => {
        if (!playerRef.current) return;
        const newBoard = boardRef.current.map(row => [...row]);
        playerRef.current.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    newBoard[y + playerRef.current!.pos.y][x + playerRef.current!.pos.x] = playerRef.current!.color;
                }
            });
        });
        
        let linesCleared = 0;
        for (let y = newBoard.length - 1; y >= 0; y--) {
            if (newBoard[y].every(cell => cell !== 0)) {
                newBoard.splice(y, 1);
                linesCleared++;
            }
        }
        while (newBoard.length < GRID_ROWS) {
            newBoard.unshift(Array(GRID_COLS).fill(0));
        }
        boardRef.current = newBoard;

        if (linesCleared > 0) {
            setLines(l => l + linesCleared);
            setScore(s => s + LINE_CLEAR_SCORES[linesCleared] * level);
            setLevel(l => Math.floor((lines + linesCleared) / LINES_PER_LEVEL) + 1);
            if (linesCleared === 4) play('success');
            else play('click');
        }

        resetPlayer();
    }, [level, lines, resetPlayer, play]);
    
    const drop = useCallback((isSoftDrop: boolean) => {
        if (!playerRef.current || gameState !== 'PLAYING') return false;
        if (lockDelayTimeoutRef.current) clearTimeout(lockDelayTimeoutRef.current);

        if (!checkCollision(playerRef.current, boardRef.current, { x: 0, y: 1 })) {
            playerRef.current.pos.y++;
            if (isSoftDrop) setScore(s => s + 1);
            return true;
        } else {
            lockDelayTimeoutRef.current = setTimeout(() => lockPiece(), LOCK_DELAY);
            return false;
        }
    }, [gameState, lockPiece]);

    const hardDrop = () => {
        if (!playerRef.current || gameState !== 'PLAYING') return;
        let rowsDropped = 0;
        while (!checkCollision(playerRef.current, boardRef.current, { x: 0, y: 1 })) {
            playerRef.current.pos.y++;
            rowsDropped++;
        }
        setScore(s => s + rowsDropped * 2);
        lockPiece();
    };

    const move = (dir: number) => {
        if (!playerRef.current || gameState !== 'PLAYING') return;
        if (!checkCollision(playerRef.current, boardRef.current, { x: dir, y: 0 })) {
            playerRef.current.pos.x += dir;
            play('click');
        }
    };
    
    const rotate = () => {
        if (!playerRef.current || gameState !== 'PLAYING') return;
        const originalRotation = playerRef.current.rotation;
        const newRotation = (playerRef.current.rotation + 1) % PIECE_SHAPES[playerRef.current.type].length;
        const originalShape = playerRef.current.shape;
        playerRef.current.shape = PIECE_SHAPES[playerRef.current.type][newRotation];
        
        let offset = 0;
        const kicks = [0, 1, -1, 2, -2]; // Wall kicks
        for(const kick of kicks) {
             if (!checkCollision(playerRef.current, boardRef.current, { x: kick, y: 0 })) {
                 offset = kick;
                 break;
             }
        }
        
        if (offset !== 0 || !checkCollision(playerRef.current, boardRef.current)) {
             playerRef.current.pos.x += offset;
             playerRef.current.rotation = newRotation;
             play('click');
        } else {
             playerRef.current.shape = originalShape; // Revert rotation
        }
    };

    // --- Effects ---
    useEffect(() => {
        setHighScore(Number(localStorage.getItem('chiru-os-tetris-high')) || 0);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState === 'IDLE' && e.code === 'Space') { startGame(); return; }
            if (gameState === 'GAMEOVER' && e.code === 'Space') { startGame(); return; }
            if (e.key.toLowerCase() === 'p' || e.code === 'Escape') {
                if (gameState === 'PLAYING') setGameState('PAUSED');
                else if (gameState === 'PAUSED') setGameState('PLAYING');
            }
            if (e.key.toLowerCase() === 'r') { startGame(); }
            if (gameState !== 'PLAYING') return;

            switch (e.key.toLowerCase()) {
                case 'arrowleft': case 'a': move(-1); break;
                case 'arrowright': case 'd': move(1); break;
                case 'arrowdown': case 's': drop(true); break;
                case 'arrowup': case 'w': case 'x': rotate(); break;
                case ' ': case 'spacebar': hardDrop(); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, startGame, drop]);

    useEffect(() => {
        const gameTick = () => {
            if (gameState === 'PLAYING') {
                drop(false);
            }
            const dropSpeed = Math.max(100, 800 - (level - 1) * 70);
            gameLoopTimeoutRef.current = setTimeout(gameTick, dropSpeed);
        };
        if (gameState === 'PLAYING') {
            gameLoopTimeoutRef.current = setTimeout(gameTick, 800);
        }
        return () => {
            if (gameLoopTimeoutRef.current) clearTimeout(gameLoopTimeoutRef.current);
            if (lockDelayTimeoutRef.current) clearTimeout(lockDelayTimeoutRef.current);
        };
    }, [gameState, level, drop]);
    
    useEffect(() => {
      const draw = () => {
        const mainCtx = mainCanvasRef.current?.getContext('2d');
        const nextCtx = nextCanvasRef.current?.getContext('2d');
        if (!mainCtx || !nextCtx) return;

        // Clear main canvas
        mainCtx.fillStyle = '#000000';
        mainCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw grid
        mainCtx.strokeStyle = '#001a00';
        for (let i = 1; i < GRID_COLS; i++) mainCtx.fillRect(i * CELL_SIZE - 0.5, 0, 1, CANVAS_HEIGHT);
        for (let i = 1; i < GRID_ROWS; i++) mainCtx.fillRect(0, i * CELL_SIZE - 0.5, CANVAS_WIDTH, 1);

        // Draw locked pieces
        boardRef.current.forEach((row, y) => row.forEach((cell, x) => {
          if (cell !== 0) {
            mainCtx.fillStyle = cell as string;
            mainCtx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          }
        }));

        if(gameState !== 'IDLE') {
            // Draw ghost piece
            if (playerRef.current) {
                let ghostY = playerRef.current.pos.y;
                while (!checkCollision(playerRef.current, boardRef.current, {x:0, y: ghostY - playerRef.current.pos.y + 1})) {
                    ghostY++;
                }
                mainCtx.strokeStyle = '#002200';
                mainCtx.lineWidth = 2;
                playerRef.current.shape.forEach((row, y) => row.forEach((val, x) => {
                    if (val) mainCtx.strokeRect((playerRef.current!.pos.x + x) * CELL_SIZE + 1, (ghostY + y) * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                }));
            }

            // Draw player piece
            if (playerRef.current) {
                mainCtx.fillStyle = playerRef.current.color;
                playerRef.current.shape.forEach((row, y) => row.forEach((val, x) => {
                    if (val) mainCtx.fillRect((playerRef.current!.pos.x + x) * CELL_SIZE + 1, (playerRef.current!.pos.y + y) * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                }));
            }
        }
        
        // Clear and draw next piece
        nextCtx.fillStyle = '#000000';
        nextCtx.fillRect(0, 0, NEXT_PIECE_CANVAS_SIZE, NEXT_PIECE_CANVAS_SIZE);
        if (nextPieceRef.current) {
            const piece = nextPieceRef.current;
            const size = piece.shape.length;
            const cellSize = NEXT_PIECE_CANVAS_SIZE / 4;
            const offset = {
                x: (NEXT_PIECE_CANVAS_SIZE - size * cellSize) / 2,
                y: (NEXT_PIECE_CANVAS_SIZE - size * cellSize) / 2,
            };
            nextCtx.fillStyle = piece.color;
            piece.shape.forEach((row, y) => row.forEach((val, x) => {
                if (val) nextCtx.fillRect(offset.x + x * cellSize + 1, offset.y + y * cellSize + 1, cellSize - 2, cellSize - 2);
            }));
        }

        // Draw overlays
        if (gameState === 'IDLE') {
            mainCtx.textAlign = 'center';
            mainCtx.fillStyle = '#00ff41';
            mainCtx.font = '14px "Press Start 2P"';
            mainCtx.fillText('> TETRIS.exe', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
            mainCtx.font = '12px "VT323"';
            mainCtx.fillText('PRESS SPACE TO START', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
        } else if (gameState === 'PAUSED') {
            mainCtx.fillStyle = 'rgba(0,0,0,0.6)';
            mainCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            mainCtx.textAlign = 'center';
            mainCtx.fillStyle = '#00ff41';
            mainCtx.font = '14px "Press Start 2P"';
            mainCtx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        } else if (gameState === 'GAMEOVER') {
             mainCtx.fillStyle = 'rgba(0,0,0,0.7)';
            mainCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            mainCtx.textAlign = 'center';
            if(score === highScore && highScore > 0) {
                mainCtx.fillStyle = '#ffb300';
                mainCtx.font = '10px "Press Start 2P"';
                mainCtx.fillText('NEW BEST!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
            }
            mainCtx.fillStyle = '#ff4141';
            mainCtx.font = '12px "Press Start 2P"';
            mainCtx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
            mainCtx.fillStyle = '#00ff41';
            mainCtx.font = '20px "VT323"';
            mainCtx.fillText(`SCORE: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
        }
        
        animationFrameRef.current = requestAnimationFrame(draw);
      };
      
      draw();
      return () => {
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      }
    }, [gameState, score, highScore, level, lines]);

    return (
        <div className="flex flex-col items-center justify-center p-2 h-full bg-black/50">
            <p className="font-headline text-[8px] text-primary mb-2">TETRIS.exe</p>
            <div className="flex gap-4">
                <canvas ref={mainCanvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-black border-2 border-primary" />
                <div className="w-[120px] flex flex-col gap-2 font-body text-primary">
                    <div className="flex flex-col items-center gap-1 p-2 border-2 border-primary/30">
                        <h3 className="font-headline text-[7px] text-primary/70">NEXT</h3>
                        <canvas ref={nextCanvasRef} width={NEXT_PIECE_CANVAS_SIZE} height={NEXT_PIECE_CANVAS_SIZE} className="bg-black border-primary/30 border"/>
                    </div>
                    <div className="flex flex-col gap-1 p-2 border-2 border-primary/30">
                        <h3 className="font-headline text-[7px] text-primary/70">SCORE</h3>
                        <p className="text-lg font-headline text-right">{score}</p>
                    </div>
                     <div className="flex flex-col gap-1 p-2 border-2 border-primary/30">
                        <h3 className="font-headline text-[7px] text-primary/70">LEVEL</h3>
                        <p className="text-lg font-headline text-right">{level}</p>
                    </div>
                     <div className="flex flex-col gap-1 p-2 border-2 border-primary/30">
                        <h3 className="font-headline text-[7px] text-primary/70">LINES</h3>
                        <p className="text-lg font-headline text-right">{lines}</p>
                    </div>
                     <div className="flex flex-col gap-1 p-2 border-2 border-primary/30 text-center">
                        <h3 className="font-headline text-[7px] text-primary/70">HIGH SCORE</h3>
                        <p className="text-base font-headline">{highScore}</p>
                    </div>
                    <button onClick={() => { if(gameState === 'PLAYING') setGameState('PAUSED'); else if(gameState === 'PAUSED') setGameState('PLAYING'); }} className="font-headline text-[7px] p-2 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">
                        {gameState === 'PAUSED' ? '[ RESUME ]' : '[ PAUSE ]'}
                    </button>
                </div>
            </div>
            <p className="font-body text-sm text-primary/50 mt-2 text-center">
                ←→ MOVE | ↑ ROTATE | ↓ SOFT DROP | SPACE HARD DROP
            </p>
        </div>
    );
}
