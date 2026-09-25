// Returning readers: the hero becomes a reading table with the reader's own
// books. Data and rules come from the production library
// (/lab/library-2-reading.js, src/libraryTwoReading.ts); this file only draws.
//
// The books are real 3D boxes (cover, spine, head, fore-edge, back) standing
// on one table line under one camera. The book being read is pulled out and
// turned to face the reader; the others stand spine-out beside it. Changing
// book moves every box in one transition, so nothing is ever stretched.
import { readingApi } from './catalogue.js?v=20260925g';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const CACHE_KEY = 'tinct-library-2-reading-table';

// Sample shelf for ?demo=reading, so the view can be seen on a device with no reading history.
const DEMO = {
  mode: 'returning',
  reading: [
    { bookId: 'crime-and-punishment', title: 'Crime and Punishment', cover: '/covers/v2/crime-and-punishment.webp', wordCount: 211000, tone: '#2a2622', chapterLabel: 'Part One · Chapter 4', headline: 'You’re in the middle of Part One, Chapter 4', percent: 18, recap: 'Raskolnikov has read his mother’s letter: Dunya is to marry the calculating Luzhin to secure his future. Furious at the sacrifice, he wanders the city and, on the boulevard, tries to protect a drunk young girl from a man following her.' },
    { bookId: 'frankenstein', title: 'Frankenstein', cover: '/covers/v2/frankenstein.webp', wordCount: 75000, tone: '#0a1a0a', chapterLabel: 'Chapter 7', headline: 'You’re in the middle of Chapter 7', percent: 42, recap: 'Victor returns to Geneva after William’s murder. In the storm near Plainpalais he glimpses the creature and becomes certain it is the killer — but Justine, the family’s servant, has been accused and will stand trial.' },
    { bookId: 'meditations', title: 'Meditations', cover: '/covers/v2/meditations.webp', wordCount: 45000, tone: '#14243a', chapterLabel: 'Book Four', headline: 'You’re at the start of Book Four', percent: 63, recap: null },
    { bookId: 'hamlet', title: 'Hamlet', cover: '/covers/v2/hamlet.webp', wordCount: 30000, tone: '#1c1c20', chapterLabel: 'Act 1, Scene 3', headline: 'You’re in the middle of Act 1, Scene 3', percent: 12, recap: null },
    { bookId: 'odyssey', title: 'The Odyssey', cover: '/covers/v2/odyssey.webp', wordCount: 120000, tone: '#1a2638', chapterLabel: 'Book Two', headline: 'You’re at the start of Book Two', percent: 8, recap: null },
  ],
  finished: [
    { bookId: 'pride-and-prejudice', title: 'Pride and Prejudice', cover: '/covers/v2/pride-and-prejudice.webp', finishedAt: Date.now() - 40 * 864e5 },
    { bookId: 'the-prince', title: 'The Prince', cover: '/covers/v2/the-prince.webp', finishedAt: Date.now() - 120 * 864e5 },
  ],
};

// Spine bindings. Each book takes the binding nearest its cover tone. When
// SPINE_TEXTURES is true, the painted texture assets/spines/spine-<name>.jpg is
// layered under the gilt lettering; until then the colour alone is used.
const SPINE_TEXTURES = true;
const BINDINGS = [
  ['green', '#24472a'], ['oxblood', '#5a1c18'], ['navy', '#253c5c'], ['black', '#2b2d2e'],
  ['brown', '#5a3522'], ['slate', '#5d6f7c'], ['plum', '#4a2a45'], ['ochre', '#9a7a2c'],
];
const hash = id => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const hexRgb = hex => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return null; const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
/** Average colour of a cover's artwork (same-origin image), sampled once. */
const toneCache = new Map();
function coverTone(img) {
  if (toneCache.has(img.src)) return toneCache.get(img.src);
  try {
    const c = document.createElement('canvas'); c.width = 12; c.height = 18;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, 12, 18);
    const d = x.getImageData(0, 0, 12, 18).data; let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { const w = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) + 8; r += d[i] * w; g += d[i + 1] * w; b += d[i + 2] * w; n += w; }
    const hex = '#' + [r, g, b].map(v => Math.round(v / n).toString(16).padStart(2, '0')).join('');
    toneCache.set(img.src, hex);
    return hex;
  } catch { return null; }
}
function bindingFor(book) {
  const rgb = hexRgb(book.tone);
  if (!rgb) return BINDINGS[hash(book.bookId) % BINDINGS.length];
  const find = name => BINDINGS.find(b => b[0] === name);
  const [r, g, b] = rgb, max = Math.max(r, g, b), chroma = max - Math.min(r, g, b);
  // Nearly grey covers: dark or pale neutral bindings.
  if (chroma < 10) return find(max > 110 ? 'slate' : 'black');
  // Otherwise by hue, so a red cover gets a red spine however dark it is.
  const hue = (max === r ? ((g - b) / chroma + 6) % 6 : max === g ? (b - r) / chroma + 2 : (r - g) / chroma + 4) * 60;
  if (hue < 15 || hue >= 330) return find('oxblood');
  if (hue < 55) return find(chroma > 55 ? 'ochre' : 'brown');
  if (hue < 175) return find('green');
  if (hue < 255) return find(chroma < 20 && max > 90 ? 'slate' : 'navy');
  return find('plum');
}

// Bookmark ribbons: one colour per book, stable across visits.
const RIBBONS = ['#b03a2e', '#a8325e', '#7a4fa3', '#c07a2a', '#4f8a3f', '#c9b98f'];
const ribbonFor = id => RIBBONS[hash(id) % RIBBONS.length];
const monthName = at => (at ? new Date(at).toLocaleString('en', { month: 'long' }) : null);
const percentLabel = p => (p == null ? '' : p > 0 && p < 1 ? '<1%' : `${Math.round(p)}%`);
/** Thickness as a fraction of the book's height, from its length. */
const depthRatio = book => Math.max(0.085, Math.min(0.2, 0.065 + (book.wordCount || 90000) / 1_600_000));

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
}
function writeCache(table) {
  try {
    if (table.mode === 'returning' && table.reading.length) localStorage.setItem(CACHE_KEY, JSON.stringify(table));
    else localStorage.removeItem(CACHE_KEY);
  } catch { /* private mode */ }
}

function bookMarkup(b, i) {
  const [name, colour] = bindingFor(b);
  const texture = SPINE_TEXTURES ? `url('assets/spines/spine-${name}.jpg') 50% 50%/100% 100%,` : '';
  return `
    <button class="rt-b" data-i="${i}" aria-label="${esc(b.title)}" style="--dr:${depthRatio(b)};--ribbon:${ribbonFor(b.bookId)};--binding:${colour};--p:${Math.max(6, Math.min(94, b.percent ?? 50)) / 100};--cover:url('${esc(b.cover)}')">
      <span class="rt-shadow"></span>
      <span class="rt-f rt-back"></span>
      <span class="rt-f rt-fore"></span>
      <span class="rt-f rt-head"></span>
      <span class="rt-mark"><i></i></span>
      <span class="rt-f rt-refl rt-refl-front"></span>
      <span class="rt-f rt-refl rt-refl-spine" style="background:${texture}var(--binding)"></span>
      <span class="rt-f rt-spine${SPINE_TEXTURES ? ' is-textured' : ''}" data-binding="${name}" style="background:linear-gradient(90deg,#0009,#0000 16%,#ffffff14 44%,#0000 64%,#0009),${texture}var(--binding)"><i class="rt-gilt"></i><em>${esc(b.title)}</em><i class="rt-gilt"></i></span>
      <span class="rt-f rt-front"><img src="${esc(b.cover)}" alt="" decoding="async" draggable="false"></span>
    </button>`;
}

function markup(table) {
  return `
    <div class="rt-stage" id="rt-stage"><div class="rt-row" id="rt-row">${table.reading.map(bookMarkup).join('')}</div>
      <div class="rt-dots" id="rt-dots">${table.reading.map((b, i) => `<button data-i="${i}" aria-label="${esc(b.title)}"></button>`).join('')}</div>
      <button id="rt-prev" class="rt-hidden-nav" aria-label="Previous book" tabindex="-1"></button><button id="rt-next" class="rt-hidden-nav" aria-label="Next book" tabindex="-1"></button></div>
    <div class="rt-info"><div class="rt-fade" id="rt-info">
      <h1 id="rt-title"></h1>
      <p class="rt-meta"><span id="rt-place"></span><span id="rt-pct"></span></p>
      <div class="rt-recap" id="rt-recap-box"><div class="rt-quote"><small>Where you left off</small><p id="rt-recap"></p></div><button id="rt-more">Read more</button></div>
    </div>
    <a class="rt-continue read-button" id="rt-continue" href="#">Continue<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h20m-6-6 6 6-6 6"/></svg></a></div>`;
}

export async function mountReadingTable({ hero, shelves, el }) {
  const demo = new URLSearchParams(location.search).get('demo') === 'reading';
  const root = document.documentElement;
  let api = null, view = null, table = null;
  const settle = () => root.classList.remove('returning-pending');

  const render = (next, keepBookId) => {
    table = next;
    window.__library2Reading = table;
    window.dispatchEvent(new CustomEvent('library2:reading', { detail: table }));
    shelves.querySelector('.finished-shelf')?.remove();
    if (table.finished.length) addFinishedShelf(table.finished, shelves, el);
    view?.remove();
    view = null;
    if (table.mode !== 'returning' || !table.reading.length) { root.classList.remove('returning'); return; }
    root.classList.add('returning');
    view = document.createElement('div');
    view.className = 'reading-table';
    view.innerHTML = markup(table);
    hero.append(view);
    view.api = api;
    wire(view, table, demo, keepBookId);
  };

  if (demo) { render(DEMO); settle(); return true; }
  // Paint the last known shelf at once (no featured-hero flash), then refresh from the engine.
  const cached = readCache();
  if (cached) render(cached);
  try {
    api = await readingApi();
    if (view) view.api = api;
    const fresh = await api.loadReadingTable();
    writeCache(fresh);
    if (JSON.stringify(fresh) !== JSON.stringify(cached)) render(fresh, view?.dataset.current);
  } catch {
    if (!cached) root.classList.remove('returning');
  }
  settle();
  return root.classList.contains('returning');
}

function wire(view, table, demo, keepBookId) {
  const stage = view.querySelector('#rt-stage'), row = view.querySelector('#rt-row');
  const books = [...row.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = Math.max(0, table.reading.findIndex(b => b.bookId === keepBookId));
  if (!keepBookId) current = 0;
  const dots = [...view.querySelectorAll('#rt-dots button')];
  let turn = 1, H = 0, stageW = 0, summaryTimer = null, swapTimer = null, shown = -1;

  /** Book height from the stage, with headroom for the bookmark; the row stands on the stage's floor. */
  function fit() {
    const r = stage.getBoundingClientRect();
    if (!r.height) return;
    const desk = innerWidth >= 900;
    const next = Math.round(Math.max(130, Math.min(desk ? 400 : 270, r.height / 1.2, r.width * (desk ? 0.5 : 0.44) * 1.5)));
    if (next === H && Math.abs(r.width - stageW) < 2) return;
    H = next;
    stageW = r.width;
    view.style.setProperty('--bh', `${H}px`);
    view.style.setProperty('--bw', `${Math.round(H * 2 / 3)}px`);
    // Eye level of the painted room: a little above the books' base, so the
    // table is seen at a low angle and the books stand on it rather than float.
    const base = r.height - H * 0.05;
    stage.style.perspectiveOrigin = `50% ${Math.round(base - H * 0.42)}px`;
    layout(true);
  }

  /**
   * Books stand in reading order, the most recent on the left. The chosen one
   * is pulled forward and turned to face the reader, turning a few degrees
   * (alternating direction per change); the others stand spine-out, spines
   * flush with its cover. Positions come from real footprints, so neighbours
   * never overlap, and the row is anchored at the left of the stage.
   */
  function layout(instant) {
    const W = H * 2 / 3, gap = Math.max(2, H * 0.01), around = H * 0.08;
    const face = 12 * turn, rad = Math.abs(face) * Math.PI / 180;
    const depth = i => H * depthRatio(table.reading[i]);
    const chosenFoot = W * Math.cos(rad) + depth(current) * Math.sin(rad);
    const xs = [];
    xs[current] = 0;
    let right = chosenFoot / 2 + around, left = -chosenFoot / 2 - around;
    for (let i = current + 1; i < books.length; i++) { xs[i] = right + depth(i) / 2; right += depth(i) + gap; }
    for (let i = current - 1; i >= 0; i--) { xs[i] = left - depth(i) / 2; left -= depth(i) + gap; }
    if (current === 0) left = -chosenFoot / 2;
    if (current === books.length - 1) right = chosenFoot / 2;
    const pad = innerWidth >= 900 ? 0 : 20, minEdge = -stageW / 2 + pad, maxEdge = stageW / 2 - pad;
    let shift = minEdge - left;
    if (right + shift > maxEdge) shift -= right + shift - maxEdge;
    shift = Math.max(shift, minEdge + chosenFoot / 2);
    books.forEach((book, i) => {
      const chosen = i === current;
      book.classList.toggle('is-current', chosen);
      book.style.transitionDuration = instant || reduced ? '0s' : '';
      // Spine-out books step back so their spines line up with the chosen book's cover, not their centres.
      const z = chosen ? H * 0.05 : -(W / 2 - depth(i) / 2);
      book.style.transform = `translate3d(${(xs[i] + shift).toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${chosen ? face : 90}deg)`;
      book.setAttribute('aria-current', String(chosen));
      book.tabIndex = chosen ? 0 : -1;
    });
    dots.forEach((dot, i) => { dot.classList.toggle('active', i === current); dot.setAttribute('aria-pressed', String(i === current)); });
  }

  function select(index, byUser) {
    index = Math.max(0, Math.min(books.length - 1, index));
    if (index === current && shown !== -1) return;
    if (byUser) turn = -turn;
    current = index;
    layout(shown === -1);
    show(index);
  }

  function show(index) {
    const b = table.reading[index], firstShow = shown === -1;
    shown = index;
    view.dataset.current = b.bookId;
    const set = () => {
      $('rt-title').textContent = b.title;
      $('rt-place').textContent = b.chapterLabel;
      $('rt-pct').textContent = percentLabel(b.percent);
      setRecap(b.recap || `${b.headline}.`);
    };
    clearTimeout(swapTimer);
    if (firstShow) set();
    else {
      $('rt-info').classList.add('out');
      swapTimer = setTimeout(() => { set(); $('rt-info').classList.remove('out'); }, 200);
    }
    clearTimeout(summaryTimer);
    if (!b.recap && view.api) {
      // The "so far" summary follows the production rules; passing a book only reads the cache.
      const apply = r => { if (r?.text && current === index) setRecap(r.text); };
      view.api.summaryFor(b.bookId, { request: false }).then(apply, () => {});
      summaryTimer = setTimeout(() => view.api?.summaryFor(b.bookId, { request: true }).then(apply, () => {}), 900);
    }
  }
  function setRecap(text) {
    const recap = $('rt-recap'), box = $('rt-recap-box');
    recap.textContent = text;
    box.classList.remove('open');
    $('rt-more').textContent = 'Read more';
    requestAnimationFrame(() => { $('rt-more').classList.toggle('is-hidden', recap.scrollHeight <= recap.clientHeight + 1); });
  }
  async function continueReading() {
    const b = table.reading[current];
    if (!b || document.body.classList.contains('leaving')) return;
    document.body.classList.add('leaving');
    const destination = demo || !view.api ? Promise.resolve(`/library?book=${encodeURIComponent(b.bookId)}&view=book-detail`) : view.api.readerDestination(b.bookId, null);
    const [href] = await Promise.all([destination, new Promise(r => setTimeout(r, 240))]);
    location.assign(href);
  }

  // Click a spine to bring that book out; click the chosen book to read on.
  let startX = null, dragged = false;
  row.addEventListener('click', e => {
    const book = e.target.closest('.rt-b');
    if (!book || dragged) return;
    const i = +book.dataset.i;
    if (i === current) continueReading(); else select(i, true);
  });
  // Swipe (touch or mouse drag) moves by as many books as the gesture covers.
  stage.addEventListener('pointerdown', e => { startX = e.clientX; dragged = false; }, { passive: true });
  stage.addEventListener('pointermove', e => { if (startX !== null && Math.abs(e.clientX - startX) > 8) dragged = true; }, { passive: true });
  stage.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) >= 30) select(current + (dx < 0 ? 1 : -1) * Math.max(1, Math.min(3, Math.round(Math.abs(dx) / Math.max(70, H * 0.3)))), true);
    setTimeout(() => { dragged = false; }, 0);
  });
  stage.addEventListener('pointercancel', () => { startX = null; dragged = false; });
  // Horizontal trackpad scroll steps one book per gesture.
  let wheelAt = 0;
  stage.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    e.preventDefault();
    if (Date.now() - wheelAt < 450) return;
    wheelAt = Date.now();
    select(current + (e.deltaX > 0 ? 1 : -1), true);
  }, { passive: false });

  $('rt-continue').addEventListener('click', e => { e.preventDefault(); continueReading(); });
  dots.forEach(dot => { dot.onclick = () => select(+dot.dataset.i, true); });
  $('rt-prev').onclick = () => select(current - 1, true);
  $('rt-next').onclick = () => select(current + 1, true);
  $('rt-more').onclick = () => { const open = $('rt-recap-box').classList.toggle('open'); $('rt-more').textContent = open ? 'Show less' : 'Read more'; };
  if (!window.__library2KeysWired) {
    window.__library2KeysWired = true;
    addEventListener('keydown', e => {
      if (!document.documentElement.classList.contains('returning') || e.target.closest?.('input,textarea')) return;
      if (e.key === 'ArrowLeft') document.getElementById('rt-prev')?.click();
      if (e.key === 'ArrowRight') document.getElementById('rt-next')?.click();
    });
  }
  // Spines take the binding nearest the cover artwork's own colour.
  books.forEach((book, i) => {
    const img = book.querySelector('.rt-front img');
    const apply = () => {
      const tone = coverTone(img);
      if (!tone) return;
      const [name, colour] = bindingFor({ ...table.reading[i], tone });
      book.style.setProperty('--binding', colour);
      const tex = SPINE_TEXTURES ? `url('assets/spines/spine-${name}.jpg') 50% 50%/100% 100%,` : '';
      book.querySelector('.rt-spine').style.background = `linear-gradient(90deg,#0009,#0000 16%,#ffffff14 44%,#0000 64%,#0009),${tex}${colour}`;
      book.querySelector('.rt-refl-spine').style.background = `${tex}${colour}`;
    };
    if (img.complete && img.naturalWidth) apply(); else img.addEventListener('load', apply, { once: true });
  });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(stage);
  else addEventListener('resize', fit);
  fit();
  select(current, false);
}

function addFinishedShelf(finished, shelves, el) {
  const section = el('section', 'shelf finished-shelf');
  section.append(el('h2', '', 'Finished'));
  const row = el('div', 'book-row');
  row.setAttribute('aria-label', 'Finished');
  finished.forEach(book => {
    const card = el('a', 'book-card finished-card');
    card.href = `/library?book=${encodeURIComponent(book.bookId)}&view=book-detail`;
    card.setAttribute('aria-label', `${book.title}, finished`);
    card.innerHTML = `<span class="cv"><img src="${esc(book.cover)}" alt="" loading="lazy" decoding="async"><span class="done" aria-hidden="true">✓</span></span>${monthName(book.finishedAt) ? `<small>Finished in ${esc(monthName(book.finishedAt))}</small>` : ''}`;
    row.append(card);
  });
  section.append(row);
  shelves.prepend(section);
}
