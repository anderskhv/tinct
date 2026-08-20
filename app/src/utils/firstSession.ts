/** Account/Premium pitching waits until the reader has actually started. */
export function shouldPitchFirstSessionAccount(args: {
  showStore: boolean
  showOnboarding: boolean
  chapterNumber: number
  currentPage: number
}): boolean {
  if (args.showStore || args.showOnboarding) return false
  if (args.chapterNumber <= 1 && args.currentPage < 1) return false
  return true
}
