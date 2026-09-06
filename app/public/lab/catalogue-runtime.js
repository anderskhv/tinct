import { wholeBookProgress } from './library-2-model.js'
import {
  LAB_PHONE_PROFILE_MAX_WIDTH,
  LAB_POSITION_DEVICE_KEY,
  LAB_PREFS_DEVICE_KEY,
  LIBRARY_RETURN_SESSION_KEY,
  LIBRARY_SHELF_SESSION_KEY,
  READING_MEMORY_DEVICE_KEY,
  bookDescription,
  claimReveal,
  filterIndexBooks,
  indexHouses,
  labProfileForWidth,
  libraryModeFromDeviceMemory,
  libraryPaletteFromPrefs,
  librarySnapshot,
  moveSelection,
  parseLibrarySnapshot,
  popularBooks,
  popularHead,
  publishedCount,
  revealDelayMs,
  searchPlaceholder,
  shelfScrollLeft,
} from './library-model.js?v=20260906-1'

{
  const root = document.querySelector('#tinct-onboarding-worlds-v5')
  if (!root) throw new Error('Lab pre-reader root is missing')

  const READER_HANDOFF_KEY = 'tinct:lab-reader-handoff'
  const LAB_POSITION_KEY = 'tinct-lab-position'

  const state = {
    catalogue: null,
    booksById: new Map(),
    selectedBookId: 'odyssey',
    selectedEditionKey: null,
    compareEditionKey: null,
    selectionRevision: 0,
    query: '',
    onboarding: null,
    continuations: [],
    pendingResume: null,
    auth: { ready: false, signedIn: false, email: null, name: null },
    /** 'new' (selection shelf) or 'returning' (uniform shelf under the recap). */
    libraryMode: 'new',
    shelfBooks: [],
    shelfIndex: 0,
    expandedHouseId: null,
    /** 'dark' | 'light' | 'book' — the reader's theme preference, applied to the library. */
    palette: 'dark',
    /** window.scrollY when the current search began; null while no search is active. */
    preSearchScrollY: null,
  }
  const coverCache = new Map()
  const worldCache = new Map()
  const editionSampleCache = new Map()
  let editionSampleRenderToken = 0

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
  const number = value => typeof value === 'number' && Number.isFinite(value) ? value : null
  const integer = (value, minimum = 0) => Number.isInteger(value) && value >= minimum ? value : null
  const selectedBook = () => state.booksById.get(state.selectedBookId)
  const v1Editions = book => book.editions.filter(edition => edition.language !== 'da')
  const formatWordCount = count => count ? `${new Intl.NumberFormat().format(count)} words` : 'Length unavailable'
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function readJson(key) {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? null : JSON.parse(raw)
    } catch { return null }
  }

  function defaultEdition(book) {
    const editions = v1Editions(book).filter(edition => edition.availability.chapterText)
    return editions.find(edition => edition.style === 'original' && edition.language === 'en')
      || editions.find(edition => edition.style === 'modern' && edition.language === 'en')
      || editions[0]
  }

  /** Typographic placeholder for books without pilot cover art. */
  function coverData(book) {
    if (coverCache.has(book.id)) return coverCache.get(book.id)
    const title = escapeHtml(book.title.toUpperCase())
    const author = escapeHtml(book.author.toUpperCase())
    const lines = title.length > 20 ? title.split(/\s+/).reduce((rows, word) => {
      const last = rows.at(-1) || ''
      if (!last || `${last} ${word}`.length > 18) rows.push(word)
      else rows[rows.length - 1] = `${last} ${word}`
      return rows
    }, []).slice(0, 4) : [title]
    const titleSvg = lines.map((line, index) => `<text x="150" y="${150 + index * 34}" text-anchor="middle" fill="${book.cover.accent}" font-family="Georgia,serif" font-size="27" font-weight="700">${line}</text>`).join('')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="300" height="450" fill="${book.cover.background}"/><rect x="14" y="14" width="272" height="422" fill="none" stroke="${book.cover.accent}" stroke-opacity=".58"/><path d="M38 79h224M38 367h224" stroke="${book.cover.accent}" stroke-opacity=".75"/><circle cx="150" cy="103" r="20" fill="none" stroke="${book.cover.accent}"/><text x="150" y="110" text-anchor="middle" fill="${book.cover.accent}" font-family="Georgia,serif" font-size="18">${escapeHtml(book.title.charAt(0))}</text>${titleSvg}<text x="150" y="401" text-anchor="middle" fill="${book.cover.accent}" font-family="Arial,sans-serif" font-size="11" letter-spacing="2">${author}</text></svg>`
    const data = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
    coverCache.set(book.id, data)
    return data
  }

  /** Real art when the book has it, else the placeholder. The cover is the image alone. */
  function coverFor(book) {
    if (book?.art?.src) return { src: book.art.src, srcSet: book.art.srcSet || '' }
    return { src: coverData(book), srcSet: '' }
  }

  function coverImage(book, eager = false) {
    const cover = coverFor(book)
    return `<span class="lib-cover"><img src="${escapeHtml(cover.src)}"${cover.srcSet ? ` srcset="${escapeHtml(cover.srcSet)}"` : ''} alt="" decoding="async"${eager ? '' : ' loading="lazy"'}></span>`
  }

  function worldData(book) {
    if (worldCache.has(book.id)) return worldCache.get(book.id)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><radialGradient id="g" cx="28%" cy="18%"><stop stop-color="${book.cover.accent}" stop-opacity=".38"/><stop offset=".55" stop-color="${book.cover.background}"/><stop offset="1" stop-color="#071018"/></radialGradient><filter id="n"><feTurbulence baseFrequency=".015" numOctaves="3" seed="${book.catalogueIndex + 1}"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .11 0"/></filter></defs><rect width="1200" height="900" fill="url(#g)"/><rect width="1200" height="900" filter="url(#n)" opacity=".42"/></svg>`
    const data = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
    worldCache.set(book.id, data)
    return data
  }

  function visibleBooks() {
    return state.catalogue ? filterIndexBooks(state.catalogue, state.query) : []
  }

  function showView(view) {
    root.querySelectorAll('[data-view-panel]').forEach(panel => panel.classList.toggle('is-current', panel.dataset.viewPanel === view))
    root.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)))
  }

  function routeFor(view, bookId = state.selectedBookId) {
    if (view === 'landing') return '/lab/landing'
    if (view === 'library') return '/lab/library'
    return `/lab/?autoplay=0&book=${encodeURIComponent(bookId)}&view=${encodeURIComponent(view)}`
  }

  function navigateView(view, replace = false) {
    if (view !== 'library') rememberLibrary()
    showView(view)
    const method = replace ? 'replaceState' : 'pushState'
    history[method]({ view, bookId: state.selectedBookId }, '', routeFor(view))
  }

  function applyWorld(book) {
    root.querySelectorAll('.tov5-zoom').forEach(zoom => {
      zoom.dataset.bookWorld = book.id
      zoom.style.setProperty('--tov5-world-accent', book.cover.accent)
      zoom.style.setProperty('--tov5-world-ink', book.cover.background)
    })
    const src = worldData(book)
    root.querySelectorAll('[data-book-detail-world-art],[data-edition-world-art],[data-preface-world-art]').forEach(image => { image.src = src })
  }

  function progressRecord(bookId) {
    const value = readJson(`tinct:progress:${bookId}`)
    return value && value.bookId === bookId ? value : null
  }

  function completionRecord(bookId) {
    const record = readJson(`tinct:book-completed:${bookId}`)
    if (record) return { completed: true, completedAt: number(record.completedAt) }
    const progress = progressRecord(bookId)
    const completed = Boolean(progress && (number(progress.percent) >= 100 || (integer(progress.totalChapters, 1) !== null && integer(progress.highestCompletedChapter, 0) >= progress.totalChapters)))
    return { completed, completedAt: null }
  }

  function chapterDetails(book, chapterNumber) {
    const chapters = book?.readingStructure?.chapters || []
    return chapters.find(chapter => chapter.number === chapterNumber) || chapters[Math.max(0, chapterNumber - 1)] || null
  }

  function compactChapterTitle(chapter, fallback) {
    return String(chapter?.title || fallback).split(/\s+[—–-]\s+/)[0].trim()
  }

  function productionPosition(bookId) {
    const value = readJson(`tinct:position:${bookId}`)
    if (!value || value.bookId !== bookId) return null
    const chapterNumber = integer(value.chapterNumber, 1)
    const page = integer(value.currentPage, 0)
    if (chapterNumber === null || page === null) return null
    const book = state.booksById.get(bookId)
    const chapterLabel = compactChapterTitle(chapterDetails(book, chapterNumber), `Chapter ${chapterNumber}`)
    return {
      source: 'production', bookId, chapterNumber, page,
      totalPages: integer(value.totalPages, 1), scrollFraction: number(value.scrollFraction),
      paragraphIndex: integer(value.lastParagraphIndex, 0), updatedAt: number(value.updatedAt) || 0,
      placeLabel: `${chapterLabel}${page > 0 ? ` · Page ${page + 1}` : ''}`,
      recap: `You left off in ${chapterLabel}.`,
    }
  }

  function labPositions() {
    const snapshot = readJson(LAB_POSITION_KEY)
    if (!snapshot || typeof snapshot !== 'object' || !snapshot.books || typeof snapshot.books !== 'object') return []
    return Object.values(snapshot.books).map(place => {
      if (!place || typeof place !== 'object') return null
      const directBook = state.booksById.get(place.bookId)
      const isBiblePlace = !directBook && state.booksById.has('bible') && integer(place.sequentialChapter, 1) !== null && typeof place.headerBook === 'string'
      const book = directBook || (isBiblePlace ? state.booksById.get('bible') : null)
      if (!book) return null
      const chapterNumber = isBiblePlace ? integer(place.sequentialChapter, 1) : integer(place.chapterNumber, 1)
      if (chapterNumber === null) return null
      const page = integer(place.pageIndex, 0)
      const paragraphIndex = integer(place.paragraphIndex, 0)
      const chapterLabel = compactChapterTitle(chapterDetails(book, chapterNumber), isBiblePlace ? `${place.headerBook} ${integer(place.chapterNumber, 1) || 1}` : `Chapter ${chapterNumber}`)
      return {
        source: 'lab', bookId: book.id, chapterNumber, page, paragraphIndex,
        primaryEditionKey: typeof place.primaryEditionKey === 'string' ? place.primaryEditionKey : null,
        compareEditionKey: place.readerMode === 'compare' && typeof place.compareEditionKey === 'string' ? place.compareEditionKey : null,
        updatedAt: number(place.updatedAt) || number(snapshot.lastSettledAt) || 0,
        placeLabel: `${chapterLabel}${page !== null && page > 0 ? ` · Page ${page + 1}` : ''}`,
        recap: `You left off in ${chapterLabel}.`,
      }
    }).filter(Boolean)
  }

  function resolveContinuations() {
    const currentBookId = readJson('tinct:tinct-current-book')
    const candidates = [...labPositions(), ...state.catalogue.books.map(book => productionPosition(book.id)).filter(Boolean)].sort((left, right) => {
      if (left.bookId === currentBookId && right.bookId !== currentBookId) return -1
      if (right.bookId === currentBookId && left.bookId !== currentBookId) return 1
      return right.updatedAt - left.updatedAt
    })
    const seen = new Set()
    return candidates.filter(candidate => !seen.has(candidate.bookId) && seen.add(candidate.bookId))
  }

  function progressFor(resume) {
    const book = state.booksById.get(resume.bookId)
    return wholeBookProgress(book, resume, progressRecord(resume.bookId), completionRecord(resume.bookId).completed)
  }

  function resumeSavedPlace(resume) {
    return resume ? {
      bookId: resume.bookId, chapterNumber: resume.chapterNumber,
      ...(resume.page === null || resume.page === undefined ? {} : { page: resume.page }),
      ...(resume.paragraphIndex === null || resume.paragraphIndex === undefined ? {} : { paragraphIndex: resume.paragraphIndex }),
    } : null
  }

  // ------------------------------------------------------------------ library
  // Locked design: header, (recap, rendered by reading-memory.js), popular
  // shelf, one hairline search row, index of houses. No banners, chips or
  // sign-up nudges.

  const library = () => root.querySelector('[data-library]')
  const chevron = '<svg class="lib-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>'

  function safeSessionStorage() {
    try { return window.sessionStorage } catch { return null }
  }
  function readSession(key) {
    try { return safeSessionStorage()?.getItem(key) ?? null } catch { return null }
  }
  function writeSession(key, value) {
    try { safeSessionStorage()?.setItem(key, value) } catch { /* private mode */ }
  }
  function removeSession(key) {
    try { safeSessionStorage()?.removeItem(key) } catch { /* private mode */ }
  }
  function readLocal(key) {
    try { return localStorage.getItem(key) } catch { return null }
  }

  // Theme carry-over: the library wears the reader's theme for the profile
  // the reader would use at this width (phone ≤ 1024px, else desktop);
  // `system` follows prefers-color-scheme. Tokens live in lab/index.html
  // under html[data-lib-palette].
  const darkScheme = window.matchMedia('(prefers-color-scheme: dark)')
  const phoneProfile = window.matchMedia(`(max-width: ${LAB_PHONE_PROFILE_MAX_WIDTH}px)`)
  function applyPalette() {
    const profile = labProfileForWidth(phoneProfile.matches ? LAB_PHONE_PROFILE_MAX_WIDTH : LAB_PHONE_PROFILE_MAX_WIDTH + 1)
    const palette = libraryPaletteFromPrefs(readLocal(LAB_PREFS_DEVICE_KEY), profile, darkScheme.matches)
    state.palette = palette
    document.documentElement.dataset.libPalette = palette
  }
  applyPalette()
  darkScheme.addEventListener('change', applyPalette)
  phoneProfile.addEventListener('change', applyPalette)
  window.addEventListener('storage', event => { if (event.key === null || event.key === LAB_PREFS_DEVICE_KEY) applyPalette() })
  window.addEventListener('pageshow', applyPalette)

  function setLibraryMode(mode) {
    if (mode !== 'new' && mode !== 'returning') return
    if (state.libraryMode === mode) return
    state.libraryMode = mode
    if (state.catalogue) renderPopular()
  }

  const coverLabels = book => `<span class="lib-cover-copy"><span class="lib-bt">${escapeHtml(book.title)}</span><span class="lib-ba">${escapeHtml(book.author)}</span></span>`

  function shelfItem(book, index) {
    const selected = index === state.shelfIndex
    return `<button type="button" class="lib-shelf-item${selected ? ' is-selected' : ''}" data-shelf-book="${escapeHtml(book.id)}" data-shelf-index="${index}" aria-label="${escapeHtml(book.title)}" aria-current="${selected ? 'true' : 'false'}" style="--lib-delay:${revealDelayMs(index)}ms">${coverImage(book, true)}${coverLabels(book)}</button>`
  }

  /** The popular head, in the index row's language: "POPULAR" left, the count right. One place to change or cut. */
  function renderPopularHead() {
    const head = popularHead(state.shelfBooks.length)
    root.querySelector('[data-popular-eyebrow]').textContent = head.label
    root.querySelector('[data-popular-count]').textContent = head.count
  }

  function renderCaption() {
    const caption = root.querySelector('[data-popular-caption]')
    if (state.libraryMode !== 'new' || !state.shelfBooks.length) {
      caption.innerHTML = ''
      return
    }
    const book = state.shelfBooks[state.shelfIndex]
    caption.innerHTML = `<h1 class="lib-h1" data-popular-title>${escapeHtml(book.title)}</h1><p class="lib-lede" data-popular-blurb>${escapeHtml(bookDescription(book))}</p>`
  }

  /** Horizontal only: the shelf reserves its tallest state, so a selection never moves the page. */
  function revealShelfItem(shelf, item) {
    const style = getComputedStyle(shelf)
    const left = shelfScrollLeft({
      scrollLeft: shelf.scrollLeft,
      clientWidth: shelf.clientWidth,
      itemLeft: item.offsetLeft - shelf.offsetLeft,
      itemWidth: item.offsetWidth,
      padLeft: parseFloat(style.paddingLeft) || 0,
      padRight: parseFloat(style.paddingRight) || 0,
    })
    if (left !== shelf.scrollLeft) shelf.scrollTo({ left, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }

  function setShelfIndex(index, focus = false) {
    const next = moveSelection(index, 0, state.shelfBooks.length)
    state.shelfIndex = next
    writeSession(LIBRARY_SHELF_SESSION_KEY, String(next))
    const shelf = root.querySelector('[data-popular-shelf]')
    shelf.querySelectorAll('[data-shelf-index]').forEach(item => {
      const selected = Number(item.dataset.shelfIndex) === next
      item.classList.toggle('is-selected', selected)
      item.setAttribute('aria-current', String(selected))
      if (selected) {
        if (focus) item.focus({ preventScroll: true })
        revealShelfItem(shelf, item)
      }
    })
    renderCaption()
  }

  function renderPopular() {
    const shelf = root.querySelector('[data-popular-shelf]')
    const section = root.querySelector('[data-library-popular]')
    library().dataset.libraryMode = state.libraryMode
    state.shelfBooks = popularBooks(state.catalogue)
    state.shelfIndex = moveSelection(state.shelfIndex, 0, state.shelfBooks.length)
    section.hidden = state.shelfBooks.length === 0
    renderPopularHead()
    if (state.libraryMode === 'new') {
      shelf.className = 'lib-shelf'
      shelf.innerHTML = state.shelfBooks.map(shelfItem).join('')
      // Slide in from the right, one after another — once per session.
      if (claimReveal(safeSessionStorage(), reducedMotion())) {
        shelf.classList.add('is-revealing')
        const last = shelf.querySelector(`[data-shelf-index="${state.shelfBooks.length - 1}"] .lib-cover`)
        last?.addEventListener('animationend', () => shelf.classList.remove('is-revealing'), { once: true })
      }
    } else {
      shelf.className = 'lib-grid'
      shelf.innerHTML = state.shelfBooks.map(book => `<button type="button" class="lib-grid-item" data-shelf-book="${escapeHtml(book.id)}" aria-label="${escapeHtml(book.title)}">${coverImage(book)}${coverLabels(book)}</button>`).join('')
    }
    renderCaption()
  }

  /** A cover cell: art when the book has it, else the typographic placeholder; title and author underneath. */
  const bookCell = book => `<button type="button" class="lib-cell" data-catalogue-book="${escapeHtml(book.id)}">${coverImage(book)}<span class="lib-cover-copy"><span class="lib-cell-t">${escapeHtml(book.title)}</span><span class="lib-cell-a">${escapeHtml(book.author)}</span></span></button>`
  const bookCells = (books, attr = '') => `<div class="lib-cells"${attr ? ` ${attr}` : ''}>${books.map(bookCell).join('')}</div>`

  function renderIndex() {
    const body = root.querySelector('[data-library-index]')
    const label = root.querySelector('[data-index-label]')
    const count = root.querySelector('[data-index-count]')
    if (state.query.trim()) {
      const books = visibleBooks()
      label.textContent = 'Search results'
      count.textContent = String(books.length)
      body.innerHTML = books.length
        ? bookCells(books, 'data-search-results')
        : `<div class="lib-row is-empty" aria-live="polite"><span class="lib-row-t">No book matches “${escapeHtml(state.query.trim())}”</span></div>`
      return
    }
    label.textContent = 'All books'
    count.textContent = String(publishedCount(state.catalogue))
    body.innerHTML = indexHouses(state.catalogue).map(house => {
      const expanded = house.id === state.expandedHouseId
      return `<div class="lib-index-group"><button type="button" class="lib-row" data-index-house="${escapeHtml(house.id)}" aria-expanded="${expanded}"><span class="lib-row-t">${escapeHtml(house.title)}</span><span class="lib-row-end"><span class="lib-cnt">${house.count}</span>${chevron}</span></button>${expanded ? bookCells(house.books, `data-house-books="${escapeHtml(house.id)}"`) : ''}</div>`
    }).join('')
  }

  // Leaving and coming back. When the library is left — a book opened from
  // the results, the reader, a link — it parks the state Back should find:
  // the scroll position from before the search began, the shelf selection,
  // the open house, and whether the search must be cleared. Back (SPA
  // popstate, bfcache pageshow, or a back/forward load) restores exactly
  // that instead of a stale results view.
  const isLibraryCurrent = () => root.querySelector('[data-view-panel="library"]')?.classList.contains('is-current') === true

  function rememberLibrary() {
    if (!state.catalogue || !isLibraryCurrent()) return
    writeSession(LIBRARY_RETURN_SESSION_KEY, JSON.stringify(librarySnapshot({
      scrollY: window.scrollY,
      preSearchScrollY: state.preSearchScrollY,
      shelfIndex: state.shelfIndex,
      expandedHouseId: state.expandedHouseId,
      query: state.query,
    })))
  }

  function restoreLibrary() {
    const snapshot = parseLibrarySnapshot(readSession(LIBRARY_RETURN_SESSION_KEY))
    if (!snapshot || !state.catalogue) return false
    removeSession(LIBRARY_RETURN_SESSION_KEY)
    if (snapshot.clearSearch || state.query) {
      root.querySelector('[data-library-search]').value = ''
      state.query = ''
      state.preSearchScrollY = null
    }
    state.expandedHouseId = snapshot.expandedHouseId
    renderIndex()
    if (state.libraryMode === 'new' && state.shelfBooks.length) setShelfIndex(snapshot.shelfIndex)
    const settle = () => window.scrollTo({ top: snapshot.scrollY, left: 0, behavior: 'auto' })
    settle()
    requestAnimationFrame(settle)
    return true
  }

  function isBackForwardLoad() {
    try {
      const [entry] = performance.getEntriesByType('navigation')
      return entry?.type === 'back_forward'
    } catch { return false }
  }

  function renderLibrary() {
    root.querySelector('[data-library-search]').placeholder = searchPlaceholder(state.catalogue)
    renderPopular()
    renderIndex()
  }

  // ---------------------------------------------------------- detail / editions

  async function selectBook(bookId, destination = 'book-detail', updateHistory = false) {
    const book = state.booksById.get(bookId)
    if (!book) return false
    state.selectedBookId = book.id
    state.pendingResume = state.continuations.find(item => item.bookId === book.id) || null
    const resumePrimary = v1Editions(book).find(edition => edition.key === state.pendingResume?.primaryEditionKey && edition.availability.chapterText)
    state.selectedEditionKey = resumePrimary?.key || defaultEdition(book)?.key || null
    const resumeCompare = v1Editions(book).find(edition => edition.key === state.pendingResume?.compareEditionKey && edition.availability.compare)
    state.compareEditionKey = resumeCompare?.key || null
    applyWorld(book)
    renderDetail(book)
    renderEditions(book)
    if (updateHistory) navigateView(destination)
    else showView(destination)
    return true
  }

  function renderDetail(book) {
    const cover = coverFor(book)
    root.querySelector('[data-book-detail-cover]').src = cover.src
    root.querySelector('[data-book-detail-cover]').srcset = cover.srcSet
    root.querySelector('[data-book-detail-cover]').alt = book.title
    root.querySelector('[data-book-detail-author]').textContent = book.author
    root.querySelector('[data-book-detail-title]').textContent = book.title
    root.querySelector('[data-book-detail-summary]').textContent = book.summary
    root.querySelector('[data-book-pages]').textContent = formatWordCount(book.wordCount)
    root.querySelector('[data-book-pages]').nextElementSibling.textContent = 'Published text'
    const editions = v1Editions(book)
    root.querySelector('[data-book-read-time]').textContent = `${editions.length} ${editions.length === 1 ? 'edition' : 'editions'}`
    root.querySelector('[data-book-read-time]').nextElementSibling.textContent = 'Available'
    root.querySelector('[data-book-listen-time]').textContent = book.availability.audio ? 'Available' : 'Unavailable'
    root.querySelector('[data-book-listen-time]').nextElementSibling.textContent = 'Audio'
    root.querySelector('.tov5-choose-edition').childNodes[0].textContent = state.pendingResume ? 'Continue reading ' : 'Start reading '
  }

  const languageName = language => ({ en: 'English', da: 'Danish' })[language] || language.toUpperCase()
  const editionTitle = edition => edition.style === 'modern' ? 'Modern' : edition.style === 'original' ? 'Original' : 'Published'
  const editionChoiceLabel = edition => edition.style === 'modern' ? `Modern ${languageName(edition.language)}` : editionTitle(edition)

  function firstReadableParagraph(payload) {
    const chapters = Array.isArray(payload?.chapters) ? payload.chapters : []
    const paragraphs = Array.isArray(payload?.paragraphs) ? payload.paragraphs : chapters.flatMap(chapter => Array.isArray(chapter?.paragraphs) ? chapter.paragraphs : [])
    const cleaned = paragraphs.map(paragraph => String(paragraph || '').replace(/\s+/g, ' ').trim()).filter(Boolean)
    return cleaned.find(paragraph => paragraph.length >= 80) || cleaned[0] || null
  }

  async function fetchJsonIfAvailable(url) {
    try {
      const response = await fetch(url)
      if (!response.ok || !String(response.headers.get('content-type') || '').includes('application/json')) return null
      return await response.json()
    } catch {
      return null
    }
  }

  async function loadEditionSample(bookId, editionKey) {
    const cacheKey = `${bookId}:${editionKey}`
    if (editionSampleCache.has(cacheKey)) return editionSampleCache.get(cacheKey)
    const request = (async () => {
      const manifestUrl = `/data/editions-chapters/${encodeURIComponent(bookId)}-${encodeURIComponent(editionKey)}/manifest.json?v=20260904-1`
      const manifest = await fetchJsonIfAvailable(manifestUrl)
      const chapterPath = manifest?.chapters?.find(chapter => chapter?.path)?.path
      if (chapterPath) {
        const chapter = await fetchJsonIfAvailable(`/data/editions-chapters/${encodeURIComponent(bookId)}-${encodeURIComponent(editionKey)}/${encodeURIComponent(chapterPath)}?v=20260904-1`)
        const chapterSample = firstReadableParagraph(chapter)
        if (chapterSample) return chapterSample
      }
      const edition = await fetchJsonIfAvailable(`/data/editions/${encodeURIComponent(bookId)}-${encodeURIComponent(editionKey)}.json?v=20260904-1`)
      return firstReadableParagraph(edition)
    })()
    editionSampleCache.set(cacheKey, request)
    return request
  }

  async function renderEditionSample(book) {
    const sample = root.querySelector('[data-edition-sample]')
    const heading = root.querySelector('[data-edition-sample-heading]')
    const body = root.querySelector('[data-edition-sample-body]')
    const editions = v1Editions(book)
    const primary = editions.find(edition => edition.key === state.selectedEditionKey)
    const compare = editions.find(edition => edition.key === state.compareEditionKey)
    const choices = [primary, compare].filter(Boolean)
    const token = ++editionSampleRenderToken
    sample.setAttribute('aria-busy', 'true')
    sample.classList.toggle('is-comparison', Boolean(compare))
    heading.textContent = compare ? `${primary.label} and ${compare.label}` : primary?.label || 'Selected edition'
    body.innerHTML = '<p class="tov5-edition-sample-loading">Loading from the published text…</p>'
    const texts = await Promise.all(choices.map(edition => loadEditionSample(book.id, edition.key)))
    if (token !== editionSampleRenderToken) return
    sample.setAttribute('aria-busy', 'false')
    body.innerHTML = choices.map((edition, index) => `<article data-edition-sample-text="${escapeHtml(edition.key)}"><small>${escapeHtml(editionChoiceLabel(edition))}</small><strong>${escapeHtml(edition.label)}</strong><p>${texts[index] ? escapeHtml(texts[index]) : 'Sample unavailable for this published edition.'}</p></article>`).join('')
  }

  function renderEditions(book) {
    const editions = v1Editions(book)
    const cover = coverFor(book)
    root.querySelector('.tov5-edition-head img').src = cover.src
    root.querySelector('.tov5-edition-head img').srcset = cover.srcSet
    root.querySelector('.tov5-edition-head img').alt = book.title
    root.querySelector('.tov5-edition-head small').textContent = book.title
    const grid = root.querySelector('.tov5-edition-grid')
    grid.dataset.editionCount = String(editions.length)
    grid.innerHTML = editions.map(edition => {
      const selected = !state.compareEditionKey && edition.key === state.selectedEditionKey
      const metadata = [languageName(edition.language), edition.year, edition.provenanceLabel, edition.availability.audio ? 'Text and audio available' : 'Text available'].filter(Boolean).join(' · ')
      const choiceLabel = editionChoiceLabel(edition)
      return `<article data-catalogue-edition="${edition.key}" data-select-edition="${edition.key}" data-edition-kind="${edition.style}" class="${selected ? 'is-selected' : ''}" role="button" tabindex="0" aria-pressed="${selected}" aria-label="Choose ${escapeHtml(choiceLabel)}: ${escapeHtml(edition.label)}"><div class="tov5-edition-dropdown"><span><small>${editionTitle(edition)}</small><b>${escapeHtml(edition.label)}</b><em>${escapeHtml(metadata)}</em></span></div><div class="tov5-edition-select" aria-hidden="true"><span></span>${escapeHtml(choiceLabel)}</div></article>`
    }).join('')
    root.querySelectorAll('[data-edition-menu]').forEach(menu => { menu.hidden = true })
    updateCompareOption(book)
    updateContinueLabel(book)
    void renderEditionSample(book)
  }

  function updateCompareOption(book) {
    const editions = v1Editions(book)
    const primary = editions.find(edition => edition.key === state.selectedEditionKey)
    const compare = primary?.aligned ? editions.find(edition => edition.key !== primary.key && edition.availability.compare) : null
    const both = root.querySelector('.tov5-both')
    both.hidden = !compare
    if (compare) {
      both.querySelector('strong').textContent = `${primary.label} + ${compare.label}`
      both.dataset.compareEdition = compare.key
      both.setAttribute('aria-label', `Choose Both: compare ${primary.label} and ${compare.label}`)
    } else {
      delete both.dataset.compareEdition
      both.removeAttribute('aria-label')
    }
    both.classList.toggle('is-selected', Boolean(compare && state.compareEditionKey))
    both.setAttribute('aria-pressed', String(Boolean(compare && state.compareEditionKey)))
  }

  function updateContinueLabel(book) {
    const edition = v1Editions(book).find(item => item.key === state.selectedEditionKey)
    root.querySelector('.tov5-continue').textContent = state.compareEditionKey ? 'Continue with Both' : `Continue with ${edition ? editionChoiceLabel(edition) : 'selected edition'}`
  }

  function selectEdition(primaryEditionKey, compareEditionKey = null) {
    if (state.selectedEditionKey === primaryEditionKey && state.compareEditionKey === compareEditionKey) return false
    state.selectedEditionKey = primaryEditionKey
    state.compareEditionKey = compareEditionKey
    state.selectionRevision += 1
    renderEditions(selectedBook())
    return true
  }

  async function loadOnboarding(book) {
    try {
      const response = await fetch(`/data/onboarding/${encodeURIComponent(book.id)}.json`)
      state.onboarding = response.ok ? await response.json() : null
    } catch {
      state.onboarding = null
    }
    renderOnboarding(book)
  }

  function renderOnboarding(book) {
    const onboarding = state.onboarding
    root.querySelector('[data-preface-title]').textContent = book.title
    root.querySelector('[data-preface-relevance]').textContent = onboarding?.about || book.summary
    root.querySelector('[data-preface-thread]').hidden = true
    root.querySelector('[data-standard-preface]').hidden = false
    const characterSection = root.querySelector('.tov5-character-section')
    const cast = Array.isArray(onboarding?.cast) ? onboarding.cast.slice(0, 4) : []
    characterSection.hidden = cast.length === 0
    if (cast.length) {
      const gallery = characterSection.querySelector('.tov5-character-gallery')
      gallery.innerHTML = cast.map((person, index) => `<button type="button" data-catalogue-character="${index}" aria-pressed="${index === 0}"><span><i data-lucide="user-round" aria-hidden="true"></i></span><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.role)}</small></button>`).join('')
      renderCharacter(cast[0], 0)
    }
    if (window.lucide) window.lucide.createIcons()
  }

  function renderCharacter(person, index) {
    root.querySelectorAll('[data-catalogue-character]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.catalogueCharacter) === index)))
    root.querySelector('[data-character-role]').textContent = person.role
    root.querySelector('[data-character-name]').textContent = person.name
    root.querySelector('[data-character-blurb]').textContent = person.description
  }

  function createHandoff(selection) {
    const book = state.booksById.get(selection?.bookId)
    const editions = book ? v1Editions(book) : []
    const primary = editions.find(edition => edition.key === selection?.primaryEditionKey)
    if (!book || !primary?.availability.chapterText) return null
    const intent = { kind: 'open-reader', bookId: book.id, primaryEditionKey: primary.key }
    if (selection.compareEditionKey) {
      const compare = editions.find(edition => edition.key === selection.compareEditionKey)
      if (!primary.aligned || !compare || compare.key === primary.key || !compare.availability.compare) return null
      intent.compareEditionKey = compare.key
    }
    if (selection.audioEditionKey) {
      const audio = editions.find(edition => edition.key === selection.audioEditionKey)
      if (!audio?.availability.audio) return null
      intent.audioEditionKey = audio.key
    }
    if (selection.savedPlace) {
      const place = selection.savedPlace
      if (place.bookId !== book.id || !Number.isInteger(place.chapterNumber) || place.chapterNumber < 1 || (place.page !== undefined && (!Number.isInteger(place.page) || place.page < 0)) || (place.paragraphIndex !== undefined && (!Number.isInteger(place.paragraphIndex) || place.paragraphIndex < 0))) return null
      intent.savedPlace = { ...place }
    }
    return intent
  }

  function openReader(savedPlace) {
    const book = selectedBook()
    const resolvedPlace = savedPlace || resumeSavedPlace(state.pendingResume)
    const intent = createHandoff({
      bookId: book.id,
      primaryEditionKey: state.selectedEditionKey,
      ...(state.compareEditionKey ? { compareEditionKey: state.compareEditionKey } : {}),
      ...(resolvedPlace ? { savedPlace: resolvedPlace } : {}),
    })
    if (!intent) return false
    window.__tinctLabLastHandoff = intent
    try {
      sessionStorage.setItem(READER_HANDOFF_KEY, JSON.stringify(intent))
      const saved = readJson('tinct:library')
      const ids = new Set(Array.isArray(saved) ? saved : [])
      ids.add(book.id)
      localStorage.setItem('tinct:library', JSON.stringify([...ids]))
    } catch { /* private mode */ }
    window.dispatchEvent(new CustomEvent('tinct:lab-reader-handoff', { detail: intent }))
    rememberLibrary()
    // Neutral reader route: its layout follows the viewport. Explicit
    // /lab/phone and /lab/desktop remain useful QA overrides.
    window.location.assign('/lab/reader')
    return true
  }

  /** The cover is the button: open the book in the reader through the existing handoff. */
  async function openBookFromShelf(bookId) {
    if (!await selectBook(bookId, 'library')) return false
    return openReader()
  }

  root.addEventListener('click', async event => {
    const directView = event.target.closest('[data-view="library"],[data-view="landing"]')
    if (directView) {
      event.preventDefault(); event.stopImmediatePropagation()
      if (directView.dataset.view === 'library' && new URLSearchParams(location.search).get('from') === 'library-2') location.assign('/lab/library-2')
      else navigateView(directView.dataset.view)
      return
    }
    const startCatalogue = event.target.closest('[data-start-catalogue]')
    if (startCatalogue) {
      event.preventDefault(); event.stopImmediatePropagation()
      navigateView('library')
      return
    }
    if (event.target.closest('[data-library-home]')) {
      event.preventDefault(); event.stopImmediatePropagation(); navigateView('landing'); return
    }
    const shelfBook = event.target.closest('[data-shelf-book]')
    if (shelfBook) {
      event.preventDefault(); event.stopImmediatePropagation()
      const index = Number(shelfBook.dataset.shelfIndex)
      // New reader: a tap on a cover that sits back selects it; a tap on the
      // selected cover opens the book. Returning reader: every cover opens.
      if (state.libraryMode === 'new' && Number.isInteger(index) && index !== state.shelfIndex) {
        setShelfIndex(index)
        return
      }
      await openBookFromShelf(shelfBook.dataset.shelfBook)
      return
    }
    const houseRow = event.target.closest('[data-index-house]')
    if (houseRow) {
      event.preventDefault(); event.stopImmediatePropagation()
      const houseId = houseRow.dataset.indexHouse
      state.expandedHouseId = state.expandedHouseId === houseId ? null : houseId
      renderIndex()
      root.querySelector(`[data-index-house="${CSS.escape(houseId)}"]`)?.focus({ preventScroll: true })
      return
    }
    const demoBook = event.target.closest('[data-pick-demo-book="odyssey"]')
    if (demoBook) {
      event.preventDefault(); event.stopImmediatePropagation()
      root.querySelectorAll('[data-frame-panel]').forEach(panel => panel.classList.toggle('is-current', panel.dataset.framePanel === 'versions'))
      root.querySelectorAll('[data-frame-dot]').forEach(dot => dot.setAttribute('aria-pressed', String(dot.dataset.frameDot === 'versions')))
      root.querySelector('[data-demo-step]').textContent = 'Step 2:'
      root.querySelector('[data-demo-step-title]').textContent = 'Pick your translation'
      return
    }
    const bookButton = event.target.closest('[data-catalogue-book]')
    if (bookButton) {
      event.preventDefault(); event.stopImmediatePropagation()
      await selectBook(bookButton.dataset.catalogueBook, 'book-detail', true)
      return
    }
    const editionCard = event.target.closest('[data-catalogue-edition][data-select-edition]')
    if (editionCard) {
      event.preventDefault(); event.stopImmediatePropagation()
      selectEdition(editionCard.dataset.selectEdition)
      return
    }
    const compareCard = event.target.closest('.tov5-both[data-edition-choice]')
    if (compareCard) {
      event.preventDefault(); event.stopImmediatePropagation()
      selectEdition(state.selectedEditionKey, compareCard.dataset.compareEdition)
      return
    }
    const character = event.target.closest('[data-catalogue-character]')
    if (character) {
      event.preventDefault(); event.stopImmediatePropagation()
      renderCharacter(state.onboarding.cast[Number(character.dataset.catalogueCharacter)], Number(character.dataset.catalogueCharacter))
      return
    }
    if (event.target.closest('.tov5-choose-edition')) {
      event.preventDefault(); event.stopImmediatePropagation(); renderEditions(selectedBook()); navigateView('edition'); return
    }
    if (event.target.closest('.tov5-continue')) {
      event.preventDefault(); event.stopImmediatePropagation(); openReader(); return
    }
    if (event.target.closest('[data-begin-reading]')) {
      event.preventDefault(); event.stopImmediatePropagation(); openReader(); return
    }
  }, true)

  root.addEventListener('keydown', event => {
    const target = event.target instanceof Element ? event.target : null
    const shelfItem = target?.closest('[data-shelf-index]')
    if (shelfItem && state.libraryMode === 'new') {
      const count = state.shelfBooks.length
      const moves = { ArrowLeft: -1, ArrowRight: 1, Home: -count, End: count }
      if (event.key in moves) {
        event.preventDefault()
        setShelfIndex(moveSelection(state.shelfIndex, moves[event.key], count), true)
        return
      }
    }
    if (event.key === 'Escape' && target?.matches('[data-library-search]') && state.query) {
      event.preventDefault()
      target.value = ''
      state.query = ''
      state.preSearchScrollY = null
      renderIndex()
      return
    }
    if (event.key !== 'Enter' && event.key !== ' ') return
    const editionCard = target?.closest('[data-catalogue-edition][data-select-edition]')
    const compareCard = target?.closest('.tov5-both[data-edition-choice]')
    if (!editionCard && !compareCard) return
    event.preventDefault()
    if (editionCard) selectEdition(editionCard.dataset.selectEdition)
    else selectEdition(state.selectedEditionKey, compareCard.dataset.compareEdition)
  })

  root.addEventListener('input', event => {
    if (!event.target.matches('[data-library-search]')) return
    const next = event.target.value
    if (next.trim() && !state.query.trim()) state.preSearchScrollY = window.scrollY
    if (!next.trim()) state.preSearchScrollY = null
    state.query = next
    renderIndex()
  })

  window.__tinctLabPreReader = {
    ready: false,
    createHandoff,
    selectBook,
    openBook: openBookFromShelf,
    visibleBooks,
    coverFor: bookId => state.booksById.has(bookId) ? coverFor(state.booksById.get(bookId)) : null,
    bookProgress: (bookId, place) => {
      const book = state.booksById.get(bookId)
      return book ? wholeBookProgress(book, place, progressRecord(bookId), completionRecord(bookId).completed) : null
    },
    libraryState: () => ({ mode: state.libraryMode, shelfIndex: state.shelfIndex, shelf: state.shelfBooks.map(book => book.id), query: state.query, expandedHouseId: state.expandedHouseId, palette: state.palette, preSearchScrollY: state.preSearchScrollY }),
    setLibraryMode,
    selectionState: () => ({ primaryEditionKey: state.selectedEditionKey, compareEditionKey: state.compareEditionKey, revision: state.selectionRevision }),
    continuations: () => state.continuations.map(item => ({ ...item, progress: progressFor(item) })),
    authState: () => ({ ...state.auth }),
    renderEditionsForTest(book) {
      const previous = state.booksById.get(book.id)
      state.booksById.set(book.id, book)
      state.selectedBookId = book.id
      state.selectedEditionKey = book.editions[0]?.key || null
      renderEditions(book)
      if (previous) state.booksById.set(book.id, previous)
    },
  }

  // Provisional mode from the device mirror, so the shelf paints in the right
  // shape on first render; reading-memory.js confirms or corrects it once the
  // recap has loaded.
  state.libraryMode = libraryModeFromDeviceMemory(readLocal(READING_MEMORY_DEVICE_KEY), readLocal(LAB_POSITION_DEVICE_KEY))
  if (window.__tinctLabLibraryMode === 'new' || window.__tinctLabLibraryMode === 'returning') state.libraryMode = window.__tinctLabLibraryMode
  // The shelf selection outlives a trip into a book or the reader.
  state.shelfIndex = Number.parseInt(readSession(LIBRARY_SHELF_SESSION_KEY) ?? '', 10) || 0
  // The library restores its own scroll position on the way back.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

  fetch('/lab/catalogue.json?v=20260905-1').then(response => {
    if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`)
    return response.json()
  }).then(catalogue => {
    state.catalogue = catalogue
    state.booksById = new Map(catalogue.books.map(book => [book.id, book]))
    state.auth = window.__tinctLabAuthState || state.auth
    state.continuations = resolveContinuations()
    renderLibrary()
    const params = new URLSearchParams(location.search)
    const requested = params.get('book')
    const routeView = location.pathname.replace(/\/+$/, '') === '/lab/library' ? 'library' : 'landing'
    const requestedView = params.get('view')
    const allowedViews = new Set(['landing', 'library', 'book-detail', 'edition'])
    return selectBook(state.booksById.has(requested) ? requested : 'odyssey', allowedViews.has(requestedView) ? requestedView : routeView)
  }).then(() => {
    if (isLibraryCurrent() && isBackForwardLoad()) restoreLibrary()
    else if (isLibraryCurrent()) removeSession(LIBRARY_RETURN_SESSION_KEY)
    window.__tinctLabPreReader.ready = true
    window.dispatchEvent(new CustomEvent('tinct:lab-catalogue-ready'))
  }).catch(error => {
    console.error(error)
    root.querySelector('.tov5-note').textContent = 'Published catalogue unavailable.'
  })

  window.addEventListener('tinct:lab-auth-state', event => {
    state.auth = event.detail || state.auth
  })

  window.addEventListener('tinct:lab-library-mode', event => {
    setLibraryMode(event.detail?.mode)
  })

  window.addEventListener('popstate', async () => {
    if (!state.catalogue) return
    const params = new URLSearchParams(location.search)
    const bookId = params.get('book')
    const path = location.pathname.replace(/\/+$/, '')
    const view = path === '/lab/library' ? 'library' : path === '/lab/landing' || path === '/lab' ? (params.get('view') || 'landing') : 'landing'
    if (view !== 'library') rememberLibrary()
    if (bookId && state.booksById.has(bookId) && (view === 'book-detail' || view === 'edition')) {
      await selectBook(bookId, view)
    } else {
      showView(view === 'library' ? 'library' : 'landing')
      if (view === 'library') restoreLibrary()
    }
  })

  window.addEventListener('pageshow', event => {
    if (event.persisted && isLibraryCurrent()) restoreLibrary()
  })
  window.addEventListener('pagehide', () => { rememberLibrary() })
}
