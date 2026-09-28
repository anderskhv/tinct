/** Remove generated website-only pages from the native copy, never source data. */
import { rm, stat, readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'
const root = resolve('dist')
async function bytes(path) {
  try {
    const s = await stat(path)
    if (s.isDirectory()) return (await Promise.all((await readdir(path)).map(name => bytes(join(path, name))))).reduce((a,b)=>a+b,0)
    return s.size
  } catch (error) { if (error.code === 'ENOENT') return 0; throw error }
}
let removed = 0
for (const name of ['read', 'sitemap.xml', 'robots.txt']) {
  const path = join(root, name)
  removed += await bytes(path)
  await rm(path, { recursive: true, force: true })
}
console.log(JSON.stringify({ nativeWebsiteBytesRemoved: removed, preserved: 'reader, catalogue, fonts, covers, all text and annotation recovery assets' }))
