import { afterEach, expect, it, vi } from 'vitest'
import { researchVoiceQuestion } from './labVoiceResearch'

afterEach(() => vi.unstubAllGlobals())

it('announces chat citations only after a successful sourced lookup', async () => {
  const sources = [{ title: 'Source archive', url: 'https://example.com/source' }]
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, notes: 'Research notes.', sources }))))
  const result = await researchVoiceQuestion('A public reading question', 'test-token')
  expect(result.sources).toEqual(sources)
  expect(result.responseInstructions).toContain("I've added the source links in chat.")
  expect(result.responseInstructions).toContain('without reading URLs aloud')
})

it.each([
  { ok: false, notes: 'Unavailable', sources: [] },
  { ok: true, notes: 'Unsourced notes', sources: [] },
  { ok: true, notes: '', sources: [{ title: 'Source', url: 'https://example.com' }] },
  { ok: true, notes: 'Notes', sources: [{ title: 'Invalid', url: 'javascript:alert(1)' }] },
  { ok: true, notes: 'Notes', sources: [null] },
])('does not promise links for unsuccessful or unusable research: %j', async body => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body))))
  const result = await researchVoiceQuestion('A question', 'test-token')
  expect(result.output).toMatchObject({ ok: false })
  expect(result.sources).toBeUndefined()
  expect(result.responseInstructions).toContain('Do not say source links were added')
})

it('does not claim links when signed out', async () => {
  const fetcher = vi.fn()
  vi.stubGlobal('fetch', fetcher)
  const result = await researchVoiceQuestion('A question', null)
  expect(fetcher).not.toHaveBeenCalled()
  expect(result.output).toMatchObject({ ok: false, reason: 'sign_in_required' })
  expect(result.responseInstructions).toContain('Do not say source links were added')
})
