import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Check, RotateCcw, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  onClear,
}) => {
  const { t } = useApp();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center flex flex-col items-center"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Crown Trophy */}
            <div className="relative my-2">
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]"
              >
                <Crown className="w-12 h-12 stroke-[2.2] fill-amber-400/20" />
              </motion.div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-500 animate-bounce" />
            </div>

            <h3 className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.victory.title}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs">
              {t.victory.description}
            </p>

            <div className="flex items-center gap-3 mt-6 w-full">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-colors"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                {t.victory.inspectBoard}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClear();
                  onClose();
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                {t.victory.restart}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
