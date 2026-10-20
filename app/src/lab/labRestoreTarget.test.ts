import { describe, expect, it } from 'vitest'
import type { ChapterHearingPage } from './labHearing'
import {
  LAB_RESTORE_RETRIES,
  holdPlaceWrite,
  labRestoreChapterKey,
  restoreLanded,
  restoreRetryIndex,
  restoreTargetChapter,
  restoreTargetFor,
  restoreTargetIn,
  type LabRestoreView,
  type LabRestoreWatch,
} from './labRestoreTarget'

// Ezra 9 (sequential 412): paragraph 0 fills page 0, paragraph 1 starts page 1.
const pages: ChapterHearingPage[] = [
  { paragraphIndex: 0, from: 0, to: 40, segments: [{ paragraphIndex: 0, from: 0, to: 40 }] },
  { paragraphIndex: 1, from: 0, to: 30, segments: [{ paragraphIndex: 1, from: 0, to: 30 }] },
  { paragraphIndex: 2, from: 0, to: 30, segments: [{ paragraphIndex: 2, from: 0, to: 30 }] },
]
const EZRA = labRestoreChapterKey('bible', 412)
const FRANKENSTEIN = labRestoreChapterKey('frankenstein', 2)
const watchAt = (overrides: Partial<LabRestoreWatch> = {}): LabRestoreWatch => ({ paragraphIndex: 1, wordIndex: 3, chapterKey: EZRA, interactions: 0, retries: 0, ...overrides })
const view = (overrides: Partial<LabRestoreView> = {}): LabRestoreView => ({ chapterKey: EZRA, settled: true, pages, pageIndex: 1, ...overrides })

describe('restore targets are bound to their chapter', () => {
  it('names a chapter the same way with or without the Bible id', () => {
    expect(labRestoreChapterKey(undefined, 412)).toBe(labRestoreChapterKey('bible', 412))
    expect(labRestoreChapterKey('', 3)).toBe('bible:3')
  })

  it('the outgoing chapter’s page map never takes the incoming chapter’s place (cross-device 0:0)', () => {
    const target = restoreTargetIn({ paragraphIndex: 1, wordIndex: 3 }, EZRA)
    // Frankenstein 2 is still the chapter on screen when its last measurement lands.
    expect(restoreTargetFor(target, FRANKENSTEIN)).toBeNull()
    // Ezra 9 committed: its own map restores it.
    expect(restoreTargetFor(target, EZRA)).toBe(target)
    expect(restoreTargetChapter(target)).toBe(EZRA)
  })

  it('an untagged target belongs to the chapter on screen, as before', () => {
    const target = { paragraphIndex: 4, wordIndex: 0 }
    expect(restoreTargetFor(target, FRANKENSTEIN)).toBe(target)
    expect(restoreTargetFor(target, EZRA)).toBe(target)
    expect(restoreTargetChapter(target)).toBeUndefined()
  })

  it('no target, nothing to restore', () => {
    expect(restoreTargetFor(null, EZRA)).toBeNull()
    expect(restoreTargetFor(undefined, EZRA)).toBeNull()
  })
})

describe('a saved-place restore lands only on the settled page that holds it', () => {
  it('lands when the settled map of its chapter shows its page', () => {
    expect(restoreLanded(watchAt(), view())).toBe(true)
  })

  it('has not landed at the chapter’s start', () => {
    expect(restoreLanded(watchAt(), view({ pageIndex: 0 }))).toBe(false)
  })

  it('has not landed on a draft (unsettled) map, in another chapter, or with no pages', () => {
    expect(restoreLanded(watchAt(), view({ settled: false }))).toBe(false)
    expect(restoreLanded(watchAt(), view({ chapterKey: FRANKENSTEIN }))).toBe(false)
    expect(restoreLanded(watchAt(), view({ pages: [], pageIndex: 0 }))).toBe(false)
  })
})

describe('a restore that did not land is retried, never saved', () => {
  it('the reader at 0:0 in the right chapter is moved back to the saved page', () => {
    expect(restoreRetryIndex(watchAt(), view({ pageIndex: 0 }), 0)).toBe(1)
  })

  it('nothing moves once it has landed, on a draft map, or in another chapter', () => {
    expect(restoreRetryIndex(watchAt(), view(), 0)).toBeNull()
    expect(restoreRetryIndex(watchAt(), view({ pageIndex: 0, settled: false }), 0)).toBeNull()
    expect(restoreRetryIndex(watchAt(), view({ pageIndex: 0, chapterKey: FRANKENSTEIN }), 0)).toBeNull()
  })

  it('the reader acting first keeps their page', () => {
    expect(restoreRetryIndex(watchAt({ interactions: 2 }), view({ pageIndex: 0 }), 3)).toBeNull()
  })

  it('is bounded', () => {
    expect(restoreRetryIndex(watchAt({ retries: LAB_RESTORE_RETRIES }), view({ pageIndex: 0 }), 0)).toBeNull()
  })
})

describe('no place is written while a restore is outstanding', () => {
  it('holds every note until the restore lands (the edition switch that wrote 0:0, the dwell)', () => {
    for (const reason of ['mode-change', 'dwell', 'open-book', 'word', 'pause', 'play', 'page-turn', 'chapter-jump'] as const) {
      expect(holdPlaceWrite({ watch: watchAt(), reason, interactions: 0, landed: false })).toBe(true)
    }
  })

  it('writes once it has landed', () => {
    expect(holdPlaceWrite({ watch: watchAt(), reason: 'mode-change', interactions: 0, landed: true })).toBe(false)
  })

  it('writes after the reader acts: their page is the place', () => {
    expect(holdPlaceWrite({ watch: watchAt({ interactions: 1 }), reason: 'page-turn', interactions: 2, landed: false })).toBe(false)
  })

  it('never holds a hide (it only flushes what is already recorded) or a reader with no restore', () => {
    expect(holdPlaceWrite({ watch: watchAt(), reason: 'hide', interactions: 0, landed: false })).toBe(false)
    expect(holdPlaceWrite({ watch: null, reason: 'mode-change', interactions: 0, landed: false })).toBe(false)
  })
})
