import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RECAP_PROMPT_VERSION } from '../recapSummary'
import { RECAP_PREPARATION_DELAY_MS } from '../recapPreparation'
const transport = vi.hoisted(() => ({ generate: vi.fn() }))
vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    ctx: any; env: any
    constructor(ctx: any, env: any) { this.ctx = ctx; this.env = env }
  },
}))
vi.mock('./routes/labRecap', () => ({ handleLabRecap: transport.generate }))
import { RecapPreparationCoordinator } from './recapPreparationCoordinator'

const start = 1_800_000_000_000
const request = { bookId:'hamlet', editionKey:'original-en', chapterNumber:2, paragraphIndex:4 }
const ready = { summary:'Prepared without later events.', model:'mock', version:RECAP_PROMPT_VERSION, cached:false,
  coverage:{chapterNumber:2,throughParagraph:4,paragraphCount:10,complete:false,fromChapterNumber:null} }
function fixture() {
  const rows = new Map<number,string>()
  const setAlarm = vi.fn(async () => {}), deleteAlarm = vi.fn(async () => {})
  const exec = (query:string, value?:string) => {
    if (query.startsWith('INSERT')) rows.set(query.includes('(2,') ? 2 : 1,value!)
    const id = query.includes('id=2') ? 2 : 1
    return { toArray: () => rows.has(id) ? [{value:rows.get(id)}] : [] }
  }
  const ctx = { storage:{ sql:{exec},setAlarm,deleteAlarm } } as any
  return { create:() => new RecapPreparationCoordinator(ctx,{}), rows,setAlarm,deleteAlarm }
}
describe('durable recap alarm execution', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(start); transport.generate.mockReset() })
  afterEach(() => vi.useRealTimers())
  it('survives coordinator recreation and generates only after the persisted five-minute deadline', async () => {
    const f=fixture(), first=f.create()
    await first.update({kind:'presence',clientId:'tab',sequence:1,active:false,request},'owner')
    expect(f.setAlarm).toHaveBeenLastCalledWith(start+RECAP_PREPARATION_DELAY_MS)
    transport.generate.mockResolvedValue(Response.json(ready))
    const restored=f.create()
    vi.setSystemTime(start+RECAP_PREPARATION_DELAY_MS-1)
    await restored.alarm()
    expect(transport.generate).not.toHaveBeenCalled()
    vi.setSystemTime(start+RECAP_PREPARATION_DELAY_MS)
    await restored.alarm()
    expect(transport.generate).toHaveBeenCalledOnce()
    expect(await transport.generate.mock.calls[0][0].json()).toEqual(request)
    expect(restored.lookup(request)).toEqual(ready)
    expect(f.deleteAlarm).toHaveBeenCalled()
    expect(f.rows.get(2)).toBe('owner')
  })
  it('discards a completed response if progress changed while generation was in flight', async () => {
    const f=fixture(), coordinator=f.create()
    await coordinator.update({kind:'presence',clientId:'tab',sequence:1,active:false,request},'owner')
    let resolve!:(response:Response)=>void
    transport.generate.mockImplementation(() => new Promise<Response>(done => { resolve=done }))
    vi.setSystemTime(start+RECAP_PREPARATION_DELAY_MS)
    const alarm=coordinator.alarm()
    await coordinator.update({kind:'presence',clientId:'tab',sequence:2,active:true,request:{...request,paragraphIndex:8}},'owner')
    resolve(Response.json(ready)); await alarm
    expect(coordinator.lookup(request)).toBeNull()
    expect(JSON.parse(f.rows.get(1)!).entries.hamlet.result).toBeUndefined()
    expect(f.setAlarm).toHaveBeenLastCalledWith(start+2*RECAP_PREPARATION_DELAY_MS)
  })
  it('persists failed attempts before retrying and stops after three calls', async () => {
    const f=fixture(), coordinator=f.create()
    await coordinator.update({kind:'presence',clientId:'tab',sequence:1,active:false,request},'owner')
    transport.generate.mockRejectedValue(new Error('mock unavailable'))
    for(let attempt=0;attempt<3;attempt++){
      vi.setSystemTime(start+RECAP_PREPARATION_DELAY_MS+attempt*60_000)
      await f.create().alarm()
      expect(JSON.parse(f.rows.get(1)!).entries.hamlet.attempts).toBe(attempt+1)
    }
    await f.create().alarm()
    expect(transport.generate).toHaveBeenCalledTimes(3)
    expect(f.deleteAlarm).toHaveBeenCalled()
  })
})
