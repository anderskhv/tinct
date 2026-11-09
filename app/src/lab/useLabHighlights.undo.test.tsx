// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

type Row = { key: string; value: unknown; rev: number }
const db = vi.hoisted(() => ({ rows: new Map<string, Row>(), calls: [] as string[] }))

vi.mock('../services/supabase', () => {
  const client = {
    from: () => {
      let key = ''
      const query = {
        select: () => query,
        eq: (column: string, value: string) => { if (column === 'key') key = value; return query },
        maybeSingle: async () => { db.calls.push(`read:${key}`); return { data: db.rows.get(key) ?? null, error: null } },
      }
      return query
    },
    rpc: async (_name: string, args: { p_key: string; p_value: unknown; p_expected_rev: number | null }) => {
      db.calls.push(`commit:${args.p_key}`)
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

import { StrictMode } from 'react'
import { useLabHighlights } from './useLabHighlights'
import { readLabHighlights, writeLabHighlights, type LabHighlight } from './labHighlights'

const T = 1_780_000_000_000
const mark = (id: string, bookId: string | undefined, extra: Partial<LabHighlight> = {}): LabHighlight => ({
  id, ...(bookId ? { bookId } : {}), editionKey: 'original-en', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 3, color: 'gold', ...extra,
})
const rowIds = (key: string) => ((db.rows.get(key)?.value as { highlights: LabHighlight[] } | undefined)?.highlights ?? []).map(h => h.id)

beforeEach(() => { db.rows.clear(); db.calls.length = 0 })
afterEach(() => { cleanup(); localStorage.clear() })

const range = (fromWord = 0, toWord = 2) => ({ paragraphIndex: 0, endParagraphIndex: 0, fromWord, toWord, text: 'two words' })
const signedIn = () => renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', userId: 'user-1' }))

it('undoes a new highlight: it leaves the device and the account', async () => {
  const { result } = signedIn()
  await waitFor(() => expect(db.calls).toContain('read:lab-highlights:emma'))
  let id = ''
  act(() => { id = result.current.addOrReuse(range(), 'sage').id })
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([id]))
  let undone: ReturnType<typeof result.current.undo> = null
  act(() => { undone = result.current.undo() })
  expect(undone).toEqual({ kind: 'create', ids: [id] })
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([]))
  expect(readLabHighlights()).toEqual([])
  act(() => { undone = result.current.undo() })
  expect(undone).toBeNull()
})

it('undoes a deletion so the mark survives the next sync and a reload, once', async () => {
  writeLabHighlights([mark(`hl-${T}-a`, 'emma', { note: 'mine', color: 'rose' })])
  const first = signedIn()
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([`hl-${T}-a`]))
  act(() => { first.result.current.remove(`hl-${T}-a`) })
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([]))
  act(() => { first.result.current.undo() })
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toHaveLength(1))
  const [restored] = (db.rows.get('lab-highlights:emma')!.value as { highlights: LabHighlight[] }).highlights
  // The old id keeps its tombstone (other devices may hold it); the mark is back under a new id from the same moment.
  expect(restored.id).not.toBe(`hl-${T}-a`)
  expect(restored.id.startsWith(`hl-${T}-`)).toBe(true)
  expect(restored).toMatchObject({ note: 'mine', color: 'rose', bookId: 'emma', paragraphIndex: 0, toWord: 3 })
  // The margin's own "Deleted. Undo" restoring the same marks adds no copy.
  act(() => { expect(first.result.current.restore([mark(`hl-${T}-a`, 'emma', { note: 'mine', color: 'rose' })])).toBe(true) })
  expect(first.result.current.highlights.map(h => h.id)).toEqual([restored.id])
  first.unmount()
  const reopened = signedIn()
  await waitFor(() => expect(db.calls.filter(call => call === 'read:lab-highlights:emma').length).toBeGreaterThan(1))
  await waitFor(() => expect(reopened.result.current.highlights.map(h => h.id)).toEqual([restored.id]))
  expect(readLabHighlights().map(h => h.id)).toEqual([restored.id])
})

it('undoes a colour change and a note edit to what was there before the first change', () => {
  writeLabHighlights([mark(`hl-${T}-a`, 'emma', { note: 'first' })])
  const { result, rerender } = renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', userId: null }))
  act(() => { result.current.setColor(`hl-${T}-a`, 'sky') }); rerender()
  act(() => { result.current.setColor(`hl-${T}-a`, 'rose') }); rerender()
  for (const text of ['f', 'fi', 'final']) { act(() => { result.current.setNote(`hl-${T}-a`, text) }); rerender() }
  act(() => { result.current.undo() })
  expect(result.current.highlights[0]).toMatchObject({ color: 'rose', note: 'first' })
  act(() => { result.current.undo() })
  expect(result.current.highlights[0]).toMatchObject({ color: 'gold', note: 'first' })
  expect(readLabHighlights()[0]).toMatchObject({ color: 'gold', note: 'first' })
})

it('undoes a deleted chapter note, and skips steps that no longer apply', () => {
  const { result, rerender } = renderHook(() => useLabHighlights(2, { bookId: 'emma', editionKey: 'original-en', userId: null }))
  act(() => { result.current.setChapterNote(2, 'about the ball') }); rerender()
  let id = ''
  act(() => { id = result.current.addOrReuse(range(4, 6)).id }); rerender()
  act(() => { result.current.remove(id, { undoable: false }) }); rerender()
  act(() => { result.current.setChapterNote(2, '') }); rerender()
  expect(result.current.chapterNotes).toEqual([])
  act(() => { result.current.undo() }); rerender()
  expect(result.current.chapterNotes.map(note => note.note)).toEqual(['about the ball'])
  // The highlight was discarded unsaved (no step of its own); its creation no longer applies, so undo reaches the note's creation.
  let undone: ReturnType<typeof result.current.undo> = null
  act(() => { undone = result.current.undo() }); rerender()
  expect(undone).toMatchObject({ kind: 'chapter-note', chapterNumber: 2, note: '' })
  expect(result.current.chapterNotes).toEqual([])
  expect(result.current.canUndo()).toBe(false)
})

it('forgets the steps when the book changes', () => {
  const { result, rerender } = renderHook(({ bookId }) => useLabHighlights(1, { bookId, editionKey: 'original-en', userId: null }), { initialProps: { bookId: 'emma' } })
  act(() => { result.current.addOrReuse(range()) })
  rerender({ bookId: 'odyssey' })
  expect(result.current.canUndo()).toBe(false)
  act(() => { expect(result.current.undo()).toBeNull() })
  expect(readLabHighlights()).toHaveLength(1)
})
