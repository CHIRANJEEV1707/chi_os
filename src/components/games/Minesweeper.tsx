
'use client';
import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useAchievementStore } from '@/store/achievementStore';

// --- Constants & Types ---
const DIFFICULTIES = {
  EASY: { width: 9, height: 9, mines: 10, name: 'EASY' },
  MEDIUM: { width: 16, height: 16, mines: 40, name: 'MEDIUM' },
  HARD: { width: 30, height: 16, mines: 99, name: 'HARD' },
};
type Difficulty = keyof typeof DIFFICULTIES;

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};
type Grid = Cell[][];
type GameStatus = 'IDLE' | 'PLAYING' | 'WON' | 'LOST';

const getNumberColor = (num: number) => {
  switch (num) {
    case 1: return 'text-[#00ff41]';
    case 2: return 'text-[#00ffff]';
    case 3: return 'text-[#ff4141]';
    case 4: return 'text-[#0000ff]';
    case 5: return 'text-[#ff0000]';
    case 6: return 'text-[#00ffff]';
    case 7: return 'text-[#ff00ff]';
    case 8: return 'text-[#808080]';
    default: return '';
  }
};

// --- Game Logic (useReducer) ---
type State = {
  grid: Grid;
  status: GameStatus;
  mines: number;
  flags: number;
  revealedCells: number;
  isFirstClick: boolean;
  clickedMine?: { x: number, y: number };
};

type Action =
  | { type: 'RESTART'; difficulty: Difficulty }
  | { type: 'REVEAL_CELL'; x: number; y: number }
  | { type: 'TOGGLE_FLAG'; x: number; y: number }
  | { type: 'CHORD'; x: number; y: number };

const createEmptyGrid = (width: number, height: number): Grid =>
  Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0,
    }))
  );

const gameReducer = (state: State, action: Action): State => {
  if (action.type === 'RESTART') {
    const { width, height, mines } = DIFFICULTIES[action.difficulty];
    return {
      grid: createEmptyGrid(width, height),
      status: 'IDLE',
      mines,
      flags: 0,
      revealedCells: 0,
      isFirstClick: true,
    };
  }

  const { grid, isFirstClick, mines, flags, revealedCells } = state;
  const { height, width } = { height: grid.length, width: grid[0]?.length || 0 };
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

  const getNeighbors = (x: number, y: number) => {
    const neighbors = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newY = y + i;
        const newX = x + j;
        if (newY >= 0 && newY < height && newX >= 0 && newX < width) {
          neighbors.push({ x: newX, y: newY });
        }
      }
    }
    return neighbors;
  };
  
  // --- First Click Mine Generation ---
  if (isFirstClick && action.type !== 'TOGGLE_FLAG') {
    const { x: firstX, y: firstY } = action.type === 'REVEAL_CELL' ? action : {x:0, y:0};
    
    // Create a safe zone around the first click
    const safeZone = new Set([`${firstX},${firstY}`]);
    getNeighbors(firstX, firstY).forEach(n => safeZone.add(`${n.x},${n.y}`));

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      if (!newGrid[y][x].isMine && !safeZone.has(`${x},${y}`)) {
        newGrid[y][x].isMine = true;
        minesPlaced++;
      }
    }
    // Calculate adjacent mines
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!newGrid[y][x].isMine) {
          newGrid[y][x].adjacentMines = getNeighbors(x, y).filter(n => newGrid[n.y][n.x].isMine).length;
        }
      }
    }
    state = { ...state, isFirstClick: false };
  }
  
  const revealCell = (x: number, y: number, currentGrid: Grid, revealedCount: number): [Grid, number, GameStatus] => {
    let status: GameStatus = state.status === 'IDLE' ? 'PLAYING' : state.status;
    
    const cell = currentGrid[y][x];
    if (cell.isRevealed || cell.isFlagged) return [currentGrid, revealedCount, status];
    
    if (cell.isMine) {
      return [currentGrid, revealedCount, 'LOST'];
    }

    let cellsToReveal = [{x,y}];
    let newRevealedCount = revealedCount;

    while (cellsToReveal.length > 0) {
      const { x: cx, y: cy } = cellsToReveal.pop()!;
      const currentCell = currentGrid[cy][cx];

      if (currentCell.isRevealed || currentCell.isFlagged) continue;
      
      currentCell.isRevealed = true;
      newRevealedCount++;
      
      if (currentCell.adjacentMines === 0) {
        getNeighbors(cx, cy).forEach(neighbor => {
            if (!currentGrid[neighbor.y][neighbor.x].isRevealed) {
                cellsToReveal.push(neighbor);
            }
        });
      }
    }

    if (newRevealedCount === width * height - mines) {
      status = 'WON';
    }

    return [currentGrid, newRevealedCount, status];
  };


  switch (action.type) {
    case 'REVEAL_CELL': {
      const { x, y } = action;
      const [gridAfterReveal, newRevealed, newStatus] = revealCell(x, y, newGrid, revealedCells);
      let clickedMine = state.clickedMine;

      if(newStatus === 'LOST') {
        gridAfterReveal[y][x].isRevealed = true;
        clickedMine = { x, y };
      }

      return { ...state, grid: gridAfterReveal, revealedCells: newRevealed, status: newStatus, clickedMine };
    }
    case 'TOGGLE_FLAG': {
      const { x, y } = action;
      if (newGrid[y][x].isRevealed) return state;
      const isFlagged = !newGrid[y][x].isFlagged;
      newGrid[y][x].isFlagged = isFlagged;
      return { ...state, grid: newGrid, flags: flags + (isFlagged ? 1 : -1) };
    }
    case 'CHORD': {
      const { x, y } = action;
      const cell = newGrid[y][x];
      if (!cell.isRevealed || cell.adjacentMines === 0) return state;

      const neighbors = getNeighbors(x,y);
      const flaggedNeighbors = neighbors.filter(n => newGrid[n.y][n.x].isFlagged).length;

      if(flaggedNeighbors !== cell.adjacentMines) return state;
      
      let currentRevealed = revealedCells;
      let currentStatus: GameStatus = state.status;
      let clickedMine = state.clickedMine;

      for (const n of neighbors) {
          if (!newGrid[n.y][n.x].isFlagged && !newGrid[n.y][n.x].isRevealed) {
              const [gridAfterReveal, newRevealed, newStatus] = revealCell(n.x, n.y, newGrid, currentRevealed);
              currentRevealed = newRevealed;
              if (newStatus === 'LOST') {
                  currentStatus = 'LOST';
                  clickedMine = {x: n.x, y: n.y};
                  break;
              }
          }
      }
      if(currentStatus !== 'LOST' && currentRevealed === width * height - mines) {
          currentStatus = 'WON';
      }

      return { ...state, grid: newGrid, revealedCells: currentRevealed, status: currentStatus, clickedMine };
    }
    default:
      return state;
  }
};


// --- Component ---
export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [state, dispatch] = useReducer(gameReducer, undefined, () => gameReducer({} as State, { type: 'RESTART', difficulty: 'EASY'}));
  const [timer, setTimer] = useState(0);
  const [highScores, setHighScores] = useState({ EASY: Infinity, MEDIUM: Infinity, HARD: Infinity });
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { play } = useSoundEffect();
  const { unlock } = useAchievementStore();

  const { grid, status, mines, flags, clickedMine } = state;
  const { width, height } = DIFFICULTIES[difficulty];

  // --- Effects ---
  useEffect(() => {
    try {
      setHighScores({
        EASY: parseInt(localStorage.getItem('chiru-os-mine-easy') || '999'),
        MEDIUM: parseInt(localStorage.getItem('chiru-os-mine-medium') || '999'),
        HARD: parseInt(localStorage.getItem('chiru-os-mine-hard') || '999'),
      });
    } catch {}
  }, []);

  const resetGame = useCallback((newDifficulty?: Difficulty) => {
    const diff = newDifficulty || difficulty;
    if (newDifficulty) setDifficulty(diff);
    dispatch({ type: 'RESTART', difficulty: diff });
    setTimer(0);
    if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
    }
  }, [difficulty]);

  useEffect(() => {
    resetGame(difficulty);
  }, [difficulty, resetGame]);
  
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if(e.key === 'r' || e.key === 'F2') {
            e.preventDefault();
            resetGame();
        }
      }
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetGame]);

  useEffect(() => {
    if (status === 'PLAYING') {
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => {
          setTimer(t => Math.min(t + 1, 999));
        }, 1000);
      }
    } else if (status === 'WON' || status === 'LOST') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      if (status === 'WON') {
        play('success');
        if (difficulty === 'HARD') {
          unlock('minesweeper_god');
        }
        if (timer < highScores[difficulty]) {
          const newHighScores = { ...highScores, [difficulty]: timer };
          setHighScores(newHighScores);
          try {
            localStorage.setItem(`chiru-os-mine-${difficulty.toLowerCase()}`, timer.toString());
          } catch {}
        }
      } else { // status === 'LOST'
        play('error');
      }
    }
  }, [status, timer, difficulty, highScores, play, unlock]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, []);

  // --- Handlers ---
  const handleCellClick = (x: number, y: number) => {
    if (status === 'WON' || status === 'LOST') return;
    dispatch({ type: 'REVEAL_CELL', x, y });
  };
  
  const handleCellRightClick = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (status === 'WON' || status === 'LOST' || state.isFirstClick) return;
    play('click');
    dispatch({ type: 'TOGGLE_FLAG', x, y });
  };

  const handleCellMiddleClick = (e: React.MouseEvent, x: number, y: number) => {
    if (e.button !== 1 || status === 'WON' || status === 'LOST') return;
    dispatch({ type: 'CHORD', x, y });
  }

  const handleDoubleClick = (x: number, y: number) => {
    if (status === 'WON' || status === 'LOST') return;
    dispatch({ type: 'CHORD', x, y });
  };

  // --- Rendering ---
  const renderFace = () => {
    if (status === 'WON') return '😎';
    if (status === 'LOST') return '💀';
    return '😊';
  }

  const renderCellContent = (cell: Cell, x: number, y: number) => {
    if (status === 'LOST' && cell.isMine && !cell.isFlagged) {
        return '💣';
    }
    if (status === 'LOST' && !cell.isMine && cell.isFlagged) {
        return '❌';
    }
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return null;
    if (cell.adjacentMines > 0) return cell.adjacentMines;
    return null;
  };

  const getCellClassName = (cell: Cell, x: number, y: number) => {
    if (!cell.isRevealed && !cell.isFlagged && status === 'WON') {
        cell.isFlagged = true;
    }

    if (cell.isFlagged && status !== 'LOST') return 'ms-cell-hidden';

    if (!cell.isRevealed) return 'ms-cell-hidden';
    
    if (cell.isMine) return cn('ms-cell-revealed bg-red-800', clickedMine?.x === x && clickedMine.y === y && 'bg-red-500');

    return cn('ms-cell-revealed', getNumberColor(cell.adjacentMines));
  };
  
  const Overlay = ({ title, message, isWin }: { title: string, message: string, isWin: boolean }) => (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
        <h2 className={cn("font-headline text-lg mb-2", isWin ? "text-[#ffb300]" : "text-destructive")}>{title}</h2>
        <p className="font-body text-base text-primary mb-4">{message}</p>
        <button onClick={() => resetGame()} className="font-headline text-[8px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">
            [ PLAY AGAIN ]
        </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center p-2 h-full bg-black/70">
      <p className="font-headline text-[8px] text-primary mb-2">MINESWEEPER.exe</p>
      {/* Top Bar */}
      <div className="w-full max-w-max bg-black/30 p-2 border-2 border-secondary mb-2 flex justify-between items-center gap-4">
        <span className="font-headline text-lg text-red-500">💣 {(mines - flags).toString().padStart(3, '0')}</span>
        <button onClick={() => resetGame()} className="w-8 h-8 flex items-center justify-center border-2 border-primary/50 text-lg hover:bg-accent">
            {renderFace()}
        </button>
        <span className="font-headline text-lg text-primary">⏱ {timer.toString().padStart(3, '0')}</span>
      </div>
      {/* Difficulty */}
      <div className="flex gap-2 mb-2">
        {(Object.keys(DIFFICULTIES) as Difficulty[]).map(d => (
          <button
            key={d}
            onClick={() => { resetGame(d); }}
            className={cn(
              "font-headline text-[7px] px-3 py-1 border-2 border-primary/50",
              difficulty === d ? "bg-primary text-primary-foreground" : "text-primary hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {d}
          </button>
        ))}
      </div>
      
      {/* Grid */}
      <div className={cn("relative border-2 border-primary", status === 'WON' && "animate-pulse")}>
        {(status === 'LOST' || status === 'WON') && (
            <Overlay 
                title={status === 'WON' ? 'YOU WIN!' : 'GAME OVER'}
                message={status === 'WON' ? `Cleared in ${timer}s` : `You survived ${timer}s`}
                isWin={status === 'WON'}
            />
        )}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${width}, 24px)` }}>
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={cn('ms-cell', getCellClassName(cell, x, y))}
                onClick={() => handleCellClick(x, y)}
                onContextMenu={(e) => handleCellRightClick(e, x, y)}
                onMouseDown={(e) => handleCellMiddleClick(e, x, y)}
                onDoubleClick={() => handleDoubleClick(x, y)}
              >
                {renderCellContent(cell, x, y)}
              </div>
            ))
          )}
        </div>
      </div>
       <p className="font-body text-sm text-primary/50 mt-2">
            BEST: {highScores[difficulty] === Infinity ? 'N/A' : `${highScores[difficulty]}s`}
       </p>
    </div>
  );
}
