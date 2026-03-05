'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSoundEffect } from '@/hooks/useSoundEffect';

// Constants
const GRID_SIZE = 10;
const SHIP_TYPES = {
  carrier: { size: 5, name: 'Carrier' },
  battleship: { size: 4, name: 'Battleship' },
  cruiser: { size: 3, name: 'Cruiser' },
  submarine: { size: 3, name: 'Submarine' },
  destroyer: { size: 2, name: 'Destroyer' },
};
const SHIP_KEYS = Object.keys(SHIP_TYPES) as (keyof typeof SHIP_TYPES)[];
const TOTAL_SHIP_CELLS = SHIP_KEYS.reduce((acc, key) => acc + SHIP_TYPES[key].size, 0);

type ShipType = keyof typeof SHIP_TYPES;
type CellStatus = 'EMPTY' | 'SHIP' | 'HIT' | 'MISS' | 'SUNK';
type GamePhase = 'PLACEMENT' | 'BATTLE' | 'GAMEOVER';
type Turn = 'PLAYER' | 'CPU';

type CellState = { status: CellStatus; shipId?: ShipType };
type Grid = CellState[][];
type Ship = {
  id: ShipType;
  name: string;
  size: number;
  positions: { row: number; col: number }[];
  isSunk: boolean;
  isPlaced: boolean;
};

// Helper Functions
const createEmptyGrid = (): Grid => Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => ({ status: 'EMPTY' })));
const createShips = (): Ship[] => SHIP_KEYS.map(id => ({ id, ...SHIP_TYPES[id], positions: [], isSunk: false, isPlaced: false }));
const GRID_LABELS = { cols: Array.from({ length: GRID_SIZE }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i)), rows: Array.from({ length: GRID_SIZE }, (_, i) => (i + 1).toString()) };


export default function Battleship() {
  const { play } = useSoundEffect();
  const [phase, setPhase] = useState<GamePhase>('PLACEMENT');
  const [turn, setTurn] = useState<Turn>('PLAYER');
  const [winner, setWinner] = useState<Turn | null>(null);
  const [playerShips, setPlayerShips] = useState<Ship[]>(createShips());
  const [enemyShips, setEnemyShips] = useState<Ship[]>(createShips());
  const [playerGrid, setPlayerGrid] = useState<Grid>(createEmptyGrid());
  const [enemyGrid, setEnemyGrid] = useState<Grid>(createEmptyGrid());
  const [placingShipIndex, setPlacingShipIndex] = useState(0);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);
  const [statusMessage, setStatusMessage] = useState('Place your ships to begin.');

  const canPlaceShip = useCallback((ship: Ship, grid: Grid, row: number, col: number, orientation: 'horizontal' | 'vertical') => {
    for (let i = 0; i < ship.size; i++) {
      const r = orientation === 'vertical' ? row + i : row;
      const c = orientation === 'horizontal' ? col + i : col;
      if (r >= GRID_SIZE || c >= GRID_SIZE || grid[r][c].status === 'SHIP') return false;
    }
    return true;
  }, []);

  const placeShip = (shipIndex: number, row: number, col: number, currentOrientation: 'horizontal' | 'vertical') => {
    const shipToPlace = playerShips.find((_, i) => i === shipIndex);
    if (!shipToPlace || !canPlaceShip(shipToPlace, playerGrid, row, col, currentOrientation)) return;
    
    play('click');
    const newGrid = playerGrid.map(r => r.map(c => ({...c})));
    const newPositions: { row: number; col: number }[] = [];
    for (let i = 0; i < shipToPlace.size; i++) {
        const r = currentOrientation === 'vertical' ? row + i : row;
        const c = currentOrientation === 'horizontal' ? col + i : col;
        newGrid[r][c] = { status: 'SHIP', shipId: shipToPlace.id };
        newPositions.push({ row: r, col: c });
    }
    setPlayerGrid(newGrid);
    setPlayerShips(prev => {
        const newShips = prev.map((s, i) => i === shipIndex ? {...s, isPlaced: true, positions: newPositions} : s);
        const nextIndex = newShips.findIndex(s => !s.isPlaced);
        if (nextIndex !== -1) {
            setPlacingShipIndex(nextIndex);
        } else {
            setStatusMessage('All ships placed. Ready for battle!');
            setPlacingShipIndex(newShips.length);
        }
        return newShips;
    });
  };

  const handlePlacementClick = (row: number, col: number) => {
    if (phase !== 'PLACEMENT' || placingShipIndex >= playerShips.length) return;
    placeShip(placingShipIndex, row, col, orientation);
  };
  
  const handleRotate = useCallback(() => {
    if (phase !== 'PLACEMENT') return;
    setOrientation(o => (o === 'horizontal' ? 'vertical' : 'horizontal'));
    play('click');
  }, [phase, play]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'PLACEMENT' && e.key.toLowerCase() === 'r') handleRotate();
    };
    const handleRightClick = (e: MouseEvent) => {
        if(phase === 'PLACEMENT') {
            e.preventDefault();
            handleRotate();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleRightClick);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('contextmenu', handleRightClick);
    };
  }, [handleRotate, phase]);
  
  const autoPlaceShips = () => {
    play('success');
    let tempGrid = createEmptyGrid();
    const newShips = createShips().map(ship => {
        let placed = false;
        while(!placed) {
            const o: ('horizontal' | 'vertical') = Math.random() > 0.5 ? 'horizontal' : 'vertical';
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);

            let canPlace = true;
            const positions = [];
            for (let i = 0; i < ship.size; i++) {
                const r = o === 'vertical' ? row + i : row;
                const c = o === 'horizontal' ? col + i : col;
                if (r >= GRID_SIZE || c >= GRID_SIZE || tempGrid[r][c].status === 'SHIP') {
                    canPlace = false;
                    break;
                }
                positions.push({row:r, col:c});
            }
            if(canPlace) {
                positions.forEach(({row, col}) => tempGrid[row][col] = {status: 'SHIP', shipId: ship.id});
                ship.positions = positions;
                ship.isPlaced = true;
                placed = true;
            }
        }
        return ship;
    });
    setPlayerGrid(tempGrid);
    setPlayerShips(newShips);
    setPlacingShipIndex(playerShips.length);
    setStatusMessage('All ships placed. Ready for battle!');
  };

  const resetPlacement = () => {
    play('click');
    setPlayerGrid(createEmptyGrid());
    setPlayerShips(createShips());
    setPlacingShipIndex(0);
    setStatusMessage('Place your ships to begin.');
  };

  const startBattle = () => {
      play('success');
      let tempGrid = createEmptyGrid();
      const newEnemyShips = createShips().map(ship => {
          let placed = false;
          while(!placed) {
              const o = Math.random() > 0.5 ? 'horizontal' : 'vertical';
              const row = Math.floor(Math.random() * GRID_SIZE);
              const col = Math.floor(Math.random() * GRID_SIZE);
              const positions: {row: number, col: number}[] = [];
              let canPlace = true;
              for (let i = 0; i < ship.size; i++) {
                const r = o === 'vertical' ? row + i : row;
                const c = o === 'horizontal' ? col + i : col;
                if (r >= GRID_SIZE || c >= GRID_SIZE || tempGrid[r][c].status === 'SHIP') {
                    canPlace = false;
                    break;
                }
                positions.push({row:r, col:c});
              }
              if(canPlace) {
                positions.forEach(({row,col}) => tempGrid[row][col] = {status: 'SHIP', shipId: ship.id});
                ship.positions = positions;
                placed = true;
              }
          }
          return ship;
      });
      setEnemyShips(newEnemyShips);
      setEnemyGrid(tempGrid);
      setPhase('BATTLE');
      setTurn('PLAYER');
      setStatusMessage('Your turn to fire!');
  };

  const fireAtEnemy = (row: number, col: number) => {
    if (phase !== 'BATTLE' || turn !== 'PLAYER' || winner) return;
    const targetCell = enemyGrid[row][col];
    if (targetCell.status === 'HIT' || targetCell.status === 'MISS') return;
    
    const newGrid = enemyGrid.map(r => r.map(c => ({...c})));
    let newShips = [...enemyShips];
    if (targetCell.status === 'SHIP') {
        play('success');
        newGrid[row][col].status = 'HIT';
        const hitShip = newShips.find(s => s.id === targetCell.shipId)!;
        const isSunk = hitShip.positions.every(p => newGrid[p.row][p.col].status === 'HIT');
        if (isSunk) {
            setStatusMessage(`> You SUNK their ${hitShip.name}!`);
            play('error');
            newShips = newShips.map(s => s.id === hitShip.id ? {...s, isSunk: true} : s);
            hitShip.positions.forEach(({row, col}) => { newGrid[row][col].status = 'SUNK' });
        } else {
            setStatusMessage('> DIRECT HIT!');
        }
    } else {
        play('click');
        newGrid[row][col].status = 'MISS';
        setStatusMessage('> MISS.');
    }
    
    setEnemyGrid(newGrid);
    setEnemyShips(newShips);
    if (!checkGameOver(playerShips, newShips)) setTurn('CPU');
  };

  const cpuTurn = useCallback(() => {
    if (winner) return;
    setStatusMessage('> CPU is thinking...');

    setTimeout(() => {
        let row: number, col: number;
        do {
            row = Math.floor(Math.random() * GRID_SIZE);
            col = Math.floor(Math.random() * GRID_SIZE);
        } while (playerGrid[row][col].status === 'HIT' || playerGrid[row][col].status === 'MISS');

        const newGrid = playerGrid.map(r => r.map(c => ({...c})));
        const targetCell = newGrid[row][col];
        let newShips = [...playerShips];

        if (targetCell.status === 'SHIP') {
            play('error');
            newGrid[row][col].status = 'HIT';
            const hitShip = newShips.find(s => s.id === targetCell.shipId)!;
            const isSunk = hitShip.positions.every(p => newGrid[p.row][p.col].status === 'HIT');
            if (isSunk) {
                setStatusMessage(`> Enemy sunk your ${hitShip.name}!`);
                newShips = newShips.map(s => s.id === hitShip.id ? {...s, isSunk: true} : s);
                hitShip.positions.forEach(({row, col}) => { newGrid[row][col].status = 'SUNK' });
            } else {
                setStatusMessage('> Your ship has been hit!');
            }
        } else {
            play('click');
            newGrid[row][col].status = 'MISS';
            setStatusMessage('> CPU missed.');
        }

        setPlayerGrid(newGrid);
        setPlayerShips(newShips);
        if(!checkGameOver(newShips, enemyShips)) {
          setTurn('PLAYER');
          setStatusMessage('Your turn to fire!');
        }
    }, 800);
  }, [playerGrid, playerShips, enemyShips, winner, play]);
  
  const checkGameOver = (pShips: Ship[], eShips: Ship[]): boolean => {
      if (winner) return true;
      const playerWon = eShips.every(s => s.isSunk);
      const cpuWon = pShips.every(s => s.isSunk);
      if (playerWon) {
          setWinner('PLAYER'); setPhase('GAMEOVER'); setStatusMessage('You win!'); play('success'); return true;
      }
      if (cpuWon) {
          setWinner('CPU'); setPhase('GAMEOVER'); setStatusMessage('You lose!'); play('error'); return true;
      }
      return false;
  };

  useEffect(() => {
    if(phase === 'BATTLE' && turn === 'CPU' && !winner) {
        cpuTurn();
    }
  }, [phase, turn, winner, cpuTurn]);
  
  const resetGame = () => {
    setPhase('PLACEMENT'); setPlayerGrid(createEmptyGrid()); setEnemyGrid(createEmptyGrid()); setPlayerShips(createShips());
    setEnemyShips(createShips()); setPlacingShipIndex(0); setTurn('PLAYER'); setWinner(null); setStatusMessage('Place your ships to begin.');
  };
  
  const currentPlacingShip = playerShips[placingShipIndex];
  const previewCells = hoveredCell && currentPlacingShip ? Array.from({length: currentPlacingShip.size}).map((_, i) => ({
      row: orientation === 'vertical' ? hoveredCell.row + i : hoveredCell.row,
      col: orientation === 'horizontal' ? hoveredCell.col + i : hoveredCell.col,
  })) : [];
  const isPreviewValid = hoveredCell && currentPlacingShip ? canPlaceShip(currentPlacingShip, playerGrid, hoveredCell.row, hoveredCell.col, orientation) : false;

  const playerHits = TOTAL_SHIP_CELLS - playerShips.reduce((acc, s) => acc + s.positions.filter(p => playerGrid[p.row][p.col].status === 'SHIP').length, 0);
  const enemyHits = TOTAL_SHIP_CELLS - enemyShips.reduce((acc, s) => acc + s.positions.filter(p => enemyGrid[p.row][p.col].status === 'SHIP').length, 0);

  return (
    <div className="flex flex-col items-center justify-center p-2 h-full bg-black/50 text-primary font-body">
      <p className="font-headline text-[8px] text-primary mb-2">BATTLESHIP.exe</p>
      <div className='flex gap-4 items-start'>
          {['YOUR FLEET', 'ENEMY WATERS'].map((title, gridIndex) => (
            <div key={title}>
              <p className="font-headline text-[7px] text-center mb-1">{title}</p>
              <div className="flex">
                  <div className='flex flex-col items-center justify-around w-5 text-xs'>{GRID_LABELS.rows.map(l => <span key={l}>{l}</span>)}</div>
                  <div className='flex flex-col'>
                      <div className='flex w-[202px] items-center justify-around h-5 text-xs'>{GRID_LABELS.cols.map(l => <span key={l}>{l}</span>)}</div>
                      <div className="grid grid-cols-10 w-[202px] h-[202px] border bg-black border-primary">
                          {Array.from({length: 100}).map((_, i) => {
                              const r = Math.floor(i / 10), c = i % 10;
                              const isPlayerGrid = gridIndex === 0;
                              const grid = isPlayerGrid ? playerGrid : enemyGrid;
                              const cell = grid[r][c];
                              const isPreviewing = isPlayerGrid && previewCells.some(p => p.row === r && p.col === c);
                              return <div key={i}
                                  className={cn("w-5 h-5 border-r border-b border-primary/20 flex items-center justify-center",
                                      isPlayerGrid && cell.status === 'SHIP' && 'bg-green-900/70',
                                      cell.status === 'HIT' && 'bg-red-900/70', cell.status === 'MISS' && 'bg-blue-900/30',
                                      cell.status === 'SUNK' && 'bg-neutral-800 border-red-500/50',
                                      isPlayerGrid && isPreviewing && (isPreviewValid ? 'bg-green-700/50' : 'bg-red-700/50'),
                                      isPlayerGrid && phase === 'PLACEMENT' && 'cursor-pointer',
                                      !isPlayerGrid && phase === 'BATTLE' && turn === 'PLAYER' && cell.status === 'EMPTY' && 'cursor-crosshair hover:bg-red-900/30'
                                  )}
                                  onMouseEnter={() => isPlayerGrid && setHoveredCell({row: r, col: c})}
                                  onMouseLeave={() => isPlayerGrid && setHoveredCell(null)}
                                  onClick={() => isPlayerGrid ? handlePlacementClick(r,c) : fireAtEnemy(r,c)}
                              >
                                  {phase === 'GAMEOVER' && !isPlayerGrid && cell.status === 'SHIP' && <span className='text-green-800'>■</span>}
                                  {cell.status === 'HIT' && <span className='text-red-500 font-bold'>X</span>}
                                  {cell.status === 'MISS' && <span className='text-blue-400 text-lg'>•</span>}
                              </div>
                          })}
                      </div>
                  </div>
              </div>
          </div>
          ))}
          <div className='w-32 text-center mt-6'>
              <p className='font-headline text-[7px]'>STATUS</p>
              <div className='h-24 p-1 border border-primary/30 mt-1 text-sm text-center flex flex-col justify-center'>
                  {phase === 'BATTLE' && <p className={cn(turn === 'PLAYER' ? 'text-green-400' : 'text-yellow-400', 'font-headline text-[7px] animate-pulse')}>{turn}'S TURN</p>}
                  <p className='mt-2'>{statusMessage}</p>
              </div>
          </div>
      </div>
      <div className='mt-4 h-24 flex flex-col justify-center'>
        {phase === 'PLACEMENT' && <>
              <p className='text-center text-sm mb-2'>Placing: {currentPlacingShip?.name} ({'■'.repeat(currentPlacingShip?.size)})</p>
              <p className='text-center text-xs text-primary/70 mb-2'>CLICK TO PLACE | R TO ROTATE</p>
              <div className='flex gap-2 justify-center'>
                 <button onClick={autoPlaceShips} className="font-headline text-[7px] px-2 py-1 border border-primary/50 text-primary/70">AUTO-PLACE</button>
                 <button onClick={resetPlacement} className="font-headline text-[7px] px-2 py-1 border border-primary/50 text-primary/70">RESET</button>
                 {placingShipIndex >= playerShips.length && (
                    <button onClick={startBattle} className='font-headline text-[8px] p-2 border-2 border-primary bg-black/30 text-primary hover:bg-accent hover:text-accent-foreground animate-pulse'>[ ▶ START BATTLE ]</button>
                 )}
              </div>
        </>}
        {phase === 'GAMEOVER' && <div className="text-center">
            <h2 className={cn('font-headline text-lg', winner === 'PLAYER' ? 'text-yellow-400' : 'text-red-500')}>{winner === 'PLAYER' ? 'VICTORY!' : 'DEFEATED!'}</h2>
            <button onClick={resetGame} className="mt-4 font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">PLAY AGAIN</button>
        </div>}
      </div>
    </div>
  );
}