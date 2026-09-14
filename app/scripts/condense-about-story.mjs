// Follow the existing export patches with the approved September 14 middle cut.
// Keep source scene indices stable: the shelf animation depends on books being 5.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function condenseAboutStory() {
  const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
  const assets = join(publicDir, 'assets/about-v20');
  const chunks = join(assets, '_next/static/chunks');
  const storyPath = join(chunks, 'scroll-story-BQLclMWW.js');
  let story = readFileSync(storyPath, 'utf8');
  const replace = (before, after) => {
    if (story.includes(after)) return;
    if (story.split(before).length !== 2) throw new Error(`Middle cut: expected one anchor: ${before}`);
    story = story.replace(before, after);
  };
  replace('children:[`Is this really`,(0,_.jsx)(`br`,{}),`what we want?`]}),body:(0,_.jsx)(`p`,{className:`question-or`,children:`…or`})',
    'children:[`Could AI help us`,(0,_.jsx)(`br`,{}),`read better things?`]}),body:null');
  replace('a=r.index;(0,c.useEffect)',
    'a=r.index,nextSceneIndex=t&&a===3?5:t&&a===5?7:a+1;(0,c.useEffect)');
  replace('o(a+1,0,100*(1-r.travel),!0)', 'o(nextSceneIndex,0,100*(1-r.travel),!0)');
  replace('t&&n>=9&&n<=13?null:', 't&&(n===4||n===6||n>=9&&n<=13)?null:');
  // Skip the 240svh bridge. With the chapter reduced to 2220svh, every
  // remaining beat keeps its previous absolute reading/animation distance.
  replace('function no(e){let t=Math.max(0,Math.min(1,e)),',
    'function no(e){let t=.09756+(1-.09756)*Math.max(0,Math.min(1,e)),');
  writeFileSync(storyPath, story);

  const htmlPath = join(publicDir, 'about.html');
  let html = readFileSync(htmlPath, 'utf8');
  html = html.replace(/<section class="journey-step" id="chapter-(?:better|effortless)"[^>]*><\/section>/g, '');
  writeFileSync(htmlPath, html);

  // The published export's filenames predate its in-repo patches. Version the
  // stylesheet and complete module graph together so cached clients cannot
  // combine new section heights with the old sequence or duplicate modules.
  const moduleNames = readdirSync(chunks).filter(n => n.endsWith('.js'));
  const versionedNames = [...moduleNames, 'about-v21.css'];
  const versionPattern = new RegExp('(' + versionedNames.map(n => n.replaceAll('.', '\\.')).join('|') + ')(?!\\?v=middle-20260914)', 'g');
  const references = [htmlPath, join(publicDir, 'about.rsc'),
    ...readdirSync(assets).filter(n => /^bootstrap-.*\.js$/.test(n)).map(n => join(assets, n)),
    ...readdirSync(chunks).filter(n => n.endsWith('.js')).map(n => join(chunks, n))];
  for (const path of references) {
    const before = readFileSync(path, 'utf8');
    const after = before.replace(versionPattern, '$1?v=middle-20260914');
    if (after !== before) writeFileSync(path, after);
  }
  console.log('About middle condensed; opening and demonstration holds preserved.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) condenseAboutStory();
