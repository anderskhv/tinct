// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest'
import {pdfReaderViewUrl} from './pdfReaderHandoff'
import {readPdfTextPlace,choosePdfPageAt} from './pdfEditions'
import {CURRENT_CONVERTER,type UserBookEdition} from './userEdition'
afterEach(()=>localStorage.clear())
const hex='ab12cd34ef56ab12cd34ef56'
it('keeps the shared reader and exact page fraction in both directions without a stale pages request',()=>{
  const original=pdfReaderViewUrl(hex,'pages',{page:4,frac:.6},'?sharedReader=1&view=margin')
  expect(original).toBe(`/reader?userBook=${hex}&sharedReader=1&view=margin&page=4&frac=0.6&pages=1`)
  const text=pdfReaderViewUrl(hex,'text',{page:4,frac:.6},original.split('?')[1])
  expect(text).toBe(`/reader?userBook=${hex}&sharedReader=1&view=margin&page=4&frac=0.6`)
})
it('maps an original-page fraction into text and back through the existing shared place owner',()=>{
  const edition:UserBookEdition={format:'tinct-user-edition-v1',converter:CURRENT_CONVERTER.pdf,title:'Fixture',author:'',language:'en',droppedImages:0,source:'pdf',chapters:[{number:1,title:'One',paragraphs:[Array.from({length:100},(_,i)=>`word${i}`).join(' ')],pages:[4]}]}
  localStorage.setItem(`tinct-addbook:pos:pdf:${hex}`,JSON.stringify({page:4,frac:.6,at:Date.now(),edition:'p'}))
  const text=readPdfTextPlace(hex,edition,{page:4})!
  expect(text).toMatchObject({chapterNumber:1,paragraphIndex:0,wordIndex:60})
  expect(choosePdfPageAt(hex,edition.chapters,text,6)).toEqual({page:4,frac:.6})
})
