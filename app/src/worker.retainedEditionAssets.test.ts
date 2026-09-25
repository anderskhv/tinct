import { afterEach, describe, expect, it, vi } from 'vitest'

// Reproduce generated production metadata after discovery holds are applied.
vi.mock('./data/bookMetaGenerated', () => ({ GENERATED_BOOK_META: {} }))
import { handleSeoAndStaticRequest } from './worker/routes/seo'
import manifest from './data/editionAvailability.json'

afterEach(() => vi.unstubAllGlobals())

describe('retained edition assets outside discovery metadata', () => {
  for (const identity of Object.keys(manifest.editions)) {
    it('serves the preserved JSON for ' + identity, async () => {
      vi.stubGlobal('caches', { default: { match: async () => undefined, put: async () => undefined } })
      const [book, edition] = identity.split('/')
      const url = 'https://tinct.app/data/editions/' + book + '-' + edition + '.json?v=release'
      const bytes = JSON.stringify({ preserved: identity })
      const fetch = vi.fn(async (_request: Request) => new Response(bytes, { headers: { 'Content-Type': 'application/json' } }))
      const response = await handleSeoAndStaticRequest(new Request(url), { ASSETS: { fetch } }, { waitUntil() {} } as unknown as ExecutionContext)
      expect(response.status).toBe(200)
      expect(await response.text()).toBe(bytes)
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch.mock.calls[0]?.[0].url).toBe(url)
    })
  }
  it('does not admit an unknown book into the raw asset allowlist', async () => {
    const fetch = vi.fn()
    const response = await handleSeoAndStaticRequest(new Request('https://tinct.app/data/editions/not-a-book-original-en.json'), { ASSETS: { fetch } }, { waitUntil() {} } as unknown as ExecutionContext)
    expect(response.status).toBe(404)
    expect(fetch).not.toHaveBeenCalled()
  })
})
