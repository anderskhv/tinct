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

  // Talk panel: a slowly turning globe of ink dots (the Talk concept), drawn into the panel's orbit
  // slot whenever the story mounts one. State follows the panel's status word.
  var t0 = performance.now();
  var sphere = (function () { var pts = [], n = 420, g = Math.PI * (3 - Math.sqrt(5)); for (var i = 0; i < n; i++) { var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i; pts.push([Math.cos(th) * r, y, Math.sin(th) * r]); } return pts; })();
  var MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="#0b0b0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path></svg>';
  var END = '<svg viewBox="0 0 24 24" fill="none" stroke="#ece7db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>';
  function drawGlobe(cv, state) {
    var dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    var t = (performance.now() - t0) / 1000, cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42, level = 0;
    if (state === 'speaking') { level = 0.5 + 0.5 * Math.sin(t * 5.1) * Math.sin(t * 1.7); R *= 1 + level * 0.12; }
    var rotY = t * 0.22, tilt = 0.35;
    ctx.fillStyle = '#0b0b0b';
    for (var i = 0; i < sphere.length; i++) {
      var x = sphere[i][0], y = sphere[i][1], z = sphere[i][2], rr = 1;
      if (state === 'listening') rr = 1 + 0.07 * Math.sin(y * 6 - t * 3.2);
      if (state === 'connecting') rr = 1 + 0.03 * Math.sin(t * 2 + x * 4);
      x *= rr; y *= rr; z *= rr;
      var x1 = x * Math.cos(rotY) + z * Math.sin(rotY), z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
      var y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt), z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
      var depth = z2 * 0.5 + 0.5, a = 0.18 + depth * 0.82;
      if (state === 'connecting') a *= Math.min(1, Math.max(0.15, (Math.sin(t * 1.4 + x1 * 4) + 1) / 1.6));
      ctx.globalAlpha = Math.min(1, a);
      var s = 1.35 * (0.55 + depth * 0.9) * (1 + level * 0.3) * (w / 280);
      ctx.beginPath(); ctx.arc(cx + x1 * R, cy + y2 * R, s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function dressPanel(orbit) {
    if (orbit.querySelector('canvas')) return;
    var cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); orbit.appendChild(cv);
    var panel = orbit.closest('.book-conversation');
    if (panel && !panel.querySelector('.talk-side')) {
      var mute = document.createElement('span'); mute.className = 'talk-side talk-mute'; mute.setAttribute('aria-hidden', 'true'); mute.innerHTML = '<i>' + MIC + '</i>Mute';
      var end = document.createElement('span'); end.className = 'talk-side talk-end'; end.setAttribute('aria-hidden', 'true'); end.innerHTML = '<i>' + END + '</i>End';
      panel.appendChild(mute); panel.appendChild(end);
    }
  }
  function globeLoop() {
    var orbits = document.querySelectorAll('.book-conversation .conversation-orbit');
    for (var i = 0; i < orbits.length; i++) {
      dressPanel(orbits[i]);
      var cv = orbits[i].querySelector('canvas'), h3 = orbits[i].parentNode.querySelector('h3');
      var word = h3 ? h3.textContent : '';
      var r = orbits[i].getBoundingClientRect();
      if (cv && r.width > 0 && r.bottom > 0 && r.top < window.innerHeight) drawGlobe(cv, /Speaking/.test(word) ? 'speaking' : /Listening/.test(word) ? 'listening' : 'connecting');
    }
    requestAnimationFrame(globeLoop);
  }
  requestAnimationFrame(globeLoop);

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
