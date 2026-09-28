import { resolveReadingTable, DEMO } from './reading-table.js?v=20260928a';
import { readingApi, loadCatalogueData } from './catalogue.js?v=20260928a';
import { createBookshelf } from './bookshelf-view.js?v=20260928a';

/** Mount within the existing library: the study's camera, real production data. */
export function mountBookshelf({hero,enabled,openBook,onSaved,notice}) {
 const params=new URLSearchParams(location.search),sample=params.get('demo')==='reading',forceNew=params.get('view')==='new';
 const html=document.documentElement;
 const root=document.createElement('section');root.className='bookshelf';root.hidden=true;root.setAttribute('aria-label','Your bookshelves');hero.before(root);
 const loading=document.createElement('div');loading.className='bookshelf-loading';loading.setAttribute('role','status');loading.textContent='Opening your shelves…';loading.hidden=!window.__library2Boot?.hint;hero.before(loading);
 let view=null,table={mode:'new',reading:[],finished:[]},saved=[],catalogue=[],api=null,loadingNow=false,pendingUpdate=false;
 const actualSaved=()=>saved;
 function settle(){loading.hidden=true;html.classList.remove('returning-pending');}
 function show(key){
  html.classList.add('returning');root.hidden=false;
  if(!view)view=createBookshelf(root,{table,catalogue,saved:actualSaved(),enabled:()=>enabled()&&!root.hidden,
   summaryFor:sample?null:(id,options)=>api.summaryFor(id,options),onError:notice,
   onRemove:id=>{if(sample){saved=saved.filter(book=>book!==id);view.update(table,saved);}else window.dispatchEvent(new CustomEvent('library2:remove-saved',{detail:id}));},
   onOpen:async(id,shelf,img)=>{
    if(shelf==='reading'&&!sample){const href=await api.readerDestination(id,null);location.assign(href);}
    else await openBook(id,img);
   }});
  else view.update(table,actualSaved());
  if(key)view.focus(key);
  settle();
 }
 async function load(refresh=false){
  if(loadingNow)return;loadingNow=true;
  try{
   const savedReady=readingApi().then(api=>api.loadSavedBooks());savedReady.catch(()=>{});
   const result=sample?{api:await readingApi(),table:DEMO}:await resolveReadingTable(refresh);
   api=result.api;catalogue=(await loadCatalogueData()).books;
   const savedResult=await savedReady;saved=savedResult.ids;
   if(sample){saved=['candide','jane-eyre'];table={...DEMO,reading:DEMO.reading.map(b=>({...b,author:catalogue.find(c=>c.id===b.bookId)?.author||''}))};}
   else{table=result.table;onSaved(saved);}
   window.__library2Reading=table;
   const returning=table.mode==='returning'||saved.length>0;
   if(!sample)try{if(returning)localStorage.setItem('tinct-library-2-reading-table',JSON.stringify({mode:'returning'}));else localStorage.removeItem('tinct-library-2-reading-table');}catch{}
   if(!forceNew&&returning)show();else{html.classList.remove('returning');root.hidden=true;settle();}
   window.dispatchEvent(new Event('resize'));
   window.dispatchEvent(new CustomEvent('library2:reading',{detail:{...table,mode:!forceNew&&returning?'returning':'new'}}));
  }catch{
   html.classList.remove('returning-pending');
   if(window.__library2Boot?.hint){loading.hidden=false;loading.replaceChildren();const message=document.createElement('p');message.textContent='Your shelves could not load. Your reading place is safe.';const retry=document.createElement('button');retry.textContent='Try again';retry.onclick=()=>{loading.textContent='Opening your shelves…';load();};const browse=document.createElement('button');browse.textContent='Browse books';browse.onclick=()=>{settle();html.classList.remove('returning');};loading.append(message,retry,browse);}
   else settle();
  }finally{loadingNow=false;}
 }
 addEventListener('library2:saved',e=>{if(sample)return;saved=e.detail;if(view){if(enabled())view.update(table,saved);else pendingUpdate=true;}});
 addEventListener('library2:overlayclosed',()=>{if(pendingUpdate&&view){pendingUpdate=false;view.update(table,saved);}});
 addEventListener('pagehide',()=>{if(!root.hidden){root.hidden=true;loading.hidden=false;}});
 addEventListener('pageshow',event=>{if(event.persisted){if(sample)show();else load(true);}});
 addEventListener('online',()=>{if(!sample)api?.loadSavedBooks().then(result=>onSaved(result.ids),()=>{});});
 // Private review helpers never seed, delete or change reading history.
 if(params.has('preview')||sample||forceNew){const nav=document.createElement('nav');nav.className='preview-modes';nav.setAttribute('aria-label','Preview experiences');[['Your library','?preview=1'],['New reader','?preview=1&view=new'],['Sample returning reader','?preview=1&demo=reading'],['Leave preview','?preview=0']].forEach(([label,href])=>{const a=document.createElement('a');a.href=href;a.textContent=label;nav.append(a);});hero.after(nav);}
 load();
 return {show:()=>{if(view||api){show(table.reading.length?'reading':saved.length?'later':'finished');root.scrollIntoView({block:'start'});}else load();}};
}
