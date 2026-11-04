import { History } from 'lucide-react'
import { rollingHeatmap, rollingRate } from '@/lib/engine/analyzer'
import type { SymbolEngine } from '@/lib/engine/symbol-engine'
import { cn } from '@/lib/utils'
import { RateLine } from './charts'
import { Panel } from './panel'

export function HistoricalInsight({ engine }: { engine: SymbolEngine }) {
  const digits = engine.digits
  const segSize = 50
  const heat = rollingHeatmap(digits, 40, segSize)
  const evenSeries = rollingRate(digits, 100, (d) => d % 2 === 0)
  const overSeries = rollingRate(digits, 100, (d) => d > 4)
  const recent = digits.slice(-100)
  return (
    <Panel
      title="Historical insight"
      icon={History}
      aside={
        <span className="tabular text-[11px] text-muted-foreground">
          {digits.length.toLocaleString()} ticks in memory
        </span>
      }
    >
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        Digit frequency drift · {segSize}-tick windows (oldest → newest)
      </div>
      <div className="mt-2 flex gap-2">
        <div className="tabular flex flex-col justify-between py-px text-[9px] text-muted-foreground">
          {Array.from({ length: 10 }, (_, d) => (
            <span key={d} className="leading-none">
              {d}
            </span>
          ))}
        </div>
        <div
          className="grid flex-1 gap-px"
          style={{
            gridTemplateColumns: `repeat(${Math.max(heat.length, 1)}, 1fr)`,
          }}
        >
          {heat.map((col, i) => (
            <div key={i} className="grid grid-rows-10 gap-px">
              {col.map((f, d) => {
                const t = Math.max(-1, Math.min(1, (f - 0.1) / 0.08))
                const bg =
                  t >= 0
                    ? `color-mix(in oklch, var(--primary) ${Math.round(t * 90)}%, var(--muted))`
                    : `color-mix(in oklch, var(--down) ${Math.round(-t * 60)}%, var(--muted))`
                return (
                  <span
                    key={d}
                    className="h-3 rounded-[1px]"
                    style={{ background: bg }}
                    title={`Digit ${d}: ${(f * 100).toFixed(0)}%`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>Even rate · rolling 100</span>
            <span className="tabular text-chart-1">
              {evenSeries.length
                ? `${(evenSeries[evenSeries.length - 1] * 100).toFixed(0)}%`
                : '—'}
            </span>
          </div>
          <RateLine
            series={evenSeries}
            baseline={0.5}
            color="var(--chart-1)"
            label="Rolling even rate"
          />
        </div>
        <div>
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>Over 4 rate · rolling 100</span>
            <span className="tabular text-chart-3">
              {overSeries.length
                ? `${(overSeries[overSeries.length - 1] * 100).toFixed(0)}%`
                : '—'}
            </span>
          </div>
          <RateLine
            series={overSeries}
            baseline={0.5}
            color="var(--chart-3)"
            label="Rolling over-4 rate"
          />
        </div>
      </div>

      <div className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
        Last 100 digits
      </div>
      <div className="mt-2 grid grid-cols-20 gap-1">
        {recent.map((d, i) => (
          <span
            key={i}
            className={cn(
              'tabular grid aspect-square place-items-center rounded-sm text-[10px] font-semibold',
              i === recent.length - 1
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
    </Panel>
  )
}
