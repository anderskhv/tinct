import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'

// Public, read-only acceptance: compare the exact deployed catalogue/manifests
// and one complete on-demand book against the build's content identities.
const origin=process.argv[2]||'https://tinct.app'
const expected=await fs.readFile('dist/native-books/index.json')
async function get(path){
 const response=await fetch(new URL(path,origin),{redirect:'error',signal:AbortSignal.timeout(20000)})
 assert.equal(response.status,200,'published asset '+path)
 return Buffer.from(await response.arrayBuffer())
}
const index=await get('/native-books/index.json')
assert(index.equals(expected),'production native catalogue matches this deployment')
const catalogue=JSON.parse(index)
assert.equal(catalogue.schema,1)
for(let offset=0;offset<catalogue.books.length;offset+=6){
 await Promise.all(catalogue.books.slice(offset,offset+6).map(async book=>{
  const bytes=await get(book.manifest)
  assert.equal(createHash('sha256').update(bytes).digest('hex'),book.revision,'published manifest '+book.id)
 }))
}
const book=catalogue.books.find(book=>book.id==='apology')
assert(book,'a small on-demand book is published')
const manifest=JSON.parse(await get(book.manifest))
for(let offset=0;offset<manifest.files.length;offset+=6){
 await Promise.all(manifest.files.slice(offset,offset+6).map(async file=>{
  const bytes=await get(file.path)
  assert.equal(bytes.length,file.bytes,'published size '+file.path)
  assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,'published bytes '+file.path)
 }))
}
console.log(JSON.stringify({nativePublication:{origin,catalogueMatchesBuild:true,manifests:catalogue.books.length,completeOnDemandBook:book.id,verifiedFiles:manifest.files.length,accountOrProviderCalls:false}}))
