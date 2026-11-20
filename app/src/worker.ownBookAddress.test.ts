import { describe, expect, it } from 'vitest'
import worker from './worker'

// One own book, one address (22 Oct 2026): the old Add a book links redirect to the reader; the margin reader's
// own page (/lab/addbook/book, the reader's frame) and an old hand-off link are still served as they are.
const HEX = 'aa11bb22cc33dd44ee55ff66'
function env() {
  return {
    ASSETS: {
      fetch: async (request: Request) => {
        const url = new URL(request.url)
        if (url.pathname === '/lab/addbook/' || url.pathname === '/lab/addbook/book') return new Response('<!doctype html><title>page</title>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        return new Response('Not found', { status: 404 })
      },
    },
  }
}
const ctx = { waitUntil: () => undefined } as unknown as ExecutionContext
const get = (path: string) => worker.fetch(new Request('https://tinct.app' + path), env() as never, ctx)

describe("an own book's old address", () => {
  it('redirects to /reader?userBook=<hex>, keeping a page asked for', async () => {
    for (const [from, to] of [
      [`/lab/addbook/?userBook=${HEX}`, `/reader?userBook=${HEX}`],
      [`/lab/addbook/?open=pdf:${HEX}`, `/reader?userBook=${HEX}`],
      [`/lab/addbook/?userBook=${HEX}&page=4&frac=0.5&pages`, `/reader?userBook=${HEX}&page=4&frac=0.5&pages=`],
    ]) {
      const response = await get(from)
      expect(response.status).toBe(308)
      expect(response.headers.get('Location')).toBe(to)
    }
  })

  it('still serves the frame page and an old hand-off link', async () => {
    expect((await get(`/lab/addbook/book?userBook=${HEX}`)).status).toBe(200)
    expect((await get('/lab/addbook/?mode=file&handoff=1')).status).toBe(200)
  })
})
