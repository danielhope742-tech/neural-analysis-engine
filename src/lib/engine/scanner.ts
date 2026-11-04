import { makeSignal, type ContractFamily, type Signal } from './analyzer'
import type { SymbolEngine } from './symbol-engine'

/** Every digit contract the scanner evaluates on each market. */
export interface ContractSpec {
  id: string
  family: ContractFamily
  label: string
  /** Digits that win the contract. */
  wins: (d: number) => boolean
  baseline: number
}

function spec(
  family: ContractFamily,
  label: string,
  wins: (d: number) => boolean,
): ContractSpec {
  let k = 0
  for (let d = 0; d < 10; d++) if (wins(d)) k++
  return { id: label.replace(' ', '_'), family, label, wins, baseline: k / 10 }
}

export const CONTRACTS: ContractSpec[] = [
  spec('even_odd', 'EVEN', (d) => d % 2 === 0),
  spec('even_odd', 'ODD', (d) => d % 2 === 1),
  ...Array.from({ length: 9 }, (_, b) =>
    spec('over_under', `OVER ${b}`, (d) => d > b),
  ),
  ...Array.from({ length: 9 }, (_, i) =>
    spec('over_under', `UNDER ${i + 1}`, (d) => d < i + 1),
  ),
  ...Array.from({ length: 10 }, (_, x) =>
    spec('matches_differs', `MATCHES ${x}`, (d) => d === x),
  ),
  ...Array.from({ length: 10 }, (_, x) =>
    spec('matches_differs', `DIFFERS ${x}`, (d) => d !== x),
  ),
]

export interface ScanHit {
  key: string
  symbol: string
  contract: ContractSpec
  /** Signal per scanned window, same order as `windows`. */
  perWindow: (Signal | null)[]
  /** Number of windows whose confidence clears the threshold. */
  agree: number
  meanConfidence: number
  maxConfidence: number
  /** Signal from the window with the highest confidence. */
  lead: Signal
  /** Recent hit-rate over the last 20 ticks, a quick "is it still live" check. */
  recent: number
}

export interface ScanOptions {
  windows: number[]
  threshold: number
  families: ContractFamily[]
  /** Require every window to clear the threshold. */
  requireAll: boolean
}

export interface ScanResult {
  at: number
  hits: ScanHit[]
  /** Total (market × contract × window) tests evaluated. */
  tests: number
  /** Tests expected to clear the threshold under pure randomness. */
  expectedFalse: number
  /** Tests that actually cleared the threshold. */
  cleared: number
  markets: number
}

/**
 * Evaluates every contract on every market over several windows.
 * Pure: reads engines, never mutates them.
 */
export function scanMarkets(
  engines: SymbolEngine[],
  opts: ScanOptions,
): ScanResult {
  const windows = [...opts.windows].sort((a, b) => a - b)
  const contracts = CONTRACTS.filter((c) => opts.families.includes(c.family))
  const hits: ScanHit[] = []
  let tests = 0
  let cleared = 0

  for (const engine of engines) {
    const all = engine.digits
    if (all.length < 30) continue
    const probs = engine.nextDigitProbs()
    // counts per window
    const windowCounts = windows.map((w) => {
      const digits = all.slice(-w)
      const c = new Array<number>(10).fill(0)
      for (const d of digits) c[d]++
      return { n: digits.length, c }
    })
    const tail = all.slice(-20)

    for (const ct of contracts) {
      let model = 0
      for (let d = 0; d < 10; d++) if (ct.wins(d)) model += probs[d]
      const perWindow: (Signal | null)[] = []
      let agree = 0
      let sum = 0
      let lead: Signal | null = null
      const seen = new Set<number>()
      for (const { n, c } of windowCounts) {
        // Windows larger than the history collapse to the same sample; skip duplicates.
        if (seen.has(n)) {
          perWindow.push(null)
          continue
        }
        seen.add(n)
        let k = 0
        for (let d = 0; d < 10; d++) if (ct.wins(d)) k += c[d]
        const s = makeSignal(ct.family, ct.label, k / n, model, ct.baseline, n)
        perWindow.push(s)
        tests++
        sum += s.confidence
        if (s.confidence >= opts.threshold) {
          agree++
          cleared++
        }
        if (!lead || s.confidence > lead.confidence) lead = s
      }
      const evaluated = perWindow.filter(Boolean).length
      if (!lead || agree === 0) continue
      if (opts.requireAll && agree < evaluated) continue
      let r = 0
      for (const d of tail) if (ct.wins(d)) r++
      hits.push({
        key: `${engine.symbol}:${ct.id}`,
        symbol: engine.symbol,
        contract: ct,
        perWindow,
        agree,
        meanConfidence: sum / evaluated,
        maxConfidence: lead.confidence,
        lead,
        recent: tail.length ? r / tail.length : 0,
      })
    }
  }

  hits.sort(
    (a, b) =>
      b.agree - a.agree ||
      b.meanConfidence - a.meanConfidence ||
      b.lead.edge - a.lead.edge,
  )

  return {
    at: Date.now(),
    hits,
    tests,
    expectedFalse: tests * (1 - opts.threshold / 100),
    cleared,
    markets: engines.length,
  }
}
