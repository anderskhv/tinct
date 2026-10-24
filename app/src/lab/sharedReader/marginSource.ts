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
  return [...host.querySelectorAll<HTMLElement>('[data-testid="lab-word"]')].find(word=>Number(word.dataset.paragraphIndex)===anchor.paragraphIndex && Number(word.dataset.wordIndex)===anchor.fromWord) ?? null
}
