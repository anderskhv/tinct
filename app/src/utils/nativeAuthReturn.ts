import { safeLabReturnTo } from '../lab/labSignInReturn'
export const NATIVE_AUTH_PENDING = 'tinct:native-auth-pending'
export const NATIVE_AUTH_NOTICE = 'tinct:native-auth-notice'
export type NativeAuthKind = 'oauth' | 'signup' | 'reset'
export interface NativeAuthPending { appId: string; nonce: string; returnTo: string; kind: NativeAuthKind; expires: number }
export function nativeAuthPending(appId: string, nonce: string, returnTo: string, kind: NativeAuthKind, now: number): NativeAuthPending {
  if (!['app.tinct.reader','app.tinct.reader.review'].includes(appId) || !/^[a-zA-Z0-9_-]{16,80}$/.test(nonce)) throw new Error('Unsupported app sign-in')
  return {appId,nonce,returnTo:safeLabReturnTo(returnTo),kind,expires:now+(kind==='oauth'?15*60_000:24*60*60_000)}
}
export function nativeAuthRedirect(pending: NativeAuthPending): string {
  return pending.appId+'://auth/callback?flow='+encodeURIComponent(pending.nonce)
}
export function parseNativeAuthReturn(raw: string, pending: NativeAuthPending | null, appId: string, now: number): {code:string; pending:NativeAuthPending; error:boolean} | null {
  if (!pending || pending.appId!==appId || !Number.isFinite(pending.expires) || pending.expires<=now) return null
  try {
    const url=new URL(raw)
    if(url.protocol!==appId+':' || url.hostname!=='auth' || url.pathname!=='/callback' || url.username || url.password || url.port || url.searchParams.get('flow')!==pending.nonce)return null
    const code=url.searchParams.get('code')??''
    const fragment=new URLSearchParams(url.hash.slice(1))
    if(fragment.has('access_token') || fragment.has('refresh_token'))return null
    const fragmentError=fragment.has('error') || fragment.has('error_code')
    if(url.hash && !fragmentError)return null
    const error=url.searchParams.has('error') || url.searchParams.has('error_code') || fragmentError
    if(!error && (!code || code.length>4096))return null
    return {code,pending,error}
  } catch {return null}
}
export function nativeAuthLanding(pending: NativeAuthPending, failed=false): string {
  const query=new URLSearchParams({returnTo:safeLabReturnTo(pending.returnTo)})
  if(failed)query.set('native-error','1')
  else if(pending.kind==='reset')query.set('mode','reset')
  else query.set('native-return','1')
  return '/lab/sign-in/index.html?'+query
}
