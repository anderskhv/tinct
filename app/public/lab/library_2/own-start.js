// "Add your own book or text" in the library hero, signed out (Anders, 5 Nov 2026): the add step opens here,
// on tinct.app, instead of going to /byob. A small sheet: Choose a file (or drop one, on a desktop) and Paste
// text, which becomes the same slim paste window as /byob and the signed-in pop-up (paste-box.js). What is
// chosen or pasted is kept in this browser (file-handoff.js, 30 minutes), sent nowhere, and the reader goes to
// sign-in, which names it; the Preparing page (/preparing) then adds it and opens the reader. The hero link's
// href="/byob" stays as the no-script fallback.
import {putHandoff,putPasteHandoff,peekPasteHandoff} from '../addbook/js/file-handoff.js?v=20261105flow';
import {pasteBox} from './paste-box.js?v=20261105flow';
import {pasteTooLong} from './own-add.js?v=20261105flow';

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
 const box=make('div','tui-dialog own-file-dialog own-start');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','own-start-title');
 const title=make('h2','tui-dialog__title','Your own book or text');title.id='own-start-title';
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
 input.onchange=()=>{const file=input.files?.[0];input.value='';void take(file);};
 // A file dropped anywhere on the sheet (desktop).
 for(const type of ['dragenter','dragover'])box.addEventListener(type,e=>{if(!e.dataTransfer?.types?.includes('Files'))return;e.preventDefault();box.classList.add('is-over');});
 for(const type of ['dragleave','drop'])box.addEventListener(type,()=>box.classList.remove('is-over'));
 box.addEventListener('drop',e=>{if(!e.dataTransfer?.files?.length)return;e.preventDefault();void take(e.dataTransfer.files[0]);});

 function chooseStep(){
  box.classList.remove('paste-dialog');title.className='tui-dialog__title';delete title.dataset.empty;title.textContent='Your own book or text';
  const lede=make('p','tui-dialog__body own-start-lede','A PDF, an EPUB, or an article you paste. Kept on this device until you sign in.');
  const drop=make('div','own-start-drop');drop.append(make('span','','Drag your file here'));
  const choose=button('tui-btn tui-btn--primary own-start-choose','Choose a file');choose.onclick=()=>input.click();
  const paste=button('tui-btn tui-btn--secondary own-start-paste','Paste text');paste.onclick=()=>pasteStep();
  const row=make('div','tui-dialog__actions own-start-actions');row.append(paste,choose);
  step('choose',lede,drop,row,status);
  choose.focus({preventScroll:true});
 }
 function pasteStep(draft=null){
  box.classList.add('paste-dialog');
  const paste=pasteBox({heading:title,placeholder:'Paste text'});
  if(draft)paste.restore(draft);
  let uid=draft?.uid||'';
  const alert=make('p','own-paste-error');alert.setAttribute('role','alert');
  const other=button('paste-quiet-link own-paste-file','Choose a file instead');other.onclick=()=>input.click();
  const note=make('span','own-start-note','Kept on this device until you sign in.');
  const next=button('tui-btn tui-btn--primary tui-btn--lg own-start-continue','Continue');
  const sync=()=>{next.disabled=paste.empty()||busy();};
  paste.onChange(()=>{alert.textContent='';sync();});
  next.onclick=async()=>{
   if(next.disabled)return;
   const read=paste.read();
   const tooLong=pasteTooLong(read.text);if(tooLong){alert.textContent=tooLong;return;}
   box.dataset.busy='1';sync();
   uid||=crypto.randomUUID();
   if(!await putPasteHandoff({html:read.html,title:read.title||'Pasted text',author:read.author,uid})){delete box.dataset.busy;sync();alert.textContent='This browser could not keep your text. Sign in first, then paste it again.';return;}
   go(toSignIn('paste'));
  };
  const foot=make('div','own-start-foot');foot.append(note,next);
  const row=make('div','tui-dialog__actions paste-actions');row.append(other,foot);
  step('paste',paste.wrap,alert,row,status);
  content.prepend(paste.meta);
  sync();paste.focus();
 }
 chooseStep();
 // Text kept earlier and not yet added: shown again as it was left.
 void peekPasteHandoff().then(draft=>{if(draft&&open?.layer===layer&&box.dataset.step==='choose')pasteStep(draft);});
 layer.showPaste=()=>pasteStep();
 return layer;
}
