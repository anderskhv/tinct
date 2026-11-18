// Observable contracts from the final d8b667e reader, not a copy of its layout implementation.
import assert from 'node:assert/strict'
export async function settlePaint(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}
export async function sourceRailGeometry(page, host) {
  const rail = host.getByTestId('source-margin-rail')
  await rail.waitFor()
  const ownership = await host.evaluate(host => {
    const rail = host.querySelector('[data-testid="source-margin-rail"]')
    return { inside: !!rail && host.contains(rail), hostScroll: host.scrollHeight, hostHeight: host.clientHeight,
      position: rail && getComputedStyle(rail).position }
  })
  assert(ownership.inside && ownership.position !== 'fixed', `source rail belongs to the source scroller: ${JSON.stringify(ownership)}`)
  const boxes = await rail.getByTestId('source-margin-item').evaluateAll(items => items.map(item => {
    const box = item.getBoundingClientRect(), style = getComputedStyle(item)
    return { radius: style.borderRadius, background: style.backgroundColor, shadow: style.boxShadow, borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth], id: item.dataset.cardId, sourceOrder: Number(item.dataset.sourceOrder), open: item.dataset.open === 'true', top: box.top, bottom: box.bottom, left: box.left, right: box.right }
  }))
  for (const box of boxes) {
    assert.equal(box.radius, '0px', 'source cards retain straight rules')
    assert(['transparent', 'rgba(0, 0, 0, 0)'].includes(box.background) && box.shadow === 'none', 'source cards have no filled or shadowed box surface')
    assert(box.borders.every(width => width === '0px'), 'source card only uses its source-side rule')
  }
  const fields = await rail.locator('.lab-pcard-follow-box').evaluateAll(nodes => nodes.map(node => { const style = getComputedStyle(node); return {
    radius: style.borderRadius, fill: style.backgroundColor, shadow: style.boxShadow,
    sides: [style.borderTopWidth, style.borderRightWidth, style.borderLeftWidth], bottom: Number.parseFloat(style.borderBottomWidth),
  } }))
  for (const field of fields) assert(field.radius === '0px' && ['transparent', 'rgba(0, 0, 0, 0)'].includes(field.fill)
    && field.shadow === 'none' && field.sides.every(width => width === '0px') && field.bottom > 0,
    `embedded follow-up is a straight writing rule: ${JSON.stringify(field)}`)
  const placed = [...boxes].sort((a, b) => a.top - b.top)
  for (let i = 1; i < placed.length; i++) {
    assert(placed[i].top >= placed[i - 1].bottom - 1, `source-order cards do not overlap: ${JSON.stringify(placed)}`)
    if (Number.isFinite(placed[i].sourceOrder) && Number.isFinite(placed[i - 1].sourceOrder)) assert(placed[i].sourceOrder >= placed[i - 1].sourceOrder, `vertical placement follows source order, independent of creation order: ${JSON.stringify(placed.map(box => [box.id, box.sourceOrder, Math.round(box.top)]))}`)
  }
  assert(boxes.filter(item => item.open).length <= 1, 'only one source card is open')
  const paths = await rail.getByTestId('source-margin-leaders').locator('path').evaluateAll(nodes => nodes.map(node => node.getAttribute('d') || ''))
  assert(paths.length >= 1 && paths.every(d => !/[cqs]/i.test(d)), `actual straight source leader segments: ${JSON.stringify(paths)}`)
  const leaderFills = await rail.getByTestId('source-margin-leaders').locator('path').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).fill))
  assert(leaderFills.every(fill => fill === 'none'), `source leaders are strokes, never filled polygons over ink: ${JSON.stringify(leaderFills)}`)
  const leaderClearance = await host.evaluate(node => {
    const columns = [...node.querySelectorAll('.continuous-reader-window,.pdf-original__page')]
    const boundary = Math.max(...columns.map(column => column.getBoundingClientRect().right))
    const svg = node.querySelector('[data-testid="source-margin-leaders"]')
    const origin = svg.getBoundingClientRect().left
    return [...svg.querySelectorAll('path')].flatMap(path => {
      const tokens = (path.getAttribute('d') || '').match(/[MLHV]|-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi) || []
      let x = 0, y = 0, index = 0
      const segments = []
      while (index < tokens.length) {
        const command = tokens[index++], oldX = x, oldY = y
        if (command === 'M' || command === 'L') { x = Number(tokens[index++]); y = Number(tokens[index++]) }
        else if (command === 'H') x = Number(tokens[index++])
        else if (command === 'V') y = Number(tokens[index++])
        else throw new Error(`Unexpected source leader command ${command}`)
        if (command !== 'M' && Math.abs(y - oldY) > 1) segments.push({ x1: oldX + origin, x2: x + origin, y1: oldY, y2: y, boundary })
      }
      return segments
    })
  })
  assert(leaderClearance.every(segment => Math.min(segment.x1, segment.x2) >= segment.boundary + 1),
    `displaced leader segments stay outside source ink: ${JSON.stringify(leaderClearance)}`)
  return { ownership, boxes, paths, leaderClearance }
}
export async function assertNoRepeatedQuote(card) {
  const visible = await card.locator('blockquote, [data-testid="lab-desktop-card-quote"]').evaluateAll(nodes => nodes.some(node => {
    const style = getComputedStyle(node), box = node.getBoundingClientRect()
    return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 2 && box.height > 2
  }))
  assert(!visible, 'the source stays on its page, without a repeated passage quote')
}
export async function assertNaturalCardBody(card) {
  const bodies = card.locator('.source-margin-content, .lab-pcard-body, .source-margin-body')
  const shapes = await bodies.evaluateAll(nodes => nodes.map(node => ({ overflow: getComputedStyle(node).overflowY,
    height: node.clientHeight, scroll: node.scrollHeight })))
  assert(shapes.length && shapes.every(shape => !['auto', 'scroll'].includes(shape.overflow) && shape.scroll <= shape.height + 2),
    `source card grows naturally; source page owns scrolling: ${JSON.stringify(shapes)}`)
  const turns = await card.locator('.lab-pcard-you').evaluateAll(nodes => nodes.map(node => { const style = getComputedStyle(node); return { radius: style.borderRadius, fill: style.backgroundColor } }))
  assert(turns.every(turn => turn.radius === '0px' && ['transparent', 'rgba(0, 0, 0, 0)'].includes(turn.fill)),
    `desktop source discussion turns stay unboxed: ${JSON.stringify(turns)}`)
}
export async function assertRailScrollsWithSource(page, host, card, source) {
  const before = { card: await card.boundingBox(), source: await source.boundingBox(), top: await host.evaluate(node => node.scrollTop) }
  assert(before.card && before.source)
  await host.evaluate(node => { node.scrollTop += 56; node.dispatchEvent(new Event('scroll', { bubbles: true })) })
  await settlePaint(page)
  const after = { card: await card.boundingBox(), source: await source.boundingBox(), top: await host.evaluate(node => node.scrollTop) }
  assert(after.card && after.source && after.top > before.top, 'source page scroll actually advanced')
  const cardDelta = after.card.y - before.card.y, sourceDelta = after.source.y - before.source.y
  assert(Math.abs(cardDelta - sourceDelta) <= 3, `card and source move together: ${JSON.stringify({ cardDelta, sourceDelta })}`)
}
export async function assertBareDesktopHeader(page) {
  const controls = await page.locator('.lab-header button, .lab-header a[aria-label]').evaluateAll(nodes => nodes.filter(node => {
    const box = node.getBoundingClientRect(); return box.width && box.height
  }).map(node => { const box = node.getBoundingClientRect(), style = getComputedStyle(node); return {
    name: node.getAttribute('aria-label') || node.textContent.trim(), width: box.width, height: box.height,
    radius: style.borderRadius, border: style.borderWidth, fill: style.backgroundColor,
  } }))
  assert(controls.length >= 3)
  assert(controls.every(control => control.name), 'bare header controls retain accessible names')
  for (const control of controls.filter(control => /Back|appearance|settings|^Play$|^Listen$|^Menu$/i.test(control.name))) {
    assert(control.width >= 40 && control.height >= 40, `invisible hit box remains usable: ${JSON.stringify(control)}`)
    assert.equal(control.radius, '0px', `desktop control is a bare mark: ${control.name}`)
  }
  return controls
}

/** Refuse stale HTML or another emitted entry when acceptance names an exact build. */
export async function enforceReaderBundle(route, expected) {
  if (!expected) return false
  const url = new URL(route.request().url())
  if (url.pathname === '/reader') {
    const response = await route.fetch()
    const html = await response.text()
    const entries = [...html.matchAll(/\/assets\/index-[\w-]+\.js/g)].map(match => match[0])
    assert(response.status() === 200 && entries.length === 1 && entries[0] === expected,
      `reader must serve the accepted build: ${JSON.stringify({ entries, expected, status: response.status() })}`)
    await route.fulfill({ response })
    return true
  }
  if (/^\/assets\/index-[\w-]+\.js$/.test(url.pathname)) assert.equal(url.pathname, expected)
  return false
}
/**
 * Open a folded margin card from its header toggle and prove nothing already shown moved or changed type
 * (tester, 9 Nov 2026: the open click sat apart from the minimise, and opening restyled the preview).
 * The toggle keeps its box, and each folded line (an Ask's question, the bottom line, a note's words)
 * reappears in the open card at the same place in the same face, size, weight and style.
 */
export async function openFoldedCardInPlace(page, card) {
  assert.equal(await card.getAttribute('data-open'), 'false', 'card starts folded')
  const toggle = card.locator('.source-margin-toggle')
  const before = await toggle.boundingBox()
  const lines = await card.locator('.source-margin-preview').evaluate(button => [...button.querySelectorAll('.source-margin-preview-question, .source-margin-preview-lead')].map(node => {
    const text = node.firstChild, range = document.createRange(), probe = Math.min(24, text.textContent.length)
    range.setStart(text, 0); range.setEnd(text, probe)
    const box = range.getClientRects()[0], style = getComputedStyle(node)
    return { needle: text.textContent.slice(0, probe), top: box.top, left: box.left, height: box.height, font: [style.fontFamily, style.fontSize, style.fontWeight, style.fontStyle, style.lineHeight].join('|') }
  }).filter(line => line.needle.trim() && !line.needle.endsWith('…')))
  assert(lines.length, 'folded card shows a preview line')
  await card.getByTestId('source-margin-expand').click()
  await page.waitForFunction(node => node.dataset.open === 'true', await card.elementHandle())
  await settlePaint(page)
  const after = await card.getByTestId('source-margin-minimise').boundingBox()
  assert(before && after && Math.abs(before.x - after.x) <= 1 && Math.abs(before.y - after.y) <= 1, `open and minimise share one place: ${JSON.stringify({ before, after })}`)
  const found = await card.locator('.source-margin-content').evaluate((content, lines) => lines.map(line => {
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT)
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      const at = text.textContent.indexOf(line.needle)
      if (at < 0 || !text.parentElement?.getClientRects().length) continue
      const range = document.createRange(); range.setStart(text, at); range.setEnd(text, at + line.needle.length)
      const box = range.getClientRects()[0], style = getComputedStyle(text.parentElement)
      return { ...line, openTop: box.top, openLeft: box.left, openFont: [style.fontFamily, style.fontSize, style.fontWeight, style.fontStyle, style.lineHeight].join('|') }
    }
    const field = [...content.querySelectorAll('textarea')].find(node => node.value.startsWith(line.needle))
    if (field) {
      const style = getComputedStyle(field), box = field.getBoundingClientRect(), lineHeight = parseFloat(style.lineHeight)
      return { ...line, openTop: box.top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop) + (lineHeight - line.height) / 2, openLeft: box.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft), openFont: [style.fontFamily, style.fontSize, style.fontWeight, style.fontStyle, style.lineHeight].join('|') }
    }
    return { ...line, openTop: null }
  }), lines)
  for (const line of found) {
    assert(line.openTop !== null, `folded line is still shown when open: ${JSON.stringify(line)}`)
    assert(Math.abs(line.openTop - line.top) <= 1.5 && Math.abs(line.openLeft - line.left) <= 1.5, `opening does not move a folded line: ${JSON.stringify(line)}`)
    // Family, size, style and line height stay; the weight may rise on opening, because a folded card is
    // always regular (passive) and an open answer bolds its lead line (Anders, 9 Nov 2026).
    const face = font => { const [family, size, , style, lineHeight] = font.split('|'); return [family, size, style, lineHeight].join('|') }
    assert.equal(face(line.openFont), face(line.font), `opening keeps a folded line's type: ${line.needle}`)
    assert.equal(line.font.split('|')[2], '400', `a folded line is regular weight: ${line.needle}`)
  }
  return found
}
