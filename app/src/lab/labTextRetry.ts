/**
 * The chapter text is the one thing the reader cannot open without. A connection that drops for a moment as it is
 * asked for (a phone between masts, WebKit failing a fetch once) failed the chapter window, its whole-book fallback
 * and that fallback's one retry within the same second, and the edition then stayed "temporarily unavailable" for
 * good, though the network was back (the deploy acceptance of 21 Oct 2026, WebKit on a phone). The same load is
 * tried again after 1, 2 and 4 s, unless the reader moved on or the error can never pass (an unknown book or
 * edition, a chapter that is not there).
 */
export const LAB_TEXT_RETRY_MS = [1000, 2000, 4000] as const

const PERMANENT = /^(Unknown published book|Unknown edition|Invalid (compare|audio) edition|Edition \S+ has no readable chapter)/

export async function withTextRetries<T>(
  load: () => Promise<T>,
  stillWanted: () => boolean,
  wait: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await load()
    } catch (error) {
      if (attempt >= LAB_TEXT_RETRY_MS.length || !stillWanted() || PERMANENT.test(String((error as Error)?.message ?? ''))) throw error
      await wait(LAB_TEXT_RETRY_MS[attempt])
      if (!stillWanted()) throw error
    }
  }
}
