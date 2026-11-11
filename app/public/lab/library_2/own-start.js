// "Add your own book or text" in the library hero, signed out (Anders, 5 Nov 2026): the add step opens here,
// on tinct.app, instead of going to /byob. Since 9 Nov 2026 the same "Add your own" sheet as the signed-in
// pop-up (add-choices.js): Upload (files may also be dropped on it, on a desktop), Insert link and Paste text,
// which becomes the same slim paste window as /byob and the signed-in pop-up (paste-box.js). What is chosen,
// linked or pasted is kept in this browser (file-handoff.js, 30 minutes), sent nowhere, and the reader goes to
// sign-in, which names it; the Preparing page (/preparing) then adds it (a link: imports the article) and opens
// the reader. The hero link's href="/byob" stays as the no-script fallback.
import {putHandoff,putHandoffFiles,putPasteHandoff,peekPasteHandoff} from '../addbook/js/file-handoff.js?v=20261109bulk';
import {pasteBox} from './paste-box.js?v=20261109add3';
import {pasteTooLong} from './own-add.js?v=20261111link';
import {linkHtml} from './paste-text.js?v=20261109add3';
import {ADD_TITLE,LINK_COPY,choiceList,filesRoute,linkForm,backButton} from './add-choices.js?v=20261109add3';

const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const button=(cls,text)=>{const b=make('button',cls,text);b.type='button';return b;};
const OK=/\.(pdf|epub|txt)$/i;
const toSignIn=own=>`/sign-in?returnTo=${encodeURIComponent(`/preparing?own=${own}`)}`;
let open=null;

export function closeOwnStart(){
 if(!open)return;
 const {layer,from,onKey}=open;open=null;
 removeEventListener('keydown',onKey,true);layer.remove();from?.focus?.({preventScroll:true});
}

/** Open the sheet. `go` navigates (tests pass their own). */
export function openOwnStart({from=null,go=href=>location.assign(href)}={}){
 closeOwnStart();
 const layer=make('div','tui-scrim own-file-layer own-start-layer');layer.dataset.testid='own-start';layer.dataset.tuiTheme='dark';
 const box=make('div','tui-dialog own-file-dialog own-start add-own');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','own-start-title');
 const title=make('h2','tui-dialog__title',ADD_TITLE);title.id='own-start-title';
 const close=button('tui-close own-file-close','');close.setAttribute('aria-label','Close');
 close.innerHTML='<svg viewBox="0 0 14 14" aria-hidden="true"><path d="m3 3 8 8M11 3l-8 8"/></svg>';
 const head=make('div','tui-dialog__head');head.append(title,close);
 const input=make('input');input.type='file';input.hidden=true;input.accept='application/pdf,.pdf,application/epub+zip,.epub,text/plain,.txt';
 const content=make('div','own-file-content');
 box.append(head,content,input);layer.append(box);document.body.append(layer);
 const busy=()=>box.dataset.busy==='1';
 close.onclick=()=>{if(!busy())closeOwnStart();};
 const onKey=event=>{if(event.key==='Escape'&&!busy()){event.preventDefault();event.stopPropagation();closeOwnStart();}};
 addEventListener('keydown',onKey,true);
 layer.addEventListener('click',event=>{if(event.target===layer&&!busy())closeOwnStart();});
 open={layer,from,onKey};
 const step=(name,...children)=>{box.dataset.step=name;content.replaceChildren(...children);};
 const status=make('p','own-start-status');status.setAttribute('role','status');

 async function take(file){
  if(!file)return;
  if(!OK.test(file.name)){status.textContent='Choose a PDF, an EPUB or a .txt file.';return;}
  box.dataset.busy='1';status.textContent=`Opening ${file.name}…`;
  // rights: sign-in carries the line "Adding it confirms you may read this file."
  if(!await putHandoff(file,{rights:true})){delete box.dataset.busy;status.textContent='This browser could not keep the file. Sign in first, then choose it again.';return;}
  go(toSignIn('file'));
 }
 // Several files at once (9 Nov 2026): all kept together; after sign-in the library's queue adds them
 // one after another (/preparing, add-to-tinct.js) and says why any could not be added. One file is `take`.
 async function takeAll(list){
  const files=[...(list||[])].filter(Boolean);
  if(filesRoute(files)!=='several'){void take(files[0]);return;}
  if(!files.some(file=>OK.test(file.name))){status.textContent='Choose PDFs, EPUBs or .txt files.';return;}
  box.dataset.busy='1';status.textContent=`Opening ${files.length} files…`;
  if(!await putHandoffFiles(files,{rights:true})){delete box.dataset.busy;status.textContent='This browser could not keep the files. Sign in first, then choose them again.';return;}
  go(toSignIn('file'));
 }
 input.multiple=true;
 input.onchange=()=>{const files=[...(input.files||[])];input.value='';void takeAll(files);};
 // Files dropped anywhere on the sheet (desktop).
 for(const type of ['dragenter','dragover'])box.addEventListener(type,e=>{if(!e.dataTransfer?.types?.includes('Files')||box.dataset.step==='paste')return;e.preventDefault();box.classList.add('is-over');});
 for(const type of ['dragleave','drop'])box.addEventListener(type,()=>box.classList.remove('is-over'));
 box.addEventListener('drop',e=>{if(!e.dataTransfer?.files?.length||box.dataset.step==='paste'||busy())return;e.preventDefault();void takeAll(e.dataTransfer.files);});

 let back=null;
 const setBack=onBack=>{back?.remove();back=onBack?backButton(onBack):null;if(back)head.prepend(back);};
 const plainHead=(text=ADD_TITLE)=>{setBack(null);box.classList.remove('paste-dialog');title.className='tui-dialog__title';delete title.dataset.empty;title.textContent=text;};
 // The three choices and nothing else (Anders, 9 Nov 2026).
 function chooseStep(){
  plainHead();
  step('choose',choiceList({upload:()=>input.click(),link:()=>linkStep(),paste:()=>pasteStep()}),status);
  content.querySelector('.add-choice')?.focus({preventScroll:true});
 }
 // Insert link: kept as a link; /preparing imports the article once the reader is signed in.
 function linkStep(value='',uid=''){
  plainHead(LINK_COPY.title);setBack(()=>{status.textContent='';chooseStep();});
  const form=linkForm({value,buttonClass:'tui-btn tui-btn--primary',inputClass:'tui-input',actionsClass:'tui-dialog__actions',onSubmit:async url=>{
   if(busy())return;
   box.dataset.busy='1';form.busy(true);
   if(!await putPasteHandoff({html:linkHtml(url),title:'',author:'',uid:uid||crypto.randomUUID(),url})){delete box.dataset.busy;form.busy(false);form.show('This browser could not keep your link. Sign in first, then add it again.');return;}
   go(toSignIn('paste'));
  }});
  step('link',form.el);
  form.focus();
 }
 function pasteStep(draft=null){
  setBack(null);
  box.classList.add('paste-dialog');
  let uid=draft?.uid||'';
  const paste=pasteBox({heading:title,placeholder:'Paste text',onLink:url=>linkStep(url,uid)});
  setBack(()=>{status.textContent='';chooseStep();});
  if(draft)paste.restore(draft);
  const alert=make('p','own-paste-error');alert.setAttribute('role','alert');
  const note=make('span','own-start-note','Kept on this device until you sign in.');
  const next=button('tui-btn tui-btn--primary tui-btn--lg own-start-continue','Continue');
  const sync=()=>{next.disabled=paste.empty()||busy();};
  paste.onChange(()=>{alert.textContent='';sync();});
  next.onclick=async()=>{
   if(next.disabled)return;
   const read=paste.read();
   const tooLong=read.url?'':pasteTooLong(read.text);if(tooLong){alert.textContent=tooLong;return;}
   box.dataset.busy='1';sync();
   uid||=crypto.randomUUID();
   // A link typed alone is kept as a link: /preparing imports the article once the reader is signed in.
   if(!await putPasteHandoff({html:read.html,title:read.title||(read.url?'':'Pasted text'),author:read.author,uid,...(read.url?{url:read.url}:{})})){delete box.dataset.busy;sync();alert.textContent='This browser could not keep your text. Sign in first, then paste it again.';return;}
   go(toSignIn('paste'));
  };
  const foot=make('div','own-start-foot');foot.append(note,next);
  const row=make('div','tui-dialog__actions paste-actions');row.append(foot);
  step('paste',paste.wrap,alert,row,status);
  content.prepend(paste.meta);
  sync();paste.focus();
 }
 chooseStep();
 // Text kept earlier and not yet added: shown again as it was left.
 void peekPasteHandoff().then(draft=>{if(!draft||open?.layer!==layer||box.dataset.step!=='choose')return;if(draft.url)linkStep(draft.url,draft.uid);else pasteStep(draft);});
 layer.showPaste=()=>pasteStep();
 layer.showLink=()=>linkStep();
 return layer;
}
