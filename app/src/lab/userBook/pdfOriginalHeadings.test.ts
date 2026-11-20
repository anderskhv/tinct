// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { pdfOriginalUnits, pdfUnitAt, type PdfOriginalUnitRules } from '../sharedReader/pdf/pdfOriginalUnits'
import { afterEach, expect, it, vi } from 'vitest'
import { discoverOriginalPdfHeadings } from './pdfOriginalHeadings'
import type { loadPdfEngine, PdfScan } from './pdfEdition'
import { readOwnedPdfScanEntries, cacheOwnedPdfScan } from './userBookStore'
import { fakeIndexedDb } from './fakeIndexedDb.test-helpers'
const account = vi.hoisted(() => ({ id: 'owner-a' }))
vi.mock('../labLibraryBoot', () => ({ readCachedSupabaseUser: () => ({ id: account.id }) }))
afterEach(() => { vi.unstubAllGlobals(); account.id = 'owner-a' })
const hex = 'ab'.repeat(12), fileId = 'f'.repeat(32)
createRequire(import.meta.url)('../../../public/lab/addbook/js/margin.js')
const unitRules = (globalThis as unknown as { TinctMargin: PdfOriginalUnitRules }).TinctMargin
const scan: PdfScan = { v: 1, title: 'Constructor Theory', author: 'David Deutsch', pages: 40, nav: 'headings', language: 'en', textPages: 40,
  entries: [{ id: 'intro', label: '1. Introduction', page: 1 }, { id: 'motives', label: '2. Motivations', page: 7 }, { id: 'close', label: '4. Conclusion', page: 39 }] }
function fixture() {
  const pdf = { numPages: 40, destroy: vi.fn(async () => {}) }
  const discover = vi.fn(async () => scan), open = vi.fn(() => ({ promise: Promise.resolve(pdf) }))
  const engine = vi.fn(async () => ({ pdfjs: { getDocument: open }, scan: { scan: discover } } as unknown as Awaited<ReturnType<typeof loadPdfEngine>>))
  const cache = vi.fn(async () => {}), bytes = vi.fn(async () => new ArrayBuffer(4)), identity = vi.fn(async () => fileId)
  return { pdf, discover, open, cache, bytes, identity, deps: { engine, cache, bytes, fileId: identity, owner: () => account.id } }
}
it('discovers no-outline PDF headings with the existing local scanner and caches only navigation', async () => {
  const f = fixture(), signal = new AbortController().signal
  const result = await discoverOriginalPdfHeadings(hex, account.id, { signal, fileName: 'Constructor Theory', dependencies: f.deps })
  expect(result).toEqual({ entries: scan.entries, nav: 'headings', pages: 40 })
  expect(f.discover).toHaveBeenCalledWith(f.pdf, { fileName: 'Constructor Theory', live: expect.any(Function) })
  expect(f.cache).toHaveBeenCalledExactlyOnceWith(hex, account.id, scan, fileId)
  expect(f.pdf.destroy).toHaveBeenCalledOnce()
  expect(pdfUnitAt(pdfOriginalUnits(unitRules, 40, [], result), 17)?.title).toBe('2. Motivations')
})
it('does not publish or cache late headings after account change or cancellation', async () => {
  const f = fixture(), controller = new AbortController()
  f.discover.mockImplementationOnce(async () => { controller.abort(); return scan })
  expect(await discoverOriginalPdfHeadings(hex, account.id, { signal: controller.signal, fileName: 'Book', dependencies: f.deps })).toBeNull()
  expect(f.cache).not.toHaveBeenCalled(); expect(f.pdf.destroy).toHaveBeenCalledOnce()
  const changed = fixture()
  changed.discover.mockImplementationOnce(async () => { account.id = 'owner-b'; return scan })
  expect(await discoverOriginalPdfHeadings(hex, 'owner-a', { signal: new AbortController().signal, fileName: 'Book', dependencies: changed.deps })).toBeNull()
  expect(changed.cache).not.toHaveBeenCalled()
})
it('discards discovery if file generation changes during scan or cache, including UI publication', async () => {
  const f = fixture()
  f.identity.mockResolvedValueOnce(fileId).mockResolvedValueOnce(fileId).mockResolvedValueOnce('new-generation')
  expect(await discoverOriginalPdfHeadings(hex, account.id, { signal: new AbortController().signal, fileName: 'Book', dependencies: f.deps })).toBeNull()
  expect(f.cache).not.toHaveBeenCalled()
  const changed = fixture()
  changed.cache.mockImplementationOnce(async () => { changed.identity.mockResolvedValue('new-generation') })
  expect(await discoverOriginalPdfHeadings(hex, account.id, { signal: new AbortController().signal, fileName: 'Book', dependencies: changed.deps })).toBeNull()
})
it('re-reads bytes under a newly downloaded generation before scanning', async () => {
  const f = fixture()
  f.identity.mockResolvedValueOnce(null as unknown as string).mockResolvedValue(fileId)
  await discoverOriginalPdfHeadings(hex, account.id, { signal: new AbortController().signal, fileName: 'Book', dependencies: f.deps })
  expect(f.bytes).toHaveBeenCalledTimes(2)
  expect(f.cache).toHaveBeenCalledWith(hex, account.id, scan, fileId)
})
it('leaves page fallback available when extraction fails or gives invalid source pages', async () => {
  const f = fixture(); f.discover.mockRejectedValueOnce(new Error('No text layer'))
  expect(await discoverOriginalPdfHeadings(hex, account.id, { signal: new AbortController().signal, fileName: 'Scan', dependencies: f.deps })).toBeNull()
  expect(f.pdf.destroy).toHaveBeenCalledOnce()
  const invalid = fixture(); invalid.discover.mockResolvedValueOnce({ ...scan, pages: 39 })
  expect(await discoverOriginalPdfHeadings(hex, account.id, { signal: new AbortController().signal, fileName: 'Book', dependencies: invalid.deps })).toBeNull()
  expect(invalid.cache).not.toHaveBeenCalled()
})
it('guards persisted scans against a replaced file or a different owner', async () => {
  const record = { key: 'pdf:' + hex, kind: 'pdf', owner: account.id, cloudId: fileId, bytes: new ArrayBuffer(4) }
  const records = new Map<string, Record<string, unknown>>([[record.key, record]])
  vi.stubGlobal('indexedDB', fakeIndexedDb(records))
  await cacheOwnedPdfScan(hex, account.id, scan, 'wrong-generation')
  expect(records.get(record.key)?.scan).toBeUndefined()
  await cacheOwnedPdfScan(hex, 'owner-b', scan, fileId)
  expect(records.get(record.key)?.scan).toBeUndefined()
  const swap = cacheOwnedPdfScan(hex, account.id, scan, fileId)
  records.set(record.key, { ...record, cloudId: 'replacement' })
  await swap
  expect(records.get(record.key)?.scan).toBeUndefined()
  records.set(record.key, record)
  const signout = cacheOwnedPdfScan(hex, account.id, scan, fileId)
  account.id = 'owner-b'
  await signout
  expect(records.get(record.key)?.scan).toBeUndefined()
  account.id = 'owner-a'
  await cacheOwnedPdfScan(hex, account.id, scan, fileId)
  expect(records.get(record.key)?.scan).toEqual(scan)
  expect(records.get(record.key)?.bytes).toBe(record.bytes)
})
it('adopts the printed title over a filename but preserves reader-edited labels', async () => {
  const record = { key: 'pdf:' + hex, kind: 'pdf', owner: account.id, cloudId: fileId, name: 'book (1).pdf', title: 'book (1)', author: '', bytes: new ArrayBuffer(4) }
  const records = new Map<string, Record<string, unknown>>([[record.key, record]])
  vi.stubGlobal('indexedDB', fakeIndexedDb(records))
  await cacheOwnedPdfScan(hex, account.id, scan, fileId)
  expect(records.get(record.key)).toMatchObject({title:scan.title,author:scan.author})
  records.set(record.key, {...record,title:'My chosen title',author:'My chosen author',metadataRev:2})
  await cacheOwnedPdfScan(hex, account.id, scan, fileId)
  expect(records.get(record.key)).toMatchObject({title:'My chosen title',author:'My chosen author'})
})

it('retries discovery under fresh bytes when the initial upload finishes during scanning', async () => {
  const f = fixture()
  f.identity.mockResolvedValueOnce(null as unknown as string).mockResolvedValueOnce(null as unknown as string).mockResolvedValue(fileId)
  const result = await discoverOriginalPdfHeadings(hex,account.id,{signal:new AbortController().signal,fileName:'Book',dependencies:f.deps})
  expect(result?.entries).toEqual(scan.entries)
  expect(f.discover).toHaveBeenCalledTimes(2)
  expect(f.bytes).toHaveBeenCalledTimes(2)
  expect(f.cache).toHaveBeenCalledExactlyOnceWith(hex,account.id,scan,fileId)
})

it('preserves a descriptive filename when only conflicting embedded metadata supplies a replacement', async () => {
 const name='An Introduction to Political Philosophy Ten Essays.pdf', title=name.replace(/\.pdf$/,'')
 const record={key:'pdf:'+hex,kind:'pdf',owner:account.id,cloudId:fileId,name,title,bytes:new ArrayBuffer(4)}
 const records=new Map<string,Record<string,unknown>>([[record.key,record]])
 vi.stubGlobal('indexedDB',fakeIndexedDb(records))
 await cacheOwnedPdfScan(hex,account.id,{...scan,title:'Basic Principles of Classical Political Philosophy',source:{title:'metadata'}},fileId)
 expect(records.get(record.key)?.title).toBe(title)
})

it('rescans old heuristic headings without discarding original bytes or outline navigation', async () => {
  const record = {key:'pdf:'+hex,kind:'pdf',owner:account.id,cloudId:fileId,bytes:new ArrayBuffer(4),scan:{...scan,v:6}}
  const records=new Map<string,Record<string,unknown>>([[record.key,record]])
  vi.stubGlobal('indexedDB',fakeIndexedDb(records))
  expect(await readOwnedPdfScanEntries(hex,account.id)).toBeNull()
  records.set(record.key,{...record,scan:{...scan,v:7}})
  expect(await readOwnedPdfScanEntries(hex,account.id)).toMatchObject({entries:scan.entries})
  records.set(record.key,{...record,scan:{...scan,v:6,nav:'outline'}})
  expect(await readOwnedPdfScanEntries(hex,account.id)).toMatchObject({entries:scan.entries})
  expect(records.get(record.key)?.bytes).toBe(record.bytes)
})
