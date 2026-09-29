const KEY='tinct:display-profile'
export function readEinkProfile(){
 try { const query=new URLSearchParams(location.search).get('eink');if(query==='1'||query==='0')return query==='1';return localStorage.getItem(KEY)==='eink' } catch { return false }
}
export function applyEinkProfile(enabled){
 document.documentElement.toggleAttribute('data-eink',enabled)
 if(enabled)document.documentElement.setAttribute('data-eink','true')
 if(window.__TINCT_PLATFORM)window.__TINCT_PLATFORM.isEink=enabled
 window.dispatchEvent(new CustomEvent('tinct:display-profile',{detail:{eink:enabled}}))
}
export function setEinkProfile(enabled){
 try{localStorage.setItem(KEY,enabled?'eink':'normal');const url=new URL(location.href);if(url.searchParams.has('eink')){url.searchParams.delete('eink');history.replaceState(history.state,'',url)}}catch{}
 applyEinkProfile(enabled)
}
if(typeof document!=='undefined'){
 if(!document.querySelector('link[data-display-profile]')){
  const style=document.createElement('link');style.rel='stylesheet';style.href='/lab/display-profile.css';style.dataset.displayProfile='';document.head.appendChild(style)
 }
 const query=new URLSearchParams(location.search).get('eink')
 if(query==='1'||query==='0')setEinkProfile(query==='1');else applyEinkProfile(readEinkProfile())
 addEventListener('storage',event=>{if(event.key===KEY)applyEinkProfile(readEinkProfile())})
}
