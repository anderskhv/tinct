/** Keep the normal shared auth key: library boot and account cards read it too. */
export function isStorageQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const value = error as { name?: string; originalError?: unknown }
  return value.name === 'QuotaExceededError' || value.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    || (value.originalError !== error && !!value.originalError && isStorageQuotaError(value.originalError))
}

// These are optional, reconstructible library previews. Never evict source
// files, notes, highlights, chats, position, pending sync, or account identity.
function disposable(key: string): boolean {
  return key.startsWith('tinct:library-2-own-thumb:') || key.startsWith('tinct:library-2-table:')
}

export function createBrowserAuthStorage(storage: Storage) {
  return {
    getItem: (key: string) => storage.getItem(key),
    removeItem: (key: string) => storage.removeItem(key),
    setItem(key: string, value: string) {
      try { storage.setItem(key, value); return } catch (error) {
        if (!isStorageQuotaError(error)) throw error
        const previews: string[] = []
        for (let i = 0; i < storage.length; i++) {
          const candidate = storage.key(i)
          if (candidate && disposable(candidate)) previews.push(candidate)
        }
        // Free only as much disposable space as this auth write needs.
        for (const preview of previews) {
          storage.removeItem(preview)
          try { storage.setItem(key, value); return } catch (retry) {
            if (!isStorageQuotaError(retry)) throw retry
          }
        }
        throw error
      }
    },
  }
}

export function signInErrorMessage(error: unknown): string {
  if (isStorageQuotaError(error)) return 'This browser has no space to save your sign-in. Your notes have not been removed. Try a private tab or another browser for now.'
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
