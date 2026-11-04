import { FEED_ENDPOINTS, HISTORY_COUNT, MARKET_BY_SYMBOL } from './markets'
import { SymbolEngine } from '../engine/symbol-engine'

export type FeedStatus = 'connecting' | 'live' | 'reconnecting' | 'simulated'

interface TickMsg {
  msg_type: 'tick'
  tick?: { epoch?: number; quote?: number; symbol?: string; pip_size: number }
}
interface HistoryMsg {
  msg_type: 'history'
  echo_req: { ticks_history?: string }
  history?: { prices?: number[]; times?: number[] }
  pip_size?: number
}
interface AnyMsg {
  msg_type?: string
  req_id?: number
  echo_req?: Record<string, unknown>
  error?: { code?: string; message?: string }
}

export interface FeedSnapshot {
  status: FeedStatus
  endpoint: string | null
  rttMs: number | null
  feedLagMs: number | null
  ticksPerMin: number
  error: string | null
}

/**
 * Multiplexes tick subscriptions for many markets over one WebSocket.
 * Seeds each market with recent tick history, then streams live ticks into
 * its SymbolEngine. Falls back through FEED_ENDPOINTS, and finally to a
 * clearly-labelled simulated feed if no endpoint is reachable.
 */
export class MarketFeed {
  engines = new Map<string, SymbolEngine>()
  snapshot: FeedSnapshot = {
    status: 'connecting',
    endpoint: null,
    rttMs: null,
    feedLagMs: null,
    ticksPerMin: 0,
    error: null,
  }
  private ws: WebSocket | null = null
  private endpointIdx = 0
  private failures = 0
  private reqId = 1
  private pingSent = new Map<number, number>()
  private timers: number[] = []
  private simTimer: number | null = null
  private recentTicks: number[] = []
  private closed = false

  constructor(symbols: string[]) {
    for (const s of symbols)
      this.engines.set(s, new SymbolEngine(s, MARKET_BY_SYMBOL[s]?.pip ?? 2))
  }

  start() {
    this.connect()
    this.timers.push(window.setInterval(() => this.ping(), 5000))
  }

  stop() {
    this.closed = true
    this.timers.forEach((t) => clearInterval(t))
    if (this.simTimer) clearInterval(this.simTimer)
    this.ws?.close()
  }

  private send(payload: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const req_id = this.reqId++
      this.ws.send(JSON.stringify({ ...payload, req_id }))
      return req_id
    }
    return null
  }

  private connect() {
    if (this.closed) return
    const url = FEED_ENDPOINTS[this.endpointIdx]
    let opened = false
    let ws: WebSocket
    try {
      ws = new WebSocket(url)
    } catch {
      this.onFail()
      return
    }
    this.ws = ws
    ws.onopen = () => {
      opened = true
      this.failures = 0
      if (this.simTimer) this.stopSimulation()
      this.snapshot = {
        ...this.snapshot,
        status: 'live',
        endpoint: url,
        error: null,
      }
      for (const symbol of this.engines.keys()) this.subscribeHistory(symbol)
      this.ping()
    }
    ws.onmessage = (ev) => {
      try {
        this.handle(JSON.parse(ev.data as string) as AnyMsg)
      } catch {
        /* ignore malformed frames */
      }
    }
    ws.onclose = () => {
      if (this.closed || this.ws !== ws) return
      if (!opened) this.endpointIdx++
      this.onFail()
    }
  }

  private onFail() {
    this.failures++
    if (this.endpointIdx >= FEED_ENDPOINTS.length) {
      this.endpointIdx = 0
      if (
        this.failures >= FEED_ENDPOINTS.length &&
        this.snapshot.status !== 'simulated'
      ) {
        this.startSimulation()
      }
    }
    if (this.snapshot.status !== 'simulated')
      this.snapshot = { ...this.snapshot, status: 'reconnecting' }
    const delay = Math.min(15000, 1000 * 2 ** Math.min(this.failures, 4))
    window.setTimeout(() => this.connect(), delay)
  }

  private subscribeHistory(symbol: string) {
    this.send({
      ticks_history: symbol,
      adjust_start_time: 1,
      count: HISTORY_COUNT,
      end: 'latest',
      style: 'ticks',
      subscribe: 1,
    })
  }

  private ping() {
    const id = this.send({ ping: 1 })
    if (id !== null) this.pingSent.set(id, performance.now())
  }

  private handle(msg: AnyMsg) {
    if (msg.error) {
      const sym = msg.echo_req?.ticks_history as string | undefined
      // If history isn't supported on this endpoint, fall back to a plain tick subscription.
      if (sym && msg.error.code !== 'AlreadySubscribed')
        this.send({ ticks: sym, subscribe: 1 })
      else if (!sym)
        this.snapshot = { ...this.snapshot, error: msg.error.message ?? null }
      return
    }
    if (msg.msg_type === 'ping' && msg.req_id !== undefined) {
      const sent = this.pingSent.get(msg.req_id)
      if (sent !== undefined) {
        this.snapshot = {
          ...this.snapshot,
          rttMs: Math.round(performance.now() - sent),
        }
        this.pingSent.delete(msg.req_id)
      }
      return
    }
    if (msg.msg_type === 'history') {
      const h = msg as unknown as HistoryMsg
      const sym = h.echo_req.ticks_history
      const engine = sym ? this.engines.get(sym) : undefined
      if (!engine || !h.history?.prices || !h.history.times) return
      const fromSim = this.snapshot.status === 'simulated'
      if (fromSim) this.stopSimulation()
      engine.seed(h.history.prices, h.history.times, h.pip_size)
      return
    }
    if (msg.msg_type === 'tick') {
      const t = (msg as unknown as TickMsg).tick
      if (!t?.symbol || t.quote === undefined || t.epoch === undefined) return
      const engine = this.engines.get(t.symbol)
      if (!engine) return
      if (this.snapshot.status === 'simulated') this.stopSimulation()
      engine.push(t.quote, t.epoch, t.pip_size)
      this.recordTick(t.epoch)
    }
  }

  private recordTick(epoch: number) {
    const now = Date.now()
    this.recentTicks.push(now)
    while (this.recentTicks.length && now - this.recentTicks[0] > 60000)
      this.recentTicks.shift()
    this.snapshot = {
      ...this.snapshot,
      ticksPerMin: this.recentTicks.length,
      feedLagMs: Math.max(0, now - epoch * 1000),
    }
  }

  // ---------------- simulation fallback ----------------

  private startSimulation() {
    this.snapshot = {
      ...this.snapshot,
      status: 'simulated',
      endpoint: 'local simulation',
      rttMs: 0,
    }
    const now = Math.floor(Date.now() / 1000)
    for (const engine of this.engines.values()) {
      const m = MARKET_BY_SYMBOL[engine.symbol]
      const prices: number[] = []
      const times: number[] = []
      let p = 1000 + Math.random() * 9000
      for (let i = HISTORY_COUNT; i > 0; i--) {
        p *= 1 + gauss() * 0.0004
        prices.push(Number(p.toFixed(m.pip)))
        times.push(now - i * m.interval)
      }
      engine.seed(prices, times, m.pip)
    }
    let tick = 0
    this.simTimer = window.setInterval(() => {
      tick++
      const epoch = Math.floor(Date.now() / 1000)
      for (const engine of this.engines.values()) {
        const m = MARKET_BY_SYMBOL[engine.symbol]
        if (tick % m.interval !== 0) continue
        const last = engine.prices[engine.prices.length - 1] ?? 1000
        engine.push(
          Number((last * (1 + gauss() * 0.0004)).toFixed(m.pip)),
          epoch,
          m.pip,
        )
        this.recordTick(epoch)
      }
    }, 1000)
  }

  private stopSimulation() {
    if (this.simTimer) clearInterval(this.simTimer)
    this.simTimer = null
    this.snapshot = {
      ...this.snapshot,
      status: 'live',
      endpoint: FEED_ENDPOINTS[this.endpointIdx],
    }
  }
}

function gauss() {
  const u = 1 - Math.random()
  const v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
