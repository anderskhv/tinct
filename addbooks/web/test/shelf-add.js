// A stand-in for the library's My shelf "+" pop-up (library_2/add-to-tinct.js addFile), served by
// serve.mjs at /__shelf-add: Add a book's start page is retired (2026-10-08), so a file is now
// added on My shelf with the shared engine (add-engine.js) and opened at the address it returns.
// The rights confirmation is the engine's own (confirmed here as the pop-up's checkbox would).
const input = document.getElementById('file');
input.onchange = async () => {
  const file = input.files?.[0];
  if (!file) return;
  const engine = window.TinctAddEngine;
  const read = await engine.readFile(file);
  if (read.error) { document.getElementById('status').textContent = read.error; return }
  if (!engine.rightsConfirmed()) engine.confirmRights();
  if (!await engine.keepFile(file, read)) { document.getElementById('status').textContent = 'unkept'; return }
  const opened = read.kind === 'epub' ? await engine.prepareEpub(read.bytes, file.name, read.key, file) : await engine.preparePdf(file, read.key);
  location.assign(opened.href);
};
document.getElementById('status').textContent = 'ready';
