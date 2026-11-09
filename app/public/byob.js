// /byob's own script: a file, because the site's Content-Security-Policy (script-src 'self')
// refuses inline scripts (an inline module here left every button dead on tinct.app, 4 Nov 2026).
// First text straight into the reader (approved paste-flow mockups, 5 Nov 2026). Since 9 Nov 2026 the page
// offers the same three choices as the library's "Add your own" pop-up (add-choices.js): Upload, Insert link
// and Paste text. Paste text turns the drop box into the text box here (paste-box.js: the cleaned text, its
// title and byline); Insert link into one field for the article's address. The text, link or chosen file is
// kept in this browser (file-handoff.js, 30 minutes) and sent nowhere until the reader is signed in; then the
// Preparing page (/preparing) adds it (a link: imports the article) through the library's own path
// (own-add.js) and opens the reader. Signed in, Continue and Add go straight there.
import {putHandoff,putHandoffFiles,putPasteHandoff,peekPasteHandoff} from '/lab/addbook/js/file-handoff.js?v=20261109bulk';
import {pasteBox} from '/lab/library_2/paste-box.js?v=20261109add3';
import {pasteTooLong} from '/lab/library_2/own-add.js?v=20261109add3';
import {linkHtml} from '/lab/library_2/paste-text.js?v=20261109add3';
import {filesRoute,linkForm} from '/lab/library_2/add-choices.js?v=20261109add3';
const signedIn=/(?:^|;\s*)tinct_auth=1(?:;|$)/.test(document.cookie);
const $=id=>document.getElementById(id);
const OK=/\.(pdf|epub|txt)$/i;
const preparing=own=>`/preparing?own=${own}`;
const go=own=>location.assign(signedIn?preparing(own):`/sign-in?returnTo=${encodeURIComponent(preparing(own))}`);
if(signedIn){
  for(const id of ['account','account-phone']){const a=$(id);if(a){a.textContent='My shelf';a.href='/library#my-shelf';}}
  // Signed out, sign-in says it ("Adding it confirms you may read this file."); signed in, it is said here.
  $('rights').hidden=false;
  $('paste-note').hidden=true;
}
let paste=null,link=null,mode='',uid='';
const busy=on=>{for(const id of ['choose','link','paste','continue'])$(id).disabled=on;link?.busy(on);};
const stepError=text=>{if(mode==='paste')$('paste-error').textContent=text;else if(mode==='link')link?.show(text);};
async function take(file){
  if(!file)return;
  if(!OK.test(file.name)){const why='Choose a PDF, an EPUB or a .txt file.';$('status').textContent=why;stepError(why);return;}
  busy(true);$('status').textContent=`Opening ${file.name}…`;
  // rights: the confirmation line was on this page (signed in) or is on sign-in (signed out).
  if(!await putHandoff(file,{rights:true})){busy(false);$('status').textContent='This browser could not keep the file. Sign in first, then choose it again.';return;}
  go('file');
}
// Several files at once (9 Nov 2026): kept together; /preparing hands them to the library's queue, which
// adds them one after another and says why any could not be added. One file is `take`, as before.
async function takeAll(list){
  const files=[...(list||[])].filter(Boolean);
  if(filesRoute(files)!=='several'){void take(files[0]);return;}
  if(!files.some(file=>OK.test(file.name))){const why='Choose PDFs, EPUBs or .txt files.';$('status').textContent=why;stepError(why);return;}
  busy(true);$('status').textContent=`Opening ${files.length} files…`;
  if(!await putHandoffFiles(files,{rights:true})){busy(false);$('status').textContent='This browser could not keep the files. Sign in first, then choose them again.';return;}
  go('file');
}
$('file').multiple=true;
$('choose').onclick=()=>$('file').click();
$('file').onchange=()=>{const files=[...($('file').files||[])];$('file').value='';void takeAll(files);};

// ---- Paste text and Insert link: the drop box becomes the step in place ----
function show(next,{push=true}={}){
  mode=next;
  document.body.classList.toggle('pasting',next==='paste');
  document.body.classList.toggle('linking',next==='link');
  $('paste-area').hidden=next!=='paste';$('link-area').hidden=next!=='link';
  if(push&&next){try{history.pushState({[next]:1},'');}catch{/* no history */}}
}
function startPaste(draft=null,{push=true}={}){
  if(!paste){
    // A link pasted alone goes to Insert link (decision 9 Nov 2026), which imports it.
    paste=pasteBox({heading:$('paste-title'),placeholder:'Paste text',onLink:url=>{try{history.replaceState({link:1},'');}catch{/* no history */}startLink(url,{push:false});}});
    $('paste-title').parentElement.after(paste.meta);
    $('paste-error').before(paste.wrap);
    paste.onChange(()=>{$('paste-error').textContent='';});
  }
  if(draft){paste.restore(draft);uid=draft.uid||'';}
  show('paste',{push});
  if(push)paste.focus();
}
function startLink(value='',{push=true}={}){
  if(!link){
    link=linkForm({buttonClass:'btn primary',onSubmit:async url=>{
      busy(true);
      uid||=crypto.randomUUID();
      // Kept as a link: /preparing imports the article once the reader is signed in.
      if(!await putPasteHandoff({html:linkHtml(url),title:'',author:'',uid,url})){busy(false);link.show('This browser could not keep your link. Sign in first, then add it again.');return;}
      go('paste');
    }});
    $('link-area').append(link.el);
  }
  if(value)link.input.value=value;
  link.input.dispatchEvent(new Event('input'));
  show('link',{push});
  link.focus();
}
const stop=()=>show('');
// Back to the three choices: the history entry the step pushed, or straight back.
const back=()=>{if(history.state?.paste||history.state?.link)history.back();else stop();};
$('paste-back').onclick=back;
$('link-back').onclick=back;
$('paste').onclick=()=>startPaste();
$('link').onclick=()=>startLink();
addEventListener('popstate',event=>{if(event.state?.paste)startPaste(null,{push:false});else if(event.state?.link)startLink('',{push:false});else if(mode)stop();});
$('continue').onclick=async()=>{
  if(!paste||$('continue').disabled)return;
  const draft=paste.read();
  if(!draft.text){$('paste-error').textContent='Paste some text to add.';paste.focus();return;}
  const tooLong=draft.url?'':pasteTooLong(draft.text);if(tooLong){$('paste-error').textContent=tooLong;return;}
  busy(true);
  uid||=crypto.randomUUID();
  // A link typed alone is kept as a link: /preparing imports the article once the reader is signed in.
  if(!await putPasteHandoff({html:draft.html,title:draft.title||(draft.url?'':'Pasted text'),author:draft.author,uid,...(draft.url?{url:draft.url}:{})})){
    busy(false);$('paste-error').textContent='This browser could not keep your text. Sign in first, then paste it again.';return;
  }
  go('paste');
};

const drop=$('drop');
const files=e=>!!e.dataTransfer?.types?.includes('Files');
for(const type of ['dragenter','dragover'])drop.addEventListener(type,e=>{if(!files(e))return;e.preventDefault();drop.classList.add('over');});
for(const type of ['dragleave','drop'])drop.addEventListener(type,()=>drop.classList.remove('over'));
drop.addEventListener('drop',e=>{if(!e.dataTransfer?.files?.length)return;e.preventDefault();void takeAll(e.dataTransfer.files);});
addEventListener('dragover',e=>{if(files(e))e.preventDefault();});
addEventListener('drop',e=>{if(!e.dataTransfer?.files?.length)return;e.preventDefault();if(!drop.contains(e.target))void takeAll(e.dataTransfer.files);});
addEventListener('pageshow',e=>{if(e.persisted){busy(false);$('status').textContent='';}});
// Text or a link kept here earlier and not yet added (back from sign-in, or a failed add): shown again as it was left.
void peekPasteHandoff().then(draft=>{if(!draft||mode)return;if(draft.url){uid=draft.uid||'';startLink(draft.url,{push:false});}else startPaste(draft,{push:false});});
