'use client'

import { useEffect } from 'react'
import { useSudokuGame } from '@/hooks/useSudokuGame'
import { UserSelectScreen } from './UserSelectScreen'
import { DifficultyScreen } from './DifficultyScreen'
import { SudokuBoard } from './SudokuBoard'
import { NumPad } from './NumPad'
import { GameControls } from './GameControls'
import { GameClearBanner } from './GameClearBanner'
import { StatsScreen } from './StatsScreen'

export function SudokuGame() {
  const {
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
  } = useSudokuGame()
  const { phase, board, solution, selectedCell, difficulty, currentUser, startedAt } = state

  useEffect(() => {
    if (phase !== 'playing') return
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

  if (phase === 'user-select') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <UserSelectScreen onSelectUser={selectUser} onCreateUser={createUser} />
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

  if (phase === 'stats' && currentUser) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <StatsScreen user={currentUser} lastDifficulty={difficulty} onNewGame={newGame} />
        </div>
      </main>
    )
  }

  const isCleared = phase === 'cleared'

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        {isCleared && <GameClearBanner onShowStats={showStats} />}
        <SudokuBoard
          board={board}
          selectedCell={selectedCell}
          difficulty={difficulty}
          onCellClick={selectCell}
          isCleared={isCleared}
          startedAt={startedAt}
          onAbandon={abandonGame}
        />
        <NumPad onInput={inputNumber} disabled={isCleared} />
        <GameControls onErase={eraseCell} onHint={useHint} disabled={isCleared} />
      </div>
    </main>
  )
}
