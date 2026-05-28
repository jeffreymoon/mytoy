'use client'

import { useState, useCallback } from 'react'
import type { GameState, Difficulty } from '@/types/sudoku'
import {
  generateBoard,
  maskByDifficulty,
  computeStatuses,
  isBoardCleared,
} from '@/lib/sudoku/engine'

function initialState(): GameState {
  return {
    phase: 'home',
    difficulty: null,
    board: [],
    solution: [],
    selectedCell: null,
  }
}

export function useSudokuGame() {
  const [state, setState] = useState<GameState>(initialState)

  const startGame = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'difficulty' }))
  }, [])

  const selectDifficulty = useCallback((difficulty: Difficulty) => {
    const solution = generateBoard()
    const board = maskByDifficulty(solution, difficulty)
    setState({ phase: 'playing', difficulty, board, solution, selectedCell: null })
  }, [])

  const selectCell = useCallback((r: number, c: number) => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev
      const cell = prev.board[r]?.[c]
      if (!cell || cell.status === 'clue' || cell.status === 'hint') return prev
      return { ...prev, selectedCell: [r, c] }
    })
  }, [])

  const inputNumber = useCallback((n: number) => {
    setState(prev => {
      if (prev.phase !== 'playing' || !prev.selectedCell) return prev
      const [r, c] = prev.selectedCell
      const cell = prev.board[r][c]
      if (cell.status === 'clue' || cell.status === 'hint') return prev
      const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })))
      newBoard[r][c] = { value: n, status: 'user-valid' }
      const computed = computeStatuses(newBoard, prev.solution)
      const cleared = isBoardCleared(computed)
      return { ...prev, board: computed, phase: cleared ? 'cleared' : 'playing' }
    })
  }, [])

  const eraseCell = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'playing' || !prev.selectedCell) return prev
      const [r, c] = prev.selectedCell
      const cell = prev.board[r][c]
      if (cell.status === 'clue' || cell.status === 'hint') return prev
      const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })))
      newBoard[r][c] = { value: null, status: 'empty' }
      const computed = computeStatuses(newBoard, prev.solution)
      return { ...prev, board: computed }
    })
  }, [])

  const useHint = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'playing' || !prev.selectedCell) return prev
      const [r, c] = prev.selectedCell
      const cell = prev.board[r][c]
      if (cell.status === 'clue' || cell.status === 'hint' || cell.status === 'user-valid') {
        return prev
      }
      const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })))
      newBoard[r][c] = { value: prev.solution[r][c], status: 'hint' }
      const computed = computeStatuses(newBoard, prev.solution)
      const cleared = isBoardCleared(computed)
      return { ...prev, board: computed, phase: cleared ? 'cleared' : 'playing' }
    })
  }, [])

  const newGame = useCallback(() => {
    setState({ ...initialState(), phase: 'difficulty' })
  }, [])

  return { state, startGame, selectDifficulty, selectCell, inputNumber, eraseCell, useHint, newGame }
}
