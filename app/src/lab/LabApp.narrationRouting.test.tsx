// @vitest-environment jsdom
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react'
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
