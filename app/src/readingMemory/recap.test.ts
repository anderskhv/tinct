import { describe, expect, it } from 'vitest'
import { bibleChapterFixture, chapterFixtures, genesisOneFixture, pagesFor, platoDialogueFixture, sessionFor } from './fixtures.test-helpers'
import { buildRecapCard, formatStoredTimestamp } from './recap'
import { cleanExcerpt, textOfRange } from './textRange'

const format = { locale: 'en-US', timeZone: 'UTC' }

describe('what you read last recap', () => {
  it('says a chapter was finished, with the stored completion date, when the session is completed', () => {
    const fixture = bibleChapterFixture()
    const completedAt = Date.UTC(2026, 8, 3, 21, 12)
    const session = sessionFor(fixture, {
      state: 'completed',
      startedAt: Date.UTC(2026, 8, 3, 20, 40),
      lastActiveAt: completedAt,
      completedAt,
    })
    const card = buildRecapCard({ session, source: 'cloud', paragraphs: fixture.paragraphs, format })
    expect(card.completed).toBe(true)
    expect(card.headline).toBe(`You finished ${fixture.chapterLabel}`)
    expect(card.location).toBe(fixture.chapterLabel)
    expect(card.timeline).toEqual(['Started Sep 3, 2026, 8:40 PM', 'Finished Sep 3, 2026, 9:12 PM'])
    expect(card.bodyKind).toBe('excerpt')
    expect(card.provenance).toMatchObject({ source: 'cloud', generatedBy: 'excerpt', sessionState: 'completed', anchor: session.anchor })
  })

  it('says where the reader stopped, without any completion claim, for an unfinished chapter', () => {
    const fixture = platoDialogueFixture()
    const startedAt = Date.UTC(2026, 8, 2, 7, 5)
    const session = sessionFor(fixture, { state: 'progressed', startedAt, lastActiveAt: startedAt + 14 * 60_000, page: 2, totalPages: 5 })
    const card = buildRecapCard({ session, source: 'device', paragraphs: fixture.paragraphs, format })
    expect(card.completed).toBe(false)
    expect(card.headline).toBe(`You stopped in ${fixture.chapterLabel}`)
    expect(card.location).toBe(`${fixture.chapterLabel} · page 2 of 5`)
    expect(card.timeline).toEqual(['Started Sep 2, 2026, 7:05 AM', 'Last read Sep 2, 2026, 7:19 AM'])
    expect(card.timeline.join(' ')).not.toMatch(/finish/i)
    expect(card.headline).not.toMatch(/finish/i)
    expect(card.body).not.toMatch(/%/)
  })

  it('shows the truthful location plus an exact excerpt of the read range when no summary is available', () => {
    const fixture = genesisOneFixture()
    const startedAt = Date.UTC(2026, 9, 1, 6, 30)
    const session = sessionFor(fixture, { state: 'started', startedAt, page: 1, totalPages: 4, wordsPerPage: 60 })
    const card = buildRecapCard({ session, source: 'device', paragraphs: fixture.paragraphs, summary: null, format })
    expect(card.headline).toBe('You stopped in Genesis 1')
    expect(card.location).toBe('Genesis 1 · page 1 of 4')
    expect(card.bodyKind).toBe('excerpt')
    const exact = cleanExcerpt(textOfRange(fixture.paragraphs, session.anchor.range)!)
    expect(exact.startsWith('In the beginning God created the heaven and the earth.')).toBe(true)
    const shown = card.body.replace(/…$/, '')
    expect(exact.startsWith(shown)).toBe(true)
    expect(shown.length).toBeGreaterThan(40)
    expect(card.timeline).toEqual(['Started Oct 1, 2026, 6:30 AM'])
    expect(card.provenance.generatedBy).toBe('excerpt')
    expect(card.provenance.model).toBeUndefined()
  })

  it.each(chapterFixtures())('never claims completion for a merely visited chapter ($bookId ch$chapterNumber)', (fixture) => {
    const pages = pagesFor(fixture, 40)
    for (const state of ['started', 'resumed', 'progressed'] as const) {
      const session = sessionFor(fixture, { state, startedAt: Date.UTC(2026, 8, 4, 10), page: pages.length, totalPages: pages.length })
      const card = buildRecapCard({ session, source: 'device', paragraphs: fixture.paragraphs, format })
      expect(card.completed).toBe(false)
      expect(card.headline).toMatch(/^You stopped in /)
      expect(card.timeline.join(' ')).not.toMatch(/Finished/)
    }
  })

  it('uses a generated summary only when one was actually produced, and records its provenance', () => {
    const fixture = platoDialogueFixture()
    const session = sessionFor(fixture, { state: 'progressed', startedAt: Date.UTC(2026, 8, 3, 12), lastActiveAt: Date.UTC(2026, 8, 3, 12, 9), page: 2 })
    const summary = { text: 'Socrates walks down to the Piraeus and is stopped by Polemarchus.', model: 'claude-sonnet-4-6', version: 'recap-summary-v1' }
    const withSummary = buildRecapCard({ session, source: 'cloud', paragraphs: fixture.paragraphs, summary, format })
    expect(withSummary.bodyKind).toBe('summary')
    expect(withSummary.body).toBe(summary.text)
    expect(withSummary.provenance).toMatchObject({ generatedBy: 'summary', model: 'claude-sonnet-4-6', version: 'recap-summary-v1' })
    const without = buildRecapCard({ session, source: 'cloud', paragraphs: fixture.paragraphs, summary: null, format })
    expect(without.bodyKind).toBe('excerpt')
  })

  it('falls back to location-only when the edition text no longer matches the anchors or is unavailable', () => {
    const fixture = platoDialogueFixture()
    const session = sessionFor(fixture, { state: 'progressed', startedAt: Date.UTC(2026, 8, 3, 12), page: 1 })
    // A re-split edition: the paragraph boundaries moved, so the stored
    // anchors point at different words.
    const reflowed = fixture.paragraphs.slice(1)
    const mismatch = buildRecapCard({ session, source: 'device', paragraphs: reflowed, summary: { text: 'x', model: 'm', version: 'v' }, format })
    expect(mismatch.bodyKind).toBe('location-only')
    expect(mismatch.body).toBe('')
    expect(mismatch.location).toContain(fixture.chapterLabel)
    const unavailable = buildRecapCard({ session, source: 'device', paragraphs: null, format })
    expect(unavailable.bodyKind).toBe('location-only')
    expect(unavailable.headline).toBe(`You stopped in ${fixture.chapterLabel}`)
  })

  it('omits timestamps that are missing instead of guessing', () => {
    const fixture = bibleChapterFixture()
    const session = sessionFor(fixture, { state: 'started', startedAt: Date.UTC(2026, 8, 3, 9) })
    const card = buildRecapCard({ session, source: 'device', paragraphs: fixture.paragraphs, format })
    expect(card.timeline).toEqual(['Started Sep 3, 2026, 9:00 AM'])
    expect(formatStoredTimestamp(null, format)).toBeNull()
    expect(formatStoredTimestamp(Number.NaN, format)).toBeNull()
    expect(formatStoredTimestamp(0, format)).toBeNull()
  })
})
