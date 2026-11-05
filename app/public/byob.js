// /byob's own script: a file, because the site's Content-Security-Policy (script-src 'self')
// refuses inline scripts (an inline module here left every button dead on tinct.app, 4 Nov 2026).
// First text straight into the reader (approved paste-flow mockups, 5 Nov 2026): "Paste text" turns
// the drop box into the text box here (paste-box.js: the cleaned text, its title and byline). The
// text, or a chosen file, is kept in this browser (file-handoff.js, 30 minutes) and sent nowhere
// until the reader is signed in; then the Preparing page (/preparing) adds it through the library's
// own path (own-add.js) and opens the reader. Signed in, Continue goes straight there.
import {putHandoff,putPasteHandoff,peekPasteHandoff} from '/lab/addbook/js/file-handoff.js?v=20261105flow';
import {pasteBox} from '/lab/library_2/paste-box.js?v=20261105flow';
import {pasteTooLong} from '/lab/library_2/own-add.js?v=20261105flow';
const signedIn=/(?:^|;\s*)tinct_auth=1(?:;|$)/.test(document.cookie);
const $=id=>document.getElementById(id);
const OK=/\.(pdf|epub|txt)$/i;
const preparing=own=>`/preparing?own=${own}`;
const go=own=>location.assign(signedIn?preparing(own):`/sign-in?returnTo=${encodeURIComponent(preparing(own))}`);
if(signedIn){
  for(const id of ['account','account-phone']){const a=$(id);if(a){a.textContent='My shelf';a.href='/library#my-shelf';}}
  // Signed out, sign-in says it ("By continuing you confirm you may read this file."); signed in, it is said here.
  $('rights').hidden=false;
  $('paste-note').hidden=true;
}
const busy=on=>{for(const id of ['choose','paste','continue','choose-foot'])$(id).disabled=on;};
let paste=null,pasting=false,uid='';
async function take(file){
  if(!file)return;
  if(!OK.test(file.name)){const why='Choose a PDF, an EPUB or a .txt file.';$('status').textContent=why;if(pasting)$('paste-error').textContent=why;return;}
  busy(true);$('status').textContent=`Opening ${file.name}…`;
  // rights: the confirmation line was on this page (signed in) or is on sign-in (signed out).
  if(!await putHandoff(file,{rights:true})){busy(false);$('status').textContent='This browser could not keep the file. Sign in first, then choose it again.';return;}
  go('file');
}
$('choose').onclick=()=>$('file').click();
$('choose-foot').onclick=()=>$('file').click();
$('file').onchange=()=>{const file=$('file').files?.[0];$('file').value='';void take(file);};

// ---- Paste text: the drop box becomes the text box in place ----
function startPaste(draft=null,{push=true}={}){
  if(!paste){
    paste=pasteBox({heading:$('paste-title'),placeholder:'Paste text'});
    $('paste-title').after(paste.meta);
    $('paste-error').before(paste.wrap);
    paste.onChange(()=>{$('paste-error').textContent='';});
  }
  if(draft){paste.restore(draft);uid=draft.uid||'';}
  pasting=true;document.body.classList.add('pasting');
  $('paste-area').hidden=false;$('foot-library').hidden=true;$('foot-file').hidden=false;
  if(push){try{history.pushState({paste:1},'');}catch{/* no history */}paste.focus();}
}
function stopPaste(){
  pasting=false;document.body.classList.remove('pasting');
  $('paste-area').hidden=true;$('foot-library').hidden=false;$('foot-file').hidden=true;
}
$('paste').onclick=()=>startPaste();
addEventListener('popstate',event=>{if(event.state?.paste)startPaste(null,{push:false});else if(pasting)stopPaste();});
$('continue').onclick=async()=>{
  if(!paste||$('continue').disabled)return;
  const draft=paste.read();
  if(!draft.text){$('paste-error').textContent='Paste some text to add.';paste.focus();return;}
  const tooLong=pasteTooLong(draft.text);if(tooLong){$('paste-error').textContent=tooLong;return;}
  busy(true);
  uid||=crypto.randomUUID();
  if(!await putPasteHandoff({html:draft.html,title:draft.title||'Pasted text',author:draft.author,uid})){
    busy(false);$('paste-error').textContent='This browser could not keep your text. Sign in first, then paste it again.';return;
  }
  go('paste');
};

const drop=$('drop');
const files=e=>!!e.dataTransfer?.types?.includes('Files');
for(const type of ['dragenter','dragover'])drop.addEventListener(type,e=>{if(!files(e))return;e.preventDefault();drop.classList.add('over');});
for(const type of ['dragleave','drop'])drop.addEventListener(type,()=>drop.classList.remove('over'));
drop.addEventListener('drop',e=>{if(!e.dataTransfer?.files?.length)return;e.preventDefault();void take(e.dataTransfer.files[0]);});
addEventListener('dragover',e=>{if(files(e))e.preventDefault();});
addEventListener('drop',e=>{if(!e.dataTransfer?.files?.length)return;e.preventDefault();if(!drop.contains(e.target))void take(e.dataTransfer.files[0]);});
addEventListener('pageshow',e=>{if(e.persisted){busy(false);$('status').textContent='';}});
// Text kept here earlier and not yet added (back from sign-in, or a failed add): shown again as it was left.
void peekPasteHandoff().then(draft=>{if(draft&&!pasting)startPaste(draft,{push:false});});
