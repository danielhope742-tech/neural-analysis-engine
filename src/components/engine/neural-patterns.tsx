import { BrainCircuit } from 'lucide-react'
import type { Analysis } from '@/lib/engine/analyzer'
import { cn } from '@/lib/utils'
import { Panel } from './panel'

export function NeuralPatterns({
  analysis,
  steps,
}: {
  analysis: Analysis
  steps: number
}) {
  const probs = analysis.modelProbs
  const top = probs.indexOf(Math.max(...probs))
  const maxP = Math.max(0.15, ...probs)
  const cur = analysis.lastDigit
  const row = cur !== null ? analysis.transitions[cur] : null
  return (
    <Panel
      title="Neural pattern recognition"
      icon={BrainCircuit}
      aside={
        <span className="tabular text-[11px] text-muted-foreground">
          {steps.toLocaleString()} training steps
        </span>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>Next-digit forecast</span>
            <span>
              top: <span className="font-semibold text-accent">{top}</span>
            </span>
          </div>
          <ul className="space-y-1">
            {probs.map((p, d) => (
              <li key={d} className="flex items-center gap-2">
                <span className="tabular w-3 text-xs font-semibold">{d}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-sm bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-sm transition-all duration-500',
                      d === top ? 'bg-accent' : 'bg-chart-4/70',
                    )}
                    style={{ width: `${(p / maxP) * 100}%` }}
                  />
                </div>
                <span className="tabular w-12 text-right text-xs">
                  {(p * 100).toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            A softmax network trained online on every tick, using the last three
            digits and five-tick parity rhythm as features. Predictions are
            scored before each update so accuracy stays honest.
          </p>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>Transition matrix (from → to)</span>
            {row && cur !== null && (
              <span>
                after <span className="font-semibold text-accent">{cur}</span> →{' '}
                {row.indexOf(Math.max(...row))}
              </span>
            )}
          </div>
          <TransitionHeatmap matrix={analysis.transitions} current={cur} />
        </div>
      </div>
    </Panel>
  )
}

function TransitionHeatmap({
  matrix,
  current,
}: {
  matrix: number[][]
  current: number | null
}) {
  return (
    <div
      className="grid grid-cols-[auto_repeat(10,1fr)] gap-px text-[9px]"
      role="table"
      aria-label="Digit transition probabilities"
    >
      <span />
      {matrix.map((_, j) => (
        <span key={j} className="tabular text-center text-muted-foreground">
          {j}
        </span>
      ))}
      {matrix.map((rowV, i) => (
        <Row key={i} i={i} row={rowV} active={i === current} />
      ))}
    </div>
  )
}

function Row({
  i,
  row,
  active,
}: {
  i: number
  row: number[]
  active: boolean
}) {
  return (
    <>
      <span
        className={cn(
          'tabular pr-1 text-right',
          active ? 'font-bold text-accent' : 'text-muted-foreground',
        )}
      >
        {i}
      </span>
      {row.map((p, j) => {
        // map 0.04..0.16 → 0..1 intensity around the 10% baseline
        const t = Math.max(-1, Math.min(1, (p - 0.1) / 0.06))
        const bg =
          t >= 0
            ? `color-mix(in oklch, var(--accent) ${Math.round(t * 85)}%, var(--muted))`
            : `color-mix(in oklch, var(--chart-4) ${Math.round(-t * 70)}%, var(--muted))`
        return (
          <span
            key={j}
            title={`${i} → ${j}: ${(p * 100).toFixed(1)}%`}
            className={cn(
              'aspect-square rounded-[2px]',
              active && 'ring-1 ring-accent/60',
            )}
            style={{ background: bg }}
          />
        )
      })}
    </>
  )
}
