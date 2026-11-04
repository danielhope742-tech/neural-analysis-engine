import { useEffect, useState } from 'react'
import { MarketFeed, type FeedSnapshot } from './client'
import { MARKETS } from './markets'

const INITIAL: FeedSnapshot = {
  status: 'connecting',
  endpoint: null,
  rttMs: null,
  feedLagMs: null,
  ticksPerMin: 0,
  error: null,
}

/**
 * Starts one MarketFeed for every market on mount (client only) and re-renders
 * at a fixed cadence so analysis stays smooth regardless of tick bursts.
 */
export function useMarketFeed(refreshMs = 400) {
  const [feed, setFeed] = useState<MarketFeed | null>(null)
  const [frame, setFrame] = useState(0)
  const [snapshot, setSnapshot] = useState<FeedSnapshot>(INITIAL)

  useEffect(() => {
    const feed = new MarketFeed(MARKETS.map((m) => m.symbol))
    setFeed(feed)
    feed.start()
    let lastVersion = -1
    const id = window.setInterval(() => {
      let v = 0
      for (const e of feed.engines.values()) v += e.version
      if (v !== lastVersion) {
        lastVersion = v
        setFrame((f) => f + 1)
      }
      setSnapshot(feed.snapshot)
    }, refreshMs)
    return () => {
      clearInterval(id)
      feed.stop()
      setFeed(null)
    }
  }, [refreshMs])

  return { feed, frame, snapshot }
}
