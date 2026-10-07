/**
 * /your-reading (social ship 1) is a page only while SOCIAL_READING_TIME is
 * on. Off, the URL answers exactly as before the feature existed, and the
 * asset folder behind it is not a page.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import worker from './worker'
import { handleSeoAndStaticRequest } from './worker/routes/seo'

const PAGES: Record<string, string> = {
  '/lab/your-reading/': 'public/lab/your-reading/index.html',
  '/404.html': 'public/404.html',
}

function env(extra: Record<string, string> = {}) {
  return {
    ...extra,
    ASSETS: {
      fetch: async (request: Request) => {
        const file = PAGES[new URL(request.url).pathname]
        return file
          ? new Response(readFileSync(file, 'utf8'), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
          : new Response('nf', { status: 404 })
      },
    },
  }
}

const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
const get = (path: string) => new Request(`https://tinct.app${path}`)

describe('/your-reading', () => {
  it('switch off: answers exactly as the site did without it', async () => {
    const viaWorker = await worker.fetch(get('/your-reading'), env() as never, ctx)
    const before = await handleSeoAndStaticRequest(get('/your-reading'), env() as never, ctx)
    expect(viaWorker.status).toBe(before.status)
    expect(await viaWorker.text()).toBe(await before.text())
    expect((await worker.fetch(get('/lab/your-reading/'), env() as never, ctx)).status).toBe(404)
  })

  it('switch on: the page, not indexed', async () => {
    const response = await worker.fetch(get('/your-reading?return=%2Freader'), env({ SOCIAL_READING_TIME: '1' }) as never, ctx)
    expect(response.status).toBe(200)
    expect(response.headers.get('X-Robots-Tag')).toContain('noindex')
    const html = await response.text()
    expect(html).toContain('id="tinct-your-reading"')
    expect(html).toContain('/lab/your-reading-runtime.js')
  })
})
