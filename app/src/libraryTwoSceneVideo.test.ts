import {expect,it} from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {sceneVideoSrc,sceneVideoAllowed,sceneVideoAlpha,SCENE_VIDEO_FADE} from '../public/lab/library_2/scene-video.js'

const library=path.resolve(__dirname,'../public/lab/library_2')
const desktop={wide:true,width:1440,finePointer:true,reducedMotion:false,eink:false,saveData:false}

it('names each film after the wide painting it animates, and every film exists under 5 MB',()=>{
 expect(sceneVideoSrc('frankenstein')).toBe('assets/scenes/room-wide-v2.mp4')
 expect(sceneVideoSrc('table-morning')).toBe('assets/scenes/table-morning-wide.mp4')
 expect(sceneVideoSrc('odyssey')).toBe('assets/scenes/scene-odyssey-wide.mp4')
 expect(sceneVideoSrc('jane-eyre')).toBeNull()
 for(const id of ['frankenstein','meditations','the-prince','crime-and-punishment','odyssey','pride-and-prejudice','table-morning','table-afternoon','table-evening','table-night']){
  const film=path.join(library,sceneVideoSrc(id)!)
  expect(fs.existsSync(film.replace(/scenes\/(.+)\.mp4$/,'$1.jpg')),`${id} poster`).toBe(true)
  expect(fs.statSync(film).size,`${id} film`).toBeLessThan(5*1024*1024)
 }
})

it('plays only on wide desktop screens, never with reduced motion, e-ink or Save-Data',()=>{
 expect(sceneVideoAllowed(desktop)).toBe(true)
 expect(sceneVideoAllowed({...desktop,wide:false})).toBe(false)
 expect(sceneVideoAllowed({...desktop,width:844})).toBe(false)
 expect(sceneVideoAllowed({...desktop,finePointer:false})).toBe(false)
 expect(sceneVideoAllowed({...desktop,reducedMotion:true})).toBe(false)
 expect(sceneVideoAllowed({...desktop,eink:true})).toBe(false)
 expect(sceneVideoAllowed({...desktop,saveData:true})).toBe(false)
 expect(sceneVideoAllowed({...desktop,h264:false})).toBe(false)
})

it('fades the film in over the painting from its first playing frame',()=>{
 expect(sceneVideoAlpha(0,5000)).toBe(0)
 expect(sceneVideoAlpha(1000,1000)).toBe(0)
 expect(sceneVideoAlpha(1000,1000+SCENE_VIDEO_FADE/2)).toBeCloseTo(.5)
 expect(sceneVideoAlpha(1000,1000+SCENE_VIDEO_FADE*2)).toBe(1)
})
