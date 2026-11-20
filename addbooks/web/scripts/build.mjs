#!/usr/bin/env node
// Builds the Add-a-book page for tinct.app/lab/addbook/ into addbooks/web/dist/lab-addbook/,
// from its only source, app/public/lab/addbook (with a fresh catalogue and search.js).
//   node addbooks/web/scripts/build.mjs [--catalog <index.json[.gz]>]
// Needs the search catalogue (./addbooks/scripts/build-index) unless a committed
// catalogue (addbooks/web/data/catalog.json.gz, else the installed
// app/public/lab/addbook/data/catalog.json.gz) is present. No npm dependencies.
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { REPO, loadFullIndex, slimWork, obtainable, lostGutenbergEpubs } from './catalog.mjs';

const WEB = join(REPO, 'addbooks/web');
const OUT = join(WEB, 'dist/lab-addbook');
const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null };

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(REPO, 'app/public/lab/addbook'), OUT, { recursive: true });

// Tinct's own stylesheet: the current app build when there is one, else the installed copy.
const appAssets = join(REPO, 'app/dist/assets');
let appCss = null;
if (existsSync(appAssets)) {
  const css = readdirSync(appAssets).filter(f => /^index-.*\.css$/.test(f)).map(f => join(appAssets, f)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
  if (css) appCss = readFileSync(css, 'utf8').replace(/@font-face\{font-family:Inter[^}]*\}/g, '');
}
mkdirSync(join(OUT, 'css'), { recursive: true });
writeFileSync(join(OUT, 'css/tinct-app.css'), appCss ?? readFileSync(join(REPO, 'app/public/lab/addbook/css/tinct-app.css'), 'utf8'));

// The search engine's ranking, unchanged.
cpSync(join(REPO, 'addbooks/site/search.js'), join(OUT, 'js/search.js'));

// The slim catalogue.
mkdirSync(join(OUT, 'data'), { recursive: true });
// Without the full index, the committed catalogue, else the one installed in the app,
// is copied byte for byte (rebuilding it needs ./addbooks/scripts/build-index).
const committed = [join(WEB, 'data/catalog.json.gz'), join(REPO, 'app/public/lab/addbook/data/catalog.json.gz')].find(existsSync) || join(WEB, 'data/catalog.json.gz');
let works = 0;
if (!opt('--catalog') && !existsSync(join(REPO, 'addbooks/site/data/index.json.gz')) && !existsSync(join(REPO, 'addbooks/site/data/index.json')) && existsSync(committed)) {
  cpSync(committed, join(OUT, 'data/catalog.json.gz'));
  works = 'committed';
} else {
  const full = loadFullIndex(opt('--catalog'));
  // Every Gutenberg work keeps an EPUB edition (Add to Tinct imports only EPUBs).
  const lost = lostGutenbergEpubs(full.works);
  if (lost.length) throw new Error(`${lost.length} Gutenberg works would lose their EPUB edition (e.g. ${lost.slice(0, 3).map(w => w.id).join(', ')}). Rebuild the index with ./addbooks/scripts/build-index.`);
  const list = full.works.filter(obtainable).map(slimWork);
  works = list.length;
  const payload = JSON.stringify({ version: 1, builtAt: full.builtAt, works: list });
  writeFileSync(join(OUT, 'data/catalog.json.gz'), gzipSync(Buffer.from(payload), { level: 9 }));
}

let sha = 'local';
try { sha = execSync('git rev-parse --short HEAD', { cwd: REPO }).toString().trim() } catch {}
const label = `Add a book · ${new Date().toISOString().slice(0, 10)} · ${sha}`;
const html = readFileSync(join(OUT, 'index.html'), 'utf8').replaceAll('__BUILD__', label);
writeFileSync(join(OUT, 'index.html'), html);
writeFileSync(join(OUT, 'build.json'), JSON.stringify({ label, works, builtAt: new Date().toISOString() }, null, 2) + '\n');
const size = f => (statSync(join(OUT, f)).size / 1024 / 1024).toFixed(2) + ' MB';
console.log(`Built ${OUT}\n  ${label}\n  catalogue: ${works} works, ${size('data/catalog.json.gz')} (gzip)`);
