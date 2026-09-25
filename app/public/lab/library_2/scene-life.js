// Effects are pinned to the actual artwork, in source-image coordinates.
// Tiny moving flames, coherent water ripples, and snow confined to the tent
// opening: never a layer of particles over the furniture or foreground book.
const flicker = (t, seed) => .65 + .17 * Math.sin(t * .0071 + seed) + .1 * Math.sin(t * .0197 + seed * 2.1);
const SCENES = {
  meditations: {
    wide: { flames:[[938,134,13]], snow:[[1328,0],[1366,0],[1536,240],[1515,545],[1250,544],[1235,244]], lights:[[1263,295],[1295,295],[1385,285]], reflection:[938,665,70,120] },
    phone: { flames:[[419,153,16]], snow:[[885,0],[920,0],[1024,179],[1024,722],[849,722],[792,409],[788,286]], lights:[[809,341],[841,343],[929,332]], reflection:[419,870,70,140] },
  },
  'the-prince': {
    wide: { flames:[[824,297,27]], reflection:[824,645,55,105] },
    phone: { flames:[[304,301,31]], reflection:[304,825,50,130] },
  },
  'crime-and-punishment': {
    wide: { flames:[[1111,282,17]], water:[[1125,269],[1171,252],[1231,264],[1349,272],[1349,300],[1158,297]], reflection:[1111,650,50,115] },
    phone: { flames:[[704,314,17]], water:[[721,288],[750,258],[800,268],[895,274],[895,325],[720,323]], reflection:[704,877,50,125] },
  },
  odyssey: {
    wide: { flames:[[681,277,18]], water:[[1040,331],[1278,334],[1333,337],[1397,334],[1397,398],[1343,397],[1307,422],[1234,413],[1140,386],[1040,367]], reflection:[180,640,70,120] },
    phone: { flames:[[350,364,18]], water:[[694,403],[932,400],[932,463],[858,467],[814,497],[789,464],[742,443],[694,430]], reflection:[120,930,80,145] },
  },
  'pride-and-prejudice': {
    wide: { sun:[1242,315,190,280], motes:[[1082,230],[1172,262],[1005,506],[907,490]], water:[[1260,299],[1327,299],[1327,322],[1260,322]] },
    phone: { sun:[790,410,155,350], motes:[[649,251],[711,310],[615,632],[545,604]], water:[[806,394],[884,394],[884,422],[806,422]] },
  },
};
const particles = new Map();
function field(key, n) {
  if (!particles.has(key)) {
    let seed = [...key].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7);
    const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    particles.set(key,Array.from({length:n},()=>({x:rand(),y:rand(),s:rand(),p:rand()*Math.PI*2})));
  }
  return particles.get(key);
}
function clip(ctx, polygon) {
  ctx.beginPath(); polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
}
function bounds(polygon) {
  const xs=polygon.map(p=>p[0]),ys=polygon.map(p=>p[1]);
  return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
}
function glow(ctx,x,y,r,colour,alpha) {
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,`rgba(${colour},${alpha})`);g.addColorStop(.3,`rgba(${colour},${alpha*.5})`);g.addColorStop(1,`rgba(${colour},0)`);
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}
function flame(ctx,x,y,h,t,seed,alpha) {
  const f=flicker(t,seed), lean=Math.sin(t*.0047+seed)*h*.085;
  glow(ctx,x,y-h*.4,h*3.4,'244,156,65',(.026+.022*f)*alpha);
  ctx.save();ctx.globalAlpha=alpha*(.22+.18*f);ctx.fillStyle='#ffe8aa';
  ctx.beginPath();ctx.moveTo(x-h*.11,y);
  ctx.bezierCurveTo(x-h*.26,y-h*.42,x+lean-h*.05,y-h*.75,x+lean,y-h*(.87+.2*f));
  ctx.bezierCurveTo(x+h*.07,y-h*.52,x+h*.24,y-h*.24,x+h*.1,y);ctx.closePath();ctx.fill();ctx.restore();
}
function water(ctx,polygon,key,t,alpha) {
  const [x0,y0,x1,y1]=bounds(polygon),w=x1-x0,h=y1-y0;
  ctx.save();clip(ctx,polygon);ctx.lineCap='round';
  field(key,28).forEach(p=>{
    const phase=t*.0007+p.p,depth=p.y;
    const x=x0+p.x*w+Math.sin(phase)*3,y=y0+depth*h+Math.sin(phase*.6)*.65;
    const len=3+(5+depth*12)*p.s;
    const g=ctx.createLinearGradient(x-len,y,x+len,y);const a=(.03+.07*Math.pow(Math.sin(phase),2))*alpha;
    g.addColorStop(0,'rgba(190,211,229,0)');g.addColorStop(.5,`rgba(190,211,229,${a})`);g.addColorStop(1,'rgba(190,211,229,0)');
    ctx.strokeStyle=g;ctx.lineWidth=.5+depth*.65;ctx.beginPath();ctx.moveTo(x-len,y);ctx.quadraticCurveTo(x,y-.6,x+len,y);ctx.stroke();
  });ctx.restore();
}
export function drawSceneLife(ctx,id,wide,img,crop,alpha,time) {
  // Each time-of-day image is a different painting: don't recycle fireplace
  // coordinates across them. Their stillness is intentional for reading.
  const spec=SCENES[id]?.[wide?'wide':'phone'];if(!spec||alpha<=0||!img)return;
  ctx.save();ctx.scale(crop.scale,crop.scale);ctx.translate(-crop.x,-crop.y);
  (spec.flames||[]).forEach(([x,y,h],i)=>flame(ctx,x,y,h,time,x*.01+i,alpha));
  if(spec.reflection){
    const [x,y,rx,ry]=spec.reflection,f=flicker(time,x*.01);
    ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);glow(ctx,0,0,rx,'231,160,87',(.014+.025*f)*alpha);ctx.restore();
  }
  (spec.lights||[]).forEach(([x,y],i)=>glow(ctx,x,y,4,'255,177,102',(.04+.1*flicker(time,i))*alpha));
  if(spec.water)water(ctx,spec.water,id+wide,time,alpha);
  if(spec.snow){
    const [x0,y0,x1,y1]=bounds(spec.snow),w=x1-x0,h=y1-y0;
    ctx.save();clip(ctx,spec.snow);
    field(id+wide+'snow',65).forEach(p=>{
      const speed=.012+p.s*.021;
      const y=y0+((p.y*h+time*speed)%h),x=x0+((p.x*w+time*speed*.16+Math.sin(time*.0004+p.p)*7)%w);
      ctx.strokeStyle=`rgba(221,231,242,${(.17+p.s*.3)*alpha})`;ctx.lineWidth=.45+p.s*.75;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-1-p.s,y-2-p.s*2);ctx.stroke();
    });ctx.restore();
  }
  if(spec.sun){
    // Slow changes in window light and its reflected pool. No orange sky pulse.
    const [x,y,rx,ry]=spec.sun,drift=Math.sin(time*.00021)*7;
    ctx.save();ctx.translate(x+drift,y);ctx.scale(1,ry/rx);
    glow(ctx,0,0,rx,'212,224,175',(.015+.012*Math.sin(time*.00033))*alpha);ctx.restore();
  }
  if(spec.motes){
    const [x0,y0,x1,y1]=bounds(spec.motes),w=x1-x0,h=y1-y0;
    ctx.save();clip(ctx,spec.motes);
    field(id+wide+'dust',18).forEach(p=>{
      const x=x0+(p.x*w+time*.0017)%w,y=y0+(p.y*h+time*.0011)%h;
      const edge=Math.sin((x-x0)/w*Math.PI)*Math.sin((y-y0)/h*Math.PI);
      ctx.fillStyle=`rgba(235,225,183,${edge*(.07+.09*p.s)*alpha})`;
      ctx.beginPath();ctx.arc(x,y,.35+p.s*.4,0,Math.PI*2);ctx.fill();
    });ctx.restore();
  }
  ctx.restore();
}
