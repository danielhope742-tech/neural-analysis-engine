
import { createFileRoute } from '@tanstack/react-router'
import {
  decryptSession,
  encryptSession,
  parseCookies,
  sessionCookie,
} from '@/lib/deriv/oauth-session'

const APP_ID = process.env.DERIV_APP_ID
const SESSION_SECRET = process.env.DERIV_SESSION_SECRET

const REDIRECT_URI =
  'https://neural-analysis-engine.netlify.app/auth/callback'

interface PendingSession {
  state: string
  verifier: string
  createdAt: number
}

interface TokenResponse {
  access_token?: string
  expires_in?: number
  token_type?: string
  error?: string
  error_description?: string
}

export const Route = createFileRoute('/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clearPending =
          'deriv_oauth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'

        try {
          if (!APP_ID || !SESSION_SECRET) {
            return new Response('Server configuration missing.', {
              status: 500,
            })
          }

          const url = new URL(request.url)
          const code = url.searchParams.get('code')
          const returnedState = url.searchParams.get('state')
          const oauthError = url.searchParams.get('error')

          if (oauthError) {
            return new Response(
              'Deriv authorization was cancelled or denied. Please try again.',
              {
                status: 400,
                headers: { 'Set-Cookie': clearPending },
              },
            )
          }

          if (!code || !returnedState) {
            return new Response('Missing authorization code or state.', {
              status: 400,
              headers: { 'Set-Cookie': clearPending },
            })
          }

          const cookies = parseCookies(
            request.headers.get('cookie'),
          )

          const pendingValue = cookies.deriv_oauth

          if (!pendingValue) {
            return new Response(
              'Login session expired. Please start again.',
              {
                status: 400,
                headers: { 'Set-Cookie': clearPending },
              },
            )
          }

          const pending = await decryptSession<PendingSession>(
            pendingValue,
            SESSION_SECRET,
          )

          if (
            !pending ||
            pending.state !== returnedState ||
            !pending.verifier ||
            Date.now() - pending.createdAt > 10 * 60 * 1000
          ) {
            return new Response(
              'Login verification failed. Please start again.',
              {
                status: 400,
                headers: { 'Set-Cookie': clearPending },
              },
            )
          }

          const body = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: APP_ID,
            code,
            code_verifier: pending.verifier,
            redirect_uri: REDIRECT_URI,
          })

          const tokenResponse = await fetch(
            'https://auth.deriv.com/oauth2/token',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/x-www-form-urlencoded',
              },
              body,
            },
          )

          const tokenData =
            (await tokenResponse.json()) as TokenResponse

          if (
            !tokenResponse.ok ||
            !tokenData.access_token ||
            !tokenData.expires_in
          ) {
            return new Response(
              'Deriv could not complete authorization. Please try again.',
              {
                status: 401,
                headers: { 'Set-Cookie': clearPending },
              },
            )
          }

          const encryptedSession = await encryptSession(
            {
              accessToken: tokenData.access_token,
              expiresAt:
                Date.now() + tokenData.expires_in * 1000,
              tokenType: tokenData.token_type ?? 'Bearer',
            },
            SESSION_SECRET,
          )

          const headers = new Headers()
          headers.set('Location', '/?deriv=connected')
          headers.set('Cache-Control', 'no-store')
          headers.append(
            'Set-Cookie',
            sessionCookie(
              encryptedSession,
              Math.min(tokenData.expires_in, 2592000),
            ),
          )
          headers.append('Set-Cookie', clearPending)

          return new Response(null, {
            status: 303,
            headers,
          })
        } catch {
          return new Response(
            'An error occurred while connecting Deriv. Please try again.',
            {
              status: 500,
              headers: { 'Set-Cookie': clearPending },
            },
          )
        }
      },
    },
  },
})
