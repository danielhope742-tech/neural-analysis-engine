import { DigitNet, MIN_CONTEXT } from './model'

export const MAX_TICKS = 5000
const OUTCOME_WINDOW = 500

export type TrackedContract = 'matches' | 'differs' | 'even_odd' | 'over_under'

/** Expected hit-rate of each tracked prediction if digits were uniformly random. */
export const BASELINES: Record<TrackedContract, number> = {
  matches: 0.1,
  differs: 0.9,
  even_odd: 0.5,
  over_under: 0.5,
}

/** Ring buffer of 0/1 outcomes. */
class Outcomes {
  private buf: Uint8Array = new Uint8Array(OUTCOME_WINDOW)
  private idx = 0
  size = 0
  hits = 0
  push(hit: boolean) {
    if (this.size === OUTCOME_WINDOW) this.hits -= this.buf[this.idx]
    else this.size++
    this.buf[this.idx] = hit ? 1 : 0
    this.hits += hit ? 1 : 0
    this.idx = (this.idx + 1) % OUTCOME_WINDOW
  }
}

export function lastDigit(quote: number, pip: number): number {
  const s = quote.toFixed(pip)
  return Number(s[s.length - 1])
}

/**
 * Holds the tick history, digit sequence, online model, and walk-forward
 * accuracy tracking for one market. Lives outside React and is mutated in place.
 */
export class SymbolEngine {
  readonly symbol: string
  pip: number
  prices: number[] = []
  epochs: number[] = []
  digits: number[] = []
  net = new DigitNet()
  outcomes: Record<TrackedContract, Outcomes> = {
    matches: new Outcomes(),
    differs: new Outcomes(),
    even_odd: new Outcomes(),
    over_under: new Outcomes(),
  }
  lastTickAt = 0
  tickCount = 0
  version = 0

  constructor(symbol: string, pip: number) {
    this.symbol = symbol
    this.pip = pip
  }

  /** Load historical ticks, training the model walk-forward so accuracy stats start populated. */
  seed(prices: number[], epochs: number[], pip?: number) {
    if (pip !== undefined) this.pip = pip
    this.prices = []
    this.epochs = []
    this.digits = []
    this.net = new DigitNet()
    for (const k of Object.keys(this.outcomes) as TrackedContract[])
      this.outcomes[k] = new Outcomes()
    for (let i = 0; i < prices.length; i++) this.ingest(prices[i], epochs[i])
    this.version++
  }

  push(quote: number, epoch: number, pip?: number) {
    if (pip !== undefined) this.pip = pip
    // Guard against a duplicate tick (e.g. history overlap after reconnect).
    if (this.epochs.length && epoch <= this.epochs[this.epochs.length - 1])
      return
    this.ingest(quote, epoch)
    this.lastTickAt = Date.now()
    this.tickCount++
    this.version++
  }

  private ingest(quote: number, epoch: number) {
    const digit = lastDigit(quote, this.pip)
    const ctx = this.digits.length > 16 ? this.digits.slice(-16) : this.digits
    if (ctx.length >= MIN_CONTEXT) {
      // Predict-then-learn: the prediction is scored before the model sees the answer.
      const p = this.net.learn(ctx, digit)
      let top = 0
      let bottom = 0
      for (let d = 1; d < 10; d++) {
        if (p[d] > p[top]) top = d
        if (p[d] < p[bottom]) bottom = d
      }
      const pEven = p[0] + p[2] + p[4] + p[6] + p[8]
      const pOver4 = p[5] + p[6] + p[7] + p[8] + p[9]
      this.outcomes.matches.push(digit === top)
      this.outcomes.differs.push(digit !== bottom)
      this.outcomes.even_odd.push((digit % 2 === 0) === pEven >= 0.5)
      this.outcomes.over_under.push(digit > 4 === pOver4 >= 0.5)
    }
    this.prices.push(quote)
    this.epochs.push(epoch)
    this.digits.push(digit)
    if (this.prices.length > MAX_TICKS) {
      this.prices.shift()
      this.epochs.shift()
      this.digits.shift()
    }
  }

  nextDigitProbs(): number[] {
    return this.net.predict(this.digits.slice(-16))
  }
}
