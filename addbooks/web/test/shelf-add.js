// A stand-in for the library's My shelf, served by serve.mjs at /__shelf-add: Add a book's
// start page is retired (2026-10-08), so own books are listed, added and removed on My shelf.
// This page uses the library's own code for it (library_2/add-to-tinct.js): the + beside the
// heading (syncShelfAdd) with the "Your own book" pop-up that adds a file in place with Add a
// book's engine, "My private uploads" (appendOwnShelf over the add engine's ownBooks), and the
// × that deletes an upload (confirmDeleteUpload + deleteUpload), as library_2/app.js wires them.
// Only the room around it (the scene, the search, the other shelves) is left out.
import { syncShelfAdd, appendOwnShelf, addEngine, confirmDeleteUpload, deleteUpload } from '/lab/library_2/add-to-tinct.js';

const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e };
// As boot.js does from the signed-in cookie: the page's account state.
document.documentElement.classList.toggle('signed-in', !!window.TinctAI?.session().userId);

let rendering = 0;
async function render() {
  const run = ++rendering;
  $('status').textContent = 'loading';
  syncShelfAdd($('shelf-head'), () => { $('status').textContent = 'search' });
  let list = [];
  try { list = document.documentElement.classList.contains('signed-in') ? await (await addEngine()).ownBooks() : [] } catch { list = [] }
  if (run !== rendering) return;
  const grid = $('collection-books');
  grid.replaceChildren();
  appendOwnShelf(grid, list, el, {
    onDelete: async (book, from) => {
      if (!await confirmDeleteUpload(book, { from })) return;
      $('status').textContent = 'removing';
      const gone = await deleteUpload(book).catch(() => false);
      if (!gone) $('notice').textContent = 'Removed from this device, but not from your account. Try again.';
      await render();
    },
  });
  $('status').textContent = 'ready';
}
render();
addEventListener('pageshow', e => { if (e.persisted) render() });
