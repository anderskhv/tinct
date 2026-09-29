import { resolveReadingTable, onCachedTable, createReadingTable, DEMO } from './reading-table.js?v=20260929reveal';
import { readingApi, loadCatalogueData } from './catalogue.js?v=20260928f';
import { createBookshelf } from './bookshelf-view.js?v=20260928f';
import { readVisit, rememberVisit, visitMode } from './visit.js?v=20260928f';

export function mountBookshelf({hero,enabled,openBook,prepareCover,onSaved,notice}) {
 const params=new URLSearchParams(location.search),sample=params.get('demo')==='reading';
 const shelfStudy=params.get('view')==='shelf';
 const override=sample?'shelf':params.get('view')==='new'?'discovery':params.get('view')==='shelf'?'shelf':null;
 const html=document.documentElement;
 const root=document.createElement('section');root.className='bookshelf';root.hidden=true;root.setAttribute('aria-label','Your bookshelves');hero.before(root);
 const loading=document.createElement('div');loading.className='bookshelf-loading';loading.setAttribute('aria-label','Loading your library');loading.hidden=!window.__library2Boot?.hint;hero.before(loading);
 let view=null,table={mode:'new',reading:[],finished:[]},saved=[],catalogue=[],api=null,loadingNow=false,pendingUpdate=false,ready=Promise.resolve(),resumeReady=Promise.resolve();
 try{catalogue=JSON.parse(sessionStorage.getItem('tinct:library-2-catalogue')||'[]');}catch{}
 function settle(){loading.hidden=true;html.classList.remove('returning-pending');if(!html.classList.contains('returning')||shelfStudy)html.classList.remove('returning-scene-pending');}
 function show(key){
  html.classList.add('returning');html.dataset.returningView=shelfStudy?'shelf':'table';root.hidden=!shelfStudy;
  if(!sample)rememberVisit({mode:'shelf'});
  if(!view)view=(shelfStudy?createBookshelf:createReadingTable)(shelfStudy?root:hero,{table,catalogue,saved,prepareCover,initial:sample?null:shelfStudy?readVisit()?.shelf:{bookId:readVisit()?.tableBook},
   onSelection:state=>{if(!sample)rememberVisit(shelfStudy?{shelf:state}:{tableBook:state.bookId});},enabled:()=>enabled()&&html.classList.contains('returning'),
   summaryFor:sample?null:(id,options)=>api.summaryFor(id,options),onError:notice,
   onRemoveReading:async id=>{
    if(sample){table={...table,reading:table.reading.filter(b=>b.bookId!==id)};present();return;}
    await resumeReady;
    await api.hideFromReadingNow(id);
    const retained=await api.loadSavedBooks();saved=retained.ids;onSaved(saved);
    const reading=table.reading.filter(b=>b.bookId!==id);
    table={...table,reading,shelfReading:reading};
    present();
    // Hide synchronously from the current view, then reconcile account data.
    ready=load(true);
   },
   onRemove:id=>{if(sample){saved=saved.filter(book=>book!==id);view.update(table,saved);}else window.dispatchEvent(new CustomEvent('library2:remove-saved',{detail:id}));},
   onOpen:async(id,shelf,img)=>{
    if(shelf==='reading'&&!sample){await resumeReady;const href=await api.readerDestination(id,null);if(href!=='/reader')throw new Error('Reader unavailable');rememberVisit({mode:'shelf'});location.assign(href);}
    else await openBook(id,img);
   }});
  else if(enabled())view.update(table,saved,catalogue);else pendingUpdate=true;
  if(key)view.focus(key);
  settle();
 }
// An empty cached table must not choose the visit before current reading resolves.
 function present(cached=false){
  const returning=table.mode==='returning'||saved.length>0;
  const mode=visitMode(returning,override);
  const showReturning=mode==='shelf'&&(shelfStudy||table.reading.length);
  if(showReturning)show();else{html.classList.remove('returning');root.hidden=true;hero.querySelector('.reading-table')?.setAttribute('hidden','');settle();if(!cached)rememberVisit({mode:'discovery'});}
  window.__library2Reading=table;
  dispatchEvent(new Event('resize'));
  dispatchEvent(new CustomEvent('library2:reading',{detail:{...table,mode:showReturning?'returning':'new'}}));
 }
 if(!sample)onCachedTable((cached,engine)=>{api=engine;table=cached;present(true);});
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
   // A cloud shelf sync is independent of painting the books already on device.
   present();
   const value=await savedReady;if(!sample){saved=value.ids;onSaved(saved);if(view){if(enabled())view.update(table,saved,catalogue);else pendingUpdate=true;}}
   if(!sample)try{if(table.mode==='returning'||saved.length)localStorage.setItem('tinct-library-2-reading-table','{"mode":"returning"}');else localStorage.removeItem('tinct-library-2-reading-table');}catch{}
  }catch{
   if(view){settle();notice('Showing your saved shelf. It will refresh when you reconnect.');}
   else if(window.__library2Boot?.hint){html.classList.remove('returning-pending');loading.hidden=false;loading.replaceChildren();const message=document.createElement('p');message.textContent='Your shelves could not load. Your reading place is safe.';const retry=document.createElement('button');retry.textContent='Try again';retry.onclick=()=>{loading.replaceChildren();ready=load();};const browse=document.createElement('button');browse.textContent='Browse books';browse.onclick=()=>{rememberVisit({mode:'discovery'});settle();html.classList.remove('returning');};loading.append(message,retry,browse);}
   else{rememberVisit({mode:'discovery'});settle();}
  }finally{loadingNow=false;}
 }
 addEventListener('library2:saved',e=>{if(sample)return;saved=e.detail;if(view){if(enabled())view.update(table,saved,catalogue);else pendingUpdate=true;}});
 addEventListener('library2:shelf-removed',event=>{const id=event.detail;table={...table,reading:table.reading.filter(book=>book.bookId!==id),finished:table.finished.filter(book=>book.bookId!==id),shelfReading:(table.shelfReading||table.reading).filter(book=>book.bookId!==id)};present();ready=load(true);});
 addEventListener('library2:overlayclosed',()=>{if(pendingUpdate&&view){pendingUpdate=false;view.update(table,saved,catalogue);}});
 // Preserve the live scene in the back/forward cache while refreshing its data.
 addEventListener('pageshow',event=>{if(event.persisted&&!sample)ready=load(true);});
 addEventListener('online',()=>{if(!sample)ready=load(true);});
 if(params.has('preview')||sample||override){const nav=document.createElement('nav');nav.className='preview-modes';nav.setAttribute('aria-label','Preview experiences');[['Your library','?preview=1'],['Shelf concept','?preview=1&view=shelf'],['New reader','?preview=1&view=new'],['Sample returning reader','?preview=1&demo=reading'],['Leave preview','?preview=0']].forEach(([label,href])=>{const a=document.createElement('a');a.href=href;a.textContent=label;nav.append(a);});hero.after(nav);}
 ready=load();
 return {show:()=>{if(view||api){show(table.reading.length?'reading':saved.length?'later':'finished');(shelfStudy?root:hero).scrollIntoView({block:'start'});}else ready=load();}};
}

