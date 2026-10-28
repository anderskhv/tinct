// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { epubToEdition } from './lab/userBook/epubEdition'
import { SHARED_READER_DEFAULT } from './lab/sharedReader/sharedReaderFlag'
// @ts-expect-error -- shared browser module
import { detectFormat, markdownHtml, pasteEpub, preview, sanitizeHtml, suggestedTitle, trimSource } from '../public/lab/library_2/paste-text.js'
import '../public/lab/wait-ring.js'
// @ts-expect-error -- shared browser module
import * as add from '../public/lab/library_2/add-to-tinct.js'

const data = (file: File) => new Promise<Uint8Array>((resolve, reject) => {
 const reader = new FileReader(); reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer)); reader.onerror = () => reject(reader.error); reader.readAsArrayBuffer(file)
})

describe('private pasted source', () => {
 it('keeps wrapped archive prose in one paragraph across sentence boundaries', async () => {
  const source = 'WHEN on board the Beagle, as naturalist, I was\nmuch struck with certain facts in the distribution of the\ninhabitants of South America. These facts seemed to me to throw some light\non the origin of species.\nOn my return home, it occurred to me that\nsomething might perhaps be made out on this question.'
  const edition = await epubToEdition(await data(pasteEpub({source, format: 'plain', title: 'Prose control'})))
  expect(edition.chapters[0].paragraphs).toEqual([source.replace(/\s+/g, ' ')])
  expect(edition.chapters[0].kinds).toBeUndefined()
 })

 it('joins a printed prose wrap after an honorific instead of treating it as verse', async () => {
  const source = '"  I  may  thank  you,  Eliza,  for  this  piece  of  civility.  Mr. \nDarcy  would  never  have  come  so  soon  to  wait  upon  me."'
  const file = pasteEpub({source, format: 'plain', title: 'Pride and Prejudice'})
  const edition = await epubToEdition(await data(file))
  expect(edition.chapters[0].paragraphs).toEqual([source.replace(/\s+/g, ' ')])
  expect(edition.chapters[0].kinds).toBeUndefined()
  const legacy = await epubToEdition(await data(file), {rules: 7})
  expect(legacy.chapters[0].paragraphs).toHaveLength(2)
 })

 it('keeps the indented refrain in O Captain as separate authored lines', async () => {
  const source = "O Captain! my Captain! our fearful trip is done,\nThe ship has weather'd every rack, the prize we sought is won,\nThe port is near, the bells I hear, the people all exulting,\nWhile follow eyes the steady keel, the vessel grim and daring;\n    But O heart! heart! heart!\n     O the bleeding drops of red,\n       Where on the deck my Captain lies,\n         Fallen cold and dead."
  const edition = await epubToEdition(await data(pasteEpub({source, format: 'plain', title: 'Leaves of Grass'})))
  expect(edition.chapters[0].paragraphs).toEqual(source.split('\n').map(line => line.trim()))
  expect(edition.chapters[0].kinds).toEqual(Array(8).fill('line'))
 })

 it.each(['plain', 'html'])('keeps Whitman verse boundaries around a wrapped continuation (%s)', async format => {
  const source = 'Of physiology from top to toe I sing,\nNot physiognomy alone nor brain alone is worthy for the Muse, I say\n    the Form complete is worthier far,\nThe Female equally with the Male I sing.'
  const file = pasteEpub({source: format === 'html' ? '<pre>' + source + '</pre>' : source, format, title: 'Leaves of Grass'})
  const edition = await epubToEdition(await data(file))
  expect(edition.chapters[0].paragraphs).toEqual([
   'Of physiology from top to toe I sing,',
   'Not physiognomy alone nor brain alone is worthy for the Muse, I say the Form complete is worthier far,',
   'The Female equally with the Male I sing.',
  ])
  expect(edition.chapters[0].kinds).toEqual(['line', 'line', 'line'])
  const legacy = await epubToEdition(await data(file), { rules: 7 })
  expect(legacy.chapters[0].paragraphs).toEqual([source.replace(/\s+/g, ' ')])
  expect(legacy.converter).toBe(7)
 })

 it('keeps full-text archive clipboard paragraphs separate through EPUB conversion', async () => {
  const paragraphs = Array.from({length: 180}, (_, i) => `Passage ${i}: A reader follows these words.\nThe next source line remains here.`)
  const file = pasteEpub({source: '<pre>' + paragraphs.join('\n\n') + '</pre>', format: 'html', title: 'Archive text'})
  const edition = await epubToEdition(await data(file))
  const result = edition.chapters.flatMap(c => c.paragraphs)
  expect(result.length).toBeGreaterThanOrEqual(paragraphs.length)
  expect(Math.max(...result.map(p => p.length))).toBeLessThan(200)
  for (let i=0; i<paragraphs.length; i++) expect(result.join(' ')).toContain(`Passage ${i}:`)
 })

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

 it('does not reinterpret numbered OCR lines deep inside ordinary pasted prose as Markdown', async () => {
  const source = 'A complete historical work.\n\nThe preceding argument ends here.\n\n3. 4 GEOLOGICAL SUCCESSION\n\nCHAPTER X\n\nThe next argument begins here.'
  expect(detectFormat(source)).toBe('plain')
  const edition = await epubToEdition(await data(pasteEpub({ source, title: 'Historical work' })))
  expect(edition.chapters.flatMap(c => c.paragraphs).join(' ')).toContain('3. 4 GEOLOGICAL SUCCESSION')
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
 it('follows the build default and URL overrides, and opens the common private reader after confirmed account save', async () => {
  open('')
  expect(Boolean(dialog().querySelector('.own-file-paste'))).toBe(SHARED_READER_DEFAULT); add.closeFileDialog()
  open('?sharedReader=0')
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
 it('opens a text file in the visible editable preview before account upload', async () => {
  const {upload,go}=open('?sharedReader=1')
  const file=new File(['First paragraph.\n\nSecond paragraph.'],'Full text.txt',{type:'text/plain'})
  Object.defineProperty(file,'text',{value:async()=> 'First paragraph.\n\nSecond paragraph.'})
  const input=dialog().querySelector('input[type=file]') as HTMLInputElement
  Object.defineProperty(input,'files',{value:[file]});input.dispatchEvent(new Event('change'))
  await vi.waitFor(()=>expect(dialog().querySelector('.own-paste-preview')?.textContent).toContain('Second paragraph.'))
  expect(dialog().querySelector('.own-paste-preview')?.closest('details')).toBeNull()
  expect(dialog().querySelector<HTMLInputElement>('.own-paste-title')?.value).toBe('Full text')
  expect(upload).not.toHaveBeenCalled();expect(go).not.toHaveBeenCalled()
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
  for(const owner of ['owner-a','owner-b'])for(const kind of ['annotations','migrated','backup-quarantine'])localStorage.setItem(`tinct-addbook:legacy-epub-${kind}:${owner}:${hex}`,owner)
  localStorage.setItem(`tinct-addbook:legacy-epub-owner:${hex}`,'owner-b')
  for(const owner of ['owner-a','owner-b'])localStorage.setItem(`tinct:library-2-table:${owner}`,JSON.stringify([{bookId:'userbook-'+hex}]))
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
  expect(localStorage.getItem(`tinct-addbook:legacy-epub-backup-quarantine:owner-a:${hex}`)).toBeNull()
  expect(localStorage.getItem(`tinct-addbook:legacy-epub-backup-quarantine:owner-b:${hex}`)).toBe('owner-b')
  expect(localStorage.getItem(`tinct-addbook:legacy-epub-owner:${hex}`)).toBe('owner-b')
  expect(localStorage.getItem('tinct:library-2-table:owner-a')).toBeNull()
  expect(localStorage.getItem('tinct:library-2-table:owner-b')).toBe(JSON.stringify([{bookId:'userbook-'+hex}]))
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
  expect(localStorage.getItem(`tinct-addbook:text-marks-owner:${hex}`)).toBe('owner-a')
  expect(localStorage.getItem(`tinct-addbook:text-marks-local:owner-a:${hex}`)).toBe('[]')
  localStorage.setItem('tinct-lab-highlights','{malformed')
  add.forgetOwnBookHere(hex,[localStorage])
  expect(localStorage.getItem(`tinct-addbook:text-marks-owner:${hex}`)).toBe('owner-a')
  expect(localStorage.getItem(`tinct-addbook:text-marks-local:owner-a:${hex}`)).toBe('[]')
  expect(localStorage.getItem('tinct-lab-highlights')).toBe('{malformed')
  localStorage.clear();vi.unstubAllGlobals()
 })
 it('removes only an unambiguous claimed legacy chat projection',()=>{
  const hex='a'.repeat(24),global=`tinct:chat-history:userbook-${hex}`
  vi.stubGlobal('TinctAI',{session:()=>({userId:'owner-a'})})
  const owned=[{id:'owned-chat',bookId:'userbook-'+hex,messages:[]}]
  localStorage.setItem(global,JSON.stringify(owned))
  localStorage.setItem(`tinct-addbook:text-cards-owner:${hex}`,'owner-a')
  localStorage.setItem(`tinct-addbook:text-cards-canonical:owner-a:${hex}:${'f'.repeat(32)}`,JSON.stringify({conversations:owned,items:[],rev:0,dirty:false}))
  add.forgetOwnBookHere(hex,[localStorage])
  expect(localStorage.getItem(global)).toBeNull()
  localStorage.setItem(global,JSON.stringify([{id:'other-chat',bookId:'userbook-'+hex,messages:[]}]))
  localStorage.setItem(`tinct-addbook:text-cards-owner:${hex}`,'owner-a')
  localStorage.setItem(`tinct-addbook:text-cards-canonical:owner-a:${hex}:${'f'.repeat(32)}`,JSON.stringify({conversations:owned,items:[],rev:0,dirty:false}))
  localStorage.setItem(`tinct-addbook:text-cards-canonical:owner-b:${hex}`,'other account')
  add.forgetOwnBookHere(hex,[localStorage])
  expect(JSON.parse(localStorage.getItem(global)||'[]')[0].id).toBe('other-chat')
  expect(localStorage.getItem(`tinct-addbook:text-cards-owner:${hex}`)).toBe('owner-a')
  expect(localStorage.getItem(`tinct-addbook:text-cards-canonical:owner-a:${hex}:${'f'.repeat(32)}`)).not.toBeNull()
  localStorage.setItem(global,'{malformed')
  add.forgetOwnBookHere(hex,[localStorage])
  expect(localStorage.getItem(global)).toBe('{malformed')
  expect(localStorage.getItem(`tinct-addbook:text-cards-owner:${hex}`)).toBe('owner-a')
  localStorage.clear();vi.unstubAllGlobals()
 })
 it('proves both static EPUB raw arrays match this owner’s backup before removing legacy claim',()=>{
  const hex='a'.repeat(24),owner='owner-a',claim=`tinct-addbook:legacy-epub-owner:${hex}`
  const backup=`tinct-addbook:legacy-epub-annotations:${owner}:${hex}`
  const marks=`tinct-addbook:hl:epub:${hex}`,cards=`tinct-addbook:cards:epub:${hex}`
  const record={id:'owned'},other={id:'someone-else'}
  vi.stubGlobal('TinctAI',{session:()=>({userId:owner})})
  localStorage.setItem(claim,owner)
  localStorage.setItem(backup,JSON.stringify({marks:[record],cards:[]}))
  localStorage.setItem(marks,JSON.stringify([other]))
  localStorage.setItem(cards,'[]')
  add.forgetOwnBookHere(hex,[localStorage])
  expect(localStorage.getItem(claim)).toBe(owner)
  expect(localStorage.getItem(backup)).toBe(JSON.stringify({marks:[record],cards:[]}))
  expect(localStorage.getItem(marks)).toBe(JSON.stringify([other]))
  expect(localStorage.getItem(cards)).toBe('[]')
  localStorage.setItem(marks,'{malformed')
  add.forgetOwnBookHere(hex,[localStorage])
  expect(localStorage.getItem(claim)).toBe(owner)
  expect(localStorage.getItem(backup)).not.toBeNull()
  expect(localStorage.getItem(marks)).toBe('{malformed')
  localStorage.setItem(marks,JSON.stringify([record]))
  add.forgetOwnBookHere(hex,[localStorage])
  for(const key of [claim,backup,marks,cards])expect(localStorage.getItem(key)).toBeNull()
  localStorage.setItem(marks,JSON.stringify([other]))
  add.forgetOwnBookHere(hex,[localStorage])
  expect(localStorage.getItem(marks)).toBe(JSON.stringify([other]))
  localStorage.clear();vi.unstubAllGlobals()
 })
 it('clears only this account’s scoped static EPUB annotations across same-hash library deletion',()=>{
  const hex='c'.repeat(24),key=owner=>`tinct-addbook:static-epub-marks:${owner}:${hex}`
  vi.stubGlobal('TinctAI',{session:()=>({userId:'owner-b'})})
  localStorage.setItem(key('owner-a'),'A private marks')
  localStorage.setItem(key('owner-b'),'B private marks')
  localStorage.setItem(`tinct-addbook:hl:epub:${hex}`,'[{"id":"A"}]')
  localStorage.setItem(`tinct-addbook:legacy-epub-owner:${hex}`,'owner-a')
  add.forgetOwnBookHere(hex,[localStorage])
  expect(localStorage.getItem(key('owner-b'))).toBeNull()
  expect(localStorage.getItem(key('owner-a'))).toBe('A private marks')
  expect(localStorage.getItem(`tinct-addbook:hl:epub:${hex}`)).toBe('[{"id":"A"}]')
  localStorage.clear();vi.unstubAllGlobals()
 })
 it('signed-out library deletion removes guest EPUB rows without touching a foreign raw claim',()=>{
  const hex='d'.repeat(24)
  vi.stubGlobal('TinctAI',{session:()=>({userId:null})})
  localStorage.setItem(`tinct-addbook:static-epub-guest-marks:${hex}`,'guest mark')
  localStorage.setItem(`tinct-addbook:static-epub-guest-cards:${hex}`,'guest card')
  localStorage.setItem(`tinct-addbook:hl:epub:${hex}`,'foreign mark')
  localStorage.setItem(`tinct-addbook:legacy-epub-owner:${hex}`,'owner-a')
  add.forgetOwnBookHere(hex,[localStorage])
  expect(localStorage.getItem(`tinct-addbook:static-epub-guest-marks:${hex}`)).toBeNull()
  expect(localStorage.getItem(`tinct-addbook:static-epub-guest-cards:${hex}`)).toBeNull()
  expect(localStorage.getItem(`tinct-addbook:hl:epub:${hex}`)).toBe('foreign mark')
  expect(localStorage.getItem(`tinct-addbook:legacy-epub-owner:${hex}`)).toBe('owner-a')
  localStorage.clear();vi.unstubAllGlobals()
 })
 it('uses conservative second cleanup when a stale shelf lookup precedes cloud-only deletion',async()=>{
  const hex='e'.repeat(24),key='epub:'+hex,removeBook=vi.fn(async()=>true)
  vi.stubGlobal('TinctAI',{session:()=>({userId:'owner-a'})})
  // This lookup appears local, but the engine's owner check may subsequently
  // discover B's IndexedDB record and delete only A's cloud copy.
  const api={library:{get:async()=>({key})},cloud:{refresh:vi.fn()},removeBook}
  localStorage.setItem(`tinct-addbook:place:${hex}`,'B place')
  localStorage.setItem(`tinct-addbook:ocr:${hex}`,'B scan')
  localStorage.setItem(`tinct-addbook:pos:${key}`,'B position')
  localStorage.setItem(`tinct-addbook:static-epub-cards:owner-a:${hex}`,'A card')
  localStorage.setItem(`tinct-addbook:static-epub-cards:owner-b:${hex}`,'B card')
  localStorage.setItem('tinct:library-2-table:owner-a',JSON.stringify([{key}]))
  localStorage.setItem('tinct:library-2-table:owner-b',JSON.stringify([{key}]))
  expect(await add.deleteUpload({key},{engine:async()=>api,storages:[localStorage]})).toBe(true)
  expect(removeBook).toHaveBeenCalledWith(key)
  for(const name of [`tinct-addbook:place:${hex}`,`tinct-addbook:ocr:${hex}`,`tinct-addbook:pos:${key}`])expect(localStorage.getItem(name)).toBeTruthy()
  expect(localStorage.getItem(`tinct-addbook:static-epub-cards:owner-a:${hex}`)).toBeNull()
  expect(localStorage.getItem(`tinct-addbook:static-epub-cards:owner-b:${hex}`)).toBe('B card')
  expect(localStorage.getItem('tinct:library-2-table:owner-a')).not.toBeNull()
  expect(localStorage.getItem('tinct:library-2-table:owner-b')).not.toBeNull()
  localStorage.clear();vi.unstubAllGlobals()
 })
 it('stops library second cleanup when a different account signs in during deletion',async()=>{
  const hex='f'.repeat(24),key='epub:'+hex
  let account='owner-a',token='token-a',finish!: (gone:boolean)=>void
  vi.stubGlobal('TinctAI',{session:()=>({userId:account,token})})
  const removeBook=vi.fn(()=>new Promise<boolean>(resolve=>{finish=resolve}))
  const api={library:{get:async()=>({key})},cloud:{refresh:vi.fn()},removeBook}
  localStorage.setItem(`tinct-addbook:static-epub-cards:owner-a:${hex}`,'A card')
  localStorage.setItem(`tinct-addbook:static-epub-cards:owner-b:${hex}`,'B card')
  const deleting=add.deleteUpload({key},{engine:async()=>api,storages:[localStorage]})
  await vi.waitFor(()=>expect(removeBook).toHaveBeenCalledWith(key))
  account='owner-b';token='token-b'
  finish(false)
  expect(await deleting).toBe(false)
  expect(localStorage.getItem(`tinct-addbook:static-epub-cards:owner-a:${hex}`)).toBe('A card')
  expect(localStorage.getItem(`tinct-addbook:static-epub-cards:owner-b:${hex}`)).toBe('B card')
  localStorage.clear();vi.unstubAllGlobals()
 })
})
