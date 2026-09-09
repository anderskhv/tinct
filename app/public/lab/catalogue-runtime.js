import { fullShelf, pairedSamples } from './entry-model.js?v=20260909-1'
import { wholeBookProgress } from './library-2-model.js'
import {
  readerPreviewSearch,
  DEFAULT_LANDING_WORLD,
  LANDING_WORLD_SESSION_KEY,
  landingWorldFrom,
  mostVisibleWorld,
  LAB_POSITION_DEVICE_KEY,
  LIBRARY_RETURN_SESSION_KEY,
  LIBRARY_SHELF_SESSION_KEY,
  READING_MEMORY_DEVICE_KEY,
  bookDescription,
  claimReveal,
  filterIndexBooks,
  indexHouses,
  libraryModeFromDeviceMemory,
  librarySnapshot,
  libraryViewFromLocation,
  moveSelection,
  parseLibrarySnapshot,
  popularBooks,
  popularLead,
  popularShelfSize,
  publishedCount,
  readerWordsPerMinute,
  readingTimeLine,
  revealDelayMs,
  searchPlaceholder,
  shelfFocusIndex,
  writeReaderOrigin,
  shelfScrollLeft,
  showPopularShelf,
} from './library-model.js?v=20260908-9'

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
    fullLibrary: false,
    searchOpen: false,
    sampleExpanded: false,
    prefaceToken: 0,
    onboarding: null,
    continuations: [],
    pendingResume: null,
    auth: { ready: false, signedIn: false, email: null, name: null },
    /** 'new' (selection shelf) or 'returning' (uniform shelf under the recap). */
    libraryMode: 'new',
    shelfBooks: [],
    shelfIndex: 0,
    expandedHouseId: null,
    /** The landing world the whole pre-reader is wearing. */
    world: DEFAULT_LANDING_WORLD,
  }
  const coverCache = new Map()
  const worldCache = new Map()
  const editionSampleCache = new Map()
  let editionSampleRenderToken = 0
  /**
   * The version list's samples have their own token. They used to share the
   * edition screen's, and the book page renders both in one pass — so the
   * edition screen's render always bumped the token out from under the
   * version list and every row stayed on "Loading the opening…".
   */
  let versionSampleRenderToken = 0

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
    state.fullLibrary = view === 'library-index'
    if (state.fullLibrary) view = 'library'
    library().dataset.fullLibrary = String(state.fullLibrary)
    // Read the crossfade before the landing panel is hidden: a hidden layer
    // has no computed opacity to read.
    if (view !== 'landing' && root.querySelector('[data-view-panel="landing"]')?.classList.contains('is-current')) captureLandingWorld()
    root.querySelectorAll('[data-view-panel]').forEach(panel => panel.classList.toggle('is-current', panel.dataset.viewPanel === view))
    root.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)))
    // The boot paint (lab/index.html) chose the first panel from the URL; the
    // runtime owns the panels from here.
    document.documentElement.removeAttribute('data-lab-boot-view')
    renderLandingCovers()
  }

  function renderFeatured() {
    const host=root.querySelector('[data-featured]'), book=state.shelfBooks[state.shelfIndex]
    host.innerHTML=book ? `<button type="button" class="entry-featured-cover" data-featured-open aria-label="About ${escapeHtml(book.title)}">${coverImage(book)}</button><div><small>${escapeHtml(book.author)}</small><h2>${escapeHtml(book.title)}</h2><p>${escapeHtml(book.summary)}</p><button type="button" class="entry-start" data-featured-open>Start reading <span aria-hidden="true">→</span></button></div>` : ''
  }
  function updateShelfArrows() {
    const shelf=root.querySelector('[data-popular-shelf]')
    root.querySelector('[data-shelf-scroll="-1"]').disabled=shelf.scrollLeft<2
    root.querySelector('[data-shelf-scroll="1"]').disabled=shelf.scrollLeft+shelf.clientWidth>=shelf.scrollWidth-2
  }
  function arrangeSearch() {
    const search=root.querySelector('.lib-search'),slot=root.querySelector('[data-search-slot]')
    if(centreSnap.matches) {root.querySelector('.lib-main').insertBefore(search,root.querySelector('.lib-index'));search.hidden=false;root.querySelector('[data-library-search]').tabIndex=0}
    else {slot.append(search);search.hidden=!state.searchOpen;root.querySelector('[data-library-search]').tabIndex=state.searchOpen?0:-1}
  }
  function toggleSearch(open=!state.searchOpen) {
    state.searchOpen=open
    const button=root.querySelector('[data-search-toggle]');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close search':'Open search')
    arrangeSearch()
    if(open) root.querySelector('[data-library-search]').focus()
    else {state.query='';root.querySelector('[data-library-search]').value='';renderIndex();button.focus()}
  }
  const prefaceCache=new Map()
  async function renderInlinePreface(book) {
    const token=++state.prefaceToken,button=root.querySelector('[data-inline-preface]'),body=root.querySelector('[data-inline-preface-body]')
    button.hidden=true;body.hidden=true;body.innerHTML='';button.textContent='Read full preface';button.setAttribute('aria-expanded','false')
    if(!prefaceCache.has(book.id)) prefaceCache.set(book.id,fetchJsonIfAvailable(`/lab/prefaces/${encodeURIComponent(book.id)}.json?v=20260909-1`))
    const preface=await prefaceCache.get(book.id)
    if(token!==state.prefaceToken || state.selectedBookId!==book.id || !Array.isArray(preface?.paragraphs)) return
    body.innerHTML=`<p class="entry-preface-attribution">Preface · Tinct · English</p>${preface.paragraphs.map(text=>`<p>${escapeHtml(text)}</p>`).join('')}`
    button.hidden=false
  }
  let motionPaused=false,coverVisible=true
  function updateMotion() {
    const active=root.querySelector('[data-view-panel="landing"]').classList.contains('is-current')
    root.querySelector('[data-entry-covers]').classList.toggle('is-paused',motionPaused||document.hidden||!coverVisible||!active||reducedMotion())
    const button=root.querySelector('[data-entry-motion]');button.textContent=motionPaused?'Play covers':'Pause covers';button.setAttribute('aria-pressed',String(motionPaused));button.hidden=centreSnap.matches||reducedMotion()
  }
  function renderLandingCovers() {
    const host=root.querySelector('[data-entry-covers]')
    if(centreSnap.matches || !state.catalogue || !root.querySelector('[data-view-panel="landing"]').classList.contains('is-current')) {updateMotion();return}
    if(!host.children.length) {
      const books=fullShelf(state.catalogue).filter(book=>book.art?.src?.startsWith('/covers/v2/')).slice(0,18)
      host.innerHTML=[0,1,2].map(col=>{const group=books.filter((_,i)=>i%3===col);return `<div class="entry-cover-column" style="--duration:${240+col*30}s">${[...group,...group].map(book=>coverImage(book)).join('')}</div>`}).join('')
    }
    updateMotion()
  }
  document.addEventListener('visibilitychange',updateMotion)
  if(typeof IntersectionObserver==='function') new IntersectionObserver(entries=>{coverVisible=entries[0]?.isIntersecting;updateMotion()}).observe(root.querySelector('[data-entry-covers]'))
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',updateMotion)

  const previewSearch = readerPreviewSearch(location.search)
  function routeFor(view, bookId = state.selectedBookId) {
    if (view === 'landing') return `/${previewSearch}`
    if (view === 'library-index') return `/library?view=library-index${previewSearch.replace('?', '&')}`
    if (view === 'library') return `/library${previewSearch}`
    return `/library?book=${encodeURIComponent(bookId)}${view === 'book-detail' ? '' : `&view=${encodeURIComponent(view)}`}${previewSearch.replace('?', '&')}`
  }

  /**
   * SPA entries this runtime pushed itself. Back out of a book page by
   * popping one of them (`history.back()`), never by pushing another copy of
   * the library: pushing made the browser Back button walk *forward* into the
   * book page again, which is the "back goes back twice" report.
   */
  let pushedEntries = 0

  function navigateView(view, replace = false) {
    if (view !== 'library') rememberLibrary(view === 'book-detail' || view === 'edition' ? state.selectedBookId : null)
    showView(view)
    const method = replace ? 'replaceState' : 'pushState'
    history[method]({ view, bookId: state.selectedBookId }, '', routeFor(view))
    if (!replace) pushedEntries += 1
  }

  /** The book page's own Back: one step, to the library it came from. */
  function leaveBookPage() {
    if (new URLSearchParams(location.search).get('from') === 'library-2') {
      location.assign('/lab/library-2')
      return
    }
    if (pushedEntries > 0) {
      history.back()
      return
    }
    // Opened straight into a book page (a link, a share): there is nothing to
    // pop, so replace this entry with the library rather than growing history.
    navigateView('library', true)
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

  // World carry-over. The pre-reader is one surface: the library, the book
  // page and the edition screen wear the world the landing was showing when
  // the reader left it, so Start reading changes what is on the page and not
  // what the page is made of. Tokens and world layers live in lab/index.html
  // under html[data-lib-world]; library-boot.js sets the same attribute in
  // the head so a direct hit on /lab/library paints in the right world.
  function applyWorldGround(world) {
    const next = landingWorldFrom(world) || landingWorldFrom(readSession(LANDING_WORLD_SESSION_KEY)) || DEFAULT_LANDING_WORLD
    state.world = next
    document.documentElement.dataset.libWorld = next
  }

  /**
   * The world the landing is showing at this instant, read off the crossfade
   * itself. Called as the landing is left, and parked for the session so a
   * later direct hit on the library opens in the same world.
   */
  function captureLandingWorld() {
    const nodes = [...root.querySelectorAll('[data-view-panel="landing"] .tov5-simple-world')]
    // A layer with no box has never been painted: the boot paint hides the
    // landing panel outright when the URL asks for the library, and reading
    // opacities off a display:none panel returns the stylesheet's defaults —
    // which would quietly overwrite the world the reader actually left with
    // the first one in the file on every library reload.
    if (!nodes.some(node => node.getClientRects().length > 0)) return
    const layers = nodes.map(node => ({
      world: [...node.classList].find(name => name !== 'tov5-simple-world') || '',
      opacity: Number.parseFloat(getComputedStyle(node).opacity),
    }))
    const world = mostVisibleWorld(layers)
    if (!world) return
    writeSession(LANDING_WORLD_SESSION_KEY, world)
    applyWorldGround(world)
  }

  applyWorldGround(null)
  window.addEventListener('pageshow', () => applyWorldGround(null))

  function setLibraryMode(mode) {
    if (mode !== 'new' && mode !== 'returning') return
    if (state.libraryMode === mode) return
    state.libraryMode = mode
    if (state.catalogue) renderPopular()
  }

  function shelfItem(book, index) {
    const selected = index === state.shelfIndex
    return `<button type="button" class="lib-shelf-item${selected ? ' is-selected' : ''}" data-shelf-book="${escapeHtml(book.id)}" data-shelf-index="${index}" aria-label="${escapeHtml(book.title)}" aria-current="${selected ? 'true' : 'false'}" style="--lib-delay:${revealDelayMs(index)}ms">${coverImage(book, centreSnap.matches)}<span class="entry-shelf-title">${escapeHtml(book.title)}</span></button>`
  }

  /**
   * The lead over the popular row. Only a reader with nothing in Reading now
   * sees this row at all, so it is written for that reader: the action in the
   * page's headline face, the row named quietly under it, and one line
   * saying where the rest of the library is. Copy lives in library-model.js.
   */
  function renderPopularLead() {
    const lead = popularLead()
    root.querySelector('[data-popular-lead-title]').textContent = lead.title
    root.querySelector('[data-popular-lead-row]').textContent = lead.row
    root.querySelector('[data-popular-lead-more]').textContent = lead.more
  }

  function renderCaption() {
    const caption = root.querySelector('[data-popular-caption]')
    if (state.libraryMode !== 'new' || !state.shelfBooks.length) {
      caption.innerHTML = ''
      return
    }
    const book = state.shelfBooks[state.shelfIndex]
    renderFeatured()
    caption.innerHTML = `<h2 class="lib-h1" data-popular-title>${escapeHtml(book.title)}</h2><p class="lib-lede" data-popular-blurb>${escapeHtml(bookDescription(book))}</p>`
  }

  /**
   * The focused book. `scroll` centres it (a tap, a keypress, a restore);
   * the centre observer passes scroll:false because the finger already put
   * the cover where it is — re-scrolling would fight the gesture.
   */
  function setShelfIndex(index, focus = false, scroll = true) {
    const next = moveSelection(index, 0, state.shelfBooks.length)
    const changed = state.shelfIndex !== next
    state.shelfIndex = next
    writeSession(LIBRARY_SHELF_SESSION_KEY, String(next))
    const shelf = root.querySelector('[data-popular-shelf]')
    shelf.querySelectorAll('[data-shelf-index]').forEach(item => {
      const selected = Number(item.dataset.shelfIndex) === next
      item.classList.toggle('is-selected', selected)
      item.setAttribute('aria-current', String(selected))
      if (selected) {
        if (focus) item.focus({ preventScroll: true })
        if (scroll && (centreSnap.matches || focus)) centreShelfItem(shelf, item)
      }
    })
    if (changed || !root.querySelector('[data-popular-title]')) renderCaption()
  }

  /**
   * Centre-snap is the phone's row: the middle of the scroller is where the
   * reader is looking, so that is where the focus is. A wide screen shows the
   * whole shelf at once and has no middle to speak of — there the selection
   * moves only when the reader taps or arrows, and the row scrolls the
   * minimum it needs to (the CSS above drops the centring spacers to match).
   */
  const centreSnap = window.matchMedia('(max-width: 899px)')
  // Crossing that boundary changes how the shelf behaves; rebuild it so the
  // observer and the CSS spacers agree.
  centreSnap.addEventListener('change', () => { if (state.catalogue) {renderPopular();arrangeSearch();renderLandingCovers()} })
  // A wider window carries more covers; rebuild only when that number changes.
  window.addEventListener('resize', () => {
    if (!state.catalogue) return
    if (popularShelfSize(window.innerWidth) !== shelfSize) renderPopular()
  })

  /** Bring an item to the middle of its row (scroll-snap does the rest). */
  function centreShelfItem(shelf, item) {
    const style = getComputedStyle(shelf)
    const target = centreSnap.matches
      ? Math.max(0, Math.min(
        shelf.scrollWidth - shelf.clientWidth,
        item.offsetLeft - shelf.offsetLeft + item.offsetWidth / 2 - shelf.clientWidth / 2,
      ))
      : shelfScrollLeft({
        scrollLeft: shelf.scrollLeft,
        clientWidth: shelf.clientWidth,
        itemLeft: item.offsetLeft - shelf.offsetLeft,
        itemWidth: item.offsetWidth,
        padLeft: parseFloat(style.paddingLeft) || 0,
        padRight: parseFloat(style.paddingRight) || 0,
      })
    if (Math.abs(target - shelf.scrollLeft) < 2) return
    suppressCentreDetection()
    shelf.scrollTo({ left: target, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }

  // --- centre detection -----------------------------------------------------
  // Scrolling the row moves the focus: whichever cover is in the middle of the
  // row is the book the caption describes. An IntersectionObserver watching a
  // one-pixel strip down the middle of the scroller reports the crossing
  // without a scroll handler; the geometric fallback (centredShelfIndex) runs
  // on browsers without one and after a programmatic scroll settles.
  let centreObserver = null
  let centreQuietUntil = 0
  const suppressCentreDetection = () => { centreQuietUntil = Date.now() + 420 }

  function shelfGeometry(shelf) {
    return [...shelf.querySelectorAll('[data-shelf-index]')].map(item => ({
      left: item.offsetLeft - shelf.offsetLeft,
      width: item.offsetWidth,
    }))
  }

  function focusCentred(shelf) {
    if (Date.now() < centreQuietUntil) return
    const index = shelfFocusIndex(shelfGeometry(shelf), shelf.scrollLeft, shelf.clientWidth, shelf.scrollWidth)
    if (index !== state.shelfIndex) setShelfIndex(index, false, false)
  }

  function observeShelfCentre(shelf) {
    centreObserver?.disconnect()
    centreObserver = null
    if (state.libraryMode !== 'new' || !state.shelfBooks.length || !centreSnap.matches) return
    if (typeof IntersectionObserver === 'function') {
      // The observer only says "the row moved past the middle"; shelfFocusIndex
      // decides which cover that is, so the crossing rule and the end-of-track
      // rule are the same rule in both paths.
      centreObserver = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        focusCentred(shelf)
      }, { root: shelf, rootMargin: '0px -50% 0px -50%', threshold: 0 })
      shelf.querySelectorAll('[data-shelf-index]').forEach(item => centreObserver.observe(item))
    }
    // The observer does not fire while a smooth scroll is suppressed, and it
    // is absent in older engines: settle the focus from geometry either way.
    let frame = 0
    shelf.addEventListener('scroll', () => {
      if (frame) return
      frame = requestAnimationFrame(() => { frame = 0; focusCentred(shelf) })
    }, { passive: true })
  }

  /** How many covers the row is carrying, so a resize only rebuilds when that changes. */
  let shelfSize = 0

  /**
   * The popular row. It exists for the reader who has nothing in Reading now:
   * a reader who has already picked keeps their own books and the row is not
   * rendered at all (`showPopularShelf`). Its length follows the viewport, so
   * a 1440 or 1920 track is not eight covers and a wide empty band.
   */
  function renderPopular() {
    const shelf = root.querySelector('[data-popular-shelf]')
    const section = root.querySelector('[data-library-popular]')
    library().dataset.libraryMode = state.libraryMode
    shelfSize = popularShelfSize(window.innerWidth)
    state.shelfBooks = showPopularShelf(state.libraryMode) ? (centreSnap.matches ? popularBooks(state.catalogue, shelfSize) : fullShelf(state.catalogue)) : []
    state.shelfIndex = moveSelection(state.shelfIndex, 0, state.shelfBooks.length)
    section.hidden = state.shelfBooks.length === 0
    if (section.hidden) {
      shelf.innerHTML = ''
      centreObserver?.disconnect()
      centreObserver = null
      return
    }
    renderPopularLead()
    shelf.className = 'lib-shelf'
    shelf.innerHTML = state.shelfBooks.map(shelfItem).join('')
    // Slide in from the right, one after another — once per session.
    if (centreSnap.matches && claimReveal(safeSessionStorage(), reducedMotion())) {
      shelf.classList.add('is-revealing')
      const last = shelf.querySelector(`[data-shelf-index="${state.shelfBooks.length - 1}"] .lib-cover`)
      last?.addEventListener('animationend', () => shelf.classList.remove('is-revealing'), { once: true })
    }
    renderCaption()
    observeShelfCentre(shelf)
    shelf.addEventListener('scroll', updateShelfArrows, {passive:true})
    requestAnimationFrame(updateShelfArrows)
    // Put the focused cover in the middle once the row has a width.
    requestAnimationFrame(() => {
      const item = shelf.querySelector(`[data-shelf-index="${state.shelfIndex}"]`)
      if (item) centreShelfItem(shelf, item)
    })
  }

  /** A cover cell: art when the book has it, else the typographic placeholder; title and author underneath. */
  const bookCell = book => `<button type="button" class="lib-cell" data-catalogue-book="${escapeHtml(book.id)}">${coverImage(book)}<span class="lib-cover-copy"><span class="lib-cell-t">${escapeHtml(book.title)}</span><span class="lib-cell-a">${escapeHtml(book.author)}</span></span></button>`
  const bookCells = (books, attr = '') => `<div class="lib-cells"${attr ? ` ${attr}` : ''}>${books.map(bookCell).join('')}</div>`

  function renderIndex() {
    library().dataset.searching = String(Boolean(state.query.trim()))
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

  function rememberLibrary(bookId = null) {
    if (!state.catalogue || !isLibraryCurrent()) return
    writeSession(LIBRARY_RETURN_SESSION_KEY, JSON.stringify(librarySnapshot({
      scrollY: window.scrollY,
      shelfIndex: state.shelfIndex,
      expandedHouseId: state.expandedHouseId,
      query: state.query,
      bookId,
    })))
  }

  function restoreLibrary() {
    const snapshot = parseLibrarySnapshot(readSession(LIBRARY_RETURN_SESSION_KEY))
    if (!snapshot || !state.catalogue) return false
    removeSession(LIBRARY_RETURN_SESSION_KEY)
    // The search the reader was looking at is part of where they were. Back
    // returns to those results, scrolled to the book they opened — not to the
    // library as it stood before the search began.
    const search = root.querySelector('[data-library-search]')
    if (search.value !== snapshot.query) search.value = snapshot.query
    state.query = snapshot.query
    state.expandedHouseId = snapshot.expandedHouseId
    renderIndex()
    if (state.libraryMode === 'new' && state.shelfBooks.length) setShelfIndex(snapshot.shelfIndex)
    const settle = () => {
      const cell = snapshot.bookId ? root.querySelector(`[data-catalogue-book="${CSS.escape(snapshot.bookId)}"]`) : null
      if (cell) {
        const box = cell.getBoundingClientRect()
        const top = box.top + window.scrollY - Math.max(0, (window.innerHeight - box.height) / 2)
        window.scrollTo({ top: Math.max(0, Math.round(top)), left: 0, behavior: 'auto' })
        return
      }
      window.scrollTo({ top: snapshot.scrollY, left: 0, behavior: 'auto' })
    }
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
    arrangeSearch()
    root.querySelector('[data-library-search]').placeholder = searchPlaceholder(state.catalogue)
    renderPopular()
    renderIndex()
  }

  // ---------------------------------------------------------- detail / editions

  async function selectBook(bookId, destination = 'book-detail', updateHistory = false) {
    const book = state.booksById.get(bookId)
    if (!book) return false
    const changingBook = state.selectedBookId !== book.id || !state.selectedEditionKey
    state.selectedBookId = book.id
    state.pendingResume = state.continuations.find(item => item.bookId === book.id) || null
    const resumePrimary = v1Editions(book).find(edition => edition.key === state.pendingResume?.primaryEditionKey && edition.availability.chapterText)
    if (changingBook) state.selectedEditionKey = resumePrimary?.key || defaultEdition(book)?.key || null
    const resumeCompare = v1Editions(book).find(edition => edition.key === state.pendingResume?.compareEditionKey && edition.availability.compare)
    if (changingBook) { state.compareEditionKey = resumeCompare?.key || null; state.sampleExpanded = false }
    applyWorld(book)
    renderDetail(book)
    renderEditions(book)
    if (updateHistory) navigateView(destination)
    else showView(destination)
    return true
  }

  /**
   * The reader's own words-per-minute, when the reader's speed model has
   * learned one (src/hooks/useReadingSpeed.ts writes `tinct:reading-speed:*`).
   * Null means the book page states the fixed 250 wpm instead.
   */
  function readerWpm() {
    const records = []
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index)
        if (!key || !key.startsWith('tinct:reading-speed:')) continue
        const value = readJson(key)
        if (value && typeof value === 'object') records.push(value)
      }
    } catch { return null }
    return readerWordsPerMinute(records)
  }

  const statPill = (icon, value, title) => `<span title="${escapeHtml(title)}"><i data-lucide="${icon}" aria-hidden="true"></i><b>${escapeHtml(value)}</b></span>`

  /**
   * The stat pills: how long the text is, how long it takes — the whole book
   * for a book not started, and what is left of it for one in progress — and
   * whether it can be heard. The value carries the meaning; the grey helper
   * line that used to sit under each one is gone.
   *
   * The pace is the reader's own when the reader's speed model has learned
   * one, otherwise a stated 250 words a minute. The pill's title says which,
   * so the number is never a silent claim about the reader.
   */
  function renderStats(book) {
    const wpm = readerWpm()
    const time = readingTimeLine(book.wordCount, wpm)
    const percent = state.pendingResume ? progressFor(state.pendingResume) : null
    const left = Number.isFinite(percent) && percent > 0 && percent < 100
      ? readingTimeLine(Math.round(book.wordCount * (1 - percent / 100)), wpm)
      : null
    const pills = [
      statPill('book-open', formatWordCount(book.wordCount), 'Length of the published text'),
      time ? statPill('glasses', time.value, `Time to read the whole book ${time.note}`) : '',
      left ? statPill('flag', `${left.value} left`, `Time to finish from where you stopped ${left.note}`) : '',
      book.availability.audio ? statPill('headphones', 'Audiobook', 'Read aloud, chapter by chapter') : '',
    ].filter(Boolean)
    const stats = root.querySelector('[data-book-stats]')
    stats.innerHTML = pills.join('')
    stats.dataset.readingTime = time ? time.value : ''
    stats.dataset.readingTimeLeft = left ? left.value : ''
    stats.dataset.readingTimeMeasured = time ? String(time.measured) : 'false'
    stats.setAttribute('aria-label', [
      'About this book',
      time ? `${time.value} to read ${time.note}` : '',
      left ? `${left.value} left to finish` : '',
    ].filter(Boolean).join(' — '))
  }

  function renderDetail(book) {
    const cover = coverFor(book)
    root.querySelector('[data-book-detail-cover]').src = cover.src
    root.querySelector('[data-book-detail-cover]').srcset = cover.srcSet
    root.querySelector('[data-book-detail-cover]').alt = book.title
    root.querySelector('[data-book-detail-author]').textContent = book.author
    root.querySelector('[data-book-detail-title]').textContent = book.title
    root.querySelector('[data-book-detail-summary]').textContent = book.summary
    renderStats(book)
    void renderInlinePreface(book)
    root.querySelector('.tov5-choose-edition').childNodes[0].textContent = state.pendingResume ? 'Continue reading ' : 'Start reading '
    if (window.lucide) window.lucide.createIcons()
  }

  // ------------------------------------------------------------- versions
  // Two dropdowns, because a book can carry more than two versions: one for
  // the version being read, one for the version it is compared against. Each
  // row is the translation's name and a sample of that translation's own
  // opening, so the choice is made by reading, not by reading metadata.
  // "Both" is not a version — it is the button that opens the two together.

  /** The translation's name, and nothing else. */
  function translationName(edition) {
    if (edition.style === 'modern') return `Tinct Modern ${languageName(edition.language)}`
    if (edition.translator) return edition.year ? `${edition.translator} · ${edition.year}` : edition.translator
    if (edition.style === 'original') return edition.year ? `Original · ${edition.year}` : 'Original text'
    return edition.label
  }

  function compareCandidates(book, primaryKey) {
    const editions = v1Editions(book)
    const primary = editions.find(edition => edition.key === primaryKey)
    if (!primary?.aligned) return []
    return editions.filter(edition => edition.key !== primary.key && edition.availability.compare)
  }

  const versionMenuMarkup = (which, editions, selectedKey) => editions.map(edition => `<button type="button" role="option" data-version-pick="${escapeHtml(which)}" data-version-edition="${escapeHtml(edition.key)}" aria-selected="${edition.key === selectedKey}"><b>${escapeHtml(translationName(edition))}</b></button>`).join('')

  const chevronDown = '<svg class="tov5-version-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>'

  function versionField(which, role, editions, selectedKey, off) {
    const selected = editions.find(edition => edition.key === selectedKey)
    return `<div class="tov5-version${off ? ' is-off' : ''}" data-version-field="${which}">
      <button type="button" class="tov5-version-btn" data-version-toggle="${which}" aria-expanded="false" aria-haspopup="listbox" aria-label="${escapeHtml(role)}: ${escapeHtml(selected ? translationName(selected) : 'choose')}"><span><span class="tov5-version-role">${escapeHtml(role)}</span><span class="tov5-version-name" data-version-name="${which}">${escapeHtml(selected ? translationName(selected) : 'Choose')}</span></span>${chevronDown}</button>
      <button type="button" class="tov5-version-preview" data-version-read="${escapeHtml(selectedKey || '')}" aria-pressed="${!state.compareEditionKey && state.selectedEditionKey === selectedKey}" aria-label="Read ${escapeHtml(selected ? translationName(selected) : '')}"><span data-version-sample="${escapeHtml(selectedKey || '')}">Loading the passage…</span></button>
      <div class="tov5-version-menu" data-version-menu="${which}" role="listbox" aria-label="${escapeHtml(role)}" hidden>${versionMenuMarkup(which, editions, selectedKey)}</div>
    </div>`
  }

  function renderVersions(book) {
    const editions = v1Editions(book).filter(edition => edition.availability.chapterText)
    const host = root.querySelector('[data-book-versions]')
    const primaryKey = state.selectedEditionKey
    const candidates = compareCandidates(book, primaryKey)
    const compareKey = candidates.find(edition => edition.key === state.compareEditionKey)?.key || candidates[0]?.key || null
    const both = Boolean(state.compareEditionKey)
    host.innerHTML = [
      versionField('primary', 'Version', editions, primaryKey, false),
      candidates.length ? versionField('compare', 'Compare with', candidates, compareKey, !both) : '',
      '<button type="button" class="entry-sample-more" data-sample-more hidden>Read a little more</button>',
      candidates.length ? `<button type="button" class="tov5-version-both" data-version-both aria-pressed="${both}">Both</button>` : '',
    ].filter(Boolean).join('')
    host.dataset.versionCount = String(editions.length)
    host.dataset.compareCount = String(candidates.length)
    void fillVersionSamples(book)
  }

  async function fillVersionSamples(book) {
    const token = ++versionSampleRenderToken
    const nodes = [...root.querySelectorAll('[data-version-sample]')]
    const keys = nodes.map(node => node.dataset.versionSample)
    const payloads = await Promise.all(keys.map(key => loadEditionSample(book,key)))
    if (token !== versionSampleRenderToken || state.selectedBookId !== book.id) return
    const samples = pairedSamples(book.id,keys,payloads)
    nodes.forEach((node,i) => { node.textContent = samples[i]?.[state.sampleExpanded ? 'full' : 'short'] || 'Sample unavailable for this edition.' })
    const more = root.querySelector('[data-sample-more]')
    more.hidden = !samples.some(sample => sample && sample.full !== sample.short)
    more.textContent = state.sampleExpanded ? 'Read less' : 'Read a little more'
    more.setAttribute('aria-expanded',String(state.sampleExpanded))
  }

  function closeVersionMenus(except = null) {
    root.querySelectorAll('[data-version-menu]').forEach(menu => {
      if (menu === except) return
      menu.hidden = true
      menu.closest('[data-version-field]')?.querySelector('[data-version-toggle]')?.setAttribute('aria-expanded', 'false')
    })
  }

  function toggleVersionMenu(which) {
    const menu = root.querySelector(`[data-version-menu="${which}"]`)
    if (!menu) return
    const open = menu.hidden
    closeVersionMenus(menu)
    menu.hidden = !open
    menu.closest('[data-version-field]')?.querySelector('[data-version-toggle]')?.setAttribute('aria-expanded', String(open))
  }

  function pickVersion(which, editionKey) {
    const book = selectedBook()
    if (!book) return
    if (which === 'primary') {
      const candidates = compareCandidates(book, editionKey)
      const compare = candidates.find(edition => edition.key === state.compareEditionKey)?.key
        || (state.compareEditionKey ? candidates[0]?.key : null)
      selectEdition(editionKey, compare || null)
    } else {
      // Choosing something to compare against is choosing to read both.
      selectEdition(state.selectedEditionKey, editionKey)
    }
    closeVersionMenus()
  }

  function toggleBoth() {
    const book = selectedBook()
    if (!book) return
    if (state.compareEditionKey) {
      selectEdition(state.selectedEditionKey, null)
      return
    }
    const candidates = compareCandidates(book, state.selectedEditionKey)
    const chosen = root.querySelector('[data-version-name="compare"]')?.closest('[data-version-field]')
      ? candidates.find(edition => edition.key === root.querySelector('[data-version-menu="compare"] [aria-selected="true"]')?.dataset.versionEdition)
      : null
    if (!candidates.length) return
    selectEdition(state.selectedEditionKey, (chosen || candidates[0]).key)
  }

  const languageName = language => ({ en: 'English', da: 'Danish' })[language] || language.toUpperCase()
  const editionTitle = edition => edition.style === 'modern' ? 'Modern' : edition.style === 'original' ? 'Original' : 'Published'
  const editionChoiceLabel = edition => edition.style === 'modern' ? `Modern ${languageName(edition.language)}` : editionTitle(edition)

  function firstReadableParagraph(payload) {
    const chapters = Array.isArray(payload?.chapters) ? payload.chapters : []
    const paragraphs = Array.isArray(payload?.paragraphs) ? payload.paragraphs : chapters.flatMap(chapter => Array.isArray(chapter?.paragraphs) ? chapter.paragraphs : [])
    const cleaned = paragraphs.map(paragraph => String(paragraph || '').replace(/\s+/g, ' ').trim()).filter(Boolean)
    const first = Math.max(0, cleaned.findIndex(paragraph => paragraph.length >= 80))
    return cleaned.slice(first, first + 4).join(' ').slice(0, 900) || null
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

  /**
   * Whether this edition is published as chapter shards. The build writes the
   * flag into the catalogue (src/preReader/libraryReadingStructure.ts), so the
   * sample never has to probe for a manifest that does not exist — probing was
   * worth six 404s in the console on every library and book-page load, one per
   * English edition of the books that ship as one whole-book JSON.
   */
  function hasChapterShards(book, editionKey) {
    return book?.editions?.find(edition => edition.key === editionKey)?.chapterShards === true
  }

  async function loadEditionSample(book, editionKey) {
    const bookId = book.id
    const cacheKey = `${bookId}:${editionKey}`
    if (editionSampleCache.has(cacheKey)) return editionSampleCache.get(cacheKey)
    const sharded = hasChapterShards(book, editionKey)
    const request = (async () => {
      if (sharded) {
        const manifestUrl = `/data/editions-chapters/${encodeURIComponent(bookId)}-${encodeURIComponent(editionKey)}/manifest.json?v=20260904-1`
        const manifest = await fetchJsonIfAvailable(manifestUrl)
        const chapterPath = manifest?.chapters?.find(chapter => chapter?.path)?.path
        if (chapterPath) {
          const chapter = await fetchJsonIfAvailable(`/data/editions-chapters/${encodeURIComponent(bookId)}-${encodeURIComponent(editionKey)}/${encodeURIComponent(chapterPath)}?v=20260904-1`)
          if (chapter?.paragraphs?.length) return chapter
        }
      }
      const edition = await fetchJsonIfAvailable(`/data/editions/${encodeURIComponent(bookId)}-${encodeURIComponent(editionKey)}.json?v=20260904-1`)
      return edition
    })()
    editionSampleCache.set(cacheKey, request)
    return request
  }

  function renderEditions(book) {
    const cover = coverFor(book)
    root.querySelector('[data-picker-cover]').src = cover.src
    root.querySelector('[data-picker-cover]').srcset = cover.srcSet
    root.querySelector('[data-picker-book]').textContent = book.title
    const primary = book.editions.find(e => e.key === state.selectedEditionKey)
    const compare = book.editions.find(e => e.key === state.compareEditionKey)
    root.querySelector('[data-picker-selection]').textContent = [primary,compare].filter(Boolean).map(translationName).join(' + ')
    renderVersions(book)
  }

  function selectEdition(primaryEditionKey, compareEditionKey = null) {
    if (state.selectedEditionKey === primaryEditionKey && state.compareEditionKey === compareEditionKey) return false
    state.selectedEditionKey = primaryEditionKey
    state.compareEditionKey = compareEditionKey
    state.selectionRevision += 1
    const book = selectedBook()
    renderEditions(book)
    if (window.lucide) window.lucide.createIcons()
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
      if (place.bookId !== book.id || !Number.isInteger(place.chapterNumber) || place.chapterNumber < 1 || (place.page !== undefined && (!Number.isInteger(place.page) || place.page < 0)) || (place.paragraphIndex !== undefined && (!Number.isInteger(place.paragraphIndex) || place.paragraphIndex < 0)) || (place.wordIndex !== undefined && (!Number.isInteger(place.wordIndex) || place.wordIndex < 0))) return null
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
    // Where this visit to the reader started, so the library it comes back to
    // knows not to recap the book the reader has just been looking at.
    writeReaderOrigin(safeSessionStorage(), book.id, Date.now())
    try {
      sessionStorage.setItem(READER_HANDOFF_KEY, JSON.stringify(intent))
      const saved = readJson('tinct:library')
      const ids = new Set(Array.isArray(saved) ? saved : [])
      ids.add(book.id)
      localStorage.setItem('tinct:library', JSON.stringify([...ids]))
    } catch { /* private mode */ }
    window.dispatchEvent(new CustomEvent('tinct:lab-reader-handoff', { detail: intent }))
    rememberLibrary(book.id)
    // Neutral reader route: its layout follows the viewport. Explicit
    // /lab/phone and /lab/desktop remain useful QA overrides.
    window.location.assign(`/reader${previewSearch}`)
    return true
  }

  /**
   * The cover is the button: it opens the book's page. Every book in the
   * library reaches the same page — before this, a cover on the popular row
   * went straight into the reader, so books that were only reachable there
   * (pride-and-prejudice among them) had no book page at all.
   */
  async function openBookPage(bookId) {
    return selectBook(bookId, 'book-detail', true)
  }

  /** Straight into the reader — the resume paths (recap Continue, finished books) still use it. */
  async function openBookInReader(bookId) {
    if (!await selectBook(bookId, 'library')) return false
    return openReader()
  }

  root.addEventListener('click', async event => {
    const target = event.target instanceof Element ? event.target : null
    const scrollButton = target?.closest('[data-shelf-scroll]')
    if (scrollButton) { const shelf = root.querySelector('[data-popular-shelf]'); shelf.scrollBy({left:Number(scrollButton.dataset.shelfScroll)*shelf.clientWidth*.75,behavior:reducedMotion()?'auto':'smooth'}); return }
    if (target?.closest('[data-search-toggle]')) { toggleSearch(); return }
    if (target?.closest('[data-full-library]')) { navigateView('library-index'); window.scrollTo(0,0); return }
    if (target?.closest('[data-library-selection]')) { navigateView('library'); return }
    if (target?.closest('[data-featured-open]')) { await openBookPage(state.shelfBooks[state.shelfIndex].id); return }
    if (target?.closest('[data-open-picker]')) { if(state.pendingResume) openReader(); else {renderEditions(selectedBook());navigateView('edition');window.scrollTo(0,0)} return }
    if (target?.closest('[data-about-book]')) { navigateView('book-detail');window.scrollTo(0,0);return }
    if (target?.closest('[data-inline-preface]')) { const body=root.querySelector('[data-inline-preface-body]');body.hidden=!body.hidden;const button=root.querySelector('[data-inline-preface]');button.setAttribute('aria-expanded',String(!body.hidden));button.textContent=body.hidden?'Read full preface':'Close preface';return }
    if (target?.closest('[data-sample-more]')) {state.sampleExpanded=!state.sampleExpanded;void fillVersionSamples(selectedBook());return}
    const readSide=target?.closest('[data-version-read]')
    if(readSide) {selectEdition(readSide.dataset.versionRead);return}
    if(target?.closest('[data-entry-motion]')) { motionPaused=!motionPaused;updateMotion();return }

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
      // A tap on a cover that sits back brings it to the middle; a tap on the
      // cover in the middle opens its book page — the same page every other
      // route into a book opens. No cover jumps straight into the reader.
      if (!centreSnap.matches || (state.libraryMode === 'new' && Number.isInteger(index) && index !== state.shelfIndex)) {
        setShelfIndex(index)
        return
      }
      await openBookPage(shelfBook.dataset.shelfBook)
      return
    }
    const versionToggle = event.target.closest('[data-version-toggle]')
    if (versionToggle) {
      event.preventDefault(); event.stopImmediatePropagation()
      toggleVersionMenu(versionToggle.dataset.versionToggle)
      return
    }
    const versionPick = event.target.closest('[data-version-pick]')
    if (versionPick) {
      event.preventDefault(); event.stopImmediatePropagation()
      pickVersion(versionPick.dataset.versionPick, versionPick.dataset.versionEdition)
      return
    }
    if (event.target.closest('[data-version-both]')) {
      event.preventDefault(); event.stopImmediatePropagation()
      toggleBoth()
      return
    }
    if (event.target.closest('[data-library-back]')) {
      event.preventDefault(); event.stopImmediatePropagation()
      leaveBookPage()
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
    if (event.key === 'Escape' && root.querySelector('[data-version-menu]:not([hidden])')) {
      event.preventDefault()
      const which = root.querySelector('[data-version-menu]:not([hidden])').dataset.versionMenu
      closeVersionMenus()
      root.querySelector(`[data-version-toggle="${which}"]`)?.focus({ preventScroll: true })
      return
    }
    if (event.key === 'Escape' && state.searchOpen && !centreSnap.matches) {event.preventDefault();toggleSearch(false);return}
    if (event.key === 'Escape' && target?.matches('[data-library-search]') && state.query) {
      event.preventDefault()
      target.value = ''
      state.query = ''
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

  // A tap anywhere else closes an open version list.
  document.addEventListener('click', event => {
    if (!root.querySelector('[data-version-menu]:not([hidden])')) return
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('[data-version-menu],[data-version-toggle]')) return
    closeVersionMenus()
  })

  root.addEventListener('input', event => {
    if (!event.target.matches('[data-library-search]')) return
    state.query = event.target.value
    renderIndex()
  })

  window.__tinctLabPreReader = {
    ready: false,
    createHandoff,
    selectBook,
    openBook: openBookInReader,
    openBookPage,
    visibleBooks,
    coverFor: bookId => state.booksById.has(bookId) ? coverFor(state.booksById.get(bookId)) : null,
    bookProgress: (bookId, place) => {
      const book = state.booksById.get(bookId)
      return book ? wholeBookProgress(book, place, progressRecord(bookId), completionRecord(bookId).completed) : null
    },
    libraryState: () => ({ mode: state.libraryMode, shelfIndex: state.shelfIndex, shelf: state.shelfBooks.map(book => book.id), query: state.query, expandedHouseId: state.expandedHouseId, world: state.world }),
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
  if (window.__tinctLabBoot?.state?.returning) state.libraryMode = 'returning'
  if (window.__tinctLabLibraryMode === 'new' || window.__tinctLabLibraryMode === 'returning') state.libraryMode = window.__tinctLabLibraryMode
  // The shelf selection outlives a trip into a book or the reader.
  state.shelfIndex = Number.parseInt(readSession(LIBRARY_SHELF_SESSION_KEY) ?? '', 10) || 0
  // The library restores its own scroll position on the way back.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

  fetch('/lab/catalogue.json?v=20260907-4').then(response => {
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
    const routeView = libraryViewFromLocation(location.pathname, location.search) ? 'library' : 'landing'
    const requestedView = params.get('view') || (requested ? 'book-detail' : null)
    const allowedViews = new Set(['landing', 'library', 'library-index', 'book-detail', 'edition'])
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
    pushedEntries = Math.max(0, pushedEntries - 1)
    if (!state.catalogue) return
    const params = new URLSearchParams(location.search)
    const bookId = params.get('book')
    const path = location.pathname.replace(/\/+$/, '')
    const view = params.get('view') || (bookId ? 'book-detail' : libraryViewFromLocation(path, location.search) ? 'library' : 'landing')
    if (view !== 'library') rememberLibrary()
    if (bookId && state.booksById.has(bookId) && (view === 'book-detail' || view === 'edition')) {
      await selectBook(bookId, view)
    } else {
      showView(view === 'library' || view === 'library-index' ? view : 'landing')
      if (view === 'library') restoreLibrary()
    }
  })

  window.addEventListener('pageshow', event => {
    if (event.persisted && isLibraryCurrent()) restoreLibrary()
  })
  window.addEventListener('pagehide', () => { rememberLibrary() })
}
