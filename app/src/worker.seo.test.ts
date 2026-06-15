import { describe, expect, it } from 'vitest'
import { serveSpaWithMetaForTest } from './worker'

function envWithAppShell(html = '<!doctype html><html><head><title>Tinct — A New Way to Read</title></head><body>app</body></html>') {
  return {
    ASSETS: {
      fetch: async () => new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    },
  }
}

describe('worker SEO SPA metadata', () => {
  it('injects book metadata and Book JSON-LD into /read book shells', async () => {
    const resp = await serveSpaWithMetaForTest(
      'GET',
      new URL('https://tinct.app/read/odyssey'),
      envWithAppShell() as never,
      {
        title: 'Read The Odyssey Online | Tinct',
        description: 'Read the Odyssey online with modern editions and an AI reading companion.',
        bookName: 'The Odyssey',
        author: 'Homer',
      },
      'https://tinct.app/read/odyssey',
      'book',
    )

    expect(resp).not.toBeNull()
    expect(resp?.headers.get('Cache-Control')).toBe('no-store')
    const html = await resp!.text()
    expect(html).toContain('<title>Read The Odyssey Online | Tinct</title>')
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/read/odyssey">')
    expect(html).toContain('"@type":"Book"')
    expect(html).toContain('"name":"The Odyssey"')
    expect(html).toContain('"name":"Homer"')
  })

  it('escapes HTML meta fields while preserving JSON-LD strings', async () => {
    const resp = await serveSpaWithMetaForTest(
      'GET',
      new URL('https://tinct.app/read/test-book'),
      envWithAppShell() as never,
      {
        title: 'Bad <title> "quoted"',
        description: 'Description with <script>alert(1)</script> & quotes',
        bookName: 'Bad <Book>',
        author: 'Author "Name"',
      },
      'https://tinct.app/read/test-book',
      'book',
    )

    const html = await resp!.text()
    expect(html).toContain('<title>Bad &lt;title&gt; &quot;quoted&quot;</title>')
    expect(html).toContain('content="Description with &lt;script&gt;alert(1)&lt;/script&gt; &amp; quotes"')
    expect(html).toContain('"name":"Bad <Book>"')
    expect(html).toContain('"name":"Author \\"Name\\""')
  })

  it('returns no body for HEAD while keeping SEO headers', async () => {
    const resp = await serveSpaWithMetaForTest(
      'HEAD',
      new URL('https://tinct.app/read/odyssey'),
      envWithAppShell() as never,
      {
        title: 'Read The Odyssey Online | Tinct',
        description: 'Read the Odyssey online with modern editions and an AI reading companion.',
        bookName: 'The Odyssey',
        author: 'Homer',
      },
      'https://tinct.app/read/odyssey',
      'book',
    )

    expect(resp?.status).toBe(200)
    expect(resp?.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    expect(await resp!.text()).toBe('')
  })
})
