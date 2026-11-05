// Adding your own text or file to the account: the one path shared by the library's "Your own book"
// pop-up (add-to-tinct.js) and the Preparing page after /byob and sign-in (/preparing, preparing.js),
// so a text or file is checked, kept, saved and opened the same way wherever it was chosen.
// No page UI here: callers draw progress and messages.
import {pasteEpub} from './paste-text.js?v=20261105flow';

// ---- The engines, loaded on first use ----
const ENGINE='/lab/library-add.js?v=20261014talkwake';let engine=null;
/** The library's own-books engine (src/libraryAdd.ts): Premium or the trial (canAdd), own books, PDF assessment. */
export function addEngine(){
 if(!engine)engine=import(/* @vite-ignore */ENGINE).then(()=>{if(!window.__tinctLibraryAdd)throw new Error('add engine unavailable');return window.__tinctLibraryAdd;});
 engine.catch(()=>{engine=null;});
 return engine;
}
// Add a book's engine (/lab/addbook/js/add-engine.js, with tinct-api.js and epub.js): reading, keeping and saving a file.
const FILE_ENGINE=['/lab/addbook/js/tinct-api.js?v=20261023paste1','/lab/addbook/js/epub.js','/lab/addbook/js/add-engine.js?v=20261029titles1'];
function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=()=>resolve();script.onerror=()=>reject(new Error('could not load '+src));document.head.append(script);});}
let fileEngine=null;
/** Add a book's engine on this page (window.TinctAddEngine), loaded on first use. */
export function loadFileEngine(load=loadScript){
 if(window.TinctAddEngine&&window.TinctAI&&window.TinctEpub)return Promise.resolve(window.TinctAddEngine);
 if(!fileEngine){fileEngine=Promise.all(FILE_ENGINE.map(src=>load(src))).then(()=>{if(!window.TinctAddEngine)throw new Error('add engine unavailable');return window.TinctAddEngine;});fileEngine.catch(()=>{fileEngine=null;});}
 return fileEngine;
}

// ---- Pasted text ----
/** Readable size only: larger pastes take too long to lay out (29 Oct 2026: 250k characters opens in about 3.5 s on desktop, 8 s on phone). */
export const PASTE_MAX_CHARS=240000;
/** The refusal for a text over the limit, or ''. `text` is what the box shows. */
export function pasteTooLong(text){
 const chars=String(text).length;if(chars<=PASTE_MAX_CHARS)return '';
 return `This text is too long to paste: ${(String(text).match(/\S+/g)||[]).length.toLocaleString('en-US')} words, ${chars.toLocaleString('en-US')} characters. The limit is ${PASTE_MAX_CHARS.toLocaleString('en-US')} characters (about 40,000 words). Trim it, or save it as an EPUB or PDF and add the file.`;
}
/** The pasted text as the EPUB that is added: the box's cleaned HTML, its title and byline. Throws the reader-facing message. */
export function pasteBook({html,title,author='',uid=''}){
 const file=pasteEpub({source:html,format:'html',title:String(title||'').trim()||'Pasted text',author,uid});
 if(file.size>50*1024*1024)throw new Error('This text exceeds the private book size limit. Trim it before adding.');
 return file;
}
/** Where a pasted text opens: the Tinct reader, as My shelf opens it. */
export const pastedReaderHref=key=>'/reader?userBook='+encodeURIComponent(String(key).slice(String(key).indexOf(':')+1))+'&sharedReader=1';
/**
 * Save a pasted text's EPUB to the account and keep it here; resolves {key, account, href}.
 * Parsed with the real EPUB engine before the account object is made, so a malformed package is
 * never saved while the page says it failed. Account persistence is required: an offline or refused
 * upload throws, and the caller keeps the text. `account` (a confirmed earlier upload of the same
 * bytes) is reused on a retry. No rights step for pasted text (approved 5 Nov 2026); a confirmation
 * the account already gave still travels with it.
 */
export async function savePastedText(engineApi,file,{title,author='',account=null,progress=()=>{},onAccount=()=>{}}){
 const read=await engineApi.readFile(file);if(read.error)throw new Error(read.error);
 progress(.3);
 await engineApi.prepareEpub(read.bytes,file.name,read.key,null);
 const saved=account||await window.TinctAI.books.upload(file,{kind:'epub',name:file.name,title:String(title).trim(),author:String(author).trim(),rights:engineApi.store.get('rights:'+engineApi.accountId())});
 if(!saved?.id||saved.sha256?.slice(0,24)!==read.key.slice(5))throw new Error('The account could not confirm this book. Try again.');
 onAccount(saved);
 engineApi.cloud.mine().set(read.key,saved);
 progress(.7);
 if(await engineApi.keepFile(file,read,String(title).trim()))await engineApi.library.touch(read.key,{cloudId:saved.id});
 // Validation and metadata use the same EPUB path as a selected private file.
 await engineApi.prepareEpub(read.bytes,file.name,read.key,null);
 progress(1);
 return {key:read.key,account:saved,href:pastedReaderHref(read.key)};
}

// ---- A chosen PDF or EPUB ----
/**
 * Keep a read file in this browser and make it ready to open: {kept:false} when this browser cannot
 * keep it (the caller hands it to Add a book's PDF reader), else {kept:true, opened:{href, …}}.
 * An EPUB's account copy is sent here (bounded); a PDF's from its reader.
 */
export async function keepOwnFile(engineApi,file,read,{notify=()=>{},progress=()=>{}}={}){
 const kept=await engineApi.keepFile(file,read);
 if(!kept)return {kept:false};
 progress(.6);
 const opened=read.kind==='epub'?await engineApi.prepareEpub(read.bytes,file.name,read.key,file,{notify}):await engineApi.preparePdf(file,read.key,{notify});
 progress(1);
 return {kept:true,opened};
}

// ---- "Added to your shelf", once, in the reader the book opens in (/lab/added-toast.js) ----
export const ADDED_KEY='tinct:added-to-shelf';
export function noteAdded(key){
 try{sessionStorage.setItem(ADDED_KEY,JSON.stringify({hex:String(key).slice(String(key).indexOf(':')+1),at:Date.now()}));}catch{/* private mode: no toast */}
}
