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

it('signed in: moves every book this device holds into the account and shows marks from other devices', async () => {
  writeLabHighlights([mark(`hl-${T}-e`, 'emma', { note: 'local note' }), mark(`hl-${T}-o`, 'odyssey'), mark('older', undefined)])
  db.rows.set('lab-highlights:emma', { key: 'lab-highlights:emma', rev: 3, value: { v: 1, highlights: [mark(`hl-${T + 5}-phone`, 'emma')], deleted: [] } })
  const { result } = renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', userId: 'user-1' }))
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([`hl-${T}-e`, `hl-${T + 5}-phone`]))
  await waitFor(() => expect(rowIds('lab-highlights:odyssey')).toEqual([`hl-${T}-o`]))
  await waitFor(() => expect(rowIds('lab-highlights:_unassigned')).toEqual(['older']))
  await waitFor(() => expect(result.current.highlights.map(h => h.id)).toEqual([`hl-${T}-e`, `hl-${T + 5}-phone`]))
  expect(readLabHighlights().map(h => h.id).sort()).toEqual([`hl-${T}-e`, `hl-${T}-o`, `hl-${T + 5}-phone`, 'older'].sort())
  expect(db.rows.get('lab-highlights:emma')?.rev).toBe(4)
})

it('signed in: a new mark, a note and a deletion reach the row; the deletion stays as a tombstone', async () => {
  const { result } = renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', userId: 'user-1' }))
  await waitFor(() => expect(db.calls).toContain('read:lab-highlights:emma'))
  let id = ''
  act(() => { id = result.current.addOrReuse({ paragraphIndex: 0, endParagraphIndex: 0, fromWord: 0, toWord: 2, text: 'two words' }, 'sage').id })
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([id]))
  act(() => { result.current.setNote(id, 'remember this') })
  await waitFor(() => expect((db.rows.get('lab-highlights:emma')?.value as { highlights: LabHighlight[] }).highlights[0].note).toBe('remember this'))
  act(() => { result.current.remove(id) })
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([]))
  const value = db.rows.get('lab-highlights:emma')?.value as { deleted: { id: string }[] }
  expect(value.deleted.map(t => t.id)).toEqual([id])
})

it('keeps syncing under StrictMode double mounting', async () => {
  writeLabHighlights([mark(`hl-${T}-e`, 'emma')])
  renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', userId: 'user-1' }), { wrapper: StrictMode })
  await waitFor(() => expect(rowIds('lab-highlights:emma')).toEqual([`hl-${T}-e`]))
})

it('signed out: stays on this device and never calls the cloud', async () => {
  const { result } = renderHook(() => useLabHighlights(1, { bookId: 'emma', editionKey: 'original-en', userId: null }))
  act(() => { result.current.addOrReuse({ paragraphIndex: 0, endParagraphIndex: 0, fromWord: 0, toWord: 2, text: 'two words' }) })
  await new Promise(resolve => setTimeout(resolve, 20))
  expect(readLabHighlights()).toHaveLength(1)
  expect(db.calls).toEqual([])
})
