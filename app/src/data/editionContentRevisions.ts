import symposiumMap from './symposiumCoordinateMap.json'
import type { CoordinateMigration } from './editionCoordinateMigration'

/**
 * Editions whose paragraph structure changed in an accepted release, and the
 * published coordinate maps that carry saved reader data across the change.
 *
 * Every place and highlight written for these editions is stamped with the
 * current `after` hash, so migration runs once and is idempotent. A record
 * stamped `before`, or unstamped and older than `releasedAt`, was written
 * against the old text and is moved by the map; an unstamped record at or
 * after `releasedAt` came from a reader already showing the new text.
 *
 * The maps are fetched only by readers who hold data that needs moving.
 */
export interface EditionRevision { before: string; after: string }
export interface ContentRelease {
  revision: string
  releasedAt: number
  editions: Record<string, EditionRevision>
}

export const CONTENT_RELEASES: Record<string, ContentRelease> = {
  symposium: {
  "revision": "symposium-completeness-2026-09-25.1",
  "releasedAt": 1790362800000,
  "editions": {
    "original-en": {
      "before": "e2943777fd54eaaa0888076c5c03a9104bc1b1ffa681a5362ab114e327f797c0",
      "after": "3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6"
    },
    "modern-en": {
      "before": "7816d1eb6ac9cc6d178c4c123bbeb8ad6daced1f7d7fc8c036f2bded3b8fcce8",
      "after": "1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f"
    }
  }
},
  'jane-eyre': {
    revision: 'structure-2026-09-24.1',
    releasedAt: Date.parse('2026-09-25T12:00:00Z'),
    editions: {
      'original-en': {
        before: '055aad5e04c0c9dbb32969c57cbcc54aa5e00c012256cd3debbce0577cbe5f96',
        after: 'd05d18103f439a8267be407ac8e6d44068236c262321f386174050bbf2109257',
      },
      'modern-en': {
        before: 'bbfe4c30163ecf07291e2fa5faef69d1e57348644afe2ab0dfc96edff3cecad0',
        after: '0488dac58943afde5be0b7e1105206429e2fc0a887462ff753057081e096dff6',
      },
    },
  },
  // Text-only repair: paragraphs unchanged, wording new (Tinct Modern English rewrite).
  confessions: {
    revision: 'text-2026-09-25.1',
    releasedAt: Date.parse('2026-09-25T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '420b17153b6cb46f6a74e41bb633dcbc88099975720dac27c6bfb0bf6be51b4e',
        after: '949e4f77fd317601cc39dc701cfbc3f5f82a5b5a842c34e93c9a6328ef78add7',
      },
    },
  },
  'pride-and-prejudice': {
    revision: 'structure-2026-09-24.1',
    releasedAt: Date.parse('2026-09-25T12:00:00Z'),
    editions: {
      'original-en': {
        before: '5a44024668550ab8cdae47579bd798b5b60c8e3e1401043b6d9f8777081760c6',
        after: '6d968f00645655554e44156a16a2713a3c1f60e74cb533d56aa5231847ca183c',
      },
      'modern-en': {
        before: 'd914bb2dc33dfb525d7c21b142cc1ae4ea85dcfdd84378c2a839c90d90c250e1',
        after: '6c80aa42dd44707774a6049d2a17bbfaf61806751e6f0cf5536b8837dabfc463',
      },
    },
  },
}

/** The hash a new place or highlight in this edition is stamped with. */
export function currentContentRevision(bookId: string | undefined, editionKey: string | undefined): string | undefined {
  if (!bookId || !editionKey) return undefined
  return CONTENT_RELEASES[bookId]?.editions[editionKey]?.after
}

/** Was this record written against text an accepted release has since restructured? */
export function writtenBeforeRelease(
  bookId: string | undefined,
  editionKey: string | undefined,
  contentRevision: string | undefined,
  writtenAt: number | undefined,
): boolean {
  if (!bookId || !editionKey) return false
  const release = CONTENT_RELEASES[bookId]
  const edition = release?.editions[editionKey]
  if (!edition) return false
  if (contentRevision) return contentRevision === edition.before
  return typeof writtenAt === 'number' && Number.isFinite(writtenAt) && writtenAt < release.releasedAt
}

export type MigrationKind = 'positions' | 'highlights'

const loaded: Record<MigrationKind, Map<string, CoordinateMigration>> = { positions: new Map(), highlights: new Map() }
// Symposium's map is bundled: migration must precede structure validation even offline.
for (const kind of ['positions', 'highlights'] as const) loaded[kind].set('symposium', symposiumMap as unknown as CoordinateMigration)
const pending = new Map<string, Promise<CoordinateMigration | null>>()

/** Maps already in memory, for the synchronous read paths. */
export function loadedCoordinateMigration(kind: MigrationKind, bookId: string): CoordinateMigration | undefined {
  return loaded[kind].get(bookId)
}

function valid(data: unknown, bookId: string): data is CoordinateMigration {
  const release = CONTENT_RELEASES[bookId]
  const map = data as CoordinateMigration | null
  return !!map && map.bookId === bookId && map.revision === release.revision
    && Object.entries(release.editions).every(([key, edition]) => (
      map.editions?.[key]?.beforeSha256 === edition.before && map.editions[key].afterSha256 === edition.after
    ))
}

/** Fetch a published map once. A failure answers null and may be retried later. */
export function loadCoordinateMigration(kind: MigrationKind, bookId: string): Promise<CoordinateMigration | null> {
  const release = CONTENT_RELEASES[bookId]
  if (!release) return Promise.resolve(null)
  const ready = loaded[kind].get(bookId)
  if (ready) return Promise.resolve(ready)
  const key = `${kind}:${bookId}`
  const inFlight = pending.get(key)
  if (inFlight) return inFlight
  const request = fetch(`/data/edition-migrations/${bookId}.${kind}.json?v=${release.revision}`)
    .then(response => (response.ok ? response.json() : null))
    .then((data: unknown) => {
      if (!valid(data, bookId)) return null
      loaded[kind].set(bookId, data)
      return data
    })
    .catch(() => null)
    .finally(() => { pending.delete(key) })
  pending.set(key, request)
  return request
}

/** Test seam. */
export function __setLoadedCoordinateMigration(kind: MigrationKind, migration: CoordinateMigration | null, bookId?: string): void {
  if (migration) loaded[kind].set(migration.bookId, migration)
  else if (bookId) loaded[kind].delete(bookId)
  else loaded[kind].clear()
}
