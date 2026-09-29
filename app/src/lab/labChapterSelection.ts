import {buildHighlightRange,type LabHighlightRange,type LabWordPlace} from './labHighlights'
import {tokenizeWithEmphasis} from './labEmphasis'
export interface SelectionChapter {chapterNumber:number;chapterLabel:string;paragraphs:string[]}
export interface ChapterSelectionPart extends SelectionChapter {range:LabHighlightRange}
export interface ChapterWordPlace extends LabWordPlace {chapterNumber:number}
/** Chapter order is supplied by the actual edition list; numbers need not be consecutive. */
export function buildChapterSelection(chapters:SelectionChapter[],start:ChapterWordPlace,end:ChapterWordPlace):ChapterSelectionPart[]{
 const a=chapters.findIndex(c=>c.chapterNumber===start.chapterNumber),b=chapters.findIndex(c=>c.chapterNumber===end.chapterNumber)
 if(a<0||b<0)return []
 const forward=a<b||a===b&&(start.paragraphIndex<end.paragraphIndex||start.paragraphIndex===end.paragraphIndex&&start.wordIndex<=end.wordIndex)
 const first=forward?start:end,last=forward?end:start,low=Math.min(a,b),high=Math.max(a,b)
 const parts:ChapterSelectionPart[]=[]
 for(let i=low;i<=high;i++){
  const chapter=chapters[i],lastParagraph=chapter.paragraphs.length-1
  if(lastParagraph<0)return []
  const from=i===low?first:{paragraphIndex:0,wordIndex:0}
  const to=i===high?last:{paragraphIndex:lastParagraph,wordIndex:tokenizeWithEmphasis(chapter.paragraphs[lastParagraph]).length-1}
  if(from.paragraphIndex<0||to.paragraphIndex>lastParagraph||from.wordIndex<0||to.wordIndex<0)return []
  if(from.wordIndex>=tokenizeWithEmphasis(chapter.paragraphs[from.paragraphIndex]||'').length||to.wordIndex>=tokenizeWithEmphasis(chapter.paragraphs[to.paragraphIndex]||'').length)return []
  const range=buildHighlightRange(chapter.paragraphs,from,to)
  if(!range)return []
  parts.push({...chapter,range})
 }
 return parts
}
