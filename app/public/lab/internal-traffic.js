// Internal traffic: Tinct's own testing marks itself instead of counting as readers.
// `?internal=1` on any page sets the device flag, `?internal=0` clears it; the parameter is
// removed from the address straight away so a shared link never carries it. While the flag
// is set, funnel events carry `internal: true`, AI and narration requests send
// `x-tinct-check: 1` (the Worker's cost log stores those under its `check` key), and a tiny
// "internal" badge sits at the edge of the screen. Automated checks set the same flag
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
const BADGE_ATTR='data-tinct-internal-badge'
/** Shows or removes the badge. Vertical text in the right-hand edge strip: never over text or controls.
 * System monospace only: loading a web font after the reader has paged re-lays out the desktop
 * Compare spread (chapter-preview check, 2026-10-06). */
export function syncInternalBadge(doc,enabled){
 try{
  const d=doc||document
  const existing=d.querySelector('['+BADGE_ATTR+']')
  if(!enabled){existing?.remove();return null}
  if(existing)return existing
  if(!d.body)return null
  const badge=d.createElement('div')
  badge.setAttribute(BADGE_ATTR,'')
  badge.setAttribute('role','note')
  badge.setAttribute('aria-label','internal')
  badge.textContent='internal'
  badge.style.cssText='position:fixed;right:max(1px,env(safe-area-inset-right));top:28%;writing-mode:vertical-rl;z-index:2147483646;pointer-events:none;user-select:none;-webkit-user-select:none;font:10px/1 ui-monospace,monospace;letter-spacing:.06em;color:#8b8778;opacity:.55;margin:0;padding:0'
  d.body.appendChild(badge)
  return badge
 }catch{return null}
}
let started=false
export function initInternalTraffic(win){
 const w=win||window
 const enabled=applyInternalFromUrl(w)
 if(started&&!win)return enabled
 if(!win)started=true
 const d=w.document
 const show=()=>syncInternalBadge(d,isInternal(w.localStorage))
 if(d.body)show();else d.addEventListener('DOMContentLoaded',show,{once:true})
 try{w.addEventListener('storage',event=>{if(event.key===INTERNAL_KEY||event.key===null)show()})}catch{}
 return enabled
}
if(typeof window!=='undefined'&&typeof document!=='undefined'&&!window.__tinctNoInternalAuto)initInternalTraffic()
