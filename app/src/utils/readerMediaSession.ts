import {registerPlugin, type PluginListenerHandle} from '@capacitor/core'
import {isNativeCapacitor} from './nativePlatform'
import {playAudioTransition} from './audioPlayback'

type Action=MediaSessionAction
type State={title:string;artist:string;album:string;playbackState:MediaSessionPlaybackState;position:number;duration:number;playbackRate:number;actions:Action[]}
interface NativeSession {
 addListener(event:'action',handler:(details:MediaSessionActionDetails)=>void):Promise<PluginListenerHandle>
 start(state:State):Promise<void>
 update(state:State):Promise<void>
 stop():Promise<void>
}
const native=registerPlugin<NativeSession>('NativeMediaSession')
const handlers=new Map<Action,MediaSessionActionHandler>()
let value:State={title:'Tinct',artist:'',album:'',playbackState:'none',position:0,duration:0,playbackRate:1,actions:[]}
let installed:Promise<PluginListenerHandle>|null=null
let active=false,scheduled=false,lastPositionPublish=0,startId=0
let metadata:MediaMetadata|null=null
function listen(){
 return installed??=(native.addListener('action',details=>{
  if(import.meta.env.VITE_NATIVE_AUTH_DIAGNOSTICS==='1'){
   const target=window as unknown as {__nativeMediaEvents?:unknown[]}
   const events=target.__nativeMediaEvents??=[]
   events.push({action:details.action,registered:[...handlers.keys()],time:Date.now()})
   if(events.length>20)events.shift()
  }
  handlers.get(details.action)?.(details)
 }).catch(error=>{installed=null;throw error}))
}
function publish(positionOnly=false){
 if(!active||scheduled)return
 if(positionOnly&&Date.now()-lastPositionPublish<1000)return
 lastPositionPublish=Date.now()
 scheduled=true
 queueMicrotask(()=>{
  scheduled=false
  if(active)void native.update({...value,actions:[...handlers.keys()]}).catch(()=>{})
 })
}
const session={
 get metadata(){return metadata},
 set metadata(next:MediaMetadata|null){
  if(metadata?.title===next?.title&&metadata?.artist===next?.artist&&metadata?.album===next?.album)return
  metadata=next
  value={...value,title:next?.title||'Tinct',artist:next?.artist||'',album:next?.album||''}
  publish()
 },
 get playbackState(){return value.playbackState},
 set playbackState(next:MediaSessionPlaybackState){if(value.playbackState===next)return;value={...value,playbackState:next};publish()},
 setActionHandler(action:Action,handler:MediaSessionActionHandler|null){
  if(handler)handlers.set(action,handler);else handlers.delete(action)
 },
 setPositionState(next?:MediaPositionState){
  value={...value,position:next?.position??0,duration:next?.duration??0,playbackRate:next?.playbackRate??1}
  publish(true)
 },
}
/** Android WebView has no native Media Session Web API. Web keeps its own API. */
export function readerMediaSession():Pick<MediaSession,'metadata'|'playbackState'|'setActionHandler'|'setPositionState'>|null {
 if(isNativeCapacitor())return session
 return typeof navigator!=='undefined'&&'mediaSession' in navigator?navigator.mediaSession:null
}
export function readerMediaMetadata(data:MediaMetadataInit):MediaMetadata {
 return typeof MediaMetadata!=='undefined'?new MediaMetadata(data):{title:'',artist:'',album:'',artwork:[],...data} as MediaMetadata
}
/** Await foreground-service ownership before a native audio element requests focus. */
async function beginNativeNarration(current:()=>boolean):Promise<boolean>{
 const attempt=++startId
 await listen()
 if(attempt!==startId||!current())return false
 active=true;value={...value,playbackState:'playing'}
 try{
  await native.start({...value,playbackState:'playing',actions:[...handlers.keys()]})
  if(attempt!==startId)return false
  if(!current()){active=false;await native.stop();return false}
  return true
 }catch(error){if(attempt===startId)active=false;throw error}
}
export function playReaderAudioTransition(audio:HTMLAudioElement,src:string,current:()=>boolean):Promise<boolean>{
 if(!isNativeCapacitor())return playAudioTransition(audio,src,current)
 return beginNativeNarration(current).then(ready=>ready?playAudioTransition(audio,src,current):false).catch(()=>false)
}
export function playReaderAudio(audio:HTMLAudioElement,current:()=>boolean):Promise<void>{
 if(!isNativeCapacitor())return audio.play()
 return beginNativeNarration(current).then(ready=>{
  if(!ready)throw new DOMException('Playback was cancelled.','AbortError')
  return audio.play()
 })
}
export function endNativeNarration():void{
 if(!isNativeCapacitor())return
 startId++;active=false;value={...value,playbackState:'none'}
 void native.stop().catch(()=>{})
}
