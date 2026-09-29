
(()=>{
// Preserve the existing recent-reader shortcut only at the bare home entry.
// Explicit Library, book links and review modes always display the library.
// The production reader still resolves the account, edition and exact position.
try {
  const params = new URLSearchParams(location.search);
  const home = location.pathname === '/' || location.pathname === '/index.html';
  if (home && !['book','view','demo','preview'].some(key => params.has(key))) {
    let userId = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!/^sb-.*-auth-token$/.test(key || '')) continue;
      const session = JSON.parse(localStorage.getItem(key) || 'null');
      if (typeof session?.user?.id === 'string' && session.user.id) { userId = session.user.id; break; }
    }
    const position = JSON.parse(localStorage.getItem('tinct-lab-position') || 'null');
    const place = position?.books?.[position.lastSettledBookId];
    const at = Math.max(position?.lastSettledAt || 0, place?.updatedAt || 0), now = Date.now();
    const recent = Number.isFinite(at) && at > 0 && at <= now && now - at <= 3 * 24 * 60 * 60 * 1000;
    if (userId && position?.owner === userId && typeof place?.bookId === 'string' && place.bookId && recent) {
      try { sessionStorage.setItem('tinct:lab-reader-origin', JSON.stringify({v:1,bookId:place.bookId,at:now})); } catch {}
      document.documentElement.style.visibility = 'hidden';
      location.replace('/reader' + (params.get('voiceTrial') === 'mini' ? '?voiceTrial=mini' : ''));
      return;
    }
  }
} catch { document.documentElement.style.visibility = ''; }
const review=new URLSearchParams(location.search).get('preview');if(review==='1'||review==='0')document.cookie='tinct_library_preview='+(review==='1'?'1':'0')+'; Path=/; Max-Age='+(review==='1'?'604800':'0')+'; SameSite=Lax; Secure';const d=document.documentElement;let hint=new URLSearchParams(location.search).get('demo')==='reading';try{const saved=localStorage.getItem('tinct-library-2-reading-table'),positions=localStorage.getItem('tinct-lab-position')||'',signed=/(?:^|;\s*)tinct_auth=1(?:;|$)/.test(document.cookie);if(signed)d.classList.add('signed-in');hint=hint||!!saved||/"books":\{"/.test(positions)||signed;}catch{}try{const visit=JSON.parse(sessionStorage.getItem('tinct:library-2-visit')||'null');if(visit&&Date.now()-visit.at<4*60*60*1000&&visit.mode==='discovery'&&!new URLSearchParams(location.search).has('demo')&&new URLSearchParams(location.search).get('view')!=='shelf')hint=false;}catch{}if(new URLSearchParams(location.search).get('view')==='new')hint=false;if(hint)d.classList.add('returning-pending');const hour=new Date().getHours(),preview=new URLSearchParams(location.search),requested=preview.get('demo')==='reading'&&preview.get('rooms')==='1'?preview.get('room'):null,room=['morning','afternoon','evening','night'].includes(requested)?requested:hour>=6&&hour<12?'morning':hour>=12&&hour<17?'afternoon':hour>=17&&hour<21?'evening':'night',wide=innerWidth/innerHeight>1.2,shelf=preview.get('view')==='shelf',scene=hint&&!shelf?'table-'+room:'frankenstein',asset=hint&&shelf?'shelf-study/library-wall.jpg':scene.startsWith('table-')?`assets/${scene}-${wide?'wide':'phone'}.jpg`:`assets/${wide?'room-wide-v2':'room-sharp'}.jpg`;if(hint&&!shelf)d.classList.add('returning-scene-pending');window.__library2Boot={hint,scene,asset};d.dataset.scene=scene;d.dataset.returningView=shelf?'shelf':'table';d.style.setProperty('--initial-scene',`url("${asset}")`);const preload=document.createElement('link');preload.rel='preload';preload.as='image';preload.href=asset;preload.fetchPriority='high';document.head.append(preload);if(hint){window.__library2Catalogue=fetch('/lab/catalogue.json').then(r=>{if(!r.ok)throw new Error('Catalogue '+r.status);return r.json();});window.__library2Catalogue.catch(()=>{});const bridge=document.createElement('link');bridge.rel='modulepreload';bridge.href='/lab/library-2-reading.js?v=20260928f';document.head.append(bridge);}if(!hint){const cover=document.createElement('link');cover.rel='preload';cover.as='image';cover.href='assets/frankenstein.jpg';cover.fetchPriority='high';document.head.append(cover);}})();

// Keep the first HTML cover in the same position as the interactive cover.
window.__library2Layout=(()=>{let width=0;return()=>{if(innerWidth!==width){width=innerWidth;const bar=/iPhone|iPod/.test(navigator.userAgent)&&innerHeight>screen.height-140?52:0;document.documentElement.style.setProperty('--land-bottom',innerHeight-bar+'px');}const hero=document.getElementById('hero'),book=document.getElementById('hero-book');if(!hero||!book)return;const r=hero.getBoundingClientRect(),copy=document.querySelector('.hero-copy').getBoundingClientRect();document.documentElement.style.setProperty('--hero-height',r.height+'px');if(innerWidth<700){const top=document.getElementById('header').getBoundingClientRect().height+10,available=Math.max(90,copy.top-r.top-top-18),height=Math.min((r.height+parseFloat(getComputedStyle(document.getElementById('shelves')).marginTop||0))*.35,available);book.style.top=top+available-height+'px';book.style.height=height+'px';book.style.bottom='auto';}else{book.style.top='';book.style.height='';book.style.bottom='';}}})();


