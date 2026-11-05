// /preparing (approved paste-flow mockup 04, 5 Nov 2026): the step between sign-in and the reader for a
// text pasted or a file chosen on /byob. It takes what /byob kept in this browser (file-handoff.js), adds
// it through the library pop-up's own path (library_2/own-add.js: the same engines, checks, upload and
// keeping), and opens the reader for the new book, where "Added to your shelf" shows once
// (/lab/added-toast.js). Nothing is taken from the handoff until the book is in: on a failure the
// message shows with a way back to /byob (the text is still there) or the library (the file is added there).
// A file here because the site's Content-Security-Policy refuses inline scripts.
import {peekHandoffEntry,takeHandoff,peekPasteHandoff,clearPasteHandoff} from '/lab/addbook/js/file-handoff.js?v=20261105flow';
import {paperCoverUrl} from '/lab/book-cover.js?v=20261009owncover';
import {cleanPaste} from '/lab/library_2/paste-text.js?v=20261105flow';
import {addEngine,loadFileEngine,pasteBook,savePastedText,keepOwnFile,noteAdded} from '/lab/library_2/own-add.js?v=20261105flow';

const $=id=>document.getElementById(id);
const own=new URLSearchParams(location.search).get('own')==='file'?'file':'paste';
const SHELF='/library?sharedReader=1#my-shelf';
const here=()=>location.pathname+location.search;
const signIn=()=>location.replace('/sign-in?returnTo='+encodeURIComponent(here()));
const signedInCookie=()=>/(?:^|;\s*)tinct_auth=1(?:;|$)/.test(document.cookie);

const progress=value=>{$('bar').style.setProperty('--p',String(Math.max(.04,Math.min(1,value))));};
const cover=(title,author,kind='')=>{const url=paperCoverUrl(title||'Your text',author||'',kind);if(url)$('cover').src=url;};
const titleFromName=name=>String(name||'').replace(/\.[a-z0-9]{1,5}$/i,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim().replace(/^./,c=>c.toUpperCase())||'Your book';
// The engine's own words for an upload that did not go through (add-engine.js saveToAccount).
function message(error,fallback){
  const code=error?.code,status=error?.status;
  if(code==='offline')return 'No connection. Check your internet and try again.';
  if(code==='signed_out'||status===401)return 'Your Tinct sign-in has expired. Sign in again, then try again.';
  if(code==='account_full')return 'Your account’s storage for books is full.';
  if(code==='file_too_large'||status===413)return 'Files over 50 MB are not saved to your account.';
  const text=String(error?.message||'');
  return text&&!/^[a-z_]+$/.test(text)?text:fallback;
}
function fail(text,{back,backLabel}){
  $('line').textContent=own==='file'?'Your book is not added yet':'Your text is not added yet';
  $('bar').hidden=true;$('problem').textContent=text;$('problem').hidden=false;
  $('back').href=back;$('back').textContent=backLabel;$('actions').hidden=false;
  $('retry').focus({preventScroll:true});
}
$('retry').onclick=()=>location.reload();

/** Signed in, allowed to add (Premium or the trial), the engine ready; or null when this page has gone elsewhere. */
async function ready(){
  if(!signedInCookie()){signIn();return null;}
  const [engineApi,access]=await Promise.all([
    loadFileEngine(),
    // The library's own check; it also refreshes an expired session before the upload reads it.
    addEngine().then(api=>api.canAdd?api.canAdd():null).catch(()=>null),
  ]);
  if(!engineApi.accountId()){signIn();return null;}
  // As in the library: a free account is offered Premium (the account card); what was kept stays kept.
  if(access===false){location.replace('/sign-in?mode=account&returnTo='+encodeURIComponent(SHELF));return null;}
  return engineApi;
}

async function addText(draft,{fromFile=false}={}){
  $('line').textContent='Preparing your text…';document.title='Preparing your text · Tinct';
  cover(draft.title,draft.author);
  const back=fromFile?{back:'/library?sharedReader=1&own=file',backLabel:'Open the library'}:{back:'/byob',backLabel:'Back to your text'};
  progress(.08);
  let engineApi;
  try{engineApi=await ready();}catch{fail('This text could not be added. Try again.',back);return;}
  if(!engineApi)return;
  try{
    const file=pasteBook(draft);
    const added=await savePastedText(engineApi,file,{title:draft.title,author:draft.author,progress});
    if(fromFile)await takeHandoff();else await clearPasteHandoff();
    noteAdded(added.key);
    location.replace(added.href);
  }catch(error){fail(message(error,'This text could not be added. Try again.'),back);}
}

async function addFile(entry){
  const file=entry.file;
  // A .txt file is text: added as a pasted text, as the library pop-up does.
  if(/\.txt$/i.test(file.name)||file.type==='text/plain'){
    let plain='';try{plain=await file.text();}catch{/* below */}
    if(!plain.trim()){fail('This text file is empty.',{back:'/byob',backLabel:'Back'});return;}
    const cleaned=cleanPaste({plain});
    await addText({html:cleaned.html,title:cleaned.title||titleFromName(file.name),author:cleaned.author,uid:''},{fromFile:true});
    return;
  }
  const ext=(String(file.name).match(/\.([a-z0-9]{1,5})$/i)?.[1]||'').toUpperCase();
  $('line').textContent='Preparing your book…';document.title='Preparing your book · Tinct';
  cover(titleFromName(file.name),'',ext);
  const back={back:'/library?sharedReader=1&own=file',backLabel:'Open the library'};
  progress(.08);
  let engineApi;
  try{engineApi=await ready();}catch{fail('This file could not be opened. Choose another file.',back);return;}
  if(!engineApi)return;
  try{
    const read=await engineApi.readFile(file);
    if(read.error){fail(read.error,{back:'/byob',backLabel:'Choose another file'});return;}
    if(!engineApi.rightsConfirmed()){
      // The line "By continuing you confirm you may read this file." was shown on /byob or sign-in (entry.rights):
      // recorded as the rights dialog records it, and sent with the account copy. Otherwise the library asks.
      if(entry.rights)engineApi.confirmRights();
      else{location.replace('/library?sharedReader=1&own=file');return;}
    }
    progress(.3);
    const {kept,opened}=await keepOwnFile(engineApi,file,read,{progress});
    // This browser cannot keep it: Add a book's PDF reader takes the kept handoff and opens it unkept, as the library does.
    if(!kept){location.replace('/lab/addbook/?mode=file&handoff=1');return;}
    await takeHandoff();
    noteAdded(read.key);
    location.replace(opened.href);
  }catch(error){fail(message(error,'This file could not be opened. Choose another file.'),back);}
}

async function main(){
  if(own==='file'){
    const entry=await peekHandoffEntry();
    if(entry){await addFile(entry);return;}
  }else{
    const draft=await peekPasteHandoff();
    if(draft){await addText(draft);return;}
  }
  // Nothing waiting (already added, or kept too long ago): My shelf, where added books are.
  location.replace(SHELF);
}
void main();
