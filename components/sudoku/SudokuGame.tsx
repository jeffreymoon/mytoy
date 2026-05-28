'use client'

import { useSudokuGame } from '@/hooks/useSudokuGame'
import { HomeScreen } from './HomeScreen'
import { DifficultyScreen } from './DifficultyScreen'
import { SudokuBoard } from './SudokuBoard'

export function SudokuGame() {
  const { state, startGame, selectDifficulty, selectCell } = useSudokuGame()
  const { phase, board, solution, selectedCell, difficulty } = state

  if (phase === 'home') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <HomeScreen onStart={startGame} />
        </div>
      </main>
    )
  }

  if (phase === 'difficulty') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <DifficultyScreen onSelect={selectDifficulty} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <SudokuBoard
          board={board}
          solution={solution}
          selectedCell={selectedCell}
          difficulty={difficulty}
          onCellClick={selectCell}
        />
      </div>
    </main>
  )
}
