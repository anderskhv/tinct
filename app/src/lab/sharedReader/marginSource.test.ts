// @vitest-environment jsdom
import {expect,it} from 'vitest'
import {marginChapterBoundary,marginSourceWord} from './marginSource'
it('resolves true source boundaries across empty paragraphs and punctuation',()=>{
  const paragraphs=['','First chapter words.','The final paragraph has five words.','']
  expect(marginChapterBoundary(paragraphs)).toEqual({paragraphIndex:1,fromWord:0})
  expect(marginChapterBoundary(paragraphs,true)).toEqual({paragraphIndex:2,fromWord:5})
})
it('never reattaches an absent chapter boundary to the first or last rebased word',()=>{
  const host=document.createElement('div')
  host.innerHTML='<span data-testid="lab-word" data-paragraph-index="10" data-word-index="20">middle</span><span data-testid="lab-word" data-paragraph-index="11" data-word-index="8">later</span>'
  const paragraphs=Array.from({length:30},()=> 'One two three')
  expect(marginSourceWord(host,marginChapterBoundary(paragraphs)!)).toBeNull()
  expect(marginSourceWord(host,marginChapterBoundary(paragraphs,true)!)).toBeNull()
  expect(marginSourceWord(host,{paragraphIndex:10,fromWord:20})?.textContent).toBe('middle')
})
