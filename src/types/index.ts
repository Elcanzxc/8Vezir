export type Position = {
  row: number; // 0 to 7
  col: number; // 0 to 7
};

export type SquareState = 
  | 'empty'
  | 'queen'
  | 'checking'       // Currently being tested by algorithm (ghost queen)
  | 'conflict'       // Conflicting square (red flash)
  | 'attacker'       // Queen that is attacking the current cell (red flash)
  | 'attack-line'    // Ray between attacker and conflict cell
  | 'safe-placed'    // Just placed successfully (green flash)
  | 'backtracked';   // Just removed due to backtrack

export type AlgorithmStatus = 'idle' | 'running' | 'paused' | 'completed';

export type Mode = 'manual' | 'algorithm';

export interface StepLog {
  id: string;
  type: 'try' | 'safe' | 'conflict' | 'backtrack' | 'solution';
  message: string;
  row: number;
  col: number;
  timestamp: number;
}

export type BoardMatrix = (number | null)[]; // row -> col index of queen, or null if empty

