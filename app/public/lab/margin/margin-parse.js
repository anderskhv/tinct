// The margin reader's answer parsers, for the PDF reader's static page. Dependency-free ESM,
// no browser APIs. Its twin is app/src/companion/marginParse.ts (the app bundle's copy); one
// test (src/marginParse.test.ts) runs both against the same cases, so change them together.
//
// What each answer looks like is set in docs/margin/PROMPTS.md: a bottom line (the first
// sentence of the first paragraph), citation tokens such as {p. 12}, Fact-check's verdict
// words and its "Sources:" line, and the JSON of Quiz me, its marking and define_sense.

/** The kinds of citation a PDF answer may carry, as printed: {p. 12}, {pp. 12–13}, {eq. 1.2}, {fig. 1.3}, {table 2}, {sec. 2.4}. */
export const CITATION_KINDS = ['p', 'pp', 'eq', 'fig', 'table', 'sec'];

const LABEL = '[\\p{L}\\p{N}](?:[\\p{L}\\p{N}.\\-]{0,14}[\\p{L}\\p{N}])?';
const CITATION_RE = new RegExp(`\\{\\s*(pp|p|eq|fig|table|sec)(?:\\.\\s*|\\s+)(${LABEL})(?:\\s*[\\u2013\\u2014-]\\s*(${LABEL}))?\\s*\\}`, 'giu');

/**
 * Text split into text and citation parts, in order. A `{…}` that is not a citation, or one
 * `resolve(token)` turns down (the page or equation is not in this PDF), stays text exactly
 * as written. A range is only for pages ({pp. 12–13}); {p. 12–13} is read as the same range.
 * -> [{ type: 'text', text } | { type: 'cite', kind, label, to?, raw }]
 */
export function parseCitations(text, resolve) {
  const source = String(text ?? '');
  const out = [];
  let last = 0;
  const pushText = value => {
    if (!value) return;
    const prev = out[out.length - 1];
    if (prev && prev.type === 'text') prev.text += value;
    else out.push({ type: 'text', text: value });
  };
  CITATION_RE.lastIndex = 0;
  for (let m; (m = CITATION_RE.exec(source));) {
    let kind = m[1].toLowerCase();
    let to = m[3];
    if (to && kind !== 'p' && kind !== 'pp') continue; // {eq. 1–2} is not a citation
    let label = m[2];
    if (to) kind = 'pp';
    else if (kind === 'pp') {
      // {pp. 12-13} with a hyphen reads as one label; split it. {pp. 12} names no range.
      const split = /^(.+)-(.+)$/.exec(label);
      if (!split) continue;
      label = split[1];
      to = split[2];
    }
    const token = { type: 'cite', kind, label, ...(to ? { to } : {}), raw: m[0] };
    if (typeof resolve === 'function' && !resolve(token)) continue;
    pushText(source.slice(last, m.index));
    out.push(token);
    last = m.index + m[0].length;
  }
  pushText(source.slice(last));
  return out;
}

/** The citation tokens alone (no text), for a cite field or a quick count. */
export function citationTokens(text) {
  return parseCitations(text).filter(part => part.type === 'cite');
}

// Words that end in a dot without ending the sentence.
const ABBREVIATIONS = new Set(['e.g', 'i.e', 'cf', 'etc', 'vs', 'viz', 'al', 'approx', 'ca', 'c', 'dr', 'mr', 'mrs', 'ms', 'prof', 'st', 'no', 'vol', 'ch', 'chap', 'p', 'pp', 'eq', 'eqs', 'fig', 'figs', 'sec', 'secs', 'ed', 'eds']);

function paragraphsOf(text) {
  return String(text ?? '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n+/).map(p => p.trim()).filter(Boolean);
}

/** Where the first sentence of `p` ends (an index into p), from `from` on. */
function sentenceEnd(p, from) {
  let depth = 0;
  for (let i = from; i < p.length; i++) {
    const ch = p[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth = Math.max(0, depth - 1);
    if (depth || !/[.?!]/.test(ch)) continue;
    let j = i + 1;
    while (j < p.length && /[.?!]/.test(p[j])) j++;
    while (j < p.length && /["'”’)\]*_]/.test(p[j])) j++;
    if (j < p.length && !/\s/.test(p[j])) continue; // 1.2, U.S.A., a.b
    if (ch === '.') {
      const word = /([\p{L}.]+)$/u.exec(p.slice(0, i))?.[1]?.toLowerCase() || '';
      if (ABBREVIATIONS.has(word) || /^\p{L}$/u.test(word) && j < p.length) continue;
    }
    // A citation after the sentence belongs to it: "… holds. {p. 12} Next …"
    let k = j;
    for (;;) {
      const rest = p.slice(k);
      const m = /^\s*\{[^{}\n]{1,40}\}/.exec(rest);
      if (!m || !citationTokens(m[0].trim()).length) break;
      k += m[0].length;
    }
    return k;
  }
  return p.length;
}

/**
 * The card's bottom line: the first sentence of the first paragraph, bolded by the client
 * (it never parses Markdown bold). `rest` is everything after it, paragraphs kept.
 * `prefixes` (Fact-check's verdict words) count as part of the first sentence.
 * -> { lead, rest }
 */
export function splitBottomLine(text, options = {}) {
  const paras = paragraphsOf(text);
  if (!paras.length) return { lead: '', rest: '' };
  const first = paras[0];
  let from = 0;
  for (const prefix of options.prefixes || []) {
    const m = leadingWord(first, [prefix]);
    if (m) { from = m.length; break; }
  }
  const end = sentenceEnd(first, from);
  const lead = first.slice(0, end).trim();
  const tail = first.slice(end).trim();
  return { lead, rest: [tail, ...paras.slice(1)].filter(Boolean).join('\n\n') };
}

/** Fact-check's verdict words, in the prompt's order, and Note. for context that is not a verdict. */
export const VERDICTS = ['Holds.', 'Partly holds.', 'Outdated.', 'Disputed.', "Can't check."];
export const NOTE = 'Note.';

// "Can’t" and "Can't" are the same word; a verdict may come wrapped in * or _ despite the prompt.
function leadingWord(p, words) {
  const m = /^([*_]{0,2})([^.\n]{1,20}\.)([*_]{0,2})(?=\s|$)/.exec(p);
  if (!m) return null;
  const found = m[2].replace(/’/g, "'").toLowerCase();
  const word = words.find(w => w.toLowerCase() === found);
  return word ? { word, length: m[0].length } : null;
}

const LINK_RE = /\[([^\]\n]{1,300})\]\(\s*(https?:\/\/(?:[^\s()<>]|\([^\s()<>]*\))+)\s*\)/gi;
const BARE_URL_RE = /\bhttps?:\/\/[^\s<>()\[\]·]+/gi;

/** A source's URL if it is a plain http(s) link, else null. */
function safeUrl(raw) {
  const url = String(raw).replace(/[.,;:]+$/, '');
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch { return null; }
}

/** The links on a "Sources:" line: Markdown links first, else bare http(s) URLs (titled by host). */
export function parseSourcesLine(line) {
  const body = String(line ?? '').replace(/^\s*[*_]{0,2}sources[*_]{0,2}\s*:[*_]{0,2}/i, '');
  const out = [];
  const seen = new Set();
  const add = (title, url) => {
    const safe = safeUrl(url);
    if (!safe || seen.has(safe)) return;
    seen.add(safe);
    out.push({ title: title.replace(/\s+/g, ' ').trim() || new URL(safe).hostname, url: safe });
  };
  LINK_RE.lastIndex = 0;
  for (let m; (m = LINK_RE.exec(body));) add(m[1], m[2]);
  if (!out.length) {
    BARE_URL_RE.lastIndex = 0;
    for (let m; (m = BARE_URL_RE.exec(body));) { const safe = safeUrl(m[0]); if (safe) add(new URL(safe).hostname.replace(/^www\./, ''), safe); }
  }
  return out;
}

/**
 * A Fact-check answer: the overall verdict and its sentence (the bottom line), one entry per
 * paragraph after it with its verdict word (or Note., or none), and the sources.
 * -> { verdict, lead, claims: [{ verdict, text }], sources: [{ title, url }] }
 * `verdict` is one of VERDICTS or null; a claim's is one of VERDICTS, NOTE or null.
 */
export function parseFactcheck(text) {
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n');
  let sources = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^\s*[*_]{0,2}sources[*_]{0,2}\s*:/i.test(lines[i])) {
      sources = parseSourcesLine(lines[i]);
      lines.splice(i, 1);
      break;
    }
  }
  const paras = paragraphsOf(lines.join('\n'));
  if (!paras.length) return { verdict: null, lead: '', claims: [], sources };
  const head = leadingWord(paras[0], VERDICTS);
  const { lead, rest } = splitBottomLine(paras[0], { prefixes: VERDICTS });
  const claims = [...(rest ? [rest] : []), ...paras.slice(1)].map(p => {
    const w = leadingWord(p, [...VERDICTS, NOTE]);
    return w ? { verdict: w.word, text: p.slice(w.length).trim() } : { verdict: null, text: p };
  });
  return { verdict: head ? head.word : null, lead, claims, sources };
}

/**
 * The JSON object in a reply: inside a code fence or after stray text, the first {...}
 * that parses. -> the object, or null.
 */
export function extractJson(text) {
  const source = String(text ?? '');
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(source);
  const candidates = fenced ? [fenced[1], source] : [source];
  for (const candidate of candidates) {
    for (let start = candidate.indexOf('{'); start >= 0; start = candidate.indexOf('{', start + 1)) {
      const end = balancedEnd(candidate, start);
      if (end < 0) continue;
      try {
        const value = JSON.parse(candidate.slice(start, end + 1));
        if (value && typeof value === 'object' && !Array.isArray(value)) return value;
      } catch { /* try the next brace */ }
    }
  }
  return null;
}

function balancedEnd(s, start) {
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return i;
  }
  return -1;
}

const field = (value, max) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/** A cite field kept only when it is exactly one citation token ({p. 12}); else ''. */
function citeField(value) {
  const cite = field(value, 60);
  const parts = parseCitations(cite);
  return parts.length === 1 && parts[0].type === 'cite' ? cite : '';
}

/**
 * Quiz me's questions: up to three valid ones (a question and an answer each), in order.
 * -> { questions: [{ q, answer, why, cite }] } with 1 to 3 questions, or null.
 */
export function parseQuiz(text) {
  const value = extractJson(text);
  const list = value && Array.isArray(value.questions) ? value.questions : null;
  if (!list) return null;
  const questions = list.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const q = field(item.q, 600), answer = field(item.answer, 600);
    return q && answer ? [{ q, answer, why: field(item.why, 600), cite: citeField(item.cite) }] : [];
  }).slice(0, 3);
  return questions.length ? { questions } : null;
}

/** The three marks a quiz answer can get, and how the card shows each as its bottom line. */
export const QUIZ_VERDICTS = ['right', 'nearly', 'not_yet'];
export const QUIZ_VERDICT_LINE = { right: 'Right.', nearly: 'Nearly.', not_yet: 'Not yet.' };

/** quiz_check's mark. -> { verdict: 'right' | 'nearly' | 'not_yet', feedback } or null. */
export function parseQuizCheck(text) {
  const value = extractJson(text);
  if (!value) return null;
  const verdict = typeof value.verdict === 'string' ? value.verdict.trim().toLowerCase().replace(/[\s-]+/g, '_') : '';
  if (!QUIZ_VERDICTS.includes(verdict)) return null;
  return { verdict, feedback: field(value.feedback, 600) };
}

/**
 * define_sense's pick: the 1-based number of the sense that fits, or 0 when none does.
 * `count` is how many senses were sent; a number outside 0..count is null (keep the
 * dictionary order), as is anything unreadable.
 */
export function parseDefineSense(text, count) {
  const value = extractJson(text);
  if (!value) return null;
  const raw = value.sense;
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' && /^\s*\d+\s*$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isInteger(n) || n < 0) return null;
  if (Number.isInteger(count) && n > count) return null;
  return n;
}

// ---- Wording the PDF reader's own Explain request uses (reader.js builds that prompt itself).
// The same text as src/companion/marginPrompts.ts; a test keeps them equal.
/** The words Explain's request says today, to be replaced by PDF_EXPLAIN_FORMAT. */
export const PDF_EXPLAIN_FORMAT_BEFORE = '2 to 4 short paragraphs, no preamble, no headings.';
/** Explain opens with a bottom line. */
export const PDF_EXPLAIN_FORMAT = 'First paragraph: the answer itself, one sentence, at most 25 words. Then a blank line, then at most three short paragraphs: what it says, what it means here, and any notation or terms. No preamble, no headings.';
/** The line every passage action carries when the passage image is attached (the Worker adds it for the new intents). */
export const PASSAGE_IMAGE_LINE = 'The attached image shows the passage exactly as printed. Text extracted from PDFs often garbles equations and symbols, so trust the image over the extracted text.';
