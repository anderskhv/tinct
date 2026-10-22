// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'

const year = vi.fn()
vi.mock('../useLabReadingYear', () => ({ useLabReadingYear: (input: unknown) => year(input) }))
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'reader-1' } }) }))

import { MarginOwnBook, marginOwnAddress, marginOwnNavBook } from './MarginPreview'
import { ownMarginPhone } from '../userBook/UserBookReader'
import { ownBookFrameUrl } from '../userBook/userBookId'

const HEX = 'aa11bb22cc33dd44ee55ff66'

afterEach(() => { cleanup(); year.mockClear(); delete window.TinctMarginPreview })

describe("a reader's own book in the reader's shell (One Tinct, 22 Oct 2026)", () => {
  it('frames the margin reader at the book page, carrying only what Original pages asks for', () => {
    expect(ownBookFrameUrl(HEX)).toBe(`/lab/addbook/book?userBook=${HEX}`)
    expect(ownBookFrameUrl(HEX, `?userBook=${HEX}&page=3&frac=0.25&pages&layout=desktop&margin=1`)).toBe(`/lab/addbook/book?userBook=${HEX}&page=3&frac=0.25&pages=`)
  })

  it('keeps the address the book’s one address, without the page a link opened it at', () => {
    expect(marginOwnAddress(`?userBook=${HEX}&page=3&frac=0.25&pages`)).toBe(`/reader?userBook=${HEX}&pages=`)
    expect(marginOwnAddress(`?userBook=${HEX}`)).toBe(`/reader?userBook=${HEX}`)
  })

  it('counts reading time as the book reader counts an own book’s: no place, the private bucket, from the frame’s open', () => {
    render(<MarginOwnBook hex={HEX} search={`?userBook=${HEX}`} />)
    expect(screen.getByTestId('margin-preview-frame').getAttribute('src')).toBe(`/lab/addbook/book?userBook=${HEX}`)
    expect(year).toHaveBeenLastCalledWith(expect.objectContaining({ userId: 'reader-1', bookId: `userbook-${HEX}`, onCover: true, privateBook: true, paused: true, chapter: 1, page: 0 }))
    const bridge = window.TinctMarginPreview!
    expect(bridge.bookId).toBe(`userbook-${HEX}`)
    expect(bridge.load).toBeUndefined()
    act(() => bridge.own!.opened())
    expect(year).toHaveBeenLastCalledWith(expect.objectContaining({ paused: false }))
    // The frame's actions count as this page's (the reading year listens on this window).
    const heard = vi.fn()
    window.addEventListener('pointerdown', heard)
    bridge.own!.active()
    window.removeEventListener('pointerdown', heard)
    expect(heard).toHaveBeenCalledTimes(1)
  })

  it('shows Reading now and Contents for the chapters the frame sends', () => {
    const request = { kind: 'contents' as const, theme: 'light' as const, page: 2, percent: 0, chapterLabel: 'Two', go: () => {}, leave: () => {}, library: () => {}, book: { title: 'Mine', chapters: [{ number: 1, title: 'One' }, { number: 2, title: 'Two', section: 'Part I' }], cover: 'data:image/png;base64,AA' } }
    expect(marginOwnNavBook(HEX, request)).toEqual({ bookId: `userbook-${HEX}`, title: 'Mine', editionKey: 'own', editionLabel: '', chapters: request.book.chapters, cover: request.book.cover })
    expect(marginOwnNavBook(HEX, { ...request, book: undefined })).toBeNull()
  })

  it('gives own books the phone margin mode on the rule Tinct books follow there', () => {
    // The launch (22 Oct 2026): on by default; off while this device chose the Classic reader.
    const none = () => null, classic = (key: string) => (key === 'tinct:classic-reader' ? '1' : null)
    const kept: Array<[string, boolean]> = [], keep = (key: string, value: boolean) => { kept.push([key, value]) }
    expect(ownMarginPhone('', none, keep)).toBe(true)
    expect(ownMarginPhone('', classic, keep)).toBe(false)
    expect(kept).toEqual([])
    expect(ownMarginPhone('?margin=1', classic, keep)).toBe(true)
    expect(ownMarginPhone('?margin=0', none, keep)).toBe(false)
    // The link's choice is kept on this device, as a Tinct book's is: margin=1 clears the Classic reader, margin=0 stores it.
    expect(kept).toEqual([['tinct:classic-reader', false], ['tinct:classic-reader', true]])
  })
})
