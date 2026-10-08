// Tinct · Add a book: the start page. Two doors: your own book (PDF or EPUB, opened
// privately and kept privately in your account) and free public-domain books (search;
// download from the source library, then open the file here).
import { HANDOFF_PARAM, takeHandoff } from './file-handoff.js?v=20261008rel6';
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const params = new URLSearchParams(location.search);
// ?mode=file (the library's + entries, and back from a book): straight to "Your own book",
// a PDF or EPUB. The library's own search finds free books, so that door is not offered here.
const fileOnly = params.get('mode') === 'file';
if (fileOnly) { document.body.dataset.mode = 'file'; $('doorFree').hidden = true; document.querySelector('.ab-lede').hidden = true; $('abResults').hidden = true }
const LANG = { en: 'English', da: 'Danish', sv: 'Swedish', no: 'Norwegian', nb: 'Norwegian', fi: 'Finnish', de: 'German', nl: 'Dutch', fr: 'French', it: 'Italian', es: 'Spanish', pt: 'Portuguese', pl: 'Polish', la: 'Latin', el: 'Greek', hu: 'Hungarian', is: 'Icelandic' };
const SOURCE = { Gutenberg: 'Project Gutenberg', 'Standard Ebooks': 'Standard Ebooks' };
const sourceName = s => SOURCE[s] || s;
const people = list => (list || []).map(p => p.name).filter(Boolean);
const lifespan = p => p.birthYear || p.deathYear ? ` (${p.birthYear ?? '?'}–${p.deathYear ?? ''})` : '';

/* ---------- Account ---------- */
// Opening your own book needs a Tinct account; searching free books does not. Sign-in
// returns here (the app's sign-in page allows /lab/addbook/ as a return target).
const returnTo = () => '/lab/addbook/' + location.search;
const signInHref = create => `/sign-in?${create ? 'mode=create&' : ''}returnTo=${encodeURIComponent(returnTo())}`;
function renderAccount() {
  const s = window.TinctAI?.session() || {};
  $('abAccount').innerHTML = s.token
    ? `<span class="ab-who">${esc(s.name || s.email || 'Signed in')}</span>`
    : `<a href="${esc(signInHref(false))}">Sign in</a>${s.expired ? '<span class="ab-who-note">Your sign-in has expired.</span>' : ''}`;
  const member = !!s.userId;
  $('abDrop').hidden = !member;
  $('abGate').hidden = member;
  $('abCreate').href = signInHref(true);
  $('abSignIn').href = signInHref(false);
}
function showGate() {
  if ($('start').hidden) window.TinctReader?.close();
  renderAccount();
  const gate = $('abGate');
  gate.scrollIntoView({ block: 'center' });
  gate.classList.add('is-flash'); setTimeout(() => gate.classList.remove('is-flash'), 1600);
  $('abCreate').focus({ preventScroll: true });
}

/* ---------- Your own book ---------- */
const pick = () => window.TinctReader?.pickFile();
$('abDrop').addEventListener('click', pick);
$('abDrop').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick() } });
for (const ev of ['dragenter', 'dragover']) $('abDrop').addEventListener(ev, () => $('abDrop').classList.add('is-over'));
for (const ev of ['dragleave', 'drop']) $('abDrop').addEventListener(ev, () => $('abDrop').classList.remove('is-over'));

/* ---------- Your books: this device's and your account's ---------- */
const when = t => { const d = new Date(t), days = Math.round((Date.now() - t) / 86400000); return days < 1 ? 'today' : days < 2 ? 'yesterday' : days < 7 ? `${days} days ago` : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' }) };
const hue = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h };
function coverHtml(title, author, kind, small, image) {
  // The book's own cover (an EPUB's cover image, kept on this device as a data: URL).
  if (image && /^data:image\/(jpeg|png);base64,/.test(image)) return `<span class="ab-cover has-image${small ? ' is-small' : ''}" aria-hidden="true"><img src="${esc(image)}" alt=""></span>`;
  return `<span class="ab-cover${small ? ' is-small' : ''}" style="--h:${hue(title)}" aria-hidden="true"><span class="ab-cover-t">${esc(title)}</span>${author ? `<span class="ab-cover-a">${esc(author)}</span>` : ''}${kind ? `<span class="ab-cover-k">${kind.toUpperCase()}</span>` : ''}</span>`;
}
// This device's books show at once; the account's copies join when the list arrives.
let shelfRun = 0;
function drawShelf(list) {
  $('abShelf').hidden = !list.length;
  $('abBooks').innerHTML = list.map(b => `<li class="ab-book" data-key="${esc(b.key)}"${b.local ? '' : ' data-cloud-only'}>
      <button type="button" class="ab-book-open" data-open="${esc(b.key)}" aria-label="Open ${esc(b.title)}">${coverHtml(b.title, b.author, b.kind, false, b.cover)}
        <span class="ab-book-meta"><b>${esc(b.title)}</b>${b.author ? `<span>${esc(b.author)}</span>` : ''}<small>${b.kind.toUpperCase()} · ${b.openedAt ? 'opened ' + when(b.openedAt) : 'added ' + when(b.addedAt)}</small></span></button>
      <button type="button" class="ab-book-x" data-remove="${esc(b.key)}" aria-label="Remove ${esc(b.title)}">×</button>
    </li>`).join('');
}
async function renderShelf({ reveal = false } = {}) {
  const run = ++shelfRun, reader = window.TinctReader;
  if (!window.TinctAI?.session().userId || !reader) { drawShelf([]); return }
  const local = await reader.shelf();
  if (run === shelfRun) { drawShelf(local); if (reveal && local.length) $('abShelf').scrollIntoView({ block: 'nearest' }) }
  if (await reader.cloud.refresh() && run === shelfRun) { const all = await reader.shelf(); if (run === shelfRun) drawShelf(all) }
}
$('abBooks').addEventListener('click', async e => {
  const open = e.target.closest('[data-open]');
  if (open) { open.disabled = true; await window.TinctReader?.openStored(open.dataset.open); open.disabled = false; return }
  const x = e.target.closest('[data-remove]');
  if (!x) return;
  const li = x.closest('.ab-book');
  if (li.classList.contains('is-confirm')) { x.disabled = true; await window.TinctReader?.removeBook(x.dataset.remove); renderShelf(); return }
  li.classList.add('is-confirm'); x.textContent = 'Remove'; x.setAttribute('aria-label', 'Confirm: remove from this device and your account');
  setTimeout(() => { if (li.isConnected) { li.classList.remove('is-confirm'); x.textContent = '×' } }, 4000);
});

/* ---------- Find a free book ---------- */
const CHIPS = ['Pride and Prejudice', 'Dostoevsky', 'H. C. Andersen', 'Meditations', 'Origin of Species', 'Kierkegaard'];
$('abChips').innerHTML = CHIPS.map(c => `<button type="button" class="ab-chip" data-q="${esc(c)}">${esc(c)}</button>`).join('');
let worker = null, ready = false, request = 0, limit = 12, lastQuery = '', pendingQuery = null;
function startWorker() {
  if (worker) return;
  try { worker = new Worker(new URL('search-worker.js?v=20261008rel6', import.meta.url), { type: 'module' }) }
  catch { $('abCatalogStatus').textContent = 'Search is not available in this browser.'; return }
  worker.onmessage = ({ data }) => {
    if (data.type === 'ready') {
      ready = true;
      $('abCatalogStatus').textContent = `${data.total.toLocaleString('en')} free books from ${data.sources} libraries.`;
      if (params.get('work')) worker.postMessage({ type: 'get', id: params.get('work'), request: ++request });
      else if (pendingQuery != null) runSearch(pendingQuery);
    } else if (data.type === 'results' && data.request === request) renderResults(data);
    else if (data.type === 'work' && data.request === request) renderResults({ total: data.work ? 1 : 0, results: data.work ? [data.work] : [], focus: true });
    else if (data.type === 'error') $('abCatalogStatus').textContent = 'The catalogue could not be loaded. Reload the page to try again.';
  };
  worker.postMessage({ type: 'load' });
}
function runSearch(q, more) {
  lastQuery = q;
  if (!more) limit = 12;
  if (!ready) { pendingQuery = q; startWorker(); $('abResults').hidden = false; $('abResults').innerHTML = '<p class="ab-status">Loading the catalogue…</p>'; return }
  if (!q.trim()) { $('abResults').hidden = true; return }
  worker.postMessage({ type: 'search', query: q, filters: {}, limit, request: ++request });
}
$('abSearch').addEventListener('submit', e => { e.preventDefault(); runSearch($('abQuery').value) });
let typing;
$('abQuery').addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(() => runSearch($('abQuery').value), 180) });
$('abQuery').addEventListener('focus', startWorker, { once: true });
$('abChips').addEventListener('click', e => { const c = e.target.closest('[data-q]'); if (!c) return; $('abQuery').value = c.dataset.q; runSearch(c.dataset.q) });

function licenceLine(e) {
  if (!e) return '';
  return e.licence && e.licence !== 'PD' ? `Public-domain text · edition ${esc(e.licence)}` : 'Public domain';
}
function resultCard(w) {
  const e = w.editions[0] || {};
  const authors = people(w.authors), translators = people(w.translators);
  const lang = (w.language || []).filter(l => l !== 'und').map(l => LANG[l] || l).join(', ');
  const from = sourceName(e.source || '');
  const href = e.sourceUrl || e.epubUrl;
  const tinct = w.onTinct && w.tinctIds?.[0];
  return `<li class="ab-result" data-id="${esc(w.id)}">
    ${coverHtml(w.title, authors[0] || '', '', true)}
    <div class="ab-result-info">
      <h3>${esc(w.title)}</h3>
      <p class="ab-result-by">${authors.length ? esc(authors.join(', ')) + esc(lifespan(w.authors[0])) : 'Unknown author'}${translators.length ? ` · translated by ${esc(translators.join(', '))}` : ''}</p>
      <p class="ab-result-meta">${[lang, from, licenceLine(e)].filter(Boolean).map(esc).join(' · ').replace(/&amp;middot;/g, '·')}</p>
    </div>
    <div class="ab-result-acts">
      ${tinct ? `<a class="ab-btn is-go" href="/read/${encodeURIComponent(tinct)}">Read the Tinct edition</a>` : ''}
      ${href ? `<a class="ab-btn${tinct ? '' : ' is-go'}" href="${esc(href)}" target="_blank" rel="noopener" data-get="${esc(w.id)}">Get the free EPUB from ${esc(from || 'the library')} ↗</a>` : ''}
      <button type="button" class="ab-btn ab-then" data-then="${esc(w.id)}" hidden>Downloaded? Open it here</button>
    </div>
  </li>`;
}
function renderResults({ total, results, focus }) {
  const box = $('abResults');
  box.hidden = false;
  if (!results.length) { box.innerHTML = `<p class="ab-status">No free books match “${esc(lastQuery)}”. If you have the book as a PDF or EPUB, open it with <button type="button" class="ab-link" data-pick>Your own book</button>.</p>`; return }
  box.innerHTML = `<h2 class="ab-results-title">${focus ? 'Free book' : `${total.toLocaleString('en')} free book${total === 1 ? '' : 's'}`}</h2>
    <ol class="ab-result-list">${results.map(resultCard).join('')}</ol>
    ${results.length < total ? '<button type="button" class="ab-btn ab-more" data-more>Show more books</button>' : ''}
    <p class="ab-fine">Downloads come from the library that holds the book. Then open the file here: it stays private to your account.</p>`;
}
$('abResults').addEventListener('click', e => {
  if (e.target.closest('[data-more]')) { limit += 12; runSearch(lastQuery, true); return }
  if (e.target.closest('[data-pick]') || e.target.closest('[data-then]')) { pick(); return }
  const get = e.target.closest('[data-get]');
  if (get) { const then = $('abResults').querySelector(`[data-then="${CSS.escape(get.dataset.get)}"]`); if (then) then.hidden = false }
});

/* ---------- Showing and hiding ---------- */
window.TinctStart = {
  show({ shelf = false } = {}) { $('start').hidden = false; renderAccount(); scrollTo(0, 0); renderShelf({ reveal: shelf }) },
  hide() { $('start').hidden = true },
  showGate,
};
function boot() {
  // One book's address (/lab/addbook/?userBook=<hex>: a PDF read here, the library's and the
  // book switcher's links, a reload): that book, at its place; no start page, no catalogue.
  const hex = window.TinctReader.urlHex();
  if (hex) { renderAccount(); void window.TinctReader.openFromUrl(hex); return }
  // Back from the Tinct reader: /lab/addbook/#books shows Your books.
  const toShelf = location.hash === '#books';
  if (toShelf) history.replaceState(null, '', location.pathname + location.search);
  renderAccount(); renderShelf({ reveal: toShelf });
  // A file chosen in the library's "Add a PDF or EPUB" pop-up: the same steps as one chosen here.
  if (fileOnly && params.has(HANDOFF_PARAM)) {
    params.delete(HANDOFF_PARAM);
    history.replaceState(history.state, '', location.pathname + (params.toString() ? '?' + params : '') + location.hash);
    void takeHandoff().then(file => { if (file) window.TinctReader.chooseFile(file) });
  }
  // The file step: the file picker (or, signed out, the account gate) has the focus; no catalogue is loaded.
  if (fileOnly) { if (!toShelf) ($('abDrop').hidden ? $('abCreate') : $('abDrop')).focus({ preventScroll: true }); return }
  const q = params.get('q');
  if (q) { $('abQuery').value = q; runSearch(q) } else if (params.get('work')) { startWorker(); $('abResults').hidden = false; $('abResults').innerHTML = '<p class="ab-status">Finding the book…</p>' }
  else if ('requestIdleCallback' in window) requestIdleCallback(startWorker, { timeout: 4000 }); else setTimeout(startWorker, 1500);
}
if (window.TinctReader) boot(); else addEventListener('tinct-reader-ready', boot, { once: true });
addEventListener('storage', e => { if (/^sb-.*-auth-token$/.test(e.key || '')) { renderAccount(); renderShelf() } });
