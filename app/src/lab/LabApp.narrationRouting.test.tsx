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
async function failNarration(status:number){
 history.replaceState(null,'','/lab/phone?chrome=v2')
 const ensure=vi.fn()
 vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>{
  const url=String(input)
  if(url.includes('/api/narration/voices'))return Response.json({enabled:true,provider:'grok',model:'grok-tts-v1',voices:[{key:'f',label:'Ara',persona:'female'},{key:'m',label:'Helios',persona:'male'}]})
  if(url.includes('/api/narration/ensure')){ensure();return Response.json({error:'failed'},{status})}
  return new Response('',{status:404})
 }))
 vi.stubGlobal('Audio',class {play=vi.fn();pause(){};addEventListener(){};removeEventListener(){};removeAttribute(){}})
 render(<LabApp pathname="/lab/phone" search="?chrome=v2" source={fallbackLabSource()} authToken={null}/>)
 await waitFor(()=>expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/narration/voices'),expect.anything()))
 await act(async()=>{await Promise.resolve()})
 fireEvent.click(screen.getByTestId('lab-v2-play'))
 await screen.findByTestId('lab-narration-error',{},{timeout:5000})
 expect(ensure).toHaveBeenCalled()
}
it('offers a signed-out reader the way to sign in, not a Retry that cannot succeed',async()=>{
 await failNarration(401)
 expect(screen.getByText('Sign in to hear this chapter narrated.')).toBeTruthy()
 expect(screen.getByTestId('lab-narration-sign-in').getAttribute('href')).toBe('/lab/sign-in?returnTo=%2Flab%2Fphone%3Fchrome%3Dv2')
 expect(screen.queryByTestId('lab-narration-retry')).toBeNull()
})
it('keeps Retry for failures a retry can fix',async()=>{
 await failNarration(503)
 expect(screen.getByTestId('lab-narration-retry')).toBeTruthy()
 expect(screen.queryByTestId('lab-narration-sign-in')).toBeNull()
})
