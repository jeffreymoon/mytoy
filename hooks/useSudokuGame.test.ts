import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSudokuGame } from './useSudokuGame'

vi.mock('@/services/storage', () => ({
  upsertUser: vi.fn(),
  addSession: vi.fn(),
  getUsers: vi.fn(() => []),
  getSessions: vi.fn(() => []),
  getUserSessions: vi.fn(() => []),
}))

const TEST_USER = { id: 'user-1', name: 'Test' }

function setupWithUser() {
  const hook = renderHook(() => useSudokuGame())
  act(() => hook.result.current.selectUser(TEST_USER))
  return hook.result
}

function setupPlaying(difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
  const result = setupWithUser()
  act(() => result.current.selectDifficulty(difficulty))
  return result
}

describe('useSudokuGame', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('game flow', () => {
    it('starts at user-select phase', () => {
      const { result } = renderHook(() => useSudokuGame())
      expect(result.current.state.phase).toBe('user-select')
    })

    it('selectUser → difficulty phase', () => {
      const result = setupWithUser()
      expect(result.current.state.phase).toBe('difficulty')
      expect(result.current.state.currentUser).toEqual(TEST_USER)
    })

    it('createUser → difficulty phase with new user', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.createUser('Alice'))
      expect(result.current.state.phase).toBe('difficulty')
      expect(result.current.state.currentUser?.name).toBe('Alice')
    })

    it('selectDifficulty → playing phase with board', () => {
      const result = setupPlaying('easy')
      expect(result.current.state.phase).toBe('playing')
      expect(result.current.state.board).toHaveLength(9)
      expect(result.current.state.solution).toHaveLength(9)
      expect(result.current.state.startedAt).toBeTypeOf('number')
    })
  })

  describe('selectCell', () => {
    it('clicking an empty cell selects it', () => {
      const result = setupPlaying()
      const board = result.current.state.board
      let emptyR = -1, emptyC = -1
      outer: for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c].status === 'empty') { emptyR = r; emptyC = c; break outer }
        }
      }
      act(() => result.current.selectCell(emptyR, emptyC))
      expect(result.current.state.selectedCell).toEqual([emptyR, emptyC])
    })

    it('clicking a clue cell does not change selectedCell', () => {
      const result = setupPlaying()
      const board = result.current.state.board
      let clueR = -1, clueC = -1
      outer: for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c].status === 'clue') { clueR = r; clueC = c; break outer }
        }
      }
      act(() => result.current.selectCell(clueR, clueC))
      expect(result.current.state.selectedCell).toBeNull()
    })
  })

  describe('inputNumber', () => {
    function setupWithCell() {
      const result = setupPlaying()
      const board = result.current.state.board
      let emptyR = -1, emptyC = -1
      outer: for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c].status === 'empty') { emptyR = r; emptyC = c; break outer }
        }
      }
      act(() => result.current.selectCell(emptyR, emptyC))
      return { result, r: emptyR, c: emptyC }
    }

    it('correct input → user-valid', () => {
      const { result, r, c } = setupWithCell()
      const correct = result.current.state.solution[r][c]
      act(() => result.current.inputNumber(correct))
      expect(result.current.state.board[r][c].status).toBe('user-valid')
      expect(result.current.state.board[r][c].value).toBe(correct)
    })

    it('input without selectedCell → no change', () => {
      const result = setupPlaying()
      const before = result.current.state.board
      act(() => result.current.inputNumber(5))
      expect(result.current.state.board).toBe(before)
    })
  })

  describe('abandonGame', () => {
    it('abandoning during playing → difficulty phase, board reset', () => {
      const result = setupPlaying()
      act(() => result.current.abandonGame())
      expect(result.current.state.phase).toBe('difficulty')
      expect(result.current.state.board).toHaveLength(0)
      expect(result.current.state.startedAt).toBeNull()
    })

    it('abandoning outside playing phase → no change', () => {
      const result = setupWithUser()
      expect(result.current.state.phase).toBe('difficulty')
      act(() => result.current.abandonGame())
      expect(result.current.state.phase).toBe('difficulty')
    })
  })

  describe('cleared guard', () => {
    function setupCleared() {
      const result = setupPlaying('easy')
      act(() => {
        const { board, solution } = result.current.state
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (board[r][c].status === 'empty') {
              result.current.selectCell(r, c)
              result.current.inputNumber(solution[r][c])
            }
          }
        }
      })
      return result
    }

    it('inputNumber in cleared state → no change', () => {
      const result = setupCleared()
      expect(result.current.state.phase).toBe('cleared')
      const snapshot = result.current.state.board
      act(() => result.current.inputNumber(5))
      expect(result.current.state.board).toBe(snapshot)
    })

    it('eraseCell in cleared state → no change', () => {
      const result = setupCleared()
      const snapshot = result.current.state.board
      act(() => result.current.eraseCell())
      expect(result.current.state.board).toBe(snapshot)
    })

    it('useHint in cleared state → no change', () => {
      const result = setupCleared()
      const snapshot = result.current.state.board
      act(() => result.current.useHint())
      expect(result.current.state.board).toBe(snapshot)
    })

    it('showStats → stats phase', () => {
      const result = setupCleared()
      act(() => result.current.showStats())
      expect(result.current.state.phase).toBe('stats')
    })

    it('newGame resets board and goes to difficulty', () => {
      const result = setupCleared()
      act(() => result.current.newGame())
      expect(result.current.state.phase).toBe('difficulty')
      expect(result.current.state.board).toHaveLength(0)
      expect(result.current.state.selectedCell).toBeNull()
    })
  })

  describe('eraseCell', () => {
    it('erases user-entered cell value', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.selectUser(TEST_USER))
      act(() => result.current.selectDifficulty('normal'))

      const board = result.current.state.board
      let emptyR = -1, emptyC = -1
      outer: for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c].status === 'empty') { emptyR = r; emptyC = c; break outer }
        }
      }
      act(() => result.current.selectCell(emptyR, emptyC))
      act(() => result.current.inputNumber(result.current.state.solution[emptyR][emptyC]))
      act(() => result.current.eraseCell())
      expect(result.current.state.board[emptyR][emptyC].status).toBe('empty')
      expect(result.current.state.board[emptyR][emptyC].value).toBeNull()
    })
  })

  describe('useHint', () => {
    it('fills empty selected cell with solution value as hint', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.selectUser(TEST_USER))
      act(() => result.current.selectDifficulty('normal'))

      const board = result.current.state.board
      let emptyR = -1, emptyC = -1
      outer: for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c].status === 'empty') { emptyR = r; emptyC = c; break outer }
        }
      }
      act(() => result.current.selectCell(emptyR, emptyC))
      act(() => result.current.useHint())
      const cell = result.current.state.board[emptyR][emptyC]
      expect(cell.status).toBe('hint')
      expect(cell.value).toBe(result.current.state.solution[emptyR][emptyC])
    })

    it('hint cell cannot be modified by inputNumber', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.selectUser(TEST_USER))
      act(() => result.current.selectDifficulty('normal'))

      const board = result.current.state.board
      let emptyR = -1, emptyC = -1
      outer: for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c].status === 'empty') { emptyR = r; emptyC = c; break outer }
        }
      }
      act(() => result.current.selectCell(emptyR, emptyC))
      act(() => result.current.useHint())
      act(() => result.current.selectCell(emptyR, emptyC))
      const hintValue = result.current.state.board[emptyR][emptyC].value
      act(() => result.current.inputNumber(5))
      expect(result.current.state.board[emptyR][emptyC].value).toBe(hintValue)
      expect(result.current.state.board[emptyR][emptyC].status).toBe('hint')
    })

    it('no-op when no cell selected', () => {
      const result = setupPlaying()
      const before = result.current.state.board
      act(() => result.current.useHint())
      expect(result.current.state.board).toBe(before)
    })
  })
})
