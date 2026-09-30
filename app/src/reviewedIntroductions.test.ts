// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { books } from '../public/lab/library_2/books.js'
import { applyReviewedIntroduction, reviewedCast, reviewedHooks } from '../public/lab/library_2/reviewed-introductions.js'

const json = (path: string) => JSON.parse(readFileSync(resolve(__dirname, path), 'utf8'))
const source = json('../../books/wip/featured-content-20260929/featured-copy.json')
const gallery = json('../../books/wip/featured-content-20260929/character-galleries.json')

describe('reviewed library introductions', () => {
  it('preserves all supplied prose exactly and retains the ten existing book identities', () => {
    expect(source.books).toHaveLength(11)
    expect(books).toHaveLength(10)
    for (const accepted of source.books) {
      const copy = json('../public/lab/library_2/intro-data/' + accepted.id + '.json')
      for (const key of ['author', 'hook', 'preface', 'orientation']) expect(copy[key]).toEqual(accepted[key])
      expect(reviewedHooks[accepted.id]).toBe(accepted.hook.text)
      const book = structuredClone(books.find(book => book.id === copy.id) || {id:copy.id,characters:[]})
      const originals = structuredClone(book.characters)
      applyReviewedIntroduction(book, copy)
      expect(book.preface).toEqual(accepted.preface.paragraphs)
      for (const original of originals) {
        const kept = book.characters.find(character => character.aliases.includes(original.aliases[0]))
        expect(kept, accepted.id + ':' + original.aliases[0]).toBeTruthy()
        expect(kept.aliases).toEqual(original.aliases)
        expect(kept.id).toBe(original.id)
        expect(kept.kind).toBe(original.kind)
        expect(kept.storyRole).toBe(original.storyRole)
      }
      const expectedGallery = gallery.books.find(book => book.bookId === accepted.id)
      expect(copy.gallery?.characters.length || 0).toBe(expectedGallery?.characters.length || 0)
      for (const acceptedCharacter of expectedGallery?.characters || []) {
        const card = book.characters.find(character => character.introKey === acceptedCharacter.editorialId)
        expect(card.body).toBe(acceptedCharacter.body)
        expect(card.subtitle).toBe(acceptedCharacter.role)
      }
    }
  })
  it('hides the entire held Jane Eyre entry until the reveal chapter is reached', () => {
    const book = structuredClone(books.find(book => book.id === 'jane-eyre'))
    applyReviewedIntroduction(book, json('../public/lab/library_2/intro-data/jane-eyre.json'))
    expect(reviewedCast(book)).toHaveLength(3)
    for (const progress of [null, {chapterNumber:0}, {chapterNumber:25}, {chapterNumber:NaN}]) {
      expect(JSON.stringify(reviewedCast(book,true,progress))).not.toContain('Bertha')
    }
    expect(reviewedCast(book,true,{chapterNumber:26}).find(card=>card.introKey==='bertha-mason')).toBeTruthy()
    expect(reviewedCast(book,true,{completed:true}).find(card=>card.introKey==='bertha-mason')).toBeTruthy()
    book.characters.find(card=>card.introKey==='bertha-mason').revealAfterChapter=null
    expect(JSON.stringify(reviewedCast(book,true,{chapterNumber:26}))).not.toContain('Bertha')
  })
  it('keeps the exact signature and collective authorship without inventing Bible characters', () => {
    const f=json('../public/lab/library_2/intro-data/frankenstein.json')
    expect(f.preface.signature).toBe('Anders K. Hvelplund, Copenhagen Sep 24, 2026')
    const b=json('../public/lab/library_2/intro-data/bible.json')
    expect(b.author.name).toBe('Many authors and editors')
    expect(b.gallery).toBeNull()
  })
})

describe('reviewed author image coverage and credits', () => {
  const manifest=json('../public/lab/library_2/author-images.json')
  it('maps each of the 101 supplied books to reviewed local images', () => {
    expect(manifest.books).toHaveLength(101)
    expect(new Set(manifest.books.map(book=>book.bookId)).size).toBe(101)
    expect(manifest.images).toHaveLength(63)
    for(const book of manifest.books) {
      expect(book.imageIds.length,book.bookId).toBeGreaterThan(0)
      for(const id of book.imageIds)expect(manifest.images.some(image=>image.id===id),book.bookId+':'+id).toBe(true)
    }
    expect(manifest.books.find(book=>book.bookId==='communist-manifesto').imageIds).toEqual(['karl-marx','friedrich-engels'])
    expect(manifest.books.find(book=>book.bookId==='federalist-papers').imageIds).toEqual(['alexander-hamilton','james-madison','john-jay'])
    expect(manifest.books.find(book=>book.bookId==='bible').displayKind).toBe('collection_image')
  })
  it('ships the exact reviewed bytes with visible captions and accessible licensing', async () => {
    const { createHash }=await import('node:crypto')
    const { renderAuthorFlap, renderImageCredits }=await import('../public/lab/library_2/authors.js')
    // Every portrait is credited on the library's Image credits page, not in the flap.
    const page=document.createElement('div')
    await renderImageCredits(page,manifest)
    for(const image of manifest.images) {
      expect(image.publicPath).toMatch(/^\/lab\/library_2\/assets\/author-flaps\/[a-z0-9-]+\.(jpg|png|webp)$/)
      const bytes=readFileSync(resolve(__dirname,'../public'+image.publicPath))
      expect(createHash('sha256').update(bytes).digest('hex'),image.id).toBe(image.sha256)
      for(const key of ['creator','licence','licenceUrl','sourcePage','changes','caption','alt'])expect(image[key],image.id+':'+key).toBeTruthy()
      const target=document.createElement('div')
      renderAuthorFlap([image],target)
      expect(target.querySelector('img')?.getAttribute('alt')).toBe(image.alt)
      expect(target.querySelector('figcaption')?.textContent).toBe(image.caption)
      expect(target.textContent).not.toContain(image.licence)
      const record=[...page.querySelectorAll('p')].find(p=>p.textContent.startsWith(image.authorName+' · '+image.creator+' · ')&&p.textContent.includes(image.changes)
        &&[...p.querySelectorAll('a')].map(a=>a.href).join()===[image.licenceUrl,image.sourcePage].join())
      expect(record,image.id).toBeTruthy()
    }
  })
})

describe('remaining ninety reviewed introductions', () => {
  const batch = json('../../books/wip/remaining-content-20260929/book-copy.json')
  const images = json('../public/lab/library_2/author-images.json')
  it('covers the exact catalogue complement with the supplied wording and image mappings', () => {
    expect(batch.books).toHaveLength(90)
    const allIds=[...source.books,...batch.books].map(book=>book.id)
    expect(new Set(allIds).size).toBe(101)
    expect([...allIds].sort()).toEqual(images.books.map(book=>book.bookId).sort())
    expect(Object.keys(reviewedHooks).sort()).toEqual([...allIds].sort())
    for(const accepted of batch.books){
      const copy=json('../public/lab/library_2/intro-data/'+accepted.id+'.json')
      expect(copy.id).toBe(accepted.id)
      for(const key of ['name','years','occupation','biography'])expect(copy.author[key],accepted.id+':'+key).toBe(accepted.author[key])
      expect(copy.hook.text).toBe(accepted.hook.text)
      expect(copy.preface.paragraphs).toEqual(accepted.preface.paragraphs)
      expect(copy.orientation.text).toBe(accepted.orientation.text)
      expect(reviewedHooks[accepted.id]).toBe(accepted.hook.text)
      expect(images.books.find(book=>book.bookId===accepted.id).imageIds).toEqual(accepted.flapImages.imageIds)
      expect(copy).not.toHaveProperty('gallery')
      for(const field of ['status','editorialNotes','references','flapImages','readingTime'])expect(copy).not.toHaveProperty(field)
      expect(copy.author).not.toHaveProperty('status')
      expect(copy.hook).not.toHaveProperty('status')
      expect(copy.preface).not.toHaveProperty('status')
      expect(copy.orientation).not.toHaveProperty('status')
    }
  })
  it('retains existing titles, galleries, identities, spoiler gates and reading metadata', () => {
    for(const accepted of batch.books){
      const characters=[{id:'existing-id',aliases:['Existing name'],kind:'person',storyRole:'minor',body:'Existing text',art:'/existing.webp',introVisibility:'hold_until_revealed',revealAfterChapter:26}]
      const book={id:accepted.id,title:'Existing catalogue title',characters,editions:['original-en'],defaultEditionKey:'original-en',firstChapter:7,wordCount:1234,discoveryAvailable:false}
      const original=structuredClone(book)
      applyReviewedIntroduction(book,json('../public/lab/library_2/intro-data/'+accepted.id+'.json'))
      expect(book.characters).toBe(characters)
      for(const key of Object.keys(original))expect(book[key],accepted.id+':'+key).toEqual(original[key])
      expect(book.preface).toEqual(accepted.preface.paragraphs)
      expect(book.orientation).toBe(accepted.orientation.text)
      expect(reviewedCast(book)).toBeNull()
    }
  })
})
