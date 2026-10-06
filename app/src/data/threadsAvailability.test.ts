import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BOOKS } from './bookRegistry'
import { BOOKS_WITHOUT_THREADS, bookHasThreads } from './threadsAvailability'
import { STREAMED_ONLY_AUDIO_EDITIONS, hasRecordedAudio } from './audioAvailability'
import census from '../../../artifacts/audio-highlight-census-2026-09-11/edition-summary.json'

const threadsFile = (bookId: string) => new URL(`../../public/data/editions/${bookId}-threads.json`, import.meta.url)

describe('Cast (threads) availability', () => {
  it('asks for a Cast file exactly when the book has one on disk', () => {
    for (const book of BOOKS) {
      expect(bookHasThreads(book.id), book.id).toBe(existsSync(threadsFile(book.id)))
    }
  })
  it('lists only books that really lack a Cast file', () => {
    for (const id of BOOKS_WITHOUT_THREADS) expect(existsSync(threadsFile(id)), id).toBe(false)
    expect(bookHasThreads('confessions')).toBe(false)
    expect(bookHasThreads('frankenstein')).toBe(true)
  })
})

describe('recorded audio availability', () => {
  it('marks streamed-only exactly the audio editions the recorded-audio census never saw', () => {
    const recorded = new Set(census.filter(entry => entry.audioHours > 0).map(entry => `${entry.bookId}/${entry.edition}`))
    const unrecorded = BOOKS.flatMap(book => book.editions
      .filter(edition => edition.hasAudio && edition.language === 'en')
      .map(edition => `${book.id}/${edition.key}`))
      .filter(key => !recorded.has(key))
      .sort()
    expect([...STREAMED_ONLY_AUDIO_EDITIONS].sort()).toEqual(unrecorded)
  })
  it('never asks for a recorded manifest for the streamed-only books', () => {
    expect(hasRecordedAudio('wuthering-heights', 'modern-en')).toBe(false)
    expect(hasRecordedAudio('sense-and-sensibility', 'modern-en')).toBe(false)
    expect(hasRecordedAudio('frankenstein', 'original-en')).toBe(true)
    expect(hasRecordedAudio('bible', 'kjv-en')).toBe(true)
  })
})
