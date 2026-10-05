// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readLabHighlights, writeLabHighlights, type LabHighlight } from './labHighlights'
import {
  applyLabHighlightSet,
  createLabHighlightCloud,
  createLabHighlightCloudWriter,
  highlightUpdatedAt,
  LAB_HIGHLIGHT_TOMBSTONES_KEY,
  labHighlightRowValue,
  labHighlightsKey,
  localLabHighlightBuckets,
  mergeLabHighlightSets,
  parseLabHighlightRow,
  readLabHighlightTombstones,
  readLocalLabHighlightSet,
  recordLabHighlightDeletions,
  type LabHighlightCloud,
  type LabHighlightCloudRow,
  type LabHighlightSet,
} from './labHighlightSync'

afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })

const T = 1_780_000_000_000
const mark = (id: string, extra: Partial<LabHighlight> = {}): LabHighlight => ({
  id, bookId: 'emma', editionKey: 'original-en', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 3, color: 'gold', ...extra,
})
const set = (highlights: LabHighlight[], deleted: LabHighlightSet['deleted'] = []): LabHighlightSet => ({ highlights, deleted })

/** In-memory `user_data` rows behind the versioned commit contract. */
function memoryCloud(seed: Record<string, LabHighlightCloudRow> = {}) {
  const rows = new Map(Object.entries(seed))
  const commits: { bucket: string; expectedRev: number | null }[] = []
  const cloud: LabHighlightCloud = {
    read: vi.fn(async bucket => rows.get(bucket) ?? null),
    commit: vi.fn(async (bucket, value, expectedRev) => {
      commits.push({ bucket, expectedRev })
      const current = rows.get(bucket)
      if (current ? expectedRev !== null && expectedRev !== current.rev : expectedRev !== null && expectedRev !== 0) {
        return { applied: false, conflict: true, row: current ?? null }
      }
      const row = { set: parseLabHighlightRow(labHighlightRowValue(value), bucket), rev: (current?.rev ?? 0) + 1 }
      rows.set(bucket, row)
      return { applied: true, conflict: false, row }
    }),
  }
  return { cloud, rows, commits }
}

describe('row shape', () => {
  it('keeps one row per book under lab-highlights:{bookId}, older unbooked marks under _unassigned', () => {
    expect(labHighlightsKey('emma')).toBe('lab-highlights:emma')
    expect(labHighlightsKey('_unassigned')).toBe('lab-highlights:_unassigned')
    const value = labHighlightRowValue(set([mark(`hl-${T}-a`)], [{ id: 'gone', bookId: 'emma', deletedAt: T }]))
    expect(value).toEqual({ v: 1, highlights: [mark(`hl-${T}-a`)], deleted: [{ id: 'gone', bookId: 'emma', deletedAt: T }] })
    expect(JSON.parse(JSON.stringify(value))).toEqual(value)
  })

  it('reads a deleted row (null) and junk as empty, and drops marks of another book', () => {
    expect(parseLabHighlightRow(null, 'emma')).toEqual(set([]))
    expect(parseLabHighlightRow('x', 'emma')).toEqual(set([]))
    const parsed = parseLabHighlightRow({ v: 1, highlights: [mark('ok'), mark('other', { bookId: 'odyssey' }), { id: 'bad' }], deleted: [{ id: 'd', deletedAt: 'no' }] }, 'emma')
    expect(parsed.highlights.map(h => h.id)).toEqual(['ok'])
    expect(parsed.deleted).toEqual([])
    expect(parseLabHighlightRow({ highlights: [mark('u', { bookId: undefined })] }, '_unassigned').highlights).toHaveLength(1)
  })

  it('writes through commit_user_data with the expected rev', async () => {
    const rpc = vi.fn(async () => ({ data: [{ key: 'lab-highlights:emma', value: { v: 1, highlights: [], deleted: [] }, rev: 4, applied: true, conflict: false }], error: null }))
    const cloud = createLabHighlightCloud('user-1', { rpc } as never)!
    const result = await cloud.commit('emma', set([mark(`hl-${T}-a`)]), 3)
    expect(rpc).toHaveBeenCalledWith('commit_user_data', {
      p_user_id: 'user-1',
      p_key: 'lab-highlights:emma',
      p_value: { v: 1, highlights: [mark(`hl-${T}-a`)], deleted: [] },
      p_expected_rev: 3,
    })
    expect(result).toMatchObject({ applied: true, conflict: false, row: { rev: 4 } })
    expect(createLabHighlightCloud('', { rpc } as never)).toBeNull()
    expect(createLabHighlightCloud('user-1', null)).toBeNull()
  })
})

describe('merge rule', () => {
  it('is a union by id', () => {
    const merged = mergeLabHighlightSets(set([mark(`hl-${T}-a`)]), set([mark(`hl-${T + 1}-b`)]))
    expect(merged.highlights.map(h => h.id)).toEqual([`hl-${T}-a`, `hl-${T + 1}-b`])
  })

  it('keeps the newer copy of the same id, whichever side it is on', () => {
    const old = mark(`hl-${T}-a`, { note: 'first', updatedAt: T + 10 })
    const newer = mark(`hl-${T}-a`, { note: 'second', updatedAt: T + 20 })
    expect(mergeLabHighlightSets(set([old]), set([newer])).highlights).toEqual([newer])
    expect(mergeLabHighlightSets(set([newer]), set([old])).highlights).toEqual([newer])
  })

  it('dates marks without a timestamp by their id, and settles exact ties the same way on every device', () => {
    expect(highlightUpdatedAt(mark(`hl-${T}-a`))).toBe(T)
    expect(highlightUpdatedAt(mark('legacy'))).toBe(0)
    const untimed = mark(`hl-${T}-a`, { note: 'old device' })
    const edited = mark(`hl-${T}-a`, { note: 'edited', updatedAt: T + 5 })
    expect(mergeLabHighlightSets(set([edited]), set([untimed])).highlights).toEqual([edited])
    const x = mark(`hl-${T}-a`, { color: 'rose', updatedAt: T + 1 })
    const y = mark(`hl-${T}-a`, { color: 'sage', updatedAt: T + 1 })
    expect(mergeLabHighlightSets(set([x]), set([y]))).toEqual(mergeLabHighlightSets(set([y]), set([x])))
  })

  it('lets a tombstone beat the mark, so a deletion never comes back from another device', () => {
    const stale = mark(`hl-${T}-a`, { note: 'still here on the old phone', updatedAt: T + 50 })
    const deleted = set([], [{ id: `hl-${T}-a`, bookId: 'emma', deletedAt: T + 10 }])
    const merged = mergeLabHighlightSets(deleted, set([stale]))
    expect(merged.highlights).toEqual([])
    expect(merged.deleted).toEqual([{ id: `hl-${T}-a`, bookId: 'emma', deletedAt: T + 10 }])
    // And again on the next round trip.
    expect(mergeLabHighlightSets(merged, set([stale])).highlights).toEqual([])
  })
})

describe('device copy', () => {
  it('records deletions as local tombstones and folds a set into one book only', () => {
    writeLabHighlights([mark(`hl-${T}-a`), mark(`hl-${T}-o`, { bookId: 'odyssey' }), mark('older', { bookId: undefined })])
    recordLabHighlightDeletions([mark(`hl-${T}-a`)], T + 9)
    expect(readLabHighlightTombstones()).toEqual([{ id: `hl-${T}-a`, bookId: 'emma', deletedAt: T + 9 }])
    expect(localStorage.getItem(LAB_HIGHLIGHT_TOMBSTONES_KEY)).not.toBeNull()
    expect(localLabHighlightBuckets().sort()).toEqual(['_unassigned', 'emma', 'odyssey'])
    const list = readLabHighlights()
    const next = applyLabHighlightSet(list, 'emma', readLocalLabHighlightSet('emma'))
    expect(next.map(h => h.id).sort()).toEqual([`hl-${T}-o`, 'older'])
    expect(applyLabHighlightSet(next, 'emma', set([]))).toBe(next)
  })
})

describe('cloud sync', () => {
  it('on sign-in, merges the device marks into the account row instead of overwriting it', async () => {
    const elsewhere = mark(`hl-${T}-phone`, { note: 'from the phone' })
    const { cloud, rows, commits } = memoryCloud({ emma: { set: set([elsewhere]), rev: 7 } })
    writeLabHighlights([mark(`hl-${T + 1}-laptop`)])
    const onMerged = vi.fn()
    const writer = createLabHighlightCloudWriter(cloud, { onMerged })
    const result = await writer.sync('emma')
    expect(result?.highlights.map(h => h.id)).toEqual([`hl-${T}-phone`, `hl-${T + 1}-laptop`])
    expect(commits).toEqual([{ bucket: 'emma', expectedRev: 7 }])
    expect(rows.get('emma')?.set.highlights.map(h => h.id)).toEqual([`hl-${T}-phone`, `hl-${T + 1}-laptop`])
    expect(readLabHighlights().map(h => h.id).sort()).toEqual([`hl-${T}-phone`, `hl-${T + 1}-laptop`])
    expect(onMerged).toHaveBeenCalledWith('emma', result)
    // Nothing new: a second sync only reads.
    await writer.sync('emma')
    expect(commits).toHaveLength(1)
  })

  it('carries a local deletion to the account and keeps it deleted', async () => {
    const a = mark(`hl-${T}-a`)
    const { cloud, rows } = memoryCloud({ emma: { set: set([a]), rev: 1 } })
    writeLabHighlights([a])
    const writer = createLabHighlightCloudWriter(cloud)
    await writer.sync('emma')
    recordLabHighlightDeletions([a], T + 100)
    writeLabHighlights([])
    writer.push('emma', readLocalLabHighlightSet('emma'))
    await vi.waitFor(() => expect(rows.get('emma')?.rev).toBe(2))
    expect(rows.get('emma')?.set).toEqual({ highlights: [], deleted: [{ id: a.id, bookId: 'emma', deletedAt: T + 100 }] })
    // Another device that still holds the mark cannot bring it back.
    localStorage.clear()
    writeLabHighlights([a])
    const other = createLabHighlightCloudWriter(cloud)
    const after = await other.sync('emma')
    expect(after?.highlights).toEqual([])
    expect(readLabHighlights()).toEqual([])
    expect(rows.get('emma')?.set.highlights).toEqual([])
  })

  it('on a conflict adopts the server row, merges and retries once', async () => {
    const { cloud, rows, commits } = memoryCloud({ emma: { set: set([]), rev: 1 } })
    const writer = createLabHighlightCloudWriter(cloud)
    await writer.sync('emma')
    // Another device commits meanwhile.
    rows.set('emma', { set: set([mark(`hl-${T}-other`)]), rev: 2 })
    writeLabHighlights([mark(`hl-${T + 1}-mine`)])
    writer.push('emma', readLocalLabHighlightSet('emma'))
    await vi.waitFor(() => expect(rows.get('emma')?.rev).toBe(3))
    expect(commits.slice(-2)).toEqual([{ bucket: 'emma', expectedRev: 1 }, { bucket: 'emma', expectedRev: 2 }])
    expect(rows.get('emma')?.set.highlights.map(h => h.id)).toEqual([`hl-${T}-other`, `hl-${T + 1}-mine`])
    expect(readLabHighlights().map(h => h.id).sort()).toEqual([`hl-${T}-other`, `hl-${T + 1}-mine`])
  })

  it('never blind-writes a book it has not read: the first push syncs', async () => {
    const { cloud, rows } = memoryCloud({ emma: { set: set([mark(`hl-${T}-other`)]), rev: 5 } })
    const writer = createLabHighlightCloudWriter(cloud)
    writeLabHighlights([mark(`hl-${T + 1}-mine`)])
    writer.push('emma', readLocalLabHighlightSet('emma'))
    await vi.waitFor(() => expect(rows.get('emma')?.rev).toBe(6))
    expect(cloud.read).toHaveBeenCalledWith('emma')
    expect(rows.get('emma')?.set.highlights).toHaveLength(2)
  })

  it('offline keeps the device copy and reports nothing merged', async () => {
    const cloud: LabHighlightCloud = { read: vi.fn(async () => { throw new Error('offline') }), commit: vi.fn() }
    writeLabHighlights([mark(`hl-${T}-a`)])
    const writer = createLabHighlightCloudWriter(cloud)
    expect(await writer.sync('emma')).toBeNull()
    expect(writer.isDirty()).toBe(true)
    expect(readLabHighlights()).toHaveLength(1)
  })

  it('stops touching state once disposed (sign-out)', async () => {
    const { cloud } = memoryCloud({ emma: { set: set([mark(`hl-${T}-a`)]), rev: 1 } })
    const onMerged = vi.fn()
    const writer = createLabHighlightCloudWriter(cloud, { onMerged })
    writer.dispose()
    expect(await writer.sync('emma')).toBeNull()
    expect(onMerged).not.toHaveBeenCalled()
    expect(cloud.read).not.toHaveBeenCalled()
  })
})
