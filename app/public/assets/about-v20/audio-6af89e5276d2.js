
(()=>{
 const root=document.getElementById('tinct-audio-couch-study'), $=s=>root.querySelector(s);
 const world=$('.ta-world'),scene=$('.ta-scene'),slider=$('input'),button=$('.ta-play');
 const settings={duration:15,carLight:1};let p=0,playing=false,last=0,raf=0;
 const clamp=x=>Math.min(1,Math.max(0,x)), ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)}, ramp=(a,b)=>ease((p-a)/(b-a));
 $('.ta-phone-cover img').src=$('.ta-cover img').src;
 const words=$('.ta-line').textContent.split(' ');$('.ta-line').textContent='';words.forEach(w=>{const s=document.createElement('span');s.textContent=w+' ';$('.ta-line').appendChild(s)});
 // The phone's talk mode draws the product's own orb (src/lab/VoiceOrb.tsx): 420 points on a Fibonacci
 // sphere, orthographic, a slow turn about a tilted axis, dot size and opacity by depth. Listening rolls a
 // wave down the sphere, speaking swells it. Monochrome, drawn in the canvas's own CSS colour.
 const orbPoints=(()=>{const out=[],n=420,g=Math.PI*(3-Math.sqrt(5));for(let i=0;i<n;i++){const y=1-(i/(n-1))*2,r=Math.sqrt(Math.max(0,1-y*y)),th=g*i;out.push([Math.cos(th)*r,y,Math.sin(th)*r])}return out})();
 const orbStill=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let orbState='listening',orbRaf=0;
 function drawOrb(){
  const cv=$('.ta-orb'),w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  // The world is CSS-scaled, so the backing store follows that scale as well as the device ratio.
  let scale=1;try{scale=new DOMMatrixReadOnly(getComputedStyle(world).transform).a||1}catch{}
  const ratio=Math.min(3,(window.devicePixelRatio||1)*Math.max(1,scale));
  const bw=Math.round(w*ratio);if(cv.width!==bw){cv.width=bw;cv.height=Math.round(h*ratio)}
  const ctx=cv.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
  const t=orbStill?2.3:performance.now()/1000,cx=w/2,cy=h/2;
  let radius=Math.min(w,h)*.38,level=0;
  if(orbState==='speaking'){level=.5+.5*Math.sin(t*5.1)*Math.sin(t*1.7);radius*=1+level*.14}
  const rot=t*.22,tilt=.35,cr=Math.cos(rot),sr=Math.sin(rot),ct=Math.cos(tilt),st=Math.sin(tilt);
  ctx.fillStyle=getComputedStyle(cv).color;
  for(const q of orbPoints){
   let s=1;if(orbState==='listening'&&!orbStill)s=1+.07*Math.sin(q[1]*6-t*3.2);
   const x=q[0]*s,y=q[1]*s,z=q[2]*s;
   const x1=x*cr+z*sr,z1=-x*sr+z*cr,y2=y*ct-z1*st,z2=y*st+z1*ct,depth=z2*.5+.5;
   ctx.globalAlpha=Math.min(1,.18+depth*.82);
   const dot=1.35*(.55+depth*.9)*(1+level*.3)*(w/280);
   ctx.beginPath();ctx.arc(cx+x1*radius,cy+y2*radius,dot,0,Math.PI*2);ctx.fill()}
  ctx.globalAlpha=1}
 function orbLoop(){orbRaf=0;if(Number($('.ta-conversation').style.opacity||0)<=0)return;drawOrb();if(!orbStill)orbRaf=requestAnimationFrame(orbLoop)}
 function draw(){
  const fold=ramp(.08,.27),move=ramp(.25,.47),car=ramp(.55,.69),voice=ramp(.82,.88),speaking=p>.94;
  $('.ta-audio-intro').style.opacity=1-ramp(.24,.40);
  $('.ta-book-anchor').style.left=`${72-22*move-(scene.clientWidth<600&&scene.clientWidth<scene.clientHeight?1.5:0)*(1-move)}%`;
  $('.ta-left-leaf').style.transform=`rotateY(${fold*180}deg)`;
  const pf=scene.clientWidth<600&&scene.clientWidth<scene.clientHeight?.52:1,small=1.35*(1-(1-pf)*(1-move))-.73*move;
  $('.ta-book-anchor').style.transform=`translate(${(180-90*small)*move-121.5*fold*(1-move)}px,0px) scale(${small})`;
  $('.ta-book').style.transform=`rotateX(${7*(1-move)}deg) rotateY(${-9*(1-move)}deg) rotateZ(${-3*(1-move)}deg)`;
  $('.ta-book-anchor').style.opacity=1-ramp(.475,.50);
  $('.ta-phone').style.opacity=ramp(.34,.43);
  const expand=ramp(.51,.62);
  $('.ta-phone-cover img').style.opacity=ramp(.475,.50);
  $('.ta-phone-cover img').style.transform=`scale(${.60+.40*expand})`;
  $('.ta-car').style.opacity=car;$('.ta-car').style.transform=`scale(${1.06-.06*car})`;
  $('.ta-dashboard-photo').style.filter=`brightness(${settings.carLight})`;
  const audio=ramp(.67,.72);$('.ta-playback').style.opacity=audio*(1-voice);$('.ta-header-pause').style.opacity=audio;
  $('.ta-phone-cover').style.opacity=1-audio;$('.ta-reader').style.opacity=audio;
  $('.ta-unread').style.color=p>.64?'#827d71':'#242019';
  const word=Math.min(words.length-1,Math.floor(clamp((p-.72)/.10)*words.length));
  $('.ta-line').childNodes.forEach((s,i)=>{s.style.background=audio>0&&i===word?'#ddcba6':'transparent';s.style.color=audio>0&&i>word?'#827d71':'#242019'});
  $('.ta-conversation').style.opacity=voice;
  $('.ta-voice-state').textContent=speaking?'Speaking.':'Listening.';
  $('.ta-call-caption').textContent=speaking?'…more honoured in the breach than the observance.':'Ask about this page.';
  orbState=speaking?'speaking':'listening';
  if(voice>0){if(orbRaf)drawOrb();else orbRaf=requestAnimationFrame(orbLoop)}
  $('.ta-caption').style.opacity=ramp(.54,.64);
  $('.ta-keep-talking').style.opacity=ramp(.82,.88);
  $('.ta-keep-talking').style.transform=`translateY(${18*(1-ramp(.82,.88))}px)`;
  $('.ta-phase').textContent=p<.27?'Book':p<.50?'Insert':p<.67?'Cover':p<.88?'Audio':speaking?'Speaking':'Listening';

  const retreat=ramp(1.035,1.37),exchange=ramp(1.145,1.175),turn=ramp(1.065,1.26);
  $('.ta-livingroom').style.opacity=ramp(1.06,1.24);
  $('.ta-livingroom').style.transform=`scale(${1.32-.32*retreat})`;
  $('.ta-phone').style.transform=`translate(-50%,-50%) scale(${1-.13*retreat}) rotateZ(${-7*retreat}deg) rotateY(${180*turn}deg)`;
  $('.ta-phone').style.opacity=ramp(.34,.43)*(turn<.5?1:0);
  $('.ta-ereader').style.opacity=turn>=.5?1:0;
  $('.ta-ereader').style.transform=`translate(-50%,-50%) scale(${(1.14-.14*retreat)*(1-.688*ramp(1.17,1.37))}) rotateZ(${-7*retreat}deg) rotateY(${-180+180*turn}deg)`;
  $('.ta-unwind').style.opacity=ramp(1.25,1.39);
  $('.ta-unwind').style.transform=`translateY(${18*(1-ramp(1.25,1.39))}px)`;
  $('.ta-caption').style.opacity=ramp(.54,.64)*(1-ramp(1.045,1.17));
  $('.ta-car').style.transform=`scale(${1.06-.06*car})`;
  if(p>1.035)$('.ta-phase').textContent=p<1.25?'Home':'Unwind';

  slider.value=Math.round(p*1000);
 }
 function frame(t){if(!playing)return;if(last)p=Math.min(1.45,p+(t-last)/(settings.duration*1000));last=t;draw();if(p>=1.45){playing=false;button.textContent='Replay';last=0;return}raf=requestAnimationFrame(frame)}
 button.onclick=()=>{playing=!playing;if(playing){if(p>=1.45)p=0;last=0;button.textContent='Pause';raf=requestAnimationFrame(frame)}else{cancelAnimationFrame(raf);last=0;button.textContent='Continue'}};
 slider.oninput=()=>{playing=false;cancelAnimationFrame(raf);last=0;p=Number(slider.value)/1000;button.textContent=p>=1.45?'Replay':'Play transition';draw()};
 new ResizeObserver(()=>{const portrait=scene.clientWidth<scene.clientHeight;scene.classList.toggle('ta-portrait',portrait);[$('.ta-caption'),$('.ta-unwind'),$('.ta-audio-intro')].forEach(el=>{const home=portrait||scene.clientWidth<1.6*scene.clientHeight?scene:world;if(el.parentNode!==home)home.appendChild(el)});world.style.transformOrigin=portrait?'68% 50%':'50% 50%';world.style.transform=`translate(${portrait?-68:-50}%,-50%) scale(${(scene.clientWidth>700||portrait?Math.max:Math.min)(scene.clientWidth/1000,scene.clientHeight/625)})`}).observe(scene);
 window.addEventListener('message',event=>{
   if(event.source!==parent || event.origin!==location.origin || event.data?.type!=='tinct-audio-progress')return;
   const value=event.data.progress;
   if(typeof value!=='number'||!Number.isFinite(value))return;
   playing=false;cancelAnimationFrame(raf);p=Math.max(0,Math.min(1.45,value));draw();
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden){playing=false;cancelAnimationFrame(raf);last=0;button.textContent='Continue'}});
 draw();
 if(globalThis.Tweak){const tweak=new Tweak({container:root,onChange:draw});tweak.addSlider(settings,'duration',{label:'Transition duration',min:8,max:20,unit:'s'});tweak.addSlider(settings,'carLight',{label:'Car daylight',min:.5,max:1.3,step:.1});}
})();
