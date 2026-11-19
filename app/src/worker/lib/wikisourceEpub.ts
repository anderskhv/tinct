/**
 * A Wikisource work as an EPUB, built on the Worker from the wiki's own API
 * (`action=parse`, the page HTML MediaWiki renders), for Add to Tinct
 * (routes/publicBooks.ts). The catalogue names a work by its ws-export link,
 * but ws-export.wmcloud.org cannot be used: its robots.txt disallows every
 * automated fetch and it answers the Worker with an Anubis "Making sure you're
 * not a bot!" page (QA 2026-10-08). The API is Wikimedia's interface for
 * programs, used here as its etiquette asks: an identifying User-Agent, a few
 * requests at a time, one retry after a pause, and only on a reader's request.
 *
 * The book: the work's page and, in the order its contents list them, its
 * subpages (`<work>/Chapter 1`), one level further for a subpage that is
 * itself only a contents list (a volume). Wikisource's own furniture is left
 * out as ws-export leaves it out (`ws-noexport`, the header, page numbers,
 * edit links); pictures are not carried. The EPUB is then converted in the
 * browser and checked against these same bytes like any downloaded EPUB.
 */
import { wikisourceApi } from '../../../public/lab/public-books.js'

export const WIKISOURCE_USER_AGENT = 'Tinct/1.0 (https://tinct.app; public-domain import)'
/**
 * Pages one book may read (the work's page included); larger works are refused as too large.
 * Kept under Wikimedia's 200 requests a minute for an identified client
 * (mediawiki.org Wikimedia_APIs/Rate_limits), so one import never needs to wait it out.
 */
export const MAX_WIKISOURCE_PAGES = 180
/** Parallel API requests: Wikimedia asks for 3 or fewer. */
export const WIKISOURCE_CONCURRENCY = 3
/** The whole Wikisource read, retries included. */
export const WIKISOURCE_TIMEOUT_MS = 90_000
const RETRIES = 3
const RETRY_MS = 1000
/** Without Retry-After, a 429 waits at least five seconds (Wikimedia's guideline). */
const RATE_LIMITED_MS = 5000
const MAX_RETRY_AFTER_MS = 20_000
let sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))
/** Tests: waits without the clock. */
export function setWikisourceSleepForTest(fn: ((ms: number) => Promise<void>) | null): void {
  sleep = fn ?? ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)))
}
/** A page with fewer letters than this outside its links is a contents list, not text. */
const CONTENTS_ONLY_LETTERS = 1500

export class WikisourceError extends Error {
  code: 'source_unavailable' | 'source_too_large' | 'not_found'
  constructor(code: WikisourceError['code']) {
    super(code)
    this.code = code
  }
}

type Fetch = typeof fetch

export interface WikisourcePage { title: string; label: string; html: string }

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
/** Wikisource's own furniture, as ws-export leaves it out. */
const DROP_CLASS = /(^|\s)(ws-noexport|noprint|mw-editsection|ws-header|wst-header|headertemplate|ws-pagenum|pagenum|licenseContainer|licenseBanner|mw-empty-elt|reference|mw-cite-backlink|metadata|navbox)(\s|$)/
const DROP_ID = /^(headertemplate|ws-data|toc|nav[-_]?bar)$/i
const DROP_TAG = new Set(['style', 'script', 'noscript', 'figure', 'video', 'audio', 'object', 'iframe', 'map', 'math', 'svg'])
/** Tags kept unchanged; everything else is left out with its attributes (its text stays). */
const KEEP_TAG = new Set(['p', 'br', 'hr', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'em', 'i', 'strong', 'b', 'u', 'small', 'big', 'sub', 'sup', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'center', 'section', 'poem', 'abbr', 'cite', 'q', 's'])

const attr = (attrs: string, name: string) => attrs.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))?.slice(2).find(value => value !== undefined) ?? ''

/**
 * MediaWiki's page HTML without Wikisource's furniture, pictures, scripts or
 * attributes (only `lang` and `dir` stay), as well-formed XHTML-ish markup.
 * No DOM in the Worker: a tag scanner that drops whole elements by class, id or tag.
 */
export function cleanWikisourceHtml(html: string): string {
  const out: string[] = []
  const tag = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g
  let at = 0
  let skip = 0 // >0: inside a dropped element, counting its open tags
  let match: RegExpExecArray | null
  while ((match = tag.exec(html))) {
    if (!skip) out.push(html.slice(at, match.index))
    at = tag.lastIndex
    if (match[0].startsWith('<!--')) continue
    const closing = match[1] === '/'
    const name = match[2].toLowerCase()
    const attrs = match[3] || ''
    const selfClosing = VOID.has(name) || /\/\s*$/.test(attrs)
    if (skip) {
      if (selfClosing) continue
      skip += closing ? -1 : 1
      continue
    }
    if (closing) { if (KEEP_TAG.has(name) || name === 'a') out.push(`</${name}>`); continue }
    const dropped = DROP_TAG.has(name) || name === 'img' || DROP_CLASS.test(attr(attrs, 'class')) || DROP_ID.test(attr(attrs, 'id'))
    if (dropped) { if (!selfClosing) skip = 1; continue }
    // Links stay only as the wiki's own page links (for the contents); stripLinks removes them for the book.
    if (name === 'a') { const href = attr(attrs, 'href'); out.push(/^\/wiki\/[^"<>\s]+$/.test(href) ? `<a href="${href}">` : '<a>'); continue }
    if (!KEEP_TAG.has(name)) continue
    const lang = attr(attrs, 'lang')
    const kept = lang && /^[a-zA-Z-]{2,12}$/.test(lang) ? ` lang="${lang}"` : ''
    out.push(VOID.has(name) ? `<${name}${kept}/>` : `<${name}${kept}>`)
  }
  if (!skip) out.push(html.slice(at))
  return out.join('')
    .replace(/&(?!(?:#\d{1,7}|#x[0-9a-fA-F]{1,6}|amp|lt|gt|quot|apos);)/g, '&amp;')
    .replace(/<(span|div|p)>\s*<\/\1>/g, '')
}

/** The markup without its links (their text stays). */
export const stripLinks = (html: string) => html.replace(/<a(\s[^>]*)?>|<\/a>/gi, '')

/** Every subpage of `title` the page HTML links to, in the order they appear. */
export function subpageLinks(html: string, title: string): string[] {
  const prefix = title.replace(/ /g, '_') + '/'
  const seen = new Set<string>()
  const out: string[] = []
  for (const match of html.matchAll(/<a\s[^>]*href="\/wiki\/([^"#?]+)(?:#[^"]*)?"/gi)) {
    let target: string
    try { target = decodeURIComponent(match[1].replace(/&amp;/g, '&')) } catch { continue }
    if (!target.startsWith(prefix)) continue
    const name = target.replace(/_/g, ' ')
    if (!seen.has(name)) { seen.add(name); out.push(name) }
  }
  return out
}

/** Letters outside links: how much of a page is its own text. */
function ownLetters(html: string): number {
  return html.replace(/<a\s[\s\S]*?<\/a>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[#\w]+;/g, ' ').replace(/[^\p{L}]/gu, '').length
}

const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&#160;|&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/\s+/g, ' ').trim()

/** A subpage's chapter name: the header's section line ("Letter 1. On saving time"), else its last segment. */
function pageLabel(rawHtml: string, title: string): string {
  const section = rawHtml.match(/class="header-section-text"[^>]*>([\s\S]*?)<\/div>/)?.[1]
  const fromHeader = section ? plain(section) : ''
  return (fromHeader || title.split('/').pop() || title).slice(0, 200)
}

async function parsePage(lang: string, title: string, fetchImpl: Fetch, signal: AbortSignal): Promise<{ title: string; html: string } | null> {
  const url = new URL(wikisourceApi(lang))
  for (const [key, value] of Object.entries({ action: 'parse', format: 'json', formatversion: '2', redirects: '1', prop: 'text', disableeditsection: '1', disablelimitreport: '1', disabletoc: '1', page: title })) url.searchParams.set(key, value)
  let wait = 0
  for (let attempt = 0; attempt < RETRIES + 1; attempt++) {
    if (wait) await sleep(wait)
    wait = RETRY_MS
    let response: Response
    try {
      response = await fetchImpl(url.toString(), { signal, redirect: 'manual', headers: { 'User-Agent': WIKISOURCE_USER_AGENT, 'Api-User-Agent': WIKISOURCE_USER_AGENT, Accept: 'application/json' } })
    } catch {
      if (signal.aborted || attempt === RETRIES) throw new WikisourceError('source_unavailable')
      continue
    }
    if ((response.status === 429 || response.status >= 500) && attempt < RETRIES) {
      // Wikimedia's rate limits: honour Retry-After (bounded), else wait as its guidelines ask.
      const after = Number(response.headers.get('retry-after'))
      if (response.status === 429) wait = Number.isFinite(after) && after > 0 ? Math.min(after * 1000, MAX_RETRY_AFTER_MS) : RATE_LIMITED_MS
      await response.body?.cancel().catch(() => {})
      continue
    }
    if (!response.ok) throw new WikisourceError('source_unavailable')
    const data = await response.json().catch(() => null) as { parse?: { title?: string; text?: string }; error?: { code?: string } } | null
    if (data?.error?.code === 'missingtitle' || data?.error?.code === 'invalidtitle') return null
    if (data?.error?.code === 'maxlag' && attempt < RETRIES) continue
    if (!data?.parse || typeof data.parse.text !== 'string') throw new WikisourceError('source_unavailable')
    return { title: data.parse.title || title, html: data.parse.text }
  }
  throw new WikisourceError('source_unavailable')
}

/** Run `job` over `items`, a few at a time, in order. */
async function inOrder<T, R>(items: T[], limit: number, job: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const index = next++; out[index] = await job(items[index]) }
  }))
  return out
}

/**
 * The work's pages, in reading order: its subpages (one level deeper for a
 * contents-only subpage), else the page itself. The work's own page is kept
 * first when it carries text of its own beside its contents.
 */
export async function wikisourcePages(target: { lang: string; page: string }, options: { fetchImpl?: Fetch; signal: AbortSignal; maxBytes: number }): Promise<WikisourcePage[]> {
  const fetchImpl = options.fetchImpl ?? fetch
  const main = await parsePage(target.lang, target.page, fetchImpl, options.signal)
  if (!main) throw new WikisourceError('not_found')
  const mainClean = cleanWikisourceHtml(main.html)
  let titles = subpageLinks(mainClean, main.title)
  if (!titles.length) return [{ title: main.title, label: main.title.split('/').pop() || main.title, html: stripLinks(mainClean) }]
  if (titles.length + 1 > MAX_WIKISOURCE_PAGES) throw new WikisourceError('source_too_large')
  let bytes = mainClean.length
  const read = async (title: string) => {
    const page = await parsePage(target.lang, title, fetchImpl, options.signal)
    if (!page) return null
    const html = cleanWikisourceHtml(page.html)
    bytes += html.length
    if (bytes > options.maxBytes) throw new WikisourceError('source_too_large')
    return { title: page.title, label: pageLabel(page.html, page.title), html }
  }
  let pages = (await inOrder(titles, WIKISOURCE_CONCURRENCY, read)).filter((page): page is WikisourcePage => !!page)
  // A volume page that only lists its own chapters: its chapters instead.
  const nested = pages.map(page => ownLetters(page.html) < CONTENTS_ONLY_LETTERS ? subpageLinks(page.html, page.title).filter(title => !titles.includes(title)) : [])
  const extra = nested.reduce((sum, list) => sum + list.length, 0)
  if (extra) {
    if (titles.length + extra + 1 > MAX_WIKISOURCE_PAGES) throw new WikisourceError('source_too_large')
    const expanded: WikisourcePage[] = []
    for (let i = 0; i < pages.length; i++) {
      if (!nested[i].length) { expanded.push(pages[i]); continue }
      titles = [...titles, ...nested[i]]
      const children = (await inOrder(nested[i], WIKISOURCE_CONCURRENCY, read)).filter((page): page is WikisourcePage => !!page)
      expanded.push(...(children.length ? children : [pages[i]]))
    }
    pages = expanded
  }
  if (!pages.length) throw new WikisourceError('not_found')
  if (ownLetters(mainClean) >= CONTENTS_ONLY_LETTERS * 2) pages.unshift({ title: main.title, label: main.title, html: mainClean })
  return pages.map(page => ({ ...page, html: stripLinks(page.html) }))
}

// ===== The EPUB =====

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Response(bytes).body!.pipeThrough(new CompressionStream('deflate-raw') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>)
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** A zip archive (mimetype stored first, everything else deflated), as EPUB asks. */
export async function zipEpub(files: Array<[string, string]>): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0
  for (const [name, content] of files) {
    const raw = encoder.encode(content)
    const nameBytes = encoder.encode(name)
    const method = name === 'mimetype' ? 0 : 8
    const data = method ? await deflateRaw(raw) : raw
    const crc = crc32(raw)
    const local = new Uint8Array(30 + nameBytes.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x800, true); lv.setUint16(8, method, true)
    lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, raw.length, true); lv.setUint16(26, nameBytes.length, true)
    local.set(nameBytes, 30)
    const central = new Uint8Array(46 + nameBytes.length)
    const cv = new DataView(central.buffer)
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x800, true); cv.setUint16(10, method, true)
    cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, raw.length, true); cv.setUint16(28, nameBytes.length, true)
    cv.setUint32(42, offset, true)
    central.set(nameBytes, 46)
    locals.push(local, data)
    centrals.push(central)
    offset += local.length + data.length
  }
  const directory = centrals.reduce((sum, part) => sum + part.length, 0)
  const end = new Uint8Array(22)
  const ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, directory, true); ev.setUint32(16, offset, true)
  const out = new Uint8Array(offset + directory + 22)
  let at = 0
  for (const part of [...locals, ...centrals, end]) { out.set(part, at); at += part.length }
  return out
}

const escapeXml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The pages as an EPUB 3: one document per page, its contents naming each by its chapter name. */
export async function wikisourceEpub(book: { title: string; author: string; lang: string; sourceUrl: string }, pages: WikisourcePage[]): Promise<Uint8Array> {
  const lang = escapeXml(book.lang)
  const docs = pages.map((page, index) => ({ id: `c${String(index + 1).padStart(4, '0')}`, ...page }))
  const xhtml = (title: string, body: string) => `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}" lang="${lang}"><head><title>${escapeXml(title)}</title></head><body>${body}</body></html>`
  const opf = `<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">${escapeXml(book.sourceUrl)}</dc:identifier><dc:title>${escapeXml(book.title)}</dc:title>${book.author ? `<dc:creator>${escapeXml(book.author)}</dc:creator>` : ''}<dc:language>${lang}</dc:language><dc:source>${escapeXml(book.sourceUrl)}</dc:source></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${docs.map(doc => `<item id="${doc.id}" href="${doc.id}.xhtml" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine>${docs.map(doc => `<itemref idref="${doc.id}"/>`).join('')}</spine></package>`
  const nav = xhtml(book.title, `<nav xmlns:epub="http://www.idpf.org/2007/ops" epub:type="toc"><ol>${docs.map(doc => `<li><a href="${doc.id}.xhtml">${escapeXml(doc.label)}</a></li>`).join('')}</ol></nav>`)
  return zipEpub([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['OEBPS/content.opf', opf],
    ['OEBPS/nav.xhtml', nav],
    ...docs.map(doc => [`OEBPS/${doc.id}.xhtml`, xhtml(doc.label, doc.html)] as [string, string]),
  ])
}
