// Several own books at once (Anders, 9 Nov 2026: "Lets do bulk uploads, yes"). Files chosen or dropped
// together in the "Your own book" pop-up (add-to-tinct.js) are prepared one after another in a queue:
// waiting, preparing, then ready, failed (with the engine's own reason) or skipped (already on My shelf).
// Each file goes through the one-file path's own steps (add-engine.js readFile, own-add.js keepOwnFile and
// savePastedText), so every limit and refusal is the same; one file failing never stops the others.
// The Premium/trial gate and the rights confirmation are the caller's, once, before the queue starts.
// One file chosen on its own never comes here: it keeps the one-file path exactly.
// No page UI here: the caller draws the queue from `items`.
import {keepOwnFile,pasteBook,savePastedText,pasteTooLong} from './own-add.js?v=20261105flow';
import {cleanPaste} from './paste-text.js?v=20261105flow';

export const QUEUE_COPY={
 waiting:'Waiting',preparing:'Preparing',ready:'Added',skipped:'Already on My shelf',
 failed:'This file could not be added.',
 signedOut:'You are signed out. Sign in, then add this file again.',
 unkept:'This browser could not keep a copy. Add this file on its own to open it.',
 rights:'Confirm you may read this file: add it on its own.',
};
const TEXT_MAX_BYTES=50*1024*1024;
export const isTextFile=file=>/\.txt$/i.test(file?.name||'')||file?.type==='text/plain';

/** The reader-facing reason for a refusal (the engine's codes, as the Preparing page words them), else its message. */
export function queueReason(error,fallback=QUEUE_COPY.failed){
 const code=error?.code,status=error?.status;
 if(code==='offline')return 'No connection. Check your internet and try again.';
 if(code==='signed_out'||status===401)return 'Your Tinct sign-in has expired. Sign in again, then try again.';
 if(code==='account_full')return 'Your account’s storage for books is full.';
 if(code==='file_too_large'||status===413)return 'Files over 50 MB are not saved to your account.';
 const text=String(error?.message||'');
 return text&&!/^[a-z_]+$/.test(text)?text:fallback;
}

/**
 * The queue: `prepare(file,{progress})` resolves {status:'ready'|'skipped'|'failed', reason?, note?, key?}
 * (a throw is a failure with its reason). Files run strictly one after another in the order given;
 * `add` puts more at the end, even while it runs. `onChange(items,item)` after every change,
 * `onSettled(items)` once nothing is left waiting.
 */
export function createQueue(files,{prepare,onChange=()=>{},onSettled=()=>{}}){
 const items=[];let running=null;
 async function loop(){
  // Reads the length each time round: files added while it runs join the end.
  for(let i=0;i<items.length;i++){
   const item=items[i];if(item.status!=='waiting')continue;
   item.status='preparing';item.progress=0;onChange(items,item);
   try{
    const out=await prepare(item.file,{progress:value=>{item.progress=Math.max(item.progress,Number(value)||0);onChange(items,item);}});
    const status=out?.status==='skipped'||out?.status==='failed'?out.status:'ready';
    Object.assign(item,{status,reason:status==='ready'?'':out?.reason||(status==='skipped'?QUEUE_COPY.skipped:QUEUE_COPY.failed),note:out?.note||'',key:out?.key||null});
   }catch(error){Object.assign(item,{status:'failed',reason:queueReason(error)});}
   item.progress=1;onChange(items,item);
  }
  running=null;onSettled(items);
  return items;
 }
 function add(list){
  for(const file of list||[])items.push({file,name:String(file?.name||'Untitled'),status:'waiting',reason:'',note:'',key:null,progress:0});
  onChange(items,null);
  if(!running)running=loop();
  return running;
 }
 add(files);
 return {items,add,get running(){return !!running;},done:()=>running||Promise.resolve(items)};
}

/** Whether this account already has the book here or in the account copies (add-engine.js library/cloud, keyed by kind and SHA). */
async function onShelf(engineApi,key){
 try{if(await engineApi.library?.get?.(key))return true;}catch{/* unknown: not a duplicate */}
 try{return !!engineApi.cloud?.get?.(key);}catch{return false;}
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
// Only what changes what the reader can do next; "Saved to your account." is the ordinary case.
const usefulNote=notes=>notes.filter(text=>text&&text!=='Saved to your account.').pop()||'';
/** A text's own id (its SHA-256 as a UUID), so the same .txt makes the same EPUB and is found on the shelf again. */
async function textUid(plain){
 try{
  const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(plain)));
  const hex=[...hash.slice(0,16)].map(b=>b.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
 }catch{return '';}
}

/**
 * One queued file, through the one-file path's steps. `seen`: keys added earlier in this queue.
 * `authorize`: still allowed (signed in) for this file. Resolves the queue's {status, reason, note, key}.
 */
export async function prepareQueuedFile(engineApi,file,{seen=new Set(),authorize=async()=>true,progress=()=>{}}={}){
 if(!await authorize())return {status:'failed',reason:QUEUE_COPY.signedOut};
 progress(.08);
 if(isTextFile(file))return prepareTextFile(engineApi,file,{seen,progress});
 const read=await engineApi.readFile(file);
 if(read.error)return {status:'failed',reason:read.error};
 if(seen.has(read.key)||await onShelf(engineApi,read.key))return {status:'skipped',reason:QUEUE_COPY.skipped,key:read.key};
 if(!engineApi.rightsConfirmed())return {status:'failed',reason:QUEUE_COPY.rights};
 progress(.3);
 const notes=[];const notify=text=>{notes.push(String(text||''));};
 const {kept}=await keepOwnFile(engineApi,file,read,{notify,progress:value=>progress(.3+.6*value)});
 if(!kept)return {status:'failed',reason:QUEUE_COPY.unkept};
 seen.add(read.key);
 // A PDF chosen on its own is sent to the account from its reader when it opens (reader.js openStored);
 // a queued PDF is not opened, so its copy is sent here, named as preparePdf named it, and bounded the same way.
 if(read.kind==='pdf'&&engineApi.saveToAccount){
  let rec=null;try{rec=await engineApi.library?.get?.(read.key);}catch{/* named by its file */}
  await Promise.race([
   engineApi.saveToAccount(read.key,file,{kind:'pdf',name:file.name,title:rec?.title||'',author:rec?.author||''},{notify}).catch(()=>{}),
   wait(engineApi.ACCOUNT_COPY_WAIT_MS||10000),
  ]);
 }
 progress(1);
 return {status:'ready',key:read.key,note:usefulNote(notes)};
}

/** A .txt file: added as pasted text, as /preparing adds one (no rights step for text), with the paste limits. */
async function prepareTextFile(engineApi,file,{seen,progress}){
 if(file.size>TEXT_MAX_BYTES)return {status:'failed',reason:'This text file exceeds the 50 MB limit.'};
 let plain='';
 try{plain=await file.text();}catch{return {status:'failed',reason:'This text file could not be read.'};}
 if(!plain.trim())return {status:'failed',reason:'This text file is empty.'};
 const tooLong=pasteTooLong(plain);if(tooLong)return {status:'failed',reason:tooLong};
 const cleaned=cleanPaste({plain});
 const title=String(file.name).replace(/\.txt$/i,'').trim()||cleaned.title||'Pasted text';
 const epub=pasteBook({html:cleaned.html,title,author:cleaned.author||'',uid:await textUid(plain)});
 const read=await engineApi.readFile(epub);
 if(read.error)return {status:'failed',reason:read.error};
 if(seen.has(read.key)||await onShelf(engineApi,read.key))return {status:'skipped',reason:QUEUE_COPY.skipped,key:read.key};
 const added=await savePastedText(engineApi,epub,{title,author:cleaned.author||'',progress:value=>progress(.08+.9*value)});
 seen.add(added.key);
 return {status:'ready',key:added.key};
}
