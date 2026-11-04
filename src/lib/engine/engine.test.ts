import { describe, expect, it } from 'vitest'
import { chiSquarePValue, normalCdf, wilson } from './stats'
import { lastDigit, SymbolEngine } from './symbol-engine'
import { analyze } from './analyzer'

describe('stats', () => {
  it('computes normal CDF and chi-square p-values', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 5)
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3)
    expect(chiSquarePValue(16.919, 9)).toBeCloseTo(0.05, 2)
  })
  it('builds a Wilson interval around the observed rate', () => {
    const [lo, hi] = wilson(50, 100)
    expect(lo).toBeLessThan(0.5)
    expect(hi).toBeGreaterThan(0.5)
  })
})

describe('SymbolEngine', () => {
  it('extracts the last digit respecting pip size', () => {
    expect(lastDigit(1234.5, 2)).toBe(0)
    expect(lastDigit(123.457, 3)).toBe(7)
  })
  it('detects a heavily skewed digit stream', () => {
    const e = new SymbolEngine('R_100', 2)
    const prices = Array.from(
      { length: 600 },
      (_, i) => 1000 + (i % 3 === 0 ? 0.07 : (i % 10) / 100),
    )
    e.seed(
      prices,
      prices.map((_, i) => i),
    )
    const a = analyze(e, 600)
    expect(a.n).toBe(600)
    expect(a.skewScore).toBeGreaterThan(98)
    expect(a.signals).toHaveLength(3)
    expect(a.accuracy.every((x) => x.n > 0)).toBe(true)
  })
})

describe('scanMarkets', () => {
  it('evaluates 40 contracts per window and finds a planted skew', async () => {
    const { scanMarkets, CONTRACTS } = await import('./scanner')
    expect(CONTRACTS).toHaveLength(40)
    const e = new SymbolEngine('R_100', 2)
    // digit 7 on every third tick → MATCHES 7 heavily over-represented
    const prices = Array.from(
      { length: 900 },
      (_, i) => 1000 + (i % 3 === 0 ? 0.07 : (i % 10) / 100),
    )
    e.seed(
      prices,
      prices.map((_, i) => i),
    )
    const r = scanMarkets([e], {
      windows: [100, 500],
      threshold: 98,
      families: ['matches_differs', 'even_odd', 'over_under'],
      requireAll: false,
    })
    expect(r.tests).toBe(80)
    expect(r.hits[0].contract.label).toBe('MATCHES 7')
    expect(r.hits[0].agree).toBe(2)
  })
})
