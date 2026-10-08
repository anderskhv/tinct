// A file chosen in the library ("Add a PDF or EPUB" pop-up) handed to Add a book's own
// upload flow (reader.js chooseFile): the library keeps the File for a moment in this
// browser's IndexedDB, opens /lab/addbook/?mode=file&handoff=1, and Add a book takes it
// (deleting it) and continues exactly as if the reader had chosen it there. Nothing
// leaves the device here; a handoff not taken within HANDOFF_TTL_MS is ignored and deleted.
const DB = 'tinct-addbook-handoff';
const STORE = 'file';
const KEY = 'pending';
export const HANDOFF_PARAM = 'handoff';
export const HANDOFF_TTL_MS = 2 * 60 * 1000;

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

/** Keep `file` for Add a book to take. Resolves true when it is kept. */
export async function putHandoff(file) {
  try { await run('readwrite', store => store.put({ file, at: Date.now() }, KEY)); return true }
  catch { return false }
}

/** The handed-over File (once: it is deleted as it is taken), or null. */
export async function takeHandoff(now = Date.now()) {
  try {
    const record = await run('readonly', store => store.get(KEY));
    if (record) await run('readwrite', store => store.delete(KEY));
    if (!record?.file || !(now - record.at >= 0 && now - record.at < HANDOFF_TTL_MS)) return null;
    return record.file;
  } catch { return null }
}
