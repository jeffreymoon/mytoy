'use client'

import { useState, useEffect } from 'react'
import { formatDuration } from '@/lib/sudoku/stats'

interface GameTimerProps {
  startedAt: number | null
  stopped?: boolean
}

export function GameTimer({ startedAt, stopped = false }: GameTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) return
    setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    if (stopped) return
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt, stopped])

  return (
    <span className="text-sm tabular-nums text-muted-foreground">
      {formatDuration(elapsed)}
    </span>
  )
}
