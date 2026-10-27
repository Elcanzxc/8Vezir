import React, { useState, useMemo } from 'react';
import { Search, Check, ArrowLeft, Sparkles, Hash } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatSolutionCoordinates } from '../utils/solver';
import { MiniBoard } from './MiniBoard';

interface AllSolutionsViewProps {
  allSolutions: number[][];
  currentQueens: (number | null)[];
  onSelectSolution: (solution: number[]) => void;
  onBackToBoard: () => void;
}

export const AllSolutionsView: React.FC<AllSolutionsViewProps> = ({
  allSolutions,
  currentQueens,
  onSelectSolution,
  onBackToBoard,
}) => {
  const { t, theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Check which solution matches current board
  const activeSolutionIndex = useMemo(() => {
    return allSolutions.findIndex((sol) =>
      sol.every((col, row) => currentQueens[row] === col)
    );
  }, [allSolutions, currentQueens]);

  // Filter solutions
  const filteredSolutions = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSolutions.map((sol, idx) => ({ sol, idx }));
    }
    const q = searchQuery.toLowerCase().trim();
    return allSolutions
      .map((sol, idx) => ({ sol, idx }))
      .filter(({ idx, sol }) => {
        const numMatch = (idx + 1).toString().includes(q);
        const coords = formatSolutionCoordinates(sol).join(' ').toLowerCase();
        return numMatch || coords.includes(q);
      });
  }, [allSolutions, searchQuery]);

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 overflow-hidden">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToBoard}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.allSolutionsTab.backToBoard}</span>
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {t.allSolutionsTab.title}
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {t.allSolutionsTab.totalCount}
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.allSolutionsTab.subtitle}
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.allSolutionsTab.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
          {filteredSolutions.map(({ sol, idx }) => {
            const isCurrent = activeSolutionIndex === idx;
            const coordinates = formatSolutionCoordinates(sol);

            return (
              <div
                key={idx}
                className={`flex flex-col p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 dark:text-slate-200">
                    <Hash className="w-4 h-4 text-amber-500" />
                    <span>{idx + 1}</span>
                  </div>

                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      <Sparkles className="w-3 h-3" />
                      {t.allSolutionsTab.currentApplied}
                    </span>
                  )}
                </div>

                {/* Ultra-fast Canvas Mini-board */}
                <div className="flex justify-center my-1">
                  <MiniBoard queens={sol} theme={theme} size={140} />
                </div>

                {/* Notation string */}
                <div className="mt-2 text-[10px] font-mono text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 py-1.5 px-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 truncate">
                  {coordinates.join(' ')}
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectSolution(sol);
                    onBackToBoard();
                  }}
                  className={`mt-2.5 w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{t.allSolutionsTab.currentApplied}</span>
                    </>
                  ) : (
                    <span>{t.allSolutionsTab.applyToBoard}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
