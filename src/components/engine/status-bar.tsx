import { Activity, Cpu, Radio, Timer } from 'lucide-react'
import type { FeedSnapshot } from '@/lib/deriv/client'
import { cn } from '@/lib/utils'

const STATUS: Record<FeedSnapshot['status'], { label: string; dot: string }> = {
  connecting: { label: 'Connecting', dot: 'bg-chart-3' },
  live: { label: 'Live feed', dot: 'bg-up' },
  reconnecting: { label: 'Reconnecting', dot: 'bg-chart-3' },
  simulated: { label: 'Simulated feed', dot: 'bg-chart-4' },
}

export function StatusBar({
  snapshot,
  marketCount,
}: {
  snapshot: FeedSnapshot
  marketCount: number
}) {
  const s = STATUS[snapshot.status]
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative grid size-9 place-items-center rounded-md border border-primary/40 bg-primary/10">
            <Cpu className="size-5 text-primary" />
            <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-accent pulse-dot" />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-lg font-semibold tracking-wide">
              Neural Digit Analysis Engine
            </h1>
            <p className="tabular text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              v2.4.0 · {marketCount} volatility markets
            </p>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
          <Pill>
            <span
              className={cn(
                'size-2 rounded-full',
                s.dot,
                snapshot.status === 'live' && 'pulse-dot',
              )}
            />
            <span className="font-medium">{s.label}</span>
          </Pill>
          <Pill title="WebSocket round-trip latency (ping)">
            <Timer className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">RTT</span>
            <span className="tabular">
              {snapshot.rttMs !== null ? `${snapshot.rttMs} ms` : '—'}
            </span>
          </Pill>
          <Pill title="Time between tick epoch and arrival (includes clock offset)">
            <Radio className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Feed lag</span>
            <span className="tabular">
              {snapshot.feedLagMs !== null
                ? `${(snapshot.feedLagMs / 1000).toFixed(2)} s`
                : '—'}
            </span>
          </Pill>
          <Pill title="Ticks processed across all markets in the last minute">
            <Activity className="size-3.5 text-muted-foreground" />
            <span className="tabular">{snapshot.ticksPerMin}</span>
            <span className="text-muted-foreground">ticks/min</span>
          </Pill>
        </div>
      </div>
    </header>
  )
}

function Pill({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}) {
  return (
    <div
      title={title}
      className="flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1.5"
    >
      {children}
    </div>
  )
}
