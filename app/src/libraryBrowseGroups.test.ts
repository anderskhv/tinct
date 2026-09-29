import {expect,it} from 'vitest'
import {compositionYears,periodGroups,inPeriod,populatedShelves,collectionReels} from '../public/lab/library_2/browse-groups.js'
import {LIBRARY_BOOK_META} from './data/libraryTaxonomy'
it('uses the canonical composition dates, not edition publication dates',()=>{
 for(const b of LIBRARY_BOOK_META)expect(compositionYears[b.id]).toBe(b.ySort)
 const earliest=periodGroups.find(p=>p.id==='earliest')!
 expect(inPeriod({id:'gilgamesh'},earliest)).toBe(true)
 expect(inPeriod({id:'meditations'},earliest)).toBe(false)
 for(const b of LIBRARY_BOOK_META)expect(periodGroups.filter(p=>inPeriod(b,p))).toHaveLength(1)
})
it('reuses populated shelves and removes unavailable books and empty groups',()=>{
 const houses=[{id:'philosophy',shelves:[{id:'stoics',bookIds:['meditations','held']},{id:'empty',bookIds:['held']}]}]
 expect(populatedShelves('philosophy',houses,[{id:'meditations'}])).toEqual([{id:'stoics',bookIds:['meditations']}])
 expect(populatedShelves('history',houses,[])).toEqual([])
})

it('keeps subdivisions on category pages and retains books outside a named shelf',()=>{
 const books=[{id:'meditations'},{id:'confessions'},{id:'unknown'}];
 const houses=[{id:'philosophy',shelves:[{id:'stoics',title:'Stoics',bookIds:['meditations','held']},{id:'empty',title:'Empty',bookIds:['held']}]}];
 expect(collectionReels('category','philosophy',books,houses,'Philosophy')).toEqual([
  {id:'stoics',title:'Stoics',books:[books[0]]},
  {id:'more-philosophy',title:'More Philosophy',books:[books[1],books[2]]}
 ]);
 expect(collectionReels('category','all',books,houses,'All books')).toEqual([]);
 expect(collectionReels('saved','',books,houses,'My shelf')).toEqual([]);
});
it('separates earliest works from later antiquity without empty period rows',()=>{
 const books=[{id:'gilgamesh'},{id:'meditations'},{id:'confessions'}];
 const reels=collectionReels('era','antiquity',books,[],'Antiquity');
 expect(reels.map(g=>g.id)).toEqual(['earliest','early-ad']);
 expect(reels[0].books).toEqual([books[0]]);
 expect(reels[1].books).toEqual(books.slice(1));
});
