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
// A PDF's Tinct text read here in Margin view (js/pdf-text-view.js, openPdfText): an EPUB's path, the PDF's pages cited.
const isPdfText = () => state.kind === 'epub' && !!state.pdfText;
const prefs = Object.assign({ trim: false, full: false, rate: 1, voice: '', dockW: 380, dock: 'docked' }, store.get('prefs') || {});
// "Dark pages" and "Paper tone" were PDF-only switches; the page now follows the reader's theme.
// "Full width" is gone too (19 Oct 2026, evening): Zoom's + widens the page as far as the room allows.
delete prefs.dark; delete prefs.tone; delete prefs.full;
const savePrefs = () => store.set('prefs', prefs);
/* The focus ring on the margin's buttons is for the keyboard only (Anders, 19 Oct 2026: Minimise showed its ring after a
   click). A card opened or redrawn by a click may put the focus on its Minimise for screen readers; with the pointer as
   the last input, no ring shows (css/margin.css [data-mr-input="pointer"]). The keys bring it back. Registered first, so
   no other key handler stops it. */
addEventListener('pointerdown', () => { document.documentElement.dataset.mrInput = 'pointer'; marginPress.busy = marginBusy() }, true);
/* What a press found open before anything folded it (registered first, so it sees the margin as it was): a click on the
   empty margin column then only folds what was open (a card, Before you start, the bar), and writes no note. */
const marginPress = { busy: false };
const marginBusy = () => { try { return !!(col.open || primer.open || mr || document.querySelector('.byob-aa-panel, .lab-super-layer')) } catch { return false } };
addEventListener('keydown', e => { if (!e.metaKey && !e.ctrlKey) document.documentElement.dataset.mrInput = 'keys' }, true);
// The figure view (figureView) closes on Escape before anything else hears it (an open card under it stays open).
addEventListener('keydown', e => { const v = e.key === 'Escape' && document.querySelector('.mr-figview'); if (v) { e.preventDefault(); e.stopImmediatePropagation(); v.close?.() } }, true);

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
// Deleting the book that is open closes it first, so nothing of it is written again after its keys are gone (engine.forgetBookHere).
// The open book is closed first, and the shelf shown only once it and its keys here are gone (the shelf is another page now).
const removeBook = async key => {
  const open = state.key === key || state.pdfText?.key === key;
  if (open) await closeBook({ toShelf: true, stay: true });
  try { return await engine.removeBook(key, { notify: toast }) } finally { if (open) window.TinctStart?.show({ shelf: true }) }
};
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
  await pdfReady();
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
  // An EPUB reads in the Tinct reader on a phone, which opens it from this browser's copy; on the desktop, here (epubHere).
  if (kind === 'epub' && saved && !epubHere(key)) { await openInTinct(bytes, file.name, key, file); return }
  await openBook(kind, bytes, file.name, key);
  if (kind === 'epub' && saved) { epubShelved(bytes, file.name, key, file); return }
  sendAccountCopy(key, file, { kind, name: file.name });
}
// `known`: the record already read from this device (openFromUrl), so a large file is read once (FIXES item 12).
async function openStored(key, known = null) {
  if (needsAccount()) return false;
  await pdfReady();
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
  if (rec.kind === 'epub' && !epubHere(key) && (rec.opened ? (await library.touch(key, { openedAt: rec.opened }), true) : await library.get(key))) { await openInTinct(new Uint8Array(rec.bytes), rec.name, key, pending, { quiet: true }); return true }
  await openBook(rec.kind, new Uint8Array(rec.bytes), rec.name, key, rec);
  // An EPUB read here: named and drawn on the shelf, and its account copy sent, as the Tinct reader's way does (once).
  if (rec.kind === 'epub') { if (pending || !(Number(rec.coverV) >= 2)) epubShelved(new Uint8Array(rec.bytes), rec.name, key, pending, { quiet: true }); return true }
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
  epubFontWait.end?.();   // an earlier open's font wait ends here, nothing moved
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
  if (kind === 'epub') await openEpub(bytes, name, key, rec); else await openPdf(bytes, name, key, rec);
  if (hasBook()) {
    // One write, after the page is drawn, and none when nothing changed: each write rewrites the whole file.
    const patch = { ...(rec?.opened ? { openedAt: rec.opened } : {}), ...(!rec || rec.title !== state.title || (rec.author || '') !== (state.author || '') ? { title: state.title, author: state.author || '' } : {}) };
    if (Object.keys(patch).length) setTimeout(() => library.touch(key, patch), rec ? 2500 : 0);
    // A PDF is a book with its own address (/lab/addbook/?userBook=<hex>): a reload, the
    // library and the book switcher open it again at its place.
    const url = kind === 'pdf' ? bookUrl(key) + (state.pagesAsked ? '&pages' : '') : epubMargin() ? bookUrl(key) : null;
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
// Profile from a reader's own book: the library opens its account cards (src/cards/libraryCards.ts, ?card=).
const PROFILE_URL = '/library?card=you';
let leavingToShelf = false;
async function leaveToShelf(url = LIBRARY_URL) {
  if (leavingToShelf) return;
  leavingToShelf = true;
  leavePlace(); stopNarration();
  await accountCopySent();
  previewWindow().location.assign(url);
}
// Back on this page from My shelf (restored as it was left): the way back works again.
addEventListener('pageshow', () => { leavingToShelf = false });
// /lab/addbook/?userBook=<hex>: this book, from this device, else from the account.
async function openFromUrl(hex) {
  if (needsAccount()) return false;
  await pdfReady();
  showReader();
  waitStatus('Opening…');
  for (const kind of ['pdf', 'epub']) { const rec = await library.get(kind + ':' + hex); if (rec) return openStored(kind + ':' + hex, rec) }
  await cloud.refresh();
  for (const kind of ['pdf', 'epub']) if (cloud.get(kind + ':' + hex)) return openStored(kind + ':' + hex);
  $('column').innerHTML = `<div class="pdf-status" role="alert">That book is no longer on this device or in your account. <a href="${SHELF_URL}">Go to My shelf</a></div>`;
  return false;
}
$('fileInput').onchange = e => { chooseFile(e.target.files[0]); e.target.value = '' };
$('bookBtn').onclick = () => (state.preview ? openContents() : openSwitcher());
let dragDepth = 0;
addEventListener('dragenter', e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { dragDepth++; $('drop').hidden = false } });
addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; $('drop').hidden = true } });
addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', e => { e.preventDefault(); dragDepth = 0; $('drop').hidden = true; if (e.target.closest?.('.lab-ask')) return; chooseFile(e.dataTransfer?.files?.[0]) });

/* ---------- Reader ↔ start page ---------- */
const readerShown = () => document.body.dataset.view === 'reader';
function showReader() { document.body.dataset.view = 'reader'; $('root').hidden = false; window.TinctStart?.hide(); applyLayout() }
async function closeBook({ fromHistory = false, toShelf = false, stay = false } = {}) {
  const hadBook = hasBook();
  closeChat(); marginStop(); stopNarration(); closeAllPopups(); endSnip?.(); ocrStop(); strip?.close();
  window.TinctNotebook?.close();
  ++state.token;
  epubFontWait.end?.();   // an earlier open's font wait ends here, nothing moved
  state.observer?.disconnect(); state.pdf?.destroy?.();
  Object.assign(state, { kind: null, pdf: null, epub: null, pages: [], fit: null, pagesAsked: false, lastPlace: null, key: '', name: '', title: '', author: '', scan: null, textEdition: null, titleReady: null, texts: new Map(), figs: new Map(), preview: null, pdfText: null }); toc.entries = []; toc.ready = false; zoomClass(); pdfTextLeave();
  Object.assign(book, { key: null, pdf: null, task: null, texts: [], numbers: [], matter: [], index: null });
  if (window.CSS?.highlights) for (const [k] of HL_COLORS) CSS.highlights.delete('tinct-hl-' + k);
  chat.turns = []; chat.passage = null; chat.attach = [];
  $('column').innerHTML = '';
  document.body.dataset.view = 'start'; $('root').hidden = true;
  document.title = 'Add a book · Tinct';
  if (!fromHistory && location.hash === '#read') history.back();
  else if (!fromHistory && hadBook && urlHex()) history.replaceState(null, '', location.pathname);
  if (!stay) window.TinctStart?.show({ shelf: toShelf });
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
async function openEpub(bytes, name, key, rec = null) {
  const token = ++state.token;
  epubFontWait.end?.();   // an earlier open's font wait ends here, nothing moved
  closeAllPopups();
  waitStatus('Opening…');
  let book;
  try { book = rec?.parsed || await TinctEpub.parse(bytes, { fallbackTitle: name.replace(/\.epub$/i, ''), onProgress: f => { $('column').querySelector('.pdf-status .tinct-wait')?.setLabel(`Opening… ${Math.round(f * 100)}%`) } }) }
  catch (e) { $('column').innerHTML = `<div class="pdf-status" role="alert">${esc(e?.code === 'drm' || e?.code === 'unsupported' || e?.code === 'bad_epub' || e?.code === 'not_zip' ? e.message : 'This file could not be opened as an EPUB. Choose another file.')}</div>`; return }
  if (token !== state.token) return;
  // A PDF's Tinct text whose crops are still being drawn keeps its document until they are (openPdfText).
  if (!state.pdf || state.pdf !== rec?.pdfText?.drawing) state.pdf?.destroy?.();
  state.observer?.disconnect();
  Object.assign(state, { kind: 'epub', epub: book, pdf: null, key, title: book.title, author: book.authors.join(', '), texts: new Map(), pages: [], ocrPages: null, preview: rec?.preview || null, pdfText: rec?.pdfText || null });
  // The book's Tinct text, when this device converted it in the Tinct reader: the place is shared with it (epubShare).
  state.epubEdition = Array.isArray(rec?.edition?.chapters) ? rec.edition : null;
  root.classList.add('is-epub'); root.classList.remove('is-pdf');
  const saved = store.get('pos:' + state.key);
  state.zoom = saved?.zoom || 1;
  state.lastPlace = saved?.page ? { page: saved.page, frac: saved.frac || 0 } : { page: 1, frac: 0 };
  $('bookTitle').textContent = state.title;
  $('bookBtn').setAttribute('aria-label', `Contents of ${state.title}`);
  document.title = `${state.title} · Tinct`;
  $('column').innerHTML = '';
  applyEpubScale();
  // Tinct paper on the desktop (Anders, 20 Oct 2026): an EPUB reads on the theme's own paper, one continuous page, the
  // margin column beside it, as the preview's Tinct books do; sheets are for a PDF's pages.
  applyPaper();
  for (const c of book.chapters) {
    const sheet = document.createElement('section');
    // The book's own contents page is hidden (Tinct's chapter menu does its job); front matter is set as one compact,
    // centred block, the cover included (Anders, 20 Oct 2026). Each stays a chapter, so places and marks keep their numbers.
    sheet.className = 'epub-sheet' + (c.role === 'toc' ? ' is-toc' : c.role === 'front' ? ' is-front' : c.role === 'cover' ? ' is-cover is-front' : '');
    if (c.role === 'toc') sheet.setAttribute('aria-hidden', 'true');
    sheet.dataset.page = c.index + 1;
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
    if (state.preview) previewUnits(); else epubOwnUnits(book);
    setTimeout(() => (window.requestIdleCallback || setTimeout)(() => { if (token === state.token) readDocument() }), 4000);
    marginStart();
  } else if (!isPhone() && prefs.dock !== 'closed') setTimeout(() => { if (hasBook() && !chat.el?.isConnected) openChat({ quiet: true }) }, 50);
  // The preview: the margin's first layout (reserveColumn's reflow) holds no spot while the place is being restored.
  if (state.preview) { epubHold.spot = null; epubHold.reflow++ }
  // Tinct paper's fonts (the text's and the headings' EB Garamond), waited for at most 1.5 s before the place is found:
  // a heading font that came later moved the text under the restored place (as the preview does, tinct-book.js fontsSoon).
  if (isPaper() && !state.preview && document.fonts?.load) {
    const body = getComputedStyle(root).getPropertyValue('--tb-font').trim() || "'Literata', Georgia, serif";
    await Promise.race([Promise.all([`400 19px ${body}`, `italic 400 19px ${body}`, "700 20px 'EB Garamond'", "600 20px 'EB Garamond'"].map(font => document.fonts.load(font, 'Aa').catch(() => null))), new Promise(r => setTimeout(r, 1500))]);
    if (token !== state.token) return;
  }
  // A first open begins at the first section of the text (the Preface, not the title page; epub.js classify).
  requestAnimationFrame(() => { if (!epubRestore(saved)) { if (saved) goTo({ page: saved.page, frac: saved.frac }); else if (book.start > 0 && !state.preview) epubGoSpot(book.start + 1, 0, 0); else $('scroll').scrollTop = 0 } onScroll(); if (state.preview) setTimeout(() => { epubHold.reflow = Math.max(0, epubHold.reflow - 1) }, 600); epubHold.opened = token; if (!state.preview) epubFontWait(token) });
}
function applyEpubScale() { root.style.setProperty('--epub-scale', String(state.zoom)) }
/**
 * Tinct paper (an EPUB on the desktop, js/tinct-book.js for the preview's Tinct books): the book reader's desktop leaf for
 * this reader and window (TinctReaderLayout.paper, the same formulas as the preview's), on the theme's paper. The
 * preview's frame hands its own (tinct-book.js applyPaper); an own EPUB reads the stored preferences here.
 */
const isPaper = () => isEpub() && !isPhone();
function applyPaper() {
  root.classList.toggle('is-paper', isPaper());
  if (!isPaper() || state.preview) return;
  let p = null;
  try { p = marginPaper(RL.paper(localStorage.getItem('tinct-lab-prefs'), innerWidth)) } catch { p = null }
  if (!p) return;
  const set = (k, v) => root.style.setProperty(k, v);
  set('--tb-font', p.fontFamily); set('--tb-size', p.fontSize + 'px'); set('--tb-head', String(p.headingSize / p.fontSize));
  set('--tb-lh', String(p.lineHeight)); set('--tb-gap', p.paragraphGap + 'em'); set('--tb-align', p.align); set('--tb-measure', p.measure + 'px');
}
addEventListener('resize', () => { if (isEpub()) applyPaper() });
/**
 * Margin view's own text size and line (TinctReaderLayout.marginText, Anders, 20 Oct 2026) on the book reader's paper (its
 * font, leading, paragraph gap, alignment): larger than the book reader's two-page leaf and wider on a wide screen, scaled
 * by this device's Text size and Line width (the Aa panel, prefs.textSize and prefs.lineWidth). A Tinct book's preview
 * keeps the book reader's own text (tinct-book.js applyPaper). -> the paper with its fontSize, headingSize and measure, or null
 */
function marginPaper(p) {
  if (!p) return null;
  const t = RL.marginText(innerWidth, { size: prefs.textSize, width: prefs.lineWidth });
  return { ...p, fontSize: t.fontSize, headingSize: p.headingSize / p.fontSize * t.fontSize, measure: t.measure };
}
/** Text size and Line width in the Aa panel: an EPUB or a PDF's Tinct text of the reader's own on the desktop. */
const typePanel = () => isPaper() && !state.preview;
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
 * The PDF-only scripts (pdf.js and the scan, text, regions, OCR, reading-order, printed-page and search rules):
 * index.html loads them before this file. The margin preview of a Tinct book (book.html, js/tinct-book.js) reads
 * no PDF and leaves them out (round 2: the phone's first page came about 0.3 s later with them); a PDF opened
 * there after all loads them here first, in the same order, with the same cache tags (scripts/check-margin-preview.mjs).
 */
const PDF_SCRIPTS = ['vendor/pdfjs/pdf.min.js', 'js/pdf-scan.js?v=20261016train6', 'js/pdf-regions.js?v=20261020pdfspeed', 'js/pdf-text.js?v=20261020pdfspeed', 'js/pdf-ocr.js?v=20261020epub', 'js/reading-order.js?v=20261016round4', 'js/printed-pages.js?v=20261016round4', 'js/doc-search.js?v=20261015retesth', 'js/pdf-text-view.js?v=20261021dpolish'];
let pdfScripts = null;
function pdfReady() {
  if (window.pdfjsLib && window.TinctPdfScan) return Promise.resolve();
  return (pdfScripts ??= PDF_SCRIPTS.reduce((after, src) => after.then(() => new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = src; s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
  })), Promise.resolve()).then(pdfWorker).catch(e => { pdfScripts = null; throw e }));
}
function pdfWorker() { if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('vendor/pdfjs/pdf.worker.min.js', document.baseURI).href }
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
  await pdfReady();
  const token = ++state.token;
  epubFontWait.end?.();   // an earlier open's font wait ends here, nothing moved
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
  pdfTextLeave();
  Object.assign(state, { pdfText: null });
  Object.assign(state, { kind: 'pdf', pdf, epub: null, key, name, title: scan?.title || rec?.title || TinctPdfScan.cleanFileName(name), author: scan ? scan.author : rec?.author || '', scan, textEdition, textCrops: !!rec?.figureData, ocrPages, texts: new Map(), figs: new Map(), pagesAsked, fit: null, docKind: null });
  if (token !== state.token) return;
  root.classList.add('is-pdf'); root.classList.remove('is-epub', 'is-paper');
  root.style.removeProperty('--epub-scale');
  const first = (await pdf.getPage(1)).getViewport({ scale: 1 });
  state.base = { w: first.width, h: first.height };
  const { late } = await synced;
  if (token !== state.token) return;
  // Read as Tinct text on this device (its own choice, else its default: openKind): the Tinct reader, before the pages draw.
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
const focusRoom = () => (col.mode === 'focus' && innerWidth >= TinctMargin.COL.narrow ? TinctMargin.COLUMN_RESERVE + 14 : 0);
const columnWidth = () => { const room = focusRoom(), w = pagesWidth() - columnPad() - room; return Math.min(w, root.classList.contains('dock-open') || room ? 1100 : 1500) };
/**
 * How far a PDF's page zooms in on the desktop (Anders, 19 Oct 2026, evening: the size slider zoomed the page past
 * the margin view): at most as wide as the reading area (the pages' room, less its padding: never under the margin
 * column, never past the window), so 100% is the fit width and the most is the area's whole width (what "Full
 * width" gave). Phones and EPUBs keep their range.
 */
const ZOOM_MIN = 0.5;
const zoomMax = () => (state.kind !== 'pdf' || isPhone() ? 3 : Math.max(1, Math.min(3, Math.floor((pagesWidth() - columnPad()) / Math.max(1, columnWidth()) * 100) / 100)));
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
  // Found again whenever the page's text layer is built again (a zoom, a redraw): a page's figures are only ever
  // found from its complete text laid over its drawing, never kept from a layer that did not match it (19 Oct 2026).
  setTimeout(() => detectFigures(p), 0);
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
const pct = (v, of) => (v / of * 100).toFixed(4) + '%';
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
    // In fractions of the page (its width for the type: container units), never pixels: the layer then
    // stays on the drawn text while the page's box changes before it is drawn again (a zoom, the column
    // taking its room). A layer in pixels went stale there, and a highlight made in that moment was kept
    // off its words: half a line lower and too far left (Anders, Constructor Theory, 19 Oct 2026).
    span.style.left = pct(tx[4], vp.width);
    span.style.top = pct(tx[5] - size * 0.86, vp.height);
    span.style.fontSize = (size / vp.width * 100).toFixed(4) + 'cqw';
    // Its baseline and size in page fractions: a highlight's band and the passage mark follow each line's own (lineBand).
    if (!angle) { span.dataset.b = (tx[5] / vp.height).toFixed(5); span.dataset.s = (size / vp.height).toFixed(5) }
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
  markFurniture(body, vp.height);
  const lay = layoutBody(body, vp); p.blocks = lay.blocks; p.prose = lay.prose;
  for (const b of body) frag.appendChild(b.span);
  layer.appendChild(frag);
  if (side.childNodes.length) layer.appendChild(side);
  if (fig.childNodes.length) layer.appendChild(fig);
  p.pg.appendChild(layer); p.layer = layer; p.spans = spans;
  resnapHighlights(p);
  renderHighlights(p);
}

/* A page's furniture in its text layer (Anders, 19 Oct 2026: a highlight across pages 4 and 5 of Constructor
   Theory took in "David Deutsch", "Constructor Theory" and the page number): the running head or foot set apart
   at the page's top or foot (its line in the top or bottom eighth, a clear gap from the body, short), and a page
   number alone on its line near an edge. Marked data-f: never selected (user-select: none), never highlighted,
   never in a passage's text. The body's own first and last lines are never furniture (they are not set apart). */
const PAGE_NUMBER_LINE = /^(?:(?:page|p\.|pg\.?)\s*)?(?:\d{1,4}|[ivxlcdm]{1,7})$/i;
function markFurniture(body, height) {
  const rows = [];
  for (const b of [...body].sort((x, y) => x.base - y.base)) {
    const r = rows.find(q => Math.abs(q.base - b.base) < Math.max(2, b.size * 0.3));
    if (r) { r.items.push(b); r.size = Math.max(r.size, b.size) } else rows.push({ base: b.base, size: b.size, items: [b] });
  }
  rows.sort((x, y) => x.base - y.base);
  if (rows.length < 4) return;
  const gaps = rows.slice(1).map((r, i) => r.base - rows[i].base).filter(g => g > 0).sort((x, y) => x - y);
  const lead = gaps[Math.floor(gaps.length / 2)] || rows[0].size * 1.3;
  const text = r => r.items.map(b => b.str).join(' ').replace(/\s+/g, ' ').trim();
  const mark = r => { for (const b of r.items) b.span.dataset.f = '1' };
  const top = rows[0], second = rows[1], last = rows[rows.length - 1], before = rows[rows.length - 2];
  if (top.base < height * 0.125 && second.base - top.base > lead * 1.7 && text(top).length <= 90) mark(top);
  if (last.base > height * 0.875 && last.base - before.base > lead * 1.7 && text(last).length <= 90) mark(last);
  for (const r of rows) if ((r.base < height * 0.15 || r.base > height * 0.85) && PAGE_NUMBER_LINE.test(text(r))) mark(r);
}
/**
 * The selection's body text on the pages, as rects and words (Anders, 19 Oct 2026, a selection across pages): only
 * the text layer's text, never page furniture (data-f), a side column or a figure's labels unless the selection
 * starts or ends there, and never a box of only spaces or a line break. -> { rects, text }
 */
function bodyOfRange(range) {
  const rects = [], words = [];
  const startCol = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement)?.closest?.('.side-col'), endCol = (range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement)?.closest?.('.side-col');
  const root = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!range.intersectsNode(n)) continue;
    const span = n.parentElement; if (!span?.closest('.text-layer')) continue;
    if (span.dataset.f) continue;
    const col = span.closest('.side-col');
    if (col && col !== startCol && col !== endCol) continue;
    let a = n === range.startContainer ? range.startOffset : 0, b = n === range.endContainer ? range.endOffset : n.length;
    const t = n.nodeValue;
    while (a < b && /\s/.test(t[a])) a++;
    while (b > a && /\s/.test(t[b - 1])) b--;
    if (b <= a) continue;
    const r = document.createRange(); r.setStart(n, a); r.setEnd(n, b);
    for (const box of r.getClientRects()) if (box.width > 0.5 && box.height > 0.5) rects.push(box);
    // A word split over two items runs on (no space); otherwise the item's own space or line break is a space.
    words.push(t.slice(a, b) + (/\s/.test(t[b] || '') ? ' ' : ''));
  }
  return { rects, text: words.join('').replace(/\s+/g, ' ').trim() };
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
  // A PDF's text layer: its body text only (bodyOfRange); anything else (an EPUB's text) as the range draws it.
  const at = n => (n.nodeType === 1 ? n : n.parentElement)?.closest?.('.text-layer');
  const inLayer = !!(at(range.startContainer) || at(range.endContainer));
  let rects = (inLayer ? bodyOfRange(range).rects : textRects(range)).filter(r => r.width > 0.5 && r.height > 0.5);
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
/**
 * A range's boxes of text only (Anders, 20 Oct 2026, EPUB highlights): Range.getClientRects() also gives the border box
 * of every element the range holds whole (a paragraph, a heading), a full-width box whose foot lies on the last line, so
 * the passage mark struck through that line and ran past its last word, and merged lines lost their own marks. Here
 * each text node's own part of the range, line by line.
 */
function textRects(range) {
  if (!range) return [];
  const root = range.commonAncestorContainer, out = [];
  if (root.nodeType === 3) return [...range.getClientRects()];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node; (node = walker.nextNode());) {
    if (!range.intersectsNode(node)) continue;
    const r = document.createRange();
    r.selectNodeContents(node);
    if (node === range.startContainer) r.setStart(node, range.startOffset);
    if (node === range.endContainer) r.setEnd(node, range.endOffset);
    if (r.collapsed) continue;
    for (const box of r.getClientRects()) out.push(box);
  }
  return out;
}
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
/* The phone's EPUB selection, the reader's own (ownSelection, below): its state, and its paint (the CSS Custom Highlight
   API, as an EPUB's highlights are drawn): the passage while it is pressed and dragged, then while its bar is open. */
const own = { timer: 0, x: 0, y: 0, at: 0, on: false, a: null, range: null, moved: false, tap: 0 };
function paintOwn(range) {
  if (!window.CSS?.highlights || typeof Highlight === 'undefined') return;
  if (range) CSS.highlights.set('tinct-sel', new Highlight(range)); else CSS.highlights.delete('tinct-sel');
}
function paintSelection() {
  paintOwn(own.on ? own.range : mr?.own && !mr.ids.length && mr.mode !== 'note' && rangeInText(mr.info?.range) ? mr.info.range : null);
  document.querySelectorAll('.sel-layer').forEach(l => l.replaceChildren());
  const s = getSelection();
  if (!s || s.isCollapsed || !s.rangeCount || !s.anchorNode?.parentElement?.closest('.text-layer')) { paintHeld(); return }
  for (const bar of selectionShapes(s.getRangeAt(0))) {
    const p = pageForPoint((bar.left + bar.right) / 2, (bar.top + bar.bottom) / 2); if (!p) continue;
    const r = p.pg.getBoundingClientRect(), i = document.createElement('i');
    // The selection's tint keeps to each line's band too, never over the next line's words (lineBand).
    const [x, y, w, h] = bandBox(p, [(bar.left - r.left) / r.width, (bar.top - r.top) / r.height, (bar.right - bar.left) / r.width, (bar.bottom - bar.top) / r.height]);
    Object.assign(i.style, { left: x * 100 + '%', top: y * 100 + '%', width: w * 100 + '%', height: h * 100 + '%' });
    layerOf(p, 'sel-layer').appendChild(i);
  }
}
document.addEventListener('selectionchange', paintSelection);
// A passage the margin holds (Ask typed, the bar's menus) stays marked as selected until the margin lets go.
function paintHeld() {
  if (!mr?.anchor || mr.ids.length || !(mr.held || mr.mode === 'asking')) return;
  for (const a of mr.anchor) {
    const p = state.pages[a.n - 1]; if (!p) continue;
    const i = document.createElement('i'), [x, y, w, h] = bandBox(p, [a.x, a.y, a.w, a.h]);
    Object.assign(i.style, { left: x * 100 + '%', top: y * 100 + '%', width: w * 100 + '%', height: h * 100 + '%' });
    layerOf(p, 'sel-layer').appendChild(i);
  }
}
const highlights = () => { const own = store.get('hl:' + state.key) || []; return isPdfText() ? [...own, ...pdfHighlightsHere()] : own };
const HL_COLORS = [['gold', 'Gold', 'rgba(232,196,92,.42)', '#e9cf86'], ['rose', 'Rose', 'rgba(232,118,128,.30)', '#eba7ad'], ['sage', 'Sage', 'rgba(108,178,108,.32)', '#a9d0a3'], ['sky', 'Sky', 'rgba(96,148,226,.30)', '#a6c2ee'], ['lavender', 'Lavender', 'rgba(156,116,222,.30)', '#c6b0ee']];
const hlFill = c => (HL_COLORS.find(x => x[0] === c) || HL_COLORS[0])[2];
function recolorHighlight(id, color) {
  if (changeTextHighlight(id, list => list.map(x => (x.id === id ? { ...x, color } : x)))) { prefs.hlColor = color; savePrefs(); return }
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
/*
 * A line's own band on its page (Anders, 19 Oct 2026: the passage's underline sat too low and cut into the next line;
 * a highlight's tint must never cover a neighbouring line's words, even at tight line spacing). From the text layer's
 * spans (their baselines and sizes, data-b and data-s, in page fractions): the line whose baseline lies in the box
 * `[x, y, w, h]`, its glyphs from 0.8 of its size above the baseline to 0.24 below, kept clear of the lines above and
 * below it in the same column (their descenders and ascenders). -> { top, bottom, base, size } in page fractions, or
 * null when the page's text is not drawn or no line is in the box (then the stored box is drawn as it is).
 */
function pageLines(p) {
  if (!p?.layer) return null;
  if (p.linesOf === p.layer) return p.lines;
  const rows = [];
  for (const sp of p.layer.querySelectorAll('span[data-b]')) {
    if (sp.dataset.f || !(sp.textContent || '').trim()) continue;
    const b = Number(sp.dataset.b), sz = Number(sp.dataset.s), x0 = parseFloat(sp.style.left) / 100;
    if (!(sz > 0)) continue;
    const w = sp.getBoundingClientRect().width / Math.max(1, p.pg.getBoundingClientRect().width);
    let row = rows.find(r => Math.abs(r.b - b) < Math.min(r.s, sz) * 0.3 && x0 <= r.x1 + r.s * 4 && x0 + w >= r.x0 - r.s * 4);
    if (!row) { row = { b, s: sz, x0, x1: x0 + w }; rows.push(row) }
    else { row.s = Math.max(row.s, sz); row.x0 = Math.min(row.x0, x0); row.x1 = Math.max(row.x1, x0 + w) }
  }
  p.lines = rows.sort((a, b) => a.b - b.b); p.linesOf = p.layer;
  return p.lines;
}
function lineBand(p, [x, y, w, h]) {
  const lines = pageLines(p); if (!lines?.length) return null;
  const across = l => l.x0 < x + w && l.x1 > x;
  // A line's box holds its baseline in its lower part (about three quarters down); a neighbour's, at tight spacing, lies
  // just outside it. A box with several baselines inside it (a displayed formula's) is not one line's: drawn as it is.
  const inside = lines.filter(l => across(l) && l.b >= y + h * 0.1 && l.b <= y + h * 1.05);
  if (inside.some(l => Math.abs(l.b - inside[0].b) > Math.min(l.s, inside[0].s) * 0.6)) return null;
  const own = inside.filter(l => l.b >= y + h * 0.4);
  if (!own.length) return null;
  const want = y + h * 0.78, line = own.reduce((a, l) => (Math.abs(l.b - want) < Math.abs(a.b - want) ? l : a));
  const gap = 0.6 / Math.max(1, p.pg.getBoundingClientRect().height);
  let top = line.b - line.s * 0.8, bottom = line.b + line.s * 0.24;
  const prev = lines.filter(l => across(l) && l.b < line.b - line.s * 0.5).at(-1), next = lines.find(l => across(l) && l.b > line.b + line.s * 0.5);
  if (prev) top = Math.max(top, prev.b + prev.s * 0.22 + gap);
  if (next) bottom = Math.min(bottom, next.b - next.s * 0.74 - gap);
  return bottom > top ? { top, bottom, base: line.b, size: line.s, next } : null;
}
/** A box as drawn on its page: a line's box snapped to that line's band (lineBand); a figure's box, or one with no line, as it is. */
function bandBox(p, r, { box = false } = {}) {
  const band = !box && lineBand(p, r);
  return band ? [r[0], band.top, r[2], band.bottom - band.top] : r;
}
/*
 * A highlight kept before whole words (19 Oct 2026: one began at "ection") is re-snapped to them once its page's text is
 * drawn, only when that is safe: its words occur once on the page, the letters it lacks touch them with no space
 * between, and they sit on its own first or last line, just beside its box. Then its text and that box grow to the
 * whole word (and it syncs as any change). It is never moved onto other words.
 */
function resnapHighlights(p) {
  if (state.kind !== 'pdf' || !p?.layer) return;
  const list = highlights(), mine = list.filter(h => h.page === p.n && !h.box && !h.gone && h.text && h.rects?.some(r => r[2] > 0 && r[3] > 0));
  if (!mine.length) return;
  const nodes = layerTexts(p.layer.querySelector('span')?.firstChild); if (!nodes?.length) return;
  let raw = '', norm = '';
  const map = [];
  for (const n of nodes) raw += n.data;
  for (let k = 0; k < raw.length; k++) { if (/\s/.test(raw[k])) { if (norm && !norm.endsWith(' ')) { norm += ' '; map.push(k) } } else { norm += raw[k]; map.push(k) } }
  const pr = p.pg.getBoundingClientRect(); if (!pr.width || !pr.height) return;
  const boxOfRaw = (a, b) => { const r = rangeFromOffsets(p.layer, a, b); if (!r) return null; const rs = [...r.getClientRects()].filter(q => q.width > 0.3); if (!rs.length) return null; const u = boxOf(rs); return { x: (u.left - pr.left) / pr.width, y: (u.top - pr.top) / pr.height, x1: (u.right - pr.left) / pr.width, y1: (u.bottom - pr.top) / pr.height } };
  let changed = false;
  for (const h of mine) {
    const text = String(h.text).replace(/\s+/g, ' ').trim(), at = norm.indexOf(text);
    if (at < 0 || norm.indexOf(text, at + 1) >= 0) continue;
    let a = at, b = at + text.length;
    while (a > 0 && WORD_CH.test(norm[a - 1]) && WORD_CH.test(norm[a])) a--;
    while (b < norm.length && WORD_CH.test(norm[b]) && WORD_CH.test(norm[b - 1])) b++;
    if (a === at && b === at + text.length) continue;
    const rects = h.rects.map(r => [...r]), first = rects.reduce((m, r) => (r[1] < m[1] - 0.004 || (Math.abs(r[1] - m[1]) <= 0.004 && r[0] < m[0]) ? r : m)), last = rects.reduce((m, r) => (r[1] + r[3] > m[1] + m[3] + 0.004 || (Math.abs(r[1] + r[3] - m[1] - m[3]) <= 0.004 && r[0] + r[2] > m[0] + m[2]) ? r : m));
    // The added letters must sit on the box's own line, right beside it (within a letter's width): else nothing moves.
    const beside = (q, r, side) => q && Math.min(q.y1, r[1] + r[3]) - Math.max(q.y, r[1]) > (r[3] * 0.4) && (side < 0 ? Math.abs(q.x1 - r[0]) < r[3] * 0.8 : Math.abs(q.x - (r[0] + r[2])) < r[3] * 0.8);
    const pre = a < at ? boxOfRaw(map[a], map[at]) : null, post = b > at + text.length ? boxOfRaw(map[at + text.length - 1] + 1, map[b - 1] + 1) : null;
    if ((a < at && !beside(pre, first, -1)) || (b > at + text.length && !beside(post, last, 1))) continue;
    if (pre) { const right = first[0] + first[2]; first[0] = Math.round(Math.min(first[0], pre.x) * 10000) / 10000; first[2] = Math.round((right - first[0]) * 10000) / 10000 }
    if (post) last[2] = Math.round((Math.max(last[0] + last[2], post.x1) - last[0]) * 10000) / 10000;
    h.rects = rects; h.text = norm.slice(a, b).slice(0, 2000); h.u = Date.now(); changed = true;
  }
  if (changed) { store.set('hl:' + state.key, list); marksSync.changed() }
}
function renderHighlights(p) {
  if (!p) return;
  if (p.kind === 'epub') return renderEpubHighlights();
  const layer = layerOf(p, 'hl-layer'); layer.replaceChildren();
  for (const h of highlights().filter(h => h.page === p.n)) for (const r of h.rects) {
    if (!(r[2] > 0) || !(r[3] > 0)) continue;   // a margin note's spot (a box of no size) draws nothing
    const [x, y, w, hh] = bandBox(p, r, { box: !!h.box });
    const i = document.createElement('i'); i.dataset.id = h.id; if (h.box) i.className = 'is-box'; i.style.setProperty('--hl', hlFill(h.color));
    Object.assign(i.style, { left: x * 100 + '%', top: y * 100 + '%', width: w * 100 + '%', height: hh * 100 + '%' });
    layer.appendChild(i);
  }
  // Highlights made in the PDF's Tinct text (openPdfText), where their words are on this page.
  p.textMarks = textHighlightsOn(p);
  for (const { h, rects } of p.textMarks) for (const r of rects) {
    const [x, y, w, hh] = bandBox(p, r);
    const i = document.createElement('i'); i.dataset.id = h.id; i.className = 'is-text'; i.style.setProperty('--hl', hlFill(h.color));
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
/** A highlight of the PDF's Tinct text shown on its pages (textHighlightsOn): changed in its own list. -> true when it was one */
function changeTextHighlight(id, change) {
  if (state.kind !== 'pdf' || !PT() || highlights().some(x => x.id === id)) return false;
  const k = 'hl:' + PT().keyOf(hexOf(state.key)), list = store.get(k) || [], h = list.find(x => x.id === id);
  if (!h) return false;
  store.set(k, change(list, h));
  for (const p of state.pages) if (p.textMarks?.some(m => m.h.id === id)) renderHighlights(p);
  return true;
}
function removeHighlight(id) {
  if (changeTextHighlight(id, list => list.filter(x => x.id !== id))) return;
  const h = highlights().find(x => x.id === id);
  // A PDF remembers the removal (a tombstone), so the account's copy and other devices lose it too.
  if (h && state.kind === 'pdf') store.set('hl-gone:' + state.key, TinctMargin.mergeMarks(store.get('hl-gone:' + state.key) || [], [TinctMargin.tombstone(id)]));
  putHighlights(highlights().filter(x => x.id !== id));
  if (h) renderHighlights(state.pages[h.page - 1]);
}
// Saved highlights of the open book; a PDF's go to the account too when signed in (marksSync).
function putHighlights(list) {
  if (isPdfText()) putPdfTextHighlights(list); else store.set('hl:' + state.key, list);
  if (state.kind === 'pdf') marksSync.changed();
  // A note added, changed or removed is a card in the margin (or no longer one).
  if (marginOn()) marginLayout({ fresh: true });
}
function highlightAt(x, y) {
  if (isEpub()) return epubHighlightAt(x, y);
  const p = pageForPoint(x, y); if (!p) return null;
  const r = p.pg.getBoundingClientRect(), fx = (x - r.left) / r.width, fy = (y - r.top) / r.height;
  const inside = rects => rects.some(([a, b, w, hh]) => fx >= a && fx <= a + w && fy >= b && fy <= b + hh);
  const found = highlights().find(h => h.page === p.n && inside(h.rects));
  const text = found ? null : (p.textMarks || []).find(m => inside(m.rects));
  const h = found || (text && { ...text.h, page: p.n, rects: text.rects });
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
    const text = r.toString().replace(/\s+/g, ' ').trim().slice(0, 2000) || info.text.slice(0, 2000);
    // A PDF's Tinct text: the page its words are printed on, to show it on the PDF's pages too (textHighlightsOn).
    const pdfPage = isPdfText() ? pdfTextPage(p.n, text) : null;
    list.push({ id, page: p.n, start, end, text, color: color || prefs.hlColor || 'gold', at: Date.now(), ...(pdfPage ? { pdfPage } : {}) });
  }
  if (isPdfText()) putPdfTextHighlights(list); else store.set('hl:' + state.key, list);
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
    const rects = textRects(r);
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
/**
 * The page (an EPUB's chapter) the reader is reading, for the chapter the pill, the contents and the chapter's
 * cards name: the page at the view's top, or the next one once its top has passed the upper third of the view
 * (round 3: "The Window · 3" stood a third down the phone's screen while the pill still said 2). One rule for PDFs
 * and EPUBs; the place kept (currentPlace) is still the page at the top.
 */
const READING_LINE = 1 / 3;
function readingPage(place = currentPlace()) {
  const next = state.pages[place.page], s = $('scroll');
  if (!next || place.frac >= 1) return place.page;
  return next.sheet.getBoundingClientRect().top <= s.getBoundingClientRect().top + s.clientHeight * READING_LINE ? place.page + 1 : place.page;
}
function goTo(place, smooth) {
  const p = state.pages[Math.max(1, Math.min(state.pages.length, place.page)) - 1];
  if (!p) return;
  // A jump asked for (the contents, a citation, a card's passage) lets go of the place held while a card answers (holdPlace).
  if (typeof releasePlace === 'function') releasePlace();
  const s = $('scroll'), r = p.sheet.getBoundingClientRect();
  const y = s.scrollTop + r.top - s.getBoundingClientRect().top + (place.frac || 0) * r.height - (place.frac ? 0 : 10);
  s.scrollTo({ top: y, behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
}
let saveTimer;
function onScroll() {
  if (!state.pages.length) return;
  strip?.update();
  const place = currentPlace(), n = state.pages.length;
  const ch = toc.ready ? chapterAt(readingPage(place)) : null;
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
  // A place kept without its paragraph (the view's top was in the space at a chapter's end) takes the paragraph
  // as soon as there is one, though the view has hardly moved: else a reload opens in that space, a chapter early.
  const moved = !sameSpot(place, state.lastPlace) || (isEpub() && !Number.isInteger(prev.para) && epubSpot().para != null);
  if (moved) state.lastPlace = place;
  // A move in a PDF is read in Original pages, at this spot in its Tinct text when this device has it.
  const read = moved && state.kind === 'pdf' ? { edition: 'p', ...textSpot(place) } : moved && isEpub() ? epubSpot() : {};
  // A PDF's zoom on a phone is kept apart (phoneZoom), and only once the reader chose it: until then the column fit is worked out again.
  const zoom = state.kind === 'pdf' && isPhone() ? (state.fit ? {} : { phoneZoom: state.zoom }) : { zoom: state.zoom };
  store.set('pos:' + state.key, moved ? { ...prev, ...place, ...read, ...zoom, pages: state.pages.length, at: Date.now() } : { ...prev, ...zoom, pages: state.pages.length });
  const hist = store.get('read:' + state.key) || { furthest: 1 };
  if (place.page > hist.furthest) { hist.furthest = place.page; store.set('read:' + state.key, hist) }
  if (moved && state.kind === 'pdf') placeSync.note(hexOf(state.key));
  if (moved && isEpub()) { if (isPdfText()) pdfTextShare(); else epubShare() }
  if (moved) justRead.note();
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
// Which one a PDF opens in is this device's (Anders, 19 Oct 2026): only the place syncs, and the
// edition it was read in never decides. TinctPdfText.choice (app/src/lab/userBook/pdfEditions.ts).
const hasText = () => state.kind === 'pdf' && (state.scan ? state.scan.textPages > 0 || isOcrText() : !!state.textEdition);
// A scan whose text the account recognised (js/pdf-ocr.js): its Tinct text opens by its own default.
const isOcrText = () => state.textEdition?.source === 'ocr';
// The reader's own choice on this device (the phone's default kept there is not one: TinctReaderLayout.ownChoice).
const ownEdition = () => window.TinctReaderLayout.ownChoice(store.get('edition:' + hexOf(state.key)), store.get('phone-edition:' + hexOf(state.key)), store.get('desk-edition:' + hexOf(state.key)));
// With none, the default: a recognised scan's own; on a phone, by the document's kind (phoneKind); on the desktop, its pages (Margin view; deskKind).
const editionDefault = scan => isOcrText() ? TinctPdfOcr.defaultEdition(state.textEdition) : window.TinctReaderLayout.openDefault({ phone: isPhone(), kind: state.docKind?.kind, layout: scan?.layout });
// This device's kept default (phoneKind): the phone's on a phone. The desktop's mark (desk-edition:<hex>) is a
// default too, never a choice: one kept as Tinct text under the prose rule of 16 Oct must not keep a PDF there,
// so the desktop's rule (its pages: TinctReaderLayout.desktopEdition) decides afresh (Anders, 19 Oct 2026).
const keptEdition = () => isPhone() ? store.get('phone-edition:' + hexOf(state.key))?.edition || null : null;
const editionChoice = scan => TinctPdfText.choice(ownEdition(), keptEdition(), editionDefault(scan));
/* Phones open a PDF by its kind (Anders, 16 Oct 2026, option C; TinctReaderLayout.docKind, phoneEdition): a
   narrative or an essay as its Tinct text, a paper too when it is mostly prose (no columns, mathematics, figures
   or tables: the scan's own rule), everything else in its pages at the column fit. Told here, before any AI call, from
   a primer kept for the book (its kind wins) or the text of a few pages and the scan, and only when the reader
   has chosen nothing for the book on this device (the place's edition is not a choice). The default is kept as
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
  if (ownEdition()) return;
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
/* The desktop opens every PDF as its pages, in Margin view (Anders, 19 Oct 2026: Margin view is the main
   desktop experience; TinctReaderLayout.desktopEdition), running prose too; Tinct text only by the reader's
   own choice on this device ("Convert to Tinct book"). Told as on a phone (the kind from a kept primer or a few
   pages' text, no AI call), only when the reader has chosen nothing for the book, and kept as this
   device's edition marked as the desktop's (desk-edition:<hex>), so the library and the Tinct reader
   open it the same way and a choice of the reader's replaces it.
   A place carries the edition it was read in, here or on another device; it never decides the view
   (Anders, 19 Oct 2026: a PDF's view is chosen per device, only the place syncs). */
const DESK_V = 1;
// The open rule this device has applied to a book (also app/src/lab/userBook/pdfEditions.ts).
const OPEN_RULE = 2;
async function deskKind(scan, token) {
  if (isPhone() || state.kind !== 'pdf' || !scan || !(scan.textPages > 0) || isOcrText() || state.pagesAsked) return;
  const hex = hexOf(state.key), RL = window.TinctReaderLayout;
  if (ownEdition()) return;
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
}
// The edition a PDF opens in, told for this device before the Tinct text is forwarded to: on a phone by
// its kind (phoneKind), on the desktop its pages (deskKind). Then marked as opened
// under this rule, so the library and the Tinct reader open it as this device does (pdfEditions.ts).
async function openKind(scan, token) {
  await (isPhone() ? phoneKind(scan, token) : deskKind(scan, token));
  if (token !== state.token || state.kind !== 'pdf' || !scan || state.pagesAsked) return;
  store.set('open-rule:' + hexOf(state.key), OPEN_RULE);
}
const textUrl = page => '/reader?userBook=' + encodeURIComponent(hexOf(state.key)) + (page ? '&page=' + page : '');
// Opened here but read as Tinct text: on to the Tinct reader (not for a link that asks for the pages).
// A scan whose text was recognised opens as text PDFs do (Anders, 20 Oct 2026): on a phone its Tinct text
// by default (its own: TinctPdfOcr.defaultEdition, kept as the phone's in ocrKeep); on the desktop here, its
// words laid over its pages with the margin, unless the reader chose Tinct text on this device.
function forwardToText(scan) {
  if (!scan || state.pagesAsked) return false;
  const text = scan.textPages > 0 ? editionChoice(scan) === 'text' : isOcrText() && (ownEdition() === 'text' || (isPhone() && editionChoice(scan) === 'text'));
  if (!text) return false;
  // The desktop reads it here, in Margin view (openPdfText); a phone in the Tinct reader.
  if (!isPhone()) { openPdfText(); return true }
  const pos = store.get('pos:' + state.key);
  location.replace(textUrl(pos?.page));
  return true;
}
// "Tinct text": the place now, read from here on in the Tinct text, sent at once; then the reader.
function readAsText() {
  if (state.preview) return previewLeave();
  if (isPdfText()) return;
  if (isEpub()) return epubToTinct();
  if (!hasText()) return;
  // On the desktop the Tinct text reads here, beside the margin (Anders, 20 Oct 2026, mockup 2b): never the Tinct reader.
  if (!isPhone()) return openPdfText();
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
// Margin view or Focus view picked in the Aa panel while this device reads the PDF as Tinct text (a look at a
// page, &pages: "Show page"): the way back. Its pages become this device's own choice, as "Original pages" in the
// Tinct reader does (pdfEditions.ts choosePdfPageAt), so the next open stays here (Anders, 19 Oct 2026).
function keepPagesHere() {
  if (state.kind !== 'pdf' || !hasText() || editionChoice(state.scan) !== 'text') return;
  const hex = hexOf(state.key);
  store.set('edition:' + hex, 'pages'); store.del('phone-edition:' + hex); store.del('desk-edition:' + hex);
  if (state.pagesAsked) {
    state.pagesAsked = false;
    try { history.replaceState(history.state, '', bookUrl(state.key)) } catch { /* kept */ }
  }
}
/* ---------- A PDF's Tinct text in Margin view (the desktop; js/pdf-text-view.js) ----------
   "Tinct text" on the desktop (Anders, 20 Oct 2026, mockup 2b): the PDF's own Tinct text (pdf-text.js, or a recognised
   scan's), reflowed here on Tinct paper with the margin beside it, through the EPUB path (openEpub). Its place, highlights
   and cards on this device are kept under 'pdftext:<hex>'; a move is kept as the PDF's place too (the page it is on, and
   the spot in the text: pdfTextShare), so "Original pages" opens at the same place, and the PDF's own opens here at it.
   The PDF's highlights and notes show here where their words are found on their page (pdfHighlightsHere), and this
   view's highlights on the PDF's pages where their words are found there (textHighlightsOn); a change to either is
   kept with its own. The margin's requests read the document as the PDF's pages, so their answers cite them. */
const PT = () => window.TinctPdfTextView;
const pdfTextUrls = new Set();
// The crops of a text converted on this open, still being drawn (pdf-text-view.js cropper): nearest the reader's page first.
let pdfTextCrops = null;
const hasFigures = e => (e?.chapters || []).some(c => c.figures?.length);
/** No Tinct text on this device yet, or its crops are not here: it is converted. */
const pdfTextWanted = (edition, rec) => !edition || (edition.source !== 'ocr' && hasFigures(edition) && !rec?.figureData);
/*
 * The PDF's Tinct text converted on this device (pdf-text.js convert, its crops by pdf-text-view.js cropper), and kept on
 * its record with its crops once all are drawn (a text without them is converted again on the next open). One per open of
 * the PDF: asked again (the reader chose Tinct text while it was being prepared), the same one goes on, at full speed.
 * `idle`: a page at a time, when the browser is idle (pdfTextPrepare). -> { done: Promise<edition | null>, images, crops }.
 */
let pdfTextJob = null;
function pdfTextConvert(token, scan, page, { idle = false } = {}) {
  const key = state.key, pdf = state.pdf;
  if (pdfTextJob && pdfTextJob.key === key && pdfTextJob.pdf === pdf) { if (!idle) pdfTextJob.hurry(); pdfTextJob.crops?.near(page); return pdfTextJob }
  const images = new Map(), crops = PT().cropper(images), waiting = new Set();
  let slow = idle;
  const later = window.requestIdleCallback ? f => requestIdleCallback(f) : f => setTimeout(f, 250);
  const pace = () => (slow ? new Promise(r => { waiting.add(r); later(() => { waiting.delete(r); r() }) }) : null);
  if (crops) { crops.pace = pace; crops.near(page) }
  const job = { key, pdf, images, crops, hurry() { slow = false; for (const r of waiting) r(); waiting.clear() } };
  job.done = (async () => {
    let edition = null;
    try { edition = await TinctPdfText.convert(pdf, { scan, ...(crops ? { regions: crops } : {}), live: () => state.pdf === pdf, pace, ...(idle ? { concurrency: 2 } : {}) }) } catch (e) { console.warn('[addbook] Tinct text', e) }
    if (!edition) { crops?.stop(); if (pdfTextJob === job) pdfTextJob = null; return null }
    if (state.key === key) state.textEdition = edition;
    // Kept, it is read from the record from now on: this one lets go of its pictures.
    const keep = () => library.touch(key, { edition, figureData: Object.fromEntries(images) }).then(() => { if (state.key === key) state.textCrops = true; if (pdfTextJob === job) pdfTextJob = null }, () => {});
    if (!crops || !hasFigures(edition)) { crops?.stop(); await keep() }
    else crops.drawn().then(all => (all ? keep() : null));
    return edition;
  })();
  pdfTextJob = job;
  return job;
}
/*
 * A text PDF read in its pages on the desktop is converted to its Tinct text in the background, a page whenever the browser
 * is idle, so "Tinct text" opens at once the first time it is chosen (and the Tinct reader finds it kept on the record).
 */
function pdfTextPrepare(token) {
  if (isPhone() || state.kind !== 'pdf' || !state.pdf || !PT() || !(state.scan?.textPages > 0) || pdfTextJob?.pdf === state.pdf) return;
  // What the record holds is known from its open (openPdf): nothing more is read from it here.
  if (token !== state.token || !pdfTextWanted(state.textEdition, { figureData: state.textCrops })) return;
  pdfTextConvert(token, state.scan, store.get('pos:' + state.key)?.page || 1, { idle: true });
}
function pdfTextLeave() { for (const u of pdfTextUrls) URL.revokeObjectURL(u); pdfTextUrls.clear() }
let pdfTextOpening = null;
async function openPdfText() {
  if (state.kind !== 'pdf' || !state.pdf || !PT() || pdfTextOpening) return false;
  const key = state.key, hex = hexOf(key), pdf = state.pdf, scan = state.scan, token = state.token, drawn = state.pages.length > 0;
  if (drawn) savePlaceNow();
  const pos = store.get('pos:' + key) || {};
  const place = drawn ? currentPlace() : { page: pos.page || 1, frac: pos.frac || 0 };
  // This device reads it as its Tinct text from now on (the reader's choice; a recognised scan's switch too, as the Tinct reader's adoptOcrEditionChoice).
  store.set('edition:' + hex, 'text'); store.del('phone-edition:' + hex); store.del('desk-edition:' + hex);
  pdfTextOpening = (async () => {
    const rec = await library.get(key);
    let edition = state.textEdition, figureData = rec?.figureData || null, crops = null;
    // Converted here when this device has no Tinct text yet (or its crops are not on this device): the same rules and crops as the Tinct reader's.
    // A conversion begun in idle time (pdfTextPrepare) goes on at full speed. The text opens once it is converted; its crops are
    // drawn after, nearest the reader's page first, each standing at its size until it comes (pdf-text-view.js cropper).
    if (pdfTextWanted(edition, rec) && scan?.textPages > 0) {
      const said = drawn ? setTimeout(() => toast('Preparing the Tinct text…', { hold: true }), 400) : null;
      const job = pdfTextConvert(token, scan, place.page);
      const made = await job.done;
      clearTimeout(said);
      if (token !== state.token) return false;
      if (made) { edition = made; figureData = job.images; crops = job.crops?.busy() ? job.crops : null }
    }
    if (token !== state.token) return false;
    if (!edition) { toast('This PDF has no text to reflow. Its pages stay as they are.'); store.set('edition:' + hex, 'pages'); if (!drawn) location.reload(); return false }
    // The PDF's labels, to cite its pages as the pages do (pageLabel).
    const labels = state.labels || (store.get('printed:' + key)?.labels) || null;
    const src = id => { const f = figureData instanceof Map ? figureData.get(id) : figureData?.[id]; if (!f?.data) return null; const u = URL.createObjectURL(new Blob([f.data], { type: f.type || 'image/png' })); pdfTextUrls.add(u); return u };
    pdfTextLeave();
    let book = null;
    pdfTextCrops = crops;
    if (crops) crops.onDrawn = id => { if (book && state.pdfText?.edition === edition) PT().figureCame(book, id, src(id)) };
    book = PT().bookOf(edition, { title: state.title, author: state.author, figureSrc: src, figureWaits: id => !!crops && !figureData.has(id) });
    const tkey = PT().keyOf(hex);
    // At the same place: the PDF's page and how far down it, as a paragraph and word of the text (both ways: pageAt).
    const at = PT().spotAt(edition, place.page, place.frac);
    const own = store.get('pos:' + tkey) || {};
    if (at && !(own.at > (pos.at || 0) && own.page === at.n)) store.set('pos:' + tkey, { ...own, page: at.n, frac: 0, para: at.para, word: at.word, at: Date.now() });
    ocrStop(); stopNarration();
    const pdfText = { key, hex, edition, labels: Array.isArray(labels) ? labels : null, pages: pdf.numPages, scanned: scan?.textPages === 0, ...(crops ? { drawing: pdf } : {}) };
    if (crops) crops.drawn().finally(() => { if (state.pdf !== pdf) pdf.destroy?.() });
    await openEpub(null, state.title, tkey, { parsed: book, pdfText });
    if (isPdfText()) root.classList.add('is-pdf-text');
    return true;
  })();
  try { return await pdfTextOpening } finally { pdfTextOpening = null }
}
/** The PDF's place from the text view's: the page and how far down it, with the spot in the text (the Tinct reader's too). */
function pdfTextShare() {
  const t = state.pdfText; if (!t) return;
  const place = currentPlace(), spot = epubSpot();
  const pg = PT().pageAt(t.edition, place.page, spot.para || 0, spot.word || 0); if (!pg) return;
  pdfTextCrops?.near(pg.page);
  const c = t.edition.chapters[place.page - 1], prev = store.get('pos:' + t.key) || {};
  store.set('pos:' + t.key, { ...prev, page: pg.page, frac: pg.frac, edition: 't', chapterNumber: c.number, paragraphIndex: spot.para || 0, wordIndex: spot.word || 0, ...(typeof t.edition.converter === 'number' ? { converter: t.edition.converter } : {}), pages: t.pages, at: Date.now() });
  placeSync.note(t.hex);
}
/** "Original pages": the PDF's pages here, at the same place (its page and how far down it). */
async function pdfTextToPages() {
  const t = state.pdfText; if (!t) return;
  savePlaceNow(); pdfTextShare();
  store.set('edition:' + t.hex, 'pages'); store.del('phone-edition:' + t.hex); store.del('desk-edition:' + t.hex);
  const rec = await library.get(t.key);
  if (!rec?.bytes) { toast('This PDF is not on this device. Open it again from Your books.'); return }
  stopNarration();
  await openBook('pdf', new Uint8Array(rec.bytes), rec.name, t.key, rec);
}
/** The PDF page a passage in chapter `n` of the text stands on (its words found in the chapter), else the chapter's first. */
function pdfTextPage(n, text) {
  const t = state.pdfText, c = t?.edition.chapters[n - 1]; if (!c) return null;
  const want = PT().norm(text).slice(0, 60);
  const i = want.length >= 3 ? c.paragraphs.findIndex(p => PT().norm(p).includes(want)) : -1;
  return PT().pageAt(t.edition, n, Math.max(0, i), 0)?.page || c.pages?.[0] || null;
}
const pdfTextLabel = page => { const l = String(state.pdfText?.labels?.[page - 1] ?? '').trim(); return LABEL_RE.test(l) ? l : String(page) };
/** The PDF's highlights (and their notes) where their words are found in this view: on their page's paragraphs. */
const pdfHlCache = { stamp: null, list: [] };
function pdfHighlightsHere() {
  const t = state.pdfText; if (!t) return [];
  const origin = (store.get('hl:' + t.key) || []).filter(h => !h.gone && !h.box && String(h.text || '').trim().length >= 3);
  const stamp = state.pages.length + '|' + origin.map(h => h.id + ':' + (h.u || h.at) + ':' + h.color + ':' + String(h.note || '').length).join(',');
  if (pdfHlCache.stamp === stamp) return pdfHlCache.list;
  const out = [];
  for (const h of origin) {
    for (const n of PT().chaptersOnPage(t.edition, h.page)) {
      const p = state.pages[n - 1]; if (!p) continue;
      const els = PT().parasOnPage(t.edition, n, h.page).map(i => epubParas(p)[i]).filter(Boolean);
      if (!els.length) continue;
      let hay = '';
      const segs = [];
      for (const el of els) { segs.push([hay.length, textOffset(p.pg, el, 0), el.textContent.length]); hay += el.textContent + ' ' }
      const hit = PT().findIn(hay, h.text); if (!hit) continue;
      const toPg = k => { const seg = segs.filter(sg => sg[0] <= k).at(-1); return seg[1] + Math.min(seg[2], k - seg[0]) };
      const { rects: _r, ...rest } = h;
      out.push({ ...rest, via: 'pdf', page: n, start: toPg(hit[0]), end: toPg(hit[1]) });
      break;
    }
  }
  pdfHlCache.stamp = stamp; pdfHlCache.list = out;
  return out;
}
/** A changed list in the text view: its own highlights kept under its key, the PDF's (via) kept with the PDF's (their colour and note; one removed, removed there). */
function putPdfTextHighlights(list) {
  const t = state.pdfText, before = new Set(pdfHighlightsHere().map(h => h.id));
  const mine = list.filter(h => h.via !== 'pdf'), theirs = new Map(list.filter(h => h.via === 'pdf').map(h => [h.id, h]));
  const gone = [...before].filter(id => !theirs.has(id));
  const origin = store.get('hl:' + t.key) || [];
  const next = origin.filter(h => !gone.includes(h.id)).map(h => {
    const m = theirs.get(h.id); if (!m) return h;
    if (m.color === h.color && (m.note || '') === (h.note || '') && !!m.withNote === !!h.withNote) return h;
    const out = { ...h, color: m.color, u: Date.now() };
    if (m.note) out.note = m.note; else delete out.note;
    if (m.withNote) out.withNote = true; else delete out.withNote;
    return out;
  });
  if (gone.length) store.set('hl-gone:' + t.key, TinctMargin.mergeMarks(store.get('hl-gone:' + t.key) || [], gone.map(id => TinctMargin.tombstone(id))));
  store.set('hl:' + t.key, next);
  store.set('hl:' + state.key, mine);
}
/** This view's own highlights on a PDF page whose words hold them (drawn there, never stored with the PDF's): [{ h, rects }]. */
function textHighlightsOn(p) {
  if (state.kind !== 'pdf' || !p?.layer || !PT()) return [];
  const list = (store.get('hl:' + PT().keyOf(hexOf(state.key))) || []).filter(h => h.pdfPage === p.n && String(h.text || '').trim().length >= 3);
  if (!list.length) return [];
  const raw = p.layer.textContent || '', pr = p.pg.getBoundingClientRect(); if (!pr.width) return [];
  const out = [];
  for (const h of list) {
    const hit = PT().findIn(raw, h.text); if (!hit) continue;
    const r = rangeFromOffsets(p.layer, hit[0], hit[1]); if (!r) continue;
    const rects = [...r.getClientRects()].filter(q => q.width > 0.3 && q.height > 0).map(q => [(q.left - pr.left) / pr.width, (q.top - pr.top) / pr.height, q.width / pr.width, q.height / pr.height]);
    if (rects.length) out.push({ h, rects });
  }
  return out;
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
const OCR_FAILED = 'Could not start recognising the text. Try again.';
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
      if (edition) {
        await ocrKeep(edition); ocrLocal(hex).set({ ready: true });
        // A phone reads it as its Tinct text from here (its default, as on the next open: forwardToText).
        if (live() && forwardToText(state.scan)) return;
      }
    } else if (!state.ocrPages) ocrFetchPages();
  }
  ocrShow(status, token);
  const goingOn = status.state === 'uploading' || status.state === 'running' || (status.state === 'paused' && status.reason === 'premium_required');
  if (goingOn && TinctPdfOcr.canStart(status.tier)) ocrRun(token);
}
// The recognised text reached this device: kept with the book, its words laid over the pages (ocrFetchPages).
// Recognised while the book is open, it is read as Tinct text from the same place at once (ocrRun). Else the
// next open follows the device's rule (forwardToText): a phone's default is the recognised text's own, kept
// as the phone's like a prose PDF's (phoneKind); the desktop opens its pages; a choice of the reader's stands.
async function ocrKeep(edition) {
  const hex = hexOf(state.key);
  state.textEdition = edition;
  await library.touch(state.key, { edition });
  if (isPhone() && !ownEdition()) {
    const kept = TinctPdfOcr.defaultEdition(edition);
    store.set('phone-edition:' + hex, { edition: kept, kind: 'scan', by: 'ocr', v: KIND_V });
    store.set('edition:' + hex, kept);
  }
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
// `offer`: the status the reader said yes to, shown again (with a short line) if the job cannot be started.
async function ocrRun(token, { rerun, offer } = {}) {
  const key = state.key, hex = hexOf(key), pdf = state.pdf;
  const live = () => token === ocr.token && state.key === key && hasBook();
  const local = ocrLocal(hex);
  let answered = false;
  try {
    // Started before the account copy was stored: the job waits for it.
    if (ocr.saving?.key === key) { ocr.starting = true; await ocr.saving.done; ocr.starting = false; ocr.saving = null; if (!live()) return }
    await TinctPdfOcr.run({
      hex, pages: pdf.numPages, api: ocrApi(), local, live, rerun, waitVisible,
      render: n => TinctPdfOcr.renderPage(pdf, n),
      sleep: ms => new Promise(r => setTimeout(r, ms)).then(waitVisible),
      onStatus: status => { answered = true; ocrShow(status, token) },
      // Recognised while the book is open: on to its Tinct text at the same place (readAsText), no "ready" line.
      onEdition: async edition => { answered = true; local.set({ ready: true }); await ocrKeep(edition); if (live()) readAsText() },
    });
  } catch (e) {
    if (!live()) return;
    // The yes could not be started (offline, the account busy): the offer again, with a short line.
    if (offer && !answered && e?.status !== 402) {
      local.set({ asked: false, started: false });
      ocrShow(offer, token);
      toast(OCR_FAILED);
      return;
    }
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
    // The tap is answered at once (Anders, 20 Oct 2026): "Recognising text…" and its bar before the account is asked.
    el.querySelector('[data-ocr="start"]').onclick = () => { local.set({ asked: true, prepared: 0 }); ocrShow({ state: 'starting', tier: status.tier, pages: state.pdf?.numPages || 0 }, token); ocrRun(token, { offer: status }) };
  } else if (shown.kind === 'failed') {
    el.innerHTML = `<p class="byob-ocr-line">${esc(shown.text)} <button type="button" class="byob-ocr-link" data-ocr="retry">Try them again</button></p>`;
    el.querySelector('[data-ocr="retry"]').onclick = () => { el.querySelector('[data-ocr="retry"]').disabled = true; ocrRun(token, { rerun: 'failed' }) };
  } else if (shown.kind === 'ready') {
    // No "ready" line (Anders, 20 Oct 2026): recognised while open, the book goes on to its Tinct text (ocrRun).
    local.set({ ready: true }); el.remove(); ocr.el = null;
  } else {
    const bar = shown.kind === 'progress' ? TinctPdfOcr.progress(status, local.get(), state.pdf?.numPages) : null;
    el.innerHTML = `<p class="byob-ocr-line">${esc(shown.text)}</p>` + (bar ? `<div class="byob-ocr-bar" role="progressbar" aria-label="${esc(shown.text)}" aria-valuemin="0" aria-valuemax="${bar.total}" aria-valuenow="${bar.done}"><span style="width:${(100 * bar.done / bar.total).toFixed(1)}%"></span></div>` : '');
  }
}

// Leaving or hiding the page: the place now, and what is waiting sent at once (keepalive).
function leavePlace() { if (!hasBook()) return; savePlaceNow(); justRead.leave(); placeSync.flush(); marksSync.push({ keepalive: true }); cardsSync.push({ keepalive: true }) }
addEventListener('pagehide', leavePlace);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') leavePlace() });

/* ---------- The book just read, for the library's first paint (desktop; this device only) ----------
   /lab/library-add.js rememberJustRead (src/libraryAdd.ts): the library leads with the book read
   here until the account's table arrives, so its Continue opens it. Phones are unchanged. */
const justRead = {
  key: '',
  label() { const p = currentPlace(); return state.kind === 'pdf' ? `p. ${p.page} of ${state.pages.length}` : ($('pageLabel')?.textContent || state.title) },
  write(api) {
    if (!state.key || this.key !== state.key || isPhone() || !hasBook() || !state.title) return;
    try { api?.rememberJustRead?.({ hex: hexOf(state.key), title: state.title, chapterLabel: this.label() }) } catch { /* the library resolves the slow way */ }
  },
  note() { if (isPhone()) return; this.key = state.key; switcherApi().then(api => this.write(api), () => {}) },
  leave() { this.write(window.__tinctLibraryAdd) },
};

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
  state.zoom = Math.max(ZOOM_MIN, Math.min(zoomMax(), Math.round(z * 100) / 100));
  syncZoomRow();
  // Zooming past fit tucks the docked chat into its tab; coming back restores it.
  if (!isPhone() && state.pages.length) {
    if (state.zoom > 1 && before <= 1 && dock.state === 'docked') setDock('minimized', { byZoom: true });
    else if (state.zoom <= 1 && dock.byZoom && dock.state === 'minimized') setDock('docked');
  }
  if (isEpub()) { epubReflow(() => { applyEpubScale(); goTo(place) }); onScroll(); savePlaceNow(); if (marginOn()) marginLayout({ fresh: true }); return }
  zoomClass();
  applyCrop();
  const w = sheetWidth();
  for (const p of state.pages) { p.sheet.style.width = w + 'px'; p.sheet.style.aspectRatio = sheetRatio(p.w, p.h) }
  goTo(place); onScroll();
  clearTimeout(zoomTimer);
  zoomTimer = setTimeout(() => { for (const p of state.pages) if (p.canvas) { p.renderedWidth = 0; renderPage(p) } savePlaceNow() }, quick ? 220 : 0);
  // The margin column keeps 56px right of the page's new edge (a page widened by Zoom moves it over).
  if (marginOn()) marginLayout({ fresh: true });
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
const PILL_CUT_MIN = 40, PILL_TITLE_MIN = 72;
function fitPill(stages = pill.stages) {
  pill.stages = stages;
  const btn = $('pageBtn'), label = $('pageLabel'), title = $('bookTitle');
  if (!isPhone() || !stages?.length) { delete btn.dataset.chevron; delete btn.dataset.fit; delete btn.dataset.title; pill.key = ''; return }
  const show = stage => {
    btn.dataset.chevron = stage.chevron ? 'on' : 'off';
    // The book's title gives way first (an EPUB's stages, round 3): cut by its own ellipsis, or left out (reader.css data-title="off").
    if (stage.title === 'off') btn.dataset.title = 'off'; else delete btn.dataset.title;
    if (stage.cut) {
      // Cut with an ellipsis, a closing number kept: the pill gives way to the title (reader.css data-fit="cut").
      const { head, tail } = window.TinctReaderLayout.cutLabel(stage.label);
      label.innerHTML = `<span class="byob-cut">${esc(head)}</span>${tail ? `<span class="byob-cut-tail">${esc(tail)}</span>` : ''}`;
      btn.dataset.fit = 'cut';
    } else { label.textContent = stage.label; delete btn.dataset.fit }
  };
  // A cut label shows enough of itself to be read: about five letters before its ellipsis.
  const readable = () => (label.querySelector('.byob-cut')?.clientWidth || 0) >= PILL_CUT_MIN;
  // The same labels, width and title as last time: the stage found then (onScroll has just written the full label).
  const key = JSON.stringify(stages) + '|' + innerWidth + '|' + title.textContent;
  if (key === pill.key) { show(stages[pill.at]); return }
  const whole = el => el.scrollWidth <= el.clientWidth + 1;
  let at = 0;
  // The title as the stage has it: whole, cut but still readable (most of it, and six letters or so before its
  // ellipsis: "To the Li…", never "To the …"), or left out.
  const titleFits = stage => stage.title === 'off' || (stage.title === 'cut' ? title.clientWidth >= Math.max(PILL_TITLE_MIN, title.scrollWidth * 0.6) : whole(title));
  for (; at < stages.length; at++) {
    show(stages[at]);
    if (stages[at].cut && titleFits(stages[at]) && readable()) break;
    if (at === stages.length - 1 || (!stages[at].cut && titleFits(stages[at]) && whole(label))) break;
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
/*
 * The t menu, Tinct's normal menu (Anders, 21 Oct 2026; the approved design of 20 Oct, the phone's
 * src/lab/labSuperMenu.ts): Chat · Talk on one row, Summarize, Catch me up (not on a book's first unit), Reading
 * settings; then this reader's own, Snip a figure (a PDF), Export notes and Open another book (a reader's own book);
 * then Library and Profile. Text, theme and layout are the Aa panel's. Each group after the first opens with a rule.
 */
const MENU_GROUPS = [['chat', 'summarize', 'catchup'], ['settings'], ['snip', 'export', 'open'], ['library', 'account']];
const MENU_LABEL = { summarize: 'Summarize', catchup: 'Catch me up', settings: 'Reading settings', snip: 'Snip a figure', export: 'Export notes', open: 'Open another book', library: 'Library', account: 'Profile' };
const MENU_CHEVRON = new Set(['settings', 'account']);
ICON.account = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.5"></circle><path d="M5 19.5c1.2-3.2 3.8-4.8 7-4.8s5.8 1.6 7 4.8"></path></svg>';
/** The page that frames this one (src/lab/marginPreview/MarginPreview.tsx), for a Tinct book's preview: its menu and player. */
function previewHost() {
  if (!state.preview) return null;
  try { const p = window.parent !== window && window.parent.TinctMarginPreview; return p && p.bookId === state.preview.bookId ? p : null } catch { return null }
}
/** Reading settings has something to offer: a Tinct book's editions and voice, a PDF's voice and speed or its Tinct text. */
const readingSettingsApply = () => !!state.preview || !isEpub() || isPdfText();
function menuShows(id) {
  // Not on a book's first unit (nor, without units, on its first page): nothing has been read to catch up on.
  if (id === 'catchup') { const u = currentUnit(); return u ? !nothingBefore(u) : placePage() > 1 }
  if (id === 'settings') return readingSettingsApply();
  if (id === 'snip') return state.kind === 'pdf';
  if (id === 'open') return !state.preview;
  return true;
}
/** The rows to draw, each with its rule (the first of a group after the first). -> [[id, rule]] */
const menuItems = () => MENU_GROUPS.flatMap((group, g) => group.filter(menuShows).map((id, i) => [id, g > 0 && i === 0]));
function openMenu() {
  if (document.querySelector('.lab-super-layer')) return closeMenu();
  closeAllPopups();
  const layer = document.createElement('div');
  layer.className = 'lab-super-layer';
  const textless = hasNoText();
  const half = (id, label, second) => `<button type="button" class="lab-super-row-half${second ? ' is-second' : ''}" data-row="${id}"><span class="lab-super-row-icon" aria-hidden="true">${ICON[id]}</span><span class="lab-super-row-label">${label}</span></button>`;
  layer.innerHTML = `<button type="button" class="lab-super-scrim" aria-label="Close menu"></button><nav class="lab-super-panel" aria-label="Menu">${menuItems().map(([id, rule]) => id === 'chat'
    ? `<div class="lab-super-row is-pair" data-row="conversation" role="group" aria-label="Chat or Talk">${half('chat', 'Chat')}${half('talk', 'Talk', true)}</div>`
    : `<button type="button" class="lab-super-row${rule ? ' has-rule' : ''}" data-row="${id}"${textless && (id === 'summarize' || id === 'catchup') ? ' disabled aria-disabled="true"' : ''}><span class="lab-super-row-icon" aria-hidden="true">${ICON[id]}</span><span class="lab-super-row-label">${MENU_LABEL[id]}</span>${MENU_CHEVRON.has(id) ? '<span class="lab-super-row-chevron" aria-hidden="true">›</span>' : ''}</button>`).join('')}</nav>`;
  layer.querySelector('.lab-super-scrim').onclick = closeMenu;
  layer.querySelectorAll('button[data-row]').forEach(b => b.onclick = () => { closeMenu(); menuAction(b.dataset.row) });
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
  if (id === 'account') return openProfile();
  if (!hasBook() && id !== 'open' && id !== 'settings') { toast('Open a book first.'); return }
  if (id === 'chat') return openChat();
  // Talk: Chat with Talk on (answers read aloud), the margin's whole-file Chat where the margin is on (as a card's Talk).
  if (id === 'talk') { setTalk(true); return openChat() }
  if ((id === 'summarize' || id === 'catchup') && hasNoText()) return;
  if (id === 'summarize') return summarize();
  if (id === 'catchup') return catchUp();
  if (id === 'snip') return startSnip();
  if (id === 'export') return exportNotes();
  if (id === 'settings') return openSettings();
  if (id === 'open') return $('fileInput').click();
}
/** Profile: the account cards. In a Tinct book's preview the framing page opens them over the reader; here, the library does. */
function openProfile() {
  const host = previewHost();
  if (host?.menu?.openProfile) { host.menu.openProfile({ dark: root.classList.contains('is-night') }); return }
  leaveToShelf(PROFILE_URL);
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
  const opts = previewLayouts() || RL.options(state.kind, { layout: viewLayout(), hasText: hasText(), epubMargin: isEpub() && marginOn(), pdfText: isPdfText() }).map(o => (state.preview && o.id === 'text' ? { ...o, label: PREVIEW_NORMAL } : o));
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
        ${zoomPanel() ? zoomRowHtml() : typePanel() ? typeRowsHtml() : `<div class="lab-v2-size"><span class="lab-v2-size-small" aria-hidden="true">A</span><input class="lab-v2-slider" type="range" aria-label="${isEpub() ? 'Text size' : 'Page size'}" data-testid="lab-v2-size" min="0.5" max="3" step="0.05" value="${state.zoom}"><span class="lab-v2-size-large" aria-hidden="true">A</span></div>`}
        <div class="lab-v2-rows">
          ${toggleRow('trim', 'Trim page margins', !!state.trim, isEpub())}
          ${toggleRow('screen', 'Full screen', !!document.fullscreenElement)}
          ${marginOn() ? selectRow('passageMarkSel', 'Passage mark', passageMark(), [['underline', 'Underline'], ['tint', 'Highlight'], ['off', 'Off']]) : ''}
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
    if (isPdfText()) { if (b.dataset.layout === 'pages') { closeDisplay(); pdfTextToPages() } return }
    if (state.preview && PREVIEW_VIEWS[b.dataset.layout]) { closeDisplay(); previewView(b.dataset.layout); return }
    keepPagesHere();
    setLayout(b.dataset.layout);
    drawLayoutChoices();
  });
  layer.querySelectorAll('[data-theme-choice]').forEach(b => b.onclick = () => {
    setTheme(b.dataset.themeChoice);
    layer.querySelectorAll('[data-theme-choice]').forEach(o => { const on = o.dataset.themeChoice === pageTheme; o.classList.toggle('is-active', on); o.setAttribute('aria-pressed', String(on)) });
    layer.querySelector('[data-testid="lab-v2-theme-eink"]')?.remove();
  });
  let sizeTimer;
  const slider = layer.querySelector('[data-testid="lab-v2-size"]');
  if (slider) slider.oninput = e => { const z = Number(e.target.value); clearTimeout(sizeTimer); sizeTimer = setTimeout(() => { state.fit = null; setZoom(z, { quick: true }) }, 60) };
  // Zoom (a PDF on the desktop): −, the percentage, +, Fit width (100%, the default); the page never wider than its room.
  layer.querySelector('.byob-zoom')?.addEventListener('click', e => {
    const b = e.target.closest('[data-z]'); if (!b || b.disabled) return;
    state.fit = null;
    const z = b.dataset.z === 'fit' ? 1 : b.dataset.z === '+' ? zoomStep(1) : zoomStep(-1);
    setZoom(z, { quick: true });
  });
  // Text size and Line width (an EPUB on the desktop): this device's, a step at a time, the place kept.
  layer.querySelector('.byob-type')?.parentElement.addEventListener('click', e => { const b = e.target.closest('[data-type-step]'); if (b && !b.disabled) stepType(b.closest('.byob-type').dataset.type, Number(b.dataset.typeStep)) });
  layer.querySelector("[data-convert]")?.addEventListener('click', () => { closeDisplay(); readAsText() });
  layer.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
    const t = b.dataset.t;
    if (t === 'text') { closeDisplay(); readAsText(); return }
    if (t === 'screen') { toggleFullscreen().then(on => b.setAttribute('aria-checked', String(on))); return }
    if (t === 'trim') setTrim(!state.trim);
    b.setAttribute('aria-checked', String(t === 'trim' ? state.trim : !!prefs[t]));
  });
  // The open card's passage on the page: underlined, tinted or not marked (this device's choice).
  const markSel = layer.querySelector('#passageMarkSel');
  if (markSel) markSel.onchange = e => { prefs.passageMark = e.target.value; savePrefs(); layer.querySelector('[data-value="passageMarkSel"]').textContent = e.target.selectedOptions[0]?.textContent || ''; marginLayout({ fresh: true }) };
  root.appendChild(layer);
  drawLayoutChoices(); syncZoomRow(); syncTypeRows();
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
/* Reading settings (the t menu): the reader's Reading settings sheet (src/lab/LabV2Sheet.tsx), with the rows that
   apply here (the look is the Aa panel's, above). A reader's own PDF: its edition (Margin view or its Tinct text, when
   it has text) and read aloud's voice and speed. A Tinct book's preview: the book reader's Main version and Compare
   version, and its narration's voice and speed (the framing page's, previewHost). */
async function openSettings() {
  closeAllPopups();
  const host = previewHost();
  const rows = [];
  let note = '';
  if (state.preview) {
    const ed = await host?.menu?.reading?.().catch(() => null);
    if (ed && ed.editions.length > 1) {
      rows.push(selectRow('editionSel', 'Main version', ed.edition, ed.editions.map(o => [o.value, o.label])));
      rows.push(selectRow('compareSel', 'Compare version', ed.compareEdition, ed.compareEditions.map(o => [o.value, o.label])));
    }
    const listen = host?.listen, snap = listen?.snapshot?.();
    if (listen?.voices && snap && snap.available !== false) {
      const v = listen.voices(), speed = Number(snap.speed) || 1;
      rows.push(selectRow('voiceSel', 'Voice', v.value, v.options.map(o => [o.value, o.label])));
      rows.push(selectRow('rateSel', 'Speed', String(speed), [...new Set([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, speed])].sort((a, b) => a - b).map(r => [String(r), r + '×'])));
    }
  } else {
    if ((state.kind === 'pdf' && hasText()) || isPdfText()) rows.push(selectRow('editionSel', 'Edition', isPdfText() ? 'text' : 'pages', [['pages', 'Margin view'], ['text', 'Tinct text']]));
    if (!isEpub()) {
      const voices = bookVoices();
      const rates = [...new Set([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, prefs.rate])].sort((a, b) => a - b);
      rows.push(selectRow('voiceSel', 'Voice', prefs.voice, [['', 'Device voice'], ...voices.map(v => [v.name, v.name])]));
      rows.push(selectRow('rateSel', 'Speed', String(prefs.rate), rates.map(r => [String(r), r + '×'])));
      note = 'Read aloud uses this device’s own voice; nothing is recorded. ';
    }
    note += imgNote;
  }
  document.querySelector('.byob-reading-settings')?.remove();
  const layer = document.createElement('div');
  layer.className = 'lab-v2-sheet-layer byob-settings byob-reading-settings'; layer.dataset.testid = 'lab-v2-sheet-layer';
  layer.innerHTML = `<button type="button" class="lab-super-scrim" aria-label="Close"></button>
    <section class="lab-v2-sheet" data-testid="lab-v2-sheet" data-layer="reading" aria-label="Reading settings">
      <div class="lab-v2-head is-titled"><h2 class="lab-v2-title">Reading settings</h2><button type="button" class="lab-v2-dismiss" aria-label="Close">×</button></div>
      <div class="lab-v2-sheet-body">
        <div class="lab-v2-rows">${rows.join('')}</div>
        ${note ? `<p class="lab-v2-note">${esc(note)}</p>` : ''}
      </div>
    </section>`;
  const close = () => layer.remove();
  layer.querySelector('.lab-super-scrim').onclick = close;
  layer.querySelector('.lab-v2-dismiss').onclick = close;
  layer.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close() } });
  const sync = (sel, fn) => { const el = layer.querySelector('#' + sel); if (!el) return; el.onchange = e => { fn(e.target.value); layer.querySelector(`[data-value="${sel}"]`).textContent = e.target.selectedOptions[0]?.textContent || '' } };
  if (state.preview) {
    // Another main version: the preview opens again at this chapter, paragraph and word (the place kept first).
    sync('editionSel', v => { close(); const at = previewSpot(); leavePlace(); stopNarration(); host?.menu?.setEdition(v, at) });
    sync('compareSel', v => host?.menu?.setCompareEdition(v));
    sync('voiceSel', v => host?.listen?.setVoice?.(v));
    sync('rateSel', v => host?.listen?.setSpeed?.(Number(v)));
  } else {
    sync('editionSel', v => { close(); if (v === 'text') readAsText(); else if (isPdfText()) pdfTextToPages() });
    sync('rateSel', v => { prefs.rate = Number(v); savePrefs(); renderTransport() });
    sync('voiceSel', v => { prefs.voice = v; savePrefs() });
  }
  root.appendChild(layer);
  layer.querySelector('.lab-v2-dismiss').focus({ preventScroll: true });
}
/** The Aa panel's Zoom row instead of the size slider: a PDF's pages on the desktop (Tinct text and phones keep the slider). */
const zoomPanel = () => state.kind === 'pdf' && !isPhone();
/** The next zoom a step away (10% steps, landing on them), within ZOOM_MIN and zoomMax. */
const zoomStep = dir => Math.max(ZOOM_MIN, Math.min(zoomMax(), (dir > 0 ? Math.floor(state.zoom * 10 + 1e-6) + 1 : Math.ceil(state.zoom * 10 - 1e-6) - 1) / 10));
function zoomRowHtml() {
  return `<div class="byob-zoom" role="group" aria-labelledby="aaZoomLabel"><span class="lab-v2-row-label byob-zoom-label" id="aaZoomLabel">Zoom</span>`
    + `<button type="button" class="byob-zoom-step" data-z="-" aria-label="Zoom out">−</button><output class="byob-zoom-pct" aria-live="polite"></output><button type="button" class="byob-zoom-step" data-z="+" aria-label="Zoom in">+</button>`
    + `<button type="button" class="byob-zoom-fit" data-z="fit" aria-pressed="false">Fit width</button></div>`
    + (hasText() ? `<p class="lab-v2-note byob-zoom-note">For larger text that reflows, use <button type="button" data-convert>Convert to Tinct book</button>.</p>` : '');
}
/*
 * Text size and Line width (Anders, 20 Oct 2026): an EPUB on the desktop in Margin view, this device's (prefs.textSize,
 * prefs.lineWidth; TinctReaderLayout.TEXT_SIZES and LINE_WIDTHS), in place of the size slider. A step reflows the text
 * with the reading place kept by paragraph and word (epubReflow). A book's own older size (its slider, pos.zoom) gives
 * way to the device's on the first Text size step.
 */
const TYPE_ROWS = { size: ['Text size', 'textSize', 'TEXT_SIZES', 'Smaller', 'Larger'], width: ['Line width', 'lineWidth', 'LINE_WIDTHS', 'Narrower', 'Wider'] };
function typeRowsHtml() {
  return `<div class="byob-type-rows">${Object.entries(TYPE_ROWS).map(([id, [label, , , less, more]]) => `<div class="byob-type" data-type="${id}" role="group" aria-labelledby="aaType-${id}"><span class="lab-v2-row-label byob-zoom-label" id="aaType-${id}">${label}</span>`
    + `<button type="button" class="byob-zoom-step" data-type-step="-1" aria-label="${less}">−</button><output class="byob-zoom-pct" aria-live="polite"></output><button type="button" class="byob-zoom-step" data-type-step="1" aria-label="${more}">+</button></div>`).join('')}</div>`;
}
function syncTypeRows() {
  for (const row of document.querySelectorAll('.byob-aa-panel .byob-type')) {
    const [, key, list] = TYPE_ROWS[row.dataset.type], steps = RL[list], now = steps.includes(Number(prefs[key])) ? Number(prefs[key]) : 1;
    row.querySelector('.byob-zoom-pct').textContent = Math.round(now * 100) + '%';
    row.querySelector('[data-type-step="-1"]').disabled = now <= steps[0];
    row.querySelector('[data-type-step="1"]').disabled = now >= steps[steps.length - 1];
  }
}
function stepType(type, dir) {
  const row = TYPE_ROWS[type]; if (!row || !typePanel()) return;
  const [, key, list] = row, next = RL.typeStep(RL[list], prefs[key] ?? 1, dir);
  if (next === (prefs[key] ?? 1) && !(type === 'size' && state.zoom !== 1)) return;
  if (next === 1) delete prefs[key]; else prefs[key] = next;
  savePrefs();
  const zoomed = type === 'size' && state.zoom !== 1;
  if (zoomed) state.zoom = 1;
  epubReflow(() => { if (zoomed) applyEpubScale(); applyPaper() });
  onScroll(); savePlaceNow(); syncTypeRows();
  if (marginOn()) marginLayout({ fresh: true });
}
/** The open Aa panel's Zoom row, after any zoom (its buttons, keys, a pinch). */
function syncZoomRow() {
  const row = document.querySelector('.byob-aa-panel .byob-zoom'); if (!row) return;
  row.querySelector('.byob-zoom-pct').textContent = Math.round(state.zoom * 100) + '%';
  row.querySelector('[data-z="-"]').disabled = state.zoom <= ZOOM_MIN + 1e-6;
  row.querySelector('[data-z="+"]').disabled = state.zoom >= zoomMax() - 1e-6;
  const fit = Math.abs(state.zoom - 1) < 1e-6, f = row.querySelector('[data-z="fit"]');
  f.setAttribute('aria-pressed', String(fit)); f.disabled = fit;
}
async function toggleFullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen() } catch { toast('Full screen is not available here.') }
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
  // Classified now (a PDF opened for the first time, or scanned again): Tinct text when this device
  // reads it best so. Scrolling meanwhile is no choice of the reader's: the spot reached is kept and
  // the Tinct text opens there (only "Original pages" or a link's &pages keep the pages).
  if (fresh) {
    await openKind(scan, token);
    if (token !== state.token) return;
    if (editionChoice(scan) === 'text' && !sameSpot(currentPlace(), state.lastPlace)) savePlaceNow();
    if (forwardToText(scan)) return;
  }
  showEditions();
  if (isScan()) ocrOpen();
  toc.entries = contentsSorted(scan.entries);
  toc.nav = toc.entries.length ? scan.nav : 'pages';
  toc.ready = true;
  onScroll();
  // The primer's trigger waits for the scan (primerHasText).
  marginLayout();
  pdfTextPrepare(token);
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
  primer.held = false;
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
  const page = currentPlace().page, cur = chapterAt(readingPage());
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
  // The wide column: the unit the reader is in, marked, with its Recap, Quiz me and Catch me up (as its marks offer them).
  const unit = marginMode() === 'column' && primerHasText() ? currentUnit() : null;
  const unitNow = unit ? `<section class="mr byob-unit-now" aria-label="The part you are reading"><p class="byob-unit-now__name" aria-current="true">${esc(TinctMargin.html.unitName(unit, state.title))}${unitPagesLabel(unit) ? ` · ${esc(unitPagesLabel(unit))}` : ''}</p><div class="byob-unit-now__acts">${[['recap', 'Recap'], ['quiz', 'Quiz me'], ...(nothingBefore(unit) ? [] : [['catchup', 'Catch me up']])].map(([id, w]) => `<button type="button" class="mr-pill" data-unit-act="${id}"><span><span class="mr-pill__mark" aria-hidden="true">✧</span>${w}</span></button>`).join('')}</div></section>` : '';
  layer.innerHTML = `<button class="lc-scrim" aria-label="Close contents" tabindex="-1"></button>
    <div class="menu" role="dialog" aria-modal="true" aria-label="Contents">
      <header><button class="title" aria-label="${esc(state.title)}, close contents">${esc(state.title)}</button><div class="actions"><button aria-label="Back to book" data-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12"></path></svg></button></div></header>${unitNow}
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
  layer.querySelectorAll('[data-unit-act]').forEach(b => b.onclick = () => { close(); pillAction(b.dataset.unitAct, unit.key) });
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
const bookLine = () => state.preview ? `The reader is reading Tinct's ${state.preview.editionLabel} of "${state.title}"${state.author ? ' by ' + state.author : ''}, a book in Tinct's library.` : `The reader is reading their own copy of ${isEpub() ? 'an EPUB' : 'a PDF'} titled "${state.title}"${state.author ? ' by ' + state.author : ''}. They have confirmed they are entitled to use it.`;

/* ---------- Selection: Explain / Chat / Copy ---------- */
let sel = null;
function selectionInfo() {
  const s = getSelection();
  if (!s || s.isCollapsed || !s.rangeCount) return null;
  return rangeInfo(s.getRangeAt(0), s.toString());
}
/** A passage as the bar takes it: { text, page, box, rects, range } from a range (the selection's, or the phone's own). */
function rangeInfo(range, said = range.toString()) {
  if (!range || range.collapsed) return null;
  const node = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
  const sheetEl = node?.closest('.pdf-sheet, .epub-sheet') || range.startContainer.parentElement?.closest('.pdf-sheet, .epub-sheet');
  // A PDF's passage is its body text only, never the page furniture between two pages (bodyOfRange).
  const text = (sheetEl?.classList.contains('pdf-sheet') ? bodyOfRange(range).text : '') || String(said).replace(/\s+/g, ' ').trim();
  if (!sheetEl || text.length < 2) return null;
  const rects = selectionShapes(range);
  if (!rects.length) return null;
  const box = rects.reduce((a, r) => ({ left: Math.min(a.left, r.left), top: Math.min(a.top, r.top), right: Math.max(a.right, r.right), bottom: Math.max(a.bottom, r.bottom) }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
  return { text, page: Number(sheetEl.dataset.page), box, rects, range: range.cloneRange() };
}
let selTimer;
/*
 * The bar opens only right after a deliberate selection (Anders, 19 Oct 2026: a stray menu came back on a tab's refocus
 * and when a card folded): a pointer let go (or a touch) or selection keys ending on a new, non-empty selection, or a
 * click on a highlight. A selection the page restores, one left over, or one set by the reader's own code never
 * opens it. A bar already open follows its selection as before (a phone's handles move it without any event).
 */
const gesture = { start: null, touchAt: 0 };
const selNow = () => { const s = getSelection(); if (!s?.rangeCount || s.isCollapsed) return null; const r = s.getRangeAt(0); return { sc: r.startContainer, so: r.startOffset, ec: r.endContainer, eo: r.endOffset } };
const sameSel = (a, b) => !!a && !!b && a.sc === b.sc && a.so === b.so && a.ec === b.ec && a.eo === b.eo;
const UI_PRESS = '.mr-float, .mr-card, .mr-col, .mr-sheet, .mr-marks, .lab-header, .lab-v2-sheet-layer, input, textarea, select';
document.addEventListener('pointerdown', e => { gesture.start = selNow(); gesture.inUi = !!e.target?.closest?.(UI_PRESS); if (e.pointerType === 'touch') gesture.touchAt = Date.now() }, true);
document.addEventListener('touchstart', () => { gesture.touchAt = Date.now() }, { passive: true, capture: true });
/** A gesture ended: a new, non-empty selection (snapped to whole words) opens the margin's bar. */
function selectionMade() {
  if (!marginOn() || !readerShown()) return;
  const now = selNow(), before = gesture.start; gesture.start = null;
  if (!now || sameSel(now, before) || (mr && !mr.held && mr.info?.range && sameRange(mr.info.range, now))) return;
  clearTimeout(selTimer);
  snapWords();
  // The phone's EPUB: a selection made anyway (the keys, a test's) is taken over as the reader's own (ownSelection).
  if (ownsSelection() && adoptNative()) return;
  marginSelection({ fresh: true });
}
/*
 * A fresh selection covers whole words (Anders, 19 Oct 2026: a highlight began at "ection", "Define · ection"): pdf.js
 * often gives a line's first letter as an item of its own ("S" | "ection", no space between), and a double-click or a
 * drag starting there stopped at the item's edge. An end inside a word moves to the word's edge, across items that
 * touch (no space between them), never across a space, a line break or a hyphen.
 */
const WORD_CH = /[\p{L}\p{M}\p{N}'’]/u;
function layerTexts(node) {
  const layer = (node?.nodeType === 1 ? node : node?.parentElement)?.closest?.('.text-layer'); if (!layer) return null;
  const nodes = [], w = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) nodes.push(n);
  return nodes;
}
function wordEdge(node, off, dir) {
  if (node?.nodeType !== 3) return null;
  const nodes = layerTexts(node); if (!nodes) return null;
  let i = nodes.indexOf(node); if (i < 0) return null;
  const before = off > 0 ? node.data[off - 1] : nodes[i - 1]?.data.at(-1) || '';
  const after = off < node.data.length ? node.data[off] : nodes[i + 1]?.data[0] || '';
  if (!WORD_CH.test(before) || !WORD_CH.test(after)) return null;
  for (;;) {
    if (dir < 0) {
      if (off > 0) { if (WORD_CH.test(node.data[off - 1])) { off--; continue } break }
      if (i > 0 && WORD_CH.test(nodes[i - 1].data.at(-1) || '')) { node = nodes[--i]; off = node.data.length; continue }
      break;
    }
    if (off < node.data.length) { if (WORD_CH.test(node.data[off])) { off++; continue } break }
    if (i + 1 < nodes.length && WORD_CH.test(nodes[i + 1].data[0] || '')) { node = nodes[++i]; off = 0; continue }
    break;
  }
  return { node, off };
}
function snapWords() {
  try {
    const s = getSelection(); if (!s?.rangeCount || s.isCollapsed) return;
    const r = s.getRangeAt(0), a = wordEdge(r.startContainer, r.startOffset, -1), b = wordEdge(r.endContainer, r.endOffset, 1);
    if (!a && !b) return;
    s.setBaseAndExtent(a ? a.node : r.startContainer, a ? a.off : r.startOffset, b ? b.node : r.endContainer, b ? b.off : r.endOffset);
  } catch { /* the selection stays as made */ }
}
const sameRange = (r, n) => r.startContainer === n.sc && r.startOffset === n.so && r.endContainer === n.ec && r.endOffset === n.eo;
document.addEventListener('pointerup', e => { if (e.button > 0 || gesture.inUi) return; setTimeout(selectionMade, 30) }, true);
document.addEventListener('touchend', () => setTimeout(selectionMade, 60), { passive: true, capture: true });
document.addEventListener('keyup', e => {
  if (e.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
  const keys = e.shiftKey && /^(?:Arrow|Home|End|Page)/.test(e.key) || e.key === 'Shift' || ((e.metaKey || e.ctrlKey) && (e.key === 'a' || e.key === 'A'));
  if (keys) setTimeout(selectionMade, 0);
}, true);
document.addEventListener('selectionchange', () => {
  // The phone's EPUB: a native selection under a finger is taken over at once, so iOS's menu goes with it (ownSelection).
  if (ownsSelection() && Date.now() - gesture.touchAt < 1500 && adoptNative()) return;
  // A text selection always gets the bar, never the figure chip (a caption's words too): the chip goes at once.
  try { if (hot.el && !getSelection().isCollapsed) hideHot() } catch { /* before the chip's code has run */ }
  clearTimeout(selTimer);
  selTimer = setTimeout(() => {
    // A selection opens the margin's bar or Define card (below), in a PDF or an EPUB: only after a gesture (selectionMade);
    // here a bar already open follows its selection, or closes when it is gone. A touch's own selection (long press,
    // its handles) counts as the gesture while the finger was down a moment ago.
    if (marginOn()) return marginSelection({ fresh: Date.now() - gesture.touchAt < 1500 });
    const info = selectionInfo();
    const pop = document.querySelector('.selection-popup');
    if (!info) { if (pop && pop.dataset.popupMode === 'main') hideSelection(); return }
    if (pop && pop.dataset.popupMode === 'explain') return;
    sel = info; showSelection();
  }, isPhone() ? 450 : 250);
});
/*
 * The phone's EPUB (the margin preview): the reader's own selection (Anders, 20 Oct 2026: iOS put Copy, Find Selection
 * and Look Up over the dark bar). As the book reader (src/lab/LabPassage.tsx: selectstart cancelled under a finger, a
 * long press of its own, its own paint): a press held on a word selects it, a drag goes on word by word (the pages
 * scroll at the edges), and it is drawn with the CSS Custom Highlight API (paintOwn), never as a native selection, so
 * iOS has nothing to put its menu on. One that comes anyway is taken over and cleared at once (adoptNative). A short
 * tap is handled here too, as iOS sends no click for a tap on plain text: it lets the bar go, or opens a highlight's
 * bar or a card's passage (tapPage).
 */
const OWN_PRESS_MS = 380;
const OWN_SKIP = '.mr-float, .mr-card, .mr-sheet, .mr-marks, .mr-pmore, .mr-undo, .lab-header, .tb-mark, button, a, input, textarea, select, [role="dialog"]';
const ownsSelection = () => isPhone() && isEpub() && marginOn() && readerShown();
const inEpubText = n => !!(n?.nodeType === 1 ? n : n?.parentElement)?.closest?.('.epub-pg');
/** The word under a point on an EPUB's page, as a range; null between words or off the text. */
function wordRangeAt(x, y) {
  const c = caretFromPoint(x, y); if (!c || c.node?.nodeType !== 3 || !inEpubText(c.node)) return null;
  const t = c.node.data; let a = Math.min(c.offset, t.length);
  if (!WORD_CH.test(t[a] || '') && WORD_CH.test(t[a - 1] || '')) a--;
  if (!WORD_CH.test(t[a] || '')) return null;
  let b = a;
  while (a > 0 && WORD_CH.test(t[a - 1])) a--;
  while (b < t.length && WORD_CH.test(t[b])) b++;
  const r = document.createRange(); r.setStart(c.node, a); r.setEnd(c.node, b);
  return r;
}
/** A native selection on the pages becomes the reader's own: cleared, its passage drawn and its bar opened. -> taken */
function adoptNative() {
  const s = getSelection(); if (!s?.rangeCount || s.isCollapsed) return false;
  const r = s.getRangeAt(0); if (!inEpubText(r.startContainer) || !inEpubText(r.endContainer)) return false;
  const range = r.cloneRange();
  s.removeAllRanges();
  if (own.on) return true;
  const info = rangeInfo(range);
  if (info && !(mr?.own && mr.info?.range && mr.info.range.compareBoundaryPoints(Range.START_TO_START, range) === 0 && mr.info.range.compareBoundaryPoints(Range.END_TO_END, range) === 0)) marginOpen(info, { own: true });
  return true;
}
document.addEventListener('selectstart', e => { if (ownsSelection() && Date.now() - gesture.touchAt < 1500 && inEpubText(e.target)) e.preventDefault() }, true);
document.addEventListener('touchstart', e => {
  clearTimeout(own.timer); own.on = false; own.moved = false; own.at = 0;
  if (e.touches?.length !== 1 || !ownsSelection() || !inEpubText(e.target) || e.target.closest?.(OWN_SKIP)) return;
  const t = e.touches[0]; own.x = t.clientX; own.y = t.clientY; own.at = Date.now();
  own.timer = setTimeout(() => {
    const r = wordRangeAt(own.x, own.y); if (!r) return;
    if (mr) marginClose();
    own.on = true; own.a = r; own.range = r.cloneRange();
    paintOwn(own.range);
  }, OWN_PRESS_MS);
}, { passive: true, capture: true });
document.addEventListener('touchmove', e => {
  if (!own.at) return;
  const t = e.touches[0]; if (!t) return;
  if (!own.on) { if (Math.hypot(t.clientX - own.x, t.clientY - own.y) > 10) { clearTimeout(own.timer); own.moved = true; own.at = 0 } return }
  if (e.cancelable) e.preventDefault();
  const s = $('scroll').getBoundingClientRect(), top = Math.max(s.top, $('hdr').getBoundingClientRect().bottom);
  if (t.clientY < top + 40) $('scroll').scrollBy(0, -14); else if (t.clientY > s.bottom - 40) $('scroll').scrollBy(0, 14);
  const r = wordRangeAt(t.clientX, t.clientY); if (!r) return;
  const range = document.createRange();
  if (r.compareBoundaryPoints(Range.START_TO_START, own.a) < 0) { range.setStart(r.startContainer, r.startOffset); range.setEnd(own.a.endContainer, own.a.endOffset) }
  else { range.setStart(own.a.startContainer, own.a.startOffset); range.setEnd(r.endContainer, r.endOffset) }
  own.range = range; paintOwn(range);
}, { passive: false, capture: true });
document.addEventListener('touchend', e => {
  clearTimeout(own.timer);
  if (own.on) {
    own.on = false; own.at = 0; own.tap = Date.now();
    if (e.cancelable) e.preventDefault();
    const info = rangeInfo(own.range);
    if (info) marginOpen(info, { own: true }); else paintOwn(null);
    return;
  }
  if (!own.at) return;
  const quick = !own.moved && Date.now() - own.at < 500, t = e.changedTouches[0];
  own.at = 0;
  if (!quick || !t) return;
  own.tap = Date.now();
  tapPage(t.clientX, t.clientY);
}, { passive: false, capture: true });
document.addEventListener('touchcancel', () => { clearTimeout(own.timer); if (own.on) { own.on = false; paintOwn(null) } own.at = 0 }, { capture: true, passive: true });
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
function marginSelection({ fresh = false } = {}) {
  const info = selectionInfo();
  // A page drawn again (its text layer replaced: a late render, a zoom, the column reserving its room)
  // drops the selection without the reader letting go: the bar stays on its kept passage. Seen as the
  // CI layout check's intermittent "1 problem" desktop rows (the bar detached under a click).
  if (!info && mr && !mr.held && mr.mode === 'menu' && mr.info?.range && !rangeInText(mr.info.range)) { mr.held = true; paintSelection(); return }
  // The phone's own selection (mr.own) has no native one: a tap lets its bar go (tapPage), not the selection's change.
  if (!info) { if (mr && !mr.held && !mr.own && mr.mode === 'menu') marginClose(); return }
  if (mr && !mr.held && mr.info.text === info.text && mr.info.page === info.page) return;
  // A new bar only for a deliberate selection; an open one follows its selection (the phone's handles).
  if (!fresh && !(mr && !mr.held && mr.mode === 'menu')) return;
  marginOpen(info);
}
function marginOpen(info, { existing = null, asking = false, own: ownSel = false } = {}) {
  hideSelection();
  const word = !existing && TinctMargin.oneWord(info.text);
  const anchor = existing ? existing.rects.map(([x, y, w, h]) => ({ n: existing.page, x, y, w, h })) : anchorOf(info.rects || [info.box]);
  // A highlight clicked (Anders, 19 Oct 2026): its own bar, Ask and Explain, its colours, its note, Remove highlight.
  mr = { info, anchor, ids: existing ? [existing.id] : [], held: !!existing, own: ownSel, mode: null, el: null, moreEl: null, base: existing ? 'existing' : null, before: word && info.range ? textBefore(info.range) : '' };
  sel = info;
  if (word && !asking) { mrDefine(word); return }
  mrShow(mr.base || 'menu');
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
    el.querySelector('.mr-define__wait')?.append(waitDots());
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
  // The phone: Ask is the bottom card, the passage quoted and its field ready above the keyboard (phoneAsk).
  if (m === 'ask') return marginMode() === 'phone' ? phoneAsk() : mrShow('asking');
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
  if (m === 'mic') { if (mr.el.querySelector('.mr-ask')) dictation.toggle({ bar: true }); return }
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
  mrShow(mr.base || 'colors');
}
function mrNoteOpen() {
  // A highlight the note itself makes goes with the note when its card is deleted (TinctMargin.deletePlan).
  const had = mr.ids.length;
  mrHighlight();
  if (!mr.ids.length) return;
  if (!had) mr.noteMade = true;
  if (marginMode() === 'phone') return phoneNote();
  mrShow('note');
}
/*
 * The phone (Anders, 20 Oct 2026): Ask and a note are the bottom card, as an answer is, never a field on the page (the
 * keyboard's bar sat over the passage and the field was out of view). The card quotes the passage and its field has
 * the focus at once (in the tap, so iOS opens the keyboard); the card rides above the keyboard (fitKeyboard). Until a
 * question is sent or a note written it is a draft (col.draft), let go when the card closes.
 */
function sheetFocus(sel) {
  const f = col.sheet?.querySelector(sel); if (!f) return;
  f.focus({ preventScroll: true });
  requestAnimationFrame(() => { const g = col.sheet?.querySelector(sel); if (g && document.activeElement !== g) g.focus({ preventScroll: true }) });
}
function phoneAsk() {
  const info = mr.info, anchor = mr.anchor;
  marginClose(); getSelection().removeAllRanges();
  const card = withSpan(TinctMargin.newCard({ kind: 'ask', page: info.page, anchor, text: info.text }), info);
  dropDraft(col.draft?.id);
  col.draft = { ...card, draft: true, asking: true };
  col.view = null;
  openCard(card.id);
  sheetFocus('.mr-follow__input');
}
function phoneNote() {
  const id = mr.ids[0], made = !!mr.noteMade;
  marginClose();
  const m = highlights().find(h => h.id === id); if (!m) return;
  const cid = 'n-' + id;
  if (!viewCards().some(c => c.id === cid)) {
    const rec = isEpub() ? epubMarkRects(m, { any: true }) : m;
    dropDraft(col.draft?.id);
    col.draft = { id: cid, kind: 'note', mark: id, phoneNote: true, draft: true, noteMade: made, page: m.page, rects: (rec?.rects || []).map(r => [m.page, ...r]), text: m.text, note: noteDrafts.get(id) || '', color: m.color, at: Date.now(), u: Date.now() };
    col.view = null;
  }
  openCard(cid);
  sheetFocus('.mr-note-edit');
}
/** A phone's draft (an Ask not yet sent, a note not yet written) let go; a highlight its note made goes too when asked. */
function dropPhoneDraft(id, { mark = false } = {}) {
  const d = col.draft; if (!d || d.id !== id || !(d.asking || d.phoneNote)) return false;
  dropDraft(id);
  if (mark && d.phoneNote && d.noteMade) removeHighlight(d.mark);
  return true;
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
  holdPlace();
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
  // The wide margin column: Define is a margin card only, opened, never a pop-over on the text (Anders, 19 Oct 2026).
  // Narrow windows and the phone keep the pop-over.
  if (marginMode() === 'column' && mr) return defineCard(word);
  mr.word = word; mr.held = true; mr.def = { word, source: '', wait: true };
  const token = mr.defToken = {};
  // The file this Define belongs to: an answer that arrives after the reader opened another file is never kept in it.
  const key = state.key;
  mrShow('define');
  await runDefine({ word, info: mr.info, anchor: mr.anchor, key, before: mr.before, alive: () => mr?.defToken === token, show: (def, final) => { mr.def = def; if (final || mr.mode === 'define') mrShow('define') } });
}
/*
 * Define's lookups: the offline dictionary first (js/dictionary.js); a name, or a word it lacks, from the companion's
 * contextual `define` when online; offline, "Not in the offline dictionary." `show(def, final)` draws each step (the
 * pop-over, or the card); `alive()` is false once another Define or file has taken over. A found definition is kept
 * as a Define card (keepDefine; `card`, the column's card not yet kept, keeps its id).
 */
async function runDefine({ word, info, anchor, key, before, alive, show, card = null }) {
  let hit = null;
  try { hit = await TinctDictionary.lookup(word) } catch {}
  if (!alive()) return null;
  // Offline, a capitalised word the dictionary has shows its entry (a name mid-sentence asks the companion only when it can).
  const asks = TinctMargin.defineAsks(hit, { word, before, online: navigator.onLine !== false });
  if (asks.dictionary) {
    const def = { word: hit.word, source: 'Dictionary', senses: hit.definitions.slice(0, 3).map(text => ({ text })) };
    show(def);
    // Online, two asks at once (15 Oct, evening): the meaning in this text from the companion's
    // `define`, shown first under "In this text" whenever it arrives, even when a dictionary sense
    // "fits" ("perplexity" read "confusion"); and define_sense, which moves the fitting sense to the
    // top of the dictionary's senses below it (at most FIT_SENSE_MS). Offline, the dictionary alone.
    const redraw = () => { if (alive()) show(def) };
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
    keepDefine(def, info, anchor, key, card);
    return def;
  }
  if (navigator.onLine === false) { const def = { word, line: 'Not in the offline dictionary.' }; show(def, true); return null }
  try {
    const found = await defineByCompanion(word, info, line => { if (alive()) show({ word, inText: line }) });
    const def = found ? { word: found.word || word, pos: found.pos || '', inText: found.line } : null;
    // Kept in the file it was asked in, even when the reader has moved on.
    if (def) keepDefine(def, info, anchor, key, card);
    if (!alive()) return def;
    show(def || { word, line: errorCopy(null) }, true);
    return def;
  } catch (e) {
    if (!alive()) return null;
    show({ word, line: e?.code === 'offline' ? 'Not in the offline dictionary.' : errorCopy(e) }, true);
    return null;
  }
}
/*
 * Define on the wide margin column (Anders, 19 Oct 2026): the selection lets go and Define's card opens in the column at
 * the word, its dots showing until the meaning arrives, and grows as the dictionary, "In this text" and the fitting
 * sense come in. A word defined there before opens its card again (and is looked up afresh). A card whose lookup found
 * nothing (offline, an error) is shown open but not kept: it goes when it folds.
 */
function defineCard(word) {
  const info = mr.info, anchor = mr.anchor, before = mr.before, key = state.key;
  marginClose(); getSelection().removeAllRanges();
  const existing = keptCards().find(c => c.kind === 'define' && !c.gone && c.page === info.page && c.text === info.text.slice(0, 2000));
  const card = existing || withSpan(TinctMargin.newCard({ kind: 'define', page: info.page, anchor, text: info.text, data: { word } }), info);
  if (!existing) { dropDraft(col.draft?.id); col.draft = card; col.view = null }
  const token = col.defToken = {}, id = card.id;
  const alive = () => col.defToken === token && state.key === key;
  setLive(id, { text: '', status: '' });
  openCard(id, { focus: 'card' });
  const show = def => {
    col.defs.set(id, { word: def.word || word, pos: def.pos || '', senses: (def.senses || []).map(x => ({ text: x.text, ...(x.fit ? { fit: true } : {}) })), ...(def.line ? { line: def.line } : {}), ...(def.inText ? { inText: def.inText } : {}) });
    const any = !!(def.inText || def.line || def.senses?.length);
    setLive(id, { text: any ? (def.inText || def.line || def.senses[0].text) : '', status: '' });
  };
  runDefine({ word, info, anchor, key, before, alive, show, card }).catch(() => null).finally(() => {
    if (col.defToken !== token) return;
    col.live.delete(id);
    // Kept: the card's own data from now on. Not kept: its words stay on the open card until it folds.
    if (cardById(id)) { col.defs.delete(id); if (col.draft?.id === id) col.draft = null }
    col.view = null; marginLayout();
  });
}
/** The column's Define card not yet kept goes when it folds or another opens (nothing was found for it). */
function dropDraft(id) {
  if (!id || col.draft?.id !== id) return;
  col.draft = null; col.defs.delete(id); col.live.delete(id); col.view = null;
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
  const pdf = await pdfPages(info.page, { before: 0, after: 0 }), wholeDoc = await marginDocumentNow(info.page, 'define');
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
      dictation.stop(); mrShow(mr.base || (mr.def ? 'define' : 'menu'))
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
  if (mr?.el && !mr.moreEl && ['menu', 'colors', 'define', 'existing'].includes(mr.mode) && !e.metaKey && !e.ctrlKey && !e.altKey) {
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
  else if (!['menu', 'colors', 'define', 'existing'].includes(mr.mode)) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (key.action === 'note') { mr.defToken = {}; mr.def = null; return mrNoteOpen() }
  mrShow('asking', { question: key.ch });
}, true);
// A tap or click outside lets go of a passage the margin holds (a new selection opens its own).
document.addEventListener('pointerdown', e => { if (mr && !e.target.closest?.('.mr-float') && (mr.held || mr.mode !== 'menu')) marginClose() }, true);

/* Dictation into a question: the book reader's chat dictation, ported line for line from src/lab/useLabDictation.ts
   (its states, its copy, its mic button; Anders, 19 Oct 2026: "the transcription didn't work as smooth as the
   normal chat … could we just copy what we're doing in the normal chat"). Signed in, one clip is recorded while
   the mic is on and turned into text by /api/dictation (xAI); signed out, or without MediaRecorder, the browser's
   own speech recognition, so no anonymous audio reaches Tinct. It only edits the question: it never sends it.
   States: idle, starting (the microphone opening; tapping again cancels), listening (the mic finishes and sends
   the clip), transcribing (the mic waits). The target is the card (by its id) or the bar's Ask field, never a DOM
   node: a card drawn again mid-dictation keeps its words and its state (the old port wrote into a field the
   redraw had replaced). Its line under the field says the state as the chat's does ("Listening — tap stop to
   finish", the ring while starting and writing), or what went wrong. */
const DICTATION_COPY = {
  unavailable: 'Dictation is unavailable in this browser. Use your keyboard microphone or type your question.',
  denied: 'Microphone access was denied. Allow it in your browser to dictate.',
  noSpeech: 'No speech heard. Tap the microphone to try again.',
  stopped: 'Dictation stopped. Tap the microphone to try again.',
  noStart: 'The microphone could not start. Please try again.',
  failed: 'Dictation could not be turned into text. Tap the microphone to try again.',
};
const DICTATION_MAX_SECONDS = 60;
const DICTATION_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];
const dictation = {
  state: 'idle', notice: null, recognition: null, recording: null, session: 0,
  // { card: id } or { bar: true }; the field and its mic are found from it whenever they are needed.
  target: null,
  field() {
    const t = this.target; if (!t) return null;
    if (t.bar) return mr?.el?.querySelector('.mr-ask') || null;
    for (const host of document.querySelectorAll(`.mr-card[data-id="${CSS.escape(t.card)}"], .mr-sheet[data-id="${CSS.escape(t.card)}"]`)) { const f = host.querySelector('.mr-follow__input'); if (f) return f }
    return null;
  },
  set(state, notice = this.notice) {
    // The bar has no room for a line: what went wrong there is a toast, as before.
    if (this.target?.bar && state === 'idle' && notice && notice !== this.notice) toast(notice);
    this.state = state; this.notice = notice; this.paint();
  },
  /** The mic and the line under the field, drawn again from the state (after any card redraw too). */
  paint() {
    const t = this.target, live = this.state !== 'idle';
    const mic = t?.bar ? mr?.el?.querySelector('[data-m="mic"]') : this.field()?.closest('.mr-follow')?.querySelector('[data-c="mic"]');
    for (const b of document.querySelectorAll('[data-c="mic"], .mr-bar [data-m="mic"]')) if (b !== mic && b.getAttribute('aria-pressed') === 'true') { b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Dictate a question'); b.disabled = false; b.innerHTML = TinctMargin.html.CARD_ICONS.mic }
    document.querySelectorAll('.mr-dictation').forEach(n => { if (!mic || !n.parentElement?.contains(mic)) n.remove() });
    if (!mic) return;
    mic.setAttribute('aria-pressed', String(live));
    mic.setAttribute('aria-label', live ? 'Stop dictation' : 'Dictate a question');
    mic.disabled = this.state === 'transcribing';
    const icon = live ? (TC?.ICONS.stop || TinctMargin.html.CARD_ICONS.mic) : TinctMargin.html.CARD_ICONS.mic;
    if (mic.dataset.icon !== String(live)) { mic.dataset.icon = String(live); mic.innerHTML = icon }
    // The line: in the card (or bottom card) below its follow-up line. The bar shows the state on its mic only.
    if (t?.bar) return;
    const host = mic.closest('.mr-follow')?.parentElement;
    let line = host?.querySelector(':scope > .mr-dictation');
    const text = this.state === 'listening' ? 'Listening — tap stop to finish' : this.state === 'idle' ? this.notice : null;
    if (!live && !text) { line?.remove(); return }
    if (!line && host) { line = document.createElement('p'); line.className = 'mr-status mr-dictation'; line.setAttribute('role', 'status'); host.append(line) }
    if (!line || line.dataset.state === this.state + ':' + (text || '')) return;
    line.dataset.state = this.state + ':' + (text || '');
    line.replaceChildren();
    if (this.state === 'starting' || this.state === 'transcribing') line.append(TinctWait.waitRing(this.state === 'starting' ? 'Starting microphone…' : 'Writing down what you said…', { size: 14, live: false }));
    else line.textContent = text;
  },
  write(text) { const f = this.field(); if (!f) return; f.value = text; f.dispatchEvent(new Event('input', { bubbles: true })) },
  stop() {
    this.session++;
    const r = this.recognition; this.recognition = null;
    if (r) { r.onstart = r.onresult = r.onerror = r.onend = null; try { r.stop() } catch { /* already stopped */ } }
    const c = this.recording; this.recording = null;
    if (c) {
      if (c.timer) clearTimeout(c.timer);
      c.recorder.ondataavailable = c.recorder.onstop = c.recorder.onerror = c.recorder.onstart = null;
      try { if (c.recorder.state !== 'inactive') c.recorder.stop() } catch { /* already stopped */ }
      c.stream.getTracks().forEach(t => t.stop()); c.abort.abort();
    }
    this.set('idle');
  },
  /** The mic in a card (`{ card: id }`) or the bar (`{ bar: true }`). */
  toggle(target) {
    const same = this.target && (target.bar ? this.target.bar : this.target.card === target.card);
    if (!same && this.state !== 'idle') this.stop();
    if (!same) { this.notice = null; this.paint() }
    this.target = target;
    if (this.recognition) return this.stop();
    if (this.recording) {
      // Recording: the mic finishes and sends. While it is being transcribed there is nothing more to finish.
      if (this.recording.recorder.state === 'recording') this.finish();
      return;
    }
    // The microphone is still being opened: tapping again cancels.
    if (this.state === 'starting') return this.stop();
    const prefix = (this.field()?.value || '').trim(), token = window.TinctAI?.session?.().token;
    if (token && typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia) this.record(prefix); else this.recognise(prefix);
  },
  finish() {
    const c = this.recording; if (!c || c.recorder.state === 'inactive') return;
    if (c.timer) { clearTimeout(c.timer); c.timer = null }
    this.set('transcribing');
    try { c.recorder.stop() } catch { this.stop(); this.set('idle', DICTATION_COPY.stopped) }
  },
  async transcribe(session, c, blob) {
    const current = () => this.session === session;
    const fail = message => { if (!current()) return; this.recording = null; this.set('idle', message) };
    if (!blob.size) return fail(DICTATION_COPY.noSpeech);
    try {
      const token = window.TinctAI?.session?.().token;
      if (!current()) return;
      if (!token) return fail(DICTATION_COPY.failed);
      // A reader's own file sends no vocabulary hints: its names stay on the device (as the book reader's).
      const form = new FormData(); form.append('language', 'en'); form.append('bookId', 'userbook-' + hexOf(state.key)); form.append('audio', blob, 'dictation');
      const internal = (() => { try { return localStorage.getItem('tinct:internal') === '1' ? { 'x-tinct-check': '1' } : {} } catch { return {} } })();
      const r = await fetch('/api/dictation', { method: 'POST', body: form, headers: { ...internal, Authorization: 'Bearer ' + token }, signal: c.abort.signal });
      const data = await r.json().catch(() => ({}));
      if (!current()) return;
      if (!r.ok || typeof data.text !== 'string') return fail(DICTATION_COPY.failed);
      const text = data.text.trim();
      if (!text) return fail(DICTATION_COPY.noSpeech);
      this.recording = null;
      this.write([c.prefix, text].filter(Boolean).join(' '));
      this.set('idle');
    } catch { fail(DICTATION_COPY.failed) }
  },
  record(prefix) {
    const session = ++this.session;
    this.set('starting', null);
    (async () => {
      let stream;
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }) }
      catch (e) { if (this.session !== session) return; this.set('idle', e?.name === 'NotAllowedError' || e?.name === 'SecurityError' ? DICTATION_COPY.denied : DICTATION_COPY.noStart); return }
      if (this.session !== session) { stream.getTracks().forEach(t => t.stop()); return }
      let recorder;
      try {
        const type = DICTATION_MIME_TYPES.find(t => { try { return MediaRecorder.isTypeSupported(t) } catch { return false } });
        recorder = new MediaRecorder(stream, { ...(type ? { mimeType: type } : {}), audioBitsPerSecond: 32000 });
      } catch { stream.getTracks().forEach(t => t.stop()); this.set('idle', DICTATION_COPY.noStart); return }
      const c = this.recording = { recorder, stream, chunks: [], timer: null, abort: new AbortController(), prefix };
      recorder.ondataavailable = ev => { if (ev.data?.size) c.chunks.push(ev.data) };
      recorder.onstart = () => { if (this.session === session) this.set('listening') };
      recorder.onerror = () => { if (this.session !== session) return; this.stop(); this.set('idle', DICTATION_COPY.stopped) };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (this.session !== session) return;
        this.transcribe(session, c, new Blob(c.chunks, { type: recorder.mimeType || c.chunks[0]?.type || 'audio/webm' }));
      };
      c.timer = setTimeout(() => { if (this.session === session) this.finish() }, DICTATION_MAX_SECONDS * 1000);
      try { recorder.start() } catch { this.stop(); this.set('idle', DICTATION_COPY.noStart) }
    })();
  },
  recognise(prefix) {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) { this.set('idle', DICTATION_COPY.unavailable); return }
    this.session++;
    const rec = this.recognition = new R();
    rec.continuous = true; rec.interimResults = true; rec.lang = navigator.language || 'en-US';
    this.set('starting', null);
    rec.onstart = () => { if (this.recognition === rec) this.set('listening') };
    rec.onresult = ev => { if (this.recognition === rec) this.write([prefix, [...ev.results].map(x => x[0].transcript.trim()).filter(Boolean).join(' ')].filter(Boolean).join(' ')) };
    rec.onerror = ev => {
      if (this.recognition !== rec) return;
      const notice = ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? DICTATION_COPY.denied : ev.error === 'no-speech' ? DICTATION_COPY.noSpeech : DICTATION_COPY.stopped;
      this.stop(); this.set('idle', notice);
    };
    rec.onend = () => { if (this.recognition === rec) this.stop() };
    try { rec.start() } catch { this.stop(); this.set('idle', DICTATION_COPY.noStart) }
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
const mpReady = import('/lab/margin/margin-parse.js?v=20261020epub').then(m => (MP.P = m)).catch(() => null);
const col = { el: null, stack: null, leads: null, marks: null, float: null, sheet: null, mode: null, open: null, els: new Map(), live: new Map(), pending: new Map(), drafts: new Map(), ctl: new Map(), quiz: new Map(), raf: 0, view: null, viewAt: 0, whole: { away: false }, draft: null, defs: new Map(), defToken: null, pills: new Map() };
// Delete's "Deleted · Undo" line (deleteCard).
const UNDO_MS = 6000;
const undo = { el: null, timer: 0, rect: null, restore: null };
/* The margin for EPUBs read here (FIXES-2026-10-15 PR C), on since 19 Oct 2026 on the desktop (Anders: EPUBs
   open here in Margin view, TinctReaderLayout.epubView). A phone reads EPUBs in the Tinct reader as before; an
   EPUB open here at a phone's width keeps the selection popup and the docked chat. The layout check turns the
   margin on at a phone's width too (window.TinctEpubMargin) for its `epub` mode. */
const EPUB_MARGIN = true;
const epubMargin = () => (EPUB_MARGIN && innerWidth >= 700) || window.TinctEpubMargin === true;
// The PDF reader's margin: a PDF, and an EPUB when EPUB_MARGIN is on.
const marginOn = () => hasBook() && (state.kind === 'pdf' || (state.kind === 'epub' && epubMargin()));
/** How the margin names the file and a place in it: pages for a PDF, chapters for an EPUB. */
const docKind = () => (isEpub() && !isPdfText() ? 'epub' : 'pdf');
// An EPUB names a chapter by its title, exactly as its pill and contents do ("1 The Fate of Spacetime"; the preview's
// "Chapter 1", "Letter 2"), never by its place in the file (Anders, 20 Oct 2026: "Quiz me · ch. 9" under the pill's
// "1 The Fate of Spacetime"; round 1 of the preview did the same for Tinct books).
const where = () => (isPdfText() ? { doc: 'pdf' } : isEpub() ? { unit: epubNamesChapters() ? '' : 'ch.', doc: 'epub' } : { doc: 'pdf' });
const epubNamesChapters = () => isEpub() && toc.ready && toc.entries.length > 0;
/** A card's place as its label shows it: the page label, or an EPUB's chapter title (its number when it has no contents). */
const placeName = n => (isEpub() && chapterTitle(n)) || pageLabel(n);
const chapterTitle = n => (state.preview ? toc.entries.find(e => e.page === n && e.kind === 'chapter')?.label : chapterAt(n)?.label) || '';
// A card in a PDF's Tinct text names the PDF page its passage is printed on, as on the pages.
const cardPlace = card => (isPdfText() ? pdfTextLabel(pdfTextPage(card.page, card.text) || 1) : placeName(card.page));
const cardName = card => TinctMargin.html.cardLabel(card, cardPlace(card), where());
/** An EPUB chapter as a place in prose (its title, as the pill names it; "ch. 3" without one), for Copy quote and the Notebook. */
const chapterPlace = n => chapterTitle(n) || `ch. ${n}`;
const keptCards = () => store.get('cards:' + state.key) || [];
// Cards made before this visit without their answer are not shown (TinctMargin.cardView); newer ones may still be answering.
const CARDS_SINCE = Date.now();
const cardById = id => keptCards().find(c => c.id === id && !c.gone) || null;
function saveCard(card) {
  card.u = Date.now();
  if (card.turns) card.turns = card.turns.slice(-TinctMargin.CARD_LIMITS.turns).map(t => ({ ...t, content: String(t.content || '').slice(0, TinctMargin.CARD_LIMITS.content) }));
  store.set('cards:' + state.key, [...keptCards().filter(c => c.id !== card.id), card]);
  cardsSync.changed();
  try { marginLayout({ fresh: true }) } catch (e) { reportCardError(e, 'layout', card.kind) }
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
/** The page labels pageLabels settles on for this file, from a whole-book read: the file's own, those kept on this device, else the printed numbers. */
async function documentLabels(pdf, key, read) {
  if (state.labels) return state.labels;
  if (isEpub() || !pdf) return null;
  const own = await Promise.resolve(pdf.getPageLabels?.()).catch(() => null);
  if (Array.isArray(own) && own.length === pdf.numPages) return own;
  if (!window.TinctPrintedPages) return null;
  const ocr = state.ocrPages ? state.ocrPages.size : 0, kept = store.get('printed:' + key);
  if (kept?.v === PRINTED_V && kept.pages === pdf.numPages && (kept.ocr || 0) === ocr) return Array.isArray(kept.labels) && kept.labels.length === pdf.numPages ? kept.labels : null;
  return TinctPrintedPages.labels(read.numbers) || null;
}
/**
 * The margin's document for a request, never waiting on the scan's chapters or the printed labels (Ask
 * latency, 16 Oct: the first Ask on a fresh open waited for them). The actions that work from the passage
 * (Explain, Simplify, Define, a quiz answer's marking) wait for the whole-book read at most
 * PASSAGE_DOC_WAIT_MS and are sent without the document after that, as before the cached document: they
 * write no cache, so the document's cached prefix stays the same bytes for every request that has it. The
 * document-wide actions (Ask, Counterpoint, Related, Fact-check, Quiz me, a figure, the whole-PDF chat)
 * wait for it, with `onWait` told once the wait is noticeable, up to DOC_WAIT_MS (the requests' own idle bound).
 */
/** The status line of a document-wide action waiting for the whole-book read. */
const DOC_WAIT_STATUS = 'Reading the document…';
const PASSAGE_DOC_WAIT_MS = 3000, DOC_WAIT_MS = 120000, DOC_WAIT_SAID_MS = 1200;
const PASSAGE_KINDS = new Set(['explain', 'simplify', 'define', 'quiz_check']);
async function marginDocumentNow(page, kind, onWait = null) {
  const task = marginDocument(page);
  const passage = PASSAGE_KINDS.has(kind);
  const said = onWait && !passage ? setTimeout(onWait, DOC_WAIT_SAID_MS) : null;
  try { return await Promise.race([task, new Promise(r => setTimeout(() => r(null), passage ? PASSAGE_DOC_WAIT_MS : DOC_WAIT_MS))]) }
  finally { clearTimeout(said) }
}
/* The whole file as the margin's companion reads it (docs/margin/FIXES-2026-10-15.md A1): every page's
   text with its printed label, read once per book and kept, so each request sends the same text and the
   Worker's cached prefix is read, not rewritten. A file longer than TinctAI.DOCUMENT_CHARS sends the
   chapter the reader is in with the contents list instead, and a search of the rest for a question. */
const docCache = { key: null, task: null };
/** A PDF's Tinct text as its pages: each page's words in the text (a figure as its caption), by page number. */
function pdfTextPages() {
  const t = state.pdfText, texts = new Map();
  for (const c of t.edition.chapters) c.paragraphs.forEach((p, i) => {
    const id = PT().figureId(p), text = id ? (c.figures || []).find(f => f.id === id)?.caption || '' : p;
    const page = c.pages?.[i] || 1;
    if (text) texts.set(page, (texts.get(page) ? texts.get(page) + '\n\n' : '') + text);
  });
  return texts;
}
function readDocument() {
  if (state.preview) return Promise.resolve(previewDocument());
  if (isPdfText()) {
    const t = state.pdfText, limit = window.TinctAI?.DOCUMENT_CHARS || 560000, texts = pdfTextPages(), pages = [];
    let chars = 0;
    for (let n = 1; n <= t.pages; n++) { const text = texts.get(n) || ''; chars += text.length; pages.push({ n: pdfTextLabel(n), text }) }
    return Promise.resolve(chars > limit ? { pages: null, limit, label: pdfTextLabel } : { pages, limit, label: pdfTextLabel });
  }
  if (docCache.key === state.key && docCache.task) return docCache.task;
  const key = state.key, limit = window.TinctAI?.DOCUMENT_CHARS || 560000;
  docCache.key = key;
  const pdf = state.pdf;
  docCache.task = (async () => {
    // The labels are taken as pageLabels will settle them (the file's own, those kept, else the numbers the
    // pages print, from this same read), not waited for: they wait on the scan's chapters (Ask latency, 16 Oct).
    const read = await readBook();
    if (!read || state.key !== key) return null;
    const labels = await documentLabels(pdf, key, read);
    if (state.key !== key) return null;
    const label = n => { const l = String(labels?.[n - 1] ?? '').trim(); return LABEL_RE.test(l) ? l : String(n) };
    const pages = []; let chars = 0;
    for (let n = 1; n <= state.pages.length; n++) {
      const text = read.texts[n - 1] || '';
      if ((chars += text.length) > limit) return { pages: null, limit, label };
      pages.push({ n: label(n), text });
    }
    return { pages, limit, label };
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
    return { kind: 'epub', units: [{ n: pageLabel(page), text: text.slice(0, read.limit) }], part: { toc: toc.entries.map(e => ({ title: e.label, n: pageLabel(e.page) })), total: state.pages.length }, ...(state.preview ? { library: true } : {}) };
  }
  const [r, contents] = await Promise.all([docRange(page), contentsSoon()]);
  if (state.key !== key) return null;
  const units = []; let chars = 0;
  for (let n = r.from; n <= r.to; n++) { const text = book.texts[n - 1] || ''; if ((chars += text.length) > read.limit) break; units.push({ n: read.label(n), text }) }
  return { kind: 'pdf', units, part: { toc: contents.entries.map(e => ({ title: e.label, n: read.label(e.page) })), total: state.pages.length }, range: { from: r.from, to: r.from + units.length - 1 } };
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
  const unit = primer.parts && primer.parts[0]?.key !== 'all' ? TinctMargin.unitAt(primer.parts, page) : null;
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
// An EPUB (and the preview's Tinct book) has no pages: a page reference in an answer is left out, never shown as "p. 9"
// (Anders, 20 Oct 2026; margin.js citeHtml reads `drop`). A PDF keeps its references.
Object.defineProperty(citeResolve, 'drop', { get: () => isEpub() && !isPdfText() });
function citeResolve(token) {
  // A PDF's Tinct text: its pages, as the companion was shown them (readDocument).
  if (isPdfText()) { const t = state.pdfText; return TinctMargin.citeTarget(token, { labels: t.labels, count: t.pages, texts: pdfTextPages() }) }
  if (isEpub()) return null;
  const texts = new Map([...state.texts.entries()].map(([n, v]) => [n, v.text]));
  return TinctMargin.citeTarget(token, { labels: state.labels, count: state.pages.length, texts });
}
/** Scroll the PDF to a citation's page, and to its printed words on it when they are found. */
function goToCite(page, needle) {
  // A PDF's Tinct text: the page's first words in the text, or the cited words where they stand on it.
  if (isPdfText()) {
    const t = state.pdfText, at = PT().spotAt(t.edition, page, 0); if (!at) return;
    const found = needle ? PT().chaptersOnPage(t.edition, page).flatMap(n => PT().parasOnPage(t.edition, n, page).map(i => ({ n, i }))).find(({ n, i }) => PT().norm(t.edition.chapters[n - 1].paragraphs[i]).includes(PT().norm(needle))) : null;
    epubGoSpot(found ? found.n : at.n, found ? found.i : at.para, found ? 0 : at.word);
    return;
  }
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
    setTimeout(() => flashPlace(p, range ? textRects(range) : []), 450);
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
    // (No "N more" row: the column's cards are part of the page and are pushed down, never gathered; 19 Oct 2026.)
    col.stack = document.createElement('button');
    bindCardEvents(el);
    // One scroll surface (Anders, 15 Oct): the wheel over the column scrolls the pages, unless it is over a card's own
    // scrolling body. Over an open card's body, Chat or Before you start that scrolls, it never reaches the pages, even
    // at its end (Anders, 19 Oct 2026: "if you scroll the chat … and the chat is at the bottom, it starts scrolling the
    // reading feed"); the pages scroll from the folded cards and the empty column.
    el.addEventListener('wheel', e => {
      if (e.ctrlKey || !$('scroll') || ownScroll(e.target, el)) return;
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
/** A scrolling body (overflow auto or scroll, taller than its box) of an open card, Chat or the primer, at or above `target`, below `stop`. */
function ownScroll(target, stop = null) {
  for (let n = target; n && n !== stop && n !== document.body; n = n.parentElement) {
    if (n.scrollHeight - n.clientHeight > 1 && /(auto|scroll)/.test(getComputedStyle(n).overflowY) && n.closest('.mr-card.is-open, .mr-primer, .mr-sheet, .mr-float')) return n;
  }
  return null;
}
/* A touch drag inside such a body never moves the page behind it, on iOS Safari too (overscroll-behavior covers
   only what it can: a drag that starts at the body's end is chained by older WebKit). Only at an end, and only in
   the direction the body cannot go; the bottom card's swipes on its handle and label are not bodies. */
const touchHold = { body: null, y: 0 };
document.addEventListener('touchstart', e => { touchHold.body = e.touches.length === 1 ? ownScroll(e.target) : null; touchHold.y = e.touches[0]?.clientY || 0 }, { passive: true, capture: true });
document.addEventListener('touchmove', e => {
  const b = touchHold.body; if (!b || e.touches.length !== 1 || !e.cancelable) return;
  const y = e.touches[0].clientY, down = y > touchHold.y; touchHold.y = y;
  if ((down && b.scrollTop <= 0) || (!down && b.scrollTop + b.clientHeight >= b.scrollHeight - 1)) e.preventDefault();
}, { passive: false, capture: true });
function marginStop() {
  for (const c of col.ctl.values()) c.abort();
  col.ctl.clear(); col.live.clear(); col.pending.clear(); col.quiz.clear();
  closeFloat(); closeSheet2();
  col.el?.remove(); col.leads?.remove(); col.marks?.remove(); col.cover?.remove(); dropDocLayer();
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

/* The focus ring on the margin's buttons is for the keyboard only (Anders, 19 Oct 2026: Minimise showed its ring after a
   click). A card opened or redrawn by a click may put the focus on its Minimise for screen readers; with the pointer as
   the last input, no ring shows (css/margin.css [data-mr-input="pointer"]). The keys bring it back. */

/* -- Layout, once a frame while the pages scroll -- */
function marginLayout({ fresh = false } = {}) {
  if (fresh) col.view = null;
  if (col.raf) return;
  col.raf = requestAnimationFrame(() => { col.raf = 0; try { layoutNow() } catch (e) { console.error(e) } primerPrefetch() });
}
function viewCards() {
  // An EPUB's text reflows (zoom, width), so its cards and noted highlights are measured from their
  // character offsets near the reader's place, and again when that place moves to another chapter.
  if (isEpub()) { const at = state.pages.length ? currentPlace().page : 0; if (col.viewAt !== at) { col.viewAt = at; col.view = null } }
  if (!col.view) {
    col.view = isEpub() ? TinctMargin.cardView(keptCards().map(epubCardRects), highlights().map(epubMarkRects), { since: CARDS_SINCE }) : TinctMargin.cardView(keptCards(), highlights(), { since: CARDS_SINCE });
    // Define's card on the wide column, open before it is kept (defineCard).
    if (col.draft && !col.view.some(c => c.id === col.draft.id)) col.view = [...col.view, col.draft];
  }
  return col.view;
}
/* ---- An EPUB's passages as offsets in a chapter's text (as its highlights are), measured into the
   page-fraction boxes the margin draws with. A chapter far from the reader keeps its stored boxes. ---- */
function epubRects(n, start, end) {
  const p = state.pages[n - 1]; if (!p || p.kind !== 'epub' || !isNear(p)) return null;
  const range = rangeFromOffsets(p.pg, start, end); if (!range) return null;
  const b = p.pg.getBoundingClientRect(); if (!b.width || !b.height) return null;
  const r = v => Math.round(v * 10000) / 10000;
  const rects = lineBars(textRects(range)).map(bar => [n, r((bar.left - b.left) / b.width), r((bar.top - b.top) / b.height), r((bar.right - bar.left) / b.width), r((bar.bottom - bar.top) / b.height)]);
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
const cardSig = (card, open) => JSON.stringify([card.u, open, col.live.get(card.id), col.defs.get(card.id) || 0, col.pending.get(card.id), state.labels ? 1 : 0, open && card.kind === 'quiz' ? card.data : 0, col.quiz.has(card.id), card.kind === 'figure' && figThumbs.has(card.id)]);
function cardOpts(card, open) {
  const live = col.live.get(card.id);
  // The wide column shows no picture in a figure's card: the figure is beside it (Anders, 19 Oct 2026, night).
  const thumb = open && card.kind === 'figure' && marginMode() !== 'column' ? figThumb(card) : null;
  // Simplify compares its answer with the page and the next (simplifyAnswer): the document pasted back is never shown.
  const source = card.kind === 'simplify' ? [card.page, card.page + 1].map(n => state.texts.get(n)?.text || '').join('\n') : '';
  return { open, sheet: open && marginMode() === 'phone', P: MP.P, resolve: citeResolve, place: quotePlace, source, where: where(), pageLabel: cardPlace(card), live: live ? live.text : null, status: live?.status || '', pending: col.pending.get(card.id), writing: col.quiz.has(card.id), ...(thumb ? { thumb: thumb.url, thumbRatio: thumb.ratio } : {}) };
}
/** "Writing the next question…" keeps the card at the height it had (no jump); any other state lets it go. */
function holdQuizHeight(el, before) {
  if (el.querySelector('.mr-writing')) el.style.minHeight = Math.max(before, parseFloat(el.style.minHeight) || 0) + 'px';
  else el.style.removeProperty('min-height');
}
/**
 * A card's markup (TinctMargin.html.cardHtml). Should drawing it throw (an answer the parser cannot take,
 * a card kept by an older version), the card shows its words as plain paragraphs, with its label and
 * close and delete, and the error is reported: a card is never left as it was, waiting.
 */
function cardHtmlSafe(card, open) {
  let o = null;
  try { o = cardOpts(card, open); return TinctMargin.html.cardHtml(card, o) }
  catch (e) {
    reportCardError(e, 'render', card.kind);
    if (!o) { const live = col.live.get(card.id); o = { live: live ? live.text : null, status: live?.status || '' } }
    const name = (() => { try { return cardName(card) } catch { return String(card.kind || '') } })();
    const said = o.live != null ? o.live : [...(card.turns || [])].reverse().find(t => t.role === 'assistant')?.content || '';
    const paras = String(said || '').replace(/\{[^{}\n]{1,40}\}/g, '').split(/\n{2,}/).map(t => t.trim()).filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('');
    if (!open) return `<button type="button" class="mr-card__label" data-c="open">${esc(name)}</button><div class="mr-card__text">${esc(String(card.text || said).slice(0, 140))}</div>`;
    return `<div class="mr-card__label"><span class="mr-card__name">${esc(name)}</span><button type="button" class="mr-card__close" data-c="close" aria-label="Minimise">${TinctMargin.html.CARD_ICONS?.minimise || '–'}</button></div>`
      + `<div class="mr-card__body">${paras ? `<div class="mr-answer">${paras}</div>` : ''}${o.status ? `<p class="mr-status" role="status">${esc(o.status)}</p>` : o.live === '' ? '<div class="mr-wait"></div>' : ''}<div class="mr-card__acts"><button type="button" class="mr-card__delete" data-c="delete" aria-label="Delete">${TinctMargin.html.CARD_ICONS?.trash || "×"}</button></div></div>`;
  }
}
/**
 * The wait before an answer's first word, in the margin's cards, Chat and Before you start: the book reader's chat
 * dots (chat-thread.js WAIT_HTML, styled in margin.css as chat-thread.css styles them), not the ring (Anders,
 * 19 Oct 2026: "I like the dots a lot more that we have in normal reader interface").
 */
const WAIT_DOTS = '<span class="tc-wait" role="status" aria-label="Answer on the way"><i></i><i></i><i></i></span>';
function waitDots() { const t = document.createElement('template'); t.innerHTML = TC?.WAIT_HTML || WAIT_DOTS; return t.content.firstChild }
/*
 * A question sent in Chat or as a card's follow-up (Anders, 19 Oct 2026: "it doesn't take you down to your last
 * question. It sort of starts at the top"): as the book reader's chat does (chat-thread.js questionTop and
 * fitSpacer, LabAskPane / this file's holdQuestion), the thread scrolls once so the question sits near the top of
 * the body, with a little of what came before above it, and the answer grows below it; writing space under the
 * question (.tc-spacer) lets it get there while the answer is short. After that nothing moves: each redraw keeps the
 * body where the reader has it, so a reader who scrolled up is never pulled back. A body that does not scroll yet
 * shows everything and needs no hold; the question is placed the first time the thread outgrows it.
 * hold: { turn (the question's turn index, [data-turn]), place (not yet placed) }; kept: the body's scrollTop before
 * the redraw (null when it was not drawn before). -> true when a question is held.
 */
const holds = new Map();
function holdThread(body, hold, kept, live = true) {
  const row = hold && TC && body.querySelector(`[data-turn="${hold.turn}"]`);
  if (!row) return false;
  // A body that does not scroll (the wide column's card grows in place), or an answer that has finished: no room is
  // kept below it (Anders, 20 Oct 2026: after a follow-up the card grew to nearly full height, a large empty area
  // between the answer and its field). The card is as tall as what it holds.
  if (!live || getComputedStyle(body).overflowY === 'visible') { body.querySelector(':scope > .tc-spacer')?.remove(); return false }
  let space = body.querySelector(':scope > .tc-spacer');
  if (!space) { space = document.createElement('div'); space.className = 'tc-spacer'; space.setAttribute('aria-hidden', 'true'); body.append(space) }
  space.style.height = '0px';
  if (body.scrollHeight - body.clientHeight <= 1 && hold.place) return true;
  const top = TC.questionTop(body, row);
  TC.fitSpacer(body, top);
  if (hold.place) { hold.place = false; body.scrollTop = top }
  else if (kept != null) body.scrollTop = kept;
  return true;
}
const bodyTop = el => { const b = el?.querySelector('.mr-card__body'); return b ? b.scrollTop : null };
/** Draw a card into `el` when what it shows changed; true when it was drawn again. */
function drawCard(el, card, open) {
  card = quizLive(card);
  // Define while it is looked up (defineCard): the words so far.
  if (col.defs.has(card.id)) card = { ...card, data: col.defs.get(card.id) };
  const sig = cardSig(card, open);
  if (el.dataset.sig === sig) return false;
  el.dataset.sig = sig; el.dataset.id = card.id;
  el.className = 'mr ' + TinctMargin.html.cardClass(card, open) + (el.classList.contains('is-floating') ? ' is-floating' : '') + (card.data?.unit ? ' is-unit' : '');
  if (card.kind === 'note') el.style.setProperty('--hl-color', (HL_COLORS.find(c => c[0] === card.color) || HL_COLORS[0])[3]);
  const field = el.querySelector('.mr-follow__input'), draft = field?.value, focused = field && document.activeElement === field;
  const closeFocused = !!document.activeElement?.matches?.('.mr-card__close') && el.contains(document.activeElement);
  const before = card.kind === 'quiz' && open ? el.offsetHeight : 0, kept = open ? bodyTop(el) : null;
  // A margin note's field being written keeps its words, caret and focus through a redraw (and is not kept meanwhile).
  const noteField = el.querySelector('.mr-note-edit'), noteText = noteField?.value, noteFocus = noteField && document.activeElement === noteField ? [noteField.selectionStart, noteField.selectionEnd] : null;
  if (noteFocus) noteCommitting = true;
  try {
    el.innerHTML = cardHtmlSafe(card, open);
    const nf = el.querySelector('.mr-note-edit');
    if (nf) { if (noteText != null) nf.value = noteText; fitNote(nf); if (noteFocus) { nf.focus({ preventScroll: true }); nf.setSelectionRange(...noteFocus) } }
  } finally { if (noteFocus) noteCommitting = false }
  if (card.kind === 'quiz') holdQuizHeight(el, before);
  describeCard(el, card, open);
  keepThread(el, card.id, kept);
  if (closeFocused) el.querySelector('.mr-card__close')?.focus({ preventScroll: true });
  if (open) { el.setAttribute('role', 'region'); el.setAttribute('aria-label', cardName(card)) } else { el.removeAttribute('role'); el.removeAttribute('aria-label') }
  const live = col.live.get(card.id);
  if (open && live && !live.status) el.setAttribute('aria-busy', 'true'); else el.removeAttribute('aria-busy');
  // The dots: before the first word, and below the last text whenever the answer pauses (a search, a slow stretch).
  if (open && (liveWaiting(live, card) || col.pending.has(card.id))) {
    const dots = waitDots(), slot = el.querySelector('.mr-wait');
    if (slot) slot.append(dots); else el.querySelector('.mr-card__body')?.append(dots);
  }
  const f = el.querySelector('.mr-follow__input');
  if (f && draft) { f.value = draft; f.classList.add('has-text'); fitFollow(f) }
  restoreDraft(f, card.id);
  if (f && focused) f.focus({ preventScroll: true });
  if (dictation.target) dictation.paint();
  return true;
}
/** The passage a card is about, for screen readers: its description (the card no longer quotes it; 19 Oct 2026). */
function describeCard(el, card, open) {
  const about = open && el.querySelector('.mr-card__about');
  if (about) { about.id = 'mr-about-' + String(card.id).replace(/[^\w-]/g, ''); el.setAttribute('aria-describedby', about.id) } else el.removeAttribute('aria-describedby');
}
/** A card drawn again: its follow-up held near the top (holdThread), else its body where the reader had it. */
function keepThread(el, id, kept) {
  const body = el.querySelector('.mr-card__body'); if (!body) return;
  // The card's thread is laid out before it is measured (the column places the card after this).
  // The space that holds a question near the top is kept only while its answer is on its way (col.live).
  if (!holdThread(body, holds.get(id), kept, col.live.has(id) || col.pending.has(id)) && kept != null) body.scrollTop = Math.min(kept, body.scrollHeight - body.clientHeight);
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
    if (mode !== 'column') { col.els.forEach(e => e.remove()); col.els.clear(); col.leads.replaceChildren(); dropDocLayer() }
    if (mode !== 'marks') { col.marks?.replaceChildren(); closeFloat() }
    if (mode !== 'phone') closeSheet2();
    if (mode !== 'column') { primer.trig?.remove(); primer.trig = null; for (const el of col.pills.values()) el.remove(); col.pills.clear() }
    if (primer.el && (mode === 'phone' || !mode)) { primer.el.remove(); primer.el = null }
    if (mode === 'phone' && primer.open) openSheet2('primer');
    if (col.el) col.el.hidden = mode !== 'column';
    if (col.cover) col.cover.hidden = true;
    if (mode === 'phone' && col.open) { const o = col.open; col.open = null; openCard(o) }
  }
  if (!mode) return;
  if (!MP.P || !window.TinctWait) { mpReady.then(() => marginLayout()); return }
  if (wholeMovedOn()) col.open = null;
  const vis = mode === 'column' ? [] : visibleCards();
  // The open card's passage stays underlined wherever it is (the column's cards are part of the page).
  const openCard_ = mode === 'column' && col.open && col.open !== 'whole' ? viewCards().find(c => c.id === col.open) : null;
  underline(openCard_ ? { card: openCard_ } : vis.find(v => v.card.id === col.open) || null);
  if (mode === 'column') return layoutColumn();
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
  if (mode === 'marks') { placeFloat(vis.find(v => v.card.id === col.open)); const pr = pageRightNow(); primerMark(pr); placePrimerFloat(pr, { anchored: true }); return }
  col.marks.querySelector('.mr-mark[data-primer]')?.remove();
  // The phone: the trigger is the bottom card at a unit's start, until the reader closes it there or selects text.
  const trig = triggerUnit(), sheetId = col.sheet?.dataset.id;
  if (sheetId === 'trigger' && (!trig || mr || primer.away.has(trig.key) || state.preview)) { col.sheet.remove(); col.sheet = null }
  // The margin preview's phone has the chapters' own pills in the text (flowMarks): Primer is there, no card of its own.
  else if (!col.sheet && trig && !mr && !col.open && !primer.away.has(trig.key) && !state.preview) openSheet2('trigger');
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
/*
 * The wide desktop's column is part of the page (Anders, 19 Oct 2026, beside Gloss): its cards, Before you start,
 * Chat folded and "Deleted · Undo" sit in a layer inside the pages' scroller (col.doc), each at its passage's line,
 * and scroll with the page; nothing is fixed to the window and nothing moves while the reader scrolls (a layout
 * gives the same document positions, so it writes nothing). An open card grows in place: no scrolling body of its
 * own, the page is the one scroll. Cards that would overlap are pushed down, in page order, as comments in a
 * document editor. The leader line runs from the dot beside the passage's line to the card's label: straight
 * across when the card sits at its passage (its label is placed level with the line), and when a card was pushed
 * down, across, a short slant, then across into the card. Open Chat keeps its own panel (col.el, fixed); folded,
 * it sits at the document's top. Before you start is at its unit's first page. The phone and narrow windows are
 * as before.
 */
const SVGNS = 'http://www.w3.org/2000/svg';
function docLayer() {
  if (!col.doc) {
    const el = col.doc = document.createElement('div');
    el.className = 'mr mr-col mr-doc is-reader'; el.setAttribute('role', 'complementary'); el.setAttribute('aria-label', 'Margin');
    bindCardEvents(el);
    const svg = col.docLeads = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'mr mr-leads mr-doc-leads'); svg.setAttribute('aria-hidden', 'true');
    col.docLines = '';
  }
  const s = $('scroll');
  if (col.doc.parentElement !== s) s.append(col.doc);
  if (col.docLeads.parentElement !== col.doc) col.doc.prepend(col.docLeads);
  return col.doc;
}
function dropDocLayer() { col.doc?.remove(); col.docLeads?.remove(); col.docLines = ''; if (col.docLeads) col.docLeads.innerHTML = '' }
/** The pages' right edge for the column: the widest page's (kept per zoom and width, so it never moves with a scroll). */
function docPageRight(sr, area) {
  const key = [state.key, state.zoom, innerWidth, area, state.pages.length, $('scroll').scrollLeft].join('|');
  if (col.edgeKey !== key) {
    let right = -Infinity;
    for (const p of state.pages) right = Math.max(right, pageEdge(p));
    col.edgeKey = key; col.edgeAt = Math.min(right, sr.left + area); col.edgeOver = right > sr.left + area + 1;
  }
  return col.edgeAt;
}
function layoutColumn() {
  const C = TinctMargin.COL, s = $('scroll'), sr = s.getBoundingClientRect(), area = pagesWidth();
  const pageRight = docPageRight(sr, area);
  const box = TinctMargin.columnBox(innerWidth, pageRight);
  if (!box) return;
  col.el.style.left = box.left + 'px';
  const colH = col.el.clientHeight;
  col.el.style.setProperty('--mr-col-height', colH + 'px');
  col.el.style.setProperty('--mr-foot-height', C.foot + 'px');
  col.el.style.setProperty('--mr-reserve', '0px');
  col.leads.replaceChildren();
  const doc = docLayer();
  const dy = s.scrollTop - sr.top, dx = s.scrollLeft - sr.left, Y = y => Math.round(y + dy), X = x => Math.round(x + dx);
  const left = X(box.left);
  if (doc.style.left !== left + 'px') doc.style.left = left + 'px';
  // Zoomed-in pages wider than their area stay hidden beside the column, as before: the cover is in the cards'
  // layer now, under the cards (a cover outside the scroller would hide them).
  col.cover.hidden = true;
  if (!col.docCover) { col.docCover = document.createElement('div'); col.docCover.className = 'mr-doc-cover'; col.docCover.setAttribute('aria-hidden', 'true') }
  if (col.docCover.parentElement !== doc) doc.prepend(col.docCover);
  col.docCover.hidden = !col.edgeOver;
  if (col.edgeOver) Object.assign(col.docCover.style, { left: X(sr.left + area) - left + 'px', width: Math.max(0, s.clientWidth - area) + 'px', height: s.scrollHeight + 'px' });
  // The leader lines, in the scroller's coordinates (the layer is at `left`), over the cover.
  if (col.docLeads.style.left !== -left + 'px') col.docLeads.style.left = -left + 'px';
  const pageTop = n => { const p = state.pages[n - 1]; return p ? p.pg.getBoundingClientRect() : null };
  const items = [], keep = new Set();
  const take = (id, parent = doc) => {
    let el = col.els.get(id);
    if (!el) { el = document.createElement('div'); col.els.set(id, el) }
    if (el.parentElement !== parent) parent.appendChild(el);
    el.hidden = false; el.classList.remove('is-row');
    keep.add(id);
    return el;
  };
  const first = pageTop(1), docTop = first ? Y(first.top) : 0;
  // Chat: open, its own panel (fixed); folded, at the document's top.
  if (col.open === 'whole') { const el = take('whole', col.el); drawWhole(el); el.style.top = '0px' }
  else if (chat.turns.length || chat.live) { const el = take('whole'); drawWhole(el); items.push({ el, ey: docTop, top: docTop, order: -2 }) }
  // Each unit's marks (Anders's mockup, 19 Oct 2026, night): in the column and scrolling with the page, never pinned.
  // The start mark's rule level with the top of the unit's heading on the page ("Starting", Primer, Catch me up),
  // Before you start and the catch-up opening under it; the end mark's level with the top of its last line ("End of",
  // Recap, Quiz me, Note), their cards under it. A short tick runs out to the page; a mark pushed down by the one
  // before it keeps its tick at the heading, slanting to the mark (as a card's leader line). Units near the reader's
  // place are drawn (their pages are), and the unit of an open unit card.
  const units = primerHasText() ? markUnits() : [];
  // The whole book's Before you start, at the very top of the first page (an EPUB of the reader's own): its own mark.
  const bookUnit = primer.book && primerHasText() && placePage() <= Math.max(3, primer.units?.[0]?.start || 1) ? primer.book : null;
  if (bookUnit) units.unshift(bookUnit);
  const seenMarks = new Set();
  if (!units.some(u => primer.open && primer.unit?.key === u.key)) { if (!primer.open) { primer.el?.remove(); primer.el = null } }
  for (const u of units) {
    const at = unitPlaceNow(u); if (!at) continue;
    const p = state.pages[at.head.page - 1], pr = p?.pg.getBoundingClientRect();
    if (pr) {
      const ey = Y(pr.top + at.head.y * pr.height), el = unitMark(u, 'start', doc); seenMarks.add(el);
      items.push({ el, ey, top: ey, order: -1, rule: true, mark: 'start', unit: u.key, x0: X(Math.min(pageEdge(p), sr.left + area)) + C.dot });
      if (primer.open && primer.unit?.key === u.key) {
        const pe = primerEl(); pe.classList.remove('is-floating');
        if (pe.parentElement !== doc) { pe.removeAttribute('style'); doc.appendChild(pe) }
        drawPrimer(pe);
        items.push({ el: pe, ey, top: ey, order: -0.9 });
      }
      const cu = u.key === BOOK_UNIT ? null : unitCard(u, 'catchup');
      if (cu) { const ce = take(cu.id); drawCard(ce, cu, col.open === cu.id); ce.classList.add('is-unit'); items.push({ el: ce, ey, top: ey, order: -0.8 }) }
    }
    const q = state.pages[at.end.page - 1], qr = u.key === BOOK_UNIT ? null : q?.pg.getBoundingClientRect();
    if (qr) {
      const ey = Y(qr.top + at.end.y * qr.height), el = unitMark(u, 'end', doc); seenMarks.add(el);
      // Before the next unit's start mark when they meet.
      items.push({ el, ey, top: ey, order: -1.6, rule: true, mark: 'end', unit: u.key, x0: X(Math.min(pageEdge(q), sr.left + area)) + C.dot });
      const notes = viewCards().filter(c => c.unitNote && (c.page === u.to || c.unit === u.key));
      [...['recap', 'quiz'].map(k => unitCard(u, k)), ...notes].filter(Boolean).forEach((c, k) => { const ce = take(c.id); drawCard(ce, c, col.open === c.id); ce.classList.add('is-unit'); items.push({ el: ce, ey, top: ey, order: -1.59 + k * 0.001, endOf: u.key }) });
    }
  }
  for (const [k, el] of col.pills) if (!seenMarks.has(el)) { el.remove(); col.pills.delete(k) }
  if (primer.open && !units.some(u => u.key === primer.unit?.key)) { primer.el?.remove(); primer.el = null }
  // The cards, each at its passage's line.
  for (const card of viewCards()) {
    if (card.data?.unit || card.unitNote || keep.has(card.id)) continue;
    const f = TinctMargin.firstRect(card), p = state.pages[f[0] - 1]; if (!p) continue;
    const b = p.pg.getBoundingClientRect();
    const h = (card.kind === 'figure' ? Math.min(f[4], 22 / b.height) : f[4]) * b.height;
    const el = take(card.id); drawCard(el, card, col.open === card.id);
    const lab = el.querySelector('.mr-card__label');
    const mid = lab ? Math.round(lab.offsetTop + lab.offsetHeight / 2) : 12;
    // The passage's line; a figure's card starts level with the figure's top (less 4px), its line at its label.
    const ey = card.kind === 'figure' ? Y(b.top + f[2] * b.height) - 4 + mid : Y(b.top + f[2] * b.height + h / 2);
    items.push({ el, ey, top: ey - mid, mid, card, x0: X(Math.min(pageEdge(p), sr.left + area)) + C.dot, order: 1 });
  }
  // "Deleted · Undo" keeps the deleted card's place for a few seconds.
  if (undo.el && undo.rect && !undo.el.classList.contains('is-float')) {
    const b = pageTop(undo.rect[0]);
    if (b) { if (undo.el.parentElement !== doc) doc.appendChild(undo.el); undo.el.hidden = false; const ey = Y(b.top + undo.rect[2] * b.height); items.push({ el: undo.el, ey, top: ey - Math.round(undo.el.offsetHeight / 2), order: 1 }) }
  }
  for (const [id, el] of col.els) if (!keep.has(id)) { el.remove(); col.els.delete(id) }
  // Pushed down in page order, never over the card before.
  items.sort((a, b) => a.ey - b.ey || a.order - b.order);
  let floor = 0;
  const lines = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    let want = Math.round(it.top);
    // A unit's end meeting the next unit's start (Anders, 19 Oct 2026, night: the start rule sits exactly above the
    // heading): the end mark, with its cards, moves up so it ends clear of the start rule, its tick slanting from the
    // last line; only with no room above does the start mark go down instead.
    if (it.mark === 'end') {
      let j = i + 1, h = it.el.offsetHeight;
      while (j < items.length && items[j].endOf === it.unit) { h += C.cardGap + items[j].el.offsetHeight; j++ }
      const next = items[j], at = next && next.mark === 'start' ? Math.round(next.top) : null;
      if (at != null && Math.max(want, floor) + h + C.cardGap > at && at - C.cardGap - h >= floor) {
        want = at - C.cardGap - h;
        // Its cards follow it directly.
        for (let k = i + 1; k < j; k++) items[k].top = 0;
      }
    }
    const top = Math.max(want, floor);
    if (it.el.style.top !== top + 'px') it.el.style.top = top + 'px';
    floor = top + it.el.offsetHeight + C.cardGap;
    // A unit mark's rule: a tick from the page to the column, level with the heading (or the last line); moved, slanting to the mark.
    if (it.rule) { lines.push(`<path class="is-rule" d="${Math.abs(top - it.ey) <= 1 ? `M${it.x0} ${it.ey} H${left}` : `M${it.x0} ${it.ey} H${it.x0 + 12} L${left - 12} ${top} H${left}`}"/>`); continue }
    // A note with no passage (a margin note, a unit's note) has no line to a passage.
    if (!it.card || it.card.free) continue;
    const cy = top + it.mid, x0 = it.x0, x1 = left - 6, folded = it.card.id === col.open ? '' : ' class="is-folded"';
    // Straight across when the card is level with its passage; pushed down, across, a short slant, then across.
    const d = Math.abs(cy - it.ey) <= 1 ? `M${x0} ${it.ey} H${x1}` : `M${x0} ${it.ey} H${x0 + 12} L${x1 - 12} ${cy} H${x1}`;
    lines.push(`<circle${folded} cx="${x0}" cy="${it.ey}" r="${C.r}"/><path${folded} d="${d}"/>`);
  }
  const html = lines.join('');
  if (col.docLines !== html) { col.docLines = html; col.docLeads.innerHTML = html }
  // A unit's card just opened (its pill, or the primer's quiz row): brought into view on the page.
  if (col.reveal) {
    const el = col.els.get(col.reveal); col.reveal = null;
    if (el) { const r = el.getBoundingClientRect(), hdr = $('hdr').getBoundingClientRect().bottom; if (r.top < Math.max(sr.top, hdr) || r.top > sr.bottom - 80) s.scrollBy({ top: r.top - (Math.max(sr.top, hdr) + 40) }) }
  }
  // A follow-up just sent: the page stays where the reader is (Anders, 20 Oct 2026: "the reading place must never
  // move"); the card grows below its field, in place, and the reader scrolls to it when they wish (holdPlace).
  const held = col.open && holds.get(col.open);
  if (held?.place && col.els.get(col.open)?.querySelector(`[data-turn="${held.turn}"]`)) held.place = false;
}
/**
 * The open card's passage, marked on the page as the reader chooses in the Aa panel ("Passage mark", per device;
 * Anders, 19 Oct 2026): Underline (default), a 1.5px line in the accent just under each line's own baseline (0.12 of
 * its size), never into the next line; Highlight, a soft tint of each line's band (lineBand); or Off. A figure's open
 * card rings its figure instead.
 */
const passageMark = () => (['underline', 'tint', 'off'].includes(prefs.passageMark) ? prefs.passageMark : 'underline');
function underline(v) {
  const mark = passageMark();
  document.querySelectorAll('.mr-ul-layer').forEach(l => { if (!v || l.dataset.id !== v.card.id || l.dataset.mark !== mark + (state.pages[Number(l.dataset.n) - 1]?.layer ? ':t' : '')) { l.replaceChildren(); delete l.dataset.id } });
  if (!v || v.card.free || (mark === 'off' && v.card.kind !== 'figure')) return;
  for (const a of TinctMargin.anchorOfCard(v.card)) {
    const p = state.pages[a.n - 1]; if (!p) continue;
    const layer = layerOf(p, 'mr-ul-layer'); layer.classList.add('mr');
    if (layer.dataset.id === v.card.id) continue;
    layer.dataset.id = v.card.id; layer.dataset.n = String(a.n); layer.dataset.mark = mark + (p.layer ? ':t' : '');
    const px = 1 / Math.max(1, p.pg.getBoundingClientRect().height);
    for (const r of v.card.rects.filter(r => r[0] === a.n)) {
      const i = document.createElement('i');
      if (v.card.kind === 'figure') { i.className = 'is-box'; Object.assign(i.style, { left: r[1] * 100 + '%', top: r[2] * 100 + '%', width: r[3] * 100 + '%', height: r[4] * 100 + '%' }); layer.appendChild(i); continue }
      const band = lineBand(p, r.slice(1));
      if (mark === 'tint') {
        i.className = 'is-tint';
        const [, y, , h] = band ? [0, band.top, 0, band.bottom - band.top] : r.slice(1);
        Object.assign(i.style, { left: r[1] * 100 + '%', top: y * 100 + '%', width: r[3] * 100 + '%', height: h * 100 + '%' });
      } else {
        // Just under the baseline; without the page's text drawn, just inside the box's foot (its descenders' room).
        let top = band ? band.base + band.size * 0.12 : r[2] + r[4] * 0.86;
        if (band?.next) top = Math.min(top, band.next.b - band.next.s * 0.74 - 2.5 * px);
        Object.assign(i.style, { left: r[1] * 100 + '%', top: top * 100 + '%', width: r[3] * 100 + '%' });
      }
      layer.appendChild(i);
    }
  }
}

/* -- Opening and folding: one card open at a time -- */
function openCard(id, { focus = false } = {}) {
  const mode = marginMode();
  // One open at a time: a card opening folds the primer back to its trigger.
  if (id && primer.open) { primer.open = false; primer.token++; primer.el?.remove(); primer.el = null }
  if (col.open && col.open !== id) { commitNoteEdit(); dropEmptyFigure(col.open); holds.delete(col.open); dropDraft(col.open) }
  col.open = id || null;
  if (id === 'whole') col.whole.page = state.pages.length ? placePage() : null;
  if (mode === 'phone') { if (id) openSheet2(id); else closeSheet2() }
  if (mode === 'marks' && !id) closeFloat();
  // Opening a card never moves the page (Anders, 20 Oct 2026: Quiz me jumped to the start of its passage, and a click on a
  // card scrolled to its anchor): the card opens where it is and takes the focus. A jump the reader asks for (the
  // Notebook's entry, a citation, Related's places) scrolls on its own before it opens the card.
  // A unit's card on the wide column sits at its unit's start or end: brought into view once laid out.
  if (id && mode === 'column' && (cardById(id)?.data?.unit || col.draft?.id === id && col.draft.unitNote)) col.reveal = id;
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
  watchKeyboard(); fitKeyboard();
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
  const nf0 = el.querySelector('.mr-note-edit'), noteText = nf0?.value, noteFocus = nf0 && document.activeElement === nf0;
  el.dataset.sig = sig;
  const before = card.kind === 'quiz' ? el.offsetHeight : 0, keptTop = bodyTop(el);
  if (noteFocus) noteCommitting = true;
  try {
    el.innerHTML = TinctMargin.html.sheetHtml(cardHtmlSafe(card, true));
    const nf = el.querySelector('.mr-note-edit');
    if (nf) { if (noteText != null) nf.value = noteText; fitNote(nf); if (noteFocus) nf.focus({ preventScroll: true }) }
  } finally { if (noteFocus) noteCommitting = false }
  if (card.kind === 'quiz') holdQuizHeight(el, before);
  describeCard(el, card, true);
  keepThread(el, card.id, keptTop);
  if (closeFocused) el.querySelector('.mr-card__close')?.focus({ preventScroll: true });
  const live = col.live.get(card.id);
  if (liveWaiting(live, card) || col.pending.has(card.id)) (el.querySelector('.mr-wait') || el.querySelector('.mr-card__body'))?.append(waitDots());
  const f = el.querySelector('.mr-follow__input');
  if (f && draft) { f.value = draft; f.classList.add('has-text'); fitFollow(f) }
  restoreDraft(f, card.id);
  if (f && focused) f.focus({ preventScroll: true });
  if (dictation.target) dictation.paint();
  // The card grew (its answer arrived): the passage moves up to stay just above it.
  const h = el.offsetHeight;
  if (h !== Number(el.dataset.h || 0)) { el.dataset.h = h; requestAnimationFrame(passageAboveSheet) }
}
function closeSheet2() {
  if (!col.sheet) return;
  // A note being written is kept first (a removed field sends no focusout); an Ask not sent, or an empty note, goes.
  commitNoteEdit();
  if (!col.sheet) return;
  const id = col.sheet.dataset.id;
  dropPhoneDraft(id);
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
  // A drag in a body that scrolls is the body's (as the browser's pan always made it), never the card's.
  el.addEventListener('pointerdown', e => { if (e.target.closest('textarea, a, .mr-card__body button, .mr-follow') || ownScroll(e.target, el.parentElement)) return; y0 = e.clientY; full = el.classList.contains('is-full') });
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
  // The margin preview is a full-screen frame: the keyboard shows in the top window's visual viewport, not the frame's.
  const w = keyboardWindow(), vv = w.visualViewport, el = col.sheet; if (!el) return;
  const kb = vv ? Math.max(0, Math.round(w.innerHeight - vv.height - vv.offsetTop)) : 0;
  el.style.setProperty('--mr-kb', kb + 'px'); el.classList.toggle('is-kb', kb > 0);
  el.style.maxHeight = kb > 0 ? Math.max(160, Math.round(vv.height + vv.offsetTop - $('hdr').getBoundingClientRect().bottom - 72)) + 'px' : '';
}
function keyboardWindow() { try { const w = previewWindow(); return w.visualViewport ? w : window } catch { return window } }
const kbWatched = new WeakSet();
function watchKeyboard() {
  const vv = keyboardWindow().visualViewport; if (!vv || kbWatched.has(vv)) return;
  kbWatched.add(vv);
  const on = () => { if (!col.sheet) return; fitKeyboard(); requestAnimationFrame(passageAboveSheet) };
  vv.addEventListener('resize', on); vv.addEventListener('scroll', on);
}
watchKeyboard();

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
/* A question's attached pictures in a thread (the Chat card, the chat panel): at most 120px tall, each opening large. */
const chatImgs = imgs => `<span class="tc-imgs">${imgs.filter(Boolean).map(u => `<button type="button" class="tc-img" data-chatimg="${esc(u)}" aria-label="Show the attached image larger"><img src="${esc(u)}" alt="Attached image"></button>`).join('')}</span>`;
/* -- The whole-PDF thread, in its card or the phone's card -- */
function wholeTurns() {
  const turns = chat.turns.map(t => ({ role: t.role, text: t.role === 'user' ? (t.display || t.content) : String(t.content || '').replace(/\n\n\*(Claude can’t|That image)[^*]*\*/g, ''), at: t.at, place: placeOf(t), quote: t.role === 'user' ? t.passage : undefined, extra: t.role === 'user' && t.imgs?.length ? chatImgs(t.imgs) : undefined, note: t.failed ? `No answer — ${t.failed}` : undefined }));
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
  const sig = JSON.stringify([open, sheet, body.length, body.slice(-200), tray.length, !!chat.live, !!chat.live?.paused, col.whole.status || '']);
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
    if (chat.live && (!chat.live.text || chat.live.paused)) b.append(waitDots());
    // A question just sent is held near the top while its answer grows below (holdThread); otherwise the thread
    // opens at its end, and while an answer arrives it stays where the reader put it.
    const hold = chat.anchor != null ? { turn: chat.anchor, place: chat.placeAnchor } : null;
    if (holdThread(b, hold, kept ? kept.top : null, !!chat.live)) chat.placeAnchor = hold.place;
    else b.scrollTop = !kept || kept.end ? b.scrollHeight : kept.top;
  }
  el.querySelectorAll('[data-rm]').forEach(x => x.onclick = () => { chat.attach.splice(Number(x.dataset.rm), 1); marginLayout() });
  const f = el.querySelector('.mr-follow__input');
  if (f && draft) { f.value = draft; f.classList.add('has-text'); fitFollow(f) }
  if (f && focused) f.focus({ preventScroll: true });
  if (dictation.target) dictation.paint();
}
function trayChips() { return chat.attach.map((a, i) => `<span class="byob-chip">${a.thumb ? `<img src="${a.thumb}" alt="">` : '<i>Snip</i>'}<span class="byob-chip-label">${a.snip ? `${KIND[a.kind] || 'Snip'} · p. ${a.page}` : 'Image'}</span><button type="button" aria-label="Remove image" data-rm="${i}">×</button></span>`).join('') }
/** Chat about the whole file (the t menu's Chat, or the slash key): its card opens; a question goes to today's ask. */
function openWhole(opts = {}) {
  loadTurns();
  // Opened: no question is held (the thread opens at its end); a question asked now is held (ask).
  if (col.open !== 'whole') { chat.anchor = null; chat.placeAnchor = false; chat.pinTop = null }
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
    // A unit's pill (the wide column): its own card.
    const pill = e.target.closest('.mr-pill');
    if (pill) { pillAction(pill.dataset.pill, pill.closest('.mr-unit')?.dataset.unit); return }
    // A figure card's small picture (narrow windows, the phone): the figure large.
    const ci = e.target.closest('[data-chatimg]');
    if (ci) { openChatImage(ci.dataset.chatimg); return }
    const fv = e.target.closest('[data-figview]');
    if (fv) { const card = cardById(fv.closest('[data-id]')?.dataset.id || col.open); if (card) openFigureView(card); return }
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
    // A click on the follow-up field's box (round its words) puts the caret in it.
    if (!b && e.target.closest('.mr-follow__box') && !e.target.closest('textarea')) { e.target.closest('.mr-follow__box').querySelector('.mr-follow__input')?.focus({ preventScroll: true }); return }
    if (!b) { if (card?.classList.contains('is-folded')) openCard(card.dataset.id); return }
    const c = b.dataset.c;
    if (c === 'stack') return openCard(b.dataset.first || null);
    // From the keyboard (no pointer: detail 0) the focus follows: into the opened card, back to the folded one.
    const keyed = e.detail === 0, refocus = sel => requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector(sel)?.focus({ preventScroll: true })));
    if (c === 'open') { openCard(id); if (keyed) refocus(`.mr-card.is-open[data-id="${CSS.escape(id)}"] .mr-card__close`); return }
    if (c === 'close') { if (host === col.sheet) closeSheet2(); else { openCard(null); if (keyed && id) refocus(`.mr-col .mr-card[data-id="${CSS.escape(id)}"] .mr-card__label`) } return }
    if (c === 'grab') { col.sheet?.classList.toggle('is-full'); return }
    if (c === 'mic') { const cid = b.closest('[data-id]')?.dataset.id; if (cid && b.closest('.mr-follow')?.querySelector('.mr-follow__input')) dictation.toggle({ card: cid }); return }
    if (c === 'send') { const f = b.closest('.mr-follow')?.querySelector('.mr-follow__input'); if (f) sendFollow(f); return }
    if (c === 'copy') return copyCard(id);
    if (c === 'note-ask') return noteAsk(id);
    if (c === 'delete') return deleteCard(id);
    if (c === 'show' || c === 'next' || c === 'again') return quizStep(id, c);
  });
  host.addEventListener('input', e => { if (e.target.matches('.mr-follow__input')) { e.target.classList.toggle('has-text', !!e.target.value); fitFollow(e.target) } if (e.target.matches('.mr-note-edit')) fitNote(e.target) });
  // A margin note is kept when its field lets go (an empty one goes); Escape lets go and folds it.
  host.addEventListener('focusout', e => { if (e.target.matches?.('.mr-note-edit') && !e.relatedTarget?.closest?.('[data-c="note-ask"]')) commitNoteEdit(e.target) });
  host.addEventListener('keydown', e => { if (e.target.matches?.('.mr-note-edit') && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); e.target.blur(); openCard(null) } });
  host.addEventListener('keydown', e => {
    if (!e.target.matches('.mr-follow__input')) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); e.target.blur(); openCard(null); return }
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    e.preventDefault();
    sendFollow(e.target);
  });
}
/** Send what the follow-up field holds (Enter, or its send button), then empty it. */
/*
 * The reading place never moves for a card (Anders, 20 Oct 2026: Enter on an Ask card's follow-up took the reader to the
 * start of the chapter). From a sent question or answer (a follow-up, Ask from the bar, a quiz answer, a note's Ask)
 * until the reader moves the page themselves, the pages' scroll is held where the reader left it: any other change
 * (a card drawn again, a reflow, a focus) is put back at once. The reader's own wheel, touch, keys, a press on the
 * pages or a jump they ask for (a citation, the contents) lets go. A card's answer grows in the column in place.
 */
const placeLock = { top: null, until: 0 };
function holdPlace(ms = 30000) {
  const s = $('scroll'); if (!s || !hasBook() || isPhone()) return;
  placeLock.top = s.scrollTop; placeLock.until = Date.now() + ms;
}
function releasePlace() { placeLock.top = null; placeLock.until = 0 }
const placeHeld = () => placeLock.top != null && Date.now() < placeLock.until;
$('scroll').addEventListener('scroll', () => {
  if (!placeHeld()) { placeLock.top = null; return }
  const s = $('scroll');
  if (Math.abs(s.scrollTop - placeLock.top) > 1) s.scrollTop = placeLock.top;
}, { passive: true });
for (const type of ['wheel', 'touchstart']) addEventListener(type, releasePlace, { capture: true, passive: true });
addEventListener('keydown', e => { if (!e.target?.closest?.('input, textarea, select, [contenteditable="true"]')) releasePlace() }, true);
// A press on the pages, the scrollbar or anything outside the card being answered (a citation, the contents, the top bar).
addEventListener('pointerdown', e => { if (!e.target?.closest?.('.mr-card.is-open .mr-follow, .mr-bar')) releasePlace() }, true);
function sendFollow(f) {
  const text = f.value.trim(); if (!text) return;
  holdPlace();
  const id = f.closest('[data-id]')?.dataset.id;
  f.value = ''; f.classList.remove('has-text'); fitFollow(f); dictation.stop();
  followUp(id, text);
}
/** The field grows with its words (to three lines); its send button is enabled once there is text (19 Oct 2026). */
function fitFollow(t) {
  t.style.height = '18px'; t.style.height = Math.min(t.scrollHeight, 54) + 'px';
  const send = t.closest('.mr-follow')?.querySelector('.mr-follow__send');
  if (send) send.disabled = !t.value.trim();
}
function followUp(id, text) {
  if (id === 'whole') { openWhole({ quiet: true }); ask(text); return }
  // The phone's Ask (phoneAsk): its first question makes it a kept card, answered in its place.
  if (col.draft?.id === id && col.draft.asking) {
    const now = Date.now(), { draft: _d, asking: _a, ...rest } = col.draft;
    const card = { ...rest, turns: [{ role: 'user', content: text, at: now }], at: now, u: now };
    col.draft = null; col.view = null;
    store.set('cards:' + state.key, [...keptCards(), card]); cardsSync.changed();
    openCard(card.id); runCard(card.id);
    return;
  }
  const card = cardById(id); if (!card) return;
  if (card.kind === 'quiz') return quizCheck(card, text);
  if (card.kind === 'note' || id.startsWith('n-')) {
    // A follow-up on a note asks about its passage: an Ask card for it.
    const v = viewCards().find(c => c.id === id); if (!v) return;
    const ask_ = TinctMargin.newCard({ kind: 'ask', page: v.page, anchor: TinctMargin.anchorOfCard(v), text: v.text, turns: [{ role: 'user', content: text, at: Date.now() }] });
    saveCard(ask_); openCard(ask_.id); runCard(ask_.id, text); return;
  }
  card.turns = [...(card.turns || []), { role: 'user', content: text, at: Date.now() }];
  holds.set(card.id, { turn: card.turns.length - 1, place: true });
  saveCard(card); runCard(card.id, text);
}
async function copyCard(id) {
  const card = id === 'whole' ? null : viewCards().find(c => c.id === id);
  const plain = t => String(t || '').replace(/\n{3,}/g, '\n\n').trim();
  let text = '';
  if (!card) text = plain([...chat.turns].reverse().find(t => t.role === 'assistant')?.content);
  else if (card.kind === 'note') text = plain(card.note);
  else if (card.kind === 'define') text = (card.data?.senses || []).map((s, i) => `${i + 1}. ${s.text}`).join('\n') || plain(card.data?.line);
  // Fact-check copies what its card shows: the verdict first, no opening or labels (19 Oct 2026).
  else text = (card.turns || []).filter(t => t.role === 'assistant').map((t, k) => plain(card.kind === 'factcheck' && k === 0 && MP.P?.cleanFactcheck ? MP.P.cleanFactcheck(t.content) : t.content)).join('\n\n');
  try { await navigator.clipboard.writeText(text); toast('Copied.') } catch { toast('Copy did not work here. Use your device’s copy instead.') }
}

/* -- Margin notes (Anders, 19 Oct 2026, evening; the wide column only) --
   A click on the empty margin column writes a note at that height: a card opens there with its field ready. A note is a
   highlight record with no passage (TinctMargin.noteBox: one box of no size at its height), so it is kept and synced
   as every note is; it is kept when its field lets go, and an empty one is let go. Its Ask turns it into a chat (an Ask
   card in its place, the note its first message). If anything was open, the first click only folds it. */
function newMarginNote(y, { unit = null } = {}) {
  const at = unit ? { n: unit.to, frac: 1 } : pagePoint(y); if (!at) return;
  dropDraft(col.draft?.id);
  const id = 'n-new' + Date.now().toString(36);
  const box = TinctMargin.noteBox(at.frac, { unit: !!unit });
  col.draft = { id, kind: 'note', free: true, draft: true, ...(unit ? { unitNote: true, unit: unit.key } : {}), page: at.n, rects: [[at.n, ...box]], text: '', note: '', color: TinctMargin.defaultColor(prefs, HL_COLORS), at: Date.now(), u: Date.now() };
  col.view = null;
  openCard(id);
  const focus = () => openCardEl()?.querySelector('.mr-note-edit')?.focus({ preventScroll: true });
  if (marginMode() === 'phone') focus();
  requestAnimationFrame(() => requestAnimationFrame(focus));
  return id;
}
/** The note field drawn again keeps its words, its caret and its focus. */
function fitNote(t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 320) + 'px' }
let noteCommitting = false;
/** Keep (or let go) the open margin note's words: a new one becomes a note; an emptied one goes. */
function commitNoteEdit(field = null) {
  if (noteCommitting) return;
  const t = field || document.querySelector('.mr-card.is-open .mr-note-edit, .mr-sheet .mr-note-edit');
  const host = t?.closest('[data-id]'); if (!t || !host) return;
  noteCommitting = true;
  try {
    const id = host.dataset.id, v = t.value.trim().slice(0, 4000);
    if (col.draft?.id === id && col.draft.phoneNote) {
      // The phone's note on a highlight (phoneNote): written, it is that highlight's note; empty, the draft waits.
      const d = col.draft; if (!v) return;
      const list = highlights(), h = list.find(x => x.id === d.mark); if (!h) return;
      h.note = v; if (d.noteMade) h.withNote = true; h.u = Date.now();
      col.draft = null; col.defs.delete(id); col.view = null;
      putHighlights(list); strip?.marksChanged();
      return;
    }
    if (col.draft?.id === id) {
      const d = col.draft;
      if (!v) { dropDraft(id); if (col.open === id) col.open = null; marginLayout({ fresh: true }); return }
      const mid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6), now = Date.now();
      const list = highlights(); list.push({ id: mid, page: d.page, rects: [d.rects[0].slice(1)], text: '', color: d.color, at: now, u: now, note: v, withNote: true });
      col.draft = null; col.defs.delete(id);
      if (col.open === id) col.open = 'n-' + mid;
      putHighlights(list); strip?.marksChanged();
      return;
    }
    const mark = highlights().find(h => 'n-' + h.id === id); if (!mark) return;
    if (v === (mark.note || '')) return;
    // Emptied: a margin note goes; a passage's note (the phone's card) goes, and its highlight only when the note made it.
    if (!v && !TinctMargin.noteSpot(mark) && !mark.withNote) { const list = highlights(), h = list.find(x => x.id === mark.id); delete h.note; h.u = Date.now(); if (col.open === id) col.open = null; col.view = null; putHighlights(list); strip?.marksChanged(); return }
    if (!v) { if (col.open === id) col.open = null; removeHighlight(mark.id); col.view = null; strip?.marksChanged(); marginLayout({ fresh: true }); return }
    const list = highlights(), h = list.find(x => x.id === mark.id); h.note = v; h.u = Date.now(); putHighlights(list);
  } finally { noteCommitting = false }
}
/** A margin note's Ask: the note becomes the first message of a chat in its place (an Ask card); the note goes. */
function noteAsk(id) {
  holdPlace();
  const view = viewCards().find(c => c.id === id) || (col.draft?.id === id ? col.draft : null); if (!view) return;
  const t = document.querySelector(`[data-id="${CSS.escape(id)}"] .mr-note-edit`), v = (t ? t.value : view.note || '').trim();
  if (!v) { t?.focus({ preventScroll: true }); return }
  const [n, x, y] = view.rects[0];
  const card = TinctMargin.newCard({ kind: 'ask', page: n, anchor: [{ n, x, y, w: 0, h: 0 }], text: '', turns: [{ role: 'user', content: v, at: Date.now() }], data: { fromNote: true } });
  noteCommitting = true;
  try {
    if (col.draft?.id === id) dropDraft(id);
    else { const mark = highlights().find(h => 'n-' + h.id === id); if (mark) removeHighlight(mark.id) }
  } finally { noteCommitting = false }
  store.set('cards:' + state.key, [...keptCards(), card]); cardsSync.changed(); col.view = null;
  col.open = null; openCard(card.id); runCard(card.id);
}
// A click on the empty margin column (the wide desktop): a new note there, unless something was open (then it only folded).
document.addEventListener('click', e => {
  if (marginMode() !== 'column' || e.button > 0 || marginPress.busy || !getSelection().isCollapsed || !col.doc?.isConnected) return;
  if (e.target.closest?.('.mr-card, .mr-trigger, .mr-primer, .mr-undo, .mr-unit, .mr-float, .pdf-sheet, .lab-header, .pdf-strip, button, a, input, textarea, select, [role="dialog"]')) return;
  const left = col.doc.getBoundingClientRect().left, sr = $('scroll').getBoundingClientRect(), top = Math.max(sr.top, $('hdr').getBoundingClientRect().bottom);
  if (e.clientX < left - 8 || e.clientX > left + TinctMargin.COL.width + 8 || e.clientY < top || e.clientY > sr.bottom) return;
  newMarginNote(e.clientY);
});

/* -- Delete (Anders, 15 Oct): every margin item, from the bin beside copy. No confirm: a quiet
   "Deleted · Undo" line stays for a few seconds where the card was (the column), or along the bottom
   (narrow windows, the phone). A card goes as a tombstone through the card sync; a note's card takes its
   note, and its highlight when the note made it (TinctMargin.deletePlan). -- */
/** A duplicate quiz card on the same passage goes without an undo (cardAction keeps one quiz per passage). */
function deleteCardQuiet(id) {
  col.ctl.get(id)?.abort(); col.ctl.delete(id); col.live.delete(id); col.quiz.delete(id); col.pending.delete(id); col.drafts.delete(id);
  if (col.open === id) col.open = null;
  store.set('cards:' + state.key, keptCards().map(c => (c.id === id ? TinctMargin.tombstone(id) : c))); cardsSync.changed(); col.view = null;
}
function deleteCard(id) {
  // The phone's draft (an Ask not sent, a note not written): it goes, with a highlight its note made.
  if (dropPhoneDraft(id, { mark: true })) { if (col.open === id) { col.open = null; col.sheet?.remove(); col.sheet = null } marginLayout({ fresh: true }); return }
  const view = viewCards().find(c => c.id === id) || cardById(id); if (!view) return;
  const kept = view.kind === 'note' ? null : cardById(id);
  const marks = highlights(), plan = TinctMargin.deletePlan(view, marks);
  const touched = new Set([...plan.removeMarks, ...(plan.clearNote ? [plan.clearNote] : [])]);
  const before = { card: kept ? JSON.parse(JSON.stringify(kept)) : null, marks: marks.filter(m => touched.has(m.id)).map(m => JSON.parse(JSON.stringify(m))) };
  col.ctl.get(id)?.abort(); col.ctl.delete(id); col.live.delete(id); col.quiz.delete(id); col.pending.delete(id); col.drafts.delete(id); dropDraft(id);
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
  // A chat that began as a note in the margin has no passage: the note is its first message.
  const about = card.text ? `\n\nThe passage they selected on ${at}:\n${card.text.slice(0, 3000)}` : `\n\nThis conversation began as a note they wrote in the margin beside ${at}; the note is their first message.`;
  const rules = card.kind === 'figure' ? figureRules(card, image, fig.sketch) : `You are Tinct's reading companion. ${bookLine()} They are on ${at} of ${state.pages.length}.\nAnswer conversationally and concisely (usually under 150 words unless asked for more). Ground answers in the text; say when something is not in it. Plain prose only.${imageLine}${about}`;
  const what = card.data?.region === 'formula' ? 'formula' : 'figure';
  const pill = card.data?.pill;
  const lead = pill ? { recap: 'Recap this chapter.', catchup: 'Catch me up.' }[pill] : { explain: 'Explain this passage.', simplify: 'Simplify this passage.', factcheck: 'Fact-check this passage.', related: 'Where else does the text take this up?', counterpoint: 'Give the strongest objection to this passage.', define: 'Define this word.', figure: `Explain this ${what}.` }[card.kind];
  const turns = (card.turns || []).slice(-11).map(t => ({ role: t.role, content: t.content }));
  if (lead && (turns[0]?.role === 'assistant' || ((card.kind === 'figure' || pill) && !turns.length))) turns.unshift({ role: 'user', content: lead });
  return [{ role: 'user', content: pill ? pillRules(card) : rules }, ...turns];
}
/** How a card names the text it is about (the companion's NAME_THE_TEXT_RULE, marginPrompts.ts): never "unit". */
const NAME_THE_TEXT = 'Name the text by what it is ("this chapter", "this essay", "this section", "the paper") or by its title, or start straight with its content; never call it a "unit".';
/** What a unit is, for the companion to name it naturally (never "unit"): the book, the document, a chapter, a section or pages. */
const unitKind = unit => (unit.key === BOOK_UNIT ? 'book' : unit.key === 'all' ? 'document' : unit.pages || unit.band ? 'pages' : isEpub() || unit.chapter || /^chapter\b/i.test(unit.title || '') ? 'chapter' : 'section');
/** Recap and Catch me up (a unit's pills): the companion's instructions for the unit's card. */
function pillRules(card) {
  const unit = primer.units?.find(u => u.key === card.data.unit.key) || { key: card.data.unit.key, from: card.page, start: card.page, to: card.page };
  // An EPUB has no pages: its chapters by their titles (Anders, 20 Oct 2026); a PDF its pages.
  const name = unit.key === 'all' ? 'the whole document' : TinctMargin.unitPhrase(unit);
  const pages = u => (isEpub() ? (u.from === u.to ? chapterPlace(u.from) : `from ${chapterPlace(u.from)} to ${chapterPlace(u.to)}`) : u.from === u.to ? `page ${pageLabel(u.from)}` : `pages ${pageLabel(u.from)}–${pageLabel(u.to)}`);
  const head = `You are Tinct's reading companion. ${bookLine()}`;
  // The reader's words for the text: what it is or its title, never our word "unit" (Anders, 20 Oct 2026).
  const form = `Write two short paragraphs of plain prose, no headings, lists or preamble, at most 160 words in all. ${isEpub() && !isPdfText() ? 'Ground it in the book and cite no pages; say nothing that is not in it.' : 'Ground it in the document and cite its pages as you do elsewhere; say nothing that is not in it.'} ${NAME_THE_TEXT}`;
  if (card.data.pill === 'recap') return `${head} They have just finished ${name} (${pages(unit)}).\nRecap it for them: its main points and how they connect, then what it leaves open or sets up for what follows. ${form}`;
  const before = catchRange(unit);
  // The book reader's Catch me up rules (TinctMargin.catchUpSpan, catchUpParts): only what the reader has read, a
  // paragraph for each part it runs through, the most recent reading in the most detail, and the chat's grounding.
  const parts = TinctMargin.catchUpParts(toc.entries, before, state.pages.length);
  const shape = parts.length > 1
    ? `It runs through ${parts.length} parts: ${parts.map(part => `${part.label} (${pages(part)})`).join('; ')}. Write one short paragraph for each part, in order, opening with the part's name: the earlier parts briefly, the most recent in the most detail. Plain prose, no headings, lists or preamble, at most ${160 + 60 * (parts.length - 1)} words in all.`
    : 'Give the most recent pages the most detail and the earlier ones more briefly. Write two short paragraphs of plain prose, no headings, lists or preamble, at most 160 words in all.';
  const ground = `${TinctMargin.CATCH_UP_GROUNDING} ${isEpub() && !isPdfText() ? 'Cite no pages.' : 'Cite its pages as you do elsewhere.'} ${NAME_THE_TEXT}`;
  const ahead = unit.from > 1 && before.to < unit.from - 1;
  return unit.from > 1
    ? `${head} ${ahead ? `They are on ${pages({ from: before.to + 1, to: before.to + 1 })}, before ${name}.` : `They are about to start ${name}.`}\nCatch them up on what has happened or been argued in the document so far (${pages(before)}): the main thread and where it stands now, so they can go on. Use only that text: nothing after it. ${shape} ${ground}`
    : `${head} They are at the start of the document, on page ${pageLabel(before.to)}.\nCatch them up on what the document has set up so far: its subject and what it has said up to here, so they can go on. ${shape} ${ground}`;
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
/*
 * A card still waiting for more of its answer after words have appeared (Anders, 19 Oct 2026: Fact-check's search and
 * verdict, Counterpoint, follow-ups): once no new words have come for LIVE_PAUSE_MS, the main chat's dots show below
 * the last text, until more text arrives or the request ends (its answer saved, an error, a cancel).
 */
const LIVE_PAUSE_MS = 700;
const livePause = new Map();
/** True while a card's request is on its way and its words are paused (or none show yet): its dots belong below them. */
const liveWaiting = (live, card = null) => !!live && live.text != null && !live.done && (!live.text || live.paused || unshownLive(card, live.text));
/** Words on their way that the card does not show yet: Fact-check's, until its verdict (P.cleanFactcheck drops what comes before it). */
const unshownLive = (card, text) => card?.kind === 'factcheck' && !(card.turns || []).some(t => t.role === 'assistant') && !!MP.P?.cleanFactcheck && !MP.P.parseFactcheck(MP.P.cleanFactcheck(text)).verdict;
function setLive(id, patch) {
  const before = col.live.get(id);
  if (patch && 'text' in patch && patch.text != null && patch.text !== before?.text) patch = { ...patch, paused: false };
  if (patch === null) col.live.delete(id); else col.live.set(id, { ...(before || { text: '', status: '' }), ...patch });
  clearTimeout(livePause.get(id)); livePause.delete(id);
  const now = col.live.get(id);
  if (now && now.text && !now.paused && !now.done) livePause.set(id, setTimeout(() => { livePause.delete(id); const l = col.live.get(id); if (l === now) { col.live.set(id, { ...l, paused: true }); try { marginLayout() } catch {} } }, LIVE_PAUSE_MS));
  // A layout that throws never stops a stream or leaves the card waiting: the state above stands, and the error is reported.
  try { marginLayout() } catch (e) { reportCardError(e, 'layout', cardById(id)?.kind) }
}
/**
 * A card's request that failed outside its own error handling (Anders, 16 Oct: Explain and Ask cards on
 * Constructor Theory kept the wait ring for minutes after the answer had been written): the card always
 * ends in its answer or an error line, never the ring. Nothing happens for a request that was cancelled
 * or replaced by a newer one (`ctl` is no longer the card's).
 */
function cardStopped(id, ctl, e, phase) {
  if (e?.code !== 'cancelled' && !ctl?.signal.aborted) reportCardError(e, phase, cardById(id)?.kind);
  const now = col.ctl.get(id);
  if (ctl && now && now !== ctl) return;
  col.ctl.delete(id); col.quiz.delete(id);
  // Cancelled, or the answer is saved already (only its drawing failed): no error line, no ring.
  if (e?.code === 'cancelled' || ctl?.signal.aborted || phase === 'saved') { col.live.delete(id); try { marginLayout({ fresh: true }) } catch {} return }
  setLive(id, { text: null, status: errorCopy(e) });
  // The column itself cannot be drawn: the ring in this card's box gives way to the error line.
  for (const el of document.querySelectorAll(`[data-id="${CSS.escape(id)}"]`)) {
    const ring = el.querySelector('.tinct-wait'); if (!ring) continue;
    const p = document.createElement('p'); p.className = 'mr-status'; p.setAttribute('role', 'status'); p.textContent = errorCopy(e);
    ring.replaceWith(p); el.removeAttribute('aria-busy');
  }
}
/**
 * What went wrong when a margin card could not finish, for Tinct's own error log (the first-party events,
 * routes/events.ts `margin_card_failed`): the card's kind, the step, the error's type, a code-level message
 * (a TypeError's, never an answer's words: quoted strings are cut) and where in the code it was thrown.
 * Never the passage, the question, the answer or the document. At most once per step and error per visit.
 */
const reportedCardErrors = new Set();
function reportCardError(e, phase, kind) {
  try {
    const name = String(e?.name || (e?.code ? 'code' : 'Error')).replace(/[^A-Za-z_]/g, '').slice(0, 40) || 'Error';
    const code = typeof e?.code === 'string' ? e.code.replace(/[^a-z_]/g, '').slice(0, 30) : '';
    // A request's own outcome (busy, offline, refused…) is shown on the card already and is not a fault.
    if (code && !/^(failed|empty)$/.test(code) && name !== 'TypeError') return;
    const codeLevel = /^(TypeError|ReferenceError|RangeError)$/.test(name);
    const message = codeLevel ? String(e?.message || '').replace(/(["'`“‘])[^"'`”’]{25,}\1/g, '$1…$1').slice(0, 120) : '';
    const where = String(e?.stack || '').split('\n').map(l => {
      const m = /(?:at\s+([\w$.<>]{1,40})\s+\(|^([\w$.<>]{1,40})@)?.*?\/([\w.-]+\.m?js)(?:\?[^:\s]*)?:(\d+):(\d+)/.exec(l.trim());
      return m ? `${m[1] || m[2] || ''}@${m[3]}:${m[4]}:${m[5]}` : '';
    }).filter(Boolean).slice(0, 4).join(' < ').slice(0, 120);
    const key = [phase, name, code, where].join('|');
    if (reportedCardErrors.has(key)) return;
    reportedCardErrors.add(key);
    console.error('[margin] card failed', phase, e);
    const props = { intent: String(kind || '').slice(0, 20), phase: String(phase).slice(0, 20), error: name, ...(code ? { code } : {}), ...(message ? { message } : {}), ...(where ? { where } : {}) };
    const id = (k, fallback) => { try { return (k.getItem(fallback) || '').replace(/-/g, '') } catch { return '' } };
    const random = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, '0')).join('');
    const deviceId = id(localStorage, 'tinct-lab-device-id') || random(), sessionId = id(sessionStorage, 'tinct-funnel-session') || random();
    const token = window.TinctAI?.session?.().token, internal = (() => { try { return localStorage.getItem('tinct:internal') === '1' } catch { return false } })();
    fetch('/api/events', {
      method: 'POST', keepalive: true, credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(internal ? { 'x-tinct-check': '1' } : {}) },
      body: JSON.stringify({ deviceId, sessionId, surface: 'reader', path: location.pathname, events: [{ name: 'margin_card_failed', props }] }),
    }).catch(() => {});
  } catch { /* reporting never fails the reader */ }
}
/** Errors whose words are never kept on a card: a refusal, and a reply cut off by its output bound. */
const WHOLE_OR_NOTHING = new Set(['refused', 'cut_off']);
/** Run a card's request: its action the first time, today's ask for a follow-up (`question`). */
async function runCard(id, question = null) {
  const run = { ctl: null, phase: 'prepare' };
  try { await runCardNow(id, question, run) }
  catch (e) { cardStopped(id, run.ctl, e, run.phase) }
}
async function runCardNow(id, question, run) {
  await mpReady;
  let card = cardById(id);
  if (!card) return;
  col.ctl.get(id)?.abort();
  const ctl = new AbortController(); col.ctl.set(id, ctl); run.ctl = ctl;
  setLive(id, { text: '', status: '' });
  // The margin's parser did not load: said on the card, never a ring that waits for nothing.
  if (!MP.P) throw Object.assign(new Error('margin-parse unavailable'), { code: 'failed' });
  const s = await ai();
  if (!s) { setLive(id, { status: AI_OFF, done: true }); return }
  // Quiz me on a whole unit (from the primer): the unit's pages, no passage and no picture.
  const unit = card.data?.unit ? (unitByKey(card.data.unit.key) || { key: card.data.unit.key, from: card.page, to: card.page }) : null;
  const pdf = unit ? await unitPages(card.data?.pill === 'catchup' ? catchRange(unit) : unit) : await pdfPages(card.page);
  // One picture of the passage, cropped to it (FIXES-2026-10-15 A4); none for a whole unit, or when the page is not drawn.
  // A figure's card sends its figure; a selected caption, or a question naming "Figure N" on the card's page, sends that figure (items 4, 7).
  const figBox = card.kind === 'figure' ? TinctMargin.anchorOfCard(card)[0] : null;
  const asked = question ?? (card.kind === 'ask' ? [...(card.turns || [])].reverse().find(t => t.role === 'user')?.content || '' : '');
  const named = unit || figBox ? null : figureNamed(card.page, card.text, asked) || (asked ? await figureElsewhere(asked, card.page) : null);
  const region = unit || figBox || named || !card.text ? null : passageRegion(card);
  let image = null;
  if (figBox) { image = figBlobs.get(id) || await figureImage(card.page, figBox); figBlobs.delete(id) }
  else if (named) image = await figureImage(named.page, named.f);
  else if (region) image = await pageImage(card.page, region);
  const fig = figBox ? { sketch: state.pages[card.page - 1]?.canvas ? sketchOf(state.pages[card.page - 1], figBox) : '' } : named ? { named } : {};
  // A document-wide action says why it waits (the whole-book read, on a first open); the ring stands for a passage action.
  const wholeDoc = await marginDocumentNow(unit ? unit.from : card.page, question != null ? 'ask' : card.kind, () => { if (!ctl.signal.aborted && !col.live.get(id)?.text) setLive(id, { status: DOC_WAIT_STATUS }) });
  if (col.live.get(id)?.status === DOC_WAIT_STATUS) setLive(id, { status: '' });
  // A question on a long file (an Ask, a follow-up, a figure's thread): what a search of the rest of the book finds for it (searchPassages).
  const found = asked ? await searchPassages(asked, wholeDoc) : null;
  const book = { ...aiBook(), pdf };
  const onText = ({ text }) => { if (!ctl.signal.aborted) setLive(id, { text, status: '' }) };
  const onStatus = status => { if (!ctl.signal.aborted) setLive(id, { status }) };
  // Quiz me streams (FIXES-2026-10-15 A7): each question shows as soon as it is complete; the reader can
  // answer question 1 while 2 and 3 are written. Nothing is saved until the stream ends.
  const quizRun = card.kind === 'quiz' && question == null;
  const live = quizRun ? { ...(card.data?.unit ? { unit: card.data.unit } : {}), ...(card.data?.asked?.length ? { asked: card.data.asked } : {}), ideas: null, questions: [], i: 0, results: [] } : null;
  if (live) col.quiz.set(id, live);
  const onQuizText = ({ text }) => {
    if (ctl.signal.aborted || col.quiz.get(id) !== live) return;
    // The key ideas come first: they set the quiz's length ("1 of 5").
    if (!live.ideas) { const ideas = MP.P.parseQuizIdeas?.(text); if (ideas?.length) { live.ideas = ideas; marginLayout() } }
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
    // Ask may search sources when the model decides it needs to (20 Oct 2026): "Checking sources…" shows meanwhile, as Fact-check's does.
    if (question != null || card.kind === 'ask' || card.kind === 'figure') return TinctAI.ask(cardTurns(card, imgs, fig), { book, images, document: wholeDoc, passages: found, onText, onStatus, signal: ctl.signal });
    // Explain is the Worker's explain intent (FIXES-2026-10-15 A2): its prompt is built there.
    if (card.kind === 'quiz') return TinctAI.companion('quiz', { book, pdf, document: wholeDoc, ...(unit ? {} : { selection: card.text }), ...(live?.asked ? { asked: live.asked } : {}), images, stream: true, onText: onQuizText, signal: ctl.signal });
    return TinctAI.companion(card.kind, { book, pdf, document: wholeDoc, selection: card.text, images, stream: true, onText, onStatus, signal: ctl.signal });
  };
  run.phase = 'request';
  try {
    let res;
    try { res = await call(image) }
    catch (e) { if (!image || (e?.code !== 'images_unavailable' && e?.code !== 'image_rejected')) throw e; if (e.code === 'images_unavailable') sampleImages = false; res = await call(null) }
    run.phase = 'answer';
    card = cardById(id);
    if (ctl.signal.aborted) { if (col.quiz.get(id) === live) col.quiz.delete(id); return }
    // The card went while its answer was on its way (deleted, or another device's set adopted without it): nothing waits on it.
    if (!card) { col.quiz.delete(id); col.live.delete(id); col.ctl.delete(id); marginLayout(); return }
    if (quizRun) {
      // The whole reply is the authority; what streamed stands when it does not parse.
      const whole = MP.P.parseQuiz(res.text), questions = whole?.questions || live.questions;
      if (!questions.length) throw Object.assign(new Error('failed'), { code: 'failed' });
      if (whole?.ideas?.length) live.ideas = whole.ideas;
      if (whole?.thesis) live.thesis = whole.thesis;
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
    run.phase = 'saved';
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
  const ideas = live.ideas?.length ? { ideas: live.ideas } : {}, asked = live.asked?.length ? { asked: live.asked } : {}, thesis = live.thesis ? { thesis: live.thesis } : {};
  return { ...(live.unit ? { unit: live.unit } : {}), ...ideas, ...thesis, ...asked, questions, i: Math.min(i, questions.length - 1), results: live.results.slice(0, questions.length), ...(live.done || i >= questions.length ? { done: true } : {}), ...(stopped && questions.length < quizTotal(live, true) ? { ended: true } : {}) };
}
/** How many questions a quiz has: one per key idea once they are known; while it streams without them, as many as may come. */
const quizTotal = (q, streaming = false) => (q.ideas?.length ? Math.max(q.ideas.length, q.questions?.length || 0) : streaming ? TinctMargin.QUIZ_MAX_QUESTIONS : q.questions?.length || 0);
/** An action from the bar or More on the held passage: a new card, opened, its answer on the way. */
function cardAction(kind, { question = '' } = {}) {
  if (!mr) return;
  const info = mr.info, anchor = mr.anchor;
  marginClose(); getSelection().removeAllRanges();
  // One quiz, one card (Anders, 20 Oct 2026: a stub "Quiz me · 0 of 3" stood above the quiz): Quiz me again on the same
  // passage opens its quiz; a finished one asks for new questions in that card.
  if (kind === 'quiz') {
    const span = withSpan({}, info).span, same = keptCards().filter(c => !c.gone && c.kind === 'quiz' && !c.data?.unit && c.page === info.page && (span && c.span ? c.span[1] === span[1] && c.span[2] === span[2] : c.text === info.text));
    if (same.length) {
      const keep = same.sort((a, b) => (b.u || b.at || 0) - (a.u || a.at || 0))[0];
      for (const c of same) if (c !== keep) deleteCardQuiet(c.id);
      if (keep.data?.done || !keep.data?.questions?.length && !col.quiz.has(keep.id) && !col.ctl.has(keep.id)) quizStep(keep.id, 'again');
      else openCard(keep.id, { focus: 'card' });
      return;
    }
  }
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
    // New questions, never the same ones: the questions asked so far go with the request, the missed ideas first.
    const asked = TinctMargin.quizAsked(q);
    card.data = { ...(q.unit ? { unit: q.unit } : {}), ...(asked.length ? { asked } : {}), questions: [], i: 0, results: [] };
    saveCard(card); openCard(id); runCard(id);
    return;
  }
  if (step === 'show') q.results[i] = { shown: true };
  else if (i + 1 >= (live ? quizTotal(live, true) : q.questions.length)) q.done = true;
  else q.i = i + 1;
  if (live) marginLayout(); else saveCard(card);
  if (step === 'next') openCard(id, { focus: !q.done && !!q.questions[q.i || 0] });
}
async function quizCheck(card, answer) {
  await mpReady;
  const q = col.quiz.get(card.id) || card.data, i = q.i || 0, item = q.questions?.[i]; if (!item) return;
  // A reply under the marking (Anders, 20 Oct 2026): after "Nearly." or "Not quite.", a few rounds on this question, the
  // earlier turns sent with it; "Next question →" stays in view meanwhile.
  const prior = q.results?.[i];
  if (prior && !TinctMargin.quizCanReply(prior)) return;
  answer = String(answer || '').slice(0, prior ? TinctMargin.QUIZ_REPLY_CHARS : TinctMargin.QUIZ_ANSWER_CHARS);
  const turns = prior ? TinctMargin.quizTurns(prior) : null;
  col.pending.set(card.id, answer); col.live.delete(card.id); marginLayout();
  try {
    const pdf = await pdfPages(card.page), wholeDoc = await marginDocumentNow(card.page, 'quiz_check');
    const res = await TinctAI.companion('quiz_check', { book: { ...aiBook(), pdf }, pdf, document: wholeDoc, quiz: { question: item.q, expected: item.answer, why: item.why, answer, ...(turns ? { turns } : {}), ...(q.thesis ? { thesis: q.thesis } : {}), ...(q.ideas?.length ? { ideas: q.ideas } : {}), ...(q.ideas?.[item.idea ?? i] ? { idea: q.ideas[item.idea ?? i] } : {}), ...(!q.unit && card.text ? { passage: card.text } : {}) } });
    const mark = MP.P.parseQuizCheck(res.text);
    if (!mark) throw Object.assign(new Error('failed'), { code: 'failed' });
    const result = { answer, verdict: mark.verdict, feedback: mark.feedback };
    // A reply joins its question's thread; the question's own verdict (its score) stays the first answer's.
    const keep = results => { if (prior) { const r = results[i]; if (r) { r.thread = [...(r.thread || []), { reply: answer, verdict: mark.verdict, feedback: mark.feedback }] } } else results[i] = result };
    // Still streaming: the mark joins the quiz in memory; else the saved card takes it.
    const live = col.quiz.get(card.id);
    if (live) { keep(live.results); col.pending.delete(card.id); marginLayout(); return }
    const c = cardById(card.id); if (!c) return;
    c.data.results = c.data.results || []; keep(c.data.results); quizFit(c.data, i);
    col.pending.delete(card.id); saveCard(c);
  } catch (e) {
    // The error shows in the card, and the reader's answer goes back into its field to send again.
    col.pending.delete(card.id); col.drafts.set(card.id, answer); col.live.set(card.id, { text: null, status: errorCopy(e) }); marginLayout();
  }
}
/** A quiz kept within the account's room for a card's data (16 000 characters): the oldest other questions' replies go first. */
function quizFit(data, keepAt) {
  const results = data.results || [];
  for (let k = 0; k < results.length && JSON.stringify(data).length > 15000; k++) if (k !== keepAt && results[k]?.thread) delete results[k].thread;
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
function keepDefine(def, info, anchor, key = state.key, given = null) {
  if (!key || !def || (!def.senses?.length && !def.line && !def.inText)) return;
  const here = key === state.key && marginOn();
  const cards = here ? keptCards() : store.get('cards:' + key) || [];
  const existing = cards.find(c => c.kind === 'define' && !c.gone && c.page === info.page && c.text === info.text.slice(0, 2000));
  const data = { word: def.word, pos: def.pos || '', senses: (def.senses || []).map(s => ({ text: s.text })), ...(def.line ? { line: def.line } : {}), ...(def.inText ? { inText: def.inText } : {}) };
  // The column's card not yet kept (defineCard) keeps its id: it stays the open card.
  const card = existing || given || (here ? withSpan(TinctMargin.newCard({ kind: 'define', page: info.page, anchor, text: info.text }), info) : TinctMargin.newCard({ kind: 'define', page: info.page, anchor, text: info.text }));
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
/* A click outside an open margin card folds it (Anders, 19 Oct 2026: "when you click outside a margin note (Explain,
   etc.) it should minimize"): on the page's text (a new selection still gets its bar), the empty margin, anywhere
   else. Folded, it is the card's folded form in its place with its leader line (or its mark), one click from open;
   nothing is deleted, and an answer still on its way keeps coming (runCard) and shows when it is opened again. Not
   a click in the card, its follow-up line, the selection's bar or menus, a mark or another card (they open their
   own), the top bar, a toast or a dialog. Chat (the whole file's) keeps its own panel and rules; the phone's bottom
   card closes as above. Escape folds it too (the keys, below). */
document.addEventListener('pointerdown', e => {
  const mode = marginMode();
  if (!col.open || col.open === 'whole' || !mode || mode === 'phone' || e.button > 0) return;
  if (e.target.closest?.('.mr-card, .mr-float, .mr-more, .mr-pmore, .mr-mark, .mr-stack, .mr-trigger, .mr-primer, .mr-undo, .lab-header, .byob-toast, [role="dialog"], .selection-popup')) return;
  openCard(null);
}, true);
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
   folds it back. The primer is made ahead as the PDF opens (signed in, primerPrefetch) or when the reader opens it (chapter action `primer`), kept
   in this browser ('primer:{key}:{unit}') and, signed in with the book in the account, with the
   book (/api/user-books/primers/{bookHex}?unit=…), so reopening never makes it again. Redo makes
   a new one and stores it. "Quiz me on this chapter" is Quiz me on the whole unit, as a quiz card. */
const primer = { units: null, parts: null, places: new Map(), unitsTask: null, open: false, anchor: null, unit: null, data: null, wait: false, status: '', token: 0, away: new Set(), el: null, trig: null, keyed: false, held: false };
const ppReady = import('/lab/margin/primer-parse.js?v=20261015kinds').catch(() => null);
function primerReset() {
  primer.token++;
  Object.assign(primer, { units: null, parts: null, book: null, open: false, unit: null, data: null, wait: false, status: '' });
  primer.away.clear(); primer.places.clear();
  primer.el?.remove(); primer.trig?.remove(); primer.el = null; primer.trig = null;
  for (const el of col.pills.values()) el.remove(); col.pills.clear();
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
  // An entry's page, and its heading's top on that page (an XYZ destination's, in page fractions) where it gives one.
  const resolve = async item => {
    try {
      let dest = item.dest;
      if (typeof dest === 'string') dest = await pdf.getDestination(dest);
      const ref = Array.isArray(dest) ? dest[0] : null;
      const page = ref && typeof ref === 'object' ? await pdf.getPageIndex(ref) + 1 : Number.isInteger(ref) ? ref + 1 : null;
      return { page, top: dest?.[1]?.name === 'XYZ' && Number.isFinite(dest[3]) ? dest[3] : null };
    } catch { return { page: null, top: null } }
  };
  // The outline to three levels: the units are sized from it (TinctMargin.sizeUnits), the document's parts from its top level (primerUnits).
  const walk = async (items, depth) => Promise.all((items || []).slice(0, 60).map(async item => {
    const at = await resolve(item);
    return { title: item.title, page: at.page, top: at.top, items: depth < 2 ? await walk(item.items, depth + 1) : [] };
  }));
  let entries = [], tree = [];
  try { entries = tree = await walk(await pdf.getOutline(), 0) } catch { entries = tree = [] }
  if (token !== state.token) return;
  // A recognised scan has no outline: its chapters (a paper's numbered sections) are its units.
  if (!entries.some(e => Number.isInteger(e.page)) && state.textEdition?.source === 'ocr') entries = tree = state.textEdition.chapters.map(c => ({ title: c.title, page: Array.isArray(c.pages) ? c.pages[0] : null }));
  // Any other PDF without an outline: the chapters the scan found, from its printed contents or its
  // headings (MacKay's 640-page book has no bookmarks, only a printed contents: without this it was
  // one unit, "the whole PDF", and its primer blended the preface with chapters 1 and 2; Anders, 15 Oct).
  const count = state.pages.length || pdf.numPages;
  // The chapters are heard as soon as the scan finds them (contentsSoon), not when it ends: MacKay's trigger
  // took 15 s on its first open (round 1, 15 Oct). A short paper's headings are its units too (sizeUnits).
  if (!entries.some(e => Number.isInteger(e.page))) {
    const soon = await contentsSoon();
    if (token !== state.token) return;
    if (count >= TinctMargin.PRIMER.units) entries = TinctMargin.scanEntries(soon.entries, soon.nav, count);
    tree = soon.nav === 'contents' || soon.nav === 'headings' ? TinctMargin.scanTree(soon.entries) : [];
  }
  // The document's parts (docRange: the cached part of the whole document) stay chapter-sized: the outline's top
  // level, else 40-page blocks.
  let parts = TinctMargin.primerUnits(entries, count);
  if (parts.length === 1 && parts[0].key === 'all' && count >= TinctMargin.PRIMER.units) {
    const read = await readDocument();
    if (token !== state.token) return;
    if (read && !read.pages) parts = TinctMargin.primerBlocks(count);
  }
  // The reading units (Primer, Catch me up, Recap, Quiz me; their marks): about 3–25 pages each (Anders, 19 Oct 2026).
  const units = TinctMargin.sizeUnits(tree, count);
  // Each unit's heading's top as the outline gives it (a fallback for unitPlace).
  const tops = new Map();
  const note = (list, prefix) => (list || []).forEach((e, i) => { if (e.top != null) tops.set('outline-' + prefix + i, e.top); note(e.items, prefix + i + '.') });
  note(tree, '');
  for (const u of units) { const t = tops.get(u.key.split('_')[0]); if (t != null) u.destTop = t }
  // Read side by side, not one after another (80 units took about 2 s in turn).
  const kinds = await Promise.all((units.length > 1 ? units.slice(0, 120) : []).map(async u => {
    if (u.matter || u.pages) return null;
    return TinctMargin.pageMatter((await pageText(u.start)).text) || (u.start < u.to ? TinctMargin.pageMatter((await pageText(u.start + 1)).text) : null);
  }));
  if (token !== state.token) return;
  kinds.forEach((kind, i) => { if (kind) units[i].matter = kind === 'contents' ? 'front' : 'back' });
  primer.parts = parts;
  primer.units = units;
  primer.places.clear();
  marginLayout();
  primerPrefetch();
}
const placePage = () => (state.pages.length ? readingPage() : 1);
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
  if (!unit || !TinctMargin.atUnitStart(unit, placePage()) || (primer.held && marginMode() === 'phone')) return null;
  // An EPUB's chapter is one page (the margin preview's Tinct books): its trigger shows while the chapter's start is
  // near the view's top, as a PDF's shows on its unit's first page, and not all through the chapter (round 3: the
  // phone's bottom card covered the text on opening at a place mid-chapter, and followed the reader down it).
  return !isEpub() || epubNearStart(unit.start) ? unit : null;
}
/** An EPUB chapter's start is near: its top is in view, or less than half a screen above it. */
function epubNearStart(n) {
  const p = state.pages[n - 1], s = $('scroll');
  if (!p) return false;
  const top = p.sheet.getBoundingClientRect().top - s.getBoundingClientRect().top;
  return top >= -s.clientHeight / 2 && top <= s.clientHeight * READING_LINE;
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
  // An EPUB's units (the preview's chapters) go as chapters, as pdfPages sends them.
  return { pages, at: 0, ...(isEpub() ? { kind: 'epub' } : {}) };
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
function makePrimer(unit, { speculative = false } = {}) {
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
          const res = await TinctAI.companion('chapter', { book: { ...aiBook(), chapter: title }, pdf, document: wholeDoc, chapter: { action: { kind: 'primer', unitKey: unit.key, unitTitle: title, unitKind: unitKind(unit) } }, stream: false, signal: ctl.signal, retry: false, speculative });
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
/**
 * Made ahead (Anders, 19 Oct 2026: "we should load the before you read right away … they click it and it's right
 * there"): once the document's text and units are ready, the primer of the unit at the reader's place is made in
 * the background, once per open, signed in only (as the book reader fetches Explain ahead only for a signed-in
 * reader), and never when it is kept here or with the book already: a book's unit is made at most once. It goes as
 * `speculative`, which the Worker never charges to the reader's allowance (metered as Tinct's own cost, as a
 * speculative Explain is); opening it then shows it at once, and opening it while it is still being made waits for
 * that same request (makePrimer), so nothing is made twice.
 */
const PRIMER_PREFETCH_MS = 1200;
// key: the open it ran for; done: it has finished (made, found, or nothing to do).
const primerAhead = { key: null, timer: 0, done: false };
function primerPrefetch() {
  if (state.kind !== 'pdf' || !primer.units || !primerHasText() || !window.TinctAI?.session?.().token) return;
  const open = state.key + '#' + state.token;
  if (primerAhead.key === open) return;
  Object.assign(primerAhead, { key: open, done: false });
  clearTimeout(primerAhead.timer);
  primerAhead.timer = setTimeout(async () => {
    try {
      const key = state.key, unit = currentUnit();
      if (!unit || state.key + '#' + state.token !== open) return;
      const id = primerKey(unit);
      if (store.get(id) || primerMaking.has(id)) return;
      const remote = await primerRemote('GET', unit);
      if (state.key !== key) return;
      if (remote) { store.set(id, remote); return }
      if (store.get(id) || primerMaking.has(id)) return;
      await makePrimer(unit, { speculative: true }).catch(() => { /* opened later, it is made then */ });
    } finally { if (primerAhead.key === open) primerAhead.done = true }
  }, PRIMER_PREFETCH_MS);
}
/** The primer for `unit`: kept here, else the account's, else made now (made ahead on open: primerPrefetch). Redo makes a new one. */
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
  // In the column it opens in its trigger's place, at its unit's first page (layoutColumn), and scrolls with the page.
  primer.open = true; primer.unit = unit; primer.keyed = keyboard;
  if (mode === 'phone') openSheet2('primer');
  loadPrimer(unit);
  marginLayout();
}
/** Fold the primer back to its trigger. */
function closePrimer() {
  if (!primer.open) return;
  const key = primer.unit?.key;
  const had = !!primer.el?.contains(document.activeElement);
  primer.open = false; primer.token++;
  primer.el?.remove(); primer.el = null;
  if (col.sheet?.dataset.id === 'primer') { col.sheet.remove(); col.sheet = null }
  marginLayout();
  // The focus goes back to the unit's Primer pill (the wide column), else the pages.
  const pill = key && col.pills.get(key + ':start')?.querySelector('[data-pill="primer"]');
  if (had) requestAnimationFrame(() => (pill?.isConnected ? pill : $('scroll')).focus?.({ preventScroll: true }));
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
  if (primer.wait) el.querySelector('.mr-wait')?.append(waitDots());
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
/** A point on the pages at viewport height `y`: { n, frac } of that page's height (the page there, or the nearest). */
function pagePoint(y) {
  if (!state.pages.length) return null;
  const p = state.pages.find(q => q.pg.getBoundingClientRect().bottom > y) || state.pages[state.pages.length - 1], r = p.pg.getBoundingClientRect();
  return r.height ? { n: p.n, frac: (y - r.top) / r.height } : null;
}
/** Where a point on the pages (pagePoint) is now, in viewport pixels; null when it is unknown. */
function pointOnPages(a) {
  const p = a && state.pages[a.n - 1]; if (!p) return null;
  const r = p.pg.getBoundingClientRect();
  return r.top + a.frac * r.height;
}
/** Narrow windows: the primer floats beside the page, as a card opened from a mark does. */
function placePrimerFloat(pageRight, { anchored = false } = {}) {
  if (!primer.open) { if (primer.el?.classList.contains('is-floating')) { primer.el.remove(); primer.el = null } return }
  const el = primerEl(), fresh = el.parentElement !== root;
  if (fresh) root.appendChild(el);
  el.classList.add('is-floating');
  drawPrimer(el);
  const hdr = $('hdr').getBoundingClientRect().bottom, x = pageRight + TinctMargin.COL.dot;
  el.style.left = (x + 14 + 380 <= innerWidth - 16 ? x + 14 : Math.max(16, x - 14 - 380)) + 'px';
  el.style.maxHeight = Math.max(160, innerHeight - hdr - 32) + 'px';
  if (!anchored) { el.style.display = ''; el.style.top = hdr + 16 + 'px'; return }
  // Narrow windows: it opens below the top bar at a point on the pages and scrolls away with them, as a card does.
  if (fresh || !primer.anchor) primer.anchor = pagePoint(hdr + 16);
  const at = pointOnPages(primer.anchor), top = at == null ? hdr + 16 : Math.round(at);
  el.style.top = top + 'px';
  const gone = top >= innerHeight || top + el.offsetHeight <= hdr;
  el.style.display = gone ? 'none' : '';
  el.style.clipPath = top < hdr ? `inset(${hdr - top}px -60px -60px -60px)` : '';
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
/** A unit's newest card for a pill: its quiz, its recap or its catch-up (an Ask card on the unit, data.pill). */
function unitCard(unit, pill) {
  if (pill === 'quiz') return unitQuiz(unit);
  return keptCards().filter(c => !c.gone && c.data?.unit?.key === unit.key && c.data?.pill === pill).sort((a, b) => (b.at || 0) - (a.at || 0))[0] || null;
}
/** The units whose marks are drawn: those whose start or end is near the reader's place, the open primer's and an open unit card's; never front or back matter. */
function markUnits() {
  if (!primer.units) return [];
  const at = placePage(), here = currentUnit(), open = col.open && col.open !== 'whole' ? cardById(col.open) : null;
  const openKey = open?.data?.unit?.key || (open?.unitNote ? open.unit : null) || (col.draft?.unitNote && col.open === col.draft.id ? col.draft.unit : null);
  const near = u => { const end = primer.places.get(u.key)?.value?.end.page ?? u.to; return Math.abs(u.start - at) <= 3 || Math.abs(end - at) <= 3 || (at >= u.from && at <= end && end - u.from <= 6) };
  return primer.units.filter(u => (primer.open && primer.unit?.key === u.key) || u.key === openKey || u === here || (!u.matter && near(u)));
}
/** A unit's mark (its start's or its end's), drawn again only when what it shows changed. */
function unitMark(unit, where, doc) {
  const k = unit.key + ':' + where;
  let el = col.pills.get(k);
  if (!el) { el = document.createElement('div'); el.className = `mr mr-unit is-${where}`; el.setAttribute('role', 'group'); el.dataset.unit = unit.key; el.dataset.where = where; col.pills.set(k, el) }
  const open = where === 'start' ? (primer.open && primer.unit?.key === unit.key ? 'primer' : unitCard(unit, 'catchup')?.id === col.open && col.open ? 'catchup' : '')
    : ['recap', 'quiz'].find(p => col.open && unitCard(unit, p)?.id === col.open) || (col.open && viewCards().some(c => c.id === col.open && c.unitNote && (c.page === unit.to || c.unit === unit.key)) ? 'note' : '');
  const name = TinctMargin.html.unitName(unit, state.title), phrase = TinctMargin.unitPhrase(unit), pages = unitPagesLabel(unit);
  const sig = JSON.stringify([where, unit.key, open, name, pages, nothingBefore(unit)]);
  if (el.dataset.sig !== sig) {
    el.dataset.sig = sig;
    el.setAttribute('aria-label', `${where === 'start' ? 'Start' : 'End'} of ${phrase}`);
    el.innerHTML = TinctMargin.html.markHtml(where, { open, name, pages, phrase, line: TinctMargin.triggerLine(unit) });
    // The whole book: "Before you start" and its Primer alone (there is nothing before it to catch up on).
    if (unit.key === BOOK_UNIT) { el.classList.add('is-book'); el.querySelector('.mr-unit__k').textContent = 'Before you start'; el.querySelector('[data-pill="catchup"]')?.remove() }
    // Nor at the first section, or front matter before it (Anders, 20 Oct 2026: "there shouldnt be a 'catch me up' on the first page").
    else if (nothingBefore(unit)) el.querySelector('[data-pill="catchup"]')?.remove()
  }
  if (el.parentElement !== doc) doc.appendChild(el);
  return el;
}
/** A unit's pages as printed: "pp. 10–18", "p. 4"; none for a band, whose name says them. */
function unitPagesLabel(unit) {
  // An EPUB's units are its chapters (the preview's too): no pages to name.
  if (unit.pages || isEpub()) return '';
  const a = pageLabel(unit.from), b = pageLabel(unit.to);
  return unit.from === unit.to ? `p. ${a}` : `pp. ${a}–${b}`;
}
/* Where a unit's marks go: its heading's top on its first page and the top of its last line, in page fractions (the
   text layer's own line boxes: baseline less 0.86 of the size). Found once per unit from the page's text, the layout
   drawn again when it is known. -> { head: { page, y }, end: { page, y } } or null (not yet) */
function unitPlaceNow(u) {
  if (isEpub()) return previewUnitPlace(u);
  const had = primer.places.get(u.key);
  if (had) return had.value || null;
  const entry = { value: null };
  primer.places.set(u.key, entry);
  const key = state.key;
  unitPlace(u).then(v => { if (state.key !== key || primer.places.get(u.key) !== entry) return; entry.value = v; marginLayout() }, () => {});
  return null;
}
/* A Tinct book's chapter (the preview) is text laid out here: its start mark level with the chapter heading's top,
   its end mark with the top of its last line, measured as they are drawn (the text reflows with the window and size). */
function previewUnitPlace(u) {
  const p = state.pages[u.start - 1], q = state.pages[u.to - 1]; if (!p || !q) return null;
  const at = (pg, y) => { const r = pg.getBoundingClientRect(); return r.height > 0 ? (y - r.top) / r.height : 0 };
  // An EPUB of the reader's own: the unit's first heading in its first chapter (the book's own <h1>…); none, the chapter's top.
  const head = u.key === BOOK_UNIT ? null : p.pg.querySelector('.tb-head .tb-title') || p.pg.querySelector('.tb-head') || p.pg.querySelector('.epub-body :is(h1, h2, h3)');
  const last = [...epubParas(q)].reverse().find(el => el.textContent.trim().replace(/\u200b/g, ''));
  let y = null;
  if (last) { const r = document.createRange(); r.selectNodeContents(last); const lines = textRects(r).filter(b => b.height > 0); y = lines.length ? lines[lines.length - 1].top : last.getBoundingClientRect().top }
  return { head: { page: u.start, y: head ? at(p.pg, head.getBoundingClientRect().top) : 0.004 }, end: { page: u.to, y: y == null ? 0.9 : at(q.pg, y) } };
}
const compactText = t => String(t || '').toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]/gu, '');
const pageLinesMemo = new Map();
/** A page's lines of text for the unit marks, top first: { top, size, text } (top in page fractions, as the text layer sets its spans); running heads, folios and rotated text left out. */
function unitLines(n) {
  const k = state.key + ':' + n;
  if (!pageLinesMemo.has(k)) pageLinesMemo.set(k, (async () => {
    const page = await state.pdf.getPage(n), vp = page.getViewport({ scale: 1 }), items = (await pageText(n)).items || [];
    const lines = [];
    for (const it of items) {
      if (!it?.str?.trim()) continue;
      const tx = pdfjsLib.Util.transform(vp.transform, it.transform), size = Math.hypot(tx[2], tx[3]);
      if (size < 1 || Math.abs(tx[1]) > size * 0.05) continue;
      const top = (tx[5] - size * 0.86) / vp.height, L = lines.find(l => Math.abs(l.base - tx[5]) < Math.min(l.size, size) * 0.5);
      if (L) { L.parts.push([tx[4], it.str]); L.top = Math.min(L.top, top); L.size = Math.max(L.size, size) } else lines.push({ base: tx[5], size, top, parts: [[tx[4], it.str]] });
    }
    for (const L of lines) L.text = L.parts.sort((a, b) => a[0] - b[0]).map(q => q[1]).join(' ').replace(/\s+/g, ' ').trim();
    const sizes = lines.map(l => l.size).sort((a, b) => a - b), body = sizes[Math.floor(sizes.length / 2)] || 0;
    // A folio ("14", "xii"), and a short line at the very top or foot in the body's size or smaller (a running head).
    const furniture = l => /^(?:\d{1,4}|[ivxlc]{1,7})$/i.test(l.text) || ((l.top < 0.08 || l.top > 0.93) && l.text.length < 70 && l.size <= body * 1.02);
    return lines.filter(l => !furniture(l)).sort((a, b) => a.top - b.top);
  })().catch(() => []));
  return pageLinesMemo.get(k);
}
async function unitPlace(u) {
  const units = primer.units || [], next = units[units.indexOf(u) + 1];
  const head = await headPlace(u);
  let end = null;
  if (next) {
    const nh = await headPlace(next), lines = await unitLines(nh.page), above = lines.filter(l => l.top < nh.y - 0.002);
    if (nh.page === u.to + 1 && above.length) end = { page: nh.page, y: above[above.length - 1].top };
  }
  if (!end) { const lines = await unitLines(u.to); end = { page: u.to, y: lines.length ? lines[lines.length - 1].top : 0.9 } }
  return { head, end };
}
const headMemo = new Map();
/** The top of a unit's heading on its first page: the line that reads as its title, else the outline's destination, else the page's top. */
function headPlace(u) {
  const k = state.key + ':' + u.key + ':' + u.start;
  if (!headMemo.has(k)) headMemo.set(k, (async () => {
    const lines = await unitLines(u.start);
    const want = compactText(u.head || TinctMargin.html.unitName(u, ''));
    if (want && !u.pages) {
      // The largest line that reads as the title (a running head repeating it is smaller).
      let best = null;
      for (let j = 0; j < lines.length; j++) {
        const c = compactText(lines[j].text), two = c + compactText(lines[j + 1]?.text);
        if (c && (c.startsWith(want) || (c.length >= Math.min(6, want.length) && want.startsWith(c) && two.startsWith(want.slice(0, 40)))) && (!best || lines[j].size > best.size)) best = lines[j];
      }
      if (best) return { page: u.start, y: best.top };
    }
    if (u.destTop != null) {
      const page = await state.pdf.getPage(u.start), [, , , h] = page.view, y = 1 - u.destTop / h;
      const line = lines.find(l => l.top >= y - 0.01);
      return { page: u.start, y: line ? line.top : Math.max(0, y) };
    }
    // No heading to go by (the whole file, a band of pages): the page's top, never its first line of text (a cover drawn
    // as one picture has its only line at its foot; Possible Minds, 19 Oct 2026).
    return { page: u.start, y: 0.004 };
  })().catch(() => ({ page: u.start, y: 0.004 })));
  return headMemo.get(k);
}
/**
 * A pill tapped (the wide column): Primer opens or folds Before you start in place; Catch me up and Recap open the
 * unit's card (made then, on tap: only the primer is made ahead) or fold it; Quiz me the unit's quiz; Note the reader's
 * own note on the unit (a new one ready to write).
 */
function pillAction(pill, key) {
  const unit = unitByKey(key); if (!unit) return;
  if (pill === 'primer') { if (primer.open && primer.unit?.key === key) closePrimer(); else openPrimer(unit); return }
  if (pill === 'quiz') return quizUnit(unit);
  if (pill === 'note') {
    const note = viewCards().find(c => c.unitNote && (c.page === unit.to || c.unit === unit.key));
    if (note) { openCard(col.open === note.id ? null : note.id, { focus: col.open === note.id ? false : 'card' }); return }
    if (primer.open) closePrimer();
    newMarginNote(null, { unit }); return;
  }
  const have = unitCard(unit, pill);
  if (have) { openCard(col.open === have.id ? null : have.id); return }
  if (primer.open) closePrimer();
  const label = unit.key === 'all' ? TinctMargin.KINDS.whole : TinctMargin.unitPhrase(unit);
  const card = TinctMargin.newCard({ kind: 'ask', page: pill === 'recap' ? unit.to : unit.from, anchor: [{ n: pill === 'recap' ? unit.to : unit.from, x: 0, y: 0, w: 0, h: 0 }], text: '', data: { unit: { key: unit.key, label }, pill } });
  store.set('cards:' + state.key, [...keptCards(), card]); cardsSync.changed(); col.view = null;
  openCard(card.id); runCard(card.id);
}
/** The pages a unit's catch-up covers: everything before it (at most the 200 pages before), or the opening so far in the first unit. */
/** What a unit's Catch me up covers: the pages before it, never the reader's page or later (TinctMargin.catchUpSpan). */
function catchRange(unit) {
  const { from, to } = TinctMargin.catchUpSpan(unit.from, placePage());
  return { key: unit.key, from, start: from, to };
}
function quizUnit(at = null) {
  const unit = at || primer.unit || currentUnit(); if (!unit) return;
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
    // Shown at most 120px tall (a figure card's picture away from the wide column, the chat's), so three times that.
    const bmp = await createImageBitmap(blob), k = Math.min(1, 720 / bmp.width, 360 / bmp.height);
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.86);
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
    const thumb = item.thumb || (item.blob ? await thumbOf(item.blob) : '');
    if (thumb && item.blob) fullOf.set(thumb, item.blob);
    chat.attach.push({ ...item, kind: item.kind, snip: !!meta.snip, page: meta.page ?? item.page, text: meta.text ?? item.text, thumb });
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
// A crop's long side (Anders, 19 Oct 2026: Table 1 was soft in its card): at least three times the size it is shown
// at (the figure view fills most of a window), drawn from the PDF itself, within a sane canvas. tinct-api.js sends the
// model at most 1568 px of it; thumbnails are made from it (thumbOf), so they are sharp on a retina screen too.
const SNIP_LONG = 2400;
async function snipImage(n, f, { long = SNIP_LONG } = {}) {
  try {
    const page = await state.pdf.getPage(n), base = page.getViewport({ scale: 1 });
    const side = Math.max(f.w * base.width, f.h * base.height, 1);
    const scale = Math.max(1, Math.min(12, long / side));
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
/* The figure large (a figure card's picture, or one in the chat; Anders, 19 Oct 2026, night): over the reader, its
   picture drawn sharp from the PDF (snipImage); Escape, the close or a click beside it closes it. */
const fullOf = new Map();
function figureView(src, alt, more = null) {
  document.querySelector('.mr-figview')?.remove();
  const back = document.activeElement;
  const el = document.createElement('div');
  el.className = 'mr mr-figview'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', alt || 'Figure');
  el.innerHTML = `<figure class="mr-figview__fig"><img alt="${esc(alt || '')}" src="${esc(src || '')}"></figure><button type="button" class="mr-figview__close" aria-label="Close">${TC?.ICONS.close || "×"}</button>`;
  const close = el.close = () => { el.remove(); if (back?.isConnected) back.focus?.({ preventScroll: true }) };
  el.addEventListener('click', e => { if (!e.target.closest('img')) close() });
  root.appendChild(el);
  el.querySelector('.mr-figview__close').focus({ preventScroll: true });
  // The sharp picture replaces the small one when it is drawn.
  if (more) more.then(url => { if (url && el.isConnected) el.querySelector('img').src = url }).catch(() => {});
  return el;
}
function openFigureView(card) {
  const f = TinctMargin.anchorOfCard(card)[0]; if (!f) return;
  const label = card.data?.label || 'Figure';
  figureView(figThumbs.get(card.id) || '', `${label} · p. ${pageLabel(card.page)}`, state.pdf ? snipImage(card.page, f).then(b => (b ? URL.createObjectURL(b) : '')) : null);
}
function openChatImage(src) {
  const blob = fullOf.get(src);
  figureView(src, 'Attached image', blob ? Promise.resolve(URL.createObjectURL(blob)) : null);
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
    return TinctMargin.findFigures({ ink, W, H, spans, formulas: [], shapes: await pageShapes(n) });
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

/* A page's own drawing for the figures' boxes (TinctMargin.snapFigure): every painted path (its rules, lines, curves,
   filled shapes) and every picture, each as its box in page fractions, from the page's operator list (pdf.js 3.11:
   constructPath carries its box; the paint that follows says it is drawn, not a clip). Kept per page. */
const shapeMemo = new Map();
function pageShapes(n) {
  if (isEpub() || !state.pdf) return Promise.resolve([]);
  const k = state.key + ':' + n;
  if (!shapeMemo.has(k)) shapeMemo.set(k, (async () => {
    const page = await state.pdf.getPage(n), vp = page.getViewport({ scale: 1 }), list = await page.getOperatorList();
    const O = pdfjsLib.OPS, U = pdfjsLib.Util, out = [], stack = [];
    const PAINT = new Set([O.stroke, O.closeStroke, O.fill, O.eoFill, O.fillStroke, O.eoFillStroke, O.closeFillStroke, O.closeEOFillStroke]);
    const IMAGE = new Set([O.paintImageXObject, O.paintInlineImageXObject, O.paintImageMaskXObject, O.paintSolidColorImageMask, O.paintImageXObjectRepeat].filter(v => v != null));
    let ctm = [1, 0, 0, 1, 0, 0], pending = null, white = false;
    // A path's box from its own points (the curves' control points too: pdf.js 3.11's minMax leaves curves out).
    const pathBox = (ops, args) => {
      if (!Array.isArray(ops) || !args) return null;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, k = 0;
      const at = (x, y) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y };
      for (const op of ops) {
        const n = op === O.rectangle ? 4 : op === O.curveTo ? 6 : op === O.curveTo2 || op === O.curveTo3 ? 4 : op === O.moveTo || op === O.lineTo ? 2 : 0;
        if (op === O.rectangle) { at(args[k], args[k + 1]); at(args[k] + args[k + 2], args[k + 1] + args[k + 3]) }
        else for (let j = 0; j < n; j += 2) at(args[k + j], args[k + j + 1]);
        k += n;
      }
      return x1 >= x0 && Number.isFinite(x0 + y0 + x1 + y1) ? box(x0, y0, x1, y1) : null;
    };
    const box = (x0, y0, x1, y1) => {
      const m = U.transform(vp.transform, ctm), pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => U.applyTransform([x, y], m));
      const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]), l = Math.min(...xs), t = Math.min(...ys);
      return { x: l / vp.width, y: t / vp.height, w: (Math.max(...xs) - l) / vp.width, h: (Math.max(...ys) - t) / vp.height };
    };
    for (let i = 0; i < list.fnArray.length && out.length < 4000; i++) {
      const fn = list.fnArray[i], a = list.argsArray[i];
      if (fn === O.save) stack.push([ctm, white]);
      else if (fn === O.restore) [ctm, white] = stack.pop() || [[1, 0, 0, 1, 0, 0], false];
      else if (fn === O.transform) ctm = U.transform(ctm, a);
      else if (fn === O.paintFormXObjectBegin) { stack.push([ctm, white]); if (Array.isArray(a?.[0])) ctm = U.transform(ctm, a[0]) }
      else if (fn === O.paintFormXObjectEnd) [ctm, white] = stack.pop() || [[1, 0, 0, 1, 0, 0], false];
      else if (fn === O.setFillRGBColor || fn === O.setFillGray || fn === O.setFillColor) {
        const v = a && typeof a[0] === 'string' ? a[0] : null, nums = a && !v ? Object.values(a).filter(x => typeof x === 'number') : [];
        white = v ? /^#f[a-f0-9]f[a-f0-9]f[a-f0-9]$/i.test(v) : nums.length > 0 && nums.every(x => x >= (nums.some(y => y > 1) ? 250 : 0.98));
      }
      else if (fn === O.constructPath) pending = pathBox(a?.[0], a?.[1]);
      else if (PAINT.has(fn)) { if (pending && !(white && (fn === O.fill || fn === O.eoFill))) out.push(pending); pending = null }
      else if (fn === O.endPath) pending = null;
      else if (IMAGE.has(fn)) out.push(box(0, 0, 1, 1));
    }
    return out;
  })().catch(() => []));
  return shapeMemo.get(k);
}
/* ---------- Figures: areas with ink but no running text get a hover chip (TinctMargin.findFigures) ---------- */
async function detectFigures(p) {
  if (!p.canvas || !p.layer || p.figLayer === p.layer) return;
  const layer = p.layer, token = state.token;
  // Only from the page's complete text (19 Oct 2026: a paragraph boxed as a figure while its text was not all in):
  // every item pdf.js gives for the page has its span in the layer, laid over the drawing it was built for (the
  // layer is in page fractions). Until then nothing is found (and it is tried again once the layer is complete).
  const text = await pageText(p.n).catch(() => null);
  if (token !== state.token || p.layer !== layer || !p.canvas) return;
  const complete = !text || text.ocr || !Array.isArray(text.items) || (p.spans?.length === text.items.length && p.spans.every(sp => !sp || sp.isConnected));
  if (!complete) { if ((p.figTries = (p.figTries || 0) + 1) <= 40) setTimeout(() => detectFigures(p), 300); return }
  const shapes = await pageShapes(p.n);
  if (token !== state.token || p.layer !== layer || !p.canvas) return;
  p.figLayer = layer; p.figTries = 0;
  const c = drawn(p), W = 240, H = Math.max(1, Math.round(W * c.height / c.width));
  const g = document.createElement('canvas'); g.width = W; g.height = H;
  const x = g.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, ink = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) ink[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) < 247 ? 1 : 0;
  const pr = p.pg.getBoundingClientRect();
  const spans = [...p.layer.querySelectorAll('span')].map(sp => { const q = sp.getBoundingClientRect(); return { x: (q.left - pr.left) / pr.width, y: (q.top - pr.top) / pr.height, w: q.width / pr.width, h: q.height / pr.height, text: sp.textContent } });
  const found = TinctMargin.findFigures({ ink, W, H, spans, formulas: p.blocks || [], shapes });
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
  // The selection bar's own dark style and order (Anders, 19 Oct 2026): Ask, Explain, then Highlight and Copy.
  const sep = '<span class="mr-bar__sep" aria-hidden="true"></span>', I = TinctMargin.html.ICONS;
  el.innerHTML = `<div class="byob-hot-chip mr mr-chip" role="toolbar" aria-label="${KIND[reg.kind]} actions">
    <button type="button" class="mr-bar__item is-text" data-a="ask" title="Ask about this ${reg.kind}">Ask</button>${sep}
    <button type="button" class="mr-bar__item is-text" data-a="explain" title="Explain this ${reg.kind}">Explain</button>${sep}
    <button type="button" class="mr-bar__item" data-a="highlight" title="Highlight this ${reg.kind}">${I.highlight}<span>Highlight</span></button>
    <button type="button" class="mr-bar__item" data-a="copy" title="Copy this ${reg.kind} as an image">${TinctMargin.html.CARD_ICONS.copy}<span>Copy</span></button></div>`;
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
    // An attached picture in the thread (at most 120px tall): the picture large.
    el.addEventListener('click', e => { const b = e.target.closest('[data-chatimg]'); if (b) { e.preventDefault(); openChatImage(b.dataset.chatimg) } });
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
    extra: t.imgs?.length ? chatImgs(t.imgs) : '',
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
  if (chat.live && marginOn()) {
    // A pause mid-answer shows the dots below the last words (LIVE_PAUSE_MS, as a card's).
    const live = chat.live; live.text = text; live.paused = false; clearTimeout(live.timer);
    live.timer = setTimeout(() => { if (chat.live === live) { live.paused = true; renderThread() } }, LIVE_PAUSE_MS);
    renderThread(); return
  }
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
  const wholeDoc = marginOn() ? await marginDocumentNow(focusPage, 'whole') : null;
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
  const page = readingPage(), ch = chapterAt(page);
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
  // Never past the reader's place (Anders, 21 Oct 2026): the page they are on only as far as they are on it (seenText).
  const place = currentPlace(), page = place.page;
  const partOf = e => { const parent = e.parent && toc.entries.find(p => p.id === e.parent); return parent ? parent.label : '' };
  const chapters = leafEntries().filter(e => e.kind === 'chapter' && e.page <= page).map(e => ({ ...chapterRange(e), label: e.label, part: partOf(e) }));
  const blocks = TinctMargin.catchUpBlocks(chapters, page, BLOCK);
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
      // The reader's own page only as far as they have read it.
      const seen = b.partial ? TinctMargin.seenText((await pageText(page)).text, place.frac) : null;
      if (b.partial && b.from === b.to && (seen || '').length < 200) { li.remove(); return }
      const pdf = marginOn() ? await pdfPages(b.from, { before: 0, after: b.to - b.from, budget: Math.floor(70000 / (b.to - b.from + 1)) }) : null;
      const last = pdf?.pages[pdf.pages.length - 1];
      if (pdf && b.partial && last && last.n === pageLabel(page)) last.text = seen || ' ';
      const text = pdf ? '' : b.partial ? (await contextText(b.from, b.to - 1, 70000)) + `\n[${isEpub() ? (toc.entries.find(e => e.page === page)?.label || 'Section ' + page) : 'Page ' + page}]\n` + seen : await contextText(b.from, b.to, 70000);
      const r = await s.json(`You are Tinct's reading companion. ${bookLine()}\nSummarize pages ${b.from} to ${b.to} for a reader catching up: reply with only JSON {"title": "3 to 6 word name for this stretch", "summary": "2 to 3 plain sentences on what happens or is argued"}. Use only this text: it ends where the reader is. ${TinctMargin.CATCH_UP_GROUNDING}${text ? '\n\n' + text : ''}`, { cache: { gcTime: 86400000 }, ...(pdf ? { pdf } : {}) });
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
    if (clickedIn(e, '.mr-col, .mr-marks, .mr-sheet, .mr-card, .tb-mark')) return;
    // The phone's EPUB took the tap already (ownSelection's touchend: iOS sends no click for a tap on plain text).
    if (ownsSelection() && Date.now() - own.tap < 800) return;
    tapPage(e.clientX, e.clientY, { click: true, inScroll: clickedIn(e, '.pdf-scroll') });
    return;
  }
  const h = highlightAt(e.clientX, e.clientY), open = document.querySelector('.selection-popup[data-popup-mode="highlight"]');
  if (!h) { open && hideSelection(); return }
  sel = { text: h.text, page: h.page, box: h.box }; showSelection(h);
  // The click collapses the selection; keep this popup until the next click or selection.
  const pop = document.querySelector('.selection-popup'); if (pop) pop.dataset.popupMode = 'highlight';
});
/** A tap or click on the pages (the margin): a highlight's bar, a card's passage, or (the phone's own selection) its bar let go. */
function tapPage(x, y, { click = false, inScroll = !click } = {}) {
  if (!click && mr) { marginClose(); return }
  // An EPUB's highlight is offsets in its chapter: measured into boxes here, as its card is.
  const h = highlightAt(x, y), found = h && highlights().find(q => q.id === h.id), rec = isEpub() && found ? epubMarkRects(found, { any: true }) : found;
  const card = cardAt(x, y);
  if (card && !rec) { openCard(card.id); return }
  if (rec?.rects) { marginOpen({ text: h.text, page: h.page, box: h.box }, { existing: rec }); if (rec.note && marginMode() !== 'phone') openCard('n-' + rec.id) }
  // Focus view: a click on the page away from the pop-up window closes it, as the book reader's does.
  else if (!card && col.open && marginMode() === 'focus' && inScroll) openCard(null);
}
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

/* ---------- EPUBs on the desktop: Margin view, the place by paragraph and word (Anders, 19 Oct 2026) ----------
   An EPUB opens here in Margin view on the desktop (TinctReaderLayout.epubView), its text flowing, with the margin's
   cards and the Notebook; "Convert to Tinct book" (the Aa panel) reads it in the Tinct reader from then on, on this
   device (epub-view:<hex>), and the Tinct reader's "Margin view" comes back. A phone reads it in the Tinct reader,
   as before. Its place here is kept by paragraph and word (pos:<key>: `para`, `word`, and the words there, `quote`),
   so a change of width or text size never moves it; the place crosses to the Tinct reader and back by those words
   (TinctReaderLayout.findQuote; app/src/lab/userBook/epubView.ts), the newer place winning. When this device has the
   book's Tinct text (converted in the Tinct reader), the place is also kept as the Tinct reader's (place:<hex>), the
   one the account syncs, and a place read later there is taken here. */
const epubOwnView = key => store.get('epub-view:' + hexOf(key));
/** True when this EPUB reads here (the desktop, unless the reader chose the Tinct reader on this device). */
const epubHere = key => RL.epubView({ phone: innerWidth < 700, own: epubOwnView(key) }) === 'margin';
/** Named and drawn on the shelf (its title, author and cover) and sent to the account, as the Tinct reader's way does; never waited for. */
function epubShelved(bytes, name, key, upload, { quiet = false } = {}) {
  engine.prepareEpub(bytes, name, key, upload, { quiet, notify: toast }).catch(() => {});
}
const EPUB_BLOCKS = 'p,h1,h2,h3,h4,h5,h6,li,dt,dd,figcaption,pre,blockquote,div,td,th,caption';
/** A chapter's paragraphs: its innermost blocks with words in them, in reading order. */
function epubParas(p) {
  if (!p.paras) p.paras = [...p.pg.querySelectorAll(EPUB_BLOCKS)].filter(el => !el.querySelector(EPUB_BLOCKS) && el.textContent.trim());
  return p.paras;
}
const wordsOf = text => String(text || '').trim().split(/\s+/).filter(Boolean);
/** A paragraph's words as [text node, start, end], in order (its text never changes once drawn). */
const wordCache = new WeakMap();
function wordSpans(el) {
  let list = wordCache.get(el);
  if (!list) {
    list = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node; (node = walker.nextNode());) for (const m of node.nodeValue.matchAll(/\S+/g)) list.push([node, m.index, m.index + m[0].length]);
    wordCache.set(el, list);
  }
  return list;
}
function wordRect(el, i) {
  const w = wordSpans(el)[i]; if (!w) return null;
  const r = document.createRange(); r.setStart(w[0], w[1]); r.setEnd(w[0], w[2]);
  return [...r.getClientRects()].find(q => q.height > 0) || r.getBoundingClientRect();
}
/** The first index in 0..n-1 whose `bottom(i)` is past `y` (bottoms grow with i), or n. */
function firstPast(n, bottom, y) { let lo = 0, hi = n; while (lo < hi) { const mid = (lo + hi) >> 1; if (bottom(mid) > y) hi = mid; else lo = mid + 1 } return lo }
/** The paragraph and word at the top of the view (the first word whose line is in view), and the words from there. */
function epubSpot() {
  const none = { para: undefined, word: undefined, quote: undefined };
  const place = currentPlace(), p = state.pages[place.page - 1]; if (!p) return none;
  const top = $('scroll').getBoundingClientRect().top + 1, paras = epubParas(p);
  const i = firstPast(paras.length, k => paras[k].getBoundingClientRect().bottom, top);
  if (i >= paras.length) return none;
  const el = paras[i], words = wordsOf(el.textContent);
  const word = el.getBoundingClientRect().top >= top ? 0 : Math.min(words.length - 1, firstPast(wordSpans(el).length, k => wordRect(el, k)?.bottom ?? -Infinity, top));
  return { para: i, word: Math.max(0, word), quote: words.slice(Math.max(0, word), Math.max(0, word) + 14).join(' ').slice(0, 120) };
}
/** Scroll until `measure()` (a client y, or null) stands `at` of the way down the view; the chapters measure as they come near. */
function epubSettle(measure, at = 0, tries = 6) {
  return new Promise(resolve => {
    const s = $('scroll');
    const step = n => {
      const y = measure(); if (y == null) return resolve(false);
      const sr = s.getBoundingClientRect(), delta = y - (sr.top + at * sr.height);
      if (Math.abs(delta) > 1.5) s.scrollTop += delta;
      if (n <= 0 || Math.abs(delta) <= 1.5) { onScroll(); return resolve(true) }
      requestAnimationFrame(() => step(n - 1));
    };
    step(tries);
  });
}
/** To a paragraph's word in chapter `n` (the word's line at the top of the view); held there until the reader scrolls. */
function epubGoSpot(n, para, word = 0) {
  const p = state.pages[n - 1], el = p && epubParas(p)[para]; if (!el) return false;
  Object.assign(epubHold, { spot: { para, word }, page: n, at: null });
  goTo({ page: n, frac: 0 });
  // A little room above the paragraph, never as much as reaches the paragraph before (the phone's gap is small): its
  // last line would then be at the top, and the place read back as that paragraph's end.
  const room = () => { const prev = epubParas(p)[para - 1], top = el.getBoundingClientRect().top; return prev ? Math.max(0, Math.min(10, top - prev.getBoundingClientRect().bottom - 2)) : 10 };
  // The word itself, while the view stays where it was brought (the preview hands it on: previewSpot).
  const exact = state.preview ? (epubHold.exact = { page: n, para, word, top: null }) : null;
  // While the view is on its way there, the spot held is this one: the settle's own scrolls (through chapters still
  // measuring as they come near) never stand in for it, so a reflow meanwhile (text size, width, a late font) comes
  // back here, not to a line passed on the way.
  epubHold.settling++;
  epubSettle(() => (word ? wordRect(el, word)?.top ?? el.getBoundingClientRect().top : el.getBoundingClientRect().top - room())).then(() => { if (exact && epubHold.exact === exact) exact.top = $('scroll').scrollTop })
    .finally(() => { epubHold.settling = Math.max(0, epubHold.settling - 1) });
  return true;
}
/* A change of width (the window, Full width) or text size reflows the chapters: the paragraph and word at the
   top of the view stay there. The spot is read as the reader scrolls (not while the text reflows) and gone back to. */
// settling: epubGoSpot's ways there under way; opened: the open (state.token) whose place has been gone back to.
// Until then the view is not the reader's place yet (the top of the book while the fonts load), so no scroll is
// held as it; the margin check waits for it too (margin-check.mjs epubSettled).
const epubHold = { spot: null, page: 0, at: null, raf: 0, reflow: 0, exact: null, settling: 0, opened: 0 };
/** The held word's top, from the top of the view (px), or null. */
function epubSpotTop(page, spot) {
  const el = state.pages[page - 1] && epubParas(state.pages[page - 1])[spot.para], w = el && wordRect(el, spot.word || 0);
  return w ? w.top - $('scroll').getBoundingClientRect().top : null;
}
// The place as the reader leaves it: its paragraph and word, and where that word stands in the view (`at`).
// The held word still on the top line (a restore's own last scroll, a scroll of a pixel or two) stays the held word, not
// that line's first word: else each restore and reflow walked the place back to a line start, a line at a time when the
// lines wrap anew (CI 21 Oct 2026, #519: word 23 held as 15 under the fallback font, then 12).
function epubHoldNow() {
  if (!isEpub() || !state.pages.length || epubHold.reflow || epubHold.settling || epubHold.opened !== state.token) return;
  const s = epubSpot(); if (s.para == null) return;
  const page = currentPlace().page, h = epubHold;
  if (h.spot && h.page === page && h.spot.para === s.para && (h.spot.word || 0) > s.word) {
    const held = epubSpotTop(page, h.spot), line = epubSpotTop(page, s);
    if (held != null && line != null && Math.abs(held - line) < 2) { h.at = held; return }
  }
  Object.assign(h, { spot: s, page, at: epubSpotTop(page, s) });
}
/* Fonts still loading once the place is restored (the open waits at most 1.5 s for them: a cold cache, a slow
   connection): their swap reflows the text, and Chrome scrolls the view to keep its anchor, a scroll that is not the
   reader's. Until they are in, the restored place is the reader's place (no scroll is read back as it); once in, the
   view goes back to it. The reader's own first wheel, touch, key or pointer press ends the wait at once, the text left
   where it is (their gesture wins); so does EPUB_FONT_WAIT_MS, for fonts that never settle. (CI 21 Oct 2026, #519: a
   reload opened a line or two early, and the size and width steps after it held that line.) */
// The wait belongs to its open (state.token): a new open, a book or an edition switch ends it at once with nothing moved
// (epubFontWait.end, called where each open begins), and its fonts-ready or cap callback, once stale, does nothing: an
// earlier book's wait never holds the next book's place.
const EPUB_FONT_WAIT_MS = 6000;
function epubFontWait(token) {
  epubFontWait.end?.();
  if (token !== state.token || document.fonts?.status !== 'loading') return;
  const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  let on = true, cap = 0;
  const end = back => {
    if (!on) return; on = false; clearTimeout(cap);
    for (const ev of inputs) removeEventListener(ev, mine, true);
    if (epubFontWait.end === stop) epubFontWait.end = null;
    epubHold.reflow = Math.max(0, epubHold.reflow - 1);
    const { spot, page } = epubHold;
    if (back && token === state.token && isEpub() && spot && page) epubGoSpot(page, spot.para, spot.word);
  };
  const mine = () => end(false), stop = () => end(false);
  epubHold.reflow++;
  epubFontWait.end = stop;
  for (const ev of inputs) addEventListener(ev, mine, { capture: true, passive: true });
  cap = setTimeout(() => { if (token === state.token) end(false) }, EPUB_FONT_WAIT_MS);
  document.fonts.ready.then(() => requestAnimationFrame(() => { if (token === state.token) end(true) }));
}
$('scroll').addEventListener('scroll', () => { if (isEpub() && !epubHold.raf) epubHold.raf = requestAnimationFrame(() => { epubHold.raf = 0; epubHoldNow() }) }, { passive: true });
/** Around a reflow: `change()` reflows; the held spot is gone back to. */
function epubReflow(change) {
  epubHoldNow();
  const { spot, page } = epubHold;
  epubHold.reflow++;
  change();
  if (spot && page) epubGoSpot(page, spot.para, spot.word);
  setTimeout(() => { epubHold.reflow = Math.max(0, epubHold.reflow - 1) }, 400);
}
addEventListener('resize', () => {
  if (!isEpub() || !epubHold.spot) return;
  if (!epubHold.reflow) { epubHold.reflow++; setTimeout(() => { epubHold.reflow--; const { spot, page } = epubHold; if (isEpub() && spot && page) epubGoSpot(page, spot.para, spot.word) }, 220) }
});
// A web font that arrives after the place was found reflows the chapters, and without scroll anchoring (Safari)
// the text moves under the view: back to the paragraph and word held, when the reflow moved them.
document.fonts?.addEventListener?.('loadingdone', () => {
  // Not while a card is being answered: the place is held where the reader left it (holdPlace).
  if (!isEpub() || !state.pages.length || placeHeld()) return;
  const { spot, page } = epubHold; if (!spot || !page) return;
  // Still there: the held word's line at the top of the view (a reflow that moved it a line or two down is gone back from).
  const el = state.pages[page - 1] && epubParas(state.pages[page - 1])[spot.para], w = el && wordRect(el, spot.word || 0);
  const top = $('scroll').getBoundingClientRect().top;
  // Not moved at all (a font only a card or the bar uses; Anders, 20 Oct 2026: Quiz me's card jumped the page to its
  // passage's start): the text stays exactly where the reader left it.
  if (w && epubHold.at != null && Math.abs(w.top - top - epubHold.at) <= 1) return;
  if (!w || (w.top >= top - w.height * 0.6 && w.top <= top + w.height * 0.6)) return;
  epubHold.reflow++;
  epubGoSpot(page, spot.para, spot.word);
  setTimeout(() => { epubHold.reflow = Math.max(0, epubHold.reflow - 1) }, 400);
});
/** To a character offset in chapter `n` (a card's or a highlight's passage), a quarter of the way down the view. */
function epubGoOffset(n, offset) {
  const p = state.pages[n - 1]; if (!p) return Promise.resolve(false);
  goTo({ page: n, frac: 0 });
  return epubSettle(() => { const r = rangeFromOffsets(p.pg, offset, offset + 1)?.getClientRects()[0]; return r ? r.top : null }, 0.25);
}
/** To the paragraph holding these words (a place from the Tinct reader). */
function epubGoQuote(quote) {
  const hit = RL.findQuote(state.pages.map(p => epubParas(p).map(el => el.textContent)), quote);
  return !!hit && epubGoSpot(hit.chapter + 1, hit.para, hit.word);
}
/** The Tinct reader's place (place:<hex>) as words, when this device has the book's Tinct text. */
function readerPlaceWords() {
  const place = store.get('place:' + hexOf(state.key)), ed = state.epubEdition;
  if (!place || !ed || (typeof place.converter === 'number' && typeof ed.converter === 'number' && place.converter !== ed.converter)) return null;
  const ch = ed.chapters.find(c => c.number === place.chapterNumber), text = ch?.paragraphs?.[place.paragraphIndex];
  if (!text) return null;
  return { quote: wordsOf(text).slice(place.wordIndex || 0, (place.wordIndex || 0) + 14).join(' '), at: Number(place.updatedAt) || 0 };
}
/** Where an EPUB opens here: the Tinct reader's place when it was read there since (or chosen there), else its paragraph and word. */
function epubRestore(saved) {
  if (saved?.via === 't' && saved.quote && epubGoQuote(saved.quote)) { const { via: _t, ...rest } = saved; store.set('pos:' + state.key, rest); return true }
  const there = readerPlaceWords();
  if (there && there.at > (Number(saved?.at) || 0) && epubGoQuote(there.quote)) return true;
  return !!saved && Number.isInteger(saved.para) && epubGoSpot(saved.page, saved.para, saved.word || 0);
}
/** A move here is kept as the Tinct reader's place too (the one the account syncs), when this device has the Tinct text. */
function epubShare() {
  const ed = state.epubEdition, pos = store.get('pos:' + state.key); if (!ed || !pos?.quote) return;
  const hit = RL.findQuote(ed.chapters.map(c => c.paragraphs || []), pos.quote); if (!hit) return;
  const prev = store.get('place:' + hexOf(state.key)) || {};
  store.set('place:' + hexOf(state.key), { chapterNumber: ed.chapters[hit.chapter].number, paragraphIndex: hit.para, wordIndex: hit.word, updatedAt: pos.at || Date.now(), ...(typeof ed.converter === 'number' ? { converter: ed.converter } : {}), ...(Number.isInteger(prev.rev) ? { rev: prev.rev } : {}) });
}
/** "Convert to Tinct book": this device reads the EPUB in the Tinct reader from now on, at this place. */
async function epubToTinct() {
  const hex = hexOf(state.key);
  savePlaceNow();
  store.set('pos:' + state.key, { ...(store.get('pos:' + state.key) || {}), ...currentPlace(), ...epubSpot(), at: Date.now() });
  epubShare();
  store.set('epub-view:' + hex, 'text');
  leavePlace(); stopNarration();
  await accountCopySent();
  leftForTinct = true;
  location.assign('/reader?userBook=' + encodeURIComponent(hex));
}

/* ---------- Tinct's own books in the margin: the preview (js/tinct-book.js; Anders, 19 Oct 2026) ----------
   /reader?book=<id>&margin=1 shows this page in a frame with a registered book's main edition as an EPUB's
   chapters (one paragraph per edition paragraph). It reads as an EPUB here, with the margin at every width
   (window.TinctEpubMargin), and keeps everything on this device under its own key (`preview:<bookId>`): its
   place, highlights, notes and cards. EPUBs never sync, so nothing reaches the account, the book reader's
   place or its highlights. Its units are the book's chapters; each request sends the passage with its chapter
   and the contents (marginDocument's EPUB part). Leaving goes through the top window. */
const PREVIEW_NORMAL = 'Back to normal reader';
const previewWindow = () => (state.preview && window.top) || window;
/** `book`: TinctEpub.parse's shape (js/tinct-book.js builds it); `preview`: { bookId, editionLabel, normalHref }. -> opened */
async function openRegistered(book, preview) {
  showReader();
  await openEpub(null, book.title, 'preview:' + preview.bookId, { parsed: book, preview });
  return hasBook() && state.preview === preview;
}
/** Before you start, Catch me up, Recap and Quiz me work on chapters: one unit per chapter. */
for (const type of ['touchmove', 'wheel', 'keydown']) addEventListener(type, () => { if (primer.held) { primer.held = false; requestAnimationFrame(marginLayout) } }, { capture: true, passive: true });
function previewUnits() {
  toc.early = { text: true };
  // On a phone the bottom card waits for the reader's first move (a scroll, a key, a jump in the contents): it never
  // covers the text the book opened at (round 3), and shows at a chapter's start from then on (triggerUnit).
  primer.held = isPhone();
  primer.units = state.pages.map(p => {
    const e = toc.entries.find(x => x.page === p.n && x.kind === 'chapter');
    const title = e?.label || 'Chapter ' + p.n;
    return { key: 'chapter-' + (e?.number ?? p.n), title, phrase: /^chapter\s+\S+$/i.test(title) ? title.toLowerCase() : title, from: p.n, start: p.n, to: p.n };
  });
  flowMarks();
}
/*
 * An EPUB of the reader's own (Anders, 20 Oct 2026): the same unit marks as a PDF's, "Starting …" with Primer and Catch me
 * up, "End of …" with Recap, Quiz me and Note, its units sized as a PDF's are (TinctMargin.epubUnits: each essay of an
 * essay collection is one), and a whole-book Before you start at the very top (BOOK_UNIT). Desktop only: a phone reads
 * an EPUB in the Tinct reader.
 */
const BOOK_UNIT = 'book';
function epubOwnUnits(book) {
  toc.early = { text: true };
  const units = TinctMargin.epubUnits(book.chapters.map(c => ({ chars: c.text.length, role: c.role })), toc.entries);
  primer.units = units.length ? units : null;
  primer.book = units.length > 1 ? { key: BOOK_UNIT, title: state.title, phrase: 'the whole book', from: 1, start: 1, to: state.pages.length } : null;
  primer.places.clear();
}
/** True for the first real unit and any front matter before it: nothing has been read before it to catch up on. */
function nothingBefore(unit) {
  const units = primer.units || [], i = units.findIndex(u => u.key === unit?.key);
  if (i < 0) return unit?.key === BOOK_UNIT;
  const first = units.findIndex(u => !u.matter);
  return first < 0 || i <= first;
}
/** A unit by its key: one of the units, or the whole book's. */
const unitByKey = key => primer.units?.find(u => u.key === key) || (primer.book?.key === key ? primer.book : null);
/*
 * The phone's chapter pills (Anders, 20 Oct 2026: "All we needed was a new menu, the cards layout and the new pills"):
 * in the text, under each chapter's heading "Starting <chapter>" with Primer and Catch me up, after its last paragraph
 * "End of <chapter>" with Recap, Quiz me and Note, as the wide column's unit marks (markHtml) look. Each opens its
 * bottom card (pillAction). Their words are drawn by CSS (attr()), never text in the chapter: an EPUB's places and
 * highlights are character offsets in its text. Shown on the phone only (the wide column has its own marks).
 */
function flowMarks() {
  if (!state.preview || !primer.units) return;
  const PILLS = TinctMargin.html.PILLS;
  for (const u of primer.units) {
    const ch = state.pages[u.start - 1]?.pg.querySelector('.tb-chapter'); if (!ch || ch.querySelector(':scope > .tb-mark')) continue;
    const name = TinctMargin.html.unitName(u, state.title), phrase = TinctMargin.unitPhrase(u);
    const mark = where => {
      const el = document.createElement('div');
      el.className = 'tb-mark is-' + where; el.setAttribute('role', 'group'); el.dataset.unit = u.key;
      el.setAttribute('aria-label', `${where === 'start' ? 'Start' : 'End'} of ${phrase}`);
      el.dataset.k = where === 'start' ? 'Starting' : 'End of'; el.dataset.n = name;
      const said = { primer: `Before you start: ${TinctMargin.triggerLine(u)}`, catchup: `Catch me up on what came before ${phrase}`, recap: `Recap ${phrase}`, quiz: `Quiz me on ${phrase}`, note: `Note on ${phrase}` };
      el.innerHTML = (where === 'start' ? (nothingBefore(u) ? ['primer'] : ['primer', 'catchup']) : ['recap', 'quiz', 'note']).map(id => `<button type="button" class="tb-pill" data-pill="${id}" data-label="${esc(PILLS[id])}" aria-label="${esc(said[id])}"></button>`).join('');
      return el;
    };
    const head = ch.querySelector(':scope > .tb-head');
    if (head) head.after(mark('start')); else ch.prepend(mark('start'));
    ch.append(mark('end'));
  }
}
$('column').addEventListener('click', e => {
  const b = e.target.closest?.('.tb-pill'); if (!b) return;
  e.stopPropagation();
  pillAction(b.dataset.pill, b.closest('.tb-mark')?.dataset.unit);
});
/** The companion's document: never the whole book; the chapter the reader is in and the contents (marginDocument). */
const previewDocument = () => ({ pages: null, limit: window.TinctAI?.DOCUMENT_CHARS || 560000, label: n => String(n) });
/*
 * The desktop's Layout (Anders, 20 Oct 2026: "margin reader becomes the default way to read anything with two page
 * and compare mode as the two others"): Margin (here), Two-page and Compare (the book reader at this chapter,
 * paragraph and word, in that layout: js/tinct-book.js layoutHref), then Back to normal reader. Leaving for Two-page
 * or Compare keeps this device's opt-in; only Back to normal reader turns it off. The phone keeps its own Layout.
 */
const PREVIEW_VIEWS = { 'two-page': 'Two-page', compare: 'Compare' };
function previewLayouts() {
  if (!state.preview?.layoutHref || isPhone()) return null;
  return [{ id: 'margin', label: 'Margin', on: true }, ...Object.entries(PREVIEW_VIEWS).map(([id, label]) => ({ id, label, on: false, leaves: true })), { id: 'text', label: PREVIEW_NORMAL, on: false, leaves: true }];
}
/** The place to hand over: the word the reader was brought to while the view has not moved since, else the top of the view. */
function previewSpot() {
  const page = currentPlace().page, s = $('scroll'), x = epubHold.exact;
  if (x && x.top != null && x.page === page && Math.abs(s.scrollTop - x.top) <= 2) return { page, para: x.para, word: x.word };
  const spot = epubSpot();
  return { page, para: spot.para ?? 0, word: spot.para == null ? 0 : spot.word ?? 0 };
}
function previewView(view) {
  const href = state.preview.layoutHref(view, previewSpot()); if (!href) return;
  leavePlace(); stopNarration();
  previewWindow().location.assign(href);
}
/** Back to normal reader: the place here is kept first; the book reader opens at its own place. */
function previewLeave() {
  leavePlace(); stopNarration();
  previewWindow().location.assign(state.preview.normalHref);
}
window.TinctReader.openRegistered = openRegistered;

/* ---------- The Notebook (js/notebook.js; Anders, 19 Oct 2026) ----------
   Everything the reader made in this book, from the margin's store (cards:<key>, hl:<key>); nothing of its own.
   Desktop only (css/notebook.css). Opened from the top bar; updated as the store changes. */
const nbPlace = e => {
  if (!isEpub()) return `p. ${pageLabel(e.page)}`;
  const card = e.source === 'card' ? cardById(e.id) : null, mark = e.source === 'mark' ? highlights().find(m => m.id === e.mark) : null;
  const n = card?.span?.[0] || e.page, start = card ? card.span?.[1] : mark?.start, p = state.pages[n - 1];
  if (!p || start == null) return chapterPlace(n);
  p.paraStarts ??= epubParas(p).map(el => textOffset(p.pg, el, 0));
  let i = 0; while (i + 1 < p.paraStarts.length && p.paraStarts[i + 1] <= start) i++;
  return `${chapterPlace(n)} ¶ ${i + 1}`;
};
function nbFlash(mark) {
  const p = state.pages[mark.page - 1]; if (!p) return;
  if (p.kind === 'epub') { const r = rangeFromOffsets(p.pg, mark.start, mark.end); if (r) flashPlace(p, textRects(r)); return }
  const b = p.pg.getBoundingClientRect();
  flashPlace(p, (mark.rects || []).map(([x, y, w, h]) => ({ left: b.left + x * b.width, top: b.top + y * b.height, right: b.left + (x + w) * b.width, bottom: b.top + (y + h) * b.height, width: w * b.width, height: h * b.height })));
}
/** A card as the margin shows it: Fact-check's answer from its verdict on (P.cleanFactcheck, as its card and its copy). */
function nbShown(card) {
  if (card.kind !== 'factcheck' || !MP.P?.cleanFactcheck) return card;
  let k = 0;
  return { ...card, turns: (card.turns || []).map(t => (t.role === 'assistant' && k++ === 0 ? { ...t, content: MP.P.cleanFactcheck(t.content) } : t)) };
}
/** An entry's passage, brought into view; then its card opens in the margin (a plain highlight flashes). */
async function nbJump(e) {
  const card = e.source === 'card' ? cardById(e.id) : null, mark = e.source === 'mark' ? highlights().find(m => m.id === e.mark) : null;
  if (!card && !mark) return;
  if (isEpub()) await epubGoOffset(card ? card.span?.[0] || card.page : mark.page, (card ? card.span?.[1] : mark.start) ?? 0);
  else {
    const f = card && !card.data?.unit && card.rects?.length ? TinctMargin.firstRect(card) : null;
    const top = f ? f[2] : mark?.rects?.length ? Math.min(...mark.rects.map(r => r[1])) : 0;
    goTo({ page: f ? f[0] : (card || mark).page, frac: Math.max(0, top - 0.15) }); onScroll();
  }
  await new Promise(r => setTimeout(r, 160));
  col.view = null;
  if (card) openCard(card.id);
  else if (mark.note) openCard('n-' + mark.id);
  else nbFlash(mark);
}
/** Delete an entry as the margin's bin does (deleteCard), its Undo kept by the Notebook. -> restore() */
function nbRemove(e) {
  if (e.source === 'card') {
    deleteCard(e.id);
    const restore = undo.restore; hideUndo();
    return restore;
  }
  const marks = highlights(), m = marks.find(x => x.id === e.mark); if (!m) return null;
  const before = JSON.parse(JSON.stringify(m));
  if (e.kind === 'note' && !m.withNote) { delete m.note; m.u = Date.now(); putHighlights(marks) }
  else removeHighlight(m.id);
  renderHighlights(state.pages[m.page - 1]); col.view = null; strip?.marksChanged(); marginLayout({ fresh: true }); announce('Deleted.');
  return () => {
    store.set('hl-gone:' + state.key, (store.get('hl-gone:' + state.key) || []).filter(g => g.id !== before.id));
    putHighlights([...highlights().filter(x => x.id !== before.id), { ...before, u: Date.now() }]);
    renderHighlights(state.pages[before.page - 1]); col.view = null; strip?.marksChanged(); marginLayout({ fresh: true });
  };
}
if (window.TinctNotebook && $('notebookBtn')) {
  TinctNotebook.mount({
    root, button: $('notebookBtn'),
    data: () => (hasBook() ? { cards: keptCards().map(nbShown), marks: highlights() } : { cards: [], marks: [] }),
    place: nbPlace, meta: () => ({ title: state.title, author: state.author }),
    jump: e => { nbJump(e).catch(err => console.error(err)) }, remove: nbRemove, toast,
  });
  // Live: a card or highlight written to the store (an answer, a note, the account's copy merged) redraws it.
  const storeSet = store.set;
  store.set = (k, v) => { storeSet(k, v); if (state.key && (k === 'cards:' + state.key || k === 'hl:' + state.key)) TinctNotebook.changed() };
}

/* ---------- Boot ---------- */
applyLayout();
document.fonts?.ready.then(applyLayout);
applyTheme(); state.trim = !!prefs.trim;
pdfWorker();
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};
if (window.TinctAI) TinctAI.onSignedOut = () => toast('Your Tinct sign-in has expired, so this answer used the guest allowance. Sign in again to use your own.');
document.body.dataset.view = 'start';
// A book's own address opens straight into the reader (start.js boot opens the book).
if (urlHex()) { $('start').hidden = true; showReader(); waitStatus('Opening…') }
if (location.hash === '#read') history.replaceState(null, '', location.pathname + location.search);
window.dispatchEvent(new Event('tinct-reader-ready'));
