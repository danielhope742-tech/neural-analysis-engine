
import { useCallback, useEffect, useState } from 'react'

interface Account {
  account_id?: string
  loginid?: string
  currency?: string
  account_type?: string
  balance?: number | string
  [key: string]: unknown
}

export function DerivAccount() {
  const [accounts, setAccounts] = useState<Account[]>([])
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
        setConnected(false)
        setAccounts([])
        throw new Error(result.error || 'Unable to load accounts.')
      }

      const list = Array.isArray(result)
        ? result
        : result.accounts ??
          result.data?.accounts ??
          result.data ??
          []

      if (!Array.isArray(list)) {
        throw new Error('Unexpected account response format.')
      }

      setAccounts(list)
      setConnected(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Connection failed.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (window.location.search.includes('deriv=connected')) {
      window.history.replaceState({}, '', window.location.pathname)
      void loadAccounts()
    }
  }, [loadAccounts])

  return (
    <section className="mb-6 rounded-xl border border-primary/30 bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Deriv Account</h2>
          <p className="text-sm text-muted-foreground">
            Secure account connection
          </p>
        </div>

        <span className="rounded-full border px-3 py-1 text-xs">
          {connected ? 'Connected' : 'Not connected'}
        </span>
      </div>

      {!connected ? (
        <a
          href="/api/deriv/auth"
          className="mt-4 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Connect Deriv
        </a>
      ) : (
        <button
          type="button"
          onClick={() => void loadAccounts()}
          disabled={loading}
          className="mt-4 rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh accounts'}
        </button>
      )}

      {error && (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      )}

      {accounts.map((account, index) => (
        <div
          key={String(account.account_id ?? account.loginid ?? index)}
          className="mt-4 rounded-lg border p-3"
        >
          <p className="font-semibold">
            Account {String(account.account_id ?? account.loginid ?? index + 1)}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Type: {String(account.account_type ?? 'Not provided')}
          </p>

          <p className="text-sm text-muted-foreground">
            Currency: {String(account.currency ?? 'Not provided')}
          </p>

          <p className="mt-2 text-lg font-bold">
            Balance:{' '}
            {account.balance !== undefined
              ? `${String(account.balance)} ${String(account.currency ?? '')}`
              : 'Not provided by account list'}
          </p>
        </div>
      ))}

      <p className="mt-4 text-xs text-muted-foreground">
        Account information only. This panel does not place trades.
      </p>
    </section>
  )
}
