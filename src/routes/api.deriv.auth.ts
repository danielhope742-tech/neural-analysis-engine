
import { createFileRoute } from '@tanstack/react-router'
import {
  createPkcePair,
  encryptSession,
  randomToken,
} from '@/lib/deriv/oauth-session'

const REDIRECT_URI =
  'https://neural-analysis-engine.netlify.app/auth/callback'

export const Route = createFileRoute('/api/deriv/auth')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const appId = process.env.DERIV_APP_ID
          const secret = process.env.DERIV_SESSION_SECRET

          if (!appId || !secret) {
            return new Response(
              'Server configuration is incomplete. Set DERIV_APP_ID and DERIV_SESSION_SECRET in Netlify.',
              { status: 500 },
            )
          }

          const { verifier, challenge } = await createPkcePair()
          const state = randomToken(32)

          const pendingSession = await encryptSession(
            {
              state,
              verifier,
              createdAt: Date.now(),
            },
            secret,
          )

          const authUrl = new URL(
            'https://auth.deriv.com/oauth2/auth',
          )

          authUrl.searchParams.set('response_type', 'code')
          authUrl.searchParams.set('client_id', appId)
          authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
          authUrl.searchParams.set('scope', 'trade')
          authUrl.searchParams.set('state', state)
          authUrl.searchParams.set('code_challenge', challenge)
          authUrl.searchParams.set(
            'code_challenge_method',
            'S256',
          )

          return new Response(null, {
            status: 302,
            headers: {
              Location: authUrl.toString(),
              'Set-Cookie': [
                `deriv_oauth=${encodeURIComponent(pendingSession)}`,
                'Path=/',
                'HttpOnly',
                'Secure',
                'SameSite=Lax',
                'Max-Age=600',
              ].join('; '),
              'Cache-Control': 'no-store',
            },
          })
        } catch {
          return new Response(
            'Could not start Deriv authorization. Please try again.',
            { status: 500 },
          )
        }
      },
    },
  },
})
