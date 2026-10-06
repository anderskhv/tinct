/**
 * The text of a downloaded public-domain EPUB, for checking a converted edition
 * against it on the Worker (routes/publicBooks.ts). The Worker has no DOM, so the
 * conversion itself runs in the browser with the reader's own converter
 * (lab/userBook/epubEdition.ts); here the EPUB is only unzipped and its documents
 * reduced to their letters, so every paragraph and title the browser sends can be
 * found in the source before it is published for every reader.
 *
 * Pure apart from DecompressionStream (Workers, Node 18+). Bounded against zip bombs.
 */

export const MAX_SOURCE_TEXT_BYTES = 80 * 1024 * 1024
const MAX_ENTRIES = 5000

export class EpubSourceError extends Error {
  code: 'not_epub' | 'too_large' | 'unsupported'
  constructor(code: EpubSourceError['code'], message: string) {
    super(message)
    this.code = code
  }
}

interface Entry { name: string; method: number; compSize: number; size: number; local: number }

function entries(bytes: Uint8Array): Entry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let eocd = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new EpubSourceError('not_epub', 'not a zip archive')
  const count = view.getUint16(eocd + 10, true)
  if (count > MAX_ENTRIES) throw new EpubSourceError('too_large', 'too many entries')
  let p = view.getUint32(eocd + 16, true)
  const out: Entry[] = []
  const decoder = new TextDecoder()
  for (let n = 0; n < count; n++) {
    if (p + 46 > bytes.length || view.getUint32(p, true) !== 0x02014b50) throw new EpubSourceError('not_epub', 'damaged zip directory')
    const nameLength = view.getUint16(p + 28, true)
    out.push({
      method: view.getUint16(p + 10, true),
      compSize: view.getUint32(p + 20, true),
      size: view.getUint32(p + 24, true),
      local: view.getUint32(p + 42, true),
      name: decoder.decode(bytes.subarray(p + 46, p + 46 + nameLength)),
    })
    p += 46 + nameLength + view.getUint16(p + 30, true) + view.getUint16(p + 32, true)
  }
  return out
}

async function inflate(data: Uint8Array, limit: number): Promise<Uint8Array> {
  const source = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(data); controller.close() } })
  const stream = source.pipeThrough(new DecompressionStream('deflate-raw') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>)
  const reader = stream.getReader()
  const parts: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > limit) { await reader.cancel().catch(() => {}); throw new EpubSourceError('too_large', 'document too large') }
    parts.push(value)
  }
  const out = new Uint8Array(total)
  let at = 0
  for (const part of parts) { out.set(part, at); at += part.byteLength }
  return out
}

// Named entities that stand for letters (numeric ones are decoded generally).
const LETTER_ENTITIES: Record<string, string> = {}
for (const [base, marks] of Object.entries({ a: 'grave acute circ tilde uml ring', e: 'grave acute circ uml', i: 'grave acute circ uml', o: 'grave acute circ tilde uml slash', u: 'grave acute circ uml', y: 'acute uml', n: 'tilde', c: 'cedil' })) {
  for (const mark of marks.split(' ')) {
    LETTER_ENTITIES[base + mark] = base
    LETTER_ENTITIES[base.toUpperCase() + mark] = base
  }
}
Object.assign(LETTER_ENTITIES, { szlig: 'ss', aelig: 'ae', AElig: 'ae', oelig: 'oe', OElig: 'oe', eth: 'd', ETH: 'd', thorn: 'th', THORN: 'th' })

/** Lower-case letters only, accents and everything else removed: the form edition text is compared in. */
export function letters(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '')
    .replace(/[øæœßłđðþı]/g, c => ({ 'ø': 'o', 'æ': 'ae', 'œ': 'oe', 'ß': 'ss', 'ł': 'l', 'đ': 'd', 'ð': 'd', 'þ': 'th', 'ı': 'i' } as Record<string, string>)[c])
    .replace(/[^\p{L}]+/gu, '')
}

/** A markup document's text in `letters` form: no head, scripts, styles or tags. */
export function documentLetters(markup: string): string {
  const text = markup
    .replace(/<head[\s>][\s\S]*?<\/head>/gi, ' ')
    .replace(/<(script|style)[\s>][\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => { try { return String.fromCodePoint(parseInt(hex, 16)) } catch { return ' ' } })
    .replace(/&#(\d+);/g, (_, dec) => { try { return String.fromCodePoint(Number(dec)) } catch { return ' ' } })
    .replace(/&([a-z]+);/gi, (_, name) => LETTER_ENTITIES[name] ?? ' ')
  return letters(text)
}

/** Every document (XHTML, HTML, NCX) of the EPUB in reading-file order, as letters. */
export async function epubSourceLetters(bytes: Uint8Array): Promise<string> {
  const list = entries(bytes).filter(entry => /\.(x?html?|ncx)$/i.test(entry.name) && !entry.name.startsWith('META-INF/'))
  if (!list.length) throw new EpubSourceError('not_epub', 'no documents')
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const decoder = new TextDecoder()
  let budget = MAX_SOURCE_TEXT_BYTES
  const pieces: string[] = []
  for (const entry of list.sort((a, b) => a.local - b.local)) {
    if (entry.local + 30 > bytes.length || view.getUint32(entry.local, true) !== 0x04034b50) throw new EpubSourceError('not_epub', 'damaged entry')
    const start = entry.local + 30 + view.getUint16(entry.local + 26, true) + view.getUint16(entry.local + 28, true)
    const data = bytes.subarray(start, start + entry.compSize)
    let raw: Uint8Array
    if (entry.method === 0) raw = data
    else if (entry.method === 8) raw = await inflate(data, budget)
    else throw new EpubSourceError('unsupported', 'unsupported compression')
    budget -= raw.byteLength
    if (budget < 0) throw new EpubSourceError('too_large', 'book too large')
    pieces.push(documentLetters(decoder.decode(raw)))
  }
  return pieces.join('')
}

export interface EditionChapterInput { number: number; title: string; paragraphs: string[] }

export interface VerifiedEdition {
  chapters: EditionChapterInput[]
  checkedParagraphs: number
  removedParagraphs: number
  renamedChapters: number
}

/** Paragraphs whose text is not in the source may be at most this share; they are dropped. */
export const MAX_UNVERIFIED_SHARE = 0.03

/**
 * Keep only what the source contains. Paragraphs are found in order (a cursor
 * moves through the source, so a whole book costs about one pass); one that is
 * not found is searched for once from the start, and dropped if still missing.
 * A chapter title not in the source becomes "Section N". Returns null when too
 * much is missing: the upload is not this EPUB's conversion.
 */
export function verifyEditionAgainstSource(chapters: EditionChapterInput[], source: string): VerifiedEdition | null {
  let cursor = 0
  let checked = 0
  let removed = 0
  let renamed = 0
  let misses = 0
  const total = chapters.reduce((sum, chapter) => sum + chapter.paragraphs.length, 0)
  const missLimit = Math.max(3, Math.floor(total * MAX_UNVERIFIED_SHARE))
  const out: EditionChapterInput[] = []
  for (const chapter of chapters) {
    const kept: string[] = []
    for (const paragraph of chapter.paragraphs) {
      const needle = letters(paragraph)
      checked++
      if (!needle) { kept.push(paragraph); continue }
      let at = source.indexOf(needle, cursor)
      if (at < 0) at = source.indexOf(needle)
      if (at < 0) {
        removed++
        if (++misses > missLimit) return null
        continue
      }
      if (at >= cursor) cursor = at + needle.length
      kept.push(paragraph)
    }
    const titleLetters = letters(chapter.title)
    const generated = /^section \d+$/i.test(chapter.title.trim())
    const title = !titleLetters || generated || source.includes(titleLetters) ? chapter.title : `Section ${out.length + 1}`
    if (title !== chapter.title) renamed++
    if (kept.length) out.push({ number: out.length + 1, title, paragraphs: kept })
  }
  if (!out.length) return null
  return { chapters: out, checkedParagraphs: checked, removedParagraphs: removed, renamedChapters: renamed }
}
