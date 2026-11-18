/*
 * The Try page (public/try.html; docs/try-page/BRIEF.md): just the reader, with hints (Anders, 18 Nov 2026). The
 * real reader runs in a frame in demo mode (public/lab/try/reader-demo.js, src/lab/tryDemo/tryDemo.ts). Beside it, a
 * checklist of five things ticks as the visitor does each one, in any order; inside it, one small hint at a time sits
 * by the control for the next thing not yet done. Nothing runs on its own and nothing here scrolls the reader: the
 * page only reads the frame's DOM (same origin) to place the hint. When the AI runs out (the visitor's free
 * questions, or the page's own day), the sign-up card shows instead of an error, and creating an account carries
 * this conversation over.
 */
(function () {
  'use strict'
  var READER = { book: 'meditations', chapter: 2 }
  var WIDE = '(min-width: 900px)'
  var TOUCH = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  var COPY = {
    chatTitle: 'Keep the conversation going',
    chatBody: "That's the free questions for today. Create an account and carry on right here — this conversation comes with you, and your first month of Premium is free.",
    // The reader's own listening prompt (src/lab/labCopy.ts accountTitleAudio / accountBodyAudio).
    audioTitle: 'Create a free account to keep listening',
    audioBody: 'Listen on, and use all of Tinct’s AI features. Your first month of AI is free. You can also keep reading without an account.',
  }
  // The five things, in the order the checklist and the hints offer them. `hint` is the bubble's fixed copy (HTML).
  var ITEMS = [
    { key: 'explain', hint: (TOUCH ? 'Press and hold' : 'Select') + ' a sentence to have it <b>explained</b>.', side: 'above' },
    { key: 'ask', hint: '<b>Keep asking.</b> Try “Why does he call them kin?”', side: 'below' },
    { key: 'modern', hint: 'Read it in <b>today’s words</b>. Your place stays put.', side: 'below' },
    { key: 'listen', hint: 'Hear it as you read.', side: 'below' },
    { key: 'summary', hint: 'Get the gist in a minute.', side: 'below' },
  ]

  var $ = function (selector, root) { return (root || document).querySelector(selector) }
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)) }
  var frame = $('[data-try-frame]')
  var limit = $('[data-try-limit]')
  var done = {}
  var dismissed = {}
  var reader = { ready: false, edition: 'original-en', phone: false }
  var queued = []
  var wide = window.matchMedia(WIDE).matches

  function readerSrc() {
    var params = new URLSearchParams({ book: READER.book, chapter: String(READER.chapter), edition: 'original-en', demo: 'try', layout: wide ? 'desktop' : 'phone' })
    return '/reader?' + params.toString()
  }
  function loadReader() {
    reader.ready = false
    queued = []
    frame.src = readerSrc()
  }

  function send(command) {
    if (!reader.ready || !frame.contentWindow) { queued.push(command); return }
    frame.contentWindow.postMessage(Object.assign({ source: 'tinct-try-page' }, command), location.origin)
  }

  // ---- The checklist (desktop) and its chips (phone) ----
  function nextUndone() {
    for (var i = 0; i < ITEMS.length; i++) if (!done[ITEMS[i].key]) return ITEMS[i].key
    return null
  }
  function render() {
    var next = nextUndone()
    $$('[data-try-item]').forEach(function (item) {
      var key = item.getAttribute('data-try-item')
      item.classList.toggle('is-done', !!done[key])
      item.classList.toggle('is-next', key === next)
      if (key === next) item.setAttribute('aria-current', 'step')
      else item.removeAttribute('aria-current')
      var state = item.querySelector('.sr-only')
      if (state) state.textContent = done[key] ? 'Done: ' : ''
    })
    schedule()
  }

  /** The visitor did one of the five: it ticks, and the hint moves on to the next thing not yet done. */
  function did(key) {
    if (done[key]) return
    done[key] = true
    render()
  }

  // ---- The hint: one bubble beside its control in the reader, only while that control is on screen ----
  var hint = $('[data-try-hint]')
  var hintText = $('[data-try-hint-text]')
  var hintKey = null

  function frameDoc() {
    try { return frame.contentDocument && frame.contentDocument.querySelector('.lab') ? frame.contentDocument : null } catch (e) { return null }
  }
  /** The control's box in the page's coordinates, when the visitor can see it now (not scrolled off, not covered). */
  function onScreen(el, inFrame) {
    var rect = el.getBoundingClientRect()
    if (!(rect.width > 0 && rect.height > 0)) return null
    var view = el.ownerDocument.defaultView
    var cx = Math.min(rect.right - 2, rect.left + Math.min(rect.width / 2, 24))
    var cy = rect.top + rect.height / 2
    if (cy < 0 || cy > view.innerHeight || cx < 0 || cx > view.innerWidth) return null
    var hit = el.ownerDocument.elementFromPoint(cx, cy)
    if (!hit || !(hit === el || el.contains(hit))) return null
    var dx = 0
    var dy = 0
    if (inFrame) { var box = frame.getBoundingClientRect(); dx = box.left; dy = box.top }
    var placed = { left: rect.left + dx, right: rect.right + dx, top: rect.top + dy, bottom: rect.bottom + dy }
    if (placed.bottom < 0 || placed.top > window.innerHeight) return null
    return placed
  }
  function firstOnScreen(doc, selector, inFrame) {
    var nodes = $$(selector, doc)
    for (var i = 0; i < nodes.length; i++) { var rect = onScreen(nodes[i], inFrame); if (rect) return rect }
    return null
  }
  function anchorFor(key, doc) {
    switch (key) {
      case 'explain': {
        // Book 2's first sentence (the scripted passage), pointed at from its first word after the section number.
        var lab = doc.querySelector('.lab')
        if (lab && lab.dataset.chapter && lab.dataset.chapter !== String(READER.chapter)) return null
        return firstOnScreen(doc, '[data-testid="lab-word"][data-paragraph-index="0"][data-word-index="1"]', true)
      }
      case 'ask': return firstOnScreen(doc, '.lab-pcard-follow-input', true)
      case 'modern':
        // The phone's switch is on the page above the reader; the desktop's is in the reader's top bar.
        return reader.phone ? firstOnScreen(document, '[data-try-edition="modern"]', false) : firstOnScreen(doc, '[data-testid="lab-try-editions"] button:last-child', true)
      case 'listen': return firstOnScreen(doc, '[data-testid="lab-v2-play"], [data-testid="lab-listen"]', true)
      case 'summary': return firstOnScreen(doc, '[data-testid="margin-start-summary"], [data-testid="lab-unit-summary"]', true)
    }
    return null
  }
  function hideHint() { hint.hidden = true; hintKey = null }
  function placeHint() {
    var doc = frameDoc()
    if (!reader.ready || !doc || !limit.hidden) { hideHint(); return }
    // The first thing not yet done or dismissed whose control is on screen now.
    var item = null
    var anchor = null
    for (var i = 0; i < ITEMS.length && !anchor; i++) {
      if (done[ITEMS[i].key] || dismissed[ITEMS[i].key]) continue
      anchor = anchorFor(ITEMS[i].key, doc)
      if (anchor) item = ITEMS[i]
    }
    if (!anchor) { hideHint(); return }
    if (hintKey !== item.key) { hintText.innerHTML = item.hint; hintKey = item.key }
    hint.hidden = false
    var bounds = frame.getBoundingClientRect()
    var minX = Math.max(8, Math.min(bounds.left, anchor.left))
    var maxX = Math.min(window.innerWidth - 8, Math.max(bounds.right, anchor.right))
    var w = hint.offsetWidth
    var h = hint.offsetHeight
    // A sentence is pointed at from its start; a control from its middle.
    var target = item.key === 'explain' ? anchor.left + 14 : (anchor.left + anchor.right) / 2
    var left = Math.max(minX + 4, Math.min(target - 34, maxX - w - 4))
    var above = anchor.top - h - 12
    var below = anchor.bottom + 12
    var roomAbove = above >= Math.max(8, Math.min(bounds.top, anchor.top) + 4)
    var roomBelow = below + h <= Math.min(window.innerHeight, bounds.bottom) - 4
    // The Explain hint sits over the heading on the desktop (D1) and under the sentence's first line on the phone (M1).
    var side = item.key === 'explain' && reader.phone ? 'below' : item.side
    var top = side === 'above' ? (roomAbove || !roomBelow ? above : below) : (roomBelow || !roomAbove ? below : above)
    hint.style.left = Math.round(left) + 'px'
    hint.style.top = Math.round(top) + 'px'
    hint.setAttribute('data-side', top === below ? 'below' : 'above')
    hint.style.setProperty('--try-hint-arrow', Math.round(Math.max(14, Math.min(target - left - 6, w - 26))) + 'px')
  }
  var pending = 0
  function schedule() { if (!pending) pending = requestAnimationFrame(function () { pending = 0; placeHint() }) }
  $('[data-try-hint-close]').addEventListener('click', function () {
    if (hintKey) dismissed[hintKey] = true
    hideHint()
    schedule()
  })
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  frame.addEventListener('load', function () {
    var doc
    try { doc = frame.contentDocument } catch (e) { doc = null }
    if (!doc) return
    // The reader scrolls in its own scroller: follow every scroll in the frame, and every change to what it shows.
    doc.addEventListener('scroll', schedule, { capture: true, passive: true })
    frame.contentWindow.addEventListener('resize', schedule)
    new MutationObserver(schedule).observe(doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-open', 'hidden', 'class', 'aria-pressed'] })
  })
  // Smooth scrolls and sheets that settle without an event.
  window.setInterval(schedule, 500)

  // ---- Original | Modern on the phone (on desktop it is in the reader's own top bar) ----
  $$('[data-try-edition]').forEach(function (button) {
    button.addEventListener('click', function () { send({ cmd: 'edition', kind: button.getAttribute('data-try-edition') }) })
  })
  function paintEdition() {
    $$('[data-try-edition]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(reader.edition === button.getAttribute('data-try-edition') + '-en'))
    })
  }

  // ---- Out of AI: the sign-up card, never an error ----
  function showLimit(kind) {
    var audio = kind === 'audio'
    $('[data-try-limit-title]').textContent = audio ? COPY.audioTitle : COPY.chatTitle
    $('[data-try-limit-body]').textContent = audio ? COPY.audioBody : COPY.chatBody
    // Listening can be put aside; the conversation card stays until the visitor chooses.
    $('[data-try-limit-close]').hidden = !audio
    limit.hidden = false
    hideHint()
    var create = $('[data-try-create]')
    if (create) create.focus({ preventScroll: true })
  }
  function closeLimit() { limit.hidden = true; schedule() }
  $('[data-try-limit-close]').addEventListener('click', closeLimit)
  limit.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !$('[data-try-limit-close]').hidden) closeLimit() })

  // ---- Account links: this conversation comes along, and the reader opens where it was ----
  function carryOver() {
    try {
      var demo = frame.contentWindow && frame.contentWindow.__TINCT_TRY_DEMO__
      return !!(demo && demo.carryOver())
    } catch (e) { return false }
  }
  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href^="/sign-in"]') : null
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
    if (!carryOver()) return
    var url = new URL(link.getAttribute('href'), location.origin)
    url.searchParams.set('returnTo', '/reader?' + new URLSearchParams({ book: READER.book, chapter: String(READER.chapter), edition: reader.edition }).toString())
    event.preventDefault()
    location.assign(url.pathname + url.search)
  })

  // ---- What the reader says: what the visitor did ----
  window.addEventListener('message', function (event) {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return
    var data = event.data
    if (!data || data.source !== 'tinct-try-reader') return
    if (data.type === 'state') {
      var wasReady = reader.ready
      reader.ready = !!data.ready
      reader.phone = !!data.phone
      if (data.edition && data.edition !== reader.edition) {
        reader.edition = data.edition
        paintEdition()
      }
      if (reader.ready && reader.edition === 'modern-en') did('modern')
      if (data.card === 'explain') did('explain')
      if (data.playing) did('listen')
      if (data.chapterCard === 'summary') did('summary')
      if (reader.ready && !wasReady && queued.length) { var waiting = queued; queued = []; waiting.forEach(send) }
      schedule()
      return
    }
    if (data.type === 'ai') {
      // A follow-up was sent (or a question of their own, or Talk).
      if (data.intent === 'ask' || data.intent === 'lab-voice-session') did('ask')
      return
    }
    if (data.type === 'limit') { showLimit('chat'); return }
    if (data.type === 'account') { showLimit(data.action === 'audio' ? 'audio' : 'chat') }
  })

  // ---- Section links show where you are ----
  var links = $$('.try-sections a')
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return
        links.forEach(function (link) { link.setAttribute('aria-current', String(link.getAttribute('href') === '#' + entry.target.id)) })
      })
    }, { rootMargin: '-45% 0px -50% 0px' })
    ;['try', 'features', 'pricing', 'questions'].forEach(function (id) { var el = document.getElementById(id); if (el) observer.observe(el) })
  }

  window.matchMedia(WIDE).addEventListener('change', function (event) {
    // The reader is laid out for the frame it opened in; a phone and a desktop frame are different readers.
    wide = event.matches
    loadReader()
  })

  var explainLine = $('[data-try-item="explain"] .try-check-line')
  if (explainLine && TOUCH) explainLine.textContent = 'Press and hold a sentence'
  render()
  loadReader()
})()
