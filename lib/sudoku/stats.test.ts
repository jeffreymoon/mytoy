import { describe, it, expect } from 'vitest'
import { mean, stddev, normalPDF, histogramBins, formatDuration } from './stats'

describe('mean', () => {
  it('returns 0 for empty array', () => expect(mean([])).toBe(0))
  it('returns single value', () => expect(mean([5])).toBe(5))
  it('computes correctly', () => expect(mean([1, 2, 3, 4, 5])).toBeCloseTo(3))
})

describe('stddev', () => {
  it('returns 0 for empty array', () => expect(stddev([])).toBe(0))
  it('returns 0 for single value', () => expect(stddev([5])).toBe(0))
  it('computes sample stddev correctly', () => {
    // sample stddev of [2, 4, 4, 4, 5, 5, 7, 9]: mean=5, variance=32/7 ≈ 4.571, stddev ≈ 2.138
    expect(stddev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 2)
  })
})

describe('normalPDF', () => {
  it('returns 0 when sigma is 0', () => expect(normalPDF(1, 1, 0)).toBe(0))
  it('peaks at mean', () => {
    const atMean = normalPDF(0, 0, 1)
    const away = normalPDF(1, 0, 1)
    expect(atMean).toBeGreaterThan(away)
  })
  it('standard normal at 0 ≈ 0.3989', () => {
    expect(normalPDF(0, 0, 1)).toBeCloseTo(0.3989, 3)
  })
})

describe('histogramBins', () => {
  it('returns empty for empty input', () => expect(histogramBins([], 5)).toHaveLength(0))

  it('handles all-same values with padded range', () => {
    const bins = histogramBins([5, 5, 5], 3)
    expect(bins).toHaveLength(1)
    expect(bins[0].count).toBe(3)
    expect(bins[0].x0).toBeLessThan(5)
    expect(bins[0].x1).toBeGreaterThan(5)
  })

  it('distributes values into correct bins', () => {
    const bins = histogramBins([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)
    expect(bins).toHaveLength(5)
    const total = bins.reduce((sum, b) => sum + b.count, 0)
    expect(total).toBe(10)
  })

  it('last value falls in last bin', () => {
    const bins = histogramBins([0, 5, 10], 5)
    const total = bins.reduce((sum, b) => sum + b.count, 0)
    expect(total).toBe(3)
  })
})

describe('formatDuration', () => {
  it('formats 0 seconds', () => expect(formatDuration(0)).toBe('0:00'))
  it('formats 90 seconds', () => expect(formatDuration(90)).toBe('1:30'))
  it('formats 3661 seconds', () => expect(formatDuration(3661)).toBe('61:01'))
})
