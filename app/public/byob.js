// /byob's own script: a file, because the site's Content-Security-Policy (script-src 'self')
// refuses inline scripts (an inline module here left every button dead on tinct.app, 4 Nov 2026).
// The library's "Your own book" pop-up does the adding (add-to-tinct.js): sign-in, Premium or
// the trial, the rights confirmation and the import. A file chosen here is kept for it in this
// browser for two minutes (file-handoff.js) and added as soon as the library opens.
import {putHandoff} from '/lab/addbook/js/file-handoff.js?v=20261009rel10';
const signedIn=/(?:^|;\s*)tinct_auth=1(?:;|$)/.test(document.cookie);
const $=id=>document.getElementById(id);
const OK=/\.(pdf|epub|txt)$/i;
// sharedReader=1: Paste text lives in the shared reader's pop-up (add-to-tinct.js pasteEnabled), as My shelf's own links carry it.
const library=own=>`/library?sharedReader=1&own=${own}`;
const go=own=>location.assign(signedIn?library(own):`/sign-in?returnTo=${encodeURIComponent(library(own))}`);
if(signedIn)for(const id of ['account','account-phone']){const a=$(id);if(a){a.textContent='My shelf';a.href='/library#my-shelf';}}
async function take(file){
  if(!file)return;
  if(!OK.test(file.name)){$('status').textContent='Choose a PDF, an EPUB or a .txt file.';return;}
  $('choose').disabled=$('paste').disabled=true;$('status').textContent=`Opening ${file.name}…`;
  await putHandoff(file);go('file');
}
$('choose').onclick=()=>$('file').click();
$('file').onchange=()=>{const file=$('file').files?.[0];$('file').value='';void take(file);};
$('paste').onclick=()=>go('paste');
const drop=$('drop');
for(const type of ['dragenter','dragover'])drop.addEventListener(type,e=>{e.preventDefault();drop.classList.add('over');});
for(const type of ['dragleave','drop'])drop.addEventListener(type,()=>drop.classList.remove('over'));
drop.addEventListener('drop',e=>{e.preventDefault();void take(e.dataTransfer?.files?.[0]);});
addEventListener('dragover',e=>e.preventDefault());addEventListener('drop',e=>{e.preventDefault();if(!drop.contains(e.target))void take(e.dataTransfer?.files?.[0]);});
addEventListener('pageshow',e=>{if(e.persisted){$('choose').disabled=$('paste').disabled=false;$('status').textContent='';}});
