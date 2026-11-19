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
it('keeps exact card coordinates scoped to their source and rejects invalid anchors',()=>{
  const host=document.createElement('div')
  host.innerHTML='<span data-testid="lab-word" data-paragraph-index="2" data-word-index="3">source</span><span data-testid="lab-word" data-paragraph-index="2" data-word-index="30">other</span>'
  expect(marginSourceWord(host,{paragraphIndex:2,fromWord:3})?.textContent).toBe('source')
  expect(marginSourceWord(document.createElement('div'),{paragraphIndex:2,fromWord:3})).toBeNull()
  for (const fromWord of [NaN,Infinity,-1,3.5]) expect(marginSourceWord(host,{paragraphIndex:2,fromWord})).toBeNull()
})
