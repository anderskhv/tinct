// Tinct · Add a book. The start page is gone (owner, 2026-10-08): your own books and adding
// one live on the library's My shelf ("My private uploads" and its + pop-up, which keeps and
// opens a file in place with add-engine.js). What remains here is the PDF reader (reader.js):
// route.js sends every other visit to My shelf before the page draws, and this file opens the
// one book a link names, or takes an older link's handed-over file, then returns to My shelf.
import { HANDOFF_PARAM, takeHandoff } from './file-handoff.js?v=20261008rel8';

const params = new URLSearchParams(location.search);
export const MY_SHELF = '/library#my-shelf';
const toShelf = () => location.replace(MY_SHELF);
// Opening your own book needs a Tinct account: sign-in returns to this same link.
const signInHref = () => `/sign-in?returnTo=${encodeURIComponent('/lab/addbook/' + location.search)}`;

window.TinctStart = {
  // Closing a book (Back) returns to My shelf.
  show() { toShelf() },
  hide() { document.getElementById('start').hidden = true },
  showGate() { location.assign(signInHref()) },
};

async function boot() {
  // /lab/addbook/?open=<key>: one kept book (a PDF, or an account copy not on this device yet).
  const open = params.get('open');
  if (open) {
    if (!window.TinctAI?.session().userId) { location.replace(signInHref()); return }
    await window.TinctReader.cloud.refresh();
    // A book that cannot open says why (reader.js), then the reader is back on My shelf.
    if (!await window.TinctReader.openStored(open)) setTimeout(toShelf, 2500);
    return;
  }
  // An older link from the library's pop-up (?mode=file&handoff=1): the same steps as a file chosen here.
  if (params.has(HANDOFF_PARAM)) {
    params.delete(HANDOFF_PARAM);
    history.replaceState(history.state, '', location.pathname + (params.toString() ? '?' + params : '') + location.hash);
    const file = await takeHandoff();
    if (file) await window.TinctReader.chooseFile(file);
    if (document.body.dataset.view !== 'reader') toShelf();
    return;
  }
  toShelf();
}
if (window.TinctReader) boot(); else addEventListener('tinct-reader-ready', boot, { once: true });
