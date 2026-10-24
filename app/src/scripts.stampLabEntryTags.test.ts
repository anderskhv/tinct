import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
// @ts-expect-error -- local build-time ES module helper
import { buildSharedReaderActivation } from '../scripts/build-shared-reader-activation.mjs'

const require = createRequire(import.meta.url)
type Files = Record<string, string>
const { stampTags, staleTags } = require('../scripts/stamp-lab-entry-tags.cjs') as {
  stampTags: (files: Files, entries: string[]) => { files: Files; tags: Record<string, string> }
  staleTags: (files: Files, entries: string[]) => Array<{ file: string; ref: string; tag: string; expected: string }>
}
const { moduleReferences, missingImports, checkDist } = require('../scripts/check-lab-bundle.cjs') as {
  moduleReferences: (file: string, source: string) => string[]
  missingImports: (modules: Files, exists: (path: string) => boolean) => Array<{ file: string; missing: string }>
  checkDist: (dist: string, publicDir: string) => string[]
}

const sha10 = (text: string) => createHash('sha256').update(text).digest('hex').slice(0, 10)
const ENGINE = 'import{o}from"../assets/ownSwitcher-NEW00001.js";const q=()=>import("../assets/quickBookSwitcher-NEW00002.js");export{o,q}'

// A small dist as the build leaves it: the source tags copied from public/.
const dist = (): Files => ({
  'lab/library-add.js': ENGINE,
  'lab/library-2-reading.js': 'export const r=1',
  'lab/library_2/add-to-tinct.js': "const ENGINE='/lab/library-add.js?v=20261014talkwake';// /lab/library-add.js (comment)\nimport('./catalogue.js?v=20261014talkwake')",
  'lab/library_2/catalogue.js': "import'./add-to-tinct.js?v=20261014talkwake';const p=import('/lab/library-2-reading.js?v=20261014talkwake');const n=()=>import('/lab/native-books.js')",
  'lab/library_2/app.js': "import'./catalogue.js?v=20261014talkwake';import'./funnel.js?v=20261006internal'",
  'lab/library_2/funnel.js': 'export const f=1',
  'lab/library_2/index.html': '<base href="/lab/library_2/"><link rel="modulepreload" href="add-to-tinct.js?v=20261014talkwake"><script type="module" src="app.js?v=20261014talkwake"></script><script src="funnel.js?v=20261006internal"></script><script type="module" src="/lab/account-cards.js"></script>',
  'lab/addbook/js/reader.js': "const SWITCHER_ENGINE = '/lab/library-add.js?v=20261014talkwake';import('/lab/chat-thread.js?v=20261012thread')",
  'lab/addbook/index.html': '<script src="js/reader.js?v=20261015escape"></script>',
  'lab/chat-thread.js': 'export const c=1',
})
const ENTRIES = ['lab/library-add.js', 'lab/library-2-reading.js']

describe('stamp-lab-entry-tags', () => {
  it('emits both named exports from the canonical helper in each built default', async () => {
    const offSource: string = await buildSharedReaderActivation(false)
    const onSource: string = await buildSharedReaderActivation(true)
    expect(onSource).not.toBe(offSource)
    for (const [source, enabled] of [[offSource, false], [onSource, true]] as const) {
      const module = await import(/* @vite-ignore */ `data:text/javascript,${encodeURIComponent(source)}`)
      expect(Object.keys(module).sort()).toEqual(['SHARED_READER_DEFAULT', 'sharedReaderEnabled'])
      expect(module.SHARED_READER_DEFAULT).toBe(enabled)
      expect(module.sharedReaderEnabled('')).toBe(enabled)
      expect(module.sharedReaderEnabled('?sharedReader=1')).toBe(true)
      expect(module.sharedReaderEnabled('?sharedReader=0')).toBe(false)
      expect(source).not.toContain('../../src/')
    }
  })
  it('retags the Library activation import and entry chain when the default changes', () => {
    const fixture = (on: boolean) => ({
      'lab/shared-reader-activation.js': `export const SHARED_READER_DEFAULT=${on};`,
      'lab/library_2/add-to-tinct.js': "import {SHARED_READER_DEFAULT} from '../shared-reader-activation.js?v=old';export const enabled=()=>SHARED_READER_DEFAULT",
      'lab/library_2/app.js': "import './add-to-tinct.js?v=old'",
      'lab/library_2/index.html': '<base href="/lab/library_2/"><link rel="modulepreload" href="/lab/shared-reader-activation.js?v=old"><script type="module" src="app.js?v=old"></script>',
    })
    const entries = ['lab/shared-reader-activation.js']
    const off = stampTags(fixture(false), entries), on = stampTags(fixture(true), entries)
    for (const name of ['lab/shared-reader-activation.js', 'lab/library_2/add-to-tinct.js', 'lab/library_2/app.js'])
      expect(on.tags[name]).not.toBe(off.tags[name])
    expect(off.files['lab/library_2/add-to-tinct.js']).toContain(`shared-reader-activation.js?v=${off.tags['lab/shared-reader-activation.js']}`)
    expect(on.files['lab/library_2/index.html']).toContain(`/lab/shared-reader-activation.js?v=${on.tags['lab/shared-reader-activation.js']}`)
    expect(on.files['lab/library_2/index.html']).toContain(`app.js?v=${on.tags['lab/library_2/app.js']}`)
    expect(staleTags(off.files, entries)).toEqual([])
    expect(staleTags(on.files, entries)).toEqual([])
  })
  it('tags each reference to a built entry with the hash of the emitted file', () => {
    const { files, tags } = stampTags(dist(), ENTRIES)
    expect(tags['lab/library-add.js']).toBe(sha10(ENGINE))
    expect(files['lab/library_2/add-to-tinct.js']).toContain(`'/lab/library-add.js?v=${sha10(ENGINE)}'`)
    expect(files['lab/addbook/js/reader.js']).toContain(`'/lab/library-add.js?v=${sha10(ENGINE)}'`)
    expect(files['lab/library_2/catalogue.js']).toContain(`'/lab/library-2-reading.js?v=${sha10('export const r=1')}'`)
    // The built entries themselves are unchanged.
    expect(files['lab/library-add.js']).toBe(ENGINE)
  })

  it('re-tags the cached files on the way to an entry from their new content, and the pages that load them', () => {
    const { files, tags } = stampTags(dist(), ENTRIES)
    expect(tags['lab/addbook/js/reader.js']).toBe(sha10(files['lab/addbook/js/reader.js']))
    expect(files['lab/addbook/index.html']).toBe(`<script src="js/reader.js?v=${tags['lab/addbook/js/reader.js']}"></script>`)
    // add-to-tinct.js and catalogue.js import each other: one tag for both, everywhere.
    expect(tags['lab/library_2/add-to-tinct.js']).toBe(tags['lab/library_2/catalogue.js'])
    expect(files['lab/library_2/app.js']).toContain(`'./catalogue.js?v=${tags['lab/library_2/catalogue.js']}'`)
    expect(files['lab/library_2/index.html']).toContain(`href="add-to-tinct.js?v=${tags['lab/library_2/add-to-tinct.js']}"`)
    expect(files['lab/library_2/index.html']).toContain(`src="app.js?v=${tags['lab/library_2/app.js']}"`)
  })

  it('leaves untagged references, comments and files off the chain as they are', () => {
    const { files, tags } = stampTags(dist(), ENTRIES)
    expect(files['lab/library_2/add-to-tinct.js']).toContain('// /lab/library-add.js (comment)')
    expect(files['lab/library_2/catalogue.js']).toContain("import('/lab/native-books.js')")
    expect(files['lab/library_2/index.html']).toContain('src="/lab/account-cards.js"')
    expect(files['lab/library_2/index.html']).toContain('src="funnel.js?v=20261006internal"')
    expect(files['lab/library_2/app.js']).toContain("'./funnel.js?v=20261006internal'")
    expect(files['lab/addbook/js/reader.js']).toContain("'/lab/chat-thread.js?v=20261012thread'")
    expect(tags).not.toHaveProperty('lab/library_2/funnel.js')
  })

  it('changes every tag on the chain when the entry is rebuilt, and is stable when it is not', () => {
    const first = stampTags(dist(), ENTRIES)
    expect(stampTags(first.files, ENTRIES).files).toEqual(first.files)
    const rebuilt = { ...dist(), 'lab/library-add.js': ENGINE.replace('NEW00001', 'NEW00003') }
    const second = stampTags(rebuilt, ENTRIES)
    for (const file of ['lab/library-add.js', 'lab/library_2/add-to-tinct.js', 'lab/library_2/catalogue.js', 'lab/library_2/app.js', 'lab/addbook/js/reader.js']) {
      expect(second.tags[file]).not.toBe(first.tags[file])
    }
    expect(second.tags['lab/library-2-reading.js']).toBe(first.tags['lab/library-2-reading.js'])
  })
})

describe('check-lab-bundle', () => {
  it('reads static, side-effect, dynamic, URL and preload-list imports, resolved against the module', () => {
    const source = 'import{a}from"../assets/a-1.js";import"../assets/b-2.js";import("./c.js?v=1");new URL("../assets/w-3.mjs",import.meta.url);'
      + 'const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/d-4.js","assets/e-5.css"])))=>i.map(i=>d[i]);const t="see from \\"ws\\""'
    expect(moduleReferences('lab/x.js', source)).toEqual(['assets/a-1.js', 'assets/b-2.js', 'assets/d-4.js', 'assets/e-5.css', 'assets/w-3.mjs', 'lab/c.js'])
  })

  it('names a module whose imported chunk is not in dist', () => {
    const present = new Set(['assets/ownSwitcher-NEW00001.js'])
    expect(missingImports({ 'lab/library-add.js': ENGINE }, file => present.has(file))).toEqual([
      { file: 'lab/library-add.js', missing: 'assets/quickBookSwitcher-NEW00002.js' },
    ])
  })

  it('names every reference whose tag does not match the built file, and nothing after the stamp', () => {
    const stale = staleTags(dist(), ENTRIES)
    expect(stale).toContainEqual({ file: 'lab/library_2/add-to-tinct.js', ref: '/lab/library-add.js', tag: '20261014talkwake', expected: sha10(ENGINE) })
    expect(stale).toContainEqual({ file: 'lab/addbook/js/reader.js', ref: '/lab/library-add.js', tag: '20261014talkwake', expected: sha10(ENGINE) })
    expect(staleTags(stampTags(dist(), ENTRIES).files, ENTRIES)).toEqual([])
  })

  describe('on a dist directory', () => {
    let root = ''
    afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }) })
    const write = (files: Files) => {
      root = mkdtempSync(join(tmpdir(), 'lab-bundle-'))
      for (const [file, text] of Object.entries(files)) {
        mkdirSync(dirname(join(root, 'dist', file)), { recursive: true })
        writeFileSync(join(root, 'dist', file), text)
      }
      // public/ holds the static files; the built entries have no source there.
      for (const file of Object.keys(files).filter(f => f.startsWith('lab/') && !ENTRIES.includes(f))) {
        mkdirSync(dirname(join(root, 'public', file)), { recursive: true })
        writeFileSync(join(root, 'public', file), '')
      }
      return checkDist(join(root, 'dist'), join(root, 'public'))
    }
    const chunks = { 'lab/native-books.js': 'export const n=1', 'assets/ownSwitcher-NEW00001.js': 'export const o=1', 'assets/quickBookSwitcher-NEW00002.js': 'export const q=1' }

    it('passes a stamped build with every chunk present', () => {
      expect(write({ ...stampTags(dist(), ENTRIES).files, ...chunks })).toEqual([])
    })
    it('fails on a missing chunk', () => {
      const { 'assets/quickBookSwitcher-NEW00002.js': _removed, ...kept } = chunks
      expect(write({ ...stampTags(dist(), ENTRIES).files, ...kept }))
        .toEqual(['/lab/library-add.js imports /assets/quickBookSwitcher-NEW00002.js, which is not in dist'])
    })
    it('fails on a hand-kept tag that does not match the built entry', () => {
      const problems = write({ ...dist(), ...chunks })
      expect(problems).toContain(`/lab/library_2/add-to-tinct.js references /lab/library-add.js?v=20261014talkwake; the built file's tag is ${sha10(ENGINE)}`)
      expect(problems).toContain(`/lab/addbook/js/reader.js references /lab/library-add.js?v=20261014talkwake; the built file's tag is ${sha10(ENGINE)}`)
    })
  })
})

describe('Add a book’s one build stamp', () => {
  const { stampBuild, bundleHash } = require('../scripts/stamp-lab-entry-tags.cjs') as {
    stampBuild: (files: Files, stamp: string) => { files: Files; stamped: string[] }
    bundleHash: (appHtml: string) => string | null
  }
  const files = (): Files => ({
    'app.html': '<script type="module" crossorigin src="/assets/index-AbC_12-x.js"></script>',
    'lab/addbook/book.html': '<script src="js/reader.js?v=__TINCT_BUILD__"></script><script src="/lab/wait-ring.js?v=__TINCT_BUILD__"></script>',
    'lab/addbook/js/reader.js': "const SWITCHER_ENGINE = '/lab/library-add.js?v=__TINCT_BUILD__';import('/lab/chat-thread.js?v=__TINCT_BUILD__')",
    'lab/library-add.js': ENGINE,
    'lab/library_2/app.js': "import'./catalogue.js?v=__TINCT_BUILD__'",
  })

  it('takes the hash of the index bundle app.html loads', () => {
    expect(bundleHash(files()['app.html'])).toBe('AbC_12-x')
    expect(bundleHash('<html></html>')).toBeNull()
  })
  it('replaces the placeholder in Add a book’s html and js only', () => {
    const { files: out, stamped } = stampBuild(files(), 'AbC_12-x')
    expect(stamped).toEqual(['lab/addbook/book.html', 'lab/addbook/js/reader.js'])
    expect(out['lab/addbook/book.html']).toBe('<script src="js/reader.js?v=AbC_12-x"></script><script src="/lab/wait-ring.js?v=AbC_12-x"></script>')
    expect(out['lab/library_2/app.js']).toBe(files()['lab/library_2/app.js'])
  })
  it('then leaves a reference to a built entry to its content tag', () => {
    const { files: out } = stampTags(stampBuild(files(), 'AbC_12-x').files, ['lab/library-add.js'])
    expect(out['lab/addbook/js/reader.js']).toBe(`const SWITCHER_ENGINE = '/lab/library-add.js?v=${sha10(ENGINE)}';import('/lab/chat-thread.js?v=AbC_12-x')`)
    expect(out['lab/addbook/book.html']).toContain(`js/reader.js?v=${sha10(out['lab/addbook/js/reader.js'])}`)
    expect(out['lab/addbook/book.html']).toContain('/lab/wait-ring.js?v=AbC_12-x')
  })
  it('refuses a stamp that is not a cache tag', () => {
    expect(() => stampBuild(files(), '')).toThrow()
    expect(() => stampBuild(files(), 'a b')).toThrow()
  })
})
