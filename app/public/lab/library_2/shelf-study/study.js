// Independent concept study. Sample state stays in memory; no production bridges,
// authentication, localStorage, reading-position APIs or parent-library imports.
const $ = id => document.getElementById(id);
const ASSETS = '../assets/';
const books = {
 frankenstein:{title:'Frankenstein',author:'Mary Shelley',binding:'green',place:'Chapter 5',progress:31},
 meditations:{title:'Meditations',author:'Marcus Aurelius',binding:'navy',place:'Book IV',progress:24},
 odyssey:{title:'The Odyssey',author:'Homer',binding:'brown',place:'Book IX',progress:38},
 'crime-and-punishment':{title:'Crime and Punishment',author:'Fyodor Dostoevsky',binding:'black',place:'Part One · Chapter 4',progress:18},
 candide:{title:'Candide',author:'Voltaire',binding:'ochre'},
 'jane-eyre':{title:'Jane Eyre',author:'Charlotte Brontë',binding:'plum'},
 'jekyll-and-hyde':{title:'Dr Jekyll and Mr Hyde',author:'Robert Louis Stevenson',binding:'oxblood'},
 'julius-caesar':{title:'Julius Caesar',author:'William Shakespeare',binding:'brown'},
 'niels-lyhne':{title:'Niels Lyhne',author:'J. P. Jacobsen',binding:'slate'},
 'pride-and-prejudice':{title:'Pride and Prejudice',author:'Jane Austen',binding:'green'},
 'the-prince':{title:'The Prince',author:'Niccolò Machiavelli',binding:'oxblood'},
 'the-awakening':{title:'The Awakening',author:'Kate Chopin',binding:'slate'},
 'notes-from-underground':{title:'Notes from Underground',author:'Fyodor Dostoevsky',binding:'black'}
};
const shelves={reading:['frankenstein','meditations','odyssey','crime-and-punishment'],finished:['jane-eyre','candide','jekyll-and-hyde','julius-caesar','niels-lyhne'],later:['pride-and-prejudice','the-prince']};
const chosen={reading:'frankenstein',finished:'jane-eyre',later:'pride-and-prejudice'};
const centres={reading:776,finished:334,later:1244};
let shelf='reading',view=innerWidth<900?'focus':'overview',toastTimer,gesture=null,suppressClickUntil=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const escapeText=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderShelf(key){
 const hero=key==='reading',width=hero?190:key==='finished'?123:136,depth=hero?38:key==='finished'?24:28;
 $('shelf-'+key).innerHTML=shelves[key].map((id,i)=>{
  const b=books[id],height=hero?285-i%3*5:key==='finished'?205-i%3*7:217-i%3*5;
  return `<button class="volume" data-book="${id}" data-on-shelf="${key}" aria-label="${escapeText(b.title+' by '+b.author)}" aria-pressed="${id===chosen[key]}" style="--depth:${depth}px;--height:${height}px;--cover-width:${width}px;--spine-font:${hero?16:12}px;--binding:url('${ASSETS}spines/spine-${b.binding}.jpg');--bookmark:${20+(b.progress||0)*.55}%"><span class="ribbon" aria-hidden="true"></span><span class="spine" aria-hidden="true"><span>${escapeText(b.title)}</span></span><span class="face"><img src="${ASSETS+id}.jpg" alt="" draggable="false" ${id==='frankenstein'?'fetchpriority="high"':''}></span></button>`;
 }).join('');
 $('count-'+key).textContent=shelves[key].length;
}
function updateSelection(){
 const b=books[chosen[shelf]];
 document.querySelectorAll('[data-shelf]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.shelf===shelf));
 document.querySelectorAll('[data-book]').forEach(el=>el.setAttribute('aria-pressed',chosen[el.dataset.onShelf]===el.dataset.book));
 $('selected-author').textContent=b.author;$('selected-title').textContent=b.title;
 $('selected-progress').textContent=shelf==='reading'?`${b.place} · ${b.progress}% read`:shelf==='finished'?'Finished · a book to return to':'Waiting on your shelf';
 $('book-action').innerHTML=(shelf==='reading'?'Continue reading':shelf==='finished'?'Read again':'Begin reading')+' <span aria-hidden="true">→</span>';
 $('book-dots').innerHTML=shelves[shelf].map(id=>`<button data-select="${id}" aria-label="Choose ${escapeText(books[id].title)}" aria-pressed="${chosen[shelf]===id}"></button>`).join('');
}
function layout(instant=false){
 document.body.dataset.view=view;
 // Measure the destination height, not an in-flight CSS transition.
 const el=$('viewport'),w=el.clientWidth,h=$('geometry-probe').clientHeight,mobile=w<700;
 let scale,x,y;
 if(view==='overview'){
  scale=w/1536;x=0;y=mobile||h>=1024*scale?0:h*.90-572*scale;
 }else{
  scale=Math.min(w/(shelf==='reading'?552:390),h/460);
  if(w>=700)scale=Math.min(w/800,h/440);
  x=w/2-centres[shelf]*scale;y=h*.78-572*scale;
 }
 const world=$('world');if(instant)world.classList.add('instant');
 world.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
 if(instant)requestAnimationFrame(()=>requestAnimationFrame(()=>world.classList.remove('instant')));
 $('view-toggle').setAttribute('aria-pressed',view==='overview');
 $('view-toggle').lastElementChild.textContent=view==='overview'?'Closer look':'Full library';
 $('view-toggle').firstElementChild.textContent=view==='overview'?'↙':'↗';
}
function changeView(next){view=next;layout();}
function focusShelf(key){shelf=key;updateSelection();changeView('focus');}
function select(id,key=shelf){shelf=key;chosen[key]=id;updateSelection();if(view==='focus')layout();}
function step(direction){const ids=shelves[shelf],i=ids.indexOf(chosen[shelf]);select(ids[(i+direction+ids.length)%ids.length]);}
function notify(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
Object.keys(shelves).forEach(renderShelf);updateSelection();layout(true);
new ResizeObserver(()=>layout()).observe($('viewport'));
$('view-toggle').onclick=()=>changeView(view==='overview'?'focus':'overview');
document.querySelectorAll('[data-shelf],[data-focus]').forEach(el=>el.onclick=()=>focusShelf(el.dataset.shelf||el.dataset.focus));
$('world').addEventListener('click',e=>{const b=e.target.closest('[data-book]');if(b)select(b.dataset.book,b.dataset.onShelf);});
$('book-dots').onclick=e=>{const b=e.target.closest('[data-select]');if(b)select(b.dataset.select);};
$('previous-book').onclick=()=>step(-1);$('next-book').onclick=()=>step(1);
document.addEventListener('keydown',e=>{if($('reading-preview').open||e.altKey||e.ctrlKey||e.metaKey||e.target.matches('input,textarea,select')||e.target.isContentEditable)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
// Restrict camera gestures to this illustrated scene. Elsewhere native page
// scrolling and browser zoom remain available; the visible button does both views.
const viewport=$('viewport'),distance=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
viewport.addEventListener('touchstart',e=>{if(e.touches.length===2)gesture={kind:'pinch',distance:distance(e.touches),done:false};else if(e.touches.length===1)gesture={kind:'swipe',x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
viewport.addEventListener('touchmove',e=>{
 if(!gesture)return;
 if(gesture.kind==='pinch'&&e.touches.length===2){e.preventDefault();if(gesture.done)return;const ratio=distance(e.touches)/gesture.distance;if(ratio<.80||ratio>1.23){changeView(ratio<.80?'overview':'focus');gesture.done=true;suppressClickUntil=performance.now()+700;}}
},{passive:false});
viewport.addEventListener('touchend',e=>{
 if(!gesture)return;if(gesture.kind==='swipe'&&e.changedTouches.length===1){const dx=e.changedTouches[0].clientX-gesture.x,dy=e.changedTouches[0].clientY-gesture.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.6){step(dx<0?1:-1);suppressClickUntil=performance.now()+600;}}
 if(!e.touches.length)gesture=null;
},{passive:true});
viewport.addEventListener('touchcancel',()=>gesture=null,{passive:true});
viewport.addEventListener('click',e=>{if(e.isTrusted&&performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
$('discover-books').innerHTML=['notes-from-underground','the-awakening','pride-and-prejudice','the-prince'].map(id=>{
 const b=books[id],added=shelves.later.includes(id);return `<article class="discovery-book"><img src="${ASSETS+id}.jpg" alt="Cover of ${escapeText(b.title)}" loading="lazy"><button class="add-book" data-add="${id}" aria-label="${escapeText((added?'Already on To read: ':'Add to shelf: ')+b.title)}" aria-pressed="${added}">${added?'✓':'+'}</button><h3>${escapeText(b.title)}</h3><p>${escapeText(b.author)}</p></article>`;
}).join('');
$('discover-books').onclick=e=>{const button=e.target.closest('[data-add]');if(!button)return;const id=button.dataset.add;if(shelves.later.includes(id)){focusShelf('later');select(id);$('viewport').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});return;}shelves.later.push(id);renderShelf('later');button.textContent='✓';button.setAttribute('aria-pressed','true');button.setAttribute('aria-label','Already on To read: '+books[id].title);notify('Added to your To read shelf');};
$('book-action').onclick=()=>{const id=chosen[shelf],b=books[id];$('preview-title').textContent=b.title;$('preview-cover').src=ASSETS+id+'.jpg';$('preview-cover').alt='Cover of '+b.title;$('preview-progress').textContent=$('selected-progress').textContent;$('reading-preview').showModal();};
$('close-preview').onclick=()=>$('reading-preview').close();$('reading-preview').onclick=e=>{if(e.target===$('reading-preview')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
// Tiny movement belongs to the room, not the books: outside rain, slow motes
// in the lamp beams, and almost imperceptible changes in warm reflected light.
const canvas=$('atmosphere'),ctx=canvas.getContext('2d'),motes=Array.from({length:32},(_,i)=>({x:(i*97.7)%1,y:(i*43.3)%1,seed:i*1.71}));
let frame,last=0;
function atmosphere(t){
 if(document.hidden||reduced.matches){ctx.clearRect(0,0,1536,1024);frame=null;return;}
 if(t-last>40){last=t;ctx.clearRect(0,0,1536,1024);
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
