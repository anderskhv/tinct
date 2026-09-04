import { formatWholeBookProgress, searchPublishedBooks, wholeBookProgress } from './library-2-model.js'

const root = document.querySelector('#tinct-library-2')
if (root) {
  const READER_HANDOFF_KEY = 'tinct:lab-reader-handoff'
  const LAB_POSITION_KEY = 'tinct-lab-position'
  const INVITE_DISMISSED_KEY = 'tinct:lab-library2-invite-dismissed'
  const state = {
    catalogue: null,
    booksById: new Map(),
    query: '',
    resume: null,
    continuations: [],
    auth: { ready: false, signedIn: false, email: null },
  }
  const coverCache = new Map()

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
  const number = value => typeof value === 'number' && Number.isFinite(value) ? value : null
  const integer = (value, minimum = 0) => Number.isInteger(value) && value >= minimum ? value : null

  function readJson(key) {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? null : JSON.parse(raw)
    } catch {
      return null
    }
  }

  function defaultEdition(book) {
    const visible = book.editions.filter(edition => edition.language !== 'da' && edition.availability.chapterText)
    return visible.find(edition => edition.style === 'original' && edition.language === 'en')
      || visible.find(edition => edition.style === 'modern' && edition.language === 'en')
      || visible[0]
  }

  function coverData(book) {
    if (coverCache.has(book.id)) return coverCache.get(book.id)
    const words = book.title.toUpperCase().split(/\s+/)
    const lines = words.reduce((rows, word) => {
      const last = rows.at(-1) || ''
      if (!last || `${last} ${word}`.length > 17) rows.push(word)
      else rows[rows.length - 1] = `${last} ${word}`
      return rows
    }, []).slice(0, 4)
    const title = lines.map((line, index) => `<text x="150" y="${160 + index * 34}" text-anchor="middle" fill="${book.cover.accent}" font-family="Georgia,serif" font-size="26" font-weight="700">${escapeHtml(line)}</text>`).join('')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><defs><linearGradient id="paper" x2="1" y2="1"><stop stop-color="${book.cover.background}"/><stop offset="1" stop-color="#151513" stop-opacity=".35"/></linearGradient></defs><rect width="300" height="450" fill="url(#paper)"/><rect x="13" y="13" width="274" height="424" rx="2" fill="none" stroke="${book.cover.accent}" stroke-opacity=".62"/><path d="M38 83h224M38 365h224" stroke="${book.cover.accent}" stroke-opacity=".78"/><circle cx="150" cy="108" r="21" fill="none" stroke="${book.cover.accent}"/><text x="150" y="115" text-anchor="middle" fill="${book.cover.accent}" font-family="Georgia,serif" font-size="18">${escapeHtml(book.title.charAt(0))}</text>${title}<text x="150" y="404" text-anchor="middle" fill="${book.cover.accent}" font-family="Arial,sans-serif" font-size="10" letter-spacing="1.5">${escapeHtml(book.author.toUpperCase())}</text></svg>`
    const data = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
    coverCache.set(book.id, data)
    return data
  }

  function detailHref(bookId) {
    return `/lab/?autoplay=0&book=${encodeURIComponent(bookId)}&view=book-detail&from=library-2`
  }

  function bookCard(book, status = '') {
    const completed = status.startsWith('Finished')
    return `<a class="l2-book" data-book-id="${escapeHtml(book.id)}" href="${detailHref(book.id)}" aria-label="Open ${escapeHtml(book.title)} by ${escapeHtml(book.author)}"><img class="l2-cover" src="${coverData(book)}" alt=""><span class="l2-book-title">${escapeHtml(book.title)}</span><span class="l2-book-author">${escapeHtml(book.author)}</span>${status ? `<span class="l2-status" data-completed="${String(completed)}">${escapeHtml(status)}</span>` : ''}</a>`
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
    const title = chapter?.title || fallback
    return String(title).split(/\s+[—–-]\s+/)[0].trim()
  }

  function productionPosition(bookId) {
    const value = readJson(`tinct:position:${bookId}`)
    if (!value || value.bookId !== bookId) return null
    const chapterNumber = integer(value.chapterNumber, 1)
    const page = integer(value.currentPage, 0)
    if (chapterNumber === null || page === null) return null
    const book = state.booksById.get(bookId)
    const chapter = chapterDetails(book, chapterNumber)
    const chapterLabel = compactChapterTitle(chapter, `Chapter ${chapterNumber}`)
    return {
      source: 'production', bookId, chapterNumber, page,
      totalPages: integer(value.totalPages, 1),
      scrollFraction: number(value.scrollFraction),
      paragraphIndex: integer(value.lastParagraphIndex, 0),
      updatedAt: number(value.updatedAt) || 0,
      placeLabel: `${chapterLabel}${page > 0 ? ` · Page ${page + 1}` : ''}`,
      recap: `Last time · You left off in ${chapterLabel}.`,
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
      const chapter = chapterDetails(book, chapterNumber)
      const chapterLabel = compactChapterTitle(chapter, isBiblePlace ? `${place.headerBook} ${integer(place.chapterNumber, 1) || 1}` : `Chapter ${chapterNumber}`)
      return {
        source: 'lab', bookId: book.id, chapterNumber, page, paragraphIndex,
        primaryEditionKey: typeof place.primaryEditionKey === 'string' ? place.primaryEditionKey : null,
        compareEditionKey: place.readerMode === 'compare' && typeof place.compareEditionKey === 'string' ? place.compareEditionKey : null,
        updatedAt: number(place.updatedAt) || number(snapshot.lastSettledAt) || 0,
        placeLabel: `${chapterLabel}${page !== null && page > 0 ? ` · Page ${page + 1}` : ''}`,
        recap: `Last time · You left off in ${chapterLabel}.`,
      }
    }).filter(Boolean)
  }

  function allProductionPositions() {
    return state.catalogue.books.map(book => productionPosition(book.id)).filter(Boolean)
  }

  function resolveContinuations() {
    const currentBookId = readJson('tinct:tinct-current-book')
    const candidates = [...labPositions(), ...allProductionPositions()].sort((left, right) => {
      if (left.bookId === currentBookId && right.bookId !== currentBookId) return -1
      if (right.bookId === currentBookId && left.bookId !== currentBookId) return 1
      return right.updatedAt - left.updatedAt
    })
    const seen = new Set()
    return candidates.filter(candidate => candidate && !seen.has(candidate.bookId) && seen.add(candidate.bookId))
  }

  function progressFor(resume) {
    const book = state.booksById.get(resume.bookId)
    const completion = completionRecord(resume.bookId)
    return wholeBookProgress(book, resume, progressRecord(resume.bookId), completion.completed)
  }

  function buildResumeIntent(resume = state.resume) {
    if (!resume) return null
    const book = state.booksById.get(resume.bookId)
    if (!book) return null
    const available = book.editions.filter(edition => edition.language !== 'da' && edition.availability.chapterText)
    const primary = available.find(edition => edition.key === resume.primaryEditionKey) || defaultEdition(book)
    if (!primary) return null
    const compare = available.find(edition => edition.key === resume.compareEditionKey)
    const intent = {
      kind: 'open-reader', bookId: book.id, primaryEditionKey: primary.key,
      savedPlace: {
        bookId: book.id, chapterNumber: resume.chapterNumber,
        ...(resume.page === null || resume.page === undefined ? {} : { page: resume.page }),
        ...(resume.paragraphIndex === null || resume.paragraphIndex === undefined ? {} : { paragraphIndex: resume.paragraphIndex }),
      },
    }
    if (compare && compare.key !== primary.key && primary.aligned && compare.availability.compare) intent.compareEditionKey = compare.key
    return intent
  }

  function renderResume() {
    state.continuations = resolveContinuations()
    state.resume = state.continuations[0] || null
    const section = root.querySelector('.l2-continue')
    const rail = root.querySelector('[data-continue-grid]')
    section.hidden = !state.continuations.length
    root.querySelector('[data-empty-intro]').hidden = Boolean(state.continuations.length)
    if (!state.continuations.length) {
      rail.replaceChildren()
      renderAccountState()
      return
    }
    rail.innerHTML = state.continuations.map((resume, index) => {
      const book = state.booksById.get(resume.bookId)
      const progress = progressFor(resume)
      return `<button type="button" class="l2-resume" data-resume-book="${escapeHtml(book.id)}" aria-label="Continue reading ${escapeHtml(book.title)} from ${escapeHtml(resume.placeLabel)}"><img class="l2-resume-cover" src="${coverData(book)}" alt=""><span class="l2-resume-copy"><span class="l2-section-kicker">${index === 0 ? 'Return to book' : 'Continue'}</span><h3 data-resume-title>${escapeHtml(book.title)}</h3><span class="l2-resume-author">${escapeHtml(book.author)}</span><span class="l2-resume-place">${escapeHtml(resume.placeLabel)}</span><span class="l2-recap">${escapeHtml(resume.recap)}</span><span class="l2-progress" role="progressbar" aria-label="Whole-book progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress === null ? 0 : progress.toFixed(2)}"><span style="width:${progress ?? 0}%"></span></span><span class="l2-resume-action">${formatWholeBookProgress(progress)} · Continue →</span></span></button>`
    }).join('')
    renderAccountState()
    updateRailControls('continue')
  }

  function renderHouses() {
    const container = root.querySelector('[data-library-houses]')
    container.innerHTML = state.catalogue.houses.map(house => `<section class="l2-house" data-house-id="${escapeHtml(house.id)}"><div class="l2-house-head"><h3 class="l2-house-title">${escapeHtml(house.title)}</h3><p class="l2-house-subtitle">${escapeHtml(house.subtitle)}</p></div>${house.shelves.map(shelf => {
      const books = shelf.bookIds.map(id => state.booksById.get(id)).filter(Boolean)
      return `<section class="l2-shelf" data-shelf-id="${escapeHtml(shelf.id)}"><div class="l2-shelf-head"><h3>${escapeHtml(shelf.title)}</h3><span class="l2-shelf-copy">${escapeHtml(shelf.subtitle)}</span></div><div class="l2-rail" data-rail="${escapeHtml(shelf.id)}" tabindex="0" aria-label="${escapeHtml(shelf.title)} books">${books.map(book => bookCard(book)).join('')}</div></section>`
    }).join('')}</section>`).join('')
  }

  function renderFinished() {
    const finished = state.catalogue.books.filter(book => completionRecord(book.id).completed)
    const section = root.querySelector('.l2-finished')
    section.hidden = finished.length === 0
    root.querySelector('[data-finished-grid]').innerHTML = finished.map(book => bookCard(book, 'Finished')).join('')
    updateRailControls('finished')
  }

  function renderSearch() {
    const searching = Boolean(state.query.trim())
    const books = searchPublishedBooks(state.catalogue.books, state.query)
    root.classList.toggle('is-searching', searching)
    root.querySelector('.l2-search-results').hidden = !searching
    root.querySelector('.l2-library').hidden = searching
    root.querySelector('.l2-coming').hidden = searching
    root.querySelector('.l2-finished').hidden = searching || !state.catalogue.books.some(book => completionRecord(book.id).completed)
    root.querySelector('[data-results-grid]').innerHTML = books.map(book => bookCard(book)).join('')
    root.querySelector('[data-results-empty]').hidden = books.length > 0
    root.querySelector('[data-results-meta]').textContent = searching && books.length ? `${books.length} ${books.length === 1 ? 'book' : 'books'}` : ''
    root.querySelector('[data-results-query]').textContent = searching ? `“${state.query.trim()}”` : ''
    root.querySelector('[data-no-results-copy]').textContent = searching ? `Nothing in the published catalogue matches “${state.query.trim()}”.` : ''
    root.querySelector('.l2-search-clear').classList.toggle('is-visible', searching)
  }

  function renderAccountState() {
    root.querySelector('[data-progress-scope]').textContent = state.auth.signedIn ? 'Synced to your account' : 'Saved on this device'
    const dismissed = localStorage.getItem(INVITE_DISMISSED_KEY) === '1'
    root.querySelector('[data-account-invite]').hidden = state.auth.signedIn || state.continuations.length < 2 || dismissed
  }

  function openResume(resume = state.resume) {
    const intent = buildResumeIntent(resume)
    if (!intent) return false
    try {
      if (resume?.source === 'lab') sessionStorage.removeItem(READER_HANDOFF_KEY)
      else sessionStorage.setItem(READER_HANDOFF_KEY, JSON.stringify(intent))
    } catch {
      return false
    }
    window.location.assign('/lab/reader')
    return true
  }

  function setSearchOpen(open, clear = false) {
    const trigger = root.querySelector('.l2-search-trigger')
    const input = root.querySelector('.l2-search-field input')
    root.classList.toggle('is-search-open', open)
    trigger.setAttribute('aria-expanded', String(open))
    if (clear) {
      input.value = ''
      state.query = ''
      if (state.catalogue) renderSearch()
    }
    if (open) requestAnimationFrame(() => input.focus())
    else trigger.focus()
  }

  function clearSearch() {
    const input = root.querySelector('.l2-search-field input')
    input.value = ''
    state.query = ''
    renderSearch()
    input.focus()
  }

  function scrollRail(name, direction) {
    const rail = root.querySelector(`[data-rail="${CSS.escape(name)}"]`)
    if (!rail) return
    rail.scrollBy({ left: direction * Math.max(220, rail.clientWidth * .72), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    setTimeout(() => updateRailControls(name), 260)
  }

  function updateRailControls(name) {
    const rail = root.querySelector(`[data-rail="${CSS.escape(name)}"]`)
    const controls = root.querySelector(`[data-controls="${CSS.escape(name)}"]`)
    if (!rail || !controls) return
    controls.querySelector('[data-scroll=previous]').disabled = rail.scrollLeft <= 1
    controls.querySelector('[data-scroll=next]').disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1
  }

  root.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null
    if (!target) return
    const resumeButton = target.closest('[data-resume-book]')
    if (resumeButton) openResume(state.continuations.find(item => item.bookId === resumeButton.dataset.resumeBook))
    if (target.closest('.l2-search-trigger')) setSearchOpen(true)
    if (target.closest('.l2-search-close')) setSearchOpen(false, true)
    if (target.closest('.l2-search-clear, .l2-clear-results')) clearSearch()
    const railButton = target.closest('[data-controls] [data-scroll]')
    if (railButton) scrollRail(railButton.closest('[data-controls]').dataset.controls, railButton.dataset.scroll === 'next' ? 1 : -1)
    if (target.closest('[data-create-account]')) location.assign('/lab/sign-in?mode=create&returnTo=%2Flab%2Flibrary-2')
    if (target.closest('[data-dismiss-invite]')) {
      localStorage.setItem(INVITE_DISMISSED_KEY, '1')
      renderAccountState()
    }
  })

  root.querySelector('.l2-search-field input').addEventListener('input', event => {
    state.query = event.target.value
    renderSearch()
  })
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && root.classList.contains('is-search-open')) setSearchOpen(false, true)
    const rail = event.target.closest?.('[data-rail]')
    if (rail && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault()
      scrollRail(rail.dataset.rail, event.key === 'ArrowRight' ? 1 : -1)
    }
  })
  root.addEventListener('scroll', event => {
    const rail = event.target.closest?.('[data-rail]')
    if (rail) updateRailControls(rail.dataset.rail)
  }, true)

  window.addEventListener('tinct:lab-auth-state', event => {
    state.auth = event.detail
    renderAccountState()
  })

  window.__tinctLibrary2 = {
    ready: false,
    visibleBooks: () => searchPublishedBooks(state.catalogue?.books || [], state.query),
    buildResumeIntent,
    progressFor,
    snapshot: () => ({ query: state.query, resume: state.resume, continuations: state.continuations, auth: state.auth }),
    refresh() {
      renderResume()
      renderFinished()
      renderSearch()
    },
  }

  fetch('/lab/catalogue.json?v=20260904-3').then(response => {
    if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`)
    return response.json()
  }).then(catalogue => {
    state.catalogue = catalogue
    state.booksById = new Map(catalogue.books.map(book => [book.id, book]))
    renderResume()
    renderHouses()
    renderFinished()
    renderSearch()
    window.__tinctLibrary2.ready = true
    window.dispatchEvent(new CustomEvent('tinct:library-2-ready'))
  }).catch(error => {
    console.error(error)
    root.innerHTML = '<div class="l2-error"><h1>Library unavailable</h1><p>Please try again in a moment.</p></div>'
  })
}
