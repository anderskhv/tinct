// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { emptyLabPositionState } from './lab/labPosition'
import type { RecapLoadDeps } from './readingMemory/recapLoad'

const calls = vi.hoisted(() => ({
  membership: vi.fn(), saved: vi.fn(),
  auth: vi.fn(), memory: vi.fn(), localPositions: vi.fn(), cloudPositions: vi.fn(),
  completions: vi.fn(), readingList: vi.fn(), readMemory: vi.fn(),
  readPosition: vi.fn(), writePosition: vi.fn(), putPosition: vi.fn(),
}))
vi.mock('./libraryTwoSaved', () => ({ loadShelfMembership: calls.membership, setSavedBook: calls.saved, loadSavedBooks: vi.fn() }))
vi.mock('./services/supabase', () => ({
  supabase: {
    auth: { getSession: calls.auth },
    from: () => ({ select: () => ({ eq: () => ({ or: calls.completions }) }) }),
  },
  isSupabaseConfigured: () => true,
}))
vi.mock('./readingMemory/recapLoad', () => ({ loadRecap: calls.memory }))
vi.mock('./lab/labPositionStore', () => ({
  prepareLabPositionLocal: calls.localPositions, fetchLabPositionCloud: calls.cloudPositions,
  readLabPositionLocal: calls.readPosition, writeLabPositionLocal: calls.writePosition, putLabPositionCloud: calls.putPosition,
}))
vi.mock('./readingMemory/deviceStore', async original => ({
  ...await original<typeof import('./readingMemory/deviceStore')>(), readDeviceReadingMemory: calls.readMemory,
}))
vi.mock('./preReader/libraryRecap', async original => ({
  ...await original<typeof import('./preReader/libraryRecap')>(), readingList: calls.readingList,
}))

function gate<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}

beforeEach(() => { calls.readPosition.mockReturnValue(emptyLabPositionState('device-a', null)); calls.writePosition.mockImplementation(value => value); calls.membership.mockResolvedValue({ removed: [], tableHidden: [] }); calls.saved.mockResolvedValue({ ids: [], synced: true }) })
afterEach(() => { vi.unstubAllGlobals(); vi.resetAllMocks(); vi.resetModules(); localStorage.clear() })

it('removes only shelf visibility and syncs the merged record without altering saved places', async () => {
  calls.auth.mockResolvedValue({ data: { session: { user: { id: 'viewer-a' }, access_token: 'token-a' } } })
  const state = emptyLabPositionState('device-a', 'viewer-a')
  state.books.hamlet = { bookId: 'hamlet', headerBook: 'Hamlet', chapterNumber: 3, sequentialChapter: 3, paragraphIndex: 11, wordIndex: 23, pageIndex: 4, primaryEditionKey: 'original-en', updatedAt: 100, deviceId: 'device-a', rev: 2 }
  state.finished.hamlet = [1, 2]
  state.lastSettledBookId = 'hamlet'
  state.lastSettledAt = 100
  const before = structuredClone(state)
  calls.readPosition.mockReturnValue(state)
  calls.writePosition.mockImplementation(next => ({ ...next, deviceId: 'merged-device' }))
  calls.putPosition.mockResolvedValue(true)
  localStorage.setItem('tinct:library-2-table:viewer-a', '{}')
  localStorage.setItem('tinct:library-2-table:viewer-b', '{"private":true}')
  localStorage.setItem('tinct:bookmarks:hamlet', 'unchanged')
  const { hideFromReadingNow } = await import('./libraryTwoReading')
  await hideFromReadingNow('hamlet')
  expect(calls.saved).toHaveBeenCalledWith('hamlet', true, { tableHidden: true })
  const written = calls.writePosition.mock.calls[0][0]
  expect(written.hidden.hamlet).toBeGreaterThan(100)
  expect(written.books).toEqual(before.books)
  expect(written.finished).toEqual(before.finished)
  expect(written.lastSettledBookId).toBe(before.lastSettledBookId)
  expect(written.lastSettledAt).toBe(before.lastSettledAt)
  expect(state).toEqual(before)
  expect(calls.putPosition).toHaveBeenCalledWith('token-a', { ...written, deviceId: 'merged-device' })
  expect(localStorage.getItem('tinct:library-2-table:viewer-a')).toBeNull()
  expect(localStorage.getItem('tinct:library-2-table:viewer-b')).toBe('{"private":true}')
  expect(localStorage.getItem('tinct:bookmarks:hamlet')).toBe('unchanged')
})

it('does not remove a previous account’s book after an account switch', async () => {
  calls.auth.mockResolvedValue({ data: { session: { user: { id: 'viewer-b' }, access_token: 'token-b' } } })
  calls.readPosition.mockReturnValue(emptyLabPositionState('device-a', 'viewer-a'))
  const { hideFromReadingNow } = await import('./libraryTwoReading')
  await expect(hideFromReadingNow('hamlet')).rejects.toThrow('Account changed')
  expect(calls.writePosition).not.toHaveBeenCalled()
  expect(calls.putPosition).not.toHaveBeenCalled()
})

it('a hidden Bible keeps its biblical book, sequential chapter and exact saved location', async () => {
  calls.auth.mockResolvedValue({ data: { session: null } })
  const state = emptyLabPositionState('device-a', null)
  state.books.zechariah = { bookId: 'zechariah', headerBook: 'Zechariah', chapterNumber: 8, sequentialChapter: 919, paragraphIndex: 11, wordIndex: 23, pageIndex: 4, primaryEditionKey: 'bsb', updatedAt: 100, deviceId: 'device-a', rev: 1 }
  state.hidden.bible = 200
  state.lastSettledBookId = 'zechariah'
  state.lastSettledAt = 100
  calls.localPositions.mockResolvedValue(state)
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ books: [{ id: 'bible', title: 'The Bible', author: 'Various', defaultEditionKey: 'bsb', editions: [{ key: 'bsb', language: 'en', style: 'original' }], readingStructure: { chapters: [{ number: 919, title: 'Zechariah 8', paragraphCount: 40 }] } }]}))))
  const { readerDestination } = await import('./libraryTwoReading')
  expect(await readerDestination('bible')).toBe('/reader')
  expect(JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff')!)).toMatchObject({ bookId: 'bible', primaryEditionKey: 'bsb', savedPlace: { bookId: 'bible', chapterNumber: 919, page: 4, paragraphIndex: 11, wordIndex: 23 } })
  expect(calls.writePosition).not.toHaveBeenCalled()
})

it('resolves the viewer, runs independent reads together, and builds the shelf only after every mirror is ready', async () => {
  const account = gate<{ data: { session: { user: { id: string }; access_token: string } } }>()
  const memory = gate<null>()
  const positions = gate<ReturnType<typeof emptyLabPositionState>>()
  const completions = gate<{ data: Array<{ key: string; value: unknown }>; error: null }>()
  calls.auth.mockReturnValue(account.promise)
  calls.memory.mockReturnValue(memory.promise)
  calls.localPositions.mockResolvedValue(emptyLabPositionState('device-a', 'viewer-a'))
  calls.cloudPositions.mockReturnValue(positions.promise)
  calls.completions.mockReturnValue(completions.promise)
  calls.readMemory.mockReturnValue({ version: 1, sessions: {}, updatedAt: 777 })
  calls.readingList.mockReturnValue({ readingNow: [], finished: [] })
  const fetch = vi.fn(async () => new Response(JSON.stringify({ books: [] }), { headers: { 'Content-Type': 'application/json' } }))
  vi.stubGlobal('fetch', fetch)

  const { loadReadingTable } = await import('./libraryTwoReading')
  let settled = false
  const table = loadReadingTable().then(value => { settled = true; return value })
  await vi.waitFor(() => expect(calls.auth).toHaveBeenCalled())
  expect(calls.memory).not.toHaveBeenCalled()
  expect(calls.cloudPositions).not.toHaveBeenCalled()
  expect(calls.completions).not.toHaveBeenCalled()

  account.resolve({ data: { session: { user: { id: 'viewer-a' }, access_token: 'viewer-token' } } })
  await vi.waitFor(() => {
    expect(calls.memory).toHaveBeenCalledOnce()
    expect(calls.cloudPositions).toHaveBeenCalledWith('viewer-token')
    expect(calls.completions).toHaveBeenCalledOnce()
  })
  expect(calls.readingList).not.toHaveBeenCalled()
  expect(settled).toBe(false)

  // Chapter content is irrelevant to the shelf and must not add a download or
  // accidentally enable generation while resolving its reading-memory mirror.
  const deps = calls.memory.mock.calls[0][0] as RecapLoadDeps
  expect(deps.allowSummary).toBe(false)
  expect(deps.requestSummary).toBeUndefined()
  expect(await deps.loadChapter({ bookId: 'hamlet' } as never)).toBeNull()
  expect(fetch.mock.calls).toHaveLength(1) // catalogue only

  memory.resolve(null)
  const cloud = emptyLabPositionState('cloud', 'viewer-a')
  cloud.updatedAt = 999
  positions.resolve(cloud)
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(calls.readingList).not.toHaveBeenCalled()
  expect(settled).toBe(false)

  completions.resolve({ data: [{ key: 'book-completed:hamlet', value: { bookId: 'hamlet' } }], error: null })
  expect(await table).toEqual({ mode: 'new', reading: [], finished: [], shelfReading: [] })
  expect(calls.readingList).toHaveBeenCalledOnce()
  expect(calls.readingList.mock.calls[0][0]).toMatchObject({
    viewer: 'viewer-a', memory: { updatedAt: 777 }, positions: { updatedAt: 999 },
    completedBookIds: new Set(['hamlet']),
  })
})

it('shares the raw catalogue and warms account-owned artwork before a slow completion read, without exposing a partial shelf', async () => {
  const completed = gate<{ data: []; error: null }>()
  const auth = gate<{ data: { session: { user: { id: string }; access_token: string } } }>()
  calls.auth.mockReturnValue(auth.promise)
  calls.memory.mockResolvedValue(null)
  const local = emptyLabPositionState('device-a', 'viewer-a')
  local.books.hamlet = { bookId: 'hamlet', chapterNumber: 1, paragraphIndex: 0, updatedAt: 100 } as never
  calls.localPositions.mockResolvedValue(local)
  calls.cloudPositions.mockResolvedValue(emptyLabPositionState('cloud', 'viewer-a'))
  calls.completions.mockReturnValue(completed.promise)
  calls.readMemory.mockReturnValue({ version: 1, sessions: {}, updatedAt: 100 })
  calls.readingList.mockReturnValue({ readingNow: [], finished: [] })
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  const onArtwork = vi.fn()
  const books = [{ id: 'hamlet', title: 'Hamlet', author: 'William Shakespeare', discoveryAvailable: false, art: { src: '/covers/hamlet.webp', srcSet: '' }, cover: { background: '#222222' }, editions: [] }]
  const { loadReadingTable } = await import('./libraryTwoReading')
  let settled = false
  const result = loadReadingTable({ catalogue: Promise.resolve({ books }), onArtwork }).then(value => { settled = true; return value })
  await vi.waitFor(() => expect(calls.auth).toHaveBeenCalled())
  expect(onArtwork).not.toHaveBeenCalled()
  auth.resolve({ data: { session: { user: { id: 'viewer-a' }, access_token: 'token' } } })
  await vi.waitFor(() => expect(onArtwork).toHaveBeenCalledWith([{ bookId: 'hamlet', cover: '/covers/hamlet.webp', tone: '#222222' }]))
  expect(settled).toBe(false)
  expect(calls.readingList).not.toHaveBeenCalled()
  expect(fetch).not.toHaveBeenCalled()
  completed.resolve({ data: [], error: null })
  await result
  expect(calls.readingList.mock.calls[0][0].books.has('hamlet')).toBe(true)
})

it('never warms a previous account’s artwork from its local positions', async () => {
  calls.auth.mockResolvedValue({ data: { session: { user: { id: 'viewer-b' }, access_token: 'token-b' } } })
  calls.memory.mockResolvedValue(null)
  const local = emptyLabPositionState('device-a', 'viewer-a')
  local.books.hamlet = { bookId: 'hamlet', chapterNumber: 1, paragraphIndex: 0, updatedAt: 100 } as never
  calls.localPositions.mockResolvedValue(local)
  calls.cloudPositions.mockResolvedValue(emptyLabPositionState('cloud', 'viewer-b'))
  calls.completions.mockResolvedValue({ data: [], error: null })
  calls.readMemory.mockReturnValue({ version: 1, sessions: {}, updatedAt: 100 })
  calls.readingList.mockReturnValue({ readingNow: [], finished: [] })
  const onArtwork = vi.fn()
  const { loadReadingTable } = await import('./libraryTwoReading')
  await loadReadingTable({ catalogue: Promise.resolve({ books: [{ id: 'hamlet', title: 'Hamlet', author: 'William Shakespeare', art: { src: '/covers/hamlet.webp', srcSet: '' }, editions: [] }] }), onArtwork })
  expect(onArtwork.mock.calls.flatMap(([books]) => books)).toEqual([])
})

it('hands Continue the exact saved edition and location without writing a reading position', async () => {
  calls.auth.mockResolvedValue({data:{session:null}})
  calls.memory.mockResolvedValue(null)
  const positions = emptyLabPositionState('device-a', null)
  calls.localPositions.mockResolvedValue(positions)
  calls.readMemory.mockReturnValue({version:1,sessions:{},updatedAt:0})
  const target={chapterNumber:7,pageIndex:4,paragraphIndex:11,wordIndex:23,editionKey:'original-en',chapterLabel:'Chapter 7',at:Date.now()}
  calls.readingList.mockReturnValue({readingNow:[{bookId:'frankenstein',target,finishedChapters:[],progress:'middle',lastActiveAt:Date.now(),session:null}],finished:[]})
  const before = JSON.stringify(positions)
  localStorage.setItem('tinct-lab-position',before)
  const api=await import('./libraryTwoReading')
  await api.loadReadingTable({catalogue:Promise.resolve({books:[{id:'frankenstein',title:'Frankenstein',author:'Mary Shelley',defaultEditionKey:'modern-en',editions:[{key:'original-en',language:'en',style:'original'},{key:'modern-en',language:'en',style:'modern'}],readingStructure:{chapters:[{number:7,title:'Chapter 7',paragraphCount:40}]}}]})})
  expect(await api.readerDestination('frankenstein',null)).toBe('/reader')
  expect(JSON.parse(sessionStorage.getItem('tinct:lab-reader-handoff')!)).toMatchObject({bookId:'frankenstein',primaryEditionKey:'original-en',savedPlace:{bookId:'frankenstein',chapterNumber:7,page:4,paragraphIndex:11,wordIndex:23}})
  expect(localStorage.getItem('tinct-lab-position')).toBe(before)
})

it('paints only the resolved viewer’s cached shelf while fresh cloud state is pending',async()=>{
 const auth=gate<{data:{session:{user:{id:string};access_token:string}}}>(),completed=gate<{data:[];error:null}>();
 calls.auth.mockReturnValue(auth.promise);calls.memory.mockResolvedValue(null);
 calls.localPositions.mockResolvedValue(emptyLabPositionState('device-b','viewer-b'));
 calls.cloudPositions.mockResolvedValue(emptyLabPositionState('cloud','viewer-b'));
 calls.completions.mockReturnValue(completed.promise);calls.readMemory.mockReturnValue({version:1,sessions:{},updatedAt:0});calls.readingList.mockReturnValue({readingNow:[],finished:[]});
 const cached={mode:'returning',reading:[{bookId:'hamlet',title:'Hamlet'}],finished:[]};
 localStorage.setItem('tinct:library-2-table:viewer-a',JSON.stringify({mode:'returning',reading:[{bookId:'private-book'}],finished:[]}));
 localStorage.setItem('tinct:library-2-table:viewer-b',JSON.stringify(cached));
 const onCached=vi.fn(),{loadReadingTable}=await import('./libraryTwoReading');
 const result=loadReadingTable({catalogue:Promise.resolve({books:[]}),onCached});expect(onCached).not.toHaveBeenCalled();
 auth.resolve({data:{session:{user:{id:'viewer-b'},access_token:'token'}}});await vi.waitFor(()=>expect(onCached).toHaveBeenCalledWith(cached));
 expect(calls.readingList).not.toHaveBeenCalled();completed.resolve({data:[],error:null});await result;
 expect(JSON.parse(localStorage.getItem('tinct:library-2-table:viewer-b')!)).toEqual({mode:'new',reading:[],finished:[],shelfReading:[]});
})

it('excludes desk removals from all active-reading lists and honours shelf removals despite old reading history', async () => {
  calls.auth.mockResolvedValue({data:{session:null}})
  const positions = emptyLabPositionState('device-a', null)
  calls.localPositions.mockResolvedValue(positions)
  calls.memory.mockResolvedValue(null)
  calls.readMemory.mockReturnValue({version:1,sessions:{},updatedAt:0})
  calls.membership.mockResolvedValue({removed:['hamlet'],tableHidden:['frankenstein']})
  const target={chapterNumber:1,pageIndex:0,paragraphIndex:0,wordIndex:0,editionKey:'original-en',chapterLabel:'Chapter 1',at:100}
  const row=(bookId:string)=>({bookId,target,finishedChapters:[],progress:'middle',lastActiveAt:100,session:null})
  calls.readingList.mockReturnValue({readingNow:[row('hamlet'),row('frankenstein'),row('crito')],finished:[]})
  const books=['hamlet','frankenstein','crito'].map(id=>({id,title:id,author:'Author',defaultEditionKey:'original-en',editions:[{key:'original-en',language:'en',style:'original'}],readingStructure:{chapters:[{number:1,title:'Chapter 1',paragraphCount:40}]}}))
  const {loadReadingTable}=await import('./libraryTwoReading')
  const table=await loadReadingTable({catalogue:Promise.resolve({books})})
  expect(table.reading.map(book=>book.bookId)).toEqual(['crito'])
  expect(table.shelfReading?.map(book=>book.bookId)).toEqual(['crito'])
  expect(calls.readingList.mock.calls[0][0].positions.hidden).toEqual({})
  expect(calls.writePosition).not.toHaveBeenCalled()
})

it('keeps all received account pins when a later library refresh returns an older subset', async () => {
  calls.auth.mockResolvedValue({data:{session:{user:{id:'viewer-a'},access_token:'token'}}})
  let device = emptyLabPositionState('device-a', 'viewer-a')
  calls.localPositions.mockImplementation(async()=>structuredClone(device))
  calls.readPosition.mockImplementation(()=>structuredClone(device))
  calls.writePosition.mockImplementation(next=>{ device=structuredClone(next);return next })
  calls.memory.mockResolvedValue(null)
  calls.completions.mockResolvedValue({data:[],error:null})
  calls.readMemory.mockReturnValue({version:1,sessions:{},updatedAt:0})
  const real = await vi.importActual<typeof import('./preReader/libraryRecap')>('./preReader/libraryRecap')
  calls.readingList.mockImplementation(real.readingList)
  vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}')))
  const pin=(bookId:string,at:number)=>({bookId,headerBook:bookId,chapterNumber:1,sequentialChapter:1,paragraphIndex:3,wordIndex:7,pageIndex:1,primaryEditionKey:'original-en',updatedAt:at,deviceId:'phone',rev:1})
  const cloud=emptyLabPositionState('phone','viewer-a')
  cloud.books={confessions:pin('confessions',100),hamlet:pin('hamlet',200),'to-the-lighthouse':pin('to-the-lighthouse',300)}
  cloud.lastSettledBookId='to-the-lighthouse';cloud.lastSettledAt=300;cloud.updatedAt=300
  calls.cloudPositions.mockResolvedValueOnce(cloud)
  const books=Object.keys(cloud.books).map(id=>({id,title:id,author:'Author',defaultEditionKey:'original-en',editions:[{key:'original-en',language:'en',style:'original'}],readingStructure:{chapters:[1,2,3].map(number=>({number,title:'Chapter '+number,paragraphCount:40}))}}))
  const api=await import('./libraryTwoReading')
  expect((await api.loadReadingTable({catalogue:Promise.resolve({books})})).reading.map(book=>book.bookId)).toContain('confessions')
  expect(device.books.confessions).toEqual(cloud.books.confessions)
  expect(device.lastSettledAt).toBe(300)
  const older={...cloud,books:{hamlet:cloud.books.hamlet},lastSettledBookId:'hamlet',lastSettledAt:200}
  calls.cloudPositions.mockResolvedValueOnce(older)
  const refreshed=await api.loadReadingTable()
  expect(refreshed.reading.map(book=>book.bookId)).toHaveLength(3)
  expect(refreshed.shelfReading?.map(book=>book.bookId)).toContain('confessions')
  calls.cloudPositions.mockResolvedValueOnce(null)
  expect((await api.loadReadingTable()).reading.map(book=>book.bookId)).toHaveLength(3)
  expect(device.books.confessions).toEqual(cloud.books.confessions)
  expect(calls.putPosition).not.toHaveBeenCalled()
})

it('never mirrors a response after the account changed, or merges over another owner’s device record', async () => {
  let user='viewer-a'
  calls.auth.mockImplementation(async()=>({data:{session:{user:{id:user},access_token:'token'}}}))
  const local=emptyLabPositionState('device-a','viewer-a')
  calls.localPositions.mockResolvedValue(local)
  calls.readPosition.mockReturnValue(emptyLabPositionState('device-a','viewer-b'))
  calls.memory.mockResolvedValue(null);calls.completions.mockResolvedValue({data:[],error:null})
  calls.readMemory.mockReturnValue({version:1,sessions:{},updatedAt:0})
  calls.readingList.mockReturnValue({readingNow:[],finished:[]})
  const cloud=emptyLabPositionState('cloud','viewer-a')
  calls.cloudPositions.mockResolvedValue(cloud)
  const api=await import('./libraryTwoReading')
  await api.loadReadingTable({catalogue:Promise.resolve({books:[]})})
  expect(calls.writePosition).not.toHaveBeenCalled()
  const request=gate<typeof cloud>();calls.cloudPositions.mockReturnValue(request.promise)
  const loading=api.loadReadingTable()
  await vi.waitFor(()=>expect(calls.cloudPositions).toHaveBeenCalledTimes(2))
  user='viewer-b';request.resolve(cloud)
  await expect(loading).rejects.toThrow('Account changed')
  expect(calls.writePosition).not.toHaveBeenCalled()
})

it('returns a removed or desk-hidden book to Currently reading once it is read again after the removal', async () => {
  calls.auth.mockResolvedValue({data:{session:null}})
  calls.localPositions.mockResolvedValue(emptyLabPositionState('device-a', null))
  calls.memory.mockResolvedValue(null)
  calls.readMemory.mockReturnValue({version:1,sessions:{},updatedAt:0})
  // Removed from My shelf at 150 / moved to Saved for later at 150.
  calls.membership.mockResolvedValue({removed:['confessions','hamlet'],tableHidden:['frankenstein','crito'],removedAt:{confessions:150,hamlet:150},tableHiddenAt:{frankenstein:150,crito:150}})
  const row=(bookId:string,lastActiveAt:number)=>({bookId,target:{chapterNumber:1,pageIndex:0,paragraphIndex:0,wordIndex:0,editionKey:'original-en',chapterLabel:'Chapter 1',at:lastActiveAt},finishedChapters:[],progress:'middle',lastActiveAt,session:null})
  // Confessions and Crito were read after their removal; Hamlet and Frankenstein were not.
  calls.readingList.mockReturnValue({readingNow:[row('confessions',200),row('crito',200),row('hamlet',100),row('frankenstein',100)],finished:[]})
  const books=['confessions','crito','hamlet','frankenstein'].map(id=>({id,title:id,author:'Author',defaultEditionKey:'original-en',editions:[{key:'original-en',language:'en',style:'original'}],readingStructure:{chapters:[{number:1,title:'Chapter 1',paragraphCount:40}]}}))
  const {loadReadingTable}=await import('./libraryTwoReading')
  const table=await loadReadingTable({catalogue:Promise.resolve({books})})
  expect(table.reading.map(book=>book.bookId)).toEqual(['confessions','crito'])
  expect(table.shelfReading?.map(book=>book.bookId)).toEqual(['confessions','crito'])
})

it('paints each book with its stored summary so the desk never shows the position line first', async () => {
  calls.auth.mockResolvedValue({data:{session:null}})
  calls.localPositions.mockResolvedValue(emptyLabPositionState('device-a', null))
  calls.memory.mockResolvedValue(null)
  calls.readMemory.mockReturnValue({version:1,sessions:{},updatedAt:0})
  const target={chapterNumber:4,pageIndex:0,paragraphIndex:3,wordIndex:0,editionKey:'original-en',chapterLabel:'Book 4',paragraphCount:40,at:100}
  calls.readingList.mockReturnValue({readingNow:[{bookId:'confessions',target,finishedChapters:[],progress:'middle',lastActiveAt:100,session:null,recap:null}],finished:[]})
  const { recapCacheKey } = await import('./recapSummary')
  const { storeRecapSummary } = await import('./preReader/recapSummaryClient')
  storeRecapSummary(localStorage, recapCacheKey({bookId:'confessions',editionKey:'original-en',chapterNumber:4,paragraphIndex:3,paragraphCount:40,completed:false,previousChapterNumber:null}), 'Augustine recounts nine wayward years.', Date.now())
  const books=[{id:'confessions',title:'Confessions',author:'Augustine',defaultEditionKey:'original-en',editions:[{key:'original-en',language:'en',style:'original'}],readingStructure:{chapters:[{number:4,title:'Book 4',paragraphCount:40}]}}]
  const {loadReadingTable}=await import('./libraryTwoReading')
  const table=await loadReadingTable({catalogue:Promise.resolve({books})})
  expect(table.reading[0].recap).toBe('Augustine recounts nine wayward years.')
})

it('leads the first paint with the book the reader just left, before the account reads finish', async () => {
 const completed=gate<{data:[];error:null}>();
 calls.auth.mockResolvedValue({data:{session:{user:{id:'viewer-b'},access_token:'token'}}});calls.memory.mockResolvedValue(null);
 calls.localPositions.mockResolvedValue(emptyLabPositionState('device-b','viewer-b'));
 calls.cloudPositions.mockResolvedValue(emptyLabPositionState('cloud','viewer-b'));
 calls.completions.mockReturnValue(completed.promise);calls.readMemory.mockReturnValue({version:1,sessions:{},updatedAt:0});calls.readingList.mockReturnValue({readingNow:[],finished:[]});
 localStorage.setItem('tinct:library-2-table:viewer-b',JSON.stringify({mode:'returning',reading:[{bookId:'bible',title:'The Bible'},{bookId:'to-the-lighthouse',title:'To the Lighthouse'}],finished:[]}));
 localStorage.setItem('tinct:lab-library-boot',JSON.stringify({v:1,at:Date.now(),userId:'viewer-b',readingNow:2,finished:0,row:[],hero:{bookId:'confessions',title:'Confessions',chapterLabel:'Book 3',headline:'You stopped in Book 3',lastReadAt:Date.now(),coverSrc:null,coverSrcSet:null,note:null}}));
 const onCached=vi.fn(),{loadReadingTable}=await import('./libraryTwoReading');
 const result=loadReadingTable({catalogue:Promise.resolve({books:[{id:'confessions',title:'Confessions',author:'Augustine',art:{src:'/covers/confessions.webp'},editions:[]}]}),onCached});
 await vi.waitFor(()=>expect(onCached).toHaveBeenCalled());
 const first=onCached.mock.calls[0][0];
 expect(first.reading.map((book:{bookId:string})=>book.bookId)).toEqual(['confessions','bible','to-the-lighthouse']);
 expect(first.reading[0]).toMatchObject({title:'Confessions',chapterLabel:'Book 3',cover:'/covers/confessions.webp'});
 expect(calls.readingList).not.toHaveBeenCalled();
 completed.resolve({data:[],error:null});await result;
})
