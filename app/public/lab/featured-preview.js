import { LAB_CATALOGUE_URL, popularBooks, listableBooks, bookDescription, catalogueLengthLine } from '/lab/library-model.js?v=20260921-preview'
const reel=document.querySelector('.reel')
const captions=document.querySelector('.captions')
const status=document.querySelector('[role=status]')
const reduced=matchMedia('(prefers-reduced-motion:reduce)')
let books=[],buttons=[],panels=[],selected=-1,frame=0,drag=null,suppressClick=false
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
function centre(i, smooth=true){
 const button=buttons[Math.max(0,Math.min(i,buttons.length-1))]
 if(!button)return
 reel.scrollTo({left:button.offsetLeft+button.offsetWidth/2-reel.clientWidth/2,behavior:smooth&&!reduced.matches?'smooth':'instant'})
}
function paint(){
 frame=0
 const middle=reel.scrollLeft+reel.clientWidth/2
 let closest=0,distance=Infinity
 buttons.forEach((button,i)=>{
  const delta=(button.offsetLeft+button.offsetWidth/2-middle)/(button.offsetWidth+parseFloat(getComputedStyle(reel).gap))
  const depth=Math.min(Math.abs(delta),2)
  button.style.setProperty('--turn',Math.max(-12,Math.min(12,-delta*8))+'deg')
  button.style.setProperty('--scale',String(1-depth*.09))
  button.style.setProperty('--lift',depth*9+'px')
  button.style.setProperty('--opacity',String(1-depth*.19))
  if(Math.abs(delta)<distance){distance=Math.abs(delta);closest=i}
 })
 if(closest===selected)return
 selected=closest
 buttons.forEach((button,i)=>button.setAttribute('aria-current',String(i===selected)))
 panels.forEach((panel,i)=>{panel.classList.toggle('active',i===selected);panel.inert=i!==selected;panel.setAttribute('aria-hidden',String(i!==selected))})
 document.querySelector('.position').textContent=String(selected+1).padStart(2,'0')+' / '+String(books.length).padStart(2,'0')
 document.querySelector('[data-step="-1"]').disabled=selected===0
 document.querySelector('[data-step="1"]').disabled=selected===books.length-1
 document.querySelector('.atmosphere').style.setProperty('--glow',books[selected].cover?.background||'#4d5450')
 status.textContent=books[selected].title+', '+(selected+1)+' of '+books.length
}
function requestPaint(){if(!frame)frame=requestAnimationFrame(paint)}
reel.addEventListener('scroll',requestPaint,{passive:true})
document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>centre(selected+Number(button.dataset.step))))
reel.addEventListener('keydown',event=>{
 const target=event.key==='ArrowRight'?selected+1:event.key==='ArrowLeft'?selected-1:event.key==='Home'?0:event.key==='End'?books.length-1:null
 if(target!==null){event.preventDefault();centre(target)}
})
// Touch stays native: momentum, direction locking and vertical page scrolling.
// Only mouse drag is enhanced; a drag must never activate a cover.
reel.addEventListener('pointerdown',event=>{
 if(event.pointerType!=='mouse'||event.button!==0)return
 drag={id:event.pointerId,x:event.clientX,left:reel.scrollLeft,moved:false}
})
reel.addEventListener('pointermove',event=>{
 if(!drag||event.pointerId!==drag.id)return
 const dx=event.clientX-drag.x
 if(!drag.moved&&Math.abs(dx)<5)return
 if(!drag.moved){drag.moved=true;reel.setPointerCapture(event.pointerId);reel.classList.add('dragging')}
 reel.scrollLeft=drag.left-dx
})
function finish(event){
 if(!drag||event.pointerId!==drag.id)return
 const moved=drag.moved;drag=null;reel.classList.remove('dragging')
 if(moved){suppressClick=true;paint();centre(selected);setTimeout(()=>suppressClick=false,0)}
}
reel.addEventListener('pointerup',finish)
reel.addEventListener('pointercancel',finish)
reel.addEventListener('lostpointercapture',event=>{if(event.target===reel)finish(event)})
reel.addEventListener('click',event=>{
 if(suppressClick){event.preventDefault();return}
 const button=event.target.closest('.book')
 if(button)centre(Number(button.dataset.index))
})
reel.addEventListener('dragstart',event=>event.preventDefault())
let resizeFrame
new ResizeObserver(()=>{
 cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(selected>=0)centre(selected,false);requestPaint()})
}).observe(reel)
try{
 const response=await fetch(LAB_CATALOGUE_URL)
 if(!response.ok)throw Error('Catalogue unavailable')
 const catalogue=await response.json()
 const byId=new Map(listableBooks(catalogue).map(book=>[book.id,book]))
 books=['the-prince','meditations','frankenstein','notes-from-underground','jekyll-and-hyde','the-manual'].map(id=>byId.get(id)).filter(book=>book?.art?.src)
 if(books.length<3)books=popularBooks(catalogue,8)
 if(!books.length)throw Error('No featured books')
 // Start within the row, so both directions are visibly available.
 const initial=Math.max(0,books.findIndex(book=>book.id==='notes-from-underground'))
 reel.innerHTML=books.map((book,i)=>'<button class="book" data-index="'+i+'" aria-label="'+escape(book.title)+'" aria-current="false"><img draggable="false" src="'+escape(book.art.src)+'" alt="" width="400" height="600"></button>').join('')
 captions.innerHTML=books.map(book=>{
  const length=catalogueLengthLine(book.wordCount)
  return '<article class="caption" aria-hidden="true" inert><p class="author">'+escape(book.author)+'</p><h2>'+escape(book.title)+'</h2><p class="readtime" title="'+escape(length?.ariaLabel||'')+'">'+escape(length?.value||'Reading estimate unavailable')+'</p><p class="description">'+escape(bookDescription(book))+'</p><a class="open-book" target="_top" href="/library?view=book-detail&amp;book='+encodeURIComponent(book.id)+'">Open book <span aria-hidden="true">↗</span></a></article>'
 }).join('')
 buttons=[...reel.querySelectorAll('.book')];panels=[...captions.children]
 await document.fonts.ready
 centre(initial,false);paint()
 document.documentElement.dataset.ready='true'
}catch(error){document.querySelector('.error').hidden=false;document.querySelector('.featured').hidden=true;console.error(error)}

document.querySelector('#retry').addEventListener('click',()=>parent.location.reload())
