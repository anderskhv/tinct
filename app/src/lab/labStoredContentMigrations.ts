import { labPositionMigrationBooks } from './labContentMigration'
import { highlightNeedsMigration, migrateStoredLabHighlights } from './labHighlightContentMigration'
import { readLabHighlights } from './labHighlights'
import { prepareLabPositionLocal, readLabPositionLocal } from './labPositionStore'

/**
 * The work to do before the reader starts, or null when this device holds no
 * place or highlight an accepted structural edition release has to move.
 */
export function storedContentMigrations(): Promise<unknown> | null {
  try {
    const places = labPositionMigrationBooks(readLabPositionLocal()).length > 0
    const highlights = readLabHighlights().some(highlightNeedsMigration)
    if (!places && !highlights) return null
    return Promise.all([
      places ? prepareLabPositionLocal() : null,
      highlights ? migrateStoredLabHighlights() : null,
    ]).catch(() => null)
  } catch {
    return null
  }
}
