(() => {
  const realNow = performance.now.bind(performance);
  const realDateNow = Date.now.bind(Date);
  const origRaf = window.requestAnimationFrame.bind(window);
  const origCaf = window.cancelAnimationFrame.bind(window);
  let frozen = false, vt = 0, dateBase = 0, perfBase = 0, id = 1e6;
  let q = new Map();
  window.__vc = {
    freeze() { perfBase = realNow(); vt = perfBase; dateBase = realDateNow(); frozen = true; },
    get t() { return vt; },
    get frozen() { return frozen; },
    step(ms) {
      vt += ms;
      for (const a of document.getAnimations()) {
        try {
          if (a.__vs === undefined) { a.pause(); a.__vs = vt - ms - (a.currentTime || 0); }
          a.currentTime = vt - a.__vs;
        } catch (e) {}
      }
      const cbs = [...q.values()]; q = new Map();
      for (const cb of cbs) { try { cb(vt); } catch (e) { console.error('raf err', e && e.message); } }
    },
  };
  performance.now = () => frozen ? vt : realNow();
  Date.now = () => frozen ? dateBase + (vt - perfBase) : realDateNow();
  window.requestAnimationFrame = cb => {
    if (frozen) { const k = ++id; q.set(k, cb); return k; }
    return origRaf(t => cb(frozen ? vt : t));
  };
  window.cancelAnimationFrame = k => { if (q.has(k)) q.delete(k); else origCaf(k); };
  const op = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { return frozen ? Promise.resolve() : op.call(this); };
  const cpt = HTMLMediaElement.prototype.canPlayType;
  HTMLMediaElement.prototype.canPlayType = function (t) { return /mp4|avc1/.test(t) ? 'probably' : cpt.call(this, t); };
})();
