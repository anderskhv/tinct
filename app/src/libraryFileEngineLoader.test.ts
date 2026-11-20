// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- browser module shared with the Library page
import { loadFileEngine } from '../public/lab/library_2/add-to-tinct.js'

describe('Library private-book Engine loader', () => {
  it('requests the revised Engine URL and boots its real API and EPUB dependencies', async () => {
    const globals = window as Window & { TinctAI?: unknown; TinctEpub?: unknown; TinctAddEngine?: unknown }
    const names = ['TinctAI', 'TinctEpub', 'TinctAddEngine'] as const
    const former = names.map(name => ({ name, present: Object.hasOwn(globals, name), value: globals[name] }))
    for (const name of names) delete globals[name]
    const requested: string[] = []
    try {
      const engine = await loadFileEngine(async (src: string) => {
        requested.push(src)
        const relative = src.split('?')[0].replace(/^\//, '')
        expect(relative).toMatch(/^lab\/addbook\/js\/(?:tinct-api|epub|add-engine)\.js$/)
        new Function(readFileSync(join(process.cwd(), 'public', relative), 'utf8'))()
      })
      expect(requested).toEqual([
        '/lab/addbook/js/tinct-api.js?v=20261023paste1',
        '/lab/addbook/js/epub.js',
        '/lab/addbook/js/add-engine.js?v=20261029titles1',
      ])
      expect(globals.TinctAI).toMatchObject({ session: expect.any(Function), books: { remove: expect.any(Function) } })
      expect(globals.TinctEpub).toMatchObject({ parse: expect.any(Function) })
      expect(engine).toBe(globals.TinctAddEngine)
      expect(engine).toMatchObject({ library: { get: expect.any(Function), remove: expect.any(Function) },
        legacyEpubAnnotations: { get: expect.any(Function), set: expect.any(Function) } })
      expect(await loadFileEngine(async () => { throw new Error('loaded dependencies must be reused') })).toBe(engine)
    } finally {
      for (const { name, present, value } of former) {
        if (present) globals[name] = value
        else delete globals[name]
      }
    }
  })
})
