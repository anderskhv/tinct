/*
 * The Shakespeare page's behaviour (src/seo/shakespearePage.ts; Anders, 27 Nov 2026). Two things, and nothing here
 * calls the server: on a phone the passage shows one edition at a time and the switch changes which (the desktop
 * shows both, with no switch); and the top bar turns solid once the page scrolls, as on the About page.
 * "Pick a play" is a plain link to the plays and needs no script.
 */
(function () {
  'use strict'
  var reader = document.querySelector('[data-shk-reader]')
  if (reader) {
    var buttons = Array.prototype.slice.call(reader.querySelectorAll('[data-shk-view]'))
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        reader.setAttribute('data-view', button.getAttribute('data-shk-view'))
        buttons.forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)) })
      })
    })
  }

  var nav = document.querySelector('.try-nav')
  function navState() { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8) }
  window.addEventListener('scroll', navState, { passive: true })
  navState()
})()
