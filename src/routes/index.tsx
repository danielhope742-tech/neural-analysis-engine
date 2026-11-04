import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { useMarketFeed } from '@/lib/deriv/use-market-feed'
import { MARKETS, MARKET_BY_SYMBOL } from '@/lib/deriv/markets'
import { analyze } from '@/lib/engine/analyzer'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBar } from '@/components/engine/status-bar'
import {
  MarketScanner,
  type ScanFilter,
  type ScanRow,
} from '@/components/engine/market-scanner'
import { DeepScanner } from '@/components/engine/deep-scanner'
import { MarketOverview } from '@/components/engine/market-overview'
import { DigitDistribution } from '@/components/engine/digit-distribution'
import { ProbabilityEngine } from '@/components/engine/probability-engine'
import { NeuralPatterns } from '@/components/engine/neural-patterns'
import { AccuracyEstimator } from '@/components/engine/accuracy-estimator'
import { HistoricalInsight } from '@/components/engine/historical-insight'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: EngineDashboard,
})

const WINDOWS = [100, 250, 500, 1000, 5000]

function EngineDashboard() {
  const { feed, frame, snapshot } = useMarketFeed()
  const [selected, setSelected] = useState('R_100')
  const [windowSize, setWindowSize] = useState(1000)
  const [filter, setFilter] = useState<ScanFilter>('all')

  // `frame` changes whenever new ticks land, so analyses recompute on that cadence.
  const rows = useMemo<ScanRow[]>(() => {
    if (!feed) return []
    return MARKETS.map((m) => {
      const engine = feed.engines.get(m.symbol)!
      return {
        analysis: analyze(engine, windowSize),
        pip: engine.pip,
        spark: engine.prices.slice(-40),
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed, frame, windowSize])

  const engines = useMemo(
    () => (feed ? MARKETS.map((m) => feed.engines.get(m.symbol)!) : []),
    [feed],
  )
  const focusFromScanner = (symbol: string) => {
    setSelected(symbol)
    document
      .getElementById('focus-market')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const engine = feed?.engines.get(selected)
  const focus = rows.find((r) => r.analysis.symbol === selected)?.analysis

  return (
    <div className="min-h-screen">
      <StatusBar snapshot={snapshot} marketCount={MARKETS.length} />

      <main className="mx-auto max-w-content px-4 py-5">
        <div className="mb-6">
          {engines.length ? (
            <DeepScanner engines={engines} onFocus={focusFromScanner} />
          ) : (
            <Skeleton className="h-72" />
          )}
        </div>

        <div
          id="focus-market"
          className="mb-5 flex scroll-mt-20 flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="tabular text-[11px] uppercase tracking-[0.25em] text-primary">
              Focus market
            </p>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {MARKET_BY_SYMBOL[selected].name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Analysis window
            </span>
            <div
              className="flex rounded-md border bg-card p-0.5"
              role="radiogroup"
              aria-label="Analysis window"
            >
              {WINDOWS.map((w) => (
                <button
                  key={w}
                  role="radio"
                  aria-checked={windowSize === w}
                  onClick={() => setWindowSize(w)}
                  className={cn(
                    'tabular rounded px-2.5 py-1 text-xs transition-colors',
                    windowSize === w
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {w === 5000 ? 'All' : w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {snapshot.status === 'simulated' && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-chart-4/40 bg-chart-4/10 px-3 py-2 text-xs">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-chart-4" />
            <span>
              The live market feed is unreachable, so the engine is running on a
              local simulated stream. It keeps retrying and switches back to
              live data automatically.
            </span>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            {rows.length ? (
              <MarketScanner
                rows={rows}
                selected={selected}
                onSelect={setSelected}
                filter={filter}
                onFilter={setFilter}
              />
            ) : (
              <Skeleton className="h-[600px]" />
            )}
          </aside>

          {engine && focus && focus.n > 0 ? (
            <div className="grid min-w-0 gap-4">
              <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                <MarketOverview engine={engine} analysis={focus} />
                <DigitDistribution analysis={focus} />
              </div>
              <ProbabilityEngine analysis={focus} />
              <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <NeuralPatterns analysis={focus} steps={engine.net.steps} />
                <AccuracyEstimator analysis={focus} />
              </div>
              <HistoricalInsight engine={engine} />
            </div>
          ) : (
            <div className="grid gap-4">
              <Skeleton className="h-80" />
              <Skeleton className="h-56" />
              <p className="text-center text-sm text-muted-foreground">
                Loading tick history for all markets…
              </p>
            </div>
          )}
        </div>

        <footer className="mt-8 border-t pt-4 text-[11px] leading-relaxed text-muted-foreground">
          Confidence scores measure how unlikely the observed digit skew is
          under pure chance; they are not a win-rate guarantee. Volatility
          Indices are designed to be random, so always check the walk-forward
          accuracy panel and trade responsibly.
        </footer>
      </main>
    </div>
  )
}
