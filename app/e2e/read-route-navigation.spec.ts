import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import worker from '../src/worker'

const hubHtml = readFileSync(new URL('../public/read/index.html', import.meta.url), 'utf8')

let server: Server
let origin: string

test.beforeAll(async () => {
  const env = {
    ASSETS: {
      fetch: async (request: Request) => {
        const pathname = new URL(request.url).pathname
        // Mirror Cloudflare's auto-trailing-slash handling. This redirect is
        // the production behavior that previously escaped from the Worker.
        if (pathname === '/read/index.html') {
          return new Response(null, { status: 307, headers: { Location: '/read/' } })
        }
        if (pathname === '/read/') {
          return new Response(hubHtml, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        }
        return new Response('Not found', { status: 404 })
      },
    },
  }
  const ctx = { waitUntil: () => undefined } as unknown as ExecutionContext

  server = createServer(async (incoming, outgoing) => {
    try {
      const request = new Request(`${origin}${incoming.url || '/'}`, {
        method: incoming.method,
        headers: incoming.headers as HeadersInit,
      })
      const response = await worker.fetch(request, env as never, ctx)
      outgoing.statusCode = response.status
      response.headers.forEach((value, key) => outgoing.setHeader(key, value))
      outgoing.end(Buffer.from(await response.arrayBuffer()))
    } catch (error) {
      outgoing.statusCode = 500
      outgoing.end(error instanceof Error ? error.message : String(error))
    }
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') return reject(new Error('Could not resolve test server address'))
      origin = `http://127.0.0.1:${address.port}`
      resolve()
    })
  })
})

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
})

for (const pathname of ['/read', '/read/']) {
  test(`direct browser navigation to ${pathname} renders the legacy library without redirecting`, async ({ page }) => {
    const response = await page.goto(`${origin}${pathname}`, { waitUntil: 'domcontentloaded' })

    expect(response?.status()).toBe(200)
    expect(new URL(page.url()).pathname).toBe(pathname)
    await expect(page.getByRole('heading', { level: 1, name: 'The Library' })).toBeVisible()
  })
}
