import manifest from './publisherPermissions.json'

/** An in-copyright book Tinct publishes by the publisher's permission. */
export interface PublisherPermission {
  publisher: string
  /** The book's own copyright line, shown with the book. */
  rights: string
}

const PERMISSIONS: Readonly<Record<string, PublisherPermission>> = manifest.books

/** The permission record for a book, or null for a public-domain book. */
export function publisherPermission(bookId: string): PublisherPermission | null {
  return PERMISSIONS[bookId] ?? null
}
