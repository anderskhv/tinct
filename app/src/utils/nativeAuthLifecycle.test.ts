// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest'
const fixture=vi.hoisted(()=>({
 values:new Map<string,string>(),launch:undefined as string|undefined,
 exchange:vi.fn(),assign:vi.fn(),replace:vi.fn(),close:vi.fn(async()=>{}),
 listener:undefined as undefined|((event:{url:string})=>void),
}))
vi.mock('./nativePlatform',()=>({isNativeCapacitor:()=>true}))
vi.mock('./nativeAuthStorage',()=>({nativeAuthStorage:{
 getItem:async(key:string)=>fixture.values.get(key)??null,
 setItem:async(key:string,value:string)=>{fixture.values.set(key,value)},
 removeItem:async(key:string)=>{fixture.values.delete(key)},
}}))
vi.mock('@capacitor/browser',()=>({Browser:{close:fixture.close}}))
vi.mock('@capacitor/app',()=>({App:{
 getInfo:async()=>({id:'app.tinct.reader.review'}),
 addListener:async(_name:string,listener:(event:{url:string})=>void)=>{fixture.listener=listener;return {remove:async()=>{}}},
 getLaunchUrl:async()=>({url:fixture.launch}),
}}))
const pendingKey='tinct:native-auth-pending'
const deferredKey='tinct:native-auth-return'
const callback='app.tinct.reader.review://auth/callback?flow=0123456789abcdef&code=fixture-code'
function setPath(pathname:string){vi.stubGlobal('window',{location:{pathname,assign:fixture.assign,replace:fixture.replace}})}
beforeEach(()=>{
 vi.resetModules();fixture.values.clear();fixture.launch=undefined
 fixture.exchange.mockReset();fixture.assign.mockClear();fixture.replace.mockClear();fixture.close.mockClear()
 localStorage.clear();sessionStorage.clear()
 fixture.values.set(pendingKey,JSON.stringify({appId:'app.tinct.reader.review',nonce:'0123456789abcdef',returnTo:'/reader',kind:'oauth',expires:Date.now()+60_000}))
 fixture.exchange.mockImplementation(async()=>{
  expect(fixture.values.has(pendingKey)).toBe(false)
  return {data:{session:{user:{id:'fixture'}}},error:null}
 })
 setPath('/lab/sign-in/index.html')
})
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs()})
const client=()=>({auth:{exchangeCodeForSession:fixture.exchange}} as never)
it('unmounts the old reader before exchanging a callback for another account',async()=>{
 setPath('/reader')
 const {handleNativeAuthReturn}=await import('./nativeAuth')
 expect(await handleNativeAuthReturn(client(),callback,'app.tinct.reader.review')).toBe(true)
 expect(fixture.exchange).not.toHaveBeenCalled()
 expect(fixture.values.has(pendingKey)).toBe(true)
 expect(sessionStorage.getItem(deferredKey)).toBe(callback)
 expect(fixture.replace).toHaveBeenCalledWith('/lab/sign-in/index.html?returnTo=%2Freader')
})
it('claims matching concurrent callback events once before code exchange',async()=>{
 const {handleNativeAuthReturn}=await import('./nativeAuth')
 await Promise.all([handleNativeAuthReturn(client(),callback,'app.tinct.reader.review'),handleNativeAuthReturn(client(),callback,'app.tinct.reader.review')])
 expect(fixture.exchange).toHaveBeenCalledTimes(1)
 expect(fixture.assign).toHaveBeenCalledTimes(1)
 expect(fixture.assign.mock.calls[0][0]).toContain('callback=oauth')
})
it('consumes a deferred return before checking the repeated cold-start URL',async()=>{
 sessionStorage.setItem(deferredKey,callback);fixture.launch=callback
 const {installNativeAuth}=await import('./nativeAuth')
 await installNativeAuth(client())
 expect(fixture.exchange).toHaveBeenCalledTimes(1)
 expect(sessionStorage.getItem(deferredKey)).toBeNull()
 expect(fixture.values.has(pendingKey)).toBe(false)
})
it('returns a cancellation with a generic notice and no exchange',async()=>{
 const {handleNativeAuthReturn}=await import('./nativeAuth')
 await handleNativeAuthReturn(client(),callback.replace('&code=fixture-code','&error=access_denied&error_description=provider-private-detail'),'app.tinct.reader.review')
 expect(fixture.exchange).not.toHaveBeenCalled()
 expect(fixture.assign.mock.calls[0][0]).toContain('native-error=1')
 expect(localStorage.getItem('tinct:native-auth-notice')).toBe('Sign-in could not be completed. Please try again.')
 expect(fixture.assign.mock.calls[0][0]).not.toContain('provider-private-detail')
})

it('retries a lost Android startup read without waiting forever',async()=>{
 vi.useFakeTimers()
 try{
  const read=vi.fn().mockImplementationOnce(()=>new Promise(()=>{})).mockResolvedValueOnce({id:'app.tinct.reader.review'})
  const {nativeStartupRead}=await import('./nativeAuth')
  const pending=nativeStartupRead(read)
  await vi.advanceTimersByTimeAsync(3000)
  expect(await pending).toEqual({id:'app.tinct.reader.review'})
  expect(read).toHaveBeenCalledTimes(2)
 }finally{vi.useRealTimers()}
})
