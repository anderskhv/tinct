// Injected before any page script. Slows the page's sense of time by
// window.__PROMO_K so a slow headless capture still gets ~30 fps of motion:
// clocks, rAF timestamps, timers, media playback rate and smooth scrolls all
// run K times slower (CSS animations included, via the Web Animations API).
// record.mjs divides real timestamps by K.
(() => {
  const K = window.__PROMO_K || 1;
  if (K === 1 || window.__promoWarp) return;
  window.__promoWarp = true;

  const perf = performance.now.bind(performance);
  const dateNow = Date.now;
  const p0 = perf(), d0 = dateNow();
  const warpPerf = (t) => p0 + (t - p0) / K;
  performance.now = () => warpPerf(perf());
  Date.now = () => d0 + (dateNow() - d0) / K;
  const tsDesc = Object.getOwnPropertyDescriptor(Event.prototype, 'timeStamp');
  Object.defineProperty(Event.prototype, 'timeStamp', { configurable: true, get() { return warpPerf(tsDesc.get.call(this)); } });

  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((t) => cb(warpPerf(t)));
  const st = window.setTimeout.bind(window), si = window.setInterval.bind(window);
  window.setTimeout = (fn, d = 0, ...a) => st(fn, d * K, ...a);
  window.setInterval = (fn, d = 0, ...a) => si(fn, d * K, ...a);

  // CSS animations/transitions and element.animate(): slow each new Animation once.
  const slowed = new WeakSet();
  const slow = (an) => { if (!slowed.has(an)) { slowed.add(an); try { an.updatePlaybackRate(an.playbackRate / K); } catch {} } return an; };
  const elAnimate = Element.prototype.animate;
  Element.prototype.animate = function (...a) { return slow(elAnimate.apply(this, a)); };
  const sweep = () => { if (document.getAnimations) for (const an of document.getAnimations()) slow(an); raf(sweep); };
  raf(sweep);
  for (const type of ['animationstart', 'transitionrun']) window.addEventListener(type, sweep.bind(null), true);

  // Media: the page sees the rate it set; the element really plays K times slower.
  const rate = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate');
  const logical = new WeakMap();
  Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
    configurable: true,
    get() { return logical.get(this) ?? 1; },
    set(v) { logical.set(this, v); rate.set.call(this, v / K); },
  });
  const sync = (e) => { const m = e.target; if (m instanceof HTMLMediaElement) rate.set.call(m, (logical.get(m) ?? 1) / K); };
  for (const type of ['loadstart', 'loadedmetadata', 'play', 'playing', 'ratechange'])
    window.addEventListener(type, (e) => { if (e.target instanceof HTMLMediaElement && Math.abs(rate.get.call(e.target) - (logical.get(e.target) ?? 1) / K) > 1e-3) sync(e); }, true);

  // Smooth scrolling is driven by the compositor in real time; animate it ourselves.
  const css = document.createElement('style');
  css.textContent = '*,html{scroll-behavior:auto!important}';
  const addCss = () => (document.head || document.documentElement).appendChild(css);
  if (document.documentElement) addCss(); else new MutationObserver((_, mo) => { if (document.documentElement) { mo.disconnect(); addCss(); } }).observe(document, { childList: true });
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  function animate(targets, ms = 520) {
    const start = performance.now();
    const step = () => {
      const k = ease(Math.min(1, (performance.now() - start) / ms));
      for (const t of targets) { t.el.scrollLeft = t.x0 + (t.x1 - t.x0) * k; t.el.scrollTop = t.y0 + (t.y1 - t.y0) * k; }
      if (k < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }
  const scrollers = (el) => { const out = []; for (let n = el.parentElement; n; n = n.parentElement) if (n.scrollHeight > n.clientHeight || n.scrollWidth > n.clientWidth) out.push(n); out.push(document.scrollingElement); return [...new Set(out)]; };
  const smooth = (o) => o && typeof o === 'object' && o.behavior === 'smooth';
  const origSIV = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function (o) {
    if (!smooth(o)) return origSIV.call(this, o);
    const list = scrollers(this).map((el) => ({ el, x0: el.scrollLeft, y0: el.scrollTop }));
    origSIV.call(this, { ...o, behavior: 'instant' });
    for (const t of list) { t.x1 = t.el.scrollLeft; t.y1 = t.el.scrollTop; t.el.scrollLeft = t.x0; t.el.scrollTop = t.y0; }
    animate(list.filter((t) => t.x0 !== t.x1 || t.y0 !== t.y1));
  };
  for (const [proto, name, rel] of [[Element.prototype, 'scrollTo', false], [Element.prototype, 'scrollBy', true], [window, 'scrollTo', false], [window, 'scrollBy', true]]) {
    const orig = proto[name];
    proto[name] = function (a, b) {
      if (!smooth(a)) return orig.call(this, a, b);
      const el = this === window ? document.scrollingElement : this;
      const x0 = el.scrollLeft, y0 = el.scrollTop;
      const x1 = a.left == null ? x0 : rel ? x0 + a.left : a.left, y1 = a.top == null ? y0 : rel ? y0 + a.top : a.top;
      animate([{ el, x0, y0, x1, y1 }]);
    };
  }
})();
