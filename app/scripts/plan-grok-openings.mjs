import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
const catalogue=JSON.parse(await fs.readFile('dist/lab/catalogue.json','utf8'))
const order=['frankenstein','odyssey','jekyll-and-hyde','pride-and-prejudice','meditations','crime-and-punishment','jane-eyre','the-prince','julius-caesar','candide']
const entries=[]
for(const id of order){
  const book=catalogue.books.find(b=>b.id===id)
  assert(book && book.discoveryAvailable!==false)
  // Matches the production catalogue-runtime defaultEdition, including holds.
  const visible=book.editions.filter(e=>e.language!=='da' && e.discoveryAvailable!==false && e.availability.chapterText)
  const edition=visible.find(e=>e.style==='modern'&&e.language==='en') || visible.find(e=>e.style==='original'&&e.language==='en') || visible[0]
  assert(edition && edition.language==='en' && !edition.audioHeld)
  const bytes=await fs.readFile('public/data/editions/'+id+'-'+edition.key+'.json')
  const text=JSON.parse(bytes)
  const first=text.chapters.find(c=>c.number===1) || text.chapters[0]
  assert(first && Array.isArray(first.paragraphs))
  entries.push({bookId:id,editionKey:edition.key,chapter:first.number,paragraph:0,word:0,title:first.title,
    sourceSha256:createHash('sha256').update(bytes).digest('hex'),voices:['f','m'],targetSeconds:300})
}
await fs.mkdir('artifacts/grok-openings',{recursive:true})
await fs.writeFile('artifacts/grok-openings/plan.json',JSON.stringify({entryPath:'/library → book page → Read',selector:'catalogue-runtime.js defaultEdition (discoverable editions, modern first); no saved place',entries},null,2))
console.log(JSON.stringify(entries))
