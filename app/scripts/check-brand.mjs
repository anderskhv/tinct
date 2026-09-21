import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
const origin='https://tinct.app'
const results=[]
for(const [path,image] of [
 ['/', '/brand/20260921/share-tinct-1200x630.jpg'],
 ['/library', '/brand/20260921/share-tinct-1200x630.jpg'],
 ['/reader', '/brand/20260921/share-tinct-1200x630.jpg'],
 ['/library?book=frankenstein','/brand/20260921/books/frankenstein.jpg'],
 ['/read/the-prince','/brand/20260921/books/the-prince.jpg'],
]){
 const response=await fetch(origin+path);assert.equal(response.status,200,path)
 const html=await response.text()
 assert.equal((html.match(/property="og:image"/g)||[]).length,1,path+' has one social image')
 assert(html.includes('content="'+origin+image+'"'),path+' uses its public brand card')
 assert(html.includes('href="/brand/20260921/apple-touch-icon.png"'),path+' install icon')
 assert(html.includes('href="/brand/manifest.webmanifest"'),path+' manifest')
 results.push({path,image,passed:true})
}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
for(const path of ['/brand/manifest.webmanifest','/brand/20260921/favicon.svg','/brand/20260921/apple-touch-icon.png','/brand/20260921/icon-maskable-512.png','/brand/20260921/share-tinct-1200x630.jpg','/brand/20260921/books/frankenstein.jpg','/brand/20260921/books/the-prince.jpg','/brand/20260921/books/vindication-rights-of-woman.jpg']){
 const response=await fetch(origin+path);assert.equal(response.status,200,path)
 const remote=Buffer.from(await response.arrayBuffer()),expected=await fs.readFile('dist'+path)
 assert.equal(hash(remote),hash(expected),path+' serves the deployed asset')
 results.push({path,sha256:hash(remote),passed:true})
}
await fs.mkdir('artifacts/brand',{recursive:true})
await fs.writeFile('artifacts/brand/production.json',JSON.stringify(results,null,2))
console.log(JSON.stringify(results))
