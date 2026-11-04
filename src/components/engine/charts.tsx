import { useId } from 'react'
import { cn } from '@/lib/utils'

export function Sparkline({
  values,
  className,
  stroke = 'var(--primary)',
  fill = true,
}: {
  values: number[]
  className?: string
  stroke?: string
  fill?: boolean
}) {
  const id = useId()
  if (values.length < 2) return <div className={cn('h-8', className)} />
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * 100,
    36 - ((v - min) / range) * 32 - 2,
  ])
  const d = pts
    .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join('')
  return (
    <svg
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      className={cn('h-8 w-full', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={`${d}L100,36L0,36Z`} fill={`url(#${id})`} />}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Price stream with gridlines, last-price marker and per-tick digit dots. */
export function PriceStream({
  prices,
  digits,
  pip,
}: {
  prices: number[]
  digits: number[]
  pip: number
}) {
  const id = useId()
  const W = 800
  const H = 220
  const PAD_R = 70
  if (prices.length < 2)
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        Waiting for ticks…
      </div>
    )
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const x = (i: number) => (i / (prices.length - 1)) * (W - PAD_R)
  const y = (v: number) => H - 24 - ((v - min) / range) * (H - 48)
  const d = prices
    .map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join('')
  const last = prices[prices.length - 1]
  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => min + range * t)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[220px] w-full"
      role="img"
      aria-label="Live price stream"
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map((g) => (
        <g key={g}>
          <line
            x1={0}
            x2={W - PAD_R}
            y1={y(g)}
            y2={y(g)}
            stroke="var(--border)"
            strokeDasharray="2 4"
          />
          <text
            x={W - PAD_R + 6}
            y={y(g) + 4}
            fontSize="10"
            fill="var(--muted-foreground)"
            fontFamily="var(--font-data)"
          >
            {g.toFixed(pip)}
          </text>
        </g>
      ))}
      <path
        d={`${d}L${x(prices.length - 1)},${H}L0,${H}Z`}
        fill={`url(#${id})`}
      />
      <path
        d={d}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {prices.map((v, i) =>
        i >= prices.length - 30 ? (
          <circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r={2.2}
            fill={digits[i] % 2 === 0 ? 'var(--chart-1)' : 'var(--chart-4)'}
          />
        ) : null,
      )}
      <line
        x1={0}
        x2={W - PAD_R}
        y1={y(last)}
        y2={y(last)}
        stroke="var(--accent)"
        strokeOpacity="0.5"
      />
      <rect
        x={W - PAD_R + 2}
        y={y(last) - 9}
        width={PAD_R - 4}
        height={18}
        rx={3}
        fill="var(--accent)"
      />
      <text
        x={W - PAD_R + 6}
        y={y(last) + 4}
        fontSize="10.5"
        fontWeight="700"
        fill="var(--accent-foreground)"
        fontFamily="var(--font-data)"
      >
        {last.toFixed(pip)}
      </text>
      <circle
        cx={x(prices.length - 1)}
        cy={y(last)}
        r={4}
        fill="var(--accent)"
        className="pulse-dot"
      />
    </svg>
  )
}

/** Line chart for a rate series with a baseline reference. */
export function RateLine({
  series,
  baseline,
  color,
  label,
}: {
  series: number[]
  baseline: number
  color: string
  label: string
}) {
  const W = 400
  const H = 120
  if (series.length < 2) return <div className="h-[120px]" />
  const lo = Math.min(baseline - 0.08, ...series)
  const hi = Math.max(baseline + 0.08, ...series)
  const y = (v: number) => H - 8 - ((v - lo) / (hi - lo)) * (H - 16)
  const x = (i: number) => (i / (series.length - 1)) * W
  const d = series
    .map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join('')
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[120px] w-full"
      role="img"
      aria-label={label}
    >
      <line
        x1={0}
        x2={W}
        y1={y(baseline)}
        y2={y(baseline)}
        stroke="var(--muted-foreground)"
        strokeDasharray="4 4"
        strokeOpacity="0.6"
      />
      <text
        x={4}
        y={y(baseline) - 4}
        fontSize="10"
        fill="var(--muted-foreground)"
        fontFamily="var(--font-data)"
      >
        baseline {(baseline * 100).toFixed(0)}%
      </text>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
