'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState, Difficulty, User, GameSession } from '@/types/sudoku'
import {
  generateBoard,
  maskByDifficulty,
  computeStatuses,
  isBoardCleared,
} from '@/lib/sudoku/engine'
import { upsertUser, addSession } from '@/services/storage'

function initialState(): GameState {
  return {
    phase: 'user-select',
    difficulty: null,
    board: [],
    solution: [],
    selectedCell: null,
    currentUser: null,
    startedAt: null,
  }
}

function makeSession(
  userId: string,
  difficulty: Difficulty,
  startedAt: number,
  outcome: 'success' | 'failure'
): GameSession {
  const endTime = Date.now()
  return {
    id: crypto.randomUUID(),
    userId,
    difficulty,
    startTime: startedAt,
    endTime,
    duration: Math.floor((endTime - startedAt) / 1000),
    outcome,
  }
}

export function useSudokuGame() {
  const [state, setState] = useState<GameState>(initialState)
  const pendingSessionRef = useRef<GameSession | null>(null)

  useEffect(() => {
    if (pendingSessionRef.current) {
      addSession(pendingSessionRef.current)
      pendingSessionRef.current = null
    }
  }, [state.phase])

  const selectUser = useCallback((user: User) => {
    setState(prev => ({ ...prev, phase: 'difficulty', currentUser: user }))
  }, [])

  const createUser = useCallback((name: string) => {
    const user: User = { id: crypto.randomUUID(), name: name.trim() }
    upsertUser(user)
    setState(prev => ({ ...prev, phase: 'difficulty', currentUser: user }))
  }, [])

  const selectDifficulty = useCallback((difficulty: Difficulty) => {
    const solution = generateBoard()
    const board = maskByDifficulty(solution, difficulty)
    setState(prev => ({
      ...prev,
      phase: 'playing',
      difficulty,
      board,
      solution,
      selectedCell: null,
      startedAt: Date.now(),
    }))
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
      const computed = computeStatuses(newBoard)
      const cleared = isBoardCleared(computed)
      if (cleared && prev.currentUser && prev.startedAt) {
        pendingSessionRef.current = makeSession(
          prev.currentUser.id,
          prev.difficulty!,
          prev.startedAt,
          'success'
        )
      }
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
      const computed = computeStatuses(newBoard)
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
      const computed = computeStatuses(newBoard)
      const cleared = isBoardCleared(computed)
      if (cleared && prev.currentUser && prev.startedAt) {
        pendingSessionRef.current = makeSession(
          prev.currentUser.id,
          prev.difficulty!,
          prev.startedAt,
          'success'
        )
      }
      return {
        ...prev,
        board: computed,
        phase: cleared ? 'cleared' : 'playing',
        selectedCell: null,
      }
    })
  }, [])

  const abandonGame = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev
      if (prev.currentUser && prev.startedAt) {
        pendingSessionRef.current = makeSession(
          prev.currentUser.id,
          prev.difficulty!,
          prev.startedAt,
          'failure'
        )
      }
      return { ...prev, phase: 'difficulty', board: [], solution: [], selectedCell: null, startedAt: null }
    })
  }, [])

  const showStats = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'stats' }))
  }, [])

  const newGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'difficulty',
      board: [],
      solution: [],
      selectedCell: null,
      startedAt: null,
    }))
  }, [])

  return {
    state,
    selectUser,
    createUser,
    selectDifficulty,
    selectCell,
    inputNumber,
    eraseCell,
    useHint,
    abandonGame,
    showStats,
    newGame,
  }
}
