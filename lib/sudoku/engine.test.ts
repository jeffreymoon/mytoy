import { describe, it, expect } from 'vitest'
import {
  generateBoard,
  maskByDifficulty,
  computeStatuses,
  isBoardCleared,
} from './engine'
import type { Cell } from '@/types/sudoku'

describe('generateBoard', () => {
  it('produces a 9×9 board with no zeros', () => {
    const board = generateBoard()
    expect(board).toHaveLength(9)
    board.forEach(row => {
      expect(row).toHaveLength(9)
      row.forEach(v => expect(v).toBeGreaterThanOrEqual(1))
    })
  })

  it('has no duplicates in any row', () => {
    const board = generateBoard()
    board.forEach(row => {
      expect(new Set(row).size).toBe(9)
    })
  })

  it('has no duplicates in any column', () => {
    const board = generateBoard()
    for (let c = 0; c < 9; c++) {
      const col = board.map(r => r[c])
      expect(new Set(col).size).toBe(9)
    }
  })

  it('has no duplicates in any 3×3 box', () => {
    const board = generateBoard()
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const values: number[] = []
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            values.push(board[boxRow * 3 + i][boxCol * 3 + j])
          }
        }
        expect(new Set(values).size).toBe(9)
      }
    }
  })
})

describe('maskByDifficulty', () => {
  const solution = generateBoard()

  it('easy: 38–42 clue cells', () => {
    const board = maskByDifficulty(solution, 'easy')
    const clues = board.flat().filter(c => c.status === 'clue').length
    expect(clues).toBeGreaterThanOrEqual(38)
    expect(clues).toBeLessThanOrEqual(42)
  })

  it('normal: 30–34 clue cells', () => {
    const board = maskByDifficulty(solution, 'normal')
    const clues = board.flat().filter(c => c.status === 'clue').length
    expect(clues).toBeGreaterThanOrEqual(30)
    expect(clues).toBeLessThanOrEqual(34)
  })

  it('hard: 22–26 clue cells', () => {
    const board = maskByDifficulty(solution, 'hard')
    const clues = board.flat().filter(c => c.status === 'clue').length
    expect(clues).toBeGreaterThanOrEqual(22)
    expect(clues).toBeLessThanOrEqual(26)
  })

  it('clue cells retain solution values; empty cells have null', () => {
    const board = maskByDifficulty(solution, 'normal')
    board.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell.status === 'clue') {
          expect(cell.value).toBe(solution[r][c])
        } else {
          expect(cell.value).toBeNull()
          expect(cell.status).toBe('empty')
        }
      })
    )
  })
})

describe('computeStatuses', () => {
  function makeBoard(solution: number[][]): Cell[][] {
    return solution.map(row => row.map(v => ({ value: v, status: 'clue' as const })))
  }

  function emptyBoard(): Cell[][] {
    return Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => ({ value: null, status: 'empty' as const }))
    )
  }

  it('clue and empty cells pass through unchanged', () => {
    const solution = generateBoard()
    const board = makeBoard(solution)
    const result = computeStatuses(board)
    result.forEach((row, r) =>
      row.forEach((cell, c) => {
        expect(cell.status).toBe('clue')
        expect(cell.value).toBe(solution[r][c])
      })
    )
  })

  it('user-valid: no conflict → user-valid', () => {
    const solution = generateBoard()
    const board = emptyBoard()
    // Place the correct value for (0,0) with user-valid status
    board[0][0] = { value: solution[0][0], status: 'user-valid' }
    const result = computeStatuses(board)
    expect(result[0][0].status).toBe('user-valid')
  })

  it('불변 규칙: two cells with same value → both conflict; erase one → other becomes valid', () => {
    const solution = generateBoard()
    const board = emptyBoard()
    const val = solution[0][0]
    // Put same value in (0,0) and (0,1) — same row conflict
    board[0][0] = { value: val, status: 'user-valid' }
    board[0][1] = { value: val, status: 'user-valid' }
    const after = computeStatuses(board, solution)
    expect(after[0][0].status).toBe('user-conflict')
    expect(after[0][1].status).toBe('user-conflict')

    // Erase (0,1) → (0,0) should become valid
    after[0][1] = { value: null, status: 'empty' }
    const after2 = computeStatuses(after, solution)
    expect(after2[0][0].status).toBe('user-valid')
  })

  it('conflict in same column', () => {
    const solution = generateBoard()
    const board = emptyBoard()
    const val = solution[0][0]
    board[0][0] = { value: val, status: 'user-valid' }
    board[1][0] = { value: val, status: 'user-valid' }
    const result = computeStatuses(board)
    expect(result[0][0].status).toBe('user-conflict')
    expect(result[1][0].status).toBe('user-conflict')
  })

  it('conflict in same 3×3 box', () => {
    const solution = generateBoard()
    const board = emptyBoard()
    const val = solution[0][0]
    board[0][0] = { value: val, status: 'user-valid' }
    board[1][1] = { value: val, status: 'user-valid' }
    const result = computeStatuses(board)
    expect(result[0][0].status).toBe('user-conflict')
    expect(result[1][1].status).toBe('user-conflict')
  })

  it('hint cells pass through unchanged', () => {
    const solution = generateBoard()
    const board = emptyBoard()
    board[0][0] = { value: solution[0][0], status: 'hint' }
    const result = computeStatuses(board)
    expect(result[0][0].status).toBe('hint')
  })
})

describe('isBoardCleared', () => {
  it('all filled with no conflicts → true', () => {
    const solution = generateBoard()
    const board: Cell[][] = solution.map(row =>
      row.map(v => ({ value: v, status: 'user-valid' as const }))
    )
    expect(isBoardCleared(board)).toBe(true)
  })

  it('any null value → false', () => {
    const solution = generateBoard()
    const board: Cell[][] = solution.map(row =>
      row.map(v => ({ value: v, status: 'user-valid' as const }))
    )
    board[4][4] = { value: null, status: 'empty' }
    expect(isBoardCleared(board)).toBe(false)
  })

  it('any conflict cell → false', () => {
    const solution = generateBoard()
    const board: Cell[][] = solution.map(row =>
      row.map(v => ({ value: v, status: 'user-valid' as const }))
    )
    board[0][0] = { value: 1, status: 'user-conflict' }
    expect(isBoardCleared(board)).toBe(false)
  })
})
