// @vitest-environment jsdom
import { beforeEach,afterEach,describe,it,expect,vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
const mocks=vi.hoisted(()=>({
 open:vi.fn(),close:vi.fn(),info:vi.fn(),launch:vi.fn(),listener:vi.fn(),assign:vi.fn(),
}))
vi.mock('@capacitor/app',()=>({App:{getInfo:mocks.info,getLaunchUrl:mocks.launch,addListener:mocks.listener}}))
vi.mock('@capacitor/browser',()=>({Browser:{open:mocks.open,close:mocks.close}}))
beforeEach(()=>{
 vi.resetModules();vi.clearAllMocks();localStorage.clear();sessionStorage.clear()
 mocks.info.mockResolvedValue({id:'app.tinct.reader.review'});mocks.launch.mockResolvedValue(undefined)
 mocks.listener.mockResolvedValue({remove:vi.fn()});mocks.open.mockResolvedValue(undefined);mocks.close.mockResolvedValue(undefined)
 vi.stubGlobal('window',{Capacitor:{isNativePlatform:()=>true},location:{pathname:'/lab/sign-in/index.html',assign:mocks.assign,replace:mocks.assign}})
})
afterEach(()=>vi.unstubAllGlobals())
function client(){
 return {auth:{signInWithOAuth:vi.fn().mockResolvedValue({data:{url:'https://auth.example.test/authorize'},error:null}),exchangeCodeForSession:vi.fn().mockResolvedValue({data:{session:{user:{id:'reader'}}},error:null})}} as unknown as SupabaseClient
}
describe('native OAuth bridge',()=>{
 it('opens an external provider and consumes a matching PKCE return only once',async()=>{
  const api=await import('./nativeAuth'),c=client()
  expect(await api.startNativeOAuth(c,'google','/reader')).toBe(true)
  const call=vi.mocked(c.auth.signInWithOAuth).mock.calls[0][0]
  expect(call.options?.skipBrowserRedirect).toBe(true)
  expect(call.options?.redirectTo).toMatch(/^app.tinct.reader.review:\/\/auth\/callback\?flow=/)
  expect(mocks.open).toHaveBeenCalledWith({url:'https://auth.example.test/authorize'})
  const callback=call.options!.redirectTo+'&code=test-code'
  expect(await api.handleNativeAuthReturn(c,callback,'app.tinct.reader.review')).toBe(true)
  expect(c.auth.exchangeCodeForSession).toHaveBeenCalledExactlyOnceWith('test-code')
  expect(mocks.assign).toHaveBeenCalledWith('/lab/sign-in/index.html?returnTo=%2Freader&native-return=1')
  expect(await api.handleNativeAuthReturn(c,callback,'app.tinct.reader.review')).toBe(false)
 })
 it('moves off the mounted reader before any account exchange',async()=>{
  vi.stubGlobal('window',{Capacitor:{isNativePlatform:()=>true},location:{pathname:'/reader',assign:mocks.assign,replace:mocks.assign}})
  const api=await import('./nativeAuth'),c=client()
  const redirect=await api.authRedirectTo(c,'/reader','oauth','unused')
  expect(await api.handleNativeAuthReturn(c,redirect+'&code=deferred-code','app.tinct.reader.review')).toBe(true)
  expect(c.auth.exchangeCodeForSession).not.toHaveBeenCalled()
  expect(sessionStorage.getItem('tinct:native-auth-return')).toContain('code=deferred-code')
  expect(localStorage.getItem('tinct:native-auth-pending')).not.toBeNull()
  expect(mocks.assign).toHaveBeenCalledWith('/lab/sign-in/index.html?returnTo=%2Freader')
 })
 it('ignores a callback for another installation without exchanging a code',async()=>{
  const api=await import('./nativeAuth'),c=client()
  const redirect=await api.authRedirectTo(c,'/reader','oauth','unused')
  expect(await api.handleNativeAuthReturn(c,redirect.replace('.review','')+'&code=test','app.tinct.reader.review')).toBe(false)
  expect(c.auth.exchangeCodeForSession).not.toHaveBeenCalled()
 })
 it('registers warm launch handling and processes a cold launch',async()=>{
  const model=await import('./nativeAuthReturn'),c=client()
  const pending=model.nativeAuthPending('app.tinct.reader.review','abcdefghijklmnop','/reader','oauth',Date.now())
  localStorage.setItem(model.NATIVE_AUTH_PENDING,JSON.stringify(pending))
  mocks.launch.mockResolvedValue({url:model.nativeAuthRedirect(pending)+'&code=cold-code'})
  const api=await import('./nativeAuth');await api.installNativeAuth(c)
  expect(mocks.listener).toHaveBeenCalledWith('appUrlOpen',expect.any(Function))
  expect(c.auth.exchangeCodeForSession).toHaveBeenCalledWith('cold-code')
 })
 it('keeps failure details and tokens out of the user-facing URL',async()=>{
  const api=await import('./nativeAuth'),c=client()
  vi.mocked(c.auth.exchangeCodeForSession).mockRejectedValue(new Error('sensitive-provider-details'))
  const redirect=await api.authRedirectTo(c,'/reader','oauth','unused')
  await api.handleNativeAuthReturn(c,redirect+'&code=private-code','app.tinct.reader.review')
  expect(mocks.assign).toHaveBeenCalledWith('/lab/sign-in/index.html?returnTo=%2Freader&native-error=1')
  expect(api.consumeNativeAuthNotice()).toBe('Sign-in could not be completed. Please try again.')
  expect(api.consumeNativeAuthNotice()).toBeNull()
 })
 it('leaves normal website OAuth and redirect URLs unchanged',async()=>{
  vi.stubGlobal('window',{Capacitor:{isNativePlatform:()=>false}})
  const api=await import('./nativeAuth'),c=client()
  expect(await api.startNativeOAuth(c,'google','/reader')).toBe(false)
  expect(await api.authRedirectTo(c,'/reader','reset','https://tinct.app/reset')).toBe('https://tinct.app/reset')
  expect(mocks.info).not.toHaveBeenCalled()
 })
})
