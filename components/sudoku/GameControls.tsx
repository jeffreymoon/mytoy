'use client'

import { Eraser, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GameControlsProps {
  onErase: () => void
  onHint: () => void
  disabled?: boolean
  className?: string
}

export function GameControls({ onErase, onHint, disabled, className }: GameControlsProps) {
  return (
    <div className={cn('flex justify-center gap-1', className)}>
      <Button variant="outline" size="sm" onClick={onErase} disabled={disabled}>
        <Eraser data-icon="inline-start" />
        지우기
        <kbd className="ml-1 text-[10px] opacity-40 font-mono">⌫</kbd>
      </Button>
      <Button variant="outline" size="sm" onClick={onHint} disabled={disabled}>
        <Lightbulb data-icon="inline-start" />
        힌트
        <kbd className="ml-1 text-[10px] opacity-40 font-mono">H</kbd>
      </Button>
    </div>
  )
}
