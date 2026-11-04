
import { useCallback, useEffect, useRef, useState } from 'react'
import { Crosshair, Radar, RotateCw, Sparkles } from 'lucide-react'
import type { ContractFamily } from '@/lib/engine/analyzer'
import type { SymbolEngine } from '@/lib/engine/symbol-engine'
import {
  scanMarkets,
  type ScanHit,
  type ScanResult,
} from '@/lib/engine/scanner'
import { MARKETS, MARKET_BY_SYMBOL } from '@/lib/deriv/markets'
import { cn } from '@/lib/utils'
import { BAND_META, FAMILY_LABEL, pct, signed } from './format'
import { Stat } from './panel'

const WINDOW_OPTIONS = [50, 100, 250, 500, 1000]
const THRESHOLDS = [70, 87, 95, 98]
const AUTO_OPTIONS = [0, 10, 30, 60]
const FAMILIES: ContractFamily[] = ['matches_differs', 'even_odd', 'over_under']
const STEP_MS = 90
const PAGE = 12

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  format,
}: {
  label: string
  options: T[]
  value: T
  onChange: (v: T) => void
  format?: (v: T) => string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div
        className="flex rounded-md border bg-background/40 p-0.5"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((o) => (
          <button
            key={String(o)}
            role="radio"
            aria-checked={value === o}
            onClick={() => onChange(o)}
            className={cn(
              'tabular whitespace-nowrap rounded px-2 py-1 text-xs transition-colors',
              value === o
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {format ? format(o) : String(o)}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggles<T extends string | number>({
  label,
  options,
  value,
  onChange,
  format,
}: {
  label: string
  options: T[]
  value: T[]
  onChange: (v: T[]) => void
  format?: (v: T) => string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => {
          const on = value.includes(o)
          return (
            <button
              key={String(o)}
              aria-pressed={on}
              onClick={() => {
                const next = on ? value.filter((v) => v !== o) : [...value, o]
                if (next.length) onChange(next)
              }}
              className={cn(
                'tabular whitespace-nowrap rounded border px-2 py-1 text-xs transition-colors',
                on
                  ? 'border-primary/60 bg-primary/15 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {format ? format(o) : String(o)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DeepScanner({
  engines,
  onFocus,
}: {
  engines: SymbolEngine[]
  onFocus: (symbol: string) => void
}) {
  const [windows, setWindows] = useState<number[]>([100, 250, 1000])
  const [threshold, setThreshold] = useState(87)
  const [families, setFamilies] = useState<ContractFamily[]>(FAMILIES)
  const [requireAll, setRequireAll] = useState(false)
  const [auto, setAuto] = useState(0)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [fresh, setFresh] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [selectedMarket, setSelectedMarket] = useState('ALL')

  const enginesRef = useRef(engines)
  const selectedMarketRef = useRef(selectedMarket)
  const optsRef = useRef({ windows, threshold, families, requireAll })

  useEffect(() => {
    enginesRef.current = engines
    selectedMarketRef.current = selectedMarket
    optsRef.current = { windows, threshold, families, requireAll }
  }, [engines, selectedMarket, windows, threshold, families, requireAll])

  const prevKeys = useRef<Set<string> | null>(null)
  const timer = useRef<number | null>(null)

  const runScan = useCallback(() => {
    if (timer.current !== null) return

    const marketsToScan =
      selectedMarketRef.current === 'ALL'
        ? MARKETS
        : MARKETS.filter(
            (market) => market.symbol === selectedMarketRef.current,
          )

    const scanEngines = enginesRef.current.filter((engine) =>
      marketsToScan.some((market) => market.symbol === engine.symbol),
    )

    let step = 0
    setProgress(0)

    timer.current = window.setInterval(() => {
      step++

      if (step < marketsToScan.length) {
        setProgress(step)
        return
      }

      clearInterval(timer.current!)
      timer.current = null

      const r = scanMarkets(scanEngines, optsRef.current)
      const keys = new Set(r.hits.map((h) => h.key))
      const prev = prevKeys.current

      setFresh(
        prev ? new Set([...keys].filter((k) => !prev.has(k))) : new Set(),
      )

      prevKeys.current = keys
      setResult(r)
      setProgress(null)
    }, STEP_MS)
  }, [])

  useEffect(
    () => () => {
      if (timer.current !== null) clearInterval(timer.current)
    },
    [],
  )

  // Wait for enough history in the selected market.
  const ready = engines.some(
    (e) =>
      (selectedMarket === 'ALL' || e.symbol === selectedMarket) &&
      e.digits.length >= 30,
  )

  useEffect(() => {
    if (ready && !result && progress === null) runScan()
  }, [ready, result, progress, runScan])

  // Automatic scanning.
  useEffect(() => {
    if (!auto) return

    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          runScan()
          return auto
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [auto, runScan])

  // Rescan whenever the selected market or scan settings change.
  const settingsKey =
    `${selectedMarket}|${windows.join(',')}|${threshold}|${families.join(',')}|${requireAll}`

  const lastSettings = useRef(settingsKey)

  useEffect(() => {
    if (lastSettings.current === settingsKey) return

    lastSettings.current = settingsKey
    prevKeys.current = null
    setResult(null)
    setFresh(new Set())

    if (timer.current !== null) {
      clearInterval(timer.current)
      timer.current = null
    }

    setProgress(null)

    if (ready) runScan()
  }, [settingsKey, ready, runScan])

  const scanning = progress !== null
  const sortedWindows = [...windows].sort((a, b) => a - b)
  const hits = result?.hits ?? []
  const visible = showAll ? hits : hits.slice(0, PAGE)

  const displayedMarkets =
    selectedMarket === 'ALL'
      ? MARKETS
      : MARKETS.filter((m) => m.symbol === selectedMarket)

  return (
    <section className="rounded-lg border bg-card/80" aria-label="Deep scanner">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Radar
            className={cn('size-4 text-primary', scanning && 'animate-spin')}
          />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider">
            Deep scanner
          </h2>
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            40 contracts × {displayedMarkets.length} market{displayedMarkets.length === 1 ? '' : 's'} × {windows.length} windows
          </span>
        </div>

        <div className="flex items-center gap-2">
          {auto > 0 && !scanning && (
            <span className="tabular text-[11px] text-muted-foreground">
              next scan in {countdown}s
            </span>
          )}

          <button
            onClick={runScan}
            disabled={scanning || !ready}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <RotateCw className={cn('size-3.5', scanning && 'animate-spin')} />
            {scanning ? 'Scanning…' : 'Scan now'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3 border-b px-4 py-3">
        <label className="flex min-w-44 flex-col gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Select market for deep scan

          <select
            value={selectedMarket}
            onChange={(event) => setSelectedMarket(event.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-xs normal-case tracking-normal text-foreground"
          >
            <option value="ALL">All 10 markets</option>

            {MARKETS.map((market) => (
              <option key={market.symbol} value={market.symbol}>
                {market.name} ({market.symbol})
              </option>
            ))}
          </select>
        </label>

        <Toggles
          label="Contract types"
          options={FAMILIES}
          value={families}
          onChange={setFamilies}
          format={(f) => FAMILY_LABEL[f]}
        />

        <Toggles
          label="Windows (ticks)"
          options={WINDOW_OPTIONS}
          value={windows}
          onChange={setWindows}
        />

        <Segmented
          label="Min confidence"
          options={THRESHOLDS}
          value={threshold}
          onChange={setThreshold}
          format={(t) => `${t}%`}
        />

        <Segmented
          label="Auto scan"
          options={AUTO_OPTIONS}
          value={auto}
          onChange={(a) => {
            setAuto(a)
            setCountdown(a)
          }}
          format={(a) => (a ? `${a}s` : 'Off')}
        />

        <label className="flex cursor-pointer items-center gap-2 pb-1 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={requireAll}
            onChange={(e) => setRequireAll(e.target.checked)}
            className="accent-[var(--primary)]"
          />
          All windows must agree
        </label>
      </div>

      {/* Progress sweep for the selected market or all markets. */}
      <div className="relative h-8 overflow-hidden border-b bg-background/30">
        <div className="flex h-full">
          {displayedMarkets.map((m, i) => {
            const done = scanning ? i < progress! : !!result
            const now = scanning && i === progress

            return (
              <div
                key={m.symbol}
                className={cn(
                  'tabular flex flex-1 items-center justify-center border-r text-[10px] transition-colors last:border-r-0',
                  now
                    ? 'bg-primary/25 text-foreground'
                    : done
                      ? 'text-primary'
                      : 'text-muted-foreground',
                )}
              >
                {m.short}
              </div>
            )
          })}
        </div>

        {scanning && (
          <div className="scan-sweep pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        )}
      </div>

      <div className="p-4">
        {result && (
          <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label="Tests run" value={result.tests.toLocaleString()} />

            <Stat
              label={`Cleared ≥${threshold}%`}
              value={result.cleared.toLocaleString()}
              hint="Market × contract × window tests whose confidence cleared the threshold"
            />

            <Stat
              label="Expected by chance"
              value={`≈ ${result.expectedFalse.toFixed(0)}`}
              hint="How many tests would clear the threshold if every market were perfectly random"
            />

            <Stat
              label="Last scan"
              value={new Date(result.at).toLocaleTimeString()}
            />
          </div>
        )}

        {result && (
          <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
            {result.cleared > result.expectedFalse * 1.5 ? (
              <>
                <span className="font-semibold text-primary">
                  More signals than chance alone predicts.
                </span>{' '}
                Prefer hits where several windows agree.
              </>
            ) : (
              <>
                The number of hits is in line with what random digits would
                produce, so treat single-window hits as likely noise.
              </>
            )}
          </p>
        )}

        {!result ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {ready ? 'Running first scan…' : 'Waiting for tick history…'}
          </p>
        ) : hits.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No contract clears {threshold}% confidence right now. Lower the
            threshold or add windows.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs">
              <thead>
                <tr className="border-b text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">#</th>
                  <th className="py-2 pr-3 font-medium">Market</th>
                  <th className="py-2 pr-3 font-medium">Contract</th>

                  {sortedWindows.map((w) => (
                    <th key={w} className="py-2 pr-2 text-center font-medium">
                      {w}t
                    </th>
                  ))}

                  <th className="py-2 pr-3 text-right font-medium">Agree</th>
                  <th className="py-2 pr-3 text-right font-medium">Prob.</th>
                  <th className="py-2 pr-3 text-right font-medium">Edge</th>
                  <th className="py-2 pr-3 text-right font-medium">Last 20</th>
                  <th className="py-2" />
                </tr>
              </thead>

              <tbody className="divide-y">
                {visible.map((h, i) => (
                  <HitRow
                    key={h.key}
                    hit={h}
                    rank={i + 1}
                    fresh={fresh.has(h.key)}
                    threshold={threshold}
                    onFocus={onFocus}
                  />
                ))}
              </tbody>
            </table>

            {hits.length > PAGE && (
              <button
                onClick={() => setShowAll((s) => !s)}
                className="mt-3 w-full rounded-md border py-1.5 text-xs text-muted-foreground hover:bg-muted"
              >
                {showAll ? 'Show top results' : `Show all ${hits.length} hits`}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function HitRow({
  hit: h,
  rank,
  fresh,
  threshold,
  onFocus,
}: {
  hit: ScanHit
  rank: number
  fresh: boolean
  threshold: number
  onFocus: (s: string) => void
}) {
  const m = MARKET_BY_SYMBOL[h.symbol]
  const band = BAND_META[h.lead.band]
  const evaluated = h.perWindow.filter(Boolean).length

  return (
    <tr className="hover:bg-muted/40">
      <td className="tabular py-2 pr-3 text-muted-foreground">{rank}</td>

      <td className="py-2 pr-3">
        <span className="font-display font-semibold">{m.short}</span>
      </td>

      <td className="py-2 pr-3">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'tabular rounded px-1.5 py-0.5 font-semibold',
              band.bg,
              band.text,
            )}
          >
            {h.contract.label}
          </span>

          {fresh && (
            <span className="flex items-center gap-0.5 rounded bg-accent/15 px-1 py-0.5 text-[9px] font-bold uppercase text-accent">
              <Sparkles className="size-2.5" />
              New
            </span>
          )}
        </div>
      </td>

      {h.perWindow.map((s, i) => (
        <td key={i} className="py-2 pr-2 text-center">
          {s ? (
            <span
              title={`${pct(s.probability)} est. vs ${pct(s.baseline)} baseline, z=${s.z.toFixed(2)}`}
              className={cn(
                'tabular inline-block min-w-12 rounded px-1 py-0.5',
                s.confidence >= threshold
                  ? cn(BAND_META[s.band].bg, BAND_META[s.band].text)
                  : 'text-muted-foreground',
              )}
            >
              {s.confidence.toFixed(1)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
      ))}

      <td className="tabular py-2 pr-3 text-right font-semibold">
        <span
          className={cn(
            h.agree === evaluated && evaluated > 1
              ? 'text-primary'
              : 'text-foreground',
          )}
        >
          {h.agree}/{evaluated}
        </span>
      </td>

      <td className="tabular py-2 pr-3 text-right">
        {pct(h.lead.probability)}
      </td>

      <td
        className={cn(
          'tabular py-2 pr-3 text-right font-semibold',
          h.lead.edge >= 0 ? 'text-up' : 'text-down',
        )}
      >
        {signed(h.lead.edge)}pp
      </td>

      <td className="tabular py-2 pr-3 text-right text-muted-foreground">
        {pct(h.recent, 0)}
      </td>

      <td className="py-2 text-right">
        <button
          onClick={() => onFocus(h.symbol)}
          title="Open in focus dashboard"
          className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] text-muted-foreground hover:border-primary/60 hover:text-foreground"
        >
          <Crosshair className="size-3" />
          Focus
        </button>
      </td>
    </tr>
  )
}
