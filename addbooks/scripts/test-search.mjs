import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSearch, hydrate, near} from '../site/search.js';
const works = hydrate(JSON.parse(fs.readFileSync(new URL('../site/data/index.json', import.meta.url))).works);
const search = createSearch(works);
const cases = [
  ['Odyssey', 'The Odyssey'], ['dostoevsky', 'Crime and Punishment'],
  ['pride prejudice', 'Pride and Prejudice'], ['meditations marcus', 'Meditations'],
  ['oddysey', 'The Odyssey'], ['prdie prejudice', 'Pride and Prejudice'],
  ['Constance Garnett', 'Crime and Punishment'],
];
// Multilingual: each language's own classic is found under that language's filter.
const multilingual = [
  ['Andersen eventyr', 'da', 'Eventyr'], ['Goethe Faust', 'de', 'Faust'], ['Max Havelaar', 'nl', 'Max Havelaar'],
  ['Pan Tadeusz', 'pl', 'Pan Tadeusz'], ['Röda rummet', 'sv', 'Röda rummet'], ['Peer Gynt', 'no', 'Peer Gynt'],
  ['Don Quijote', 'es', 'Don Quijote'], ['Os Lusíadas', 'pt', 'Os Lusíadas'], ['divina commedia', 'it', 'La divina commedia'],
  ['Les Misérables', 'fr', 'Les Misérables'],
];
const results = {};
for (const [q, expected] of cases) {
  const r = search(q, {language:'en'}, 3);
  assert.equal(r.results[0]?.title, expected, q);
  results[q] = {count:r.total, searchMs:r.elapsedMs, top3:r.results.map(w=>({id:w.id,title:w.title,authors:w.authors.map(a=>a.name),source:w.editions[0].source}))};
}
for (const [q, language, expected] of multilingual) {
  const r = search(q, {language}, 3);
  assert.ok(r.results.some(w => w.title.toLowerCase() === expected.toLowerCase()), q + ' in ' + language + ': ' + r.results.map(w=>w.title));
  results[q + ' [' + language + ']'] = {count:r.total, searchMs:r.elapsedMs, top3:r.results.map(w=>({id:w.id,title:w.title,authors:w.authors.map(a=>a.name),sources:[...new Set(w.editions.map(e=>e.source))]}))};
}
assert.ok(search('kobenhavn', {language:'da'}).total > 0, 'Danish letter folding');
assert.ok(search('', {language:'no'}).total > 0 && search('', {language:'nb'}).total === 0, 'Norwegian codes unified');
assert.equal(search('zzzxqvnonexistent',{language:'en'}).total,0);
assert.ok(near('prdie','pride'));
assert.equal(near('pride','crime'),false);
const se = search('',{language:'en',source:'Standard Ebooks'},100);
assert.ok(se.total>0); assert.ok(se.results.every(w=>w.editions.some(e=>e.source==='Standard Ebooks')));
const french = search('',{language:'fr'},10);
assert.ok(french.total>0); assert.ok(french.results.every(w=>w.language.includes('fr')));
const subject = search('',{language:'en',subject:'Category: Philosophy & Ethics'},100);
assert.ok(subject.total>0); assert.ok(subject.results.every(w=>[...w.bookshelves,...w.subjects].includes('Category: Philosophy & Ethics')));
assert.equal(new Set(works.map(w=>w.id)).size,works.length);
assert.equal(new Set(works.flatMap(w=>w.editions.map(e=>e.id))).size,works.flatMap(w=>w.editions).length);
for (const w of works) {
  assert.ok(w.editions.length);assert.ok(w.language.length);
  assert.equal(w.onTinct,w.tinctIds.length>0);
  // Every edition states its rights; Gutenberg/SE remain US public domain.
  assert.ok(w.editions.every(e=>e.rights && e.licence));
  assert.ok(w.editions.every(e=>e.copyright && e.copyright.startsWith('Public domain')));
  // Life+70: no indexed creator died in the last 70 years.
  const cutoff = new Date().getFullYear() - 70;
  assert.ok(w.editions.every(e=>[...e.authors,...e.translators].every(p=>p.deathYear === null || p.deathYear < cutoff)));
  assert.ok(w.editions.filter(e=>['Gutenberg','Standard Ebooks'].includes(e.source)).every(e=>e.rights.startsWith('Public domain in the USA')));
  assert.ok(w.editions.every(e=>e.epubUrl === null || e.epubUrl.startsWith('https://')));
  if(w.editions.some(e=>e.source==='Standard Ebooks')) assert.equal(w.quality,'clean');
}
fs.writeFileSync(new URL('../qa/search-results.json', import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
console.log('Search, ranking, filters, edition identity and rights assertions passed.');
