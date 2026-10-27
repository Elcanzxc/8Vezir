import { Position } from '../types/index';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

/**
 * Converts row (0-7, top to bottom) and col (0-7, left to right)
 * to algebraic chess notation, e.g. (0, 0) -> "a8", (7, 4) -> "e1".
 */
export function toChessNotation(row: number, col: number): string {
  if (row < 0 || row > 7 || col < 0 || col > 7) return '';
  return `${FILES[col]}${RANKS[row]}`;
}

/**
 * Check if placing a queen at [row, col] is attacked by any existing queens.
 * Queens array maps: queens[r] = col | null
 */
export function checkSafety(
  queens: (number | null)[],
  targetRow: number,
  targetCol: number
): { safe: boolean; attackerRow: number | null; attackerCol: number | null } {
  for (let r = 0; r < 8; r++) {
    const c = queens[r];
    if (c === null || r === targetRow) continue;

    // Check same column
    if (c === targetCol) {
      return { safe: false, attackerRow: r, attackerCol: c };
    }

    // Check diagonals: abs(r1 - r2) === abs(c1 - c2)
    if (Math.abs(r - targetRow) === Math.abs(c - targetCol)) {
      return { safe: false, attackerRow: r, attackerCol: c };
    }
  }

  return { safe: true, attackerRow: null, attackerCol: null };
}

/**
 * Returns all squares that are on the direct attack line between two positions.
 */
export function getAttackRaySquares(
  r1: number,
  c1: number,
  r2: number,
  c2: number
): Position[] {
  const squares: Position[] = [];
  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);

  // Extend the line through the entire 8x8 board from attacker (r1, c1) in direction of target
  let curR = r1 + dr;
  let curC = c1 + dc;

  while (curR >= 0 && curR < 8 && curC >= 0 && curC < 8) {
    squares.push({ row: curR, col: curC });
    if (curR === r2 && curC === c2) {
      // Reached target
      break;
    }
    curR += dr;
    curC += dc;
  }

  return squares;
}

/**
 * Computes all attacking rays from all attackers threatening targetRow, targetCol
 */
export function getAllAttackersAndLines(
  queens: (number | null)[],
  targetRow: number,
  targetCol: number
): { attackers: Position[]; attackLines: Position[] } {
  const attackers: Position[] = [];
  const linesMap = new Map<string, Position>();

  for (let r = 0; r < 8; r++) {
    const c = queens[r];
    if (c === null || (r === targetRow && c === targetCol)) continue;

    const isCol = c === targetCol;
    const isDiag = Math.abs(r - targetRow) === Math.abs(c - targetCol);
    const isRow = r === targetRow;

    if (isCol || isDiag || isRow) {
      attackers.push({ row: r, col: c });
      const ray = getAttackRaySquares(r, c, targetRow, targetCol);
      for (const pos of ray) {
        linesMap.set(`${pos.row}-${pos.col}`, pos);
      }
    }
  }

  return {
    attackers,
    attackLines: Array.from(linesMap.values()),
  };
}

/**
 * Check if the board currently has a complete valid 8-queens solution.
 */
export function isValidSolution(queens: (number | null)[]): boolean {
  let count = 0;
  for (let r = 0; r < 8; r++) {
    const c = queens[r];
    if (c === null) return false;
    count++;
    // Check conflicts with previous rows
    for (let prevR = 0; prevR < r; prevR++) {
      const prevC = queens[prevR];
      if (prevC === null) return false;
      if (prevC === c || Math.abs(prevR - r) === Math.abs(prevC - c)) {
        return false;
      }
    }
  }
  return count === 8;
}
