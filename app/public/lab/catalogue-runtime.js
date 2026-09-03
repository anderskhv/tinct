(() => {
  const root = document.querySelector('#tinct-onboarding-worlds-v5')
  if (!root) return

  const state = {
    catalogue: null,
    booksById: new Map(),
    selectedBookId: 'odyssey',
    selectedEditionKey: null,
    compareEditionKey: null,
    activeHouseId: 'all',
    query: '',
    onboarding: null,
  }
  const coverCache = new Map()
  const worldCache = new Map()

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
  const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const selectedBook = () => state.booksById.get(state.selectedBookId)
  const formatDate = value => value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(value) : ''
  const formatWordCount = count => count ? `${new Intl.NumberFormat().format(count)} words` : 'Length unavailable'

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

  function searchScore(book, rawQuery) {
    const query = normalize(rawQuery)
    if (!query) return 1
    const title = normalize(book.title)
    const author = normalize(book.author)
    const topics = normalize([book.summary, ...book.topics].join(' '))
    const tokens = query.split(/\s+/).filter(Boolean)
    if (!tokens.every(token => `${title} ${author} ${topics}`.includes(token))) return 0
    let score = title === query ? 10000 : title.startsWith(query) ? 5000 : title.includes(query) ? 2500 : 0
    score += author === query ? 8000 : author.startsWith(query) ? 4000 : author.includes(query) ? 2000 : 0
    tokens.forEach(token => {
      score += title.split(/\s+/).includes(token) ? 900 : title.includes(token) ? 500 : 0
      score += author.split(/\s+/).includes(token) ? 700 : author.includes(token) ? 350 : 0
      score += topics.includes(token) ? 100 : 0
    })
    return score
  }

  function visibleBooks() {
    const books = state.catalogue.books.filter(book => state.activeHouseId === 'all' || book.houseIds.includes(state.activeHouseId))
    if (!state.query.trim()) return books
    return books.map(book => ({ book, score: searchScore(book, state.query) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score || a.book.catalogueIndex - b.book.catalogueIndex)
      .map(result => result.book)
  }

  function showView(view) {
    root.querySelectorAll('[data-view-panel]').forEach(panel => panel.classList.toggle('is-current', panel.dataset.viewPanel === view))
    root.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)))
  }

  function applyWorld(book) {
    root.querySelectorAll('.tov5-zoom').forEach(zoom => {
      zoom.dataset.bookWorld = book.id
      zoom.style.setProperty('--tov5-world-accent', book.cover.accent)
      zoom.style.setProperty('--tov5-world-ink', book.cover.background)
    })
    const src = worldData(book)
    root.querySelectorAll('[data-library-world-art],[data-your-library-world-art],[data-librarian-world-art],[data-book-detail-world-art],[data-edition-world-art],[data-preface-world-art]').forEach(image => { image.src = src })
  }

  function renderLibrary() {
    const books = visibleBooks()
    const top = books.slice(0, 16)
    const library = root.querySelector('[data-view-panel="library"]')
    const track = library.querySelector('.tov5-library-track')
    track.innerHTML = top.map(book => card(book)).join('')
    library.querySelector('header h2').textContent = state.query ? 'Search results' : state.activeHouseId === 'all' ? 'Popular' : state.catalogue.houses.find(house => house.id === state.activeHouseId)?.title || 'Library'
    library.querySelector('header small').textContent = `${state.catalogue.books.length} published books`
    library.querySelector('.tov5-library-search input').placeholder = `Search ${state.catalogue.books.length} published books`
    const sections = library.querySelector('.tov5-library-body')
    sections.querySelectorAll('.tov5-library-section,.tov5-library-empty').forEach(section => section.remove())
    if (!books.length) {
      sections.insertAdjacentHTML('beforeend', `<section class="tov5-library-empty" aria-live="polite"><h3>No books found</h3><p>Try another title, author or idea.</p></section>`)
      return
    }
    const shelves = state.catalogue.houses
      .filter(house => state.activeHouseId === 'all' || house.id === state.activeHouseId)
      .flatMap(house => house.shelves)
      .map(shelf => ({ ...shelf, books: shelf.bookIds.map(id => state.booksById.get(id)).filter(book => books.includes(book)) }))
      .filter(shelf => shelf.books.length)
    shelves.slice(0, state.query ? 12 : 6).forEach(shelf => sections.insertAdjacentHTML('beforeend', `<section class="tov5-library-section" data-shelf-id="${shelf.id}"><header><h3>${escapeHtml(shelf.title)}</h3></header><div>${shelf.books.slice(0, 6).map(book => card(book, true)).join('')}</div></section>`))
    if (window.lucide) window.lucide.createIcons()
  }

  function renderCategories() {
    const nav = root.querySelector('[data-view-panel="library"] .tov5-categories')
    nav.innerHTML = [{ id: 'all', title: 'All' }, ...state.catalogue.houses].map(item => `<button type="button" data-catalogue-house="${item.id}" aria-pressed="${item.id === state.activeHouseId}">${escapeHtml(item.title)}</button>`).join('')
  }

  async function selectBook(bookId, destination = 'book-detail') {
    const book = state.booksById.get(bookId)
    if (!book) return false
    state.selectedBookId = book.id
    state.selectedEditionKey = book.editions.find(edition => edition.style === 'original' && edition.language === 'en')?.key
      || book.editions.find(edition => edition.style === 'modern' && edition.language === 'en')?.key
      || book.editions[0]?.key
    state.compareEditionKey = null
    state.onboarding = null
    applyWorld(book)
    renderDetail(book)
    renderEditions(book)
    await loadOnboarding(book)
    showView(destination)
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
    root.querySelector('[data-book-read-time]').textContent = `${book.editions.length} ${book.editions.length === 1 ? 'edition' : 'editions'}`
    root.querySelector('[data-book-read-time]').nextElementSibling.textContent = 'Available'
    root.querySelector('[data-book-listen-time]').textContent = book.availability.audio ? 'Available' : 'Unavailable'
    root.querySelector('[data-book-listen-time]').nextElementSibling.textContent = 'Audio'
  }

  const editionTitle = edition => edition.style === 'modern' ? 'Modern text' : edition.style === 'original' ? 'Original text' : 'Published text'
  function renderEditions(book) {
    root.querySelector('.tov5-edition-head img').src = coverData(book)
    root.querySelector('.tov5-edition-head img').alt = book.title
    root.querySelector('.tov5-edition-head small').textContent = book.title
    const grid = root.querySelector('.tov5-edition-grid')
    grid.dataset.editionCount = String(book.editions.length)
    grid.innerHTML = book.editions.map(edition => `<article data-catalogue-edition="${edition.key}" class="${edition.key === state.selectedEditionKey ? 'is-selected' : ''}"><div class="tov5-edition-dropdown"><span><small>${editionTitle(edition)}</small><b>${escapeHtml(edition.label)}</b><em>${escapeHtml(edition.provenanceLabel)}</em></span></div><p>${escapeHtml(edition.language.toUpperCase())}${edition.year ? ` · ${edition.year}` : ''}<br>${edition.availability.audio ? 'Text and audio available' : 'Text available'}</p><button type="button" data-select-edition="${edition.key}" aria-pressed="${edition.key === state.selectedEditionKey}"><span></span>Choose ${escapeHtml(edition.label)}</button></article>`).join('')
    root.querySelectorAll('[data-edition-menu]').forEach(menu => { menu.hidden = true })
    updateCompareOption(book)
    updateContinueLabel(book)
  }

  function updateCompareOption(book) {
    const primary = book.editions.find(edition => edition.key === state.selectedEditionKey)
    const compare = primary?.aligned ? book.editions.find(edition => edition.key !== primary.key && edition.availability.compare) : null
    const both = root.querySelector('.tov5-both')
    both.hidden = !compare
    if (compare) {
      both.querySelector('strong').textContent = `Compare ${primary.label} and ${compare.label}.`
      both.querySelector('[data-edition-choice]').dataset.compareEdition = compare.key
    }
  }

  function updateContinueLabel(book) {
    const edition = book.editions.find(item => item.key === state.selectedEditionKey)
    root.querySelector('.tov5-continue').textContent = state.compareEditionKey ? 'Continue with Both' : `Continue with ${edition?.label || 'selected edition'}`
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
    const primary = book?.editions.find(edition => edition.key === selection?.primaryEditionKey)
    if (!book || !primary?.availability.chapterText) return null
    const intent = { kind: 'open-reader', bookId: book.id, primaryEditionKey: primary.key }
    if (selection.compareEditionKey) {
      const compare = book.editions.find(edition => edition.key === selection.compareEditionKey)
      if (!primary.aligned || !compare || compare.key === primary.key || !compare.availability.compare) return null
      intent.compareEditionKey = compare.key
    }
    if (selection.audioEditionKey) {
      const audio = book.editions.find(edition => edition.key === selection.audioEditionKey)
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
    const intent = createHandoff({
      bookId: book.id,
      primaryEditionKey: state.selectedEditionKey,
      ...(state.compareEditionKey ? { compareEditionKey: state.compareEditionKey } : {}),
      ...(savedPlace ? { savedPlace } : {}),
    })
    if (!intent) return false
    window.__tinctLabLastHandoff = intent
    window.dispatchEvent(new CustomEvent('tinct:lab-reader-handoff', { detail: intent }))
    root.querySelector('.tov5-note').textContent = `Reader handoff ready for ${book.title}`
    return true
  }

  function readStored(key) {
    try { return JSON.parse(localStorage.getItem(`tinct:${key}`) || 'null') } catch { return null }
  }

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
    const startCatalogue = event.target.closest('[data-start-catalogue]')
    if (startCatalogue) {
      event.preventDefault(); event.stopImmediatePropagation()
      showView('library')
      root.querySelector('[data-view-panel="library"] .tov5-library-search input')?.focus({ preventScroll: true })
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
      await selectBook(bookButton.dataset.catalogueBook)
      return
    }
    const category = event.target.closest('[data-catalogue-house]')
    if (category) {
      event.preventDefault(); event.stopImmediatePropagation()
      state.activeHouseId = category.dataset.catalogueHouse
      renderCategories(); renderLibrary()
      return
    }
    const editionButton = event.target.closest('[data-select-edition]')
    if (editionButton) {
      event.preventDefault(); event.stopImmediatePropagation()
      state.selectedEditionKey = editionButton.dataset.selectEdition
      state.compareEditionKey = null
      renderEditions(selectedBook())
      return
    }
    const compareButton = event.target.closest('.tov5-both [data-edition-choice]')
    if (compareButton) {
      event.preventDefault(); event.stopImmediatePropagation()
      state.compareEditionKey = state.compareEditionKey ? null : compareButton.dataset.compareEdition
      compareButton.setAttribute('aria-pressed', String(Boolean(state.compareEditionKey)))
      updateContinueLabel(selectedBook())
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
      const item = returningItems().find(candidate => candidate.book.id === continuing.dataset.continueBook)
      if (!item) return
      await selectBook(item.book.id, 'your-library')
      state.selectedEditionKey = item.edition.key
      openReader({ bookId: item.book.id, chapterNumber: item.position.chapterNumber, page: item.position.currentPage, paragraphIndex: item.position.lastParagraphIndex })
      return
    }
    if (event.target.closest('.tov5-choose-edition')) {
      event.preventDefault(); event.stopImmediatePropagation(); renderEditions(selectedBook()); showView('edition'); return
    }
    if (event.target.closest('.tov5-continue')) {
      event.preventDefault(); event.stopImmediatePropagation(); renderOnboarding(selectedBook()); showView('preface'); return
    }
    if (event.target.closest('[data-begin-reading]')) {
      event.preventDefault(); event.stopImmediatePropagation(); openReader(); return
    }
  }, true)

  root.addEventListener('input', event => {
    if (!event.target.matches('[data-view-panel="library"] .tov5-library-search input')) return
    state.query = event.target.value
    renderLibrary()
  })

  window.__tinctLabPreReader = {
    ready: false,
    createHandoff,
    selectBook,
    visibleBooks,
    renderEditionsForTest(book) {
      const previous = state.booksById.get(book.id)
      state.booksById.set(book.id, book)
      state.selectedBookId = book.id
      state.selectedEditionKey = book.editions[0]?.key || null
      renderEditions(book)
      if (previous) state.booksById.set(book.id, previous)
    },
  }

  fetch('/lab/catalogue.json').then(response => {
    if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`)
    return response.json()
  }).then(catalogue => {
    state.catalogue = catalogue
    state.booksById = new Map(catalogue.books.map(book => [book.id, book]))
    renderCategories()
    renderLibrary()
    renderReturningLibrary()
    const requested = new URLSearchParams(location.search).get('book')
    return selectBook(state.booksById.has(requested) ? requested : 'odyssey', new URLSearchParams(location.search).get('view') || 'landing')
  }).then(() => {
    window.__tinctLabPreReader.ready = true
    window.dispatchEvent(new CustomEvent('tinct:lab-catalogue-ready'))
  }).catch(error => {
    console.error(error)
    root.querySelector('.tov5-note').textContent = 'Published catalogue unavailable.'
  })
})()
