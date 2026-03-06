
'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Snake from '@/components/games/Snake';
import Minesweeper from '@/components/games/Minesweeper';
import Pong from '@/components/games/Pong';
import Tetris from '@/components/games/Tetris';
import Invaders from '@/components/games/Invaders';
import Sudoku from '@/components/games/Sudoku';
import Battleship from '@/components/games/Battleship';
import { useAchievementStore } from '@/store/achievementStore';

type Game = 'menu' | 'snake' | 'minesweeper' | 'pong' | 'tetris' | 'invaders' | 'sudoku' | 'battleship';
const GAMES_LIST: Game[] = ['snake', 'minesweeper', 'pong', 'tetris', 'invaders', 'sudoku', 'battleship'];

const getPlayedGames = (): Set<string> => {
    try {
        const stored = localStorage.getItem('chiru-os-played-games');
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
        return new Set();
    }
}

const setPlayedGames = (games: Set<string>) => {
    try {
        localStorage.setItem('chiru-os-played-games', JSON.stringify(Array.from(games)));
    } catch (e) {
        console.error("Failed to save played games to localStorage", e);
    }
}


export default function Games() {
    const [activeGame, setActiveGame] = useState<Game>('menu');
    const { unlock, isUnlocked } = useAchievementStore();

    const handleGameSelect = (game: Game) => {
        const playedGames = getPlayedGames();
        playedGames.add(game);
        setPlayedGames(playedGames);

        if (playedGames.size === GAMES_LIST.length && !isUnlocked('gamer')) {
            unlock('gamer');
        }

        setActiveGame(game);
    };

    const GameButton = ({ game, emoji, name }: { game: Game, emoji: string, name: string }) => (
        <button
            onClick={() => handleGameSelect(game)}
            className="font-headline text-[10px] px-6 py-3 border-2 border-primary text-primary hover:bg-accent hover:text-accent-foreground flex flex-col items-center gap-2 w-40 h-28 justify-center"
        >
            <span className="text-2xl">{emoji}</span>
            <span>{name}</span>
        </button>
    );

    const renderContent = () => {
        switch(activeGame) {
            case 'snake': return <Snake />;
            case 'minesweeper': return <Minesweeper />;
            case 'pong': return <Pong />;
            case 'tetris': return <Tetris />;
            case 'invaders': return <Invaders />;
            case 'sudoku': return <Sudoku />;
            case 'battleship': return <Battleship />;
            case 'menu':
            default:
                return (
                     <div className="p-4 font-body flex flex-col items-center justify-center h-full gap-4 text-center">
                        <h1 className="font-headline text-lg text-primary">GAMES/</h1>
                        <p className="text-sm text-primary/80">Select a game to play.</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            <GameButton game="snake" emoji="🐍" name="SNAKE.exe" />
                            <GameButton game="minesweeper" emoji="💣" name="MINESWEEPER.exe" />
                            <GameButton game="pong" emoji="🏓" name="PONG.exe" />
                            <GameButton game="tetris" emoji="🧱" name="TETRIS.exe" />
                            <GameButton game="invaders" emoji="👾" name="INVADERS.exe" />
                            <GameButton game="sudoku" emoji="🔢" name="SUDOKU.exe" />
                            <GameButton game="battleship" emoji="🚢" name="BATTLESHIP.exe" />
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
