'use client'

import { histogramBins, formatDuration } from '@/lib/sudoku/stats'

interface BarChartProps {
  durations: number[]
}

export function BarChart({ durations }: BarChartProps) {
  const N = durations.length

  if (N === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
        기록 없음
      </div>
    )
  }

  const numBins = Math.min(N <= 3 ? N : Math.ceil(Math.log2(N) + 1), 10)
  const bins = histogramBins(durations, numBins)

  const W = 300, H = 130
  const ML = 28, MR = 8, MT = 18, MB = 24
  const PW = W - ML - MR
  const PH = H - MT - MB

  const maxCount = Math.max(...bins.map(b => b.count))
  const barW = PW / numBins
  const baseY = H - MB

  const toY = (count: number) => H - MB - (count / maxCount) * PH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="게임 시간 분포 막대 그래프">
      {/* X axis */}
      <line x1={ML} y1={baseY} x2={W - MR} y2={baseY} stroke="currentColor" strokeWidth="1" opacity="0.3" />

      {/* Bars */}
      {bins.map((bin, i) => (
        <rect
          key={i}
          x={ML + i * barW + 1}
          y={toY(bin.count)}
          width={Math.max(barW - 2, 1)}
          height={baseY - toY(bin.count)}
          fill="var(--cell-valid)"
          opacity="0.75"
          rx="1"
        />
      ))}

      {/* Count labels above bars */}
      {bins.map((bin, i) =>
        bin.count > 0 ? (
          <text
            key={`lbl-${i}`}
            x={ML + i * barW + barW / 2}
            y={toY(bin.count) - 3}
            textAnchor="middle"
            fontSize="8"
            className="fill-current"
            opacity="0.65"
          >
            {bin.count}
          </text>
        ) : null
      )}

      {/* X-axis labels */}
      <text x={ML} y={H - 6} textAnchor="start" fontSize="9" className="fill-current" opacity="0.55">
        {formatDuration(bins[0].x0)}
      </text>
      {bins.length > 1 && (
        <text x={W - MR} y={H - 6} textAnchor="end" fontSize="9" className="fill-current" opacity="0.55">
          {formatDuration(bins[bins.length - 1].x1)}
        </text>
      )}

      {/* N label */}
      <text x={W - MR} y={MT - 4} textAnchor="end" fontSize="9" className="fill-current" opacity="0.5">
        N={N}
      </text>
    </svg>
  )
}
