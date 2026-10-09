'use strict';
// Tinct · Add a book: the reader for a book of your own (PDF or EPUB), on tinct.app.
// Ported from the BYOB demo. The file is kept in this browser and, signed in, as a private
// copy in the reader's Tinct account; only what the reader asks about (a passage, a page's
// text) goes to Tinct's companion, on their Tinct account.
const BUILD = document.documentElement.dataset.build || 'dev';
const $ = id => document.getElementById(id);
const root = document.querySelector('.lab');
const STORE_PREFIX = 'tinct-addbook:';
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(STORE_PREFIX + k)) } catch { return null } },
  set(k, v) { try { localStorage.setItem(STORE_PREFIX + k, JSON.stringify(v)) } catch {} },
  del(k) { try { localStorage.removeItem(STORE_PREFIX + k) } catch {} },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TRIM = { x: 0.08, y: 0.04 };
const state = { kind: null, figs: new Map(), pdf: null, epub: null, key: '', name: '', title: '', author: '', scan: null, titleReady: null, pages: [], zoom: 1, trim: false, base: { w: 612, h: 792 }, token: 0, observer: null, texts: new Map() };
const hasBook = () => !!(state.pdf || state.epub);
const isEpub = () => state.kind === 'epub';
const prefs = Object.assign({ trim: false, full: false, rate: 1, voice: '', dockW: 380, dock: 'docked' }, store.get('prefs') || {});
// "Dark pages" and "Paper tone" were PDF-only switches; the page now follows the reader's theme.
delete prefs.dark; delete prefs.tone;
const savePrefs = () => store.set('prefs', prefs);

/* ---------- Layout: Tinct's phone/desktop classes ---------- */
function applyLayout() {
  const phone = innerWidth < 700;
  root.classList.toggle('is-phone', phone); root.classList.toggle('has-phone-chrome', phone); root.classList.toggle('has-reader-controls', phone);
  root.classList.toggle('is-desktop', !phone); root.classList.toggle('has-page-buttons', !phone);
  root.dataset.labLayout = phone ? 'phone' : 'desktop';
  document.documentElement.style.setProperty('--pdf-top', Math.ceil($('hdr').getBoundingClientRect().bottom) + 'px');
  applyTheme();
}
const isPhone = () => root.classList.contains('is-phone');

/* ---------- Theme: the reader's own (js/pdf-theme.js) ---------- */
// Light, Book and Dark are the reader's setting for this layout (phone or desktop), e-ink the
// device's display profile. The whole viewer follows it: the top bar, menus and sheets through
// Tinct's own classes (is-night, is-book-theme), the pages through data-pdf-theme (css/reader.css)
// and, in Dark, pages recoloured as they are drawn (renderPage).
const Theme = window.TinctPdfTheme;
let pageTheme = 'light';
const systemDark = matchMedia('(prefers-color-scheme: dark)');
function readTheme() {
  let raw = null, profile = null;
  try { raw = localStorage.getItem(Theme.PREFS_KEY); profile = localStorage.getItem(Theme.PROFILE_KEY) } catch {}
  const eink = document.documentElement.hasAttribute('data-eink') || Theme.readEink(location.search, profile);
  return Theme.resolveTheme(raw, isPhone() ? 'phone' : 'desktop', systemDark.matches, eink);
}
function themeHost(el, theme) {
  el.classList.toggle('is-night', theme === 'dark');
  el.classList.toggle('is-book-theme', theme === 'book');
  el.dataset.theme = theme === 'dark' ? 'dark' : 'light';
}
function applyTheme() {
  const theme = readTheme(), before = pageTheme;
  pageTheme = theme;
  themeHost(root, theme);
  document.querySelectorAll('.byob-sheet-host').forEach(h => themeHost(h, theme));
  document.documentElement.dataset.pdfTheme = theme;
  document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  // Pages drawn for the other kind of paper are drawn again.
  if ((before === 'dark') !== (theme === 'dark')) for (const p of state.pages) if (p.canvas && p.kind !== 'epub') { p.renderedWidth = 0; if (isNear(p)) renderPage(p) }
}
function setTheme(theme) {
  let raw = null;
  try { raw = localStorage.getItem(Theme.PREFS_KEY) } catch {}
  const next = Theme.withTheme(raw, isPhone() ? 'phone' : 'desktop', theme);
  try {
    if (next) localStorage.setItem(Theme.PREFS_KEY, next);
    // Choosing a theme leaves the e-ink profile, as in the reader's Settings.
    if (localStorage.getItem(Theme.PROFILE_KEY) === 'eink') localStorage.setItem(Theme.PROFILE_KEY, 'normal');
  } catch {}
  document.documentElement.removeAttribute('data-eink');
  applyTheme();
}
addEventListener('storage', e => { if (e.key === Theme.PREFS_KEY || e.key === Theme.PROFILE_KEY) applyTheme() });
addEventListener('tinct:display-profile', () => applyTheme());
systemDark.addEventListener?.('change', () => applyTheme());
const isNear = p => { const r = p.sheet.getBoundingClientRect(); return r.bottom > -innerHeight * 1.5 && r.top < innerHeight * 2.5 };

/* ---------- Your books ---------- */
// Keeping, naming and saving a file is the engine shared with the library's My shelf
// (add-engine.js): this page reads PDFs, and EPUBs leave for the Tinct reader.
const engine = window.TinctAddEngine;
const { owner, library, cloud, shelf, RIGHTS_COPY, accountId } = engine;
const saveToAccount = (key, file, meta, options = {}) => engine.saveToAccount(key, file, meta, { notify: toast, ...options });
const removeBook = key => engine.removeBook(key, { notify: toast });
// Opening your own file needs a Tinct account (searching free books does not). The
// rights confirmation (add-engine.js) is asked once per account, before its first file opens.
function needsAccount() {
  if (accountId()) return false;
  window.TinctStart?.showGate?.();
  return true;
}
// Shown over whichever view is in front: the start page (a pop-up over it) or the reader.
function attest(fileName) {
  return new Promise(resolve => {
    const layer = sheet('Your own book', `
      <div class="byob-attest">
        <p>Tinct opens <strong>${esc(fileName)}</strong> here and keeps a private copy in your account, so you can open it on your other devices. It is never shared.</p>
        <label><input type="checkbox" id="attestBox"> <span>${esc(RIGHTS_COPY)}</span></label>
        <div class="actions"><button type="button" id="attestCancel">Cancel</button><button type="button" class="primary" id="attestOk" disabled>Continue</button></div>
      </div>`, () => resolve(false), readerShown() ? root : startHost());
    layer.querySelector('.lab-v2-sheet').classList.add('byob-dialog');
    const box = layer.querySelector('#attestBox'), ok = layer.querySelector('#attestOk');
    box.onchange = () => { ok.disabled = !box.checked };
    layer.querySelector('#attestCancel').onclick = () => { closeSheet(layer); resolve(false) };
    ok.onclick = () => { closeSheet(layer); resolve(true) };
  });
}
async function chooseFile(file) {
  if (!file || needsAccount()) return;
  const read = await engine.readFile(file);
  if (read.error) { toast(read.error); return }
  const { kind, bytes, key } = read;
  if (!engine.rightsConfirmed()) {
    if (!await attest(file.name)) return;
    engine.confirmRights();
  }
  stopNarration();
  const saved = await engine.keepFile(file, read, TinctPdfScan.cleanFileName(file.name));
  if (!saved) toast('This browser could not keep a copy, so you will need to open the file again next time.');
  // An EPUB reads in the Tinct reader, which opens it from this browser's copy.
  if (kind === 'epub' && saved) { await openInTinct(bytes, file.name, key, file); return }
  await openBook(kind, bytes, file.name, key);
  sendAccountCopy(key, file, { kind, name: file.name });
}
async function openStored(key) {
  if (needsAccount()) return false;
  let rec = await library.get(key);
  if (!rec) {
    // On the account but not on this device yet: download it, then keep it here too.
    const remote = cloud.get(key);
    if (!remote) { toast('That book is no longer on this device. Open the file again.'); return false }
    let bytes;
    try { bytes = await window.TinctAI.books.download(remote.id) }
    catch (e) {
      if (e?.code === 'not_found') { cloud.mine().delete(key); toast('That book is no longer in your account.') }
      else toast('That book could not be downloaded. Try again.');
      return false;
    }
    const now = Date.now();
    rec = { key, kind: remote.type, name: remote.name || remote.title, size: bytes.byteLength, title: remote.title || remote.name, author: remote.author || '', owner: owner(), addedAt: Date.parse(remote.createdAt) || now, openedAt: now, cloudId: remote.id, bytes: bytes.buffer };
    if (!await library.put(rec)) toast('This browser could not keep a copy, so you will need to open the file again next time.');
  } else await library.touch(key, { openedAt: Date.now() });
  // Opened before it reached the account (offline, or the sign-in had lapsed): save it now.
  const pending = !rec.cloudId && cloud.usable() ? new Blob([rec.bytes]) : null;
  if (rec.kind === 'epub' && await library.get(key)) { await openInTinct(new Uint8Array(rec.bytes), rec.name, key, pending, { quiet: true }); return true }
  await openBook(rec.kind, new Uint8Array(rec.bytes), rec.name, key);
  if (!pending) return true;
  // A PDF just added on My shelf (add-engine preparePdf) reaches the account here, named like a
  // file chosen on this page: by the document's own title, once the scan has read it (briefly).
  const fresh = Date.now() - (rec.addedAt || 0) < 2 * 60 * 1000;
  sendAccountCopy(key, pending, { kind: rec.kind, name: rec.name }, { quiet: !fresh });
  return true;
}
// The open PDF's account copy, named by the document's own title: sent once the scan has read
// it (briefly), or at once when the reader leaves the book. Leaving waits for it (bounded, as an
// EPUB's copy is waited for: add-engine ACCOUNT_COPY_WAIT_MS), so the way back never cuts a copy
// off and the book is on the reader's other devices too.
const accountCopy = { sending: null, now: null };
function sendAccountCopy(key, file, meta, options) {
  const leaving = new Promise(r => { accountCopy.now = r });
  const sending = (async () => {
    if (state.titleReady) await Promise.race([state.titleReady, new Promise(r => setTimeout(r, 5000)), leaving]);
    if (hasBook() && state.key === key) await saveToAccount(key, file, { ...meta, title: state.title, author: state.author }, options);
  })();
  accountCopy.sending = sending;
  sending.finally(() => { if (accountCopy.sending === sending) Object.assign(accountCopy, { sending: null, now: null }) });
  return sending;
}
async function accountCopySent() {
  if (!accountCopy.sending) return;
  accountCopy.now?.();
  await Promise.race([accountCopy.sending, new Promise(r => setTimeout(r, engine.ACCOUNT_COPY_WAIT_MS))]);
}
// EPUBs open in the Tinct reader (/reader?userBook=<hex>), which reads the file from
// this browser's copy and converts it to Tinct's own pages. Here: refuse what it cannot
// open (DRM, not an EPUB), name the book on the shelf, and send the account copy before
// leaving the page (bounded: a slow upload finishes on the next open).
async function openInTinct(bytes, name, key, upload, { quiet = false } = {}) {
  const token = ++state.token;
  showReader();
  closeAllPopups();
  $('column').innerHTML = '<div class="pdf-status" role="status">Opening…</div>';
  let opened;
  try { opened = await engine.prepareEpub(bytes, name, key, upload, { quiet, notify: toast }) }
  catch (e) { if (token === state.token) $('column').innerHTML = `<div class="pdf-status" role="alert">${esc(e.message)}</div>`; return }
  if (token !== state.token) return;
  leftForTinct = true;
  location.assign(opened.href);
}
// Back from the reader may restore this page as it was left ("Opening…"): show Your books.
let leftForTinct = false;
addEventListener('pageshow', e => { if (e.persisted && leftForTinct) { leftForTinct = false; closeBook({ toShelf: true }) } });
async function openBook(kind, bytes, name, key) {
  showReader();
  if (kind === 'epub') await openEpub(bytes, name, key); else await openPdf(bytes, name, key);
  if (hasBook()) {
    library.touch(key, { title: state.title, author: state.author || '' });
    // A PDF is a book with its own address (/lab/addbook/?userBook=<hex>): a reload, the
    // library and the book switcher open it again at its place.
    const url = kind === 'pdf' ? bookUrl(key) : null;
    if (url) { if (location.pathname + location.search !== url) history.pushState({ addbookReader: key }, '', url) }
    else if (location.hash !== '#read') history.pushState({ addbookReader: key }, '', '#read');
  }
}
const hexOf = key => String(key).slice(String(key).indexOf(':') + 1);
const bookUrl = key => '/lab/addbook/?userBook=' + encodeURIComponent(hexOf(key));
const urlHex = () => { const v = new URLSearchParams(location.search).get('userBook'); return /^[0-9a-f]{8,64}$/.test(v || '') ? v : null };
// The library's My shelf, where the reader's own books are (the back arrow of every own book).
const SHELF_URL = '/library#my-shelf';
let leavingToShelf = false;
async function leaveToShelf() {
  if (leavingToShelf) return;
  leavingToShelf = true;
  leavePlace(); stopNarration();
  await accountCopySent();
  location.assign(SHELF_URL);
}
// Back on this page from My shelf (restored as it was left): the way back works again.
addEventListener('pageshow', () => { leavingToShelf = false });
// /lab/addbook/?userBook=<hex>: this book, from this device, else from the account.
async function openFromUrl(hex) {
  if (needsAccount()) return false;
  showReader();
  $('column').innerHTML = '<div class="pdf-status" role="status">Opening…</div>';
  for (const kind of ['pdf', 'epub']) if (await library.get(kind + ':' + hex)) return openStored(kind + ':' + hex);
  await cloud.refresh();
  for (const kind of ['pdf', 'epub']) if (cloud.get(kind + ':' + hex)) return openStored(kind + ':' + hex);
  $('column').innerHTML = `<div class="pdf-status" role="alert">That book is no longer on this device or in your account. <a href="${SHELF_URL}">Go to My shelf</a></div>`;
  return false;
}
$('fileInput').onchange = e => { chooseFile(e.target.files[0]); e.target.value = '' };
$('bookBtn').onclick = () => openSwitcher();
let dragDepth = 0;
addEventListener('dragenter', e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { dragDepth++; $('drop').hidden = false } });
addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; $('drop').hidden = true } });
addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', e => { e.preventDefault(); dragDepth = 0; $('drop').hidden = true; if (e.target.closest?.('.lab-ask')) return; chooseFile(e.dataTransfer?.files?.[0]) });

/* ---------- Reader ↔ start page ---------- */
const readerShown = () => document.body.dataset.view === 'reader';
function showReader() { document.body.dataset.view = 'reader'; $('root').hidden = false; window.TinctStart?.hide(); applyLayout() }
async function closeBook({ fromHistory = false, toShelf = false } = {}) {
  const hadBook = hasBook();
  closeChat(); stopNarration(); closeAllPopups(); endSnip?.();
  ++state.token;
  state.observer?.disconnect(); state.pdf?.destroy?.();
  Object.assign(state, { kind: null, pdf: null, epub: null, pages: [], lastPlace: null, key: '', name: '', title: '', author: '', scan: null, titleReady: null, texts: new Map(), figs: new Map() }); toc.entries = []; toc.ready = false;
  if (window.CSS?.highlights) for (const [k] of HL_COLORS) CSS.highlights.delete('tinct-hl-' + k);
  chat.turns = []; chat.passage = null; chat.attach = [];
  $('column').innerHTML = '';
  document.body.dataset.view = 'start'; $('root').hidden = true;
  document.title = 'Add a book · Tinct';
  if (!fromHistory && location.hash === '#read') history.back();
  else if (!fromHistory && hadBook && urlHex()) history.replaceState(null, '', location.pathname);
  window.TinctStart?.show({ shelf: toShelf });
}
// Back to library: the start page, with "Your books" in view.
$('backBtn').onclick = () => leaveToShelf();
addEventListener('popstate', () => {
  if (!hasBook()) return;
  const hex = urlHex();
  if (hex && hex !== hexOf(state.key)) { closeBook({ fromHistory: true }); openFromUrl(hex); return }
  if (!hex && location.hash !== '#read') closeBook({ fromHistory: true });
});
window.TinctReader = { chooseFile, openStored, openFromUrl, urlHex, close: closeBook, library, cloud, shelf, removeBook, pickFile: () => { if (!needsAccount()) $('fileInput').click() } };

/* ---------- EPUB ---------- */
async function openEpub(bytes, name, key) {
  const token = ++state.token;
  closeAllPopups();
  $('column').innerHTML = '<div class="pdf-status" role="status">Opening…</div>';
  let book;
  try { book = await TinctEpub.parse(bytes, { fallbackTitle: name.replace(/\.epub$/i, ''), onProgress: f => { const s = $('column').querySelector('.pdf-status'); if (s) s.textContent = `Opening… ${Math.round(f * 100)}%` } }) }
  catch (e) { $('column').innerHTML = `<div class="pdf-status" role="alert">${esc(e?.code === 'drm' || e?.code === 'unsupported' || e?.code === 'bad_epub' || e?.code === 'not_zip' ? e.message : 'This file could not be opened as an EPUB. Choose another file.')}</div>`; return }
  if (token !== state.token) return;
  state.pdf?.destroy?.(); state.observer?.disconnect();
  Object.assign(state, { kind: 'epub', epub: book, pdf: null, key, title: book.title, author: book.authors.join(', '), texts: new Map(), pages: [] });
  root.classList.add('is-epub'); root.classList.remove('is-pdf');
  const saved = store.get('pos:' + state.key);
  state.zoom = saved?.zoom || 1;
  state.lastPlace = saved?.page ? { page: saved.page, frac: saved.frac || 0 } : { page: 1, frac: 0 };
  $('bookTitle').textContent = state.title;
  $('bookBtn').setAttribute('aria-label', `Contents of ${state.title}`);
  document.title = `${state.title} · Tinct`;
  $('column').innerHTML = '';
  applyEpubScale();
  for (const c of book.chapters) {
    const sheet = document.createElement('section');
    sheet.className = 'epub-sheet'; sheet.dataset.page = c.index + 1;
    const pg = document.createElement('div'); pg.className = 'pg epub-pg'; pg.lang = book.language || 'en';
    pg.appendChild(c.node);
    sheet.appendChild(pg);
    $('column').appendChild(sheet);
    state.pages.push({ n: c.index + 1, sheet, pg, kind: 'epub' });
    state.texts.set(c.index + 1, { text: c.text, items: [] });
  }
  toc.entries = book.toc.slice().sort((a, b) => a.page - b.page || 0);
  toc.ready = true;
  noteSession();
  renderEpubHighlights();
  if (!isPhone() && prefs.dock !== 'closed') setTimeout(() => { if (hasBook() && !chat.el?.isConnected) openChat({ quiet: true }) }, 50);
  requestAnimationFrame(() => { if (saved) goTo({ page: saved.page, frac: saved.frac }); else $('scroll').scrollTop = 0; onScroll() });
}
function applyEpubScale() { root.style.setProperty('--epub-scale', String(state.zoom)) }
// Links inside the book move within it.
$('column').addEventListener('click', e => {
  const a = e.target.closest?.('a[data-chapter]'); if (!a) return;
  e.preventDefault();
  const el = a.dataset.anchor && document.getElementById(a.dataset.anchor);
  if (el) { const s = $('scroll'); s.scrollTo({ top: s.scrollTop + el.getBoundingClientRect().top - s.getBoundingClientRect().top - 24 }) }
  else goTo({ page: Number(a.dataset.chapter) + 1, frac: 0 });
});

/* ---------- PDF ---------- */
async function openPdf(bytes, name, key) {
  const token = ++state.token;
  closeAllPopups();
  $('column').innerHTML = '<div class="pdf-status" role="status">Opening…</div>';
  // Asked while the file opens: a place read later on another device of the account.
  const synced = placeSync.reconcile(key);
  let pdf;
  try { pdf = await pdfjsLib.getDocument({ data: bytes, isEvalSupported: false }).promise }
  catch (e) { $('column').innerHTML = `<div class="pdf-status" role="alert">${e?.name === 'PasswordException' ? 'This PDF is password-protected, so it cannot be opened here.' : 'This file could not be opened as a PDF. Choose another file.'}</div>`; return }
  if (token !== state.token) return;
  state.pdf?.destroy?.();
  furniture.clear();
  // The scan (js/pdf-scan.js) kept with the book is used while it is of the current version;
  // until a new scan has read the title, the book's stored name stands in.
  const rec = await library.get(key);
  const scan = TinctPdfScan.current(rec?.scan) ? rec.scan : null;
  Object.assign(state, { kind: 'pdf', pdf, epub: null, key, name, title: scan?.title || rec?.title || TinctPdfScan.cleanFileName(name), author: scan ? scan.author : rec?.author || '', scan, texts: new Map(), figs: new Map() });
  if (token !== state.token) return;
  root.classList.add('is-pdf'); root.classList.remove('is-epub');
  root.style.removeProperty('--epub-scale');
  const first = (await pdf.getPage(1)).getViewport({ scale: 1 });
  state.base = { w: first.width, h: first.height };
  const { late } = await synced;
  if (token !== state.token) return;
  const saved = store.get('pos:' + state.key);
  state.zoom = saved?.zoom || 1;
  // Where the book opens: the reader has not moved until they leave it (savePlaceNow).
  state.lastPlace = saved?.page ? { page: saved.page, frac: saved.frac || 0 } : { page: 1, frac: 0 };
  setBookTitle(state.title, state.author);
  buildSheets(pdf.numPages);
  noteSession();
  buildContents();
  keepPdfCover(pdf, key, token);
  if (!isPhone() && prefs.dock !== 'closed') setTimeout(() => { if (hasBook() && !chat.el?.isConnected) openChat({ quiet: true }) }, 50);
  requestAnimationFrame(() => { if (saved) goTo({ page: saved.page, frac: saved.frac }); else $('scroll').scrollTop = 0; onScroll() });
  // The account answered after the book opened: its newer place is shown if the reader is still where it opened.
  late.then(adopted => {
    if (!adopted || token !== state.token || !sameSpot(currentPlace(), state.lastPlace)) return;
    const pos = store.get('pos:' + state.key);
    if (!pos?.page) return;
    state.lastPlace = { page: pos.page, frac: pos.frac || 0 };
    goTo(state.lastPlace); onScroll();
  });
}
function setBookTitle(title, author) {
  state.title = title; state.author = author || '';
  $('bookTitle').textContent = title;
  $('bookBtn').setAttribute('aria-label', `${title}. Switch books`);
  document.title = `${title} · Tinct`;
}
// A PDF's cover is its first page, drawn once (coverV 2) at the size Your books and the
// library show it, after the page is open so it never delays reading.
const PDF_COVER_WIDTH = 900;
function keepPdfCover(pdf, key, token) {
  setTimeout(async () => {
    try {
      if (token !== state.token || state.pdf !== pdf) return;
      const rec = await library.get(key);
      if (!rec || (rec.coverV >= 2 && rec.coverW >= PDF_COVER_WIDTH)) return;
      const page = await pdf.getPage(1);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: PDF_COVER_WIDTH / base.width });
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      await library.touch(key, { cover: canvas.toDataURL('image/jpeg', 0.86), coverW: canvas.width, coverV: 2 });
    } catch { /* the paper cover stays */ }
  }, 1200);
}
function crop() { return state.trim ? TRIM : { x: 0, y: 0 } }
function sheetRatio(w, h) { const c = crop(); return `${w * (1 - 2 * c.x)} / ${h * (1 - 2 * c.y)}` }
function applyCrop() {
  const c = crop(), s = root.style;
  s.setProperty('--cw', (100 / (1 - 2 * c.x)) + '%'); s.setProperty('--ch', (100 / (1 - 2 * c.y)) + '%');
  s.setProperty('--cx', (-100 * c.x / (1 - 2 * c.x)) + '%'); s.setProperty('--cy', (-100 * c.y / (1 - 2 * c.y)) + '%');
}
// The pages' width at fit: the scroll area less the column's own side padding (css/reader.css
// .pdf-column), so a page never runs past the screen's edge.
const columnPad = () => { const cs = getComputedStyle($('column')); return (parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)) || 32 };
const columnWidth = () => { const w = $('scroll').clientWidth - columnPad(); return prefs.full ? w : Math.min(w, root.classList.contains('dock-open') ? 1100 : 1500) };
const sheetWidth = () => Math.round(columnWidth() * state.zoom);
function buildSheets(count) {
  state.observer?.disconnect();
  $('column').innerHTML = '';
  state.pages = [];
  applyCrop();
  const w = sheetWidth();
  for (let n = 1; n <= count; n++) {
    const sheet = document.createElement('div');
    sheet.className = 'pdf-sheet'; sheet.dataset.page = n;
    sheet.style.width = w + 'px'; sheet.style.aspectRatio = sheetRatio(state.base.w, state.base.h);
    sheet.innerHTML = `<div class="pg"></div><span class="pdf-num">${n}</span>`;
    $('column').appendChild(sheet);
    state.pages.push({ n, sheet, pg: sheet.firstChild, w: state.base.w, h: state.base.h, canvas: null, layer: null, spans: null, task: null, renderedWidth: 0 });
  }
  state.observer = new IntersectionObserver(entries => {
    for (const e of entries) { const p = state.pages[e.target.dataset.page - 1]; e.isIntersecting ? renderPage(p) : releasePage(p) }
  }, { root: $('scroll'), rootMargin: '150% 0px' });
  state.pages.forEach(p => state.observer.observe(p.sheet));
}
async function pageText(n) {
  if (state.texts.has(n)) return state.texts.get(n);
  if (isEpub()) return { text: '', items: [] };
  const page = await state.pdf.getPage(n);
  const content = await page.getTextContent();
  const value = { items: content.items, text: content.items.map(i => i.str + (i.hasEOL ? '\n' : '')).join('').replace(/[ \t]+/g, ' ').trim() };
  state.texts.set(n, value);
  return value;
}
async function renderPage(p) {
  const width = sheetWidth(), dark = pageTheme === 'dark';
  if (p.canvas && p.renderedWidth === width && p.dark === dark) return;
  const token = state.token;
  const page = await state.pdf.getPage(p.n);
  if (token !== state.token) return;
  const unit = page.getViewport({ scale: 1 });
  if (unit.width !== p.w || unit.height !== p.h) { p.w = unit.width; p.h = unit.height; p.sheet.style.aspectRatio = sheetRatio(p.w, p.h) }
  const cssScale = width / (unit.width * (1 - 2 * crop().x));
  const dpr = Math.min(devicePixelRatio || 1, 2.5);
  const viewport = page.getViewport({ scale: cssScale * dpr });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width); canvas.height = Math.floor(viewport.height);
  canvas.setAttribute('aria-hidden', 'true');
  p.task?.cancel();
  const task = page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport });
  p.task = task;
  try { await task.promise } catch { return }
  if (token !== state.token || p.task !== task) return;
  // Dark: the page as shown is a recoloured copy; the page as drawn stays for snips, figures
  // and sketches. Without a copy (out of memory), a CSS filter darkens the page instead.
  const shown = dark ? (await darkCopy(page, canvas, viewport)) || canvas : canvas;
  if (token !== state.token || p.task !== task) return;
  shown.classList.toggle('is-raw', dark && shown === canvas);
  p.canvas?.remove(); p.layer?.remove();
  if (p.source && p.source !== canvas) p.source.width = 0;
  p.pg.prepend(shown); p.canvas = shown; p.source = shown === canvas ? null : canvas; p.renderedWidth = width; p.dark = dark;
  const { items } = await pageText(p.n);
  if (token !== state.token || p.canvas !== canvas) return;
  buildTextLayer(p, items, page.getViewport({ scale: cssScale }));
  if (!state.figs.has(p.n)) setTimeout(() => detectFigures(p), 0); else p.figures = state.figs.get(p.n);
  if (narr.active && narr.page === p.n) paintNarration();
}
// The drawn page, as printed: what snips, figure detection and sketches read.
const drawn = p => p.source || p.canvas;
async function darkCopy(page, canvas, viewport) {
  try {
    const ops = await page.getOperatorList();
    const keep = Theme.imageRects(ops, pdfjsLib.OPS, viewport.transform, canvas.width, canvas.height);
    const out = document.createElement('canvas');
    out.width = canvas.width; out.height = canvas.height; out.setAttribute('aria-hidden', 'true');
    const g = out.getContext('2d', { alpha: false });
    g.drawImage(canvas, 0, 0);
    const img = g.getImageData(0, 0, out.width, out.height);
    Theme.recolourDark(img.data, out.width, out.height, keep, Theme.PALETTE.dark);
    g.putImageData(img, 0, 0);
    return out;
  } catch { return null }
}
const measureCtx = document.createElement('canvas').getContext('2d');
function buildTextLayer(p, items, vp) {
  const layer = document.createElement('div');
  layer.className = 'text-layer';
  layer.setAttribute('aria-label', `Text of page ${p.n}`);
  const spans = [];
  const frag = document.createDocumentFragment();
  // Side columns (margin figures, notes) follow the body in the PDF's text order, so a drag
  // through the body would run into them. Find where body lines end and move the rest after.
  // Measure the body from long lines that start at the body's left edge (captions in the margin also run long).
  const longs = items.filter(it => it.str.length > 30), fs = it => Math.hypot(it.transform[2], it.transform[3]);
  const lefts = longs.map(it => it.transform[4]).sort((a, b) => a - b), bodyLeft = lefts[Math.floor(lefts.length * 0.3)];
  const bodyEnds = longs.filter(it => Math.abs(it.transform[4] - bodyLeft) < fs(it) * 4).map(it => it.transform[4] + it.width).sort((a, b) => a - b);
  const bodyRight = bodyEnds.length >= 4 ? bodyEnds[Math.floor(bodyEnds.length * 0.9)] : Infinity;
  const side = document.createElement('div'); side.className = 'side-col';
  const body = [];
  items.forEach((item, i) => {
    if (!item.str.trim()) { spans.push(null); return }
    const tx = pdfjsLib.Util.transform(vp.transform, item.transform);
    const size = Math.hypot(tx[2], tx[3]);
    if (size < 1) { spans.push(null); return }
    const angle = Math.atan2(tx[1], tx[0]);
    const span = document.createElement('span');
    span.textContent = item.str + (item.hasEOL ? '\n' : ' ');
    span.dataset.i = i;
    span.style.left = tx[4] + 'px';
    span.style.top = (tx[5] - size * 0.86) + 'px';
    span.style.fontSize = size + 'px';
    measureCtx.font = `${size}px sans-serif`;
    const natural = measureCtx.measureText(item.str).width;
    const target = item.width * vp.scale;
    const sx = natural > 0 && target > 0 ? target / natural : 1;
    span.style.transform = `${angle ? `rotate(${angle}rad) ` : ''}scaleX(${sx})`;
    spans.push(span);
    if (item.transform[4] > bodyRight + 2) side.appendChild(span);
    else body.push({ span, x: tx[4], base: tx[5], size, w: target, str: item.str });
  });
  const lay = layoutBody(body, vp); p.blocks = lay.blocks; p.prose = lay.prose;
  for (const b of body) frag.appendChild(b.span);
  layer.appendChild(frag);
  if (side.childNodes.length) layer.appendChild(side);
  p.pg.appendChild(layer); p.layer = layer; p.spans = spans;
  renderHighlights(p);
}

/* Displayed formulas: TeX sets an equation as many small fragments (fractions, sums, sub- and
   superscripts) in no reading order. Put the body text in visual line order, and find runs of
   formula lines so a selection that touches an equation takes the whole equation. */
function layoutBody(body, vp) {
  if (!body.length) return { blocks: [], prose: [] };
  const longOnes = body.filter(b => b.str.trim().length > 30);
  const size = median((longOnes.length ? longOnes : body).map(b => b.size));
  const lines = [];
  for (const b of [...body].sort((a, c) => a.base - c.base)) {
    const L = lines.at(-1);
    if (L && b.base - L.base < size * 0.42) { L.items.push(b); L.bottom = Math.max(L.bottom, b.base) } else lines.push({ base: b.base, bottom: b.base, items: [b] });
  }
  for (const L of lines) L.items.sort((a, c) => a.x - c.x);
  body.length = 0; for (const L of lines) body.push(...L.items);
  const MATHY = /[=≡≃≈≤≥<>±×·∑∏∫√∂∞∈→←⇒|^_{}()\[\]Ͱ-Ͽ∀-⋿]/;
  const FN = /^(ln|log|exp|sin|cos|tan|max|min|lim|det|sup|inf|arg|mod|var|pr)$/i;
  const wordsOf = items => items.map(b => b.str.trim()).filter(Boolean);
  const isProse = words => { const t = words.join(' ').split(/[^A-Za-zÀ-ɏ’']+/).filter(w => w.length >= 2 && !FN.test(w)); return t.some(w => w.length >= 6) || t.length >= 3 };
  // A prose line can end in a piece of a formula far to its right ("or, equivalently,      ( )"): split it off.
  const split = [];
  for (const L of lines) {
    const segs = [[L.items[0]]]; let a = L.items[0];
    for (const b of L.items.slice(1)) { if (b.str.trim() && a.str.trim() && b.x - (a.x + a.w) > size * 3) segs.push([b]); else segs.at(-1).push(b); if (b.str.trim()) a = b }
    if (segs.length > 1 && isProse(wordsOf(L.items))) for (const g of segs) split.push({ base: L.base, bottom: L.bottom, items: g });
    else split.push(L);
  }
  const kind = L => {
    const words = wordsOf(L.items);
    if (!words.length || isProse(words)) return 'T';
    const mathy = words.some(w => MATHY.test(w)) || L.items.some(b => b.str.trim() && Math.abs(b.size - size) > size * 0.15);
    if (mathy && (words.length >= 2 || words[0].length >= 3)) return 'M';
    return words.every(w => w.length <= 4 && !/[.,;:]$/.test(w)) ? 'F' : 'T';
  };
  const kinds = split.map(kind);
  const tBases = split.filter((L, i) => kinds[i] === 'T').map(L => L.base);
  const gaps = tBases.slice(1).map((b, i) => b - tBases[i]).filter(g => g > size * 0.8 && g < size * 2);
  const lead = gaps.length ? median(gaps) : size * 1.25;
  const runs = []; let cur = null;
  split.forEach((L, i) => {
    if (kinds[i] === 'T') { cur = null; return }
    if (cur && L.base - cur.lines.at(-1).bottom < size * 2.4) cur.lines.push(L), cur.kinds.push(kinds[i]); else { cur = { lines: [L], kinds: [kinds[i]] }; runs.push(cur) }
  });
  // Displayed formulas stand apart from the prose; math squeezed between two prose lines is inline.
  const blocks = runs.filter(r => {
    if (!r.kinds.includes('M')) return false;
    const first = r.lines[0].base, last = r.lines.at(-1).bottom;
    const above = tBases.filter(b => b < first - 1).at(-1), below = tBases.find(b => b > last + 1);
    const both = (above === undefined || first - above < lead * 1.1) && (below === undefined || below - last < lead * 1.1);
    const either = (above !== undefined && first - above < lead * 0.9) || (below !== undefined && below - last < lead * 0.9);
    return !both && !either;
  });
  const box = (items, pad) => { let l = Infinity, t = Infinity, r = -Infinity, btm = -Infinity; for (const b of items) { l = Math.min(l, b.x); r = Math.max(r, b.x + b.w); t = Math.min(t, b.base - b.size * 0.9); btm = Math.max(btm, b.base + b.size * 0.3) } return { x: (l - pad) / vp.width, y: (t - pad) / vp.height, w: (r - l + pad * 2) / vp.width, h: (btm - t + pad * 2) / vp.height } };
  const prose = split.filter((L, i) => kinds[i] === 'T').map(L => box(L.items, size * 0.15));
  return { prose, blocks: blocks.map((B, k) => {
    let l = Infinity, t = Infinity, r = -Infinity, btm = -Infinity;
    for (const L of B.lines) for (const b of L.items) { b.span.dataset.m = k; l = Math.min(l, b.x); r = Math.max(r, b.x + b.w); t = Math.min(t, b.base - b.size * 0.9); btm = Math.max(btm, b.base + b.size * 0.3) }
    const pad = size * 0.25;
    return { x: (l - pad) / vp.width, y: (t - pad) / vp.height, w: (r - l + pad * 2) / vp.width, h: (btm - t + pad * 2) / vp.height };
  }) };
}
function blockClientBox(p, B) { const r = p.pg.getBoundingClientRect(); return { left: r.left + B.x * r.width, top: r.top + B.y * r.height, right: r.left + (B.x + B.w) * r.width, bottom: r.top + (B.y + B.h) * r.height } }
// The selection as clean shapes: one bar per text line, and one box per formula it touches.
function selectionShapes(range) {
  let rects = [...range.getClientRects()].filter(r => r.width > 0.5 && r.height > 0.5);
  const H = median(rects.map(r => r.height));
  rects = rects.filter(r => r.height < H * 4);
  const boxes = [];
  for (const p of state.pages) {
    if (!p.blocks?.length || !p.layer) continue;
    const pr = p.pg.getBoundingClientRect(); if (pr.bottom < 0 || pr.top > innerHeight * 3) continue;
    p.blocks.forEach(B => {
      const b = blockClientBox(p, B);
      if (rects.some(r => { const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2; return cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom })) boxes.push(b);
    });
  }
  const inBox = r => boxes.some(b => { const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2; return cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom });
  return [...lineBars(rects.filter(r => !inBox(r))), ...boxes];
}
// Double-click a formula to select all of it.
document.addEventListener('dblclick', e => {
  const p = pageForPoint(e.clientX, e.clientY); if (!p?.blocks?.length || !p.layer) return;
  const k = p.blocks.findIndex(B => { const b = blockClientBox(p, B); return e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom });
  if (k < 0) return;
  const sp = p.layer.querySelectorAll(`span[data-m="${k}"]`); if (!sp.length) return;
  const range = document.createRange(); range.setStartBefore(sp[0]); range.setEndAfter(sp[sp.length - 1]);
  const s = getSelection(); s.removeAllRanges(); s.addRange(range);
});

/* ---------- Selection drawn as clean line bars; saved highlights ---------- */
const median = a => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)] || 0 };
function lineBars(rects) {
  // Merge the per-word boxes of a selection into one bar per line (split at wide gaps). Each bar
  // takes its height from its own widest word, so labels at different heights stay on their words.
  const rs = rects.filter(r => r.width > 0.5 && r.height > 0.5);
  if (!rs.length) return [];
  const H = median(rs.map(r => r.height));
  const lines = [];
  for (const r of rs.sort((a, b) => a.top - b.top || a.left - b.left)) {
    const cy = (r.top + r.bottom) / 2;
    let L = lines.find(l => Math.abs(l.cy - cy) < Math.min(H, r.height) * 0.42);
    if (!L) { L = { cy, rs: [] }; lines.push(L) }
    L.rs.push(r);
  }
  const bars = [];
  for (const L of lines) {
    const merged = [];
    for (const r of L.rs.sort((a, b) => a.left - b.left)) {
      const last = merged.at(-1);
      if (last && r.left - last.right < H * 2.2) { last.right = Math.max(last.right, r.right); if (r.width > last.main.width) last.main = r }
      else merged.push({ left: r.left, right: r.right, main: r });
    }
    for (const m of merged) { const pad = m.main.height * 0.06; bars.push({ left: m.left - 1, right: m.right + 1, top: m.main.top - pad, bottom: m.main.bottom + pad }) }
  }
  return bars;
}
function pageForPoint(x, y) { return state.pages.find(p => { const r = p.pg.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom }) }
function layerOf(p, cls) { let l = p.pg.querySelector(':scope > .' + cls); if (!l) { l = document.createElement('div'); l.className = cls; p.pg.insertBefore(l, p.layer || null) } return l }
function paintSelection() {
  document.querySelectorAll('.sel-layer').forEach(l => l.replaceChildren());
  const s = getSelection();
  if (!s || s.isCollapsed || !s.rangeCount || !s.anchorNode?.parentElement?.closest('.text-layer')) return;
  for (const bar of selectionShapes(s.getRangeAt(0))) {
    const p = pageForPoint((bar.left + bar.right) / 2, (bar.top + bar.bottom) / 2); if (!p) continue;
    const r = p.pg.getBoundingClientRect(), i = document.createElement('i');
    Object.assign(i.style, { left: (bar.left - r.left) / r.width * 100 + '%', top: (bar.top - r.top) / r.height * 100 + '%', width: (bar.right - bar.left) / r.width * 100 + '%', height: (bar.bottom - bar.top) / r.height * 100 + '%' });
    layerOf(p, 'sel-layer').appendChild(i);
  }
}
document.addEventListener('selectionchange', paintSelection);
const highlights = () => store.get('hl:' + state.key) || [];
const HL_COLORS = [['gold', 'Gold', 'rgba(232,196,92,.42)', '#e9cf86'], ['rose', 'Rose', 'rgba(232,118,128,.30)', '#eba7ad'], ['sage', 'Sage', 'rgba(108,178,108,.32)', '#a9d0a3'], ['sky', 'Sky', 'rgba(96,148,226,.30)', '#a6c2ee'], ['lavender', 'Lavender', 'rgba(156,116,222,.30)', '#c6b0ee']];
const hlFill = c => (HL_COLORS.find(x => x[0] === c) || HL_COLORS[0])[2];
function recolorHighlight(id, color) {
  const list = highlights(), h = list.find(x => x.id === id); if (!h) return;
  h.color = color; prefs.hlColor = color; savePrefs();
  store.set('hl:' + state.key, list); renderHighlights(state.pages[h.page - 1]);
}
function paletteHtml(current) { return `<div class="popup-highlight-palette byob-palette" aria-label="Highlight colour">${HL_COLORS.map(([k, label, , dot]) => `<button type="button" class="popup-color-dot highlight-${k}${k === current ? ' is-selected' : ''}" style="background:${dot};color:${dot}" data-color="${k}" title="${label}" aria-label="Highlight ${label}" aria-pressed="${k === current}"></button>`).join('')}</div>` }
// After highlighting, the popup turns into Tinct's colour row for that highlight.
function showPalette(ids, box) {
  hideSelection();
  const h = highlights().find(x => x.id === ids[0]); if (!h) return;
  const pop = document.createElement('div');
  pop.tabIndex = -1; pop.className = 'selection-popup is-compact is-lab selection-popup-below byob-palette-pop'; pop.dataset.popupMode = 'highlight';
  pop.innerHTML = paletteHtml(h.color || 'gold') + `<button type="button" class="byob-palette-x" data-a="unhighlight" title="Remove highlight" aria-label="Remove highlight">${'<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="m4 4 8 8M12 4l-8 8"></path></svg>'}</button>`;
  root.appendChild(pop); placePopup(pop, box, 250); pop.addEventListener('mousedown', e => e.preventDefault());
  pop.querySelectorAll('[data-color]').forEach(b => b.onclick = () => { for (const id of ids) recolorHighlight(id, b.dataset.color); pop.querySelectorAll('[data-color]').forEach(o => { o.classList.toggle('is-selected', o === b); o.setAttribute('aria-pressed', o === b) }) });
  pop.querySelector('[data-a="unhighlight"]').onclick = () => { for (const id of ids) removeHighlight(id); hideSelection() };
}
function renderHighlights(p) {
  if (!p) return;
  if (p.kind === 'epub') return renderEpubHighlights();
  const layer = layerOf(p, 'hl-layer'); layer.replaceChildren();
  for (const h of highlights().filter(h => h.page === p.n)) for (const [x, y, w, hh] of h.rects) {
    const i = document.createElement('i'); i.dataset.id = h.id; if (h.box) i.className = 'is-box'; i.style.setProperty('--hl', hlFill(h.color));
    Object.assign(i.style, { left: x * 100 + '%', top: y * 100 + '%', width: w * 100 + '%', height: hh * 100 + '%' });
    layer.appendChild(i);
  }
}
function addHighlight(info) {
  const s = getSelection(); if (!s.rangeCount) return;
  if (isEpub()) return addEpubHighlight(info, s.getRangeAt(0));
  const byPage = new Map();
  for (const bar of selectionShapes(s.getRangeAt(0))) {
    const p = pageForPoint((bar.left + bar.right) / 2, (bar.top + bar.bottom) / 2); if (!p) continue;
    const r = p.pg.getBoundingClientRect();
    if (!byPage.has(p.n)) byPage.set(p.n, []);
    byPage.get(p.n).push([(bar.left - r.left) / r.width, (bar.top - r.top) / r.height, (bar.right - bar.left) / r.width, (bar.bottom - bar.top) / r.height].map(v => Math.round(v * 10000) / 10000));
  }
  const list = highlights();
  const ids = [];
  for (const [page, rects] of byPage) { const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); ids.push(id); list.push({ id, page, rects, text: info.text.slice(0, 2000), color: prefs.hlColor || 'gold', at: Date.now() }) }
  store.set('hl:' + state.key, list);
  for (const page of byPage.keys()) renderHighlights(state.pages[page - 1]);
  return ids;
}
function removeHighlight(id) {
  const h = highlights().find(x => x.id === id);
  store.set('hl:' + state.key, highlights().filter(x => x.id !== id));
  if (h) renderHighlights(state.pages[h.page - 1]);
}
function highlightAt(x, y) {
  if (isEpub()) return epubHighlightAt(x, y);
  const p = pageForPoint(x, y); if (!p) return null;
  const r = p.pg.getBoundingClientRect(), fx = (x - r.left) / r.width, fy = (y - r.top) / r.height;
  const h = highlights().find(h => h.page === p.n && h.rects.some(([a, b, w, hh]) => fx >= a && fx <= a + w && fy >= b && fy <= b + hh));
  if (!h) return null;
  const box = h.rects.reduce((acc, [a, b, w, hh]) => ({ left: Math.min(acc.left, r.left + a * r.width), top: Math.min(acc.top, r.top + b * r.height), right: Math.max(acc.right, r.left + (a + w) * r.width), bottom: Math.max(acc.bottom, r.top + (b + hh) * r.height) }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
  return { id: h.id, text: h.text, page: h.page, box };
}
/* EPUB highlights are character offsets in a chapter's text, so they survive text size,
   width and font changes. They are drawn with the CSS Custom Highlight API. */
function textOffset(pg, node, offset) {
  const r = document.createRange(); r.selectNodeContents(pg); r.setEnd(node, offset);
  return r.toString().length;
}
function rangeFromOffsets(pg, start, end) {
  const walker = document.createTreeWalker(pg, NodeFilter.SHOW_TEXT);
  let pos = 0, node, range = document.createRange(), started = false;
  while ((node = walker.nextNode())) {
    const len = node.nodeValue.length;
    if (!started && start <= pos + len) { range.setStart(node, Math.max(0, start - pos)); started = true }
    if (started && end <= pos + len) { range.setEnd(node, Math.max(0, end - pos)); return range }
    pos += len;
  }
  return started ? range : null;
}
function addEpubHighlight(info, range) {
  const list = highlights(), ids = [];
  for (const p of state.pages) {
    if (!range.intersectsNode(p.pg)) continue;
    const r = range.cloneRange();
    if (!p.pg.contains(r.startContainer)) r.setStart(p.pg, 0);
    if (!p.pg.contains(r.endContainer)) r.setEnd(p.pg, p.pg.childNodes.length);
    const start = textOffset(p.pg, r.startContainer, r.startOffset), end = textOffset(p.pg, r.endContainer, r.endOffset);
    if (end - start < 1) continue;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); ids.push(id);
    list.push({ id, page: p.n, start, end, text: r.toString().replace(/\s+/g, ' ').trim().slice(0, 2000) || info.text.slice(0, 2000), color: prefs.hlColor || 'gold', at: Date.now() });
  }
  store.set('hl:' + state.key, list);
  renderEpubHighlights();
  return ids;
}
let hlWarned = false;
function renderEpubHighlights() {
  if (!window.CSS?.highlights || typeof Highlight === 'undefined') {
    if (!hlWarned && highlights().length) { hlWarned = true; toast('Your highlights are saved, but this browser cannot show them. Update your browser to see them.') }
    return;
  }
  const groups = new Map();
  for (const h of highlights()) {
    const p = state.pages[h.page - 1]; if (!p || p.kind !== 'epub' || h.start == null) continue;
    const r = rangeFromOffsets(p.pg, h.start, h.end); if (!r) continue;
    if (!groups.has(h.color || 'gold')) groups.set(h.color || 'gold', []);
    groups.get(h.color || 'gold').push(r);
  }
  for (const [k] of HL_COLORS) { const rs = groups.get(k); if (rs?.length) CSS.highlights.set('tinct-hl-' + k, new Highlight(...rs)); else CSS.highlights.delete('tinct-hl-' + k) }
}
function epubHighlightAt(x, y) {
  const p = pageForPoint(x, y); if (!p) return null;
  for (const h of highlights().filter(h => h.page === p.n && h.start != null)) {
    const r = rangeFromOffsets(p.pg, h.start, h.end); if (!r) continue;
    const rects = [...r.getClientRects()];
    if (rects.some(q => x >= q.left && x <= q.right && y >= q.top && y <= q.bottom)) {
      const box = rects.reduce((a, q) => ({ left: Math.min(a.left, q.left), top: Math.min(a.top, q.top), right: Math.max(a.right, q.right), bottom: Math.max(a.bottom, q.bottom) }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
      return { id: h.id, text: h.text, page: h.page, box };
    }
  }
  return null;
}
function releasePage(p) {
  p.task?.cancel(); p.task = null;
  if (p.canvas) { p.canvas.width = 0; p.canvas.remove(); p.canvas = null; p.renderedWidth = 0 }
  if (p.source) { p.source.width = 0; p.source = null }
  p.layer?.remove(); p.layer = null; p.spans = null;
  p.pg.querySelectorAll('.hl-layer, .sel-layer, .byob-hot, .byob-region').forEach(l => l.remove());
}

/* ---------- Place ---------- */
function currentPlace() {
  const s = $('scroll'), top = s.getBoundingClientRect().top;
  // Scrolled to the very end: the last page is read through (100%), though its top is still in view.
  if (state.pages.length && s.scrollHeight - s.clientHeight > 2 && s.scrollTop >= s.scrollHeight - s.clientHeight - 2) return { page: state.pages.length, frac: 1 };
  for (const p of state.pages) {
    const r = p.sheet.getBoundingClientRect();
    if (r.bottom > top + 1) return { page: p.n, frac: Math.max(0, Math.min(1, (top - r.top) / r.height)) };
  }
  return { page: state.pages.length || 1, frac: 0 };
}
function goTo(place, smooth) {
  const p = state.pages[Math.max(1, Math.min(state.pages.length, place.page)) - 1];
  if (!p) return;
  const s = $('scroll'), r = p.sheet.getBoundingClientRect();
  const y = s.scrollTop + r.top - s.getBoundingClientRect().top + (place.frac || 0) * r.height - (place.frac ? 0 : 10);
  s.scrollTo({ top: y, behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
}
let saveTimer;
function onScroll() {
  if (!state.pages.length) return;
  const place = currentPlace(), n = state.pages.length;
  const ch = toc.ready ? chapterAt(place.page) : null;
  if (isEpub()) {
    const sc = $('scroll'), pct = Math.round(100 * sc.scrollTop / Math.max(1, sc.scrollHeight - sc.clientHeight));
    $('pageLabel').textContent = ch ? ch.label : state.title;
    $('pageBtn').setAttribute('aria-label', `Table of contents, ${ch ? ch.label + ', ' : ''}${pct}% read`);
    $('progress').textContent = `${pct}%`;
  } else {
  // The chapter pill: the chapter (a real one, from the scan) or the page, then page and percent.
  const pct = `${Math.round(((place.page - 1 + place.frac) / n) * 100)}%`;
  $('pageLabel').textContent = ch ? ch.label : `p. ${place.page} of ${n}`;
  $('pageBtn').setAttribute('aria-label', `Contents and pages, ${ch ? ch.label + ', ' : ''}page ${place.page} of ${n}, ${pct} read`);
  $('progress').textContent = ch ? `p. ${place.page} · ${pct}` : pct;
  }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(savePlaceNow, 250);
}
// The place on this device (localStorage tinct-addbook:pos:<key>): page, position on it,
// zoom, the page count and when, so the library lists the book as being read. Only a move
// is a new place (more than 2% of a page from where the book opened or was last kept):
// opening, zooming or leaving at the same spot keeps when it was read there, so a place
// read later on another device still wins. A PDF's place also goes to the account.
const sameSpot = (a, b) => !!a && !!b && Math.abs((a.page - 1 + (a.frac || 0)) - (b.page - 1 + (b.frac || 0))) <= 0.02;
function savePlaceNow() {
  clearTimeout(saveTimer);
  if (!state.pages.length || !state.key) return;
  const place = currentPlace(), prev = store.get('pos:' + state.key) || {};
  const moved = !sameSpot(place, state.lastPlace);
  if (moved) state.lastPlace = place;
  store.set('pos:' + state.key, moved ? { ...prev, ...place, zoom: state.zoom, pages: state.pages.length, at: Date.now() } : { ...prev, zoom: state.zoom, pages: state.pages.length });
  const hist = store.get('read:' + state.key) || { furthest: 1 };
  if (place.page > hist.furthest) { hist.furthest = place.page; store.set('read:' + state.key, hist) }
  if (moved && state.kind === 'pdf') placeSync.note(hexOf(state.key));
}
// Leaving or hiding the page: the place now, and what is waiting sent at once (keepalive).
function leavePlace() { if (!hasBook()) return; savePlaceNow(); placeSync.flush() }
addEventListener('pagehide', leavePlace);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') leavePlace() });

/* ---------- A PDF's place on the reader's other devices ---------- */
// Signed in, the place in a PDF is kept privately in the account (/api/user-books/places,
// src/lab/userBook/ownSync.ts through /lab/library-add.js): the newer place wins, never a
// stale one. Before the book shows, the account is asked (bounded: offline or slow, the book
// opens here at once and the answer is used if it arrives while the reader has not moved).
const PLACE_SYNC_WAIT_MS = 3000;
const placeSync = {
  api: null,
  load() {
    if (!window.TinctAI?.session?.().userId) return Promise.resolve(null);
    return switcherApi().then(api => (this.api = api.pdfPlaces || null), () => null);
  },
  note(hex) { if (this.api) this.api.note(hex); else this.load().then(api => api?.note(hex)) },
  flush() { this.api?.flush() },
  // -> true once the account's place (read later on another device) is the one kept here.
  async reconcile(key) {
    if (!String(key).startsWith('pdf:')) return { adopted: false, late: Promise.resolve(false) };
    const late = this.load().then(api => api ? api.reconcile(hexOf(key)) : 'unavailable').then(r => r === 'adopted', () => false);
    const adopted = await Promise.race([late, new Promise(r => setTimeout(() => r(null), PLACE_SYNC_WAIT_MS))]);
    return { adopted: adopted === true, late: adopted === null ? late : Promise.resolve(false) };
  },
};
$('scroll').addEventListener('scroll', onScroll, { passive: true });
function noteSession() {
  // Catch me up starts from the page the previous visit ended on.
  const sess = store.get('session:' + state.key) || {};
  const pos = store.get('pos:' + state.key);
  if (pos && (!sess.at || Date.now() - sess.at > 30 * 60 * 1000)) { sess.previousPage = pos.page }
  sess.at = Date.now();
  store.set('session:' + state.key, sess);
}
let zoomTimer;
function setZoom(z, { quick = false } = {}) {
  const place = currentPlace();
  const before = state.zoom;
  state.zoom = Math.max(0.5, Math.min(3, Math.round(z * 100) / 100));
  // Zooming past fit tucks the docked chat into its tab; coming back restores it.
  if (!isPhone() && state.pages.length) {
    if (state.zoom > 1 && before <= 1 && dock.state === 'docked') setDock('minimized', { byZoom: true });
    else if (state.zoom <= 1 && dock.byZoom && dock.state === 'minimized') setDock('docked');
  }
  if (isEpub()) { applyEpubScale(); goTo(place); onScroll(); savePlaceNow(); return }
  applyCrop();
  const w = sheetWidth();
  for (const p of state.pages) { p.sheet.style.width = w + 'px'; p.sheet.style.aspectRatio = sheetRatio(p.w, p.h) }
  goTo(place); onScroll();
  clearTimeout(zoomTimer);
  zoomTimer = setTimeout(() => { for (const p of state.pages) if (p.canvas) { p.renderedWidth = 0; renderPage(p) } savePlaceNow() }, quick ? 220 : 0);
}
// Ctrl/Cmd +/- and trackpad pinch zoom the pages, not the browser page, so the top bar stays put.
addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || !state.pages.length) return;
  if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(state.zoom + 0.1, { quick: true }) }
  else if (e.key === '-' || e.key === '_') { e.preventDefault(); setZoom(state.zoom - 0.1, { quick: true }) }
  else if (e.key === '0') { e.preventDefault(); setZoom(1) }
});
addEventListener('wheel', e => {
  if (!e.ctrlKey || !state.pages.length) return;
  e.preventDefault();
  setZoom(state.zoom * Math.exp(-e.deltaY * 0.01), { quick: true });
}, { passive: false });
// On a touch screen, two fingers on the pages zoom the pages too, not the browser page: a
// pinch-zoomed browser page leaves the fixed top bar, and its way back, off the screen.
let pinch = null;
const fingerGap = touches => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
$('scroll').addEventListener('touchstart', e => { if (e.touches.length === 2 && state.pages.length) pinch = { gap: fingerGap(e.touches) || 1, zoom: state.zoom } }, { passive: true });
$('scroll').addEventListener('touchmove', e => {
  if (!pinch || e.touches.length !== 2) return;
  e.preventDefault();
  setZoom(pinch.zoom * fingerGap(e.touches) / pinch.gap, { quick: true });
}, { passive: false });
$('scroll').addEventListener('touchend', e => { if (e.touches.length < 2) pinch = null });
$('scroll').addEventListener('touchcancel', () => { pinch = null });
// Safari's own pinch (gesture events) over the reader: the pages zoom instead (above).
for (const type of ['gesturestart', 'gesturechange']) addEventListener(type, e => { if (readerShown() && state.pages.length) e.preventDefault() }, { passive: false });
let resizeTimer;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { applyLayout(); if (state.pages.length) setZoom(state.zoom) }, 150) });
addEventListener('keydown', e => {
  if (e.target.closest('input, textarea, select')) return;
  if (e.key === 'Escape') {
    const popup = root.dataset.superMenu === 'open' || !!document.querySelector('.selection-popup, .byob-settings, .lab-contents-v2, .lab-audio-speed-popover, .byob-sheet-host, .byob-snip');
    endSnip(); closeAllPopups();
    if (!popup && !isPhone() && chat.el?.isConnected) closeChat();
  }
});

/* ---------- Popups, sheets and the menu, in Tinct's markup ---------- */
let openPanel = null;
function closeAllPopups() { closeMenu(); hideSelection(); closeJump(); closeSwitcher(); document.querySelector('.byob-settings')?.remove(); document.querySelector('.lab-contents-v2')?.remove(); document.querySelector('.lab-audio-speed-popover')?.remove() }
// Sheets live in the reader's root; on the start page, in a host that carries the same classes.
function startHost() {
  const host = document.createElement('div');
  host.className = `lab byob byob-sheet-host ${innerWidth < 700 ? 'is-phone' : 'is-desktop'}`;
  host.dataset.chromeVersion = 'v2'; themeHost(host, pageTheme);
  document.body.appendChild(host);
  return host;
}
function sheet(title, html, onClose, host = root) {
  const layer = document.createElement('div');
  layer.className = 'lab-v2-sheet-layer lab-catch-up-layer';
  layer.innerHTML = `<button type="button" class="lab-super-scrim" aria-label="Close"></button>
    <section class="lab-v2-sheet lab-catch-up" aria-label="${esc(title)}">
      <div class="lab-v2-head is-titled"><h2 class="lab-v2-title">${esc(title)}</h2><button type="button" class="lab-v2-dismiss" aria-label="Close">×</button></div>
      <div class="lab-v2-sheet-body lab-catch-up-body">${html}</div>
    </section>`;
  const close = () => { closeSheet(layer); onClose?.() };
  layer.querySelector('.lab-super-scrim').onclick = close;
  layer.querySelector('.lab-v2-dismiss').onclick = close;
  host.appendChild(layer);
  return layer;
}
function closeSheet(layer) { const host = layer?.parentElement; layer?.remove(); if (host?.classList.contains('byob-sheet-host')) host.remove() }
let toastTimer, toastHeld = 0, toastNext = null, toastAt = 0;
// `hold`: a message that must be read (a book's own limits) is not replaced while it shows;
// one arriving meanwhile is shown when it ends, as is one it replaces before it could be read
// (why the book was kept on this device only, just before the scan notice).
// In the reader, the toast is the reader's own (css/reader.css keeps it inside the page area, left of the docked chat).
// Over the phone's chat sheet it is one of the chat's own quiet status lines, above the composer
// (the shared thread's .tc-status: EB Garamond italic, no fill), so the sheet never shows a grey box.
// Opening or closing Chat moves a toast that is showing (openChat, closeChat).
function placeToast(t) {
  let inChat = false;
  try { inChat = isPhone() && !!chat.el?.isConnected && readerShown() } catch { /* before the chat exists */ }
  t.className = inChat ? 'tc-status byob-toast is-in-chat' : 'lab-ask-notice byob-toast';
  if (inChat) { const composer = chat.el.querySelector('#composer'); if (t.nextElementSibling !== composer) chat.el.insertBefore(t, composer) }
  else { const host = readerShown() ? root : document.body; if (t.parentElement !== host) host.appendChild(t) }
}
function toast(text, { hold = false } = {}) {
  if (!hold && Date.now() < toastHeld) { toastNext = text; return }
  let t = document.querySelector('.byob-toast');
  if (hold && t && !t.hidden && t.textContent !== text && Date.now() >= toastHeld && Date.now() - toastAt < 2500) toastNext = t.textContent;
  if (!t) { t = document.createElement('p'); t.setAttribute('role', 'status') }
  placeToast(t);
  t.textContent = text; t.hidden = false; toastAt = Date.now();
  const ms = hold ? 6000 : 4000;
  toastHeld = hold ? Date.now() + ms : 0;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => {
    t.hidden = true; toastHeld = 0;
    if (toastNext) { const next = toastNext; toastNext = null; toast(next) }
  }, ms);
}

/* The reader's one Chat and one Highlight icon, the same glyphs as
   src/lab/LabReaderIcons.tsx (ChatIcon, HighlightIcon). */
const CHAT_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-icon="chat"><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.4L3 21l2.1-5.5A8.5 8.5 0 1 1 21 11.5Z"></path></svg>';
const HIGHLIGHT_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-icon="highlight"><path d="m9 11-6 6v3h9l3-3"></path><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path></svg>';

const ICON = {
  chat: CHAT_SVG,
  talk: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="4.2" y="9" width="2.6" height="6" rx="1.1"></rect><rect x="10.7" y="5" width="2.6" height="14" rx="1.1"></rect><rect x="17.2" y="8" width="2.6" height="8" rx="1.1"></rect></svg>',
  summarize: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M3 6h.1M3 12h.1M3 18h.1"></path></svg>',
  catchup: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6.6v3M6 12.6v3.2"></path><circle cx="6" cy="5" r="1.5" fill="currentColor" stroke="none"></circle><circle cx="6" cy="11" r="1.5" fill="currentColor" stroke="none"></circle><circle cx="6" cy="18" r="2.2"></circle><path d="M11 5h9M11 11h9M11 18h5"></path></svg>',
  settings: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 7h7M15 7h5M4 17h5M13 17h7"></path><circle cx="13" cy="7" r="2"></circle><circle cx="11" cy="17" r="2"></circle></svg>',
  library: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m10 5-7 7 7 7M3 12h18"></path></svg>',
  librarian: CHAT_SVG,
  close: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="m7 7 10 10M17 7 7 17"></path></svg>',
  open: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4m-4 4 4-4 4 4M5 14v5h14v-5"></path></svg>',
  pause: '<svg width="20.7" height="20.7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="0.5"></rect><rect x="14" y="5" width="4" height="14" rx="0.5"></rect></svg>',
  play: '<svg width="20.7" height="20.7" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.6 6.4v11.2L17.8 12 8.6 6.4Z" fill="currentColor" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"></path></svg>',
  snip: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v14h14"></path><path d="M3 7h14v14"></path></svg>',
  export: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m-4-4 4 4 4-4M5 19h14"></path></svg>',
  attach: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m20.5 16-5-5-8 8"></path></svg>',
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" stroke="currentColor" stroke-width="1.5"></rect><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="1.5"></path></svg>',
};
// The reader's rows (src/lab/labSuperMenu.ts: Librarian, Summarize, Catch me up, Settings,
// Library on the phone), with this viewer's own: Snip a figure, Export notes, Open another book.
const MENU = [['librarian', 'Librarian'], ['summarize', 'Summarize'], ['catchup', 'Catch me up'], ['snip', 'Snip a figure'], ['export', 'Export notes', true], ['settings', 'Settings', true, true], ['open', 'Open another book', true], ['library', 'Library', true]];
const menuItems = () => MENU.filter(([id]) => (id !== 'snip' || state.kind === 'pdf') && (id !== 'library' || isPhone()));
function openMenu() {
  if (document.querySelector('.lab-super-layer')) return closeMenu();
  closeAllPopups();
  const layer = document.createElement('div');
  layer.className = 'lab-super-layer';
  const textless = hasNoText();
  layer.innerHTML = `<button type="button" class="lab-super-scrim" aria-label="Close menu"></button><nav class="lab-super-panel" aria-label="Menu">${menuItems().map(([id, label, rule, chevron]) =>
    `<button type="button" class="lab-super-row${rule ? ' has-rule' : ''}" data-row="${id}"${textless && (id === 'summarize' || id === 'catchup') ? ' disabled aria-disabled="true"' : ''}><span class="lab-super-row-icon" aria-hidden="true">${ICON[id]}</span><span class="lab-super-row-label">${label}</span>${chevron ? '<span class="lab-super-row-chevron" aria-hidden="true">›</span>' : ''}</button>`).join('')}</nav>`;
  layer.querySelector('.lab-super-scrim').onclick = closeMenu;
  layer.querySelectorAll('.lab-super-row').forEach(b => b.onclick = () => { closeMenu(); menuAction(b.dataset.row) });
  root.appendChild(layer);
  root.dataset.superMenu = 'open';
  $('superBtn').dataset.open = 'true'; $('superBtn').setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  document.querySelector('.lab-super-layer')?.remove();
  root.dataset.superMenu = 'closed';
  $('superBtn').dataset.open = 'false'; $('superBtn').setAttribute('aria-expanded', 'false');
}
$('superBtn').onclick = openMenu;
function menuAction(id) {
  if (id === 'library') { leaveToShelf(); return }
  if (!hasBook() && id !== 'open' && id !== 'settings') { toast('Open a book first.'); return }
  if (id === 'librarian') return openChat();
  if ((id === 'summarize' || id === 'catchup') && hasNoText()) return;
  if (id === 'summarize') return summarize();
  if (id === 'catchup') return catchUp();
  if (id === 'snip') return startSnip();
  if (id === 'export') return exportNotes();
  if (id === 'settings') return openSettings();
  if (id === 'open') return $('fileInput').click();
}

/* Page jump: the chapter pill becomes the page pill */
function openJump() {
  if (!hasBook() || isEpub()) return;
  if (document.querySelector('.byob-jumpbox')) return closeJump();
  closeAllPopups();
  const r = $('pageBtn').getBoundingClientRect();
  const box = document.createElement('div');
  box.className = 'lab-super-panel byob-panel byob-jumpbox';
  Object.assign(box.style, { left: Math.max(8, Math.min(innerWidth - 240, r.left)) + 'px', top: (r.bottom + 6) + 'px', width: '232px', right: 'auto' });
  box.innerHTML = `<form class="byob-jump"><label for="jumpInput">Page</label><input id="jumpInput" inputmode="numeric" value="${currentPlace().page}"><span>of ${state.pages.length}</span><button type="submit">Go</button></form>`;
  root.appendChild(box);
  const input = box.querySelector('input'); input.select();
  box.querySelector('form').onsubmit = e => { e.preventDefault(); const n = parseInt(input.value, 10); if (n) goTo({ page: n, frac: 0 }); closeJump() };
}
function closeJump() { document.querySelector('.byob-jumpbox')?.remove() }
$('pageBtn').onclick = () => openContents();

/* Settings: the reader's Settings sheet (src/lab/LabV2Sheet.tsx), with the rows that apply here:
   the theme, the page size, read-aloud voice and speed, full screen; and this viewer's own
   full width and page-margin trim. The theme is the reader's own setting (applyTheme). */
const toggleRow = (id, label, on, hidden) => `<button type="button" class="lab-v2-row is-toggle" role="switch" aria-checked="${on}" data-t="${id}"${hidden ? ' hidden' : ''}><span class="lab-v2-row-label">${label}</span><span class="lab-v2-switch" aria-hidden="true"><span class="lab-v2-switch-knob"></span></span></button>`;
const selectRow = (id, label, value, options) => `<div class="lab-v2-row is-select"><span class="lab-v2-row-label">${label}</span><span class="lab-v2-value"><span data-value="${id}">${esc((options.find(o => o[0] === value) || options[0])[1])}</span><span class="lab-v2-value-chevron" aria-hidden="true">›</span></span><select class="lab-v2-row-select" id="${id}" aria-label="${label}">${options.map(([v, l]) => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
function openSettings() {
  closeAllPopups();
  const voices = bookVoices();
  const eink = pageTheme === 'eink';
  const rates = [...new Set([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, prefs.rate])].sort((a, b) => a - b);
  const layer = document.createElement('div');
  layer.className = 'lab-v2-sheet-layer byob-settings'; layer.dataset.testid = 'lab-v2-sheet-layer';
  layer.innerHTML = `<button type="button" class="lab-super-scrim" aria-label="Close"></button>
    <section class="lab-v2-sheet" data-testid="lab-v2-sheet" data-layer="reading" aria-label="Settings">
      <div class="lab-v2-head is-titled"><h2 class="lab-v2-title">Settings</h2><button type="button" class="lab-v2-dismiss" aria-label="Close">×</button></div>
      <div class="lab-v2-sheet-body">
        <div class="lab-v2-themes" data-testid="lab-v2-themes">${[['book', 'Book'], ['light', 'Light'], ['dark', 'Dark']].map(([t, l]) => `<button type="button" class="lab-v2-theme is-${t}${!eink && pageTheme === t ? ' is-active' : ''}" data-theme-choice="${t}" data-testid="lab-v2-theme-${t}" aria-pressed="${!eink && pageTheme === t}"><span class="lab-v2-theme-face">Aa</span><span class="lab-v2-theme-label">${l}</span></button>`).join('')}${eink ? '<button type="button" class="lab-v2-theme is-eink is-active" aria-pressed="true" data-testid="lab-v2-theme-eink"><span class="lab-v2-theme-face">Aa</span><span class="lab-v2-theme-label">E-ink</span></button>' : ''}</div>
        <div class="lab-v2-size"><span class="lab-v2-size-small" aria-hidden="true">A</span><input class="lab-v2-slider" type="range" aria-label="${isEpub() ? 'Text size' : 'Page size'}" data-testid="lab-v2-size" min="0.5" max="3" step="0.05" value="${state.zoom}"><span class="lab-v2-size-large" aria-hidden="true">A</span></div>
        <div class="lab-v2-rows">
          ${toggleRow('full', 'Full width', !!prefs.full)}
          ${toggleRow('trim', 'Trim page margins', !!state.trim, isEpub())}
          ${toggleRow('screen', 'Full screen', !!document.fullscreenElement)}
          ${isEpub() ? '' : selectRow('voiceSel', 'Voice', prefs.voice, [['', 'Device voice'], ...voices.map(v => [v.name, v.name])])}
          ${isEpub() ? '' : selectRow('rateSel', 'Speed', String(prefs.rate), rates.map(r => [String(r), r + '×']))}
        </div>
        <p class="lab-v2-note">${isEpub() ? '' : 'Read aloud uses this device’s own voice; nothing is recorded. '}${esc(imgNote)}</p>
      </div>
    </section>`;
  const close = () => layer.remove();
  layer.querySelector('.lab-super-scrim').onclick = close;
  layer.querySelector('.lab-v2-dismiss').onclick = close;
  layer.querySelectorAll('[data-theme-choice]').forEach(b => b.onclick = () => {
    setTheme(b.dataset.themeChoice);
    layer.querySelectorAll('[data-theme-choice]').forEach(o => { const on = o.dataset.themeChoice === pageTheme; o.classList.toggle('is-active', on); o.setAttribute('aria-pressed', String(on)) });
    layer.querySelector('[data-testid="lab-v2-theme-eink"]')?.remove();
  });
  let sizeTimer;
  layer.querySelector('[data-testid="lab-v2-size"]').oninput = e => { const z = Number(e.target.value); clearTimeout(sizeTimer); sizeTimer = setTimeout(() => setZoom(z, { quick: true }), 60) };
  layer.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
    const t = b.dataset.t;
    if (t === 'screen') { toggleFullscreen().then(on => b.setAttribute('aria-checked', String(on))); return }
    if (t === 'trim') setTrim(!state.trim); if (t === 'full') setFull(!prefs.full);
    b.setAttribute('aria-checked', String(t === 'trim' ? state.trim : !!prefs[t]));
  });
  const sync = (sel, fn) => { const el = layer.querySelector('#' + sel); if (!el) return; el.onchange = e => { fn(e.target.value); layer.querySelector(`[data-value="${sel}"]`).textContent = e.target.selectedOptions[0]?.textContent || '' } };
  sync('rateSel', v => { prefs.rate = Number(v); savePrefs(); renderTransport() });
  sync('voiceSel', v => { prefs.voice = v; savePrefs() });
  root.appendChild(layer);
  layer.querySelector('.lab-v2-dismiss').focus({ preventScroll: true });
}
function setFull(on) { prefs.full = on; savePrefs(); if (state.pages.length) setZoom(state.zoom) }
async function toggleFullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen() } catch { toast('Full screen is not available here. Use Full width instead.') }
  return !!document.fullscreenElement;
}
function setTrim(on) { prefs.trim = state.trim = on; savePrefs(); if (state.pages.length) setZoom(state.zoom); else applyCrop() }

/* ---------- Chapters: from the scan (js/pdf-scan.js), kept with the book ---------- */
const toc = { entries: [], ready: false, expanded: new Set(), nav: 'pages' };
let chapterTitles = null;
/** The shared house-style rule for chapter titles; titles stay as written if it cannot load. */
function chapterTitleStyle() {
  chapterTitles ??= import('/lab/chapter-title.js?v=20261009rel10').then(m => (label, language) => m.normalizeChapterTitle(label, { language: language || 'en' })).catch(() => label => label);
  return chapterTitles;
}
async function buildContents() {
  const token = state.token, key = state.key, pdf = state.pdf;
  toc.ready = false; toc.entries = [];
  let scan = state.scan;
  if (!scan) {
    let heard;
    state.titleReady = new Promise(r => { heard = r });
    // A new scan: run at the first open (and again when SCAN_VERSION moves on), then kept on
    // the book's record with the title, author and page count the library shows.
    scan = await TinctPdfScan.scan(pdf, {
      fileName: state.name,
      items: async n => (await pageText(n)).items,
      live: () => token === state.token,
      onTitle: t => { if (token === state.token) setBookTitle(t.title, t.author); heard() },
    }).catch(() => null);
    heard();
    if (token !== state.token) return;
    if (!scan) scan = { v: 0, title: state.title, author: state.author, pages: pdf.numPages, nav: 'pages', entries: [] };
    // Shown in Tinct's house style: never ALL CAPS, never Roman numerals (app/public/lab/chapter-title.js).
    const house = await chapterTitleStyle();
    if (token !== state.token) return;
    // In the document's own language: "CHAPITRE XII." -> "Chapitre 12", "II." -> "2".
    scan = { ...scan, entries: scan.entries.map(e => ({ ...e, label: house(e.label, scan.language) })) };
    state.scan = scan;
    if (scan.v) await library.touch(key, { title: scan.title, author: scan.author, pages: scan.pages, scan });
    store.del('toc:' + key);
  }
  setBookTitle(scan.title, scan.author);
  applyBookLanguage();
  if (hasNoText()) toast(NO_TEXT, { hold: true });
  toc.entries = scan.entries.slice().sort((a, b) => a.page - b.page);
  toc.nav = toc.entries.length ? scan.nav : 'pages';
  toc.ready = true;
  onScroll();
}
// The document's language (the scan's), for read-aloud's voice and the pages' text; English when unknown.
const bookLang = () => (isEpub() ? state.epub?.language : state.scan?.language) || 'en';
// A scan without a text layer (no scanned page has text): read aloud, Summarize and Catch me up
// have nothing to read, so they are switched off rather than run over empty pages.
const hasNoText = () => !isEpub() && state.scan?.textPages === 0;
const NO_TEXT = 'This PDF is a scan without text, so it can’t be read aloud or summarized.';
function applyBookLanguage() {
  const lang = bookLang();
  for (const p of state.pages) if (p.kind !== 'epub') p.pg.lang = lang;
  const off = hasNoText();
  $('playBtn').disabled = off;
  if (off) $('playBtn').setAttribute('aria-disabled', 'true'); else $('playBtn').removeAttribute('aria-disabled');
}
const leafEntries = () => toc.entries.filter(e => e.kind !== 'part' || !toc.entries.some(c => c.parent === e.id));
function chapterAt(page) {
  let cur = null;
  for (const e of leafEntries()) if (e.page <= page) cur = e;
  return cur;
}
function goToEntry(e) {
  const el = isEpub() && e.anchor && document.getElementById('c' + (e.page - 1) + '-' + e.anchor.replace(/[^\w-]/g, '_'));
  if (el) { const s = $('scroll'); s.scrollTo({ top: s.scrollTop + el.getBoundingClientRect().top - s.getBoundingClientRect().top - 24 }); return }
  goTo({ page: e.page, frac: 0 });
}
function chapterRange(e) {
  const leaves = leafEntries(), i = leaves.indexOf(e);
  const next = leaves.slice(i + 1).find(n => n.page > e.page);
  return { from: e.page, to: next ? next.page - 1 : state.pages.length };
}
function openContents() {
  if (!hasBook()) return;
  closeAllPopups();
  const page = currentPlace().page, cur = chapterAt(page);
  if (cur?.parent) toc.expanded.add(cur.parent);
  const layer = document.createElement('div');
  layer.className = 'lab-contents-v2'; layer.dataset.testid = 'lab-toc';
  const ICON_NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>';
  const pie = pct => { const a = Math.min(99.9, pct) / 100 * Math.PI * 2, x = 8 + 7 * Math.sin(a), y = 8 - 7 * Math.cos(a); return `<svg class="progress-pie" viewBox="0 0 16 16" aria-hidden="true"><title>${pct}% read</title><circle class="track" cx="8" cy="8" r="7"></circle><path class="fill" d="M8 8 L8 1 A7 7 0 ${pct > 50 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z"></path></svg>` };
  const node = e => {
    const kids = toc.entries.filter(c => c.parent === e.id), branch = kids.length > 0, open = toc.expanded.has(e.id);
    const reading = cur && cur.id === e.id, onPath = cur && cur.parent === e.id;
    let pct = 0;
    if (reading) { const r = chapterRange(e); pct = Math.max(1, Math.round(((page - r.from) / Math.max(1, r.to - r.from + 1)) * 100)) }
    return `<li data-id="${e.id}" class="${branch ? 'branch' : ''} ${open ? 'open' : ''} ${reading ? 'reading' : ''} ${onPath ? 'on-path' : ''}">${e.parent ? '<span class="curve"></span>' : ''}
      <div class="node"><button class="label" data-go="${e.id}" ${branch ? `aria-expanded="${open}"` : ''} ${reading ? 'aria-current="page"' : ''} aria-label="${esc(e.label)}${reading ? ', currently reading' : ''}, page ${e.page}"><span class="text">${esc(e.label)}</span>${branch ? ICON_NEXT : reading ? pie(pct) : ''}</button></div>
      ${branch && open ? `<ul class="nested"><button class="rail" data-collapse="${e.id}" aria-label="Collapse ${esc(e.label)}" tabindex="-1"></button>${kids.map(node).join('')}${kids.some(k => cur && k.id === cur.id) ? '<span class="gold-branch"></span>' : ''}</ul>` : ''}</li>`;
  };
  const tops = toc.entries.filter(e => !e.parent);
  layer.innerHTML = `<button class="lc-scrim" aria-label="Close contents" tabindex="-1"></button>
    <div class="menu" role="dialog" aria-modal="true" aria-label="Contents">
      <header><button class="title" aria-label="${esc(state.title)}, close contents">${esc(state.title)}</button><div class="actions"><button aria-label="Back to book" data-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12"></path></svg></button></div></header>
      <div class="viewport">
        <form class="byob-jump byob-toc-jump"${isEpub() ? ' hidden' : ''}><label for="jumpInput">Go to page</label><input id="jumpInput" inputmode="numeric" value="${page}"><span>of ${state.pages.length}</span><button type="submit">Go</button></form>
        ${toc.ready ? (tops.length ? `<nav class="tree" aria-label="Chapters"><ul>${tops.map(node).join('')}</ul></nav>` : isEpub() ? '<p class="status">This book has no table of contents.</p>' : pageList(page)) : '<p class="status" role="status">Reading the book’s contents…</p>'}
      </div></div>`;
  const close = () => layer.remove();
  layer.querySelector('.lc-scrim').onclick = close;
  layer.querySelector('[data-close]').onclick = close;
  layer.querySelector('.title').onclick = close;
  layer.querySelector('form').onsubmit = ev => { ev.preventDefault(); const n = parseInt(layer.querySelector('#jumpInput').value, 10); if (n) goTo({ page: n, frac: 0 }); close() };
  layer.querySelectorAll('[data-go]').forEach(b => b.onclick = () => {
    const e = toc.entries.find(x => x.id === b.dataset.go);
    if (toc.entries.some(c => c.parent === e.id)) { toc.expanded.has(e.id) ? toc.expanded.delete(e.id) : toc.expanded.add(e.id); close(); openContents(); return }
    close(); goToEntry(e);
  });
  layer.querySelectorAll('[data-collapse]').forEach(b => b.onclick = () => { toc.expanded.delete(b.dataset.collapse); close(); openContents() });
  layer.querySelectorAll('[data-page]').forEach(b => b.onclick = () => { close(); goTo({ page: Number(b.dataset.page), frac: 0 }) });
  root.appendChild(layer);
  if (!toc.ready) { const t = setInterval(() => { if (toc.ready) { clearInterval(t); if (layer.isConnected) { close(); openContents() } } else if (!layer.isConnected) clearInterval(t) }, 400) }
  layer.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'center' });
}

// A PDF without real chapters is read by page: its pages, in the contents' rows.
const PAGE_LIST_MAX = 80;
function pageList(current) {
  const n = state.pages.length;
  if (n > PAGE_LIST_MAX) return '';
  return `<nav class="tree byob-pages" aria-label="Pages"><ul>${Array.from({ length: n }, (_, i) => i + 1).map(k => `<li class="${k === current ? 'reading' : ''}"><div class="node"><button class="label" data-page="${k}"${k === current ? ' aria-current="page"' : ''}><span class="text">p. ${k}</span></button></div></li>`).join('')}</ul></nav>`;
}

/* ---------- Switch books: the reader's book switcher (src/lab/LabBookSwitcher.tsx) ---------- */
// Reading now: Tinct's books and the reader's own, from this device (/lab/library-add.js,
// src/lab/userBook/ownSwitcher.ts); Library goes to My shelf.
const SWITCHER_ENGINE = '/lab/library-add.js?v=20261009shelf';
let switcherEngine = null;
function switcherApi() {
  switcherEngine ??= import(SWITCHER_ENGINE).then(() => { const api = window.__tinctLibraryAdd; if (!api?.switcherRows) throw new Error('switcher unavailable'); return api });
  switcherEngine.catch(() => { switcherEngine = null });
  return switcherEngine;
}
function closeSwitcher() { const el = document.querySelector('.byob-switcher'); if (!el) return; el.remove(); $('bookBtn').focus({ preventScroll: true }) }
// The switcher's covers and titles follow the library's rules (/lab/book-cover.js, /lab/book-title.js):
// a book's image (a painting's small file at 32 px), else its paper cover; the short title in the one-line row.
const SWITCHER_LOOKS = '?v=20261009shelf';
let switcherLooks = null;
function loadSwitcherLooks() {
  switcherLooks ??= Promise.all([import('/lab/book-cover.js' + SWITCHER_LOOKS), import('/lab/book-title.js' + SWITCHER_LOOKS)])
    .then(([cover, title]) => ({ paper: cover.paperCoverUrl, short: title.shortTitle }), () => ({ paper: () => '', short: t => t }));
  return switcherLooks;
}
function switcherCover(src, { srcSet = null, title = '', author = '', kind = '', looks = null } = {}) {
  const image = src || (looks ? looks.paper(title, author, kind) : '');
  const set = src && srcSet ? ` srcset="${esc(srcSet)}" sizes="32px"` : '';
  return `<span class="lab-book-switcher-cover${image ? '' : ' is-fallback'}" aria-hidden="true">${image ? `<img src="${esc(image)}"${set} alt="" decoding="async">` : ''}</span>`;
}
async function openSwitcher() {
  if (!hasBook()) return;
  if (document.querySelector('.byob-switcher')) return closeSwitcher();
  closeAllPopups();
  const id = 'userbook-' + hexOf(state.key), rec = await library.get(state.key);
  const place = currentPlace();
  const current = { bookId: id, title: state.title, chapterLabel: isEpub() ? '' : `p. ${place.page} of ${state.pages.length}`, cover: rec?.cover || '' };
  const layer = document.createElement('div');
  layer.className = 'lab-book-switcher-backdrop byob-switcher'; layer.dataset.testid = 'lab-book-switcher';
  let rows = [], loading = true, error = '';
  const looks = await loadSwitcherLooks();
  const short = t => looks.short(t);
  const paint = () => {
    const active = rows.find(r => r.bookId === id);
    const ordered = active ? [active, ...rows.filter(r => r !== active)] : rows;
    const row = (r, i) => { const on = r.bookId === id; return `<button type="button" class="lab-book-switcher-row${on ? ' is-active' : ''}"${on ? ' aria-current="true"' : ''} data-row="${i}">${switcherCover(on ? current.cover || r.coverSrc : r.coverSrc, { srcSet: on && current.cover ? null : r.coverSrcSet, title: on ? current.title : r.title, author: r.author, kind: r.kind, looks })}<span class="lab-book-switcher-copy"><strong title="${esc(on ? current.title : r.title)}">${esc(short(on ? current.title : r.title))}</strong><small>${esc(on ? current.chapterLabel : r.chapterLabel)}</small></span>${on ? '<span class="lab-book-switcher-check" aria-hidden="true">✓</span>' : ''}</button>` };
    layer.innerHTML = `<section class="lab-book-switcher" role="dialog" aria-modal="true" aria-label="Switch books">
      <header class="lab-book-switcher-head"><span>Reading now</span><button type="button" data-close aria-label="Close book switcher">×</button></header>
      <div class="lab-book-switcher-list">
        ${active ? '' : `<button type="button" class="lab-book-switcher-row is-active" aria-current="true" data-close>${switcherCover(current.cover, { title: current.title, author: state.author || '', kind: state.kind || '', looks })}<span class="lab-book-switcher-copy"><strong title="${esc(current.title)}">${esc(short(current.title))}</strong><small>${esc(current.chapterLabel)}</small></span><span class="lab-book-switcher-check" aria-hidden="true">✓</span></button>`}
        ${ordered.map((r, i) => row(r, rows.indexOf(r))).join('')}
        ${loading && !ordered.length ? '<p class="lab-book-switcher-status">Loading your books…</p>' : ''}
        ${error ? `<p class="lab-book-switcher-status" role="status">${esc(error)}</p>` : ''}
      </div>
      <button type="button" class="lab-book-switcher-library" data-library><svg class="lab-book-switcher-library-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l3-1 4 15-3 1z"></path></svg><span>Library</span><span class="lab-book-switcher-library-arrow" aria-hidden="true">→</span></button>
    </section>`;
    layer.querySelectorAll('[data-close]').forEach(b => b.onclick = closeSwitcher);
    layer.querySelector('[data-library]').onclick = () => leaveToShelf();
    layer.querySelectorAll('[data-row]').forEach(b => b.onclick = () => {
      const r = rows[Number(b.dataset.row)];
      if (!r || r.bookId === id) return closeSwitcher();
      switcherApi().then(api => { const to = api.switcherTarget(r); if (!to) { error = 'That saved place is temporarily unavailable.'; paint(); return } leavePlace(); stopNarration(); location.assign(to) }, () => { error = 'That book could not be opened from here.'; paint() });
    });
    (layer.querySelector('.lab-book-switcher-row.is-active') || layer.querySelector('[data-close]'))?.focus({ preventScroll: true });
  };
  layer.addEventListener('pointerdown', e => { if (e.target === layer) closeSwitcher() });
  paint();
  root.appendChild(layer);
  savePlaceNow();
  try { const res = await (await switcherApi()).switcherRows(); rows = res.rows; error = res.error } catch { error = 'Showing this book only.' }
  loading = false;
  if (layer.isConnected) paint();
}

/* ---------- Reader windows: drag by the header, resize from the corner (desktop) ---------- */
function makeWindow(el, handle, key) {
  if (isPhone() || el._win) return;
  el._win = true;
  const saved = store.get('win:' + key);
  if (saved) Object.assign(el.style, { left: saved.left + 'px', top: saved.top + 'px', width: saved.width + 'px', height: saved.height ? saved.height + 'px' : el.style.height });
  let grip = el.querySelector(':scope > [data-reader-window-resize]');
  if (!grip) { grip = document.createElement('button'); grip.type = 'button'; grip.dataset.readerWindowResize = 'true'; grip.setAttribute('aria-label', 'Resize panel'); el.appendChild(grip) }
  handle.dataset.readerWindowHandle = 'true';
  const clamp = () => {
    const r = el.getBoundingClientRect();
    el.style.left = Math.max(8, Math.min(innerWidth - 120, r.left)) + 'px';
    el.style.top = Math.max(8, Math.min(innerHeight - 60, r.top)) + 'px';
  };
  const save = () => { const r = el.getBoundingClientRect(); store.set('win:' + key, { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: key === 'chat' ? Math.round(r.height) : 0 }) };
  const drag = (ev, mode) => {
    if (ev.button !== 0 || (mode === 'move' && ev.target.closest('button:not([data-reader-window-handle])'))) return;
    ev.preventDefault();
    const r = el.getBoundingClientRect(), sx = ev.clientX, sy = ev.clientY;
    el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.transform = 'none';
    const move = e => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (mode === 'move') { el.style.setProperty('left', (r.left + dx) + 'px', 'important'); el.style.setProperty('top', (r.top + dy) + 'px', 'important') }
      else { el.style.width = Math.max(300, r.width + dx) + 'px'; el.style.height = Math.max(240, r.height + dy) + 'px'; el.style.maxHeight = 'none' }
    };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); clamp(); save() };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  };
  handle.addEventListener('pointerdown', ev => drag(ev, 'move'));
  grip.addEventListener('pointerdown', ev => drag(ev, 'resize'));
}

/* ---------- Tinct's audio controls for read-aloud ---------- */
const SKIP = dir => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${dir === 'back' ? 'M8.25 7.15H4.7v-3.5M4.9 7.05A8 8 0 1 1 4.15 15' : 'M15.75 7.15h3.55v-3.5M19.1 7.05A8 8 0 1 0 19.85 15'}"></path><text x="12" y="14.15" text-anchor="middle" fill="currentColor" stroke="none" font-size="6.5" font-family="system-ui, sans-serif">15</text></svg>`;
function renderTransport() {
  let bar = document.querySelector('.byob-transport');
  const show = narr.active || narr.paused;
  if (!show) { bar?.remove(); document.querySelector('.lab-audio-speed-popover')?.remove(); root.dataset.transport = 'closed'; return }
  root.dataset.transport = 'open';
  const playing = narr.active;
  const ch = chapterAt(narr.page), r = ch ? chapterRange(ch) : { from: 1, to: state.pages.length };
  const pos = Math.max(0, Math.min(1, (narr.page - r.from + (narr.prep ? narr.index / Math.max(1, narr.prep.sentences.length) : 0)) / Math.max(1, r.to - r.from + 1)));
  const playIcon = playing ? ICON.pause.replace(/20\.7/g, '22') : ICON.play.replace(/20\.7/g, '22');
  if (isPhone()) {
    if (!bar || bar.tagName !== 'FOOTER') { bar?.remove(); bar = document.createElement('footer'); bar.className = 'lab-phone-bar byob-transport'; root.appendChild(bar) }
    bar.innerHTML = `<div class="lab-phone-bar-row is-audio has-5">
      <button type="button" class="lab-phone-fat lab-audio-control lab-audio-speed" data-a="speed" aria-label="Playback speed ${prefs.rate} times. Open speed control">${prefs.rate}×</button>
      <button type="button" class="lab-phone-fat lab-audio-control" data-a="back" aria-label="Back 15 seconds">${SKIP('back')}</button>
      <button type="button" class="lab-phone-fat lab-audio-control is-active" data-a="play" aria-label="${playing ? 'Pause audiobook' : 'Resume audiobook'}">${playIcon}</button>
      <button type="button" class="lab-phone-fat lab-audio-control" data-a="forward" aria-label="Forward 15 seconds">${SKIP('forward')}</button>
      <button type="button" class="lab-phone-fat lab-audio-control" data-a="chat" aria-label="Chat">${ICON.chat}</button></div>`;
  } else {
    if (!bar || bar.tagName !== 'SECTION') { bar?.remove(); bar = document.createElement('section'); bar.className = 'lab-desktop-audio-dock byob-transport'; bar.setAttribute('aria-label', 'Audio player'); root.appendChild(bar) }
    bar.innerHTML = `<button type="button" class="lab-desktop-audio-speed" data-a="speed" aria-label="Playback speed ${prefs.rate} times">${prefs.rate}×</button>
      <button type="button" data-a="back" aria-label="Back 15 seconds">${SKIP('back')}</button>
      <button type="button" class="is-primary" data-a="play" aria-label="${playing ? 'Pause' : 'Resume audiobook'}">${playIcon}</button>
      <button type="button" data-a="forward" aria-label="Forward 15 seconds">${SKIP('forward')}</button>
      <div class="lab-desktop-audio-track"><strong>${esc(state.title)}</strong><span>${esc(ch ? ch.label : 'p. ' + narr.page)} · device voice</span>
        <i role="slider" tabindex="0" aria-label="Chapter position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pos * 100)}" aria-valuetext="${Math.round(pos * 100)}% of ${esc(ch ? ch.label : 'the book')}"><b style="width:${(pos * 100).toFixed(1)}%"></b></i></div>
      <button type="button" data-a="chat" aria-label="Chat about this book">${ICON.chat.replace(/18/g, '22')}</button>
      ${playing ? '' : '<button type="button" class="lab-desktop-audio-dismiss" data-a="close" aria-label="Close audio controls"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"></path></svg></button>'}`;
    const slider = bar.querySelector('[role="slider"]');
    slider.onpointerdown = ev => { const rr = slider.getBoundingClientRect(); seekChapter((ev.clientX - rr.left) / rr.width) };
    slider.onkeydown = ev => { if (ev.key === 'ArrowLeft') { ev.preventDefault(); skip(-1) } if (ev.key === 'ArrowRight') { ev.preventDefault(); skip(1) } };
  }
  bar.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'play') togglePlay();
    if (a === 'back') skip(-1);
    if (a === 'forward') skip(1);
    if (a === 'chat') openChat();
    if (a === 'speed') speedPopover();
    if (a === 'close') { narr.paused = false; renderTransport() }
  });
}
function speedPopover() {
  const old = document.querySelector('.lab-audio-speed-popover'); if (old) { old.remove(); return }
  const pop = document.createElement('section');
  pop.className = 'lab-audio-speed-popover'; pop.setAttribute('aria-label', 'Playback speed');
  pop.innerHTML = `<div class="lab-audio-speed-heading"><span>Playback speed</span><output>${prefs.rate}×</output><button type="button" class="lab-audio-speed-done">Done</button></div>
    <input class="lab-v2-slider" type="range" min="0.5" max="3" step="0.25" value="${prefs.rate}" aria-label="Playback speed">
    <div class="lab-audio-speed-scale" aria-hidden="true"><span>0.5×</span><span>1×</span><span>2×</span><span>3×</span></div>`;
  root.appendChild(pop);
  pop.querySelector('input').oninput = e => { prefs.rate = Number(e.target.value); savePrefs(); pop.querySelector('output').textContent = prefs.rate + '×'; renderTransport() };
  pop.querySelector('.lab-audio-speed-done').onclick = () => pop.remove();
}

/* ---------- Claude: on the reader's own account ---------- */
// Tinct's reading companion through the page's Tinct account (js/tinct-api.js). Signed in,
// pictures (a PDF page or passage, a snip, an attached image) go with the question; signed
// out, or if a picture is refused, figure questions use the caption, the labels inside the
// figure and a rough text sketch of its shape.
let sample = null, sampleImages = null, imgNote = 'Pictures you attach or snip are sent to the reading companion when you are signed in.';
function aiBook() {
  const pl = hasBook() ? currentPlace() : null, ch = pl && toc.ready ? chapterAt(pl.page) : null;
  return { title: state.title, author: state.author, chapter: ch?.label || (pl ? (isEpub() ? state.title : 'Page ' + pl.page) : ''), page: pl?.page, pages: state.pages.length };
}
async function ai() {
  if (sample) return sample;
  if (!window.TinctAI) return null;
  const f = (input, opts = {}) => TinctAI.ask(input, { ...opts, book: aiBook() });
  f.json = (input, opts = {}) => TinctAI.askJson(input, { ...opts, book: aiBook() });
  f.limits = async () => ({ maxPromptBytes: 200000, images: TinctAI.imageLimits });
  sample = f;
  return f;
}
const AI_OFF = 'The reading companion could not be reached. Check your connection and try again.';
function errorCopy(e) {
  switch (e?.code) {
    case 'session_expired': return 'Your Tinct sign-in has expired. Sign in again on tinct.app, then try again.';
    case 'rate_limited': return 'That was a lot of questions in a short time. Wait a minute, then try again.';
    case 'quota': return 'You have used this month’s companion allowance.';
    case 'busy': return 'The companion is busy, or today’s guest allowance is used up. Sign in to Tinct, or try again later.';
    case 'prompt_too_large': return 'That is too much text at once. Select less, or summarize a shorter part.';
    case 'offline': return 'No connection. Check your internet and try again.';
    case 'not_granted': return 'The companion is not available for this account.';
    default: return 'The answer could not be loaded. Try again.';
  }
}
function md(text) {
  // Small Markdown subset: paragraphs, bullet lists, **bold**, *italic*.
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>');
  return text.trim().split(/\n{2,}/).map(block => {
    const lines = block.split('\n');
    if (lines.every(l => /^\s*[-*•]\s+/.test(l))) return '<ul>' + lines.map(l => `<li>${inline(l.replace(/^\s*[-*•]\s+/, ''))}</li>`).join('') + '</ul>';
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}
async function pageImage(n, region) {
  // A picture of the printed page (or a region of it), so maths survives.
  const p = state.pages[n - 1];
  if (!PAGE_IMAGES || sampleImages === false || !p) return null;
  let src = drawn(p);
  if (!src) {
    const page = await state.pdf.getPage(n);
    const vp = page.getViewport({ scale: 1100 / page.getViewport({ scale: 1 }).width });
    src = document.createElement('canvas'); src.width = vp.width; src.height = vp.height;
    await page.render({ canvasContext: src.getContext('2d', { alpha: false }), viewport: vp }).promise;
  }
  const c = document.createElement('canvas');
  const r = region || { x: 0, y: 0, w: src.width, h: src.height };
  c.width = Math.max(1, Math.round(r.w)); c.height = Math.max(1, Math.round(r.h));
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(src, r.x, r.y, r.w, r.h, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(res, 'image/png'));
}
async function contextText(from, to, budget) {
  let out = '';
  for (let n = from; n <= to && out.length < budget; n++) out += `\n[${isEpub() ? (toc.entries.find(e => e.page === n)?.label || 'Section ' + n) : 'Page ' + n}]\n` + (await pageText(n)).text;
  return out.slice(0, budget);
}
const bookLine = () => `The reader is reading their own copy of ${isEpub() ? 'an EPUB' : 'a PDF'} titled "${state.title}"${state.author ? ' by ' + state.author : ''}. They have confirmed they are entitled to use it.`;

/* ---------- Selection: Explain / Chat / Copy ---------- */
let sel = null;
function selectionInfo() {
  const s = getSelection();
  if (!s || s.isCollapsed || !s.rangeCount) return null;
  const range = s.getRangeAt(0);
  const node = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
  const sheetEl = node?.closest('.pdf-sheet, .epub-sheet') || range.startContainer.parentElement?.closest('.pdf-sheet, .epub-sheet');
  const text = s.toString().replace(/\s+/g, ' ').trim();
  if (!sheetEl || text.length < 2) return null;
  const rects = selectionShapes(range);
  if (!rects.length) return null;
  const box = rects.reduce((a, r) => ({ left: Math.min(a.left, r.left), top: Math.min(a.top, r.top), right: Math.max(a.right, r.right), bottom: Math.max(a.bottom, r.bottom) }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
  return { text, page: Number(sheetEl.dataset.page), box };
}
let selTimer;
document.addEventListener('selectionchange', () => {
  clearTimeout(selTimer);
  selTimer = setTimeout(() => {
    const info = selectionInfo();
    const pop = document.querySelector('.selection-popup');
    if (!info) { if (pop && pop.dataset.popupMode === 'main') hideSelection(); return }
    if (pop && pop.dataset.popupMode === 'explain') return;
    sel = info; showSelection();
  }, isPhone() ? 450 : 250);
});
function placePopup(el, box, width) {
  const below = innerHeight - box.bottom > 240 || box.top < 260;
  const left = Math.max(8, Math.min(innerWidth - width - 8, (box.left + box.right) / 2 - width / 2));
  el.style.position = 'fixed'; el.style.left = left + 'px'; el.style.width = width + 'px';
  if (below) { el.style.top = (box.bottom + 10) + 'px'; el.style.bottom = 'auto' } else { el.style.top = 'auto'; el.style.bottom = (innerHeight - box.top + 10) + 'px' }
  el.classList.toggle('selection-popup-below', below); el.classList.toggle('selection-popup-above', !below);
  const r = el.getBoundingClientRect();
  el.style.setProperty('--anchored-popup-x', left + 'px');
  el.style.setProperty('--anchored-popup-y', (below ? box.bottom + 10 : Math.max(8, box.top - 10 - r.height)) + 'px');
  el.style.setProperty('--selection-popup-top', (below ? box.bottom + 10 : box.top - 10) + 'px');
  el.style.setProperty('--explain-available-height', Math.max(240, below ? innerHeight - box.bottom - 24 : box.top - 24) + 'px');
}
function showSelection(existing) {
  hideSelection();
  const pop = document.createElement('div');
  pop.tabIndex = -1;
  pop.className = 'selection-popup is-compact is-lab selection-popup-below';
  pop.dataset.popupMode = 'main';
  pop.innerHTML = `${existing ? paletteHtml(highlights().find(x => x.id === existing.id)?.color || 'gold') : ''}<div class="popup-compact-menu">
    <button type="button" class="popup-menu-action" data-a="explain" data-dock="1"><span class="popup-highlight-symbol" aria-hidden="true">✧</span><span>Explain</span></button>
    <button type="button" class="popup-menu-action" data-a="ask">${CHAT_SVG}<span>Chat</span></button>
    ${existing ?'<button type="button" class="popup-menu-action" data-a="unhighlight"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2h12v12H2z"></path><path d="m5 5 6 6M11 5l-6 6"></path></svg><span>Remove highlight</span></button>' : '<button type="button" class="popup-menu-action" data-a="highlight">' + HIGHLIGHT_SVG + '<span>Highlight</span></button>'}
    <button type="button" class="popup-menu-action" data-a="copy"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="9" height="9" rx="1"></rect><path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2"></path></svg><span>Copy</span></button></div>`;
  root.appendChild(pop);
  placePopup(pop, sel.box, 220);
  pop.addEventListener('mousedown', e => e.preventDefault());
  pop.querySelector('[data-a="explain"]').onclick = () => {
    if (isPhone()) return explain(pop);
    const s = sel; hideSelection(); getSelection().removeAllRanges();
    openChat({ passage: s, prompt: 'Explain the passage I selected: what it says, what it means here, and any notation or terms, in plain language. Two to four short paragraphs.', display: 'Explain this passage.' });
  };
  pop.querySelector('[data-a="ask"]').onclick = () => { const s = sel; hideSelection(); getSelection().removeAllRanges(); openChat({ passage: s }) };
  pop.querySelector('[data-a="highlight"]')?.addEventListener('click', () => { const box = sel.box, ids = addHighlight(sel); getSelection().removeAllRanges(); if (ids?.length) showPalette(ids, box); else hideSelection() });
  pop.querySelector('[data-a="unhighlight"]')?.addEventListener('click', () => { removeHighlight(existing.id); hideSelection() });
  if (existing) pop.querySelectorAll('[data-color]').forEach(b => b.onclick = () => { recolorHighlight(existing.id, b.dataset.color); pop.querySelectorAll('[data-color]').forEach(o => { o.classList.toggle('is-selected', o === b); o.setAttribute('aria-pressed', o === b) }) });
  pop.querySelector('[data-a="copy"]').onclick = async () => {
    try { await navigator.clipboard.writeText(sel.text); toast('Copied.') } catch { toast('Copy did not work here. Use your device’s copy instead.') }
    hideSelection();
  };
}
function hideSelection() { document.querySelectorAll('.selection-popup').forEach(p => { p._ctl?.abort(); p.remove() }); clearRegion() }
function selectionRegion(info) {
  const p = state.pages[info.page - 1];
  if (!p?.canvas) return null;
  const cr = p.canvas.getBoundingClientRect(), k = p.canvas.width / cr.width, pad = 18;
  const x = Math.max(0, (Math.max(info.box.left, cr.left) - cr.left - pad * 3) * k);
  const y = Math.max(0, (info.box.top - cr.top - pad) * k);
  const right = Math.min(p.canvas.width, (Math.min(info.box.right, cr.right) - cr.left + pad * 3) * k);
  const bottom = Math.min(p.canvas.height, (info.box.bottom - cr.top + pad) * k);
  return { x, y, w: right - x, h: bottom - y };
}
async function explain(pop) {
  const info = sel;
  pop.dataset.popupMode = 'explain';
  pop.classList.add('is-contextual-explain');
  pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Explain this passage'); pop.dataset.readerWindow = 'true';
  pop.innerHTML = `<section class="lab-contextual-explain" aria-label="Explanation">
    <header class="lab-reader-window-head"><span class="lab-reader-window-title" aria-hidden="true"></span><button type="button" class="lab-window-control" aria-label="Close explanation">×</button></header>
    <div class="lab-contextual-explain-scroll"><div role="status" aria-live="polite" aria-busy="true"><p class="lab-ask-pending">Thinking…</p></div></div>
    <footer>
      <button class="lab-contextual-explain-tool" type="button" data-t="chat" aria-label="Chat about this explanation" disabled>${ICON.chat}</button>
    </footer></section>`;
  placePopup(pop, info.box, Math.min(isPhone() ? innerWidth - 16 : 380, innerWidth - 16));
  makeWindow(pop, pop.querySelector('.lab-reader-window-head'), 'explain');
  pop.querySelector('.lab-window-control').onclick = () => { hideSelection(); getSelection().removeAllRanges() };
  const out = pop.querySelector('[role="status"]');
  const s = await ai();
  if (!s) { out.innerHTML = `<p class="byob-ai-off">${AI_OFF}</p>`; out.setAttribute('aria-busy', 'false'); return }
  const ctl = new AbortController(); pop._ctl = ctl;
  const pageCtx = await contextText(info.page, info.page, 5000);
  const image = await pageImage(info.page, selectionRegion(info));
  const prompt = `You are Tinct's reading companion. ${bookLine()}\n\nExplain the passage they selected on page ${info.page}: what it says, what it means here, and any notation or terms, in plain language for a careful reader. 2 to 4 short paragraphs, no preamble, no headings. Write any maths inline in plain notation.${image ? '\nThe attached image shows the passage exactly as printed. Text extracted from PDFs often garbles equations and symbols, so trust the image over the extracted text.' : ''}\n\nSelected passage (extracted text):\n${info.text.slice(0, 3000)}\n\nThe rest of the page, for context:\n${pageCtx}`;
  let answer = '';
  try {
    const run = imgs => s(prompt, { signal: ctl.signal, images: imgs, onText: ({ text }) => { answer = text; out.innerHTML = md(text) } });
    let res;
    try { res = await run(image ? [image] : undefined); if (image) { sampleImages = true; imgNote = 'pictures reached Claude in this view' } }
    catch (e) { if (!image || (e?.code !== 'images_unavailable' && e?.code !== 'image_rejected')) throw e; if (e.code === 'images_unavailable') { sampleImages = false; imgNote = 'Claude refused pictures in this view (images_unavailable)' } res = await run(undefined) }
    answer = res.text; out.innerHTML = md(answer);
    out.setAttribute('aria-busy', 'false');
    pop.querySelectorAll('.lab-contextual-explain-tool').forEach(b => { b.disabled = false; b.onclick = () => { hideSelection(); getSelection().removeAllRanges(); openChat({ passage: info, explanation: answer, talk: b.dataset.t === 'talk' }) } });
  } catch (e) {
    if (e?.code === 'cancelled') return;
    out.setAttribute('aria-busy', 'false');
    out.innerHTML = (e?.text ? md(e.text) : '') + `<p>${esc(errorCopy(e))}</p><button type="button" class="lab-contextual-explain-link">Try again</button>`;
    out.querySelector('.lab-contextual-explain-link').onclick = () => { sel = info; explain(pop) };
  }
}

/* ---------- Docked chat: a fixed room on the right (desktop) ---------- */
const dock = { state: 'closed', byZoom: false };
function dockWidth() { return Math.max(300, Math.min(prefs.dockW, Math.round(innerWidth * 0.55))) }
const DOCK_INSET = 14;
function setDock(next, { byZoom = false } = {}) {
  if (isPhone()) return;
  dock.state = next; dock.byZoom = byZoom;
  if (!byZoom) { prefs.dock = next === 'closed' ? 'closed' : 'docked'; savePrefs() }
  const reserve = next === 'docked';
  root.classList.toggle('dock-open', reserve);
  root.classList.toggle('dock-overlay', next === 'overlay');
  root.style.setProperty('--dock-w', dockWidth() + 'px');
  if (chat.el) chat.el.hidden = next === 'minimized' || next === 'closed';
  let tab = document.querySelector('.byob-dock-tab');
  if (next === 'minimized') {
    if (!tab) { tab = document.createElement('button'); tab.type = 'button'; tab.className = 'byob-dock-tab'; tab.innerHTML = `${ICON.chat}<span>Chat</span>`; tab.setAttribute('aria-label', 'Show chat'); root.appendChild(tab) }
    tab.onclick = () => setDock(state.zoom > 1 ? 'overlay' : 'docked');
  } else tab?.remove();
  if (state.pages.length && (reserve || next === 'closed' || next === 'minimized')) setZoom(state.zoom);
}
function dockGrip(el) {
  if (el.querySelector('.byob-dock-grip')) return;
  const grip = document.createElement('div');
  grip.className = 'byob-dock-grip'; grip.setAttribute('role', 'separator'); grip.setAttribute('aria-orientation', 'vertical'); grip.setAttribute('aria-label', 'Resize chat'); grip.tabIndex = 0;
  el.prepend(grip);
  grip.addEventListener('pointerdown', ev => {
    ev.preventDefault(); grip.setPointerCapture(ev.pointerId); root.classList.add('is-resizing');
    const move = e => { prefs.dockW = Math.round(innerWidth - DOCK_INSET - e.clientX); root.style.setProperty('--dock-w', dockWidth() + 'px') };
    const up = () => { grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', up); root.classList.remove('is-resizing'); savePrefs(); if (dock.state === 'docked') setZoom(state.zoom) };
    grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', up);
  });
  grip.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); prefs.dockW += e.key === 'ArrowLeft' ? 30 : -30; root.style.setProperty('--dock-w', dockWidth() + 'px'); savePrefs(); if (dock.state === 'docked') setZoom(state.zoom) } });
}

/* ---------- Chat (and Talk) in Tinct's companion pane ---------- */
const chat = { el: null, turns: [], talk: false, ctl: null, passage: null, attach: [], live: null, fresh: false };
function loadTurns() { chat.turns = (store.get('chat:' + state.key) || []).filter(t => t && t.content) }
/* ---------- Images in chat: attach, paste, drop, or snip from the page ---------- */
let imageLimits = null;
async function thumbOf(blob) {
  try {
    const bmp = await createImageBitmap(blob), k = Math.min(1, 220 / bmp.width, 160 / bmp.height);
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.7);
  } catch { return '' }
}
async function addAttachments(files, meta = {}) {
  await ai();
  if (!imageLimits && sample) { try { imageLimits = (await sample.limits())?.images || null } catch { imageLimits = null } }
  for (const f of files) {
    const item = f instanceof Blob ? { blob: f } : f;
    if (item.blob && imageLimits) {
      if (imageLimits.mediaTypes?.length && !imageLimits.mediaTypes.includes(item.blob.type)) { toast('That image type is not supported. Try PNG or JPEG.'); continue }
      if (imageLimits.maxInputBytes && item.blob.size > imageLimits.maxInputBytes) { toast('That image is too large.'); continue }
    }
    const max = imageLimits?.maxCount || 4;
    if (chat.attach.length >= max) { toast(`Up to ${max} images per question.`); break }
    chat.attach.push({ ...item, kind: item.kind, snip: !!meta.snip, page: meta.page ?? item.page, text: meta.text ?? item.text, thumb: item.thumb || (item.blob ? await thumbOf(item.blob) : '') });
  }
  if (!chat.el) openChat({ quiet: true }); renderTray();
  const t = chat.el?.querySelector('textarea'); if (t) { t.dispatchEvent(new Event('input')); t.focus({ preventScroll: true }) }
}
function renderTray() {
  const tray = chat.el?.querySelector('#tray'); if (!tray) return;
  tray.hidden = !chat.attach.length;
  tray.innerHTML = chat.attach.map((a, i) => `<span class="byob-chip">${a.thumb ? `<img src="${a.thumb}" alt="">` : '<i>Snip</i>'}<span class="byob-chip-label">${a.snip ? `${KIND[a.kind] || 'Snip'} · p. ${a.page}` : 'Image'}</span><button type="button" aria-label="Remove image" data-rm="${i}">×</button></span>`).join('');
  tray.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { chat.attach.splice(Number(b.dataset.rm), 1); renderTray(); chat.el.querySelector('textarea').dispatchEvent(new Event('input')) });
}
/* Snip: drag a box on the page; the box is re-rendered sharply from the PDF and sent as an image. */
function startSnip() {
  if (!state.pdf) { toast(isEpub() ? 'Snip works in PDFs. In an EPUB, select the text you want to ask about.' : 'Open a book first.'); return }
  if (document.querySelector('.byob-snip')) return endSnip();
  closeAllPopups(); getSelection().removeAllRanges();
  const ov = document.createElement('div'); ov.className = 'byob-snip'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Snip a figure');
  ov.innerHTML = `<p class="byob-snip-hint">Drag a box around a figure or formula · <button type="button" data-cancel>Cancel</button></p><div class="byob-snip-box" hidden></div>`;
  root.appendChild(ov); root.classList.add('is-snipping');
  ov.querySelector('[data-cancel]').onclick = endSnip;
  const box = ov.querySelector('.byob-snip-box'); let start = null;
  ov.addEventListener('wheel', e => { $('scroll').scrollTop += e.deltaY }, { passive: true });
  ov.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    const p = pageForPoint(e.clientX, e.clientY); if (!p) return;
    e.preventDefault(); ov.setPointerCapture(e.pointerId); start = { x: e.clientX, y: e.clientY, p };
    Object.assign(box.style, { left: e.clientX + 'px', top: e.clientY + 'px', width: 0, height: 0 }); box.hidden = false;
  });
  ov.addEventListener('pointermove', e => {
    if (!start) return;
    const r = start.p.pg.getBoundingClientRect();
    const x = Math.max(r.left, Math.min(r.right, e.clientX)), y = Math.max(r.top, Math.min(r.bottom, e.clientY));
    Object.assign(box.style, { left: Math.min(x, start.x) + 'px', top: Math.min(y, start.y) + 'px', width: Math.abs(x - start.x) + 'px', height: Math.abs(y - start.y) + 'px' });
  });
  ov.addEventListener('pointerup', async e => {
    if (!start) return;
    const b = box.getBoundingClientRect(), p = start.p; start = null;
    if (b.width < 12 || b.height < 12) { box.hidden = true; return }
    const r = p.pg.getBoundingClientRect();
    const frac = { x: (b.left - r.left) / r.width, y: (b.top - r.top) / r.height, w: b.width / r.width, h: b.height / r.height };
    const text = [...p.pg.querySelectorAll('.text-layer span')].filter(sp => { const q = sp.getBoundingClientRect(), cx = (q.left + q.right) / 2, cy = (q.top + q.bottom) / 2; return cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom }).map(sp => sp.textContent).join(' ').replace(/\s+/g, ' ').trim();
    const anchor = { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
    endSnip();
    markRegion(p, frac, true);
    const blob = await snipImage(p.n, frac);
    regionPopup(anchor, { blob, page: p.n, text, frac, kind: 'snip', caption: captionNear(p, frac), sketch: sketchOf(p, frac) });
  });
}
function endSnip() { document.querySelector('.byob-snip')?.remove(); root.classList.remove('is-snipping') }
async function snipImage(n, f) {
  try {
    const page = await state.pdf.getPage(n), base = page.getViewport({ scale: 1 });
    // Sharp enough to read small labels: aim for ~1600px across the snip, within a sane canvas size.
    const scale = Math.max(1, Math.min(6, 1600 / (f.w * base.width), 4096 / base.width));
    const vp = page.getViewport({ scale });
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(f.w * vp.width)); c.height = Math.max(1, Math.round(f.h * vp.height));
    const g = c.getContext('2d', { alpha: false }); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: g, viewport: vp, transform: [1, 0, 0, 1, -f.x * vp.width, -f.y * vp.height] }).promise;
    return await new Promise(res => c.toBlob(res, 'image/png'));
  } catch { return null }
}
const KIND = { figure: 'Figure', formula: 'Formula', snip: 'Snip' };
// A snipped or picked area stays marked on the page while its menu is open.
function markRegion(p, f, flash) {
  clearRegion();
  const m = document.createElement('div'); m.className = 'byob-region' + (flash ? ' is-flash' : '');
  Object.assign(m.style, { left: f.x * 100 + '%', top: f.y * 100 + '%', width: f.w * 100 + '%', height: f.h * 100 + '%' });
  p.pg.appendChild(m);
}
function clearRegion() { document.querySelectorAll('.byob-region').forEach(m => m.remove()) }
// A rough text sketch of an area of the rendered page, for when Claude cannot be sent the picture.
function sketchOf(p, f) {
  try {
    const c = drawn(p); if (!c) return '';
    const cols = 64, aspect = (f.h * c.height) / (f.w * c.width), rows = Math.max(6, Math.min(30, Math.round(cols * aspect * 0.5)));
    const g = document.createElement('canvas'); g.width = cols; g.height = rows;
    const x = g.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#fff'; x.fillRect(0, 0, cols, rows);
    x.drawImage(c, f.x * c.width, f.y * c.height, f.w * c.width, f.h * c.height, 0, 0, cols, rows);
    const d = x.getImageData(0, 0, cols, rows).data; let out = [];
    for (let y = 0; y < rows; y++) { let line = ''; for (let i = 0; i < cols; i++) { const k = (y * cols + i) * 4, v = d[k] * 0.3 + d[k + 1] * 0.59 + d[k + 2] * 0.11; line += v < 150 ? '#' : v < 225 ? '+' : v < 250 ? '.' : ' ' } out.push(line.replace(/\s+$/, '')) }
    while (out.length && !out[0]) out.shift(); while (out.length && !out.at(-1)) out.pop();
    return out.join('\n');
  } catch { return '' }
}
// The caption next to a figure ("Figure 1.2. The Poisson distribution …"), if there is one.
function captionNear(p, f) {
  const r = p.pg.getBoundingClientRect(), spans = [...p.pg.querySelectorAll('.text-layer span')];
  const box = { l: r.left + f.x * r.width, t: r.top + f.y * r.height, r: r.left + (f.x + f.w) * r.width, b: r.top + (f.y + f.h) * r.height };
  const H = box.b - box.t;
  const near = spans.map(sp => ({ sp, q: sp.getBoundingClientRect() })).filter(o => /^(Figure|Fig\.|Table)\s*[\dA-Z]/.test(o.sp.textContent.trim())).map(o => {
    // Beside the figure (captions in the margin, top-aligned with it) or just below it.
    const beside = o.q.top >= box.t - H * 0.25 && o.q.top <= box.b && (o.q.left >= box.r - 2 || o.q.right <= box.l + 2);
    const below = o.q.top >= box.b - 4 && o.q.top <= box.b + r.height * 0.08 && o.q.left < box.r && o.q.right > box.l - r.width * 0.05;
    const d = beside ? Math.abs(o.q.top - box.t) + Math.max(0, o.q.left - box.r, box.l - o.q.right) * 0.2 : below ? o.q.top - box.b : Infinity;
    return { ...o, d };
  }).filter(o => o.d < Infinity);
  if (!near.length) return '';
  near.sort((a, b) => a.d - b.d);
  const start = near[0], i0 = spans.indexOf(start.sp); let text = '', lastBottom = start.q.bottom;
  for (const sp of spans.slice(i0, i0 + 24)) { const q = sp.getBoundingClientRect(); if (text && (q.top - lastBottom > q.height * 1.2 || /^(Figure|Fig\.|Table)\s*[\dA-Z]/.test(sp.textContent.trim()))) break; text += sp.textContent; lastBottom = Math.max(lastBottom, q.bottom) }
  return text.replace(/\s+/g, ' ').trim().slice(0, 600);
}
async function regionItem(p, f, kind, noImage) {
  const r = p.pg.getBoundingClientRect(), L = r.left + f.x * r.width, T = r.top + f.y * r.height, R = L + f.w * r.width, Bm = T + f.h * r.height;
  const text = [...p.pg.querySelectorAll('.text-layer span')].filter(sp => { const q = sp.getBoundingClientRect(), cx = (q.left + q.right) / 2, cy = (q.top + q.bottom) / 2; return cx >= L && cx <= R && cy >= T && cy <= Bm }).map(sp => sp.textContent).join(' ').replace(/\s+/g, ' ').trim();
  return { blob: noImage ? null : await snipImage(p.n, f), page: p.n, text, frac: f, kind, caption: captionNear(p, f), sketch: sketchOf(p, f) };
}
async function regionAction(a, item) {
  const what = item.kind === 'formula' ? 'formula' : 'figure';
  if (a === 'explain' || a === 'ask') { hideSelection(); openChat({ quiet: a === 'explain' }); await addAttachments([item], { snip: true }); if (a === 'explain') ask(`Explain this ${what}.`); return }
  if (a === 'highlight') {
    hideSelection(); const f = item.frac, r = v => Math.round(v * 10000) / 10000;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const list = highlights(); list.push({ id, page: item.page, rects: [[r(f.x), r(f.y), r(f.w), r(f.h)]], text: item.text || '', box: true, kind: item.kind, color: prefs.hlColor || 'gold', at: Date.now() });
    store.set('hl:' + state.key, list); renderHighlights(state.pages[item.page - 1]);
    const pg = state.pages[item.page - 1]?.pg.getBoundingClientRect(); if (pg) showPalette([id], { left: pg.left + f.x * pg.width, top: pg.top + f.y * pg.height, right: pg.left + (f.x + f.w) * pg.width, bottom: pg.top + (f.y + f.h) * pg.height }); return;
  }
  if (a === 'copy') { hideSelection(); copyImage(item) }
}
async function copyImage(item) {
  if (!item.blob) { toast('That area could not be captured.'); return }
  try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': item.blob })]); toast('Image copied. Paste it into your notes.'); return } catch {}
  saveFile(`${(state.title || 'book').replace(/[^\w-]+/g, '-').slice(0, 40)}-p${item.page}.png`, item.blob);
  toast('Copying images is not allowed in this browser, so the image was saved as a file instead.');
}
const ACT = {
  ask: CHAT_SVG,
  highlight: HIGHLIGHT_SVG,
  copy: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="9" height="9" rx="1"></rect><path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2"></path></svg>',
};
async function regionPopup(box, item) {
  hideSelection();
  const p = state.pages[item.page - 1]; if (p) markRegion(p, item.frac, true);
  const pop = document.createElement('div');
  pop.tabIndex = -1; pop.className = 'selection-popup is-compact is-lab selection-popup-below byob-snip-pop'; pop.dataset.popupMode = 'highlight';
  const url = item.blob ? await blobToDataUrl(item.blob) : '';
  pop.innerHTML = `${url ? `<div class="byob-snip-thumb"><img src="${url}" alt="The captured area"><span>${KIND[item.kind] || 'Snip'} · p. ${item.page}</span></div>` : ''}<div class="popup-compact-menu">
    <button type="button" class="popup-menu-action" data-a="explain"><span class="popup-highlight-symbol" aria-hidden="true">✧</span><span>Explain</span></button>
    <button type="button" class="popup-menu-action" data-a="ask">${ACT.ask}<span>Chat</span></button>
    <button type="button" class="popup-menu-action" data-a="highlight">${ACT.highlight}<span>Highlight</span></button>
    <button type="button" class="popup-menu-action" data-a="copy">${ACT.copy}<span>Copy image</span></button></div>`;
  root.appendChild(pop); placePopup(pop, box, 230); pop.addEventListener('mousedown', e => e.preventDefault());
  pop.querySelectorAll('[data-a]').forEach(b => b.onclick = () => regionAction(b.dataset.a, item));
}

/* ---------- Figures: areas with ink but no running text get a hover chip ---------- */
function detectFigures(p) {
  if (!p.canvas || !p.layer || state.figs.has(p.n)) return;
  const c = drawn(p), W = 240, H = Math.max(1, Math.round(W * c.height / c.width));
  const g = document.createElement('canvas'); g.width = W; g.height = H;
  const x = g.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, ink = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) ink[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) < 247 ? 1 : 0;
  // Blank out running text, prose lines and formulas (they have their own handling).
  const pr = p.pg.getBoundingClientRect();
  const clear = (fx, fy, fw, fh) => { const x0 = Math.max(0, Math.floor(fx * W) - 1), x1 = Math.min(W - 1, Math.ceil((fx + fw) * W)), y0 = Math.max(0, Math.floor(fy * H)), y1 = Math.min(H - 1, Math.ceil((fy + fh) * H)); for (let y = y0; y <= y1; y++) ink.fill(0, y * W + x0, y * W + x1 + 1) };
  for (const b of [...(p.prose || []), ...(p.blocks || [])]) clear(b.x, b.y, b.w, b.h);
  for (const sp of p.layer.querySelectorAll('span')) {
    const t = sp.textContent.trim(); if (!(t.length >= 4 && /[A-Za-z]{3}/.test(t))) continue;
    const q = sp.getBoundingClientRect(); clear((q.left - pr.left) / pr.width, (q.top - pr.top) / pr.height, q.width / pr.width, q.height / pr.height);
  }
  // Grow ink a little so strokes and their labels join, then take connected areas.
  const grown = new Uint8Array(W * H), R = 3;
  for (let y = 0; y < H; y++) for (let x2 = 0; x2 < W; x2++) if (ink[y * W + x2]) for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const yy = y + dy, xx = x2 + dx; if (yy >= 0 && yy < H && xx >= 0 && xx < W) grown[yy * W + xx] = 1 }
  const seen = new Uint8Array(W * H); let boxes = [];
  for (let i = 0; i < W * H; i++) {
    if (!grown[i] || seen[i]) continue;
    let l = W, t = H, r = 0, b = 0, n = 0; const st = [i]; seen[i] = 1;
    while (st.length) { const j = st.pop(), y = (j / W) | 0, x3 = j % W; if (ink[j]) n++; l = Math.min(l, x3); r = Math.max(r, x3); t = Math.min(t, y); b = Math.max(b, y);
      for (const k of [j - 1, j + 1, j - W, j + W]) if (k >= 0 && k < W * H && !seen[k] && grown[k] && Math.abs((k % W) - x3) <= 1) { seen[k] = 1; st.push(k) } }
    boxes.push({ l: l + R, t: t + R, r: r - R, b: b - R, n });
  }
  boxes = boxes.filter(o => (o.r - o.l) >= W * 0.07 && (o.b - o.t) >= H * 0.04 && o.n >= 30 && (o.r - o.l) * (o.b - o.t) < W * H * 0.5);
  // Side-by-side pieces of one figure (an image, an arrow diagram, an image) become one box.
  for (let merged = true; merged;) {
    merged = false;
    outer: for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j], ov = Math.min(a.b, b.b) - Math.max(a.t, b.t), gap = Math.max(a.l, b.l) - Math.min(a.r, b.r);
      if (ov > 0.6 * Math.min(a.b - a.t, b.b - b.t) && gap < W * 0.18) { boxes[i] = { l: Math.min(a.l, b.l), t: Math.min(a.t, b.t), r: Math.max(a.r, b.r), b: Math.max(a.b, b.b), n: a.n + b.n }; boxes.splice(j, 1); merged = true; break outer }
    }
  }
  const figs = boxes.map(o => { const pad = 1.5; return { x: Math.max(0, (o.l - pad) / W), y: Math.max(0, (o.t - pad) / H), w: Math.min(1, (o.r - o.l + pad * 2) / W), h: Math.min(1, (o.b - o.t + pad * 2) / H) } });
  state.figs.set(p.n, figs); p.figures = figs;
}
const hot = { el: null, key: '', sticky: false, raf: 0, timer: 0, over: false };
function regionAt(x, y) {
  const p = pageForPoint(x, y); if (!p || !p.layer) return null;
  const r = p.pg.getBoundingClientRect(), fx = (x - r.left) / r.width, fy = (y - r.top) / r.height;
  const inside = f => fx >= f.x && fx <= f.x + f.w && fy >= f.y && fy <= f.y + f.h;
  const fi = (p.figures || []).findIndex(inside); if (fi >= 0) return { p, f: p.figures[fi], kind: 'figure', key: p.n + 'f' + fi };
  const bi = (p.blocks || []).findIndex(inside); if (bi >= 0) return { p, f: p.blocks[bi], kind: 'formula', key: p.n + 'm' + bi };
  return null;
}
function hideHot() { clearTimeout(hot.timer); hot.el?.remove(); hot.el = null; hot.key = ''; hot.sticky = false }
// Leaving the area hides the chip after a moment, so the pointer can travel onto it.
function hideHotSoon() { clearTimeout(hot.timer); hot.timer = setTimeout(() => { if (!hot.sticky && !hot.over) hideHot() }, 450) }
function showHot(reg, sticky) {
  clearTimeout(hot.timer);
  if (hot.key === reg.key && hot.el?.isConnected) { hot.sticky = hot.sticky || sticky; return }
  hideHot();
  const el = document.createElement('div'); el.className = 'byob-hot';
  Object.assign(el.style, { left: reg.f.x * 100 + '%', top: reg.f.y * 100 + '%', width: reg.f.w * 100 + '%', height: reg.f.h * 100 + '%' });
  el.innerHTML = `<div class="byob-hot-chip" role="toolbar" aria-label="${KIND[reg.kind]} actions">
    <button type="button" data-a="explain" title="Explain this ${reg.kind} in chat"><span class="byob-hot-sym" aria-hidden="true">✧</span>Explain</button>
    <button type="button" data-a="ask" title="Chat about this ${reg.kind}">${ACT.ask}Chat</button>
    <button type="button" data-a="highlight" title="Highlight this ${reg.kind}">${ACT.highlight}Highlight</button>
    <button type="button" data-a="copy" title="Copy this ${reg.kind} as an image">${ACT.copy}Copy</button></div>`;
  const chip = el.querySelector('.byob-hot-chip');
  chip.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation() });
  chip.addEventListener('mouseenter', () => { hot.over = true; clearTimeout(hot.timer) });
  chip.addEventListener('mouseleave', () => { hot.over = false; hideHotSoon() });
  el.querySelectorAll('[data-a]').forEach(b => b.onclick = async e => { e.stopPropagation(); const a = b.dataset.a; hideHot(); markRegion(reg.p, reg.f, true); const item = await regionItem(reg.p, reg.f, reg.kind, a === 'highlight'); if (a !== 'highlight' && a !== 'copy') setTimeout(clearRegion, 900); else clearRegion(); regionAction(a, item) });
  reg.p.pg.appendChild(el); hot.el = el; hot.key = reg.key; hot.sticky = sticky;
}
document.addEventListener('mousemove', e => {
  if (hot.raf) return;
  hot.raf = requestAnimationFrame(() => {
    hot.raf = 0;
    if (e.buttons || drag.on || root.classList.contains('is-snipping') || isPhone()) return;
    if (e.target.closest?.('.byob-hot-chip')) return;
    if (document.querySelector('.selection-popup') || !getSelection().isCollapsed) { if (!hot.sticky) hideHot(); return }
    const reg = e.target.closest?.('.pdf-scroll') ? regionAt(e.clientX, e.clientY) : null;
    if (reg) showHot(reg, false); else if (!hot.sticky && hot.el) hideHotSoon();
  });
});
// Touch (and a plain click): tap a figure or formula to get the same chip.
document.addEventListener('click', e => {
  if (e.target.closest('.byob-hot-chip, .selection-popup, .lab-ask, .lab-header, button') || !getSelection().isCollapsed || narr.active) return;
  if (highlightAt(e.clientX, e.clientY)) return;
  const reg = regionAt(e.clientX, e.clientY);
  if (reg) showHot(reg, true); else hideHot();
});
$('scroll').addEventListener('scroll', () => { if (!hot.sticky) hideHot() }, { passive: true });

/* ---------- Mouse selection by hand: a drag that starts or passes over empty space snaps to the
   nearest line, instead of the browser jumping to the start of the page. Touch keeps the native one. ---------- */
const drag = { on: false, moved: false, a: null, col: 'body', last: null, scroller: 0, touchAt: 0 };
addEventListener('touchstart', () => { drag.touchAt = Date.now() }, { passive: true, capture: true });
function caretFromPoint(x, y) {
  if (document.caretPositionFromPoint) { const c = document.caretPositionFromPoint(x, y); return c && { node: c.offsetNode, offset: c.offset } }
  const r = document.caretRangeFromPoint?.(x, y); return r && { node: r.startContainer, offset: r.startOffset };
}
function nearestPage(x, y) {
  let best = pageForPoint(x, y); if (best?.layer) return best;
  let bd = Infinity; best = null;
  for (const q of state.pages) { if (!q.layer) continue; const r = q.pg.getBoundingClientRect(), dd = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0; if (dd < bd) { bd = dd; best = q } }
  return best;
}
function caretAt(x, y, col) {
  const p = nearestPage(x, y); if (!p) return null;
  const el = document.elementFromPoint(x, y);
  if (el?.matches?.('.text-layer span') && el.firstChild && el.closest('.pg') === p.pg && (el.closest('.side-col') ? 'side' : 'body') === col) { const c = caretFromPoint(x, y); if (c && el.contains(c.node)) return c }
  let boxes = [...p.layer.querySelectorAll('span')].filter(sp => sp.firstChild && !!sp.closest('.side-col') === (col === 'side')).map(sp => ({ sp, r: sp.getBoundingClientRect() }));
  if (!boxes.length) return null;
  let row = boxes.filter(b => y >= b.r.top - 1 && y <= b.r.bottom + 1);
  if (!row.length) {
    const near = boxes.reduce((m, b) => { const dd = Math.min(Math.abs(y - b.r.top), Math.abs(y - b.r.bottom)); return dd < m.d ? { d: dd, b } : m }, { d: Infinity, b: null }).b;
    const cy = (near.r.top + near.r.bottom) / 2; row = boxes.filter(b => Math.abs((b.r.top + b.r.bottom) / 2 - cy) < near.r.height * 0.6);
  }
  row.sort((a, b) => a.r.left - b.r.left);
  const hit = row.find(b => x >= b.r.left && x <= b.r.right);
  if (hit) { const c = caretFromPoint(Math.min(x, hit.r.right - 1), (hit.r.top + hit.r.bottom) / 2); if (c && hit.sp.contains(c.node)) return c;
    const t = hit.sp.firstChild; return { node: t, offset: Math.max(0, Math.min(t.length, Math.round((x - hit.r.left) / hit.r.width * t.length))) } }
  const before = row.filter(b => b.r.right <= x).at(-1);
  if (before) return { node: before.sp.firstChild, offset: before.sp.firstChild.length };
  return { node: row[0].sp.firstChild, offset: 0 };
}
function extendTo(x, y) {
  const f = caretAt(x, y, drag.col); if (!f || !drag.a) return;
  try { getSelection().setBaseAndExtent(drag.a.node, drag.a.offset, f.node, f.offset) } catch {}
}
document.addEventListener('mousedown', e => {
  if (e.button !== 0 || Date.now() - drag.touchAt < 1000 || root.classList.contains('is-snipping')) return;
  const t = e.target; if (!t.closest?.('.pdf-sheet') || t.closest('.byob-hot-chip, button')) return;
  const p = pageForPoint(e.clientX, e.clientY); if (!p?.layer) return;
  const onSide = !!(t.closest('.side-col') || (document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.side-col')));
  const col = onSide ? 'side' : 'body';
  const a = caretAt(e.clientX, e.clientY, col); if (!a) return;
  e.preventDefault();
  const s = getSelection();
  if (e.detail === 2) { s.collapse(a.node, a.offset); s.modify?.('move', 'backward', 'word'); s.modify?.('extend', 'forward', 'word'); return }
  if (e.detail >= 3) { const sp = a.node.parentElement; const cy = sp.getBoundingClientRect(); const row = [...sp.parentElement.children].filter(o => o.tagName === 'SPAN' && Math.abs(o.getBoundingClientRect().top - cy.top) < cy.height * 0.6); if (row.length) s.setBaseAndExtent(row[0].firstChild, 0, row.at(-1).firstChild, row.at(-1).firstChild.length); return }
  drag.on = true; drag.moved = false; drag.a = a; drag.col = col; drag.x0 = e.clientX; drag.y0 = e.clientY;
  if (e.shiftKey && !s.isCollapsed) { drag.a = { node: s.anchorNode, offset: s.anchorOffset }; extendTo(e.clientX, e.clientY); drag.moved = true }
  hideHot(); if (document.querySelector('.selection-popup[data-popup-mode="main"], .selection-popup[data-popup-mode="highlight"]')) hideSelection();
});
document.addEventListener('mousemove', e => {
  if (!drag.on) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 3) return;
  drag.moved = true; drag.last = { x: e.clientX, y: e.clientY };
  extendTo(e.clientX, e.clientY);
  // Scroll while dragging near the top or bottom edge.
  const sr = $('scroll').getBoundingClientRect(), edge = 36;
  const v = e.clientY < sr.top + edge ? -(sr.top + edge - e.clientY) : e.clientY > sr.bottom - edge ? e.clientY - (sr.bottom - edge) : 0;
  clearInterval(drag.scroller); drag.scroller = 0;
  if (v) drag.scroller = setInterval(() => { $('scroll').scrollTop += v * 0.6; if (drag.last) extendTo(drag.last.x, drag.last.y) }, 30);
});
document.addEventListener('mouseup', () => {
  if (!drag.on) return;
  drag.on = false; clearInterval(drag.scroller); drag.scroller = 0;
  if (!drag.moved) getSelection().removeAllRanges();
});
document.addEventListener('paste', e => {
  if (!IMAGES_ENABLED || !state.pdf) return;
  const t = e.target, inChat = t?.closest?.('.lab-ask');
  if (!inChat && t?.closest?.('input, textarea, [contenteditable]')) return;
  const files = [...(e.clipboardData?.files || [])].filter(f => f.type.startsWith('image/'));
  if (!files.length) for (const it of e.clipboardData?.items || []) if (it.kind === 'file' && it.type.startsWith('image/')) { const f = it.getAsFile(); if (f) files.push(f) }
  if (!files.length) return;
  e.preventDefault(); addAttachments(files);
});

/* ---------- Export notes: highlights and conversations as Markdown ---------- */
async function exportNotes() {
  if (!hasBook()) { toast('Open a book first.'); return }
  const title = state.title || 'Untitled book';
  const hl = highlights().slice().sort((a, b) => a.page - b.page || (a.rects?.[0]?.[1] ?? a.start ?? 0) - (b.rects?.[0]?.[1] ?? b.start ?? 0));
  const turns = store.get('chat:' + state.key) || [];
  const quote = t => t.trim().split(/\n+/).map(l => '> ' + l).join('\n');
  let out = `# ${title}\n\nNotes exported from Tinct on ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}.\n`;
  if (hl.length) {
    out += `\n## Highlights\n`; let last = '';
    for (const h of hl) { const ch = chapterAt(h.page)?.label || ''; if (ch && ch !== last) { out += `\n### ${ch}\n`; last = ch } out += h.box ? `\n_[${KIND[h.kind] || 'Figure'} on p. ${h.page}]_${h.kind === 'formula' && h.text ? '\n' + quote(h.text) : ''}\n` : `\n${quote(h.text)}\n— p. ${h.page}\n` }
  }
  if (turns.length) {
    out += `\n## Conversations\n`;
    for (const t of turns) {
      if (t.role === 'user') out += `\n**You** (p. ${t.page || '?'}${t.at ? ', ' + new Date(t.at).toLocaleDateString() : ''}):${t.passage ? '\n\n' + quote(t.passage) : ''}${t.imgs?.length ? `\n\n_[${t.imgs.length > 1 ? t.imgs.length + ' images attached' : 'Image attached'}]_` : ''}\n\n${t.display || t.content}\n`;
      else out += `\n**Tinct:**\n\n${t.content.trim()}\n`;
    }
  }
  if (!hl.length && !turns.length) { toast('Nothing to export yet. Highlight a passage or ask a question first.'); return }
  const name = (title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'book') + '-notes.md';
  if (saveFile(name, new Blob([out], { type: 'text/markdown;charset=utf-8' }))) { toast(`Saved ${name}.`); return }
  try { await navigator.clipboard.writeText(out); toast(`Copied ${hl.length} highlight${hl.length === 1 ? '' : 's'} and ${turns.filter(t => t.role === 'user').length} question${turns.filter(t => t.role === 'user').length === 1 ? '' : 's'} as Markdown. Paste into your notes.`) }
  catch { toast('Saving is not available here.') }
}

function saveTurns() { store.set('chat:' + state.key, chat.turns.slice(-40)) }
/* The thread is the one both readers share (app/public/lab/chat-thread.{js,css};
   docs/chat/mockup.html): no header, the reader's words in a bubble, answers as
   plain text, one divider when the page or the day changes, copy and time on hover
   or press, a hairline-and-caret composer. */
const CHAT_THREAD = '/lab/chat-thread.js?v=20261009chat';
let TC = null;
const tcReady = import(CHAT_THREAD).then(m => (TC = m)).catch(() => null);
function openChat(opts = {}) {
  if (!TC) { tcReady.then(m => { if (m) openChat(opts) }); return }
  closeAllPopups();
  loadTurns();
  if (!chat.el) {
    const el = document.createElement('aside');
    el.setAttribute('aria-label', 'Chat');
    el.innerHTML = `<button type="button" class="tc-close" aria-label="Close chat" data-x>${TC.ICONS.close}</button>
      <div class="tc-body"><div class="tc-thread" id="thread"></div><div class="tc-fade" aria-hidden="true"></div><button type="button" class="tc-latest" id="latest" hidden>${TC.ICONS.down}Latest</button></div>
      <p class="tc-status" id="chatNotice" hidden></p>
      <form class="tc-compose" id="composer">
        <div class="byob-tray" id="tray" hidden></div>
        <section class="tc-attached" id="attached" hidden><span id="attachedText"></span><button type="button" class="tc-mark" aria-label="Remove" data-unattach>${TC.ICONS.close}</button></section>
        <input type="file" id="attachInput" accept="image/*" multiple hidden>
        <div class="tc-field is-empty">
          <label class="lab-visually-hidden" for="lab-ask-input">Ask</label>
          <textarea id="lab-ask-input" rows="1" class="tc-input" enterkeyhint="send"></textarea>
          <button type="button" class="tc-mark byob-attach" id="attachBtn" aria-label="Attach an image" title="Attach an image (or paste one)" hidden>${TC.ICONS.attach}</button>
          <button type="submit" class="tc-mark tc-send" aria-label="Send" hidden>${TC.ICONS.send}</button>
        </div>
        <p class="tc-hint" id="chatHint" hidden>${esc(TC.HINT_TEXT)}</p>
      </form>`;
    el.querySelector('[data-x]').onmousedown = e => e.preventDefault();
    el.querySelector('[data-x]').onclick = closeChat;
    el.querySelector('[data-unattach]').onclick = () => { chat.passage = null; renderAttached(); el.querySelector('textarea').focus({ preventScroll: true }) };
    const input = el.querySelector('textarea'), send = el.querySelector('.tc-send'), field = el.querySelector('.tc-field');
    input.addEventListener('input', () => { const ok = !!input.value.trim() || chat.attach.length > 0; send.hidden = !ok; send.disabled = !ok; field.classList.toggle('is-empty', !input.value); TC.fitComposer(input) });
    input.addEventListener('keydown', e => {
      const action = TC.composerKey(e, { phone: isPhone(), empty: !input.value });
      if (action === 'send') { e.preventDefault(); el.querySelector('form').requestSubmit() }
      else if (action === 'recall') { const last = TC.lastQuestion(chat.turns, t => t.display || t.content); if (last) { e.preventDefault(); input.value = last; input.dispatchEvent(new Event('input')) } }
      else if (action === 'close') { e.preventDefault(); closeChat() }
    });
    el.querySelector('.tc-compose').addEventListener('pointerdown', e => { if (e.target.closest('button, a, input, textarea, .tc-attached, .byob-tray')) return; e.preventDefault(); input.focus() });
    const thread = el.querySelector('#thread'), latest = el.querySelector('#latest');
    TC.bindPress(thread);
    thread.addEventListener('scroll', () => { latest.hidden = !TC.isAway(thread) }, { passive: true });
    latest.onclick = () => TC.scrollToLatest(thread);
    // The clean window stays a full screen while the sheet settles (phone chrome, keyboard).
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { const space = thread.querySelector('.tc-spacer'); if (!space || !chat.fresh) return; const atEnd = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 8; space.style.height = thread.clientHeight + 'px'; if (atEnd) thread.scrollTop = thread.scrollHeight }).observe(thread);
    el.querySelector('#attachBtn').onclick = () => el.querySelector('#attachInput').click();
    el.querySelector('#attachInput').onchange = e => { addAttachments([...e.target.files]); e.target.value = '' };
    el.addEventListener('dragover', e => { if ([...(e.dataTransfer?.items || [])].some(i => i.kind === 'file')) { e.preventDefault(); el.classList.add('byob-drop-over') } });
    el.addEventListener('dragleave', e => { if (!el.contains(e.relatedTarget)) el.classList.remove('byob-drop-over') });
    el.addEventListener('drop', e => { el.classList.remove('byob-drop-over'); const files = [...(e.dataTransfer?.files || [])].filter(f => f.type.startsWith('image/')); if (files.length) { e.preventDefault(); addAttachments(files) } });
    el.querySelector('form').onsubmit = e => { e.preventDefault(); const q = input.value.trim() || (chat.attach.length ? (chat.attach.length > 1 ? 'Explain these images.' : chat.attach[0].snip ? 'Explain this figure.' : 'Explain this image.') : ''); if (!q) return; input.value = ''; input.dispatchEvent(new Event('input')); el.querySelector('#chatHint').hidden = true; ask(q) };
    chat.el = el;
  }
  const el = chat.el;
  el.className = `lab-ask tc ${isPhone() ? 'is-phone-sheet byob-phone-chat' : 'is-desktop-companion is-chat byob-dock'}`;
  // The keyboard hint, once per session, on the desktop.
  if (!isPhone() && TC.takeHint((() => { try { return sessionStorage } catch { return null } })())) el.querySelector('#chatHint').hidden = false;
  el.removeAttribute('style');
  if (isPhone()) el.removeAttribute('data-reader-window'); else { el.dataset.readerWindow = 'true'; el.dataset.companion = 'chat' }
  if (!el.isConnected) root.appendChild(el);
  el.querySelector('#attachBtn').hidden = !IMAGES_ENABLED;
  renderTray();
  if (!isPhone()) { dockGrip(el); el.hidden = false; setDock(opts.overlay || state.zoom > 1 ? 'overlay' : 'docked') }
  root.classList.add('chat-open');
  root.dataset.desktopPanel = 'chat';
  const shown = document.querySelector('.byob-toast:not([hidden])'); if (shown) placeToast(shown);
  if (opts.passage) chat.passage = opts.passage;
  if (opts.explanation) {
    chat.fresh = false;
    chat.turns.push({ role: 'user', content: 'Explain this passage.', passage: opts.passage.text, page: opts.passage.page, at: Date.now() });
    chat.turns.push({ role: 'assistant', content: opts.explanation, at: Date.now() });
    saveTurns();
  }
  chat.fresh = !opts.prompt && !opts.explanation;
  setTalk(!!opts.talk || chat.talk);
  renderThread();
  if (opts.prompt) ask(opts.prompt, opts.display);
  else if (!opts.quiet) setTimeout(() => { const t = el.querySelector('textarea'); t.focus({ preventScroll: true }); t.dispatchEvent(new Event('input')) }, 50);
}
function closeChat() { chat.ctl?.abort(); chat.live = null; speechSynthesis?.cancel?.(); chat.el?.remove(); const t = document.querySelector('.byob-toast.is-in-chat') || chat.el?.querySelector('.byob-toast'); if (t) placeToast(t); root.classList.remove('chat-open'); root.dataset.desktopPanel = 'none'; if (!isPhone()) setDock('closed') }
function setTalk(on) {
  chat.talk = on;
  if (!chat.el) return;
  chat.el.classList.toggle('byob-talk-on', on);
  const note = chat.el.querySelector('#chatNotice');
  note.hidden = !on;
  note.textContent = on ? (isPhone() ? 'Talk: use your keyboard’s microphone to speak; answers are read aloud.' : 'Talk: answers are read aloud. Speak with your system’s dictation, or type.') : '';
  if (!on) speechSynthesis?.cancel?.();
}
function placeOf(t) { return t.page ? (isEpub() ? (toc.entries.find(e => e.page === t.page)?.label || 'Section ' + t.page) : 'Page ' + t.page) : null }
function renderAttached() {
  const box = chat.el?.querySelector('#attached'); if (!box) return;
  box.hidden = !chat.passage;
  box.querySelector('#attachedText').textContent = chat.passage ? TC.cutQuote(chat.passage.text) : '';
}
function renderThread() {
  const el = chat.el, thread = el.querySelector('#thread');
  el.classList.toggle('is-empty', !chat.turns.length && !chat.live); el.classList.toggle('has-thread', !!chat.turns.length || !!chat.live);
  const turns = chat.turns.map(t => ({
    role: t.role, text: t.role === 'user' ? (t.display || t.content) : t.content, html: t.role === 'assistant' ? md(t.content) : undefined,
    at: t.at, place: placeOf(t), quote: t.role === 'user' ? t.passage : undefined,
    note: t.failed ? `No answer — ${t.failed}` : undefined,
    extra: t.imgs?.length ? `<span class="tc-imgs">${t.imgs.map(u => `<img src="${esc(u)}" alt="Attached image">`).join('')}</span>` : '',
  }));
  if (chat.live) turns.push({ role: 'assistant', text: chat.live.text, html: chat.live.text ? md(chat.live.text) : '', place: turns.at(-1)?.place });
  thread.innerHTML = TC.threadHtml(turns, { streaming: !!chat.live });
  // Opened, Chat looks like a clean window: a screen of writing space above the composer, the
  // history above that, reached by scrolling up (as the book reader opens). The next question clears it.
  if (chat.fresh && turns.length) { const space = document.createElement('div'); space.className = 'tc-spacer'; space.setAttribute('aria-hidden', 'true'); space.style.height = thread.clientHeight + 'px'; thread.appendChild(space) }
  thread.querySelectorAll('[data-copy]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(chat.turns[b.dataset.copy].display || chat.turns[b.dataset.copy].content); b.innerHTML = TC.ICONS.copied; b.setAttribute('aria-label', 'Copied') } catch { toast('Copy did not work here.') } });
  thread.querySelectorAll('[data-quote]').forEach(b => b.onclick = () => { const t = chat.turns[b.dataset.quote]; if (t?.page) goTo({ page: t.page }, true) });
  renderAttached();
  thread.scrollTop = thread.scrollHeight;
  el.querySelector('#latest').hidden = true;
}
/** An answer arriving: its text so far, under a blinking cursor. */
function liveText(text) {
  if (!chat.live || !chat.el) return;
  chat.live.text = text;
  const thread = chat.el.querySelector('#thread'), md_ = thread.querySelector('.tc-a.is-streaming .tc-md');
  if (!md_) { renderThread(); return }
  md_.innerHTML = md(text); thread.querySelector('.tc-a.is-streaming .tc-cursor')?.remove();
  if (!TC.isAway(thread)) thread.scrollTop = thread.scrollHeight;
}
async function ask(question, display) {
  const s = await ai();
  const el = chat.el;
  const passage = chat.passage; chat.passage = null;
  const page = currentPlace().page;
  const attached = chat.attach.splice(0); renderTray();
  chat.fresh = false;
  chat.turns.push({ role: 'user', content: question, display, passage: passage?.text, page: passage?.page || page, imgs: attached.map(a => a.thumb), snipText: attached.map(a => a.text).filter(Boolean).join('\n') || undefined, at: Date.now() });
  renderThread();
  if (!s) { chat.turns[chat.turns.length - 1].failed = 'Claude is not available on this page.'; renderThread(); toast(AI_OFF); return }
  chat.live = { text: '' }; renderThread();
  const focusPage = passage?.page || attached[0]?.page || page;
  const ctx = await contextText(Math.max(1, focusPage - 1), Math.min(state.pages.length, focusPage + 1), 9000);
  const blobs = sampleImages !== false ? attached.map(a => a.blob).filter(Boolean) : [];
  const image = blobs.length ? null : await pageImage(focusPage, passage ? selectionRegion(passage) : null);
  const snipNote = attached.length ? ` The reader attached ${attached.length > 1 ? attached.length + ' images' : 'an image'}: ${attached.map(a => a.snip ? `${a.kind === 'formula' ? 'a formula' : a.kind === 'figure' ? 'a figure' : 'a snip'} from page ${a.page} of the book` : 'a picture they supplied').join('; ')}. ${blobs.length ? 'Look at the image carefully (axes, labels, curves, notation) and answer about it first, using the book text for context.' : 'You cannot see the picture itself. Below are its caption (if one was found), the labels inside it and a rough text sketch of its shape (often unreadable for drawings or photos). Explain what it shows from these and from the surrounding text, ideally where the text refers to it. This picture is new: never assume it is a figure discussed earlier in the conversation unless its caption says so. If none of this identifies it, say in one sentence that you cannot see it and ask the reader what it shows or for its caption; do not guess.'}` : '';
  const snipText = attached.map(a => [a.caption ? 'Caption: ' + a.caption : '', a.text ? 'Labels and text inside it: ' + a.text : '', !blobs.length && a.sketch ? 'Rough sketch of its shape (# dark ink, + grey, . faint; unreliable for drawings and photos):\n```\n' + a.sketch + '\n```' : ''].filter(Boolean).join('\n')).filter(Boolean).join('\n\n');
  const rules = `You are Tinct's reading companion. ${bookLine()} They are on page ${page} of ${state.pages.length}.\nAnswer conversationally and concisely (usually under 150 words unless asked for more). Ground answers in the text; say when something is not on these pages. ${chat.talk ? 'Your answer will be read aloud: no lists, no symbols that read badly, short sentences.' : 'Plain prose; simple bullet lists only when they help.'}${image ? ' The attached image shows the printed page or passage; trust it over the extracted text for equations.' : ''}${snipNote}\n\nText around the reader's place (extracted, may garble maths):\n${ctx}${passage ? `\n\nThe passage they selected on page ${passage.page}:\n${passage.text.slice(0, 3000)}` : ''}${snipText ? `\n\nWhat the reader attached:\n${snipText.slice(0, 5000)}` : ''}`;
  const history = chat.turns.slice(-11, -1).map(t => ({ role: t.role, content: t.role === 'assistant' ? t.content.replace(/\n\n\*(Claude can’t|That image)[^*]*\*/g, '') : (t.role === 'user' && t.passage ? `About this passage: "${t.passage.slice(0, 600)}"\n` : '') + (t.imgs?.length ? `[Earlier I attached ${t.imgs.length > 1 ? 'images' : 'an image'}; it is not re-sent.${t.snipText ? ' Its text: ' + t.snipText.slice(0, 400) : ''}]\n` : '') + t.content }));
  const input = [{ role: 'user', content: rules }, ...history, { role: 'user', content: question }];
  const ctl = new AbortController(); chat.ctl = ctl;
  try {
    const call = imgs => s(input, { cache: false, signal: ctl.signal, images: imgs?.length ? imgs : undefined, onText: ({ text }) => liveText(text) });
    const imgs = blobs.length ? blobs : image ? [image] : null;
    let res, note = !blobs.length && attached.some(a => a.blob) ? (snipText ? (attached.some(a => a.snip) ? '\n\n*Claude can’t receive pictures in this viewer, so this answer works from the caption, labels and a rough sketch of the area.*' : '\n\n*Claude can’t receive pictures in this viewer, so this answer is based on the text inside your snip.*') : '\n\n*Claude can’t receive pictures in this viewer, so it could not see your image.*') : '';
    try { res = await call(imgs) }
    catch (e) {
      if (!imgs || (e?.code !== 'images_unavailable' && e?.code !== 'image_rejected')) throw e;
      if (e.code === 'images_unavailable') { sampleImages = false; imgNote = 'Claude refused pictures in this view (images_unavailable)' } else imgNote = 'Claude rejected that picture (' + e.code + ')';
      if (blobs.length) {
        note = e.code === 'images_unavailable'
          ? (snipText ? (attached.some(a => a.snip) ? '\n\n*Claude can’t receive pictures in this viewer, so this answer works from the caption, labels and a rough sketch of the area.*' : '\n\n*Claude can’t receive pictures in this viewer, so this answer is based on the text inside your snip.*') : '\n\n*Claude can’t receive pictures in this viewer, so it could not see your image.*')
          : '\n\n*That image could not be used (wrong type or too large), so it was left out.*';
        input[0] = { role: 'user', content: input[0].content.replace(' Look at the image carefully (axes, labels, curves, notation) and answer about it first, using the book text for context.', ' You cannot see the picture itself; explain it from its caption, labels and the rough text sketch below, as you would from the picture. Do not dwell on the missing picture.') + attached.filter(a => a.sketch).map(a => '\n\nRough sketch of the attached area (# dark ink, + grey, . faint):\n```\n' + a.sketch + '\n```').join('') };
      }
      res = await call(null);
    }
    if (imgs?.length && !note) { sampleImages = true; imgNote = 'pictures reached Claude in this view' }
    chat.live = null;
    chat.turns.push({ role: 'assistant', content: res.text + note, at: Date.now() });
    saveTurns(); renderThread();
    if (chat.talk) speak(res.text);
  } catch (e) {
    chat.live = null;
    if (e?.code === 'cancelled') return;
    chat.turns[chat.turns.length - 1].failed = errorCopy(e);
    if (e?.text) chat.turns.push({ role: 'assistant', content: e.text + '\n\n(Interrupted.)', at: Date.now() });
    saveTurns(); renderThread();
  }
}
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  for (const part of text.replace(/[*_#`]/g, '').split(/(?<=[.!?])\s+/)) {
    if (!part.trim()) continue;
    const u = new SpeechSynthesisUtterance(part);
    u.rate = prefs.rate; const v = pickVoice(); if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
}

/* Summarize: the pages of this stretch, into Chat, like Tinct's chapter summary */
async function summarize() {
  const page = currentPlace().page, ch = chapterAt(page);
  const r = ch ? chapterRange(ch) : { from: Math.max(1, page - ((page - 1) % 20)), to: page };
  const from = r.from, to = Math.min(r.to, r.from + 39);
  const what = ch ? ch.label : `pages ${from}–${to}`;
  const s = await ai();
  openChat();
  if (!s) { toast(AI_OFF); return }
  const text = await contextText(from, to, 120000);
  chat.passage = null;
  askSummary(`Summarize ${what}.`, `Summarize ${ch ? 'the chapter "' + ch.label + '"' : 'these pages'} (pages ${from} to ${to}) for someone reading along: the main ideas and how they connect, key terms or results, in a short paragraph and then 3 to 6 bullets. Use only this text:\n${text}`);
}
async function askSummary(display, prompt) {
  const s = await ai();
  chat.fresh = false;
  chat.turns.push({ role: 'user', content: display, page: currentPlace().page, at: Date.now() });
  chat.live = { text: '' }; renderThread();
  const ctl = new AbortController(); chat.ctl = ctl;
  try {
    const res = await s(`You are Tinct's reading companion. ${bookLine()}\n\n${prompt}`, { signal: ctl.signal, cache: { gcTime: 86400000 }, onText: ({ text }) => liveText(text) });
    chat.live = null;
    chat.turns.push({ role: 'assistant', content: res.text, at: Date.now() }); saveTurns(); renderThread();
    if (chat.talk) speak(res.text);
  } catch (e) {
    chat.live = null;
    if (e?.code === 'cancelled') return;
    chat.turns[chat.turns.length - 1].failed = errorCopy(e); saveTurns(); renderThread();
  }
}

/* Catch me up: a timeline of 20-page stretches, ending at "You are here" */
const BLOCK = 20;
async function catchUp() {
  const page = currentPlace().page;
  const blocks = [];
  const chapters = leafEntries().filter(e => e.kind === 'chapter' && e.page <= page);
  if (chapters.length) for (const e of chapters) { const r = chapterRange(e); blocks.push({ from: r.from, to: Math.min(page, r.to, r.from + 39), partial: page <= r.to, label: e.label }) }
  else for (let start = 1; start <= page; start += BLOCK) blocks.push({ from: start, to: Math.min(page, start + BLOCK - 1), partial: start + BLOCK - 1 > page });
  const since = store.get('session:' + state.key)?.previousPage;
  const layer = sheet('Catch me up', `<ol class="lab-catch-up-timeline">${blocks.map((b, i) => `
    <li class="lab-catch-up-entry is-${b.partial ? 'current' : 'chapter'}" data-i="${i}"><span class="lab-catch-up-dot" aria-hidden="true"></span>
      <h3 class="lab-catch-up-title">${b.label ? esc(b.label) : `Pages ${b.from}–${b.to}`}${b.partial ? ' · so far' : ''}</h3>
      <span class="lab-catch-up-placeholder" aria-hidden="true"><i></i><i></i><i></i></span></li>`).join('')}
    <li class="lab-catch-up-here"><span class="lab-catch-up-dot" aria-hidden="true"></span>You are here · p. ${page}${since && since !== page ? ` <span class="byob-fine">(last visit ended on p. ${since})</span>` : ''}</li></ol>
    <div class="lab-catch-up-foot"><button type="button" class="lab-catch-up-discuss">Discuss</button></div>`);
  layer.querySelector('.lab-catch-up-discuss').onclick = () => { closeSheet(layer); openChat() };
  const body = layer.querySelector('.lab-catch-up-body'); body.scrollTop = body.scrollHeight;
  const s = await ai();
  const entries = [...layer.querySelectorAll('.lab-catch-up-entry')];
  if (!s) { entries.forEach(li => li.querySelector('.lab-catch-up-placeholder').outerHTML = `<p class="byob-ai-off">${AI_OFF}</p>`); return }
  // Load the most recent stretches first; earlier ones on request, so a long book does not spend at once.
  const load = async (i) => {
    const b = blocks[i], li = entries[i];
    const cacheKey = `catchup:${state.key}:${b.from}-${b.to}`;
    const show = r => { li.querySelector('.lab-catch-up-title').textContent = b.label ? `${b.label}${b.partial ? ' · so far' : ''}` : `Pages ${b.from}–${b.to}${r.title ? ' · ' + r.title : ''}`; li.querySelector('.lab-catch-up-placeholder, .lab-catch-up-retry, .lab-catch-up-text, .byob-load')?.replaceWith(Object.assign(document.createElement('p'), { className: 'lab-catch-up-text', textContent: r.summary })) };
    const cached = !b.partial && store.get(cacheKey);
    if (cached) return show(cached);
    try {
      const text = await contextText(b.from, b.to, 70000);
      const r = await s.json(`You are Tinct's reading companion. ${bookLine()}\nSummarize pages ${b.from} to ${b.to} for a reader catching up: reply with only JSON {"title": "3 to 6 word name for this stretch", "summary": "2 to 3 plain sentences on what happens or is argued"}.\n\n${text}`, { cache: { gcTime: 86400000 } });
      const rec = { title: String(r?.title || '').slice(0, 80), summary: String(r?.summary || '').slice(0, 900) };
      if (!b.partial) store.set(cacheKey, rec);
      show(rec);
    } catch (e) {
      const btn = Object.assign(document.createElement('button'), { type: 'button', className: 'lab-catch-up-retry', textContent: e?.code === 'rate_limited' ? 'Try again later' : 'Retry' });
      btn.onclick = () => load(i);
      li.querySelector('.lab-catch-up-placeholder, .lab-catch-up-retry, .byob-load')?.replaceWith(btn);
    }
  };
  const recent = Math.max(0, blocks.length - 3);
  entries.forEach((li, i) => {
    if (i >= recent || store.get(`catchup:${state.key}:${blocks[i].from}-${blocks[i].to}`)) return;
    const b = Object.assign(document.createElement('button'), { type: 'button', className: 'lab-catch-up-retry byob-load', textContent: 'Summarize these pages' });
    b.onclick = () => { b.replaceWith(Object.assign(document.createElement('span'), { className: 'lab-catch-up-placeholder', innerHTML: '<i></i><i></i><i></i>' })); load(i) };
    li.querySelector('.lab-catch-up-placeholder').replaceWith(b);
  });
  for (let i = blocks.length - 1; i >= 0; i--) if (i >= recent || store.get(`catchup:${state.key}:${blocks[i].from}-${blocks[i].to}`)) await load(i);
}

/* ---------- Read aloud: streamed by the device, nothing stored ---------- */
const narr = { active: false, page: 1, sentences: [], index: 0, spans: [], word: null, gen: 0 };
// A voice for the book's language: the chosen one when it speaks it, else the device's own for it.
const speaks = lang => v => String(v.lang || '').toLowerCase().split(/[-_]/)[0] === lang;
function bookVoices() {
  const vs = speechSynthesis?.getVoices?.() || [], fits = vs.filter(speaks(bookLang()));
  return fits.length ? fits : vs.filter(speaks('en'));
}
function pickVoice() {
  const vs = speechSynthesis.getVoices(), fits = speaks(bookLang());
  const chosen = vs.find(v => v.name === prefs.voice);
  return (chosen && fits(chosen) ? chosen : null) || vs.find(v => fits(v) && v.default) || vs.find(fits) || chosen || null;
}
const furniture = new Map();
// A line's text with its numbers as one mark: "Page 3 of 7" and "Page 4 of 7" are the same footer.
const numberless = s => s.replace(/\d+/g, '#');
async function isFurniture(n, str) {
  // Running heads, banners and page numbers ("12", "Page 3 of 7") repeat on neighbouring pages; read-aloud skips them.
  const s = str.trim();
  if (!s) return true;
  // Numbered only: a lone "Il" or "I" is a word, not a Roman page number.
  if (/^\d{1,4}$/.test(s) || (/\d/.test(s) && TinctPdfScan.isPageNumber(s))) return true;
  if (s.length < 6) return false;
  const numbered = /\d/.test(s) && s.length <= 80;
  for (const m of [n - 1, n + 1, n - 2, n + 2]) {
    if (m < 1 || m > state.pages.length) continue;
    if (!furniture.has(m)) { const strs = (await pageText(m)).items.map(i => i.str.trim()); furniture.set(m, { exact: new Set(strs), numberless: new Set(strs.filter(t => /\d/.test(t)).map(numberless)) }) }
    const f = furniture.get(m);
    if (f.exact.has(s) || (numbered && f.numberless.has(numberless(s)))) return true;
  }
  return false;
}
// What goes between two text items read in a row: nothing inside a word (pdf.js splits words at
// ligatures and font changes: "a" "ff" "air"), a space between words, and a word broken over a
// line end by a hyphen is joined again ("pro-" "fession" -> "profession").
function joinItems(text, prev, it) {
  if (!prev) return { text, join: '' };
  if (/\s$/.test(text) || /^\s/.test(it.str)) return { text, join: '' };
  const [, , , pd, px, py] = prev.transform, [, , , d, x, y] = it.transform;
  const size = Math.abs(pd) || prev.height || 10;
  const sameLine = !prev.hasEOL && Math.abs(y - py) < size * 0.5 && Math.abs(d) > 0;
  if (sameLine) return { text, join: x - (px + (prev.width || 0)) > size * 0.12 ? ' ' : '' };
  if (/\p{L}-$/u.test(text) && /^\p{Ll}/u.test(it.str)) return { text: text.slice(0, -1), join: '' };
  return { text, join: ' ' };
}
async function preparePage(n) {
  const { items } = await pageText(n);
  const skip = await Promise.all(items.map(it => isFurniture(n, it.str)));
  // One string per page with each item's offsets, split into sentences.
  let text = '', offsets = [], prev = null;
  items.forEach((it, i) => {
    if (!it.str || skip[i]) { if (it.hasEOL && prev) prev = { ...prev, hasEOL: true }; return }
    const j = joinItems(text, prev, it);
    if (j.text.length < text.length && offsets.length) offsets.at(-1).to = j.text.length;
    text = j.text + j.join;
    offsets.push({ i, from: text.length, to: text.length + it.str.length });
    text += it.str; prev = it;
  });
  text += ' ';
  const sentences = [];
  // A sentence ends at . ! or ? followed by a space (so 2.5 and e.g. stay whole), or at the end of the page.
  const re = /[\s\S]+?(?:[.!?]+["’”)\]]*(?=\s+[^a-z0-9\s])|$)/g; let m;
  const spoken = t => { const toks = t.split(/\s+/).filter(Boolean); return toks.length < 4 || toks.filter(w => /[A-Za-z]{3,}/.test(w)).length / toks.length >= 0.4 };
  while ((m = re.exec(text))) { const s = m[0]; if (s.trim().length > 1 && spoken(s)) sentences.push({ from: m.index, to: m.index + s.length, text: s.trim() }) ; if (m.index === re.lastIndex) re.lastIndex++ }
  return { text, offsets, sentences };
}
function setPlay(playing) { $('playBtn').innerHTML = playing ? ICON.pause : ICON.play; $('playBtn').setAttribute('aria-label', playing ? 'Pause' : 'Play'); root.dataset.playing = String(playing) }
function clearPaint() { document.querySelectorAll('.text-layer .is-reading, .text-layer .is-word').forEach(s => s.classList.remove('is-reading', 'is-word')) }
function paintNarration(charIndex) {
  clearPaint();
  const p = state.pages[narr.page - 1]; if (!p?.spans || !narr.prep) return;
  const s = narr.prep.sentences[narr.index]; if (!s) return;
  for (const o of narr.prep.offsets) {
    if (o.to <= s.from || o.from >= s.to) continue;
    const span = p.spans[o.i]; if (!span) continue;
    span.classList.add('is-reading');
    if (charIndex != null) { const abs = s.from + charIndex; if (abs >= o.from && abs < o.to) span.classList.add('is-word') }
  }
}
async function startNarration() {
  if (!('speechSynthesis' in window)) { toast('Read-aloud is not available in this browser.'); return }
  const gen = ++narr.gen;
  narr.active = true; narr.paused = false; setPlay(true); renderTransport();
  if (!narr.prep) { const place = currentPlace(); narr.page = place.page; narr.index = 0 }
  while (narr.active && gen === narr.gen && narr.page <= state.pages.length) {
    if (!narr.prep) narr.prep = await preparePage(narr.page);
    if (gen !== narr.gen) return;
    if (narr.index >= narr.prep.sentences.length) { narr.page++; narr.index = 0; narr.prep = null; if (narr.page <= state.pages.length) goTo({ page: narr.page, frac: 0 }, true); renderTransport(); continue }
    const s = narr.prep.sentences[narr.index];
    const pg = state.pages[narr.page - 1];
    const span = pg?.spans?.[narr.prep.offsets.find(o => o.to > s.from)?.i];
    if (span) { const r = span.getBoundingClientRect(), sr = $('scroll').getBoundingClientRect(); if (r.top < sr.top + 40 || r.bottom > sr.bottom - 120) $('scroll').scrollBy({ top: r.top - sr.top - sr.height * 0.3, behavior: 'smooth' }) }
    paintNarration();
    const ok = await new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(s.text);
      u.rate = prefs.rate; u.lang = bookLang(); const v = pickVoice(); if (v) u.voice = v;
      const offsetInText = narr.prep.text.slice(s.from, s.to).indexOf(s.text[0]);
      u.onboundary = e => { if (gen === narr.gen) paintNarration(e.charIndex + Math.max(0, offsetInText)) };
      u.onend = () => resolve(true); u.onerror = () => resolve(false);
      speechSynthesis.speak(u);
    });
    if (!ok || gen !== narr.gen || !narr.active) return;
    narr.index++;
    renderTransport();
  }
  if (gen === narr.gen) { narr.active = false; setPlay(false); renderTransport() }
}
function pauseNarration() { narr.active = false; narr.paused = true; narr.gen++; try { speechSynthesis.cancel() } catch {}; setPlay(false); renderTransport() }
function stopNarration() { narr.active = false; narr.paused = false; narr.prep = null; narr.gen++; try { speechSynthesis.cancel() } catch {}; setPlay(false); clearPaint(); renderTransport() }
function togglePlay() {
  if (!hasBook()) { toast('Open a book first.'); return }
  if (isEpub()) { toast('Read aloud works in PDFs for now.'); return }
  if (hasNoText() && !narr.active) return;
  if (narr.active) return pauseNarration();
  // Resume where it paused while the page is still in view; otherwise start at the page on screen.
  if (narr.prep) { const place = currentPlace(); if (Math.abs(place.page - narr.page) > 1) { narr.prep = null } }
  startNarration();
}
async function jumpNarration(page, index) {
  const wasPlaying = narr.active || narr.paused;
  narr.gen++; try { speechSynthesis.cancel() } catch {}
  narr.page = page; narr.prep = await preparePage(page); narr.index = Math.max(0, Math.min(index, narr.prep.sentences.length - 1));
  goTo({ page, frac: 0 }, true);
  if (wasPlaying) startNarration(); else { paintNarration(); renderTransport() }
}
async function skip(dir) {
  // About 15 seconds of speech: ~14 characters a second at 1×.
  if (!narr.prep) return;
  let budget = 15 * 14 * prefs.rate, page = narr.page, prep = narr.prep, i = narr.index;
  while (budget > 0) {
    i += dir;
    if (i < 0) { if (page <= 1) { i = 0; break } page--; prep = await preparePage(page); i = prep.sentences.length - 1; if (i < 0) { i = 0; continue } }
    if (i >= prep.sentences.length) { if (page >= state.pages.length) { i = prep.sentences.length - 1; break } page++; prep = await preparePage(page); i = 0; if (!prep.sentences.length) continue }
    budget -= prep.sentences[i]?.text.length || 0;
  }
  jumpNarration(page, i);
}
async function seekChapter(frac) {
  const ch = chapterAt(narr.page) || chapterAt(currentPlace().page);
  const r = ch ? chapterRange(ch) : { from: 1, to: state.pages.length };
  const exact = r.from + frac * (r.to - r.from + 1), page = Math.min(r.to, Math.floor(exact));
  const prep = await preparePage(page);
  jumpNarration(page, Math.floor((exact - page) * prep.sentences.length));
}
$('playBtn').onclick = togglePlay;
// Clicking a saved highlight offers Explain, Chat, Remove highlight and Copy.
document.addEventListener('click', e => {
  if (!getSelection().isCollapsed || narr.active || e.target.closest('.selection-popup, .lab-ask, .lab-header')) return;
  const h = highlightAt(e.clientX, e.clientY), open = document.querySelector('.selection-popup[data-popup-mode="highlight"]');
  if (!h) { open && hideSelection(); return }
  sel = { text: h.text, page: h.page, box: h.box }; showSelection(h);
  // The click collapses the selection; keep this popup until the next click or selection.
  const pop = document.querySelector('.selection-popup'); if (pop) pop.dataset.popupMode = 'highlight';
});
// Tapping a word while reading aloud moves the narration there.
document.addEventListener('click', e => {
  const span = e.target.closest?.('.text-layer span'); if (!span || !(narr.active || narr.paused) || !getSelection().isCollapsed) return;
  const page = Number(span.closest('.pdf-sheet').dataset.page), i = Number(span.dataset.i);
  preparePage(page).then(prep => { const o = prep.offsets.find(x => x.i === i); jumpNarration(page, Math.max(0, prep.sentences.findIndex(s => s.to > (o?.from || 0)))) });
});

/* ---------- Files out ---------- */
// A picture of the page with every PDF Explain/Ask is not part of release 1: only what the
// reader attaches or snips is sent.
const PAGE_IMAGES = false;
const IMAGES_ENABLED = true; // signed-in /api/chat takes pictures; guests fall back to text (see DEPLOY.md, "Images")
function saveFile(name, blob) {
  try {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 30000);
    return true;
  } catch { return false }
}
function blobToDataUrl(blob) { return new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => res(''); r.readAsDataURL(blob) }) }

/* ---------- Boot ---------- */
applyLayout();
document.fonts?.ready.then(applyLayout);
applyTheme(); state.trim = !!prefs.trim;
if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('vendor/pdfjs/pdf.worker.min.js', document.baseURI).href;
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};
if (window.TinctAI) TinctAI.onSignedOut = () => toast('Your Tinct sign-in has expired, so this answer used the guest allowance. Sign in again to use your own.');
document.body.dataset.view = 'start';
// A book's own address opens straight into the reader (start.js boot opens the book).
if (urlHex()) { $('start').hidden = true; showReader(); $('column').innerHTML = '<div class="pdf-status" role="status">Opening…</div>' }
if (location.hash === '#read') history.replaceState(null, '', location.pathname + location.search);
window.dispatchEvent(new Event('tinct-reader-ready'));
