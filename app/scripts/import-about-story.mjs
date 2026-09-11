// Import the approved, already-built Sites story without changing the reader's
// React version, dependencies, security policy, or root asset namespace.
// Usage: node scripts/import-about-story.mjs /absolute/path/to/dist/client
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const source = resolve(process.argv[2]);
const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const prefix = '/assets/about-v20';
const target = join(publicDir, prefix);
mkdirSync(target, { recursive: true });

function relocate(text) {
  return text.replaceAll('/assets/', `${prefix}/assets/`)
    .replaceAll('/_next/', `${prefix}/_next/`)
    .replaceAll('/fonts/', `${prefix}/fonts/`)
    .replaceAll('/audio-journey.html', `${prefix}/audio-journey.html`)
    .replace(/\/bookshelf(?=["\\]|$)/g, '/about')
    .replaceAll('noindex, nofollow', 'index, follow');
}

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.endsWith('.map')) continue;
    const input = join(from, entry.name), output = join(to, entry.name);
    if (entry.isDirectory()) copyTree(input, output);
    else if (['.js', '.css', '.json'].includes(extname(entry.name))) {
      writeFileSync(output, relocate(readFileSync(input, 'utf8')));
    } else copyFileSync(input, output);
  }
}

// Production CSP disallows inline JavaScript. Preserve all bootstrap statements
// in order and execute them together before the module entry, without loosening
// the site's script-src policy. The iframe's script remains after its own DOM.
function externalize(html, name) {
  const scripts = [];
  html = html.replace(/<script([^>]*)>([\s\S]*?)<\/script>/g, (tag, attrs, body) => {
    if (/\bsrc\s*=/.test(attrs) || !body.trim()) return tag;
    scripts.push(body);
    return '';
  });
  const js = scripts.join('\n;\n');
  const hash = createHash('sha256').update(js).digest('hex').slice(0, 12);
  const filename = `${name}-${hash}.js`;
  writeFileSync(join(target, filename), js);
  const tag = `<script src="${prefix}/${filename}"></script>`;
  return name === 'bootstrap'
    ? html.replace('<script ', tag + '<script ')
    : html.replace('</body>', tag + '</body>');
}

for (const directory of ['assets', 'fonts', '_next']) {
  copyTree(join(source, directory), join(target, directory));
}
let html = relocate(readFileSync(join(source, 'bookshelf.html'), 'utf8'));
html = externalize(html, 'bootstrap');
html = html.replace('</head>', '<link rel="canonical" href="https://tinct.app/about"/><meta property="og:title" content="Tinct · Read something great"/><meta property="og:url" content="https://tinct.app/about"/><meta property="og:type" content="website"/></head>');
writeFileSync(join(publicDir, 'about.html'), html);
writeFileSync(join(publicDir, 'about.rsc'), relocate(readFileSync(join(source, 'bookshelf.rsc'), 'utf8')));
writeFileSync(join(target, 'audio-journey.html'), externalize(relocate(readFileSync(join(source, 'audio-journey.html'), 'utf8')), 'audio'));
console.log('Imported approved v20 story at /about, with isolated assets and external scripts.');
