# Neural Digit Analysis Engine v2.4.0

A dedicated real-time analysis platform for Volatility Index digit contracts. It streams live ticks for ten
Volatility markets at once, analyses the last digit of every tick, and turns the result into scored signals for
**Matches/Differs**, **Even/Odd**, and **Over/Under** contracts.

## Features

- **Multi-market scanner** – V10, V25, V50, V75, V100 and their 1-second variants, ranked live by signal confidence and filterable by contract type.
- **Live tick stream** – real-time price chart, highlighted last digit, digit tape, realised volatility, and feed health (WebSocket round-trip latency, feed lag, ticks per minute).
- **Probability engine** – digit skew analysis (χ² test, per-digit z-scores), best barrier search across every Over/Under barrier, and estimated win probability vs. the random baseline.
- **Confidence scoring** – statistical edge quantification for every signal, grouped into bands; 87–98% is the "strong edge" band, above 98% is "extreme skew".
- **Neural pattern recognition** – an online softmax network trained on every tick (last three digits + parity rhythm), plus a digit transition (Markov) heatmap.
- **Accuracy advantage estimator** – walk-forward tracking: the model commits to a prediction before each tick arrives, and the realised hit rate is compared to the baseline with a 95% confidence interval.
- **Historical insight** – digit frequency drift heatmap, rolling Even and Over-4 rates, and the last 100 digits.

Market data comes from the public, no-auth market data WebSocket (`wss://api.derivws.com/trading/v1/options/ws/public`, with the legacy public endpoint as a fallback). If neither is reachable the app runs a clearly labelled simulated stream and keeps retrying.

> Confidence scores measure how unlikely an observed skew is under pure chance. They are not a guarantee of win rate. Check the accuracy estimator before acting on any signal.

## Tech stack

TanStack Start (React 19), Tailwind CSS 4, shadcn/ui components, lucide icons, deployed on Netlify. All analysis runs in the browser; there is no backend or database.

## Run locally

```bash
pnpm install
netlify dev   # or: pnpm dev
```

Run the unit tests with `pnpm test`.
