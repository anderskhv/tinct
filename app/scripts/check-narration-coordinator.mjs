import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
const dir = '.narration-coordinator-check'
await fs.mkdir(dir, {recursive:true})
await fs.writeFile(dir+'/worker.ts', `import { NarrationCoordinator } from '../src/worker/narrationCoordinator'
export { NarrationCoordinator }
export default { async fetch(request, env) {
  const {name, method, args} = await request.json()
  const stub = env.COORD.getByName(name)
  const value = method === 'claim' ? await stub.claim(...args) : method === 'release' ? await stub.release(...args) : method === 'reserve' ? await stub.reserve(...args) : await stub.usage()
  return Response.json(value ?? null)
} }`)
await fs.writeFile(dir+'/wrangler.json', JSON.stringify({name:'tinct-coordinator-check',main:'worker.ts',compatibility_date:'2025-09-27',durable_objects:{bindings:[{name:'COORD',class_name:'NarrationCoordinator'}]},migrations:[{tag:'v1',new_sqlite_classes:['NarrationCoordinator']}]}))
const processHandle = spawn('npx',['wrangler','dev','--config',dir+'/wrangler.json','--port','8797','--persist-to',dir+'/state'],{stdio:['ignore','pipe','pipe'],detached:true})
let logs=''; processHandle.stdout.on('data',b=>logs+=b);processHandle.stderr.on('data',b=>logs+=b)
const call=async(name,method,args=[])=>{
  const r=await fetch('http://127.0.0.1:8797',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,method,args})})
  assert.equal(r.status,200);return r.json()
}
try {
  let started=false
  for(let i=0;i<60;i++){try{await call('probe','usage');started=true;break}catch{} await new Promise(r=>setTimeout(r,500))}
  assert.ok(started,'Worker did not start: '+logs.slice(-3000))
  const nonce=Date.now()
  const claims=await Promise.all(Array.from({length:30},(_,i)=>call('chunk:'+nonce,'claim',['token-'+i])))
  assert.equal(claims.filter(Boolean).length,1)
  await call('chunk:'+nonce,'release',['wrong-token'])
  assert.equal(await call('chunk:'+nonce,'claim',['late']),false)
  await call('chunk:'+nonce,'release',['token-'+claims.indexOf(true)])
  assert.equal(await call('chunk:'+nonce,'claim',['next']),true)
  const budgets=await Promise.all(Array.from({length:30},()=>call('budget:'+nonce,'reserve',['2026-09-23',10,100,150])))
  assert.equal(budgets.filter(Boolean).length,10)
  const nextDay=await Promise.all(Array.from({length:20},()=>call('budget:'+nonce,'reserve',['2026-09-24',10,100,150])))
  assert.equal(nextDay.filter(Boolean).length,5)
  const usage=await call('budget:'+nonce,'usage')
  assert.equal(usage.reduce((sum,row)=>sum+row.bytes,0),150)
  console.log('PASS actual Worker RPC: 30 simultaneous claims, wrong-owner release, daily/monthly ceilings')
} finally { process.kill(-processHandle.pid,'SIGTERM') }
