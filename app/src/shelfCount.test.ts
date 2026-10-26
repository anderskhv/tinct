import { describe, expect, it } from 'vitest'
// @ts-expect-error browser module
import { shelfBookCount } from '../public/lab/library_2/shelf-count.js'
describe('My shelf counts distinct visible books', () => {
  it('counts seven reading books once even when four are also saved', () => {
    const reading = Array.from({ length: 7 }, (_, i) => ({ bookId: `book-${i}` }))
    expect(shelfBookCount({ reading, saved: reading.slice(0, 4).map(b => b.bookId), catalogue: reading.map(b => ({ id: b.bookId })) })).toBe(7)
  })
  it('includes finished and uploaded books once and ignores unavailable saved IDs', () => {
    expect(shelfBookCount({ reading: [{ bookId: 'userbook-abc' }], finished: [{ bookId: 'finished' }], saved: ['finished', 'later', 'missing'], catalogue: [{ id: 'finished' }, { id: 'later' }], uploads: [{ key: 'pdf:abc' }, { key: 'epub:def' }] })).toBe(4)
  })
  it('does not retain a previous account count', () => { expect(shelfBookCount()).toBe(0) })
})
