import { formatWholeBookProgress, searchPublishedBooks, wholeBookProgress } from './library-2-model.js'

{
  const root = document.querySelector('#tinct-onboarding-worlds-v5')
  if (!root) throw new Error('Lab pre-reader root is missing')

  const READER_HANDOFF_KEY = 'tinct:lab-reader-handoff'
  const LAB_POSITION_KEY = 'tinct-lab-position'
  const INVITE_DISMISSED_KEY = 'tinct:lab-library-invite-dismissed'

  const state = {
    catalogue: null,
    booksById: new Map(),
    selectedBookId: 'odyssey',
    selectedEditionKey: null,
    compareEditionKey: null,
    selectionRevision: 0,
    activeHouseId: 'all',
    query: '',
    onboarding: null,
    continuations: [],
    pendingResume: null,
    auth: { ready: false, signedIn: false, email: null },
  }
  const coverCache = new Map()
  const worldCache = new Map()
  const editionSampleCache = new Map()
  let editionSampleRenderToken = 0

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
  const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const number = value => typeof value === 'number' && Number.isFinite(value) ? value : null
  const integer = (value, minimum = 0) => Number.isInteger(value) && value >= minimum ? value : null
  const selectedBook = () => state.booksById.get(state.selectedBookId)
  const v1Editions = book => book.editions.filter(edition => edition.language !== 'da')
  const formatDate = value => value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(value) : ''
  const formatWordCount = count => count ? `${new Intl.NumberFormat().format(count)} words` : 'Length unavailable'

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

  function worldData(book) {
    if (worldCache.has(book.id)) return worldCache.get(book.id)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><radialGradient id="g" cx="28%" cy="18%"><stop stop-color="${book.cover.accent}" stop-opacity=".38"/><stop offset=".55" stop-color="${book.cover.background}"/><stop offset="1" stop-color="#071018"/></radialGradient><filter id="n"><feTurbulence baseFrequency=".015" numOctaves="3" seed="${book.catalogueIndex + 1}"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .11 0"/></filter></defs><rect width="1200" height="900" fill="url(#g)"/><rect width="1200" height="900" filter="url(#n)" opacity=".42"/></svg>`
    const data = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
    worldCache.set(book.id, data)
    return data
  }

  const card = (book, compact = false) => compact
    ? `<button type="button" data-catalogue-book="${book.id}"><img src="${coverData(book)}" alt="${escapeHtml(book.title)}"><span><strong>${escapeHtml(book.title)}</strong><small>${escapeHtml(book.author)}</small></span></button>`
    : `<button type="button" data-catalogue-book="${book.id}"><img src="${coverData(book)}" alt="${escapeHtml(book.title)}"><strong>${escapeHtml(book.title)}</strong><small>${escapeHtml(book.author)}</small></button>`

  function visibleBooks() {
    const books = state.catalogue.books.filter(book => state.activeHouseId === 'all' || book.houseIds.includes(state.activeHouseId))
    return state.query.trim() ? searchPublishedBooks(books, state.query) : books
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
    root.querySelectorAll('[data-library-world-art],[data-your-library-world-art],[data-book-detail-world-art],[data-edition-world-art],[data-preface-world-art]').forEach(image => { image.src = src })
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

  function renderReaderState() {
    state.continuations = resolveContinuations()
    const section = root.querySelector('.tov5-library-continue')
    const rail = root.querySelector('[data-library-continue-rail]')
    section.hidden = state.continuations.length === 0
    section.querySelector('small').textContent = state.auth.signedIn ? 'Synced to your account' : 'Saved on this device'
    rail.innerHTML = state.continuations.map(resume => {
      const book = state.booksById.get(resume.bookId)
      const progress = progressFor(resume)
      return `<button type="button" class="tov5-continue-card" data-continue-book="${escapeHtml(book.id)}" aria-label="Continue ${escapeHtml(book.title)} from ${escapeHtml(resume.placeLabel)}"><img src="${coverData(book)}" alt=""><span><small>${escapeHtml(book.author)}</small><strong>${escapeHtml(book.title)}</strong><em>${escapeHtml(resume.placeLabel)}</em><i>${escapeHtml(resume.recap)}</i><span class="tov5-reading-progress" role="progressbar" aria-label="Whole-book progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress === null ? 0 : progress.toFixed(2)}"><b style="width:${progress ?? 0}%"></b></span><u>${formatWholeBookProgress(progress)} · Continue →</u></span></button>`
    }).join('')

    const finished = state.catalogue.books.filter(book => completionRecord(book.id).completed)
    const finishedSection = root.querySelector('.tov5-library-finished')
    finishedSection.hidden = finished.length === 0
    finishedSection.querySelector('[data-library-finished-rail]').innerHTML = finished.map(book => card(book, true)).join('')

    const savedIds = readJson('tinct:library')
    const localBooks = new Set([...(Array.isArray(savedIds) ? savedIds : []), ...state.continuations.map(item => item.bookId)])
    const dismissed = localStorage.getItem(INVITE_DISMISSED_KEY) === '1'
    root.querySelector('[data-library-account-invite]').hidden = state.auth.signedIn || localBooks.size < 2 || dismissed
  }

  function renderLibrary() {
    const books = visibleBooks()
    const searching = Boolean(state.query.trim())
    const top = searching ? [] : books.slice(0, 16)
    const library = root.querySelector('[data-view-panel="library"]')
    library.classList.toggle('is-searching', searching)
    const track = library.querySelector('.tov5-library-track')
    track.innerHTML = top.map(book => card(book)).join('')
    library.querySelector('.tov5-library-heading h2').textContent = state.query ? 'Search results' : state.activeHouseId === 'all' ? 'Popular' : state.catalogue.houses.find(house => house.id === state.activeHouseId)?.title || 'Library'
    library.querySelector('.tov5-library-heading small').textContent = `${state.catalogue.books.length} published books`
    library.querySelector('.tov5-library-search input').placeholder = `Search ${state.catalogue.books.length} published books`
    const sections = library.querySelector('.tov5-library-body')
    sections.querySelectorAll('.tov5-library-section,.tov5-library-empty,.tov5-search-results').forEach(section => section.remove())
    if (!books.length) {
      sections.insertAdjacentHTML('beforeend', `<section class="tov5-library-empty" aria-live="polite"><h3>No books found</h3><p>Try another title, author or idea.</p></section>`)
      return
    }
    if (searching) {
      sections.insertAdjacentHTML('beforeend', `<section class="tov5-search-results" aria-live="polite"><div>${books.map(book => card(book)).join('')}</div></section>`)
      return
    }
    const shelves = state.catalogue.houses
      .filter(house => state.activeHouseId === 'all' || house.id === state.activeHouseId)
      .flatMap(house => house.shelves)
      .map(shelf => ({ ...shelf, books: shelf.bookIds.map(id => state.booksById.get(id)).filter(book => books.includes(book)) }))
      .filter(shelf => shelf.books.length)
    shelves.forEach(shelf => sections.insertAdjacentHTML('beforeend', `<section class="tov5-library-section" data-shelf-id="${shelf.id}"><header><h3>${escapeHtml(shelf.title)}</h3>${shelf.subtitle ? `<small>${escapeHtml(shelf.subtitle)}</small>` : ''}</header><div class="tov5-library-rail" tabindex="0" aria-label="${escapeHtml(shelf.title)} books">${shelf.books.map(book => card(book, true)).join('')}</div></section>`))
    sections.append(root.querySelector('.tov5-library-finished'))
    if (window.lucide) window.lucide.createIcons()
  }

  function renderCategories() {
    const nav = root.querySelector('[data-view-panel="library"] .tov5-categories')
    nav.innerHTML = [{ id: 'all', title: 'All' }, ...state.catalogue.houses].map(item => `<button type="button" data-catalogue-house="${item.id}" aria-pressed="${item.id === state.activeHouseId}">${escapeHtml(item.title)}</button>`).join('')
  }

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
    root.querySelector('[data-book-detail-cover]').src = coverData(book)
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
    root.querySelector('.tov5-edition-head img').src = coverData(book)
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
    // Neutral reader route: its layout follows the viewport. Explicit
    // /lab/phone and /lab/desktop remain useful QA overrides.
    window.location.assign('/lab/reader')
    return true
  }

  function readStored(key) { return readJson(`tinct:${key}`) }

  function returningItems() {
    return state.catalogue.books.flatMap(book => {
      const position = readStored(`position:${book.id}`)
      if (!position || position.bookId !== book.id || !Number.isInteger(position.chapterNumber) || position.chapterNumber < 1) return []
      const progress = readStored(`progress:${book.id}`)
      const log = readStored(`reading-log:${book.id}`)
      const lastReadAt = position.updatedAt || log?.updatedAt || null
      const edition = book.editions.find(item => item.style === 'original' && item.language === 'en') || book.editions[0]
      return [{ book, position, edition, percent: typeof progress?.percent === 'number' ? Math.max(0, Math.min(100, progress.percent)) : null, lastReadAt }]
    }).sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
  }

  function renderReturningLibrary() {
    const items = returningItems()
    const panel = root.querySelector('[data-view-panel="your-library"]')
    const carousel = panel.querySelector('[data-reader-carousel]')
    const finished = panel.querySelector('.tov5-finished-books')
    finished.hidden = true
    if (!items.length) {
      carousel.innerHTML = '<div class="tov5-library-empty"><h3>No books in progress yet</h3><p>Choose a published book from the full library to begin.</p></div>'
    } else {
      carousel.innerHTML = items.map(({ book, position, percent, lastReadAt }, index) => `<article class="tov5-reader-card ${index === 0 ? 'is-current' : ''}" data-returning-book="${book.id}"><img src="${coverData(book)}" alt="${escapeHtml(book.title)}"><div class="tov5-reader-card-copy"><small>${escapeHtml(book.author)}</small><h3>${escapeHtml(book.title)}</h3><p class="tov5-reader-position">Chapter ${position.chapterNumber}${percent === null ? '' : ` · ${percent}% read`}</p><div class="tov5-progress"><span style="width:${percent || 0}%"></span></div><aside><small>${lastReadAt ? `Last read ${formatDate(lastReadAt)}` : 'Saved reading place'}</small><p>Continue at chapter ${position.chapterNumber}.</p></aside><button type="button" data-continue-book="${book.id}">Continue <i data-lucide="arrow-right" aria-hidden="true"></i></button></div></article>`).join('')
    }
    const embedded = panel.querySelector('.tov5-embedded-books')
    embedded.innerHTML = state.catalogue.books.slice(0, 8).map(book => card(book)).join('')
    panel.querySelector('.tov5-embedded-library header small').textContent = `${state.catalogue.books.length} published books`
    if (window.lucide) window.lucide.createIcons()
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
    if (event.target.closest('[data-library-search-trigger]')) {
      event.preventDefault(); event.stopImmediatePropagation(); setSearchOpen(true); return
    }
    if (event.target.closest('[data-library-search-close]')) {
      event.preventDefault(); event.stopImmediatePropagation(); setSearchOpen(false, true); return
    }
    if (event.target.closest('[data-library-invite-dismiss]')) {
      event.preventDefault(); event.stopImmediatePropagation()
      localStorage.setItem(INVITE_DISMISSED_KEY, '1'); renderReaderState(); return
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
    const category = event.target.closest('[data-catalogue-house]')
    if (category) {
      event.preventDefault(); event.stopImmediatePropagation()
      state.activeHouseId = category.dataset.catalogueHouse
      renderCategories(); renderLibrary()
      category.scrollIntoView({ inline: 'center', block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
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
    const continuing = event.target.closest('[data-continue-book]')
    if (continuing) {
      event.preventDefault(); event.stopImmediatePropagation()
      const item = state.continuations.find(candidate => candidate.bookId === continuing.dataset.continueBook)
      if (!item) return
      await selectBook(item.bookId, 'library')
      openReader(resumeSavedPlace(item))
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
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && event.target.matches('.tov5-library-rail,[data-library-continue-rail]')) {
      event.preventDefault(); event.target.scrollBy({ left: event.key === 'ArrowRight' ? 260 : -260, behavior: 'smooth' }); return
    }
    if (event.key !== 'Enter' && event.key !== ' ') return
    const editionCard = event.target.closest('[data-catalogue-edition][data-select-edition]')
    const compareCard = event.target.closest('.tov5-both[data-edition-choice]')
    if (!editionCard && !compareCard) return
    event.preventDefault()
    if (editionCard) selectEdition(editionCard.dataset.selectEdition)
    else selectEdition(state.selectedEditionKey, compareCard.dataset.compareEdition)
  })

  root.addEventListener('input', event => {
    if (!event.target.matches('[data-view-panel="library"] .tov5-library-search input')) return
    state.query = event.target.value
    renderLibrary()
  })

  function setSearchOpen(open, clear = false) {
    const panel = root.querySelector('[data-library-search-panel],#tov5-library-search-panel')
    const trigger = root.querySelector('[data-library-search-trigger]')
    const input = panel.querySelector('input')
    panel.hidden = !open
    trigger.setAttribute('aria-expanded', String(open))
    if (clear) {
      input.value = ''; state.query = ''; renderLibrary()
    }
    if (open) requestAnimationFrame(() => input.focus())
    else trigger.focus()
  }

  window.__tinctLabPreReader = {
    ready: false,
    createHandoff,
    selectBook,
    visibleBooks,
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

  fetch('/lab/catalogue.json?v=20260903-2').then(response => {
    if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`)
    return response.json()
  }).then(catalogue => {
    state.catalogue = catalogue
    state.booksById = new Map(catalogue.books.map(book => [book.id, book]))
    state.auth = window.__tinctLabAuthState || state.auth
    state.continuations = resolveContinuations()
    renderCategories()
    renderLibrary()
    renderReaderState()
    const params = new URLSearchParams(location.search)
    const requested = params.get('book')
    const routeView = location.pathname.replace(/\/+$/, '') === '/lab/library' ? 'library' : 'landing'
    const requestedView = params.get('view')
    const allowedViews = new Set(['landing', 'library', 'book-detail', 'edition'])
    return selectBook(state.booksById.has(requested) ? requested : 'odyssey', allowedViews.has(requestedView) ? requestedView : routeView)
  }).then(() => {
    window.__tinctLabPreReader.ready = true
    window.dispatchEvent(new CustomEvent('tinct:lab-catalogue-ready'))
  }).catch(error => {
    console.error(error)
    root.querySelector('.tov5-note').textContent = 'Published catalogue unavailable.'
  })

  window.addEventListener('tinct:lab-auth-state', event => {
    state.auth = event.detail || state.auth
    if (state.catalogue) renderReaderState()
  })

  window.addEventListener('popstate', async () => {
    if (!state.catalogue) return
    const params = new URLSearchParams(location.search)
    const bookId = params.get('book')
    const path = location.pathname.replace(/\/+$/, '')
    const view = path === '/lab/library' ? 'library' : path === '/lab/landing' || path === '/lab' ? (params.get('view') || 'landing') : 'landing'
    if (bookId && state.booksById.has(bookId) && (view === 'book-detail' || view === 'edition')) await selectBook(bookId, view)
    else showView(view === 'library' ? 'library' : 'landing')
  })
}
