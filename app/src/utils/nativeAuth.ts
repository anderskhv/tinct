import { nativeAuthStorage } from './nativeAuthStorage'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isNativeCapacitor } from './nativePlatform'
import { NATIVE_AUTH_PENDING, NATIVE_AUTH_NOTICE, nativeAuthPending, nativeAuthRedirect, parseNativeAuthReturn, nativeAuthLanding, type NativeAuthPending, type NativeAuthKind } from './nativeAuthReturn'

let installation: Promise<void> | null=null
let handling=false
function trace(stage:string,detail:Record<string,unknown>={}):void {
 if(import.meta.env.VITE_NATIVE_AUTH_DIAGNOSTICS!=='1')return
 const target=window as unknown as {__nativeAuthTrace?:unknown[]}
 const history=target.__nativeAuthTrace??=[]
 history.push({stage,time:Date.now(),path:window.location.pathname,...detail})
 if(history.length>32)history.shift()
}
const DEFERRED_RETURN='tinct:native-auth-return'
async function readPending():Promise<NativeAuthPending|null> {
  const saved=await nativeAuthStorage.getItem(NATIVE_AUTH_PENDING)
  try {return JSON.parse(saved??'null')}catch{return null}
}
/** PKCE returns only a short-lived code; tokens never enter app URLs or logs. */
export async function handleNativeAuthReturn(client:SupabaseClient,raw:string,appId:string):Promise<boolean> {
  trace('pending-read-start',{handling})
  const pending=await readPending()
  trace('pending-read-done',{present:!!pending,handling})
  const result=parseNativeAuthReturn(raw,pending,appId,Date.now())
  trace('return-parsed',{valid:!!result,error:result?.error,handling})
  if(!result || handling)return false
  handling=true
  // Stop the old reader before changing accounts. Exchanging on its mounted
  // page could let auth listeners persist that reader's state for a new user.
  if(!['/lab/sign-in','/lab/sign-in/','/lab/sign-in/index.html'].includes(window.location.pathname)){
    sessionStorage.setItem(DEFERRED_RETURN,raw)
    const query=new URLSearchParams({returnTo:result.pending.returnTo})
    trace('deferred-navigation')
    window.location.replace('/lab/sign-in/index.html?'+query)
    return true
  }
  // Claim once before exchanging: warm and cold launch events can both arrive.
  trace('claim-start')
  await nativeAuthStorage.removeItem(NATIVE_AUTH_PENDING)
  trace('claim-done')
  let failed=result.error
  try {
    if(!failed){
      const {data,error}=await client.auth.exchangeCodeForSession(result.code)
      failed=Boolean(error || !data.session)
    }
  } catch {failed=true}
  if(failed)localStorage.setItem(NATIVE_AUTH_NOTICE,'Sign-in could not be completed. Please try again.')
  else localStorage.removeItem(NATIVE_AUTH_NOTICE)
  try {const {Browser}=await import('@capacitor/browser');await Browser.close()}catch{/* Returning to this activity already closes most custom tabs. */}
  trace('landing-navigation',{failed})
  window.location.assign(nativeAuthLanding(result.pending,failed))
  handling=false
  return true
}
export function installNativeAuth(client:SupabaseClient):Promise<void> {
  if(!isNativeCapacitor())return Promise.resolve()
  if(!installation)installation=(async()=>{
    trace('install-start')
    const {App}=await import('@capacitor/app')
    const {id}=await App.getInfo()
    trace('app-info')
    await App.addListener('appUrlOpen',event=>{void handleNativeAuthReturn(client,event.url,id)})
    const deferred=sessionStorage.getItem(DEFERRED_RETURN)
    sessionStorage.removeItem(DEFERRED_RETURN)
    trace('deferred-read',{present:!!deferred})
    if(deferred)await handleNativeAuthReturn(client,deferred,id)
    const launch=await App.getLaunchUrl()
    trace('launch-read',{present:!!launch?.url})
    if(launch?.url)await handleNativeAuthReturn(client,launch.url,id)
    trace('install-done')
  })().catch(error=>{installation=null;throw error})
  return installation
}
export async function authRedirectTo(client:SupabaseClient,returnTo:string,kind:NativeAuthKind,webRedirect:string):Promise<string> {
  if(!isNativeCapacitor())return webRedirect
  await installNativeAuth(client)
  const {App}=await import('@capacitor/app')
  const {id}=await App.getInfo()
  const pending=nativeAuthPending(id,crypto.randomUUID(),returnTo,kind,Date.now())
  await nativeAuthStorage.setItem(NATIVE_AUTH_PENDING,JSON.stringify(pending))
  return nativeAuthRedirect(pending)
}
export async function startNativeOAuth(client:SupabaseClient,provider:'google'|'apple'|'github',returnTo:string):Promise<boolean> {
  if(!isNativeCapacitor())return false
  const redirectTo=await authRedirectTo(client,returnTo,'oauth','')
  try {
    const {data,error}=await client.auth.signInWithOAuth({provider,options:{redirectTo,skipBrowserRedirect:true}})
    if(error)throw error
    if(!data.url || new URL(data.url).protocol!=='https:')throw new Error('Sign-in is temporarily unavailable.')
    const {Browser}=await import('@capacitor/browser')
    await Browser.open({url:data.url})
    return true
  }catch(error){await nativeAuthStorage.removeItem(NATIVE_AUTH_PENDING);throw error}
}
export function consumeNativeAuthNotice(search=window.location.search):string|null {
  // The intermediate account page may finish initializing before Browser.close
  // returns and the final landing navigation occurs. It must not consume the
  // final page's notice or expose a transient "finished" sign-in state.
  if(!isNativeCapacitor() || new URLSearchParams(search).get('native-error')!=='1')return null
  const notice=localStorage.getItem(NATIVE_AUTH_NOTICE)
  localStorage.removeItem(NATIVE_AUTH_NOTICE)
  return notice || 'Sign-in could not be completed. Please try again.'
}
