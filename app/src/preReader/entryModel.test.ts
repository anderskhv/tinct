import { describe,it,expect } from 'vitest'
import {readFileSync} from 'node:fs'
// @ts-expect-error static entry module
import {fullShelf,pairedSamples} from '../../public/lab/entry-model.js'
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
})
