import { projectEditionCoordinate, type CoordinateMigration } from '../data/editionCoordinateMigration'
import type { LabBookPlace, LabPositionState } from './labPosition'

/** Called only with the edition actually selected for the reader. Never guess
 * Danish or another source from an old bookmark lacking an edition key.
 */
export function migrateLabBookPlace(
  place: LabBookPlace,
  migration: CoordinateMigration,
  fallbackEditionKey?: string,
): LabBookPlace {
  if (place.bookId !== migration.bookId) return place
  const editionKey = place.primaryEditionKey || fallbackEditionKey
  if (!editionKey || !migration.editions[editionKey]) return place
  const projected = projectEditionCoordinate(migration, editionKey, {
    chapterNumber: place.sequentialChapter,
    paragraphIndex: place.paragraphIndex,
    offset: place.wordIndex,
    contentRevision: place.contentRevision,
  }, 'words')
  if (projected.status === 'unresolved' || projected.point.contentRevision === place.contentRevision) return place
  // Page numbers depend on font/layout and become stale when paragraphs move.
  const { pageIndex: _oldPage, ...saved } = place
  return {
    ...saved,
    primaryEditionKey: editionKey,
    chapterNumber: projected.point.chapterNumber,
    sequentialChapter: projected.point.chapterNumber,
    paragraphIndex: projected.point.paragraphIndex,
    wordIndex: projected.point.offset,
    contentRevision: projected.point.contentRevision,
    contentMigrationStatus: projected.status,
    contentRecovery: place.contentRecovery || {
      editionKey,
      contentRevision: migration.editions[editionKey].beforeSha256,
      chapterNumber: place.sequentialChapter,
      paragraphIndex: place.paragraphIndex,
      wordIndex: place.wordIndex,
    },
  }
}

/** Apply before comparing timestamps: a coordinate repair is not new reading
 * activity and must not change the account owner, resume pointer or clocks.
 */
export function migrateLabPositionCoordinates(
  state: LabPositionState,
  migrations: readonly CoordinateMigration[],
): LabPositionState {
  const migrate = (place: LabBookPlace) => migrations.reduce((p,m) => migrateLabBookPlace(p,m), place)
  let changed = false
  const places = (values: Record<string, LabBookPlace>) => Object.fromEntries(Object.entries(values).map(([id,place]) => {
    const next = migrate(place)
    changed ||= next !== place
    return [id,next]
  }))
  const books = places(state.books)
  const recentChapters = state.recentChapters && places(state.recentChapters)
  return changed ? { ...state, books, ...(recentChapters ? {recentChapters} : {}) } : state
}
