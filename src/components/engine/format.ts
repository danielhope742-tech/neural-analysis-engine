import type { ConfidenceBand, ContractFamily } from '@/lib/engine/analyzer'
import type { TrackedContract } from '@/lib/engine/symbol-engine'

export const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`
export const signed = (v: number, d = 1) =>
  `${v >= 0 ? '+' : ''}${v.toFixed(d)}`

export const BAND_META: Record<
  ConfidenceBand,
  { label: string; text: string; bg: string; bar: string }
> = {
  noise: {
    label: 'Noise',
    text: 'text-muted-foreground',
    bg: 'bg-muted',
    bar: 'bg-muted-foreground/50',
  },
  weak: {
    label: 'Developing',
    text: 'text-chart-3',
    bg: 'bg-chart-3/15',
    bar: 'bg-chart-3',
  },
  strong: {
    label: 'Strong edge',
    text: 'text-primary',
    bg: 'bg-primary/15',
    bar: 'bg-primary',
  },
  extreme: {
    label: 'Extreme skew',
    text: 'text-accent',
    bg: 'bg-accent/15',
    bar: 'bg-accent',
  },
}

export const FAMILY_LABEL: Record<ContractFamily, string> = {
  matches_differs: 'Matches / Differs',
  even_odd: 'Even / Odd',
  over_under: 'Over / Under',
}

export const CONTRACT_LABEL: Record<TrackedContract, string> = {
  matches: 'Matches (top digit)',
  differs: 'Differs (coldest digit)',
  even_odd: 'Even / Odd',
  over_under: 'Over 4 / Under 5',
}

/** Splits a quote so the last (analysed) digit can be highlighted. */
export function splitQuote(q: number | null, pip: number): [string, string] {
  if (q === null) return ['—', '']
  const s = q.toFixed(pip)
  return [s.slice(0, -1), s.slice(-1)]
}
