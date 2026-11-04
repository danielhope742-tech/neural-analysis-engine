
import { createFileRoute } from '@tanstack/react-router'
import {
  decryptSession,
  parseCookies,
} from '@/lib/deriv/oauth-session'

interface DerivSession {
  accessToken: string
  expiresAt: number
  tokenType: string
}

export const Route = createFileRoute('/api/deriv/account')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const secret = process.env.DERIV_SESSION_SECRET

          if (!secret) {
            return Response.json(
              { error: 'Server configuration missing.' },
              { status: 500 },
            )
          }

          const cookies = parseCookies(
            request.headers.get('cookie'),
          )

          const encrypted = cookies.deriv_session

          if (!encrypted) {
            return Response.json(
              { error: 'Not connected. Please connect Deriv first.' },
              { status: 401 },
            )
          }

          const session = await decryptSession<DerivSession>(
            encrypted,
            secret,
          )

          if (
            !session ||
            !session.accessToken ||
            session.expiresAt <= Date.now()
          ) {
            return Response.json(
              { error: 'Session expired. Please connect again.' },
              { status: 401 },
            )
          }

          const response = await fetch(
            'https://api.derivws.com/trading/v1/options/accounts',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                Accept: 'application/json',
              },
              cache: 'no-store',
            },
          )

          const result = await response.json()

          if (!response.ok) {
            return Response.json(
              {
                error:
                  response.status === 401
                    ? 'Deriv authorization expired. Please reconnect.'
                    : 'Unable to retrieve Deriv account details.',
              },
              { status: response.status },
            )
          }

          return Response.json(result, {
            headers: {
              'Cache-Control': 'no-store',
            },
          })
        } catch {
          return Response.json(
            { error: 'Could not retrieve account information.' },
            { status: 500 },
          )
        }
      },
    },
  },
})
