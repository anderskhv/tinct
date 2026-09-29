import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import type { Book } from '../../src/types'

export type NativeBookFile = { path: string; sha256: string; bytes: number }
export function buildNativeBooks(
  publicRoot: string,
  registry: Book[],
  catalogue: { books: Array<{ id: string; editions: Array<{ key: string; discoveryAvailable?: boolean; availability: { chapterText: boolean } }>; discoveryAvailable?: boolean; [key: string]: unknown }>; [key: string]: unknown },
  prefaces: Map<string, string>,
) {
  const manifests: Record<string, string> = {}
  const books = catalogue.books.filter(book => book.discoveryAvailable !== false).map(view => {
    const source = registry.find(book => book.id === view.id)
    if (!source) throw new Error('Native catalogue book has no registry: ' + view.id)
    const editions = source.editions.filter(edition => edition.language !== 'da'
      && view.editions.some(item => item.key === edition.key && item.discoveryAvailable !== false && item.availability.chapterText))
    const files: NativeBookFile[] = []
    const add = (relative: string) => {
      const file = path.join(publicRoot, relative)
      if (!fs.existsSync(file)) return
      if (fs.statSync(file).isDirectory()) {
        for (const name of fs.readdirSync(file).sort()) add(relative + '/' + name)
        return
      }
      const data = fs.readFileSync(file)
      files.push({ path: '/' + relative, sha256: createHash('sha256').update(data).digest('hex'), bytes: data.length })
    }
    for (const edition of editions) {
      add('data/editions/' + view.id + '-' + edition.key + '.json')
      add('data/editions-chapters/' + view.id + '-' + edition.key)
    }
    // Optional sidecars are copied unchanged. They never select a held edition.
    for (const name of fs.readdirSync(path.join(publicRoot, 'data/editions')).sort()) {
      if (name === view.id + '-threads.json' || name === view.id + '-lines.json') add('data/editions/' + name)
    }
    add('data/characters/' + view.id + '.v1.json')
    add('data/onboarding/' + view.id + '.json')
    add('covers/v2/' + view.id + '.webp')
    const preface = prefaces.get(view.id)
    if (preface) files.push({ path: '/lab/prefaces/' + view.id + '.json', sha256: createHash('sha256').update(preface).digest('hex'), bytes: Buffer.byteLength(preface) })
    if (!editions.length || editions.some(edition => !files.some(file => file.path === '/data/editions/' + view.id + '-' + edition.key + '.json'))) {
      throw new Error('Native download is missing a published edition: ' + view.id)
    }
    files.sort((a, b) => a.path.localeCompare(b.path))
    const book = { ...source, editions }
    const manifest = { schema: 1, book, view: { ...view, editions: view.editions.filter(edition => editions.some(item => item.key === edition.key)) }, files }
    const text = JSON.stringify(manifest)
    const revision = createHash('sha256').update(text).digest('hex')
    const entry = { id: book.id, revision, bytes: files.reduce((total, file) => total + file.bytes, 0), manifest: '/native-books/' + book.id + '-' + revision + '.json', book, view: manifest.view }
    manifests[entry.manifest.slice(1)] = text
    return entry
  })
  return { index: JSON.stringify({ schema: 1, catalogue, books }), manifests }
}
