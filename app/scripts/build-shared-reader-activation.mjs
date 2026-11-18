import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

const entry = fileURLToPath(new URL('../src/sharedReaderActivation.ts', import.meta.url))

/** Compile the static Library's module from React's activation decision. */
export async function buildSharedReaderActivation(defaultOn) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: 'es2022',
    write: false,
    minify: true,
    legalComments: 'none',
    define: { 'import.meta.env.VITE_SHARED_READER_DEFAULT': JSON.stringify(defaultOn ? '1' : '') },
  })
  if (result.outputFiles.length !== 1) throw new Error('Expected one Library activation module')
  return result.outputFiles[0].text
}
