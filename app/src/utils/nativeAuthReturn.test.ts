// @vitest-environment jsdom
import { describe,it,expect } from 'vitest'
import { nativeAuthPending,nativeAuthRedirect,parseNativeAuthReturn,nativeAuthLanding } from './nativeAuthReturn'
const now=1_000_000,nonce='0123456789abcdef',id='app.tinct.reader.review'
describe('native auth returns',()=>{
 it('keeps the review app separate and the reading destination local',()=>{
  const p=nativeAuthPending(id,nonce,'/reader?book=frankenstein','oauth',now)
  expect(nativeAuthRedirect(p)).toBe(id+'://auth/callback?flow='+nonce)
  expect(nativeAuthLanding(p)).toContain('returnTo=%2Freader%3Fbook%3Dfrankenstein')
  expect(nativeAuthPending(id,nonce,'https://other.test/reader','oauth',now).returnTo).toBe('/lab/library')
 })
 it('accepts only a matching, unexpired app/code/flow',()=>{
  const p=nativeAuthPending(id,nonce,'/reader','oauth',now)
  const url=nativeAuthRedirect(p)+'&code=short-lived-code'
  expect(parseNativeAuthReturn(url,p,id,now)?.code).toBe('short-lived-code')
  for(const bad of [
   url.replace(id,'app.tinct.reader'),url.replace('/callback','/elsewhere'),
   url.replace(nonce,'another-flow'),url+'&x=1#access_token=secret',
   url.replace('auth/','user@auth/'),url.replace('auth/','auth:123/'),
  ])expect(parseNativeAuthReturn(bad,p,id,now)).toBeNull()
  expect(parseNativeAuthReturn(url,p,id,p.expires)).toBeNull()
  expect(parseNativeAuthReturn(url,null,id,now)).toBeNull()
 })
 it('does not accept implicit token URLs or empty callbacks',()=>{
  const p=nativeAuthPending(id,nonce,'/reader','oauth',now)
  expect(parseNativeAuthReturn(nativeAuthRedirect(p),p,id,now)).toBeNull()
  expect(parseNativeAuthReturn(nativeAuthRedirect(p)+'#access_token=secret&refresh_token=secret',p,id,now)).toBeNull()
 })
 it('returns password recovery to its form and uses a generic error landing',()=>{
  const p=nativeAuthPending(id,nonce,'/reader','reset',now)
  expect(nativeAuthLanding(p)).toContain('mode=reset')
  expect(nativeAuthLanding(p,true)).toContain('native-error=1')
  expect(parseNativeAuthReturn(nativeAuthRedirect(p)+'&error=access_denied',p,id,now)?.error).toBe(true)
 })
})
