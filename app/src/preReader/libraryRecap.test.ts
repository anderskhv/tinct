import { describe, expect, it } from 'vitest'
import { buildRecapCard } from '../readingMemory/recap'
import { applyReadingMemoryEvents, emptyReadingMemory, eventFromSession } from '../readingMemory/sessions'
import { bibleChapterFixture, genesisOneFixture, platoDialogueFixture, sessionFor } from '../readingMemory/fixtures.test-helpers'
import { inProgressLabel, libraryModeFor, otherBooksInProgress, recapEyebrow, recapHeadline } from './libraryRecap'

const T0 = 1_750_000_000_000

describe('library recap helpers', () => {
  it('decides returning only when a recap card exists', () => {
    expect(libraryModeFor(null)).toBe('new')
    expect(libraryModeFor(undefined)).toBe('new')
    const session = sessionFor(genesisOneFixture(), { state: 'progressed', startedAt: T0 })
    const card = buildRecapCard({ session, source: 'device', paragraphs: genesisOneFixture().paragraphs })
    expect(libraryModeFor({ card })).toBe('returning')
  })

  it('labels the eyebrow with the recorded chapter label', () => {
    const session = sessionFor(genesisOneFixture(), { state: 'progressed', startedAt: T0 })
    const card = buildRecapCard({ session, source: 'device', paragraphs: genesisOneFixture().paragraphs })
    expect(recapEyebrow(card)).toBe('Last time you read · Genesis 1')
  })

  it('uses the stored summary as the headline when present', () => {
    const session = sessionFor(genesisOneFixture(), { state: 'progressed', startedAt: T0 })
    const card = buildRecapCard({
      session,
      source: 'cloud',
      paragraphs: genesisOneFixture().paragraphs,
      summary: { text: 'God separates light from dark, sea from land, and makes the first people.', model: 'm', version: 'v1' },
    })
    expect(card.bodyKind).toBe('summary')
    expect(recapHeadline(card)).toBe('God separates light from dark, sea from land, and makes the first people.')
  })

  it('quotes and word-trims the exact excerpt when there is no summary', () => {
    const session = sessionFor(genesisOneFixture(), { state: 'progressed', startedAt: T0 })
    const card = buildRecapCard({ session, source: 'device', paragraphs: genesisOneFixture().paragraphs })
    expect(card.bodyKind).toBe('excerpt')
    const headline = recapHeadline(card, 60)
    expect(headline.startsWith('“')).toBe(true)
    expect(headline.endsWith('…”')).toBe(true)
    expect(headline.length).toBeLessThanOrEqual(63)
    expect(card.body.startsWith(headline.slice(1, headline.indexOf('…')))).toBe(true)
    const short = recapHeadline({ body: 'In the beginning.', bodyKind: 'excerpt', headline: 'x' })
    expect(short).toBe('“In the beginning.”')
  })

  it('falls back to the truthful location line and never claims completion', () => {
    const stopped = sessionFor(genesisOneFixture(), { state: 'progressed', startedAt: T0 })
    const missing = buildRecapCard({ session: stopped, source: 'device', paragraphs: null })
    expect(missing.bodyKind).toBe('location-only')
    expect(recapHeadline(missing)).toBe('You stopped in Genesis 1')
    const finished = sessionFor(genesisOneFixture(), { state: 'completed', startedAt: T0 })
    const finishedCard = buildRecapCard({ session: finished, source: 'device', paragraphs: null })
    expect(recapHeadline(finishedCard)).toBe('You finished Genesis 1')
  })

  it('lists other books in progress newest first, one row per book, excluding the hero, capped', () => {
    const genesis = sessionFor(genesisOneFixture(), { id: 'g1', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 5_000 })
    const james = sessionFor(bibleChapterFixture(), { id: 'j1', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 9_000 })
    const platoOld = sessionFor(platoDialogueFixture(), { id: 'p1', state: 'started', startedAt: T0, lastActiveAt: T0 + 1_000 })
    const platoNew = sessionFor(platoDialogueFixture(), { id: 'p2', state: 'progressed', startedAt: T0 + 2_000, lastActiveAt: T0 + 3_000, page: 2 })
    const other = sessionFor({ ...platoDialogueFixture(), bookId: 'meditations', editionKey: 'original-en', chapterLabel: 'Book 1' }, { id: 'm1', state: 'completed', startedAt: T0, lastActiveAt: T0 + 4_000 })
    const foreign = sessionFor({ ...platoDialogueFixture(), bookId: 'hamlet', chapterLabel: 'Act 1' }, { id: 'h1', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 8_000, owner: 'someone-else' })
    const state = applyReadingMemoryEvents(emptyReadingMemory(), [genesis, james, platoOld, platoNew, other, foreign].map(eventFromSession))

    const rows = otherBooksInProgress(state, null, 'bible')
    expect(rows.map(row => row.bookId)).toEqual(['meditations', 'plato-republic'])
    expect(rows[1].chapterLabel).toBe('Book I')
    expect(rows[1].pageIndex).toBe(1)
    expect(rows[0].completed).toBe(true)
    expect(inProgressLabel(rows[0])).toBe('Last time · Book 1')

    expect(otherBooksInProgress(state, 'someone-else', 'bible').map(row => row.bookId)).toEqual(['hamlet', 'meditations', 'plato-republic'])
    expect(otherBooksInProgress(state, null, null, 1).map(row => row.bookId)).toEqual(['bible'])
    expect(otherBooksInProgress(state, null, null, 0)).toEqual([])
  })
})
