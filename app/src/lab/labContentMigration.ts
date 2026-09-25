import { loadCoordinateMigration, loadedCoordinateMigration, writtenBeforeRelease } from '../data/editionContentRevisions'
import { migrateLabBookPlace } from './labEditionMigration'
import type { LabBookPlace, LabPositionState } from './labPosition'

/**
 * Saved reading places across an accepted structural edition release
 * (editionContentRevisions.ts). Every read of a position record goes through
 * `parseLabPositionState`, which moves each old place with a map already in
 * memory; the async entry points (app start, cloud fetch, library loads) call
 * `prepareLabPositionMigrations` first so the map is there. Moving a place
 * keeps its clocks: it is a repair, not new reading.
 */
export function placeNeedsMigration(place: LabBookPlace): boolean {
  return writtenBeforeRelease(place.bookId, place.primaryEditionKey, place.contentRevision, place.updatedAt)
}

function places(state: LabPositionState): LabBookPlace[] {
  return [...Object.values(state.books), ...Object.values(state.recentChapters ?? {})]
}

export function labPositionMigrationBooks(state: LabPositionState): string[] {
  return [...new Set(places(state).filter(placeNeedsMigration).map(place => place.bookId))]
}

export function migrateLoadedLabPlaces(state: LabPositionState): LabPositionState {
  let changed = false
  const move = (values: Record<string, LabBookPlace>, recent = false) => Object.fromEntries(Object.entries(values).map(([key, place]) => {
    if (!placeNeedsMigration(place)) return [key, place]
    const migration = loadedCoordinateMigration('positions', place.bookId)
    const next = migration ? migrateLabBookPlace(place, migration) : place
    changed ||= next !== place
    return [recent ? `${next.bookId}:${next.sequentialChapter}` : key, next]
  }))
  const books = move(state.books)
  const recentChapters = state.recentChapters && move(state.recentChapters, true)
  return changed ? { ...state, books, ...(recentChapters ? { recentChapters } : {}) } : state
}

/** Load the maps this record needs; answers the record with its places moved. */
export async function prepareLabPositionMigrations(state: LabPositionState): Promise<LabPositionState> {
  const books = labPositionMigrationBooks(state)
  if (!books.length) return state
  await Promise.all(books.map(bookId => loadCoordinateMigration('positions', bookId)))
  return migrateLoadedLabPlaces(state)
}
