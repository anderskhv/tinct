// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { claimLegacyEpubAnnotations, syncClaimedLegacyEpubPages, unclaimedLegacyEpubCount, uniqueLegacyWordRange, unresolvedLegacyEpubItems, verifiedLegacyEpubMark } from './legacyEpubMarks'
import { OwnTextMarksSync } from './ownTextMarksSync'
import { OwnTextCardsSync } from './ownTextCardsSync'
import type { UserBookEdition } from './userEdition'

const HEX = 'ab'.repeat(12)
const OWNER = 'owner-a'
const edition: UserBookEdition = { format: 'tinct-user-edition-v1', converter: 7, title: 'Book', author: '', language: 'en', droppedImages: 0,
  chapters: [{ number: 1, title: 'One', paragraphs: ['The opening of the evening was quiet.', 'The same night continued.'] },
    { number: 2, title: 'Two', paragraphs: ['Another heading with different prose.'] }] }
afterEach(() => localStorage.clear())

describe('legacy EPUB annotations', () => {
  it('verifies the static parser page and character offsets before an unambiguous word-range import', () => {
    const source = ['The opening of the evening was quiet. The same night continued.']
    const mark = { id: 'abcd1234', page: 1, start: 4, end: 26, text: 'opening of the evening', color: 'gold', at: 123, note: 'My note' }
    expect(verifiedLegacyEpubMark(mark, source, HEX, edition)).toMatchObject({ id: 'abcd1234', chapterNumber: 1, paragraphIndex: 0,
      fromWord: 1, endParagraphIndex: 0, toWord: 5, note: 'My note', updatedAt: 123 })
    expect(verifiedLegacyEpubMark({ ...mark, start: 5 }, source, HEX, edition)).toBeNull()
    expect(verifiedLegacyEpubMark({ ...mark, page: 2 }, source, HEX, edition)).toBeNull()
  })

  it('does not guess when full words repeat or a character selection cuts a word', () => {
    const repeated = { ...edition, chapters: [{ number: 1, title: 'One', paragraphs: ['foo foo foo'] }] }
    expect(uniqueLegacyWordRange('foo foo', repeated)).toBeNull()
    expect(uniqueLegacyWordRange('ening of the', edition)).toBeNull()
    expect(uniqueLegacyWordRange('The same night', edition)).toEqual({ chapterNumber: 1, paragraphIndex: 1, fromWord: 0, endParagraphIndex: 1, toWord: 3 })
  })

  it('requires explicit account claim and keeps unresolved original text, note and page', () => {
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: OWNER } }))
    localStorage.setItem(`tinct-addbook:hl:epub:${HEX}`, JSON.stringify([{ id: 'abc123', page: 2, start: 0, end: 8, text: 'Old quote', note: 'Precious note', at: 1, color: 'gold' }]))
    localStorage.setItem(`tinct-addbook:cards:epub:${HEX}`, JSON.stringify([{ id: 'card123', kind: 'ask', page: 3, text: 'Question', at: 2,
      turns: [{ role: 'user', content: 'Why is it so?' }, { role: 'assistant', content: 'Because of the old passage.' },
        { role: 'user', content: 'And then?' }, { role: 'assistant', content: 'A further answer.' }], data: { original: true } }]))
    expect(unclaimedLegacyEpubCount(HEX, OWNER)).toBe(2)
    expect(unresolvedLegacyEpubItems(HEX, OWNER)).toEqual([])
    expect(claimLegacyEpubAnnotations(HEX, OWNER)).toBe(true)
    expect(unresolvedLegacyEpubItems(HEX, OWNER)).toEqual([
      { id: 'abc123', kind: 'highlight', text: 'Old quote', note: 'Precious note', page: 2, at: 1 },
      { id: 'card123', kind: 'card', text: 'Question', turns: [{ role: 'user', content: 'Why is it so?' }, { role: 'assistant', content: 'Because of the old passage.' },
        { role: 'user', content: 'And then?' }, { role: 'assistant', content: 'A further answer.' }], data: { original: true }, page: 3, at: 2 },
    ])
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: 'owner-b' } }))
    expect(unresolvedLegacyEpubItems(HEX, 'owner-b')).toEqual([])
    expect(claimLegacyEpubAnnotations(HEX, 'owner-b')).toBe(false)
  })

  it('queues exact supported original-page records in the owner generation and leaves unsupported raw content visible', async () => {
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: OWNER } }))
    const rawMark = { id: 'mark-old', page: 2, start: 0, end: 8, text: 'Old quote', note: 'Precious note', at: 100, color: 'rose' }
    const rawCard = { id: 'card-old', kind: 'ask', page: 2, text: 'Old quote', at: 101,
      rects: [[2, 0.1, 0.2, 0.3, 0.1]], span: [2, 0, 8], turns: [{ role: 'user', content: 'Why?', at: 101, display: 'Why?' }, { role: 'assistant', content: 'Because.', at: 102 }],
      data: { original: true }, note: 'Keep this' }
    const unsupported = { ...rawCard, id: 'card-unsupported', unknownExtra: 'kept locally' }
    localStorage.setItem(`tinct-addbook:hl:epub:${HEX}`, JSON.stringify([rawMark]))
    localStorage.setItem(`tinct-addbook:cards:epub:${HEX}`, JSON.stringify([rawCard, unsupported]))
    expect(claimLegacyEpubAnnotations(HEX, OWNER)).toBe(true)
    const fileId = 'a'.repeat(32)
    const requests: Array<{ route: string; body: { marks?: unknown[]; cards?: unknown[]; expectedFileId: string } }> = []
    const fetchImpl = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PUT') requests.push({ route: String(url), body: JSON.parse(String(init.body)) })
      return new Response(JSON.stringify(init?.method === 'PUT' ? { rev: 1, fileId }
        : String(url).includes('/marks/') ? { marks: [], rev: 0, fileId } : { cards: [], rev: 0, fileId }), { status: 200 })
    })
    const marks = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'token', fetchImpl as typeof fetch, fileId)
    const cards = new OwnTextCardsSync(HEX, OWNER, edition, async () => 'token', fetchImpl as typeof fetch, fileId)
    expect(syncClaimedLegacyEpubPages(HEX, OWNER, marks, cards)).toEqual({ queued: 2, keptLocal: 1 })
    const markSet = JSON.parse(localStorage.getItem(`tinct-addbook:text-marks-canonical:${OWNER}:${HEX}:${fileId}`)!)
    const cardSet = JSON.parse(localStorage.getItem(`tinct-addbook:text-cards-canonical:${OWNER}:${HEX}:${fileId}`)!)
    expect(markSet.items).toContainEqual({ v: 'epub-page-v1', ...rawMark })
    expect(cardSet.items).toContainEqual({ v: 'epub-page-v1', ...rawCard })
    expect(cardSet.items.some((item: { id: string }) => item.id === unsupported.id)).toBe(false)
    expect(unresolvedLegacyEpubItems(HEX, OWNER).map(item => item.id)).toContain(unsupported.id)
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:legacy-epub-annotations:${OWNER}:${HEX}`)!).cards).toContainEqual(unsupported)
    await marks.open(); await cards.open()
    expect(requests.find(item => item.route.includes('/marks/'))?.body).toMatchObject({ expectedFileId: fileId, marks: [{ v: 'epub-page-v1', id: rawMark.id }] })
    expect(requests.find(item => item.route.includes('/cards/'))?.body).toMatchObject({ expectedFileId: fileId, cards: [{ v: 'epub-page-v1', id: rawCard.id }] })
    marks.dispose(); cards.dispose()
  })
})
