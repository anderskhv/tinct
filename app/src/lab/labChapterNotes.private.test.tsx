// @vitest-environment jsdom
/**
 * Notes (on a passage or on a chapter): book order and the Notes only
 * filter, the chapter note's stored and synced shape, and the rule that a
 * note never reaches the AI.
 */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Row = { key: string; value: unknown; rev: number }
const db = vi.hoisted(() => ({ rows: new Map<string, Row>(), calls: [] as Array<{ key: string; expectedRev: number | null }> }))
vi.mock('../services/supabase', () => {
  const client = {
    from: () => {
      let key = ''
      const query = {
        select: () => query,
        eq: (column: string, value: string) => { if (column === 'key') key = value; return query },
        maybeSingle: async () => ({ data: db.rows.get(key) ?? null, error: null }),
      }
      return query
    },
    rpc: async (name: string, args: { p_key: string; p_value: unknown; p_expected_rev: number | null }) => {
      if (name !== 'commit_user_data') throw new Error('unexpected rpc ' + name)
      db.calls.push({ key: args.p_key, expectedRev: args.p_expected_rev })
      const current = db.rows.get(args.p_key)
      if (current ? args.p_expected_rev !== null && args.p_expected_rev !== current.rev : args.p_expected_rev) {
        return { data: [{ ...(current ?? { key: args.p_key, value: null, rev: null }), applied: false, conflict: true }], error: null }
      }
      const row = { key: args.p_key, value: args.p_value, rev: (current?.rev ?? 0) + 1 }
      db.rows.set(args.p_key, row)
      return { data: [{ ...row, applied: true, conflict: false }], error: null }
    },
  }
  return { supabase: client }
})
vi.mock('../data/editionLoader', () => ({ loadEditionChapterList: async () => [] }))
vi.mock('./labSource', () => ({ loadLabBibleOutline: async () => null, loadLabChapterList: async () => [] }))

import { useLabHighlights } from './useLabHighlights'
import { createLabChapterNote, highlightAt, readLabHighlights, writeLabHighlights, type LabHighlight } from './labHighlights'
import { labNotesOnly, orderLabHighlights } from './labHighlightOrder'
import { labHighlightRowValue, parseLabHighlightRow } from './labHighlightSync'
import { highlightNeedsMigration, highlightOffCurrentText } from './labHighlightContentMigration'
import { personalHistoryEvidence } from './labPersonalHistory'
import { recapHighlightPassages } from './labChapterChat'

const T = 1_780_000_000_000
const mark = (id: string, extra: Partial<LabHighlight> = {}): LabHighlight => ({
  id, bookId: 'emma', editionKey: 'original-en', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 2, color: 'gold', ...extra,
})
const chapterNote = (id: string, chapterNumber: number, note: string): LabHighlight => ({
  ...mark(id, { chapterNumber, toWord: 0 }), kind: 'chapter', note,
})

beforeEach(() => { db.rows.clear(); db.calls.length = 0; localStorage.clear() })
afterEach(() => { cleanup(); localStorage.clear() })

describe('Highlights & notes order', () => {
  const list = [
    mark(`hl-${T + 4}-c2late`, { chapterNumber: 2, paragraphIndex: 5, fromWord: 1 }),
    chapterNote(`hl-${T + 9}-note1`, 1, 'The chapter turns on the letter.'),
    mark(`hl-${T + 1}-c1p3`, { chapterNumber: 1, paragraphIndex: 3, fromWord: 0 }),
    mark(`hl-${T + 7}-c1p0w4`, { chapterNumber: 1, paragraphIndex: 0, fromWord: 4, note: 'Her pride, already.' }),
    mark(`hl-${T + 2}-c1p0w1`, { chapterNumber: 1, paragraphIndex: 0, fromWord: 1 }),
    mark(`hl-${T + 3}-c2early`, { chapterNumber: 2, paragraphIndex: 0, fromWord: 9 }),
  ]
  it('lists in book order: chapter, then place in the chapter, the chapter note after its passages', () => {
    expect(orderLabHighlights(list, 'book').map(h => h.id)).toEqual([
      `hl-${T + 2}-c1p0w1`, `hl-${T + 7}-c1p0w4`, `hl-${T + 1}-c1p3`, `hl-${T + 9}-note1`, `hl-${T + 3}-c2early`, `hl-${T + 4}-c2late`,
    ])
  })
  it('follows the book’s chapter order where chapter numbers are not in reading order', () => {
    const place = (n: number) => (n === 2 ? 0 : 1)
    expect(orderLabHighlights(list, 'book', place).map(h => h.chapterNumber)).toEqual([2, 2, 1, 1, 1, 1])
  })
  it('switches to newest first by creation time', () => {
    expect(orderLabHighlights(list, 'newest').map(h => h.id)).toEqual([
      `hl-${T + 9}-note1`, `hl-${T + 7}-c1p0w4`, `hl-${T + 4}-c2late`, `hl-${T + 3}-c2early`, `hl-${T + 2}-c1p0w1`, `hl-${T + 1}-c1p3`,
    ])
  })
  it('Notes only keeps highlights with a note and chapter notes', () => {
    expect(labNotesOnly([...list, mark('blank', { note: '   ' })]).map(h => h.id).sort()).toEqual([`hl-${T + 7}-c1p0w4`, `hl-${T + 9}-note1`].sort())
  })
})

describe('Chapter note storage', () => {
  it('is an entry with no passage: kind chapter, the empty 0..0 range, a note, never painted', () => {
    const note = createLabChapterNote(4, 'What the storm was for.')
    expect(note).toMatchObject({ kind: 'chapter', chapterNumber: 4, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 0, note: 'What the storm was for.' })
    expect(note.id).toMatch(/^hl-\d{13}-/)
    expect(highlightAt([note], 4, 0, 0)).toBeUndefined()
    expect(highlightNeedsMigration(note)).toBe(false)
    expect(highlightOffCurrentText(note)).toBe(false)
  })
  it('survives the cloud row parse and serialization unchanged', () => {
    const note = { ...createLabChapterNote(4, 'A note'), bookId: 'emma', editionKey: 'original-en' }
    const value = labHighlightRowValue({ highlights: [note], deleted: [] })
    expect(parseLabHighlightRow(JSON.parse(JSON.stringify(value)), 'emma').highlights).toEqual([note])
  })
  it('saves, edits and removes through the versioned lab-highlights row (commit_user_data with an expected rev)', async () => {
    writeLabHighlights([mark(`hl-${T}-passage`)])
    const { result } = renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', paragraphs: ['one two three'], userId: 'user-1' }))
    await waitFor(() => expect(db.rows.get('lab-highlights:emma')).toBeTruthy())
    act(() => { result.current.setChapterNote(3, '  Knightley was right.  ') })
    const stored = () => (db.rows.get('lab-highlights:emma')?.value as { highlights: LabHighlight[]; deleted: { id: string }[] })
    await waitFor(() => expect(stored().highlights.some(h => h.kind === 'chapter')).toBe(true))
    const saved = stored().highlights.find(h => h.kind === 'chapter')!
    expect(saved).toMatchObject({ kind: 'chapter', bookId: 'emma', editionKey: 'original-en', chapterNumber: 3, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 0, note: 'Knightley was right.' })
    expect(typeof saved.updatedAt).toBe('number')
    // Every write after the first read carries the row's revision (invariant 9).
    expect(db.calls.at(-1)?.expectedRev).toBe(db.rows.get('lab-highlights:emma')!.rev - 1)
    // Listed apart from the marks painted in the text.
    expect(result.current.chapterNotes.map(h => h.id)).toEqual([saved.id])
    expect(result.current.highlights.some(h => h.kind === 'chapter')).toBe(false)
    act(() => { result.current.setChapterNote(3, 'Knightley was right, again.') })
    await waitFor(() => expect(stored().highlights.find(h => h.id === saved.id)?.note).toBe('Knightley was right, again.'))
    expect(readLabHighlights().filter(h => h.kind === 'chapter')).toHaveLength(1)
    act(() => { result.current.setChapterNote(3, '') })
    await waitFor(() => expect(stored().deleted.map(t => t.id)).toContain(saved.id))
    expect(stored().highlights.map(h => h.id)).toEqual([`hl-${T}-passage`])
  })
  it('shows a chapter note in every edition of its book', () => {
    writeLabHighlights([{ ...chapterNote(`hl-${T}-cn`, 2, 'Across editions'), editionKey: 'original-en' }])
    const { result } = renderHook(() => useLabHighlights(2, { bookId: 'emma', editionKey: 'modern-en' }))
    expect(result.current.chapterNotes.map(h => h.id)).toEqual([`hl-${T}-cn`])
  })
})

describe('Notes never go to the AI', () => {
  it('recap activity carries highlighted passages only, never a note or a chapter note', () => {
    const marks = [
      mark('a', { chapterNumber: 2, fromWord: 0, toWord: 2, note: 'PRIVATE-PASSAGE-NOTE' }),
      chapterNote(`hl-${T}-cn`, 2, 'PRIVATE-CHAPTER-NOTE'),
    ]
    const passages = recapHighlightPassages(marks, { bookId: 'emma', chapterNumber: 2, editionKey: 'original-en', paragraphs: ['Emma Woodhouse, handsome'] })
    expect(passages).toEqual(['Emma Woodhouse,'])
    expect(JSON.stringify(passages)).not.toContain('PRIVATE')
  })
  it('requested reading history (chat and Talk) lists highlights without their notes, and no chapter notes', async () => {
    writeLabHighlights([
      mark('a', { text: 'handsome, clever, and rich', note: 'PRIVATE-PASSAGE-NOTE' }),
      chapterNote(`hl-${T}-cn`, 2, 'PRIVATE-CHAPTER-NOTE handsome'),
    ])
    const evidence = await personalHistoryEvidence('What did I highlight about handsome in my notes?', null)
    expect(evidence).toContain('handsome, clever, and rich')
    expect(evidence).not.toContain('PRIVATE')
  })
})
