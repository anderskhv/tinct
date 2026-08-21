import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isCapacitor = process.env.CAPACITOR === 'true'

  // Cloudflare Workers Builds has no app/.env. These are public client values
  // already required by verify-bundle and present in the live browser bundle.
  // Local builds still fail loudly if .env is missing.
  if (command === 'build' && (process.env.CI || process.env.WORKERS_CI)) {
    const publicClientEnv: Record<string, string> = {
      VITE_SUPABASE_URL: 'https://yazjyiqsxjystvpkyouk.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhemp5aXFzeGp5c3R2cGt5b3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTA2MTQsImV4cCI6MjA4OTU4NjYxNH0.VyNjCyb5Tc1T1wx5nwZsvWGmwK67FHaB2Ptrtu4EeJA',
      VITE_AUDIO_BASE_URL: 'https://tinct.app',
    }
    for (const [key, value] of Object.entries(publicClientEnv)) {
      if (!env[key]) {
        env[key] = value
        process.env[key] = value
      }
    }
  }

  // Guard: production builds (web AND Capacitor/Android) must ship with
  // Supabase + audio env vars baked in. A silent build with empty
  // VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY shipped an "Auth not configured"
  // outage to tinct.app twice on 2026-04-22/23 — the Supabase client init
  // returns null when these are empty, every auth call returns "Auth not
  // configured", and there's no server-side signal to catch it. Fail loudly.
  if (command === 'build' && !process.env.SKIP_ENV_CHECK) {
    const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_AUDIO_BASE_URL']
    const missing = required.filter(k => !env[k])
    if (missing.length) {
      throw new Error(
        `\n\n✗ Build aborted: required env vars are missing:\n  ${missing.join('\n  ')}\n\n` +
        `These must be set in .env (same directory as vite.config.ts) before running npm run build.\n` +
        `Without them, the deployed app will have broken auth and audio and will NOT show errors at build time.\n\n` +
        `If you're sure you want to proceed (e.g. offline dev preview), set SKIP_ENV_CHECK=1.\n`
      )
    }
  }

  // Stable per-build identifier used to cache-bust /data/editions/*.json
  // requests on republish (the JSONs themselves are not content-hashed). In
  // dev we pin to "dev" so the param doesn't churn on every HMR cycle.
  const buildVersion = command === 'build'
    ? `${Date.now().toString(36)}`
    : 'dev'

  return {
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion),
  },
  base: isCapacitor ? './' : '/',
  plugins: [
    react(),
    {
      name: 'anthropic-proxy',
      configureServer(server) {
        // Production has a build-time swap: `mv dist/index.html dist/app.html
        // && cp dist/landing.html dist/index.html`. So `/` serves the static
        // landing page in prod. Dev doesn't run that swap, so `/` would serve
        // the SPA — making sign-out (which redirects to `/`) drop the user
        // into the BookStore instead of the landing page. Mirror the swap
        // in dev: at `/` (and `/index.html`), serve `public/landing.html`.
        // SPA still reachable at `/read` and friends.
        server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
          const url = req.url || ''
          // Strip query string for the path comparison
          const pathOnly = url.split('?')[0]
          if (pathOnly === '/' || pathOnly === '/index.html') {
            const landingPath = path.join(process.cwd(), 'public', 'landing.html')
            if (fs.existsSync(landingPath)) {
              res.writeHead(200, { 'Content-Type': 'text/html' })
              fs.createReadStream(landingPath).pipe(res)
              return
            }
          }
          next()
        })

        // Mirror the Cloudflare worker's clean-URL rewrite for the per-book
        // SEO pages so links like /read/odyssey/summary work in local dev too.
        // Without this, Vite falls through to the SPA and the user sees the
        // book-onboarding modal instead of the static SEO page. Regex must
        // match the worker's seoMatch in src/worker.ts.
        server.middlewares.use((req: IncomingMessage, _res: ServerResponse, next: () => void) => {
          const url = req.url || ''
          const m = url.match(/^\/read\/([a-z0-9-]+)\/(summary|chapters|cast|themes|chapter-\d+|\d+)\/?(\?.*)?$/i)
          if (m) {
            req.url = `/read/${m[1]}/${m[2]}.html${m[3] || ''}`
          }
          next()
        })

        server.middlewares.use('/api/voice-session', async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || ''
          if (!openaiKey) {
            res.writeHead(503, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Voice is not configured. Set the OPENAI_API_KEY Worker secret.' }))
            return
          }

          try {
            const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${openaiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                session: {
                  type: 'realtime',
                  model: 'gpt-realtime-2.1-mini',
                  audio: { output: { voice: 'marin' } },
                },
              }),
            })
            const data = await response.json() as { value?: string; expires_at?: number; error?: { message?: string } }
            if (!response.ok || !data.value) {
              res.writeHead(response.status >= 400 ? response.status : 502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: data.error?.message || 'Could not start a voice session.' }))
              return
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              value: data.value,
              expires_at: data.expires_at ?? null,
              model: 'gpt-realtime-2.1-mini',
            }))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Proxy error', details: String(err) }))
          }
        })

        server.middlewares.use('/api/chat', async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.writeHead(405)
            res.end('Method not allowed')
            return
          }

          const apiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || ''
          if (!apiKey) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: { message: 'API key not configured. Set ANTHROPIC_API_KEY in .env' } }))
            return
          }

          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body)
              const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': apiKey,
                  'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                  model: 'claude-sonnet-4-20250514',
                  max_tokens: Math.min(parsed.max_tokens || 1024, 2048),
                  system: typeof parsed.system === 'string' ? parsed.system.slice(0, 4000) : '',
                  messages: Array.isArray(parsed.messages) ? parsed.messages.slice(0, 50) : [],
                }),
              })

              const data = await response.json()
              res.writeHead(response.status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(data))
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Proxy error', details: String(err) }))
            }
          })
        })

        // Dev stub for create-checkout (returns mock URL)
        server.middlewares.use('/api/create-checkout', async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.writeHead(405)
            res.end('Method not allowed')
            return
          }
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ url: null, message: 'Stripe checkout not available in dev mode. Configure Supabase and Stripe for production.' }))
        })

        // Serve audio files from project-root audio/ directory (not in public/ to avoid bloating dist/)
        server.middlewares.use('/audio', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          const filePath = path.join(process.cwd(), 'audio', decodeURIComponent(req.url || ''))
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase()
            const mimeTypes: Record<string, string> = {
              '.mp3': 'audio/mpeg',
              '.wav': 'audio/wav',
              '.json': 'application/json',
            }
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })

        // Dev stub for balance
        server.middlewares.use('/api/balance', async (req: IncomingMessage, res: ServerResponse) => {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ balance_cents: 200, total_tokens_used: 0 }))
        })
      },
    },
  ],
  server: {
    port: 3001,
    // host: true binds to 0.0.0.0 so phones on the same WiFi can reach the
    // dev server (e.g. http://<mac-lan-ip>:3001). Safe in dev. If you ever
    // join an untrusted network, comment this back out.
    host: true,
  },
}
})
