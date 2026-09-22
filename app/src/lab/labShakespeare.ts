/** Physical phones only. iPad can use phone chrome in portrait or Split View. */
export function isShakespearePhone(input = {
  userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
  maxTouchPoints: typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints,
  screenWidth: typeof screen === 'undefined' ? 0 : screen.width,
  screenHeight: typeof screen === 'undefined' ? 0 : screen.height,
}): boolean {
  if (/iPad/i.test(input.userAgent) || (/Macintosh/i.test(input.userAgent) && input.maxTouchPoints > 1)) return false
  if (/iPhone|iPod|Android.+Mobile/i.test(input.userAgent)) return true
  return input.maxTouchPoints > 0 && Math.min(input.screenWidth, input.screenHeight) > 0
    && Math.min(input.screenWidth, input.screenHeight) < 600
}
