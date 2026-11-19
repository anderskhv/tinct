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
  // A fourth field keeps a frame to one device. The motion follows the launch film (Anders, 19 Nov: "the video
  // nailed this"): on the phone a press selects the sentence and its menu at once; the Explain answer types itself in
  // (46-50); the card goes down (51) before the page dissolves into modern English, paragraph band by band.
  // Desktop keeps its drag, a word a frame (29-45).
  var PHONE = window.matchMedia('(max-width: 899px)').matches
  var FRAMES = [
    ['01', 0, 1300],
    ['29', 0, 75, 'desktop'], ['30', 0, 75, 'desktop'], ['31', 0, 75, 'desktop'], ['32', 0, 75, 'desktop'], ['33', 0, 75, 'desktop'], ['34', 0, 75, 'desktop'], ['35', 0, 75, 'desktop'], ['36', 0, 75, 'desktop'], ['37', 0, 75, 'desktop'], ['38', 0, 75, 'desktop'], ['39', 0, 75, 'desktop'], ['40', 0, 75, 'desktop'], ['41', 0, 75, 'desktop'], ['42', 0, 75, 'desktop'], ['43', 0, 75, 'desktop'], ['44', 0, 75, 'desktop'], ['45', 0, 75, 'desktop'],
    ['02', 0, 1400],
    ['46', 0, 260], ['47', 0, 260], ['48', 0, 260], ['49', 0, 260], ['50', 0, 260], ['04', 0, 3000],
    ['51', 1, 900], ['08', 1, 3400],
    ['11', 2, 280], ['12', 2, 280], ['13', 2, 280], ['14', 2, 280], ['15', 2, 280], ['16', 2, 280], ['17', 2, 280],
    ['18', 2, 280], ['19', 2, 280], ['20', 2, 280], ['21', 2, 280], ['22', 2, 280], ['23', 2, 280], ['24', 2, 900],
    ['10', 3, 4200],
  ].filter(function (frame) { return !frame[3] || (frame[3] === 'phone') === PHONE })
  // Bump when the frames are re-captured, so browsers fetch the new ones.
  var FRAMES_V = '20261119l'
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  var $ = function (selector, root) { return (root || document).querySelector(selector) }
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)) }
  var demo = $('[data-try-demo]')
  var text = function (selector, value) { var el = $(selector); if (el) el.textContent = value }
  if (!demo) return

  // The first frame is in the page; the rest load after it, one picture each (phone and desktop crops).
  var first = $('picture', demo)
  var pictures = [first]
  // Drag frames hold only the strip the selection grows in, laid over the first frame (kept small to load).
  var isCrop = function (file) { var n = Number(file); return n >= 29 && n <= 45 }
  FRAMES.slice(1).forEach(function (frame) {
    var picture = document.createElement('picture')
    if (isCrop(frame[0])) picture.className = 'is-crop'
    picture.innerHTML = '<source media="(max-width: 899px)" srcset="/lab/try/frames/phone-' + frame[0] + '.webp?v=' + FRAMES_V + '">' +
      '<img src="/lab/try/frames/desktop-' + frame[0] + '.webp?v=' + FRAMES_V + '" alt="" width="2112" height="1222" loading="lazy" decoding="async">'
    demo.insertBefore(picture, $('.try-demo-open', demo))
    pictures.push(picture)
  })
  // Lazy images in a stack under the first never scroll into view on their own: ask for them once the page is up.
  window.addEventListener('load', function () { pictures.forEach(function (p) { var img = $('img', p); img.loading = 'eager'; if (img.decode) img.decode().catch(function () {}) }) })

  // ---- The visitor's pointer (Anders, 19 Nov: show the click before each change). Where it goes was recorded when the
  // frames were captured (scripts/capture-try-frames.cjs writes frames/*-pointer.json), as fractions of the frame. ----
  var POINTER = {"desktop": {"selectFrom": [0.1141, 0.3289], "selectTo": [0.5293, 0.367], "drag29": [0.1794, 0.3289], "drag30": [0.2472, 0.3289], "drag31": [0.2695, 0.3289], "drag32": [0.32, 0.3289], "drag33": [0.3396, 0.3289], "drag34": [0.3976, 0.3289], "drag35": [0.4086, 0.3289], "drag36": [0.4481, 0.3289], "drag37": [0.4885, 0.3289], "drag38": [0.5266, 0.3289], "drag39": [0.555, 0.3289], "drag40": [0.5988, 0.3479], "drag41": [0.1618, 0.367], "drag42": [0.2481, 0.367], "drag43": [0.3204, 0.367], "drag44": [0.3932, 0.367], "drag45": [0.4589, 0.367], "explain": [0.5867, 0.4419], "modern": [0.644, 0.0458], "play": [0.91, 0.0458], "summary": [0.7713, 0.2875]}, "phone": {"selectFrom": [0.131, 0.1657], "selectTo": [0.6907, 0.2793], "explain": [0.3141, 0.3458], "modern": [0.88, 0.0361], "play": [0.7621, 0.0361], "summary": [0.6317, 0.1074]}}
  // What happens on a frame before the next one: a drag that selects, or a press on a button.
  var ACTIONS = {
    '01': { drag: ['selectFrom', 'drag29'] },
    '29': { move: 'drag30' }, '30': { move: 'drag31' }, '31': { move: 'drag32' }, '32': { move: 'drag33' }, '33': { move: 'drag34' }, '34': { move: 'drag35' }, '35': { move: 'drag36' }, '36': { move: 'drag37' }, '37': { move: 'drag38' }, '38': { move: 'drag39' }, '39': { move: 'drag40' }, '40': { move: 'drag41' }, '41': { move: 'drag42' }, '42': { move: 'drag43' }, '43': { move: 'drag44' }, '44': { move: 'drag45' },
    '45': { move: 'selectTo', lift: true },
    '02': { press: 'explain' }, '51': { press: 'modern' }, '08': { press: 'play' }, '24': { press: 'summary' } }
  // The phone selects with a press and hold (the launch film's way), not a drag.
  if (PHONE) ACTIONS['01'] = { hold: 'selectFrom' }
  var phoneQuery = window.matchMedia('(max-width: 899px)')
  var layer = document.createElement('div')
  layer.className = 'try-pointer-layer'
  layer.setAttribute('aria-hidden', 'true')
  layer.innerHTML = '<span class="try-pointer"></span><span class="try-scene"></span>'
  demo.appendChild(layer)
  var pointer = $('.try-pointer', layer)
  // ---- Phone: the launch film's way (Anders, 19 Nov). One caption per moment, the reader in a phone, and the camera
  // moving in on what matters (the card, the marked word). ----
  var CAPTIONS = [
    ['Stuck on a line?', 'Explain it.'],
    ['Language too hard?', 'Switch to modern English.'],
    ['On the go?', 'Listen.'],
    ['Short on time?', 'Get the gist.'],
  ]
  var caption = document.createElement('p')
  caption.className = 'try-caption'
  caption.setAttribute('aria-hidden', 'true')
  demo.parentNode.insertBefore(caption, demo)
  var captionStep = -1
  function frameCaption(step) {
    if (step === captionStep) return
    captionStep = step
    caption.classList.remove('is-on')
    later(function () {
      caption.innerHTML = '<span>' + CAPTIONS[step][0] + ' <em>' + CAPTIONS[step][1] + '</em></span>'
      caption.classList.add('is-on')
    }, caption.innerHTML ? 260 : 0)
  }
  var scene = $('.try-scene', layer)
  var actionTimers = []
  function later(fn, ms) { actionTimers.push(setTimeout(fn, ms)) }
  // keep: the next frame carries the same drag on, so the finger stays down where it is.
  function clearActions(keep) { actionTimers.forEach(clearTimeout); actionTimers = []; if (!keep) pointer.className = 'try-pointer' }
  function place(at, glide, ease) {
    ease = ease || 'cubic-bezier(.4, 0, .2, 1)'
    pointer.style.transition = glide ? 'left ' + glide + 'ms ' + ease + ', top ' + glide + 'ms ' + ease + ', opacity .25s' : 'opacity .25s'
    pointer.style.left = (at[0] * 100) + '%'
    pointer.style.top = (at[1] * 100) + '%'
  }
  // Plays the frame's action so it ends just as the frame changes; returns how long the frame must stay up for it.
  function act(frame, duration) {
    var action = ACTIONS[frame[0]]
    var marks = POINTER[phoneQuery.matches ? 'phone' : 'desktop']
    if (!action || reduce) return duration
    if (action.hold) {
      // The finger lands on the first word and holds; the next frame shows the sentence selected beneath it.
      var spot = marks[action.hold]
      if (!spot) return duration
      var stay = Math.max(duration, 1500)
      later(function () { place(spot, 0); pointer.className = 'try-pointer is-on' }, stay - 1100)
      later(function () { pointer.className = 'try-pointer is-on is-down' }, stay - 750)
      return stay
    }
    if (action.drag) {
      // The finger lands on the first word, presses, and starts the drag; the frames after it carry it on.
      var from = marks[action.drag[0]], to = marks[action.drag[1]]
      if (!from || !to) return duration
      var total = Math.max(duration, 1800)
      later(function () { place(from, 0); pointer.className = 'try-pointer is-on' }, 400)
      later(function () { pointer.className = 'try-pointer is-on is-down' }, 800)
      later(function () { place(to, total - 900, 'ease-in') }, 900)
      return total
    }
    if (action.move) {
      // Mid-drag: glide on to the word this frame's selection reaches next, arriving as the next frame shows.
      var target = marks[action.move]
      if (!target) return duration
      pointer.className = 'try-pointer is-on is-down'
      // Linear, so the finger's word-to-word glides join into one even movement.
      place(target, duration, 'linear')
      if (action.lift) later(function () { pointer.className = 'try-pointer is-on' }, duration + 150)
      return duration
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
  var WAVE = FRAMES.map(function (frame) { return frame[0] === '08' })
  // The frames that open a card: the card rises from the foot of the screen over the page, as it does in the reader
  // (Anders, 19 Nov: Explain looked jumpy). Every other change fades the new frame in over the old one, never through
  // an empty screen.
  var RISE = FRAMES.map(function (frame) { return frame[0] === '46' || frame[0] === '10' })
  // The card going down again before the switch (phone: the sheet sinks out of the screen).
  var SINK = FRAMES.map(function (frame) { return PHONE && frame[0] === '51' })
  var shown = -1
  var underTimer = null
  // The switch to modern English, as in the launch film: the page changes paragraph band by band, top to bottom, each
  // band a soft cross-fade of old into new, never a hard edge sweeping down.
  var BANDS = 9, BAND_FROM = 0.08, BAND_FADE = 460, BAND_STEP = 105
  var dissolveLayer = null
  function dissolve(incoming, outgoing) {
    if (dissolveLayer) dissolveLayer.remove()
    var src = $('img', incoming).currentSrc || $('img', incoming).src
    incoming.classList.add('is-held')
    dissolveLayer = document.createElement('div')
    dissolveLayer.className = 'try-dissolve'
    dissolveLayer.setAttribute('aria-hidden', 'true')
    for (var i = 0; i < BANDS; i++) {
      var top = i === 0 ? 0 : BAND_FROM + (1 - BAND_FROM) * i / BANDS
      var bottom = BAND_FROM + (1 - BAND_FROM) * (i + 1) / BANDS
      var band = document.createElement('img')
      band.src = src; band.alt = ''
      band.style.clipPath = 'inset(' + (top * 100) + '% 0 ' + ((1 - bottom) * 100) + '% 0)'
      band.style.animationDelay = (i * BAND_STEP) + 'ms'
      band.style.animationDuration = BAND_FADE + 'ms'
      dissolveLayer.appendChild(band)
    }
    demo.insertBefore(dissolveLayer, layer)
    var layerNow = dissolveLayer
    setTimeout(function () {
      incoming.classList.remove('is-held')
      if (layerNow === dissolveLayer) { dissolveLayer.remove(); dissolveLayer = null }
    }, BANDS * BAND_STEP + BAND_FADE + 60)
  }
  function paint() {
    var wave = !reduce && shown >= 0 && shown !== index && WAVE[index]
    var rise = !reduce && shown >= 0 && shown !== index && RISE[index]
    var sink = !reduce && shown >= 0 && shown !== index && SINK[index]
    var under = shown >= 0 && shown !== index ? shown : -1
    // Cut, not fade: word by word in Listen, and the selection growing under the finger.
    // …and the answer typing itself in, which only adds words.
    var drag = function (i) { var n = Number(FRAMES[i][0]); return (n >= 29 && n <= 50) || (n === 4 && Number(FRAMES[shown][0]) >= 46) }
    demo.classList.toggle('is-cut', shown >= 0 && ((FRAMES[shown][1] === 2 && FRAMES[index][1] === 2) || drag(shown) || drag(index)))
    clearTimeout(underTimer)
    pictures.forEach(function (picture, i) {
      picture.classList.remove('is-wave', 'is-rise', 'is-under', 'is-sink', 'is-held')
      picture.classList.toggle('is-on', i === index)
      picture.classList.toggle('is-base', i === 0 && isCrop(FRAMES[index][0]))
    })
    if (under >= 0) {
      pictures[under].classList.add('is-under')
      void pictures[index].offsetWidth
      if (wave) dissolve(pictures[index], pictures[under])
      else if (rise) pictures[index].classList.add('is-rise')
      else if (sink) pictures[under].classList.add('is-sink')
      underTimer = setTimeout(function () { pictures[under].classList.remove('is-under', 'is-sink') }, wave ? 1700 : 800)
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
    var prevAction = ACTIONS[FRAMES[(index + FRAMES.length - 1) % FRAMES.length][0]]
    clearActions(!!((ACTIONS[FRAMES[index][0]] || {}).move || (prevAction && (prevAction.move || prevAction.hold))))
    if (reduce || held || !visible) return
    var frame = FRAMES[index]
    var duration = pace(frame[2]) + (opened ? (phoneQuery.matches ? 1100 : 600) : 0)
    if (opened && !phoneQuery.matches) announce(frame[1])
    if (phoneQuery.matches) frameCaption(frame[1])
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
