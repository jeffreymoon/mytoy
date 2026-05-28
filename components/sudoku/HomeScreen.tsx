'use client'

import { Button } from '@/components/ui/button'

interface HomeScreenProps {
  onStart: () => void
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 min-h-[460px]">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-widest mb-2">스도쿠</h1>
        <p className="text-sm text-muted-foreground">숫자 퍼즐 게임</p>
      </div>
      <Button size="lg" variant="outline" onClick={onStart} className="px-10 text-base font-bold">
        게임 시작
      </Button>
    </div>
  )
}
