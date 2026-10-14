import { createHash } from 'crypto'
import path from 'path'
import { buildSync } from 'esbuild'

/**
 * The books whose new-reader default edition is not Modern English, with that
 * default ('' when nothing is offered), worked out by the app's own
 * `defaultPrimaryEditionKey` over the registry and the edition holds as they
 * are at build time. The boot script uses it to preload a deep link's text
 * (`readerBootDeepLink`); a table this small fits the head script, and being
 * computed by each build it never needs editing when a book or hold changes.
 */
export function readerBootPrimaryExceptions(root = process.cwd()): Record<string, string> {
  const result = buildSync({
    stdin: {
      contents: [
        "import { BOOKS } from './src/data/bookRegistry'",
        "import { defaultPrimaryEditionKey } from './src/data/editionDefaults'",
        'const exceptions: Record<string, string> = {}',
        "for (const book of BOOKS) { const key = defaultPrimaryEditionKey(book.id, book.editions) ?? ''; if (key !== 'modern-en') exceptions[book.id] = key }",
        'export default exceptions',
      ].join('\n'),
      resolveDir: root,
      loader: 'ts',
      sourcefile: 'reader-boot-primary-exceptions.ts',
    },
    bundle: true,
    platform: 'neutral',
    format: 'iife',
    globalName: '__readerBootPrimaryExceptions',
    write: false,
    logLevel: 'silent',
    loader: { '.json': 'json' },
    define: { __BUILD_VERSION__: '"reader-boot"', 'import.meta.env': '{}' },
  })
  const value = new Function(`${result.outputFiles[0].text}; return __readerBootPrimaryExceptions.default`)() as Record<string, string>
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)))
}

/**
 * Bundle src/lab/readerBootEntry.ts into one small classic script with the
 * build version inlined. The reader HTML loads it synchronously in <head>
 * (the CSP allows no inline script), so it must stay dependency-light.
 */
export function buildReaderBootScript(buildVersion: string, root = process.cwd()): { source: string; fileName: string } {
  const result = buildSync({
    entryPoints: [path.resolve(root, 'src/lab/readerBootEntry.ts')],
    bundle: true,
    format: 'iife',
    minify: true,
    write: false,
    target: 'es2019',
    legalComments: 'none',
    define: {
      __BUILD_VERSION__: JSON.stringify(buildVersion),
      __READER_BOOT_PRIMARY_EXCEPTIONS__: JSON.stringify(readerBootPrimaryExceptions(root)),
    },
  })
  const source = result.outputFiles[0].text
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 10)
  return { source, fileName: `assets/reader-boot-${hash}.js` }
}
