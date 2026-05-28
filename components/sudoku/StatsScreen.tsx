'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getUserSessions } from '@/services/storage'
import { mean } from '@/lib/sudoku/stats'
import { NormalDistChart } from './NormalDistChart'
import { formatDuration } from '@/lib/sudoku/stats'
import type { Difficulty, User } from '@/types/sudoku'

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard']
const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: 'Easy', normal: 'Normal', hard: 'Hard' }

interface StatsScreenProps {
  user: User
  lastDifficulty: Difficulty | null
  onNewGame: () => void
}

function DifficultyStats({ userId, difficulty }: { userId: string; difficulty: Difficulty }) {
  const sessions = getUserSessions(userId, difficulty)
  const attempts = sessions.length
  const successes = sessions.filter(s => s.outcome === 'success').length
  const durations = sessions.map(s => s.duration)
  const avgTime = durations.length > 0 ? mean(durations) : null
  const bestTime = durations.length > 0 ? Math.min(...durations) : null

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{attempts}</div>
          <div className="text-muted-foreground text-xs mt-0.5">시도 횟수</div>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{successes}</div>
          <div className="text-muted-foreground text-xs mt-0.5">성공 횟수</div>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{avgTime !== null ? formatDuration(avgTime) : '–'}</div>
          <div className="text-muted-foreground text-xs mt-0.5">평균 시간</div>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{bestTime !== null ? formatDuration(bestTime) : '–'}</div>
          <div className="text-muted-foreground text-xs mt-0.5">최고 기록</div>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2 text-center">게임 시간 분포</p>
        <NormalDistChart durations={durations} />
      </div>
    </div>
  )
}

export function StatsScreen({ user, lastDifficulty, onNewGame }: StatsScreenProps) {
  const [activeTab, setActiveTab] = useState<Difficulty>(lastDifficulty ?? 'easy')

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="text-muted-foreground text-sm">{user.name}</div>
        <h2 className="text-xl font-bold">게임 통계</h2>
      </div>

      <div className="flex gap-1">
        {DIFFICULTIES.map(d => (
          <Button
            key={d}
            variant={activeTab === d ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(d)}
            className="flex-1"
          >
            {DIFFICULTY_LABELS[d]}
          </Button>
        ))}
      </div>

      <DifficultyStats userId={user.id} difficulty={activeTab} />

      <Button onClick={onNewGame} className="font-bold">
        새 게임
      </Button>
    </div>
  )
}
