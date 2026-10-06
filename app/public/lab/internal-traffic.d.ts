// Types for internal-traffic.js (imported by the reader bundle through src/utils/internalTraffic.ts).
type KeyStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
export const INTERNAL_KEY: string
export const INTERNAL_PARAM: string
export const CHECK_HEADER: string
export function isInternal(storage?: KeyStore): boolean
export function setInternal(enabled: boolean, storage?: KeyStore): void
export function internalHeaders(storage?: KeyStore): Record<string, string>
export function applyInternalFromUrl(win?: Window): boolean
export function syncInternalBadge(doc: Document | undefined, enabled: boolean): HTMLElement | null
export function initInternalTraffic(win?: Window): boolean
