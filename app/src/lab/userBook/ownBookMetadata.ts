import { listAccountBooks, ownBookToken, type AccountBook } from './ownAccount'
import type { LoadedUserBook } from './userBookStore'
import { readOwnedBookMetadata, userBookOwner } from './userBookStore'

/** Mutable account labels never change source chapters, conversion or saved anchors. */
export function withOwnBookMetadata(book: LoadedUserBook, record: Pick<AccountBook, 'title' | 'author' | 'name' | 'metadataRev'> | null): LoadedUserBook {
  if (!record?.metadataRev || record.metadataRev <= 0) return book
  const title = record.title || record.name.replace(/\.(epub|pdf)$/i, '') || book.edition.title
  return { ...book, edition: { ...book.edition, title, author: record.author } }
}

/** Bounded best-effort metadata from the current owner only. The file's local edition remains the source of text. */
export async function currentOwnBookMetadata(hex: string, owner: string, timeoutMs = 700): Promise<Pick<AccountBook, 'id' | 'type' | 'title' | 'author' | 'name' | 'metadataRev'> | null> {
  if (userBookOwner() !== owner) return null
  const local = readOwnedBookMetadata(hex, owner).catch(() => null)
  const request = (async () => {
    const token = await ownBookToken()
    if (!token || userBookOwner() !== owner) return null
    const list = await listAccountBooks(token)
    if (userBookOwner() !== owner) return null
    return list?.find(book => book.sha256.slice(0, 24) === hex) ?? null
  })().catch(() => null)
  let deadline: ReturnType<typeof setTimeout> | undefined
  let localDeadline: ReturnType<typeof setTimeout> | undefined
  try {
    const result = await Promise.race([
      request,
      new Promise<null>(resolve => { deadline = setTimeout(() => resolve(null), timeoutMs) }),
      new Promise<Awaited<typeof local>>(resolve => {
        localDeadline = setTimeout(() => {
          void local.then(record => { if (record) resolve(record) })
        }, Math.min(700, timeoutMs))
      }),
    ])
    if (userBookOwner() !== owner) return null
    if (result) return result
    const record = await local
    return userBookOwner() === owner ? record : null
  } finally {
    clearTimeout(deadline)
    clearTimeout(localDeadline)
  }
}
