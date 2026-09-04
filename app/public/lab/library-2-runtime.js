(() => {
  const root = document.querySelector('#tinct-library-2')
  if (!root) return

  const READER_HANDOFF_KEY = 'tinct:lab-reader-handoff'
  const LAB_POSITION_KEY = 'tinct-lab-position'
  const state = {
    catalogue: null,
    booksById: new Map(),
    query: '',
    personal: [],
    resume: null,
    continuations: [],
  }
  const coverCache = new Map()

  const normalize = value => String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
  const titleKey = value => normalize(value).replace(/^(the|a|an)\s+/, '')
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
    const visible = book.editions.filter(edition => edition.language !== 'da')
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

  function searchBooks() {
    const books = state.catalogue.books
    const query = normalize(state.query)
    if (!query) return books

    const exact = books.filter(book => normalize(book.title) === query || titleKey(book.title) === titleKey(query))
    if (exact.length) return exact

    return books.map(book => {
      const title = normalize(book.title)
      const author = normalize(book.author)
      const titleMatch = title.includes(query) || titleKey(book.title).includes(titleKey(query))
      const authorMatch = author.includes(query)
      if (!titleMatch && !authorMatch) return null
      const score = (title.startsWith(query) ? 500 : titleMatch ? 300 : 0)
        + (author.startsWith(query) ? 240 : authorMatch ? 160 : 0)
      return { book, score }
    }).filter(Boolean)
      .sort((left, right) => right.score - left.score || left.book.catalogueIndex - right.book.catalogueIndex)
      .map(result => result.book)
  }

  function productionPosition(bookId) {
    const value = readJson(`tinct:position:${bookId}`)
    if (!value || value.bookId !== bookId) return null
    const chapterNumber = integer(value.chapterNumber, 1)
    const page = integer(value.currentPage, 0)
    if (chapterNumber === null || page === null) return null
    return {
      source: 'production',
      bookId,
      chapterNumber,
      page,
      paragraphIndex: integer(value.lastParagraphIndex, 0),
      updatedAt: number(value.updatedAt) || 0,
      placeLabel: `Chapter ${chapterNumber}${page > 0 ? ` · Page ${page + 1}` : ''}`,
    }
  }

  function productionProgress(bookId) {
    const value = readJson(`tinct:progress:${bookId}`)
    if (!value || value.bookId !== bookId) return null
    const raw = number(value.positionPercent) ?? number(value.percent)
    return raw === null ? null : Math.max(0, Math.min(100, raw))
  }

  function completionRecord(bookId) {
    const record = readJson(`tinct:book-completed:${bookId}`)
    if (record) return { completed: true, completedAt: number(record.completedAt) }
    const progress = readJson(`tinct:progress:${bookId}`)
    const completed = Boolean(progress && (number(progress.percent) >= 100 || (integer(progress.totalChapters, 1) !== null && integer(progress.highestCompletedChapter, 0) >= progress.totalChapters)))
    return { completed, completedAt: null }
  }

  function labResume() {
    const snapshot = readJson(LAB_POSITION_KEY)
    if (!snapshot || typeof snapshot !== 'object' || !snapshot.books || typeof snapshot.books !== 'object') return null
    const key = typeof snapshot.lastSettledBookId === 'string' ? snapshot.lastSettledBookId : ''
    const place = key ? snapshot.books[key] : null
    if (!place || place.bookId !== key) return null
    const directBook = state.booksById.get(place.bookId)
    const isBiblePlace = !directBook && state.booksById.has('bible') && integer(place.sequentialChapter, 1) !== null && typeof place.headerBook === 'string'
    const book = directBook || (isBiblePlace ? state.booksById.get('bible') : null)
    if (!book) return null
    const chapterNumber = isBiblePlace ? integer(place.sequentialChapter, 1) : integer(place.chapterNumber, 1)
    if (chapterNumber === null) return null
    const page = integer(place.pageIndex, 0)
    const paragraphIndex = integer(place.paragraphIndex, 0)
    const chapterLabel = isBiblePlace ? `${place.headerBook} ${integer(place.chapterNumber, 1) || 1}` : `Chapter ${chapterNumber}`
    return {
      source: 'lab',
      bookId: book.id,
      chapterNumber,
      page,
      paragraphIndex,
      primaryEditionKey: typeof place.primaryEditionKey === 'string' ? place.primaryEditionKey : null,
      compareEditionKey: place.readerMode === 'compare' && typeof place.compareEditionKey === 'string' ? place.compareEditionKey : null,
      updatedAt: number(place.updatedAt) || number(snapshot.lastSettledAt) || 0,
      placeLabel: `${chapterLabel}${page !== null && page > 0 ? ` · Page ${page + 1}` : ''}`,
    }
  }

  function allProductionPositions() {
    return state.catalogue.books.map(book => productionPosition(book.id)).filter(Boolean)
  }

  function resolveResume() {
    const lab = labResume()
    if (lab) return lab
    const currentBookId = readJson('tinct:tinct-current-book')
    if (typeof currentBookId === 'string' && state.booksById.has(currentBookId)) {
      const current = productionPosition(currentBookId)
      if (current) return current
    }
    return allProductionPositions().sort((left, right) => right.updatedAt - left.updatedAt)[0] || null
  }

  function resolveContinuations() {
    const primary = resolveResume()
    const candidates = [primary, ...allProductionPositions().sort((left, right) => right.updatedAt - left.updatedAt)]
    const seen = new Set()
    return candidates.filter(candidate => candidate && !seen.has(candidate.bookId) && seen.add(candidate.bookId)).slice(0, 3)
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
      kind: 'open-reader',
      bookId: book.id,
      primaryEditionKey: primary.key,
      savedPlace: {
        bookId: book.id,
        chapterNumber: resume.chapterNumber,
        ...(resume.page === null || resume.page === undefined ? {} : { page: resume.page }),
        ...(resume.paragraphIndex === null || resume.paragraphIndex === undefined ? {} : { paragraphIndex: resume.paragraphIndex }),
      },
    }
    if (compare && compare.key !== primary.key && primary.aligned && compare.availability.compare) intent.compareEditionKey = compare.key
    return intent
  }

  function personalLibrary() {
    const saved = readJson('tinct:library')
    const savedIds = Array.isArray(saved) ? saved.filter(id => typeof id === 'string') : []
    const positions = allProductionPositions()
    const ids = new Set(savedIds)
    positions.forEach(position => ids.add(position.bookId))
    state.catalogue.books.forEach(book => {
      if (completionRecord(book.id).completed || productionProgress(book.id) !== null) ids.add(book.id)
    })
    if (state.resume) ids.add(state.resume.bookId)
    const positionById = new Map(positions.map(position => [position.bookId, position]))
    return [...ids].map(id => {
      const book = state.booksById.get(id)
      if (!book) return null
      const completion = completionRecord(id)
      const progress = productionProgress(id)
      const active = state.resume?.bookId === id
      const position = positionById.get(id)
      const finishedDate = completion.completedAt
        ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(new Date(completion.completedAt))
        : ''
      return {
        book,
        updatedAt: active ? state.resume.updatedAt : position?.updatedAt || 0,
        status: completion.completed ? `Finished${finishedDate ? ` · ${finishedDate}` : ''}` : active ? 'Current book' : progress !== null && progress > 0 ? `${Math.round(progress)}% read` : position ? 'In progress' : 'Saved',
      }
    }).filter(Boolean).sort((left, right) => {
      if (left.status === 'Current book') return -1
      if (right.status === 'Current book') return 1
      return right.updatedAt - left.updatedAt || left.book.catalogueIndex - right.book.catalogueIndex
    })
  }

  function renderExplore() {
    const books = searchBooks()
    const grid = root.querySelector('[data-explore-grid]')
    const empty = root.querySelector('[data-results-empty]')
    const searching = Boolean(state.query.trim())
    root.classList.toggle('is-searching', searching)
    root.querySelector('#l2-explore-title').textContent = searching ? 'Search results' : 'Explore catalogue'
    const context = root.querySelector('[data-search-context]')
    context.hidden = !searching
    context.textContent = searching ? `For “${state.query.trim()}”` : ''
    grid.innerHTML = books.map(book => bookCard(book)).join('')
    empty.hidden = books.length > 0
    const meta = root.querySelector('[data-results-meta]')
    meta.textContent = searching && books.length ? `${books.length} ${books.length === 1 ? 'book' : 'books'}` : ''
    root.querySelector('[data-no-results-copy]').textContent = searching ? `Nothing in the catalogue matches “${state.query.trim()}”.` : ''
    root.querySelector('.l2-search-clear').classList.toggle('is-visible', searching)
    root.querySelector('[data-catalogue-count]').textContent = searching ? '' : `${state.catalogue.books.length} published books`
  }

  function renderPersonal() {
    state.personal = personalLibrary()
    const grid = root.querySelector('[data-personal-grid]')
    const empty = root.querySelector('[data-library-empty]')
    const count = root.querySelector('[data-library-count]')
    grid.innerHTML = state.personal.map(item => bookCard(item.book, item.status)).join('')
    const hasLibrary = state.personal.length > 0
    empty.hidden = hasLibrary
    root.querySelector('.l2-personal').hidden = !hasLibrary
    root.querySelector('[data-empty-intro]').hidden = hasLibrary || Boolean(state.resume)
    count.textContent = state.personal.length ? `${state.personal.length} ${state.personal.length === 1 ? 'book' : 'books'}` : ''
  }

  function renderResume() {
    state.continuations = resolveContinuations()
    state.resume = state.continuations[0] || null
    const section = root.querySelector('.l2-continue')
    if (!state.resume) {
      section.hidden = true
      root.querySelector('[data-continue-grid]').replaceChildren()
      return
    }
    section.hidden = false
    root.querySelector('[data-continue-count]').textContent = `${state.continuations.length} ${state.continuations.length === 1 ? 'book' : 'books'} in progress`
    root.querySelector('[data-continue-grid]').innerHTML = state.continuations.map((resume, index) => {
      const book = state.booksById.get(resume.bookId)
      const progress = productionProgress(book.id)
      return `<button type="button" class="l2-resume" data-resume-book="${escapeHtml(book.id)}" aria-label="Continue reading ${escapeHtml(book.title)} from ${escapeHtml(resume.placeLabel)}"><img class="l2-resume-cover" src="${coverData(book)}" alt=""><span class="l2-resume-copy"><span class="l2-section-kicker">${index === 0 ? 'Return to book' : 'Continue'}</span><h3 data-resume-title>${escapeHtml(book.title)}</h3><span class="l2-resume-author">${escapeHtml(book.author)}</span><span class="l2-resume-place">${escapeHtml(resume.placeLabel)}</span><span class="l2-progress" aria-hidden="true"${progress === null ? ' hidden' : ''}><span style="width:${progress ?? 0}%"></span></span><span class="l2-resume-action">${progress === null ? 'Continue reading →' : `${Math.round(progress)}% · Continue reading →`}</span></span></button>`
    }).join('')
  }

  function openResume(resume = state.resume) {
    const intent = buildResumeIntent(resume)
    if (!intent) return false
    try {
      // A Lab-native saved place is already the reader's authoritative tuple.
      // Let its existing boot path restore reader mode as well as location;
      // the generic handoff is for production-cache positions and new books.
      if (resume?.source === 'lab') sessionStorage.removeItem(READER_HANDOFF_KEY)
      else sessionStorage.setItem(READER_HANDOFF_KEY, JSON.stringify(intent))
    } catch {
      return false
    }
    window.location.assign('/lab/reader')
    return true
  }

  function clearSearch() {
    const input = root.querySelector('.l2-search input')
    input.value = ''
    state.query = ''
    renderExplore()
    input.focus()
  }

  root.addEventListener('click', event => {
    const resumeButton = event.target.closest('[data-resume-book]')
    if (resumeButton) openResume(state.continuations.find(item => item.bookId === resumeButton.dataset.resumeBook))
    if (event.target.closest('.l2-search-clear, .l2-clear-results')) clearSearch()
  })

  root.querySelector('.l2-search input').addEventListener('input', event => {
    state.query = event.target.value
    renderExplore()
  })

  window.__tinctLibrary2 = {
    ready: false,
    visibleBooks: searchBooks,
    buildResumeIntent,
    snapshot: () => ({ query: state.query, resume: state.resume, personal: state.personal }),
    refresh() {
      renderResume()
      renderPersonal()
      renderExplore()
    },
  }

  fetch('/lab/catalogue.json?v=20260903-2').then(response => {
    if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`)
    return response.json()
  }).then(catalogue => {
    state.catalogue = catalogue
    state.booksById = new Map(catalogue.books.map(book => [book.id, book]))
    renderResume()
    renderPersonal()
    renderExplore()
    window.__tinctLibrary2.ready = true
    window.dispatchEvent(new CustomEvent('tinct:library-2-ready'))
  }).catch(error => {
    console.error(error)
    root.innerHTML = '<div class="l2-error"><h1>Library unavailable</h1><p>Please try again in a moment.</p></div>'
  })
})()
