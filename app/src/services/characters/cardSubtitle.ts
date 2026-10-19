/**
 * Small words that carry no fact of their own. A subtitle is judged on what
 * is left once these are gone.
 */
const SUBTITLE_STOP_WORDS = new Set(['a', 'an', 'the', 'of', 'and', 'or', 'who', 'whom', 'whose', 'that', 'to', 'in', 'on', 'at', 'by', 'for', 'from', 'as', 'his', 'her', 'their', 'its', 'he', 'she', 'is', 'was', 'with'])

/** Lower-case words (letters and apostrophes); a possessive or plural apostrophe ending is dropped. */
function cardWords(text: string): string[] {
  return (text.toLowerCase().replace(/[\u2018\u2019\u02bc]/g, "'").match(/[\p{L}']+/gu) ?? [])
    .map(word => word.replace(/^'+/, '').replace(/'s$|'+$/, ''))
    .filter(Boolean)
}

const stem = (word: string) => word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word

/**
 * True when a character card's subtitle adds nothing its body does not
 * already say: at least 70% of the subtitle's content words also appear in
 * the body. Such a card shows the body alone (Anders, 2026-10-19: "Mrs.
 * McNab" read the same thing twice). A word counts as present when the body
 * has it or its simple -s form ("looks" / "look"). A subtitle with no content
 * words is kept.
 */
export function subtitleRepeatsBody(subtitle: string, body: string): boolean {
  const content = cardWords(subtitle).filter(word => !SUBTITLE_STOP_WORDS.has(word))
  if (!content.length) return false
  const bodyWords = new Set(cardWords(body))
  const bodyStems = new Set([...bodyWords].map(stem))
  const shared = content.filter(word => bodyWords.has(word) || bodyStems.has(stem(word))).length
  return shared / content.length >= 0.7
}
