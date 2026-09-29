// @vitest-environment jsdom
import {beforeEach,afterEach,expect,it,vi} from 'vitest'
const fixture=vi.hoisted(()=>({
 native:true,listener:null as null|((event:MediaSessionActionDetails)=>void),
 start:vi.fn(),update:vi.fn(),stop:vi.fn(),transition:vi.fn(),
}))
vi.mock('./nativePlatform',()=>({isNativeCapacitor:()=>fixture.native}))
vi.mock('./audioPlayback',()=>({playAudioTransition:fixture.transition}))
vi.mock('@capacitor/core',()=>({registerPlugin:()=>({
 addListener:async(_event:string,listener:(event:MediaSessionActionDetails)=>void)=>{fixture.listener=listener;return {remove:async()=>{}}},
 start:fixture.start,update:fixture.update,stop:fixture.stop,
})}))
beforeEach(()=>{
 vi.resetModules();fixture.native=true;fixture.listener=null
 fixture.start.mockReset().mockResolvedValue(undefined)
 fixture.update.mockReset().mockResolvedValue(undefined)
 fixture.stop.mockReset().mockResolvedValue(undefined)
 fixture.transition.mockReset().mockResolvedValue(true)
})
afterEach(()=>vi.unstubAllGlobals())
function audio(){return {play:vi.fn().mockResolvedValue(undefined)} as unknown as HTMLAudioElement}
it('keeps browser play in the original user gesture',async()=>{
 fixture.native=false
 const {playReaderAudio}=await import('./readerMediaSession')
 const a=audio(),pending=playReaderAudio(a,()=>true)
 expect(a.play).toHaveBeenCalledTimes(1)
 await pending
 expect(fixture.start).not.toHaveBeenCalled()
})
it('waits for native service ownership and routes system pause to the reader',async()=>{
 let ready!:()=>void
 fixture.start.mockImplementation(()=>new Promise<void>(resolve=>{ready=resolve}))
 const {readerMediaSession,readerMediaMetadata,playReaderAudio}=await import('./readerMediaSession')
 const session=readerMediaSession()!,pause=vi.fn(),a=audio()
 session.metadata=readerMediaMetadata({title:'Psalms 118',artist:'The Bible'})
 session.setActionHandler('pause',pause)
 const pending=playReaderAudio(a,()=>true)
 await vi.waitFor(()=>expect(fixture.start).toHaveBeenCalledTimes(1))
 expect(fixture.start.mock.calls[0][0]).toMatchObject({title:'Psalms 118',artist:'The Bible',playbackState:'playing'})
 expect(a.play).not.toHaveBeenCalled()
 ready();await pending
 expect(a.play).toHaveBeenCalledTimes(1)
 fixture.listener!({action:'pause'})
 expect(pause).toHaveBeenCalledTimes(1)
})
it('does not play a request cancelled while Android is starting',async()=>{
 let ready!:()=>void,current=true
 fixture.start.mockImplementation(()=>new Promise<void>(resolve=>{ready=resolve}))
 const {playReaderAudioTransition}=await import('./readerMediaSession')
 const pending=playReaderAudioTransition(audio(),'fixture',()=>current)
 await vi.waitFor(()=>expect(fixture.start).toHaveBeenCalledTimes(1))
 current=false;ready()
 expect(await pending).toBe(false)
 expect(fixture.transition).not.toHaveBeenCalled()
 expect(fixture.stop).toHaveBeenCalledTimes(1)
})
it('reports a native startup failure through the normal playback retry path',async()=>{
 fixture.start.mockRejectedValue(new Error('service unavailable'))
 const {playReaderAudioTransition}=await import('./readerMediaSession')
 expect(await playReaderAudioTransition(audio(),'fixture',()=>true)).toBe(false)
 expect(fixture.transition).not.toHaveBeenCalled()
})
it('stops native ownership when the reader unmounts',async()=>{
 const {playReaderAudio,endNativeNarration}=await import('./readerMediaSession')
 await playReaderAudio(audio(),()=>true)
 endNativeNarration()
 expect(fixture.stop).toHaveBeenCalledTimes(1)
})
