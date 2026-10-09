export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
export const mix=(a,b,t)=>a+(b-a)*t;
// The two-page spread wherever it fits (touch tablets in landscape included); otherwise
// the compact tour: the author flap first, then the introduction full screen.
export function destination(w,h){const tour=w<1100||h<600;const width=tour?w:Math.min(660,(w-96)/2);const top=tour?0:76;return {x:tour?w:w/2,y:top,w:width,h:tour?h:h-top-28,spread:true,tour};}
// The cover and paper share one uniformly scaled parent throughout the motion.
export function bookFrame(source,target,t){t=clamp(t,0,1);const open=ease(clamp(t/.48,0,1));const zoom=ease(clamp((t-.48)/.52,0,1));const width=mix(source.w,target.w,zoom);return {x:mix(source.x,target.x,zoom),y:mix(source.y,target.y,zoom),w:width,h:mix(source.h,target.h,zoom),angle:-180*open,scale:width/target.w,opacity:1};}
export function orbFrame(a,b,t){const p=ease(clamp(t,0,1));return {x:mix(a.x,b.x,p),y:mix(a.y,b.y,p),size:mix(a.size,b.size,p)};}
export function sceneCrop(w,h,iw,ih,focus=.5){const scale=Math.max(w/iw,h/ih);const sw=w/scale,sh=h/scale;return {x:clamp((iw-sw)*focus,0,iw-sw),y:0,w:sw,h:sh,scale};}
export function panelBounds(rect,w,h){const width=clamp(rect.w,Math.min(320,w-24),w-24),height=clamp(rect.h,Math.min(440,h-24),h-24);return {x:clamp(rect.x,12,w-width-12),y:clamp(rect.y,12,h-height-12),w:width,h:height};}
export function shelfMetrics(w){const gutter=w<700?20:Math.max(28,w*.025),gap=w<700?10:18;return {gutter,gap,width:w<700?(w-gutter-3*gap)/3.2:clamp((w-2*gutter-7*gap)/8,135,220)};}
// The library librarian, minimized: the dotted orb alone (no capsule, no chat
// icon, 2026-10-08), floating 8 px in from a side wall with A · Tuck's motion.
// While the page scrolls it shrinks to 36 px. Pulled, it resists, then lets go
// and spring-follows the pointer as a 50 px orb; released, it springs to the
// nearer side and re-attaches with a squash. One step is one 60 Hz frame.
// Left and right only. Every size lives here: dock (docked orb), scrollDock
// (docked while scrolling; the app passes the size in force to
// tuckAt/tuckStep/tuckSettled as `dock`), scrollIdle (ms after the last scroll
// before it grows back), free (held orb), inset (px between orb and wall),
// anchor (the attachment spring's rest value), release (pull that lets go),
// grab/settle (re-attach distances), target (minimum pointer target).
export const TUCK={dock:{w:44,h:44},scrollDock:{w:36,h:36},scrollIdle:300,free:{w:50,h:50},inset:8,anchor:22,release:64,grab:26,settle:30,pull:.38,target:44,top:96,bottom:64,margin:40};
export const tuckSide=(x,w)=>x<w/2?'left':'right';
export function tuckDockX(side,w,width=TUCK.dock.w){return side==='right'?w-width/2-TUCK.inset:width/2+TUCK.inset;}
// Whether the docked orb on `side` (wall width `w`) would cover a panel whose box is `rect`
// ({left,right}), with `gap` px to spare. The search panel hides the orb when it would.
export function tuckCovers(side,w,rect,gap=8){if(!rect)return false;const reach=TUCK.dock.w+TUCK.inset+gap;return side==='right'?rect.right>w-reach:rect.left<reach;}
export function tuckRestY(y,h){return clamp(y,Math.min(TUCK.top,h/2),Math.max(h-TUCK.bottom,h/2));}
export function tuckAt(side,y,w,dock=TUCK.dock){return {side,x:tuckDockX(side,w,dock.w),y,vx:0,vy:0,w:dock.w,h:dock.h,wv:0,hv:0,attached:true,ar:TUCK.anchor,arv:0,ay:y,ayv:0,wob:0,wobv:0,event:null};}
const spring=(v,vel,target,k,damp)=>{vel=(vel+(target-v)*k)*damp;return [v+vel,vel];};
// `drag` is the wanted centre of the shape while it is held, or null.
// Reduced motion jumps straight to each target: no springs, wobble or squash.
export function tuckStep(state,{W,H,drag=null,restY=state.y,reduced=false,dock=TUCK.dock}){
 const s={...state};s.event=null;
 const tw=s.attached?dock.w:TUCK.free.w,th=s.attached?dock.h:TUCK.free.h;
 if(reduced){s.w=tw;s.h=th;s.wv=s.hv=0;}else{[s.w,s.wv]=spring(s.w,s.wv,tw,.22,.7);[s.h,s.hv]=spring(s.h,s.hv,th,.22,.7);}
 const outward=s.side==='right'?-1:1,dockX=tuckDockX(s.side,W,s.w),want=drag&&{x:drag.x,y:clamp(drag.y,TUCK.margin,H-TUCK.margin)};let tx,ty,k,damp;
 if(drag){
  if(s.attached){
   // Rubber band: it follows a fraction of the pull, then lets go with a kick.
   const pull=Math.max(0,(want.x-dockX)*outward);
   if(pull>TUCK.release){s.attached=false;s.event='release';s.wobv+=.22;}
   tx=dockX+outward*pull*TUCK.pull;ty=want.y;k=.5;damp=.55;
  }else{
   tx=want.x;ty=want.y;k=.26;damp=.66;
   // Brought back close to a wall: it grabs it.
   const near=tuckSide(s.x,W);
   if(Math.abs(want.x-tuckDockX(near,W,dock.w))<TUCK.grab){s.side=near;s.attached=true;s.event='grab';s.wobv-=.2;}
  }
 }else{
  tx=tuckDockX(s.side,W,s.attached?s.w:dock.w);ty=restY;k=.12;damp=.76;
  if(!s.attached&&(reduced||Math.abs(s.x-tuckDockX(s.side,W,dock.w))<TUCK.settle)){s.attached=true;s.event='attach';s.wobv-=.24;}
 }
 const ar=s.attached?TUCK.anchor:0;
 if(reduced){s.w=s.attached?dock.w:TUCK.free.w;s.h=s.attached?dock.h:TUCK.free.h;s.x=!drag?tuckDockX(s.side,W,s.w):s.attached?tx:want.x;s.y=ty;s.vx=s.vy=0;s.ar=ar;s.arv=0;s.ay=s.y;s.ayv=0;s.wob=s.wobv=0;return s;}
 [s.x,s.vx]=spring(s.x,s.vx,tx,k,damp);[s.y,s.vy]=spring(s.y,s.vy,ty,k,damp);
 [s.ar,s.arv]=spring(s.ar,s.arv,ar,.2,.68);s.ar=Math.max(0,s.ar);
 [s.ay,s.ayv]=spring(s.ay,s.ayv,s.y,.2,.62);
 s.wobv=(s.wobv-s.wob*.28)*.8;s.wob+=s.wobv;
 return s;
}
// Letting go: the shape belongs to the nearer side.
export function tuckRelease(state,w){return {...state,side:tuckSide(state.x,w)};}
export function tuckSettled(s,w,restY,dock=TUCK.dock){if(!s.attached)return false;return [s.vx,s.vy,s.wv,s.hv,s.arv,s.ayv,s.wobv].every(v=>Math.abs(v)<.02)&&Math.abs(s.x-tuckDockX(s.side,w,dock.w))<.1&&Math.abs(s.y-restY)<.1&&Math.abs(s.wob)<.002&&Math.abs(s.w-dock.w)<.05&&Math.abs(s.h-dock.h)<.05&&Math.abs(s.ar-TUCK.anchor)<.05;}
// The drawn orb: its box (squashed against the wall on contact, stretched with
// speed), the pointer target (never under 44 px) and the orb's size and
// x/y squash, which the app applies to the orb canvas.
export function tuckShape(s,W){
 const speed=Math.min(.2,Math.abs(s.vx)*.012),w=Math.max(4,s.w*(1+s.wob+speed)),h=Math.max(4,s.h*(1-s.wob*.8-speed*.5));
 const hw=Math.max(w,TUCK.target),hh=Math.max(h,TUCK.target),size=Math.min(s.w,s.h);
 return {body:{x:s.x-w/2,y:s.y-h/2,w,h,r:Math.min(w,h)/2},hit:{x:s.x-hw/2,y:s.y-hh/2,w:hw,h:hh},orb:{size,sx:w/size,sy:h/size}};
}
