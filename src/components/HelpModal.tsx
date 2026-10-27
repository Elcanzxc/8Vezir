import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Check, AlertTriangle, Cpu } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useApp();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-xl p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-lg">
                <BookOpen className="w-5 h-5" />
                <span>{t.help.title}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  {t.help.problemTitle}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.help.problemText}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-sky-500" />
                  {t.help.algoTitle}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.help.algoText}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {t.help.solutionsTitle}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.help.solutionsText}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
              >
                {t.help.close}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
