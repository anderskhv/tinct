import type { SupabaseClient } from '@supabase/supabase-js'
import { isNativeCapacitor } from './nativePlatform'
import { NATIVE_AUTH_PENDING, NATIVE_AUTH_NOTICE, nativeAuthPending, nativeAuthRedirect, parseNativeAuthReturn, nativeAuthLanding, type NativeAuthPending, type NativeAuthKind } from './nativeAuthReturn'

let installation: Promise<void> | null=null
let handling=false
const DEFERRED_RETURN='tinct:native-auth-return'
function readPending():NativeAuthPending|null {
  try {return JSON.parse(localStorage.getItem(NATIVE_AUTH_PENDING)??'null')}catch{return null}
}
/** PKCE returns only a short-lived code; tokens never enter app URLs or logs. */
export async function handleNativeAuthReturn(client:SupabaseClient,raw:string,appId:string):Promise<boolean> {
  const result=parseNativeAuthReturn(raw,readPending(),appId,Date.now())
  if(!result || handling)return false
  handling=true
  // Stop the old reader before changing accounts. Exchanging on its mounted
  // page could let auth listeners persist that reader's state for a new user.
  if(!['/lab/sign-in','/lab/sign-in/','/lab/sign-in/index.html'].includes(window.location.pathname)){
    sessionStorage.setItem(DEFERRED_RETURN,raw)
    const query=new URLSearchParams({returnTo:result.pending.returnTo})
    window.location.replace('/lab/sign-in/index.html?'+query)
    return true
  }
  // Claim once before exchanging: warm and cold launch events can both arrive.
  localStorage.removeItem(NATIVE_AUTH_PENDING)
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
  window.location.assign(nativeAuthLanding(result.pending,failed))
  handling=false
  return true
}
export function installNativeAuth(client:SupabaseClient):Promise<void> {
  if(!isNativeCapacitor())return Promise.resolve()
  if(!installation)installation=(async()=>{
    const {App}=await import('@capacitor/app')
    const {id}=await App.getInfo()
    await App.addListener('appUrlOpen',event=>{void handleNativeAuthReturn(client,event.url,id)})
    const deferred=sessionStorage.getItem(DEFERRED_RETURN)
    sessionStorage.removeItem(DEFERRED_RETURN)
    if(deferred)await handleNativeAuthReturn(client,deferred,id)
    const launch=await App.getLaunchUrl()
    if(launch?.url)await handleNativeAuthReturn(client,launch.url,id)
  })().catch(error=>{installation=null;throw error})
  return installation
}
export async function authRedirectTo(client:SupabaseClient,returnTo:string,kind:NativeAuthKind,webRedirect:string):Promise<string> {
  if(!isNativeCapacitor())return webRedirect
  await installNativeAuth(client)
  const {App}=await import('@capacitor/app')
  const {id}=await App.getInfo()
  const pending=nativeAuthPending(id,crypto.randomUUID(),returnTo,kind,Date.now())
  localStorage.setItem(NATIVE_AUTH_PENDING,JSON.stringify(pending))
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
  }catch(error){localStorage.removeItem(NATIVE_AUTH_PENDING);throw error}
}
export function consumeNativeAuthNotice():string|null {
  if(!isNativeCapacitor())return null
  const notice=localStorage.getItem(NATIVE_AUTH_NOTICE)
  localStorage.removeItem(NATIVE_AUTH_NOTICE)
  return notice
}
