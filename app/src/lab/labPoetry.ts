/** Presentation only: preserve source paragraph and audio word coordinates. */
const poetic = new Set<string>()
const verseStart = /^[⁰¹²³⁴⁵⁶⁷⁸⁹]+\s/u

export function registerBiblePoetry(title: string, paragraphs: string[]): void {
  if (!/^(?:Psalms?|Proverbs|Job|Song of (?:Songs|Solomon)|Ecclesiastes)\s+\d+$/i.test(title)) return
  // A prose edition with whole verses per paragraph must retain its prose layout.
  if (!paragraphs.some((p, i) => i > 0 && !verseStart.test(p) && p.split(/\s+/).length < 25)) return
  for (const paragraph of paragraphs) poetic.add(paragraph)
}

export function poetryClass(text?: string): string {
  return text && poetic.has(text) ? ' is-poetic-line' : ''
}

export function poeticGroupEnd(paragraphs: string[], start: number): number {
  if (!poetryClass(paragraphs[start]) || !verseStart.test(paragraphs[start])) return start + 1
  let end = start + 1
  while (end < paragraphs.length && poetryClass(paragraphs[end]) && !verseStart.test(paragraphs[end])) end++
  return end
}
