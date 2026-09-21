import { describe,it,expect,vi,afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { loadLabAudioChapter,clipsFromFollowParagraphs,followPlayingClip } from './labListen'
const fixtures=JSON.parse(readFileSync('../artifacts/bella-reader-data-check-2026-09-21/fixtures.json','utf8'))
afterEach(()=>vi.unstubAllGlobals())
describe('Existing reader accepts repaired Bella audio data',()=>{
 for(const f of fixtures){
  it(f.key+' has word-level highlighting in every paragraph',async()=>{
   vi.stubGlobal('fetch',vi.fn(async(url:string)=>new Response(JSON.stringify(url.includes('audio-manifest')?f.manifest:f.sidecar),{status:200})))
   const [book,edition,ch]=f.key.split('/')
   const paragraphs=await loadLabAudioChapter(f.paragraphs,Number(ch.slice(2)),edition,book)
   expect(paragraphs).toHaveLength(f.paragraphs.length)
   const clips=clipsFromFollowParagraphs(paragraphs)
   expect(clips).toHaveLength(f.paragraphs.length)
   for(let i=0;i<paragraphs.length;i++){
    const p=paragraphs[i]
    expect(p.words?.length).toBeGreaterThan(0)
    expect(clips[i].file).toBe(f.manifest.paragraphs.find((mp:any)=>mp.paragraph===i).file)
    const timed=p.words!.map((w,j)=>({w,j})).filter(({w})=>w.end>w.start)
    expect(timed.length).toBeGreaterThan(0)
    for(const entry of [timed[0],timed[Math.floor(timed.length/2)],timed.at(-1)!]){
     const target=followPlayingClip(paragraphs,clips[i],(entry.w.start+entry.w.end)/2)
     expect(target).toEqual({kind:'word',paragraphIndex:i,wordIndex:entry.j})
    }
   }
  })
  if(f.embedded)it(f.key+' embedded timings take precedence over stale sidecars',async()=>{
   const bad={...f.sidecar,paragraphs:f.sidecar.paragraphs.map((p:any)=>({...p,words:[{text:'wrong',start:99,end:100}]}))}
   vi.stubGlobal('fetch',vi.fn(async(url:string)=>new Response(JSON.stringify(url.includes('audio-manifest')?f.manifest:bad),{status:200})))
   const [book,edition,ch]=f.key.split('/')
   const paragraphs=await loadLabAudioChapter(f.paragraphs,Number(ch.slice(2)),edition,book)
   expect(paragraphs.every(p=>p.words && p.words.length>0)).toBe(true)
   expect(paragraphs[0].words![0].start).toBe(f.manifest.paragraphs[0].words[0].start)
  })
 }
})
