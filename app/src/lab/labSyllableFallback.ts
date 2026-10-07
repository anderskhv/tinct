/**
 * A guess at a word's syllables, for the words the en-us patterns do not
 * break at all (Anders, iPhone, Nehemiah 12, Oct 2026).
 *
 * The patterns were trained on an English dictionary. Names and invented
 * words outside it often get no break ("Amariah", "Zechariah", "Hilkiah",
 * "Kutuzov"), so a justified phone line before one can only stretch its
 * spaces. For those words only (seven letters or more, and only where the
 * patterns give nothing: a word the dictionary breaks is never touched) the
 * reader falls back to the plain written-form rules below. Nothing here is a
 * list of names: the same rules serve a Russian novel, a Greek play and the
 * Bible alike. `SYLLABLE_EXCEPTIONS` corrects a wrong guess for one word.
 *
 * 1. Letters are read in units: ch, sh, th, ph, gh, zh, kh, ck and qu (and
 *    rh after r) are one consonant and never split. y is a vowel unless a
 *    vowel follows it.
 * 2. Vowels in a row are separate syllables (Am-a-ri-ah, Ku-tu-zov), except a
 *    pair that is one sound (ai, au, ay, ea, ee, ei, eu, ey, ie, oa, oe, oi,
 *    oo, ou, oy, ue), which stays together (Ze-ru-i-ah: ui is two).
 * 3. Between two vowels the consonants split by the maximal-onset principle:
 *    the next syllable starts with the longest cluster English begins words
 *    with: one consonant (V-CV: Je-ho-ha-nan), a stop or f before l or r
 *    (A-bra-ham), or after another consonant an s-cluster (Bol-kon-sky).
 *    Otherwise they split before the last consonant (Hil-ki-ah, Mal-chi-jah).
 *    ck and x always end a syllable.
 * 4. A first syllable too short to stand at a line end (a lone vowel, or a
 *    short vowel before ch/sh/th/ph) keeps the consonant after it, as
 *    dictionaries divide such names: Am-a-ri-ah, Zech-a-ri-ah.
 * 5. Words shaped like English (see ENGLISH_SHAPE) are never guessed at.
 *
 * Only breaks that leave three letters on each side are offered: this is a
 * guess, so it is held to a stricter minimum than the dictionary's 2/3.
 */

/** Words the patterns leave whole are guessed only from this length on. */
export const FALLBACK_MIN_WORD = 7
/** Letters kept on each side of a guessed break. */
export const FALLBACK_MIN_SIDE = 3

/**
 * Per-word corrections, lowercase word → its syllables ("zech-a-ri-ah").
 * An entry replaces the rules for that word; an entry with no hyphen means
 * "never break it".
 */
export const SYLLABLE_EXCEPTIONS: Readonly<Record<string, string>> = {
  // A compound the rules read as "Gate-shead" (Jane Eyre).
  gateshead: 'gates-head',
}

const DIGRAPHS = new Set(['ch', 'sh', 'th', 'ph', 'gh', 'zh', 'kh', 'ck', 'qu'])
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y'])
const ONE_SOUND = new Set(['ai', 'au', 'ay', 'ea', 'ee', 'ei', 'eu', 'ey', 'ie', 'oa', 'oe', 'oi', 'oo', 'ou', 'oy', 'ue'])
const LIQUID_ONSET = new Set(['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'chr', 'thr', 'shr', 'phr', 'phl'])
const S_ONSET = new Set(['sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'scr', 'spl', 'spr', 'str', 'squ'])
const CODA_ONLY = new Set(['ck', 'x'])
const SHORT_HEAD_DIGRAPHS = new Set(['ch', 'sh', 'th', 'ph'])

/**
 * An English word the patterns leave whole is usually left whole on purpose:
 * its only syllable breaks would leave a two-letter tail ("start-ed",
 * "broth-er") or cut a compound ("there-by"), and these rules, written for
 * names, would break it wrongly ("star-ted", "bro-ther", "the-reby"). So a
 * word with an English ending or compound head is never guessed at:
 * inflections and suffixes, a plural -s after a consonant, a silent final e,
 * a compound head. Measured on the 200 commonest words of 7+ letters in our
 * English editions that the patterns leave whole: 9 get a guessed break
 * (labSyllableFallback.test.ts).
 */
const ENGLISH_SHAPE = new RegExp([
  '(?:ed|en|er|ers|ered|ing|ings|ly|es|est|ful|less|ness|ment|ments|ous|ance|ence|ion|ions|ity|ive|age|ure|ght|ghts|ish|ism|ist|able|ible|ward|wards|self|some|ship|hood|dom|where|ever|thy|[^aeiouy]s|[^aeiouy]e)$',
  '^(?:there|where|here|every|some|any|never|over|under|out|with|fore|after|light|night|eight|through)',
].join('|'))

interface Unit { text: string; start: number; vowel: boolean }

function units(word: string): Unit[] {
  const out: Unit[] = []
  for (let index = 0; index < word.length;) {
    const pair = word.slice(index, index + 2)
    // Greek rh after r is one consonant: Pyr-rhus.
    const text = DIGRAPHS.has(pair) || (pair === 'rh' && word[index - 1] === 'r') ? pair : word[index]
    out.push({ text, start: index, vowel: text.length === 1 && VOWELS.has(text) })
    index += text.length
  }
  out.forEach((unit, index) => {
    if (unit.text === 'y') unit.vowel = !(out[index + 1]?.vowel && out[index + 1].text !== 'y')
  })
  return out
}

/**
 * Where a consonant cluster between two vowels splits, as an index into
 * `cons`: the longest legal onset (rule 3) starts the next syllable.
 */
function onsetStart(cons: Unit[]): number {
  const legal = (from: number): boolean => {
    const text = cons.slice(from).map(unit => unit.text).join('')
    if (cons.length - from === 1) return !CODA_ONLY.has(text)
    return LIQUID_ONSET.has(text) || (from > 0 && S_ONSET.has(text))
  }
  for (let from = 0; from < cons.length; from += 1) if (legal(from)) return from
  return cons.length
}

/**
 * Syllable boundaries in `word` (offsets after which a syllable ends),
 * ascending; [] for anything but a plain lowercase-able alphabetic word.
 * No minimum is applied here (see fallbackBreaks).
 */
export function syllableBoundaries(word: string): number[] {
  const lower = word.toLowerCase()
  if (!/^[a-z]+$/.test(lower)) return []
  const exception = SYLLABLE_EXCEPTIONS[lower]
  if (exception != null) {
    const out: number[] = []
    let at = 0
    for (const part of exception.split('-').slice(0, -1)) { at += part.length; out.push(at) }
    return out
  }
  const list = units(lower)
  const breaks: number[] = []
  let index = 0
  while (index < list.length && !list[index].vowel) index += 1
  let first = true
  while (index < list.length) {
    let runEnd = index
    while (runEnd < list.length && list[runEnd].vowel) runEnd += 1
    // Rule 2: split a vowel run except inside a one-sound pair.
    for (let v = index + 1; v < runEnd; v += 1) {
      const pair = list[v - 1].text + list[v].text
      const pairedBefore = v - 2 >= index && ONE_SOUND.has(list[v - 2].text + list[v - 1].text) && !breaks.includes(list[v - 1].start)
      if (ONE_SOUND.has(pair) && !pairedBefore) continue
      breaks.push(list[v].start)
    }
    let nextVowel = runEnd
    while (nextVowel < list.length && !list[nextVowel].vowel) nextVowel += 1
    if (nextVowel >= list.length) break
    const cons = list.slice(runEnd, nextVowel)
    let split = onsetStart(cons)
    // Rule 4: a too-short first syllable keeps one consonant.
    if (first && cons.length === 1 && split === 0) {
      const head = list[runEnd - 1].start + list[runEnd - 1].text.length
      if (head === 1 || (head <= 2 && SHORT_HEAD_DIGRAPHS.has(cons[0].text))) split = 1
    }
    breaks.push(split >= cons.length ? list[nextVowel].start : cons[split].start)
    first = false
    index = nextVowel
  }
  return [...new Set(breaks)].filter(at => at > 0 && at < lower.length).sort((a, b) => a - b)
}

/**
 * The guessed breaks a line may use in `word` (letters only, no possessive):
 * three letters each side, never in an all-caps word, never in one shorter
 * than FALLBACK_MIN_WORD.
 */
export function fallbackBreaks(word: string): number[] {
  if (word.length < FALLBACK_MIN_WORD || !/^\p{L}+$/u.test(word)) return []
  if (word === word.toUpperCase()) return []
  if (!(word.toLowerCase() in SYLLABLE_EXCEPTIONS) && ENGLISH_SHAPE.test(word.toLowerCase())) return []
  return syllableBoundaries(word).filter(at => at >= FALLBACK_MIN_SIDE && word.length - at >= FALLBACK_MIN_SIDE)
}

/** "Amariah" → "Am-a-ri-ah", every boundary drawn (for reports and tests). */
export function drawSyllables(word: string): string {
  let out = ''
  let from = 0
  for (const at of syllableBoundaries(word)) { out += word.slice(from, at) + '-'; from = at }
  return out + word.slice(from)
}
