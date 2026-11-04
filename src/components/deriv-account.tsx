
import { useCallback, useEffect, useState } from 'react'

interface Account {
  account_id?: string
  loginid?: string
  currency?: string
  account_type?: string
  balance?: number | string
  [key: string]: unknown
}

type AccountMode = 'demo' | 'real'

function getId(account: Account, index: number) {
  return String(account.account_id ?? account.loginid ?? index)
}

function getMode(account: Account): AccountMode | null {
  const type = String(account.account_type ?? '').toLowerCase()
  const login = String(account.loginid ?? '').toLowerCase()

  if (type.includes('demo') || login.startsWith('vrtc')) return 'demo'
  if (type.includes('real') || login.startsWith('cr')) return 'real'

  return null
}

export function DerivAccount() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/deriv/account', {
        credentials: 'same-origin',
        cache: 'no-store',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Unable to load accounts.')
      }

      const list = Array.isArray(result)
        ? result
        : result.accounts ?? result.data?.accounts ?? result.data ?? []

      if (!Array.isArray(list)) {
        throw new Error('Unexpected account response format.')
      }

      const next = list as Account[]
      setAccounts(next)
      setConnected(true)

      setSelectedId(current => {
        if (current && next.some((a, i) => getId(a, i) === current)) {
          return current
        }

        const saved = localStorage.getItem('ticklens-selected-account')
        if (saved && next.some((a, i) => getId(a, i) === saved)) {
          return saved
        }

        const demoIndex = next.findIndex(a => getMode(a) === 'demo')
        return demoIndex >= 0 ? getId(next[demoIndex], demoIndex) : ''
      })
    } catch (err) {
      setConnected(false)
      setAccounts([])
      setSelectedId('')
      setError(err instanceof Error ? err.message : 'Connection failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (window.location.search.includes('deriv=connected')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    void loadAccounts()
  }, [loadAccounts])

  function selectAccount(account: Account, index: number) {
    const id = getId(account, index)
    setSelectedId(id)
    localStorage.setItem('ticklens-selected-account', id)
  }

  const selected = accounts.find((a, i) => getId(a, i) === selectedId)
  const selectedMode = selected ? getMode(selected) : null

  const demoAccount = accounts.find(a => getMode(a) === 'demo')
  const realAccount = accounts.find(a => getMode(a) === 'real')

  return (
    <section className="mb-6 rounded-xl border border-primary/30 bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Deriv Account</h2>
          <p className="text-sm text-muted-foreground">Choose account mode</p>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs">
          {connected ? 'Connected' : 'Not connected'}
        </span>
      </div>

      {!connected ? (
        <a href="/api/deriv/auth"
          className="mt-4 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          Connect Deriv
        </a>
      ) : (
        <>
          <button type="button" onClick={() => void loadAccounts()}
            disabled={loading}
            className="mt-4 rounded-lg border px-4 py-2 text-sm">
            {loading ? 'Refreshing...' : 'Refresh accounts'}
          </button>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!demoAccount}
              onClick={() => {
                const index = accounts.indexOf(demoAccount!)
                selectAccount(demoAccount!, index)
              }}
              className={`rounded-xl border p-4 font-bold ${
                selectedMode === 'demo'
                  ? 'border-green-500 bg-green-500/10 text-green-600'
                  : 'border-border'
              } disabled:opacity-40`}
            >
              {selectedMode === 'demo' ? '✓ Demo Selected' : 'Select Demo'}
            </button>

            <button
              type="button"
              disabled={!realAccount}
              onClick={() => {
                const index = accounts.indexOf(realAccount!)
                selectAccount(realAccount!, index)
              }}
              className={`rounded-xl border p-4 font-bold ${
                selectedMode === 'real'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border'
              } disabled:opacity-40`}
            >
              {selectedMode === 'real' ? '✓ Real Selected' : 'Select Real'}
            </button>
          </div>

          {selected && (
            <p className="mt-3 text-sm font-semibold">
              Active website selection: {selectedMode?.toUpperCase()}
            </p>
          )}

          {accounts.map((account, index) => (
            <div key={getId(account, index)} className="mt-4 rounded-lg border p-3">
              <p className="font-semibold">
                {getMode(account)?.toUpperCase() ?? 'ACCOUNT'} — {String(account.loginid ?? account.account_id ?? index + 1)}
              </p>
              <p className="text-sm text-muted-foreground">
                Currency: {String(account.currency ?? 'Not provided')}
              </p>
              <p className="mt-2 font-bold">
                Balance: {String(account.balance ?? 'Not provided')} {String(account.currency ?? '')}
              </p>
            </div>
          ))}
        </>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <p className="mt-4 text-xs text-muted-foreground">
        Selection controls the website display only. It does not place trades
        or change the public live market feed.
      </p>
    </section>
  )
}
