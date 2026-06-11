import { useState, useEffect, useCallback, useRef } from 'react'
import type { Book } from '../types'
import { resolveAudioUrl } from '../utils/audioUrl'

interface DownloadState {
  bookId: string
  label: string
  percent: number
  downloading: boolean
}

interface OfflineBookInfo {
  bookId: string
  /** Which edition keys are cached */
  editions: string[]
  /** Which chapters have audio cached (by chapter number) */
  audioChapters: number[]
  /** Has threads data cached */
  hasThreads: boolean
}

const OFFLINE_META_KEY = 'tinct:offline-meta'
const OFFLINE_CACHE_NAME = 'tinct-offline-v3'
const CHAPTER_SHARDED_EDITIONS = new Set([
  'war-and-peace-original-en',
  'war-and-peace-modern-en',
  'war-and-peace-modern-da',
])

function loadOfflineMeta(): Record<string, OfflineBookInfo> {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_META_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveOfflineMeta(meta: Record<string, OfflineBookInfo>) {
  localStorage.setItem(OFFLINE_META_KEY, JSON.stringify(meta))
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineMeta, setOfflineMeta] = useState<Record<string, OfflineBookInfo>>(loadOfflineMeta)
  const [downloadState, setDownloadState] = useState<DownloadState | null>(null)
  const [storageMB, setStorageMB] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  // Online/offline detection
  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed — offline mode won't intercept fetches
        // but direct Cache API usage in download still works
      })
    }
  }, [])

  // Check storage size on mount and after downloads
  const refreshStorageSize = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      setStorageMB(Math.round((estimate.usage || 0) / (1024 * 1024)))
    }
  }, [])

  useEffect(() => { refreshStorageSize() }, [refreshStorageSize])

  // Cache a single URL
  const cacheUrl = useCallback(async (url: string, abort?: AbortSignal): Promise<boolean> => {
    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME)
      const existing = await cache.match(url)
      if (existing) return true
      const response = await fetch(url, { signal: abort })
      if (response.ok) {
        await cache.put(url, response)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  // Download a book's edition data (JSON + threads)
  const downloadEditions = useCallback(async (book: Book, abort?: AbortSignal): Promise<string[]> => {
    const cached: string[] = []
    for (const edition of book.editions) {
      const editionId = `${book.id}-${edition.key}`
      if (CHAPTER_SHARDED_EDITIONS.has(editionId)) {
        const manifestUrl = `/data/editions-chapters/${editionId}/manifest.json`
        if (await cacheUrl(manifestUrl, abort)) {
          try {
            const manifestRes = await fetch(manifestUrl, { signal: abort })
            const manifest = await manifestRes.json() as { chapters?: { path: string }[] }
            for (const ch of manifest.chapters || []) {
              if (abort?.aborted) return cached
              await cacheUrl(`/data/editions-chapters/${editionId}/${ch.path}`, abort)
            }
            cached.push(edition.key)
            continue
          } catch {
            // Fall through to whole-book JSON. Existing files remain available.
          }
        }
      }
      const url = `/data/editions/${editionId}.json`
      if (await cacheUrl(url, abort)) cached.push(edition.key)
    }
    // Threads
    await cacheUrl(`/data/editions/${book.id}-threads.json`, abort)
    return cached
  }, [cacheUrl])

  // Download audio for a specific chapter
  const downloadChapterAudio = useCallback(async (
    bookId: string,
    editionKey: string,
    chapter: number,
    abort?: AbortSignal,
  ): Promise<boolean> => {
    const manifestUrl = resolveAudioUrl(`${bookId}/${editionKey}/ch${chapter}/manifest.json`, 'manifest')
    try {
      // Fetch and cache manifest
      const manifestRes = await fetch(manifestUrl, { signal: abort })
      if (!manifestRes.ok) return false
      const manifest = await manifestRes.json() as { paragraphs: { file: string }[] }
      const cache = await caches.open(OFFLINE_CACHE_NAME)
      await cache.put(manifestUrl, new Response(JSON.stringify(manifest), {
        headers: { 'Content-Type': 'application/json' },
      }))

      // Cache each paragraph audio file
      for (const para of manifest.paragraphs) {
        if (abort?.aborted) return false
        const audioUrl = resolveAudioUrl(`${bookId}/${editionKey}/ch${chapter}/${para.file}`)
        await cacheUrl(audioUrl, abort)
      }
      return true
    } catch {
      return false
    }
  }, [cacheUrl])

  // Download a full book (editions + audio for all chapters)
  const downloadBook = useCallback(async (book: Book) => {
    if (downloadState?.downloading) return

    const abort = new AbortController()
    abortRef.current = abort

    setDownloadState({ bookId: book.id, label: 'Downloading editions...', percent: 0, downloading: true })

    // Step 1: Download all editions + threads
    const editions = await downloadEditions(book, abort.signal)
    if (abort.signal.aborted) { setDownloadState(null); return }

    // Step 2: Download audio for each chapter of each audio edition
    const audioEditions = book.editions.filter(ed => ed.hasAudio)
    const audioChapters: number[] = []

    if (audioEditions.length > 0) {
      // Need to know chapter count — load first edition to check
      const firstEdition = editions[0] || book.editions[0]?.key
      if (firstEdition) {
        try {
          const editionRes = await fetch(`/data/editions/${book.id}-${firstEdition}.json`, { signal: abort.signal })
          const editionData = await editionRes.json() as { chapters: { number: number }[] }
          const totalChapters = editionData.chapters.length
          let completed = 0
          const totalAudioTasks = totalChapters * audioEditions.length

          for (const edition of audioEditions) {
            for (let ch = 1; ch <= totalChapters; ch++) {
              if (abort.signal.aborted) { setDownloadState(null); return }
              setDownloadState({
                bookId: book.id,
                label: `Audio: ${edition.label} ch${ch}/${totalChapters}`,
                percent: Math.round((completed / totalAudioTasks) * 100),
                downloading: true,
              })
              const ok = await downloadChapterAudio(book.id, edition.key, ch, abort.signal)
              if (ok && !audioChapters.includes(ch)) audioChapters.push(ch)
              completed++
            }
          }
        } catch {
          // Audio download failed — editions still cached
        }
      }
    }

    // Save metadata
    const meta = loadOfflineMeta()
    meta[book.id] = {
      bookId: book.id,
      editions,
      audioChapters: audioChapters.sort((a, b) => a - b),
      hasThreads: true,
    }
    saveOfflineMeta(meta)
    setOfflineMeta({ ...meta })
    setDownloadState(null)
    refreshStorageSize()
  }, [downloadState, downloadEditions, downloadChapterAudio, refreshStorageSize])

  // Download a specific chapter's audio only
  const downloadChapter = useCallback(async (book: Book, chapter: number) => {
    if (downloadState?.downloading) return

    const abort = new AbortController()
    abortRef.current = abort

    setDownloadState({ bookId: book.id, label: `Downloading chapter ${chapter} audio...`, percent: 0, downloading: true })

    const audioEditions = book.editions.filter(ed => ed.hasAudio)
    let completed = 0

    for (const edition of audioEditions) {
      if (abort.signal.aborted) { setDownloadState(null); return }
      setDownloadState({
        bookId: book.id,
        label: `Audio: ${edition.label} ch${chapter}`,
        percent: Math.round((completed / audioEditions.length) * 100),
        downloading: true,
      })
      await downloadChapterAudio(book.id, edition.key, chapter, abort.signal)
      completed++
    }

    // Update metadata
    const meta = loadOfflineMeta()
    const existing = meta[book.id] || { bookId: book.id, editions: [], audioChapters: [], hasThreads: false }
    if (!existing.audioChapters.includes(chapter)) {
      existing.audioChapters = [...existing.audioChapters, chapter].sort((a, b) => a - b)
    }
    meta[book.id] = existing
    saveOfflineMeta(meta)
    setOfflineMeta({ ...meta })
    setDownloadState(null)
    refreshStorageSize()
  }, [downloadState, downloadChapterAudio, refreshStorageSize])

  // Remove all cached data for a book
  const removeDownload = useCallback(async (bookId: string) => {
    const cache = await caches.open(OFFLINE_CACHE_NAME)
    const keys = await cache.keys()
    await Promise.all(
      keys.filter(req => {
        const url = req.url
        return url.includes(`${bookId}-`) || url.includes(`/${bookId}/`)
      }).map(req => cache.delete(req))
    )

    const meta = loadOfflineMeta()
    delete meta[bookId]
    saveOfflineMeta(meta)
    setOfflineMeta({ ...meta })
    refreshStorageSize()
  }, [refreshStorageSize])

  // Cancel active download
  const cancelDownload = useCallback(() => {
    abortRef.current?.abort()
    setDownloadState(null)
  }, [])

  // Check if a book is downloaded
  const isBookDownloaded = useCallback((bookId: string): boolean => {
    return !!offlineMeta[bookId]?.editions.length
  }, [offlineMeta])

  // Check if a specific chapter's audio is cached
  const isChapterAudioCached = useCallback((bookId: string, chapter: number): boolean => {
    return offlineMeta[bookId]?.audioChapters.includes(chapter) || false
  }, [offlineMeta])

  return {
    isOnline,
    offlineMeta,
    downloadState,
    storageMB,
    downloadBook,
    downloadChapter,
    removeDownload,
    cancelDownload,
    isBookDownloaded,
    isChapterAudioCached,
  }
}
