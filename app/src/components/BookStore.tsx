import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { Book, ReadingPosition, ReadingProgress } from '../types'
import { getReadingProgress, getSavedPosition } from '../hooks/useReadingPosition'
import { storage } from '../services/storage'
import {
  LIBRARY_BOOK_LISTS,
  LIBRARY_BOOK_META,
  LIBRARY_BOOK_META_BY_ID,
  LIBRARY_ERAS,
  LIBRARY_FORMS,
  LIBRARY_HOUSES,
  LIBRARY_READING_LISTS,
  LIBRARY_SHELVES,
  type LibraryBookMeta,
} from '../data/libraryTaxonomy'

export interface BookStoreSelectOptions {
  wasInLibrary: boolean
  hasProgress: boolean
  intent: 'begin' | 'continue' | 'read-danish'
}

interface BookStoreProps {
  books: Book[]
  libraryIds: string[]
  onRemoveBook?: (bookId: string) => void
  onSelectBook: (bookId: string, options: BookStoreSelectOptions) => void
  onClose?: () => void
}

type LibraryView = 'library' | 'form' | 'author' | 'era' | 'canon'

interface LibraryItem extends LibraryBookMeta {
  book?: Book
  available: boolean
  inLibrary: boolean
  percent: number
  hasProgress: boolean
  finished: boolean
}

export function isFinished(p: ReadingProgress | null | undefined): boolean {
  if (!p) return false
  if (p.totalChapters > 0 && p.highestCompletedChapter >= p.totalChapters) return true
  return p.percent >= 100 || (p.positionPercent ?? 0) >= 100
}

export function hasStartedPosition(position: ReadingPosition | null | undefined): boolean {
  if (!position) return false
  return (
    (position.chapterNumber ?? 1) > 1 ||
    (position.currentPage ?? 0) > 0 ||
    (position.scrollFraction ?? 0) > 0.01 ||
    (position.lastParagraphIndex ?? 0) > 0
  )
}

function progressFor(book?: Book): { progress: ReadingProgress | null; position: ReadingPosition | null } | null {
  if (!book) return null
  return {
    progress: getReadingProgress(book.id),
    position: getSavedPosition(book.id),
  }
}

function hueStyle(hue: number) {
  return { '--h': hue } as CSSProperties
}

function formatPercent(percent: number) {
  return `${Math.max(1, Math.min(100, Math.round(percent)))}%`
}

function estimateLength(book?: Book) {
  if (!book?.wordCount) return null
  const pages = Math.max(1, Math.round(book.wordCount / 275))
  const minutes = Math.max(1, Math.round(book.wordCount / 220))
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return {
    pages,
    readingTime: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
  }
}

function BookCover({ item, size = 'normal' }: { item: LibraryItem; size?: 'tiny' | 'small' | 'normal' | 'large' }) {
  return (
    <div className={`library-cover library-cover-${size} ${item.stub ? 'library-cover-stub' : ''}`} style={hueStyle(item.hue)}>
      <div className="library-cover-spine" />
      {item.stub && <span className="library-cover-soon">Soon</span>}
      {item.finished && <span className="library-cover-done">✓</span>}
      <div className="library-cover-rule" />
      <div className="library-cover-title">{item.title}</div>
      <div className="library-cover-author">{item.author}</div>
      <div className="library-cover-year">{item.year}</div>
      {item.hasProgress && !item.finished && (
        <div className="library-cover-progress">
          <span style={{ width: `${item.percent}%` }} />
        </div>
      )}
    </div>
  )
}

function itemMatches(item: LibraryItem, q: string) {
  if (!q) return true
  const haystack = [
    item.title,
    item.author,
    item.tradition,
    item.blurb,
    item.form,
    item.era,
    ...item.themes,
    ...item.shelves.map(shelfId => LIBRARY_SHELVES[shelfId]?.title),
  ].filter(Boolean).join(' ').toLowerCase()
  return haystack.includes(q)
}

export function BookStore({ books, libraryIds, onRemoveBook, onSelectBook, onClose }: BookStoreProps) {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<LibraryView>('library')
  const [formFilter, setFormFilter] = useState('all')
  const [canonId, setCanonId] = useState(LIBRARY_READING_LISTS[0]?.id || '')
  const [detailId, setDetailId] = useState<string | null>(null)

  useEffect(() => {
    if (!detailId) return
    document.querySelector('.library-store')?.scrollTo({ top: 0, behavior: 'auto' })
  }, [detailId])

  const items = useMemo<LibraryItem[]>(() => {
    const booksById = new Map(books.map(book => [book.id, book]))
    const metas = [...LIBRARY_BOOK_META]
    for (const book of books) {
      if (LIBRARY_BOOK_META_BY_ID[book.id]) continue
      metas.push({
        id: book.id,
        title: book.title,
        author: book.author,
        year: book.year ? String(book.year) : '',
        ySort: book.year ?? 9999,
        form: 'novel',
        era: 'contemporary',
        hue: 75,
        blurb: book.description || '',
        themes: [],
        shelves: [],
      })
    }
    return metas.map(meta => {
      const book = booksById.get(meta.id)
      const readingState = progressFor(book)
      const progress = readingState?.progress
      const position = readingState?.position
	      const finished = isFinished(progress) || !!(book && storage.get(`book-completed:${book.id}`))
      const hasPosition = hasStartedPosition(position)
      const percent = progress?.positionPercent ?? progress?.percent ?? (hasPosition ? 1 : 0)
      const hasProgress = percent > 0 || hasPosition
      return {
        ...meta,
        book,
        available: !!book && !meta.stub,
        inLibrary: libraryIds.includes(meta.id),
        percent,
        hasProgress,
        finished,
        stub: meta.stub || !book,
      }
    }).sort((a, b) => a.ySort - b.ySort || a.title.localeCompare(b.title))
  }, [books, libraryIds])

  const itemsById = useMemo(() => new Map(items.map(item => [item.id, item])), [items])
  const q = query.trim().toLowerCase()
  const searchResults = useMemo(() => items.filter(item => itemMatches(item, q)), [items, q])
  const detailItem = detailId ? itemsById.get(detailId) : null
  const activeList = LIBRARY_READING_LISTS.find(list => list.id === canonId) || LIBRARY_READING_LISTS[0]

  const readingItems = items
    .filter(item => item.available && item.inLibrary && item.hasProgress && !item.finished)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 8)
  const finishedItems = items
    .filter(item => item.available && item.inLibrary && item.finished)
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 8)
  const finishedCount = finishedItems.length
  const pausedCount = items.filter(item => item.hasProgress && !item.finished && !item.inLibrary).length

  const openReader = (item: LibraryItem, intent: BookStoreSelectOptions['intent'] = item.hasProgress ? 'continue' : 'begin') => {
    if (!item.available) return
    onSelectBook(item.id, {
      wasInLibrary: item.inLibrary,
      hasProgress: item.hasProgress,
      intent,
    })
  }

  const removeFromLibrary = (item: LibraryItem) => {
    if (!onRemoveBook || !item.inLibrary) return
    onRemoveBook(item.id)
  }

  const scrollToHouse = (houseId: string) => {
    const container = document.querySelector('.library-store')
    const target = document.getElementById(`house-${houseId}`)
    if (!container || !target) return
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const stickyOffset = window.matchMedia('(max-width: 760px)').matches ? 210 : 142
    container.scrollTo({
      top: container.scrollTop + targetRect.top - containerRect.top - stickyOffset,
      behavior: 'smooth',
    })
  }

  const renderCard = (item: LibraryItem, size: 'small' | 'normal' = 'normal') => (
    <button key={item.id} className={`library-card ${item.stub ? 'is-stub' : ''} ${item.finished ? 'is-finished' : ''}`} onClick={() => setDetailId(item.id)}>
      <BookCover item={item} size={size} />
      <span className="library-card-title">{item.title}</span>
      <span className="library-card-author">{item.author}</span>
      <span className="library-card-meta">
        {item.stub ? 'Coming soon' : item.book ? [...new Set(item.book.editions.map(e => e.language.toUpperCase()))].join(' / ') : 'Soon'}
        {item.finished ? ' · Finished' : item.hasProgress ? ` · ${formatPercent(item.percent)}` : ''}
      </span>
    </button>
  )

  const renderSearch = () => (
    <section className="library-search-results">
      <div className="library-section-head">
        <div>
          <p className="library-kicker">Search</p>
          <h2>{searchResults.length ? `${searchResults.length} results` : `Nothing matches "${query}"`}</h2>
        </div>
      </div>
      <div className="library-grid">
        {searchResults.map(item => renderCard(item))}
      </div>
    </section>
  )

  const renderLibrary = () => (
    <>
      <nav className="library-house-nav" aria-label="Library houses">
        {LIBRARY_HOUSES.map(house => (
          <button key={house.id} style={hueStyle(house.hue)} onClick={() => scrollToHouse(house.id)}>
            <span />{house.title}
          </button>
        ))}
      </nav>
      {LIBRARY_HOUSES.map(house => {
        const houseItems = items.filter(item => item.shelves.some(shelfId => house.shelves.includes(shelfId)))
        if (houseItems.length === 0) return null
        return (
          <section key={house.id} id={`house-${house.id}`} className="library-house" style={hueStyle(house.hue)}>
            <header className="library-house-head">
              <span className="library-house-marker" />
              <div>
                <h2>{house.title}</h2>
              </div>
              <div className="library-house-count"><strong>{houseItems.length}</strong><span>Volumes</span></div>
            </header>
            <div className="library-shelves">
              {house.shelves.map(shelfId => {
                const shelf = LIBRARY_SHELVES[shelfId]
                const shelfItems = items.filter(item => item.shelves.includes(shelfId))
                if (!shelf || shelfItems.length === 0) return null
                return (
                  <section key={shelfId} className="library-shelf" style={hueStyle(shelf.hue)}>
                    <div className="library-shelf-head">
                      <div><h3>{shelf.title}</h3></div>
                      <span>{shelfItems.length} volumes</span>
                    </div>
                    <div className="library-rail">{shelfItems.map(item => renderCard(item, 'small'))}</div>
                  </section>
                )
              })}
            </div>
          </section>
        )
      })}
    </>
  )

  const renderForm = () => {
    const visible = formFilter === 'all' ? items : items.filter(item => item.form === formFilter)
    return (
      <section className="library-panel">
        <div className="library-chips">
          {LIBRARY_FORMS.map(form => (
            <button key={form.id} className={formFilter === form.id ? 'active' : ''} onClick={() => setFormFilter(form.id)}>
              {form.label}<span>{form.id === 'all' ? items.length : items.filter(item => item.form === form.id).length}</span>
            </button>
          ))}
        </div>
        <div className="library-grid">{visible.map(item => renderCard(item))}</div>
      </section>
    )
  }

  const renderAuthor = () => {
    const grouped = new Map<string, LibraryItem[]>()
    for (const item of items) grouped.set(item.author, [...(grouped.get(item.author) || []), item])
    return (
      <section className="library-panel">
        {[...grouped.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).map(([author, authorItems]) => (
          <div key={author} className="library-author-group">
            <header><h2>{author}</h2><span>{authorItems.length} volumes</span></header>
            <div className="library-rail">{authorItems.map(item => renderCard(item, 'small'))}</div>
          </div>
        ))}
      </section>
    )
  }

  const renderEra = () => (
    <section className="library-panel">
      {Object.values(LIBRARY_ERAS).map(era => {
        const eraItems = items.filter(item => item.era === era.id)
        if (eraItems.length === 0) return null
        return (
          <div key={era.id} className="library-era-group">
            <header><h2>{era.label}</h2><span>{era.range} · {eraItems.length} volumes</span></header>
            <div className="library-grid">{eraItems.map(item => renderCard(item))}</div>
          </div>
        )
      })}
    </section>
  )

  const renderCanon = () => (
    <section className="library-panel">
      <div className="library-canon-tabs">
        {LIBRARY_READING_LISTS.map(list => (
          <button key={list.id} className={activeList?.id === list.id ? 'active' : ''} style={hueStyle(list.accent)} onClick={() => setCanonId(list.id)}>{list.title}</button>
        ))}
      </div>
      {activeList && (
        <div className="library-canon-list" style={hueStyle(activeList.accent)}>
          <header>
            <p className="library-kicker">{activeList.source}</p>
            <h2>{activeList.title}</h2>
            <p>{activeList.description}</p>
          </header>
          {activeList.sequence.map((entry, index) => {
            const item = entry.id ? itemsById.get(entry.id) : undefined
            return (
              <button key={`${entry.id || entry.title}-${index}`} className="library-canon-row" onClick={() => item && setDetailId(item.id)} disabled={!item && !entry.missing}>
                <span className="library-canon-number">{index + 1}</span>
                {item ? <BookCover item={item} size="tiny" /> : <span className="library-canon-missing-cover">Soon</span>}
                <span className="library-canon-main">
                  <strong>{item?.title || entry.title}</strong>
                  <em>{item?.author || entry.author}</em>
                  {entry.note && <small>{entry.note}</small>}
                </span>
                <span className="library-canon-status">{item?.stub || entry.missing ? 'Coming soon' : item?.hasProgress ? formatPercent(item.percent) : 'In library'}</span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )

  const renderDetail = (item: LibraryItem) => {
    const length = estimateLength(item.book)
    const detailText = item.book?.description || item.blurb
    const shelfItems = item.shelves
      .map(shelfId => ({ shelfId, shelf: LIBRARY_SHELVES[shelfId], items: items.filter(other => other.id !== item.id && other.shelves.includes(shelfId)).slice(0, 12) }))
      .filter(group => group.shelf && group.items.length > 0)
    const sameAuthor = items.filter(other => other.id !== item.id && other.author === item.author).slice(0, 12)
    const sameEra = items.filter(other => other.id !== item.id && other.era === item.era).slice(0, 12)
    const lists = LIBRARY_BOOK_LISTS[item.id] || []
    return (
      <section className="library-detail" style={hueStyle(item.hue)}>
        <button className="library-back" onClick={() => setDetailId(null)}>← The Library</button>
        <div className="library-detail-hero">
          <div className="library-detail-cover"><BookCover item={item} size="large" /></div>
          <div className="library-detail-copy">
            <p className="library-kicker">{item.year}</p>
            <h1>{item.title}</h1>
            <p className="library-detail-author">{item.author}{item.tradition ? ` · ${item.tradition}` : ''}</p>
            <p className="library-detail-blurb">{detailText}</p>
            <div className="library-detail-meta">
              <span>Form</span><strong>{item.form}</strong>
              <span>Era</span><strong>{LIBRARY_ERAS[item.era as keyof typeof LIBRARY_ERAS]?.label || item.era}</strong>
              <span>Length</span><strong>{length ? `${length.pages} pages · ${length.readingTime}` : 'Coming soon'}</strong>
              <span>Themes</span><strong>{item.themes.join(', ')}</strong>
              <span>Lists</span><strong>{lists.length ? lists.map(list => `${list.listTitle} #${list.position}`).join(' · ') : 'Not on a canon list yet'}</strong>
            </div>
            <div className="library-detail-actions">
              <button className="library-primary" disabled={!item.available} onClick={() => openReader(item)}>
                {item.stub ? 'Coming soon' : item.finished ? 'Read again' : item.hasProgress ? `Continue · ${formatPercent(item.percent)}` : 'Begin reading'}
              </button>
              {item.available && item.book?.editions.some(e => e.language === 'da') && (
                <button className="library-secondary" onClick={() => openReader(item, 'read-danish')}>Read in Danish</button>
              )}
              {item.inLibrary && onRemoveBook && (
                <button className="library-secondary" onClick={() => removeFromLibrary(item)}>Remove from library</button>
              )}
            </div>
          </div>
        </div>
        {sameAuthor.length > 0 && <Related title={`More from ${item.author}`} items={sameAuthor} renderCard={renderCard} />}
        {shelfItems.map(group => <Related key={group.shelfId} title={group.shelf.title} sub={group.shelf.sub} items={group.items} renderCard={renderCard} hue={group.shelf.hue} />)}
        {sameEra.length > 0 && <Related title={`Contemporaries — ${LIBRARY_ERAS[item.era as keyof typeof LIBRARY_ERAS]?.label || item.era}`} items={sameEra} renderCard={renderCard} />}
      </section>
    )
  }

  return (
    <div className="library-store">
      <div className="library-shell">
        <header className="library-topbar">
          <div className="library-brand">
            <h1>Tinct<span>.</span></h1>
            <p>Library</p>
            <div className="library-activity">
              <span className="reading" /> {readingItems.length} reading
              <span className="paused" /> {pausedCount} paused
              <span className="finished" /> {finishedCount} finished
            </div>
          </div>
          <label className="library-search">
            <span />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, author, theme" />
            {query && <button onClick={() => setQuery('')} aria-label="Clear search">×</button>}
          </label>
          <div className="library-view-toggle">
            {(['library', 'form', 'author', 'era', 'canon'] as LibraryView[]).map(nextView => (
              <button key={nextView} className={view === nextView ? 'active' : ''} onClick={() => setView(nextView)}>
                {nextView === 'library' ? 'Library' : `By ${nextView}`}
              </button>
            ))}
          </div>
          {onClose && <button className="library-close" onClick={onClose} aria-label="Close library">×</button>}
        </header>

        {!detailItem && readingItems.length > 0 && (
          <section className="library-continue">
            <header><p className="library-kicker">Continue reading</p><span>{readingItems.length}</span></header>
            <div className="library-continue-rail">
          {readingItems.map(item => (
                <div key={item.id} className="library-continue-pill">
                  <button className="library-continue-open" onClick={() => openReader(item)}>
                    <BookCover item={item} size="tiny" />
                    <span><strong>{item.title}</strong><em>{item.author}</em><small><b style={{ width: `${item.percent}%` }} />{formatPercent(item.percent)}</small></span>
                  </button>
                  {onRemoveBook && (
                    <button className="library-continue-remove" onClick={() => removeFromLibrary(item)} aria-label={`Remove ${item.title} from currently reading`}>
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!detailItem && finishedItems.length > 0 && (
          <section className="library-finished">
            <header><p className="library-kicker">Finished</p><span>{finishedItems.length}</span></header>
            <div className="library-rail">{finishedItems.map(item => renderCard(item, 'small'))}</div>
          </section>
        )}

        <main className="library-body">
          {detailItem ? renderDetail(detailItem) : q ? renderSearch() : view === 'library' ? renderLibrary() : view === 'form' ? renderForm() : view === 'author' ? renderAuthor() : view === 'era' ? renderEra() : renderCanon()}
        </main>
      </div>
    </div>
  )
}

function Related({ title, sub, items, renderCard, hue }: { title: string; sub?: string; items: LibraryItem[]; renderCard: (item: LibraryItem, size?: 'small' | 'normal') => ReactNode; hue?: number }) {
  return (
    <section className="library-related" style={hue ? hueStyle(hue) : undefined}>
      <header><h2>{title}</h2>{sub && <p>{sub}</p>}</header>
      <div className="library-rail">{items.map(item => renderCard(item, 'small'))}</div>
    </section>
  )
}
