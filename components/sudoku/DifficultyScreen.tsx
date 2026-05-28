'use client'

import type { Difficulty } from '@/types/sudoku'

interface DifficultyOption {
  value: Difficulty
  label: string
  clues: string
  pct: string
}

const OPTIONS: DifficultyOption[] = [
  { value: 'easy', label: 'Easy', clues: '≈ 40칸 단서', pct: '전체의 약 50%' },
  { value: 'normal', label: 'Normal', clues: '≈ 32칸 단서', pct: '전체의 약 40%' },
  { value: 'hard', label: 'Hard', clues: '≈ 24칸 단서', pct: '전체의 약 30%' },
]

interface DifficultyScreenProps {
  onSelect: (d: Difficulty) => void
}

export function DifficultyScreen({ onSelect }: DifficultyScreenProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-muted-foreground border-b border-border pb-2">
        난이도 선택
      </h2>
      <div className="flex flex-col gap-3">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className="flex-1 p-4 border-2 border-border rounded-lg cursor-pointer text-left hover:bg-accent transition-colors"
          >
            <div className="font-bold text-xl mb-1">{opt.label}</div>
            <div className="text-sm mb-1">{opt.clues}</div>
            <div className="text-xs text-muted-foreground">{opt.pct}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
