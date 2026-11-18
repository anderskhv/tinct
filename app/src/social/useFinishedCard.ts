/**
 * Social ship 3's reading card at the end of a book: "Finished {book} ·
 * {hours}", drawn by the Worker, shared with the system share sheet (or saved
 * as an image where there is none). It carries the reader's public profile
 * link, else the book's. Undefined (nothing offered) while SOCIAL_FRIENDS is
 * off, for a reader's own book, or signed out.
 */
import { useCallback, useState } from 'react'
import { readSupabaseAccessToken } from '../lab/labAuth'
import { trackFunnel } from '../utils/funnel'
import { finishedCard, shareOrCopy, socialFriendsOn } from './friendsClient'

export function useFinishedCard(input: { bookId: string; title: string; signedIn: boolean; privateBook: boolean }): { label: string; busy: boolean; note: string; onShare: () => void } | undefined {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const { bookId, title, signedIn, privateBook } = input
  const onShare = useCallback(async () => {
    setBusy(true)
    setNote('')
    try {
      const token = await readSupabaseAccessToken()
      const card = token ? await finishedCard(token, bookId) : null
      if (!card) { setNote('The card could not be made just now. Please try again.'); return }
      const file = new File([card.blob], `finished-${bookId}.png`, { type: 'image/png' })
      const result = await shareOrCopy({ url: card.link, text: card.line, file })
      if (result === 'shared' || result === 'saved') trackFunnel('reading_card_shared', { book_id: bookId, kind: 'finished', result })
      setNote(result === 'saved' ? 'Your card is saved as an image, and its link is copied.' : result === 'failed' ? 'Sharing is not available here.' : '')
    } finally {
      setBusy(false)
    }
  }, [bookId])
  if (!signedIn || privateBook || !bookId || !socialFriendsOn()) return undefined
  return { label: `Share: Finished ${title}`, busy, note, onShare: () => { void onShare() } }
}
