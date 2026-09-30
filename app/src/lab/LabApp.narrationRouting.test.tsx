// @vitest-environment jsdom
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {afterEach,expect,it,vi} from 'vitest'
import {LabApp} from './LabApp'
import {fallbackLabSource} from './labSource'
afterEach(()=>{cleanup();vi.unstubAllGlobals();localStorage.clear();sessionStorage.clear()})
it('never starts legacy English audio before configuration or after a configuration failure',async()=>{
 const requests:string[]=[]
 vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>{requests.push(String(input));return new Response('',{status:503})}))
 const play=vi.fn()
 vi.stubGlobal('Audio',class {play=play;pause(){};addEventListener(){};removeEventListener(){};removeAttribute(){}})
 const base=fallbackLabSource()
 const source={...base,followParagraphs:base.paragraphs.map((text,index)=>({index,text,file:'p'+index+'.mp3',duration:20}))}
 render(<LabApp pathname="/lab/phone" search="?chrome=v2" source={source} authToken={null}/>)
 fireEvent.click(screen.getByTestId('lab-v2-play'))
 await act(async()=>{await Promise.resolve()})
 fireEvent.click(screen.getByTestId('lab-v2-play'))
 expect(play).not.toHaveBeenCalled()
 expect(requests.some(url=>url.includes('audio-manifest')||url.includes('audio-file'))).toBe(false)
 expect(screen.getByText('Audio is temporarily unavailable for this edition. You can keep reading.')).toBeTruthy()
})

it('replaces an unauthenticated narration error with a sign-in card and retains the page',async()=>{
 const listen=await import('./useLabListen')
 const original=listen.useLabListen, dismiss=vi.fn()
 const spy=vi.spyOn(listen,'useLabListen').mockImplementation((...args)=>({
   ...original(...args),
   narration:{status:'error' as const,paragraphIndex:0,reason:'unauthenticated',message:'Sign in to hear this chapter narrated.'},
   dismissNarration:dismiss,
 }))
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('',{status:404})))
 try{
  render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null}/>)
  const before=screen.getByTestId('lab-passage-headline').textContent
  expect(await screen.findByRole('heading',{name:'Create a free account to keep listening'})).toBeTruthy()
  expect(screen.queryByTestId('lab-narration-retry')).toBeNull()
  expect(screen.queryByTestId('lab-narration-error')).toBeNull()
  expect(dismiss).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('button',{name:'Keep reading'}))
  await waitFor(()=>expect(screen.queryByTestId('lab-account-sheet')).toBeNull())
  expect(screen.getByTestId('lab-passage-headline').textContent).toBe(before)
 }finally{spy.mockRestore()}
})

it('asks again on every Play after Keep reading, closing on a single tap and never resuming old audio',async()=>{
 const play=vi.fn()
 vi.stubGlobal('Audio',class {play=play;pause(){};addEventListener(){};removeEventListener(){};removeAttribute(){}})
 let ensures=0
 vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>{
  const url=String(input)
  if(url.includes('/api/narration/voices'))return new Response(JSON.stringify({enabled:true,provider:'grok',voices:[{key:'f',label:'Female',persona:'female',cacheIdentity:'x'}]}),{status:200})
  if(url.includes('/api/narration/ensure')){ensures+=1;return new Response('',{status:401})}
  return new Response('',{status:404})
 }))
 render(<LabApp pathname="/lab/phone" search="?chrome=v2" source={fallbackLabSource()} authToken={null}/>)
 await waitFor(()=>expect(vi.mocked(fetch).mock.calls.some(call=>String(call[0]).includes('/api/narration/voices'))).toBe(true))
 await act(async()=>{await new Promise(resolve=>setTimeout(resolve,30))})
 for(let round=1;round<=3;round++){
  fireEvent.click(screen.getByTestId('lab-v2-play'))
  expect(await screen.findByRole('heading',{name:'Create a free account to keep listening'})).toBeTruthy()
  fireEvent.click(screen.getByRole('button',{name:'Keep reading'}))
  // One tap is enough, and the prompt does not come back by itself.
  expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,30))})
  expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
  // The listening chrome is gone, so nothing is left to replay earlier audio.
  expect(document.querySelector('[data-chrome-state]')?.getAttribute('data-chrome-state')).toBe('reading')
 }
 expect(ensures).toBeGreaterThanOrEqual(1)
 expect(play).not.toHaveBeenCalled()
})
