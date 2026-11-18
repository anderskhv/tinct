import { describe, expect, it } from 'vitest'
import { CONTENT_RELEASES, writtenBeforeRelease } from './editionContentRevisions'

describe('different publication dates for editions of the same book', () => {
  const book = 'magna-carta'
  const release = CONTENT_RELEASES[book]
  const danish = release.editions['modern-da']
  const english = release.editions['modern-en']
  it('repairs a Danish note made between releases without migrating a newer English note as old English', () => {
    const between = release.releasedAt + 1
    expect(danish.releasedAt).toBeGreaterThan(between)
    expect(writtenBeforeRelease(book, 'modern-da', undefined, between)).toBe(true)
    expect(writtenBeforeRelease(book, 'modern-en', undefined, between)).toBe(false)
    expect(writtenBeforeRelease(book, 'modern-en', undefined, release.releasedAt - 1)).toBe(true)
    expect(writtenBeforeRelease(book, 'modern-da', undefined, danish.releasedAt!)).toBe(false)
  })
  it('continues to use exact revision stamps regardless of the saved date', () => {
    expect(writtenBeforeRelease(book, 'modern-da', danish.before, danish.releasedAt! + 1)).toBe(true)
    expect(writtenBeforeRelease(book, 'modern-da', danish.after, 0)).toBe(false)
    expect(writtenBeforeRelease(book, 'modern-en', english.before, Date.now())).toBe(true)
    expect(writtenBeforeRelease(book, 'modern-en', english.after, 0)).toBe(false)
  })
})
