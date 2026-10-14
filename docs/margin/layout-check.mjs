// Margin reader layout check. Run in a Playwright page after the reader (or a fixture) has rendered.
//
//   import { checkLayout } from './layout-check.mjs'
//   const problems = await checkLayout(page, { selectors })   // [] means clean
//
// It reports, per frame:
//   overflow   an element whose content is wider or taller than its box (text spilling out)
//   offscreen  a bar, menu, card or sheet that sticks out of its frame or the viewport
//   overlap    two cards, or a card and the column foot / stack row, whose boxes intersect
//   clipped    a text line cut off at a container edge (outside the allowed two-line fold)
//   squeezed   a control smaller than its minimum size (tap targets, bar height)
//
// Selectors default to the class names in margin-reference.css; pass your own map if the
// codebase renames them. `frame` is the element that bounds everything (the reader root);
// it defaults to the viewport.

export const DEFAULT_SELECTORS = {
  frame: null,
  bar: '.mr-bar, .mr-pbar',
  menu: '.mr-more, .mr-pmore, .mr-define',
  card: '.mr-card',
  foldedText: '.mr-card.is-folded .mr-card__text',
  stack: '.mr-stack',
  foot: '.mr-foot',
  sheet: '.mr-sheet',
  text: '.mr-card, .mr-card *, .mr-bar *, .mr-more *, .mr-define *, .mr-primer *, .mr-trigger *, .mr-sheet *, .mr-pbar *, .mr-pmore *',
  tap: '.mr-bar__item, .mr-pbar .mr-bar__item, .mr-more__row, .mr-pmore > div, .mr-card__close',
}

export async function checkLayout(page, { selectors = DEFAULT_SELECTORS, minTap = 28, tolerance = 1 } = {}) {
  return page.evaluate(({ S, minTap, tol }) => {
    const out = []
    const visible = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0 }
    const name = el => (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : el.tagName.toLowerCase()) + (el.textContent ? ` “${el.textContent.trim().slice(0, 40)}”` : '')
    const all = sel => sel ? [...document.querySelectorAll(sel)].filter(visible) : []
    const frames = S.frame ? all(S.frame) : [document.documentElement]
    const inter = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > tol && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > tol
    const vw = innerWidth, vh = innerHeight

    frames.forEach((frame, fi) => {
      const fr = S.frame ? frame.getBoundingClientRect() : { left: 0, top: 0, right: vw, bottom: vh }
      const within = sel => all(sel).filter(el => frame.contains(el))
      const tag = `frame ${fi}`

      // overflow: content wider/taller than box, unless the box scrolls on purpose
      within(S.text).forEach(el => {
        const cs = getComputedStyle(el)
        if (['auto', 'scroll'].includes(cs.overflowX) || ['auto', 'scroll'].includes(cs.overflowY)) return
        if (el.matches(S.foldedText)) return
        if (cs.display === 'inline' || el.clientWidth === 0) return
        if (el.scrollWidth - el.clientWidth > tol || el.scrollHeight - el.clientHeight > tol + 2)
          out.push({ kind: 'overflow', frame: tag, el: name(el), by: el.scrollWidth - el.clientWidth })
      })

      // clipped: a child whose box crosses an overflow:hidden ancestor's edge
      within(S.text).forEach(el => {
        if (el.children.length) return
        const r = el.getBoundingClientRect()
        for (let p = el.parentElement; p && p !== frame; p = p.parentElement) {
          const cs = getComputedStyle(p)
          if (cs.overflow === 'visible' || p.matches(S.foldedText)) continue
          const pr = p.getBoundingClientRect()
          if (r.right - pr.right > tol || pr.left - r.left > tol || r.bottom - pr.bottom > tol || pr.top - r.top > tol) { out.push({ kind: 'clipped', frame: tag, el: name(el), in: name(p) }); break }
        }
      })

      // offscreen: floating pieces must sit fully inside the frame and the viewport
      ;[S.bar, S.menu, S.card, S.sheet, S.stack].forEach(sel => within(sel).forEach(el => {
        const r = el.getBoundingClientRect()
        if (r.left < fr.left - tol || r.top < fr.top - tol || r.right > fr.right + tol || r.bottom > fr.bottom + tol)
          out.push({ kind: 'offscreen', frame: tag, el: name(el), rect: [r.left, r.top, r.right, r.bottom].map(Math.round) })
      }))

      // overlap: cards with each other, and with the stack row and the foot
      const blocks = [...within(S.card), ...within(S.stack), ...within(S.foot)]
      for (let i = 0; i < blocks.length; i++) for (let j = i + 1; j < blocks.length; j++) {
        if (blocks[i].contains(blocks[j]) || blocks[j].contains(blocks[i])) continue
        if (inter(blocks[i].getBoundingClientRect(), blocks[j].getBoundingClientRect())) out.push({ kind: 'overlap', frame: tag, a: name(blocks[i]), b: name(blocks[j]) })
      }
      // a menu may cover page text, but never another menu, bar or open card
      const floats = [...within(S.bar), ...within(S.menu)]
      for (let i = 0; i < floats.length; i++) for (let j = i + 1; j < floats.length; j++) {
        if (floats[i].contains(floats[j]) || floats[j].contains(floats[i])) continue
        if (inter(floats[i].getBoundingClientRect(), floats[j].getBoundingClientRect())) out.push({ kind: 'overlap', frame: tag, a: name(floats[i]), b: name(floats[j]) })
      }

      // squeezed: tap targets and bar height
      within(S.tap).forEach(el => { const r = el.getBoundingClientRect(); if (r.height < minTap - tol) out.push({ kind: 'squeezed', frame: tag, el: name(el), h: Math.round(r.height) }) })
    })
    return out
  }, { S: selectors, minTap, tol: tolerance })
}
