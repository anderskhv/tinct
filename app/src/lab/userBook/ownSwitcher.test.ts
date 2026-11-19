// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { switcherRows, switcherTarget } from './ownSwitcher'
import { LAB_READER_HANDOFF_KEY } from '../labReaderHandoff'
import type { QuickBookRow } from '../../preReader/quickBookSwitcher'

const target = { bookId: 'frankenstein', editionKey: null, chapterNumber: 7, chapterLabel: 'Chapter 7', pageIndex: 0, paragraphIndex: 3, wordIndex: 0, paragraphCount: null, source: 'position' as const, at: 5 }

describe('the book switcher outside the reader (PDF viewer)', () => {
  it('opens an own book at its own address, and a Tinct book in the reader at its place', () => {
    const own = { bookId: 'userbook-ab12', title: 'Notes', chapterLabel: 'p. 3 of 8', coverSrc: null, coverSrcSet: null, coverTone: null, target, lastActiveAt: 9, href: '/lab/addbook/?userBook=ab12' } satisfies QuickBookRow
    const session = new Map<string, string>()
    expect(switcherTarget(own, { setItem: (k, v) => session.set(k, v) })).toBe('/lab/addbook/?userBook=ab12')
    expect(session.size).toBe(0)
    const tinct = { ...own, bookId: 'frankenstein', title: 'Frankenstein', chapterLabel: 'Chapter 7', href: undefined }
    expect(switcherTarget(tinct, { setItem: (k, v) => session.set(k, v) })).toBe('/reader')
    const intent = JSON.parse(session.get(LAB_READER_HANDOFF_KEY) || 'null')
    expect(intent?.bookId).toBe('frankenstein')
  })

  it('still lists own books when the catalogue cannot load', async () => {
    const result = await switcherRows((async () => new Response('', { status: 503 })) as unknown as typeof fetch)
    expect(result).toEqual({ rows: [], error: 'Showing your own books only.' })
  })
})
