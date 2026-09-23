import { it, expect } from 'vitest'
import { releaseWarmSignature, verifyReleaseWarmRequest } from './narrationReleaseAuth'
it('binds cloud authorization to method, URL, body, secret and expiration', async()=>{
  const key='test-only-secret', now=Date.now(), time=String(now), body='{"voice":"f"}', path='/api/narration/warm'
  const signature=await releaseWarmSignature(key,'POST',path,time,body)
  const req=(text=body, target=path)=>new Request('https://tinct.app'+target,{method:'POST',body:text,headers:{'x-narration-release-time':time,'x-narration-release-signature':signature}})
  expect(await verifyReleaseWarmRequest(req(),key,now)).toBe(true)
  expect(await verifyReleaseWarmRequest(req('{"voice":"eve"}'),key,now)).toBe(false)
  expect(await verifyReleaseWarmRequest(req(),key+'wrong',now)).toBe(false)
  expect(await verifyReleaseWarmRequest(req(),key,now+300001)).toBe(false)
  expect(await verifyReleaseWarmRequest(req(body,'/api/narration/ensure'),key,now)).toBe(false)
})
