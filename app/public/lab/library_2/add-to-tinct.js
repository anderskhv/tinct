// "Add to Tinct" in the library (approved designs D1/D2, 2026-10-06): the search's
// "Not yet in Tinct" group, the "Have it as a file?" box, and My shelf's
// "My private uploads" and its + pop-up. Only where public-books.js addToTinctEnabled() allows (signed-in
// readers and internal devices; the page's signed-in class, kept live by the
// reading bridge, is the account state); elsewhere
// the library is unchanged. The catalogue search is Add a book's own worker and
// catalogue, loaded when search first opens; importing and the own-books list are
// /lab/library-add.js (src/libraryAdd.ts), loaded on first use.
import {putHandoff,HANDOFF_PARAM} from '../addbook/js/file-handoff.js?v=20261008rel6';
import {normalize,includedWork,altTitlesFor} from '../addbook/js/search.js?v=20261008rel6';
import {addToTinctEnabled,groupSearchResults,freeRow,inTinct,mergePublicBooks,PUBLIC_BOOKS_INDEX_URL,IMPORT_LANGUAGES,REGISTRY_GUTENBERG_IDS} from '../public-books.js?v=20261008rel4';

/** The page's account state: boot.js sets the class from the signed-in cookie; the reading bridge keeps it in step with Supabase (library2:auth). */
export const signedIn=()=>document.documentElement.classList.contains('signed-in');
export const enabled=()=>addToTinctEnabled(undefined,signedIn());
/** My shelf, where your own books are ("My private uploads"): Add a book is no longer a page of its own (owner, 2026-10-08). */
export const MY_SHELF_URL='/library#my-shelf';
/** A file entry's link (the search field's +, "Add a PDF or EPUB"): My shelf, for a click the pop-up does not take. */
export const ADD_FILE_PAGE=MY_SHELF_URL;
/** Only when this browser cannot keep the file itself: Add a book's PDF reader takes it (file-handoff.js) and opens it unkept. */
export const ADD_FILE_HANDOFF_PAGE=`/lab/addbook/?mode=file&${HANDOFF_PARAM}=1`;
/** Signed out (an internal device): sign in, then back to My shelf. */
export const SIGN_IN_FOR_FILE=`/sign-in?returnTo=${encodeURIComponent(MY_SHELF_URL)}`;
/** The add a signed-out reader asked for resumes here after sign-in. */
export const ADD_PARAM='add';

// ---- Catalogue search (Add a book's worker), started when search opens ----
let worker=null,ready=null,request=0;const waiting=new Map();
export function warmFreeSearch(){
 if(worker||!enabled())return ready;
 try{worker=new Worker('/lab/addbook/js/search-worker.js?v=20261008rel6',{type:'module'});}catch{worker=null;return null;}
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
const ENGINE='/lab/library-add.js?v=20261008lib';let engine=null;
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
// ---- Your own book: a pop-up over the library that adds the file in place ----
// Add a book's own wording (its "Your own book" card and rights confirmation) and its engine
// (/lab/addbook/js/add-engine.js, with tinct-api.js and epub.js): the file is read, the rights
// confirmation asked once per account (the same recorded confirmation), kept in this browser,
// saved privately to the account, then the book opens: an EPUB in the Tinct reader, a PDF in
// Add a book's PDF reader. Nothing goes through Add a book's page.
const OWN_BOOK_COPY={title:'Your own book',lede:'Open a PDF or EPUB from this device: a textbook, lecture notes, a DRM-free ebook. It stays private to your account.',fine:'Kept privately in your account, never shared. Only the passages you ask about go to Tinct’s reading companion. DRM-protected files can’t be opened.',choose:'Choose a PDF or EPUB',search:'Add a book',cancel:'Cancel',keep:'Continue',opening:'Opening…',unkept:'This browser could not keep a copy, so you will need to open the file again next time.',failed:'This file could not be opened. Choose another file.'};
const FILE_ACCEPT='application/pdf,.pdf,application/epub+zip,.epub';
const FILE_ENGINE=['/lab/addbook/js/tinct-api.js','/lab/addbook/js/epub.js','/lab/addbook/js/add-engine.js?v=20261008lib'];
function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=()=>resolve();script.onerror=()=>reject(new Error('could not load '+src));document.head.append(script);});}
let fileEngine=null;
/** Add a book's engine on this page (window.TinctAddEngine), loaded on first use. */
export function loadFileEngine(load=loadScript){
 if(window.TinctAddEngine&&window.TinctAI&&window.TinctEpub)return Promise.resolve(window.TinctAddEngine);
 if(!fileEngine){fileEngine=Promise.all(FILE_ENGINE.map(src=>load(src))).then(()=>{if(!window.TinctAddEngine)throw new Error('add engine unavailable');return window.TinctAddEngine;});fileEngine.catch(()=>{fileEngine=null;});}
 return fileEngine;
}
let openDialog=null;
/** Close the pop-up (if open), focus back on what opened it. */
export function closeFileDialog(){
 if(!openDialog)return;
 const {layer,from,onKey}=openDialog;openDialog=null;
 removeEventListener('keydown',onKey,true);layer.remove();from?.focus?.({preventScroll:true});
}
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const button=(cls,text)=>{const b=make('button',cls,text);b.type='button';return b;};
/**
 * The "Your own book" pop-up. `onSearch` (the top bar's and My shelf's +) adds "Add a book",
 * which opens the library search; the search field's own entries leave it out. A chosen file
 * is added in the pop-up, with its progress there; `go` then opens the book.
 */
export function openFileDialog({from=null,onSearch=null,engine=loadFileEngine,go=href=>location.assign(href),keep=putHandoff,fallback=ADD_FILE_HANDOFF_PAGE}={}){
 closeFileDialog();
 // Tinct UI's dialog (/lab/tinct-ui.css, docs/design-system.md) in the library's dark room.
 const layer=make('div','tui-scrim own-file-layer');layer.dataset.testid='own-file-dialog';layer.dataset.tuiTheme='dark';
 const box=make('div','tui-dialog own-file-dialog');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','own-file-title');
 const title=make('h2','tui-dialog__title',OWN_BOOK_COPY.title);title.id='own-file-title';
 const head=make('div','tui-dialog__head');head.append(title);
 const input=make('input');input.type='file';input.accept=FILE_ACCEPT;input.hidden=true;input.className='own-file-input';
 const content=make('div','own-file-content');
 box.append(head,content,input);layer.append(box);document.body.append(layer);
 // While a file is being added, the pop-up stays until the book opens.
 const onKey=event=>{if(event.key==='Escape'&&!box.dataset.busy){event.preventDefault();event.stopPropagation();closeFileDialog();}};
 addEventListener('keydown',onKey,true);
 openDialog={layer,from,onKey};
 layer.addEventListener('click',event=>{if(event.target===layer&&!box.dataset.busy)closeFileDialog();});
 let ready=null;const api=()=>{if(!ready){ready=engine();ready.catch(()=>{ready=null;});}return ready;};
 // Warm the engine while the reader picks a file.
 api().catch(()=>{});
 const step=(name,...children)=>{box.dataset.step=name;content.replaceChildren(...children);};
 const actions=(...list)=>{const row=make('div','tui-dialog__actions own-file-actions');row.append(...list);return row;};
 const cancel=()=>{const b=button('tui-btn tui-btn--secondary own-file-cancel',OWN_BOOK_COPY.cancel);b.onclick=()=>closeFileDialog();return b;};
 const chooseStep=(message='')=>{
  delete box.dataset.busy;
  const choose=button('tui-btn tui-btn--primary own-file-choose',OWN_BOOK_COPY.choose);
  // The picker opens on this tap (browsers allow a file picker only from a user's own click).
  choose.onclick=()=>input.click();
  const row=actions(cancel());
  if(onSearch){const search=button('tui-btn tui-btn--secondary own-file-search',OWN_BOOK_COPY.search);search.onclick=()=>{closeFileDialog();onSearch();};row.append(search);}
  row.append(choose);
  const parts=[make('p','tui-dialog__body own-file-lede',OWN_BOOK_COPY.lede),make('p','tui-dialog__fine own-file-fine',OWN_BOOK_COPY.fine)];
  if(message){const alert=make('p','tui-dialog__body own-file-message',message);alert.setAttribute('role','alert');parts.unshift(alert);}
  step('choose',...parts,row);
  choose.focus({preventScroll:true});
 };
 const progress=value=>{
  box.dataset.busy='1';
  if(box.dataset.step!=='progress'){
   const status=make('p','tui-dialog__body own-file-status');status.setAttribute('role','status');status.append(make('span','tui-spinner'),make('span','',OWN_BOOK_COPY.opening));
   const bar=make('span','own-file-progress');bar.setAttribute('aria-hidden','true');bar.append(make('i'));
   step('progress',status,bar,make('p','tui-dialog__fine own-file-note'));
  }
  const bar=content.querySelector('.own-file-progress');bar.style.setProperty('--p',String(value));bar.dataset.value=String(value);
 };
 const note=text=>{const line=content.querySelector('.own-file-note');if(line)line.textContent=text;};
 // The rights confirmation, once per account (Add a book's wording; the engine records it).
 const confirmRights=(engineApi,name)=>new Promise(resolve=>{
  delete box.dataset.busy;
  const intro=make('p','tui-dialog__body own-file-rights-intro');
  intro.append('Tinct opens ',make('strong','',name),' here and keeps a private copy in your account, so you can open it on your other devices. It is never shared.');
  const label=make('label','tui-check own-file-rights');const check=make('input');check.type='checkbox';check.className='own-file-rights-box';label.append(check,make('span','',engineApi.RIGHTS_COPY));
  const ok=button('tui-btn tui-btn--primary own-file-continue',OWN_BOOK_COPY.keep);ok.disabled=true;
  const no=button('tui-btn tui-btn--secondary own-file-cancel',OWN_BOOK_COPY.cancel);
  check.onchange=()=>{ok.disabled=!check.checked;};
  no.onclick=()=>{resolve(false);closeFileDialog();};
  ok.onclick=()=>{engineApi.confirmRights();resolve(true);};
  step('rights',intro,label,actions(no,ok));
  check.focus({preventScroll:true});
 });
 async function addFile(file){
  progress(.08);
  let engineApi;
  try{engineApi=await api();}catch{chooseStep(OWN_BOOK_COPY.failed);return;}
  const read=await engineApi.readFile(file);
  if(read.error){chooseStep(read.error);return;}
  if(!engineApi.rightsConfirmed()&&!await confirmRights(engineApi,file.name))return;
  progress(.3);
  const kept=await engineApi.keepFile(file,read);
  // Unkept (storage full or blocked): Add a book's PDF reader takes the file and opens it unkept, as before.
  if(!kept){note(OWN_BOOK_COPY.unkept);go(await keep(file)?fallback:MY_SHELF_URL);return;}
  progress(.6);
  try{
   const opened=read.kind==='epub'?await engineApi.prepareEpub(read.bytes,file.name,read.key,file,{notify:note}):await engineApi.preparePdf(file,read.key,{notify:note});
   progress(1);
   go(opened.href);
  }catch(error){chooseStep(error?.message||OWN_BOOK_COPY.failed);}
 }
 input.onchange=()=>{const file=input.files?.[0];input.value='';if(file)void addFile(file);};
 chooseStep();
 layer.addFile=addFile;
 return layer;
}
/**
 * A file entry (the search field's +, "Add a PDF or EPUB", the top bar's and My shelf's +):
 * for Premium and trial, the "Your own book" pop-up (signed in) or sign-in first (an internal
 * device signed out), the Premium offer for a free account, exactly as before.
 */
export async function openFileEntry(from,{access=canAdd,go=href=>location.assign(href),...options}={}){
 if((await access())===false){go(PREMIUM_PAGE);return null;}
 if(!signedIn()){go(SIGN_IN_FOR_FILE);return null;}
 return openFileDialog({from,go,...options});
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

// ---- Result rows (approved search layout, 2026-10-08) ----
// Both groups list rows: the title, then the author (with " · tr. <translator>" and
// " · +N editions" when known); a small outlined pill just left of the button (the
// source library for "Not yet in Tinct", the Modern English / Audio editions for a
// Tinct book); the button on the right (Add, or Read for a Tinct book). Tapping the
// row (not the button) opens its details in place, full width: a description where
// the data has one, then Written / Translation / Length / Source / Note where known.
// Tap again or Escape closes them. Nothing is fetched for the details.
/** "Includes On Anger": the work a query asks for, printed inside this collection (search.js includedWork). */
export const includesText=title=>title?`Includes ${title}`:'';
/** "+1 edition" / "+3 editions": the other editions grouped under a row. */
export const editionCount=n=>n>0?`+${n} ${n===1?'edition':'editions'}`:'';
/** "Gutenberg", "Wikisource": the pill's short name of a catalogue work's library. */
export const sourceShort=work=>work?.editions?.[0]?.source||'';
const unique=list=>[...new Set(list.filter(Boolean))];
/** A year as the catalogue gives it: negative years are BC. */
export const yearText=year=>Number.isFinite(year)?(year<0?`${-year} BC`:String(year)):'';
/** "428–348 BC", "4 BC – AD 65", "1775–1817": only when both years are known. */
export function lifespan(person){
 const born=person?.birthYear,died=person?.deathYear;
 if(!Number.isFinite(born)||!Number.isFinite(died))return '';
 if(born<0&&died<0)return `${-born}–${-died} BC`;
 if(born<0)return `${-born} BC – AD ${died}`;
 return `${born}–${died}`;
}
/**
 * When a catalogue work was written: its first-published year, only when that is no later
 * than its author's death (Wikisource sometimes gives the year of the English edition).
 */
export function writtenYear(work){
 const year=work?.firstPublishedYear,died=work?.authors?.[0]?.deathYear;
 return Number.isFinite(year)&&Number.isFinite(died)&&year<=died?yearText(year):'';
}
/** What a "Not yet in Tinct" row shows. */
export function freeRowFacts(work,query=''){
 const row=freeRow(work),translators=unique((work.translators||[]).map(person=>person.name));
 const names=(work.authors||[]).flatMap(person=>[person.name,...(person.aliases||[])]).join(' ');
 return {title:row.title,author:row.author,translator:translators.join(', '),editions:editionCount((work.alternates||[]).length),includes:work.includes||'',aka:query?knownAs(row.title,names,work.altTitles,query):'',
  pills:[sourceShort(work)].filter(Boolean),description:'',
  facts:[['Written',writtenYear(work)],['Translation',translators.join(', ')],['Source',row.source],['Note',work.subtitle||'']].filter(([,value])=>value)};
}
/** What a Tinct book's row shows (`length`: the library's reading time for it). */
export function tinctRowFacts(book,{length='',query='',otherTitles=[]}={}){
 const facts=bookFacts(book),translators=unique(readableEditions(book).map(edition=>edition.translator));
 return {title:book.title||'',author:book.author||'',translator:translators.join(', '),editions:'',includes:query?includedWork(book.title,book.author,query):'',aka:query?knownAs(book.title,book.author,[...(book.altTitles||[]),...otherTitles],query):'',
  pills:[facts.modern?'Modern English':'',facts.audio?'Audio':''].filter(Boolean),description:book.summary||'',
  facts:[['Written',book.displayYear||''],['Translation',translators.join(', ')],['Length',length],['Source',book.public?.sourceName||'']].filter(([,value])=>value)};
}
const QUERY_STOP=new Set(['a','an','the','of','and','in','to','by','for','on']);
/**
 * The other title a row was found by, when its own title does not hold the query ("Letters from a
 * Stoic" for "seneca letters from a stoic" finding Moral Letters to Lucilius), else ''. The author's
 * names are not title words. Other titles: the row's own (`altTitles`, a Wikidata name) and the
 * curated ALT_TITLES (search.js altTitlesFor).
 */
export function knownAs(title,authors,altTitles,query){
 const author=new Set(words(authors));
 const terms=[...new Set(words(query))].filter(term=>!QUERY_STOP.has(term)&&!author.has(term));
 if(!terms.length)return '';
 const holds=name=>{const list=words(name);return terms.every((term,i)=>list.includes(term)||(i===terms.length-1&&term.length>=3&&list.some(word=>word.startsWith(term))));};
 if(holds(title))return '';
 const own=normalize(title||'');
 return unique([...(altTitles||[]),...altTitlesFor(title,authors)]).find(name=>normalize(name)!==own&&holds(name))||'';
}
/** The author line's note for a row found by another title (approved wording, 2026-10-08). */
export const akaText=title=>title?`also known as ${title}`:'';
let rowCount=0;
/** Open or close a row's details. */
export function setRowExpanded(row,open){
 const toggle=row?.querySelector(':scope > .row-toggle'),details=row?.querySelector(':scope > .row-details');
 if(!toggle||!details)return;
 toggle.setAttribute('aria-expanded',String(open));details.hidden=!open;row.classList.toggle('is-open',open);
}
/**
 * One result row (an <li>): the row toggle (a button with aria-expanded) holding `lead`
 * (a Tinct book's small cover) and the two lines, the pills, the `action` button, and the
 * details it opens. `key` names the row for the author card's chips.
 */
export function resultRow({el,facts,action,lead=null,key,className}){
 const row=el('li',`result-row ${className}`);row.dataset.rowKey=key;
 const toggle=el('button','row-toggle');toggle.type='button';toggle.setAttribute('aria-expanded','false');
 const id=`row-details-${++rowCount}`;toggle.setAttribute('aria-controls',id);
 const text=el('span','row-text');
 const by=el('span','row-author');by.append(el('span','row-by',facts.author));
 for(const extra of [facts.translator?`tr. ${facts.translator}`:'',facts.editions])if(extra)by.append(el('span','row-extra',` · ${extra}`));
 if(facts.aka)by.append(el('span','row-aka',` · ${akaText(facts.aka)}`));
 if(facts.includes)by.append(el('span','row-includes',` · ${includesText(facts.includes)}`));
 text.append(el('span','row-title',facts.title));if(facts.author||facts.translator||facts.editions||facts.includes||facts.aka)text.append(by);
 if(lead)toggle.append(lead);toggle.append(text);
 const pills=el('span','row-pills');for(const pill of facts.pills)pills.append(el('span','source-pill',pill));
 const details=el('div','row-details');details.id=id;details.hidden=true;
 if(facts.description)details.append(el('p','row-description',facts.description));
 if(facts.facts.length){const grid=el('dl','row-facts');for(const [label,value] of facts.facts){const item=el('div');item.append(el('dt','',label),el('dd','',value));grid.append(item);}details.append(grid);}
 row.append(toggle,pills,action,details);
 row.addEventListener('click',event=>{if(event.target.closest('.free-add,.tinct-open,.row-details'))return;setRowExpanded(row,toggle.getAttribute('aria-expanded')!=='true');});
 row.addEventListener('keydown',event=>{if(event.key!=='Escape'||toggle.getAttribute('aria-expanded')!=='true')return;event.preventDefault();event.stopPropagation();setRowExpanded(row,false);toggle.focus({preventScroll:true});});
 return row;
}
/**
 * A Tinct book's row in a search with a query: `cover` (its small painted cover, also where the
 * opening book flies from) inside the row toggle, and Read, which opens the book as its cover does.
 */
export function tinctRow(book,{el,cover,onOpen,length='',query='',otherTitles=[]}){
 const read=el('button','tinct-open','Read');read.type='button';read.setAttribute('aria-label',`Open ${book.title}, by ${book.author}`);read.onclick=()=>onOpen(book,cover);
 const thumb=el('span','row-cover');thumb.append(cover);
 const row=resultRow({el,facts:tinctRowFacts(book,{length,query,otherTitles}),action:read,lead:thumb,key:'book:'+book.id,className:'search-result tinct-row'});
 row.dataset.book=book.id;return row;
}

// ---- The author card: the query names an author ----
const SUFFIXES=new Set(['minor','maior','major','elder','younger','the','jr','sr']);
const words=text=>normalize(String(text||'')).split(' ').filter(Boolean);
/** The word a name is filed under: the first of "Surname, Given", else the last (without "minor", "the younger"…). */
function surnameOf(name){
 const text=String(name||'');
 if(text.includes(','))return words(text.split(',')[0])[0]||'';
 const list=words(text);while(list.length>1&&SUFFIXES.has(list[list.length-1]))list.pop();return list[list.length-1]||'';
}
/** A query names this person: every query word is a word of one of their names, and the surname is one of them (or the query is that whole name). */
function namesPerson(terms,names){
 return names.some(name=>{const list=words(name);return terms.every(term=>list.includes(term))&&(terms.includes(surnameOf(name))||list.length===terms.length);});
}
/** People in the results, one entry per person: "Seneca" and "Lucius Annaeus Seneca" are one; Henry and William James are two. */
function gatherPeople(entries){
 const people=[];
 const subset=(a,b)=>a.every(word=>b.includes(word));
 for(const {person,item} of entries){
  const name=person.name||'';const list=words(name),surname=surnameOf(name);if(!surname)continue;
  const years=p=>Number.isFinite(p.birthYear)&&Number.isFinite(p.deathYear)?`${p.birthYear}/${p.deathYear}`:'';
  let found=people.find(p=>p.surname===surname&&(subset(list,p.words)||subset(p.words,list)||(years(person)&&years(person)===p.years)));
  if(!found){found={surname,words:list,years:years(person),names:[],records:[],items:new Set()};people.push(found);}
  if(!found.years&&years(person))found.years=years(person);
  found.names.push(name,...(person.aliases||[]));found.records.push(person);found.items.add(item);
 }
 return people;
}
/**
 * The author a query clearly names, or null: someone whose name the query is (see namesPerson),
 * who wrote the first result and at least two of the results (`tinct`: library books shown,
 * `free`: the catalogue's own results, in its ranking). Returns {name, names, lifespan, inTinct,
 * works}: `works` are their best-known works shown, at most five, as {key, title} (`key` names
 * the row a chip opens). The catalogue ranks an author's books by fame; a collection's works
 * (the worker's `contains`, each with the fame of its Wikidata work) stand in for the collection
 * and point to its row ("On the Shortness of Life" opens Minor Dialogues).
 */
export function findAuthor({query,tinct=[],free=[],notYet=[],tinctBooks=[]}){
 const terms=words(query).filter(term=>!['a','an','the','of','and'].includes(term));
 if(!terms.length||terms.join('').length<3)return null;
 const entries=[...tinct.map(book=>({person:{name:book.author||''},item:book})),...free.flatMap(work=>(work.authors||[]).map(person=>({person,item:work})))];
 const people=gatherPeople(entries).filter(p=>namesPerson(terms,p.names));
 if(!people.length)return null;
 people.sort((a,b)=>b.items.size-a.items.size);
 const best=people[0],first=tinct[0]||free[0];
 if(best.items.size<2||!best.items.has(first)||(people[1]&&people[1].items.size*2>best.items.size))return null;
 const own=book=>{const list=words(book.author);return surnameOf(book.author)===best.surname&&(list.every(w=>best.words.includes(w))||best.words.every(w=>list.includes(w)));};
 const library=(tinctBooks.length?tinctBooks:tinct).filter(own);
 const shownTinct=tinct.filter(book=>best.items.has(book));
 // Each row once, in the catalogue's order (fame); rows the catalogue does not rank follow.
 const rows=[];
 const push=(key,title,work)=>{if(key&&title&&!rows.some(row=>row.key===key))rows.push({key,title,fame:Number.isFinite(work?.fame)?work.fame:null,contains:work?.contains||[]});};
 for(const work of free){
  if(!best.items.has(work))continue;
  const book=shownTinct.find(item=>inTinct(work,[item]));
  if(book){push('book:'+book.id,book.title,work);continue;}
  const group=notYet.find(item=>item.id===work.id||(item.alternates||[]).some(other=>other.id===work.id));
  if(group)push('work:'+group.id,group.title,group);
 }
 for(const book of shownTinct)push('book:'+book.id,book.title,null);
 for(const work of notYet)if(best.items.has(work)||(work.authors||[]).some(person=>namesPerson(terms,[person.name,...(person.aliases||[])])))push('work:'+work.id,work.title,work);
 const chips=[];
 rows.forEach((row,order)=>{
  const parts=row.contains.filter(part=>part.fame>0);
  if(parts.length)for(const part of parts)chips.push({key:row.key,title:part.title,fame:part.fame,order});
  else chips.push({key:row.key,title:row.title,fame:row.fame,order});
 });
 // By fame when every chip has one; otherwise as ranked, a collection's works by their fame in its place.
 const known=chips.every(chip=>chip.fame!=null);
 chips.sort((a,b)=>known?b.fame-a.fame||a.order-b.order:a.order-b.order||(b.fame??0)-(a.fame??0));
 const works=[];
 for(const chip of chips)if(!works.some(item=>normalize(item.title)===normalize(chip.title)))works.push({key:chip.key,title:chip.title});
 const record=best.records.find(person=>lifespan(person))||{};
 const tinctName=library[0]?.author||shownTinct[0]?.author;
 const name=tinctName||(free.find(work=>best.items.has(work))?.authors||[]).find(person=>best.records.includes(person))?.name||best.names[0];
 return {name,names:unique(best.names),lifespan:lifespan(record),inTinct:library.length,works:works.slice(0,5)};
}
/** "3 books in Tinct" / "1 book in Tinct". */
export const booksInTinct=n=>n>0?`${n} ${n===1?'book':'books'} in Tinct`:'';
/** Open a row and bring it into view (an author card's chip). */
export function revealRow(box,key){
 const row=[...box.querySelectorAll('.result-row')].find(item=>item.dataset.rowKey===key);
 if(!row)return null;
 setRowExpanded(row,true);
 const still=matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 row.scrollIntoView?.({block:'center',behavior:still?'auto':'smooth'});
 row.querySelector(':scope > .row-toggle')?.focus({preventScroll:true});
 return row;
}
/**
 * The author card: portrait (`portraitFor(names)` resolves {src} or null; a plain circle until
 * then), name, "<lifespan> · N books in Tinct" where known, and chips for their best-known works.
 */
export function authorCard(author,{el,box,portraitFor}){
 const card=el('section','author-card');card.setAttribute('aria-label',author.name);
 const portrait=el('span','author-portrait');portrait.setAttribute('aria-hidden','true');
 const text=el('div','author-text');text.append(el('h2','author-name',author.name));
 const subtitle=[author.lifespan,booksInTinct(author.inTinct)].filter(Boolean).join(' · ');
 if(subtitle)text.append(el('p','author-subtitle',subtitle));
 const head=el('div','author-head');head.append(portrait,text);card.append(head);
 const chips=author.works.filter(work=>work.title).map(work=>[work.key,work.title]);
 if(chips.length){
  const list=el('div','author-works');
  for(const [key,title] of chips){const chip=el('button','author-work',title);chip.type='button';chip.dataset.rowKey=key;chip.onclick=()=>revealRow(box,key);list.append(chip);}
  card.append(list);
 }
 Promise.resolve(portraitFor?.(author.names)).then(found=>{
  if(!found?.src)return;
  const img=el('img');img.src=found.src;img.alt='';img.decoding='async';portrait.append(img);portrait.classList.add('has-image');
 }).catch(()=>{});
 return card;
}

// ---- Rendering ----
/**
 * "Available in Tinct" / "Not yet in Tinct" / "Have it as a file?" in the search panel,
 * with the filter chips in `filterHost`. Returns the "Available in Tinct" books shown;
 * `onFreeShown(n)` hears how many "Not yet in Tinct" rows were drawn, when they are.
 * With a query, "Available in Tinct" is left out when it has no books and the catalogue
 * has some ("Try another title or author." only when nothing is found at all), and an
 * author card leads when the query names an author (`portraitFor` finds their portrait).
 */
export function renderSearchGroups(box,{query,tinct,tinctBooks,renderTinct,el,onAdd,addingWork,addingStage,filterHost,onFilters,onFreeShown,portraitFor}){
 box.classList.add('has-groups');
 const head=text=>el('h2','search-group-head',text);
 const bar=syncSearchFilters(filterHost,{query,tinctBooks,el,onChange:onFilters});
 let shown=tinct;
 if(query.trim()){
  const f=bar?filters:NO_FILTERS;shown=filterAvailable(tinct,f);
  // The author card goes first, once the catalogue has answered (it knows the author's other works).
  const lead=el('div','author-slot');box.append(lead);
  // "Available in Tinct" when it has books; with none, its place waits for the catalogue.
  const empty=el('div','search-empty');empty.hidden=true;
  if(shown.length){box.append(head('Available in Tinct'));renderTinct(shown);}else box.append(empty);
  const nothing=()=>{empty.replaceWith(head('Available in Tinct'),el('p','search-none','Try another title or author.'));};
  const group=el('section','free-group');group.dataset.freeGroup='pending';box.append(group);
  const finish=(free,notYet)=>{
   const author=findAuthor({query,tinct:shown,free,notYet,tinctBooks});
   if(!author){lead.remove();return;}
   lead.replaceWith(authorCard(author,{el,box,portraitFor}));
  };
  if(f.modern||f.audio){group.dataset.freeGroup='0';if(!shown.length)nothing();finish([],[]);}
  else void searchFree(query,40,{language:f.language||notYetLanguage()}).then(free=>{
   if(!group.isConnected)return;
   const {notYet}=groupSearchResults({tinct,free:filterNotYet(free,f),tinctBooks});group.dataset.freeGroup=String(notYet.length);
   if(!notYet.length){if(!shown.length)nothing();finish(filterNotYet(free,f),[]);return;}
   empty.remove();
   onFreeShown?.(notYet.length);
   group.append(head('Not yet in Tinct'));const list=el('ol','free-list');
   for(const work of notYet){
    const add=el('button','free-add','Add');add.type='button';add.dataset.work=work.id;add.setAttribute('aria-label',`Add ${work.title} to Tinct`);
    add.onclick=()=>onAdd(work,add);
    const item=resultRow({el,facts:freeRowFacts(work,query),action:add,key:'work:'+work.id,className:'free-row'});item.dataset.work=work.id;
    list.append(item);
    if(addingWork===work.id)setAddBusy(add,addingStage||'start');
   }
   group.append(list);
   finish(filterNotYet(free,f),notYet);
  }).catch(()=>{group.dataset.freeGroup='0';if(group.isConnected&&!shown.length)nothing();lead.remove();});
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
/**
 * My shelf's own-book card: the book's cover (or a paper cover) that opens the book, and the
 * same × as the shelf's other books (`onRemove`, labelled "Remove from My shelf: <title>").
 * `cover` replaces the listed cover (the reading table's full-size one, when it has it).
 */
export function ownBookCard(book,el,{onRemove=null,cover=null}={}){
 const card=el('article','collection-card own-book');card.dataset.shelfGroup='own';card.dataset.ownKey=book.key;
 const open=el('a','book-card cover-button own-cover');open.href=book.href;open.setAttribute('aria-label',`Open ${book.title}${book.author?', by '+book.author:''}`);
 open.append(ownCoverElement(cover?{...book,cover}:book));
 let face=open;
 if(onRemove){
  face=el('div','card-wrap');
  const x=el('button','save-toggle','×');x.type='button';x.dataset.shelfRemove='true';x.dataset.title=book.title;x.setAttribute('aria-label','Remove from My shelf: '+book.title);
  x.onclick=event=>{event.preventDefault();event.stopPropagation();onRemove(book,x);};
  face.append(open,x);
 }
 card.append(face,el('h2','',book.title),el('p','',book.author||book.kind.toUpperCase()));return card;
}

/** Own books under Currently reading (those with a saved place, latest first) and the rest of "My private uploads". */
export function ownShelfGroups(list){
 const own=[...(list||[])];
 return {reading:own.filter(book=>book.readingAt!==null&&book.readingAt!==undefined).sort((a,b)=>b.readingAt-a.readingAt),own};
}
/** Approved name of My shelf's own-books group (owner, 2026-10-08; was "Your own books"). */
export const PRIVATE_UPLOADS='My private uploads';
/** The reading table's id for an own book (`userbook-<hex>`, src/lab/userBook/userBookId.ts). */
export const ownTableId=key=>'userbook-'+String(key||'').replace(/^(epub|pdf):/,'');
/**
 * My shelf's own books. Own books being read join Currently reading (after the library's own,
 * or under a new heading at the top), with the × that takes a book off Currently reading
 * (`onRemoveReading`); then "My private uploads" with every own book and the × that deletes
 * one (`onDelete`). `covers` maps a reading-table id to its full-size cover. Adding a book is
 * the + beside My shelf's heading. Returns how many cards were added.
 */
export function appendOwnShelf(grid,list,el,{onRemoveReading=null,onDelete=null,covers=null}={}){
 const {reading,own}=ownShelfGroups(list);let added=0;
 const coverFor=book=>covers?.get?.(ownTableId(book.key))||null;
 if(reading.length){
  let after=[...grid.querySelectorAll('[data-shelf-group="reading"]')].pop()||null;
  if(!after){after=el('h2','my-books-head','Currently reading');grid.prepend(after);}
  for(const book of reading){const card=ownBookCard(book,el,{onRemove:onRemoveReading,cover:coverFor(book)});card.dataset.shelfGroup='own-reading';after.after(card);after=card;added++;}
 }
 if(own.length){
  grid.append(el('h2','my-books-head',PRIVATE_UPLOADS));
  for(const book of own){grid.append(ownBookCard(book,el,{onRemove:onDelete,cover:coverFor(book)}));added++;}
 }
 return added;
}

// ---- Removing one of My private uploads: the existing delete (this device and the account) ----
/**
 * Confirm before an own book is deleted (the reading table's remove dialog, in Tinct UI).
 * Resolves true on Remove.
 */
export function confirmDeleteUpload(book,{from=null}={}){
 return new Promise(resolve=>{
  const layer=make('div','tui-scrim own-delete-layer');layer.dataset.testid='own-delete-dialog';layer.dataset.tuiTheme='dark';
  const box=make('div','tui-dialog own-delete-dialog');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','own-delete-title');
  const title=make('h2','tui-dialog__title',`Remove ${book.title}?`);title.id='own-delete-title';
  const head=make('div','tui-dialog__head');head.append(title);
  const keepIt=button('tui-btn tui-btn--secondary own-delete-cancel','Keep book');
  const remove=button('tui-btn tui-btn--primary own-delete-confirm','Remove');
  const row=make('div','tui-dialog__actions');row.append(keepIt,remove);
  box.append(head,make('p','tui-dialog__body','It is removed from this device and your account.'),row);layer.append(box);document.body.append(layer);
  const done=value=>{removeEventListener('keydown',onKey,true);layer.remove();from?.focus?.({preventScroll:true});resolve(value);};
  const onKey=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();done(false);}};
  addEventListener('keydown',onKey,true);
  layer.addEventListener('click',event=>{if(event.target===layer)done(false);});
  keepIt.onclick=()=>done(false);remove.onclick=()=>done(true);
  keepIt.focus({preventScroll:true});
 });
}
/**
 * Delete an own book from this device and the account with Add a book's own delete
 * (add-engine.js removeBook: the kept file, its place, the account copy). Other books'
 * places are never touched. Resolves true when it is gone from both.
 */
export async function deleteUpload(book,{engine=loadFileEngine}={}){
 const api=await engine();
 // An account copy not on this device is found by the account's list.
 if(!(await api.library.get(book.key)))await api.cloud.refresh();
 return api.removeBook(book.key);
}

/** The library top bar's +, beside search: the "Your own book" pop-up with "Add a book" (`onSearch`: the library search), where Add to Tinct is on. */
export function syncLibraryAdd(button,onSearch){
 if(!button)return;
 button.hidden=!enabled();
 if(onSearch&&!button.dataset.addBound){button.dataset.addBound='1';button.addEventListener('click',()=>{void openFileEntry(button,{onSearch});});}
}
/** My shelf's +, beside its heading: the same pop-up as the top bar's +; shown where Add to Tinct is on. */
export function syncShelfAdd(header,onSearch){
 if(!header)return null;
 let add=header.querySelector('.shelf-add');
 if(!add){
  add=document.createElement('button');add.type='button';add.className='tui-icon-btn shelf-add';add.setAttribute('aria-label','Add a book');add.title='Add a book';
  add.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  add.addEventListener('click',()=>{void openFileEntry(add,{onSearch});});
  header.append(add);
 }
 add.hidden=!enabled();
 return add;
}
/** The + at the right end of the library's search field: the "Your own book" pop-up, where Add to Tinct is on (a free account past its trial: the Premium offer). */
export function syncSearchAddFile(link){
 if(!link)return;
 link.href=ADD_FILE_PAGE;link.hidden=!enabled();fileEntry(link);
}
