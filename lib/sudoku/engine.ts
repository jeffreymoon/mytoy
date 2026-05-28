import type { Cell, CellStatus, Difficulty } from '@/types/sudoku'

const CLUE_COUNTS: Record<Difficulty, number> = {
  easy: 40,
  normal: 32,
  hard: 24,
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function canPlace(board: number[][], r: number, c: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === n || board[i][c] === n) return false
  }
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[br + i][bc + j] === n) return false
    }
  }
  return true
}

function solve(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue
      for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (canPlace(board, r, c, n)) {
          board[r][c] = n
          if (solve(board)) return true
          board[r][c] = 0
        }
      }
      return false
    }
  }
  return true
}

export function generateBoard(): number[][] {
  const board = Array.from({ length: 9 }, () => Array<number>(9).fill(0))
  solve(board)
  return board
}

export function maskByDifficulty(solution: number[][], difficulty: Difficulty): Cell[][] {
  const target = CLUE_COUNTS[difficulty]
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  )
  const hiddenSet = new Set(
    positions.slice(0, 81 - target).map(([r, c]) => r * 9 + c)
  )
  return Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) =>
      hiddenSet.has(r * 9 + c)
        ? { value: null, status: 'empty' as CellStatus }
        : { value: solution[r][c], status: 'clue' as CellStatus }
    )
  )
}

function hasConflict(board: Cell[][], r: number, c: number, value: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (i !== c && board[r][i].value === value) return true
    if (i !== r && board[i][c].value === value) return true
  }
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const nr = br + i
      const nc = bc + j
      if ((nr !== r || nc !== c) && board[nr][nc].value === value) return true
    }
  }
  return false
}

export function computeStatuses(board: Cell[][]): Cell[][] {
  return board.map((row, r) =>
    row.map((cell, c) => {
      if (cell.status === 'clue' || cell.status === 'empty' || cell.status === 'hint') {
        return cell
      }
      if (cell.value === null) return { ...cell, status: 'empty' as CellStatus }
      return {
        ...cell,
        status: (hasConflict(board, r, c, cell.value)
          ? 'user-conflict'
          : 'user-valid') as CellStatus,
      }
    })
  )
}

export function isBoardCleared(board: Cell[][]): boolean {
  return board.every(row =>
    row.every(cell => cell.value !== null && cell.status !== 'user-conflict')
  )
}
