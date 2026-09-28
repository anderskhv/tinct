import {expect,test} from 'vitest'
import {buildChapterSelection} from './labChapterSelection'
const chapters=[{chapterNumber:1189,chapterLabel:'One',paragraphs:['a b c','d e f']},{chapterNumber:1195,chapterLabel:'Two',paragraphs:['g h i','j k']}]
test('cross-chapter selection retains both chapter identities in edition order, forward or reverse',()=>{
 const start={chapterNumber:1189,paragraphIndex:1,wordIndex:1},end={chapterNumber:1195,paragraphIndex:0,wordIndex:1}
 const result=buildChapterSelection(chapters,start,end)
 expect(result.map(p=>[p.chapterNumber,p.range.text])).toEqual([[1189,'e f'],[1195,'g h']])
 expect(buildChapterSelection(chapters,end,start)).toEqual(result)
 expect(result[0].range).toMatchObject({paragraphIndex:1,fromWord:1,endParagraphIndex:1,toWord:3})
 expect(result[1].range).toMatchObject({paragraphIndex:0,fromWord:0,endParagraphIndex:0,toWord:2})
})
test('unknown or incomplete chapter data never yields a truncated saved range',()=>{
 expect(buildChapterSelection(chapters,{chapterNumber:1,paragraphIndex:0,wordIndex:0},{chapterNumber:1195,paragraphIndex:0,wordIndex:1})).toEqual([])
 expect(buildChapterSelection(chapters,{chapterNumber:1189,paragraphIndex:1,wordIndex:1},{chapterNumber:1195,paragraphIndex:0,wordIndex:50})).toEqual([])
})
