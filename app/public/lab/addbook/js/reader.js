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
const state = { kind: null, figs: new Map(), pdf: null, epub: null, key: '', name: '', title: '', author: '', scan: null, titleReady: null, pages: [], zoom: 1, fit: null, pagesAsked: false, trim: false, base: { w: 612, h: 792 }, token: 0, observer: null, texts: new Map() };
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
  strip?.update();
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
// Once the account copy is stored ("Saved to your account"), what was asked before it was is asked
// again (whenSaved: recognising a scan's text, the first-open race of 15 Oct 2026).
const saveToAccount = async (key, file, meta, options = {}) => {
  await engine.saveToAccount(key, file, meta, { notify: toast, ...options });
  if (engine.cloud?.get(key)) dispatchEvent(new CustomEvent('tinct-book-saved', { detail: { key } }));
};
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
// `known`: the record already read from this device (openFromUrl), so a large file is read once (FIXES item 12).
async function openStored(key, known = null) {
  if (needsAccount()) return false;
  let rec = known || await library.get(key);
  if (!rec) {
    // On the account but not on this device yet: download it, then keep it here too.
    const remote = cloud.get(key);
    if (!remote) { toast('That book is no longer on this device. Open the file again.'); return false }
    let bytes;
    try { bytes = await downloadChecked(remote.id, key) }
    catch (e) {
      if (e?.code === 'not_found') { cloud.mine().delete(key); toast('That book is no longer in your account.') }
      else toast('That book could not be downloaded. Try again.');
      return false;
    }
    const now = Date.now();
    rec = { key, kind: remote.type, name: remote.name || remote.title, size: bytes.byteLength, title: remote.title || remote.name, author: remote.author || '', owner: owner(), addedAt: Date.parse(remote.createdAt) || now, openedAt: now, cloudId: remote.id, bytes: bytes.buffer };
    if (!await library.put(rec)) toast('This browser could not keep a copy, so you will need to open the file again next time.');
  } else {
    // When it was opened goes on the record after the page is shown: writing the record rewrites the
    // whole file (a 73 MB book took 6.8 s to reopen, gloss-test/edge.html), so it waits (openBook).
    rec = { ...rec, opened: Date.now() };
  }
  // Opened before it reached the account (offline, or the sign-in had lapsed): save it now.
  const pending = !rec.cloudId && cloud.usable() ? new Blob([rec.bytes]) : null;
  if (rec.kind === 'epub' && (rec.opened ? (await library.touch(key, { openedAt: rec.opened }), true) : await library.get(key))) { await openInTinct(new Uint8Array(rec.bytes), rec.name, key, pending, { quiet: true }); return true }
  await openBook(rec.kind, new Uint8Array(rec.bytes), rec.name, key, rec);
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
// A wait in the column: the reader's ring in the status block's own box (wait-ring.js, after its
// moment), the wording ("Opening…") for screen readers only. Errors keep their text (role="alert").
function waitStatus(label) {
  const box = document.createElement('div'); box.className = 'pdf-status';
  box.append(TinctWait.waitRing(label, { size: 21 }));
  $('column').replaceChildren(box);
  return box;
}
async function openInTinct(bytes, name, key, upload, { quiet = false } = {}) {
  const token = ++state.token;
  showReader();
  closeAllPopups();
  waitStatus('Opening…');
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
/** `rec`: the book's record as read for this open, when there is one (openStored): not read again. */
async function openBook(kind, bytes, name, key, rec = null) {
  showReader();
  if (kind === 'epub') await openEpub(bytes, name, key); else await openPdf(bytes, name, key, rec);
  if (hasBook()) {
    // One write, after the page is drawn, and none when nothing changed: each write rewrites the whole file.
    const patch = { ...(rec?.opened ? { openedAt: rec.opened } : {}), ...(!rec || rec.title !== state.title || (rec.author || '') !== (state.author || '') ? { title: state.title, author: state.author || '' } : {}) };
    if (Object.keys(patch).length) setTimeout(() => library.touch(key, patch), rec ? 2500 : 0);
    // A PDF is a book with its own address (/lab/addbook/?userBook=<hex>): a reload, the
    // library and the book switcher open it again at its place.
    const url = kind === 'pdf' ? bookUrl(key) + (state.pagesAsked ? '&pages' : '') : null;
    // Arrived at this book's own address with a page asked (the Tinct reader's "Show page"): the address is
    // tidied in place, so Back goes straight back to the paragraph it came from.
    if (url) { if (location.pathname + location.search !== url) history[urlHex() === hexOf(key) ? 'replaceState' : 'pushState']({ addbookReader: key }, '', url) }
    else if (location.hash !== '#read') history.pushState({ addbookReader: key }, '', '#read');
  }
}
const hexOf = key => String(key).slice(String(key).indexOf(':') + 1);
const bookUrl = key => '/lab/addbook/?userBook=' + encodeURIComponent(hexOf(key));
const urlHex = () => { const v = new URLSearchParams(location.search).get('userBook'); return /^[0-9a-f]{8,64}$/.test(v || '') ? v : null };
// The library's My shelf, where the reader's own books are (a book no longer here points there).
const SHELF_URL = '/library#my-shelf';
// The back arrow of every own book: the library's reading table, as from Tinct's books (Anders, 2026-10-12).
const LIBRARY_URL = '/library';
let leavingToShelf = false;
async function leaveToShelf() {
  if (leavingToShelf) return;
  leavingToShelf = true;
  leavePlace(); stopNarration();
  await accountCopySent();
  location.assign(LIBRARY_URL);
}
// Back on this page from My shelf (restored as it was left): the way back works again.
addEventListener('pageshow', () => { leavingToShelf = false });
// /lab/addbook/?userBook=<hex>: this book, from this device, else from the account.
async function openFromUrl(hex) {
  if (needsAccount()) return false;
  showReader();
  waitStatus('Opening…');
  for (const kind of ['pdf', 'epub']) { const rec = await library.get(kind + ':' + hex); if (rec) return openStored(kind + ':' + hex, rec) }
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
  closeChat(); marginStop(); stopNarration(); closeAllPopups(); endSnip?.(); ocrStop(); strip?.close();
  ++state.token;
  state.observer?.disconnect(); state.pdf?.destroy?.();
  Object.assign(state, { kind: null, pdf: null, epub: null, pages: [], fit: null, pagesAsked: false, lastPlace: null, key: '', name: '', title: '', author: '', scan: null, textEdition: null, titleReady: null, texts: new Map(), figs: new Map() }); toc.entries = []; toc.ready = false; zoomClass();
  Object.assign(book, { key: null, pdf: null, task: null, texts: [], numbers: [], matter: [], index: null });
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
  waitStatus('Opening…');
  let book;
  try { book = await TinctEpub.parse(bytes, { fallbackTitle: name.replace(/\.epub$/i, ''), onProgress: f => { $('column').querySelector('.pdf-status .tinct-wait')?.setLabel(`Opening… ${Math.round(f * 100)}%`) } }) }
  catch (e) { $('column').innerHTML = `<div class="pdf-status" role="alert">${esc(e?.code === 'drm' || e?.code === 'unsupported' || e?.code === 'bad_epub' || e?.code === 'not_zip' ? e.message : 'This file could not be opened as an EPUB. Choose another file.')}</div>`; return }
  if (token !== state.token) return;
  state.pdf?.destroy?.(); state.observer?.disconnect();
  Object.assign(state, { kind: 'epub', epub: book, pdf: null, key, title: book.title, author: book.authors.join(', '), texts: new Map(), pages: [], ocrPages: null });
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
  // With EPUB_MARGIN on, an EPUB read here has the margin too (FIXES-2026-10-15 PR C): its column, marks
  // or bottom card, in place of the docked chat. No Before you start yet, no passage pictures. Off: as before.
  if (epubMargin()) {
    warmDictionary();
    primerReset();
    setTimeout(() => (window.requestIdleCallback || setTimeout)(() => { if (token === state.token) readDocument() }), 4000);
    marginStart();
  } else if (!isPhone() && prefs.dock !== 'closed') setTimeout(() => { if (hasBook() && !chat.el?.isConnected) openChat({ quiet: true }) }, 50);
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
// The book's key names the first 24 hex digits of its SHA-256 (add-engine.js digest): bytes that do not match are not the book.
const bytesMatch = async (bytes, key) => !!bytes?.byteLength && await engine.digest(bytes) === hexOf(key);
/** The account copy, checked against the book's key and asked for once more when it does not match (a download cut short). */
async function downloadChecked(id, key) {
  for (let tries = 0; ; tries++) {
    const bytes = await window.TinctAI.books.download(id);
    if (!/^(pdf|epub):[0-9a-f]{24}$/.test(key) || await bytesMatch(bytes, key)) return bytes;
    console.warn('[addbook] the account copy did not match its book; asking again');
    if (tries >= 1) throw Object.assign(new Error('corrupt'), { code: 'corrupt' });
  }
}
/**
 * The PDF, opened by pdf.js. A large book once failed to open at random on the desktop ("This file could not be
 * opened as a PDF", MacKay's 640 pages, the night checklist of 15 Oct 2026): a failure other than a password is
 * tried once more, with the bytes read again (pdf.js hands the first ones to its worker, which detaches them) from
 * this device's copy, else the account's, each checked against the book's key. -> the pdf.js document, or throws.
 */
async function loadPdf(bytes, key, token) {
  const open = data => pdfjsLib.getDocument({ data, isEvalSupported: false }).promise;
  try { return await open(bytes) }
  catch (e) {
    if (e?.name === 'PasswordException' || token !== state.token) throw e;
    console.warn('[addbook] the PDF did not open; trying once more', e);
    const again = await freshPdfBytes(key).catch(() => null);
    if (!again || token !== state.token) throw e;
    return await open(again);
  }
}
async function freshPdfBytes(key) {
  if (!/^pdf:[0-9a-f]{24}$/.test(key)) return null;
  const rec = await library.get(key);
  if (rec?.bytes) { const b = new Uint8Array(rec.bytes); if (await bytesMatch(b, key)) return b }
  // This device's copy is not the book (or is gone): the account's, kept here again in its place.
  const remote = cloud.get(key);
  if (!remote) return null;
  const b = await downloadChecked(remote.id, key);
  if (rec) await library.touch(key, { bytes: b.slice().buffer, size: b.byteLength });
  return b;
}
async function openPdf(bytes, name, key, known = null) {
  const token = ++state.token;
  closeAllPopups();
  waitStatus('Opening…');
  // Asked while the file opens: a place read later on another device of the account.
  const synced = placeSync.reconcile(key);
  let pdf;
  try { pdf = await loadPdf(bytes, key, token) }
  catch (e) { if (token !== state.token) return; $('column').innerHTML = `<div class="pdf-status" role="alert">${e?.name === 'PasswordException' ? 'This PDF is password-protected, so it cannot be opened here.' : 'This file could not be opened as a PDF. Choose another file.'}</div>`; return }
  if (token !== state.token) return;
  state.pdf?.destroy?.();
  furniture.clear();
  // The scan (js/pdf-scan.js) kept with the book is used while it is of the current version;
  // until a new scan has read the title, the book's stored name stands in.
  const rec = known || await library.get(key);
  const scan = TinctPdfScan.current(rec?.scan) ? rec.scan : null;
  // The PDF's Tinct text when this device has converted it (the Tinct reader keeps it on the
  // record): a place here also names the same spot in it (textSpot).
  const textEdition = window.TinctPdfText?.usable(rec?.edition) ? rec.edition : null;
  // A scan's recognised pages (js/pdf-ocr.js), kept with the book once fetched: its text layer and its text.
  const ocrPages = ocrPagesOf(rec?.ocrPages);
  // A link that asks for the pages (&pages) is read once, here: the address loses it when the book's own is
  // pushed (openBook), and a first open's scan finishes after that (the &pages race, 15 Oct 2026).
  const pagesAsked = new URLSearchParams(location.search).has('pages');
  Object.assign(state, { kind: 'pdf', pdf, epub: null, key, name, title: scan?.title || rec?.title || TinctPdfScan.cleanFileName(name), author: scan ? scan.author : rec?.author || '', scan, textEdition, ocrPages, texts: new Map(), figs: new Map(), pagesAsked, fit: null, docKind: null });
  if (token !== state.token) return;
  root.classList.add('is-pdf'); root.classList.remove('is-epub');
  root.style.removeProperty('--epub-scale');
  const first = (await pdf.getPage(1)).getViewport({ scale: 1 });
  state.base = { w: first.width, h: first.height };
  const { late } = await synced;
  if (token !== state.token) return;
  // Read as Tinct text (here or, by its place, on another device): the Tinct reader, before the pages draw.
  if (scan) await openKind(scan, token);
  if (token !== state.token) return;
  if (scan && forwardToText(scan)) return;
  let saved = store.get('pos:' + state.key);
  // A link's page (the Tinct reader's "Original pages") wins for this open; at the saved page, its spot on it too.
  // A paragraph's "Show page" in the Tinct reader names how far down the page it stands too (&frac=).
  const askedParams = new URLSearchParams(location.search), asked = Number(askedParams.get('page')), askedFrac = Number(askedParams.get('frac'));
  const fracAsked = askedParams.has('frac') && Number.isFinite(askedFrac) ? Math.max(0, Math.min(1, askedFrac)) : null;
  if (Number.isInteger(asked) && asked >= 1 && asked <= pdf.numPages && (asked !== saved?.page || (fracAsked !== null && fracAsked !== saved?.frac))) saved = { ...(saved || {}), page: asked, frac: fracAsked ?? 0 };
  // On a phone: the reader's own zoom there, else the text column fills the width (columnFit); the desktop's as before.
  state.zoom = isPhone() ? await phoneZoom(saved, token) : saved?.zoom || 1;
  if (token !== state.token) return;
  zoomClass();
  // Where the book opens: the reader has not moved until they leave it (savePlaceNow).
  state.lastPlace = saved?.page ? { page: saved.page, frac: saved.frac || 0 } : { page: 1, frac: 0 };
  setBookTitle(state.title, state.author);
  buildSheets(pdf.numPages);
  strip?.open();
  noteSession();
  buildContents();
  keepPdfCover(pdf, key, token, rec);
  marksSync.open();
  cardsSync.open();
  warmDictionary();
  // Before you start: the PDF's units, from its outline (PR 3).
  primerReset(); loadUnits();
  // The PDF's printed page labels ("xii", "12"), for citations: what the companion is shown and cites.
  // Without labels, the numbers the pages print (pageLabels).
  state.labels = null;
  // The margin's document (marginDocument) waits for the labels, so its text is the same on every request.
  state.labelsTask = pageLabels(pdf, key, token).catch(() => {});
  // The whole file's text, read once while the reader settles in, for the margin's companion.
  setTimeout(() => (window.requestIdleCallback || setTimeout)(() => { if (token === state.token) readDocument() }), 4000);
  // The margin replaces the docked chat (docs/margin/BRIEF.md §3): its column, or marks in a narrow window.
  marginStart();
  requestAnimationFrame(() => { if (saved) goTo({ page: saved.page, frac: saved.frac }); else $('scroll').scrollTop = 0; panToColumn(); onScroll() });
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
  fitPill();
}
// A PDF's cover is its first page, drawn once (coverV 2) at the size Your books and the
// library show it, after the page is open so it never delays reading.
const PDF_COVER_WIDTH = 900;
function keepPdfCover(pdf, key, token, known = null) {
  setTimeout(async () => {
    try {
      if (token !== state.token || state.pdf !== pdf) return;
      // Drawn already (the record read for this open says so): not read again.
      const rec = known && known.coverV >= 2 && known.coverW >= PDF_COVER_WIDTH ? known : await library.get(key);
      // Drawn already: its small copy goes to an account copy that has none (copies saved before covers were kept).
      if (!rec || (rec.coverV >= 2 && rec.coverW >= PDF_COVER_WIDTH)) { if (rec) await engine.covers?.save(key); return; }
      const page = await pdf.getPage(1);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: PDF_COVER_WIDTH / base.width });
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      await library.touch(key, { cover: canvas.toDataURL('image/jpeg', 0.86), coverW: canvas.width, coverV: 2 });
      // Its small copy goes with the account copy, when that has none (add-engine.js covers).
      await engine.covers?.save(key);
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
const columnPad = () => { const cs = getComputedStyle($('column')), v = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight); return Number.isFinite(v) ? v : 32 };
/**
 * The pages' area across the scroller. With the margin's column the scroller runs to the window's edge
 * (one scroll surface, its scrollbar at the right, Anders, 15 Oct) and the pages keep to its left, the
 * column's room being the page column's right margin (margin.css).
 */
const pagesWidth = () => $('scroll').clientWidth - (root.classList.contains('margin-open') ? parseFloat(getComputedStyle($('column')).marginRight) || 0 : 0);
// Focus view keeps the page as wide as Margin view has it (the column's room left empty), so a switch only re-centres it.
const focusRoom = () => (col.mode === 'focus' && !prefs.full && innerWidth >= TinctMargin.COL.narrow ? TinctMargin.COLUMN_RESERVE + 14 : 0);
const columnWidth = () => { const room = focusRoom(), w = pagesWidth() - columnPad() - room; return prefs.full ? w : Math.min(w, root.classList.contains('dock-open') || room ? 1100 : 1500) };
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
/* A page's text, as everything the companion reads and a selection takes it: the body in the PDF's
   order, with a figure's labels and caption kept out of its flow (js/reading-order.js, FIXES long
   books item 11). `roles` says which items are body, caption or figure, for the text layer. */
function textOf(items, view) {
  const RO = window.TinctReadingOrder;
  if (!RO) return { roles: null, text: items.map(i => i.str + (i.hasEOL ? '\n' : '')).join('').replace(/[ \t]+/g, ' ').trim() };
  const roles = RO.roles(items, view);
  return { roles, text: RO.pageText(items, roles) };
}
async function pageText(n) {
  if (state.texts.has(n)) return state.texts.get(n);
  if (isEpub()) return { text: '', items: [] };
  // A recognised scan's page: its recognised text; its items are laid out once the page is drawn (ocrItems).
  const recognised = state.ocrPages?.get(n);
  if (recognised) { const value = { text: TinctPdfOcr.pageText(recognised), items: [], ocr: true }; state.texts.set(n, value); return value }
  const page = await state.pdf.getPage(n);
  const content = await page.getTextContent();
  const items = await shownItems(page, content.items);
  const value = { items, ...textOf(items, page.view) };
  state.texts.set(n, value);
  return value;
}
/* Text a placed figure carries clipped out of sight (TD-Gammon's figure holds a page of an earlier draft) is no
   text of the page: on a page whose lines lie on top of each other, the page is drawn small and the text it
   does not show is dropped (TinctReadingOrder.hidden), for the text layer, selections and the companion alike.
   Other pages are untouched. -> the items, the unseen ones emptied (indexes kept) */
async function shownItems(page, items) {
  const RO = window.TinctReadingOrder;
  if (!RO?.hidden || !RO.suspect(items)) return items;
  try {
    const base = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: 480 / base.width });
    const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    const g = c.getContext('2d', { alpha: false }); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: g, viewport: vp }).promise;
    const W = 240, H = Math.max(1, Math.round(W * c.height / c.width)), small = document.createElement('canvas'); small.width = W; small.height = H;
    const x = small.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0, W, H);
    const d = x.getImageData(0, 0, W, H).data, ink = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) ink[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) < 247 ? 1 : 0;
    const gone = RO.hidden(items, page.view, ink, W, H);
    return gone.size ? items.map((it, i) => (gone.has(i) ? { ...it, str: '', hasEOL: false } : it)) : items;  // (empty items in the run lose their line ends too)
  } catch { return items }
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
  // Page 1: arXiv's side stamp is painted out in white, which the theme then turns into the paper (js/strip.js).
  if (p.n === 1 && window.TinctStrip) {
    const stamp = TinctStrip.findStamp((await pageText(1)).items, 1);
    if (token !== state.token || p.task !== task) return;
    if (stamp) TinctStrip.maskStamp(canvas.getContext('2d', { alpha: false }), viewport.transform, TinctStrip.stampBox(stamp));
  }
  // Dark: the page as shown is a recoloured copy; the page as drawn stays for snips, figures
  // and sketches. Without a copy (out of memory), a CSS filter darkens the page instead.
  const shown = dark ? (await darkCopy(page, canvas, viewport)) || canvas : canvas;
  if (token !== state.token || p.task !== task) return;
  shown.classList.toggle('is-raw', dark && shown === canvas);
  p.canvas?.remove(); p.layer?.remove();
  if (p.source && p.source !== canvas) p.source.width = 0;
  p.pg.prepend(shown); p.canvas = shown; p.source = shown === canvas ? null : canvas; p.renderedWidth = width; p.dark = dark;
  const text = await pageText(p.n);
  // A recognised scan: its words laid over the page as printed (the drawn page's ink and the blocks' boxes).
  const items = text.ocr ? ocrItems(p, page, text) : text.items;
  // (In Dark the page shown is its recoloured copy: the text layer goes over that one too.)
  if (token !== state.token || p.canvas !== shown) return;
  // A PDF's own text keeps a figure's labels and caption out of the body's flow (js/reading-order.js); a
  // recognised scan's lines are already in reading order, captions as their own blocks (pdf-ocr.js).
  buildTextLayer(p, items, page.getViewport({ scale: cssScale }), text.ocr ? null : text.roles);
  if (!state.figs.has(p.n)) setTimeout(() => detectFigures(p), 0); else { const f = state.figs.get(p.n); p.figures = f.figures; p.captions = f.captions }
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
function buildTextLayer(p, items, vp, roles = null) {
  const layer = document.createElement('div');
  layer.className = 'text-layer';
  layer.setAttribute('aria-label', `Text of page ${p.n}`);
  const spans = [];
  const frag = document.createDocumentFragment();
  // Side columns (margin figures, notes) follow the body in the PDF's text order, so a drag
  // through the body would run into them. Find where body lines end and move the rest after.
  // Measured from the body's long lines (textLines: a line's run of items, word gaps apart), not single
  // items: a justified line often comes as several items ("…in physics and" | "other fie" | "lds. For
  // instance,"), and an item ending mid-line once set the body's edge there, so the rest of every such line
  // was moved after the body and a selection skipped it (Constructor Theory, 16 Oct 2026).
  const lines = textLines(items);
  const longs = lines.filter(l => l.chars > 30);
  const lefts = longs.map(l => l.x).sort((a, b) => a - b), bodyLeft = lefts[Math.floor(lefts.length * 0.3)];
  const bodyEnds = longs.filter(l => Math.abs(l.x - bodyLeft) < l.size * 4).map(l => l.x2).sort((a, b) => a - b);
  const bodyRight = bodyEnds.length >= 4 ? bodyEnds[Math.floor(bodyEnds.length * 0.9)] : Infinity;
  const side = document.createElement('div'); side.className = 'side-col';
  // A figure's labels and caption (js/reading-order.js) come after everything else, so a drag
  // through text wrapped beside a figure never runs through them.
  const fig = document.createElement('div'); fig.className = 'side-col fig-col';
  const body = [];
  // A superscript reads with ^ in a selection, as in the companion's text ("n^2", "10^18"; js/reading-order.js), and
  // runs on from its base with no space between. A recognised scan's items have no superscripts.
  const RO = window.TinctReadingOrder, marks = roles && RO?.scripts ? RO.scripts(items) : null;
  const nextShown = i => { for (let k = i + 1; k < items.length; k++) if (items[k].str.trim()) return k; return -1 };
  items.forEach((item, i) => {
    if (!item.str.trim()) { spans.push(null); return }
    const tx = pdfjsLib.Util.transform(vp.transform, item.transform);
    const size = Math.hypot(tx[2], tx[3]);
    if (size < 1) { spans.push(null); return }
    const angle = Math.atan2(tx[1], tx[0]);
    const span = document.createElement('span');
    const k = marks ? nextShown(i) : -1, joined = marks && ((marks[i] && !marks[i].last) || (k >= 0 && marks[k]?.first && marks[k].caret));
    const str = marks ? RO.shown(items, marks, i) : item.str;
    span.textContent = str + (item.hasEOL ? '\n' : joined || touches(items, i) ? '' : ' ');
    span.dataset.i = i;
    // A recognised scan's line keeps what it is: a caption, an algorithm box, a footnote (pdf-ocr.js).
    if (item.kind) span.dataset.kind = item.kind;
    span.style.left = tx[4] + 'px';
    span.style.top = (tx[5] - size * 0.86) + 'px';
    span.style.fontSize = size + 'px';
    measureCtx.font = `${size}px sans-serif`;
    const natural = measureCtx.measureText(str).width;
    const target = item.width * vp.scale;
    const sx = natural > 0 && target > 0 ? target / natural : 1;
    span.style.transform = `${angle ? `rotate(${angle}rad) ` : ''}scaleX(${sx})`;
    spans.push(span);
    if (roles && (roles[i] === 'figure' || roles[i] === 'caption')) fig.appendChild(span);
    else if (item.transform[4] > bodyRight + 2) side.appendChild(span);
    else body.push({ span, x: tx[4], base: tx[5], size, w: target, str: item.str });
  });
  const lay = layoutBody(body, vp); p.blocks = lay.blocks; p.prose = lay.prose;
  for (const b of body) frag.appendChild(b.span);
  layer.appendChild(frag);
  if (side.childNodes.length) layer.appendChild(side);
  if (fig.childNodes.length) layer.appendChild(fig);
  p.pg.appendChild(layer); p.layer = layer; p.spans = spans;
  renderHighlights(p);
  // The primer's trigger sits at a page's first line of text, known once its text layer is drawn.
  if (col.mode === 'column' && primer.trig) marginLayout();
}

/* A page's visual lines for the text layer: on each baseline, runs of items no more than an em apart
   (a justified line's word gaps; a column's gutter or a side note's is wider), left to right.
   -> [{ x, x2, size, chars }] */
function textLines(items) {
  const rows = [];
  for (const it of items) {
    if (!it?.transform || !it.str || !it.str.trim() || Math.abs(it.transform[1]) > 0.01 * Math.abs(it.transform[0])) continue;
    const size = Math.hypot(it.transform[2], it.transform[3]) || 1, y = it.transform[5];
    let row = rows.find(r => Math.abs(r.y - y) < Math.max(1, size * 0.2));
    if (!row) { row = { y, parts: [] }; rows.push(row) }
    row.parts.push({ x: it.transform[4], x2: it.transform[4] + (it.width || 0), size, chars: it.str.trim().length });
  }
  const out = [];
  for (const row of rows) {
    let run = null;
    for (const part of row.parts.sort((a, b) => a.x - b.x)) {
      if (run && part.x - run.x2 <= Math.max(run.size, part.size)) { run.x2 = Math.max(run.x2, part.x2); run.chars += part.chars + 1; continue }
      if (run) out.push(run);
      run = { ...part };
    }
    if (run) out.push(run);
  }
  return out;
}
/* True when the next item on the same line starts where this one ends (a word split into pieces,
   "physic" | "s", "fie" | "lds"): no space between them in a selection's text, as in the page's text
   (TinctReadingOrder.pageText). A space item between, a gap or a new line keeps the space. */
function touches(items, i) {
  const it = items[i], next = items[i + 1];
  if (!it?.transform || !next?.transform || !next.str || !next.str.trim() || /\s$/.test(it.str)) return false;
  const size = Math.hypot(it.transform[2], it.transform[3]) || 1;
  if (Math.abs(next.transform[5] - it.transform[5]) > size * 0.2) return false;
  return Math.abs(next.transform[4] - (it.transform[4] + (it.width || 0))) <= size * 0.1;
}

/* Displayed formulas (js/pdf-regions.js displayFormulas, shared with Tinct text's crops): the body text in
   visual line order, and runs of formula lines, so a selection that touches an equation takes the whole equation. */
function layoutBody(body, vp) {
  const found = TinctPdfRegions.displayFormulas(body, vp);
  body.length = 0; body.push(...found.order);
  found.blocks.forEach((B, k) => { for (const b of B.members) b.span.dataset.m = k });
  return { prose: found.prose, blocks: found.blocks.map(({ x, y, w, h }) => ({ x, y, w, h })) };
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
// Double-click on part of a hyphenated word ("auto-regressive") selects the whole word, in a PDF's
// text layer and an EPUB's text alike (the browser stops at the hyphen).
document.addEventListener('dblclick', () => {
  const s = getSelection(); if (!s.rangeCount) return;
  const r = s.getRangeAt(0), node = r.startContainer;
  if (node.nodeType !== 3 || r.endContainer !== node || !node.parentElement?.closest('.text-layer, .epub-pg')) return;
  const span = TinctMargin.hyphenWord(node.textContent, r.startOffset, r.endOffset); if (!span) return;
  s.setBaseAndExtent(node, span[0], node, span[1]);
});
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
  if (!s || s.isCollapsed || !s.rangeCount || !s.anchorNode?.parentElement?.closest('.text-layer')) { paintHeld(); return }
  for (const bar of selectionShapes(s.getRangeAt(0))) {
    const p = pageForPoint((bar.left + bar.right) / 2, (bar.top + bar.bottom) / 2); if (!p) continue;
    const r = p.pg.getBoundingClientRect(), i = document.createElement('i');
    Object.assign(i.style, { left: (bar.left - r.left) / r.width * 100 + '%', top: (bar.top - r.top) / r.height * 100 + '%', width: (bar.right - bar.left) / r.width * 100 + '%', height: (bar.bottom - bar.top) / r.height * 100 + '%' });
    layerOf(p, 'sel-layer').appendChild(i);
  }
}
document.addEventListener('selectionchange', paintSelection);
// A passage the margin holds (Ask typed, the bar's menus) stays marked as selected until the margin lets go.
function paintHeld() {
  if (!mr?.anchor || mr.ids.length || !(mr.held || mr.mode === 'asking')) return;
  for (const a of mr.anchor) {
    const p = state.pages[a.n - 1]; if (!p) continue;
    const i = document.createElement('i');
    Object.assign(i.style, { left: a.x * 100 + '%', top: a.y * 100 + '%', width: a.w * 100 + '%', height: a.h * 100 + '%' });
    layerOf(p, 'sel-layer').appendChild(i);
  }
}
const highlights = () => store.get('hl:' + state.key) || [];
const HL_COLORS = [['gold', 'Gold', 'rgba(232,196,92,.42)', '#e9cf86'], ['rose', 'Rose', 'rgba(232,118,128,.30)', '#eba7ad'], ['sage', 'Sage', 'rgba(108,178,108,.32)', '#a9d0a3'], ['sky', 'Sky', 'rgba(96,148,226,.30)', '#a6c2ee'], ['lavender', 'Lavender', 'rgba(156,116,222,.30)', '#c6b0ee']];
const hlFill = c => (HL_COLORS.find(x => x[0] === c) || HL_COLORS[0])[2];
function recolorHighlight(id, color) {
  const list = highlights(), h = list.find(x => x.id === id); if (!h) return;
  h.color = color; prefs.hlColor = color; savePrefs();
  if (state.kind === 'pdf') h.u = Date.now();
  putHighlights(list); renderHighlights(state.pages[h.page - 1]);
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
function addHighlight(info, { range, color } = {}) {
  const s = getSelection(); if (!range && !s.rangeCount) return;
  if (isEpub()) return addEpubHighlight(info, range || s.getRangeAt(0), color);
  const byPage = new Map();
  for (const bar of selectionShapes(range || s.getRangeAt(0))) {
    const p = pageForPoint((bar.left + bar.right) / 2, (bar.top + bar.bottom) / 2); if (!p) continue;
    const r = p.pg.getBoundingClientRect();
    if (!byPage.has(p.n)) byPage.set(p.n, []);
    byPage.get(p.n).push([(bar.left - r.left) / r.width, (bar.top - r.top) / r.height, (bar.right - bar.left) / r.width, (bar.bottom - bar.top) / r.height].map(v => Math.round(v * 10000) / 10000));
  }
  const list = highlights();
  const ids = [];
  for (const [page, rects] of byPage) { const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at = Date.now(); ids.push(id); list.push({ id, page, rects, text: info.text.slice(0, 2000), color: color || prefs.hlColor || 'gold', at, u: at }) }
  putHighlights(list);
  for (const page of byPage.keys()) renderHighlights(state.pages[page - 1]);
  return ids;
}
function removeHighlight(id) {
  const h = highlights().find(x => x.id === id);
  // A PDF remembers the removal (a tombstone), so the account's copy and other devices lose it too.
  if (h && state.kind === 'pdf') store.set('hl-gone:' + state.key, TinctMargin.mergeMarks(store.get('hl-gone:' + state.key) || [], [TinctMargin.tombstone(id)]));
  putHighlights(highlights().filter(x => x.id !== id));
  if (h) renderHighlights(state.pages[h.page - 1]);
}
// Saved highlights of the open book; a PDF's go to the account too when signed in (marksSync).
function putHighlights(list) {
  store.set('hl:' + state.key, list);
  if (state.kind === 'pdf') marksSync.changed();
  // A note added, changed or removed is a card in the margin (or no longer one).
  if (marginOn()) marginLayout({ fresh: true });
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
function addEpubHighlight(info, range, color) {
  const list = highlights(), ids = [];
  for (const p of state.pages) {
    if (!range.intersectsNode(p.pg)) continue;
    const r = range.cloneRange();
    if (!p.pg.contains(r.startContainer)) r.setStart(p.pg, 0);
    if (!p.pg.contains(r.endContainer)) r.setEnd(p.pg, p.pg.childNodes.length);
    const start = textOffset(p.pg, r.startContainer, r.startOffset), end = textOffset(p.pg, r.endContainer, r.endOffset);
    if (end - start < 1) continue;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); ids.push(id);
    list.push({ id, page: p.n, start, end, text: r.toString().replace(/\s+/g, ' ').trim().slice(0, 2000) || info.text.slice(0, 2000), color: color || prefs.hlColor || 'gold', at: Date.now() });
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
  strip?.update();
  const place = currentPlace(), n = state.pages.length;
  const ch = toc.ready ? chapterAt(place.page) : null;
  if (isEpub()) {
    const sc = $('scroll'), pct = Math.round(100 * sc.scrollTop / Math.max(1, sc.scrollHeight - sc.clientHeight));
    $('pageLabel').textContent = ch ? ch.label : state.title;
    $('pageBtn').setAttribute('aria-label', `Table of contents, ${ch ? ch.label + ', ' : ''}${pct}% read`);
    $('progress').textContent = `${pct}%`;
    fitPill(window.TinctReaderLayout.pillStages({ chapter: ch ? ch.label : state.title, pct: `${pct}%`, epub: true }));
  } else {
  // The chapter pill: the chapter (a real one, from the scan) or the page, then page and percent.
  // Pages by their printed labels where the PDF has them (or prints them: pageLabels), "of" its last one.
  const pct = `${Math.round(((place.page - 1 + place.frac) / n) * 100)}%`, at = pageLabel(place.page), of = lastLabel();
  $('pageLabel').textContent = ch ? ch.label : `p. ${at} of ${of}`;
  $('pageBtn').setAttribute('aria-label', `Contents and pages, ${ch ? ch.label + ', ' : ''}page ${at} of ${of}, ${pct} read`);
  $('progress').textContent = ch ? `p. ${at} · ${pct}` : pct;
  fitPill(window.TinctReaderLayout.pillStages({ chapter: ch ? ch.label : `p. ${at} of ${of}`, page: at }));
  }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(savePlaceNow, 250);
}
/* The position strip at the pages' left (desktop, PDFs; js/strip.js): the whole PDF, its window, highlights and cards. */
const strip = window.TinctStrip ? TinctStrip.create({
  root, scroll: $('scroll'), header: $('hdr'),
  enabled: () => state.kind === 'pdf' && readerShown() && !isPhone(),
  count: () => state.pages.length,
  sheet: n => state.pages[n - 1].sheet,
  // Text content the reader has read already, else read for the strip only (not kept).
  async text(n) {
    const pdf = state.pdf, page = await pdf.getPage(n), vp = page.getViewport({ scale: 1 });
    const items = state.texts.get(n)?.items || (await page.getTextContent()).items;
    return { items, view: { width: vp.width, height: vp.height, transform: vp.transform } };
  },
  highlights: () => highlights(),
  cards: () => keptCards().filter(c => !c.gone && c.rects?.length && !c.data?.unit && (TinctMargin.cardAnswered(c) || (c.at || 0) >= CARDS_SINCE)),
  cardLabel: card => cardName(card),
  label: n => pageLabel(n),
  goTo: place => { goTo(place); onScroll() },
}) : null;
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
  // A move in a PDF is read in Original pages, at this spot in its Tinct text when this device has it.
  const read = moved && state.kind === 'pdf' ? { edition: 'p', ...textSpot(place) } : {};
  // A PDF's zoom on a phone is kept apart (phoneZoom), and only once the reader chose it: until then the column fit is worked out again.
  const zoom = state.kind === 'pdf' && isPhone() ? (state.fit ? {} : { phoneZoom: state.zoom }) : { zoom: state.zoom };
  store.set('pos:' + state.key, moved ? { ...prev, ...place, ...read, ...zoom, pages: state.pages.length, at: Date.now() } : { ...prev, ...zoom, pages: state.pages.length });
  const hist = store.get('read:' + state.key) || { furthest: 1 };
  if (place.page > hist.furthest) { hist.furthest = place.page; store.set('read:' + state.key, hist) }
  if (moved && state.kind === 'pdf') placeSync.note(hexOf(state.key));
}
// The same spot in the PDF's Tinct text (js/pdf-text.js placeOf), or none (the Tinct reader
// finds it from the page): never a spot left from an earlier place.
function textSpot(place) {
  const spot = state.textEdition ? TinctPdfText.placeOf(state.textEdition, place.page, place.frac) : null;
  return spot ? { ...spot, converter: state.textEdition.converter } : { chapterNumber: undefined, paragraphIndex: undefined, wordIndex: undefined, converter: undefined };
}

/* ---------- Two editions: Tinct text and Original pages ---------- */
// A text PDF reads as its Tinct text in the Tinct reader (/reader?userBook=<hex>) or as its
// pages here; both keep one place (pos:<key>: the page, the spot in the text and the edition
// read), so either opens where the other was left, here and on the reader's other devices.
// Which one a PDF opens in: TinctPdfText.choice (app/src/lab/userBook/pdfEditions.ts).
const hasText = () => state.kind === 'pdf' && (state.scan ? state.scan.textPages > 0 || isOcrText() : !!state.textEdition);
// A scan whose text the account recognised (js/pdf-ocr.js): its Tinct text opens by its own default.
const isOcrText = () => state.textEdition?.source === 'ocr';
// The reader's own choice on this device (the phone's default kept there is not one: TinctReaderLayout.ownChoice).
const ownEdition = () => window.TinctReaderLayout.ownChoice(store.get('edition:' + hexOf(state.key)), store.get('phone-edition:' + hexOf(state.key)), store.get('desk-edition:' + hexOf(state.key)));
// With none, the default: a recognised scan's own; on a phone, by the document's kind (phoneKind); on the desktop, its pages unless running prose (deskKind).
const editionDefault = scan => isOcrText() ? TinctPdfOcr.defaultEdition(state.textEdition) : window.TinctReaderLayout.openDefault({ phone: isPhone(), kind: state.docKind?.kind, layout: scan?.layout });
const editionChoice = scan => TinctPdfText.choice(store.get('pos:' + state.key), ownEdition(), editionDefault(scan));
/* Phones open a PDF by its kind (Anders, 16 Oct 2026, option C; TinctReaderLayout.docKind, phoneEdition): a
   narrative or an essay as its Tinct text, a paper too when it is mostly prose (no columns, mathematics, figures
   or tables: the scan's own rule), everything else in its pages at the column fit. Told here, before any AI call, from
   a primer kept for the book (its kind wins) or the text of a few pages and the scan, and only when the reader
   has chosen nothing for the book (no edition in its place, no choice on this device). The default is kept as
   this device's edition (so the library and the Tinct reader open the book the same way) and marked as the
   phone's (phone-edition:<hex>), so the desktop ignores it and a choice of the reader's replaces it. */
const KIND_V = 1;
function keptPrimerKind(key) {
  let best = null;
  try {
    const prefix = STORE_PREFIX + 'primer:' + key + ':';
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(prefix)) continue;
      const p = JSON.parse(localStorage.getItem(k));
      if (p && window.TinctReaderLayout.KINDS.includes(p.kind) && (!best || String(p.madeAt || '') > String(best.madeAt || ''))) best = p;
    }
  } catch { /* storage unavailable */ }
  return best?.kind || null;
}
async function phoneKind(scan, token) {
  if (!isPhone() || state.kind !== 'pdf' || !scan || !(scan.textPages > 0) || isOcrText() || state.pagesAsked) return;
  const hex = hexOf(state.key), RL = window.TinctReaderLayout;
  if (TinctPdfText.choice(store.get('pos:' + state.key), ownEdition(), null)) return;
  const auto = store.get('phone-edition:' + hex), primerKind = keptPrimerKind(state.key);
  let found = auto?.v === KIND_V && auto.kind && (!primerKind || auto.kind === primerKind) ? { kind: auto.kind, by: auto.by } : null;
  if (!found) {
    const pages = [];
    if (!primerKind) for (const n of RL.kindPages(state.pdf.numPages)) { try { pages.push({ n, text: (await pageText(n)).text }) } catch { /* skipped */ } if (token !== state.token) return }
    found = RL.docKind({ scan, pages, count: state.pdf.numPages, primerKind });
  }
  if (token !== state.token) return;
  state.docKind = found;
  const edition = RL.phoneEdition(found.kind, scan.layout);
  store.set('phone-edition:' + hex, { edition, kind: found.kind, by: found.by, v: KIND_V });
  store.set('edition:' + hex, edition);
}
/* The desktop opens a PDF as its pages (Margin view), except running prose (Anders, 16 Oct 2026;
   TinctReaderLayout.desktopEdition): a narrative or an essay, or a text with no columns, mathematics,
   figures or tables, reads as its Tinct text. Told as on a phone (the kind from a kept primer or a few
   pages' text, no AI call), only when the reader has chosen nothing for the book, and kept as this
   device's edition marked as the desktop's (desk-edition:<hex>), so the library and the Tinct reader
   open it the same way and a choice of the reader's replaces it.
   Before this rule the desktop opened every PDF scoring under 3.5 as Tinct text (MacKay's extract: 2), and
   a place read there carries edition 't' though nobody chose it. A choice of Tinct text is kept as the
   device's edition ('text', readAsText); so a place in Tinct text kept before the rule (RULE_AT), with no
   choice kept, on a device that has not yet opened the book under this rule (OPEN_RULE, open-rule:<hex>),
   followed the old default: it keeps its spot but not its edition, and the new default applies. A place
   in Tinct text kept since then (here or on another device) is honoured as before. */
const DESK_V = 1;
// The open rule this device has applied to a book, and when it began (also app/src/lab/userBook/pdfEditions.ts).
const OPEN_RULE = 2, RULE_AT = Date.UTC(2026, 9, 17);
async function deskKind(scan, token) {
  if (isPhone() || state.kind !== 'pdf' || !scan || !(scan.textPages > 0) || isOcrText() || state.pagesAsked) return;
  const hex = hexOf(state.key), RL = window.TinctReaderLayout;
  if (ownEdition()) return;
  const pos = store.get('pos:' + state.key);
  if (pos?.edition === 'p' || (pos?.edition === 't' && (store.get('open-rule:' + hex) >= OPEN_RULE || pos.at >= RULE_AT))) return;
  const auto = store.get('desk-edition:' + hex), primerKind = keptPrimerKind(state.key);
  let found = auto?.v === DESK_V && auto.kind && (!primerKind || auto.kind === primerKind) ? { kind: auto.kind, by: auto.by } : null;
  if (!found) {
    const pages = [];
    if (!primerKind) for (const n of RL.kindPages(state.pdf.numPages)) { try { pages.push({ n, text: (await pageText(n)).text }) } catch { /* skipped */ } if (token !== state.token) return }
    found = RL.docKind({ scan, pages, count: state.pdf.numPages, primerKind });
  }
  if (token !== state.token) return;
  state.docKind = found;
  const edition = RL.desktopEdition(found.kind, scan.layout);
  store.set('desk-edition:' + hex, { edition, kind: found.kind, by: found.by, v: DESK_V });
  store.set('edition:' + hex, edition);
  // The old default's place: the same spot, its edition now the default's (the edition of a place wins: TinctPdfText.choice).
  const now = store.get('pos:' + state.key);
  if (now?.edition === 't' && edition === 'pages') { const { edition: _old, ...spot } = now; store.set('pos:' + state.key, spot) }
}
// The edition a PDF opens in, told for this device before the Tinct text is forwarded to: on a phone by
// its kind (phoneKind), on the desktop its pages unless running prose (deskKind). Then marked as opened
// under this rule, so the library and the Tinct reader follow its place from now on (pdfEditions.ts).
async function openKind(scan, token) {
  await (isPhone() ? phoneKind(scan, token) : deskKind(scan, token));
  if (token !== state.token || state.kind !== 'pdf' || !scan || state.pagesAsked) return;
  store.set('open-rule:' + hexOf(state.key), OPEN_RULE);
}
const textUrl = page => '/reader?userBook=' + encodeURIComponent(hexOf(state.key)) + (page ? '&page=' + page : '');
// Opened here but read as Tinct text: on to the Tinct reader (not for a link that asks for the pages).
// A scan whose text was recognised stays here, with the margin, its words laid over its pages (the
// scans test, 15 Oct 2026); its Tinct text is one tap away ("Tinct text"), never a redirect.
function forwardToText(scan) {
  if (!scan || !(scan.textPages > 0) || state.pagesAsked || editionChoice(scan) !== 'text') return false;
  const pos = store.get('pos:' + state.key);
  location.replace(textUrl(pos?.page));
  return true;
}
// "Tinct text": the place now, read from here on in the Tinct text, sent at once; then the reader.
function readAsText() {
  if (!hasText()) return;
  savePlaceNow();
  const place = currentPlace(), prev = store.get('pos:' + state.key) || {};
  const spot = sameSpot(place, { page: prev.page, frac: prev.frac }) && Number.isInteger(prev.chapterNumber) ? {} : textSpot(place);
  store.set('pos:' + state.key, { ...prev, ...(sameSpot(place, { page: prev.page, frac: prev.frac }) ? {} : place), ...spot, edition: 't', pages: state.pages.length, at: Date.now() });
  store.set('edition:' + hexOf(state.key), 'text'); store.del('phone-edition:' + hexOf(state.key)); store.del('desk-edition:' + hexOf(state.key));
  placeSync.note(hexOf(state.key), true);
  placeSync.flush();
  stopNarration();
  location.assign(textUrl(place.page));
}
// The Tinct text is offered in the Aa panel (openDisplay) as "Convert to Tinct book": under Layout, or as its own row (TinctReaderLayout.TINCT_TEXT).
// A PDF's text known after the panel opened (the scan, a recognised scan) shows there at once.
function showEditions() { drawLayoutChoices() }

/* ---------- Recognising a scan's text (js/pdf-ocr.js) ---------- */
// A scan (no text layer) can read as Tinct text once the account has recognised its text
// (Premium and the trial). Asked once per book; a free account sees one calm line; with the
// account's switch off (the status route answers 404), nothing but the scan's own note. What
// this device remembers of a book's job is `ocr:<hex>` (asked, the blank pages it found, how
// far it got); the job itself is the account's, so it resumes on any of the reader's devices.
const ocr = { token: 0, el: null, api: null, readyTimer: 0, saving: null, starting: false };
const ocrLocal = hex => ({ get: () => store.get('ocr:' + hex) || {}, set: patch => store.set('ocr:' + hex, { ...(store.get('ocr:' + hex) || {}), ...patch }) });
const ocrApi = () => (ocr.api ??= TinctPdfOcr.api({ token: () => window.TinctAI?.session?.().token || null }));
const visibleNow = () => document.visibilityState !== 'hidden';
// Pages are made and sent only while this page is in front.
const waitVisible = () => visibleNow() ? Promise.resolve() : new Promise(resolve => {
  const on = () => { if (visibleNow()) { document.removeEventListener('visibilitychange', on); resolve() } };
  document.addEventListener('visibilitychange', on);
});
const ACCOUNT_URL = () => '/sign-in?mode=account&returnTo=' + encodeURIComponent(location.pathname + location.search);
function ocrStop() { ocr.token++; clearTimeout(ocr.readyTimer); ocr.el?.remove(); ocr.el = null; ocr.saving = null; ocr.starting = false }
// The account copy of a book just added is still on its way while the reader first opens it: the
// status says so (`stored: false`, the first-open race of 15 Oct 2026), and it is asked again once
// the copy is stored (saveToAccount's `tinct-book-saved` event). Resolves true when saved.
function whenSaved(key, ms = 60000) {
  return new Promise(resolve => {
    const done = ok => { clearTimeout(timer); removeEventListener('tinct-book-saved', on); resolve(ok) };
    const on = e => { if (e.detail?.key === key) done(true) };
    const timer = setTimeout(() => done(false), ms);
    addEventListener('tinct-book-saved', on);
  });
}
async function ocrOpen({ again = false } = {}) {
  if (!window.TinctPdfOcr || state.kind !== 'pdf') return;
  const token = ++ocr.token, key = state.key, hex = hexOf(key);
  const live = () => token === ocr.token && state.key === key && hasBook();
  const status = window.TinctAI?.session?.().token ? await ocrApi().status(hex) : null;
  if (!live()) return;
  // 404 while this page is still sending the account copy (an account that answers 404 for a book it
  // does not have yet): asked again once the copy is in, before anything is said.
  if (status === null && !again && accountCopy.sending && window.TinctAI?.session?.().token) {
    await accountCopy.sending.catch(() => {});
    if (live()) ocrOpen({ again: true });
    return;
  }
  // Switched off (404), or signed out: the scan as before. Not asked now (offline, busy): nothing is said,
  // so the reader is never told the scan "can't be read aloud" while recognition may be on.
  if (status === null) { if (!isOcrText()) toast(NO_TEXT, { hold: true }); return }
  if (!status) return;
  // Not in the account yet: asked again once it is (the offer shows meanwhile; starting waits for it).
  if (status.stored === false) {
    const saving = ocr.saving = { key, done: whenSaved(key) };
    saving.done.then(saved => { if (saved && ocr.saving === saving && !ocr.starting && live()) ocrOpen() });
  } else ocr.saving = null;
  if (status.state === 'done') {
    // Recognised on another device (or while this page was away): kept here now.
    if (!isOcrText()) {
      const edition = await ocrApi().edition(hex);
      if (!live()) return;
      if (edition) { await ocrKeep(edition); ocrLocal(hex).set({ ready: true }) }
    } else if (!state.ocrPages) ocrFetchPages();
  }
  ocrShow(status, token);
  const goingOn = status.state === 'uploading' || status.state === 'running' || (status.state === 'paused' && status.reason === 'premium_required');
  if (goingOn && TinctPdfOcr.canStart(status.tier)) ocrRun(token);
}
// The recognised text reached this device: kept with the book. The scan goes on opening here, in its
// pages with the margin, now with its words laid over them (ocrFetchPages); "Tinct text" reads it reflowed.
async function ocrKeep(edition) {
  const hex = hexOf(state.key);
  state.textEdition = edition;
  await library.touch(state.key, { edition });
  store.set('edition:' + hex, 'pages'); store.del('phone-edition:' + hex); store.del('desk-edition:' + hex);
  const pos = store.get('pos:' + state.key);
  if (pos) store.set('pos:' + state.key, { ...pos, edition: 'p' });
  showEditions();
  await ocrFetchPages();
}
/** A recognised page per page number, from the account's GET …/pages (or kept with the book); null when there is none. */
function ocrPagesOf(list) {
  if (!Array.isArray(list)) return null;
  const pages = new Map(list.filter(pg => pg && Number.isInteger(pg.page) && !pg.blank && !pg.failed && Array.isArray(pg.blocks) && pg.blocks.length).map(pg => [pg.page, pg]));
  return pages.size ? pages : null;
}
/** The recognised pages from the account, kept with the book and laid over the pages now. */
async function ocrFetchPages() {
  const key = state.key, hex = hexOf(key);
  const list = await ocrApi().pages(hex);
  if (state.key !== key || !Array.isArray(list)) return;
  await library.touch(key, { ocrPages: list });
  if (state.key === key) ocrAdopt(list);
}
/** The recognised text, in use from now on: the text layer, the margin's document and primer, read aloud. */
function ocrAdopt(list) {
  const pages = ocrPagesOf(list);
  if (!pages) return;
  state.ocrPages = pages;
  for (const n of pages.keys()) state.texts.delete(n);
  docCache.key = null; docCache.task = null;
  // The whole-book read (search, printed numbers) starts again from the recognised text (readBook).
  if (state.pdf) state.labelsTask = pageLabels(state.pdf, state.key, state.token).catch(() => {});
  // Drawn pages get their text layer now (drawn again, with it).
  for (const p of state.pages) if (p.canvas && pages.has(p.n)) { p.renderedWidth = 0; renderPage(p) }
  applyBookLanguage();
  loadUnits();
  setTimeout(() => (window.requestIdleCallback || setTimeout)(() => { if (state.ocrPages === pages) readDocument() }), 1000);
}
/* The text items of a recognised page (TinctPdfOcr.layoutPage over the page as drawn, read at most
   OCR_INK_EDGE px on its long side), laid out once per page and kept with its text. */
const OCR_INK_EDGE = 1400;
function ocrItems(p, page, text) {
  const recognised = state.ocrPages?.get(p.n);
  if (!recognised) return [];
  if (!text.lines) {
    const c = drawn(p), scale = Math.min(1, OCR_INK_EDGE / Math.max(c.width, c.height));
    const w = Math.max(1, Math.round(c.width * scale)), h = Math.max(1, Math.round(c.height * scale));
    const g = document.createElement('canvas'); g.width = w; g.height = h;
    const x = g.getContext('2d', { willReadFrequently: true });
    x.drawImage(c, 0, 0, w, h);
    try { text.lines = TinctPdfOcr.layoutPage(recognised, TinctPdfOcr.inkMask(x.getImageData(0, 0, w, h).data, w, h), w, h) } catch { text.lines = [] }
    g.width = g.height = 0;
  }
  const vp = page.getViewport({ scale: 1 });
  return (text.items = TinctPdfOcr.textItems(text.lines, { width: vp.width, height: vp.height, transform: vp.transform }));
}
async function ocrRun(token, { rerun } = {}) {
  const key = state.key, hex = hexOf(key), pdf = state.pdf;
  const live = () => token === ocr.token && state.key === key && hasBook();
  const local = ocrLocal(hex);
  try {
    // Started before the account copy was stored: the job waits for it.
    if (ocr.saving?.key === key) { ocr.starting = true; await ocr.saving.done; ocr.starting = false; ocr.saving = null; if (!live()) return }
    await TinctPdfOcr.run({
      hex, pages: pdf.numPages, api: ocrApi(), local, live, rerun, waitVisible,
      render: n => TinctPdfOcr.renderPage(pdf, n),
      sleep: ms => new Promise(r => setTimeout(r, ms)).then(waitVisible),
      onStatus: status => ocrShow(status, token),
      onEdition: edition => ocrKeep(edition),
    });
  } catch (e) {
    if (!live()) return;
    // Premium ended meanwhile: the free line. Anything else (offline, the account busy): the
    // pages sent so far are kept by the account, and the rest go on the next open.
    if (e?.status === 402) ocrShow({ state: 'none', tier: 'none', pages: pdf.numPages }, token);
  }
}
function ocrShow(status, token) {
  if (token !== ocr.token) return;
  const hex = hexOf(state.key), local = ocrLocal(hex);
  const shown = TinctPdfOcr.view(status, local.get(), state.pdf?.numPages);
  clearTimeout(ocr.readyTimer);
  if (!shown) { ocr.el?.remove(); ocr.el = null; return }
  if (!ocr.el?.isConnected) {
    ocr.el = document.createElement('div');
    ocr.el.className = 'byob-ocr';
    ocr.el.setAttribute('role', 'status');
    root.appendChild(ocr.el);
  }
  const el = ocr.el;
  el.dataset.kind = shown.kind;
  if (shown.kind === 'free') {
    // One calm line, which opens the account sheet.
    el.innerHTML = `<a class="byob-ocr-line" href="${esc(ACCOUNT_URL())}">${esc(shown.text)}</a>`;
  } else if (shown.kind === 'offer') {
    el.innerHTML = `<p class="byob-ocr-line">${esc(shown.text)}</p><div class="byob-ocr-actions"><button type="button" data-ocr="later">Not now</button><button type="button" class="primary" data-ocr="start">Recognise text</button></div>`;
    el.querySelector('[data-ocr="later"]').onclick = () => { local.set({ asked: true }); ocrShow(status, token) };
    el.querySelector('[data-ocr="start"]').onclick = () => { local.set({ asked: true }); el.querySelector('.byob-ocr-actions')?.remove(); ocrRun(token) };
  } else if (shown.kind === 'failed') {
    el.innerHTML = `<p class="byob-ocr-line">${esc(shown.text)} <button type="button" class="byob-ocr-link" data-ocr="retry">Try them again</button></p>`;
    el.querySelector('[data-ocr="retry"]').onclick = () => { el.querySelector('[data-ocr="retry"]').disabled = true; ocrRun(token, { rerun: 'failed' }) };
  } else {
    el.innerHTML = `<p class="byob-ocr-line">${esc(shown.text)}</p>`;
    // Said once; the "Tinct text" control stays.
    if (shown.kind === 'ready') { local.set({ ready: true }); ocr.readyTimer = setTimeout(() => { if (token === ocr.token) { ocr.el?.remove(); ocr.el = null } }, 8000) }
  }
}

// Leaving or hiding the page: the place now, and what is waiting sent at once (keepalive).
function leavePlace() { if (!hasBook()) return; savePlaceNow(); placeSync.flush(); marksSync.push({ keepalive: true }); cardsSync.push({ keepalive: true }) }
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
  note(hex, now = false) { if (this.api) this.api.note(hex, now); else this.load().then(api => api?.note(hex, now)) },
  flush() { this.api?.flush() },
  // -> true once the account's place (read later on another device) is the one kept here.
  async reconcile(key) {
    if (!String(key).startsWith('pdf:')) return { adopted: false, late: Promise.resolve(false) };
    const late = this.load().then(api => api ? api.reconcile(hexOf(key)) : 'unavailable').then(r => r === 'adopted', () => false);
    const adopted = await Promise.race([late, new Promise(r => setTimeout(() => r(null), PLACE_SYNC_WAIT_MS))]);
    return { adopted: adopted === true, late: adopted === null ? late : Promise.resolve(false) };
  },
};
/* ---------- A PDF's highlights and notes on the reader's other devices ----------
   Signed in, a PDF's highlights and their notes are kept privately with the book in the account
   (/api/user-books/marks/{bookHex}, Worker routes/userBooks.ts), as its place is. This browser's
   copy comes first (localStorage 'hl:' + key, removals in 'hl-gone:' + key) and works offline;
   the account copy is versioned (`rev`): a write naming an older revision is refused with the
   stored set, the two are merged (TinctMargin.mergeMarks: a union by id, the newer edit wins,
   removals are kept as tombstones) and written again, so nothing is lost on a conflict. Signed
   out, or for a book not in the account, they stay in this browser as before. EPUBs never sync here. */
const MARKS_SYNC_MS = 1500;
// Rounds of three conflicting writes in a row before a set waits for its next change, open or return online.
const CONFLICT_ROUNDS = 4;
/* The same versioned set for the margin's cards (/api/user-books/cards/{bookHex}, 'cards:' + key here):
   one record per kept result, the same merge (TinctMargin.mergeCards). */
function setSync({ path, field, prefix, local, apply, failed }) {
  return {
    timer: null, running: null, key: '', told: '', rounds: 0,
    /* A write that did not reach the account for any reason but a conflict (which is merged and sent
       again) or a book not in the account (404: kept here, as signed out): the reader is told once per
       file that it is kept on this device (FIXES-2026-10-15 PR C). */
    fail(key, message = failed) {
      if (!message || this.told === key + message) return;
      this.told = key + message;
      toast(message);
    },
    hex: () => hexOf(state.key),
    usable() { return state.kind === 'pdf' && !!window.TinctAI?.session?.().token && /^[0-9a-f]{24}$/.test(this.hex()) },
    local, apply,
    async call(method, body, { keepalive = false } = {}) {
      const token = window.TinctAI?.session?.().token;
      if (!token) throw Object.assign(new Error('signed_out'), { status: 401 });
      const r = await fetch(`/api/user-books/${path}/` + this.hex(), { method, keepalive, credentials: 'same-origin', cache: 'no-store', headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
      const json = await r.json().catch(() => ({}));
      return { status: r.status, json };
    },
    // Opened: the account's set, merged with this browser's; the merge goes back when it differs.
    async open() {
      if (!this.usable()) return;
      const key = state.key; this.key = key;
      try {
        const { status, json } = await this.call('GET');
        if (state.key !== key || status !== 200) return;
        store.set(prefix + '-rev:' + key, json.rev || 0);
        const merged = TinctMargin.mergeMarks(this.local(), json[field] || []);
        this.apply(merged);
        if (store.get(prefix + '-dirty:' + key) || !TinctMargin.sameMarks(merged, json[field] || [])) this.push();
      } catch { /* offline: this browser's copy stands, sent when back online */ }
    },
    changed() {
      if (state.kind !== 'pdf') return;
      strip?.marksChanged();
      store.set(prefix + '-dirty:' + state.key, true);
      clearTimeout(this.timer); this.timer = setTimeout(() => this.push(), MARKS_SYNC_MS);
    },
    push({ keepalive = false } = {}) {
      clearTimeout(this.timer); this.timer = null;
      if (!this.usable() || !store.get(prefix + '-dirty:' + state.key)) return Promise.resolve();
      if (this.running) return this.running.then(() => this.push({ keepalive }));
      const key = state.key;
      this.running = (async () => {
        try {
          for (let tries = 0; tries < 3 && state.key === key; tries++) {
            const list = this.local(), rev = store.get(prefix + '-rev:' + key) || 0;
            const { status, json } = await this.call('PUT', { [field]: list, rev }, { keepalive });
            if (state.key !== key) return;
            if (status === 200) {
              this.rounds = 0;
              store.set(prefix + '-rev:' + key, json.rev);
              // A card too long for the account even when trimmed stays on this device only.
              if (json.dropped) this.fail(key, `${json.dropped === 1 ? 'A card was' : json.dropped + ' cards were'} too long to save to your account. ${json.dropped === 1 ? 'It is' : 'They are'} kept on this device.`);
              // Edited while it was on its way: send again.
              if (TinctMargin.sameMarks(list, this.local())) store.del(prefix + '-dirty:' + key); else this.changed();
              return;
            }
            if (status === 404) return;   // not in the account: kept here
            if (status !== 409) { this.fail(key); return }   // signed out, too large, refused, the server: kept here, and said
            store.set(prefix + '-rev:' + key, json.rev || 0);
            this.apply(TinctMargin.mergeMarks(this.local(), json[field] || []));
          }
          // Conflicts every time (two devices writing at once): the merged set stays here, dirty, and is sent
          // again a moment later, a few rounds at most (then on the next change, open or return online);
          // nothing is said, as a conflict is not a failure (the PM's battery, 15 Oct 2026).
          if (state.key === key && store.get(prefix + '-dirty:' + key) && ++this.rounds <= CONFLICT_ROUNDS) { clearTimeout(this.timer); this.timer = setTimeout(() => this.push(), MARKS_SYNC_MS * this.rounds) }
        } catch { if (navigator.onLine !== false && state.key === key) this.fail(key) /* offline: kept dirty, sent when back online */ }
        finally { this.running = null }
      })();
      return this.running;
    },
  };
}
const marksSync = setSync({
  path: 'marks', field: 'marks', prefix: 'hl',
  failed: 'Your highlights could not be saved to your account. They are kept on this device.',
  local: () => TinctMargin.mergeMarks(highlights(), store.get('hl-gone:' + state.key) || []),
  apply(merged) {
    const before = JSON.stringify(this.local());
    const { live, gone } = TinctMargin.splitMarks(merged);
    store.set('hl:' + state.key, live); store.set('hl-gone:' + state.key, gone);
    if (JSON.stringify(this.local()) !== before) { for (const p of state.pages) if (p.layer) renderHighlights(p); marginLayout(); strip?.marksChanged() }
  },
});
const cardsSync = setSync({
  path: 'cards', field: 'cards', prefix: 'cards',
  failed: 'Your margin cards could not be saved to your account. They are kept on this device.',
  local: () => keptCards(),
  apply(merged) {
    if (JSON.stringify(merged) === JSON.stringify(keptCards())) return;
    store.set('cards:' + state.key, merged); marginLayout({ fresh: true }); strip?.marksChanged();
  },
});
addEventListener('online', () => { if (hasBook()) { marksSync.push(); cardsSync.push() } });
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
  if (isEpub()) { applyEpubScale(); goTo(place); onScroll(); savePlaceNow(); if (marginOn()) marginLayout({ fresh: true }); return }
  zoomClass();
  applyCrop();
  const w = sheetWidth();
  for (const p of state.pages) { p.sheet.style.width = w + 'px'; p.sheet.style.aspectRatio = sheetRatio(p.w, p.h) }
  goTo(place); onScroll();
  clearTimeout(zoomTimer);
  zoomTimer = setTimeout(() => { for (const p of state.pages) if (p.canvas) { p.renderedWidth = 0; renderPage(p) } savePlaceNow() }, quick ? 220 : 0);
}
/* Phones: the text column fills the width (the PM's full battery, 15 Oct 2026; TinctReaderLayout.textColumn).
   At the phone's fit-to-width a PDF page is too small to read, so until the reader pinches or sets the size
   (then pos:<key>.phoneZoom, this device's), a PDF opens on a phone zoomed until its text column fills the
   width (one column of a two-column paper), panned to it. The desktop's zoom (pos.zoom) is apart and
   unchanged. While zoomed on a phone the pages have no side padding, so a pan stays inside the page. */
const COLUMN_GUTTER = 10;
function zoomClass() { root.classList.toggle('is-page-zoomed', state.kind === 'pdf' && isPhone() && state.zoom > 1) }
/** The text column of the pages from `from` on (three with running text at most), by the scan's own line and column tests. */
async function columnFit(from, token) {
  const RL = window.TinctReaderLayout, Scan = window.TinctPdfScan, Text = window.TinctPdfText;
  if (!state.pdf || !Scan?.textRows || !Text?.columnsOf) return null;
  const n = state.pdf.numPages, found = [];
  let x0 = 0;
  for (let k = Math.max(1, Math.min(from, n)), tries = 0; k <= n && found.length < 3 && tries < 6; k++, tries++) {
    try {
      const [{ items }, page] = await Promise.all([pageText(k), state.pdf.getPage(k)]);
      if (token !== state.token) return null;
      const [vx0, , vx1] = page.view, rows = Scan.textRows(items || []);
      const col = RL.textColumn(rows, Text.columnsOf(rows, vx0, vx1 - vx0));
      if (col) { found.push(col); x0 = vx0 }
    } catch { /* a page that cannot be read is skipped */ }
  }
  const column = RL.documentColumn(found);
  return column ? { column, x0 } : null;
}
/** The zoom a PDF opens at on a phone: the reader's own there, else the column fit (1 without one). */
async function phoneZoom(saved, token) {
  const own = Number(saved?.phoneZoom);
  if (own > 0) { state.fit = null; return own }
  const fit = await columnFit(saved?.page || 1, token).catch(() => null);
  state.fit = { column: fit?.column || null, x0: fit?.x0 || 0 };
  return fitZoom();
}
function fitZoom() { return window.TinctReaderLayout.columnZoom({ column: state.fit?.column, pageWidth: state.base.w, room: $('scroll').clientWidth, cropX: crop().x, gutter: COLUMN_GUTTER }) }
/** Pan to the column on the page in view (only while the zoom is the column fit). */
function panToColumn() {
  if (!state.fit?.column || !isPhone() || state.zoom <= 1) return;
  const p = state.pages[currentPlace().page - 1];
  if (!p) return;
  const s = $('scroll'), r = p.sheet.getBoundingClientRect(), sr = s.getBoundingClientRect();
  s.scrollLeft = window.TinctReaderLayout.columnScroll({ column: state.fit.column, pageWidth: p.w, x0: state.fit.x0, cropX: crop().x, sheetLeft: r.left - sr.left + s.scrollLeft, sheetWidth: r.width, room: s.clientWidth, gutter: COLUMN_GUTTER });
}
/** After a resize: the column fit worked out again for the new width; across the phone/desktop line, each its own zoom. */
async function refitZoom(crossed) {
  if (state.kind !== 'pdf') { setZoom(state.zoom); return }
  if (crossed) {
    const saved = store.get('pos:' + state.key), token = state.token;
    const z = isPhone() ? await phoneZoom(saved, token) : (state.fit = null, saved?.zoom || 1);
    if (token !== state.token) return;
    setZoom(z); panToColumn(); return;
  }
  if (state.fit && isPhone()) { setZoom(fitZoom()); panToColumn(); return }
  setZoom(state.zoom);
}

/* The phone's page pill (TinctReaderLayout.pillStages): the fullest label that leaves the title whole and
   is not cut itself, else the page alone without its chevron; never an empty pill. The desktop's is as before. */
const pill = { stages: null, key: '', at: 0 };
function fitPill(stages = pill.stages) {
  pill.stages = stages;
  const btn = $('pageBtn'), label = $('pageLabel'), title = $('bookTitle');
  if (!isPhone() || !stages?.length) { delete btn.dataset.chevron; pill.key = ''; return }
  const show = stage => { label.textContent = stage.label; btn.dataset.chevron = stage.chevron ? 'on' : 'off' };
  // The same labels, width and title as last time: the stage found then (onScroll has just written the full label).
  const key = JSON.stringify(stages) + '|' + innerWidth + '|' + title.textContent;
  if (key === pill.key) { show(stages[pill.at]); return }
  const whole = el => el.scrollWidth <= el.clientWidth + 1;
  let at = 0;
  for (; at < stages.length; at++) {
    show(stages[at]);
    if (at === stages.length - 1 || (whole(title) && whole(label))) break;
  }
  pill.key = key; pill.at = at;
}
// Ctrl/Cmd +/- and trackpad pinch zoom the pages, not the browser page, so the top bar stays put.
addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || !state.pages.length) return;
  if (e.key === '+' || e.key === '=') { e.preventDefault(); state.fit = null; setZoom(state.zoom + 0.1, { quick: true }) }
  else if (e.key === '-' || e.key === '_') { e.preventDefault(); state.fit = null; setZoom(state.zoom - 0.1, { quick: true }) }
  else if (e.key === '0') { e.preventDefault(); state.fit = null; setZoom(1) }
});
addEventListener('wheel', e => {
  if (!e.ctrlKey || !state.pages.length) return;
  e.preventDefault();
  state.fit = null;
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
  state.fit = null;
  setZoom(pinch.zoom * fingerGap(e.touches) / pinch.gap, { quick: true });
}, { passive: false });
$('scroll').addEventListener('touchend', e => { if (e.touches.length < 2) pinch = null });
$('scroll').addEventListener('touchcancel', () => { pinch = null });
// Safari's own pinch (gesture events) over the reader: the pages zoom instead (above).
for (const type of ['gesturestart', 'gesturechange']) addEventListener(type, e => { if (readerShown() && state.pages.length) e.preventDefault() }, { passive: false });
let resizeTimer;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { const wasPhone = isPhone(); applyLayout(); if (state.pages.length) refitZoom(wasPhone !== isPhone()); fitPill() }, 150) });
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
  // The reader's Book editions glyph (src/lab/LabSuperMenu.tsx).
  editions: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="4" height="16" rx="0.8"></rect><rect x="10" y="4" width="4" height="16" rx="0.8"></rect><path d="m14.6 5.2 3.9-.9 3 15.6-3.9.9z"></path></svg>',
  close: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="m7 7 10 10M17 7 7 17"></path></svg>',
  open: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4m-4 4 4-4 4 4M5 14v5h14v-5"></path></svg>',
  pause: '<svg width="20.7" height="20.7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="0.5"></rect><rect x="14" y="5" width="4" height="14" rx="0.5"></rect></svg>',
  play: '<svg width="20.7" height="20.7" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.6 6.4v11.2L17.8 12 8.6 6.4Z" fill="currentColor" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"></path></svg>',
  snip: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v14h14"></path><path d="M3 7h14v14"></path></svg>',
  export: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m-4-4 4 4 4-4M5 19h14"></path></svg>',
  attach: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m20.5 16-5-5-8 8"></path></svg>',
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" stroke="currentColor" stroke-width="1.5"></rect><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="1.5"></path></svg>',
};
// The reader's rows (src/lab/labSuperMenu.ts: Summarize, Catch me up, Settings, Library on the phone),
// with this viewer's own: Snip a figure, Export notes, Open another book. The whole-document chat is
// "Chat" here, the name its margin card has (the PM's full battery, 15 Oct 2026; the book reader keeps Librarian).
const MENU = [['chat', 'Chat'], ['summarize', 'Summarize'], ['catchup', 'Catch me up'], ['snip', 'Snip a figure'], ['export', 'Export notes', true], ['settings', 'Settings', false, true], ['open', 'Open another book', true], ['library', 'Library', true]];
// Settings holds read aloud's voice and speed (the look is the Aa panel's), so an EPUB, which has no read aloud here, has none.
const menuItems = () => MENU.filter(([id]) => (id !== 'snip' || state.kind === 'pdf') && (id !== 'settings' || !isEpub()) && (id !== 'library' || isPhone())).map(([id, label, rule, chevron]) => id === 'settings' ? [id, label, true, chevron] : [id, label, rule, chevron]);
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
  if (id === 'chat') return openChat();
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
  // Printed page labels where there are any: the reader types the number they see on the page ("423", "xii").
  const lettered = (state.labels || []).some(l => /\p{L}/u.test(String(l ?? '')));
  box.innerHTML = `<form class="byob-jump"><label for="jumpInput">Page</label><input id="jumpInput" inputmode="${lettered ? 'text' : 'numeric'}" autocapitalize="off" autocomplete="off" spellcheck="false" value="${esc(pageLabel(currentPlace().page))}"><span>of ${esc(lastLabel())}</span><button type="submit">Go</button></form>`;
  root.appendChild(box);
  const input = box.querySelector('input'); input.select();
  box.querySelector('form').onsubmit = e => { e.preventDefault(); const v = input.value; closeJump(); jumpToLabel(v) };
}
function closeJump() { document.querySelector('.byob-jumpbox')?.remove() }
$('pageBtn').onclick = () => openContents();

/* The Aa panel (Anders, 15 Oct 2026): every setting for how the book looks, in one sheet from the top
   bar's Aa. Layout first (a PDF: Margin view or Focus view, and Convert to Tinct book, its Tinct text, which leaves for the Tinct
   reader; an EPUB has one way to read here, so no Layout), then the reader's themes (src/lab/LabV2Sheet.tsx),
   the page or text size, full width, page-margin trim and full screen. Settings (the t menu) keeps
   read aloud's voice and speed. The theme is the reader's own setting (applyTheme). */
const toggleRow = (id, label, on, hidden) => `<button type="button" class="lab-v2-row is-toggle" role="switch" aria-checked="${on}" data-t="${id}"${hidden ? ' hidden' : ''}><span class="lab-v2-row-label">${label}</span><span class="lab-v2-switch" aria-hidden="true"><span class="lab-v2-switch-knob"></span></span></button>`;
const selectRow = (id, label, value, options) => `<div class="lab-v2-row is-select"><span class="lab-v2-row-label">${label}</span><span class="lab-v2-value"><span data-value="${id}">${esc((options.find(o => o[0] === value) || options[0])[1])}</span><span class="lab-v2-value-chevron" aria-hidden="true">›</span></span><select class="lab-v2-row-select" id="${id}" aria-label="${label}">${options.map(([v, l]) => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
const RL = window.TinctReaderLayout;
/** The layout this book reads in on this device: Margin view (the default) or Focus view; an EPUB, its one way. */
const viewLayout = () => RL.layoutOf(prefs, state.kind);
const layoutChoice = o => `<button type="button" class="lab-v2-edition-option" data-layout="${o.id}" aria-pressed="${o.on}"><span class="lab-v2-edition-name">${esc(o.label)}</span><span class="lab-v2-edition-check" aria-hidden="true">${o.on ? '✓' : ''}</span></button>`;
/** The panel's Layout choices, drawn (again) into an open panel: Tinct text appears once the PDF's text is known. */
function drawLayoutChoices() {
  const panel = document.querySelector('.byob-aa-panel'); if (!panel) return;
  const opts = RL.options(state.kind, { layout: viewLayout(), hasText: hasText() });
  const box = panel.querySelector('[data-aa="layout"]'), row = panel.querySelector('[data-t="text"]');
  if (box) { box.hidden = !opts.length; box.querySelector('.lab-v2-edition-choices').innerHTML = opts.map(layoutChoice).join('') }
  if (row) row.hidden = !(RL.TINCT_TEXT === 'row' && hasText());
}
/** Margin view or Focus view: the margin's surface changes, the page re-centres, the reading place stays. */
function setLayout(next) {
  RL.switchLayout(viewLayout(), next, {
    place: currentPlace,
    // The margin's surface changes at once (its column's room, kept or let go, re-sizes the pages: reserveColumn).
    apply: to => { const next = RL.withLayout(prefs, to); delete prefs.layout; if (next.layout) prefs.layout = next.layout; savePrefs(); if (marginOn()) { if (col.raf) { cancelAnimationFrame(col.raf); col.raf = 0 } try { layoutNow() } catch (e) { console.error(e) } } },
    goTo: place => { goTo(place); onScroll() },
    save: () => { savePlaceNow(); if (marginOn()) marginLayout({ fresh: true }) },
  });
}
function openDisplay() {
  if (document.querySelector('.byob-aa-panel')) return closeDisplay();
  closeAllPopups();
  const eink = pageTheme === 'eink';
  const layer = document.createElement('div');
  layer.className = 'lab-v2-sheet-layer byob-settings byob-aa-panel'; layer.dataset.testid = 'lab-v2-sheet-layer';
  layer.innerHTML = `<button type="button" class="lab-super-scrim" aria-label="Close"></button>
    <section class="lab-v2-sheet" data-testid="lab-v2-sheet" data-layer="reading" aria-label="Layout and themes">
      <div class="lab-v2-head"><button type="button" class="lab-v2-dismiss" aria-label="Close">×</button></div>
      <div class="lab-v2-sheet-body">
        <div class="byob-aa-layout" data-aa="layout" role="group" aria-labelledby="aaLayoutLabel"><p class="lab-v2-group-label" id="aaLayoutLabel">Layout</p><div class="lab-v2-edition-choices"></div></div>
        <div class="lab-v2-themes" data-testid="lab-v2-themes">${[['book', 'Book'], ['light', 'Light'], ['dark', 'Dark']].map(([t, l]) => `<button type="button" class="lab-v2-theme is-${t}${!eink && pageTheme === t ? ' is-active' : ''}" data-theme-choice="${t}" data-testid="lab-v2-theme-${t}" aria-pressed="${!eink && pageTheme === t}"><span class="lab-v2-theme-face">Aa</span><span class="lab-v2-theme-label">${l}</span></button>`).join('')}${eink ? '<button type="button" class="lab-v2-theme is-eink is-active" aria-pressed="true" data-testid="lab-v2-theme-eink"><span class="lab-v2-theme-face">Aa</span><span class="lab-v2-theme-label">E-ink</span></button>' : ''}</div>
        <div class="lab-v2-size"><span class="lab-v2-size-small" aria-hidden="true">A</span><input class="lab-v2-slider" type="range" aria-label="${isEpub() ? 'Text size' : 'Page size'}" data-testid="lab-v2-size" min="0.5" max="3" step="0.05" value="${state.zoom}"><span class="lab-v2-size-large" aria-hidden="true">A</span></div>
        <div class="lab-v2-rows">
          ${toggleRow('full', 'Full width', !!prefs.full)}
          ${toggleRow('trim', 'Trim page margins', !!state.trim, isEpub())}
          ${toggleRow('screen', 'Full screen', !!document.fullscreenElement)}
          <button type="button" class="lab-v2-row is-link" data-t="text" hidden><span class="lab-v2-row-label">Convert to Tinct book</span><span class="lab-v2-value-chevron" aria-hidden="true">›</span></button>
        </div>
      </div>
    </section>`;
  layer.querySelector('.lab-super-scrim').onclick = () => closeDisplay({ focus: true });
  layer.querySelector('.lab-v2-dismiss').onclick = () => closeDisplay({ focus: true });
  // Escape closes it from anywhere in it, the size slider too (the page's own Escape skips inputs).
  layer.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeDisplay({ focus: true }) } });
  layer.querySelector('[data-aa="layout"]').addEventListener('click', e => {
    const b = e.target.closest('[data-layout]'); if (!b) return;
    if (b.dataset.layout === 'text') { closeDisplay(); readAsText(); return }
    setLayout(b.dataset.layout);
    drawLayoutChoices();
  });
  layer.querySelectorAll('[data-theme-choice]').forEach(b => b.onclick = () => {
    setTheme(b.dataset.themeChoice);
    layer.querySelectorAll('[data-theme-choice]').forEach(o => { const on = o.dataset.themeChoice === pageTheme; o.classList.toggle('is-active', on); o.setAttribute('aria-pressed', String(on)) });
    layer.querySelector('[data-testid="lab-v2-theme-eink"]')?.remove();
  });
  let sizeTimer;
  layer.querySelector('[data-testid="lab-v2-size"]').oninput = e => { const z = Number(e.target.value); clearTimeout(sizeTimer); sizeTimer = setTimeout(() => { state.fit = null; setZoom(z, { quick: true }) }, 60) };
  layer.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
    const t = b.dataset.t;
    if (t === 'text') { closeDisplay(); readAsText(); return }
    if (t === 'screen') { toggleFullscreen().then(on => b.setAttribute('aria-checked', String(on))); return }
    if (t === 'trim') setTrim(!state.trim); if (t === 'full') setFull(!prefs.full);
    b.setAttribute('aria-checked', String(t === 'trim' ? state.trim : !!prefs[t]));
  });
  root.appendChild(layer);
  drawLayoutChoices();
  $('aaBtn').setAttribute('aria-expanded', 'true');
  layer.querySelector('.lab-v2-dismiss').focus({ preventScroll: true });
}
function closeDisplay({ focus = false } = {}) {
  const panel = document.querySelector('.byob-aa-panel');
  // Closed from inside it (Escape, ×, the scrim): focus goes back to the Aa button.
  const inside = !!panel && panel.contains(document.activeElement);
  panel?.remove();
  $('aaBtn').setAttribute('aria-expanded', 'false');
  if (panel && (focus || inside)) $('aaBtn').focus({ preventScroll: true });
}
$('aaBtn').onclick = openDisplay;
/* Settings: the reader's Settings sheet (src/lab/LabV2Sheet.tsx), with the rows that apply here: read
   aloud's voice and speed (the look is the Aa panel's, above). */
function openSettings() {
  closeAllPopups();
  const voices = bookVoices();
  const rates = [...new Set([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, prefs.rate])].sort((a, b) => a - b);
  const layer = document.createElement('div');
  layer.className = 'lab-v2-sheet-layer byob-settings'; layer.dataset.testid = 'lab-v2-sheet-layer';
  layer.innerHTML = `<button type="button" class="lab-super-scrim" aria-label="Close"></button>
    <section class="lab-v2-sheet" data-testid="lab-v2-sheet" data-layer="reading" aria-label="Settings">
      <div class="lab-v2-head is-titled"><h2 class="lab-v2-title">Settings</h2><button type="button" class="lab-v2-dismiss" aria-label="Close">×</button></div>
      <div class="lab-v2-sheet-body">
        <div class="lab-v2-rows">
          ${isEpub() ? '' : selectRow('voiceSel', 'Voice', prefs.voice, [['', 'Device voice'], ...voices.map(v => [v.name, v.name])])}
          ${isEpub() ? '' : selectRow('rateSel', 'Speed', String(prefs.rate), rates.map(r => [String(r), r + '×']))}
        </div>
        <p class="lab-v2-note">${isEpub() ? '' : 'Read aloud uses this device’s own voice; nothing is recorded. '}${esc(imgNote)}</p>
      </div>
    </section>`;
  const close = () => layer.remove();
  layer.querySelector('.lab-super-scrim').onclick = close;
  layer.querySelector('.lab-v2-dismiss').onclick = close;
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
const toc = { entries: [], ready: false, expanded: new Set(), nav: 'pages', task: null, soon: null, early: null };
let chapterTitles = null;
/** The shared house-style rule for chapter titles; titles stay as written if it cannot load. */
function chapterTitleStyle() {
  chapterTitles ??= import('/lab/chapter-title.js?v=20261009rel10').then(m => (label, language) => m.normalizeChapterTitle(label, { language: language || 'en' })).catch(() => label => label);
  return chapterTitles;
}
async function buildContents() {
  const token = state.token, key = state.key, pdf = state.pdf;
  toc.ready = false; toc.entries = []; toc.early = null;
  // Resolved when the contents are known (a long file's margin requests send them: docRange).
  let built; toc.task = new Promise(r => { built = r });
  // Resolved as soon as the chapters are known (contentsSoon): from a stored scan at once, from a new
  // scan's outline or printed contents before its other pages are read, else when the scan ends.
  let soon; toc.soon = new Promise(r => { soon = r });
  toc.hear = early => { if (token === state.token && !toc.early) { toc.early = early; soon(early) } };
  try { await buildContentsNow(token, key, pdf) } finally { built(); if (token === state.token) toc.hear(contentsNow()) }
}
// The chapters as the scan gives them (sorted by page, house-styled, no stray marks), and whether the file is known to have text.
const contentsNow = () => ({ entries: toc.entries, nav: toc.nav, text: state.scan ? !hasNoText() : null });
const contentsSorted = list => (TinctPdfScan.usableEntries ? TinctPdfScan.usableEntries(list) : list).slice().sort((a, b) => a.page - b.page);
/**
 * The chapters for the margin's document and Before you start's units, as soon as they are known: the same
 * entries the contents show once the scan ends (a new scan hears them early, scan's onEntries), so a long
 * book's units and its document's contents never wait for the whole scan (MacKay: 13 s; round 1, 15 Oct).
 * -> { entries, nav, text } (text: true when the file has text, null while not known).
 */
function contentsSoon() {
  return toc.soon || Promise.resolve(contentsNow());
}
async function buildContentsNow(token, key, pdf) {
  let scan = state.scan;
  const fresh = !scan;
  if (!scan) {
    let heard;
    state.titleReady = new Promise(r => { heard = r });
    // A new scan: run at the first open (and again when SCAN_VERSION moves on), then kept on
    // the book's record with the title, author and page count the library shows.
    // Chapters heard before the scan ends are styled as the finished scan's will be (same entries, same language).
    const housed = chapterTitleStyle();
    scan = await TinctPdfScan.scan(pdf, {
      fileName: state.name,
      items: async n => (await pageText(n)).items,
      live: () => token === state.token,
      onTitle: t => { if (token === state.token) setBookTitle(t.title, t.author); heard() },
      onEntries: e => { housed.then(house => toc.hear?.({ entries: contentsSorted(e.entries.map(x => ({ ...x, label: house(x.label, e.language) }))), nav: e.nav, text: e.text })) },
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
  // Classified now (a PDF opened for the first time, or scanned again): Tinct text when it reads
  // best so, unless the reader has moved here meanwhile.
  if (fresh && sameSpot(currentPlace(), state.lastPlace)) {
    await openKind(scan, token);
    if (token !== state.token) return;
    if (sameSpot(currentPlace(), state.lastPlace) && forwardToText(scan)) return;
  }
  showEditions();
  if (isScan()) ocrOpen();
  toc.entries = contentsSorted(scan.entries);
  toc.nav = toc.entries.length ? scan.nav : 'pages';
  toc.ready = true;
  onScroll();
  // The primer's trigger waits for the scan (primerHasText).
  marginLayout();
}
// The document's language (the scan's), for read-aloud's voice and the pages' text; English when unknown.
const bookLang = () => (isEpub() ? state.epub?.language : state.scan?.language) || 'en';
// A scan without a text layer (no scanned page has text): read aloud, Summarize and Catch me up
// have nothing to read, so they are switched off rather than run over empty pages.
const isScan = () => !isEpub() && state.scan?.textPages === 0;
// ...unless its text has been recognised: then its pages carry that text (ocrAdopt).
const hasNoText = () => isScan() && !state.ocrPages;
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
  // Printed page labels where there are any: the reader types the number they see on the page ("423", "xii").
  const lettered = (state.labels || []).some(l => /\p{L}/u.test(String(l ?? '')));
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
        <form class="byob-jump byob-toc-jump"${isEpub() ? ' hidden' : ''}><label for="jumpInput">Go to page</label><input id="jumpInput" inputmode="${lettered ? 'text' : 'numeric'}" autocapitalize="off" autocomplete="off" spellcheck="false" value="${esc(pageLabel(page))}"><span>of ${esc(lastLabel())}</span><button type="submit">Go</button></form>
        ${toc.ready ? (tops.length ? `<nav class="tree" aria-label="Chapters"><ul>${tops.map(node).join('')}</ul></nav>` : isEpub() ? '<p class="status">This book has no table of contents.</p>' : pageList(page)) : '<p class="status" role="status">Reading the book’s contents…</p>'}
      </div></div>`;
  const close = () => layer.remove();
  layer.querySelector('.lc-scrim').onclick = close;
  layer.querySelector('[data-close]').onclick = close;
  layer.querySelector('.title').onclick = close;
  // The page the reader types as printed ("423", "viii"); the file's page where no page prints it (pageOfLabel).
  layer.querySelector('form').onsubmit = ev => { ev.preventDefault(); const v = layer.querySelector('#jumpInput').value; close(); jumpToLabel(v) };
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
const SWITCHER_ENGINE = '/lab/library-add.js?v=20261014talkwake';
let switcherEngine = null;
function switcherApi() {
  switcherEngine ??= import(SWITCHER_ENGINE).then(() => { const api = window.__tinctLibraryAdd; if (!api?.switcherRows) throw new Error('switcher unavailable'); return api });
  switcherEngine.catch(() => { switcherEngine = null });
  return switcherEngine;
}
function closeSwitcher() { const el = document.querySelector('.byob-switcher'); if (!el) return; el.remove(); $('bookBtn').focus({ preventScroll: true }) }
// The switcher's covers and titles follow the library's rules (/lab/book-cover.js, /lab/book-title.js):
// a book's image (a painting's small file at 32 px), else its paper cover; the short title in the one-line row.
const SWITCHER_LOOKS = '?v=20261009owncover';
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
  // A PDF's text goes as its pages with their printed labels (`opts.pdf`, from pdfPages).
  const bookOf = opts => ({ ...aiBook(), ...(opts.pdf ? { pdf: opts.pdf } : {}) });
  const f = (input, opts = {}) => TinctAI.ask(input, { ...opts, book: bookOf(opts) });
  f.json = (input, opts = {}) => TinctAI.askJson(input, { ...opts, book: bookOf(opts) });
  f.limits = async () => ({ maxPromptBytes: 200000, images: TinctAI.imageLimits });
  sample = f;
  return f;
}
const AI_OFF = 'The reading companion could not be reached. Check your connection and try again.';
function errorCopy(e) {
  switch (e?.code) {
    case 'session_expired': return 'Your Tinct sign-in has expired. Sign in again on tinct.app, then try again.';
    case 'rate_limited': return 'Give it a few seconds.';
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
  if (!PAGE_IMAGES || sampleImages === false || !p || isEpub()) return null;
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
  return { text, page: Number(sheetEl.dataset.page), box, rects, range: range.cloneRange() };
}
let selTimer;
document.addEventListener('selectionchange', () => {
  // A text selection always gets the bar, never the figure chip (a caption's words too): the chip goes at once.
  try { if (hot.el && !getSelection().isCollapsed) hideHot() } catch { /* before the chip's code has run */ }
  clearTimeout(selTimer);
  selTimer = setTimeout(() => {
    // A selection opens the margin's bar or Define card (below), in a PDF or an EPUB.
    if (marginOn()) return marginSelection();
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
    openChat({ passage: s, prompt: EXPLAIN_ASK, display: 'Explain this passage.' });
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
function hideSelection() { document.querySelectorAll('.selection-popup').forEach(p => { p._ctl?.abort(); p.remove() }); clearRegion(); marginClose() }
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
    <div class="lab-contextual-explain-scroll"><div role="status" aria-live="polite" aria-busy="true"><p class="lab-ask-pending"></p></div></div>
    <footer>
      <button class="lab-contextual-explain-tool" type="button" data-t="chat" aria-label="Chat about this explanation" disabled>${ICON.chat}</button>
    </footer></section>`;
  placePopup(pop, info.box, Math.min(isPhone() ? innerWidth - 16 : 380, innerWidth - 16));
  makeWindow(pop, pop.querySelector('.lab-reader-window-head'), 'explain');
  pop.querySelector('.lab-window-control').onclick = () => { hideSelection(); getSelection().removeAllRanges() };
  const out = pop.querySelector('[role="status"]');
  // The reader's ring while the answer has not begun (the status block is the live region); "Thinking…" for screen readers only.
  out.firstElementChild.append(TinctWait.waitRing('Thinking…', { size: 18, live: false }));
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

// The offline dictionary (about 3 MB, once per device) is fetched into the offline cache a while
// after a PDF opens, so Define has every word with the network off; not on a data-saving connection.
function warmDictionary() {
  if (store.get('dict-warm') || navigator.connection?.saveData) return;
  setTimeout(() => (window.requestIdleCallback || setTimeout)(() => TinctDictionary.warm().then(ok => { if (ok) store.set('dict-warm', Date.now()) })), 8000);
}
/* ---------- The margin: selection bar, More, Define and notes (PDF only) ----------
   docs/margin/BRIEF.md, PR 1a. A PDF's selection opens the bar (Ask, Explain, More, the highlight
   dot, note), a one-word selection the Define card; an EPUB keeps the popup above. Markup and
   placement are TinctMargin's (js/margin.js), styled by css/margin.css (the mockup's values).
   Until PR 1b, Explain opens today's Explain and Ask today's chat, both in the docked chat. */
const MH = TinctMargin.html;
const EXPLAIN_ASK = 'Explain the passage I selected: what it says, what it means here, and any notation or terms, in plain language. Two to four short paragraphs.';
let mr = null;
const noteDrafts = new Map();
// The reader's area: below the top bar, left of the docked chat.
function mrFrame() {
  const r = $('scroll').getBoundingClientRect(), hdr = $('hdr').getBoundingClientRect();
  const f = { left: Math.max(0, r.left), top: Math.max(0, r.top, hdr.bottom), right: Math.min(innerWidth, r.right, r.left + pagesWidth()), bottom: Math.min(innerHeight, r.bottom) };
  if (!isPhone() && chat.el?.isConnected && !chat.el.hidden) { const d = chat.el.getBoundingClientRect(); if (d.left > f.left + 240 && d.left < f.right) f.right = d.left }
  return f;
}
// The passage, kept in page fractions so the bar follows it while the pages scroll.
function anchorOf(rects) {
  return rects.map(r => {
    const p = pageForPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2); if (!p) return null;
    const b = p.pg.getBoundingClientRect();
    return { n: p.n, x: (r.left - b.left) / b.width, y: (r.top - b.top) / b.height, w: (r.right - r.left) / b.width, h: (r.bottom - r.top) / b.height };
  }).filter(Boolean);
}
function anchorRects(anchor) {
  return (anchor || []).map(a => {
    const p = state.pages[a.n - 1]; if (!p) return null;
    const b = p.pg.getBoundingClientRect();
    return { left: b.left + a.x * b.width, top: b.top + a.y * b.height, right: b.left + (a.x + a.w) * b.width, bottom: b.top + (a.y + a.h) * b.height };
  }).filter(Boolean);
}
function firstLast(rects) {
  const sorted = [...rects].sort((a, b) => a.top - b.top || a.left - b.left);
  return { first: sorted[0], last: sorted.reduce((a, r) => (r.bottom > a.bottom ? r : a), sorted[0]) };
}
const boxOf = rects => rects.reduce((a, r) => ({ left: Math.min(a.left, r.left), top: Math.min(a.top, r.top), right: Math.max(a.right, r.right), bottom: Math.max(a.bottom, r.bottom) }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
// The words before the selection on its page: a capitalised word mid-sentence is a name.
function textBefore(range) {
  try {
    const layer = range.startContainer.parentElement?.closest('.text-layer, .epub-pg'); if (!layer) return '';
    const r = document.createRange(); r.setStart(layer, 0); r.setEnd(range.startContainer, range.startOffset);
    return r.toString().slice(-80);
  } catch { return '' }
}
const mrNote = () => (mr?.ids?.length ? highlights().find(h => h.id === mr.ids[0])?.note || '' : '');
function mrColor() {
  const own = mr?.ids?.length ? highlights().find(h => h.id === mr.ids[0])?.color : null;
  return own || TinctMargin.defaultColor(prefs, HL_COLORS);
}
const mrOpts = extra => Object.assign({ colors: HL_COLORS, current: mrColor(), phone: isPhone(), noted: !!mrNote() }, extra);

/** A kept range still on the page's text (a removed text layer moves a live range's ends to the page, or collapses it). */
function rangeInText(range) {
  const at = node => (node?.nodeType === 1 ? node : node?.parentElement)?.closest?.('.text-layer, .epub-pg');
  return !!range && !range.collapsed && !!at(range.startContainer) && !!at(range.endContainer) && range.startContainer.isConnected;
}
function marginSelection() {
  const info = selectionInfo();
  // A page drawn again (its text layer replaced: a late render, a zoom, the column reserving its room)
  // drops the selection without the reader letting go: the bar stays on its kept passage. Seen as the
  // CI layout check's intermittent "1 problem" desktop rows (the bar detached under a click).
  if (!info && mr && !mr.held && mr.mode === 'menu' && mr.info?.range && !rangeInText(mr.info.range)) { mr.held = true; paintSelection(); return }
  if (!info) { if (mr && !mr.held && mr.mode === 'menu') marginClose(); return }
  if (mr && !mr.held && mr.info.text === info.text && mr.info.page === info.page) return;
  marginOpen(info);
}
function marginOpen(info, { existing = null, asking = false } = {}) {
  hideSelection();
  const word = !existing && TinctMargin.oneWord(info.text);
  const anchor = existing ? existing.rects.map(([x, y, w, h]) => ({ n: existing.page, x, y, w, h })) : anchorOf(info.rects || [info.box]);
  mr = { info, anchor, ids: existing ? [existing.id] : [], held: !!existing, mode: null, el: null, moreEl: null, before: word && info.range ? textBefore(info.range) : '' };
  sel = info;
  if (word && !asking) { mrDefine(word); return }
  mrShow('menu');
}
function marginClose() {
  if (!mr) return;
  const m = mr;
  clearTimeout(m.press); dictation.stop();
  const field = m.el?.querySelector('.mr-note__field');
  if (field && m.ids[0] && field.value.trim() !== (highlights().find(h => h.id === m.ids[0])?.note || '')) noteDrafts.set(m.ids[0], field.value);
  m.el?.remove(); m.moreEl?.remove();
  mr = null;
  paintSelection();
}
function mrPiece() {
  const el = document.createElement('div');
  el.addEventListener('mousedown', e => { if (!e.target.closest('textarea')) e.preventDefault() });
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-m], [data-color]'); if (!b || b.disabled || !mr) return;
    if (b.dataset.color) mrPick(b.dataset.color); else mrAction(b.dataset.m);
    // Opened from the keyboard (Return or Space on the dots): the first row has the focus.
    if (b.dataset.m === 'more' && e.detail === 0 && mr?.moreEl) mr.moreEl.querySelector('[data-m]')?.focus({ preventScroll: true });
  });
  // Press and hold the dot: the colours.
  el.addEventListener('pointerdown', e => {
    if (!mr || !e.target.closest('[data-m="dot"]')) return;
    clearTimeout(mr.press); mr.pressed = false;
    mr.press = setTimeout(() => { if (mr) { mr.pressed = true; mrShow('colors') } }, 450);
  });
  for (const t of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(t, () => clearTimeout(mr?.press));
  el.addEventListener('input', e => {
    if (e.target.matches('.mr-ask')) fitAsk();
    if (e.target.matches('.mr-note__field')) el.querySelector('[data-m="save"]').disabled = !e.target.value.trim() && !mrNote();
  });
  el.addEventListener('keydown', e => {
    if (e.target.matches('.mr-ask') && e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); mrSend() }
  });
  root.appendChild(el);
  return el;
}
/** Draws the bar ('menu' | 'colors' | 'asking'), the Define card ('define') or the note editor ('note'). */
function mrShow(mode, { question = '' } = {}) {
  if (!mr) return;
  closeMore();
  mr.mode = mode;
  const phone = isPhone(), el = mr.el || (mr.el = mrPiece());
  el.removeAttribute('style');
  if (mode === 'define') {
    el.className = `mr mr-float mr-define${phone ? ' is-phone' : ''}`; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Define ' + mr.word);
    el.innerHTML = MH.defineHtml(mr.def, { ...mrOpts(), P: MP.P, resolve: citeResolve });
    el.querySelector('.mr-define__wait')?.append(TinctWait.waitRing('Thinking…', { size: 18 }));
  } else if (mode === 'note') {
    el.className = `mr mr-float mr-note${phone ? ' is-phone' : ''}`; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Note');
    const draft = noteDrafts.get(mr.ids[0]) ?? mrNote();
    el.innerHTML = MH.noteHtml({ quote: mr.info.text, note: draft });
    el.querySelector('[data-m="save"]').disabled = !draft.trim() && !mrNote();
  } else {
    el.className = `mr mr-float ${phone ? 'mr-pbar is-phone' : 'mr-bar'}${mode === 'asking' ? ' is-asking' : ''}`; el.setAttribute('role', 'toolbar'); el.setAttribute('aria-label', 'Selection');
    el.innerHTML = MH.barHtml(mode, mrOpts({ question }));
  }
  mrPlace();
  if (mode === 'asking') { const t = el.querySelector('.mr-ask'); t.focus({ preventScroll: true }); t.setSelectionRange(t.value.length, t.value.length); fitAsk() }
  if (mode === 'note') { const t = el.querySelector('.mr-note__field'); t.focus({ preventScroll: true }); t.setSelectionRange(t.value.length, t.value.length) }
  paintSelection();
}
function mrPlace() {
  if (!mr?.el) return;
  const rects = anchorRects(mr.anchor); if (!rects.length) return;
  const { first, last } = firstLast(rects), frame = mrFrame(), el = mr.el, phone = isPhone();
  let pos;
  if (mr.mode === 'define' || mr.mode === 'note') {
    if (phone) el.style.width = (frame.right - frame.left - TinctMargin.PHONE.edge * 2) + 'px';
    pos = TinctMargin.placeCard({ first, last, frame, w: 360, h: el.offsetHeight, phone });
  } else {
    if (phone) el.style.width = (frame.right - frame.left - TinctMargin.PHONE.edge * 2) + 'px';
    pos = TinctMargin.placeBar({ first, last, frame, w: el.offsetWidth, h: el.offsetHeight, phone });
  }
  el.style.left = pos.left + 'px'; el.style.top = pos.top + 'px';
  el.classList.toggle('is-below', !!pos.below);
  if (pos.tip != null) el.style.setProperty('--tip', pos.tip + 'px');
  mr.below = !!pos.below;
  mr.info.box = boxOf(rects);
  if (mr.moreEl) placeMoreEl();
}
let mrFrameReq = 0;
$('scroll').addEventListener('scroll', () => { if (!mr || mrFrameReq) return; mrFrameReq = requestAnimationFrame(() => { mrFrameReq = 0; mrPlace() }) }, { passive: true });
addEventListener('resize', () => { if (mr && mr.mode !== 'asking' && mr.mode !== 'note') marginClose() });
function mrAction(m) {
  if (m === 'ask') return mrShow('asking');
  // Explain, Simplify, Fact-check, Counterpoint and Quiz me answer as cards (the margin, PR 2).
  if (m === 'explain' || m === 'simplify' || m === 'factcheck' || m === 'related' || m === 'counterpoint' || m === 'quiz') { closeMore(); return cardAction(m) }
  if (m === 'more') return mr.moreEl ? closeMore() : openMore();
  if (m === 'dot') {
    if (mr.pressed) { mr.pressed = false; return }
    if (mr.ids.length) return mrShow('colors');
    mrHighlight();
    return mrShow(mr.mode === 'define' ? 'define' : 'menu');
  }
  if (m === 'note') return mrNoteOpen();
  if (m === 'mic') { const t = mr.el.querySelector('.mr-ask'); if (t) { dictation.target = null; dictation.toggle(t) } return }
  if (m === 'send') return mrSend();
  if (m === 'save') return mrSaveNote();
  if (m === 'remove') { for (const id of mr.ids) { removeHighlight(id); noteDrafts.delete(id) } marginClose(); return }
  if (m === 'define') { closeMore(); const t = mr.info.text; return mrDefine(TinctMargin.oneWord(t) || t) }
  if (m === 'copy') return mrCopy();
}
// One tap: the passage highlighted in the default colour (or `color`), kept on the page.
function mrHighlight(color) {
  if (mr.ids.length) return mr.ids;
  // The page's text layer may have been drawn again since (zoom, the chat opening): then the passage's kept shapes.
  const live = rangeInText(mr.info.range);
  // An EPUB's highlights are character offsets: only a live passage can be kept.
  const ids = (live ? addHighlight(mr.info, { range: mr.info.range, color }) : isEpub() ? [] : highlightAnchor(mr.info, mr.anchor, color)) || [];
  mr.ids = ids; mr.held = true;
  getSelection().removeAllRanges();
  return ids;
}
function highlightAnchor(info, anchor, color) {
  const byPage = new Map(), r = v => Math.round(v * 10000) / 10000;
  for (const a of anchor || []) { if (!byPage.has(a.n)) byPage.set(a.n, []); byPage.get(a.n).push([r(a.x), r(a.y), r(a.w), r(a.h)]) }
  const list = highlights(), ids = [];
  for (const [page, rects] of byPage) { const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at = Date.now(); ids.push(id); list.push({ id, page, rects, text: info.text.slice(0, 2000), color: color || prefs.hlColor || 'gold', at, u: at }) }
  putHighlights(list);
  for (const page of byPage.keys()) renderHighlights(state.pages[page - 1]);
  return ids;
}
function mrPick(color) {
  Object.assign(prefs, TinctMargin.chooseColor(prefs, color)); savePrefs();
  if (!mr.ids.length) mrHighlight(color); else for (const id of mr.ids) recolorHighlight(id, color);
  mrShow('colors');
}
function mrNoteOpen() {
  // A highlight the note itself makes goes with the note when its card is deleted (TinctMargin.deletePlan).
  const had = mr.ids.length;
  mrHighlight();
  if (!mr.ids.length) return;
  if (!had) mr.noteMade = true;
  mrShow('note');
}
function mrSaveNote() {
  const t = mr.el.querySelector('.mr-note__field'), id = mr.ids[0];
  const list = highlights(), h = list.find(x => x.id === id); if (!h) return marginClose();
  const v = t.value.trim();
  if (v) { if (!h.note && mr.noteMade) h.withNote = true; h.note = v.slice(0, 4000) } else { delete h.note; delete h.withNote }
  h.u = Date.now();
  putHighlights(list); noteDrafts.delete(id);
  marginClose();
  // The note's card opens where the reader can see it (never gathered into "N more"), with the focus.
  if (v && marginMode()) openCard('n-' + id, { focus: 'card' });
}
function mrSend() {
  const t = mr?.el?.querySelector('.mr-ask'); if (!t) return;
  const q = t.value.trim(); if (!q) return;
  // A question from the bar is an Ask card on the passage (its thread continues in the card).
  cardAction('ask', { question: q });
}
async function mrCopy() {
  const text = TinctMargin.copyQuote({ text: mr.info.text, title: state.title, page: pageLabel(mr.info.page), place: isEpub() ? chapterPlace(mr.info.page) : null });
  marginClose();
  try { await navigator.clipboard.writeText(text); toast('Copied.') } catch { toast('Copy did not work here. Use your device’s copy instead.') }
}
function openMore() {
  const phone = isPhone(), m = document.createElement('div');
  m.className = `mr mr-float ${phone ? 'mr-pmore is-phone' : 'mr-more'}`; m.setAttribute('role', 'menu'); m.setAttribute('aria-label', 'More');
  m.innerHTML = MH.moreHtml({ phone });
  m.addEventListener('mousedown', e => e.preventDefault());
  m.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b && mr) mrAction(b.dataset.m) });
  root.appendChild(m); mr.moreEl = m;
  mr.el.querySelector('[data-m="more"]')?.setAttribute('aria-expanded', 'true');
  placeMoreEl();
}
function placeMoreEl() {
  const m = mr.moreEl, dotsEl = mr.el.querySelector('[data-m="more"]'); if (!m || !dotsEl) return;
  const b = mr.el.getBoundingClientRect();
  const pos = TinctMargin.placeMore({ bar: { left: b.left, top: b.top, right: b.right, bottom: b.bottom, below: mr.below }, dots: dotsEl.getBoundingClientRect(), frame: mrFrame(), w: m.offsetWidth, h: m.offsetHeight, phone: isPhone() });
  m.style.left = pos.left + 'px'; m.style.top = pos.top + 'px';
}
function closeMore() {
  if (!mr?.moreEl) return;
  mr.moreEl.remove(); mr.moreEl = null;
  mr.el?.querySelector('[data-m="more"]')?.setAttribute('aria-expanded', 'false');
}
function fitAsk() {
  const el = mr?.el, t = el?.querySelector('.mr-ask'); if (!t) return;
  el.querySelector('[data-m="send"]').disabled = !t.value.trim();
  const frame = mrFrame();
  TinctMargin.sizeAsk(el, { phone: isPhone(), room: frame.right - frame.left - 32 });
  mrPlace();
}
/* Define: the offline dictionary first (js/dictionary.js); a name, or a word it lacks, from the
   companion's contextual `define` when online; offline, "Not in the offline dictionary." */
async function mrDefine(word) {
  mr.word = word; mr.held = true; mr.def = { word, source: '', wait: true };
  const token = mr.defToken = {};
  // The file this Define belongs to: an answer that arrives after the reader opened another file is never kept in it.
  const key = state.key;
  mrShow('define');
  let hit = null;
  try { hit = await TinctDictionary.lookup(word) } catch {}
  if (mr?.defToken !== token) return;
  // Offline, a capitalised word the dictionary has shows its entry (a name mid-sentence asks the companion only when it can).
  const asks = TinctMargin.defineAsks(hit, { word, before: mr.before, online: navigator.onLine !== false });
  if (asks.dictionary) {
    mr.def = { word: hit.word, source: 'Dictionary', senses: hit.definitions.slice(0, 3).map(text => ({ text })) };
    mrShow('define');
    // Online, two asks at once (15 Oct, evening): the meaning in this text from the companion's
    // `define`, shown first under "In this text" whenever it arrives, even when a dictionary sense
    // "fits" ("perplexity" read "confusion"); and define_sense, which moves the fitting sense to the
    // top of the dictionary's senses below it (at most FIT_SENSE_MS). Offline, the dictionary alone.
    const info = mr.info, anchor = mr.anchor, def = mr.def;
    const redraw = () => { if (mr?.defToken === token && mr.mode === 'define') mrShow('define') };
    // "In this text" keeps its place first while it is written (a quiet wait under the label), and its words
    // show as they stream (re-check 2, 16 Oct: Define arrived all at once at 2.9-4.8 s); the senses never wait for it.
    if (asks.inText) { def.inWait = true; redraw() }
    const inText = !asks.inText ? null : defineByCompanion(word, info, line => { def.inText = line; def.inWait = false; redraw() }).then(found => {
      def.inWait = false;
      if (found?.line) { def.inText = found.line; if (found.pos) def.pos = found.pos }
      redraw();
    }).catch(() => { def.inWait = false; if (!def.inText) redraw() /* the dictionary alone */ });
    const sense = !asks.sense ? null : fittingSense(hit.word, def.senses.map(x => x.text), info).then(n => {
      if (!(n > 0)) return;
      def.senses = [{ ...def.senses[n - 1], fit: true }, ...def.senses.filter((_, k) => k !== n - 1)];
      redraw();
    });
    await Promise.all([inText, sense]);
    keepDefine(def, info, anchor, key);
    return;
  }
  if (navigator.onLine === false) { mr.def = { word, line: 'Not in the offline dictionary.' }; return mrShow('define') }
  try {
    const info = mr.info, anchor = mr.anchor;
    const found = await defineByCompanion(word, info, line => { if (mr?.defToken === token) { mr.def = { word, inText: line }; mrShow('define') } });
    const def = found ? { word: found.word || word, pos: found.pos || '', inText: found.line } : null;
    // Kept in the file it was asked in, even when the reader has moved on.
    if (def) keepDefine(def, info, anchor, key);
    if (mr?.defToken !== token) return;
    mr.def = def || { word, line: errorCopy(null) };
  } catch (e) {
    if (mr?.defToken !== token) return;
    mr.def = { word, line: e?.code === 'offline' ? 'Not in the offline dictionary.' : errorCopy(e) };
  }
  mrShow('define');
}
// The companion's existing contextual `define` intent (CONTEXTUAL_LOOKUP_PROMPT, built by the Worker).
// The meaning so far, from a Define reply still streaming: its JSON's text field as far as it has come (a plain
// reply as it stands), with a leading grammar label or part of speech dropped as parseLookup drops them.
function partialDefinition(text, word) {
  const t = String(text || '');
  const m = /"(?:definition|description|body)"\s*:\s*"((?:[^"\\]|\\.)*)/.exec(t);
  let so = null;
  if (m) { try { so = JSON.parse('"' + m[1].replace(/\\u[0-9a-f]{0,3}$|\\$/i, '') + '"') } catch { so = null } }
  else if (t.trim() && !/^\s*(?:\{|\[|`)/.test(t)) so = t;
  if (!so || so.trim().length < 12) return null;
  return TinctMargin.parseLookup(JSON.stringify({ kind: 'definition', definition: so }), word)?.line || null;
}
// `onPartial(line)`: the meaning as it streams.
async function defineByCompanion(word, info, onPartial = null) {
  // A PDF's page goes as its page (kind 'pdf', printed label), as every PDF request does.
  const pdf = await pdfPages(info.page, { before: 0, after: 0 }), wholeDoc = await marginDocument(info.page);
  // Define on a phrase sends the passage picture too (FIXES-2026-10-15 A4); a single word does not.
  const region = /\s/.test(word.trim()) ? selectionRegion(info) : null;
  const image = region ? await pageImage(info.page, region) : null;
  const onText = onPartial ? ({ text }) => { const line = partialDefinition(text, word); if (line) onPartial(line) } : undefined;
  const call = imgs => TinctAI.companion('define', { book: { ...aiBook(), pdf }, pdf, document: wholeDoc, selection: word.slice(0, 300), images: imgs, stream: Boolean(onPartial), onText });
  let res;
  try { res = await call(image ? [image] : undefined) }
  catch (e) { if (!image || (e?.code !== 'images_unavailable' && e?.code !== 'image_rejected')) throw e; if (e.code === 'images_unavailable') sampleImages = false; res = await call(undefined) }
  return TinctMargin.parseLookup(res.text, word);
}
// Typing with a selection opens Ask with that key; Escape steps back one piece at a time.
addEventListener('keydown', e => {
  if (!marginOn() || !readerShown()) return;
  if (e.key === 'Escape' && mr) {
    e.preventDefault(); e.stopImmediatePropagation();
    if (mr.moreEl) { const had = mr.moreEl.contains(document.activeElement); closeMore(); if (had) mr.el.querySelector('[data-m="more"]')?.focus({ preventScroll: true }); return }
    if (mr.mode === 'asking' || mr.mode === 'colors' || mr.mode === 'note') {
      if (mr.mode === 'note') { const f = mr.el.querySelector('.mr-note__field'); if (f && mr.ids[0]) noteDrafts.set(mr.ids[0], f.value) }
      dictation.stop(); mrShow(mr.def ? 'define' : 'menu')
      // Ask and the note took the focus, and with it the page's selection: select the passage again,
      // so a late selectionchange finds it and the bar stays (it closed the bar on a slow machine).
      // A passage whose page was drawn again meanwhile (its range left the text layer) is held instead (rangeInText).
      if (!mr.held && mr.info.range) { if (rangeInText(mr.info.range)) { const s = getSelection(); s.removeAllRanges(); s.addRange(mr.info.range) } else mr.held = true }
      return
    }
    marginClose(); getSelection().removeAllRanges();
    return;
  }
  // More: Up and Down move between its rows (Return chooses, as on any button).
  if (mr?.moreEl && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault(); e.stopImmediatePropagation();
    const rows = [...mr.moreEl.querySelectorAll('[data-m]')], at = rows.indexOf(document.activeElement), down = e.key === 'ArrowDown';
    rows[at < 0 ? (down ? 0 : rows.length - 1) : (at + (down ? 1 : -1) + rows.length) % rows.length]?.focus({ preventScroll: true });
    return;
  }
  // The bar is a toolbar: Tab from the page moves into it; Left and Right move along it.
  if (mr?.el && !mr.moreEl && ['menu', 'colors', 'define'].includes(mr.mode) && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const items = [...mr.el.querySelectorAll('button:not([disabled])')], at = items.indexOf(document.activeElement);
    if (e.key === 'Tab' && !e.shiftKey && at < 0 && !e.target.closest?.('input, textarea, select, [contenteditable="true"], .mr-col, .mr-sheet, .mr-card')) { e.preventDefault(); e.stopImmediatePropagation(); items[0]?.focus({ preventScroll: true }); return }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && at >= 0) { e.preventDefault(); e.stopImmediatePropagation(); items[(at + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length].focus({ preventScroll: true }); return }
  }
  // With a selection, N opens the note on it and any other printable key opens Ask with that character
  // (keys act only when no field has focus and without Cmd, Ctrl or Alt; TinctMargin.selectionKey).
  const key = TinctMargin.selectionKey(e, { inField: !!e.target.closest?.('input, textarea, select, [contenteditable="true"]') });
  if (!key) return;
  if (document.querySelector('.lab-super-layer, .lab-v2-sheet-layer, .lab-contents-v2, .byob-sheet-host, .byob-snip, .byob-jumpbox, .byob-switcher')) return;
  if (!mr) { const info = selectionInfo(); if (!info) return; marginOpen(info, { asking: key.action === 'ask' }) }
  else if (!['menu', 'colors', 'define'].includes(mr.mode)) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (key.action === 'note') { mr.defToken = {}; mr.def = null; return mrNoteOpen() }
  mrShow('asking', { question: key.ch });
}, true);
// A tap or click outside lets go of a passage the margin holds (a new selection opens its own).
document.addEventListener('pointerdown', e => { if (mr && !e.target.closest?.('.mr-float') && (mr.held || mr.mode !== 'menu')) marginClose() }, true);

/* Dictation into the question, as the book reader's chat does (src/lab/useLabDictation.ts):
   signed in, one clip recorded while the mic is on and turned into text by /api/dictation;
   signed out, the browser's own speech recognition. It never sends the question or starts Talk. */
const DICTATION_COPY = {
  unavailable: 'Dictation is unavailable in this browser. Use your keyboard microphone or type your question.',
  denied: 'Microphone access was denied. Allow it in your browser to dictate.',
  noSpeech: 'No speech heard. Tap the microphone to try again.',
  stopped: 'Dictation stopped. Tap the microphone to try again.',
  noStart: 'The microphone could not start. Please try again.',
  failed: 'Dictation could not be turned into text. Tap the microphone to try again.',
};
const dictation = {
  rec: null, clip: null, session: 0,
  target: null,
  pressed(on) { (this.target || mr?.el?.querySelector('[data-m="mic"]'))?.setAttribute('aria-pressed', String(on)) },
  write(field, prefix, text) { field.value = [prefix, text].filter(Boolean).join(' '); field.dispatchEvent(new Event('input', { bubbles: true })) },
  stop() {
    this.session++;
    const r = this.rec; this.rec = null;
    if (r) { r.onresult = r.onerror = r.onend = null; try { r.stop() } catch {} }
    const c = this.clip; this.clip = null;
    if (c) { clearTimeout(c.timer); c.recorder.onstop = null; try { if (c.recorder.state !== 'inactive') c.recorder.stop() } catch {} c.stream.getTracks().forEach(t => t.stop()); c.abort.abort() }
    this.pressed(false);
  },
  toggle(field) {
    if (this.rec) return this.stop();
    if (this.clip) { if (this.clip.recorder.state === 'recording') { clearTimeout(this.clip.timer); this.clip.recorder.stop() } return }
    const prefix = field.value.trim(), token = window.TinctAI?.session?.().token;
    if (token && typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia) this.record(field, prefix); else this.recognise(field, prefix);
  },
  async record(field, prefix) {
    const session = ++this.session;
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }) }
    catch (e) { if (session === this.session) toast(e?.name === 'NotAllowedError' || e?.name === 'SecurityError' ? DICTATION_COPY.denied : DICTATION_COPY.noStart); return }
    if (session !== this.session) { stream.getTracks().forEach(t => t.stop()); return }
    let recorder;
    try {
      const type = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'].find(t => { try { return MediaRecorder.isTypeSupported(t) } catch { return false } });
      recorder = new MediaRecorder(stream, { ...(type ? { mimeType: type } : {}), audioBitsPerSecond: 32000 });
    } catch { stream.getTracks().forEach(t => t.stop()); toast(DICTATION_COPY.noStart); return }
    const clip = this.clip = { recorder, stream, chunks: [], abort: new AbortController(), timer: null };
    recorder.ondataavailable = ev => { if (ev.data?.size) clip.chunks.push(ev.data) };
    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      if (session !== this.session) return;
      this.clip = null; this.pressed(false);
      const blob = new Blob(clip.chunks, { type: recorder.mimeType || 'audio/webm' });
      if (!blob.size) { toast(DICTATION_COPY.noSpeech); return }
      try {
        const token = window.TinctAI?.session?.().token; if (!token) { toast(DICTATION_COPY.failed); return }
        const form = new FormData(); form.append('language', 'en'); form.append('bookId', 'userbook-' + hexOf(state.key)); form.append('audio', blob, 'dictation');
        const r = await fetch('/api/dictation', { method: 'POST', body: form, headers: { Authorization: 'Bearer ' + token }, signal: clip.abort.signal });
        const data = await r.json().catch(() => ({}));
        if (session !== this.session) return;
        if (!r.ok || typeof data.text !== 'string') { toast(DICTATION_COPY.failed); return }
        if (!data.text.trim()) { toast(DICTATION_COPY.noSpeech); return }
        this.write(field, prefix, data.text.trim());
      } catch { if (session === this.session) toast(DICTATION_COPY.failed) }
    };
    clip.timer = setTimeout(() => { if (this.clip === clip && recorder.state === 'recording') recorder.stop() }, 60000);
    try { recorder.start(); this.pressed(true) } catch { this.stop(); toast(DICTATION_COPY.noStart) }
  },
  recognise(field, prefix) {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) { toast(DICTATION_COPY.unavailable); return }
    this.session++;
    const rec = this.rec = new R();
    rec.continuous = true; rec.interimResults = true; rec.lang = navigator.language || 'en-US';
    rec.onresult = ev => { if (this.rec === rec) this.write(field, prefix, [...ev.results].map(x => x[0].transcript.trim()).filter(Boolean).join(' ')) };
    rec.onerror = ev => { if (this.rec !== rec) return; toast(ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? DICTATION_COPY.denied : ev.error === 'no-speech' ? DICTATION_COPY.noSpeech : DICTATION_COPY.stopped); this.stop() };
    rec.onend = () => { if (this.rec === rec) this.stop() };
    try { rec.start(); this.pressed(true) } catch { this.stop(); toast(DICTATION_COPY.noStart) }
  },
};

/* ---------- The margin column: cards, leader lines, the "more" row, marks, the bottom card (PDF only) ----------
   docs/margin/BRIEF.md §3, §4 and §6 (PR 2). Every kept result with a passage is a card: Ask threads,
   Explain, Simplify, Define, Fact-check, Counterpoint and Quiz me, kept in 'cards:' + key (synced as
   the highlights are, cardsSync), and every highlight with a note. On a wide desktop the cards sit in a
   380px column 56px right of the page, which replaces the docked chat; below 1180px they are marks at
   the page's edge that open a floating card; on the phone a card opens along the bottom. The whole-PDF
   chat (the existing thread, chat.turns) is the "Whole PDF" card at the top of the column and the
   column's foot. Markup, placement and parsing are TinctMargin's (js/margin.js) and margin-parse.js. */
const MP = { P: null };
// Tagged so a cached copy without parseQuizPartial (Quiz me streaming) is never paired with this reader.
const mpReady = import('/lab/margin/margin-parse.js?v=20261016round4').then(m => (MP.P = m)).catch(() => null);
const col = { el: null, stack: null, leads: null, marks: null, float: null, sheet: null, mode: null, open: null, els: new Map(), live: new Map(), pending: new Map(), drafts: new Map(), ctl: new Map(), quiz: new Map(), raf: 0, view: null, viewAt: 0, whole: { away: false } };
// Delete's "Deleted · Undo" line (deleteCard).
const UNDO_MS = 6000;
const undo = { el: null, timer: 0, rect: null, restore: null };
/* The margin for EPUBs read here (FIXES-2026-10-15 PR C) is built but OFF (Anders, 15 Oct 2026: "Keep it
   pdf for now. Later the margin reader will be available for all books."). Off, an EPUB behaves exactly as
   before: the selection popup and the docked chat. The layout check turns it on for its `epub` mode
   (EPUB_MARGIN=1 sets window.TinctEpubMargin before the page loads). */
const EPUB_MARGIN = false;
const epubMargin = () => EPUB_MARGIN || window.TinctEpubMargin === true;
// The PDF reader's margin: a PDF, and an EPUB when EPUB_MARGIN is on.
const marginOn = () => hasBook() && (state.kind === 'pdf' || (state.kind === 'epub' && epubMargin()));
/** How the margin names the file and a place in it: pages for a PDF, chapters for an EPUB. */
const docKind = () => (isEpub() ? 'epub' : 'pdf');
const where = () => (isEpub() ? { unit: 'ch.', doc: 'epub' } : { doc: 'pdf' });
const cardName = card => TinctMargin.html.cardLabel(card, pageLabel(card.page), where());
/** An EPUB chapter as a place in prose ("ch. 3"), for Copy quote. */
const chapterPlace = n => `ch. ${n}`;
const keptCards = () => store.get('cards:' + state.key) || [];
// Cards made before this visit without their answer are not shown (TinctMargin.cardView); newer ones may still be answering.
const CARDS_SINCE = Date.now();
const cardById = id => keptCards().find(c => c.id === id && !c.gone) || null;
function saveCard(card) {
  card.u = Date.now();
  if (card.turns) card.turns = card.turns.slice(-TinctMargin.CARD_LIMITS.turns).map(t => ({ ...t, content: String(t.content || '').slice(0, TinctMargin.CARD_LIMITS.content) }));
  store.set('cards:' + state.key, [...keptCards().filter(c => c.id !== card.id), card]);
  cardsSync.changed();
  marginLayout({ fresh: true });
}
// A PDF's printed page label (the companion is shown these and cites them), else its page number.
const LABEL_RE = /^[\p{L}\p{N}](?:[\p{L}\p{N}.\-–]{0,14}[\p{L}\p{N}])?$/u;
function pageLabel(n) { const l = String(state.labels?.[n - 1] ?? '').trim(); return LABEL_RE.test(l) ? l : String(n) }
/** The file's last page as labelled ("of M" in the top bar and the page jump): its last printed label, else the count. */
const lastLabel = () => (state.labels ? pageLabel(state.pages.length) : String(state.pages.length));
/** The page a typed page label names: a printed label (any case: "xii", "423"), else, without labels, a page number. -> page or 0 */
function pageOfLabel(value) {
  const count = state.pages.length, labels = state.labels ? Array.from({ length: count }, (_, i) => pageLabel(i + 1)) : null;
  if (window.TinctPrintedPages?.pageOf) return TinctPrintedPages.pageOf(value, labels, { count, near: currentPlace().page });
  const n = /^\d+$/.test(String(value || '').trim()) ? Number(String(value).trim()) : 0;
  return n >= 1 && n <= count ? n : 0;
}
/**
 * "Go to page": the page a typed number names. Until a long PDF's printed numbers are known (the whole book is read
 * once in the background; js/printed-pages.js), the pages from the number on are read for their printed numbers
 * (at most 90, a book's front matter and parts), so a printed number never lands on the file page of that number
 * (morning retest 16 Oct: Sutton and Barto's 423 went to chapter 15 when typed early, 445 to the right page later).
 */
async function jumpToLabel(value) {
  const token = state.token, count = state.pages.length;
  const known = !state.labelsTask || isEpub() || await Promise.race([Promise.resolve(state.labelsTask).then(() => true), new Promise(r => setTimeout(() => r(false), 60))]);
  let n = 0;
  if (!known && !state.labels && window.TinctPrintedPages?.findPrinted && state.pdf) {
    const v = String(value || '').trim(), num = /^\d{1,4}$/.test(v) ? Number(v) : 0;
    const from = num ? Math.max(1, Math.min(count, num) - 6) : 1, to = Math.min(count, from + 90), per = [];
    for (let k = from; k <= to; k++) {
      if (token !== state.token) return;
      if (state.labels) break;
      const page = await state.pdf.getPage(k), have = state.texts.get(k);
      per.push(TinctPrintedPages.candidates(have ? have.items : (await page.getTextContent()).items, page.view));
    }
    if (!state.labels) n = TinctPrintedPages.findPrinted(v, per, from);
  }
  if (token !== state.token) return;
  if (!n) n = pageOfLabel(value);
  if (n) goTo({ page: n, frac: 0 });
}
/** The pages around `focus` as the companion receives a PDF: [{ n: printed label, text }] and the focus's index. */
async function pdfPages(focus, { before = 1, after = 1, budget = 9000 } = {}) {
  const from = Math.max(1, focus - before), to = Math.min(state.pages.length || focus, focus + after);
  const pages = []; let at = 0, used = 0;
  for (let n = from; n <= to && used < budget * (to - from + 1); n++) {
    const text = (await pageText(n)).text.slice(0, budget);
    if (n === focus) at = pages.length;
    pages.push({ n: pageLabel(n), text: text || ' ' }); used += text.length;
  }
  // An EPUB's "pages" are its chapters (the Worker marks them as chapters and sends no picture).
  return { pages, at, ...(isEpub() ? { kind: 'epub' } : {}) };
}
/* The whole book, read once per open in the background (FIXES-2026-10-15, long books, items 8 and 10):
   each page's text as the companion reads it (textOf), the numbers printed at its top and bottom
   (js/printed-pages.js), what kind of page it is (an index, a reference list, a contents page) and a
   search index over the text (js/doc-search.js). Only text is kept, not the pages' items, so a
   500-page book stays light. */
// A recognised scan (PR D) is read from its recognised pages: their text is what is searched and sent,
// and the heads and feet recognition found give its printed numbers (TinctPdfOcr.furnitureItems).
const book = { key: null, pdf: null, ocr: null, task: null, texts: [], numbers: [], matter: [], index: null };
function readBook() {
  if (book.key === state.key && book.pdf === state.pdf && book.ocr === (state.ocrPages || null) && book.task) return book.task;
  const key = state.key, pdf = state.pdf, ocr = state.ocrPages || null;
  if (!pdf || isEpub()) return Promise.resolve(null);
  Object.assign(book, { key, pdf, ocr, texts: [], numbers: [], matter: [], index: window.TinctDocSearch ? TinctDocSearch.create() : null });
  const task = (async () => {
    for (let n = 1; n <= pdf.numPages; n++) {
      if (state.pdf !== pdf || (state.ocrPages || null) !== ocr) return null;
      const recognised = ocr?.get(n) && window.TinctPdfOcr ? ocr.get(n) : null;
      const have = recognised ? null : state.texts.get(n), page = recognised ? null : await pdf.getPage(n);
      const items = recognised ? TinctPdfOcr.furnitureItems(recognised) : have ? have.items : await shownItems(page, (await page.getTextContent()).items);
      const text = recognised ? TinctPdfOcr.pageText(recognised) : have ? have.text : textOf(items, page.view).text;
      book.texts[n - 1] = text;
      book.numbers[n - 1] = window.TinctPrintedPages ? TinctPrintedPages.candidates(items, recognised ? TinctPdfOcr.FURNITURE_VIEW : page.view) : [];
      book.matter[n - 1] = TinctMargin.pageMatter(text);
      book.index?.add(n, text);
    }
    return book;
  })().catch(() => { if (book.task === task) book.task = null; return null });
  book.task = task;
  return task;
}
/* Printed page numbers for a PDF without page labels (FIXES-2026-10-15, long books, item 10): the
   numbers its pages print in their heads and feet, where neighbouring pages agree (the test's book
   prints 423 on file page 445). Found once per device and kept ('printed:' + key); they are the
   labels everywhere labels are used: citations, the strip, card labels, Copy quote. */
// 2 (round 3, 16 Oct): heads below a banner are read (MacKay), so a book found without numbers before is read again.
const PRINTED_V = 2;
async function pageLabels(pdf, key, token) {
  const use = labels => { if (token !== state.token) return; state.labels = labels; marginLayout({ fresh: true }); strip?.marksChanged(); onScroll() };
  const own = await Promise.resolve(pdf.getPageLabels?.()).catch(() => null);
  if (token !== state.token) return;
  if (Array.isArray(own) && own.length === pdf.numPages) return use(own);
  if (!window.TinctPrintedPages) return;
  // A recognised scan's numbers are found again once its text is recognised (`ocr`, the pages recognised).
  const ocr = state.ocrPages ? state.ocrPages.size : 0;
  const kept = store.get('printed:' + key);
  if (kept?.v === PRINTED_V && kept.pages === pdf.numPages && (kept.ocr || 0) === ocr) { if (Array.isArray(kept.labels) && kept.labels.length === pdf.numPages) use(kept.labels); return }
  // A long file: the scan's chapters first (Before you start's units wait for them; contentsSoon), then the whole book.
  if (pdf.numPages >= TinctMargin.PRIMER.units) {
    await Promise.race([contentsSoon(), new Promise(r => setTimeout(r, 5000))]);
    if (token !== state.token) return;
  }
  const read = await readBook();
  if (!read || token !== state.token) return;
  const labels = TinctPrintedPages.labels(read.numbers);
  store.set('printed:' + key, { v: PRINTED_V, pages: pdf.numPages, labels, ...(ocr ? { ocr } : {}) });
  if (labels) use(labels);
}
/* The whole file as the margin's companion reads it (docs/margin/FIXES-2026-10-15.md A1): every page's
   text with its printed label, read once per book and kept, so each request sends the same text and the
   Worker's cached prefix is read, not rewritten. A file longer than TinctAI.DOCUMENT_CHARS sends the
   chapter the reader is in with the contents list instead, and a search of the rest for a question. */
const docCache = { key: null, task: null };
function readDocument() {
  if (docCache.key === state.key && docCache.task) return docCache.task;
  const key = state.key, limit = window.TinctAI?.DOCUMENT_CHARS || 560000;
  docCache.key = key;
  docCache.task = (async () => {
    await state.labelsTask;
    const read = await readBook();
    if (!read || state.key !== key) return null;
    const pages = []; let chars = 0;
    for (let n = 1; n <= state.pages.length; n++) {
      const text = read.texts[n - 1] || '';
      if ((chars += text.length) > limit) return { pages: null, limit };
      pages.push({ n: pageLabel(n), text });
    }
    return { pages, limit };
  })().catch(() => { if (docCache.key === key) docCache.task = null; return null });
  return docCache.task;
}
/**
 * The margin request's `document` for the reader on `page`, or null (not open, or not readable). An EPUB's units are its chapters.
 * A long PDF's is its part: the chapter the reader is in and the contents with their printed pages,
 * the same for every request in that chapter (the cached prefix); `range` (file pages) stays here.
 */
async function marginDocument(page) {
  if (!marginOn() || !state.pages.length) return null;
  const key = state.key;
  const read = await readDocument(); if (!read) return null;
  if (read.pages) return { kind: docKind(), units: read.pages };
  if (isEpub()) {
    // Too long to send whole: the chapter the reader is in, and the contents.
    const text = (await pageText(page)).text || '';
    return { kind: 'epub', units: [{ n: pageLabel(page), text: text.slice(0, read.limit) }], part: { toc: toc.entries.map(e => ({ title: e.label, n: pageLabel(e.page) })), total: state.pages.length } };
  }
  const [r, contents] = await Promise.all([docRange(page), contentsSoon()]);
  if (state.key !== key) return null;
  const units = []; let chars = 0;
  for (let n = r.from; n <= r.to; n++) { const text = book.texts[n - 1] || ''; if ((chars += text.length) > read.limit) break; units.push({ n: pageLabel(n), text }) }
  return { kind: 'pdf', units, part: { toc: contents.entries.map(e => ({ title: e.label, n: pageLabel(e.page) })), total: state.pages.length }, range: { from: r.from, to: r.from + units.length - 1 } };
}
/**
 * A long file's part for `page`, a function of the document alone so every request in the part sends the
 * same bytes (the cached prefix): the unit of Before you start the page lies in (its pages, by the outline
 * or the contents; the same part its primer sends), else a fixed 40-page block. It waits for the units,
 * never racing a timer: on MacKay the part was sometimes the 40-page block, sometimes the contents' chapter
 * and sometimes the unit, so the cache was written again and again (round 1, 15 Oct). The units come from
 * the contents as soon as the scan finds them (contentsSoon); a minute is only a guard against a stall.
 */
async function docRange(page) {
  await Promise.race([primer.unitsTask, new Promise(r => setTimeout(r, 60000))]);
  const unit = primer.units && primer.units[0]?.key !== 'all' ? TinctMargin.unitAt(primer.units, page) : null;
  if (unit) return { from: unit.from, to: unit.to };
  const block = Math.floor((page - 1) / 40) * 40 + 1;
  return { from: block, to: Math.min(state.pages.length, block + 39) };
}
/**
 * For a question on a long file (FIXES-2026-10-15, long books, item 8): the few passages beyond its
 * chapter that a search of the whole book for the question's terms finds best, with their printed
 * pages ("where is Sarsa introduced" -> the page that introduces it). Not the pages the request
 * carries already, and not an index, a reference list or the contents, which match any term.
 * -> [{ n, text }] for the request's `passages`, or null (a file sent whole, no question).
 */
async function searchPassages(question, doc) {
  if (!doc?.part || !doc.range || !String(question || '').trim()) return null;
  const read = await readBook(); if (!read?.index) return null;
  const skip = new Set();
  for (let n = doc.range.from; n <= doc.range.to; n++) skip.add(n);
  for (const u of primer.units || []) if (u.matter) for (let n = u.from; n <= u.to; n++) skip.add(n);
  read.matter.forEach((m, i) => { if (m) skip.add(i + 1) });
  // A question that names a chapter or section ("what do chapters 7 and 10 say?", Anders, 15 Oct) takes
  // that chapter's opening text from the contents, first; the search then looks for the rest, its terms
  // the question's own words and the named chapters' titles.
  const named = TinctMargin.namedUnits(question, contentsEntries()).filter(u => u.page < doc.range.from || u.page > doc.range.to).slice(0, 3);
  const opening = named.map(u => ({ n: pageLabel(u.page), text: openingText(read, u.page) })).filter(o => o.text);
  for (const u of named) skip.add(u.page);
  const query = named.length ? [TinctMargin.withoutRefs(question), ...named.map(u => u.title)].join(' ') : question;
  // Each hit as the whole section it falls in (from the contents: outline, printed contents or headings), in the
  // search's order, within the request's budget for passages (TinctAI.PASSAGES_BUDGET); a hit outside any section keeps its lines.
  const hits = read.index.search(query, { limit: 5, skip });
  const budget = (window.TinctAI?.PASSAGES_BUDGET || 40000) - opening.reduce((a, o) => a + o.text.length, 0);
  const found = TinctDocSearch.sections ? TinctDocSearch.sections(hits, { entries: contentsEntries(), texts: read.texts, label: pageLabel, cap: window.TinctAI?.PASSAGE_CHARS || 16000, budget })
    : hits.map(hit => ({ n: pageLabel(hit.page), text: hit.text }));
  const all = [...opening, ...found].slice(0, 6);
  return all.length ? all : null;
}
/** The contents as { title, page }: the file's own (toc), else the outline's units (Before you start's). */
function contentsEntries() {
  const list = toc.entries.map(e => ({ title: e.label, page: e.page }));
  for (const u of primer.units || []) if (u.title && !list.some(e => e.page === u.start && e.title === u.title)) list.push({ title: u.title, page: u.start });
  return list;
}
/** A chapter's opening text: its first page, and the next when that is short (a title page), up to 1,200 characters. */
function openingText(read, page) {
  let text = '';
  for (let n = page; n <= Math.min(page + 2, read.texts.length) && text.length < 600; n++) text += (text ? ' ' : '') + String(read.texts[n - 1] || '');
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= 1200) return t;
  const cut = t.slice(0, 1199), sp = cut.lastIndexOf(' ');
  return (sp > 1000 ? cut.slice(0, sp) : cut) + '…';
}
/** A citation's place in this PDF (TinctMargin.citeTarget over the pages read so far), or null. An EPUB has no page numbers: its places are quoted words. */
function citeResolve(token) {
  if (isEpub()) return null;
  const texts = new Map([...state.texts.entries()].map(([n, v]) => [n, v.text]));
  return TinctMargin.citeTarget(token, { labels: state.labels, count: state.pages.length, texts });
}
/** Scroll the PDF to a citation's page, and to its printed words on it when they are found. */
function goToCite(page, needle) {
  const p = state.pages[page - 1]; if (!p) return;
  const find = () => {
    if (!needle || !p.layer) return null;
    const span = [...p.layer.querySelectorAll('span')].find(sp => (sp.textContent || '').includes(needle) || needle.includes((sp.textContent || '').trim()) && (sp.textContent || '').trim().length > 2);
    if (!span) return null;
    const r = span.getBoundingClientRect(), b = p.pg.getBoundingClientRect();
    return Math.max(0, (r.top - b.top) / b.height - 0.04);
  };
  const frac = find();
  goTo({ page, frac: frac ?? 0 }, true);
  if (frac == null && needle) setTimeout(() => { const f = find(); if (f != null) goTo({ page, frac: f }, true) }, 700);
}

/* -- Related's places: scroll there and underline the place briefly (PROMPTS.md, Related) -- */
const quoteCache = new Map();
const quoteRe = quote => new RegExp(String(quote).replace(/[“”"]/g, '').trim().split(/\s+/).slice(0, 12).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’‘]/g, "['’‘]")).join('\\s+'), 'i');
/** An EPUB's quoted words: the chapter and the offsets in its text where they first stand, or null. */
function findQuote(quote) {
  const key = state.key + '\n' + quote;
  if (quoteCache.has(key)) return quoteCache.get(key);
  let found = null;
  if (isEpub() && String(quote).trim().length >= 3) {
    const re = quoteRe(quote);
    for (const p of state.pages) {
      const m = re.exec(p.pg.textContent || '');
      if (m) { found = { page: p.n, start: m.index, end: m.index + m[0].length }; break }
    }
  }
  quoteCache.set(key, found);
  return found;
}
/** Related's quoted place, for its row: { page } when the words are in the book, else null (the row stays text). */
const quotePlace = quote => { const f = findQuote(quote); return f ? { page: f.page } : null };
/** Scroll to a place (a page and the printed words on it, or an EPUB's quoted words) and underline it for a moment. */
function goToPlace(page, { needle = '', quote = '' } = {}) {
  const f = quote ? findQuote(quote) : null;
  if (f) {
    const p = state.pages[f.page - 1]; if (!p) return;
    const range = rangeFromOffsets(p.pg, f.start, f.end);
    const r = range?.getBoundingClientRect(), b = p.pg.getBoundingClientRect();
    goTo({ page: f.page, frac: r && b.height ? Math.max(0, (r.top - b.top) / b.height - 0.04) : 0 }, true);
    setTimeout(() => flashPlace(p, range ? [...range.getClientRects()] : []), 450);
    return;
  }
  goToCite(page, needle);
  // The printed words when they were found, else the page's first line of text.
  setTimeout(() => {
    const p = state.pages[page - 1]; if (!p?.layer) return;
    const spans = [...p.layer.querySelectorAll('span')].filter(sp => (sp.textContent || '').trim().length > 2);
    const hit = needle ? spans.filter(sp => (sp.textContent || '').includes(needle) || needle.includes((sp.textContent || '').trim())) : [];
    flashPlace(p, (hit.length ? hit : spans.slice(0, 1)).map(sp => sp.getBoundingClientRect()));
  }, 800);
}
function flashPlace(p, rects) {
  const bars = lineBars(rects.filter(r => r.width > 0.5 && r.height > 0.5)); if (!bars.length) return;
  const layer = layerOf(p, 'mr-flash-layer'); layer.classList.add('mr'); layer.replaceChildren();
  const b = p.pg.getBoundingClientRect();
  for (const bar of bars) { const i = document.createElement('i'); Object.assign(i.style, { left: (bar.left - b.left) / b.width * 100 + '%', top: (bar.bottom - b.top) / b.height * 100 + '%', width: (bar.right - bar.left) / b.width * 100 + '%' }); layer.appendChild(i) }
  clearTimeout(flashPlace.timer); flashPlace.timer = setTimeout(() => layer.replaceChildren(), 1800);
}

/* -- Which surface: Margin view's column (wide desktop), marks (narrow) or bottom card (phone); Focus view's pop-up window -- */
function marginMode() {
  if (!marginOn() || !readerShown() || !state.pages.length) return null;
  return TinctReaderLayout.surface(viewLayout(), { phone: isPhone(), width: innerWidth, narrow: TinctMargin.COL.narrow });
}
function marginStart() {
  if (!marginOn()) return;
  chat.el?.remove(); chat.el = null;
  document.querySelector('.byob-dock-tab')?.remove();
  if (!col.el) {
    const el = col.el = document.createElement('div');
    el.className = 'mr mr-col is-reader'; el.setAttribute('role', 'complementary'); el.setAttribute('aria-label', 'Margin');
    // No whole-PDF line at the column's foot (Anders, 15 Oct): questions about the whole file go through Chat (the t menu, or "/").
    el.innerHTML = '<button type="button" class="mr-stack" data-c="stack" hidden></button>';
    col.stack = el.querySelector('.mr-stack');
    bindCardEvents(el);
    // One scroll surface (Anders, 15 Oct): the wheel over the column scrolls the pages, unless a card's own body can scroll that way.
    el.addEventListener('wheel', e => {
      if (e.ctrlKey || !$('scroll')) return;
      for (let n = e.target; n && n !== el; n = n.parentElement) {
        if (n.scrollHeight - n.clientHeight > 1 && /(auto|scroll)/.test(getComputedStyle(n).overflowY) && (e.deltaY < 0 ? n.scrollTop > 0 : n.scrollTop + n.clientHeight < n.scrollHeight - 1)) return;
      }
      $('scroll').scrollBy({ top: e.deltaY * (e.deltaMode === 1 ? 16 : 1), left: e.deltaX * (e.deltaMode === 1 ? 16 : 1) });
    }, { passive: true });
    col.leads = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    col.leads.setAttribute('class', 'mr mr-leads'); col.leads.setAttribute('aria-hidden', 'true');
    // The pages' scroller runs under the column: zoomed-in pages wider than their area stay hidden beside it, as before (the scrollbar stays clear).
    col.cover = document.createElement('div'); col.cover.className = 'mr-cover'; col.cover.setAttribute('aria-hidden', 'true'); col.cover.hidden = true;
    col.marks = document.createElement('div'); col.marks.className = 'mr mr-marks';
    col.marks.addEventListener('click', e => {
      const m = e.target.closest('.mr-mark'); if (!m) return;
      if (m.dataset.primer) return togglePrimer();
      const ids = (m.dataset.ids || m.dataset.id).split(' '), at = ids.indexOf(col.open);
      openCard(at < 0 ? ids[0] : at + 1 < ids.length ? ids[at + 1] : null);
    });
  }
  for (const n of [col.cover, col.el, col.leads, col.marks]) if (!n.isConnected) root.appendChild(n);
  col.mode = null; col.open = null;
  marginLayout({ fresh: true });
}
function marginStop() {
  for (const c of col.ctl.values()) c.abort();
  col.ctl.clear(); col.live.clear(); col.pending.clear(); col.quiz.clear();
  closeFloat(); closeSheet2();
  col.el?.remove(); col.leads?.remove(); col.marks?.remove(); col.cover?.remove();
  col.els.forEach(e => e.remove()); col.els.clear();
  document.querySelectorAll('.mr-ul-layer').forEach(l => l.replaceChildren());
  if (root.classList.contains('margin-open')) { root.classList.remove('margin-open', 'dock-open'); root.style.removeProperty('--dock-w') }
  col.mode = null; col.open = null;
  hideUndo();
  primerReset();
}
/** Wide desktop: the page area narrows for the column, as it did for the docked chat; the place stays. */
function reserveColumn(on) {
  if (root.classList.contains('margin-open') === on) return;
  root.classList.toggle('margin-open', on); root.classList.toggle('dock-open', on);
  if (on) root.style.setProperty('--dock-w', TinctMargin.COLUMN_RESERVE + 'px'); else root.style.removeProperty('--dock-w');
  if (state.pages.length) setZoom(state.zoom);
}

/* -- Layout, once a frame while the pages scroll -- */
function marginLayout({ fresh = false } = {}) {
  if (fresh) col.view = null;
  if (col.raf) return;
  col.raf = requestAnimationFrame(() => { col.raf = 0; try { layoutNow() } catch (e) { console.error(e) } });
}
function viewCards() {
  // An EPUB's text reflows (zoom, width), so its cards and noted highlights are measured from their
  // character offsets near the reader's place, and again when that place moves to another chapter.
  if (isEpub()) { const at = state.pages.length ? currentPlace().page : 0; if (col.viewAt !== at) { col.viewAt = at; col.view = null } }
  if (!col.view) col.view = isEpub() ? TinctMargin.cardView(keptCards().map(epubCardRects), highlights().map(epubMarkRects), { since: CARDS_SINCE }) : TinctMargin.cardView(keptCards(), highlights(), { since: CARDS_SINCE });
  return col.view;
}
/* ---- An EPUB's passages as offsets in a chapter's text (as its highlights are), measured into the
   page-fraction boxes the margin draws with. A chapter far from the reader keeps its stored boxes. ---- */
function epubRects(n, start, end) {
  const p = state.pages[n - 1]; if (!p || p.kind !== 'epub' || !isNear(p)) return null;
  const range = rangeFromOffsets(p.pg, start, end); if (!range) return null;
  const b = p.pg.getBoundingClientRect(); if (!b.width || !b.height) return null;
  const r = v => Math.round(v * 10000) / 10000;
  const rects = lineBars([...range.getClientRects()]).map(bar => [n, r((bar.left - b.left) / b.width), r((bar.top - b.top) / b.height), r((bar.right - bar.left) / b.width), r((bar.bottom - bar.top) / b.height)]);
  return rects.length ? rects : null;
}
function epubCardRects(card) {
  if (!card || card.gone || !Array.isArray(card.span)) return card;
  const rects = epubRects(...card.span);
  return rects ? { ...card, rects } : card;
}
function epubMarkRects(m, { any = false } = {}) {
  if (!m || m.gone || m.start == null || (!m.note && !any)) return m;
  const rects = epubRects(m.page, m.start, m.end);
  return rects ? { ...m, rects: rects.map(([, x, y, w, h]) => [x, y, w, h]) } : m;
}
/** A new EPUB card keeps its passage as offsets in its chapter (`span`: [chapter, start, end]), from the live selection. */
function withSpan(card, info) {
  if (!isEpub() || !info?.range?.startContainer?.isConnected) return card;
  const p = state.pages[info.page - 1]; if (!p?.pg.contains(info.range.startContainer)) return card;
  const r = info.range.cloneRange();
  if (!p.pg.contains(r.endContainer)) r.setEnd(p.pg, p.pg.childNodes.length);
  const start = textOffset(p.pg, r.startContainer, r.startOffset), end = textOffset(p.pg, r.endContainer, r.endOffset);
  return end > start ? { ...card, span: [p.n, start, end] } : card;
}
/** The cards whose passages are in view, with their first line's box on screen. */
function visibleCards() {
  const sr = $('scroll').getBoundingClientRect(), top = Math.max(sr.top, $('hdr').getBoundingClientRect().bottom), bottom = sr.bottom;
  const out = [];
  for (const card of viewCards()) {
    const f = TinctMargin.firstRect(card), p = state.pages[f[0] - 1]; if (!p) continue;
    const b = p.pg.getBoundingClientRect();
    // A figure's card is level with the figure's top (its dot and leader line there), not its middle.
    const line = { top: b.top + f[2] * b.height, bottom: b.top + (f[2] + (card.kind === 'figure' ? Math.min(f[4], 22 / b.height) : f[4])) * b.height, left: b.left + f[1] * b.width };
    const all = TinctMargin.anchorOfCard(card).map(a => { const q = state.pages[a.n - 1]?.pg.getBoundingClientRect(); return q ? q.top + (a.y + a.h) * q.height : line.bottom });
    const last = Math.max(line.bottom, ...all);
    const inView = line.top >= top && line.top < bottom - 8;
    if (inView || (card.id === col.open && last > top && line.top < bottom)) out.push({ card, line, last, pageRight: Math.min(pageEdge(p), sr.left + pagesWidth()) });
  }
  return out;
}
/**
 * Quiz me while its questions stream in (FIXES-2026-10-15 A7): the questions so far and the
 * reader's progress live in col.quiz, in memory, until the stream ends; the card is saved once then.
 */
const quizLive = card => { const d = col.quiz.get(card.id); return d ? { ...card, data: d } : card };
const cardSig = (card, open) => JSON.stringify([card.u, open, col.live.get(card.id), col.pending.get(card.id), state.labels ? 1 : 0, open && card.kind === 'quiz' ? card.data : 0, col.quiz.has(card.id), card.kind === 'figure' && figThumbs.has(card.id)]);
function cardOpts(card, open) {
  const live = col.live.get(card.id);
  const thumb = open && card.kind === 'figure' ? figThumb(card) : null;
  // Simplify compares its answer with the page and the next (simplifyAnswer): the document pasted back is never shown.
  const source = card.kind === 'simplify' ? [card.page, card.page + 1].map(n => state.texts.get(n)?.text || '').join('\n') : '';
  return { open, P: MP.P, resolve: citeResolve, place: quotePlace, source, where: where(), pageLabel: pageLabel(card.page), live: live ? live.text : null, status: live?.status || '', pending: col.pending.get(card.id), writing: col.quiz.has(card.id), ...(thumb ? { thumb: thumb.url, thumbRatio: thumb.ratio } : {}) };
}
/** "Writing the next question…" keeps the card at the height it had (no jump); any other state lets it go. */
function holdQuizHeight(el, before) {
  if (el.querySelector('.mr-writing')) el.style.minHeight = Math.max(before, parseFloat(el.style.minHeight) || 0) + 'px';
  else el.style.removeProperty('min-height');
}
/** Draw a card into `el` when what it shows changed; true when it was drawn again. */
function drawCard(el, card, open) {
  card = quizLive(card);
  const sig = cardSig(card, open);
  if (el.dataset.sig === sig) return false;
  el.dataset.sig = sig; el.dataset.id = card.id;
  el.className = 'mr ' + TinctMargin.html.cardClass(card, open) + (el.classList.contains('is-floating') ? ' is-floating' : '') + (card.data?.unit ? ' is-unit' : '');
  if (card.kind === 'note') el.style.setProperty('--hl-color', (HL_COLORS.find(c => c[0] === card.color) || HL_COLORS[0])[3]);
  const field = el.querySelector('.mr-follow__input'), draft = field?.value, focused = field && document.activeElement === field;
  const closeFocused = !!document.activeElement?.matches?.('.mr-card__close') && el.contains(document.activeElement);
  const before = card.kind === 'quiz' && open ? el.offsetHeight : 0;
  el.innerHTML = TinctMargin.html.cardHtml(card, cardOpts(card, open));
  if (card.kind === 'quiz') holdQuizHeight(el, before);
  if (closeFocused) el.querySelector('.mr-card__close')?.focus({ preventScroll: true });
  if (open) { el.setAttribute('role', 'region'); el.setAttribute('aria-label', cardName(card)) } else { el.removeAttribute('role'); el.removeAttribute('aria-label') }
  const live = col.live.get(card.id);
  if (open && live && !live.status) el.setAttribute('aria-busy', 'true'); else el.removeAttribute('aria-busy');
  if (open && ((live && !live.text && !live.status) || col.pending.has(card.id))) {
    const ring = TinctWait.waitRing('Thinking…', { size: 18 }), slot = el.querySelector('.mr-wait');
    if (slot) slot.append(ring); else el.querySelector('.mr-card__body')?.append(ring);
  }
  const f = el.querySelector('.mr-follow__input');
  if (f && draft) { f.value = draft; f.classList.add('has-text'); fitFollow(f) }
  restoreDraft(f, card.id);
  if (f && focused) f.focus({ preventScroll: true });
  return true;
}
/** A quiz answer whose marking failed goes back into the card's field (once). */
function restoreDraft(f, id) {
  if (!f || !col.drafts.has(id)) return;
  if (!f.value) { f.value = col.drafts.get(id); f.classList.add('has-text'); fitFollow(f) }
  col.drafts.delete(id);
}
function layoutNow() {
  if (!col.el) return;
  const mode = marginMode();
  if (mode !== col.mode) {
    col.mode = mode;
    root.dataset.readerLayout = mode === 'focus' ? 'focus' : 'margin';
    reserveColumn(mode === 'column');
    if (mode !== 'column') { col.els.forEach(e => e.remove()); col.els.clear(); col.leads.replaceChildren() }
    if (mode !== 'marks') { col.marks?.replaceChildren(); closeFloat() }
    if (mode !== 'phone') closeSheet2();
    if (mode !== 'column') { primer.trig?.remove(); primer.trig = null }
    if (primer.el && (mode === 'phone' || !mode)) { primer.el.remove(); primer.el = null }
    if (mode === 'phone' && primer.open) openSheet2('primer');
    if (col.el) col.el.hidden = mode !== 'column';
    if (col.cover) col.cover.hidden = mode !== 'column';
    if (mode === 'phone' && col.open) { const o = col.open; col.open = null; openCard(o) }
  }
  if (!mode) return;
  if (!MP.P || !window.TinctWait) { mpReady.then(() => marginLayout()); return }
  if (wholeMovedOn()) col.open = null;
  const vis = visibleCards();
  underline(vis.find(v => v.card.id === col.open) || null);
  if (mode === 'column') return layoutColumn(vis);
  if (mode === 'focus') return layoutFocus(vis);
  // Marks: at the page's right edge, level with each passage's first line. Passages closer than a
  // mark's 28px target share one mark, which opens each of their cards in turn.
  const hdr = $('hdr').getBoundingClientRect().bottom, seen = new Set(), groups = [];
  for (const v of vis) {
    const y = (v.line.top + v.line.bottom) / 2, g = groups[groups.length - 1];
    if (g && y - g.y < 28) g.cards.push(v); else groups.push({ y, cards: [v] });
  }
  for (const g of groups) {
    const v = g.cards[0], id = v.card.id;
    seen.add(id);
    let m = col.marks.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (!m) { m = document.createElement('button'); m.type = 'button'; m.className = 'mr-mark'; m.dataset.id = id; col.marks.appendChild(m) }
    m.dataset.ids = g.cards.map(c => c.card.id).join(' ');
    m.setAttribute('aria-label', g.cards.map(c => cardName(c.card)).join(', '));
    m.style.left = Math.min(innerWidth - 14, v.pageRight + TinctMargin.COL.dot) + 'px';
    m.style.top = (g.y - hdr) + 'px';
    m.setAttribute('aria-expanded', String(g.cards.some(c => c.card.id === col.open)));
  }
  col.marks.querySelectorAll('.mr-mark:not([data-primer])').forEach(m => { if (!seen.has(m.dataset.id)) m.remove() });
  if (mode === 'marks') { placeFloat(vis.find(v => v.card.id === col.open)); const pr = pageRightNow(); primerMark(pr); placePrimerFloat(pr); return }
  col.marks.querySelector('.mr-mark[data-primer]')?.remove();
  // The phone: the trigger is the bottom card at a unit's start, until the reader closes it there or selects text.
  const trig = triggerUnit(), sheetId = col.sheet?.dataset.id;
  if (sheetId === 'trigger' && (!trig || mr || primer.away.has(trig.key))) { col.sheet.remove(); col.sheet = null }
  else if (!col.sheet && trig && !mr && !col.open && !primer.away.has(trig.key)) openSheet2('trigger');
  if (col.sheet) drawSheet();
  placeUndoFloat();
}
/** The floating undo line stays clear of the phone's bottom card: just above it when one is open. */
function placeUndoFloat() {
  if (!undo.el?.isConnected || !undo.el.classList.contains('is-float')) return;
  const top = col.sheet?.isConnected ? col.sheet.getBoundingClientRect().top : innerHeight;
  undo.el.style.bottom = top < innerHeight ? Math.round(innerHeight - top + 12) + 'px' : '';
}
/** A page's right edge: a PDF page's own, an EPUB chapter's sheet (its text sits inside the sheet's margins). */
const pageEdge = p => (p.kind === 'epub' ? p.sheet : p.pg).getBoundingClientRect().right;
/** The page's visible right edge (the first page in view). */
function pageRightNow() {
  const sr = $('scroll').getBoundingClientRect(), p = state.pages.find(q => q.pg.getBoundingClientRect().bottom > sr.top) || state.pages[0];
  return Math.min(pageEdge(p), sr.left + pagesWidth());
}
function layoutColumn(vis) {
  const C = TinctMargin.COL, sr = $('scroll').getBoundingClientRect();
  const pageRight = vis[0]?.pageRight ?? pageRightNow();
  const box = TinctMargin.columnBox(innerWidth, pageRight);
  if (!box) return;
  col.el.style.left = box.left + 'px';
  const area = pagesWidth();
  Object.assign(col.cover.style, { left: sr.left + area + 'px', top: sr.top + 'px', width: Math.max(0, $('scroll').clientWidth - area) + 'px' });
  // No foot: the cards keep COL.foot (46px) clear of the column's end, an open card too (its guard's --mr-foot-height).
  const colTop = col.el.getBoundingClientRect().top, colH = col.el.clientHeight, footTop = colH;
  col.el.style.setProperty('--mr-col-height', colH + 'px');
  col.el.style.setProperty('--mr-foot-height', C.foot + 'px');
  // The primer, open, has the column to itself (mockup section 4); its trigger keeps the column's top.
  if (primerInColumn()) {
    primer.trig?.remove(); primer.trig = null;
    col.els.forEach(e => { e.hidden = true }); col.stack.hidden = true; col.leads.replaceChildren();
    return;
  }
  // The trigger is placed with the cards, level with its page's first line of text (less 4px, as a card).
  const trig = triggerInColumn(colTop);
  // An open card stops at the column's foot as the guard says, less the trigger's room.
  col.el.style.setProperty('--mr-reserve', (trig ? trig.height + TinctMargin.COL.cardGap : 0) + 'px');
  // The whole-PDF card (when the thread has turns) sits first, at the top; then a unit's quiz, when open or at the unit's start.
  const items = [];
  if (chat.turns.length || chat.live || col.open === 'whole') items.push({ id: 'whole', card: { id: 'whole', kind: 'whole' }, top: 0, fold: false });
  const openUnit = col.open && cardById(col.open)?.data?.unit ? cardById(col.open) : null, trigUnit = triggerUnit();
  const uq = openUnit || (trigUnit && unitQuiz(trigUnit));
  if (uq) items.push({ id: uq.id, card: uq, top: 0, fold: false });
  for (const v of vis) items.push({ id: v.card.id, card: v.card, v, top: v.line.top - colTop });
  // In page order among the cards: after the ones pinned to the top, before the first passage below its line.
  if (trig) { const k = items.findIndex(it => it.v && it.top > trig.top); items.splice(k < 0 ? items.length : k, 0, { id: 'trigger', trigger: true, top: trig.top, fold: false }) }
  // "Deleted · Undo" keeps the deleted card's place for a few seconds (deleteCard), placed with the cards.
  const undoAt = undoTop(colTop, colH);
  if (undo.el && !undo.el.classList.contains('is-float')) undo.el.hidden = undoAt == null;
  if (undoAt != null) { if (undo.el.parentElement !== col.el) col.el.insertBefore(undo.el, col.stack); const k = items.findIndex(it => it.v && it.top > undoAt); items.splice(k < 0 ? items.length : k, 0, { id: 'undo', undo: true, top: undoAt, fold: false }) }
  const keep = new Set(items.map(i => i.id));
  for (const [id, el] of col.els) if (!keep.has(id)) { el.remove(); col.els.delete(id) }
  for (const it of items) {
    if (it.trigger || it.undo) continue;
    let el = col.els.get(it.id);
    if (!el) { el = document.createElement('div'); col.els.set(it.id, el); col.el.insertBefore(el, col.stack) }
    el.hidden = false;
    if (it.id === 'whole') drawWhole(el); else drawCard(el, it.card, col.open === it.id);
    // Measured as a folded card; placement says which become one-line rows.
    el.classList.remove('is-row');
  }
  // The row's height on one line ("1 more on this page"), measured once.
  if (!col.stackH) { const was = col.stack.hidden; col.stack.hidden = false; col.stack.innerHTML = TinctMargin.html.stackHtml([{ kind: 'note' }], Infinity, { doc: docKind() }); col.stackH = col.stack.offsetHeight || 34; col.stack.hidden = was }
  const stackH = col.stackH;
  // A one-line row's height (crowded pages), measured once.
  if (!col.rowH) {
    const r = document.createElement('div'); r.className = 'mr mr-card is-folded is-row'; r.style.visibility = 'hidden';
    r.innerHTML = TinctMargin.html.cardHtml({ id: 'row', kind: 'note', note: 'A row', text: '' }, { open: false, P: MP.P });
    col.el.appendChild(r); col.rowH = r.offsetHeight || TinctMargin.COL.row; r.remove();
  }
  const elOf = it => (it.trigger ? primer.trig : it.undo ? undo.el : col.els.get(it.id));
  // A quiz whose questions are still streaming in (col.quiz) never folds or gathers; once saved it does, like any card.
  const out = TinctMargin.placeCards(items.map(i => ({ id: i.id, top: i.top, at: i.card?.at, fold: i.fold !== false && col.open !== i.id && !col.quiz.has(i.id), keep: !!i.trigger || !!i.undo || col.quiz.has(i.id) })), items.map(i => elOf(i).offsetHeight), footTop, { open: col.open, stackHeight: stackH, rowHeight: col.rowH });
  const at = new Map(out.positions.map(p => [p.id, p]));
  const x1 = box.left - 6, lines = [];
  for (const it of items) {
    const el = elOf(it), p = at.get(it.id);
    if (it.trigger || it.undo) { el.style.top = (p ? p.top : 0) + 'px'; continue }
    if (!p) { el.hidden = true; continue }
    el.classList.toggle('is-row', !!p.row);
    el.style.top = p.top + 'px';
    if (!it.v) continue;
    const lab = el.querySelector('.mr-card__label').getBoundingClientRect();
    const ey = (it.v.line.top + it.v.line.bottom) / 2, cy = (lab.top + lab.bottom) / 2, x0 = it.v.pageRight + C.dot;
    lines.push({ x0, ey, cy, open: it.id === col.open });
  }
  const gathered = out.gathered.map(id => items.find(i => i.id === id && !i.trigger && !i.undo)).filter(Boolean);
  col.stack.hidden = !out.stack;
  if (out.stack) {
    // One line: as many of the kinds as fit.
    const kinds = new Set(gathered.map(g => g.card.kind)).size;
    for (let k = kinds; k >= 1; k--) { col.stack.innerHTML = TinctMargin.html.stackHtml(gathered.map(g => g.card), k, { doc: docKind() }); if (col.stack.offsetHeight <= stackH + 1) break }
    col.stack.dataset.first = gathered[0]?.id || '';
    col.stack.style.top = out.stack.top + 'px';
    const cy = colTop + out.stack.top + col.stack.offsetHeight / 2;
    for (const g of gathered) if (g.v) lines.push({ x0: g.v.pageRight + C.dot, ey: (g.v.line.top + g.v.line.bottom) / 2, cy, open: false });
  }
  col.leads.innerHTML = lines.map(l => { const f = l.open ? '' : ' class="is-folded"'; return `<circle${f} cx="${l.x0.toFixed(1)}" cy="${l.ey.toFixed(1)}" r="${C.r}"/><path${f} d="${TinctMargin.leadPath(l.x0, l.ey, x1, l.cy)}"/>` }).join('');
}
/** The open card's passage: a 1.5px underline in the lead colour, on the page. */
function underline(v) {
  document.querySelectorAll('.mr-ul-layer').forEach(l => { if (!v || l.dataset.id !== v.card.id) { l.replaceChildren(); delete l.dataset.id } });
  if (!v) return;
  for (const a of TinctMargin.anchorOfCard(v.card)) {
    const p = state.pages[a.n - 1]; if (!p) continue;
    const layer = layerOf(p, 'mr-ul-layer'); layer.classList.add('mr');
    if (layer.dataset.id === v.card.id) continue;
    layer.dataset.id = v.card.id;
    // A figure's open card rings its figure instead of underlining it.
    for (const r of v.card.rects.filter(r => r[0] === a.n)) { const i = document.createElement('i'); if (v.card.kind === 'figure') { i.className = 'is-box'; Object.assign(i.style, { left: r[1] * 100 + '%', top: r[2] * 100 + '%', width: r[3] * 100 + '%', height: r[4] * 100 + '%' }) } else Object.assign(i.style, { left: r[1] * 100 + '%', top: (r[2] + r[4]) * 100 + '%', width: r[3] * 100 + '%' }); layer.appendChild(i) }
  }
}

/* -- Opening and folding: one card open at a time -- */
function openCard(id, { focus = false } = {}) {
  const mode = marginMode();
  // One open at a time: a card opening folds the primer back to its trigger.
  if (id && primer.open) { primer.open = false; primer.token++; primer.el?.remove(); primer.el = null }
  if (col.open && col.open !== id) dropEmptyFigure(col.open);
  col.open = id || null;
  if (id === 'whole') col.whole.page = state.pages.length ? placePage() : null;
  if (mode === 'phone') { if (id) openSheet2(id); else closeSheet2() }
  if (mode === 'marks' && !id) closeFloat();
  // A card whose passage is out of view brings it into view.
  if (id && id !== 'whole') {
    const card = viewCards().find(c => c.id === id) || cardById(id);
    if (card && mode !== 'phone' && !card.data?.unit) {
      const f = TinctMargin.firstRect(card), p = state.pages[f[0] - 1], sr = $('scroll').getBoundingClientRect();
      if (p) { const b = p.pg.getBoundingClientRect(), y = b.top + f[2] * b.height; if (y < sr.top + 40 || y > sr.bottom - 120) goTo({ page: f[0], frac: Math.max(0, f[2] - 0.08) }, true) }
    }
  }
  marginLayout();
  // focus: true puts it in the follow-up line; 'card' on the card itself (its close, or the bottom card's handle), no keyboard.
  if (focus) requestAnimationFrame(() => requestAnimationFrame(() => openCardEl()?.querySelector(focus === 'card' ? '.mr-card__close, .mr-sheet__grab' : '.mr-follow__input')?.focus({ preventScroll: true })));
}
const openCardEl = () => (col.sheet && col.sheet.isConnected ? col.sheet : col.float && col.float.isConnected ? col.float : col.els.get(col.open)) || null;
function placeFloat(v, { popup = false } = {}) {
  // A unit's quiz (from the primer) has no passage in view: it floats at the top, as the whole-PDF card does.
  const unitCard = !v && col.open && col.open !== 'whole' ? cardById(col.open) : null;
  // Focus view's window stays open while its passage is scrolled away (the book reader's does too).
  const card = col.open === 'whole' ? null : v?.card || (unitCard && (popup || unitCard.data?.unit) ? unitCard : null);
  if (!col.open || (!card && col.open !== 'whole')) { closeFloat(); return }
  if (!col.float) { col.float = document.createElement('div'); bindCardEvents(col.float); root.appendChild(col.float) }
  const el = col.float;
  el.classList.add('is-floating');
  if (card) drawCard(el, card, true); else { el.className = 'mr mr-card is-open is-floating is-whole'; drawWhole(el) }
  el.classList.toggle('is-popup', popup);
  if (popup) { el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', card ? cardName(card) : 'Chat'); return placePopupEl(el, v ? anchorRects(TinctMargin.anchorOfCard(v.card)) : null, v?.pageRight) }
  const hdr = $('hdr').getBoundingClientRect().bottom, room = innerHeight - hdr - 32;
  el.style.setProperty('--mr-col-height', room + 28 + 'px'); el.style.setProperty('--mr-foot-height', '0px');
  const x = v ? v.pageRight + TinctMargin.COL.dot : innerWidth - 16;
  const left = x + 14 + 380 <= innerWidth - 16 ? x + 14 : Math.max(16, x - 14 - 380);
  el.style.left = left + 'px';
  // Beside the mark and clear of the passage: below its last line when there is room, else above its first.
  const h = el.offsetHeight;
  let want = hdr + 16;
  if (v) want = v.last + 12 + h <= innerHeight - 16 ? v.last + 12 : v.line.top - 12 - h >= hdr + 16 ? v.line.top - 12 - h : v.line.top - TinctMargin.COL.lift;
  el.style.top = Math.max(hdr + 16, Math.min(want, innerHeight - 16 - h)) + 'px';
}
function closeFloat() { col.float?.remove(); col.float = null }

/* -- Focus view: the page in the middle, no column or marks; a card opens in a pop-up window (the book
   reader's Explain window) beside the page, or below or above its passage (TinctReaderLayout.placePopup) -- */
function layoutFocus(vis) {
  col.marks.querySelectorAll('.mr-mark:not([data-primer])').forEach(m => m.remove());
  col.leads.replaceChildren();
  const pr = pageRightNow();
  // Before you start keeps its mark at the unit's first page; open, it is a pop-up window too.
  primerMark(pr);
  placeFloat(vis.find(v => v.card.id === col.open), { popup: true });
  if (primer.open) { placePrimerFloat(pr); placePopupEl(primer.el, null) }
}
/** The reader's box for a pop-up: below the top bar; on the phone, above the keyboard. */
function popupFrame() {
  const hdr = $('hdr').getBoundingClientRect().bottom, vv = window.visualViewport;
  const bottom = isPhone() && vv ? Math.min(innerHeight, vv.height + vv.offsetTop) : innerHeight;
  return { left: 0, top: hdr, right: innerWidth, bottom };
}
function placePopupEl(el, rects, pageRight = null) {
  if (!el) return;
  const frame = popupFrame();
  const passage = rects?.length ? rects.reduce((a, r) => ({ left: Math.min(a.left, r.left), top: Math.min(a.top, r.top), right: Math.max(a.right, r.right), bottom: Math.max(a.bottom, r.bottom) }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }) : null;
  el.classList.add('is-popup');
  // Measured at its natural height (as tall as the frame allows), then placed and held inside the frame.
  const tall = Math.max(120, frame.bottom - frame.top - 24);
  el.style.width = (isPhone() ? frame.right - frame.left - 24 : Math.min(380, frame.right - frame.left - 32)) + 'px';
  el.style.setProperty('--mr-col-height', tall + 28 + 'px'); el.style.setProperty('--mr-foot-height', '0px'); el.style.maxHeight = tall + 'px';
  const at = TinctReaderLayout.placePopup({ frame, passage, pageRight, h: el.offsetHeight, phone: isPhone() });
  el.style.setProperty('--mr-col-height', at.maxHeight + 28 + 'px'); el.style.maxHeight = at.maxHeight + 'px';
  Object.assign(el.style, { left: at.left + 'px', top: at.top + 'px', width: at.width + 'px' });
  el.dataset.side = at.side;
}

/* -- The phone's bottom card -- */
function openSheet2(id) {
  if (!col.sheet) {
    const el = col.sheet = document.createElement('div');
    el.className = 'mr mr-sheet'; el.setAttribute('role', 'dialog');
    bindCardEvents(el); sheetSwipe(el);
  }
  col.sheet.classList.remove('is-full');
  col.sheet.dataset.id = id; delete col.sheet.dataset.sig;
  if (!col.sheet.isConnected) root.appendChild(col.sheet);
  drawSheet();
  fitKeyboard();
  requestAnimationFrame(passageAboveSheet);
}
// The page scrolls so the passage sits just above the bottom card, still underlined.
function passageAboveSheet() {
  const id = col.sheet?.dataset.id;
  const card = id && id !== 'whole' && (viewCards().find(c => c.id === id) || cardById(id)); if (!card || card.data?.unit) return;
  const rects = anchorRects(TinctMargin.anchorOfCard(card)); if (!rects.length) return;
  const top = Math.min(...rects.map(r => r.top)), bottom = Math.max(...rects.map(r => r.bottom));
  const sheetTop = col.sheet.getBoundingClientRect().top, hdr = $('hdr').getBoundingClientRect().bottom;
  const want = Math.max(hdr + 12, sheetTop - 16 - (bottom - top));
  if (Math.abs(top - want) > 4) $('scroll').scrollBy({ top: top - want });
  marginLayout();
}
function drawSheet() {
  const el = col.sheet; if (!el) return;
  const id = el.dataset.id;
  if (id === 'whole') { el.setAttribute('aria-label', 'Chat'); drawWhole(el, { sheet: true }); return }
  if (id === 'primer') { el.setAttribute('aria-label', 'Before you start'); drawPrimer(el, { sheet: true }); return }
  if (id === 'trigger') {
    const unit = triggerUnit(); if (!unit) return;
    el.setAttribute('aria-label', 'Before you start');
    if (el.dataset.sig === 'trigger:' + unit.key) return;
    el.dataset.sig = 'trigger:' + unit.key;
    el.innerHTML = TinctMargin.html.sheetHtml(`<button type="button" class="mr-trigger" data-c="primer" aria-expanded="false">${TinctMargin.html.triggerHtml(unit, { key: false })}</button>`);
    return;
  }
  const kept = viewCards().find(c => c.id === id) || cardById(id); if (!kept) { closeSheet2(); return }
  const card = quizLive(kept);
  el.setAttribute('aria-label', cardName(card));
  const sig = cardSig(card, true);
  if (el.dataset.sig === sig) return;
  const field = el.querySelector('.mr-follow__input'), draft = field?.value, focused = field && document.activeElement === field;
  const closeFocused = !!document.activeElement?.matches?.('.mr-card__close') && el.contains(document.activeElement);
  el.dataset.sig = sig;
  const before = card.kind === 'quiz' ? el.offsetHeight : 0;
  el.innerHTML = TinctMargin.html.sheetHtml(TinctMargin.html.cardHtml(card, cardOpts(card, true)));
  if (card.kind === 'quiz') holdQuizHeight(el, before);
  if (closeFocused) el.querySelector('.mr-card__close')?.focus({ preventScroll: true });
  const live = col.live.get(card.id);
  if ((live && !live.text && !live.status) || col.pending.has(card.id)) (el.querySelector('.mr-wait') || el.querySelector('.mr-card__body'))?.append(TinctWait.waitRing('Thinking…', { size: 18 }));
  const f = el.querySelector('.mr-follow__input');
  if (f && draft) { f.value = draft; f.classList.add('has-text'); fitFollow(f) }
  restoreDraft(f, card.id);
  if (f && focused) f.focus({ preventScroll: true });
  // The card grew (its answer arrived): the passage moves up to stay just above it.
  const h = el.offsetHeight;
  if (h !== Number(el.dataset.h || 0)) { el.dataset.h = h; requestAnimationFrame(passageAboveSheet) }
}
function closeSheet2() {
  if (!col.sheet) return;
  const id = col.sheet.dataset.id;
  // The primer folds back to its trigger; the trigger, closed, stays away at this unit's start.
  if (id === 'primer') { primer.open = false; primer.token++ }
  // The trigger closed stays away at this unit's start; so does it after a card is closed there (× or a swipe),
  // or the trigger would take the card's place at once and the card seem never to close (MacKay on a phone,
  // the night checklist of 15 Oct 2026).
  if (id !== 'primer') { const u = currentUnit(); if (u) primer.away.add(u.key) }
  col.sheet.remove(); col.sheet = null;
  if (marginMode() === 'phone') { dropEmptyFigure(col.open); col.open = null; marginLayout() }
}
function sheetSwipe(el) {
  let y0 = null, full = false;
  el.addEventListener('pointerdown', e => { if (e.target.closest('textarea, a, .mr-card__body button, .mr-follow')) return; y0 = e.clientY; full = el.classList.contains('is-full') });
  el.addEventListener('pointerup', e => {
    if (y0 == null) return;
    const dy = e.clientY - y0; y0 = null;
    if (dy < -40) el.classList.add('is-full');
    else if (dy > 60) { if (full) el.classList.remove('is-full'); else closeSheet2() }
  });
  el.addEventListener('pointercancel', () => { y0 = null });
  // A touch swipe on the card's body keeps its own scroll; on the grab and the label it moves the card.
  el.addEventListener('touchstart', e => { if (e.target.closest('.mr-sheet__grab, .mr-card__label, .mr-divider')) { y0 = e.touches[0].clientY; full = el.classList.contains('is-full') } }, { passive: true });
  el.addEventListener('touchend', e => {
    if (y0 == null) return;
    const dy = (e.changedTouches[0]?.clientY ?? y0) - y0; y0 = null;
    if (dy < -40) el.classList.add('is-full'); else if (dy > 60) { if (full) el.classList.remove('is-full'); else closeSheet2() }
  });
}
// The keyboard: the bottom card rides above it, so the follow-up line stays in view.
// With the keyboard open the card leaves room above it for the passage (a few lines under the top bar).
function fitKeyboard() {
  const vv = window.visualViewport, el = col.sheet; if (!el) return;
  const kb = vv ? Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop)) : 0;
  el.style.setProperty('--mr-kb', kb + 'px'); el.classList.toggle('is-kb', kb > 0);
  el.style.maxHeight = kb > 0 ? Math.max(160, Math.round(vv.height + vv.offsetTop - $('hdr').getBoundingClientRect().bottom - 72)) + 'px' : '';
}
window.visualViewport?.addEventListener('resize', () => { if (!col.sheet) return; fitKeyboard(); requestAnimationFrame(passageAboveSheet) });

/**
 * Chat, open beside the pages, folds when the reader moves on to another page (Anders, 15 Oct: it must
 * not take over the margin), unless its field has the focus or an answer is on its way. Not the phone's card.
 */
function wholeMovedOn() {
  if (col.open !== 'whole' || col.sheet || chat.live || col.whole.page == null || !state.pages.length) return false;
  const el = openCardEl();
  if (el && el.contains(document.activeElement)) { col.whole.page = placePage(); return false }
  return placePage() !== col.whole.page;
}
/* -- The whole-PDF thread, in its card or the phone's card -- */
function wholeTurns() {
  const turns = chat.turns.map(t => ({ role: t.role, text: t.role === 'user' ? (t.display || t.content) : String(t.content || '').replace(/\n\n\*(Claude can’t|That image)[^*]*\*/g, ''), at: t.at, place: placeOf(t), quote: t.role === 'user' ? t.passage : undefined, note: t.failed ? `No answer — ${t.failed}` : undefined }));
  if (chat.live) turns.push({ role: 'assistant', text: chat.live.text, at: Date.now(), place: turns.at(-1)?.place });
  return turns;
}
function drawWhole(el, { sheet = false } = {}) {
  const open = sheet || col.open === 'whole', turns = wholeTurns();
  // Before the shared thread module has loaded, the turns in order (no dividers); it redraws with them.
  const rows = TC ? TC.threadRows(turns) : turns.map((_, index) => ({ type: 'turn', index }));
  if (!TC) tcReady.then(() => marginLayout());
  const body = MP.P ? TinctMargin.html.threadHtml(rows, turns, { P: MP.P, resolve: citeResolve }) : '';
  const tray = chat.attach.length ? `<div class="byob-tray">${trayChips()}</div>` : '';
  const sig = JSON.stringify([open, sheet, body.length, body.slice(-200), tray.length, !!chat.live, col.whole.status || '']);
  if (el.dataset.sig === sig) return;
  el.dataset.sig = sig; el.dataset.id = 'whole';
  if (!sheet) el.className = `mr mr-card ${open ? 'is-open' : 'is-folded'} is-whole${el.classList.contains('is-floating') ? ' is-floating' : ''}`;
  const field = el.querySelector('.mr-follow__input'), draft = field?.value, focused = field && document.activeElement === field;
  const old = el.querySelector('.mr-card__body'), kept = old ? { top: old.scrollTop, end: old.scrollHeight - old.scrollTop - old.clientHeight < 8 } : null;
  const last = [...chat.turns].reverse().find(t => t.role === 'assistant');
  const inner = TinctMargin.html.wholeHtml(body, { open, tray, label: !sheet, doc: docKind(), fold: last ? TinctMargin.html.foldText({ kind: 'explain', turns: [last] }, MP.P) : '' });
  el.innerHTML = sheet ? TinctMargin.html.sheetHtml(inner) : inner;
  const b = el.querySelector('.mr-card__body');
  if (b) {
    if (chat.live && !chat.live.text) b.append(TinctWait.waitRing('Thinking…', { size: 18 }));
    // The thread opens at its end; while an answer arrives it stays where the reader put it.
    b.scrollTop = !kept || kept.end ? b.scrollHeight : kept.top;
  }
  el.querySelectorAll('[data-rm]').forEach(x => x.onclick = () => { chat.attach.splice(Number(x.dataset.rm), 1); marginLayout() });
  const f = el.querySelector('.mr-follow__input');
  if (f && draft) { f.value = draft; f.classList.add('has-text'); fitFollow(f) }
  if (f && focused) f.focus({ preventScroll: true });
}
function trayChips() { return chat.attach.map((a, i) => `<span class="byob-chip">${a.thumb ? `<img src="${a.thumb}" alt="">` : '<i>Snip</i>'}<span class="byob-chip-label">${a.snip ? `${KIND[a.kind] || 'Snip'} · p. ${a.page}` : 'Image'}</span><button type="button" aria-label="Remove image" data-rm="${i}">×</button></span>`).join('') }
/** Chat about the whole file (the t menu's Chat, or the slash key): its card opens; a question goes to today's ask. */
function openWhole(opts = {}) {
  loadTurns();
  col.whole.page = state.pages.length ? placePage() : null;
  if (opts.passage) chat.passage = opts.passage;
  if (opts.explanation) {
    chat.turns.push({ role: 'user', content: 'Explain this passage.', passage: opts.passage.text, page: opts.passage.page, at: Date.now() });
    chat.turns.push({ role: 'assistant', content: opts.explanation, at: Date.now() });
    saveTurns();
  }
  if (marginMode() === 'phone') { col.open = 'whole'; openSheet2('whole') }
  else {
    openCard('whole');
    // The earlier conversation shows at once, drawn now from this browser's copy, not a frame later.
    if (col.raf) { cancelAnimationFrame(col.raf); col.raf = 0 }
    try { layoutNow() } catch (e) { console.error(e) }
  }
  if (opts.prompt) ask(opts.prompt, opts.display);
  else if (!opts.quiet) {
    // Its field takes the keys at once ("/" then typing: no letter may reach the page's own keys), and again once drawn.
    const focus = () => openCardEl()?.querySelector('.mr-follow__input')?.focus({ preventScroll: true });
    focus(); requestAnimationFrame(() => requestAnimationFrame(focus));
  }
}

/* -- What a card does: open, close, copy, follow up, quiz, citations, dictation -- */
function bindCardEvents(host) {
  host.addEventListener('mousedown', e => { if (e.target.closest('.mr-cite, [data-c]') && !e.target.closest('textarea')) e.preventDefault() });
  host.addEventListener('click', e => {
    // A host inside another (the primer in the column) handles its click once.
    if (e.mrDone) return; e.mrDone = true;
    const row = e.target.closest('.mr-map__row[data-page]');
    if (row) { goToCite(Number(row.dataset.page), ''); return }
    // Related: a place scrolls the file there and underlines it briefly.
    const rel = e.target.closest('.mr-related__row[data-page]');
    if (rel) { goToPlace(Number(rel.dataset.page), { needle: rel.dataset.needle || '', quote: rel.dataset.quote || '' }); return }
    const pb = e.target.closest('.mr-primer [data-c], .mr-trigger');
    if (pb) {
      const c = pb.dataset.c;
      if (c === 'close') { if (host === col.sheet) closeSheet2(); else closePrimer(); return }
      if (c === 'redo') { if (primer.unit) loadPrimer(primer.unit, { redo: true }); return }
      if (c === 'quiz') return quizUnit();
      if (pb.classList.contains('mr-trigger')) return openPrimer(triggerUnit() || currentUnit());
    }
    const cite = e.target.closest('.mr-cite');
    if (cite) { goToCite(Number(cite.dataset.page), cite.dataset.needle || ''); return }
    const card = e.target.closest('.mr-card, .mr-sheet'), b = e.target.closest('[data-c]');
    const id = card?.dataset.id || host.dataset?.id;
    if (!b) { if (card?.classList.contains('is-folded')) openCard(card.dataset.id); return }
    const c = b.dataset.c;
    if (c === 'stack') return openCard(b.dataset.first || null);
    // From the keyboard (no pointer: detail 0) the focus follows: into the opened card, back to the folded one.
    const keyed = e.detail === 0, refocus = sel => requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector(sel)?.focus({ preventScroll: true })));
    if (c === 'open') { openCard(id); if (keyed) refocus(`.mr-card.is-open[data-id="${CSS.escape(id)}"] .mr-card__close`); return }
    if (c === 'close') { if (host === col.sheet) closeSheet2(); else { openCard(null); if (keyed && id) refocus(`.mr-col .mr-card[data-id="${CSS.escape(id)}"] .mr-card__label`) } return }
    if (c === 'grab') { col.sheet?.classList.toggle('is-full'); return }
    if (c === 'mic') { const f = b.closest('.mr-follow')?.querySelector('.mr-follow__input'); if (f) { dictation.target = b; dictation.toggle(f) } return }
    if (c === 'copy') return copyCard(id);
    if (c === 'delete') return deleteCard(id);
    if (c === 'show' || c === 'next' || c === 'again') return quizStep(id, c);
  });
  host.addEventListener('input', e => { if (e.target.matches('.mr-follow__input')) { e.target.classList.toggle('has-text', !!e.target.value); fitFollow(e.target) } });
  host.addEventListener('keydown', e => {
    if (!e.target.matches('.mr-follow__input')) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); e.target.blur(); openCard(null); return }
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    e.preventDefault();
    const text = e.target.value.trim(); if (!text) return;
    const id = e.target.closest('[data-id]')?.dataset.id;
    e.target.value = ''; e.target.classList.remove('has-text'); fitFollow(e.target); dictation.stop();
    followUp(id, text);
  });
}
function fitFollow(t) { t.style.height = '18px'; t.style.height = Math.min(t.scrollHeight, 54) + 'px' }
function followUp(id, text) {
  if (id === 'whole') { openWhole({ quiet: true }); ask(text); return }
  const card = cardById(id); if (!card) return;
  if (card.kind === 'quiz') return quizCheck(card, text);
  if (card.kind === 'note' || id.startsWith('n-')) {
    // A follow-up on a note asks about its passage: an Ask card for it.
    const v = viewCards().find(c => c.id === id); if (!v) return;
    const ask_ = TinctMargin.newCard({ kind: 'ask', page: v.page, anchor: TinctMargin.anchorOfCard(v), text: v.text, turns: [{ role: 'user', content: text, at: Date.now() }] });
    saveCard(ask_); openCard(ask_.id); runCard(ask_.id, text); return;
  }
  card.turns = [...(card.turns || []), { role: 'user', content: text, at: Date.now() }];
  saveCard(card); runCard(card.id, text);
}
async function copyCard(id) {
  const card = id === 'whole' ? null : viewCards().find(c => c.id === id);
  const plain = t => String(t || '').replace(/\n{3,}/g, '\n\n').trim();
  let text = '';
  if (!card) text = plain([...chat.turns].reverse().find(t => t.role === 'assistant')?.content);
  else if (card.kind === 'note') text = plain(card.note);
  else if (card.kind === 'define') text = (card.data?.senses || []).map((s, i) => `${i + 1}. ${s.text}`).join('\n') || plain(card.data?.line);
  else text = (card.turns || []).filter(t => t.role === 'assistant').map(t => plain(t.content)).join('\n\n');
  try { await navigator.clipboard.writeText(text); toast('Copied.') } catch { toast('Copy did not work here. Use your device’s copy instead.') }
}

/* -- Delete (Anders, 15 Oct): every margin item, from the bin beside copy. No confirm: a quiet
   "Deleted · Undo" line stays for a few seconds where the card was (the column), or along the bottom
   (narrow windows, the phone). A card goes as a tombstone through the card sync; a note's card takes its
   note, and its highlight when the note made it (TinctMargin.deletePlan). -- */
function deleteCard(id) {
  const view = viewCards().find(c => c.id === id) || cardById(id); if (!view) return;
  const kept = view.kind === 'note' ? null : cardById(id);
  const marks = highlights(), plan = TinctMargin.deletePlan(view, marks);
  const touched = new Set([...plan.removeMarks, ...(plan.clearNote ? [plan.clearNote] : [])]);
  const before = { card: kept ? JSON.parse(JSON.stringify(kept)) : null, marks: marks.filter(m => touched.has(m.id)).map(m => JSON.parse(JSON.stringify(m))) };
  col.ctl.get(id)?.abort(); col.ctl.delete(id); col.live.delete(id); col.quiz.delete(id); col.pending.delete(id); col.drafts.delete(id);
  const wasOpen = col.open === id;
  if (wasOpen) { col.open = null; if (col.sheet) { col.sheet.remove(); col.sheet = null } closeFloat() }
  if (plan.card) { store.set('cards:' + state.key, keptCards().map(c => (c.id === id ? TinctMargin.tombstone(id) : c))); cardsSync.changed() }
  for (const mid of plan.removeMarks) removeHighlight(mid);
  if (plan.clearNote) {
    const list = highlights(), h = list.find(x => x.id === plan.clearNote);
    if (h) { delete h.note; delete h.withNote; h.u = Date.now(); putHighlights(list); renderHighlights(state.pages[h.page - 1]) }
  }
  col.view = null; strip?.marksChanged();
  showUndo(TinctMargin.firstRect(view), () => {
    if (before.card) { store.set('cards:' + state.key, [...keptCards().filter(c => c.id !== before.card.id), { ...before.card, u: Date.now() }]); cardsSync.changed() }
    if (before.marks.length) {
      const back = new Set(before.marks.map(m => m.id)), now = Date.now();
      store.set('hl-gone:' + state.key, (store.get('hl-gone:' + state.key) || []).filter(g => !back.has(g.id)));
      putHighlights([...highlights().filter(m => !back.has(m.id)), ...before.marks.map(m => ({ ...m, u: now }))]);
      for (const m of before.marks) renderHighlights(state.pages[m.page - 1]);
    }
    col.view = null; strip?.marksChanged();
    if (wasOpen) openCard(id); else marginLayout({ fresh: true });
  });
  marginLayout({ fresh: true });
  announce('Deleted.');
}
/** The quiet "Deleted · Undo" line, for UNDO_MS; Undo puts everything back. */
function showUndo(rect, restore) {
  clearTimeout(undo.timer);
  if (!undo.el) {
    const el = undo.el = document.createElement('div');
    el.className = 'mr mr-undo'; el.setAttribute('role', 'status');
    el.innerHTML = '<span>Deleted</span><span aria-hidden="true">·</span><button type="button" data-u="undo">Undo</button>';
    el.addEventListener('mousedown', e => e.preventDefault());
    el.querySelector('[data-u]').addEventListener('click', () => { const r = undo.restore; hideUndo(); r?.() });
  }
  undo.rect = rect; undo.restore = restore;
  // The column places it with the cards (layoutColumn); elsewhere it floats along the bottom.
  const inColumn = marginMode() === 'column';
  undo.el.classList.toggle('is-float', !inColumn);
  if (!inColumn) { undo.el.hidden = false; root.appendChild(undo.el); placeUndoFloat() }
  undo.timer = setTimeout(hideUndo, UNDO_MS);
}
function hideUndo() { clearTimeout(undo.timer); undo.timer = 0; undo.restore = null; undo.rect = null; undo.el?.remove(); marginLayout() }
/** The undo line's top in the column: the deleted card's passage, when its page is drawn. -> px from the column's top, or null */
function undoTop(colTop, colH) {
  if (!undo.el || !undo.rect || undo.el.classList.contains('is-float')) return null;
  const p = state.pages[undo.rect[0] - 1]; if (!p) return null;
  const b = p.pg.getBoundingClientRect(), y = b.top + undo.rect[2] * b.height - colTop;
  return y > -40 && y < colH ? Math.max(0, y) : null;
}

/* -- The actions: each answer becomes a card -- */
// A card's thread as today's ask: the passage, what the card said, and the follow-up questions.
// `fig`: { named } when the picture is a figure the passage or question names (item 7); { sketch } for a figure's card without its picture.
function cardTurns(card, image, fig = {}) {
  const at = isEpub() ? `chapter ${pageLabel(card.page)}` : `page ${pageLabel(card.page)}`;
  const imageLine = !image ? '' : fig.named ? ` The attached image is ${fig.named.label} on page ${pageLabel(fig.named.page)}, as printed, which the passage or question refers to: look at it carefully (axes, labels, curves, colours, notation) and answer about it first, using the text for context.` : ' ' + MP.P.PASSAGE_IMAGE_LINE;
  const rules = card.kind === 'figure' ? figureRules(card, image, fig.sketch) : `You are Tinct's reading companion. ${bookLine()} They are on ${at} of ${state.pages.length}.\nAnswer conversationally and concisely (usually under 150 words unless asked for more). Ground answers in the text; say when something is not in it. Plain prose only.${imageLine}\n\nThe passage they selected on ${at}:\n${card.text.slice(0, 3000)}`;
  const what = card.data?.region === 'formula' ? 'formula' : 'figure';
  const lead = { explain: 'Explain this passage.', simplify: 'Simplify this passage.', factcheck: 'Fact-check this passage.', related: 'Where else does the text take this up?', counterpoint: 'Give the strongest objection to this passage.', define: 'Define this word.', figure: `Explain this ${what}.` }[card.kind];
  const turns = (card.turns || []).slice(-11).map(t => ({ role: t.role, content: t.content }));
  if (lead && (turns[0]?.role === 'assistant' || (card.kind === 'figure' && !turns.length))) turns.unshift({ role: 'user', content: lead });
  return [{ role: 'user', content: rules }, ...turns];
}
/** A figure's card: its thread is about this one figure (item 4), seen in its picture, else from its caption, labels and a sketch. */
function figureRules(card, image, sketch) {
  const d = card.data || {}, what = d.region === 'formula' ? 'formula' : 'figure', at = pageLabel(card.page);
  const seen = image
    ? `The attached image is that ${what} as printed: look at it carefully (axes, labels, curves, colours, notation) and answer about it first, using the document for context.`
    : `You cannot see it. Below are its caption (if one was found), the labels inside it and a rough text sketch of its shape (often unreadable for drawings or photos). Explain it from these and from where the text refers to it. If none of this identifies it, say in one sentence that you cannot see it and ask the reader what it shows; do not guess.`;
  const parts = [card.text ? 'Caption: ' + card.text.slice(0, 600) : '', d.labels ? 'Labels and text inside it: ' + String(d.labels).slice(0, 600) : '', !image && sketch ? 'Rough sketch of its shape (# dark ink, + grey, . faint; unreliable for drawings and photos):\n```\n' + sketch + '\n```' : ''].filter(Boolean).join('\n');
  return `You are Tinct's reading companion. ${bookLine()} They are on page ${at} of ${state.pages.length}.\nThis conversation is about one ${what} on page ${at}${d.label ? ` (${d.label})` : ''}. ${seen} Only this ${what} has been asked about in this conversation: never say another figure was asked about earlier.\nAnswer conversationally and concisely (usually under 150 words unless asked for more). Ground answers in the document; say when something is not in it. Plain prose only.${parts ? '\n\n' + parts : ''}`;
}
/* The passage's picture: cropped to the passage, grown to take in a table or a displayed formula it touches or a table on
   its page it names (TinctMargin.mathBox; morning retest 16 Oct, superscripts lost from Table 1). */
const passageRegion = card => {
  const rects = anchorRects(TinctMargin.anchorOfCard(card)); if (!rects.length) return null;
  const p = state.pages[card.page - 1], own = TinctMargin.anchorOfCard(card).filter(a => a.n === card.page);
  if (p?.pg && own.length) {
    const x0 = Math.min(...own.map(a => a.x)), y0 = Math.min(...own.map(a => a.y)), x1 = Math.max(...own.map(a => a.x + a.w)), y1 = Math.max(...own.map(a => a.y + a.h));
    const grown = TinctMargin.mathBox({ box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, figures: p.figures, captions: p.captions, blocks: p.blocks, text: card.text });
    if (grown) {
      const b = p.pg.getBoundingClientRect();
      return selectionRegion({ page: card.page, box: { left: b.left + grown.x * b.width, top: b.top + grown.y * b.height, right: b.left + (grown.x + grown.w) * b.width, bottom: b.top + (grown.y + grown.h) * b.height } });
    }
  }
  return selectionRegion({ page: card.page, box: boxOf(rects) });
};
function setLive(id, patch) {
  if (patch === null) col.live.delete(id); else col.live.set(id, { ...(col.live.get(id) || { text: '', status: '' }), ...patch });
  marginLayout();
}
/** Errors whose words are never kept on a card: a refusal, and a reply cut off by its output bound. */
const WHOLE_OR_NOTHING = new Set(['refused', 'cut_off']);
/** Run a card's request: its action the first time, today's ask for a follow-up (`question`). */
async function runCard(id, question = null) {
  await mpReady;
  let card = cardById(id); if (!card || !MP.P) return;
  col.ctl.get(id)?.abort();
  const ctl = new AbortController(); col.ctl.set(id, ctl);
  setLive(id, { text: '', status: '' });
  const s = await ai();
  if (!s) { setLive(id, { status: AI_OFF }); return }
  // Quiz me on a whole unit (from the primer): the unit's pages, no passage and no picture.
  const unit = card.data?.unit ? (primer.units?.find(u => u.key === card.data.unit.key) || { key: card.data.unit.key, from: card.page, to: card.page }) : null;
  const pdf = unit ? await unitPages(unit) : await pdfPages(card.page);
  // One picture of the passage, cropped to it (FIXES-2026-10-15 A4); none for a whole unit, or when the page is not drawn.
  // A figure's card sends its figure; a selected caption, or a question naming "Figure N" on the card's page, sends that figure (items 4, 7).
  const figBox = card.kind === 'figure' ? TinctMargin.anchorOfCard(card)[0] : null;
  const asked = question ?? (card.kind === 'ask' ? [...(card.turns || [])].reverse().find(t => t.role === 'user')?.content || '' : '');
  const named = unit || figBox ? null : figureNamed(card.page, card.text, asked) || (asked ? await figureElsewhere(asked, card.page) : null);
  const region = unit || figBox || named ? null : passageRegion(card);
  let image = null;
  if (figBox) { image = figBlobs.get(id) || await figureImage(card.page, figBox); figBlobs.delete(id) }
  else if (named) image = await figureImage(named.page, named.f);
  else if (region) image = await pageImage(card.page, region);
  const fig = figBox ? { sketch: state.pages[card.page - 1]?.canvas ? sketchOf(state.pages[card.page - 1], figBox) : '' } : named ? { named } : {};
  const wholeDoc = await marginDocument(unit ? unit.from : card.page);
  // A question on a long file (an Ask, a follow-up, a figure's thread): what a search of the rest of the book finds for it (searchPassages).
  const found = asked ? await searchPassages(asked, wholeDoc) : null;
  const book = { ...aiBook(), pdf };
  const onText = ({ text }) => { if (!ctl.signal.aborted) setLive(id, { text, status: '' }) };
  const onStatus = status => { if (!ctl.signal.aborted) setLive(id, { status }) };
  // Quiz me streams (FIXES-2026-10-15 A7): each question shows as soon as it is complete; the reader can
  // answer question 1 while 2 and 3 are written. Nothing is saved until the stream ends.
  const quizRun = card.kind === 'quiz' && question == null;
  const live = quizRun ? { ...(card.data?.unit ? { unit: card.data.unit } : {}), questions: [], i: 0, results: [] } : null;
  if (live) col.quiz.set(id, live);
  const onQuizText = ({ text }) => {
    if (ctl.signal.aborted || col.quiz.get(id) !== live) return;
    const got = MP.P.parseQuizPartial?.(text) || [];
    if (got.length <= live.questions.length) return;
    const first = !live.questions.length, waiting = live.i >= live.questions.length;
    live.questions = got;
    if (first) { col.live.delete(id); announce(`${cardName(card)}. ${got[0].q.replace(/\{[^{}\n]{1,40}\}/g, '').replace(/\s+/g, ' ').trim()}`) }
    marginLayout();
    // The reader was waiting on "Writing the next question…": the answer line takes the focus.
    if (!first && waiting && col.open === id) openCard(id, { focus: true });
  };
  const call = async imgs => {
    const images = imgs ? [imgs] : undefined;
    if (question != null || card.kind === 'ask' || card.kind === 'figure') return TinctAI.ask(cardTurns(card, imgs, fig), { book, images, document: wholeDoc, passages: found, onText, signal: ctl.signal });
    // Explain is the Worker's explain intent (FIXES-2026-10-15 A2): its prompt is built there.
    if (card.kind === 'quiz') return TinctAI.companion('quiz', { book, pdf, document: wholeDoc, ...(unit ? {} : { selection: card.text }), images, stream: true, onText: onQuizText, signal: ctl.signal });
    return TinctAI.companion(card.kind, { book, pdf, document: wholeDoc, selection: card.text, images, stream: true, onText, onStatus, signal: ctl.signal });
  };
  try {
    let res;
    try { res = await call(image) }
    catch (e) { if (!image || (e?.code !== 'images_unavailable' && e?.code !== 'image_rejected')) throw e; if (e.code === 'images_unavailable') sampleImages = false; res = await call(null) }
    card = cardById(id); if (!card || ctl.signal.aborted) { if (col.quiz.get(id) === live) col.quiz.delete(id); return }
    if (quizRun) {
      // The whole reply is the authority; what streamed stands when it does not parse.
      const questions = MP.P.parseQuiz(res.text)?.questions || live.questions;
      if (!questions.length) throw Object.assign(new Error('failed'), { code: 'failed' });
      col.quiz.delete(id); col.live.delete(id); col.ctl.delete(id);
      card.data = quizEnded(live, questions, false);
      saveCard(card);
      if (!live.questions.length) announce(`${cardName(card)}. ${questions[0].q.replace(/\{[^{}\n]{1,40}\}/g, '').replace(/\s+/g, ' ').trim()}`);
      return;
    }
    // An empty answer is never kept: the card shows its error instead.
    if (!String(res.text || '').trim()) throw Object.assign(new Error('empty'), { code: 'empty' });
    card.turns = [...(card.turns || []), { role: 'assistant', content: res.text, at: Date.now() }];
    col.live.delete(id); col.ctl.delete(id);
    saveCard(card);
    // Screen readers hear the finished answer once (the card itself is redrawn as it streams).
    announce(`${cardName(card)}. ${String(res.text || '').replace(/\{[^{}\n]{1,40}\}/g, '').replace(/\s+/g, ' ').trim()}`);
  } catch (e) {
    if (e?.code === 'cancelled' || ctl.signal.aborted) { if (live && col.quiz.get(id) === live) col.quiz.delete(id); return }
    col.ctl.delete(id);
    if (live && col.quiz.get(id) === live) {
      col.quiz.delete(id);
      // Stopped after some questions (never a refusal or a cut-off reply): keep them and end the quiz there, saved once.
      const c = cardById(id);
      if (c && live.questions.length && !WHOLE_OR_NOTHING.has(e?.code)) { col.live.delete(id); c.data = quizEnded(live, live.questions, true); saveCard(c); return }
    }
    const c = cardById(id);
    if (c && e?.text && c.kind !== 'quiz' && !WHOLE_OR_NOTHING.has(e.code)) { c.turns = [...(c.turns || []), { role: 'assistant', content: e.text, at: Date.now() }]; saveCard(c) }
    setLive(id, { text: null, status: errorCopy(e) });
  }
}
/** The quiz as it is saved when its stream ends: the questions that arrived and how far the reader got. */
function quizEnded(live, questions, stopped) {
  const i = Math.min(live.i || 0, questions.length);
  return { ...(live.unit ? { unit: live.unit } : {}), questions, i: Math.min(i, questions.length - 1), results: live.results.slice(0, questions.length), ...(live.done || i >= questions.length ? { done: true } : {}), ...(stopped && questions.length < 3 ? { ended: true } : {}) };
}
/** An action from the bar or More on the held passage: a new card, opened, its answer on the way. */
function cardAction(kind, { question = '' } = {}) {
  if (!mr) return;
  const info = mr.info, anchor = mr.anchor;
  marginClose(); getSelection().removeAllRanges();
  const card = withSpan(TinctMargin.newCard({ kind, page: info.page, anchor, text: info.text, turns: kind === 'ask' ? [{ role: 'user', content: question, at: Date.now() }] : [], data: kind === 'quiz' ? { questions: [], i: 0, results: [] } : null }), info);
  store.set('cards:' + state.key, [...keptCards(), card]); cardsSync.changed();
  col.view = null;
  // A new card is always the open one: never folded to a row or gathered into "N more", and it has the focus.
  openCard(card.id, { focus: 'card' });
  runCard(card.id);
}
// Quiz me: "Show answer" (no call), "Next question →", and marking an answer (quiz_check).
function quizStep(id, step) {
  // While the questions stream, the reader's steps stay in memory (saved with the quiz when it ends).
  const live = col.quiz.get(id), card = cardById(id);
  const q = live || card?.data; if (!q?.questions?.length || !card) return;
  const i = q.i || 0;
  q.results = q.results || [];
  // "Try another quiz": new questions on the same passage (or unit), in the same card.
  if (step === 'again') {
    col.ctl.get(id)?.abort(); col.quiz.delete(id);
    card.data = { ...(q.unit ? { unit: q.unit } : {}), questions: [], i: 0, results: [] };
    saveCard(card); openCard(id); runCard(id);
    return;
  }
  if (step === 'show') q.results[i] = { shown: true };
  else if (i + 1 >= (live ? 3 : q.questions.length)) q.done = true;
  else q.i = i + 1;
  if (live) marginLayout(); else saveCard(card);
  if (step === 'next') openCard(id, { focus: !q.done && !!q.questions[q.i || 0] });
}
async function quizCheck(card, answer) {
  await mpReady;
  answer = String(answer || '').slice(0, TinctMargin.QUIZ_ANSWER_CHARS);
  const q = col.quiz.get(card.id) || card.data, i = q.i || 0, item = q.questions?.[i]; if (!item || q.results?.[i]) return;
  col.pending.set(card.id, answer); col.live.delete(card.id); marginLayout();
  try {
    const pdf = await pdfPages(card.page), wholeDoc = await marginDocument(card.page);
    const res = await TinctAI.companion('quiz_check', { book: { ...aiBook(), pdf }, pdf, document: wholeDoc, quiz: { question: item.q, expected: item.answer, why: item.why, answer } });
    const mark = MP.P.parseQuizCheck(res.text);
    if (!mark) throw Object.assign(new Error('failed'), { code: 'failed' });
    const result = { answer, verdict: mark.verdict, feedback: mark.feedback };
    // Still streaming: the mark joins the quiz in memory; else the saved card takes it.
    const live = col.quiz.get(card.id);
    if (live) { live.results[i] = result; col.pending.delete(card.id); marginLayout(); return }
    const c = cardById(card.id); if (!c) return;
    c.data.results = c.data.results || []; c.data.results[i] = result;
    col.pending.delete(card.id); saveCard(c);
  } catch (e) {
    // The error shows in the card, and the reader's answer goes back into its field to send again.
    col.pending.delete(card.id); col.drafts.set(card.id, answer); col.live.set(card.id, { text: null, status: errorCopy(e) }); marginLayout();
  }
}
/* 1.5 s aborted most first requests on production (15 Oct: a cold cache write of the whole document
   comes first); with Haiku 5.5 and the cached document a reply takes about a second, a cold one longer. */
const FIT_SENSE_MS = 4000;
/** define_sense within FIT_SENSE_MS: the sense that fits the passage (1-based), 0 when the companion says none does, or null when it was not asked or did not answer (offline, too slow). */
async function fittingSense(word, senses, info) {
  if (navigator.onLine === false || !senses.length || !window.TinctAI?.companion) return null;
  await mpReady; if (!MP.P) return null;
  const ctl = new AbortController();
  const timer = new Promise(r => setTimeout(() => { ctl.abort(); r(null) }, FIT_SENSE_MS));
  try {
    const pdf = await pdfPages(info.page, { before: 0, after: 0 });
    // The document is usually read by now; if not, define_sense goes without it rather than wait.
    const wholeDoc = await Promise.race([marginDocument(info.page), new Promise(r => setTimeout(() => r(null), 300))]);
    const res = await Promise.race([TinctAI.companion('define_sense', { book: { ...aiBook(), pdf }, pdf, document: wholeDoc, selection: word, senses, signal: ctl.signal }), timer]);
    if (!res) return null;
    const n = MP.P.parseDefineSense(res.text, senses.length);
    return Number.isInteger(n) ? n : null;
  } catch { return null }
}
/**
 * The Define card's result kept as a card (one per word and passage), in the file it was asked in
 * (`key`). One that answers after the reader opened another file goes to its own file's cards (sent
 * to the account when that file is next open), never into the file now open.
 */
function keepDefine(def, info, anchor, key = state.key) {
  if (!key || !def || (!def.senses?.length && !def.line && !def.inText)) return;
  const here = key === state.key && marginOn();
  const cards = here ? keptCards() : store.get('cards:' + key) || [];
  const existing = cards.find(c => c.kind === 'define' && !c.gone && c.page === info.page && c.text === info.text.slice(0, 2000));
  const data = { word: def.word, pos: def.pos || '', senses: (def.senses || []).map(s => ({ text: s.text })), ...(def.line ? { line: def.line } : {}), ...(def.inText ? { inText: def.inText } : {}) };
  const card = existing || (here ? withSpan(TinctMargin.newCard({ kind: 'define', page: info.page, anchor, text: info.text }), info) : TinctMargin.newCard({ kind: 'define', page: info.page, anchor, text: info.text }));
  if (existing && JSON.stringify(existing.data) === JSON.stringify(data)) return;
  card.data = data;
  if (here) return saveCard(card);
  card.u = Date.now();
  store.set('cards:' + key, [...cards.filter(c => c.id !== card.id), card]);
  store.set('cards-dirty:' + key, true);
}
/** A card at a point on the page (its passage), for a click on a passage. */
function cardAt(x, y) {
  const p = pageForPoint(x, y); if (!p) return null;
  const r = p.pg.getBoundingClientRect(), fx = (x - r.left) / r.width, fy = (y - r.top) / r.height;
  return viewCards().find(c => c.kind !== 'note' && c.rects.some(([n, a, b, w, h]) => n === p.n && fx >= a && fx <= a + w && fy >= b && fy <= b + h)) || null;
}
// The pages scroll: cards move with them; a resize moves the column, marks or bottom card.
$('scroll').addEventListener('scroll', () => { if (col.mode) marginLayout() }, { passive: true });
addEventListener('resize', () => { if (marginOn()) marginLayout({ fresh: true }) });
// Tapping the page closes the phone's bottom card.
document.addEventListener('pointerdown', e => { if (col.sheet && marginMode() === 'phone' && !e.target.closest?.('.mr-sheet, .mr-float, .lab-header, .byob-toast')) { const u = currentUnit(); if (u) primer.away.add(u.key); closeSheet2() } }, true);
// "/" opens Chat (about the whole PDF), its field ready; Escape folds the open card (after the bar and its menus).
addEventListener('keydown', e => {
  if (!marginOn() || !readerShown() || e.defaultPrevented) return;
  const inField = !!e.target.closest?.('input, textarea, select, [contenteditable="true"]');
  if (e.key === '/' && !inField && !e.metaKey && !e.ctrlKey && !e.altKey && !mr) {
    if (document.querySelector('.lab-super-layer, .lab-v2-sheet-layer, .lab-contents-v2, .byob-sheet-host, .byob-snip, .byob-jumpbox, .byob-switcher')) return;
    e.preventDefault();
    openWhole();
    return;
  }
  // B: Before you start, open or folded back (not while typing, not with Cmd, Ctrl or Alt; with a selection, letters go to Ask).
  if ((e.key === 'b' || e.key === 'B') && !inField && !e.metaKey && !e.ctrlKey && !e.altKey && !mr && col.mode) {
    if (document.querySelector('.lab-super-layer, .lab-v2-sheet-layer, .lab-contents-v2, .byob-sheet-host, .byob-snip, .byob-jumpbox, .byob-switcher')) return;
    e.preventDefault(); togglePrimer({ keyboard: true }); return;
  }
  if (e.key === 'Escape' && !mr && primer.open && (!inField || primer.el?.contains(e.target))) { e.preventDefault(); e.stopImmediatePropagation(); if (col.sheet?.dataset.id === 'primer') closeSheet2(); else closePrimer(); return }
  if (e.key === 'Escape' && !mr && col.open && !inField) { e.preventDefault(); e.stopImmediatePropagation(); if (col.sheet) closeSheet2(); else openCard(null) }
}, true);

/* ---------- Before you start (PDF only; docs/margin/BRIEF.md §5, PR 3) ----------
   A PDF's units are its top-level outline entries (pdf.js getOutline()) as page ranges, or the
   whole file without an outline (TinctMargin.primerUnits). At a unit's start the margin offers
   the trigger: the column's first folded card (desktop), a mark at the page's edge (narrow
   windows), the bottom card (phone). Clicking it, or B, opens the primer in its place; closing
   folds it back. The primer is made only when the reader opens it (chapter action `primer`), kept
   in this browser ('primer:{key}:{unit}') and, signed in with the book in the account, with the
   book (/api/user-books/primers/{bookHex}?unit=…), so reopening never makes it again. Redo makes
   a new one and stores it. "Quiz me on this chapter" is Quiz me on the whole unit, as a quiz card. */
const primer = { units: null, unitsTask: null, open: false, from: null, box: null, unit: null, data: null, wait: false, status: '', token: 0, away: new Set(), el: null, trig: null, keyed: false };
const ppReady = import('/lab/margin/primer-parse.js?v=20261015kinds').catch(() => null);
function primerReset() {
  primer.token++;
  Object.assign(primer, { units: null, open: false, unit: null, data: null, wait: false, status: '' });
  primer.away.clear();
  primer.el?.remove(); primer.trig?.remove(); primer.el = null; primer.trig = null;
}
/**
 * The units, from the outline: each top-level entry resolved to its page, with a part's own entries
 * (TinctMargin.primerUnits makes a part's chapters the units). A unit whose title does not say it is
 * front or back matter but whose first page reads as an index, a reference list or a contents page
 * (TinctMargin.pageMatter) is marked as such, so Before you start never makes a primer of it.
 */
function loadUnits() {
  primer.unitsTask = loadUnitsNow().catch(() => {});
  return primer.unitsTask;
}
async function loadUnitsNow() {
  const token = state.token, pdf = state.pdf;
  const resolve = async item => {
    try {
      let dest = item.dest;
      if (typeof dest === 'string') dest = await pdf.getDestination(dest);
      const ref = Array.isArray(dest) ? dest[0] : null;
      return ref && typeof ref === 'object' ? await pdf.getPageIndex(ref) + 1 : Number.isInteger(ref) ? ref + 1 : null;
    } catch { return null }
  };
  let entries = [];
  try {
    const outline = await pdf.getOutline();
    entries = await Promise.all((outline || []).map(async item => ({ title: item.title, page: await resolve(item), items: await Promise.all((item.items || []).slice(0, 60).map(async kid => ({ title: kid.title, page: await resolve(kid) }))) })));
  } catch { entries = [] }
  if (token !== state.token) return;
  // A recognised scan has no outline: its chapters (a paper's numbered sections) are its units.
  if (!entries.some(e => Number.isInteger(e.page)) && state.textEdition?.source === 'ocr') entries = state.textEdition.chapters.map(c => ({ title: c.title, page: Array.isArray(c.pages) ? c.pages[0] : null }));
  // Any other PDF without an outline: the chapters the scan found, from its printed contents or its
  // headings (MacKay's 640-page book has no bookmarks, only a printed contents: without this it was
  // one unit, "the whole PDF", and its primer blended the preface with chapters 1 and 2; Anders, 15 Oct).
  const count = state.pages.length || pdf.numPages;
  // (A PDF under 40 pages is one unit whatever it has: nothing to wait for.)
  // The chapters are heard as soon as the scan finds them (contentsSoon), not when it ends: MacKay's trigger
  // took 15 s on its first open (round 1, 15 Oct).
  if (!entries.some(e => Number.isInteger(e.page)) && count >= TinctMargin.PRIMER.units) {
    const soon = await contentsSoon();
    if (token !== state.token) return;
    entries = TinctMargin.scanEntries(soon.entries, soon.nav, count);
  }
  let units = TinctMargin.primerUnits(entries, count);
  // Still one unit, and too long to send whole: blocks of pages, never "the whole PDF".
  if (units.length === 1 && units[0].key === 'all' && count >= TinctMargin.PRIMER.units) {
    const read = await readDocument();
    if (token !== state.token) return;
    if (read && !read.pages) units = TinctMargin.primerBlocks(count);
  }
  // Read side by side, not one after another (80 units took about 2 s in turn).
  const kinds = await Promise.all((units.length > 1 ? units.slice(0, 80) : []).map(async u => {
    if (u.matter || u.pages) return null;
    return TinctMargin.pageMatter((await pageText(u.start)).text) || (u.start < u.to ? TinctMargin.pageMatter((await pageText(u.start + 1)).text) : null);
  }));
  if (token !== state.token) return;
  kinds.forEach((kind, i) => { if (kind) units[i].matter = kind === 'contents' ? 'front' : 'back' });
  primer.units = units;
  marginLayout();
}
const placePage = () => (state.pages.length ? currentPlace().page : 1);
// The chapter the reader is in when they open Before you start; on front or back matter, the nearest real chapter.
const currentUnit = () => (primer.units ? TinctMargin.primerUnitAt(primer.units, placePage()) : null);
// A scan with no text (yet) has nothing to make a primer from: no trigger and no B until its text is
// recognised (ocrAdopt), never a primer of blank pages that fails after 80 s (the scans test, 15 Oct 2026).
// Until the file's scan says whether it has text, nothing is offered either.
// A new scan's chapters can tell earlier that the file has text (contentsSoon): the trigger need not wait for the whole scan.
const primerHasText = () => (state.scan ? !hasNoText() : toc.early?.text === true);
/** The unit whose trigger shows now, or null. */
function triggerUnit() {
  if (!primer.units || primer.open || !primerHasText()) return null;
  const unit = currentUnit();
  return unit && TinctMargin.atUnitStart(unit, placePage()) ? unit : null;
}
// The unit's name as the companion and the primer give it: "Chapter 1: Introduction to Information Theory".
const unitTitle = unit => (unit.key === 'all' || !unit.title ? state.title : unit.label || unit.title);
/**
 * The unit's pages as the companion receives a PDF (the Worker samples a long unit): from its own
 * first page, not the pages before it that only offer its trigger (a title page, or a contents and
 * preface no unit of their own covers), so a chapter's primer is that chapter's alone.
 */
async function unitPages(unit) {
  const pages = [], from = Math.max(unit.from, Math.min(unit.start || unit.from, unit.to)), to = Math.min(unit.to, from + 199);
  for (let n = from; n <= to; n++) pages.push({ n: pageLabel(n), text: ((await pageText(n)).text || ' ').slice(0, 6000) });
  return { pages, at: 0 };
}
const primerUsable = () => state.kind === 'pdf' && !!window.TinctAI?.session?.().token && /^[0-9a-f]{24}$/.test(hexOf(state.key));
/** The account's copy: GET the stored primer, or PUT a new one. -> the stored primer, or null (none, signed out, not in the account, offline). */
async function primerRemote(method, unit, content = null) {
  if (!primerUsable()) return null;
  const PP = await ppReady; if (!PP) return null;
  try {
    const r = await fetch(`/api/user-books/primers/${hexOf(state.key)}?unit=${encodeURIComponent(unit.key)}`, {
      method, credentials: 'same-origin', cache: 'no-store',
      headers: { Authorization: 'Bearer ' + TinctAI.session().token, ...(content ? { 'Content-Type': 'application/json' } : {}) },
      // Its content only (a primer kept here before kinds has claims and keepInMind; the Worker reads both shapes).
      body: content ? JSON.stringify({ primer: Object.fromEntries(['kind', 'gist', 'sections', 'claims', 'keepInMind', 'map'].filter(k => k in content).map(k => [k, content[k]])) }) : undefined,
    });
    if (!r.ok) return null;
    return PP.normalizeStoredPrimer((await r.json().catch(() => ({}))).primer);
  } catch { return null }
}
const primerKey = unit => 'primer:' + state.key + ':' + unit.key;
/* Making a primer (the Gloss test, 15 Oct 2026: 2 failures in 3). One request per unit at a time:
   reopening while it is made waits for the same one. A reply that does not parse, or a failed
   one, is asked for once more. It gives up after 45 s in all ("taking too long"). What it makes is
   kept here and with the book even when the reader has closed it or opened another card meanwhile,
   so it is never made (or charged) twice. */
const PRIMER_WAIT_MS = 45000;
const PRIMER_SLOW = 'Before you start is taking too long. Try again.';
const primerMaking = new Map();
// A cut-off primer is asked for once more, as one that does not parse.
const PRIMER_RETRY = new Set(['failed', 'busy', 'unparsed', 'cut_off']);
function makePrimer(unit) {
  const id = primerKey(unit);
  if (primerMaking.has(id)) return primerMaking.get(id);
  const key = state.key;
  const made = (async () => {
    const PP = await ppReady;
    if (!PP || !window.TinctAI?.companion) throw Object.assign(new Error('offline'), { code: 'offline' });
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), PRIMER_WAIT_MS);
    const pdf = await unitPages(unit), title = unitTitle(unit), wholeDoc = await marginDocument(unit.from);
    try {
      for (let attempt = 0; ; attempt++) {
        try {
          const res = await TinctAI.companion('chapter', { book: { ...aiBook(), chapter: title }, pdf, document: wholeDoc, chapter: { action: { kind: 'primer', unitKey: unit.key, unitTitle: title } }, stream: false, signal: ctl.signal, retry: false });
          const content = PP.parsePrimer(res.text);
          if (!content) throw Object.assign(new Error('unparsed'), { code: 'unparsed' });
          return { content, kept: { ...content, madeAt: new Date().toISOString(), unitKey: unit.key } };
        } catch (e) {
          if (ctl.signal.aborted) throw Object.assign(new Error('slow'), { code: 'slow' });
          if (attempt > 0 || !PRIMER_RETRY.has(e?.code)) throw e;
        }
      }
    } finally { clearTimeout(timer) }
  })().then(({ content, kept }) => {
    if (state.key !== key) return kept;
    store.set(id, kept);
    // With the book in the account: stored there too; its stamp replaces this browser's.
    primerRemote('PUT', unit, content).then(put => {
      if (!put || state.key !== key) return;
      store.set(id, put);
      if (primer.open && primer.unit?.key === unit.key && primer.data?.madeAt === kept.madeAt) { primer.data = put; marginLayout() }
    });
    return kept;
  }).finally(() => primerMaking.delete(id));
  primerMaking.set(id, made);
  return made;
}
/** The primer for `unit`: kept here, else the account's, else made now (only when opened). Redo makes a new one. */
async function loadPrimer(unit, { redo = false } = {}) {
  const token = ++primer.token, key = state.key;
  const live = () => token === primer.token && state.key === key && primer.open && primer.unit?.key === unit.key;
  const before = store.get(primerKey(unit));
  const show = patch => { Object.assign(primer, { data: null, wait: false, status: '' }, patch); marginLayout() };
  if (!redo) {
    if (before) {
      show({ data: before });
      // Made here before the book reached the account (or offline): the account gets it; a newer one there wins.
      primerRemote('GET', unit).then(async remote => {
        if (!live()) return;
        if (!remote) { const put = await primerRemote('PUT', unit, before); if (put && live()) { store.set(primerKey(unit), put); show({ data: put }) } return }
        if (remote.madeAt !== before.madeAt && Date.parse(remote.madeAt) > Date.parse(before.madeAt || 0)) { store.set(primerKey(unit), remote); show({ data: remote }) }
      });
      return;
    }
    show({ wait: true });
    const remote = primerMaking.has(primerKey(unit)) ? null : await primerRemote('GET', unit);
    if (!live()) return;
    if (remote) { store.set(primerKey(unit), remote); return show({ data: remote }) }
  }
  show({ wait: true });
  try {
    const kept = await makePrimer(unit);
    if (!live()) return;
    show({ data: store.get(primerKey(unit)) || kept });
    announce('Before you start is ready.');
  } catch (e) {
    if (!live()) return;
    const copy = e?.code === 'slow' ? PRIMER_SLOW : errorCopy(e);
    // Redo that could not be done keeps the primer there was.
    if (redo && before) { show({ data: before }); toast(copy); return }
    show({ status: copy });
  }
}
/** Open the primer in place of its trigger (B, or a click on the trigger). */
function openPrimer(unit = currentUnit(), { keyboard = false } = {}) {
  const mode = marginMode();
  if (!unit || !mode || !primerHasText()) return;
  if (col.open && col.sheet) closeSheet2();
  col.open = null; closeFloat();
  // It opens where its trigger is and grows from there (primerInColumn): the trigger's place in the column.
  const t = mode === 'column' && primer.trig?.isConnected ? primer.trig : null;
  primer.from = t ? { top: t.offsetTop, height: t.offsetHeight } : null; primer.box = null;
  primer.open = true; primer.unit = unit; primer.keyed = keyboard;
  if (mode === 'phone') openSheet2('primer');
  loadPrimer(unit);
  marginLayout();
}
/** Fold the primer back to its trigger. */
function closePrimer() {
  if (!primer.open) return;
  const had = !!primer.el?.contains(document.activeElement);
  primer.open = false; primer.token++;
  primer.el?.remove(); primer.el = null;
  if (col.sheet?.dataset.id === 'primer') { col.sheet.remove(); col.sheet = null }
  marginLayout();
  if (had) requestAnimationFrame(() => (primer.trig?.isConnected ? primer.trig : $('scroll')).focus?.({ preventScroll: true }));
}
const togglePrimer = opts => (primer.open ? closePrimer() : openPrimer(undefined, opts));
/** Draw the primer into `el` (the column's, the floating one, or the phone's card). */
function drawPrimer(el, { sheet = false } = {}) {
  const sig = JSON.stringify([primer.unit?.key, primer.data?.madeAt, primer.wait, primer.status, !!MP.P, state.labels ? 1 : 0, sheet]);
  if (el.dataset.sig === sig) return;
  el.dataset.sig = sig;
  // The focus stays on the primer while it is drawn again (made, Redo); from the keys it starts on its close.
  if (el.contains(document.activeElement)) primer.keyed = true;
  const unit = primer.unit && primer.unit.key !== 'all' ? unitTitle(primer.unit) : '';
  const inner = TinctMargin.html.primerHtml(primer.data, { P: MP.P, resolve: citeResolve, wait: primer.wait, status: primer.status, id: 'mr-primer-title', unit });
  if (sheet) el.innerHTML = TinctMargin.html.sheetHtml(`<div class="mr-primer" role="region" aria-labelledby="mr-primer-title">${inner}</div>`);
  else el.innerHTML = inner;
  if (primer.wait) el.querySelector('.mr-wait')?.append(TinctWait.waitRing('Thinking…', { size: 18, live: false }));
  if (primer.keyed) { primer.keyed = false; const close = el.querySelector('.mr-primer__close'); close?.focus({ preventScroll: true }); requestAnimationFrame(() => { if (close?.isConnected && !el.contains(document.activeElement)) close.focus({ preventScroll: true }) }) }
}
function primerEl() {
  if (!primer.el) {
    const el = primer.el = document.createElement('div');
    el.className = 'mr mr-primer'; el.setAttribute('role', 'region'); el.setAttribute('aria-labelledby', 'mr-primer-title');
    bindCardEvents(el);
  }
  return primer.el;
}
/**
 * The column: the primer in place of the cards, from where its trigger was down to 70px above the
 * column's foot (TinctMargin.primerBox). It opens in place (Anders, 15 Oct: "it should just expand"):
 * the trigger's own box grows into the open primer, its height easing down, never jumping up; with
 * reduced motion it is there at once, at the same place. -> true when it is open
 */
function primerInColumn() {
  if (!primer.open) { primer.el?.remove(); primer.el = null; return false }
  const el = primerEl(), fresh = el.parentElement !== col.el;
  el.classList.remove('is-floating');
  if (fresh) { el.removeAttribute('style'); col.el.insertBefore(el, col.el.firstChild) }
  drawPrimer(el);
  const colH = col.el.clientHeight;
  // Placed once when it opens; later layouts (a resize) keep its top and fit its height.
  if (!primer.box || fresh) primer.box = TinctMargin.primerBox(primer.from, colH);
  const top = primer.box.top, height = Math.max(0, colH - TinctMargin.PRIMER.bottom - top);
  const still = !fresh || !primer.box.start || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) { if (!el.classList.contains('is-growing')) Object.assign(el.style, { top: top + 'px', bottom: 'auto', height: height + 'px' }); return true }
  // From the trigger's box to the open primer's, in one easing.
  const start = primer.box.start;
  Object.assign(el.style, { top: start.top + 'px', bottom: 'auto', height: start.height + 'px', transition: 'none' });
  el.classList.add('is-growing');
  void el.offsetHeight;
  el.style.transition = '';
  el.classList.remove('is-growing'); el.classList.add('is-opening');
  Object.assign(el.style, { top: top + 'px', height: height + 'px' });
  const done = () => { el.classList.remove('is-opening'); el.removeEventListener('transitionend', onEnd) };
  const onEnd = e => { if (e.target === el && e.propertyName === 'height') done() };
  el.addEventListener('transitionend', onEnd); setTimeout(done, 450);
  return true;
}
/** The first line of text on a page, as a fraction of its height (from its text layer), kept once found. */
const firstLineFrac = new Map();
function pageFirstLine(p) {
  const key = state.key + ':' + p.n;
  if (firstLineFrac.has(key)) return firstLineFrac.get(key);
  const b = p.pg.getBoundingClientRect();
  const tops = [...(p.layer?.querySelectorAll('span') || [])].filter(sp => (sp.textContent || '').trim()).map(sp => sp.getBoundingClientRect()).filter(r => r.height > 0).map(r => r.top);
  if (!tops.length || !b.height) return null;
  const frac = (Math.min(...tops) - b.top) / b.height;
  firstLineFrac.set(key, frac);
  return frac;
}
/** The column's trigger at the unit's start, a folded card at its page's first line. -> { top (that line, from the column's top), height }, or null */
function triggerInColumn(colTop) {
  const unit = triggerUnit();
  if (!unit) { primer.trig?.remove(); primer.trig = null; return null }
  if (!primer.trig) {
    const b = primer.trig = document.createElement('button');
    b.type = 'button'; b.className = 'mr mr-trigger'; b.dataset.c = 'primer'; b.setAttribute('aria-expanded', 'false'); b.title = 'Before you start (B)';
  }
  const b = primer.trig;
  if (b.dataset.unit !== unit.key) { b.dataset.unit = unit.key; b.innerHTML = TinctMargin.html.triggerHtml(unit); b.setAttribute('aria-label', `Before you start: ${TinctMargin.triggerLine(unit)} Key B.`) }
  if (b.parentElement !== col.el) col.el.insertBefore(b, col.el.firstChild);
  // The first line of text on the page the reader is on (the unit's first pages: a title page, its start);
  // before the text layer is drawn, that page's top.
  const p = state.pages[Math.max(unit.from, Math.min(unit.start, placePage())) - 1], pr = p?.pg.getBoundingClientRect(), frac = p ? pageFirstLine(p) : null;
  const line = pr ? pr.top + (frac == null ? 0 : frac * pr.height) : colTop;
  return { top: line - colTop, height: b.offsetHeight };
}
/** Narrow windows: the primer floats beside the page, as a card opened from a mark does. */
function placePrimerFloat(pageRight) {
  if (!primer.open) { if (primer.el?.classList.contains('is-floating')) { primer.el.remove(); primer.el = null } return }
  const el = primerEl();
  if (el.parentElement !== root) root.appendChild(el);
  el.classList.add('is-floating');
  drawPrimer(el);
  const hdr = $('hdr').getBoundingClientRect().bottom, x = pageRight + TinctMargin.COL.dot;
  el.style.left = (x + 14 + 380 <= innerWidth - 16 ? x + 14 : Math.max(16, x - 14 - 380)) + 'px';
  el.style.top = hdr + 16 + 'px';
  el.style.maxHeight = Math.max(160, innerHeight - hdr - 32) + 'px';
}
/** Narrow windows: the trigger is a mark level with the unit's first page's top. -> the mark, or null */
function primerMark(pageRight) {
  let m = col.marks.querySelector('.mr-mark[data-primer]');
  const unit = primer.open ? primer.unit : triggerUnit();
  const p = unit && state.pages[unit.start - 1];
  const hdr = $('hdr').getBoundingClientRect().bottom;
  const y = p ? p.pg.getBoundingClientRect().top + 28 : -1;
  if (!unit || !p || y < hdr + 8 || y > innerHeight - 8) { m?.remove(); return null }
  if (!m) { m = document.createElement('button'); m.type = 'button'; m.className = 'mr-mark'; m.dataset.primer = '1'; col.marks.appendChild(m) }
  m.setAttribute('aria-label', 'Before you start'); m.title = 'Before you start (B)'; m.setAttribute('aria-expanded', String(primer.open));
  m.style.left = Math.min(innerWidth - 14, pageRight + TinctMargin.COL.dot) + 'px';
  m.style.top = (y - hdr) + 'px';
  return m;
}
/** The unit quiz card ("Quiz me on this chapter"): Quiz me on the whole unit, at the column's top. */
function unitQuiz(unit) { return keptCards().filter(c => !c.gone && c.kind === 'quiz' && c.data?.unit?.key === unit.key).sort((a, b) => (b.at || 0) - (a.at || 0))[0] || null }
function quizUnit() {
  const unit = primer.unit || currentUnit(); if (!unit) return;
  let card = unitQuiz(unit);
  if (!card || card.data.done) {
    // A passage-less card: its "passage" is a zero box at the unit's start (the stored cards' shape needs one); the view leaves it out.
    card = TinctMargin.newCard({ kind: 'quiz', page: unit.start, anchor: [{ n: unit.start, x: 0, y: 0, w: 0, h: 0 }], text: '', data: { unit: { key: unit.key, label: unit.key === 'all' ? TinctMargin.KINDS.whole : TinctMargin.unitPhrase(unit) }, questions: [], i: 0, results: [] } });
    store.set('cards:' + state.key, [...keptCards(), card]); cardsSync.changed();
    closePrimer(); openCard(card.id); runCard(card.id);
    return;
  }
  closePrimer(); openCard(card.id, { focus: true });
}
// A visually hidden live region: finished answers and the primer are announced once, not word by word.
function announce(text) {
  let el = document.getElementById('mr-live');
  if (!el) { el = document.createElement('div'); el.id = 'mr-live'; el.className = 'mr-sr'; el.setAttribute('aria-live', 'polite'); el.setAttribute('role', 'status'); document.body.appendChild(el) }
  el.textContent = ''; setTimeout(() => { el.textContent = String(text || '').slice(0, 600) }, 60);
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
const chat = { el: null, turns: [], talk: false, ctl: null, passage: null, attach: [], live: null, fresh: false, anchor: null, placeAnchor: false, pinTop: null, pill: null };
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
  if (marginOn()) { marginLayout(); return }
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
  const frac = { x: f.x, y: f.y, w: f.w, h: f.h };
  // A formula has no caption: the nearest "Figure N" beside it is another figure's (MacKay's (1.2) took Figure 1.1's).
  const caption = kind === 'formula' ? '' : f.caption || captionNear(p, f);
  return { blob: noImage ? null : await snipImage(p.n, f), page: p.n, text, frac, kind, label: f.label || '', caption, sketch: sketchOf(p, f) };
}
/* -- A figure's card (FIXES-2026-10-15 item 4): beside the figure in the margin, its thumbnail at the
   top, one thread per figure, kept and synced as every card is. Never the whole-PDF thread. -- */
const figThumbs = new Map(), figBlobs = new Map(), thumbWork = new Set();
/** The figure's picture for the companion: re-drawn sharp from the PDF; tinct-api.js sends it at most 1568 px. EPUBs and refused pictures: none. */
async function figureImage(n, f) {
  if (!PAGE_IMAGES || sampleImages === false || isEpub() || !state.pdf) return null;
  return snipImage(n, f);
}
/** An open figure card's thumbnail ({ url, ratio }): drawn once, the card redrawn when it arrives. */
function figThumb(card) {
  const f = TinctMargin.anchorOfCard(card)[0]; if (!f) return null;
  const pg = state.pages[card.page - 1]?.pg, pw = pg?.offsetWidth || state.base.w, ph = pg?.offsetHeight || state.base.h;
  const ratio = Math.max(0.4, Math.min(6, (f.w * pw) / Math.max(1e-6, f.h * ph)));
  if (!figThumbs.has(card.id) && !thumbWork.has(card.id) && state.pdf) {
    thumbWork.add(card.id);
    snipImage(card.page, f).then(b => (b ? thumbOf(b) : '')).then(url => { thumbWork.delete(card.id); if (url) { figThumbs.set(card.id, url); marginLayout() } });
  }
  return { url: figThumbs.get(card.id) || '', ratio };
}
/** Explain or Chat on a figure: its card (made once per figure), opened beside it; Explain asks once. */
function figureAction(a, item) {
  hideSelection();
  let card = TinctMargin.figureCardFor(keptCards(), item.page, item.frac);
  if (!card) {
    card = TinctMargin.newCard({ kind: 'figure', page: item.page, anchor: [{ n: item.page, ...item.frac }], text: item.caption || '', data: { region: item.kind, ...(item.label ? { label: item.label } : {}), ...(item.text ? { labels: item.text.slice(0, 600) } : {}) } });
    store.set('cards:' + state.key, [...keptCards(), card]); cardsSync.changed(); col.view = null;
  }
  if (item.blob) { figBlobs.set(card.id, item.blob); if (!figThumbs.has(card.id)) thumbOf(item.blob).then(u => { if (u) { figThumbs.set(card.id, u); marginLayout() } }) }
  const asked = (card.turns || []).length || col.ctl.has(card.id);
  openCard(card.id, { focus: a === 'ask' ? true : 'card' });
  // Explain asks once; again, it opens the thread. Chat keeps the picture for the first question.
  if (a === 'explain') { if (!asked) runCard(card.id); else figBlobs.delete(card.id) }
}
/** A figure card left without a question (Chat, then closed) goes: a removal, synced as every card's. */
function dropEmptyFigure(id) {
  const card = id && cardById(id);
  if (!card || card.kind !== 'figure' || (card.turns || []).length || col.ctl.has(id) || col.live.has(id)) return;
  store.set('cards:' + state.key, keptCards().map(c => (c.id === id ? TinctMargin.tombstone(id) : c))); cardsSync.changed(); col.view = null;
}
/** The figure a question or a selected caption names on `page` (item 7): { page, f, label }, or null. */
function figureNamed(page, selection, question) {
  const p = state.pages[page - 1]; if (!p?.captions?.length) return null;
  const c = TinctMargin.figureFor({ selection, question, captions: p.captions });
  return c && p.figures?.[c.fig] ? { page, f: p.figures[c.fig], label: c.label } : null;
}
/** For a whole-PDF question: a selected caption, else a figure the question names on the reader's page or the pages in view, else anywhere in the file (figureElsewhere). */
async function figureAsked(question, passage, page) {
  if (passage) { const hit = figureNamed(passage.page, passage.text, question); if (hit) return hit }
  const sr = $('scroll').getBoundingClientRect();
  const inView = state.pages.filter(q => { const r = q.pg.getBoundingClientRect(); return r.bottom > sr.top && r.top < sr.bottom }).map(q => q.n);
  for (const n of [page, ...inView.filter(n => n !== page)]) { const hit = figureNamed(n, '', question); if (hit) return hit }
  return figureElsewhere(question, page);
}
/* A figure a question names on another page (retest 15 Oct: "what does Figure 3 show" from page 1 sent no
   picture): found by its caption, on a page already looked at, else on the nearest pages whose text starts a
   line with that caption; that page is drawn small off screen and its figures found as a drawn page's are
   (without its displayed formulas). -> { page, f, label } or null. */
const offFigs = new Map();
async function figureElsewhere(question, page) {
  const want = TinctMargin.figureRef(question);
  if (!want || !state.pdf || isEpub()) return null;
  const match = (n, found) => {
    const c = (found?.captions || []).find(x => x.kind === want.kind && String(x.n).toLowerCase() === String(want.n).toLowerCase() && found.figures?.[x.fig]);
    return c ? { page: n, f: found.figures[c.fig], label: c.label } : null;
  };
  const byNear = list => list.sort((a, b) => Math.abs(a - page) - Math.abs(b - page));
  for (const n of byNear([...state.figs.keys()])) { const hit = match(n, state.figs.get(n)); if (hit) return hit }
  // Pages whose text has the caption ("Table 8." or "Figure 16.1:", not "Table 8 shows"): the whole-book read, else the pages read so far.
  const read = await Promise.race([readBook(), new Promise(r => setTimeout(() => r(null), 3000))]);
  let texts = read?.texts?.length ? read.texts.map((t, i) => [i + 1, t]) : [...state.texts.entries()].map(([n, v]) => [n, v.text]);
  // A long book still being read: "Figure 16.1" is in chapter 16, whose pages (from the contents) are read now.
  const chapter = !read && /^(\d+)[.\-–]\d/.exec(String(want.n));
  if (chapter) {
    await Promise.race([toc.task, new Promise(r => setTimeout(r, 3000))]);
    const entries = toc.entries || [], e = entries.find(x => new RegExp(`^(?:chapter\\s+)?${chapter[1]}(?![\\d.])`, 'i').test(String(x.label || '').trim()));
    if (e) {
      const next = entries.filter(x => x.parent === e.parent && x.page > e.page).sort((a, b) => a.page - b.page)[0];
      const from = e.page, to = Math.min(state.pages.length, (next?.page || state.pages.length + 1) - 1, from + 80);
      for (let p = from; p <= to; p++) if (!texts.some(([q]) => q === p)) texts.push([p, (await pageText(p)).text]);
    }
  }
  const num = String(want.n).replace(/[.\-–]/g, '\\$&'), words = want.kind === 'table' ? 'Table|TABLE' : 'Figure|FIGURE|Fig\\.?|FIG\\.?';
  const label = new RegExp(`(?:^|[\\s(])(?:${words})\\s*${num}\\s*(?::|\\.(?!\\d))`);
  const pages = byNear(texts.filter(([, t]) => label.test(String(t || ''))).map(([p]) => p)).slice(0, 4);
  for (const n of pages) { const hit = match(n, await figuresOff(n)); if (hit) return hit }
  return null;
}
/** A page's figures found off screen: drawn 480px wide, its text as spans (page fractions). */
async function figuresOff(n) {
  if (state.figs.has(n)) return state.figs.get(n);
  const key = state.key + ':' + n;
  if (offFigs.has(key)) return offFigs.get(key);
  const task = (async () => {
    const page = await state.pdf.getPage(n), base = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: 480 / base.width });
    const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    const g = c.getContext('2d', { alpha: false }); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: g, viewport: vp }).promise;
    const W = 240, H = Math.max(1, Math.round(W * c.height / c.width));
    const small = document.createElement('canvas'); small.width = W; small.height = H;
    const x = small.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0, W, H);
    const d = x.getImageData(0, 0, W, H).data, ink = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) ink[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) < 247 ? 1 : 0;
    const items = (await pageText(n)).items || [];
    const spans = items.filter(it => it.str && it.str.trim()).map(it => {
      const tx = pdfjsLib.Util.transform(vp.transform, it.transform), size = Math.hypot(tx[2], tx[3]);
      return { x: tx[4] / vp.width, y: (tx[5] - size * 0.86) / vp.height, w: (it.width * vp.scale) / vp.width, h: (size * 1.1) / vp.height, text: it.str };
    });
    return TinctMargin.findFigures({ ink, W, H, spans, formulas: [] });
  })().catch(() => null);
  offFigs.set(key, task);
  return task;
}
async function regionAction(a, item) {
  const what = item.kind === 'formula' ? 'formula' : 'figure';
  if ((a === 'explain' || a === 'ask') && marginOn()) return figureAction(a, item);
  if (a === 'explain' || a === 'ask') { hideSelection(); openChat({ quiet: a === 'explain' }); await addAttachments([item], { snip: true }); if (a === 'explain') ask(`Explain this ${what}.`); return }
  if (a === 'highlight') {
    hideSelection(); const f = item.frac, r = v => Math.round(v * 10000) / 10000;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const at = Date.now(), list = highlights(); list.push({ id, page: item.page, rects: [[r(f.x), r(f.y), r(f.w), r(f.h)]], text: item.text || '', box: true, kind: item.kind, color: prefs.hlColor || 'gold', at, u: at });
    putHighlights(list); renderHighlights(state.pages[item.page - 1]);
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

/* ---------- Figures: areas with ink but no running text get a hover chip (TinctMargin.findFigures) ---------- */
function detectFigures(p) {
  if (!p.canvas || !p.layer || state.figs.has(p.n)) return;
  const c = drawn(p), W = 240, H = Math.max(1, Math.round(W * c.height / c.width));
  const g = document.createElement('canvas'); g.width = W; g.height = H;
  const x = g.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, ink = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) ink[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) < 247 ? 1 : 0;
  const pr = p.pg.getBoundingClientRect();
  const spans = [...p.layer.querySelectorAll('span')].map(sp => { const q = sp.getBoundingClientRect(); return { x: (q.left - pr.left) / pr.width, y: (q.top - pr.top) / pr.height, w: q.width / pr.width, h: q.height / pr.height, text: sp.textContent } });
  const found = TinctMargin.findFigures({ ink, W, H, spans, formulas: p.blocks || [] });
  state.figs.set(p.n, found); p.figures = found.figures; p.captions = found.captions;
}
const hot = { el: null, key: '', sticky: false, raf: 0, timer: 0, over: false };
function regionAt(x, y) {
  const p = pageForPoint(x, y); if (!p || !p.layer) return null;
  const r = p.pg.getBoundingClientRect(), fx = (x - r.left) / r.width, fy = (y - r.top) / r.height;
  const inside = f => fx >= f.x && fx <= f.x + f.w && fy >= f.y && fy <= f.y + f.h;
  // The smallest figure under the pointer (a figure inside another's box is its own).
  const fi = (p.figures || []).reduce((best, f, i) => (inside(f) && (best < 0 || f.w * f.h < p.figures[best].w * p.figures[best].h) ? i : best), -1);
  if (fi >= 0) return { p, f: p.figures[fi], kind: 'figure', key: p.n + 'f' + fi };
  // The fallback (item 5): over a "Figure N" or "Table N" caption, its figure is offered.
  const cap = (p.captions || []).find(c => inside(c.box) && p.figures?.[c.fig]); if (cap) return { p, f: p.figures[cap.fig], kind: 'figure', key: p.n + 'f' + cap.fig, caption: true };
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
  placeHot();
}
/** The chip stays inside the page and the screen (item 6): TinctMargin.placeChip, in the box's own coordinates. */
function placeHot() {
  const el = hot.el, chip = el?.querySelector('.byob-hot-chip'); if (!chip || !el.isConnected) return;
  const box = el.getBoundingClientRect(), pg = el.parentElement.getBoundingClientRect(), sr = $('scroll').getBoundingClientRect(), hdr = $('hdr').getBoundingClientRect().bottom;
  const view = { left: Math.max(0, sr.left), right: Math.min(innerWidth, sr.left + pagesWidth()), top: Math.max(sr.top, hdr, 0), bottom: Math.min(sr.bottom, innerHeight) };
  const bounds = { left: Math.max(pg.left, view.left), right: Math.min(pg.right, view.right), top: Math.max(pg.top, view.top), bottom: Math.min(pg.bottom, view.bottom) };
  const at = TinctMargin.placeChip({ box, w: chip.offsetWidth, h: chip.offsetHeight, bounds, outer: view });
  Object.assign(chip.style, { left: at.left - box.left + 'px', top: at.top - box.top + 'px', right: 'auto', transform: 'none' });
  chip.classList.toggle('is-below', at.side !== 'above');
}
document.addEventListener('mousemove', e => {
  if (hot.raf) return;
  hot.raf = requestAnimationFrame(() => {
    hot.raf = 0;
    if (e.buttons || drag.on || root.classList.contains('is-snipping') || isPhone()) return;
    if (e.target.closest?.('.byob-hot-chip')) return;
    if (document.querySelector('.selection-popup') || !getSelection().isCollapsed) { if (!hot.sticky) hideHot(); return }
    const reg = e.target.closest?.('.pdf-scroll') ? regionAt(e.clientX, e.clientY) : null;
    // Over a caption's own words the chip comes on a tap only: on hover it would stand over the words a reader is about
    // to select (morning retest 16 Oct: a caption could not be highlighted, noted or asked about).
    if (reg && !reg.caption) showHot(reg, false); else if (!hot.sticky && hot.el) hideHotSoon();
  });
});
// Touch (and a plain click): tap a figure or formula to get the same chip.
document.addEventListener('click', e => {
  if (e.target.closest('.byob-hot-chip, .selection-popup, .lab-ask, .lab-header, button') || !getSelection().isCollapsed || narr.active) return;
  if (highlightAt(e.clientX, e.clientY)) return;
  const reg = regionAt(e.clientX, e.clientY);
  if (reg) showHot(reg, true); else hideHot();
});
$('scroll').addEventListener('scroll', () => { if (!hot.sticky) hideHot(); else placeHot() }, { passive: true });

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
/** A press between letters (on the layer, not a word): its column is the nearest word's. A caption or a figure's
    labels sit in their own column (reading order), so a drag over a caption selects the caption, not the body. */
function nearestIsSide(p, x, y) {
  let best = null, bd = Infinity;
  for (const sp of p.layer.querySelectorAll('span')) {
    if (!sp.firstChild) continue;
    const r = sp.getBoundingClientRect(), dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom), d = dx * dx + dy * dy * 4;
    if (d < bd) { bd = d; best = sp }
  }
  return !!best?.closest('.side-col');
}
function extendTo(x, y) {
  const f = caretAt(x, y, drag.col); if (!f || !drag.a) return;
  try { getSelection().setBaseAndExtent(drag.a.node, drag.a.offset, f.node, f.offset) } catch {}
}
document.addEventListener('mousedown', e => {
  if (e.button !== 0 || Date.now() - drag.touchAt < 1000 || root.classList.contains('is-snipping')) return;
  const t = e.target; if (!t.closest?.('.pdf-sheet') || t.closest('.byob-hot-chip, button')) return;
  const p = pageForPoint(e.clientX, e.clientY); if (!p?.layer) return;
  const onSide = !!(t.closest('.side-col') || (document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.side-col'))) || nearestIsSide(p, e.clientX, e.clientY);
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
    for (const h of hl) { const ch = chapterAt(h.page)?.label || ''; if (ch && ch !== last) { out += `\n### ${ch}\n`; last = ch } out += h.box ? `\n_[${KIND[h.kind] || 'Figure'} on p. ${h.page}]_${h.kind === 'formula' && h.text ? '\n' + quote(h.text) : ''}\n` : `\n${quote(h.text)}\n— p. ${h.page}\n`; if (h.note) out += `\n${h.note.trim()}\n` }
  }
  if (turns.length) {
    out += `\n## Conversations\n`;
    for (const t of turns) {
      if (t.role === 'user') out += `\n**You** (p. ${t.page || '?'}${t.at ? ', ' + new Date(t.at).toLocaleDateString() : ''}):${t.passage ? '\n\n' + quote(t.passage) : ''}${t.imgs?.length ? `\n\n_[${t.imgs.length > 1 ? t.imgs.length + ' images attached' : 'Image attached'}]_` : ''}\n\n${t.display || t.content}\n`;
      else out += `\n**Tinct:**\n\n${t.content.trim()}\n`;
    }
  }
  // The margin's cards: each kept answer with its passage.
  const cards = state.kind === 'pdf' ? TinctMargin.cardView(keptCards(), []) : [];
  if (cards.length) {
    out += `\n## Margin\n`;
    for (const c of cards) {
      out += `\n### ${cardName(c)}\n\n${quote(c.text || '')}\n`;
      if (c.kind === 'define') out += '\n' + ((c.data?.senses || []).map((x, i) => `${i + 1}. ${x.text}`).join('\n') || c.data?.line || '') + '\n';
      else if (c.kind === 'quiz') for (const q of c.data?.questions || []) out += `\n**${q.q}** ${q.answer}\n`;
      for (const t of c.turns || []) out += t.role === 'user' ? `\n**You:** ${t.content}\n` : `\n${t.content.trim()}\n`;
    }
  }
  if (!hl.length && !turns.length && !cards.length) { toast('Nothing to export yet. Highlight a passage or ask a question first.'); return }
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
const CHAT_THREAD = '/lab/chat-thread.js?v=20261012latest';
let TC = null;
const tcReady = import(CHAT_THREAD).then(m => (TC = m)).catch(() => null);
function openChat(opts = {}) {
  if (!TC) { tcReady.then(m => { if (m) openChat(opts) }); return }
  closeAllPopups();
  // A PDF: the whole-file chat is the margin's "Whole PDF" card (or the phone's bottom card).
  if (marginOn()) return openWhole(opts);
  loadTurns();
  if (!chat.el) {
    const el = document.createElement('aside');
    el.setAttribute('aria-label', 'Chat');
    el.innerHTML = `<button type="button" class="tc-back" data-reader-window-control data-x>${TC.BACK_TO_BOOK_HTML}</button>
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
    // A scroll the reader made (not one we made) lets go of the held question's place.
    thread.addEventListener('scroll', () => { if (chat.pinTop != null && Math.abs(thread.scrollTop - chat.pinTop) > 1) chat.pinTop = null; latestState() }, { passive: true });
    latest.onclick = () => TC.scrollToLatest(thread);
    // The clean window stays a full screen while the sheet settles (phone chrome, keyboard);
    // a held question stays where it was put (the keyboard closing after send), unless the reader scrolled.
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => {
      if (holdQuestion(chat.pinTop != null)) return;
      const space = thread.querySelector('.tc-spacer'); if (!space || !chat.fresh) return; const atEnd = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 8; space.style.height = thread.clientHeight + 'px'; if (atEnd) { thread.scrollTop = thread.scrollHeight; latestPill().placed(thread) }
    }).observe(thread);
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
  // Opened: no question is held yet (an explanation brought in now is the one held).
  chat.anchor = opts.explanation ? chat.turns.length - 2 : null; chat.placeAnchor = !!opts.explanation; chat.pinTop = null;
  setTalk(!!opts.talk || chat.talk);
  renderThread();
  if (opts.prompt) ask(opts.prompt, opts.display);
  else if (!opts.quiet) setTimeout(() => { const t = el.querySelector('textarea'); t.focus({ preventScroll: true }); t.dispatchEvent(new Event('input')) }, 50);
}
function closeChat() {
  if (marginOn()) { if (col.open === 'whole') { if (col.sheet) closeSheet2(); else openCard(null) } return }
  chat.ctl?.abort(); chat.live = null; speechSynthesis?.cancel?.(); chat.el?.remove(); const t = document.querySelector('.byob-toast.is-in-chat') || chat.el?.querySelector('.byob-toast'); if (t) placeToast(t); root.classList.remove('chat-open'); root.dataset.desktopPanel = 'none'; if (!isPhone()) setDock('closed') }
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
  if (marginOn()) return;
  const box = chat.el?.querySelector('#attached'); if (!box) return;
  box.hidden = !chat.passage;
  box.querySelector('#attachedText').textContent = chat.passage ? TC.cutQuote(chat.passage.text) : '';
}
/* After a question is sent the thread scrolls once, so the question sits near the top
   with a little of the previous answer above it; the answer then grows downward under
   it and nothing follows it (Anders, 10 Oct 2026). The "Latest" pill shows only once the
   reader scrolled up and more arrived below (TC.latestPill, Anders, 12 Oct 2026), never
   right after a send. A scroll the reader makes is never undone. */
function heldRow() {
  const thread = chat.el?.querySelector('#thread');
  return chat.anchor == null || !thread ? null : thread.querySelector(`[data-turn="${chat.anchor}"]`);
}
/** Size the room below the held question; with `place`, put the question near the top. True when a question is held. */
function holdQuestion(place) {
  const row = heldRow(); if (!row) return false;
  const thread = chat.el.querySelector('#thread');
  const top = TC.questionTop(thread, row);
  TC.fitSpacer(thread, top);
  if (place) { thread.scrollTop = top; chat.pinTop = thread.scrollTop; latestPill().placed(thread) }
  latestState();
  return true;
}
function latestPill() { return chat.pill || (chat.pill = TC.latestPill()) }
function latestState() {
  const thread = chat.el?.querySelector('#thread'); if (!thread) return;
  // Under a held question, the reader has scrolled once its place was let go (pinTop).
  chat.el.querySelector('#latest').hidden = !latestPill().shows(thread, chat.anchor == null || chat.pinTop == null);
}
function renderThread() {
  if (marginOn()) { marginLayout(); if (col.sheet?.dataset.id === 'whole') drawWhole(col.sheet, { sheet: true }); return }
  const el = chat.el, thread = el.querySelector('#thread');
  const kept = thread.scrollTop;
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
  if ((chat.fresh || chat.anchor != null) && turns.length) { const space = document.createElement('div'); space.className = 'tc-spacer'; space.setAttribute('aria-hidden', 'true'); space.style.height = (chat.fresh ? thread.clientHeight : 0) + 'px'; thread.appendChild(space) }
  thread.querySelectorAll('[data-copy]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(chat.turns[b.dataset.copy].display || chat.turns[b.dataset.copy].content); b.innerHTML = TC.ICONS.copied; b.setAttribute('aria-label', 'Copied') } catch { toast('Copy did not work here.') } });
  thread.querySelectorAll('[data-quote]').forEach(b => b.onclick = () => { const t = chat.turns[b.dataset.quote]; if (t?.page) goTo({ page: t.page }, true) });
  renderAttached();
  if (chat.anchor != null && heldRow()) {
    // Held: place the question once; after that the view stays where it is.
    const place = chat.placeAnchor; chat.placeAnchor = false;
    holdQuestion(place);
    if (!place) { thread.scrollTop = kept; latestState() }
    return;
  }
  thread.scrollTop = thread.scrollHeight;
  latestPill().placed(thread);
  el.querySelector('#latest').hidden = true;
}
/** An answer arriving: its text so far, the new words fading in; the view does not follow it. */
function liveText(text) {
  if (chat.live && marginOn()) { chat.live.text = text; renderThread(); return }
  if (!chat.live || !chat.el) return;
  chat.live.text = text;
  const thread = chat.el.querySelector('#thread'), md_ = thread.querySelector('.tc-a.is-streaming .tc-md');
  if (!md_) { renderThread(); return }
  const kept = thread.scrollTop;
  md_.innerHTML = md(text); thread.querySelector('.tc-a.is-streaming .tc-wait')?.remove();
  TC.fadeInWords(md_, chat.live.seen || (chat.live.seen = []));
  if (!holdQuestion(false) && !TC.isAway(thread)) { thread.scrollTop = thread.scrollHeight; latestPill().placed(thread) }
  else { thread.scrollTop = kept; latestState() }
}
async function ask(question, display) {
  const s = await ai();
  const el = chat.el;
  const passage = chat.passage; chat.passage = null;
  const page = currentPlace().page;
  const attached = chat.attach.splice(0); renderTray();
  chat.fresh = false;
  chat.turns.push({ role: 'user', content: question, display, passage: passage?.text, page: passage?.page || page, imgs: attached.map(a => a.thumb), snipText: attached.map(a => a.text).filter(Boolean).join('\n') || undefined, at: Date.now() });
  chat.anchor = chat.turns.length - 1; chat.placeAnchor = true;
  renderThread();
  if (!s) { chat.turns[chat.turns.length - 1].failed = 'Claude is not available on this page.'; renderThread(); toast(AI_OFF); return }
  chat.live = { text: '' }; renderThread();
  const focusPage = passage?.page || attached[0]?.page || page;
  // A PDF's pages go as pages with their printed labels (kind 'pdf'); an EPUB's as today's text.
  // The margin's chat is about the whole PDF: the whole document goes with it (marginDocument, the
  // cached prefix) and the pages around the reader's place; without it, every page as pages.
  const wholeDoc = marginOn() ? await marginDocument(focusPage) : null;
  // A long file: the passages a search of the whole book finds for the question (searchPassages).
  const found = wholeDoc ? await searchPassages(question, wholeDoc) : null;
  const pdf = marginOn() ? await (wholeDoc ? pdfPages(focusPage) : pdfPages(focusPage, { before: focusPage - 1, after: state.pages.length - focusPage, budget: Math.min(9000, Math.floor(180000 / Math.max(1, state.pages.length))) })) : null;
  const ctx = pdf ? '' : await contextText(Math.max(1, focusPage - 1), Math.min(state.pages.length, focusPage + 1), 9000);
  const blobs = sampleImages !== false ? attached.map(a => a.blob).filter(Boolean) : [];
  // A picture goes only with a passage, cropped to it (FIXES-2026-10-15 A4); never a whole page.
  // A selected caption, or a question naming "Figure N" on the reader's page, sends that figure instead (FIXES-2026-10-15 item 7).
  const named = marginOn() && !blobs.length ? await figureAsked(question, passage, page) : null;
  const region = passage && !named ? selectionRegion(passage) : null;
  const image = blobs.length ? null : named ? await figureImage(named.page, named.f) : region ? await pageImage(focusPage, region) : null;
  const snipNote = attached.length ? ` The reader attached ${attached.length > 1 ? attached.length + ' images' : 'an image'}: ${attached.map(a => a.snip ? `${a.kind === 'formula' ? 'a formula' : a.kind === 'figure' ? 'a figure' : 'a snip'} from page ${a.page} of the book` : 'a picture they supplied').join('; ')}. ${blobs.length ? 'Look at the image carefully (axes, labels, curves, notation) and answer about it first, using the book text for context.' : 'You cannot see the picture itself. Below are its caption (if one was found), the labels inside it and a rough text sketch of its shape (often unreadable for drawings or photos). Explain what it shows from these and from the surrounding text, ideally where the text refers to it. This picture is new: never assume it is a figure discussed earlier in the conversation unless its caption says so. If none of this identifies it, say in one sentence that you cannot see it and ask the reader what it shows or for its caption; do not guess.'}` : '';
  const snipText = attached.map(a => [a.caption ? 'Caption: ' + a.caption : '', a.text ? 'Labels and text inside it: ' + a.text : '', !blobs.length && a.sketch ? 'Rough sketch of its shape (# dark ink, + grey, . faint; unreliable for drawings and photos):\n```\n' + a.sketch + '\n```' : ''].filter(Boolean).join('\n')).filter(Boolean).join('\n\n');
  const rules = `You are Tinct's reading companion. ${bookLine()} They are on page ${pageLabel(page)} of ${state.pages.length}.\nAnswer conversationally and concisely (usually under 150 words unless asked for more). ${pdf ? 'Ground answers in the whole document.' : 'Ground answers in the text; say when something is not on these pages.'} ${chat.talk ? 'Your answer will be read aloud: no lists, no symbols that read badly, short sentences.' : 'Plain prose only.'}${image && named ? ` The attached image is ${named.label} on page ${pageLabel(named.page)}, as printed: look at it carefully (axes, labels, curves, colours, notation) and answer about it first, using the document for context.` : image ? (passage ? ' The attached image shows the passage exactly as printed. Text extracted from PDFs often garbles equations and symbols, so trust the image over the extracted text.' : ' The attached image shows the printed page or passage; trust it over the extracted text for equations.') : ''}${snipNote}${ctx ? `\n\nText around the reader's place (extracted, may garble maths):\n${ctx}` : ''}${passage ? `\n\nThe passage they selected on page ${pageLabel(passage.page)}:\n${passage.text.slice(0, 3000)}` : ''}${snipText ? `\n\nWhat the reader attached:\n${snipText.slice(0, 5000)}` : ''}`;
  const history = chat.turns.slice(-11, -1).map(t => ({ role: t.role, content: t.role === 'assistant' ? t.content.replace(/\n\n\*(Claude can’t|That image)[^*]*\*/g, '') : (t.role === 'user' && t.passage ? `About this passage: "${t.passage.slice(0, 600)}"\n` : '') + (t.imgs?.length ? `[Earlier I attached ${t.imgs.length > 1 ? 'images' : 'an image'}; it is not re-sent.${t.snipText ? ' Its text: ' + t.snipText.slice(0, 400) : ''}]\n` : '') + t.content }));
  const input = [{ role: 'user', content: rules }, ...history, { role: 'user', content: question }];
  const ctl = new AbortController(); chat.ctl = ctl;
  try {
    const call = imgs => s(input, { cache: false, signal: ctl.signal, images: imgs?.length ? imgs : undefined, pdf, document: wholeDoc, passages: found, whole: !!pdf, onText: ({ text }) => liveText(text) });
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
  chat.passage = null;
  const ask_ = `Summarize ${ch ? 'the chapter "' + ch.label + '"' : 'these pages'} (pages ${from} to ${to}) for someone reading along: the main ideas and how they connect, key terms or results, in a short paragraph and then 3 to 6 bullets. Use only this text`;
  // A PDF's pages go as pages (kind 'pdf'); an EPUB's text in the request as today.
  if (marginOn()) askSummary(`Summarize ${what}.`, ask_ + '.', await pdfPages(from, { before: 0, after: to - from, budget: Math.floor(120000 / (to - from + 1)) }));
  else askSummary(`Summarize ${what}.`, `${ask_}:\n${await contextText(from, to, 120000)}`);
}
async function askSummary(display, prompt, pdf = null) {
  const s = await ai();
  chat.fresh = false;
  chat.turns.push({ role: 'user', content: display, page: currentPlace().page, at: Date.now() });
  chat.anchor = chat.turns.length - 1; chat.placeAnchor = true;
  chat.live = { text: '' }; renderThread();
  const ctl = new AbortController(); chat.ctl = ctl;
  try {
    const res = await s(`You are Tinct's reading companion. ${bookLine()}\n\n${prompt}`, { signal: ctl.signal, cache: { gcTime: 86400000 }, ...(pdf ? { pdf } : {}), onText: ({ text }) => liveText(text) });
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
      const pdf = marginOn() ? await pdfPages(b.from, { before: 0, after: b.to - b.from, budget: Math.floor(70000 / (b.to - b.from + 1)) }) : null;
      const text = pdf ? '' : await contextText(b.from, b.to, 70000);
      const r = await s.json(`You are Tinct's reading companion. ${bookLine()}\nSummarize pages ${b.from} to ${b.to} for a reader catching up: reply with only JSON {"title": "3 to 6 word name for this stretch", "summary": "2 to 3 plain sentences on what happens or is argued"}.${text ? '\n\n' + text : ''}`, { cache: { gcTime: 86400000 }, ...(pdf ? { pdf } : {}) });
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
// Where the click began, not where its target is now: a click on the bar's note redraws the bar as
// the note editor, so by the time the click reaches here its button has left the page. Read from
// the target, it looked like a click on the page beneath, which opened the highlight or card there
// and closed the editor (notes lost on crowded pages, the Gloss test, 15 Oct 2026).
const clickedIn = (e, sel) => e.composedPath().some(n => n instanceof Element && n.matches(sel));
document.addEventListener('click', e => {
  if (!getSelection().isCollapsed || narr.active || clickedIn(e, '.selection-popup, .lab-ask, .lab-header, .mr-float, .byob-hot-chip')) return;
  // A PDF's highlight opens the margin's bar for it: its colour, its note.
  // A passage with a card opens that card (and folds the others); a highlight's note opens its note card.
  if (marginOn()) {
    if (clickedIn(e, '.mr-col, .mr-marks, .mr-sheet, .mr-card')) return;
    // An EPUB's highlight is offsets in its chapter: measured into boxes here, as its card is.
    const h = highlightAt(e.clientX, e.clientY), found = h && highlights().find(x => x.id === h.id), rec = isEpub() && found ? epubMarkRects(found, { any: true }) : found;
    const card = cardAt(e.clientX, e.clientY);
    if (card && !rec) { openCard(card.id); return }
    if (rec?.rects) { marginOpen({ text: h.text, page: h.page, box: h.box }, { existing: rec }); if (rec.note && marginMode() !== 'phone') openCard('n-' + rec.id) }
    // Focus view: a click on the page away from the pop-up window closes it, as the book reader's does.
    else if (!card && col.open && marginMode() === 'focus' && clickedIn(e, '.pdf-scroll')) openCard(null);
    return;
  }
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
// A picture of the selected passage goes with every passage action on a PDF (Anders, 15 Oct 2026;
// docs/margin/FIXES-2026-10-15.md A4): cropped to the selection plus a small margin, redrawn by
// tinct-api.js at most 1568 px on its long side. EPUBs send none. Signed out, none at all.
const PAGE_IMAGES = true;
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
if (urlHex()) { $('start').hidden = true; showReader(); waitStatus('Opening…') }
if (location.hash === '#read') history.replaceState(null, '', location.pathname + location.search);
window.dispatchEvent(new Event('tinct-reader-ready'));
