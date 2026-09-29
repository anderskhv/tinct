import { describe,expect,it } from 'vitest'
import { emptyRecapQueue,preparedRecap,recapQueueNext,updateRecapQueue,RECAP_PREPARATION_DELAY_MS } from './recapPreparation'
import { RECAP_PROMPT_VERSION, type LabRecapRequest, type LabRecapResponse } from './recapSummary'
const now=1_800_000_000_000
const request:LabRecapRequest={bookId:'hamlet',editionKey:'original-en',chapterNumber:2,paragraphIndex:4,completed:false}
const ready:LabRecapResponse={summary:'Already prepared.',model:'mock',version:RECAP_PROMPT_VERSION,cached:false,coverage:{chapterNumber:2,throughParagraph:4,paragraphCount:10,complete:false,fromChapterNumber:null}}
describe('recaps five minutes after leaving',()=>{
 it('retains a server deadline after a leave, with no browser timer required',()=>{
  let state=updateRecapQueue(emptyRecapQueue(),{kind:'presence',clientId:'one',sequence:1,active:true,request},now)
  state=updateRecapQueue(state,{kind:'presence',clientId:'one',sequence:2,active:false,request},now+60_000)
  const restored=JSON.parse(JSON.stringify(state))
  expect(recapQueueNext(restored,now+60_000)).toEqual({bookId:'hamlet',at:now+60_000+RECAP_PREPARATION_DELAY_MS})
 })
 it('cancels the old deadline on return and rejects an out-of-order leave',()=>{
  let state=updateRecapQueue(emptyRecapQueue(),{kind:'presence',clientId:'one',sequence:2,active:false,request},now)
  state=updateRecapQueue(state,{kind:'presence',clientId:'one',sequence:3,active:true,request},now+240_000)
  const stale=updateRecapQueue(state,{kind:'presence',clientId:'one',sequence:2,active:false,request},now+250_000)
  expect(stale).toBe(state)
  expect(recapQueueNext(state,now+300_000)?.at).toBe(now+540_000)
 })
 it('prepares every shelf book while active books stay excluded, and never rolls back a newer place',()=>{
  let state=updateRecapQueue(emptyRecapQueue(),{kind:'shelf',candidates:[{request,lastActiveAt:now-900_000},{request:{...request,bookId:'odyssey'},lastActiveAt:now-600_000}]},now)
  state=updateRecapQueue(state,{kind:'presence',clientId:'one',sequence:1,active:true,request:{...request,paragraphIndex:8}},now)
  state=updateRecapQueue(state,{kind:'shelf',candidates:[{request,lastActiveAt:now-900_000},{request:{...request,bookId:'odyssey'},lastActiveAt:now-600_000}]},now)
  expect(state.entries.hamlet.request.paragraphIndex).toBe(8)
  expect(recapQueueNext(state,now)?.bookId).toBe('odyssey')
  state.entries.hamlet.result=ready
  expect(preparedRecap(state,{...request,paragraphIndex:8},now)).toBeNull()
 })
 it('never reuses a result for another edition, chapter or paragraph and retries are bounded',()=>{
  const state=updateRecapQueue(emptyRecapQueue(),{kind:'shelf',candidates:[{request,lastActiveAt:now-900_000}]},now)
  state.entries.hamlet.result=ready
  expect(preparedRecap(state,request,now)).toEqual(ready)
  for(const change of [{editionKey:'modern-en'},{chapterNumber:3},{paragraphIndex:5}]) expect(preparedRecap(state,{...request,...change},now)).toBeNull()
  delete state.entries.hamlet.result;state.entries.hamlet.attempts=3
  expect(recapQueueNext(state,now)).toBeNull()
 })
 it('reuses an exact-place result after a return and leave without generating again',()=>{
  let state=updateRecapQueue(emptyRecapQueue(),{kind:'shelf',candidates:[{request,lastActiveAt:now-900_000}]},now)
  state.entries.hamlet.result=ready
  state=updateRecapQueue(state,{kind:'presence',clientId:'one',sequence:1,active:true,request},now)
  expect(preparedRecap(state,request,now)).toBeNull()
  state=updateRecapQueue(state,{kind:'presence',clientId:'one',sequence:2,active:false,request},now+1000)
  expect(preparedRecap(state,request,now+1000)).toEqual(ready)
  expect(recapQueueNext(state,now+1000)).toBeNull()
 })
})
