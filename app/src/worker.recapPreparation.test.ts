import {describe,it,expect,vi} from 'vitest'
import {handleRecapPreparation} from './worker/routes/recapPreparation'
const id='11111111-1111-4111-8111-111111111111'
const target={bookId:'hamlet',editionKey:'original-en',chapterNumber:1,paragraphIndex:4}
const request=(body:unknown)=>new Request('https://tinct.app/api/recap-preparation',{method:'POST',body:JSON.stringify(body)})
describe('account-owned background recaps',()=>{
 it('rejects unauthenticated and malformed requests before scheduling',async()=>{
  const update=vi.fn(),getByName=vi.fn(()=>({update}))
  const env={RECAP_PREPARATION:{getByName}} as any
  expect((await handleRecapPreparation(request({kind:'shelf',candidates:[]}),env,async()=>null)).status).toBe(401)
  for(const body of [{kind:'presence',request:target,clientId:'a',sequence:1,active:'yes'},{kind:'shelf',candidates:[{request:{...target,editionKey:'modern-da'},lastActiveAt:1}]}]) {
   expect((await handleRecapPreparation(request(body),env,async()=>({id}))).status).toBe(400)
  }
  expect(update).not.toHaveBeenCalled()
 })
 it('routes only to the verified account, ignoring supplied identity',async()=>{
  const update=vi.fn(),lookup=vi.fn(async()=>null),getByName=vi.fn(()=>({update,lookup}))
  const result=await handleRecapPreparation(request({kind:'shelf',userId:'someone-else',candidates:[{request:target,lastActiveAt:100}]}),{RECAP_PREPARATION:{getByName}} as any,async()=>({id}))
  expect(result.status).toBe(200);expect(getByName).toHaveBeenCalledWith(id);expect(update).toHaveBeenCalledOnce()
  expect(lookup).toHaveBeenCalledWith(expect.objectContaining(target))
 })
})
