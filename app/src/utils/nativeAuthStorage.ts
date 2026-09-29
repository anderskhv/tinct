import { registerPlugin } from '@capacitor/core'
interface NativeAuthStore {
  get(input: { key: string }): Promise<{ found: boolean; value?: string | null }>
  set(input: { key: string; value: string }): Promise<void>
  remove(input: { key: string }): Promise<void>
}
const native = registerPlugin<NativeAuthStore>('NativeAuthStorage')
/** Native sign-in must finish writing before Android opens the browser. */
export function createNativeAuthStorage(store: NativeAuthStore, legacy: Pick<Storage, 'getItem' | 'removeItem'>) {
  return {
    async getItem(key: string): Promise<string | null> {
      const saved = await store.get({ key })
      if (saved.found) {
        legacy.removeItem(key)
        return saved.value ?? null
      }
      const previous = legacy.getItem(key)
      if (previous !== null) {
        await store.set({ key, value: previous })
        legacy.removeItem(key)
      }
      return previous
    },
    async setItem(key: string, value: string): Promise<void> {
      await store.set({ key, value })
      legacy.removeItem(key)
    },
    async removeItem(key: string): Promise<void> {
      // A durable tombstone prevents an older WebView mirror resurrecting a session.
      await store.remove({ key })
      legacy.removeItem(key)
    },
  }
}
export const nativeAuthStorage = createNativeAuthStorage(native, {
  getItem: key => localStorage.getItem(key),
  removeItem: key => localStorage.removeItem(key),
})
