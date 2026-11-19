/*
 * The Try page (public/try.html; docs/try-page/BRIEF.md): the reader plays itself (Anders, 19 Nov 2026).
 * Frames of the real reader, captured by scripts/capture-try-frames.cjs (Meditations Book 2: Explain, Listen,
 * Modern, Summary), crossfade on a loop beside the step they show (Next moves on, the dots jump). Nothing here asks the visitor to do
 * anything and nothing calls the server: a click on the frames, or on Start reading, opens the reader itself.
 * Hover or focus pauses the loop; a step (or a dot on the phone) jumps to its moment; reduced motion shows each
 * step's last frame and waits for the visitor.
 */
(function () {
  'use strict'
  // The step beside the reader: the copy approved for the step page (18 Nov), in the order the frames play. Modern is
  // the second move (Anders, 19 Nov), and Listen then plays the modern English.
  var STEPS = [
    { title: 'Explain anything', line: 'Select a passage. The explanation lands beside it, in the margin, and stays there as a note.' },
    { title: "Read it in today's words", line: 'Switch to modern English. Switch back any time; you stay on the line.' },
    { title: 'Hear it as you read', line: 'Press play. Every word is marked as it is read.' },
    { title: 'Get the gist in a minute', line: 'Tap Summary beside the chapter. It opens as a card, four beats long.' },
  ]
  // [file, step, milliseconds on screen]. Listen is fourteen frames 280 ms apart, as captured, so the marked word moves
  // word by word (Anders, 19 Nov: it lagged); they cut, not fade, into each other.
  var FRAMES = [
    ['01', 0, 1300], ['02', 0, 1500], ['04', 0, 3200],
    ['08', 1, 3200],
    ['11', 2, 280], ['12', 2, 280], ['13', 2, 280], ['14', 2, 280], ['15', 2, 280], ['16', 2, 280], ['17', 2, 280],
    ['18', 2, 280], ['19', 2, 280], ['20', 2, 280], ['21', 2, 280], ['22', 2, 280], ['23', 2, 280], ['24', 2, 900],
    ['10', 3, 3600],
  ]
  // Bump when the frames are re-captured, so browsers fetch the new ones.
  var FRAMES_V = '20261119c'
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  var $ = function (selector, root) { return (root || document).querySelector(selector) }
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)) }
  var demo = $('[data-try-demo]')
  var text = function (selector, value) { var el = $(selector); if (el) el.textContent = value }
  if (!demo) return

  // The first frame is in the page; the rest load after it, one picture each (phone and desktop crops).
  var first = $('picture', demo)
  var pictures = [first]
  FRAMES.slice(1).forEach(function (frame) {
    var picture = document.createElement('picture')
    picture.innerHTML = '<source media="(max-width: 899px)" srcset="/lab/try/frames/phone-' + frame[0] + '.webp?v=' + FRAMES_V + '">' +
      '<img src="/lab/try/frames/desktop-' + frame[0] + '.webp?v=' + FRAMES_V + '" alt="" width="2112" height="1222" loading="lazy" decoding="async">'
    demo.insertBefore(picture, $('.try-demo-open', demo))
    pictures.push(picture)
  })
  // Lazy images in a stack under the first never scroll into view on their own: ask for them once the page is up.
  window.addEventListener('load', function () { pictures.forEach(function (p) { var img = $('img', p); img.loading = 'eager'; if (img.decode) img.decode().catch(function () {}) }) })

  // ---- The visitor's pointer (Anders, 19 Nov: show the click before each change). Where it goes was recorded when the
  // frames were captured (scripts/capture-try-frames.cjs writes frames/*-pointer.json), as fractions of the frame. ----
  var POINTER = {"desktop": {"selectFrom": [0.1141, 0.3289], "selectTo": [0.5293, 0.367], "explain": [0.5867, 0.4419], "modern": [0.644, 0.0458], "play": [0.91, 0.0458], "summary": [0.7713, 0.2875]}, "phone": {"selectFrom": [0.1059, 0.2422], "selectTo": [0.2497, 0.4082], "explain": [0.2709, 0.5053], "play": [0.7842, 0.0528], "summary": [0.5729, 0.157]}}
  // What happens on a frame before the next one: a drag that selects, or a press on a button.
  var ACTIONS = { '01': { drag: ['selectFrom', 'selectTo'] }, '02': { press: 'explain' }, '04': { press: 'modern' }, '08': { press: 'play' }, '24': { press: 'summary' } }
  var phoneQuery = window.matchMedia('(max-width: 899px)')
  var layer = document.createElement('div')
  layer.className = 'try-pointer-layer'
  layer.setAttribute('aria-hidden', 'true')
  layer.innerHTML = '<span class="try-pointer"></span><span class="try-scene"></span>'
  demo.appendChild(layer)
  var pointer = $('.try-pointer', layer)
  var scene = $('.try-scene', layer)
  var actionTimers = []
  function later(fn, ms) { actionTimers.push(setTimeout(fn, ms)) }
  function clearActions() { actionTimers.forEach(clearTimeout); actionTimers = []; pointer.className = 'try-pointer' }
  function place(at, glide) {
    pointer.style.transition = glide ? 'left ' + glide + 'ms cubic-bezier(.4, 0, .2, 1), top ' + glide + 'ms cubic-bezier(.4, 0, .2, 1), opacity .25s' : 'opacity .25s'
    pointer.style.left = (at[0] * 100) + '%'
    pointer.style.top = (at[1] * 100) + '%'
  }
  // Plays the frame's action so it ends just as the frame changes; returns how long the frame must stay up for it.
  function act(frame, duration) {
    var action = ACTIONS[frame[0]]
    var marks = POINTER[phoneQuery.matches ? 'phone' : 'desktop']
    if (!action || reduce) return duration
    if (action.drag) {
      var from = marks[action.drag[0]], to = marks[action.drag[1]]
      if (!from || !to) return duration
      var total = Math.max(duration, 2600)
      later(function () { place(from, 0); pointer.className = 'try-pointer is-on' }, 500)
      later(function () { pointer.className = 'try-pointer is-on is-down' }, 900)
      later(function () { place(to, 1100) }, 1000)
      later(function () { pointer.className = 'try-pointer is-on' }, total - 250)
      return total
    }
    var at = marks[action.press]
    if (!at) return duration
    var whole = Math.max(duration, 1700)
    later(function () { if (pointer.className.indexOf('is-on') < 0) { place([at[0] + .08, at[1] + .18], 0) } pointer.className = 'try-pointer is-on' }, whole - 1500)
    later(function () { place(at, 650) }, whole - 1450)
    later(function () { pointer.className = 'try-pointer is-on is-down is-press' }, whole - 600)
    later(function () { pointer.className = 'try-pointer is-on is-press' }, whole - 420)
    later(function () { pointer.className = 'try-pointer' }, whole + 350)
    return whole
  }
  // A new moment opens with its name over the reader for a beat, so a change of scene reads as one.
  function announce(step) {
    if (reduce) return
    scene.textContent = STEPS[step].title
    scene.className = 'try-scene'
    void scene.offsetWidth
    scene.className = 'try-scene is-on'
    later(function () { scene.className = 'try-scene' }, phoneQuery.matches ? 1500 : 1200)
  }

  var index = 0
  var timer = null
  var held = false
  var visible = true

  // The frame that switches to modern English arrives as a wave running down the page (the launch film's switch).
  var WAVE = FRAMES.map(function (frame, i) { return i > 0 && frame[1] === 1 && FRAMES[i - 1][1] !== 1 })
  var shown = -1
  function paint() {
    var wave = !reduce && shown >= 0 && shown !== index && WAVE[index]
    var under = wave ? shown : -1
    demo.classList.toggle('is-cut', shown >= 0 && FRAMES[shown][1] === 2 && FRAMES[index][1] === 2)
    pictures.forEach(function (picture, i) {
      picture.classList.remove('is-wave', 'is-under')
      picture.classList.toggle('is-on', i === index)
    })
    if (wave) {
      pictures[under].classList.add('is-under')
      void pictures[index].offsetWidth
      pictures[index].classList.add('is-wave')
      setTimeout(function () { pictures[under].classList.remove('is-under') }, 1600)
    }
    var newStep = shown < 0 || FRAMES[shown][1] !== FRAMES[index][1]
    shown = index
    var step = FRAMES[index][1]
    $$('[data-try-step]').forEach(function (button) {
      if (Number(button.getAttribute('data-try-step')) === step) button.setAttribute('aria-current', 'step')
      else button.removeAttribute('aria-current')
    })
    text('[data-try-count]', (step + 1) + ' of ' + STEPS.length)
    text('[data-try-num]', (step + 1) + '. ')
    text('[data-try-title]', STEPS[step].title)
    text('[data-try-upnext]', 'Next: ' + STEPS[(step + 1) % STEPS.length].title)
    if (next) next.setAttribute('aria-label', 'Next: ' + STEPS[(step + 1) % STEPS.length].title)
    return newStep
  }
  // Slower than captured (Anders, 19 Nov: too much, too fast), the phone most: a small screen takes longer to read.
  // The word-by-word Listen frames slow only a little, so the voice still sounds like reading.
  function pace(ms) { return Math.round(ms * (phoneQuery.matches ? (ms > 400 ? 1.45 : 1.15) : (ms > 400 ? 1.3 : 1.1))) }
  function schedule(opened) {
    clearTimeout(timer)
    clearActions()
    if (reduce || held || !visible) return
    var frame = FRAMES[index]
    var duration = pace(frame[2]) + (opened ? (phoneQuery.matches ? 1100 : 600) : 0)
    if (opened) announce(frame[1])
    duration = act(frame, duration)
    timer = setTimeout(function () {
      // Switch only once the next frame is decoded, so a change never flashes an empty reader.
      var nextIndex = (index + 1) % FRAMES.length
      var img = $('img', pictures[nextIndex])
      var go = function () { if (held || !visible) return; index = nextIndex; var fresh = paint(); schedule(fresh) }
      if (img && img.decode) img.decode().then(go, go)
      else go()
    }, duration)
  }
  function show(step) {
    // A step opens on its first frame and plays on; with reduced motion, its last.
    var matches = FRAMES.map(function (frame, i) { return frame[1] === step ? i : -1 }).filter(function (i) { return i >= 0 })
    index = reduce ? matches[matches.length - 1] : matches[0]
    paint()
    schedule(true)
  }

  $$('[data-try-step]').forEach(function (button) {
    button.addEventListener('click', function () { show(Number(button.getAttribute('data-try-step'))) })
  })
  var next = $('[data-try-next]')
  if (next) next.addEventListener('click', function () { show((FRAMES[index][1] + 1) % STEPS.length) })
  var prev = $('[data-try-prev]')
  if (prev) prev.addEventListener('click', function () { show((FRAMES[index][1] + STEPS.length - 1) % STEPS.length) })
  demo.addEventListener('mouseenter', function () { held = true; clearTimeout(timer); clearActions() })
  demo.addEventListener('mouseleave', function () { held = false; schedule() })
  demo.addEventListener('focus', function () { held = true; clearTimeout(timer); clearActions() })
  demo.addEventListener('blur', function () { held = false; schedule() })
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting
      schedule()
    }).observe(demo)
  }
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; schedule() })
  if (reduce) index = FRAMES.map(function (frame) { return frame[1] }).lastIndexOf(0)
  paint()
  schedule()

  // ---- The top bar turns solid once the page scrolls (over the hero it shows the scene) ----
  var nav = $('.try-nav')
  function navState() { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8) }
  window.addEventListener('scroll', navState, { passive: true })
  navState()

  // ---- Section links show where you are ----
  var links = $$('.try-sections a')
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return
        links.forEach(function (link) { link.setAttribute('aria-current', String(link.getAttribute('href') === '#' + entry.target.id)) })
      })
    }, { rootMargin: '-45% 0px -50% 0px' })
    ;['try', 'pricing', 'questions'].forEach(function (id) { var el = document.getElementById(id); if (el) observer.observe(el) })
  }
})()
