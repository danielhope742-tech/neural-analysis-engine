import { LineChart } from 'lucide-react'
import type { Analysis } from '@/lib/engine/analyzer'
import type { SymbolEngine } from '@/lib/engine/symbol-engine'
import { MARKET_BY_SYMBOL } from '@/lib/deriv/markets'
import { cn } from '@/lib/utils'
import { PriceStream } from './charts'
import { pct, splitQuote } from './format'
import { Panel, Stat } from './panel'

export function MarketOverview({
  engine,
  analysis,
}: {
  engine: SymbolEngine
  analysis: Analysis
}) {
  const m = MARKET_BY_SYMBOL[engine.symbol]
  const [head, tail] = splitQuote(analysis.lastQuote, engine.pip)
  const prices = engine.prices.slice(-150)
  const digits = engine.digits.slice(-150)
  return (
    <Panel
      title="Live tick stream"
      icon={LineChart}
      aside={
        <span className="tabular text-[11px] text-muted-foreground">
          {m.interval}s ticks · pip {engine.pip}
        </span>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">{m.name}</div>
          <div className="tabular flex items-baseline text-4xl font-bold tracking-tight md:text-5xl">
            <span>{head}</span>
            <span
              key={`${analysis.n}-${analysis.lastQuote}`}
              className={cn(
                'tick-flash rounded px-1',
                analysis.change >= 0 ? 'text-up' : 'text-down',
              )}
            >
              {tail}
            </span>
          </div>
        </div>
        <div className="flex gap-1.5" aria-label="Last 12 digits">
          {digits.slice(-12).map((d, i, arr) => (
            <span
              key={i}
              className={cn(
                'tabular grid size-7 place-items-center rounded text-sm font-semibold',
                i === arr.length - 1
                  ? 'bg-accent text-accent-foreground'
                  : d % 2 === 0
                    ? 'bg-chart-1/15 text-chart-1'
                    : 'bg-chart-4/15 text-chart-4',
              )}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <PriceStream prices={prices} digits={digits} pip={engine.pip} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Ticks analysed" value={analysis.n.toLocaleString()} />
        <Stat
          label="Realised vol"
          value={`${analysis.volatility.toFixed(2)} bps`}
          hint="Std. dev. of tick log-returns"
        />
        <Stat
          label="Digit entropy"
          value={pct(analysis.entropy, 2)}
          hint="100% = perfectly uniform digits"
        />
        <Stat
          label="Current streak"
          value={`${analysis.streak.length}× ${analysis.streak.kind}`}
          hint="Consecutive same-parity last digits"
        />
      </div>
    </Panel>
  )
}
