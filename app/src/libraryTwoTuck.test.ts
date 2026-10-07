import {describe,expect,it} from 'vitest'
import {TUCK,orbFrame,tuckAt,tuckDockX,tuckRelease,tuckRestY,tuckSettled,tuckShape,tuckSide,tuckStep} from '../public/lab/library_2/motion.js'

// A · Tuck: the library librarian docked as a capsule under a side wall.
const W=390,H=844

type State=ReturnType<typeof tuckAt>
function run(state:State,frames:number,opts:{drag?:{x:number,y:number}|null,restY?:number,reduced?:boolean,dock?:{w:number,h:number}}={}){
 const events:string[]=[]
 for(let i=0;i<frames;i++){state=tuckStep(state,{W,H,...opts});if(state.event)events.push(state.event)}
 return {state,events}
}

describe('docking geometry',()=>{
 it('tucks a 46 x 88 capsule (34 x 62 while scrolling) 6 px under the left or right wall',()=>{
  expect(TUCK.dock).toEqual({w:46,h:88});expect(TUCK.scrollDock).toEqual({w:34,h:62});expect(TUCK).toMatchObject({free:{w:50,h:50},inset:-6,release:64,scrollIdle:300})
  expect(tuckDockX('right',W)+TUCK.dock.w/2).toBe(W+6)
  expect(tuckDockX('left',W)-TUCK.dock.w/2).toBe(-6)
  const s=tuckAt('right',400,W)
  expect(s).toMatchObject({side:'right',attached:true,w:46,h:88,ar:TUCK.anchor,y:400})
 })
 it('rests on the nearer side and keeps clear of the header and the bottom bar',()=>{
  expect(tuckSide(100,W)).toBe('left')
  expect(tuckSide(300,W)).toBe('right')
  expect(tuckRestY(10,H)).toBe(TUCK.top)
  expect(tuckRestY(5000,H)).toBe(H-TUCK.bottom)
  expect(tuckRestY(400,H)).toBe(400)
  expect(tuckRestY(10,120)).toBe(60)
 })
 it('keeps the pointer target at least 44 px tall and wide, docked and free',()=>{
  const docked=tuckShape(tuckAt('right',400,W),W)
  expect(docked.hit.h).toBeGreaterThanOrEqual(44)
  expect(docked.hit.w).toBeGreaterThanOrEqual(44)
  const squashed=tuckShape({...tuckAt('left',400,W),attached:false,w:50,h:50,wob:.3},W)
  expect(squashed.hit.h).toBeGreaterThanOrEqual(44)
  expect(squashed.hit.w).toBeGreaterThanOrEqual(44)
 })
 it('draws the anchor on the wall and three neck circles toward the body',()=>{
  const shape=tuckShape(tuckAt('right',400,W),W)
  expect(shape.anchor).toMatchObject({cx:W,cy:400,r:TUCK.anchor})
  expect(shape.necks).toHaveLength(3)
  expect(shape.body).toMatchObject({w:46,h:88,r:23})
  expect(shape.orb.opacity).toBe(1)
  // Docked, the orb sits in the middle of the visible part of the capsule.
  expect(shape.orb.dx).toBe(-3)
  expect(tuckShape(tuckAt('left',400,W),W).orb.dx).toBe(3)
  expect(tuckShape({...tuckAt('left',400,W),attached:false,ar:0},W).orb.dx).toBe(0)
 })
})

describe('pulling it off the wall',()=>{
 it('rubber-bands at 0.38 of the pull while attached',()=>{
  const start=tuckAt('right',400,W),want={x:start.x-50,y:400}
  const {state,events}=run(start,90,{drag:want})
  expect(events).toEqual([])
  expect(state.attached).toBe(true)
  expect(start.x-state.x).toBeCloseTo(50*TUCK.pull,0)
 })
 it('lets go past 64 px with a wobble kick and becomes a 50 px dot that follows',()=>{
  const start=tuckAt('right',400,W),want={x:W/2,y:300}
  const first=tuckStep(start,{W,H,drag:want})
  expect(first.event).toBe('release')
  expect(first.attached).toBe(false)
  expect(first.wobv).toBeGreaterThan(0)
  const {state}=run(first,120,{drag:want})
  expect(state.x).toBeCloseTo(W/2,0)
  expect(state.y).toBeCloseTo(300,0)
  expect(state.w).toBeCloseTo(TUCK.free.w,1)
  expect(state.h).toBeCloseTo(TUCK.free.h,1)
  expect(state.ar).toBeCloseTo(0,1)
 })
 it('grabs a wall when carried within 26 px of its dock',()=>{
  const free={...tuckAt('right',400,W),attached:false,x:120,w:50,h:50,ar:0}
  const {state,events}=run(free,30,{drag:{x:tuckDockX('left',W)+20,y:400}})
  expect(events[0]).toBe('grab')
  expect(state).toMatchObject({side:'left',attached:true})
 })
})

describe('letting go',()=>{
 it('springs to the nearer side with overshoot and re-attaches with a squash',()=>{
  const free=tuckRelease({...tuckAt('right',400,W),attached:false,x:150,w:50,h:50,ar:0},W)
  expect(free.side).toBe('left')
  let state=free,overshoot=false,attachedAt=-1,squash=0
  for(let i=0;i<400;i++){
   state=tuckStep(state,{W,H,restY:400})
   if(state.event==='attach')attachedAt=i
   if(state.x<tuckDockX('left',W))overshoot=true
   if(attachedAt>=0)squash=Math.min(squash,state.wob)
  }
  expect(attachedAt).toBeGreaterThan(0)
  expect(overshoot).toBe(true)
  expect(squash).toBeLessThan(0)
  expect(tuckSettled(state,W,400)).toBe(true)
  expect(state.x).toBeCloseTo(tuckDockX('left',W),1)
  expect(state.w).toBeCloseTo(TUCK.dock.w,1)
 })
 it('slides along its wall to a new rest height',()=>{
  const {state}=run(tuckAt('right',400,W),300,{restY:600})
  expect(state.y).toBeCloseTo(600,1)
  expect(state.attached).toBe(true)
  expect(tuckSettled(state,W,600)).toBe(true)
 })
})

describe('scrolling',()=>{
 it('shrinks to 34 x 62 while the page scrolls, staying tucked, and grows back',()=>{
  const start=tuckAt('right',400,W)
  expect(start.x).toBe(W-23+6)
  const shrunk=run(start,200,{restY:400,dock:TUCK.scrollDock}).state
  expect(shrunk.w).toBeCloseTo(34,1)
  expect(shrunk.h).toBeCloseTo(62,1)
  expect(shrunk.x).toBeCloseTo(tuckDockX('right',W,34),1)
  expect(shrunk.attached).toBe(true)
  expect(tuckSettled(shrunk,W,400,TUCK.scrollDock)).toBe(true)
  const back=run(shrunk,200,{restY:400}).state
  expect(back.w).toBeCloseTo(46,1)
  expect(back.h).toBeCloseTo(88,1)
  expect(tuckSettled(back,W,400)).toBe(true)
 })
 it('changes size at once with reduced motion',()=>{
  const next=tuckStep(tuckAt('right',400,W),{W,H,restY:400,dock:TUCK.scrollDock,reduced:true})
  expect(next).toMatchObject({w:34,h:62,x:tuckDockX('right',W,34)})
 })
 it('shows the chat icon under the orb only when the capsule is tall enough',()=>{
  const docked=tuckShape(tuckAt('right',400,W),W)
  expect(docked.icon.opacity).toBe(1)
  expect(docked.orb.dy).toBeLessThan(0)
  expect(docked.icon.dy).toBeGreaterThan(0)
  // Orb and icon fit inside the capsule.
  expect(-docked.orb.dy+docked.orb.size/2).toBeLessThanOrEqual(44)
  expect(docked.icon.dy+TUCK.icon.size/2).toBeLessThanOrEqual(44)
  const shrunk=tuckShape(tuckAt('right',400,W,TUCK.scrollDock),W)
  expect(shrunk.icon.opacity).toBe(0)
  const free=tuckShape({...tuckAt('right',400,W),attached:false,ar:0,w:50,h:50},W)
  expect(free.icon.opacity).toBe(0)
  expect(free.orb.dx).toBeCloseTo(0);expect(free.orb.dy).toBeCloseTo(0);expect(free.orb.size).toBe(TUCK.orb.free)
  expect(docked.orb.size).toBe(TUCK.orb.docked)
 })
})

describe('reduced motion',()=>{
 it('jumps to each target with no spring, wobble or squash',()=>{
  const free=tuckRelease({...tuckAt('right',400,W),attached:false,x:300,y:500,w:50,h:50,ar:0,vx:9,wobv:.3},W)
  const next=tuckStep(free,{W,H,restY:500,reduced:true})
  expect(next).toMatchObject({attached:true,x:tuckDockX('right',W),y:500,w:46,h:88,vx:0,vy:0,wob:0,wobv:0,ar:TUCK.anchor})
  expect(tuckSettled(next,W,500)).toBe(true)
  const held=tuckStep(tuckAt('right',400,W),{W,H,drag:{x:100,y:300},reduced:true})
  expect(held).toMatchObject({attached:false,x:100,y:300,w:50,h:50,wob:0})
 })
})

it('still tweens the orb into and out of the panel',()=>{
 expect(orbFrame({x:0,y:0,size:50},{x:100,y:200,size:240},1)).toEqual({x:100,y:200,size:240})
 expect(orbFrame({x:0,y:0,size:50},{x:100,y:200,size:240},0)).toEqual({x:0,y:0,size:50})
})
