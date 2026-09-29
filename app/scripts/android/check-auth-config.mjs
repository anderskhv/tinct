import crypto from 'node:crypto'
import fs from 'node:fs/promises'
const endpoint='https://yazjyiqsxjystvpkyouk.supabase.co/auth/v1'
const results=[]
for(const appId of ['app.tinct.reader.review','app.tinct.reader']){
 const flow=crypto.randomUUID()
 const destination=appId+'://auth/callback?flow='+flow
 try {
  // Start and immediately cancel a public OAuth flow: no Google page, account,
  // credentials, email, token exchange or private reader data is involved.
  const authorize=new URL(endpoint+'/authorize')
  authorize.search=new URLSearchParams({provider:'google',redirect_to:destination,code_challenge:crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('base64url'),code_challenge_method:'s256'})
  const start=await fetch(authorize,{redirect:'manual',signal:AbortSignal.timeout(15000)})
  const location=start.headers.get('location')
  if(!location)throw Error('Authorization redirect unavailable: HTTP '+start.status)
  const state=new URL(location).searchParams.get('state')
  if(!state)throw Error('Authorization state unavailable')
  const cancel=new URL(endpoint+'/callback')
  cancel.search=new URLSearchParams({state,error:'access_denied',error_description:'Native redirect configuration check cancelled before sign-in'})
  const returned=await fetch(cancel,{redirect:'manual',signal:AbortSignal.timeout(15000)})
  const landing=new URL(returned.headers.get('location')||'https://missing.invalid')
  const allowed=landing.protocol===appId+':'&&landing.hostname==='auth'&&landing.pathname==='/callback'&&landing.searchParams.get('flow')===flow
  results.push({appId,allowed,httpStatus:returned.status,returnedScheme:landing.protocol,returnedHost:landing.hostname})
 }catch(error){results.push({appId,allowed:false,error:error.message})}
}
await fs.mkdir('artifacts/android',{recursive:true})
await fs.writeFile('artifacts/android/native-auth-configuration.json',JSON.stringify({providerLoginTested:false,redirectAllowlist:results},null,2))
console.log(JSON.stringify({nativeAuthConfiguration:results}))
