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
  expect(await screen.findByRole('heading',{name:'Sign in to listen'})).toBeTruthy()
  expect(screen.queryByTestId('lab-narration-retry')).toBeNull()
  expect(screen.queryByTestId('lab-narration-error')).toBeNull()
  expect(dismiss).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('button',{name:'Keep reading'}))
  await waitFor(()=>expect(screen.queryByTestId('lab-account-sheet')).toBeNull())
  expect(screen.getByTestId('lab-passage-headline').textContent).toBe(before)
 }finally{spy.mockRestore()}
})
