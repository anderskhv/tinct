/**
 * Free reading mode's two AI rows in the t menu, "Summarize this chapter" and "Catch me up" (freeMode.ts; Anders,
 * 27 Nov 2026), on the device's free AI actions: the same counter as Explain and Ask (labAccountPrompt.ts
 * LAB_FREE_AI_ACTIONS).
 *
 * - A card that is made is one action, counted before anything is sent.
 * - Once the actions are used, the row opens the account sheet and nothing is sent or counted.
 * - A card this page already made, or a summary this device already holds, opens again without being counted:
 *   nothing is asked for.
 */
import { gateLabAiAction, type LabPromptStorage } from '../labAccountPrompt'

export type FreeModeAiRowOutcome = 'open' | 'account'

/** One chapter's card of one kind, in one edition: what a counted action made. */
export function freeModeAiRowKey(kind: string, place: { bookId: string; editionKey: string; chapterNumber: number }): string {
  return `${kind}:${place.bookId}:${place.editionKey}:${place.chapterNumber}`
}

/**
 * A press of one of the rows. `made` is this page's memory of the cards it counted (the caller keeps it for the
 * life of the page); `held` says the device already holds the answer, so nothing will be asked for.
 */
export function pressFreeModeAiRow(input: { key: string; made: Set<string>; held?: boolean; storage?: LabPromptStorage | null }): FreeModeAiRowOutcome {
  if (input.held || input.made.has(input.key)) return 'open'
  const decision = gateLabAiAction({ signedIn: false, ...(input.storage !== undefined ? { storage: input.storage } : {}) })
  if (!decision.allowed) return 'account'
  input.made.add(input.key)
  return 'open'
}
