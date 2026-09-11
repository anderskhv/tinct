// API base URL — relative for web, absolute for Capacitor (Android/iOS)
// In Capacitor, the app runs from file:// or capacitor:// so relative /api/ calls
// would go to the local Capacitor server, not the production Cloudflare Worker.
import { isNativeCapacitor } from './nativePlatform'

export const API_BASE = isNativeCapacitor()
  ? 'https://tinct.ahvelplund.workers.dev'
  : ''

/** Build a full API URL — works in both web and Capacitor */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}
