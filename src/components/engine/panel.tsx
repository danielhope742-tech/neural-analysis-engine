import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Panel({
  title,
  icon: Icon,
  aside,
  children,
  className,
}: {
  title: string
  icon: LucideIcon
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border bg-card/80', className)}>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider">
            {title}
          </h2>
        </div>
        {aside}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: React.ReactNode
  hint?: string
}) {
  return (
    <div title={hint} className="rounded-md border bg-background/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="tabular mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  )
}
