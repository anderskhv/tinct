/**
 * The readable article in a fetched web page (routes/importArticle.ts): its title, byline, site name and
 * main text as simple HTML blocks (headings, paragraphs, quotes, lists), without the site around it.
 *
 * Conservative, and pure (no DOM, no dependency), so it runs in the Worker and in the tests alike:
 * 1. A small tolerant HTML parser builds a tree (scripts, styles and comments are skipped).
 * 2. The site's parts are pruned: navigation, headers outside the article, footers, asides, forms,
 *    hidden elements, and elements whose class, id or role names a menu, sidebar, comments, related or
 *    recommended links, sharing, ads, cookie or newsletter prompts, or a paywall. An element is never
 *    pruned by its name when it holds most of the page's prose (a wrapper called "page-with-sidebar").
 * 3. The article is the `itemprop=articleBody`, `<article>` or `<main>` that holds most of the page's
 *    prose, or else the element whose own paragraphs hold the most text (the densest block).
 * 4. Its blocks are written out; link lists and lines that are mostly links are left out.
 * A page that yields fewer than MIN_WORDS words of prose, or that says it is paywalled and shows little,
 * is refused (null): the caller tells the reader to paste the text instead, never makes an empty book.
 * The same web-chrome rules as pasted text (paste-text.js chromeUnits) run on the result in the browser.
 */

export const MIN_WORDS = 120

type El = { tag: string; attrs: Record<string, string>; children: Node[]; parent: El | null }
type Node = El | string

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'keygen'])
// Their content is not markup; read to the closing tag and kept only for <title>.
const RAW = new Set(['script', 'style', 'textarea', 'title', 'noscript', 'xmp', 'iframe', 'noembed', 'noframes', 'plaintext', 'template'])
// A start tag of these closes an open <p>.
const CLOSES_P = new Set(['address', 'article', 'aside', 'blockquote', 'details', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'])

const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ensp: ' ', emsp: ' ', thinsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', lsquo: '‘', rsquo: '’', sbquo: '‚', ldquo: '“',
  rdquo: '”', bdquo: '„', laquo: '«', raquo: '»', lsaquo: '‹', rsaquo: '›', middot: '·',
  bull: '•', copy: '©', reg: '®', trade: '™', deg: '°', sect: '§', para: '¶', dagger: '†',
  Dagger: '‡', prime: '′', Prime: '″', times: '×', divide: '÷', minus: '−', frac12: '½',
  frac14: '¼', frac34: '¾', euro: '€', pound: '£', yen: '¥', cent: '¢', shy: '­', zwj: '‍',
  zwnj: '‌', iexcl: '¡', iquest: '¿', szlig: 'ß', aelig: 'æ', AElig: 'Æ', oslash: 'ø',
  Oslash: 'Ø', aring: 'å', Aring: 'Å', ccedil: 'ç', Ccedil: 'Ç', ntilde: 'ñ', Ntilde: 'Ñ',
}
for (const [letter, base] of [['a', 'a'], ['e', 'e'], ['i', 'i'], ['o', 'o'], ['u', 'u']] as const) {
  const marks: Record<string, number> = { grave: 0x300, acute: 0x301, circ: 0x302, uml: 0x308, tilde: 0x303 }
  for (const [name, mark] of Object.entries(marks)) {
    NAMED[letter + name] = (base + String.fromCharCode(mark)).normalize('NFC')
    NAMED[letter.toUpperCase() + name] = (base.toUpperCase() + String.fromCharCode(mark)).normalize('NFC')
  }
}

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z][a-z0-9]{1,31});?/gi, (whole, name: string) => {
    if (name[0] === '#') {
      const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10)
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return '�'
      return String.fromCodePoint(code)
    }
    return NAMED[name] ?? whole
  })
}

function parseAttrs(source: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const pattern = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
  for (const m of source.matchAll(pattern)) {
    const name = m[1].toLowerCase()
    if (!(name in attrs)) attrs[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '')
  }
  return attrs
}

/** A tolerant parse of an HTML document into a tree rooted at a synthetic #root element. */
export function parseHtml(html: string): El {
  const root: El = { tag: '#root', attrs: {}, children: [], parent: null }
  let current = root
  let i = 0
  const n = html.length
  const lower = html.toLowerCase()
  const open = (tag: string) => { for (let el: El | null = current; el; el = el.parent) if (el.tag === tag) return el; return null }
  const closeTo = (el: El) => { current = el.parent ?? root }
  const text = (value: string) => { if (value) current.children.push(decodeEntities(value)) }
  while (i < n) {
    const lt = html.indexOf('<', i)
    if (lt < 0) { text(html.slice(i)); break }
    if (lt > i) text(html.slice(i, lt))
    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4)
      i = end < 0 ? n : end + 3
      continue
    }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') {
      const end = html.indexOf('>', lt)
      i = end < 0 ? n : end + 1
      continue
    }
    const closing = html[lt + 1] === '/'
    const nameMatch = /^[a-zA-Z][a-zA-Z0-9:-]*/.exec(html.slice(lt + (closing ? 2 : 1), lt + (closing ? 2 : 1) + 64))
    if (!nameMatch) { text('<'); i = lt + 1; continue }
    const tag = nameMatch[0].toLowerCase()
    // The end of the tag, skipping '>' inside quoted attribute values.
    let j = lt + (closing ? 2 : 1) + nameMatch[0].length
    let quote = ''
    for (; j < n; j++) {
      const c = html[j]
      if (quote) { if (c === quote) quote = '' } else if (c === '"' || c === "'") quote = c
      else if (c === '>') break
    }
    const inner = html.slice(lt + (closing ? 2 : 1) + nameMatch[0].length, j)
    i = j + 1
    if (closing) {
      const el = open(tag)
      if (el) closeTo(el)
      continue
    }
    if (CLOSES_P.has(tag)) { const p = nearest(current, ['p', 'div', 'section', 'article', 'li', 'td', 'th', 'blockquote']); if (p?.tag === 'p') closeTo(p) }
    if (tag === 'li') { const li = nearest(current, ['li', 'ul', 'ol']); if (li?.tag === 'li') closeTo(li) }
    if (tag === 'dt' || tag === 'dd') { for (const t of ['dt', 'dd']) { const el = open(t); if (el && el === nearest(current, ['dt', 'dd', 'dl'])) closeTo(el) } }
    if (tag === 'tr') { const tr = open('tr'); if (tr && tr === nearest(current, ['tr', 'table'])) closeTo(tr) }
    if (tag === 'td' || tag === 'th') { const cell = nearest(current, ['td', 'th', 'tr', 'table']); if (cell && (cell.tag === 'td' || cell.tag === 'th')) closeTo(cell) }
    if (tag === 'option') { const opt = open('option'); if (opt) closeTo(opt) }
    const el: El = { tag, attrs: parseAttrs(inner), children: [], parent: current }
    current.children.push(el)
    if (RAW.has(tag)) {
      const end = lower.indexOf('</' + tag, i)
      const body = html.slice(i, end < 0 ? n : end)
      if (tag === 'title' || (tag === 'script' && /ld\+json/i.test(el.attrs.type || ''))) el.children.push(tag === 'title' ? decodeEntities(body) : body)
      const close = end < 0 ? n : html.indexOf('>', end)
      i = close < 0 ? n : close + 1
      continue
    }
    if (VOID.has(tag) || /\/\s*$/.test(inner)) continue
    current = el
  }
  return root
}

function nearest(from: El, tags: string[]): El | null { for (let el: El | null = from; el; el = el.parent) if (tags.includes(el.tag)) return el; return null }

const isEl = (node: Node): node is El => typeof node !== 'string'
function* elements(el: El): Generator<El> { for (const child of el.children) if (isEl(child)) { yield child; yield* elements(child) } }
const squash = (text: string) => text.replace(/[\s ]+/g, ' ').trim()
function textOf(node: Node): string {
  if (!isEl(node)) return node
  if (node.tag === 'br') return '\n'
  if (RAW.has(node.tag) && node.tag !== 'title') return ''
  return node.children.map(textOf).join(BLOCKISH.has(node.tag) ? ' ' : '')
}
const wordCount = (text: string) => (squash(text).match(/\S+/g) || []).length

const BLOCKISH = new Set(['p', 'div', 'section', 'article', 'main', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'td', 'th', 'tr', 'dd', 'dt', 'figcaption', 'figure', 'header', 'footer', 'ul', 'ol', 'dl', 'table', 'aside', 'nav', 'address'])
const PROSE = new Set(['p', 'pre', 'blockquote', 'li', 'dd'])
const DROP_TAGS = new Set(['script', 'style', 'noscript', 'template', 'svg', 'math', 'iframe', 'object', 'embed', 'form', 'button', 'input', 'select', 'textarea', 'canvas', 'video', 'audio', 'picture', 'img', 'nav', 'aside', 'footer', 'dialog', 'menu', 'label', 'map', 'head', 'link', 'meta', 'title', 'source'])
const DROP_ROLES = new Set(['navigation', 'banner', 'contentinfo', 'complementary', 'dialog', 'alertdialog', 'search', 'menu', 'menubar', 'toolbar', 'alert', 'tablist'])
// Words in a class or id that name the site's parts. Matched as a whole token or a dash/underscore part of one.
const CHROME_WORDS = ['nav', 'navbar', 'navigation', 'menu', 'masthead', 'footer', 'sidebar', 'side-bar', 'comment', 'comments', 'disqus', 'related', 'recommended', 'recommendations', 'recirculation', 'more-stories', 'share', 'sharing', 'social', 'promo', 'advert', 'advertisement', 'ad', 'ads', 'adslot', 'sponsor', 'sponsored', 'cookie', 'cookies', 'consent', 'gdpr', 'newsletter', 'signup', 'subscribe', 'subscription', 'paywall', 'popup', 'modal', 'overlay', 'breadcrumb', 'breadcrumbs', 'outbrain', 'taboola', 'banner', 'toolbar', 'skip-link', 'visually-hidden', 'sr-only', 'screen-reader-text', 'tags', 'tag-list', 'author-bio', 'pagination', 'pager', 'jump-link', 'toc']
const CHROME_RX = new RegExp(`(?:^|[-_])(?:${CHROME_WORDS.map(w => w.replace(/-/g, '[-_]')).join('|')})(?:$|[-_])`, 'i')
const CONTENT_RX = /(?:^|[-_])(?:article|content|main|body|story|entry|post|prose)(?:$|[-_])/i
const PAYWALL_RX = /(?:^|[-_])(?:paywall|premium-content|meter|regwall|piano)(?:$|[-_])/i

function tokens(el: El): string[] { return `${el.attrs.class || ''} ${el.attrs.id || ''}`.split(/\s+/).filter(Boolean) }
function hidden(el: El): boolean {
  if ('hidden' in el.attrs || el.attrs['aria-hidden'] === 'true') return true
  const style = (el.attrs.style || '').toLowerCase().replace(/\s+/g, '')
  return style.includes('display:none') || style.includes('visibility:hidden')
}

/** Characters of prose (text in paragraphs, quotes, list items) under each element. */
function proseLengths(root: El): Map<El, number> {
  const lengths = new Map<El, number>()
  const visit = (el: El, inProse: boolean): number => {
    let total = 0
    const prose = inProse || PROSE.has(el.tag)
    for (const child of el.children) total += isEl(child) ? visit(child, prose) : prose ? squash(child).length : 0
    lengths.set(el, total)
    return total
  }
  visit(root, false)
  return lengths
}

type Signals = { paywallMarked: boolean }

function prune(root: El, signals: Signals): void {
  const lengths = proseLengths(root)
  const total = lengths.get(root) || 1
  const keepsArticle = (el: El) => (lengths.get(el) || 0) >= total * 0.5
  const walk = (el: El, inArticle: boolean) => {
    el.children = el.children.filter(child => {
      if (!isEl(child)) return true
      const t = tokens(child)
      if (t.some(token => PAYWALL_RX.test(token))) signals.paywallMarked = true
      if (child.tag === 'html' || child.tag === 'body' || child.tag === 'main') return true
      if (DROP_TAGS.has(child.tag) && !(child.tag === 'aside' && keepsArticle(child))) return false
      if (child.tag === 'header' && !inArticle) return false
      if (hidden(child)) return false
      if (DROP_ROLES.has((child.attrs.role || '').toLowerCase()) && !keepsArticle(child)) return false
      // A token naming the site's part ("comments", "share-bar") prunes, unless another names the content ("entry-content").
      if (child.tag !== 'article' && t.some(token => CHROME_RX.test(token)) && !t.some(token => CONTENT_RX.test(token) && !CHROME_RX.test(token)) && !keepsArticle(child)) return false
      if (child.tag === 'article' && t.some(token => /(?:^|[-_])comments?(?:$|[-_])/i.test(token))) return false
      return true
    })
    for (const child of el.children) if (isEl(child)) walk(child, inArticle || child.tag === 'article' || child.tag === 'main' || child.attrs.role === 'main')
  }
  walk(root, false)
}

function linkTextLength(el: El): number {
  let total = 0
  // A link within the page (a heading's own anchor, a footnote) is not a link away.
  for (const child of el.children) if (isEl(child)) total += child.tag === 'a' && !(child.attrs.href || '').startsWith('#') ? squash(textOf(child)).length : linkTextLength(child)
  return total
}
const linkDensity = (el: El) => { const length = squash(textOf(el)).length; return length ? linkTextLength(el) / length : 0 }

/** The element holding the article. */
function articleRoot(root: El): El | null {
  const lengths = proseLengths(root)
  const total = lengths.get(root) || 0
  if (!total) return null
  const all = [...elements(root)]
  const best = (list: El[]) => list.reduce<El | null>((top, el) => (!top || (lengths.get(el) || 0) > (lengths.get(top) || 0) ? el : top), null)
  const covers = (el: El | null, share: number) => !!el && (lengths.get(el) || 0) >= total * share
  const body = best(all.filter(el => el.attrs.itemprop === 'articleBody'))
  if (covers(body, 0.4)) return body
  const article = best(all.filter(el => el.tag === 'article'))
  if (covers(article, 0.5)) return article
  const main = best(all.filter(el => el.tag === 'main' || el.attrs.role === 'main'))
  if (covers(main, 0.5)) return main
  // The densest block: each paragraph counts fully toward its parent and half toward the grandparent.
  const score = new Map<El, number>()
  for (const el of all) {
    if (el.tag !== 'p' && el.tag !== 'pre' && el.tag !== 'blockquote') continue
    const length = squash(textOf(el)).length * (1 - Math.min(0.9, linkDensity(el)))
    if (length < 25) continue
    if (el.parent) score.set(el.parent, (score.get(el.parent) || 0) + length)
    if (el.parent?.parent) score.set(el.parent.parent, (score.get(el.parent.parent) || 0) + length / 2)
  }
  let top: El | null = null
  for (const [el, value] of score) if (!top || value > (score.get(top) || 0)) top = el
  return top ?? main ?? article
}

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const INLINE_KEEP: Record<string, string> = { em: 'em', i: 'em', cite: 'em', strong: 'strong', b: 'strong', sup: 'sup', sub: 'sub', code: 'code' }

function absoluteHref(href: string | undefined, base: URL): string | null {
  if (!href) return null
  try {
    const url = new URL(href, base)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch { return null }
}

/** A block element's inline content as safe HTML. */
function inlineHtml(node: Node, base: URL): string {
  if (!isEl(node)) return escape(node.replace(/[\s ]+/g, ' '))
  if (node.tag === 'br') return '<br/>'
  if (RAW.has(node.tag) || DROP_TAGS.has(node.tag)) return ''
  const inner = node.children.map(child => inlineHtml(child, base)).join('')
  if (node.tag === 'a') {
    // A link within the page (a heading's anchor, a footnote mark) keeps its text only.
    const href = (node.attrs.href || '').startsWith('#') ? null : absoluteHref(node.attrs.href, base)
    return href && squash(inner) ? `<a href="${escape(href)}">${inner}</a>` : inner
  }
  const tag = INLINE_KEEP[node.tag]
  if (tag && squash(inner)) return `<${tag}>${inner}</${tag}>`
  return BLOCKISH.has(node.tag) ? ` ${inner} ` : inner
}
const tidy = (html: string) => html.replace(/\s+/g, ' ').replace(/^(?:\s|<br\/>)+|(?:\s|<br\/>)+$/g, '').trim()

// An unknown or inline element (a custom element, a <span>) that wraps paragraphs is read as a container.
const blockMemo = new WeakMap<El, boolean>()
function holdsBlocks(el: El): boolean {
  const known = blockMemo.get(el)
  if (known !== undefined) return known
  const result = el.children.some(child => isEl(child) && (BLOCKISH.has(child.tag) || holdsBlocks(child)))
  blockMemo.set(el, result)
  return result
}

type Out = { html: string[]; words: number; longest: number; linkChars: number; chars: number }

function writeBlocks(el: El, base: URL, out: Out, title: string): void {
  let run: Node[] = []
  const flush = () => {
    if (!run.length) return
    const wrap: El = { tag: 'p', attrs: {}, children: run, parent: el }
    run = []
    paragraph(wrap, 'p')
  }
  const paragraph = (block: El, tag: string) => {
    const text = squash(textOf(block))
    if (!text) return
    const words = wordCount(text)
    const links = linkTextLength(block)
    // A line that is mostly links (a "Read more" or a teaser) is the site's.
    if (links / text.length > 0.6 && words < 40) return
    const html = tidy(inlineHtml(block, base))
    if (!html) return
    out.html.push(`<${tag}>${html}</${tag}>`)
    out.words += words; out.chars += text.length; out.linkChars += links
    out.longest = Math.max(out.longest, words)
  }
  for (const child of el.children) {
    if (!isEl(child)) { if (squash(child)) run.push(child); continue }
    const tag = child.tag
    if (!BLOCKISH.has(tag) && tag !== 'hr' && !holdsBlocks(child)) { run.push(child); continue }
    flush()
    // A whole block wrapped in a link is a card for another page.
    if (tag === 'a') continue
    if (/^h[1-6]$/.test(tag)) {
      const text = squash(textOf(child))
      if (!text || (title && fold(text) === fold(title))) continue
      // h1 inside the article becomes h2: the book's own title is its h1.
      const level = Math.min(6, Math.max(2, Number(tag[1])))
      // A heading that is a link away is a teaser for another page.
      if (linkDensity(child) > 0.6) continue
      out.html.push(`<h${level}>${tidy(inlineHtml(child, base))}</h${level}>`)
      out.chars += text.length; out.linkChars += linkTextLength(child)
    } else if (tag === 'p' || tag === 'dd' || tag === 'dt' || tag === 'address') paragraph(child, 'p')
    else if (tag === 'pre') {
      const text = textOf(child).replace(/\r\n?/g, '\n').trim()
      if (text) { out.html.push(`<pre>${escape(text)}</pre>`); out.words += wordCount(text); out.chars += text.length }
    } else if (tag === 'blockquote') {
      const inner: Out = { html: [], words: 0, longest: 0, linkChars: 0, chars: 0 }
      writeBlocks(child, base, inner, '')
      if (inner.html.length) {
        out.html.push(`<blockquote>${inner.html.join('')}</blockquote>`)
        out.words += inner.words; out.chars += inner.chars; out.linkChars += inner.linkChars; out.longest = Math.max(out.longest, inner.longest)
      }
    } else if (tag === 'ul' || tag === 'ol') {
      const items = child.children.filter(isEl).filter(li => li.tag === 'li')
      // A list of links (related articles, tags, a table of contents) is left out.
      if (!items.length || linkDensity(child) > 0.5) continue
      const parts: string[] = []
      for (const li of items) {
        const text = squash(textOf(li))
        if (!text) continue
        parts.push(`<li>${tidy(inlineHtml(li, base))}</li>`)
        out.words += wordCount(text); out.chars += text.length; out.linkChars += linkTextLength(li)
      }
      if (parts.length) out.html.push(`<${tag}>${parts.join('')}</${tag}>`)
    } else if (tag === 'figure' || tag === 'figcaption') {
      const caption = tag === 'figcaption' ? child : [...elements(child)].find(e => e.tag === 'figcaption')
      const text = caption ? squash(textOf(caption)) : ''
      if (text) { out.html.push(`<figure><figcaption>${tidy(inlineHtml(caption!, base))}</figcaption></figure>`); out.chars += text.length }
    } else if (tag === 'table') {
      for (const row of [...elements(child)].filter(e => e.tag === 'tr')) {
        const cells = row.children.filter(isEl).filter(c => c.tag === 'td' || c.tag === 'th').map(c => tidy(inlineHtml(c, base))).filter(Boolean)
        if (cells.length) { const text = cells.join(' · '); out.html.push(`<p>${text}</p>`); out.words += wordCount(text); out.chars += text.length }
      }
    } else if (tag === 'hr') out.html.push('<hr/>')
    else writeBlocks(child, base, out, title)
  }
  flush()
}

const fold = (text: string) => squash(text).toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"')

function meta(root: El): Map<string, string> {
  const found = new Map<string, string>()
  for (const el of elements(root)) {
    if (el.tag !== 'meta') continue
    const key = (el.attrs.property || el.attrs.name || el.attrs.itemprop || '').toLowerCase()
    const value = squash(el.attrs.content || '')
    if (key && value && !found.has(key)) found.set(key, value)
  }
  return found
}

/** What JSON-LD says: the headline, author and whether the page is free to read. */
function linkedData(root: El): { headline?: string; author?: string; notFree: boolean } {
  const out: { headline?: string; author?: string; notFree: boolean } = { notFree: false }
  for (const el of elements(root)) {
    if (el.tag !== 'script' || !/ld\+json/i.test(el.attrs.type || '')) continue
    let data: unknown
    try { data = JSON.parse(String(el.children[0] || '')) } catch { continue }
    const items: unknown[] = []
    const collect = (value: unknown) => {
      if (Array.isArray(value)) value.forEach(collect)
      else if (value && typeof value === 'object') { items.push(value); const graph = (value as Record<string, unknown>)['@graph']; if (graph) collect(graph) }
    }
    collect(data)
    for (const item of items as Record<string, unknown>[]) {
      const free = item.isAccessibleForFree
      if (free === false || (typeof free === 'string' && /^false$/i.test(free))) out.notFree = true
      if (!out.headline && typeof item.headline === 'string') out.headline = squash(item.headline)
      const author = Array.isArray(item.author) ? item.author[0] : item.author
      const name = typeof author === 'string' ? author : author && typeof author === 'object' ? (author as Record<string, unknown>).name : undefined
      if (!out.author && typeof name === 'string' && /article|posting|news|blog|report/i.test(String(item['@type'] || ''))) out.author = squash(name)
    }
  }
  return out
}

const BY = /^(?:by|af|von|par|por|di)\s+/i
function cleanAuthor(value: string | undefined): string {
  const text = squash(value || '').replace(BY, '')
  if (!text || /^https?:/i.test(text) || text.length > 80 || wordCount(text) > 8) return ''
  return text
}

function titleFrom(root: El, articleEl: El | null, metaTags: Map<string, string>, ld: { headline?: string }, siteName: string): string {
  const firstH1 = (el: El | null) => (el ? [...elements(el)].find(e => e.tag === 'h1') : undefined)
  const h1 = firstH1(articleEl) ?? firstH1(root)
  const h1Text = h1 ? squash(textOf(h1)) : ''
  const og = metaTags.get('og:title') || metaTags.get('twitter:title') || ld.headline || ''
  const titleEl = [...elements(root)].find(e => e.tag === 'title')
  let docTitle = titleEl ? squash(textOf(titleEl)) : ''
  // "Headline | Site", "Headline - Site", "Headline — Site": the site's part is left out.
  const parts = docTitle.split(/\s+[|–—-]\s+|\s+[·•]\s+/)
  if (parts.length > 1) {
    const site = fold(siteName)
    const last = fold(parts[parts.length - 1])
    if (last === site || site.includes(last) || last.includes(site) || wordCount(parts[parts.length - 1]) <= 3) docTitle = parts.slice(0, -1).join(' - ')
  }
  if (h1Text && wordCount(h1Text) <= 30 && (!og || fold(og).includes(fold(h1Text)) || fold(h1Text).includes(fold(og)) || fold(docTitle).includes(fold(h1Text)))) return h1Text.slice(0, 200)
  return (og || h1Text || docTitle).slice(0, 200)
}

function bylineFrom(root: El, articleEl: El | null, metaTags: Map<string, string>, ld: { author?: string }): string {
  const fromMeta = cleanAuthor(metaTags.get('author')) || cleanAuthor(metaTags.get('article:author')) || cleanAuthor(metaTags.get('parsely-author')) || cleanAuthor(ld.author)
  if (fromMeta) return fromMeta
  for (const scope of [articleEl, root]) {
    if (!scope) continue
    for (const el of elements(scope)) {
      const named = el.attrs.rel === 'author' || el.attrs.itemprop === 'author' || tokens(el).some(t => /(?:^|[-_])(?:byline|author|author-name)(?:$|[-_])/i.test(t))
      if (!named) continue
      const text = cleanAuthor(textOf(el))
      if (text) return text
    }
  }
  return ''
}

export type ExtractedArticle = {
  title: string
  author: string
  siteName: string
  /** The article's blocks as simple HTML (h2–h6, p, blockquote, ul/ol/li, pre, figure/figcaption, hr; em, strong, a, sup, sub, code inline). */
  html: string
  words: number
}

export type Refusal = { refused: 'no_text' | 'paywall' }

/** The readable article in an HTML page fetched from `pageUrl`, or why there is none. */
export function extractArticle(html: string, pageUrl: string): ExtractedArticle | Refusal {
  const base = new URL(pageUrl)
  const doc = parseHtml(html)
  const metaTags = meta(doc)
  const ld = linkedData(doc)
  const siteName = (metaTags.get('og:site_name') || metaTags.get('application-name') || base.hostname.replace(/^www\./, '')).slice(0, 120)
  const signals: Signals = { paywallMarked: false }
  // Title and byline are read before pruning: an article's header is often outside its body.
  const preRoot = articleRoot(doc)
  const title = titleFrom(doc, preRoot, metaTags, ld, siteName)
  const author = bylineFrom(doc, preRoot, metaTags, ld)
  prune(doc, signals)
  const articleEl = articleRoot(doc)
  const out: Out = { html: [], words: 0, longest: 0, linkChars: 0, chars: 0 }
  if (articleEl) writeBlocks(articleEl, base, out, title)
  // A byline line repeated as the article's first paragraph stays (pasted text keeps it too).
  const tooLittle = out.words < MIN_WORDS || out.longest < 25 || (out.chars > 0 && out.linkChars / out.chars > 0.35)
  if (ld.notFree && (signals.paywallMarked || out.words < 400)) return { refused: 'paywall' }
  if (tooLittle) return { refused: 'no_text' }
  return { title, author, siteName, html: out.html.join('\n'), words: out.words }
}

/** Plain text served as text/plain: its paragraphs, for the browser's paste pipeline. */
export function plainTextWords(text: string): number { return wordCount(text) }
