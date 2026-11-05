import {describe,expect,it} from 'vitest'
import fs from 'node:fs'
import {primerRows} from '../public/lab/library_2/catalogue.js'

// Book-level primers (Anders, 5 Nov 2026): "Background" becomes "Suggested prerequisites", drawn only for books with
// a strong prerequisite (not Frankenstein), and "What to notice" is gone. The files keep their old `context` and
// `notice` rows for now; the page no longer reads them.
const data=(id:string,lang='en')=>JSON.parse(fs.readFileSync(new URL(`../public/lab/library_2/primer-data/${id}.${lang}.json`,import.meta.url),'utf8'))
const app=fs.readFileSync(new URL('../public/lab/library_2/app.js',import.meta.url),'utf8')

describe('primer rows',()=>{
 it('reads Suggested prerequisites and nothing of Background or What to notice',()=>{
  const rows=primerRows(data('divine-comedy'))!
  expect(rows.prerequisites).toEqual([expect.objectContaining({title:"Virgil's Aeneid",bookId:'the-aeneid'})])
  expect(rows).not.toHaveProperty('context')
  expect(rows).not.toHaveProperty('notice')
 })
 it('gives Frankenstein no prerequisites',()=>{
  expect(primerRows(data('frankenstein'))!.prerequisites).toEqual([])
 })
 it('puts the Odyssey first for Ulysses',()=>{
  expect(primerRows(data('ulysses'))!.prerequisites[0]).toMatchObject({title:"Homer's Odyssey",bookId:'odyssey'})
 })
 it('keeps a title without a library book as plain text, drops malformed items and keeps at most three',()=>{
  const rows=primerRows({schemaVersion:1,prerequisites:[
   {title:' Henry IV, Part 1 ',text:' Part Two continues from it. '},
   {title:'',text:'No title'},
   {title:'No text'},
   null,
   {title:'A',text:'a',bookId:'iliad'},{title:'B',text:'b'},{title:'C',text:'c'},
  ]})!
  expect(rows.prerequisites).toEqual([{title:'Henry IV, Part 1',text:'Part Two continues from it.',bookId:null}])
  const four=primerRows({schemaVersion:1,prerequisites:[1,2,3,4].map(n=>({title:`T${n}`,text:`t${n}`}))})!
  expect(four.prerequisites.map(p=>p.title)).toEqual(['T1','T2','T3'])
 })
 it('draws the row only when there is a list, under its new title',()=>{
  expect(app).toContain("rows?.prerequisites?.length)list.append(primerRow('Suggested prerequisites','primer-prerequisites'")
  expect(app).not.toMatch(/primerRow\('What to notice'/)
  expect(app).not.toMatch(/primerRow\('Background'/)
  expect(app).not.toMatch(/rows\?*\.(context|notice)/)
 })
})
