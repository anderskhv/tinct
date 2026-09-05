import { useEffect, useRef, useState } from 'react'
import { shouldMigrateLocalToCloud } from './useReadingPosition.guards'
import { clearLocalUserData, localStorageProvider, setAnonymousMode, setStorageProvider } from '../services/storage'
import { commitReadingMemoryAdoption, stageReadingMemoryAdoption } from '../readingMemory/adoption'
import { createSupabaseReadingMemoryCloud } from '../readingMemory/cloud'
import { deviceReadingMemoryQueue } from '../readingMemory/deviceStore'
import { drainReadingMemoryQueue } from '../readingMemory/queue'
import { SupabaseStorageProvider } from '../services/supabaseStorage'
import type { ReadingPosition } from '../types'

const SUPABASE_CRITICAL_INIT_TIMEOUT_MS = 1500

type StorageBootstrapUser = { id: string } | null | undefined

export function useStorageBootstrap(args: {
  user: StorageBootstrapUser
  authLoading: boolean
  likelyAuthenticated: boolean
}) {
  const { user, authLoading, likelyAuthenticated } = args
  // Start false to prevent hooks from writing defaults before cloud data loads.
  const [storageReady, setStorageReady] = useState(false)
  // Signed-in startup has a second gate after storage is available: the app
  // must apply the cloud/local winning position before readers/writers see old
  // in-memory chapter state.
  const [cloudRestoreSettled, setCloudRestoreSettled] = useState(false)
  // Bumped each time Supabase init populates the cache. Restore effects watch
  // this so they can re-run if cloud init lands after the timeout fallback.
  const [supabaseInitTick, setSupabaseInitTick] = useState(0)
  const supabaseProviderRef = useRef<SupabaseStorageProvider | null>(null)
  const localFirstFromCacheRef = useRef(false)

  useEffect(() => {
    const markHidden = () => {
      try { localStorage.setItem('tinct:last-hidden-at', String(Date.now())) } catch { /* ignore */ }
    }
    const onVisibility = () => { if (document.visibilityState === 'hidden') markHidden() }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', markHidden)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', markHidden)
    }
  }, [])

  useEffect(() => {
    // Wait for auth to resolve before deciding on storage provider.
    if (authLoading) return
    if (user) {
      setStorageReady(false)
      setCloudRestoreSettled(false)
      // Signed-in: turn off anonymous restrictions so the
      // SupabaseStorageProvider's localStorage cache mirroring works for all keys.
      setAnonymousMode(false)
      const provider = new SupabaseStorageProvider(user.id)
      const localData = localStorageProvider.getAllData()
      const hasLocalMirror = Object.keys(localData).some(key => key === 'tinct-current-book' || key.startsWith('position:'))
      const LAST_USER_KEY = 'tinct:last-user-id'
      const lastUserId = localStorage.getItem(LAST_USER_KEY)
      const isUserSwitch = lastUserId !== null && lastUserId !== user.id
      localFirstFromCacheRef.current = hasLocalMirror && !isUserSwitch
      // Reading memory recorded while signed out (owner: null) is adopted by
      // the account signing in. Stage it BEFORE the user-switch wipe below,
      // commit it right after; another account's sessions are never adopted.
      const readingMemoryAdoption = stageReadingMemoryAdoption(user.id)
      if (isUserSwitch) {
        clearLocalUserData()
      }
      commitReadingMemoryAdoption(readingMemoryAdoption)
      const readingMemoryCloud = createSupabaseReadingMemoryCloud(user.id)
      if (readingMemoryCloud) void drainReadingMemoryQueue(deviceReadingMemoryQueue(), readingMemoryCloud).catch(() => {})
      try { localStorage.setItem(LAST_USER_KEY, user.id) } catch { /* ignore */ }
      let cancelled = false
      let providerInstalled = false
      const installProvider = () => {
        if (cancelled || providerInstalled) return
        providerInstalled = true
        setStorageProvider(provider)
        supabaseProviderRef.current = provider
        // Start real-time sync for cross-device updates. This is best-effort:
        // failure must not prevent the storage provider from being installed.
        try {
          provider.subscribe()
        } catch (e) {
          console.warn('[App] Supabase realtime subscribe failed (continuing without live sync):', e)
        }
        setStorageReady(true)
      }
      if (localFirstFromCacheRef.current) {
        if (typeof window !== 'undefined') {
          const w = window as Window & { __tinctLocalFirstDebug?: Array<Record<string, unknown>> }
          w.__tinctLocalFirstDebug = w.__tinctLocalFirstDebug || []
          w.__tinctLocalFirstDebug.push({ at: Date.now(), stage: 'local-cache-present-awaiting-critical-cloud', keys: Object.keys(localData).length })
          if (w.__tinctLocalFirstDebug.length > 40) w.__tinctLocalFirstDebug.shift()
        }
      }
      // Timeout: if critical restore takes too long, render from the signed-in
      // local mirror instead of leaving the app on the loading shell. When
      // Supabase eventually resolves, supabaseInitTick re-runs restore with the
      // real cloud cache and corrects the reader before future writes. Normal
      // online startup waits for initCritical so cross-device resume does not
      // first paint at a stale local position and then jump later.
      const initTimeout = setTimeout(() => {
        console.warn('[App] Supabase critical init timeout - rendering from local mirror while cloud restore continues')
        installProvider()
        setCloudRestoreSettled(true)
      }, SUPABASE_CRITICAL_INIT_TIMEOUT_MS)
      provider.initCritical().then(() => {
        clearTimeout(initTimeout)
        installProvider()
        setSupabaseInitTick(t => t + 1)
        // Fill the broader Phase A cache after the reader has enough data to
        // restore accurately. Migration waits for this fuller query so we do
        // not mistake "not loaded by critical restore" for "missing in cloud".
        provider.init().then(() => {
          if (!isUserSwitch) {
            // Same user returning OR first-ever sign-in (anonymous -> account):
            // migrate localStorage entries up to cloud where cloud is empty.
            // For position keys, use shouldMigrateLocalToCloud which adds the
            // anonymous-default-state guard.
            for (const [key, value] of Object.entries(localData)) {
              // Reading memory has its own versioned merge path (queue +
              // commit_user_data); its write queue must not become a row.
              if (key.startsWith('reading-memory:')) continue
              const cloudValue = provider.get(key)
              if (!cloudValue) {
                provider.set(key, value)
              } else if (key.startsWith('position:')) {
                if (shouldMigrateLocalToCloud({
                  local: value as ReadingPosition,
                  cloud: cloudValue as ReadingPosition,
                })) {
                  provider.set(key, value)
                }
              }
            }
          }
          setSupabaseInitTick(t => t + 1)
        }).catch((err) => {
          console.warn('[App] Supabase full init failed after critical restore:', err)
        })
      }).catch((err) => {
        console.error('[App] Supabase critical init failed:', err)
        clearTimeout(initTimeout)
        // Even on init failure, install the provider so writes still hit
        // Supabase via REST. Cache will be empty, but writes can still succeed.
        installProvider()
        setCloudRestoreSettled(true)
      })
      // Auto-retry init() when network comes back. Without this, an offline boot
      // leaves the user in a degraded state until they manually refresh.
      const handleOnline = () => {
        if (provider.hasInitSucceeded()) return
        provider.init().then(() => {
          setSupabaseInitTick(t => t + 1)
          setCloudRestoreSettled(true)
        }).catch(() => { /* still failing - wait for next online event */ })
      }
      window.addEventListener('online', handleOnline)
      return () => {
        cancelled = true
        window.removeEventListener('online', handleOnline)
        clearTimeout(initTimeout)
        supabaseProviderRef.current?.unsubscribe()
      }
    }

    localFirstFromCacheRef.current = false
    // Clean up previous subscription.
    if (supabaseProviderRef.current) {
      supabaseProviderRef.current.unsubscribe()
    }
    setStorageProvider(localStorageProvider)
    supabaseProviderRef.current = null
    // A recently signed-in reader can be offline while Supabase restores its
    // session. Their local mirror remains their library, including cached
    // Feed/Cast/chat content; do not demote it to anonymous storage.
    setAnonymousMode(!likelyAuthenticated)
    setCloudRestoreSettled(true)
    // One-time wipe migration. Devices that accumulated data from before this
    // rule shipped need a clean slate. Flag prevents repeated wipes.
    try {
      if (!likelyAuthenticated && !localStorage.getItem('tinct:wipe-v1-done')) {
        clearLocalUserData()
        localStorage.setItem('tinct:wipe-v1-done', '1')
      }
    } catch { /* ignore */ }
    setStorageReady(true)
    return () => {
      supabaseProviderRef.current?.unsubscribe()
    }
  }, [user, authLoading, likelyAuthenticated])

  return {
    storageReady,
    cloudRestoreSettled,
    setCloudRestoreSettled,
    supabaseInitTick,
    supabaseProviderRef,
    localFirstFromCacheRef,
  }
}
