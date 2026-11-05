// Sign-in names why you are here (approved S1/S3 mockups, 5 Nov 2026). Arriving from /byob
// with a chosen file (returnTo …own=file): "Sign in to add your book" and the file itself,
// read from this browser's handoff without taking it, so the library still opens it after
// sign-in. Pasted text: "Sign in to add your text". Anything else keeps "Sign in to Tinct".
import { peekHandoff } from '/lab/addbook/js/file-handoff.js';
import { paperCoverUrl } from '/lab/book-cover.js';

const root = document.getElementById('tinct-lab-sign-in');
const title = root?.querySelector('[data-signin-title]');
const copy = root?.querySelector('[data-signin-copy]');
const chip = root?.querySelector('[data-signin-file]');

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

async function apply() {
  if (!root || !title || !copy) return;
  const own = ownFromReturnTo();
  if (own === 'paste') {
    title.textContent = 'Sign in to add your text';
    copy.textContent = 'Your text opens in Tinct as soon as you are in.';
    return;
  }
  if (own !== 'file') return;
  title.textContent = 'Sign in to add your book';
  copy.textContent = 'Your book opens as soon as you are in.';
  const file = await peekHandoff();
  if (!file || !chip) return;
  const ext = (String(file.name).match(/\.([a-z0-9]{1,5})$/i)?.[1] || '').toUpperCase();
  chip.querySelector('b').textContent = file.name || 'Your file';
  const img = chip.querySelector('img');
  const url = paperCoverUrl(titleFromName(file.name), '', ext);
  if (url) img.src = url; else img.remove();
  copy.hidden = true;
  chip.hidden = false;
}

void apply();
