import { build } from 'esbuild'
import { Miniflare } from 'miniflare'
import assert from 'node:assert/strict'
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
const root=await mkdtemp(path.join(tmpdir(),'tinct-position-'))
let mf
const owner='11111111-1111-4111-8111-111111111111'
const other='22222222-2222-4222-8222-222222222222'
const now=Date.now()
function state(chapter,time=now,extra){
 const place={bookId:'romans',headerBook:'Romans',chapterNumber:chapter,sequentialChapter:chapter,paragraphIndex:2,wordIndex:5,updatedAt:time,deviceId:'fixture',rev:chapter}
 return {owner,books:{romans:place,...(extra?{[extra]:{...place,bookId:extra,headerBook:extra}}:{})},finished:{bible:[chapter]},hidden:{},lastSettledBookId:'romans',lastSettledAt:time,updatedAt:time,deviceId:'fixture'}
}
try{
 const scriptPath=path.join(root,'worker.mjs')
 await build({stdin:{contents:
  "export { ReaderPositionCoordinator } from './src/worker/readerPositionCoordinator.ts';"+
  "import { handleLabPosition } from './src/worker/routes/labPosition.ts';"+
  "export default {fetch(request,env){return handleLabPosition(request,env,async()=>request.headers.has('fixture-owner')?{id:request.headers.get('fixture-owner'),email:'fixture@example.invalid'}:null)}};",
  resolveDir:process.cwd(),sourcefile:'position-fixture.ts',loader:'ts'},
  bundle:true,format:'esm',platform:'neutral',external:['cloudflare:workers'],outfile:scriptPath})
 const options={cf:false,resourcePersistencePath:path.join(root,'state'),workers:[{config:{
  type:'worker',name:'position-fixture',compatibilityDate:'2025-09-27',
  manifest:{mainModule:'worker.mjs',modules:{'worker.mjs':{type:'esm',contents:await readFile(scriptPath,'utf8')}}},
  env:{READER_POSITION:{type:'durable-object',workerName:'position-fixture',exportName:'ReaderPositionCoordinator'},RATE_LIMIT:{type:'kv',id:'positions'}},
  exports:{ReaderPositionCoordinator:{type:'durable-object',storage:'sqlite'}}
 },dev:{outboundService:{type:'fetcher',handler(){throw new Error('Unexpected external request in storage fixture')}}}}]}
 mf=new Miniflare(options)
 const kv=await mf.getKVNamespace('RATE_LIMIT')
 await kv.put('lab-position:'+owner,JSON.stringify(state(8)))
 const request=async(method='GET',body,account=owner)=>{
  const response=await mf.dispatchFetch('http://fixture.test/api/lab-position',{
   method,headers:account?{'fixture-owner':account}:{},...(body?{body:JSON.stringify(body)}:{})})
  return {status:response.status,cache:response.headers.get('cache-control'),body:await response.json()}
 }
 assert.equal((await request('GET',null,null)).status,401)
 assert.equal((await request()).body.books.romans.chapterNumber,8)
 await Promise.all(Array.from({length:20},(_,i)=>request('PUT',state(i+1,now+i+1,'book-'+i))))
 let result=await request()
 assert.equal(result.status,200);assert.equal(result.cache,'private, no-store')
 assert.equal(Object.keys(result.body.books).length,21,'all concurrent device pins retained')
 assert.equal(result.body.books.romans.chapterNumber,20)
 assert.deepEqual(result.body.finished.bible,Array.from({length:20},(_,i)=>i+1))
 assert.equal((await request('GET',null,other)).body.books.romans,undefined,'accounts isolated')
 await mf.dispose();mf=null
 mf=new Miniflare(options)
 result=await request()
 assert.equal(result.body.books.romans.chapterNumber,20,'SQL state survives runtime restart over stale KV')
 assert.equal(Object.keys(result.body.books).length,21)
 await request('PUT',state(2,now+1000))
 assert.equal((await request()).body.books.romans.chapterNumber,2,'new intentional backwards move wins')
 const report={runtime:'workerd SQLite Durable Object',concurrentSaves:20,pinsRetained:21,finishedChaptersRetained:20,accountIsolation:true,restartPersistence:true,newerBackwardsMove:true,productionAccountWrites:false}
 await mkdir('artifacts/reader-position-store',{recursive:true})
 await writeFile('artifacts/reader-position-store/result.json',JSON.stringify(report,null,2))
 console.log(JSON.stringify(report))
}finally{await mf?.dispose();await rm(root,{recursive:true,force:true})}
