// The Conjecture Institute link (tinct.app/conjecture, approved mockup 26 Nov 2026): the library with its
// five books on the hero's table. Their logo, then the chosen book's author, title, description and
// chips; the big cover is the button that opens it; a strip of the five covers changes which one stands.
// The rest of the library follows below as usual. The Worker serves /conjecture as the library page with
// its own preview (src/worker/routes/seo.ts serveConjecturePage); boot.js marks the page and keeps the
// returning reader's desk off this hero.

/** The five books, in the order the strip shows them (bookRegistry.ts CONJECTURE_BOOKS). */
export const CONJECTURE_IDS = ['the-sovereign-child', 'lords-of-the-cosmos', 'bold-conjectures-volume-1', 'bold-conjectures-volume-2', 'the-farthest-reaches'];
/** The book a visitor without a Conjecture book in progress meets first. */
export const CONJECTURE_DEFAULT = 'bold-conjectures-volume-1';
export const CONJECTURE_LOGO = '/brand/conjecture/conjecture-institute-cream.png';

/** Whether an address asks for the Conjecture library: /conjecture, or /library?collection=conjecture. */
export function isConjectureAddress(pathname, search = '') {
  if (/^\/conjecture\/?$/.test(String(pathname || ''))) return true;
  return /^\/library\/?$/.test(String(pathname || '')) && new URLSearchParams(search).get('collection') === 'conjecture';
}

/**
 * The book the hero opens on. Signed out: Bold Conjectures, Volume I. Signed in: the Conjecture book read
 * most recently, from the library's reading list (libraryTwoReading.ts loadReadingTable: newest first; a
 * row's lastActiveAt, when it has one, decides), else Bold Conjectures, Volume I.
 */
export function conjectureOpening({ signedIn = false, reading = [] } = {}) {
  if (!signedIn || !Array.isArray(reading)) return CONJECTURE_DEFAULT;
  let best = null;
  reading.forEach((row, index) => {
    if (!row || !CONJECTURE_IDS.includes(row.bookId)) return;
    const at = typeof row.lastActiveAt === 'number' && Number.isFinite(row.lastActiveAt) ? row.lastActiveAt : null;
    if (!best) { best = { id: row.bookId, at, index }; return; }
    if (at !== null && (best.at === null || at > best.at)) best = { id: row.bookId, at, index };
  });
  return best ? best.id : CONJECTURE_DEFAULT;
}

/** A started book's row in the reading list, for a signed-in reader only. */
export function conjectureProgress(reading, bookId) {
  if (!Array.isArray(reading)) return null;
  const row = reading.find(r => r && r.bookId === bookId);
  if (!row) return null;
  const percent = typeof row.percent === 'number' && Number.isFinite(row.percent) ? Math.max(0, Math.min(100, row.percent)) : null;
  const chapter = typeof row.chapterLabel === 'string' ? row.chapterLabel.trim() : '';
  if (!chapter && percent === null) return null;
  return { chapter, percent };
}

/** "Chapter 4 · 31% read": the gold chip of a book in progress. */
export function progressChipLabel(progress) {
  if (!progress) return '';
  const { chapter, percent } = progress;
  const read = percent === null ? '' : `${percent > 0 && percent < 1 ? '<1' : Math.round(percent)}% read`;
  return [chapter, read].filter(Boolean).join(' · ');
}

function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }

/**
 * Draw the Conjecture hero into the library's hero section.
 * books: [{ id, title, author, summary, cover, readingTime }] in strip order (missing books are left out).
 * signedIn(): whether the page is signed in. open(book): open the book in the reader (app.js openInReader:
 * the reader's saved place, else chapter 1).
 */
export function mountConjectureHero({ hero, books, signedIn, open }) {
  const shown = CONJECTURE_IDS.map(id => books.find(b => b.id === id)).filter(Boolean);
  if (!shown.length) return null;
  hero.setAttribute('aria-label', 'Conjecture Institute books');
  const root = el('div', 'conj');
  const stage = el('div', 'conj-stage');
  const heading = el('h1', 'conj-logo');
  const logo = el('img');
  logo.src = CONJECTURE_LOGO; logo.alt = 'Conjecture Institute'; logo.width = 960; logo.height = 290; logo.decoding = 'async';
  heading.append(logo);
  const sel = el('div', 'conj-sel');
  const author = el('p', 'conj-author'), title = el('h2', 'conj-title'), desc = el('p', 'conj-desc'), chips = el('div', 'conj-chips');
  sel.append(author, title, desc, chips);
  const big = el('button', 'conj-big'); big.type = 'button';
  const bigImg = el('img'); bigImg.alt = ''; bigImg.decoding = 'async'; bigImg.fetchPriority = 'high';
  big.append(bigImg);
  stage.append(heading, big, sel);
  const strip = el('div', 'conj-strip'); strip.setAttribute('role', 'group'); strip.setAttribute('aria-label', 'Choose a Conjecture Institute book');
  const thumbs = shown.map(book => {
    const b = el('button', 'conj-th'); b.type = 'button'; b.dataset.book = book.id;
    b.setAttribute('aria-label', `${book.title}, by ${book.author}`);
    const img = el('img'); img.alt = ''; img.src = book.cover; img.decoding = 'async'; img.loading = 'eager';
    const bar = el('i', 'conj-pb'); bar.setAttribute('aria-hidden', 'true'); bar.append(el('b'));
    b.append(img, bar);
    b.addEventListener('click', () => { chosenByReader = true; select(book.id); });
    strip.append(b);
    return b;
  });
  root.append(stage, strip);
  hero.append(root);

  let current = null, reading = [], chosenByReader = false;
  const progressFor = id => signedIn() ? conjectureProgress(reading, id) : null;
  function select(id) {
    const book = shown.find(b => b.id === id) || shown.find(b => b.id === CONJECTURE_DEFAULT) || shown[0];
    current = book;
    const progress = progressFor(book.id);
    author.textContent = book.author;
    title.textContent = book.title;
    desc.textContent = book.summary || '';
    chips.replaceChildren();
    if (book.readingTime) chips.append(el('span', 'conj-chip', book.readingTime));
    const label = progressChipLabel(progress);
    if (label) chips.append(el('span', 'conj-chip is-progress', label));
    if (bigImg.getAttribute('src') !== book.cover) bigImg.src = book.cover;
    big.dataset.book = book.id;
    big.setAttribute('aria-label', `${progress ? 'Continue' : 'Open'} ${book.title}`);
    thumbs.forEach(t => { const on = t.dataset.book === book.id; t.classList.toggle('is-on', on); t.setAttribute('aria-pressed', String(on)); });
  }
  function paintProgress() {
    thumbs.forEach(t => {
      const p = progressFor(t.dataset.book);
      const bar = t.querySelector('.conj-pb');
      bar.hidden = !p || p.percent === null;
      bar.firstChild.style.width = p && p.percent !== null ? `${Math.max(4, p.percent)}%` : '0';
    });
  }
  big.addEventListener('click', () => { if (current) open(current); });
  select(conjectureOpening({ signedIn: signedIn(), reading }));
  paintProgress();
  return {
    root,
    big,
    get current() { return current; },
    /** The library's reading list arrived or changed (library2:reading). */
    setReading(rows) {
      reading = Array.isArray(rows) ? rows : [];
      paintProgress();
      select(chosenByReader ? current.id : conjectureOpening({ signedIn: signedIn(), reading }));
    },
    /** Arrow keys and swipes (hero-navigation.js): the next or previous book in the strip. */
    move(direction) {
      const i = shown.indexOf(current);
      const next = shown[(i + direction + shown.length) % shown.length];
      chosenByReader = true;
      select(next.id);
      if (strip.contains(document.activeElement)) thumbs[shown.indexOf(next)].focus();
    },
  };
}
