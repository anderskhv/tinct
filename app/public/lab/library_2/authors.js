// Historical images, served locally. Sources and licences: assets/ATTRIBUTION.md.
// Match the author rather than the book so other works share the same portrait.
const portraits = [
  [/Jane Austen/i, 'jane-austen', 'Jane Austen, drawn by her sister Cassandra Austen'],
  [/Dostoevsky|Dostoyevsky/i, 'dostoevsky', 'Fyodor Dostoevsky, painted by Vasily Perov'],
  [/Machiavelli/i, 'machiavelli', 'Niccolò Machiavelli, painted by Santi di Tito'],
  [/^Homer$/i, 'homer', 'An ancient imagined likeness of Homer, British Museum'],
  [/Marcus Aurelius/i, 'marcus-aurelius', 'Sculpted portrait of Marcus Aurelius'],
];

export function authorPortrait(author) {
  const match = portraits.find(([pattern]) => pattern.test(author));
  return match ? { src: `assets/authors/${match[1]}.jpg`, alt: match[2] } : null;
}

export function warmPortrait(author) {
  const portrait = authorPortrait(author);
  if (!portrait) return;
  const image = new Image();
  image.decoding = 'async';
  image.fetchPriority = 'low';
  image.src = portrait.src;
}

let authorManifest;
export async function loadAuthorFlap(bookId) {
  if (!authorManifest) authorManifest = fetch('/lab/library_2/author-images.json?v=20260929reviewed')
    .then(response => { if (!response.ok) throw new Error('Author images unavailable'); return response.json(); })
    .catch(error => { authorManifest=null; throw error; });
  const manifest=await authorManifest;
  const entry=manifest.books.find(book=>book.bookId===bookId);
  return (entry?.imageIds||[]).map(id=>manifest.images.find(image=>image.id===id)).filter(Boolean);
}
export function renderAuthorFlap(images, target) {
  target.replaceChildren();
  images.forEach((image,index)=>{
    const figure=document.createElement('figure'),portrait=document.createElement('img');
    figure.className='author-flap-figure';portrait.className='author-flap-image';if(index===0)portrait.id='slip-portrait';
    portrait.src=image.publicPath;portrait.alt=image.alt;portrait.decoding='async';
    figure.append(portrait);target.append(figure);
  });
}
/** Every author portrait's attribution, in one place (licences such as CC BY-SA require it). */
export async function renderImageCredits(target, provided) {
  if(!provided&&!authorManifest) await loadAuthorFlap('');
  const manifest=provided||await authorManifest;
  target.replaceChildren();
  const list=document.createElement('div');list.className='image-credits';
  for(const image of manifest?.images||[]){
    const record=document.createElement('p');record.append(document.createTextNode(image.authorName+' · '+image.creator+' · '));
    for(const [label,href] of [[image.licence,image.licenceUrl],['Source',image.sourcePage]]){
      if(!href){record.append(document.createTextNode(label+' · '));continue;}
      const link=document.createElement('a');link.textContent=label;link.href=href;link.target='_blank';link.rel='noopener noreferrer';record.append(link,document.createTextNode(' · '));
    }
    record.append(document.createTextNode(image.changes));list.append(record);
  }
  target.append(list);
}
