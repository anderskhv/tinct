import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [
    react(),
    {
      name: 'anthropic-proxy',
      configureServer(server) {
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
  },
}
})
