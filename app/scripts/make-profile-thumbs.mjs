// Small background scenes for the profile step (onboarding v3, 2 Nov 2026): the 100-140 KB room images were slow
// to arrive on a phone. Pictures use the existing disc crops (scripts/build-avatar-crops.mjs).
//   node scripts/make-profile-thumbs.mjs
// Writes public/lab/library_2/assets/profile/scene-<set>.jpg: a 720 x 300 banner, also the 78 x 54 thumbnail.
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const assets = path.join(here, '../public/lab/library_2/assets')
const out = path.join(assets, 'profile')
fs.mkdirSync(out, { recursive: true })
// The picture sets (src/social/profileRules.ts PICTURE_SETS) and the room each one's scene comes from.
const SETS = { stoic: 'meditations', 'at-sea': 'odyssey', florence: 'the-prince', petersburg: 'crime-and-punishment', longbourn: 'pride-and-prejudice' }
for (const [id, book] of Object.entries(SETS)) {
  const file = path.join(out, `scene-${id}.jpg`)
  await sharp(path.join(assets, `room-${book}-phone.jpg`)).resize(720, 300, { fit: 'cover', position: 'centre' }).jpeg({ quality: 70, mozjpeg: true }).toFile(file)
  console.log(path.basename(file), fs.statSync(file).size)
}
