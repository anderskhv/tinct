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
// A page in parentheses, as the answers sometimes write it: (p. 2), (pp. 5–6). Digits or roman numerals only.
// And a bare page at the very end of a line or an answer, after a space: "… mistake p. 1." (night smoke run, 15 Oct).
// And a bare equation anywhere, "… in equation (1) eq. 1." (recheck-1, 16 Oct): a tag only when resolve finds it in this PDF.
const PAREN_LABEL = '(?:\\d{1,5}|[ivxlcdm]{1,8})';
const CITATION_RE = new RegExp(`\\{\\s*(pp|p|eq|fig|table|sec)(?:\\.\\s*|\\s+)(${LABEL})(?:\\s*[\\u2013\\u2014-]\\s*(${LABEL}))?\\s*\\}|\\(\\s*(pp|p)\\.\\s*(${PAREN_LABEL})(?:\\s*[\\u2013\\u2014-]\\s*(${PAREN_LABEL}))?\\s*\\)|(?<=\\s)(pp|p)\\.\\s*(${PAREN_LABEL})(?:\\s*[\\u2013\\u2014-]\\s*(${PAREN_LABEL}))?(?=\\.?[ \\t]*(?:\\n|$))|(?<=[\\s(])(eq)\\.\\s?(\\d{1,3}(?:\\.\\d{1,3})?)(?![\\p{L}\\p{N}])`, 'giu');

const LIST_ITEM_RE = new RegExp(`^(?:(pp|p|eq|fig|table|sec)(?:\\.\\s*|\\s+))?(${LABEL}(?:\\s*[\\u2013\\u2014-]\\s*${LABEL})?)$`, 'iu');

/**
 * A list in one pair of braces ({p. 4, p. 5}, {pp. 4, 6}, {fig. 2 and fig. 3}) as one tag per
 * item: "{p. 4}, {p. 5}". An item without its kind takes the one before it. A brace that is not
 * wholly a list of citations stays as written.
 */
function splitCitationLists(source) {
  return source.replace(/\{([^{}\n]{3,120})\}/g, (whole, inner) => {
    const items = inner.split(/\s*(?:,|;|\band\b|&)\s*/i).filter(Boolean);
    if (items.length < 2) return whole;
    let kind = '';
    const out = [];
    for (const item of items) {
      const m = LIST_ITEM_RE.exec(item.trim());
      if (!m || (!m[1] && !kind)) return whole;
      kind = m[1] ? m[1].toLowerCase() : kind;
      out.push(`{${kind === 'pp' && !/[\u2013\u2014-]/.test(m[2]) ? 'p' : kind}${kind === 'table' ? ' ' : '. '}${m[2]}}`);
    }
    return out.join(', ');
  });
}

/**
 * Text split into text and citation parts, in order. A `{…}` that is not a citation, or one
 * `resolve(token)` turns down (the page or equation is not in this PDF), stays text exactly
 * as written. A range is only for pages ({pp. 12–13}); {p. 12–13} is read as the same range,
 * and {pp. 12} as one page. A page in parentheses, (p. 2) or (pp. 5–6), is a tag too, and so is a
 * bare page that ends a line or the answer ("… a mistake p. 1."). Two tags
 * with nothing between them never run together ("p. 5p. 6"): they are parted by ", ".
 * -> [{ type: 'text', text } | { type: 'cite', kind, label, to?, raw }]
 */
export function parseCitations(text, resolve) {
  const source = splitCitationLists(String(text ?? ''));
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
    let kind = (m[1] || m[4] || m[7] || m[10]).toLowerCase();
    let to = m[3] || m[6] || m[9];
    if (to && kind !== 'p' && kind !== 'pp') continue; // {eq. 1–2} is not a citation
    let label = m[2] || m[5] || m[8] || m[11];
    if (to) kind = 'pp';
    else if (kind === 'pp') {
      // {pp. 12-13} with a hyphen reads as one label; split it. {pp. 12} is one page.
      const split = /^(.+)-(.+)$/.exec(label);
      if (split) { label = split[1]; to = split[2] } else kind = 'p';
    } else if (kind === 'p') {
      // {p. 12-13} with a plain hyphen is a page range too; a printed label such as "A-3" stays one page.
      const split = /^(\d+)-(\d+)$/.exec(label) || /^([ivxlcdm]+)-([ivxlcdm]+)$/i.exec(label);
      if (split) { kind = 'pp'; label = split[1]; to = split[2]; }
    }
    const token = { type: 'cite', kind, label, ...(to ? { to } : {}), raw: m[0] };
    // A bare "eq. 1" is a tag only when this PDF has that equation (resolve); otherwise it stays text.
    if (m[10] && (typeof resolve !== 'function' || !resolve(token))) continue;
    if (typeof resolve === 'function' && !resolve(token)) continue;
    const gap = source.slice(last, m.index);
    pushText(out.length && out[out.length - 1].type === 'cite' && !gap.trim() ? ', ' : gap);
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

/**
 * An answer without a sentence about the passage picture ("The image confirms this passage reads as
 * printed.", full battery on train 3): a sentence led by the image or picture that confirms, matches
 * or reads it as printed. Not for a figure's card, whose picture is the subject.
 */
export function withoutPictureTalk(text) {
  return String(text ?? '').replace(/(^|[.!?]["\u201d)]?[ \t]+|\n)(?:the |this )?(?:attached |passage )?(?:image|picture)\b[^.!?\n]*\b(?:confirm\w*|match\w*|as printed|reads? the same)\b[^.!?\n]*[.!?][ \t]*/gi, (_m, lead) => lead.replace(/[ \t]+$/, ' ')).replace(/ +\n/g, '\n').trim();
}

/**
 * Explain without its template lines (recheck-1, 16 Oct): a sentence saying the passage has no notation
 * ("No notation appears in this sentence…", "There is no notation in this passage.") or talking about where
 * the selection stops ("The passage is cut off mid-sentence here, so…"). Paragraphs kept; a paragraph left
 * empty goes.
 */
const NO_NOTATION_RE = /\bnotation\b/i;
const NEGATION_RE = /\b(?:no|not|none|nothing|without|isn['’]t|doesn['’]t)\b/i;
const CUT_OFF_RE = /\b(?:passage|selection|sentence|excerpt|quotation|quote|extract)\b[^.!?\n]*\b(?:cut off|cuts off|breaks off|trails off|truncated|mid-?sentence|stops (?:before|mid)|ends (?:before|mid|abruptly))/i;
export function withoutTemplateTalk(text) {
  return String(text ?? '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n+/).map(p => p.split('\n').map(line => sentencesOf(line).filter(sentence => {
    if (NO_NOTATION_RE.test(sentence) && NEGATION_RE.test(sentence)) return false;
    return !CUT_OFF_RE.test(sentence);
  }).join(' ')).filter(line => line.trim()).join('\n')).filter(p => p.trim()).join('\n\n');
}

/* ---------- Simplify: never the passage again, never a note about the rewrite ---------- */

/** A closing paragraph that talks about the rewrite rather than being it ("The rewrite is a restatement of…"). */
const SIMPLIFY_META_RE = /^(?:note[:.]?\s+)?(?:(?:the|this|my)\s+(?:rewrite|rewritten (?:version|passage|text)|simplified (?:version|passage|text)|simplification|plain(?:er)? version|restatement|paraphrase)\b|i(?:'ve| have)?\s+(?:kept|rewritten|simplified|restated|stayed)\b)/i;
/** The words of a text, for comparing: lower case, no citation tags, no punctuation. */
function wordsOf(text) {
  return String(text ?? '').replace(/\{[^{}\n]{1,40}\}/g, ' ').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu, ' ').split(/\s+/).filter(Boolean);
}
/** How alike two texts are, word by word: 1 minus their word edit distance over the longer length (0 to 1). */
export function wordSimilarity(a, b) {
  const x = wordsOf(a), y = wordsOf(b);
  if (!x.length || !y.length) return x.length === y.length ? 1 : 0;
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const row = [i];
    for (let j = 1; j <= y.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    prev = row;
  }
  return 1 - prev[y.length] / Math.max(x.length, y.length);
}
/** A paragraph this alike to the passage is the passage again, not a rewrite. */
export const SIMPLIFY_SAME = 0.85;
/** A selection of this many words or fewer gets one short restatement: the first paragraph only. */
export const SIMPLIFY_SHORT = 6;
/** A paragraph without any sentence that quotes the passage back ("The passage's own words are: \"…\" {p. 5}"). */
function withoutQuotedPassage(block, passage) {
  let out = block;
  for (const m of block.matchAll(/["\u201c]([^"\u201d\n]{12,})["\u201d]/g)) {
    if (wordSimilarity(m[1], passage) < SIMPLIFY_SAME) continue;
    const at = m.index ?? 0;
    const from = Math.max(block.lastIndexOf('. ', at), block.lastIndexOf('? ', at), block.lastIndexOf('! ', at));
    const tail = /^\s*(?:\{[^{}\n]{1,40}\})?\s*[.;]?/.exec(block.slice(at + m[0].length));
    out = out.replace(block.slice(from < 0 ? 0 : from + 2, at + m[0].length + (tail ? tail[0].length : 0)), '');
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}
/** The share of a text's five-word runs found word for word in `source` (0 to 1); a text under 8 words is 0. */
export function copiedShare(text, source) {
  const words = wordsOf(text);
  if (words.length < 8 || !source) return 0;
  const hay = ` ${wordsOf(source).join(' ')} `;
  let found = 0, runs = 0;
  for (let i = 0; i + 5 <= words.length; i++) { runs++; if (hay.includes(` ${words.slice(i, i + 5).join(' ')} `)) found++ }
  return runs ? found / runs : 0;
}
/** A paragraph copied this much from the page is the document pasted back, not a rewrite. */
export const SIMPLIFY_COPIED = 0.8;
/** The sentences of a paragraph, each with its citation tags (sentenceEnd). */
function sentencesOf(p) {
  const out = [];
  let rest = p.trim();
  while (rest) {
    const end = sentenceEnd(rest, 0);
    out.push(rest.slice(0, end).trim());
    rest = rest.slice(end).trim();
  }
  return out;
}
/** A sentence this alike to an earlier one is the same sentence again. */
const SIMPLIFY_REPEAT = 0.9;
/** The passage's paragraphs (blank lines apart; a PDF selection's line breaks are not paragraphs), at least 1. */
const paragraphCount = (passage) => Math.max(1, String(passage ?? '').split(/\n[ \t]*\n+/).filter(p => p.trim()).length);
/** The passage, word for word, inside a longer paragraph ("Experiments on two machine translation tasks are run…"). */
function containsPassage(block, passage) {
  const words = wordsOf(passage);
  return words.length >= 4 && ` ${wordsOf(block).join(' ')} `.includes(` ${words.join(' ')} `);
}
/**
 * A Simplify answer as the card shows it (one plain rewrite, PROMPTS.md since round 3, 16 Oct): a paragraph
 * that is the passage again (wordSimilarity at least SIMPLIFY_SAME, or the passage word for word inside it)
 * is dropped while a real rewrite remains, a sentence that quotes the passage back is dropped, a closing
 * note about the rewrite is dropped, a sentence or line said earlier in the answer (the first line said
 * again, then expanded) is dropped wherever it comes, and the rewrite has no more paragraphs than the
 * passage (a second rendering is never shown). A selection of at most SIMPLIFY_SHORT words keeps only
 * its first paragraph. -> { text, unchanged }: `unchanged` when nothing but the passage came back
 * (`text` ''). Given `source` (the page's text and the next page's), a paragraph copied from it word for
 * word (copiedShare at least SIMPLIFY_COPIED) is dropped too.
 */
export function simplifyAnswer(text, passage, source) {
  let blocks = String(text ?? '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n+/).map(b => withoutQuotedPassage(b.trim(), passage)).filter(Boolean);
  if (blocks.length > 1 && SIMPLIFY_META_RE.test(blocks[blocks.length - 1])) blocks = blocks.slice(0, -1);
  // A line or paragraph never shows twice (Metamorphosis printed one line twice).
  blocks = blocks.map(b => b.split('\n').filter((line, i, all) => !line.trim() || all.findIndex(x => x.trim() === line.trim()) === i).join('\n'));
  blocks = blocks.filter((b, i) => !blocks.slice(0, i).some(a => wordSimilarity(a, b) >= 0.95));
  // A sentence never shows twice, anywhere in the answer (recheck-1: the first line again, then expanded).
  const said = [];
  blocks = blocks.map(b => b.split('\n').map(line => sentencesOf(line).filter(sentence => {
    if (wordsOf(sentence).length && said.some(earlier => wordSimilarity(earlier, sentence) >= SIMPLIFY_REPEAT)) return false;
    said.push(sentence);
    return true;
  }).join(' ')).filter(line => line.trim()).join('\n')).filter(Boolean);
  const same = (b) => wordSimilarity(b, passage) >= SIMPLIFY_SAME || containsPassage(b, passage) || copiedShare(b, source) >= SIMPLIFY_COPIED;
  const kept = blocks.filter(b => !same(b));
  if (blocks.length && !kept.length) return { text: '', unchanged: true };
  const most = wordsOf(passage).length <= SIMPLIFY_SHORT ? 1 : paragraphCount(passage);
  return { text: kept.slice(0, most).join('\n\n'), unchanged: false };
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
 * A Fact-check answer: the opening (what the passage claims and what the document offers, written
 * from the document while the source search runs), then the overall verdict and its sentence (the
 * bottom line), one entry per paragraph after it with its verdict word (or Note., or none), and the
 * sources. An answer that opens on its verdict (written before 15 Oct 2026) has no opening; one with
 * no verdict paragraph at all reads as before, its first sentence the bottom line.
 * -> { opening: [paragraph], verdict, lead, claims: [{ verdict, text }], sources: [{ title, url }] }
 * `verdict` is one of VERDICTS or null; a claim's is one of VERDICTS, NOTE or null.
 */
const VERDICT_START_RE = /^[*_]{0,2}(?:holds|partly holds|outdated|disputed|can['’]t check)\b/i;
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
  const all = paragraphsOf(lines.join('\n'));
  if (!all.length) return { opening: [], verdict: null, lead: '', claims: [], sources };
  // A first paragraph that opens on a verdict word, even as "Partly holds:" (answers before 15 Oct), has no opening before it.
  const at = VERDICT_START_RE.test(all[0]) ? 0 : all.findIndex(p => leadingWord(p, VERDICTS));
  const opening = at > 0 ? all.slice(0, at) : [];
  const paras = at > 0 ? all.slice(at) : all;
  const head = leadingWord(paras[0], VERDICTS);
  const { lead, rest } = splitBottomLine(paras[0], { prefixes: VERDICTS });
  const claims = [...(rest ? [rest] : []), ...paras.slice(1)].map(p => {
    const w = leadingWord(p, [...VERDICTS, NOTE]);
    return w ? { verdict: w.word, text: p.slice(w.length).trim() } : { verdict: null, text: p };
  });
  return { opening, verdict: head ? head.word : null, lead, claims, sources };
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

/**
 * Quiz me while its reply streams (FIXES-2026-10-15 A7): the questions that are already
 * complete, in order, up to three. Reads the `"questions": [` array of PROMPTS.md's JSON
 * object by object, so question 1 shows as soon as its closing brace arrives; an object
 * still being written, and anything after the array, wait. Each complete object is kept or
 * dropped as parseQuiz would. -> [{ q, answer, why, cite }], possibly empty.
 */
export function parseQuizPartial(text) {
  const s = String(text ?? '');
  const key = /"questions"\s*:\s*\[/.exec(s);
  if (!key) return [];
  const out = [];
  let i = key.index + key[0].length;
  while (out.length < 3) {
    while (i < s.length && /[\s,]/.test(s[i])) i++;
    if (s[i] !== '{') break;
    const end = balancedEnd(s, i);
    if (end < 0) break;
    let item;
    try { item = JSON.parse(s.slice(i, end + 1)) } catch { break }
    i = end + 1;
    if (!item || typeof item !== 'object') continue;
    const q = field(item.q, 600), answer = field(item.answer, 600);
    if (q && answer) out.push({ q, answer, why: field(item.why, 600), cite: citeField(item.cite) });
  }
  return out;
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

/**
 * Related (PROMPTS.md): the bottom line naming the thread, then one row per place: a citation
 * ({p. 5}, {sec. 3.2}) or, for a book without page numbers, a few quoted words, then what happens
 * there. A line without either is a row with no tag. Bullets and numbering the prompt forbids are
 * dropped, and so is talk about what is or is not listed (round 1, 15 Oct: a row read "is the selected
 * passage itself, so it is not listed here"): such a row, or such a sentence of the bottom line. -> { lead, rows: [{ cite: token | null, quote: string | null, text }] } (at most 8 rows)
 */
export function parseRelated(text) {
  const paras = paragraphsOf(text);
  if (!paras.length) return { lead: '', rows: [] };
  const clean = block => block.split('\n').map(l => l.replace(/^\s*(?:[-•*·]|\d{1,2}[.)])\s+/, '').trim()).filter(Boolean);
  const lines = paras.flatMap(clean);
  const startsRow = line => leadingCite(line) || leadingQuote(line);
  const first = clean(paras[0]);
  let lead = '', from = 0;
  if (!startsRow(first[0])) {
    const at = first.findIndex(l => startsRow(l));
    const head = at < 0 ? first : first.slice(0, at);
    lead = withoutListingTalk(head.join(' '));
    from = head.length;
  }
  const rows = [];
  for (const line of lines.slice(from)) {
    if (LISTING_TALK.test(line)) continue;
    const cite = leadingCite(line), quote = cite ? null : leadingQuote(line);
    const rest = cite ? cite.rest : quote ? quote.rest : line;
    const body = rest.replace(/^\s*[:–—-]\s*/, '').trim();
    if (!body && !cite && !quote) continue;
    rows.push({ cite: cite ? cite.token : null, quote: quote ? quote.quote : null, text: body });
    if (rows.length >= 8) break;
  }
  return { lead, rows };
}
/** A Related answer narrating its own list ("not listed here", "the selected passage itself"). */
const LISTING_TALK = /\b(?:not|never|isn['’]t|aren['’]t)\s+(?:been\s+)?(?:listed|included)\b|\bthe selected passage itself\b/i;
const withoutListingTalk = text => !LISTING_TALK.test(text) ? text : (text.match(/[^.!?]+[.!?]*\s*/g) || []).filter(sentence => !LISTING_TALK.test(sentence)).join('').trim();

function leadingCite(line) {
  const m = /^\{[^{}\n]{1,40}\}/.exec(line);
  if (!m) return null;
  const parts = parseCitations(m[0]);
  return parts.length === 1 && parts[0].type === 'cite' ? { token: parts[0], rest: line.slice(m[0].length) } : null;
}
function leadingQuote(line) {
  const m = /^(?:“([^”\n]{2,160})”|"([^"\n]{2,160})")/.exec(line);
  return m ? { quote: (m[1] || m[2]).replace(/^[\s.…]+|[\s.…,;:]+$/g, '').trim(), rest: line.slice(m[0].length) } : null;
}

// ---- Wording the PDF reader's own Explain request uses (reader.js builds that prompt itself).
// The same text as src/companion/marginPrompts.ts; a test keeps them equal.
/** The words Explain's request says today, to be replaced by PDF_EXPLAIN_FORMAT. */
export const PDF_EXPLAIN_FORMAT_BEFORE = '2 to 4 short paragraphs, no preamble, no headings.';
/** Explain opens with a bottom line. */
export const PDF_EXPLAIN_FORMAT = 'First paragraph: the answer itself, one sentence, at most 25 words. Then a blank line, then at most three short paragraphs on what it says and what it means here, explaining a hard term or symbol in the sentence where it is used. About 120 words or fewer in all. No preamble, no headings.';
/** The line every passage action carries when the passage image is attached (the Worker adds it for the new intents). */
export const PASSAGE_IMAGE_LINE = 'The attached image shows the passage exactly as printed. Where its equations or symbols differ from the document\'s text, trust the image.';
