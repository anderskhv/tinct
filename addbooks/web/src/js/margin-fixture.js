'use strict';
// The margin fixture (margin-fixture.html): the reader's builders and placement over the mockup's
// page, frame by frame as docs/margin/mockup.html places its own (the same passages, offsets and
// rules), so each pair of screenshots compares like with like.
(function () {
  const M = window.TinctMargin, H = M.html;
  const q = new URLSearchParams(location.search);
  const night = q.get('night') === '1', look = q.get('look') || (night ? 'night' : 'paper');
  const lab = document.getElementById('lab');
  document.body.classList.toggle('night', look === 'night');
  lab.classList.toggle('is-night', look === 'night');
  lab.classList.toggle('is-book-theme', look === 'book');
  if (look === 'eink') document.documentElement.dataset.pdfTheme = 'eink';
  // The reader's highlight colours (reader.js HL_COLORS, unchanged).
  const COLORS = [['gold', 'Gold', 'rgba(232,196,92,.42)', '#e9cf86'], ['rose', 'Rose', 'rgba(232,118,128,.30)', '#eba7ad'], ['sage', 'Sage', 'rgba(108,178,108,.32)', '#a9d0a3'], ['sky', 'Sky', 'rgba(96,148,226,.30)', '#a6c2ee'], ['lavender', 'Lavender', 'rgba(156,116,222,.30)', '#c6b0ee']];
  const tpl = document.getElementById('pdfpage').innerHTML;
  const rel = (r, f) => ({ left: r.left - f.left, top: r.top - f.top, right: r.right - f.left, bottom: r.bottom - f.top });
  function piece(frame, cls, inner, phone) {
    const el = document.createElement('div');
    el.className = `mr mr-float ${cls}${phone ? ' is-phone' : ''}`;
    el.innerHTML = inner; frame.appendChild(el);
    return el;
  }
  function placeAt(el, p) { el.style.left = p.left + 'px'; el.style.top = p.top + 'px'; if (p.width && !el.classList.contains('mr-bar')) el.style.width = p.width + 'px'; el.classList.toggle('is-below', !!p.below); if (p.tip != null) el.style.setProperty('--tip', p.tip + 'px') }
  const opts = (all, extra) => Object.assign({ colors: COLORS, current: 'gold', all }, extra);

  const go = () => {
    document.querySelectorAll('[data-strip]').forEach(f => {
      const s = f.dataset.strip, all = f.dataset.pr !== '1a';
      f.innerHTML = '<div class="pdf">' + tpl + '</div>';
      const pdf = f.querySelector('.pdf');
      const a = pdf.querySelector(s === 'e' ? '[data-a="word"]' : s === 'f' ? '[data-a="note"]' : '[data-a="ask"]');
      a.classList.add(s === 'f' ? 'mark-hl' : 'mark-sel');
      const off = s === 'c' ? 400 : s === 'e' ? 236 : s === 'f' ? 250 : 180;
      pdf.style.top = (off - a.offsetTop) + 'px'; pdf.style.bottom = 'auto';
      const fr = f.getBoundingClientRect(), rs = [...a.getClientRects()].map(r => rel(r, fr));
      const frame = { left: 0, top: 0, right: fr.width, bottom: fr.height };
      const first = rs[0], last = rs[rs.length - 1];
      if (s === 'e') {
        const d = piece(f, 'mr-define', H.defineHtml({ word: 'variance', pos: 'noun', source: 'Dictionary', senses: [{ text: 'In statistics, the square of the standard deviation: how widely values spread around their mean.', fit: true }, { text: 'The fact of being different or inconsistent.' }, { text: 'Official permission to depart from a rule.' }] }, opts(all)));
        placeAt(d, M.placeCard({ first, last, frame, w: 360, h: d.offsetHeight }));
        return;
      }
      if (s === 'f') {
        const n = piece(f, 'mr-note', H.noteHtml({ quote: a.textContent.replace(/\s+/g, ' ').trim(), note: 'Try it with x = 10 before the exercises. How close is it?' }));
        placeAt(n, M.placeCard({ first, last, frame, w: 360, h: n.offsetHeight }));
        return;
      }
      const state = s === 'b' ? 'asking' : s === 'd' ? 'colors' : 'menu';
      const b = piece(f, 'mr-bar' + (state === 'asking' ? ' is-asking' : ''), H.barHtml(state, opts(all, { moreOpen: s === 'c', question: s === 'b' ? 'Why can I just add the variances?' : '' })));
      if (state === 'asking') M.sizeAsk(b, { room: fr.width - 32 });
      const pos = M.placeBar({ first, last, frame, w: b.offsetWidth, h: b.offsetHeight });
      placeAt(b, pos);
      if (s === 'c') {
        const m = piece(f, 'mr-more', H.moreHtml({ all }));
        const dots = rel(b.querySelector('[data-m="more"]').getBoundingClientRect(), fr), br = rel(b.getBoundingClientRect(), fr);
        placeAt(m, M.placeMore({ bar: { ...br, below: pos.below }, dots, frame, w: m.offsetWidth, h: m.offsetHeight }));
      }
    });
    // Phones: the mockup's page at its phone size, the passage at the mockup's offsets.
    document.querySelectorAll('[data-ph]').forEach(ph => {
      const s = ph.dataset.ph;
      ph.innerHTML = '<div class="ptop"><b>Probability and Inference</b><i>p. 12</i></div><div class="pdf">' + tpl + '</div><div class="home"></div>';
      const pdf = ph.querySelector('.pdf'), a = pdf.querySelector(s === 'e' ? '[data-a="word"]' : s === 'f' ? '[data-a="note"]' : '[data-a="ask"]');
      a.classList.add(s === 'f' ? 'mark-hl' : 'mark-sel');
      pdf.style.top = ((s === 'b' ? 300 : s === 'e' ? 330 : 380) - a.offsetTop) + 'px';
      const fr = ph.getBoundingClientRect(), rs = [...a.getClientRects()].map(r => rel(r, fr));
      // The phone's safe area: below its top bar, above the home indicator.
      const frame = { left: 0, top: 96, right: fr.width, bottom: fr.height - 34 };
      const first = rs[0], last = rs[rs.length - 1];
      if (s === 'e' || s === 'f') {
        const d = s === 'e'
          ? piece(ph, 'mr-define', H.defineHtml({ word: 'variance', pos: 'noun', source: 'Dictionary', senses: [{ text: 'In statistics, the square of the standard deviation: how widely values spread around their mean.', fit: true }, { text: 'The fact of being different or inconsistent.' }, { text: 'Official permission to depart from a rule.' }] }, opts(true, { phone: true })), true)
          : piece(ph, 'mr-note', H.noteHtml({ quote: a.textContent.replace(/\s+/g, ' ').trim(), note: '' }), true);
        placeAt(d, M.placeCard({ first, last, frame, w: 360, h: d.offsetHeight, phone: true }));
        return;
      }
      const b = piece(ph, 'mr-pbar', H.barHtml('menu', opts(true, { phone: true, moreOpen: s === 'b' })), true);
      const pos = M.placeBar({ first, last, frame, w: b.offsetWidth, h: 48, phone: true });
      placeAt(b, pos); b.style.width = pos.width + 'px';
      if (s === 'b') {
        const m = piece(ph, 'mr-pmore', H.moreHtml({ phone: true, all: true }), true);
        const dots = rel(b.querySelector('[data-m="more"]').getBoundingClientRect(), fr), br = rel(b.getBoundingClientRect(), fr);
        placeAt(m, M.placeMore({ bar: { ...br, below: pos.below }, dots, frame, w: m.offsetWidth, h: m.offsetHeight, phone: true }));
      }
    });
    document.documentElement.dataset.ready = 'true';
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(go);
})();
