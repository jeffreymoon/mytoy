'use client'

import { CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GameClearBannerProps {
  onShowStats: () => void
}

export function GameClearBanner({ onShowStats }: GameClearBannerProps) {
  return (
    <div className="text-center py-4 mb-2 rounded-lg border-2 border-foreground bg-muted">
      <div className="flex justify-center mb-2">
        <CircleCheck className="size-7" />
      </div>
      <div className="text-xl font-bold mb-3">게임 클리어!</div>
      <Button variant="outline" onClick={onShowStats} className="font-bold border-2">
        결과 보기
      </Button>
    </div>
  )
}
