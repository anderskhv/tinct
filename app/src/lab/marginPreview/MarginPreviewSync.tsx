/**
 * The margin view's account sync (Anders, 20 Oct 2026: margin view becomes the desktop's default way to read Tinct's
 * books, so it keeps what the book reader keeps). Mounted beside the frame once the book is loaded; renders nothing.
 * The frame (js/tinct-book.js) reaches it through `window.TinctMarginPreview.sync`.
 *
 * - The place: through the book reader's position path (useMarginPreviewPlace).
 */
import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import type { MarginPreviewBook } from './marginPreviewModel'
import { useMarginPreviewPlace, type MarginPlaceBridge } from './useMarginPreviewPlace'

export interface MarginPreviewSyncBridge {
  place: MarginPlaceBridge
}

export function MarginPreviewSync({ model, onBridge }: { model: MarginPreviewBook; onBridge: (bridge: MarginPreviewSyncBridge | null) => void }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const place = useMarginPreviewPlace(model, userId)
  useEffect(() => {
    onBridge({ place })
    return () => onBridge(null)
  }, [onBridge, place])
  return null
}
