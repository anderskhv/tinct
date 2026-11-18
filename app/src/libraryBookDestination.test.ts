import {describe,expect,it} from 'vitest'
import {destination} from '../public/lab/library_2/motion.js'

// Opening a book on a Windows laptop (user test, 12 Nov 2026): at 125-150% display scaling
// the browser window is about 1093x614 or 1280x590, below the old 1100x600 spread cut-off.
// The book opened as the compact tour, whose page stops short in a landscape window, so the
// reader saw the author flap beside a blank page. Landscape windows that fit two pages get
// the spread; phones and portrait tablets keep the tour.
const spread:[number,number,string][]=[
 [1093,614,'1366x768 at 125%'],
 [1093,520,'1366x768 at 125%, browser and taskbar'],
 [1280,593,'1920x1080 at 150%, browser and taskbar'],
 [1280,560,'1920x1080 at 150%, bookmarks bar'],
 [1366,657,'1366x768 at 100%'],
 [1536,730,'1920x1080 at 125%'],
 [1024,768,'landscape tablet'],
 [1080,810,'landscape iPad'],
 [960,540,'small landscape window'],
 [1440,900,'MacBook'],
]
const tour:[number,number,string][]=[
 [390,844,'iPhone'],
 [390,664,'iPhone, toolbars shown'],
 [844,390,'iPhone landscape'],
 [932,430,'large phone landscape'],
 [820,1180,'iPad portrait'],
 [1024,1366,'iPad Pro portrait'],
 [768,1024,'portrait tablet'],
 [800,600,'window too narrow for two pages'],
]

describe('where an opened book lands',()=>{
 for(const [w,h,name] of spread)it(`shows both pages at ${w}x${h} (${name})`,()=>{
  const d=destination(w,h)
  expect(d.tour).toBe(false)
  // Both pages fit on screen, side by side around the centre, and stay readable.
  expect(d.x-d.w).toBeGreaterThanOrEqual(0)
  expect(d.x+d.w).toBeLessThanOrEqual(w)
  expect(d.w).toBeGreaterThanOrEqual(400)
  expect(d.h).toBeGreaterThanOrEqual(350)
  expect(d.y+d.h).toBeLessThanOrEqual(h)
 })
 for(const [w,h,name] of tour)it(`uses the compact tour at ${w}x${h} (${name})`,()=>{
  expect(destination(w,h).tour).toBe(true)
 })
 it('keeps the spread wherever it was before',()=>{
  for(let w=1100;w<=2600;w+=50)for(let h=600;h<=1600;h+=50)expect(destination(w,h).tour,`${w}x${h}`).toBe(false)
 })
})
