export interface Market {
  symbol: string
  name: string
  short: string
  /** Default decimal places; overwritten by pip_size from the feed. */
  pip: number
  /** Seconds between ticks. */
  interval: number
}

export const MARKETS: Market[] = [
  {
    symbol: 'R_10',
    name: 'Volatility 10 Index',
    short: 'V10',
    pip: 3,
    interval: 2,
  },
  {
    symbol: 'R_25',
    name: 'Volatility 25 Index',
    short: 'V25',
    pip: 3,
    interval: 2,
  },
  {
    symbol: 'R_50',
    name: 'Volatility 50 Index',
    short: 'V50',
    pip: 4,
    interval: 2,
  },
  {
    symbol: 'R_75',
    name: 'Volatility 75 Index',
    short: 'V75',
    pip: 4,
    interval: 2,
  },
  {
    symbol: 'R_100',
    name: 'Volatility 100 Index',
    short: 'V100',
    pip: 2,
    interval: 2,
  },
  {
    symbol: '1HZ10V',
    name: 'Volatility 10 (1s) Index',
    short: 'V10·1s',
    pip: 2,
    interval: 1,
  },
  {
    symbol: '1HZ25V',
    name: 'Volatility 25 (1s) Index',
    short: 'V25·1s',
    pip: 2,
    interval: 1,
  },
  {
    symbol: '1HZ50V',
    name: 'Volatility 50 (1s) Index',
    short: 'V50·1s',
    pip: 2,
    interval: 1,
  },
  {
    symbol: '1HZ75V',
    name: 'Volatility 75 (1s) Index',
    short: 'V75·1s',
    pip: 2,
    interval: 1,
  },
  {
    symbol: '1HZ100V',
    name: 'Volatility 100 (1s) Index',
    short: 'V100·1s',
    pip: 2,
    interval: 1,
  },
]

export const MARKET_BY_SYMBOL = Object.fromEntries(
  MARKETS.map((m) => [m.symbol, m]),
) as Record<string, Market>

/** Public, unauthenticated market-data WebSocket endpoints, tried in order. */
export const FEED_ENDPOINTS = [
  'wss://api.derivws.com/trading/v1/options/ws/public',
  'wss://ws.derivws.com/websockets/v3?app_id=1089',
]

export const HISTORY_COUNT = 1000
