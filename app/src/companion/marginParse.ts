/**
 * The margin reader's answer parsers, for the app bundle. Pure: no browser
 * APIs. Its twin is public/lab/margin/margin-parse.js (the PDF reader's static
 * page imports that copy); src/marginParse.test.ts runs both against the same
 * cases, so change them together.
 */
//
// What each answer looks like is set in docs/margin/PROMPTS.md: a bottom line (the first
// sentence of the first paragraph), citation tokens such as {p. 12}, Fact-check's verdict
// words and its "Sources:" line, and the JSON of Quiz me, its marking and define_sense.

/** The kinds of citation a PDF answer may carry, as printed: {p. 12}, {pp. 12–13}, {eq. 1.2}, {fig. 1.3}, {table 2}, {sec. 2.4}. */
export const CITATION_KINDS = ['p', 'pp', 'eq', 'fig', 'table', 'sec'] as const
export type CitationKind = typeof CITATION_KINDS[number]
export interface CitationToken { type: 'cite'; kind: CitationKind; label: string; to?: string; raw: string }
export interface TextPart { type: 'text'; text: string }
export type CitationPart = TextPart | CitationToken

const LABEL = '[\\p{L}\\p{N}](?:[\\p{L}\\p{N}.\\-]{0,14}[\\p{L}\\p{N}])?'
const CITATION_RE = new RegExp(`\\{\\s*(pp|p|eq|fig|table|sec)(?:\\.\\s*|\\s+)(${LABEL})(?:\\s*[\\u2013\\u2014-]\\s*(${LABEL}))?\\s*\\}`, 'giu')

const LIST_ITEM_RE = new RegExp(`^(?:(pp|p|eq|fig|table|sec)(?:\\.\\s*|\\s+))?(${LABEL}(?:\\s*[\\u2013\\u2014-]\\s*${LABEL})?)$`, 'iu')

/**
 * A list in one pair of braces ({p. 4, p. 5}, {pp. 4, 6}, {fig. 2 and fig. 3}) as one tag per
 * item: "{p. 4}, {p. 5}". An item without its kind takes the one before it. A brace that is not
 * wholly a list of citations stays as written.
 */
function splitCitationLists(source: string): string {
  return source.replace(/\{([^{}\n]{3,120})\}/g, (whole, inner: string) => {
    const items = inner.split(/\s*(?:,|;|\band\b|&)\s*/i).filter(Boolean)
    if (items.length < 2) return whole
    let kind = ''
    const out: string[] = []
    for (const item of items) {
      const m = LIST_ITEM_RE.exec(item.trim())
      if (!m || (!m[1] && !kind)) return whole
      kind = m[1] ? m[1].toLowerCase() : kind
      out.push(`{${kind === 'pp' && !/[\u2013\u2014-]/.test(m[2]) ? 'p' : kind}${kind === 'table' ? ' ' : '. '}${m[2]}}`)
    }
    return out.join(', ')
  })
}

/**
 * Text split into text and citation parts, in order. A `{…}` that is not a citation, or one
 * `resolve(token)` turns down (the page or equation is not in this PDF), stays text exactly
 * as written. A range is only for pages ({pp. 12–13}); {p. 12–13} is read as the same range.
 * -> [{ type: 'text', text } | { type: 'cite', kind, label, to?, raw }]
 */
export function parseCitations(text: unknown, resolve?: (token: CitationToken) => boolean): CitationPart[] {
  const source = splitCitationLists(String(text ?? ''))
  const out: CitationPart[] = []
  let last = 0
  const pushText = (value: string) => {
    if (!value) return
    const prev = out[out.length - 1]
    if (prev && prev.type === 'text') prev.text += value
    else out.push({ type: 'text', text: value })
  }
  CITATION_RE.lastIndex = 0
  for (let m: RegExpExecArray | null; (m = CITATION_RE.exec(source));) {
    let kind = m[1].toLowerCase() as CitationKind
    let to: string | undefined = m[3]
    if (to && kind !== 'p' && kind !== 'pp') continue // {eq. 1–2} is not a citation
    let label = m[2]
    if (to) kind = 'pp'
    else if (kind === 'pp') {
      // {pp. 12-13} with a hyphen reads as one label; split it. {pp. 12} names no range.
      const split = /^(.+)-(.+)$/.exec(label)
      if (!split) continue
      label = split[1]
      to = split[2]
    } else if (kind === 'p') {
      // {p. 12-13} with a plain hyphen is a page range too; a printed label such as "A-3" stays one page.
      const split = /^(\d+)-(\d+)$/.exec(label) || /^([ivxlcdm]+)-([ivxlcdm]+)$/i.exec(label)
      if (split) { kind = 'pp'; label = split[1]; to = split[2] }
    }
    const token: CitationToken = { type: 'cite', kind, label, ...(to ? { to } : {}), raw: m[0] }
    if (typeof resolve === 'function' && !resolve(token)) continue
    pushText(source.slice(last, m.index))
    out.push(token)
    last = m.index + m[0].length
  }
  pushText(source.slice(last))
  return out
}

/** The citation tokens alone (no text), for a cite field or a quick count. */
export function citationTokens(text: unknown): CitationToken[] {
  return parseCitations(text).filter((part): part is CitationToken => part.type === 'cite')
}

// Words that end in a dot without ending the sentence.
const ABBREVIATIONS = new Set(['e.g', 'i.e', 'cf', 'etc', 'vs', 'viz', 'al', 'approx', 'ca', 'c', 'dr', 'mr', 'mrs', 'ms', 'prof', 'st', 'no', 'vol', 'ch', 'chap', 'p', 'pp', 'eq', 'eqs', 'fig', 'figs', 'sec', 'secs', 'ed', 'eds'])

function paragraphsOf(text: unknown): string[] {
  return String(text ?? '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n+/).map(p => p.trim()).filter(Boolean)
}

/** Where the first sentence of `p` ends (an index into p), from `from` on. */
function sentenceEnd(p: string, from: number): number {
  let depth = 0
  for (let i = from; i < p.length; i++) {
    const ch = p[i]
    if (ch === '{') depth++
    else if (ch === '}') depth = Math.max(0, depth - 1)
    if (depth || !/[.?!]/.test(ch)) continue
    let j = i + 1
    while (j < p.length && /[.?!]/.test(p[j])) j++
    while (j < p.length && /["'”’)\]*_]/.test(p[j])) j++
    if (j < p.length && !/\s/.test(p[j])) continue // 1.2, U.S.A., a.b
    if (ch === '.') {
      const word = /([\p{L}.]+)$/u.exec(p.slice(0, i))?.[1]?.toLowerCase() || ''
      if (ABBREVIATIONS.has(word) || /^\p{L}$/u.test(word) && j < p.length) continue
    }
    // A citation after the sentence belongs to it: "… holds. {p. 12} Next …"
    let k = j
    for (;;) {
      const rest = p.slice(k)
      const m = /^\s*\{[^{}\n]{1,40}\}/.exec(rest)
      if (!m || !citationTokens(m[0].trim()).length) break
      k += m[0].length
    }
    return k
  }
  return p.length
}

/**
 * The card's bottom line: the first sentence of the first paragraph, bolded by the client
 * (it never parses Markdown bold). `rest` is everything after it, paragraphs kept.
 * `prefixes` (Fact-check's verdict words) count as part of the first sentence.
 * -> { lead, rest }
 */
export function splitBottomLine(text: unknown, options: { prefixes?: readonly string[] } = {}): { lead: string; rest: string } {
  const paras = paragraphsOf(text)
  if (!paras.length) return { lead: '', rest: '' }
  const first = paras[0]
  let from = 0
  for (const prefix of options.prefixes || []) {
    const m = leadingWord(first, [prefix])
    if (m) { from = m.length; break; }
  }
  const end = sentenceEnd(first, from)
  const lead = first.slice(0, end).trim()
  const tail = first.slice(end).trim()
  return { lead, rest: [tail, ...paras.slice(1)].filter(Boolean).join('\n\n') }
}

/** Fact-check's verdict words, in the prompt's order, and Note. for context that is not a verdict. */
export const VERDICTS = ['Holds.', 'Partly holds.', 'Outdated.', 'Disputed.', "Can't check."] as const
export type Verdict = typeof VERDICTS[number]
export const NOTE = 'Note.'

// "Can’t" and "Can't" are the same word; a verdict may come wrapped in * or _ despite the prompt.
function leadingWord<W extends string>(p: string, words: readonly W[]): { word: W; length: number } | null {
  const m = /^([*_]{0,2})([^.\n]{1,20}\.)([*_]{0,2})(?=\s|$)/.exec(p)
  if (!m) return null
  const found = m[2].replace(/’/g, "'").toLowerCase()
  const word = words.find(w => w.toLowerCase() === found)
  return word ? { word, length: m[0].length } : null
}

const LINK_RE = /\[([^\]\n]{1,300})\]\(\s*(https?:\/\/(?:[^\s()<>]|\([^\s()<>]*\))+)\s*\)/gi
const BARE_URL_RE = /\bhttps?:\/\/[^\s<>()\[\]·]+/gi

/** A source's URL if it is a plain http(s) link, else null. */
function safeUrl(raw: string): string | null {
  const url = String(raw).replace(/[.,;:]+$/, '')
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
  } catch { return null; }
}

/** The links on a "Sources:" line: Markdown links first, else bare http(s) URLs (titled by host). */
export interface Source { title: string; url: string }
export function parseSourcesLine(line: unknown): Source[] {
  const body = String(line ?? '').replace(/^\s*[*_]{0,2}sources[*_]{0,2}\s*:[*_]{0,2}/i, '')
  const out: Source[] = []
  const seen = new Set<string>()
  const add = (title: string, url: string) => {
    const safe = safeUrl(url)
    if (!safe || seen.has(safe)) return
    seen.add(safe)
    out.push({ title: title.replace(/\s+/g, ' ').trim() || new URL(safe).hostname, url: safe })
  }
  LINK_RE.lastIndex = 0
  for (let m: RegExpExecArray | null; (m = LINK_RE.exec(body));) add(m[1], m[2])
  if (!out.length) {
    BARE_URL_RE.lastIndex = 0
    for (let m: RegExpExecArray | null; (m = BARE_URL_RE.exec(body));) { const safe = safeUrl(m[0]); if (safe) add(new URL(safe).hostname.replace(/^www\./, ''), safe); }
  }
  return out
}

/**
 * A Fact-check answer: the overall verdict and its sentence (the bottom line), one entry per
 * paragraph after it with its verdict word (or Note., or none), and the sources.
 * -> { verdict, lead, claims: [{ verdict, text }], sources: [{ title, url }] }
 * `verdict` is one of VERDICTS or null; a claim's is one of VERDICTS, NOTE or null.
 */
export interface Factcheck { verdict: Verdict | null; lead: string; claims: Array<{ verdict: Verdict | typeof NOTE | null; text: string }>; sources: Source[] }
export function parseFactcheck(text: unknown): Factcheck {
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n')
  let sources: Source[] = []
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^\s*[*_]{0,2}sources[*_]{0,2}\s*:/i.test(lines[i])) {
      sources = parseSourcesLine(lines[i])
      lines.splice(i, 1)
      break
    }
  }
  const paras = paragraphsOf(lines.join('\n'))
  if (!paras.length) return { verdict: null, lead: '', claims: [], sources }
  const head = leadingWord(paras[0], VERDICTS)
  const { lead, rest } = splitBottomLine(paras[0], { prefixes: VERDICTS })
  const claims = [...(rest ? [rest] : []), ...paras.slice(1)].map(p => {
    const w = leadingWord<Verdict | typeof NOTE>(p, [...VERDICTS, NOTE])
    return w ? { verdict: w.word, text: p.slice(w.length).trim() } : { verdict: null, text: p }
  })
  return { verdict: head ? head.word : null, lead, claims, sources }
}

/**
 * The JSON object in a reply: inside a code fence or after stray text, the first {...}
 * that parses. -> the object, or null.
 */
export function extractJson(text: unknown): Record<string, unknown> | null {
  const source = String(text ?? '')
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(source)
  const candidates = fenced ? [fenced[1], source] : [source]
  for (const candidate of candidates) {
    for (let start = candidate.indexOf('{'); start >= 0; start = candidate.indexOf('{', start + 1)) {
      const end = balancedEnd(candidate, start)
      if (end < 0) continue
      try {
        const value = JSON.parse(candidate.slice(start, end + 1))
        if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
      } catch { /* try the next brace */ }
    }
  }
  return null
}

function balancedEnd(s: string, start: number): number {
  let depth = 0, inString = false, escaped = false
  for (let i = start; i < s.length; i++) {
    const ch = s[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === '{') depth++
    else if (ch === '}' && --depth === 0) return i
  }
  return -1
}

const field = (value: unknown, max: number): string => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '')

/** A cite field kept only when it is exactly one citation token ({p. 12}); else ''. */
function citeField(value: unknown): string {
  const cite = field(value, 60)
  const parts = parseCitations(cite)
  return parts.length === 1 && parts[0].type === 'cite' ? cite : ''
}

/**
 * Quiz me's questions: up to three valid ones (a question and an answer each), in order.
 * -> { questions: [{ q, answer, why, cite }] } with 1 to 3 questions, or null.
 */
export interface QuizQuestion { q: string; answer: string; why: string; cite: string }
export function parseQuiz(text: unknown): { questions: QuizQuestion[] } | null {
  const value = extractJson(text)
  const list = value && Array.isArray(value.questions) ? value.questions : null
  if (!list) return null
  const questions = (list as unknown[]).flatMap((raw): QuizQuestion[] => {
    if (!raw || typeof raw !== 'object') return []
    const item = raw as Record<string, unknown>
    const q = field(item.q, 600), answer = field(item.answer, 600)
    return q && answer ? [{ q, answer, why: field(item.why, 600), cite: citeField(item.cite) }] : []
  }).slice(0, 3)
  return questions.length ? { questions } : null
}

/** The three marks a quiz answer can get, and how the card shows each as its bottom line. */
export const QUIZ_VERDICTS = ['right', 'nearly', 'not_yet'] as const
export type QuizVerdict = typeof QUIZ_VERDICTS[number]
export const QUIZ_VERDICT_LINE: Readonly<Record<QuizVerdict, string>> = { right: 'Right.', nearly: 'Nearly.', not_yet: 'Not yet.' }

/** quiz_check's mark. -> { verdict: 'right' | 'nearly' | 'not_yet', feedback } or null. */
export function parseQuizCheck(text: unknown): { verdict: QuizVerdict; feedback: string } | null {
  const value = extractJson(text)
  if (!value) return null
  const verdict = typeof value.verdict === 'string' ? value.verdict.trim().toLowerCase().replace(/[\s-]+/g, '_') : ''
  if (!(QUIZ_VERDICTS as readonly string[]).includes(verdict)) return null
  return { verdict: verdict as QuizVerdict, feedback: field(value.feedback, 600) }
}

/**
 * define_sense's pick: the 1-based number of the sense that fits, or 0 when none does.
 * `count` is how many senses were sent; a number outside 0..count is null (keep the
 * dictionary order), as is anything unreadable.
 */
export function parseDefineSense(text: unknown, count?: number): number | null {
  const value = extractJson(text)
  if (!value) return null
  const raw = value.sense
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' && /^\s*\d+\s*$/.test(raw) ? Number(raw) : NaN
  if (!Number.isInteger(n) || n < 0) return null
  if (typeof count === 'number' && Number.isInteger(count) && n > count) return null
  return n
}

/** One of Related's places: a citation or a few quoted words (or neither), then what happens there. */
export interface RelatedRow { cite: CitationToken | null; quote: string | null; text: string }

/**
 * Related (PROMPTS.md): the bottom line naming the thread, then one row per place: a citation
 * ({p. 5}, {sec. 3.2}) or, for a book without page numbers, a few quoted words, then what happens
 * there. A line without either is a row with no tag. Bullets and numbering the prompt forbids are
 * dropped. -> { lead, rows } (at most 8 rows)
 */
export function parseRelated(text: unknown): { lead: string; rows: RelatedRow[] } {
  const paras = paragraphsOf(text)
  if (!paras.length) return { lead: '', rows: [] }
  const clean = (block: string) => block.split('\n').map(l => l.replace(/^\s*(?:[-•*·]|\d{1,2}[.)])\s+/, '').trim()).filter(Boolean)
  const lines = paras.flatMap(clean)
  const startsRow = (line: string) => Boolean(leadingCite(line) || leadingQuote(line))
  const first = clean(paras[0])
  let lead = ''
  let from = 0
  if (!startsRow(first[0])) {
    const at = first.findIndex(l => startsRow(l))
    const head = at < 0 ? first : first.slice(0, at)
    lead = head.join(' ')
    from = head.length
  }
  const rows: RelatedRow[] = []
  for (const line of lines.slice(from)) {
    const cite = leadingCite(line)
    const quote = cite ? null : leadingQuote(line)
    const rest = cite ? cite.rest : quote ? quote.rest : line
    const body = rest.replace(/^\s*[:–—-]\s*/, '').trim()
    if (!body && !cite && !quote) continue
    rows.push({ cite: cite ? cite.token : null, quote: quote ? quote.quote : null, text: body })
    if (rows.length >= 8) break
  }
  return { lead, rows }
}

function leadingCite(line: string): { token: CitationToken; rest: string } | null {
  const m = /^\{[^{}\n]{1,40}\}/.exec(line)
  if (!m) return null
  const parts = parseCitations(m[0])
  return parts.length === 1 && parts[0].type === 'cite' ? { token: parts[0], rest: line.slice(m[0].length) } : null
}

function leadingQuote(line: string): { quote: string; rest: string } | null {
  const m = /^(?:“([^”\n]{2,160})”|"([^"\n]{2,160})")/.exec(line)
  return m ? { quote: (m[1] || m[2]).replace(/^[\s.…]+|[\s.…,;:]+$/g, '').trim(), rest: line.slice(m[0].length) } : null
}
