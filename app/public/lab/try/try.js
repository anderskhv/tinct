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
  // The step beside the reader: the copy approved for the step page (18 Nov), in the order the frames play.
  var STEPS = [
    { title: 'Explain anything', line: 'Select a passage. The explanation lands beside it, in the margin, and stays there as a note.' },
    { title: 'Hear it as you read', line: 'Press play. Every word is marked as it is read.' },
    { title: "Read it in today's words", line: 'Switch to modern English. Switch back any time; you stay on the line.' },
    { title: 'Get the gist in a minute', line: 'Tap Summary beside the chapter. It opens as a card, four beats long.' },
  ]
  // [file number, step, milliseconds on screen]
  var FRAMES = [
    ['01', 0, 1300], ['02', 0, 1500], ['04', 0, 3200],
    ['05', 1, 1300], ['06', 1, 1300], ['07', 1, 1500],
    ['08', 2, 3200],
    ['10', 3, 3600],
  ]
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
    picture.innerHTML = '<source media="(max-width: 899px)" srcset="/lab/try/frames/phone-' + frame[0] + '.webp">' +
      '<img src="/lab/try/frames/desktop-' + frame[0] + '.webp" alt="" width="2112" height="1222" loading="lazy" decoding="async">'
    demo.insertBefore(picture, $('.try-demo-open', demo))
    pictures.push(picture)
  })
  // Lazy images in a stack under the first never scroll into view on their own: ask for them once the page is up.
  window.addEventListener('load', function () { pictures.forEach(function (p) { var img = $('img', p); img.loading = 'eager' }) })

  var index = 0
  var timer = null
  var held = false
  var visible = true

  // The frame that switches to modern English arrives as a wave running down the page (the launch film's switch).
  var WAVE = FRAMES.map(function (frame, i) { return i > 0 && frame[1] === 2 && FRAMES[i - 1][1] !== 2 })
  var shown = -1
  function paint() {
    var wave = !reduce && shown >= 0 && shown !== index && WAVE[index]
    var under = wave ? shown : -1
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
  }
  function schedule() {
    clearTimeout(timer)
    if (reduce || held || !visible) return
    timer = setTimeout(function () { index = (index + 1) % FRAMES.length; paint(); schedule() }, FRAMES[index][2])
  }
  function show(step) {
    // A step opens on its first frame and plays on; with reduced motion, its last.
    var matches = FRAMES.map(function (frame, i) { return frame[1] === step ? i : -1 }).filter(function (i) { return i >= 0 })
    index = reduce ? matches[matches.length - 1] : matches[0]
    paint()
    schedule()
  }

  $$('[data-try-step]').forEach(function (button) {
    button.addEventListener('click', function () { show(Number(button.getAttribute('data-try-step'))) })
  })
  var next = $('[data-try-next]')
  if (next) next.addEventListener('click', function () { show((FRAMES[index][1] + 1) % STEPS.length) })
  var prev = $('[data-try-prev]')
  if (prev) prev.addEventListener('click', function () { show((FRAMES[index][1] + STEPS.length - 1) % STEPS.length) })
  demo.addEventListener('mouseenter', function () { held = true; clearTimeout(timer) })
  demo.addEventListener('mouseleave', function () { held = false; schedule() })
  demo.addEventListener('focus', function () { held = true; clearTimeout(timer) })
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
