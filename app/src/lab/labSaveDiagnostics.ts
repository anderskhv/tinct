/** User-requested clipboard diagnostics only: never return keys, values or exception text. */
export function answerSaveDetails(reason: string | null, accountSaved: boolean): string {
  const known = ['book-mismatch', 'invalid-card', 'stale-card', 'private-storage', 'quota', 'access', 'write', 'readback']
  const lines = [
    `Tinct answer save: ${reason && known.includes(reason) ? reason : 'unknown'}`,
    `Account save confirmed: ${accountSaved ? 'yes' : 'no'}`,
  ]
  try {
    const store = window.localStorage
    const groups = { history: { entries: 0, bytes: 0 }, tinct: { entries: 0, bytes: 0 }, other: { entries: 0, bytes: 0 } }
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i)
      if (key === null) continue
      const value = store.getItem(key)
      if (value === null) continue
      const group = key.startsWith('tinct:chat-history:') ? groups.history
        : key.startsWith('tinct:') || key.startsWith('tinct-') ? groups.tinct : groups.other
      group.entries++
      group.bytes += 2 * (key.length + value.length)
    }
    lines.push('LocalStorage snapshot (estimated UTF-16 bytes, including keys):')
    for (const [label, group] of [['Chat history', groups.history], ['Other Tinct data', groups.tinct], ['Other site data', groups.other]] as const) {
      lines.push(`${label}: ${group.entries} entries; ${group.bytes} bytes`)
    }
    lines.push('These are text-size estimates, not browser quota or free space. IndexedDB, downloaded files and cloud storage are not measured.')
  } catch {
    // A denied getter or interrupted scan must not copy partial measurements or error messages.
    lines.push('LocalStorage snapshot: unavailable')
  }
  return lines.join('\n')
}
