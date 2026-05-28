export type Difficulty = 'easy' | 'normal' | 'hard'
export type CellStatus = 'clue' | 'empty' | 'user-valid' | 'user-conflict' | 'hint'
export type GamePhase = 'user-select' | 'difficulty' | 'playing' | 'cleared' | 'stats'

export interface Cell {
  value: number | null
  status: CellStatus
}

export interface User {
  id: string
  name: string
}

export interface GameSession {
  id: string
  userId: string
  difficulty: Difficulty
  startTime: number
  endTime: number
  duration: number
  outcome: 'success' | 'failure'
}

export interface GameState {
  phase: GamePhase
  difficulty: Difficulty | null
  board: Cell[][]
  solution: number[][]
  selectedCell: [number, number] | null
  currentUser: User | null
  startedAt: number | null
}
