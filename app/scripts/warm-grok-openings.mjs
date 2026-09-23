import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { narrationTextForParagraph, sha256Hex } from '../src/narration/narrationCore.ts'
import { releaseWarmSignature } from '../src/narration/narrationReleaseAuth.ts'
const origin=process.env.NARRATION_ORIGIN || 'https://tinct.app'
assert(process.env.XAI_API_KEY,'Missing cloud release credential')
const plan=JSON.parse(await fs.readFile('artifacts/grok-openings/plan.json','utf8'))
assert.equal(plan.entries.length,10)
assert(plan.entries.every(e=>e.targetSeconds===300 && e.voices.join(',')==='f,m'))
async function releaseFetch(path, init) {
  const timestamp=String(Date.now())
  const signature=await releaseWarmSignature(process.env.XAI_API_KEY,init.method,path,timestamp,init.body || '')
  return fetch(origin+path,{...init,headers:{'Content-Type':'application/json','x-narration-provider':'grok','x-narration-release-time':timestamp,'x-narration-release-signature':signature}})
}
const report={startedAt:new Date().toISOString(),entries:[],generatedCalls:0}
let pendingWrite=Promise.resolve()
const checkpoint=()=>{const snapshot=JSON.stringify(report,null,2);pendingWrite=pendingWrite.then(()=>fs.writeFile('artifacts/grok-openings/warm-report.json',snapshot));return pendingWrite}
let totalRequests=0
async function warm(entry,voice){
  const source=await fs.readFile('public/data/editions/'+entry.bookId+'-'+entry.editionKey+'.json')
  assert.equal(createHash('sha256').update(source).digest('hex'),entry.sourceSha256)
  const chapters=JSON.parse(source).chapters
  let seconds=0
  const recordings=[]
  outer: for(const chapter of chapters.filter(c=>c.number>=entry.chapter)){
    for(let p=chapter.number===entry.chapter?entry.paragraph:0;p<chapter.paragraphs.length;p++){
      if(!chapter.paragraphs[p]?.trim())continue
      let retries=0, known=new Set()
      for(let rounds=0;rounds<100;rounds++){
        assert(++totalRequests<=1600,'Bounded warm request ceiling')
        const start=performance.now()
        const response=await releaseFetch('/api/narration/warm',{method:'POST',
          body:JSON.stringify({bookId:entry.bookId,editionKey:entry.editionKey,chapter:chapter.number,voice,mode:rounds===0?'cache':'next',paragraphs:[{index:p,textHash:await sha256Hex(narrationTextForParagraph(chapter.paragraphs[p]))}]}),
          signal:AbortSignal.timeout(95000)})
        assert.equal(response.status,200,'warm HTTP status')
        const result=await response.json()
        report.generatedCalls+=result.generated||0
        assert(report.generatedCalls<=600,'Bounded synthesis ceiling')
        const paragraph=result.paragraphs[0]
        assert(paragraph && !['failed','text_mismatch'].includes(paragraph.status),JSON.stringify(paragraph))
        assert(!paragraph.failure,JSON.stringify(paragraph.failure))
        const beforeKnown=known.size
        for(const chunk of paragraph.chunks.filter(c=>c.ready)){
          if(known.has(chunk.index))continue
          assert(chunk.timingsUsable && chunk.words?.length && chunk.duration>0)
          known.add(chunk.index);seconds+=chunk.duration
          recordings.push({chapter:chapter.number,paragraph:p,chunk:chunk.index,hash:chunk.hash,duration:chunk.duration,url:chunk.url,requestMs:Math.round(performance.now()-start),wordCount:chunk.words.length,textHash:paragraph.textHash})
        }
        if(seconds>=entry.targetSeconds)break outer
        if(paragraph.status==='ready')break
        if(rounds>0 && !result.generated && known.size===beforeKnown){
          assert(++retries<=8,'Narration did not progress')
          await new Promise(r=>setTimeout(r,1500))
        } else { retries=0 }
      }
    }
  }
  assert(seconds>=300,'Opening is shorter than five minutes')
  // Verify ready start and reuse after generation. A second warm must spend zero.
  const first=recordings[0]
  const started=performance.now()
  const response=await releaseFetch('/api/narration/warm',{method:'POST',
    body:JSON.stringify({bookId:entry.bookId,editionKey:entry.editionKey,chapter:first.chapter,voice,mode:'cache',paragraphs:[{index:first.paragraph,fromChunk:first.chunk}]}),
    signal:AbortSignal.timeout(95000)})
  assert.equal(response.status,200)
  const repeat=await response.json()
  // First paragraph can extend past five minutes; limit cached verification to
  // explicit read mode when available, never fill beyond the prepared boundary.
  assert.equal(repeat.generated,0,'Cached replay must not synthesize')
  const firstChunk=repeat.paragraphs[0].chunks.find(c=>c.index===first.chunk)
  assert.equal(firstChunk.hash,first.hash)
  const audio=await fetch(origin+first.url,{headers:{Range:'bytes=0-1023'}})
  assert([200,206].includes(audio.status))
  const bytes=await audio.arrayBuffer();assert(bytes.byteLength>=800)
  const row={bookId:entry.bookId,editionKey:entry.editionKey,voice,seconds,recordings,preparedStartMs:Math.round(performance.now()-started),repeatGenerated:repeat.generated}
  report.entries.push(row)
  await checkpoint()
  console.log(JSON.stringify({bookId:entry.bookId,editionKey:entry.editionKey,voice,seconds,preparedStartMs:row.preparedStartMs}))
}
for(const entry of plan.entries) await Promise.all(entry.voices.map(voice=>warm(entry,voice)))
assert.equal(report.entries.length,20)
report.completedAt=new Date().toISOString()
await checkpoint()
