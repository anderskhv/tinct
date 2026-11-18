// Removing a book from a shelf (Anders, 2026-10-09: "nicer and smoother ... like
// Apple apps in iOS"). The book fades and shrinks away, then every book after it
// glides into the gap instead of jumping there. FLIP: record each book's box
// (First), re-render (Last), move each book back to where it was with a
// transform (Invert), then let the transform go (Play).
//
// Interrupting is safe: a box is recorded as it is seen, mid-glide included, so
// a second removal (or a re-render) carries every book on from where it is.
// Reduced motion: no animation, the shelf simply shows its new order.
export const LEAVE_MS = 180;
export const MOVE_MS = 280;
// iOS-like ease-out: quick to start, long soft landing.
export const MOVE_EASE = 'cubic-bezier(.2,.8,.2,1)';

export function reducedMotion() {
  try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

/** First: each keyed element's box as it is on screen now (mid-glide included). */
export function recordRects(elements, keyOf) {
  const rects = new Map();
  for (const el of elements) {
    const key = keyOf(el);
    if (key != null && key !== '' && !rects.has(key)) rects.set(key, el.getBoundingClientRect());
  }
  return rects;
}

/**
 * Last, Invert, Play: each element whose key was recorded starts where it was
 * and glides to where it now is. Inline transform and transition are cleared
 * when the glide ends (or at once with reduced motion). Returns the elements
 * that moved and a `done` promise.
 */
export function playFlip(elements, before, keyOf, { duration = MOVE_MS, easing = MOVE_EASE, reduced = reducedMotion() } = {}) {
  const moved = [];
  const list = [...elements];
  // Measure the destination without any earlier glide's transform.
  for (const el of list) if (el.__flip) { clearTimeout(el.__flip.timer); el.__flip.resolve(); el.__flip = null; el.style.transition = 'none'; el.style.transform = ''; }
  if (reduced) return { moved, done: Promise.resolve() };
  for (const el of list) {
    const first = before.get(keyOf(el));
    if (!first) continue;
    const last = el.getBoundingClientRect();
    const dx = first.left - last.left, dy = first.top - last.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
    // Inside a scaled scene (the shelf study's world) a screen pixel is not a local one.
    const scale = el.offsetWidth && last.width ? last.width / el.offsetWidth : 1;
    el.style.transition = 'none';
    el.style.transform = `translate(${(dx / scale).toFixed(1)}px,${(dy / scale).toFixed(1)}px)`;
    moved.push(el);
  }
  if (!moved.length) return { moved, done: Promise.resolve() };
  // One reflow commits every inverted position before the glide starts.
  void moved[0].offsetWidth;
  const done = Promise.all(moved.map(el => new Promise(resolve => {
    // An interrupted glide settles its promise when the next one takes the card over.
    const token = { timer: 0, resolve };
    el.__flip = token;
    el.style.transition = `transform ${duration}ms ${easing}`;
    el.style.transform = '';
    token.timer = setTimeout(() => {
      if (el.__flip === token) { el.__flip = null; el.style.transition = ''; el.style.transform = ''; }
      resolve();
    }, duration + 40);
  })));
  return { moved, done };
}

/**
 * The leaving book: no longer a target at once, then faded and shrunk away.
 * `transform` is the element's own transform, kept under the shrink.
 */
export function fadeOut(el, { duration = LEAVE_MS, reduced = reducedMotion(), transform = '', faces = null } = {}) {
  el.style.pointerEvents = 'none';
  el.setAttribute('aria-hidden', 'true');
  try { el.inert = true; } catch {}
  if (reduced) return Promise.resolve();
  const targets = faces ? [...faces] : [el];
  el.style.transition = `transform ${duration}ms ease-in${faces ? '' : `, opacity ${duration}ms ease-in`}`;
  el.style.transform = `${transform} scale(.86)`.trim();
  // A 3D book fades face by face: opacity on the box itself would flatten it.
  for (const face of targets) { if (face !== el) face.style.transition = `opacity ${duration}ms ease-in`; face.style.opacity = '0'; }
  return new Promise(resolve => setTimeout(resolve, duration));
}

/** The leaving book as it ends, for a re-render while it is still fading out. */
export function markGone(el) {
  el.style.pointerEvents = 'none';
  el.style.opacity = '0';
  el.style.transform = 'scale(.86)';
  el.setAttribute('aria-hidden', 'true');
  try { el.inert = true; } catch {}
}
