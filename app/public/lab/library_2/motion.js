export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
export const mix=(a,b,t)=>a+(b-a)*t;
export function destination(w,h,coarse=false){const tour=w<1100||h<600||(coarse&&w<=1400);const width=tour?w:Math.min(660,(w-96)/2);const top=tour?0:76;return {x:tour?w:w/2,y:top,w:width,h:tour?h:h-top-28,spread:true,tour};}
// The cover and paper share one uniformly scaled parent throughout the motion.
export function bookFrame(source,target,t){t=clamp(t,0,1);const open=ease(clamp(t/.48,0,1));const zoom=ease(clamp((t-.48)/.52,0,1));const width=mix(source.w,target.w,zoom);return {x:mix(source.x,target.x,zoom),y:mix(source.y,target.y,zoom),w:width,h:mix(source.h,target.h,zoom),angle:-180*open,scale:width/target.w,opacity:1};}
export function orbFrame(a,b,t){const p=ease(clamp(t,0,1));return {x:mix(a.x,b.x,p),y:mix(a.y,b.y,p),size:mix(a.size,b.size,p)};}
export function sceneCrop(w,h,iw,ih,focus=.5){const scale=Math.max(w/iw,h/ih);const sw=w/scale,sh=h/scale;return {x:clamp((iw-sw)*focus,0,iw-sw),y:0,w:sw,h:sh,scale};}
export function panelBounds(rect,w,h){const width=clamp(rect.w,Math.min(320,w-24),w-24),height=clamp(rect.h,Math.min(440,h-24),h-24);return {x:clamp(rect.x,12,w-width-12),y:clamp(rect.y,12,h-height-12),w:width,h:height};}
export function shelfMetrics(w){const gutter=w<700?20:Math.max(28,w*.025),gap=w<700?10:18;return {gutter,gap,width:w<700?(w-gutter-3*gap)/3.2:clamp((w-2*gutter-7*gap)/8,135,220)};}
// H · Tuck, louder (A · Tuck's motion). Docked, the librarian is a capsule
// tucked 6 px under a side wall, joined to it by goo, with the orb above a chat
// icon. While the page scrolls it shrinks to A's 34 x 62 and the icon fades.
// Pulled, it resists, then lets go as a round dot (orb only) that
// spring-follows the pointer; released, it springs to the nearer side and
// re-attaches with a squash. One step is one 60 Hz frame. Left and right only.
// Every size lives here: dock (docked capsule), scrollDock (docked while
// scrolling; the app passes the size in force to tuckAt/tuckStep/tuckSettled
// as `dock`), scrollIdle (ms after the last scroll before it grows back),
// free (detached dot), inset (negative = px tucked under the wall), anchor
// (wall goo radius), release (pull that lets go), grab/settle (re-attach
// distances), target (minimum pointer target), orb (drawn orb size, docked
// and free), icon (icon size, the gap above it, and the capsule heights over
// which it fades in).
export const TUCK={dock:{w:46,h:88},scrollDock:{w:34,h:62},scrollIdle:300,free:{w:50,h:50},inset:-6,anchor:22,release:64,grab:26,settle:30,pull:.38,target:44,top:96,bottom:64,margin:40,orb:{docked:24,free:38},icon:{size:18,gap:9,from:64,to:80}};
export const tuckSide=(x,w)=>x<w/2?'left':'right';
export function tuckDockX(side,w,width=TUCK.dock.w){return side==='right'?w-width/2-TUCK.inset:width/2+TUCK.inset;}
// Whether the docked capsule on `side` (wall width `w`) would cover a panel whose box is `rect`
// ({left,right}), with `gap` px to spare. The search panel hides the capsule when it would.
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
// The drawn goo: body, wall anchor, three neck circles that thin as it
// stretches, the pointer target (never under 44 px), the orb's size, opacity
// and offset (docked: centred on the visible part, above the icon when the
// capsule is tall enough to show it) and the icon's opacity and offset.
// The body squashes against the wall on contact and stretches with speed.
export function tuckShape(s,W){
 const wall=s.side==='right'?W:0,outward=s.side==='right'?-1:1;
 const speed=Math.min(.2,Math.abs(s.vx)*.012),w=Math.max(4,s.w*(1+s.wob+speed)),h=Math.max(4,s.h*(1-s.wob*.8-speed*.5));
 const edgeX=s.x-outward*w/2,gap=Math.abs(edgeX-wall),stretch=clamp((gap-Math.max(0,TUCK.inset))/TUCK.release,0,1);
 const necks=[1,2,3].map(i=>{const t=i/4;return {cx:wall+(edgeX-wall)*t,cy:s.ay+(s.y-s.ay)*t,r:s.ar>1&&gap>2?Math.max(0,s.ar*.85*(1-t*.45)*(1-stretch*.75)*(s.ar/TUCK.anchor)):0};});
 const hw=Math.max(w,TUCK.target),hh=Math.max(h,TUCK.target),room=Math.min(s.w,s.h);
 const att=clamp(s.ar/TUCK.anchor,0,1),dx=outward*-TUCK.inset/2*att,{size,gap:space,from,to}=TUCK.icon;
 const icon=clamp((s.h-from)/(to-from),0,1),orb=mix(TUCK.orb.free,TUCK.orb.docked,att);
 return {body:{x:s.x-w/2,y:s.y-h/2,w,h,r:Math.min(w,h)/2},anchor:{cx:wall,cy:s.ay,r:s.ar},necks,hit:{x:s.x-hw/2,y:s.y-hh/2,w:hw,h:hh},
  orb:{size:orb,opacity:clamp((room-20)/14,0,1),dx,dy:-(space+size)/2*icon},
  icon:{opacity:icon,dx,dy:(orb+space)/2}};
}
