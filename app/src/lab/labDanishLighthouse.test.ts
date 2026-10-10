import { describe, expect, it, vi } from 'vitest'
import { getBook } from '../data/bookRegistry'
import { isPilotScope } from '../narration/narrationCore'
import { loadCharacters } from '../services/characters/characterCards'
import { matchingAudioEditions, resolvedAudioIsAvailable } from '../utils/audioEditionSelection'
import { placeNeedsMigration } from './labContentMigration'
import { highlightNeedsMigration } from './labHighlightContentMigration'
import { narrationPilotApplies } from './labNarration'
import { offlineEditionEntry } from './labOfflineBook'
import { effectiveLabAudioEdition, readLabPrefs } from './labPrefs'
import type { LabBookPlace } from './labPosition'

/**
 * To the Lighthouse in Danish (modern-da, 2026-10-10): the reader must keep
 * the edition language, the interface language and the narration language
 * apart. Danish text is offered; Danish narration and character cards are not.
 */
const book = getBook('to-the-lighthouse')!

describe('To the Lighthouse modern-da in the reader', () => {
  it('never narrates Danish text with English audio, and offers no Danish narration', () => {
    const prefs = { ...readLabPrefs(), primaryEdition: 'modern-da', compareEdition: 'modern-en', audioFollowsPrimary: true }
    expect(matchingAudioEditions('modern-da', book.editions)).toEqual([])
    const audio = effectiveLabAudioEdition(prefs, book.editions)
    expect(audio).toBe('modern-da')
    expect(resolvedAudioIsAvailable(audio, 'modern-da', book.editions)).toBe(false)
    // An explicit English audiobook choice does not carry over to Danish text.
    expect(effectiveLabAudioEdition({ ...prefs, audioEdition: 'modern-en', audioFollowsPrimary: false }, book.editions)).toBe('modern-da')
    // Streaming narration is English-only (narrationCore isPilotScope; worker refuses too).
    expect(isPilotScope('to-the-lighthouse', 'modern-da', 1)).toBe(false)
    expect(narrationPilotApplies(prefs, 'to-the-lighthouse', 'modern-da', 1, 'grok')).toBe(false)
    expect(narrationPilotApplies(prefs, 'to-the-lighthouse', 'modern-en', 1, 'grok')).toBe(true)
  })

  it('loads no character cards for Danish and does not ask the network', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    await expect(loadCharacters('to-the-lighthouse', 'modern-da')).resolves.toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('treats switching to and from Danish as neither a withdrawal nor a content migration', () => {
    const place = { bookId: 'to-the-lighthouse', headerBook: 'to-the-lighthouse', chapterNumber: 17, sequentialChapter: 17, paragraphIndex: 12, wordIndex: 4, pageIndex: 3, primaryEditionKey: 'modern-da', updatedAt: 1_700_000_000_000, deviceId: 'd', rev: 1 } as unknown as LabBookPlace
    expect(placeNeedsMigration(place)).toBe(false)
    expect(placeNeedsMigration({ ...place, primaryEditionKey: 'modern-en' })).toBe(false)
    const highlight = { id: 'hl-1700000000000-a', bookId: 'to-the-lighthouse', editionKey: 'modern-da', chapterNumber: 17, paragraphIndex: 12, fromWord: 0, endParagraphIndex: 12, toWord: 3, color: 'yellow', text: 'x' }
    expect(highlightNeedsMigration(highlight as never)).toBe(false)
  })

  it('saves the Danish edition offline through its chapter shards', () => {
    expect(offlineEditionEntry('to-the-lighthouse', 'modern-da', 'v1')).toEqual({
      editionKey: 'modern-da',
      manifestUrl: expect.stringContaining('/data/editions-chapters/to-the-lighthouse-modern-da/manifest.json'),
    })
  })
})
