'use client'

import { Eraser, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GameControlsProps {
  onErase: () => void
  onHint: () => void
  disabled?: boolean
}

export function GameControls({ onErase, onHint, disabled }: GameControlsProps) {
  return (
    <div className="flex justify-center gap-3">
      <Button variant="outline" size="sm" onClick={onErase} disabled={disabled}>
        <Eraser data-icon="inline-start" />
        지우기
      </Button>
      <Button variant="outline" size="sm" onClick={onHint} disabled={disabled}>
        <Lightbulb data-icon="inline-start" />
        힌트
      </Button>
    </div>
  )
}
