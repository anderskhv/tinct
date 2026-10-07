// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLabChatCloudWriter } from '../labChatHistory'
import { createLabHighlightCloudWriter } from '../labHighlightSync'
import { labSuperMenuRows } from '../labSuperMenu'
import { withholdAnalytics } from './privateReading'
import { isUserBookId, mentionsUserBook, userBookFromSearch, userBookId, userBookReaderUrl } from './userBookId'

const BOOK = userBookId('0123456789abcdef01234567')

afterEach(() => { window.history.replaceState(null, '', '/') })

describe('user book identity', () => {
  it('is never a registry id and survives the reader URL', () => {
    expect(BOOK).toBe('userbook-0123456789abcdef01234567')
    expect(isUserBookId(BOOK)).toBe(true)
    expect(isUserBookId('bible')).toBe(false)
    expect(isUserBookId('userbook-../x')).toBe(false)
    expect(userBookReaderUrl('0123456789abcdef01234567')).toBe('/reader?userBook=0123456789abcdef01234567')
    expect(userBookFromSearch('?userBook=0123456789abcdef01234567')).toBe('0123456789abcdef01234567')
    expect(userBookFromSearch('?userBook=<script>')).toBeNull()
  })
})

describe('a user book stays on this device', () => {
  it('highlights: the account writer never reads or writes its row', async () => {
    const cloud = { read: vi.fn(async () => null), commit: vi.fn(async () => ({ applied: true, conflict: false, row: null })) }
    const writer = createLabHighlightCloudWriter(cloud)
    writer.push(BOOK, { highlights: [{ id: 'h1', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 2, color: 'gold', bookId: BOOK, createdAt: 1 } as never], deleted: [] })
    await writer.sync(BOOK)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(cloud.read).not.toHaveBeenCalled()
    expect(cloud.commit).not.toHaveBeenCalled()
  })

  it('chat: the account writer never reads or writes its row', async () => {
    const cloud = { read: vi.fn(async () => null), commit: vi.fn(async () => ({ applied: true, conflict: false, row: null })) }
    const writer = createLabChatCloudWriter(cloud as never)
    writer.push(BOOK, [{ id: 'c1', bookId: BOOK, messages: [] } as never])
    await writer.sync(BOOK)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(cloud.read).not.toHaveBeenCalled()
    expect(cloud.commit).not.toHaveBeenCalled()
  })

  it('analytics: nothing is sent while one is open, nor any event that names one', () => {
    expect(withholdAnalytics({ book_id: 'bible' })).toBe(false)
    expect(withholdAnalytics({ book_id: BOOK })).toBe(true)
    expect(mentionsUserBook({ nested: [{ id: BOOK }] })).toBe(true)
    window.history.replaceState(null, '', '/reader?userBook=0123456789abcdef01234567')
    expect(withholdAnalytics({ book_id: 'bible' })).toBe(true)
  })

  it('menu: Talk, Catch me up and editions are not offered; Library is Your books', () => {
    expect(labSuperMenuRows({ phone: true, privateBook: true }).map(row => [row.id, row.label])).toEqual([
      ['librarian', 'Librarian'], ['summarize', 'Summarize'], ['settings', 'Settings'], ['library', 'Your books'], ['account', 'Account'],
    ])
    expect(labSuperMenuRows({ phone: true, privateBook: true })[0].modes).toEqual(['chat'])
    expect(labSuperMenuRows({ phone: true })[0].modes).toContain('talk')
  })
})
