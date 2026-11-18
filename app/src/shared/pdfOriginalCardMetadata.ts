/** Optional metadata in the existing owner/file-qualified PDF card journal. */
export function isPdfSourceAnchor(value: unknown): value is { page: number; frac: number } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const anchor = value as Record<string, unknown>
  return Object.keys(anchor).every(key => key === 'page' || key === 'frac')
    && Number.isSafeInteger(anchor.page) && (anchor.page as number) >= 1 && (anchor.page as number) <= 5000
    && typeof anchor.frac === 'number' && Number.isFinite(anchor.frac) && anchor.frac >= 0 && anchor.frac <= 1
}
export function isPdfFreeNoteData(value: unknown): value is { action: 'note'; free: { y: number } } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const data = value as Record<string, unknown>, free = data.free as Record<string, unknown> | undefined
  return data.action === 'note' && Object.keys(data).every(key => key === 'action' || key === 'free')
    && !!free && typeof free === 'object' && !Array.isArray(free) && Object.keys(free).every(key => key === 'y')
    && typeof free.y === 'number' && Number.isFinite(free.y) && free.y >= 0 && free.y <= 1
}
