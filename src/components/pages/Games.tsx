'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Snake from '@/components/games/Snake';
import Minesweeper from '@/components/games/Minesweeper';
import Pong from '@/components/games/Pong';
import Tetris from '@/components/games/Tetris';
import Invaders from '@/components/games/Invaders';
import Sudoku from '@/components/games/Sudoku';

type Game = 'menu' | 'snake' | 'minesweeper' | 'pong' | 'tetris' | 'invaders' | 'sudoku';

export default function Games() {
    const [activeGame, setActiveGame] = useState<Game>('menu');

    const renderContent = () => {
        switch(activeGame) {
            case 'snake':
                return <Snake />;
            case 'minesweeper':
                return <Minesweeper />;
            case 'pong':
                return <Pong />;
            case 'tetris':
                return <Tetris />;
            case 'invaders':
                return <Invaders />;
            case 'sudoku':
                return <Sudoku />;
            case 'menu':
            default:
                return (
                     <div className="p-4 font-body flex flex-col items-center justify-center h-full gap-4 text-center">
                        <h1 className="font-headline text-lg text-primary">GAMES/</h1>
                        <p className="text-sm text-primary/80">Select a game to play.</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                             <button
                              onClick={() => setActiveGame('snake')}
                              className="font-headline text-[10px] px-6 py-3 border-2 border-primary text-primary hover:bg-accent hover:text-accent-foreground flex flex-col items-center gap-2 w-40 h-28 justify-center"
                            >
                              <span className="text-2xl">🐍</span>
                              <span>SNAKE.exe</span>
                            </button>
                             <button
                              onClick={() => setActiveGame('minesweeper')}
                              className="font-headline text-[10px] px-6 py-3 border-2 border-primary text-primary hover:bg-accent hover:text-accent-foreground flex flex-col items-center gap-2 w-40 h-28 justify-center"
                            >
                                <span className="text-2xl">💣</span>
                                <span>MINESWEEPER.exe</span>
                            </button>
                             <button
                              onClick={() => setActiveGame('pong')}
                              className="font-headline text-[10px] px-6 py-3 border-2 border-primary text-primary hover:bg-accent hover:text-accent-foreground flex flex-col items-center gap-2 w-40 h-28 justify-center"
                            >
                                <span className="text-2xl">🏓</span>
                                <span>PONG.exe</span>
                            </button>
                            <button
                              onClick={() => setActiveGame('tetris')}
                              className="font-headline text-[10px] px-6 py-3 border-2 border-primary text-primary hover:bg-accent hover:text-accent-foreground flex flex-col items-center gap-2 w-40 h-28 justify-center"
                            >
                                <span className="text-2xl">🧱</span>
                                <span>TETRIS.exe</span>
                            </button>
                            <button
                              onClick={() => setActiveGame('invaders')}
                              className="font-headline text-[10px] px-6 py-3 border-2 border-primary text-primary hover:bg-accent hover:text-accent-foreground flex flex-col items-center gap-2 w-40 h-28 justify-center"
                            >
                                <span className="text-2xl">👾</span>
                                <span>INVADERS.exe</span>
                            </button>
                            <button
                              onClick={() => setActiveGame('sudoku')}
                              className="font-headline text-[10px] px-6 py-3 border-2 border-primary text-primary hover:bg-accent hover:text-accent-foreground flex flex-col items-center gap-2 w-40 h-28 justify-center"
                            >
                                <span className="text-2xl">🔢</span>
                                <span>SUDOKU.exe</span>
                            </button>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="w-full h-full bg-black/50 relative">
            {activeGame !== 'menu' && (
                <button 
                    onClick={() => setActiveGame('menu')}
                    className="absolute top-2 left-2 font-headline text-[7px] px-2 py-1 border border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground z-20"
                >
                    &lt; BACK
                </button>
            )}
            {renderContent()}
        </div>
    )
}
