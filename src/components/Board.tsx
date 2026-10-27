import React from 'react';
import { Square } from './Square';
import { Position } from '../types/index';
import { ConflictState } from '../hooks/useEightQueens';
import { useApp } from '../context/AppContext';

interface BoardProps {
  queens: (number | null)[];
  candidateSquare: Position | null;
  conflictState: ConflictState | null;
  safeSquare: Position | null;
  backtrackSquare: Position | null;
  isInteractive: boolean;
  onSquareClick: (row: number, col: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  queens,
  candidateSquare,
  conflictState,
  safeSquare,
  backtrackSquare,
  isInteractive,
  onSquareClick,
}) => {
  const { theme } = useApp();

  return (
    <div className={`relative p-2 sm:p-3.5 rounded-2xl border transition-all duration-300 backdrop-blur-md shadow-2xl ${theme === 'dark'
        ? 'bg-gradient-to-b from-slate-800/90 to-slate-900/95 border-slate-700/60 shadow-[0_16px_50px_rgba(0,0,0,0.6)]'
        : 'bg-gradient-to-b from-amber-50 to-stone-100 border-amber-200/80 shadow-[0_16px_40px_rgba(180,83,9,0.15)]'
      }`}>
      {/* Outer subtle glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/15 via-sky-500/15 to-indigo-500/15 rounded-2xl blur-lg pointer-events-none -z-10" />

      {/* Chessboard 8x8 Grid */}
      <div className={`grid grid-cols-8 grid-rows-8 gap-0.5 sm:gap-1 w-[330px] h-[330px] sm:w-[450px] sm:h-[450px] md:w-[490px] md:h-[490px] rounded-xl overflow-hidden p-1 border transition-colors ${theme === 'dark'
          ? 'bg-slate-950/90 border-slate-800'
          : 'bg-amber-950/80 border-amber-900'
        }`}>
        {Array.from({ length: 8 }).map((_, row) => {
          return Array.from({ length: 8 }).map((_, col) => {
            const hasQueen = queens[row] === col;
            const isCandidate = candidateSquare?.row === row && candidateSquare?.col === col;
            const isSafeSquare = safeSquare?.row === row && safeSquare?.col === col;
            const isBacktrackedSquare = backtrackSquare?.row === row && backtrackSquare?.col === col;

            return (
              <Square
                key={`${row}-${col}`}
                row={row}
                col={col}
                hasQueen={hasQueen}
                isCandidate={isCandidate}
                conflictState={conflictState}
                isSafe={isSafeSquare}
                isBacktracked={isBacktrackedSquare}
                isInteractive={isInteractive}
                onClick={onSquareClick}
              />
            );
          });
        })}
      </div>
    </div>
  );
};
