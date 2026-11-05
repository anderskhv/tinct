// A file chosen in the library ("Add a PDF or EPUB" pop-up) handed to Add a book's own
// upload flow (reader.js chooseFile): the library keeps the File for a moment in this
// browser's IndexedDB, opens /lab/addbook/?mode=file&handoff=1, and Add a book takes it
// (deleting it) and continues exactly as if the reader had chosen it there. Nothing
// leaves the device here; a handoff not taken within HANDOFF_TTL_MS is ignored and deleted.
const DB = 'tinct-addbook-handoff';
const STORE = 'file';
const KEY = 'pending';
// Text pasted on /byob (5 Nov 2026): kept beside a chosen file, under its own key, with the same
// lifetime, until the Preparing page (/preparing) adds it after sign-in. Never sent anywhere from here.
const PASTE_KEY = 'paste';
export const HANDOFF_PARAM = 'handoff';
// 30 minutes (5 Nov 2026): a file chosen on /byob waits through sign-in, and an emailed code can take minutes.
export const HANDOFF_TTL_MS = 30 * 60 * 1000;

function open() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function run(mode, act) {
  return open().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = act(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(request?.result) };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error) };
  }));
}

/** Keep `file` for Add a book to take. Resolves true when it is kept. `extra` rides along ({ rights: true }: the line was shown). */
export async function putHandoff(file, extra = {}) {
  try { await run('readwrite', store => store.put({ ...extra, file, at: Date.now() }, KEY)); return true }
  catch { return false }
}
const fresh = (record, now) => !!record && now - record.at >= 0 && now - record.at < HANDOFF_TTL_MS;

/** The whole kept record ({ file, at, rights? }) without taking it, or null. */
export async function peekHandoffEntry(now = Date.now()) {
  try {
    const record = await run('readonly', store => store.get(KEY));
    return record?.file && fresh(record, now) ? record : null;
  } catch { return null }
}

/** Keep pasted text ({ html, title, author, uid }) on this device for /preparing. Resolves true when it is kept. */
export async function putPasteHandoff(draft) {
  try { await run('readwrite', store => store.put({ ...draft, at: Date.now() }, PASTE_KEY)); return true }
  catch { return false }
}

/** The kept pasted text without taking it (sign-in names it; /byob and the library show it again), or null. */
export async function peekPasteHandoff(now = Date.now()) {
  try {
    const record = await run('readonly', store => store.get(PASTE_KEY));
    return record && typeof record.html === 'string' && fresh(record, now) ? record : null;
  } catch { return null }
}

/** Forget the kept pasted text (once it is in the account). */
export async function clearPasteHandoff() {
  try { await run('readwrite', store => store.delete(PASTE_KEY)); return true }
  catch { return false }
}

/** The handed-over File (once: it is deleted as it is taken), or null. */
export async function takeHandoff(now = Date.now()) {
  try {
    const record = await run('readonly', store => store.get(KEY));
    if (record) await run('readwrite', store => store.delete(KEY));
    if (!record?.file || !fresh(record, now)) return null;
    return record.file;
  } catch { return null }
}

/** The handed-over File without taking it (sign-in shows its name), or null. */
export async function peekHandoff(now = Date.now()) {
  try {
    const record = await run('readonly', store => store.get(KEY));
    if (!record?.file || !(now - record.at >= 0 && now - record.at < HANDOFF_TTL_MS)) return null;
    return record.file;
  } catch { return null }
}
