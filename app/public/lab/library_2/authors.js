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
export function renderAuthorFlap(images, target, credit) {
  target.replaceChildren();credit.replaceChildren();credit.hidden=!images.length;
  if(!images.length)return;
  const summary=document.createElement('summary');summary.textContent='Image credits';credit.append(summary);
  images.forEach((image,index)=>{
    const figure=document.createElement('figure'),portrait=document.createElement('img'),caption=document.createElement('figcaption');
    figure.className='author-flap-figure';portrait.className='author-flap-image';if(index===0)portrait.id='slip-portrait';
    portrait.src=image.publicPath;portrait.alt=image.alt;portrait.decoding='async';
    caption.textContent=image.caption;figure.append(portrait,caption);target.append(figure);
    const record=document.createElement('p');record.append(document.createTextNode(image.authorName+' · '+image.creator+' · '));
    for(const [label,href] of [[image.licence,image.licenceUrl],['Source',image.sourcePage]]) {
      const link=document.createElement('a');link.textContent=label;link.href=href;link.target='_blank';link.rel='noopener noreferrer';record.append(link,document.createTextNode(' · '));
    }
    record.append(document.createTextNode(image.changes));credit.append(record);
  });
}
