'use client'

import { cn } from '@/lib/utils'
import type { Cell } from '@/types/sudoku'

interface SudokuCellProps {
  cell: Cell
  row: number
  col: number
  isSelected: boolean
  isInLine: boolean
  isSameNumber: boolean
  isCleared: boolean
  onClick: (r: number, c: number) => void
}

export function SudokuCell({ cell, row, col, isSelected, isInLine, isSameNumber, isCleared, onClick }: SudokuCellProps) {
  const borderRight =
    col === 2 || col === 5
      ? 'border-r-2 border-r-foreground'
      : 'border-r border-r-border'
  const borderBottom =
    row === 2 || row === 5
      ? 'border-b-2 border-b-foreground'
      : 'border-b border-b-border'

  let bgClass = ''
  if (isSelected) {
    bgClass = 'bg-foreground'
  } else if (isSameNumber) {
    bgClass = 'bg-[var(--cell-highlight-same)]'
  } else if (isInLine) {
    bgClass = 'bg-[var(--cell-highlight-line)]'
  } else if (cell.status === 'clue') {
    bgClass = 'bg-muted'
  }

  let textClass = ''
  if (isSelected) {
    textClass = 'text-background'
  } else if (cell.status === 'clue') {
    textClass = 'font-bold'
  } else if (cell.status === 'user-valid') {
    textClass = 'text-[var(--cell-valid)]'
  } else if (cell.status === 'user-conflict') {
    textClass = 'text-[var(--cell-conflict)]'
  } else if (cell.status === 'hint') {
    textClass = 'text-[var(--cell-hint)] underline font-semibold'
  }

  const isInteractive = !isCleared && cell.status !== 'clue' && cell.status !== 'hint'

  function handleClick() {
    if (isInteractive) onClick(row, col)
  }

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={e => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) handleClick()
      }}
      className={cn(
        'flex items-center justify-center aspect-square select-none text-sm',
        isInteractive ? 'cursor-pointer' : 'cursor-default',
        borderRight,
        borderBottom,
        bgClass,
        textClass
      )}
    >
      {cell.value ?? ''}
    </div>
  )
}
