// Internal traffic: Tinct's own testing marks itself instead of counting as readers.
// `?internal=1` on any page sets the device flag, `?internal=0` clears it; the parameter is
// removed from the address straight away so a shared link never carries it. While the flag
// is set, funnel events carry `internal: true`, AI and narration requests send
// `x-tinct-check: 1` (the Worker's cost log stores those under its `check` key). Nothing visible
// marks the device: the on-screen "internal" badge was removed on 2026-10-09. Automated checks set the same flag
// (app/scripts/lib/internalTraffic.cjs). Shared by the reader bundle (src/utils/internalTraffic.ts)
// and the plain pages (library, sign-in, about, story, Add a book), like display-profile.js.
export const INTERNAL_KEY='tinct:internal'
export const INTERNAL_PARAM='internal'
export const CHECK_HEADER='x-tinct-check'

export function isInternal(storage){
 try{return (storage||localStorage).getItem(INTERNAL_KEY)==='1'}catch{return false}
}
export function setInternal(enabled,storage){
 try{const store=storage||localStorage;if(enabled)store.setItem(INTERNAL_KEY,'1');else store.removeItem(INTERNAL_KEY)}catch{}
}
/** Extra request headers for AI and narration routes: the check marker while the flag is set. */
export function internalHeaders(storage){
 return isInternal(storage)?{[CHECK_HEADER]:'1'}:{}
}
/** Reads `internal=1|0` from the address, applies it and strips it. Returns whether the flag is now set. */
export function applyInternalFromUrl(win){
 const w=win||(typeof window!=='undefined'?window:null)
 if(!w)return false
 let storage
 try{storage=w.localStorage}catch{storage=null}
 try{
  const url=new URL(w.location.href)
  if(url.searchParams.has(INTERNAL_PARAM)){
   const value=url.searchParams.get(INTERNAL_PARAM)
   if(value==='1')setInternal(true,storage||undefined)
   else if(value==='0')setInternal(false,storage||undefined)
   url.searchParams.delete(INTERNAL_PARAM)
   w.history.replaceState(w.history.state,'',url.pathname+url.search+url.hash)
  }
 }catch{}
 return storage?isInternal(storage):false
}
let started=false
export function initInternalTraffic(win){
 const w=win||window
 const enabled=applyInternalFromUrl(w)
 if(started&&!win)return enabled
 if(!win)started=true
 return enabled
}
if(typeof window!=='undefined'&&typeof document!=='undefined'&&!window.__tinctNoInternalAuto)initInternalTraffic()
