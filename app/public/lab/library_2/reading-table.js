// Returning readers: the hero becomes a reading table with the reader's own
// books. Data and rules come from the production library
// (/lab/library-2-reading.js, src/libraryTwoReading.ts); this file only draws.
//
// The books are real 3D boxes (cover, spine, head, fore-edge, back) standing
// on one table line under one camera. The book being read is pulled out and
// turned to face the reader; the others stand spine-out beside it. Changing
// book moves every box in one transition, so nothing is ever stretched. Each
// box takes its own cover's shape (bookBox), so no cover is squeezed or cropped.
import { readingApi, loadCatalogueData } from './catalogue.js?v=20261012ownshelf';
import { coverAsset } from './cover-assets.js?v=20261009owncover';
import { paintedCoverAt } from '../book-cover.js?v=20261009owncover';

import {renderBookMetadata} from './book-metadata.js?v=20261009rel10';
import { hasPaperSpine, hasStoredSpineTone } from './spine.js?v=20261009rel10';
import { fitHeroTitle } from './hero-title.js?v=20261009rel10';
import { COVER_ASPECT } from './table-window.js?v=20261009cover';
import { depthRatio, tableFit, tableLayout, bookStyle } from './table-layout.js?v=20261012ownshelf';
import { SPINE_TEXTURES, bindingFor, percentLabel, bookCover, deskCover, tableUrl, DESK_COVER_PX, markup, esc } from './reading-table-markup.js?v=20261012ownshelf';
import { LEAVE_MS, MOVE_MS, MOVE_EASE, fadeOut } from './shelf-motion.js?v=20261009cover';
import { diagLog, diagTime, diagState, diagOn } from './table-diag.js?v=20261012ownshelf';
import { FIRST_PAINT_KEY, deskRecord, keepShownOrder, sameOrder, PLACEHOLDER_CLASS } from './reading-table-first-paint.js?v=20261012ownshelf';

const $ = id => document.getElementById(id);
const CACHE_KEY = 'tinct-library-2-reading-table';
const isDemo = new URLSearchParams(location.search).get('demo') === 'reading';
// Start the account-safe read alongside app setup, before the scene and shelves
// are built. Never draw the old unscoped cache while the viewer is unresolved.
const cachedListeners=new Set();let cachedTable=null;
const loadTable = async () => {
  const catalogue = loadCatalogueData();
  // The public catalogue and engine download in parallel. Handle a catalogue
  // failure immediately even when the engine itself is still downloading.
  catalogue.catch(() => {});
  const api = await readingApi();
  return { api, table: await api.loadReadingTable({ catalogue, onCached: table=>{cachedTable=table;cachedListeners.forEach(fn=>fn(table,api));}, onArtwork: books => books.slice(0,13).forEach(book => prepareArtwork(book)) }) };
};
const firstTable = window.__library2Boot?.hint && !isDemo ? loadTable().then(value => ({ value }), error => ({ error })) : null;

// Retain decoded spine images so CSS can paint them with the covers in one pass.
const readyTextures = new Map();
function prepareTexture(name) {
  if (!SPINE_TEXTURES) return Promise.resolve();
  if (!readyTextures.has(name)) {
    const img = new Image();
    img.decoding = 'async';
    img.src = `assets/spines/spine-${name}.jpg`;
    const ready = img.decode().then(() => img, () => { readyTextures.delete(name); return null; });
    readyTextures.set(name, ready);
  }
  return readyTextures.get(name);
}

// Sample shelf for ?demo=reading, so the view can be seen on a device with no reading history.
const DEMO = {
  mode: 'returning',
  reading: [
    { bookId: 'crime-and-punishment', title: 'Crime and Punishment', cover: '/covers/v2/crime-and-punishment.webp', wordCount: 211000, tone: '#2a2622', chapterLabel: 'Part One · Chapter 4', headline: 'You’re in the middle of Part One, Chapter 4', percent: 18, recap: 'Raskolnikov has read his mother’s letter: Dunya is to marry the calculating Luzhin to secure his future. Furious at the sacrifice, he wanders the city and, on the boulevard, tries to protect a drunk young girl from a man following her.' },
    { bookId: 'frankenstein', title: 'Frankenstein', cover: '/covers/v2/frankenstein.webp', wordCount: 75000, tone: '#0a1a0a', chapterLabel: 'Chapter 7', headline: 'You’re in the middle of Chapter 7', percent: 42, recap: 'Victor returns to Geneva after William’s murder. In the storm near Plainpalais he glimpses the creature and becomes certain it is the killer — but Justine, the family’s servant, has been accused and will stand trial.' },
    { bookId: 'meditations', title: 'Meditations', cover: '/covers/v2/meditations.webp', wordCount: 45000, tone: '#14243a', chapterLabel: 'Book Four', headline: 'You’re at the start of Book Four', percent: 63, recap: null },
    { bookId: 'hamlet', title: 'Hamlet', cover: '/covers/v2/hamlet.webp', wordCount: 30000, tone: '#1c1c20', chapterLabel: 'Act 1, Scene 3', headline: 'You’re in the middle of Act 1, Scene 3', percent: 12, recap: null },
    { bookId: 'odyssey', title: 'The Odyssey', cover: '/covers/v2/odyssey.webp', wordCount: 120000, tone: '#1a2638', chapterLabel: 'Book Two', headline: 'You’re at the start of Book Two', percent: 8, recap: null },
  ],
  finished: [
    { bookId: 'pride-and-prejudice', title: 'Pride and Prejudice', cover: '/covers/v2/pride-and-prejudice.webp', finishedAt: Date.now() - 40 * 864e5 },
    { bookId: 'the-prince', title: 'The Prince', cover: '/covers/v2/the-prince.webp', finishedAt: Date.now() - 120 * 864e5 },
  ],
};

/** Average colour of a cover's artwork (same-origin image), sampled once. */
const toneCache = new Map();
function coverTone(img) {
  if (toneCache.has(img.src)) return toneCache.get(img.src);
  try {
    const c = document.createElement('canvas'); c.width = 12; c.height = 18;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, 12, 18);
    const d = x.getImageData(0, 0, 12, 18).data; let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { const w = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) + 8; r += d[i] * w; g += d[i + 1] * w; b += d[i + 2] * w; n += w; }
    const hex = '#' + [r, g, b].map(v => Math.round(v / n).toString(16).padStart(2, '0')).join('');
    toneCache.set(img.src, hex);
    return hex;
  } catch { return null; }
}
// Warm the resolved viewer's covers during cloud reconciliation. This retains
// decoded public images only, never a personal shelf snapshot or reading data.
const readyArtwork = new Map();
function prepareArtwork(book) {
  const cover = deskCover(book);
  const key = cover || book.bookId;
  if (!readyArtwork.has(key)) {
    const img = new Image();
    img.decoding = 'async';
    img.fetchPriority = 'high';
    const [estimatedName] = bindingFor(book);
    const texture = prepareTexture(estimatedName);
    const ready = (async () => {
      if (cover) { img.src = cover; try { await img.decode(); } catch {} }
      // An added book's painting has its spine tone stored with it (its left edge); others are sampled here.
      const tone = hasStoredSpineTone(book) ? book.tone : img.naturalWidth ? coverTone(img) : null;
      const [name, colour] = bindingFor(tone ? { ...book, tone } : book);
      await (name === estimatedName ? texture : prepareTexture(name));
      return { img, name, colour };
    })();
    readyArtwork.set(key, ready);
  }
  return readyArtwork.get(key);
}

// An own book's cover is kept up to 900 px wide for its reader (ownShelf.ts OWN_COVER_MAX_WIDTH);
// the table draws it at the desk's size like Tinct's covers (DESK_COVER_PX), once per picture,
// as a blob: URL (reading-table-markup.js tableUrl): never the picture's text in the book's style.
const tableCovers = new Map();
function tableCover(src) {
  if (typeof src !== 'string' || !/^(data:image\/|blob:)/.test(src)) return Promise.resolve(src);
  if (!tableCovers.has(src)) tableCovers.set(src, (async () => {
    const started = performance.now();
    const full = diagTime('own cover: to blob', () => tableUrl(src), true);
    const img = new Image(); img.decoding = 'async'; img.src = full;
    try { await img.decode(); } catch { return full; }
    if (!img.naturalWidth || img.naturalWidth <= DESK_COVER_PX) return full;
    const canvas = document.createElement('canvas');
    canvas.width = DESK_COVER_PX; canvas.height = Math.max(1, Math.round(img.naturalHeight * DESK_COVER_PX / img.naturalWidth));
    try { canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height); } catch { return full; }
    const blob = await new Promise(resolve => { try { canvas.toBlob(resolve, 'image/jpeg', .88); } catch { resolve(null); } });
    keepOwnThumb(src, img);
    diagLog(`own cover: ${img.naturalWidth}x${img.naturalHeight} -> ${canvas.width}x${canvas.height} in ${(performance.now() - started).toFixed(0)}ms`);
    return blob ? URL.createObjectURL(blob) : full;
  })());
  return tableCovers.get(src);
}
// The small copy the next visit's first paint (boot.js ownThumb) draws: 120 px wide, a few
// kilobytes, on this device only (cleared with the rest of tinct:* at sign-out).
const OWN_THUMB_KEY = 'tinct:library-2-own-thumb:';
const thumbFor = new Map();
function keepOwnThumb(src, img) {
  const bookId = thumbFor.get(src);
  if (!bookId || !img.naturalWidth) return;
  try {
    const c = document.createElement('canvas'); c.width = 120; c.height = Math.max(1, Math.round(img.naturalHeight * 120 / img.naturalWidth));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const thumb = c.toDataURL('image/jpeg', .7);
    if (thumb.length < 40000) localStorage.setItem(OWN_THUMB_KEY + bookId, thumb);
  } catch { /* private mode, storage full */ }
}
// The book's face and reflection take one picture.
function wearCover(box, img, cover) {
  if (!cover || img.getAttribute('src') === cover) return;
  img.src = cover; box.style.setProperty('--cover', `url('${cover}')`);
}

const monthName = at => (at ? new Date(at).toLocaleString('en', { month: 'long' }) : null);

const PHONE_DOTS_FROM = 5;

function writeCache(table) {
  try {
    if (table.mode === 'returning' && table.reading.length) localStorage.setItem(CACHE_KEY, JSON.stringify({ mode: 'returning' }));
    else localStorage.removeItem(CACHE_KEY);
  } catch { /* private mode */ }
}

export async function mountReadingTable({ hero, shelves, el }) {
  const demo = isDemo;
  const root = document.documentElement;
  let api = null, view = null, table = null;
  const settle = () => root.classList.remove('returning-pending');

  const render = async (next, keepBookId) => {
    table = next;
    window.__library2Reading = table;
    window.dispatchEvent(new CustomEvent('library2:reading', { detail: table }));
    shelves.querySelector('.finished-shelf')?.remove();
    if (table.finished.length) addFinishedShelf(table.finished, shelves, el);
    view?.remove();
    view = null;
    if (table.mode !== 'returning' || !table.reading.length) { root.classList.remove('returning'); return; }
    root.classList.add('returning');
    view = document.createElement('div');
    view.className = 'reading-table is-preparing';
    view.setAttribute('aria-busy', 'true');
    view.innerHTML = markup(table);
    hero.append(view);
    view.api = api;
    await wire(view, table, demo, keepBookId);
    // Reveal decoded covers and their final bindings together, never bare boxes
    // followed by late artwork. The leaf faces fade without flattening the 3D row.
    view.classList.replace('is-preparing', 'is-ready');
    document.documentElement.classList.remove('returning-scene-pending');
    view.removeAttribute('aria-busy');
  };

  if (demo) { await render(DEMO); settle(); return true; }
  // Resolve the production account before showing personal books or summaries.
  // The old unscoped cache must never paint a previous account's shelf.
  try {
    const early = firstTable ? await firstTable : null;
    if (early?.error) throw early.error;
    const result = early?.value || await loadTable();
    api = result.api;
    writeCache(result.table);
    await render(result.table, view?.dataset.current);
  } catch {
    await render({ mode: 'new', reading: [], finished: [] });
  }
  settle();
  return root.classList.contains('returning');
}

// The shown book's cover and spine texture, remembered for boot.js to fetch with the next
// visit's page (reading-table-first-paint.js): public URLs and this account's id, never an
// own book's cover (a data: URL kept on this device) and nothing about the reading.
function viewerId() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!/^sb-.*-auth-token$/.test(key || '')) continue;
      const id = JSON.parse(localStorage.getItem(key) || 'null')?.user?.id;
      if (typeof id === 'string' && id) return id;
    }
  } catch { /* no storage */ }
  return null;
}
function rememberFirstPaint(view, table) {
  if (isDemo || !view.isConnected || !view.classList.contains('is-ready')) return;
  try {
    const record = deskRecord(table, view, viewerId(), deskCover, view.parentElement);
    if (record) localStorage.setItem(FIRST_PAINT_KEY, JSON.stringify(record)); else localStorage.removeItem(FIRST_PAINT_KEY);
  } catch { /* private mode */ }
}
// The desk changes after its reveal (a book chosen, fresh facts, a resize): the record follows
// once the row has settled, so the next visit's placeholder is the desk as it was last seen.
let rememberTimer = 0;
function rememberFirstPaintSoon(view, table) {
  clearTimeout(rememberTimer);
  rememberTimer = setTimeout(() => rememberFirstPaint(view, table), 1000);
}

/** The retained time-of-day table, sharing the shelf's account-safe loader. */
export function createReadingTable(hero,{table,prepareCover,onOpen,onError,summaryFor,onSelection,onRemoveReading,initial,enabled}) {
 let view=null,currentTable=null;
 function render(next,{instant=false}={}){
  diagLog(`render ${next.reading.length} books${currentTable?` (shown ${currentTable.reading.length})`:''}`);
  // A book (or more) taken off the table: it fades away and the others glide into place,
  // with the same table, never a fresh one that starts again at the first book.
  if(currentTable&&view?.removeBooks&&next.reading.length&&next.reading.length<currentTable.reading.length){
   const ids=currentTable.reading.map(b=>b.bookId),kept=next.reading.map(b=>b.bookId);let at=0;
   for(const id of ids)if(id===kept[at])at++;
   if(at===kept.length){view.removeBooks(ids.filter(id=>!kept.includes(id)),{instant:instant||!enabled?.()||view.hidden||view.checkVisibility?.()===false});}
  }
  // The same books in another order: the first paint led with the book just left
  // (the device's snapshot), the account read orders by last activity. The row the
  // reader is looking at keeps its order; the fresh facts land in place (2026-10-10).
  if(currentTable)next=keepShownOrder(currentTable,next);
  if(currentTable&&sameOrder(currentTable.reading,next.reading)){
   next.reading.forEach((b,i)=>{
    // An own book's cover arrives with the fresh read (the fast-paint snapshot keeps none).
    const before=bookCover(currentTable.reading[i]);Object.assign(currentTable.reading[i],b);const after=bookCover(currentTable.reading[i]);
    if(after&&after!==before){const shown=view;tableCover(after).then(cover=>{if(view!==shown)return;const box=shown.querySelector(`.rt-b[data-i="${i}"]`),img=box?.querySelector('.rt-front img');if(img)wearCover(box,img,cover);});}
   });diagLog('render: same books, refreshed in place');view.refresh();return;
  }
  const selected=view?.dataset.current||initial?.bookId;
  // Another table (a book added): prepared behind the one shown, which leaves in the
  // frame the new one is revealed, so the desk never blinks to bare boxes (2026-10-10).
  diagLog('render: a new table is prepared');currentTable={...next,reading:next.reading.map(b=>({...b}))};
  view=document.createElement('div');view.className='reading-table is-preparing';view.innerHTML=markup(currentTable);hero.append(view);
  view.api=summaryFor?{summaryFor}:null;
  const active=view;wire(active,currentTable,false,selected,{prepareCover,onOpen,onError,onSelection,onRemoveReading,onLayout:()=>rememberFirstPaintSoon(active,currentTable)}).then(()=>{
   if(!active.isConnected)return;
   if(view!==active){active.dispose?.();active.remove();return;}
   for(const other of hero.querySelectorAll('.reading-table')){
    if(other===active)continue;
    // The first paint's placeholder (boot.js) stands under this table, book for book, and leaves
    // only once the table's faces have arrived over it (styles.css table-arrive), never before.
    if(other.classList.contains(PLACEHOLDER_CLASS)){setTimeout(()=>other.remove(),matchMedia('(prefers-reduced-motion: reduce)').matches?0:320);continue;}
    other.dispose?.();other.remove();
   }
   active.classList.replace('is-preparing','is-ready');document.documentElement.classList.remove('returning-scene-pending');
   rememberFirstPaint(active,currentTable);
  });
 }
 render(table);
 document.addEventListener('keydown',e=>{
  if(!enabled()||view.querySelector('dialog[open]')||e.defaultPrevented||!['ArrowLeft','ArrowRight'].includes(e.key)||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
  if(e.target!==document.body&&e.target!==document.documentElement&&!view.contains(e.target))return;
  if(e.target.closest?.('input,textarea,select,[contenteditable]'))return;
  e.preventDefault();view.querySelector(e.key==='ArrowRight'?'#rt-next':'#rt-prev').click();
 });
 return {update(next,_saved,_catalogue,options){if(next.reading.length){const was=view.hidden;view.hidden=false;render(next,{instant:was||!!options?.instant});}else{view.dispose?.();view.hidden=true;currentTable=null;}},focus(){},get selected(){return view?.dataset.current;}};
}

function wire(view, table, demo, keepBookId, options={}) {
  // This table's own parts: while a fresh table is prepared behind the shown one, both exist.
  const $ = id => view.querySelector('#' + id);
  const stage = $('rt-stage'), row = $('rt-row');
  const books = [...row.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = Math.max(0, table.reading.findIndex(b => b.bookId === keepBookId));
  if (!keepBookId) current = 0;
  const dots = [...view.querySelectorAll('#rt-dots button')];
  // With this many books some step off a phone's table: there the dots are the way to them too
  // (fixed by count, so the stage's height never depends on its own layout).
  view.classList.toggle('has-many', books.length >= PHONE_DOTS_FROM);
  let turn = 1, H = 0, stageW = 0, summaryTimer = null, swapTimer = null, shown = -1, moveMs = 0, moveTimer = 0;
  // Each book is as wide as its own cover (naturalWidth / naturalHeight, held to bookBox's
  // bounds), never a fixed 2:3 box: The Beginning of Infinity's 1600×2560 EPUB cover lost
  // "THE" and "DEUTSCH" to object-fit: cover in one (Anders, 2026-10-09). A cover read later
  // (a library painting through prepareCover, an own book's cover arriving) re-measures it.
  const aspects = books.map(() => COVER_ASPECT);
  books.forEach((book, i) => {
    const img = book.querySelector('.rt-front img');
    const measure = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const aspect = img.naturalWidth / img.naturalHeight;
      if (Math.abs(aspect - aspects[i]) < 1e-3) return;
      aspects[i] = aspect;
      diagLog(`cover ${i} measured ${img.naturalWidth}x${img.naturalHeight}`);
      if (H) diagTime(`layout after cover ${i}`, () => layout(shown === -1 || view.classList.contains('is-preparing')));
    };
    img.addEventListener('load', measure);
    if (img.complete) measure();
  });

  const remove = view.querySelector('#rt-remove'), dialog = view.querySelector('#rt-remove-dialog');
  let removeFrame=0;
  function positionRemove(animate=false){
    cancelAnimationFrame(removeFrame);
    if(!options.onRemoveReading)return;
    // A linked book is not on the reader's list, so there is nothing to remove.
    // Hidden while books glide after a removal; the move itself brings it back.
    remove.hidden=!!table.reading[current]?.linked||!!moveTimer;
    if(remove.hidden)return;
    const until=performance.now()+(animate&&!reduced?900:0);
    const move=()=>{
      if(!view.isConnected)return;
      const bounds=stage.getBoundingClientRect(),cover=books[current].querySelector('.rt-front').getBoundingClientRect();
      remove.style.left=Math.max(0,Math.min(bounds.width-36,cover.right-bounds.left-18))+'px';
      remove.style.top=Math.max(0,cover.top-bounds.top-18)+'px';
      if(performance.now()<until)removeFrame=requestAnimationFrame(move);
    };
    move();
  }
  // Name the book in the confirmation: the × sits beside neighbouring spines,
  // so a generic question could confirm removing a book the reader never chose.
  remove.onclick=e=>{e.stopPropagation();const b=table.reading[current];dialog.dataset.book=b.bookId;view.querySelector('#rt-remove-heading').textContent=`Remove ${b.title} from currently reading?`;
    // An own book stays under My private uploads on My shelf, not Saved for later.
    dialog.querySelector('p').textContent=b.own?'It stays on My shelf under My private uploads, and your place is kept.':'It stays on My shelf under Saved for later, and your place is kept.';
    dialog.showModal();};
  dialog.addEventListener('click',e=>{e.stopPropagation();if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  view.querySelector('#rt-remove-cancel').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>remove.focus({preventScroll:true}));
  view.querySelector('#rt-remove-confirm').onclick=async e=>{
    const button=e.currentTarget;button.disabled=true;
    // Closed first: the book leaves the table at once, in view.
    const removing=options.onRemoveReading(dialog.dataset.book);if(dialog.open)dialog.close();
    try{await removing;requestAnimationFrame(()=>(document.querySelector('.reading-table:not([hidden]) #rt-continue')||document.querySelector('#read-featured'))?.focus({preventScroll:true}));}
    catch{dialog.close();options.onError?.('Could not remove this book. Please try again.');}
    finally{button.disabled=false;}
  };

  /** Book height from the stage, with headroom for the bookmark; the row stands on the stage's floor. */
  // The geometry itself is table-layout.js (shared with the first paint's placeholder in boot.js).
  function fit() {
    const r = stage.getBoundingClientRect();
    if (!r.height) return;
    const desk = innerWidth >= 900;
    const next = tableFit(r.width, r.height, desk);
    // The eye level follows the stage's floor even while the book height is held at its bound.
    stage.style.perspectiveOrigin = `50% ${next.originY}px`;
    if (next.H === H && Math.abs(r.width - stageW) < 0.5) { positionRemove(); return; }
    H = next.H;
    stageW = r.width;
    view.style.setProperty('--bh', `${H}px`);
    view.style.setProperty('--bw', `${next.bw}px`);
    layout(true);
    const shownBook = table.reading[current];
    if (shownBook && shown !== -1) fitHeroTitle($('rt-title'), shownBook.title);
  }

  function layout(instant) {
    // Room for the remove × (36px, centred on the cover's corner) before the next spine.
    const boxes = tableLayout({ H, stageW, desk: innerWidth >= 900, books: table.reading.map((b, i) => ({ aspect: aspects[i], depthRatio: depthRatio(b) })), current, turn, removable: !!options.onRemoveReading });
    books.forEach((book, i) => {
      const box = boxes[i];
      book.classList.toggle('is-current', box.current);
      book.classList.toggle('is-away', box.away);
      book.style.transitionDuration = instant || reduced ? '0s' : moveMs ? `${moveMs}ms` : '';
      book.style.transitionTimingFunction = moveMs && !instant ? MOVE_EASE : '';
      // Its own cover's shape; the depth stays the table's (a shorter, wider book is no thinner).
      for (const [property, value] of Object.entries(bookStyle(box))) property.startsWith('--') ? book.style.setProperty(property, value) : (book.style[property] = value);
      book.setAttribute('aria-current', String(box.current));
      book.tabIndex = box.current ? 0 : -1;
    });
    dots.forEach((dot, i) => { dot.classList.toggle('active', i === current); dot.setAttribute('aria-pressed', String(i === current)); });
    positionRemove(!instant);
    options.onLayout?.();
  }

  function select(index, byUser) {
    index = Math.max(0, Math.min(books.length - 1, index));
    if (diagOn) diagLog(`select ${index}${table.reading[index]?.own ? ' (own)' : ''}${byUser ? ' by touch' : ''}${index === current && shown !== -1 ? ' = already shown' : ''}`);
    if (index === current && shown !== -1) return;
    if (byUser) turn = -turn;
    current = index;
    diagTime('layout', () => layout(shown === -1));
    diagTime('show', () => show(index));
  }

  function show(index) {
    const b = table.reading[index], firstShow = shown === -1;
    shown = index;
    view.dataset.current = b.bookId;
    diagTime('onSelection', () => options.onSelection?.({bookId:b.bookId}));
    // Public artwork only: the reader can warm the selected cover first without
    // loading another library, reading private caches, or touching positions.
    try { sessionStorage.setItem('tinct:library-2-artwork',JSON.stringify([b,...table.reading.filter(book=>book!==b)].filter(book=>!book.own).slice(0,13).map(deskCover).filter(Boolean))); } catch {}
    const set = () => {
      fitHeroTitle($('rt-title'), b.title);
      // A linked book the reader has not started: its question, and Read opens its introduction.
      view.classList.toggle('is-linked', !!b.linked);
      $('rt-continue').firstChild.textContent = b.linked ? 'Read' : 'Continue';
      renderBookMetadata($('rt-book-metadata'), b, {percent:b.percent});
      remove.setAttribute('aria-label',`Remove ${b.title} from currently reading`);
      $('rt-place').textContent = b.chapterLabel;
      $('rt-pct').textContent = percentLabel(b.percent);
      // An own book with no place line (its text not on this device) shows no "Where you left off".
      $('rt-recap-box').hidden = !b.recap && !b.headline;
      setRecap(b.recap || (b.headline ? (/[.…!?]$/.test(b.headline) ? b.headline : `${b.headline}.`) : ''));
      options.onLayout?.();
    };
    clearTimeout(swapTimer);
    if (firstShow) set();
    else {
      $('rt-info').classList.add('out');
      swapTimer = setTimeout(() => { set(); $('rt-info').classList.remove('out'); }, 200);
    }
    clearTimeout(summaryTimer);
    if (!b.recap && view.api) {
      // The "so far" summary follows the production rules; passing a book only reads the cache.
      const apply = r => { if (view.isConnected && r?.text && current === index) setRecap(r.text); };
      const asked = (request) => { const at = performance.now(); return view.api.summaryFor(b.bookId, { request }).then(r => { if (diagOn) diagLog(`summary ${request ? 'request' : 'cache'} ${(performance.now() - at).toFixed(0)}ms ${r?.status || ''}`); return r; }); };
      asked(false).then(apply, () => {});
      summaryTimer = setTimeout(() => view.api && asked(true).then(apply, () => {}), 900);
    }
  }
  function setRecap(text) {
    const recap = $('rt-recap'), box = $('rt-recap-box');
    recap.textContent = text;
    box.classList.remove('open');
    view.classList.remove('recap-open');
    $('rt-more').textContent = 'Read more';
    requestAnimationFrame(() => { $('rt-more').classList.toggle('is-hidden', recap.scrollHeight <= recap.clientHeight + 1); });
  }
  async function continueReading() {
    const b = table.reading[current];
    if (!b || document.body.classList.contains('leaving')) return;
    if(options.onOpen){try{await options.onOpen(b.bookId,b.linked?'linked':'reading',books[current].querySelector('.rt-front img'));}catch{options.onError?.('This book could not open. Please try again.');}return;}
    document.body.classList.add('leaving');
    const destination = demo || !view.api ? Promise.resolve(`/library?book=${encodeURIComponent(b.bookId)}&view=book-detail`) : view.api.readerDestination(b.bookId, null);
    const [href] = await Promise.all([destination, new Promise(r => setTimeout(r, 240))]);
    location.assign(href);
  }

  // Click a spine to bring that book out; click the chosen book to read on.
  let startX = null, startY = null, dragged = false;
  stage.addEventListener('click', e => {
    if(e.target.closest('.rt-remove'))return;
    if (e.target.closest('#rt-dots,.rt-hidden-nav')) return;
    // Browsers can miss a visible spine in this preserve-3d stack and target
    // the stage instead. Use the painted face's screen bounds for pointer taps;
    // keep the real button target for keyboard activation.
    const painted = e.detail ? books.find((book,i)=>{
      if(book.classList.contains('is-away'))return false;
      const r=book.querySelector(i===current?'.rt-front':'.rt-spine').getBoundingClientRect();
      return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
    }) : null;
    const book = painted || e.target.closest('.rt-b');
    if (!book || dragged) return;
    const i = +book.dataset.i;
    if (i === current) continueReading(); else select(i, true);
  });
  // Swipe (touch or mouse drag) moves one book, however long the gesture (Anders, 12 Oct:
  // a long swipe skipped two books by accident); a tap brings any book forward.
  stage.addEventListener('pointerdown', e => { if(e.target.closest('.rt-remove'))return;startX = e.clientX; startY = e.clientY; dragged = false; }, { passive: true });
  stage.addEventListener('pointermove', e => { if (startX !== null && Math.abs(e.clientX - startX) > 8) dragged = true; }, { passive: true });
  stage.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    startX = startY = null;
    const swipe = Math.abs(dx) >= 30 && Math.abs(dx) > Math.abs(dy) * 1.2;
    if (diagOn) diagLog(`swipe dx ${Math.round(dx)} dy ${Math.round(dy)}${swipe ? ' -> one book' : ' (not a swipe)'}`);
    if (swipe) select(current + (dx < 0 ? 1 : -1), true);
    setTimeout(() => { dragged = false; }, 0);
  });
  stage.addEventListener('pointercancel', () => { startX = startY = null; dragged = false; });
  // Horizontal trackpad scroll steps one book per gesture.
  let wheelAt = 0;
  stage.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    e.preventDefault();
    if (Date.now() - wheelAt < 450) return;
    wheelAt = Date.now();
    select(current + (e.deltaX > 0 ? 1 : -1), true);
  }, { passive: false });

  $('rt-continue').addEventListener('click', e => { e.preventDefault(); continueReading(); });
  dots.forEach(dot => { dot.onclick = () => select(+dot.dataset.i, true); });
  $('rt-prev').onclick = () => select(current - 1, true);
  $('rt-next').onclick = () => select(current + 1, true);
  // An open recap scrolls in its own box with Show less always in view, and
  // the remove × is hidden meanwhile, so closing it can never remove the book.
  const toggleRecap = open => { $('rt-recap-box').classList.toggle('open', open); view.classList.toggle('recap-open', open); $('rt-more').textContent = open ? 'Show less' : 'Read more'; if (!open) $('rt-recap').scrollTop = 0; };
  $('rt-more').onclick = () => toggleRecap(!$('rt-recap-box').classList.contains('open'));
  $('rt-recap').addEventListener('click', () => { if ($('rt-recap-box').classList.contains('open')) toggleRecap(false); });
  // Arrow keys belong to the focused reading table, never to a dialog above it.
  view.addEventListener('keydown', e => {
    if (dialog.open || e.defaultPrevented || e.target.closest?.('input,textarea,select,[contenteditable]')) return;
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    select(current + (e.key === 'ArrowRight' ? 1 : -1), true);
  });
  // Prepare only this resolved reader's shelf. Covers and likely spine textures
  // start together; sampled bindings finish before anything is revealed.
  const artwork = books.map(async (book, i) => {
    // Its own entry, held: a removal mid-preparation renumbers the row.
    const entry = table.reading[i];
    const img = book.querySelector('.rt-front img');
    if(options.prepareCover&&!entry.own){const canvas=document.createElement('canvas');try{await options.prepareCover(entry.bookId,canvas);const blob=await new Promise(resolve=>{try{canvas.toBlob(resolve,'image/jpeg',.88);}catch{resolve(null);}});wearCover(book,img,blob?URL.createObjectURL(blob):canvas.toDataURL('image/jpeg',.88));}catch{}}
    else if(entry.own){try{const src=deskCover(entry);if(!tableCovers.has(src))thumbFor.set(src,entry.bookId);wearCover(book,img,await tableCover(src));}catch{}}
    const [{ name, colour }] = await Promise.all([
      prepareArtwork(entry),
      img.decode().catch(() => {}),
    ]);
    // The paper cover's spine is already drawn, as paper (spineStyle).
    if (hasPaperSpine(entry.bookId, entry.cover)) return;
    book.style.setProperty('--binding', colour);
    const tex = SPINE_TEXTURES ? `url('assets/spines/spine-${name}.jpg') 50% 50%/100% 100%,` : '';
    book.querySelector('.rt-spine').dataset.binding = name;
    book.querySelector('.rt-spine').style.background = `linear-gradient(90deg,#0009,#0000 16%,#ffffff14 44%,#0000 64%,#0009),${tex}${colour}`;
    book.querySelector('.rt-refl-spine').style.background = `${tex}${colour}`;
  });
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(fit):null;
  if(observer)observer.observe(stage);else addEventListener('resize',fit);
  if (diagOn) diagState(() => `table: ${books.length} books, current ${current}${table.reading[current]?.own ? ' (own)' : ''}, shown ${shown}, moving ${moveTimer ? 'yes' : 'no'}, H ${Math.round(H)} | covers ${books.map((b, i) => { const src = b.querySelector('.rt-front img')?.getAttribute('src') || ''; return `${i}${table.reading[i]?.own ? 'o' : ''}:${src.startsWith('blob:') ? 'blob' : src.startsWith('data:') ? 'data ' + Math.round(src.length / 1024) + 'K' : src ? 'url' : '-'}`; }).join(' ')}`);
  fit();select(current,false);
  // The title now set (its lines change the stage), measure again at once: the table is revealed in
  // its final geometry, not a frame before the ResizeObserver's refit (visible over the placeholder).
  fit();
  // Fresh data for the same books. While books are gliding after a removal the row is
  // left to finish; laying it out at once would snap them to their places.
  view.refresh=()=>{if(moveTimer){diagLog('refresh skipped: books moving');return;}shown=-1;select(current,false);};
  /**
   * Take books off the table in place (2026-10-09): each leaving book fades and
   * shrinks (LEAVE_MS), then the rest glide to their new places (MOVE_MS, ease-out).
   * When the chosen book leaves, its neighbour is chosen: the next book along,
   * or the one before it at the end of the row. The lists change at once, so a
   * second removal, a tap or a refresh mid-motion always meets the true row.
   */
  view.removeBooks=(ids,{instant=false}={})=>{
    diagLog(`remove ${ids.length} book(s)${instant?' instantly':''}`);
    const gone=new Set(ids);if(!table.reading.some(b=>gone.has(b.bookId)))return;
    let keepId=table.reading[current]?.bookId;
    if(gone.has(keepId)){
      keepId=table.reading.slice(current+1).find(b=>!gone.has(b.bookId))?.bookId??table.reading.slice(0,current).reverse().find(b=>!gone.has(b.bookId))?.bookId;
    }
    const still=!instant&&!reduced;
    for(let i=books.length-1;i>=0;i--){
      if(!gone.has(table.reading[i].bookId))continue;
      const leaving=books[i],dot=dots[i];
      books.splice(i,1);aspects.splice(i,1);table.reading.splice(i,1);dots.splice(i,1);dot?.remove();
      leaving.classList.remove('is-current');leaving.removeAttribute('data-i');
      if(still)fadeOut(leaving,{transform:leaving.style.transform,faces:leaving.children}).then(()=>leaving.remove());else leaving.remove();
    }
    books.forEach((book,i)=>{book.dataset.i=i;});dots.forEach((dot,i)=>{dot.dataset.i=i;});
    view.classList.toggle('has-many', books.length >= PHONE_DOTS_FROM);
    current=Math.max(0,table.reading.findIndex(b=>b.bookId===keepId));
    if(books.length&&table.reading[current].bookId!==view.dataset.current)show(current);
    clearTimeout(moveTimer);moveTimer=0;
    if(!books.length)return;
    if(!still){layout(true);return;}
    // The × belonged to the leaving book; it returns on the chosen one once the row has moved.
    remove.hidden=true;
    // The neighbours wait for the leaving book to go, then close the gap.
    moveTimer=setTimeout(()=>{moveTimer=0;if(!view.isConnected)return;moveMs=MOVE_MS;layout(false);moveMs=0;},LEAVE_MS);
  };
  view.dispose=()=>{cancelAnimationFrame(removeFrame);clearTimeout(moveTimer);moveTimer=0;if(dialog.open)dialog.close();observer?.disconnect();removeEventListener('resize',fit);clearTimeout(summaryTimer);clearTimeout(swapTimer);};
  // A distant spine must not hold the selected book behind a loading screen.
  return artwork[current]||Promise.resolve();
}

function addFinishedShelf(finished, shelves, el) {
  const section = el('section', 'shelf finished-shelf');
  section.append(el('h2', '', 'Finished'));
  const row = el('div', 'book-row');
  row.setAttribute('aria-label', 'Finished');
  finished.forEach(book => {
    const card = el('a', 'book-card finished-card');
    card.href = `/library?book=${encodeURIComponent(book.bookId)}&view=book-detail`;
    card.setAttribute('aria-label', `${book.title}, finished`);
    card.innerHTML = `<span class="cv"><img src="${esc(paintedCoverAt(book.bookId, DESK_COVER_PX) ?? coverAsset(book.bookId, book.cover))}" alt=""" loading="lazy" decoding="async"><span class="done" aria-hidden="true">✓</span></span>${monthName(book.finishedAt) ? `<small>Finished in ${esc(monthName(book.finishedAt))}</small>` : ''}`;
    row.append(card);
  });
  section.append(row);
  shelves.prepend(section);
}

// Shared account-safe data and public bindings for the approved bookshelf.
export { DEMO, bindingFor, markup };
export function onCachedTable(fn){cachedListeners.add(fn);if(cachedTable)readingApi().then(api=>fn(cachedTable,api));return()=>cachedListeners.delete(fn);}
export async function resolveReadingTable(refresh=false) { const early = firstTable && !refresh ? await firstTable : null; if (early?.error) throw early.error; return early?.value || loadTable(); }
