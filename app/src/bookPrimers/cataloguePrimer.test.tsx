// @vitest-environment jsdom
import { act } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { waitFor, within } from '@testing-library/react'
import { mountCataloguePrimer } from './cataloguePrimer'
import { fetchChapterNotes } from '../lab/labChapterNotes'
vi.mock('../lab/labChapterNotes', () => ({ fetchChapterNotes: vi.fn() }))
let dispose: (() => void) | undefined
afterEach(() => { act(() => dispose?.()); document.body.replaceChildren(); vi.clearAllMocks() })
it('requests the same whole-book edition and renders nested shared content', async () => {
  const target = document.createElement('div'); document.body.append(target)
  vi.mocked(fetchChapterNotes).mockResolvedValue({ ok: true, beats: [], primer: {
    identity: { scope: { kind: 'public' }, workId: 'novel', editionId: 'edition', sourceVersion: 'hash', unitId: null, type: 'book', language: 'en' },
    origin: 'generated', createdAt: '2026-10-28T00:00:00Z', promptVersion: 'book-primer-1', resources: [],
    content: { opening: 'An opening shared with the reader.', structure: [{ title: 'Letters', explanation: 'The book begins with letters.' }], peopleAndIdeas: [], helpfulContext: [], whatToNotice: [], usefulReferences: [] },
  } })
  act(() => { dispose = mountCataloguePrimer(target, { id: 'novel', editionKey: 'edition', language: 'en' }, async () => null) })
  await waitFor(() => expect(within(target).getByText('An opening shared with the reader.')).toBeTruthy())
  expect(fetchChapterNotes).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'novel', editionKey: 'edition', primerType: 'book', format: 'structured-primer', language: 'en' }), expect.anything())
  expect(target.querySelectorAll('details')).toHaveLength(2)
})
it('does not render a late response after the book closes', async () => {
  const target = document.createElement('div'); document.body.append(target)
  let finish!: (value: any) => void
  vi.mocked(fetchChapterNotes).mockReturnValue(new Promise(resolve => { finish = resolve }))
  act(() => { dispose = mountCataloguePrimer(target, { id: 'novel', editionKey: 'edition', language: 'en' }, async () => null) })
  act(() => { dispose?.(); dispose = undefined })
  await act(async () => finish({ ok: false, status: 422, sourceUnavailable: true }))
  expect(target.textContent).toBe('')
})
