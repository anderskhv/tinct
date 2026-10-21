import { reviewedHooks, reviewedCast } from './reviewed-introductions.js?v=20260930fix';
import {periodGroups,inPeriod,populatedShelves,collectionReels,compositionYears} from './browse-groups.js?v=20260929reels';
import '/lab/display-profile.js';
import {registerCommands,openCommands,commandsEnabled} from '/omarchy/experience.js?v=20261005h1';
import {readVisit,rememberVisit} from './visit.js?v=20261001visit';
import {mountHeroNavigation} from './hero-navigation.js?v=20260928covers';
import {mountBookshelf} from './bookshelf.js?v=20261021deskopen';
import {authorPortrait,loadAuthorFlap,renderAuthorFlap,renderImageCredits,authorImageFor} from './authors.js?v=20261009rel10';
import {readingRoom,sceneAsset,tableCrop} from './reading-room.js?v=20260928covers';
import {books} from './books.js?v=20260928covers';
import {opensReader} from './reader-href.js?v=20261020open';
import {loadCatalogueData,loadCatalogue,libraryBook,attachCatalogue,loadIntroduction,readerDestination,readingApi} from './catalogue.js?v=20261014talkwake';
import {drawSceneLife,drawSceneFilm,scenePainting} from './scene-life.js?v=20260930film';
import {mountSceneVideo} from './scene-video.js?v=20261001v4';
import {categories,eras,metadata} from './taxonomy.js?v=20261009rel10';
import {clamp,ease,mix,destination,bookPages,orbFrame,sceneCrop,panelBounds,TUCK,tuckAt,tuckStep,tuckRelease,tuckSettled,tuckShape,tuckRestY,tuckCovers} from './motion.js?v=20261014talkwake';
import {renderBookMetadata,readingTime,bookCategory} from './book-metadata.js?v=20261009rel10';
import {enabled as addEnabled,warmFreeSearch,borrowFromCatalogue,renderSearchGroups,tinctRow,addEngine,paperCover,appendOwnShelf,setAddBusy,syncSearchAddFile,syncLibraryAdd,syncShelfAdd,confirmDeleteUpload,deleteUpload,ownTableId,ownBookCard,shelfMenu,shelfAction,READ_LATER,OFF_READING,ADD_PARAM,PREMIUM_PAGE,resetAddAccess,canAdd,finishAdd} from './add-to-tinct.js?v=20261014talkwake';
import {librarySearch} from './library-search.js?v=20261009rel10';
import {recordRects,playFlip,fadeOut,markGone} from './shelf-motion.js?v=20261009cover';
import {coverSources} from './cover-assets.js?v=20261009owncover';
import {shortTitle} from '../book-title.js?v=20261009owncover';
import {bookCoverSrc} from '../book-cover.js?v=20261009owncover';
import {createQuietLoads,stopOnAbort} from './quiet-loads.js?v=20261015quietopen';
const $=id=>document.getElementById(id), all=s=>[...document.querySelectorAll(s)];
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const reduced={get matches(){return motionPreference.matches||document.documentElement.dataset.eink==='true';}};
let savedBooks=new Set(),savedReady=false;const pendingSaves=new Map();
const iconPaths={readArrow:'<path d="M2 12h20m-6-6 6 6-6 6"/>',search:'<circle cx="10.8" cy="10.8" r="7.3"/><path d="m16 16 5 5"/>',play:'<path d="m6 3 15 9-15 9z"/>',minus:'<path d="M5 12h14"/>',plus:'<path d="M12 5v14M5 12h14"/>',mic:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-3 0h6"/>',mute:'<path d="m3 3 18 18M9 9v3a3 3 0 0 0 5 2M9 5a3 3 0 0 1 6 0v4M5 10v2a7 7 0 0 0 12 5M19 10v2M12 19v3"/>',chat:'<path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.4L3 21l2.1-5.5A8.5 8.5 0 1 1 21 11.5Z"/>',end:'<path d="m6 6 12 12M18 6 6 18"/>',send:'<path d="m22 2-7 20-4-9L2 9 22 2ZM11 13 22 2"/>'};
function icon(name){return `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name]||''}</svg>`;}
all('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
// A book being read opens straight in the reader, or says it could not (reader-href.js).
let openingReader=false;
async function openInReader(book){if(openingReader)return;openingReader=true;document.body.classList.add('leaving');try{const [href]=await Promise.all([readerDestination(book,null),new Promise(r=>setTimeout(r,240))]);if(!opensReader(href))throw new Error('Reader unavailable');location.assign(href);}catch{openingReader=false;document.body.classList.remove('leaving');notice('This book could not open. Please try again.');}}
let noticeTimer;function notice(text){$('notice').textContent=text;$('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').hidden=true,5000);}
const images={};const textures=new Map();
// Optional warming (other books' scenes, sketches, hero covers) yields to a book being opened.
const quiet=createQuietLoads();
for(const book of books)book.coverSources=coverSources(book.id,{src:book.cover});
// Books held from the shelves that a typed search still finds (War and Peace, 2026-10-08): not in `books`, but they have covers.
const searchOnlyBooks=[];
/** A book by id among every book the page paints: the shelves' books and the search-only ones. */
function bookById(id){return books.find(b=>b.id===id)||searchOnlyBooks.find(b=>b.id===id);}
const imageSrc=key=>`assets/${key==='room-wide'?'room-wide-v2':key==='room'?'room-sharp':key}.jpg`;
async function loadImage(key,low,signal,kept){if(images[key])return images[key];const im=new Image();im.fetchPriority=low?'low':'high';im.src=imageSrc(key);await (signal?Promise.race([im.decode(),stopOnAbort(im,signal,kept)]):im.decode());images[key]=im;if(reduced.matches)drawScene(performance.now());return im;}
function triangle(ctx,img,s,d){const [p,q,r]=s,[a,b,c]=d;const det=(q[0]-p[0])*(r[1]-p[1])-(r[0]-p[0])*(q[1]-p[1]);const aa=((b[0]-a[0])*(r[1]-p[1])-(c[0]-a[0])*(q[1]-p[1]))/det,cc=((c[0]-a[0])*(q[0]-p[0])-(b[0]-a[0])*(r[0]-p[0]))/det,bb=((b[1]-a[1])*(r[1]-p[1])-(c[1]-a[1])*(q[1]-p[1]))/det,dd=((c[1]-a[1])*(q[0]-p[0])-(b[1]-a[1])*(r[0]-p[0]))/det;ctx.save();ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.closePath();ctx.clip();ctx.transform(aa,bb,cc,dd,a[0]-aa*p[0]-cc*p[1],a[1]-bb*p[0]-dd*p[1]);ctx.drawImage(img,0,0);ctx.restore();}
function makeTextures(){for(const book of books){const c=document.createElement('canvas');c.width=480;c.height=720;const ctx=c.getContext('2d');if(book.crop){const [x,y,w,h]=book.crop;ctx.drawImage(images.plate,x,y,w,h,0,0,480,720);}else{const corners=[[740,133],[1006,154],[1012,585],[739,588]];const point=(u,v)=>[mix(mix(corners[0][0],corners[1][0],u),mix(corners[3][0],corners[2][0],u),v),mix(mix(corners[0][1],corners[1][1],u),mix(corners[3][1],corners[2][1],u),v)];for(let j=0;j<12;j++)for(let i=0;i<8;i++){const u=i/8,v=j/12,u2=(i+1)/8,v2=(j+1)/12;const s=[point(u,v),point(u2,v),point(u2,v2),point(u,v2)],d=[[u*480,v*720],[u2*480,v*720],[u2*480,v2*720],[u*480,v2*720]];triangle(ctx,images.original,[s[0],s[1],s[2]],[d[0],d[1],d[2]]);triangle(ctx,images.original,[s[0],s[2],s[3]],[d[0],d[2],d[3]]);}}textures.set(book.id,c);}paintCovers();}
// A cover is painted at the size it is shown (its CSS width × the screen's pixel ratio, at
// most the painting's own), never at the painting's full 1024×1536: 120 full-size cover
// canvases held ~1 GB of canvas and GPU memory on loading /library (2026-10-08). A canvas not
// laid out yet (detached, hidden) gets at most COVER_FALLBACK_WIDTH (a shelf cover not painted while off screen,
// styles.css content-visibility, reads its card's width: its own reads 0); the observer below repaints
// a cover when it is shown at a size its pixels no longer suit (a resize, the hero's cover).
const COVER_FALLBACK_WIDTH=600;
function coverSize(c,texture){const nw=texture.naturalWidth||texture.width,nh=texture.naturalHeight||texture.height;if(!nw||!nh)return [nw,nh];const css=c.isConnected?c.clientWidth||c.closest('.book-card')?.clientWidth||0:0,dpr=Math.min(devicePixelRatio||1,2);const w=Math.max(1,Math.min(nw,css?Math.ceil(css*dpr):COVER_FALLBACK_WIDTH));return [w,Math.max(1,Math.round(w*nh/nw))];}
// The observer only notes covers; observing new ones and repainting wait for the next frame.
// A cover painted while the browser delivers resize notifications (an image decode settling
// mid-frame in WebKit) was observed inside that loop, and every such new observation went
// undelivered: "ResizeObserver loop completed with undelivered notifications" (2026-10-08).
const coverResize=typeof ResizeObserver==='undefined'?null:new ResizeObserver(entries=>{for(const {target} of entries)coverRecheck.add(target);scheduleCoverWork();});
const coverWatch=new Set(),coverRecheck=new Set();let coverWork=0;
function scheduleCoverWork(){if(!coverWork)coverWork=requestAnimationFrame(()=>{coverWork=0;for(const c of coverWatch)coverResize.observe(c);coverWatch.clear();for(const c of coverRecheck){const texture=c.isConnected&&c.dataset.painted&&textures.get(c.dataset.book);if(!texture)continue;const [w]=coverSize(c,texture);if(Math.abs(w-c.width)>w*.25)paintCover(c,c.dataset.book);const book=(texture.naturalWidth||texture.width)<c.clientWidth*Math.min(devicePixelRatio||1,2)*.8&&(coverBooks.get(c)||bookById(c.dataset.book));if(book)shelfCover(book);}coverRecheck.clear();});}
function watchCover(c){if(!coverResize)return;coverWatch.add(c);scheduleCoverWork();}
function paintCover(c,id){const texture=textures.get(id);if(!texture||c.dataset.released)return;const [w0,h0]=coverSize(c,texture);c.width=w0;c.height=h0;const ctx=c.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(texture,0,0,w0,h0);if(!c.dataset.painted&&c.dataset.book)watchCover(c);c.dataset.painted='true';if(c.parentElement?.id==='hero-book')$('hero-cover-preview').hidden=true;const book=bookById(id);if(book?.typeset){const w=c.width,h=c.height;
const designs={
 'julius-caesar':{lines:['JULIUS','CAESAR'],y:.16,size:.16,align:'left',x:.10},
 'the-prince':{lines:['THE','PRINCE'],y:.68,size:.15,align:'center',x:.5},
 'jane-eyre':{lines:['Jane','Eyre'],y:.24,size:.21,align:'center',x:.5,italic:true},
 'odyssey':{lines:['THE ODYSSEY'],y:.12,size:.086,align:'center',x:.5},
 'crime-and-punishment':{lines:['CRIME','AND','PUNISHMENT'],y:.17,size:.115,align:'left',x:.09},
 'pride-and-prejudice':{lines:['Pride &','Prejudice'],y:.67,size:.12,align:'center',x:.5,italic:true}};
const d=designs[book.id];ctx.fillStyle='#efe6cc';ctx.textAlign=d.align;ctx.textBaseline='middle';ctx.shadowColor='#090b08';ctx.shadowBlur=w*.013;
ctx.font=`${d.italic?'italic ':''}${w*d.size}px Georgia`;d.lines.forEach((line,i)=>ctx.fillText(line,w*d.x,h*d.y+i*w*d.size*1.15,w*.83));ctx.font=`${w*.033}px Georgia`;ctx.textAlign='center';ctx.fillText(book.author.toUpperCase(),w/2,h*.945,w*.86);ctx.shadowBlur=0;
if(book.id==='odyssey'){ctx.strokeStyle='#d1bd7780';ctx.lineWidth=w*.003;ctx.beginPath();ctx.moveTo(w*.15,h*.17);ctx.lineTo(w*.85,h*.17);ctx.stroke();}
}}


function paintCovers(){all('canvas[data-book]').forEach(c=>paintCover(c,c.dataset.book));}
// Covers load as they near the screen: the full catalogue must not download at once.
const coverReady=new Map();
// A cover's painting is kept as a bitmap at most COVER_TEXTURE_WIDTH wide (the hero's cover at a
// 2× screen), not as the decoded 1024×1536 image: each full-size source stayed in the decode
// cache for every canvas drawn from it (≈6 MB apiece, 300+ MB on loading /library).
const COVER_TEXTURE_WIDTH=640;
async function coverTexture(im,cap=COVER_TEXTURE_WIDTH){const nw=im.naturalWidth,nh=im.naturalHeight;if(!nw||!nh||nw<=cap||typeof createImageBitmap!=='function')return im;try{return await createImageBitmap(im,{resizeWidth:cap,resizeHeight:Math.round(cap*nh/nw),resizeQuality:'high'});}catch{return im;}}
// Each surface takes the cover at about the pixels it draws (2026-10-10): the shelves' cards (106-212
// CSS px, at most 2× in the canvas) and the desk (at most 235 CSS px) the 480 px copy, the hero its
// 960, the introduction's large cover the painting whole, from the book's own list of files
// (cover-assets.js coverSources: a painting's copies, or catalogue art and its @2x, or the one file).
// A texture already loaded smaller than a later surface needs is replaced by the larger one.
// A warming load (a signal: another featured book's hero cover) only downloads the file (2026-10-21): six
// decoded 960 px covers held 32 MB on a phone for books not on screen; choosing one decodes it from the cache.
function ensureCover(book,need=COVER_SHELF_PX,signal){if(signal&&!book.paper){const source=coverSource(book,need);if(coverReady.has(book.id)&&(textureWidths.get(book.id)||0)>=Math.min(need,source.width))return coverReady.get(book.id);const im=new Image();im.fetchPriority='low';const loaded=new Promise((resolve,reject)=>{im.onload=()=>resolve();im.onerror=reject;});im.src=source.src;return Promise.race([loaded,stopOnAbort(im,signal)]);}if(book.paper&&!coverReady.has(book.id)){textures.set(book.id,paperCover(book.title,book.author));coverReady.set(book.id,Promise.resolve());textureWidths.set(book.id,Infinity);all('canvas[data-book]').filter(c=>c.dataset.book===book.id).forEach(c=>paintCover(c,book.id));}const source=coverSource(book,need);if(!coverReady.has(book.id)||(textureWidths.get(book.id)||0)<Math.min(need,source.width)){textureWidths.set(book.id,need<COVER_SHELF_PX?Math.min(need,source.width):source.width);const load={kept:!signal};coverLoads.set(book.id,load);const ready=(async()=>{const im=new Image();if(need>=COVER_HERO_PX)im.fetchPriority='high';im.src=source.src;await (signal?Promise.race([im.decode(),stopOnAbort(im,signal,()=>load.kept)]):im.decode());textures.set(book.id,await coverTexture(im,need<COVER_SHELF_PX?need:Math.max(COVER_TEXTURE_WIDTH,Math.min(need,im.naturalWidth||need))));all('canvas[data-book]').filter(c=>c.dataset.book===book.id).forEach(c=>paintCover(c,book.id));})();ready.catch(()=>{if(coverReady.get(book.id)===ready){coverReady.delete(book.id);textureWidths.delete(book.id);}if(!signal?.aborted||load.kept)paperFallback(book);});coverReady.set(book.id,ready);}else if(!signal){const load=coverLoads.get(book.id);if(load)load.kept=true;}return coverReady.get(book.id);}
// A warming load (with a signal, quiet-loads.js) stops when a book opens, unless a surface came to need it meanwhile.
const coverLoads=new Map();
const COVER_SHELF_PX=480,COVER_HERO_PX=960,COVER_WHOLE_PX=Infinity;
const textureWidths=new Map();
/** The book's file for `need` device pixels: the smallest of its sources at least that wide, else its largest (or its one cover). */
function coverSource(book,need){const sources=Array.isArray(book.coverSources)&&book.coverSources.length?book.coverSources:[{src:book.cover,width:Infinity}];return sources.find(s=>s.width>=need)||sources[sources.length-1];}
// A painting that cannot load still leaves a cover: its paper boards, never a blank canvas (a later approach retries the painting).
function paperFallback(book){if(textures.has(book.id))return;try{textures.set(book.id,paperCover(book.title,book.author));}catch{return;}all('canvas[data-book]').filter(c=>c.dataset.book===book.id).forEach(c=>paintCover(c,book.id));}
// Each canvas keeps the book it was made for, so a book not (yet) in searchPool() still paints.
// rootMargin reaches only the viewport; scrollMargin also loads the covers just past a reel's edge.
// A returning reader's desk is being prepared: the shelves' covers (the paintings are 450-760 KB
// each, and the Featured row asks for eight at once) wait until the desk has been revealed, so its
// own cover and spines have the connection (2026-10-10). The wait ends with the desk, with a first
// visit's scene, or after a few seconds, so an error state never leaves the shelves blank.
const deskPending=()=>typeof window!=='undefined'&&!!window.__library2Boot?.hint&&/\breturning-(scene-)?pending\b/.test(document.documentElement.className);
const deskRevealed=new Promise(resolve=>{if(!deskPending())return resolve();const done=()=>{observer.disconnect();clearTimeout(timer);resolve();};const observer=new MutationObserver(()=>{if(!deskPending())done();});observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});const timer=setTimeout(done,6000);});
const coverBooks=new WeakMap();
// While a book opens, covers coming near the screen wait for it (quiet-loads.js); covers already loading go on.
const coverSeen=observer=>entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const book=coverBooks.get(entry.target)||bookById(entry.target.dataset.book);if(!book)return;observer().unobserve(entry.target);quiet.run('shelf:'+book.id,()=>shelfCover(book));});
const coverObserver=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(coverSeen(()=>coverObserver),{rootMargin:'400px',scrollMargin:'400px'});
// An added book's painting is its route's one full-size file (1024×1536, ~400 KB; the route keeps
// no smaller copy), not a 30-60 KB card copy. The 400 px margins reach three rows down and two cards
// past a phone's reel edge, so two of them (Gorgias, A Modest Proposal) downloaded unseen on a phone's
// first paint (QA 2026-10-15). These covers load a card ahead instead: still past the reel's edge.
const fullSizeCover=book=>/^\/api\/public-books\/[^/]+\/cover$/.test(coverSource(book,COVER_SHELF_PX)?.src||'');
const fullCoverObserver=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(coverSeen(()=>fullCoverObserver),{rootMargin:'150px',scrollMargin:'150px'});
// A shelf cover nearing the screen; the desk's own covers (prepareCover) never wait.
// A shelf's painting is kept at the pixels its covers draw (2026-10-21): a phone's card is 212 px wide,
// and each 540×810 painting kept whole held 1.7 MB where 0.27 MB is drawn. Any surface showing the book
// counts (a search row, the hero); a later, larger surface loads it again larger (ensureCover).
function shelfNeed(id){const dpr=Math.min(typeof devicePixelRatio==='number'&&devicePixelRatio||1,2);let px=0;for(const c of all('canvas[data-book]'))if(c.dataset.book===id&&c.isConnected!==false)px=Math.max(px,(c.clientWidth||c.closest?.('.book-card')?.clientWidth||0)*dpr);return px?Math.max(1,Math.min(COVER_SHELF_PX,Math.ceil(px))):COVER_SHELF_PX;}
function shelfCover(book){(deskPending()?deskRevealed.then(()=>ensureCover(book,shelfNeed(book.id))):ensureCover(book,shelfNeed(book.id))).catch(()=>{});}
function observeCover(c,book){paintCover(c,book.id);coverBooks.set(c,book);const observer=fullSizeCover(book)?fullCoverObserver:coverObserver;if(observer)observer.observe(c);else shelfCover(book);}
// The first cover has priority; shelves and other scenes load as they approach view.
if(!window.__library2Boot?.hint)ensureCover(books[0],COVER_HERO_PX).catch(()=>{});
function coverMetadata(book){const meta=el('span','cover-metadata');meta.dataset.metadataBook=book.id;renderBookMetadata(meta,book,{compact:true});return meta;}
function refreshMetadata(){all('[data-metadata-book]').forEach(meta=>{const book=bookById(meta.dataset.metadataBook);renderBookMetadata(meta,book,{compact:true});});const time=readingTime(featured);if(time&&linkedState!=='pending')$('hero-time').textContent=time;}
// A shelf more than a screen above or below the screen gives its covers' pixels back
// (2026-10-21): with every shelf painted, an iPhone ran out of memory opening a book (The Jungle
// Book). Its canvases go empty, and a painting no surface on screen still shows lets go of its
// decoded copy; both return before the shelf comes back into view: the canvas is repainted at
// once, or the painting is decoded again from the browser's cache, a screen ahead of being seen.
const SHELF_KEEP_MARGIN='100% 0px';
const shelfMemory=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{for(const {target,isIntersecting} of entries)target.querySelectorAll('canvas[data-book]').forEach(c=>isIntersecting?restoreCover(c):releaseCover(c));},{rootMargin:SHELF_KEEP_MARGIN});
function releaseCover(c){if(!c.dataset.painted||c.dataset.released)return;c.dataset.released='true';delete c.dataset.painted;c.width=0;c.height=0;releaseTexture(c.dataset.book);}
function restoreCover(c){if(!c.dataset.released)return;delete c.dataset.released;const id=c.dataset.book;if(textures.has(id)){paintCover(c,id);return;}const book=coverBooks.get(c)||bookById(id);if(book)shelfCover(book);}
// While a book is open the library behind it keeps only the shelves on screen painted (2026-10-21): the
// open book's own layers are what tipped an iPhone over, so the shelves a screen away give theirs back
// first. Closing the book repaints them as the shelves' usual margin asks (shelfMemory, observed again).
const openShelfMemory=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{for(const {target,isIntersecting} of entries)if(!isIntersecting)target.querySelectorAll('canvas[data-book]').forEach(releaseCover);});
function bookOpenMemory(open){if(!openShelfMemory||!shelfMemory)return;const shelves=all('#shelves .shelf');if(open){shelves.forEach(s=>openShelfMemory.observe(s));return;}openShelfMemory.disconnect();shelves.forEach(s=>{shelfMemory.unobserve(s);shelfMemory.observe(s);});}
/** Drops a painting's decoded copy once every canvas that shows it has given its pixels back. */
function releaseTexture(id){if(!id||id===featured?.id||id===activeBook?.id||!textures.has(id)||!coverReady.has(id))return;if(all('canvas[data-book]').some(c=>c.dataset.book===id&&!c.dataset.released))return;const texture=textures.get(id);textures.delete(id);coverReady.delete(id);textureWidths.delete(id);if(typeof texture?.close==='function')texture.close();}
/** A search row's small cover: painted like the shelf covers; the opening book flies from it. */
function rowCover(book){const c=el('canvas','cover');c.dataset.book=book.id;observeCover(c,book);return c;}
function coverButton(book,cls='book-card cover-button'){const b=el('button',cls);b.setAttribute('aria-label',`Open ${book.title}, by ${book.author}`);const c=el('canvas','cover');c.dataset.book=book.id;b.append(c);b.addEventListener('click',()=>openBook(book,c));observeCover(c,book);if(cls!=='book-card cover-button'){b.append(coverMetadata(book));return b;}
 // Shelf covers carry a + for Want to read, beside (not inside) the cover button.
 const wrap=el('div','card-wrap');const save=el('button','save-toggle');save.dataset.book=book.id;save.dataset.title=book.title;paintSaveToggle(save);save.onclick=e=>{e.stopPropagation();toggleSaved(book.id);};wrap.append(b,save,coverMetadata(book));return wrap;}
[['Featured',books.map((_,i)=>i)]].forEach(([title,indices])=>{const section=el('section','shelf');section.append(el('h2','',title));const row=el('div','book-row');row.setAttribute('aria-label',title);indices.forEach(i=>row.append(coverButton(books[i])));section.append(row);$('shelves').append(section);shelfMemory?.observe(section);});
// The rest of the library: every discoverable book, shelved by house.
function searchPool(){const extra=searchOnlyBooks.filter(s=>!books.some(b=>b.id===s.id));return extra.length?[...books,...extra]:books;}
loadCatalogue().then(({books:entries,searchOnly=[],houses})=>{for(const entry of searchOnly){const book=libraryBook(entry);attachCatalogue(book,entry);if(entry.altTitles?.length)book.altTitles=entry.altTitles;searchOnlyBooks.push(book);}const byId=new Map(entries.map(e=>[e.id,e]));entries.forEach(placePublicBook);books.forEach(book=>{const entry=byId.get(book.id);if(entry)attachCatalogue(book,entry);});entries.forEach(entry=>{if(books.some(b=>b.id===entry.id))return;const book=libraryBook(entry);attachCatalogue(book,entry);books.push(book);});
 // Other titles the registry gives a book (altTitles) are searched as titles.
 for(const book of books){const alt=byId.get(book.id)?.altTitles;if(alt?.length)book.altTitles=alt;}
 houses.forEach(house=>{const ids=[...new Set(house.shelves.flatMap(shelf=>shelf.bookIds||[]))].filter(id=>byId.has(id));if(!ids.length)return;const section=el('section','shelf');section.append(el('h2','',house.title));const row=el('div','book-row');row.setAttribute('aria-label',house.title);ids.forEach(id=>row.append(coverButton(books.find(b=>b.id===id))));section.append(row);$('shelves').append(section);shelfMemory?.observe(section);});
 libraryHouses=houses;renderBrowseMenus();
 refreshMetadata();
 if(searchOpen&&!openedFromSearch)renderResults();if(collectionChoice!=='home')renderCollection();}).catch(()=>{});
// Signature books: each has its own painted scene (assets/scene-<id>-{phone,wide}.jpg)
// and pencil character studies. Frankenstein keeps the original rain room.
const signature={'frankenstein':{hours:6,genre:'Fiction',question:'What do we owe to the intelligence we create?',sketches:['Victor Frankenstein','the creature','Robert Walton'],sheet:'assets/frankenstein-character-ink.png'},'pride-and-prejudice':{hours:11,genre:'Fiction',question:'How far can we trust a first impression?',sketches:['Elizabeth Bennet','Mr. Darcy','Jane Bennet']},'odyssey':{hours:12,genre:'Poetry',question:'How far must we travel to find home?',sketches:['Odysseus','Penelope','Telemachus']},'crime-and-punishment':{hours:21,genre:'Fiction',question:'Can an idea make a crime right?',sketches:['Raskolnikov','Sonya Marmeladov','Porfiry Petrovich']},'the-prince':{hours:3,genre:'Politics',question:'Can a ruler afford to be good?',sketches:['Niccolò Machiavelli','Cesare Borgia']},'meditations':{hours:5,genre:'Philosophy',question:'How do we stay steady in a world we cannot control?',sketches:['Marcus Aurelius','Epictetus']}};
Object.keys(signature).forEach(id=>{if(reviewedHooks[id])signature[id].question=reviewedHooks[id];});
const sceneIds=new Set(Object.keys(signature).filter(id=>id!=='frankenstein'));
// A book link (/library?book=<id>, /read/<id>) puts that book in the hero (boot.js).
const linkedBook=window.__library2Boot?.book||null;let linkedState=linkedBook?'pending':null;
let featured=books[0],featureRequest=0,featuredTarget=0;// The hero's scene pills. Pride and Prejudice keeps its scene and stays on the Featured list, but not as a pill.
const HERO_PILL_SKIP=new Set(['pride-and-prejudice']);
const featuredBooks=Object.keys(signature).filter(id=>!HERO_PILL_SKIP.has(id)).map(id=>books.find(b=>b.id===id)).filter(Boolean);
if(linkedBook)featuredTarget=featuredBooks.findIndex(b=>b.id===linkedBook);else document.querySelector('.question').textContent=signature[featured.id].question;
featuredBooks.forEach((book,i)=>{const b=el('button');b.setAttribute('aria-label',`Feature ${book.title}`);b.classList.toggle('active',i===featuredTarget);b.addEventListener('click',async()=>{if(linkedState==='pending')linkedState=null;const request=++featureRequest;featuredTarget=i;b.setAttribute('aria-busy','true');try{await Promise.all([ensureCover(book,COVER_HERO_PX),loadScene(book.id)]);if(request!==featureRequest)return;featured=book;rememberVisit({featured:book.id});updateHeroAction();const info=signature[book.id];$('hero-time').textContent=readingTime(book)||`~${info.hours} hours to read`;$('hero-genre').textContent=info.genre;$('hero-title').textContent=book.title;$('hero-author').textContent=book.author+'’s';document.querySelector('.question').textContent=info.question;$('hero-book').setAttribute('aria-label',`Open ${book.title}`);const c=$('hero-book').querySelector('canvas');c.dataset.book=book.id;paintCover(c,book.id);showScene(book.id);all('.hero-dots button').forEach((e,j)=>{e.classList.toggle('active',i===j);e.setAttribute('aria-pressed',String(i===j));});}catch{if(request===featureRequest){featuredTarget=featuredBooks.indexOf(featured);notice('This scene could not load. Please try again.');}}finally{b.removeAttribute('aria-busy');}});b.setAttribute('aria-pressed',String(i===featuredTarget));document.querySelector('.hero-dots').append(b);});
function updateHeroAction(){const continuing=window.__library2Reading?.reading.some(b=>b.bookId===featured.id);$('read-featured').firstChild.textContent=continuing?'Continue':'Read';}
async function openFeatured(){if(window.__library2Reading?.reading.some(b=>b.bookId===featured.id)){try{const href=await readerDestination(featured,null);if(href!=='/reader')throw new Error();rememberVisit({featured:featured.id});location.assign(href);}catch{notice('Your book could not open. Please try again.');}}else openBook(featured,$('hero-book').querySelector('canvas'));}
$('hero-book').onclick=$('read-featured').onclick=openFeatured;
addEventListener('library2:reading',updateHeroAction);
// Signed in: Account; signed out: Sign in. Both go to the production account page and come back here.
function syncAccountButton(){const signedIn=document.documentElement.classList.contains('signed-in');if(!$('sign-in').classList.contains('cards-you'))$('sign-in').textContent=signedIn?'Account':'Sign in';$('sign-in').onclick=()=>location.assign(`/sign-in?${signedIn?'mode=account&':''}returnTo=${encodeURIComponent('/library')}`);}
syncAccountButton();
$('header').querySelector('.logo').onclick=e=>{e.preventDefault();if(activeBook)closeBook();else selectCollection('home');};
addEventListener('scroll',()=>$('header').classList.toggle('scrolled',scrollY>20),{passive:true});

// One image, one coordinate system. Rain is clipped to window panes and never
// painted over the table or the bottle silhouette in the foreground.
const panes=[[[521,0],[626,0],[629,155],[526,170]],[[646,0],[839,0],[841,139],[648,154]],[[878,0],[1063,0],[1065,117],[880,136]],[[1077,0],[1137,0],[1149,110],[1080,117]],[[530,191],[629,178],[636,496],[536,504]],[[649,173],[840,157],[845,498],[650,500]],[[883,153],[1066,133],[1075,500],[886,502]],[[1083,130],[1150,122],[1164,500],[1090,503]]];
const widePanes=[[[1050,120],[1114,108],[1114,259],[1049,267]],[[1131,0],[1255,0],[1258,249],[1131,262]],[[1290,0],[1403,0],[1405,231],[1290,245]],[[1423,0],[1487,0],[1490,223],[1423,232]],[[1508,0],[1546,0],[1550,217],[1508,222]],[[1050,287],[1115,280],[1116,417],[1051,417]],[[1133,282],[1259,268],[1262,516],[1134,513]],[[1292,263],[1406,251],[1413,516],[1294,516]],[[1427,249],[1490,240],[1499,514],[1427,517]],[[1510,238],[1552,234],[1557,514],[1517,515]]];
let sceneFrom=null,sceneTo=window.__library2Boot?.scene||'frankenstein',sceneStart=0,scenePending=sceneTo;const sceneLoads=new Map();
function sceneImage(id,wide){const key=sceneAsset(id,wide);if(!images[key]&&!sceneLoads.has(key)){sceneLoads.set(key,loadImage(key).catch(()=>sceneLoads.delete(key)));}return images[key]||images[sceneAsset(id,!wide)];}
// Only the variant the hero's shape needs (wide on landscape screens, phone otherwise).
const sceneVariant=()=>{const h=$('hero');return h.clientWidth/Math.max(1,h.clientHeight)>1.2?'wide':'phone';};
// A warming load (with a signal) stops when a book opens, unless the hero came to need that scene meanwhile.
const scenesNeeded=new Set();
// Warming another featured book's scene (a signal) downloads it and nothing more (2026-10-21): each
// scene decoded and kept was 5-6 MB of memory on a phone for a painting not on screen. Showing it
// decodes it from the browser's cache, and a scene no longer shown is let go (dropScenes).
function loadScene(id,low,signal){const key=sceneAsset(id,sceneVariant()==='wide');if(signal&&!images[key]&&!sceneLoads.has(key)){const im=new Image();im.fetchPriority='low';const loaded=new Promise((resolve,reject)=>{im.onload=()=>resolve();im.onerror=reject;});im.src=imageSrc(key);return Promise.race([loaded,stopOnAbort(im,signal,()=>scenesNeeded.has(key))]);}if(!signal)scenesNeeded.add(key);if(!sceneLoads.has(key)){const ready=loadImage(key,low,signal,()=>scenesNeeded.has(key));ready.catch(()=>sceneLoads.delete(key));sceneLoads.set(key,ready);}return sceneLoads.get(key);}
function showScene(id){const target=sceneIds.has(id)||/^table-(morning|afternoon|evening|night)$/.test(id)?id:'frankenstein';scenePending=target;loadScene(target).then(()=>{if(scenePending!==target||sceneTo===target)return;const now=performance.now();sceneFrom=now-sceneStart<SCENE_FADE/2?sceneFrom:sceneTo;sceneTo=target;sceneStart=now;document.documentElement.dataset.scene=target;if(reduced.matches)drawScene(now);}).catch(()=>{});}
const SCENE_FADE=700;
// Match each portrait painting's table horizon to the book's base, leaving
// a little depth behind it on the table, including on shorter phone screens.
const phoneTableY={'pride-and-prejudice':675,odyssey:775,'crime-and-punishment':745,'the-prince':675,meditations:730};
// A table scene's crop is settled once per scene and canvas size: the placeholder's own crop when boot.js
// painted one (same scene, same box), else the first one computed. The hero's text grows as the title,
// the kicker and the place arrive, which moves the table stage; re-cropping on each of those re-framed
// the room three times on the way back from the reader (Anders, iPhone, 11 Oct 2026).
const tableCrops=new Map();
function cropForScene(id,w,h,img,wide){if(id.startsWith('table-')){const key=`${id}|${w}x${h}|${img.naturalWidth}x${img.naturalHeight}`;let c=tableCrops.get(key);if(!c){const b=window.__library2Boot?.crop;c=b&&b.id===id&&b.w===w&&b.h===h?{x:b.x,y:b.y,w:b.cw,h:b.ch,scale:b.scale}:tableCropNow(id,w,h,img,wide);tableCrops.set(key,c);}return c;}return cropForSceneNow(id,w,h,img,wide);}
function tableCropNow(id,w,h,img,wide){return cropForSceneNow(id,w,h,img,wide);}
function cropForSceneNow(id,w,h,img,wide){if(!id.startsWith('table-')){if(!wide&&phoneTableY[id]){const book=$('hero-book').getBoundingClientRect(),hero=$('hero').getBoundingClientRect();return tableCrop(w,h,img.naturalWidth,img.naturalHeight,phoneTableY[id],book.bottom-hero.top-book.height*.13);}return sceneCrop(w,h,img.naturalWidth,img.naturalHeight,wide?.5:.7);}const stage=document.querySelector('.rt-stage'),hero=$('hero');const r=stage?.getBoundingClientRect();const height=parseFloat(document.querySelector('.reading-table')?.style.getPropertyValue('--bh'))||260;const edge=r?r.bottom-hero.getBoundingClientRect().top-height*.22:h*.6;return tableCrop(w,h,img.naturalWidth,img.naturalHeight,img.naturalHeight*(wide?.64:.51),Math.max(h*.3,Math.min(h*.8,edge)));}
let returningScene=window.__library2Boot?.scene?.startsWith('table-')?window.__library2Boot.scene:'table-'+readingRoom();
if(!window.__library2Boot?.hint)loadScene(sceneTo).catch(()=>notice('The scene could not load. Please refresh to try again.'));
addEventListener('library2:reading',e=>{if(e.detail.mode!=='returning')showScene(linkedState==='pending'?linkedBook:featured.id);else if(document.documentElement.dataset.returningView==='table')showScene(returningScene);});
// Desktop film loops of the wide paintings; the canvas composites their frames.
const sceneVideo=mountSceneVideo($('hero'),$('scene'));
/** Lets go of every decoded scene but the one shown (both shapes of it); showing another decodes it again from the cache. */
function dropScenes(){const keep=new Set([sceneAsset(sceneTo,true),sceneAsset(sceneTo,false)]);for(const key of [...sceneLoads.keys()])if(!keep.has(key)&&images[key]){delete images[key];sceneLoads.delete(key);scenesNeeded.delete(key);}}
function drawScene(time){const canvas=$('scene'),w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(!w||!h)return;if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const wide=w/h>1.2;const fade=reduced.matches||!sceneFrom?1:ease(clamp((time-sceneStart)/SCENE_FADE,0,1));if(fade===1&&sceneFrom){sceneFrom=null;dropScenes();}const current=sceneImage(sceneTo,wide);sceneVideo.sync(sceneTo,wide&&!!current&&current.naturalWidth>current.naturalHeight);const layer=(id,alpha)=>{const img=sceneImage(id,wide);if(!img||alpha<=0)return;const imageWide=img.naturalWidth>img.naturalHeight,c=cropForScene(id,w,h,img,imageWide);ctx.globalAlpha=alpha;ctx.drawImage(scenePainting(img,id),c.x,c.y,c.w,c.h,0,0,w,h);ctx.globalAlpha=1;const film=imageWide&&wide&&sceneVideo.frame(id);if(film)drawSceneFilm(ctx,id,film,img,c,w,h,alpha);};if(sceneFrom)layer(sceneFrom,1);layer(sceneTo,fade);drawBookGround(ctx);if(!reduced.matches){const life=(id,alpha)=>{const img=sceneImage(id,wide);if(!img||id==='frankenstein')return;const imageWide=img.naturalWidth>img.naturalHeight;drawSceneLife(ctx,id,imageWide,img,cropForScene(id,w,h,img,imageWide),alpha,time);};if(sceneFrom)life(sceneFrom,1-fade);life(sceneTo,fade);}const rain=((sceneTo==='frankenstein'?fade:0)+(sceneFrom==='frankenstein'?1-fade:0))*(1-(wide&&sceneVideo.frame('frankenstein')?.alpha||0));if(reduced.matches||rain<=0)return;const img=sceneImage('frankenstein',wide);if(!img||(img.naturalWidth>img.naturalHeight)!==wide)return;const crop=sceneCrop(w,h,img.naturalWidth,img.naturalHeight,wide?.5:.7);ctx.save();ctx.globalAlpha=rain;ctx.scale(crop.scale,crop.scale);ctx.translate(-crop.x,-crop.y);ctx.beginPath();(wide?widePanes:panes).forEach(p=>{ctx.moveTo(...p[0]);p.slice(1).forEach(q=>ctx.lineTo(...q));ctx.closePath();});ctx.clip();if(!wide){ctx.beginPath();ctx.rect(0,0,1183,1330);ctx.rect(492,178,202,378);ctx.clip('evenodd');}ctx.lineWidth=1.05;for(let i=0;i<140;i++){const x=(wide?1040:520)+(i*73.39)%(wide?520:660),y=((time*.10+i*51.79)%(wide?525:510))-20;ctx.strokeStyle=`rgba(212,235,218,${.15+(i%4)*.04})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-1.3,y+13+(i%7));ctx.stroke();}ctx.restore();}

// Paint contact and cast shadows on the actual table, away from the room light.
const coverReflections=new WeakMap();
function drawBookGround(ctx){
 if(document.documentElement.classList.contains('returning')||window.__library2Boot?.hint&&document.documentElement.classList.contains('returning-pending'))return;
 const book=$('hero-book').getBoundingClientRect(),hero=$('hero').getBoundingClientRect();if(!book.width||!book.height||sourceCanvas?.parentElement?.id==='hero-book')return;
 const x=book.left-hero.left,y=book.bottom-hero.top,w=book.width,h=book.height;
 const lean=['odyssey','meditations','the-prince'].includes(sceneTo)?.32:-.32;
 ctx.save();ctx.translate(x+w/2,y+2);ctx.transform(1,0,lean,.2,0,0);
 const shade=ctx.createRadialGradient(0,0,0,0,0,w*.8);shade.addColorStop(0,'#030604a6');shade.addColorStop(.36,'#03060470');shade.addColorStop(1,'#03060400');ctx.fillStyle=shade;ctx.fillRect(-w,-w,w*2,w*2);ctx.restore();
 const texture=textures.get(featured.id);if(texture){let reflection=coverReflections.get(texture);if(!reflection){const tw=texture.naturalWidth||texture.width,th=texture.naturalHeight||texture.height;reflection=document.createElement('canvas');reflection.width=tw;reflection.height=Math.round(th*.2);const r=reflection.getContext('2d');r.save();r.scale(1,-1);r.drawImage(texture,0,-th);r.restore();r.globalCompositeOperation='destination-in';const fade=r.createLinearGradient(0,0,0,reflection.height);fade.addColorStop(0,'#0005');fade.addColorStop(1,'#0000');r.fillStyle=fade;r.fillRect(0,0,tw,reflection.height);coverReflections.set(texture,reflection);}ctx.save();ctx.globalAlpha=.45;ctx.drawImage(reflection,x,y+1,w,h*.2);ctx.restore();}
 ctx.save();ctx.translate(x+w/2,y+1);ctx.scale(1,.045);const contact=ctx.createRadialGradient(0,0,w*.3,0,0,w*.58);contact.addColorStop(0,'#020403d9');contact.addColorStop(1,'#02040300');ctx.fillStyle=contact;ctx.fillRect(-w,-w,w*2,w*2);ctx.restore();
}

let searchOpen=false,openedFromSearch=false,menuOpen=false;
function setSearch(open,preserve=false){if(!open)cancelPendingAdd();searchOpen=open;$('search-panel').hidden=!open;syncLock();syncLibrarianAway();if(open){void warmFreeSearch();if(menuOpen)setMenu(false);if(!preserve)renderResults();setTimeout(()=>$('search-input').focus(),40);}else{$('search-toggle').focus();}}
// The library's own books, ranked by the catalogue's search engine (library-search.js): typos, other spellings and titles find them.
// A typed query also searches the books held from the shelves; the empty list stays the shelves' books.
const tinctSearch=librarySearch(searchPool);
export function filterBooks(query){return String(query||'').trim()?tinctSearch.filter(query):books.slice();}
const foundLabel=n=>`${n} ${n===1?'book':'books'} found`;
function renderResults(){const q=$('search-input').value;const matches=filterBooks(q);$('search-label').textContent=q?foundLabel(matches.length):'Explore the library';const box=$('search-results');box.replaceChildren();box.classList.remove('has-groups');const renderTinct=list=>{if(q.trim()&&addEnabled()){const rows=el('ol','tinct-list');list.forEach(book=>rows.append(tinctRow(book,{el,cover:rowCover(book),onOpen:openBook,length:readingTime(book),query:q,otherTitles:tinctSearch.titlesFor(book.id)})));box.append(rows);return;}list.forEach(book=>{const b=coverButton(book,'search-result');b.append(el('span','',book.title),el('small','',book.author));box.append(b);});};
 // Add to Tinct (add-to-tinct.js): grouped results, on devices the switch allows.
 // Its filter chips (Modern English, Audio, language) narrow the results; the count follows them,
 // and counts the "Not yet in Tinct" rows too once they are drawn (every book the panel lists).
 // What the catalogue knows of each book (popularity, the author's other names) ranks them as the catalogue would; asked once per book.
 if(addEnabled()){void borrowFromCatalogue(searchPool()).then(map=>{if(tinctSearch.lend(map)&&searchOpen&&!openedFromSearch)renderResults();});const shown=renderSearchGroups(box,{query:q,tinct:matches,tinctBooks:searchPool(),renderTinct,el,onAdd:addWork,addingWork,addingStage,filterHost:$('search-panel').querySelector('.search-content'),onFilters:renderResults,portraitFor:authorImageFor,onFreeShown:n=>{if(q&&$('search-input').value===q)$('search-label').textContent=foundLabel(shown.length+n);}});if(q)$('search-label').textContent=foundLabel(shown.length);return;}
 renderTinct(matches);if(!matches.length)box.append(el('p','','Try another title or author.'));}
// A catalogue book readers added: its form, era and year join the library's menus.
function placePublicBook(entry){if(!entry?.public)return;if(entry.form&&!metadata[entry.id])metadata[entry.id]={form:entry.form==='short-stories'?'novel':entry.form,era:entry.era};if(Number.isFinite(entry.year)&&compositionYears[entry.id]===undefined)compositionYears[entry.id]=entry.year;}
const ADD_FAILURES={daily_limit:'You have added the most books you can today. Please try again tomorrow.',in_progress:'This book is being added. Please try again in a few minutes.',not_importable:'This book cannot be added to Tinct.',unreadable:'This book could not be read from its library.',failed:'This book could not be added. Please try again.'};
let addingWork=null,addingStage=null,addCancelled=false;
/** Closing search while a book is being added: the add no longer opens it (the import itself may still finish on the server). */
function cancelPendingAdd(){if(addingWork)addCancelled=true;}
/** The Add button of the work being added, as rendered now (a new search re-renders the rows). */
const addButton=id=>[...document.querySelectorAll('#search-results .free-add')].find(b=>b.dataset.work===id)||null;
/** Add: import the work for everyone, then open it (Currently reading). Signed out: sign in first, then it continues here. A free account past its trial: the Premium offer, never an import (the Worker answers 402 first). */
async function addWork(work,button){
 const signIn=()=>location.assign(`/sign-in?returnTo=${encodeURIComponent(`/library?${ADD_PARAM}=${encodeURIComponent(work.id)}`)}`);
 if(!document.documentElement.classList.contains('signed-in')){signIn();return;}
 // One import at a time: while it runs its button is a spinner (setAddBusy) and every Add waits.
 if(addingWork)return;addingWork=work.id;addingStage='start';addCancelled=false;setAddBusy(button,'start');
 const step=stage=>{addingStage=stage;setAddBusy(addButton(work.id),stage);};
 try{
  // The reading engine (the shelf, the reader's hand-off) loads while the book is added.
  readingApi().catch(()=>{});
  if((await canAdd())===false){if(!addCancelled)location.assign(PREMIUM_PAGE);return;}
  const result=await (await addEngine()).importWork(work.id,{onStage:step});
  // Search was closed while it ran: no notice, no question, no reader. A book that was added stays in the library.
  if(addCancelled){if(result.ok){placePublicBook(result.entry);let book=books.find(b=>b.id===result.entry.id);if(!book){book=libraryBook(result.entry);books.push(book);}attachCatalogue(book,result.entry);}return;}
  if(!result.ok){if(result.reason==='signed_out'){signIn();return;}if(result.reason==='premium_required'){location.assign(PREMIUM_PAGE);return;}notice(ADD_FAILURES[result.reason]||ADD_FAILURES.failed);return;}
  const entry=result.entry;placePublicBook(entry);let book=books.find(b=>b.id===entry.id);if(!book){book=libraryBook(entry);books.push(book);}attachCatalogue(book,entry);
  // Modern English (add-to-tinct.js finishAdd): its price is known now the book is published, so it is
  // asked at once, while the add finishes alongside (the shelf, the reader's hand-off); the reader opens once it is answered.
  const {href,answer}=await finishAdd(entry.id,{live:()=>!addCancelled,finish:async()=>{try{(await readingApi()).addCatalogueBook?.(entry);}catch{}return readerDestination(book,null);}});
  if(addCancelled)return;
  if(answer==='buy'){
   // The reader's checkout. Stripe returns to /reader, which opens this book (readerDestination's hand-off) and switches to the edition once paid.
   try{const url=await (await addEngine()).buyModern(entry.id,entry.readingStructure?.chapters?.[0]?.number??1);document.body.classList.add('leaving');location.assign(url);return;}catch{}
  }
  if(addCancelled)return;
  document.body.classList.add('leaving');location.assign(href);
 }catch{document.body.classList.remove('leaving');if(!addCancelled)notice(ADD_FAILURES.failed);}
 finally{if(!document.body.classList.contains('leaving'))setAddBusy(addButton(work.id),null);addingWork=null;addingStage=null;}
}
// Add your own book from the search field (Add to Tinct devices only): Add a book's file step.
syncSearchAddFile($('search-add-file'));
// The top bar's + (beside search): the add-a-book flow, as My shelf's "+ Add a book".
syncLibraryAdd($('library-add'),()=>setSearch(true));
$('search-toggle').onclick=()=>setSearch(true);$('search-cancel').onclick=()=>setSearch(false);$('search-close').onclick=()=>setSearch(false);$('search-input').oninput=renderResults;

let activeBook=null,sourceCanvas=null,sourceRect=null,bookProgress=0,bookAnim=null,currentTab='preface',edition='original-en',reading=false,tourProgress=0,tourAnimation=null,readerProgress=0,readerAnimation=null;
const editionChoices=new Map();
// Danish only where the catalogue offers it (OFFERED_DANISH_EDITIONS).
function availableEditions(){return (activeBook.editions||[]).filter(e=>(e.language!=='da'||e.discoveryAvailable===true)&&e.discoveryAvailable!==false&&e.availability?.chapterText!==false);}
// Compare is on by default (Anders, 2026-10-06): the AI/modern edition reads and
// the human edition sits beside it. A reader who chose None in the reader keeps None.
function compareChosenOff(){try{const shared=JSON.parse(localStorage.getItem('tinct-lab-prefs')||'null')?.shared;return shared?.compareChosen===true&&shared.compareOpen===false;}catch{return false;}}
function pairedCompare(main){const comparable=availableEditions().filter(e=>e.key!==main&&e.availability?.compare!==false);return [activeBook.defaultCompareEditionKey,activeBook.defaultEditionKey].find(key=>key&&comparable.some(e=>e.key===key))||null;}
function choices(){const available=availableEditions();if(!editionChoices.has(activeBook.id)){const main=available.find(e=>e.key===activeBook.defaultEditionKey)?.key||available[0]?.key||null;editionChoices.set(activeBook.id,{main,explicit:false});}const picked=editionChoices.get(activeBook.id);if(!('compare' in picked)){picked.compare=compareChosenOff()?null:pairedCompare(picked.main);picked.compareExplicit=false;}return picked;}
let pageLocked=false,lockedScroll=0;function syncLock(){scheduleLibrarianAway();const lock=!!(activeBook||searchOpen||menuOpen||mode!=='minimized');if(lock===pageLocked)return;pageLocked=lock;if(!lock)queueMicrotask(()=>dispatchEvent(new Event('library2:interactive')));if(lock){lockedScroll=scrollY;Object.assign(document.body.style,{position:'fixed',top:-lockedScroll+'px',left:'0',right:'0',overflow:'hidden'});}else{for(const key of ['position','top','left','right','overflow'])document.body.style[key]='';scrollTo({top:lockedScroll,behavior:'instant'});}}
function rectOf(c){const r=c.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}
// The compact book's page. A phone's page runs past the screen's right edge, so
// only the author flap and a sliver of page show. On a tall tablet the capped
// page stopped short of the edge, leaving a blank page beside a narrow flap
// (iPad QA, 2026-10-09): there it runs past the edge too, its height the screen's.
function tourPage(){const height=window.visualViewport?.height||innerHeight,short=height<500;let w=Math.min((innerWidth-40)/.66,short?620:(height-128)/1.5,620),h=short?height-128:w*1.5;const tall=!short&&height>innerWidth&&20+w<innerWidth;if(tall){w=(innerWidth-40)/.66;h=Math.min(w*1.5,height-128);}return {w,h,height,tall};}
export function bookDestination(){const dest=destination(innerWidth,innerHeight);if(dest.tour){const u=ease(tourProgress),{w:pageWidth,h:pageHeight,height}=tourPage();dest.x=mix(20+pageWidth,0,u);dest.y=mix(60+(height-128-pageHeight)/2,0,u);dest.w=mix(pageWidth,innerWidth,u);dest.h=mix(pageHeight,height,u);}return dest;}
const screenBack=el('button','page-back','← Back');screenBack.id='page-back';screenBack.hidden=true;$('book-overlay').append(screenBack);
function syncBookBack(){const compact=bookDestination().tour;const target=compact&&tourProgress<.5?$('tour-back'):$('back-library');const visible=bookProgress===1&&(!compact||tourProgress===0||tourProgress===1)&&!readerProgress;screenBack.hidden=!visible;if(!visible)return;const rect=target.getBoundingClientRect();Object.assign(screenBack.style,{left:rect.left+'px',top:rect.top+'px',width:Math.max(70,rect.width)+'px',height:'44px'});}
// Once the cover has turned all the way (angle -180: the zoom half of the opening, the book at rest, the
// tour and the reading preview) the book is drawn flat (2026-10-21): the turned cover is its back face
// moved one flap width left, which is what the two half-turns amount to, so the picture is the same,
// but WebKit no longer keeps the 3D context's layers (paper, both cover faces, the shape) at full
// size for as long as the book is open. On an iPhone those layers were what opening a book added.
function drawBook(p){if((p===0||p===1)&&(tourProgress===0||tourProgress===1))scheduleLibrarianAway();const dest=bookDestination();const viewportHeight=window.visualViewport?.height||innerHeight;const page=dest.tour?tourPage():null;const flapWidth=page?page.w:dest.w;const flapHeight=page?page.h:dest.h;const rp=ease(readerProgress);if(readerProgress){dest.x=mix(dest.x,0,rp);dest.y=mix(dest.y,0,rp);dest.w=mix(dest.w,innerWidth,rp);dest.h=mix(dest.h,window.visualViewport?.height||innerHeight,rp);}const pages=bookPages(sourceRect,dest,p,{w:flapWidth,h:flapHeight},innerWidth),f=pages.frame;const shape=$('book-shape');shape.classList.toggle('compact-book',dest.tour);shape.style.width=dest.w+'px';shape.style.setProperty('--slip-font',(page?.tall?clamp(innerWidth/38,19,23):Math.min(dest.tour?17:15,flapWidth/320*(dest.tour?11:12)))+'px');shape.style.setProperty('--portrait-height',(page?.tall?Math.min(260,viewportHeight*.2):Math.min(150,flapWidth/320*96))+'px');$('intro').style.width=dest.tour?innerWidth+'px':'';$('intro').style.height=dest.tour?viewportHeight+'px':'';const back=document.querySelector('.cover-back');back.style.width=flapWidth+'px';back.style.left='0px';shape.style.setProperty('--flap-angle',dest.tour?'-3deg':'-8deg');shape.style.height=pages.height+'px';back.style.height=pages.backHeight+'px';const flat=f.angle===-180;$('book-overlay').classList.toggle('book-flat',flat);shape.style.transform=flat?`translate(${f.x}px,${f.y}px) scale(${f.scale})`:`translate3d(${f.x}px,${f.y}px,0) scale(${f.scale})`;$('turning-cover').style.transform=flat?'none':`translateZ(1px) rotateY(${f.angle}deg)`;$('turning-cover').style.opacity=1;$('turning-cover').hidden=f.opacity===0;document.querySelector('.cover-front').hidden=false;document.querySelector('.cover-back').hidden=false;document.querySelector('.cover-front').style.visibility=f.angle<=-90?'hidden':'visible';document.querySelector('.cover-back').style.visibility=f.angle<=-90?'visible':'hidden';$('book-backdrop').style.opacity=ease(p);$('intro').style.opacity=(dest.tour?clamp(tourProgress*3,0,1):1)*(1-clamp(readerProgress/.32,0,1));$('reader').style.opacity=clamp((readerProgress-.55)/.45,0,1);$('reader').style.pointerEvents=readerProgress===1?'auto':'none';$('reader').hidden=readerProgress===0; $('intro').inert=readerProgress>0; $('reader').inert=readerProgress!==1;$('intro').style.pointerEvents=p===1&&(!dest.tour||tourProgress===1)?'auto':'none';const onFlap=p===1&&(!dest.tour||tourProgress===0);$('book-slip').style.pointerEvents=onFlap?'auto':'none';back.style.pointerEvents=onFlap?'auto':'none';$('book-slip').inert=!onFlap;$('slip-next').hidden=!dest.tour||tourProgress!==0||p!==1;$('tour-back').hidden=!dest.tour;$('tour-back').style.pointerEvents=tourProgress===0&&p===1?'':'none';$('back-slip').hidden=true;$('intro').setAttribute('aria-hidden',String(dest.tour&&tourProgress!==1));$('book-slip').setAttribute('aria-hidden',String(dest.tour&&tourProgress===1));bookProgress=p;syncBookBack();if(p===1)scrollHint();}
let resolveBookAnimation,resolveTourAnimation,closing=false;
// A device with little memory opens and closes a book as reduced motion does, straight to the open book
// (2026-10-21): the turn is the moment the cover's 3D layers exist, and the book is then drawn flat
// (drawBook). Chrome says how much memory it has (navigator.deviceMemory, 2 GB or less); Safari does
// not, so the iPhones and iPads with the least memory that run current iOS are known by their screens
// (iPhone SE 2nd and 3rd generation, 375×667; iPad 9th generation and iPad mini 5, at most 810×1080).
const lowMemoryOpen=(()=>{try{const memory=navigator.deviceMemory;if(typeof memory==='number')return memory<=2;const ua=navigator.userAgent||'',w=Math.min(screen.width,screen.height),h=Math.max(screen.width,screen.height);if(/iPhone|iPod/.test(ua))return w<=375&&h<=667;if(/iPad/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1))return w<=810&&h<=1080;}catch{}return false;})();
function animateBook(to){if(bookAnim)cancelAnimationFrame(bookAnim);resolveBookAnimation?.();const from=bookProgress,start=performance.now(),duration=reduced.matches||lowMemoryOpen?0:(to?1500:650)*Math.abs(to-from);return new Promise(resolve=>{resolveBookAnimation=resolve;function frame(now){const t=duration?clamp((now-start)/duration,0,1):1;drawBook(t===1?to:mix(from,to,t));if(t<1)bookAnim=requestAnimationFrame(frame);else{bookAnim=null;resolveBookAnimation=null;resolve();}}bookAnim=requestAnimationFrame(frame);});}

const shelleyBiography='Mary Shelley’s mother, feminist Mary Wollstonecraft, died days after her birth. Her father, philosopher William Godwin, nurtured her intellect, though she often felt neglected by him. She ran off with Percy Bysshe Shelley at sixteen and began <i>Frankenstein</i> at eighteen, inspired by her friend Lord Byron’s ghost-story challenge. Despite losing three children and her husband, she raised her surviving son and published six novels before dying at fifty-three.';
function appendEditorialText(target,copy){target.replaceChildren();String(copy||'').split(/(\*[^*]+\*)/g).forEach(part=>{target.append(part.startsWith('*')&&part.endsWith('*')?el('em','',part.slice(1,-1)):document.createTextNode(part));});}
function setSlip(book){
 const mary=book.id==='frankenstein',flap=book.authorFlap;
 const portraits=book.authorImages||[];
 renderAuthorFlap(portraits,$('slip-images'));
 if(!portraits.length){const fallback=mary?{src:'assets/mary-shelley-portrait.jpg',alt:'Mary Shelley, painted by Richard Rothwell'}:authorPortrait(book.author);if(fallback){const image=el('img','author-flap-image');image.id='slip-portrait';image.src=fallback.src;image.alt=fallback.alt;$('slip-images').append(image);}}
 $('slip-caption').replaceChildren(el('span','',flap?[flap.name,flap.years].filter(Boolean).join(' · '):mary?book.author+' · 1797–1851':book.author));
 if(flap?.occupation)$('slip-caption').append(el('span','',flap.occupation));else if(mary)$('slip-caption').append(el('span','','English novelist'));
 if(flap)appendEditorialText($('slip-copy'),flap.biography);else if(mary)$('slip-copy').innerHTML=shelleyBiography;else $('slip-copy').textContent=book.preface[0]||'';
}
let introExpanded=false,introProgress=null;

// While a book opens it has the connection: the optional warming waits until its introduction is open (quiet-loads.js).
async function openBook(book,canvas){if(activeBook)return;const release=quiet.hold();try{await openingBook(book,canvas);}finally{release();}}
async function openingBook(book,canvas){if(menuOpen)setMenu(false);readingApi().catch(()=>{});try{const entry=(await loadCatalogueData()).books.find(b=>b.id===book.id);if(entry)attachCatalogue(book,entry);await Promise.all([ensureCover(book,COVER_WHOLE_PX),loadIntroduction(book),loadAuthorFlap(book.id).then(images=>{book.authorImages=images;}).catch(()=>{book.authorImages=[];})]);}catch{notice('This book could not load. Please try again.');return;}if(activeBook)return;warmSheet(book.id);activeBook=book;pushLayer('book');introExpanded=false;introProgress=null;$('turning-cover').style.setProperty('--cover-tone',book.coverTone);sourceCanvas=canvas;sourceRect=rectOf(canvas);openedFromSearch=searchOpen;if(openedFromSearch){$('search-input').blur();$('search-panel').inert=true;}reading=false;readerProgress=0;tourProgress=0;setSlip(book);$('book-slip').scrollTop=0;$('slip-content').scrollTop=0;updateSaveButton();currentTab='preface';bookProgress=0;renderIntro();paintCover($('moving-cover'),book.id);$('book-overlay').hidden=false;bookOpenMemory(true);sourceCanvas.style.visibility='hidden';drawBook(0);syncLock();updateLibrarianContext();await animateBook(1);if(activeBook!==book||closing)return;dispatchEvent(new CustomEvent('tinct:funnel',{detail:{name:'book_intro_viewed',props:{book_id:book.id}}}));resetIntroScroll();(destination(innerWidth,innerHeight).tour?$('slip-next'):screenBack).focus({preventScroll:true});}
async function closeBook(){if(!activeBook||closing)return;dropLayer('book');closing=true;screenBack.hidden=true;if(mode!=='minimized')minimize();if(readerProgress)await animateReader(0);if(tourProgress)await animateTour(0);const returnToSearch=openedFromSearch;sourceRect=rectOf(sourceCanvas);await animateBook(0);$('book-overlay').hidden=true;bookOpenMemory(false);sourceCanvas.style.visibility='';const focus=sourceCanvas.closest('button')||sourceCanvas.parentElement;activeBook=null;sourceCanvas=null;closing=false;if(returnToSearch){$('search-panel').inert=false;openedFromSearch=false;}syncLock();updateLibrarianContext();focus.focus({preventScroll:true});dispatchEvent(new Event('library2:overlayclosed'));if(collectionChoice!=='home'&&!returnToSearch){renderCollection();$('collection-back').focus({preventScroll:true});}}
function animateTour(to){if(tourAnimation)cancelAnimationFrame(tourAnimation);resolveTourAnimation?.();const from=tourProgress,start=performance.now();return new Promise(resolve=>{resolveTourAnimation=resolve;function step(now){const t=reduced.matches?1:clamp((now-start)/550,0,1);tourProgress=t===1?to:mix(from,to,t);drawBook(1);if(t<1)tourAnimation=requestAnimationFrame(step);else{tourAnimation=null;resolveTourAnimation=null;resolve();}}tourAnimation=requestAnimationFrame(step);});}
$('slip-next').onclick=async()=>{if(tourAnimation)return;await animateTour(1);if(!activeBook||closing||tourProgress!==1)return;resetIntroScroll();fitIntroFooter();screenBack.focus({preventScroll:true});};
$('back-slip').onclick=async()=>{if(tourAnimation)return;await animateTour(0);$('slip-next').focus({preventScroll:true});};
function bookBack(){if(!activeBook||closing)return;if(bookDestination().tour&&tourProgress>0){animateTour(0).then(()=>{if(activeBook&&!closing)screenBack.focus({preventScroll:true});});}else closeBook();}
$('book-backdrop').onclick=closeBook;$('tour-back').onclick=$('back-library').onclick=screenBack.onclick=bookBack;
function appendParagraphs(target,paragraphs){paragraphs.forEach(p=>target.append(el('p','',p)));}
function renderIntro(){
 const body=$('intro-body');const footer=document.querySelector('.intro-footer');if(footer.parentElement===body)$('intro').append(footer);body.replaceChildren();resetIntroScroll();requestAnimationFrame(()=>{resetIntroScroll();scrollHint();});
 $('intro-heading').textContent='Introduction';
 document.querySelector('[data-tab="characters"]').textContent=activeBook.galleryTitle||'Characters';
 document.querySelector('.intro-tabs').hidden=false;
 $('begin-reading').textContent='Begin reading →';$('begin-reading').disabled=!availableEditions().length;
 all('[data-tab]').forEach(b=>{b.hidden=false;b.setAttribute('aria-selected',String(b.dataset.tab===currentTab));b.tabIndex=b.dataset.tab===currentTab?0:-1;});
 if(currentTab==='preface'){appendParagraphs(body,activeBook.preface);}
 else if(currentTab==='characters'){
  const list=el('div','intro-character-list');list.id='intro-character-list';
  (reviewedCast(activeBook,introExpanded,introProgress)||introCast(activeBook)).forEach((c,i)=>{
   const section=el('section','character');section.dataset.characterId=c.id||c.introKey||c.aliases[0];
   // Sketches belong to the featured cast only; gallery characters have none.
   const art=(!c.introVisibility||c.introVisibility==='featured')?signature[activeBook.id]:null;if(art){const slot=art.sketches.indexOf(c.aliases[0]);if(slot>=0){const sketch=el('div','character-sketch');sketch.style.backgroundImage=`url('${art.sheet||`assets/${activeBook.id}-character-ink.png`}')`;sketch.style.backgroundPosition=['0 0','50% 0','100% 0'][slot];sketch.setAttribute('role','img');sketch.setAttribute('aria-label',`Pencil interpretation of ${c.name||c.aliases[0]}`);section.append(sketch);}}
   const text=el('div','character-copy');text.append(el('h3','',c.name||c.aliases[0]),el('p','character-role',c.introKey?c.subtitle:c.introRole),el('p','',c.introKey?c.body:c.subtitle));section.append(text);list.append(section);
  });body.append(list);
  if(activeBook.galleryTitle){const toggle=el('button','gallery-toggle',introExpanded?'Show fewer characters':'Explore the full character gallery');toggle.dataset.testid='intro-gallery-toggle';toggle.setAttribute('aria-expanded',String(introExpanded));toggle.setAttribute('aria-controls',list.id);toggle.onclick=async()=>{
    const book=activeBook;
    if(!introExpanded&&book.characters.some(c=>c.introVisibility==='hold_until_revealed')&&!introProgress){toggle.disabled=true;toggle.setAttribute('aria-busy','true');try{const api=await readingApi();const progress=await api.introductionProgress(book.id);if(activeBook!==book)return;introProgress=progress;}catch{if(activeBook!==book)return;introProgress=null;}finally{toggle.disabled=false;toggle.removeAttribute('aria-busy');}}
    if(activeBook!==book)return;introExpanded=!introExpanded;renderIntro();
  };body.append(toggle);}
 }

 else {
  // Two dropdowns: the edition to read, and the edition to compare with (the
  // paired human edition by default; None is the reader's explicit choice).
  const versions=availableEditions(),picked=choices();
  const dropdown=(label,options,current,onPick)=>{
   const field=el('section','edition-field');field.append(el('h3','',label));
   const details=el('details','edition-select'),summary=el('summary'),chosen=options.find(o=>o.key===current)||options[0];
   summary.setAttribute('aria-label',label);summary.append(el('span','',chosen?.label||''),el('span','chevron','⌄'));details.append(summary);
   const list=el('div','edition-options');
   options.forEach(option=>{const b=el('button','edition-option');b.type='button';b.append(el('strong','',option.label));if(option.note)b.append(el('small','',option.note));b.setAttribute('aria-pressed',String(option.key===(chosen?.key??null)));b.onclick=()=>{details.open=false;onPick(option.key);};list.append(b);});
   details.append(list);details.ontoggle=()=>{if(details.open)all('.edition-select').forEach(d=>{if(d!==details)d.open=false;});};
   field.append(details);if(chosen?.note)field.append(el('p','edition-note',chosen.note));body.append(field);
  };
  const asOption=v=>({key:v.key,label:v.label||v.key,note:v.provenanceLabel||''});
  if(versions.length){
   dropdown('Reading edition',versions.map(asOption),picked.main,key=>{picked.main=key;picked.explicit=true;if(picked.compare===key)picked.compare=picked.compareExplicit?null:pairedCompare(key);renderIntro();});
   if(versions.length>1)dropdown('Compare with',[{key:null,label:'None',note:''},...versions.filter(v=>v.key!==picked.main).map(asOption)],picked.compare??null,key=>{picked.compare=key;picked.compareExplicit=true;renderIntro();});
  }else{const field=el('section','edition-field');field.append(el('p','','No edition is currently available to start.'));body.append(field);}
 }
 fitIntroFooter();
}
function fitIntroFooter(){const body=$('intro-body'),footer=document.querySelector('.intro-footer');if(!bookDestination().tour){$('intro-more').hidden=true;return;}if(footer.parentElement===body)$('intro').append(footer);requestAnimationFrame(()=>{const overflow=body.scrollHeight>body.clientHeight+4;if(!overflow)body.append(footer);scrollHint();});}
function resetIntroScroll(){for(const id of ['intro','intro-body','paper'])$(id).scrollTop=0;}
all('[data-tab]').forEach(b=>{b.onclick=()=>{currentTab=b.dataset.tab;renderIntro();};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const tabs=all('[data-tab]').filter(t=>!t.hidden);const i=tabs.indexOf(b);tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length].click();all('[data-tab]').find(t=>t.getAttribute('aria-selected')==='true').focus();};});
// Straight into the production reader at the reader's place: one short fade, no intermediate pages.
let leaving=false;
async function startReading(){if(leaving||!activeBook)return;leaving=true;try{const picked=choices(),href=await readerDestination(activeBook,picked.main,{compare:picked.compare,explicit:picked.explicit,compareExplicit:picked.compareExplicit});if(href!=='/reader')throw new Error();rememberVisit({featured:featured.id});document.body.classList.add('leaving');location.assign(href);}catch{leaving=false;document.body.classList.remove('leaving');notice('This edition could not open. Please try again.');}}
$('begin-reading').onclick=startReading;
addEventListener('pageshow',event=>{if(event.persisted){
 // Browser Back restores the library scene, not the preface we left behind.
 if(leaving&&activeBook){$('book-overlay').hidden=true;screenBack.hidden=true;if(sourceCanvas)sourceCanvas.style.visibility='';activeBook=null;sourceCanvas=null;bookProgress=0;if(openedFromSearch){$('search-panel').inert=false;openedFromSearch=false;}syncLock();updateLibrarianContext();dispatchEvent(new Event('library2:overlayclosed'));}
 leaving=false;openingReader=false;document.body.classList.remove('leaving');
}});
function introCast(book){const selection={'frankenstein':[0,1],'jane-eyre':[0,1,4],'julius-caesar':[0,1,2],'odyssey':[0,1,2,3,4]};const list=(selection[book.id]||[0,1,2]).map(i=>({...book.characters[i]})).filter(c=>c.aliases);return list.map((c,i)=>({...c,introRole:['the-prince','meditations'].includes(book.id)?(i===0?'Author':'Key figure'):(i===0||(book.id==='frankenstein'&&i===1)||(book.id==='pride-and-prejudice'&&i===1)?'Protagonist':'Supporting character')}));}
function scrollHint(){const b=$('intro-body');const more=b.scrollHeight-b.clientHeight-b.scrollTop>10;b.classList.toggle('more-below',more);$('intro-more').hidden=!more||!bookDestination().tour||document.querySelector('.intro-footer').parentElement===b;}
$('intro-more').onclick=()=>{const b=$('intro-body');b.scrollBy({top:b.clientHeight*.8,behavior:reduced.matches?'auto':'smooth'});};
$('intro-body').addEventListener('scroll',scrollHint,{passive:true});
let readerTheme='book';try{readerTheme=localStorage.getItem('tinct-library-2-reader-theme')||'book';}catch{} 
function applyReaderTheme(){ $('book-overlay').classList.toggle('reader-dark',readerTheme==='dark');[...$('reader-theme').options].forEach(o=>o.selected=o.value===readerTheme); }
function renderReader(){const excerpt=activeBook.excerpts[choices().main]||activeBook.excerpts['original-en'];$('reader-title').textContent=activeBook.title;$('reader-author').textContent=activeBook.author;$('reader-chapter').textContent=excerpt.title;$('reader-text').replaceChildren();appendParagraphs($('reader-text'),excerpt.paragraphs);$('reader-content').scrollTop=0;}
function animateReader(to){if(readerAnimation)cancelAnimationFrame(readerAnimation);const from=readerProgress,start=performance.now();return new Promise(resolve=>{function frame(now){const t=reduced.matches?1:clamp((now-start)/1100,0,1);readerProgress=mix(from,to,t);reading=readerProgress>0;drawBook(1);if(t<1)readerAnimation=requestAnimationFrame(frame);else{readerAnimation=null;reading=to===1;(to?$('reader-back'):$('begin-reading')).focus({preventScroll:true});resolve();}}readerAnimation=requestAnimationFrame(frame);});}
$('reader-back').onclick=()=>{currentTab='preface';renderIntro();animateReader(0);};
$('reader-theme').onchange=()=>{readerTheme=$('reader-theme').value;applyReaderTheme();try{localStorage.setItem('tinct-library-2-reader-theme',readerTheme);}catch{}};applyReaderTheme();


let introGesture=null;
const interactive='button,a,input,select,summary,textarea';
function navigateIntro(direction){if(!activeBook||bookProgress!==1||bookAnim||tourAnimation||readerAnimation||mode!=='minimized')return;const compact=bookDestination().tour;if(compact&&tourProgress===0){if(direction>0)$('slip-next').click();return;}if(reading){const body=$('reader-content');if(direction<0&&body.scrollTop<4){$('reader-back').click();}else body.scrollBy({top:direction*body.clientHeight*.8,behavior:reduced.matches?'instant':'smooth'});return;}const tabs=['preface','characters','edition'],index=tabs.indexOf(currentTab),body=$('intro-body');if(direction>0&&body.scrollTop+body.clientHeight<body.scrollHeight-4){body.scrollBy({top:body.clientHeight*.8,behavior:reduced.matches?'auto':'smooth'});return;}if(direction<0&&body.scrollTop>4){body.scrollBy({top:-body.clientHeight*.8,behavior:reduced.matches?'auto':'smooth'});return;}if(index===0&&direction<0){if(compact)animateTour(0);return;}if(index===2&&direction>0){$('begin-reading').click();return;}currentTab=tabs[index+direction];renderIntro();}
$('book-overlay').addEventListener('pointerdown',e=>{if(!bookDestination().tour||e.target.closest(interactive))return;introGesture={x:e.clientX,y:e.clientY};});
$('book-overlay').addEventListener('pointerup',e=>{const g=introGesture;introGesture=null;if(!g||e.target.closest(interactive)||window.getSelection()?.toString())return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)navigateIntro(dx<0?1:-1);else if(Math.hypot(dx,dy)<8){if(e.clientX<innerWidth*.18)navigateIntro(-1);else if(e.clientX>innerWidth*.82)navigateIntro(1);}});
$('book-overlay').addEventListener('pointercancel',()=>introGesture=null);
// One persistent particle sphere follows a single interpolated position. There
// is no second orb to cross-fade, and chat never lays it over its controls.
let mode='minimized',orbMotion=null,drag=null;
// Minimized, the librarian is "tucked" (A · Tuck): the dotted orb alone, floating
// just inside the left or right wall (no capsule or chat icon since 2026-10-08).
// The button is the orb's pointer target. It docks on the sides only and
// slides along them; `dock` is where it rests, kept for the whole visit.
// The right wall is the layout viewport's edge (inside the scrollbar gutter); measured once per size.
let wallWidth=0;const wallW=()=>wallWidth||(wallWidth=document.documentElement.clientWidth||innerWidth);
// While the page scrolls the docked orb shrinks to TUCK.scrollDock, and grows
// back TUCK.scrollIdle ms after the last scroll event.
let scrolling=false,scrollTimer=0;const dockSize=()=>scrolling?TUCK.scrollDock:TUCK.dock;
addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{scrolling=false;if(isTucked())runTuck();},TUCK.scrollIdle);if(!scrolling){scrolling=true;if(isTucked())runTuck();}},{passive:true});
let dock={side:'right',y:tuckRestY(innerHeight*.43+26,innerHeight)},orbPosition={x:0,y:0,size:52};
let tuck=tuckAt(dock.side,dock.y,wallW(),dockSize()),tuckFrame=0,tuckLast=0;
function placeOrb(p){orbPosition={...p};const b=$('librarian');b.style.width=p.size+'px';b.style.height=p.size+'px';b.style.transform=`translate3d(${p.x}px,${p.y}px,0)`;if(reduced.matches)drawOrb(0);}
const isTucked=()=>mode==='minimized'&&$('librarian').classList.contains('tuck');
// The orb steps aside wherever an open panel would put it over the panel's text and
// controls: the search results and their Add buttons, and the book's tour slip,
// introduction and reader (phone widths; on desktop they stop short of the wall). It fades
// out, takes no pointer or focus, and is back when the panel closes. Reduced motion /
// e-ink: no fade (styles.css). The scroll shrink elsewhere is unchanged.
const visible=e=>!!e&&!e.hidden&&e.getClientRects().length>0&&(e.checkVisibility?e.checkVisibility({opacityProperty:true,visibilityProperty:true}):true);
function coveringPanels(){const list=[];if(searchOpen)list.push($('search-panel').querySelector('.search-content'));if(activeBook&&$('book-overlay')&&!$('book-overlay').hidden)list.push($('book-slip'),$('intro'),$('reader'));return list.filter(visible).map(e=>e.getBoundingClientRect());}
function syncLibrarianAway(){const away=coveringPanels().some(r=>tuckCovers(dock.side,wallW(),r));const root=document.documentElement;if(root.classList.contains('librarian-away')===away)return;root.classList.toggle('librarian-away',away);const b=$('librarian');if(away){b.setAttribute('aria-hidden','true');b.tabIndex=-1;}else{b.removeAttribute('aria-hidden');b.tabIndex=mode==='minimized'?0:-1;}}
// Checked when the book's animations come to rest (drawBook at 0 or 1), once per frame at most.
let awayFrame=0;function scheduleLibrarianAway(){if(!awayFrame)awayFrame=requestAnimationFrame(()=>{awayFrame=0;syncLibrarianAway();});}
// The dots fill ORB_DOTS of the disc behind them (styles.css: the scrolled top bar's glass).
const ORB_DOTS=.84;
function renderTuck(){const s=tuckShape(tuck,wallW()),b=$('librarian'),k=s.orb.size/TUCK.free.w*ORB_DOTS;b.style.width=s.hit.w+'px';b.style.height=s.hit.h+'px';b.style.transform=`translate3d(${s.hit.x}px,${s.hit.y}px,0)`;b.style.setProperty('--orb-sx',(k*s.orb.sx).toFixed(3));b.style.setProperty('--orb-sy',(k*s.orb.sy).toFixed(3));b.style.setProperty('--disc-w',(s.orb.size*s.orb.sx).toFixed(2)+'px');b.style.setProperty('--disc-h',(s.orb.size*s.orb.sy).toFixed(2)+'px');b.dataset.edge=tuck.attached?tuck.side:'none';if(reduced.matches)drawOrb(0);}
// Fixed 60 Hz steps, so the springs feel the same on 120 Hz screens.
function tuckTick(now){tuckFrame=0;if(!isTucked())return;const held=drag?.active&&drag.moved?{x:drag.p.x-drag.off.x,y:drag.p.y-drag.off.y}:null;const steps=reduced.matches?1:clamp(Math.round((now-tuckLast)/16.7),1,4);tuckLast=now;for(let i=0;i<steps;i++)tuck=tuckStep(tuck,{W:wallW(),H:innerHeight,drag:held,restY:dock.y,reduced:reduced.matches,dock:dockSize()});if(!held&&tuckSettled(tuck,wallW(),dock.y,dockSize()))tuck=tuckAt(tuck.side,dock.y,wallW(),dockSize());else if(held||!reduced.matches)tuckFrame=requestAnimationFrame(tuckTick);if(!held&&tuck.attached)dock.side=tuck.side;renderTuck();}
function runTuck(){if(!tuckFrame){tuckLast=performance.now()-16.7;tuckFrame=requestAnimationFrame(tuckTick);}}
function stopTuck(){cancelAnimationFrame(tuckFrame);tuckFrame=0;}
// Put it back at rest without motion (first paint, layout and resize).
function snapTuck(){if(!isTucked()||drag?.active)return;stopTuck();tuck=tuckAt(dock.side,dock.y,wallW(),dockSize());renderTuck();}
// The orb leaves the panel as a free dot beside its wall, then the springs draw
// it in, so it re-attaches with the same squash as a hand release.
function tuckReturnTarget(){const r=TUCK.free.w/2,cx=dock.side==="right"?wallW()-r-36:r+36;return {x:cx-r,y:dock.y-r,size:TUCK.free.w};}
function enterTuck(){const b=$('librarian'),r=orbPosition.size/2,cx=orbPosition.x+r,inward=dock.side==='right'?3:-3;b.classList.add('tuck');tuck={...tuckAt(dock.side,dock.y,wallW(),dockSize()),attached:false,x:cx,y:orbPosition.y+r,w:TUCK.free.w,h:TUCK.free.h,ar:0,vx:inward};tuck.ay=tuck.y;renderTuck();runTuck();}
function moveOrbTo(t){if(t)moveOrb(t);}
function placeOrbAt(t){if(t)placeOrb(t);}
function orbTarget(){const host=$(`librarian-${mode}`)?.querySelector('.orb-space');if(!host)return null;const space=host.getBoundingClientRect();const size=Math.min(space.height,space.width,240);return {x:space.x+(space.width-size)/2,y:space.y+(space.height-size)/2,size};}
function moveOrb(target,done){if(orbMotion)cancelAnimationFrame(orbMotion);const from={...orbPosition},start=performance.now();function frame(now){const t=reduced.matches?1:clamp((now-start)/450,0,1);placeOrb(orbFrame(from,target,t));if(t<1)orbMotion=requestAnimationFrame(frame);else{orbMotion=null;done?.();}}orbMotion=requestAnimationFrame(frame);}
function updateLibrarianContext(){$('librarian-question').textContent=activeBook?'Can I help you prepare your reading of the book?':'Want help finding a book?';}
let panelLastRect={x:20,y:80};
function setMode(next){const previous=mode;if(previous!=='minimized'){const r=$('librarian-panel').getBoundingClientRect();panelLastRect={x:r.x,y:r.y};}mode=next;$('librarian-welcome').hidden=next!=='welcome';$('librarian-live').hidden=next!=='chat'&&next!=='talk';$('librarian-panel').hidden=next==='minimized';$('librarian').hidden=next==='chat'||next==='talk';$('librarian').tabIndex=next==='minimized'?0:-1;const b=$('librarian');if(next!=='minimized'){if(b.classList.contains('tuck')){stopTuck();drag=null;const s=Math.min(tuck.w,tuck.h);b.classList.remove('tuck');placeOrb({x:tuck.x-s/2,y:tuck.y-s/2,size:s});}b.classList.remove('returning');b.classList.add('expanded');b.dataset.edge='none';}syncLock();if(next==='minimized'&&!b.classList.contains('tuck')){b.classList.add('returning');b.dataset.edge='none';const finish=()=>{b.classList.remove('expanded','returning');enterTuck();};if(previous==='chat'||previous==='talk'){placeOrb({x:clamp(panelLastRect.x+24,0,innerWidth-52),y:clamp(panelLastRect.y+65,0,innerHeight-52),size:52});}moveOrb(tuckReturnTarget(),finish);}else if(next==='welcome'){requestAnimationFrame(()=>moveOrbTo(orbTarget()));}updateLibrarianContext();}
let assistant=null,assistantLoading=null;
const ASSISTANT_MODULE='/lab/library-2-assistant.js?v=20261014talkwake';
// Fetch the librarian's code while the page is idle, so Chat and Talk open without that wait.
setTimeout(()=>(window.requestIdleCallback||setTimeout)(()=>import(ASSISTANT_MODULE).catch(()=>{}),{timeout:3000}),3000);
async function loadAssistant(){
 if(assistant)return assistant;
 if(assistantLoading)return assistantLoading;
 $('talk').disabled=$('chat').disabled=true;$('librarian-loading').textContent='Connecting to your librarian…';
 assistantLoading=import(ASSISTANT_MODULE).then(()=>window.__tinctLibraryTwoAssistant.mount($('librarian-live'),{
  onClose:()=>{setMode('minimized');$('librarian').focus({preventScroll:true});},
  getBookId:()=>activeBook?.id||null,
  getShelf:()=>{const t=window.__library2Reading;const reading=(t?.reading||[]).filter(b=>!b.own&&!String(b.bookId).startsWith('userbook-')).map(b=>b.bookId),finished=(t?.finished||[]).map(b=>b.bookId);return{reading,finished,saved:[...savedBooks].filter(id=>!reading.includes(id)&&!finished.includes(id))};},
  returnTo:location.pathname+location.search,
  openBook:async id=>{
   const book=books.find(b=>b.id===id);if(!book)return;
   if(activeBook?.id===id)return;
   if(activeBook)await closeBook();
   const canvas=all('canvas[data-book]').find(c=>c.dataset.book===id&&c.getClientRects().length)||$('hero-book').querySelector('canvas');
   await openBook(book,canvas);
  }
 })).then(api=>{assistant=api;$('librarian-loading').textContent='';return api;}).catch(()=>{
  $('librarian-loading').textContent='The librarian could not connect. Tap Talk or Chat to try again.';assistantLoading=null;return null;
 }).finally(()=>{$('talk').disabled=$('chat').disabled=false;});
 return assistantLoading;
}
function openLibrarian(){setMode('welcome');$('minimize').focus({preventScroll:true});void loadAssistant();}
function minimize(){if(assistant&&(mode==='talk'||mode==='chat'))assistant.close();else{setMode('minimized');$('librarian').focus({preventScroll:true});}}
$('minimize').onclick=minimize;
$('librarian').onclick=e=>{if(drag?.moved){drag=null;e.preventDefault();return;}if(mode==='minimized')openLibrarian();};
// A tap opens the librarian; a drag pulls it off its wall. Pointer capture keeps
// the move events coming while the shape trails the finger.
$('librarian').onpointerdown=e=>{if(!isTucked())return;drag={p0:{x:e.clientX,y:e.clientY},p:{x:e.clientX,y:e.clientY},off:{x:e.clientX-tuck.x,y:e.clientY-tuck.y},moved:false,active:true};$('librarian').setPointerCapture(e.pointerId);};
$('librarian').onpointermove=e=>{if(!drag?.active)return;drag.p={x:e.clientX,y:e.clientY};if(!drag.moved&&Math.hypot(drag.p.x-drag.p0.x,drag.p.y-drag.p0.y)>5){drag.moved=true;movedLibrarian=true;}if(drag.moved)runTuck();};
function releaseTuck(cancel){if(!drag)return;drag.active=false;if(!drag.moved&&!cancel){drag=null;return;}if(cancel)drag=null;tuck=tuckRelease(tuck,wallW());dock={side:tuck.side,y:tuckRestY(tuck.y,innerHeight)};runTuck();}
$('librarian').onpointerup=()=>releaseTuck(false);
$('librarian').onpointercancel=()=>releaseTuck(true);
// Up and down slide it along its wall; left and right send it across to the other wall.
$('librarian').onkeydown=e=>{if(!isTucked()||!e.key.startsWith('Arrow'))return;e.preventDefault();const step=e.shiftKey?40:10;movedLibrarian=true;if(e.key==='ArrowUp'||e.key==='ArrowDown')dock.y=tuckRestY(dock.y+(e.key==='ArrowDown'?step:-step),innerHeight);else{const side=e.key==='ArrowLeft'?'left':'right';if(side!==tuck.side){dock.side=side;tuck={...tuck,side,attached:false};}}runTuck();};
function startAssistant(next){
 if(!assistant){void loadAssistant();return;}
 setMode(next);assistant.open(next);
}
$('talk').onclick=()=>startAssistant('talk');
$('chat').onclick=()=>startAssistant('chat');
// Focus stays inside the panel even though the production UI is shadow-scoped.
$('librarian-live').addEventListener('keydown',e=>{
 if(e.key!=='Tab')return;
 const shadow=$('librarian-live').shadowRoot;
 const controls=[...shadow.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')].filter(e=>e.getClientRects().length);
 const i=controls.indexOf(shadow.activeElement);
 if((e.shiftKey&&i===0)||(!e.shiftKey&&i===controls.length-1)){e.preventDefault();$('minimize').focus();}
 e.stopPropagation();
});
$('minimize').addEventListener('keydown',e=>{
 if(e.key!=='Tab'||(mode!=='chat'&&mode!=='talk'))return;
 const controls=[...($('librarian-live').shadowRoot?.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')||[])].filter(e=>e.getClientRects().length);
 if(controls.length){e.preventDefault();e.stopPropagation();(e.shiftKey?controls.at(-1):controls[0]).focus();}
});
addEventListener('pagehide',()=>assistant?.close());
const dots=Array.from({length:520},(_,i)=>{const y=1-(i+.5)/520*2,r=Math.sqrt(1-y*y),a=i*2.3999632297;return [Math.cos(a)*r,y,Math.sin(a)*r];});
function drawOrb(time){const c=$('orb'),size=c.clientWidth,dpr=Math.min(devicePixelRatio||1,2);const pixels=Math.round(size*dpr);if(c.width!==pixels){c.width=pixels;c.height=pixels;}const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);const a=reduced.matches?.4:time*.00012,ca=Math.cos(a),sa=Math.sin(a);const projected=dots.map(([x,y,z])=>{const xx=x*ca+z*sa,zz=z*ca-x*sa;return [xx,y,zz];}).sort((a,b)=>a[2]-b[2]);for(const [x,y,z] of projected){const perspective=1/(1.8-z*.22);ctx.fillStyle=`rgba(236,237,222,${.2+(z+1)*.34})`;ctx.beginPath();ctx.arc(size/2+x*size*.76*perspective,size/2+y*size*.76*perspective,Math.max(.48,size*.0052)*(1+z*.27),0,Math.PI*2);ctx.fill();}}
let lastFrame=0,ambientFrame=0;
function ambient(now){
 ambientFrame=0;
 if(document.hidden)return;
 const heroBottom=$('hero').getBoundingClientRect().bottom,scene=$('scene');
 // A screen below the hero the scene's canvas gives its pixels back (780×1742 on a phone, 2026-10-21);
 // it is painted again half a screen before the hero returns, so it is never seen empty.
 if(!reduced.matches){if(heroBottom<-innerHeight){if(scene.width){scene.width=0;scene.height=0;}}else if(!scene.width&&heroBottom>-innerHeight/2)drawScene(now);}
 if(now-lastFrame>32||reduced.matches){lastFrame=now;const held=lifeHeld(now);if(heroBottom>0){const key=held?sceneKey():null;if(!held||key!==heldSceneKey){heldSceneKey=key;drawScene(now);}}if(!$('librarian').hidden&&(!held||mode!=='minimized'))drawOrb(now);}
 if(!reduced.matches)ambientFrame=requestAnimationFrame(ambient);
}
// The room's life (flames, rain, the orb's turn) is the one thing the library draws on every frame,
// and on a phone it took the main thread from everything else: a tap waited for the frame being
// painted, and a returning reader's desk waited for the frames between its reads (2026-10-21,
// scripts/check-library-speed.mjs: at rest 95% busy on a throttled phone, the cold desk 6.3 s with it
// and 2.9 s without). It holds still, its last frame shown, while the page is still arriving (until
// the library is ready and idle, at most 4 s), and while the room cannot be seen: under search (96% opaque), My shelf (the room is hidden), the
// librarian on a phone (86% opaque, blurred) and the fade into the reader. Under the menu and an open
// book the room shows through, so it keeps moving there. Anything else that changes the picture (a
// scene arriving or crossfading, the canvas size, the featured book, its place and cover) still draws at once.
let lifeStarted=reduced.matches,heldSceneKey=null;
function heroCovered(){return searchOpen||collectionChoice!=='home'||openingReader||leaving||document.body.classList.contains('leaving')||(innerWidth<700&&mode!=='minimized');}
function lifeHeld(now){return !reduced.matches&&!sceneFrom&&(!lifeStarted||heroCovered());}
function sceneKey(){const c=$('scene'),r=$('hero-book').getBoundingClientRect();return [sceneTo,c.clientWidth,c.clientHeight,c.width,Object.keys(images).length,document.documentElement.className,Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height),featured.id,textures.has(featured.id),textureWidths.get(featured.id),sourceCanvas?.parentElement?.id||''].join('|');}
{const since=performance.now();const startLife=()=>{lifeStarted=true;};const waitForLife=()=>{const c=document.documentElement.classList;if((c.contains('library-ready')&&!c.contains('returning-pending')&&!c.contains('returning-scene-pending'))||performance.now()-since>4000){(window.requestIdleCallback||setTimeout)(startLife,{timeout:800});return;}setTimeout(waitForLife,150);};if(!lifeStarted)waitForLife();}
function refreshAmbient(){cancelAnimationFrame(ambientFrame);ambientFrame=requestAnimationFrame(ambient);}
addEventListener('tinct:display-profile',refreshAmbient);
motionPreference.addEventListener('change',refreshAmbient);
document.addEventListener('visibilitychange',refreshAmbient);
snapTuck();refreshAmbient();
let movedLibrarian=false;
// Phone landing height is frozen per width so collapsing browser bars do not shift the hero.
// iPhone browsers float the bottom toolbar over the page; cover tops start at its top edge.
// On the reading table the librarian rests level with the middle of the books: the row
// stands --bh tall on the stage, lifted 5% of --bh off its floor (styles.css .rt-row).
function tableBooksMidY(){const table=document.querySelector('.reading-table:not([hidden])'),stage=table?.querySelector('.rt-stage'),bh=parseFloat(table?.style.getPropertyValue('--bh'));if(!stage||!bh)return null;const r=stage.getBoundingClientRect();return r.height?r.bottom+scrollY-bh*.55:null;}
function fitHero(){window.__library2Layout();const b=$('hero-book');if(!movedLibrarian&&mode==='minimized'&&!activeBook){const r=b.getBoundingClientRect();const y=document.documentElement.classList.contains('returning')?tableBooksMidY()??innerHeight*.68+26:r.top+scrollY+r.height/2;dock={side:'right',y:tuckRestY(y,innerHeight)};snapTuck();}}
if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(fitHero);observer.observe(document.querySelector('.hero-copy'));observer.observe($('hero'));}fitHero();
// The reading table's stage settled after fitHero last ran (its title refit, a recap arrived): the docked librarian follows the books.
{let tableFitFrame=0;addEventListener('library2:table-fit',()=>{cancelAnimationFrame(tableFitFrame);tableFitFrame=requestAnimationFrame(fitHero);});}
addEventListener('resize',()=>{wallWidth=0;fitHero();syncLibrarianAway();dock.y=tuckRestY(dock.y,innerHeight);if(mode==='minimized')snapTuck();else if(mode==='welcome')requestAnimationFrame(()=>moveOrbTo(orbTarget()));if(activeBook){if(bookProgress===1)drawBook(1);else{sourceRect=rectOf(sourceCanvas);drawBook(bookProgress);}}drawScene(performance.now());});
addEventListener('keydown',e=>{if(e.defaultPrevented||document.documentElement.dataset.tinctCommandsOpen==='true')return;if(e.key==='Tab')document.documentElement.classList.add('keyboard-nav');if(e.key==='Escape'){if(mode!=='minimized')minimize();else if(activeBook){if(reading)$('reader-back').click();else closeBook();}else if(searchOpen)setSearch(false);else if(menuOpen)setMenu(false);}if(e.key==='Tab'){const modal=mode!=='minimized'?$('librarian-panel'):activeBook&&bookProgress===1?(destination(innerWidth,innerHeight).tour&&tourProgress===0?$('book-overlay'):reading?$('reader'):$('intro')):searchOpen?$('search-panel'):menuOpen?$('library-menu'):null;if(!modal)return;const items=[...modal.querySelectorAll('button,input,select,[tabindex="0"]')].filter(x=>!x.hidden&&!x.disabled&&!x.closest('[aria-hidden="true"]')&&x.getClientRects().length);if(!items.length)return;const i=items.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&i===items.length-1){e.preventDefault();items[0].focus();}}});
addEventListener('pointerdown',()=>document.documentElement.classList.remove('keyboard-nav'),true);
function fitKeyboard(){const viewport=window.visualViewport;document.documentElement.classList.toggle('vv-keyboard',!!viewport&&innerHeight-viewport.height>120);document.documentElement.style.setProperty('--visual-height',(viewport?.height||innerHeight)+'px');document.documentElement.style.setProperty('--visual-top',(viewport?.offsetTop||0)+'px');}
// Safari pans the visual viewport after the keyboard resize. Follow that scroll
// as well, keeping the header, conversation and composer in the visible area.
let viewportFrame;function syncViewport(){cancelAnimationFrame(viewportFrame);viewportFrame=requestAnimationFrame(()=>{fitKeyboard();if(activeBook&&bookProgress===1)drawBook(1);});}
window.visualViewport?.addEventListener('resize',syncViewport);window.visualViewport?.addEventListener('scroll',syncViewport);$('librarian-panel').addEventListener('focusin',syncViewport);fitKeyboard();
// The desktop panel moves independently of the minimized docking point.
const panel=$('librarian-panel'),handle=$('panel-handle'),grip=$('panel-resize');
panel.append(grip);grip.hidden=false;let panelRect=null,panelGesture=null;
function applyPanel(rect){panelRect=panelBounds(rect,innerWidth,innerHeight);if(innerWidth<700||innerHeight<500){for(const k of ['left','top','width','height','right','bottom'])panel.style[k]='';return;}Object.assign(panel.style,{left:panelRect.x+'px',top:panelRect.y+'px',width:panelRect.w+'px',height:panelRect.h+'px',right:'auto',bottom:'auto'});if(mode==='welcome'){if(orbMotion)cancelAnimationFrame(orbMotion);placeOrbAt(orbTarget());}}
function beginPanel(e,resize){if(innerWidth<700||innerHeight<500||(!resize&&e.target.closest('button')))return;const r=panel.getBoundingClientRect();panelGesture={x:e.clientX,y:e.clientY,rect:{x:r.x,y:r.y,w:r.width,h:r.height},resize};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();}
for(const [element,resize] of [[handle,false],[grip,true]]){element.onpointerdown=e=>beginPanel(e,resize);element.onpointermove=e=>{if(!panelGesture)return;const g=panelGesture,dx=e.clientX-g.x,dy=e.clientY-g.y;applyPanel(g.resize?{...g.rect,w:g.rect.w+dx,h:g.rect.h+dy}:{...g.rect,x:g.rect.x+dx,y:g.rect.y+dy});};element.onpointerup=element.onpointercancel=()=>panelGesture=null;element.onkeydown=e=>{if(!e.key.startsWith('Arrow')||innerWidth<700)return;e.preventDefault();const r=panel.getBoundingClientRect(),dx=e.key==='ArrowRight'?12:e.key==='ArrowLeft'?-12:0,dy=e.key==='ArrowDown'?12:e.key==='ArrowUp'?-12:0;applyPanel({x:r.x+(resize?0:dx),y:r.y+(resize?0:dy),w:r.width+(resize?dx:0),h:r.height+(resize?dy:0)});};}
addEventListener('resize',()=>{if(panelRect)applyPanel(panelRect);});


// Library navigation uses the same forms and eras as the main catalogue.
let collectionChoice='home';let libraryHouses=[];
function persistSaved(){const n=savedBooks.size+(window.__library2Reading?.reading?.length||0);$('saved-count').textContent=n?String(n):'';}
function receiveSaved(ids){const merged=new Set(ids);for(const [id,p] of pendingSaves)p.saved?merged.add(id):merged.delete(id);ids=[...merged];savedBooks=new Set(ids);savedReady=true;persistSaved();updateSaveButton();all('.save-toggle').forEach(paintSaveToggle);dispatchEvent(new CustomEvent('library2:saved',{detail:ids}));}
function updateSaveButton(){if(!activeBook)return;$('save-book').textContent=savedBooks.has(activeBook.id)?'✓ On your shelf':'＋ Add to shelf';$('save-book').setAttribute('aria-pressed',String(savedBooks.has(activeBook.id)));}
async function toggleSaved(id){
 const change={saved:!savedBooks.has(id)};pendingSaves.set(id,change);receiveSaved([...savedBooks]);
 try{const api=await readingApi();const result=await api.setSavedBook(id,change.saved);if(pendingSaves.get(id)===change)pendingSaves.delete(id);receiveSaved(result.ids);if(!result.synced)notice('Saved on this device. Your shelf will sync when you reconnect.');if(collectionChoice==='saved'&&!activeBook)renderCollection();}
 catch{if(pendingSaves.get(id)===change){pendingSaves.delete(id);change.saved?savedBooks.delete(id):savedBooks.add(id);receiveSaved([...savedBooks]);}notice('Your shelf could not be saved. Please try again.');}
}
function paintSaveToggle(t){if(t.dataset.shelfRemove==='true'){t.textContent='×';t.classList.remove('on');t.removeAttribute('aria-pressed');t.setAttribute('aria-label','Remove from My shelf: '+t.dataset.title);return;}const on=savedBooks.has(t.dataset.book);t.textContent=on?'✓':'+';t.classList.toggle('on',on);t.setAttribute('aria-pressed',String(on));t.setAttribute('aria-label',`${on?'Remove from To read':'Add to shelf'}: ${t.dataset.title}`);}
addEventListener('library2:remove-saved',e=>{if(savedBooks.has(e.detail))toggleSaved(e.detail);});
$('save-book').onclick=()=>toggleSaved(activeBook.id);
function setMenu(open){menuOpen=open;$('library-menu').hidden=!open;$('menu-toggle').setAttribute('aria-expanded',String(open));syncLock();(open?$('menu-close'):$('menu-toggle')).focus({preventScroll:true});}
$('menu-toggle').onclick=()=>setMenu(!menuOpen);$('menu-close').onclick=()=>setMenu(false);$('library-menu').onclick=e=>{if(e.target===$('library-menu'))setMenu(false);};
// Views that cover the library (a category, Image credits, a book's introduction) own a history entry, so the phone's Back closes them instead of leaving Tinct.
let layerFromPop=false;
function pushLayer(kind){if(layerFromPop)return;const top=history.state?.libraryLayer;if(top===kind&&kind==='collection')return;try{history.pushState({libraryLayer:kind},'');}catch{}}
function dropLayer(kind){if(layerFromPop||history.state?.libraryLayer!==kind)return;layerSkipPop=true;history.back();}
let layerSkipPop=false;
addEventListener('popstate',()=>{if(layerSkipPop){layerSkipPop=false;return;}layerFromPop=true;try{if(activeBook){if(reading)$('reader-back').click();closeBook();}else if(collectionChoice!=='home')selectCollection('home');}finally{layerFromPop=false;}});
function selectCollection(value){const fromHome=collectionChoice==='home';const shelfView=value==='saved'&&new URLSearchParams(location.search).get('view')==='shelf';if(value!=='home'&&fromHome&&!shelfView)pushLayer('collection');else if(value==='home'&&!fromHome)dropLayer('collection');collectionChoice=value;setMenu(false);$('library').hidden=value!=='home';$('collection').hidden=value==='home';document.querySelector('#header .brand').hidden=value!=='home';$('collection-back').hidden=value==='home';if(value==='saved'&&new URLSearchParams(location.search).get('view')==='shelf'){collectionChoice='home';$('library').hidden=false;$('collection').hidden=true;document.querySelector('#header .brand').hidden=false;$('collection-back').hidden=true;bookshelf.show();return;}if(value!=='home')renderCollection();else dispatchEvent(new Event('library2:interactive'));(value==='home'?$('menu-toggle'):$('collection-back')).focus({preventScroll:true});scrollTo({top:0,behavior:'instant'});}
// My shelf: what you are reading, what you want to read, and what you have finished.
// Remove from shelf (Anders, 2026-10-20; was "Remove from my books"): confirmed in the page, then off My shelf, the
// reading table and Continue, from every group (Finished too). Its place, highlights and
// notes are kept: the shelf's own tombstone (libraryTwoSaved.ts), so adding it again brings them back.
async function removeFromMyShelf(id,{title='',from=null}={}){
 if(!await confirmDeleteUpload({title:title||bookById(id)?.title||''},{from,own:false}))return;
 const leave=leaveShelf(['reading:'+id,'want:'+id,'finished:'+id]);
 try{
  const api=await readingApi();
  // Off My shelf, with the desk's fast-paint snapshot (so a refresh cannot paint it back), for every kind of book.
  const [result]=await Promise.all([api.removeFromShelf?api.removeFromShelf(id):api.setSavedBook(id,false),leave.faded]);
  leave.done();
  receiveSaved(result.ids);
  dropFromReading(id);
  renderMyBooks();
  if(!result.synced)notice('Removed on this device. Your shelf will sync when you reconnect.');
 }catch{leave.cancel();notice('Your shelf could not be saved. Please try again.');}
}
/**
 * Currently reading's Read later and (an own book's) Remove from Currently reading (Anders,
 * 2026-10-21): off the reading row with the desk's own hide (hideFromReadingNow), the place,
 * highlights and notes kept. Read later lists the book under Saved for later; an own book removed
 * from Currently reading stays under My private uploads only.
 */
async function offCurrentlyReading(id,{own=null,later=true}={}){
 const leave=leaveShelf([own?'own-reading:'+own.key:'reading:'+id]);
 try{
  const api=await readingApi();
  await Promise.all([api.hideFromReadingNow(id,{saved:later}),leave.faded]);
  leave.done();
  if(!own)receiveSaved([...savedBooks,id]);
  dropFromReading(id);
  if(own){const at=Date.now();refreshOwnShelf(list=>list.map(b=>b.key===own.key?{...b,readingAt:null,savedAt:later?at:null}:b));}else renderMyBooks();
 }catch{leave.cancel();notice('Your shelf could not be saved. Please try again.');}
}
/** A Tinct book's ••• on My shelf: Read later under Currently reading, then Remove from shelf. */
function tinctShelfMenu(id,title,reading){
 const remove={label:shelfAction(false).item,onChoose:from=>void removeFromMyShelf(id,{title,from})};
 return shelfMenu(title,{items:reading?[{label:READ_LATER,onChoose:()=>void offCurrentlyReading(id)},remove]:[remove]});
}
let ownShelf=null,ownShelfLoading=null;
/** Forget the listed own books (their covers, places and membership changed) and list them again. */
function refreshOwnShelf(change){if(ownShelf&&change)ownShelf=change(ownShelf);ownShelfLoading=null;if(collectionChoice==='saved')renderMyBooks();void loadOwnShelf();}
/** Drop a book from the desk's lists here and tell the desk (bookshelf.js reloads the account's). */
function dropFromReading(id){
 const table=window.__library2Reading;
 if(table){for(const key of ['reading','shelfReading','finished'])if(table[key])table[key]=table[key].filter(book=>book.bookId!==id);}
 dispatchEvent(new CustomEvent('library2:shelf-removed',{detail:id}));
}
/** An own book's Delete (its ••• menu, anywhere on My shelf): confirmed, then Add a book's own delete (every device and the account). */
async function deleteOwnBook(book,from){
 if(!await confirmDeleteUpload(book,{from,own:true}))return;
 const leave=leaveShelf(['own:'+book.key,'own-reading:'+book.key,'finished:'+book.key]);
 try{
  const [gone]=await Promise.all([deleteUpload(book),leave.faded]);leave.done();
  if(!gone)notice('Deleted from this device, but not from your account. Try again.');
  dropFromReading(ownTableId(book.key));refreshOwnShelf(list=>list.filter(own=>own.key!==book.key));
 }catch{leave.cancel();notice('This book could not be deleted. Please try again.');}
}
/** A Currently reading card from the reading row itself, for a book the library's list does not hold yet. */
/**
 * A Finished card: one of the reader's own books (finished by its place), a book the shelves list
 * (or a typed search finds), else the row itself. Finished books held from the shelves (Symposium,
 * War and Peace: discoveryAvailable false) used to be dropped here, so Finished showed fewer books
 * than the reader had finished (Anders, 2026-10-20).
 */
function finishedCard(row){
 if(row.own){if(!row.ownKey||!row.href||!addEnabled())return null;const card=ownBookCard({key:row.ownKey,kind:row.kind||(row.ownKey.startsWith('pdf:')?'pdf':'epub'),title:row.title||'',author:row.author||'',cover:row.cover||ownShelf?.find(own=>own.key===row.ownKey)?.cover||null,href:row.href},el,{onDelete:(own,from)=>void deleteOwnBook(own,from)});card.dataset.shelfGroup='finished';return card;}
 const book=bookById(row.bookId);return book?{book}:readingRowCard(row,'finished');
}
function readingRowCard(row,group='reading'){
 const card=el('article','collection-card');card.dataset.shelfGroup=group;card.dataset.rowBook=row.bookId;
 const wrap=el('div','card-wrap');const open=el('button','book-card cover-button');open.type='button';open.setAttribute('aria-label',`Open ${row.title}${row.author?', by '+row.author:''}`);
 const src=bookCoverSrc({bookId:row.bookId,art:row.cover});
 if(src){const img=el('img','cover');img.src=src;img.alt='';img.decoding='async';open.append(img);}else{const cover=paperCover(row.title,row.author||'','');cover.className='cover';open.append(cover);}
 open.onclick=()=>openInReader({id:row.bookId});
 wrap.append(open,tinctShelfMenu(row.bookId,row.title,group==='reading'));card.append(wrap,el('h2','',shortTitle(row.title)),el('p','',row.author||''));return card;
}
/**
 * A Currently reading card for one of the reader's own books, from its reading-table row: the same
 * book, cover (its own picture, else the paper cover) and place as the desk. A row from an older
 * snapshot without the record's key takes it from the own-books list; without either it waits.
 */
function ownReadingCard(row,ownList){
 const listed=(ownList||[]).find(own=>ownTableId(own.key)===row.bookId)||null;
 const key=row.ownKey||listed?.key;if(!key)return null;
 const book={key,kind:row.kind||listed?.kind||(key.startsWith('pdf:')?'pdf':'epub'),title:row.title||listed?.title||'',author:row.author||listed?.author||'',cover:row.cover||listed?.cover||null,href:row.href||listed?.href||'',percent:row.percent??listed?.percent??null};
 if(!book.href)return null;
 const actions=[{label:READ_LATER,onChoose:own=>void offCurrentlyReading(ownTableId(own.key),{own})},{label:OFF_READING,onChoose:own=>void offCurrentlyReading(ownTableId(own.key),{own,later:false})}];
 const card=ownBookCard(book,el,{onDelete:(own,from)=>void deleteOwnBook(own,from),actions,progress:true});card.dataset.shelfGroup='own-reading';return card;
}
function loadOwnShelf(){if(!ownShelfLoading){const loading=addEngine().then(api=>api.ownBooks()).catch(()=>[]).then(list=>{if(ownShelfLoading!==loading)return;ownShelf=list;if(collectionChoice==='saved')renderMyBooks();});ownShelfLoading=loading;}return ownShelfLoading;}
// Removing a book from My shelf (Anders, 2026-10-09: "like Apple apps in iOS"): the
// book fades and shrinks away while the change is saved, then every re-render lets
// the remaining books glide from where they are to their new places (shelf-motion.js),
// with the page's scroll kept. Keys are group + book, so a book in two groups is two cards.
const leavingShelf=new Set();
const shelfKey=node=>node.dataset.flipKey;
const shelfNodes=()=>$('collection-books').querySelectorAll(':scope > [data-flip-key]');
function leaveShelf(keys){
 keys.forEach(key=>leavingShelf.add(key));
 const cards=[...shelfNodes()].filter(node=>keys.includes(shelfKey(node)));
 const forget=()=>keys.forEach(key=>leavingShelf.delete(key));
 return {faded:Promise.all(cards.map(card=>fadeOut(card,{reduced:reduced.matches}))),done:forget,cancel(){forget();if(collectionChoice==='saved')renderMyBooks();}};
}
function renderMyBooks(){
 const shown=collectionChoice==='saved'&&!$('collection').hidden,before=shown?recordRects(shelfNodes(),shelfKey):null,y=scrollY;
 drawMyBooks();
 if(!before)return;
 if(Math.abs(scrollY-y)>.5)scrollTo({top:y,behavior:'instant'});
 playFlip(shelfNodes(),before,shelfKey,{reduced:reduced.matches});
}
function drawMyBooks(){
 $('collection-title').textContent='My shelf';const grid=$('collection-books');grid.classList.remove('has-collection-reels');grid.replaceChildren();
 const table=window.__library2Reading||{reading:[],finished:[]},byId=id=>books.find(b=>b.id===id);
 // Desk membership defines Currently reading, including older cached snapshots.
 const reading=table.reading;
 const present=new Set([...reading,...table.finished].map(row=>row.bookId));
 // Currently reading is the reading table's own list (src/preReader/readingNow.ts), in its order:
 // Tinct's books and the reader's own together, as the desk and the reader's book switcher list them.
 const showOwn=addEnabled();
 const readingCards=reading.map(row=>row.own?(showOwn?ownReadingCard(row,ownShelf):null):byId(row.bookId)?{book:byId(row.bookId)}:readingRowCard(row)).filter(Boolean);
 // An own book taken off Currently reading (its place kept) is saved for later, as Tinct's are
 // (Anders, 2026-10-12); its ••• deletes it, as under My private uploads.
 const savedOwn=showOwn&&ownShelf?ownShelf.filter(b=>b&&b.readingAt==null&&b.savedAt!=null&&!present.has(ownTableId(b.key))).sort((a,b)=>b.savedAt-a.savedAt).map(b=>{const card=ownBookCard(b,el,{onDelete:(own,from)=>void deleteOwnBook(own,from),progress:true});card.dataset.shelfGroup='want';return card;}):[];
 const groups=[['Currently reading',readingCards,'reading'],['Saved for later',[...books.filter(b=>savedBooks.has(b.id)&&!present.has(b.id)).map(book=>({book})),...savedOwn],'want'],['Finished',table.finished.map(finishedCard).filter(Boolean),'finished']];
 let total=0;
 groups.forEach(([label,list,kind])=>{
  if(!list.length)return;total+=list.length;grid.append(el('h2','my-books-head',label));
  list.forEach(item=>{
   // A card drawn from its row (an own book, or a book the library's list does not hold yet).
   if(item instanceof Node){grid.append(item);return;}
   const book=item.book;
   const card=el('article','collection-card'),open=coverButton(book);card.dataset.shelfGroup=kind;card.dataset.book=book.id;
   // Every book here, Finished too, has the cover's ••• with Remove from shelf (Anders,
   // 2026-10-20; it replaces the shelf's ×, and the 2026-10-07 rule that Finished books stay),
   // after Read later under Currently reading (2026-10-21).
   open.querySelector('.save-toggle')?.replaceWith(tinctShelfMenu(book.id,book.title,kind==='reading'));
   if(kind==='reading'){
    const b=open.querySelector?.('button.cover-button')||open;b.onclick=null;
    b.addEventListener('click',e=>{if(e.target.closest('.save-toggle'))return;e.stopImmediatePropagation();void openInReader(book);},{capture:true});
   }
   card.append(open,el('h2','',shortTitle(book.title)),el('p','',book.author));grid.append(card);
  });
 });
 // My private uploads: this account's PDFs and EPUBs. Adding one is the + beside My shelf's heading.
 // (Own books being read are already under Currently reading, from the reading table's list.)
 syncShelfAdd(document.querySelector('#collection>header'),()=>setSearch(true));
 if(showOwn){
  if(ownShelf===null)void loadOwnShelf();
  // The reading table's own rows carry each cover at full size (read fresh with the table).
  const covers=new Map(reading.filter(r=>r.own&&r.cover).map(r=>[r.bookId,r.cover]));
  total+=appendOwnShelf(grid,ownShelf||[],el,{covers,currentlyReading:false,onDelete:(book,from)=>void deleteOwnBook(book,from)});
 }
 $('collection-empty').hidden=total>0;$('collection-empty').textContent='Books you are reading, and books you add with ＋, appear here.';
 for(const node of grid.children){
  node.dataset.flipKey=node.classList.contains('my-books-head')?'head:'+node.textContent:`${node.dataset.shelfGroup}:${node.dataset.book||node.dataset.rowBook||node.dataset.ownKey||''}`;
  if(leavingShelf.has(node.dataset.flipKey))markGone(node);
 }
}
addEventListener('library2:reading',()=>{if(collectionChoice==='saved')renderMyBooks();persistSaved();});
// Back from a book (the page restored as it was left): its cover or place may have changed since.
// Back to the library always lands on the reading table, never on My shelf as the page was left
// (Anders, 2026-10-12: the back gesture from a book opened from My shelf restored My shelf).
addEventListener('pageshow',event=>{if(event.persisted){ownShelf=null;ownShelfLoading=null;if(collectionChoice!=='home'&&location.hash!=='#my-shelf')selectCollection('home');}});
// Signed in or out on this page (the reading bridge's library2:auth): Add to Tinct appears or goes without a reload.
addEventListener('library2:auth',()=>{syncAccountButton();resetAddAccess();syncSearchAddFile($('search-add-file'));syncLibraryAdd($('library-add'));ownShelf=null;ownShelfLoading=null;if(searchOpen&&!openedFromSearch)renderResults();if(collectionChoice==='saved')renderMyBooks();});
function collectionCard(book){
 const card=el('article','collection-card');
 card.append(coverButton(book),el('h2','',book.title),el('p','',book.author));
 return card;
}
function renderCollection(){
 const [kind,id]=collectionChoice.split(':');let selected=books,title='All books';
 if(kind==='saved'){renderMyBooks();return;}
 const shelfAdd=document.querySelector('#collection .shelf-add');if(shelfAdd)shelfAdd.hidden=true;
 if(kind==='credits'){$('collection-title').textContent='Image credits';const grid=$('collection-books');grid.classList.remove('has-collection-reels');$('collection-empty').hidden=true;void renderImageCredits(grid).catch(()=>{grid.textContent='Image credits could not load. Please try again.';});return;}
 if(kind==='category'){selected=id==='all'?books:books.filter(b=>metadata[b.id]?.form===id);title=categories.find(c=>c.id===id)?.label||title;}
 if(kind==='era'){selected=books.filter(b=>metadata[b.id]?.era===id);title=eras.find(c=>c.id===id)?.label||title;}
 if(kind==='shelf'){const shelf=libraryHouses.flatMap(h=>h.shelves).find(s=>s.id===id);selected=books.filter(b=>shelf?.bookIds.includes(b.id));title=shelf?.title||title;}
 if(kind==='period'){const period=periodGroups.find(p=>p.id===id);selected=period?books.filter(b=>inPeriod(b,period)):[];title=period?period.label+' · '+period.range:title;}
 $('collection-title').textContent=title;
 const grid=$('collection-books'),groups=collectionReels(kind,id,selected,libraryHouses,title);
 grid.replaceChildren();grid.classList.toggle('has-collection-reels',groups.length>0);
 if(groups.length)for(const group of groups){
  const section=el('section','shelf collection-reel'),heading=el('h2','',group.title),row=el('div','book-row');
  section.dataset.collectionGroup=group.id;heading.id='collection-group-'+group.id;
  row.setAttribute('role','region');row.setAttribute('aria-labelledby',heading.id);row.tabIndex=0;
  group.books.forEach(book=>row.append(collectionCard(book)));
  section.append(heading,row);grid.append(section);
 }else selected.forEach(book=>grid.append(collectionCard(book)));
 $('collection-empty').hidden=selected.length>0;$('collection-empty').textContent='No books in this group yet.';
}
function renderBrowseMenus(){
 const add=(host,label,value,range)=>{
  const row=el('div','browse-group'),b=el('button','',label);b.onclick=()=>selectCollection(value);
  if(range)b.append(el('small','',range));row.append(b);host.append(row);
 };
 $('menu-categories').replaceChildren();$('menu-periods').replaceChildren();
 for(const c of categories){if(c.id!=='all'&&!books.some(b=>metadata[b.id]?.form===c.id))continue;add($('menu-categories'),c.label,'category:'+c.id);}
 for(const era of eras){if(!books.some(b=>metadata[b.id]?.era===era.id))continue;add($('menu-periods'),era.label,'era:'+era.id,era.range);}
 $('menu-periods').append(el('small','browse-date-note','Grouped by approximate composition dates; some works span several periods.'));
}
renderBrowseMenus();
all('[data-collection]').forEach(b=>b.onclick=()=>selectCollection(b.dataset.collection));$('collection-back').onclick=()=>selectCollection('home');persistSaved();

// Warm the optional artwork only after the landing page has finished loading.
// A book's character sketches load when the book is opened, before the Characters tab is shown.
const warmedSheets=new Set(),sheetsNeeded=new Set();function warmSheet(id,signal){const art=signature[id];const src=art&&(art.sheet||`assets/${id}-character-ink.png`);if(src&&!signal)sheetsNeeded.add(src);if(!src||warmedSheets.has(src))return;warmedSheets.add(src);const im=new Image();im.decoding='async';const loaded=new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=reject;});loaded.catch(()=>{});im.src=src;if(!signal)return loaded;const stopped=stopOnAbort(im,signal,()=>sheetsNeeded.has(src));stopped.catch(()=>warmedSheets.delete(src));return Promise.race([loaded,stopped]);}
function warmCharacterArt(){
 const warm=()=>featuredBooks.forEach(b=>{quiet.run('sheet:'+b.id,signal=>warmSheet(b.id,signal));quiet.run('cover:'+b.id,signal=>ensureCover(b,COVER_HERO_PX,signal));if(sceneIds.has(b.id))quiet.run('scene:'+b.id,signal=>loadScene(b.id,true,signal));});
 const whenModeKnown=()=>{
  const root=document.documentElement;
  if(root.classList.contains('returning'))return;
  // Account loading can outlast window.load. Keep first-visit scene warming
  // from competing with the returning reader's room, catalogue and covers.
  if(root.classList.contains('returning-pending')){addEventListener('library2:reading',e=>{if(e.detail.mode!=='returning'||!e.detail.reading.length)warm();},{once:true});return;}
  warm();
 };
 if('requestIdleCallback' in window)window.requestIdleCallback(whenModeKnown,{timeout:3000});else setTimeout(whenModeKnown,1000);
}
if(document.readyState==='complete')warmCharacterArt();else addEventListener('load',warmCharacterArt,{once:true});
// Returning readers see their own books on a reading table instead of the featured carousel.
const bookshelf=mountBookshelf({hero:$('hero'),enabled:()=>!activeBook&&!searchOpen&&!menuOpen&&mode==='minimized'&&collectionChoice==='home',onSaved:receiveSaved,notice,
 prepareCover:async(id,canvas)=>{let book=books.find(b=>b.id===id);if(!book){const entry=(await loadCatalogueData()).books.find(b=>b.id===id);if(!entry)return;book=libraryBook(entry);attachCatalogue(book,entry);books.push(book);}await ensureCover(book);paintCover(canvas,id);},
 openBook:async(id,img)=>{
  let book=books.find(b=>b.id===id);
  if(!book){const entry=(await loadCatalogueData()).books.find(b=>b.id===id);if(!entry)return;book=libraryBook(entry);attachCatalogue(book,entry);books.push(book);}
  await openBook(book,img||$('hero-book').querySelector('canvas'));
 }
});
// The linked book stays in the hero (or in focus on a returning reader's desk,
// bookshelf.js) until the reader chooses it: Read or the cover opens the usual
// introduction. Only in-app links asking for that introduction
// (view=book-detail) open it by themselves.
function featureLinked(book,entry){
 featured=book;featuredTarget=featuredBooks.indexOf(book);linkedState='shown';featureRequest++;
 const root=document.documentElement,info=signature[book.id],preview=$('hero-cover-preview'),c=$('hero-book').querySelector('canvas');
 if(root.dataset.linkedBook!==book.id){$('hero-title').textContent=book.title;$('hero-author').textContent=book.author+'’s';document.querySelector('.question').textContent=info?.question||reviewedHooks[book.id]||entry.blurb||'';if(book.cover)preview.src=book.cover;}
 $('hero-genre').textContent=info?.genre||bookCategory(book);$('hero-time').textContent=readingTime(book)||(info?`~${info.hours} hours to read`:'');
 $('hero-book').setAttribute('aria-label',`Open ${book.title}`);
 if(c.dataset.book!==book.id){c.dataset.book=book.id;c.removeAttribute('data-painted');preview.hidden=false;}
 paintCover(c,book.id);ensureCover(book,COVER_HERO_PX).catch(()=>{});showScene(book.id);
 all('.hero-dots button').forEach((e,j)=>{e.classList.toggle('active',j===featuredTarget);e.setAttribute('aria-pressed',String(j===featuredTarget));});
 updateHeroAction();root.classList.remove('linked-pending');
}
// A book that is not in the library: back to the featured book.
function linkedUnavailable(){if(linkedState!=='pending')return;linkedState=null;featuredTarget=0;const first=all('.hero-dots button')[0];if(first)first.click();if(document.documentElement.dataset.linkedBook)delete document.documentElement.dataset.linkedBook;refreshMetadata();setTimeout(()=>document.documentElement.classList.remove('linked-pending'),400);}
if(linkedBook)loadCatalogueData().then(data=>{if(linkedState!=='pending')return;const params=new URLSearchParams(location.search);const entry=data.books.find(b=>b.id===linkedBook&&b.discoveryAvailable!==false);if(!entry)return linkedUnavailable();let book=books.find(b=>b.id===linkedBook);if(!book){book=libraryBook(entry);books.push(book);}attachCatalogue(book,entry);const requested=params.get('edition');if(entry.editions?.some(e=>e.key===requested&&(e.language!=='da'||e.discoveryAvailable===true)&&e.discoveryAvailable!==false&&e.availability?.chapterText!==false))editionChoices.set(book.id,{main:requested,explicit:true});featureLinked(book,entry);if(params.get('view')==='book-detail')return openBook(book,$('hero-book').querySelector('canvas'));}).catch(()=>{linkedUnavailable();notice('This book could not load. Please try again.');});

// Reveal a fully drawn, positioned librarian instead of an empty circle at (0, 0).
drawOrb(performance.now());document.documentElement.classList.add('library-ready');

mountHeroNavigation({
 hero:$('hero'),
 enabled:()=>!document.documentElement.classList.contains('returning')&&!activeBook&&!searchOpen&&!menuOpen&&mode==='minimized'&&collectionChoice==='home'&&!document.documentElement.classList.contains('returning-pending'),
 move:direction=>{
  if(document.documentElement.classList.contains('returning')){$(direction>0?'rt-next':'rt-prev')?.click();return;}
  const dots=all('.hero-dots button');
  dots[(featuredTarget+direction+dots.length)%dots.length]?.click();
 }
});

if(!linkedBook&&readVisit()?.mode==='discovery'){const i=featuredBooks.findIndex(b=>b.id===readVisit()?.featured);if(i>0)all('.hero-dots button')[i].click();}



// The desktop shell keeps the complete library: search, collections, introductions,
// saved books, account and the production librarian all retain their normal routes.
let assistantCommand=0;
function openAssistantCommand(next){
 const request=++assistantCommand;openLibrarian();
 void loadAssistant().then(api=>{if(api&&request===assistantCommand&&mode==='welcome'){setMode(next);api.open(next);}});
}
registerCommands({
 prepare:()=>{if(searchOpen)setSearch(false);if(menuOpen)setMenu(false);},
 blocked:()=>!!document.querySelector('dialog[open]')||searchOpen||menuOpen,
 commands:[
  {id:'library-search',label:'Search books and authors',key:'/',run:()=>{setSearch(true);$('search-input').focus();}},
  {id:'library-chat',label:'Chat with your librarian',key:'c',run:()=>openAssistantCommand('chat')},
  {id:'library-talk',label:'Talk with your librarian',key:'t',run:()=>{if(mode==='talk'){minimize();return;}openAssistantCommand('talk');}},
  {id:'library-books',label:'My shelf',key:'b',run:()=>{const b=document.querySelector('[data-collection="saved"]');b?.click();}},
  {id:'library-menu',label:'Library categories and time periods',key:'i',run:()=>setMenu(true)},
  {id:'library-read',label:'Read the selected book',key:'r',enabled:()=>mode==='minimized',run:()=>{if(activeBook){$('begin-reading').click();}else{const resume=$('rt-continue');if(resume&&!resume.hidden&&resume.getClientRects().length)resume.click();else $('read-featured').click();}}},
  {id:'library-home',label:'Library home',key:'l',run:()=>location.assign('/library')},
  {id:'library-account',label:'Account and sign in',key:'a',run:()=>$('sign-in').click()},
  {id:'library-fullscreen',label:'Toggle full screen',key:'f',run:()=>{if(document.fullscreenElement)void document.exitFullscreen();else void document.documentElement.requestFullscreen?.().catch(()=>{});}},
 ]
});
const commandsButton=document.createElement('button');commandsButton.type='button';commandsButton.className='icon-button';commandsButton.id='library-commands';commandsButton.setAttribute('aria-label','Commands and themes');commandsButton.title='Commands & themes (?)';commandsButton.textContent='⌨';commandsButton.onclick=openCommands;if(commandsEnabled)$('search-toggle').before(commandsButton);
// /library?shelf=mine: an alias of /library#my-shelf (below), the one My shelf address; older back arrows from a reader's own book used it.
{const params=new URLSearchParams(location.search);if(params.get('shelf')==='mine'){params.delete('shelf');const rest=params.toString();try{history.replaceState(history.state,'',location.pathname+(rest?'?'+rest:'')+location.hash);}catch{}selectCollection('saved');}}
// Back from sign-in after a signed-out Add (/library?add=<work id>): the add continues once.
{const params=new URLSearchParams(location.search),pendingAdd=params.get(ADD_PARAM);if(pendingAdd!==null){params.delete(ADD_PARAM);const rest=params.toString();try{history.replaceState(history.state,'',location.pathname+(rest?'?'+rest:'')+location.hash);}catch{}if(addEnabled()&&document.documentElement.classList.contains('signed-in')&&/^[a-z]{2,4}:\S{1,200}$/.test(pendingAdd)){const waited=globalThis.TinctWait.waitOn($('library-add'),'Adding to Tinct…',{size:18});void addWork({id:pendingAdd},null).finally(waited);}}}
// /library#my-shelf (the reader's way back to your own books, and Add a book's old links): My shelf.
function openMyShelfFromHash(){if(location.hash!=='#my-shelf')return;try{history.replaceState(history.state,'',location.pathname+location.search);}catch{}if(collectionChoice!=='saved')selectCollection('saved');}
openMyShelfFromHash();addEventListener('hashchange',openMyShelfFromHash);
