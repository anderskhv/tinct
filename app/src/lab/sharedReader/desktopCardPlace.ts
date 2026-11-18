export type CardBox = { left: number; right: number; top: number; bottom: number }
/** Keep the selected ink clear; a card owns only the free space beside, above, or below it. */
export function desktopCardPlace(passage: CardBox, frame: CardBox, preferredWidth = 380) {
  const gap = 18
  const width = Math.min(preferredWidth, frame.right - frame.left)
  const right = frame.right - passage.right - gap
  const left = passage.left - frame.left - gap
  if (Math.max(right, left) >= Math.min(width, 280)) {
    const onRight = right >= left
    const w = Math.min(width, onRight ? right : left)
    return { left: onRight ? passage.right + gap : passage.left - gap - w,
      top: Math.max(frame.top, Math.min(frame.bottom - 160, passage.top - 10)), width: w,
      maxHeight: frame.bottom - Math.max(frame.top, Math.min(frame.bottom - 160, passage.top - 10)) }
  }
  const above = Math.max(0, passage.top - frame.top - gap)
  const below = Math.max(0, frame.bottom - passage.bottom - gap)
  const after = below >= above
  const maxHeight = Math.max(0, after ? below : above)
  // A selection can fill both leaves and the viewport. Keep the answer usable,
  // while leaving the upper half of that passage visible above a floating card.
  if (maxHeight < 180) {
    const height = Math.min(360, (frame.bottom - frame.top) * .55)
    return { left: frame.right - width, top: frame.bottom - height, width, maxHeight: height }
  }
  return { left: Math.max(frame.left, Math.min(frame.right - width, passage.left)),
    top: after ? passage.bottom + gap : frame.top, width, maxHeight }
}
