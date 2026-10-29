/**
 * A reader's own EPUB as a Tinct edition: chapters of plain paragraphs, the
 * shape every built-in edition has (`{ number, title, paragraphs }`), so the
 * reader paginates, highlights and navigates it like any other book.
 *
 * Runs in the browser (DOMParser, DecompressionStream). Nothing from the file
 * is ever put into the page: chapters are read as XML and only their text is
 * kept. Reading order is the spine; chapter boundaries and titles come from
 * the table of contents (EPUB 3 nav, else the EPUB 2 NCX), falling back to one
 * chapter per spine document. Italics survive as the editions' `_..._`
 * emphasis markup; styles and scripts are dropped, and pictures become
 * figures kept beside the text (epubPictures.ts makes each one drawable).
 *
 * Structure survives beside the text, never in it: subheadings, table labels,
 * list items and a chapter's subtitle and byline are listed per paragraph
 * (`kinds`), web links by word range (`links`), and the reader paints them
 * (labParagraphStyle.ts). The book's cover, title pages, copyright page and
 * its own contents page are left out: the reader opens the first chapter
 * under the book's title and has its own chapter menu.
 *
 * DRM-protected books are refused (font obfuscation is allowed), with the same
 * codes and wording Add a book uses.
 */

import { normalizeChapterTitles, romanValue } from '../../../public/lab/chapter-title.js'
import { dropPrintedContents } from '../../../public/lab/printed-contents.js'
import { LEGACY_EDITION_CONVERTER, USER_EDITION_CONVERTER, USER_EDITION_CONVERTERS, USER_EDITION_FORMAT, type UserBookChapter, type UserBookEdition, type UserBookParagraphKind } from './userEdition'
import type { ChapterFigure } from '../../types'
import { figureToken } from '../labFigures'
import { isPlayText } from '../labVerseLines'
import { bylineName, chapterAuthors, nameLike, personName, sameWriter, type AuthorCandidate, type BookCreators } from './chapterAuthors'
import { MAX_STORED_PICTURE_BYTES, imageSize, pictureType, preparePicture, sniffImageType } from './epubPictures'

export { imageSize }
export { bylineName, sameWriter } from './chapterAuthors'

export { LEGACY_EDITION_CONVERTER, USER_EDITION_CONVERTER, USER_EDITION_FORMAT, type UserBookChapter, type UserBookEdition }

export type EpubErrorCode = 'unsupported' | 'not_zip' | 'zip64' | 'bad_zip' | 'drm' | 'bad_epub'

export class EpubError extends Error {
  code: EpubErrorCode
  constructor(code: EpubErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

const DRM_MESSAGE = 'This book is protected by DRM (copy protection), so it cannot be opened here. Books you buy from many stores are protected; DRM-free EPUBs open fine.'

/* ---------- ZIP ---------- */

interface ZipEntry { name: string; method: number; compSize: number; local: number; encrypted: boolean }

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') throw new EpubError('unsupported', 'This browser cannot open EPUB files. Try a current version of Chrome, Safari, Firefox or Edge.')
  const source = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(bytes); controller.close() } })
  const stream = source.pipeThrough(new DecompressionStream('deflate-raw') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>)
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

export function openZip(input: ArrayBuffer | Uint8Array) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  // End of central directory: scan back over a possible archive comment.
  let eocd = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new EpubError('not_zip', 'This file is not a valid EPUB (it is not a ZIP archive).')
  const count = view.getUint16(eocd + 10, true)
  const cdOffset = view.getUint32(eocd + 16, true)
  if (cdOffset === 0xffffffff) throw new EpubError('zip64', 'This EPUB is too large to open here.')
  const entries = new Map<string, ZipEntry>()
  const utf8 = new TextDecoder('utf-8')
  const latin1 = new TextDecoder('latin1')
  const strictUtf8 = new TextDecoder('utf-8', { fatal: true })
  let p = cdOffset
  for (let n = 0; n < count; n++) {
    if (p + 46 > bytes.length || view.getUint32(p, true) !== 0x02014b50) throw new EpubError('bad_zip', 'This EPUB is damaged (its file list is unreadable).')
    const flags = view.getUint16(p + 8, true)
    const method = view.getUint16(p + 10, true)
    const compSize = view.getUint32(p + 20, true)
    const nameLen = view.getUint16(p + 28, true)
    const extraLen = view.getUint16(p + 30, true)
    const commentLen = view.getUint16(p + 32, true)
    const local = view.getUint32(p + 42, true)
    const raw = bytes.subarray(p + 46, p + 46 + nameLen)
    // Many zip tools write UTF-8 names without setting the flag that says so.
    let name: string
    if (flags & 0x800) name = utf8.decode(raw)
    else { try { name = strictUtf8.decode(raw) } catch { name = latin1.decode(raw) } }
    entries.set(name, { name, method, compSize, local, encrypted: (flags & 1) === 1 })
    p += 46 + nameLen + extraLen + commentLen
  }
  async function read(name: string): Promise<Uint8Array | null> {
    const entry = entries.get(name)
    if (!entry) return null
    if (entry.encrypted) throw new EpubError('drm', 'This book is password-protected and cannot be opened.')
    if (entry.local + 30 > bytes.length || view.getUint32(entry.local, true) !== 0x04034b50) throw new EpubError('bad_zip', 'This EPUB is damaged.')
    const start = entry.local + 30 + view.getUint16(entry.local + 26, true) + view.getUint16(entry.local + 28, true)
    const data = bytes.subarray(start, start + entry.compSize)
    if (entry.method === 0) return data
    if (entry.method === 8) return inflateRaw(data)
    throw new EpubError('bad_zip', 'This EPUB uses an unsupported compression method.')
  }
  const readText = async (name: string) => { const data = await read(name); return data ? utf8.decode(data) : null }
  // A file named loosely: the case, Unicode form or URL-escaping differs between the
  // reference and the archive (made on a case-insensitive disk, or by a careless tool).
  let loose: Map<string, string> | null = null
  const looseKey = (name: string) => {
    let out = name
    try { out = decodeURIComponent(out) } catch { /* keep as written */ }
    return out.normalize('NFC').toLowerCase()
  }
  function find(name: string): string | null {
    if (!name) return null
    if (entries.has(name)) return name
    if (!loose) {
      loose = new Map()
      for (const key of entries.keys()) if (!loose.has(looseKey(key))) loose.set(looseKey(key), key)
    }
    return loose.get(looseKey(name)) ?? null
  }
  return { entries, read, readText, find, has: (name: string) => entries.has(name) }
}

/* ---------- Paths and XML ---------- */

export function resolveHref(base: string, href: string): string {
  if (!href) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return href
  const dir = base.includes('/') ? base.slice(0, base.lastIndexOf('/') + 1) : ''
  const parts: string[] = []
  for (const segment of (href.startsWith('/') ? href.slice(1) : dir + href).split('/')) {
    if (segment === '..') parts.pop()
    else if (segment !== '.' && segment !== '') parts.push(segment)
  }
  let out = parts.join('/')
  try { out = decodeURIComponent(out) } catch { /* keep as written */ }
  return out
}

const splitHash = (href: string): [string, string] => {
  const i = href.indexOf('#')
  return i < 0 ? [href, ''] : [href.slice(0, i), href.slice(i + 1)]
}

function parseXml(text: string): Document {
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length) throw new EpubError('bad_epub', 'This EPUB is damaged (its package file cannot be read).')
  return doc
}

/**
 * Elements of a local name in any namespace, in document order. Asked of the DOM by name
 * (getElementsByTagNameNS '*'): the same elements as filtering every element by
 * localName, without listing a whole book's elements to find its <body>. That listing
 * took Roget's Thesaurus (PG 10681, one document of most of the book) over ten minutes
 * in jsdom, where the Gutenberg Add to Tinct check converts.
 */
const byLocal = (root: Document | Element, name: string): Element[] => [...root.getElementsByTagNameNS('*', name)]
const clean = (text: string | null | undefined) => (text || '').replace(/\s+/g, ' ').trim()
const textOf = (root: Document | Element, name: string) => clean(byLocal(root, name)[0]?.textContent)
const epubType = (el: Element) => (el.getAttribute('epub:type') || el.getAttributeNS('http://www.idpf.org/2007/ops', 'type') || '').toLowerCase()

const ALLOWED_ENCRYPTION = new Set(['http://www.idpf.org/2008/embedding', 'http://ns.adobe.com/pdf/enc#RC'])

/* ---------- Text: blocks of one document ---------- */


/** One paragraph of a document, before chapters are cut. */
interface Block {
  text: string
  /** Set as a heading: an h1–h6, or a short paragraph styled as one. */
  heading: boolean
  kind?: UserBookParagraphKind
  /** The heading element's level (1–6), when it is one. */
  level?: number
  /** The source names it a subtitle or a byline (by class or epub:type). */
  hint?: 'subtitle' | 'byline'
  /** External links by word range [from, to). Bare addresses are links by their own text. */
  links?: Array<[number, number, string]>
  /** Opens with a bold lead-in ("Hosts: …", "About the author: …"): a labelled line, never a subtitle or byline. */
  lead?: boolean
  /** A picture standing here (its text is a placeholder until the figure is numbered). */
  figure?: Picture
  /** The numbered figure, once its image has been read. */
  meta?: ChapterFigure
  /** The first block of a document whose head names its own author (`<meta name="author">`). */
  writer?: string
}

/** A picture found in the text, before its image is read. */
interface Picture {
  /** Its file in the EPUB, or an inline SVG drawing. */
  href?: string
  /** Other files the source names for it (data-src, srcset), tried when `href` cannot be read. */
  alternates?: string[]
  /** The picture written into the page itself (a data: URL). */
  data?: string
  svg?: string
  alt: string
  caption?: string
}

interface DocumentBlocks {
  blocks: Block[]
  /** Element id → index of the block it starts in (or precedes). */
  anchors: Map<string, number>
  /** Ids inside the source library's own matter (left out), so contents entries pointing there are dropped too. */
  dropped: Set<string>
  /** Nothing but the library's own matter: no chapter starts here. */
  libraryOnly: boolean
  images: number
  /** The document's own epub:type / role (body and its first section): cover, titlepage, toc, … */
  docType: string
  /** Rules 6: the document carries Wikisource's export stamp (its title page). */
  wikisourceStamp?: boolean
}

/** Decoration, not a figure: ornaments, dividers, logos, icons (by file name, class or id). */
const DECORATION = /(^|[\W_])(ornaments?|orn|fleurons?|dinkus|dingbats?|dividers?|separators?|seperators?|flourish(es)?|decorations?|decorative|spacers?|logos?|icons?|bullets?)\d*([\W_]|$)/i
/** A paragraph set as a picture's caption. */
const CAPTION_CLASS = /^(caption|figcaption|fig-?cap(tion)?|illus-?cap(tion)?|image-?caption|figure-?caption|pic-?caption)[-_]?\d*$/i
/** A caption that names itself ("Figure 3. …", "Plate II: …"). */
const CAPTION_TEXT = /^(fig(ure)?|plate|illustration|map|diagram)\.?\s*[\divxlc]+[a-z]?\s*[.:—–-]/i
/** Stands in for a figure's text until it is numbered. */
const PICTURE_PLACEHOLDER = '\uFFFC'

/**
 * The source library's own matter, not the book: Project Gutenberg's header
 * and footer (licence) blocks, Standard Ebooks' imprint, colophon and
 * uncopyright sections.
 */
function libraryMatter(el: Element, v6 = false): boolean {
  const id = (el.getAttribute('id') || '').toLowerCase()
  if (id === 'pg-header' || id === 'pg-footer') return true
  const cls = (el.getAttribute('class') || '').toLowerCase()
  if (/(^|\s)(pg-boilerplate|pgheader|pgfooter)(\s|$)/.test(cls)) return true
  // Rules 6: Wikisource's licence banner ("This work is in the public domain in the United States …").
  if (v6 && /(^|\s)(licensecontainer|licencecontainer|ws-noexport)(\s|$)/.test(cls)) return true
  return /(^|\s)(imprint|colophon|copyright-page)(\s|$)/.test(epubType(el))
}

/** A whole document that is a Wikisource export's own page (about the digital edition, credits). */
function wikisourceMatter(blocks: Block[]): boolean {
  const first = blocks[0]?.text.replace(/_/g, '').trim() || ''
  return /^(about this digital edition|credits)$/i.test(first) && blocks.some(block => /wikisource/i.test(block.text))
}

// Project Gutenberg's plain-text markers, for files without the marked-up header and footer.
const PG_START = /^\*{3}\s*START OF (THE|THIS) PROJECT GUTENBERG E-?BOOK/i
const PG_END = /^(\*{3}\s*END OF (THE|THIS) PROJECT GUTENBERG E-?BOOK|End of (the )?Project Gutenberg'?s? E-?Book)/i

const BLOCK = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'hr', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'caption', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav', 'center', 'address', 'hgroup', 'body', 'html', 'details', 'summary'])
const DROP = new Set(['head', 'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea', 'noscript', 'video', 'audio', 'canvas', 'template', 'link', 'meta', 'title', 'base', 'source', 'track', 'map', 'area', 'frame', 'frameset', 'applet', 'dialog', 'rt', 'rp'])
const PICTURE = new Set(['img', 'svg', 'image', 'picture'])
const EMPHASIS = new Set(['em', 'i'])
const STRONG = new Set(['strong', 'b'])
const NOTE_MARKER = /^[[(]?(\d{1,3}|[*†‡§¶]+)[\])]?$/
/** Rules 6: a lettered call too ("2a", Gibbon's editor's notes). */
const NOTE_MARKER_6 = /^[[(]?(\d{1,3}[a-z]?|[*†‡§¶]+)[\])]?$/
/** A footnote's way back to its call ("101 (return)", "↩", "[back]"): never the note's text. */
const NOTE_BACKLINK = /^[[(]?\d{0,4}[a-z]?[\])]?\s*[[(]?\s*(?:return|back|↩︎?|↑)\s*[\])]?\.?$/i
/** Wikisource's export stamp on its title page. */
const WIKISOURCE_STAMP = /^exported from wikisource on\b/i
/** Project Gutenberg's line naming the ebook, set right after its header ("The Project Gutenberg eBook of Poems 1817, by John Keats"). */
const PG_TITLE_LINE = /^the project gutenberg'?s? e-?book,? of\b/i

/** An inline font size set larger than the text (`font-size: large`, `144%`, `1.5em`), smaller, or neither (undefined). */
function inlineFontLarge(el: Element): boolean | undefined {
  const match = /(?:^|;)\s*font-size\s*:\s*([^;]+)/i.exec(el.getAttribute('style') || '')
  if (!match) return undefined
  const value = match[1].trim().toLowerCase()
  if (/^(larger|large|x-large|xx-large|xxx-large)$/.test(value)) return true
  const percent = /^([\d.]+)%$/.exec(value)
  if (percent) return Number(percent[1]) >= 120
  const em = /^([\d.]+)r?em$/.exec(value)
  if (em) return Number(em[1]) >= 1.2
  return false
}
/** Where lazy-loading pages keep a picture's real file while `src` holds a placeholder. */
const LAZY_SRC = ['data-src', 'data-original', 'data-lazy-src', 'data-full-src', 'data-hi-res-src']
/** The files a srcset names, the widest first. */
function srcsetFiles(srcset: string | null): string[] {
  if (!srcset) return []
  return srcset.split(/,\s+/).map(part => {
    const [url, size = ''] = part.trim().split(/\s+/)
    return { url, rank: parseFloat(size) || 1 }
  }).filter(item => item.url).sort((a, b) => b.rank - a.rank).map(item => item.url)
}

/** Class names publishers give a paragraph that is set as a heading. */
const HEADING_CLASS = /^(h[1-6]|head(ing)?|sub-?head(ing)?|cht|chtitle|ct|cn|fmh|fmt|bmh|bmt|chapter-?title|chap-?title|part-?title|section-?title|title)[-_]?\d*$/i
const SUBTITLE_CLASS = /^(sub-?title|chapter-?subtitle|cst|deck|tagline|strapline)[-_]?\d*$/i
const BYLINE_CLASS = /^(by-?line|author|chapter-?author|essay-?author|contributor|chap-?au|cau|au)[-_]?\d*$/i
/** A bullet typed into the text, which the reader draws itself. */
const TYPED_BULLET = /^[•●▪◦‣■□►➢]\s*/
/** Characters that print nothing: a paragraph of only these (or of bullets alone) is empty. */
const INVISIBLE = /[\u00ad\u200b-\u200d\u2060\ufeff]/g
const EMPTY_PARAGRAPH = /^[\s•●▪◦‣■□►➢]*$/
/** A label that only announces the address after it ("Link", "URL"): the link shows itself. */
const LINK_LABEL = /^(links?|url|web ?links?|web ?address)\s*:?$/i
/** Headings are short; a long bold paragraph is emphasis, not a heading. */
const HEADING_MAX_WORDS = 14

// Private-use marks around a link's words while a paragraph is joined; never kept.
const LINK_START = '\uE000'
const LINK_END = '\uE001'

interface Segment { text: string; em: boolean; strong?: boolean; link?: number; br?: true; large?: boolean }

/** The share of a run's letters set in a larger inline font size. */
function largeShare(segments: Segment[]): number {
  let large = 0
  let all = 0
  for (const segment of segments) {
    const count = segment.text.replace(/[^\p{L}\p{N}]/gu, '').length
    all += count
    if (segment.large) large += count
  }
  return all ? large / all : 0
}

/**
 * Join a paragraph's text runs, marking italic runs `_like this_` where the
 * reader's emphasis parser (emphasisText.ts) will read them back exactly:
 * whole words, no underscores inside. Anything else stays plain text, so the
 * word sequence is the same either way.
 */
export function joinSegments(segments: Segment[]): string {
  const runs: Segment[] = []
  for (const segment of segments) {
    const text = segment.text.replace(/\s+/g, ' ')
    if (!text) continue
    const last = runs[runs.length - 1]
    // A space between two italic runs (a line break the print set) stays inside the italics.
    if (last && (last.em === segment.em || !text.trim())) last.text += text
    else runs.push({ text, em: segment.em })
  }
  let out = ''
  runs.forEach((run, index) => {
    if (!run.em) { out += run.text; return }
    const lead = run.text.match(/^\s*/)![0]
    const trail = run.text.match(/\s*$/)![0]
    const core = run.text.trim()
    if (!core) { out += run.text; return }
    const before = (out + lead).slice(-1)
    const after = trail ? ' ' : (runs[index + 1]?.text ?? '').charAt(0)
    const fits = !core.includes('_') && !/\w/.test(before) && !/\w/.test(after)
    out += lead + (fits ? `_${core}_` : core) + trail
  })
  return out.replace(/\s+/g, ' ').trim()
}

const classTokens = (el: Element) => (el.getAttribute('class') || '').split(/\s+/).filter(Boolean)
const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length

/** A web address shown as a link's text ("youtu.be/x", "www.site.org"): the reader shows it by its domain instead. */
const looksLikeAddress = (text: string) => !/\s/.test(text) && (/^(https?:\/\/|www\.)/i.test(text) || /^[\w-]+(\.[\w-]+)+\/\S*$/.test(text))

function externalHref(href: string | null): string | null {
  const value = (href || '').trim()
  if (!/^https?:\/\/[^\s<>"]+$/i.test(value)) return null
  try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : null } catch { return null }
}

/** Capitalised words a line of verse (or any sentence) commonly opens on: never taken for a name. */
const VERSE_OPENERS = new Set(('a an and as at but by for from he her his how i if in is it its my no nor not now o of oh on or our she so than that the thee their then there these they this those thou thus thy till to under upon us we what when where which while who whose why will with ye yet you your'
  + ' all be come do did had has have let may me must one shall should some such was were would').split(' '))

/**
 * Whether a line opens on a person's name: a capitalised word that is not a
 * common opener, followed by a comma or by a second capitalised word
 * ("Koberle, Tomas …", "Anders Hvelplund, and …"). "And Robin …", "The
 * sea, …" and "Thou art …" are verse, not names.
 */
function opensOnName(line: string): boolean {
  const match = /^(\p{Lu}[\p{Ll}'’-]+)(,|\s+\p{Lu}[\p{Ll}'’.-]*)/u.exec(line)
  return !!match && !VERSE_OPENERS.has(match[1].toLowerCase())
}

function documentBlocks(source: string, base = '', v6 = false, v8 = false, v9 = false): DocumentBlocks {
  let wikisourceStamp = false
  let doc = new DOMParser().parseFromString(source, 'application/xhtml+xml')
  if (doc.getElementsByTagName('parsererror').length) doc = new DOMParser().parseFromString(source, 'text/html')
  const body = byLocal(doc, 'body')[0] || doc.documentElement
  // Only join a printed split when this document independently spells the
  // whole word without a hyphen. Keep ambiguous and authored compounds.
  const wordEvidence = new Set<string>()
  if (v9 && byLocal(body, 'br').length) {
    const copy = body.cloneNode(true) as Element
    for (const br of byLocal(copy, 'br')) br.replaceWith(doc.createTextNode(' '))
    const walker = doc.createTreeWalker(copy, NodeFilter.SHOW_TEXT)
    const pieces: string[] = []
    while (walker.nextNode()) pieces.push(walker.currentNode.textContent || '')
    for (const token of pieces.join(' ').match(/\p{L}+(?:-\p{L}+)*/gu) || []) wordEvidence.add(token.toLowerCase())
  }
  const firstSection = [...body.children].find(child => /^(section|div|article)$/i.test(child.localName))
  const docType = [body, firstSection].filter((el): el is Element => !!el)
    .map(el => `${epubType(el)} ${(el.getAttribute('role') || '').toLowerCase()}`).join(' ')
  const blocks: Block[] = []
  const anchors = new Map<string, number>()
  const dropped = new Set<string>()
  const hrefs: string[] = []
  let libraryMatterSeen = false
  let images = 0
  let segments: Segment[] = []
  let heading = false
  // The block elements open around the text being gathered, innermost last.
  const open: Element[] = []
  // Pictures met inside a sentence: they stand after their paragraph, never in it.
  let pending: Picture[] = []

  /** A picture element as a figure, or null for decoration or a picture the book does not hold. */
  const pictureOf = (el: Element): Picture | null => {
    const name = el.localName.toLowerCase()
    const role = (el.getAttribute('role') || '').toLowerCase()
    if (role === 'presentation' || role === 'none' || el.getAttribute('aria-hidden') === 'true') return null
    if (name === 'picture') { const img = byLocal(el, 'img')[0]; return img ? pictureOf(img) : null }
    if (name === 'svg') {
      const image = byLocal(el, 'image')[0]
      if (image) return pictureOf(image)
      // A drawing set in the page: kept as an SVG picture when it says how large it is.
      if (!(el.getAttribute('viewBox') || (el.getAttribute('width') && el.getAttribute('height')))) return null
      if ([...classTokens(el), el.getAttribute('id') || ''].some(token => DECORATION.test(token))) return null
      let svg = ''
      try { svg = new XMLSerializer().serializeToString(el) } catch { return null }
      if (!/xmlns=/.test(svg.slice(0, 200))) svg = svg.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
      return svg.length < 2_000_000 ? { svg, alt: clean(el.getAttribute('aria-label') || byLocal(el, 'title')[0]?.textContent) } : null
    }
    // Every file the element names for its picture, the one it shows first: its src
    // (or an SVG image's href), then what a lazy-loading or responsive page names.
    const named = name === 'img'
      ? [el.getAttribute('src'), ...LAZY_SRC.map(attr => el.getAttribute(attr)), ...srcsetFiles(el.getAttribute('srcset')), ...srcsetFiles(el.getAttribute('data-srcset'))]
      : [el.getAttribute('href'), el.getAttributeNS('http://www.w3.org/1999/xlink', 'href'), el.getAttribute('xlink:href')]
    const candidates = named.map(value => (value || '').trim()).filter(Boolean)
    const data = candidates.find(value => /^data:image\//i.test(value))
    const files = [...new Set(candidates.filter(value => !/^[a-z][a-z0-9+.-]*:/i.test(value)).map(value => resolveHref(base, value.split('#')[0].split('?')[0])).filter(Boolean))]
    if (!files.length && !data) return null
    // A lazy page's placeholder ("spacer.gif") does not make its real picture decoration.
    if ((files.length && files.every(path => DECORATION.test(path.split('/').pop() || ''))) || [...classTokens(el), el.getAttribute('id') || ''].some(token => DECORATION.test(token))) return null
    const alt = clean(el.getAttribute('alt') || el.getAttribute('title'))
    return { ...(files[0] ? { href: files[0] } : {}), ...(files.length > 1 ? { alternates: files.slice(1) } : {}), ...(data && !files.length ? { data } : {}), alt }
  }
  const pictureBlock = (figure: Picture): Block => ({ text: PICTURE_PLACEHOLDER, heading: false, figure })

  /**
   * End the paragraph being gathered. A line break inside it ends a paragraph
   * too (verse, addresses), unless the whole paragraph is set as a heading:
   * "ROBERT<br/>LAWRENCE KUHN:<br/>CLOSER TO TRUTH" is one title.
   */
  const flush = () => {
    gather()
    if (pending.length) { blocks.push(...pending.map(pictureBlock)); pending = [] }
  }
  const gather = () => {
    const gathered = segments
    segments = []
    if (!gathered.some(segment => segment.br)) { emit(gathered); return }
    const text = gathered.map(segment => segment.text).join('').replace(/\s+/g, ' ').trim()
    const strongOnly = gathered.every(segment => segment.strong || !segment.text.trim())
    const tokens = open.slice(-2).flatMap(classTokens)
    if (wordCount(text) <= HEADING_MAX_WORDS && !/[.,;:]$/.test(text) && (strongOnly || tokens.some(token => HEADING_CLASS.test(token)))) {
      emit(gathered)
      return
    }
    // Rules 6: a title set in a larger type over its lines ("XI.<br/>On first looking
    // into Chapman's Homer.", "SPECIMEN<br/>OF AN<br/>INDUCTION TO A POEM.") is one title.
    if (v6 && wordCount(text) <= HEADING_MAX_WORDS && !/[,;:]$/.test(text) && largeShare(gathered) >= 0.6) {
      emit(gathered.map(segment => segment.br ? { ...segment, br: undefined } : segment))
      return
    }
    // Lines set apart by breaks (a poem, an address, centred credits) are lines, not justified prose.
    const runs: Segment[][] = [[]]
    for (const segment of gathered) {
      if (segment.br) runs.push([])
      else runs[runs.length - 1].push(segment)
    }
    // Unless the print broke a sentence mid-clause ("Major support for this volume /
    // was provided by …"): a line ending on a bare word before one that starts in
    // lower case is the page's wrapping, not the author's. Then it is one paragraph.
    const lineText = (run: Segment[]) => run.map(segment => segment.text).join('').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim()
    const lines = runs.map(lineText)
    // Plain-text verse uses hanging indentation for a long line's continuation.
    // Require multiple lines at the base indentation and a deeper continuation;
    // ordinary print-wrapped prose (including a first-line indent) is unchanged.
    const indents = runs.map(run => (run.map(segment => segment.text).join('').match(/^[ \t]*/)?.[0] || '').replace(/\t/g, '    ').length)
    const baseIndent = Math.min(...indents)
    const continuation = (index: number) => index > 0 && indents[index] >= baseIndent + 2
      && /\p{L}$/u.test(lines[index - 1]) && /^\p{Ll}/u.test(lines[index])
    const hanging = v8 && indents.filter(indent => indent === baseIndent).length >= 2
      && indents.some((_indent, index) => continuation(index))
    if (hanging) {
      const groups: Segment[][] = []
      for (let index = 0; index < runs.length; index++) {
        if (groups.length && continuation(index)) groups[groups.length - 1].push({ text: ' ', em: false }, ...runs[index])
        else groups.push([...runs[index]])
      }
      for (const group of groups) emit(group, true)
      return
    }
    // Earlier conversions keep their paragraph coordinates on every device.
    const wrapped = lines.some((line, index) => index > 0 && ((/\p{L}$/u.test(lines[index - 1]) && /^\p{Ll}/u.test(line))
      || (/,$/.test(lines[index - 1]) && opensOnName(line))
      // A title at the printed line end continues into the following name.
      || (v8 && /\b(?:Mr|Mrs|Ms|Dr)\.$/.test(lines[index - 1]) && /^\p{Lu}/u.test(line))))
    if (wrapped) {
      if (!v9) { emit(gathered); return }
      const joined = gathered.map(segment => ({ ...segment }))
      for (let index = 0; index < joined.length; index++) {
        if (!joined[index].br) continue
        let before = index - 1, after = index + 1
        while (before >= 0 && !joined[before].br && !joined[before].text.trim()) before--
        while (after < joined.length && !joined[after].br && !joined[after].text.trim()) after++
        const last = joined[before], first = joined[after]
        if (!last || !first || last.br || first.br) continue
        const left = last.text.match(/(\p{L}+)-\s*$/u)?.[1]
        const right = first.text.match(/^\s*(\p{Ll}+)/u)?.[1]
        if (left && right && wordEvidence.has((left + right).toLowerCase())
          && !wordEvidence.has((left + '-' + right).toLowerCase())) {
          last.text = last.text.replace(/-\s*$/, '')
          for (let gap = before + 1; gap < after; gap++) joined[gap].text = ''
          first.text = first.text.trimStart()
        }
      }
      emit(joined)
      return
    }
    for (const run of runs) emit(run, true)

  }

  const emit = (segments: Segment[], line = false) => {
    if (EMPTY_PARAGRAPH.test(segments.map(segment => segment.text).join('').replace(INVISIBLE, ''))) return
    const allStrong = segments.every(segment => segment.strong || !segment.text.trim())
    const inked = segments.filter(segment => segment.text.trim())
    const lead = !!inked[0]?.strong && inked.some(segment => !segment.strong)
    // Mark each link's words, then find them again by word once the text is joined.
    const marked = segments.map(segment => ({ ...segment }))
    const markedHrefs: string[] = []
    for (let i = 0; i < marked.length; i += 1) {
      const id = marked[i].link
      if (id == null || (i > 0 && segments[i - 1].link === id)) continue
      let j = i
      while (j + 1 < marked.length && marked[j + 1].link === id) j += 1
      const whole = marked.slice(i, j + 1).map(segment => segment.text).join('').replace(/\s+/g, ' ').trim()
      if (!whole) continue
      if (looksLikeAddress(whole)) {
        // The address is the word: the reader links any bare address by itself.
        const lead = marked[i].text.match(/^\s*/)![0]
        const trail = marked[j].text.match(/\s*$/)![0]
        marked[i] = { ...marked[i], text: `${lead}${hrefs[id]}${trail}` }
        for (let k = i + 1; k <= j; k += 1) marked[k] = { ...marked[k], text: '' }
        continue
      }
      marked[i] = { ...marked[i], text: marked[i].text.replace(/^(\s*)/, `$1${LINK_START}`) }
      marked[j] = { ...marked[j], text: marked[j].text.replace(/(\s*)$/, `${LINK_END}$1`) }
      markedHrefs.push(hrefs[id])
    }
    let text = joinSegments(marked)
    const links: Array<[number, number, string]> = []
    if (text.includes(LINK_START)) {
      const words = text.split(' ')
      let start = -1
      words.forEach((word, index) => {
        if (word.includes(LINK_START)) start = index
        if (word.includes(LINK_END) && start >= 0) {
          const href = markedHrefs[links.length]
          if (href) links.push([start, index + 1, href])
          start = -1
        }
      })
      text = words.map(word => word.split(LINK_START).join('').split(LINK_END).join('')).join(' ').replace(/\s+/g, ' ').trim()
    }
    text = text.replace(INVISIBLE, '').replace(/\s+/g, ' ').trim()
    if (EMPTY_PARAGRAPH.test(text)) return
    if (v6) {
      // A footnote's backlink ("101 (return)") and Wikisource's export stamp are not the book's text.
      if (NOTE_BACKLINK.test(plain(text))) return
      if (WIKISOURCE_STAMP.test(plain(text))) { wikisourceStamp = true; return }
      // A note that opens on its way back ("↑ Corsica."): the note alone.
      if (/^[↑↩]︎?\s+\S/.test(text)) {
        text = text.replace(/^[↑↩]︎?\s+/, '')
        for (const link of links) { link[0] = Math.max(0, link[0] - 1); link[1] = Math.max(link[0] + 1, link[1] - 1) }
      }
    }
    // A picture's caption set as the paragraph after it.
    const previous = blocks[blocks.length - 1]
    if (previous?.figure && !previous.figure.caption && wordCount(text) <= 80
      && (open.slice(-2).flatMap(classTokens).some(token => CAPTION_CLASS.test(token)) || CAPTION_TEXT.test(plain(text)))) {
      previous.figure.caption = plain(text)
      return
    }
    const block: Block = { text, heading }
    if (links.length) block.links = links
    if (lead) block.lead = true
    const top = open[open.length - 1]
    const headingEl = [...open].reverse().find(el => /^h[1-6]$/i.test(el.localName))
    const short = wordCount(text) <= HEADING_MAX_WORDS && !/[.,;:]$/.test(text)
    const cell = open.some(el => /^(td|th)$/i.test(el.localName))
    const tokens = open.slice(-2).flatMap(classTokens)
    const types = open.slice(-2).map(el => `${epubType(el)} ${(el.getAttribute('role') || '').toLowerCase()}`).join(' ')
    if (headingEl) {
      block.kind = 'heading'
      block.level = Number(headingEl.localName.slice(1))
    } else if (cell && (open.some(el => el.localName.toLowerCase() === 'th') || (allStrong && short))) {
      // A table's row label ("Date", "Link") above its value.
      block.kind = 'label'
    } else if (open.some(el => el.localName.toLowerCase() === 'li') || TYPED_BULLET.test(text)) {
      block.kind = 'item'
      block.text = text.replace(TYPED_BULLET, '')
      if (!block.text) return
    } else if (top && short && (allStrong || tokens.some(token => HEADING_CLASS.test(token)))) {
      block.kind = 'heading'
      block.heading = true
    } else if (v6 && top && wordCount(text) <= HEADING_MAX_WORDS && !/[,;:]$/.test(text) && /\p{L}/u.test(text) && largeShare(segments) >= 0.6) {
      // Rules 6: a line set in a larger type is a heading (an old table-set poem's title).
      block.kind = 'heading'
      block.heading = true
    } else if (allStrong && wordCount(text) <= 8 && /:$/.test(text)) {
      // A bold line that introduces what follows ("About the hosts:", "Homepage:").
      block.kind = 'label'
    }
    if (!block.kind && (line || open.some(el => el.localName.toLowerCase() === 'span' && /(^|\s)(line|verse)(\s|$)/i.test(el.getAttribute('class') || '')))) block.kind = 'line'
    if (tokens.some(token => SUBTITLE_CLASS.test(token)) || /\bsubtitle\b/.test(types)) block.hint = 'subtitle'
    else if (tokens.some(token => BYLINE_CLASS.test(token)) || /\b(byline|doc-credit|author)\b/.test(types)) block.hint = 'byline'
    blocks.push(block)
  }

  const walk = (node: Node, em: boolean, inHeading: boolean, strong: boolean, link: number | undefined, large = false) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3 || child.nodeType === 4) {
        if (segments.length === 0 && !(child.nodeValue || '').trim()) continue
        if (segments.length === 0) heading = inHeading
        segments.push({ text: child.nodeValue || '', em, strong, link, ...(large ? { large } : {}) })
        continue
      }
      if (child.nodeType !== 1) continue
      const el = child as Element
      const name = el.localName.toLowerCase()
      if (DROP.has(name)) continue
      // Rules 6: text set in a larger type than the page's (only inline sizes are read).
      const big = v6 ? inlineFontLarge(el) ?? large : false
      if (libraryMatter(el, v6)) {
        libraryMatterSeen = true
        for (const inner of [el, ...el.getElementsByTagName('*')]) { const id = inner.getAttribute('id'); if (id) dropped.add(id) }
        continue
      }
      const id = el.getAttribute('id') || (name === 'a' ? el.getAttribute('name') : null)
      if (id && !anchors.has(id)) anchors.set(id, blocks.length)
      if (name === 'figure') {
        // A figure element: its picture, captioned by its figcaption.
        const inner = [...el.getElementsByTagName('*')].find(child => PICTURE.has(child.localName.toLowerCase()))
        if (inner) {
          flush()
          const picture = pictureOf(inner)
          if (!picture) { images++; continue }
          const caption = byLocal(el, 'figcaption')[0]
          if (caption) picture.caption = plain(clean(caption.textContent)) || undefined
          for (const child of el.getElementsByTagName('*')) { const childId = child.getAttribute('id'); if (childId && !anchors.has(childId)) anchors.set(childId, blocks.length) }
          blocks.push(pictureBlock(picture))
          continue
        }
      }
      if (PICTURE.has(name)) {
        const picture = pictureOf(el)
        if (!picture) { images++; continue }
        // Inside a sentence it stands after the paragraph; between paragraphs, here.
        if (segments.some(segment => segment.text.trim())) pending.push(picture)
        else { flush(); blocks.push(pictureBlock(picture)) }
        continue
      }
      // A line break ends a paragraph (verse, addresses), but not a heading: "I.<br/>Introduction" is one title.
      if (name === 'br') { if (segments.length) segments.push({ text: ' ', em, strong, link, ...(inHeading ? {} : { br: true as const }) }); continue }
      const type = epubType(el)
      if (name === 'a' || name === 'sup' || name === 'span') {
        // Note markers ("1", "*", "[3]") that only point elsewhere in the book.
        const role = (el.getAttribute('role') || '').toLowerCase()
        const href = el.getAttribute('href') || el.querySelector?.('a')?.getAttribute('href') || ''
        // A number linking to a print page ("107" in an index) is the book's text, not a note.
        const toPage = /#(page|pg|p)[_-]?[\divxlc]+$/i.test(href)
        if (/noteref/.test(type) || role === 'doc-noteref' || (href && !toPage && !/^[a-z][a-z0-9+.-]*:/i.test(href) && (v6 ? NOTE_MARKER_6 : NOTE_MARKER).test(clean(el.textContent)))) continue
      }
      // Only web links are kept; a link within the book, or any other scheme, is its text.
      let inner = link
      if (name === 'a' && link == null) {
        const href = externalHref(el.getAttribute('href'))
        if (href) { inner = hrefs.length; hrefs.push(href) }
      }
      const lineLike = name === 'span' && /(^|\s)(line|verse)(\s|$)/i.test(el.getAttribute('class') || '')
      if (BLOCK.has(name) || lineLike || name === 'tr' || name === 'td' || name === 'th') {
        if (name === 'td' || name === 'th') {
          // A cell's text runs on with its row's, unless the cell holds paragraphs of its own.
          if (segments.length) segments.push({ text: ' ', em: false })
          open.push(el)
          walk(el, em, inHeading, strong || name === 'th', inner, big)
          open.pop()
          continue
        }
        flush()
        open.push(el)
        walk(el, em, inHeading || /^h[1-6]$/.test(name), strong, inner, big)
        flush()
        open.pop()
        continue
      }
      if (name === 'math') {
        const text = el.getAttribute('alttext') || el.textContent || ''
        if (segments.length === 0) heading = inHeading
        segments.push({ text, em, strong, link })
        continue
      }
      walk(el, em || EMPHASIS.has(name), inHeading, strong || STRONG.has(name), inner, big)
    }
  }

  walk(body, false, false, false, undefined)
  flush()
  dropLinkLabels(blocks, anchors)
  if (v6) markVerse(blocks)
  return { blocks, anchors, dropped, libraryOnly: libraryMatterSeen && blocks.length === 0, images, docType, ...(wikisourceStamp ? { wikisourceStamp } : {}) }
}

/** Every word of a block is a web link (a bare address, or linked text). */
function onlyLinks(block: Block): boolean {
  const words = block.text.split(' ')
  return words.every((word, index) => /^[(“"‘']*https?:\/\/\S+$/i.test(word) || (block.links ?? []).some(([from, to]) => index >= from && index < to))
}

/**
 * A lone "Link" (or "URL") above an address says nothing the address does not:
 * the reader shows the address as a link already. Anchors after it move up one.
 */
function dropLinkLabels(blocks: Block[], anchors: Map<string, number>): void {
  for (let index = blocks.length - 2; index >= 0; index -= 1) {
    if (!LINK_LABEL.test(blocks[index].text) || !onlyLinks(blocks[index + 1])) continue
    blocks.splice(index, 1)
    for (const [id, at] of anchors) if (at > index) anchors.set(id, at - 1)
  }
}

/** A line that ends a sentence: verse mostly does not. */
const SENTENCE_END = /[.!?]["”’)\]_]*$/
/** A poem's number set on its own line ("VI.", "12."). */
const POEM_NUMBER = /^(?:[IVXLC]{1,7}|\d{1,3})\.?$/
/** Short enough to be a line of verse. */
const VERSE_LINE_WORDS = 12

/**
 * Rules 6: verse set one line to a paragraph (each line its own <div> or <p>)
 * is verse, not short prose: a run of four lines or more, every one short and
 * most not ending a sentence, become lines. A poem's number standing alone
 * above its lines ("VI.") is its heading. Kinds only; the text is unchanged.
 */
function markVerse(blocks: Block[]): void {
  const candidate = (block: Block) => !block.kind && !block.heading && !block.figure && !block.lead
    && wordCount(block.text) <= VERSE_LINE_WORDS && /\p{L}/u.test(block.text) && !POEM_NUMBER.test(plain(block.text))
  // Lines a line break already set apart run on with them ("We play at paste,<p>Till qualified<br/>for pearl").
  const verse = (block: Block) => candidate(block) || (block.kind === 'line' && wordCount(block.text) <= VERSE_LINE_WORDS)
  let start = 0
  while (start < blocks.length) {
    if (!verse(blocks[start])) { start += 1; continue }
    let end = start
    while (end < blocks.length && verse(blocks[end])) end += 1
    const run = blocks.slice(start, end)
    const sentences = run.filter(block => SENTENCE_END.test(plain(block.text))).length
    const words = run.reduce((sum, block) => sum + wordCount(block.text), 0)
    if (run.length >= 4 && sentences / run.length <= 0.34 && words / run.length >= 3) for (const block of run) if (!block.kind) block.kind = 'line'
    start = end
  }
  blocks.forEach((block, index) => {
    if (block.kind || block.heading || !POEM_NUMBER.test(plain(block.text))) return
    if (blocks[index + 1]?.kind === 'line' && blocks[index + 2]?.kind === 'line') block.kind = 'heading'
  })
}

/* ---------- Contents ---------- */

interface TocEntry { label: string; path: string; anchor: string; depth: number }

async function readToc(zip: ReturnType<typeof openZip>, manifest: Map<string, ManifestItem>, spineEl: Element | undefined): Promise<TocEntry[]> {
  const out: TocEntry[] = []
  const navItem = [...manifest.values()].find(item => item.props.includes('nav'))
  const navText = navItem ? await zip.readText(navItem.href) : null
  if (navItem && navText) {
    let doc = new DOMParser().parseFromString(navText, 'application/xhtml+xml')
    if (doc.getElementsByTagName('parsererror').length) doc = new DOMParser().parseFromString(navText, 'text/html')
    const navs = byLocal(doc, 'nav')
    const nav = navs.find(item => epubType(item).includes('toc')) || navs[0]
    const walk = (ol: Element, depth: number) => {
      for (const li of [...ol.children].filter(child => child.localName === 'li')) {
        const link = [...li.children].find(child => child.localName === 'a' || child.localName === 'span')
        const sub = [...li.children].find(child => child.localName === 'ol')
        const [path, anchor] = splitHash(resolveHref(navItem.href, link?.getAttribute('href') || ''))
        const label = clean(link?.textContent)
        if (label && path) out.push({ label, path, anchor, depth })
        if (sub && depth < 4) walk(sub, depth + 1)
      }
    }
    const ol = nav && [...nav.getElementsByTagName('*')].find(el => el.localName === 'ol')
    if (ol) walk(ol, 0)
  }
  if (out.length) return out
  const ncxItem = manifest.get(spineEl?.getAttribute('toc') || '') || [...manifest.values()].find(item => item.type === 'application/x-dtbncx+xml')
  const ncxText = ncxItem ? await zip.readText(ncxItem.href) : null
  if (ncxItem && ncxText) {
    let doc: Document
    try { doc = parseXml(ncxText) } catch { return out }
    const walk = (parent: Element, depth: number) => {
      for (const point of [...parent.children].filter(child => child.localName === 'navPoint')) {
        const label = textOf(byLocal(point, 'navLabel')[0] || point, 'text')
        const [path, anchor] = splitHash(resolveHref(ncxItem.href, byLocal(point, 'content')[0]?.getAttribute('src') || ''))
        if (label && path) out.push({ label, path, anchor, depth })
        if (depth < 4) walk(point, depth + 1)
      }
    }
    const map = byLocal(doc, 'navMap')[0]
    if (map) walk(map, 0)
  }
  return out
}

/* ---------- Package ---------- */

interface ManifestItem { id: string; href: string; type: string; props: string[] }

/** Front matter shorter than this joins the first chapter. */
const FRONT_MATTER_WORDS = 400

const norm = (text: string) => text.toLowerCase().replace(/_/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
/** A title for comparison: case, punctuation and a leading number ("1 The Fate of …") ignored. */
const titleKey = (text: string) => norm(text).replace(/^\d+\s+/, '')
const plain = (text: string) => clean(text.replace(/(^|\s)_|_(\s|$)/g, '$1$2'))

const SMALL_TITLE_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'nor', 'but', 'of', 'for', 'in', 'on', 'to', 'at', 'by', 'with', 'from', 'into', 'over', 'as', 'vs', 'via', 'about', 'after', 'before', 'between', 'through', 'under', 'without', 'is', 'are', 'its'])

/** Every word capitalised but the small ones ("What Many Worlds Means for Gravity"). */
function titleCased(text: string): boolean {
  const words = plain(text).split(/\s+/).filter(word => /\p{L}/u.test(word))
  return words.length > 0 && words.every((word, index) => /^[^\p{L}]*\p{Lu}/u.test(word)
    || (index > 0 && SMALL_TITLE_WORDS.has(word.toLowerCase().replace(/[^\p{L}]/gu, ''))))
}

/** Short, unpunctuated, title-cased: a line a heading's subtitle or byline could be. */
const openingLine = (block: Block) => !block.kind && !block.lead && wordCount(block.text) >= 2 && wordCount(block.text) <= 12 && !/[.!?:;,]$/.test(plain(block.text)) && titleCased(block.text)

/**
 * A chapter's opening, set as designed: the title repeated under the reader's
 * own chapter heading is dropped (ignoring case, punctuation and a leading
 * number), and the short lines right after it -- an anthology's subtitle and
 * author -- become a subtitle and a byline. Only lines that clearly read as
 * such are taken; anything else stays body text.
 */
function chapterOpening(blocks: Block[], title: string): Block[] {
  const wanted = titleKey(title)
  if (!wanted) return blocks
  const out = blocks.map(block => ({ ...block }))
  // A chapter number set on its own line above the title ("1").
  const number = norm(title).match(/^(\d+)\s/)?.[1]
  let titleAt = out.slice(0, 6).findIndex((block, index) => {
    const text = titleKey(block.text)
    if (!text) return false
    if (block.heading) return text === wanted || text.startsWith(wanted + ' ') || wanted.startsWith(text + ' ')
    // A plain paragraph only when it is the title exactly and nothing but a number comes before it.
    return text === wanted && out.slice(0, index).every(before => number && norm(before.text) === number)
  })
  if (titleAt < 0) return out
  const level = out[titleAt].level
  out.splice(titleAt, 1)
  if (number && titleAt > 0 && norm(out[titleAt - 1].text) === number) { out.splice(titleAt - 1, 1); titleAt -= 1 }
  // The title set twice (a heading, then the same words as a paragraph).
  while (titleAt < out.length - 1 && titleKey(out[titleAt].text) === wanted) out.splice(titleAt, 1)
  let at = titleAt
  let subtitle = false
  let byline = false
  while (at < out.length - 1 && !byline) {
    const block = out[at]
    const next = out[at + 1]
    let kind: 'subtitle' | 'byline' | null = null
    if (block.kind === 'item' || block.kind === 'label') break
    if (block.lead) break
    if (block.hint === 'byline') kind = 'byline'
    else if (block.hint === 'subtitle' && !subtitle) kind = 'subtitle'
    // "by Jo Smith", "An interview with Jo Smith": a byline however it is set.
    else if ((!block.kind || block.kind === 'heading') && bylineName(block.text)?.explicit) kind = 'byline'
    else if (!subtitle && block.level && level && block.level > level && wordCount(block.text) <= HEADING_MAX_WORDS) kind = 'subtitle'
    else if (openingLine(block)) {
      // A name closes the opening; a name-like line followed by another opening line is the subtitle.
      if (nameLike(block.text) && !(openingLine(next) && !subtitle)) kind = 'byline'
      else if (!subtitle) kind = 'subtitle'
    }
    if (!kind) break
    block.kind = kind
    block.heading = false
    if (kind === 'subtitle') subtitle = true
    else byline = true
    at += 1
  }
  return out
}

/* ---------- Rules 6: chapter titles from the contents' structure ---------- */

const LABEL_WORDS = 'chapter|chap|book|part|volume|vol|act|scene|canto|letter|section|stave|fitt|episode|tablet'
const NUMBER_WORDS = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|last|final'
const LABEL_THEN_NUMBER = new RegExp(`^(?:${LABEL_WORDS})\\.?\\s+(?:the\\s+)?(\\S+?)(?=$|[\\s.,:;!?)\\]—–-])`, 'iu')
const NUMBER_THEN_LABEL = new RegExp(`^(?:${NUMBER_WORDS})\\s+(?:${LABEL_WORDS})(?=$|[\\s.,:;!?)\\]—–-])`, 'iu')
const NUMBER_WORD = new RegExp(`^(?:${NUMBER_WORDS})(?:-(?:${NUMBER_WORDS}))?$`, 'iu')
const GENERIC_LABEL = new RegExp(`^(?:${LABEL_WORDS})\\.?$`, 'iu')
/** A credit set on a title page, never a chapter's name. */
const CREDIT_LINE = /^(?:translated|edited|compiled|selected|arranged|introduced|illustrated|done into english|with an? (?:introduction|preface|notes?|memoir)|by)\b/i

/** "BOOK ONE: 1805" → head "BOOK ONE", named; "LETTER I" → head "LETTER I"; "FIRST ACT" → head "FIRST ACT". */
function labelHead(text: string): { head: string; named: boolean } | null {
  const line = plain(text)
  let head = ''
  const labelled = LABEL_THEN_NUMBER.exec(line)
  if (labelled) {
    const number = labelled[1]
    if (/^\d{1,4}$/.test(number) || romanValue(number) !== null || NUMBER_WORD.test(number)) head = labelled[0]
  }
  if (!head) head = NUMBER_THEN_LABEL.exec(line)?.[0] ?? ''
  if (!head) return null
  const rest = line.slice(head.length).replace(/^[\s.,:;!?)\]—–-]+/u, '')
  return { head, named: /\p{L}{2}|\d{3}/u.test(rest) }
}

/** A title that is only a number ("I", "XII.", "3"), as the number, else null. */
function bareNumeral(text: string): string | null {
  const match = /^\s*(\d{1,4}|[IVXLCivxlc]{1,8})\s*\.?\s*$/.exec(plain(text))
  if (!match) return null
  return /^\d/.test(match[1]) || romanValue(match[1]) !== null ? match[1] : null
}
const numeralValue = (text: string) => /^\d+$/.test(text) ? Number(text) : romanValue(text)

/** A title without punctuation at its end ("PART II." → "PART II"). */
const trimTitle = (text: string) => clean(text).replace(/[\s.,;:]+$/u, '')
const bookKey = (text: string) => titleKey(text).replace(/^(?:the|a|an)\s+/, '')
/** A book's title without its long subtitle ("A Modest Proposal / For preventing …" → "A Modest Proposal"). */
const shortTitle = (text: string) => (clean(text).split(/\s+\/\s+|:\s+|;\s+/)[0] || clean(text)).slice(0, 200)

/** The book's own title, or its first words ("CLARISSA HARLOWE" of "Clarissa Harlowe; or the History of a Young Lady"). */
function namesBook(label: string, bookTitle: string): boolean {
  const key = bookKey(label)
  const book = bookKey(bookTitle)
  return key.length >= 3 && (book === key || book.startsWith(key + ' '))
}

/**
 * The title of a chapter where a contents entry stands over another one (a
 * part over its first chapter, an act over its scene): the outer entry's name
 * is kept wherever the inner one says less. "FIRST ACT" over "SCENE" is the
 * act; "LETTER I" over "MISS HOWE, TO MISS HARLOWE" is both; a story over its
 * part "I." is the story; a numbered chapter's name over a subheading is the
 * chapter. A numbered inner entry ("CHAPTER I") keeps its own title: when
 * chapters are named alike in several parts, each gets its part afterwards
 * ("BOOK ONE, CHAPTER I", piecesFromContents).
 */
function combineTitles(outer: string, inner: string, bookTitle: string): string {
  if (!clean(inner) || GENERIC_LABEL.test(plain(inner))) return outer || inner
  if (!clean(outer) || GENERIC_LABEL.test(plain(outer)) || namesBook(outer, bookTitle) || CREDIT_LINE.test(plain(outer))) return inner
  if (bareNumeral(inner)) return outer
  const head = labelHead(outer)
  // A numbered chapter keeps its own title; chapters named alike in several parts get their part later.
  if (labelHead(inner)) return inner
  if (head && !head.named) return `${trimTitle(outer)} — ${clean(inner)}`
  if (head) return outer
  return inner
}

/** A chapter title under its part ("PART II" and "DEFINITIONS" → "PART II — DEFINITIONS"). */
function underPart(context: string, title: string): string {
  return `${trimTitle(context)}${labelHead(title) ? ', ' : ' — '}${clean(title)}`
}

/** A speaker's name set on its own line above the speech ("NORA.", "MRS LINDE.", "LADY BRACKNELL."). */
const SPEAKER_LINE = /^\p{Lu}[\p{Lu}’'-]*\.?(?:\s+(?:\p{Lu}[\p{Lu}’'.-]*|and|&))*\.$/u
const NOT_SPEAKER = /^(?:act|scene|curtain|end|the|finis|chapter|part|book|enter|exit|exeunt|preface|contents|notes?|introduction|epilogue|prologue|dedication|appendix|index|poems?|sonnets?|song|letter|postscript|tableau|proof|corollary|scholium|lemma|definition|axiom|postulate|explanation|remark|fig|figure|plate)\b/i

/**
 * Rules 6: a play whose speakers stand on their own lines, above each speech:
 * each name is joined to its speech ("NORA. Hide the Christmas Tree …"), the
 * way Tinct's own plays are set, so the reader can set the name as a label.
 * Only names that recur, in a book where they do at least twenty times. Returns
 * the speeches joined away (their text is in the name's block now).
 */
function joinSpeakers(stream: Block[]): Set<number> {
  const joined = new Set<number>()
  const label = (block: Block) => !block.figure && !block.heading && (!block.kind || block.kind === 'line') && wordCount(block.text) <= 4
    && SPEAKER_LINE.test(plain(block.text)) && !NOT_SPEAKER.test(plain(block.text)) && romanValue(plain(block.text).replace(/\.$/, '')) === null
  const counts = new Map<string, number>()
  for (const block of stream) if (label(block)) counts.set(plain(block.text), (counts.get(plain(block.text)) ?? 0) + 1)
  const recurring = [...counts].filter(([, count]) => count >= 3)
  if (recurring.length < 3 || recurring.reduce((sum, [, count]) => sum + count, 0) < 20) return joined
  // A play, then: every name set this way is a speaker, the porter who speaks once too.
  const speakers = new Set(counts.keys())
  for (let i = 0; i < stream.length - 1; i++) {
    const block = stream[i]
    const next = stream[i + 1]
    if (!label(block) || !speakers.has(plain(block.text)) || next.figure || next.heading || next.kind === 'heading' || (label(next) && speakers.has(plain(next.text)))) continue
    const shift = wordCount(block.text)
    stream[i] = {
      text: `${block.text} ${next.text}`,
      heading: false,
      ...(next.links ? { links: next.links.map(([from, to, href]): [number, number, string] => [from + shift, to + shift, href]) } : {}),
      ...(block.writer ? { writer: block.writer } : {}),
    }
    joined.add(i + 1)
    i += 1
  }
  return joined
}

/** A contents entry at its place in the book, with the entries it stands under (nearest last). */
interface PlacedEntry { label: string; depth: number; at: number; ancestors: string[] }

interface Piece {
  title: string
  blocks: Block[]
  /** Rules 6: the chapter's own contents entry, when its title says more ("CHAPTER II" of "BOOK ONE, CHAPTER II"): its heading in the text is the title repeated. */
  alias?: string
}

/**
 * Rules 6: the book cut into chapters at its contents' entries, titled from
 * the contents' structure. A part or act title page (a piece of headings
 * only) still opens the chapter after it, but its name is kept in that
 * chapter's title; chapters named alike in several parts ("CHAPTER I",
 * "DEFINITIONS") carry their part; a bare number takes the name printed
 * under it, or "Chapter" in a chapter document; a story's numbered parts
 * carry the story; an epigraph set before its essay's own heading joins the
 * essay; and a book without a usable contents is cut at its own headings.
 */
function piecesFromContents(stream: Block[], placed: PlacedEntry[], docs: Array<{ at: number; title: string; docType: string }>, book: { title: string; author: string }): Piece[] {
  const starts = new Map<number, PlacedEntry[]>()
  for (const entry of placed) starts.set(entry.at, [...(starts.get(entry.at) ?? []), entry])
  if (starts.size < 2) {
    starts.clear()
    for (const doc of docs) if (doc.at < stream.length && !starts.has(doc.at)) starts.set(doc.at, [{ label: doc.title, depth: 0, at: doc.at, ancestors: [] }])
  }
  const frontMatter = !starts.has(0)
  if (frontMatter) starts.set(0, [{ label: docs.find(doc => doc.at === 0)?.title || book.title, depth: 0, at: 0, ancestors: [] }])
  const cuts = [...starts.keys()].sort((a, b) => a - b)
  interface Raw extends Piece { at: number; labels: string[]; entry: PlacedEntry; context?: string }
  let raw: Raw[] = cuts.map((at, index) => {
    const entries = starts.get(at)!
    return {
      at,
      title: entries.slice(1).reduce((title, entry) => combineTitles(title, entry.label, book.title), entries[0].label),
      labels: entries.map(entry => entry.label),
      entry: entries[entries.length - 1],
      alias: entries[entries.length - 1].label,
      blocks: stream.slice(at, cuts[index + 1] ?? stream.length),
    }
  })
  // No contents to speak of (one piece, or a front and one piece): the book's own headings cut it.
  if (raw.filter((piece, index) => !(frontMatter && index === 0)).length <= 1) {
    const split = splitAtHeadings(stream, book)
    if (split) raw = split.map(piece => ({ ...piece, labels: [piece.title], entry: { label: piece.title, depth: 0, at: piece.at, ancestors: [] } }))
  }
  const front = frontMatter ? raw[0] : null
  const docTypeAt = (at: number) => [...docs].reverse().find(doc => doc.at <= at)?.docType ?? ''

  // A piece that is only headings (a part title page) joins the next piece, its name kept in the title.
  const merged: Raw[] = []
  let group: Raw[] = []
  // In a contents without depth, the last part title page is what the chapters after it stand under.
  let lastPart: string | undefined
  for (let i = 0; i < raw.length; i++) {
    const piece = raw[i]
    const next = raw[i + 1]
    if (next && piece.blocks.length && piece.blocks.every(block => block.heading)) { group.push(piece); continue }
    if (group.length) {
      const head = labelHead(group[0].title)
      lastPart = group[0].title && !namesBook(group[0].title, book.title) ? (head ? head.head : group[0].title) : undefined
      piece.blocks = [...group.flatMap(item => item.blocks.filter(block => norm(block.text) !== norm(piece.title))), ...piece.blocks]
      piece.title = [...group.slice(1).map(item => item.title), piece.title].reduce((title, inner) => combineTitles(title, inner, book.title), group[0].title)
      piece.labels = [...group.flatMap(item => item.labels), ...piece.labels]
      piece.at = group[0].at
      group = []
    }
    piece.context = lastPart
    merged.push(piece)
  }
  const pieces = merged.filter(piece => piece.blocks.length > 0)
  // An epigraph set apart before the essay's own heading ("I. HISTORY", then "HISTORY"): one chapter.
  for (let i = pieces.length - 2; i >= 0; i--) {
    const [a, b] = [pieces[i], pieces[i + 1]]
    const key = (text: string) => titleKey(text).replace(/^[ivxlc]+\s+/, '')
    if (!key(b.title) || key(a.title) !== key(b.title) || blockWords(a.blocks) >= 600) continue
    a.blocks = [...a.blocks, ...b.blocks.filter((block, index) => !(index === 0 && key(block.text) === key(b.title)))]
    pieces.splice(i + 1, 1)
  }
  // A short front matter is the first chapter's opening, not a chapter of its own.
  if (front && pieces[0] === front && pieces.length > 1 && blockWords(front.blocks) < FRONT_MATTER_WORDS) {
    pieces[1].blocks = [...front.blocks, ...pieces[1].blocks]
    pieces.shift()
  }
  const counts = new Map<string, number>()
  for (const piece of pieces) counts.set(titleKey(piece.title), (counts.get(titleKey(piece.title)) ?? 0) + 1)
  pieces.forEach((piece, index) => {
    const ancestors = piece.entry.ancestors.filter(label => clean(label) && !namesBook(label, book.title) && !GENERIC_LABEL.test(plain(label))
      && !CREDIT_LINE.test(plain(label)) && !(book.author && book.author.split(/,\s*/).some(name => sameWriter(name, plain(label).replace(/^by\s+/i, '')))))
    const numeral = bareNumeral(piece.title)
    if (numeral) {
      // The name printed under the number ("II" over "THE MACHINE").
      const at = piece.blocks.slice(0, 4).findIndex(block => numeralValue(bareNumeral(block.text) ?? '') === numeralValue(numeral))
      const name = at >= 0 ? piece.blocks[at + 1] : undefined
      if (name && !name.figure && wordCount(name.text) <= 10 && /\p{L}{2}/u.test(name.text) && !SENTENCE_END.test(plain(name.text).replace(/\.$/, ''))
        && (!/\p{Ll}/u.test(plain(name.text)) || name.heading || name.kind === 'heading') && !namesBook(name.text, book.title)) {
        piece.title = `${numeral}. ${plain(name.text)}`
        piece.blocks = piece.blocks.filter((_, index) => index !== at && index !== at + 1)
      } else if (ancestors.length) {
        // A story's numbered part: the story, and which part.
        const story = ancestors[ancestors.length - 1]
        piece.title = `${trimTitle(story)}, ${/\p{Ll}/u.test(story) ? 'Part' : 'PART'} ${numeral}`
      } else if (/\bchapter\b/.test(docTypeAt(piece.at))) piece.title = `Chapter ${numeral}`
    } else if ((counts.get(titleKey(piece.title)) ?? 0) >= 2) {
      // Chapters named alike in several parts carry their part.
      // The part title page read last, when it names a part ("PART V:"); else the entries the chapter stands under.
      const part = (piece.context && labelHead(piece.context) ? piece.context : undefined)
        ?? [...ancestors].reverse().find(label => labelHead(label)) ?? ancestors[ancestors.length - 1] ?? piece.context
      const context = part ? (labelHead(part)?.head ?? part) : ''
      if (context && !titleKey(piece.title).startsWith(titleKey(context))) piece.title = underPart(context, piece.title)
    }
    // The book's opening: its title page's entries name the book, or a credit line ("Translated from the Latin …").
    if (index === 0) {
      const named = piece.entry.depth > 0 ? piece.labels.findIndex(label => namesBook(label, book.title)) : -1
      if (named >= 0) {
        let title = clean(piece.labels[named])
        for (const label of piece.labels.slice(named + 1)) {
          const longer = `${title} ${clean(label)}`
          if (!bookKey(book.title).startsWith(bookKey(longer))) break
          title = longer
        }
        piece.title = title
      } else if (CREDIT_LINE.test(plain(piece.title))) piece.title = book.title
    }
  })
  return pieces
}

/**
 * A book without a usable contents, cut at its own headings (an old
 * table-set poetry book with its poems' titles in a larger type). Only when it
 * has three or more; the book's title and author set as headings are not
 * cuts, and a heading with almost nothing under it opens the next piece.
 */
function splitAtHeadings(stream: Block[], book: { title: string; author: string }): Array<Piece & { at: number }> | null {
  const titled = (block: Block | undefined) => !!block?.heading
    && !namesBook(block.text, book.title) && !(book.author && norm(block.text).replace(/^by\s+/, '') === norm(book.author))
  // A run of headings is one cut, at its first.
  const cuts = stream.map((block, index) => titled(block) && !titled(stream[index - 1]) ? index : -1).filter(index => index > 0)
  if (cuts.length < 3) return null
  const at = [0, ...cuts]
  const pieces: Array<Piece & { at: number }> = []
  at.forEach((start, index) => {
    const blocks = stream.slice(start, at[index + 1] ?? stream.length)
    const headings = blocks.slice(0, 2).filter(block => block.heading).map(block => plain(block.text))
    const title = index === 0 ? book.title : bareNumeral(headings[0] ?? '') && headings[1] ? `${headings[0]} ${headings[1]}` : headings[0] ?? ''
    pieces.push({ at: start, title, blocks })
  })
  // A title with almost nothing under it ("POEMS." over an epigraph) opens the piece after it.
  for (let i = pieces.length - 2; i >= 1; i--) {
    if (blockWords(pieces[i].blocks.filter(block => !block.heading)) >= 25) continue
    pieces[i + 1] = { ...pieces[i + 1], at: pieces[i].at, blocks: [...pieces[i].blocks, ...pieces[i + 1].blocks] }
    pieces.splice(i, 1)
  }
  return pieces
}

/* ---------- Authorship ---------- */

/** The book's creators, one by one, and whether its credit is an editor's (or "Various"). */
function creatorsOf(meta: Element): BookCreators {
  const refines = byLocal(meta, 'meta').filter(item => item.getAttribute('property') === 'role')
  const roleOf = (creator: Element) => {
    const id = creator.getAttribute('id')
    const refined = id ? refines.find(item => (item.getAttribute('refines') || '') === `#${id}`) : undefined
    return clean(refined?.textContent || creator.getAttribute('opf:role') || creator.getAttributeNS('http://www.idpf.org/2007/opf', 'role')).toLowerCase()
  }
  const names: string[] = []
  let edited = false
  for (const creator of byLocal(meta, 'creator')) {
    const name = clean(creator.textContent)
    if (!name) continue
    const role = roleOf(creator)
    if (role === 'edt' || role === 'com' || /^various( authors)?$/i.test(name) || /\(eds?\.?\)$|,\s*eds?\.?$|\beditor\b/i.test(name)) { edited = true; continue }
    if (role === 'aut' || !role) names.push(name)
  }
  return { names, edited }
}

/** A chapter document's own author, from its head (`<meta name="author">`, `dc.creator`). */
function documentAuthor(source: string): string {
  const bodyAt = source.search(/<body[\s>]/i)
  const head = source.slice(0, bodyAt >= 0 ? bodyAt : 4_000)
  for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
    if (!/\bname\s*=\s*["'](?:author|dc\.creator|dcterms\.creator|dc:creator)["']/i.test(tag)) continue
    const content = tag.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
    const name = clean((content?.[1] ?? content?.[2] ?? '').replace(/&amp;/g, '&'))
    if (name && nameLike(name)) return name
  }
  return ''
}

/** "Essay Title — Jo Smith", "Essay Title, by Jo Smith": the name a contents entry gives after its title. */
function tocLabelName(label: string): string {
  const match = clean(label).match(/^(.+?)(?:\s+[—–]\s+|\s+-{1,2}\s+|,?\s+by\s+)(.+)$/i)
  return match && nameLike(match[2]) ? plain(match[2]) : ''
}

/** A chapter's own word on its writer: the byline set under its title, its document's author, its contents entry. */
function authorCandidate(opened: Block[], source: Block[], tocLabel: string): AuthorCandidate | null {
  const byline = opened.slice(0, 8).find(block => block.kind === 'byline')
  const named = byline ? bylineName(byline.text) : null
  if (named && (named.explicit || byline!.hint === 'byline')) return { name: named.name, source: 'byline' }
  const writer = source.slice(0, 6).find(block => block.writer)?.writer
  if (writer) return { name: writer, source: 'metadata' }
  const listed = tocLabelName(tocLabel)
  if (listed) return { name: listed, source: 'contents' }
  return named ? { name: named.name, source: 'name' } : null
}

/** Every word the book's own title page could print. */
function titlePageWords(...texts: string[]): Set<string> {
  const words = new Set(['by', 'edited', 'editor', 'volume', 'vol', 'book', 'the', 'a', 'an', 'and', 'of'])
  for (const text of texts) for (const word of norm(text).split(' ')) if (word) words.add(word)
  return words
}

/** A cover, half-title or title page: only the book's title, subtitle, author and publisher. */
function titleMatter(blocks: Block[], docType: string, words: Set<string>): boolean {
  const all = norm(blocks.map(block => block.text).join(' ')).split(' ').filter(Boolean)
  if (/\b(cover|titlepage|halftitle|half-title)\b/.test(docType) && all.length <= 80) return true
  if (!all.length || all.length > 30) return false
  return all.filter(word => words.has(word)).length / all.length >= 0.8
}

/** A copyright page: short, and saying so more than once. */
function copyrightMatter(blocks: Block[]): boolean {
  const text = blocks.map(block => block.text).join(' ')
  if (!text || wordCount(text) > 200) return false
  const signals = [/©|\(c\)\s*\d{4}|\bcopyright\b/i, /all rights reserved/i, /\bISBN\b/i, /\b(first (edition|published)|printed in)\b/i, /\bpublished by\b/i]
  return signals.filter(signal => signal.test(text)).length >= 2
}

/**
 * Words a document may hold beyond its contents entries and still be the contents page
 * (rules 7). Project Gutenberg sets a short book of poems as one document: its printed
 * contents, then each poem's title (both contents entries) over the poem in a few long
 * blocks. By blocks that is mostly entries, but the poems are thousands of words (Nothing
 * to Eat, PG 5868: 6,663; Silver Linings, PG 75155: 8,973), and dropping the document left
 * no text, so Add to Tinct refused the book as unreadable.
 */
const CONTENTS_OTHER_WORDS = 2000

/** The book's own contents page, which the reader's chapter menu replaces. */
function contentsMatter(blocks: Block[], docType: string, labels: Set<string>, v7 = false): boolean {
  if (/\b(toc|doc-toc)\b/.test(docType)) return true
  const entries = blocks.filter((block, index) => !(index === 0 && /^(table of )?contents$/.test(norm(block.text))))
  if (entries.length < 3 || labels.size < 3) return false
  const other = entries.filter(block => !labels.has(titleKey(block.text)))
  if (v7 && blockWords(other) > CONTENTS_OTHER_WORDS) return false
  return (entries.length - other.length) / entries.length >= 0.6
}

const COVER_LABEL = /^(cover|cover page|front cover|book cover|title|title page|titlepage|half title|halftitle)$/

/** Words in a run of blocks. */
const blockWords = (blocks: Block[]) => blocks.reduce((sum, block) => sum + wordCount(block.text), 0)

/** The EPUB 3 subtitle: a second title, or one refined as `title-type subtitle`. */
function subtitleOf(meta: Element): string {
  const titles = byLocal(meta, 'title')
  for (const refine of byLocal(meta, 'meta')) {
    if (refine.getAttribute('property') !== 'title-type' || clean(refine.textContent).toLowerCase() !== 'subtitle') continue
    const id = (refine.getAttribute('refines') || '').replace(/^#/, '')
    const found = titles.find(item => item.getAttribute('id') === id)
    if (found) return clean(found.textContent)
  }
  return ''
}

/* ---------- Pictures ---------- */

/** A picture file larger than this is not read (prepared pictures are smaller: epubPictures.ts). */
const MAX_PICTURE_BYTES = 40_000_000

/** Too small to be a figure: an ornament, a logo, a glyph set as a picture. */
const decorativeSize = (size: { width: number; height: number }) => size.width < 100 || size.height < 50 || size.width * size.height < 15_000
/** Large or detailed: shown as a strip that opens the full image. */
const largeSize = (size: { width: number; height: number }) => size.width * size.height >= 1_500_000 || (size.width >= 1400 && size.height >= 1000) || size.height / size.width > 2.2

/**
 * A picture's bytes, type and size from the file: the first of the files it
 * names that the archive holds (matched loosely: case, escaping, Unicode form)
 * and that is not an ornament, or its own data: URL. 'decoration' when it is
 * only an ornament; null when the book does not hold it.
 */
async function readPicture(zip: ReturnType<typeof openZip>, picture: Picture, declaredType: (path: string) => string):
  Promise<{ bytes: Uint8Array; type: string; size: { width: number; height: number } | null } | 'decoration' | null> {
  if (picture.svg) {
    const bytes = new TextEncoder().encode(picture.svg)
    return { bytes, type: 'image/svg+xml', size: imageSize(bytes, 'image/svg+xml') }
  }
  let decoration = false
  for (const href of [picture.href, ...(picture.alternates ?? [])]) {
    const path = href ? zip.find(href) : null
    if (!path) continue
    const bytes = await zip.read(path).catch(() => null)
    if (!bytes || !bytes.length || bytes.length > MAX_PICTURE_BYTES) continue
    const type = pictureType(bytes, declaredType(path), path)
    if (!/^image\//.test(type)) continue
    const size = imageSize(bytes, type)
    // A lazy page's placeholder (a 1-pixel GIF) before the real file: try the next.
    if (size && decorativeSize(size)) { decoration = true; continue }
    if (type === 'image/svg+xml') return { bytes: await inlineSvgImages(bytes, path, zip), type, size }
    return { bytes, type, size }
  }
  if (picture.data) {
    const match = /^data:([^;,]*)(;base64)?,(.*)$/is.exec(picture.data)
    if (match) {
      let bytes: Uint8Array | null = null
      try {
        bytes = match[2] ? Uint8Array.from(atob(match[3].replace(/\s+/g, '')), char => char.charCodeAt(0)) : new TextEncoder().encode(decodeURIComponent(match[3]))
      } catch { bytes = null }
      if (bytes && bytes.length && bytes.length <= MAX_PICTURE_BYTES) {
        const type = pictureType(bytes, match[1], '')
        const size = /^image\//.test(type) ? imageSize(bytes, type) : null
        if (size && decorativeSize(size)) return 'decoration'
        if (/^image\//.test(type)) return { bytes, type, size }
      }
    }
  }
  return decoration ? 'decoration' : null
}

/**
 * An SVG file drawn as an <img> loads nothing beside it: the pictures it
 * places from the book (<image href="photo.jpg"/>) are written into it.
 */
async function inlineSvgImages(bytes: Uint8Array, path: string, zip: ReturnType<typeof openZip>): Promise<Uint8Array> {
  const text = new TextDecoder().decode(bytes)
  if (!/<image\b/i.test(text)) return bytes
  const pattern = /(<image\b[^>]*?\s(?:xlink:)?href\s*=\s*)(["'])([^"']*)\2/gi
  const found = new Map<string, string>()
  for (const match of text.matchAll(pattern)) {
    const href = match[3]
    if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('#') || found.has(href)) continue
    const file = zip.find(resolveHref(path, href.split('#')[0]))
    const data = file ? await zip.read(file).catch(() => null) : null
    const type = data ? pictureType(data, '', file || '') : ''
    if (!data || !/^image\/(png|jpeg|gif|webp)$/.test(type) || data.length > 8_000_000) continue
    let binary = ''
    for (let i = 0; i < data.length; i += 0x8000) binary += String.fromCharCode(...data.subarray(i, i + 0x8000))
    found.set(href, `data:${type};base64,${btoa(binary)}`)
  }
  if (!found.size) return bytes
  return new TextEncoder().encode(text.replace(pattern, (whole, lead: string, quote: string, href: string) => found.has(href) ? `${lead}${quote}${found.get(href)}${quote}` : whole))
}

/** A figure's picture, as bytes: kept so on the device (never as a Blob, which iOS Safari's IndexedDB can lose). */
export interface UserBookImage { type: string; data: ArrayBuffer }

/** A converted book and its pictures (figure id -> image), kept beside it on this device. */
export interface EpubConversion { edition: UserBookEdition; images: Map<string, UserBookImage> }

/**
 * `sourceTitles` keeps chapter titles exactly as the EPUB writes them (Add to Tinct:
 * the Worker checks each title against the file, then sets it in house style itself).
 * Otherwise titles are in Tinct's house style (public/lab/chapter-title.js).
 */
export interface EpubConvertOptions {
  fallbackTitle?: string
  sourceTitles?: boolean
  /** False when only the text is wanted: pictures are sized but not decoded or kept. */
  images?: boolean
  /**
   * The conversion rules (userEdition.ts USER_EDITION_CONVERTERS), the current
   * ones by default. A book converted before is converted again under its own
   * rules, so its chapters and paragraphs, and every place in them, come out
   * exactly as they were.
   */
  rules?: number
}

/**
 * The book's own cover picture (the manifest's `cover-image`, else `<meta name="cover">`),
 * as stored in the file, or null when it names none. Add a book draws its shelf cover
 * from the same picture (public/lab/addbook/js/epub.js).
 */
export async function readEpubCover(input: ArrayBuffer | Uint8Array): Promise<UserBookImage | null> {
  const zip = openZip(input)
  const container = await zip.readText('META-INF/container.xml')
  const opfPath = container ? byLocal(parseXml(container), 'rootfile')[0]?.getAttribute('full-path') || '' : ''
  const opfText = opfPath ? await zip.readText(opfPath) : null
  if (!opfText) return null
  const opf = parseXml(opfText)
  const meta = byLocal(opf, 'metadata')[0] || opf
  const items = byLocal(opf, 'item').map(item => ({ id: item.getAttribute('id') || '', href: resolveHref(opfPath, item.getAttribute('href') || ''), type: item.getAttribute('media-type') || '', props: (item.getAttribute('properties') || '').split(/\s+/) }))
  const coverId = byLocal(meta, 'meta').find(item => item.getAttribute('name') === 'cover')?.getAttribute('content') || ''
  const item = items.find(candidate => candidate.props.includes('cover-image')) || items.find(candidate => candidate.id === coverId)
  const path = item ? zip.find(item.href) : null
  const bytes = path ? await zip.read(path) : null
  if (!bytes || bytes.length === 0) return null
  // What the bytes are, whatever the manifest calls them; only pictures every browser draws.
  const type = sniffImageType(bytes)
  if (!/^image\/(png|jpeg|gif|webp)$/.test(type)) return null
  return { type, data: bytes.slice().buffer }
}

export async function epubToEdition(input: ArrayBuffer | Uint8Array, options: EpubConvertOptions = {}): Promise<UserBookEdition> {
  return (await convertEpub(input, { images: false, ...options })).edition
}

export async function convertEpub(input: ArrayBuffer | Uint8Array, options: EpubConvertOptions = {}): Promise<EpubConversion> {
  const zip = openZip(input)
  if (zip.has('META-INF/rights.xml')) throw new EpubError('drm', DRM_MESSAGE)
  const encryption = await zip.readText('META-INF/encryption.xml')
  if (encryption) {
    const methods = byLocal(parseXml(encryption), 'EncryptionMethod').map(method => method.getAttribute('Algorithm') || '')
    if (methods.some(method => !ALLOWED_ENCRYPTION.has(method))) throw new EpubError('drm', DRM_MESSAGE)
  }
  const container = await zip.readText('META-INF/container.xml')
  if (!container) throw new EpubError('bad_epub', 'This file is not an EPUB (it has no container file).')
  const opfPath = byLocal(parseXml(container), 'rootfile')[0]?.getAttribute('full-path') || ''
  const opfText = opfPath ? await zip.readText(opfPath) : null
  if (!opfText) throw new EpubError('bad_epub', 'This EPUB is damaged (its package file is missing).')
  const opf = parseXml(opfText)
  const meta = byLocal(opf, 'metadata')[0] || opf
  const rules = USER_EDITION_CONVERTERS.includes(options.rules ?? USER_EDITION_CONVERTER) ? options.rules ?? USER_EDITION_CONVERTER : USER_EDITION_CONVERTER
  const v6 = rules >= 6
  const v7 = rules >= 7
  const title = textOf(meta, 'title') || clean(options.fallbackTitle) || 'Untitled book'
  // Rules 6: a creator as readers know them ("graf Leo Tolstoy" is Leo Tolstoy).
  const author = byLocal(meta, 'creator').map(creator => clean(creator.textContent)).filter(Boolean).map(name => v6 ? personName(name) : name).join(', ')
  const creators = creatorsOf(meta)
  const language = textOf(meta, 'language')
  const subtitle = subtitleOf(meta)
  const manifest = new Map<string, ManifestItem>()
  for (const item of byLocal(opf, 'item')) {
    const id = item.getAttribute('id') || ''
    manifest.set(id, { id, href: resolveHref(opfPath, item.getAttribute('href') || ''), type: item.getAttribute('media-type') || '', props: (item.getAttribute('properties') || '').split(/\s+/) })
  }
  const spineEl = byLocal(opf, 'spine')[0]
  const refs = byLocal(opf, 'itemref').map(ref => ({ item: manifest.get(ref.getAttribute('idref') || ''), linear: ref.getAttribute('linear') !== 'no' }))
    .filter((ref): ref is { item: ManifestItem; linear: boolean } => !!ref.item && /x?html/.test(ref.item.type) && zip.has(ref.item.href))
  const linear = refs.filter(ref => ref.linear)
  const spine = (linear.length ? linear : refs).map(ref => ref.item)
  if (!spine.length) throw new EpubError('bad_epub', 'This EPUB has no readable chapters.')

  const toc = await readToc(zip, manifest, spineEl)
  // The cover picture is the book's cover (Add a book shows it), never a figure.
  const coverId = byLocal(meta, 'meta').find(item => item.getAttribute('name') === 'cover')?.getAttribute('content') || ''
  const coverHref = ([...manifest.values()].find(item => item.props.includes('cover-image')) || manifest.get(coverId))?.href || ''
  const coverPath = coverHref ? zip.find(coverHref) : null
  const isCover = (href: string | undefined) => !!href && !!coverPath && zip.find(href) === coverPath
  const tocLabelOf = new Map<string, string>()
  for (const entry of toc) if (!tocLabelOf.has(entry.path)) tocLabelOf.set(entry.path, entry.label)
  const tocLabels = new Set(toc.map(entry => titleKey(entry.label)).filter(Boolean))
  const bookWords = titlePageWords(title, subtitle, author, textOf(meta, 'publisher'))
  // The whole book as one run of blocks, remembering where each document and anchor starts.
  const stream: Block[] = []
  const docWords = new Map<string, number>()
  const docStart = new Map<string, number>()
  const anchorAt = new Map<string, number>()
  const docTitles: Array<{ at: number; title: string; docType: string }> = []
  // Contents entries into the library's own matter (a licence, credits) name no chapter.
  const droppedPlaces = new Set<string>()
  let droppedImages = 0
  for (const item of spine) {
    const source = await zip.readText(item.href)
    const parsed = documentBlocks(source || '', item.href, v6, rules >= 8, rules >= 9)
    for (const id of parsed.dropped) droppedPlaces.add(`${item.href}#${id}`)
    if (parsed.libraryOnly || wikisourceMatter(parsed.blocks)) { droppedPlaces.add(item.href); continue }
    // Rules 6: Wikisource's title page (title, author, year and its export stamp).
    if (v6 && parsed.wikisourceStamp && blockWords(parsed.blocks) <= 40) { droppedPlaces.add(item.href); continue }
    // A page of nothing but a picture before the book's text begins: the cover,
    // a title page set as an image. The book opens with its own title instead.
    const pictures = parsed.blocks.filter(block => block.figure)
    if (pictures.length && pictures.length === parsed.blocks.length && !stream.some(block => !block.figure)
      && (/\b(cover|titlepage|halftitle)\b/.test(parsed.docType) || COVER_LABEL.test(norm(tocLabelOf.get(item.href) || ''))
        || pictures.every(block => isCover(block.figure!.href) || /(cover|title)/i.test((block.figure!.href || '').split('/').pop() || '')))) {
      droppedPlaces.add(item.href)
      droppedImages += pictures.length
      continue
    }
    // The book's cover, title pages, copyright page and its own contents page:
    // the reader opens with the title itself (labParagraphStyle) and has its own chapter menu.
    if (parsed.blocks.length && (titleMatter(parsed.blocks, parsed.docType, bookWords) || copyrightMatter(parsed.blocks)
      || contentsMatter(parsed.blocks, parsed.docType, tocLabels, v7))) { droppedPlaces.add(item.href); continue }
    docWords.set(item.href, blockWords(parsed.blocks))
    const writer = documentAuthor(source || '')
    if (writer && parsed.blocks.length) parsed.blocks[0] = { ...parsed.blocks[0], writer }
    docStart.set(item.href, stream.length)
    for (const [id, index] of parsed.anchors) anchorAt.set(`${item.href}#${id}`, stream.length + index)
    const firstHeading = parsed.blocks.find(block => block.heading)?.text
    docTitles.push({ at: stream.length, title: firstHeading ? clean(firstHeading.replace(/(^|\s)_|_(\s|$)/g, '$1$2')) : '', docType: parsed.docType })
    stream.push(...parsed.blocks)
    droppedImages += parsed.images
  }
  // Without the marked-up header and footer, Project Gutenberg's text markers bound the book.
  const startMarker = stream.findIndex((block, index) => index < stream.length / 2 && PG_START.test(block.text))
  const endFrom = Math.max(0, startMarker)
  const endMarker = stream.findIndex((block, index) => index > endFrom && index > stream.length / 2 && PG_END.test(block.text))
  if (startMarker >= 0 || endMarker >= 0) {
    const from = startMarker + 1
    const to = endMarker >= 0 ? endMarker : stream.length
    const shift = (at: number) => Math.max(0, at - from)
    stream.splice(to)
    stream.splice(0, from)
    for (const [key, at] of docStart) docStart.set(key, shift(at))
    for (const [key, at] of anchorAt) anchorAt.set(key, at < from ? -1 : at - from)
    for (const doc of docTitles) doc.at = shift(doc.at)
  }
  if (!stream.length) throw new EpubError('bad_epub', 'This EPUB has no readable chapters.')

  /**
   * Take blocks out of the stream, keeping every place pointing at one: a place at a
   * removed block moves to the block before it (`back`: the block it was joined to)
   * or the one after it.
   */
  const removeBlocks = (removed: Set<number>, back: boolean) => {
    if (!removed.size) return
    const sorted = [...removed].sort((a, b) => a - b)
    const before = (at: number) => { let n = 0; while (n < sorted.length && sorted[n] < at) n += 1; return n }
    const move = (at: number) => at < 0 ? at : Math.max(0, at - before(at) - (back && removed.has(at) ? 1 : 0))
    for (let i = sorted.length - 1; i >= 0; i--) stream.splice(sorted[i], 1)
    for (const [key, at] of docStart) docStart.set(key, move(at))
    for (const [key, at] of anchorAt) anchorAt.set(key, move(at))
    for (const doc of docTitles) doc.at = move(doc.at)
  }
  if (v6) {
    // Rules 6: drop Project Gutenberg's line naming the ebook, and set a play's speeches on their speakers.
    removeBlocks(new Set(stream.slice(0, 8).flatMap((block, index) => PG_TITLE_LINE.test(plain(block.text)) ? [index] : [])), false)
    removeBlocks(joinSpeakers(stream), true)
  }
  let pieces: Piece[]
  // Where each contents entry stands, and the entries it stands under.
  const placedEntries = (): PlacedEntry[] => {
    const out: PlacedEntry[] = []
    const open: TocEntry[] = []
    for (const entry of toc) {
      while (open.length && open[open.length - 1].depth >= entry.depth) open.pop()
      const ancestors = open.map(item => item.label)
      open.push(entry)
      const docAt = docStart.get(entry.path)
      if (docAt === undefined || droppedPlaces.has(entry.path) || droppedPlaces.has(`${entry.path}#${entry.anchor}`)) continue
      if (COVER_LABEL.test(norm(entry.label)) && (docWords.get(entry.path) ?? 0) < 10) continue
      const at = entry.anchor ? anchorAt.get(`${entry.path}#${entry.anchor}`) ?? docAt : docAt
      if (at < 0 || at >= stream.length) continue
      out.push({ label: entry.label, depth: entry.depth, at, ancestors })
    }
    return out
  }
  if (v6) pieces = piecesFromContents(stream, placedEntries(), docTitles, { title, author })
  else {
    // Chapter starts: the contents' entries in reading order, else every document.
    const starts = new Map<number, string>()
    for (const entry of toc) {
      const docAt = docStart.get(entry.path)
      if (docAt === undefined || droppedPlaces.has(entry.path) || droppedPlaces.has(`${entry.path}#${entry.anchor}`)) continue
      // "Cover" or "Title Page" naming a picture: no chapter of that name.
      if (COVER_LABEL.test(norm(entry.label)) && (docWords.get(entry.path) ?? 0) < 10) continue
      const at = entry.anchor ? anchorAt.get(`${entry.path}#${entry.anchor}`) ?? docAt : docAt
      if (at < 0 || at >= stream.length) continue
      // Two entries at one place (a part and its first chapter): the deeper names it.
      if (!starts.has(at) || entry.depth > 0) starts.set(at, entry.label)
    }
    if (starts.size < 2) {
      starts.clear()
      for (const doc of docTitles) if (doc.at < stream.length && !starts.has(doc.at)) starts.set(doc.at, doc.title)
    }
    const frontMatter = !starts.has(0)
    if (frontMatter) {
      // Text before the first contents entry (a title page, a library's header) opens the book.
      const first = docTitles.find(doc => doc.at === 0)?.title
      starts.set(0, first || title)
    }
    const cuts = [...starts.keys()].sort((a, b) => a - b)
    let cut: Piece[] = cuts.map((at, index) => ({ title: starts.get(at) || '', blocks: stream.slice(at, cuts[index + 1] ?? stream.length) }))
    const front = frontMatter ? cut[0] : null
    // A piece that is only headings (a part title page) joins the next piece.
    const merged: Piece[] = []
    for (let i = 0; i < cut.length; i++) {
      const piece = cut[i]
      const next = cut[i + 1]
      if (next && piece.blocks.every(block => block.heading)) {
        next.blocks = [...piece.blocks.filter(block => norm(block.text) !== norm(next.title)), ...next.blocks]
        continue
      }
      merged.push(piece)
    }
    cut = merged.filter(piece => piece.blocks.length > 0)
    // A short front matter is the first chapter's opening, not a chapter of its own.
    if (front && cut[0] === front && cut.length > 1 && front.blocks.map(block => block.text).join(' ').split(/\s+/).length < FRONT_MATTER_WORDS) {
      cut[1].blocks = [...front.blocks, ...cut[1].blocks]
      cut.shift()
    }
    pieces = cut
  }
  // Every picture read once: decoration, the cover and what cannot be read are
  // left out; the rest are numbered in reading order and kept beside the book.
  // A captioned picture this device cannot draw (missing from the file, a format
  // it does not decode) keeps its place and caption, drawn as a placeholder.
  const images = new Map<string, UserBookImage>()
  const declaredType = (path: string) => [...manifest.values()].find(item => item.href === path || zip.find(item.href) === path)?.type || ''
  const check = options.images !== false
  let figureCount = 0
  for (const piece of pieces) {
    const kept: Block[] = []
    for (const block of piece.blocks) {
      if (!block.figure) { kept.push(block); continue }
      const picture = block.figure
      if (isCover(picture.href)) { droppedImages += 1; continue }
      const found = await readPicture(zip, picture, declaredType)
      if (found === 'decoration') { droppedImages += 1; continue }
      const prepared = found ? await preparePicture(found.bytes, found.type, { check }).catch(() => null) : null
      const usable = prepared && prepared.bytes.length <= MAX_STORED_PICTURE_BYTES ? prepared : null
      if (!usable && !picture.caption) { droppedImages += 1; continue }
      figureCount += 1
      const id = `f${figureCount}`
      // The size the book drew it at decides its layout; a picture redrawn smaller keeps its shape.
      const size = found?.size ?? usable?.size ?? null
      const shown = usable?.size ?? size
      if (usable && check) images.set(id, { type: usable.type, data: usable.bytes.slice().buffer as ArrayBuffer })
      kept.push({
        text: figureToken(id),
        heading: false,
        figure: picture,
        meta: {
          id, number: figureCount, src: usable ? `asset:${id}` : '',
          ...(usable ? {} : { unavailable: true }),
          ...(picture.caption ? { caption: picture.caption.slice(0, 600) } : {}),
          ...(picture.alt ? { alt: picture.alt.slice(0, 300) } : {}),
          ...(shown ? { width: shown.width, height: shown.height } : {}),
          ...(size && largeSize(size) ? { large: true } : {}),
        },
      })
    }
    piece.blocks = kept
  }
  pieces = pieces.filter(piece => piece.blocks.length > 0)
  const candidates: Array<AuthorCandidate | null> = []
  const converted: UserBookChapter[] = pieces.map((piece, index) => {
    const titled = piece.title || piece.blocks.find(block => block.heading)?.text.replace(/(^|\s)_|_(\s|$)/g, '$1$2') || `Section ${index + 1}`
    // The heading repeated under the title is found without the title's footnote call ("PAULINUS.[1] OF …").
    let opened = chapterOpening(piece.blocks, titled.replace(/(?<=\S)\[\d{1,3}\]/g, ''))
    // Rules 6: or as the chapter's own entry names it ("CHAPTER II" under "BOOK ONE, CHAPTER II").
    if (v6 && piece.alias && titleKey(piece.alias) !== titleKey(titled) && opened.length === piece.blocks.length) {
      const again = chapterOpening(piece.blocks, piece.alias.replace(/(?<=\S)\[\d{1,3}\]/g, ''))
      if (again.length < piece.blocks.length) opened = again
    }
    // Rules 6: a story's first part keeps no "I." of its own under the story's title.
    const partNumber = v6 && piece.alias && titleKey(piece.alias) !== titleKey(titled) ? bareNumeral(piece.alias) : null
    if (partNumber) {
      const at = opened.slice(0, 3).findIndex(block => bareNumeral(block.text) === partNumber)
      if (at >= 0) opened = opened.filter((_, index) => index !== at)
    }
    const blocks = opened.length ? opened : piece.blocks
    const sourceTitle = clean(titled).slice(0, 200)
    const chapter: UserBookChapter = { number: index + 1, title: sourceTitle, paragraphs: blocks.map(block => block.text) }
    if (blocks.some(block => block.kind)) chapter.kinds = blocks.map(block => block.kind ?? null)
    const links = blocks.flatMap((block, paragraph) => (block.links ?? []).map(([from, to, href]): [number, number, number, string] => [paragraph, from, to, href]))
    if (links.length) chapter.links = links
    const figures = blocks.flatMap(block => block.meta ? [block.meta] : [])
    if (figures.length) chapter.figures = figures
    candidates.push(authorCandidate(blocks, piece.blocks, piece.title))
    return chapter
  })
  // Who wrote each chapter of an essay collection or anthology, beside the text: its byline stays in it.
  const { authors, collection } = chapterAuthors(candidates, creators)
  authors.forEach((name, index) => { if (name) converted[index].author = name })
  // The book's own printed contents ("CONTENTS / PAGE / Of Providence 1 …") is left out like
  // its contents page (public/lab/printed-contents.js); the reader has its own chapter menu.
  const kept = dropPrintedContents(converted)
  // Rules 6: a book of one chapter without a title of its own (an essay, a pamphlet) reads under the book's, never "Section 1".
  if (v6 && kept.length === 1 && /^section \d+$/i.test(kept[0].title)) kept[0] = { ...kept[0], title: shortTitle(title) }
  // Titles are read together, so boilerplate shared by a book's headings is left out (chapter-title.js).
  const chapters = options.sourceTitles ? kept : normalizeChapterTitles(kept, { language })
  // Rules 6: a play whose speeches open on their speakers ("NORA. …"): the reader sets them as labels.
  const speakers = v6 && isPlayText(chapters.flatMap(chapter => chapter.paragraphs))
  return { edition: { format: USER_EDITION_FORMAT, converter: rules, title, ...(subtitle ? { subtitle } : {}), author, ...(collection ? { collection: true as const } : {}), ...(speakers ? { speakers: true as const } : {}), bylines: true, language, chapters, droppedImages }, images }
}
