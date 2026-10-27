import { tokenizeHearingWords } from '../labHearing'
export interface MarginSourceAnchor { paragraphIndex:number; fromWord:number }
/** Unit boundaries use the actual chapter text, never the edge of a mounted slice. */
export function marginChapterBoundary(paragraphs:readonly string[], end=false):MarginSourceAnchor|null {
  const indexes = Array.from({length:paragraphs.length},(_,index)=>index)
  if (end) indexes.reverse()
  for (const paragraphIndex of indexes) {
    const count=tokenizeHearingWords(paragraphs[paragraphIndex]).length
    if (count) return {paragraphIndex,fromWord:end ? count-1 : 0}
  }
  return null
}
export function marginSourceWord(host:HTMLElement, anchor:MarginSourceAnchor):HTMLElement|null {
  if (!Number.isSafeInteger(anchor.paragraphIndex) || !Number.isSafeInteger(anchor.fromWord)
    || anchor.paragraphIndex < 0 || anchor.fromWord < 0) return null
  // A card already has its exact source coordinate. Do not allocate and walk
  // every mounted word for every card on each scroll/layout measurement.
  return host.querySelector<HTMLElement>(`[data-testid="lab-word"][data-paragraph-index="${anchor.paragraphIndex}"][data-word-index="${anchor.fromWord}"]`)
}
