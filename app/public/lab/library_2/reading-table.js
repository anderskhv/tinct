// Returning readers: the hero becomes a reading table with the reader's own
// books. Data and rules come from the production library
// (/lab/library-2-reading.js, src/libraryTwoReading.ts); this file only draws.
import { readingApi } from './catalogue.js?v=20260925b';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const CACHE_KEY = 'tinct-library-2-reading-table';

// Sample shelf for ?demo=reading, so the view can be seen on a device with no reading history.
const DEMO = {
  mode: 'returning',
  reading: [
    { bookId: 'crime-and-punishment', title: 'Crime and Punishment', cover: '/covers/v2/crime-and-punishment.webp', wordCount: 211000, chapterLabel: 'Part One · Chapter 4', headline: 'You’re in the middle of Part One, Chapter 4', percent: 18, recap: 'Raskolnikov has read his mother’s letter: Dunya is to marry the calculating Luzhin to secure his future. Furious at the sacrifice, he wanders the city and, on the boulevard, tries to protect a drunk young girl from a man following her.' },
    { bookId: 'frankenstein', title: 'Frankenstein', cover: '/covers/v2/frankenstein.webp', wordCount: 75000, chapterLabel: 'Chapter 7', headline: 'You’re in the middle of Chapter 7', percent: 42, recap: 'Victor returns to Geneva after William’s murder. In the storm near Plainpalais he glimpses the creature and becomes certain it is the killer — but Justine, the family’s servant, has been accused and will stand trial.' },
    { bookId: 'meditations', title: 'Meditations', cover: '/covers/v2/meditations.webp', wordCount: 45000, chapterLabel: 'Book Four', headline: 'You’re at the start of Book Four', percent: 63, recap: null },
    { bookId: 'hamlet', title: 'Hamlet', cover: '/covers/v2/hamlet.webp', wordCount: 30000, chapterLabel: 'Act 1, Scene 3', headline: 'You’re in the middle of Act 1, Scene 3', percent: 12, recap: null },
  ],
  finished: [
    { bookId: 'pride-and-prejudice', title: 'Pride and Prejudice', cover: '/covers/v2/pride-and-prejudice.webp', finishedAt: Date.now() - 40 * 864e5 },
    { bookId: 'the-prince', title: 'The Prince', cover: '/covers/v2/the-prince.webp', finishedAt: Date.now() - 120 * 864e5 },
  ],
};

// Bookmark ribbons: one colour per book, stable across visits.
const RIBBONS = ['#8c2e26', '#2f5a3e', '#2b3f66', '#a7782a', '#5b2f4f', '#1f4a5c', '#6b4a2b'];
const ribbonFor = id => RIBBONS[[...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % RIBBONS.length];
const thickness = book => Math.round(Math.max(12, Math.min(40, (book.wordCount || 90000) / 300 / 13)));
const monthName = at => (at ? new Date(at).toLocaleString('en', { month: 'long' }) : null);
const percentLabel = p => (p == null ? '' : p > 0 && p < 1 ? '<1%' : `${Math.round(p)}%`);

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
}
function writeCache(table) {
  try {
    if (table.mode === 'returning' && table.reading.length) localStorage.setItem(CACHE_KEY, JSON.stringify(table));
    else localStorage.removeItem(CACHE_KEY);
  } catch { /* private mode */ }
}

function markup(table) {
  const books = table.reading.map((b, i) => {
    const t = thickness(b), depth = Math.max(3, Math.min(97, b.percent ?? 50));
    return `
    <div class="rt-slot" data-i="${i}" data-side="${i % 2 ? 'spine' : 'pages'}">
      <div class="rt-book" style="--t:${t}px;--dz:${-Math.round(t * depth / 100) - 1}px;--ribbon:${ribbonFor(b.bookId)};--cover:url('${esc(b.cover)}')">
        <div class="rt-back"></div>
        <div class="rt-pages"><i class="rt-leaf"></i><i class="rt-fore"></i><i class="rt-head"></i><i class="rt-spine"></i><i class="rt-mark"></i></div>
        <div class="rt-cover"><img src="${esc(b.cover)}" alt="${esc(b.title)}" decoding="async"></div>
      </div>
    </div>`;
  }).join('');
  return `
    <div class="rt-stage"><div class="rt-track" id="rt-track">${books}</div>
      <div class="rt-arrows"><button id="rt-prev" aria-label="Previous book">‹</button><button id="rt-next" aria-label="Next book">›</button></div></div>
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
    wire(view, table, api, demo, keepBookId);
  };

  if (demo) { render(DEMO); settle(); return true; }
  // Paint the last known shelf at once (no featured-hero flash), then refresh from the engine.
  const cached = readCache();
  if (cached) render(cached);
  try {
    api = await readingApi();
    const fresh = await api.loadReadingTable();
    writeCache(fresh);
    if (JSON.stringify(fresh) !== JSON.stringify(cached)) render(fresh, view?.dataset.current);
    else if (view) view.api = api;
  } catch {
    if (!cached) root.classList.remove('returning');
  }
  settle();
  return root.classList.contains('returning');
}

function wire(view, table, api, demo, keepBookId) {
  view.api = api;
  const track = view.querySelector('#rt-track'), slots = [...track.children];
  let current = -1, cw = 0, stageHeight = 0, summaryTimer = null, swapTimer = null;

  function fit() {
    const stage = view.querySelector('.rt-stage').getBoundingClientRect();
    if (Math.abs(stage.height - stageHeight) < 2 && cw) return;
    stageHeight = stage.height;
    const desk = innerWidth >= 900, room = desk ? stage.height - 52 : stage.height - 14;
    const ch = Math.max(120, Math.min(desk ? 440 : 330, room));
    cw = Math.round(ch * 2 / 3);
    view.style.setProperty('--cw', `${cw}px`);
    view.style.setProperty('--ch', `${Math.round(ch)}px`);
    layout();
  }
  function layout() {
    const mid = track.scrollLeft + track.clientWidth / 2, step = cw + 18;
    let best = 0, bestDistance = Infinity;
    slots.forEach((slot, k) => {
      const centre = slot.offsetLeft + slot.offsetWidth / 2, t = Math.max(-2, Math.min(2, (centre - mid) / step)), a = Math.min(1, Math.abs(t));
      // The front book turns to show its pages or, on alternate books, its spine.
      const turn = (slot.dataset.side === 'spine' ? 26 : -26) * (1 - a);
      slot.firstElementChild.style.transform = `rotateY(${turn - t * 12}deg) scale(${1 - a * 0.16})`;
      slot.style.setProperty('--o', String(1 - a));
      slot.querySelector('.rt-cover').style.filter = `brightness(${1 - a * 0.5})`;
      slot.style.zIndex = String(10 - Math.round(a * 5));
      if (Math.abs(centre - mid) < bestDistance) { bestDistance = Math.abs(centre - mid); best = k; }
    });
    if (best !== current) show(best);
  }
  function show(index) {
    const first = current === -1;
    current = index;
    const b = table.reading[index];
    view.dataset.current = b.bookId;
    const set = () => {
      $('rt-title').textContent = b.title;
      $('rt-place').textContent = b.chapterLabel;
      $('rt-pct').textContent = percentLabel(b.percent);
      setRecap(b.recap || `${b.headline}.`);
    };
    clearTimeout(swapTimer);
    if (first) set();
    else {
      $('rt-info').classList.add('out');
      swapTimer = setTimeout(() => { set(); $('rt-info').classList.remove('out'); }, 160);
    }
    clearTimeout(summaryTimer);
    if (!b.recap && view.api) {
      // The "so far" summary follows the production rules; scrolling past a book only reads the cache.
      const apply = r => { if (r?.text && current === index) setRecap(r.text); };
      view.api.summaryFor(b.bookId, { request: false }).then(apply, () => {});
      summaryTimer = setTimeout(() => view.api.summaryFor(b.bookId, { request: true }).then(apply, () => {}), 900);
    }
  }
  function setRecap(text) {
    const recap = $('rt-recap'), box = $('rt-recap-box');
    recap.textContent = text;
    if (box.classList.contains('open')) { box.classList.remove('open'); requestAnimationFrame(fit); }
    $('rt-more').textContent = 'Read more';
    requestAnimationFrame(() => { $('rt-more').classList.toggle('is-hidden', recap.scrollHeight <= recap.clientHeight + 1); });
  }
  function go(i) {
    i = Math.max(0, Math.min(slots.length - 1, i));
    const slot = slots[i];
    track.scrollTo({ left: slot.offsetLeft + slot.offsetWidth / 2 - track.clientWidth / 2, behavior: 'smooth' });
  }
  async function continueReading() {
    const b = table.reading[current];
    if (!b || document.body.classList.contains('leaving')) return;
    document.body.classList.add('leaving');
    const destination = demo || !view.api ? Promise.resolve(`/library?book=${encodeURIComponent(b.bookId)}&view=book-detail`) : view.api.readerDestination(b.bookId, null);
    const [href] = await Promise.all([destination, new Promise(r => setTimeout(r, 240))]);
    location.assign(href);
  }
  track.addEventListener('scroll', () => requestAnimationFrame(layout), { passive: true });
  track.addEventListener('click', e => {
    const slot = e.target.closest('.rt-slot');
    if (!slot) return;
    if (+slot.dataset.i !== current) go(+slot.dataset.i);
    else continueReading();
  });
  $('rt-continue').addEventListener('click', e => { e.preventDefault(); continueReading(); });
  $('rt-prev').onclick = () => go(current - 1);
  $('rt-next').onclick = () => go(current + 1);
  $('rt-more').onclick = () => { const open = $('rt-recap-box').classList.toggle('open'); $('rt-more').textContent = open ? 'Show less' : 'Read more'; };
  if (!window.__library2KeysWired) {
    window.__library2KeysWired = true;
    addEventListener('keydown', e => {
      if (!document.documentElement.classList.contains('returning') || e.target.closest?.('input,textarea')) return;
      if (e.key === 'ArrowLeft') document.getElementById('rt-prev')?.click();
      if (e.key === 'ArrowRight') document.getElementById('rt-next')?.click();
    });
  }
  // Books are sized to the stage; the text block has a fixed height, so a new recap never resizes them.
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { if (!$('rt-recap-box')?.classList.contains('open')) fit(); }).observe(view.querySelector('.rt-stage'));
  else addEventListener('resize', fit);
  fit();
  const start = Math.max(0, table.reading.findIndex(b => b.bookId === keepBookId));
  if (start) { const slot = slots[start]; track.scrollLeft = slot.offsetLeft + slot.offsetWidth / 2 - track.clientWidth / 2; layout(); }
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
