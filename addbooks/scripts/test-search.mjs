import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSearch, near} from '../site/search.js';
const {works} = JSON.parse(fs.readFileSync(new URL('../site/data/index.json', import.meta.url)));
const search = createSearch(works);
const cases = [
  ['Odyssey', 'The Odyssey'], ['dostoevsky', 'Crime and Punishment'],
  ['pride prejudice', 'Pride and Prejudice'], ['meditations marcus', 'Meditations'],
  ['oddysey', 'The Odyssey'], ['prdie prejudice', 'Pride and Prejudice'],
  ['Constance Garnett', 'Crime and Punishment'],
];
const results = {};
for (const [q, expected] of cases) {
  const r = search(q, {language:'en'}, 3);
  assert.equal(r.results[0]?.title, expected, q);
  results[q] = {count:r.total, searchMs:r.elapsedMs, top3:r.results.map(w=>({id:w.id,title:w.title,authors:w.authors.map(a=>a.name),source:w.editions[0].source}))};
}
assert.equal(search('zzzxqvnonexistent',{language:'en'}).total,0);
assert.ok(near('prdie','pride'));
assert.equal(near('pride','crime'),false);
const se = search('',{language:'en',standardOnly:true},100);
assert.ok(se.total>0); assert.ok(se.results.every(w=>w.editions[0].source==='Standard Ebooks'));
const french = search('',{language:'fr'},10);
assert.ok(french.total>0); assert.ok(french.results.every(w=>w.language.includes('fr')));
const subject = search('',{language:'en',subject:'Category: Philosophy & Ethics'},100);
assert.ok(subject.total>0); assert.ok(subject.results.every(w=>[...w.bookshelves,...w.subjects].includes('Category: Philosophy & Ethics')));
assert.equal(new Set(works.map(w=>w.id)).size,works.length);
assert.equal(new Set(works.flatMap(w=>w.editions.map(e=>e.id))).size,works.flatMap(w=>w.editions).length);
for (const w of works) {
  assert.ok(w.editions.length);assert.ok(w.language.length);
  assert.equal(w.onTinct,w.tinctIds.length>0);
  assert.ok(w.editions.every(e=>e.rights.startsWith('Public domain in the USA')));
  assert.ok(w.editions.every(e=>e.epubUrl === null || e.epubUrl.startsWith('https://')));
  if(w.editions.some(e=>e.source==='Standard Ebooks')) assert.equal(w.quality,'clean');
}
fs.writeFileSync(new URL('../qa/search-results.json', import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
console.log('Search, ranking, filters, edition identity and rights assertions passed.');
