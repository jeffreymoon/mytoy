'use client'

import { cn } from '@/lib/utils'
import type { Cell } from '@/types/sudoku'

interface SudokuCellProps {
  cell: Cell
  row: number
  col: number
  isSelected: boolean
  isCleared: boolean
  onClick: (r: number, c: number) => void
}

export function SudokuCell({ cell, row, col, isSelected, isCleared, onClick }: SudokuCellProps) {
  const borderRight =
    col === 2 || col === 5
      ? 'border-r-2 border-r-foreground'
      : 'border-r border-r-border'
  const borderBottom =
    row === 2 || row === 5
      ? 'border-b-2 border-b-foreground'
      : 'border-b border-b-border'

  let colorClass = ''
  if (isSelected) {
    colorClass = 'bg-foreground text-background'
  } else if (cell.status === 'clue') {
    colorClass = 'bg-muted font-bold'
  } else if (cell.status === 'user-valid') {
    colorClass = 'text-[var(--cell-valid)]'
  } else if (cell.status === 'user-conflict') {
    colorClass = 'text-[var(--cell-conflict)]'
  } else if (cell.status === 'hint') {
    colorClass = 'text-[var(--cell-hint)] underline font-semibold'
  }

  function handleClick() {
    if (!isCleared && cell.status !== 'clue') {
      onClick(row, col)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center aspect-square select-none text-sm',
        cell.status !== 'clue' && !isCleared ? 'cursor-pointer' : 'cursor-default',
        borderRight,
        borderBottom,
        colorClass
      )}
    >
      {cell.value ?? ''}
    </div>
  )
}
