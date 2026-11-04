import { Gauge } from 'lucide-react'
import type { Analysis, Signal } from '@/lib/engine/analyzer'
import { cn } from '@/lib/utils'
import { BAND_META, FAMILY_LABEL, pct, signed } from './format'
import { Panel } from './panel'

export function ProbabilityEngine({ analysis }: { analysis: Analysis }) {
  return (
    <Panel
      title="Probability engine"
      icon={Gauge}
      aside={
        <span className="text-[11px] text-muted-foreground">
          signal band 87–98% = strong
        </span>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        {analysis.signals.map((s) => (
          <SignalCard key={s.family} signal={s} />
        ))}
      </div>
      <OverUnderLadder analysis={analysis} />
    </Panel>
  )
}

function SignalCard({ signal: s }: { signal: Signal }) {
  const band = BAND_META[s.band]
  const r = 34
  const c = 2 * Math.PI * r
  const arc = (s.confidence / 100) * c * 0.75
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        s.band === 'strong' || s.band === 'extreme' ? 'border-primary/40' : '',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {FAMILY_LABEL[s.family]}
        </span>
        <span
          className={cn(
            'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
            band.bg,
            band.text,
          )}
        >
          {band.label}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="relative size-20 shrink-0">
          <svg
            viewBox="0 0 80 80"
            className="size-20 rotate-[135deg]"
            aria-hidden
          >
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke="var(--muted)"
              strokeWidth="6"
              strokeDasharray={`${c * 0.75} ${c}`}
              strokeLinecap="round"
            />
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke="currentColor"
              className={cn(band.text, 'transition-all duration-700')}
              strokeWidth="6"
              strokeDasharray={`${arc} ${c}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div
                className={cn(
                  'tabular text-base font-bold leading-none',
                  band.text,
                )}
              >
                {s.confidence.toFixed(1)}
              </div>
              <div className="text-[9px] text-muted-foreground">conf %</div>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="font-display text-xl font-bold">{s.label}</div>
          <dl className="tabular mt-1 grid grid-cols-[auto_auto] gap-x-3 text-xs">
            <dt className="text-muted-foreground">Est. prob</dt>
            <dd className="text-right">{pct(s.probability)}</dd>
            <dt className="text-muted-foreground">Baseline</dt>
            <dd className="text-right">{pct(s.baseline)}</dd>
            <dt className="text-muted-foreground">Edge</dt>
            <dd
              className={cn(
                'text-right font-semibold',
                s.edge >= 0 ? 'text-up' : 'text-down',
              )}
            >
              {signed(s.edge, 2)} pp
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}

function OverUnderLadder({ analysis }: { analysis: Analysis }) {
  return (
    <div className="mt-4">
      <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        Over barrier ladder · observed vs expected
      </div>
      <div className="grid grid-cols-9 gap-1">
        {analysis.overRates.slice(0, 9).map((r, b) => {
          const exp = (9 - b) / 10
          const diff = (r - exp) * 100
          return (
            <div
              key={b}
              className="rounded border bg-background/40 px-1 py-1.5 text-center"
              title={`Over ${b}: ${pct(r)} vs ${pct(exp, 0)} expected`}
            >
              <div className="text-[10px] text-muted-foreground">&gt;{b}</div>
              <div className="tabular text-xs font-semibold">
                {(r * 100).toFixed(1)}
              </div>
              <div
                className={cn(
                  'tabular text-[10px]',
                  diff >= 0 ? 'text-up' : 'text-down',
                )}
              >
                {signed(diff)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
