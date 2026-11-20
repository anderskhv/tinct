/** Private upload visibility uses the same owner-only shelf records as catalogue
 * visibility. Only the opaque book id and choice/time are synced, never its text.
 * Local hide stamps remain the rendering adapter for both PDF and EPUB readers. */
import { loadSavedBooks, readShelfChange, setSavedBook } from '../../libraryTwoSaved'
import { hideOwnFromReadingTable, ownSavedAt, ownShelfSavedAt, OWN_TABLE_HIDDEN_PREFIX, OWN_SHELF_UNSAVED_PREFIX } from './ownShelf'
import { userBookOwner } from './userBookStore'

export async function syncOwnShelfMembership(owner: string, localHexes: readonly string[], accountHexes: readonly string[]): Promise<void> {
  const active = () => userBookOwner() === owner
  if (!active()) return
  await loadSavedBooks({ expectedOwner: owner })
  if (!active()) return
  // Migrate only records already verified to belong to this owner. A newer
  // account choice wins; never infer deletion from a missing cloud file.
  for (const hex of localHexes) {
    const id = `userbook-${hex}`, at = ownSavedAt(hex)
    if (at && at > (readShelfChange(owner, id)?.at ?? 0)) {
      if (!active()) return
      await setSavedBook(id, ownShelfSavedAt(hex) !== null, { tableHidden: true, at, expectedOwner: owner })
    }
  }
  if (!active()) return
  for (const hex of new Set([...localHexes, ...accountHexes])) {
    const choice = readShelfChange(owner, `userbook-${hex}`)
    if (!choice || choice.at < (ownSavedAt(hex) ?? 0)) continue
    if (!choice.saved || choice.tableHidden) hideOwnFromReadingTable(hex, choice.at, { saved: choice.saved })
    else {
      localStorage.removeItem(OWN_TABLE_HIDDEN_PREFIX + hex)
      localStorage.removeItem(OWN_SHELF_UNSAVED_PREFIX + hex)
    }
  }
}
