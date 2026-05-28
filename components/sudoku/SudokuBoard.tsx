'use client'

import { cn } from '@/lib/utils'
import type { Cell, Difficulty } from '@/types/sudoku'
import { SudokuCell } from './SudokuCell'

interface SudokuBoardProps {
  board: Cell[][]
  solution: number[][]
  selectedCell: [number, number] | null
  difficulty: Difficulty | null
  onCellClick: (r: number, c: number) => void
  isCleared?: boolean
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
}

export function SudokuBoard({
  board,
  solution: _solution,
  selectedCell,
  difficulty,
  onCellClick,
  isCleared = false,
}: SudokuBoardProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* App bar */}
      <div className="flex items-center gap-2 w-full max-w-xs justify-start">
        <span className="font-bold text-base">스도쿠</span>
        {difficulty && (
          <span className="text-xs px-2 py-0.5 border border-border rounded text-muted-foreground">
            {DIFFICULTY_LABELS[difficulty]}
          </span>
        )}
      </div>

      {/* Grid */}
      <div
        className={cn(
          'grid grid-cols-9 border-t-2 border-l-2 border-foreground w-full max-w-xs',
          isCleared && 'opacity-55'
        )}
        style={{ aspectRatio: '1' }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isSelected =
              !isCleared &&
              selectedCell !== null &&
              selectedCell[0] === r &&
              selectedCell[1] === c
            return (
              <SudokuCell
                key={`${r}-${c}`}
                cell={cell}
                row={r}
                col={c}
                isSelected={isSelected}
                isCleared={isCleared}
                onClick={onCellClick}
              />
            )
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground justify-center">
        <span>
          <strong className="bg-muted px-1">단서</strong> 굵음+회색
        </span>
        <span className="text-[var(--cell-valid)]">
          <strong>유효입력</strong> 파랑
        </span>
        <span className="text-[var(--cell-conflict)]">
          <strong>충돌입력</strong> 빨강
        </span>
        <span className="text-[var(--cell-hint)] underline">
          <strong>힌트</strong> 파랑+밑줄
        </span>
      </div>
    </div>
  )
}
