import { createHash } from 'crypto'
import path from 'path'
import { buildSync } from 'esbuild'

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
    define: { __BUILD_VERSION__: JSON.stringify(buildVersion) },
  })
  const source = result.outputFiles[0].text
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 10)
  return { source, fileName: `assets/reader-boot-${hash}.js` }
}
