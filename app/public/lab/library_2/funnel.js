// Library funnel: landing_view, pageview and visible-time durations for /library.
// Same wire format and rules as src/utils/funnel.ts (which the reader uses): events are queued
// and sent to /api/events with sendBeacon, fire and forget, never blocking the page. Only an
// anonymous device id, a per-tab session id and the page path are sent.
// Off on localhost and in automated browsers so QA runs do not pollute the numbers.
const DEVICE_KEY='tinct-lab-device-id',SESSION_KEY='tinct-funnel-session',ONCE_KEY='tinct:funnel-once';
const FLUSH_MS=4000,BEAT_MS=30000,BATCH=10,ATTRIBUTION=['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
const newId=()=>{try{if(crypto.randomUUID)return crypto.randomUUID();}catch{}return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`.padEnd(16,'0');};
const memory={device:null,session:null,once:new Set()};
function stored(store,key,make){try{let v=store.getItem(key);if(!v){v=make();store.setItem(key,v);}return v;}catch{return null;}}
export const deviceId=()=>stored(localStorage,DEVICE_KEY,newId)||(memory.device??=newId());
export const sessionId=()=>(stored(sessionStorage,SESSION_KEY,()=>newId().replace(/-/g,''))||(memory.session??=newId().replace(/-/g,''))).replace(/-/g,'');
function attribution(){
  const params=new URLSearchParams(location.search),touch={};
  for(const key of ATTRIBUTION)if(params.get(key))touch[key]=params.get(key).slice(0,120);
  if(document.referrer)touch.landing_referrer=document.referrer.slice(0,200);
  touch.landing_path=location.pathname;
  return {last_touch:touch};
}
export function createLibraryFunnel(deps){
  let queue=[],timer=null,beat=null,visibleSince=null;
  const flush=()=>{
    if(timer!==null){clearTimeout(timer);timer=null;}
    while(queue.length){
      const events=queue.splice(0,20);
      try{deps.send(JSON.stringify({deviceId:deps.deviceId(),sessionId:deps.sessionId(),surface:'library',path:deps.path(),referrer:deps.referrer(),attribution:deps.attribution(),events}));}catch{}
    }
  };
  const track=(name,props={})=>{
    try{
      if(!deps.enabled())return;
      queue.push({name,props});
      if(queue.length>=BATCH)flush();else if(timer===null)timer=setTimeout(flush,FLUSH_MS);
    }catch{}
  };
  const once=(name,props)=>{try{if(!deps.enabled()||deps.once.has(name))return;deps.once.add(name);track(name,props);}catch{}};
  const takeVisible=()=>{const now=deps.now(),ms=visibleSince===null?0:now-visibleSince;if(visibleSince!==null)visibleSince=now;return ms;};
  const duration=()=>{const ms=takeVisible();if(ms>=1000)track('page_duration',{duration_ms:Math.round(ms)});};
  const visibility=visible=>{try{if(visible){if(visibleSince===null)visibleSince=deps.now();return;}duration();visibleSince=null;flush();}catch{}};
  const start=()=>{
    try{
      if(!deps.enabled())return;
      track('pageview');
      // The first funnel step: someone reached the library. Counted once per tab session, not per reload.
      if(!deps.sessionSeen.has('landing_view')){deps.sessionSeen.add('landing_view');track('landing_view');}
      visibleSince=deps.visible()?deps.now():null;
      beat=setInterval(duration,BEAT_MS);
    }catch{}
  };
  return {track,once,flush,start,visibility,stop(){if(beat!==null)clearInterval(beat);beat=null;}};
}
function browserDeps(){
  const seen=new Set();
  return {
    enabled:()=>!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)&&!navigator.webdriver,
    deviceId,sessionId,path:()=>location.pathname,referrer:()=>document.referrer,attribution,
    visible:()=>document.visibilityState!=='hidden',now:()=>Date.now(),
    sessionSeen:{has:n=>{try{return sessionStorage.getItem('tinct-funnel-seen-'+n)==='1'||seen.has(n);}catch{return seen.has(n);}},add:n=>{seen.add(n);try{sessionStorage.setItem('tinct-funnel-seen-'+n,'1');}catch{}}},
    once:{has:n=>{try{return JSON.parse(localStorage.getItem(ONCE_KEY)||'[]').includes(n);}catch{return memory.once.has(n);}},add:n=>{memory.once.add(n);try{const l=JSON.parse(localStorage.getItem(ONCE_KEY)||'[]');if(!l.includes(n))localStorage.setItem(ONCE_KEY,JSON.stringify([...l,n]));}catch{}}},
    send:body=>{
      const url='/api/events';
      if(typeof navigator.sendBeacon==='function'&&navigator.sendBeacon(url,new Blob([body],{type:'text/plain;charset=UTF-8'})))return;
      fetch(url,{method:'POST',keepalive:true,body,headers:{'Content-Type':'text/plain;charset=UTF-8'}}).catch(()=>{});
    },
  };
}
export function startLibraryFunnel(){
  const client=createLibraryFunnel(browserDeps());
  document.addEventListener('visibilitychange',()=>client.visibility(document.visibilityState!=='hidden'));
  addEventListener('pagehide',()=>client.visibility(false));
  client.start();
  return client;
}
if(typeof window!=='undefined'&&typeof document!=='undefined'&&!window.__tinctNoFunnel)startLibraryFunnel();
