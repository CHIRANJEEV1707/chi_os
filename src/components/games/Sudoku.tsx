'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { puzzles } from '@/lib/sudoku-puzzles';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'WON';
type CellData = {
  value: number | null;
  isGiven: boolean;
  isError: boolean;
  notes: Set<number>;
};
type Grid = CellData[][];
type SelectedCell = { row: number; col: number } | null;

const createEmptyGrid = (): Grid =>
  Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({
      value: null,
      isGiven: false,
      isError: false,
      notes: new Set(),
    }))
  );

export default function Sudoku() {
  const { play } = useSoundEffect();
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [puzzleIndex, setPuzzleIndex] = useState(0);

  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [solution, setSolution] = useState<number[][] | null>(null);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);

  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [timer, setTimer] = useState(0);
  const [bestTimes, setBestTimes] = useState<{ [k in Difficulty]: number | null }>({ EASY: null, MEDIUM: null, HARD: null });

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadPuzzle = useCallback(() => {
    const puzzleData = puzzles[difficulty][puzzleIndex];
    const newGrid = puzzleData.puzzle.map(row =>
      row.map(val => ({
        value: val === 0 ? null : val,
        isGiven: val !== 0,
        isError: false,
        notes: new Set(),
      }))
    );
    setGrid(newGrid);
    setSolution(puzzleData.solution);
    setGameStatus('PLAYING');
    setSelectedCell(null);
    setIsNotesMode(false);
    setHintsLeft(3);
    setTimer(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, [difficulty, puzzleIndex]);

  useEffect(() => {
    loadPuzzle();
  }, [difficulty, puzzleIndex, loadPuzzle]);

  useEffect(() => {
    const loadedBestTimes = {
      EASY: parseInt(localStorage.getItem('chiru-os-sudoku-easy-best') || '0') || null,
      MEDIUM: parseInt(localStorage.getItem('chiru-os-sudoku-medium-best') || '0') || null,
      HARD: parseInt(localStorage.getItem('chiru-os-sudoku-hard-best') || '0') || null,
    };
    setBestTimes(loadedBestTimes);
  }, []);
  
  useEffect(() => {
    if (gameStatus === 'PLAYING') {
      timerIntervalRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameStatus]);

  const validateGrid = useCallback((currentGrid: Grid): Grid => {
    const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell, isError: false })));

    const checkDuplicates = (arr: (number | null)[]) => {
      const seen = new Set<number>();
      const duplicates = new Set<number>();
      arr.forEach(val => {
        if (val !== null) {
          if (seen.has(val)) duplicates.add(val);
          seen.add(val);
        }
      });
      return duplicates;
    };

    for (let i = 0; i < 9; i++) {
      const rowValues = newGrid[i].map(c => c.value);
      const colValues = newGrid.map(r => r[i].value);
      const rowDuplicates = checkDuplicates(rowValues);
      const colDuplicates = checkDuplicates(colValues);

      for (let j = 0; j < 9; j++) {
        if (rowDuplicates.has(newGrid[i][j].value!)) newGrid[i][j].isError = true;
        if (colDuplicates.has(newGrid[j][i].value!)) newGrid[j][i].isError = true;
      }
    }
    
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const boxValues: (number|null)[] = [];
        const boxCells: {row:number, col:number}[] = [];
        for (let i = boxRow * 3; i < boxRow * 3 + 3; i++) {
          for (let j = boxCol * 3; j < boxCol * 3 + 3; j++) {
            boxValues.push(newGrid[i][j].value);
            boxCells.push({row:i, col:j});
          }
        }
        const boxDuplicates = checkDuplicates(boxValues);
        boxCells.forEach(({row, col}) => {
          if (boxDuplicates.has(newGrid[row][col].value!)) newGrid[row][col].isError = true;
        });
      }
    }

    return newGrid;
  }, []);

  const checkWinCondition = useCallback((currentGrid: Grid) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentGrid[r][c].value === null || currentGrid[r][c].isError) {
          return false;
        }
      }
    }
    return true;
  }, []);

  const handleInput = useCallback((num: number) => {
    if (!selectedCell || gameStatus !== 'PLAYING') return;

    const { row, col } = selectedCell;
    if (grid[row][col].isGiven) return;

    play('click');
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => r.map(c => ({...c, notes: new Set(c.notes)})));
      const cell = newGrid[row][col];
      
      if (isNotesMode) {
        if (cell.notes.has(num)) {
          cell.notes.delete(num);
        } else {
          cell.notes.add(num);
        }
        cell.value = null;
      } else {
        cell.value = cell.value === num ? null : num;
        cell.notes.clear();
      }
      
      const validatedGrid = validateGrid(newGrid);
      if (checkWinCondition(validatedGrid)) {
        setGameStatus('WON');
        play('success');
        if (!bestTimes[difficulty] || timer < bestTimes[difficulty]!) {
          const newBestTimes = { ...bestTimes, [difficulty]: timer };
          setBestTimes(newBestTimes);
          localStorage.setItem(`chiru-os-sudoku-${difficulty.toLowerCase()}-best`, timer.toString());
        }
      }
      return validatedGrid;
    });

  }, [selectedCell, gameStatus, grid, isNotesMode, validateGrid, checkWinCondition, play, difficulty, timer, bestTimes]);
  
  const handleErase = useCallback(() => {
    if (!selectedCell || gameStatus !== 'PLAYING') return;
    const { row, col } = selectedCell;
    if (grid[row][col].isGiven) return;
    play('click');
    setGrid(prevGrid => {
        const newGrid = prevGrid.map(r => r.map(c => ({...c})));
        newGrid[row][col].value = null;
        newGrid[row][col].notes.clear();
        return validateGrid(newGrid);
    });
  }, [selectedCell, gameStatus, grid, validateGrid, play]);

  const useHint = () => {
    if (hintsLeft <= 0 || gameStatus !== 'PLAYING' || !solution) return;
    const emptyCells: {row:number, col:number}[] = [];
    grid.forEach((row, r) => row.forEach((cell, c) => {
        if(cell.value === null) emptyCells.push({row: r, col: c});
    }));
    if(emptyCells.length === 0) return;

    play('success');
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { row, col } = randomCell;
    const correctValue = solution[row][col];
    
    setGrid(prevGrid => {
        const newGrid = prevGrid.map(r => r.map(c => ({...c})));
        newGrid[row][col] = { value: correctValue, isGiven: true, isError: false, notes: new Set() };
        return validateGrid(newGrid);
    });
    setHintsLeft(h => h - 1);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if(gameStatus !== 'PLAYING') return;
        
        if(e.key >= '1' && e.key <= '9') {
            handleInput(parseInt(e.key));
        } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            e.preventDefault();
            handleErase();
        } else if (e.key.toLowerCase() === 'n') {
            setIsNotesMode(prev => !prev);
        } else if (e.key.toLowerCase() === 'h') {
            useHint();
        } else if (e.key === 'Escape') {
            setSelectedCell(null);
        } else if (e.key.startsWith('Arrow') && selectedCell) {
            e.preventDefault();
            let {row, col} = selectedCell;
            if(e.key === 'ArrowUp' && row > 0) row--;
            if(e.key === 'ArrowDown' && row < 8) row++;
            if(e.key === 'ArrowLeft' && col > 0) col--;
            if(e.key === 'ArrowRight' && col < 8) col++;
            setSelectedCell({row, col});
        }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, handleInput, handleErase, selectedCell]);


  const selectedValue = selectedCell ? grid[selectedCell.row][selectedCell.col].value : null;

  const getCellClass = (r: number, c: number) => {
    const cell = grid[r][c];
    if (cell.isError && !cell.isGiven) return 'bg-red-900/50 text-destructive';
    if(selectedCell) {
        if(r === selectedCell.row && c === selectedCell.col) return 'bg-green-900/50 border-2 border-primary';
        if(r === selectedCell.row || c === selectedCell.col || (Math.floor(r/3) === Math.floor(selectedCell.row/3) && Math.floor(c/3) === Math.floor(selectedCell.col/3))) return 'bg-green-900/20';
        if(cell.value && cell.value === selectedValue) return 'bg-green-800/30';
    }
    return 'bg-black/50 hover:bg-green-900/30';
  }
  
  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
  }
  
  const nextPuzzle = () => {
    setPuzzleIndex(p => (p + 1) % puzzles[difficulty].length);
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 h-full bg-black/70">
      <p className="font-headline text-[8px] text-primary mb-2">SUDOKU.exe</p>
      
      <div className="w-[480px] px-4 mb-2 flex justify-between items-center">
        <div className='flex gap-1'>
            {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
                 <button key={d} onClick={() => setDifficulty(d)} className={cn("font-headline text-[6px] px-2 py-0.5 border border-primary/50", difficulty === d ? 'bg-primary text-black' : 'text-primary/70')}>
                     {d}
                 </button>
            ))}
        </div>
        <span className="font-headline text-lg text-primary">⏱ {formatTime(timer)}</span>
      </div>
      
      <div className="relative">
        {gameStatus === 'WON' && (
             <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center gap-2">
                <h2 className='font-headline text-lg text-yellow-400'>PUZZLE SOLVED!</h2>
                <p className='font-body text-xl text-primary'>TIME: {formatTime(timer)}</p>
                {bestTimes[difficulty] === timer && <p className='font-body text-base text-green-400'>NEW BEST TIME!</p>}
                <div className='flex gap-4 mt-4'>
                    <button onClick={nextPuzzle} className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">
                        NEXT PUZZLE
                    </button>
                    <button onClick={() => {}} className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">
                        MENU
                    </button>
                </div>
            </div>
        )}
        <div className={cn("grid grid-cols-9 w-[362px] h-[362px] border-2 bg-black", gameStatus === 'WON' ? 'border-yellow-400 animate-pulse' : 'border-primary')}>
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={cn(
                'w-10 h-10 flex items-center justify-center cursor-pointer font-headline text-lg',
                (c % 3 === 2 && c !== 8) && 'border-r-2 border-primary/70',
                (r % 3 === 2 && r !== 8) && 'border-b-2 border-primary/70',
                c > 0 && 'border-l border-primary/30',
                r > 0 && 'border-t border-primary/30',
                getCellClass(r,c)
              )}
              onClick={() => setSelectedCell({ row: r, col: c })}
            >
              {cell.value ? (
                <span className={cn(cell.isGiven ? 'text-primary' : 'text-green-400', cell.isError && !cell.isGiven && 'text-red-400')}>{cell.value}</span>
              ) : (
                <div className="grid grid-cols-3 w-full h-full text-green-600/80 text-[10px] font-body items-center justify-center leading-none">
                    {Array.from({length: 9}).map((_, i) => <span key={i} className='flex items-center justify-center'>{cell.notes.has(i + 1) ? i + 1 : ''}</span>)}
                </div>
              )}
            </div>
          ))
        )}
        </div>
      </div>
      
      <div className="w-[360px] mt-2 flex justify-between">
        <button onClick={() => setIsNotesMode(p => !p)} className={cn("font-headline text-[7px] px-2 py-1 border border-primary/50", isNotesMode ? 'bg-primary text-black' : 'text-primary/70')}>✎ NOTES</button>
        <button onClick={handleErase} className="font-headline text-[7px] px-2 py-1 border border-primary/50 text-primary/70">⌫ ERASE</button>
        <button onClick={useHint} className="font-headline text-[7px] px-2 py-1 border border-primary/50 text-primary/70 disabled:opacity-50" disabled={hintsLeft === 0}>💡 HINT {hintsLeft}</button>
        <button onClick={() => { if(window.confirm('Restart puzzle?')) loadPuzzle()}} className="font-headline text-[7px] px-2 py-1 border border-primary/50 text-primary/70">↺ RESTART</button>
      </div>
      
      <div className="w-[360px] mt-2 grid grid-cols-9 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleInput(i + 1)}
            className="w-10 h-10 border border-primary/50 text-primary font-headline text-lg hover:bg-accent hover:text-black"
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
