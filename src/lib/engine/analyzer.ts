import {
  chiSquarePValue,
  clamp,
  normalCdf,
  normalisedEntropy,
  proportionZ,
  wilson,
} from './stats'
import {
  BASELINES,
  type SymbolEngine,
  type TrackedContract,
} from './symbol-engine'

export type ContractFamily = 'matches_differs' | 'even_odd' | 'over_under'

export interface Signal {
  family: ContractFamily
  /** e.g. "EVEN", "OVER 3", "MATCHES 7" */
  label: string
  /** Estimated probability of the contract winning, blending frequency and model output. */
  probability: number
  /** Probability expected if digits were perfectly uniform. */
  baseline: number
  /** probability − baseline, in percentage points. */
  edge: number
  /** Statistical confidence (0–100) that the observed skew is not random noise. */
  confidence: number
  z: number
  band: ConfidenceBand
}

export type ConfidenceBand = 'noise' | 'weak' | 'strong' | 'extreme'

export function bandOf(confidence: number): ConfidenceBand {
  if (confidence >= 98) return 'extreme'
  if (confidence >= 87) return 'strong'
  if (confidence >= 70) return 'weak'
  return 'noise'
}

export interface AccuracyStat {
  contract: TrackedContract
  hits: number
  n: number
  rate: number
  baseline: number
  advantage: number
  ci: [number, number]
}

export interface Analysis {
  symbol: string
  n: number
  counts: number[]
  freq: number[]
  digitZ: number[]
  chi2: number
  chi2P: number
  /** 0–100: how far the distribution departs from uniform (1 − p of chi-square). */
  skewScore: number
  entropy: number
  evenRate: number
  overRates: number[]
  streak: { kind: 'even' | 'odd'; length: number }
  digitStreak: { digit: number; length: number }
  modelProbs: number[]
  transitions: number[][]
  signals: Signal[]
  best: Signal | null
  accuracy: AccuracyStat[]
  volatility: number
  lastDigit: number | null
  lastQuote: number | null
  change: number
}

const blend = (freq: number, model: number, n: number) => {
  // Trust the model more as more ticks are processed; still frequency-led.
  const w = clamp(n / 4000, 0.1, 0.35)
  return freq * (1 - w) + model * w
}

export function makeSignal(
  family: ContractFamily,
  label: string,
  observed: number,
  model: number,
  baseline: number,
  n: number,
): Signal {
  const z = proportionZ(observed, baseline, n)
  const probability = blend(observed, model, n)
  const confidence = clamp(normalCdf(z) * 100, 0, 99.9)
  return {
    family,
    label,
    probability,
    baseline,
    edge: (probability - baseline) * 100,
    confidence,
    z,
    band: bandOf(confidence),
  }
}

export function analyze(engine: SymbolEngine, windowSize: number): Analysis {
  const digits = engine.digits.slice(-windowSize)
  const n = digits.length
  const counts = new Array<number>(10).fill(0)
  for (const d of digits) counts[d]++
  const freq = counts.map((c) => (n ? c / n : 0.1))
  const digitZ = freq.map((f) => proportionZ(f, 0.1, n))
  const exp = n / 10
  const chi2 = n ? counts.reduce((s, c) => s + (c - exp) ** 2 / exp, 0) : 0
  const chi2P = n ? chiSquarePValue(chi2, 9) : 1
  const evenRate = n
    ? (counts[0] + counts[2] + counts[4] + counts[6] + counts[8]) / n
    : 0.5
  const overRates: number[] = []
  for (let b = 0; b < 10; b++) {
    let s = 0
    for (let d = b + 1; d < 10; d++) s += freq[d]
    overRates.push(s)
  }

  // streaks
  let streakLen = 0
  const lastD = n ? digits[n - 1] : null
  if (lastD !== null) {
    const parity = lastD % 2
    for (let i = n - 1; i >= 0 && digits[i] % 2 === parity; i--) streakLen++
  }
  let dStreak = 0
  if (lastD !== null)
    for (let i = n - 1; i >= 0 && digits[i] === lastD; i--) dStreak++

  // Markov transitions
  const transitions = Array.from({ length: 10 }, () =>
    new Array<number>(10).fill(0),
  )
  for (let i = 1; i < n; i++) transitions[digits[i - 1]][digits[i]]++
  const transitionsNorm = transitions.map((row) => {
    const s = row.reduce((a, b) => a + b, 0)
    return row.map((v) => (s ? v / s : 0.1))
  })

  const modelProbs = engine.nextDigitProbs()
  const mEven =
    modelProbs[0] +
    modelProbs[2] +
    modelProbs[4] +
    modelProbs[6] +
    modelProbs[8]

  const signals: Signal[] = []
  // Even / Odd
  signals.push(
    evenRate >= 0.5
      ? makeSignal('even_odd', 'EVEN', evenRate, mEven, 0.5, n)
      : makeSignal('even_odd', 'ODD', 1 - evenRate, 1 - mEven, 0.5, n),
  )
  // Over / Under: scan all barriers, keep the most significant one.
  let bestOU: Signal | null = null
  for (let b = 0; b <= 8; b++) {
    const exp = (9 - b) / 10
    let mOver = 0
    for (let d = b + 1; d < 10; d++) mOver += modelProbs[d]
    const s = makeSignal('over_under', `OVER ${b}`, overRates[b], mOver, exp, n)
    if (!bestOU || s.z > bestOU.z) bestOU = s
  }
  for (let b = 1; b <= 9; b++) {
    const exp = b / 10
    const obs = 1 - overRates[b - 1]
    let mUnder = 0
    for (let d = 0; d < b; d++) mUnder += modelProbs[d]
    const s = makeSignal('over_under', `UNDER ${b}`, obs, mUnder, exp, n)
    if (!bestOU || s.z > bestOU.z) bestOU = s
  }
  if (bestOU) signals.push(bestOU)
  // Matches / Differs
  let hot = 0
  let cold = 0
  for (let d = 1; d < 10; d++) {
    if (digitZ[d] > digitZ[hot]) hot = d
    if (digitZ[d] < digitZ[cold]) cold = d
  }
  const matches = makeSignal(
    'matches_differs',
    `MATCHES ${hot}`,
    freq[hot],
    modelProbs[hot],
    0.1,
    n,
  )
  const differs = makeSignal(
    'matches_differs',
    `DIFFERS ${cold}`,
    1 - freq[cold],
    1 - modelProbs[cold],
    0.9,
    n,
  )
  signals.push(matches.z >= differs.z ? matches : differs)

  const best = signals.reduce<Signal | null>(
    (a, s) => (!a || s.confidence > a.confidence ? s : a),
    null,
  )

  const accuracy: AccuracyStat[] = (
    Object.keys(BASELINES) as TrackedContract[]
  ).map((k) => {
    const o = engine.outcomes[k]
    const rate = o.size ? o.hits / o.size : 0
    return {
      contract: k,
      hits: o.hits,
      n: o.size,
      rate,
      baseline: BASELINES[k],
      advantage: (rate - BASELINES[k]) * 100,
      ci: wilson(o.hits, o.size),
    }
  })

  // realised volatility (annualisation-free): stdev of log returns over window, in bps
  const prices = engine.prices.slice(-Math.min(windowSize, 300))
  let vol = 0
  if (prices.length > 2) {
    const r: number[] = []
    for (let i = 1; i < prices.length; i++)
      r.push(Math.log(prices[i] / prices[i - 1]))
    const m = r.reduce((a, b) => a + b, 0) / r.length
    vol = Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / r.length) * 10000
  }
  const lp = engine.prices
  const change = lp.length > 1 ? lp[lp.length - 1] - lp[lp.length - 2] : 0

  return {
    symbol: engine.symbol,
    n,
    counts,
    freq,
    digitZ,
    chi2,
    chi2P,
    skewScore: clamp((1 - chi2P) * 100, 0, 99.9),
    entropy: normalisedEntropy(freq),
    evenRate,
    overRates,
    streak: {
      kind: lastD !== null && lastD % 2 === 0 ? 'even' : 'odd',
      length: streakLen,
    },
    digitStreak: { digit: lastD ?? 0, length: dStreak },
    modelProbs,
    transitions: transitionsNorm,
    signals,
    best,
    accuracy,
    volatility: vol,
    lastDigit: lastD,
    lastQuote: lp.length ? lp[lp.length - 1] : null,
    change,
  }
}

/** Rolling digit frequency per segment, for the historical heatmap. */
export function rollingHeatmap(
  digits: number[],
  segments: number,
  segSize: number,
): number[][] {
  const out: number[][] = []
  const start = Math.max(0, digits.length - segments * segSize)
  for (let s = start; s + segSize <= digits.length; s += segSize) {
    const c = new Array<number>(10).fill(0)
    for (let i = s; i < s + segSize; i++) c[digits[i]]++
    out.push(c.map((v) => v / segSize))
  }
  return out
}

/** Rolling even-rate series for the trend chart. */
export function rollingRate(
  digits: number[],
  win: number,
  pred: (d: number) => boolean,
  points = 120,
): number[] {
  const out: number[] = []
  if (digits.length < win) return out
  const step = Math.max(1, Math.floor((digits.length - win) / points))
  for (let end = win; end <= digits.length; end += step) {
    let h = 0
    for (let i = end - win; i < end; i++) if (pred(digits[i])) h++
    out.push(h / win)
  }
  return out
}
