// Types for chat-thread.js (the reader chat thread shared by the book reader and the PDF reader).
export const QUOTE_LIMIT: number
export const COMPOSER_LINES: number
export const PRESS_HOLD_MS: number
export const PRESS_FADE_MS: number
export const HINT_TEXT: string
export const HINT_SESSION_KEY: string
export const ICONS: Record<'close' | 'copy' | 'copied' | 'mic' | 'stop' | 'talk' | 'send' | 'down' | 'collapse' | 'attach', string>
export interface ThreadTurnShape { role: 'user' | 'assistant'; at?: number | null; place?: string | null }
export type ThreadRow = { type: 'divider'; key: string; label: string } | { type: 'turn'; key: string; index: number }
export function cutQuote(text: string | null | undefined): string
export function dayLabel(at: number | null | undefined, now?: number): string
export function timeLabel(at: number | null | undefined, now?: number): string
export function dividerLabel(place: string | null | undefined, at: number | null | undefined, now?: number): string
export function threadRows(turns: ThreadTurnShape[], options?: { now?: number }): ThreadRow[]
export function keptCopyIndex(turns: Array<{ role: 'user' | 'assistant' }>, streaming?: boolean): number
export function lastQuestion<T extends { role: 'user' | 'assistant' }>(turns: T[], textOf?: (turn: T) => string): string
export type ComposerAction = 'send' | 'recall' | 'close' | null
export function composerKey(
  event: { key: string; shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean; altKey?: boolean; isComposing?: boolean },
  options?: { phone?: boolean; empty?: boolean },
): ComposerAction
export function fitComposer(field: HTMLTextAreaElement, lines?: number): number
export function takeHint(storage: Pick<Storage, 'getItem' | 'setItem'> | null | undefined): boolean
export function contentEnd(node: Pick<HTMLElement, 'scrollHeight'> & { querySelector?: HTMLElement['querySelector'] }): number
export function isAway(node: Pick<HTMLElement, 'scrollHeight' | 'scrollTop' | 'clientHeight'> & { querySelector?: HTMLElement['querySelector'] }): boolean
export function scrollToLatest(node: HTMLElement): void
export function bindPress(thread: HTMLElement, options?: { holdMs?: number; fadeMs?: number }): () => void
export interface ThreadHtmlTurn extends ThreadTurnShape { text: string; html?: string; quote?: string | null; note?: string | null; extra?: string }
export function threadHtml(turns: ThreadHtmlTurn[], options?: { now?: number; streaming?: boolean }): string
