/*
 * The Try page (public/try.html; docs/try-page/BRIEF.md). Five steps beside the real reader, which runs in a frame
 * in demo mode (public/lab/try/reader-demo.js, src/lab/tryDemo/tryDemo.ts). Each step's Next asks the reader to do
 * the step; anything the visitor does in the reader by hand moves the panel too. When the AI runs out (the
 * visitor's free questions, or the page's own day), the sign-up card shows instead of an error, and creating an
 * account carries this conversation over.
 */
(function () {
  'use strict'
  var STEPS = [
    { title: 'Explain anything', line: 'Select a passage. The explanation lands beside it, in the margin, and stays there as a note.', command: { cmd: 'explain' } },
    { title: 'Keep asking', line: 'Follow up in the same note — type, or talk it through out loud.', command: { cmd: 'followup', text: 'Is he saying I should just put up with rude people?' } },
    { title: "Read it in today's words", line: 'Switch to modern English. Switch back any time; you stay on the line.', command: { cmd: 'edition', kind: 'modern' } },
    { title: 'Hear it as you read', line: 'Press play. Every word is marked as it is read.', command: { cmd: 'listen' } },
    { title: 'Get the gist in a minute', line: 'Tap Summary beside the chapter in the margin. It opens as a card there too.', command: { cmd: 'summary' } },
  ]
  var READER = { book: 'meditations', chapter: 2 }
  var WIDE = '(min-width: 900px)'
  var COPY = {
    chatTitle: 'Keep the conversation going',
    chatBody: "That's the free questions for today. Create an account and carry on right here — this conversation comes with you, and your first month of Premium is free.",
    // The reader's own listening prompt (src/lab/labCopy.ts accountTitleAudio / accountBodyAudio).
    audioTitle: 'Create a free account to keep listening',
    audioBody: 'Listen on, and use all of Tinct’s AI features. Your first month of AI is free. You can also keep reading without an account.',
  }

  var $ = function (selector, root) { return (root || document).querySelector(selector) }
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)) }
  var frame = $('[data-try-frame]')
  var limit = $('[data-try-limit]')
  var current = 0
  var done = STEPS.map(function () { return false })
  var reader = { ready: false, edition: 'original-en', phone: false }
  var queued = []
  // Listen waits for the original edition: its narration is recorded, so a guest hears it from the cache (D7/M7).
  var listenAfterOriginal = false
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

  // ---- The step panel ----
  function render() {
    var step = STEPS[current]
    var last = current === STEPS.length - 1
    $$('[data-try-dots]').forEach(function (dots) {
      dots.innerHTML = ''
      STEPS.forEach(function (_, index) {
        var dot = document.createElement('i')
        if (index === current) dot.className = 'is-current'
        else if (done[index]) dot.className = 'is-done'
        dots.appendChild(dot)
      })
    })
    $('[data-try-count]').textContent = (current + 1) + ' of ' + STEPS.length
    $('[data-try-title]').textContent = step.title
    $('[data-try-line]').textContent = step.line
    $('[data-try-card-title]').textContent = (current + 1) + '. ' + step.title
    $('[data-try-card-line]').textContent = step.line
    $('[data-try-back]').hidden = current === 0
    var finished = last && done[current]
    var next = $('.try-step-actions [data-try-next]')
    next.innerHTML = (finished ? 'Done' : 'Next') + ' <span aria-hidden="true">→</span>'
    $('[data-try-hint]').textContent = last ? '' : 'Next: ' + STEPS[current + 1].title
    var hintBreak = $('.try-step-hint br')
    if (hintBreak) hintBreak.hidden = last
  }

  function perform(index) {
    current = index
    done[index] = true
    var command = STEPS[index].command
    if (command.cmd === 'edition') command = { cmd: 'edition', kind: reader.edition === 'modern-en' ? 'original' : 'modern' }
    if (command.cmd === 'listen' && reader.edition !== 'original-en') {
      listenAfterOriginal = true
      send({ cmd: 'edition', kind: 'original' })
      render()
      return
    }
    send(command)
    render()
  }

  function onNext() {
    var target = done[current] ? current + 1 : current
    if (target >= STEPS.length) {
      var below = document.getElementById('features')
      if (below) below.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    perform(target)
  }

  /** The visitor did a step by hand: it is done, and the panel shows it. */
  function did(index) {
    if (done[index]) return
    done[index] = true
    current = index
    render()
  }

  $$('[data-try-next]').forEach(function (button) { button.addEventListener('click', onNext) })
  $('[data-try-back]').addEventListener('click', function () { if (current > 0) { current -= 1; render() } })

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
    var first = $('[data-try-create]')
    if (first) first.focus({ preventScroll: true })
  }
  $('[data-try-limit-close]').addEventListener('click', function () { limit.hidden = true })
  limit.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !$('[data-try-limit-close]').hidden) limit.hidden = true })

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

  // ---- What the reader says ----
  window.addEventListener('message', function (event) {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return
    var data = event.data
    if (!data || data.source !== 'tinct-try-reader') return
    if (data.type === 'state') {
      var wasReady = reader.ready
      reader.ready = !!data.ready
      reader.phone = !!data.phone
      if (data.edition && data.edition !== reader.edition) {
        if (data.edition === 'modern-en' && reader.ready && wasReady) did(2)
        reader.edition = data.edition
        paintEdition()
      }
      if (listenAfterOriginal && reader.ready && reader.edition === 'original-en') { listenAfterOriginal = false; setTimeout(function () { send({ cmd: 'listen' }) }, 600) }
      if (data.selection || data.card === 'explain') did(0)
      if (data.playing) did(3)
      if (data.chapterCard === 'summary') did(4)
      if (reader.ready && !wasReady && queued.length) { var waiting = queued; queued = []; waiting.forEach(send) }
      return
    }
    if (data.type === 'ai') {
      if (data.intent === 'ask' && done[0]) did(1)
      if (data.intent === 'lab-voice-session') did(1)
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

  render()
  loadReader()
})()
