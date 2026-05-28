export type Difficulty = 'easy' | 'normal' | 'hard'
export type CellStatus = 'clue' | 'empty' | 'user-valid' | 'user-conflict' | 'hint'
export type GamePhase = 'home' | 'difficulty' | 'playing' | 'cleared'

export interface Cell {
  value: number | null
  status: CellStatus
}

export interface GameState {
  phase: GamePhase
  difficulty: Difficulty | null
  board: Cell[][]
  solution: number[][]
  selectedCell: [number, number] | null
}
