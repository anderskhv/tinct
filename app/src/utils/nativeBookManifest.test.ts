// @vitest-environment node
import { afterEach, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { buildNativeBooks } from '../../scripts/android/native-books'
const roots:string[]=[]
afterEach(()=>{for(const root of roots.splice(0))fs.rmSync(root,{recursive:true,force:true})})
it('hashes exact published bytes and includes English sidecars, never a withdrawn Danish edition',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'native-book-'));roots.push(root)
 fs.mkdirSync(path.join(root,'data/editions'),{recursive:true})
 const text='{"chapters":[{"number":1,"paragraphs":["Keep  these exact bytes."]}]}\r\n'
 fs.writeFileSync(path.join(root,'data/editions/fixture-original-en.json'),text)
 fs.writeFileSync(path.join(root,'data/editions/fixture-modern-da.json'),'Danish recovery stays outside the download')
 fs.writeFileSync(path.join(root,'data/editions/fixture-threads.json'),'{"threads":[]}')
 const book:any={id:'fixture',title:'Fixture',editions:[{key:'original-en',language:'en'},{key:'modern-da',language:'da'}]}
 const view:any={id:'fixture',editions:book.editions.map((e:any)=>({...e,availability:{chapterText:true}}))}
 const result=buildNativeBooks(root,[book],{books:[view]},new Map([['fixture','{"paragraphs":["Introduction"]}']]))
 const entry=JSON.parse(result.index).books[0],pack=JSON.parse(result.manifests[entry.manifest.slice(1)])
 expect(entry.revision).toBe(createHash('sha256').update(result.manifests[entry.manifest.slice(1)]).digest('hex'))
 expect(pack.book.editions.map((e:any)=>e.key)).toEqual(['original-en'])
 expect(pack.files.find((file:any)=>file.path.endsWith('original-en.json'))).toMatchObject({sha256:createHash('sha256').update(text).digest('hex'),bytes:Buffer.byteLength(text)})
 expect(pack.files.some((file:any)=>file.path.includes('-da'))).toBe(false)
 expect(pack.files.some((file:any)=>file.path.endsWith('-threads.json'))).toBe(true)
 expect(pack.files.some((file:any)=>file.path==='/lab/prefaces/fixture.json')).toBe(true)
 expect(fs.readFileSync(path.join(root,'data/editions/fixture-original-en.json'),'utf8')).toBe(text)
})
