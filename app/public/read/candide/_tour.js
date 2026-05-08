// Tour-card carousel for the Odyssey summary page. Extracted from inline
// <script> on summary.html so the production CSP (script-src 'self') doesn't
// block it. Loaded via <script src="/read/odyssey/_tour.js" defer></script>.
(function () {
  var track = document.getElementById('tour-track');
  if (!track) return;
  var cards = track.querySelectorAll('.tour-card');
  var total = cards.length;
  if (total === 0) return;
  var numDisplay = document.getElementById('tour-num-display');
  var bar = document.getElementById('tour-bar');
  var prevBtn = document.querySelector('[data-tour-prev]');
  var nextBtn = document.querySelector('[data-tour-next]');

  function activeIndex() {
    var pos = track.scrollLeft;
    var width = cards[0].getBoundingClientRect().width;
    var gap = parseFloat(getComputedStyle(track).columnGap || '0') || 24;
    return Math.round(pos / (width + gap));
  }

  function update() {
    var i = activeIndex();
    if (i < 0) i = 0;
    if (i > total - 1) i = total - 1;
    if (numDisplay) numDisplay.textContent = String(i + 1);
    if (bar) bar.style.width = (((i + 1) / total) * 100) + '%';
    if (prevBtn) prevBtn.disabled = i === 0;
    if (nextBtn) nextBtn.disabled = i === total - 1;
  }

  function go(delta) {
    var i = activeIndex() + delta;
    if (i < 0) i = 0;
    if (i > total - 1) i = total - 1;
    var card = cards[i];
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });

  var t;
  track.addEventListener('scroll', function () {
    clearTimeout(t);
    t = setTimeout(update, 80);
  });

  document.addEventListener('keydown', function (e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowLeft') { go(-1); }
    else if (e.key === 'ArrowRight') { go(1); }
  });

  update();
})();
