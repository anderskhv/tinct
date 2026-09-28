import { rowFor, pageItems } from './shelf-study/shelves.js?v=3';
import { bookshelfMarkup } from './bookshelf-template.js?v=20260928b';
import { bindingFor } from './reading-table.js?v=20260928b';

export function createBookshelf(root,{table,catalogue,saved,onOpen,onRemove,onError,summaryFor,enabled,prepareCover,initial,onSelection}){
root.innerHTML=bookshelfMarkup;
const $=id=>root.querySelector('#bs-'+id);
const ASSETS='assets/';
const books={};
const studyCovers=new Set(['to-the-lighthouse','frankenstein','meditations','odyssey','crime-and-punishment','candide','jane-eyre','jekyll-and-hyde','julius-caesar','niels-lyhne','pride-and-prejudice','the-prince','the-awakening','notes-from-underground']);
const shelves={reading:[],finished:[],later:[]};
const chosen={reading:null,finished:null,later:null,...initial?.chosen};
let busy=false,summaryTimer=null,summaryTurn=0;
function updateData(nextTable,nextSaved){
 for(const entry of catalogue){books[entry.id]={title:entry.title,author:entry.author,cover:entry.art?.src||null,wordCount:entry.wordCount,binding:bindingFor({bookId:entry.id,tone:entry.cover?.background})[0]};}
 for(const b of [...nextTable.finished,...nextTable.reading]){books[b.bookId]={...books[b.bookId],title:b.title,author:b.author||books[b.bookId]?.author||'',cover:b.cover||books[b.bookId]?.cover||null,binding:bindingFor(b)[0],wordCount:b.wordCount||books[b.bookId]?.wordCount,place:b.chapterLabel,progress:b.percent,recap:b.recap||b.headline};}
 for(const [id,b] of Object.entries(books))if(studyCovers.has(id))b.cover=`assets/${id}.jpg`;
 const unique=ids=>[...new Set(ids)].filter(id=>books[id]);
 shelves.reading=unique(nextTable.reading.map(b=>b.bookId));shelves.finished=unique(nextTable.finished.map(b=>b.bookId));
 // A saved discovery hold is retained in storage, but cannot become a new selection.
 shelves.later=unique(nextSaved).filter(id=>catalogue.some(b=>b.id===id&&b.discoveryAvailable!==false)&&!shelves.reading.includes(id)&&!shelves.finished.includes(id));
 for(const key of Object.keys(shelves))if(!shelves[key].includes(chosen[key]))chosen[key]=shelves[key][0]||null;
}
updateData(table,saved);
function updateRecap(id){
 const turn=++summaryTurn;clearTimeout(summaryTimer);
 if(!id||shelf!=='reading'||!summaryFor)return;
 const apply=result=>{if(turn===summaryTurn&&result?.text){$('recap-text').textContent=result.text;measureRecap();}};
 summaryFor(id,{request:false}).then(apply,()=>{});
 summaryTimer=setTimeout(()=>summaryFor(id,{request:true}).then(apply,()=>{}),900);
}
const centres={later:334,reading:776,finished:1244};
const order=['later','reading','finished'];
const shelfNames={later:'To read',reading:'Currently reading',finished:'Finished'};
const capacity={later:3,reading:6,finished:4};
let resultsPage=0;
let shelf=order.includes(initial?.shelf)?initial.shelf:shelves.reading.length?'reading':shelves.later.length?'later':'finished',view=initial?.view==='overview'?'overview':'focus',gesture=null,suppressClickUntil=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const escapeText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderShelf(key){
 const hero=key==='reading',width=hero?158:key==='finished'?110:116;
 const row=rowFor(shelves[key],chosen[key],capacity[key]);
 if(!shelves[key].includes(chosen[key])) chosen[key]=row.items[0]||null;
 $('shelf-'+key).innerHTML=row.items.map((id,i)=>{
  const b=books[id],height=hero?240-i%3*4:key==='finished'?182-i%3*5:190-i%3*4;
  const words=Number(b.wordCount)||70000,depth=Math.round(Math.max(14,Math.min(hero?44:32,10+Math.sqrt(words/1000)*1.1)));
  const measure=document.createElement('canvas').getContext('2d');measure.font='16px Georgia';
  const spineFont=Math.min(hero?14:11,16*(height*.62)/(measure.measureText(b.title.toUpperCase()).width+b.title.length*.8));
  return `<button class="volume" data-book="${escapeText(id)}" data-on-shelf="${key}" aria-label="${escapeText(b.title+' by '+b.author)}" aria-pressed="${id===chosen[key]}" style="--depth:${depth}px;--height:${height}px;--cover-width:${width}px;--spine-font:${spineFont}px;--binding:url('${ASSETS}spines/spine-${b.binding}.jpg');--bookmark:${20+(b.progress||0)*.55}%"><span class="ribbon" aria-hidden="true"></span><span class="spine" aria-hidden="true"><span>${escapeText(b.title)}</span></span><span class="face"><span class="fallback-title">${escapeText(b.title)}</span><canvas data-cover="${escapeText(id)}" aria-hidden="true"></canvas></span></button>`;
 }).join('') || '<p class=empty-bay>A little room for a new book</p>';
 $('count-'+key).textContent=shelves[key].length;
 $('shelf-'+key).querySelectorAll('[data-cover]').forEach(canvas=>{prepareCover(canvas.dataset.cover,canvas).catch(()=>{});});
}
function updateSelection(){
 const b=books[chosen[shelf]],row=rowFor(shelves[shelf],chosen[shelf],capacity[shelf]);
 root.dataset.shelf=shelf;
 root.querySelectorAll('.shelf-nav [data-shelf]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.shelf===shelf));
 root.querySelectorAll('[data-book]').forEach(el=>el.setAttribute('aria-pressed',chosen[el.dataset.onShelf]===el.dataset.book));
 $('selected-author').textContent=b?.author||'';$('selected-title').textContent=b?.title||'Your shelf is waiting';
 $('selected-progress').textContent=!b?'Add a book to make it yours.':shelf==='reading'?[b.place,b.progress==null?'':`${Math.round(b.progress)}% read`].filter(Boolean).join(' · '):shelf==='finished'?'Finished · a book to return to':'Waiting on your shelf';
 $('book-action').hidden=!b;
 $('book-action').innerHTML=(shelf==='reading'?'Continue reading':shelf==='finished'?'Open book':'About this book')+' <span aria-hidden="true">→</span>';
 $('recap').hidden=shelf!=='reading'||!b;
 $('recap-text').textContent=b?.recap||'Your bookmark is waiting here.';
 $('recap').classList.remove('expanded');$('recap-toggle').setAttribute('aria-expanded','false');$('recap-toggle').textContent='Read more ↓';
 requestAnimationFrame(measureRecap);
 updateRecap(chosen[shelf]);
 $('remove-saved').hidden=!b||shelf!=='later';
 $('book-dots').innerHTML=row.items.map(id=>`<button data-select="${escapeText(id)}" aria-label="Choose ${escapeText(books[id].title)}" aria-pressed="${chosen[shelf]===id}"></button>`).join('');
 $('previous-book').disabled=$('next-book').disabled=shelves[shelf].length<2;
 $('row-status').parentElement.hidden=row.total<=1;
 $('browse-shelf').hidden=shelves[shelf].length<=capacity[shelf];
 $('row-status').textContent=row.total?`Row ${row.index+1} of ${row.total}`:'No books yet';
 $('previous-row').disabled=row.index===0;$('next-row').disabled=row.index>=row.total-1;
 $('browse-shelf').textContent=`All ${shelves[shelf].length} books`;
 onSelection?.({shelf,view,chosen:{...chosen}});
 const position=order.indexOf(shelf);
 [['previous-shelf',position-1],['next-shelf',position+1]].forEach(([id,index])=>{
  const target=order[index],el=$(id);el.disabled=!target;el.style.visibility=target?'visible':'hidden';
  el.lastElementChild.textContent=shelfNames[target]||'';el.setAttribute('aria-label',target?`Go to ${shelfNames[target]} shelf`:'End of library');
 });
}
function measureRecap(){
 if($('recap').classList.contains('expanded'))return;
 $('recap-toggle').hidden=$('recap').hidden||$('recap-text').scrollHeight<=$('recap-text').clientHeight+1;
}
new ResizeObserver(measureRecap).observe($('recap-text'));
function layout(instant=false){
 root.dataset.view=view;
 // Measure the destination height, not an in-flight CSS transition.
 const el=$('viewport'),w=el.clientWidth,h=$('geometry-probe').clientHeight,mobile=w<700;
 let scale,x,y;
 if(view==='overview'){
  scale=Math.min(w/1536,(h-190)/740);x=(w-1536*scale)/2;y=h*.60-572*scale;
 }else{
  scale=Math.min(w/(shelf==='reading'?520:390),(h-220)/420);
  if(w>=700)scale=Math.min(w/970,(h-240)/440);
  x=w/2-centres[shelf]*scale;y=h*.60-572*scale;
 }
 const world=$('world');if(instant)world.classList.add('instant');
 world.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
 if(instant)requestAnimationFrame(()=>requestAnimationFrame(()=>world.classList.remove('instant')));
 $('view-toggle').setAttribute('aria-pressed',view==='overview');
 const desktop=w>=900;
 $('view-toggle').lastElementChild.textContent=desktop?(view==='overview'?'Zoom in':'Zoom out'):(view==='overview'?'Closer look':'Full library');
 $('view-toggle').firstElementChild.textContent=view==='overview'?'+':'−';
 $('view-toggle').setAttribute('aria-label',view==='overview'?'Zoom in to '+shelfNames[shelf]:'Zoom out to the full library');
}
function changeView(next){view=next;layout();onSelection?.({shelf,view,chosen:{...chosen}});}
function focusShelf(key){shelf=key;updateSelection();changeView('focus');}
function select(id,key=shelf){
 if(!shelves[key].includes(id))return;
 const before=rowFor(shelves[key],chosen[key],capacity[key]).index;
 shelf=key;chosen[key]=id;
 if(before!==rowFor(shelves[key],id,capacity[key]).index)renderShelf(key);
 updateSelection();if(view==='focus')layout();
}
function moveShelf(direction){const target=order[order.indexOf(shelf)+direction];if(target)focusShelf(target);}
function moveRow(direction){
 const row=rowFor(shelves[shelf],chosen[shelf],capacity[shelf]);
 const index=row.index+direction;
 if(index>=0&&index<row.total)select(shelves[shelf][index*capacity[shelf]]);
}
function step(direction){const ids=shelves[shelf],i=ids.indexOf(chosen[shelf]);if(ids.length)select(ids[(i+direction+ids.length)%ids.length]);}

Object.keys(shelves).forEach(renderShelf);updateSelection();layout(true);
new ResizeObserver(()=>layout()).observe($('viewport'));
$('view-toggle').onclick=()=>changeView(view==='overview'?'focus':'overview');
root.querySelectorAll('.shelf-nav [data-shelf],[data-focus]').forEach(el=>el.onclick=()=>{const key=el.dataset.shelf||el.dataset.focus;if(key===shelf&&shelves[key].length>capacity[key])$('browse-shelf').click();else focusShelf(key);});
$('world').addEventListener('click',e=>{const b=e.target.closest('[data-book]');if(b){const open=view==='overview'||(b.dataset.book===chosen[shelf]&&b.dataset.onShelf===shelf);select(b.dataset.book,b.dataset.onShelf);if(open)$('book-action').click();}});
$('book-dots').onclick=e=>{const b=e.target.closest('[data-select]');if(b)select(b.dataset.select);};
$('previous-book').onclick=()=>step(-1);$('next-book').onclick=()=>step(1);
$('previous-shelf').onclick=()=>moveShelf(-1);$('next-shelf').onclick=()=>moveShelf(1);
$('previous-row').onclick=()=>moveRow(-1);$('next-row').onclick=()=>moveRow(1);
$('recap-toggle').onclick=()=>{const expanded=$('recap').classList.toggle('expanded');$('recap-toggle').setAttribute('aria-expanded',expanded);$('recap-toggle').textContent=expanded?'Show less ↑':'Read more ↓';};
document.addEventListener('keydown',e=>{
 if(!enabled()||!root.checkVisibility()||e.defaultPrevented)return;
 if(e.target!==document.body&&e.target!==document.documentElement&&!root.contains(e.target))return;
 if(document.querySelector('dialog[open]')||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.target.matches('input,textarea,select')||e.target.isContentEditable)return;
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
  e.preventDefault();const direction=e.key==='ArrowRight'?1:-1;
  if(e.target.closest('.book-navigation,.book-shelf'))step(direction);else moveShelf(direction);
 }else if(e.key==='ArrowUp'||e.key==='ArrowDown'){
  if(e.target.closest('.row-navigation')){e.preventDefault();moveRow(e.key==='ArrowDown'?1:-1);}
 }
});
// Restrict camera gestures to this illustrated scene. Elsewhere native page
// scrolling and browser zoom remain available; the visible button does both views.
const viewport=$('viewport'),distance=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
// Chromium trackpad pinches arrive as ctrl-wheel. Only scene gestures are
// captured; ordinary wheel scrolling and zoom outside the scene stay native.
let wheelZoom=0,wheelReset;
viewport.addEventListener('wheel',e=>{
 if(!e.ctrlKey||viewport.clientWidth<900||!e.cancelable)return;
 e.preventDefault();clearTimeout(wheelReset);
 wheelZoom+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?viewport.clientHeight:1);
 if(Math.abs(wheelZoom)>=30){changeView(wheelZoom<0?'focus':'overview');wheelZoom=0;}
 wheelReset=setTimeout(()=>{wheelZoom=0;},180);
},{passive:false});
viewport.addEventListener('touchstart',e=>{if(e.touches.length===2)gesture={kind:'pinch',distance:distance(e.touches),done:false};else if(e.touches.length===1)gesture={kind:'swipe',x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
viewport.addEventListener('touchmove',e=>{
 if(!gesture)return;
 if(gesture.kind==='pinch'&&e.touches.length===2){e.preventDefault();if(gesture.done)return;const ratio=distance(e.touches)/gesture.distance;if(ratio<.80||ratio>1.23){changeView(ratio<.80?'overview':'focus');gesture.done=true;suppressClickUntil=performance.now()+700;}}
},{passive:false});
viewport.addEventListener('touchend',e=>{
 if(!gesture)return;if(gesture.kind==='swipe'&&e.changedTouches.length===1){const dx=e.changedTouches[0].clientX-gesture.x,dy=e.changedTouches[0].clientY-gesture.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.6){moveShelf(dx<0?1:-1);suppressClickUntil=performance.now()+600;}}
 if(!e.touches.length)gesture=null;
},{passive:true});
viewport.addEventListener('touchcancel',()=>gesture=null,{passive:true});
viewport.addEventListener('click',e=>{if(e.isTrusted&&performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
// A bounded browser keeps any collection navigable without shrinking its books
// or creating thousands of cover elements. Search works across every row.
function renderCollection(){
 const query=$('find-book').value.trim().toLocaleLowerCase();
 const ids=shelves[shelf].filter(id=>`${books[id].title} ${books[id].author}`.toLocaleLowerCase().includes(query));
 const page=pageItems(ids,resultsPage,12);resultsPage=page.index;
 $('collection-title').textContent=shelfNames[shelf];
 $('collection-results').innerHTML=page.items.map(id=>`<button class="collection-result" data-collection-book="${escapeText(id)}"><img src="${escapeText(books[id].cover||'')}" alt="" loading="lazy"><span>${escapeText(books[id].title)}<small>${escapeText(books[id].author)}</small></span><span aria-hidden="true">↗</span></button>`).join('')||'<p class="no-results">No books found on this shelf.</p>';
 $('result-status').textContent=ids.length?`${page.start+1}–${page.start+page.items.length} of ${ids.length}`:'0 books';
 $('previous-results').disabled=page.index===0;$('next-results').disabled=page.index>=page.total-1;
}
$('browse-shelf').onclick=()=>{resultsPage=0;$('find-book').value='';renderCollection();$('collection-dialog').showModal();};
$('find-book').oninput=()=>{resultsPage=0;renderCollection();};
$('previous-results').onclick=()=>{resultsPage--;renderCollection();$('collection-results').scrollTop=0;};
$('next-results').onclick=()=>{resultsPage++;renderCollection();$('collection-results').scrollTop=0;};
$('collection-results').onclick=e=>{const button=e.target.closest('[data-collection-book]');if(!button)return;select(button.dataset.collectionBook);changeView('focus');$('collection-dialog').close();$('selected-book').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'nearest'});};
$('close-collection').onclick=()=>$('collection-dialog').close();
$('book-action').onclick=async()=>{
 const id=chosen[shelf];if(!id||busy)return;busy=true;$('book-action').setAttribute('aria-busy','true');
 try{await onOpen(id,shelf,$('world').querySelector(`[data-book="${CSS.escape(id)}"] .face canvas`));}
 catch{onError('This book could not open. Please try again.');}
 finally{busy=false;$('book-action').removeAttribute('aria-busy');}
};
$('remove-saved').onclick=()=>onRemove(chosen[shelf]);
// Tiny movement belongs to the room, not the books: outside rain, slow motes
// in the lamp beams, and almost imperceptible changes in warm reflected light.
const canvas=$('atmosphere'),ctx=canvas.getContext('2d'),motes=Array.from({length:32},(_,i)=>({x:(i*97.7)%1,y:(i*43.3)%1,seed:i*1.71}));
let frame,last=0;
function atmosphere(t){
 if(document.hidden||reduced.matches){ctx.clearRect(0,0,1536,1024);frame=null;return;}
 if(root.checkVisibility()&&enabled()&&t-last>40){last=t;ctx.clearRect(0,0,1536,1024);
  ctx.save();ctx.beginPath();[[4,0,75,48],[4,61,75,117],[4,195,75,136],[4,349,75,176]].forEach(r=>ctx.rect(...r));ctx.clip();
  for(let i=0;i<26;i++){const x=7+(i*17.33)%67,y=(i*51.77+t*.078)%550;ctx.strokeStyle=`rgba(192,215,213,${.13+i%3*.035})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-.7,y+10);ctx.stroke();}ctx.restore();
  [[215,450,270,555],[550,1000,180,552],[1115,1375,270,555]].forEach(([x0,x1,y0,y1],bay)=>{
   motes.slice(0,bay===1?15:8).forEach((p,i)=>{const x=x0+(p.x*(x1-x0)+Math.sin(t*.00019+p.seed)*14+(i*59)%80)%(x1-x0),y=y1-(p.y*(y1-y0)+t*(.007+i%3*.002))%(y1-y0);ctx.fillStyle=`rgba(222,206,150,${.10+.07*Math.sin(t*.00065+p.seed+bay)})`;ctx.beginPath();ctx.arc(x,y,.55+(i%3)*.16,0,7);ctx.fill();});
  });
  const light=ctx.createRadialGradient(780,170,0,780,170,210);light.addColorStop(0,`rgba(230,171,78,${.012+.007*Math.sin(t*.00058)+.004*Math.sin(t*.0011)})`);light.addColorStop(1,'rgba(230,171,78,0)');ctx.fillStyle=light;ctx.fillRect(560,100,440,390);
 }
 frame=requestAnimationFrame(atmosphere);
}
function startAtmosphere(){if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(atmosphere);}
document.addEventListener('visibilitychange',startAtmosphere);reduced.addEventListener('change',startAtmosphere);startAtmosphere();

return {update(nextTable,nextSaved,nextCatalogue){if(nextCatalogue)catalogue=nextCatalogue;updateData(nextTable,nextSaved);Object.keys(shelves).forEach(renderShelf);updateSelection();layout();},focus(key){focusShelf(key);},get selected(){return chosen[shelf];}};
}
