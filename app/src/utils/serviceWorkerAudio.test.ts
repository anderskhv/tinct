import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import {expect,it,vi} from 'vitest'
function harness(){
 const listeners:Record<string,Function>={},entries=new Map<string,Response>()
 const key=(request:Request|string)=>typeof request==='string'?request:request.url
 const cache={match:async(request:Request|string)=>entries.get(key(request))?.clone(),put:vi.fn(async(request:Request|string,response:Response)=>{await Promise.resolve();entries.set(key(request),response.clone())})}
 const fetch=vi.fn(async()=>new Response('0123456789',{headers:{'Content-Type':'audio/mpeg'}}))
 const self={location:{origin:'https://tinct.app'},addEventListener:(name:string,fn:Function)=>{listeners[name]=fn},skipWaiting:()=>{},clients:{claim:()=>Promise.resolve()}}
 vm.runInNewContext(readFileSync(new URL('../../public/sw.js',import.meta.url),'utf8'),{self,caches:{open:async()=>cache},fetch,URL,Request,Response,Set,Promise})
 async function request(url:string,headers:Record<string,string>={}){
  const lifetime:Promise<unknown>[]=[];let response:Promise<Response>|undefined
  listeners.fetch({request:new Request(url,{headers}),respondWith:(value:Promise<Response>)=>{response=value},waitUntil:(value:Promise<unknown>)=>lifetime.push(value)})
  if(!response)throw Error('request was not handled')
  const result=await response;await Promise.all(lifetime);return result
 }
 return {request,fetch,cache}
}
it('keeps a completed Grok clip and serves a later media byte range without another fetch',async()=>{
 const h=harness(),url='https://tinct.app/api/audio-file?path=narration%2Fgrok%2Fblob%2F'+ 'a'.repeat(64)+'.mp3'
 expect(await (await h.request(url)).text()).toBe('0123456789')
 expect(h.cache.put).toHaveBeenCalledOnce()
 const replay=await h.request(url,{range:'bytes=2-5'})
 expect(replay.status).toBe(206)
 expect(replay.headers.get('content-range')).toBe('bytes 2-5/10')
 expect(await replay.text()).toBe('2345')
 expect(h.fetch).toHaveBeenCalledOnce()
 const invalid=await h.request(url,{range:'bytes=20-'})
 expect(invalid.status).toBe(416)
})
it('warms the complete file after the first ranged play for the next replay',async()=>{
 const h=harness(),url='https://tinct.app/api/audio-file?path=narration%2Fgrok%2Fblob%2F'+ 'b'.repeat(64)+'.mp3'
 await h.request(url,{range:'bytes=0-'})
 const count=h.fetch.mock.calls.length
 expect(await (await h.request(url,{range:'bytes=-4'})).text()).toBe('6789')
 expect(h.fetch).toHaveBeenCalledTimes(count)
})
