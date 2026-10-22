// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { marginPreviewMount, marginPreviewMountForPage } from './marginPreviewMount'
import { CLASSIC_READER_KEY } from './marginPreviewFlag'
import { isMarginPreviewBook } from './marginPreviewModel'
import { getBook } from '../../data/bookRegistry'
import { LAB_READER_HANDOFF_KEY } from '../labReaderHandoff'

const isPreviewBook = (id: string) => isMarginPreviewBook(getBook(id))
const go = (search: string) => window.history.replaceState(null, '', '/reader' + search)

describe('where the margin preview opens', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); go('') })
  afterEach(() => { localStorage.clear(); sessionStorage.clear() })

  it('pure: a phone opens the book reader in marginPhone mode, a desktop the frame, no book nothing', () => {
    expect(marginPreviewMount({ bookId: 'frankenstein', phone: true })).toBe('phone')
    expect(marginPreviewMount({ bookId: 'frankenstein', phone: false })).toBe('frame')
    expect(marginPreviewMount({ bookId: null, phone: true })).toBeNull()
    expect(marginPreviewMount({ bookId: null, phone: false })).toBeNull()
  })

  // Launch (22 Oct 2026): margin view is the default; these read "with the opt-in" before. Only the default changed.
  it('phone by default: the normal reader in marginPhone mode, the address and the hand-off left for it', () => {
    go('?book=frankenstein&chapter=3')
    expect(marginPreviewMountForPage(isPreviewBook, true)).toEqual({ mount: 'phone', bookId: 'frankenstein' })
    expect(window.location.search).toBe('?book=frankenstein&chapter=3')
    expect(localStorage.getItem(CLASSIC_READER_KEY)).toBeNull()
    // From the library's hand-off: the hand-off is not used up.
    go('')
    const handoff = JSON.stringify({ kind: 'open-reader', bookId: 'frankenstein' })
    sessionStorage.setItem(LAB_READER_HANDOFF_KEY, handoff)
    expect(marginPreviewMountForPage(isPreviewBook, true)).toEqual({ mount: 'phone', bookId: 'frankenstein' })
    expect(sessionStorage.getItem(LAB_READER_HANDOFF_KEY)).toBe(handoff)
    expect(window.location.search).toBe('')
    // margin=1 leaves the address too.
    go('?book=frankenstein&margin=1')
    expect(marginPreviewMountForPage(isPreviewBook, true)).toEqual({ mount: 'phone', bookId: 'frankenstein' })
    expect(window.location.search).toBe('?book=frankenstein&margin=1')
  })

  it('desktop by default: the frame', () => {
    go('?book=frankenstein')
    expect(marginPreviewMountForPage(isPreviewBook, false)).toEqual({ mount: 'frame', bookId: 'frankenstein' })
    go('?book=to-the-lighthouse&margin=1')
    expect(marginPreviewMountForPage(isPreviewBook, false)).toEqual({ mount: 'frame', bookId: 'to-the-lighthouse' })
  })

  it('the Classic reader, the Bible or no book: unchanged on both, nothing stored', () => {
    for (const phone of [true, false]) {
      for (const search of ['', '?book=bible', '?layout=phone']) {
        go(search)
        expect(marginPreviewMountForPage(isPreviewBook, phone)).toEqual({ mount: null, bookId: null })
        expect(window.location.search).toBe(search)
      }
      localStorage.setItem(CLASSIC_READER_KEY, '1')
      go('?book=frankenstein')
      expect(marginPreviewMountForPage(isPreviewBook, phone)).toEqual({ mount: null, bookId: null })
      expect(window.location.search).toBe('?book=frankenstein')
      localStorage.clear()
    }
    expect(localStorage.getItem(CLASSIC_READER_KEY)).toBeNull()
  })

  it('margin=0 on a phone stores the Classic reader and opens the book reader unchanged; margin=1 clears it', () => {
    go('?book=frankenstein&margin=0')
    expect(marginPreviewMountForPage(isPreviewBook, true)).toEqual({ mount: null, bookId: null })
    expect(localStorage.getItem(CLASSIC_READER_KEY)).toBe('1')
    go('?book=frankenstein&margin=1')
    expect(marginPreviewMountForPage(isPreviewBook, true)).toEqual({ mount: 'phone', bookId: 'frankenstein' })
    expect(localStorage.getItem(CLASSIC_READER_KEY)).toBeNull()
  })

  it('main.tsx mounts the frame only on a desktop and passes marginPhone to the book reader on a phone', () => {
    const main = readFileSync(resolve(__dirname, '../../main.tsx'), 'utf8')
    expect(main).toMatch(/marginPreviewMountForPage\(/)
    expect(main).toMatch(/preview\?\.mount === 'frame'/)
    expect(main).toMatch(/render\(preview\?\.mount === 'phone'\)/)
    expect(main).toMatch(/<LabApp marginPhone=\{marginPhone \|\| undefined\} \/>/)
  })
})
