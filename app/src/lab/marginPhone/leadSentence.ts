/**
 * Where an answer's first sentence ends, for its bold lead line (the margin reader's bottom line).
 *
 * A full stop ends a sentence only where it plainly does (Anders, 12 Nov 2026: "That saying (R.C. Sproul's) argues …"
 * bolded only "That saying (R.C."). Not an end: initials (R.C., J. R. R.), common abbreviations (e.g., i.e., cf., Dr.,
 * St., vs., v., vv., ch.), a decimal (3.5), a stop inside a bracket or quotation that is still open, and a stop
 * followed by a lower-case word.
 *
 * Returns the index just past the first sentence (its closing quotes and brackets included), the paragraph's length
 * when the whole paragraph is one sentence, or null when no clean first sentence can be found (a bracket or quotation
 * left open): then nothing is bold.
 */

// Words that end in a stop without ending the sentence (lower case, inner stops kept: "e.g").
const ABBREVIATIONS = new Set([
  'e.g', 'i.e', 'cf', 'viz', 'vs', 'v', 'vv', 'ch', 'chs', 'chap', 'dr', 'mr', 'mrs', 'ms', 'prof', 'st', 'sts', 'jr', 'sr',
  'rev', 'fr', 'gen', 'col', 'lt', 'capt', 'approx', 'ca', 'c', 'al', 'ed', 'eds', 'trans', 'lit', 'esp', 'ff',
  // Bible books as references cite them ("Matt. 5:3", "cf. Isa. 53").
  'ex', 'exod', 'lev', 'num', 'deut', 'josh', 'judg', 'sam', 'kgs', 'chr', 'neh', 'esth', 'ps', 'pss', 'prov', 'eccl',
  'eccles', 'isa', 'jer', 'lam', 'ezek', 'dan', 'hos', 'obad', 'mic', 'nah', 'hab', 'zeph', 'hag', 'zech', 'mal',
  'matt', 'mk', 'lk', 'jn', 'rom', 'cor', 'gal', 'eph', 'phil', 'thess', 'tim', 'tit', 'philem', 'heb', 'jas', 'pet',
  'macc', 'sir', 'wis', 'tob', 'jdt', 'bar', 'esd',
])
// These are abbreviations only before a number ("p. 12", "no. 5"); "The answer is no." ends.
const BEFORE_NUMBER = new Set(['no', 'nos', 'p', 'pp', 'vol', 'vols', 'fig', 'figs', 'art', 'para', 'sec', 'n'])

const OPEN: Record<string, string> = { '(': ')', '[': ']', '{': '}', '“': '”', '‘': '’' }
const CLOSE = new Set([')', ']', '}', '”', '’'])
const TERMINATOR = /[.!?]/
// What may follow a terminator and still belong to the sentence: closing quotes, brackets and Markdown emphasis.
const TRAILING = /["'”’)\]}*_]/

export function leadSentenceEnd(paragraph: string): number | null {
  const p = paragraph
  const stack: string[] = []
  // Track what is open; a closer only closes its own opener (’ is also an apostrophe: Sproul’s).
  const step = (ch: string, before: string) => {
    if (ch === '"') { if (stack[stack.length - 1] === '"') stack.pop(); else stack.push('"'); return }
    if (ch in OPEN && !(ch === '‘' && /\p{L}/u.test(before))) { stack.push(OPEN[ch]); return }
    if (CLOSE.has(ch) && stack[stack.length - 1] === ch) stack.pop()
  }
  for (let i = 0; i < p.length; i++) {
    const ch = p[i]
    if (!TERMINATOR.test(ch)) { step(ch, p[i - 1] ?? ''); continue }
    // A run of marks (an ellipsis, ?!) is judged as one.
    let j = i + 1
    while (j < p.length && TERMINATOR.test(p[j])) j++
    const run = p.slice(i, j)
    // Closing quotes, brackets and Markdown emphasis right after the mark belong to the sentence.
    while (j < p.length && TRAILING.test(p[j])) { step(p[j], p[j - 1]); j++ }
    i = j - 1
    // A stop inside a word (3.5, U.S.A., example.com) is not an end.
    if (j < p.length && !/\s/.test(p[j])) continue
    // Still inside a bracket or quotation: not the end of the sentence.
    if (stack.length) continue
    if (j >= p.length) return p.length
    // A lower-case word after the mark continues the sentence ("approx. ten").
    if (/\p{Ll}/u.test(/\S/.exec(p.slice(j))?.[0] ?? '')) continue
    if (run.length > 1 && run.startsWith('..')) continue
    if (run === '.' && abbreviated(p.slice(0, j), p.slice(j))) continue
    return j
  }
  // No end inside: the paragraph is one sentence, unless something it opened never closed.
  return stack.length ? null : p.length
}

/** Whether the stop ending `head` closes an initial or an abbreviation rather than a sentence. */
function abbreviated(head: string, rest: string): boolean {
  // The word before the stop: letters with any inner stops ("R.C", "e.g", "Dr").
  const word = /([\p{L}.]+)\.$/u.exec(head.replace(/["'”’)\]}*_]+$/, ''))?.[1] ?? ''
  if (!word) return false
  // An initial, or initials run together: "J." (as in "J. R. R."), "R.C.", "U.S.".
  if (/^\p{Lu}$/u.test(word) || /^(?:\p{L}\.)+\p{L}$/u.test(word)) return true
  const lower = word.toLowerCase()
  return ABBREVIATIONS.has(lower) || (BEFORE_NUMBER.has(lower) && /^\s*\d/.test(rest))
}
