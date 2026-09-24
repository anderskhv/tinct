export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
export const mix=(a,b,t)=>a+(b-a)*t;
export function destination(w,h,coarse=false){const tour=w<1100||h<600||(coarse&&w<=1400);const width=tour?w:Math.min(660,(w-96)/2);const top=tour?0:76;return {x:tour?w:w/2,y:top,w:width,h:tour?h:h-top-28,spread:true,tour};}
// The cover and paper share one uniformly scaled parent throughout the motion.
export function bookFrame(source,target,t){t=clamp(t,0,1);const open=ease(clamp(t/.48,0,1));const zoom=ease(clamp((t-.48)/.52,0,1));const width=mix(source.w,target.w,zoom);return {x:mix(source.x,target.x,zoom),y:mix(source.y,target.y,zoom),w:width,h:mix(source.h,target.h,zoom),angle:-180*open,scale:width/target.w,opacity:1};}
export function orbFrame(a,b,t){const p=ease(clamp(t,0,1));return {x:mix(a.x,b.x,p),y:mix(a.y,b.y,p),size:mix(a.size,b.size,p)};}
export function dockPosition(x,y,w,h,size=52){x=clamp(x,0,w-size);y=clamp(y,0,h-size);const gaps=[x,w-size-x,y,h-size-y];const n=Math.min(...gaps);const edge=n<=48?['left','right','top','bottom'][gaps.indexOf(n)]:'none';if(edge==='left')x=0;if(edge==='right')x=w-size;if(edge==='top')y=0;if(edge==='bottom')y=h-size;return {x,y,size,edge};}
export function sceneCrop(w,h,iw,ih,focus=.5){const scale=Math.max(w/iw,h/ih);const sw=w/scale,sh=h/scale;return {x:clamp((iw-sw)*focus,0,iw-sw),y:0,w:sw,h:sh,scale};}
export function panelBounds(rect,w,h){const width=clamp(rect.w,Math.min(320,w-24),w-24),height=clamp(rect.h,Math.min(440,h-24),h-24);return {x:clamp(rect.x,12,w-width-12),y:clamp(rect.y,12,h-height-12),w:width,h:height};}
export function shelfMetrics(w){const gutter=w<700?20:Math.max(28,w*.025),gap=w<700?10:18;return {gutter,gap,width:w<700?(w-gutter-3*gap)/3.2:clamp((w-2*gutter-7*gap)/8,135,220)};}
