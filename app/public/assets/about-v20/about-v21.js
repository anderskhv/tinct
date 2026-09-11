// Tinct about page: small behaviours the static build cannot express in CSS alone.
// 1. The floating pill reads "Escape" until the reveal has been seen, then "Start reading".
// 2. Images for the closing bookshelf and the audio iframe are warmed as their chapters approach,
//    instead of preloading the whole collection in <head>.
(function () {
  var root = document.documentElement;
  var revealY = null;
  var afterReveal = { brand: 1, voice: 1, language: 1, character: 1, return: 1, audio: 1 };

  function visibleBeat() {
    var nodes = document.querySelectorAll('.reading-journey');
    for (var i = 0; i < nodes.length; i++) {
      var r = nodes[i].getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight) return nodes[i].getAttribute('data-beat') || '';
    }
    return '';
  }
  function update() {
    var beat = visibleBeat();
    if (revealY === null && afterReveal[beat]) revealY = window.scrollY;
    var seen = revealY !== null && window.scrollY >= revealY - 10;
    if (seen) root.setAttribute('data-tinct-reveal', 'seen'); else root.removeAttribute('data-tinct-reveal');
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }, { passive: true });
  update();

  // The pill steps aside while the footer is on screen (it has its own Start reading link).
  var footer = document.querySelector('footer.about-footer');
  if (footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) root.setAttribute('data-tinct-footer', 'visible'); else root.removeAttribute('data-tinct-footer');
    }).observe(footer);
  }

  function warm(urls) { urls.forEach(function (u) { var img = new Image(); img.decoding = 'async'; img.src = u; }); }
  function prefetch(url) { var l = document.createElement('link'); l.rel = 'prefetch'; l.href = url; l.as = 'document'; document.head.appendChild(l); }
  if ('IntersectionObserver' in window) {
    var done = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || done[e.target.id]) return;
        done[e.target.id] = true;
        if (e.target.id === 'chapter-introducing') prefetch('/assets/about-v20/audio-journey.html');
        if (e.target.id === 'chapter-invitation' || e.target.id === 'chapter-everywhere') {
          var srcs = [];
          document.querySelectorAll('img[src*="/assets/about-v20/assets/collection/"]').forEach(function (img) { if (srcs.indexOf(img.getAttribute('src')) < 0) srcs.push(img.getAttribute('src')); });
          warm(srcs);
        }
      });
    }, { rootMargin: '200% 0px 200% 0px' });
    ['chapter-introducing', 'chapter-everywhere', 'chapter-invitation'].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }
})();
