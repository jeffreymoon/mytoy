'use client'

import { useEffect } from 'react'
import { useSudokuGame } from '@/hooks/useSudokuGame'
import { HomeScreen } from './HomeScreen'
import { DifficultyScreen } from './DifficultyScreen'
import { SudokuBoard } from './SudokuBoard'
import { NumPad } from './NumPad'
import { GameControls } from './GameControls'
import { GameClearBanner } from './GameClearBanner'

export function SudokuGame() {
  const { state, startGame, selectDifficulty, selectCell, inputNumber, eraseCell, useHint, newGame } =
    useSudokuGame()
  const { phase, board, solution, selectedCell, difficulty } = state

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'cleared') return
    function handleKeyDown(e: KeyboardEvent) {
      const n = parseInt(e.key)
      if (n >= 1 && n <= 9) {
        inputNumber(n)
        return
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        eraseCell()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, inputNumber, eraseCell])

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

  const isCleared = phase === 'cleared'

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        {isCleared && <GameClearBanner onNewGame={newGame} />}
        <SudokuBoard
          board={board}
          solution={solution}
          selectedCell={selectedCell}
          difficulty={difficulty}
          onCellClick={selectCell}
          isCleared={isCleared}
        />
        <NumPad onInput={inputNumber} disabled={isCleared} />
        <GameControls onErase={eraseCell} onHint={useHint} disabled={isCleared} />
      </div>
    </main>
  )
}
