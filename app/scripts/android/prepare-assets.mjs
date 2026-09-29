/** Remove generated website-only pages from the native copy, never source data. */
import { rm, stat, readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
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


// Only omit chapter files whose paragraph bytes exactly match the whole edition.
// Record every mismatch; preserve both versions rather than choose a new source.
const compacted=[], retained=[]
let duplicateBytes=0
const shardRoot=join(root,'data/editions-chapters')
for (const name of await readdir(shardRoot)) {
  const dir=join(shardRoot,name)
  if(!(await stat(dir)).isDirectory())continue
  const mismatches=[]
  // The Bible reader has its own manifest/chapter loader. Keep those files;
  // the generic whole-edition shortcut is not used on that path.
  if(name.startsWith('bible-')) { retained.push({edition:name,reason:'Bible chapter loader'});continue }
  if(name.endsWith('-da')) { retained.push({edition:name,reason:'withdrawn recovery assets'});continue }
  const manifest=JSON.parse(await readFile(join(dir,'manifest.json'),'utf8'))
  const whole=JSON.parse(await readFile(join(root,'data/editions',name+'.json'),'utf8'))
  if(manifest.chapters.length!==whole.chapters.length)mismatches.push('chapter-count')
  for(const entry of manifest.chapters) {
    const chapter=whole.chapters.find(c=>c.number===entry.number)
    const shard=JSON.parse(await readFile(join(dir,entry.path),'utf8'))
    if(!chapter || JSON.stringify(chapter.paragraphs)!==JSON.stringify(shard.paragraphs))
      mismatches.push(entry.number)
  }
  if(mismatches.length) { retained.push({edition:name,reason:'different source copies',chapters:mismatches});continue }
  duplicateBytes+=await bytes(dir);compacted.push(name)
  await rm(dir,{recursive:true,force:true})
}
await writeFile(join(root,'native-edition-storage.json'),JSON.stringify({wholeEditions:compacted}))
await mkdir('artifacts/android',{recursive:true})
await writeFile('artifacts/android/text-deduplication.json',JSON.stringify({duplicateBytes,compacted,retained},null,2))
console.log(JSON.stringify({duplicateChapterBytesRemoved:duplicateBytes,compacted:compacted.length,retained}))

// Native catalogue state is versioned independently of private reader data.
const nativeIndex=JSON.parse(await readFile(join(root,'native-books/index.json'),'utf8'))
const bundledBooks=['frankenstein','bible']
await writeFile(join(root,'native-books/bundled.json'),JSON.stringify({books:bundledBooks}))
let onDemandBytes=0
for(const folder of ['data/editions','data/editions-chapters','data/characters']) {
  for(const name of await readdir(join(root,folder))) {
    const keep=bundledBooks.some(id=>name.startsWith(id+'-')||name===id+'.v1.json')
    if(keep)continue
    const target=join(root,folder,name)
    onDemandBytes+=await bytes(target)
    await rm(target,{recursive:true,force:true})
  }
}
for(const name of await readdir(join(root,'native-books'))) {
  if(name==='index.json'||name==='bundled.json'||bundledBooks.some(id=>name.startsWith(id+'-')))continue
  await rm(join(root,'native-books',name))
}
await writeFile(join(root,'native-edition-storage.json'),JSON.stringify({
  wholeEditions:compacted.filter(name=>bundledBooks.some(id=>name.startsWith(id+'-')))
}))
await writeFile('artifacts/android/native-library-footprint.json',JSON.stringify({
 bundledBooks,onDemandBytes,availableBooks:nativeIndex.books.length,
 note:'Other books download on request; published source files and saved reader data are untouched.'
},null,2))
console.log(JSON.stringify({bundledBooks,bookBytesAvailableOnDemand:onDemandBytes}))
