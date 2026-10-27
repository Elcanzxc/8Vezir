import React from 'react';
import { Crown, HelpCircle, Sun, Moon, Globe, Layers, LayoutGrid } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  activeTab: 'visualizer' | 'allSolutions';
  onTabChange: (tab: 'visualizer' | 'allSolutions') => void;
  onShowHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onShowHelp,
}) => {
  const { t, theme, language, toggleTheme, toggleLanguage } = useApp();

  return (
    <header className="w-full flex items-center justify-between py-2.5 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl transition-colors">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-blue-500/20 border border-amber-500/30 text-amber-500 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
          <Crown className="w-6 h-6 fill-amber-400/20" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {t.appTitle}
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {t.desktopBadge}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
            {t.appSubtitle}
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Visualizer vs All 92 Solutions) */}
      <nav className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onTabChange('visualizer')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'visualizer'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>{t.tabs.visualizer}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('allSolutions')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'allSolutions'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.tabs.allSolutions}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
            92
          </span>
        </button>
      </nav>

      {/* Action Controls: Theme, Language, Help */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
          className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          <span className="uppercase">{language}</span>
        </button>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? t.header.themeLight : t.header.themeDark}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Help Modal Button */}
        <button
          type="button"
          onClick={onShowHelp}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <HelpCircle className="w-4 h-4 text-sky-500" />
          <span className="hidden sm:inline">{t.header.help}</span>
        </button>
      </div>
    </header>
  );
};
