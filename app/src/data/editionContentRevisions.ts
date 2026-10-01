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
  'aristotle-politics': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '8ce0b1f6570584b4ba8168b25cb6ae365afcd0cc157cc4a0f15cd2d3efc62224',
        after: '1f26505ff554a0d89eed947bbaae9fa2c3c2ace1594213f36312939e85413e04',
      },
    },
  },
  'beyond-good-and-evil': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '5b14eaa83a4b695afc10e74b203001ac33490f732a1fb42c141749687859d08a',
        after: '102bb0bba43b994d779c745ff7881dfa7e96408696108cb780ea14b70d09c34f',
      },
    },
  },
  'magna-carta': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: 'cf7d388da295fff52af25f55d6dd692644b4ca96b521db4e9dc2525deaa5f586',
        after: '9fc3a296b172b3d144fb95c673b6627407520b9036b7cd00d9cd894ff65e198c',
      },
    },
  },
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
  macbeth: {
    revision: 'macbeth-completeness-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'original-en': {
        before: '2650bcc666428a808584fd6f99534f71474a4e99a085c7ae6b87234e24e30608',
        after: '9df987bdf1a1a8c50d44e0c4c2ab6a18e2580f47114810232e8022eecca207c6',
      },
      'modern-en': {
        before: '0c85273086804fdd02abee81842de15338b61a2288bb26805e9b2f2d505d02f1',
        after: 'c597a985ce096a923b03a5072e52f6d8bd5bbc44c0c11fd924ff4e0019351bec',
      },
    },
  },
  'as-you-like-it': {
    revision: 'as-you-like-it-completeness-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'original-en': {
        before: '2c04249b4ea528612cfa8f41031ed7a78fff2e453f15fbccf7d55f03905ce179',
        after: '8ab533a42958f570a59d12e686793d4397ff0efe6c9b061acfb468d645254358',
      },
      'modern-en': {
        before: 'df270fa2b605950982107d654d395fe0eaa0226208f9a5b185d06d7da2b5f8e4',
        after: '5a4e95bbf50e3affb4581cc5acd53d19322642e81894342bc56bd03fc7f75e48',
      },
    },
  },
  'faust-part-1': {
    revision: 'faust-part-1-replacement-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'original-en': {
        before: 'bff236838e6e5ee6baeb7afd16c6b1c1b2872f87605f21e79e4cd5198a997395',
        after: 'e36200c60fe9e763555461ea2d65f9772058aa737635688e7b79ad4010bee79d',
      },
      'modern-en': {
        before: '9e66da5b45267bfb3cae70905897d9f9c1397bd1d1c8b080bf325cda0046d28b',
        after: '7c7b27df8c77e069e8641b8154f67f26d57afab36d73072865d061998d201dfe',
      },
      'original-de': {
        before: 'edb0081f759c0eb256ed303711932af743784a87f1cc6716dab7d15365bc83e5',
        after: '3e69f81d08d33c8b3aae0d7c1c7b05757f6944317ba68ff754a0f2aaf4b2f66c',
      },
    },
  },
  jerusalem: {
    revision: 'jerusalem-completeness-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'original-en': {
        before: '747b53bedd58d9ba65877185247a8545dac4bddcd1e8219cf5315da00cdac47c',
        after: '20d0ed3ecce5e4b440fec2e4373b337222c6a734f37f9cf769d94cecc248c48a',
      },
      'modern-en': {
        before: '6cdbf3a5904a26d5edffc0ad45325f29af16e8cd6bc0a959f92450c3b33c00ee',
        after: '47c0c1c78ef4b342c793f7ffd07dabbbe96334c67d7ca85dbfa9aafdf9f521b0',
      },
    },
  },
  'vindication-rights-of-woman': {
    revision: 'text-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'modern-en': {
        before: '4e7e6143670a4ca29fa6f004587578e56102ac7b2f1b00814ddefb303084ba63',
        after: '6a398f5b8be7c85ad6fafa8d1e414674bcd7f193daf129844b83ada8f9cb056a',
      },
    },
  },
  'second-treatise': {
    revision: 'text-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'modern-en': {
        before: '177b364414c437af89fe5d09b8922d71ff772ccf7da6ec2e64c710ed061269bf',
        after: 'f6799fa25a28d93cec6029b76e929c788c4d123d02450b517fd128c3a73e6dd2',
      },
    },
  },
  'moby-dick': {
    revision: 'text-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'modern-en': {
        before: '2ab04dd727bbe5804b7acf1d05f578cfed5aef17c08d7d72b6db9101f8c1763c',
        after: '1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c',
      },
    },
  },
  'fear-and-trembling': {
    revision: 'fear-and-trembling-structure-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T20:25:00Z'),
    editions: {
      'modern-en': {
        before: '152776f19e1b707b610d2bee033d6984ed0f1e26826b314e2d0541d9c0b49132',
        after: 'c48a325258381311e61ff70a2c9a3972e5e75cc1dac2b9b357e7022f85111fb8',
      },
      'original-da': {
        before: 'c61144bbf51a930748799d4ff30ff48031ee12452ada5eb5391f684e8961d63a',
        after: '290fec6aa962cce75058c7c0286cc9a4c9aca00066be5cb535d528b7af2b8934',
      },
    },
  },
  'communist-manifesto': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '909c7496f66b1314666a2053ca056d1f2defc2cdf50ad44719208b38c153fc62',
        after: '5cccffe12e998383856f3d80ba64eddfb5371bbfe0b01cf04d0df503fe6760eb',
      },
    },
  },
  'kant-groundwork': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '2ac2fce500388299d084ecf5b8e3be84c6f06bfc3747aa7262a4bacc7459d84d',
        after: '57c821d775792c3950f94a6d394e0d556310b21422e2c3bb2e6b63e77b249a9d',
      },
    },
  },
  'notes-from-underground': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '8df3e74890b26ce3febb108540f3a7a32fd3afdc93b1d047cbe6b053793a0449',
        after: '00023ab89ab477b3b50ae72181108521bbd4992fac9948ae083a17b3a079dff5',
      },
    },
  },
  'heart-of-darkness': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '169c288c26f0c8c07be6d181855123cd982023a0b780262576944f5833afa435',
        after: 'abcf3c20a7d0b42c15ad3196032cea5a14a113f8cecea35c70d5af8023d4aebf',
      },
    },
  },
  'jungle-book': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '821357c6bb7dc016b819f89fd9f857ffcc78b057f5718cf0e66068b3f249c640',
        after: '9eaf20289bbc99281feeae0310ffb4f434c6808c6943b986df07722dcd9debd0',
      },
    },
  },
  'hume-enquiry': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '8b9b306e32e35f9047f4f5247d07562b601024e014d9e93a373e6104204d3290',
        after: 'cd8a4daab2bed38c816b79ca74c7d464bbcce9bcc2ef8e1a9ee1f374f0977633',
      },
    },
  },
  'around-the-world-80-days': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '13b90c0526762af96d550fa512941dff043473c31c55efa877bb9465770745af',
        after: '604ac1abf6b11bb2e05b11f3df1e526355ad8df8e40768d17e6355ca1788defb',
      },
    },
  },
  'a-little-princess': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '5e359e936c37e8e79ea7738597da244b7356369558e59ada48fc0f32fde8a020',
        after: 'c47540c17dd567bafe0934392b31a8d236e15e809244e419080e8abf3c4fa1b6',
      },
    },
  },
  'niels-lyhne': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '88dc925851aae72fa3602b26917ec696e13a8499117c98298e71c6909f87521a',
        after: '66fe341fd5d74b6d0fbdba1a27b5055ae80175d3615e30cff03a3a85ea1e6c38',
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
  // Every new Symposium write is stamped. An unstamped English record can
  // still arrive from an old offline client after publication; retain its repair.
  if (bookId === 'symposium') return true
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
