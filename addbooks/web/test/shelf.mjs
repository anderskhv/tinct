// My shelf in the browser tests: own books are listed, added and removed on the library's My
// shelf now that Add a book's start page is retired (2026-10-08). serve.mjs stands it in at
// /__shelf-add with the library's own code for it (shelf-add.js); these helpers drive it.
export const SHELF_PATH = '/__shelf-add';
export const SESSION_KEY = 'sb-yazjyiqsxjystvpkyouk-auth-token';
const onShelf = p => { try { return new URL(p.url()).pathname === SHELF_PATH } catch { return false } };

/** My shelf, drawn (its own books listed). */
export async function openShelf(p, origin) {
  await p.goto(new URL(SHELF_PATH, origin).href);
  await shelfReady(p);
}
export async function shelfReady(p) {
  await p.waitForFunction(() => document.getElementById('status')?.textContent === 'ready', null, { timeout: 30000 });
}
/** A Tinct session as tinct.app stores it, then My shelf again. `expired`: the token has lapsed. */
export async function shelfSignIn(p, origin, { expired = false, token = 'test-token', user = 'u-test' } = {}) {
  if (!onShelf(p)) await p.goto(new URL(SHELF_PATH, origin).href);
  await p.evaluate(([key, expired, token, user]) => localStorage.setItem(key, JSON.stringify({ access_token: token, refresh_token: 'refresh-' + token, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + (expired ? -60 : 3600), user: { id: user, email: 'reader@example.com' } })), [SESSION_KEY, expired, token, user]);
  await p.reload();
  await shelfReady(p);
}
/** My shelf's + : the "Your own book" pop-up, at its file step. */
export async function openPopUp(p, origin) {
  if (!onShelf(p)) await openShelf(p, origin);
  await p.click('#shelf-head .shelf-add');
  await p.waitForSelector('[data-testid="own-file-dialog"] .tui-dialog[data-step="choose"]', { timeout: 10000 });
}
/** What the pop-up's rights step shows. */
export const rightsShown = p => p.evaluate(() => {
  const box = document.querySelector('[data-testid="own-file-dialog"] .tui-dialog');
  return {
    step: box?.dataset.step, title: box?.querySelector('h2')?.textContent, text: box?.querySelector('.own-file-rights span')?.textContent.trim(),
    intro: box?.querySelector('.own-file-rights-intro')?.textContent.trim(), button: box?.querySelector('.own-file-continue')?.textContent.trim(),
    disabled: box?.querySelector('.own-file-continue')?.disabled, overShelf: location.pathname === '/__shelf-add' && !!document.getElementById('collection'),
  };
});
/**
 * Add a file with My shelf's + pop-up. Returns what the rights confirmation showed (then
 * confirmed, unless `confirm` is false), or null when it was not asked. Resolves once the
 * pop-up has moved on: the book's page, the rights step (not confirmed) or its message.
 */
export async function addFile(p, origin, file, { confirm = true } = {}) {
  await openPopUp(p, origin);
  const chooser = p.waitForEvent('filechooser');
  await p.click('[data-testid="own-file-dialog"] .own-file-choose');
  await (await chooser).setFiles(file);
  const left = p.waitForURL(url => url.pathname !== SHELF_PATH, { timeout: 60000 }).then(() => 'left', () => null);
  const rights = p.waitForSelector('[data-testid="own-file-dialog"] .tui-dialog[data-step="rights"]', { timeout: 60000 }).then(() => 'rights', () => null);
  const message = p.waitForSelector('[data-testid="own-file-dialog"] .own-file-message', { timeout: 60000 }).then(() => 'message', () => null);
  const first = await Promise.race([left, rights, message]);
  if (first !== 'rights') return null;
  const shown = await rightsShown(p);
  if (!confirm) return shown;
  await p.check('[data-testid="own-file-dialog"] .own-file-rights-box');
  await p.click('[data-testid="own-file-dialog"] .own-file-continue');
  return shown;
}
/** My shelf's "My private uploads": each upload's title, line under it, key and link. */
export const uploads = p => p.$$eval('[data-shelf-group="own"]', cards => cards.map(card => ({
  key: card.dataset.ownKey, title: card.querySelector('h2')?.textContent, by: card.querySelector('p')?.textContent, href: card.querySelector('a')?.getAttribute('href'),
  cover: card.querySelector('img.own-cover-image')?.naturalWidth || 0,
})));
