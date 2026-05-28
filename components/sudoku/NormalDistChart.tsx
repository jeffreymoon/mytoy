'use client'

import { mean, stddev, normalPDF, histogramBins, formatDuration } from '@/lib/sudoku/stats'

interface NormalDistChartProps {
  durations: number[]
}

export function NormalDistChart({ durations }: NormalDistChartProps) {
  const N = durations.length

  if (N === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
        기록 없음
      </div>
    )
  }

  const mu = mean(durations)
  const sigma = stddev(durations)

  const numBins = Math.min(N <= 3 ? N : Math.ceil(Math.log2(N) + 1), 10)
  const bins = histogramBins(durations, numBins)

  const W = 300, H = 150
  const ML = 30, MR = 10, MT = 12, MB = 28
  const PW = W - ML - MR
  const PH = H - MT - MB

  const xMin = bins[0].x0
  const xMax = bins[bins.length - 1].x1
  const xRange = xMax - xMin || 1
  const maxCount = Math.max(...bins.map(b => b.count))
  const yTop = maxCount * 1.15

  const toX = (x: number) => ML + ((x - xMin) / xRange) * PW
  const toY = (count: number) => H - MB - (count / yTop) * PH

  const barW = PW / numBins

  let bellPath = ''
  if (N >= 3 && sigma > 0) {
    const binWidth = xRange / numBins
    const pts: string[] = []
    for (let i = 0; i <= 120; i++) {
      const x = xMin + (xRange * i) / 120
      const density = normalPDF(x, mu, sigma) * N * binWidth
      pts.push(`${toX(x).toFixed(1)},${toY(density).toFixed(1)}`)
    }
    bellPath = 'M ' + pts.join(' L ')
  }

  const baseY = H - MB

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="시간 분포 차트">
        {/* Y axis */}
        <line x1={ML} y1={MT} x2={ML} y2={baseY} stroke="currentColor" strokeWidth="1" opacity="0.25" />
        {/* X axis */}
        <line x1={ML} y1={baseY} x2={W - MR} y2={baseY} stroke="currentColor" strokeWidth="1" opacity="0.25" />

        {/* Histogram bars */}
        {bins.map((bin, i) => (
          <rect
            key={i}
            x={ML + i * barW + 1}
            y={toY(bin.count)}
            width={Math.max(barW - 2, 1)}
            height={baseY - toY(bin.count)}
            fill="var(--cell-valid)"
            opacity="0.65"
          />
        ))}

        {/* Bell curve */}
        {bellPath && (
          <path d={bellPath} fill="none" stroke="var(--cell-conflict)" strokeWidth="1.5" opacity="0.85" />
        )}

        {/* Mean line */}
        {N >= 2 && (
          <line
            x1={toX(mu)}
            y1={MT}
            x2={toX(mu)}
            y2={baseY}
            stroke="var(--cell-hint)"
            strokeWidth="1"
            strokeDasharray="4,3"
            opacity="0.8"
          />
        )}

        {/* X axis labels */}
        <text x={toX(xMin)} y={H - 4} textAnchor="start" fontSize="9" className="fill-current" opacity="0.55">
          {formatDuration(xMin)}
        </text>
        {N >= 2 && Math.abs(toX(mu) - toX(xMin)) > 25 && Math.abs(toX(mu) - toX(xMax)) > 25 && (
          <text x={toX(mu)} y={H - 4} textAnchor="middle" fontSize="9" className="fill-current" opacity="0.85">
            {formatDuration(mu)}
          </text>
        )}
        {xMin !== xMax && (
          <text x={toX(xMax)} y={H - 4} textAnchor="end" fontSize="9" className="fill-current" opacity="0.55">
            {formatDuration(xMax)}
          </text>
        )}

        {/* N label */}
        <text x={W - MR} y={MT + 10} textAnchor="end" fontSize="9" className="fill-current" opacity="0.5">
          N={N}
        </text>
      </svg>

      <div className="flex gap-4 text-xs text-muted-foreground justify-center mt-1">
        <span>평균: {formatDuration(mu)}</span>
        {sigma > 0 && <span>σ: {formatDuration(sigma)}</span>}
      </div>
    </div>
  )
}
