'use strict';
// Tinct · adding your own book (PDF or EPUB): the engine shared by Add a book's reader
// (reader.js, which reads PDFs) and the library's "Your own book" pop-up on My shelf
// (library_2/add-to-tinct.js), so a file is kept, confirmed, named and saved to the
// account the same way wherever it is chosen. Needs tinct-api.js (window.TinctAI) and,
// for EPUBs, epub.js (window.TinctEpub). No page UI here: messages go to `notify`.
(function (global) {
  const STORE_PREFIX = 'tinct-addbook:';
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(STORE_PREFIX + k)) } catch { return null } },
    set(k, v) { try { localStorage.setItem(STORE_PREFIX + k, JSON.stringify(v)) } catch {} },
    del(k) { try { localStorage.removeItem(STORE_PREFIX + k) } catch {} },
  };
  const quiet = () => {};

  /* ---------- Your books ---------- */
  // Files are kept in this browser (IndexedDB), tagged with the Tinct account that opened
  // them so a different reader on the same browser does not see them. Signed in, each is
  // also kept privately in that account (below, `cloud`) so it opens on other devices.
  const owner = () => global.TinctAI?.session().userId || 'guest';
  const library = {
    open() { return new Promise((res, rej) => { const r = indexedDB.open('tinct-addbook', 1); r.onupgradeneeded = () => r.result.createObjectStore('books', { keyPath: 'key' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) }) },
    async tx(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction('books', mode); const out = fn(t.objectStore('books')); t.oncomplete = () => res(out?.result ?? out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error) }) },
    async put(rec) { try { await this.tx('readwrite', s => s.put(rec)); return true } catch { return false } },
    async get(key) { try { const rec = await this.tx('readonly', s => s.get(key)); return rec && rec.owner === owner() ? rec : null } catch { return null } },
    async remove(key) { try { await this.tx('readwrite', s => s.delete(key)) } catch {} },
    async list() {
      try { const all = await this.tx('readonly', s => s.getAll()); return (all || []).filter(r => r.owner === owner()).map(({ bytes, edition, ...r }) => r).sort((a, b) => (b.openedAt || 0) - (a.openedAt || 0)) }
      catch { return [] }
    },
    // Read and write in one transaction, so concurrent patches (title, cloud id) both land.
    async touch(key, patch) { try { await this.tx('readwrite', s => { const r = s.get(key); r.onsuccess = () => { const rec = r.result; if (rec && rec.owner === owner()) s.put(Object.assign(rec, patch)) } }) } catch {} },
  };
  // The account's copies (/api/user-books via TinctAI.books), keyed like the local records:
  // kind + ':' + the first 24 hex digits of the file's SHA-256.
  const cloud = {
    owner: null, records: new Map(), busy: new Set(),
    keyOf: b => b.type + ':' + String(b.sha256 || '').slice(0, 24),
    usable: () => !!global.TinctAI?.session().token,
    mine() { if (this.owner !== owner()) { this.owner = owner(); this.records = new Map() } return this.records },
    get(key) { return this.mine().get(key) || null },
    async refresh() {
      if (!this.usable()) return false;
      try { const list = await global.TinctAI.books.list(); const m = this.mine(); m.clear(); for (const b of list) if (b.sha256) m.set(this.keyOf(b), b); return true }
      catch { return false }
    },
  };
  // Saves a private copy to the account in the background; quiet on reopen retries.
  async function saveToAccount(key, file, meta, { quiet: silent = false, notify = quiet } = {}) {
    if (!cloud.usable() || cloud.busy.has(key)) return;
    const known = cloud.get(key);
    if (known) { await library.touch(key, { cloudId: known.id }); return }
    if (file.size > global.TinctAI.books.maxBytes) { if (!silent) notify('Kept on this device only: files over 50 MB are not saved to your account.'); return }
    cloud.busy.add(key);
    try {
      const book = await global.TinctAI.books.upload(file, Object.assign({ rights: store.get('rights:' + accountId()) }, meta));
      if (book?.sha256) cloud.get(key) || cloud.mine().set(cloud.keyOf(book), book);
      await library.touch(key, { cloudId: book?.id || null });
      if (!silent) notify('Saved to your account.');
    } catch (e) {
      if (!silent && e?.code === 'account_full') notify('Kept on this device only: your account’s storage for books is full.');
    } finally { cloud.busy.delete(key) }
  }
  // Every book on the shelf: this device's, plus the account's copies not yet on it.
  async function shelf() {
    const local = await library.list();
    const here = new Set(local.map(r => r.key));
    const out = local.map(r => Object.assign(r, { cloud: !!(r.cloudId || cloud.get(r.key)), local: true }));
    for (const [key, b] of cloud.mine()) {
      if (here.has(key)) continue;
      out.push({ key, kind: b.type, name: b.name, title: b.title || b.name || 'Untitled', author: b.author || '', size: b.size, addedAt: Date.parse(b.createdAt) || 0, cloud: true, local: false });
    }
    return out.sort((a, b) => (b.openedAt || b.addedAt || 0) - (a.openedAt || a.addedAt || 0));
  }
  // Removes a book from this device and from the account.
  async function removeBook(key, { notify = quiet } = {}) {
    const rec = await library.get(key);
    const id = rec?.cloudId || cloud.get(key)?.id;
    await library.remove(key);
    store.del('place:' + key.replace(/^epub:/, ''));
    if (!id) return true;
    try { await global.TinctAI.books.remove(id); cloud.mine().delete(key); return true }
    catch { notify('Removed from this device, but not from your account. Try again.'); return false }
  }

  /* ---------- Adding a file ---------- */
  // Opening your own file needs a Tinct account. The rights confirmation is asked once per
  // account, before its first file opens; the key sits under tinct-addbook:, so signing out
  // clears it with the rest. RIGHTS_VERSION names this wording: a confirmation of an earlier
  // wording is asked again, and each upload records which wording was confirmed, and when.
  const RIGHTS_COPY = "I have the right to add this file and to read and listen to it in Tinct, including with its AI features. I'm responsible for what I upload and share (Terms §4).";
  const RIGHTS_VERSION = '2026-10-08.2';
  const accountId = () => global.TinctAI?.session().userId || null;
  const rightsConfirmed = () => store.get('rights:' + accountId())?.v === RIGHTS_VERSION;
  const confirmRights = () => store.set('rights:' + accountId(), { at: new Date().toISOString(), v: RIGHTS_VERSION });
  const kindOf = file => /\.epub$/i.test(file.name) || file.type === 'application/epub+zip' ? 'epub' : /\.pdf$/i.test(file.name) || file.type === 'application/pdf' ? 'pdf' : null;
  async function digest(bytes) {
    try { const h = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(h)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('') }
    catch { return String(bytes.byteLength) }
  }
  const MAX_BYTES = 300 * 1024 * 1024;
  // As reader.js names a file it opens.
  const nameTitle = name => String(name || '').replace(/\.(pdf|epub)$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || String(name || '');
  /** A chosen file read for keeping: {kind, bytes, key}, or {error} with the reader-facing message. */
  async function readFile(file) {
    const kind = file ? kindOf(file) : null;
    if (!kind) return { error: 'Choose a PDF or EPUB file.' };
    if (file.size > MAX_BYTES) return { error: 'That file is larger than 300 MB, too big to open here.' };
    const bytes = new Uint8Array(await file.arrayBuffer());
    return { kind, bytes, key: kind + ':' + await digest(bytes) };
  }
  /** Keep the file in this browser, opened now. Resolves true when it is kept. */
  async function keepFile(file, { kind, bytes, key }, title = nameTitle(file.name)) {
    const now = Date.now();
    const existing = await library.get(key);
    return library.put({ key, kind, name: file.name, size: file.size, title: existing?.title || title, author: existing?.author || '', owner: owner(), addedAt: existing?.addedAt || now, openedAt: now, bytes: bytes.slice().buffer });
  }
  // Waiting for the account copy before leaving the page is bounded: a slow upload finishes on the next open.
  const ACCOUNT_COPY_WAIT_MS = 10000;
  /**
   * An EPUB kept on this device, ready for the Tinct reader: refuse what it cannot open (DRM,
   * not an EPUB: throws with the reader-facing message), name the book and keep its full-size
   * cover on the record, and send the account copy (bounded). Resolves the reader's URL.
   */
  async function prepareEpub(bytes, name, key, upload, { quiet: silent = false, notify = quiet } = {}) {
    let meta;
    try { meta = await global.TinctEpub.metadata(bytes, { fallbackTitle: name.replace(/\.epub$/i, '') }) }
    catch (e) { throw Object.assign(new Error(e?.code === 'drm' || e?.code === 'unsupported' || e?.code === 'bad_epub' || e?.code === 'not_zip' ? e.message : 'This file could not be opened as an EPUB. Choose another file.'), { code: e?.code || 'bad_epub' }) }
    const author = meta.authors.join(', ');
    // The cover at full size (coverV 2); a book kept with the old 180 px thumbnail is redrawn here, on its next open.
    await library.touch(key, { title: meta.title, author, coverV: 2, ...(meta.cover ? { cover: meta.cover, coverW: meta.coverWidth } : {}) });
    if (upload) await Promise.race([saveToAccount(key, upload, { kind: 'epub', name, title: meta.title, author }, { quiet: silent, notify }), new Promise(r => setTimeout(r, ACCOUNT_COPY_WAIT_MS))]);
    return { title: meta.title, author, href: '/reader?userBook=' + encodeURIComponent(key.slice('epub:'.length)) };
  }
  /** A PDF kept on this device: the account copy (bounded), then where it opens (Add a book's PDF reader). */
  async function preparePdf(file, key, { quiet: silent = false, notify = quiet } = {}) {
    await Promise.race([saveToAccount(key, file, { kind: 'pdf', name: file.name, title: nameTitle(file.name), author: '' }, { quiet: silent, notify }), new Promise(r => setTimeout(r, ACCOUNT_COPY_WAIT_MS))]);
    return { href: pdfHref(key) };
  }
  /** Where a kept PDF (or an account copy not yet on this device) opens. */
  const pdfHref = key => '/lab/addbook/?open=' + encodeURIComponent(key);

  global.TinctAddEngine = {
    store, owner, library, cloud, saveToAccount, shelf, removeBook,
    RIGHTS_COPY, RIGHTS_VERSION, accountId, rightsConfirmed, confirmRights,
    kindOf, digest, MAX_BYTES, nameTitle, readFile, keepFile, prepareEpub, preparePdf, pdfHref, ACCOUNT_COPY_WAIT_MS,
  };
})(window);
