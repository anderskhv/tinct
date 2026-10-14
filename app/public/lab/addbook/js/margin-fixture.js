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
    document.querySelectorAll('[data-ph]:not([data-ph="c"]):not([data-ph="d"])').forEach(ph => {
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
    return pr2().then(() => { document.documentElement.dataset.ready = 'true' });
  };

  /* ---------- PR 2: the column, cards, leader lines, the "more" row, marks and the phone's bottom card ----------
     The mockup's own frames and passages (sections 2, 3, 5 C/D and 6), drawn with the reader's
     builders (TinctMargin.html.cardHtml, …) and its placement (TinctMargin.placeCards). */
  const ANSWER = 'Because the tosses are independent, so the cross terms vanish. var[a + b] = var[a] + var[b] + 2 cov[a, b], and independence makes the covariance zero. Each toss adds f(1 − f), giving Nf(1 − f) {p. 12}.';
  const CARDS = {
    ask: { kind: 'ask', text: 'r is the sum of N independent random variables…', turns: [{ role: 'user', content: 'Why can I just add the variances?' }, { role: 'assistant', content: ANSWER }] },
    fig: { kind: 'explain', text: 'Figure 1.3.', turns: [{ role: 'assistant', content: 'Each bar is the chance of that many heads in ten tosses. Three is the most likely, matching the mean Nf = 3.' }] },
    note: { kind: 'note', text: 'an approximation for the factorial function', note: 'Try it with x = 10 before the exercises. How close is it?', color: 'gold' },
    eq1: { kind: 'simplify', text: 'P(r | f, N)', turns: [{ role: 'assistant', content: 'Ways to pick which r tosses are heads, times the chance of any one such sequence.' }] },
    word: { kind: 'define', text: 'variance', data: { word: 'variance', senses: [{ text: 'In statistics, how widely values spread around their mean.' }] } },
    stir: { kind: 'counterpoint', text: 'Stirling’s approximation', turns: [{ role: 'assistant', content: 'For small x the approximation is off by several percent.' }] },
    app: { kind: 'note', text: 'Unfamiliar notation? See Appendix A, p. 598.', note: 'Appendix A before Thursday.', color: 'gold' },
  };
  const ROW = {
    simplify: { kind: 'simplify', text: 'These results are easiest to obtain by noting that r is the sum of N independent random variables…', turns: [{ role: 'assistant', content: 'Think of the count of heads as ten tiny counts added up, one per toss. Each toss adds 0 or 1. Because the tosses do not affect each other, their spreads simply add, so the total spread is N times the spread of one toss.' }] },
    factcheck: { kind: 'factcheck', text: 'x! ≃ xˣ e⁻ˣ √(2πx)', turns: [{ role: 'assistant', content: 'Holds. This is the standard form of Stirling’s approximation.\n\nHolds. The relative error falls below 1% from x = 9 and keeps shrinking as x grows.\n\nNote. Many texts write the cruder x! ≃ xˣ e⁻ˣ; this page includes the √(2πx) term, which matters for small x.\n\nSources: [NIST DLMF §5.11](https://dlmf.nist.gov/5.11) · [Wikipedia: Stirling’s approximation](https://en.wikipedia.org/wiki/Stirling%27s_approximation)' }] },
    counterpoint: { kind: 'counterpoint', text: 'Each toss has mean f and variance f(1 − f).', turns: [{ role: 'assistant', content: 'The model assumes every toss has the same f, and real data rarely does. If f drifts from toss to toss, or tosses influence each other, the spread of r is wider than Nf(1 − f), and the binomial understates the uncertainty.\n\nThe author could answer that the binomial is a model to be tested against data, not a claim about every coin.' }] },
    quiz: { kind: 'quiz', data: { i: 0, results: [], questions: [{ q: 'Ten fair coins are tossed. What is the variance of the number of heads?', answer: '2.5', why: 'Nf(1 − f) = 10 × ½ × ½ = 2.5.', cite: '{eq. 1.2}' }, { q: 'Why do the variances of the tosses add?', answer: 'Because the tosses are independent.', why: 'Independence makes the covariance zero.', cite: '{p. 12}' }, { q: 'What is the variance for N = 4 and f = 0.3?', answer: '0.84', why: '4 × 0.3 × 0.7 = 0.84.', cite: '{eq. 1.2}' }] } },
  };
  ROW['quiz-answered'] = { kind: 'quiz', data: { ...ROW.quiz.data, results: [{ answer: '2.5', verdict: 'right', feedback: 'Nf(1 − f) = 10 × ½ × ½ = 2.5' }] } };
  ROW['quiz-shown'] = { kind: 'quiz', data: { ...ROW.quiz.data, i: 1, results: [{ answer: '2.5', verdict: 'right', feedback: '' }, { shown: true }] } };
  ROW['quiz-marking'] = { kind: 'quiz', data: { ...ROW.quiz.data, i: 2, results: [{ answer: '2.5', verdict: 'right' }, { shown: true }] }, pending: '0.84' };
  ROW['quiz-done'] = { kind: 'quiz', data: { ...ROW.quiz.data, i: 2, done: true, results: [{ answer: '2.5', verdict: 'right' }, { answer: 'They are independent', verdict: 'nearly', feedback: '' }, { answer: '0.84', verdict: 'right' }] } };
  ROW['factcheck-checking'] = { kind: 'factcheck', text: ROW.factcheck.text, turns: [], status: 'Checking sources…' };
  ROW['factcheck-six'] = { kind: 'factcheck', text: ROW.factcheck.text, turns: [{ role: 'assistant', content: 'Holds. This is the standard form of Stirling’s approximation.\n\nHolds. The relative error falls below 1% from x = 9.\n\nSources: ' + ['NIST DLMF §5.11', 'Wikipedia: Stirling’s approximation', 'MathWorld: Stirling’s Approximation', 'Feller, An Introduction to Probability Theory', 'Robbins (1955), A Remark on Stirling’s Formula', 'https://www.example.org/a-very-long-path/without-any-breaks/stirling-approximation-error-bounds-for-small-x'].map((t, i) => `[${t}](https://example.org/s${i})`).join(' · ') }] };
  ROW.explain = { kind: 'explain', text: 'Figure 1.3. The binomial distribution P(r | f = 0.3, N = 10).', turns: [{ role: 'assistant', content: 'Each bar is the chance of that many heads in ten tosses. Three is the most likely, matching the mean Nf = 3 {p. 12}.\n\nThe bars fall away on both sides because outcomes far from the mean need many unlikely tosses in a row.' }] };
  ROW.define = { kind: 'define', text: 'variance', data: { word: 'variance', senses: [{ text: 'In statistics, the square of the standard deviation: how widely values spread around their mean.' }, { text: 'The fact of being different or inconsistent.' }, { text: 'Official permission to depart from a rule.' }] } };
  ROW.note = { kind: 'note', text: 'an approximation for the factorial function, x! ≃ xˣ e⁻ˣ √(2πx),', note: 'Try it with x = 10 before the exercises. How close is it?', color: 'gold' };

  let P = null, TC = null;
  const LABELS = { count: 640, labels: null, texts: new Map([[12, '(1.1) (1.2) Figure 1.3 (1.3)']]) };
  const resolve = token => M.citeTarget(token, LABELS);
  const hlDot = c => (COLORS.find(x => x[0] === c) || COLORS[0])[3];
  function cardEl(card, open, extra = {}) {
    const el = document.createElement('div');
    el.className = 'mr ' + H.cardClass(card, open);
    if (card.kind === 'note') el.style.setProperty('--hl-color', hlDot(card.color));
    el.innerHTML = H.cardHtml(card, { open, P, resolve, pageLabel: '12', status: card.status, pending: card.pending, ...extra });
    return el;
  }
  function desk(d) {
    const kind = d.dataset.desk, narrow = kind === 'marks';
    d.innerHTML = '<div class="top"><span>←</span><span class="ttl"><b>Probability and Inference</b><span class="pg">p. 12</span></span><span class="rt"><span>Aa</span><span class="t">t</span></span></div><div class="sheetwrap"><div class="pdf">' + tpl + '</div></div>';
    const pdf = d.querySelector('.pdf'), sheet = d.querySelector('.sheetwrap');
    const plan = { margin: { top: -185, cards: ['fig', 'ask', 'note'], open: 'ask' }, overlap: { top: -110, cards: ['eq1', 'word', 'fig', 'ask', 'note', 'stir', 'app'], open: 'ask' }, marks: { top: -185, cards: ['fig', 'ask', 'note'], open: 'ask' } }[kind];
    sheet.style.top = plan.top + 'px';
    const dr = d.getBoundingClientRect(), pr = sheet.getBoundingClientRect();
    const pageRight = pr.right - dr.left;
    plan.cards.forEach(k => { const a = pdf.querySelector('[data-a="' + k + '"]'); if (k === 'note' || k === 'app') a.classList.add('mark-hl') });
    const firstLine = k => { const r = pdf.querySelector('[data-a="' + k + '"]').getClientRects()[0]; return { top: r.top - dr.top, bottom: r.bottom - dr.top } };
    if (narrow) {
      // Below 1180px: marks at the page's right edge; the open card floats beside its mark.
      const marks = document.createElement('div'); marks.className = 'mr mr-marks'; d.appendChild(marks);
      plan.cards.forEach(k => { const f = firstLine(k), m = document.createElement('button'); m.type = 'button'; m.className = 'mr-mark'; m.setAttribute('aria-label', 'Open card'); m.style.left = (pageRight + M.COL.dot) + 'px'; m.style.top = ((f.top + f.bottom) / 2 - 56) + 'px'; if (k === plan.open) m.setAttribute('aria-expanded', 'true'); marks.appendChild(m) });
      const f = firstLine(plan.open), card = cardEl(CARDS[plan.open], true); card.classList.add('is-floating'); d.appendChild(card);
      const top = Math.max(56 + 16, Math.min(f.top - M.COL.lift, dr.height - 16 - card.offsetHeight));
      card.style.left = (pageRight + M.COL.dot - 14 - 380) + 'px'; card.style.top = top + 'px';
      pdf.querySelector('[data-a="' + plan.open + '"]').classList.add('mark-ul');
      return;
    }
    const col = document.createElement('div'); col.className = 'mr mr-col'; d.appendChild(col);
    const svgNS = 'http://www.w3.org/2000/svg', leads = document.createElementNS(svgNS, 'svg'); leads.setAttribute('class', 'mr mr-leads'); d.appendChild(leads);
    const foot = document.createElement('div'); foot.className = 'mr-foot'; foot.innerHTML = H.footHtml(); col.appendChild(foot);
    const colTop = 56, colH = dr.height - colTop, footTop = colH - 22 - foot.offsetHeight;
    col.style.setProperty('--mr-col-height', colH + 'px'); col.style.setProperty('--mr-foot-height', (colH - footTop + 18) + 'px');
    const els = plan.cards.map(k => { const el = cardEl(CARDS[k], k === plan.open); col.insertBefore(el, foot); return el });
    const stackEl = document.createElement('button'); stackEl.type = 'button'; stackEl.className = 'mr-stack'; stackEl.innerHTML = H.stackHtml([CARDS.note]); col.insertBefore(stackEl, foot);
    const stackH = stackEl.offsetHeight;
    const out = M.placeCards(plan.cards.map(k => ({ id: k, top: firstLine(k).top - colTop })), els.map(e => e.offsetHeight), footTop, { open: plan.open, stackHeight: stackH });
    const at = new Map(out.positions.map(p => [p.id, p]));
    plan.cards.forEach((k, i) => {
      const p = at.get(k), el = els[i];
      if (!p) { el.hidden = true; return }
      el.style.top = p.top + 'px';
      const f = firstLine(k), lab = el.querySelector('.mr-card__label').getBoundingClientRect();
      const ey = (f.top + f.bottom) / 2, cy = (lab.top + lab.bottom) / 2 - dr.top, x0 = pageRight + M.COL.dot, x1 = 800 - 6;
      const faint = k === plan.open ? '' : ' class="is-folded"';
      leads.insertAdjacentHTML('beforeend', `<circle${faint} cx="${x0}" cy="${ey}" r="${M.COL.r}"/><path${faint} d="${M.leadPath(x0, ey, x1, cy)}"/>`);
      if (k === plan.open) pdf.querySelector('[data-a="' + k + '"]').classList.add('mark-ul');
    });
    if (out.stack) {
      stackEl.innerHTML = H.stackHtml(out.gathered.map(k => CARDS[k])); stackEl.style.top = out.stack.top + 'px';
      const cy = colTop + out.stack.top + stackEl.offsetHeight / 2;
      out.gathered.forEach(k => { const f = firstLine(k), ey = (f.top + f.bottom) / 2, x0 = pageRight + M.COL.dot; leads.insertAdjacentHTML('beforeend', `<circle class="is-folded" cx="${x0}" cy="${ey}" r="${M.COL.r}"/><path class="is-folded" d="${M.leadPath(x0, ey, 800 - 6, cy)}"/>`) });
    } else stackEl.hidden = true;
    d.dataset.gathered = out.gathered.join(',');
  }
  function sheet(ph) {
    const s = ph.dataset.ph;
    ph.innerHTML = '<div class="ptop"><b>Probability and Inference</b><i>p. 12</i></div><div class="pdf">' + tpl + '</div><div class="home"></div>';
    const pdf = ph.querySelector('.pdf'), a = pdf.querySelector(s === 'c' ? '[data-a="ask"]' : '[data-a="eq1"]');
    if (s === 'c') a.classList.add('mark-ul');
    pdf.style.top = ((s === 'c' ? 236 : 150) - a.offsetTop) + 'px';
    const el = document.createElement('div'); el.className = 'mr mr-sheet';
    if (s === 'c') {
      const card = { kind: 'ask', text: 'r is the sum of N independent random variables…', turns: [{ role: 'user', content: 'Why can I just add the variances?' }, { role: 'assistant', content: 'Because the tosses are independent, so the cross terms vanish. var[a + b] = var[a] + var[b] + 2 cov[a, b], and independence makes the covariance zero.\n\nN tosses of variance f(1 − f) give Nf(1 − f) {eq. 1.2}.' }] };
      el.innerHTML = H.sheetHtml(H.cardHtml(card, { open: true, P, resolve, pageLabel: '12' }));
    } else {
      const turns = [{ role: 'user', text: 'What is this book for?', at: Date.now() - 86400000 * 3, place: 'Page 1' }, { role: 'assistant', text: 'A course in probability and information.', at: Date.now() - 86400000 * 3, place: 'Page 1' }, { role: 'user', text: 'What do I need to remember from chapter 1 for the exam?', at: Date.now(), place: 'Chapter 1' }, { role: 'assistant', text: 'Two things: the binomial formula with its mean and variance, and Stirling’s approximation. Expect to use them together, approximating a binomial coefficient with ln x! ≃ x ln x − x {eq. 1.3}.', at: Date.now(), place: 'Chapter 1' }];
      el.innerHTML = H.sheetHtml(H.wholeHtml(H.threadHtml(TC.threadRows(turns), turns, { P, resolve }), { label: false }));
      requestAnimationFrame(() => { const b = el.querySelector('.mr-card__body'); b.scrollTop = b.scrollHeight });
    }
    ph.appendChild(el);
  }
  async function pr2() {
    [P, TC] = await Promise.all([import('/lab/margin/margin-parse.js'), import('/lab/chat-thread.js')]);
    document.querySelectorAll('[data-desk]').forEach(desk);
    document.querySelectorAll('[data-card]').forEach(bg => {
      const k = bg.dataset.card;
      bg.innerHTML = '';
      if (k === 'folded') { const c = cardEl(CARDS.fig, false); bg.appendChild(c); const n = cardEl(CARDS.note, false); n.style.marginTop = '14px'; bg.appendChild(n); return }
      if (k === 'whole') {
        const turns = [{ role: 'user', text: 'What does the chapter set up?', at: Date.now(), place: 'Page 12' }, { role: 'assistant', text: 'The binomial distribution and Stirling’s approximation. Both come back in every later chapter {p. 12}.', at: Date.now(), place: 'Page 12' }];
        const el = document.createElement('div'); el.className = 'mr mr-card is-open is-whole'; el.innerHTML = H.wholeHtml(H.threadHtml(TC.threadRows(turns), turns, { P, resolve })); bg.appendChild(el); return;
      }
      bg.appendChild(cardEl(ROW[k], true));
    });
    document.querySelectorAll('[data-ph="c"], [data-ph="d"]').forEach(sheet);
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(go);
})();
