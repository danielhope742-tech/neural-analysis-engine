import { BarChart3 } from 'lucide-react'
import type { Analysis } from '@/lib/engine/analyzer'
import { cn } from '@/lib/utils'
import { Panel } from './panel'

export function DigitDistribution({ analysis }: { analysis: Analysis }) {
  const max = Math.max(0.14, ...analysis.freq)
  const hot = analysis.freq.indexOf(Math.max(...analysis.freq))
  const cold = analysis.freq.indexOf(Math.min(...analysis.freq))
  return (
    <Panel
      title="Digit skew"
      icon={BarChart3}
      aside={
        <span className="tabular text-[11px] text-muted-foreground">
          χ² {analysis.chi2.toFixed(1)} · p {analysis.chi2P.toFixed(3)}
        </span>
      }
    >
      <div className="grid grid-cols-10 gap-1.5 text-center">
        {analysis.freq.map((f, d) => {
          const z = analysis.digitZ[d]
          return (
            <span
              key={d}
              className={cn(
                'tabular text-[10px]',
                z > 1.5
                  ? 'text-accent'
                  : z < -1.5
                    ? 'text-down'
                    : 'text-muted-foreground',
              )}
            >
              {(f * 100).toFixed(1)}
            </span>
          )
        })}
      </div>
      <div className="relative mt-1 grid h-36 grid-cols-10 items-end gap-1.5 border-b">
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-foreground/40"
          style={{ bottom: `${(0.1 / max) * 100}%` }}
          title="Uniform baseline (10%)"
        />
        {analysis.freq.map((f, d) => (
          <div
            key={d}
            className={cn(
              'w-full rounded-t transition-all duration-500',
              d === hot
                ? 'bg-accent'
                : d === cold
                  ? 'bg-down/80'
                  : 'bg-primary/70',
            )}
            style={{ height: `${(f / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-10 gap-1.5 justify-items-center">
        {analysis.freq.map((_, d) => (
          <span
            key={d}
            className={cn(
              'tabular grid size-6 place-items-center rounded-full text-xs font-bold',
              analysis.lastDigit === d
                ? 'bg-accent text-accent-foreground ring-2 ring-accent/40'
                : 'bg-muted',
            )}
          >
            {d}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md bg-accent/10 px-2 py-1.5">
          <div className="text-muted-foreground">Hottest</div>
          <div className="tabular font-semibold text-accent">
            {hot} · z {analysis.digitZ[hot].toFixed(2)}
          </div>
        </div>
        <div className="rounded-md bg-down/10 px-2 py-1.5">
          <div className="text-muted-foreground">Coldest</div>
          <div className="tabular font-semibold text-down">
            {cold} · z {analysis.digitZ[cold].toFixed(2)}
          </div>
        </div>
        <div className="rounded-md bg-primary/10 px-2 py-1.5">
          <div className="text-muted-foreground">Skew score</div>
          <div className="tabular font-semibold text-primary">
            {analysis.skewScore.toFixed(1)}%
          </div>
        </div>
      </div>
    </Panel>
  )
}
