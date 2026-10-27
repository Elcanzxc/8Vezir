import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle, CheckCircle2, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { AlgorithmStatus, Mode } from '../types/index';
import { useApp } from '../context/AppContext';

interface StatusPanelProps {
  statusKey: string;
  statusParams: Record<string, string | number>;
  status: AlgorithmStatus;
  mode: Mode;
  stepCount: number;
  placedQueensCount: number;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  statusKey,
  statusParams,
  status,
  mode,
  stepCount,
  placedQueensCount,
}) => {
  const { t, theme } = useApp();

  // Get raw message template from i18n
  const rawTemplate = (t.status as any)[statusKey] || t.status.initial;

  // Substitute {params}
  let message = rawTemplate;
  Object.entries(statusParams).forEach(([key, val]) => {
    message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
  });

  // Determine state
  const isConflict = statusKey === 'cannotPlace' || statusKey === 'stepConflict';
  const isSafe = statusKey === 'stepSafe' || statusKey === 'queenPlaced';
  const isBacktrack = statusKey === 'stepBacktrack' || statusKey === 'queenRemoved';
  const isSolution = statusKey === 'stepSolution' || statusKey === 'manualWon' || statusKey === 'instantAllDone';

  let Icon = Activity;
  let accentColor = '';

  if (theme === 'dark') {
    accentColor = 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    if (isConflict) {
      Icon = AlertCircle;
      accentColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    } else if (isSafe) {
      Icon = ShieldCheck;
      accentColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    } else if (isBacktrack) {
      Icon = RotateCcw;
      accentColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    } else if (isSolution) {
      Icon = Sparkles;
      accentColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    } else if (status === 'completed') {
      Icon = CheckCircle2;
      accentColor = 'text-teal-400 bg-teal-500/10 border-teal-500/30';
    }
  } else {
    // Light mode
    accentColor = 'text-sky-700 bg-sky-50 border-sky-200';
    if (isConflict) {
      Icon = AlertCircle;
      accentColor = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (isSafe) {
      Icon = ShieldCheck;
      accentColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (isBacktrack) {
      Icon = RotateCcw;
      accentColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
    } else if (isSolution) {
      Icon = Sparkles;
      accentColor = 'text-amber-700 bg-amber-50 border-amber-300';
    } else if (status === 'completed') {
      Icon = CheckCircle2;
      accentColor = 'text-teal-700 bg-teal-50 border-teal-200';
    }
  }

  return (
    <div className="w-full max-w-[490px] mt-4 flex flex-col gap-2">
      {/* Main Status Bar */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md transition-colors duration-300 ${accentColor}`}
      >
        <div className="flex-shrink-0">
          <Icon className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-xs sm:text-sm font-medium truncate"
              title={message}
            >
              {message}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Small badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {mode === 'algorithm' && stepCount > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {t.controls.step}: {stepCount}
            </span>
          )}

          <span
            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
              placedQueensCount === 8
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            ♛ {placedQueensCount}/8
          </span>
        </div>
      </div>

      {/* Mini Legend */}
      <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block shadow-sm" />
            {t.controls.legendQueen}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/40 border border-sky-400 inline-block" />
            {t.controls.legendCheck}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            {t.controls.legendThreat}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            {t.controls.legendSuccess}
          </span>
        </div>
        <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">
          {mode === 'manual' ? t.controls.legendManualHint : t.controls.legendAlgoHint}
        </span>
      </div>
    </div>
  );
};
