// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ACCOUNT_SELECTION_ACTIONS_FIELD,
  SELECTION_ACTIONS_USED_EVENT,
  SELECTION_ACTIONS_USED_KEY,
  isSelectionActionKind,
  localSelectionActionsEvidence,
  markSelectionActionsUsed,
  mergeSelectionActionsUsed,
  pushSelectionActionsUsed,
  readAccountSelectionActions,
  readAccountSelectionActionsUsed,
  readSelectionActionsUsed,
  selectionActionsState,
} from './labSelectionActions'

afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })

describe('the flag merge on sign-in: true wins (the simple first page, 16 Nov 2026)', () => {
  it('used on either side, or in the account’s history, is used on both', () => {
    expect(mergeSelectionActionsUsed({ local: false, account: false })).toEqual({ used: false, writeLocal: false, push: false })
    expect(mergeSelectionActionsUsed({ local: true, account: false })).toEqual({ used: true, writeLocal: false, push: true })
    expect(mergeSelectionActionsUsed({ local: false, account: true })).toEqual({ used: true, writeLocal: true, push: false })
    expect(mergeSelectionActionsUsed({ local: true, account: true })).toEqual({ used: true, writeLocal: false, push: false })
    // A reader from before the flag: their saved chats are use.
    expect(mergeSelectionActionsUsed({ local: false, account: false, evidence: true })).toEqual({ used: true, writeLocal: true, push: true })
  })

  it('reads the account’s field only when it is exactly true', () => {
    expect(readAccountSelectionActionsUsed({ [ACCOUNT_SELECTION_ACTIONS_FIELD]: true })).toBe(true)
    expect(readAccountSelectionActionsUsed({ [ACCOUNT_SELECTION_ACTIONS_FIELD]: 'true' })).toBe(false)
    expect(readAccountSelectionActionsUsed({})).toBe(false)
    expect(readAccountSelectionActionsUsed(null)).toBe(false)
  })
})

describe('the first-visit state', () => {
  it('signed out: this device alone', () => {
    expect(selectionActionsState({ localUsed: false, signedIn: false, authPending: false, account: 'loading' })).toBe('new')
    expect(selectionActionsState({ localUsed: true, signedIn: false, authPending: false, account: 'loading' })).toBe('used')
  })

  it('signed in: never the hint until the account has answered, and never on a failed read', () => {
    expect(selectionActionsState({ localUsed: false, signedIn: false, authPending: true, account: 'loading' })).toBe('unknown')
    expect(selectionActionsState({ localUsed: false, signedIn: true, authPending: false, account: 'loading' })).toBe('unknown')
    expect(selectionActionsState({ localUsed: false, signedIn: true, authPending: false, account: 'failed' })).toBe('used')
    expect(selectionActionsState({ localUsed: false, signedIn: true, authPending: false, account: 'new' })).toBe('new')
    expect(selectionActionsState({ localUsed: false, signedIn: true, authPending: false, account: 'used' })).toBe('used')
    // This device already knows: no wait.
    expect(selectionActionsState({ localUsed: true, signedIn: true, authPending: false, account: 'loading' })).toBe('used')
  })

  it('Ask, Explain and Simplify count; Define, Quiz me and the chapter cards do not', () => {
    expect(['ask', 'explain', 'simplify'].every(isSelectionActionKind)).toBe(true)
    expect(['define', 'quiz', 'primer', 'recap', 'catchup', 'note', undefined].some(isSelectionActionKind)).toBe(false)
  })
})

describe('this device', () => {
  it('marks once, with one event, and keeps it', () => {
    const heard = vi.fn()
    window.addEventListener(SELECTION_ACTIONS_USED_EVENT, heard)
    expect(readSelectionActionsUsed()).toBe(false)
    expect(markSelectionActionsUsed()).toBe(true)
    expect(markSelectionActionsUsed()).toBe(false)
    expect(localStorage.getItem(SELECTION_ACTIONS_USED_KEY)).toBe('1')
    expect(heard).toHaveBeenCalledTimes(1)
    window.removeEventListener(SELECTION_ACTIONS_USED_EVENT, heard)
  })

  it('treats what a returning reader already has as use', () => {
    expect(localSelectionActionsEvidence()).toBe(false)
    localStorage.setItem('tinct:chat-history:frankenstein', '[]')
    localStorage.setItem('tinct:lab-ai-actions', '0')
    expect(localSelectionActionsEvidence()).toBe(false)
    localStorage.setItem('tinct:chat-history:frankenstein', JSON.stringify([{ id: 'c1', messages: [] }]))
    expect(localSelectionActionsEvidence()).toBe(true)
    localStorage.clear()
    localStorage.setItem('tinct:lab-ai-actions', '2')
    expect(localSelectionActionsEvidence()).toBe(true)
    localStorage.clear()
    localStorage.setItem('tinct:explanations', JSON.stringify({ 'a/1/0/x': { answer: 'y' } }))
    expect(localSelectionActionsEvidence()).toBe(true)
    localStorage.clear()
    localStorage.setItem('tinct-addbook:text-cards-canonical:owner:abc', JSON.stringify({ conversations: [{ id: 'c' }] }))
    expect(localSelectionActionsEvidence()).toBe(true)
  })
})

/** A user_data table the way supabase-js reaches it: select … eq … maybeSingle, and commit_user_data with a rev. */
function fakeAccount(initial: { value: Record<string, unknown> | null; rev: number } | null, opts: { conflictOnce?: boolean; chatKeys?: string[] } = {}) {
  let row = initial
  let conflict = !!opts.conflictOnce
  const commits: Array<Record<string, unknown>> = []
  const chain = (result: () => unknown) => {
    const q: Record<string, unknown> = {}
    for (const name of ['select', 'eq', 'like']) q[name] = () => q
    q.maybeSingle = async () => ({ data: result(), error: null })
    q.limit = async () => ({ data: (opts.chatKeys ?? []).map(key => ({ key })), error: null })
    return q
  }
  const client = {
    from: () => chain(() => row),
    rpc: async (_name: string, args: { p_value: Record<string, unknown>; p_expected_rev: number | null }) => {
      commits.push(args.p_value)
      if (conflict) { conflict = false; row = { value: { ...(row?.value ?? {}), voicePersona: 'male' }, rev: (row?.rev ?? 0) + 1 }; return { data: { applied: false, conflict: true }, error: null } }
      if ((row?.rev ?? null) !== args.p_expected_rev) return { data: { applied: false, conflict: true }, error: null }
      row = { value: args.p_value, rev: (row?.rev ?? 0) + 1 }
      return { data: { applied: true, conflict: false }, error: null }
    },
  }
  return { client: client as never, commits, row: () => row }
}

describe('the account’s preferences row', () => {
  it('adds the flag and keeps every other preference', async () => {
    const account = fakeAccount({ value: { aiSettings: { at: 1 }, voicePersona: 'female' }, rev: 3 })
    await pushSelectionActionsUsed('u1', account.client)
    expect(account.row()?.value).toEqual({ aiSettings: { at: 1 }, voicePersona: 'female', [ACCOUNT_SELECTION_ACTIONS_FIELD]: true })
  })

  it('writes nothing when the account already has it', async () => {
    const account = fakeAccount({ value: { [ACCOUNT_SELECTION_ACTIONS_FIELD]: true }, rev: 1 })
    await pushSelectionActionsUsed('u1', account.client)
    expect(account.commits).toHaveLength(0)
  })

  it('a write that loses to another device reads again and keeps that device’s change', async () => {
    const account = fakeAccount({ value: { voicePersona: 'female' }, rev: 1 }, { conflictOnce: true })
    await pushSelectionActionsUsed('u1', account.client)
    expect(account.row()?.value).toEqual({ voicePersona: 'male', [ACCOUNT_SELECTION_ACTIONS_FIELD]: true })
  })

  it('reads the flag and the history', async () => {
    expect(await readAccountSelectionActions('u1', fakeAccount({ value: {}, rev: 1 }).client)).toEqual({ account: false, evidence: false })
    expect(await readAccountSelectionActions('u1', fakeAccount({ value: {}, rev: 1 }, { chatKeys: ['chat-history:frankenstein:1'] }).client)).toEqual({ account: false, evidence: true })
    expect(await readAccountSelectionActions('u1', fakeAccount({ value: { [ACCOUNT_SELECTION_ACTIONS_FIELD]: true }, rev: 1 }).client)).toEqual({ account: true, evidence: false })
  })
})
