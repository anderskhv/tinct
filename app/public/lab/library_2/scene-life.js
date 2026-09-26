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
    wide: { flames:[[824,297,27]], clouds:[[1077,0],[1418,0],[1418,165],[1321,176],[1220,185],[1077,202]], reflection:[824,645,55,105] },
    phone: { flames:[[304,301,31]], clouds:[[610,0],[936,0],[936,113],[823,122],[729,128],[610,148]], reflection:[304,825,50,130] },
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
    wide: { foliage:[[[1189,116],[1247,114],[1247,218],[1190,217]],[[1263,114],[1328,107],[1328,216],[1263,218]]], sun:[1242,315,190,280], pollen:[[[1191,116],[1247,114],[1247,217],[1191,216]],[[1262,114],[1328,109],[1328,217],[1262,218]],[[1340,109],[1409,101],[1409,216],[1340,216]],[[1191,230],[1247,231],[1247,344],[1191,338]],[[1262,231],[1328,231],[1328,344],[1262,344]]], water:[[1260,299],[1327,299],[1327,322],[1260,322]] },
    phone: { foliage:[[[729,175],[791,169],[791,293],[721,292]],[[806,170],[883,163],[883,291],[806,294]]], sun:[790,410,155,350], pollen:[[[729,175],[791,169],[791,293],[729,292]],[[806,170],[883,163],[883,291],[806,294]],[[897,160],[969,151],[969,288],[897,291]],[[728,308],[791,308],[791,443],[728,440]],[[806,308],[883,307],[883,447],[806,446]]], water:[[806,394],[884,394],[884,422],[806,422]] },
  },
};

// Returning-room paintings share a room, but the phone crop and each fire are
// different. Snow stays behind each pane, including the opaque mullions.
const roomPanes = wide => {
  const columns=wide?[[1178,1233],[1246,1315],[1328,1391]]:[[718,772],[785,846],[860,928]];
  const rows=wide?[[0,0,94,59],[107,73,190,165],[208,187,298,291],[311,304,394,412]]:[[0,0,115,80],[128,94,229,203],[246,222,346,337],[361,351,450,467]];
  const left=columns[0][0],width=columns.at(-1)[1]-left;
  return rows.flatMap(([tl,tr,bl,br])=>columns.map(([x0,x1])=>{
    const y=(a,b,x)=>a+(b-a)*(x-left)/width;
    return [[x0,y(tl,tr,x0)],[x1,y(tl,tr,x1)],[x1,y(bl,br,x1)],[x0,y(bl,br,x0)]];
  }));
};
const roomFires={
  morning:{wide:[[481,517,37],[507,521,17]],phone:[[8,638,28]]},
  afternoon:{wide:[[481,517,34],[510,522,17]],phone:[[9,641,29]]},
  evening:{wide:[[481,518,46],[508,523,22],[556,202,12]],phone:[[6,644,43],[64,260,13]]},
  night:{wide:[[482,518,43],[508,523,20],[1457,384,11],[1482,384,11]],phone:[[11,647,14],[953,431,12],[981,431,12]]},
};
for(const [period,flames] of Object.entries(roomFires)){
  SCENES[`table-${period}`]={};
  for(const [variant,wide] of [['wide',true],['phone',false]]){
    SCENES[`table-${period}`][variant]={
      flames:flames[variant],reflection:wide?[483,736,67,155]:[16,982,54,180],
      ...(period==='night'?{snowPanes:roomPanes(wide)}:{}),
      ...(period==='morning'?{pollen:roomPanes(wide)}:{}),
    };
  }
}

// Grade once, not on every animation frame. This also works in browsers which
// don't implement CanvasRenderingContext2D.filter (including older iOS Safari).
const paintings = new WeakMap();
export function scenePainting(img, id) {
  if (id !== 'pride-and-prejudice') return img;
  if (!paintings.has(img)) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = 'rgba(8,23,17,.24)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    paintings.set(img, canvas);
  }
  return paintings.get(img);
}
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
// Move the painted flame itself. Merely adding a translucent flame over the
// still painting made the motion disappear at normal phone/tablet scale.
const flameTiles = new WeakMap();
function flame(ctx,img,x,y,h,t,seed,alpha) {
  let tiles=flameTiles.get(img);if(!tiles){tiles=new Map();flameTiles.set(img,tiles);}
  const key=`${x},${y},${h}`;let tile=tiles.get(key);
  if(!tile){
    const w=Math.ceil(h*1.8),height=Math.ceil(h*2.1),base=h*1.6;
    const mask=document.createElement('canvas');mask.width=w;mask.height=height;
    const m=mask.getContext('2d'),g=m.createRadialGradient(w/2,base-h*.65,h*.25,w/2,base-h*.65,h*.9);
    g.addColorStop(0,'#fff');g.addColorStop(.55,'#fff');g.addColorStop(1,'#fff0');m.fillStyle=g;m.fillRect(0,0,w,height);
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=height;
    tile={canvas,mask,w,height,base};tiles.set(key,tile);
  }
  const {canvas,mask,w,height,base}=tile,c=canvas.getContext('2d');
  const f=flicker(t,seed),lean=Math.sin(t*.0047+seed)*.13,stretch=.88+.19*f;
  c.clearRect(0,0,w,height);c.save();c.translate(w/2,base);c.transform(1,0,lean,stretch,0,0);
  c.drawImage(img,x-w/2,y-base,w,height,-w/2,-base,w,height);c.restore();
  c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0);c.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(canvas,x-w/2,y-base);ctx.restore();
  glow(ctx,x,y-h*.4,h*3.4,'244,156,65',(.025+.055*f)*alpha);
}
// Feather a small source patch once. Reusing the painted texture gives water
// real movement and avoids bright procedural lines floating above still water.
const movingTiles=new WeakMap();
function movingTile(img,polygon){
  let tiles=movingTiles.get(img);if(!tiles){tiles=new Map();movingTiles.set(img,tiles);}
  const key=JSON.stringify(polygon);if(tiles.has(key))return tiles.get(key);
  const [x0,y0,x1,y1]=bounds(polygon),w=Math.ceil(x1-x0),h=Math.ceil(y1-y0);
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const mask=document.createElement('canvas');mask.width=w;mask.height=h;
  const m=mask.getContext('2d'),pixels=m.createImageData(w,h),feather=Math.min(10,h*.16);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const px=x+x0,py=y+y0;let distance=Infinity;
    for(let i=0;i<polygon.length;i++){
      const a=polygon[i],b=polygon[(i+1)%polygon.length],dx=b[0]-a[0],dy=b[1]-a[1];
      const t=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy)));
      distance=Math.min(distance,Math.hypot(px-a[0]-t*dx,py-a[1]-t*dy));
    }
    pixels.data[(y*w+x)*4+3]=Math.min(1,distance/feather)*255;
  }
  m.putImageData(pixels,0,0);m.globalCompositeOperation='destination-in';
  m.translate(-x0,-y0);m.beginPath();polygon.forEach(([x,y],i)=>i?m.lineTo(x,y):m.moveTo(x,y));m.closePath();m.fill();
  const tile={canvas,mask,x:x0,y:y0,w,h};tiles.set(key,tile);return tile;
}
function movingPaint(ctx,img,polygon,time,alpha,clouds=false){
  const {canvas,mask,x,y,w,h}=movingTile(img,polygon),c=canvas.getContext('2d');c.clearRect(0,0,w,h);
  if(clouds){
    const dx=Math.sin(time*.000055)*10,dy=Math.sin(time*.000039)*1.2;
    c.drawImage(img,x-dx,y-dy,w,h,0,0,w,h);
  }else{
    // Nearby ripples move farther than the horizon; reflected lights bend with
    // those same ripples. The bridge, boats and shore are outside the mask.
    for(let row=0;row<h;row+=2){
      const depth=row/h,amp=.45+depth*2.7;
      const dx=(Math.sin(row*.19-time*.0015)+.4*Math.sin(row*.083+time*.0008))*amp;
      const dy=Math.sin(row*.12-time*.0011)*(.25+depth*.6),rh=Math.min(2,h-row);
      c.drawImage(img,x+dx,y+row+dy,w,rh,0,row,w,rh);
    }
  }
  c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0);c.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(canvas,x,y);ctx.restore();
}
function pollen(ctx,panes,key,time,alpha){
  const [x0,y0,x1,y1]=bounds(panes.flat()),w=x1-x0,h=y1-y0;
  ctx.save();ctx.beginPath();panes.forEach(p=>{p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();});ctx.clip();
  field(key,36).forEach(p=>{
    const y=y0+(p.y*h+time*(.005+p.s*.005))%h;
    const x=x0+(p.x*w+time*.003+Math.sin(time*.0007+p.p)*8)%w;
    const edge=Math.sin((y-y0)/h*Math.PI);
    ctx.fillStyle=`rgba(244,235,194,${edge*(.27+.27*p.s)*alpha})`;
    ctx.beginPath();ctx.ellipse(x,y,.7+p.s*.85,.5+p.s*.5,p.p,0,Math.PI*2);ctx.fill();
  });ctx.restore();
}
export function drawSceneLife(ctx,id,wide,img,crop,alpha,time) {
  const spec=SCENES[id]?.[wide?'wide':'phone'];if(!spec||alpha<=0||!img)return;
  ctx.save();ctx.scale(crop.scale,crop.scale);ctx.translate(-crop.x,-crop.y);
  // A little breeze in the painted foliage, confined inside the glass panes.
  // Reuse the painting itself; neither the mullions nor the bridge can move.
  (spec.foliage||[]).forEach((polygon,i)=>{
    ctx.save();clip(ctx,polygon);ctx.globalAlpha=alpha*.85;
    const dx=Math.sin(time*.00065+i*1.7)*2.4,dy=Math.sin(time*.00041+i)*.65;
    ctx.drawImage(scenePainting(img,id),dx,dy);ctx.restore();
  });
  (spec.flames||[]).forEach(([x,y,h],i)=>flame(ctx,img,x,y,h,time,x*.01+i,alpha));
  if(spec.reflection){
    const [x,y,rx,ry]=spec.reflection,f=flicker(time,x*.01);
    ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);glow(ctx,0,0,rx,'231,160,87',(.02+.045*f)*alpha);ctx.restore();
  }
  (spec.lights||[]).forEach(([x,y],i)=>glow(ctx,x,y,4,'255,177,102',(.04+.1*flicker(time,i))*alpha));
  if(spec.water)movingPaint(ctx,scenePainting(img,id),spec.water,time,alpha);
  if(spec.clouds)movingPaint(ctx,img,spec.clouds,time,alpha,true);
  if(spec.pollen)pollen(ctx,spec.pollen,id+wide+'pollen',time,alpha);
  if(spec.snow||spec.snowPanes){
    const panes=spec.snowPanes||[spec.snow];
    const [x0,y0,x1,y1]=bounds(panes.flat()),w=x1-x0,h=y1-y0;
    ctx.save();ctx.beginPath();panes.forEach(p=>{p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();});ctx.clip();
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

  ctx.restore();
}
