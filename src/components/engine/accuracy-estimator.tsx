import { Target } from 'lucide-react'
import type { Analysis } from '@/lib/engine/analyzer'
import { cn } from '@/lib/utils'
import { CONTRACT_LABEL, pct, signed } from './format'
import { Panel } from './panel'

export function AccuracyEstimator({ analysis }: { analysis: Analysis }) {
  return (
    <Panel
      title="Accuracy advantage estimator"
      icon={Target}
      aside={
        <span className="text-[11px] text-muted-foreground">
          walk-forward · last 500 predictions
        </span>
      }
    >
      <div className="space-y-3">
        {analysis.accuracy.map((a) => {
          const lo = Math.max(0, a.baseline - 0.15)
          const hi = Math.min(1, a.baseline + 0.15)
          const pos = (v: number) =>
            `${((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * 100}%`
          const significant = a.ci[0] > a.baseline
          return (
            <div key={a.contract}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium">
                  {CONTRACT_LABEL[a.contract]}
                </span>
                <span className="tabular">
                  <span className="font-semibold">{pct(a.rate)}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    vs {pct(a.baseline, 0)} ·{' '}
                  </span>
                  <span
                    className={cn(
                      'font-semibold',
                      a.advantage >= 0 ? 'text-up' : 'text-down',
                    )}
                  >
                    {signed(a.advantage)} pp
                  </span>
                </span>
              </div>
              <div className="relative mt-1.5 h-2.5 rounded-full bg-muted">
                <div
                  className={cn(
                    'absolute inset-y-0 rounded-full',
                    significant ? 'bg-accent/50' : 'bg-primary/35',
                  )}
                  style={{
                    left: pos(a.ci[0]),
                    width: `calc(${pos(a.ci[1])} - ${pos(a.ci[0])})`,
                  }}
                />
                <div
                  className="absolute inset-y-[-3px] w-px bg-foreground/60"
                  style={{ left: pos(a.baseline) }}
                />
                <div
                  className={cn(
                    'absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background',
                    significant ? 'bg-accent' : 'bg-primary',
                  )}
                  style={{ left: pos(a.rate) }}
                />
              </div>
              <div className="tabular mt-1 text-[10px] text-muted-foreground">
                95% CI {pct(a.ci[0])} – {pct(a.ci[1])} · n={a.n}
                {significant && (
                  <span className="ml-1 font-semibold text-accent">
                    · beats baseline
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 rounded-md border border-dashed px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        Each tick, the model commits to a prediction before seeing the result.
        This panel shows the realised hit rate against the random baseline, so
        you can see whether a confidence reading is translating into a real
        advantage.
      </p>
    </Panel>
  )
}
