import { describe, expect, it } from 'vitest'
import { chapterFixtures, pagesFor, platoDialogueFixture, type ChapterFixture } from './fixtures.test-helpers'
import { createReadingMemoryRecorder, detectCompletionSignal, type ReaderObservation } from './recorder'
import { emptyReadingMemory } from './sessions'
import { textOfRange, wordCount } from './textRange'
import type { ReadingMemoryEvent, ReadingMemoryState } from './types'

const T0 = Date.UTC(2026, 8, 3, 14, 0)
const WORDS_PER_PAGE = 30

function harness(initial: ReadingMemoryState = emptyReadingMemory(), gapMs?: number) {
  let clock = T0
  let ids = 0
  let saved: ReadingMemoryState = initial
  const events: ReadingMemoryEvent[] = []
  const recorder = createReadingMemoryRecorder({
    deviceId: 'device-test',
    now: () => clock,
    createId: () => `s${++ids}`,
    load: () => saved,
    save: (state) => { saved = state },
    onEvent: (event) => events.push(event),
    sessionGapMs: gapMs,
  })
  return {
    recorder,
    events,
    saved: () => saved,
    tick: (ms: number) => { clock += ms },
    now: () => clock,
  }
}

function observation(fixture: ChapterFixture, pageIndex: number, patch: Partial<ReaderObservation> = {}): ReaderObservation {
  const pages = pagesFor(fixture, WORDS_PER_PAGE)
  const page = pages[pageIndex]
  return {
    bookId: fixture.bookId,
    editionKey: fixture.editionKey,
    chapterNumber: fixture.chapterNumber,
    chapterLabel: fixture.chapterLabel,
    paragraphs: fixture.paragraphs,
    pageIndex,
    totalPages: pages.length,
    pageStart: page.start,
    pageEnd: page.end,
    ready: true,
    completionSignal: false,
    ...patch,
  }
}

describe('reading memory recorder', () => {
  it.each(chapterFixtures())('opens a started session with one coherent anchor and real clock values ($bookId ch$chapterNumber)', (fixture) => {
    const h = harness()
    const session = h.recorder.observe(observation(fixture, 0))
    expect(session).not.toBeNull()
    expect(session?.state).toBe('started')
    expect(session?.startedAt).toBe(T0)
    expect(session?.lastActiveAt).toBe(T0)
    expect(session?.endedAt).toBeNull()
    expect(session?.completedAt).toBeNull()
    expect(session?.anchor).toMatchObject({
      bookId: fixture.bookId,
      editionKey: fixture.editionKey,
      chapterNumber: fixture.chapterNumber,
      chapterLabel: fixture.chapterLabel,
      page: 1,
      totalPages: pagesFor(fixture, WORDS_PER_PAGE).length,
    })
    const range = session!.anchor.range
    expect(textOfRange(fixture.paragraphs, range)?.startsWith(range.firstWords)).toBe(true)
    expect(textOfRange(fixture.paragraphs, range)?.endsWith(range.lastWords)).toBe(true)
    expect(h.events).toHaveLength(1)
    expect(h.events[0]).toEqual({ sessionId: 's1', seq: 1, session })
  })

  it('does not write on a repeated identical observation, and progresses on a page turn', () => {
    const fixture = platoDialogueFixture()
    const h = harness()
    h.recorder.observe(observation(fixture, 0))
    h.tick(10_000)
    h.recorder.observe(observation(fixture, 0))
    expect(h.events).toHaveLength(1)
    h.tick(20_000)
    const progressed = h.recorder.observe(observation(fixture, 1))
    expect(progressed?.state).toBe('progressed')
    expect(progressed?.seq).toBe(2)
    expect(progressed?.lastActiveAt).toBe(T0 + 30_000)
    expect(progressed?.anchor.page).toBe(2)
    // The read range grows to cover both pages exactly.
    const pages = pagesFor(fixture, WORDS_PER_PAGE)
    expect(progressed?.anchor.range.startParagraphIndex).toBe(pages[0].start.paragraphIndex)
    expect(progressed?.anchor.range.endParagraphIndex).toBe(pages[1].end.paragraphIndex)
    expect(progressed?.anchor.range.endWordIndex).toBe(pages[1].end.wordIndex)
  })

  it('never marks a chapter completed from a visit alone, even when landing on the last page', () => {
    const fixture = platoDialogueFixture()
    const pages = pagesFor(fixture, WORDS_PER_PAGE)
    const h = harness()
    for (let i = 0; i < pages.length; i++) {
      h.tick(5_000)
      h.recorder.observe(observation(fixture, i))
    }
    const last = h.recorder.current()
    expect(last?.anchor.page).toBe(pages.length)
    expect(last?.state).toBe('progressed')
    expect(last?.completedAt).toBeNull()
  })

  it('marks completed only on the explicit completion signal and keeps the timestamp', () => {
    const fixture = platoDialogueFixture()
    const pages = pagesFor(fixture, WORDS_PER_PAGE)
    const h = harness()
    h.recorder.observe(observation(fixture, pages.length - 2))
    h.tick(40_000)
    const done = h.recorder.observe(observation(fixture, pages.length - 1, { completionSignal: true }))
    expect(done?.state).toBe('completed')
    expect(done?.completedAt).toBe(T0 + 40_000)
    h.tick(1_000)
    // A later backward page turn does not un-complete the session.
    const after = h.recorder.observe(observation(fixture, 0))
    expect(after?.state).toBe('completed')
    expect(after?.completedAt).toBe(T0 + 40_000)
  })

  it('closes the previous session with endedAt when the tuple changes, and resumes a chapter read before', () => {
    const [genesis, james] = chapterFixtures()
    const h = harness()
    h.recorder.observe(observation(genesis, 0))
    h.tick(30_000)
    h.recorder.observe(observation(james, 0))
    const state = h.saved()
    expect(state.sessions.s1.endedAt).toBe(T0 + 30_000)
    expect(state.sessions.s1.seq).toBe(2)
    expect(state.sessions.s2.state).toBe('started')
    h.tick(30_000)
    const back = h.recorder.observe(observation(genesis, 1))
    expect(back?.id).toBe('s3')
    expect(back?.state).toBe('resumed')
    expect(h.saved().sessions.s2.endedAt).toBe(T0 + 60_000)
  })

  it('starts a resumed session after the inactivity gap and ends the stale one at its last activity', () => {
    const fixture = platoDialogueFixture()
    const h = harness(emptyReadingMemory(), 60_000)
    h.recorder.observe(observation(fixture, 0))
    h.tick(10_000)
    h.recorder.observe(observation(fixture, 1))
    h.tick(120_000)
    const resumed = h.recorder.observe(observation(fixture, 1))
    expect(resumed?.id).toBe('s2')
    expect(resumed?.state).toBe('resumed')
    expect(h.saved().sessions.s1.endedAt).toBe(T0 + 10_000)
  })

  it('ignores observations that are not ready (cover, unsettled pages, loading)', () => {
    const fixture = platoDialogueFixture()
    const h = harness()
    expect(h.recorder.observe(observation(fixture, 0, { ready: false }))).toBeNull()
    expect(h.recorder.observe(observation(fixture, 0, { paragraphs: [] }))).toBeNull()
    expect(h.events).toHaveLength(0)
  })

  it('end() closes once and is idempotent', () => {
    const fixture = platoDialogueFixture()
    const h = harness()
    h.recorder.observe(observation(fixture, 0))
    h.tick(5_000)
    const ended = h.recorder.end()
    expect(ended?.endedAt).toBe(T0 + 5_000)
    expect(h.recorder.end()).toBe(ended)
    expect(h.events).toHaveLength(2)
  })
})

describe('detectCompletionSignal', () => {
  const fixture = platoDialogueFixture()
  const pages = pagesFor(fixture, WORDS_PER_PAGE)
  const lastCount = wordCount(fixture.paragraphs[fixture.paragraphs.length - 1])
  const base = {
    paragraphs: fixture.paragraphs,
    lastParagraphWordCount: lastCount,
    totalPages: pages.length,
    chapterNumber: fixture.chapterNumber,
    finishedChapters: new Set<number>(),
    previousFinishedChapters: new Set<number>(),
  }

  it('fires when the reader turns forward onto the final page that renders the last word', () => {
    expect(detectCompletionSignal({ ...base, pageIndex: pages.length - 1, pageEnd: pages[pages.length - 1].end, pageTurnDirection: 'next' })).toBe(true)
  })

  it('does not fire on initial render, a backward landing, or a non-final page', () => {
    expect(detectCompletionSignal({ ...base, pageIndex: pages.length - 1, pageEnd: pages[pages.length - 1].end, pageTurnDirection: null })).toBe(false)
    expect(detectCompletionSignal({ ...base, pageIndex: pages.length - 1, pageEnd: pages[pages.length - 1].end, pageTurnDirection: 'previous' })).toBe(false)
    expect(detectCompletionSignal({ ...base, pageIndex: 0, pageEnd: pages[0].end, pageTurnDirection: 'next' })).toBe(false)
  })

  it('fires on the finished-chapter transition but not when the set already held the chapter', () => {
    const finished = new Set([fixture.chapterNumber])
    expect(detectCompletionSignal({ ...base, pageIndex: 0, pageEnd: pages[0].end, pageTurnDirection: null, finishedChapters: finished, previousFinishedChapters: new Set() })).toBe(true)
    expect(detectCompletionSignal({ ...base, pageIndex: 0, pageEnd: pages[0].end, pageTurnDirection: null, finishedChapters: finished, previousFinishedChapters: finished })).toBe(false)
    expect(detectCompletionSignal({ ...base, pageIndex: 0, pageEnd: pages[0].end, pageTurnDirection: null, finishedChapters: finished, previousFinishedChapters: null })).toBe(false)
  })
})
