// "Add your own" (approved mockup, Anders 9 Nov 2026: "3 options, upload, insert link, paste text… no extra
// links, keep it clean"): the three equal choices every add flow starts with (the library's pop-up,
// add-to-tinct.js; the signed-out add sheet, own-start.js; /byob, byob.js), and the "Insert link" step.
// Upload opens the file picker (several files go to the queue, one keeps the one-file path); Insert link
// imports an article (own-add.js draftFromLink); Paste text is the paste box (paste-box.js). Only drawing and
// routing here: each caller adds, keeps or hands off what was chosen in its own way.
import {articleUrl} from './paste-text.js?v=20261109add3';

export const ADD_TITLE='Add your own';
export const LINK_COPY={title:'Insert link',label:'Link to an article',add:'Add',back:'Back',invalid:'Enter the address of a web page, such as https://example.com/article.'};
const ICONS={
 upload:'<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 14.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5"/>',
 link:'<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>',
 paste:'<path d="M9 4.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6.5a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="3.5" rx="1"/>',
};
/** The three choices, in their order. */
export const CHOICES=[
 {id:'upload',label:'Upload',line:'PDF, EPUB, text'},
 {id:'link',label:'Insert link',line:'An article online'},
 {id:'paste',label:'Paste text',line:'Any text you copied'},
];
const svg=(paths,cls='')=>`<svg${cls?` class="${cls}"`:''} viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
let ids=0;

/**
 * The choices as buttons (a row of tiles on a desktop, full-width rows on a phone; paste-text.css).
 * `handlers` maps a choice id to what it does; a choice with no handler is left out (Paste text and
 * Insert link where the shared reader is off). The button's name is its label; its short line describes it.
 */
export function choiceList(handlers){
 const list=make('div','add-choices');list.setAttribute('role','group');list.setAttribute('aria-label',ADD_TITLE);
 for(const choice of CHOICES){
  const run=handlers?.[choice.id];if(typeof run!=='function')continue;
  const b=make('button','add-choice');b.type='button';b.dataset.choice=choice.id;
  const n=++ids,label=make('span','add-choice__label',choice.label),line=make('span','add-choice__line',choice.line);
  label.id=`add-choice-${n}`;line.id=`add-choice-${n}-line`;
  b.setAttribute('aria-labelledby',label.id);b.setAttribute('aria-describedby',line.id);
  const icon=make('span','add-choice__icon');icon.innerHTML=svg(ICONS[choice.id]);
  b.append(icon,label,line);
  b.addEventListener('click',()=>run());
  list.append(b);
 }
 return list;
}

/** Where chosen or dropped files go: none, the one-file path, or the queue (own-queue.js). */
export function filesRoute(list){
 const n=[...(list||[])].filter(Boolean).length;
 return n===0?'none':n===1?'one':'several';
}

/**
 * What the link field holds as the address to import: {url} or {error}. A missing "https://" is added
 * (people often copy "example.com/article"); anything else that is not one web address is refused.
 */
export function linkInput(value){
 const t=String(value||'').trim();
 if(!t)return {error:''};
 const url=articleUrl(t)||(!/^[a-z][a-z0-9+.-]*:/i.test(t)&&/^[^\s/]+\.[^\s/.]{2,}(\/\S*)?$/.test(t)?articleUrl('https://'+t):'');
 return url?{url}:{error:LINK_COPY.invalid};
}

/**
 * A paste that is one link and nothing else, as the link to import (or ''). Paste text hands such a
 * paste to Insert link (decision 9 Nov 2026), so a link always shows the step that imports it.
 */
export const pastedLink=({plain='',text=''}={})=>articleUrl(plain)||(!String(plain).trim()?articleUrl(text):'');

/** The back chevron for a step's head (Insert link, Paste text): back to the three choices. */
export function backButton(onBack,cls='add-own-back'){
 const b=make('button',cls);b.type='button';b.setAttribute('aria-label',LINK_COPY.back);
 b.innerHTML=svg('<path d="m15 5-7 7 7 7"/>');
 b.addEventListener('click',()=>onBack());
 return b;
}

/**
 * The "Insert link" form: one field labelled "Link to an article" and an Add button (disabled while
 * empty). `onSubmit(url)` gets a checked address; a wrong one shows why under the field.
 * Returns {el, input, add, alert, show(message), busy(on), focus()}.
 */
export function linkForm({value='',message='',onSubmit,inputClass='',buttonClass='',actionsClass=''}){
 const el=make('form','add-link');el.noValidate=true;
 const n=++ids;
 const label=make('label','add-link__label',LINK_COPY.label);label.htmlFor=`add-link-${n}`;
 const input=make('input',`add-link__input${inputClass?' '+inputClass:''}`);input.id=label.htmlFor;
 Object.assign(input,{type:'url',inputMode:'url',autocomplete:'url',spellcheck:false,placeholder:'https://',value:String(value||'')});
 input.setAttribute('autocapitalize','off');
 const alert=make('p','own-link-error',message);alert.setAttribute('role','alert');
 const add=make('button',`add-link__add${buttonClass?' '+buttonClass:''}`,LINK_COPY.add);add.type='submit';
 const actions=make('div',`add-link__actions${actionsClass?' '+actionsClass:''}`);actions.append(add);
 el.append(label,input,alert,actions);
 let busy=false;
 const sync=()=>{add.disabled=busy||!input.value.trim();};
 input.addEventListener('input',()=>{alert.textContent='';sync();});
 el.addEventListener('submit',event=>{
  event.preventDefault();
  if(add.disabled)return;
  const read=linkInput(input.value);
  if(!read.url){alert.textContent=read.error||LINK_COPY.invalid;input.focus();return;}
  input.value=read.url;
  onSubmit?.(read.url);
 });
 sync();
 return {el,input,add,alert,
  show:text=>{alert.textContent=text||'';},
  busy:on=>{busy=!!on;input.readOnly=busy;sync();},
  focus:()=>{input.focus({preventScroll:true});try{input.setSelectionRange(input.value.length,input.value.length);}catch{/* type=url */}},
 };
}
