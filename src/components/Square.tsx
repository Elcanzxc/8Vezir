import React from 'react';
import { Crown } from 'lucide-react';
import { ConflictState } from '../hooks/useEightQueens';
import { FILES, RANKS } from '../utils/chess';
import { useApp } from '../context/AppContext';

interface SquareProps {
  row: number;
  col: number;
  hasQueen: boolean;
  isCandidate: boolean;
  conflictState: ConflictState | null;
  isSafe: boolean;
  isBacktracked: boolean;
  isInteractive: boolean;
  onClick: (row: number, col: number) => void;
}

export const Square: React.FC<SquareProps> = React.memo(({
  row,
  col,
  hasQueen,
  isCandidate,
  conflictState,
  isSafe,
  isBacktracked,
  isInteractive,
  onClick,
}) => {
  const { theme } = useApp();
  const isLightSquare = (row + col) % 2 === 0;

  // Conflict checks
  const isConflictTarget = conflictState?.target.row === row && conflictState?.target.col === col;
  const isAttacker = conflictState?.attacker.row === row && conflictState?.attacker.col === col;
  const isAttackLine =
    conflictState?.attackLines.some((pos) => pos.row === row && pos.col === col) &&
    !isConflictTarget &&
    !isAttacker;

  // Coordinates on border squares
  const showRank = col === 0;
  const showFile = row === 7;

  // Background styling
  let squareBg = '';
  if (theme === 'dark') {
    squareBg = isLightSquare ? 'bg-slate-800' : 'bg-slate-900';
    if (isConflictTarget) {
      squareBg = 'bg-rose-600/50 ring-2 ring-rose-500';
    } else if (isAttacker) {
      squareBg = 'bg-amber-600/40 ring-2 ring-rose-400';
    } else if (isAttackLine) {
      squareBg = 'bg-rose-950/70 ring-1 ring-rose-500/40';
    } else if (isSafe) {
      squareBg = 'bg-emerald-600/40 ring-2 ring-emerald-400';
    } else if (isCandidate) {
      squareBg = 'bg-sky-600/30 ring-1 ring-sky-400';
    } else if (isBacktracked) {
      squareBg = 'bg-indigo-900/30';
    }
  } else {
    // Light Theme
    squareBg = isLightSquare ? 'bg-amber-100' : 'bg-amber-700/80';
    if (isConflictTarget) {
      squareBg = 'bg-rose-400 ring-2 ring-rose-500';
    } else if (isAttacker) {
      squareBg = 'bg-amber-300 ring-2 ring-rose-500';
    } else if (isAttackLine) {
      squareBg = 'bg-rose-200 ring-1 ring-rose-400';
    } else if (isSafe) {
      squareBg = 'bg-emerald-300 ring-2 ring-emerald-500';
    } else if (isCandidate) {
      squareBg = 'bg-sky-200 ring-1 ring-sky-400';
    } else if (isBacktracked) {
      squareBg = 'bg-indigo-100';
    }
  }

  const coordColor = theme === 'dark' 
    ? 'text-slate-400/80' 
    : (isLightSquare ? 'text-amber-900/70' : 'text-amber-100/90');

  return (
    <button
      type="button"
      onClick={() => onClick(row, col)}
      aria-label={`Клетка ${FILES[col]}${RANKS[row]}`}
      className={`
        relative w-full aspect-square flex items-center justify-center
        transition-colors duration-100 select-none
        border border-slate-700/20 dark:border-slate-800/40 rounded-sm overflow-hidden
        ${squareBg}
        ${isInteractive ? 'cursor-pointer hover:opacity-90 active:scale-95' : 'cursor-default'}
      `}
    >
      {/* Rank coordinate indicator (left column) */}
      {showRank && (
        <span className={`absolute top-0.5 left-1 text-[10px] font-mono font-bold pointer-events-none ${coordColor}`}>
          {RANKS[row]}
        </span>
      )}

      {/* File coordinate indicator (bottom row) */}
      {showFile && (
        <span className={`absolute bottom-0 right-1 text-[10px] font-mono font-bold pointer-events-none ${coordColor}`}>
          {FILES[col]}
        </span>
      )}

      {/* Solid Queen */}
      {hasQueen && (
        <div className="relative z-10 flex items-center justify-center transition-transform transform scale-100 duration-150">
          <Crown
            className={`w-9 h-9 sm:w-11 sm:h-11 ${
              isAttacker
                ? 'text-rose-500 dark:text-rose-400'
                : isSafe
                ? 'text-emerald-500 dark:text-emerald-400'
                : theme === 'dark'
                ? 'text-amber-400 fill-amber-400/20 stroke-[2.2]'
                : 'text-amber-400 fill-amber-300 stroke-amber-950 stroke-[2.2]'
            }`}
          />
        </div>
      )}

      {/* Ghost Candidate Queen (checking step) - Pure lightweight CSS */}
      {isCandidate && !hasQueen && (
        <div className="relative z-10 flex items-center justify-center opacity-60">
          <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-sky-500 dark:text-sky-400 stroke-[1.8] stroke-dashed" />
        </div>
      )}

      {/* Conflict indicator */}
      {isConflictTarget && !hasQueen && (
        <div className="relative z-10 text-rose-500 dark:text-rose-400 font-bold text-lg sm:text-xl">
          ✕
        </div>
      )}
    </button>
  );
});

Square.displayName = 'Square';
