export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0
  const mu = mean(values)
  const variance = values.reduce((sum, v) => sum + (v - mu) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

export function normalPDF(x: number, mu: number, sigma: number): number {
  if (sigma === 0) return 0
  const z = (x - mu) / sigma
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z)
}

export interface HistogramBin {
  x0: number
  x1: number
  count: number
}

export function histogramBins(values: number[], numBins: number): HistogramBin[] {
  if (values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min === max) {
    return [{ x0: min - 0.5, x1: max + 0.5, count: values.length }]
  }

  const binWidth = (max - min) / numBins
  const bins: HistogramBin[] = Array.from({ length: numBins }, (_, i) => ({
    x0: min + i * binWidth,
    x1: min + (i + 1) * binWidth,
    count: 0,
  }))

  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / binWidth), numBins - 1)
    bins[idx].count++
  }

  return bins
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
