import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSudokuGame } from './useSudokuGame'

describe('useSudokuGame', () => {
  describe('game flow', () => {
    it('starts at home phase', () => {
      const { result } = renderHook(() => useSudokuGame())
      expect(result.current.state.phase).toBe('home')
    })

    it('startGame → difficulty phase', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
      expect(result.current.state.phase).toBe('difficulty')
    })

    it('selectDifficulty → playing phase with board', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
      act(() => result.current.selectDifficulty('easy'))
      expect(result.current.state.phase).toBe('playing')
      expect(result.current.state.board).toHaveLength(9)
      expect(result.current.state.solution).toHaveLength(9)
    })
  })

  describe('selectCell', () => {
    function setup() {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
      act(() => result.current.selectDifficulty('normal'))
      return result
    }

    it('clicking an empty cell selects it', () => {
      const result = setup()
      const board = result.current.state.board
      // Find first empty cell
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
      const result = setup()
      const board = result.current.state.board
      // Find first clue cell
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
    function setup() {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
      act(() => result.current.selectDifficulty('normal'))

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
      const { result, r, c } = setup()
      const correct = result.current.state.solution[r][c]
      act(() => result.current.inputNumber(correct))
      expect(result.current.state.board[r][c].status).toBe('user-valid')
      expect(result.current.state.board[r][c].value).toBe(correct)
    })

    it('input without selectedCell → no change', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
      act(() => result.current.selectDifficulty('normal'))
      const before = result.current.state.board
      act(() => result.current.inputNumber(5))
      expect(result.current.state.board).toBe(before)
    })
  })

  describe('cleared guard', () => {
    function setupCleared() {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
      act(() => result.current.selectDifficulty('easy'))
      // Fill all empty cells with correct answers to trigger cleared phase
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

    it('newGame resets board and goes to difficulty', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
      act(() => result.current.selectDifficulty('hard'))
      act(() => result.current.newGame())
      expect(result.current.state.phase).toBe('difficulty')
      expect(result.current.state.board).toHaveLength(0)
      expect(result.current.state.selectedCell).toBeNull()
    })
  })

  describe('eraseCell', () => {
    it('erases user-entered cell value', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
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

    it('eraseCell is a no-op when no cell is selected', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
      act(() => result.current.selectDifficulty('normal'))

      // Find a clue cell - we can't select it, but test that eraseCell has no effect
      // when no cell is selected (no-op)
      const boardBefore = result.current.state.board
      act(() => result.current.eraseCell())
      expect(result.current.state.board).toBe(boardBefore)
    })
  })

  describe('useHint', () => {
    it('fills empty selected cell with solution value as hint', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
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
      act(() => result.current.startGame())
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
      // Re-select hint cell and try to input
      act(() => result.current.selectCell(emptyR, emptyC))
      const hintValue = result.current.state.board[emptyR][emptyC].value
      act(() => result.current.inputNumber(5))
      expect(result.current.state.board[emptyR][emptyC].value).toBe(hintValue)
      expect(result.current.state.board[emptyR][emptyC].status).toBe('hint')
    })

    it('hint cell cannot be erased', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
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
      act(() => result.current.eraseCell())
      expect(result.current.state.board[emptyR][emptyC].status).toBe('hint')
    })

    it('no-op when no cell selected', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
      act(() => result.current.selectDifficulty('normal'))
      const before = result.current.state.board
      act(() => result.current.useHint())
      expect(result.current.state.board).toBe(before)
    })

    it('no-op on user-valid cell', () => {
      const { result } = renderHook(() => useSudokuGame())
      act(() => result.current.startGame())
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
      expect(result.current.state.board[emptyR][emptyC].status).toBe('user-valid')
      const valueBefore = result.current.state.board[emptyR][emptyC].value
      act(() => result.current.useHint())
      expect(result.current.state.board[emptyR][emptyC].status).toBe('user-valid')
      expect(result.current.state.board[emptyR][emptyC].value).toBe(valueBefore)
    })
  })
})
