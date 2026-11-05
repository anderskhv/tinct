// The paste box (approved paste-flow mockups 01 and 02, 5 Nov 2026), shared by the library's
// "Your own book" pop-up and /byob: the title is the heading, edited in place; one line under it
// (the byline found, the word count); one text box showing the CLEANED text right after a paste
// (paste-text.js cleanPaste: the site's menus, counters and paywall lines already gone), so what
// you see is what is added. The box is editable; what it holds is sanitised again when added.
import {cleanPaste,preview,sanitizeHtml,wordCount,htmlText} from './paste-text.js?v=20261105flow';

const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const PENCIL='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/></svg>';
const editable=el=>{try{el.contentEditable='plaintext-only';}catch{/* older engines */}if(el.contentEditable!=='plaintext-only')el.contentEditable='true';};

/**
 * Build the paste box. `heading` is the element the title sits in (the dialog's h2, or a div on /byob).
 * Returns {title, meta, wrap, box, read(), restore(draft), empty(), focus(), onChange(fn)}.
 */
export function pasteBox({heading=make('div'),placeholder='Paste text',boxLabel='Text to add'}={}){
 heading.classList.add('paste-title');heading.replaceChildren();
 const title=make('span','paste-title__text');editable(title);title.setAttribute('role','textbox');title.setAttribute('aria-label','Title');title.dataset.placeholder=placeholder;title.spellcheck=false;
 const pencil=make('span','paste-title__pencil');pencil.innerHTML=PENCIL;
 heading.append(title,pencil);
 const meta=make('p','paste-meta');meta.hidden=true;
 const box=make('div','paste-box own-paste-source');box.contentEditable='true';box.setAttribute('role','textbox');box.setAttribute('aria-multiline','true');box.setAttribute('aria-label',boxLabel);box.dataset.placeholder='Paste your text here';
 const wrap=make('div','paste-wrap');wrap.append(box);
 let author='',titleEdited=false;const listeners=[];
 const changed=()=>{
  const words=empty()?0:wordCount(box.innerHTML);
  meta.textContent=[author,words?`${words.toLocaleString('en-US')} ${words===1?'word':'words'}`:''].filter(Boolean).join(' · ');
  meta.hidden=!meta.textContent;heading.dataset.empty=title.textContent.trim()?'false':'true';
  for(const fn of listeners)fn();
 };
 function empty(){return !htmlText(box.innerHTML);}
 function show({html,title:found,author:by}){
  box.innerHTML=html;
  if(!titleEdited||!title.textContent.trim()){title.textContent=found||'';titleEdited=false;}
  if(by)author=by;
  changed();box.scrollTop=0;
 }
 // A paste: the clipboard's HTML (or text) cleaned before it is shown. Into an empty box it is the
 // whole text, its title and byline found; into a box with text it goes in at the caret, cleaned.
 box.addEventListener('paste',event=>{
  const html=event.clipboardData?.getData('text/html')||'',plain=event.clipboardData?.getData('text/plain')||'';
  if(!html.trim()&&!plain.trim())return;
  event.preventDefault();
  if(empty()){let cleaned;try{cleaned=cleanPaste({html,plain});}catch{return;}show(cleaned);return;}
  let fragment;try{fragment=html.trim()?preview(html,'html'):preview(plain,'auto');}catch{return;}
  if(!(document.execCommand&&document.execCommand('insertHTML',false,fragment)))box.insertAdjacentHTML('beforeend',fragment);
  changed();
 });
 box.addEventListener('input',()=>{if(empty()){box.replaceChildren();if(!titleEdited)title.textContent='';author='';}changed();});
 title.addEventListener('input',()=>{titleEdited=!!title.textContent.trim();if(title.textContent.length>200)title.textContent=title.textContent.slice(0,200);changed();});
 title.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();box.focus({preventScroll:true});}});
 title.addEventListener('paste',event=>{const text=event.clipboardData?.getData('text/plain');if(text==null)return;event.preventDefault();const clean=text.replace(/\s+/g,' ').trim();if(!(document.execCommand&&document.execCommand('insertText',false,clean)))title.textContent=(title.textContent+clean).slice(0,200);changed();});
 pencil.addEventListener('click',()=>{title.focus();const range=document.createRange();range.selectNodeContents(title);range.collapse(false);const sel=getSelection();sel?.removeAllRanges();sel?.addRange(range);});
 changed();
 return {
  title,meta,wrap,box,empty,
  /** What is added: the box's text sanitised (and cleaned again: the same text comes out the same), its title and byline. */
  read:()=>({html:sanitizeHtml(box.innerHTML).trim(),title:title.textContent.replace(/\s+/g,' ').trim(),author,text:htmlText(box.innerHTML)}),
  /** Show a kept draft again ({html, title, author}), as the reader left it. */
  restore:draft=>{if(!draft)return;titleEdited=!!draft.title;title.textContent=draft.title||'';author=draft.author||'';box.innerHTML=sanitizeHtml(String(draft.html||''));changed();},
  /** Show text as if just pasted (a .txt file chosen in the pop-up). */
  showPasted:(plain,fallbackTitle='')=>{const cleaned=cleanPaste({plain});show({...cleaned,title:cleaned.title||fallbackTitle});},
  focus:()=>box.focus({preventScroll:true}),
  onChange:fn=>listeners.push(fn),
 };
}
