import { existsSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AVATAR_CROPS } from './avatarCrops.generated'
import { croppedPicture, hasAvatarCrop } from './avatarCrops'
import { COVER_BOOK_IDS, PICTURE_SETS, pictureView } from './profileRules'
import { avatarCrop } from '../cards/avatarCache'
import { staticCacheControl } from '../worker/lib/staticCache'
import { AVATAR_CROP_SIZES, cropKey, discCrop, paintedPictures } from '../../scripts/build-avatar-crops.mjs'

const publicDir = resolve(process.cwd(), 'public')
const sharp = createRequire(import.meta.url)('sharp') as (file: string) => { metadata: () => Promise<{ width?: number; height?: number; format?: string }> }

/** Every painted picture a profile can have, as the Worker draws it (profileRules.pictureView). */
function everyPaintedPicture() {
  const views = [
    ...PICTURE_SETS.map(set => pictureView('set', set.id, 'Reader')),
    ...COVER_BOOK_IDS.map(id => pictureView('cover', id, 'Reader')),
  ]
  return views.map(view => {
    if (view.kind !== 'image') throw new Error('a painted picture drew as an initial')
    return view
  })
}

describe('avatar crops: every painted picture has its disc-sized crop', () => {
  it('the table names a row and a hero crop for every picture set and cover, and the files are there at those sizes', async () => {
    const views = everyPaintedPicture()
    for (const view of views) {
      expect(hasAvatarCrop(view.src, view.pos), `${view.src} ${view.pos}`).toBe(true)
      const crop = AVATAR_CROPS[`${view.src} ${view.pos}`]
      for (const [size, src] of [[AVATAR_CROP_SIZES[0], crop.s], [AVATAR_CROP_SIZES[1], crop.l]] as const) {
        const file = resolve(publicDir, src.slice(1))
        expect(existsSync(file), file).toBe(true)
        const meta = await sharp(file).metadata()
        expect(meta.format).toBe('webp')
        expect([meta.width, meta.height]).toEqual([size, size])
      }
    }
    // The script reads the same lists, and leaves nothing behind that the table does not name.
    expect(paintedPictures().map(item => cropKey(item.id, item.pos)).sort()).toEqual(Object.keys(AVATAR_CROPS).sort())
    const named = new Set(Object.values(AVATAR_CROPS).flatMap(crop => [crop.s, crop.l]).map(src => src.split('/').pop()))
    for (const file of readdirSync(resolve(publicDir, 'lab/library_2/assets/avatars'))) expect(named.has(file), file).toBe(true)
  })

  it('cuts the part the disc shows: the same crop as the header capture (avatarCrop)', () => {
    for (const [width, height] of [[1024, 1536], [768, 1152], [480, 720]]) {
      for (const view of everyPaintedPicture()) {
        expect(discCrop(view.pos, width, height)).toEqual(avatarCrop({ ...view, cover: true }, width, height))
      }
    }
  })

  it('a painted picture is drawn from its crop, centred and filling the disc; a photo or an unknown painting as it was', () => {
    const set = { src: '/lab/library_2/assets/meditations.jpg', pos: '50% 34%', cover: true, private: false, initial: 'A' }
    const row = croppedPicture(set, 's')
    expect(row).toEqual({ ...set, src: AVATAR_CROPS['/lab/library_2/assets/meditations.jpg 50% 34%'].s, pos: '50% 50%', cover: false })
    expect(croppedPicture(set, 'l').src).toBe(AVATAR_CROPS['/lab/library_2/assets/meditations.jpg 50% 34%'].l)
    const photo = { src: '/api/profile/image?user=u&slot=picture&v=1', pos: '50% 50%', cover: false, private: true, initial: 'A' }
    expect(croppedPicture(photo, 's')).toBe(photo)
    const elsewhere = { ...set, pos: '10% 10%' }
    expect(croppedPicture(elsewhere, 's')).toBe(elsewhere)
  })

  it('browsers keep a crop for a year: its name changes with its content', () => {
    const src = AVATAR_CROPS['/lab/library_2/assets/meditations.jpg 50% 34%'].s
    expect(staticCacheControl(new URL(`https://example.test${src}`), 200, 'image/webp')).toBe('public, max-age=31536000, immutable')
    // The paintings themselves keep their day.
    expect(staticCacheControl(new URL('https://example.test/lab/library_2/assets/meditations.jpg'), 200, 'image/jpeg')).toBe('public, max-age=86400, stale-while-revalidate=604800')
    expect(staticCacheControl(new URL('https://example.test/lab/library_2/assets/avatars/meditations.webp'), 200, 'image/webp')).toBe('public, max-age=86400, stale-while-revalidate=604800')
  })
})
