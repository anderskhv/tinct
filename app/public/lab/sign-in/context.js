// Sign-in names why you are here (approved S1/S3 mockups and the paste flow's 03, 5 Nov 2026). Arriving
// from /byob (returnTo …own=file|paste, the Preparing page or the library): with a chosen file, "Sign in to
// add your book" and the file itself; with pasted text, "Sign in to add your text" and the text by its
// title. Both are read from this browser's handoff without taking them, so the Preparing page still adds
// them after sign-in. A file also carries the rights line ("By continuing you confirm you may read this
// file."). Anything else keeps "Sign in to Tinct".
import { peekHandoff, peekPasteHandoff } from '/lab/addbook/js/file-handoff.js';
import { paperCoverUrl } from '/lab/book-cover.js';

const root = document.getElementById('tinct-lab-sign-in');
const title = root?.querySelector('[data-signin-title]');
const copy = root?.querySelector('[data-signin-copy]');
const chip = root?.querySelector('[data-signin-file]');
const rights = root?.querySelector('[data-signin-rights]');

function ownFromReturnTo() {
  try {
    const value = new URLSearchParams(location.search).get('returnTo') || '';
    return new URL(value, location.origin).searchParams.get('own');
  } catch { return null }
}

function titleFromName(name) {
  return String(name || '').replace(/\.[a-z0-9]{1,5}$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^./, c => c.toUpperCase()) || 'Your book';
}

function showChip(name, coverUrl) {
  if (!chip) return;
  chip.querySelector('b').textContent = name;
  const img = chip.querySelector('img');
  if (coverUrl) img.src = coverUrl; else img.remove();
  copy.hidden = true;
  chip.hidden = false;
}

async function apply() {
  if (!root || !title || !copy) return;
  const own = ownFromReturnTo();
  if (own === 'paste') {
    title.textContent = 'Sign in to add your text';
    copy.textContent = 'Your text opens in Tinct as soon as you are in.';
    const draft = await peekPasteHandoff();
    if (draft) showChip(draft.title || 'Pasted text', paperCoverUrl(draft.title || 'Pasted text', draft.author || '', ''));
    return;
  }
  if (own !== 'file') return;
  title.textContent = 'Sign in to add your book';
  copy.textContent = 'Your book opens as soon as you are in.';
  if (rights) rights.hidden = false;
  const file = await peekHandoff();
  if (!file) return;
  const ext = (String(file.name).match(/\.([a-z0-9]{1,5})$/i)?.[1] || '').toUpperCase();
  showChip(file.name || 'Your file', paperCoverUrl(titleFromName(file.name), '', ext));
}

void apply();
