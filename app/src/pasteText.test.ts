// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { epubToEdition } from './lab/userBook/epubEdition'
// @ts-expect-error -- shared browser module
import { detectFormat, markdownHtml, pasteEpub, preview, sanitizeHtml, suggestedTitle, trimSource } from '../public/lab/library_2/paste-text.js'
import '../public/lab/wait-ring.js'
// @ts-expect-error -- shared browser module
import * as add from '../public/lab/library_2/add-to-tinct.js'

const data = (file: File) => new Promise<Uint8Array>((resolve, reject) => {
 const reader = new FileReader(); reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer)); reader.onerror = () => reject(reader.error); reader.readAsArrayBuffer(file)
})

describe('private pasted source', () => {
 it('keeps Unicode, quotes, list order, links, and figure wording through the real EPUB reader converter', async () => {
  vi.stubGlobal('crypto', { randomUUID: () => '11111111-1111-4111-8111-111111111111' })
  const source = '# Chapter One\n\nA café — “quoted” **bold** [source](https://example.org/article). 🐚\n\n3. Third item\n4. Fourth item\n\n> A remembered line.\n\n<figure><figcaption>Figure 1: The copper plate.</figcaption></figure>'
  const file = pasteEpub({source, format: 'markdown', title: 'Notes & observations', author: 'Åse Ørsted'})
  expect(file.name).toBe('Notes & observations.epub')
  const bytes = await data(file)
  const edition = await epubToEdition(bytes)
  expect(edition).toMatchObject({ title: 'Notes & observations', author: 'Åse Ørsted' })
  const text = edition.chapters.flatMap(c => c.paragraphs).join(' ')
  for (const phrase of ['A café — “quoted” bold source. 🐚', 'Third item', 'Fourth item', 'A remembered line.', '<figure><figcaption>Figure 1']) {
   if (phrase.startsWith('<')) continue
   expect(text).toContain(phrase)
  }
  expect(markdownHtml(source)).toContain('<ol start="3"><li>Third item</li><li>Fourth item</li></ol>')
  expect(markdownHtml(source)).toContain('<a href="https://example.org/article">source</a>')
  vi.unstubAllGlobals()
 })

 it('sanitizes HTML before preview and stores no remote resource, active URL, attribute, or executable tag', async () => {
  vi.stubGlobal('crypto', { randomUUID: () => '11111111-1111-4111-8111-111111111111' })
  const html = '<h2>Notebook</h2><p onclick="evil()">A <em>word</em> <a href="javascript:evil()">bad</a> and <a href="https://example.org/ref">reference</a>.</p><figure><img src="https://example.org/spy.jpg" onerror="evil()" alt="Sea chart"/><figcaption>Figure 1: The chart.</figcaption></figure><iframe src="https://example.org/frame"></iframe><script>evil()</script><style>@import url(https://example.org/css)</style>'
  const safe = sanitizeHtml(html)
  expect(safe).toContain('<figure><span>[Image: Sea chart]</span><figcaption>Figure 1: The chart.</figcaption></figure>')
  expect(safe).toContain('<a href="https://example.org/ref">reference</a>')
  expect(safe).toContain('<a>bad</a>')
  expect(safe).not.toMatch(/script|iframe|onerror|onclick|src=|javascript:|@import/)
  const file = pasteEpub({ source: html, format: 'html', title: 'Notebook' })
  const edition = await epubToEdition(await data(file))
  expect(edition.chapters.flatMap(c => c.paragraphs).join(' ')).toContain('Figure 1: The chart.')
  expect(edition.chapters.flatMap(c => c.paragraphs).join(' ')).toContain('A _word_ bad and reference.')
  vi.unstubAllGlobals()
 })

 it('trims only requested lines, refuses empty and non-XML characters, and escapes plain text verbatim', () => {
  expect(detectFormat('# My notes\nA sentence')).toBe('markdown')
  expect(detectFormat('<h1>My notes</h1><p>A sentence</p>')).toBe('html')
  expect(detectFormat('A sentence with *asterisks* and <letters>.')).toBe('plain')
  expect(suggestedTitle('# My notes\nA sentence')).toBe('My notes')
  expect(suggestedTitle('A sentence with no explicit heading')).toBe('')
  expect(trimSource('Header\n\nActual & <text>\n\nFooter', 2, 2)).toBe('Actual & <text>')
  expect(preview('Actual & <text>\nNext', 'plain')).toBe('<p>Actual &amp; &lt;text&gt;<br/>Next</p>')
  expect(() => trimSource('one\ntwo', 1, 1)).toThrow(/no text/)
  expect(() => pasteEpub({ source: 'a\u0000b', title: 'Invalid' })).toThrow(/cannot preserve/)
  expect(() => pasteEpub({ source: 'a\uD800b', title: 'Invalid' })).toThrow(/cannot preserve/)
 })
})

describe('private Paste entry', () => {
 afterEach(() => { add.closeFileDialog(); document.body.replaceChildren(); document.documentElement.classList.remove('signed-in'); window.history.replaceState(null, '', '/') })
 const dialog = () => document.querySelector('[data-testid="own-file-dialog"]')!
 it('preserves the private URL switch through sign-in and Premium return', async () => {
  window.history.replaceState(null, '', '/library?sharedReader=1')
  const go = vi.fn(); await add.openFileEntry(null, {access: async () => true, go})
  expect(go).toHaveBeenCalledWith('/sign-in?returnTo=' + encodeURIComponent('/library?sharedReader=1#my-shelf'))
  go.mockClear(); await add.openFileEntry(null, {access: async () => false, go})
  expect(go).toHaveBeenCalledWith('/sign-in?mode=account&returnTo=' + encodeURIComponent('/library?sharedReader=1#my-shelf'))
 })
 function open(search: string, upload?: ReturnType<typeof vi.fn>) {
  window.history.replaceState(null, '', '/library' + search)
  document.documentElement.classList.add('signed-in')
  const key = 'a'.repeat(24), account = { id: 'book-id', sha256: key + 'a'.repeat(40) }
  const engine = { rightsConfirmed: () => true, readFile: async () => ({key:'epub:' + key, bytes:new Uint8Array([1])}), keepFile: async () => true, library: {touch: vi.fn()}, prepareEpub: async () => ({}), cloud: {mine: () => new Map()}, store: {get: () => ({v: '2026-10-08.2'})}, accountId: () => 'owner' }
  upload ??= vi.fn(async () => account)
  vi.stubGlobal('TinctAI', { books: { upload } })
  vi.stubGlobal('crypto', { randomUUID: () => '11111111-1111-4111-8111-111111111111' })
  const go = vi.fn(); add.openFileDialog({engine: async () => engine, go})
  return {go, upload, engine}
 }
 it('is URL gated, keeps default Add dialog unchanged, and opens the common private reader after confirmed account save', async () => {
  open('')
  expect(dialog().querySelector('.own-file-paste')).toBeNull(); add.closeFileDialog()
  const {go,upload} = open('?sharedReader=1')
  ;(dialog().querySelector('.own-file-paste') as HTMLButtonElement).click()
  const source = dialog().querySelector('.own-paste-source') as HTMLTextAreaElement
  source.value = 'Start\n\nActual\n\nEnd'; source.dispatchEvent(new Event('input'))
  const title = dialog().querySelector('.own-paste-title') as HTMLInputElement; title.value = 'A private text'; title.dispatchEvent(new Event('input'))
  ;(dialog().querySelector('.own-paste-trim-start') as HTMLInputElement).value = '2'
  ;(dialog().querySelector('.own-paste-trim-end') as HTMLInputElement).value = '2'
  source.dispatchEvent(new Event('input'))
  expect(dialog().querySelector('.own-paste-preview')?.textContent).toBe('Actual')
  ;(dialog().querySelector('.own-paste-save') as HTMLButtonElement).click()
  await vi.waitFor(() => expect(go).toHaveBeenCalledWith('/reader?userBook=' + 'a'.repeat(24) + '&sharedReader=1'))
  expect(upload).toHaveBeenCalledTimes(1)
  expect(upload.mock.calls[0][1]).toMatchObject({kind:'epub',title:'A private text'})
  vi.unstubAllGlobals()
 })
 it('stays editable and never navigates after account refusal', async () => {
  const upload = vi.fn(async () => { throw new Error('Account is full') }); const {go} = open('?sharedReader=1', upload)
  ;(dialog().querySelector('.own-file-paste') as HTMLButtonElement).click()
  ;(dialog().querySelector('.own-paste-source') as HTMLTextAreaElement).value = 'Actual text'
  ;(dialog().querySelector('.own-paste-title') as HTMLInputElement).value = 'My draft'
  ;(dialog().querySelector('.own-paste-save') as HTMLButtonElement).click()
  await vi.waitFor(() => expect(dialog().querySelector('.own-paste-error')?.textContent).toBe('Account is full'))
  expect(dialog().querySelector<HTMLTextAreaElement>('.own-paste-source')?.value).toBe('Actual text')
  expect(go).not.toHaveBeenCalled()
  vi.unstubAllGlobals()
 })
 it('ignores a second save tap while the first private upload is pending', async () => {
  let finish!: (value: {id:string;sha256:string}) => void
  const upload=vi.fn(() => new Promise<{id:string;sha256:string}>(resolve => { finish=resolve }))
  const {go}=open('?sharedReader=1',upload)
  ;(dialog().querySelector('.own-file-paste') as HTMLButtonElement).click()
  ;(dialog().querySelector('.own-paste-source') as HTMLTextAreaElement).value='A whole paragraph.'
  const save=dialog().querySelector('.own-paste-save') as HTMLButtonElement
  save.click();save.click()
  await vi.waitFor(() => expect(upload).toHaveBeenCalledTimes(1))
  expect(save.disabled).toBe(true)
  finish({id:'book-id',sha256:'a'.repeat(64)})
  await vi.waitFor(() => expect(go).toHaveBeenCalledTimes(1))
  vi.unstubAllGlobals()
 })
 it('shows the sanitized rich clipboard preview when its textarea displays plain words', () => {
  open('?sharedReader=1')
  ;(dialog().querySelector('.own-file-paste') as HTMLButtonElement).click()
  const source=dialog().querySelector('.own-paste-source') as HTMLTextAreaElement
  const event=new Event('paste',{cancelable:true}) as Event & { clipboardData?: {getData(type:string):string} }
  Object.defineProperty(event,'clipboardData',{value:{getData:(type:string)=>type==='text/html'?'<h1>My title</h1><p><em>Words</em><img src="https://example.org/spy.jpg" alt="Map"></p>':'My title\nWords'}})
  source.dispatchEvent(event)
  expect(event.defaultPrevented).toBe(true)
  expect(source.value).toBe('My title\nWords')
  expect(dialog().querySelector<HTMLDetailsElement>('.own-paste-details')?.open).toBe(true)
  expect(dialog().querySelector('.own-paste-rich-note')?.hasAttribute('hidden')).toBe(false)
  expect(dialog().querySelector('.own-paste-preview')?.textContent).toContain('[Image: Map]')
  expect(dialog().querySelector('.own-paste-preview img')).toBeNull()
  vi.unstubAllGlobals()
 })
 it('validates the EPUB before uploading and retries the same saved file after a late local failure', async () => {
  const {go, upload, engine} = open('?sharedReader=1')
  let calls = 0
  engine.prepareEpub = async () => { if (++calls === 2) throw new Error('Temporary local failure'); return {} }
  ;(dialog().querySelector('.own-file-paste') as HTMLButtonElement).click()
  ;(dialog().querySelector('.own-paste-source') as HTMLTextAreaElement).value = 'Actual text'
  ;(dialog().querySelector('.own-paste-title') as HTMLInputElement).value = 'My draft'
  ;(dialog().querySelector('.own-paste-save') as HTMLButtonElement).click()
  await vi.waitFor(() => expect(dialog().querySelector('.own-paste-error')?.textContent).toBe('Temporary local failure'))
  expect(upload).toHaveBeenCalledTimes(1)
  expect(go).not.toHaveBeenCalled()
  ;(dialog().querySelector('.own-paste-save') as HTMLButtonElement).click()
  await vi.waitFor(() => expect(go).toHaveBeenCalledTimes(1))
  expect(upload).toHaveBeenCalledTimes(1)
  vi.unstubAllGlobals()
 })
 it('edits only display title and author with the fetched revision and generation, then refreshes the shelf', async () => {
  const hex='a'.repeat(24), touch=vi.fn(), edit=vi.fn(async () => ({title:'Revised',author:'A. Reader',rev:2,fileId:'f'.repeat(32)})),saved=vi.fn()
  const metadata=vi.fn(async () => ({title:'Original',author:'',rev:1,fileId:'f'.repeat(32)}))
  vi.stubGlobal('TinctAI',{books:{metadata,editMetadata:edit}})
  const book={key:'epub:'+hex,title:'Original',author:'',kind:'epub'}
  const layer=await add.editOwnBookDetails(book,{engine:async()=>({library:{touch},cloud:{get:()=>null}}),onSaved:saved})
  expect(metadata).toHaveBeenCalledWith(hex)
  expect(layer.querySelector('.own-paste-title').value).toBe('Original')
  layer.querySelector('.own-paste-title').value='Revised';layer.querySelector('.own-paste-author').value='A. Reader'
  layer.querySelector('.tui-btn--primary').click()
  await vi.waitFor(() => expect(saved).toHaveBeenCalledWith({...book,title:'Revised',author:'A. Reader'}))
  expect(edit).toHaveBeenCalledWith(hex,{title:'Revised',author:'A. Reader',rev:1,fileId:'f'.repeat(32)})
  expect(touch).toHaveBeenCalledWith(book.key,{title:'Revised',author:'A. Reader',metadataRev:2})
  vi.unstubAllGlobals()
 })
 it('treats a committed account detail edit as success when the local cache write fails', async () => {
  const hex='a'.repeat(24), saved=vi.fn(), edit=vi.fn(async()=>({title:'New title',author:'',rev:1,fileId:'f'}))
  vi.stubGlobal('TinctAI',{books:{metadata:async()=>({title:'Old title',author:'',rev:0,fileId:'f'}),editMetadata:edit}})
  const book={key:'epub:'+hex,title:'Old title',author:'',kind:'epub'}
  const layer=await add.editOwnBookDetails(book,{engine:async()=>({library:{touch:async()=>{throw new Error('storage blocked')}},cloud:{get:()=>null}}),onSaved:saved})
  layer.querySelector('.own-paste-title').value='New title'
  layer.querySelector('.tui-btn--primary').click()
  await vi.waitFor(()=>expect(saved).toHaveBeenCalledWith({...book,title:'New title',author:''}))
  expect(edit).toHaveBeenCalledTimes(1)
  expect(document.querySelector('[data-testid="own-metadata-dialog"]')).toBeNull()
  vi.unstubAllGlobals()
 })
 it('deleting one owner’s same-hash book leaves another owner’s local text marks and quarantined legacy marks', () => {
  const hex='a'.repeat(24)
  vi.stubGlobal('TinctAI',{session:()=>({userId:'owner-a'})})
  localStorage.setItem(`tinct-addbook:text-marks-owner:${hex}`,'owner-b')
  localStorage.setItem(`tinct-addbook:text-marks-local:owner-a:${hex}`,'A')
  localStorage.setItem(`tinct-addbook:text-marks-sync:owner-a:${hex}`,'A')
  localStorage.setItem(`tinct-addbook:text-marks-local:owner-b:${hex}`,'B')
  localStorage.setItem(`tinct-addbook:text-marks-sync:owner-b:${hex}`,'B')
  localStorage.setItem(`tinct-addbook:text-marks-adopted:owner-a:${hex}`,'A')
  localStorage.setItem(`tinct-addbook:text-marks-adopted:owner-b:${hex}`,'B')
  for(const owner of ['owner-a','owner-b']){
   for(const kind of ['previous','quarantine'])localStorage.setItem(`tinct-addbook:text-marks-${kind}:${owner}:${hex}`,owner)
   for(const kind of ['canonical','local','sync','adopted','previous','quarantine'])localStorage.setItem(`tinct-addbook:text-cards-${kind}:${owner}:${hex}`,owner)
   for(const kind of ['marks','cards'])localStorage.setItem(`tinct-addbook:text-${kind}-canonical:${owner}:${hex}:${'f'.repeat(32)}`,owner)
   for(const kind of ['marks','cards','talk'])localStorage.setItem(`tinct-addbook:pdf-original-${kind}:${owner}:${'f'.repeat(32)}:${hex}`,owner)
  }
  localStorage.setItem(`tinct-addbook:text-marks-unassigned:${hex}`,'legacy')
  localStorage.setItem(`tinct-addbook:text-cards-owner:${hex}`,'owner-b')
  localStorage.setItem(`tinct-addbook:text-cards-unassigned:${hex}`,'legacy chat')
  localStorage.setItem(`tinct:chat-history:userbook-${hex}`,'B chat projection')
  for(const owner of ['owner-a','owner-b'])for(const kind of ['annotations','migrated'])localStorage.setItem(`tinct-addbook:legacy-epub-${kind}:${owner}:${hex}`,owner)
  localStorage.setItem(`tinct-addbook:legacy-epub-owner:${hex}`,'owner-b')
  add.forgetOwnBookHere(hex,[localStorage])
  expect(localStorage.getItem(`tinct-addbook:text-marks-local:owner-a:${hex}`)).toBeNull()
  expect(localStorage.getItem(`tinct-addbook:text-marks-sync:owner-a:${hex}`)).toBeNull()
  expect(localStorage.getItem(`tinct-addbook:text-marks-adopted:owner-a:${hex}`)).toBeNull()
  expect(localStorage.getItem(`tinct-addbook:text-marks-local:owner-b:${hex}`)).toBe('B')
  expect(localStorage.getItem(`tinct-addbook:text-marks-sync:owner-b:${hex}`)).toBe('B')
  expect(localStorage.getItem(`tinct-addbook:text-marks-adopted:owner-b:${hex}`)).toBe('B')
  expect(localStorage.getItem(`tinct-addbook:text-marks-owner:${hex}`)).toBe('owner-b')
  expect(localStorage.getItem(`tinct-addbook:text-marks-unassigned:${hex}`)).toBe('legacy')
  for(const kind of ['previous','quarantine']){expect(localStorage.getItem(`tinct-addbook:text-marks-${kind}:owner-a:${hex}`)).toBeNull();expect(localStorage.getItem(`tinct-addbook:text-marks-${kind}:owner-b:${hex}`)).toBe('owner-b')}
  for(const kind of ['canonical','local','sync','adopted','previous','quarantine']){expect(localStorage.getItem(`tinct-addbook:text-cards-${kind}:owner-a:${hex}`)).toBeNull();expect(localStorage.getItem(`tinct-addbook:text-cards-${kind}:owner-b:${hex}`)).toBe('owner-b')}
  for(const kind of ['marks','cards']){expect(localStorage.getItem(`tinct-addbook:text-${kind}-canonical:owner-a:${hex}:${'f'.repeat(32)}`)).toBeNull();expect(localStorage.getItem(`tinct-addbook:text-${kind}-canonical:owner-b:${hex}:${'f'.repeat(32)}`)).toBe('owner-b')}
  for(const kind of ['marks','cards','talk']){expect(localStorage.getItem(`tinct-addbook:pdf-original-${kind}:owner-a:${'f'.repeat(32)}:${hex}`)).toBeNull();expect(localStorage.getItem(`tinct-addbook:pdf-original-${kind}:owner-b:${'f'.repeat(32)}:${hex}`)).toBe('owner-b')}
  expect(localStorage.getItem(`tinct-addbook:text-cards-owner:${hex}`)).toBe('owner-b')
  expect(localStorage.getItem(`tinct-addbook:text-cards-unassigned:${hex}`)).toBe('legacy chat')
  expect(localStorage.getItem(`tinct:chat-history:userbook-${hex}`)).toBe('B chat projection')
  expect(localStorage.getItem(`tinct-addbook:legacy-epub-annotations:owner-a:${hex}`)).toBeNull()
  expect(localStorage.getItem(`tinct-addbook:legacy-epub-migrated:owner-a:${hex}`)).toBeNull()
  expect(localStorage.getItem(`tinct-addbook:legacy-epub-annotations:owner-b:${hex}`)).toBe('owner-b')
  expect(localStorage.getItem(`tinct-addbook:legacy-epub-migrated:owner-b:${hex}`)).toBe('owner-b')
  expect(localStorage.getItem(`tinct-addbook:legacy-epub-owner:${hex}`)).toBe('owner-b')
  localStorage.clear();vi.unstubAllGlobals()
 })
 it('deletes only the verified current owner’s React private marks and keeps public and other books',()=>{
  const hex='a'.repeat(24),id='userbook-'+hex,other='userbook-'+'b'.repeat(24)
  vi.stubGlobal('TinctAI',{session:()=>({userId:'owner-a'})})
  const own={id:'a',bookId:id}, unrelated={id:'b',bookId:other}, publicMark={id:'c',bookId:'frankenstein'}
  localStorage.setItem('tinct-lab-highlights',JSON.stringify([own,unrelated,publicMark]))
  localStorage.setItem(`tinct-addbook:text-marks-owner:${hex}`,'owner-a')
  localStorage.setItem(`tinct-addbook:text-marks-local:owner-a:${hex}`,JSON.stringify([own]))
  localStorage.setItem(`tinct-addbook:text-marks-local:owner-b:${hex}`,JSON.stringify([{id:'b-private',bookId:id}]))
  add.forgetOwnBookHere(hex,[localStorage])
  expect(JSON.parse(localStorage.getItem('tinct-lab-highlights')||'[]')).toEqual([unrelated,publicMark])
  expect(localStorage.getItem(`tinct-addbook:text-marks-local:owner-b:${hex}`)).not.toBeNull()
  localStorage.clear();vi.unstubAllGlobals()
 })
 it('preserves ambiguous global marks after a failed owner switch',()=>{
  const hex='a'.repeat(24),mark={id:'b',bookId:'userbook-'+hex}
  vi.stubGlobal('TinctAI',{session:()=>({userId:'owner-a'})})
  localStorage.setItem('tinct-lab-highlights',JSON.stringify([mark]))
  localStorage.setItem(`tinct-addbook:text-marks-owner:${hex}`,'owner-a')
  localStorage.setItem(`tinct-addbook:text-marks-local:owner-a:${hex}`,'[]')
  add.forgetOwnBookHere(hex,[localStorage])
  expect(JSON.parse(localStorage.getItem('tinct-lab-highlights')||'[]')).toEqual([mark])
  localStorage.clear();vi.unstubAllGlobals()
 })
 it('removes only an unambiguous claimed legacy chat projection',()=>{
  const hex='a'.repeat(24),global=`tinct:chat-history:userbook-${hex}`
  vi.stubGlobal('TinctAI',{session:()=>({userId:'owner-a'})})
  localStorage.setItem(global,'owned chat')
  localStorage.setItem(`tinct-addbook:text-cards-owner:${hex}`,'owner-a')
  add.forgetOwnBookHere(hex,[localStorage])
  expect(localStorage.getItem(global)).toBeNull()
  localStorage.setItem(global,'ambiguous')
  localStorage.setItem(`tinct-addbook:text-cards-owner:${hex}`,'owner-a')
  localStorage.setItem(`tinct-addbook:text-cards-canonical:owner-b:${hex}`,'other account')
  add.forgetOwnBookHere(hex,[localStorage])
  expect(localStorage.getItem(global)).toBe('ambiguous')
  localStorage.clear();vi.unstubAllGlobals()
 })
})
