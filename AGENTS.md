# AGENTS.md

## Project overview

Neural Digit Analysis Engine v2.4.0: a single-screen, client-side dashboard that streams Volatility Index ticks over a public WebSocket and analyses last-digit behaviour for Matches/Differs, Even/Odd and Over/Under contracts. No backend, no database, no auth.

Stack: TanStack Start + React 19, Tailwind CSS 4 (theme variables in `src/styles.css`, always dark), shadcn/ui in `src/components/ui`, deployed to Netlify.

## Architecture

```
src/lib/deriv/
  markets.ts          Market catalogue (symbols, default pip size, tick interval) + feed endpoints
  client.ts           MarketFeed: one WebSocket, ticks_history+subscribe per market, ping RTT, reconnect/backoff,
                      endpoint fallback, simulated-feed fallback when nothing is reachable
  use-market-feed.ts  React hook: starts the feed on mount (client-only) and bumps a `frame` counter every 400 ms
src/lib/engine/
  stats.ts            Normal CDF, chi-square p-value, Wilson interval, entropy
  model.ts            DigitNet: online softmax regression (last 3 digits one-hot + 5-tick parity + bias)
  symbol-engine.ts    Per-market mutable state: prices/epochs/digits (cap 5000), model, walk-forward outcome buffers
  analyzer.ts         analyze(engine, window) → Analysis (distribution, signals, confidence, accuracy, transitions)
  scanner.ts          scanMarkets(engines, opts): all 40 digit contracts × markets × windows, ranked by window agreement
src/components/engine/  Dashboard panels (deep scanner, sidebar scanner, stream, skew, probability engine, neural, accuracy, history)
src/routes/index.tsx    The dashboard page
```

## Key decisions

- **Engines live outside React.** Ticks mutate `SymbolEngine` instances in place; React re-renders on a fixed cadence (`frame`) so bursts of ticks across ten markets don't cause render storms. `analyze()` is pure and recomputed per frame.
- **Predict-then-learn.** In `SymbolEngine.ingest`, the model's prediction is recorded *before* it trains on the new digit. That is what makes the accuracy estimator an honest out-of-sample measure. Keep it that way.
- **Confidence = Φ(z)** of the observed rate vs the uniform baseline, capped at 99.9. Bands: <70 noise, 70–87 developing, 87–98 strong, ≥98 extreme (`bandOf` in `analyzer.ts`). This is statistical confidence, not a win rate; UI copy must not claim guaranteed accuracy.
- **Last digit** comes from `quote.toFixed(pip_size)`, using the pip size reported by the feed.
- The simulated feed exists only so the UI works when the public endpoint is unreachable; it is always labelled in the UI.

## Conventions

- Use theme variable classes (`bg-primary`, `text-accent`, `text-up`, `text-down`, `font-display`, `.tabular` for numbers) instead of raw colours.
- Charts are hand-rolled SVG in `components/engine/charts.tsx`; no chart library.
- Unit tests for the engine live in `src/lib/engine/engine.test.ts` (vitest).

## Possible next steps

Saved watchlists/alerts (would need Netlify Database + Identity), authenticated trading via the OTP WebSocket flow, and sound/push alerts when a market enters the strong band.
