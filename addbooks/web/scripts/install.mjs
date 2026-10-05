#!/usr/bin/env node
// Copies the built page into the app's static assets, so the normal deploy serves it at
// https://tinct.app/lab/addbook/ (unlinked). Run build.mjs first.
//   node addbooks/web/scripts/install.mjs
import { cpSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO } from './catalog.mjs';

const FROM = join(REPO, 'addbooks/web/dist/lab-addbook');
const TO = join(REPO, 'app/public/lab/addbook');
if (!existsSync(join(FROM, 'index.html'))) { console.error('Nothing to install. Run: node addbooks/web/scripts/build.mjs'); process.exit(1) }
rmSync(TO, { recursive: true, force: true });
cpSync(FROM, TO, { recursive: true });
const { label } = JSON.parse(readFileSync(join(TO, 'build.json'), 'utf8'));
console.log(`Installed ${label}\n  -> ${TO}\nNext: from app/, run the usual checks (npm test, CI=true npm run build, npm run verify-bundle), commit app/public/lab/addbook, and release as usual. It will be live at https://tinct.app/lab/addbook/ (not linked from anywhere).`);
