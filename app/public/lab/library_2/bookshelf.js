import { resolveReadingTable, onCachedTable, createReadingTable, DEMO, deskNow } from './reading-table.js?v=20261020open';
import { reviewedHooks } from './reviewed-introductions.js?v=20260930fix';
import { readingApi, loadCatalogueData } from './catalogue.js?v=20261014talkwake';
import { createBookshelf } from './bookshelf-view.js?v=20261020open';
import { readVisit, rememberVisit, visitMode } from './visit.js?v=20261001visit';
import { bookCoverSrc } from '../book-cover.js?v=20261009owncover';

export function mountBookshelf({hero,enabled,openBook,prepareCover,onSaved,notice}) {
 const params=new URLSearchParams(location.search),sample=params.get('demo')==='reading';
 const shelfStudy=params.get('view')==='shelf';
 const override=sample?'shelf':params.get('view')==='new'?'discovery':params.get('view')==='shelf'?'shelf':null;
 const html=document.documentElement;
 const root=document.createElement('section');root.className='bookshelf';root.hidden=true;root.setAttribute('aria-label','Your bookshelves');hero.before(root);
 const loading=document.createElement('div');loading.className='bookshelf-loading';loading.setAttribute('aria-label','Loading your library');loading.hidden=!window.__library2Boot?.hint;hero.before(loading);
 let view=null,table={mode:'new',reading:[],finished:[]},saved=[],catalogue=[],api=null,loadingNow=false,pendingUpdate=false,ready=Promise.resolve(),resumeReady=Promise.resolve();
 try{catalogue=JSON.parse(sessionStorage.getItem('tinct:library-2-catalogue')||'[]');}catch{}
 // A book link puts its book in focus on the desk. A book the reader is not
 // reading stands at the front for this visit only; nothing is saved, and
 // their own books keep their order.
 const linked=sample||shelfStudy?null:window.__library2Boot?.book||null;
 function deskBook(id){const entry=catalogue.find(b=>b.id===id&&b.discoveryAvailable!==false);if(!entry)return null;return {bookId:entry.id,title:entry.title,author:entry.author||'',cover:bookCoverSrc({bookId:entry.id,art:entry.art}),tone:entry.cover?.background||null,wordCount:entry.wordCount??null,displayYear:entry.displayYear||'',chapterLabel:'',headline:'',percent:null,recap:reviewedHooks[entry.id]||entry.blurb||entry.summary||'',linked:true};}
 function desk(){if(!linked||table.reading.some(b=>b.bookId===linked))return table;const book=deskBook(linked);return book?{...table,reading:[book,...table.reading]}:table;}
 function settle(){loading.hidden=true;html.classList.remove('returning-pending');if(!html.classList.contains('returning')||shelfStudy)html.classList.remove('returning-scene-pending');}
 function show(key){
  html.classList.add('returning');html.dataset.returningView=shelfStudy?'shelf':'table';root.hidden=!shelfStudy;
  if(!sample)rememberVisit({mode:'shelf'});
  if(!view)view=(shelfStudy?createBookshelf:createReadingTable)(shelfStudy?root:hero,{table:desk(),catalogue,saved,prepareCover,initial:sample?null:shelfStudy?readVisit()?.shelf:{bookId:linked||readVisit()?.tableBook},
   onSelection:state=>{if(!sample)rememberVisit(shelfStudy?{shelf:state}:{tableBook:state.bookId});},enabled:()=>enabled()&&html.classList.contains('returning'),
   summaryFor:sample?null:(id,options)=>api.summaryFor(id,options),onError:notice,
   onRemoveReading:async id=>{
    if(sample){table={...table,reading:table.reading.filter(b=>b.bookId!==id)};present();return;}
    // The book leaves the table at once, as an app does on iOS, while the removal is written;
    // the desk's own state follows only once it is kept (a last book leaves the desk then). Should
    // the write fail, the account's table is read again (the book returns) and the error is shown.
    const reading=table.reading.filter(b=>b.bookId!==id);
    if(reading.length&&view&&enabled())view.update({...table,reading,shelfReading:reading},saved,catalogue);
    try{
     await resumeReady;
     await api.hideFromReadingNow(id);
     const retained=await api.loadSavedBooks();saved=retained.ids;onSaved(saved);
    }catch(error){ready=load(true);throw error;}
    table={...table,reading,shelfReading:reading};
    present();
    ready=load(true);
   },
   onRemove:id=>{if(sample){saved=saved.filter(book=>book!==id);view.update(desk(),saved);}else window.dispatchEvent(new CustomEvent('library2:remove-saved',{detail:id}));},
   onOpen:async(id,shelf,img)=>{
    // The tap is answered at once: the page fades to the reader's paper (body.leaving, as every way into
    // the reader does) while the account's places finish arriving and the hand-off is written. It waited
    // unseen for those before (2026-10-21, scripts/check-library-speed.mjs), and a second tap opened it twice.
    if(shelf==='reading'&&!sample){document.body.classList.add('leaving');addEventListener('pageshow',e=>{if(e.persisted)document.body.classList.remove('leaving');},{once:true});try{await resumeReady;const href=await api.readerDestination(id,null);if(href!=='/reader'&&!href.startsWith('/reader?userBook=')&&!(deskNow()&&href.startsWith('/lab/addbook/?userBook=')))throw new Error('Reader unavailable');rememberVisit({mode:'shelf'});location.assign(href);}catch(error){document.body.classList.remove('leaving');throw error;}}
    else await openBook(id,img);
   }});
  else if(enabled())view.update(desk(),saved,catalogue);else pendingUpdate=true;
  if(key)view.focus(key);
  settle();
 }
// An empty cached table must not choose the visit before current reading resolves.
 function present(cached=false){
  const returning=table.mode==='returning'||saved.length>0;
  const mode=visitMode(returning,override,table.reading.length);
  const showReturning=mode==='shelf'&&(shelfStudy||table.reading.length);
  if(showReturning)show();else{html.classList.remove('returning');root.hidden=true;hero.querySelectorAll('.reading-table').forEach(t=>t.classList.contains('is-placeholder')?t.remove():t.setAttribute('hidden',''));settle();if(!cached&&readVisit()?.mode!=='discovery')rememberVisit({mode:'discovery',auto:true});}
  window.__library2Reading=table;
  dispatchEvent(new Event('resize'));
  dispatchEvent(new CustomEvent('library2:reading',{detail:{...table,mode:showReturning?'returning':'new'}}));
 }
 // Hold a cached desk that cannot show the linked book yet; the full load follows.
 // The device's snapshot paints only until the account's table has been shown: a later reload
 // (after a removal) passes it again, and that older row would drop books then rebuild the desk.
 let freshShown=false;
 if(!sample)onCachedTable((cached,engine)=>{api=engine;if(freshShown)return;table=cached;if(linked&&!desk().reading.some(b=>b.bookId===linked))return;present(true);});
 async function load(refresh=false){
  if(loadingNow)return;loadingNow=true;
  try{
   const savedReady=readingApi().then(engine=>{api=engine;return engine.loadSavedBooks({onCached:value=>{saved=value.ids;onSaved(saved);}});});savedReady.catch(()=>{});
   const catalogueReady=loadCatalogueData().then(data=>{catalogue=data.books;try{sessionStorage.setItem('tinct:library-2-catalogue',JSON.stringify(catalogue));}catch{}return catalogue;});catalogueReady.catch(()=>{});
   resumeReady=sample?readingApi().then(api=>({api,table:DEMO})):resolveReadingTable(refresh);
   const result=await resumeReady;
   api=result.api;await catalogueReady;
   if(sample){saved=['candide','jane-eyre'];table={...DEMO,reading:DEMO.reading.map(b=>({...b,author:catalogue.find(c=>c.id===b.bookId)?.author||'',displayYear:catalogue.find(c=>c.id===b.bookId)?.displayYear||'',wordCount:catalogue.find(c=>c.id===b.bookId)?.wordCount??b.wordCount}))};}
   else table=result.table;
   freshShown=true;
   // A cloud shelf sync is independent of painting the books already on device.
   present();
   const value=await savedReady;if(!sample){saved=value.ids;onSaved(saved);if(view){if(enabled())view.update(desk(),saved,catalogue);else pendingUpdate=true;}}
   if(!sample)try{if(table.mode==='returning'||saved.length)localStorage.setItem('tinct-library-2-reading-table','{"mode":"returning"}');else localStorage.removeItem('tinct-library-2-reading-table');}catch{}
  }catch(error){
   window.__library2LoadError=String(error&&(error.stack||error.message)||error);
   // Mid-deploy a module the page asks for can be missing for a moment; a
   // failed import is not retried in place, so reload once (twice at most in
   // two minutes) before showing the error.
   if(!view&&!sample&&window.__library2Boot?.hint&&staleReload()){setTimeout(()=>location.reload(),2500);return;}
   if(view){settle();notice('Showing your saved shelf. It will refresh when you reconnect.');}
   else if(window.__library2Boot?.hint){html.classList.remove('returning-pending');hero.querySelectorAll('.reading-table.is-placeholder').forEach(t=>t.remove());loading.hidden=false;loading.replaceChildren();const message=document.createElement('p');message.textContent='Your shelves could not load. Your reading place is safe.';const retry=document.createElement('button');retry.textContent='Try again';retry.onclick=()=>location.reload();const browse=document.createElement('button');browse.textContent='Browse books';browse.onclick=()=>{rememberVisit({mode:'discovery',auto:false});settle();html.classList.remove('returning');};loading.append(message,retry,browse);if(new URLSearchParams(location.search).has('debug')){const detail=document.createElement('pre');detail.style.cssText='white-space:pre-wrap;font:11px/1.4 monospace;text-align:left;max-width:100%;overflow:auto;opacity:.8';detail.textContent=window.__library2LoadError;loading.append(detail);}}
   else settle();
  }finally{loadingNow=false;}
 }
 addEventListener('library2:saved',e=>{if(sample)return;saved=e.detail;if(view){if(enabled())view.update(desk(),saved,catalogue);else pendingUpdate=true;}});
 addEventListener('library2:shelf-removed',event=>{const id=event.detail;table={...table,reading:table.reading.filter(book=>book.bookId!==id),finished:table.finished.filter(book=>book.bookId!==id),shelfReading:(table.shelfReading||table.reading).filter(book=>book.bookId!==id)};present();ready=load(true);});
 // A refresh that lands behind the menu, search, a book or My shelf is applied as
 // soon as the desk is visible again, so the desk and My shelf never disagree.
 // A change made elsewhere (My shelf) is simply there on return: no removal plays out on the desk.
 const flushPending=()=>{if(pendingUpdate&&view&&enabled()){pendingUpdate=false;view.update(desk(),saved,catalogue,{instant:true});}};
 addEventListener('library2:overlayclosed',flushPending);
 addEventListener('library2:interactive',flushPending);
 // Preserve the live scene in the back/forward cache while refreshing its data.
 addEventListener('pageshow',event=>{if(event.persisted&&!sample)ready=load(true);});
 addEventListener('online',()=>{if(!sample)ready=load(true);});
 // Returning to this browser adopts changes made on another device without a reload.
 let lastForegroundRefresh=0;
 const refreshForeground=()=>{if(sample||document.hidden||loadingNow||Date.now()-lastForegroundRefresh<2000)return;lastForegroundRefresh=Date.now();ready=load(true);};
 addEventListener('focus',refreshForeground);
 document.addEventListener('visibilitychange',refreshForeground);
 if(params.has('preview')||sample||override){const nav=document.createElement('nav');nav.className='preview-modes';nav.setAttribute('aria-label','Preview experiences');[['Your library','?preview=1'],['Shelf concept','?preview=1&view=shelf'],['New reader','?preview=1&view=new'],['Sample returning reader','?preview=1&demo=reading'],['Leave preview','?preview=0']].forEach(([label,href])=>{const a=document.createElement('a');a.href=href;a.textContent=label;nav.append(a);});hero.after(nav);}
 ready=load();
 return {show:()=>{if(view||api){show(table.reading.length?'reading':saved.length?'later':'finished');(shelfStudy?root:hero).scrollIntoView({block:'start'});}else ready=load();}};
}
function staleReload(){try{const now=Date.now(),key='tinct:stale-reload',recent=JSON.parse(sessionStorage.getItem(key)||'[]').filter(at=>now-at<120000);if(recent.length>=2)return false;sessionStorage.setItem(key,JSON.stringify([...recent,now]));return true;}catch{return false;}}
