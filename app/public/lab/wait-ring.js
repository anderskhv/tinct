/*
 * The one wait indicator for the plain-JS pages (the library, Add a book): the
 * reader's Play-button ring (src/lab/LabWait.tsx draws the same one in React).
 *
 * - It sits on the control that was tapped or in the exact area that is loading;
 *   never a popup or toast.
 * - It appears only after DELAY_MS, so quick work never flashes it.
 * - The wait's existing wording stays for assistive technology only (`role="status"`,
 *   visually hidden); nothing new is read on screen.
 * - Static under prefers-reduced-motion. Errors keep their own text and surface.
 *
 * A classic script: it defines `TinctWait` for the library's modules and Add a
 * book's reader alike, so it is loaded once in each page's head.
 */
(function (root) {
  'use strict';
  var DELAY_MS = 150;
  var SVG = 'http://www.w3.org/2000/svg';
  var STYLE_ID = 'tinct-wait-style';
  var CSS = [
    '.tinct-wait{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;min-width:var(--tinct-wait-size,21px);min-height:max(var(--tinct-wait-size,21px),1.4em);color:inherit}',
    '.tinct-wait .tinct-wait-ring{display:block;flex:none;width:var(--tinct-wait-size,21px);height:var(--tinct-wait-size,21px);fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;animation:tinct-wait-spin .9s linear infinite}',
    '@keyframes tinct-wait-spin{to{transform:rotate(360deg)}}',
    '@media(prefers-reduced-motion:reduce){.tinct-wait .tinct-wait-ring{animation:none}}',
    '.tinct-wait-label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',
    '.is-waiting{pointer-events:none}',
  ].join('\n');

  function ensureStyle(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    var style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(style);
  }

  /** The ring alone (decorative): the same arc as the reader's LoadingIcon. */
  function ringIcon(size, doc) {
    doc = doc || document;
    var svg = doc.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'tinct-wait-ring');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', String(size || 21));
    svg.setAttribute('height', String(size || 21));
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    var path = doc.createElementNS(SVG, 'path');
    path.setAttribute('d', 'M12 3a9 9 0 1 1-8.1 5.1');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
    return svg;
  }

  /**
   * A wait in place: an element that holds the ring's box at once and shows the
   * ring, with `label` for screen readers, after `delayMs`. `setLabel(text)`
   * updates the hidden wording (progress); `cancel()` stops a pending ring.
   */
  function waitRing(label, options) {
    options = options || {};
    var doc = options.document || document;
    var size = options.size || 21;
    var delayMs = options.delayMs == null ? DELAY_MS : options.delayMs;
    ensureStyle(doc);
    var el = doc.createElement('span');
    el.className = 'tinct-wait';
    // `live: false` inside a parent that is already a live region (role="status" / aria-live).
    if (options.live !== false) { el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); }
    el.dataset.wait = 'pending';
    el.style.setProperty('--tinct-wait-size', size + 'px');
    var text = String(label || '');
    var labelNode = doc.createElement('span');
    labelNode.className = 'tinct-wait-label';
    var timer = 0;
    function show() {
      timer = 0;
      labelNode.textContent = text;
      el.replaceChildren(ringIcon(size, doc), labelNode);
      el.dataset.wait = 'shown';
      el.setAttribute('aria-busy', 'true');
    }
    if (delayMs > 0) timer = setTimeout(show, delayMs); else show();
    el.setLabel = function (next) { text = String(next || ''); if (el.dataset.wait === 'shown') labelNode.textContent = text; };
    el.cancel = function () { if (timer) { clearTimeout(timer); timer = 0; } };
    return el;
  }

  /**
   * A wait on a control (a button, a row): after `delayMs` its content gives way
   * to the ring, its width kept so nothing jumps; `aria-busy` at once. The
   * returned function restores it. Nothing happens for a missing control.
   */
  function waitOn(control, label, options) {
    if (!control) return function () {};
    options = options || {};
    var size = options.size || 15;
    var delayMs = options.delayMs == null ? DELAY_MS : options.delayMs;
    var done = false, kept = null, width = '';
    function show() {
      timer = 0;
      if (done) return;
      var w = control.offsetWidth;
      if (w) { width = control.style.width; control.style.width = w + 'px'; }
      kept = Array.prototype.slice.call(control.childNodes);
      control.replaceChildren(waitRing(label, { size: size, delayMs: 0, document: control.ownerDocument }));
      control.classList.add('is-waiting');
    }
    var timer = delayMs > 0 ? setTimeout(show, delayMs) : (show(), 0);
    control.setAttribute('aria-busy', 'true');
    return function restore() {
      if (done) return;
      done = true;
      if (timer) clearTimeout(timer);
      control.removeAttribute('aria-busy');
      if (kept) {
        control.replaceChildren.apply(control, kept);
        control.style.width = width;
        control.classList.remove('is-waiting');
      }
    };
  }

  root.TinctWait = { DELAY_MS: DELAY_MS, ringIcon: ringIcon, waitRing: waitRing, waitOn: waitOn };
})(typeof globalThis !== 'undefined' ? globalThis : window);
