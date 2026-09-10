// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLabAsk, type UseLabAskOptions } from './useLabAsk'
import { createChapterChatRequest, CHAPTER_CHAT_MESSAGES } from './labChapterChat'
import { readLabBookChat, turnsFromConversations, appendLabChatTurn } from './labChatHistory'
const load = vi.hoisted(() => vi.fn())
vi.mock('../data/editionLoader', () => ({ loadEditionWindow: load }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: null, likelyAuthenticated: false }) }))
vi.mock('../hooks/useVoiceSession', () => ({ useVoiceSession: () => ({ state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }) }))
const options: UseLabAskOptions = { bookId: 'bible', editionKey: 'kjv-en', bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Jeremiah 34', chapterNumber: 779, paragraphs: ['Finished chapter source.'], paragraphIndex: 0, signedIn: true, authToken: 'fixture', userId: null, voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'] }
const request = createChapterChatRequest('prepare', options, [{ number: 779, title: 'Jeremiah 34' }, { number: 780, title: 'Jeremiah 35' }])!
const reply = () => new Response(JSON.stringify({ content: [{ text: 'The next chapter opens in the temple during Jehoiakim’s reign.' }] }), { headers: { 'Content-Type': 'application/json' } })
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.clearAllMocks() })
it('loads the next chapter once, keeps request/display separate, and restores action association', async () => {
  let release!: (value: unknown) => void
  load.mockReturnValue(new Promise(resolve => { release = resolve }))
  const fetcher = vi.fn().mockResolvedValue(reply());vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(options))
  let pending!: Promise<void>
  act(() => { pending = result.current.sendTyped(CHAPTER_CHAT_MESSAGES.prepare, request); void result.current.sendTyped(CHAPTER_CHAT_MESSAGES.prepare, request) })
  expect(load).toHaveBeenCalledTimes(1)
  expect(fetcher).not.toHaveBeenCalled()
  await act(async () => { release({ chapters: [{ number: 780, paragraphs: ['Jehoiakim. Rechabites. Temple.'] }] }); await pending })
  const payload = JSON.parse(fetcher.mock.calls[0][1].body)
  expect(payload.messages.at(-1).content).toBe(CHAPTER_CHAT_MESSAGES.prepare)
  expect(payload.system).toContain('Jehoiakim. Rechabites. Temple.')
  expect(payload.book).toMatchObject({ bookId: 'bible', chapterNumber: 779, editionKey: 'kjv-en' })
  expect(result.current.turns[0].content).toBe(CHAPTER_CHAT_MESSAGES.prepare)
  const restored = turnsFromConversations(readLabBookChat('bible'))
  expect(restored).toHaveLength(2)
  expect(restored[0].chapterAction?.targetChapterNumber).toBe(780)
  expect(JSON.stringify(restored)).not.toContain('Jehoiakim. Rechabites. Temple.')
})
it('shows a retry when the real target is missing, never inventing from the title', async () => {
  load.mockResolvedValueOnce({ chapters: [] }).mockResolvedValueOnce({ chapters: [{ number: 780, paragraphs: ['Real target.'] }] })
  const fetcher=vi.fn().mockResolvedValue(reply());vi.stubGlobal('fetch',fetcher)
  const { result }=renderHook(()=>useLabAsk(options))
  await act(async()=>{await result.current.sendTyped(CHAPTER_CHAT_MESSAGES.prepare,request)})
  expect(fetcher).not.toHaveBeenCalled();expect(result.current.notice).toContain('Couldn’t load')
  await act(async()=>{result.current.retryTyped!();await new Promise(resolve=>setTimeout(resolve,10))})
  expect(fetcher).toHaveBeenCalledTimes(1)
  expect(result.current.turns.filter(turn=>turn.role==='user')).toHaveLength(1)
})
it('rejects a response after switching books and never writes it under the new book', async () => {
  let release!: (value: Response)=>void
  vi.stubGlobal('fetch',vi.fn(()=>new Promise<Response>(resolve=>{release=resolve})))
  const {result,rerender}=renderHook(({bookId})=>useLabAsk({...options,bookId}),{initialProps:{bookId:'bible'}})
  const discuss={...request,action:{...request.action,kind:'discuss' as const,targetChapterNumber:779,targetChapterLabel:'Jeremiah 34'}}
  let pending!:Promise<void>
  await act(async()=>{pending=result.current.sendTyped(CHAPTER_CHAT_MESSAGES.discuss,discuss);await new Promise(resolve=>setTimeout(resolve,0))})
  rerender({bookId:'odyssey'})
  await act(async()=>{release(reply());await pending})
  expect(readLabBookChat('odyssey')).toEqual([])
  expect(result.current.turns).toEqual([])
  expect(readLabBookChat('bible').flatMap(c=>c.messages).filter(m=>m.role==='assistant')).toHaveLength(0)
  appendLabChatTurn('odyssey',{id:'wrong',bookId:'bible',role:'assistant',content:'Wrong book',timestamp:Date.now(),source:'text'})
  expect(readLabBookChat('odyssey')).toEqual([])
})
it('replays an account-gated action against its captured chapter after signing in', async () => {
  localStorage.setItem('tinct:lab-ai-actions', '1')
  const onAccountPrompt=vi.fn(),fetcher=vi.fn().mockResolvedValue(reply())
  vi.stubGlobal('fetch',fetcher)
  load.mockResolvedValue({chapters:[{number:780,paragraphs:['Captured successor source.']}]})
  const {result,rerender}=renderHook(({signedIn,chapterNumber})=>useLabAsk({...options,signedIn,chapterNumber,onAccountPrompt}),{initialProps:{signedIn:false,chapterNumber:779}})
  await act(async()=>{await result.current.sendTyped(CHAPTER_CHAT_MESSAGES.prepare,request)})
  expect(fetcher).not.toHaveBeenCalled();expect(onAccountPrompt).toHaveBeenCalledTimes(1)
  rerender({signedIn:true,chapterNumber:900})
  await act(async()=>{await result.current.sendTyped(CHAPTER_CHAT_MESSAGES.prepare)})
  expect(JSON.parse(fetcher.mock.calls[0][1].body).book.chapterNumber).toBe(779)
})
it('retains normal balance errors and retry while ignoring model navigation commands on chapter actions', async () => {
  const fetcher=vi.fn().mockResolvedValueOnce(new Response('{}',{status:402})).mockResolvedValueOnce(new Response(JSON.stringify({content:[{text:'Chapter recap. [[next_chapter]] [[resume_audiobook]] [[set_playback_speed:2]]'}]}),{headers:{'Content-Type':'application/json'}}))
  vi.stubGlobal('fetch',fetcher)
  const onPlaybackSkip=vi.fn(),onResumeListen=vi.fn(),onSetPlaybackSpeed=vi.fn()
  const {result}=renderHook(()=>useLabAsk({...options,onPlaybackSkip,onResumeListen,onSetPlaybackSpeed}))
  const discuss=createChapterChatRequest('discuss',options,[{number:779,title:'Jeremiah 34'}])!
  await act(async()=>{await result.current.sendTyped(CHAPTER_CHAT_MESSAGES.discuss,discuss)})
  expect(result.current.notice).toBeTruthy();expect(result.current.retryTyped).toBeTypeOf('function')
  await act(async()=>{result.current.retryTyped!();await new Promise(resolve=>setTimeout(resolve,10))})
  expect(result.current.turns.at(-1)?.content).toBe('Chapter recap.')
  expect(onPlaybackSkip).not.toHaveBeenCalled();expect(onResumeListen).not.toHaveBeenCalled();expect(onSetPlaybackSpeed).not.toHaveBeenCalled()
})

it('accepts consecutive questions when a completed SSE response keeps its connection open', async () => {
  const fetcher = vi.fn(() => Promise.resolve(new Response(new ReadableStream({start(controller) {
    controller.enqueue(new TextEncoder().encode('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"A complete answer."}}\n\ndata: {"type":"message_stop"}\n\n'))
    // Deliberately do not close: protocol completion must release Send.
  }}), {headers:{'Content-Type':'text/event-stream'}})))
  vi.stubGlobal('fetch', fetcher)
  const {result} = renderHook(() => useLabAsk(options))
  for (const question of ['Who speaks?', 'Why does he say that?', 'What happens here?']) {
    await act(async () => {await result.current.sendTyped(question)})
    expect(result.current.typedLoading).toBe(false)
  }
  expect(fetcher).toHaveBeenCalledTimes(3)
  expect(result.current.turns.filter(turn => turn.role === 'assistant')).toHaveLength(3)
})
