import {describe,expect,it} from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {bookPages} from '../public/lab/library_2/motion.js'

// Opening a book (iPhone QA, 2026-10-14): the turned cover's back (the author flap, the
// left page) and the paper (the right page) are one size at every point of the opening,
// meet level at the spine, and the flap stays on screen. #372 held the flap at its final
// height on phones, so on a 390x664 iPhone it stayed at the cover's size while the paper
// grew, high and off the left edge.
type Rect={x:number,y:number,w:number,h:number}
const cases:{name:string,view:{w:number,h:number},source:Rect,target:Rect,flap:{w:number,h:number}}[]=[
 // iPhone, Safari toolbars shown: the compact tour's tall page (530x536) from the centred hero cover.
 {name:'phone 390x664',view:{w:390,h:664},source:{x:124,y:180,w:142,h:213},target:{x:550,y:60,w:530,h:536},flap:{w:530,h:536}},
 {name:'phone 390x844',view:{w:390,h:844},source:{x:103,y:297,w:184,h:276},target:{x:497,y:60,w:477,h:716},flap:{w:477,h:716}},
 // A shelf cover near the left wall.
 {name:'phone shelf cover',view:{w:390,h:844},source:{x:20,y:500,w:100,h:150},target:{x:497,y:60,w:477,h:716},flap:{w:477,h:716}},
 {name:'desktop 1440x900',view:{w:1440,h:900},source:{x:935,y:331,w:237,h:356},target:{x:720,y:76,w:660,h:796},flap:{w:660,h:796}},
]
const near=(a:number,b:number)=>expect(Math.abs(a-b)).toBeLessThanOrEqual(2)

describe('opening a book',()=>{
 for(const c of cases)describe(c.name,()=>{
  for(const t of [0,.25,.5,.6,.75,.9,1])it(`both pages are one size and on screen at ${t}`,()=>{
   const {paper,back}=bookPages(c.source,c.target,t,c.flap,c.view.w)
   near(back.w,paper.w);near(back.h,paper.h);near(back.y,paper.y);near(back.x+back.w,paper.x)
   if(t>=.48)expect(back.x).toBeGreaterThanOrEqual(0)
   expect(back.y).toBeGreaterThanOrEqual(0)
  })
  it('starts at the cover and ends at the spread',()=>{
   const start=bookPages(c.source,c.target,0,c.flap,c.view.w).paper,end=bookPages(c.source,c.target,1,c.flap,c.view.w)
   const same=(a:Rect,b:Rect)=>{for(const k of ['x','y','w','h'] as const)expect(a[k]).toBeCloseTo(b[k],6)}
   same(start,c.source);same(end.paper,c.target);same(end.back,{x:c.target.x-c.flap.w,y:c.target.y,w:c.flap.w,h:c.flap.h})
  })
  it('grows the two pages together',()=>{
   let last=0
   for(let t=.5;t<=1;t+=.05){const {back}=bookPages(c.source,c.target,t,c.flap,c.view.w);expect(back.w).toBeGreaterThanOrEqual(last-.01);last=back.w}
  })
 })
 it('keeps the opened flap at its own height (the compact tour, #173)',()=>{
  expect(bookPages({x:0,y:0,w:100,h:150},{x:400,y:0,w:400,h:300},1,{w:400,h:500},800).backHeight).toBe(500)
 })
 it('lays the page out from the shared geometry',()=>{
  const app=fs.readFileSync(path.resolve(__dirname,'../public/lab/library_2/app.js'),'utf8')
  expect(app).toContain("bookPages(sourceRect,dest,p,{w:flapWidth,h:flapHeight},innerWidth)")
  expect(app).toContain("shape.style.height=pages.height+'px'")
  expect(app).toContain("back.style.height=pages.backHeight+'px'")
 })
})
