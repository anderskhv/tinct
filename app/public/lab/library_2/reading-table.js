// Returning readers: the hero becomes a reading table with the reader's own
// books. Data and rules come from the production library
// (/lab/library-2-reading.js, src/libraryTwoReading.ts); this file only draws.
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Sample shelf for ?demo=reading, so the view can be seen on a device with no reading history.
const DEMO = {
  mode: 'returning',
  reading: [
    { bookId: 'crime-and-punishment', title: 'Crime and Punishment', cover: '/covers/v2/crime-and-punishment.webp', wordCount: 211000, chapterLabel: 'Part One · Chapter 4', headline: 'You’re in the middle of Part One, Chapter 4', percent: 18, recap: 'Raskolnikov has read his mother’s letter: Dunya is to marry the calculating Luzhin to secure his future. Furious at the sacrifice, he wanders the city and, on the boulevard, tries to protect a drunk young girl from a man following her.', continueHref: '/library?book=crime-and-punishment&view=book-detail' },
    { bookId: 'frankenstein', title: 'Frankenstein', cover: '/covers/v2/frankenstein.webp', wordCount: 75000, chapterLabel: 'Chapter 7', headline: 'You’re in the middle of Chapter 7', percent: 42, recap: 'Victor returns to Geneva after William’s murder. In the storm near Plainpalais he glimpses the creature and becomes certain it is the killer — but Justine, the family’s servant, has been accused and will stand trial.', continueHref: '/library?book=frankenstein&view=book-detail' },
    { bookId: 'meditations', title: 'Meditations', cover: '/covers/v2/meditations.webp', wordCount: 45000, chapterLabel: 'Book Four', headline: 'You’re at the start of Book Four', percent: 63, recap: null, continueHref: '/library?book=meditations&view=book-detail' },
  ],
  finished: [
    { bookId: 'pride-and-prejudice', title: 'Pride and Prejudice', cover: '/covers/v2/pride-and-prejudice.webp', finishedAt: Date.now() - 40 * 864e5 },
    { bookId: 'the-prince', title: 'The Prince', cover: '/covers/v2/the-prince.webp', finishedAt: Date.now() - 120 * 864e5 },
  ],
};

const thickness = book => Math.round(Math.max(12, Math.min(40, (book.wordCount || 90000) / 300 / 13)));
const monthName = at => (at ? new Date(at).toLocaleString('en', { month: 'long' }) : null);

function markup(table) {
  const books = table.reading.map((b, i) => `
    <div class="rt-slot" data-i="${i}" style="--p:${Math.max(3, Math.min(97, b.percent ?? 50))}%">
      <div class="rt-book" style="--t:${thickness(b)}px;--dz:${-Math.round(thickness(b) * (b.percent ?? 50) / 100) - 1}px">
        <div class="rt-back"></div>
        <div class="rt-pages"><i class="rt-leaf"></i><i class="rt-fore"></i><i class="rt-head"></i><i class="rt-mark"></i></div>
        <div class="rt-cover"><img src="${esc(b.cover)}" alt="${esc(b.title)}" decoding="async"></div>
      </div>
    </div>`).join('');
  return `
    <p class="rt-greet" id="rt-greet"></p>
    <div class="rt-stage"><div class="rt-track" id="rt-track">${books}</div>
      <div class="rt-arrows"><button id="rt-prev" aria-label="Previous book">‹</button><button id="rt-next" aria-label="Next book">›</button></div></div>
    <div class="rt-info"><div class="rt-fade" id="rt-info">
      <h1 id="rt-title"></h1>
      <p class="rt-meta"><span id="rt-place"></span><span id="rt-pct"></span></p>
      <div class="rt-recap"><small>Where you left off</small><p id="rt-recap"></p><button id="rt-more" hidden>Read more</button></div>
    </div>
    <a class="rt-continue read-button" id="rt-continue" href="#">Continue<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h20m-6-6 6 6-6 6"/></svg></a></div>`;
}

export async function mountReadingTable({ hero, shelves, el }) {
  const demo = new URLSearchParams(location.search).get('demo') === 'reading';
  let table, summaryFor = async () => ({ status: 'none', text: null });
  if (demo) table = DEMO;
  else {
    try {
      await import('/lab/library-2-reading.js');
      const api = window.__tinctLibraryTwoReading;
      table = await api.loadReadingTable();
      summaryFor = api.summaryFor;
    } catch {
      return false;
    }
  }
  if (table.mode !== 'returning' || !table.reading.length) {
    if (table.finished.length) addFinishedShelf(table.finished, shelves, el);
    return false;
  }
  const view = document.createElement('div');
  view.className = 'reading-table';
  view.innerHTML = markup(table);
  hero.append(view);
  document.body.classList.add('returning');
  if (table.finished.length) addFinishedShelf(table.finished, shelves, el);

  const h = new Date().getHours();
  $('rt-greet').textContent = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const track = $('rt-track'), slots = [...track.children];
  let current = -1, cw = 150, summaryTimer = null;

  function fit() {
    const stage = view.querySelector('.rt-stage').getBoundingClientRect(), desk = innerWidth >= 900;
    const room = desk ? stage.height - 44 : stage.height;
    const ch = Math.max(120, Math.min(desk ? Math.min(420, room * 0.82) : 330, room - 36));
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
      slot.firstElementChild.style.transform = `rotateX(${-20 * (1 - a)}deg) rotateY(${-30 * (1 - a) - t * 14}deg) scale(${1 - a * 0.16})`;
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
    const set = () => {
      $('rt-title').textContent = b.title;
      $('rt-place').textContent = b.chapterLabel;
      $('rt-pct').textContent = b.percent == null ? '' : b.percent > 0 && b.percent < 1 ? '<1%' : `${Math.round(b.percent)}%`;
      setRecap(b.recap || b.headline + '.');
      $('rt-continue').href = b.continueHref;
    };
    if (first) set();
    else { $('rt-info').classList.add('out'); setTimeout(() => { set(); $('rt-info').classList.remove('out'); }, 180); }
    clearTimeout(summaryTimer);
    if (!b.recap) {
      // The "so far" summary follows the production rules; scrolling past a book only reads the cache.
      summaryFor(b.bookId, { request: false }).then(r => { if (r.text && current === index) setRecap(r.text); });
      summaryTimer = setTimeout(() => summaryFor(b.bookId, { request: true }).then(r => { if (r.text && current === index) setRecap(r.text); }), 900);
    }
  }
  function setRecap(text) {
    const recap = $('rt-recap');
    recap.textContent = text;
    recap.parentElement.classList.remove('open');
    $('rt-more').textContent = 'Read more';
    requestAnimationFrame(() => { $('rt-more').hidden = recap.scrollHeight <= recap.clientHeight + 1; });
  }
  function go(i) {
    i = Math.max(0, Math.min(slots.length - 1, i));
    const slot = slots[i];
    track.scrollTo({ left: slot.offsetLeft + slot.offsetWidth / 2 - track.clientWidth / 2, behavior: 'smooth' });
  }
  track.addEventListener('scroll', () => requestAnimationFrame(layout), { passive: true });
  track.addEventListener('click', e => {
    const slot = e.target.closest('.rt-slot');
    if (!slot) return;
    if (+slot.dataset.i !== current) go(+slot.dataset.i);
    else location.assign(table.reading[current].continueHref);
  });
  $('rt-prev').onclick = () => go(current - 1);
  $('rt-next').onclick = () => go(current + 1);
  $('rt-more').onclick = () => { const open = $('rt-recap').parentElement.classList.toggle('open'); $('rt-more').textContent = open ? 'Show less' : 'Read more'; };
  addEventListener('keydown', e => { if (!document.body.classList.contains('returning') || e.target.closest?.('input,textarea')) return; if (e.key === 'ArrowLeft') go(current - 1); if (e.key === 'ArrowRight') go(current + 1); });
  // The hero settles its height after mount (landing fit, fonts); size the books to the space it leaves.
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(view.querySelector('.rt-stage'));
  else addEventListener('resize', fit);
  fit();
  return true;
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
