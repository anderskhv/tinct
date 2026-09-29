/** Remove generated website-only pages from the native copy, never source data. */
import { rm, stat, readdir, readFile } from 'node:fs/promises'
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

// Chapter JSON duplicates the same text already included in full editions.
// Verify every paragraph before omitting only these generated duplicates.
let duplicateBytes=0, duplicateEditions=0
const shardRoot=join(root,'data/editions-chapters')
for (const name of await readdir(shardRoot)) {
  // Withdrawn Danish assets are retained unchanged for historical recovery.
  if(name.endsWith('-da'))continue
  const dir=join(shardRoot,name)
  if(!(await stat(dir)).isDirectory())continue
  const manifest=JSON.parse(await readFile(join(dir,'manifest.json'),'utf8'))
  const whole=JSON.parse(await readFile(join(root,'data/editions',name+'.json'),'utf8'))
  if(manifest.chapters.length!==whole.chapters.length)throw new Error('Chapter count mismatch: '+name)
  for(const entry of manifest.chapters) {
    const chapter=whole.chapters.find(c=>c.number===entry.number)
    const shard=JSON.parse(await readFile(join(dir,entry.path),'utf8'))
    if(!chapter || JSON.stringify(chapter.paragraphs)!==JSON.stringify(shard.paragraphs))
      throw new Error('Duplicate text mismatch: '+name+' chapter '+entry.number)
  }
  duplicateBytes+=await bytes(dir);duplicateEditions++
  await rm(dir,{recursive:true,force:true})
}
console.log(JSON.stringify({duplicateChapterBytesRemoved:duplicateBytes,duplicateEditions,sourceText:'verified byte-exact against retained whole editions'}))
