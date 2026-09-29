import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LabPositionState } from '../lab/labPosition'
vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    ctx: any; env: any
    constructor(ctx: any, env: any) { this.ctx=ctx; this.env=env }
  },
}))
import { ReaderPositionCoordinator } from './readerPositionCoordinator'

const owner='11111111-1111-4111-8111-111111111111'
const now=1_800_000_000_000
function state(book='romans',chapter=8,time=now):LabPositionState {
  return {owner,books:{[book]:{bookId:book,headerBook:book,chapterNumber:chapter,sequentialChapter:chapter,paragraphIndex:2,wordIndex:5,updatedAt:time,deviceId:'phone',rev:time}},
    finished:{},hidden:{},lastSettledBookId:book,lastSettledAt:time,updatedAt:time,deviceId:'phone'}
}
function fixture(legacy:unknown=state()) {
  const rows=new Map<number,string>()
  let alarm:number|null=null
  const kv={get:vi.fn(async()=>legacy),put:vi.fn(async()=>{})}
  const exec=vi.fn((query:string,value?:string)=>{
    if(query.startsWith('INSERT')){
      const id=Number(query.match(/VALUES \((\d),/)?.[1])
      rows.set(id,value!)
    }
    const id=Number(query.match(/id=(\d)/)?.[1]??1)
    if(query.startsWith('DELETE'))rows.delete(id)
    return {toArray:()=>rows.has(id)?[{value:rows.get(id)}]:[]}
  })
  const storage={sql:{exec},getAlarm:vi.fn(async()=>alarm),
    setAlarm:vi.fn(async(value:number)=>{alarm=value})}
  const create=()=>new ReaderPositionCoordinator({storage} as any,{RATE_LIMIT:kv as unknown as KVNamespace})
  return {rows,kv,storage,create,fire:async(c:ReaderPositionCoordinator)=>{alarm=null;await c.alarm()}}
}
describe('account position coordinator',()=>{
  beforeEach(()=>{vi.useFakeTimers();vi.setSystemTime(now)})
  afterEach(()=>vi.useRealTimers())
  it('shares first import and keeps concurrent device pins, bookmarks and completion lists',async()=>{
    const original={...state(),extraRecoveryField:'preserve verbatim'}
    const f=fixture(original),c=f.create()
    let release!:(value:any)=>void
    f.kv.get.mockImplementationOnce(()=>new Promise(done=>{release=done}))
    const first=state('romans',9,now+1000)
    first.books.hamlet=state('hamlet',3,now+1000).books.hamlet
    first.finished={bible:[8]}
    first.recentChapters={'romans:9':first.books.romans}
    const second=state('romans',7,now+2000)
    second.books.frankenstein=state('frankenstein',5,now+2000).books.frankenstein
    second.finished={bible:[7],hamlet:[1]}
    const saves=[c.update(owner,first),c.update(owner,second)]
    expect(f.kv.get).toHaveBeenCalledTimes(1)
    release(original);await Promise.all(saves)
    const result=await c.read(owner)
    expect(Object.keys(result.books).sort()).toEqual(['frankenstein','hamlet','romans'])
    expect(result.books.romans.chapterNumber).toBe(7) // newer intentional backwards reading wins
    expect(result.finished).toEqual({bible:[7,8],hamlet:[1]})
    expect(result.recentChapters?.['romans:9']).toEqual(first.books.romans)
    expect(JSON.parse(f.rows.get(2)!)).toEqual(original)
    expect(f.kv.put).not.toHaveBeenCalled()
  })
  it('recreation reads the durable row even when legacy KV is stale',async()=>{
    const f=fixture(),c=f.create()
    await c.update(owner,state('romans',10,now+1000))
    const result=await f.create().read(owner)
    expect(result.books.romans.chapterNumber).toBe(10)
    expect(f.kv.get).toHaveBeenCalledTimes(1)
    expect(f.storage.setAlarm).toHaveBeenCalledWith(now+120_000)
  })
  it('failed initial reads do not create an empty record and are retryable',async()=>{
    const f=fixture(),c=f.create()
    f.kv.get.mockRejectedValueOnce(new Error('unavailable'))
    await expect(c.read(owner)).rejects.toThrow('unavailable')
    expect(f.rows.has(1)).toBe(false)
    expect((await c.read(owner)).books.romans.chapterNumber).toBe(8)
    expect(f.kv.get).toHaveBeenCalledTimes(2)
  })
  it('rejects invalid and mismatched owners and ignores an incoming owner claim',async()=>{
    const f=fixture(),c=f.create()
    await expect(c.read('invalid')).rejects.toThrow('Invalid account')
    expect(f.kv.get).not.toHaveBeenCalled()
    await c.read(owner)
    await expect(c.read('22222222-2222-4222-8222-222222222222')).rejects.toThrow('Account mismatch')
    expect((await c.update(owner,{...state('romans',9,now+1000),owner:'forged'})).owner).toBe(owner)
  })
  it('keeps the real resume when a device only knows its boot fallback',async()=>{
    const f=fixture(),c=f.create()
    const result=await c.update(owner,state('genesis',1,now+1000))
    expect(result.lastSettledBookId).toBe('romans')
    expect(result.books.genesis.chapterNumber).toBe(1)
  })
  it('reconciles a late legacy save before first mirror without losing simultaneous new saves',async()=>{
    const f=fixture(),c=f.create()
    await c.update(owner,state('romans',9,now+1000))
    await f.fire(c)
    expect(f.kv.put).not.toHaveBeenCalled()
    vi.setSystemTime(now+120_000)
    let release!:(value:any)=>void
    f.kv.get.mockImplementationOnce(()=>new Promise(done=>{release=done}))
    const reconciling=f.fire(c)
    await c.update(owner,state('romans',10,now+3000))
    const late=state('romans',8,now+2000)
    late.books.hamlet=state('hamlet',2,now+2000).books.hamlet
    release(late);await reconciling
    const result=await c.read(owner)
    expect(result.books.romans.chapterNumber).toBe(10)
    expect(result.books.hamlet.chapterNumber).toBe(2)
    expect(JSON.parse(f.rows.get(4)!)).toEqual(late)
    expect(f.rows.has(3)).toBe(false)
    expect(JSON.parse(f.kv.put.mock.calls.at(-1)![1])).toEqual(result)
  })
  it('a failed final legacy read keeps migration pending and canonical saves safe',async()=>{
    const f=fixture(),c=f.create()
    await c.update(owner,state('romans',9,now+1000))
    vi.setSystemTime(now+120_000)
    f.kv.get.mockRejectedValueOnce(new Error('offline'))
    await f.fire(c)
    expect(f.rows.has(3)).toBe(true)
    expect((await c.read(owner)).books.romans.chapterNumber).toBe(9)
    expect(f.kv.put).not.toHaveBeenCalled()
    expect(f.storage.setAlarm).toHaveBeenLastCalledWith(now+180_000)
  })
  it('mirror failures retry without losing the canonical record',async()=>{
    const f=fixture(),c=f.create()
    await c.update(owner,state('romans',9,now+1000))
    vi.setSystemTime(now+120_000)
    f.kv.put.mockRejectedValueOnce(new Error('limited'))
    await f.fire(c)
    expect((await f.create().read(owner)).books.romans.chapterNumber).toBe(9)
    expect(f.storage.setAlarm).toHaveBeenLastCalledWith(now+180_000)
    vi.setSystemTime(now+180_000);await f.fire(f.create())
    expect(f.kv.put).toHaveBeenCalledTimes(2)
  })
  it('schedules another mirror when a device saves during the previous mirror',async()=>{
    const f=fixture(),c=f.create()
    await c.read(owner);vi.setSystemTime(now+120_000);await f.fire(c)
    await c.update(owner,state('romans',9,now+130_000))
    vi.setSystemTime(now+132_000)
    let release!:()=>void
    f.kv.put.mockImplementationOnce(()=>new Promise<void>(done=>{release=done}))
    const mirror=f.fire(c)
    await c.update(owner,state('romans',10,now+132_000))
    release();await mirror
    expect((await c.read(owner)).books.romans.chapterNumber).toBe(10)
    expect(f.storage.setAlarm).toHaveBeenLastCalledWith(now+133_500)
  })
})
