// Re-apply the about-page changes on top of a freshly imported Sites export.
//
// The story's editable source lives in the private Sites project, not in this
// repo. After `node scripts/import-about-story.mjs <dist/client>` overwrites
// about.html, the bootstrap payload, the story chunk and the audio iframe, run
//
//   node scripts/patch-about-story.mjs
//
// to restore the conversion, trust, copy and scene changes described in
// docs/about-story-release-2026-09-11.md. Every edit is anchored on exact text
// (or a tight pattern) and is idempotent: already-applied edits are skipped, and
// an anchor that no longer exists fails loudly so a changed export gets looked
// at instead of silently shipping without a fix. The override stylesheet and
// behaviour script (assets/about-v20/about-v21.css and about-v21.js) are
// checked-in files the import leaves alone.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const about = join(publicDir, 'assets/about-v20');
const chunks = join(about, '_next/static/chunks');
const only = (dir, re) => {
  const hits = readdirSync(dir).filter(n => re.test(n));
  if (hits.length !== 1) throw new Error(`expected one ${re} in ${dir}, found ${hits.length}`);
  return join(dir, hits[0]);
};

const files = {
  html: join(publicDir, 'about.html'),
  payload: only(about, /^bootstrap-[a-f0-9]{12}\.js$/),
  story: only(chunks, /^scroll-story-[A-Za-z0-9_-]+\.js$/),
  iframe: join(about, 'audio-journey.html'),
  audio: only(about, /^audio-[a-f0-9]{12}\.js$/),
};
for (const f of ['about-v21.css', 'about-v21.js', 'assets/devices-transparent-v10.webp', 'assets/screen-desktop-v1.webp', 'assets/screen-eink-v1.webp', 'assets/screen-phone-v1.webp']) {
  if (!existsSync(join(about, f))) throw new Error(`assets/about-v20/${f} is missing`);
}

const PILL_HTML = '<a class="floating-read" href="/read"><span class="cta-escape">Escape</span><span class="cta-read">Start reading</span></a>';
const FOOTER_HTML =
  '<footer class="about-footer"><span class="about-footer-mark">Tinct</span>' +
  '<nav aria-label="Footer"><a href="/read">Start reading</a><a href="/privacy">Privacy</a>' +
  '<a href="mailto:anders@tinct.app">Contact</a></nav></footer>';
const PILL_ROW = ',["$","a",null,{"className":"floating-read","href":"/read","children":[["$","span",null,{"className":"cta-escape","children":"Escape"}],["$","span",null,{"className":"cta-read","children":"Start reading"}]]}]';
const FOOTER_ROW =
  ',["$","footer",null,{"className":"about-footer","children":[' +
  '["$","span",null,{"className":"about-footer-mark","children":"Tinct"}],' +
  '["$","nav",null,{"aria-label":"Footer","children":[' +
  '["$","a",null,{"href":"/read","children":"Start reading"}],' +
  '["$","a",null,{"href":"/privacy","children":"Privacy"}],' +
  '["$","a",null,{"href":"mailto:anders@tinct.app","children":"Contact"}]]}]]}]';
// The payload is JSON inside a JS string literal, so every quote is escaped.
const esc = s => s.replaceAll('"', '\\"');

// [file, label, anchor (string or RegExp), replacement, expectedCount (null = one or more), alreadyAppliedMarker]
const edits = [
  // The page opens on the slop screen: no header at all. The floating pill is the exit; every story CTA goes into the product.
  ['html', 'remove header', /<header class="site-header">.*?<\/header>/s, '', 1, 'no-header'],
  ['payload', 'remove header', /\[\\"\$\\",\\"header\\",null,\{\\"className\\":\\"site-header\\".*?\}\]\]\}\],/s, '', 1, 'no-header'],
  ['html', 'story CTAs -> /read', '<a class="primary-link final-read-link" href="https://tinct.app"', '<a class="primary-link final-read-link" href="/read"', null],
  ['html', 'pick up the thread -> /read', '<a href="https://tinct.app">Pick up the thread', '<a href="/read">Pick up the thread', null],
  ['story', 'CTAs -> /read', 'href:`https://tinct.app`', 'href:`/read`', null],
  // Trust: no named competitor, share image, no cover preload storm.
  ['html', 'competitor name', 'BOOK SUMMARY · BLINKIST', 'BOOK SUMMARY', null],
  ['story', 'competitor name', 'BOOK SUMMARY · BLINKIST', 'BOOK SUMMARY', null],
  ['html', 'og:image + twitter card', '<meta property="og:type" content="website"/>',
    '<meta property="og:type" content="website"/>' +
    '<meta property="og:image" content="https://tinct.app/og-image.png"/>' +
    '<meta name="twitter:card" content="summary_large_image"/>' +
    '<meta name="twitter:title" content="Tinct · Read something great"/>' +
    '<meta name="twitter:description" content="A beautiful reading app for the world’s greatest books. Read, listen, ask, and pick up the thread when life gets in the way."/>' +
    '<meta name="twitter:image" content="https://tinct.app/og-image.png"/>', 1, 'property="og:image"'],
  ['html', 'override stylesheet', 'data-precedence="vite-rsc/importer-resources"/>',
    'data-precedence="vite-rsc/importer-resources"/><link rel="stylesheet" href="/assets/about-v20/about-v21.css"/>', 1, 'about-v21.css'],
  ['html', 'product fonts for the Talk panel', '<link rel="stylesheet" href="/assets/about-v20/about-v21.css"/>',
    '<link rel="stylesheet" href="/assets/about-v20/about-v21.css"/><link rel="stylesheet" href="/fonts/tinct-fonts.css"/>', 1, 'tinct-fonts.css'],
  ['html', 'behaviour script', 'id="_R_" async=""></script>', 'id="_R_" async=""></script><script src="/assets/about-v20/about-v21.js" defer=""></script>', 1, 'about-v21.js'],
  // Persistent exit ("Escape" until the reveal, then "Start reading") and a footer, mirrored in HTML and payload.
  ['html', 'floating pill + footer', '</main>', PILL_HTML + FOOTER_HTML + '</main>', 1, 'about-footer'],
  ['payload', 'floating pill + footer', esc('{"cinematic":true,"bookshelf":true}]]}]'),
    esc('{"cinematic":true,"bookshelf":true}]') + esc(PILL_ROW) + esc(FOOTER_ROW) + esc(']}]'), 1, 'about-footer'],
  // Recap -> audio transition: the calendar must not come back while the recap fades; the book fades with the beat.
  ['story', 'calendar stays gone', 'className:`recap-calendar`,style:{opacity:1-p}', 'className:`recap-calendar`,style:{opacity:(1-Q(u,.52,.64))*(1-f)}', 1],
  ['story', 'exit and recap fade variables', 'style:{"--answer":p,"--reveal":d}', 'style:{"--answer":p,"--reveal":d,"--exit":f,"--gone":n.index===0?Q(u,.36,.56):0}', 1],
  // The reveal moves to the turn: bridge, brand, voice, language, character, return, audio. Phones skip audio.
  ['story', 'beat order', 'n=[0,.06,.2,.34,.48,.64,.92,1],r=[-1,2,1,3,0,4,5]', 'n=[0,.05,.13,.27,.41,.55,.71,1],r=[-1,5,2,1,3,0,4]', 1],
  // Narrow screens skip the audio scene's book opening and start at the car.
  // The audio scene fades in over the first part of its beat instead of cutting from the dark recap.
  ['story', 'audio fades in', '!t&&n.index===4?(0,_.jsx)(eo,{progress:Math.min(1,u/.88)})', '!t&&n.index===4?(0,_.jsx)(eo,{progress:Math.min(1,u/.88),fade:Q(u,0,.12)})', 1],
  ['story', 'audio frame fade prop', 'function eo({progress:e}){', 'function eo({progress:e,fade:o=1}){', 1],
  ['story', 'audio frame opacity', 'className:`audio-journey-frame`,src:', 'className:`audio-journey-frame`,style:{opacity:o},src:', 1],
  // Scroll speed cap: no scene can advance faster than a few frames' worth per frame, so a flick cannot skip a beat.
  // The card avalanche and the reading chapter get tighter limits.
  ['story', 'speed cap state', 'function Oo({cinematic:e=!1,bookshelf:t=!1})', 'var Ro={v:null,o:null,i:-1};function Oo({cinematic:e=!1,bookshelf:t=!1})', 1, 'var Ro={v:null,o:null'],
  ['story', 'scene speed cap', 'i({...s,overload:u,travel:d})',
    '{let z=$[s.index]?.id,m=z===`infinite`?.022:z===`introducing`?.008:z===`ai`?.014:.03,p=s.progress,q=Ro.o===null?u:Math.max(Ro.o-.022,Math.min(Ro.o+.022,u)),g=Ro.i===s.index&&Ro.v!==null?Math.max(Ro.v-m,Math.min(Ro.v+m,p)):p;Ro.o=q,Ro.v=g,Ro.i=s.index,(q!==u||g!==p)&&Ro.k&&Ro.k(),i({...s,progress:g,overload:q,travel:d})}', 1],
  // Portrait screens anchor the world on the phone so it sits centred, and lift the captions out of the scaled world.
  // On phones the open book starts smaller so both pages fit, and closes to the same size as elsewhere.
  ['audio', 'phone book position', "$('.ta-book-anchor').style.left=`${72-22*move}%`;", "$('.ta-book-anchor').style.left=`${72-22*move-(scene.clientWidth<600&&scene.clientWidth<scene.clientHeight?1.5:0)*(1-move)}%`;", 1],
  ['audio', 'phone book size', 'const small=1.35-.73*move;', 'const pf=scene.clientWidth<600&&scene.clientWidth<scene.clientHeight?.52:1,small=1.35*(1-(1-pf)*(1-move))-.73*move;', 1],
  ['audio', 'portrait framing', 'new ResizeObserver(()=>world.style.transform=`translate(-50%,-50%) scale(${(scene.clientWidth>700?Math.max:Math.min)(scene.clientWidth/1000,scene.clientHeight/625)})`).observe(scene);',
    "new ResizeObserver(()=>{const portrait=scene.clientWidth<scene.clientHeight;scene.classList.toggle('ta-portrait',portrait);[$('.ta-caption'),$('.ta-unwind'),$('.ta-audio-intro')].forEach(el=>{const home=portrait?scene:world;if(el.parentNode!==home)home.appendChild(el)});world.style.transformOrigin=portrait?'68% 50%':'50% 50%';world.style.transform=`translate(${portrait?-68:-50}%,-50%) scale(${(scene.clientWidth>700||portrait?Math.max:Math.min)(scene.clientWidth/1000,scene.clientHeight/625)})`}).observe(scene);", 1, 'ta-portrait'],
  ['story', 'speed cap scheduler hook', 'o=()=>{r||=requestAnimationFrame(a)};return a(),', 'o=()=>{r||=requestAnimationFrame(a)};Ro.k=o;return a(),', 1, 'Ro.k=o'],
  ['story', 'reveal with the product',
    '(0,_.jsxs)(`div`,{className:`reading-brand`,children:[(0,_.jsx)(`p`,{className:`tinct-introduction`,children:`Introducing Tinct.`}),(0,_.jsx)(`h2`,{children:`All this and more.`}),(0,_.jsxs)(`p`,{className:`tinct-promise`,children:[`Built to remove the barriers`,(0,_.jsx)(`br`,{}),`between you and the greatest books.`]})]})',
    '(0,_.jsxs)(`div`,{className:`reading-brand`,style:{opacity:Q(u,0,.1)*(1-Q(u,.9,1))},children:[(0,_.jsxs)(`div`,{className:`brand-copy`,children:[(0,_.jsx)(`p`,{className:`tinct-introduction`,style:{opacity:Q(u,.02,.12),transform:`translateY(${(1-Q(u,.02,.12))*10}px)`},children:`Introducing Tinct.`}),(0,_.jsx)(`h2`,{className:`tinct-promise`,children:[`Built to remove the barriers`,`between you and the greatest books.`].map((e,t)=>(0,_.jsxs)(`span`,{className:`promise-line`,children:[e.split(` `).map((e,n)=>{let r=Q(u,.1+(t*5+n)*.025,.2+(t*5+n)*.025);return(0,_.jsx)(`span`,{className:`promise-word`,style:{opacity:r,transform:`translateY(${(1-r)*10}px)`},children:e+` `},n)}),t===0?(0,_.jsx)(`br`,{}):null]},t))})]}),(0,_.jsxs)(`div`,{className:`brand-devices`,style:{opacity:Q(u,.08,.28),transform:`translateY(${(1-Q(u,.08,.35))*50}px)`},children:[(0,_.jsx)(To,{children:(0,_.jsx)(`figure`,{className:`device-ensemble brand-ensemble`,"aria-label":`Tinct on a laptop, an e-reader and a phone`,children:(0,_.jsxs)(`div`,{className:`device-canvas`,children:[(0,_.jsx)(W,{unoptimized:!0,src:`/assets/about-v20/assets/devices-transparent-v10.webp`,alt:``,width:1536,height:1024}),So.map(e=>(0,_.jsx)(`img`,{className:`lit-screen lit-`+e.kind,src:`/assets/about-v20/assets/screen-`+e.kind+`-v1.webp`,alt:``,width:1536,height:1024,style:{opacity:Q(u,e.kind===`desktop`?.2:e.kind===`eink`?.28:.36,e.kind===`desktop`?.32:e.kind===`eink`?.4:.48)}},e.kind))]})})}),(0,_.jsx)(`div`,{className:`brand-sweep`,"aria-hidden":`true`,style:{transform:`translateX(${Q(u,.3,.8)*220-110}%)`,opacity:.9*Q(u,.3,.4)*(1-Q(u,.7,.8))}})]})]})', 1],
  // Overview scene: Scene II (so "Who is this?" lands on a real supporting name), one highlight and one question at a time.
  ['story', 'Scene II overview passage', 'return t===`character`?',
    'return k?(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(`h3`,{children:(0,_.jsx)(`mark`,{className:`ask-mark`,style:{"--k":k[0]},children:`Scene II.`})}),' +
    '(0,_.jsx)(`p`,{children:(0,_.jsx)(`i`,{children:`King.`})}),' +
    '(0,_.jsxs)(`p`,{children:[`And we here dispatch You, good Cornelius, and you, `,(0,_.jsx)(`mark`,{className:`ask-mark`,style:{"--k":k[2]},children:`Voltemand`}),`, For bearers of this greeting to old Norway;`]}),' +
    '(0,_.jsxs)(`p`,{children:[`Giving to you no further personal power`,(0,_.jsx)(`br`,{}),`To business with the king, more than the scope`,(0,_.jsx)(`br`,{}),(0,_.jsx)(`mark`,{className:`ask-mark`,style:{"--k":k[1]},children:`Of these dilated articles allow.`}),(0,_.jsx)(`br`,{}),`Farewell, and let your haste commend your duty.`]}),' +
    '(0,_.jsx)(`p`,{children:(0,_.jsx)(`i`,{children:`Cornelius, Voltemand.`})}),(0,_.jsx)(`p`,{children:`In that and all things will we show our duty.`}),' +
    '(0,_.jsx)(`p`,{children:(0,_.jsx)(`i`,{children:`King.`})}),(0,_.jsx)(`p`,{children:`We doubt it nothing: heartily farewell.`})]}):t===`character`?', 1, 'children:`Scene II.`})})'],
  ['story', 'overview left page is Scene II', 'children:n.index===3?(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(`h3`,{children:`Scene II.`})',
    'children:n.index===3||t?(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(`h3`,{children:`Scene II.`})', 1],
  ['story', 'passage steps param', 'function ro({modern:e=!1,highlight:t=``,audio:n=!1,onCharacter:r})',
    'function ro({modern:e=!1,highlight:t=``,audio:n=!1,onCharacter:r,steps:k=null})', 1],
  ['story', 'pass steps in overview', 'highlight:t?``:d<1||n.index===2||n.index===3?g:``,audio:n.index===4&&d>0})',
    'highlight:t?``:d<1||n.index===2||n.index===3?g:``,audio:n.index===4&&d>0,steps:t?[Q(u,.12,.24)*(1-Q(u,.32,.4)),Q(u,.32,.44)*(1-Q(u,.52,.6)),Q(u,.52,.64)]:null})', 1],
  ['story', 'headline + name marks',
    '(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(`h3`,{children:`Scene IV.`}),(0,_.jsx)(`p`,{children:(0,_.jsx)(`i`,{children:`Hamlet.`})}),e?',
    '(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(`h3`,{children:(0,_.jsx)(`mark`,{className:`ask-mark`,style:{"--k":k?k[0]:0},children:`Scene IV.`})}),' +
    '(0,_.jsx)(`p`,{children:(0,_.jsx)(`i`,{children:(0,_.jsx)(`mark`,{className:`ask-mark`,style:{"--k":k?k[2]:0},children:`Hamlet.`})})}),e?', 1, 'ask-mark`,style:{"--k":k?k[0]:0}'],
  ['story', 'sentence mark',
    '(0,_.jsx)(`span`,{className:t===`language`||t===`voice`||n?`word-target`:``,children:`More honoured in the breach than the observance.`})',
    '(0,_.jsx)(`span`,{className:(t===`language`||t===`voice`||n?`word-target`:``)+(k?` ask-mark`:``),style:k?{"--k":k[1]}:void 0,children:`More honoured in the breach than the observance.`})', 1],
  ['story', 'overview questions', '[`Where was I?`,`What does this mean?`,`Who is this again?`].map((e,t)=>{let n=Q(u,.12+t*.2,.24+t*.2);return',
    '[`What happened before this?`,`I have no idea what this means.`,`Who is this?`].map((e,t)=>{let n=Q(u,.12+t*.2,.24+t*.2)*(t<2?1-Q(u,.32+t*.2,.4+t*.2):1);return', 1],
  // Language scene: the edition is named in the page header.
  ['story', 'edition name in header', 'children:[`Act I, Scene `,n.index===3?`II`:`IV`]})]})',
    'children:[`Act I, Scene `,n.index===3||t?`II`:`IV`]}),(0,_.jsx)(`em`,{className:`edition-name`,style:{opacity:n.index===1&&h?1:0},children:`Modern translation`})]})', 1],
  // Type and copy.
  ['story', 'recap line', '(0,_.jsxs)(`span`,{className:`recap-time`,children:[(0,_.jsx)(`span`,{children:`LAST TIME YOU READ`}),(0,_.jsx)(`span`,{children:`THREE WEEKS AGO`})]})',
    '(0,_.jsx)(`span`,{className:`recap-time`,children:`Last time you read: three weeks ago`})', 1],
  ['story', 'character card kicker', '(0,_.jsx)(`small`,{children:`CHARACTERS · HAMLET`})', '(0,_.jsx)(`small`,{children:`Characters · Hamlet`})', 1],
  ['story', 'fuller character page', 'old Norway;`]})]}):',
    'old Norway;`]}),(0,_.jsxs)(`p`,{children:[`Giving to you no further personal power`,(0,_.jsx)(`br`,{}),`To business with the king, more than the scope`,(0,_.jsx)(`br`,{}),`Of these dilated articles allow.`,(0,_.jsx)(`br`,{}),`Farewell, and let your haste commend your duty.`]}),(0,_.jsx)(`p`,{children:(0,_.jsx)(`i`,{children:`Cornelius, Voltemand.`})}),(0,_.jsx)(`p`,{children:`In that and all things will we show our duty.`}),(0,_.jsx)(`p`,{children:(0,_.jsx)(`i`,{children:`King.`})}),(0,_.jsx)(`p`,{children:`We doubt it nothing: heartily farewell.`})]}):', 1],
  ['story', 'talk panel button labels', 'a?`Show voice view`:`Read the conversation`]}', 'a?`Voice`:`Transcript`]}', 1],
  ['story', 'bookshelf lighting', 'filter:`saturate(${e===5?u:e===4?.12:0})`', 'filter:`saturate(${e===5?u:e===4?.12:0}) brightness(${e===5?1+.3*u:1})`', 1],
  ['iframe', 'intro line', 'Read and listen<br><em>at will.</em>', 'Read and listen<br><em>wherever you are.</em>', 1],
  ['iframe', 'intro width', '.ta-audio-intro{position:absolute;left:6%;top:32%;width:37%;', '.ta-audio-intro{position:absolute;left:6%;top:32%;width:40%;', 1],
  ['iframe', 'keep talking', '<div class="ta-keep-talking">and keep<br><em>talking.</em></div>', '<div class="ta-keep-talking">Keep<br><em>talking.</em></div>', 1],
  ['iframe', 'Android e-readers', '<em>On your favourite<br>e-reader.</em>', '<em>On Android<br>e-readers.</em>', 1],
  ['iframe', 'portrait captions', '#tinct-audio-couch-study .ta-audio-intro em{color:#d6c29b}</style>', '#tinct-audio-couch-study .ta-audio-intro em{color:#d6c29b}#tinct-audio-couch-study .ta-scene.ta-portrait .ta-caption,#tinct-audio-couch-study .ta-scene.ta-portrait .ta-unwind{left:24px;right:24px;width:auto;top:auto;bottom:max(28px,4vh)}#tinct-audio-couch-study .ta-scene.ta-portrait .ta-caption-title,#tinct-audio-couch-study .ta-scene.ta-portrait .ta-unwind{font-size:clamp(24px,6.2vw,40px);line-height:1.1}#tinct-audio-couch-study .ta-scene.ta-portrait .ta-keep-talking{margin-top:14px}#tinct-audio-couch-study .ta-scene.ta-portrait .ta-unwind em{font-size:.78em;margin-top:12px}#tinct-audio-couch-study .ta-scene.ta-portrait .ta-audio-intro{left:24px;right:24px;width:auto;top:auto;bottom:max(28px,4vh);font-size:clamp(24px,6.2vw,40px);line-height:1.1}</style>', 1, 'ta-portrait'],
];

const text = Object.fromEntries(Object.entries(files).map(([k, p]) => [k, readFileSync(p, 'utf8')]));
let applied = 0, skipped = 0;
for (const [file, label, anchor, replacement, expected, marker] of edits) {
  const isRe = anchor instanceof RegExp;
  const has = s => isRe ? anchor.test(s) : s.includes(anchor);
  const done = (marker === 'no-read-link' || marker === 'no-header') ? !has(text[file])
    : marker ? text[file].includes(marker)
    : text[file].includes(replacement) && !has(text[file]);
  if (done) { skipped++; continue; }
  const count = isRe ? (text[file].match(new RegExp(anchor.source, anchor.flags + 'g')) || []).length : text[file].split(anchor).length - 1;
  if (count === 0 || (expected !== null && count !== expected)) {
    throw new Error(`${file}: "${label}" expected ${expected ?? 'one or more'} anchor(s), found ${count}. The export changed; update this script.`);
  }
  text[file] = isRe ? text[file].replace(new RegExp(anchor.source, anchor.flags + 'g'), replacement) : text[file].replaceAll(anchor, replacement);
  applied++;
  console.log(`applied  ${file}: ${label} (${count})`);
}
// Cover-collection preloads are removed by pattern; nothing to anchor on.
const preloadRe = /<link rel="preload" as="image" href="\/assets\/about-v20\/assets\/collection\/[^"]+"\/>/g;
const preloads = text.html.match(preloadRe) || [];
if (preloads.length) { text.html = text.html.replaceAll(preloadRe, ''); applied++; console.log(`applied  html: removed ${preloads.length} cover preloads`); } else skipped++;

for (const [k, p] of Object.entries(files)) writeFileSync(p, text[k]);
console.log(`done: ${applied} edit(s) applied, ${skipped} already in place`);
