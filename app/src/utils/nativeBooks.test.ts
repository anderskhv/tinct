// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { BOOKS } from '../data/bookRegistry'
import { PRE_READER_CATALOGUE, LAB_COVER_ART_BOOK_IDS } from '../preReader/catalogue'
import { applyNativeBookCatalogue } from './nativeBooks'
const originalBooks = BOOKS.slice(), originalViews = PRE_READER_CATALOGUE.books.slice(), originalHouses = PRE_READER_CATALOGUE.houses
const originalMap = new Map(PRE_READER_CATALOGUE.booksById), originalCovers = LAB_COVER_ART_BOOK_IDS.slice()
afterEach(() => {
 BOOKS.splice(0, BOOKS.length, ...originalBooks)
 PRE_READER_CATALOGUE.books.splice(0, PRE_READER_CATALOGUE.books.length, ...originalViews)
 const map=PRE_READER_CATALOGUE.booksById as Map<string, any>; map.clear(); for (const [key,value] of originalMap) map.set(key,value)
 PRE_READER_CATALOGUE.houses=originalHouses
 ;(LAB_COVER_ART_BOOK_IDS as string[]).splice(0,LAB_COVER_ART_BOOK_IDS.length,...originalCovers)
})
function fixture() {
 const book={...BOOKS.find(book=>book.id==='frankenstein')!,id:'published-after-install',editions:BOOKS.find(book=>book.id==='frankenstein')!.editions.filter(e=>e.language==='en')}
 const view={...PRE_READER_CATALOGUE.booksById.get('frankenstein')!,id:book.id}
 return {schema:1 as const,books:[{id:book.id,book,view,revision:'a'.repeat(64),bytes:200}],catalogue:{books:[view],popular:[book.id],houses:[{id:'fiction',title:'Fiction',subtitle:'',hue:1,shelves:[{id:'novels',title:'Novels',subtitle:'',hue:1,bookIds:[book.id]}]}]},ready:[]}
}
it('adds a post-install book to the shared reader, handoff and library taxonomy',()=>{
 const data=fixture(); applyNativeBookCatalogue(data)
 expect(BOOKS.find(book=>book.id===data.books[0].id)).toBe(data.books[0].book)
 expect(PRE_READER_CATALOGUE.booksById.get(data.books[0].id)).toBe(data.books[0].view)
 expect(PRE_READER_CATALOGUE.houses[0].shelves[0].books[0].id).toBe('published-after-install')
 expect(LAB_COVER_ART_BOOK_IDS).toContain('published-after-install')
})
it('rejects unsupported data before changing any reader metadata',()=>{
 const data=fixture(); data.books[0].book.id='../wrong'
 expect(()=>applyNativeBookCatalogue(data)).toThrow('Unsupported library entry')
 expect(BOOKS).toEqual(originalBooks)
})
