// The hero owns these gestures only while it is visible and no dialog is open.
// Shelves keep native scrolling; the returning book stage has its own swipe.
export function mountHeroNavigation({ hero, enabled, move }) {
  const editable = 'input,textarea,select,[contenteditable="true"]';
  const visible = () => {
    const r = hero.getBoundingClientRect();
    return enabled() && r.bottom > Math.min(innerHeight * .4, 280) && r.top < innerHeight;
  };
  addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !visible()) return;
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || event.target.closest?.(editable)) return;
    // Header controls, the librarian and shelf cards keep their own keyboard
    // behavior. The page background and focused hero can change its book.
    if (event.target !== document.body && event.target !== document.documentElement && !hero.contains(event.target)) return;
    event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
  });

  let gesture = null, suppressClickUntil = 0;
  hero.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.pointerType === 'mouse' || !visible()) return;
    if (event.target.closest(`${editable},.rt-stage,a,button:not(#hero-book)`)) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }, { passive: true });
  hero.addEventListener('pointerup', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    gesture = null;
    if (!visible() || Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    suppressClickUntil = performance.now() + 400;
    move(dx < 0 ? 1 : -1);
  });
  hero.addEventListener('pointercancel', () => { gesture = null; });
  hero.addEventListener('click', event => {
    // A horizontal swipe across the cover must not also open that book.
    if (event.isTrusted && performance.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
}
