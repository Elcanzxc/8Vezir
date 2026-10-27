import { Position } from '../types/index';
import { checkSafety, getAllAttackersAndLines, toChessNotation, RANKS } from './chess';

export type BacktrackStep =
  | {
      type: 'try';
      row: number;
      col: number;
      message: string;
      queens: (number | null)[];
    }
  | {
      type: 'conflict';
      row: number;
      col: number;
      attackerRow: number;
      attackerCol: number;
      attackLines: Position[];
      message: string;
      queens: (number | null)[];
    }
  | {
      type: 'safe';
      row: number;
      col: number;
      message: string;
      queens: (number | null)[];
    }
  | {
      type: 'backtrack';
      fromRow: number;
      toRow: number;
      removedCol: number;
      message: string;
      queens: (number | null)[];
    }
  | {
      type: 'solution';
      solutionNumber: number;
      queens: number[];
      message: string;
    }
  | {
      type: 'finished';
      totalSolutions: number;
      message: string;
      queens: (number | null)[];
    };

/**
 * Generator that yields each discrete step of the recursive backtracking algorithm.
 * Can find up to all 92 distinct solutions or pause on each.
 */
export function* createBacktrackingSolver(
  stopOnFirstSolution = false,
  initialQueens: (number | null)[] = Array(8).fill(null),
  startRow = 0
): Generator<BacktrackStep, void, unknown> {
  const queens: (number | null)[] = [...initialQueens];
  let solutionCount = 0;

  function* solveRow(row: number): Generator<BacktrackStep, boolean, unknown> {
    if (row === 8) {
      solutionCount++;
      const currentSolution = [...queens] as number[];
      yield {
        type: 'solution',
        solutionNumber: solutionCount,
        queens: currentSolution,
        message: `Решение #${solutionCount} из 92 найдено! Все 8 ферзей в безопасности.`,
      };
      return stopOnFirstSolution;
    }

    for (let col = 0; col < 8; col++) {
      const coord = toChessNotation(row, col);

      // Step 1: Attempt placing
      yield {
        type: 'try',
        row,
        col,
        message: `Проверка клетки ${coord} (строка ${RANKS[row]})...`,
        queens: [...queens],
      };

      // Step 2: Safety check
      const { safe, attackerRow, attackerCol } = checkSafety(queens, row, col);

      if (!safe && attackerRow !== null && attackerCol !== null) {
        const { attackLines } = getAllAttackersAndLines(queens, row, col);
        const attackerCoord = toChessNotation(attackerRow, attackerCol);
        yield {
          type: 'conflict',
          row,
          col,
          attackerRow,
          attackerCol,
          attackLines,
          message: `Конфликт! Клетка ${coord} атакована ферзем на ${attackerCoord}.`,
          queens: [...queens],
        };
        continue;
      }

      // Safe! Place queen
      queens[row] = col;
      yield {
        type: 'safe',
        row,
        col,
        message: `Клетка ${coord} безопасна! Ферзь зафиксирован в строке ${RANKS[row]}.`,
        queens: [...queens],
      };

      // Recurse to next row
      const shouldStop = yield* solveRow(row + 1);
      if (shouldStop) {
        return true;
      }

      // If we reach here, we are backtracking
      const removedCol = queens[row]!;
      queens[row] = null;
      yield {
        type: 'backtrack',
        fromRow: row + 1,
        toRow: row,
        removedCol,
        message: `Возврат (Backtrack) к строке ${RANKS[row]}: убираем ферзя с ${toChessNotation(row, removedCol)} и ищем другое поле...`,
        queens: [...queens],
      };
    }

    return false;
  }

  yield* solveRow(startRow);

  yield {
    type: 'finished',
    totalSolutions: solutionCount,
    message: `Поиск завершен! Всего найдено ${solutionCount} решений.`,
    queens: [...queens],
  };
}

/**
 * Precomputes all 92 solutions for fast browsing and verification.
 * Uses bitwise operations for maximum O(1) performance.
 */
export function getAll92Solutions(): number[][] {
  const solutions: number[][] = [];
  const queens: number[] = Array(8).fill(-1);

  function solve(row: number, cols: number, d1: number, d2: number) {
    if (row === 8) {
      solutions.push([...queens]);
      return;
    }

    let available = (~(cols | d1 | d2)) & 0xff;
    while (available > 0) {
      const bit = available & -available;
      const col = Math.log2(bit);
      queens[row] = col;
      solve(
        row + 1,
        cols | bit,
        (d1 | bit) << 1,
        (d2 | bit) >> 1
      );
      available &= available - 1;
    }
  }

  solve(0, 0, 0, 0);
  return solutions;
}

/**
 * Converts a solution array into an algebraic notation list,
 * e.g. [0, 4, 7, 5, 2, 6, 1, 3] -> ["a8", "e7", "h6", "f5", "c4", "g3", "b2", "d1"]
 */
export function formatSolutionCoordinates(solution: number[]): string[] {
  return solution.map((col, row) => toChessNotation(row, col));
}
