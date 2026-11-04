import { ArrowDownRight, ArrowUpRight, ScanLine } from 'lucide-react'
import type { Analysis, ContractFamily } from '@/lib/engine/analyzer'
import { MARKET_BY_SYMBOL } from '@/lib/deriv/markets'
import { cn } from '@/lib/utils'
import { BAND_META, FAMILY_LABEL, splitQuote } from './format'
import { Sparkline } from './charts'

export type ScanFilter = 'all' | ContractFamily

export interface ScanRow {
  analysis: Analysis
  pip: number
  spark: number[]
}

export function MarketScanner({
  rows,
  selected,
  onSelect,
  filter,
  onFilter,
}: {
  rows: ScanRow[]
  selected: string
  onSelect: (s: string) => void
  filter: ScanFilter
  onFilter: (f: ScanFilter) => void
}) {
  const scored = rows
    .map((r) => {
      const sig =
        filter === 'all'
          ? r.analysis.best
          : (r.analysis.signals.find((s) => s.family === filter) ?? null)
      return { ...r, sig }
    })
    .sort((a, b) => (b.sig?.confidence ?? 0) - (a.sig?.confidence ?? 0))

  return (
    <section
      className="flex flex-col rounded-lg border bg-card/80"
      aria-label="Market scanner"
    >
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ScanLine className="size-4 text-primary" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider">
            Market scanner
          </h2>
        </div>
        <span className="tabular text-[11px] text-muted-foreground">
          ranked by confidence
        </span>
      </div>
      <div
        className="flex gap-1 overflow-x-auto border-b px-3 py-2"
        role="tablist"
      >
        {(
          ['all', 'matches_differs', 'even_odd', 'over_under'] as ScanFilter[]
        ).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => onFilter(f)}
            className={cn(
              'whitespace-nowrap rounded px-2.5 py-1 text-xs transition-colors',
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {f === 'all' ? 'Best signal' : FAMILY_LABEL[f]}
          </button>
        ))}
      </div>
      <ul className="divide-y">
        {scored.map(({ analysis: a, pip, spark, sig }) => {
          const m = MARKET_BY_SYMBOL[a.symbol]
          const [head, tail] = splitQuote(a.lastQuote, pip)
          const band = sig ? BAND_META[sig.band] : BAND_META.noise
          const active = a.symbol === selected
          return (
            <li key={a.symbol}>
              <button
                onClick={() => onSelect(a.symbol)}
                className={cn(
                  'grid w-full grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 px-4 py-3 text-left transition-colors',
                  active
                    ? 'bg-primary/10 shadow-[inset_3px_0_0_var(--primary)]'
                    : 'hover:bg-muted/60',
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-semibold">
                      {m.short}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {m.symbol}
                    </span>
                  </div>
                  <div className="tabular flex items-center gap-1 text-sm">
                    <span>{head}</span>
                    <span
                      key={`${a.symbol}-${a.n}-${a.lastQuote}`}
                      className="tick-flash rounded px-0.5 font-bold text-accent"
                    >
                      {tail}
                    </span>
                    {a.change > 0 ? (
                      <ArrowUpRight className="size-3.5 text-up" />
                    ) : a.change < 0 ? (
                      <ArrowDownRight className="size-3.5 text-down" />
                    ) : null}
                  </div>
                </div>
                <div className="w-20 self-center">
                  <Sparkline
                    values={spark}
                    stroke={a.change >= 0 ? 'var(--up)' : 'var(--down)'}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <span
                    className={cn(
                      'tabular rounded px-1.5 py-0.5 text-[11px] font-semibold',
                      band.bg,
                      band.text,
                    )}
                  >
                    {sig?.label ?? '—'}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        band.bar,
                      )}
                      style={{ width: `${sig?.confidence ?? 0}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'tabular w-12 text-right text-xs font-semibold',
                      band.text,
                    )}
                  >
                    {sig ? `${sig.confidence.toFixed(1)}%` : '—'}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
