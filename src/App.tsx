import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { useEightQueens } from './hooks/useEightQueens';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { StatusPanel } from './components/StatusPanel';
import { Header } from './components/Header';
import { VictoryModal } from './components/VictoryModal';
import { HelpModal } from './components/HelpModal';
import { AllSolutionsView } from './components/AllSolutionsView';

const MainApp: React.FC = () => {
  const {
    queens,
    candidateSquare,
    conflictState,
    safeSquare,
    backtrackSquare,
    mode,
    status,
    speedMs,
    stopOnFirst,
    statusMessageKey,
    statusMessageParams,
    stepCount,
    solutionsFound,
    allPrecomputedSolutions,
    isWon,
    totalPossibleSolutions,
    handleSquareClick,
    togglePlayPause,
    stepForward,
    findNextSolution,
    findAllSolutionsInstant,
    clearBoard,
    setSpeedMs,
    setStopOnFirst,
    setMode,
    loadSolution,
    dismissWin,
  } = useEightQueens();

  const [activeTab, setActiveTab] = useState<'visualizer' | 'allSolutions'>('visualizer');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const placedQueensCount = queens.filter((col) => col !== null).length;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none overflow-hidden font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onShowHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Workspace */}
      {activeTab === 'visualizer' ? (
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 lg:p-6 gap-6 sm:gap-8 overflow-y-auto">
          {/* Left / Center Area: Board & Status */}
          <section className="flex flex-col items-center justify-center flex-1 max-w-2xl">
            <Board
              queens={queens}
              candidateSquare={candidateSquare}
              conflictState={conflictState}
              safeSquare={safeSquare}
              backtrackSquare={backtrackSquare}
              isInteractive={status !== 'running'}
              onSquareClick={handleSquareClick}
            />

            <StatusPanel
              statusKey={statusMessageKey}
              statusParams={statusMessageParams}
              status={status}
              mode={mode}
              stepCount={stepCount}
              placedQueensCount={placedQueensCount}
            />
          </section>

          {/* Right Area: Controls Panel */}
          <aside className="w-full lg:w-auto flex justify-center">
            <Controls
              mode={mode}
              status={status}
              speedMs={speedMs}
              stopOnFirst={stopOnFirst}
              solutionsCount={solutionsFound.length}
              totalPossibleSolutions={totalPossibleSolutions}
              solutionsList={solutionsFound}
              onTogglePlayPause={togglePlayPause}
              onStepForward={stepForward}
              onNextSolutionInstant={findNextSolution}
              onSolveAllInstant={findAllSolutionsInstant}
              onClearBoard={clearBoard}
              onSpeedChange={setSpeedMs}
              onStopOnFirstChange={setStopOnFirst}
              onModeChange={setMode}
              onLoadSolution={loadSolution}
              onOpenAllSolutions={() => setActiveTab('allSolutions')}
            />
          </aside>
        </main>
      ) : (
        <main className="flex-1 flex overflow-hidden">
          <AllSolutionsView
            allSolutions={allPrecomputedSolutions}
            currentQueens={queens}
            onSelectSolution={(sol) => {
              loadSolution(sol);
            }}
            onBackToBoard={() => setActiveTab('visualizer')}
          />
        </main>
      )}

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={isWon}
        onClose={dismissWin}
        onClear={clearBoard}
      />

      {/* Rules / Algorithm Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
