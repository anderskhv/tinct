// ---- The first paint's desk (2026-10-10) ----
// A returning reader's table, drawn before any module runs: the rows are the device's own table
// snapshot (the engine's cache, the same rows the table itself paints first, led by the book just
// read as libraryTwoReading.ts withJustRead leads it), each book's binding, shape, spine title and
// cover come from the record of the last table drawn (deskRecord), and the geometry is
// table-layout.js's, carried here because a classic script cannot import it. The table then
// arrives over it, book for book, and the placeholder leaves (reading-table.js). The unit test
// src/libraryTwoFirstPaint.test.ts holds these copies equal to the modules and the markup equal
// to the table's own.
const deskLayout=(()=>{
// table-window.js
const MAX_SPINES=8,COVER_ASPECT=2/3,MIN_COVER_ASPECT=0.5,MAX_COVER_ASPECT=1,MAX_BOOK_WIDTH=0.75;
function tableWindow(costs,current,room,max=MAX_SPINES){
  let from=current,to=current,left=0,right=0;
  for(;;){
    if(to-from>=max)break;
    const canLeft=from>0&&left+right+costs[from-1]<=room;
    const canRight=to<costs.length-1&&left+right+costs[to+1]<=room;
    if(!canLeft&&!canRight)break;
    if(canLeft&&(!canRight||left<right))left+=costs[--from];
    else right+=costs[++to];
  }
  return {from,to};
}
function bookBox(height,aspect){
  const shape=Number.isFinite(aspect)&&aspect>0?Math.min(MAX_COVER_ASPECT,Math.max(MIN_COVER_ASPECT,aspect)):COVER_ASPECT;
  const w=Math.min(height*shape,height*MAX_BOOK_WIDTH);
  return {w,h:w/shape};
}
// table-layout.js
const depthRatio=book=>Math.max(0.085,Math.min(0.2,0.065+(book.wordCount||90000)/1_600_000));
function tableFit(stageW,stageH,desk){
  const H=Math.round(Math.max(130,Math.min(desk?352:240,stageH/1.36,stageW*(desk?0.44:0.39)*1.5)));
  const base=stageH-H*0.05;
  return {H,bw:Math.round(H*2/3),originY:Math.round(base-H*0.42)};
}
function tableLayout({H,stageW,desk,books,current,turn=1,removable=true}){
  const gap=Math.max(2,H*0.01);
  const around=Math.max(H*0.08,removable?24:0);
  const face=12*turn,rad=Math.abs(face)*Math.PI/180;
  const size=i=>bookBox(H,books[i].aspect);
  const depth=i=>H*books[i].depthRatio;
  const chosenFoot=size(current).w*Math.cos(rad)+depth(current)*Math.sin(rad);
  const pad=desk?0:20,minEdge=-stageW/2+pad,maxEdge=stageW/2-pad;
  const {from,to}=tableWindow(books.map((_,i)=>depth(i)+gap),current,Math.max(0,maxEdge-minEdge-chosenFoot-2*around),MAX_SPINES);
  const xs=[];
  xs[current]=0;
  let right=chosenFoot/2+around,left=-chosenFoot/2-around;
  for(let i=current+1;i<books.length;i++){xs[i]=right+depth(i)/2;if(i<=to)right+=depth(i)+gap;}
  for(let i=current-1;i>=0;i--){xs[i]=left-depth(i)/2;if(i>=from)left-=depth(i)+gap;}
  if(from===current)left=-chosenFoot/2;
  if(to===current)right=chosenFoot/2;
  let shift=-(left+right)/2;
  if(left+shift<minEdge)shift=minEdge-left;
  if(right+shift>maxEdge)shift=maxEdge-right;
  shift=Math.min(Math.max(shift,minEdge+chosenFoot/2),maxEdge-chosenFoot/2);
  return books.map((_,i)=>{
    const chosen=i===current,{w,h}=size(i),d=depth(i);
    return {w,h,d,x:xs[i]+shift,z:chosen?H*0.05:-(w/2-d/2),rotate:chosen?face:90,current:chosen,away:i<from||i>to};
  });
}
function bookStyle(box){
  return {'--bw':`${box.w.toFixed(1)}px`,'--bh':`${box.h.toFixed(1)}px`,'--d':`${box.d.toFixed(1)}px`,transform:`translate3d(${box.x.toFixed(1)}px,0,${box.z.toFixed(1)}px) rotateY(${box.rotate}deg)`};
}
// hero-title.js
const heroTitleStep=title=>{const n=[...String(title||'')].length;return n<=24?0:n<=40?1:n<=62?2:n<=90?3:4;},HERO_TITLE_STEPS=4;
// reading-room.js
function tableCrop(w,h,iw,ih,tableY,edgeY){
  const scale=Math.max(w/iw,h/ih,edgeY/tableY,(h-edgeY)/(ih-tableY));
  const sw=w/scale,sh=h/scale;
  return {x:(iw-sw)*.7,y:tableY-edgeY/scale,w:sw,h:sh,scale};
}
return {tableWindow,bookBox,depthRatio,tableFit,tableLayout,bookStyle,heroTitleStep,HERO_TITLE_STEPS,tableCrop};
})();
const desk=(()=>{
const L=deskLayout;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
// spine.js PAPER_SPINE
const PAPER_SPINE={colour:'#e6dfca',edge:'linear-gradient(90deg,#4a402c47,#0000 13%,#ffffff3d 46%,#0000 74%,#4a402c3d)',ink:'#3f3828'};
// reading-table.js RIBBONS, hash, ribbonFor, percentLabel, spineStyle (from the recorded binding)
const RIBBONS=['#69413e','#6b6045','#58634c','#86724b'];
const hash=id=>[...id].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7);
const ribbonFor=id=>RIBBONS[hash(id)%RIBBONS.length];
const percentLabel=p=>(p==null?'':p>0&&p<1?'<1%':`${Math.round(p)}%`);
function spineStyle(b){
  if(b.binding==='paper')return {name:'paper',colour:PAPER_SPINE.colour,textured:false,spine:`${PAPER_SPINE.edge},${PAPER_SPINE.colour}`,reflection:PAPER_SPINE.colour,title:` style="color:${PAPER_SPINE.ink};text-shadow:none"`,gilt:' style="visibility:hidden"'};
  const texture=`url('assets/spines/spine-${b.binding}.jpg') 50% 50%/100% 100%,`;
  return {name:b.binding,colour:b.colour,textured:true,spine:`linear-gradient(90deg,#0009,#0000 16%,#ffffff14 44%,#0000 64%,#0009),${texture}${b.colour}`,reflection:`${texture}${b.colour}`,title:'',gilt:''};
}
// reading-table.js bookMarkup, for a recorded book; only the shown book's cover is fetched.
function bookMarkup(b,i,current){
  const s=spineStyle(b),cover=i===current?b.cover:null;
  return `
    <button class="rt-b${b.linked?' is-linked':''}" data-i="${i}" aria-label="${esc(b.title)}" tabindex="-1" style="--dr:${L.depthRatio(b)};--ribbon:${ribbonFor(b.bookId)};--binding:${s.colour};--p:${Math.max(6,Math.min(94,b.percent??50))/100}${cover?`;--cover:url('${esc(cover)}')`:''}">
      <span class="rt-shadow" aria-hidden="true"></span>
      <span class="rt-cast" aria-hidden="true"></span>
      <span class="rt-f rt-back"></span>
      <span class="rt-f rt-fore"></span>
      <span class="rt-f rt-head"></span>
      <span class="rt-mark" aria-hidden="true"><i></i></span>
      <span class="rt-f rt-refl rt-refl-front"></span>
      <span class="rt-f rt-refl rt-refl-spine" style="background:${s.reflection}"></span>
      <span class="rt-f rt-spine${s.textured?' is-textured':''}" data-binding="${s.name}" style="background:${s.spine};--tl:${Math.max(1,[...b.spineTitle].length)}"><i class="rt-gilt"${s.gilt}></i><em${s.title}>${esc(b.spineTitle)}</em><i class="rt-gilt"${s.gilt}></i></span>
      <span class="rt-f rt-front"><img${cover?` src="${esc(cover)}"`:''} alt="" decoding="async" fetchpriority="${i===0?'high':'auto'}" draggable="false"></span>
    </button>`;
}
// reading-table.js markup: the same structure, no ids (the table's own are found by id), the
// shown book's facts as the table first paints them from the same snapshot.
function markup(model){
  const b=model.books[model.current];
  const recap=b.recap||(b.headline?(/[.…!?]$/.test(b.headline)?b.headline:`${b.headline}.`):'');
  return `
    <div class="rt-stage"><div class="rt-row">${model.books.map((book,i)=>bookMarkup(book,i,model.current)).join('')}</div>
      <div class="rt-dots">${model.books.map((book,i)=>`<button data-i="${i}" aria-label="${esc(book.title)}" tabindex="-1"${i===model.current?' class="active" aria-pressed="true"':' aria-pressed="false"'}></button>`).join('')}</div>
      <button type="button" class="rt-remove" aria-label="Remove ${esc(b.title)} from currently reading" tabindex="-1" hidden>×</button>
      <button class="rt-hidden-nav" aria-label="Previous book" tabindex="-1"></button><button class="rt-hidden-nav" aria-label="Next book" tabindex="-1"></button></div>
    <div class="rt-info"><div class="rt-fade">
      <h1 data-fit="${L.heroTitleStep(b.title)}"><span class="rt-title-text">${esc(b.title)}</span></h1>
      <p class="rt-book-metadata"><span class="metadata-details"><span>&nbsp;</span></span></p>
      <p class="rt-meta"><span>${esc(b.chapterLabel)||'&nbsp;'}</span><span>${esc(percentLabel(b.percent))}</span></p>
      <div class="rt-recap"${recap?'':' hidden'}><div class="rt-quote"><small>Where you left off</small><p>${esc(recap)}</p></div><button class="is-hidden" tabindex="-1">Read more</button></div>
    </div>
    <a class="rt-continue read-button" tabindex="-1">${b.linked?'Read':'Continue'}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h20m-6-6 6 6-6 6"/></svg></a></div>`;
}
const url=value=>typeof value==='string'&&/^(\/|assets\/)[\w\-./]+$/.test(value)&&!value.includes('..')?value:null;
const text=(value,max)=>typeof value==='string'&&value.length<=max?value:null;
/**
 * What the table will show first, from the record, the device's table snapshot
 * (libraryTwoReading.ts cacheKey), the reader's library boot snapshot (the book just read,
 * labLibraryBoot.ts) and the visit's chosen book (visit.js): or null, and the desk waits as before.
 */
// An own book's small cover, kept on this device by the table (reading-table.js OWN_THUMB_KEY):
// a few kilobytes, so the book stands in its cover from the first frame (2026-10-12).
function ownThumb(storage,bookId){try{const v=storage.getItem('tinct:library-2-own-thumb:'+bookId);return typeof v==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(v)&&v.length<40000?v:null;}catch{return null;}}
function model(record,owner,storage=localStorage,session=sessionStorage,now=Date.now()){
  if(!record||record.v!==2||!owner||record.owner!==owner||!record.art||typeof record.art!=='object')return null;
  const hero=record.hero;if(!hero||!(hero.w>0)||!(hero.h>0))return null;
  let cache=null,snapshot=null,visit=null;
  try{cache=JSON.parse(storage.getItem('tinct:library-2-table:'+owner)||'null');}catch{return null;}
  try{snapshot=JSON.parse(storage.getItem('tinct:lab-library-boot')||'null');}catch{}
  try{visit=JSON.parse(session.getItem('tinct:library-2-visit')||'null');}catch{}
  if(!cache||cache.mode!=='returning'||!Array.isArray(cache.reading)||!cache.reading.length)return null;
  let rows=cache.reading.filter(row=>row&&typeof row==='object'&&typeof row.bookId==='string');
  if(rows.length!==cache.reading.length)return null;
  // libraryTwoReading.ts justLeftReader + withJustRead: the book just read leads.
  const h=snapshot&&snapshot.v===1&&snapshot.userId===owner&&typeof snapshot.at==='number'&&now-snapshot.at<=30*24*60*60*1000?snapshot.hero:null;
  const just=h&&typeof h.bookId==='string'&&typeof h.lastReadAt==='number'&&h.lastReadAt>0&&now-h.lastReadAt<=60*60*1000?h:null;
  if(just&&!rows.some(row=>row.own&&(row.lastActiveAt||0)>just.lastReadAt)){
    const existing=rows.find(row=>row.bookId===just.bookId);
    if(!existing)return null;
    const lead=!just.chapterLabel||just.chapterLabel===existing.chapterLabel?existing:{...existing,chapterLabel:just.chapterLabel,headline:just.headline,percent:null,recap:null};
    rows=[lead,...rows.filter(row=>row.bookId!==just.bookId)];
  }
  const books=[];
  for(const row of rows){
    const art=record.art[row.bookId];
    if(!art||typeof art!=='object')return null;
    const binding=/^[a-z]+$/.test(art.b||'')?art.b:null,colour=/^#[0-9a-f]{3,8}$/i.test(art.c||'')?art.c:null,aspect=Number(art.a);
    const spineTitle=text(art.t,200),title=text(row.title,200);
    if(!binding||!colour||!(aspect>=0.3&&aspect<=1.5)||!spineTitle||!title)return null;
    books.push({bookId:row.bookId,title,spineTitle,binding,colour,aspect,cover:row.own?ownThumb(storage,row.bookId):url(art.u),spine:binding!=='paper'?binding:null,wordCount:Number(row.wordCount)||null,
      percent:typeof row.percent==='number'?row.percent:null,chapterLabel:text(row.chapterLabel,200)||'',headline:text(row.headline,600)||'',recap:text(row.recap,4000)||'',linked:false});
  }
  const chosen=visit&&typeof visit.at==='number'&&now-visit.at<4*60*60*1000&&typeof visit.tableBook==='string'?visit.tableBook:null;
  const current=Math.max(0,books.findIndex(b=>b.bookId===chosen));
  if(!books[current].cover)return null;
  return {hero:{w:hero.w,h:hero.h},books,current};
}
/** Draw the desk into the hero, if the hero is the size the record was fitted in; else nothing. */
function paint(hero,model){
  if(!hero||!model||hero.clientWidth!==model.hero.w||hero.clientHeight!==model.hero.h)return null;
  const view=document.createElement('div');
  view.className='reading-table is-placeholder'+(model.books.length>=5?' has-many':'');
  view.setAttribute('aria-hidden','true');view.setAttribute('inert','');
  view.innerHTML=markup(model);
  hero.append(view);
  // hero-title.js fitHeroTitle: the type steps down while the title needs more than three lines.
  const h1=view.querySelector('h1'),titleText=h1.querySelector('.rt-title-text');
  let step=Number(h1.dataset.fit);
  while(step<L.HERO_TITLE_STEPS&&titleText.scrollHeight>titleText.clientHeight+1)h1.dataset.fit=String(++step);
  const stage=view.querySelector('.rt-stage'),r=stage.getBoundingClientRect();
  if(!r.height){view.remove();return null;}
  const desk=innerWidth>=900,fit=L.tableFit(r.width,r.height,desk);
  view.style.setProperty('--bh',`${fit.H}px`);view.style.setProperty('--bw',`${fit.bw}px`);stage.style.perspectiveOrigin=`50% ${fit.originY}px`;
  const boxes=L.tableLayout({H:fit.H,stageW:r.width,desk,books:model.books.map(b=>({aspect:b.aspect,depthRatio:L.depthRatio(b)})),current:model.current,turn:1,removable:true});
  const books=[...view.querySelectorAll('.rt-b')];
  books.forEach((book,i)=>{
    const box=boxes[i];
    book.classList.toggle('is-current',box.current);book.classList.toggle('is-away',box.away);
    book.style.transitionDuration='0s';
    for(const [property,value] of Object.entries(L.bookStyle(box)))property.startsWith('--')?book.style.setProperty(property,value):(book.style[property]=value);
    book.setAttribute('aria-current',String(box.current));
  });
  // reading-table.js positionRemove: the × on the chosen cover's corner.
  const remove=view.querySelector('.rt-remove'),cover=books[model.current].querySelector('.rt-front').getBoundingClientRect(),bounds=stage.getBoundingClientRect();
  remove.hidden=false;remove.style.left=Math.max(0,Math.min(bounds.width-36,cover.right-bounds.left-18))+'px';remove.style.top=Math.max(0,cover.top-bounds.top-18)+'px';
  // app.js cropForScene for a table scene: the painted room's table edge behind the books' base,
  // as the scene canvas will draw it, so the room does not shift when the canvas arrives.
  const w=hero.clientWidth,h=hero.clientHeight,wide=w/h>1.2,asset=String(window.__library2Boot.asset||'');
  if(asset.endsWith(wide?'-wide.jpg':'-phone.jpg')){
    const iw=wide?1536:1024,ih=wide?1024:1536,heroTop=hero.getBoundingClientRect().top;
    const edge=Math.max(h*.3,Math.min(h*.8,r.bottom-heroTop-fit.H*.22));
    const c=L.tableCrop(w,h,iw,ih,ih*(wide?.64:.51),edge),s=w/c.w;
    document.documentElement.style.setProperty('--initial-scene-size',`${(iw*s).toFixed(2)}px ${(ih*s).toFixed(2)}px`);
    document.documentElement.style.setProperty('--initial-scene-position',`${(-c.x*s).toFixed(2)}px ${(-c.y*s).toFixed(2)}px`);
    // app.js draws the same scene in this same crop (cropForScene), so the room never re-frames when the canvas arrives.
    window.__library2Boot.crop={id:String(window.__library2Boot.scene||''),w,h,x:c.x,y:c.y,cw:c.w,ch:c.h,scale:c.scale};
  }
  document.documentElement.classList.add('desk-placeholder');
  return view;
}
return {model,markup,paint};
})();

(()=>{
// The signed-in account on this device (the Supabase session), or null.
function signedInUser() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!/^sb-.*-auth-token$/.test(key || '')) continue;
      const session = JSON.parse(localStorage.getItem(key) || 'null');
      if (typeof session?.user?.id === 'string' && session.user.id) return session.user.id;
    }
  } catch {}
  return null;
}
// The veil drawn on leaving for the reader takes the reader's own paper, so a
// reader in dark or book paper never passes through a light screen. Same
// resolution as src/lab/readerBoot.ts; unknown or layout-dependent keeps #efe6cc.
try {
  const prefs = JSON.parse(localStorage.getItem('tinct-lab-prefs') || 'null') || {};
  const valid = theme => ['system','light','dark','book'].includes(theme) ? theme : null;
  // The layout the reader will use (src/lab/labChrome.ts isLabPhoneSurface, as readerBootProfile applies it) picks the phone or desktop theme.
  const phone = /iPhone|iPod/i.test(navigator.userAgent || '') || ((navigator.maxTouchPoints || 0) > 0 && typeof screen !== 'undefined' && screen.width <= 430) || innerWidth <= 430 || (typeof matchMedia === 'function' && matchMedia('(max-width: 899px), ((max-width: 1024px) and (orientation: portrait))').matches);
  const themes = prefs.version === 2 && prefs.shared && typeof prefs.shared === 'object'
    ? [valid((phone ? prefs.phone : prefs.desktop)?.theme) || 'system']
    : [valid(prefs.theme) || (Object.keys(prefs).length ? (prefs.darkMode === true ? 'dark' : 'light') : 'system')];
  const dark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = [...new Set(themes.map(theme => theme === 'system' ? (dark ? 'dark' : 'light') : theme))];
  const paper = resolved.length === 1 ? {dark:'#171411',book:'#e7dcc7'}[resolved[0]] : null;
  if (paper && localStorage.getItem('tinct:display-profile') !== 'eink') document.documentElement.style.setProperty('--reader-paper', paper);
} catch {}
// Preserve the existing recent-reader shortcut only at the bare home entry.
// Explicit Library, book links and review modes always display the library.
// The production reader still resolves the account, edition and exact position.
try {
  const params = new URLSearchParams(location.search);
  const home = location.pathname === '/' || location.pathname === '/index.html';
  if (home && !['book','view','demo','preview'].some(key => params.has(key))) {
    const userId = signedInUser();
    const position = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null');
    const place = position?.books?.[position.lastSettledBookId];
    const at = Math.max(position?.lastSettledAt || 0, place?.updatedAt || 0), now = Date.now();
    const recent = Number.isFinite(at) && at > 0 && at <= now && now - at <= 3 * 24 * 60 * 60 * 1000;
    if (userId && position?.owner === userId && typeof place?.bookId === 'string' && place.bookId && recent) {
      try { sessionStorage.setItem('tinct:lab-reader-origin', JSON.stringify({v:1,bookId:place.bookId,at:now})); } catch {}
      document.documentElement.style.visibility = 'hidden';
      location.replace('/reader' + (params.get('voiceTrial') === 'mini' ? '?voiceTrial=mini' : ''));
      return;
    }
  }
} catch { document.documentElement.style.visibility = ''; }
const d=document.documentElement;
// A book link (/library?book=<id>, or the shared /read/<id>) shows that book in
// the hero from the first paint. The Worker fills the hero and marks it with
// data-linked-book; without that, the hero waits for the book (app.js).
const linked=(()=>{const id=d.dataset.linkedBook||new URLSearchParams(location.search).get('book')||location.pathname.match(/^\/read\/([a-z0-9-]+)\/?$/)?.[1]||null;return id&&/^[a-z0-9-]{1,80}$/.test(id)?id:null;})();if(linked&&d.dataset.linkedBook!==linked)d.classList.add('linked-pending');
const linkedScene=['pride-and-prejudice','odyssey','crime-and-punishment','the-prince','meditations'].includes(linked)?linked:null;
let hint=new URLSearchParams(location.search).get('demo')==='reading';try{const saved=localStorage.getItem('tinct-library-2-reading-table'),positions=localStorage.getItem('tinct-lab-position')||'',signed=/(?:^|;\s*)tinct_auth=1(?:;|$)/.test(document.cookie);if(signed)d.classList.add('signed-in');hint=hint||!!saved||/"books":\{"/.test(positions)||signed;}catch{}try{const visit=JSON.parse(sessionStorage.getItem('tinct:library-2-visit')||'null');let localBooks=0;try{localBooks=Object.keys(JSON.parse(localStorage.getItem('tinct-lab-position')||'{}').books||{}).length;}catch{}if(visit&&Date.now()-visit.at<4*60*60*1000&&visit.mode==='discovery'&&!(visit.auto&&localBooks>=2)&&!new URLSearchParams(location.search).has('demo')&&new URLSearchParams(location.search).get('view')!=='shelf')hint=false;}catch{}if(new URLSearchParams(location.search).get('view')==='new')hint=false;if(hint)d.classList.add('returning-pending');const hour=new Date().getHours(),preview=new URLSearchParams(location.search),requested=preview.get('demo')==='reading'&&preview.get('rooms')==='1'?preview.get('room'):null,room=['morning','afternoon','evening','night'].includes(requested)?requested:hour>=6&&hour<12?'morning':hour>=12&&hour<17?'afternoon':hour>=17&&hour<21?'evening':'night',wide=innerWidth/innerHeight>1.2,shelf=preview.get('view')==='shelf',scene=hint&&!shelf?'table-'+room:linkedScene||'frankenstein',asset=hint&&shelf?'shelf-study/library-wall.jpg':scene.startsWith('table-')?`assets/${scene}-${wide?'wide':'phone'}.jpg`:scene!=='frankenstein'?`assets/scene-${scene}-${wide?'wide':'phone'}.jpg`:`assets/${wide?'room-wide-v2':'room-sharp'}.jpg`;if(hint&&!shelf)d.classList.add('returning-scene-pending');window.__library2Boot={hint,scene,asset,book:linked,layout:deskLayout,deskPlaceholder:desk};d.dataset.scene=scene;d.dataset.returningView=shelf?'shelf':'table';d.style.setProperty('--initial-scene',`url("${asset}")`);
// The room's own colour under the painting until it has decoded (src/lab/libraryRoom.ts carries the same map).
if(scene.startsWith('table-')){const roomColour={morning:'#352619',afternoon:'#2d1e15',evening:'#2d1709',night:'#21150f'}[scene.slice(6)];if(roomColour)d.style.setProperty('--initial-scene-colour',roomColour);}const preload=document.createElement('link');preload.rel='preload';preload.as='image';preload.href=asset;preload.fetchPriority='high';document.head.append(preload);if(hint||linked){window.__library2Catalogue=fetch('/lab/catalogue.json').then(r=>{if(!r.ok)throw new Error('Catalogue '+r.status);return r.json();});window.__library2Catalogue.catch(()=>{});}if(hint){const bridge=document.createElement('link');bridge.rel='modulepreload';bridge.href='/lab/library-2-reading.js?v=20261012nodiag';document.head.append(bridge);
// The reading engine's own bundles, stamped at build (scripts/stamp-library-bridge-preloads.cjs): fetched with the page, not after the engine is parsed.
for(const dep of /*__BRIDGE_DEPS__*/[]){const link=document.createElement('link');link.rel='modulepreload';link.href=dep;document.head.append(link);}
// The desk as the last visit left it (reading-table.js FIRST_PAINT_KEY, reading-table-first-paint.js
// deskRecord): the book the table will show first has its cover and spine texture download with the
// page, and the whole desk is painted before any module runs (desk below; initial-cover.js, right after the book overlay in index.html, paints it).
if(!shelf)try{const first=JSON.parse(localStorage.getItem('tinct:library-2-first-paint')||'null');const owner=signedInUser();if(first&&(first.v===1||first.v===2)&&owner&&first.owner===owner){
const model=first.v===2&&!linked?desk.model(first,owner):null;window.__library2Boot.desk=model?{model,paint:hero=>desk.paint(hero,model)}:null;
const shown=model?model.books[model.current]:first;
for(const href of [shown.cover,/^[a-z]+$/.test(shown.spine||'')?`assets/spines/spine-${shown.spine}.jpg`:null]){if(typeof href!=='string'||!/^(\/|assets\/)[\w\-./]+$/.test(href)||href.includes('..'))continue;const link=document.createElement('link');link.rel='preload';link.as='image';link.href=href;link.fetchPriority='high';document.head.append(link);}}}catch{}}if(!hint&&!linked){const cover=document.createElement('link');cover.rel='preload';cover.as='image';cover.href='assets/covers/frankenstein-960.webp';cover.fetchPriority='high';document.head.append(cover);}})();



// Keep the first HTML cover in the same position as the interactive cover.
window.__library2Layout=(()=>{let width=0;return()=>{if(innerWidth!==width){width=innerWidth;const bar=/iPhone|iPod/.test(navigator.userAgent)&&innerHeight>screen.height-140?52:0;document.documentElement.style.setProperty('--land-bottom',innerHeight-bar+'px');}const hero=document.getElementById('hero'),book=document.getElementById('hero-book');if(!hero||!book)return;const r=hero.getBoundingClientRect(),copy=document.querySelector('.hero-copy').getBoundingClientRect();document.documentElement.style.setProperty('--hero-height',r.height+'px');if(innerWidth<700){const top=document.getElementById('header').getBoundingClientRect().height+10,available=Math.max(90,copy.top-r.top-top-18),height=Math.min((r.height+parseFloat(getComputedStyle(document.getElementById('shelves')).marginTop||0))*.35,available);book.style.top=top+available-height+'px';book.style.height=height+'px';book.style.bottom='auto';}else{book.style.top='';book.style.height='';book.style.bottom='';}}})();


