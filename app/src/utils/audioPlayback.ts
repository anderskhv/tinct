import { isNativeCapacitor } from './nativePlatform'

type AudioTransitionEvent = 'initial-rejection' | 'retry' | 'retry-rejection'

/** Android's native WebView needs an explicit load after src changes. Web
 * browsers already load when src is assigned; forcing load there can abort the
 * media pipeline that just ended and turn a continuous paragraph transition
 * into a rejected play. */
export function shouldForceAudioLoad(): boolean {
  if (!isNativeCapacitor()) return false
  const cap = (window as { Capacitor?: { getPlatform?: () => string } }).Capacitor
  return cap?.getPlatform?.() === 'android'
}

export function setAudioSource(audio: HTMLAudioElement, url: string): void {
  audio.src = url
  if (shouldForceAudioLoad()) {
    try { audio.load() } catch { /* older WebViews may throw */ }
  }
}

/** Retry a source transition once when the media element becomes ready.
 * Explicit pause/source changes invalidate the retry through shouldContinue. */
export async function playAudioTransition(
  audio: HTMLAudioElement,
  expectedSrc: string,
  shouldContinue: () => boolean,
  onEvent?: (event: AudioTransitionEvent, error?: unknown) => void,
  retryDelayMs = 1500,
): Promise<boolean> {
  if (!shouldContinue() || audio.src !== expectedSrc) return false
  try {
    await audio.play()
    return true
  } catch (error) {
    onEvent?.('initial-rejection', error)
  }

  if (!shouldContinue() || audio.src !== expectedSrc) return false

  await new Promise<void>(resolve => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      globalThis.clearTimeout(timer)
      audio.removeEventListener('canplay', finish)
      audio.removeEventListener('loadeddata', finish)
      resolve()
    }
    const timer = globalThis.setTimeout(finish, retryDelayMs)
    audio.addEventListener('canplay', finish, { once: true })
    audio.addEventListener('loadeddata', finish, { once: true })
  })

  if (!shouldContinue() || audio.src !== expectedSrc) return false
  onEvent?.('retry')
  try {
    await audio.play()
    return true
  } catch (error) {
    onEvent?.('retry-rejection', error)
    return false
  }
}
