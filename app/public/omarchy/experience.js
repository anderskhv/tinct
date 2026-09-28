// Shared by the real library, reader and account app. No alternate reader or account.
const KEY = 'tinct:desktop-appearance:v1';
const CACHE = 'tinct:omarchy-palette:v1';
const root = document.documentElement;
const MODES = ['tinct', 'omarchy', 'persia'];
const FALLBACK = { name:'Omarchy', background:'#1a1b26', foreground:'#c0caf5', accent:'#7aa2f7' };
const PERSIA = { name:'Prince of Persia', background:'#10172f', foreground:'#f3e5c4', accent:'#d6ad62', paper:'#f2e3bf', ink:'#26233b' };
function stored(key) { try { return localStorage.getItem(key); } catch { return null; } }
function save(key,value) { try { localStorage.setItem(key,value); } catch {} }
function color(value) { return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value); }
function luminance(hex) {
  const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
}
export function validPalette(p) {
  if (!p || !color(p.background) || !color(p.foreground) || !color(p.accent)) return null;
  const contrast=(Math.max(luminance(p.background),luminance(p.foreground))+.05)/(Math.min(luminance(p.background),luminance(p.foreground))+.05);
  return { name:typeof p.name==='string'?p.name.slice(0,80):'Omarchy', background:p.background,
    foreground:contrast>=4.5?p.foreground:luminance(p.background)>.179?'#111111':'#f5f5f5', accent:p.accent };
}
let mode=stored(KEY) || (new URLSearchParams(location.search).get('omarchy')==='1'?'omarchy':'tinct');
if (!MODES.includes(mode)) mode='tinct';
// The installation hint is remembered locally, never written to synced reader preferences.
if (mode!=='tinct') save(KEY,mode);
let palette=FALLBACK;
try { palette=validPalette(JSON.parse(stored(CACHE))) || FALLBACK; } catch {}
let status='', timer=0, request=null, generation=0;
const style=document.createElement('link'); style.rel='stylesheet'; style.href='/omarchy/experience.css?v=20260928-1'; document.head.append(style);

function apply() {
  if (mode==='tinct' || root.dataset.eink==='true') {
    delete root.dataset.tinctTheme; delete root.dataset.tinctReaderDark;
    for(const key of ['bg','fg','accent','paper','ink','paper-rgb'])root.style.removeProperty('--tinct-'+key);
  } else {
    const p=mode==='persia'?PERSIA:palette, paper=p.paper||p.background, ink=p.ink||p.foreground;
    root.dataset.tinctTheme=mode;
    root.dataset.tinctReaderDark=String(luminance(paper)<.179);
    for (const [key,value] of Object.entries({bg:p.background,fg:p.foreground,accent:p.accent,paper,ink,
      'paper-rgb':paper.slice(1).match(/../g).map(v=>parseInt(v,16)).join(', ')})) root.style.setProperty('--tinct-'+key,value);
  }
  window.dispatchEvent(new Event('tinct:appearance'));
  updateStatus();
}
async function syncTheme() {
  clearTimeout(timer);
  if (mode!=='omarchy' || document.hidden || request) return;
  const epoch=generation, controller=new AbortController(); request=controller;
  const timeout=setTimeout(()=>controller.abort(),4000);
  try {
    const response=await fetch('http://127.0.0.1:47653/theme', {
      mode:'cors', credentials:'omit', cache:'no-store', signal:controller.signal, targetAddressSpace:'loopback',
    });
    if (!response.ok) throw new Error('Theme connection unavailable');
    const next=validPalette(await response.json());
    if (!next) throw new Error('Invalid palette');
    if (epoch!==generation || mode!=='omarchy') return;
    palette=next; save(CACHE,JSON.stringify(next)); status='Following '+next.name; apply();
  } catch {
    if (epoch===generation && mode==='omarchy') {
      status='Theme connection unavailable. Start Tinct from Omarchy and allow its local theme connection.'; updateStatus();
    }
  } finally {
    clearTimeout(timeout); if(request===controller)request=null;
    if(mode==='omarchy')timer=setTimeout(syncTheme, status.startsWith('Following')?2500:15000);
  }
}
function selectTheme(next) {
  if(!MODES.includes(next))return;
  generation++; request?.abort(); clearTimeout(timer); mode=next; save(KEY,mode); status=''; apply();
  if(mode==='omarchy') { if(request) setTimeout(syncTheme,0); else void syncTheme(); }
}
window.addEventListener('tinct:appearance-reset',()=>selectTheme('tinct'));
window.addEventListener('storage',e=>{if(e.key===KEY){mode=MODES.includes(e.newValue)?e.newValue:'tinct';generation++;request?.abort();apply();if(mode==='omarchy')setTimeout(syncTheme,0);}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void syncTheme();else clearTimeout(timer);});

export function registerCommands(config) { window.__tinctDesktopCommands=config; }
function registry() { return window.__tinctDesktopCommands || {commands:[{id:'library',label:'Open the library',key:'l',run:()=>location.assign('/library')}],blocked:()=>false}; }
export function typing(event) {
  return event.composedPath().some(n=>n instanceof HTMLElement &&
    (n.isContentEditable || n.matches('input,textarea,select,[role="textbox"],[role="combobox"]')));
}
export function eligibleShortcut(event) {
  return !event.defaultPrevented && !event.isComposing && !event.repeat && (!event.shiftKey || event.key==='?') && !event.altKey && !event.ctrlKey && !event.metaKey && !typing(event);
}
let host=null, shadow=null, dialog=null, input=null, results=null, themeSelect=null, connection=null, restoreFocus=null, filtered=[],selected=0;
function node(tag,text,className) { const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n; }
function commands() {
  return [...registry().commands,
    {id:'theme-omarchy',label:'Theme · Follow Omarchy',run:()=>selectTheme('omarchy')},
    {id:'theme-persia',label:'Theme · Prince of Persia',run:()=>selectTheme('persia')},
    {id:'theme-tinct',label:'Use Tinct appearance',run:()=>selectTheme('tinct')},
  ];
}
function updateStatus() {
  if(themeSelect)themeSelect.value=mode;
  if(connection)connection.textContent=mode==='omarchy'?status||'Connecting to your Omarchy theme…':mode==='persia'?'Prince of Persia · midnight, sandstone and gold':'Your usual Tinct appearance';
}
function build() {
  if(host)return;
  host=node('div');host.id='tinct-commands';shadow=host.attachShadow({mode:'open'});
  const css=node('style');css.textContent=`
    :host{position:relative;z-index:2147483646;font-family:system-ui,sans-serif;color-scheme:dark}
    *{box-sizing:border-box}dialog{position:fixed;inset:12vh 0 auto;margin:0 auto;width:min(570px,calc(100vw - 32px));max-height:76dvh;padding:0;border:1px solid #e6d6af35;border-radius:18px;background:var(--tinct-bg,#181b22);color:var(--tinct-fg,#f3ecdd);box-shadow:0 28px 90px #0009;overflow:auto;font:14px/1.5 system-ui,sans-serif}dialog::backdrop{background:#0007;backdrop-filter:blur(3px)}
    header{display:flex;align-items:center;justify-content:space-between;padding:19px 22px 8px}h2{margin:0;font:24px Georgia,serif}button,input,select{font:inherit;color:inherit}button{cursor:pointer}.close{background:none;border:0;padding:8px;font-size:22px}input{display:block;width:calc(100% - 40px);margin:6px 20px 12px;padding:12px 14px;border:1px solid #c8c4b440;border-radius:8px;background:#80808012;outline:none}input:focus{border-color:var(--tinct-accent,#d6ad62)}
    .results{max-height:40vh;overflow:auto;padding:0 10px 10px}.command{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:11px 12px;text-align:left;border:0;border-radius:7px;background:transparent}.command[aria-selected=true],.command:hover{background:#80808028}.command:disabled{opacity:.4;cursor:default}kbd{font:11px ui-monospace,monospace;border:1px solid #aaa4;border-radius:4px;padding:2px 6px;white-space:nowrap}.empty{padding:12px}footer{padding:16px 22px;border-top:1px solid #aaa3}label{display:flex;justify-content:space-between;align-items:center;gap:12px}select{max-width:65%;background:var(--tinct-bg,#181b22);border:1px solid #aaa5;border-radius:6px;padding:7px}p{margin:10px 0 0;font-size:12px;opacity:.75}.hint{font-size:11px}button:focus-visible{outline:2px solid var(--tinct-accent,#d6ad62);outline-offset:-2px}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
  `;shadow.append(css);dialog=node('dialog');dialog.setAttribute('aria-labelledby','tinct-command-title');
  const header=node('header'),title=node('h2','Commands & themes');title.id='tinct-command-title';const close=node('button','×','close');close.type='button';close.setAttribute('aria-label','Close commands');close.onclick=()=>dialog.close();header.append(title,close);
  input=node('input');input.type='search';input.placeholder='Find an action…';input.setAttribute('aria-label','Find a Tinct command');input.setAttribute('aria-controls','tinct-command-results');input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','true');
  results=node('div',null,'results');results.id='tinct-command-results';results.setAttribute('role','listbox');results.setAttribute('aria-label','Commands');
  const footer=node('footer'),label=node('label','Appearance');themeSelect=node('select');themeSelect.setAttribute('aria-label','Tinct appearance');
  for(const [value,text]of[['tinct','Tinct'],['omarchy','Follow Omarchy'],['persia','Prince of Persia']]){const o=node('option',text);o.value=value;themeSelect.append(o);}label.append(themeSelect);themeSelect.onchange=()=>selectTheme(themeSelect.value);
  connection=node('p');connection.setAttribute('role','status');const hint=node('p','↑ ↓ choose · Enter open · Esc return · Ctrl/⌘ K commands','hint');
  footer.append(label,connection,hint);dialog.append(header,input,results,footer);shadow.append(dialog);document.body.append(host);
  input.oninput=()=>{selected=0;render();};
  input.onkeydown=e=>{if(['ArrowDown','ArrowUp','Enter'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='Enter'){if(filtered[selected])run(filtered[selected].id);}else{selected=(selected+(e.key==='ArrowDown'?1:-1)+filtered.length)%Math.max(filtered.length,1);paintSelection();}}};
  dialog.addEventListener('keydown',e=>{
    e.stopPropagation();
    if(e.key==='Escape'){e.preventDefault();dialog.close();}
    if(e.key==='Tab'){const items=[...shadow.querySelectorAll('button:not(:disabled),input,select')].filter(e=>e.getClientRects().length);const at=items.indexOf(shadow.activeElement);if(e.shiftKey&&at<=0){e.preventDefault();items.at(-1)?.focus();}else if(!e.shiftKey&&at===items.length-1){e.preventDefault();items[0]?.focus();}}
  });
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{delete root.dataset.tinctCommandsOpen;restoreFocus?.isConnected&&restoreFocus.focus({preventScroll:true});});
}
function paintSelection() {
  [...results.children].forEach((b,i)=>b.setAttribute('aria-selected',String(i===selected)));
  input.setAttribute('aria-activedescendant','tinct-command-'+selected);results.children[selected]?.scrollIntoView({block:'nearest'});
}
function render() {
  const q=input.value.trim().toLowerCase();filtered=commands().filter(c=>c.label.toLowerCase().includes(q));results.replaceChildren();
  filtered.forEach((c,i)=>{const b=node('button',null,'command');b.type='button';b.id='tinct-command-'+i;b.setAttribute('role','option');b.append(node('span',c.label));if(c.key)b.append(node('kbd',c.key.toUpperCase()));b.disabled=!!c.enabled&&!c.enabled();b.onclick=()=>run(c.id);results.append(b);});
  if(!filtered.length)results.append(node('div','No matching commands','empty'));paintSelection();updateStatus();
}
function run(id) {
  const c=commands().find(c=>c.id===id);if(!c || c.enabled&&!c.enabled())return;
  // The native dialog restores focus as it closes. Its later close event must not
  // steal focus from the composer or panel opened by the selected command.
  if(dialog?.open){restoreFocus=null;dialog.close();delete root.dataset.tinctCommandsOpen;}
  if(!id.startsWith('theme-'))registry().prepare?.();
  c.run();
}
export function openCommands() {
  build();if(dialog.open){dialog.close();return;}restoreFocus=document.activeElement;input.value='';selected=0;render();root.dataset.tinctCommandsOpen='true';dialog.showModal();input.focus();
}
window.__tinctDesktopOpen=openCommands;
window.addEventListener('keydown',e=>{
  if(e.isComposing || e.defaultPrevented)return;
  if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.key.toLowerCase()==='k') {e.preventDefault();e.stopImmediatePropagation();openCommands();return;}
  if(dialog?.open)return;
  if(!eligibleShortcut(e))return;
  if(e.key==='?'){e.preventDefault();e.stopImmediatePropagation();openCommands();return;}
  if(registry().blocked() || window.getSelection()?.toString())return;
  const c=commands().find(c=>c.key===e.key.toLowerCase());
  if(c&&(!c.enabled||c.enabled())){e.preventDefault();e.stopImmediatePropagation();run(c.id);}
},true);
apply();if(mode==='omarchy')void syncTheme();
