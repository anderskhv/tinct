/*
 * The modern-English page's behaviour (src/seo/modernEnglishPage.ts; docs/modern-english/BUILD-BRIEF.md):
 * - Search by title or author: results drop down as you type (cover, title, author, source); the arrow keys move,
 *   Enter opens, Escape clears.
 * - Two rows of pills, category and period: at most one per row; a pill filters the shelves and scrolls to them,
 *   and pressed again it clears. The two rows work alone and together.
 * Every book opens the reader's free mode; the reader itself opens this device's saved place when there is one.
 */
(function () {
  'use strict'
  function ready(run) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run() }
  ready(function () {
    var books = []
    try { books = JSON.parse(document.getElementById('me-books').textContent || '[]') } catch (e) { books = [] }
    var fold = function (text) { return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim() }
    books.forEach(function (book) { book.ft = fold(book.t); book.fa = fold(book.a) })

    // ---- Search ----------------------------------------------------------------------------------------------
    var input = document.getElementById('me-q')
    var list = document.getElementById('me-results')
    var box = input && input.closest('.me-search')
    var selected = -1
    var esc = function (text) { return String(text).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) }

    function matches(query) {
      var words = query.split(' ')
      var hits = books.filter(function (book) {
        var hay = book.ft + ' ' + book.fa
        return words.every(function (word) { return hay.indexOf(word) >= 0 })
      })
      // Titles that start with the query first, then titles that contain it, then authors.
      var rank = function (book) { return book.ft.indexOf(query) === 0 ? 0 : book.ft.indexOf(query) >= 0 ? 1 : book.fa.indexOf(query) === 0 ? 2 : 3 }
      return hits.sort(function (a, b) { return rank(a) - rank(b) })
    }
    function links() { return list ? list.querySelectorAll('a') : [] }
    function select(index) {
      var all = links()
      selected = all.length ? (index + all.length) % all.length : -1
      Array.prototype.forEach.call(all, function (link, k) {
        link.setAttribute('aria-selected', String(k === selected))
        if (k === selected) { input.setAttribute('aria-activedescendant', link.id); link.scrollIntoView({ block: 'nearest' }) }
      })
      if (selected < 0) input.removeAttribute('aria-activedescendant')
    }
    function close() {
      if (!list) return
      list.hidden = true
      input.setAttribute('aria-expanded', 'false')
      input.removeAttribute('aria-activedescendant')
      selected = -1
    }
    function render() {
      var query = fold(input.value)
      if (!query) { close(); return }
      var hits = matches(query)
      list.innerHTML = hits.length
        ? hits.slice(0, 8).map(function (book, k) {
            return '<li role="presentation"><a role="option" id="me-result-' + k + '" href="' + esc(book.h) + '" aria-selected="false">'
              + '<img src="/covers/v2/' + esc(book.id) + '.webp" alt="" width="36" height="54">'
              + '<span><span class="me-result-title">' + esc(book.t) + '</span><span class="me-result-meta">' + esc(book.a) + ' · ' + esc(book.s) + '</span></span></a></li>'
          }).join('')
        : '<li class="me-empty" role="presentation">No book by that name. Try the author.</li>'
      list.hidden = false
      input.setAttribute('aria-expanded', 'true')
      select(hits.length ? 0 : -1)
    }
    if (input && list) {
      input.addEventListener('input', render)
      input.addEventListener('focus', function () { if (input.value) render() })
      input.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          if (list.hidden) render()
          if (!links().length) return
          event.preventDefault()
          select(selected + (event.key === 'ArrowDown' ? 1 : -1))
        } else if (event.key === 'Enter') {
          var target = links()[selected]
          if (target) { event.preventDefault(); window.location.assign(target.href) }
        } else if (event.key === 'Escape') {
          if (!list.hidden) { event.preventDefault(); close() } else if (input.value) { event.preventDefault(); input.value = '' }
        }
      })
      list.addEventListener('mousemove', function (event) {
        var link = event.target.closest && event.target.closest('a')
        if (!link) return
        var index = Array.prototype.indexOf.call(links(), link)
        if (index >= 0 && index !== selected) select(index)
      })
      document.addEventListener('pointerdown', function (event) { if (box && !box.contains(event.target)) close() })
    }

    // ---- Pills -----------------------------------------------------------------------------------------------
    var pick = { house: null, era: null }
    var pills = Array.prototype.slice.call(document.querySelectorAll('.me-pills button'))
    var shelves = Array.prototype.slice.call(document.querySelectorAll('.me-shelf'))
    var none = document.getElementById('me-none')
    var shelfArea = document.getElementById('me-shelves')
    function apply() {
      var any = false
      shelves.forEach(function (shelf) {
        var houseOk = !pick.house || shelf.getAttribute('data-house') === pick.house
        var shown = 0
        Array.prototype.forEach.call(shelf.querySelectorAll('.me-card'), function (card) {
          var on = houseOk && (!pick.era || card.getAttribute('data-era') === pick.era)
          card.hidden = !on
          if (on) shown++
        })
        shelf.hidden = shown === 0
        var count = shelf.querySelector('h2 span')
        if (count) count.textContent = String(shown)
        var reel = shelf.querySelector('.me-reel')
        if (reel) reel.scrollLeft = 0
        if (shown) any = true
      })
      if (none) none.hidden = any
    }
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var kind = pill.getAttribute('data-kind')
        var value = pill.getAttribute('data-value')
        pick[kind] = pick[kind] === value ? null : value
        pills.forEach(function (other) { other.setAttribute('aria-pressed', String(pick[other.getAttribute('data-kind')] === other.getAttribute('data-value'))) })
        apply()
        if (pick[kind] && shelfArea) {
          var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
          shelfArea.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
        }
      })
    })
  })
})()
