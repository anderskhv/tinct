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
  // nailed this"): on the phone a press selects the sentence and its menu at once; the Explain card rises with its
  // answer already in it (Anders, 19 Nov: no typing lag); the card goes down (51) before the page dissolves into
  // modern English, band by band.
  // Desktop selects the passage in one press too (Anders, 20 Nov: the word-by-word drag grew, shrank and grew again).
  var PHONE = window.matchMedia('(max-width: 899px)').matches
  var FRAMES = [
    ['01', 0, 1300],
    ['02', 0, 1400],
    ['04', 0, 2400],
    ['51', 1, 900], ['08', 1, 4600],
    ['11', 2, 900], ['12', 2, 280], ['13', 2, 280], ['14', 2, 280], ['15', 2, 280], ['16', 2, 280], ['17', 2, 280],
    ['18', 2, 280], ['19', 2, 280], ['20', 2, 280], ['21', 2, 280], ['22', 2, 280], ['23', 2, 280], ['24', 2, 1500],
    ['10', 3, 4200],
  ].filter(function (frame) { return !frame[3] || (frame[3] === 'phone') === PHONE })
  // Bump when the frames are re-captured, so browsers fetch the new ones.
  var FRAMES_V = '20261119o'
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
    picture.innerHTML = '<source media="(max-width: 899px)" srcset="/lab/try/frames/phone-' + frame[0] + '.webp?v=' + FRAMES_V + '" width="780" height="1520">' +
      '<img src="/lab/try/frames/desktop-' + frame[0] + '.webp?v=' + FRAMES_V + '" alt="" width="2112" height="1222" loading="lazy" decoding="async">'
    demo.insertBefore(picture, $('.try-demo-open', demo))
    pictures.push(picture)
  })
  // Lazy images in a stack under the first never scroll into view on their own: ask for them once the page is up.
  window.addEventListener('load', function () { pictures.forEach(function (p) { var img = $('img', p); img.loading = 'eager'; if (img.decode) img.decode().catch(function () {}) }) })

  // ---- The visitor's pointer (Anders, 19 Nov: show the click before each change). Where it goes was recorded when the
  // frames were captured (scripts/capture-try-frames.cjs writes frames/*-pointer.json), as fractions of the frame. ----
  var POINTER = {"desktop": {"selectFrom": [0.1141, 0.3289], "selectTo": [0.5293, 0.367], "explain": [0.5867, 0.4419], "modern": [0.644, 0.0458], "play": [0.91, 0.0458], "summary": [0.7713, 0.2875]}, "phone": {"selectFrom": [0.131, 0.1657], "selectTo": [0.6907, 0.2793], "explain": [0.3141, 0.3458], "modern": [0.88, 0.0361], "play": [0.7621, 0.0361], "summary": [0.6317, 0.1074]}}
  // What happens on a frame before the next one: a press and hold that selects the passage, or a press on a button.
  var ACTIONS = {
    '01': { hold: 'selectFrom' },
    '02': { press: 'explain' }, '51': { press: 'modern' }, '08': { press: 'play' }, '24': { press: 'summary' } }
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
  function clearActions(keep) { actionTimers.forEach(clearTimeout); actionTimers = []; if (!keep) pointer.className = 'try-pointer' }
  function place(at, glide, ease) {
    ease = ease || 'cubic-bezier(.4, 0, .2, 1)'
    pointer.style.transition = glide ? 'left ' + glide + 'ms ' + ease + ', top ' + glide + 'ms ' + ease + ', opacity .25s' : 'opacity .25s'
    pointer.style.left = (at[0] * 100) + '%'
    pointer.style.top = (at[1] * 100) + '%'
  }
  // Plays the frame's action so it ends just as the frame changes; returns how long the frame must stay up for it.
  function act(frame, duration) {
    // Only the taps show, as a ripple where the finger lands (Anders, 19 Nov): no cursor travelling between them.
    var action = ACTIONS[frame[0]]
    var marks = POINTER[phoneQuery.matches ? 'phone' : 'desktop']
    if (!action || reduce) return duration
    if (action.hold) {
      // A press and hold on the first word: a soft disc where the finger is, then the sentence selected under it.
      var spot = marks[action.hold]
      if (!spot) return duration
      var stay = Math.max(duration, 1500)
      later(function () { place(spot, 0); pointer.className = 'try-pointer is-on is-hold' }, stay - 800)
      later(function () { pointer.className = 'try-pointer' }, stay + 250)
      return stay
    }
    if (!action.press) return duration
    var at = marks[action.press]
    if (!at) return duration
    var whole = Math.max(duration, 1300)
    later(function () { place(at, 0); pointer.className = 'try-pointer is-on is-tap is-press' }, whole - 450)
    later(function () { pointer.className = 'try-pointer' }, whole + 300)
    return whole
  }
  // A new moment opens with its name over the reader for a beat, so a change of scene reads as one.
  function announce(step) {
    if (reduce) return
    // Word for word the moment's line in the list beside the reader (Anders, 25 Nov: "1:1"), the answer in italics as there.
    scene.textContent = CAPTIONS[step][0] + ' '
    var answer = document.createElement('em')
    answer.textContent = CAPTIONS[step][1]
    scene.appendChild(answer)
    scene.className = 'try-scene'
    void scene.offsetWidth
    scene.className = 'try-scene is-on'
    // Its own timer: the frame timers are cleared at every frame, which left the headline up for good.
    clearTimeout(sceneTimer)
    sceneTimer = setTimeout(function () { scene.className = 'try-scene' }, phoneQuery.matches ? 1500 : 2600)
  }
  var sceneTimer = null

  var index = 0
  // How long before the tap that starts a moment its headline comes up.
  var LEAD_MS = 1700
  var ledStep = -1
  var timer = null
  var held = false
  var visible = true

  // The frame that switches to modern English arrives as a wave running down the page (the launch film's switch).
  var WAVE = FRAMES.map(function (frame) { return frame[0] === '08' })
  // The frames that open a card: the card rises from the foot of the screen over the page, as it does in the reader
  // (Anders, 19 Nov: Explain looked jumpy). Every other change fades the new frame in over the old one, never through
  // an empty screen.
  var RISE = FRAMES.map(function (frame) { return frame[0] === '04' || frame[0] === '10' })
  // The card going down again before the switch (phone: the sheet sinks out of the screen).
  var SINK = FRAMES.map(function (frame) { return PHONE && frame[0] === '51' })
  var shown = -1
  var underTimer = null
  // The switch to modern English, as in the launch film: the page changes paragraph band by band, top to bottom, each
  // band a soft cross-fade of old into new, never a hard edge sweeping down.
  // Slower (Anders, 25 Nov: "so you see what is happening"): each band takes most of a second, about three in all.
  var BANDS = 9, BAND_FROM = 0.08, BAND_FADE = 900, BAND_STEP = 260
  var DISSOLVE_MS = (BANDS - 1) * BAND_STEP + BAND_FADE
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
    // At the end the page underneath becomes the new one at once (no second fade), then the bands go: the text
    // changes once.
    setTimeout(function () {
      incoming.classList.add('is-settle')
      incoming.classList.remove('is-held')
      if (outgoing) outgoing.classList.remove('is-under')
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        if (layerNow === dissolveLayer) { dissolveLayer.remove(); dissolveLayer = null }
        incoming.classList.remove('is-settle')
      }) })
    }, DISSOLVE_MS + 60)
  }
  function paint() {
    var wave = !reduce && shown >= 0 && shown !== index && WAVE[index]
    var rise = !reduce && shown >= 0 && shown !== index && RISE[index]
    var sink = !reduce && shown >= 0 && shown !== index && SINK[index]
    var under = shown >= 0 && shown !== index ? shown : -1
    // Cut, not fade: word by word in Listen.
    demo.classList.toggle('is-cut', shown >= 0 && FRAMES[shown][1] === 2 && FRAMES[index][1] === 2)
    clearTimeout(underTimer)
    pictures.forEach(function (picture, i) {
      picture.classList.remove('is-wave', 'is-rise', 'is-under', 'is-sink', 'is-held')
      picture.classList.toggle('is-on', i === index)
    })
    if (under >= 0) {
      pictures[under].classList.add('is-under')
      void pictures[index].offsetWidth
      if (wave) dissolve(pictures[index], pictures[under])
      else if (rise) pictures[index].classList.add('is-rise')
      else if (sink) pictures[under].classList.add('is-sink')
      underTimer = setTimeout(function () { pictures[under].classList.remove('is-under', 'is-sink') }, wave ? DISSOLVE_MS + 300 : 800)
    }
    var newStep = shown < 0 || FRAMES[shown][1] !== FRAMES[index][1]
    shown = index
    markStep(FRAMES[index][1])
    return newStep
  }
  function markStep(step) {
    $$('[data-try-step]').forEach(function (button) {
      if (Number(button.getAttribute('data-try-step')) === step) button.setAttribute('aria-current', 'step')
      else button.removeAttribute('aria-current')
    })
    text('[data-try-count]', (step + 1) + ' of ' + STEPS.length)
    text('[data-try-num]', (step + 1) + '. ')
    text('[data-try-title]', STEPS[step].title)
    text('[data-try-upnext]', 'Next: ' + STEPS[(step + 1) % STEPS.length].title)
    if (next) next.setAttribute('aria-label', 'Next: ' + STEPS[(step + 1) % STEPS.length].title)
  }
  // Slower than captured (Anders, 19 Nov: too much, too fast), the phone most: a small screen takes longer to read.
  // The word-by-word Listen frames slow only a little, so the voice still sounds like reading.
  // Desktop slower again (Anders, 25 Nov: "scroll, but slowly"); the word-by-word Listen frames slow to about
  // speaking pace and the first one holds after Play (Anders, 25 Nov: Listen felt too short).
  function pace(ms) { return Math.round(ms * (phoneQuery.matches ? (ms > 400 ? 1.45 : 1.15) : (ms > 400 ? 2.1 : 1.4))) }
  // ---- Desktop: a small timer on the lit moment (Anders, 25 Nov). Its line fills while the moment plays: each frame
  // moves it from the share of the moment already shown to the share shown when that frame ends, over the frame's
  // real time, so it is full when the next moment starts. ----
  var momentButtons = $$('.try-moments [data-try-step]')
  function stepFrames(step) { return FRAMES.map(function (f, i) { return f[1] === step ? i : -1 }).filter(function (i) { return i >= 0 }) }
  function fill(step, from, to, ms) {
    momentButtons.forEach(function (button) {
      var mine = Number(button.getAttribute('data-try-step')) === step
      button.style.setProperty('--try-fill-ms', '0ms')
      button.style.setProperty('--try-fill', String(mine ? from : 0))
      if (!mine) return
      void button.offsetWidth
      button.style.setProperty('--try-fill-ms', ms + 'ms')
      button.style.setProperty('--try-fill', String(to))
    })
  }
  function frameShare(i) {
    var frames = stepFrames(FRAMES[i][1])
    var total = frames.reduce(function (sum, j) { return sum + pace(FRAMES[j][2]) }, 0)
    var before = frames.filter(function (j) { return j < i }).reduce(function (sum, j) { return sum + pace(FRAMES[j][2]) }, 0)
    return { from: before / total, to: (before + pace(FRAMES[i][2])) / total }
  }
  // Held (pointer over the reader): the line stops where it is.
  function freezeFill() {
    momentButtons.forEach(function (button) {
      var now = new DOMMatrix(getComputedStyle(button, '::before').transform).d
      button.style.setProperty('--try-fill-ms', '0ms')
      button.style.setProperty('--try-fill', String(isFinite(now) ? now : 0))
    })
  }
  function schedule(opened) {
    clearTimeout(timer)
    clearActions()
    if (reduce || held || !visible) return
    var frame = FRAMES[index]
    var duration = pace(frame[2]) + (opened ? (phoneQuery.matches ? 1100 : 600) : 0)
    if (opened && !phoneQuery.matches && ledStep !== frame[1]) announce(frame[1])
    ledStep = -1
    if (phoneQuery.matches) frameCaption(frame[1])
    duration = act(frame, duration)
    if (!phoneQuery.matches && ledStep !== frame[1]) {
      var share = frameShare(index)
      fill(frame[1], share.from, share.to, duration)
    }
    // The headline leads the action (Anders, 19 Nov): when this frame ends in the tap that starts the next moment
    // (Play, Summary), that moment's headline and dot come up first, and the tap follows a beat later.
    var nextStep = FRAMES[(index + 1) % FRAMES.length][1]
    var action = ACTIONS[frame[0]]
    if (!reduce && action && action.press && nextStep !== frame[1]) {
      later(function () {
        ledStep = nextStep
        if (!phoneQuery.matches) fill(nextStep, 0, 0, 0)
        if (phoneQuery.matches) frameCaption(nextStep)
        else announce(nextStep)
        markStep(nextStep)
      }, Math.max(0, duration - LEAD_MS))
    }
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
  demo.addEventListener('mouseenter', function () { held = true; clearTimeout(timer); clearActions(); freezeFill() })
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
  // The first moment opens with its headline too (Anders, 25 Nov), as every later one does.
  schedule(true)

  // ---- The top bar turns solid once the page scrolls (over the hero it shows the scene) ----
  var nav = $('.try-nav')
  // Phone: Start reading joins the bar only once the hero's own Start reading has scrolled up under it (Anders, 20 Nov).
  var heroStart = $('[data-try-start]')
  function navState() {
    if (!nav) return
    nav.classList.toggle('is-scrolled', window.scrollY > 8)
    nav.classList.toggle('is-past-hero', !!heroStart && heroStart.getBoundingClientRect().bottom < nav.getBoundingClientRect().bottom)
  }
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
