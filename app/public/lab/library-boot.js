/*
 * Library first paint (lab/index.html loads this as a blocking classic script
 * in <head>; the production CSP is script-src 'self', so it cannot be inline).
 *
 * Before any markup is parsed it decides the panel the URL asks for, the
 * signed-in hint, and whether a returning reader's recap can be painted from
 * the last confirmed snapshot (src/lab/labLibraryBoot.ts writes it). The
 * recap and the account pill are painted the moment the parser has inserted
 * them (MutationObserver, before the next frame). Module scripts then confirm
 * or correct; nothing here waits on the network.
 */
(function () {
  var BOOT_KEY = 'tinct:lab-library-boot'
  var MEMORY_KEY = 'tinct:reading-memory'
  var POSITION_KEY = 'tinct-lab-position'
  var MAX_AGE = 30 * 24 * 60 * 60 * 1000

  function readJson(storage, key) {
    try { var raw = storage.getItem(key); return raw ? JSON.parse(raw) : null } catch (e) { return null }
  }
  function displayName(user) {
    var meta = (user && user.user_metadata) || {}
    var candidates = [meta.full_name, meta.name, meta.given_name, meta.first_name]
    for (var i = 0; i < candidates.length; i++) {
      if (typeof candidates[i] === 'string' && candidates[i].trim()) return candidates[i].trim().split(/\s+/)[0]
    }
    var local = user && typeof user.email === 'string' ? user.email.split('@')[0].trim() : ''
    return local || null
  }
  function cachedUser(storage) {
    try {
      for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i)
        if (!key || !/^sb-.*-auth-token$/.test(key)) continue
        var raw = storage.getItem(key)
        if (!raw || raw === 'null' || raw === '""') continue
        var session = JSON.parse(raw)
        var user = session && session.user
        if (!user || typeof user.id !== 'string' || !user.id) continue
        var name = displayName(user)
        return { id: user.id, name: name, initial: name ? name.trim().charAt(0).toLocaleUpperCase() : '' }
      }
    } catch (e) { /* unreadable storage */ }
    return null
  }
  function hasCookie(cookie) {
    try { return (cookie || '').split(';').some(function (part) { return part.trim() === 'tinct_auth=1' }) } catch (e) { return false }
  }
  function libraryRequested(loc) {
    var path = String(loc.pathname || '').replace(/\/+$/, '')
    if (path === '/lab/library' || path === '/library') return true
    try { return new URLSearchParams(loc.search || '').get('view') === 'library' } catch (e) { return false }
  }
  function safeSrc(value) {
    if (typeof value !== 'string' || !value) return null
    if (value.indexOf('/') === 0 && value.indexOf('//') !== 0) return value
    if (value.indexOf('https://') === 0 || value.indexOf('data:image/svg+xml') === 0) return value
    return null
  }
  function str(value, max) { return typeof value === 'string' && value && value.length <= max ? value : null }
  function snapshotFor(storage, userId, now) {
    var raw = readJson(storage, BOOT_KEY)
    if (!raw || raw.v !== 1 || typeof raw.at !== 'number' || now - raw.at > MAX_AGE || raw.at > now + 60000) return null
    if ((raw.userId === null ? null : str(raw.userId, 120)) !== userId) return null
    var hero = null
    if (raw.hero && typeof raw.hero === 'object') {
      var h = raw.hero
      var bookId = str(h.bookId, 80), title = str(h.title, 200), chapterLabel = str(h.chapterLabel, 200), headline = str(h.headline, 600)
      if (!bookId || !title || !chapterLabel || !headline) return null
      hero = { bookId: bookId, title: title, chapterLabel: chapterLabel, headline: headline, coverSrc: safeSrc(h.coverSrc), coverSrcSet: safeSrc(h.coverSrc) ? str(h.coverSrcSet, 4000) : null, note: str(h.note, 40) }
    }
    var count = function (v) { return typeof v === 'number' && v >= 0 && v <= 10000 ? Math.floor(v) : 0 }
    return { at: raw.at, userId: userId, readingNow: count(raw.readingNow), finished: count(raw.finished), hero: hero }
  }
  function deviceHasReading(storage) {
    var memory = readJson(storage, MEMORY_KEY)
    if (memory && memory.sessions && typeof memory.sessions === 'object') {
      var sessions = memory.sessions
      for (var id in sessions) if (sessions[id] && sessions[id].anchor && typeof sessions[id].anchor.bookId === 'string') return true
    }
    var position = readJson(storage, POSITION_KEY)
    if (position && position.books && typeof position.books === 'object') {
      var books = position.books
      for (var key in books) if (books[key] && typeof books[key].bookId === 'string') return true
    }
    return false
  }

  /** Pure: what the page should look like before any script has answered. */
  function bootState(loc, cookie, storage, now) {
    now = now || Date.now()
    var user = storage ? cachedUser(storage) : null
    var signedIn = Boolean(user) || hasCookie(cookie)
    var snapshot = storage ? snapshotFor(storage, user ? user.id : null, now) : null
    var returning = Boolean(snapshot && snapshot.hero) || (storage ? deviceHasReading(storage) : false)
    return { library: libraryRequested(loc), signedIn: signedIn, user: user, snapshot: snapshot, returning: returning }
  }

  function el(tag, className, textContent) {
    var node = document.createElement(tag)
    if (className) node.className = className
    if (textContent != null) node.textContent = textContent
    return node
  }
  function coverNode(hero) {
    var cover = el('span', 'lib-cover')
    if (hero && hero.coverSrc) {
      var img = document.createElement('img')
      img.src = hero.coverSrc
      if (hero.coverSrcSet) img.srcset = hero.coverSrcSet
      img.alt = ''
      img.decoding = 'async'
      cover.appendChild(img)
    } else {
      cover.setAttribute('aria-hidden', 'true')
    }
    return cover
  }
  function sectionHead(label, count, attr) {
    var head = el('header', 'lib-index-head lib-sec-head')
    head.setAttribute(attr, '')
    head.appendChild(el('span', 'lib-eyebrow is-dim', label))
    head.appendChild(el('span', 'lib-cnt', String(count)))
    return head
  }
  /** The same markup src/labReadingMemory.ts renders, from the snapshot; a quiet skeleton when only "returning" is known. */
  function paintRecap(section, state) {
    var snapshot = state.snapshot
    var hero = snapshot && snapshot.hero
    section.innerHTML = ''
    var wrap = el('section', 'lib-reading-now')
    wrap.setAttribute('data-reading-now-section', '')
    wrap.setAttribute('aria-label', 'Reading now')
    if (hero) {
      section.setAttribute('data-boot-recap', 'snapshot')
      wrap.appendChild(sectionHead('Reading now', Math.max(1, snapshot.readingNow), 'data-reading-now-head'))
      var card = el('div', 'lib-recap-hero')
      card.setAttribute('data-recap-hero', hero.bookId)
      var head = el('div', 'lib-recap-head')
      head.appendChild(el('p', 'lib-eyebrow', 'Last time you read · ' + hero.chapterLabel))
      head.appendChild(el('h1', 'lib-h1', hero.headline))
      card.appendChild(head)
      var coverWrap = el('div', 'lib-recap-cover')
      coverWrap.appendChild(coverNode(hero))
      card.appendChild(coverWrap)
      var meta = el('div', 'lib-recap-meta')
      meta.appendChild(el('p', 'lib-lede', hero.title))
      var cta = el('div', 'lib-recap-cta')
      var button = el('button', 'lib-cta', 'Continue reading')
      button.type = 'button'
      button.setAttribute('data-recap-continue', hero.bookId)
      cta.appendChild(button)
      if (hero.note) cta.appendChild(el('span', 'lib-cta-note', hero.note))
      meta.appendChild(cta)
      card.appendChild(meta)
      wrap.appendChild(card)
    } else {
      section.setAttribute('data-boot-recap', 'skeleton')
      section.setAttribute('aria-busy', 'true')
      wrap.appendChild(sectionHead('Reading now', '', 'data-reading-now-head'))
      var skeleton = el('div', 'lib-recap-hero lib-boot-skel')
      var skHead = el('div', 'lib-recap-head')
      skHead.appendChild(el('p', 'lib-eyebrow lib-boot-bar'))
      skHead.appendChild(el('h1', 'lib-h1 lib-boot-bar'))
      skeleton.appendChild(skHead)
      var skCover = el('div', 'lib-recap-cover')
      skCover.appendChild(coverNode(null))
      skeleton.appendChild(skCover)
      var skMeta = el('div', 'lib-recap-meta')
      skMeta.appendChild(el('p', 'lib-lede lib-boot-bar'))
      var skCta = el('div', 'lib-recap-cta')
      var skButton = el('button', 'lib-cta', 'Continue reading')
      skButton.type = 'button'
      skButton.setAttribute('data-recap-continue', '')
      skCta.appendChild(skButton)
      skMeta.appendChild(skCta)
      skeleton.appendChild(skMeta)
      wrap.appendChild(skeleton)
    }
    var others = el('div', 'lib-recap-others')
    others.setAttribute('data-recap-others', '')
    wrap.appendChild(others)
    section.appendChild(wrap)
    section.hidden = false
  }
  function paintPill(root, state) {
    var links = root.querySelectorAll('[data-lab-auth-link]')
    for (var i = 0; i < links.length; i++) {
      var link = links[i]
      if (!state.signedIn || link.hasAttribute('data-auth-ready')) continue
      var name = state.user && state.user.name
      if (name && link.hasAttribute('data-lab-auth-name')) {
        var glyph = el('span', 'lib-acct-glyph', state.user.initial)
        glyph.setAttribute('aria-hidden', 'true')
        link.textContent = ''
        link.appendChild(el('span', 'lib-acct-name', name))
        link.appendChild(glyph)
        link.setAttribute('aria-label', name + ' — account')
      } else {
        link.textContent = 'Account'
      }
      var returnTo = link.getAttribute('data-auth-return-to') || '/lab/library'
      link.href = '/lab/sign-in?mode=account&returnTo=' + encodeURIComponent(returnTo)
      link.setAttribute('data-signed-in', 'true')
      link.setAttribute('data-auth-ready', 'false')
    }
  }
  /** Called from the inline script right after the library panel's markup. */
  function paint(root, state) {
    if (!root || !state) return
    paintPill(root, state)
    var lib = root.querySelector('.lib[data-library]')
    if (lib && state.returning) lib.setAttribute('data-library-mode', 'returning')
    var section = root.querySelector('[data-reading-memory-recap]')
    if (section && state.library && state.returning) paintRecap(section, state)
  }

  /** Paint as soon as the parser has inserted the library panel (microtask, before the next frame); DOMContentLoaded is the fallback. */
  function observe(state) {
    var painted = false
    var attempt = function () {
      if (painted) return true
      var root = document.getElementById('tinct-onboarding-worlds-v5')
      if (!root || !root.querySelector('[data-reading-memory-recap]') || !root.querySelector('[data-lab-auth-link]')) return false
      painted = true
      paint(root, state)
      return true
    }
    if (attempt()) return
    if (typeof MutationObserver === 'function') {
      var observer = new MutationObserver(function () { if (attempt()) observer.disconnect() })
      observer.observe(document.documentElement, { childList: true, subtree: true })
    }
    document.addEventListener('DOMContentLoaded', attempt)
  }

  window.__tinctLabBoot = { state: null, bootState: bootState, paint: paint, observe: observe }
  try {
    var state = bootState(location, document.cookie, window.localStorage)
    window.__tinctLabBoot.state = state
    var html = document.documentElement
    if (state.library) html.setAttribute('data-lab-boot-view', 'library')
    if (state.signedIn) html.setAttribute('data-lab-auth-hint', 'signed-in')
    if (state.returning) html.setAttribute('data-lab-boot-mode', 'returning')
    if (state.library && (state.signedIn || state.returning)) observe(state)
  } catch (e) { /* storage blocked: the module scripts resolve the slow way */ }
})()
