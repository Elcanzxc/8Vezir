import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Position, AlgorithmStatus, Mode } from '../types/index';
import {
  checkSafety,
  getAllAttackersAndLines,
  toChessNotation,
  isValidSolution,
} from '../utils/chess';
import {
  BacktrackStep,
  createBacktrackingSolver,
  getAll92Solutions,
} from '../utils/solver';

export interface ConflictState {
  target: Position;
  attacker: Position;
  attackLines: Position[];
}

export interface UseEightQueensReturn {
  // Board state
  queens: (number | null)[];
  candidateSquare: Position | null;
  conflictState: ConflictState | null;
  safeSquare: Position | null;
  backtrackSquare: Position | null;

  // App & Algorithm state
  mode: Mode;
  status: AlgorithmStatus;
  speedMs: number;
  stopOnFirst: boolean;
  statusMessageKey: string;
  statusMessageParams: Record<string, string | number>;
  stepCount: number;
  solutionsFound: number[][];
  allPrecomputedSolutions: number[][];
  currentSolutionIndex: number | null;
  isWon: boolean;
  totalPossibleSolutions: number;

  // Actions
  handleSquareClick: (row: number, col: number) => void;
  startAlgorithm: () => void;
  pauseAlgorithm: () => void;
  togglePlayPause: () => void;
  stepForward: () => void;
  findNextSolution: () => void;
  findAllSolutionsInstant: () => void;
  clearBoard: () => void;
  setSpeedMs: (speed: number) => void;
  setStopOnFirst: (stop: boolean) => void;
  setMode: (mode: Mode) => void;
  loadSolution: (solution: number[]) => void;
  dismissWin: () => void;
}

export function useEightQueens(): UseEightQueensReturn {
  const [queens, setQueens] = useState<(number | null)[]>(Array(8).fill(null));
  const [candidateSquare, setCandidateSquare] = useState<Position | null>(null);
  const [conflictState, setConflictState] = useState<ConflictState | null>(null);
  const [safeSquare, setSafeSquare] = useState<Position | null>(null);
  const [backtrackSquare, setBacktrackSquare] = useState<Position | null>(null);

  const [mode, setModeState] = useState<Mode>('manual');
  const [status, setStatus] = useState<AlgorithmStatus>('idle');
  const [speedMs, setSpeedMs] = useState<number>(100);
  const [stopOnFirst, setStopOnFirst] = useState<boolean>(true);

  // Status message localization keys and params
  const [statusMessageKey, setStatusMessageKey] = useState<string>('initial');
  const [statusMessageParams, setStatusMessageParams] = useState<Record<string, string | number>>({});

  const [stepCount, setStepCount] = useState<number>(0);
  const [solutionsFound, setSolutionsFound] = useState<number[][]>([]);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState<number | null>(null);
  const [isWon, setIsWon] = useState<boolean>(false);

  const allPrecomputedSolutions = useMemo(() => getAll92Solutions(), []);

  // References for running generator and timeouts
  const generatorRef = useRef<Generator<BacktrackStep, void, unknown> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | number | null>(null);
  const conflictTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<AlgorithmStatus>('idle');
  const speedRef = useRef<number>(speedMs);
  const stopOnFirstRef = useRef<boolean>(stopOnFirst);

  // Keep refs in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    speedRef.current = speedMs;
  }, [speedMs]);

  useEffect(() => {
    stopOnFirstRef.current = stopOnFirst;
  }, [stopOnFirst]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current as any);
      if (conflictTimeoutRef.current) clearTimeout(conflictTimeoutRef.current);
    };
  }, []);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // Ignore in environments without window/canvas
    }
  }, []);

  // --- MANUAL MODE CLICK HANDLER ---
  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (statusRef.current === 'running') {
        return;
      }

      setModeState('manual');
      if (conflictTimeoutRef.current) {
        clearTimeout(conflictTimeoutRef.current);
        conflictTimeoutRef.current = null;
      }
      setConflictState(null);
      setCandidateSquare(null);
      setSafeSquare(null);
      setBacktrackSquare(null);

      setQueens((prevQueens) => {
        const nextQueens = [...prevQueens];

        // If clicking existing queen, remove it
        if (nextQueens[row] === col) {
          nextQueens[row] = null;
          setStatusMessageKey('queenRemoved');
          setStatusMessageParams({ cell: toChessNotation(row, col) });
          setIsWon(false);
          return nextQueens;
        }

        // If clicking same row where another queen exists, temporarily clear that row to test
        const tempQueens = [...nextQueens];
        tempQueens[row] = null;

        // Check safety
        const { safe, attackerRow, attackerCol } = checkSafety(tempQueens, row, col);

        if (!safe && attackerRow !== null && attackerCol !== null) {
          const { attackLines } = getAllAttackersAndLines(tempQueens, row, col);
          setConflictState({
            target: { row, col },
            attacker: { row: attackerRow, col: attackerCol },
            attackLines,
          });

          setStatusMessageKey('cannotPlace');
          setStatusMessageParams({
            cell: toChessNotation(row, col),
            attacker: toChessNotation(attackerRow, attackerCol),
          });

          conflictTimeoutRef.current = setTimeout(() => {
            setConflictState(null);
          }, 650);

          return prevQueens;
        }

        // SAFE: Place queen
        nextQueens[row] = col;
        setSafeSquare({ row, col });
        setTimeout(() => setSafeSquare(null), 400);

        const currentPlaced = nextQueens.filter((c) => c !== null).length;
        if (currentPlaced === 8 && isValidSolution(nextQueens)) {
          setIsWon(true);
          triggerConfetti();
          setStatusMessageKey('manualWon');
          setStatusMessageParams({});
        } else {
          setStatusMessageKey('queenPlaced');
          setStatusMessageParams({
            cell: toChessNotation(row, col),
            count: currentPlaced,
          });
        }

        return nextQueens;
      });
    },
    [triggerConfetti]
  );

  // --- ALGORITHM STEP EXECUTOR (OPTIMIZED WITH BATCHING) ---
  const executeNextBatch = useCallback(() => {
    if (!generatorRef.current) {
      generatorRef.current = createBacktrackingSolver(stopOnFirstRef.current);
    }

    const curSpeed = speedRef.current;

    // Determine batch size:
    // If speed is very fast (e.g. 1-20ms), process 10 to 150 steps per tick!
    let batchSize = 1;
    let delay = curSpeed;

    if (curSpeed <= 5) {
      batchSize = 250;
      delay = 0;
    } else if (curSpeed <= 25) {
      batchSize = 50;
      delay = 10;
    } else if (curSpeed <= 60) {
      batchSize = 15;
      delay = 25;
    } else if (curSpeed <= 120) {
      batchSize = 4;
      delay = curSpeed;
    } else {
      batchSize = 1;
      delay = curSpeed;
    }

    let lastStep: BacktrackStep | null = null;
    let hitSolution = false;
    let hitFinished = false;

    for (let i = 0; i < batchSize; i++) {
      const { value: step, done } = generatorRef.current.next();

      if (done || !step) {
        hitFinished = true;
        break;
      }

      lastStep = step;

      if (step.type === 'solution') {
        hitSolution = true;
        setSolutionsFound((prev) => {
          const exists = prev.some((sol) =>
            sol.every((val, idx) => val === step.queens[idx])
          );
          if (exists) return prev;
          return [...prev, [...step.queens]];
        });

        if (stopOnFirstRef.current) {
          break;
        }
      }
    }

    setStepCount((count) => count + (lastStep ? batchSize : 0));

    if (hitFinished) {
      setStatus('completed');
      statusRef.current = 'completed';
      setStatusMessageKey('algoCompletedFull');
      setStatusMessageParams({});
      generatorRef.current = null;
      return;
    }

    if (!lastStep) return;

    // Apply the latest step to UI
    switch (lastStep.type) {
      case 'try': {
        setQueens(lastStep.queens);
        setCandidateSquare({ row: lastStep.row, col: lastStep.col });
        setConflictState(null);
        setSafeSquare(null);
        setBacktrackSquare(null);
        setStatusMessageKey('stepChecking');
        setStatusMessageParams({
          cell: toChessNotation(lastStep.row, lastStep.col),
          rank: 8 - lastStep.row,
        });
        break;
      }

      case 'conflict': {
        setQueens(lastStep.queens);
        setCandidateSquare(null);
        setConflictState({
          target: { row: lastStep.row, col: lastStep.col },
          attacker: { row: lastStep.attackerRow, col: lastStep.attackerCol },
          attackLines: lastStep.attackLines,
        });
        setStatusMessageKey('stepConflict');
        setStatusMessageParams({
          cell: toChessNotation(lastStep.row, lastStep.col),
          attacker: toChessNotation(lastStep.attackerRow, lastStep.attackerCol),
        });
        break;
      }

      case 'safe': {
        const nextQ = [...lastStep.queens];
        nextQ[lastStep.row] = lastStep.col;
        setQueens(nextQ);
        setCandidateSquare(null);
        setConflictState(null);
        setSafeSquare({ row: lastStep.row, col: lastStep.col });
        setStatusMessageKey('stepSafe');
        setStatusMessageParams({
          cell: toChessNotation(lastStep.row, lastStep.col),
          rank: 8 - lastStep.row,
        });
        break;
      }

      case 'backtrack': {
        setQueens(lastStep.queens);
        setCandidateSquare(null);
        setConflictState(null);
        setSafeSquare(null);
        setBacktrackSquare({ row: lastStep.toRow, col: lastStep.removedCol });
        setStatusMessageKey('stepBacktrack');
        setStatusMessageParams({
          rank: 8 - lastStep.toRow,
          cell: toChessNotation(lastStep.toRow, lastStep.removedCol),
        });
        break;
      }

      case 'solution': {
        setQueens([...lastStep.queens]);
        setCandidateSquare(null);
        setConflictState(null);
        setSafeSquare(null);
        setBacktrackSquare(null);
        setStatusMessageKey('stepSolution');
        setStatusMessageParams({ num: lastStep.solutionNumber });
        triggerConfetti();

        if (stopOnFirstRef.current) {
          setStatus('paused');
          statusRef.current = 'paused';
          return;
        }
        break;
      }

      case 'finished': {
        setCandidateSquare(null);
        setConflictState(null);
        setSafeSquare(null);
        setBacktrackSquare(null);
        setStatus('completed');
        statusRef.current = 'completed';
        setStatusMessageKey('algoFinished');
        setStatusMessageParams({ total: lastStep.totalSolutions });
        generatorRef.current = null;
        return;
      }
    }

    if (hitSolution && stopOnFirstRef.current) {
      setStatus('paused');
      statusRef.current = 'paused';
      return;
    }

    // Schedule next tick if still running
    if (statusRef.current === 'running') {
      if (delay === 0) {
        timerRef.current = requestAnimationFrame(() => {
          executeNextBatch();
        });
      } else {
        timerRef.current = setTimeout(() => {
          executeNextBatch();
        }, delay);
      }
    }
  }, [triggerConfetti]);

  // --- FAST FORWARD TO NEXT SOLUTION (INSTANT) ---
  const findNextSolution = useCallback(() => {
    setModeState('algorithm');
    setIsWon(false);
    if (statusRef.current === 'running') {
      setStatus('paused');
      statusRef.current = 'paused';
      if (timerRef.current) clearTimeout(timerRef.current as any);
    }

    if (!generatorRef.current) {
      generatorRef.current = createBacktrackingSolver(false);
    }

    let iterations = 0;
    while (iterations < 100000) {
      iterations++;
      const { value: step, done } = generatorRef.current.next();

      if (done || !step) {
        setStatus('completed');
        statusRef.current = 'completed';
        setStatusMessageKey('algoCompletedFull');
        setStatusMessageParams({});
        generatorRef.current = null;
        return;
      }

      if (step.type === 'solution') {
        setQueens([...step.queens]);
        setCandidateSquare(null);
        setConflictState(null);
        setSafeSquare(null);
        setBacktrackSquare(null);
        setStatus('paused');
        statusRef.current = 'paused';
        setStatusMessageKey('stepSolution');
        setStatusMessageParams({ num: step.solutionNumber });
        triggerConfetti();

        setSolutionsFound((prev) => {
          const exists = prev.some((sol) =>
            sol.every((val, idx) => val === step.queens[idx])
          );
          if (exists) return prev;
          return [...prev, [...step.queens]];
        });
        return;
      }
    }
  }, [triggerConfetti]);

  // --- SOLVE ALL 92 INSTANTLY ---
  const findAllSolutionsInstant = useCallback(() => {
    setModeState('algorithm');
    const all = getAll92Solutions();
    setSolutionsFound(all);
    setQueens([...all[0]]);
    setCandidateSquare(null);
    setConflictState(null);
    setSafeSquare(null);
    setBacktrackSquare(null);
    setStatus('completed');
    statusRef.current = 'completed';
    generatorRef.current = null;
    setStatusMessageKey('instantAllDone');
    setStatusMessageParams({});
    triggerConfetti();
  }, [triggerConfetti]);

  // --- CONTROLS ---
  const startAlgorithm = useCallback(() => {
    setModeState('algorithm');
    setIsWon(false);
    setConflictState(null);
    setCandidateSquare(null);

    if (statusRef.current === 'idle' || statusRef.current === 'completed') {
      generatorRef.current = createBacktrackingSolver(stopOnFirstRef.current);
      setQueens(Array(8).fill(null));
      setStepCount(0);
    }

    setStatus('running');
    statusRef.current = 'running';

    if (timerRef.current) clearTimeout(timerRef.current as any);
    timerRef.current = setTimeout(() => {
      executeNextBatch();
    }, 20);
  }, [executeNextBatch]);

  const pauseAlgorithm = useCallback(() => {
    setStatus('paused');
    statusRef.current = 'paused';
    if (timerRef.current) {
      clearTimeout(timerRef.current as any);
      timerRef.current = null;
    }
    setStatusMessageKey('paused');
    setStatusMessageParams({});
  }, []);

  const togglePlayPause = useCallback(() => {
    if (status === 'running') {
      pauseAlgorithm();
    } else {
      startAlgorithm();
    }
  }, [status, pauseAlgorithm, startAlgorithm]);

  const stepForward = useCallback(() => {
    setModeState('algorithm');
    setIsWon(false);
    if (statusRef.current === 'running') {
      pauseAlgorithm();
    }
    setStatus('paused');
    statusRef.current = 'paused';

    if (!generatorRef.current) {
      generatorRef.current = createBacktrackingSolver(stopOnFirstRef.current);
    }

    const { value: step, done } = generatorRef.current.next();

    if (done || !step) {
      setStatus('completed');
      statusRef.current = 'completed';
      setStatusMessageKey('algoCompletedFull');
      setStatusMessageParams({});
      generatorRef.current = null;
      return;
    }

    setStepCount((c) => c + 1);

    if (step.type === 'try') {
      setQueens(step.queens);
      setCandidateSquare({ row: step.row, col: step.col });
      setConflictState(null);
      setStatusMessageKey('stepChecking');
      setStatusMessageParams({
        cell: toChessNotation(step.row, step.col),
        rank: 8 - step.row,
      });
    } else if (step.type === 'conflict') {
      setQueens(step.queens);
      setCandidateSquare(null);
      setConflictState({
        target: { row: step.row, col: step.col },
        attacker: { row: step.attackerRow, col: step.attackerCol },
        attackLines: step.attackLines,
      });
      setStatusMessageKey('stepConflict');
      setStatusMessageParams({
        cell: toChessNotation(step.row, step.col),
        attacker: toChessNotation(step.attackerRow, step.attackerCol),
      });
    } else if (step.type === 'safe') {
      const nq = [...step.queens];
      nq[step.row] = step.col;
      setQueens(nq);
      setCandidateSquare(null);
      setConflictState(null);
      setSafeSquare({ row: step.row, col: step.col });
      setStatusMessageKey('stepSafe');
      setStatusMessageParams({
        cell: toChessNotation(step.row, step.col),
        rank: 8 - step.row,
      });
    } else if (step.type === 'backtrack') {
      setQueens(step.queens);
      setCandidateSquare(null);
      setConflictState(null);
      setSafeSquare(null);
      setBacktrackSquare({ row: step.toRow, col: step.removedCol });
      setStatusMessageKey('stepBacktrack');
      setStatusMessageParams({
        rank: 8 - step.toRow,
        cell: toChessNotation(step.toRow, step.removedCol),
      });
    } else if (step.type === 'solution') {
      setQueens([...step.queens]);
      setCandidateSquare(null);
      setConflictState(null);
      setSafeSquare(null);
      setStatusMessageKey('stepSolution');
      setStatusMessageParams({ num: step.solutionNumber });
      triggerConfetti();
      setSolutionsFound((prev) => {
        const exists = prev.some((sol) =>
          sol.every((val, idx) => val === step.queens[idx])
        );
        if (exists) return prev;
        return [...prev, [...step.queens]];
      });
    }
  }, [pauseAlgorithm, triggerConfetti]);

  const clearBoard = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current as any);
      timerRef.current = null;
    }
    if (conflictTimeoutRef.current) {
      clearTimeout(conflictTimeoutRef.current);
      conflictTimeoutRef.current = null;
    }

    generatorRef.current = null;
    setQueens(Array(8).fill(null));
    setCandidateSquare(null);
    setConflictState(null);
    setSafeSquare(null);
    setBacktrackSquare(null);
    setStatus('idle');
    statusRef.current = 'idle';
    setStepCount(0);
    setIsWon(false);
    setCurrentSolutionIndex(null);
    setStatusMessageKey('boardCleared');
    setStatusMessageParams({});
  }, []);

  const loadSolution = useCallback((solution: number[]) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current as any);
      timerRef.current = null;
    }
    generatorRef.current = null;
    setStatus('idle');
    statusRef.current = 'idle';
    setCandidateSquare(null);
    setConflictState(null);
    setSafeSquare(null);
    setBacktrackSquare(null);
    setQueens([...solution]);
    setIsWon(true);
    setStatusMessageKey('solutionLoaded');
    setStatusMessageParams({ num: '' });
  }, []);

  const dismissWin = useCallback(() => {
    setIsWon(false);
  }, []);

  const setMode = useCallback((newMode: Mode) => {
    if (newMode === 'manual' && statusRef.current === 'running') {
      pauseAlgorithm();
    }
    setModeState(newMode);
  }, [pauseAlgorithm]);

  return {
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
    currentSolutionIndex,
    isWon,
    totalPossibleSolutions: 92,
    handleSquareClick,
    startAlgorithm,
    pauseAlgorithm,
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
  };
}
