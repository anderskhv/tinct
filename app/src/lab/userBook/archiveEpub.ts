/**
 * An Internet Archive EPUB made by hocr-to-epub from a scan: one document a printed page, each a single
 * paragraph that opens on the page's running head and ends on its page number, low-accuracy pages headed
 * "The text on this page is estimated to be only 19.89% accurate", a notice page, and no metadata or
 * contents (30 Oct 2026 corpus: nine books). Rules 10 rebuild the book from its pages: the banners,
 * running heads, page numbers, notice, title and contents pages leave the text; the pages run together
 * where a sentence or a word runs on; chapters start where the printed book starts them ("CHAPTER IV.",
 * "II THE OPEN ROAD", or a title from its contents page); and a speech opening on a quotation mark after
 * a sentence starts a paragraph. The scan's other paragraph breaks are not in the file and stay lost.
 */

export interface ArchiveChapter { title: string; paragraphs: string[] }

const clean = (text: string) => text.replace(/\s+/g, ' ').trim()
const BANNER = /^\s*The text on this page is estimated to be only [\d.,]+% accurate\s*/i
const key = (text: string) => text.toLowerCase().replace(/[^\p{L}]+/gu, '')
const SMALL = new Set(['of', 'the', 'a', 'an', 'and', 'in', 'to', 'on', 'at', 'for', 'or', 'by', 'with', 'from'])
// A word of a running head or a printed title: in capitals, or a capitalised word, or a small word between.
const headWord = (word: string) => !/\p{Ll}/u.test(word) || /^[\p{Lu}"“‘'(]/u.test(word) || SMALL.has(word.toLowerCase())
const capsWord = (word: string) => /\p{Lu}/u.test(word) && !/\p{Ll}/u.test(word)
// "CHAPTER IV." and its OCR misreadings of the numeral ("CHAPTER L", "CHAPTER in", "CHAPTER H,").
const LABEL = /^(?:CHAPTER|Chapter|CHAP\.)\s+([IVXLCDMHJl1]{1,7}|\d{1,3}|in|ni|Xni)\b[.,:]?$/
const NUMERAL = /^(?:[IVXLC]{1,6}|[HJl]{1,3}|ID|HI|in)[.,]?$/
const MATTER = /^(?:contents|list of illustrations|illustrations|the persons of the play|dramatis personae)\b/i

/** An EPUB made by the Internet Archive's hocr-to-epub. */
export function isArchiveEpub(opfText: string, spineHrefs: string[], notice: string | null): boolean {
  const pages = spineHrefs.filter(href => /(?:^|\/)page_\d+\.x?html$/.test(href)).length
  return pages >= spineHrefs.length * 0.8 && pages >= 3 && (/hocr-to-epub/i.test(notice || '') || /automated character recognition/i.test(opfText))
}

function likeness(a: string, b: string): number {
  const grams = (s: string) => { const out = new Map<string, number>(); for (let i = 0; i < s.length - 1; i++) out.set(s.slice(i, i + 2), (out.get(s.slice(i, i + 2)) || 0) + 1); return out }
  const A = grams(a), B = grams(b)
  let shared = 0, total = 0
  for (const v of A.values()) total += v
  for (const v of B.values()) total += v
  for (const [k, v] of A) shared += Math.min(v, B.get(k) || 0)
  return total ? 2 * shared / total : 0
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
function roman(n: number): string {
  const tens = ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC']
  return n > 0 && n < 100 ? tens[Math.floor(n / 10)] + ROMAN[n % 10] : String(n)
}
const validRoman = (text: string) => /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(text) && text.length > 0

/** A title in capitals as a reader writes it ("THE OPEN ROAD" -> "The Open Road"). */
function titleCase(text: string): string {
  if (/\p{Ll}/u.test(text)) return text
  return text.toLowerCase().split(' ').map((word, i) => (i > 0 && SMALL.has(word.replace(/[^\p{L}]/gu, '')) ? word : word.replace(/\p{L}/u, c => c.toUpperCase()))).join(' ')
}

// The printed contents' titles ("I. THE RIVER BANK 1 H. THE OPEN ROAD 27 …"), keyed.
function contentsTitles(text: string): string[] {
  const out: string[] = []
  const body = text.replace(MATTER, '').replace(/^\s*(?:CHAPTER\s+)?PA[GC]E\b/i, '')
  const entry = /(?:^|\s)(?:CHAPTER\s+)?(?:[IVXLCHJl]{1,6}|ID|in|\d{1,2})[.,]?\s+((?:[^\s\d.]+[.,]?\s+){0,9}?[^\s\d.]+)[\s.,„…]*(?:\d{1,3}|[ivxl]{1,5})(?=\s|$)/g
  for (const m of body.matchAll(entry)) { const k = key(m[1]); if (k.length >= 5) out.push(k) }
  // A contents without numerals before its titles ("MENDING WALL . . . 11 THE DEATH OF THE HIRED MAN . . 14").
  if (out.length < 3) {
    for (const m of body.matchAll(/((?:[A-Z][A-Z'’-]*\s+){0,8}[A-Z][A-Z'’-]+)[\s.,„…]*\d{1,3}(?=\s|$)/g)) { const k = key(m[1]); if (k.length >= 5) out.push(k) }
  }
  return out
}

interface Page { n: number; words: string[]; head: string; start: { title: string; at: number } | null }

/**
 * pages: each page document's text in reading order (hocr-to-epub's page_N.html). Returns the book's title
 * (its most printed running head, '' when none) and its chapters.
 */
export function archiveChapters(pages: string[]): { title: string; chapters: ArchiveChapter[] } {
  // 1. The banner and the page's own number, at its start or end, when it follows the pages' count.
  const texts = pages.map(text => clean(text).replace(BANNER, ''))
  const offsets: number[] = []
  texts.forEach((text, i) => { const m = /\s(\d{1,3})$/.exec(text); if (m) offsets.push(Number(m[1]) - i) })
  offsets.sort((a, b) => a - b)
  const offset = offsets.length >= pages.length * 0.2 ? offsets[Math.floor(offsets.length / 2)] : null
  const numbered = (word: string, i: number) => /^\d{1,3}$/.test(word) && offset !== null && Math.abs(Number(word) - (i + offset)) <= 3
  const words = texts.map((text, i) => {
    const list = text.split(' ').filter(Boolean)
    if (list.length && (numbered(list.at(-1)!, i) || /^[ivxl]{1,6}$|^•[ivxl]{1,6}$/.test(list.at(-1)!))) list.pop()
    if (list.length && (numbered(list[0], i) || /^[ivxl]{2,6}$/.test(list[0]))) list.shift()
    return list
  })
  // 2. Running heads: the capitals a page opens on, set on several pages (the book's title, a chapter's).
  const prefixes = new Map<string, number>()
  for (const list of words) {
    const seen = new Set<string>()
    for (let k = 1; k <= Math.min(10, list.length); k++) {
      if (!headWord(list[k - 1]) || /^(?:CHAPTER|Chapter|CHAP\.)$/.test(list[k - 1])) break
      const kk = key(list.slice(0, k).join(' '))
      if (kk.length >= 6 && !seen.has(kk)) { seen.add(kk); prefixes.set(kk, (prefixes.get(kk) || 0) + 1) }
    }
  }
  const contents = new Set<string>()
  texts.forEach((text, i) => { if (i < pages.length * 0.15 && MATTER.test(text.replace(/^\W+/, ''))) for (const t of contentsTitles(text)) contents.add(t) })
  const heads = [...prefixes].filter(([k, n]) => n >= 3 || contents.has(k)).map(([k]) => k)
  const bookHead = [...prefixes].filter(([k, n]) => n >= Math.max(3, pages.length * 0.15) && !contents.has(k)).sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0]?.[0] || ''
  // The longest run of a page's opening words that is a head, exactly or as OCR misreads it; a stray
  // letter before it ("o THE RIVER BANK") goes with it.
  const headLength = (list: string[]): number => {
    for (let skip = 0; skip <= 1; skip++) {
      if (skip && !(list[0] && list[0].length <= 2)) break
      for (let k = Math.min(10, list.length - skip); k >= 1; k--) {
        const run = list.slice(skip, skip + k)
        if (!run.every(headWord)) continue
        const kk = key(run.join(' '))
        if (kk.length < 6) continue
        if (heads.includes(kk) || (k >= 2 && heads.some(h => Math.abs(h.length - kk.length) <= 3 && likeness(h, kk) >= 0.8))) return skip + k
      }
    }
    return 0
  }
  const parsed: Page[] = words.map((list, n) => {
    let at = 0
    // A label within the first words, after a head or OCR junk: the chapter's start.
    for (let i = 0; i < Math.min(14, list.length - 1); i++) {
      if (!LABEL.test(list[i] + ' ' + list[i + 1])) continue
      let j = i + 2
      const title: string[] = []
      while (j < list.length && title.length < 10 && capsWord(list[j])) { title.push(list[j]); j++ }
      // The drop cap: the text's first word, in capitals without its first letter, repeats the title ("MR. SHERLOCK
      // HOLMES R. SHERLOCK HOLMES, who…"); the title ends where the repeat begins.
      for (let r = 1; r < title.length; r++) {
        if (key(title[r]).length >= 1 && key(title[0]).endsWith(key(title[r])) && key(title[0]) !== key(title[r]) && (title[r + 1] ?? '') === (title[1] ?? '')) { j -= title.length - r; title.length = r; break }
      }
      // A title's last word followed by lower case ("THE Mole had") is the text's first word.
      if (title.length >= 2 && j < list.length && /^\p{Ll}/u.test(list[j]) && /^(?:THE|A|AN|IT|HE|SHE|I)$/.test(title.at(-1)!)) { title.pop(); j-- }
      const numeral = list[i + 1].replace(/[.,:]$/, '')
      return { n, words: list.slice(j), head: '', start: { title: [`CHAPTER ${numeral}`, ...title].join(' '), at: j } }
    }
    at = headLength(list)
    // A numeral and a title in capitals that the contents names ("II THE OPEN ROAD RATTY,” said…").
    if (!at && list[0] && NUMERAL.test(list[0])) {
      let j = 1
      const title: string[] = []
      while (j < list.length && title.length < 10 && capsWord(list[j])) { title.push(list[j]); j++ }
      if (title.length >= 2 && /^\p{Ll}/u.test(list[j] ?? '') && /^(?:THE|A|AN|IT)$/.test(title.at(-1)!)) { title.pop(); j-- }
      const kk = key(title.join(' '))
      if (title.length && (contents.has(kk) || [...contents].some(c => likeness(c, kk) >= 0.8))) return { n, words: list.slice(j), head: '', start: { title: `${list[0].replace(/[.,]$/, '')} ${title.join(' ')}`, at: j } }
    }
    return { n, words: list.slice(at), head: at ? key(list.slice(0, at).join(' ')) : '', start: null }
  })
  // A contents title opening the first page of its run of pages, when no label found the chapters.
  if (!parsed.some(p => p.start) && contents.size >= 3) {
    let last = ''
    for (const p of parsed) {
      const raw = words[p.n]
      for (let k = Math.min(10, raw.length); k >= 2; k--) {
        const kk = key(raw.slice(0, k).join(' '))
        const hit = [...contents].find(c => c === kk || (Math.abs(c.length - kk.length) <= 3 && likeness(c, kk) >= 0.85))
        if (!hit) continue
        if (hit !== last) { p.start = { title: raw.slice(0, k).join(' '), at: k }; p.words = raw.slice(k) }
        last = hit
        break
      }
    }
  }
  if ((globalThis as { ARCHIVE_DEBUG?: boolean }).ARCHIVE_DEBUG) for (const p of parsed) if (p.start) console.log('START', p.n, JSON.stringify(p.start.title), JSON.stringify(words[p.n].slice(0, 12).join(' ')))
  // 3. Front matter (title page, dedication, contents, notices) before the first chapter, and the contents
  // and cast pages anywhere, leave the text.
  const first = parsed.findIndex(p => p.start)
  const body = parsed.filter((p, i) => (first < 0 || i >= first) && !MATTER.test((p.start ? '' : texts[p.n]).replace(/^\W+/, '')))
  // 4. The pages run together; a page ending a sentence ends its paragraph. A speech opens a paragraph.
  const chapters: ArchiveChapter[] = []
  let current: ArchiveChapter | null = null, para = ''
  const flush = () => { if (current && para.trim()) current.paragraphs.push(...speeches(para.trim())); para = '' }
  let count = 0
  for (const p of body) {
    if (p.start) {
      flush()
      count++
      const label = p.start.title.replace(/^CHAPTER\s+(\S+)/, (_, num: string) => `CHAPTER ${validRoman(num.toUpperCase()) ? num.toUpperCase() : roman(count)}`)
      current = { title: titleCase(label).replace(/^Chapter\s+(\S+)\s+(?=\S)/, 'Chapter $1. '), paragraphs: [] }
      chapters.push(current)
    }
    if (!current) { current = { title: '', paragraphs: [] }; chapters.push(current) }
    const text = p.words.join(' ')
    if (!text) continue
    if (!para) para = text
    else if (/\p{L}-$/u.test(para) && /^\p{Ll}/u.test(text)) para = para.slice(0, -1) + text
    else if (/[.!?]["”’)]?$/.test(para) && !/^\p{Ll}/u.test(text)) { flush(); para = text }
    else para += ' ' + text
  }
  flush()
  const kept = chapters.filter(c => c.paragraphs.length)
  return { title: bookHead ? titleCase(headDisplay(words, bookHead)) : '', chapters: kept }
}

// A head as printed, from the first page that opens on it.
function headDisplay(words: string[][], head: string): string {
  for (const list of words) for (let k = 1; k <= Math.min(10, list.length); k++) if (key(list.slice(0, k).join(' ')) === head) return list.slice(0, k).join(' ').replace(/[.,]$/, '')
  return head
}

// A paragraph's speeches: a quotation mark opening after a sentence's end starts a paragraph of its own.
function speeches(text: string): string[] {
  return text.split(/(?<=[.!?]["”’]?)\s+(?=["“](?:\s?\p{Lu}))/u).map(clean).filter(Boolean)
}
