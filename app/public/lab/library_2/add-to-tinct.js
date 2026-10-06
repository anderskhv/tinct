// "Add to Tinct" in the library (approved designs D1/D2, 2026-10-06): the search's
// "Not yet in Tinct" group, the "Have it as a file?" box, and My shelf's
// "Your own books". Only where public-books.js addToTinctEnabled() allows; elsewhere
// the library is unchanged. The catalogue search is Add a book's own worker and
// catalogue, loaded when search first opens; importing and the own-books list are
// /lab/library-add.js (src/libraryAdd.ts), loaded on first use.
import {addToTinctEnabled,groupSearchResults,freeRow,mergePublicBooks,PUBLIC_BOOKS_INDEX_URL} from '../public-books.js?v=20261006add';

export const enabled=()=>addToTinctEnabled();
export const ADD_BOOK_PAGE='/lab/addbook/';
/** The add a signed-out reader asked for resumes here after sign-in. */
export const ADD_PARAM='add';

// ---- Catalogue search (Add a book's worker), started when search opens ----
let worker=null,ready=null,request=0;const waiting=new Map();
export function warmFreeSearch(){
 if(worker||!enabled())return ready;
 try{worker=new Worker('/lab/addbook/js/search-worker.js',{type:'module'});}catch{worker=null;return null;}
 ready=new Promise((resolve,reject)=>{
  worker.onmessage=({data})=>{
   if(data.type==='ready')resolve();
   else if(data.type==='error')reject(new Error(data.message));
   else if(data.type==='results'){const done=waiting.get(data.request);waiting.delete(data.request);done?.(data.results||[]);}
  };
  worker.onerror=()=>reject(new Error('catalogue worker failed'));
 });
 ready.catch(()=>{});
 worker.postMessage({type:'load'});
 return ready;
}
/** Catalogue works for a query (more than are shown: works already in Tinct are dropped). */
export async function searchFree(query,limit=40){
 if(!query.trim()||!enabled())return [];
 await warmFreeSearch();
 const id=++request;
 return new Promise(resolve=>{waiting.set(id,resolve);worker.postMessage({type:'search',query,filters:{},limit,request:id});});
}

// ---- Added books in the library catalogue ----
/** The library catalogue with every added public book, where this device sees them. */
export async function withPublicBooks(data){
 if(!enabled())return data;
 try{const response=await fetch(PUBLIC_BOOKS_INDEX_URL);if(!response.ok)return data;const index=await response.json();return mergePublicBooks(data,index.books||[]);}catch{return data;}
}

// ---- The engine (import, own books) ----
const ENGINE='/lab/library-add.js?v=20261006add';let engine=null;
export function addEngine(){
 if(!engine)engine=import(/* @vite-ignore */ENGINE).then(()=>{if(!window.__tinctLibraryAdd)throw new Error('add engine unavailable');return window.__tinctLibraryAdd;});
 engine.catch(()=>{engine=null;});
 return engine;
}

// ---- Paper covers ----
function hue(text){let h=0;for(const c of String(text))h=(h*31+c.charCodeAt(0))%360;return h;}
function wrap(ctx,text,width){const words=String(text).split(/\s+/).filter(Boolean),lines=[];let line='';for(const word of words){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>width){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
/** A typographic paper cover (480×720): title and author set on cream paper, a thin rule in the book's own hue. */
export function paperCover(title,author,kind){
 const c=document.createElement('canvas');c.width=480;c.height=720;const ctx=c.getContext('2d');if(!ctx)return c;
 const h=hue(title);ctx.fillStyle='#ece5d0';ctx.fillRect(0,0,480,720);
 const grain=ctx.createLinearGradient(0,0,480,720);grain.addColorStop(0,'#f4eedc');grain.addColorStop(1,'#ddd3b8');ctx.fillStyle=grain;ctx.globalAlpha=.6;ctx.fillRect(0,0,480,720);ctx.globalAlpha=1;
 ctx.fillStyle=`hsl(${h} 30% 32%)`;ctx.fillRect(0,0,14,720);
 ctx.strokeStyle=`hsl(${h} 25% 38%)`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(70,250);ctx.lineTo(410,250);ctx.stroke();
 ctx.fillStyle='#1c1a14';ctx.textAlign='left';ctx.textBaseline='alphabetic';
 let size=48;ctx.font=`${size}px Georgia,serif`;let lines=wrap(ctx,title,340);
 while(lines.length>5&&size>26){size-=4;ctx.font=`${size}px Georgia,serif`;lines=wrap(ctx,title,340);}
 lines.slice(0,6).forEach((line,i)=>ctx.fillText(line,70,310+i*size*1.18,340));
 if(author){ctx.font='22px Georgia,serif';ctx.fillStyle='#4a4536';wrap(ctx,author.toUpperCase(),340).slice(0,2).forEach((line,i)=>ctx.fillText(line,70,620+i*28,340));}
 if(kind){ctx.font='600 15px system-ui,sans-serif';ctx.fillStyle=`hsl(${h} 25% 38%)`;ctx.fillText(String(kind).toUpperCase(),70,200);}
 return c;
}

// ---- Rendering ----
/** "Available in Tinct" / "Not yet in Tinct" / "Have it as a file?" in the search panel. */
export function renderSearchGroups(box,{query,tinct,tinctBooks,renderTinct,el,onAdd,addingWork}){
 box.classList.add('has-groups');
 const head=text=>el('h2','search-group-head',text);
 if(query.trim()){
  box.append(head('Available in Tinct'));
  if(tinct.length)renderTinct(tinct);else box.append(el('p','search-none','Try another title or author.'));
  const group=el('section','free-group');group.dataset.freeGroup='pending';box.append(group);
  void searchFree(query).then(free=>{
   if(!group.isConnected)return;
   const {notYet}=groupSearchResults({tinct,free,tinctBooks});group.dataset.freeGroup=String(notYet.length);
   if(!notYet.length)return;
   group.append(head('Not yet in Tinct'));const list=el('ol','free-list');
   for(const work of notYet){
    const row=freeRow(work),item=el('li','free-row'),text=el('span','free-text');
    const line=el('span','free-line');line.append(el('b','',row.title));if(row.author)line.append(document.createTextNode(' · '+row.author));
    text.append(line,el('small','',row.source));
    const add=el('button','free-add',addingWork===work.id?'Adding…':'Add');add.type='button';add.dataset.work=work.id;add.disabled=addingWork===work.id;add.setAttribute('aria-label',`Add ${row.title} to Tinct`);
    add.onclick=()=>onAdd(work,add);
    item.append(text,add);list.append(item);
   }
   group.append(list);
  }).catch(()=>{group.dataset.freeGroup='0';});
 }else renderTinct(tinct);
 const file=el('div','file-box');file.append(el('p','','Have it as a file?'));
 const pick=el('a','file-add','Add a PDF or EPUB');pick.href=ADD_BOOK_PAGE;file.append(pick);box.append(file);
}

/** My shelf's own-book card: a paper cover that opens the book. */
export function ownBookCard(book,el){
 const card=el('article','collection-card own-book');card.dataset.shelfGroup='own';
 const open=el('a','book-card cover-button own-cover');open.href=book.href;open.setAttribute('aria-label',`Open ${book.title}${book.author?', by '+book.author:''}`);
 const cover=paperCover(book.title,book.author,book.kind);cover.className='cover';open.append(cover);
 card.append(open,el('h2','',book.title),el('p','',book.author||book.kind.toUpperCase()));return card;
}
/** The dashed "+" tile that ends Your own books. */
export function addFileTile(el){
 const card=el('article','collection-card add-file-card');const tile=el('a','add-file-tile');tile.href=ADD_BOOK_PAGE;
 tile.append(el('span','add-file-plus','+'),el('span','','Add a PDF or EPUB'));card.append(tile);return card;
}

/** Own books under Currently reading (those with a saved place, latest first) and the rest of "Your own books". */
export function ownShelfGroups(list){
 const own=[...(list||[])];
 return {reading:own.filter(book=>book.readingAt!==null&&book.readingAt!==undefined).sort((a,b)=>b.readingAt-a.readingAt),own};
}
/**
 * My shelf's additions (D1): own books being read join Currently reading (after the
 * library's own, or under a new heading at the top), then "Your own books" with every
 * own book and the dashed + tile. Returns how many cards were added.
 */
export function appendOwnShelf(grid,list,el){
 const {reading,own}=ownShelfGroups(list);let added=0;
 if(reading.length){
  let after=[...grid.querySelectorAll('[data-shelf-group="reading"]')].pop()||null;
  if(!after){after=el('h2','my-books-head','Currently reading');grid.prepend(after);}
  for(const book of reading){const card=ownBookCard(book,el);card.dataset.shelfGroup='own-reading';after.after(card);after=card;added++;}
 }
 grid.append(el('h2','my-books-head','Your own books'));
 for(const book of own){grid.append(ownBookCard(book,el));added++;}
 grid.append(addFileTile(el));
 return added+1;
}
