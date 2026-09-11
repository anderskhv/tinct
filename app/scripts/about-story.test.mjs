import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const html = readFileSync(publicDir + 'about.html', 'utf8');
const iframe = readFileSync(publicDir + 'assets/about-v20/audio-journey.html', 'utf8');

test('published story is the approved bookshelf variant, not the reader', () => {
  assert.match(html.replace(/<[^>]*>/g, ' '), /We live in the\s+age of/);
  assert.match(html, /cinematic/);
  assert.match(html, /https:\/\/tinct.app\/about/);
  assert.doesNotMatch(html, /noindex|noarchive|nofollow/);
  assert.doesNotMatch(html, /assets\/index-/);
});

test('parent and audio iframe comply with script-src self', () => {
  for (const document of [html, iframe]) {
    for (const script of document.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      assert.match(script[1], /src=/);
      assert.equal(script[2].trim(), '');
    }
  }
});

test('all HTML asset references resolve inside the isolated namespace', () => {
  for (const document of [html, iframe]) {
    for (const match of document.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
      // Workers static assets serve /privacy from privacy.html (html_handling), so
      // accept an extensionless page link when its .html file exists.
      assert.ok(existsSync(publicDir + match[1]) || existsSync(publicDir + match[1] + '.html'), match[1]);
    }
  }
  assert.ok(existsSync(publicDir + 'about.rsc'));
});
