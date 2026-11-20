import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { LAB_AI_ACTIONS_KEY } from './labAccountPrompt'
import { EXPLANATIONS_STORAGE_KEY } from './labChapterNotes'

/**
 * Whether this reader has used the selection actions (Ask, Explain or Simplify on a passage) at least once
 * (Anders, 16 Nov 2026: the simple first page). Until they have, the reader shows one line on how to use them
 * instead of the start actions: the desktop margin's hint, the phone's line under the first chapter heading.
 *
 * Set after the first successful Ask, Explain or Simplify, and never unset. Kept on this device
 * (`tinct:selection-actions-used`, wiped with the reader's other data on sign-out) and, signed in, in the account's
 * existing `preferences` row (user_data) as `selectionActionsUsed: true`, beside the AI settings and reading angles
 * (labAiAccount.ts). The two merge on sign-in and true wins. No schema change and nothing new leaves the device: the
 * flag rides in the preferences sync that already exists.
 *
 * Readers from before the flag are never shown the first visit: what they already have counts as use (a saved chat
 * or card for any book, on this device or in the account; an anonymous AI action counted on this device; a kept
 * explanation; an own book's cards).
 */
export const SELECTION_ACTIONS_USED_KEY = 'tinct:selection-actions-used'
export const SELECTION_ACTIONS_USED_EVENT = 'tinct:selection-actions-used'
/** The account's `preferences` field. */
export const ACCOUNT_SELECTION_ACTIONS_FIELD = 'selectionActionsUsed'

/** 'unknown' while a signed-in reader's account is still being read: show neither the hint nor anything that could flash. */
export type SelectionActionsState = 'unknown' | 'new' | 'used'

/** The selection actions that count as use. Define, Quiz me, Primer and the rest do not. */
export function isSelectionActionKind(kind: string | null | undefined): boolean {
  return kind === 'ask' || kind === 'explain' || kind === 'simplify'
}

function local(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}

export function readSelectionActionsUsed(storage: Storage | null = local()): boolean {
  try { return storage?.getItem(SELECTION_ACTIONS_USED_KEY) === '1' } catch { return false }
}

/** Record use on this device (the account follows through useSelectionActions). Returns whether it was new. */
export function markSelectionActionsUsed(storage: Storage | null = local()): boolean {
  if (readSelectionActionsUsed(storage)) return false
  try { storage?.setItem(SELECTION_ACTIONS_USED_KEY, '1') } catch { /* private mode: this page still knows */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(SELECTION_ACTIONS_USED_EVENT))
  return true
}

const nonEmpty = (raw: string | null): boolean => {
  if (!raw) return false
  // A long history is not empty; it need not be parsed to know.
  if (raw.length > 4096) return true
  try {
    const value = JSON.parse(raw) as unknown
    if (Array.isArray(value)) return value.length > 0
    if (value && typeof value === 'object') {
      const conversations = (value as { conversations?: unknown }).conversations
      return Array.isArray(conversations) ? conversations.length > 0 : Object.keys(value).length > 0
    }
    return false
  } catch { return false }
}

/**
 * What this device already holds that shows the reader has used the AI on a passage: the flag itself, an anonymous
 * AI action counted here, a kept explanation, a saved chat or card for any book (the chat-history mirror, an own
 * book's cards, an own PDF's cards).
 */
export function localSelectionActionsEvidence(storage: Storage | null = local()): boolean {
  if (!storage) return false
  try {
    if (readSelectionActionsUsed(storage)) return true
    const counted = Number(storage.getItem(LAB_AI_ACTIONS_KEY))
    if (Number.isFinite(counted) && counted > 0) return true
    if (nonEmpty(storage.getItem(EXPLANATIONS_STORAGE_KEY))) return true
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (!key) continue
      if (key.startsWith('tinct:chat-history:') || key.startsWith('tinct-addbook:text-cards-canonical:') || key.startsWith('tinct-addbook:cards:')) {
        if (nonEmpty(storage.getItem(key))) return true
      }
    }
  } catch { /* storage unavailable: no evidence */ }
  return false
}

/** The account's side, from its `preferences` value. */
export function readAccountSelectionActionsUsed(value: unknown): boolean {
  return !!value && typeof value === 'object' && (value as Record<string, unknown>)[ACCOUNT_SELECTION_ACTIONS_FIELD] === true
}

/**
 * The merge on sign-in: true wins. `evidence` is the account's own history (any saved chat row). Returns whether the
 * reader has used the actions, whether this device should record it, and whether the account should.
 */
export function mergeSelectionActionsUsed(input: { local: boolean; account: boolean; evidence?: boolean }): { used: boolean; writeLocal: boolean; push: boolean } {
  const used = input.local || input.account || !!input.evidence
  return { used, writeLocal: used && !input.local, push: used && !input.account }
}

/** The first-visit state for a reader, given what is known now (pure; useSelectionActions feeds it). */
export function selectionActionsState(input: { localUsed: boolean; signedIn: boolean; authPending: boolean; account: 'loading' | 'used' | 'new' | 'failed' }): SelectionActionsState {
  if (input.localUsed) return 'used'
  if (input.authPending) return 'unknown'
  if (!input.signedIn) return 'new'
  if (input.account === 'loading') return 'unknown'
  // The account could not be read (offline): a returning reader must never be shown the first visit.
  if (input.account === 'failed') return 'used'
  return input.account
}

type Client = NonNullable<typeof supabase>
interface PreferencesRow { value: Record<string, unknown> | null; rev: number | null; applied?: boolean | null; conflict?: boolean | null }

/** Write `selectionActionsUsed: true` into the account's preferences row, keeping every other field. */
export async function pushSelectionActionsUsed(userId: string, client: Client | null = supabase): Promise<void> {
  if (!client) return
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data, error: readError } = await client.from('user_data').select('value,rev').eq('user_id', userId).eq('key', 'preferences').maybeSingle()
    if (readError) return
    const current = (data || {}) as PreferencesRow
    const value = current.value && typeof current.value === 'object' ? current.value : {}
    if (readAccountSelectionActionsUsed(value)) return
    const { data: committed, error } = await client.rpc('commit_user_data', {
      p_user_id: userId,
      p_key: 'preferences',
      p_value: { ...value, [ACCOUNT_SELECTION_ACTIONS_FIELD]: true },
      p_expected_rev: typeof current.rev === 'number' ? current.rev : null,
    })
    if (error) return
    const row = (Array.isArray(committed) ? committed[0] : committed) as PreferencesRow | null
    if (row && row.applied !== false && row.conflict !== true) return
  }
}

/** The account's flag and its history: any saved chat row (`chat-history:…`) is use from before the flag existed. */
export async function readAccountSelectionActions(userId: string, client: Client | null = supabase): Promise<{ account: boolean; evidence: boolean }> {
  if (!client) throw new Error('no account')
  const [prefs, history] = await Promise.all([
    client.from('user_data').select('value').eq('user_id', userId).eq('key', 'preferences').maybeSingle(),
    client.from('user_data').select('key').eq('user_id', userId).like('key', 'chat-history:%').limit(1),
  ])
  if (prefs.error && history.error) throw new Error('account unavailable')
  const account = readAccountSelectionActionsUsed((prefs.data as { value?: unknown } | null)?.value)
  const evidence = Array.isArray(history.data) && history.data.length > 0
  return { account, evidence }
}

const ACCOUNT_READ_TIMEOUT_MS = 6000

/**
 * The reader's first-visit state. Signed out: this device alone. Signed in: this device, then the account (its flag
 * and its history); until the account answers, 'unknown'. Once the reader uses an action anywhere on this page, 'used'
 * at once, and the account is told.
 */
export function useSelectionActions(userId: string | null, authPending: boolean): SelectionActionsState {
  const [localUsed, setLocalUsed] = useState(() => localSelectionActionsEvidence())
  const [account, setAccount] = useState<{ userId: string; state: 'used' | 'new' | 'failed' } | null>(null)
  useEffect(() => {
    const sync = () => setLocalUsed(localSelectionActionsEvidence())
    window.addEventListener(SELECTION_ACTIONS_USED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener(SELECTION_ACTIONS_USED_EVENT, sync); window.removeEventListener('storage', sync) }
  }, [])
  // Another account's data was wiped or adopted on sign-in or sign-out: read this device again.
  useEffect(() => { setLocalUsed(localSelectionActionsEvidence()) }, [userId])
  useEffect(() => {
    if (!userId || !supabase) return
    let cancelled = false
    // One write per signed-in reader and page: the merge and a first use on this page can both ask for it.
    let pushed = false
    const push = () => { if (pushed) return; pushed = true; void pushSelectionActionsUsed(userId).catch(() => { pushed = false }) }
    const timer = window.setTimeout(() => { if (!cancelled) setAccount(current => current?.userId === userId ? current : { userId, state: 'failed' }) }, ACCOUNT_READ_TIMEOUT_MS)
    void readAccountSelectionActions(userId).then(remote => {
      if (cancelled) return
      const merged = mergeSelectionActionsUsed({ local: localSelectionActionsEvidence(), account: remote.account, evidence: remote.evidence })
      if (merged.push) push()
      if (merged.writeLocal) markSelectionActionsUsed()
      setAccount({ userId, state: merged.used ? 'used' : 'new' })
    }, () => { if (!cancelled) setAccount({ userId, state: 'failed' }) }).finally(() => window.clearTimeout(timer))
    // A first use on this page while signed in goes to the account too.
    const onUse = () => push()
    window.addEventListener(SELECTION_ACTIONS_USED_EVENT, onUse)
    return () => { cancelled = true; window.clearTimeout(timer); window.removeEventListener(SELECTION_ACTIONS_USED_EVENT, onUse) }
  }, [userId])
  return selectionActionsState({
    localUsed,
    signedIn: !!userId,
    authPending,
    account: userId && account?.userId === userId ? account.state : 'loading',
  })
}
