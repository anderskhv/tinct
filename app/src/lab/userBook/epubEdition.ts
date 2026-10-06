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
 * emphasis markup; images, styles and scripts are dropped.
 *
 * DRM-protected books are refused (font obfuscation is allowed), with the same
 * codes and wording Add a book uses.
 */

import { USER_EDITION_CONVERTER, USER_EDITION_FORMAT, type UserBookChapter, type UserBookEdition } from './userEdition'

export { USER_EDITION_CONVERTER, USER_EDITION_FORMAT, type UserBookChapter, type UserBookEdition }

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
    const name = ((flags & 0x800) ? utf8 : latin1).decode(bytes.subarray(p + 46, p + 46 + nameLen))
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
  return { entries, read, readText, has: (name: string) => entries.has(name) }
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

const byLocal = (root: Document | Element, name: string): Element[] => [...root.getElementsByTagName('*')].filter(el => el.localName === name)
const clean = (text: string | null | undefined) => (text || '').replace(/\s+/g, ' ').trim()
const textOf = (root: Document | Element, name: string) => clean(byLocal(root, name)[0]?.textContent)
const epubType = (el: Element) => (el.getAttribute('epub:type') || el.getAttributeNS('http://www.idpf.org/2007/ops', 'type') || '').toLowerCase()

const ALLOWED_ENCRYPTION = new Set(['http://www.idpf.org/2008/embedding', 'http://ns.adobe.com/pdf/enc#RC'])

/* ---------- Text: blocks of one document ---------- */

/** One paragraph of a document, before chapters are cut. */
interface Block { text: string; heading: boolean }

interface DocumentBlocks {
  blocks: Block[]
  /** Element id → index of the block it starts in (or precedes). */
  anchors: Map<string, number>
  images: number
}

const BLOCK = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'hr', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'caption', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav', 'center', 'address', 'hgroup', 'body', 'html', 'details', 'summary'])
const DROP = new Set(['head', 'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea', 'noscript', 'video', 'audio', 'canvas', 'template', 'link', 'meta', 'title', 'base', 'source', 'track', 'map', 'area', 'frame', 'frameset', 'applet', 'dialog', 'rt', 'rp'])
const PICTURE = new Set(['img', 'svg', 'image', 'picture'])
const EMPHASIS = new Set(['em', 'i'])
const NOTE_MARKER = /^[[(]?(\d{1,3}|[*†‡§¶]+)[\])]?$/

interface Segment { text: string; em: boolean }

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
    if (last && last.em === segment.em) last.text += text
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

function documentBlocks(source: string): DocumentBlocks {
  let doc = new DOMParser().parseFromString(source, 'application/xhtml+xml')
  if (doc.getElementsByTagName('parsererror').length) doc = new DOMParser().parseFromString(source, 'text/html')
  const body = byLocal(doc, 'body')[0] || doc.documentElement
  const blocks: Block[] = []
  const anchors = new Map<string, number>()
  let images = 0
  let segments: Segment[] = []
  let heading = false

  const flush = () => {
    const text = joinSegments(segments)
    segments = []
    if (text) blocks.push({ text, heading })
  }

  const walk = (node: Node, em: boolean, inHeading: boolean) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3 || child.nodeType === 4) {
        if (segments.length === 0 && !(child.nodeValue || '').trim()) continue
        if (segments.length === 0) heading = inHeading
        segments.push({ text: child.nodeValue || '', em })
        continue
      }
      if (child.nodeType !== 1) continue
      const el = child as Element
      const name = el.localName.toLowerCase()
      if (DROP.has(name)) continue
      const id = el.getAttribute('id') || (name === 'a' ? el.getAttribute('name') : null)
      if (id && !anchors.has(id)) anchors.set(id, blocks.length)
      if (PICTURE.has(name)) { images++; continue }
      // A line break ends a paragraph (verse, addresses), but not a heading: "I.<br/>Introduction" is one title.
      if (name === 'br') { if (inHeading) segments.push({ text: ' ', em: false }); else flush(); continue }
      const type = epubType(el)
      if (name === 'a' || name === 'sup' || name === 'span') {
        // Note markers ("1", "*", "[3]") that only point elsewhere in the book.
        const role = (el.getAttribute('role') || '').toLowerCase()
        const href = el.getAttribute('href') || el.querySelector?.('a')?.getAttribute('href') || ''
        if (/noteref/.test(type) || role === 'doc-noteref' || (href && !/^[a-z][a-z0-9+.-]*:/i.test(href) && NOTE_MARKER.test(clean(el.textContent)))) continue
      }
      const lineLike = name === 'span' && /(^|\s)(line|verse)(\s|$)/i.test(el.getAttribute('class') || '')
      if (BLOCK.has(name) || lineLike || name === 'tr') {
        flush()
        walk(el, em, inHeading || /^h[1-6]$/.test(name))
        flush()
        continue
      }
      if (name === 'td' || name === 'th') {
        if (segments.length) segments.push({ text: ' ', em: false })
        walk(el, em, inHeading)
        continue
      }
      if (name === 'math') {
        const text = el.getAttribute('alttext') || el.textContent || ''
        if (segments.length === 0) heading = inHeading
        segments.push({ text, em })
        continue
      }
      walk(el, em || EMPHASIS.has(name), inHeading)
    }
  }

  walk(body, false, false)
  flush()
  return { blocks, anchors, images }
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

/** The chapter title repeated as the chapter's own first heading adds nothing: the reader prints the title. */
function withoutTitleHeading(blocks: Block[], title: string): Block[] {
  const wanted = norm(title)
  if (!wanted) return blocks
  const index = blocks.slice(0, 6).findIndex(block => {
    if (!block.heading) return false
    const text = norm(block.text)
    return !!text && (text === wanted || text.startsWith(wanted + ' ') || wanted.startsWith(text + ' '))
  })
  return index < 0 ? blocks : [...blocks.slice(0, index), ...blocks.slice(index + 1)]
}

export async function epubToEdition(input: ArrayBuffer | Uint8Array, options: { fallbackTitle?: string } = {}): Promise<UserBookEdition> {
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
  const title = textOf(meta, 'title') || clean(options.fallbackTitle) || 'Untitled book'
  const author = byLocal(meta, 'creator').map(creator => clean(creator.textContent)).filter(Boolean).join(', ')
  const language = textOf(meta, 'language')
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

  // The whole book as one run of blocks, remembering where each document and anchor starts.
  const stream: Block[] = []
  const docStart = new Map<string, number>()
  const anchorAt = new Map<string, number>()
  const docTitles: Array<{ at: number; title: string }> = []
  let droppedImages = 0
  for (const item of spine) {
    const source = await zip.readText(item.href)
    const parsed = documentBlocks(source || '')
    docStart.set(item.href, stream.length)
    for (const [id, index] of parsed.anchors) anchorAt.set(`${item.href}#${id}`, stream.length + index)
    const firstHeading = parsed.blocks.find(block => block.heading)?.text
    docTitles.push({ at: stream.length, title: firstHeading ? clean(firstHeading.replace(/(^|\s)_|_(\s|$)/g, '$1$2')) : '' })
    stream.push(...parsed.blocks)
    droppedImages += parsed.images
  }
  if (!stream.length) throw new EpubError('bad_epub', 'This EPUB has no readable chapters.')

  // Chapter starts: the contents' entries in reading order, else every document.
  const toc = await readToc(zip, manifest, spineEl)
  const starts = new Map<number, string>()
  for (const entry of toc) {
    const docAt = docStart.get(entry.path)
    if (docAt === undefined) continue
    const at = entry.anchor ? anchorAt.get(`${entry.path}#${entry.anchor}`) ?? docAt : docAt
    if (at >= stream.length) continue
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
  let pieces = cuts.map((at, index) => ({ title: starts.get(at) || '', blocks: stream.slice(at, cuts[index + 1] ?? stream.length) }))
  const front = frontMatter ? pieces[0] : null
  // A piece that is only headings (a part title page) joins the next piece.
  const merged: typeof pieces = []
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i]
    const next = pieces[i + 1]
    if (next && piece.blocks.every(block => block.heading)) {
      next.blocks = [...piece.blocks.filter(block => norm(block.text) !== norm(next.title)), ...next.blocks]
      continue
    }
    merged.push(piece)
  }
  pieces = merged.filter(piece => piece.blocks.length > 0)
  // A short front matter is the first chapter's opening, not a chapter of its own.
  if (front && pieces[0] === front && pieces.length > 1 && front.blocks.map(block => block.text).join(' ').split(/\s+/).length < FRONT_MATTER_WORDS) {
    pieces[1].blocks = [...front.blocks, ...pieces[1].blocks]
    pieces.shift()
  }
  const chapters: UserBookChapter[] = pieces.map((piece, index) => {
    const titled = piece.title || piece.blocks.find(block => block.heading)?.text.replace(/(^|\s)_|_(\s|$)/g, '$1$2') || `Section ${index + 1}`
    const blocks = withoutTitleHeading(piece.blocks, titled)
    return { number: index + 1, title: clean(titled).slice(0, 200), paragraphs: (blocks.length ? blocks : piece.blocks).map(block => block.text) }
  })
  return { format: USER_EDITION_FORMAT, converter: USER_EDITION_CONVERTER, title, author, language, chapters, droppedImages }
}
