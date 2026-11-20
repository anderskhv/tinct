import { useSyncExternalStore, type ReactNode } from 'react'

/**
 * The composer draft (a card's "Ask a follow-up" field, the chat field, a quiz answer), kept outside LabApp's state.
 *
 * Typing into a margin card's follow-up field was slow (Anders, 12 Nov 2026, Luke 9): the draft lived in LabApp's
 * state, so every keystroke re-rendered the whole reader, its passage and every card. Now LabApp only writes the
 * draft (`set`) and reads it when it acts (`get`); the fields subscribe (`WithDraft`), so a keystroke renders the
 * fields alone.
 */
export interface DraftStore {
  get: () => string
  set: (value: string) => void
  subscribe: (listener: () => void) => () => void
}

export function createDraftStore(initial = ''): DraftStore {
  let value = initial
  const listeners = new Set<() => void>()
  return {
    get: () => value,
    set: next => {
      if (next === value) return
      value = next
      listeners.forEach(listener => listener())
    },
    subscribe: listener => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
}

export function useDraft(store: DraftStore): string {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

/** Renders `children` with the current draft, and again (alone) whenever it changes. */
export function WithDraft({ store, children }: { store: DraftStore; children: (draft: string) => ReactNode }) {
  return <>{children(useDraft(store))}</>
}
