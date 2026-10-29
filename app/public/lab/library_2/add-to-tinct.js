// "Add to Tinct" in the library (approved designs D1/D2, 2026-10-06): the search's
// "Not yet in Tinct" group, the "Have it as a file?" box, and My shelf's
// "My private uploads" and its + pop-up. Only where public-books.js addToTinctEnabled() allows (signed-in
// readers and internal devices; the page's signed-in class, kept live by the
// reading bridge, is the account state); elsewhere
// the library is unchanged. The catalogue search is Add a book's own worker and
// catalogue, loaded when search first opens; importing and the own-books list are
// /lab/library-add.js (src/libraryAdd.ts), loaded on first use.
import {putHandoff,HANDOFF_PARAM} from '../addbook/js/file-handoff.js?v=20261009rel10';
import {normalize,includedWork,altTitlesFor,cleanName} from '../addbook/js/search.js?v=20261009rel10';
import {eraLabel} from './book-metadata.js?v=20261009rel10';
import {paperCover,ownCoverImage} from '../book-cover.js?v=20261009owncover';
import {shortTitle} from '../book-title.js?v=20261009owncover';
import {addToTinctEnabled,isPublicBookId,modernEditionsEnabled,groupSearchResults,freeRow,importSource,personName,inTinct,mergePublicBooks,PUBLIC_BOOKS_INDEX_URL,PUBLIC_BOOKS_INDEX_FETCH,IMPORT_LANGUAGES,REGISTRY_GUTENBERG_IDS} from '../public-books.js?v=20261009rel10';
import {sharedReaderEnabled} from '../shared-reader-activation.js?v=20261023activate';
import {pasteEpub,preview as pastePreview,suggestedTitle} from './paste-text.js?v=20261023paste1';

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
const pasteEnabled=()=>sharedReaderEnabled(location.search);
const PASTE_MAX_CHARS=240000;
const pasteShelf=()=>'/library?sharedReader=1#my-shelf';
const signInForEntry=()=>pasteEnabled()?`/sign-in?returnTo=${encodeURIComponent(pasteShelf())}`:SIGN_IN_FOR_FILE;
/** The add a signed-out reader asked for resumes here after sign-in. */
export const ADD_PARAM='add';

// ---- Catalogue search (Add a book's worker), started when search opens ----
let worker=null,ready=null,request=0;const waiting=new Map();
export function warmFreeSearch(){
 if(worker||!enabled())return ready;
 try{worker=new Worker('/lab/addbook/js/search-worker.js?v=20261009rel10',{type:'module'});}catch{worker=null;return null;}
 ready=new Promise((resolve,reject)=>{
  worker.onmessage=({data})=>{
   if(data.type==='ready')resolve();
   else if(data.type==='error')reject(new Error(data.message));
   // The works, with the author the query names (`author`) and, for an empty English search, where the other languages have them (`elsewhere`).
   else if(data.type==='results'){const done=waiting.get(data.request);waiting.delete(data.request);done?.(Object.assign(data.results||[],{author:data.author||null,elsewhere:data.elsewhere||null}));}
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
 const linked=linkedPublicBook();let merged=data;
 if(enabled()){try{const response=await fetch(PUBLIC_BOOKS_INDEX_URL,PUBLIC_BOOKS_INDEX_FETCH);if(response.ok){const index=await response.json();merged=mergePublicBooks(data,index.books||[]);}}catch{/* the linked book below, or the plain catalogue */}}
 // The added book a link names (/library?book=pd-…, /read/pd-…) is in the catalogue for every visitor,
 // signed out too, and when an index from before the add left it out; otherwise the hero showed another book (QA 2026-10-09).
 if(!linked||merged?.books?.some(book=>book.id===linked))return merged;
 try{const response=await fetch(`${PUBLIC_BOOKS_INDEX_URL}/${encodeURIComponent(linked)}`,PUBLIC_BOOKS_INDEX_FETCH);if(!response.ok)return merged;const record=await response.json();return record?.entry?.id===linked?mergePublicBooks(merged,[record.entry]):merged;}catch{return merged;}
}
/** The added (pd-) book this page's link names: `?book=` or the shared `/read/<id>`; null otherwise. */
export function linkedPublicBook(){
 try{const id=new URLSearchParams(location.search).get('book')||location.pathname.match(/^\/read\/([a-z0-9-]+)\/?$/)?.[1]||null;return isPublicBookId(id)?id:null;}catch{return null;}
}

// ---- The engine (import, own books) ----
const ENGINE='/lab/library-add.js?v=20261014talkwake';let engine=null;
export function addEngine(){
 if(!engine)engine=import(/* @vite-ignore */ENGINE).then(()=>{if(!window.__tinctLibraryAdd)throw new Error('add engine unavailable');return window.__tinctLibraryAdd;});
 engine.catch(()=>{engine=null;});
 return engine;
}

// ---- Premium: adding books (Add, a PDF or EPUB) is Premium or the 30-day trial (Anders, 2026-10-07) ----
/** The account page with its Premium offer: where a free account's Add and file entries lead. */
export const PREMIUM_PAGE=`/sign-in?mode=account&returnTo=${encodeURIComponent('/library')}`;
const premiumForEntry=()=>pasteEnabled()?`/sign-in?mode=account&returnTo=${encodeURIComponent(pasteShelf())}`:PREMIUM_PAGE;
let access=null;
/** Whether this account may add books: true, false, or null when it cannot be told (asked once per account). */
export function canAdd(load=addEngine){
 if(!access){
  const pending=load().then(api=>api.canAdd?api.canAdd():null).catch(()=>null);
  access=pending;
  // A cold/expired session or a recently upgraded account must get a fresh
  // entitlement check on its next click, not a page-long cached denial.
  pending.then(value=>{if(value!==true&&access===pending)access=null;});
 }
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
const OWN_BOOK_COPY={title:'Your own book',lede:'Open a PDF, EPUB or text file from this device: a textbook, lecture notes, a DRM-free ebook. It stays private to your account.',fine:'Kept privately in your account, never shared. When you ask Tinct’s reading companion about it, its text is sent to answer. DRM-protected files can’t be opened.',choose:'Choose a file',close:'Close',cancel:'Cancel',keep:'Continue',opening:'Opening…',unkept:'This browser could not keep a copy, so you will need to open the file again next time.',failed:'This file could not be opened. Choose another file.'};
// Both the extensions and the types: iOS Files greys an EPUB out when only a type it does not map is
// named. No spaces: Android's WebView hands each piece to the picker untrimmed. On Android some file
// managers and cloud apps report an EPUB as application/octet-stream, which the picker would grey out,
// so it is named there too; the engine then decides by the file's own bytes (add-engine.js readFile).
export const FILE_ACCEPT='application/pdf,.pdf,application/epub+zip,.epub,text/plain,.txt';
export const FILE_ACCEPT_ANDROID=FILE_ACCEPT+',application/octet-stream';
export const fileAccept=(ua=globalThis.navigator?.userAgent||'')=>/\bAndroid\b/i.test(ua)?FILE_ACCEPT_ANDROID:FILE_ACCEPT;
const FILE_ENGINE=['/lab/addbook/js/tinct-api.js?v=20261023paste1','/lab/addbook/js/epub.js','/lab/addbook/js/add-engine.js?v=20261029titles1'];
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
 * The "Your own book" pop-up: one button for the file and a × to close (Anders, 15 Oct 2026);
 * `onSearch` is still accepted from the + buttons but no longer shown. A chosen file
 * is added in the pop-up, with its progress there; `go` then opens the book.
 */
export function openFileDialog({from=null,onSearch=null,checking=false,authorize=async()=>true,assessPdf=bytes=>addEngine().then(api=>api.assessPdf?.(bytes)),engine=loadFileEngine,go=href=>location.assign(href),keep=putHandoff,fallback=ADD_FILE_HANDOFF_PAGE}={}){
 closeFileDialog();
 // Tinct UI's dialog (/lab/tinct-ui.css, docs/design-system.md) in the library's dark room.
 const layer=make('div','tui-scrim own-file-layer');layer.dataset.testid='own-file-dialog';layer.dataset.tuiTheme='dark';
 const box=make('div','tui-dialog own-file-dialog');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','own-file-title');
 const title=make('h2','tui-dialog__title',OWN_BOOK_COPY.title);title.id='own-file-title';
 const head=make('div','tui-dialog__head');head.append(title);
 // Closed with the × (Tinct UI's .tui-close), not a Cancel button (Anders, 15 Oct 2026).
 const close=button('tui-close own-file-close','');close.setAttribute('aria-label',OWN_BOOK_COPY.close);
 close.innerHTML='<svg viewBox="0 0 14 14" aria-hidden="true"><path d="m3 3 8 8M11 3l-8 8"/></svg>';
 close.onclick=()=>{if(!box.dataset.busy)closeFileDialog();};head.append(close);
 const input=make('input');input.type='file';input.accept=fileAccept();input.hidden=true;input.className='own-file-input';
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
 let pastePending=null,pasteDraft=null;
 const chooseStep=(message='')=>{
  delete box.dataset.busy;
  title.textContent=OWN_BOOK_COPY.title;
  const choose=button('tui-btn tui-btn--primary own-file-choose',OWN_BOOK_COPY.choose);
  // The picker opens on this tap (browsers allow a file picker only from a user's own click).
  choose.onclick=()=>input.click();
  // Only the file button; the × in the head closes (Anders, 15 Oct 2026).
  const row=actions(choose);
  const parts=[make('p','tui-dialog__body own-file-lede',OWN_BOOK_COPY.lede),make('p','tui-dialog__fine own-file-fine',OWN_BOOK_COPY.fine)];
  if(message){const alert=make('p','tui-dialog__body own-file-message',message);alert.setAttribute('role','alert');parts.unshift(alert);}
  if(pasteEnabled()){
   const paste=button('tui-btn tui-btn--secondary own-file-paste','Paste text');
   paste.onclick=()=>{pasteDraft=null;pasteStep();};row.append(paste);
  }
  step('choose',...parts,row);
  choose.focus({preventScroll:true});
 };
 const progress=value=>{
  box.dataset.busy='1';
  if(box.dataset.step!=='progress'){
   // The reader's ring in the pop-up's own line (wait-ring.js); "Opening…" stays for screen readers only.
   const status=make('p','tui-dialog__body own-file-status');status.append(globalThis.TinctWait.waitRing(OWN_BOOK_COPY.opening,{size:18}));
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
 // Keep this draft only in the dialog. Pasting rich clipboard HTML is opt-in to this private
 // switch; preview is rebuilt from the editable source, never rendered from raw clipboard HTML.
 function pasteStep(message=''){
  delete box.dataset.busy;
  title.textContent='Paste text';
  const source=make('textarea','own-paste-source');source.rows=9;source.placeholder='Paste your text here';source.setAttribute('aria-label','Text to add');
  const titleField=make('input','own-paste-title');titleField.type='text';titleField.placeholder='Pasted text';titleField.maxLength=200;titleField.setAttribute('aria-label','Title');
  const author=make('input','own-paste-author');author.type='text';author.placeholder='Author (optional)';author.maxLength=200;author.setAttribute('aria-label','Author (optional)');
  const start=make('input','own-paste-trim-start');start.type='number';start.min='0';start.value='0';start.setAttribute('aria-label','Lines to trim from beginning');
  const end=make('input','own-paste-trim-end');end.type='number';end.min='0';end.value='0';end.setAttribute('aria-label','Lines to trim from end');
  const alert=make('p','own-paste-error',message);alert.setAttribute('role','alert');
  const sample=make('div','own-paste-preview');sample.setAttribute('aria-label','Preview of text to add');
  const richNotice=make('p','tui-dialog__fine own-paste-rich-note','Rich formatting was found. Review the preview before adding; the text box shows the words.');richNotice.hidden=true;
  let richHtml=null,titleEdited=false;
  const parsed=()=>richHtml!==null?{source:richHtml,format:'html'}:{source:source.value,format:'auto'};
  const render=()=>{try{const data=parsed();const html=pastePreview(data.source,data.format,Number(start.value),Number(end.value));const fragment=document.createElement('template');fragment.innerHTML=html;sample.replaceChildren(fragment.content);alert.textContent='';}catch(error){sample.replaceChildren();alert.textContent=source.value?error.message:'';}};
  source.addEventListener('paste',event=>{const html=event.clipboardData?.getData('text/html'),plain=event.clipboardData?.getData('text/plain');if(html&&!source.value&&plain){event.preventDefault();source.value=plain;richHtml=html;richNotice.hidden=false;details.open=true;if(!titleEdited)titleField.value=suggestedTitle(html,'html');render();}});
  source.addEventListener('input',()=>{if(richHtml!==null){richHtml=null;richNotice.hidden=true;}if(!titleEdited)titleField.value=suggestedTitle(source.value);render();});
  titleField.addEventListener('input',()=>{titleEdited=true;});
  for(const field of [start,end])field.addEventListener('input',render);
  const save=button('tui-btn tui-btn--primary own-paste-save','Add to my books');
  save.onclick=async()=>{
   if(save.disabled)return;
   save.disabled=true;
   if(!await authorize()||!layer.isConnected){save.disabled=false;return;}
   // Readable size only: larger pastes take too long to lay out (29 Oct 2026: 250k characters opens in about 3.5 s on desktop, 8 s on phone).
   if(source.value.length>PASTE_MAX_CHARS){alert.textContent=`This text is too long to paste: ${(source.value.match(/\S+/g)||[]).length.toLocaleString('en-US')} words, ${source.value.length.toLocaleString('en-US')} characters. The limit is ${PASTE_MAX_CHARS.toLocaleString('en-US')} characters (about 40,000 words). Trim it, or save it as an EPUB or PDF and add the file.`;save.disabled=false;return;}
   let file;const details={...parsed(),title:titleField.value||'Pasted text',author:author.value,start:Number(start.value),end:Number(end.value)};
   const signature=JSON.stringify(details);
   try{
    if(pastePending?.signature!==signature)pastePending={signature,file:pasteEpub(details),account:null};
    file=pastePending.file;
    if(file.size>50*1024*1024)throw new Error('This text exceeds the private book size limit. Trim it before adding.');
   }
   catch(error){alert.textContent=error.message;save.disabled=false;return;}
   const draft={source:source.value,richHtml,title:titleField.value,author:author.value,start:start.value,end:end.value};
   progress(.08);
   try{
    const engineApi=await api();
    if(!engineApi.rightsConfirmed()&&!await confirmRights(engineApi,draft.title))return;
    progress(.3);
    const read=await engineApi.readFile(file);if(read.error)throw new Error(read.error);
    // Parse with the actual EPUB engine before creating an account object. Otherwise
    // a malformed generated package would be saved while the dialog said it failed.
    await engineApi.prepareEpub(read.bytes,file.name,read.key,null);
    // Account persistence is required for Paste. Unlike the existing file flow, an
    // offline/failed upload stays in the editable dialog and cannot look "saved".
    const account=pastePending.account||await window.TinctAI.books.upload(file,{kind:'epub',name:file.name,title:details.title.trim(),author:draft.author.trim(),rights:engineApi.store.get('rights:'+engineApi.accountId())});
    if(!account?.id||account.sha256?.slice(0,24)!==read.key.slice(5))throw new Error('The account could not confirm this book. Try again.');
    pastePending.account=account;
    engineApi.cloud.mine().set(read.key,account);
    progress(.7);
    if(await engineApi.keepFile(file,read,details.title.trim()))await engineApi.library.touch(read.key,{cloudId:account.id});
    // Validation and metadata use the same EPUB path as a selected private file.
    await engineApi.prepareEpub(read.bytes,file.name,read.key,null);
    progress(1);go('/reader?userBook='+encodeURIComponent(read.key.slice(5))+'&sharedReader=1');
   }catch(error){pasteDraft=draft;pasteStep(error?.message||'This text could not be added. Try again.');}
  };
  const field=(label,control)=>{const wrap=make('label','own-paste-field');wrap.append(make('span','',label),control);return wrap;};
  const details=make('details','own-paste-details');const summary=make('summary','','Review details');details.append(summary,field('Title',titleField),field('Author',author),make('p','tui-dialog__fine','Optional: remove lines from the beginning or end before adding.'),field('Trim beginning (lines)',start),field('Trim end (lines)',end));
  step('paste',alert,field('Text',source),richNotice,details,make('p','tui-dialog__fine','Preview'),sample,actions(save));
  if(pasteDraft){source.value=pasteDraft.source;richHtml=pasteDraft.richHtml;richNotice.hidden=!richHtml;details.open=!!richHtml;titleField.value=pasteDraft.title;author.value=pasteDraft.author;start.value=pasteDraft.start;end.value=pasteDraft.end;titleEdited=!!pasteDraft.title;render();alert.textContent=message;}
  source.focus({preventScroll:true});
 }
 async function addFile(file){
  if(!await authorize()||!layer.isConnected)return;
  if (/\.txt$/i.test(file.name) || file.type === 'text/plain') {
   if (file.size > 50 * 1024 * 1024) { chooseStep('This text file exceeds the 50 MB limit.'); return; }
   try {
    const text = await file.text();
    if (!text.trim()) throw new Error('This text file is empty.');
    pasteDraft = { source: text, richHtml: null, title: file.name.replace(/\.txt$/i, ''), author: '', start: '0', end: '0' };
    pasteStep();
   } catch (error) { chooseStep(error?.message || 'This text file could not be read.'); }
   return;
  }
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
   if(read.kind==='pdf'){
    delete box.dataset.busy;
    const original=button('tui-btn tui-btn--secondary','Open original PDF');
    let left=false;original.onclick=()=>{left=true;go(opened.href);};
    const message=make('p','tui-dialog__body','Checking a few pages for reading comfort…');
    const choices=actions(original);step('pdf-ready',message,choices);
    let assessment;try{assessment=await assessPdf(read.bytes);}catch{assessment=null;}
    if(left||!layer.isConnected)return;
    if(assessment?.recommend){
     message.textContent=assessment.reason==='scan'?'This PDF uses scanned pages. A Tinct text version may be easier to read. Your original PDF will stay available.':'This PDF has small or dense text. A Tinct text version lets the words fit your screen. Your original PDF will stay available.';
     const convert=button('tui-btn tui-btn--primary','Convert to Tinct');
     convert.onclick=()=>{if(left)return;left=true;go('/reader?userBook='+encodeURIComponent(read.key.slice(4))+'&sharedReader=1&convert=1');};
     choices.prepend(convert);return;
    }
   }
   go(opened.href);
  }catch(error){chooseStep(error?.message||OWN_BOOK_COPY.failed);}
 }
 input.onchange=()=>{const file=input.files?.[0];input.value='';if(file)void addFile(file);};
 if(checking) step('checking',make('p','tui-dialog__body','Checking your account…'));
 else chooseStep();
 layer.showReady=chooseStep;
 layer.addFile=addFile;
 return layer;
}
/**
 * A file entry (the search field's +, "Add a PDF or EPUB", the top bar's and My shelf's +):
 * for Premium and trial, the "Your own book" pop-up (signed in) or sign-in first (an internal
 * device signed out), the Premium offer for a free account, exactly as before.
 */
export async function openFileEntry(from,{access=canAdd,go=href=>location.assign(href),...options}={}){
 const permission=Promise.resolve().then(()=>access());
 // Choosing a local file can overlap the entitlement request. Reading/importing
 // it still waits for that request, and the authenticated API remains authoritative.
 const pending=signedIn()?openFileDialog({from,go,...options,authorize:async()=>await permission!==false&&signedIn()}):null;
 const allowed=await permission;
 // Closing the dialog while the account check runs cancels this opening.
 if(pending&&!pending.isConnected)return null;
 if(allowed===false){if(pending)closeFileDialog();go(premiumForEntry());return null;}
 if(!signedIn()){if(pending)closeFileDialog();go(signInForEntry());return null;}
 if(pending)return pending;
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

// ---- Modern English, asked right after a catalogue book is added (Anders, 2026-10-08) ----
// One shared edition per book: the first buyer pays, everyone after reads it. Asked only
// when the book has none yet and the Worker offers one. The price is the Worker's tier for
// the published book's word count (worker/lib/modernEdition.ts modernTierFor, from the
// chapters the commit verified; the catalogue has no lengths), so it is known as soon as the
// add's commit (or, for a book already in Tinct, its first step) has answered: the status is
// asked then, and the question shows the moment it answers, while the add finishes alongside
// (Anders, 2026-10-09: right after Add, never holding the add up). Buying is the reader's own
// checkout (the add engine's buyModern: labModernEditionApi startModernCheckout).
/** How long the status may take, once the add is done, before the question is skipped. */
export const MODERN_ASK_TIMEOUT_MS=1500;
const MODERN_COPY={title:'Also get it in Modern English?',body:'A Modern English edition is written for you chapter by chapter.',buy:'Get Modern English',later:'Not now'};
/** Cents as the reader shows them (labModernEditionApi formatModernPrice). */
export const modernPrice=cents=>`$${(cents/100).toFixed(2)}`;
/** The question to ask for a status (the Worker's /modern-en), or null: only a book with no edition yet and an offer. */
export function modernAsk(status){
 const cents=status?.offer?.cents;
 if(status?.state!=='none'||typeof cents!=='number'||!Number.isFinite(cents)||cents<=0)return null;
 return {cents,price:modernPrice(cents)};
}
/** Whether this reader may be asked: signed in, Add to Tinct on, and Modern English on for the device. */
export const modernAskAllowed=()=>signedIn()&&enabled()&&modernEditionsEnabled();
/**
 * After an add: the question to ask for `bookId`, or null (not allowed, no offer, already
 * bought or being bought, the status failed, or it took longer than `timeoutMs`; with `late`,
 * a promise, until that settles instead).
 */
export async function modernOfferAfterAdd(bookId,{allowed=modernAskAllowed,status=id=>addEngine().then(api=>api.modernStatus?api.modernStatus(id):null),timeoutMs=MODERN_ASK_TIMEOUT_MS,late=null}={}){
 if(!allowed())return null;
 let timer;
 const deadline=late?Promise.resolve(late).then(()=>null,()=>null):new Promise(resolve=>{timer=setTimeout(()=>resolve(null),timeoutMs);});
 try{return modernAsk(await Promise.race([Promise.resolve().then(()=>status(bookId)).catch(()=>null),deadline]));}
 catch{return null;}
 finally{clearTimeout(timer);}
}
/**
 * The end of an add, with the question alongside: the status is asked at once and the question
 * shows as soon as it answers, while `finish` (the library's own last steps: the shelf, the
 * reader's hand-off; resolves where the reader opens) runs on. Neither waits for the other:
 * the add finishes whatever the reader does with the question. Resolves {href, answer} once
 * `finish` is done and the question, if asked, is answered ('buy' or 'later'; null when it was
 * not asked), so the reader never opens under an open question. A status still unanswered
 * `timeoutMs` after `finish` is done is not asked. `live()` false (search closed): not asked.
 * When `finish` fails, an open question closes and the failure is passed on.
 */
export async function finishAdd(bookId,{finish,allowed=modernAskAllowed,status,ask=askModernEdition,live=()=>true,timeoutMs=MODERN_ASK_TIMEOUT_MS}={}){
 const finished=Promise.resolve().then(finish);
 const late=finished.then(()=>new Promise(resolve=>setTimeout(resolve,timeoutMs)),()=>null);
 const asked=modernOfferAfterAdd(bookId,{allowed,...(status?{status}:{}),late}).then(offer=>offer&&live()?ask(offer):null).catch(()=>null);
 let href;
 try{href=await finished;}catch(error){closeModernAsk();throw error;}
 return {href,answer:await asked};
}
let closeAsk=null;
/** Close the question if it is open (it answers null: not asked to the end). */
export function closeModernAsk(){closeAsk?.(null);}
/**
 * The question, over the library: Tinct UI's dialog (/lab/tinct-ui.css .tui-scrim/.tui-dialog/
 * .tui-btn), as the "Your own book" pop-up, with modern-ask-* hooks. Resolves 'buy' or 'later'
 * (Not now, Escape, a tap outside); null when closed by closeModernAsk. Not now has the focus.
 */
export function askModernEdition(offer){
 closeModernAsk();document.querySelector('.modern-ask-layer')?.remove();
 const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const layer=make('div','tui-scrim modern-ask-layer');layer.dataset.testid='modern-ask';layer.dataset.tuiTheme='dark';
 const box=make('div','tui-dialog modern-ask-dialog');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','modern-ask-title');
 const title=make('h2','tui-dialog__title modern-ask-title',MODERN_COPY.title);title.id='modern-ask-title';
 const head=make('div','tui-dialog__head');head.append(title);
 const later=make('button','tui-btn tui-btn--secondary modern-ask-later',MODERN_COPY.later);later.type='button';
 const buy=make('button','tui-btn tui-btn--primary modern-ask-buy',`${MODERN_COPY.buy} · ${offer.price}`);buy.type='button';
 const actions=make('div','tui-dialog__actions modern-ask-actions');actions.append(later,buy);
 box.append(head,make('p','tui-dialog__body modern-ask-body',MODERN_COPY.body),actions);
 layer.append(box);document.body.append(layer);
 return new Promise(resolve=>{
  const done=answer=>{if(closeAsk===done)closeAsk=null;removeEventListener('keydown',onKey,true);layer.remove();resolve(answer);};
  closeAsk=done;
  const onKey=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();done('later');}};
  addEventListener('keydown',onKey,true);
  layer.addEventListener('click',event=>{if(event.target===layer)done('later');});
  later.onclick=()=>done('later');
  buy.onclick=()=>done('buy');
  // Not now takes the focus, so Enter never starts a checkout.
  later.focus({preventScroll:true});
 });
}

// ---- Paper covers ----
/** A typographic paper cover (480×720): /lab/book-cover.js, shared with the reader's book switcher. */
export {paperCover};

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
/** "Gutenberg", "Wikisource": the pill's short name of the library Add downloads a work from (public-books.js importSource). */
export const sourceShort=work=>importSource(work);
const unique=list=>[...new Set(list.filter(Boolean))];
/** A year as the catalogue gives it: negative years are BC. */
export const yearText=year=>Number.isFinite(year)?(year<0?`${-year} BC`:String(year)):'';
/**
 * "428–348 BC", "4 BC – AD 65", "1775–1817": only when both years are known. Dates more than a
 * lifetime apart are an era, not a life (Homer, "750–650 BC"): the first, as the library writes an
 * approximate date ("c. 750 BC", book-metadata.js eraLabel).
 */
export function lifespan(person){
 const born=person?.birthYear,died=person?.deathYear;
 if(!Number.isFinite(born)||!Number.isFinite(died))return '';
 if(died-born>=100)return eraLabel(String(born));
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
 return Number.isFinite(year)&&Number.isFinite(died)&&year<=died?eraLabel(String(year)):'';
}
/** What a "Not yet in Tinct" row shows. */
export function freeRowFacts(work,query=''){
 const row=freeRow(work),translators=unique((work.translators||[]).map(person=>personName(person.name)));
 const names=(work.authors||[]).flatMap(person=>[person.name,...(person.aliases||[])]).join(' ');
 return {title:row.title,author:row.author,translator:translators.join(', '),editions:editionCount((work.alternates||[]).length),includes:work.includes||'',aka:query?knownAs(row.title,names,work.altTitles,query):'',
  pills:[sourceShort(work)].filter(Boolean),description:'',
  facts:[['Written',writtenYear(work)],['Translation',translators.join(', ')],['Source',row.source],['Note',work.subtitle||'']].filter(([,value])=>value)};
}
/** What a Tinct book's row shows (`length`: the library's reading time for it). */
export function tinctRowFacts(book,{length='',query='',otherTitles=[]}={}){
 // Translators as readers write them ("Sir Roger L'Estrange", search.js cleanName); an added book keeps the library's form.
 const facts=bookFacts(book),translators=unique(readableEditions(book).map(edition=>edition.translator&&cleanName(edition.translator)));
 return {title:book.title||'',author:book.author||'',translator:translators.join(', '),editions:'',includes:query?includedWork(book.title,book.author,query):'',aka:query?knownAs(book.title,book.author,[...(book.altTitles||[]),...otherTitles],query):'',
  pills:[facts.modern?'Modern English':'',facts.audio?'Audio':''].filter(Boolean),description:book.summary||'',
  facts:[['Written',eraLabel(book.displayYear)],['Translation',translators.join(', ')],['Length',length],['Source',book.public?.sourceName||'']].filter(([,value])=>value)};
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
  // Different life dates are different people (Adam Smith, 1723–1790, is not George Adam Smith).
  let found=people.find(p=>p.surname===surname&&(!years(person)||!p.years||years(person)===p.years)&&(subset(list,p.words)||subset(p.words,list)||(years(person)&&years(person)===p.years)));
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
/**
 * The person the catalogue's engine says the query names (`free.author`, its results by them
 * flagged `byAuthor`: search.js identify, by full name and life dates, near spellings included),
 * gathered with the library's books by them; null when the engine names no one.
 */
function engineAuthor(free,tinct){
 const author=free?.author;
 if(!author?.name)return null;
 const names=unique([author.name,...(author.names||[])]);
 const called=names.map(name=>({surname:surnameOf(name),words:words(name)}));
 const by=name=>{const list=words(name),surname=surnameOf(name);return !!surname&&called.some(c=>(c.surname===surname||c.words.includes(surname))&&(list.every(w=>c.words.includes(w))||c.words.every(w=>list.includes(w))));};
 const items=new Set([...tinct.filter(book=>by(book.author)),...free.filter(work=>work.byAuthor)]);
 return {surname:surnameOf(author.name),words:words(author.name),names,records:[{name:author.name,birthYear:author.birthYear,deathYear:author.deathYear}],items,by};
}
export function findAuthor({query,tinct=[],free=[],notYet=[],tinctBooks=[]}){
 const terms=words(query).filter(term=>!['a','an','the','of','and'].includes(term));
 if(!terms.length||terms.join('').length<3)return null;
 const first=tinct[0]||free[0];
 let best=engineAuthor(free,tinct);
 if(best){if(best.items.size<2||!best.items.has(first))return null;}
 else{
  const entries=[...tinct.map(book=>({person:{name:book.author||''},item:book})),...free.flatMap(work=>(work.authors||[]).map(person=>({person,item:work})))];
  const people=gatherPeople(entries).filter(p=>namesPerson(terms,p.names));
  if(!people.length)return null;
  people.sort((a,b)=>b.items.size-a.items.size);
  best=people[0];
  if(best.items.size<2||!best.items.has(first)||(people[1]&&people[1].items.size*2>best.items.size))return null;
 }
 const own=best.by?book=>best.by(book.author):book=>{const list=words(book.author);return surnameOf(book.author)===best.surname&&(list.every(w=>best.words.includes(w))||best.words.every(w=>list.includes(w)));};
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
 for(const work of notYet)if(best.items.has(work)||(best.by?(work.alternates||[]).some(other=>best.items.has(other)):(work.authors||[]).some(person=>namesPerson(terms,[person.name,...(person.aliases||[])]))))push('work:'+work.id,work.title,work);
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
/** "German", "German and French", "German, French and Latin". */
const languageList=codes=>{const list=codes.map(languageName);return list.length<2?list.join(''):`${list.slice(0,-1).join(', ')} and ${list[list.length-1]}`;};
/**
 * Why an empty search is empty (owner-approved, 2026-10-08): the author the query names is in the
 * catalogue only in other languages (`elsewhere` from the worker: Kafka, whose English translators
 * died too recently for life+70), or, with nothing at all, books still under copyright are not in
 * Tinct ("harry potter"). Nothing for a chosen language other than English (that search was asked).
 */
export function emptyReason(elsewhere,otherLanguage=false){
 if(otherLanguage)return '';
 const codes=(elsewhere?.languages||[]).filter(code=>code!=='en');
 if(elsewhere?.name&&codes.length)return `Tinct has ${elsewhere.name} only in ${languageList(codes)}. The English translations aren’t public domain yet.`;
 return 'Tinct only has books in the public domain, so books still under copyright aren’t here.';
}
/** "3 books in Tinct" / "1 book in Tinct". */
export const booksInTinct=n=>n>0?`${n} ${n===1?'book':'books'} in Tinct`:'';
/** Open a row and bring it into view (an author card's chip). */
export function revealRow(box,key){
 const rows=[...box.querySelectorAll('.result-row')],row=rows.find(item=>item.dataset.rowKey===key);
 if(!row)return null;
 // One row open at a time: a chip closes the row the previous chip opened.
 for(const other of rows)if(other!==row&&other.classList.contains('is-open'))setRowExpanded(other,false);
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
  // Nothing at all; after a catalogue search, why (owner-approved wording, 2026-10-08): the author's
  // books are only in other languages, or what is not here is still under copyright.
  const nothing=(why='')=>{empty.replaceWith(head('Available in Tinct'),el('p','search-none','Try another title or author.'),...(why?[el('p','search-none search-why',why)]:[]));};
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
   if(!notYet.length){if(!shown.length)nothing(emptyReason(free.elsewhere,!!f.language&&f.language!=='en'));finish(filterNotYet(free,f),[]);return;}
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
/** Each busy Add's wait (wait-ring.js waitOn), restored when its import ends. */
const addWaits=new WeakMap();
/**
 * One Add while its import runs (`stage` one of ADD_STEPS), or back to "Add" (`stage` null).
 * Busy: the reader's ring in the button's own size after a moment (the existing "Adding…" for
 * screen readers only), aria-busy, disabled, the row dimmed, and a hairline across the row's
 * foot for the step it is on.
 */
export function setAddBusy(button,stage){
 if(!button)return;
 const row=button.closest('.free-row');
 if(stage===null||stage===undefined){
  button.disabled=false;button.classList.remove('is-busy');addWaits.get(button)?.();addWaits.delete(button);button.removeAttribute('aria-busy');
  if(row){row.classList.remove('is-adding');row.removeAttribute('aria-busy');row.querySelector(':scope > .free-progress')?.remove();}
  return;
 }
 if(!button.classList.contains('is-busy')){
  addWaits.set(button,globalThis.TinctWait.waitOn(button,'Adding…',{size:15}));button.classList.add('is-busy');
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
 const own=ownCoverImage(book.cover);
 if(own){const img=document.createElement('img');img.className='cover own-cover-image';img.src=own;img.alt='';img.decoding='async';return img;}
 const cover=paperCover(book.title,book.author,book.kind);cover.className='cover';return cover;
}
/** How far through a book, as the reading table writes it (reading-table.js): "13%", "<1%". */
export const ownPercentLabel=p=>typeof p!=='number'||!Number.isFinite(p)?'':p>0&&p<1?'<1%':`${Math.round(p)}%`;
/**
 * My shelf's own-book card: the book's cover (or a paper cover) that opens the book, and the
 * same × as the shelf's other books (`onRemove`, labelled "Remove from My shelf: <title>").
 * `cover` replaces the listed cover (the reading table's full-size one, when it has it).
 * `progress`: under Currently reading, how far through it the reader is (read on this device
 * or another of the account), under the cover where Tinct's books show theirs.
 * `onDelete`: the cover's ••• menu with Delete (shelfMenu), called with the book and the ••• button.
 * `actions`: the menu's other items, above Delete (`{label,onChoose(book,more)}`: Currently
 * reading's Read later and Remove from Currently reading).
 */
export function ownBookCard(book,el,{onRemove=null,onDelete=null,onEdit=null,actions=[],cover=null,progress=false}={}){
 const card=el('article','collection-card own-book');card.dataset.shelfGroup='own';card.dataset.ownKey=book.key;
 const open=el('a','book-card cover-button own-cover');open.href=book.href;open.setAttribute('aria-label',`Open ${book.title}${book.author?', by '+book.author:''}`);
 open.append(ownCoverElement(cover?{...book,cover}:book));
 let face=open;
 if(onDelete){
  face=el('div','card-wrap');
  const items=[...actions.map(a=>({label:a.label,onChoose:from=>a.onChoose(book,from)})),...(onEdit&&pasteEnabled()?[{label:'Edit title and author',onChoose:from=>onEdit(book,from)}]:[]),{label:shelfAction(true).item,danger:true,onChoose:from=>onDelete(book,from)}];
  face.append(open,shelfMenu(book.title,{own:true,items}));
 }else if(onRemove){
  face=el('div','card-wrap');
  const x=el('button','save-toggle','×');x.type='button';x.dataset.shelfRemove='true';x.dataset.title=book.title;x.setAttribute('aria-label','Remove from My shelf: '+book.title);
  x.onclick=event=>{event.preventDefault();event.stopPropagation();onRemove(book,x);};
  face.append(open,x);
 }
 card.append(face);
 const percent=progress?ownPercentLabel(book.percent):'';
 if(percent){const meta=el('span','cover-metadata own-progress');meta.append(el('span','metadata-details',percent));card.append(meta);}
 card.append(el('h2','',shortTitle(book.title)),el('p','',book.author||book.kind.toUpperCase()));
 // A scan whose text is being recognised (src/lab/userBook/ownOcrShelf.ts): "Recognising text…".
 if(book.ocrLine)card.append(el('p','own-ocr',book.ocrLine));
 return card;
}

/** Own books under Currently reading (those with a saved place, latest first) and the rest of "My private uploads". */
export function ownShelfGroups(list){
 const seen=new Set();const own=(list||[]).filter(book=>book&&!seen.has(book.key)&&seen.add(book.key));
 return {reading:own.filter(book=>book.readingAt!==null&&book.readingAt!==undefined).sort((a,b)=>b.readingAt-a.readingAt),own};
}
/** Approved name of My shelf's own-books group (owner, 2026-10-08; was "Your own books"). */
export const PRIVATE_UPLOADS='My private uploads';
/** The reading table's id for an own book (`userbook-<hex>`, src/lab/userBook/userBookId.ts). */
export const ownTableId=key=>'userbook-'+String(key||'').replace(/^(epub|pdf):/,'');
/**
 * My shelf's own books. Own books being read join Currently reading (after the library's own,
 * or under a new heading at the top), with the × that takes a book off Currently reading
 * (`onRemoveReading`); then "My private uploads" with every own book and the ••• menu that
 * deletes one (`onDelete`). `covers` maps a reading-table id to its full-size cover. Adding a book is
 * the + beside My shelf's heading. Returns how many cards were added. `currentlyReading: false`:
 * the library's My shelf, whose Currently reading is the reading table's list (own books in it).
 */
export function appendOwnShelf(grid,list,el,{onRemoveReading=null,onDelete=null,onEdit=null,covers=null,currentlyReading=true}={}){
 const {reading,own}=ownShelfGroups(list);let added=0;
 const coverFor=book=>covers?.get?.(ownTableId(book.key))||null;
 if(currentlyReading&&reading.length){
  let after=[...grid.querySelectorAll('[data-shelf-group="reading"]')].pop()||null;
  if(!after){after=el('h2','my-books-head','Currently reading');grid.prepend(after);}
  for(const book of reading){const card=ownBookCard(book,el,{onRemove:onRemoveReading,cover:coverFor(book),progress:true});card.dataset.shelfGroup='own-reading';after.after(card);after=card;added++;}
 }
 if(own.length){
  grid.append(el('h2','my-books-head',PRIVATE_UPLOADS));
  for(const book of own){grid.append(ownBookCard(book,el,{onDelete,onEdit,cover:coverFor(book)}));added++;}
 }
 return added;
}

// ---- My shelf's ••• menu (Anders, 2026-10-20; Read later and its place, 2026-10-21) ----
/**
 * What the last action on a shelf book says: an own book (PDF, EPUB) is deleted from
 * Tinct; a Tinct book leaves the reader's shelf, its place and notes kept.
 */
export function shelfAction(own){
 return own
  ?{item:'Delete',title:t=>`Delete ${t}?`,body:'Deletes the file, its notes and its place from Tinct on all your devices.',confirm:'Delete'}
  :{item:'Remove from shelf',title:t=>`Remove ${t}?`,body:'Removes it from your shelf. Your place and notes stay if you add it again.',confirm:'Remove'};
}
/** Currently reading's other actions: off the reading row, the place, highlights and notes kept. */
export const READ_LATER='Read later',OFF_READING='Remove from Currently reading';
/**
 * Where a ••• menu opens (all in viewport pixels): just below the button (`gap`), its right edge
 * on the button's; above the button when below would leave the viewport (and above fits better),
 * and starting at the button's left edge when right-aligned would leave it on the left. Kept
 * `margin` inside the viewport either way.
 */
export function shelfMenuPlace(button,menu,view,{gap=4,margin=8}={}){
 let left=button.right-menu.width,top=button.bottom+gap,above=false,flipped=false;
 if(left<margin){left=button.left;flipped=true;}
 if(top+menu.height>view.height-margin&&button.top-gap-menu.height>=margin){top=button.top-gap-menu.height;above=true;}
 left=Math.max(margin,Math.min(left,view.width-margin-menu.width));
 top=Math.max(margin,Math.min(top,view.height-margin-menu.height));
 return {left,top,above,flipped};
}
/** Place an open menu (absolute, inside the card) at shelfMenuPlace, from the button's and its container's boxes. */
function placeShelfMenu(menu,more){
 const box=menu.offsetParent?.getBoundingClientRect?.()||{left:0,top:0};
 const r=more.getBoundingClientRect(),m=menu.getBoundingClientRect();
 const view={width:document.documentElement.clientWidth||innerWidth,height:innerHeight};
 const at=shelfMenuPlace(r,{width:m.width,height:m.height},view);
 menu.style.left=(at.left-box.left)+'px';menu.style.top=(at.top-box.top)+'px';
 menu.dataset.place=(at.above?'above':'below')+(at.flipped?' start':' end');
}
let openMenu=null;const afterMenu=[];
function closeShelfMenu({focus=false}={}){
 if(!openMenu)return;const {menu,more,away,onResize}=openMenu;openMenu=null;
 menu.remove();more.setAttribute('aria-expanded','false');more.classList.remove('is-open');
 removeEventListener('pointerdown',away,true);removeEventListener('keydown',away,true);removeEventListener('resize',onResize);
 if(focus)more.focus({preventScroll:true});
 // After the chosen item has run (it is called right after this), not before it.
 if(afterMenu.length)queueMicrotask(()=>{for(const fn of afterMenu.splice(0))fn();});
}
/**
 * Whether a shelf cover's ••• menu is open inside `root`. A page that redraws `root` while one is
 * open would take the menu away under the reader's finger (My shelf redrew itself when the
 * catalogue or the account's table arrived late: 2026-10-22, check-library-public in WebKit), so
 * it waits: `afterShelfMenu(fn)` runs `fn` once the menu has closed and its choice has run.
 */
export function shelfMenuOpenIn(root){return !!openMenu&&!!root?.contains(openMenu.more);}
export function afterShelfMenu(fn){if(openMenu)afterMenu.push(fn);else fn();}
/** Close an open ••• menu: the view it belongs to is going away (another collection, Back). */
export function closeShelfMenus(){closeShelfMenu();}
/**
 * The quiet ••• on a shelf cover (on hover with a mouse, always shown on touch): a small menu
 * anchored to it (shelfMenuPlace). `items`: `{label,onChoose(more),danger?}` in order, the
 * destructive one last; without them, the book's one action (shelfAction) runs `onChoose(more)`.
 * Each runs once the menu has closed.
 */
export function shelfMenu(title,{own=false,onChoose,items=null}){
 const list=items||[{label:shelfAction(own).item,danger:own,onChoose}];
 const more=button('shelf-more');more.dataset.shelfMore=own?'own':'tinct';
 more.setAttribute('aria-label',`More for ${title}`);more.setAttribute('aria-haspopup','menu');more.setAttribute('aria-expanded','false');
 more.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>';
 more.onclick=event=>{
  event.preventDefault();event.stopPropagation();
  if(openMenu?.more===more){closeShelfMenu();return;}
  closeShelfMenu();
  const menu=make('div','shelf-menu');menu.setAttribute('role','menu');menu.dataset.testid='shelf-menu';
  const buttons=list.map(entry=>{
   const item=button('shelf-menu-item',entry.label);item.setAttribute('role','menuitem');if(entry.danger)item.classList.add('is-delete');
   item.onclick=e=>{e.preventDefault();e.stopPropagation();closeShelfMenu();entry.onChoose(more);};
   return item;
  });
  menu.append(...buttons);menu.addEventListener('click',e=>e.stopPropagation());
  const away=e=>{
   if(e.type==='keydown'){
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeShelfMenu({focus:true});}
    else if((e.key==='ArrowDown'||e.key==='ArrowUp')&&menu.contains(document.activeElement)){e.preventDefault();const i=buttons.indexOf(document.activeElement);buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus({preventScroll:true});}
    return;
   }
   if(!menu.contains(e.target)&&e.target!==more&&!more.contains(e.target))closeShelfMenu();
  };
  // A real change of the viewport's size closes the menu; a resize event that changes nothing
  // (the library sends one whenever the reading table arrives) only places it again.
  const size=()=>`${document.documentElement.clientWidth}x${innerHeight}`,openSize=size();
  const onResize=()=>{if(size()!==openSize)closeShelfMenu();else placeShelfMenu(menu,more);};
  more.after(menu);more.setAttribute('aria-expanded','true');more.classList.add('is-open');
  placeShelfMenu(menu,more);
  openMenu={menu,more,away,onResize};
  addEventListener('pointerdown',away,true);addEventListener('keydown',away,true);addEventListener('resize',onResize);
  buttons[0].focus({preventScroll:true});
 };
 return more;
}
/**
 * Confirm a shelf book's action in Tinct UI's dialog, never window.confirm: its title
 * names the book, its one line says what happens (shelfAction). `own`: an own book's
 * Delete (the default: My private uploads); false: a Tinct book's Remove from my books.
 * Resolves true on the action, false on Cancel, Escape or a click outside.
 */
export function confirmDeleteUpload(book,{from=null,own=true}={}){
 const action=shelfAction(own);
 return new Promise(resolve=>{
  const layer=make('div','tui-scrim own-delete-layer');layer.dataset.testid='own-delete-dialog';layer.dataset.tuiTheme='dark';
  const box=make('div','tui-dialog own-delete-dialog');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','own-delete-title');
  const title=make('h2','tui-dialog__title',action.title(book.title));title.id='own-delete-title';
  const head=make('div','tui-dialog__head');head.append(title);
  const keepIt=button('tui-btn tui-btn--secondary own-delete-cancel','Cancel');
  const remove=button('tui-btn tui-btn--primary own-delete-confirm',action.confirm);
  const row=make('div','tui-dialog__actions');row.append(keepIt,remove);
  box.append(head,make('p','tui-dialog__body',action.body),row);layer.append(box);document.body.append(layer);
  const done=value=>{removeEventListener('keydown',onKey,true);layer.remove();from?.focus?.({preventScroll:true});resolve(value);};
  const onKey=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();done(false);}};
  addEventListener('keydown',onKey,true);
  layer.addEventListener('click',event=>{if(event.target===layer)done(false);});
  keepIt.onclick=()=>done(false);remove.onclick=()=>done(true);
  keepIt.focus({preventScroll:true});
 });
}
/**
 * Delete an own book with Add a book's own delete (add-engine.js removeBook: this device's
 * copy in IndexedDB, its place, and the account's copy, whose DELETE takes the R2 file, its
 * cover, place, highlights and notes, margin answers, recap, narration and recognised text:
 * worker/routes/userBooks.ts remove). Then this device's other keys for the book go
 * (forgetOwnBookHere). Other books' places are never touched. Resolves true when it is
 * gone from both.
 */
// The file engine loads tinct-api.js lazily on a cold Library page. Read the
// same Supabase session it will expose, so installing the bridge is not mistaken
// for an account change. This is an identity check, never a separate auth source.
function deleteSession(){
 const bridged=globalThis.TinctAI?.session?.();
 if(bridged)return {userId:bridged.userId??null,token:bridged.token??null};
 try{
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!/^sb-.*-auth-token$/.test(key))continue;
   const value=JSON.parse(localStorage.getItem(key)||'null');
   const session=value&&(value.currentSession||value);
   if(!session?.access_token)continue;
   const expired=session.expires_at&&session.expires_at*1000<Date.now()+30000;
   return {userId:session.user?.id||null,token:expired?null:session.access_token};
  }
 }catch{}
 return {userId:null,token:null};
}
export async function deleteUpload(book,{engine=loadFileEngine,storages=null}={}){
 const initiating=deleteSession();
 const userId=initiating.userId,token=initiating.token;
 const sameSession=()=>{
  const current=deleteSession();
  return current.userId===userId&&current.token===token;
 };
 const api=await engine();
 if(!sameSession())return false;
 // An account copy not on this device is found by the account's list.
 const local=await api.library.get(book.key);
 if(!sameSession())return false;
 if(!local){await api.cloud.refresh();if(!sameSession())return false;}
 const gone=await api.removeBook(book.key);
 if(!sameSession())return false;
 // Engine already removed the verified local file. This second pass may run
 // after a stale shelf lookup, so it must not erase another owner's hash-only
 // state merely because their local file has identical bytes.
 forgetOwnBookHere(String(book.key||'').replace(/^(epub|pdf):/,''),storages||undefined,{preserveHashOnly:true});
 return gone;
}
/** Display details only: the owned file, its SHA and source anchors are untouched. */
export async function editOwnBookDetails(book,{from=null,engine=loadFileEngine,onSaved=()=>{}}={}){
 const hex=String(book.key||'').replace(/^(epub|pdf):/,'');
 if(!/^[0-9a-f]{24}$/.test(hex))return null;
 const layer=make('div','tui-scrim own-file-layer');layer.dataset.tuiTheme='dark';layer.dataset.testid='own-metadata-dialog';
 const box=make('div','tui-dialog own-file-dialog');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','own-metadata-title');
 const heading=make('h2','tui-dialog__title','Edit book details');heading.id='own-metadata-title';
 const status=make('p','tui-dialog__body own-file-message','Loading…');status.setAttribute('role','status');
 const title=make('input','own-paste-title');title.type='text';title.maxLength=200;title.setAttribute('aria-label','Title');
 const author=make('input','own-paste-author');author.type='text';author.maxLength=200;author.setAttribute('aria-label','Author (optional)');
 const field=(label,input)=>{const wrap=make('label','own-paste-field');wrap.append(make('span','',label),input);return wrap;};
 const cancel=button('tui-btn tui-btn--secondary','Cancel'),save=button('tui-btn tui-btn--primary','Save details');save.disabled=true;
 const actions=make('div','tui-dialog__actions own-file-actions');actions.append(cancel,save);
 box.append(heading,status,field('Title',title),field('Author',author),actions);layer.append(box);document.body.append(layer);
 let busy=false,closed=false,current=null;
 const close=()=>{if(busy||closed)return;closed=true;removeEventListener('keydown',onKey,true);layer.remove();from?.focus?.({preventScroll:true});};
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}};
 addEventListener('keydown',onKey,true);cancel.onclick=close;layer.onclick=e=>{if(e.target===layer)close();};
 let api;
 try{api=await engine();current=await window.TinctAI.books.metadata(hex);if(closed)return null;title.value=current.title;author.value=current.author;status.textContent='';save.disabled=false;title.focus({preventScroll:true});}
 catch{if(!closed)status.textContent='Could not load these details. Close and try again.';return layer;}
 save.onclick=async()=>{
  if(!title.value.trim()){status.textContent='Give this book a title.';title.focus();return;}
  busy=true;save.disabled=true;status.textContent='Saving…';
  try{
   const next=await window.TinctAI.books.editMetadata(hex,{title:title.value.trim(),author:author.value.trim(),rev:current.rev,fileId:current.fileId});
   // The account PATCH has already committed. A blocked local IndexedDB write
   // cannot turn that success into a retry with a stale revision.
   try{await api.library.touch(book.key,{title:next.title,author:next.author,metadataRev:next.rev});}catch{/* account metadata remains authoritative */}
   const remote=api.cloud.get(book.key);if(remote)Object.assign(remote,{title:next.title,author:next.author});
   busy=false;close();onSaved({...book,title:next.title,author:next.author});
  }catch(error){busy=false;save.disabled=false;status.textContent=error?.status===409?'This book changed on another device. Close and reopen to edit its latest details.':error?.status===404?'This book was removed from your account.':'Could not save these details. Try again.';}
 };
 return layer;
}
/** This page's fast-paint snapshots: rebuilt on the next load, so one that names a deleted book is dropped whole. */
const SNAPSHOT_KEYS=/^tinct:(library-2-table:|lab-library-boot$|library-2-first-paint$)/;
/**
 * Everything this device keeps for one own book besides its file (removeBook takes that and its
 * place): its highlights, margin answers, chats, PDF page and edition, view, hidden mark, the
 * library's small cover copy, and any snapshot naming it. Keys are matched by the book's own
 * 24-hex-digit id, so no other book's keys can match.
 */
export function forgetOwnBookHere(hex,storages=[globalThis.localStorage,globalThis.sessionStorage],{preserveHashOnly=false}={}){
 if(!/^[0-9a-f]{24}$/.test(String(hex)))return 0;
 const id='userbook-'+hex;let gone=0,owner=globalThis.TinctAI?.session()?.userId||null;
 for(const store of storages){
  if(!store)continue;
  try{
   const legacyClaim=`tinct-addbook:legacy-epub-owner:${hex}`;
   const legacyBackup=`tinct-addbook:legacy-epub-annotations:${owner}:${hex}`;
   const legacyMarks=`tinct-addbook:hl:epub:${hex}`,legacyCards=`tinct-addbook:cards:epub:${hex}`;
   const claimedByOwner=!!owner&&store.getItem(legacyClaim)===owner;
   // Old EPUB annotations use hash-only keys. Exact agreement with this
   // owner's backup is the proof needed to delete them. Preserve a mismatched
   // claim and backup, otherwise another account could adopt the raw records.
   let legacyRawProven=false;
   if(claimedByOwner)try{
    const marks=store.getItem(legacyMarks),cards=store.getItem(legacyCards);
    if(marks===null&&cards===null)legacyRawProven=true;
    else{const backup=JSON.parse(store.getItem(legacyBackup)||'null');legacyRawProven=!!backup&&Array.isArray(backup.marks)&&Array.isArray(backup.cards)
     &&(marks===null||JSON.stringify(JSON.parse(marks))===JSON.stringify(backup.marks))
     &&(cards===null||JSON.stringify(JSON.parse(cards))===JSON.stringify(backup.cards));}
   }catch{legacyRawProven=false;}
   if(legacyRawProven)for(const key of [legacyMarks,legacyCards])try{store.removeItem(key);}catch{/* keep claim if raw remains */}
   const preserveLegacyClaim=claimedByOwner&&(store.getItem(legacyMarks)!==null||store.getItem(legacyCards)!==null);
   const marksMarker=`tinct-addbook:text-marks-owner:${hex}`;
   if(owner&&store.getItem(marksMarker)===owner){
    const backup=store.getItem(`tinct-addbook:text-marks-local:${owner}:${hex}`);
    try{const all=JSON.parse(store.getItem('tinct-lab-highlights')||'[]');if(backup!==null&&Array.isArray(all)&&backup===JSON.stringify(all.filter(mark=>mark?.bookId===id)))store.setItem('tinct-lab-highlights',JSON.stringify(all.filter(mark=>mark?.bookId!==id)));}catch{/* preserve marks when ownership or storage is uncertain */}
   }
   const marksStillClaimed=owner&&store.getItem(marksMarker)===owner&&(()=>{
    const raw=store.getItem('tinct-lab-highlights');if(raw===null)return false;
    try{const rows=JSON.parse(raw);return !Array.isArray(rows)||rows.some(mark=>mark?.bookId===id);}catch{return true;}
   })();
   const keys=[];for(let i=0;i<store.length;i++){const key=store.key(i);if(key)keys.push(key);}
   const chatKey=`tinct:chat-history:${id}`;
   const chatMarker=`tinct-addbook:text-cards-owner:${hex}`;
   if(owner&&store.getItem(chatMarker)===owner&&store.getItem(chatKey)!==null)try{
    const raw=JSON.parse(store.getItem(chatKey));
    const canonical=keys.filter(key=>key===`tinct-addbook:text-cards-canonical:${owner}:${hex}`||key.startsWith(`tinct-addbook:text-cards-canonical:${owner}:${hex}:`));
    if(Array.isArray(raw)&&raw.length&&canonical.some(key=>{
     try{const copy=JSON.parse(store.getItem(key)||'null');const known=new Set(Array.isArray(copy?.conversations)?copy.conversations.map(row=>JSON.stringify(row)):[]);
      return raw.every(row=>known.has(JSON.stringify(row)));}catch{return false;}
    })){store.removeItem(chatKey);if(store.getItem(chatKey)===null)gone++;}
   }catch{/* malformed or ambiguous hash-only chat remains claimed */}
   const chatStillClaimed=owner&&store.getItem(chatMarker)===owner&&store.getItem(chatKey)!==null;
   for(const key of keys){
    if(key===chatKey||key===legacyMarks||key===legacyCards)continue;
    if(preserveLegacyClaim&&(key===legacyClaim||key===legacyBackup||key===`tinct-addbook:legacy-epub-migrated:${owner}:${hex}`))continue;
    if(marksStillClaimed&&(key===marksMarker||key===`tinct-addbook:text-marks-local:${owner}:${hex}`||key===`tinct-addbook:text-marks-previous:${owner}:${hex}`))continue;
    if(chatStillClaimed&&(key===chatMarker||key===`tinct-addbook:text-cards-adopted:${owner}:${hex}`||key===`tinct-addbook:text-cards-canonical:${owner}:${hex}`||key.startsWith(`tinct-addbook:text-cards-canonical:${owner}:${hex}:`)))continue;
    const scoped=/^tinct-addbook:text-(?:marks|cards)-(?:local|sync|adopted|previous|quarantine|canonical):([^:]+):([0-9a-f]{24})(?::[0-9a-f]{32})?$/.exec(key);
    if(scoped&&scoped[2]===hex&&(!owner||scoped[1]!==owner))continue;
    const pdfScoped=/^tinct-addbook:pdf-original-(?:marks|cards|talk):([^:]+):[0-9a-f]{32}:([0-9a-f]{24})$/.exec(key);
    if(pdfScoped&&pdfScoped[2]===hex&&(!owner||pdfScoped[1]!==owner))continue;
    const staticScoped=/^tinct-addbook:static-epub-(?:marks|cards):([^:]+):([0-9a-f]{24})$/.exec(key);
    if(staticScoped&&staticScoped[2]===hex&&(!owner||staticScoped[1]!==owner))continue;
    if(/^tinct-addbook:static-epub-guest-(?:marks|cards):[0-9a-f]{24}$/.test(key)&&owner)continue;
    if(key===`tinct-addbook:text-cards-unassigned:${hex}`||key===`tinct-addbook:text-marks-unassigned:${hex}`)continue;
    if(key===`tinct-addbook:text-cards-owner:${hex}`&&(!owner||store.getItem(key)!==owner))continue;
    const legacy=/^tinct-addbook:legacy-epub-(?:annotations|migrated|backup-quarantine):([^:]+):([0-9a-f]{24})$/.exec(key);
    if(legacy&&legacy[2]===hex&&(!owner||legacy[1]!==owner))continue;
    if(key===`tinct-addbook:legacy-epub-owner:${hex}`&&(!owner||store.getItem(key)!==owner))continue;
    if(key===`tinct-addbook:text-marks-owner:${hex}`&&(!owner||store.getItem(key)!==owner))continue;
    const tableOwner=/^tinct:library-2-table:([^:]+)$/.exec(key);
    if(tableOwner&&(!owner||tableOwner[1]!==owner))continue;
    if(preserveHashOnly&&!(owner&&((scoped&&scoped[1]===owner)||(pdfScoped&&pdfScoped[1]===owner)
     ||(legacy&&legacy[1]===owner)||(staticScoped&&staticScoped[1]===owner)
     ||([legacyClaim,marksMarker,chatMarker].includes(key)&&store.getItem(key)===owner))))continue;
    const mine=(key.startsWith('tinct-addbook:')||key.startsWith('tinct:'))&&key.includes(hex);
    const names=!mine&&SNAPSHOT_KEYS.test(key)&&String(store.getItem(key)||'').includes(id);
    if(mine||names){store.removeItem(key);gone++;}
   }
  }catch{/* blocked storage: nothing kept to forget */}
 }
 return gone;
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
