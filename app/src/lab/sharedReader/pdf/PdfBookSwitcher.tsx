import { useEffect, useState } from 'react'
import { LabBookSwitcher } from '../../LabBookSwitcher'
import { BOOKS } from '../../../data/bookRegistry'
import { readCachedSupabaseUser } from '../../labLibraryBoot'
import { readLabPositionLocal } from '../../labPositionStore'
import { accountLabPositionRecord } from '../../labPosition'
import { readDeviceReadingMemory } from '../../../readingMemory'
import { readShelfMembership } from '../../../libraryTwoSaved'
import { ownQuickBookRows, quickBookCompletedIds, quickBookPositions, quickBookRows, withOwnBookRows, type QuickBookCatalogueEntry, type QuickBookRow } from '../../../preReader/quickBookSwitcher'
import { registeredPublicEntries, fetchPublicBooksIndex } from '../../../utils/publicBooks'
import { ownReadingNow, readOwnShelf } from '../../userBook/ownShelf'
import { ownReadingNowWithAccount } from '../../userBook/ownSync'
import { continueHandoff } from '../../../preReader/continueHandoff'
import { LAB_READER_HANDOFF_KEY } from '../../labReaderHandoff'
import { sharedReaderDestination } from '../sharedReaderFlag'

/** Same Reading now rows and saved-place handoff as the text reader. */
export function PdfBookSwitcher({ owner: providedOwner, bookId, title, chapterLabel, onClose, beforeLeave }: { owner?: string; bookId: string; title: string; chapterLabel: string; onClose: () => void; beforeLeave: () => void }) {
  const identity = `${providedOwner ?? ''}:${bookId}`
  const [result, setResult] = useState<{ identity: string; rows: QuickBookRow[] }>({ identity, rows: [] })
  const rows = result.identity === identity ? result.rows : []
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let live = true, ownSettled = false
    const controller = new AbortController()
    setLoading(true); setError('')
    const timeout = window.setTimeout(() => { if (live) { setLoading(false); setError('Showing books saved on this device.'); controller.abort() } }, 4000)
    const owner = providedOwner ?? readCachedSupabaseUser()?.id ?? null
    let own: QuickBookRow[] = [], tinct: QuickBookRow[] = []
    const paint = () => { if (live) setResult({ identity, rows: withOwnBookRows(tinct, own) }) }
    const build = (catalogue: QuickBookCatalogueEntry[], added = registeredPublicEntries(), complete = false) => {
      try { tinct = quickBookRows({ catalogue, positions: quickBookPositions(accountLabPositionRecord(readLabPositionLocal(), null, owner), catalogue, key => localStorage.getItem(key)), memory: readDeviceReadingMemory(), viewer: owner, completedBookIds: quickBookCompletedIds(localStorage), membership: readShelfMembership(owner), added: { entries: added, complete } }); paint() } catch { /* local data may be unavailable */ }
    }
    build(BOOKS.map(book => ({ id: book.id, title: book.title, author: book.author, art: { src: `/covers/v2/${book.id}.webp` } })))
    void readOwnShelf(owner).then(books => { if (!ownSettled) { own = ownQuickBookRows(ownReadingNow(books)); paint() } }, () => {})
    const ownReady = ownReadingNowWithAccount(owner).then(books => { ownSettled = true; own = ownQuickBookRows(books); paint() }, () => {})
    void Promise.all([fetch('/lab/catalogue.json', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error(); return response.json() }), fetchPublicBooksIndex()]).then(([payload, added]) => {
      if (!Array.isArray(payload.books)) throw new Error()
      build(payload.books, [...registeredPublicEntries(), ...(added ?? [])], !!added)
    }).catch(() => { if (live) setError('Showing books saved on this device.') }).finally(() => { void ownReady.finally(() => { if (live) { window.clearTimeout(timeout); setLoading(false) } }) })
    return () => { live = false; window.clearTimeout(timeout); controller.abort() }
  }, [identity, providedOwner])
  const select = (row: QuickBookRow) => {
    if (row.href) { beforeLeave(); window.location.assign(sharedReaderDestination(row.href)); return }
    const intent = continueHandoff(row.target)
    if (!intent) { setError('That saved place is temporarily unavailable.'); return }
    try { sessionStorage.setItem(LAB_READER_HANDOFF_KEY, JSON.stringify(intent)) } catch { setError('That saved place is temporarily unavailable.'); return }
    beforeLeave(); window.location.assign(sharedReaderDestination('/reader'))
  }
  return <LabBookSwitcher current={{ bookId, title, chapterLabel, coverSrc: '' }} rows={rows} loading={loading} error={error} onClose={onClose} onSelect={select} onLibrary={() => { beforeLeave(); window.location.assign('/library?sharedReader=1') }} />
}
