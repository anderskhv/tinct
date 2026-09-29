import {expect,it} from 'vitest'
import {compositionYears,periodGroups,inPeriod,populatedShelves} from '../public/lab/library_2/browse-groups.js'
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
