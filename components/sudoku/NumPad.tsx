'use client'

import { Button } from '@/components/ui/button'

interface NumPadProps {
  onInput: (n: number) => void
  disabled?: boolean
}

export function NumPad({ onInput, disabled }: NumPadProps) {
  return (
    <div className="grid grid-cols-9 gap-1 w-full">
      {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
        <Button
          key={n}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onInput(n)}
          className="aspect-square p-0 text-sm font-medium"
        >
          {n}
        </Button>
      ))}
    </div>
  )
}
