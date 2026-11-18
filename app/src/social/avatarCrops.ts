/**
 * Painted pictures at the size their disc is drawn (21 Oct 2026). A picture set
 * or a cover detail is a part of a whole painting (0.5-0.75 MB, or a 30-90 KB
 * 480 px copy) drawn at `260% auto`; scripts/build-avatar-crops.mjs cuts that
 * part once as small square WebPs (2-4 KB for a row, about 10 KB for a hero),
 * named by their content so browsers keep them for a year. A picture with no
 * crop (a stored photo, an initial, a painting added since) is drawn as before.
 */
import { AVATAR_CROPS } from './avatarCrops.generated'

/** `s`: a row's 36 px disc (120 px crop); `l`: a hero's 76 px disc (240 px crop). */
export type AvatarCropSize = 's' | 'l'

function cropFor(src: string | null | undefined, pos: string | null | undefined): { s: string; l: string } | null {
  if (!src || !pos) return null
  return AVATAR_CROPS[`${src} ${pos.trim().replace(/\s+/g, ' ')}`] ?? null
}

/** Whether this painting at this position has a cut crop. */
export function hasAvatarCrop(src: string | null | undefined, pos: string | null | undefined): boolean {
  return cropFor(src, pos) !== null
}

/**
 * The picture drawn from its crop (`cover: false` fills the disc with the
 * square, centred), or unchanged when it has none. Stored photos are never
 * touched: they are the reader's own file, loaded with their token.
 */
export function croppedPicture<T extends { src: string | null; pos: string; cover: boolean; private?: boolean }>(picture: T, size: AvatarCropSize): T {
  if (!picture.cover || picture.private) return picture
  const crop = cropFor(picture.src, picture.pos)
  return crop ? { ...picture, src: crop[size], pos: '50% 50%', cover: false } : picture
}
