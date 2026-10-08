// "Add to Tinct" in the library (approved designs D1/D2, 2026-10-06): the search's
// "Not yet in Tinct" group, the "Have it as a file?" box, and My shelf's
// "Your own books". Only where public-books.js addToTinctEnabled() allows (signed-in
// readers and internal devices; the page's signed-in class, kept live by the
// reading bridge, is the account state); elsewhere
// the library is unchanged. The catalogue search is Add a book's own worker and
// catalogue, loaded when search first opens; importing and the own-books list are
// /lab/library-add.js (src/libraryAdd.ts), loaded on first use.
import {putHandoff,HANDOFF_PARAM} from '../addbook/js/file-handoff.js?v=20261008rel5';
import {addToTinctEnabled,groupSearchResults,freeRow,mergePublicBooks,PUBLIC_BOOKS_INDEX_URL,IMPORT_LANGUAGES,REGISTRY_GUTENBERG_IDS} from '../public-books.js?v=20261008rel4';

/** The page's account state: boot.js sets the class from the signed-in cookie; the reading bridge keeps it in step with Supabase (library2:auth). */
export const signedIn=()=>document.documentElement.classList.contains('signed-in');
export const enabled=()=>addToTinctEnabled(undefined,signedIn());
export const ADD_BOOK_PAGE='/lab/addbook/';
/** Add a book's file step: "Your own book", a PDF or EPUB, without its free-book search (the library has its own). */
export const ADD_FILE_PAGE='/lab/addbook/?mode=file';
/** Where a file chosen in the library's pop-up continues: Add a book's own upload flow (file-handoff.js). */
export const ADD_FILE_HANDOFF_PAGE=`${ADD_FILE_PAGE}&${HANDOFF_PARAM}=1`;
/** The add a signed-out reader asked for resumes here after sign-in. */
export const ADD_PARAM='add';

// ---- Catalogue search (Add a book's worker), started when search opens ----
let worker=null,ready=null,request=0;const waiting=new Map();
export function warmFreeSearch(){
 if(worker||!enabled())return ready;
 try{worker=new Worker('/lab/addbook/js/search-worker.js?v=20261008rel5',{type:'module'});}catch{worker=null;return null;}
 ready=new Promise((resolve,reject)=>{
  worker.onmessage=({data})=>{
   if(data.type==='ready')resolve();
   else if(data.type==='error')reject(new Error(data.message));
   else if(data.type==='results'){const done=waiting.get(data.request);waiting.delete(data.request);done?.(data.results||[]);}
   else if(data.type==='borrowed'){const done=waiting.get(data.request);waiting.delete(data.request);done?.(data.borrowed||{});}
  };
  worker.onerror=()=>reject(new Error('catalogue worker failed'));
 });
 ready.catch(()=>{});
 worker.postMessage({type:'load'});
 return ready;
}
/**
 * Catalogue works for a query (more than are shown: works already in Tinct are dropped),
 * in the engine's ranking (addbooks/site/search.js). A `language` searches only that
 * language; without one, English ranks first within each tier.
 */
export async function searchFree(query,limit=40,{language=''}={}){
 if(!query.trim()||!enabled())return [];
 await warmFreeSearch();
 const id=++request;
 const filters=language?{language}:{};
 return new Promise(resolve=>{waiting.set(id,resolve);worker.postMessage({type:'search',query,filters,limit,request:id});});
}

/**
 * What the catalogue knows of the library's own books (search.js borrowFor), for ranking
 * "Available in Tinct" with the same engine: asked once per book, when the catalogue has loaded.
 * Resolves {} without Add to Tinct, or when every book was already asked about.
 */
const borrowAsked=new Set();
export async function borrowFromCatalogue(books){
 if(!enabled())return {};
 const ask=(books||[]).filter(book=>book?.id&&!borrowAsked.has(book.id));
 if(!ask.length)return {};
 for(const book of ask)borrowAsked.add(book.id);
 try{await warmFreeSearch();}catch{for(const book of ask)borrowAsked.delete(book.id);return {};}
 const id=++request;
 const workIds=book=>[...Object.entries(REGISTRY_GUTENBERG_IDS).filter(([,bookId])=>bookId===book.id).map(([workId])=>workId),...(book.public?.workId?[book.public.workId]:[])];
 const list=ask.map(book=>({id:book.id,title:book.title,author:book.author,workIds:workIds(book)}));
 return new Promise(resolve=>{waiting.set(id,resolve);worker.postMessage({type:'borrow',books:list,request:id});});
}

// ---- Added books in the library catalogue ----
/** The library catalogue with every added public book, where this device sees them. */
export async function withPublicBooks(data){
 if(!enabled())return data;
 try{const response=await fetch(PUBLIC_BOOKS_INDEX_URL);if(!response.ok)return data;const index=await response.json();return mergePublicBooks(data,index.books||[]);}catch{return data;}
}

// ---- The engine (import, own books) ----
const ENGINE='/lab/library-add.js?v=20261008ds';let engine=null;
export function addEngine(){
 if(!engine)engine=import(/* @vite-ignore */ENGINE).then(()=>{if(!window.__tinctLibraryAdd)throw new Error('add engine unavailable');return window.__tinctLibraryAdd;});
 engine.catch(()=>{engine=null;});
 return engine;
}

// ---- Premium: adding books (Add, a PDF or EPUB) is Premium or the 30-day trial (Anders, 2026-10-07) ----
/** The account page with its Premium offer: where a free account's Add and file entries lead. */
export const PREMIUM_PAGE=`/sign-in?mode=account&returnTo=${encodeURIComponent('/library')}`;
let access=null;
/** Whether this account may add books: true, false, or null when it cannot be told (asked once per account). */
export function canAdd(){
 if(!access){access=addEngine().then(api=>api.canAdd?api.canAdd():null).catch(()=>null);access.then(value=>{if(value===null)access=null;});}
 return access;
}
/** Forget the answer (the reader signed in or out). */
export function resetAddAccess(){access=null;}
// ---- Your own book: a pop-up over the library, then the file picker ----
// Add a book's own wording (addbook/index.html, "Your own book"); the rights confirmation
// itself stays in Add a book's upload flow, asked there once per account as today.
const OWN_BOOK_COPY={title:'Your own book',lede:'Open a PDF or EPUB from this device: a textbook, lecture notes, a DRM-free ebook. It stays private to your account.',fine:'Kept privately in your account, never shared. Only the passages you ask about go to Tinct’s reading companion. DRM-protected files can’t be opened.',choose:'Choose a PDF or EPUB',cancel:'Cancel'};
const FILE_ACCEPT='application/pdf,.pdf,application/epub+zip,.epub';
let openDialog=null;
/** Close the pop-up (if open), focus back on what opened it. */
export function closeFileDialog(){
 if(!openDialog)return;
 const {layer,from,onKey}=openDialog;openDialog=null;
 removeEventListener('keydown',onKey,true);layer.remove();from?.focus?.({preventScroll:true});
}
/**
 * The "Your own book" pop-up: Add a book's wording and one button that opens the file
 * picker directly. The chosen file is handed to Add a book's upload flow (`onFile`, by
 * default: kept for it in this browser, then Add a book continues), or, when it cannot be
 * handed over, Add a book's file step opens as before (`fallback`).
 */
export function openFileDialog({from=null,fallback=ADD_FILE_PAGE,onFile=null,go=href=>location.assign(href),keep=putHandoff}={}){
 closeFileDialog();
 const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 // Tinct UI's dialog (/lab/tinct-ui.css, docs/design-system.md) in the library's dark room.
 const layer=make('div','tui-scrim own-file-layer');layer.dataset.testid='own-file-dialog';layer.dataset.tuiTheme='dark';
 const box=make('div','tui-dialog own-file-dialog');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','own-file-title');
 const title=make('h2','tui-dialog__title',OWN_BOOK_COPY.title);title.id='own-file-title';
 const head=make('div','tui-dialog__head');head.append(title);
 const input=make('input');input.type='file';input.accept=FILE_ACCEPT;input.hidden=true;input.className='own-file-input';
 const cancel=make('button','tui-btn tui-btn--secondary own-file-cancel',OWN_BOOK_COPY.cancel);cancel.type='button';
 const choose=make('button','tui-btn tui-btn--primary own-file-choose',OWN_BOOK_COPY.choose);choose.type='button';
 const actions=make('div','tui-dialog__actions own-file-actions');actions.append(cancel,choose);
 box.append(head,make('p','tui-dialog__body own-file-lede',OWN_BOOK_COPY.lede),make('p','tui-dialog__fine own-file-fine',OWN_BOOK_COPY.fine),actions,input);
 layer.append(box);document.body.append(layer);
 const onKey=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeFileDialog();}};
 addEventListener('keydown',onKey,true);
 openDialog={layer,from,onKey};
 layer.addEventListener('click',event=>{if(event.target===layer)closeFileDialog();});
 cancel.onclick=()=>closeFileDialog();
 // The picker opens on this tap (browsers allow a file picker only from a user's own click).
 choose.onclick=()=>input.click();
 input.onchange=async()=>{
  const file=input.files?.[0];input.value='';if(!file)return;
  closeFileDialog();
  if(onFile){onFile(file);return;}
  go(await keep(file)?ADD_FILE_HANDOFF_PAGE:fallback);
 };
 choose.focus({preventScroll:true});
 return layer;
}
/**
 * A file entry: for Premium and trial, the "Your own book" pop-up (signed in) or Add a
 * book's file step (an internal device signed out: its account gate), the Premium offer
 * for a free account, exactly as before the pop-up.
 */
export async function openFileEntry(link,{access=canAdd,go=href=>location.assign(href),keep=putHandoff}={}){
 if((await access())===false){go(PREMIUM_PAGE);return null;}
 if(!signedIn()){go(link.href);return null;}
 return openFileDialog({from:link,fallback:link.href,go,keep});
}
function fileEntry(link){
 if(link.dataset.fileEntry)return link;link.dataset.fileEntry='1';
 link.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  void openFileEntry(link);
 });
 return link;
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

// ---- Search filters (with the search, so only where enabled() allows) ----
// Modern English, Audio and a language narrow "Available in Tinct" using the catalogue
// the library already loaded (each book's editions); nothing new is fetched. "Not yet
// in Tinct" works have no modern edition or narration yet, so Modern English or Audio
// leaves that group out; a language keeps the works in that language.
/** Language names as the app writes them (src/lab/preparationEditionLabel.ts, Add a book). */
export const LANGUAGE_NAMES={en:'English',da:'Danish',sv:'Swedish',no:'Norwegian',nb:'Norwegian',fi:'Finnish',de:'German',nl:'Dutch',fr:'French',it:'Italian',es:'Spanish',pt:'Portuguese',pl:'Polish',ru:'Russian',la:'Latin',el:'Greek',hu:'Hungarian',is:'Icelandic'};
export const languageName=code=>LANGUAGE_NAMES[code]||code;
export const NO_FILTERS=Object.freeze({modern:false,audio:false,language:''});
let filters={...NO_FILTERS};
/** The filters set in this search panel. */
export const searchFilters=()=>filters;
export const filtersActive=f=>!!(f&&(f.modern||f.audio||f.language));
/** A book's editions a reader can open from the library (as the edition picker offers them). */
export function readableEditions(book){return (book?.editions||[]).filter(e=>e&&e.language!=='da'&&e.discoveryAvailable!==false&&e.availability?.chapterText!==false);}
/** What the filters ask of a library book: a Modern English edition, narration, the languages it can be read in. */
export function bookFacts(book){
 const editions=readableEditions(book);
 return {modern:editions.some(e=>e.key==='modern-en'),audio:editions.some(e=>e.availability?.audio===true&&e.audioHeld!==true),languages:[...new Set(editions.map(e=>e.language).filter(Boolean))]};
}
/** "Available in Tinct" narrowed by the filters (every filter set must hold). */
export function filterAvailable(books,f=filters){
 if(!filtersActive(f))return books;
 return books.filter(book=>{const facts=bookFacts(book);return(!f.modern||facts.modern)&&(!f.audio||facts.audio)&&(!f.language||facts.languages.includes(f.language));});
}
/**
 * The language "Not yet in Tinct" searches in when the reader chose none: the one language
 * books can be added in (IMPORT_LANGUAGES), so works in other languages, which could not be
 * added, do not take the places of addable ones.
 */
export const notYetLanguage=()=>IMPORT_LANGUAGES.length===1?IMPORT_LANGUAGES[0]:'';
/** "Not yet in Tinct" works the filters keep: none with Modern English or Audio, those in the language otherwise. */
export function filterNotYet(works,f=filters){
 if(f?.modern||f?.audio)return [];
 if(!f?.language)return works||[];
 return (works||[]).filter(work=>(work.language||[]).includes(f.language));
}
/** The languages the library's books can be read in: English first, then by name. */
export function libraryLanguages(books){
 const codes=new Set();for(const book of books||[])for(const code of bookFacts(book).languages)codes.add(code);
 return [...codes].sort((a,b)=>a==='en'?-1:b==='en'?1:languageName(a).localeCompare(languageName(b)));
}
/** The chip row under the search field: made once in `host`, shown only with a query. */
export function syncSearchFilters(host,{query,tinctBooks,el,onChange}){
 if(!host)return null;
 let bar=host.querySelector(':scope > .search-filters');
 if(!bar){
  bar=el('div','search-filters');bar.setAttribute('role','group');bar.setAttribute('aria-label','Filter results');
  const chip=(key,label)=>{const b=el('button','search-filter',label);b.type='button';b.dataset.filter=key;
   b.onclick=()=>{filters={...filters,[key]:!filters[key]};paint();bar.changed?.();};return b;};
  const language=el('select','search-filter search-language');language.dataset.filter='language';language.setAttribute('aria-label','Language');
  language.onchange=()=>{filters={...filters,language:language.value};paint();bar.changed?.();};
  bar.append(chip('modern','Modern English'),chip('audio','Audio'),language);host.prepend(bar);
 }
 function paint(){
  for(const b of bar.querySelectorAll('button[data-filter]'))b.setAttribute('aria-pressed',String(!!filters[b.dataset.filter]));
  const select=bar.querySelector('.search-language');select.value=filters.language;select.classList.toggle('on',!!filters.language);
 }
 bar.changed=onChange;
 const select=bar.querySelector('.search-language'),codes=libraryLanguages(tinctBooks);
 if(filters.language&&!codes.includes(filters.language))codes.push(filters.language);
 if(select.dataset.codes!==codes.join(',')){
  select.dataset.codes=codes.join(',');
  const any=el('option','','Any language');any.value='';
  select.replaceChildren(any,...codes.map(code=>{const o=el('option','',languageName(code));o.value=code;return o;}));
 }
 select.hidden=codes.length<2;
 paint();
 bar.hidden=!query.trim();
 return bar;
}

// ---- Rendering ----
/**
 * "Available in Tinct" / "Not yet in Tinct" / "Have it as a file?" in the search panel,
 * with the filter chips in `filterHost`. Returns the "Available in Tinct" books shown;
 * `onFreeShown(n)` hears how many "Not yet in Tinct" rows were drawn, when they are.
 */
export function renderSearchGroups(box,{query,tinct,tinctBooks,renderTinct,el,onAdd,addingWork,addingStage,filterHost,onFilters,onFreeShown}){
 box.classList.add('has-groups');
 const head=text=>el('h2','search-group-head',text);
 const bar=syncSearchFilters(filterHost,{query,tinctBooks,el,onChange:onFilters});
 let shown=tinct;
 if(query.trim()){
  const f=bar?filters:NO_FILTERS;shown=filterAvailable(tinct,f);
  box.append(head('Available in Tinct'));
  if(shown.length)renderTinct(shown);else box.append(el('p','search-none','Try another title or author.'));
  const group=el('section','free-group');group.dataset.freeGroup='pending';box.append(group);
  if(f.modern||f.audio)group.dataset.freeGroup='0';
  else void searchFree(query,40,{language:f.language||notYetLanguage()}).then(free=>{
   if(!group.isConnected)return;
   const {notYet}=groupSearchResults({tinct,free:filterNotYet(free,f),tinctBooks});group.dataset.freeGroup=String(notYet.length);
   if(!notYet.length)return;
   onFreeShown?.(notYet.length);
   group.append(head('Not yet in Tinct'));const list=el('ol','free-list');
   for(const work of notYet){
    const row=freeRow(work),item=el('li','free-row'),text=el('span','free-text');
    const line=el('span','free-line');line.append(el('b','',row.title));if(row.author)line.append(document.createTextNode(' · '+row.author));
    text.append(line,el('small','',row.source));
    const add=el('button','free-add','Add');add.type='button';add.dataset.work=work.id;add.setAttribute('aria-label',`Add ${row.title} to Tinct`);
    add.onclick=()=>onAdd(work,add);
    item.append(text,add);list.append(item);
    if(addingWork===work.id)setAddBusy(add,addingStage||'start');
   }
   group.append(list);
  }).catch(()=>{group.dataset.freeGroup='0';});
 }else renderTinct(tinct);
 const file=el('div','file-box');file.append(el('p','','Have it as a file?'));
 const pick=el('a','file-add','Add a PDF or EPUB');pick.href=ADD_FILE_PAGE;file.append(fileEntry(pick));box.append(file);
 return shown;
}

// ---- Adding a book: the Add button becomes a small spinner, the row dims, a hairline shows the steps ----
/** importWork's steps (src/libraryAdd.ts onStage), in order; 'start' is before the first. */
export const ADD_STEPS=['start','download','convert','publish'];
/** How far along a step is, for the hairline under the row (never 0 or 1 while it runs). */
export const addProgress=stage=>[.08,.34,.67,.9][Math.max(0,ADD_STEPS.indexOf(stage))];
const SVG='http://www.w3.org/2000/svg';
function spinner(){
 const svg=document.createElementNS(SVG,'svg');svg.setAttribute('class','add-spinner');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','15');svg.setAttribute('height','15');svg.setAttribute('fill','none');svg.setAttribute('aria-hidden','true');
 // The reader's loading arc (LoadingIcon in src/lab/LabReaderIcons.tsx).
 const arc=document.createElementNS(SVG,'path');arc.setAttribute('d','M12 3a9 9 0 1 1-8.1 5.1');arc.setAttribute('stroke','currentColor');arc.setAttribute('stroke-width','2.4');arc.setAttribute('stroke-linecap','round');svg.append(arc);return svg;
}
/**
 * One Add while its import runs (`stage` one of ADD_STEPS), or back to "Add" (`stage` null).
 * Busy: a spinner in the button's own size, aria-busy, disabled, the row dimmed, and a hairline
 * across the row's foot for the step it is on.
 */
export function setAddBusy(button,stage){
 if(!button)return;
 const row=button.closest('.free-row');
 if(stage===null||stage===undefined){
  button.disabled=false;button.removeAttribute('aria-busy');button.classList.remove('is-busy');button.style.removeProperty('width');button.textContent='Add';
  if(row){row.classList.remove('is-adding');row.removeAttribute('aria-busy');row.querySelector(':scope > .free-progress')?.remove();}
  return;
 }
 if(!button.classList.contains('is-busy')){
  const width=button.offsetWidth;if(width)button.style.width=width+'px';
  const label=document.createElement('span');label.className='sr-only';label.textContent='Adding…';
  button.replaceChildren(spinner(),label);button.classList.add('is-busy');
 }
 button.disabled=true;button.setAttribute('aria-busy','true');
 if(!row)return;
 row.classList.add('is-adding');row.setAttribute('aria-busy','true');
 let bar=row.querySelector(':scope > .free-progress');
 if(!bar){bar=document.createElement('span');bar.className='free-progress';bar.setAttribute('aria-hidden','true');bar.append(document.createElement('i'));row.append(bar);}
 bar.style.setProperty('--p',String(addProgress(stage)));bar.dataset.stage=stage;
}

/** An own book's cover: its own picture (kept on this device, full size), else a paper cover. */
export function ownCoverElement(book){
 if(typeof book.cover==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(book.cover)){const img=document.createElement('img');img.className='cover own-cover-image';img.src=book.cover;img.alt='';img.decoding='async';return img;}
 const cover=paperCover(book.title,book.author,book.kind);cover.className='cover';return cover;
}
/** My shelf's own-book card: the book's cover (or a paper cover) that opens the book. */
export function ownBookCard(book,el){
 const card=el('article','collection-card own-book');card.dataset.shelfGroup='own';
 const open=el('a','book-card cover-button own-cover');open.href=book.href;open.setAttribute('aria-label',`Open ${book.title}${book.author?', by '+book.author:''}`);
 open.append(ownCoverElement(book));
 card.append(open,el('h2','',book.title),el('p','',book.author||book.kind.toUpperCase()));return card;
}
/** The dashed "+" tile that opens My shelf: straight to Add a book's file step. */
export function addFileTile(el){
 const card=el('article','collection-card add-file-card');const tile=el('a','add-file-tile');tile.href=ADD_FILE_PAGE;
 tile.append(el('span','add-file-plus','+'),el('span','','Add a PDF or EPUB'));card.append(fileEntry(tile));return card;
}

/** My shelf's "+ Add a book" tile: opens the library search, with "Not yet in Tinct" and the file box. */
export function addBookTile(el,onOpen){
 const card=el('article','collection-card add-book-card');const tile=el('button','add-file-tile add-book-tile');tile.type='button';tile.onclick=()=>onOpen();
 tile.append(el('span','add-file-plus','+'),el('span','','Add a book'));card.append(tile);return card;
}

/** Own books under Currently reading (those with a saved place, latest first) and the rest of "Your own books". */
export function ownShelfGroups(list){
 const own=[...(list||[])];
 return {reading:own.filter(book=>book.readingAt!==null&&book.readingAt!==undefined).sort((a,b)=>b.readingAt-a.readingAt),own};
}
/**
 * My shelf's additions (D1): the add tiles first, so adding a book is the first thing on
 * the shelf: "+ Add a book" (when `onAddBook` is given; it opens the library search), then
 * the dashed + tile for a PDF or EPUB. Own books being read join Currently reading (after
 * the library's own, or under a new heading at the top); then "Your own books" with every
 * own book, when there are any. Returns how many cards were added.
 */
export function appendOwnShelf(grid,list,el,onAddBook){
 const {reading,own}=ownShelfGroups(list);let added=0;
 if(reading.length){
  let after=[...grid.querySelectorAll('[data-shelf-group="reading"]')].pop()||null;
  if(!after){after=el('h2','my-books-head','Currently reading');grid.prepend(after);}
  for(const book of reading){const card=ownBookCard(book,el);card.dataset.shelfGroup='own-reading';after.after(card);after=card;added++;}
 }
 if(own.length){
  grid.append(el('h2','my-books-head','Your own books'));
  for(const book of own){grid.append(ownBookCard(book,el));added++;}
 }
 grid.prepend(addFileTile(el));
 if(onAddBook){grid.prepend(addBookTile(el,onAddBook));added++;}
 return added+1;
}

/** The library top bar's +, beside search: opens the add-a-book flow (the library search, as My shelf's "+ Add a book"), where Add to Tinct is on. */
export function syncLibraryAdd(button,onOpen){
 if(!button)return;
 button.hidden=!enabled();
 if(onOpen&&!button.dataset.addBound){button.dataset.addBound='1';button.addEventListener('click',()=>onOpen());}
}
/** The + at the right end of the library's search field: the "Your own book" pop-up, where Add to Tinct is on (a free account past its trial: the Premium offer). */
export function syncSearchAddFile(link){
 if(!link)return;
 link.href=ADD_FILE_PAGE;link.hidden=!enabled();fileEntry(link);
}
