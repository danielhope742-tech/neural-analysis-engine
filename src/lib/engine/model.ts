/**
 * Online softmax-regression "neural digit" model.
 *
 * A single-layer network that learns P(next digit | recent digit context)
 * with one SGD step per tick. Features: one-hot of the last three digits,
 * parity of the last five digits, and a bias term.
 */

const LAGS = 3
const PARITY_LAGS = 5
export const FEATURE_DIM = LAGS * 10 + PARITY_LAGS + 1
export const MIN_CONTEXT = Math.max(LAGS, PARITY_LAGS)

export class DigitNet {
  private w: Float64Array
  private lr: number
  private l2: number
  steps = 0

  constructor(lr = 0.03, l2 = 1e-4) {
    this.w = new Float64Array(10 * FEATURE_DIM)
    this.lr = lr
    this.l2 = l2
  }

  /** Active feature indices + values for a context (most recent digit last). */
  private features(ctx: number[]): Array<[number, number]> {
    const n = ctx.length
    const f: Array<[number, number]> = []
    for (let lag = 0; lag < LAGS; lag++)
      f.push([lag * 10 + ctx[n - 1 - lag], 1])
    for (let lag = 0; lag < PARITY_LAGS; lag++)
      f.push([LAGS * 10 + lag, ctx[n - 1 - lag] % 2 === 0 ? 1 : -1])
    f.push([FEATURE_DIM - 1, 1])
    return f
  }

  predict(ctx: number[]): number[] {
    if (ctx.length < MIN_CONTEXT) return new Array(10).fill(0.1)
    const f = this.features(ctx)
    const logits = new Array<number>(10)
    let max = -Infinity
    for (let k = 0; k < 10; k++) {
      let s = 0
      for (const [i, v] of f) s += this.w[k * FEATURE_DIM + i] * v
      logits[k] = s
      if (s > max) max = s
    }
    let sum = 0
    for (let k = 0; k < 10; k++) {
      logits[k] = Math.exp(logits[k] - max)
      sum += logits[k]
    }
    return logits.map((v) => v / sum)
  }

  /** One SGD step on cross-entropy loss. Returns the pre-update prediction. */
  learn(ctx: number[], target: number): number[] {
    const probs = this.predict(ctx)
    if (ctx.length < MIN_CONTEXT) return probs
    const f = this.features(ctx)
    for (let k = 0; k < 10; k++) {
      const grad = probs[k] - (k === target ? 1 : 0)
      for (const [i, v] of f) {
        const idx = k * FEATURE_DIM + i
        this.w[idx] -= this.lr * (grad * v + this.l2 * this.w[idx])
      }
    }
    this.steps++
    return probs
  }
}
