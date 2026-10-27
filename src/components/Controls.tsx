import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  FastForward,
  Zap,
  Gauge,
  Trophy,
  MousePointerClick,
  Binary,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { AlgorithmStatus, Mode } from '../types/index';
import { useApp } from '../context/AppContext';

interface ControlsProps {
  mode: Mode;
  status: AlgorithmStatus;
  speedMs: number;
  stopOnFirst: boolean;
  solutionsCount: number;
  totalPossibleSolutions: number;
  solutionsList: number[][];
  onTogglePlayPause: () => void;
  onStepForward: () => void;
  onNextSolutionInstant: () => void;
  onSolveAllInstant: () => void;
  onClearBoard: () => void;
  onSpeedChange: (speed: number) => void;
  onStopOnFirstChange: (stop: boolean) => void;
  onModeChange: (mode: Mode) => void;
  onLoadSolution: (solution: number[]) => void;
  onOpenAllSolutions: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  mode,
  status,
  speedMs,
  stopOnFirst,
  solutionsCount,
  totalPossibleSolutions,
  solutionsList,
  onTogglePlayPause,
  onStepForward,
  onNextSolutionInstant,
  onSolveAllInstant,
  onClearBoard,
  onSpeedChange,
  onStopOnFirstChange,
  onModeChange,
  onLoadSolution,
  onOpenAllSolutions,
}) => {
  const { t } = useApp();
  const isRunning = status === 'running';
  const [selectedSolutionIdx, setSelectedSolutionIdx] = React.useState<number>(0);

  const handleSelectSolution = (idx: number) => {
    if (idx >= 0 && idx < solutionsList.length) {
      setSelectedSolutionIdx(idx);
      onLoadSolution(solutionsList[idx]);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-4 p-5 rounded-2xl bg-white/90 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl transition-colors">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => onModeChange('manual')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            mode === 'manual'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700/60'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <MousePointerClick className="w-4 h-4" />
          {t.modes.manual}
        </button>

        <button
          type="button"
          onClick={() => onModeChange('algorithm')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            mode === 'algorithm'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Binary className="w-4 h-4" />
          {t.modes.algorithm}
        </button>
      </div>

      {/* Solutions Counter Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/5 via-slate-100 to-slate-200 dark:from-slate-800/40 dark:via-slate-900/60 dark:to-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              {t.controls.solutionsFound}
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {solutionsCount}
              </span>
              <span className="text-xs font-mono text-slate-500">/ {totalPossibleSolutions}</span>
            </div>
          </div>
        </div>

        {/* View All 92 Button */}
        <button
          type="button"
          onClick={onOpenAllSolutions}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 transition-colors flex items-center gap-1"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Все 92</span>
        </button>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col gap-2.5">
        {/* Main Run / Pause Button */}
        <motion.button
          type="button"
          onClick={onTogglePlayPause}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2.5 shadow-lg transition-all ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>{t.controls.pauseAlgorithm}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>
                {status === 'paused' ? t.controls.resumeAlgorithm : t.controls.runAlgorithm}
              </span>
            </>
          )}
        </motion.button>

        {/* Instant Fast-Forward Buttons (Optimization!) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onNextSolutionInstant}
            className="py-2.5 px-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800 text-xs font-semibold text-sky-700 dark:text-sky-300 flex items-center justify-center gap-1.5 transition-all shadow-sm"
            title="Мгновенно найти и отобразить следующее решение"
          >
            <FastForward className="w-4 h-4 text-sky-500" />
            <span>{t.controls.nextSolutionInstant}</span>
          </button>

          <button
            type="button"
            onClick={onSolveAllInstant}
            className="py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5 transition-all shadow-sm"
            title="Мгновенно рассчитать все 92 решения"
          >
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span>{t.controls.solveAllInstant}</span>
          </button>
        </div>

        {/* Step Forward & Clear Board */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onStepForward}
            disabled={isRunning}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isRunning
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <StepForward className="w-4 h-4 text-sky-500" />
            <span>{t.controls.stepForward}</span>
          </button>

          <button
            type="button"
            onClick={onClearBoard}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-300 flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>{t.controls.clearBoard}</span>
          </button>
        </div>
      </div>

      {/* Speed Slider Section (Optimized with Turbo) */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Gauge className="w-4 h-4 text-sky-500" />
            {t.controls.algorithmSpeed}
          </span>
          <span className="font-mono text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1">
            {speedMs <= 5 ? (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px]">
                {t.controls.turbo}
              </span>
            ) : (
              `${speedMs} ${t.controls.speedUnit}`
            )}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="800"
          step="1"
          value={speedMs}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
        />

        {/* Quick Speed Presets */}
        <div className="grid grid-cols-4 gap-1 text-[10px] font-mono mt-0.5">
          <button
            type="button"
            onClick={() => onSpeedChange(1)}
            className={`py-0.5 rounded text-center transition-colors ${
              speedMs <= 5
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            1мс (Турбо)
          </button>
          <button
            type="button"
            onClick={() => onSpeedChange(25)}
            className={`py-0.5 rounded text-center transition-colors ${
              speedMs > 5 && speedMs <= 50
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t.controls.fast}
          </button>
          <button
            type="button"
            onClick={() => onSpeedChange(150)}
            className={`py-0.5 rounded text-center transition-colors ${
              speedMs > 50 && speedMs <= 250
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t.controls.normal}
          </button>
          <button
            type="button"
            onClick={() => onSpeedChange(500)}
            className={`py-0.5 rounded text-center transition-colors ${
              speedMs > 250
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t.controls.slow}
          </button>
        </div>
      </div>

      {/* Backtracking Option: Stop on first vs continuous */}
      <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <label htmlFor="stop-on-first" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          {t.controls.pauseOnSolution}
        </label>
        <input
          id="stop-on-first"
          type="checkbox"
          checked={stopOnFirst}
          onChange={(e) => onStopOnFirstChange(e.target.checked)}
          className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
        />
      </div>

      {/* Discovered Solutions Gallery / Picker */}
      {solutionsList.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Layers className="w-4 h-4 text-amber-500" />
              {t.controls.browseSolutions}
            </span>
            <span className="font-mono text-amber-600 dark:text-amber-400 text-xs font-semibold">
              {selectedSolutionIdx + 1} / {solutionsList.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={selectedSolutionIdx <= 0}
              onClick={() => handleSelectSolution(selectedSolutionIdx - 1)}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={selectedSolutionIdx}
              onChange={(e) => handleSelectSolution(Number(e.target.value))}
              aria-label="Выберите решение"
              className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-amber-500"
            >
              {solutionsList.map((_, i) => (
                <option key={i} value={i}>
                  {t.controls.solutionN}{i + 1}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={selectedSolutionIdx >= solutionsList.length - 1}
              onClick={() => handleSelectSolution(selectedSolutionIdx + 1)}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Info Hint */}
      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/50">
        <p className="flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            {mode === 'manual' ? t.controls.infoManual : t.controls.infoAlgorithm}
          </span>
        </p>
      </div>
    </div>
  );
};
