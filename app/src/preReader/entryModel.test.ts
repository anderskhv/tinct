import { describe,it,expect } from 'vitest'
import {readFileSync} from 'node:fs'
// @ts-expect-error static entry module
import {fullShelf,isSampleProse,pairedSamples} from '../../public/lab/entry-model.js'
describe('approved entry presentation',()=>{
 it('includes every published book once in stable popular-first order',()=>{
  const books=[{id:'a'},{id:'b'},{id:'c'}]
  expect(fullShelf({books,popular:['b','b','missing']}).map((b:{id:string})=>b.id)).toEqual(['b','a','c'])
 })
 it('uses reviewed corresponding Odyssey boundaries from actual source',()=>{
  const keys=['original-en','modern-en'];const data=keys.map(k=>JSON.parse(readFileSync(`public/data/editions/odyssey-${k}.json`,'utf8')))
  const samples=pairedSamples('odyssey',keys,data)
  for(const sample of samples){expect(sample.paragraphIndex).toBe(1);expect(sample.short.split(/\s+/).length).toBeGreaterThanOrEqual(40);expect(sample.short.split(/\s+/).length).toBeLessThanOrEqual(60);expect(sample.full.startsWith(sample.short)).toBe(true);expect(sample.short).toMatch(/marry him\.$/)}
 })
 it('does not apply a fixed sentence count to other translations or changed text',()=>{
  const a={paragraphs:['Short heading','One full sentence. Another sentence with different translation boundaries.']};const b={paragraphs:['Heading','A corresponding complete passage with its own boundaries.']}
  expect(pairedSamples('odyssey',['original-en','another-en'],[a,b]).map((x:{short:string})=>x.short)).toEqual([a.paragraphs[1],b.paragraphs[1]])
  expect(pairedSamples('other',['original-en','modern-en'],[a,{paragraphs:[]}])).toEqual([null,null])
 })
 it('samples spoken text, not the stage direction the editions share',()=>{
  const keys=['original-en','modern-en'];const data=keys.map(k=>JSON.parse(readFileSync(`public/data/editions/macbeth-${k}.json`,'utf8')))
  const samples=pairedSamples('macbeth',keys,data)
  expect(samples[0].paragraphIndex).toBeGreaterThan(0)
  expect(samples[0].short).not.toMatch(/^\[/)
  expect(samples[0].short).not.toBe(samples[1].short)
 })
 it.each(['hamlet','bacchae'])('shows a different opening for each edition of %s',(bookId)=>{
  const keys=['original-en','modern-en'];const data=keys.map(k=>JSON.parse(readFileSync(`public/data/editions/${bookId}-${k}.json`,'utf8')))
  const samples=pairedSamples(bookId,keys,data)
  expect(samples[0].short).not.toBe(samples[1].short)
  expect(isSampleProse(samples[0].short)).toBe(true)
 })
 it('rejects stage directions, act and scene headings, and running titles',()=>{
  for(const text of ['[Thunder and Lightning. Enter three Witches.]','(Enter Francisco and Barnardo)','ACT I','Scene II.','CHAPTER 1','THE TRAGEDY OF MACBETH','Enter']) expect(isSampleProse(text)).toBe(false)
  for(const text of ['FIRST WITCH. When shall we three meet again?','It was a bright cold day in April, and the clocks were striking thirteen.']) expect(isSampleProse(text)).toBe(true)
 })
 it('prefers a passage the editions actually render differently',()=>{
  const shared='A line both editions print in exactly the same words, long enough to pass every length preference applied here.'
  const a={paragraphs:['[Enter two sentinels]',shared,'The older telling of what happened next, at a comfortable length for a sample.']}
  const b={paragraphs:['[Enter two sentinels]',shared,'The modern telling of what happened next, at a comfortable length for a sample.']}
  const samples=pairedSamples('other',['original-en','modern-en'],[a,b])
  expect(samples[0].paragraphIndex).toBe(2)
  expect(samples[0].short).not.toBe(samples[1].short)
 })
 it('keeps the existing pick for prose books whose opening is already usable',()=>{
  const long=(word:string)=>Array.from({length:50},()=>word).join(' ')+'.'
  const a={paragraphs:[long('alpha'),long('gamma')]}
  const b={paragraphs:[long('beta'),long('delta')]}
  expect(pairedSamples('other',['original-en','modern-en'],[a,b])[0].paragraphIndex).toBe(0)
 })
})
