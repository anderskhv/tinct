// Chapter titles in Tinct's house style, whatever the imported text does
// (Anders, 2026-10-07: "chapter titles are never ALL CAPS and never roman
// numerals, no matter how they are formatted in what we import").
//
// House style (the built-in editions in public/data/editions): "Chapter 1",
// "Book 1", "Act 1, Scene 2", "Part 1, Chapter 3", and " — " between the
// number and the chapter's name ("Chapter 1 — Loomings").
//
//   "CHAPTER I—M. MYRIEL"      -> "Chapter 1 — M. Myriel"
//   "BOOK FIRST.—A JUST MAN"   -> "Book 1 — A Just Man"
//   "ACT III. SCENE II."       -> "Act 3, Scene 2"
//   "I. THE OLD MAN"           -> "1 — The Old Man"
//   "Henry V", "Louis XIV's court", "1 Kings 3", "Psalms 19"  unchanged
//
// Shared, like public-books.js, by the Worker's import (routes/publicBooks.ts),
// the reader's display (src/lab/labSource.ts), the EPUB converter
// (src/lab/userBook/epubEdition.ts) and Add a book's PDF contents. No browser
// APIs. Casing rules are English; other languages get gentle casing (only an
// ALL CAPS title changes, to sentence case).

const LABELS = {
  chapter: 'Chapter', chap: 'Chapter', book: 'Book', part: 'Part', volume: 'Volume', vol: 'Volume',
  act: 'Act', scene: 'Scene', canto: 'Canto', letter: 'Letter', section: 'Section', fitt: 'Fitt',
  tablet: 'Tablet', stave: 'Stave', episode: 'Episode',
}
// Common labels in the other languages Add a book offers (numbers only; the words stay as written).
const FOREIGN_LABELS = [
  'chapitre', 'livre', 'partie', 'tome', 'kapitel', 'buch', 'teil', 'band', 'capítulo', 'capitulo', 'capitolo',
  'libro', 'parte', 'hoofdstuk', 'boek', 'deel', 'kapittel', 'bok', 'luku', 'rozdział', 'akt', 'scène', 'szene', 'escena', 'atto',
]

const UNITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const ORDINAL_UNITS = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
  'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth']
const ORDINAL_TENS = ['', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 'seventieth', 'eightieth', 'ninetieth']

/** "one" … "ninety-nine", "first" … "ninety-ninth" (and "twenty first"), as a number. */
function wordNumber(word) {
  const w = word.toLowerCase().replace(/\s+/g, '-')
  for (let i = 1; i < 20; i++) if (w === UNITS[i] || w === ORDINAL_UNITS[i]) return i
  for (let t = 2; t < 10; t++) {
    if (w === TENS[t] || w === ORDINAL_TENS[t]) return t * 10
    for (let u = 1; u < 10; u++) if (w === `${TENS[t]}-${UNITS[u]}` || w === `${TENS[t]}-${ORDINAL_UNITS[u]}`) return t * 10 + u
  }
  return null
}
const NUMBER_WORD = (() => {
  const unit = [...UNITS.slice(1), ...ORDINAL_UNITS.slice(1)].join('|')
  const tens = [...TENS.slice(2), ...ORDINAL_TENS.slice(2)].join('|')
  return `(?:(?:${TENS.slice(2).join('|')})[-\\s](?:${UNITS.slice(1, 10).join('|')}|${ORDINAL_UNITS.slice(1, 10).join('|')})|${tens}|${unit})`
})()

const ROMAN = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/
/** The value of a valid Roman numeral (either case, not mixed), else null. */
export function romanValue(text) {
  if (!text || (text !== text.toUpperCase() && text !== text.toLowerCase())) return null
  const upper = text.toUpperCase()
  if (!ROMAN.test(upper)) return null
  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  let total = 0
  for (let i = 0; i < upper.length; i++) {
    const value = values[upper[i]]
    const next = values[upper[i + 1]] || 0
    total += value < next ? -value : value
  }
  return total > 0 ? total : null
}
/** A small Roman numeral (no M or D): "XIV", never "MIX", "DID" or "MILD". */
const smallRoman = text => /^[IVXLC]+$/.test(text) && romanValue(text) !== null

const SEP = ' '.trim() + ' — '
const SMALL_WORDS = new Set(['a', 'an', 'the', 'of', 'in', 'on', 'and', 'for', 'to', 'by', 'at', 'as', 'but', 'or', 'nor'])
const CONTRACTIONS = new Set(['s', 't', 'd', 'm', 'll', 've', 're'])
const ABBREVIATIONS = new Set(['mr', 'mrs', 'ms', 'dr', 'st', 'mt', 'mme', 'mlle', 'messrs', 'rev', 'jr', 'sr', 'lt', 'capt', 'col', 'gen', 'no', 'vol', 'chap', 'co', 'esq', 'prof', 'hon'])

const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function labelPattern(english) {
  const words = [...Object.keys(LABELS), ...(english ? [] : FOREIGN_LABELS)]
  return words.sort((a, b) => b.length - a.length).map(escape).join('|')
}

/** Normalise a language tag to its two- or three-letter code ("en-US" -> "en"); empty means English. */
const languageOf = language => (String(language || 'en').toLowerCase().split(/[-_]/)[0] || 'en')

/**
 * One label-and-number at `text`'s start ("CHAPTER XLII", "Book the First", "PART 2").
 * Returns the house-style words and how much of `text` they used, else null.
 */
function readLabel(text, english) {
  const re = new RegExp(`^(${labelPattern(english)})\\.?\\s+(?:(the)\\s+)?(\\d{1,4}|[IVXLCDM]+|[ivxlcdm]+|${NUMBER_WORD})(?=$|[\\s.,:;!?)\\]—–-])`, 'iu')
  const match = text.match(re)
  if (!match) return null
  const [whole, labelWord, the, numberText] = match
  let value = /^\d+$/.test(numberText) ? Number(numberText) : romanValue(numberText)
  if (value === null) value = english ? wordNumber(numberText) : null
  if (value === null) return null
  // "the first" reads as an ordinal only with an ordinal or cardinal word, never "Book the I".
  if (the && !english) return null
  if (the && (romanValue(numberText) !== null || /^\d/.test(numberText))) return null
  const after = text.slice(whole.length)
  // The pronoun: "Letter I Never Sent" keeps its I. A numeral I ends the title,
  // or is followed by punctuation or another label ("PART I CHAPTER 3").
  if ((numberText === 'I' || numberText === 'i') && !/^($|\s*[.,:;!?)\]—–-])/u.test(after)
    && !new RegExp(`^\\s+(${labelPattern(english)})\\b`, 'iu').test(after)) return null
  const lower = labelWord.toLowerCase()
  const label = LABELS[lower] ?? (labelWord === labelWord.toUpperCase() ? labelWord[0] + labelWord.slice(1).toLowerCase() : labelWord)
  return { text: `${label} ${value}`, length: whole.length }
}

/** Every label-and-number in `text` (a title's tail: "Miss Brooke — Chapter II") in house style. */
function convertLabels(text, english) {
  const re = new RegExp(`(^|[\\s(\\[—–:,;-])((?:${labelPattern(english)})\\.?\\s+\\S.*)`, 'iu')
  let out = ''
  let rest = text
  for (let guard = 0; guard < 20; guard++) {
    const match = rest.match(re)
    if (!match) break
    const at = match.index + match[1].length
    const read = readLabel(rest.slice(at), english)
    if (!read) { out += rest.slice(0, at + 1); rest = rest.slice(at + 1); continue }
    out += rest.slice(0, at) + read.text
    rest = rest.slice(at + read.length)
  }
  return out + rest
}

/** Leading numbering: label-and-number pairs ("ACT III. SCENE II."), or a bare numeral ("I. THE OLD MAN"). */
function readHead(text, english) {
  const labels = []
  let rest = text
  for (;;) {
    const read = readLabel(rest, english)
    if (!read) break
    labels.push(read.text)
    rest = rest.slice(read.length)
    const joiner = rest.match(/^\s*[.,:;]?\s*(?=\S)/)
    if (!joiner) break
    const next = readLabel(rest.slice(joiner[0].length), english)
    if (!next) break
    rest = rest.slice(joiner[0].length)
  }
  if (labels.length) return { head: labels.join(', '), rest }
  // A bare Roman numeral before the name: "I. THE OLD MAN", "XLII.", or alone.
  // Never "I Saw" or initials ("C. S. LEWIS"); Arabic numbering ("4. maj 1771", "1 Kings 3") is left as written.
  const bare = text.match(/^([IVXLC]+)(\s*(?:[.:)]|[—–]|\s-)\s*)?(.*)$/u)
  if (bare && smallRoman(bare[1])) {
    const name = bare[3].trim()
    if (!name) return { head: String(romanValue(bare[1])), rest: '' }
    if (bare[2] && !/^\p{L}\.(\s|$)/u.test(name)) return { head: String(romanValue(bare[1])), rest: name }
  }
  return { head: '', rest: text }
}

// ===== Casing =====

const hasLower = text => /\p{Ll}/u.test(text)
const letterCount = text => (text.match(/\p{L}/gu) || []).length

/** Upper-case the first letter of `word` (after any opening quote or bracket). */
function capitalise(word) {
  const at = word.search(/\p{L}/u)
  return at < 0 ? word : word.slice(0, at) + word[at].toUpperCase() + word.slice(at + 1)
}

/** One ALL CAPS word in title case: "MYRIEL" -> "Myriel", "M." stays, "XIV" stays, "CLEOPATRA’S" -> "Cleopatra’s". */
function titleWord(word, first, english) {
  const core = word.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '')
  if (!core) return word
  // An initial ("M.", "J.") and the pronoun I.
  if (/^\p{L}$/u.test(core) && (core !== 'A' || !english)) return core === 'A' && !first ? word.toLowerCase() : word
  // Numerals that are not chapter labels: "HENRY V", "LOUIS XIV".
  const base = core.split(/['’]/)[0]
  if (smallRoman(base) && base.length >= 2) {
    return word.replace(/(['’])(\p{L}+)/gu, (_, mark, tail) => mark + tail.toLowerCase())
  }
  const lower = word.toLowerCase()
  if (english && !first && SMALL_WORDS.has(core.toLowerCase())) return lower
  // Each part of a hyphenated word: "RABBIT-HOLE" -> "Rabbit-Hole".
  return lower.split('-').map(part => {
    const cased = capitalise(part)
    // "O'BRIEN" -> "O'Brien", "D'ARTAGNAN" -> "D'Artagnan", but "DON'T", "I'LL" stay contractions.
    return cased.replace(/^([^\p{L}]*\p{L})(['’])(\p{L})(\p{L}*)/u, (all, lead, mark, letter, tail) =>
      CONTRACTIONS.has((letter + tail).toLowerCase()) ? all : lead + mark + letter.toUpperCase() + tail)
  }).join('-')
}

/** A word that ends a sentence ("NOVATUS.", "WHY?"), never an initial or an abbreviation ("L.", "MR."). */
function endsSentence(token) {
  if (!/[.!?]["”’)]?$/u.test(token)) return false
  const core = token.replace(/[^\p{L}]/gu, '').toLowerCase()
  return !(/[.]["”’)]?$/u.test(token) && (core.length === 1 || ABBREVIATIONS.has(core)))
}

/** An ALL CAPS stretch of title in title case (English) or sentence case (other languages). */
function caseSegment(segment, english) {
  let first = true
  let afterInitial = false
  let afterSentence = false
  return segment.split(/(\s+)/).map(token => {
    if (!token || /^\s+$/.test(token)) return token
    let out
    // A new sentence and a quoted title start with a capital: "NOVATUS. OF ANGER" -> "Novatus. Of Anger",
    // 'OR, “OF PROVIDENCE”' -> 'or, “Of Providence”'.
    if (english && (afterSentence || /^[“"‘(]/u.test(token))) first = true
    afterSentence = endsSentence(token)
    if (english) out = titleWord(token, first, true)
    else {
      const core = token.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '')
      // Initials and numerals stay; so does the name after an initial or title ("M. MYRIEL" -> "M. Myriel").
      out = /^\p{L}$/u.test(core) || (smallRoman(core) && core.length >= 2) ? token
        : first || afterInitial ? capitalise(token.toLowerCase()) : token.toLowerCase()
    }
    afterInitial = /^[^\p{L}]*(\p{L}|\p{L}{1,4})\.$/u.test(token) && (/^[^\p{L}]*\p{L}\.$/u.test(token) || ABBREVIATIONS.has(token.replace(/[^\p{L}]/gu, '').toLowerCase()) || /^(mme|mlle|mgr|sr|sra|hr|fr)$/i.test(token.replace(/[^\p{L}]/gu, '')))
    if (/\p{L}|\d/u.test(token)) first = false
    return out
  }).join('')
}

/** A trailing full stop that ends a heading ("OF MIRACLES."), never one that ends "Mr." or "M.". */
function dropFullStop(text) {
  const match = text.match(/(\S+)\.$/)
  if (!match || /\.\.$/.test(text)) return text
  const word = match[1].replace(/^[^\p{L}\d]+/u, '').toLowerCase()
  if (/^\p{L}$/u.test(word) || ABBREVIATIONS.has(word)) return text
  return text.slice(0, -1)
}

/**
 * A chapter title in Tinct's house style. `options.language` is the edition's
 * language ("en" when absent): English titles get title case and number words;
 * other languages keep their words and get only gentle casing.
 */
export function normalizeChapterTitle(title, options = {}) {
  if (typeof title !== 'string') return title
  const english = languageOf(options.language) === 'en'
  const written = title.replace(/\s+/g, ' ').trim()
  if (!written) return title
  // A title and a numbered part of it, joined by the EPUB converter ("BOOK ONE: 1805, CHAPTER II",
  // "I. A SCANDAL IN BOHEMIA, PART II"): each in house style -> "Book 1: 1805, Chapter 2".
  const joined = written.match(new RegExp(`^(.*[^\\s,]),\\s+((?:${labelPattern(english)})\\.?\\s+(?:\\d{1,4}|[IVXLC]+|[ivxlc]+))\\.?$`, 'iu'))
  if (joined && /\p{L}/u.test(joined[1])) {
    const label = readLabel(joined[2], english)
    if (label && label.length === joined[2].length) return `${normalizeChapterTitle(joined[1], options)}, ${label.text}`
  }
  // A heading's trailing comma or semicolon belongs to the printed line, not the title ("TO THE FIRST BOOK,").
  const original = (withoutPrintMarks(written) || written).replace(/\s*[,;]+$/, '') || written
  const shouting = !hasLower(original)
  // A title already in mixed case keeps its own words and punctuation: only number labels
  // change ("Book I: Miss Brooke — Chapter II" -> "Book 1: Miss Brooke — Chapter 2",
  // "II. He Gets Rid…" -> "2. He Gets Rid…"), and an ALL CAPS stretch inside it is cased.
  if (!shouting) return firstCapital(keepPunctuation(original, english), english)
  const { head, rest } = readHead(original, english)
  let tail = convertLabels(rest, english)
  if (head) {
    // The one separator: " — " before the chapter's name; "Book 1 (1805)" keeps its bracket.
    tail = tail.replace(/^\s*[.,:;]?\s*(?:[—–]+|--|-(?=\s))?\s*/u, '').trim()
    tail = !tail ? '' : /^[([]/.test(tail) ? ' ' + tail : ' — ' + tail
  }
  let out = head + tail
  // ALL CAPS stretches between separators become title case. Labels are already cased.
  const parts = out.split(/(\s*[—–:]\s*|\s+-\s+)/u)
  out = parts.map((part, index) => {
    if (index % 2 === 1 || !part.trim()) return part
    const caps = !hasLower(part) && letterCount(part) >= 2 && (shouting || letterCount(part) >= 4)
    const cased = caps ? caseSegment(part, english) : part
    // A heading's own full stop goes with its capitals ("OF MIRACLES." -> "Of Miracles").
    return caps ? dropFullStop(cased) : cased
  }).join('')
  return firstCapital(out.trim(), english) || original
}

/**
 * The printed page's marks, which are not part of a title: a footnote call set against
 * a word ("PAULINUS.[1] OF THE SHORTNESS OF LIFE") and a page number run into the
 * heading ("5CONTENTS.", "359INTRODUCTION TO THE FIRST BOOK,").
 */
function withoutPrintMarks(text) {
  return text.replace(/(?<=[\p{L}\p{N}.,;:!?”’"')])\[\d{1,3}\]/gu, '').replace(/^\d{1,4}(?=\p{Lu}\p{L})/u, '').replace(/\s+/g, ' ').trim()
}

/** An English title starts with a capital ("of Providence" -> "Of Providence"); a name like "iPhone" or "eBook" stays. */
function firstCapital(text, english) {
  if (!english) return text
  return text.replace(/^([^\p{L}\d]*)(\p{Ll})(\p{Ll}*)(?=$|[^\p{L}])/u, (all, lead, letter, rest) => lead + letter.toUpperCase() + rest)
}

/** Numbers and capitals only, for a title in mixed case; separators and full stops stay as written. */
function keepPunctuation(original, english) {
  let out = convertLabels(original, english)
  // A bare Roman numeral before the name keeps its own mark: "II. Elders" -> "2. Elders".
  const bare = out.match(/^([IVXLC]+)(\s*(?:[.:)]|[—–]|\s-))(\s*)(\S.*)$/u)
  if (bare && smallRoman(bare[1]) && !/^\p{L}\.(\s|$)/u.test(bare[4])) out = String(romanValue(bare[1])) + bare[2] + bare[3] + bare[4]
  const parts = out.split(/(\s*[—–:]\s*|\s+-\s+)/u)
  return parts.map((part, index) => {
    if (index % 2 === 1 || !part.trim()) return part
    return !hasLower(part) && letterCount(part) >= 4 ? caseSegment(part, english) : capsRuns(part, english)
  }).join('')
}

/**
 * ALL CAPS runs of two words or more inside a mixed-case stretch, cased:
 * "THE THIRD BOOK … TO NOVATUS. OF ANGER. Book 1." -> "The Third Book … to Novatus. Of Anger. Book 1.".
 * A single capitalised word stays (an acronym, a name set in capitals for emphasis).
 */
function capsRuns(part, english) {
  // Most titles have no two capitalised words in a row: nothing to do.
  if (!/(?:^|\s)[^\s\p{Ll}]*\p{Lu}[^\s\p{Ll}]*\s+(?:[^\s\p{L}]+\s+)*[^\s\p{Ll}]*\p{Lu}[^\s\p{Ll}]*(?=\s|$)/u.test(part)) return part
  const tokens = part.split(/(\s+)/)
  const caps = token => /\p{L}/u.test(token) && !hasLower(token)
  const out = []
  for (let i = 0; i < tokens.length;) {
    if (!caps(tokens[i])) { out.push(tokens[i]); i++; continue }
    let j = i
    let last = i
    let count = 0
    // A run: capitalised words, the spaces between them, and marks without letters ("—", "&").
    while (j < tokens.length && (caps(tokens[j]) || /^\s+$/.test(tokens[j]) || (tokens[j] && !/\p{L}/u.test(tokens[j])))) {
      if (caps(tokens[j])) { count++; last = j }
      j++
    }
    const run = tokens.slice(i, last + 1).join('')
    // Numerals and initials alone are not a run to case ("Henry VIII", "C. S.").
    const words = run.split(/\s+/).filter(word => /\p{L}/u.test(word) && !smallRoman(word.replace(/[^\p{L}]/gu, '')) && !/^\p{L}\.?$/u.test(word.replace(/^[^\p{L}]+/u, '')))
    out.push(count >= 2 && words.length >= 2 && letterCount(run) >= 6 ? caseSegment(run, english) : run)
    i = last + 1
  }
  return out.join('')
}

// ===== A book's titles together =====
//
// Some books print the same long heading over every part, and only its end tells them
// apart (Seneca's Minor Dialogues, tr. Aubrey Stewart):
//   "THE FIRST BOOK OF THE DIALOGUES OF L. ANNAEUS SENECA, ADDRESSED TO LUCILIUS.
//    “WHY, WHEN A PROVIDENCE EXISTS, ANY MISFORTUNES BEFALL GOOD MEN;” OR, “OF PROVIDENCE”"
//   "THE THIRD BOOK OF THE DIALOGUES OF L. ANNAEUS SENECA, ADDRESSED TO NOVATUS. OF ANGER. Book I."
// The Contents shows what tells them apart: "Of Providence", "Of Anger, Book 1",
// "Of Consolation, to Marcia". Only English titles, and only a heading's first sentence
// that most of the book's titles share (numbers and the addressee aside) is left out.

/** "“Why, When … Good Men;” or, “Of Providence”" -> "Of Providence"; "…,” or, an Essay on the Firmness …" -> "On the Firmness …". */
function shortAlternative(text) {
  const match = text.match(/^[“"‘][^”"’]{3,}[”"’][,;]?\s+or,?\s+(.+)$/iu)
  if (!match) return null
  const short = match[1].replace(/^[“"‘]+|[”"’]+$/gu, '').replace(/[.,;]+$/, '').trim()
    .replace(/^an?\s+(?:essay|treatise|discourse|dialogue|inquiry|enquiry)\s+(?=(?:on|of|upon|concerning)\b)/iu, '')
  return /\p{L}/u.test(short) ? short : null
}

/** A number written as digits, a Roman numeral or a word ("First", "IV", "3"), else null. */
function numberOf(word) {
  const core = word.replace(/[^\p{L}\p{N}-]/gu, '')
  if (!core) return null
  if (/^\d{1,4}$/.test(core)) return Number(core)
  return romanValue(core) ?? wordNumber(core)
}

/** A title's first sentence and what follows it: "The First Book of …, Addressed to Lucilius." + the rest. */
function firstSentence(title) {
  const tokens = title.split(/(\s+)/)
  for (let i = 0; i < tokens.length - 2; i++) {
    if (/^\s+$/.test(tokens[i]) || !endsSentence(tokens[i])) continue
    const rest = tokens.slice(i + 1).join('').trim()
    if (rest && /\p{L}/u.test(rest)) return { head: tokens.slice(0, i + 1).join('').trim(), rest }
  }
  return null
}

const ADDRESSED = /\b(?:addressed|dedicated|inscribed)\s+to\s+(.+?)[.,;:]*$/iu

/** What a heading's first sentence says beside its boilerplate: its number, label ("Book") and addressee. */
function readBoilerplate(head) {
  const words = head.split(/\s+/)
  let number = null
  let label = null
  for (let i = 0; i < words.length; i++) {
    const value = numberOf(words[i])
    // The pronoun I and the article A are not numbers here.
    if (value === null || /^(?:i|a)$/i.test(words[i].replace(/[^\p{L}]/gu, ''))) continue
    number = value
    const next = (words[i + 1] || '').replace(/[^\p{L}]/gu, '').toLowerCase()
    const before = (words[i - 1] || '').replace(/[^\p{L}]/gu, '').toLowerCase()
    label = LABELS[next] || LABELS[before] || null
    break
  }
  const to = head.match(ADDRESSED)?.[1] || ''
  // "His Mother, Helvia" -> "Helvia".
  const addressee = to.split(/,\s*/).pop()?.trim() || ''
  const key = head.toLowerCase().replace(ADDRESSED, ' addressed to *').split(/[^\p{L}\p{N}*]+/u).filter(Boolean)
    .map(word => numberOf(word) !== null && word !== 'a' && word !== 'i' ? '#' : word).join(' ')
  return { key, number, label, addressee }
}

/** A part's own name, tidied: "Of Anger. Book 1." -> "Of Anger, Book 1", "of Leisure." -> "Of Leisure". */
function tidyRest(rest) {
  let out = shortAlternative(rest) ?? rest
  out = out.replace(/^(.*\S)[.,;:]\s+((?:Book|Part|Volume)\s+\d+)\.?$/u, '$1, $2')
  out = dropFullStop(out).replace(/[,;:]+$/, '').trim()
  return firstCapital(out, true)
}

/**
 * A book's titles (already in house style) without the boilerplate most of them share.
 * Titles that do not share it, and every title of a book without it, are returned as they are.
 */
function withoutSharedBoilerplate(titles) {
  const read = titles.map(title => {
    if (typeof title !== 'string') return null
    // A numbered title already says which part it is ("Act 1, Scene 1 — Rome. A street",
    // "Section 4: Of Miracles. — Part 1", "Chapter 2. Of Imagination"): never shortened.
    if (/^\d/.test(title) || readLabel(title, true)) return null
    const split = firstSentence(title)
    if (!split || /\s[—–]\s|:/.test(split.head)) return null
    const boiler = readBoilerplate(split.head)
    return boiler.key.split(' ').length >= 6 ? { ...split, ...boiler } : null
  })
  const groups = new Map()
  read.forEach((entry, index) => { if (entry) groups.set(entry.key, [...(groups.get(entry.key) || []), index]) })
  const shared = [...groups.values()].filter(indexes => indexes.length >= 2)
  const covered = shared.reduce((sum, indexes) => sum + indexes.length, 0)
  const counted = titles.filter(title => typeof title === 'string').length
  if (!shared.length || covered < Math.max(3, Math.ceil(counted / 2))) return titles
  const out = [...titles]
  const cleaned = new Map()
  for (const indexes of shared) for (const index of indexes) {
    const short = tidyRest(read[index].rest)
    if (short && /\p{L}/u.test(short)) cleaned.set(index, short)
  }
  // Parts that read the same ("Of Consolation" three times) are told apart by whom they
  // are addressed to, else by the heading's own number ("On Clemency, Book 1").
  const byName = new Map()
  for (const [index, short] of cleaned) byName.set(short.toLowerCase(), [...(byName.get(short.toLowerCase()) || []), index])
  for (const indexes of byName.values()) {
    if (indexes.length < 2) continue
    const addressees = indexes.map(index => read[index].addressee)
    const numbers = indexes.map(index => read[index].number)
    const distinct = values => values.every(Boolean) && new Set(values.map(value => String(value).toLowerCase())).size === values.length
    if (distinct(addressees)) for (const index of indexes) cleaned.set(index, `${cleaned.get(index)}, to ${read[index].addressee}`)
    else if (distinct(numbers) && indexes.every(index => read[index].label)) for (const index of indexes) cleaned.set(index, `${cleaned.get(index)}, ${read[index].label} ${read[index].number}`)
    else for (const index of indexes) cleaned.delete(index)
  }
  for (const [index, short] of cleaned) out[index] = short
  return out
}

/** A book's chapter titles in house style, read together (English: shared boilerplate left out, quoted alternatives shortened). */
export function normalizeTitleList(titles, options = {}) {
  if (!Array.isArray(titles)) return titles
  const english = languageOf(options.language) === 'en'
  const each = titles.map(title => typeof title === 'string' ? normalizeChapterTitle(title, options) : title)
  if (!english) return each
  const together = withoutSharedBoilerplate(each)
  return together.map((title, index) => {
    if (typeof title !== 'string') return title
    // A quoted title with a short alternative reads as the alternative: '“Why, …” or, “Of Providence”'.
    const short = title === each[index] ? shortAlternative(title) : null
    const out = short ? firstCapital(short, true) : title
    // Never empty: the title as written.
    return out && /\p{L}|\d/u.test(out) ? out : each[index]
  })
}

/** `normalizeTitleList` over a list of chapters, returning new objects only where a title changed. */
export function normalizeChapterTitles(chapters, options = {}) {
  if (!Array.isArray(chapters)) return chapters
  const titles = normalizeTitleList(chapters.map(chapter => chapter && typeof chapter.title === 'string' ? chapter.title : null), options)
  return chapters.map((chapter, index) => {
    if (!chapter || typeof chapter.title !== 'string') return chapter
    const title = titles[index]
    return title === chapter.title ? chapter : { ...chapter, title }
  })
}
